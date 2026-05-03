from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from app.types import (
    BoundaryConfig,
    GridConfig,
    LayerDefinition,
    ModelDefinition,
    ProjectConfig,
    ReceiverArrayConfig,
    SimulationConfig,
    SourceConfig,
)


def save_project(project: ProjectConfig, path: str | Path) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    payload = asdict(project)
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def load_project(path: str | Path) -> ProjectConfig:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    layers = [LayerDefinition(**item) for item in payload["model"]["layers"]]
    return ProjectConfig(
        title=payload["title"],
        grid=GridConfig(**payload["grid"]),
        boundary=BoundaryConfig(**payload["boundary"]),
        source=SourceConfig(**payload["source"]),
        receivers=ReceiverArrayConfig(**payload["receivers"]),
        model=ModelDefinition(
            name=payload["model"]["name"],
            property_to_display=payload["model"].get("property_to_display", "vs"),
            layers=layers,
        ),
        simulation=SimulationConfig(**payload["simulation"]),
    )
