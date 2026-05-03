from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class GridConfig:
    nx: int = 301
    nz: int = 151
    dx: float = 1.0
    dz: float = 1.0
    dt: float = 0.00016
    tmax: float = 0.8


@dataclass
class BoundaryConfig:
    top_boundary: str = "free_surface"
    pml_thickness: int = 20
    pml_strength: float = 2.0
    taper_power: float = 2.0


@dataclass
class SourceConfig:
    source_type: str = "vertical_force"
    wavelet: str = "ricker"
    frequency: float = 20.0
    amplitude: float = 1.0
    delay: float = 0.06
    x: float = 150.0
    z: float = 2.0


@dataclass
class ReceiverArrayConfig:
    count: int = 48
    start_x: float = 40.0
    start_z: float = 2.0
    spacing: float = 3.0


@dataclass
class LayerDefinition:
    name: str
    top_depth: float
    dip_deg: float
    vp: float
    vs: float
    density: float


@dataclass
class ModelDefinition:
    name: str = "two_layer"
    property_to_display: str = "vs"
    layers: list[LayerDefinition] = field(default_factory=list)


@dataclass
class SimulationConfig:
    wavefield_display: str = "vmag"
    seismogram_display: str = "vz"
    display_stride: int = 8
    record_stride: int = 1
    snapshot_stride: int = 12
    store_animation_frames: bool = True


@dataclass
class ProjectConfig:
    title: str
    grid: GridConfig
    boundary: BoundaryConfig
    source: SourceConfig
    receivers: ReceiverArrayConfig
    model: ModelDefinition
    simulation: SimulationConfig
