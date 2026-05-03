from __future__ import annotations

from copy import deepcopy

import numpy as np

from app.types import ProjectConfig


def build_validation_project(project: ProjectConfig, inverted_vs: np.ndarray) -> ProjectConfig:
    layers = sorted(project.model.layers, key=lambda item: item.top_depth)
    values = np.asarray(inverted_vs, dtype=float).reshape(-1)
    if values.size == 0:
        raise ValueError("没有可用于回代正演的反演结果。")
    if len(layers) != values.size:
        raise ValueError("反演层数与当前模型层数不一致，无法回代正演。")

    validation_project = deepcopy(project)
    validation_project.title = f"{project.title} - 回代验证"
    validation_project.simulation.store_animation_frames = False

    validation_layers = sorted(validation_project.model.layers, key=lambda item: item.top_depth)
    for layer, vs in zip(validation_layers, values, strict=False):
        layer.vs = float(vs)
    return validation_project


def trim_records_to_common_shape(
    observed: np.ndarray,
    synthetic: np.ndarray,
    time_axis: np.ndarray | None = None,
    receiver_x: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray | None, np.ndarray | None]:
    obs = np.asarray(observed, dtype=np.float32)
    syn = np.asarray(synthetic, dtype=np.float32)
    if obs.ndim != 2 or syn.ndim != 2:
        raise ValueError("接收记录必须为二维数组。")

    n_time = min(obs.shape[0], syn.shape[0])
    n_trace = min(obs.shape[1], syn.shape[1])
    if time_axis is not None:
        n_time = min(n_time, int(np.asarray(time_axis).size))
    if receiver_x is not None:
        n_trace = min(n_trace, int(np.asarray(receiver_x).size))
    if n_time <= 0 or n_trace <= 0:
        raise ValueError("接收记录为空，无法比较。")

    trimmed_time = None if time_axis is None else np.asarray(time_axis, dtype=np.float32)[:n_time]
    trimmed_x = None if receiver_x is None else np.asarray(receiver_x, dtype=np.float32)[:n_trace]
    return obs[:n_time, :n_trace], syn[:n_time, :n_trace], trimmed_time, trimmed_x


def compute_record_metrics(observed: np.ndarray, synthetic: np.ndarray) -> dict[str, float]:
    obs, syn, _, _ = trim_records_to_common_shape(observed, synthetic)
    obs = obs.astype(np.float64, copy=False)
    syn = syn.astype(np.float64, copy=False)
    residual = syn - obs

    obs_rms = float(np.sqrt(np.mean(obs**2)))
    syn_rms = float(np.sqrt(np.mean(syn**2)))
    residual_rms = float(np.sqrt(np.mean(residual**2)))

    dot = float(np.sum(obs * syn))
    corr = dot / max(float(np.linalg.norm(obs) * np.linalg.norm(syn)), 1e-30)

    obs_peak = float(np.max(np.abs(obs)))
    syn_peak = float(np.max(np.abs(syn)))

    return {
        "nrms": residual_rms / max(obs_rms, 1e-30),
        "correlation": corr,
        "energy_ratio": (syn_rms**2) / max(obs_rms**2, 1e-30),
        "peak_ratio": syn_peak / max(obs_peak, 1e-30),
        "observed_rms": obs_rms,
        "synthetic_rms": syn_rms,
        "residual_rms": residual_rms,
    }
