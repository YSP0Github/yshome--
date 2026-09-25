# -*- coding: utf-8 -*-
"""
plotly_figs.py（2026-09-17 新增）
=====================================================================
交互式绘图模块：为 dashboard 生成 14 张交互图（Plotly JSON）。

【背景】
  用户反馈静态 PNG 三站挤在一起看不清、希望恢复旧版"直接绘图、可交互查看"。
  本模块从 exp014 中间结果 npz 读取数据，构造 go.Figure，
  由 dashboard_server.py 的 /api/plot/<key> 返回 JSON，前端 Plotly.js 渲染：
    - 可缩放/平移（zoom/pan）
    - 悬停读值（hover）
    - 图例点击开关曲线
    - 双轴联动

【数据量控制】
  5h @ 6.625 Hz = 119250 点，全量传 JSON 会到数十 MB。
  每条时序 trace 降采样到 <=4000 点（_ds()），heatmap 本身 64×233 很小，原样传。
"""
from __future__ import annotations

import threading
from pathlib import Path

import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# 与 run_pipeline_v3_learning 共用口径
from run_pipeline_v3_learning import (CORR_PLOT_BAND, FREQ_BAND, STATIONS,
                                      bandpass_obspy_safe)
from dc_gdcst_dtfsbl_v2_learning import (
    advisor_high_order_corr,
    compute_c_multi,
    corr_linear_spectrum,
    evaluate_in_band,
    find_band_peaks,
    gdcst_window_length,
    test_delta_tau_vs_theory,
)

NPZ_PATH = Path(r"G:\PhD\04_methods\18_DC-GDCST+DT-FSBL"
                r"\runs\exp014_full_pipeline_snr10\event_001"
                r"\all_intermediate_results.npz")


def set_npz_path(path) -> None:
    """切换交互图数据源（dashboard 按当前 SNR 结果目录调用）并清缓存"""
    global NPZ_PATH, _NPZ_CACHE
    NPZ_PATH = Path(path)
    _NPZ_CACHE = None
    _HIGH_ORDER_CACHE.clear()


# =====================================================================
# [2026-09-24 高阶互相关阶数控制]
# ---------------------------------------------------------------------
# 用户要求：面板画布（12/18/19 交互图）加"阶数"输入框，输入 3 → 最多画
# 到三阶、输入 5 → 最多画到五阶；初始计算先算到 10 阶并缓存，画布切换
# 阶数时不再重算（只按阶数切片出图）。
#   HIGH_ORDER_DEFAULT — 画布默认显示的阶数（保持旧版 3 阶外观）
#   HIGH_ORDER_MAX     — 预计算的最大阶数（advisor 默认 max_order=10）
#   _HIGH_ORDER_CACHE  — {(npz路径, source): advisor 全量结果}，按数据源缓存，
#                        set_npz_path() 时清空（防陈旧数据）。
# =====================================================================
HIGH_ORDER_DEFAULT = 3
HIGH_ORDER_MAX = 10
_HIGH_ORDER_CACHE: dict = {}
_HIGH_ORDER_LOCK = threading.Lock()


def _get_high_order_orders(source: str, s_b: np.ndarray, fs: float) -> dict:
    """预计算 12/18/19 所需的全部阶数互相关（每数据源只算一次并缓存）。

    source: "recon"（12 号，FSBL 重建后）/ "preproc"（18 号，预处理后未去噪）
            / "sim"（19 号，SPECFEM 物理真值）。
    返回 advisor_high_order_corr 的完整结果（含 orders，共 HIGH_ORDER_MAX 阶）。
    """
    key = (str(NPZ_PATH), source)
    with _HIGH_ORDER_LOCK:
        if key not in _HIGH_ORDER_CACHE:
            _HIGH_ORDER_CACHE[key] = advisor_high_order_corr(
                s_b, fs, freq_band=FREQ_BAND, max_order=HIGH_ORDER_MAX)
        return _HIGH_ORDER_CACHE[key]

# =====================================================================
# [2026-09-17 定位] exp013/014 物理域恢复缺陷修正参数
# ---------------------------------------------------------------------
# 合成链（synthesize_realistic_three_events_snr10.py）：
#   counts = A · s · P · H
#     s  = SPECFEM 物理位移（m，恢复目标）
#     P  = 1/max(|H|, floor)  预强调（补偿 DISP 低频衰减）
#     H  = 仪器响应（DISP, counts/m）
#     A  = amplitude_scale（把 counts 缩放到 std=10，≈3.5e10）
# exp013 恢复物理时只除以真实 |H|，漏除 A → 重建物理域比真值大 A·P 倍。
# 修正（fix_phys）：phys_corr(f) = phys(f) · |H(f)| / A，逐频点恢复幅值。
# A / floor 来自合成目录 config_used.json（event_001）。
# =====================================================================
AMPLITUDE_SCALE = {
    "S12": 36776751502.30352,
    "S15": 35477480096.13222,
    "S16": 33372764685.25851,
}
RESPONSE_FLOOR = 3053008.737688841


def fix_phys(npz: dict, phys: np.ndarray) -> np.ndarray:
    """修正 exp013 物理域恢复漏除 amplitude_scale 的缺陷。

    phys_corr(f) = phys(f) · |H(f)| / A（逐频点幅值恢复，使重建物理
    域与 SPECFEM 真值同尺度）。|H(f)| 从 GDCST 网格插值到 FFT 网格。
    """
    H = np.abs(npz["response"])                # (3, 64)
    f_gdcst = npz["freqs"]
    fs = float(npz["fs_hz"])
    phys = np.asarray(phys)
    in_2d = phys.ndim == 1
    if in_2d:
        phys = phys[None, :]
    n_rows = phys.shape[0]
    out = []
    for j in range(n_rows):
        fft_f = np.fft.rfftfreq(phys.shape[1], 1.0 / fs)
        H_interp = np.interp(fft_f, f_gdcst, H[j],
                             left=H[j, 0], right=H[j, -1])
        X = np.fft.rfft(phys[j])
        Xc = X * H_interp / AMPLITUDE_SCALE[STATIONS[j]]
        out.append(np.fft.irfft(Xc, n=phys.shape[1]))
    out = np.array(out)
    return out[0] if in_2d else out

_NPZ_CACHE = None


def load_npz() -> dict:
    """加载并缓存 exp014 中间结果"""
    global _NPZ_CACHE
    if _NPZ_CACHE is None:
        _NPZ_CACHE = dict(np.load(NPZ_PATH, allow_pickle=True))
    return _NPZ_CACHE


def _ds(x, n_max=4000):
    """降采样到 <=n_max 点（时序 trace 用）"""
    x = np.asarray(x)
    if x.ndim == 1:
        if len(x) <= n_max:
            return x
        return x[:: max(1, len(x) // n_max)]
    if x.ndim == 2:
        if x.shape[1] <= n_max:
            return x
        return x[:, :: max(1, x.shape[1] // n_max)]
    return x


_TPL = "plotly_dark"

# =====================================================================
# [2026-09-17 理论振型虚线] 月球球型自由振荡基频振型频率（模型预测）
# ---------------------------------------------------------------------
# 物理口径：只有球型（spheroidal）振型有径向位移分量，垂直分量（MHZ）
#       才能记录到；环型（toroidal）为纯切向运动，垂直地震计观测不到，
#       故只画球型 0S2–0S55（MINEOS 计算，≤20 mHz 全基阶球型分支）。
# 数据来源：SeisY resources/precomputed_modes/vpremoon/modes.csv
#       （VPREMOON 模型，MINEOS 求解，l_min=2、n=0 基阶、频率单位 mHz）。
#       备选模型：weber_vpremoon（Garcia 地幔 + Weber 核，0S2=1.019 mHz）、
#       garcia_vpremoon（缺 0S2–0S14 低阶，从 0S15=6.12 mHz 起）、
#       moon_compact（0S2=0.453 mHz，整体偏低）——换模型即替换本列表。
# 绘图频带 CORR_PLOT_BAND=(0.001,0.020) Hz：12/18/19 谱展示扩展到
#       20 mHz，使 0S2–0S55 理论线全部可见（信号本身带通仍为 FREQ_BAND）。
# =====================================================================
THEORY_SPHEROIDAL_MODES = [
    ("0S2", 0.001082662), ("0S3", 0.001637424), ("0S4", 0.002081414), ("0S5", 0.002486381), ("0S6", 0.002875913), ("0S7", 0.003257351),
    ("0S8", 0.003633769), ("0S9", 0.004006773), ("0S10", 0.00437728), ("0S11", 0.004745828), ("0S12", 0.005112741), ("0S13", 0.005478207),
    ("0S14", 0.005842341), ("0S15", 0.006205207), ("0S16", 0.006566848), ("0S17", 0.00692729), ("0S18", 0.007286551), ("0S19", 0.007644648),
    ("0S20", 0.008001593), ("0S21", 0.0083574), ("0S22", 0.008712081), ("0S23", 0.009065647), ("0S24", 0.00941811), ("0S25", 0.009769478),
    ("0S26", 0.01011976), ("0S27", 0.01046896), ("0S28", 0.0108171), ("0S29", 0.01116416), ("0S30", 0.01151016), ("0S31", 0.01185509),
    ("0S32", 0.01219896), ("0S33", 0.01254177), ("0S34", 0.01288352), ("0S35", 0.0132242), ("0S36", 0.01356382), ("0S37", 0.01390235),
    ("0S38", 0.01423982), ("0S39", 0.0145762), ("0S40", 0.01491149), ("0S41", 0.01524569), ("0S42", 0.01557879), ("0S43", 0.01591078),
    ("0S44", 0.01624166), ("0S45", 0.01657141), ("0S46", 0.01690004), ("0S47", 0.01722753), ("0S48", 0.01755387), ("0S49", 0.01787906),
    ("0S50", 0.01820309), ("0S51", 0.01852595), ("0S52", 0.01884764), ("0S53", 0.01916813), ("0S54", 0.01948744), ("0S55", 0.01980553),
]
THEORY_MODE_SOURCE = ("理论 0S_n（MINEOS 计算 · VPREMOON 模型，"
                      "SeisY precomputed_modes/vpremoon，≤20 mHz）")
# 理论线标注密度：全部 54 条线都画，但文字标注只标每隔 THEORY_LABEL_STEP 条
# （0S2,0S4,0S6,…），避免 54 个标签挤在一起；交互图可缩放查看任意一条。
THEORY_LABEL_STEP = 2
# 理论线外观（2026-09-24 美化）：细 + 半透明金色，避免 54 条虚线喧宾夺主；
# 标签同样降透明度。plotly shape 无独立 opacity 属性，用 rgba 颜色实现。
THEORY_LINE_COLOR = "rgba(255, 213, 79, 0.5)"
THEORY_LABEL_COLOR = "rgba(255, 213, 79, 0.85)"


def add_theory_spheroidal_shapes(shapes: list, annos: list,
                                 row: int = 1,
                                 y_rows: tuple = (0.97, 0.89, 0.84, 0.78)) -> None:
    """把理论球型振型频率画成金色虚线 + 振型名标注（批量 shapes/annotations）。

    与检测峰（红色点线）区分：理论线用金色实心虚线（dash="dash"）；
    标注用 HTML 下标 <sub>0</sub>S<sub>2</sub> 形式（避免 unicode 下标
    在部分中文字体下渲染成方块）。4 个 y 层交替放置减少标注重叠；
    THEORY_LABEL_STEP 控制文字标注密度（线全部画，标签隔条标）。
    row: 目标子图行号（1 起）。线条通过 xref=xN / yref=yN domain 引用
    落到**对应子图内**（不写引用会挂到第一个子图轴、yref="paper" 则
    贯穿整图高度，旧实现即此缺陷）。
    本函数只追加 shapes/annotations；调用方须在**循环外一次性**
    update_layout(shapes=..., annotations=...) 提交——plotly 7.1 逐轮
    update_layout(shapes=...) 会按不可预测规则丢弃/重复旧条目（实测
    只保留部分轮次），且逐条 add_vline 在 subplot 上是性能黑洞
    （每次深拷贝整棵 figure 树，276 峰实测 190s）。
    """
    xax = "x" if row == 1 else f"x{row}"
    yax = "y domain" if row == 1 else f"y{row} domain"
    for i, (label, f) in enumerate(THEORY_SPHEROIDAL_MODES):
        y_top = y_rows[i % len(y_rows)]
        shapes.append(dict(type="line", x0=f, x1=f, y0=0.03, y1=0.97,
                           xref=xax, yref=yax,
                           line=dict(color=THEORY_LINE_COLOR, dash="dash",
                                     width=0.5)))
        if i % THEORY_LABEL_STEP != 0:
            continue
        # "0S2"/"0S12" → HTML 下标 "0" 与 "2"/"12"（label[2:] 兼容两位数）
        annos.append(dict(x=f, y=y_top, xref=xax, yref=yax,
                          text=f"<sub>{label[0]}</sub>S<sub>{label[2:]}</sub>",
                          showarrow=False,
                          font=dict(size=8, color=THEORY_LABEL_COLOR),
                          xanchor="left" if f < 0.015 else "right",
                          yanchor="bottom"))
_COLORS = dict(red="#EF5350", green="#66BB6A", blue="#42A5F5",
               orange="#FFA726", purple="#AB47BC", teal="#26A69A",
               gray="#90A4AE", cyan="#4DD0E1", pink="#EC407A")


def _base_layout(title, height=None, **kw):
    """统一暗色模板 + 标题 + 图例。
    注意：height 参数已弃用（保留签名兼容调用处，但不写入 layout）——
    图高完全由容器决定（Plotly responsive + 前端画布高度滑块），
    否则固定 height 大于容器会被卡片边框裁剪（01 图第三行 S16 不显示的根因）。
    [2026-09-17 图例位置] 用户要求图例一律放标题下方（水平排布），
    不放右侧：orientation="h" + y=1.02（绘图区顶部上方、标题之下），
    x=0 左对齐；多行自动换行。"""
    lay = dict(template=_TPL, title=dict(text=title, font=dict(size=15)),
               margin=dict(l=55, r=55, t=85, b=45),
               hovermode="x unified",
               legend=dict(orientation="h", yanchor="bottom", y=1.02,
                           xanchor="left", x=0.0, font=dict(size=10)),
               **kw)
    return lay


# =====================================================================
# 01 输入：观测 / counts 真值 / 物理真值（双轴，每站一行）
# =====================================================================
def plot01_input(npz: dict):
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    step = max(1, n // 4000)
    t_d = t[::step]
    fig = make_subplots(rows=3, cols=1, shared_xaxes=True, vertical_spacing=0.05,
                        subplot_titles=[f"{st}: 输入三域对比" for st in STATIONS],
                        specs=[[{"secondary_y": True}], [{"secondary_y": True}],
                               [{"secondary_y": True}]])
    for j, st in enumerate(STATIONS):
        r = j + 1
        fig.add_trace(go.Scatter(x=t_d, y=npz["observations"][j][::step],
                                 name=f"{st} 观测", legendgroup=f"g{j}",
                                 mode="lines", line=dict(color=_COLORS["red"], width=1)),
                      row=r, col=1)
        fig.add_trace(go.Scatter(x=t_d, y=npz["clean_counts"][j][::step],
                                 name=f"{st} counts 真值", legendgroup=f"g{j}",
                                 mode="lines", line=dict(color=_COLORS["green"], width=1)),
                      row=r, col=1)
        fig.add_trace(go.Scatter(x=t_d, y=npz["signal_filtered"][j][::step],
                                 name=f"{st} 物理真值 (m)",
                                 legendgroup=f"g{j}",
                                 mode="lines", line=dict(color=_COLORS["blue"],
                                                         width=1.2, dash="4px 2px")),
                      row=r, col=1, secondary_y=True)
        fig.update_yaxes(title_text="counts", row=r, col=1)
        fig.update_yaxes(title_text="位移 (m)", row=r, col=1, secondary_y=True)
    fig.update_xaxes(title_text="时间 (s)", row=3, col=1)
    # [2026-09-18] 标题标注观测 RMS（放在"——"前，避免被 fixFigLayout 截断）
    _obs_rms = float(np.sqrt(np.mean(npz["observations"] ** 2)))
    fig.update_layout(**_base_layout(
        f"01 输入数据（观测 RMS={_obs_rms:.1f}）：观测 / counts 真值 / 物理真值（位移 m）"
        "——观测=SPECFEM 理论信号×H(f)+Apollo 实测噪声",
        height=780))
    return fig


# =====================================================================
# 02 预处理：ObsPy 零相位带通（每站一行）
# =====================================================================
def plot02_preprocessed(npz: dict):
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    step = max(1, n // 4000)
    t_d = t[::step]
    x_re = bandpass_obspy_safe(npz["x_preprocessed"], fs, FREQ_BAND[0], FREQ_BAND[1])
    fig = make_subplots(rows=3, cols=1, shared_xaxes=True, vertical_spacing=0.05,
                        subplot_titles=[f"{st}: 预处理后" for st in STATIONS])
    for j, st in enumerate(STATIONS):
        fig.add_trace(go.Scatter(x=t_d, y=x_re[j][::step], name=st,
                                 mode="lines", line=dict(color=_COLORS["blue"], width=1)),
                      row=j + 1, col=1)
        fig.update_yaxes(title_text="counts", row=j + 1, col=1)
    fig.update_xaxes(title_text="时间 (s)", row=3, col=1)
    fig.update_layout(**_base_layout(
        "02 预处理：A-2 去均值 / A-3 去趋势 / A-4 ObsPy 零相位带通 "
        f"[{FREQ_BAND[0]}, {FREQ_BAND[1]}] Hz（问题 12）", height=720))
    return fig


# =====================================================================
# 03 仪器响应：幅度谱 + 相位（待办 A 单位标注）
# =====================================================================
def plot03_response(npz: dict):
    freqs = npz["freqs"]
    resp = npz["response"]                      # (3, 64) complex
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True, vertical_spacing=0.12,
                        subplot_titles=["幅度谱 |H(f)| (counts/m, DISP)",
                                        "相位 (deg)"])
    for j, st in enumerate(STATIONS):
        fig.add_trace(go.Scatter(x=freqs, y=np.abs(resp[j]), name=st,
                                 mode="lines+markers", line=dict(width=2),
                                 marker=dict(size=4)),
                      row=1, col=1)
        fig.add_trace(go.Scatter(x=freqs, y=np.degrees(np.angle(resp[j])),
                                 name=st, mode="lines+markers",
                                 line=dict(width=1.5, dash="dot"),
                                 marker=dict(size=4), showlegend=False),
                      row=2, col=1)
    fig.update_xaxes(type="log", row=1, col=1)
    fig.update_xaxes(type="log", title_text="频率 (Hz)", row=2, col=1)
    fig.update_yaxes(title_text="counts/m", row=1, col=1)
    fig.update_yaxes(title_text="deg", row=2, col=1)
    fig.update_layout(**_base_layout(
        "03 仪器响应（待办 A：DISP 位移型 counts/m，量纲链 counts→H^-1→m）",
        height=560))
    return fig


# =====================================================================
# 04 噪声 Welch PSD（B-2）
# =====================================================================
def plot04_noise_psd(npz: dict):
    psd_f = npz["noise_psd_freqs"]
    psd = npz["noise_psd"]                      # (3, 2049)
    m = (psd_f >= FREQ_BAND[0]) & (psd_f <= FREQ_BAND[1])
    fig = go.Figure()
    for j, st in enumerate(STATIONS):
        fig.add_trace(go.Scatter(
            x=psd_f[m], y=10 * np.log10(np.maximum(psd[j][m], 1e-30)),
            name=f"{st} PSD", mode="lines", line=dict(width=1.5)))
    fig.add_vrect(x0=FREQ_BAND[0], x1=FREQ_BAND[1], fillcolor="gray",
                  opacity=0.15, line_width=0, annotation_text="目标频带",
                  annotation_position="top left")
    fig.update_xaxes(type="log", title_text="频率 (Hz)")
    fig.update_yaxes(title_text="PSD (dB/Hz)")
    fig.update_layout(**_base_layout(
        f"04 噪声段 Welch PSD（B-2）ν={np.round(npz['nu_values'],1).tolist()} "
        f"σ^2={np.round(npz['sigma2'],4).tolist()}", height=460))
    return fig


# =====================================================================
# 05 η 时变检测（待办 C）：每站 σ^2_q 柱状 + η 阈值线 + ν_q 折线
# =====================================================================
def plot05_noise_timevar(npz: dict):
    coeff = npz["noise_coeff"]                  # (3, 64, 47)
    sigma2 = npz["sigma2"]                      # (3,)
    Q = 9
    n_frames = coeff.shape[2]
    idx = np.array_split(np.arange(n_frames), Q)
    fig = make_subplots(rows=3, cols=2, vertical_spacing=0.10, horizontal_spacing=0.08,
                        subplot_titles=[f"{st}: σ^2_q（红=全局，橙=2×阈值）" for st in STATIONS] +
                                       ["ν_q 分组（副图）"] * 3)
    for j, st in enumerate(STATIONS):
        seg_sigma2 = np.array([np.mean(np.abs(coeff[j, :, grp]) ** 2)
                               for grp in idx])
        seg_kappa = np.array([np.mean(np.abs(coeff[j, :, grp]) ** 4) /
                              (np.mean(np.abs(coeff[j, :, grp]) ** 2) ** 2 + 1e-30)
                              for grp in idx])
        seg_nu = np.array([6.0 / (k - 3.0) + 4.0 if k > 3.0 else 100.0
                           for k in seg_kappa])
        eta = float(np.max(seg_sigma2) / np.maximum(np.min(seg_sigma2), 1e-30))
        q = np.arange(Q)
        fig.add_trace(go.Bar(x=q, y=seg_sigma2, name=f"{st} σ^2_q",
                             marker_color="steelblue"),
                      row=j + 1, col=1)
        fig.add_hline(y=sigma2[j], line=dict(color="red", dash="dash"),
                      row=j + 1, col=1)
        fig.add_hline(y=sigma2[j] * 2.0, line=dict(color="orange", dash="dot"),
                      row=j + 1, col=1)
        fig.add_trace(go.Scatter(x=q, y=seg_nu, name=f"{st} ν_q",
                                 mode="lines+markers", line=dict(color="green")),
                      row=j + 1, col=2)
        fig.update_xaxes(title_text="组 q", row=j + 1, col=2)
        # 标题带 η 结论
        verdict = "非平稳→max(σ^2_q) 保守初始化" if eta >= 2 else "平稳→全局 σ^2"
        fig.layout.annotations[j].text = f"{st}: η={eta:.2f}（{verdict}）"
    fig.update_layout(**_base_layout(
        "05 噪声时变检测 η（待办 C：分段参数仅诊断，D 阶段用 max 保守值）",
        height=780))
    return fig


# =====================================================================
# 06 GDCST 时频谱（S12）+ 修正窗长（问题 02）
# =====================================================================
def plot06_gdcst(npz: dict):
    fs = float(npz["fs_hz"])
    freqs = npz["freqs"]
    coeff_raw = npz["signal_coeff_raw"]         # (3, 64, 233)
    hop = 512.0 / fs
    t_coeff = np.arange(coeff_raw.shape[2]) * hop
    fig = make_subplots(rows=1, cols=2, subplot_titles=["S12 信号 GDCST 时频谱（含噪）",
                                                        "修正窗长 N_w（问题 02）"],
                        horizontal_spacing=0.12)
    z = 10 * np.log10(np.abs(coeff_raw[0]) ** 2 + 1e-30)
    fig.add_trace(go.Heatmap(x=t_coeff, y=freqs, z=z, colorscale="Viridis",
                             colorbar=dict(title="dB", len=0.85)),
                  row=1, col=1)
    lam = 1.0
    nw = np.array([gdcst_window_length(f, lam, fs) for f in freqs])
    fig.add_trace(go.Scatter(x=freqs, y=nw, mode="lines+markers",
                             marker=dict(size=4), line=dict(color=_COLORS["blue"])),
                  row=1, col=2)
    fig.update_xaxes(type="log", title_text="频率 (Hz)", row=1, col=2)
    fig.update_xaxes(title_text="时间 (s)", row=1, col=1)
    fig.update_yaxes(title_text="频率 (Hz)", row=1, col=1)
    fig.update_yaxes(title_text="窗长 N_w (点)", row=1, col=2)
    fig.update_layout(**_base_layout(
        "06 GDCST 工程实现（C 阶段）：N_w=ceil(6/(|f|^λ·Δt))", height=500))
    return fig


# =====================================================================
# 07 DT-FSBL：γ / 活跃支撑集 / 去噪时频谱
# =====================================================================
def plot07_fsbl(npz: dict):
    gamma = npz["gamma"]                        # (64, 233)
    active = npz["active_mask"]
    denoised = npz["signal_coeff_denoised"]
    freqs = npz["freqs"]
    fs = float(npz["fs_hz"])
    hop = 512.0 / fs
    t_coeff = np.arange(gamma.shape[1]) * hop
    fig = make_subplots(rows=1, cols=3, subplot_titles=[
        "ARD 超参数 γ=1/α（log10）", f"活跃支撑集 S_b（{int(active.sum())} 原子）",
        "FSBL 去噪后时频谱（S12）"], horizontal_spacing=0.10)
    fig.add_trace(go.Heatmap(x=t_coeff, y=freqs,
                             z=np.log10(np.maximum(gamma, 1e-30)),
                             colorscale="Plasma", colorbar=dict(len=0.8)),
                  row=1, col=1)
    fig.add_trace(go.Heatmap(x=t_coeff, y=freqs, z=active.astype(float),
                             colorscale="Greens", colorbar=dict(len=0.8),
                             showscale=False),
                  row=1, col=2)
    z = 10 * np.log10(np.abs(denoised[0]) ** 2 + 1e-30)
    fig.add_trace(go.Heatmap(x=t_coeff, y=freqs, z=z, colorscale="Viridis",
                             colorbar=dict(title="dB", len=0.8)),
                  row=1, col=3)
    for c in (1, 2, 3):
        fig.update_xaxes(title_text="时间 (s)", row=1, col=c)
        fig.update_yaxes(title_text="频率 (Hz)", row=1, col=c)
    fig.update_layout(**_base_layout(
        "07 DT-FSBL 结果（D 阶段：max_iter=6000 ≥ 硬约束，问题 03）", height=500))
    return fig


# =====================================================================
# 08 重建：每站 vs 物理真值 + 公共信号（DISP 位移，问题 07）
# 【同频带对比，2026-09-17 修复】物理真值 signal_filtered 是全频带
#   （带内/带外≈0.5），重建信号已严格带限（带内/带外≈5000）。
#   对比前真值必须先带通 [0.001,0.012] Hz，否则视觉上真值高频抖动、
#   与平滑重建曲线不可比（用户反馈）。
# =====================================================================
def plot08_reconstruction(npz: dict):
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    step = max(1, n // 4000)
    t_d = t[::step]
    # 真值带通到与重建同频带（问题 13 同口径：评估/对比必须先带通）
    truth_bp = bandpass_obspy_safe(npz["signal_filtered"], fs,
                                   FREQ_BAND[0], FREQ_BAND[1])
    # [2026-09-17 幅值修正] exp013 恢复物理域漏除 amplitude_scale，
    # 重建物理域比 SPECFEM 真值大 ~1000 倍 → fix_phys 逐频点恢复
    recon_phys = fix_phys(npz, npz["station_signals_phys"])
    common_phys = fix_phys(npz, npz["common_signal_phys"])
    fig = make_subplots(rows=4, cols=1, shared_xaxes=True, vertical_spacing=0.04,
                        subplot_titles=[f"{st}: 重建 vs 物理真值（同频带）" for st in STATIONS] +
                                       ["公共信号（E.6 多站联合 + E.8 OLA）vs 真值均值（同频带）"])
    for j, st in enumerate(STATIONS):
        r = j + 1
        fig.add_trace(go.Scatter(x=t_d, y=recon_phys[j][::step],
                                 name=f"{st} 重建 (m)", mode="lines",
                                 line=dict(color=_COLORS["red"], width=1)),
                      row=r, col=1)
        fig.add_trace(go.Scatter(x=t_d, y=truth_bp[j][::step],
                                 name=f"{st} 物理真值 (m)", mode="lines",
                                 line=dict(color=_COLORS["green"], width=1,
                                           dash="4px 2px")),
                      row=r, col=1)
        fig.update_yaxes(title_text="位移 (m)", row=r, col=1)
    fig.add_trace(go.Scatter(x=t_d, y=common_phys[::step],
                             name="公共信号 (m)", mode="lines",
                             line=dict(color=_COLORS["blue"], width=1.4)),
                  row=4, col=1)
    fig.add_trace(go.Scatter(x=t_d, y=truth_bp.mean(axis=0)[::step],
                             name="真值均值 (m)", mode="lines",
                             line=dict(color=_COLORS["green"], width=1,
                                       dash="4px 2px")),
                  row=4, col=1)
    fig.update_xaxes(title_text="时间 (s)", row=4, col=1)
    fig.update_yaxes(title_text="位移 (m)", row=4, col=1)
    fig.update_layout(**_base_layout(
        "08 信号重建（E 阶段：DISP 位移口径；真值已带通 [0.001,0.012] Hz；"
        "重建已修正 amplitude_scale 幅值）",
        height=880))
    return fig


# =====================================================================
# 09 评估：带通后 SNR / corr（问题 13）
# =====================================================================
def plot09_evaluation(npz: dict):
    fs = float(npz["fs_hz"])
    obs = npz["observations"].mean(axis=0)
    truth_c = npz["clean_counts"].mean(axis=0)
    recon_c = npz["common_signal_counts"]
    ev_c = evaluate_in_band(truth_c, obs, recon_c, fs)
    # 物理域：重建必须 fix_phys 修正（漏除 amplitude_scale 会污染 SNR）；
    # 物理域无"含噪观测"概念 → 只出 corr，SNR 以 counts 域为准
    truth_p = npz["signal_filtered"].mean(axis=0)
    recon_p = fix_phys(npz, npz["common_signal_phys"])
    t_bp = bandpass_obspy_safe(truth_p, fs, FREQ_BAND[0], FREQ_BAND[1])
    r_bp = bandpass_obspy_safe(recon_p, fs, FREQ_BAND[0], FREQ_BAND[1])
    corr_p = float(np.corrcoef(t_bp, r_bp)[0, 1])
    cats = ["counts 域", "物理域 (m)"]
    fig = make_subplots(rows=1, cols=2, subplot_titles=["带通后 SNR（问题 13，counts 域）",
                                                        "带通后 corr（同域）"],
                        horizontal_spacing=0.14)
    fig.add_trace(go.Bar(x=["SNR 输入", "SNR 输出"],
                         y=[ev_c["snr_in_dB"], ev_c["snr_out_dB"]],
                         name="counts 域", marker_color=_COLORS["red"]), row=1, col=1)
    fig.add_trace(go.Bar(x=cats, y=[ev_c["corr_inband"], corr_p],
                         name="corr", marker_color=_COLORS["green"]), row=1, col=2)
    fig.update_yaxes(title_text="SNR (dB)", row=1, col=1)
    fig.update_yaxes(title_text="corr", range=[0, 1], row=1, col=2)
    fig.update_layout(**_base_layout(
        "09 评估（AGENTS.md：必须目标频带带通后计算 corr/SNR；"
        "物理域重建已修正 amplitude_scale）", height=430))
    return fig


# =====================================================================
# 10 置信度（待办 E）：公共信号 + 95% CI / C_j 柱状
# =====================================================================
def plot10_confidence(npz: dict):
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    t = np.arange(n) / fs
    step = max(1, n // 3000)
    t_d = t[::step]
    s_st = npz["station_signals_phys"]
    common = npz["common_signal_phys"]
    s_st_d = s_st[:, ::step]
    common_d = common[::step]
    sigma_t = np.std(s_st_d, axis=0)
    ci_low = common_d - 1.96 * sigma_t / np.sqrt(3)
    ci_high = common_d + 1.96 * sigma_t / np.sqrt(3)
    c_j = []
    for j in range(3):
        a = s_st[j][::step] - s_st[j][::step].mean()
        b = common_d - common_d.mean()
        c_j.append(float(abs(np.dot(a, b)) /
                         (np.linalg.norm(a) * np.linalg.norm(b) + 1e-30)))
    fig = make_subplots(rows=2, cols=1, vertical_spacing=0.14,
                        subplot_titles=["公共信号 + 95% CI（F.3 近似）",
                                        "逐站归一化置信度 C_j（F.4 近似）"])
    fig.add_trace(go.Scatter(x=t_d, y=common_d, name="公共信号 (m)",
                             mode="lines", line=dict(color=_COLORS["red"], width=1.2)),
                  row=1, col=1)
    fig.add_trace(go.Scatter(x=t_d, y=ci_high, name="95% CI 上界",
                             mode="lines", line=dict(width=0), showlegend=False,
                             hoverinfo="skip"),
                  row=1, col=1)
    fig.add_trace(go.Scatter(x=t_d, y=ci_low, name="95% CI 带",
                             mode="lines", line=dict(width=0),
                             fill="tonexty", fillcolor="rgba(239,83,80,0.25)",
                             showlegend=True),
                  row=1, col=1)
    fig.add_trace(go.Bar(x=STATIONS, y=c_j, name="C_j",
                         marker_color="steelblue",
                         text=[f"{c:.4f}" for c in c_j], textposition="outside"),
                  row=2, col=1)
    fig.update_yaxes(title_text="位移 (m)", row=1, col=1)
    fig.update_xaxes(title_text="时间 (s)", row=1, col=1)
    fig.update_yaxes(title_text="C_j", range=[0, 1.15], row=2, col=1)
    fig.update_layout(**_base_layout("10 置信度（待办 E）", height=620))
    return fig


# =====================================================================
# 11 多站一致性 C_multi（待办 F）
# =====================================================================
def plot11_c_multi(npz: dict):
    s = npz["station_signals_phys"]
    c_multi = compute_c_multi(s)
    pairs = [("C12 (S12,S15)", s[0], s[1]),
             ("C23 (S15,S16)", s[1], s[2]),
             ("C31 (S16,S12)", s[2], s[0])]
    vals = [abs(float(np.dot(a, b))) /
            (np.linalg.norm(a) * np.linalg.norm(b) + 1e-30)
            for _, a, b in pairs]
    fig = go.Figure(go.Bar(x=[p[0] for p in pairs], y=vals,
                           marker_color=_COLORS["teal"],
                           text=[f"{v:.4f}" for v in vals],
                           textposition="outside"))
    fig.add_hline(y=c_multi, line=dict(color="red", dash="dash"),
                  annotation_text=f"C_multi = {c_multi:.4f}（(2/3)Σ）",
                  annotation_position="top right")
    fig.update_yaxes(title_text="归一化互相关", range=[0, 1.15])
    fig.update_layout(**_base_layout(
        "11 F.5 多站一致性 C_multi（补遗附录 7.3c，待办 F）", height=430))
    return fig


# =====================================================================
# 12 高阶互相关 3→2→1（待办 B）：C3 谱 + 层级幅度
# =====================================================================
def _order_corr_figure(npz: dict, source: str, title: str,
                       order: int | None = None) -> go.Figure:
    """12/18/19 共用：各阶频率域线性振幅谱（2026-09-24 扩展为可调阶数）

    source: "recon"(12, FSBL 重建后) / "preproc"(18, 预处理后未去噪)
            / "sim"(19, SPECFEM 物理真值)
    order:  最多绘制到第几阶（None → HIGH_ORDER_DEFAULT；上限
            HIGH_ORDER_MAX。只影响子图行数/显示，**不触发重算**——
            全部阶数已由 _get_high_order_orders 预计算并缓存）。

    每阶 3 条序列（C12/C23/C31 → C1223/C2331/C3112 → ……循环相邻
    互相关），分别画线性坐标振幅谱 |FFT(c)|，标注各阶谱峰频率；
    叠加理论球型 0S2-0S55 金色虚线+标注（shapes/annotations 循环外
    一次性提交，绕过 plotly 7.1 逐轮 update 的丢弃/重复缺陷）。
    """
    fs = float(npz["fs_hz"])
    if source == "recon":
        s = fix_phys(npz, npz["station_signals_phys"])
    elif source == "preproc":
        s = npz["x_preprocessed"]
    else:
        s = npz["signal_filtered"]
    s_b = bandpass_obspy_safe(s, fs, FREQ_BAND[0], FREQ_BAND[1])
    res = _get_high_order_orders(source, s_b, fs)
    n_rows = max(1, min((HIGH_ORDER_DEFAULT if order is None else int(order)),
                        len(res["orders"])))
    orders = res["orders"][:n_rows]

    fig = make_subplots(rows=n_rows, cols=1, shared_xaxes=True,
                        vertical_spacing=0.04 if n_rows > 4 else 0.06,
                        subplot_titles=[o["label"] for o in orders])
    # 理论球型振型图例项（ghost trace：仅用于图例，不画数据）
    fig.add_trace(go.Scatter(x=[None], y=[None], mode="lines",
                             line=dict(color=THEORY_LINE_COLOR, dash="dash",
                                       width=1.5),
                             name=THEORY_MODE_SOURCE, showlegend=True),
                  row=1, col=1)
    # 全部 shapes/annotations（理论线 + 各子图谱峰）→ 循环外一次提交
    all_shapes, all_annos = [], []
    for r in range(1, n_rows + 1):
        add_theory_spheroidal_shapes(all_shapes, all_annos, row=r)
    colors = [_COLORS["red"], _COLORS["green"], _COLORS["blue"]]
    for r, o in enumerate(orders, start=1):
        xax = "x" if r == 1 else f"x{r}"
        yax = "y domain" if r == 1 else f"y{r} domain"
        # 显示归一化：每阶按本阶 3 条序列的最大幅值统一缩放（一阶原始幅值
        # 与二阶起的归一化幅值差十几个量级，不缩放会让各阶纵轴不可比；
        # 线性缩放不改变谱峰位置，也不改变存储的原始数据）
        seqs = o["sequences"]
        smax = max(float(np.max(np.abs(s["c"]))) for s in seqs)
        if smax > 0:
            seqs = [dict(s, c=s["c"] / smax) for s in seqs]
        for k, seq in enumerate(seqs):
            f, a = corr_linear_spectrum(seq["c"], fs, CORR_PLOT_BAND)
            fig.add_trace(go.Scatter(x=f, y=a, name=seq["short"], mode="lines",
                                     line=dict(color=colors[k % 3], width=1.1)),
                          row=r, col=1)
        # 本阶谱峰标注（每序列最强 2 峰；批量 shapes/annotations）
        for seq in seqs:
            f, a = corr_linear_spectrum(seq["c"], fs, CORR_PLOT_BAND)
            for fp in find_band_peaks(f, a, max_peaks=2):
                all_shapes.append(dict(type="line", x0=fp, x1=fp, y0=0.02, y1=0.98,
                                       xref=xax, yref=yax,
                                       line=dict(color="red", dash="dot", width=0.8)))
                all_annos.append(dict(x=fp, y=0.98, xref=xax, yref=yax,
                                      text=f"{fp:.5f} Hz", showarrow=False,
                                      font=dict(size=9, color="red"),
                                      xanchor="left", yanchor="bottom"))
        fig.update_yaxes(title_text="|FFT(c)|（线性）", row=r, col=1)
    # 全部 shapes/annotations 一次性提交（直接赋值属性，保留 subplot 标题）
    _titles = list(fig.layout.annotations)
    fig.layout.annotations = _titles + all_annos
    fig.layout.shapes = all_shapes
    fig.update_xaxes(title_text="频率 (Hz)（线性轴）", row=n_rows, col=1)
    fig.update_layout(**_base_layout(title))
    return fig


def plot12_high_order_corr(npz: dict, order: int | None = None):
    """12 高阶互相关 3→2→1：各阶频率域线性振幅谱（2026-09-17 改版，
    2026-09-24 扩展为可调阶数）

    用户口径：高阶互相关幅值随阶数递减是理论必然，**不做峰值幅度对比**；
    高阶互相关的价值在频率域**谱峰特征（位置/形状）随阶数的变化**。
    故每阶（一阶 C12/C23/C31、二阶 C1223/C2331/C3112、三阶及以上……
    每阶 3 条）分别画线性坐标振幅谱 |FFT(c)|，并标注各阶谱峰频率。
    输入用 fix_phys 修正后的重建信号（与真值同尺度）。
    [2026-09-17 理论振型虚线] 叠加理论球型 0S2-0S5（金色虚线+标注）。
    [性能/正确性修复] shapes/annotations 全部收集后**循环外一次性**
    update_layout 提交（见 add_theory_spheroidal_shapes 注释）。
    """
    return _order_corr_figure(npz, "recon",
        "12 高阶互相关 3→2→1 各阶频率域振幅谱（线性坐标，看谱峰特征变化；"
        "不做峰值幅度对比——高阶幅值递减为理论现象）。"
        "红色点线=程序检出谱峰；金色虚线=理论球型基频振型 0S2-0S55"
        "（MINEOS 计算 · VPREMOON 模型，≤20 mHz）", order)


def plot13_delta_tau(npz: dict):
    est = [0.2, -0.3, 0.1]        # 演示估计（s），来自走时差模块口径
    theory = [0.0, 0.0, 0.0]      # 自由振荡理论走时差 = 0
    res = test_delta_tau_vs_theory(est, theory, tol_s=10.0)
    fig = go.Figure()
    x = np.arange(3)
    fig.add_trace(go.Bar(x=STATIONS, y=est, name="估计 Δτ (s)",
                         marker_color=_COLORS["blue"],
                         text=[f"{e:.1f}" for e in est], textposition="outside"))
    fig.add_trace(go.Bar(x=STATIONS, y=theory, name="理论走时差 (s)=0（自由振荡）",
                         marker_color=_COLORS["green"]))
    fig.add_hline(y=10.0, line=dict(color="red", dash="dash"))
    fig.add_hline(y=-10.0, line=dict(color="red", dash="dash"))
    fig.update_yaxes(title_text="走时差 (s)")
    fig.update_layout(**_base_layout(
        f"13 Δτ 估计 vs 理论（待办 D，passed={res['passed']}）", height=430))
    return fig


# =====================================================================
# 14 频谱对比（F-2）
# =====================================================================
def plot14_spectrum(npz: dict):
    spec_f = npz["spec_freqs"]
    m = (spec_f >= FREQ_BAND[0]) & (spec_f <= FREQ_BAND[1])
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=spec_f[m],
                             y=10 * np.log10(np.maximum(npz["spec_clean"][m], 1e-30)),
                             name="真值谱（counts）", mode="lines",
                             line=dict(color=_COLORS["green"], width=1.6)))
    fig.add_trace(go.Scatter(x=spec_f[m],
                             y=10 * np.log10(np.maximum(npz["spec_noisy"][m], 1e-30)),
                             name="含噪观测谱", mode="lines",
                             line=dict(color=_COLORS["red"], width=1),
                             opacity=0.6))
    fig.add_trace(go.Scatter(x=spec_f[m],
                             y=10 * np.log10(np.maximum(npz["spec_recon"][m], 1e-30)),
                             name="重建公共信号谱", mode="lines",
                             line=dict(color=_COLORS["blue"], width=1.6)))
    fig.update_xaxes(type="log", title_text="频率 (Hz)")
    fig.update_yaxes(title_text="PSD (dB/Hz)")
    fig.update_layout(**_base_layout(
        f"14 频谱对比（F-2：目标频带 [{FREQ_BAND[0]}, {FREQ_BAND[1]}] Hz）",
        height=460))
    return fig


# =====================================================================
# 15 η_j 三站汇总（待办 C）：柱状 + η=2 阈值线 + 判定
# =====================================================================
def plot15_eta_summary(npz: dict):
    coeff = npz["noise_coeff"]                    # (3, 64, 47)
    Q = 9
    n_frames = coeff.shape[2]
    idx = np.array_split(np.arange(n_frames), Q)
    etas, verdicts = [], []
    for j in range(3):
        seg_s2 = np.array([np.mean(np.abs(coeff[j, :, grp]) ** 2) for grp in idx])
        eta = float(np.max(seg_s2) / np.maximum(np.min(seg_s2), 1e-30))
        etas.append(eta)
        verdicts.append("非平稳 → max(σ^2_q)" if eta >= 2 else "平稳 → 全局 σ^2")
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=STATIONS, y=etas, marker_color="steelblue",
        text=[f"η={e:.2f}" for e in etas], textposition="outside",
        customdata=verdicts,
        hovertemplate="%{x}: η=%{y:.2f}<br>%{customdata}<extra></extra>"))
    fig.add_hline(y=2.0, line=dict(color="red", dash="dash", width=2),
                  annotation_text="η=2 阈值（平稳性判定）",
                  annotation_position="top right",
                  annotation_font=dict(color="red"))
    for j, st in enumerate(STATIONS):
        fig.add_annotation(
            x=j, y=etas[j] + max(etas) * 0.04 if max(etas) < 30 else etas[j] * 1.02,
            text=verdicts[j], showarrow=False, font=dict(size=11,
                                                         color="#EF5350" if etas[j] >= 2 else "#66BB6A"))
    fig.update_yaxes(title_text="η = max(σ^2_q) / min(σ^2_q)")
    fig.update_layout(**_base_layout(
        "15 η_j 三站汇总（待办 C：η≥2 非平稳 → D 阶段 max(σ^2_q) 保守初始化）"))
    return fig


# =====================================================================
# 16 频率域线性振幅谱对比（2026-09-17 用户要求新增）
# ---------------------------------------------------------------------
# 时间域对比不够，还必须在频率域做线性坐标振幅谱对比。
# 真值 = SPECFEM 位移带通 [0.001,0.012] Hz；重建 = fix_phys 修正后的
# 物理域（已除 amplitude_scale，与真值同尺度）。纵轴线性振幅 |X(f)| (m)。
# =====================================================================
def plot16_freq_amp_spectrum(npz: dict):
    fs = float(npz["fs_hz"])
    n = npz["observations"].shape[1]
    freqs = np.fft.rfftfreq(n, 1.0 / fs)
    m = (freqs >= FREQ_BAND[0]) & (freqs <= FREQ_BAND[1])
    truth_bp = bandpass_obspy_safe(npz["signal_filtered"], fs,
                                   FREQ_BAND[0], FREQ_BAND[1])
    recon_phys = fix_phys(npz, npz["station_signals_phys"])
    common_phys = fix_phys(npz, npz["common_signal_phys"])
    spec_truth = np.abs(np.fft.rfft(truth_bp, n=n, axis=1)) * (2.0 / n)
    spec_recon = np.abs(np.fft.rfft(recon_phys, n=n, axis=1)) * (2.0 / n)
    spec_common = np.abs(np.fft.rfft(common_phys, n=n)) * (2.0 / n)
    spec_truth_mean = np.abs(np.fft.rfft(truth_bp.mean(axis=0), n=n)) * (2.0 / n)
    fig = make_subplots(rows=4, cols=1, shared_xaxes=True, vertical_spacing=0.05,
                        subplot_titles=[f"{st}: 线性振幅谱（目标频带）" for st in STATIONS] +
                                       ["公共信号 vs 真值均值 线性振幅谱"])
    for j, st in enumerate(STATIONS):
        r = j + 1
        fig.add_trace(go.Scatter(x=freqs[m], y=spec_recon[j][m],
                                 name=f"{st} 重建", mode="lines",
                                 line=dict(color=_COLORS["red"], width=1)),
                      row=r, col=1)
        fig.add_trace(go.Scatter(x=freqs[m], y=spec_truth[j][m],
                                 name=f"{st} 真值", mode="lines",
                                 line=dict(color=_COLORS["green"], width=1,
                                           dash="dash")),
                      row=r, col=1)
        fig.update_yaxes(title_text="|X(f)| (m)", row=r, col=1)
    fig.add_trace(go.Scatter(x=freqs[m], y=spec_common[m],
                             name="公共信号", mode="lines",
                             line=dict(color=_COLORS["blue"], width=1.4)),
                  row=4, col=1)
    fig.add_trace(go.Scatter(x=freqs[m], y=spec_truth_mean[m],
                             name="真值均值", mode="lines",
                             line=dict(color=_COLORS["green"], width=1,
                                       dash="dash")),
                  row=4, col=1)
    fig.update_xaxes(title_text="频率 (Hz)", row=4, col=1)
    fig.update_yaxes(title_text="|X(f)| (m)", row=4, col=1)
    fig.update_layout(**_base_layout(
        "16 频率域线性振幅谱对比（重建已修正 amplitude_scale，与真值同尺度；"
        "真值带通同频带）", height=880))
    return fig


# =====================================================================
# 17 预处理后三站振幅谱（2026-09-17 用户要求新增）
# ---------------------------------------------------------------------
# 输入 = 02 预处理后数据 x_preprocessed（counts 域，去趋势+带通）。
# 线性振幅谱 |FFT(x)|，全频带（可交互缩放），目标频带 [0.001,0.012] Hz 阴影。
# =====================================================================
def plot17_preprocessed_amp_spectrum(npz: dict):
    fs = float(npz["fs_hz"])
    x = npz["x_preprocessed"]
    n = x.shape[1]
    freqs = np.fft.rfftfreq(n, 1.0 / fs)
    spec = np.abs(np.fft.rfft(x, n=n, axis=1)) * (2.0 / n)
    fig = make_subplots(rows=3, cols=1, shared_xaxes=True, vertical_spacing=0.05,
                        subplot_titles=[f"{st}: 预处理后数据振幅谱" for st in STATIONS])
    for j, st in enumerate(STATIONS):
        r = j + 1
        fig.add_trace(go.Scatter(x=freqs, y=spec[j], name=f"{st} |X(f)|",
                                 mode="lines", line=dict(color=_COLORS["blue"], width=1)),
                      row=r, col=1)
        fig.add_vrect(x0=FREQ_BAND[0], x1=FREQ_BAND[1], fillcolor="green",
                      opacity=0.08, line_width=0, row=r, col=1)
        fig.update_yaxes(title_text="|X(f)|（线性）", row=r, col=1)
    fig.update_xaxes(title_text="频率 (Hz)", row=4 if False else 3, col=1)
    fig.update_xaxes(range=[0.0, 0.02], row=3, col=1)
    fig.update_layout(**_base_layout(
        "17 三站预处理后数据振幅谱（02 预处理：去趋势+带通，counts 域；"
        "绿色阴影 = 目标频带 [0.001,0.012] Hz；可缩放查看低频细节）",
        height=820))
    return fig


# =====================================================================
# 18 预处理后数据直接高阶互相关（2026-09-17 用户要求新增）
# ---------------------------------------------------------------------
# 用户：三个台站合成月震记录经 02 预处理后，直接做高阶互相关，
# 按 F 阶段 12 号图样式可视化（各阶频率域线性振幅谱）。
# 与 12 号（FSBL 重建后信号）对比，可见 FSBL 提取效果。
# =====================================================================
def plot18_preprocessed_higher_order_corr(npz: dict, order: int | None = None):
    """18 预处理后数据直接高阶互相关（2026-09-17 用户要求新增，
    2026-09-24 扩展为可调阶数）

    三站预处理后数据直接做高阶互相关（未去噪），按 12 号图样式：
    各阶频率域线性振幅谱（一阶 C12/C23/C31、二阶 C1223/C2331/C3112、
    三阶及以上……每阶 3 条，阶数可在画布输入框调整，预计算至 10 阶）。
    与 12 号（FSBL 重建后）对比，可见 FSBL 提取效果。
    [2026-09-17 理论振型虚线] 叠加理论球型 0S2-0S5（金色虚线+标注）；
    shapes 循环外一次性提交（与 plot12 相同的正确性/性能修复）。
    """
    return _order_corr_figure(npz, "preproc",
        "18 预处理后数据（未去噪）直接高阶互相关：各阶频率域振幅谱"
        "（与 12 号 FSBL 重建后对比，看去噪效果；阶数可在画布输入框调整，"
        "已预计算至 10 阶）。"
        "金色虚线=理论球型基频振型 0S2-0S55（MINEOS 计算 · VPREMOON"
        " 模型，≤20 mHz）", order)


def plot19_simulated_preprocessed_higher_order_corr(npz: dict,
                                                    order: int | None = None):
    """19 模拟数据（SPECFEM 物理真值）带通后直接高阶互相关（2026-09-17 新增，
    2026-09-24 扩展为可调阶数）

    用户：第一页底部再加"模拟数据预处理后的高阶互相关"。
    口径：npz["signal_filtered"] = SPECFEM 模拟物理真值（位移 m），
    纯净（无噪声、无仪器响应），带通 [0.001,0.012] Hz 后直接做高阶
    互相关（每阶 3 条，阶数可在画布输入框调整，预计算至 10 阶）——
    展示"信号完美、噪声为零"时各阶互相关谱的理论形态，
    与 18（含噪观测预处理后，看噪声污染）、12（FSBL 重建后，看去噪效果）
    形成三档对比。制式与 12/18 完全一致（峰标注 + 理论振型虚线）。
    """
    return _order_corr_figure(npz, "sim",
        "19 模拟数据（SPECFEM 物理真值，位移 m）带通后直接高阶互相关："
        "各阶频率域振幅谱（理论极限参考：无噪声、无仪器响应；"
        "与 18 含噪观测 / 12 FSBL 重建后对比；阶数可在画布输入框调整，"
        "已预计算至 10 阶；金色虚线=理论球型 0S2-0S55，"
        "MINEOS 计算 · VPREMOON 模型，≤20 mHz）", order)


# =====================================================================
# 注册表：key → 生成函数（供 dashboard /api/plot/<key> 使用）
# =====================================================================
PLOT_FACTORIES = {
    "01": plot01_input,
    "02": plot02_preprocessed,
    "03": plot03_response,
    "04": plot04_noise_psd,
    "05": plot05_noise_timevar,
    "06": plot06_gdcst,
    "07": plot07_fsbl,
    "08": plot08_reconstruction,
    "09": plot09_evaluation,
    "10": plot10_confidence,
    "11": plot11_c_multi,
    "12": plot12_high_order_corr,
    "13": plot13_delta_tau,
    "14": plot14_spectrum,
    "15": plot15_eta_summary,
    "16": plot16_freq_amp_spectrum,
    "17": plot17_preprocessed_amp_spectrum,
    "18": plot18_preprocessed_higher_order_corr,
    "19": plot19_simulated_preprocessed_higher_order_corr,
}


def get_figure(key: str, order: int | None = None):
    """按 key 生成 go.Figure。

    order（仅 12/18/19 生效）：最多绘制到第几阶（None → HIGH_ORDER_DEFAULT）。
    数据已按 HIGH_ORDER_MAX 预计算并缓存，切换阶数只做切片、不重算。
    """
    npz = load_npz()
    fn = PLOT_FACTORIES[key]
    if key in ("12", "18", "19"):
        return fn(npz, order=order)
    return fn(npz)


if __name__ == "__main__":
    # 自检：全部 14 个图生成成功
    for k in PLOT_FACTORIES:
        fig = get_figure(k)
        n_tr = len(fig.data)
        print(f"[{k}] OK, traces={n_tr}")
    print("全部 14 张交互图生成成功")
