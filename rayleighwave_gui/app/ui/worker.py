from __future__ import annotations

import time

from PySide6.QtCore import QThread, Signal

from app.physics.solver import ElasticWaveSolver
from app.types import ProjectConfig


class SimulationWorker(QThread):
    frame_ready = Signal(object)
    status_message = Signal(str)
    finished_successfully = Signal(object)
    failed = Signal(str)
    pause_state_changed = Signal(bool)

    def __init__(self, project: ProjectConfig) -> None:
        super().__init__()
        self.project = project
        self._stop_requested = False
        self._paused = False
        cell_count = max(1, int(project.grid.nx * project.grid.nz))
        if cell_count <= 60_000:
            self._target_fps = 18.0
        elif cell_count <= 180_000:
            self._target_fps = 12.0
        else:
            self._target_fps = 8.0
        self._frame_interval = 1.0 / self._target_fps
        self._step_chunk = max(1, min(12, 900_000 // cell_count))

    def request_stop(self) -> None:
        self._stop_requested = True
        self._paused = False

    def toggle_pause(self) -> None:
        self._paused = not self._paused
        self.pause_state_changed.emit(self._paused)

    def _emit_frame_if_needed(self, solver: ElasticWaveSolver, last_record_index: int) -> int:
        self.frame_ready.emit(solver.make_frame(last_record_index=last_record_index))
        return solver.record_index

    def run(self) -> None:
        try:
            solver = ElasticWaveSolver(self.project)
            self.status_message.emit(
                f"开始计算…（后端：{solver.backend_name}，分块：{self._step_chunk} 步/轮，目标刷新：{self._target_fps:.0f} FPS）"
            )
            progress_interval = max(1, solver.nt // 10)
            last_frame_time = 0.0
            last_record_index = 0
            last_emitted_step = -1

            while solver.has_next_step():
                if self._stop_requested:
                    if solver.current_step > 0 and solver.current_step != last_emitted_step:
                        last_record_index = self._emit_frame_if_needed(solver, last_record_index)
                    self.status_message.emit("计算已停止。")
                    self.finished_successfully.emit(solver.finalize(stopped=True))
                    return

                while self._paused and not self._stop_requested:
                    self.msleep(30)

                if self._stop_requested:
                    if solver.current_step > 0 and solver.current_step != last_emitted_step:
                        last_record_index = self._emit_frame_if_needed(solver, last_record_index)
                    self.status_message.emit("计算已停止。")
                    self.finished_successfully.emit(solver.finalize(stopped=True))
                    return

                frame_due = False
                for _ in range(self._step_chunk):
                    if not solver.has_next_step() or self._stop_requested or self._paused:
                        break
                    solver.step()
                    frame_due = frame_due or solver.should_emit_frame()

                now = time.perf_counter()
                if frame_due and (now - last_frame_time >= self._frame_interval or not solver.has_next_step()):
                    self.frame_ready.emit(solver.make_frame(last_record_index=last_record_index))
                    last_frame_time = now
                    last_record_index = solver.record_index
                    last_emitted_step = solver.current_step

                if solver.current_step % progress_interval == 0:
                    ratio = solver.current_step / max(solver.nt, 1)
                    self.status_message.emit(f"计算进度：{ratio:.0%}")

                self.msleep(1)

            if solver.current_step > 0 and solver.current_step != last_emitted_step:
                self.frame_ready.emit(solver.make_frame(last_record_index=last_record_index))
            self.status_message.emit("计算完成。")
            self.finished_successfully.emit(solver.finalize(stopped=False))
        except Exception as exc:  # pragma: no cover - GUI thread safety fallback
            self.failed.emit(str(exc))
