from __future__ import annotations

import numpy as np


def _rayleigh_function(x: np.ndarray | float, vp: float, vs: float) -> np.ndarray | float:
    ratio = float(vs) / float(vp)
    x_array = np.asarray(x, dtype=float)
    term_s = np.sqrt(np.maximum(1.0 - x_array**2, 0.0))
    term_p = np.sqrt(np.maximum(1.0 - (ratio * x_array) ** 2, 0.0))
    return (2.0 - x_array**2) ** 2 - 4.0 * term_s * term_p


def estimate_rayleigh_factor(vp: float, vs: float, *, fallback: float = 0.92) -> float:
    vp = float(vp)
    vs = float(vs)
    if not np.isfinite(vp) or not np.isfinite(vs) or vp <= vs or vs <= 0.0:
        return float(fallback)

    samples = np.linspace(1.0e-4, 0.9999, 4096, dtype=float)
    values = np.asarray(_rayleigh_function(samples, vp, vs), dtype=float)
    valid = np.isfinite(values)
    samples = samples[valid]
    values = values[valid]
    if samples.size < 2:
        return float(fallback)

    crossing = np.flatnonzero(values[:-1] * values[1:] <= 0.0)
    if crossing.size == 0:
        return float(fallback)

    lo = float(samples[int(crossing[0])])
    hi = float(samples[int(crossing[0]) + 1])
    flo = float(_rayleigh_function(lo, vp, vs))

    for _ in range(60):
        mid = 0.5 * (lo + hi)
        fmid = float(_rayleigh_function(mid, vp, vs))
        if flo * fmid <= 0.0:
            hi = mid
        else:
            lo = mid
            flo = fmid

    return float(0.5 * (lo + hi))


def estimate_rayleigh_velocity(vp: float, vs: float, *, fallback_factor: float = 0.92) -> float:
    factor = estimate_rayleigh_factor(vp, vs, fallback=fallback_factor)
    return float(factor * float(vs))
