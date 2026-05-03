from __future__ import annotations

import sys
from pathlib import Path

# Allow running this file directly from IDEs:
#   python seisrt/gui/main_window.py
# Normal package execution should still use:
#   python -m seisrt.app.main
if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from PyQt6.QtWidgets import QApplication, QMainWindow, QWidget, QHBoxLayout

from seisrt.gui.control_panel import ControlPanel
from seisrt.gui.waveform_view import WaveformView


class MainWindow(QMainWindow):
    """主窗口：左侧控制区 + 右侧实时波形区。"""

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("SeisRTMonitor - Realtime Seismic Monitor")
        self.resize(1400, 800)

        self.control_panel = ControlPanel()
        self.waveform_view = WaveformView()

        central = QWidget(self)
        layout = QHBoxLayout(central)
        layout.addWidget(self.control_panel, 0)
        layout.addWidget(self.waveform_view, 1)
        self.setCentralWidget(central)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    raise SystemExit(app.exec())
