from __future__ import annotations

import numpy as np

from app.types import GridConfig


def build_axes(grid: GridConfig) -> tuple[np.ndarray, np.ndarray]:
    x = np.arange(grid.nx, dtype=float) * grid.dx
    z = np.arange(grid.nz, dtype=float) * grid.dz
    return x, z


def coord_to_index(x: float, z: float, grid: GridConfig, margin: int = 0) -> tuple[int, int]:
    ix = int(round(x / grid.dx))
    iz = int(round(z / grid.dz))
    ix = int(np.clip(ix, margin, grid.nx - 1 - margin))
    iz = int(np.clip(iz, margin, grid.nz - 1 - margin))
    return ix, iz


def model_extent(grid: GridConfig) -> tuple[float, float, float, float]:
    xmax = (grid.nx - 1) * grid.dx
    zmax = (grid.nz - 1) * grid.dz
    return 0.0, xmax, 0.0, zmax
