from __future__ import annotations

from pathlib import Path

import numpy as np


def export_records_csv(path: str | Path, time_axis: np.ndarray, vx: np.ndarray, vz: np.ndarray, receiver_x: np.ndarray) -> tuple[Path, Path]:
    import csv

    base = Path(path)
    base.parent.mkdir(parents=True, exist_ok=True)
    vx_path = base.with_name(base.stem + "_vx.csv")
    vz_path = base.with_name(base.stem + "_vz.csv")
    headers = ["time_s"] + [f"rec_{i + 1:03d}_x{receiver_x[i]:.2f}" for i in range(receiver_x.size)]

    for target, matrix in ((vx_path, vx), (vz_path, vz)):
        with target.open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(headers)
            for i in range(time_axis.size):
                writer.writerow([float(time_axis[i]), *matrix[i, :].tolist()])
    return vx_path, vz_path


def export_records_npz(path: str | Path, time_axis: np.ndarray, vx: np.ndarray, vz: np.ndarray, receiver_x: np.ndarray, receiver_z: np.ndarray) -> Path:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        target,
        time_s=time_axis,
        vx=vx,
        vz=vz,
        receiver_x=receiver_x,
        receiver_z=receiver_z,
    )
    return target


def export_wavefield_png(path: str | Path, field: np.ndarray, title: str = "Wavefield") -> Path:
    import matplotlib.pyplot as plt

    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    vmax = float(np.max(np.abs(field)))
    vmin = -vmax if np.min(field) < 0 else float(np.min(field))
    cmap = "seismic" if np.min(field) < 0 else "viridis"

    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=160)
    im = ax.imshow(field, cmap=cmap, aspect="auto", origin="upper", vmin=vmin, vmax=vmax if np.min(field) < 0 else None)
    ax.set_title(title)
    ax.set_xlabel("X index")
    ax.set_ylabel("Z index")
    fig.colorbar(im, ax=ax, shrink=0.85)
    fig.tight_layout()
    fig.savefig(target, bbox_inches="tight")
    plt.close(fig)
    return target


def export_animation_gif(path: str | Path, frames: list[np.ndarray], fps: int = 10) -> Path:
    import imageio.v2 as imageio
    from matplotlib import cm

    if not frames:
        raise ValueError("没有可导出的动画帧。")

    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    stack = np.asarray(frames, dtype=float)
    global_max = float(np.max(np.abs(stack)))
    if global_max <= 0.0:
        global_max = 1.0

    signed = np.min(stack) < 0
    cmap = cm.get_cmap("seismic" if signed else "viridis")
    rendered: list[np.ndarray] = []

    for frame in frames:
        if signed:
            normalized = np.clip((frame / global_max + 1.0) * 0.5, 0.0, 1.0)
        else:
            normalized = np.clip(frame / global_max, 0.0, 1.0)
        rgba = cmap(normalized)
        rendered.append((rgba[:, :, :3] * 255).astype(np.uint8))

    imageio.mimsave(target, rendered, fps=fps)
    return target
