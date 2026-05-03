from __future__ import annotations

from dataclasses import asdict

import numpy as np

from app.model.elastic_params import build_elastic_parameters
from app.model.grid import coord_to_index
from app.model.layers import build_layered_model
from app.physics.pml import build_absorbing_mask
from app.physics.receiver import build_receiver_array
from app.physics.source import generate_wavelet
from app.types import ProjectConfig

try:  # Optional acceleration
    from numba import njit

    NUMBA_AVAILABLE = True
except ModuleNotFoundError:  # pragma: no cover - optional dependency
    njit = None
    NUMBA_AVAILABLE = False


def _dx_backward_inplace(field: np.ndarray, inv_dx: float, out: np.ndarray) -> None:
    out[:, 0] = field[:, 0] * inv_dx
    out[:, 1:] = (field[:, 1:] - field[:, :-1]) * inv_dx


def _dx_forward_inplace(field: np.ndarray, inv_dx: float, out: np.ndarray) -> None:
    out[:, :-1] = (field[:, 1:] - field[:, :-1]) * inv_dx
    out[:, -1] = -field[:, -1] * inv_dx


def _dz_backward_inplace(field: np.ndarray, inv_dz: float, out: np.ndarray) -> None:
    out[0, :] = field[0, :] * inv_dz
    out[1:, :] = (field[1:, :] - field[:-1, :]) * inv_dz


def _dz_forward_inplace(field: np.ndarray, inv_dz: float, out: np.ndarray) -> None:
    out[:-1, :] = (field[1:, :] - field[:-1, :]) * inv_dz
    out[-1, :] = -field[-1, :] * inv_dz


if NUMBA_AVAILABLE:
    @njit(cache=True)
    def _step_kernel_numba(
        vx: np.ndarray,
        vz: np.ndarray,
        txx: np.ndarray,
        tzz: np.ndarray,
        txz: np.ndarray,
        w1: np.ndarray,
        w2: np.ndarray,
        w3: np.ndarray,
        vx_scale: np.ndarray,
        vz_scale: np.ndarray,
        twomu_dt: np.ndarray,
        lam_dt: np.ndarray,
        mu_dt: np.ndarray,
        damping: np.ndarray,
        wavelet_value: float,
        source_ix: int,
        source_iz: int,
        source_horizontal: bool,
        free_surface: bool,
        inv_dx: float,
        inv_dz: float,
    ) -> None:
        nz, nx = vx.shape

        for iz in range(nz):
            for ix in range(nx):
                left_txx = txx[iz, ix - 1] if ix > 0 else 0.0
                up_txz = txz[iz - 1, ix] if iz > 0 else 0.0
                right_txz = txz[iz, ix + 1] if ix < nx - 1 else 0.0
                down_tzz = tzz[iz + 1, ix] if iz < nz - 1 else 0.0
                w1[iz, ix] = (txx[iz, ix] - left_txx) * inv_dx + (txz[iz, ix] - up_txz) * inv_dz
                w2[iz, ix] = (right_txz - txz[iz, ix]) * inv_dx + (down_tzz - tzz[iz, ix]) * inv_dz

        row0 = source_iz - 1 if source_iz > 0 else 0
        row1 = source_iz + 1 if source_iz + 1 < nz else nz
        col0 = source_ix - 1 if source_ix > 0 else 0
        col1 = source_ix + 1 if source_ix + 1 < nx else nx
        contribution = wavelet_value * 0.25
        if source_horizontal:
            for iz in range(row0, row1):
                for ix in range(col0, col1):
                    w1[iz, ix] += contribution
        else:
            for iz in range(row0, row1):
                for ix in range(col0, col1):
                    w2[iz, ix] += contribution

        for iz in range(nz):
            for ix in range(nx):
                vx[iz, ix] += vx_scale[iz, ix] * w1[iz, ix]
                vz[iz, ix] += vz_scale[iz, ix] * w2[iz, ix]

        for iz in range(nz):
            for ix in range(nx):
                right_vx = vx[iz, ix + 1] if ix < nx - 1 else 0.0
                up_vz = vz[iz - 1, ix] if iz > 0 else 0.0
                down_vx = vx[iz + 1, ix] if iz < nz - 1 else 0.0
                left_vz = vz[iz, ix - 1] if ix > 0 else 0.0
                w1[iz, ix] = (right_vx - vx[iz, ix]) * inv_dx
                w2[iz, ix] = (vz[iz, ix] - up_vz) * inv_dz
                w3[iz, ix] = w1[iz, ix] + w2[iz, ix]
                txx[iz, ix] += twomu_dt[iz, ix] * w1[iz, ix] + lam_dt[iz, ix] * w3[iz, ix]
                tzz[iz, ix] += twomu_dt[iz, ix] * w2[iz, ix] + lam_dt[iz, ix] * w3[iz, ix]
                w3[iz, ix] = (down_vx - vx[iz, ix]) * inv_dz + (vz[iz, ix] - left_vz) * inv_dx

        for iz in range(nz):
            for ix in range(nx):
                txz[iz, ix] += mu_dt[iz, ix] * w3[iz, ix]

        if free_surface:
            for ix in range(nx):
                tzz[0, ix] = 0.0
                txz[0, ix] = 0.0

        for iz in range(nz):
            for ix in range(nx):
                damp = damping[iz, ix]
                vx[iz, ix] *= damp
                vz[iz, ix] *= damp
                txx[iz, ix] *= damp
                tzz[iz, ix] *= damp
                txz[iz, ix] *= damp


class ElasticWaveSolver:
    def __init__(self, project: ProjectConfig) -> None:
        self.project = project
        self.grid = project.grid
        self.boundary = project.boundary
        self.model_fields = build_layered_model(project.grid, project.model)
        vp = self.model_fields["vp"]
        vs = self.model_fields["vs"]
        rho = self.model_fields["rho"]
        self.elastic = build_elastic_parameters(vp, vs, rho)

        self.lam = self.elastic["lam"].astype(np.float32, copy=True)
        self.mu = self.elastic["mu"].astype(np.float32, copy=True)
        self.twomu = self.elastic["twomu"].astype(np.float32, copy=True)
        self.rhoinv_vx = self.elastic["rhoinv"].astype(np.float32, copy=True)
        self.rhoinv_vz = self.elastic["rhoinv"].astype(np.float32, copy=True)

        self.free_surface = project.boundary.top_boundary == "free_surface"
        if self.free_surface:
            self.lam[0, :] = 0.0
            self.twomu[0, :] *= 0.5
            self.rhoinv_vx[0, :] *= 2.0

        self.time, self.wavelet = generate_wavelet(project.grid, project.source)
        self.nt = self.time.size
        self.receivers = build_receiver_array(project.grid, project.receivers)
        self.nrec = int(project.receivers.count)

        self.record_stride = max(1, int(project.simulation.record_stride))
        self.display_stride = max(1, int(project.simulation.display_stride))
        self.snapshot_stride = max(1, int(project.simulation.snapshot_stride))

        self.record_nt = (self.nt + self.record_stride - 1) // self.record_stride
        self.records_vx = np.zeros((self.record_nt, self.nrec), dtype=np.float32)
        self.records_vz = np.zeros_like(self.records_vx)
        self.record_time = np.zeros(self.record_nt, dtype=np.float32)
        self.record_index = 0

        shape = (self.grid.nz, self.grid.nx)
        self.vx = np.zeros(shape, dtype=np.float32)
        self.vz = np.zeros_like(self.vx)
        self.txx = np.zeros_like(self.vx)
        self.tzz = np.zeros_like(self.vx)
        self.txz = np.zeros_like(self.vx)

        vmax = float(np.max(vp))
        self.damping = build_absorbing_mask(project.grid, project.boundary, vmax).astype(np.float32, copy=False)

        self.source_ix, self.source_iz = coord_to_index(project.source.x, project.source.z, self.grid, margin=1)
        self.source_horizontal = project.source.source_type == "horizontal_force"
        self.current_step = 0

        self.inv_dx = np.float32(1.0 / self.grid.dx)
        self.inv_dz = np.float32(1.0 / self.grid.dz)
        dt = np.float32(self.grid.dt)
        self.source_scale = np.float32(dt / max(self.grid.dx * self.grid.dz, 1e-12))
        self.vx_scale = dt * self.rhoinv_vx
        self.vz_scale = dt * self.rhoinv_vz
        self.lam_dt = dt * self.lam
        self.mu_dt = dt * self.mu
        self.twomu_dt = dt * self.twomu

        self.w1 = np.zeros_like(self.vx)
        self.w2 = np.zeros_like(self.vx)
        self.w3 = np.zeros_like(self.vx)
        self.w4 = np.zeros_like(self.vx)
        self.display_buffer = np.zeros_like(self.vx)

        self.frame_history: list[np.ndarray] = []
        self.frame_times: list[float] = []

        self.display_downsample_x = max(1, int(np.ceil(self.grid.nx / 280)))
        self.display_downsample_z = max(1, int(np.ceil(self.grid.nz / 180)))
        self.backend_name = "Numba" if NUMBA_AVAILABLE else "NumPy"

    def has_next_step(self) -> bool:
        return self.current_step < self.nt

    def _inject_force_numpy(self, rhs_vx: np.ndarray, rhs_vz: np.ndarray, value: float) -> None:
        ix = self.source_ix
        iz = self.source_iz
        contribution = value * self.source_scale
        row0 = max(iz - 1, 0)
        row1 = min(iz + 1, self.grid.nz)
        col0 = max(ix - 1, 0)
        col1 = min(ix + 1, self.grid.nx)
        if self.source_horizontal:
            rhs_vx[row0:row1, col0:col1] += 0.25 * contribution
        else:
            rhs_vz[row0:row1, col0:col1] += 0.25 * contribution

    def _apply_absorbing_layer(self) -> None:
        self.vx *= self.damping
        self.vz *= self.damping
        self.txx *= self.damping
        self.tzz *= self.damping
        self.txz *= self.damping

    def _record_receivers(self) -> None:
        if self.current_step % self.record_stride != 0:
            return
        idx = self.record_index
        ix = self.receivers["ix"]
        iz = self.receivers["iz"]
        self.records_vx[idx, :] = self.vx[iz, ix]
        self.records_vz[idx, :] = self.vz[iz, ix]
        self.record_time[idx] = self.current_step * self.grid.dt
        self.record_index += 1

    def _store_frame(self) -> None:
        if not self.project.simulation.store_animation_frames:
            return
        if self.current_step % self.snapshot_stride != 0:
            return
        self.frame_history.append(
            self._wavefield_for_display()[:: self.display_downsample_z, :: self.display_downsample_x].copy()
        )
        self.frame_times.append(self.current_time)

    def _step_numpy(self) -> None:
        _dx_backward_inplace(self.txx, self.inv_dx, self.w1)
        _dz_backward_inplace(self.txz, self.inv_dz, self.w2)
        self.w1 += self.w2

        _dx_forward_inplace(self.txz, self.inv_dx, self.w3)
        _dz_forward_inplace(self.tzz, self.inv_dz, self.w4)
        self.w3 += self.w4

        self._inject_force_numpy(self.w1, self.w3, float(self.wavelet[self.current_step]))

        self.vx += self.vx_scale * self.w1
        self.vz += self.vz_scale * self.w3

        _dx_forward_inplace(self.vx, self.inv_dx, self.w1)
        _dz_backward_inplace(self.vz, self.inv_dz, self.w2)
        np.add(self.w1, self.w2, out=self.w3)

        self.txx += self.twomu_dt * self.w1
        self.txx += self.lam_dt * self.w3
        self.tzz += self.twomu_dt * self.w2
        self.tzz += self.lam_dt * self.w3

        _dz_forward_inplace(self.vx, self.inv_dz, self.w1)
        _dx_backward_inplace(self.vz, self.inv_dx, self.w2)
        np.add(self.w1, self.w2, out=self.w3)
        self.txz += self.mu_dt * self.w3

        if self.free_surface:
            self.tzz[0, :] = 0.0
            self.txz[0, :] = 0.0

        self._apply_absorbing_layer()

    def step(self) -> None:
        if not self.has_next_step():
            return

        if NUMBA_AVAILABLE:
            _step_kernel_numba(
                self.vx,
                self.vz,
                self.txx,
                self.tzz,
                self.txz,
                self.w1,
                self.w2,
                self.w3,
                self.vx_scale,
                self.vz_scale,
                self.twomu_dt,
                self.lam_dt,
                self.mu_dt,
                self.damping,
                float(self.wavelet[self.current_step] * self.source_scale),
                int(self.source_ix),
                int(self.source_iz),
                self.source_horizontal,
                self.free_surface,
                float(self.inv_dx),
                float(self.inv_dz),
            )
        else:
            self._step_numpy()

        self._record_receivers()
        self._store_frame()
        self.current_step += 1

    @property
    def current_time(self) -> float:
        return self.current_step * self.grid.dt

    def _wavefield_for_display(self) -> np.ndarray:
        component = self.project.simulation.wavefield_display
        if component == "vx":
            np.copyto(self.display_buffer, self.vx)
        elif component == "vz":
            np.copyto(self.display_buffer, self.vz)
        elif component == "stress_trace":
            np.add(self.txx, self.tzz, out=self.display_buffer)
        else:
            np.square(self.vx, out=self.w1)
            np.square(self.vz, out=self.w2)
            np.add(self.w1, self.w2, out=self.display_buffer)
            np.sqrt(self.display_buffer, out=self.display_buffer)
        return self.display_buffer

    def should_emit_frame(self) -> bool:
        return self.current_step == 1 or self.current_step % self.display_stride == 0 or self.current_step >= self.nt

    def make_frame(self, last_record_index: int = 0) -> dict[str, object]:
        wavefield_full = self._wavefield_for_display()
        wavefield = wavefield_full[:: self.display_downsample_z, :: self.display_downsample_x].copy()
        record_start = int(max(0, min(last_record_index, self.record_index)))
        record_end = int(self.record_index)
        return {
            "step": self.current_step,
            "time": self.current_time,
            "wavefield": wavefield,
            "wavefield_ds_x": self.display_downsample_x,
            "wavefield_ds_z": self.display_downsample_z,
            "record_start": record_start,
            "record_end": record_end,
            "records_vx_chunk": self.records_vx[record_start:record_end].copy(),
            "records_vz_chunk": self.records_vz[record_start:record_end].copy(),
            "record_time_chunk": self.record_time[record_start:record_end].copy(),
            "receiver_x": self.receivers["x"].copy(),
            "receiver_z": self.receivers["z"].copy(),
            "trace_index": self.nrec // 2,
            "max_amplitude": float(np.max(np.abs(wavefield_full))),
        }

    def finalize(self, stopped: bool = False) -> dict[str, object]:
        return {
            "project": asdict(self.project),
            "model_fields": {
                "x": self.model_fields["x"],
                "z": self.model_fields["z"],
                "vp": self.model_fields["vp"],
                "vs": self.model_fields["vs"],
                "rho": self.model_fields["rho"],
                "interfaces": self.model_fields["interfaces"],
            },
            "receiver_positions": {
                "x": self.receivers["x"],
                "z": self.receivers["z"],
            },
            "records_vx": self.records_vx[: self.record_index].copy(),
            "records_vz": self.records_vz[: self.record_index].copy(),
            "record_time": self.record_time[: self.record_index].copy(),
            "wavefield_last": self._wavefield_for_display()[
                :: self.display_downsample_z, :: self.display_downsample_x
            ].copy(),
            "stored_frames": self.frame_history,
            "stored_frame_times": np.asarray(self.frame_times, dtype=float),
            "stopped": stopped,
            "backend_name": self.backend_name,
        }
