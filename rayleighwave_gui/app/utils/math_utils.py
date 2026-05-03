from __future__ import annotations

import math

from app.types import GridConfig


def estimate_stable_dt(grid: GridConfig, vmax: float, safety: float = 0.45) -> float:
    if vmax <= 0.0:
        return math.inf
    return safety / (vmax * math.sqrt((1.0 / grid.dx) ** 2 + (1.0 / grid.dz) ** 2))
