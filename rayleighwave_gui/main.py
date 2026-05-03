from __future__ import annotations

import sys


def main() -> int:
    try:
        from PySide6.QtWidgets import QApplication
    except ModuleNotFoundError:
        print("缺少 PySide6。请先执行: pip install -r requirements.txt")
        return 1

    try:
        import pyqtgraph as pg
    except ModuleNotFoundError:
        print("缺少 pyqtgraph。请先执行: pip install -r requirements.txt")
        return 1

    from app.ui.main_window import MainWindow

    pg.setConfigOptions(imageAxisOrder="row-major", antialias=True)
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
