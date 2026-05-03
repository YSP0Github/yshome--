from __future__ import annotations

import asyncio
import logging
import threading
from dataclasses import asdict, dataclass
from typing import Any

import numpy as np
from obspy import Stream, UTCDateTime
from obspy.clients.fdsn import Client as FDSNClient
from obspy.clients.seedlink.easyseedlink import create_client

from seisrt.core.models import StreamId

logger = logging.getLogger(__name__)


@dataclass
class SeedLinkConfig:
    server: str = "rtserve.iris.washington.edu"
    network: str = "IU"
    station: str = "TATO"
    location: str = "00"
    channel: str = "BHZ"
    window_seconds: int = 300
    playback_delay_seconds: int = 300
    max_points_per_packet: int = 1200
    max_history_points: int = 80000

    @property
    def stream_id(self) -> StreamId:
        return StreamId(self.network, self.station, self.location, self.channel)

    def to_worker_dict(self) -> dict[str, Any]:
        return asdict(self)


def choose_trace(stream: Stream, config: dict[str, Any]):
    for tr in stream:
        if (
            tr.stats.network == config["network"]
            and tr.stats.station == config["station"]
            and (config.get("location") in ("", "*") or tr.stats.location == config.get("location"))
            and tr.stats.channel == config["channel"]
        ):
            return tr
    return stream[0] if len(stream) else None


def trace_to_packet(trace, packet_type: str, max_points: int) -> dict[str, Any]:
    data = np.asarray(trace.data, dtype=np.float32)
    if data.size == 0:
        data = np.zeros(1, dtype=np.float32)
    step = max(1, int(np.ceil(data.size / max(1, max_points))))
    if step > 1:
        data = data[::step]
    stats = trace.stats
    return {
        "type": packet_type,
        "id": trace.id,
        "network": stats.network,
        "station": stats.station,
        "location": stats.location,
        "channel": stats.channel,
        "starttime": stats.starttime.timestamp,
        "endtime": stats.endtime.timestamp,
        "sampling_rate": float(stats.sampling_rate / step),
        "delta": float(stats.delta * step),
        "npts": int(data.size),
        "min": float(np.nanmin(data)),
        "max": float(np.nanmax(data)),
        "data": data.tolist(),
    }


def download_fdsn_packet(config: dict[str, Any], start_ts: float, end_ts: float, packet_type: str) -> dict[str, Any]:
    """Download historical waveform in a separate process.

    This function is intentionally top-level so ProcessPoolExecutor can pickle it.
    """
    start = UTCDateTime(start_ts)
    end = UTCDateTime(end_ts)
    client = FDSNClient("IRIS")
    stream = client.get_waveforms(
        config["network"],
        config["station"],
        config.get("location") or "*",
        config["channel"],
        start,
        end,
    )
    if not stream:
        raise RuntimeError("No FDSN data returned")
    stream.merge(method=1, fill_value="interpolate")
    trace = choose_trace(stream, config)
    if trace is None:
        raise RuntimeError("No matching trace returned")
    return trace_to_packet(trace, packet_type=packet_type, max_points=int(config.get("max_history_points", 80000)))


class SeedLinkWebSession:
    """SeedLink + initial FDSN backfill session."""

    def __init__(self, config: SeedLinkConfig, loop: asyncio.AbstractEventLoop) -> None:
        self.config = config
        self.loop = loop
        self.queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=256)
        self._client = None
        self._seedlink_thread: threading.Thread | None = None
        self._history_thread: threading.Thread | None = None
        self._running = threading.Event()

    def start(self) -> None:
        if self._seedlink_thread and self._seedlink_thread.is_alive():
            return
        sid = self.config.stream_id
        selector = sid.seedlink_selector
        self._running.set()

        self._history_thread = threading.Thread(
            target=self._download_initial_history,
            name=f"FDSNInitial-{sid.network}.{sid.station}.{selector}",
            daemon=True,
        )
        self._history_thread.start()

        self._client = create_client(
            self.config.server,
            on_data=self._on_trace,
            on_seedlink_error=self._on_seedlink_error,
            on_terminate=self._on_terminate,
        )
        self._client.select_stream(sid.network, sid.station, selector)
        self._seedlink_thread = threading.Thread(
            target=self._run_seedlink,
            name=f"SeedLinkWeb-{sid.network}.{sid.station}.{selector}",
            daemon=True,
        )
        self._seedlink_thread.start()
        self._emit({
            "type": "status",
            "level": "ok",
            "message": f"Connected: {self.config.server} / {sid.network}.{sid.station}.{selector}",
        })

    def stop(self) -> None:
        self._running.clear()
        if self._client is not None:
            try:
                self._client.conn.terminate()
                self._client.conn.disconnect()
            except Exception as exc:
                logger.warning("SeedLink shutdown error: %s", exc)
        if self._seedlink_thread is not None:
            self._seedlink_thread.join(timeout=3)
        self._emit({"type": "status", "level": "muted", "message": "Stopped"})

    def _run_seedlink(self) -> None:
        try:
            if self._client is not None:
                self._client.run()
        except Exception as exc:
            logger.exception("SeedLink run failed")
            self._emit({"type": "status", "level": "error", "message": str(exc)})
        finally:
            self._running.clear()

    def _download_initial_history(self) -> None:
        sid = self.config.stream_id
        end = UTCDateTime() - 5
        preload_seconds = max(10, self.config.window_seconds + self.config.playback_delay_seconds + 30)
        start = end - preload_seconds
        self._emit({
            "type": "status",
            "level": "ok",
            "message": f"Preloading {preload_seconds:.0f}s for {sid.network}.{sid.station}.{sid.location}.{sid.channel} "
                       f"{start.isoformat()} → {end.isoformat()}",
        })
        try:
            packet = download_fdsn_packet(self.config.to_worker_dict(), start.timestamp, end.timestamp, "history")
            self._emit(packet)
            self._emit({
                "type": "status",
                "level": "ok",
                "message": f"History loaded: {packet['id']} · {packet['npts']} points",
            })
        except Exception as exc:
            logger.exception("History preload failed")
            self._emit({"type": "status", "level": "error", "message": f"History preload failed: {exc}"})

    def _on_trace(self, trace) -> None:
        self._emit(trace_to_packet(trace, packet_type="trace", max_points=self.config.max_points_per_packet))

    def _on_seedlink_error(self) -> None:
        self._emit({"type": "status", "level": "error", "message": "SeedLink server returned ERROR"})

    def _on_terminate(self) -> None:
        self._emit({"type": "status", "level": "muted", "message": "SeedLink terminated"})

    def _emit(self, payload: dict[str, Any]) -> None:
        def put() -> None:
            if self.queue.full():
                try:
                    self.queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            self.queue.put_nowait(payload)

        self.loop.call_soon_threadsafe(put)
