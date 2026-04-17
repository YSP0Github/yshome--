from __future__ import annotations

import signal
import sys
import time

from YSXS.app import app
from YSXS.services.morning_report import start_morning_report_scheduler

_running = True


def _handle_stop(signum, frame):
    global _running
    _running = False


signal.signal(signal.SIGTERM, _handle_stop)
signal.signal(signal.SIGINT, _handle_stop)

start_morning_report_scheduler(app)
app.logger.info('独立晨报调度进程已启动。')

while _running:
    time.sleep(1)

app.logger.info('独立晨报调度进程已停止。')
sys.exit(0)
