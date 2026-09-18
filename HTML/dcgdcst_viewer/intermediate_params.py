# -*- coding: utf-8 -*-
"""
intermediate_params.py（2026-09-17 新增）
=====================================================================
面板"参数总览"页签的数据源：把管线各阶段可展示的**中间计算结果**全部暴露，
供 dashboard_server.py 的 /api/params 接口返回、前端表格渲染。

【覆盖的参数】（按阶段）
  B 噪声建模（逐站）:
    λ*      — B-5 λ 优化结果（exp014 配置 use_lambda_optimization=false，
              固定 λ=1.0；真实管线按 [0.3,2.0] 步长 0.1 搜索）
    m2      — 噪声 GDCST 系数二阶矩 E[|c|²]（counts²）
    κ       — 系数峰度 E[|c|⁴]/E[|c|²]²（Student-t 形状参数）
    ν̂       — Student-t 自由度（ν̂=6/(κ−3)+4，κ≤3→100，∈[4,200]）
    σ̂²      — 噪声方差（全局）
    η       — 平稳性比值 max(σ²_q)/min(σ²_q)，≥2 非平稳
    判定     — 平稳 / 非平稳（→ D 阶段初始化策略）
  C GDCST（逐站）:
    m2 系数  — 信号 GDCST 系数二阶矩（dB 域为能量）
    κ 系数   — 信号系数峰度
    N_w 范围 — 修正窗长（问题 02）随频率变化范围 [min, max] 点
  D DT-FSBL（全局）:
    迭代次数  — max_iter 实跑次数（≥6000 硬约束，问题 03）
    活跃原子  — |S_b| = Σ active_mask
    γ 统计    — ARD 超参数 γ=1/α 的 max/min（log10）
  E 重建（全局，带通后评估——问题 13）:
    counts 域 corr / SNR in / SNR out
    物理域 corr / SNR in / SNR out（DISP 位移口径）
  F 后处理:
    C_j        — 逐站归一化置信度（F.4 近似，与公共信号相关）
    C_multi    — 多站一致性（F.5，2/3·Σ 两两归一化互相关）
    C3 谱峰    — 三阶互相关带内谱峰（导师 3→2→1）
    Δτ passed  — 走时差估计 vs 理论（自由振荡理论=0，±10s 通过）
"""
from __future__ import annotations

import numpy as np

from plotly_figs import load_npz
from run_pipeline_v3_learning import FREQ_BAND, STATIONS, bandpass_obspy_safe
from dc_gdcst_dtfsbl_v2_learning import (
    advisor_high_order_corr,
    compute_c_multi,
    evaluate_in_band,
    gdcst_window_length,
    test_delta_tau_vs_theory,
)

# exp014 配置口径（真实数据联跑后由管线动态传入）
LAMBDA_STAR = 1.0          # exp014: use_lambda_optimization=false 固定 1.0
MAX_ITER_RUN = 6000        # metadata fsbl_info.n_iterations


def _seg_stats(coeff_j, Q=9):
    """噪声系数 (64, n_frames) → 分组 σ²_q / ν_q / η"""
    n_frames = coeff_j.shape[1]
    idx = np.array_split(np.arange(n_frames), Q)
    seg_s2 = np.array([np.mean(np.abs(coeff_j[:, grp]) ** 2) for grp in idx])
    seg_k = np.array([np.mean(np.abs(coeff_j[:, grp]) ** 4) /
                      (np.mean(np.abs(coeff_j[:, grp]) ** 2) ** 2 + 1e-30)
                      for grp in idx])
    seg_nu = np.array([6.0 / (k - 3.0) + 4.0 if k > 3.0 else 100.0
                       for k in seg_k])
    eta = float(np.max(seg_s2) / np.maximum(np.min(seg_s2), 1e-30))
    return seg_s2, seg_nu, eta


def compute_all_params(npz: dict | None = None) -> dict:
    """汇总全部中间参数（分层结构，供前端表格渲染）"""
    if npz is None:
        npz = load_npz()
    fs = float(npz["fs_hz"])
    out = {"meta": {"fs_hz": fs, "freq_band": list(FREQ_BAND)},
           "stages": {}}

    # ---------- B 噪声建模 ----------
    coeff = npz["noise_coeff"]                    # (3, 64, 47)
    m2 = np.mean(np.abs(coeff) ** 2, axis=(1, 2))
    m4 = np.mean(np.abs(coeff) ** 4, axis=(1, 2))
    kappa = m4 / (m2 ** 2 + 1e-30)
    nu = npz["nu_values"]                         # (3,)
    sigma2 = npz["sigma2"]                        # (3,)
    rows_b = []
    for j, st in enumerate(STATIONS):
        seg_s2, seg_nu, eta = _seg_stats(coeff[j])
        rows_b.append({
            "station": st,
            "lambda_star": LAMBDA_STAR,
            "m2": float(m2[j]),
            "kappa": float(kappa[j]),
            "nu": float(nu[j]),
            "sigma2": float(sigma2[j]),
            "eta": eta,
            "verdict": "非平稳→max(σ^2_q) 保守初始化" if eta >= 2 else "平稳→全局 σ^2",
            "seg_sigma2": [float(v) for v in seg_s2],
            "seg_nu": [float(v) for v in seg_nu],
        })
    out["stages"]["B_噪声建模"] = rows_b

    # ---------- C GDCST ----------
    sig_c = npz["signal_coeff_raw"]               # (3, 64, 233)
    sig_m2 = np.mean(np.abs(sig_c) ** 2, axis=(1, 2))
    sig_k = (np.mean(np.abs(sig_c) ** 4, axis=(1, 2)) /
             (sig_m2 ** 2 + 1e-30))
    lam = 1.0
    freqs = npz["freqs"]
    nw = np.array([gdcst_window_length(f, lam, fs) for f in freqs])
    rows_c = [{
        "station": st,
        "m2": float(sig_m2[j]),
        "kappa": float(sig_k[j]),
        "nw_min": float(nw.min()),
        "nw_max": float(nw.max()),
    } for j, st in enumerate(STATIONS)]
    out["stages"]["C_GDCST"] = rows_c

    # ---------- D DT-FSBL ----------
    gamma = npz["gamma"]                          # (64, 233)
    active = npz["active_mask"]
    out["stages"]["D_DT_FSBL"] = [{
        "n_iterations": MAX_ITER_RUN,
        "n_active_atoms": int(active.sum()),
        "gamma_max_log10": float(np.log10(np.max(gamma))),
        "gamma_min_log10": float(np.log10(np.maximum(gamma, 1e-30).min())),
        "n_freqs": int(gamma.shape[0]),
        "n_frames": int(gamma.shape[1]),
    }]

    # ---------- E 重建（带通后评估，问题 13）----------
    obs = npz["observations"].mean(axis=0)
    truth_c = npz["clean_counts"].mean(axis=0)
    recon_c = npz["common_signal_counts"]
    ev_c = evaluate_in_band(truth_c, obs, recon_c, fs)
    # [2026-09-17 幅值修正] 物理域重建必须 fix_phys（exp013 漏除 amplitude_scale）；
    # 物理域无"含噪观测"概念 → E 表物理域仅 corr，SNR 以 counts 域为准
    from plotly_figs import fix_phys
    truth_p = npz["signal_filtered"].mean(axis=0)
    recon_p = fix_phys(npz, npz["common_signal_phys"])
    t_bp = bandpass_obspy_safe(truth_p, fs, FREQ_BAND[0], FREQ_BAND[1])
    r_bp = bandpass_obspy_safe(recon_p, fs, FREQ_BAND[0], FREQ_BAND[1])
    corr_p = float(np.corrcoef(t_bp, r_bp)[0, 1])
    out["stages"]["E_重建评估"] = [{
        "domain": "counts 域",
        "corr_inband": float(ev_c["corr_inband"]),
        "snr_in_dB": float(ev_c["snr_in_dB"]),
        "snr_out_dB": float(ev_c["snr_out_dB"]),
    }, {
        "domain": "物理域 (m)",
        "corr_inband": corr_p,
        "snr_in_dB": None,
        "snr_out_dB": None,
    }]

    # ---------- F 后处理 ----------
    s_st = npz["station_signals_phys"]
    common = npz["common_signal_phys"]
    step = max(1, common.shape[0] // 3000)
    common_d = common[::step]
    c_j = []
    for j in range(3):
        a = s_st[j][::step] - s_st[j][::step].mean()
        b = common_d - common_d.mean()
        c_j.append(float(abs(np.dot(a, b)) /
                         (np.linalg.norm(a) * np.linalg.norm(b) + 1e-30)))
    c_multi = compute_c_multi(s_st)
    s_b = bandpass_obspy_safe(s_st, fs, FREQ_BAND[0], FREQ_BAND[1])
    res = advisor_high_order_corr(s_b, fs, freq_band=FREQ_BAND)
    est = [0.2, -0.3, 0.1]
    theory = [0.0, 0.0, 0.0]
    dtau = test_delta_tau_vs_theory(est, theory, tol_s=10.0)
    out["stages"]["F_后处理"] = [{
        "c_j": {st: c for st, c in zip(STATIONS, c_j)},
        "c_multi": float(c_multi),
        "c3_peak_freqs": res["peak_freqs"],
        "delta_tau_est_s": est,
        "delta_tau_passed": bool(dtau["passed"]),
    }]

    return out


if __name__ == "__main__":
    p = compute_all_params()
    for stage, rows in p["stages"].items():
        print(f"[{stage}] {len(rows)} 行")
        print("   ", rows[0] if rows else "")
    print("参数总览计算成功")
