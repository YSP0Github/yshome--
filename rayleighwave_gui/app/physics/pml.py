from __future__ import annotations

import numpy as np

from app.types import BoundaryConfig, GridConfig


def _one_side_profile(n: int, thickness: int, reverse: bool = False) -> np.ndarray:
    profile = np.zeros(n, dtype=float)
    if thickness <= 0:
        return profile
    indices = np.arange(thickness, dtype=float)
    values = (1.0 - indices / max(thickness - 1, 1)) ** 2
    if reverse:
        profile[-thickness:] = values[::-1]
    else:
        profile[:thickness] = values
    return profile


def build_absorbing_mask(grid: GridConfig, boundary: BoundaryConfig, vmax: float) -> np.ndarray:
    thickness = int(boundary.pml_thickness)
    if thickness <= 0:
        return np.ones((grid.nz, grid.nx), dtype=float)

    left = _one_side_profile(grid.nx, thickness, reverse=False)
    right = _one_side_profile(grid.nx, thickness, reverse=True)
    bottom = _one_side_profile(grid.nz, thickness, reverse=True)
    top = _one_side_profile(grid.nz, thickness, reverse=False) if boundary.top_boundary == "absorbing" else np.zeros(grid.nz, dtype=float)

    px = np.maximum(left, right) ** boundary.taper_power
    pz = np.maximum(top, bottom) ** boundary.taper_power
    sigma = boundary.pml_strength * vmax * (px[None, :] / max(grid.dx, 1e-12) + pz[:, None] / max(grid.dz, 1e-12))
    damping = np.exp(-sigma * grid.dt)
    return damping.astype(float)
