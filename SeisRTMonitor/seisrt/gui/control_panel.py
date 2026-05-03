from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QWidget, QFormLayout, QLineEdit, QPushButton, QVBoxLayout


class ControlPanel(QWidget):
    """实时监测控制面板。"""

    start_requested = pyqtSignal(dict)
    stop_requested = pyqtSignal()

    def __init__(self) -> None:
        super().__init__()
        self.server_input = QLineEdit("rtserve.iris.washington.edu")
        self.network_input = QLineEdit("IU")
        self.station_input = QLineEdit("ANMO")
        self.location_input = QLineEdit("00")
        self.channel_input = QLineEdit("BHZ")

        form = QFormLayout()
        form.addRow("SeedLink", self.server_input)
        form.addRow("Network", self.network_input)
        form.addRow("Station", self.station_input)
        form.addRow("Location", self.location_input)
        form.addRow("Channel", self.channel_input)

        self.start_button = QPushButton("Start")
        self.stop_button = QPushButton("Stop")
        self.start_button.clicked.connect(self._emit_start)
        self.stop_button.clicked.connect(self.stop_requested.emit)

        layout = QVBoxLayout(self)
        layout.addLayout(form)
        layout.addWidget(self.start_button)
        layout.addWidget(self.stop_button)
        layout.addStretch(1)

    def _emit_start(self) -> None:
        self.start_requested.emit({
            "server": self.server_input.text().strip(),
            "network": self.network_input.text().strip(),
            "station": self.station_input.text().strip(),
            "location": self.location_input.text().strip(),
            "channel": self.channel_input.text().strip(),
        })
