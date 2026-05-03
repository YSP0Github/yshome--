from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QButtonGroup,
    QCheckBox,
    QComboBox,
    QDoubleSpinBox,
    QFormLayout,
    QFrame,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QSpinBox,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
    QWidget,
)

from app.config import PRESET_BUILDERS, project_from_preset
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


class ControlPanel(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._build_ui()
        self.apply_selected_preset()

    def _build_ui(self) -> None:
        outer_layout = QVBoxLayout(self)
        outer_layout.setContentsMargins(0, 0, 0, 0)

        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setFrameShape(QFrame.NoFrame)
        outer_layout.addWidget(scroll_area)

        container = QWidget()
        scroll_area.setWidget(container)
        layout = QVBoxLayout(container)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)

        hero_group = QGroupBox("二维面波传播正演")
        hero_layout = QVBoxLayout(hero_group)
        hero_title = QLabel("交互式教学模拟工具")
        hero_title.setObjectName("heroTitle")
        hero_desc = QLabel("支持模型设计、边界设置、震源接收器布设、实时波场动画与记录显示。")
        hero_desc.setWordWrap(True)
        hero_desc.setObjectName("heroDescription")
        hero_layout.addWidget(hero_title)
        hero_layout.addWidget(hero_desc)
        layout.addWidget(hero_group)

        self.title_edit = QLineEdit()
        self.title_edit.setPlaceholderText("例如：二维面波正演 - 双层模型")
        title_group = QGroupBox("工程名称")
        title_form = QFormLayout(title_group)
        title_form.addRow("标题", self.title_edit)
        layout.addWidget(title_group)

        grid_group = QGroupBox("网格与时间")
        grid_form = QFormLayout(grid_group)
        self.nx_spin = self._make_int_spin(50, 2000, 301)
        self.nz_spin = self._make_int_spin(50, 2000, 151)
        self.dx_spin = self._make_double_spin(0.1, 100.0, 1.0, 2)
        self.dz_spin = self._make_double_spin(0.1, 100.0, 1.0, 2)
        self.dt_spin = self._make_double_spin(1e-6, 1.0, 0.00016, 6)
        self.tmax_spin = self._make_double_spin(0.01, 20.0, 0.8, 3)
        self.nx_spin.setToolTip("X 方向网格数")
        self.nz_spin.setToolTip("Z 方向网格数")
        self.dt_spin.setToolTip("时间步长，建议满足 CFL 稳定条件")
        grid_form.addRow("nx", self.nx_spin)
        grid_form.addRow("nz", self.nz_spin)
        grid_form.addRow("dx (m)", self.dx_spin)
        grid_form.addRow("dz (m)", self.dz_spin)
        grid_form.addRow("dt (s)", self.dt_spin)
        grid_form.addRow("tmax (s)", self.tmax_spin)
        layout.addWidget(grid_group)

        boundary_group = QGroupBox("边界条件")
        boundary_form = QFormLayout(boundary_group)
        self.top_boundary_combo = QComboBox()
        self.top_boundary_combo.addItems(["自由表面", "顶部吸收"])
        self.pml_thickness_spin = self._make_int_spin(0, 200, 20)
        self.pml_strength_spin = self._make_double_spin(0.0, 20.0, 2.0, 2)
        self.taper_power_spin = self._make_double_spin(1.0, 6.0, 2.0, 2)
        self.top_boundary_combo.setToolTip("顶边界可设为自由表面或吸收边界")
        self.pml_thickness_spin.setToolTip("左右底部吸收层厚度，单位为网格点数")
        boundary_form.addRow("顶边界", self.top_boundary_combo)
        boundary_form.addRow("吸收层厚度", self.pml_thickness_spin)
        boundary_form.addRow("吸收强度", self.pml_strength_spin)
        boundary_form.addRow("渐变指数", self.taper_power_spin)
        layout.addWidget(boundary_group)

        model_group = QGroupBox("模型参数")
        model_layout = QVBoxLayout(model_group)
        preset_row = QHBoxLayout()
        self.preset_combo = QComboBox()
        self.preset_combo.addItems(list(PRESET_BUILDERS.keys()))
        self.apply_preset_button = QPushButton("载入预设")
        self.apply_preset_button.clicked.connect(self.apply_selected_preset)
        preset_row.addWidget(QLabel("预设模型"))
        preset_row.addWidget(self.preset_combo, 1)
        preset_row.addWidget(self.apply_preset_button)
        model_layout.addLayout(preset_row)

        property_row = QHBoxLayout()
        self.property_combo = QComboBox()
        self.property_combo.addItems(["Vs", "Vp", "Density"])
        property_row.addWidget(QLabel("模型显示"))
        property_row.addWidget(self.property_combo, 1)
        model_layout.addLayout(property_row)

        self.layers_table = QTableWidget(0, 5)
        self.layers_table.setHorizontalHeaderLabels(["层顶深度", "倾角", "Vp", "Vs", "密度"])
        self.layers_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.layers_table.verticalHeader().setVisible(False)
        self.layers_table.setAlternatingRowColors(True)
        self.layers_table.setSelectionBehavior(QTableWidget.SelectRows)
        self.layers_table.setToolTip("每行定义一层介质：层顶深度、倾角、Vp、Vs、密度")
        model_layout.addWidget(self.layers_table)

        layer_buttons = QHBoxLayout()
        self.add_layer_button = QPushButton("增加层")
        self.remove_layer_button = QPushButton("删除层")
        self.add_layer_button.clicked.connect(self.add_empty_layer)
        self.remove_layer_button.clicked.connect(self.remove_selected_layer)
        layer_buttons.addWidget(self.add_layer_button)
        layer_buttons.addWidget(self.remove_layer_button)
        model_layout.addLayout(layer_buttons)
        layout.addWidget(model_group)

        source_group = QGroupBox("震源设置")
        source_form = QFormLayout(source_group)
        self.wavelet_combo = QComboBox()
        self.wavelet_combo.addItems(["Ricker", "高斯一阶导"])
        self.source_type_combo = QComboBox()
        self.source_type_combo.addItems(["垂向点力", "水平点力"])
        self.source_freq_spin = self._make_double_spin(1.0, 500.0, 20.0, 2)
        self.source_amp_spin = self._make_double_spin(0.01, 1000.0, 1.0, 2)
        self.source_delay_spin = self._make_double_spin(0.0, 5.0, 0.06, 3)
        self.source_x_spin = self._make_double_spin(0.0, 100000.0, 90.0, 2)
        self.source_z_spin = self._make_double_spin(0.0, 100000.0, 2.0, 2)
        self.pick_source_button = QPushButton("鼠标拾取震源")
        self.pick_source_button.setCheckable(True)
        self.pick_source_button.setToolTip("点击后在模型图上单击设置震源位置")
        source_form.addRow("子波", self.wavelet_combo)
        source_form.addRow("震源类型", self.source_type_combo)
        source_form.addRow("主频 (Hz)", self.source_freq_spin)
        source_form.addRow("幅值", self.source_amp_spin)
        source_form.addRow("延迟 (s)", self.source_delay_spin)
        source_form.addRow("X (m)", self.source_x_spin)
        source_form.addRow("Z (m)", self.source_z_spin)
        source_form.addRow(self.pick_source_button)
        layout.addWidget(source_group)

        receiver_group = QGroupBox("接收器设置")
        receiver_form = QFormLayout(receiver_group)
        self.receiver_count_spin = self._make_int_spin(1, 500, 48)
        self.receiver_start_x_spin = self._make_double_spin(0.0, 100000.0, 20.0, 2)
        self.receiver_start_z_spin = self._make_double_spin(0.0, 100000.0, 2.0, 2)
        self.receiver_spacing_spin = self._make_double_spin(0.1, 1000.0, 3.0, 2)
        self.pick_receiver_button = QPushButton("鼠标拾取阵列起点")
        self.pick_receiver_button.setCheckable(True)
        self.pick_receiver_button.setToolTip("点击后在模型图上单击设置接收器阵列起点")
        receiver_form.addRow("接收器数", self.receiver_count_spin)
        receiver_form.addRow("起始 X (m)", self.receiver_start_x_spin)
        receiver_form.addRow("起始 Z (m)", self.receiver_start_z_spin)
        receiver_form.addRow("道间距 (m)", self.receiver_spacing_spin)
        receiver_form.addRow(self.pick_receiver_button)
        layout.addWidget(receiver_group)

        simulation_group = QGroupBox("显示与输出")
        sim_form = QFormLayout(simulation_group)
        self.wavefield_combo = QComboBox()
        self.wavefield_combo.addItems(["速度模值", "Vx", "Vz", "应力迹"])
        self.seismogram_combo = QComboBox()
        self.seismogram_combo.addItems(["Vz", "Vx"])
        self.display_stride_spin = self._make_int_spin(1, 500, 8)
        self.record_stride_spin = self._make_int_spin(1, 100, 1)
        self.snapshot_stride_spin = self._make_int_spin(1, 500, 12)
        self.store_frames_check = QCheckBox("缓存动画帧（用于导出 GIF）")
        self.store_frames_check.setChecked(True)
        self.auto_preview_check = QCheckBox("参数变更后自动刷新预览")
        self.auto_preview_check.setChecked(True)
        sim_form.addRow("波场显示", self.wavefield_combo)
        sim_form.addRow("记录显示", self.seismogram_combo)
        sim_form.addRow("刷新步长", self.display_stride_spin)
        sim_form.addRow("记录步长", self.record_stride_spin)
        sim_form.addRow("帧缓存步长", self.snapshot_stride_spin)
        sim_form.addRow(self.store_frames_check)
        sim_form.addRow(self.auto_preview_check)
        layout.addWidget(simulation_group)

        summary_group = QGroupBox("模型摘要")
        summary_layout = QGridLayout(summary_group)
        self.summary_extent_label = QLabel("--")
        self.summary_velocity_label = QLabel("--")
        self.summary_dt_label = QLabel("--")
        self.summary_receiver_label = QLabel("--")
        self.summary_note_label = QLabel("点击“预览模型”后显示摘要信息。")
        self.summary_note_label.setWordWrap(True)
        summary_layout.addWidget(QLabel("模型范围"), 0, 0)
        summary_layout.addWidget(self.summary_extent_label, 0, 1)
        summary_layout.addWidget(QLabel("最大速度"), 1, 0)
        summary_layout.addWidget(self.summary_velocity_label, 1, 1)
        summary_layout.addWidget(QLabel("稳定步长"), 2, 0)
        summary_layout.addWidget(self.summary_dt_label, 2, 1)
        summary_layout.addWidget(QLabel("接收器展布"), 3, 0)
        summary_layout.addWidget(self.summary_receiver_label, 3, 1)
        summary_layout.addWidget(self.summary_note_label, 4, 0, 1, 2)
        layout.addWidget(summary_group)

        self.pick_group = QButtonGroup(self)
        self.pick_group.setExclusive(True)
        self.pick_group.addButton(self.pick_source_button)
        self.pick_group.addButton(self.pick_receiver_button)

        buttons_group = QGroupBox("操作")
        buttons_layout = QVBoxLayout(buttons_group)
        row1 = QHBoxLayout()
        row2 = QHBoxLayout()
        row3 = QHBoxLayout()
        self.preview_button = QPushButton("预览模型")
        self.start_button = QPushButton("开始模拟")
        self.pause_button = QPushButton("暂停")
        self.stop_button = QPushButton("停止")
        self.save_project_button = QPushButton("保存工程")
        self.load_project_button = QPushButton("加载工程")
        self.export_data_button = QPushButton("导出记录")
        self.export_png_button = QPushButton("导出波场 PNG")
        self.export_gif_button = QPushButton("导出波场 GIF")
        row1.addWidget(self.preview_button)
        row1.addWidget(self.start_button)
        row1.addWidget(self.pause_button)
        row1.addWidget(self.stop_button)
        row2.addWidget(self.save_project_button)
        row2.addWidget(self.load_project_button)
        row3.addWidget(self.export_data_button)
        row3.addWidget(self.export_png_button)
        row3.addWidget(self.export_gif_button)
        buttons_layout.addLayout(row1)
        buttons_layout.addLayout(row2)
        buttons_layout.addLayout(row3)
        layout.addWidget(buttons_group)
        layout.addStretch(1)

    @staticmethod
    def _make_int_spin(minimum: int, maximum: int, value: int) -> QSpinBox:
        widget = QSpinBox()
        widget.setRange(minimum, maximum)
        widget.setValue(value)
        return widget

    @staticmethod
    def _make_double_spin(minimum: float, maximum: float, value: float, decimals: int) -> QDoubleSpinBox:
        widget = QDoubleSpinBox()
        widget.setDecimals(decimals)
        widget.setRange(minimum, maximum)
        widget.setValue(value)
        widget.setSingleStep(10 ** (-max(decimals - 1, 0)))
        return widget

    def watched_widgets(self) -> list[QWidget]:
        return [
            self.title_edit,
            self.nx_spin,
            self.nz_spin,
            self.dx_spin,
            self.dz_spin,
            self.dt_spin,
            self.tmax_spin,
            self.top_boundary_combo,
            self.pml_thickness_spin,
            self.pml_strength_spin,
            self.taper_power_spin,
            self.preset_combo,
            self.property_combo,
            self.wavelet_combo,
            self.source_type_combo,
            self.source_freq_spin,
            self.source_amp_spin,
            self.source_delay_spin,
            self.source_x_spin,
            self.source_z_spin,
            self.receiver_count_spin,
            self.receiver_start_x_spin,
            self.receiver_start_z_spin,
            self.receiver_spacing_spin,
            self.wavefield_combo,
            self.seismogram_combo,
            self.display_stride_spin,
            self.record_stride_spin,
            self.snapshot_stride_spin,
            self.store_frames_check,
            self.auto_preview_check,
        ]

    def add_empty_layer(self) -> None:
        self.add_layer_row(0.0, 0.0, 1200.0, 650.0, 1900.0)

    def add_layer_row(self, top_depth: float, dip_deg: float, vp: float, vs: float, density: float) -> None:
        row = self.layers_table.rowCount()
        self.layers_table.insertRow(row)
        values = [top_depth, dip_deg, vp, vs, density]
        for col, value in enumerate(values):
            item = QTableWidgetItem(f"{value:.3f}")
            item.setTextAlignment(Qt.AlignCenter)
            self.layers_table.setItem(row, col, item)

    def remove_selected_layer(self) -> None:
        row = self.layers_table.currentRow()
        if row >= 0:
            self.layers_table.removeRow(row)

    def apply_selected_preset(self) -> None:
        project = project_from_preset(self.preset_combo.currentText())
        self.set_project_config(project)

    def set_layers(self, layers: list[LayerDefinition]) -> None:
        self.layers_table.setRowCount(0)
        for layer in layers:
            self.add_layer_row(layer.top_depth, layer.dip_deg, layer.vp, layer.vs, layer.density)

    def _safe_item_float(self, row: int, col: int, default: float) -> float:
        item = self.layers_table.item(row, col)
        if item is None:
            return default
        try:
            return float(item.text())
        except ValueError:
            return default

    def set_model_summary(
        self,
        *,
        x_extent: float,
        z_extent: float,
        vmax: float,
        stable_dt: float,
        current_dt: float,
        receiver_start: float,
        receiver_end: float,
        receiver_count: int,
        warning_text: str = "",
    ) -> None:
        self.summary_extent_label.setText(f"{x_extent:.1f} m × {z_extent:.1f} m")
        self.summary_velocity_label.setText(f"{vmax:.1f} m/s")
        self.summary_dt_label.setText(f"建议 ≤ {stable_dt:.6f} s；当前 {current_dt:.6f} s")
        self.summary_receiver_label.setText(f"{receiver_count} 道，{receiver_start:.1f}–{receiver_end:.1f} m")
        self.summary_note_label.setText(warning_text or "参数处于可计算范围。")

    def current_project_config(self) -> ProjectConfig:
        layers: list[LayerDefinition] = []
        for row in range(self.layers_table.rowCount()):
            layers.append(
                LayerDefinition(
                    name=f"Layer {row + 1}",
                    top_depth=self._safe_item_float(row, 0, 0.0),
                    dip_deg=self._safe_item_float(row, 1, 0.0),
                    vp=self._safe_item_float(row, 2, 1200.0),
                    vs=self._safe_item_float(row, 3, 650.0),
                    density=self._safe_item_float(row, 4, 1900.0),
                )
            )

        property_map = {"Vs": "vs", "Vp": "vp", "Density": "rho"}
        wavefield_map = {"速度模值": "vmag", "Vx": "vx", "Vz": "vz", "应力迹": "stress_trace"}
        seismogram_map = {"Vz": "vz", "Vx": "vx"}
        top_boundary_map = {"自由表面": "free_surface", "顶部吸收": "absorbing"}
        wavelet_map = {"Ricker": "ricker", "高斯一阶导": "gaussian_derivative"}
        source_type_map = {"垂向点力": "vertical_force", "水平点力": "horizontal_force"}

        return ProjectConfig(
            title=self.title_edit.text().strip() or "二维面波正演",
            grid=GridConfig(
                nx=self.nx_spin.value(),
                nz=self.nz_spin.value(),
                dx=self.dx_spin.value(),
                dz=self.dz_spin.value(),
                dt=self.dt_spin.value(),
                tmax=self.tmax_spin.value(),
            ),
            boundary=BoundaryConfig(
                top_boundary=top_boundary_map[self.top_boundary_combo.currentText()],
                pml_thickness=self.pml_thickness_spin.value(),
                pml_strength=self.pml_strength_spin.value(),
                taper_power=self.taper_power_spin.value(),
            ),
            source=SourceConfig(
                source_type=source_type_map[self.source_type_combo.currentText()],
                wavelet=wavelet_map[self.wavelet_combo.currentText()],
                frequency=self.source_freq_spin.value(),
                amplitude=self.source_amp_spin.value(),
                delay=self.source_delay_spin.value(),
                x=self.source_x_spin.value(),
                z=self.source_z_spin.value(),
            ),
            receivers=ReceiverArrayConfig(
                count=self.receiver_count_spin.value(),
                start_x=self.receiver_start_x_spin.value(),
                start_z=self.receiver_start_z_spin.value(),
                spacing=self.receiver_spacing_spin.value(),
            ),
            model=ModelDefinition(
                name=self.preset_combo.currentText(),
                property_to_display=property_map[self.property_combo.currentText()],
                layers=layers,
            ),
            simulation=SimulationConfig(
                wavefield_display=wavefield_map[self.wavefield_combo.currentText()],
                seismogram_display=seismogram_map[self.seismogram_combo.currentText()],
                display_stride=self.display_stride_spin.value(),
                record_stride=self.record_stride_spin.value(),
                snapshot_stride=self.snapshot_stride_spin.value(),
                store_animation_frames=self.store_frames_check.isChecked(),
            ),
        )

    def set_project_config(self, project: ProjectConfig) -> None:
        top_boundary_map = {"free_surface": "自由表面", "absorbing": "顶部吸收"}
        wavelet_map = {"ricker": "Ricker", "gaussian_derivative": "高斯一阶导"}
        source_type_map = {"vertical_force": "垂向点力", "horizontal_force": "水平点力"}
        property_map = {"vs": "Vs", "vp": "Vp", "rho": "Density"}
        wavefield_map = {"vmag": "速度模值", "vx": "Vx", "vz": "Vz", "stress_trace": "应力迹"}
        seismogram_map = {"vz": "Vz", "vx": "Vx"}

        self.title_edit.setText(project.title)
        self.nx_spin.setValue(project.grid.nx)
        self.nz_spin.setValue(project.grid.nz)
        self.dx_spin.setValue(project.grid.dx)
        self.dz_spin.setValue(project.grid.dz)
        self.dt_spin.setValue(project.grid.dt)
        self.tmax_spin.setValue(project.grid.tmax)

        self.top_boundary_combo.setCurrentText(top_boundary_map.get(project.boundary.top_boundary, "自由表面"))
        self.pml_thickness_spin.setValue(project.boundary.pml_thickness)
        self.pml_strength_spin.setValue(project.boundary.pml_strength)
        self.taper_power_spin.setValue(project.boundary.taper_power)

        self.property_combo.setCurrentText(property_map.get(project.model.property_to_display, "Vs"))
        self.set_layers(project.model.layers)

        self.wavelet_combo.setCurrentText(wavelet_map.get(project.source.wavelet, "Ricker"))
        self.source_type_combo.setCurrentText(source_type_map.get(project.source.source_type, "垂向点力"))
        self.source_freq_spin.setValue(project.source.frequency)
        self.source_amp_spin.setValue(project.source.amplitude)
        self.source_delay_spin.setValue(project.source.delay)
        self.source_x_spin.setValue(project.source.x)
        self.source_z_spin.setValue(project.source.z)

        self.receiver_count_spin.setValue(project.receivers.count)
        self.receiver_start_x_spin.setValue(project.receivers.start_x)
        self.receiver_start_z_spin.setValue(project.receivers.start_z)
        self.receiver_spacing_spin.setValue(project.receivers.spacing)

        self.wavefield_combo.setCurrentText(wavefield_map.get(project.simulation.wavefield_display, "速度模值"))
        self.seismogram_combo.setCurrentText(seismogram_map.get(project.simulation.seismogram_display, "Vz"))
        self.display_stride_spin.setValue(project.simulation.display_stride)
        self.record_stride_spin.setValue(project.simulation.record_stride)
        self.snapshot_stride_spin.setValue(project.simulation.snapshot_stride)
        self.store_frames_check.setChecked(project.simulation.store_animation_frames)

    def placement_mode(self) -> str | None:
        if self.pick_source_button.isChecked():
            return "source"
        if self.pick_receiver_button.isChecked():
            return "receiver"
        return None

    def clear_placement_mode(self) -> None:
        self.pick_source_button.setChecked(False)
        self.pick_receiver_button.setChecked(False)

    def set_source_coordinates(self, x: float, z: float) -> None:
        self.source_x_spin.setValue(x)
        self.source_z_spin.setValue(z)

    def set_receiver_start(self, x: float, z: float) -> None:
        self.receiver_start_x_spin.setValue(x)
        self.receiver_start_z_spin.setValue(z)
