from __future__ import annotations

import pyqtgraph as pg
from PySide6.QtGui import QColor, QPalette
from PySide6.QtWidgets import QApplication


def _dark_palette() -> QPalette:
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor("#0f172a"))
    palette.setColor(QPalette.WindowText, QColor("#e2e8f0"))
    palette.setColor(QPalette.Base, QColor("#111827"))
    palette.setColor(QPalette.AlternateBase, QColor("#172033"))
    palette.setColor(QPalette.ToolTipBase, QColor("#111827"))
    palette.setColor(QPalette.ToolTipText, QColor("#f8fafc"))
    palette.setColor(QPalette.Text, QColor("#e5e7eb"))
    palette.setColor(QPalette.Button, QColor("#172033"))
    palette.setColor(QPalette.ButtonText, QColor("#e5e7eb"))
    palette.setColor(QPalette.BrightText, QColor("#ffffff"))
    palette.setColor(QPalette.Highlight, QColor("#2563eb"))
    palette.setColor(QPalette.HighlightedText, QColor("#ffffff"))
    return palette


def _light_palette() -> QPalette:
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor("#f8fafc"))
    palette.setColor(QPalette.WindowText, QColor("#0f172a"))
    palette.setColor(QPalette.Base, QColor("#ffffff"))
    palette.setColor(QPalette.AlternateBase, QColor("#eef2ff"))
    palette.setColor(QPalette.ToolTipBase, QColor("#ffffff"))
    palette.setColor(QPalette.ToolTipText, QColor("#0f172a"))
    palette.setColor(QPalette.Text, QColor("#0f172a"))
    palette.setColor(QPalette.Button, QColor("#e2e8f0"))
    palette.setColor(QPalette.ButtonText, QColor("#0f172a"))
    palette.setColor(QPalette.BrightText, QColor("#111827"))
    palette.setColor(QPalette.Highlight, QColor("#2563eb"))
    palette.setColor(QPalette.HighlightedText, QColor("#ffffff"))
    return palette


def _stylesheet(theme: str) -> str:
    if theme == "light":
        return """
        QWidget { font-size: 10.5pt; }
        QGroupBox {
            font-weight: 600;
            border: 1px solid #d7deea;
            border-radius: 12px;
            margin-top: 10px;
            padding-top: 10px;
            background: #ffffff;
        }
        QGroupBox::title {
            subcontrol-origin: margin;
            left: 12px;
            padding: 0 4px 0 4px;
            color: #0f172a;
        }
        QPushButton {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 6px 10px;
            background: #f8fafc;
        }
        QPushButton:hover { background: #e9eefb; }
        QPushButton:checked { background: #dbeafe; border-color: #60a5fa; }
        QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox, QTableWidget, QPlainTextEdit {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 4px 6px;
            background: #ffffff;
        }
        QHeaderView::section {
            background: #eef2ff;
            border: none;
            padding: 6px;
            font-weight: 600;
        }
        QScrollArea { border: none; }
        QLabel#heroTitle { font-size: 15pt; font-weight: 700; color: #0f172a; }
        QLabel#heroDescription { color: #334155; }
        QToolBar {
            spacing: 6px;
            padding: 6px;
            border-bottom: 1px solid #d7deea;
            background: #ffffff;
        }
        QTabWidget::pane {
            border: 1px solid #d7deea;
            background: #ffffff;
            top: -1px;
        }
        QTabBar::tab {
            color: #334155;
            background: #eef2ff;
            border: 1px solid #cbd5e1;
            border-bottom: none;
            padding: 6px 12px;
            margin-right: 2px;
        }
        QTabBar::tab:selected {
            color: #0f172a;
            background: #ffffff;
            font-weight: 600;
        }
        QTabBar::tab:!selected {
            color: #475569;
            background: #e2e8f0;
        }
        QStatusBar { background: #ffffff; }
        """
    return """
    QWidget { font-size: 10.5pt; color: #e5e7eb; }
    QGroupBox {
        font-weight: 600;
        border: 1px solid #243145;
        border-radius: 12px;
        margin-top: 10px;
        padding-top: 10px;
        background: #101827;
    }
    QGroupBox::title {
        subcontrol-origin: margin;
        left: 12px;
        padding: 0 4px 0 4px;
        color: #c7d2fe;
    }
    QPushButton {
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 6px 10px;
        background: #172033;
    }
    QPushButton:hover { background: #1f2a40; }
    QPushButton:checked { background: #1d4ed8; border-color: #60a5fa; }
    QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox, QTableWidget, QPlainTextEdit {
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 4px 6px;
        background: #0f172a;
        selection-background-color: #2563eb;
    }
    QHeaderView::section {
        background: #162033;
        border: none;
        padding: 6px;
        font-weight: 600;
        color: #dbeafe;
    }
    QScrollArea { border: none; }
    QLabel#heroTitle { font-size: 15pt; font-weight: 700; color: #f8fafc; }
    QLabel#heroDescription { color: #94a3b8; }
    QToolBar {
        spacing: 6px;
        padding: 6px;
        border-bottom: 1px solid #243145;
        background: #101827;
    }
    QTabWidget::pane {
        border: 1px solid #334155;
        background: #0f172a;
        top: -1px;
    }
    QTabBar::tab {
        color: #cbd5e1;
        background: #162033;
        border: 1px solid #334155;
        border-bottom: none;
        padding: 6px 12px;
        margin-right: 2px;
    }
    QTabBar::tab:selected {
        color: #f8fafc;
        background: #1f2937;
        font-weight: 600;
    }
    QTabBar::tab:!selected {
        color: #94a3b8;
        background: #111827;
    }
    QStatusBar { background: #101827; }
    """


def apply_app_theme(app: QApplication, theme: str) -> None:
    theme = "light" if theme == "light" else "dark"
    app.setPalette(_light_palette() if theme == "light" else _dark_palette())
    app.setStyleSheet(_stylesheet(theme))
    if theme == "light":
        pg.setConfigOption("background", "#ffffff")
        pg.setConfigOption("foreground", "#0f172a")
    else:
        pg.setConfigOption("background", "#0f172a")
        pg.setConfigOption("foreground", "#e5e7eb")
