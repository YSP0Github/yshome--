from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QAbstractItemView,
    QComboBox,
    QFileDialog,
    QFormLayout,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QPushButton,
    QSpinBox,
    QDoubleSpinBox,
    QTabWidget,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
    QWidget,
)

from app.analysis.inversion import (
    INVERSION_METHOD_LABELS,
    approximate_phase_velocity_curve,
    compare_inversion_methods,
    invert_layered_vs,
    misfit_rms_relative,
    step_profile_arrays,
)
from app.analysis.rayleigh import estimate_rayleigh_factor, estimate_rayleigh_velocity
from app.types import ProjectConfig


class InversionView(QWidget):
    status_message = Signal(str)
    result_changed = Signal(object)

    def __init__(self, output_dir: str | Path, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.output_dir = Path(output_dir)
        self.project: ProjectConfig | None = None

        self.layer_tops = np.empty(0, dtype=np.float32)
        self.true_vp = np.empty(0, dtype=np.float32)
        self.true_vs = np.empty(0, dtype=np.float32)
        self.max_depth = 1.0
        self.observed_curve = np.empty((0, 2), dtype=np.float32)
        self.top_vp: float | None = None
        self.top_vs: float | None = None

        self.result: dict[str, object] | None = None
        self.compare_results: dict[str, dict[str, object]] = {}
        self._updating_table = False

        self._build_ui()
        self._refresh_plots()

    def _emit_result_changed(self) -> None:
        self.result_changed.emit(self.result)

    @staticmethod
    def _make_double_spin(minimum: float, maximum: float, value: float, decimals: int = 2) -> QDoubleSpinBox:
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

        controls_group = QGroupBox("多算法 Vs 反演设置")
        controls_layout = QGridLayout(controls_group)

        self.algorithm_combo = QComboBox()
        for method, label in INVERSION_METHOD_LABELS.items():
            self.algorithm_combo.addItem(label, method)

        self.initial_scale_spin = self._make_double_spin(0.2, 3.0, 1.10, 2)
        self.lower_scale_spin = self._make_double_spin(0.1, 2.0, 0.60, 2)
        self.upper_scale_spin = self._make_double_spin(1.0, 5.0, 1.80, 2)
        self.iterations_spin = self._make_int_spin(20, 5000, 260)
        self.population_spin = self._make_int_spin(4, 300, 28)
        self.seed_spin = self._make_int_spin(0, 999999, 42)
        self.depth_step_spin = self._make_double_spin(0.1, 10.0, 0.5, 2)
        self.rayleigh_factor_spin = self._make_double_spin(0.6, 0.99, 0.92, 3)
        self.depth_factor_spin = self._make_double_spin(0.1, 2.5, 0.65, 2)

        self.apply_scale_button = QPushButton("按倍率刷新初值/界限")
        self.copy_true_button = QPushButton("真值 → 初值")
        self.copy_result_button = QPushButton("当前结果 → 初值")
        self.run_button = QPushButton("运行当前算法")
        self.compare_button = QPushButton("三算法对比")
        self.export_button = QPushButton("导出反演结果")

        controls_layout.addWidget(QLabel("当前算法"), 0, 0)
        controls_layout.addWidget(self.algorithm_combo, 0, 1)
        controls_layout.addWidget(QLabel("初值倍率"), 0, 2)
        controls_layout.addWidget(self.initial_scale_spin, 0, 3)
        controls_layout.addWidget(QLabel("下界倍率"), 0, 4)
        controls_layout.addWidget(self.lower_scale_spin, 0, 5)
        controls_layout.addWidget(QLabel("上界倍率"), 0, 6)
        controls_layout.addWidget(self.upper_scale_spin, 0, 7)
        controls_layout.addWidget(self.apply_scale_button, 0, 8)

        controls_layout.addWidget(QLabel("迭代次数"), 1, 0)
        controls_layout.addWidget(self.iterations_spin, 1, 1)
        controls_layout.addWidget(QLabel("种群规模"), 1, 2)
        controls_layout.addWidget(self.population_spin, 1, 3)
        controls_layout.addWidget(QLabel("随机种子"), 1, 4)
        controls_layout.addWidget(self.seed_spin, 1, 5)
        controls_layout.addWidget(self.run_button, 1, 6)
        controls_layout.addWidget(self.compare_button, 1, 7)
        controls_layout.addWidget(self.export_button, 1, 8)

        controls_layout.addWidget(QLabel("深度采样 dz (m)"), 2, 0)
        controls_layout.addWidget(self.depth_step_spin, 2, 1)
        controls_layout.addWidget(QLabel("Rayleigh 系数"), 2, 2)
        controls_layout.addWidget(self.rayleigh_factor_spin, 2, 3)
        controls_layout.addWidget(QLabel("等效深度系数"), 2, 4)
        controls_layout.addWidget(self.depth_factor_spin, 2, 5)
        controls_layout.addWidget(self.copy_true_button, 2, 7)
        controls_layout.addWidget(self.copy_result_button, 2, 8)

        model_group = QGroupBox("层参数对比表（真值 / 初值 / 约束）")
        model_layout = QVBoxLayout(model_group)
        self.model_table = QTableWidget(0, 6)
        self.model_table.setHorizontalHeaderLabels(["层号", "顶深度(m)", "真值Vs", "初值Vs", "下界Vs", "上界Vs"])
        self.model_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.model_table.verticalHeader().setVisible(False)
        self.model_table.setAlternatingRowColors(True)
        self.model_table.setSelectionBehavior(QAbstractItemView.SelectRows)
        model_layout.addWidget(self.model_table)

        compare_group = QGroupBox("算法结果对比")
        compare_layout = QVBoxLayout(compare_group)
        self.algorithm_table = QTableWidget(0, 4)
        self.algorithm_table.setHorizontalHeaderLabels(["算法", "初值失配", "最优失配", "改进率"])
        self.algorithm_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.algorithm_table.verticalHeader().setVisible(False)
        self.algorithm_table.setAlternatingRowColors(True)
        self.algorithm_table.setSelectionBehavior(QAbstractItemView.SelectRows)
        compare_layout.addWidget(self.algorithm_table)

        info_group = QGroupBox("反演信息")
        info_form = QFormLayout(info_group)
        self.model_info_label = QLabel("暂无模型")
        self.model_info_label.setWordWrap(True)
        self.curve_info_label = QLabel("暂无频散曲线")
        self.curve_info_label.setWordWrap(True)
        self.physics_info_label = QLabel("物理提示：频散曲线纵轴是瑞雷波相速度 cR，不是 Vs。")
        self.physics_info_label.setWordWrap(True)
        self.result_info_label = QLabel("说明：当前为 1D 层状、固定层顶深度、仅 Vs 反演的教学增强版。")
        self.result_info_label.setWordWrap(True)
        info_form.addRow("模型信息", self.model_info_label)
        info_form.addRow("观测曲线", self.curve_info_label)
        info_form.addRow("物理提示", self.physics_info_label)
        info_form.addRow("当前状态", self.result_info_label)

        self.curve_plot = pg.PlotWidget()
        self.curve_plot.showGrid(x=True, y=True, alpha=0.2)
        self.curve_plot.setLabel("bottom", "Frequency (Hz)")
        self.curve_plot.setLabel("left", "Phase Velocity (m/s)")
        self.curve_plot.setMenuEnabled(False)
        self.curve_plot.setTitle("真值 / 初值 / 当前算法结果频散曲线")
        self.curve_plot.addLegend()
        self.observed_scatter = pg.ScatterPlotItem(
            size=8,
            symbol="o",
            brush=pg.mkBrush("#fde047"),
            pen=pg.mkPen("#92400e", width=1.0),
            name="观测拾取",
        )
        self.true_curve_item = self.curve_plot.plot(pen=pg.mkPen("#22c55e", width=1.8), name="真值理论")
        self.initial_curve_item = self.curve_plot.plot(
            pen=pg.mkPen("#60a5fa", width=1.6, style=Qt.DashLine),
            name="初始模型",
        )
        self.best_curve_item = self.curve_plot.plot(pen=pg.mkPen("#f97316", width=2.0), name="当前算法结果")
        self.curve_plot.addItem(self.observed_scatter)

        self.profile_plot = pg.PlotWidget()
        self.profile_plot.showGrid(x=True, y=True, alpha=0.2)
        self.profile_plot.setLabel("bottom", "Vs (m/s)")
        self.profile_plot.setLabel("left", "Depth (m)")
        self.profile_plot.invertY(True)
        self.profile_plot.setMenuEnabled(False)
        self.profile_plot.setTitle("真值 / 初值 / 当前算法结果 Vs 剖面")
        self.profile_plot.addLegend()
        self.true_profile_item = self.profile_plot.plot(pen=pg.mkPen("#22c55e", width=1.8), name="真值")
        self.initial_profile_item = self.profile_plot.plot(
            pen=pg.mkPen("#60a5fa", width=1.8, style=Qt.DashLine),
            name="初值",
        )
        self.best_profile_item = self.profile_plot.plot(pen=pg.mkPen("#f97316", width=2.0), name="当前算法结果")

        self.misfit_plot = pg.PlotWidget()
        self.misfit_plot.showGrid(x=True, y=True, alpha=0.2)
        self.misfit_plot.setLabel("bottom", "Iteration")
        self.misfit_plot.setLabel("left", "RMS Relative Misfit")
        self.misfit_plot.setMenuEnabled(False)
        self.misfit_plot.setTitle("多算法收敛曲线")
        self.misfit_plot.addLegend()
        self.misfit_items = {
            "ce": self.misfit_plot.plot(pen=pg.mkPen("#38bdf8", width=1.8), name=INVERSION_METHOD_LABELS["ce"]),
            "pso": self.misfit_plot.plot(pen=pg.mkPen("#f97316", width=1.8), name=INVERSION_METHOD_LABELS["pso"]),
            "ga": self.misfit_plot.plot(pen=pg.mkPen("#a855f7", width=1.8), name=INVERSION_METHOD_LABELS["ga"]),
        }

        top_row = QHBoxLayout()
        top_row.addWidget(model_group, 2)
        top_row.addWidget(compare_group, 1)

        self.plot_tabs = QTabWidget()
        self.plot_tabs.addTab(self.curve_plot, "频散曲线")
        self.plot_tabs.addTab(self.profile_plot, "Vs剖面")
        self.plot_tabs.addTab(self.misfit_plot, "失配曲线")
        self.plot_tabs.setCurrentWidget(self.curve_plot)

        layout.addWidget(controls_group)
        layout.addLayout(top_row)
        layout.addWidget(info_group)
        layout.addWidget(self.plot_tabs, 1)

        self.apply_scale_button.clicked.connect(self.apply_scaled_initial_model)
        self.copy_true_button.clicked.connect(self.copy_true_to_initial)
        self.copy_result_button.clicked.connect(self.copy_result_to_initial)
        self.run_button.clicked.connect(self.run_inversion)
        self.compare_button.clicked.connect(self.compare_algorithms)
        self.export_button.clicked.connect(self.export_result)
        self.algorithm_combo.currentIndexChanged.connect(self.on_algorithm_changed)
        self.model_table.itemChanged.connect(self.on_model_table_changed)

    def reset_view(self) -> None:
        self.curve_plot.enableAutoRange()
        self.profile_plot.enableAutoRange()
        self.misfit_plot.enableAutoRange()

    def _update_physics_info(self) -> None:
        if self.top_vp is None or self.top_vs is None:
            self.physics_info_label.setText("物理提示：频散曲线纵轴是瑞雷波相速度 cR，不是 Vs。")
            return
        factor = estimate_rayleigh_factor(self.top_vp, self.top_vs)
        velocity = estimate_rayleigh_velocity(self.top_vp, self.top_vs)
        self.physics_info_label.setText(
            "物理提示：频散曲线纵轴是瑞雷波相速度 cR，不是 Vs。"
            f" 对当前顶部层，理论上 cR≈{velocity:.1f} m/s ≈ {factor:.3f}×Vs_top({self.top_vs:.1f} m/s)。"
        )

    def _selected_method(self) -> str:
        return str(self.algorithm_combo.currentData())

    def _set_table_item(self, table: QTableWidget, row: int, col: int, value: float | int | str, *, editable: bool = True) -> None:
        if isinstance(value, str):
            text = value
        elif isinstance(value, (int, np.integer)):
            text = str(int(value))
        else:
            text = f"{float(value):.3f}"
        item = QTableWidgetItem(text)
        if not editable:
            item.setFlags(item.flags() & ~Qt.ItemIsEditable)
        item.setTextAlignment(Qt.AlignCenter)
        table.setItem(row, col, item)

    def _populate_model_table(self, *, initial_vs: np.ndarray, lower_vs: np.ndarray, upper_vs: np.ndarray) -> None:
        self._updating_table = True
        try:
            n_layers = int(self.layer_tops.size)
            self.model_table.setRowCount(n_layers)
            for row in range(n_layers):
                self._set_table_item(self.model_table, row, 0, row + 1, editable=False)
                self._set_table_item(self.model_table, row, 1, float(self.layer_tops[row]), editable=False)
                self._set_table_item(self.model_table, row, 2, float(self.true_vs[row]), editable=False)
                self._set_table_item(self.model_table, row, 3, float(initial_vs[row]), editable=True)
                self._set_table_item(self.model_table, row, 4, float(lower_vs[row]), editable=True)
                self._set_table_item(self.model_table, row, 5, float(upper_vs[row]), editable=True)
        finally:
            self._updating_table = False

    def _refresh_algorithm_table(self) -> None:
        methods = ["ce", "pso", "ga"]
        available = [method for method in methods if method in self.compare_results]
        self.algorithm_table.setRowCount(len(available))
        for row, method in enumerate(available):
            result = self.compare_results[method]
            init_m = float(result["initial_misfit"])
            best_m = float(result["best_misfit"])
            improve = (init_m - best_m) / max(init_m, 1e-12) * 100.0
            self._set_table_item(self.algorithm_table, row, 0, INVERSION_METHOD_LABELS[method], editable=False)
            self._set_table_item(self.algorithm_table, row, 1, init_m, editable=False)
            self._set_table_item(self.algorithm_table, row, 2, best_m, editable=False)
            self._set_table_item(self.algorithm_table, row, 3, f"{improve:.1f}%", editable=False)

    def _table_column_array(self, column: int, fallback: np.ndarray) -> np.ndarray:
        values = np.asarray(fallback, dtype=np.float32).copy()
        if self.model_table.rowCount() != values.size:
            return values
        for row in range(values.size):
            item = self.model_table.item(row, column)
            if item is None:
                continue
            try:
                values[row] = float(item.text())
            except ValueError:
                continue
        return values

    def current_model_arrays(self) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        if self.layer_tops.size == 0:
            empty = np.empty(0, dtype=np.float32)
            return empty, empty, empty
        initial_vs = self._table_column_array(3, self.true_vs)
        lower_vs = self._table_column_array(4, np.maximum(initial_vs * 0.6, 50.0))
        upper_vs = self._table_column_array(5, np.maximum(initial_vs * 1.8, lower_vs + 20.0))
        return initial_vs, lower_vs, upper_vs

    def apply_scaled_initial_model(self) -> None:
        if self.true_vs.size == 0:
            return
        initial_vs = np.maximum(self.true_vs * self.initial_scale_spin.value(), 50.0)
        lower_vs = np.maximum(initial_vs * self.lower_scale_spin.value(), 50.0)
        upper_vs = np.maximum(initial_vs * self.upper_scale_spin.value(), lower_vs + 20.0)
        self._populate_model_table(initial_vs=initial_vs, lower_vs=lower_vs, upper_vs=upper_vs)
        self.result = None
        self.compare_results = {}
        self._emit_result_changed()
        self.result_info_label.setText("已按倍率刷新初值和上下界，可直接运行单算法或做三算法对比。")
        self._refresh_plots()

    def copy_true_to_initial(self) -> None:
        if self.true_vs.size == 0:
            return
        lower_vs = np.maximum(self.true_vs * self.lower_scale_spin.value(), 50.0)
        upper_vs = np.maximum(self.true_vs * self.upper_scale_spin.value(), lower_vs + 20.0)
        self._populate_model_table(initial_vs=self.true_vs, lower_vs=lower_vs, upper_vs=upper_vs)
        self.result = None
        self.compare_results = {}
        self._emit_result_changed()
        self.result_info_label.setText("已将真值模型复制到初始模型，用于基准测试。")
        self._refresh_plots()

    def copy_result_to_initial(self) -> None:
        if self.result is None:
            self.status_message.emit("当前没有可复制的反演结果。")
            return
        best_vs = np.asarray(self.result["best_vs"], dtype=np.float32)
        lower_vs = np.maximum(best_vs * self.lower_scale_spin.value(), 50.0)
        upper_vs = np.maximum(best_vs * self.upper_scale_spin.value(), lower_vs + 20.0)
        self._populate_model_table(initial_vs=best_vs, lower_vs=lower_vs, upper_vs=upper_vs)
        self.result = None
        self.compare_results = {}
        self._emit_result_changed()
        self.result_info_label.setText("已将当前算法结果复制为新的初始模型，可继续二次反演。")
        self._refresh_plots()

    def on_model_table_changed(self) -> None:
        if self._updating_table:
            return
        self.result = None
        self.compare_results = {}
        self._emit_result_changed()
        self.result_info_label.setText("层参数表已修改：历史反演结果已清空，请重新运行。")
        self._refresh_plots()

    def on_algorithm_changed(self) -> None:
        method = self._selected_method()
        if method in self.compare_results:
            self.result = self.compare_results[method]
            self._emit_result_changed()
            self.result_info_label.setText(
                f"当前查看算法：{INVERSION_METHOD_LABELS[method]}；"
                f"初值失配 {float(self.result['initial_misfit']):.4f}，"
                f"最优失配 {float(self.result['best_misfit']):.4f}。"
            )
        elif self.compare_results:
            self.result = None
            self._emit_result_changed()
            self.result_info_label.setText("当前算法尚未运行；可点击“运行当前算法”或“三算法对比”。")
        self._refresh_plots()

    def set_project(self, project: ProjectConfig | None) -> None:
        self.project = project
        self.result = None
        self.compare_results = {}
        self._emit_result_changed()
        if project is None or not project.model.layers:
            self.layer_tops = np.empty(0, dtype=np.float32)
            self.true_vp = np.empty(0, dtype=np.float32)
            self.true_vs = np.empty(0, dtype=np.float32)
            self.max_depth = 1.0
            self.top_vp = None
            self.top_vs = None
            self.model_table.setRowCount(0)
            self.algorithm_table.setRowCount(0)
            self.model_info_label.setText("暂无模型")
            self._update_physics_info()
            self.result_info_label.setText("说明：当前为 1D 层状、固定层顶深度、仅 Vs 反演的教学增强版。")
            self._refresh_plots()
            return

        layers = sorted(project.model.layers, key=lambda item: item.top_depth)
        self.layer_tops = np.asarray([layer.top_depth for layer in layers], dtype=np.float32)
        self.true_vp = np.asarray([layer.vp for layer in layers], dtype=np.float32)
        self.true_vs = np.asarray([layer.vs for layer in layers], dtype=np.float32)
        self.top_vp = float(layers[0].vp)
        self.top_vs = float(layers[0].vs)
        self.max_depth = max((project.grid.nz - 1) * project.grid.dz, float(self.layer_tops[-1]) + project.grid.dz)
        self.model_info_label.setText(
            f"{len(layers)} 层，最大深度 {self.max_depth:.1f} m；层顶深度："
            + ", ".join(f"{float(top):.1f}" for top in self.layer_tops)
        )
        self._update_physics_info()
        self.apply_scaled_initial_model()

    def set_observed_curve(self, picks: np.ndarray | list[list[float]] | list[tuple[float, float]]) -> None:
        array = np.asarray(picks, dtype=np.float32)
        if array.size == 0:
            self.observed_curve = np.empty((0, 2), dtype=np.float32)
        else:
            self.observed_curve = array.reshape(-1, 2)
            self.observed_curve = self.observed_curve[np.argsort(self.observed_curve[:, 0])]
        self.result = None
        self.compare_results = {}
        self._emit_result_changed()
        if self.observed_curve.size == 0:
            self.curve_info_label.setText("暂无频散曲线，请先在“频散分析”页手动或自动拾取。")
            self.result_info_label.setText("说明：当前为 1D 层状、固定层顶深度、仅 Vs 反演的教学增强版。")
        else:
            self.curve_info_label.setText(
                f"{self.observed_curve.shape[0]} 个频散点（相速度 cR），频率范围 "
                f"{float(self.observed_curve[0, 0]):.2f} ~ {float(self.observed_curve[-1, 0]):.2f} Hz"
            )
            self.result_info_label.setText("观测曲线已更新，可运行单算法或三算法对比。")
        self._refresh_plots()

    def _refresh_plots(self) -> None:
        self._refresh_algorithm_table()

        if self.observed_curve.size == 0:
            self.observed_scatter.setData([], [])
        else:
            self.observed_scatter.setData(self.observed_curve[:, 0], self.observed_curve[:, 1])

        if self.layer_tops.size == 0 or self.true_vs.size == 0:
            self.true_curve_item.setData([], [])
            self.initial_curve_item.setData([], [])
            self.best_curve_item.setData([], [])
            self.true_profile_item.setData([], [])
            self.initial_profile_item.setData([], [])
            self.best_profile_item.setData([], [])
            for item in self.misfit_items.values():
                item.setData([], [])
            return

        initial_vs, _, _ = self.current_model_arrays()

        x_true, y_true = step_profile_arrays(self.layer_tops, self.true_vs, self.max_depth)
        x_init, y_init = step_profile_arrays(self.layer_tops, initial_vs, self.max_depth)
        self.true_profile_item.setData(x_true, y_true)
        self.initial_profile_item.setData(x_init, y_init)

        for method, item in self.misfit_items.items():
            if method in self.compare_results:
                history = np.asarray(self.compare_results[method]["history"], dtype=float)
                item.setData(np.arange(history.size, dtype=float), history)
            else:
                item.setData([], [])

        current_method = self._selected_method()
        if self.result is None and current_method in self.compare_results:
            self.result = self.compare_results[current_method]

        if self.result is not None and self.result.get("method") not in self.compare_results and current_method in self.compare_results:
            self.result = self.compare_results[current_method]

        if self.observed_curve.size == 0:
            self.true_curve_item.setData([], [])
            self.initial_curve_item.setData([], [])
            self.best_curve_item.setData([], [])
            self.best_profile_item.setData([], [])
            return

        freq = self.observed_curve[:, 0]
        true_curve = approximate_phase_velocity_curve(
            freq,
            self.layer_tops,
            self.true_vs,
            vp_values=self.true_vp,
            max_depth=self.max_depth,
            dz=self.depth_step_spin.value(),
            rayleigh_factor=self.rayleigh_factor_spin.value(),
            depth_factor=self.depth_factor_spin.value(),
        )
        initial_curve = approximate_phase_velocity_curve(
            freq,
            self.layer_tops,
            initial_vs,
            vp_values=self.true_vp,
            max_depth=self.max_depth,
            dz=self.depth_step_spin.value(),
            rayleigh_factor=self.rayleigh_factor_spin.value(),
            depth_factor=self.depth_factor_spin.value(),
        )
        initial_misfit = misfit_rms_relative(self.observed_curve[:, 1], initial_curve)
        self.true_curve_item.setData(freq, true_curve)
        self.initial_curve_item.setData(freq, initial_curve)

        if self.result is None:
            self.best_curve_item.setData([], [])
            self.best_profile_item.setData([], [])
            top_initial_vs = float(initial_vs[0]) if initial_vs.size else float("nan")
            self.result_info_label.setText(
                f"当前初始模型相对 RMS 失配约为 {initial_misfit:.4f}；顶部层初始 Vs≈{top_initial_vs:.1f} m/s。"
                " 注意：曲线图显示的是相速度 cR，不是 Vs。"
            )
            return

        best_curve = np.asarray(self.result["best_curve"], dtype=float)
        best_vs = np.asarray(self.result["best_vs"], dtype=float)
        top_best_vs = float(best_vs[0]) if best_vs.size else float("nan")
        x_best, y_best = step_profile_arrays(self.layer_tops, best_vs, self.max_depth)
        self.best_curve_item.setData(freq, best_curve)
        self.best_profile_item.setData(x_best, y_best)
        self.result_info_label.setText(
            f"当前查看算法：{str(self.result.get('method_label', '未知算法'))}；"
            f"初值失配 {float(self.result['initial_misfit']):.4f}，"
            f"最优失配 {float(self.result['best_misfit']):.4f}；"
            f"顶部层最优 Vs≈{top_best_vs:.1f} m/s。"
            " 注意：曲线图显示的是相速度 cR，不是 Vs。"
        )

    def _run_single_method(self, method: str) -> dict[str, object] | None:
        if self.project is None or self.layer_tops.size == 0 or self.true_vs.size == 0:
            self.status_message.emit("反演失败：当前没有可用层状模型。")
            return None
        if self.observed_curve.shape[0] < 4:
            self.status_message.emit("反演失败：频散曲线点数过少，请至少拾取 4 个点。")
            return None

        initial_vs, lower_vs, upper_vs = self.current_model_arrays()
        if np.any(initial_vs <= 0.0):
            self.status_message.emit("反演失败：初始 Vs 必须为正值。")
            return None
        if np.any(lower_vs <= 0.0) or np.any(upper_vs <= lower_vs):
            self.status_message.emit("反演失败：请检查 Vs 上下界设置，需满足 upper > lower > 0。")
            return None

        try:
            return invert_layered_vs(
                self.observed_curve[:, 0],
                self.observed_curve[:, 1],
                self.layer_tops,
                initial_vs,
                vp_values=self.true_vp,
                max_depth=self.max_depth,
                vs_lower=lower_vs,
                vs_upper=upper_vs,
                method=method,
                iterations=self.iterations_spin.value(),
                population=self.population_spin.value(),
                seed=self.seed_spin.value(),
                dz=self.depth_step_spin.value(),
                rayleigh_factor=self.rayleigh_factor_spin.value(),
                depth_factor=self.depth_factor_spin.value(),
            )
        except Exception as exc:
            self.status_message.emit(f"反演失败：{exc}")
            return None

    def run_inversion(self) -> None:
        method = self._selected_method()
        result = self._run_single_method(method)
        if result is None:
            return
        self.compare_results = {method: result}
        self.result = result
        self._emit_result_changed()
        self._refresh_plots()
        self.status_message.emit(f"{INVERSION_METHOD_LABELS[method]} 反演完成。")

    def compare_algorithms(self) -> None:
        if self.project is None or self.layer_tops.size == 0 or self.true_vs.size == 0:
            self.status_message.emit("算法对比失败：当前没有可用层状模型。")
            return
        if self.observed_curve.shape[0] < 4:
            self.status_message.emit("算法对比失败：频散曲线点数过少，请至少拾取 4 个点。")
            return

        initial_vs, lower_vs, upper_vs = self.current_model_arrays()
        try:
            results = compare_inversion_methods(
                self.observed_curve[:, 0],
                self.observed_curve[:, 1],
                self.layer_tops,
                initial_vs,
                vp_values=self.true_vp,
                max_depth=self.max_depth,
                vs_lower=lower_vs,
                vs_upper=upper_vs,
                iterations=self.iterations_spin.value(),
                population=self.population_spin.value(),
                seed=self.seed_spin.value(),
                dz=self.depth_step_spin.value(),
                rayleigh_factor=self.rayleigh_factor_spin.value(),
                depth_factor=self.depth_factor_spin.value(),
            )
        except Exception as exc:
            self.status_message.emit(f"算法对比失败：{exc}")
            return

        self.compare_results = results
        best_method = min(results.items(), key=lambda item: float(item[1]["best_misfit"]))[0]
        self.result = results[best_method]
        self._emit_result_changed()
        self.algorithm_combo.blockSignals(True)
        self.algorithm_combo.setCurrentIndex(self.algorithm_combo.findData(best_method))
        self.algorithm_combo.blockSignals(False)
        self._refresh_plots()
        self.status_message.emit(f"三算法对比完成，当前显示最优算法：{INVERSION_METHOD_LABELS[best_method]}。")

    def export_result(self) -> None:
        if self.result is None or self.observed_curve.size == 0:
            self.status_message.emit("没有可导出的反演结果，请先完成反演。")
            return

        initial_vs, lower_vs, upper_vs = self.current_model_arrays()
        true_curve = approximate_phase_velocity_curve(
            self.observed_curve[:, 0],
            self.layer_tops,
            self.true_vs,
            vp_values=self.true_vp,
            max_depth=self.max_depth,
            dz=self.depth_step_spin.value(),
            rayleigh_factor=self.rayleigh_factor_spin.value(),
            depth_factor=self.depth_factor_spin.value(),
        )

        self.output_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        default_path = self.output_dir / f"inversion_result_{stamp}"
        path, _ = QFileDialog.getSaveFileName(self, "导出反演结果", str(default_path), "CSV (*.csv)")
        if not path:
            return

        base = Path(path)
        model_path = base.with_name(base.stem + "_model.csv")
        curve_path = base.with_name(base.stem + "_curve.csv")
        summary_path = base.with_name(base.stem + "_summary.csv")

        with model_path.open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(
                ["layer_index", "top_depth_m", "true_vs_mps", "initial_vs_mps", "best_vs_mps", "lower_vs_mps", "upper_vs_mps"]
            )
            for idx in range(self.layer_tops.size):
                writer.writerow(
                    [
                        idx + 1,
                        float(self.layer_tops[idx]),
                        float(self.true_vs[idx]),
                        float(initial_vs[idx]),
                        float(self.result["best_vs"][idx]),
                        float(lower_vs[idx]),
                        float(upper_vs[idx]),
                    ]
                )

        with curve_path.open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(
                ["frequency_hz", "observed_velocity_mps", "true_velocity_mps", "initial_velocity_mps", "predicted_velocity_mps"]
            )
            for idx in range(self.observed_curve.shape[0]):
                writer.writerow(
                    [
                        float(self.observed_curve[idx, 0]),
                        float(self.observed_curve[idx, 1]),
                        float(true_curve[idx]),
                        float(self.result["initial_curve"][idx]),
                        float(self.result["best_curve"][idx]),
                    ]
                )

        with summary_path.open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(["method", "initial_misfit", "best_misfit"])
            results = self.compare_results if self.compare_results else {str(self.result["method"]): self.result}
            for method, result in results.items():
                writer.writerow([INVERSION_METHOD_LABELS.get(method, method), result["initial_misfit"], result["best_misfit"]])

        self.status_message.emit(
            f"反演结果已导出：{model_path.name}, {curve_path.name}, {summary_path.name}"
        )
