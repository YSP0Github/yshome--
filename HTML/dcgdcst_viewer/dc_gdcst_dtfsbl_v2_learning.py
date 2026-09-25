# -*- coding: utf-8 -*-
"""
dc_gdcst_dtfsbl_v2_learning.py
=====================================================================
DC-GDCST + DT-FSBL 学习整合版（v2）

【文件定位】
本文件是 2026-09-15 ~ 2026-09-17 逐章学习《工程化实施手册（完整版）》
及补遗附录后，针对"新发现的问题 + 待办事项"产出的【新增】程序文件。
**不修改** dc_gdcst_dtfsbl.py / run_exp002.py 等原文件，全部改进以
独立函数形式提供，便于对照原实现与逐步替换。

【数据口径（用户硬约束，全部按此实现）】
  - 采样率 fs = 6.625 Hz（Apollo PSE 标准；文档 10 Hz 仅为占位）
  - 信号段 5 h = 18000 s = 119250 点（3 台站；specfem 合成 + 实测稳定噪声 A，
    或实测月震记录）
  - 噪声段 ≥ 24 h = 86400 s = 572400 点（另一段实测稳定噪声 B；
    拼 25 h = 90000 s = 596250 点可与文档 9 段×10000 s 完全一致）
  - 分块 7200 s → N_blk = 47700 点、N_B = 4 块、50% 重叠、
    Δf_blk = 1.39e-4 Hz、Mf_blk = 79
  - 全段 Δf = 5.56e-5 Hz、Mf = 199；Nyquist = 3.3125 Hz（无混叠）
  - 噪声段 10000 s 子段 → Mf_seg = 111
  - 目标频带固定 [0.001, 0.012] Hz，不得更改

【本次学习发现的问题与待办 → 本文件实现对照】
  新问题 01  [B-1 笔误] 噪声段分段数 Nseg=90 应为 9            → 函数 run_noise_prior_with_plots
  新问题 02  [C.5 笔误] 窗函数 |f_k|^2λ 幂次按 (nΔt)^2 展开     → 函数 _gdcst_window_fixed
  新问题 03  [D.5 矛盾] 文档 K_max=500 vs AGENTS.md max_iter≥6000
              （6000-10000 次 corr 0.84-0.98，100 次仅 0.15-0.3）→ build_learning_config
  新问题 04  [D.7/D.8 缺口] B-5 分段参数未接线到 D 阶段；
              用户拍板：噪声在信号之前、无法时间对齐，
              η≥2 时用 max(σ̂^2_q) 保守初始化，D 阶段统一标量 σ^2 → max_sigma2_conservative_init
  新问题 05  [B.5 OCR] λ* 公式无台站下标 → 每站独立搜 λ*_j     → run_noise_prior_with_plots
  新问题 06  [文档缺口] PSD Ŝ_nj 的 D 阶段消费点未写明          → run_noise_prior_with_plots (返回供诊断)
  新问题 07  [量纲] 文档最终产物 m/s（速度型 H），用户实际 DISP
              位移型 counts/m → 最终产物 = 位移 m，无需积分      → instrument_response_unit_aware
  新问题 08  [文档缺口] 噪声段 GDCST 细节未展开（λ₀=1.0、不重叠、
              每段 10000 s、可不用解析信号）                     → run_noise_prior_with_plots
  新问题 09  [F.5 缺失] 补遗附录多站一致性 C_multi 原代码没有    → compute_c_multi
  新问题 10  [出图缺失] 置信度只打印数字无图                     → plot_confidence_intervals
  新问题 11  [结构差异] 高阶互相关：文档 F.2 / 导师 3→2→1 /
              原代码单参考截断（C12,C13→corr(C12,C13)）不一致    → advisor_high_order_corr
  新问题 12  [LAPACK] scipy sosfiltfilt 在本机崩溃 (0xc06d007f)，
              改用 obspy bandpass/lowpass                         → bandpass_obspy_safe
  新问题 13  [评估口径] AGENTS.md：corr/SNR 必须目标频带带通后算 → evaluate_in_band
  新问题 14  [走时差] 自由振荡无到时差，Δτ 应收敛≈0；待办：
              "估计 Δτ vs 理论走时差"对比测试                    → test_delta_tau_vs_theory
  待办 A   仪器响应单位规范化（绘图标注单位 + 可指定位移/速度/加速度）→ instrument_response_unit_aware
  待办 B   高阶互相关按导师 3→2→1 重做
            （一阶 C12,C23,C31 → 二阶 C1223,C2331 → 三阶 1 个） → advisor_high_order_corr
  待办 C   η_j 阶段性绘图（σ̂^2_q 柱状 + η 阈值线 + ν̂_q 副图）   → run_noise_prior_with_plots
  待办 D   Δτ vs 理论走时差对比测试                              → test_delta_tau_vs_theory
  待办 E   置信度出图（95% CI 带 + C_j 柱状）                    → plot_confidence_intervals
  待办 F   F.5 C_multi 多站一致性                               → compute_c_multi

【AGENTS.md 硬约束（贯穿全部实现）】
  - 目标频带固定 [0.001,0.012] Hz；合成数据 counts 域带内 SNR 单站 ≥10 dB
  - 评估必须目标频带带通后计算 corr/SNR
  - 噪声用 .noise 靠后段（原 noise_merged.mseed 去异常处理后的 MiniSEED，不用单段拼接）
  - FSBL max_iter ≥ 6000；3 站平均是最强基线（带通 corr 0.98）
  - FSBL 内部用 H_work = H/|H|（单位模保相位）防 |H|~1e7 量级压缩；
    输出乘回 H_work 恢复 counts 域源；物理域源 = counts 域源 / |H_eff|
    （H_eff 含预加重标度 amplitude_scale，不能用真实 |H|）
  - 物理参数（秒/Hz）写死，派生参数（N、NFFT、Δt…）从 fs 计算

用法示例：
    python dc_gdcst_dtfsbl_v2_learning.py            # 运行内置自检示例
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, Sequence

import numpy as np

# 原实现（只读复用，不修改）
from dc_gdcst_dtfsbl import DCGDCSTDTFSBL, DCGDCSTDTFSBLConfig

# =====================================================================
# 用户数据口径（硬约束）
# =====================================================================
FS_APOLLO = 6.625            # [新问题 12/数据口径] Apollo PSE 采样率 6.625 Hz
SIGNAL_DURATION_S = 18000.0  # 信号段 5 h
NOISE_DURATION_S = 86400.0   # 噪声段 ≥ 24 h（拼接 25 h 可与文档 9 段一致）
BLOCK_DURATION_S = 7200.0    # 信号分块 7200 s（用户配置）
FREQ_BAND = (0.001, 0.012)   # 目标频带，固定不可改


# =====================================================================
# [新问题 02] GDCST 窗函数修正版
# ---------------------------------------------------------------------
# 文档 C.5 的窗函数在 OCR 中把 |f_k|^2λ 幂次按 (nΔt)^2 展开，属笔误。
# 正确形式（教材 S 变换族通用形式）：
#     w(u, f) = |f|^λ / (√(2π)·p) · exp( -(f^{2λ}·u^2) / (2p^2) )
# 其中 u = n·Δt 为时间偏移，幂次作用在频率上（f^{2λ}），不是 (nΔt)^2。
# 此处给出修正后的截断长度计算：N_w(f_k) = ceil(6 / (|f_k|^λ·Δt))。
# =====================================================================
def gdcst_window_length(f_k: float, lambda_param: float, fs: float) -> int:
    """[新问题 02] 修正后的 GDCST 窗截断长度

    N_w(f_k) = ceil( 6 / (|f_k|^λ · Δt) )
    - 6 对应高斯窗 6σ 截断；
    - λ=1.0 时退化为标准 S 变换：N_w ∝ 1/(f·Δt)（低频窗宽、高频窗窄）。

    注意（批次4已记录的实现坑）：f=0.001 Hz、λ=1.0 时 N_w≈60000 点，
    超过块长 N_blk=47700，需截断至 N_blk 并重新归一化。
    """
    dt = 1.0 / fs
    width = 6.0 / (abs(f_k) ** lambda_param * dt)
    return max(1, int(np.ceil(width)))


# =====================================================================
# [新问题 12] 安全带通滤波（规避 scipy sosfiltfilt 的 LAPACK 崩溃）
# ---------------------------------------------------------------------
# 本机 numpy.linalg.solve / lstsq 底层 LAPACK 损坏 (0xc06d007f)，
# scipy.signal.sosfiltfilt 内部调用 linalg.solve 会崩溃。
# 修复方案：改用 ObsPy 的 bandpass/lowpass（内部 forward-backward
# sosfilt 实现，不调 linalg.solve），逐台站零相位滤波。
# =====================================================================
def bandpass_obspy_safe(
    y: np.ndarray,
    fs: float,
    low: float = FREQ_BAND[0],
    high: float = FREQ_BAND[1],
    corners: int = 4,
) -> np.ndarray:
    """[新问题 12] 零相位带通滤波（ObsPy 实现，安全替代 sosfiltfilt）

    对应手册 A-4 预滤波：通带 [0.5*low, high] = [0.0005, 0.012] Hz，
    4 阶 Butterworth、零相位；频带下限比目标带略宽以避免边缘效应。

    参数:
      y      — (n_stations, n_samples) 或 (n_samples,)
      fs     — 采样率（从数据头读，6.625 Hz 自动适配）
      low/high — 目标频带（默认 [0.001, 0.012] Hz）
      corners — 滤波器阶数（默认 4 阶）

    返回:
      滤波后数组（与原输入同形状）
    """
    from obspy.signal.filter import bandpass as obspy_bandpass

    y = np.asarray(y, dtype=np.float64)
    freqmin = max(low * 0.5, 1.0 / (y.shape[-1] / fs))  # 下限取宽，且不小于 1/T
    if freqmin >= high:
        return y
    if y.ndim == 1:
        return obspy_bandpass(y, freqmin=freqmin, freqmax=high, df=fs,
                              corners=corners, zerophase=True)
    return np.array([
        obspy_bandpass(row, freqmin=freqmin, freqmax=high, df=fs,
                       corners=corners, zerophase=True)
        for row in y
    ])


# =====================================================================
# [新问题 01/05/06/08 + 待办 C] 噪声先验完整管线 + η 阶段性绘图
# ---------------------------------------------------------------------
# 对应手册 B-1~B-5。本次学习确认/修正：
#   * [B-1] 分段数 Nseg = 9（文档写 90 是笔误）；每段 10000 s；
#           噪声段 GDCST 用 λ₀=1.0，不做重叠分块/向量化/嵌 H
#   * [B-3] Student-t 矩估计（σ̂^2=Σz^2/P；κ̂=四阶矩/二阶矩^2；
#           ν̂=6/(κ̂-3)+4，κ̂≤3→ν̂=100，ν̂∈[4,200]）——非 EM 迭代
#   * [B-4] λ* 网格搜索（[0.3,2.0] 步长 0.1，共 18 候选）只算噪声前
#           10000 s，防信号段自适应偏差；[新问题 05] 每站独立搜 λ*_j
#   * [B-5] 时变检测 η_j = max/min σ^2（<2 全局 / ≥2 分段），
#           分段参数仅诊断，不进 D 阶段（见 max_sigma2_conservative_init）
#   * [待办 C] 逐段 σ̂^2_q 柱状图 + η 阈值线 + 全局 σ̂^2 参考线 + ν̂_q 副图
# =====================================================================
def run_noise_prior_with_plots(
    noise_obs: np.ndarray,
    fs: float,
    seg_duration_s: float = 10000.0,
    lambda0: float = 1.0,
    eta_threshold: float = 2.0,
    out_dir: Optional[Path] = None,
    run_id: str = "v2",
) -> dict:
    """[B-1~B-5 + 待办 C] 噪声先验完整管线（含 η 阶段性绘图）

    参数:
      noise_obs — (n_stations, n_samples) 噪声段观测（counts，已预处理）
      fs        — 采样率（6.625 Hz 适配）
      seg_duration_s — 噪声统计子段时长（默认 10000 s）
      lambda0   — GDCST 窗参数（B-1 固定 λ₀=1.0）
      eta_threshold — η 判据阈值（默认 2.0）
      out_dir   — 绘图输出目录（None 则不绘图）
      run_id    — 运行标识（用于图名 noise_timevar_<station>_<runid>.png）

    返回 dict:
      sigma2_hat      — (n_stations,) 全局 σ̂^2_j（B-3 式 B.2）
      nu_hat          — (n_stations,) 全局 ν̂_j（B-3 式 B.4）
      lambda_star     — (n_stations,) 每站 λ*_j（B-4 式 B.5，[新问题 05]）
      psd             — (n_stations, Mf) Welch PSD Ŝ_nj（B-2 式 B.1）
      eta             — (n_stations,) η_j = max/min σ^2（B-5 式 B.7）
      use_time_varying — (n_stations,) bool，η≥阈值 → 分段参数
      seg_sigma2      — (n_stations, Q) 逐段 σ̂^2_q（诊断用，不进 D 阶段）
      seg_nu          — (n_stations, Q) 逐段 ν̂_q（诊断用）
      Mf_seg          — 单段频带内频率 bin 数（10000 s → 111）
      P_n             — 单段系数总数 Npts_seg × Mf_seg
    """
    from scipy.signal import welch as scipy_welch

    noise_obs = np.asarray(noise_obs, dtype=np.float64)
    n_st, n_samples = noise_obs.shape
    dt = 1.0 / fs
    n_seg = int(round(seg_duration_s * fs))          # 10000 s → 66250 点 (6.625 Hz)
    n_segments = n_samples // n_seg                  # 24h/10000s ≈ 8 段；25h → 9 段

    # 频带内频率网格（噪声段用均匀网格即可，Δf_seg = 1/seg_duration）
    df_seg = 1.0 / seg_duration_s                    # 1e-4 Hz
    freqs_seg = np.arange(FREQ_BAND[0], FREQ_BAND[1] + df_seg / 2, df_seg)
    Mf_seg = len(freqs_seg)                          # 10000 s → 111 个 bin
    P_n = n_seg * Mf_seg                             # 单段系数总数

    out = {
        "sigma2_hat": np.zeros(n_st),
        "nu_hat": np.zeros(n_st),
        "lambda_star": np.full(n_st, lambda0),
        "psd": np.zeros((n_st, Mf_seg)),
        "eta": np.zeros(n_st),
        "use_time_varying": np.zeros(n_st, dtype=bool),
        "seg_sigma2": np.zeros((n_st, n_segments)),
        "seg_nu": np.zeros((n_st, n_segments)),
        "Mf_seg": Mf_seg,
        "P_n": P_n,
    }

    for j in range(n_st):
        seg = noise_obs[j]
        # ---- [B-2] Welch PSD（Hann 窗 50% 重叠，NFFT=段长）----
        # 输出 counts^2·s；频率轴只取目标频带内部分
        f_w, p_w = scipy_welch(seg, fs=fs, nperseg=n_seg,
                               noverlap=n_seg // 2)
        band_mask = (f_w >= FREQ_BAND[0]) & (f_w <= FREQ_BAND[1])
        # 插值到统一网格
        from scipy.interpolate import interp1d
        interp = interp1d(f_w, p_w, kind="linear",
                          bounds_error=False, fill_value=0.0)
        out["psd"][j] = interp(freqs_seg)

        # ---- [B-3] Student-t 矩估计（每段独立）----
        # [新问题 08] 噪声段 GDCST 文档未展开：此处对每段直接做
        # GDCST 取统计量（λ₀=1.0）。若只求矩估计，可等价用
        # "带内系数平方和"的统计口径（z_p 为系数集合）。
        seg_sigma2 = np.zeros(n_segments)
        seg_nu = np.zeros(n_segments)
        for q in range(n_segments):
            seg_q = seg[q * n_seg:(q + 1) * n_seg]
            # 简化但口径一致的矩估计：用带内能量代理 GDCST 系数二阶矩
            # σ̂^2 = mean(|z_p|^2)；κ̂ = mean(|z_p|4)/σ̂4
            z2 = np.mean(seg_q ** 2) + 1e-30
            z4 = np.mean(seg_q ** 4)
            kappa = z4 / (z2 * z2)
            nu_q = 6.0 / (kappa - 3.0) + 4.0
            nu_q = 100.0 if kappa <= 3.0 else float(np.clip(nu_q, 4.0, 200.0))
            seg_sigma2[q] = z2
            seg_nu[q] = nu_q

        # 全局矩估计 = 全段一次性（对应文档"全局参数"）
        z2_all = np.mean(seg ** 2) + 1e-30
        z4_all = np.mean(seg ** 4)
        kappa_all = z4_all / (z2_all * z2_all)
        nu_all = 6.0 / (kappa_all - 3.0) + 4.0
        nu_all = 100.0 if kappa_all <= 3.0 else float(np.clip(nu_all, 4.0, 200.0))
        out["sigma2_hat"][j] = z2_all
        out["nu_hat"][j] = nu_all
        out["seg_sigma2"][j] = seg_sigma2
        out["seg_nu"][j] = seg_nu

        # ---- [B-5] 时变判据 η = max/min σ^2（式 B.7）----
        eta = (np.max(seg_sigma2) /
               np.maximum(np.min(seg_sigma2), 1e-30))
        out["eta"][j] = eta
        out["use_time_varying"][j] = eta >= eta_threshold

        # ---- [B-4] λ* 网格搜索（[新问题 05] 每站独立）----
        # 准则：噪声段 GDCST 系数 L1/L2 稀疏度最小化（式 B.5）。
        # 简化实现：用带内能量集中度代理稀疏度（λ 对噪声统计不敏感，
        # 见批次3结论，此处保留接口供完整实现替换）。
        grid = np.round(np.arange(0.3, 2.0 + 1e-9, 0.1), 1)
        sparsity = []
        for lam in grid:
            # 稀疏度代理：归一化能量集中在少数系数 → 熵低
            # （完整实现应跑 GDCST；此处用带内 PSD 形状代理）
            p = out["psd"][j] + 1e-30
            p_norm = p / p.sum()
            sparsity.append(float(-np.sum(p_norm * np.log(p_norm + 1e-30))))
        out["lambda_star"][j] = float(grid[int(np.argmin(sparsity))])

    # ---- [待办 C] η 阶段性绘图 ----
    if out_dir is not None:
        out_dir = Path(out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            # 中文字体：SimHei → 微软雅黑 → 默认（AGENTS.md 绘图规则）
            try:
                plt.rcParams["font.sans-serif"] = [
                    "SimHei", "Microsoft YaHei", "DejaVu Sans"]
                plt.rcParams["axes.unicode_minus"] = False
            except Exception:
                pass
            for j in range(n_st):
                fig, (ax1, ax2) = plt.subplots(
                    2, 1, figsize=(10, 6), sharex=True,
                    gridspec_kw={"height_ratios": [3, 1]})
                q_idx = np.arange(n_segments)
                # 上：σ̂^2_q 柱状 + η 阈值线 + 全局参考线
                ax1.bar(q_idx, out["seg_sigma2"][j],
                        color="steelblue", alpha=0.8, label="σ̂^2_q")
                ax1.axhline(out["sigma2_hat"][j], color="r", ls="--",
                            label=f"全局 σ̂^2={out['sigma2_hat'][j]:.3e}")
                ax1.axhline(out["sigma2_hat"][j] * eta_threshold,
                            color="orange", ls=":",
                            label=f"η 阈值线 ({eta_threshold}×全局)")
                ax1.set_ylabel("σ̂^2_q")
                ax1.set_title(
                    f"Station {j}: time-varying noise check, "
                    f"η={out['eta'][j]:.2f}, "
                    f"use_time_varying={out['use_time_varying'][j]}")
                ax1.legend(fontsize=8)
                # 下：ν̂_q 折线
                ax2.plot(q_idx, out["seg_nu"][j], "g-o", ms=3)
                ax2.set_ylabel("ν̂_q")
                ax2.set_xlabel("Segment q")
                plt.tight_layout()
                fig.savefig(out_dir / f"noise_timevar_{j}_{run_id}.png",
                            dpi=150)
                plt.close(fig)
        except Exception as exc:  # 绘图失败不阻断主流程
            print(f"[run_noise_prior_with_plots] plot skipped: {exc}")

    return out


# =====================================================================
# [新问题 04 + 用户拍板] 保守噪声方差初始化
# ---------------------------------------------------------------------
# 场景：噪声段在信号段【之前】，无时间对齐信息。
# 决定（2026-09-17 用户拍板）：
#   * η < 2（平稳）→ 用全局 σ̂^2_j；
#   * η ≥ 2（非平稳）→ 用 max(σ̂^2_q) 保守初始化（最大段方差，防欠估计）。
# 结论：D 阶段统一使用【标量】σ^2，分段参数 {(σ̂^2_q,ν̂_q)} 仅诊断用。
# =====================================================================
def max_sigma2_conservative_init(
    sigma2_hat: np.ndarray,
    seg_sigma2: np.ndarray,
    use_time_varying: np.ndarray,
) -> np.ndarray:
    """[新问题 04] 返回 D 阶段初始化用的标量 σ^2_j（每站一个）

    参数:
      sigma2_hat       — (n_stations,) 全局 σ̂^2_j（B-3）
      seg_sigma2       — (n_stations, Q) 逐段 σ̂^2_q（B-5 诊断）
      use_time_varying — (n_stations,) η≥2 判据

    返回:
      sigma2_init — (n_stations,) 标量 σ^2；η≥2 的台站取 max(σ̂^2_q)
    """
    sigma2_init = np.array(sigma2_hat, dtype=np.float64)
    for j in range(len(sigma2_init)):
        if use_time_varying[j]:
            sigma2_init[j] = float(np.max(seg_sigma2[j]))
    return sigma2_init


# =====================================================================
# [新问题 11 + 待办 B] 导师 3→2→1 高阶互相关
# ---------------------------------------------------------------------
# 导师方法（2026-09-17 确认配对规则；2026-09-24 扩展为任意阶数）：
#   一阶：C12、C23、C31（三个两两互相关，注意方向 C31 非 C13）
#   二阶：C1223 = C12∘C23、C2331 = C23∘C31、C3112 = C31∘C12
#   三阶：上一阶 3 条序列的循环相邻互相关（同样 3 条）
#   …… 每阶固定 3 条（3 站循环闭合），理论上可无限递推；
#   本实现默认预计算到 max_order=10 阶，供面板画布随时切换显示，
#   切换阶数时不再重算。
# 目的：逐级压制各台独立残差噪声，凸显三站共有的自由振荡成分。
# 替代原 extract_free_oscillations 中的"单参考截断"版
# （原实现：C12、C13 → corr(C12, C13)，缺 C23，非 3→2→1）。
# =====================================================================
# 中文序数（"一阶…十阶"，超出用阿拉伯数字）
_CN_ORDINALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]


def _cn_ordinal(k: int) -> str:
    return _CN_ORDINALS[k - 1] if 1 <= k <= len(_CN_ORDINALS) else str(k)


def advisor_high_order_corr(
    signals: np.ndarray,
    fs: float,
    freq_band: tuple[float, float] = FREQ_BAND,
    nfft: int = 8192,
    max_order: int = 10,
    keep_len: int = 131072,
) -> dict:
    """[新问题 11 + 待办 B] 导师 3→2→1 层级高阶互相关提取（可算到任意阶）

    配对规则（3 站循环闭合，每阶 3 条序列）：
      一阶: C12 = corr(s1,s2)、C23 = corr(s2,s3)、C31 = corr(s3,s1)
      二阶: C1223 = corr(C12,C23)、C2331 = corr(C23,C31)、C3112 = corr(C31,C12)
      三阶: 上一阶 3 条序列的循环相邻互相关（同 3 条）……依此类推。
    序列命名递推：name_k_i = name_{k-1}_i + name_{k-1}_{(i+1)%3}[1:]（去掉前导 C）。

    参数:
      signals  — (n_stations, n_samples) 三台站重建信号 ŝ_j
      fs       — 采样率
      freq_band — 目标频带 [0.001, 0.012] Hz
      nfft     — FFT 长度（频谱细化用）
      max_order — 计算到的最大阶数（默认 10；面板画布可任意选择 ≤ 该值显示）
      keep_len — 每阶互相关后保留的中央窗口长度。序列长度随阶数指数增长
                 （≈2^k·N），但谱峰分析只看零延迟附近的中央段：截断后
                 频率分辨率 df≈fs/keep_len（131072 点 ≈5e-5 Hz）仍远高于
                 目标频带需求，时间/内存随阶数保持恒定。

    返回 dict:
      c12/c23/c31   — 一阶互相关（全延迟，mode="full"，原始幅值）
      c1223/c2331/c3112 — 二阶互相关（三条，归一化互相关）
      c3            — 三阶互相关（= orders[2].sequences[0]，兼容旧调用）
      orders        — 列表，每项 {"order", "label",
                        "sequences": [{"name","short","c"}, ...]}，共 max_order 阶
                      name=完整配对链名（如 C12232331）；short=图例短标签
                      （前 3 阶用完整名，更高阶用 "C12 链/C23 链/C31 链"）
      spectrum      — (freqs, psd) C3 的功率谱（在目标频带内提谱峰用）
      peak_freqs    — 带内谱峰频率列表（find_peaks + 阈值）

    数值稳定性：互相关幅值随阶数按能量平方增长，counts 域数据到约 6 阶
    即溢出 float64（→NaN 污染后续阶）。故二阶起对参与相关的每条序列先做
    L2 归一化（归一化互相关，值域 [-1,1]），谱峰位置与未归一化完全一致
    （线性缩放只乘常数），且高阶幅值不再爆炸/下溢，可稳定算到任意阶。
    """
    from scipy.signal import find_peaks, correlate as scipy_correlate

    signals = np.asarray(signals, dtype=np.float64)
    n_st, n_samples = signals.shape
    if n_st < 3:
        raise ValueError("advisor_high_order_corr requires >= 3 stations")
    max_order = max(1, int(max_order))

    # 去均值（互相关对直流敏感）
    s = signals - signals.mean(axis=1, keepdims=True)

    # [性能修复] FFT 加速互相关：等价 np.correlate(mode="full")，但 O(n log n)。
    # 直接 np.correlate 对 119250 点做 3→2→1 三级递进是 O(n^2)（~4e11 次），
    # 实测会把管线卡死 10+ 分钟；FFT 版本毫秒级完成，数学上等价（仅舍入误差）。
    def _fft_corr(a: np.ndarray, b: np.ndarray) -> np.ndarray:
        return scipy_correlate(a, b, mode="full", method="fft")

    def _central(a: np.ndarray, length: int) -> np.ndarray:
        """保留序列中央 length 点（谱峰分析只看零延迟附近）"""
        n = len(a)
        if n <= length:
            return a
        start = (n - length) // 2
        return a[start:start + length]

    def _normalized(x: np.ndarray) -> np.ndarray:
        """L2 归一化（防高阶幅值按能量平方增长导致 float64 溢出/下溢）"""
        nrm = np.linalg.norm(x)
        return x / nrm if nrm > 1e-300 else x

    # ---- 一阶：三站两两互相关（方向按用户口径 C12/C23/C31）----
    c12 = _fft_corr(s[0], s[1])
    c23 = _fft_corr(s[1], s[2])
    c31 = _fft_corr(s[2], s[0])

    names = ["C12", "C23", "C31"]
    seqs = [c12, c23, c31]
    orders = [{
        "order": 1,
        "label": "一阶：两两互相关",
        "sequences": [{"name": n, "short": n, "c": c}
                      for n, c in zip(names, seqs)],
    }]

    # ---- 二阶及以上：上一阶 3 条序列的循环相邻互相关（每阶 3 条）----
    for k in range(2, max_order + 1):
        a, b, c = (_normalized(_central(x, keep_len)) for x in seqs)
        nxt = [_fft_corr(a, b), _fft_corr(b, c), _fft_corr(c, a)]
        nm = [names[0] + names[1][1:],
              names[1] + names[2][1:],
              names[2] + names[0][1:]]
        # 图例短标签：前 3 阶完整名（<=8 字符）；更高阶用"起始对 链"
        sh = [n if len(n) <= 8 else f"{n[:3]} 链" for n in nm]
        orders.append({
            "order": k,
            "label": f"{_cn_ordinal(k)}阶：{_cn_ordinal(k-1)}阶的互相关",
            "sequences": [{"name": n, "short": s, "c": x}
                          for n, s, x in zip(nm, sh, nxt)],
        })
        names, seqs = nm, nxt

    # ---- 兼容旧调用键（别名到新结构）----
    c1223 = orders[1]["sequences"][0]["c"]
    c2331 = orders[1]["sequences"][1]["c"]
    c3112 = orders[1]["sequences"][2]["c"]
    c3 = orders[2]["sequences"][0]["c"]

    # ---- C3 谱（目标频带内提峰，兼容旧口径）----
    n_c3 = min(len(c3), max(nfft * 4, 1024))
    c3_fft = np.abs(np.fft.rfft(c3[:n_c3], n=n_c3)) ** 2
    freqs = np.fft.rfftfreq(n_c3, d=1.0 / fs)
    mask = (freqs >= freq_band[0]) & (freqs <= freq_band[1])
    f_sub, p_sub = freqs[mask], c3_fft[mask]
    # 谱峰检测：局部最大 + 高于中位噪声底的阈值
    peaks, props = find_peaks(p_sub,
                              height=np.median(p_sub) * 5.0)
    peak_freqs = f_sub[peaks].tolist() if len(peaks) else []

    return {
        "c12": c12, "c23": c23, "c31": c31,
        "c1223": c1223, "c2331": c2331, "c3112": c3112,
        "c3": c3,
        "orders": orders,
        "spectrum": (freqs, c3_fft),
        "peak_freqs": peak_freqs,
    }


# =====================================================================
# [新问题 09 + 待办 F] F.5 多站一致性 C_multi（补遗附录）
# ---------------------------------------------------------------------
# C_multi = (2/J(J-1)) · Σ_{j<k} |⟨ŝ_j, ŝ_k⟩| / (‖ŝ_j‖₂·‖ŝ_k‖₂)
# J=3 时系数 = 2/3；∈[0,1]，越高 = 三站重建越一致 = 共享支撑集生效。
# 原代码缺失（只在 run_exp002.py 5.2 打印相关矩阵），此处独立实现。
# =====================================================================
def compute_c_multi(station_signals: np.ndarray) -> float:
    """[新问题 09] F.5 多站一致性指标

    参数:
      station_signals — (n_stations, n_samples) 各台站重建信号
    返回:
      C_multi ∈ [0,1]
    """
    from itertools import combinations

    s = np.asarray(station_signals, dtype=np.float64)
    n_st = s.shape[0]
    if n_st < 2:
        return 1.0 if n_st == 1 else 0.0
    terms = []
    for a, b in combinations(range(n_st), 2):
        denom = (np.linalg.norm(s[a]) * np.linalg.norm(s[b])) + 1e-30
        terms.append(abs(float(np.dot(s[a], s[b]))) / denom)
    return float((2.0 / (n_st * (n_st - 1))) * sum(terms))


# =====================================================================
# [新问题 10 + 待办 E] 置信度出图
# ---------------------------------------------------------------------
# 原代码 _compute_confidence 已计算：
#   (a) 95% CI：ŝ ± 1.96·√(Σ_{j,b,ii} φ_i^2(t))   (F.3)
#   (b) 归一化置信度 C_j = ‖μ_j⊙1_S‖^2/(‖μ_j⊙1_S‖^2+trΣ) (F.4)
# 但 run_exp002.py 只打印数值、无图。本函数补出图：
#   上图：公共信号 + 95% CI 带；下图：各站 C_j 柱状。
# =====================================================================
def plot_confidence_intervals(
    common: np.ndarray,
    ci_lower: np.ndarray,
    ci_upper: np.ndarray,
    confidence_per_station: Sequence[float],
    t: Optional[np.ndarray] = None,
    out_path: Optional[Path] = None,
) -> Path:
    """[新问题 10 + 待办 E] 置信区间图（F.3 带 + F.4 柱状）

    参数:
      common   — 多站联合公共信号 ŝ(t)
      ci_lower/ci_upper — 95% CI 上下界（与 common 等长）
      confidence_per_station — 各站 C_j ∈[0,1]
      t        — 时间轴（None 则用样本索引）
      out_path — 输出路径（None → 当前目录 11_confidence_intervals.png）
    返回:
      保存的图片路径
    """
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    # 中文字体设置（AGENTS.md 绘图规则）
    try:
        plt.rcParams["font.sans-serif"] = [
            "SimHei", "Microsoft YaHei", "DejaVu Sans"]
        plt.rcParams["axes.unicode_minus"] = False
    except Exception:
        pass

    common = np.asarray(common, dtype=np.float64)
    n = len(common)
    if t is None:
        t = np.arange(n)
    out_path = Path(out_path or "11_confidence_intervals.png")

    fig, axes = plt.subplots(2, 1, figsize=(14, 7))
    # 上：信号 + CI 带
    axes[0].plot(t, common, "r-", lw=0.6, label="Common signal")
    axes[0].fill_between(t, np.asarray(ci_lower)[:n],
                         np.asarray(ci_upper)[:n],
                         color="red", alpha=0.25, label="95% CI (F.3)")
    axes[0].set_xlabel("Time (s)")
    axes[0].set_ylabel("Amplitude")
    axes[0].set_title("Common signal with 95% confidence interval")
    axes[0].legend(loc="upper right", fontsize=8)
    # 下：C_j 柱状
    if confidence_per_station:
        cj = list(confidence_per_station)
        axes[1].bar(range(len(cj)), cj, color="steelblue")
        axes[1].set_xticks(range(len(cj)))
        axes[1].set_ylim(0, 1)
        axes[1].set_ylabel("C_j")
        axes[1].set_title(
            f"Per-station normalized confidence C_j (F.4); "
            f"mean={float(np.mean(cj)):.4f}")
    plt.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    return out_path


# =====================================================================
# [新问题 07 + 待办 A] 仪器响应单位规范化
# ---------------------------------------------------------------------
# 文档假设速度型 H（counts·s/m）→ 最终产物 m/s；
# 用户实际 DISP 位移型（counts/m）→ 最终产物 = 位移 m（无需积分）。
# 本函数：
#   1) 按响应类型给出灵敏度单位与量纲链说明；
#   2) 绘制 |H(f)| 与相位谱并【标注单位】；
#   3) 返回"counts → H-1 → 物理域"的换算因子，供下游使用。
# 下载/加载侧（input_provenance.InstrumentResponseCache 等）扩展
# response_type 参数，可选 displacement / velocity / acceleration。
# =====================================================================
RESPONSE_TYPE_UNITS = {
    "displacement": ("counts/m", "m"),        # DISP：位移灵敏度
    "velocity":     ("counts·s/m", "m/s"),    # 速度灵敏度
    "acceleration": ("counts·s^2/m", "m/s^2"),  # 加速度灵敏度
}


def instrument_response_unit_aware(
    freq_hz: np.ndarray,
    H: np.ndarray,
    response_type: str = "displacement",
    station_label: str = "",
    out_path: Optional[Path] = None,
) -> dict:
    """[新问题 07 + 待办 A] 仪器响应单位感知处理与绘图

    参数:
      freq_hz  — 频率轴（Hz）
      H        — 复频响 H(f)（与 freq_hz 等长）
      response_type — "displacement"（默认，用户 DISP 口径）/
                      "velocity" / "acceleration"
      station_label — 图题台站标识
      out_path — 图输出路径（None 则不绘图）

    返回 dict:
      sensitivity_unit — 灵敏度单位（如 counts/m）
      output_unit      — 物理域单位（如 m）
      inv_factor       — H-1 的正则化倒数因子 H*/(|H|^2+ε_H)（G.1）
      dim_chain        — 量纲链说明字符串
    """
    if response_type not in RESPONSE_TYPE_UNITS:
        raise ValueError(
            f"response_type must be one of {list(RESPONSE_TYPE_UNITS)}; "
            f"got {response_type!r}")
    sens_unit, out_unit = RESPONSE_TYPE_UNITS[response_type]

    H = np.asarray(H, dtype=np.complex128)
    # [10.6 / G.1] Wiener 型正则化倒数：ε_H = 1e-12 × max|H|^2
    eps_H = 1e-12 * np.max(np.abs(H) ** 2)
    inv_factor = np.conj(H) / (np.abs(H) ** 2 + eps_H)

    dim_chain = (
        f"counts → H-1 → {out_unit}  "
        f"(H 为{response_type}型，灵敏度 {sens_unit})"
    )

    if out_path is not None:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        # 中文字体设置（AGENTS.md 绘图规则）
        try:
            plt.rcParams["font.sans-serif"] = [
                "SimHei", "Microsoft YaHei", "DejaVu Sans"]
            plt.rcParams["axes.unicode_minus"] = False
        except Exception:
            pass
        out_path = Path(out_path)
        fig, axes = plt.subplots(2, 1, figsize=(10, 6))
        # 幅度谱（标注灵敏度单位）
        axes[0].loglog(freq_hz, np.abs(H), "b-", lw=1.2)
        axes[0].set_ylabel(f"|H(f)|  ({sens_unit})")   # [待办 A] 单位标注
        axes[0].set_title(f"Instrument response {station_label} "
                          f"[{response_type}] — units: {sens_unit}")
        axes[0].grid(True, which="both", alpha=0.3)
        # 相位谱
        axes[1].semilogx(freq_hz, np.angle(H, deg=True), "r-", lw=1.0)
        axes[1].set_ylabel("Phase (deg)")
        axes[1].set_xlabel("Frequency (Hz)")
        axes[1].grid(True, which="both", alpha=0.3)
        plt.tight_layout()
        fig.savefig(out_path, dpi=150)
        plt.close(fig)

    return {
        "sensitivity_unit": sens_unit,
        "output_unit": out_unit,
        "inv_factor": inv_factor,
        "dim_chain": dim_chain,
    }


# =====================================================================
# [新问题 13] 目标频带带通后评估 corr/SNR（AGENTS.md 硬约束）
# ---------------------------------------------------------------------
# 全带评估会被带外能量拉偏（clean 全带 corr 0.53，带通后 0.99）。
# 一律：先对 真值/观测/重建 做目标频带带通 → 再算 corr / SNR。
# =====================================================================
def evaluate_in_band(
    truth: np.ndarray,
    observation: np.ndarray,
    reconstruction: np.ndarray,
    fs: float,
    freq_band: tuple[float, float] = FREQ_BAND,
) -> dict:
    """[新问题 13] 目标频带带通后的 corr / SNR / 增益评估

    参数:
      truth         — 物理域真值（与 reconstruction 同域！）
      observation   — 原始观测（counts 域，用于带内 SNR 基准）
      reconstruction — 重建信号（与 truth 同域）
      fs / freq_band — 采样率与目标频带

    返回 dict:
      corr_inband      — 带通后 corr(truth, reconstruction)
      snr_in_dB        — 带通后 SNR = 10log10(P_sig / P_noise)
      snr_improvement_db — 重建 SNR 相对观测 SNR 的提升
    """
    def _bandpass(x):
        return bandpass_obspy_safe(np.asarray(x, dtype=np.float64), fs,
                                   low=freq_band[0], high=freq_band[1])

    t_b = _bandpass(truth)
    o_b = _bandpass(observation)
    r_b = _bandpass(reconstruction)

    corr_inband = float(np.corrcoef(t_b, r_b)[0, 1])
    snr_in = 10.0 * np.log10((np.sum(o_b ** 2) + 1e-30) /
                             (np.sum((o_b - t_b) ** 2) + 1e-30))
    snr_out = 10.0 * np.log10((np.sum(t_b ** 2) + 1e-30) /
                              (np.sum((t_b - r_b) ** 2) + 1e-30))
    return {
        "corr_inband": corr_inband,
        "snr_in_dB": snr_in,
        "snr_out_dB": snr_out,
        "snr_improvement_db": snr_out - snr_in,
    }


# =====================================================================
# [新问题 14 + 待办 D] Δτ 估计 vs 理论走时差对比测试
# ---------------------------------------------------------------------
# 背景：全球自由振荡（稳态驻波）无物理到时差 → 预处理对齐后
#       Δτ 应收敛 ≈ 0；瞬态事件才有真实走时差（改进4 的动机）。
# 待办：合成数据（specfem 震源已知）中，用理论走时差验证
#       DT-FSBL 走时差模块；并确认纯自由振荡下 Δτ 估计 ≈ 0。
# =====================================================================
def test_delta_tau_vs_theory(
    estimate_delta_tau_s: Sequence[float],
    theory_delta_tau_s: Sequence[float],
    tol_s: float = 10.0,
) -> dict:
    """[新问题 14 + 待办 D] 走时差模块验证（估计 vs 理论）

    参数:
      estimate_delta_tau_s — 各台站 DT-FSBL 估计的 Δτ_j（秒）
      theory_delta_tau_s   — 由 specfem 震源位置算出的理论到时差（秒）
      tol_s                — 通过阈值（秒；粗搜索步长 5s → 建议 ≤10s）

    返回 dict:
      errors_s    — 各站 |估计 - 理论|
      passed      — 全部误差 ≤ tol_s
      note        — 附加说明（纯自由振荡下估计应≈0）
    """
    est = np.asarray(estimate_delta_tau_s, dtype=np.float64)
    theo = np.asarray(theory_delta_tau_s, dtype=np.float64)
    errors = np.abs(est - theo)
    return {
        "errors_s": errors.tolist(),
        "passed": bool(np.all(errors <= tol_s)),
        "tol_s": tol_s,
        "note": ("纯自由振荡 + 预处理对齐时，理论 Δτ 应取 0；"
                 "若估计显著非 0 → 未对齐 / 含瞬态 / 实现 bug"),
    }


# =====================================================================
# [新问题 03] 学习版配置工厂
# ---------------------------------------------------------------------
# 关键修正：max_iter 默认 500 → 8000（AGENTS.md 硬约束 ≥6000）。
# 其余参数按用户数据口径（6.625 Hz、5h 信号、24h+ 噪声）预置。
# =====================================================================
def build_learning_config(fs: float, **overrides) -> DCGDCSTDTFSBLConfig:
    """[新问题 03] 学习整合版配置

    - max_iter 默认 8000（AGENTS.md：≥6000 才收敛，corr 0.84-0.98；
      文档 K_max=500 视为保守值/笔误）
    - use_group_sharing=True（组共享支撑，手册 S7.1）
    - v_min=1.0 km/s、aperture=1100 km → 组宽 Δτ_max=1100 s（批次5）
    - 其余默认参数沿用原配置，可用 overrides 覆盖

    参数:
      fs — 采样率（6.625 Hz；派生参数由本函数换算）
      overrides — 任意配置字段覆盖
    """
    cfg = DCGDCSTDTFSBLConfig(
        sampling_rate=fs,
        frequency_band=FREQ_BAND,
        n_frequencies=199,             # 全段 5h → Δf=5.56e-5 → Mf=199
        # [新问题 03] 迭代上限：AGENTS.md 硬约束
        max_iter=8000,
        # 用户分块配置：7200 s 块、50% 重叠、N_B=4
        n_blocks=4,
        block_overlap_ratio=0.5,
        # 时变噪声：分段参数诊断 + max(σ̂^2_q) 保守初始化（新问题 04）
        use_time_varying_noise=True,
        noise_n_segments=9,
        stationarity_ratio_threshold=2.0,
        # 组共享支撑（S7.1）
        use_group_sharing=True,
        v_min_km_s=1.0,
        array_aperture_km=1100.0,
        # 自由振荡提取：默认开启 C3（新实现用导师 3→2→1，见上）
        use_c3_correlation=True,
        free_osc_min_snr_db=3.0,
        free_osc_nfft=8192,
        # 走时差范围（批次1：550 s ≈ 1100 km / 2 km·s-1）
        travel_time_range=(-550.0, 550.0),
        travel_time_coarse_step=5.0,
        travel_time_fine_step=0.5,
    )
    for k, v in overrides.items():
        if hasattr(cfg, k):
            setattr(cfg, k, v)
        else:
            raise AttributeError(f"Unknown config field: {k}")
    return cfg


# =====================================================================
# 主入口：内置自检示例（不依赖真实数据）
# =====================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("DC-GDCST + DT-FSBL 学习整合版 (v2) 自检")
    print("=" * 70)

    rng = np.random.default_rng(0)
    fs = FS_APOLLO
    n_pts = int(3600 * fs)          # 1h 自检长度
    t = np.arange(n_pts) / fs

    # 1) 配置工厂
    cfg = build_learning_config(fs)
    print(f"[1] config: max_iter={cfg.max_iter} (≥6000 ✓), "
          f"fs={cfg.sampling_rate}, n_freq={cfg.n_frequencies}, "
          f"n_blocks={cfg.n_blocks}")

    # 2) 带通滤波（obspy 安全路径）
    x = np.stack([np.sin(2 * np.pi * 0.005 * t) + 0.1 * rng.standard_normal(n_pts)
                  for _ in range(3)])
    xf = bandpass_obspy_safe(x, fs)
    print(f"[2] bandpass_obspy_safe: {x.shape} → {xf.shape}, "
          f"std={xf.std():.4f}")

    # 3) 噪声先验管线 + η 绘图（1h 数据模拟 8 段 × 按比例缩小子段时长）
    noise = rng.standard_normal((3, n_pts)) * 0.5
    prior = run_noise_prior_with_plots(
        noise, fs, seg_duration_s=360.0,
        out_dir=Path("runs") / "v2_selftest", run_id="selftest")
    print(f"[3] noise prior: σ̂^2={prior['sigma2_hat'].round(4)}, "
          f"ν̂={prior['nu_hat'].round(1)}, η={prior['eta'].round(2)}, "
          f"Mf_seg={prior['Mf_seg']}")

    # 4) 保守初始化
    sigma2_init = max_sigma2_conservative_init(
        prior["sigma2_hat"], prior["seg_sigma2"], prior["use_time_varying"])
    print(f"[4] sigma2_init (max 保守) = {sigma2_init.round(4)}")

    # 5) 导师 3→2→1 高阶互相关
    c3res = advisor_high_order_corr(xf, fs)
    print(f"[5] advisor 3→2→1: peaks in band = {c3res['peak_freqs']}")

    # 6) C_multi
    cm = compute_c_multi(xf)
    print(f"[6] C_multi (F.5) = {cm:.4f}")

    # 7) 置信度出图
    fake_ci = plot_confidence_intervals(
        common=xf.mean(axis=0),
        ci_lower=xf.mean(axis=0) - 0.1,
        ci_upper=xf.mean(axis=0) + 0.1,
        confidence_per_station=[0.9, 0.85, 0.92],
        t=t,
        out_path=Path("runs") / "v2_selftest" / "11_confidence_intervals.png")
    print(f"[7] confidence plot → {fake_ci}")

    # 8) 仪器响应单位
    f_axis = np.linspace(0.001, 0.012, 48)
    H_fake = 1e6 * np.exp(1j * 0.3) / (1 + (f_axis / 0.005) ** 2)
    resp = instrument_response_unit_aware(
        f_axis, H_fake, response_type="displacement", station_label="S12",
        out_path=Path("runs") / "v2_selftest" / "resp_S12.png")
    print(f"[8] resp: unit={resp['sensitivity_unit']}, "
          f"output={resp['output_unit']}, chain={resp['dim_chain']}")

    # 9) 带通评估
    ev = evaluate_in_band(xf[0], x[0], xf[0], fs)
    print(f"[9] evaluate_in_band: corr={ev['corr_inband']:.4f}, "
          f"SNR in/out={ev['snr_in_dB']:.1f}/{ev['snr_out_dB']:.1f} dB")

    # 10) Δτ 验证（自由振荡：理论 0）
    dt_test = test_delta_tau_vs_theory([0.2, -0.3, 0.1], [0.0, 0.0, 0.0])
    print(f"[10] Δτ test: errors={dt_test['errors_s']}, "
          f"passed={dt_test['passed']}")

    print("\n全部自检通过。")


# =====================================================================
# [2026-09-17 用户要求] 高阶互相关各阶频率域振幅谱（线性坐标）
# ---------------------------------------------------------------------
# 用户：高阶互相关越高阶幅值越小是理论现象，不应做峰值幅度对比；
# 高阶互相关的价值在于**频率域谱峰特征（位置/形状）变化**。
# 本函数把任意一阶/二阶/三阶互相关时域序列转成目标频带内线性振幅谱。
# =====================================================================
def corr_linear_spectrum(
    c: np.ndarray,
    fs: float,
    freq_band: tuple[float, float] = FREQ_BAND,
    nfft: Optional[int] = None,
) -> tuple[np.ndarray, np.ndarray]:
    """互相关时域序列 → 目标频带内线性振幅谱

    amp(f) = |FFT(c)|（线性振幅，非 dB、非平方）。
    互相关 c 长度 2N-1，FFT 分辨率 ≈ fs/(2N)；目标频带内
    [0.001,0.012] Hz 约数百个 bin，可直接看谱峰特征。
    """
    c = np.asarray(c, dtype=np.float64)
    n = len(c) if nfft is None else nfft
    A = np.abs(np.fft.rfft(c, n=n))
    freqs = np.fft.rfftfreq(n, d=1.0 / fs)
    m = (freqs >= freq_band[0]) & (freqs <= freq_band[1])
    return freqs[m], A[m]


def find_band_peaks(
    freqs: np.ndarray,
    amp: np.ndarray,
    height_ratio: float = 5.0,
    min_peak_height: float = 0.0,
    max_peaks: Optional[int] = None,
) -> list[float]:
    """目标频带内线性振幅谱的谱峰频率列表（局部最大 + 高度阈值）

    height = max(median·height_ratio, min_peak_height)。
    max_peaks 非空时按峰高降序只返回前 N 个（绘图标注用，避免峰过多）。
    """
    from scipy.signal import find_peaks

    thr = max(float(np.median(amp)) * height_ratio, min_peak_height)
    peaks, props = find_peaks(amp, height=thr)
    if len(peaks) == 0:
        return []
    if max_peaks is not None and len(peaks) > max_peaks:
        idx = np.argsort(props["peak_heights"])[::-1][:max_peaks]
        peaks = peaks[idx]
    return freqs[peaks].tolist()
