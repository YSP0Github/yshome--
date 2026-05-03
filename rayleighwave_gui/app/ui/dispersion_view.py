from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

import numpy as np
import pyqtgraph as pg
from PySide6.QtCore import QRectF, Qt, Signal
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
    QVBoxLayout,
    QWidget,
)

from app.analysis.dispersion import compute_phase_velocity_spectrum, pick_peak_curve
from app.analysis.rayleigh import estimate_rayleigh_factor, estimate_rayleigh_velocity


class DispersionView(QWidget):
    status_message = Signal(str)
    curve_updated = Signal(object)

    def __init__(self, output_dir: str | Path, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.output_dir = Path(output_dir)

        self.records: np.ndarray | None = None
        self.time_axis: np.ndarray | None = None
        self.receiver_x: np.ndarray | None = None
        self.source_x: float | None = None
        self.component = "vz"
        self.reference_vp: float | None = None
        self.reference_vs: float | None = None

        self.freq_axis: np.ndarray | None = None
        self.velocity_axis: np.ndarray | None = None
        self.energy: np.ndarray | None = None
        self.picks: list[tuple[float, float]] = []
        self._current_subset_info = ""
        self._current_subset_short_label = ""

        self._build_ui()

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

        controls_group = QGroupBox("频散分析设置")
        controls_layout = QGridLayout(controls_group)

        self.velocity_min_spin = self._make_double_spin(10.0, 10000.0, 80.0, 1)
        self.velocity_max_spin = self._make_double_spin(20.0, 12000.0, 1500.0, 1)
        self.velocity_count_spin = self._make_int_spin(16, 1200, 181)
        self.freq_min_spin = self._make_double_spin(0.0, 500.0, 2.0, 1)
        self.freq_max_spin = self._make_double_spin(0.5, 1000.0, 60.0, 1)
        self.max_pick_points_spin = self._make_int_spin(8, 200, 36)
        self.array_mode_combo = QComboBox()
        self.array_mode_combo.addItem("自动选择较长单侧（推荐）", "auto_single")
        self.array_mode_combo.addItem("全阵列（双向）", "full")
        self.array_mode_combo.addItem("震源左侧单向", "left")
        self.array_mode_combo.addItem("震源右侧单向", "right")
        self.normalize_check = QCheckBox("按频率归一化各道相位")
        self.normalize_check.setChecked(True)

        self.compute_button = QPushButton("计算频散能量图")
        self.autopick_button = QPushButton("自动初拾曲线")
        self.clear_pick_button = QPushButton("清空拾取")
        self.export_pick_button = QPushButton("导出曲线 CSV")

        controls_layout.addWidget(QLabel("速度最小值 (m/s)"), 0, 0)
        controls_layout.addWidget(self.velocity_min_spin, 0, 1)
        controls_layout.addWidget(QLabel("速度最大值 (m/s)"), 0, 2)
        controls_layout.addWidget(self.velocity_max_spin, 0, 3)
        controls_layout.addWidget(QLabel("速度采样数"), 0, 4)
        controls_layout.addWidget(self.velocity_count_spin, 0, 5)

        controls_layout.addWidget(QLabel("频率最小值 (Hz)"), 1, 0)
        controls_layout.addWidget(self.freq_min_spin, 1, 1)
        controls_layout.addWidget(QLabel("频率最大值 (Hz)"), 1, 2)
        controls_layout.addWidget(self.freq_max_spin, 1, 3)
        controls_layout.addWidget(QLabel("自动拾取点数"), 1, 4)
        controls_layout.addWidget(self.max_pick_points_spin, 1, 5)

        controls_layout.addWidget(QLabel("阵列筛选"), 2, 0)
        controls_layout.addWidget(self.array_mode_combo, 2, 1, 1, 2)
        controls_layout.addWidget(self.normalize_check, 2, 3, 1, 3)
        controls_layout.addWidget(self.compute_button, 3, 0, 1, 2)
        controls_layout.addWidget(self.autopick_button, 3, 2, 1, 2)
        controls_layout.addWidget(self.clear_pick_button, 3, 4)
        controls_layout.addWidget(self.export_pick_button, 3, 5)

        info_group = QGroupBox("数据说明")
        info_form = QFormLayout(info_group)
        self.input_info_label = QLabel("暂无记录数据")
        self.result_info_label = QLabel("尚未计算频散能量图")
        self.physics_info_label = QLabel("物理提示：频散图纵轴是瑞雷波相速度 cR，不是模型 Vs。")
        self.physics_info_label.setWordWrap(True)
        self.pick_info_label = QLabel("提示：左键添加；左键靠近已有点可改点；右键删除最近点；自动拾取采用连续主脊跟踪 + 上肩修正")
        self.pick_info_label.setWordWrap(True)
        info_form.addRow("当前输入", self.input_info_label)
        info_form.addRow("当前结果", self.result_info_label)
        info_form.addRow("物理提示", self.physics_info_label)
        info_form.addRow("拾取说明", self.pick_info_label)

        self.plot = pg.PlotWidget()
        self.plot.showGrid(x=True, y=True, alpha=0.2)
        self.plot.setLabel("bottom", "Frequency (Hz)")
        self.plot.setLabel("left", "Phase Velocity (m/s)")
        self.plot.setMenuEnabled(False)
        self.plot.setTitle("频散能量图")
        self.image = pg.ImageItem()
        if hasattr(self.image, "setAutoDownsample"):
            self.image.setAutoDownsample(True)
        self.plot.addItem(self.image)
        self.pick_curve = self.plot.plot(pen=pg.mkPen("#f59e0b", width=2.0))
        self.pick_scatter = pg.ScatterPlotItem(size=8, symbol="o", brush=pg.mkBrush("#fde047"), pen=pg.mkPen("#92400e", width=1.0))
        self.plot.addItem(self.pick_scatter)

        self.hist = pg.HistogramLUTWidget()
        self.hist.setImageItem(self.image)
        self.hist.gradient.loadPreset("viridis")

        plot_container = QWidget()
        plot_layout = QHBoxLayout(plot_container)
        plot_layout.setContentsMargins(0, 0, 0, 0)
        plot_layout.addWidget(self.plot, 1)
        plot_layout.addWidget(self.hist)

        layout.addWidget(controls_group)
        layout.addWidget(info_group)
        layout.addWidget(plot_container, 1)

        self.compute_button.clicked.connect(self.compute_dispersion)
        self.autopick_button.clicked.connect(self.auto_pick_curve)
        self.clear_pick_button.clicked.connect(self.clear_picks)
        self.export_pick_button.clicked.connect(self.export_picks)
        self.array_mode_combo.currentIndexChanged.connect(self.on_array_mode_changed)
        self.plot.scene().sigMouseClicked.connect(self._on_plot_clicked)
        self.clear_result(clear_input=True)

    def set_reference_model(self, vp: float | None, vs: float | None) -> None:
        self.reference_vp = None if vp is None else float(vp)
        self.reference_vs = None if vs is None else float(vs)
        self._update_physics_info()

    def _physics_note(self) -> str:
        if self.reference_vp is None or self.reference_vs is None:
            return "物理提示：频散图纵轴是瑞雷波相速度 cR，不是模型 Vs。"
        factor = estimate_rayleigh_factor(self.reference_vp, self.reference_vs)
        velocity = estimate_rayleigh_velocity(self.reference_vp, self.reference_vs)
        return (
            "物理提示：频散图纵轴是瑞雷波相速度 cR，不是模型 Vs。"
            f" 当前顶部层理论 cR≈{velocity:.1f} m/s ≈ {factor:.3f}×Vs_top({self.reference_vs:.1f} m/s)。"
        )

    def _update_physics_info(self) -> None:
        self.physics_info_label.setText(self._physics_note())

    def clear_result(self, *, clear_input: bool = False) -> None:
        self.freq_axis = None
        self.velocity_axis = None
        self.energy = None
        self._current_subset_info = ""
        self._current_subset_short_label = ""
        self.picks.clear()
        self.pick_curve.setData([], [])
        self.pick_scatter.setData([], [])
        self.curve_updated.emit(np.empty((0, 2), dtype=np.float32))
        self.image.setImage(np.zeros((2, 2), dtype=float), autoLevels=False)
        self.image.setRect(QRectF(0.0, 0.0, 1.0, 1.0))
        self.image.setLevels((0.0, 1.0))
        self.plot.setTitle("频散能量图")
        self.result_info_label.setText("尚未计算频散能量图")
        self._update_physics_info()
        self.pick_info_label.setText("Auto-pick uses ridge tracking + shoulder refinement + outlier filtering.")
        if clear_input:
            self.records = None
            self.time_axis = None
            self.receiver_x = None
            self.source_x = None
            self.component = "vz"
            self.input_info_label.setText("暂无记录数据")

    def reset_view(self) -> None:
        self.plot.enableAutoRange()

    def set_records(
        self,
        records: np.ndarray,
        time_axis: np.ndarray,
        receiver_x: np.ndarray,
        *,
        component: str,
        source_x: float | None = None,
    ) -> None:
        self.records = np.asarray(records, dtype=np.float32)
        self.time_axis = np.asarray(time_axis, dtype=np.float32)
        self.receiver_x = np.asarray(receiver_x, dtype=np.float32)
        self.source_x = None if source_x is None else float(source_x)
        self.component = component

        if self.records.ndim != 2 or self.time_axis.size < 2 or self.receiver_x.size == 0:
            self.input_info_label.setText("记录格式无效")
            return

        dt = float(np.median(np.diff(self.time_axis)))
        tmax = float(self.time_axis[-1]) if self.time_axis.size else 0.0
        nyquist = 0.5 / max(dt, 1e-12)
        self.freq_max_spin.setMaximum(max(1.0, min(1000.0, nyquist)))
        if self.freq_max_spin.value() > nyquist:
            self.freq_max_spin.setValue(max(1.0, round(nyquist * 0.95, 1)))
        self._update_input_info()

    def _selected_array_mode(self) -> str:
        return str(self.array_mode_combo.currentData())

    def _receiver_subset(self) -> tuple[np.ndarray, np.ndarray, np.ndarray, str, str]:
        if self.records is None or self.receiver_x is None:
            raise ValueError("当前没有可用接收记录。")

        receiver_x = np.asarray(self.receiver_x, dtype=float).reshape(-1)
        mode = self._selected_array_mode()
        tol = 1e-6

        def build_side(side: str) -> tuple[np.ndarray, np.ndarray, np.ndarray, str, str]:
            if self.source_x is None or not np.isfinite(self.source_x):
                raise ValueError("当前未提供震源位置，无法按震源左右侧筛选接收器。")
            if side == "left":
                mask = receiver_x < self.source_x - tol
                actual = receiver_x[mask]
                offsets = self.source_x - actual
                short_label = "震源左侧单向"
            else:
                mask = receiver_x > self.source_x + tol
                actual = receiver_x[mask]
                offsets = actual - self.source_x
                short_label = "震源右侧单向"
            if actual.size < 2:
                raise ValueError(f"{short_label}接收器不足 2 道，无法计算单向频散。")
            order = np.argsort(offsets)
            indices = np.flatnonzero(mask)[order]
            actual_sorted = actual[order].astype(np.float32, copy=False)
            effective_x = offsets[order].astype(np.float32, copy=False)
            info = (
                f"{short_label}，{indices.size} 道，实际 x={float(np.min(actual_sorted)):.1f}~{float(np.max(actual_sorted)):.1f} m，"
                f"等效偏移距={float(effective_x[0]):.1f}~{float(effective_x[-1]):.1f} m，震源 x={float(self.source_x):.1f} m"
            )
            return indices, effective_x, actual_sorted, short_label, info

        if mode == "full":
            order = np.argsort(receiver_x)
            actual_sorted = receiver_x[order].astype(np.float32, copy=False)
            info = (
                f"全阵列（双向），{order.size} 道，x={float(np.min(actual_sorted)):.1f}~{float(np.max(actual_sorted)):.1f} m"
            )
            if self.source_x is not None and np.isfinite(self.source_x):
                info += f"，震源 x={float(self.source_x):.1f} m"
                if float(np.min(actual_sorted)) < float(self.source_x) < float(np.max(actual_sorted)):
                    info += "；注意：震源位于阵列内部时，双向传播会降低自动拾取稳定性"
            return order.astype(int, copy=False), actual_sorted, actual_sorted, "全阵列（双向）", info

        if mode in {"left", "right"}:
            return build_side(mode)

        options: list[tuple[int, float, np.ndarray, np.ndarray, np.ndarray, str, str]] = []
        for side in ("left", "right"):
            try:
                indices, effective_x, actual_sorted, short_label, info = build_side(side)
            except ValueError:
                continue
            aperture = float(effective_x[-1] - effective_x[0]) if effective_x.size > 1 else 0.0
            options.append((indices.size, aperture, indices, effective_x, actual_sorted, short_label, info))

        if not options:
            order = np.argsort(receiver_x)
            actual_sorted = receiver_x[order].astype(np.float32, copy=False)
            info = (
                f"自动单侧筛选不可用，已回退到全阵列（双向），{order.size} 道，"
                f"x={float(np.min(actual_sorted)):.1f}~{float(np.max(actual_sorted)):.1f} m"
            )
            return order.astype(int, copy=False), actual_sorted, actual_sorted, "自动→全阵列（双向）", info

        options.sort(key=lambda item: (item[0], item[1]), reverse=True)
        _, _, indices, effective_x, actual_sorted, short_label, info = options[0]
        auto_label = f"自动→{short_label}"
        return indices, effective_x, actual_sorted, auto_label, info.replace(short_label, auto_label, 1)

    def _update_input_info(self) -> None:
        if self.records is None or self.time_axis is None or self.receiver_x is None or self.records.ndim != 2:
            self.input_info_label.setText("暂无记录数据")
            return

        dt = float(np.median(np.diff(self.time_axis))) if self.time_axis.size > 1 else 0.0
        tmax = float(self.time_axis[-1]) if self.time_axis.size else 0.0
        try:
            indices, effective_x, actual_sorted, short_label, info = self._receiver_subset()
            self.input_info_label.setText(
                f"{self.component.upper()}，总计 {self.records.shape[1]} 道，当前用于频散 {indices.size} 道，"
                f"{self.records.shape[0]} 采样，dt={dt:.6f} s，tmax={tmax:.3f} s；{info}"
            )
        except Exception as exc:
            xmin = float(np.min(self.receiver_x))
            xmax = float(np.max(self.receiver_x))
            self.input_info_label.setText(
                f"{self.component.upper()}，{self.records.shape[1]} 道，{self.records.shape[0]} 采样，dt={dt:.6f} s，"
                f"tmax={tmax:.3f} s，x={xmin:.1f}~{xmax:.1f} m；当前筛选不可用：{exc}"
            )

    def on_array_mode_changed(self) -> None:
        self._update_input_info()
        if self.freq_axis is not None or self.energy is not None or self.picks:
            self.clear_result(clear_input=False)
            self.status_message.emit("阵列筛选方式已改变，请重新计算频散能量图。")

    def _update_pick_items(self) -> None:
        if not self.picks:
            self.pick_curve.setData([], [])
            self.pick_scatter.setData([], [])
            self.pick_info_label.setText("Auto-pick uses ridge tracking + shoulder refinement + outlier filtering.")
            self.curve_updated.emit(np.empty((0, 2), dtype=np.float32))
            return

        self.picks.sort(key=lambda item: item[0])
        freq = np.asarray([item[0] for item in self.picks], dtype=float)
        velocity = np.asarray([item[1] for item in self.picks], dtype=float)
        self.pick_curve.setData(freq, velocity)
        self.pick_scatter.setData(freq, velocity)
        self.pick_info_label.setText(f"Picked {len(self.picks)} points; auto-pick uses ridge tracking + shoulder refinement + outlier filtering.")
        self.curve_updated.emit(np.column_stack((freq, velocity)).astype(np.float32, copy=False))

    def _on_plot_clicked(self, event) -> None:
        if self.freq_axis is None or self.velocity_axis is None or self.energy is None:
            return
        if not self.plot.sceneBoundingRect().contains(event.scenePos()):
            return
        mouse_point = self.plot.getPlotItem().vb.mapSceneToView(event.scenePos())
        freq = float(mouse_point.x())
        velocity = float(mouse_point.y())

        if (
            freq < float(self.freq_axis[0])
            or freq > float(self.freq_axis[-1])
            or velocity < float(self.velocity_axis[0])
            or velocity > float(self.velocity_axis[-1])
        ):
            return

        if self.picks:
            picks = np.asarray(self.picks, dtype=float)
            freq_span = max(float(self.freq_axis[-1] - self.freq_axis[0]), 1e-6)
            vel_span = max(float(self.velocity_axis[-1] - self.velocity_axis[0]), 1e-6)
            distance = np.sqrt(((picks[:, 0] - freq) / freq_span) ** 2 + ((picks[:, 1] - velocity) / vel_span) ** 2)
            nearest_index = int(np.argmin(distance))
            nearest_distance = float(distance[nearest_index])
        else:
            nearest_index = -1
            nearest_distance = float("inf")

        if event.button() == Qt.RightButton and self.picks:
            self.picks.pop(nearest_index)
            self.status_message.emit("已删除距离最近的频散拾取点。")
        elif nearest_distance <= 0.035:
            self.picks[nearest_index] = (freq, velocity)
            self.status_message.emit("已修改最近的频散拾取点。")
        else:
            self.picks.append((freq, velocity))
            self.status_message.emit("已添加新的频散拾取点。")
        self._update_pick_items()

    def compute_dispersion(self) -> None:
        if self.records is None or self.time_axis is None or self.receiver_x is None:
            self.status_message.emit("频散分析失败：当前没有可用接收记录。")
            return

        try:
            indices, effective_receiver_x, actual_sorted, short_label, info = self._receiver_subset()
            freq_axis, velocity_axis, energy = compute_phase_velocity_spectrum(
                self.records[:, indices],
                self.time_axis,
                effective_receiver_x,
                velocity_min=self.velocity_min_spin.value(),
                velocity_max=self.velocity_max_spin.value(),
                n_velocity=self.velocity_count_spin.value(),
                freq_min=self.freq_min_spin.value(),
                freq_max=self.freq_max_spin.value(),
                normalize_traces=self.normalize_check.isChecked(),
            )
        except Exception as exc:
            self.status_message.emit(f"频散分析失败：{exc}")
            return

        self.freq_axis = freq_axis
        self.velocity_axis = velocity_axis
        self.energy = energy
        self._current_subset_info = info
        self._current_subset_short_label = short_label
        self.picks.clear()
        self._update_pick_items()

        rect = QRectF(
            float(freq_axis[0]),
            float(velocity_axis[0]),
            float(freq_axis[-1] - freq_axis[0]) if freq_axis.size > 1 else 1.0,
            float(velocity_axis[-1] - velocity_axis[0]) if velocity_axis.size > 1 else 1.0,
        )
        self.image.setImage(energy, autoLevels=False)
        self.image.setRect(rect)
        self.image.setLevels((0.0, 1.0))
        self.plot.setTitle(f"频散能量图 - {self.component.upper()} / {short_label}")
        self.result_info_label.setText(
            f"{short_label}；{freq_axis.size} 个频率采样，{velocity_axis.size} 个速度采样，能量范围 {float(np.max(energy)):.3f}"
        )
        self._update_physics_info()
        self.status_message.emit("频散能量图计算完成。")

    def auto_pick_curve(self) -> None:
        if self.freq_axis is None or self.velocity_axis is None or self.energy is None:
            self.status_message.emit("Please compute the dispersion energy image before auto-picking.")
            return

        picks = pick_peak_curve(
            self.freq_axis,
            self.velocity_axis,
            self.energy,
            max_points=self.max_pick_points_spin.value(),
        )
        self.picks = [(float(freq), float(velocity)) for freq, velocity in picks]
        self._update_pick_items()
        subset = self._current_subset_short_label or "current dispersion image"
        self.status_message.emit(
            f"Auto-pick finished (ridge tracking + shoulder refinement + outlier filtering), {subset}, {len(self.picks)} points."
        )

    def clear_picks(self) -> None:
        self.picks.clear()
        self._update_pick_items()
        self.status_message.emit("已清空频散曲线拾取结果。")

    def export_picks(self) -> None:
        if not self.picks:
            self.status_message.emit("没有可导出的频散曲线点，请先手动或自动拾取。")
            return

        self.output_dir.mkdir(parents=True, exist_ok=True)
        default_path = self.output_dir / f"dispersion_curve_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        path, _ = QFileDialog.getSaveFileName(self, "导出频散曲线", str(default_path), "CSV (*.csv)")
        if not path:
            return

        picks = sorted(self.picks, key=lambda item: item[0])
        with Path(path).open("w", newline="", encoding="utf-8-sig") as fp:
            writer = csv.writer(fp)
            writer.writerow(["frequency_hz", "phase_velocity_mps"])
            for freq, velocity in picks:
                writer.writerow([freq, velocity])

        self.status_message.emit(f"频散曲线已导出：{path}")
