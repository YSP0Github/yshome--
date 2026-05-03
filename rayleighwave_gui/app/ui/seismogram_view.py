from __future__ import annotations

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import QEvent, QRectF, Qt, Signal
from PySide6.QtGui import QPainterPath
from PySide6.QtWidgets import (
    QComboBox,
    QGraphicsPathItem,
    QHBoxLayout,
    QLabel,
    QSplitter,
    QStackedWidget,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

SEISMIC_WHITE_CENTER_GRADIENT = {
    "mode": "rgb",
    "ticks": [
        (0.00, (24, 63, 153, 255)),
        (0.22, (107, 174, 214, 255)),
        (0.50, (255, 255, 255, 255)),
        (0.78, (244, 109, 67, 255)),
        (1.00, (165, 0, 38, 255)),
    ],
}


class SeismogramView(QWidget):
    trace_selected = Signal(int)

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        self._records = np.empty((0, 0), dtype=np.float32)
        self._time_axis = np.empty(0, dtype=np.float32)
        self._receiver_x = np.empty(0, dtype=np.float32)
        self._source_x: float | None = None
        self._component = "vz"
        self._selected_trace_index = 0
        self._last_render_signature: tuple[object, ...] | None = None

        self._max_image_time_samples = 720
        self._max_image_receiver_samples = 240
        self._max_trace_samples = 3000
        self._max_wiggle_time_samples = 1600
        self._max_wiggle_traces = 80
        self._seismic_lut = pg.ColorMap(
            [tick[0] for tick in SEISMIC_WHITE_CENTER_GRADIENT["ticks"]],
            [tick[1] for tick in SEISMIC_WHITE_CENTER_GRADIENT["ticks"]],
        ).getLookupTable(0.0, 1.0, 256)

        self._main_wiggle_items: list[object] = []
        self._detail_wiggle_items: list[object] = []
        self._split_left_wiggle_items: list[object] = []
        self._split_right_wiggle_items: list[object] = []
        self._plot_click_targets: dict[int, tuple[np.ndarray, np.ndarray]] = {}
        self._hover_markers: dict[int, pg.InfiniteLine] = {}
        self._hover_signal_proxies: list[pg.SignalProxy] = []
        self._hover_viewports: dict[int, pg.PlotWidget] = {}

        self._build_ui()

    def _build_ui(self) -> None:
        self.coordinate_mode_combo = QComboBox()
        self.coordinate_mode_combo.addItem("Receiver X", "receiver_x")
        self.coordinate_mode_combo.addItem("Offset（有符号）", "signed_offset")
        self.coordinate_mode_combo.addItem("Offset（绝对值）", "abs_offset")

        self.layout_mode_combo = QComboBox()
        self.layout_mode_combo.addItem("整体显示", "overall")
        self.layout_mode_combo.addItem("左右分离", "split")

        self.display_mode_combo = QComboBox()
        self.display_mode_combo.addItem("变密度", "image")
        self.display_mode_combo.addItem("摆动", "wiggle")
        self.display_mode_combo.addItem("摆动+变面积", "wiggle_va")

        self.fill_style_combo = QComboBox()
        self.fill_style_combo.addItem("正半轴填色", "positive_color")
        self.fill_style_combo.addItem("正半轴填灰黑", "positive_mono")
        self.fill_style_combo.addItem("正负双色", "posneg_color")
        self.fill_style_combo.addItem("正负黑白", "posneg_mono")
        self.fill_style_combo.setCurrentIndex(1)

        self.mode_info_label = QLabel("坐标：Receiver X；布局：整体显示；多道显示：变密度。")
        self.mode_info_label.setWordWrap(True)

        controls_layout = QHBoxLayout()
        controls_layout.setContentsMargins(0, 0, 0, 0)
        controls_layout.addWidget(QLabel("坐标"))
        controls_layout.addWidget(self.coordinate_mode_combo)
        controls_layout.addSpacing(10)
        controls_layout.addWidget(QLabel("布局"))
        controls_layout.addWidget(self.layout_mode_combo)
        controls_layout.addSpacing(10)
        controls_layout.addWidget(QLabel("多道显示"))
        controls_layout.addWidget(self.display_mode_combo)
        controls_layout.addSpacing(10)
        controls_layout.addWidget(QLabel("填充样式"))
        controls_layout.addWidget(self.fill_style_combo)
        controls_layout.addSpacing(14)
        controls_layout.addWidget(self.mode_info_label, 1)

        self.image_plot = self._create_plot_widget()
        self.image = self._create_image_item()
        self.image_plot.addItem(self.image)
        self.hist = pg.HistogramLUTWidget()
        self.hist.setImageItem(self.image)
        self.hist.gradient.restoreState(SEISMIC_WHITE_CENTER_GRADIENT)
        self.trace_marker = self._create_trace_marker()
        self.image_plot.addItem(self.trace_marker, ignoreBounds=True)

        image_container = QWidget()
        image_layout = QHBoxLayout(image_container)
        image_layout.setContentsMargins(0, 0, 0, 0)
        image_layout.addWidget(self.image_plot, 1)
        image_layout.addWidget(self.hist)

        self.main_wiggle_plot = self._create_plot_widget()

        self.split_left_image_plot = self._create_plot_widget()
        self.split_left_image = self._create_image_item()
        self.split_left_image_plot.addItem(self.split_left_image)
        self.split_left_marker = self._create_trace_marker()
        self.split_left_image_plot.addItem(self.split_left_marker, ignoreBounds=True)

        self.split_right_image_plot = self._create_plot_widget()
        self.split_right_image = self._create_image_item()
        self.split_right_image_plot.addItem(self.split_right_image)
        self.split_right_marker = self._create_trace_marker()
        self.split_right_image_plot.addItem(self.split_right_marker, ignoreBounds=True)

        split_image_widget = QWidget()
        split_image_layout = QHBoxLayout(split_image_widget)
        split_image_layout.setContentsMargins(0, 0, 0, 0)
        split_image_layout.addWidget(self.split_left_image_plot, 1)
        split_image_layout.addWidget(self.split_right_image_plot, 1)

        self.split_left_wiggle_plot = self._create_plot_widget()
        self.split_right_wiggle_plot = self._create_plot_widget()

        split_wiggle_widget = QWidget()
        split_wiggle_layout = QHBoxLayout(split_wiggle_widget)
        split_wiggle_layout.setContentsMargins(0, 0, 0, 0)
        split_wiggle_layout.addWidget(self.split_left_wiggle_plot, 1)
        split_wiggle_layout.addWidget(self.split_right_wiggle_plot, 1)

        self.multi_trace_stack = QStackedWidget()
        self.multi_trace_stack.addWidget(image_container)          # 0 overall image
        self.multi_trace_stack.addWidget(self.main_wiggle_plot)   # 1 overall wiggle / wiggle+va
        self.multi_trace_stack.addWidget(split_image_widget)      # 2 split image
        self.multi_trace_stack.addWidget(split_wiggle_widget)     # 3 split wiggle / wiggle+va

        self.trace_plot = pg.PlotWidget()
        self.trace_plot.showGrid(x=True, y=True, alpha=0.25)
        self.trace_plot.setLabel("bottom", "Time (s)")
        self.trace_plot.setLabel("left", "Amplitude")
        self.trace_plot.setMenuEnabled(False)
        self.trace_curve = self.trace_plot.plot(pen=pg.mkPen("#ff9f1c", width=1.6))
        self.zero_line = pg.InfiniteLine(angle=0, movable=False, pen=pg.mkPen((255, 255, 255, 70), width=1))
        self.trace_plot.addItem(self.zero_line, ignoreBounds=True)

        self.detail_wiggle_plot = self._create_plot_widget()
        self.wiggle_plot = self.detail_wiggle_plot  # compatibility

        self.detail_tabs = QTabWidget()
        self.detail_tabs.addTab(self.trace_plot, "单道波形")
        self.detail_tabs.addTab(self.detail_wiggle_plot, "辅助多道")

        splitter = QSplitter()
        splitter.setOrientation(Qt.Vertical)
        splitter.addWidget(self.multi_trace_stack)
        splitter.addWidget(self.detail_tabs)
        splitter.setSizes([320, 180])

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addLayout(controls_layout)
        layout.addWidget(splitter)

        for widget in (
            self.coordinate_mode_combo,
            self.layout_mode_combo,
            self.display_mode_combo,
            self.fill_style_combo,
        ):
            widget.currentIndexChanged.connect(self._on_mode_changed)
        self.detail_tabs.currentChanged.connect(lambda _: self._refresh_detail_panel())

        for plot in self._multitrace_plots():
            self._register_hover_tracking(plot)

        self.image_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.image_plot: self._on_plot_clicked(event, plot, self._overall_panel_data())
        )
        self.main_wiggle_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.main_wiggle_plot: self._on_plot_clicked(event, plot, self._overall_panel_data())
        )
        self.detail_wiggle_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.detail_wiggle_plot: self._on_plot_clicked(event, plot, self._overall_panel_data())
        )
        self.split_left_image_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.split_left_image_plot: self._on_plot_clicked(event, plot, self._split_panel_data("left"))
        )
        self.split_right_image_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.split_right_image_plot: self._on_plot_clicked(event, plot, self._split_panel_data("right"))
        )
        self.split_left_wiggle_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.split_left_wiggle_plot: self._on_plot_clicked(event, plot, self._split_panel_data("left"))
        )
        self.split_right_wiggle_plot.scene().sigMouseClicked.connect(
            lambda event, plot=self.split_right_wiggle_plot: self._on_plot_clicked(event, plot, self._split_panel_data("right"))
        )

        self._update_fill_style_enabled()
        self._refresh_from_cache()

    @staticmethod
    def _create_plot_widget() -> pg.PlotWidget:
        plot = pg.PlotWidget()
        plot.showGrid(x=True, y=True, alpha=0.2)
        plot.setLabel("bottom", "Receiver X (m)")
        plot.setLabel("left", "Time (s)")
        plot.invertY(True)
        plot.setMenuEnabled(False)
        return plot

    def _create_image_item(self) -> pg.ImageItem:
        image = pg.ImageItem()
        if hasattr(image, "setAutoDownsample"):
            image.setAutoDownsample(True)
        image.setLookupTable(self._seismic_lut)
        return image

    @staticmethod
    def _create_trace_marker() -> pg.InfiniteLine:
        return pg.InfiniteLine(angle=90, movable=False, pen=pg.mkPen("#f4d35e", width=2))

    @staticmethod
    def _create_hover_marker() -> pg.InfiniteLine:
        marker = pg.InfiniteLine(
            angle=90,
            movable=False,
            pen=pg.mkPen((56, 189, 248, 210), width=1.6, style=Qt.DashLine),
        )
        marker.setZValue(8.0)
        marker.setVisible(False)
        return marker

    def _multitrace_plots(self) -> list[pg.PlotWidget]:
        return [
            self.image_plot,
            self.main_wiggle_plot,
            self.detail_wiggle_plot,
            self.split_left_image_plot,
            self.split_right_image_plot,
            self.split_left_wiggle_plot,
            self.split_right_wiggle_plot,
        ]

    def _register_hover_tracking(self, plot: pg.PlotWidget) -> None:
        marker = self._create_hover_marker()
        plot.addItem(marker, ignoreBounds=True)
        self._hover_markers[id(plot)] = marker
        proxy = pg.SignalProxy(
            plot.scene().sigMouseMoved,
            rateLimit=45,
            slot=lambda args, plot=plot: self._on_plot_hovered(args, plot),
        )
        self._hover_signal_proxies.append(proxy)
        viewport = plot.viewport()
        viewport.setMouseTracking(True)
        viewport.installEventFilter(self)
        self._hover_viewports[id(viewport)] = plot

    def iter_plots(self) -> list[pg.PlotWidget]:
        return [
            self.image_plot,
            self.main_wiggle_plot,
            self.trace_plot,
            self.detail_wiggle_plot,
            self.split_left_image_plot,
            self.split_right_image_plot,
            self.split_left_wiggle_plot,
            self.split_right_wiggle_plot,
        ]

    def _coordinate_mode(self) -> str:
        return str(self.coordinate_mode_combo.currentData())

    def _layout_mode(self) -> str:
        return str(self.layout_mode_combo.currentData())

    def _display_mode(self) -> str:
        return str(self.display_mode_combo.currentData())

    def _fill_style(self) -> str:
        return str(self.fill_style_combo.currentData())

    def _signed_offset_available(self) -> bool:
        return self._source_x is not None and np.isfinite(self._source_x) and self._receiver_x.size > 0

    def _signed_offsets(self) -> np.ndarray:
        if not self._signed_offset_available():
            return np.zeros_like(self._receiver_x, dtype=np.float32)
        return (self._receiver_x - float(self._source_x)).astype(np.float32, copy=False)

    @staticmethod
    def _spread_duplicate_positions(values: np.ndarray) -> np.ndarray:
        positions = np.asarray(values, dtype=float).copy()
        if positions.size <= 1:
            return positions.astype(np.float32, copy=False)

        unique = np.unique(np.round(positions, 6))
        if unique.size > 1:
            spacing = float(np.median(np.diff(unique)))
        else:
            spacing = 1.0
        spacing = max(abs(spacing), 1.0)
        tol = 1e-6
        start = 0
        while start < positions.size:
            end = start + 1
            while end < positions.size and abs(positions[end] - positions[start]) <= tol:
                end += 1
            count = end - start
            if count > 1:
                offsets = np.linspace(-0.18 * spacing, 0.18 * spacing, count)
                positions[start:end] += offsets
            start = end
        return positions.astype(np.float32, copy=False)

    def _panel_data_from_indices(self, indices: np.ndarray, *, title_prefix: str) -> dict[str, object] | None:
        if self._records.size == 0 or self._time_axis.size == 0 or indices.size == 0:
            return None

        receiver_x = np.asarray(self._receiver_x[indices], dtype=np.float32)
        signed_offset = np.asarray(self._signed_offsets()[indices], dtype=np.float32)
        coordinate_mode = self._coordinate_mode()

        if coordinate_mode == "signed_offset" and self._signed_offset_available():
            order = np.argsort(signed_offset, kind="mergesort")
            display_values = signed_offset[order].astype(np.float32, copy=False)
            coordinate_desc = "Offset（有符号）"
        elif coordinate_mode == "abs_offset" and self._signed_offset_available():
            abs_offset = np.abs(signed_offset)
            order = np.lexsort((signed_offset, abs_offset))
            display_values = abs_offset[order].astype(np.float32, copy=False)
            coordinate_desc = "Offset（绝对值）"
            if indices.size == self._records.shape[1]:
                display_values = self._spread_duplicate_positions(display_values)
        else:
            order = np.argsort(receiver_x, kind="mergesort")
            display_values = receiver_x[order].astype(np.float32, copy=False)
            coordinate_desc = "Receiver X"

        ordered_indices = np.asarray(indices[order], dtype=int)
        selected_mask = ordered_indices == self._selected_trace_index
        selected_local = int(np.argmax(selected_mask)) if np.any(selected_mask) else None

        return {
            "indices": ordered_indices,
            "records": self._records[:, ordered_indices],
            "positions": display_values,
            "receiver_x": self._receiver_x[ordered_indices].astype(np.float32, copy=False),
            "signed_offset": self._signed_offsets()[ordered_indices].astype(np.float32, copy=False),
            "selected_local": selected_local,
            "title_prefix": title_prefix,
            "coordinate_desc": coordinate_desc,
        }

    def _overall_panel_data(self) -> dict[str, object] | None:
        return self._panel_data_from_indices(np.arange(self._records.shape[1], dtype=int), title_prefix=f"接收记录 - {self._component.upper()}")

    def _split_indices(self) -> tuple[np.ndarray, np.ndarray] | None:
        if not self._signed_offset_available():
            return None
        signed_offset = self._signed_offsets()
        tol = 1e-6
        left = np.flatnonzero(signed_offset < -tol)
        right = np.flatnonzero(signed_offset > tol)
        if left.size == 0 or right.size == 0:
            return None
        return left.astype(int, copy=False), right.astype(int, copy=False)

    def _split_panel_data(self, side: str) -> dict[str, object] | None:
        subsets = self._split_indices()
        if subsets is None:
            return None
        left, right = subsets
        if side == "left":
            return self._panel_data_from_indices(left, title_prefix=f"左侧接收记录 - {self._component.upper()}")
        return self._panel_data_from_indices(right, title_prefix=f"右侧接收记录 - {self._component.upper()}")

    def _coordinate_label(self) -> str:
        mode = self._coordinate_mode()
        if mode == "signed_offset" and self._signed_offset_available():
            return "Signed Offset (m)"
        if mode == "abs_offset" and self._signed_offset_available():
            return "|Offset| (m)"
        return "Receiver X (m)"

    def _render_signature(
        self,
        records: np.ndarray,
        time_axis: np.ndarray,
        receiver_x: np.ndarray,
        *,
        component: str,
        trace_index: int,
        source_x: float | None,
    ) -> tuple[object, ...]:
        time_size = int(time_axis.size)
        receiver_count = int(receiver_x.size)
        if time_size > 0:
            time_end = float(time_axis[-1])
        else:
            time_end = 0.0
        if receiver_count > 0:
            receiver_last = float(receiver_x[-1])
        else:
            receiver_last = 0.0
        return (
            int(records.shape[0]),
            int(records.shape[1]) if records.ndim == 2 else 0,
            time_size,
            receiver_count,
            round(time_end, 9),
            round(receiver_last, 6),
            component,
            int(trace_index),
            None if source_x is None else round(float(source_x), 6),
            self._coordinate_mode(),
            self._layout_mode(),
            self._display_mode(),
            self._fill_style(),
            int(self.detail_tabs.currentIndex()),
        )

    def _mode_info_text(self) -> str:
        coordinate_label = self.coordinate_mode_combo.currentText()
        layout_label = self.layout_mode_combo.currentText()
        display_label = self.display_mode_combo.currentText()
        fill_label = self.fill_style_combo.currentText() if self._display_mode() == "wiggle_va" else "无"
        info = f"坐标：{coordinate_label}；布局：{layout_label}；多道显示：{display_label}"
        if self._display_mode() == "wiggle_va":
            info += f"；填充：{fill_label}"
        info += "。"
        if self._coordinate_mode() != "receiver_x" and not self._signed_offset_available():
            info += " 当前未提供有效震源位置，已回退为 Receiver X。"
        if self._layout_mode() == "split" and self._split_indices() is None:
            info += " 当前无法左右分离，已回退为整体显示。"
        if self._coordinate_mode() == "abs_offset" and self._layout_mode() == "overall":
            info += " 绝对偏移距下左右对称道会按 |offset| 排序显示。"
        return info

    def _selected_fill_brushes(self) -> tuple[pg.mkBrush | None, pg.mkBrush | None]:
        style = self._fill_style()
        if style == "positive_color":
            return pg.mkBrush((59, 130, 246, 150)), None
        if style == "positive_mono":
            return pg.mkBrush((35, 35, 35, 210)), None
        if style == "posneg_color":
            return pg.mkBrush((244, 114, 182, 155)), pg.mkBrush((59, 130, 246, 145))
        return pg.mkBrush((248, 248, 248, 205)), pg.mkBrush((25, 25, 25, 215))

    @staticmethod
    def _highlight_fill_brushes(style: str) -> tuple[pg.mkBrush | None, pg.mkBrush | None]:
        if style == "positive_color":
            return pg.mkBrush((245, 158, 11, 170)), None
        if style == "positive_mono":
            return pg.mkBrush((10, 10, 10, 225)), None
        if style == "posneg_color":
            return pg.mkBrush((245, 158, 11, 185)), pg.mkBrush((34, 197, 94, 165))
        return pg.mkBrush((252, 252, 252, 225)), pg.mkBrush((5, 5, 5, 230))

    @staticmethod
    def _build_fill_path(
        x_values: np.ndarray,
        display_time: np.ndarray,
        x0: float,
        *,
        positive: bool,
    ) -> QPainterPath | None:
        x = np.asarray(x_values, dtype=float)
        y = np.asarray(display_time, dtype=float)
        if x.size < 2 or y.size != x.size:
            return None

        delta = x - float(x0)
        sign = 1.0 if positive else -1.0
        eps = 1e-12
        path = QPainterPath()
        current: list[tuple[float, float]] = []

        def emit_segment(points: list[tuple[float, float]]) -> None:
            if len(points) < 2:
                return
            path.moveTo(float(x0), float(points[0][1]))
            for px, py in points:
                path.lineTo(float(px), float(py))
            path.lineTo(float(x0), float(points[-1][1]))
            path.closeSubpath()

        for idx in range(x.size - 1):
            d0 = sign * delta[idx]
            d1 = sign * delta[idx + 1]
            inside0 = d0 > eps
            inside1 = d1 > eps

            if inside0 and not current:
                current = [(float(x[idx]), float(y[idx]))]

            if inside0 and inside1:
                if not current:
                    current = [(float(x[idx]), float(y[idx]))]
                current.append((float(x[idx + 1]), float(y[idx + 1])))
                continue

            crossed = (d0 > eps and d1 <= eps) or (d0 <= eps and d1 > eps)
            if crossed:
                denom = delta[idx + 1] - delta[idx]
                if abs(denom) <= eps:
                    frac = 0.5
                else:
                    frac = float(np.clip((x0 - x[idx]) / denom, 0.0, 1.0))
                cross_y = float(y[idx] + frac * (y[idx + 1] - y[idx]))
                cross_point = (float(x0), cross_y)

                if inside0:
                    if not current:
                        current = [(float(x[idx]), float(y[idx]))]
                    current.append(cross_point)
                    emit_segment(current)
                    current = []
                elif inside1:
                    current = [cross_point, (float(x[idx + 1]), float(y[idx + 1]))]

        if current:
            emit_segment(current)

        return None if path.isEmpty() else path

    @staticmethod
    def _make_fill_item(path: QPainterPath, brush) -> QGraphicsPathItem:
        item = QGraphicsPathItem(path)
        item.setPen(pg.mkPen(None))
        item.setBrush(brush)
        item.setZValue(2.0)
        return item

    def _wiggle_pen(self, *, is_selected: bool) -> pg.QtGui.QPen:
        if is_selected:
            return pg.mkPen("#f59e0b", width=2.0)
        if self._display_mode() == "wiggle_va" and self._fill_style() in {"positive_mono", "posneg_mono"}:
            return pg.mkPen((20, 20, 20, 235), width=1.0)
        return pg.mkPen("#2563eb" if self._display_mode() == "wiggle_va" else "#60a5fa", width=1.0 if self._display_mode() == "wiggle_va" else 0.9)

    def _update_fill_style_enabled(self) -> None:
        self.fill_style_combo.setEnabled(self._display_mode() == "wiggle_va")

    def _set_plot_click_targets(
        self,
        plot: pg.PlotWidget,
        positions: np.ndarray | list[float],
        indices: np.ndarray | list[int],
    ) -> None:
        pos = np.asarray(positions, dtype=np.float32).reshape(-1)
        idx = np.asarray(indices, dtype=np.int32).reshape(-1)
        if pos.size == 0 or idx.size == 0 or pos.size != idx.size:
            self._plot_click_targets.pop(id(plot), None)
            marker = self._hover_markers.get(id(plot))
            if marker is not None:
                marker.setVisible(False)
            return
        self._plot_click_targets[id(plot)] = (pos, idx)

    def _find_nearest_target(self, plot: pg.PlotWidget, x_value: float) -> tuple[float, int] | None:
        click_targets = self._plot_click_targets.get(id(plot))
        if click_targets is None:
            return None
        positions = np.asarray(click_targets[0], dtype=float)
        indices = np.asarray(click_targets[1], dtype=int)
        if positions.size == 0 or indices.size != positions.size:
            return None

        insert = int(np.searchsorted(positions, float(x_value), side="left"))
        if insert <= 0:
            nearest = 0
        elif insert >= positions.size:
            nearest = positions.size - 1
        else:
            left = insert - 1
            right = insert
            nearest = left if abs(float(x_value) - positions[left]) <= abs(positions[right] - float(x_value)) else right
        return float(positions[nearest]), int(indices[nearest])

    def _hide_hover_markers(self, except_plot: pg.PlotWidget | None = None) -> None:
        keep_id = id(except_plot) if except_plot is not None else None
        for plot_id, marker in self._hover_markers.items():
            if keep_id is not None and plot_id == keep_id:
                continue
            marker.setVisible(False)

    def _on_plot_hovered(self, args, plot: pg.PlotWidget) -> None:
        if not args:
            return
        scene_pos = args[0]
        if scene_pos is None or not plot.sceneBoundingRect().contains(scene_pos):
            marker = self._hover_markers.get(id(plot))
            if marker is not None:
                marker.setVisible(False)
            return
        mouse_point = plot.getPlotItem().vb.mapSceneToView(scene_pos)
        nearest = self._find_nearest_target(plot, float(mouse_point.x()))
        marker = self._hover_markers.get(id(plot))
        if marker is None or nearest is None:
            return
        self._hide_hover_markers(except_plot=plot)
        marker.setVisible(True)
        marker.setValue(nearest[0])

    def _on_plot_clicked(self, event, plot: pg.PlotWidget, panel_data: dict[str, object] | None) -> None:
        if panel_data is None:
            return
        if not plot.sceneBoundingRect().contains(event.scenePos()):
            return
        mouse_point = plot.getPlotItem().vb.mapSceneToView(event.scenePos())
        nearest = self._find_nearest_target(plot, float(mouse_point.x()))
        if nearest is None:
            positions = np.asarray(panel_data["positions"], dtype=float)
            indices = np.asarray(panel_data["indices"], dtype=int)
            if positions.size == 0:
                return
            local_index = int(np.argmin(np.abs(positions - float(mouse_point.x()))))
            self.trace_selected.emit(int(indices[local_index]))
            return
        marker = self._hover_markers.get(id(plot))
        if marker is not None:
            marker.setVisible(True)
            marker.setValue(nearest[0])
        self.trace_selected.emit(nearest[1])

    def eventFilter(self, watched, event) -> bool:
        plot = self._hover_viewports.get(id(watched))
        if plot is not None and event.type() in {QEvent.Type.Leave, QEvent.Type.Hide}:
            marker = self._hover_markers.get(id(plot))
            if marker is not None:
                marker.setVisible(False)
        return super().eventFilter(watched, event)

    @staticmethod
    def _clear_items(plot: pg.PlotWidget, items: list[object]) -> None:
        for item in items:
            plot.removeItem(item)
        items.clear()

    def _prepare_image_display(self, records: np.ndarray) -> tuple[np.ndarray, float]:
        display = np.asarray(records, dtype=np.float32).copy()
        if display.size == 0:
            return display, 1.0

        display -= np.mean(display, axis=0, keepdims=True)
        abs_display = np.abs(display)

        global_ref = float(np.percentile(abs_display, 99.5))
        if not np.isfinite(global_ref) or global_ref <= 0.0:
            global_ref = float(np.max(abs_display))
        global_ref = max(global_ref, 1e-12)

        trace_ref = np.percentile(abs_display, 99.0, axis=0, keepdims=True)
        trace_floor = max(global_ref * 0.18, 1e-12)
        scale = np.maximum(trace_ref, trace_floor)
        display /= scale
        np.clip(display, -9.0, 9.0, out=display)
        display = np.sign(display) * np.sqrt(np.abs(display))

        vmax = float(np.percentile(np.abs(display), 99.2))
        if not np.isfinite(vmax) or vmax <= 0.0:
            vmax = float(np.max(np.abs(display)))
        vmax = max(vmax, 1.0)
        return display, vmax

    def _update_image_panel(
        self,
        plot: pg.PlotWidget,
        image: pg.ImageItem,
        marker: pg.InfiniteLine,
        panel_data: dict[str, object] | None,
        *,
        title_suffix: str,
    ) -> None:
        if panel_data is None:
            self._set_plot_click_targets(plot, [], [])
            image.setImage(np.zeros((2, 2), dtype=np.float32), autoLevels=False)
            image.setRect(QRectF(0.0, 0.0, 1.0, 1.0))
            image.setLevels((-1.0, 1.0))
            marker.setVisible(False)
            plot.setTitle(f"{title_suffix}（暂无数据）")
            return

        records = np.asarray(panel_data["records"], dtype=np.float32)
        positions = np.asarray(panel_data["positions"], dtype=np.float32)
        time_stride = max(1, int(np.ceil(records.shape[0] / self._max_image_time_samples)))
        receiver_stride = max(1, int(np.ceil(records.shape[1] / self._max_image_receiver_samples)))
        display_records, vmax = self._prepare_image_display(records[::time_stride, ::receiver_stride])
        display_indices = np.asarray(panel_data["indices"], dtype=int)[::receiver_stride]
        display_positions = positions[::receiver_stride]
        self._set_plot_click_targets(plot, display_positions, display_indices)
        xmin = float(np.min(positions))
        xmax = float(np.max(positions))
        tmin = float(np.min(self._time_axis))
        tmax = float(np.max(self._time_axis)) if self._time_axis.size > 1 else tmin + 1.0
        image.setImage(display_records, autoLevels=False)
        image.setRect(QRectF(xmin, tmin, max(xmax - xmin, 1.0), max(tmax - tmin, 1e-6)))
        image.setLevels((-vmax, vmax))

        selected_local = panel_data["selected_local"]
        if selected_local is None:
            marker.setVisible(False)
        else:
            marker.setVisible(True)
            marker.setValue(float(positions[int(selected_local)]))

        plot.setTitle(f"{title_suffix}（变密度，白心色标 + 道平衡增强）")

    def _plot_wiggle_trace(
        self,
        plot: pg.PlotWidget,
        store: list[object],
        x0: float,
        x_values: np.ndarray,
        display_time: np.ndarray,
        *,
        is_selected: bool,
    ) -> None:
        zero_line = pg.InfiniteLine(
            pos=x0,
            angle=90,
            movable=False,
            pen=pg.mkPen((148, 163, 184, 65), width=1),
        )
        plot.addItem(zero_line, ignoreBounds=True)
        store.append(zero_line)

        if self._display_mode() == "wiggle_va":
            style = self._fill_style()
            pos_brush, neg_brush = self._highlight_fill_brushes(style) if is_selected else self._selected_fill_brushes()

            if pos_brush is not None:
                positive_path = self._build_fill_path(x_values, display_time, x0, positive=True)
                if positive_path is not None:
                    pos_fill = self._make_fill_item(positive_path, pos_brush)
                    plot.addItem(pos_fill)
                    store.append(pos_fill)

            if neg_brush is not None:
                negative_path = self._build_fill_path(x_values, display_time, x0, positive=False)
                if negative_path is not None:
                    neg_fill = self._make_fill_item(negative_path, neg_brush)
                    plot.addItem(neg_fill)
                    store.append(neg_fill)

        curve = plot.plot(
            x_values,
            display_time,
            pen=self._wiggle_pen(is_selected=is_selected),
        )
        curve.setZValue(4.0)
        store.append(curve)

    def _update_wiggle_panel(
        self,
        plot: pg.PlotWidget,
        store: list[object],
        panel_data: dict[str, object] | None,
        *,
        title_suffix: str,
    ) -> None:
        self._clear_items(plot, store)
        if panel_data is None:
            self._set_plot_click_targets(plot, [], [])
            plot.setTitle(f"{title_suffix}（暂无数据）")
            return

        records = np.asarray(panel_data["records"], dtype=np.float32)
        positions = np.asarray(panel_data["positions"], dtype=np.float32)
        selected_local = panel_data["selected_local"]
        time_stride = max(1, int(np.ceil(self._time_axis.size / self._max_wiggle_time_samples)))
        display_time = self._time_axis[::time_stride]
        trace_stride = max(1, int(np.ceil(records.shape[1] / self._max_wiggle_traces)))
        display_locals = np.arange(0, records.shape[1], trace_stride, dtype=int)
        if selected_local is not None and selected_local not in display_locals:
            display_locals = np.sort(np.unique(np.append(display_locals, selected_local)))
        click_positions = positions[display_locals]
        click_indices = np.asarray(panel_data["indices"], dtype=int)[display_locals]
        self._set_plot_click_targets(plot, click_positions, click_indices)

        if positions.size > 1:
            spacing = float(np.median(np.diff(np.sort(positions))))
        else:
            spacing = 1.0
        spacing = max(abs(spacing), 1.0)

        max_abs = float(np.max(np.abs(records[:, display_locals])))
        if max_abs <= 0.0:
            max_abs = 1.0
        scale = (0.58 if self._display_mode() == "wiggle_va" else 0.42) * spacing / max_abs

        for local_idx in display_locals:
            x0 = float(positions[local_idx])
            trace = records[::time_stride, local_idx]
            x_values = x0 + trace * scale
            self._plot_wiggle_trace(
                plot,
                store,
                x0,
                x_values,
                display_time,
                is_selected=selected_local is not None and local_idx == selected_local,
            )

        mode_label = "摆动+变面积" if self._display_mode() == "wiggle_va" else "摆动"
        plot.setTitle(f"{title_suffix}（{mode_label}，共显示 {display_locals.size} 道，点击可切换单道）")

    def _update_trace_plot(self) -> None:
        if self._records.size == 0 or self._time_axis.size == 0 or self._receiver_x.size == 0:
            self.trace_curve.setData([], [])
            self.trace_plot.setTitle("单道波形（暂无数据）")
            return

        trace_stride = max(1, int(np.ceil(self._time_axis.size / self._max_trace_samples)))
        self.trace_curve.setData(
            self._time_axis[::trace_stride],
            self._records[::trace_stride, self._selected_trace_index],
        )

        receiver_x = float(self._receiver_x[self._selected_trace_index])
        if self._signed_offset_available():
            signed_offset = float(self._signed_offsets()[self._selected_trace_index])
            abs_offset = abs(signed_offset)
            self.trace_plot.setTitle(
                f"单道波形 - 第 {self._selected_trace_index + 1} 道（x={receiver_x:.2f} m, "
                f"offset={signed_offset:.2f} m, |offset|={abs_offset:.2f} m）"
            )
        else:
            self.trace_plot.setTitle(f"单道波形 - 第 {self._selected_trace_index + 1} 道（x={receiver_x:.2f} m）")

    def _sync_axis_labels(self) -> None:
        label = self._coordinate_label()
        for plot in self.iter_plots():
            if plot is self.trace_plot:
                continue
            plot.setLabel("bottom", label)
            plot.setLabel("left", "Time (s)")
        self.mode_info_label.setText(self._mode_info_text())

    def _refresh_multitrace_panels(self) -> None:
        overall_data = None
        left_data = None
        right_data = None
        split_available = self._split_indices() is not None

        display_mode = self._display_mode()
        if self._layout_mode() == "split" and split_available:
            if display_mode == "image":
                if left_data is None:
                    left_data = self._split_panel_data("left")
                if right_data is None:
                    right_data = self._split_panel_data("right")
                self._update_image_panel(
                    self.split_left_image_plot,
                    self.split_left_image,
                    self.split_left_marker,
                    left_data,
                    title_suffix=f"Left Records - {self._component.upper()}",
                )
                self._update_image_panel(
                    self.split_right_image_plot,
                    self.split_right_image,
                    self.split_right_marker,
                    right_data,
                    title_suffix=f"Right Records - {self._component.upper()}",
                )
                self.multi_trace_stack.setCurrentIndex(2)
            else:
                if left_data is None:
                    left_data = self._split_panel_data("left")
                if right_data is None:
                    right_data = self._split_panel_data("right")
                self._update_wiggle_panel(
                    self.split_left_wiggle_plot,
                    self._split_left_wiggle_items,
                    left_data,
                    title_suffix=f"Left Records - {self._component.upper()}",
                )
                self._update_wiggle_panel(
                    self.split_right_wiggle_plot,
                    self._split_right_wiggle_items,
                    right_data,
                    title_suffix=f"Right Records - {self._component.upper()}",
                )
                self.multi_trace_stack.setCurrentIndex(3)
        else:
            if overall_data is None:
                overall_data = self._overall_panel_data()
            if display_mode == "image":
                self._update_image_panel(
                    self.image_plot,
                    self.image,
                    self.trace_marker,
                    overall_data,
                    title_suffix=f"Records - {self._component.upper()}",
                )
                self.multi_trace_stack.setCurrentIndex(0)
            else:
                self._update_wiggle_panel(
                    self.main_wiggle_plot,
                    self._main_wiggle_items,
                    overall_data,
                    title_suffix=f"Records - {self._component.upper()}",
                )
                self.multi_trace_stack.setCurrentIndex(1)

    def _refresh_detail_panel(self) -> None:
        if self.detail_tabs.currentWidget() is self.trace_plot:
            self._update_trace_plot()
            return
        overall_data = self._overall_panel_data()
        self._update_wiggle_panel(
            self.detail_wiggle_plot,
            self._detail_wiggle_items,
            overall_data,
            title_suffix="Auxiliary Wiggle",
        )

    def _refresh_from_cache(self) -> None:
        if self._records.ndim == 2 and self._records.shape[1] > 0:
            self._selected_trace_index = int(np.clip(self._selected_trace_index, 0, self._records.shape[1] - 1))
        else:
            self._selected_trace_index = 0
        self._update_fill_style_enabled()
        self._sync_axis_labels()
        self._refresh_multitrace_panels()
        self._refresh_detail_panel()

    def _on_mode_changed(self) -> None:
        self._last_render_signature = None
        self._refresh_from_cache()

    def reset_view(self) -> None:
        for plot in self.iter_plots():
            plot.enableAutoRange()

    def update_records(
        self,
        records: np.ndarray,
        time_axis: np.ndarray,
        receiver_x: np.ndarray,
        component: str,
        trace_index: int,
        *,
        source_x: float | None = None,
    ) -> None:
        if records.size == 0 or time_axis.size == 0:
            return

        records_arr = np.asarray(records, dtype=np.float32)
        time_axis_arr = np.asarray(time_axis, dtype=np.float32)
        receiver_x_arr = np.asarray(receiver_x, dtype=np.float32)
        clamped_trace_index = int(np.clip(trace_index, 0, records_arr.shape[1] - 1))
        new_signature = self._render_signature(
            records_arr,
            time_axis_arr,
            receiver_x_arr,
            component=component,
            trace_index=clamped_trace_index,
            source_x=source_x,
        )
        if self._last_render_signature == new_signature:
            return

        self._records = records_arr
        self._time_axis = time_axis_arr
        self._receiver_x = receiver_x_arr
        self._source_x = None if source_x is None else float(source_x)
        self._component = component
        self._selected_trace_index = clamped_trace_index
        self._last_render_signature = new_signature
        self._refresh_from_cache()
