from __future__ import annotations

from typing import Iterable

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import QRectF, Qt
from PySide6.QtGui import QColor, QBrush, QPen
from PySide6.QtWidgets import QGraphicsRectItem, QHBoxLayout, QWidget


class WavefieldView(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.plot = pg.PlotWidget()
        self.plot.showGrid(x=True, y=True, alpha=0.25)
        self.plot.setLabel("bottom", "X (m)")
        self.plot.setLabel("left", "Z (m)")
        self.plot.invertY(True)
        self.plot.setMenuEnabled(False)
        self.image = pg.ImageItem()
        if hasattr(self.image, "setAutoDownsample"):
            self.image.setAutoDownsample(True)
        self.plot.addItem(self.image)
        self.hist = pg.HistogramLUTWidget()
        self.hist.setImageItem(self.image)
        self._current_gradient = ""
        self._last_rect: tuple[float, float, float, float] | None = None
        self._last_levels: tuple[float, float] | None = None
        self._last_title: str = ""
        self._set_gradient("bipolar")

        self.source_item = pg.ScatterPlotItem(size=12, symbol="star", brush=pg.mkBrush("#ff5d73"), pen=pg.mkPen("w", width=1.5))
        self.receiver_item = pg.ScatterPlotItem(size=7, symbol="o", brush=pg.mkBrush("#ffe066"), pen=pg.mkPen("#1a1a1a", width=1.0))
        self.plot.addItem(self.source_item)
        self.plot.addItem(self.receiver_item)
        self._boundary_items: list[pg.PlotDataItem] = []
        self._absorbing_items: list[QGraphicsRectItem] = []

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.plot, 1)
        layout.addWidget(self.hist)

    def _set_gradient(self, preset: str) -> None:
        if self._current_gradient != preset:
            self.hist.gradient.loadPreset(preset)
            self._current_gradient = preset

    def _clear_absorbing_items(self) -> None:
        for item in self._absorbing_items:
            self.plot.removeItem(item)
        self._absorbing_items.clear()

    def _clear_boundary_items(self) -> None:
        for item in self._boundary_items:
            self.plot.removeItem(item)
        self._boundary_items.clear()

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
        brush = QBrush(QColor(98, 190, 255, 30))
        pen = QPen(QColor(98, 190, 255, 75))

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
        self._last_rect = None
        self.plot.enableAutoRange()

    def set_overlay(
        self,
        source_xy: tuple[float, float],
        receiver_xy: tuple[np.ndarray, np.ndarray],
        *,
        interfaces: Iterable[np.ndarray],
        x: np.ndarray,
        z: np.ndarray,
        pml_thickness: int,
        dx: float,
        dz: float,
        top_boundary: str,
    ) -> None:
        self.source_item.setData([source_xy[0]], [source_xy[1]])
        self.receiver_item.setData(receiver_xy[0], receiver_xy[1])
        self._clear_boundary_items()
        for profile in interfaces:
            curve = self.plot.plot(x, profile, pen=pg.mkPen((255, 255, 255, 160), width=1.0, style=Qt.DashLine))
            self._boundary_items.append(curve)
        self._draw_absorbing_overlay(x, z, pml_thickness, dx, dz, top_boundary)

    def update_wavefield(
        self,
        field: np.ndarray,
        x: np.ndarray,
        z: np.ndarray,
        component: str,
        time_value: float,
        fixed_abs_max: float | None = None,
    ) -> None:
        self.image.setImage(field, autoLevels=False)

        rect_tuple = (
            float(x[0]),
            float(z[0]),
            float(x[-1] - x[0]),
            float(z[-1] - z[0]),
        )
        if self._last_rect != rect_tuple:
            self.image.setRect(QRectF(*rect_tuple))
            self._last_rect = rect_tuple

        field_min = float(np.min(field))
        field_max = float(np.max(field))
        if field_min < 0.0:
            vmax = float(fixed_abs_max) if fixed_abs_max is not None and fixed_abs_max > 0.0 else max(abs(field_min), abs(field_max))
            vmax = max(vmax, 1e-9)
            levels = (-vmax, vmax)
            self._set_gradient("bipolar")
        else:
            vmin = 0.0
            vmax = float(fixed_abs_max) if fixed_abs_max is not None and fixed_abs_max > 0.0 else field_max
            if vmax - vmin < 1e-12:
                vmax = vmin + 1.0
            levels = (vmin, vmax)
            self._set_gradient("viridis")
        if self._last_levels is None or any(abs(a - b) > 1e-9 for a, b in zip(self._last_levels, levels)):
            self.image.setLevels(levels)
            self._last_levels = levels

        title = f"波场动画 - {component}    t = {time_value:.4f} s"
        if title != self._last_title:
            self.plot.setTitle(title)
            self._last_title = title
