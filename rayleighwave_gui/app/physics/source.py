from __future__ import annotations

import numpy as np

from app.types import GridConfig, SourceConfig


def time_axis(grid: GridConfig) -> np.ndarray:
    nt = int(round(grid.tmax / grid.dt)) + 1
    return np.arange(nt, dtype=float) * grid.dt


def ricker_wavelet(t: np.ndarray, f0: float, delay: float, amplitude: float) -> np.ndarray:
    tau = t - delay
    arg = np.pi * f0 * tau
    return amplitude * (1.0 - 2.0 * arg**2) * np.exp(-arg**2)


def gaussian_derivative(t: np.ndarray, f0: float, delay: float, amplitude: float) -> np.ndarray:
    tau = t - delay
    a1 = -2.0 * np.pi * f0 * np.exp(0.5)
    a2 = -0.5 * (2.0 * np.pi * f0) ** 2
    return amplitude * 2.0 * a1 * tau * np.exp(a2 * tau**2)


def generate_wavelet(grid: GridConfig, source: SourceConfig) -> tuple[np.ndarray, np.ndarray]:
    t = time_axis(grid)
    if source.wavelet == "gaussian_derivative":
        wavelet = gaussian_derivative(t, source.frequency, source.delay, source.amplitude)
    else:
        wavelet = ricker_wavelet(t, source.frequency, source.delay, source.amplitude)
    return t, wavelet
