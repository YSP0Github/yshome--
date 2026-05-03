from __future__ import annotations

from copy import deepcopy

from .types import (
    BoundaryConfig,
    GridConfig,
    LayerDefinition,
    ModelDefinition,
    ProjectConfig,
    ReceiverArrayConfig,
    SimulationConfig,
    SourceConfig,
)
from .utils.math_utils import estimate_stable_dt


def _recommended_dt(vmax: float, dx: float = 1.0, dz: float = 1.0, ratio: float = 0.8) -> float:
    stable_dt = estimate_stable_dt(GridConfig(dx=dx, dz=dz), vmax)
    return round(stable_dt * ratio, 6)


def uniform_halfspace_project() -> ProjectConfig:
    return ProjectConfig(
        title="二维面波正演 - 均匀半空间",
        grid=GridConfig(nx=301, nz=151, dx=1.0, dz=1.0, dt=_recommended_dt(1200.0), tmax=0.8),
        boundary=BoundaryConfig(top_boundary="free_surface", pml_thickness=20, pml_strength=2.0, taper_power=2.0),
        source=SourceConfig(source_type="vertical_force", wavelet="ricker", frequency=22.0, amplitude=1.0, delay=0.06, x=110.0, z=2.0),
        receivers=ReceiverArrayConfig(count=48, start_x=25.0, start_z=2.0, spacing=3.0),
        model=ModelDefinition(
            name="uniform_halfspace",
            property_to_display="vs",
            layers=[
                LayerDefinition(name="Layer 1", top_depth=0.0, dip_deg=0.0, vp=1200.0, vs=650.0, density=1900.0),
            ],
        ),
        simulation=SimulationConfig(wavefield_display="vmag", seismogram_display="vz", display_stride=8, record_stride=1, snapshot_stride=12, store_animation_frames=True),
    )


def two_layer_project() -> ProjectConfig:
    project = uniform_halfspace_project()
    project.title = "二维面波正演 - 双层模型"
    project.model = ModelDefinition(
        name="two_layer",
        property_to_display="vs",
        layers=[
            LayerDefinition(name="Layer 1", top_depth=0.0, dip_deg=0.0, vp=900.0, vs=320.0, density=1750.0),
            LayerDefinition(name="Layer 2", top_depth=24.0, dip_deg=0.0, vp=1600.0, vs=780.0, density=2100.0),
        ],
    )
    project.grid.dt = _recommended_dt(1600.0)
    project.source.x = 95.0
    project.receivers.start_x = 20.0
    return project


def low_velocity_layer_project() -> ProjectConfig:
    project = uniform_halfspace_project()
    project.title = "二维面波正演 - 低速覆盖层"
    project.model = ModelDefinition(
        name="low_velocity_layer",
        property_to_display="vs",
        layers=[
            LayerDefinition(name="Layer 1", top_depth=0.0, dip_deg=0.0, vp=700.0, vs=220.0, density=1650.0),
            LayerDefinition(name="Layer 2", top_depth=12.0, dip_deg=0.0, vp=1100.0, vs=380.0, density=1850.0),
            LayerDefinition(name="Layer 3", top_depth=30.0, dip_deg=0.0, vp=1900.0, vs=900.0, density=2200.0),
        ],
    )
    project.grid.nz = 181
    project.grid.dt = _recommended_dt(1900.0)
    project.source.frequency = 18.0
    return project


def dipping_interface_project() -> ProjectConfig:
    project = uniform_halfspace_project()
    project.title = "二维面波正演 - 倾斜界面"
    project.model = ModelDefinition(
        name="dipping_interface",
        property_to_display="vs",
        layers=[
            LayerDefinition(name="Layer 1", top_depth=0.0, dip_deg=0.0, vp=850.0, vs=280.0, density=1720.0),
            LayerDefinition(name="Layer 2", top_depth=18.0, dip_deg=8.0, vp=1700.0, vs=820.0, density=2150.0),
        ],
    )
    project.grid.dt = _recommended_dt(1700.0)
    project.source.x = 85.0
    project.receivers.start_x = 15.0
    return project


PRESET_BUILDERS = {
    "均匀半空间": uniform_halfspace_project,
    "双层模型": two_layer_project,
    "低速覆盖层": low_velocity_layer_project,
    "倾斜界面": dipping_interface_project,
}


def default_project() -> ProjectConfig:
    return deepcopy(two_layer_project())


def project_from_preset(name: str) -> ProjectConfig:
    builder = PRESET_BUILDERS.get(name, default_project)
    return deepcopy(builder())
