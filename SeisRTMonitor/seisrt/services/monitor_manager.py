from __future__ import annotations

import asyncio
import logging
import threading
import time
import uuid
from dataclasses import asdict, dataclass
from typing import Any

from obspy import UTCDateTime
from obspy.clients.seedlink.easyseedlink import create_client

from seisrt.services.detector import DetectionConfig, StaLtaDetector
from seisrt.services.event_store import EventStore
from seisrt.web.seedlink_stream import SeedLinkConfig, download_fdsn_packet, trace_to_packet

logger = logging.getLogger(__name__)


@dataclass
class MonitorCreate:
    server: str = "rtserve.iris.washington.edu"
    network: str = "IU"
    station: str = "ANMO"
    location: str = "00"
    channel: str = "BHZ"
    window_seconds: int = 300
    playback_delay_seconds: int = 300
    buffer_seconds: int = 3600
    trigger_threshold: float = 4.0


class WaveformTimeBuffer:
    def __init__(self, keep_seconds: int = 3600) -> None:
        self.keep_seconds = int(keep_seconds)
        self.samples: list[dict[str, float]] = []
        self.lock = threading.RLock()
        self.sampling_rate: float | None = None
        self.trace_id = ""

    def append_packet(self, packet: dict[str, Any]) -> None:
        delta = float(packet.get("delta") or 1 / float(packet.get("sampling_rate") or 20))
        start = float(packet["starttime"])
        values = packet.get("data") or []
        incoming = [{"t": start + i * delta, "y": float(y)} for i, y in enumerate(values)]
        with self.lock:
            if packet.get("type") == "history":
                self.samples = []
            self.samples.extend(incoming)
            self.samples.sort(key=lambda p: p["t"])
            merged: list[dict[str, float]] = []
            last_t: float | None = None
            for p in self.samples:
                if last_t is None or abs(p["t"] - last_t) > 1e-4:
                    merged.append(p)
                    last_t = p["t"]
                else:
                    merged[-1] = p
            if merged:
                cutoff = merged[-1]["t"] - self.keep_seconds
                first = 0
                while first < len(merged) and merged[first]["t"] < cutoff:
                    first += 1
                merged = merged[first:]
            self.samples = merged
            self.sampling_rate = float(packet.get("sampling_rate") or self.sampling_rate or 0) or None
            self.trace_id = str(packet.get("id") or self.trace_id)

    def snapshot(self, max_points: int = 80000) -> dict[str, Any]:
        with self.lock:
            samples = list(self.samples)
            sr = self.sampling_rate
            trace_id = self.trace_id
        if not samples:
            return {"type": "snapshot", "id": trace_id, "sampling_rate": sr, "npts": 0, "data": []}
        step = max(1, int(len(samples) / max_points))
        reduced = samples[::step]
        return {
            "type": "snapshot",
            "id": trace_id,
            "starttime": reduced[0]["t"],
            "endtime": reduced[-1]["t"],
            "sampling_rate": (float(sr) / step) if sr else None,
            "delta": (1 / float(sr) * step) if sr else None,
            "npts": len(reduced),
            "data": [p["y"] for p in reduced],
        }

    def segment(self, start: float, end: float) -> list[dict[str, float]]:
        with self.lock:
            return [p for p in self.samples if start <= p["t"] <= end]

    def recent(self) -> list[dict[str, float]]:
        with self.lock:
            return list(self.samples)

    def until(self, end_time: float) -> list[dict[str, float]]:
        with self.lock:
            return [p for p in self.samples if p["t"] <= end_time]

    def latest_time(self) -> float | None:
        with self.lock:
            return self.samples[-1]["t"] if self.samples else None

    def count(self) -> int:
        with self.lock:
            return len(self.samples)


class StationTask:
    def __init__(self, monitor_id: str, create: MonitorCreate, manager: "MonitorManager") -> None:
        self.id = monitor_id
        self.create = create
        self.config = SeedLinkConfig(
            server=create.server,
            network=create.network,
            station=create.station,
            location=create.location,
            channel=create.channel,
            window_seconds=create.window_seconds,
            playback_delay_seconds=create.playback_delay_seconds,
        )
        self.manager = manager
        self.buffer = WaveformTimeBuffer(create.buffer_seconds)
        self.detector = StaLtaDetector(DetectionConfig(trigger_threshold=create.trigger_threshold))
        self.status = "starting"
        self.created_at = time.time()
        self.last_packet_at: float | None = None
        self._client = None
        self._seedlink_thread: threading.Thread | None = None
        self._history_thread: threading.Thread | None = None
        self._running = threading.Event()
        self._last_saved_event_time: float | None = None
        self._event_lock = threading.RLock()
        self._saved_event_buckets: set[int] = set()

    @property
    def key(self) -> str:
        sid = self.config.stream_id
        return f"{sid.network}.{sid.station}.{sid.location}.{sid.channel}"

    def info(self) -> dict[str, Any]:
        snap = self.buffer.snapshot(max_points=1)
        return {
            "id": self.id,
            "key": self.key,
            "config": asdict(self.config),
            "detector": {
                "enabled": self.detector.config.enabled,
                "trigger_threshold": self.detector.config.trigger_threshold,
                "cooldown_seconds": self.detector.config.cooldown_seconds,
            },
            "status": self.status,
            "created_at": self.created_at,
            "last_packet_at": self.last_packet_at,
            "samples": self.buffer.count(),
        }

    def update_detector(self, trigger_threshold: float | None = None, enabled: bool | None = None) -> None:
        threshold_changed = False
        if trigger_threshold is not None:
            new_threshold = float(trigger_threshold)
            threshold_changed = abs(new_threshold - self.detector.config.trigger_threshold) > 1e-12
            self.create.trigger_threshold = new_threshold
            self.detector.config.trigger_threshold = new_threshold
            if threshold_changed:
                # Lowering the threshold is often done during testing; allow a
                # new decision immediately, but exact event-time duplicates are
                # still suppressed in _detect_and_emit().
                self.detector.last_event_wall_time = 0.0
        if enabled is not None:
            self.detector.config.enabled = bool(enabled)
        self._emit_status(
            "ok",
            f"Detector updated: STA/LTA threshold={self.detector.config.trigger_threshold:g}",
        )
        if threshold_changed:
            self._detect_and_emit(self.buffer.trace_id or self.key)

    def start(self) -> None:
        if self._seedlink_thread and self._seedlink_thread.is_alive():
            return
        self._running.set()
        self._history_thread = threading.Thread(target=self._download_initial_history, name=f"History-{self.id}", daemon=True)
        self._history_thread.start()
        sid = self.config.stream_id
        self._client = create_client(
            self.config.server,
            on_data=self._on_trace,
            on_seedlink_error=lambda: self._emit_status("error", "SeedLink server returned ERROR"),
            on_terminate=lambda: self._emit_status("muted", "SeedLink terminated"),
        )
        self._client.select_stream(sid.network, sid.station, sid.seedlink_selector)
        self._seedlink_thread = threading.Thread(target=self._run_seedlink, name=f"SeedLink-{self.id}", daemon=True)
        self._seedlink_thread.start()
        self._emit_status("ok", f"Connected: {self.config.server} / {self.key}")

    def stop(self) -> None:
        self.status = "stopped"
        self._running.clear()
        if self._client is not None:
            try:
                self._client.conn.terminate()
                self._client.conn.disconnect()
            except Exception as exc:
                logger.warning("SeedLink shutdown error: %s", exc)
        if self._seedlink_thread is not None:
            self._seedlink_thread.join(timeout=3)
        self._emit_status("muted", f"Stopped {self.key}")

    def _run_seedlink(self) -> None:
        try:
            self.status = "running"
            if self._client is not None:
                self._client.run()
        except Exception as exc:
            self.status = "error"
            logger.exception("SeedLink failed for %s", self.key)
            self._emit_status("error", str(exc))
        finally:
            self._running.clear()

    def _download_initial_history(self) -> None:
        end = UTCDateTime() - 5
        preload_seconds = max(10, self.config.window_seconds + self.config.playback_delay_seconds + 30)
        start = end - preload_seconds
        try:
            packet = download_fdsn_packet(self.config.to_worker_dict(), start.timestamp, end.timestamp, "history")
            self._handle_packet(packet)
            self._emit_status("ok", f"History loaded: {packet['id']} · {packet['npts']} points")
        except Exception as exc:
            logger.exception("History preload failed for %s", self.key)
            self._emit_status("error", f"History preload failed: {exc}")

    def _on_trace(self, trace) -> None:
        packet = trace_to_packet(trace, packet_type="trace", max_points=self.config.max_points_per_packet)
        self._handle_packet(packet)

    def _handle_packet(self, packet: dict[str, Any]) -> None:
        packet["monitor_id"] = self.id
        self.buffer.append_packet(packet)
        self.last_packet_at = time.time()
        self.manager.broadcast(packet)
        if packet.get("type") in ("trace", "history", "backfill"):
            self._detect_and_emit(packet.get("id", self.key))

    def ingest_backfill_packet(self, packet: dict[str, Any]) -> None:
        packet["type"] = "backfill"
        self._handle_packet(packet)

    def _detect_and_emit(self, trace_id: str) -> None:
        # Detection is a backend monitoring task and should run on the latest
        # received samples, independent of the frontend playback delay.
        samples = self.buffer.recent()
        event = self.detector.detect(samples, trace_id)
        if event:
            bucket = int(round(float(event["time"])))
            with self._event_lock:
                if bucket in self._saved_event_buckets:
                    return
                if self._last_saved_event_time is not None and abs(event["time"] - self._last_saved_event_time) < 1.0:
                    return
                self._saved_event_buckets.add(bucket)
                # Keep the set bounded for long-running sessions.
                if len(self._saved_event_buckets) > 1000:
                    self._saved_event_buckets = set(sorted(self._saved_event_buckets)[-500:])
                self._last_saved_event_time = float(event["time"])
            event["monitor_id"] = self.id
            event["id"] = f"{self.id}_{bucket}"
            event["pre_event_seconds"] = 60
            event["post_event_seconds"] = 180
            event["status"] = "saved-initial"
            segment = self.buffer.segment(event["time"] - 60, event["time"] + 180)
            saved = self.manager.event_store.save_event(event, segment)
            self.manager.events.insert(0, saved)
            self.manager.deduplicate_events()
            self.manager.broadcast(saved)
            threading.Timer(180, self._finalize_event_segment, args=(saved,)).start()

    def _visible_detection_samples(self) -> list[dict[str, float]]:
        """Return samples up to the same delayed right edge used by the UI.

        This avoids reporting events that are still outside the currently
        displayed delayed playback window.
        """
        latest = self.buffer.latest_time()
        if latest is None:
            return []
        delay = float(self.config.playback_delay_seconds or 0)
        safety = 1.5
        cutoff = min(time.time() - delay, latest - safety)
        return self.buffer.until(cutoff)

    def _finalize_event_segment(self, event: dict[str, Any]) -> None:
        try:
            final_event = dict(event)
            final_event["status"] = "saved-final"
            segment = self.buffer.segment(final_event["time"] - 60, final_event["time"] + 180)
            saved = self.manager.event_store.save_event(final_event, segment)
            with self.manager.lock:
                for i, old in enumerate(self.manager.events):
                    if old.get("id") == saved.get("id"):
                        self.manager.events[i] = saved
                        break
                else:
                    self.manager.events.insert(0, saved)
                self.manager.deduplicate_events()
            self.manager.broadcast(saved)
        except Exception:
            logger.exception("Failed to finalize event segment for %s", self.key)

    def _emit_status(self, level: str, message: str) -> None:
        self.status = "running" if level == "ok" else "error" if level == "error" else self.status
        self.manager.broadcast({"type": "status", "monitor_id": self.id, "level": level, "message": message})


class MonitorManager:
    def __init__(self) -> None:
        self.tasks: dict[str, StationTask] = {}
        self.subscribers: set[asyncio.Queue] = set()
        self.lock = threading.RLock()
        self.loop: asyncio.AbstractEventLoop | None = None
        self.event_store = EventStore()
        self.events = self.event_store.list_events()
        self.deduplicate_events()

    def set_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self.loop = loop

    def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        create = MonitorCreate(**{k: v for k, v in payload.items() if k in MonitorCreate.__annotations__})
        with self.lock:
            for task in self.tasks.values():
                if task.key == f"{create.network}.{create.station}.{create.location}.{create.channel}" and task.create.server == create.server:
                    task.update_detector(trigger_threshold=create.trigger_threshold)
                    return task.info()
            monitor_id = uuid.uuid4().hex[:12]
            task = StationTask(monitor_id, create, self)
            self.tasks[monitor_id] = task
        task.start()
        self.broadcast({"type": "monitor_added", "monitor": task.info()})
        return task.info()

    def list(self) -> list[dict[str, Any]]:
        with self.lock:
            return [task.info() for task in self.tasks.values()]

    def get(self, monitor_id: str) -> StationTask | None:
        with self.lock:
            return self.tasks.get(monitor_id)

    def delete(self, monitor_id: str) -> bool:
        with self.lock:
            task = self.tasks.pop(monitor_id, None)
        if task is None:
            return False
        task.stop()
        self.broadcast({"type": "monitor_removed", "monitor_id": monitor_id})
        return True

    def update(self, monitor_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        task = self.get(monitor_id)
        if task is None:
            return None
        if "trigger_threshold" in payload:
            task.update_detector(trigger_threshold=float(payload["trigger_threshold"]))
        return task.info()

    def delete_event(self, event_id: str) -> bool:
        removed_disk = self.event_store.delete_event(event_id)
        with self.lock:
            before = len(self.events)
            self.events[:] = [e for e in self.events if str(e.get("id")) != str(event_id)]
            removed_mem = len(self.events) != before
        if removed_disk or removed_mem:
            self.broadcast({"type": "event_deleted", "id": event_id})
            return True
        return False

    def clear_events(self) -> int:
        removed = self.event_store.clear_events()
        with self.lock:
            removed = max(removed, len(self.events))
            self.events.clear()
        for task in self.tasks.values():
            task._saved_event_buckets.clear()
            task._last_saved_event_time = None
        self.broadcast({"type": "events_cleared"})
        return removed

    def deduplicate_events(self) -> None:
        with self.lock:
            unique: dict[str, dict[str, Any]] = {}
            for event in self.events:
                key = str(event.get("id") or f"{event.get('monitor_id')}:{event.get('station')}:{round(float(event.get('time', 0)))}")
                previous = unique.get(key)
                if previous is None or event.get("status") == "saved-final":
                    unique[key] = event
            self.events[:] = sorted(unique.values(), key=lambda e: float(e.get("time", 0)), reverse=True)[:100]

    def stop_all(self) -> None:
        for mid in list(self.tasks):
            self.delete(mid)

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=512)
        self.subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self.subscribers.discard(q)

    def broadcast(self, payload: dict[str, Any]) -> None:
        if self.loop is None:
            return

        def put() -> None:
            for q in list(self.subscribers):
                if q.full():
                    try:
                        q.get_nowait()
                    except asyncio.QueueEmpty:
                        pass
                q.put_nowait(payload)

        self.loop.call_soon_threadsafe(put)
