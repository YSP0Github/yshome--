from __future__ import annotations

import numpy as np


def build_elastic_parameters(vp: np.ndarray, vs: np.ndarray, rho: np.ndarray) -> dict[str, np.ndarray]:
    mu = rho * vs**2
    lam = rho * np.maximum(vp**2 - 2.0 * vs**2, 0.0)
    twomu = 2.0 * mu
    rhoinv = np.zeros_like(rho, dtype=float)
    np.divide(1.0, rho, out=rhoinv, where=rho > 0.0)
    return {"lam": lam, "mu": mu, "twomu": twomu, "rhoinv": rhoinv}
