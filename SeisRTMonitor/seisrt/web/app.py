from __future__ import annotations

import asyncio
import json
import logging
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from seisrt.web.seedlink_stream import SeedLinkConfig, SeedLinkWebSession, download_fdsn_packet
from seisrt.web.station_catalog import DEFAULT_NETWORKS, fetch_station_inventory, find_station
from seisrt.services.monitor_manager import MonitorManager

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
PROCESS_POOL = ProcessPoolExecutor(max_workers=2)
MONITOR_MANAGER = MonitorManager()

app = FastAPI(title="SeisRTMonitor Web", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.on_event("startup")
async def startup() -> None:
    MONITOR_MANAGER.set_loop(asyncio.get_running_loop())


@app.on_event("shutdown")
async def shutdown() -> None:
    MONITOR_MANAGER.stop_all()


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/monitors")
async def create_monitor(config: dict) -> dict:
    return {"monitor": MONITOR_MANAGER.create(config)}


@app.get("/api/monitors")
async def list_monitors() -> dict:
    return {"monitors": MONITOR_MANAGER.list()}


@app.delete("/api/monitors/{monitor_id}")
async def delete_monitor(monitor_id: str) -> dict:
    if not MONITOR_MANAGER.delete(monitor_id):
        raise HTTPException(status_code=404, detail="monitor not found")
    return {"ok": True}


@app.patch("/api/monitors/{monitor_id}")
async def update_monitor(monitor_id: str, config: dict) -> dict:
    info = MONITOR_MANAGER.update(monitor_id, config)
    if info is None:
        raise HTTPException(status_code=404, detail="monitor not found")
    return {"monitor": info}


@app.get("/api/monitors/{monitor_id}/snapshot")
async def monitor_snapshot(monitor_id: str) -> dict:
    task = MONITOR_MANAGER.get(monitor_id)
    if task is None:
        raise HTTPException(status_code=404, detail="monitor not found")
    packet = task.buffer.snapshot()
    packet["monitor_id"] = monitor_id
    return packet


@app.post("/api/monitors/{monitor_id}/backfill")
async def monitor_backfill(monitor_id: str, request: dict) -> dict:
    task = MONITOR_MANAGER.get(monitor_id)
    if task is None:
        raise HTTPException(status_code=404, detail="monitor not found")
    start_ts = float(request["start"])
    end_ts = float(request["end"])
    if end_ts <= start_ts:
        raise HTTPException(status_code=400, detail="invalid backfill range")

    loop = asyncio.get_running_loop()
    packet = await loop.run_in_executor(
        PROCESS_POOL,
        download_fdsn_packet,
        task.config.to_worker_dict(),
        start_ts,
        end_ts,
        "backfill",
    )
    task.ingest_backfill_packet(packet)
    return {"ok": True, "packet": {k: v for k, v in packet.items() if k != "data"}}


@app.get("/api/events")
async def api_events() -> dict:
    return {"events": MONITOR_MANAGER.events}


@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str) -> dict:
    if not MONITOR_MANAGER.delete_event(event_id):
        raise HTTPException(status_code=404, detail="event not found")
    return {"ok": True}


@app.delete("/api/events")
async def clear_events() -> dict:
    return {"ok": True, "removed": MONITOR_MANAGER.clear_events()}


def parse_config(config_data: dict) -> SeedLinkConfig:
    return SeedLinkConfig(
        server=config_data.get("server", "rtserve.iris.washington.edu"),
        network=config_data.get("network", "IU"),
        station=config_data.get("station", "TATO"),
        location=config_data.get("location", "00"),
        channel=config_data.get("channel", "BHZ"),
        window_seconds=int(float(config_data.get("window_seconds", 300))),
        playback_delay_seconds=int(float(config_data.get("playback_delay_seconds", 300))),
    )



@app.get("/api/stations")
async def api_stations(networks: str = DEFAULT_NETWORKS, force: bool = False) -> dict:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(PROCESS_POOL, fetch_station_inventory, networks, force)


@app.get("/api/station_options")
async def api_station_options(network: str, station: str, networks: str = DEFAULT_NETWORKS) -> dict:
    loop = asyncio.get_running_loop()
    sta = await loop.run_in_executor(PROCESS_POOL, find_station, network, station, networks)
    return {"station": sta}


@app.websocket("/ws/monitors")
async def monitors_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    queue = MONITOR_MANAGER.subscribe()
    try:
        await websocket.send_text(json.dumps({"type": "monitors", "monitors": MONITOR_MANAGER.list()}, ensure_ascii=False))
        for event in MONITOR_MANAGER.events[:50]:
            await websocket.send_text(json.dumps(event, ensure_ascii=False))
        while True:
            payload = await queue.get()
            await websocket.send_text(json.dumps(payload, ensure_ascii=False))
    except WebSocketDisconnect:
        pass
    finally:
        MONITOR_MANAGER.unsubscribe(queue)

@app.websocket("/ws/seedlink")
async def seedlink_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    session: SeedLinkWebSession | None = None
    sender_task: asyncio.Task | None = None
    backfill_tasks: set[asyncio.Task] = set()
    current_config: SeedLinkConfig | None = None

    async def sender() -> None:
        assert session is not None
        while True:
            payload = await session.queue.get()
            await websocket.send_text(json.dumps(payload, ensure_ascii=False))

    async def run_backfill(config: SeedLinkConfig, start_ts: float, end_ts: float) -> None:
        await websocket.send_json({
            "type": "status",
            "level": "ok",
            "message": f"Backfill requested: {start_ts:.1f} → {end_ts:.1f}",
        })
        loop = asyncio.get_running_loop()
        try:
            packet = await loop.run_in_executor(
                PROCESS_POOL,
                download_fdsn_packet,
                config.to_worker_dict(),
                start_ts,
                end_ts,
                "backfill",
            )
            await websocket.send_text(json.dumps(packet, ensure_ascii=False))
            await websocket.send_json({
                "type": "status",
                "level": "ok",
                "message": f"Backfill loaded: {packet['id']} · {packet['npts']} points",
            })
        except Exception as exc:
            logger.exception("Backfill failed")
            await websocket.send_json({"type": "status", "level": "error", "message": f"Backfill failed: {exc}"})

    try:
        while True:
            message = await websocket.receive_json()
            command = message.get("command")
            if command == "start":
                if session is not None:
                    session.stop()
                    if sender_task is not None:
                        sender_task.cancel()
                for task in list(backfill_tasks):
                    task.cancel()
                backfill_tasks.clear()

                current_config = parse_config(message.get("config", {}))
                session = SeedLinkWebSession(current_config, asyncio.get_running_loop())
                session.start()
                sender_task = asyncio.create_task(sender())
            elif command == "backfill":
                if current_config is None:
                    await websocket.send_json({"type": "status", "level": "error", "message": "No active stream"})
                    continue
                start_ts = float(message["start"])
                end_ts = float(message["end"])
                if end_ts <= start_ts:
                    continue
                task = asyncio.create_task(run_backfill(current_config, start_ts, end_ts))
                backfill_tasks.add(task)
                task.add_done_callback(backfill_tasks.discard)
            elif command == "stop":
                if session is not None:
                    session.stop()
                    session = None
                if sender_task is not None:
                    sender_task.cancel()
                    sender_task = None
                for task in list(backfill_tasks):
                    task.cancel()
                backfill_tasks.clear()
                await websocket.send_json({"type": "status", "level": "muted", "message": "Stopped"})
            else:
                await websocket.send_json({"type": "status", "level": "error", "message": f"Unknown command: {command}"})
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.exception("WebSocket error")
        try:
            await websocket.send_json({"type": "status", "level": "error", "message": str(exc)})
        except Exception:
            pass
    finally:
        if sender_task is not None:
            sender_task.cancel()
        for task in list(backfill_tasks):
            task.cancel()
        if session is not None:
            session.stop()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    uvicorn.run("seisrt.web.app:app", host="127.0.0.1", port=8765, reload=False)


if __name__ == "__main__":
    main()

