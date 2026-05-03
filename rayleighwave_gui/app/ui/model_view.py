from __future__ import annotations

from typing import Iterable

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import QRectF, Signal
from PySide6.QtGui import QColor, QBrush, QPen
from PySide6.QtWidgets import QGraphicsRectItem, QHBoxLayout, QWidget


class ModelView(QWidget):
    coordinate_clicked = Signal(float, float)
    coordinate_hovered = Signal(float, float)

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.plot = pg.PlotWidget()
        self.plot.showGrid(x=True, y=True, alpha=0.25)
        self.plot.setLabel("bottom", "X (m)")
        self.plot.setLabel("left", "Z (m)")
        self.plot.invertY(True)
        self.plot.setMenuEnabled(False)
        self.image = pg.ImageItem()
        self.plot.addItem(self.image)
        self.hist = pg.HistogramLUTWidget()
        self.hist.setImageItem(self.image)
        self.hist.gradient.loadPreset("viridis")

        self.source_item = pg.ScatterPlotItem(size=12, symbol="star", brush=pg.mkBrush("#ff5d73"), pen=pg.mkPen("w", width=1.5))
        self.receiver_item = pg.ScatterPlotItem(size=7, symbol="o", brush=pg.mkBrush("#53d8fb"), pen=pg.mkPen("#0f172a", width=1.0))
        self.plot.addItem(self.source_item)
        self.plot.addItem(self.receiver_item)

        self.cross_x = pg.InfiniteLine(angle=90, movable=False, pen=pg.mkPen((255, 255, 255, 60), width=1))
        self.cross_z = pg.InfiniteLine(angle=0, movable=False, pen=pg.mkPen((255, 255, 255, 60), width=1))
        self.plot.addItem(self.cross_x, ignoreBounds=True)
        self.plot.addItem(self.cross_z, ignoreBounds=True)

        self._boundary_items: list[pg.PlotDataItem] = []
        self._absorbing_items: list[QGraphicsRectItem] = []

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.plot, 1)
        layout.addWidget(self.hist)

        self.plot.scene().sigMouseClicked.connect(self._on_mouse_clicked)
        self._mouse_proxy = pg.SignalProxy(self.plot.scene().sigMouseMoved, rateLimit=60, slot=self._on_mouse_moved)

    def _map_scene_to_view(self, event_or_pos):
        scene_pos = event_or_pos.scenePos() if hasattr(event_or_pos, "scenePos") else event_or_pos
        if not self.plot.sceneBoundingRect().contains(scene_pos):
            return None
        return self.plot.getPlotItem().vb.mapSceneToView(scene_pos)

    def _on_mouse_clicked(self, event) -> None:
        mouse_point = self._map_scene_to_view(event)
        if mouse_point is None:
            return
        x = max(0.0, float(mouse_point.x()))
        z = max(0.0, float(mouse_point.y()))
        self.coordinate_clicked.emit(x, z)

    def _on_mouse_moved(self, event) -> None:
        pos = event[0] if isinstance(event, (list, tuple)) else event
        mouse_point = self._map_scene_to_view(pos)
        if mouse_point is None:
            return
        x = max(0.0, float(mouse_point.x()))
        z = max(0.0, float(mouse_point.y()))
        self.cross_x.setValue(x)
        self.cross_z.setValue(z)
        self.coordinate_hovered.emit(x, z)

    def _clear_absorbing_items(self) -> None:
        for item in self._absorbing_items:
            self.plot.removeItem(item)
        self._absorbing_items.clear()

    def _draw_absorbing_overlay(
        self,
        x: np.ndarray,
        z: np.ndarray,
        pml_thickness: int,
        dx: float,
        dz: float,
        top_boundary: str,
    ) -> None:
        self._clear_absorbing_items()
        if pml_thickness <= 0:
            return

        xmax = float(x.max())
        zmax = float(z.max())
        pml_x = pml_thickness * dx
        pml_z = pml_thickness * dz
        brush = QBrush(QColor(32, 129, 226, 40))
        pen = QPen(QColor(32, 129, 226, 95))

        rectangles = [
            QRectF(0.0, 0.0, pml_x, zmax),
            QRectF(max(xmax - pml_x, 0.0), 0.0, pml_x, zmax),
            QRectF(0.0, max(zmax - pml_z, 0.0), xmax, pml_z),
        ]
        if top_boundary == "absorbing":
            rectangles.append(QRectF(0.0, 0.0, xmax, pml_z))

        for rect in rectangles:
            item = QGraphicsRectItem(rect)
            item.setBrush(brush)
            item.setPen(pen)
            self.plot.addItem(item)
            self._absorbing_items.append(item)

    def reset_view(self) -> None:
        self.plot.enableAutoRange()

    def set_model(
        self,
        field: np.ndarray,
        x: np.ndarray,
        z: np.ndarray,
        property_name: str,
        interfaces: Iterable[np.ndarray],
        source_xy: tuple[float, float],
        receiver_xy: tuple[np.ndarray, np.ndarray],
        *,
        pml_thickness: int,
        dx: float,
        dz: float,
        top_boundary: str,
    ) -> None:
        rect = QRectF(float(x.min()), float(z.min()), float(x.max() - x.min()), float(z.max() - z.min()))
        self.image.setImage(field, autoLevels=False)
        self.image.setRect(rect)
        self.image.setLevels((float(np.min(field)), float(np.max(field))))
        self.plot.setTitle(f"模型预览 - {property_name.upper()}")

        for item in self._boundary_items:
            self.plot.removeItem(item)
        self._boundary_items.clear()
        for profile in interfaces:
            curve = self.plot.plot(x, profile, pen=pg.mkPen("#ffffff", width=1.2))
            self._boundary_items.append(curve)

        self._draw_absorbing_overlay(x, z, pml_thickness, dx, dz, top_boundary)
        self.source_item.setData([source_xy[0]], [source_xy[1]])
        self.receiver_item.setData(receiver_xy[0], receiver_xy[1])
        self.reset_view()
