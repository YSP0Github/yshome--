from __future__ import annotations

from app.types import ProjectConfig
from app.utils.math_utils import estimate_stable_dt


def validate_project(project: ProjectConfig, *, strict_dt: bool = True) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if project.grid.nx < 20 or project.grid.nz < 20:
        errors.append("网格尺寸过小，建议 nx、nz 均不小于 20。")
    if project.grid.dx <= 0 or project.grid.dz <= 0 or project.grid.dt <= 0 or project.grid.tmax <= 0:
        errors.append("dx、dz、dt、tmax 必须为正值。")
    if not project.model.layers:
        errors.append("模型至少需要一层。")

    xmax = (project.grid.nx - 1) * project.grid.dx
    zmax = (project.grid.nz - 1) * project.grid.dz

    if not (0.0 <= project.source.x <= xmax and 0.0 <= project.source.z <= zmax):
        errors.append("震源位置超出网格范围。")

    receiver_end = project.receivers.start_x + max(project.receivers.count - 1, 0) * project.receivers.spacing
    if receiver_end > xmax:
        errors.append("接收器排列超出模型右边界。")
    if project.receivers.start_z > zmax:
        errors.append("接收器埋深超出模型范围。")

    vmax = 0.0
    for idx, layer in enumerate(project.model.layers, start=1):
        if layer.vp <= 0 or layer.vs <= 0 or layer.density <= 0:
            errors.append(f"第 {idx} 层的 Vp/Vs/密度必须为正值。")
        if layer.vp <= layer.vs:
            warnings.append(f"第 {idx} 层满足 Vp <= Vs，可能不符合常见弹性介质。")
        vmax = max(vmax, layer.vp)

    dt_stable = estimate_stable_dt(project.grid, vmax)
    if project.grid.dt > dt_stable:
        message = f"当前 dt={project.grid.dt:.6f} s 可能超过稳定条件，建议不大于 {dt_stable:.6f} s。"
        if strict_dt:
            errors.append(message)
        else:
            warnings.append(message)
    elif project.grid.dt > 0.85 * dt_stable:
        warnings.append(f"当前 dt 接近稳定上限（建议 <= {dt_stable:.6f} s）。")

    if project.boundary.pml_thickness <= 0:
        warnings.append("吸收边界厚度为 0，将明显产生边界反射。")

    return errors, warnings
