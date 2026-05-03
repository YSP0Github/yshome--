from __future__ import annotations

import numpy as np

from app.model.grid import coord_to_index
from app.types import GridConfig, ReceiverArrayConfig


def build_receiver_array(grid: GridConfig, cfg: ReceiverArrayConfig) -> dict[str, np.ndarray]:
    indices = np.arange(cfg.count, dtype=float)
    x = cfg.start_x + cfg.spacing * indices
    z = np.full_like(x, cfg.start_z)

    ix = np.empty(cfg.count, dtype=int)
    iz = np.empty(cfg.count, dtype=int)
    for i in range(cfg.count):
        ix[i], iz[i] = coord_to_index(float(x[i]), float(z[i]), grid, margin=1)

    return {"x": x, "z": z, "ix": ix, "iz": iz}
