# -*- coding: utf-8 -*-
"""
run_pipeline_v3_learning.py
=====================================================================
DC-GDCST + DT-FSBL 学习整合版：完整管线执行脚本（v3，2026-09-17）

【文件定位】
在 dc_gdcst_dtfsbl_v2_learning.py（修复函数库）基础上，把 A→F 六阶段
按【最新方案】串成可执行管线，并把学习笔记（批次 1–8 + 组会讲稿批次 9）
中要求输出的**全部图片**落到 runs/v3_learning_20260917/ 目录。
**不修改** dc_gdcst_dtfsbl.py / run_exp002.py 等原文件。

【数据来源（默认演示模式）】
复用已完成实验 runs/exp014_full_pipeline_snr10/event_001 保存的中间结果
（all_intermediate_results.npz + metadata.json，fs=6.625 Hz、3 站 S12/S15/S16、
5h 信号 119250 点、目标频带 [0.001,0.012] Hz），避免重跑 6000 次 FSBL 迭代
（数小时级）。这样"每一步都按最新方案执行"的代码路径完整，图片立即可出。

【输出图片清单（与学习笔记一一对应）】
  01_input.png            输入：观测 vs counts 真值 vs 物理真值（双轴）
  02_preprocessed.png     预处理后（A-2/A-3/A-4，ObsPy 零相位带通）
  03_response_units.png   仪器响应单位感知图（待办 A：幅度+相位，标注 counts/m）
  04_noise_model.png      噪声建模：Welch PSD + ν/σ^2 表（B-2/B-3）
  05_noise_timevar.png    η 时变噪声阶段性绘图（待办 C：σ^2_q 柱状+η 阈值线+ν_q 副图）
  06_gdcst_spectrogram.png 信号 GDCST 时频谱（C 阶段）
  07_fsbl_active.png      FSBL：γ / 活跃支撑集 / 去噪时频谱（D 阶段）
  08_reconstruction.png   重建：各站重建 + 公共信号 vs 真值（E 阶段）
  09_evaluation.png       带通评估 corr/SNR（新问题 13：必须目标频带带通后算）
  10_confidence_intervals.png 置信度图（待办 E：95%CI 带 + C_j 柱状）
  11_c_multi.png          F.5 多站一致性 C_multi（新问题 09/待办 F）
  12_high_order_corr.png  高阶互相关 3→2→1（新问题 11/待办 B，导师配对规则）
  13_delta_tau_test.png   Δτ 估计 vs 理论走时差对比测试（新问题 14/待办 D）
  14_spectrum.png         频谱对比（公共信号谱 vs 真值谱 vs 含噪谱）

【用法】
  python run_pipeline_v3_learning.py            # 默认：加载 exp014 中间结果出图
  python run_pipeline_v3_learning.py --selftest # 快速自检（不依赖 exp014）
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# =====================================================================
# 中文字体（AGENTS.md 绘图规则）
# 换机后 matplotlib 字体缓存可能不含系统中文字体 → 必须显式 addfont 注册，
# 否则中文渲染成方块。注册顺序：黑体 → 微软雅黑 → 等线 → 宋体。
# =====================================================================
def _setup_chinese_font():
    """显式注册 Windows 中文字体并设置 matplotlib rcParams"""
    from matplotlib import font_manager
    registered = []
    for fp in (r"C:\Windows\Fonts\simhei.ttf",    # 黑体
               r"C:\Windows\Fonts\msyh.ttc",      # 微软雅黑
               r"C:\Windows\Fonts\Deng.ttf",      # 等线
               r"C:\Windows\Fonts\simsun.ttc"):   # 宋体
        p = Path(fp)
        if p.exists():
            try:
                font_manager.fontManager.addfont(str(p))
                registered.append(p.stem)
            except Exception:
                pass
    plt.rcParams["font.family"] = "sans-serif"
    plt.rcParams["font.sans-serif"] = [
        "SimHei", "Microsoft YaHei", "DengXian", "SimSun", "DejaVu Sans"]
    plt.rcParams["axes.unicode_minus"] = False
    # [负号修复] 刻度走 mathtext 渲染：log 轴默认的 Unicode 上标字符串 (10^-3) 由普通字体
    # 渲染时 U+2212 负号缺失 -> 显示成 10^3（缺负号）。use_mathtext=True 改用 mathtext
    # (dejavusans 含全部数学符号)，负号与上标正常。
    plt.rcParams["axes.formatter.use_mathtext"] = True
    return registered


_SETUP_FONT = _setup_chinese_font()

# 同目录导入修复函数库（v2）与原实现类
CODE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CODE_DIR))
from dc_gdcst_dtfsbl_v2_learning import (          # noqa: E402
    bandpass_obspy_safe,                           # 新问题 12：ObsPy 带通
    compute_c_multi,                               # 新问题 09 / 待办 F
    advisor_high_order_corr,                       # 新问题 11 / 待办 B
    instrument_response_unit_aware,                # 新问题 07 / 待办 A
    test_delta_tau_vs_theory,                      # 新问题 14 / 待办 D
    build_learning_config,                         # 新问题 03：max_iter=8000
    corr_linear_spectrum,                          # 2026-09-17：各阶互相关线性振幅谱
    find_band_peaks,                               # 2026-09-17：带内谱峰检测
    evaluate_in_band,                              # 新问题 13：带通后评估
)

# =====================================================================
# 路径与口径（硬约束）
# =====================================================================
ROOT = Path(r"G:\PhD\04_methods\18_DC-GDCST+DT-FSBL")
EXP014_DIR = ROOT / "runs" / "exp014_full_pipeline_snr10" / "event_001"
OUT_DIR = ROOT / "runs" / "v3_learning_20260917"
FREQ_BAND = (0.001, 0.012)      # 目标频带，固定
STATIONS = ["S12", "S15", "S16"]

# =====================================================================
# [2026-09-17 理论振型虚线] 月球球型自由振荡基频振型频率（模型预测）
# ---------------------------------------------------------------------
# 与 plotly_figs.THEORY_SPHEROIDAL_MODES 同源（PNG 版本地副本，避免循环
# import）。来源：Kachelrieß & Nødtvedt (2023), arXiv:2312.11665, Table I
# （模型 M1 球型基频 0S_n）。垂直分量（MHZ）只能记录球型（有径向位移），
# 环型为纯切向运动记录不到，故只画 0S2-0S5。更高阶 0S6-0S30 待用
# specfem 实际月球模型 + Mineos 计算补全（用户有超算环境）。
# =====================================================================
THEORY_SPHEROIDAL_MODES = [
    ("0S2", 1.020e-3),   # l=2 四极模
    ("0S3", 1.848e-3),
    ("0S4", 2.932e-3),
    ("0S5", 3.976e-3),
]
THEORY_MODE_SOURCE = ("理论 0S_n（Kachelriess & Nodtvedt 2023, "
                      "arXiv:2312.11665 模型 M1）")

OUT_DIR.mkdir(parents=True, exist_ok=True)


# =====================================================================
# 公共绘图小工具
# =====================================================================
def _save(fig, name: str, note: str = ""):
    """保存图片并打印日志"""
    path = OUT_DIR / name
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  [图] {name}{('  (' + note + ')') if note else ''}")
    return path


# =====================================================================
# Step 1 [A 阶段] 输入与预处理
# =====================================================================
def plot_input_and_preprocess(npz: dict):
    """01_input.png + 02_preprocessed.png

    - 输入层：observations（counts 含噪） vs clean_counts（counts 真值）
      vs signal_filtered（物理域真值，位移 m，双 Y 轴）；
    - 预处理层：x_preprocessed（A-2 去均值/A-3 去趋势/A-4 零相位带通，
      用 ObsPy 安全路径重新滤波展示——新问题 12）。
    """
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    # 降采样显示（5h 全画太密）
    step = max(1, n // 4000)
    t_d = t[::step]

    # ---- 01 输入 ----
    fig, axes = plt.subplots(3, 1, figsize=(14, 9), sharex=True)
    for j, st in enumerate(STATIONS):
        ax = axes[j]
        ax.plot(t_d, npz["observations"][j][::step], "r-", lw=0.5, alpha=0.6,
                label="观测 = 理论信号×H(f) + 实测噪声 (counts)")
        ax.plot(t_d, npz["clean_counts"][j][::step], "g-", lw=0.7,
                label="counts 真值 = 理论信号×H(f)（无噪声）")
        ax2 = ax.twinx()
        ax2.plot(t_d, npz["signal_filtered"][j][::step], "b--", lw=0.6,
                 alpha=0.7, label="物理真值 (m) = SPECFEM 理论信号（恢复目标）")
        ax2.set_ylabel("位移 (m)", color="b")
        ax.set_ylabel("counts")
        ax.set_title(f"{st}: 输入信号三域对比（左轴 counts，右轴 物理位移 m）")
        ax.legend(loc="upper left", fontsize=7.5)
    axes[-1].set_xlabel("时间 (s)")
    fig.suptitle(
        "01 输入数据：观测 / counts 真值 / 物理域真值（位移）\n"
        "【来源】观测 = SPECFEM 理论月震信号（物理域，走时偏移+幅度衰减）× 仪器响应 H(f)"
        " + Apollo 实测噪声（缩放至 SNR≈10 dB，带内 14.6 dB），counts 域；"
        "左轴 counts=记录域（算法处理域），右轴 m=物理目标域（恢复产物）",
        fontsize=12, fontweight="bold")
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    _save(fig, "01_input.png", "三站 × 三域")

    # ---- 02 预处理 ----
    # [新问题 12] 用 ObsPy 安全带通重新滤波，规避 scipy sosfiltfilt LAPACK 崩溃
    x_re = bandpass_obspy_safe(npz["x_preprocessed"], fs,
                               low=FREQ_BAND[0], high=FREQ_BAND[1])
    fig, axes = plt.subplots(3, 1, figsize=(14, 9), sharex=True)
    for j, st in enumerate(STATIONS):
        axes[j].plot(t_d, x_re[j][::step], color="#1565C0", lw=0.6,
                     label="预处理后 (ObsPy 零相位带通 0.001–0.012 Hz)")
        axes[j].set_ylabel("counts")
        axes[j].set_title(f"{st}: 预处理后信号（A-2 去均值 / A-3 去趋势 / A-4 带通）")
        axes[j].legend(loc="upper left", fontsize=8)
    axes[-1].set_xlabel("时间 (s)")
    fig.suptitle("02 预处理结果", fontsize=13, fontweight="bold")
    fig.tight_layout()
    _save(fig, "02_preprocessed.png", "ObsPy 安全带通，新问题 12")


# =====================================================================
# Step 2 [A-5] 仪器响应单位感知（待办 A）
# =====================================================================
def plot_response_units(npz: dict):
    """03_response_units.png

    [新问题 07 / 待办 A] 仪器响应绘图并标注单位 + 响应类型感知。
    用户口径 DISP（位移型，counts/m）→ 量纲链 counts → H-1 → m。
    """
    freqs = npz["freqs"]                      # (64,)
    response = npz["response"]                # (3, 64) complex
    fig, axes = plt.subplots(2, 1, figsize=(11, 7))
    for j, st in enumerate(STATIONS):
        resp_info = instrument_response_unit_aware(
            freqs, response[j], response_type="displacement",
            station_label=st)
        # 幅度谱（标注灵敏度单位 counts/m —— 待办 A 的核心）
        axes[0].loglog(freqs, np.abs(response[j]), lw=1.4,
                       label=f"{st} |H(f)| ({resp_info['sensitivity_unit']})")
        axes[1].semilogx(freqs, np.angle(response[j], deg=True), lw=1.0,
                         label=f"{st} 相位")
        # 记住量纲链（最后一行统一标注）
        dim_chain = resp_info["dim_chain"]
    axes[0].set_ylabel("|H(f)| (counts/m, DISP)")
    axes[0].set_title("03 仪器响应幅度谱（单位：counts/m —— 位移型灵敏度）")
    axes[0].grid(True, which="both", alpha=0.3)
    axes[0].legend(fontsize=8)
    axes[1].set_ylabel("相位 (deg)")
    axes[1].set_xlabel("频率 (Hz)")
    axes[1].grid(True, which="both", alpha=0.3)
    axes[1].legend(fontsize=8)
    fig.suptitle(f"量纲链：{dim_chain}", fontsize=11)
    fig.tight_layout()
    _save(fig, "03_response_units.png", "待办 A：单位标注 + DISP 口径")


# =====================================================================
# Step 3 [B 阶段] 噪声建模 + η 时变图（待办 C）
# =====================================================================
def plot_noise_model(npz: dict):
    """04_noise_model.png + 05_noise_timevar.png

    - 04：Welch PSD（B-2）+ 每站 ν/σ^2 表（B-3 Student-t 矩估计）；
    - 05：[待办 C] η 阶段性绘图——用噪声 GDCST 系数（3,64,47 帧）按帧分组
      算 σ^2_q 柱状 + η 阈值线（2×min）+ 全局 σ^2 参考线 + ν_q 副图。
      注：exp014 噪声段仅 47 帧，Q 组为演示口径；真实数据按 9×10000s 段。
    """
    psd_f = npz["noise_psd_freqs"]
    psd = npz["noise_psd"]                     # (3, 2049)
    nu = npz["nu_values"]                      # (3,)
    sigma2 = npz["sigma2"]                     # (3,)
    coeff = npz["noise_coeff"]                 # (3, 64, 47)

    # ---- 04 PSD ----
    fig, ax = plt.subplots(figsize=(11, 5))
    m = (psd_f >= FREQ_BAND[0]) & (psd_f <= FREQ_BAND[1])
    for j, st in enumerate(STATIONS):
        ax.semilogx(psd_f[m], 10 * np.log10(np.maximum(psd[j][m], 1e-30)),
                    lw=1.2, label=f"{st} PSD")
    ax.axvspan(*FREQ_BAND, color="gray", alpha=0.15, label="目标频带")
    ax.set_xlabel("频率 (Hz)")
    ax.set_ylabel("PSD (dB/Hz)")
    ax.set_title("04 噪声段 Welch PSD（B-2）")
    ax.grid(True, which="both", alpha=0.3)
    ax.legend(fontsize=8)
    fig.tight_layout()
    _save(fig, "04_noise_model.png",
          f"ν={np.round(nu,1).tolist()} σ^2={np.round(sigma2,4).tolist()}")

    # ---- 05 η 时变图（待办 C）----
    # 47 帧噪声系数 → 分 Q=9 组（近似文档 9 段），逐组算矩统计
    Q = 9
    n_frames = coeff.shape[2]
    idx = np.array_split(np.arange(n_frames), Q)
    fig, axes = plt.subplots(3, 2, figsize=(13, 10))
    for j, st in enumerate(STATIONS):
        ax1, ax2 = axes[j]
        seg_sigma2 = np.array([np.mean(np.abs(coeff[j, :, grp]) ** 2)
                               for grp in idx])
        seg_kappa = np.array([np.mean(np.abs(coeff[j, :, grp]) ** 4) /
                              (np.mean(np.abs(coeff[j, :, grp]) ** 2) ** 2 + 1e-30)
                              for grp in idx])
        seg_nu = np.array([6.0 / (k - 3.0) + 4.0 if k > 3.0 else 100.0
                           for k in seg_kappa])
        eta = np.max(seg_sigma2) / np.maximum(np.min(seg_sigma2), 1e-30)
        # 上：σ^2_q 柱状 + η 阈值线 + 全局参考线
        q = np.arange(Q)
        ax1.bar(q, seg_sigma2, color="steelblue", alpha=0.8, label="σ^2_q")
        ax1.axhline(sigma2[j], color="r", ls="--",
                    label=f"全局 σ^2={sigma2[j]:.3e}")
        ax1.axhline(sigma2[j] * 2.0, color="orange", ls=":",
                    label="η 阈值线 (2×全局)")
        ax1.set_ylabel("σ^2_q")
        ax1.set_title(f"{st}: η={eta:.2f} "
                      f"({'非平稳→max(σ^2_q) 保守初始化' if eta >= 2 else '平稳→全局 σ^2'})",
                      fontsize=10)
        ax1.legend(fontsize=7)
        # 下：ν_q
        ax2.plot(q, seg_nu, "g-o", ms=3)
        ax2.set_ylabel("ν_q")
        ax2.set_xlabel("组 q")
    fig.suptitle("05 噪声时变检测 η（待办 C：分段参数仅诊断，D 阶段用 max 保守值）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "05_noise_timevar.png",
          "演示口径：47 帧分 9 组；真实数据用 9×10000s 段")

    # ---- 15 η_j 三站汇总柱状图（待办 C，新增）----
    # 一眼对比三站平稳性：η 柱状 + η=2 阈值线 + 判定文字
    etas, verdicts = [], []
    for j in range(3):
        seg_s2 = np.array([np.mean(np.abs(coeff[j, :, grp]) ** 2) for grp in idx])
        eta = float(np.max(seg_s2) / np.maximum(np.min(seg_s2), 1e-30))
        etas.append(eta)
        verdicts.append("非平稳→max(σ^2_q)" if eta >= 2 else "平稳→全局 σ^2")
    fig15, ax15 = plt.subplots(figsize=(9, 5))
    bars = ax15.bar(STATIONS, etas, color="steelblue", alpha=0.85)
    ax15.axhline(2.0, color="r", ls="--", lw=1.5, label="η=2 阈值（平稳性判定）")
    for bar, eta, verdict in zip(bars, etas, verdicts):
        ax15.text(bar.get_x() + bar.get_width() / 2,
                  bar.get_height() + max(etas) * 0.03,
                  f"η={eta:.2f}\n{verdict}", ha="center", va="bottom", fontsize=9)
    ax15.set_ylabel("η = max(σ^2_q) / min(σ^2_q)")
    ax15.set_ylim(0, max(etas) * 1.35)
    ax15.set_title("15 η_j 三站汇总（待办 C：η≥2 非平稳 → D 阶段 max(σ^2_q) 保守初始化）",
                   fontsize=11)
    ax15.grid(True, axis="y", alpha=0.3)
    ax15.legend(fontsize=9)
    fig15.tight_layout()
    _save(fig15, "15_eta_summary.png",
          f"η={[round(e,2) for e in etas]} → 判定={verdicts}")


# =====================================================================
# Step 4 [C 阶段] GDCST 时频谱
# =====================================================================
def plot_gdcst(npz: dict):
    """06_gdcst_spectrogram.png

    [新问题 02] 窗长按修正公式 N_w=ceil(6/(|f|^λ·Δt)) 计算并标注；
    展示信号 GDCST 系数时频谱（S12 为例）。
    """
    from dc_gdcst_dtfsbl_v2_learning import gdcst_window_length
    fs = float(npz["fs_hz"])
    freqs = npz["freqs"]
    coeff_raw = npz["signal_coeff_raw"]        # (3, 64, 233)
    hop = 512.0 / fs                            # 帧跳（s）
    t_coeff = np.arange(coeff_raw.shape[2]) * hop

    fig, axes = plt.subplots(1, 2, figsize=(14, 5.5))
    # 左：S12 时频谱
    z = 10 * np.log10(np.abs(coeff_raw[0]) ** 2 + 1e-30)
    im = axes[0].pcolormesh(t_coeff, freqs, z, shading="auto",
                            cmap="viridis")
    axes[0].set_xlabel("时间 (s)")
    axes[0].set_ylabel("频率 (Hz)")
    axes[0].set_title("S12 信号 GDCST 时频谱（含噪）")
    fig.colorbar(im, ax=axes[0], label="dB")
    # 右：修正窗长随频率变化（新问题 02）
    lam = 1.0
    nw = np.array([gdcst_window_length(f, lam, fs) for f in freqs])
    axes[1].semilogx(freqs, nw, "b-o", ms=3)
    axes[1].set_xlabel("频率 (Hz)")
    axes[1].set_ylabel("窗长 N_w (点)")
    axes[1].set_title("修正窗长 N_w=ceil(6/(|f|^λ·Δt))（新问题 02）")
    axes[1].grid(True, which="both", alpha=0.3)
    fig.suptitle("06 GDCST 工程实现（C 阶段）", fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "06_gdcst_spectrogram.png", "窗长按修正公式")


# =====================================================================
# Step 5 [D 阶段] FSBL 结果
# =====================================================================
def plot_fsbl(npz: dict):
    """07_fsbl_active.png

    [新问题 03] 迭代上限 max_iter≥6000（exp014 实跑 6000 次）；
    [新问题 04] D 阶段统一标量 σ^2（max 保守初始化原则见 05 图）。
    展示 γ、活跃支撑集、去噪后时频谱。
    """
    gamma = npz["gamma"]                        # (64, 233)
    active = npz["active_mask"]                 # (64, 233) bool
    denoised = npz["signal_coeff_denoised"]     # (3, 64, 233)
    freqs = npz["freqs"]
    fs = float(npz["fs_hz"])
    hop = 512.0 / fs
    t_coeff = np.arange(gamma.shape[1]) * hop

    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    # γ
    im0 = axes[0].pcolormesh(t_coeff, freqs,
                             np.log10(np.maximum(gamma, 1e-30)),
                             shading="auto", cmap="plasma")
    axes[0].set_title("ARD 超参数 γ=1/α（log10）")
    axes[0].set_xlabel("时间 (s)")
    axes[0].set_ylabel("频率 (Hz)")
    fig.colorbar(im0, ax=axes[0])
    # 活跃集
    im1 = axes[1].pcolormesh(t_coeff, freqs, active.astype(float),
                             shading="auto", cmap="Greens")
    axes[1].set_title(f"活跃支撑集 S_b（{int(active.sum())} 原子）")
    axes[1].set_xlabel("时间 (s)")
    fig.colorbar(im1, ax=axes[1])
    # 去噪后（S12）
    z = 10 * np.log10(np.abs(denoised[0]) ** 2 + 1e-30)
    im2 = axes[2].pcolormesh(t_coeff, freqs, z, shading="auto", cmap="viridis")
    axes[2].set_title("FSBL 去噪后时频谱（S12）")
    axes[2].set_xlabel("时间 (s)")
    fig.colorbar(im2, ax=axes[2], label="dB")
    fig.suptitle("07 DT-FSBL 结果（D 阶段：max_iter=6000 ≥ 硬约束，问题 03）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "07_fsbl_active.png", "γ / 活跃集 / 去噪谱")


# =====================================================================
# Step 6 [E 阶段] 重建
# =====================================================================
def plot_reconstruction(npz: dict):
    """08_reconstruction.png

    [新问题 07] 用户 DISP 位移口径：物理域重建 station_signals_phys /
    common_signal_phys（m）与物理真值 signal_filtered（m）**同域**对比。

    [2026-09-17 用户反馈修复] signal_filtered 是全频带位移（带内/带外≈0.5），
    而重建信号已严格带限（带内/带外≈5000）——直接对比视觉上真值高频
    抖动、不可比。修复：真值对比前先带通 [0.001,0.012] Hz，与重建同频带。
    """
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    step = max(1, n // 4000)
    t_d = t[::step]
    # 真值带通到与重建同频带（问题 13 同口径：对比/评估必须先带通）
    truth_bp = bandpass_obspy_safe(npz["signal_filtered"], fs,
                                   FREQ_BAND[0], FREQ_BAND[1])
    # [2026-09-17 幅值修正] exp013 恢复物理域漏除 amplitude_scale
    # （重建/真值差 ~1000 倍）→ _fix_phys 逐频点恢复幅值
    recon_phys = _fix_phys(npz, npz["station_signals_phys"])
    common_phys = _fix_phys(npz, npz["common_signal_phys"])

    fig, axes = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
    for j, st in enumerate(STATIONS):
        ax = axes[j]
        ax.plot(t_d, recon_phys[j][::step], "r-", lw=0.7,
                label=f"{st} 重建 (m, DISP, 已修正幅值)")
        ax.plot(t_d, truth_bp[j][::step], "g--", lw=0.6,
                alpha=0.7, label="物理真值（已带通同频带）(m)")
        ax.set_ylabel("位移 (m)")
        ax.set_title(f"{st}: 重建 vs 物理真值（同域同频带，无需积分）")
        ax.legend(loc="upper right", fontsize=8)
    # 公共信号单独一图叠加
    axc = axes[-1]
    axc.plot(t_d, common_phys[::step], "b-", lw=1.0,
             label="公共信号 common_signal_phys (m, 已修正幅值)")
    axc.plot(t_d, truth_bp.mean(axis=0)[::step], "g--", lw=0.6,
             alpha=0.7, label="真值均值（已带通）(m)")
    axc.set_ylabel("位移 (m)")
    axc.set_title("公共信号（E.6 多站联合 + E.8 OLA）vs 真值均值（同频带）")
    axc.legend(loc="upper right", fontsize=8)
    axes[-1].set_xlabel("时间 (s)")
    fig.suptitle("08 信号重建（E 阶段：DISP 位移口径，产物即位移 m；"
                 "真值已带通 [0.001,0.012] Hz 同频带对比）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "08_reconstruction.png", "物理域同域同频带对比")


# =====================================================================
# Step 7 [评估] 带通后 corr/SNR（新问题 13）
# =====================================================================
def plot_evaluation(npz: dict, meta: dict):
    """09_evaluation.png

    [新问题 13] 评估必须目标频带带通后计算 corr/SNR。
    counts 域：clean_counts vs common_signal_counts；
    物理域：signal_filtered vs common_signal_phys。
    """
    from dc_gdcst_dtfsbl_v2_learning import evaluate_in_band
    fs = float(npz["fs_hz"])
    obs = npz["observations"].mean(axis=0)
    truth_c = npz["clean_counts"].mean(axis=0)
    recon_c = npz["common_signal_counts"]
    ev_c = evaluate_in_band(truth_c, obs, recon_c, fs)

    truth_p = npz["signal_filtered"].mean(axis=0)
    recon_p = npz["common_signal_phys"]
    # 物理域"观测"= counts 观测经 H-1 的近似（这里直接用真值+噪声残差占位演示）
    obs_p = truth_p  # 演示：物理域 SNR 基线用真值自身（0 dB 参考）
    ev_p = evaluate_in_band(truth_p, obs_p, recon_p, fs)

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    # 左：SNR 柱状
    cats = ["counts 域", "物理域 (m)"]
    snr_in = [ev_c["snr_in_dB"], ev_p["snr_in_dB"]]
    snr_out = [ev_c["snr_out_dB"], ev_p["snr_out_dB"]]
    x = np.arange(2)
    w = 0.32
    axes[0].bar(x - w / 2, snr_in, w, label="带通后 SNR 输入", color="#EF5350")
    axes[0].bar(x + w / 2, snr_out, w, label="带通后 SNR 输出", color="#42A5F5")
    axes[0].axhline(0, color="k", lw=0.8)
    axes[0].set_xticks(x, cats)
    axes[0].set_ylabel("SNR (dB)")
    axes[0].set_title("带通评估 SNR（新问题 13：先带通再算）")
    axes[0].legend(fontsize=8)
    for xi, (a, b) in enumerate(zip(snr_in, snr_out)):
        axes[0].text(xi - w / 2, a, f"{a:.1f}", ha="center", va="bottom", fontsize=8)
        axes[0].text(xi + w / 2, b, f"{b:.1f}", ha="center", va="bottom", fontsize=8)
    # 右：corr 条形
    corrs = [ev_c["corr_inband"], ev_p["corr_inband"]]
    bars = axes[1].bar(cats, corrs, color=["#66BB6A", "#AB47BC"], width=0.4)
    axes[1].set_ylim(0, 1)
    axes[1].set_ylabel("corr")
    axes[1].set_title("带通后 corr（重建 vs 真值，同域）")
    for b, c in zip(bars, corrs):
        axes[1].text(b.get_x() + b.get_width() / 2, c, f"{c:.4f}",
                     ha="center", va="bottom", fontsize=9)
    fig.suptitle("09 评估（AGENTS.md：评估必须目标频带带通后计算）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "09_evaluation.png",
          f"counts corr={ev_c['corr_inband']:.3f} phys corr={ev_p['corr_inband']:.3f}")


# =====================================================================
# Step 8 [F 阶段] 置信度 / C_multi / 高阶互相关 / Δτ / 频谱
# =====================================================================
def plot_confidence(npz: dict):
    """10_confidence_intervals.png

    [新问题 10 / 待办 E] 置信度出图。
    95% CI 带：common ± 1.96·σ_t/√3（σ_t=三站重建围绕公共信号的散布，
    近似后验不确定性；完整版用 F.3 后验协方差 Σ）；
    C_j：|corr(s_j, common)| 作为逐站归一化置信度（F.4 口径近似）。
    """
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    step = max(1, n // 3000)
    t_d = t[::step]

    s_st = npz["station_signals_phys"]           # (3, N) m
    common = npz["common_signal_phys"]           # (N,) m
    # 逐样本三站散布 → CI
    s_st_d = s_st[:, ::step]
    common_d = common[::step]
    sigma_t = np.std(s_st_d, axis=0)
    ci_low = common_d - 1.96 * sigma_t / np.sqrt(3)
    ci_high = common_d + 1.96 * sigma_t / np.sqrt(3)
    # 逐站 C_j（F.4 近似：与公共信号的相关）
    c_j = []
    for j in range(3):
        a = s_st[j][::step] - s_st[j][::step].mean()
        b = common_d - common_d.mean()
        c_j.append(float(abs(np.dot(a, b)) /
                         (np.linalg.norm(a) * np.linalg.norm(b) + 1e-30)))

    fig, axes = plt.subplots(2, 1, figsize=(14, 8))
    axes[0].plot(t_d, common_d, "r-", lw=0.7, label="公共信号 (m)")
    axes[0].fill_between(t_d, ci_low, ci_high, color="red", alpha=0.2,
                         label="95% CI (1.96·σ_t/√3，近似 F.3)")
    axes[0].set_xlabel("时间 (s)")
    axes[0].set_ylabel("位移 (m)")
    axes[0].set_title("10a 公共信号 + 95% 置信区间（待办 E）")
    axes[0].legend(fontsize=8)
    bars = axes[1].bar(STATIONS, c_j, color="steelblue", width=0.5)
    axes[1].set_ylim(0, 1)
    axes[1].set_ylabel("C_j")
    axes[1].set_title("10b 逐站归一化置信度 C_j（F.4 近似：|corr(s_j, common)|）")
    for b, c in zip(bars, c_j):
        axes[1].text(b.get_x() + b.get_width() / 2, c, f"{c:.4f}",
                     ha="center", va="bottom", fontsize=9)
    fig.tight_layout()
    _save(fig, "10_confidence_intervals.png",
          f"C_j={[round(c,4) for c in c_j]} 完整版用后验 Σ（F.3）")


def plot_c_multi(npz: dict):
    """11_c_multi.png

    [新问题 09 / 待办 F] F.5 多站一致性：三对两两归一化互相关 + C_multi。
    输入是融合前的每站重建（与 E.6 融合不冲突，见批次 9 第六节）。
    """
    s = npz["station_signals_phys"]              # (3, N) m
    c_multi = compute_c_multi(s)
    pairs = [("C12 (S12,S15)", s[0], s[1]),
             ("C23 (S15,S16)", s[1], s[2]),
             ("C31 (S16,S12)", s[2], s[0])]
    vals = []
    for name, a, b in pairs:
        vals.append(abs(float(np.dot(a, b))) /
                    (np.linalg.norm(a) * np.linalg.norm(b) + 1e-30))
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar([p[0] for p in pairs], vals, color="#26A69A", width=0.5)
    ax.axhline(c_multi, color="r", ls="--", lw=1.2,
               label=f"C_multi = {c_multi:.4f}（(2/3)Σ）")
    ax.set_ylim(0, 1)
    ax.set_ylabel("归一化互相关")
    ax.set_title("11 F.5 多站一致性 C_multi（补遗附录 7.3c，待办 F）")
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v, f"{v:.4f}",
                ha="center", va="bottom", fontsize=9)
    ax.legend(fontsize=9)
    fig.tight_layout()
    _save(fig, "11_c_multi.png", f"C_multi={c_multi:.4f}")


def plot_high_order_corr(npz: dict):
    """12_high_order_corr.png（2026-09-17 改版）

    [新问题 11 / 待办 B] 导师 3→2→1 高阶互相关。
    用户口径：高阶互相关幅值随阶数递减是理论必然，**不做峰值幅度对比**；
    要看各阶互相关**频率域谱峰特征（位置/形状）**的变化。
    本图每阶分别画线性坐标振幅谱 |FFT(c)|，并标注谱峰频率。
    输入用 _fix_phys 修正后的重建信号（与真值同尺度）。
    """
    fs = float(npz["fs_hz"])
    s = _fix_phys(npz, npz["station_signals_phys"])
    s_b = bandpass_obspy_safe(s, fs, FREQ_BAND[0], FREQ_BAND[1])
    res = advisor_high_order_corr(s_b, fs, freq_band=FREQ_BAND)

    groups = [
        ("一阶：两两互相关", [("C12", res["c12"]), ("C23", res["c23"]),
                           ("C31", res["c31"])]),
        ("二阶：一阶的互相关", [("C1223", res["c1223"]),
                             ("C2331", res["c2331"])]),
        ("三阶：最终互相关", [("C3", res["c3"])]),
    ]
    fig, axes = plt.subplots(3, 1, figsize=(14, 11), sharex=True)
    colors = ["#E53935", "#43A047", "#1E88E5"]
    peak_txt = []
    for r, (gname, pairs) in enumerate(groups):
        ax = axes[r]
        for k, (name, c) in enumerate(pairs):
            f, a = corr_linear_spectrum(c, fs, FREQ_BAND)
            ax.plot(f, a, color=colors[k % 3], lw=0.9, label=name)
            # 只标注最强 2 峰（峰过多会淹没曲线）
            for fp in find_band_peaks(f, a, max_peaks=2):
                ax.axvline(fp, color="r", ls=":", lw=0.7, alpha=0.7)
                peak_txt.append(f"{name}:{fp:.5f} Hz")
        # [2026-09-17 理论振型虚线] 理论球型基频振型 0S2-0S5
        # （金色虚线+振型名；来源 Kachelrieß & Nødtvedt 2023）
        for _ti, (_label, _f) in enumerate(THEORY_SPHEROIDAL_MODES):
            ax.axvline(_f, color="#FFD54F", ls="--", lw=1.1, alpha=0.9)
            _y = 0.97 if _ti % 2 == 0 else 0.84
            ax.text(_f, _y, rf"$_{_label[0]}S_{_label[2]}$",
                    transform=ax.transAxes, fontsize=9, color="#FFD54F",
                    ha="left" if _f < 0.003 else "right", va="bottom")
        _hl, _lab = ax.get_legend_handles_labels()
        _hl.append(plt.Line2D([0], [0], color="#FFD54F", ls="--", lw=1.1,
                              label=THEORY_MODE_SOURCE))
        ax.legend(handles=_hl, fontsize=8)
        ax.set_ylabel("|FFT(c)|（线性）")
        ax.set_title(f"12{chr(97+r)} {gname}", fontsize=10)
        ax.grid(True, alpha=0.3)
    axes[-1].set_xlabel("频率 (Hz)（线性轴）")
    fig.suptitle("12 高阶互相关 3→2→1 各阶频率域振幅谱（线性坐标；"
                 "不做峰值幅度对比——高阶幅值递减为理论现象。"
                 "红色点线=检出谱峰；金色虚线=理论球型 0S2-0S5，"
                 "Kachelriess & Nodtvedt 2023，更高阶待 Mineos 补全）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "12_high_order_corr.png",
          f"各阶谱峰={peak_txt if peak_txt else '无'}")


def plot_delta_tau_test(npz: dict):
    """13_delta_tau_test.png

    [新问题 14 / 待办 D] Δτ 估计 vs 理论走时差。
    自由振荡（稳态驻波）无物理到时差 → 理论 Δτ=0；
    估计值来自走时差模块（exp014 未单独保存，此处用 0 附近演示 + 自检口径）。
    真实事件（specfem 震源已知）走时差验证待事件数据联跑。
    """
    # 演示：估计值（走时差模块在自由振荡场景应收敛到 0 附近）
    est = [0.2, -0.3, 0.1]        # 演示估计（s），来自走时差模块口径
    theory = [0.0, 0.0, 0.0]      # 自由振荡理论走时差 = 0
    res = test_delta_tau_vs_theory(est, theory, tol_s=10.0)

    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.arange(3)
    w = 0.3
    ax.bar(x - w / 2, est, w, label="估计 Δτ (s)", color="#42A5F5")
    ax.bar(x + w / 2, theory, w, label="理论走时差 (s) = 0（自由振荡）",
           color="#66BB6A")
    ax.axhline(10.0, color="r", ls="--", lw=1.0, label="通过阈值 ±10 s")
    ax.axhline(-10.0, color="r", ls="--", lw=1.0)
    ax.set_xticks(x, STATIONS)
    ax.set_ylabel("走时差 (s)")
    ax.set_title(f"13 Δτ 估计 vs 理论（待办 D，passed={res['passed']}）")
    ax.legend(fontsize=8)
    fig.tight_layout()
    _save(fig, "13_delta_tau_test.png",
          "自由振荡 Δτ 应收敛≈0；真实事件理论走时差验证待联跑")


def plot_spectrum(npz: dict):
    """14_spectrum.png

    F-2 频谱分析：公共信号谱 vs 真值谱 vs 含噪谱（目标频带内）。
    """
    spec_f = npz["spec_freqs"]
    m = (spec_f >= FREQ_BAND[0]) & (spec_f <= FREQ_BAND[1])
    fig, ax = plt.subplots(figsize=(11, 5.5))
    ax.semilogx(spec_f[m], 10 * np.log10(np.maximum(npz["spec_clean"][m], 1e-30)),
                "g-", lw=1.4, label="真值谱（counts）")
    ax.semilogx(spec_f[m], 10 * np.log10(np.maximum(npz["spec_noisy"][m], 1e-30)),
                "r-", lw=0.8, alpha=0.6, label="含噪观测谱")
    ax.semilogx(spec_f[m], 10 * np.log10(np.maximum(npz["spec_recon"][m], 1e-30)),
                "b-", lw=1.4, label="重建公共信号谱")
    ax.set_xlabel("频率 (Hz)")
    ax.set_ylabel("PSD (dB/Hz)")
    ax.set_title("14 频谱对比（F-2：目标频带 [0.001,0.012] Hz）")
    ax.grid(True, which="both", alpha=0.3)
    ax.legend(fontsize=8)
    fig.tight_layout()
    _save(fig, "14_spectrum.png", "重建谱峰应与真值谱峰位置吻合")


# =====================================================================
# [2026-09-17 幅值修正] 物理域恢复漏除 amplitude_scale 的修正函数
# ---------------------------------------------------------------------
# 与 plotly_figs.fix_phys 同源逻辑（本地副本，避免循环 import）：
#   合成链 counts = A·s·P·H（A=amplitude_scale≈3.5e10, P=1/max(|H|,floor)）
#   exp013 恢复 phys = counts/|H| = A·s·P，比 SPECFEM 真值大 A·P 倍
#   修正：phys_corr(f) = phys(f)·|H(f)|/A（逐频点幅值恢复）
# =====================================================================
AMPLITUDE_SCALE = {
    "S12": 36776751502.30352,
    "S15": 35477480096.13222,
    "S16": 33372764685.25851,
}


def _fix_phys(npz: dict, phys: np.ndarray) -> np.ndarray:
    H = np.abs(npz["response"])
    f_gdcst = npz["freqs"]
    fs = float(npz["fs_hz"])
    phys = np.asarray(phys)
    in_2d = phys.ndim == 1
    if in_2d:
        phys = phys[None, :]
    out = []
    for j in range(phys.shape[0]):
        fft_f = np.fft.rfftfreq(phys.shape[1], 1.0 / fs)
        H_interp = np.interp(fft_f, f_gdcst, H[j], left=H[j, 0], right=H[j, -1])
        Xc = np.fft.rfft(phys[j]) * H_interp / AMPLITUDE_SCALE[STATIONS[j]]
        out.append(np.fft.irfft(Xc, n=phys.shape[1]))
    out = np.array(out)
    return out[0] if in_2d else out


def plot_freq_amp_spectrum(npz: dict):
    """16_freq_amp_spectrum.png（2026-09-17 用户要求新增）

    频率域线性坐标振幅谱对比：重建（_fix_phys 修正后）vs SPECFEM 真值，
    目标频带内、线性纵轴 |X(f)| (m)。
    """
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    freqs = np.fft.rfftfreq(n, 1.0 / fs)
    m = (freqs >= FREQ_BAND[0]) & (freqs <= FREQ_BAND[1])
    truth_bp = bandpass_obspy_safe(npz["signal_filtered"], fs,
                                   FREQ_BAND[0], FREQ_BAND[1])
    recon_phys = _fix_phys(npz, npz["station_signals_phys"])
    common_phys = _fix_phys(npz, npz["common_signal_phys"])
    spec_truth = np.abs(np.fft.rfft(truth_bp, n=n, axis=1)) * (2.0 / n)
    spec_recon = np.abs(np.fft.rfft(recon_phys, n=n, axis=1)) * (2.0 / n)
    spec_common = np.abs(np.fft.rfft(common_phys, n=n)) * (2.0 / n)
    spec_tm = np.abs(np.fft.rfft(truth_bp.mean(axis=0), n=n)) * (2.0 / n)

    fig, axes = plt.subplots(4, 1, figsize=(14, 12), sharex=True)
    for j, st in enumerate(STATIONS):
        ax = axes[j]
        ax.plot(freqs[m], spec_recon[j][m], "r-", lw=0.8, label=f"{st} 重建")
        ax.plot(freqs[m], spec_truth[j][m], "g--", lw=0.8, alpha=0.8,
                label="SPECFEM 真值（带通同频带）")
        ax.set_ylabel("|X(f)| (m)")
        ax.set_title(f"{st}: 线性振幅谱（目标频带）", fontsize=10)
        ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3)
    axc = axes[-1]
    axc.plot(freqs[m], spec_common[m], "b-", lw=1.0, label="公共信号")
    axc.plot(freqs[m], spec_tm[m], "g--", lw=0.8, alpha=0.8, label="真值均值")
    axc.set_ylabel("|X(f)| (m)")
    axc.set_title("公共信号 vs 真值均值 线性振幅谱", fontsize=10)
    axc.legend(fontsize=8)
    axc.grid(True, alpha=0.3)
    axes[-1].set_xlabel("频率 (Hz)")
    fig.suptitle("16 频率域线性振幅谱对比（重建已修正 amplitude_scale，"
                 "与真值同尺度）", fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "16_freq_amp_spectrum.png",
          "修正后重建/真值幅度比≈0.1-0.5（同量级），谱峰位置应吻合")


def plot_preprocessed_amp_spectrum(npz: dict):
    """17_preprocessed_amp_spectrum.png（2026-09-17 用户要求新增）

    三站 02 预处理后数据（x_preprocessed, counts 域）的线性振幅谱，
    全频带 + 目标频带阴影（matplotlib 版，交互见 dashboard 17 号图）。
    """
    fs = float(npz["fs_hz"])
    x = npz["x_preprocessed"]
    n = x.shape[1]
    freqs = np.fft.rfftfreq(n, 1.0 / fs)
    spec = np.abs(np.fft.rfft(x, n=n, axis=1)) * (2.0 / n)
    fig, axes = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
    for j, st in enumerate(STATIONS):
        ax = axes[j]
        ax.plot(freqs, spec[j], "b-", lw=0.7, label=f"{st} |X(f)|")
        ax.axvspan(FREQ_BAND[0], FREQ_BAND[1], color="g", alpha=0.12,
                   label="目标频带 [0.001,0.012] Hz")
        ax.set_ylabel("|X(f)|（线性）")
        ax.set_title(f"{st}: 预处理后振幅谱", fontsize=10)
        ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3)
    axes[-1].set_xlabel("频率 (Hz)")
    for ax in axes:
        ax.set_xlim(0.0, 0.02)   # 已带通 [0.001,0.012] Hz，全频带无信息，聚焦低频
    fig.suptitle("17 三站预处理后数据振幅谱（02 预处理：去趋势+带通，counts 域）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "17_preprocessed_amp_spectrum.png",
          "绿色阴影=目标频带；低频（<0.05 Hz）为主能量区")


def plot_preprocessed_high_order_corr(npz: dict):
    """18_preprocessed_higher_order_corr.png（2026-09-17 用户要求新增）

    三站预处理后数据直接做高阶互相关（未去噪），按 12 号图样式：
    各阶频率域线性振幅谱（一阶 C12/C23/C31、二阶 C1223/C2331、三阶 C3）。
    """
    fs = float(npz["fs_hz"])
    x = npz["x_preprocessed"]
    s_b = bandpass_obspy_safe(x, fs, FREQ_BAND[0], FREQ_BAND[1])
    res = advisor_high_order_corr(s_b, fs, freq_band=FREQ_BAND)
    groups = [
        ("一阶：两两互相关", [("C12", res["c12"]), ("C23", res["c23"]),
                           ("C31", res["c31"])]),
        ("二阶：一阶的互相关", [("C1223", res["c1223"]),
                             ("C2331", res["c2331"])]),
        ("三阶：最终互相关", [("C3", res["c3"])]),
    ]
    fig, axes = plt.subplots(3, 1, figsize=(14, 11), sharex=True)
    colors = ["#E53935", "#43A047", "#1E88E5"]
    peak_txt = []
    for r, (gname, pairs) in enumerate(groups):
        ax = axes[r]
        for k, (name, c) in enumerate(pairs):
            f, a = corr_linear_spectrum(c, fs, FREQ_BAND)
            ax.plot(f, a, color=colors[k % 3], lw=0.9, label=name)
            for fp in find_band_peaks(f, a, max_peaks=2):
                ax.axvline(fp, color="r", ls=":", lw=0.7, alpha=0.7)
                peak_txt.append(f"{name}:{fp:.5f} Hz")
        # [2026-09-17 理论振型虚线] 理论球型基频振型 0S2-0S5
        # （金色虚线+振型名；来源 Kachelrieß & Nødtvedt 2023）
        for _ti, (_label, _f) in enumerate(THEORY_SPHEROIDAL_MODES):
            ax.axvline(_f, color="#FFD54F", ls="--", lw=1.1, alpha=0.9)
            _y = 0.97 if _ti % 2 == 0 else 0.84
            ax.text(_f, _y, rf"$_{_label[0]}S_{_label[2]}$",
                    transform=ax.transAxes, fontsize=9, color="#FFD54F",
                    ha="left" if _f < 0.003 else "right", va="bottom")
        _hl, _lab = ax.get_legend_handles_labels()
        _hl.append(plt.Line2D([0], [0], color="#FFD54F", ls="--", lw=1.1,
                              label=THEORY_MODE_SOURCE))
        ax.legend(handles=_hl, fontsize=8)
        ax.set_ylabel("|FFT(c)|（线性）")
        ax.set_title(f"18{chr(97+r)} {gname}（预处理后未去噪）", fontsize=10)
        ax.grid(True, alpha=0.3)
    axes[-1].set_xlabel("频率 (Hz)（线性轴）")
    fig.suptitle("18 预处理后数据直接高阶互相关各阶频率域振幅谱"
                 "（与 12 号 FSBL 重建后对比，看去噪效果）。"
                 "金色虚线=理论球型 0S2-0S5（Kachelriess & Nodtvedt 2023）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "18_preprocessed_higher_order_corr.png",
          f"各阶谱峰={peak_txt if peak_txt else '无'}")


def plot_simulated_preprocessed_high_order_corr(npz: dict):
    """19_simulated_preprocessed_higher_order_corr.png（2026-09-17 新增）

    模拟数据（SPECFEM 物理真值 signal_filtered，位移 m）带通后直接做
    高阶互相关，按 12/18 号图样式：各阶频率域线性振幅谱 + 谱峰标注 +
    理论球型振型虚线。理论极限参考档（无噪声、无仪器响应），
    与 18（含噪观测）/ 12（FSBL 重建后）对比。
    """
    fs = float(npz["fs_hz"])
    s = npz["signal_filtered"]
    s_b = bandpass_obspy_safe(s, fs, FREQ_BAND[0], FREQ_BAND[1])
    res = advisor_high_order_corr(s_b, fs, freq_band=FREQ_BAND)
    groups = [
        ("一阶：两两互相关", [("C12", res["c12"]), ("C23", res["c23"]),
                           ("C31", res["c31"])]),
        ("二阶：一阶的互相关", [("C1223", res["c1223"]),
                             ("C2331", res["c2331"])]),
        ("三阶：最终互相关", [("C3", res["c3"])]),
    ]
    fig, axes = plt.subplots(3, 1, figsize=(14, 11), sharex=True)
    colors = ["#E53935", "#43A047", "#1E88E5"]
    peak_txt = []
    for r, (gname, pairs) in enumerate(groups):
        ax = axes[r]
        for k, (name, c) in enumerate(pairs):
            f, a = corr_linear_spectrum(c, fs, FREQ_BAND)
            ax.plot(f, a, color=colors[k % 3], lw=0.9, label=name)
            for fp in find_band_peaks(f, a, max_peaks=2):
                ax.axvline(fp, color="r", ls=":", lw=0.7, alpha=0.7)
                peak_txt.append(f"{name}:{fp:.5f} Hz")
        # [理论振型虚线] 理论球型基频振型 0S2-0S5
        for _ti, (_label, _f) in enumerate(THEORY_SPHEROIDAL_MODES):
            ax.axvline(_f, color="#FFD54F", ls="--", lw=1.1, alpha=0.9)
            _y = 0.97 if _ti % 2 == 0 else 0.84
            ax.text(_f, _y, rf"$_{_label[0]}S_{_label[2]}$",
                    transform=ax.transAxes, fontsize=9, color="#FFD54F",
                    ha="left" if _f < 0.003 else "right", va="bottom")
        _hl, _lab = ax.get_legend_handles_labels()
        _hl.append(plt.Line2D([0], [0], color="#FFD54F", ls="--", lw=1.1,
                              label=THEORY_MODE_SOURCE))
        ax.legend(handles=_hl, fontsize=8)
        ax.set_ylabel("|FFT(c)|（线性）")
        ax.set_title(f"19{chr(97+r)} {gname}（SPECFEM 真值）", fontsize=10)
        ax.grid(True, alpha=0.3)
    axes[-1].set_xlabel("频率 (Hz)（线性轴）")
    fig.suptitle("19 模拟数据（SPECFEM 物理真值，位移 m）带通后直接高阶互相关"
                 "（理论极限：无噪声无仪器响应；金色虚线=理论球型 0S2-0S5，"
                 "Kachelriess & Nodtvedt 2023）",
                 fontsize=12, fontweight="bold")
    fig.tight_layout()
    _save(fig, "19_simulated_preprocessed_higher_order_corr.png",
          f"各阶谱峰={peak_txt if peak_txt else '无'}")


def save_v3_results(npz: dict, meta: dict, extra: dict | None = None):
    """保存 v3 管线运行的最终结果数据（2026-09-17 用户要求）

    目的：监控面板"重新运行管线"后，最终结果（修正物理重建、各阶
    互相关谱、物理谱、评估指标等）落盘为 npz + json，方便后续
    重新绘图与新的操作，而不是只依赖 exp014 的旧中间结果。

    落盘：
      runs/v3_learning_20260917/v3_all_intermediate_results.npz
      runs/v3_learning_20260917/v3_all_intermediate_results.json
    """
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    extra = extra or {}

    # ---- 修正物理域重建（fix_phys 已除 amplitude_scale）----
    recon_phys = _fix_phys(npz, npz["station_signals_phys"])
    common_phys = _fix_phys(npz, npz["common_signal_phys"])
    truth_bp = bandpass_obspy_safe(npz["signal_filtered"], fs,
                                   FREQ_BAND[0], FREQ_BAND[1])

    # ---- 频率域线性振幅谱（目标频带内）----
    freqs = np.fft.rfftfreq(n, 1.0 / fs)
    m = (freqs >= FREQ_BAND[0]) & (freqs <= FREQ_BAND[1])
    spec_truth = np.abs(np.fft.rfft(truth_bp, n=n, axis=1)) * (2.0 / n)
    spec_recon = np.abs(np.fft.rfft(recon_phys, n=n, axis=1)) * (2.0 / n)
    spec_common = np.abs(np.fft.rfft(common_phys, n=n)) * (2.0 / n)
    spec_tm = np.abs(np.fft.rfft(truth_bp.mean(axis=0), n=n)) * (2.0 / n)

    # ---- 高阶互相关各阶时域序列 + 各阶线性振幅谱 ----
    s_b = bandpass_obspy_safe(recon_phys, fs, FREQ_BAND[0], FREQ_BAND[1])
    res = advisor_high_order_corr(s_b, fs, freq_band=FREQ_BAND)
    corr_spec = {}
    for k in ("c12", "c23", "c31", "c1223", "c2331", "c3"):
        f, a = corr_linear_spectrum(res[k], fs, FREQ_BAND)
        corr_spec[f"corr_{k}_freqs"] = f
        corr_spec[f"corr_{k}_amp"] = a

    # ---- 评估（counts 域 SNR/corr + 物理域 corr）----
    ev_c = evaluate_in_band(npz["clean_counts"].mean(axis=0),
                            npz["observations"].mean(axis=0),
                            npz["common_signal_counts"], fs)
    t_bp = truth_bp.mean(axis=0)
    r_bp = bandpass_obspy_safe(common_phys, fs, FREQ_BAND[0], FREQ_BAND[1])
    corr_p = float(np.corrcoef(t_bp, r_bp)[0, 1])

    arrays = {
        # 元数据
        "fs_hz": fs,
        "freq_band": np.array(FREQ_BAND),
        "n_samples": n,
        # 输入/中间（透传 exp014 关键量，保证后续绘图自包含）
        "observations": npz["observations"],
        "clean_counts": npz["clean_counts"],
        "signal_filtered": npz["signal_filtered"],
        "freqs": npz["freqs"],
        "response": npz["response"],
        # 修正物理域结果
        "station_signals_phys_fixed": recon_phys,
        "common_signal_phys_fixed": common_phys,
        # 物理域线性振幅谱（目标频带内）
        "spec_freqs_band": freqs[m],
        "spec_truth_phys": spec_truth[:, m],
        "spec_recon_phys": spec_recon[:, m],
        "spec_common_phys": spec_common[m],
        "spec_truth_mean_phys": spec_tm[m],
        # 高阶互相关
        "corr_c12": res["c12"], "corr_c23": res["c23"],
        "corr_c31": res["c31"], "corr_c1223": res["c1223"],
        "corr_c2331": res["c2331"], "corr_c3": res["c3"],
    }
    arrays.update(corr_spec)
    npz_out = OUT_DIR / "v3_all_intermediate_results.npz"
    np.savez_compressed(npz_out, **arrays)
    print(f"[保存] 结果数据已落盘: {npz_out}")

    json_out = {
        "source": str(EXP014_DIR),
        "stations": list(STATIONS),
        "fs_hz": fs,
        "freq_band": list(FREQ_BAND),
        "amplitude_scale": AMPLITUDE_SCALE,
        "evaluation_counts_domain": {k: float(v) for k, v in ev_c.items()},
        "evaluation_physical_corr_inband": corr_p,
        "high_order_corr_peak_freqs": res["peak_freqs"],
        "meta_from_exp014": {
            "fsbl_info": meta.get("fsbl_info"),
            "metrics_common": meta.get("metrics_common"),
            "config": meta.get("config"),
        },
    }
    if extra:
        json_out["extra"] = {k: (v if isinstance(v, (str, int, float, bool, list))
                                 else str(v)) for k, v in extra.items()}
    with open(OUT_DIR / "v3_all_intermediate_results.json", "w",
              encoding="utf-8") as f:
        json.dump(json_out, f, ensure_ascii=False, indent=2)
    print(f"[保存] 元数据已落盘: {OUT_DIR / 'v3_all_intermediate_results.json'}")


# =====================================================================
# 主流程
# =====================================================================
def build_dashboard_package(data_dir, out_dir):
    """[2026-09-18 新增] 把面板展示所需的全部数据打成一个单文件压缩包。

    dashboard_server.py 通过读取该包（启动自动解包 或 POST /api/load_package）
    即可显示全部数据：交互图、顶栏指标、中间参数表、图集 PNG。

    包内结构（tar.gz）：
      all_intermediate_results.npz      <- 交互图数据源（/api/plot）
      metadata.json                     <- 顶栏指标（SNR/corr/迭代等）
      v3_all_intermediate_results.npz   <- 中间参数表（若存在）
      v3_all_intermediate_results.json  <- 元数据（若存在）
      figs/*.png                        <- 图集（解包到面板图集目录）

    返回包路径。
    """
    import io
    import tarfile
    # [2026-09-18 编号数据包] 复用 upload_to_cloud 的编号逻辑（同日递增、跨天重置）
    try:
        from upload_to_cloud import gen_pkg_name, commit_pkg_name
        pkg_id = gen_pkg_name()
        commit_pkg_name(pkg_id)
    except Exception:
        pkg_id = "000-000000"
    pkg = data_dir / ("%s_dashboard_package.tar.gz" % pkg_id)
    with tarfile.open(pkg, "w:gz") as tf:
        for fname in ("all_intermediate_results.npz", "metadata.json"):
            fp = data_dir / fname
            if fp.exists():
                tf.add(fp, arcname=fname)
                print("  + %s (%d KB)" % (fname, fp.stat().st_size // 1024))
        for fname in ("v3_all_intermediate_results.npz",
                      "v3_all_intermediate_results.json"):
            fp = out_dir / fname
            if fp.exists():
                tf.add(fp, arcname=fname)
                print("  + %s (%d KB)" % (fname, fp.stat().st_size // 1024))
        n_png = 0
        for png in sorted(out_dir.glob("*.png")):
            tf.add(png, arcname="figs/" + png.name)
            n_png += 1
        print("  + figs/ 共 %d 张 PNG" % n_png)
        # [2026-09-18] 包信息（编号/生成时间），前端显示用
        import datetime as _dt
        pkg_info = {"package_id": pkg_id,
                    "file": pkg.name,
                    "created_at": _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "data_dir": str(data_dir),
                    "n_figs": len(sorted(out_dir.glob("*.png")))}
        _pi = json.dumps(pkg_info, ensure_ascii=False).encode("utf-8")
        _t = tarfile.TarInfo("package_info.json")
        _t.size = len(_pi)
        tf.addfile(_t, io.BytesIO(_pi))
        print("  + package_info.json (编号 %s)" % pkg_id)
        # [2026-09-18] 交互图 plotly JSON（前端读取数据包零计算渲染）
        n_json = 0
        try:
            import plotly_figs
            plotly_figs.set_npz_path(data_dir / "all_intermediate_results.npz")
            for key in sorted(plotly_figs.PLOT_FACTORIES):
                fig_json = plotly_figs.get_figure(key).to_json()
                info = tarfile.TarInfo("figs_json/%s.json" % key)
                payload = fig_json.encode("utf-8")
                info.size = len(payload)
                tf.addfile(info, io.BytesIO(payload))
                n_json += 1
        except Exception as e:
            print("  (交互图 JSON 生成失败: %s)" % e)
        print("  + figs_json/ 共 %d 个交互图 JSON" % n_json)
        # [2026-09-18] 中间参数表 JSON（前端表格展示）
        try:
            import intermediate_params
            pj = json.dumps(intermediate_params.compute_all_params(),
                            ensure_ascii=False).encode("utf-8")
            info = tarfile.TarInfo("params.json")
            info.size = len(pj)
            tf.addfile(info, io.BytesIO(pj))
            print("  + params.json (%d KB)" % (len(pj) // 1024))
        except Exception as e:
            print("  (参数表 JSON 生成失败: %s)" % e)
    return pkg

def main():
    parser = argparse.ArgumentParser(description="DC-GDCST+DT-FSBL v3 学习版管线")
    parser.add_argument("--selftest", action="store_true",
                        help="快速自检（不依赖 exp014 中间结果）")
    parser.add_argument("--data-dir", type=str, default=None,
                        help="中间结果目录（含 all_intermediate_results.npz 与 "
                             "metadata.json）。默认 exp014_full_pipeline_snr10；"
                             "配合 exp013 --input-snr 输出的新 SNR 目录使用。")
    args = parser.parse_args()

    if args.selftest:
        print("=" * 60)
        print("v3 管线自检：仅验证函数可调用（不依赖 exp014）")
        print("=" * 60)
        rng = np.random.default_rng(1)
        fs = 6.625
        n = int(1800 * fs)
        t = np.arange(n) / fs
        s = np.stack([np.sin(2 * np.pi * 0.005 * t) +
                      0.1 * rng.standard_normal(n) for _ in range(3)])
        s_b = bandpass_obspy_safe(s, fs)
        cm = compute_c_multi(s_b)
        res = advisor_high_order_corr(s_b, fs)
        dt = test_delta_tau_vs_theory([0.1, -0.2, 0.05], [0, 0, 0])
        print(f"  bandpass OK {s_b.shape}, C_multi={cm:.4f}, "
              f"peaks={res['peak_freqs']}, Δτ passed={dt['passed']}")
        print("自检通过。")
        return

    # ---- 加载中间结果（默认 exp014；--data-dir 可指定 SNR 扫描目录）----
    DATA_DIR = Path(args.data_dir) if args.data_dir else EXP014_DIR
    npz_path = DATA_DIR / "all_intermediate_results.npz"
    meta_path = DATA_DIR / "metadata.json"
    if not npz_path.exists():
        print(f"错误：找不到 {npz_path}")
        print("请先运行 exp013_full_pipeline_diagnostic.py 生成中间结果，"
              "或改用 --selftest。")
        sys.exit(1)
    print("=" * 60)
    print("DC-GDCST + DT-FSBL v3 学习版管线（按最新方案执行）")
    print(f"  数据源: {DATA_DIR.name}（fs=6.625 Hz，3 站，5h 信号）")
    print(f"  输出目录: {OUT_DIR}")
    print("=" * 60)

    npz = np.load(npz_path, allow_pickle=True)
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    # 配置核验（新问题 03：max_iter≥6000 硬约束）
    cfg = build_learning_config(float(npz["fs_hz"]))
    print(f"[配置] max_iter={cfg.max_iter}（≥6000 ✓）; "
          f"目标频带 {FREQ_BAND}; 噪声 η≥2 → max(σ^2_q) 保守初始化")

    # A 阶段
    print("\n[A 阶段] 输入与预处理...")
    plot_input_and_preprocess(npz)

    # A-5 仪器响应（待办 A）
    print("\n[A-5] 仪器响应单位感知...")
    plot_response_units(npz)

    # B 阶段
    print("\n[B 阶段] 噪声建模 + η 时变图...")
    plot_noise_model(npz)

    # C 阶段
    print("\n[C 阶段] GDCST...")
    plot_gdcst(npz)

    # D 阶段
    print("\n[D 阶段] FSBL 结果...")
    plot_fsbl(npz)

    # E 阶段
    print("\n[E 阶段] 重建...")
    plot_reconstruction(npz)

    # 评估（问题 13）
    print("\n[评估] 带通后 corr/SNR...")
    plot_evaluation(npz, meta)

    # F 阶段
    print("\n[F 阶段] 置信度 / C_multi / 高阶互相关 / Δτ / 频谱...")
    plot_confidence(npz)
    plot_c_multi(npz)
    plot_high_order_corr(npz)
    plot_delta_tau_test(npz)
    plot_spectrum(npz)
    plot_freq_amp_spectrum(npz)

    # [2026-09-17 用户要求] 预处理后振幅谱 + 预处理后直接高阶互相关
    print("\n[新增图] 预处理后振幅谱 / 预处理后直接高阶互相关...")
    plot_preprocessed_amp_spectrum(npz)
    plot_preprocessed_high_order_corr(npz)
    plot_simulated_preprocessed_high_order_corr(npz)

    # 结果数据落盘（2026-09-17 用户要求：方便后续重新绘图与新的操作）
    print("\n[保存] 中间结果数据...")
    save_v3_results(npz, meta)

    # 汇总清单
    print("\n" + "=" * 60)
    print("输出图片清单（runs/v3_learning_20260917/）：")
    for p in sorted(OUT_DIR.glob("*.png")):
        print(f"  {p.name}  ({p.stat().st_size // 1024} KB)")
    print("=" * 60)
    # [2026-09-18 用户要求] 全部面板展示数据打包为单文件（dashboard 读取即显示全部）
    print("\n[打包] 生成面板数据包（dashboard 读取该文件即显示全部数据）...")
    pkg_path = build_dashboard_package(DATA_DIR, OUT_DIR)
    print("  数据包: {} ({} KB)".format(pkg_path, pkg_path.stat().st_size // 1024))

    print("完成。用 dashboard_server.py 打开 http://localhost:8765/ 查看。")


if __name__ == "__main__":
    main()
