from __future__ import annotations

import json
import re
import shutil
import uuid
from pathlib import Path
from typing import Any

import numpy as np


class EventStore:
    """保存事件记录和触发附近波形片段。"""

    def __init__(self, base_dir: Path | None = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parents[2] / "data" / "events"
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_event(self, event: dict[str, Any], samples: list[dict[str, float]]) -> dict[str, Any]:
        safe_station = re.sub(r"[^A-Za-z0-9_.-]+", "_", str(event.get("station") or event.get("trace_id") or "unknown"))
        stamp = np.datetime64(int(float(event["time"])), "s").astype(object).strftime("%Y%m%d_%H%M%S")
        event_id = str(event.get("id") or f"{stamp}_{safe_station.replace('.', '_')}_{uuid.uuid4().hex[:6]}")
        event_dir = self.base_dir / event_id
        event_dir.mkdir(parents=True, exist_ok=True)

        enriched = dict(event)
        enriched["id"] = event_id
        enriched["event_dir"] = str(event_dir)
        enriched["waveform_file"] = "waveform.npy"

        (event_dir / "event.json").write_text(
            json.dumps(enriched, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        arr = np.asarray([[p["t"], p["y"]] for p in samples], dtype=np.float64)
        np.save(event_dir / "waveform.npy", arr)
        return enriched

    def list_events(self, limit: int = 100) -> list[dict[str, Any]]:
        records: list[dict[str, Any]] = []
        for path in sorted(self.base_dir.glob("*/event.json"), reverse=True):
            try:
                records.append(json.loads(path.read_text(encoding="utf-8")))
            except Exception:
                continue
            if len(records) >= limit:
                break
        return records

    def delete_event(self, event_id: str) -> bool:
        removed = False
        for path in self.base_dir.glob("*/event.json"):
            try:
                event = json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                continue
            if str(event.get("id")) == str(event_id):
                shutil.rmtree(path.parent, ignore_errors=True)
                removed = True
        return removed

    def clear_events(self) -> int:
        count = 0
        for path in list(self.base_dir.iterdir()):
            if path.is_dir():
                shutil.rmtree(path, ignore_errors=True)
                count += 1
        return count
