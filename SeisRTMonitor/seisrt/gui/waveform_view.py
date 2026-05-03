from __future__ import annotations

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel


class WaveformView(QWidget):
    """实时波形显示区域。

    后续建议优先接入 pyqtgraph PlotWidget；如果追求完全 Qt 原生，
    可替换为 QPainter 自绘 RingBuffer 波形控件。
    """

    def __init__(self) -> None:
        super().__init__()
        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Waveform view placeholder"))
