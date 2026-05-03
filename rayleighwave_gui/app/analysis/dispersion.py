from __future__ import annotations

import math

import numpy as np


def _next_power_of_two(value: int) -> int:
    value = max(1, int(value))
    return 1 << int(math.ceil(math.log2(value)))


def _odd_window(value: int) -> int:
    value = max(1, int(round(value)))
    return value if value % 2 == 1 else value + 1


def _moving_average_1d(values: np.ndarray, window: int) -> np.ndarray:
    array = np.asarray(values, dtype=float)
    if window <= 1 or array.size == 0:
        return array.copy()
    pad = window // 2
    padded = np.pad(array, (pad, pad), mode="edge")
    kernel = np.full(window, 1.0 / window, dtype=float)
    return np.convolve(padded, kernel, mode="valid")


def _smooth_dispersion_energy(energy: np.ndarray, velocity_window: int, frequency_window: int) -> np.ndarray:
    smoothed = np.asarray(energy, dtype=float)
    if smoothed.size == 0:
        return smoothed.copy()

    if velocity_window > 1:
        smoothed = np.apply_along_axis(lambda column: _moving_average_1d(column, velocity_window), 0, smoothed)
    if frequency_window > 1:
        smoothed = np.apply_along_axis(lambda row: _moving_average_1d(row, frequency_window), 1, smoothed)
    return smoothed


def _track_main_ridge_indices(
    velocity_axis: np.ndarray,
    energy: np.ndarray,
    *,
    continuity_penalty: float = 180.0,
    ridge_bias_weight: float = 0.25,
) -> np.ndarray:
    velocity_axis = np.asarray(velocity_axis, dtype=float).reshape(-1)
    energy = np.asarray(energy, dtype=float)
    nv, nf = energy.shape
    if nv == 0 or nf == 0:
        return np.empty(0, dtype=np.int32)

    velocity_norm = (velocity_axis - float(velocity_axis[0])) / max(float(velocity_axis[-1] - velocity_axis[0]), 1e-9)
    ridge_bias = np.mean(energy, axis=1)
    ridge_ptp = float(np.ptp(ridge_bias))
    if ridge_ptp > 0.0:
        ridge_bias = (ridge_bias - float(np.min(ridge_bias))) / ridge_ptp
    else:
        ridge_bias = np.zeros_like(ridge_bias)

    transition_penalty = continuity_penalty * (velocity_norm[:, None] - velocity_norm[None, :]) ** 2
    score = np.full((nv, nf), -np.inf, dtype=float)
    previous = np.full((nv, nf), -1, dtype=np.int32)

    score[:, 0] = energy[:, 0] + ridge_bias_weight * ridge_bias
    for ifreq in range(1, nf):
        current_score = energy[:, ifreq] + ridge_bias_weight * ridge_bias
        transition = score[:, ifreq - 1][None, :] - transition_penalty
        best_prev = np.argmax(transition, axis=1)
        score[:, ifreq] = current_score + transition[np.arange(nv), best_prev]
        previous[:, ifreq] = best_prev.astype(np.int32, copy=False)

    ridge_indices = np.zeros(nf, dtype=np.int32)
    ridge_indices[-1] = int(np.argmax(score[:, -1] + ridge_bias_weight * ridge_bias))
    for ifreq in range(nf - 1, 0, -1):
        ridge_indices[ifreq - 1] = previous[ridge_indices[ifreq], ifreq]
    return ridge_indices


def _nearest_velocity_indices(velocity_axis: np.ndarray, values: np.ndarray) -> np.ndarray:
    velocity_axis = np.asarray(velocity_axis, dtype=float).reshape(-1)
    values = np.asarray(values, dtype=float).reshape(-1)
    if velocity_axis.size == 0 or values.size == 0:
        return np.empty(0, dtype=np.int32)
    return np.asarray([int(np.argmin(np.abs(velocity_axis - value))) for value in values], dtype=np.int32)


def _refine_ridge_upper_shoulder_indices(
    velocity_axis: np.ndarray,
    energy: np.ndarray,
    ridge_indices: np.ndarray,
    *,
    shoulder_ratio: float = 0.915,
    max_shift_fraction: float = 0.035,
) -> np.ndarray:
    velocity_axis = np.asarray(velocity_axis, dtype=float).reshape(-1)
    energy = np.asarray(energy, dtype=float)
    ridge_indices = np.asarray(ridge_indices, dtype=np.int32).reshape(-1)
    nv, nf = energy.shape
    if nv == 0 or nf == 0 or ridge_indices.size != nf:
        return ridge_indices.copy()

    max_shift = max(2, min(12, int(round(max_shift_fraction * nv))))
    refined = ridge_indices.astype(np.int32, copy=True)
    for ifreq in range(nf):
        base = int(np.clip(refined[ifreq], 0, nv - 1))
        column = energy[:, ifreq]
        peak = float(np.max(column))
        if not np.isfinite(peak) or peak <= 0.0:
            continue

        threshold = shoulder_ratio * peak
        upper = min(nv - 1, base + max_shift)
        shoulder = np.flatnonzero(column[base : upper + 1] >= threshold)
        if shoulder.size:
            refined[ifreq] = base + int(shoulder[-1])

    smooth_window = min(7, max(3, _odd_window(0.04 * nf)))
    refined_velocity = _moving_average_1d(velocity_axis[refined], smooth_window)
    snapped = _nearest_velocity_indices(velocity_axis, refined_velocity)
    return snapped.astype(np.int32, copy=False)


def _median_filter_1d(values: np.ndarray, window: int) -> np.ndarray:
    array = np.asarray(values, dtype=float).reshape(-1)
    if array.size == 0 or window <= 1:
        return array.copy()
    pad = window // 2
    padded = np.pad(array, (pad, pad), mode="edge")
    filtered = np.empty_like(array)
    for idx in range(array.size):
        filtered[idx] = float(np.median(padded[idx : idx + window]))
    return filtered


def _filter_pick_outliers(
    freq_axis: np.ndarray,
    velocity_axis: np.ndarray,
    energy: np.ndarray,
    freq_indices: np.ndarray,
    velocity_indices: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    freq_indices = np.asarray(freq_indices, dtype=int).reshape(-1)
    velocity_indices = np.asarray(velocity_indices, dtype=int).reshape(-1)
    if freq_indices.size <= 4 or velocity_indices.size != freq_indices.size:
        return freq_indices, velocity_indices

    picked_velocity = velocity_axis[velocity_indices]
    smooth_window = min(5, max(3, _odd_window(0.18 * picked_velocity.size)))
    smoothed_velocity = _median_filter_1d(picked_velocity, smooth_window)

    velocity_step = float(np.median(np.diff(velocity_axis))) if velocity_axis.size > 1 else 1.0
    velocity_step = max(abs(velocity_step), 1.0)
    deviation = np.abs(picked_velocity - smoothed_velocity)
    deviation_scale = 1.4826 * float(np.median(np.abs(deviation - np.median(deviation)))) if deviation.size > 2 else 0.0
    deviation_limit = max(3.5 * velocity_step, 2.5 * deviation_scale, 0.025 * max(float(np.ptp(picked_velocity)), velocity_step))

    column_peak = np.max(energy[:, freq_indices], axis=0)
    picked_energy = energy[velocity_indices, freq_indices]
    energy_ratio = picked_energy / np.maximum(column_peak, 1e-12)
    energy_floor = max(0.72, float(np.quantile(energy_ratio, 0.2)) - 0.08)

    keep_mask = (deviation <= deviation_limit) & (energy_ratio >= energy_floor)
    if np.count_nonzero(keep_mask) < max(4, freq_indices.size // 2):
        return freq_indices, velocity_indices

    filtered_freq = freq_indices[keep_mask]
    filtered_vel = velocity_indices[keep_mask]

    if filtered_freq.size >= 4 and filtered_freq.size < freq_indices.size:
        interp_velocity = np.interp(freq_indices, filtered_freq, velocity_axis[filtered_vel])
        snapped_velocity = _nearest_velocity_indices(velocity_axis, interp_velocity)
        rescue_mask = (~keep_mask) & (np.abs(picked_velocity - interp_velocity) <= 1.5 * deviation_limit)
        velocity_indices = velocity_indices.copy()
        velocity_indices[~keep_mask] = snapped_velocity[~keep_mask]
        keep_mask = keep_mask | rescue_mask
        filtered_freq = freq_indices[keep_mask]
        filtered_vel = velocity_indices[keep_mask]

    return filtered_freq.astype(np.int32, copy=False), filtered_vel.astype(np.int32, copy=False)


def compute_phase_velocity_spectrum(
    records: np.ndarray,
    time_axis: np.ndarray,
    receiver_x: np.ndarray,
    *,
    velocity_min: float = 80.0,
    velocity_max: float = 1500.0,
    n_velocity: int = 181,
    freq_min: float = 2.0,
    freq_max: float = 60.0,
    normalize_traces: bool = True,
    pad_factor: int = 2,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Compute a simple phase-velocity dispersion energy image from linear-array records.

    Returns
    -------
    freq_axis : (nf,) ndarray
        Frequency axis in Hz.
    velocity_axis : (nv,) ndarray
        Trial phase velocities in m/s.
    energy : (nv, nf) ndarray
        Normalized dispersion energy image.
    """

    data = np.asarray(records, dtype=float)
    time_axis = np.asarray(time_axis, dtype=float).reshape(-1)
    receiver_x = np.asarray(receiver_x, dtype=float).reshape(-1)

    if data.ndim != 2:
        raise ValueError("接收记录必须是二维数组，形状应为 (nt, nrec)。")
    nt, nrec = data.shape
    if nt < 8 or nrec < 2:
        raise ValueError("频散分析至少需要 8 个时间采样点和 2 个接收器。")
    if time_axis.size != nt:
        raise ValueError("time_axis 长度与记录时间采样数不一致。")
    if receiver_x.size != nrec:
        raise ValueError("receiver_x 长度与接收器道数不一致。")
    if velocity_min <= 0.0 or velocity_max <= velocity_min:
        raise ValueError("速度范围无效，请保证 vmax > vmin > 0。")
    if n_velocity < 8:
        raise ValueError("速度采样点数过少，建议至少 8。")

    dt_samples = np.diff(time_axis)
    if dt_samples.size == 0:
        raise ValueError("时间轴长度不足。")
    dt = float(np.median(dt_samples))
    if not np.isfinite(dt) or dt <= 0.0:
        raise ValueError("时间采样间隔 dt 无效。")

    order = np.argsort(receiver_x)
    offsets = receiver_x[order] - float(np.min(receiver_x))
    data = data[:, order]

    demeaned = data - np.mean(data, axis=0, keepdims=True)
    taper = np.hanning(nt)[:, None]
    tapered = demeaned * taper

    nfft = _next_power_of_two(nt) * max(1, int(pad_factor))
    spectrum = np.fft.rfft(tapered, n=nfft, axis=0)
    freq_axis = np.fft.rfftfreq(nfft, d=dt)

    nyquist = float(freq_axis[-1])
    fmin = max(0.0, float(freq_min))
    fmax = min(float(freq_max), nyquist)
    if fmax <= fmin:
        raise ValueError(f"频率范围无效，请保证 fmax > fmin，且 fmax 不超过 Nyquist={nyquist:.2f} Hz。")

    freq_mask = (freq_axis >= fmin) & (freq_axis <= fmax)
    freq_axis = freq_axis[freq_mask]
    spectrum = spectrum[freq_mask, :]
    if freq_axis.size == 0:
        raise ValueError("给定频率范围内没有可用频率采样点。")

    velocity_axis = np.linspace(float(velocity_min), float(velocity_max), int(n_velocity), dtype=float)
    energy = np.zeros((velocity_axis.size, freq_axis.size), dtype=np.float32)
    inverse_velocity = 1.0 / velocity_axis

    for ifreq, freq in enumerate(freq_axis):
        trace_spectrum = spectrum[ifreq, :]
        if normalize_traces:
            trace_spectrum = trace_spectrum / np.maximum(np.abs(trace_spectrum), 1e-12)
        omega = 2.0 * np.pi * float(freq)
        phase_shifts = np.exp(1j * omega * inverse_velocity[:, None] * offsets[None, :])
        stacked = np.abs(np.sum(phase_shifts * trace_spectrum[None, :], axis=1))
        max_value = float(np.max(stacked))
        if max_value > 0.0:
            stacked = stacked / max_value
        energy[:, ifreq] = stacked.astype(np.float32, copy=False)

    return freq_axis.astype(np.float32), velocity_axis.astype(np.float32), energy


def pick_peak_curve(
    freq_axis: np.ndarray,
    velocity_axis: np.ndarray,
    energy: np.ndarray,
    *,
    max_points: int = 36,
) -> np.ndarray:
    """Automatically pick a smooth main ridge, then apply a mild upper-shoulder correction."""

    freq_axis = np.asarray(freq_axis, dtype=float).reshape(-1)
    velocity_axis = np.asarray(velocity_axis, dtype=float).reshape(-1)
    energy = np.asarray(energy, dtype=float)

    if energy.ndim != 2 or energy.shape != (velocity_axis.size, freq_axis.size):
        raise ValueError("频散能量矩阵尺寸与频率/速度轴不一致。")
    if freq_axis.size == 0:
        return np.empty((0, 2), dtype=float)

    velocity_window = min(9, max(3, _odd_window(0.03 * velocity_axis.size)))
    frequency_window = min(9, max(3, _odd_window(0.06 * freq_axis.size)))
    smoothed_energy = _smooth_dispersion_energy(energy, velocity_window, frequency_window)
    ridge_indices = _track_main_ridge_indices(velocity_axis, smoothed_energy)
    ridge_indices = _refine_ridge_upper_shoulder_indices(velocity_axis, smoothed_energy, ridge_indices)

    stride = max(1, int(math.ceil(freq_axis.size / max(1, int(max_points)))))
    freq_indices = np.arange(0, freq_axis.size, stride, dtype=int)
    if freq_indices[-1] != freq_axis.size - 1:
        freq_indices = np.append(freq_indices, freq_axis.size - 1)
    velocity_indices = ridge_indices[freq_indices]
    freq_indices, velocity_indices = _filter_pick_outliers(
        freq_axis,
        velocity_axis,
        smoothed_energy,
        freq_indices,
        velocity_indices,
    )

    picks = np.column_stack((freq_axis[freq_indices], velocity_axis[velocity_indices]))
    return picks.astype(np.float32, copy=False)
