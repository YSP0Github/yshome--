from __future__ import annotations

from datetime import datetime
from pathlib import Path
import time

import numpy as np

from PySide6.QtCore import QTimer, Qt
from PySide6.QtGui import QAction
from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QFileDialog,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QPlainTextEdit,
    QSplitter,
    QStatusBar,
    QStyle,
    QTabWidget,
    QToolBar,
    QWidget,
)

from app.io.export import export_animation_gif, export_records_csv, export_records_npz, export_wavefield_png
from app.io.project_io import load_project, save_project
from app.model.layers import build_layered_model
from app.physics.receiver import build_receiver_array
from app.types import ProjectConfig
from app.ui.control_panel import ControlPanel
from app.ui.dispersion_view import DispersionView
from app.ui.inversion_view import InversionView
from app.ui.model_view import ModelView
from app.ui.seismogram_view import SeismogramView
from app.ui.theme import apply_app_theme
from app.ui.validation_view import ValidationView
from app.ui.wavefield_view import WavefieldView
from app.ui.worker import SimulationWorker
from app.utils.math_utils import estimate_stable_dt
from app.utils.validators import validate_project


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.project_root = Path(__file__).resolve().parents[2]
        self.outputs_dir = self.project_root / "outputs"
        self.examples_dir = self.project_root / "examples"

        self.worker: SimulationWorker | None = None
        self.current_project: ProjectConfig | None = None
        self.preview_payload: dict[str, object] | None = None
        self.latest_frame: dict[str, object] | None = None
        self.pending_frame: dict[str, object] | None = None
        self.last_result: dict[str, object] | None = None
        self.selected_trace_index = 0
        self.theme_name = "dark"
        self.record_cache_vx: np.ndarray | None = None
        self.record_cache_vz: np.ndarray | None = None
        self.record_cache_time: np.ndarray | None = None
        self.record_cache_count = 0
        self.receiver_x_cache: np.ndarray | None = None
        self.receiver_z_cache: np.ndarray | None = None
        self._last_seismogram_draw_step = -1
        self._last_seismogram_draw_ts = 0.0
        self._last_dispersion_cache_ts = 0.0
        self._wavefield_display_absmax = 0.0

        self.preview_timer = QTimer(self)
        self.preview_timer.setSingleShot(True)
        self.preview_timer.setInterval(350)
        self.preview_timer.timeout.connect(lambda: self.preview_model(show_dialog=False, strict_dt=False))
        self.render_timer = QTimer(self)
        self.render_timer.setInterval(33)
        self.render_timer.timeout.connect(self.render_pending_frame)

        self.setWindowTitle("二维面波传播正演交互式模拟工具")
        self.resize(1640, 980)
        self._build_ui()
        self._build_toolbar()
        self._connect_signals()
        self._apply_bottom_tab_layout()
        self.apply_theme(self.theme_name)
        self.preview_model(show_dialog=False, strict_dt=False)
        self.update_action_states()

    def _build_ui(self) -> None:
        central = QWidget()
        self.setCentralWidget(central)

        self.control_panel = ControlPanel()
        self.model_view = ModelView()
        self.wavefield_view = WavefieldView()
        self.seismogram_view = SeismogramView()
        self.dispersion_view = DispersionView(self.outputs_dir / "dispersion")
        self.inversion_view = InversionView(self.outputs_dir / "inversion")
        self.validation_view = ValidationView(self.outputs_dir / "validation")
        self.log_edit = QPlainTextEdit()
        self.log_edit.setReadOnly(True)
        self.log_edit.setPlaceholderText("运行日志将在这里显示…")

        self.view_tabs = QTabWidget()
        self.view_tabs.addTab(self.model_view, "模型与示意图")
        self.view_tabs.addTab(self.wavefield_view, "波场动画")

        self.bottom_tabs = QTabWidget()
        self.bottom_tabs.addTab(self.seismogram_view, "接收记录")
        self.bottom_tabs.addTab(self.dispersion_view, "频散分析")
        self.bottom_tabs.addTab(self.inversion_view, "Vs反演")
        self.bottom_tabs.addTab(self.validation_view, "回代验证")
        self.bottom_tabs.addTab(self.log_edit, "运行日志")

        self.right_splitter = QSplitter(Qt.Vertical)
        self.right_splitter.addWidget(self.view_tabs)
        self.right_splitter.addWidget(self.bottom_tabs)
        self.right_splitter.setSizes([520, 420])

        main_splitter = QSplitter(Qt.Horizontal)
        main_splitter.addWidget(self.control_panel)
        main_splitter.addWidget(self.right_splitter)
        main_splitter.setSizes([430, 1200])

        layout = QHBoxLayout(central)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.addWidget(main_splitter)

        status_bar = QStatusBar()
        self.setStatusBar(status_bar)
        self.status_label = QLabel("就绪")
        self.coord_label = QLabel("x = -- m, z = -- m")
        self.cfl_label = QLabel("CFL: --")
        self.amplitude_label = QLabel("幅值: --")
        self.step_label = QLabel("step = 0")
        self.time_label = QLabel("t = 0.0000 s")
        status_bar.addWidget(self.status_label, 1)
        status_bar.addPermanentWidget(self.coord_label)
        status_bar.addPermanentWidget(self.cfl_label)
        status_bar.addPermanentWidget(self.amplitude_label)
        status_bar.addPermanentWidget(self.step_label)
        status_bar.addPermanentWidget(self.time_label)

    def _build_toolbar(self) -> None:
        toolbar = QToolBar("快捷操作")
        toolbar.setMovable(False)
        self.addToolBar(toolbar)

        style = self.style()
        self.action_preview = QAction(style.standardIcon(QStyle.SP_BrowserReload), "预览", self)
        self.action_start = QAction(style.standardIcon(QStyle.SP_MediaPlay), "运行", self)
        self.action_pause = QAction(style.standardIcon(QStyle.SP_MediaPause), "暂停/继续", self)
        self.action_stop = QAction(style.standardIcon(QStyle.SP_MediaStop), "停止", self)
        self.action_fit = QAction(style.standardIcon(QStyle.SP_ComputerIcon), "重置视图", self)
        self.action_save = QAction(style.standardIcon(QStyle.SP_DialogSaveButton), "保存工程", self)
        self.action_load = QAction(style.standardIcon(QStyle.SP_DialogOpenButton), "加载工程", self)
        self.action_export = QAction(style.standardIcon(QStyle.SP_DriveFDIcon), "导出记录", self)

        for action in (
            self.action_preview,
            self.action_start,
            self.action_pause,
            self.action_stop,
            self.action_fit,
            self.action_save,
            self.action_load,
            self.action_export,
        ):
            toolbar.addAction(action)

        toolbar.addSeparator()
        toolbar.addWidget(QLabel("主题"))
        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["浅色","深色"])
        toolbar.addWidget(self.theme_combo)

        toolbar.addSeparator()
        toolbar.addWidget(QLabel("当前单道"))
        self.trace_info_label = QLabel("1")
        toolbar.addWidget(self.trace_info_label)

    def _connect_signals(self) -> None:
        cp = self.control_panel
        cp.preview_button.clicked.connect(lambda: self.preview_model(show_dialog=False, strict_dt=False))
        cp.start_button.clicked.connect(self.start_simulation)
        cp.pause_button.clicked.connect(self.toggle_pause)
        cp.stop_button.clicked.connect(self.stop_simulation)
        cp.save_project_button.clicked.connect(self.save_project_dialog)
        cp.load_project_button.clicked.connect(self.load_project_dialog)
        cp.export_data_button.clicked.connect(self.export_records_dialog)
        cp.export_png_button.clicked.connect(self.export_png_dialog)
        cp.export_gif_button.clicked.connect(self.export_gif_dialog)
        cp.seismogram_combo.currentTextChanged.connect(lambda _: self.refresh_from_latest_frame())
        cp.apply_preset_button.clicked.connect(lambda: self.schedule_preview(force=True))
        cp.pick_source_button.toggled.connect(self.on_pick_mode_changed)
        cp.pick_receiver_button.toggled.connect(self.on_pick_mode_changed)
        cp.layers_table.itemChanged.connect(self.schedule_preview)

        for widget in cp.watched_widgets():
            if hasattr(widget, "valueChanged"):
                widget.valueChanged.connect(self.schedule_preview)
            elif hasattr(widget, "currentTextChanged"):
                widget.currentTextChanged.connect(self.schedule_preview)
            elif hasattr(widget, "textChanged"):
                widget.textChanged.connect(self.schedule_preview)
            elif hasattr(widget, "toggled"):
                widget.toggled.connect(self.schedule_preview)

        self.model_view.coordinate_clicked.connect(self.handle_model_click)
        self.model_view.coordinate_hovered.connect(self.on_coordinate_hovered)
        self.seismogram_view.trace_selected.connect(self.on_trace_selected)
        self.validation_view.trace_selected.connect(self.on_trace_selected)
        self.bottom_tabs.currentChanged.connect(self.on_bottom_tab_changed)
        self.dispersion_view.status_message.connect(self.log)
        self.dispersion_view.curve_updated.connect(self.inversion_view.set_observed_curve)
        self.dispersion_view.curve_updated.connect(
            lambda picks: self.validation_view.set_observed_curve(picks, self.dispersion_view.component)
        )
        self.inversion_view.status_message.connect(self.log)
        self.inversion_view.result_changed.connect(self.validation_view.set_inversion_result)
        self.validation_view.status_message.connect(self.log)

        self.action_preview.triggered.connect(lambda: self.preview_model(show_dialog=False, strict_dt=False))
        self.action_start.triggered.connect(self.start_simulation)
        self.action_pause.triggered.connect(self.toggle_pause)
        self.action_stop.triggered.connect(self.stop_simulation)
        self.action_fit.triggered.connect(self.reset_all_views)
        self.action_save.triggered.connect(self.save_project_dialog)
        self.action_load.triggered.connect(self.load_project_dialog)
        self.action_export.triggered.connect(self.export_records_dialog)
        self.theme_combo.currentTextChanged.connect(self.on_theme_changed)

    def _reset_runtime_caches(self) -> None:
        self.pending_frame = None
        self.latest_frame = None
        self.record_cache_vx = None
        self.record_cache_vz = None
        self.record_cache_time = None
        self.receiver_x_cache = None
        self.receiver_z_cache = None
        self.record_cache_count = 0
        self._last_seismogram_draw_step = -1
        self._last_seismogram_draw_ts = 0.0
        self._last_dispersion_cache_ts = 0.0
        self._wavefield_display_absmax = 0.0
        self.dispersion_view.clear_result(clear_input=True)
        self.validation_view.clear_observed_data()

    def _apply_bottom_tab_layout(self) -> None:
        current = self.bottom_tabs.currentWidget()
        if current is self.inversion_view or current is self.validation_view:
            self.right_splitter.setSizes([280, 660])
        elif current is self.dispersion_view:
            self.right_splitter.setSizes([360, 580])
        elif current is self.log_edit:
            self.right_splitter.setSizes([500, 320])
        else:
            self.right_splitter.setSizes([440, 460])

    def on_bottom_tab_changed(self, index: int) -> None:
        self._apply_bottom_tab_layout()
        self.refresh_from_latest_frame()

    def _initialize_runtime_caches(self, project: ProjectConfig) -> None:
        nt = int(round(project.grid.tmax / project.grid.dt)) + 1
        stride = max(project.simulation.record_stride, 1)
        record_nt = (nt + stride - 1) // stride
        nrec = project.receivers.count
        self.record_cache_vx = np.zeros((record_nt, nrec), dtype=np.float32)
        self.record_cache_vz = np.zeros((record_nt, nrec), dtype=np.float32)
        self.record_cache_time = np.zeros(record_nt, dtype=np.float32)
        self.record_cache_count = 0
        self.receiver_x_cache = None
        self.receiver_z_cache = None
        self._last_seismogram_draw_step = -1
        self._last_seismogram_draw_ts = 0.0
        self._last_dispersion_cache_ts = 0.0

    def _is_bottom_tab_visible(self, widget: QWidget) -> bool:
        return self.bottom_tabs.currentWidget() is widget and widget.isVisible()

    def _update_seismogram_views(self, component: str, trace_index: int) -> None:
        if self.record_cache_count <= 0 or self.record_cache_vx is None or self.record_cache_vz is None or self.record_cache_time is None:
            return
        records = self.record_cache_vz[: self.record_cache_count] if component == "vz" else self.record_cache_vx[: self.record_cache_count]
        receiver_x = self.receiver_x_cache if self.receiver_x_cache is not None else np.arange(records.shape[1], dtype=float)
        self.seismogram_view.update_records(
            records=records,
            time_axis=self.record_cache_time[: self.record_cache_count],
            receiver_x=receiver_x,
            component=component,
            trace_index=trace_index,
            source_x=self.current_project.source.x if self.current_project is not None else None,
        )
        self.trace_info_label.setText(str(trace_index + 1))

    def _cache_dispersion_records(self, component: str) -> None:
        if self.record_cache_count <= 0 or self.record_cache_vx is None or self.record_cache_vz is None or self.record_cache_time is None:
            return
        records = self.record_cache_vz[: self.record_cache_count] if component == "vz" else self.record_cache_vx[: self.record_cache_count]
        receiver_x = self.receiver_x_cache if self.receiver_x_cache is not None else np.arange(records.shape[1], dtype=float)
        self.dispersion_view.set_records(
            records=records,
            time_axis=self.record_cache_time[: self.record_cache_count],
            receiver_x=receiver_x,
            component=component,
            source_x=self.current_project.source.x if self.current_project is not None else None,
        )

    def apply_theme(self, theme_name: str) -> None:
        app = QApplication.instance()
        if app is None:
            return
        self.theme_name = theme_name
        apply_app_theme(app, theme_name)
        self.theme_combo.blockSignals(True)
        self.theme_combo.setCurrentText("浅色" if theme_name == "light" else "深色")
        self.theme_combo.blockSignals(False)
        background = "#ffffff" if theme_name == "light" else "#0f172a"
        foreground = "#0f172a" if theme_name == "light" else "#e5e7eb"
        for plot in (
            self.model_view.plot,
            self.wavefield_view.plot,
            *self.seismogram_view.iter_plots(),
            self.dispersion_view.plot,
            self.inversion_view.curve_plot,
            self.inversion_view.profile_plot,
            self.inversion_view.misfit_plot,
            self.validation_view.observed_plot,
            self.validation_view.synthetic_plot,
            self.validation_view.residual_plot,
            self.validation_view.trace_plot,
            self.validation_view.observed_dispersion_plot,
            self.validation_view.synthetic_dispersion_plot,
            self.validation_view.residual_dispersion_plot,
            self.validation_view.curve_compare_plot,
        ):
            plot.setBackground(background)
            for axis_name in ("left", "bottom"):
                axis = plot.getAxis(axis_name)
                axis.setTextPen(foreground)
                axis.setPen(foreground)

    def on_theme_changed(self, text: str) -> None:
        self.apply_theme("light" if text == "浅色" else "dark")
        self.log(f"已切换到{text}主题。")

    def schedule_preview(self, *args, force: bool = False) -> None:
        if self.worker is not None and self.worker.isRunning():
            return
        if force or self.control_panel.auto_preview_check.isChecked():
            self.preview_timer.start()

    def log(self, message: str) -> None:
        stamp = datetime.now().strftime("%H:%M:%S")
        self.log_edit.appendPlainText(f"[{stamp}] {message}")
        self.status_label.setText(message)

    def build_preview_payload(self, project: ProjectConfig) -> dict[str, object]:
        model = build_layered_model(project.grid, project.model)
        receivers = build_receiver_array(project.grid, project.receivers)
        property_name = project.model.property_to_display
        property_field = model[property_name]
        vmax = max(layer.vp for layer in project.model.layers)
        stable_dt = estimate_stable_dt(project.grid, vmax)
        return {
            "field": property_field,
            "x": model["x"],
            "z": model["z"],
            "interfaces": model["interfaces"],
            "source_xy": (project.source.x, project.source.z),
            "receiver_xy": (receivers["x"], receivers["z"]),
            "receiver_ixz": receivers,
            "property_name": property_name,
            "vmax": vmax,
            "stable_dt": stable_dt,
        }

    def preview_model(self, *, show_dialog: bool = False, strict_dt: bool = False) -> bool:
        project = self.control_panel.current_project_config()
        errors, warnings = validate_project(project, strict_dt=strict_dt)
        if errors:
            self.current_project = project
            self.preview_payload = None
            self.status_label.setText(errors[0])
            self.cfl_label.setText("CFL: 待修正")
            if show_dialog:
                QMessageBox.warning(self, "参数错误", "\n".join(errors))
            return False

        payload = self.build_preview_payload(project)
        self.current_project = project
        self.preview_payload = payload
        self.inversion_view.set_project(project)
        top_layer = min(project.model.layers, key=lambda layer: layer.top_depth) if project.model.layers else None
        if top_layer is not None:
            self.dispersion_view.set_reference_model(top_layer.vp, top_layer.vs)
        else:
            self.dispersion_view.set_reference_model(None, None)
        self.validation_view.set_project(project)
        self.selected_trace_index = min(self.selected_trace_index, project.receivers.count - 1)
        self.trace_info_label.setText(str(self.selected_trace_index + 1))
        self.validation_view.set_trace_index(self.selected_trace_index)

        self.model_view.set_model(
            field=payload["field"],
            x=payload["x"],
            z=payload["z"],
            property_name=payload["property_name"],
            interfaces=payload["interfaces"],
            source_xy=payload["source_xy"],
            receiver_xy=payload["receiver_xy"],
            pml_thickness=project.boundary.pml_thickness,
            dx=project.grid.dx,
            dz=project.grid.dz,
            top_boundary=project.boundary.top_boundary,
        )
        self.wavefield_view.set_overlay(
            payload["source_xy"],
            payload["receiver_xy"],
            interfaces=payload["interfaces"],
            x=payload["x"],
            z=payload["z"],
            pml_thickness=project.boundary.pml_thickness,
            dx=project.grid.dx,
            dz=project.grid.dz,
            top_boundary=project.boundary.top_boundary,
        )

        x_extent = (project.grid.nx - 1) * project.grid.dx
        z_extent = (project.grid.nz - 1) * project.grid.dz
        receiver_end = project.receivers.start_x + (project.receivers.count - 1) * project.receivers.spacing
        warning_text = "；".join(warnings) if warnings else ""
        self.control_panel.set_model_summary(
            x_extent=x_extent,
            z_extent=z_extent,
            vmax=payload["vmax"],
            stable_dt=payload["stable_dt"],
            current_dt=project.grid.dt,
            receiver_start=project.receivers.start_x,
            receiver_end=receiver_end,
            receiver_count=project.receivers.count,
            warning_text=warning_text,
        )

        stable = project.grid.dt <= payload["stable_dt"]
        self.cfl_label.setText(
            f"CFL: {'安全' if stable else '过大'}（dt={project.grid.dt:.6f}, 建议≤{payload['stable_dt']:.6f}）"
        )
        self.amplitude_label.setText("幅值: --")
        self.setWindowTitle(f"{project.title} - 二维面波传播正演交互式模拟工具")
        if warnings:
            self.status_label.setText("参数提醒：" + warning_text)
            if show_dialog:
                self.log("参数提醒：" + warning_text)
        else:
            self.log("模型预览已更新。")
        return True

    def handle_model_click(self, x: float, z: float) -> None:
        mode = self.control_panel.placement_mode()
        if mode is None:
            return
        if mode == "source":
            self.control_panel.set_source_coordinates(x, z)
            self.log(f"已设置震源位置：x={x:.2f} m, z={z:.2f} m")
        elif mode == "receiver":
            self.control_panel.set_receiver_start(x, z)
            self.log(f"已设置接收器起点：x={x:.2f} m, z={z:.2f} m")
        self.control_panel.clear_placement_mode()
        self.preview_model()

    def on_pick_mode_changed(self) -> None:
        mode = self.control_panel.placement_mode()
        if mode == "source":
            self.status_label.setText("请在“模型与示意图”标签页中单击设置震源位置。")
        elif mode == "receiver":
            self.status_label.setText("请在“模型与示意图”标签页中单击设置接收器阵列起点。")
        else:
            self.status_label.setText("就绪")

    def on_coordinate_hovered(self, x: float, z: float) -> None:
        self.coord_label.setText(f"x = {x:.2f} m, z = {z:.2f} m")

    def start_simulation(self) -> None:
        if self.worker is not None and self.worker.isRunning():
            QMessageBox.information(self, "提示", "已有模拟正在运行。")
            return

        project = self.control_panel.current_project_config()
        errors, warnings = validate_project(project, strict_dt=True)
        if errors:
            self.current_project = project
            self.status_label.setText(errors[0])
            self.cfl_label.setText("CFL: 过大/待修正")
            QMessageBox.warning(self, "参数错误", "\n".join(errors))
            return
        if warnings:
            self.log("参数提醒：" + "；".join(warnings))

        self.preview_model(show_dialog=False, strict_dt=False)
        if self.preview_payload is None or self.current_project is None:
            return

        self._reset_runtime_caches()
        self.last_result = None
        self._initialize_runtime_caches(self.current_project)
        self.dispersion_view.clear_result(clear_input=True)
        self.worker = SimulationWorker(self.current_project)
        self.worker.frame_ready.connect(self.on_frame_ready)
        self.worker.status_message.connect(self.log)
        self.worker.finished_successfully.connect(self.on_simulation_finished)
        self.worker.failed.connect(self.on_simulation_failed)
        self.worker.pause_state_changed.connect(self.on_pause_state_changed)
        self.worker.start()
        self.render_timer.start()
        self.control_panel.pause_button.setText("暂停")
        self.view_tabs.setCurrentWidget(self.wavefield_view)
        self.update_action_states()
        self.log("模拟已启动。")

    def toggle_pause(self) -> None:
        if self.worker is None or not self.worker.isRunning():
            return
        self.worker.toggle_pause()

    def on_pause_state_changed(self, paused: bool) -> None:
        self.control_panel.pause_button.setText("继续" if paused else "暂停")
        if paused:
            self.render_pending_frame(force=True)
        self.log("模拟已暂停。" if paused else "模拟继续运行。")

    def stop_simulation(self) -> None:
        if self.worker is None or not self.worker.isRunning():
            return
        self.worker.request_stop()
        self.control_panel.stop_button.setEnabled(False)
        self.action_stop.setEnabled(False)
        self.log("已请求停止模拟。")

    def on_frame_ready(self, frame: dict[str, object]) -> None:
        if self.current_project is None:
            return
        self.latest_frame = frame
        self.pending_frame = frame
        frame_max = float(frame.get("max_amplitude", 0.0))
        if np.isfinite(frame_max):
            self._wavefield_display_absmax = max(self._wavefield_display_absmax, frame_max)

        record_start = int(frame.get("record_start", 0))
        record_end = int(frame.get("record_end", 0))
        if record_end > record_start and self.record_cache_vx is not None and self.record_cache_vz is not None and self.record_cache_time is not None:
            vx_chunk = frame["records_vx_chunk"]
            vz_chunk = frame["records_vz_chunk"]
            time_chunk = frame["record_time_chunk"]
            self.record_cache_vx[record_start:record_end, :] = vx_chunk
            self.record_cache_vz[record_start:record_end, :] = vz_chunk
            self.record_cache_time[record_start:record_end] = time_chunk
            self.record_cache_count = max(self.record_cache_count, record_end)
            self.receiver_x_cache = frame["receiver_x"]
            self.receiver_z_cache = frame["receiver_z"]

    def render_pending_frame(self, force: bool = False) -> None:
        frame = self.pending_frame
        if frame is None and force:
            frame = self.latest_frame
        if frame is None or self.preview_payload is None or self.current_project is None:
            return

        if frame is self.pending_frame:
            self.pending_frame = None
        self.wavefield_view.update_wavefield(
            frame["wavefield"],
            self.preview_payload["x"],
            self.preview_payload["z"],
            self.current_project.simulation.wavefield_display,
            float(frame["time"]),
            fixed_abs_max=self._wavefield_display_absmax if self._wavefield_display_absmax > 0.0 else None,
        )

        now = time.perf_counter()
        running = self.worker is not None and self.worker.isRunning()
        should_redraw_seismogram = (
            force
            or self._last_seismogram_draw_step < 0
            or int(frame["step"]) - self._last_seismogram_draw_step >= 128
            or now - self._last_seismogram_draw_ts >= 0.4
            or not running
        )
        if should_redraw_seismogram and self.record_cache_count > 0:
            component = self.current_project.simulation.seismogram_display
            records = self.record_cache_vz[: self.record_cache_count] if component == "vz" else self.record_cache_vx[: self.record_cache_count]
            trace_index = int(min(self.selected_trace_index, max(records.shape[1] - 1, 0)))
            if force or self._is_bottom_tab_visible(self.seismogram_view):
                self._update_seismogram_views(component, trace_index)
                self._last_seismogram_draw_step = int(frame["step"])
                self._last_seismogram_draw_ts = now
            if force or self._is_bottom_tab_visible(self.dispersion_view) or now - self._last_dispersion_cache_ts >= 1.0:
                self._cache_dispersion_records(component)
                self._last_dispersion_cache_ts = now

        self.step_label.setText(f"step = {int(frame['step'])}")
        self.time_label.setText(f"t = {float(frame['time']):.4f} s")
        self.amplitude_label.setText(f"幅值: {float(frame['max_amplitude']):.3e}")

    def on_trace_selected(self, trace_index: int) -> None:
        self.selected_trace_index = trace_index
        self.trace_info_label.setText(str(trace_index + 1))
        self.validation_view.set_trace_index(trace_index)
        self.refresh_from_latest_frame()

    def refresh_from_latest_frame(self) -> None:
        if self.latest_frame is None or self.current_project is None or self.preview_payload is None:
            return
        if self.record_cache_count <= 0 or self.record_cache_vx is None or self.record_cache_vz is None or self.record_cache_time is None:
            return
        component = {"Vz": "vz", "Vx": "vx"}[self.control_panel.seismogram_combo.currentText()]
        self.current_project.simulation.seismogram_display = component
        records = self.record_cache_vz[: self.record_cache_count] if component == "vz" else self.record_cache_vx[: self.record_cache_count]
        trace_index = int(min(self.selected_trace_index, records.shape[1] - 1))
        self._update_seismogram_views(component, trace_index)
        self._cache_dispersion_records(component)
        if self.latest_frame is not None:
            self._last_seismogram_draw_step = int(self.latest_frame["step"])
            self._last_seismogram_draw_ts = time.perf_counter()
            self._last_dispersion_cache_ts = self._last_seismogram_draw_ts

    def on_simulation_finished(self, result: dict[str, object]) -> None:
        self.last_result = result
        self.worker = None
        self.render_pending_frame(force=True)
        self.render_timer.stop()
        self.control_panel.pause_button.setText("暂停")
        self.validation_view.set_observed_data(
            result["records_vx"],
            result["records_vz"],
            result["record_time"],
            result["receiver_positions"]["x"],
            result["receiver_positions"]["z"],
        )
        self.update_action_states()
        backend_name = str(result.get("backend_name", "NumPy"))
        if result.get("stopped", False):
            self.log(f"模拟已停止，当前结果已缓存。（后端：{backend_name}）")
        else:
            self.log(f"模拟完成，结果已缓存。（后端：{backend_name}）")

    def on_simulation_failed(self, message: str) -> None:
        self.worker = None
        self.render_timer.stop()
        self.control_panel.pause_button.setText("暂停")
        self.update_action_states()
        self.log(f"模拟失败：{message}")
        QMessageBox.critical(self, "模拟失败", message)

    def update_action_states(self) -> None:
        running = self.worker is not None and self.worker.isRunning()
        self.control_panel.start_button.setEnabled(not running)
        self.control_panel.pause_button.setEnabled(running)
        self.control_panel.stop_button.setEnabled(running)
        self.action_start.setEnabled(not running)
        self.action_pause.setEnabled(running)
        self.action_stop.setEnabled(running)
        has_result = self.last_result is not None
        self.control_panel.export_data_button.setEnabled(has_result)
        self.control_panel.export_gif_button.setEnabled(has_result)
        self.action_export.setEnabled(has_result)

    def reset_all_views(self) -> None:
        self.model_view.reset_view()
        self.wavefield_view.reset_view()
        self.seismogram_view.reset_view()
        self.dispersion_view.reset_view()
        self.validation_view.reset_view()
        self.log("视图已重置。")

    def save_project_dialog(self) -> None:
        project = self.control_panel.current_project_config()
        default_path = self.examples_dir / "project.json"
        path, _ = QFileDialog.getSaveFileName(self, "保存工程", str(default_path), "JSON (*.json)")
        if not path:
            return
        save_project(project, path)
        self.log(f"工程已保存：{path}")

    def load_project_dialog(self) -> None:
        path, _ = QFileDialog.getOpenFileName(self, "加载工程", str(self.examples_dir), "JSON (*.json)")
        if not path:
            return
        project = load_project(path)
        self.control_panel.set_project_config(project)
        self.dispersion_view.clear_result(clear_input=True)
        self.preview_model()
        self.log(f"工程已加载：{path}")

    def export_records_dialog(self) -> None:
        if self.last_result is None:
            QMessageBox.information(self, "提示", "请先完成一次模拟。")
            return
        folder = QFileDialog.getExistingDirectory(self, "选择导出目录", str(self.outputs_dir / "records"))
        if not folder:
            return
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base = Path(folder) / f"records_{stamp}"
        vx_csv, vz_csv = export_records_csv(
            base,
            self.last_result["record_time"],
            self.last_result["records_vx"],
            self.last_result["records_vz"],
            self.last_result["receiver_positions"]["x"],
        )
        npz_path = export_records_npz(
            base.with_suffix(".npz"),
            self.last_result["record_time"],
            self.last_result["records_vx"],
            self.last_result["records_vz"],
            self.last_result["receiver_positions"]["x"],
            self.last_result["receiver_positions"]["z"],
        )
        self.log(f"记录已导出：{vx_csv.name}, {vz_csv.name}, {npz_path.name}")

    def export_png_dialog(self) -> None:
        if self.latest_frame is None:
            QMessageBox.information(self, "提示", "暂无可导出的波场帧。")
            return
        default_path = self.outputs_dir / "snapshots" / f"wavefield_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        path, _ = QFileDialog.getSaveFileName(self, "导出 PNG", str(default_path), "PNG (*.png)")
        if not path:
            return
        export_wavefield_png(path, self.latest_frame["wavefield"], title="Wavefield Snapshot")
        self.log(f"波场 PNG 已导出：{path}")

    def export_gif_dialog(self) -> None:
        if self.last_result is None or not self.last_result.get("stored_frames"):
            QMessageBox.information(self, "提示", "没有缓存动画帧，请勾选“缓存动画帧”后重新运行。")
            return
        default_path = self.outputs_dir / "animations" / f"wavefield_{datetime.now().strftime('%Y%m%d_%H%M%S')}.gif"
        path, _ = QFileDialog.getSaveFileName(self, "导出 GIF", str(default_path), "GIF (*.gif)")
        if not path:
            return
        export_animation_gif(path, self.last_result["stored_frames"], fps=10)
        self.log(f"波场 GIF 已导出：{path}")

    def closeEvent(self, event) -> None:  # pragma: no cover - GUI close behavior
        self.render_timer.stop()
        if self.worker is not None and self.worker.isRunning():
            self.worker.request_stop()
            self.worker.wait(1000)
        if self.validation_view.worker is not None and self.validation_view.worker.isRunning():
            self.validation_view.worker.request_stop()
            self.validation_view.worker.wait(1000)
        super().closeEvent(event)
