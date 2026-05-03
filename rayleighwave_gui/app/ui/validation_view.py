from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import QRectF, QThread, Qt, Signal
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QDoubleSpinBox,
    QFileDialog,
    QFormLayout,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSpinBox,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from app.analysis.dispersion import compute_phase_velocity_spectrum, pick_peak_curve
from app.analysis.validation import build_validation_project, compute_record_metrics, trim_records_to_common_shape
from app.io.export import export_records_csv, export_records_npz
from app.physics.solver import ElasticWaveSolver
from app.types import ProjectConfig
from app.ui.seismogram_view import SEISMIC_WHITE_CENTER_GRADIENT

ENERGY_GRADIENT = {
    "mode": "rgb",
    "ticks": [
        (0.00, (68, 1, 84, 255)),
        (0.25, (59, 82, 139, 255)),
        (0.50, (33, 145, 140, 255)),
        (0.75, (94, 201, 98, 255)),
        (1.00, (253, 231, 37, 255)),
    ],
}


class ForwardValidationWorker(QThread):
    status_message = Signal(str)
    finished_successfully = Signal(object)
    failed = Signal(str)

    def __init__(self, project: ProjectConfig) -> None:
        super().__init__()
        self.project = project
        self._stop_requested = False

    def request_stop(self) -> None:
        self._stop_requested = True

    def run(self) -> None:
        try:
            solver = ElasticWaveSolver(self.project)
            self.status_message.emit(f"回代正演开始…（后端：{solver.backend_name}）")
            progress_interval = max(1, solver.nt // 10)

            while solver.has_next_step():
                if self._stop_requested:
                    self.status_message.emit("回代正演已停止。")
                    self.finished_successfully.emit(solver.finalize(stopped=True))
                    return
                solver.step()
                if solver.current_step % progress_interval == 0:
                    ratio = solver.current_step / max(solver.nt, 1)
                    self.status_message.emit(f"回代正演进度：{ratio:.0%}")

            self.status_message.emit("回代正演完成。")
            self.finished_successfully.emit(solver.finalize(stopped=False))
        except Exception as exc:  # pragma: no cover - GUI thread fallback
            self.failed.emit(str(exc))


class ValidationView(QWidget):
    status_message = Signal(str)
    trace_selected = Signal(int)

    def __init__(self, output_dir: str | Path, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.output_dir = Path(output_dir)

        self.project: ProjectConfig | None = None
        self.inversion_result: dict[str, object] | None = None
        self.validation_result: dict[str, object] | None = None
        self.worker: ForwardValidationWorker | None = None

        self.observed_records_vx = np.empty((0, 0), dtype=np.float32)
        self.observed_records_vz = np.empty((0, 0), dtype=np.float32)
        self.observed_time = np.empty(0, dtype=np.float32)
        self.receiver_x = np.empty(0, dtype=np.float32)
        self.receiver_z = np.empty(0, dtype=np.float32)
        self.selected_trace_index = 0
        self._display_receiver_x = np.empty(0, dtype=np.float32)

        self.observed_curve = np.empty((0, 2), dtype=np.float32)
        self.observed_curve_component: str | None = None

        self.dispersion_freq_axis = np.empty(0, dtype=np.float32)
        self.dispersion_velocity_axis = np.empty(0, dtype=np.float32)
        self.observed_dispersion_energy = np.empty((0, 0), dtype=np.float32)
        self.synthetic_dispersion_energy = np.empty((0, 0), dtype=np.float32)
        self.residual_dispersion_energy = np.empty((0, 0), dtype=np.float32)
        self.observed_peak_curve = np.empty((0, 2), dtype=np.float32)
        self.synthetic_peak_curve = np.empty((0, 2), dtype=np.float32)
        self.dispersion_component: str | None = None

        self._max_image_time_samples = 720
        self._max_image_receiver_samples = 240
        self._max_trace_samples = 3200
        self._seismic_lut = pg.ColorMap(
            [tick[0] for tick in SEISMIC_WHITE_CENTER_GRADIENT["ticks"]],
            [tick[1] for tick in SEISMIC_WHITE_CENTER_GRADIENT["ticks"]],
        ).getLookupTable(0.0, 1.0, 256)
        self._energy_lut = pg.ColorMap(
            [tick[0] for tick in ENERGY_GRADIENT["ticks"]],
            [tick[1] for tick in ENERGY_GRADIENT["ticks"]],
        ).getLookupTable(0.0, 1.0, 256)

        self._build_ui()
        self._update_state_labels()
        self._refresh_plots()
        self._update_buttons()

    @staticmethod
    def _make_double_spin(minimum: float, maximum: float, value: float, decimals: int = 1) -> QDoubleSpinBox:
        widget = QDoubleSpinBox()
        widget.setRange(minimum, maximum)
        widget.setDecimals(decimals)
        widget.setValue(value)
        widget.setSingleStep(10 ** (-max(decimals - 1, 0)))
        return widget

    @staticmethod
    def _make_int_spin(minimum: int, maximum: int, value: int) -> QSpinBox:
        widget = QSpinBox()
        widget.setRange(minimum, maximum)
        widget.setValue(value)
        return widget

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        controls_group = QGroupBox("回代正演验证")
        controls_layout = QHBoxLayout(controls_group)
        controls_layout.addWidget(QLabel("显示分量"))
        self.component_combo = QComboBox()
        self.component_combo.addItems(["Vz", "Vx"])
        controls_layout.addWidget(self.component_combo)
        controls_layout.addSpacing(12)
        controls_layout.addWidget(QLabel("当前道"))
        self.trace_spin = self._make_int_spin(1, 1, 1)
        self.trace_spin.setSingleStep(1)
        self.trace_spin.setMinimumWidth(90)
        controls_layout.addWidget(self.trace_spin)
        self.run_button = QPushButton("运行回代正演")
        self.stop_button = QPushButton("停止验证")
        self.compute_dispersion_button = QPushButton("计算频散对比")
        self.export_button = QPushButton("导出验证结果")
        controls_layout.addWidget(self.run_button)
        controls_layout.addWidget(self.stop_button)
        controls_layout.addWidget(self.compute_dispersion_button)
        controls_layout.addWidget(self.export_button)
        controls_layout.addStretch(1)

        info_group = QGroupBox("验证信息")
        info_layout = QGridLayout(info_group)

        state_box = QGroupBox("数据状态")
        state_form = QFormLayout(state_box)
        self.project_info_label = QLabel("暂无模型")
        self.project_info_label.setWordWrap(True)
        self.inversion_info_label = QLabel("暂无反演结果")
        self.inversion_info_label.setWordWrap(True)
        self.observed_info_label = QLabel("暂无观测记录")
        self.observed_info_label.setWordWrap(True)
        self.validation_info_label = QLabel("请先完成正演、频散拾取与反演，再运行回代正演。")
        self.validation_info_label.setWordWrap(True)
        self.dispersion_info_label = QLabel("尚未计算观测/回代频散对比。")
        self.dispersion_info_label.setWordWrap(True)
        state_form.addRow("当前模型", self.project_info_label)
        state_form.addRow("当前反演", self.inversion_info_label)
        state_form.addRow("观测记录", self.observed_info_label)
        state_form.addRow("验证状态", self.validation_info_label)
        state_form.addRow("频散对比", self.dispersion_info_label)

        metric_box = QGroupBox("拟合指标")
        metric_form = QFormLayout(metric_box)
        self.nrms_label = QLabel("--")
        self.corr_label = QLabel("--")
        self.energy_ratio_label = QLabel("--")
        self.peak_ratio_label = QLabel("--")
        self.trace_nrms_label = QLabel("--")
        self.trace_corr_label = QLabel("--")
        metric_form.addRow("整体 NRMS", self.nrms_label)
        metric_form.addRow("整体相关系数", self.corr_label)
        metric_form.addRow("能量比", self.energy_ratio_label)
        metric_form.addRow("峰值比", self.peak_ratio_label)
        metric_form.addRow("单道 NRMS", self.trace_nrms_label)
        metric_form.addRow("单道相关系数", self.trace_corr_label)

        info_layout.addWidget(state_box, 0, 0)
        info_layout.addWidget(metric_box, 0, 1)

        records_tab = QWidget()
        records_layout = QVBoxLayout(records_tab)
        records_layout.setContentsMargins(0, 0, 0, 0)
        self.observed_plot, self.observed_image, self.observed_marker = self._create_record_panel("观测接收记录")
        self.synthetic_plot, self.synthetic_image, self.synthetic_marker = self._create_record_panel("回代合成记录")
        self.residual_plot, self.residual_image, self.residual_marker = self._create_record_panel("残差记录（合成 - 观测）")

        self.trace_plot = pg.PlotWidget()
        self.trace_plot.showGrid(x=True, y=True, alpha=0.22)
        self.trace_plot.setLabel("bottom", "Time (s)")
        self.trace_plot.setLabel("left", "Amplitude")
        self.trace_plot.setMenuEnabled(False)
        self.trace_plot.setTitle("单道对比")
        self.trace_plot.addLegend()
        self.observed_trace_curve = self.trace_plot.plot(pen=pg.mkPen("#38bdf8", width=1.6), name="观测")
        self.synthetic_trace_curve = self.trace_plot.plot(pen=pg.mkPen("#f97316", width=1.6), name="回代")
        self.residual_trace_curve = self.trace_plot.plot(
            pen=pg.mkPen("#ef4444", width=1.1, style=Qt.DashLine),
            name="残差",
        )

        record_grid = QGridLayout()
        record_grid.addWidget(self.observed_plot, 0, 0)
        record_grid.addWidget(self.synthetic_plot, 0, 1)
        record_grid.addWidget(self.residual_plot, 1, 0)
        record_grid.addWidget(self.trace_plot, 1, 1)
        records_layout.addLayout(record_grid, 1)

        dispersion_tab = QWidget()
        dispersion_layout = QVBoxLayout(dispersion_tab)
        dispersion_layout.setContentsMargins(0, 0, 0, 0)

        dispersion_controls_group = QGroupBox("频散对比参数")
        dispersion_controls_layout = QGridLayout(dispersion_controls_group)
        self.velocity_min_spin = self._make_double_spin(10.0, 10000.0, 80.0, 1)
        self.velocity_max_spin = self._make_double_spin(20.0, 12000.0, 1500.0, 1)
        self.velocity_count_spin = self._make_int_spin(16, 1200, 181)
        self.freq_min_spin = self._make_double_spin(0.0, 500.0, 2.0, 1)
        self.freq_max_spin = self._make_double_spin(0.5, 1000.0, 60.0, 1)
        self.max_pick_points_spin = self._make_int_spin(8, 200, 36)
        self.normalize_check = QCheckBox("按频率归一化各道相位")
        self.normalize_check.setChecked(True)

        dispersion_controls_layout.addWidget(QLabel("速度最小值 (m/s)"), 0, 0)
        dispersion_controls_layout.addWidget(self.velocity_min_spin, 0, 1)
        dispersion_controls_layout.addWidget(QLabel("速度最大值 (m/s)"), 0, 2)
        dispersion_controls_layout.addWidget(self.velocity_max_spin, 0, 3)
        dispersion_controls_layout.addWidget(QLabel("速度采样数"), 0, 4)
        dispersion_controls_layout.addWidget(self.velocity_count_spin, 0, 5)
        dispersion_controls_layout.addWidget(QLabel("频率最小值 (Hz)"), 1, 0)
        dispersion_controls_layout.addWidget(self.freq_min_spin, 1, 1)
        dispersion_controls_layout.addWidget(QLabel("频率最大值 (Hz)"), 1, 2)
        dispersion_controls_layout.addWidget(self.freq_max_spin, 1, 3)
        dispersion_controls_layout.addWidget(QLabel("自动峰值点数"), 1, 4)
        dispersion_controls_layout.addWidget(self.max_pick_points_spin, 1, 5)
        dispersion_controls_layout.addWidget(self.normalize_check, 2, 0, 1, 3)

        self.observed_dispersion_plot, self.observed_dispersion_image = self._create_dispersion_panel("观测频散能量")
        self.synthetic_dispersion_plot, self.synthetic_dispersion_image = self._create_dispersion_panel("回代频散能量")
        self.residual_dispersion_plot, self.residual_dispersion_image = self._create_dispersion_panel("频散差异（回代 - 观测）", signed=True)

        self.curve_compare_plot = pg.PlotWidget()
        self.curve_compare_plot.showGrid(x=True, y=True, alpha=0.2)
        self.curve_compare_plot.setLabel("bottom", "Frequency (Hz)")
        self.curve_compare_plot.setLabel("left", "Phase Velocity (m/s)")
        self.curve_compare_plot.setMenuEnabled(False)
        self.curve_compare_plot.setTitle("频散曲线对比")
        self.curve_compare_plot.addLegend()
        self.manual_curve_scatter = pg.ScatterPlotItem(
            size=8,
            symbol="o",
            brush=pg.mkBrush("#fde047"),
            pen=pg.mkPen("#92400e", width=1.0),
            name="观测手动拾取",
        )
        self.observed_peak_item = self.curve_compare_plot.plot(
            pen=pg.mkPen("#38bdf8", width=1.5, style=Qt.DashLine),
            name="观测能量峰值",
        )
        self.synthetic_peak_item = self.curve_compare_plot.plot(
            pen=pg.mkPen("#f97316", width=1.8),
            name="回代能量峰值",
        )
        self.predicted_curve_item = self.curve_compare_plot.plot(
            pen=pg.mkPen("#22c55e", width=1.8),
            name="反演预测曲线",
        )
        self.curve_compare_plot.addItem(self.manual_curve_scatter)

        dispersion_grid = QGridLayout()
        dispersion_grid.addWidget(self.observed_dispersion_plot, 0, 0)
        dispersion_grid.addWidget(self.synthetic_dispersion_plot, 0, 1)
        dispersion_grid.addWidget(self.residual_dispersion_plot, 1, 0)
        dispersion_grid.addWidget(self.curve_compare_plot, 1, 1)

        dispersion_layout.addWidget(dispersion_controls_group)
        dispersion_layout.addLayout(dispersion_grid, 1)

        self.tabs = QTabWidget()
        self.tabs.addTab(records_tab, "记录对比")
        self.tabs.addTab(dispersion_tab, "频散对比")

        layout.addWidget(controls_group)
        layout.addWidget(info_group)
        layout.addWidget(self.tabs, 1)

        self.component_combo.currentTextChanged.connect(self._on_component_changed)
        self.trace_spin.valueChanged.connect(self._on_trace_spin_changed)
        self.run_button.clicked.connect(self.run_validation)
        self.stop_button.clicked.connect(self.stop_validation)
        self.compute_dispersion_button.clicked.connect(self.compute_dispersion_comparison)
        self.export_button.clicked.connect(self.export_validation_result)
        self.observed_plot.scene().sigMouseClicked.connect(lambda event: self._on_record_plot_clicked(event, self.observed_plot))
        self.synthetic_plot.scene().sigMouseClicked.connect(lambda event: self._on_record_plot_clicked(event, self.synthetic_plot))
        self.residual_plot.scene().sigMouseClicked.connect(lambda event: self._on_record_plot_clicked(event, self.residual_plot))

    def _create_record_panel(self, title: str) -> tuple[pg.PlotWidget, pg.ImageItem, pg.InfiniteLine]:
        plot = pg.PlotWidget()
        plot.showGrid(x=True, y=True, alpha=0.2)
        plot.setLabel("bottom", "Receiver X (m)")
        plot.setLabel("left", "Time (s)")
        plot.invertY(True)
        plot.setMenuEnabled(False)
        plot.setTitle(title)

        image = pg.ImageItem()
        if hasattr(image, "setAutoDownsample"):
            image.setAutoDownsample(True)
        image.setLookupTable(self._seismic_lut)
        plot.addItem(image)

        marker = pg.InfiniteLine(angle=90, movable=False, pen=pg.mkPen("#f4d35e", width=2))
        plot.addItem(marker, ignoreBounds=True)
        return plot, image, marker

    def _create_dispersion_panel(self, title: str, *, signed: bool = False) -> tuple[pg.PlotWidget, pg.ImageItem]:
        plot = pg.PlotWidget()
        plot.showGrid(x=True, y=True, alpha=0.2)
        plot.setLabel("bottom", "Frequency (Hz)")
        plot.setLabel("left", "Phase Velocity (m/s)")
        plot.setMenuEnabled(False)
        plot.setTitle(title)

        image = pg.ImageItem()
        if hasattr(image, "setAutoDownsample"):
            image.setAutoDownsample(True)
        image.setLookupTable(self._seismic_lut if signed else self._energy_lut)
        plot.addItem(image)
        return plot, image

    def _selected_component(self) -> str:
        return "vz" if self.component_combo.currentText() == "Vz" else "vx"

    def _observed_component_records(self) -> np.ndarray:
        return self.observed_records_vz if self._selected_component() == "vz" else self.observed_records_vx

    def _synthetic_component_records(self) -> np.ndarray:
        if self.validation_result is None:
            return np.empty((0, 0), dtype=np.float32)
        key = "records_vz" if self._selected_component() == "vz" else "records_vx"
        return np.asarray(self.validation_result.get(key, np.empty((0, 0), dtype=np.float32)), dtype=np.float32)

    def _has_dispersion_comparison(self) -> bool:
        return (
            self.dispersion_freq_axis.size > 0
            and self.dispersion_velocity_axis.size > 0
            and self.observed_dispersion_energy.size > 0
            and self.synthetic_dispersion_energy.size > 0
        )

    def _clear_dispersion_comparison(self) -> None:
        self.dispersion_freq_axis = np.empty(0, dtype=np.float32)
        self.dispersion_velocity_axis = np.empty(0, dtype=np.float32)
        self.observed_dispersion_energy = np.empty((0, 0), dtype=np.float32)
        self.synthetic_dispersion_energy = np.empty((0, 0), dtype=np.float32)
        self.residual_dispersion_energy = np.empty((0, 0), dtype=np.float32)
        self.observed_peak_curve = np.empty((0, 2), dtype=np.float32)
        self.synthetic_peak_curve = np.empty((0, 2), dtype=np.float32)
        self.dispersion_component = None

    def _active_manual_curve(self) -> np.ndarray:
        if self.observed_curve.size == 0:
            return np.empty((0, 2), dtype=np.float32)
        if self.observed_curve_component is None or self.observed_curve_component == self._selected_component():
            return self.observed_curve
        return np.empty((0, 2), dtype=np.float32)

    def _predicted_curve(self) -> np.ndarray:
        manual_curve = self._active_manual_curve()
        if manual_curve.size == 0 or self.inversion_result is None:
            return np.empty((0, 2), dtype=np.float32)
        best_curve = np.asarray(self.inversion_result.get("best_curve", []), dtype=np.float32).reshape(-1)
        if best_curve.size != manual_curve.shape[0]:
            return np.empty((0, 2), dtype=np.float32)
        return np.column_stack((manual_curve[:, 0], best_curve)).astype(np.float32, copy=False)

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

    def _set_record_image(
        self,
        plot: pg.PlotWidget,
        image: pg.ImageItem,
        marker: pg.InfiniteLine,
        records: np.ndarray,
        time_axis: np.ndarray,
        receiver_x: np.ndarray,
        title: str,
    ) -> None:
        if records.size == 0 or time_axis.size == 0:
            image.setImage(np.empty((1, 1), dtype=np.float32), autoLevels=False)
            image.setLevels((-1.0, 1.0))
            marker.setVisible(False)
            plot.setTitle(title + "（暂无数据）")
            return

        time_stride = max(1, int(np.ceil(records.shape[0] / self._max_image_time_samples)))
        receiver_stride = max(1, int(np.ceil(records.shape[1] / self._max_image_receiver_samples)))
        display_records, vmax = self._prepare_image_display(records[::time_stride, ::receiver_stride])

        xmin = float(receiver_x.min()) if receiver_x.size else 0.0
        xmax = float(receiver_x.max()) if receiver_x.size else float(records.shape[1] - 1)
        tmin = float(time_axis.min())
        tmax = float(time_axis.max()) if time_axis.size > 1 else tmin + 1.0
        image.setImage(display_records, autoLevels=False)
        image.setRect(QRectF(xmin, tmin, max(xmax - xmin, 1.0), max(tmax - tmin, 1e-6)))
        image.setLevels((-vmax, vmax))

        trace_idx = int(np.clip(self.selected_trace_index, 0, max(receiver_x.size - 1, 0)))
        if receiver_x.size:
            marker.setVisible(True)
            marker.setValue(float(receiver_x[trace_idx]))
        else:
            marker.setVisible(False)
        plot.setTitle(title + "（白心色标 + 道平衡显示）")

    def _set_dispersion_image(
        self,
        plot: pg.PlotWidget,
        image: pg.ImageItem,
        freq_axis: np.ndarray,
        velocity_axis: np.ndarray,
        energy: np.ndarray,
        title: str,
        *,
        signed: bool = False,
    ) -> None:
        if freq_axis.size == 0 or velocity_axis.size == 0 or energy.size == 0:
            image.setImage(np.zeros((2, 2), dtype=np.float32), autoLevels=False)
            image.setRect(QRectF(0.0, 0.0, 1.0, 1.0))
            image.setLevels((-1.0, 1.0) if signed else (0.0, 1.0))
            plot.setTitle(title + "（暂无数据）")
            return

        image.setImage(np.asarray(energy, dtype=np.float32), autoLevels=False)
        image.setRect(
            QRectF(
                float(freq_axis[0]),
                float(velocity_axis[0]),
                max(float(freq_axis[-1] - freq_axis[0]), 1e-6),
                max(float(velocity_axis[-1] - velocity_axis[0]), 1e-6),
            )
        )
        if signed:
            vmax = float(np.percentile(np.abs(energy), 99.5))
            if not np.isfinite(vmax) or vmax <= 0.0:
                vmax = float(np.max(np.abs(energy)))
            vmax = max(vmax, 1e-6)
            image.setLevels((-vmax, vmax))
        else:
            vmax = float(np.percentile(energy, 99.5))
            if not np.isfinite(vmax) or vmax <= 0.0:
                vmax = float(np.max(energy))
            vmax = max(vmax, 1e-6)
            image.setLevels((0.0, vmax))
        plot.setTitle(title)

    def _clear_metrics(self) -> None:
        self.nrms_label.setText("--")
        self.corr_label.setText("--")
        self.energy_ratio_label.setText("--")
        self.peak_ratio_label.setText("--")
        self.trace_nrms_label.setText("--")
        self.trace_corr_label.setText("--")

    def _update_state_labels(self) -> None:
        if self.project is None:
            self.project_info_label.setText("暂无模型")
        else:
            self.project_info_label.setText(
                f"{self.project.title}；{len(self.project.model.layers)} 层；"
                f"网格 {self.project.grid.nx} × {self.project.grid.nz}"
            )

        if self.inversion_result is None:
            self.inversion_info_label.setText("暂无反演结果")
        else:
            best_vs = np.asarray(self.inversion_result.get("best_vs", []), dtype=float)
            method_label = str(self.inversion_result.get("method_label", "未知算法"))
            self.inversion_info_label.setText(
                f"{method_label}；最优失配 {float(self.inversion_result.get('best_misfit', np.nan)):.4f}；"
                f"Vs = {', '.join(f'{value:.1f}' for value in best_vs)}"
            )

        if self.observed_time.size == 0 or self.receiver_x.size == 0:
            self.observed_info_label.setText("暂无观测记录")
        else:
            self.observed_info_label.setText(
                f"{self.observed_time.size} 个时间采样，{self.receiver_x.size} 道；"
                f"时间窗 {float(self.observed_time[0]):.4f}–{float(self.observed_time[-1]):.4f} s"
            )

        if self.validation_result is None:
            if self.worker is not None and self.worker.isRunning():
                self.validation_info_label.setText("回代正演正在运行，请稍候…")
            else:
                self.validation_info_label.setText("请点击“运行回代正演”，生成反演模型的回代记录。")
        else:
            backend_name = str(self.validation_result.get("backend_name", "NumPy"))
            stopped = bool(self.validation_result.get("stopped", False))
            state = "已停止（保留当前结果）" if stopped else "已完成"
            self.validation_info_label.setText(f"回代正演{state}；后端：{backend_name}。")

        if self._has_dispersion_comparison():
            freq_range = f"{float(self.dispersion_freq_axis[0]):.2f}–{float(self.dispersion_freq_axis[-1]):.2f} Hz"
            self.dispersion_info_label.setText(
                f"{self.dispersion_component.upper()} 频散对比已完成；"
                f"{self.dispersion_freq_axis.size} 个频率采样，范围 {freq_range}。"
            )
        else:
            manual_curve = self._active_manual_curve()
            if manual_curve.size > 0:
                self.dispersion_info_label.setText(
                    f"当前已有 {manual_curve.shape[0]} 个 {self._selected_component().upper()} 手动拾取点；"
                    "可点击“计算频散对比”。"
                )
            elif self.observed_curve.size > 0 and self.observed_curve_component not in (None, self._selected_component()):
                self.dispersion_info_label.setText(
                    f"当前拾取曲线来自 {self.observed_curve_component.upper()}；"
                    f"若需比较 {self._selected_component().upper()}，请先在频散分析页切换后重新拾取。"
                )
            else:
                self.dispersion_info_label.setText("尚未计算观测/回代频散对比。")

    def _update_buttons(self) -> None:
        running = self.worker is not None and self.worker.isRunning()
        self.run_button.setEnabled(not running)
        self.stop_button.setEnabled(running)
        self.compute_dispersion_button.setEnabled(not running)
        self.export_button.setEnabled(self.validation_result is not None)

    def _update_trace_spin(self, trace_count: int) -> None:
        count = max(int(trace_count), 1)
        value = int(np.clip(self.selected_trace_index + 1, 1, count))
        self.trace_spin.blockSignals(True)
        self.trace_spin.setRange(1, count)
        self.trace_spin.setValue(value)
        self.trace_spin.blockSignals(False)

    def _on_trace_spin_changed(self, value: int) -> None:
        trace_index = max(int(value) - 1, 0)
        self.selected_trace_index = trace_index
        self.trace_selected.emit(trace_index)
        self._refresh_record_plots()

    def _on_record_plot_clicked(self, event, plot: pg.PlotWidget) -> None:
        if self._display_receiver_x.size == 0:
            return
        if not plot.sceneBoundingRect().contains(event.scenePos()):
            return
        mouse_point = plot.getPlotItem().vb.mapSceneToView(event.scenePos())
        trace_index = int(np.argmin(np.abs(self._display_receiver_x - float(mouse_point.x()))))
        self.selected_trace_index = trace_index
        self.trace_selected.emit(trace_index)
        self._refresh_record_plots()

    def _on_component_changed(self) -> None:
        self._clear_dispersion_comparison()
        self._update_state_labels()
        self._refresh_plots()

    def set_project(self, project: ProjectConfig | None) -> None:
        project_changed = project != self.project
        self.project = project
        if project_changed:
            self.observed_records_vx = np.empty((0, 0), dtype=np.float32)
            self.observed_records_vz = np.empty((0, 0), dtype=np.float32)
            self.observed_time = np.empty(0, dtype=np.float32)
            self.receiver_x = np.empty(0, dtype=np.float32)
            self.receiver_z = np.empty(0, dtype=np.float32)
            self._display_receiver_x = np.empty(0, dtype=np.float32)
            self.observed_curve = np.empty((0, 2), dtype=np.float32)
            self.observed_curve_component = None
            self.validation_result = None
            self._clear_dispersion_comparison()
            self._update_trace_spin(0)
        self._update_state_labels()
        self._clear_metrics()
        self._refresh_plots()
        self._update_buttons()

    def set_inversion_result(self, result: dict[str, object] | None) -> None:
        self.inversion_result = result
        self.validation_result = None
        self._clear_dispersion_comparison()
        self._update_state_labels()
        self._clear_metrics()
        self._refresh_plots()
        self._update_buttons()

    def set_observed_curve(self, picks: np.ndarray | list[list[float]] | list[tuple[float, float]], component: str | None = None) -> None:
        array = np.asarray(picks, dtype=np.float32)
        if array.size == 0:
            self.observed_curve = np.empty((0, 2), dtype=np.float32)
            self.observed_curve_component = component
        else:
            curve = array.reshape(-1, 2)
            curve = curve[np.argsort(curve[:, 0])]
            self.observed_curve = curve.astype(np.float32, copy=False)
            self.observed_curve_component = component or self._selected_component()
        self._update_state_labels()
        self._refresh_dispersion_views()

    def set_observed_data(
        self,
        records_vx: np.ndarray,
        records_vz: np.ndarray,
        time_axis: np.ndarray,
        receiver_x: np.ndarray,
        receiver_z: np.ndarray,
    ) -> None:
        self.observed_records_vx = np.asarray(records_vx, dtype=np.float32)
        self.observed_records_vz = np.asarray(records_vz, dtype=np.float32)
        self.observed_time = np.asarray(time_axis, dtype=np.float32)
        self.receiver_x = np.asarray(receiver_x, dtype=np.float32)
        self.receiver_z = np.asarray(receiver_z, dtype=np.float32)
        self.validation_result = None
        self._clear_dispersion_comparison()
        self.selected_trace_index = int(np.clip(self.selected_trace_index, 0, max(self.receiver_x.size - 1, 0)))
        self._display_receiver_x = self.receiver_x.astype(np.float32, copy=True)
        self._update_trace_spin(self.receiver_x.size)

        if self.observed_time.size >= 2:
            dt = float(np.median(np.diff(self.observed_time)))
            nyquist = 0.5 / max(dt, 1e-12)
            self.freq_max_spin.setMaximum(max(1.0, min(1000.0, nyquist)))
            if self.freq_max_spin.value() > nyquist:
                self.freq_max_spin.setValue(max(1.0, round(nyquist * 0.95, 1)))

        self._update_state_labels()
        self._clear_metrics()
        self._refresh_plots()
        self._update_buttons()

    def clear_observed_data(self) -> None:
        self.observed_records_vx = np.empty((0, 0), dtype=np.float32)
        self.observed_records_vz = np.empty((0, 0), dtype=np.float32)
        self.observed_time = np.empty(0, dtype=np.float32)
        self.receiver_x = np.empty(0, dtype=np.float32)
        self.receiver_z = np.empty(0, dtype=np.float32)
        self._display_receiver_x = np.empty(0, dtype=np.float32)
        self.validation_result = None
        self._clear_dispersion_comparison()
        self._update_trace_spin(0)
        self._update_state_labels()
        self._clear_metrics()
        self._refresh_plots()
        self._update_buttons()

    def set_trace_index(self, trace_index: int) -> None:
        max_index = max(int(self._display_receiver_x.size if self._display_receiver_x.size else self.receiver_x.size) - 1, 0)
        self.selected_trace_index = int(np.clip(trace_index, 0, max_index))
        self._update_trace_spin(max_index + 1)
        self._refresh_record_plots()

    def run_validation(self) -> None:
        if self.worker is not None and self.worker.isRunning():
            return
        if self.project is None:
            self.status_message.emit("回代正演失败：当前没有可用模型。")
            return
        if self.inversion_result is None:
            self.status_message.emit("回代正演失败：请先完成一次反演。")
            return
        if self.observed_time.size == 0 or self.receiver_x.size == 0:
            self.status_message.emit("回代正演失败：请先完成一次正演，生成接收记录。")
            return

        try:
            validation_project = build_validation_project(
                self.project,
                np.asarray(self.inversion_result["best_vs"], dtype=np.float32),
            )
        except Exception as exc:
            self.status_message.emit(f"回代正演失败：{exc}")
            return

        questionable_layers: list[str] = []
        for idx, layer in enumerate(sorted(validation_project.model.layers, key=lambda item: item.top_depth), start=1):
            if layer.vp <= np.sqrt(2.0) * layer.vs:
                questionable_layers.append(f"L{idx}(Vp={layer.vp:.1f}, Vs={layer.vs:.1f})")
        if questionable_layers:
            self.status_message.emit(
                "提醒：部分层的 Vs 已接近或超过 Vp/√2，回代正演可运行，但物理可信度可能偏弱："
                + ", ".join(questionable_layers)
            )

        self.validation_result = None
        self._clear_dispersion_comparison()
        self.worker = ForwardValidationWorker(validation_project)
        self.worker.status_message.connect(self.status_message.emit)
        self.worker.finished_successfully.connect(self._on_validation_finished)
        self.worker.failed.connect(self._on_validation_failed)
        self.worker.start()
        self._update_state_labels()
        self._clear_metrics()
        self._refresh_plots()
        self._update_buttons()

    def stop_validation(self) -> None:
        if self.worker is None or not self.worker.isRunning():
            return
        self.worker.request_stop()
        self.status_message.emit("已请求停止回代正演。")

    def _on_validation_finished(self, result: dict[str, object]) -> None:
        self.validation_result = result
        self.worker = None
        self._clear_dispersion_comparison()
        self._update_state_labels()
        self._update_buttons()
        self._refresh_plots()

    def _on_validation_failed(self, message: str) -> None:
        self.worker = None
        self.validation_result = None
        self._clear_dispersion_comparison()
        self._update_state_labels()
        self._update_buttons()
        self._clear_metrics()
        self._refresh_plots()
        self.status_message.emit(f"回代正演失败：{message}")

    def compute_dispersion_comparison(self) -> None:
        if self.validation_result is None:
            self.status_message.emit("频散对比失败：请先完成一次回代正演。")
            return

        observed = self._observed_component_records()
        synthetic = self._synthetic_component_records()
        if observed.size == 0 or synthetic.size == 0 or self.observed_time.size < 2 or self.receiver_x.size < 2:
            self.status_message.emit("频散对比失败：当前记录数据不足。")
            return

        try:
            observed_cmp, synthetic_cmp, time_cmp, receiver_x_cmp = trim_records_to_common_shape(
                observed,
                synthetic,
                self.observed_time,
                self.receiver_x,
            )
            freq_axis, velocity_axis, observed_energy = compute_phase_velocity_spectrum(
                observed_cmp,
                time_cmp,
                receiver_x_cmp,
                velocity_min=self.velocity_min_spin.value(),
                velocity_max=self.velocity_max_spin.value(),
                n_velocity=self.velocity_count_spin.value(),
                freq_min=self.freq_min_spin.value(),
                freq_max=self.freq_max_spin.value(),
                normalize_traces=self.normalize_check.isChecked(),
            )
            _, _, synthetic_energy = compute_phase_velocity_spectrum(
                synthetic_cmp,
                time_cmp,
                receiver_x_cmp,
                velocity_min=self.velocity_min_spin.value(),
                velocity_max=self.velocity_max_spin.value(),
                n_velocity=self.velocity_count_spin.value(),
                freq_min=self.freq_min_spin.value(),
                freq_max=self.freq_max_spin.value(),
                normalize_traces=self.normalize_check.isChecked(),
            )
        except Exception as exc:
            self.status_message.emit(f"频散对比失败：{exc}")
            return

        self.dispersion_freq_axis = np.asarray(freq_axis, dtype=np.float32)
        self.dispersion_velocity_axis = np.asarray(velocity_axis, dtype=np.float32)
        self.observed_dispersion_energy = np.asarray(observed_energy, dtype=np.float32)
        self.synthetic_dispersion_energy = np.asarray(synthetic_energy, dtype=np.float32)
        self.residual_dispersion_energy = self.synthetic_dispersion_energy - self.observed_dispersion_energy
        self.observed_peak_curve = pick_peak_curve(
            self.dispersion_freq_axis,
            self.dispersion_velocity_axis,
            self.observed_dispersion_energy,
            max_points=self.max_pick_points_spin.value(),
        ).astype(np.float32, copy=False)
        self.synthetic_peak_curve = pick_peak_curve(
            self.dispersion_freq_axis,
            self.dispersion_velocity_axis,
            self.synthetic_dispersion_energy,
            max_points=self.max_pick_points_spin.value(),
        ).astype(np.float32, copy=False)
        self.dispersion_component = self._selected_component()
        self._update_state_labels()
        self._refresh_dispersion_views()
        self.tabs.setCurrentIndex(1)
        self.status_message.emit(
            f"{self.dispersion_component.upper()} 频散对比完成："
            f"{self.dispersion_freq_axis.size} 个频率采样，"
            f"{self.dispersion_velocity_axis.size} 个速度采样。"
        )

    def export_validation_result(self) -> None:
        if self.validation_result is None:
            self.status_message.emit("没有可导出的回代验证结果，请先完成一次回代正演。")
            return

        self.output_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        default_path = self.output_dir / f"validation_result_{stamp}"
        path, _ = QFileDialog.getSaveFileName(self, "导出回代验证结果", str(default_path), "CSV (*.csv)")
        if not path:
            return

        base = Path(path)
        summary_path = base.with_name(base.stem + "_summary.csv")
        curve_path = base.with_name(base.stem + "_curves.csv")
        observed_npz = base.with_name(base.stem + "_observed.npz")
        synthetic_npz = base.with_name(base.stem + "_synthetic.npz")
        validation_npz = base.with_name(base.stem + "_validation_compare.npz")

        observed_base = base.with_name(base.stem + "_observed")
        synthetic_base = base.with_name(base.stem + "_synthetic")
        observed_vx_csv, observed_vz_csv = export_records_csv(
            observed_base,
            self.observed_time,
            self.observed_records_vx,
            self.observed_records_vz,
            self.receiver_x,
        )
        synthetic_time = np.asarray(self.validation_result.get("record_time", np.empty(0, dtype=np.float32)), dtype=np.float32)
        synthetic_receiver_x = np.asarray(
            self.validation_result.get("receiver_positions", {}).get("x", self.receiver_x),
            dtype=np.float32,
        )
        synthetic_receiver_z = np.asarray(
            self.validation_result.get("receiver_positions", {}).get("z", self.receiver_z),
            dtype=np.float32,
        )
        synthetic_vx = np.asarray(self.validation_result.get("records_vx", np.empty((0, 0), dtype=np.float32)), dtype=np.float32)
        synthetic_vz = np.asarray(self.validation_result.get("records_vz", np.empty((0, 0), dtype=np.float32)), dtype=np.float32)
        synthetic_vx_csv, synthetic_vz_csv = export_records_csv(
            synthetic_base,
            synthetic_time,
            synthetic_vx,
            synthetic_vz,
            synthetic_receiver_x,
        )

        export_records_npz(observed_npz, self.observed_time, self.observed_records_vx, self.observed_records_vz, self.receiver_x, self.receiver_z)
        export_records_npz(synthetic_npz, synthetic_time, synthetic_vx, synthetic_vz, synthetic_receiver_x, synthetic_receiver_z)

        metrics_summary: dict[str, float | str] = {
            "component": self._selected_component(),
            "project_title": "" if self.project is None else self.project.title,
            "inversion_method": "" if self.inversion_result is None else str(self.inversion_result.get("method_label", "")),
            "inversion_best_misfit": np.nan if self.inversion_result is None else float(self.inversion_result.get("best_misfit", np.nan)),
        }
        if self._selected_component() == "vz":
            observed_component = self.observed_records_vz
            synthetic_component = synthetic_vz
        else:
            observed_component = self.observed_records_vx
            synthetic_component = synthetic_vx
        try:
            observed_cmp, synthetic_cmp, _, _ = trim_records_to_common_shape(
                observed_component,
                synthetic_component,
                self.observed_time,
                self.receiver_x,
            )
            metrics = compute_record_metrics(observed_cmp, synthetic_cmp)
            trace_index = int(np.clip(self.selected_trace_index, 0, observed_cmp.shape[1] - 1))
            trace_metrics = compute_record_metrics(observed_cmp[:, [trace_index]], synthetic_cmp[:, [trace_index]])
            metrics_summary.update(
                {
                    "overall_nrms": float(metrics["nrms"]),
                    "overall_correlation": float(metrics["correlation"]),
                    "energy_ratio": float(metrics["energy_ratio"]),
                    "peak_ratio": float(metrics["peak_ratio"]),
                    "trace_index": trace_index + 1,
                    "trace_nrms": float(trace_metrics["nrms"]),
                    "trace_correlation": float(trace_metrics["correlation"]),
                }
            )
        except Exception:
            pass

        with summary_path.open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(["metric", "value"])
            for key, value in metrics_summary.items():
                writer.writerow([key, value])

        predicted_curve = self._predicted_curve()
        with curve_path.open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(["curve_type", "component", "frequency_hz", "velocity_mps"])
            for name, curve in (
                ("observed_manual", self.observed_curve),
                ("observed_peak", self.observed_peak_curve),
                ("synthetic_peak", self.synthetic_peak_curve),
                ("predicted_best", predicted_curve),
            ):
                if curve.size == 0:
                    continue
                component = (
                    self.observed_curve_component
                    if name in {"observed_manual", "predicted_best"}
                    else self.dispersion_component or self._selected_component()
                )
                for freq, velocity in np.asarray(curve, dtype=float):
                    writer.writerow([name, component, float(freq), float(velocity)])

        np.savez_compressed(
            validation_npz,
            observed_time_s=self.observed_time,
            observed_receiver_x=self.receiver_x,
            observed_receiver_z=self.receiver_z,
            observed_vx=self.observed_records_vx,
            observed_vz=self.observed_records_vz,
            synthetic_time_s=synthetic_time,
            synthetic_receiver_x=synthetic_receiver_x,
            synthetic_receiver_z=synthetic_receiver_z,
            synthetic_vx=synthetic_vx,
            synthetic_vz=synthetic_vz,
            manual_curve=self.observed_curve,
            manual_curve_component="" if self.observed_curve_component is None else self.observed_curve_component,
            predicted_curve=predicted_curve,
            dispersion_component="" if self.dispersion_component is None else self.dispersion_component,
            dispersion_freq_axis=self.dispersion_freq_axis,
            dispersion_velocity_axis=self.dispersion_velocity_axis,
            observed_dispersion_energy=self.observed_dispersion_energy,
            synthetic_dispersion_energy=self.synthetic_dispersion_energy,
            residual_dispersion_energy=self.residual_dispersion_energy,
            observed_peak_curve=self.observed_peak_curve,
            synthetic_peak_curve=self.synthetic_peak_curve,
        )

        self.status_message.emit(
            "回代验证结果已导出："
            f"{summary_path.name}, {curve_path.name}, "
            f"{observed_vx_csv.name}, {observed_vz_csv.name}, "
            f"{synthetic_vx_csv.name}, {synthetic_vz_csv.name}, "
            f"{observed_npz.name}, {synthetic_npz.name}, {validation_npz.name}"
        )

    def _refresh_trace_plot(
        self,
        observed: np.ndarray,
        synthetic: np.ndarray,
        time_axis: np.ndarray,
        receiver_x: np.ndarray,
    ) -> None:
        if observed.size == 0 or synthetic.size == 0 or time_axis.size == 0:
            self.observed_trace_curve.setData([], [])
            self.synthetic_trace_curve.setData([], [])
            self.residual_trace_curve.setData([], [])
            self.trace_plot.setTitle("单道对比（暂无数据）")
            return

        trace_index = int(np.clip(self.selected_trace_index, 0, observed.shape[1] - 1))
        trace_stride = max(1, int(np.ceil(time_axis.size / self._max_trace_samples)))
        obs_trace = observed[::trace_stride, trace_index]
        syn_trace = synthetic[::trace_stride, trace_index]
        residual = syn_trace - obs_trace
        display_time = time_axis[::trace_stride]

        self.observed_trace_curve.setData(display_time, obs_trace)
        self.synthetic_trace_curve.setData(display_time, syn_trace)
        self.residual_trace_curve.setData(display_time, residual)
        x_value = float(receiver_x[trace_index]) if receiver_x.size else float(trace_index)
        self.trace_plot.setTitle(f"单道对比 - 第 {trace_index + 1} 道（x = {x_value:.2f} m）")

    def _refresh_record_plots(self) -> None:
        observed = self._observed_component_records()
        component = self._selected_component().upper()

        if observed.size == 0 or self.observed_time.size == 0:
            empty = np.empty((0, 0), dtype=np.float32)
            empty_time = np.empty(0, dtype=np.float32)
            empty_x = np.empty(0, dtype=np.float32)
            self._display_receiver_x = empty_x
            self._update_trace_spin(0)
            self._set_record_image(self.observed_plot, self.observed_image, self.observed_marker, empty, empty_time, empty_x, "观测接收记录")
            self._set_record_image(self.synthetic_plot, self.synthetic_image, self.synthetic_marker, empty, empty_time, empty_x, "回代合成记录")
            self._set_record_image(self.residual_plot, self.residual_image, self.residual_marker, empty, empty_time, empty_x, "残差记录（合成 - 观测）")
            self._refresh_trace_plot(empty, empty, empty_time, empty_x)
            self._clear_metrics()
            return

        self._set_record_image(
            self.observed_plot,
            self.observed_image,
            self.observed_marker,
            observed,
            self.observed_time,
            self.receiver_x,
            f"观测接收记录 - {component}",
        )

        synthetic = self._synthetic_component_records()
        if synthetic.size == 0:
            empty = np.empty((0, 0), dtype=np.float32)
            empty_time = np.empty(0, dtype=np.float32)
            empty_x = np.empty(0, dtype=np.float32)
            self._display_receiver_x = self.receiver_x.astype(np.float32, copy=True)
            self._update_trace_spin(self.receiver_x.size)
            self._set_record_image(
                self.synthetic_plot,
                self.synthetic_image,
                self.synthetic_marker,
                empty,
                empty_time,
                empty_x,
                f"回代合成记录 - {component}",
            )
            self._set_record_image(
                self.residual_plot,
                self.residual_image,
                self.residual_marker,
                empty,
                empty_time,
                empty_x,
                "残差记录（合成 - 观测）",
            )
            self._refresh_trace_plot(empty, empty, empty_time, empty_x)
            self._clear_metrics()
            return

        try:
            observed_cmp, synthetic_cmp, time_cmp, receiver_x_cmp = trim_records_to_common_shape(
                observed,
                synthetic,
                self.observed_time,
                self.receiver_x,
            )
        except Exception:
            self._clear_metrics()
            return

        residual = synthetic_cmp - observed_cmp
        time_axis = time_cmp if time_cmp is not None else self.observed_time
        receiver_x = receiver_x_cmp if receiver_x_cmp is not None else self.receiver_x
        self._display_receiver_x = np.asarray(receiver_x, dtype=np.float32)
        self._update_trace_spin(self._display_receiver_x.size)
        self._set_record_image(
            self.synthetic_plot,
            self.synthetic_image,
            self.synthetic_marker,
            synthetic_cmp,
            time_axis,
            receiver_x,
            f"回代合成记录 - {component}",
        )
        self._set_record_image(
            self.residual_plot,
            self.residual_image,
            self.residual_marker,
            residual,
            time_axis,
            receiver_x,
            f"残差记录 - {component}",
        )
        self._refresh_trace_plot(observed_cmp, synthetic_cmp, time_axis, receiver_x)

        metrics = compute_record_metrics(observed_cmp, synthetic_cmp)
        trace_index = int(np.clip(self.selected_trace_index, 0, observed_cmp.shape[1] - 1))
        trace_metrics = compute_record_metrics(observed_cmp[:, [trace_index]], synthetic_cmp[:, [trace_index]])
        self.nrms_label.setText(f"{metrics['nrms']:.4f}")
        self.corr_label.setText(f"{metrics['correlation']:.4f}")
        self.energy_ratio_label.setText(f"{metrics['energy_ratio']:.4f}")
        self.peak_ratio_label.setText(f"{metrics['peak_ratio']:.4f}")
        self.trace_nrms_label.setText(f"{trace_metrics['nrms']:.4f}")
        self.trace_corr_label.setText(f"{trace_metrics['correlation']:.4f}")

    def _refresh_dispersion_views(self) -> None:
        self._set_dispersion_image(
            self.observed_dispersion_plot,
            self.observed_dispersion_image,
            self.dispersion_freq_axis,
            self.dispersion_velocity_axis,
            self.observed_dispersion_energy,
            f"观测频散能量 - {self._selected_component().upper()}",
        )
        self._set_dispersion_image(
            self.synthetic_dispersion_plot,
            self.synthetic_dispersion_image,
            self.dispersion_freq_axis,
            self.dispersion_velocity_axis,
            self.synthetic_dispersion_energy,
            f"回代频散能量 - {self._selected_component().upper()}",
        )
        self._set_dispersion_image(
            self.residual_dispersion_plot,
            self.residual_dispersion_image,
            self.dispersion_freq_axis,
            self.dispersion_velocity_axis,
            self.residual_dispersion_energy,
            f"频散差异 - {self._selected_component().upper()}",
            signed=True,
        )

        manual_curve = self._active_manual_curve()
        predicted_curve = self._predicted_curve()
        if manual_curve.size == 0:
            self.manual_curve_scatter.setData([], [])
        else:
            self.manual_curve_scatter.setData(manual_curve[:, 0], manual_curve[:, 1])

        if self.observed_peak_curve.size == 0:
            self.observed_peak_item.setData([], [])
        else:
            self.observed_peak_item.setData(self.observed_peak_curve[:, 0], self.observed_peak_curve[:, 1])

        if self.synthetic_peak_curve.size == 0:
            self.synthetic_peak_item.setData([], [])
        else:
            self.synthetic_peak_item.setData(self.synthetic_peak_curve[:, 0], self.synthetic_peak_curve[:, 1])

        if predicted_curve.size == 0:
            self.predicted_curve_item.setData([], [])
        else:
            self.predicted_curve_item.setData(predicted_curve[:, 0], predicted_curve[:, 1])

        if manual_curve.size == 0 and self.observed_peak_curve.size == 0 and self.synthetic_peak_curve.size == 0 and predicted_curve.size == 0:
            self.curve_compare_plot.setTitle("频散曲线对比（暂无数据）")
        else:
            self.curve_compare_plot.setTitle("频散曲线对比")

    def _refresh_plots(self) -> None:
        self._refresh_record_plots()
        self._refresh_dispersion_views()

    def reset_view(self) -> None:
        self.observed_plot.enableAutoRange()
        self.synthetic_plot.enableAutoRange()
        self.residual_plot.enableAutoRange()
        self.trace_plot.enableAutoRange()
        self.observed_dispersion_plot.enableAutoRange()
        self.synthetic_dispersion_plot.enableAutoRange()
        self.residual_dispersion_plot.enableAutoRange()
        self.curve_compare_plot.enableAutoRange()
