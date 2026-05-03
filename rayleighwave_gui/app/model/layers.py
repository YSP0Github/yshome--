from __future__ import annotations

import math

import numpy as np

from app.model.grid import build_axes
from app.types import GridConfig, LayerDefinition, ModelDefinition


def interface_profiles(layers: list[LayerDefinition], x: np.ndarray) -> list[np.ndarray]:
    profiles: list[np.ndarray] = []
    for layer in sorted(layers, key=lambda item: item.top_depth):
        profile = layer.top_depth + np.tan(math.radians(layer.dip_deg)) * x
        profiles.append(profile)
    return profiles


def build_layered_model(grid: GridConfig, model: ModelDefinition) -> dict[str, np.ndarray]:
    x, z = build_axes(grid)
    zz, _ = np.meshgrid(z, x, indexing="ij")
    sorted_layers = sorted(model.layers, key=lambda item: item.top_depth)
    if not sorted_layers:
        raise ValueError("模型至少需要一层。")

    vp = np.zeros((grid.nz, grid.nx), dtype=float)
    vs = np.zeros_like(vp)
    rho = np.zeros_like(vp)
    layer_index = np.full((grid.nz, grid.nx), -1, dtype=int)

    tops = interface_profiles(sorted_layers, x)
    for idx, layer in enumerate(sorted_layers):
        top = tops[idx][None, :]
        if idx < len(sorted_layers) - 1:
            bottom = tops[idx + 1][None, :]
        else:
            bottom = np.full((1, grid.nx), np.inf, dtype=float)
        mask = (zz >= top) & (zz < bottom)
        vp[mask] = layer.vp
        vs[mask] = layer.vs
        rho[mask] = layer.density
        layer_index[mask] = idx

    unassigned = layer_index < 0
    if np.any(unassigned):
        last = sorted_layers[-1]
        vp[unassigned] = last.vp
        vs[unassigned] = last.vs
        rho[unassigned] = last.density
        layer_index[unassigned] = len(sorted_layers) - 1

    return {
        "x": x,
        "z": z,
        "vp": vp,
        "vs": vs,
        "rho": rho,
        "layer_index": layer_index,
        "interfaces": tops,
    }
