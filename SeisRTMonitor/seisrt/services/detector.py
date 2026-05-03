from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import numpy as np


@dataclass
class DetectionConfig:
    enabled: bool = True
    trigger_threshold: float = 4.0
    cooldown_seconds: float = 60.0
    max_recent_points: int = 2400
    min_points: int = 200


class StaLtaDetector:
    """Single-station STA/LTA detector with a lightweight AIC onset picker.

    STA/LTA is used only to decide that a suspicious event exists. After that,
    an AIC picker searches the pre-trigger/trigger neighborhood for an onset
    time. The peak marker is stored separately.
    """

    def __init__(self, config: DetectionConfig | None = None) -> None:
        self.config = config or DetectionConfig()
        self.last_event_wall_time = 0.0

    def detect(self, samples: list[dict[str, float]], trace_id: str) -> dict[str, Any] | None:
        if not self.config.enabled:
            return None
        now = time.time()
        if now - self.last_event_wall_time < self.config.cooldown_seconds:
            return None
        if len(samples) < self.config.min_points:
            return None

        recent = samples[-min(len(samples), self.config.max_recent_points) :]
        raw_values = np.asarray([p["y"] for p in recent], dtype=np.float64)
        abs_values = np.abs(raw_values)
        if abs_values.size < self.config.min_points:
            return None

        nsta = max(10, int(abs_values.size * 0.08))
        nlta = max(nsta + 1, int(abs_values.size * 0.55))
        if abs_values.size < nlta:
            return None

        trigger_values = abs_values[-nsta:]
        trigger_samples = recent[-nsta:]
        sta = float(np.mean(trigger_values))
        lta_window = abs_values[-nlta:-nsta]
        lta = float(np.mean(lta_window)) if lta_window.size else 0.0
        ratio = sta / max(1e-9, lta)
        if ratio < self.config.trigger_threshold:
            return None

        self.last_event_wall_time = now
        peak_idx = int(np.argmax(trigger_values))
        peak = float(trigger_values[peak_idx])
        peak_time = float(trigger_samples[peak_idx]["t"])
        p_pick_time, p_pick_index = self._pick_onset_aic(recent, raw_values, nlta=nlta, nsta=nsta)
        pseudo_mag = max(0.0, float(np.log10(max(1.0, peak)) - 1.5))
        intensity = "I-II" if pseudo_mag < 3 else "III" if pseudo_mag < 4 else "IV-V" if pseudo_mag < 5 else "VI+"
        return {
            "type": "event",
            "trace_id": trace_id,
            "station": trace_id,
            "time": p_pick_time,
            "origin_time": p_pick_time,
            "trigger_start": float(trigger_samples[0]["t"]),
            "trigger_end": float(trigger_samples[-1]["t"]),
            "p_pick_time": p_pick_time,
            "p_pick_index": p_pick_index,
            "pick_method": "aic",
            "peak_time": peak_time,
            "ratio": ratio,
            "peak": peak,
            "magnitude": pseudo_mag,
            "intensity": intensity,
            "status": "detected",
        }

    @staticmethod
    def _pick_onset_aic(
        recent: list[dict[str, float]], raw_values: np.ndarray, nlta: int, nsta: int
    ) -> tuple[float, int]:
        """Pick an approximate onset with classic AIC variance split."""
        n = raw_values.size
        start = max(0, n - nlta)
        end = n
        window = raw_values[start:end]
        if window.size < 20:
            pick_idx = max(0, n - nsta)
            return float(recent[pick_idx]["t"]), pick_idx

        eps = np.finfo(float).eps
        aic = np.full(window.size, np.inf, dtype=np.float64)
        for k in range(5, window.size - 5):
            left = window[:k]
            right = window[k:]
            aic[k] = k * np.log(np.var(left) + eps) + (window.size - k - 1) * np.log(np.var(right) + eps)

        local_idx = int(np.nanargmin(aic))
        pick_idx = start + local_idx
        return float(recent[pick_idx]["t"]), pick_idx
