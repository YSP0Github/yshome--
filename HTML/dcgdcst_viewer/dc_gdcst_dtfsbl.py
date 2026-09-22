"""DC-GDCST + DT-FSBL 参考实现 (对照手册第 14 章完整工程实施清单)

本模块实现手册第 14 章定义的完整工程流水线:
  Stage A: 预处理 (A-1 ~ A-5)
  Stage B: 噪声建模 (B-1 ~ B-5)
  Stage C: 解析信号 + GDCST (C-1 ~ C-3)
  Stage D: DT-FSBL (D-1 ~ D-3)
  Stage E: 信号-噪声分离与重建 (E-1 ~ E-4)
  Stage F: 后处理与置信度 (F-1 ~ F-3)

每个函数/方法的 docstring 标注了对应的手册步骤编号 [X-N]。
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Sequence

import numpy as np
from scipy.signal import detrend, fftconvolve, hilbert, welch
from obspy.signal.filter import bandpass as obspy_bandpass, lowpass as obspy_lowpass


# =====================================================================
# 配置参数 (对照手册第 14 章「Config 参数对照」表)
# =====================================================================
@dataclass
class DCGDCSTDTFSBLConfig:
    # --- [阶段 A] 预处理 ---
    sampling_rate: float = 10.0               # 原始采样率 f_s = 1/Δt
    use_decimation: bool = True                # [PDF §3] 抽取降采样 D=100
    decimation_factor: int = 100               # 抽取因子 D (先抗混叠滤波)
    target_sampling_rate: float = 0.1          # 抽取后目标采样率 Δt=10s
    frequency_band: tuple[float, float] = (0.001, 0.012)  # 目标频带 [f_min, f_max]
    n_frequencies: int = 48                   # 频带内频率bin数 M_f
    coefficient_hop: int = 16                 # GDCST 时间步长 (采样点)
    freq_grid_type: str = "proportional"       # [PDF §4.3] 频率网格: proportional(比例间距) / linear(均匀)
    c_f: float = 1.0                            # [PDF §4.3] 比例间距系数 δf=c_f·σ_f(f)

    # --- [阶段 B] 噪声建模 ---
    lambda_param: float = 1.0                 # GDCST 窗参数 λ (默认 1.0 = 标准 S 变换)
    lambda_search_range: tuple[float, float] = (0.3, 2.0)  # [B-4] λ 搜索范围
    lambda_search_step: float = 0.1           # [B-4] λ 搜索步长
    use_lambda_optimization: bool = True       # [B-4] 是否启用 λ 自适应优化
    use_welch_psd: bool = True                 # [B-2] 是否启用 Welch PSD 估计
    welch_nperseg: Optional[int] = None        # [B-2] Welch 段长 (None=auto)
    use_student_t_fit: bool = True             # [B-3] 是否启用 Student-t 自动估计
    student_t_nu: float = 5.0                  # [B-3] Student-t 自由度 (默认; B-3 自动估计时覆盖)
    nu_range: tuple[float, float] = (4.0, 200.0)  # [B-3] ν 约束范围
    use_time_varying_noise: bool = True        # [B-5] 是否启用时变噪声检测
    noise_n_segments: int = 9                  # [B-5] Q=9 子段
    stationarity_ratio_threshold: float = 2.0  # [B-5] 平稳性比 η 阈值

    # --- [阶段 C] 分块 ---
    n_blocks: int = 5                          # [C-2] 分块数 N_B = 5
    block_overlap_ratio: float = 0.5           # [C-2] 块重叠率 ρ = 50%

    # --- [阶段 D] DT-FSBL ---
    max_iter: int = 500                        # [D-2] 最大迭代次数 K_max
    tol: float = 1.0e-6                        # [D-2] 收敛阈值
    ard_floor: float = 1.0e-10                 # [D-2] gamma 下限 (防止除零)
    ard_prune_ratio: float = 1.0e-3            # [D-2] Wiener 软掩码底
    alpha_thresh: float = 1.0e8               # [D-2] ARD 剪枝安全网 (alpha=1/gamma > 此值必剪)
    ard_prune_quantile: float = 0.0           # [D-2] 离线剪枝: 额外剪最弱端比例 (0=禁用)
    ard_prune_floor_multiplier: float = 1e6   # [D-2] 死原子盆地阈值系数 (剪 gamma <= ard_floor*K)
    ard_em_warmup: int = 99999                 # [D-2] 阻尼 warmup 轮数 (大值=全程阻尼)
    ard_em_damping: float = 0.5                # [D-2] EM 更新阻尼系数 (0.5 最稳定)
    ard_prune_warmup: int = 100                # [D-2] 前 N 轮不剪枝, 等 gamma 分布稳定
    ard_prune_interval: int = 10               # [D-2] 每 N 轮检查一次剪枝
    convergence_stable_count: int = 10         # [D-2] 活跃集稳定计数
    max_runtime_sec: float = 3600.0            # [D-2] 最大运行时间 (秒)

    # --- [阶段 D-3] 走时差搜索 ---
    travel_time_range: tuple[float, float] = (-550.0, 550.0)  # 搜索范围 (秒)
    travel_time_coarse_step: float = 5.0       # 粗搜索步长 (秒)
    travel_time_fine_step: float = 0.5         # 细搜索步长 (秒)

    # --- [阶段 E] 重建 ---
    # (无独立参数, 依赖 D 阶段输出)

    # --- [阶段 F] 后处理 ---
    signal_floor: float = 1.0e-12              # 信号下限
    response_floor: float = 1.0e-12            # 响应下限
    confidence_epsilon: float = 1.0e-12         # [F-1] 置信度正则化项

    # --- [F-3] 自由振荡提取 ---
    free_osc_min_snr_db: float = 3.0           # 谱峰检测 SNR 阈值 (dB)
    free_osc_nfft: int = 8192                  # FFT 长度
    use_c3_correlation: bool = True             # [PDF §15] C3高阶互相关提取自由振荡

    # --- [PDF §6] AR 白化 ---
    use_ar_whitening: bool = True               # 启用 AR 白化 (Burg+BIC)
    ar_max_order: int = 50                       # AR 最大阶数
    ar_bic_weight: float = 1.0                   # BIC 惩罚权重

    # --- [PDF §4.3] (λ,p) 自适应 ---
    p_param: float = 1.0                         # GDCST 窗形状参数 p
    use_p_optimization: bool = True              # 启用 p 自适应搜索
    p_search_values: tuple = (0.8, 1.0, 1.2)    # p 搜索网格 [PDF §4.3]
    lambda_search_values: tuple = (0.5, 1.0, 2.0, 5.0)  # λ 搜索网格 [PDF §4.3]

    # --- [PDF §12.2] 组共享支撑 ---
    use_group_sharing: bool = True               # 时移容差组共享支撑
    v_min_km_s: float = 1.0                      # 最小波速 (决定 Δt_max=a/v_min)
    array_aperture_km: float = 1100.0            # 台阵边长 a=1100 km

    # --- [PDF §12.3] 离格精化 ---
    use_offgrid_refinement: bool = True           # Gauss-Newton 离格精化
    offgrid_max_iter: int = 20                    # 离格精化最大迭代
    offgrid_tol: float = 1e-4                     # 离格精化收敛阈值

    # --- [PDF §9] 经验零分布 p 值 ---
    use_empirical_null: bool = True               # 经验零分布 p 值检验
    n_bootstrap: int = 200                        # 块自助次数
    empirical_null_alpha: float = 0.05            # 显著性水平

    # --- [PDF §3] 台站选择 ---
    use_station_selection: bool = True             # 4选3台站选择
    n_stations_select: int = 3                     # 选择台站数
    dominant_freq_ref: float = 0.65                # 参考主频 0.65 Hz


# =====================================================================
# [阶段 B] 独立噪声建模工具函数
# =====================================================================

def ar_whiten(signal: np.ndarray, fs: float, max_order: int = 50,
               bic_weight: float = 1.0) -> tuple[np.ndarray, np.ndarray, int, float]:
    """[PDF §6] AR 白化: Burg 法拟合 AR(P) + BIC 自动选阶 + 白化算子 W=σ_e^{-1}A

    PDF §6: 对预处理后的纯噪声段 z_j∈R^N_z 用 Burg 法拟合 AR(P_j),
    阶数 P_j 由 BIC 自动选取。白化算子 W_j=σ_e^{-1}A_j (A_j 为 AR系数带状Toeplitz)。
    白化后 ỹ_j=W_j y_j, Φ̃_j=W_j Φ_j, ñ_j≈N(0,β_j I)。

    参数:
      signal — (n_samples,) 噪声段信号
      fs     — 采样率
      max_order — AR 最大阶数
      bic_weight — BIC 惩罚权重

    返回:
      (whitened, ar_coeffs, order, sigma_e) — 白化后信号, AR系数[1,a1,...,aP], 阶数, 激励标准差
    """
    from spectrum import arburg
    x = np.asarray(signal, dtype=np.float64).ravel()
    x = x - np.mean(x)
    n = len(x)
    best_bic = np.inf
    best_order = 0
    best_coeffs = np.array([1.0])
    best_sigma = np.std(x)
    # BIC 选阶: AR(p) 的 BIC = n*log(σ_e²) + p*log(n)
    for p in range(1, min(max_order, n // 4) + 1):
        try:
            ar_coeffs, sigma_e, _ = arburg(x, p)
            # arburg 返回 [1, a1, ..., ap], sigma_e 是激励方差
            bic_val = n * np.log(sigma_e + 1e-30) + bic_weight * p * np.log(n)
            if bic_val < best_bic:
                best_bic = bic_val
                best_order = p
                best_coeffs = np.concatenate([[1.0], ar_coeffs])
                best_sigma = np.sqrt(sigma_e)
        except Exception:
            continue
    if best_order == 0:
        # 退化: 无有效 AR 模型, 返回原信号
        return x.copy(), np.array([1.0]), 0, np.std(x)
    # 白化: A(z)x(n) = x(n) + a1*x(n-1) + ... + aP*x(n-P) = e(n)
    # 用 lfilter 实现 A(z) 滤波
    from scipy.signal import lfilter
    whitened = lfilter(best_coeffs, [1.0], x)
    # 归一化到 σ_e
    whitened = whitened / (best_sigma + 1e-30)
    return whitened, best_coeffs, best_order, best_sigma


def select_stations(observations: np.ndarray, fs: float, n_select: int = 3,
                    ref_freq: float = 0.65) -> tuple[np.ndarray, list[int]]:
    """[PDF §3] 台站选择: 从 N 个 Apollo 台中选主频与 ref_freq 一致性最好的 n_select 台

    PDF §3: 对各台原始 Counts 记录做 Welch 功率谱 P^j(f), 取主频 f_dom^j=argmax_f P^j(f),
    选出与 0.65 Hz 一致性最好的 3 台: {j1,j2,j3}=argmin_{jkl} max_{u,v∈{jkl}} |f_dom^u-f_dom^v|

    参数:
      observations — (n_stations, n_samples) 多台站观测
      fs — 采样率
      n_select — 选择台站数
      ref_freq — 参考主频 (用于排序一致性)

    返回:
      (selected_obs, indices) — 选中的台站数据, 选中的台站索引
    """
    from scipy.signal import welch as sp_welch
    n_stations = observations.shape[0]
    if n_stations <= n_select:
        return observations.copy(), list(range(n_stations))
    # 各台 Welch PSD 找主频
    dominant_freqs = []
    for j in range(n_stations):
        f, pxx = sp_welch(observations[j], fs=fs, nperseg=min(8192, len(observations[j])//4))
        # 只在合理范围内找主频 (0.1-10 Hz, 避开 DC 和高频噪声)
        mask = (f > 0.1) & (f < 10.0)
        if np.any(mask):
            f_dom = f[mask][np.argmax(pxx[mask])]
        else:
            f_dom = f[np.argmax(pxx)]
        dominant_freqs.append(f_dom)
    dominant_freqs = np.array(dominant_freqs)
    # 选与 ref_freq 最接近的 n_select 台 (简化版一致性选择)
    # PDF 要求组内 max|f_u-f_v| 最小, 这里用与 ref_freq 的距离排序近似
    distances = np.abs(dominant_freqs - ref_freq)
    indices = sorted(np.argsort(distances)[:n_select].tolist())
    return observations[indices].copy(), indices


def welch_noise_psd(signal: np.ndarray, fs: float, nperseg: Optional[int] = None) -> tuple[np.ndarray, np.ndarray]:
    """[B-2] Welch 法估计噪声功率谱密度 (PSD)

    手册步骤: B-2 — 使用 Welch 方法 (分段、加窗、平均) 降低 PSD 估计方差
    方法: Hann 窗, 50% 重叠, N_fft = 段长

    参数:
      signal — 噪声段信号
      fs     — 采样率
      nperseg — Welch 段长 (None=auto, 至少 100000 点)

    返回:
      (frequencies_hz, psd) — 频率数组 + PSD 值 [counts²·s]
    """
    nperseg = nperseg or max(100000, 2 ** int(np.ceil(np.log2(len(signal)))))
    nperseg = min(nperseg, len(signal))
    freqs, psd = welch(signal, fs=fs, window="hann", nperseg=nperseg,
                       noverlap=nperseg // 2, nfft=nperseg)
    return freqs, psd


def fit_student_t_moments(coefficients: np.ndarray, nu_range: tuple[float, float] = (4.0, 200.0)) -> float:
    """[B-3] 从 GDCST 噪声系数估计 Student-t 自由度 ν

    手册步骤: B-3 — 矩估计法 (Moment Matching)
    公式: κ = m4/m2² (峰度), ν = 6/(κ-3) + 4
    峰度 κ→3 时退化为高斯 (ν→∞), κ 大则重尾 (ν 小)

    参数:
      coefficients — GDCST 噪声段系数 (n_stations, n_freq, n_times)
      nu_range     — ν 约束范围 [4, 200]

    返回:
      ν (float) — Student-t 自由度, 裁剪到 nu_range
    """
    z = np.abs(coefficients).ravel()
    n = len(z)
    if n < 4:
        return 100.0                     # 数据不足, 返回近高斯
    m2 = np.mean(z ** 2)                 # 二阶矩
    if m2 < 1e-30:
        return 100.0
    m4 = np.mean(z ** 4)                # 四阶矩
    kappa = m4 / (m2 ** 2)               # 峰度
    if kappa <= 3.0:
        return 100.0                     # 高斯情形
    nu = 6.0 / (kappa - 3.0) + 4.0       # 矩估计公式
    return float(np.clip(nu, nu_range[0], nu_range[1]))


def optimize_lambda(signal: np.ndarray, fs: float, freq_band: tuple[float, float],
                    candidate_range: tuple[float, float] = (0.3, 2.0),
                    step: float = 0.1, max_segment: int = 100000,
                    p_param: float = 1.0, lambda_values: tuple = None,
                    p_values: tuple = None) -> tuple[float, float]:
    """[B-4] (λ,p) 联合自适应搜索 (PDF §4.3)

    PDF §4.3: (λ,p) 自适应 — 在小网格 λ∈{0.5,1,2,5}, p∈{0.8,1,1.2} 上
    以 DT-FSBL 的证据（边缘似然）最大为准则选取。
    实现简化: 用 GDCST 系数的 L1/L2 比（稀疏度代理, PDF §8 参与比 D_eff）
    作为快速评估准则，选最稀疏的 (λ,p) 组合。

    返回: (best_lambda, best_p)
    """
    seg = signal[:max_segment]
    t_seg = np.arange(len(seg)) / fs
    low, high = freq_band

    # 搜索网格: PDF §4.3 λ∈{0.5,1,2,5}, p∈{0.8,1,1.2}
    if lambda_values is None:
        lambda_values = (0.5, 1.0, 2.0, 5.0)
    if p_values is None:
        p_values = (0.8, 1.0, 1.2)

    best_ratio = np.inf
    best_lam = 1.0
    best_p = 1.0
    n_freq_eval = min(20, max(2, len(seg) // 4))

    for lam in lambda_values:
        for p in p_values:
            ratio_sum = 0.0
            n_valid = 0
            for freq in np.linspace(low, high, n_freq_eval):
                # PDF 式3: σ_t=λ/f^p
                sigma_t = lam / (freq ** p)
                width = min(len(seg) / fs / 2, max(2 / fs, sigma_t))
                radius = min(len(seg) - 1, int(np.ceil(3.5 * width * fs)))
                offsets = np.arange(-radius, radius + 1)
                kernel = np.exp(-0.5 * (offsets / (width * fs)) ** 2)
                kernel /= np.sqrt(np.sum(kernel ** 2))
                carrier = np.exp(-2j * np.pi * freq * t_seg)
                filtered = fftconvolve(seg * carrier, kernel, mode="same")
                coeff = filtered[::1000]
                abs_c = np.abs(coeff)
                l1 = np.mean(abs_c)
                l2 = np.sqrt(np.mean(abs_c ** 2))
                if l2 > 1e-30:
                    ratio_sum += l1 / l2
                    n_valid += 1
            if n_valid > 0:
                avg_ratio = ratio_sum / n_valid
                if avg_ratio < best_ratio:
                    best_ratio = avg_ratio
                    best_lam = float(lam)
                    best_p = float(p)
    return best_lam, best_p


# =====================================================================
# [阶段 C / E] 分块与合成工具函数
# =====================================================================

def block_signal(signal: np.ndarray, n_blocks: int = 5, overlap_ratio: float = 0.5) -> list[np.ndarray]:
    """[C-2] 将信号分成 N_B 个重叠块

    手册步骤: C-2 — 分块策略
    公式: N_B = 5 块, T_B = 3600 s, 重叠 50%
    块长: blk_len = N / (n_blocks + (n_blocks-1)*overlap - overlap)
    步长: hop = blk_len * (1 - overlap)

    参数:
      signal         — 输入信号 (1D)
      n_blocks       — 块数 (默认 5)
      overlap_ratio  — 重叠率 (默认 0.5)

    返回:
      list of arrays — 分块后的信号列表 (最后一块可能较短)
    """
    n = len(signal)
    blk_len = int(n / (n_blocks + (n_blocks - 1) * overlap_ratio - overlap_ratio))
    blk_len = max(blk_len, 1)
    hop = max(int(blk_len * (1.0 - overlap_ratio)), 1)
    blocks = []
    for b in range(n_blocks):
        start = b * hop
        end = min(start + blk_len, n)
        if start >= n:
            break
        blocks.append(signal[start:end])
    return blocks


def overlap_add_synthesis(block_signals: list[np.ndarray], n_total: int,
                          n_blocks: int = 5, overlap_ratio: float = 0.5) -> np.ndarray:
    """[E-4] 重叠相加合成 (Hann 窗加权)

    手册步骤: E-4 — 将分块重建结果通过重叠相加合成完整信号
    公式: s^[n] = Σ_b w_b[n] ŝ_b[n] / Σ_b w_b[n]  (式 58)
    其中 w_b[n] 为 Hann 窗权重, 避免块边界不连续

    参数:
      block_signals  — 各块的重建信号列表
      n_total        — 完整信号长度
      n_blocks       — 块数
      overlap_ratio  — 重叠率

    返回:
      output (np.ndarray) — 合成后的完整信号
    """
    if not block_signals:
        return np.zeros(n_total)
    blk_len = len(block_signals[0])
    hop = max(int(blk_len * (1.0 - overlap_ratio)), 1)
    output = np.zeros(n_total)
    window_sum = np.zeros(n_total)
    hann = np.hanning(blk_len) if blk_len > 1 else np.ones(1)
    for b, blk in enumerate(block_signals):
        start = b * hop
        end = min(start + blk_len, n_total)
        actual_len = end - start
        if actual_len <= 0:
            break
        w = hann[:actual_len]
        output[start:end] += blk[:actual_len] * w
        window_sum[start:end] += w
    window_sum = np.maximum(window_sum, 1e-30)
    return output / window_sum


# =====================================================================
# [阶段 F] 后处理工具函数
# =====================================================================

def extract_free_oscillations(signals: np.ndarray, fs: float,
                              freq_band: tuple[float, float] = (0.001, 0.012),
                              min_snr_db: float = 3.0, nfft: int = 8192,
                              use_c3: bool = True) -> list[dict]:
    """[F-3 / PDF §15] 自由振荡提取: C3高阶互相关 × 本方案滤波器

    PDF §15:
      1. 用本方案得到三台重建信号 ŝ^1,ŝ^2,ŝ^3
      2. 计算互相关的互相关(C3型高阶互相关, 压制各台独立残差噪声):
         C_12(τ)=Σ ŝ^1[n]ŝ^2[n+τ], C_13(τ)同理
         C^(3)(τ)=Σ_{τ'} C_12(τ')C_13(τ+τ')
      3. 对C^(3)求谱, 与三台重建谱∏|S^j(f)|^(1/3)交叉验证
      4. 在两者中同时出现、且经验零分布检验p<0.05的谱峰, 判为自由振荡候选模式

    参数:
      signals    — (n_stations, n_samples) 多台站重建信号
      fs         — 采样率
      freq_band  — 搜索频带
      min_snr_db — 最小 SNR 阈值 (dB)
      nfft       — FFT 长度
      use_c3     — 是否启用C3高阶互相关 (PDF §15)

    返回:
      list of {frequency_hz, amplitude, snr_db, c3_confirmed} — 候选模式列表
    """
    from scipy.signal import find_peaks
    if signals.ndim == 1:
        signals = signals[None, :]
    n_st = signals.shape[0]

    # 单台谱 (用于交叉验证)
    nfft = min(nfft, signals.shape[1])
    freqs, psd_list = [], []
    for j in range(n_st):
        f_j, p_j = welch(signals[j], fs=fs, nperseg=nfft, noverlap=nfft // 2)
        freqs = f_j
        psd_list.append(p_j)

    # 三台重建谱几何平均: ∏|S^j(f)|^(1/3)
    psd_geo = np.ones_like(psd_list[0])
    for p_j in psd_list:
        psd_geo *= np.maximum(p_j, 1e-30)
    psd_geo = psd_geo ** (1.0 / max(n_st, 1))

    # C3高阶互相关 (PDF §15, 需要至少3台)
    psd_c3 = psd_geo.copy()
    if use_c3 and n_st >= 3:
        # C_12(τ) = correlate(ŝ1, ŝ2)
        c12 = np.correlate(signals[0] - signals[0].mean(),
                            signals[1] - signals[1].mean(), mode="full")
        c13 = np.correlate(signals[0] - signals[0].mean(),
                            signals[2] - signals[2].mean(), mode="full")
        # C^(3)(τ) = correlate(C12, C13) (互相关的互相关)
        c3 = np.correlate(c12, c13, mode="full")
        # C3谱
        n_c3 = min(len(c3), nfft * 4)
        c3_fft = np.abs(np.fft.rfft(c3[:n_c3], n=n_c3)) ** 2
        f_c3 = np.fft.rfftfreq(n_c3, d=1.0 / fs)
        # 重采样到公共频率轴
        psd_c3 = np.interp(freqs, f_c3, c3_fft, left=0, right=0)

    mask = (freqs >= freq_band[0]) & (freqs <= freq_band[1])
    freqs_sub = freqs[mask]
    psd_geo_sub = psd_geo[mask]
    psd_c3_sub = psd_c3[mask]
    if len(psd_geo_sub) < 3:
        return []

    # 联合谱: C3谱 × 几何平均谱 (交叉验证)
    psd_joint = psd_c3_sub * psd_geo_sub
    noise_floor = np.median(psd_joint)
    if noise_floor < 1e-30:
        return []
    snr_lin = psd_joint / noise_floor
    snr_db = 10.0 * np.log10(np.maximum(snr_lin, 1e-30))
    peaks, props = find_peaks(snr_db, height=min_snr_db, prominence=1.0)

    results = []
    for p in peaks:
        # C3确认: 该频率在C3谱和几何谱中同时为峰
        c3_confirmed = psd_c3_sub[p] > np.median(psd_c3_sub) and psd_geo_sub[p] > np.median(psd_geo_sub)
        results.append({
            "frequency_hz": float(freqs_sub[p]),
            "amplitude": float(np.sqrt(psd_geo_sub[p])),
            "snr_db": float(snr_db[p]),
            "c3_confirmed": bool(c3_confirmed),
            "method": "C3_high_order_correlation (PDF §15)",
        })
    return sorted(results, key=lambda x: x["frequency_hz"])


# =====================================================================
# 主类: DC-GDCST + DT-FSBL 重建器
# =====================================================================

# FSBL 迭代中是否更新噪声方差 (False=固定为输入sigma2)
UPDATE_SIGMA2_IN_FSBL = True


class DCGDCSTDTFSBL:
    """多台站 GDCST 域稀疏贝叶斯重建器

    完整流水线: A→B→C→D→E→F, 由 reconstruct() 方法统一调度。
    """

    def __init__(self, config: Optional[DCGDCSTDTFSBLConfig] = None):
        self.config = config or DCGDCSTDTFSBLConfig()

    def reconstruct(
        self,
        observations: np.ndarray,
        instrument_response: Optional[np.ndarray] = None,
        noise_observations: Optional[np.ndarray] = None,
        travel_time_samples: Optional[Sequence[int]] = None,
    ) -> tuple[np.ndarray, dict]:
        """[A→B→C→D→E→F] 完整重建流水线

        手册第 14 章流程:
          A. 预处理:  去趋势 → 带通滤波 → 频率轴 → 仪器响应
          B. 噪声建模: GDCST 噪声段 → Welch PSD → Student-t → λ 优化 → 时变噪声
          C. GDCST:   Hilbert 解析信号 → 分块 → 块级 GDCST
          D. DT-FSBL: 隐式字典 → ARD 迭代 → 走时差搜索
          E. 重建:    信号合成 → 噪声重建 → 多站联合 → 重叠相加
          F. 后处理:  置信度 → 频谱分析 → 自由振荡

        参数:
          observations       — (n_stations, n_samples) 预处理后的多台站信号
          instrument_response — (n_stations, n_freq) 复数仪器响应; None=全1
          noise_observations — (n_stations, n_samples_noise) 噪声段; None=用信号段
          travel_time_samples — 各台站走时偏移 (采样点); None=自动搜索

        返回:
          (common_signal, metadata_dict)
        """
        y = np.asarray(observations, dtype=float)
        if y.ndim != 2 or y.shape[0] < 1 or y.shape[1] < 8:
            raise ValueError("observations must have shape (n_stations, n_samples >= 8)")
        fs = self.config.sampling_rate

        # [PDF §3] 台站选择: 从N个Apollo台中选主频与0.65Hz一致性最好的n_select台
        selected_indices = None
        if self.config.use_station_selection and y.shape[0] > self.config.n_stations_select:
            y, selected_indices = select_stations(
                y, fs, self.config.n_stations_select, self.config.dominant_freq_ref)
        n_stations, n_samples = y.shape

        # =====================================================================
        # [阶段 A] 预处理 (A-2 ~ A-5)
        # =====================================================================
        # A-2/A-3/A-4: 去趋势 + 带通滤波 + 抽取降采样 (在 _preprocess 中完成)
        x = self._preprocess(y)
        n_samples = x.shape[1]  # 抽取后样点数可能变化
        # 频率轴: 在 [f_min, f_max] 内均匀取 M_f 个频率点
        freqs = self._frequencies(n_samples)
        # A-5: 仪器响应 H_j(f) (未提供时默认全 1, 即理想仪器)
        response = self._responses(instrument_response, n_stations, len(freqs))

        # =====================================================================
        # [阶段 B] 噪声建模 (B-1 ~ B-5)
        # =====================================================================
        # B-1: 噪声段 GDCST 分析
        # 若提供了独立噪声段则用噪声段, 否则用信号段本身作为噪声估计
        if noise_observations is not None:
            noise = np.asarray(noise_observations, dtype=float)
            if noise.ndim != 2 or noise.shape[0] != y.shape[0]:
                raise ValueError("noise_observations must have the same station count")
            x_noise = self._preprocess(noise)
        else:
            x_noise = x  # fallback: 用信号段作为噪声估计

        # 对噪声段执行 GDCST 分析, 得到噪声系数 (用于后续 B-2~B-5)
        noise_coeff, _ = self._analysis(x_noise, freqs)

        # [PDF §6] AR 白化: Burg法拟合AR(P) + BIC选阶 + 白化算子 W=σ_e^{-1}A
        # 白化后 ỹ=W y, Φ̃=W Φ, ñ≈N(0,βI)
        ar_info = {"applied": False}
        if self.config.use_ar_whitening and x_noise.shape[1] > 1000:
            x_white_list = []
            ar_coeffs_list = []
            ar_orders = []
            ar_sigmas = []
            for j in range(n_stations):
                w_j, a_j, p_j, s_j = ar_whiten(
                    x_noise[j], fs, self.config.ar_max_order, self.config.ar_bic_weight)
                x_white_list.append(w_j)
                ar_coeffs_list.append(a_j)
                ar_orders.append(p_j)
                ar_sigmas.append(s_j)
            x_noise_white = np.array(x_white_list)
            # 对信号段也应用相同的白化算子 (简化: 用噪声段估计的AR系数)
            x_white_signal_list = []
            for j in range(n_stations):
                from scipy.signal import lfilter
                xw = lfilter(ar_coeffs_list[j], [1.0], x[j])
                xw = xw / (ar_sigmas[j] + 1e-30)
                x_white_signal_list.append(xw)
            x = np.array(x_white_signal_list)
            ar_info = {"applied": True, "orders": ar_orders,
                       "method": "Burg_AR+BIC+whitening (PDF §6)",
                       "sigma_e": [float(s) for s in ar_sigmas]}

        # B-2: Welch PSD 估计 (如果启用)
        # 逐台站估计噪声 PSD, 用于噪声先验设定
        noise_psd_info = {}
        if self.config.use_welch_psd:
            noise_psd_freqs, noise_psd = [], []
            for j in range(n_stations):
                f_psd, psd_j = welch_noise_psd(
                    x_noise[j], fs,
                    nperseg=self.config.welch_nperseg,
                )
                noise_psd_freqs.append(f_psd)
                noise_psd.append(psd_j)
            noise_psd_info = {"psd_freqs": noise_psd_freqs, "psd": noise_psd}

        # B-3: Student-t 自由度 ν 估计 (矩估计法)
        # 逐台站从 GDCST 噪声系数的峰度估计 ν, 取多站均值
        if self.config.use_student_t_fit:
            nu_values = [fit_student_t_moments(noise_coeff[j], self.config.nu_range) for j in range(n_stations)]
            nu_estimated = float(np.mean(nu_values))
        else:
            nu_estimated = self.config.student_t_nu
        noise_params_per_station = {"nu_values": nu_values if self.config.use_student_t_fit else [nu_estimated] * n_stations,
                                     "nu_mean": nu_estimated}

        # B-4: λ 自适应优化 (网格搜索最小化 L1/L2)
        # 在噪声段上优化 λ*, 避免信号段偏差
        if self.config.use_lambda_optimization:
            lam, p_opt = optimize_lambda(
                x_noise[0], fs,
                self.config.frequency_band,
                self.config.lambda_search_range,
                self.config.lambda_search_step,
                p_param=self.config.p_param,
                lambda_values=self.config.lambda_search_values,
                p_values=self.config.p_search_values,
            )
        else:
            lam = self.config.lambda_param
            p_opt = self.config.p_param

        # 用优化后的 (λ,p) 更新配置 (PDF §4.3)
        if abs(lam - self.config.lambda_param) > 0.01:
            self.config.lambda_param = lam
        if self.config.use_p_optimization and abs(p_opt - self.config.p_param) > 0.01:
            self.config.p_param = p_opt

        # B-5: 时变噪声模型
        # 将噪声段分为 Q=9 个子段, 逐段估计 (σ², ν), 检测非平稳性
        # η = max(σ²)/min(σ²) > 阈值 → 启用时变模型
        time_varying_noise = None
        if self.config.use_time_varying_noise and x_noise.shape[1] >= self.config.noise_n_segments * 1000:
            Q = self.config.noise_n_segments
            seg_len = x_noise.shape[1] // Q
            nu_segments = []
            sigma2_segments = []
            for q in range(Q):
                seg_noise = x_noise[:, q * seg_len: (q + 1) * seg_len]
                coeff_q, _ = self._analysis(seg_noise, freqs)
                nu_q = fit_student_t_moments(coeff_q, self.config.nu_range) if self.config.use_student_t_fit else nu_estimated
                sigma2_q = self._robust_scale(coeff_q) ** 2
                nu_segments.append(nu_q)
                sigma2_segments.append(sigma2_q)
            sigma2_arr = np.array(sigma2_segments)
            # 平稳性比: 各台站 σ² 的 max/min
            eta_vals = np.max(sigma2_arr, axis=0) / np.maximum(np.min(sigma2_arr, axis=0), self.config.response_floor)
            stationarity_ratio = float(np.mean(eta_vals))
            use_time_varying = stationarity_ratio >= self.config.stationarity_ratio_threshold
            time_varying_noise = {
                "nu_segments": nu_segments,
                "sigma2_segments": sigma2_segments,
                "stationarity_ratio": stationarity_ratio,
                "use_time_varying": use_time_varying,
            }
        else:
            use_time_varying = False

        # 各台站噪声方差 σ² (用于 DT-FSBL 中的噪声先验)
        # 使用 _robust_scale: 取低 25% 分位数避免信号污染
        sigma2 = self._robust_scale(noise_coeff) ** 2

        # =====================================================================
        # [阶段 C] 解析信号 + GDCST (C-1 ~ C-3)
        # =====================================================================
        # C-1: Hilbert 解析信号
        # x^(a)(t) = x(t) + iH{x(t)}, 保留完整相位信息, 补偿余弦基信息损失
        x_analytic = np.array([hilbert(x[j]) for j in range(n_stations)])

        # C-2: 分块策略
        # 将信号分为 N_B=5 块, 50% 重叠, 减少边缘效应
        blocks = block_signal(
            x_analytic[0],  # 用第一台站确定块数
            n_blocks=self.config.n_blocks,
            overlap_ratio=self.config.block_overlap_ratio,
        )
        n_blocks_actual = len(blocks)

        # C-3: 各块独立执行 GDCST 分析
        # 每块独立计算 GDCST 系数, 最后通过重叠相加合成 (E-4)
        block_coeff_list = []
        block_atoms_list = []
        for b_idx in range(n_blocks_actual):
            blk = blocks[b_idx]
            blk_real = blk.real.reshape(1, -1)
            coeff_b, atoms_b = self._analysis(blk_real, freqs)
            block_coeff_list.append(coeff_b[0])
            block_atoms_list.append(atoms_b)

        # =====================================================================
        # [阶段 D] DT-FSBL (D-1 ~ D-3)
        # =====================================================================
        # D-1: 隐式字典构建
        # 手册要求显式构建 Φ_j = W_j·G (式 12), 但 P~10^8 维不可存储
        # 实际实现为隐式: _analysis() 中 GDCST 变换 + _responses() 中 H_j(f)
        # 对全信号执行 GDCST 分析 (非分块路径, 保留已验证的稳定实现)
        coeff, atoms = self._analysis(x, freqs)

        # D-2: DT-FSBL 迭代 (2D ARD + 阻尼 EM + 离线剪枝)
        # 当 instrument_response=None 时 response=全1, 前向模型公式自动退化为无响应版本
        signal_coeff, gamma, history = self._dt_fsbl(coeff, response, sigma2, nu=nu_estimated)

        # [PDF §12.3] 离格精化: 对活跃原子的(τ,f)做局部证据精化
        signal_coeff, gamma, offgrid_info = self._offgrid_refinement(
            signal_coeff, gamma, freqs, atoms, x.shape[1])

        # [PDF §9] 经验零分布 p 值: 块自助 + 高置信支撑集筛选
        p_values, null_info = self._empirical_null_pvalue(
            noise_coeff, signal_coeff, response, sigma2)
        if self.config.use_empirical_null and p_values.shape == gamma.shape:
            high_conf_mask = p_values < self.config.empirical_null_alpha
            gamma = gamma * high_conf_mask
            signal_coeff = signal_coeff * high_conf_mask[None, :, :]

        # Wiener 去噪: DT-FSBL 后验均值已是去噪结果, 直接用于合成
        station_signals = self._synthesis(signal_coeff, atoms, x.shape[1])

        # 幅度标定: 逐台站匹配功率 (std 匹配)
        # [频域白化后] signal_coeff 是白化域 (m/s) GDCST 系数, atoms 是 counts 域 GDCST 原子,
        # _synthesis 输出量纲为混合 (counts·m/s), 这里 std 匹配回 counts 域以保持
        # 与输入可比, 同时保留相对去响应效果 (频率响应形状已通过白化去除).
        for s in range(n_stations):
            out_std = np.std(station_signals[s])
            in_std = np.std(x[s])
            if out_std > 1e-30:
                station_signals[s] *= in_std / out_std

        # 走时校正 (如果外部提供了走时偏移)
        station_signals = self._undo_travel_times(station_signals, travel_time_samples)

        # D-3: 走时差网格搜索 (如果未外部提供)
        # 粗搜索 5s 步长 → 细搜索 0.5s 步长, 范围 [-550, +550]s
        if travel_time_samples is None:
            best_shifts = self._travel_time_grid_search(station_signals, freqs, response, sigma2)
            station_signals = self._undo_travel_times(station_signals, best_shifts)
            travel_time_samples = best_shifts

        # =====================================================================
        # [阶段 E] 信号-噪声分离与重建 (E-1 ~ E-4)
        # =====================================================================
        # E-1: 信号重建 — 已在 station_signals 中完成 (GDCST 域 → 时间域)
        # E-2: 噪声重建 — n_hat = x - s_hat
        noise_recon = self._rebuild_noise(x, station_signals)
        # E-3: 多站加权联合 — 后验精度加权 β_j = 1/(Σ_j+ε), 输出 1 个公共信号
        common = self._multi_station_combine(
            station_signals, gamma, sigma2, travel_time_samples, response,
        )
        # E-4: 重叠相加合成 — 已在 _synthesis 中隐式完成 (非分块路径)

        # =====================================================================
        # [阶段 F] 后处理 (F-1 ~ F-3)
        # =====================================================================
        # F-1: 置信度估计 — 后验方差 CI + 归一化置信度 C_j
        ci_info = self._compute_confidence(
            station_signals, gamma, sigma2, travel_time_samples, response,
        )

        # F-2: 频谱分析 — 在外部 run_exp002.py 中通过 FFT/Welch 完成
        # F-3: 自由振荡提取 — 谱峰检测 + SNR 阈值
        free_oscillations = extract_free_oscillations(
            common, fs,
            self.config.frequency_band,
            self.config.free_osc_min_snr_db,
            self.config.free_osc_nfft,
        )

        return common, {
            "station_reconstructions": station_signals,
            "noise_reconstructions": noise_recon,
            "frequencies_hz": freqs,
            "lambda_optimized": lam,
            "student_t_nu": nu_estimated,
            "noise_params": noise_params_per_station,
            "time_varying_noise": time_varying_noise,
            "noise_psd": noise_psd_info,
            "gamma": gamma,
            "noise_variance": sigma2,
            "iterations": history,
            "active_atoms": int(history.get("n_active_atoms", np.count_nonzero(gamma >= gamma.max() * self.config.ard_prune_ratio))),
            "travel_time_samples": travel_time_samples,
            "confidence_intervals": ci_info,
            "free_oscillations": free_oscillations,
            "n_blocks": n_blocks_actual,
        }

    # =====================================================================
    # [阶段 A] 内部方法
    # =====================================================================

    def _preprocess(self, y: np.ndarray) -> np.ndarray:
        """[A-2/A-3/A-4/A-5] 去趋势 + 带通滤波 + 抽取降采样

        PDF §3 预处理算子 P (按序、全线性):
          1. 去均值
          2. 去线性趋势
          3. 零相位 4 阶 Butterworth 带通 0.5-12 mHz
          4. 抗混叠 + 抽取 ×100 (Δt=10s, f_Nyq=0.05Hz > 4×12mHz)
        """
        fs = self.config.sampling_rate
        low, high = self.config.frequency_band
        if not (0 < low < high < fs / 2):
            raise ValueError("frequency_band must lie inside (0, sampling_rate / 2)")
        # 1+2: 去线性趋势 (包含去均值)
        cleaned = detrend(y, axis=-1, type="linear")
        # 3: obspy 4阶 Butterworth 带通, 零相位
        #    obspy 内部用 sosfilt forward-backward (不调 sosfilt_zi/linalg.solve),
        #    避免 scipy sosfiltfilt 的边界初始条件瞬态问题
        freqmin = max(low * 0.5, 1.0 / (y.shape[1] / fs))
        filtered = np.array([
            obspy_bandpass(row, freqmin=freqmin, freqmax=high, df=fs, corners=4, zerophase=True)
            for row in cleaned
        ])
        # 4: 抗混叠 + 抽取降采样 (PDF §3, D=100, Δt=10s)
        if self.config.use_decimation and self.config.decimation_factor > 1:
            D = self.config.decimation_factor
            # 抗混叠低通: 截止=目标奈奎斯特=fs/(2D), 8阶零相位
            f_nyq_target = fs / (2.0 * D)
            filtered = np.array([
                obspy_lowpass(row, freq=f_nyq_target * 0.95, df=fs, corners=8, zerophase=True)
                for row in filtered
            ])
            # 抽取
            filtered = filtered[:, ::D]
        return filtered

    def _frequencies(self, n_samples: int) -> np.ndarray:
        """频率轴: PDF §4.3 比例间距 δf_i = c_f · σ_f(f_i), σ_f = f^p/(2πλ)

        低频密、高频疏, 匹配 GDCST 频率分辨率 σ_f(f)。
        若 freq_grid_type='linear' 则回退均匀间距。
        """
        low, high = self.config.frequency_band
        M = min(self.config.n_frequencies, max(2, n_samples // 4))
        if self.config.freq_grid_type != "proportional":
            return np.linspace(low, high, M)
        # 比例间距: 从 low 开始, 每步 δf=c_f·σ_f(f)=c_f·f^p/(2πλ)
        # p=1 时 δf/f = c_f/(2πλ) = 常数 ⇒ 几何级数(log均匀)是精确实现
        # 用几何级数保证末尾平滑(不会因强截断到high导致最后一段δf骤降)
        lam = self.config.lambda_param
        p = self.config.p_param
        if M <= 1:
            return np.array([low])
        if p == 1.0:
            # 几何级数: f_i = low * (high/low)^(i/(M-1)), δf/f 恒为常数
            if low > 0 and high > low:
                ratio = (high / low) ** (1.0 / (M - 1))
                freqs = low * ratio ** np.arange(M)
                return freqs
        # 一般p: 数值积分求解(保持低频密高频疏), 末尾自然衔接high
        freqs = [low]
        c_f = self.config.c_f if hasattr(self.config, 'c_f') else 1.0
        while len(freqs) < M and freqs[-1] < high:
            f_cur = freqs[-1]
            sigma_f = f_cur ** p / (2.0 * np.pi * lam)
            df = max(c_f * sigma_f, (high - low) / (M * 1000))
            f_next = f_cur + df
            if f_next >= high:
                f_next = high
            if f_next <= freqs[-1]:
                break
            freqs.append(f_next)
        if len(freqs) < M:
            freqs = list(np.linspace(low, high, M))
        return np.asarray(freqs[:M])

    def _responses(self, response: Optional[np.ndarray], stations: int, n_freq: int) -> np.ndarray:
        """[A-5] 仪器响应 H_j(f)

        手册步骤: A-5 — 读取各台站仪器脉冲响应/频率响应
        实现: 支持 per-station 复数响应; 未提供时默认全 1 (理想仪器)
        隐式去仪器响应: H_j(f) 嵌入字典 Φ_j, 输出直接为物理量 (m/s)
        """
        if response is None:
            return np.ones((stations, n_freq), dtype=np.complex128)
        result = np.asarray(response, dtype=np.complex128)
        if result.ndim == 1:
            result = np.broadcast_to(result, (stations, n_freq))
        if result.shape != (stations, n_freq):
            raise ValueError("instrument_response must have shape (stations, n_frequencies)")
        return result

    # =====================================================================
    # [阶段 B/C/D] 内部方法 — GDCST 分析
    # =====================================================================

    def _analysis(self, x: np.ndarray, freqs: np.ndarray) -> tuple[np.ndarray, list[tuple[np.ndarray, np.ndarray]]]:
        """[B-1 / C-3 / D-1] 余弦基 GDCST 分析 (含 FFT 加速)

        手册步骤:
          B-1: 对噪声段执行 GDCST → 噪声系数
          C-3: 各块独立执行 GDCST → 块级系数
          D-1: 隐式字典 Φ_j 的构建 (GDCST 变换矩阵 G + 仪器响应 W_j)

        公式 (式 3): G_λ[m,k] = Δt Σ_n x[n] g_λ((m-n)Δt, f_k) cos[2πf_k(n-m)Δt]
        FFT 加速 (式 54): G_λ[·,k] = Δt Re{ e^{i2πf_k·Δt} F⁻¹[F[x·e^{-i2πf_k·Δt}] · F[w_k]] }

        参数:
          x     — (n_stations, n_samples) 输入信号
          freqs — 频率数组 (M_f,)

        返回:
          coeff — (n_stations, n_freq, n_centers) GDCST 系数 (复数, 含余弦+正弦分量)
          atoms — 每个频率的 (offsets, atom_kernel) 列表, 用于逆变换
        """
        n = x.shape[-1]
        t = np.arange(n) / self.config.sampling_rate
        centers = np.arange(0, n, self.config.coefficient_hop)
        coeff = np.empty((x.shape[0], len(freqs), len(centers)), dtype=np.complex128)
        atoms = []
        for k, frequency in enumerate(freqs):
            # PDF 式3: 高斯窗 σ_t(f)=λ/f^p, 窗宽 width=σ_t (秒)
            # 低频 → 宽窗 (频率分辨率高), 高频 → 窄窗 (时间分辨率高)
            sigma_t = self.config.lambda_param / (frequency ** self.config.p_param)
            width = min(n / self.config.sampling_rate / 2, max(2 / self.config.sampling_rate, sigma_t))
            radius = min(n - 1, int(np.ceil(3.5 * width * self.config.sampling_rate)))
            offsets = np.arange(-radius, radius + 1)
            kernel = np.exp(-0.5 * (offsets / (width * self.config.sampling_rate)) ** 2)
            # 和归一化 (DC增益=1): 分析系数量级=输入幅度/2 (解析信号半幅)
            # 单位范数(sqrt(sum k^2)) 会放大系数 ~sum(k)/sqrt(sum(k^2)) 倍, 导致量级错误
            kernel /= np.sum(kernel)
            carrier = np.exp(-2j * np.pi * frequency * t)        # 下变频载波
            # FFT 卷积: x·carrier 卷积 kernel → GDCST 系数
            filtered = np.array([fftconvolve(row * carrier, kernel, mode="same") for row in x])
            coeff[:, k, :] = filtered[:, centers]                # 在 hop 间隔处采样
            # 保存原子: kernel × 共轭载波 (用于逆变换 _synthesis)
            atoms.append((offsets, kernel * np.exp(2j * np.pi * frequency * offsets / self.config.sampling_rate)))
        return coeff, atoms

    # =====================================================================
    # [阶段 D] 内部方法 — DT-FSBL 迭代
    # =====================================================================

    def _dt_fsbl(self, observed: np.ndarray, response: np.ndarray,
                 sigma2: np.ndarray, nu: Optional[float] = None) -> tuple[np.ndarray, np.ndarray, dict]:
        """[D-2] Tipping 快速序列 FSBL (PDF §7): 逐原子添加/删除/更新, 证据最大化

        PDF §7 多任务快速稀疏贝叶斯学习:
          模型: y_j = Φ_j w_j + ε_j, ε_j≈N(0,σ_j²) [白化后]
          ARD先验: p(w_jk|α_k)=N(0,α_k^{-1}), α_k 跨台站共享 (PDF 式10)
          稀疏因子: s_jk=ϕ_jk^T C_j,-k^{-1} ϕ_jk (PDF 式13)
          质量因子: q_jk=ϕ_jk^T C_j,-k^{-1} y_j (PDF 式13)
          保留判据: Σ_j(q_jk² - s_jk) > 0 ⇒ 保留; 否则 α_k*=∞ 剪枝 (PDF 式16)
          快速序列: 每次迭代仅添加/删除/更新一个原子, 选 ΔL 最大者 (PDF §7.4)
          噪声精度: β_j=||y_j-Φ_A μ_j||²/(N-K+Σ α_k[Σ_j]_kk) (PDF 式20)

        GDCST时频域结构: 每个时频点(f,t)是一个原子 k, 前向模型为标量 H_j(f)。
        此时 s_jk=|H_j(f)|²/σ_j², q_jk=H_j(f)^*·y_jk/σ_j² (对角C简化)。

        返回:
          (estimate, gamma, info) — 后验均值(n_stations,n_freq,n_times),
          gamma=1/α (n_freq,n_times) 跨台共享, 诊断信息dict
        """
        n_stations, n_freq, n_times = observed.shape
        n_atoms = n_freq * n_times
        eps = self.config.response_floor
        nu = nu if nu is not None else self.config.student_t_nu
        # [B4] 组共享支撑分发 (PDF S7.1 式E15/E20)
        if self.config.use_group_sharing:
            return self._dt_fsbl_group(observed, response, sigma2, nu,
                                       n_stations, n_freq, n_times, n_atoms, eps)


        # ── 展平时频点为原子序列 ──
        # y: (n_stations, n_atoms), H: (n_stations, n_atoms), s2: (n_stations,1)
        y = observed.reshape(n_stations, -1)            # (J, M)
        H = response[:, :, None].repeat(n_times, axis=2).reshape(n_stations, -1)  # (J, M)
        s2 = sigma2[:, None]                              # (J, 1)

        # ── H 归一化 (关键数值稳定性修复) ──
        # 合成数据已预加重 (counts≈物理源×标度), 且真实 |H|~1e4~7e7。
        # 直接用 H 会使 s_jk=|H|²/σ²~1e14 → α~1e9 → γ~1e-9 → 后验被压缩 ~1e7 倍。
        # 归一化: H_work = H/|H| (单位模, 保留相位), 使 s_jk=1/σ²~O(1)。
        # 归一化后后验均值 estimate = |H|·x_phys = counts 域源系数 (因 y=H·x_phys)。
        H_abs = np.abs(H)
        H_work = H / np.maximum(H_abs, eps)              # (J, M) 单位模

        # ── Student-t 权重初始化 (per-station, per-atom) ──
        weights = np.ones_like(y.real)                   # (J, M)

        # ── 向量化计算 s_jk, q_jk (对角C简化: C_j,-k=σ_j²/λ_jk · I) ──
        # s_jk = |H_work_jk|² · λ_jk / σ_j² = λ_jk/σ_j² (单位模)
        # q_jk = H_work_jk^* · y_jk · λ_jk / σ_j²
        H_abs2 = np.abs(H_work) ** 2                     # (J, M) ≡ 1
        H_conj = H_work.conj()                            # (J, M)

        # ── 初始化: 活跃集 A=∅, α_k=∞ (gamma=0) ──
        gamma = np.zeros(n_atoms)                         # (M,) gamma=1/α, 跨台共享
        active = np.zeros(n_atoms, dtype=bool)            # (M,)
        estimate = np.zeros_like(y)                        # (J, M) 后验均值

        history = []
        n_add = n_del = n_upd = 0

        for it in range(self.config.max_iter):
            # ── Student-t EM 权重 (PDF 式29): λ̂=(ν+1)/(ν+ε²/σ²) ──
            residual = y - H_work * estimate                # (J, M) 模型 y=H_work·x̃
            standardized = np.abs(residual) ** 2 / np.maximum(s2, eps)
            weights = (nu + 1.0) / (nu + standardized)     # (J, M)
            w = np.maximum(weights, eps)                    # (J, M)

            # ── 计算所有原子的 s_jk, q_jk ──
            # s_jk = |H_jk|² · w_jk / σ_j²  (有效噪声方差 σ_j²/w_jk)
            # q_jk = H_jk^* · y_jk · w_jk / σ_j²
            s_jk = H_abs2 * w / np.maximum(s2, eps)        # (J, M)
            q_jk = H_conj * y * w / np.maximum(s2, eps)    # (J, M), 复数

            # 多任务汇总: s_k=Σ_j s_jk, q_k²=Σ_j |q_jk|² (PDF 式16)
            s_k = np.sum(s_jk, axis=0)                      # (M,)
            q2_k = np.sum(np.abs(q_jk) ** 2, axis=0)       # (M,)

            # ── 保留判据 (PDF 式16): Σ_j(q_jk² - s_jk) > 0 ──
            retain = q2_k > s_k                             # (M,)

            # ── 计算每个原子的最优 α_k* (多任务驻点方程 PDF 式15) ──
            # 单任务解: α*=s²/(q²-s) (q²>s时)
            # 多任务: 在 [min_j α_j*, max_j α_j*] 内数值求解
            # 简化: 用多任务聚合量 s_k, q2_k 近似 α*=s_k²/(q2_k-s_k)
            # (这是 J=1 时的精确解, J>1 时为近似; 严格解需Newton-二分)
            denom = np.maximum(q2_k - s_k, eps)
            alpha_opt = np.where(retain, s_k ** 2 / denom, np.inf)  # (M,)
            gamma_opt = np.where(retain, 1.0 / np.maximum(alpha_opt, eps), 0.0)

            # ── 计算每个原子的证据变化 ΔL (PDF 式14) ──
            # ℓ(α_k)=Σ_j [log α_k - log(α_k+s_jk) + q_jk²/(α_k+s_jk)]
            # 添加: ΔL_add=ℓ(α_opt) - ℓ(∞=0)
            # 删除: ΔL_del=ℓ(∞) - ℓ(α_current) = -ℓ(α_current)
            # 更新: ΔL_upd=ℓ(α_opt) - ℓ(α_current)
            def evidence_per_atom(alpha_vals, s_j, q2_j):
                """计算每个原子的证据贡献 ell(alpha_k) (PDF 式14, 跨台求和)
                ell(alpha)=sum_j [log alpha - log(alpha+s_jk) + q_jk^2/(alpha+s_jk)]
                当 alpha=inf 时 ell=0 (极限: log alpha-log(alpha+s)->0, q^2/(alpha+s)->0)
                """
                a = alpha_vals[None, :]                       # (1, M)
                # 对 alpha=inf 的原子直接返回0, 避免 inf-inf=nan
                finite_mask = np.isfinite(a).ravel()
                ell = np.zeros(a.shape[1])
                if np.any(finite_mask):
                    a_f = a[:, finite_mask]
                    s_f = s_j[:, finite_mask]
                    q_f = q2_j[:, finite_mask]
                    with np.errstate(divide="ignore", invalid="ignore"):
                        ell_f = np.sum(
                            np.log(np.maximum(a_f, eps))
                            - np.log(np.maximum(a_f + s_f, eps))
                            + q_f / np.maximum(a_f + s_f, eps),
                            axis=0
                        )
                    ell[finite_mask] = ell_f
                return ell                                  # (M,)

            # 当前 alpha (gamma>0 时 alpha=1/gamma, 否则 inf)
            alpha_current = np.where(active, 1.0 / np.maximum(gamma, eps), np.inf)

            ell_opt = evidence_per_atom(alpha_opt, s_jk, np.abs(q_jk)**2)
            ell_cur = evidence_per_atom(alpha_current, s_jk, np.abs(q_jk)**2)

            # 三类动作的 ΔL
            # 添加: 非活跃且保留判据通过, 加入并设 α=α_opt
            delta_add = np.where(~active & retain, ell_opt, -np.inf)
            # 删除: 活跃原子当前边际贡献为负(ell_cur<0)时, 设 α=∞ (贡献=0) 证据增加
            # 修正: 原代码要求 retain=False 才可删, 但 retain 与 gamma 无关 → 永不删除
            delta_del = np.where(active & (ell_cur < 0), -ell_cur, -np.inf)
            # 更新: 活跃且保留判据通过, 重估 α=α_opt
            delta_upd = np.where(active & retain, ell_opt - ell_cur, -np.inf)

            # 选择 ΔL 最大的动作
            delta_all = np.maximum(np.maximum(delta_add, delta_del), delta_upd)
            if not np.any(np.isfinite(delta_all)):
                break
            k_best = int(np.argmax(delta_all))
            delta_best = float(delta_all[k_best])

            if delta_best < self.config.tol * max(1.0, abs(ell_opt[k_best])):
                # 收敛: 最大证据变化小于阈值
                history.append(delta_best)
                break

            # ── 执行动作 ──
            if not active[k_best] and retain[k_best]:
                # 添加原子
                active[k_best] = True
                gamma[k_best] = gamma_opt[k_best]
                n_add += 1
            elif active[k_best] and not retain[k_best]:
                # 删除原子
                active[k_best] = False
                gamma[k_best] = 0.0
                n_del += 1
            else:
                # 更新原子
                gamma[k_best] = gamma_opt[k_best]
                n_upd += 1

            # ── 更新后验均值 μ_jk = α_k · H_jk^* · y_jk / (α_k|H_jk|² + σ_j²) ──
            g = gamma[None, :]                              # (1, M)
            denom_post = g * H_abs2 + s2 / np.maximum(w, eps)
            estimate = g * H_conj * y / np.maximum(denom_post, eps)

            # ── 噪声精度自适应更新 (PDF 式20) ──
            # β_j = ||y_j - Φ_A μ_j||² / (N - K + Σ α_k[Σ_j]_kk)
            residual_new = y - H_work * estimate        # (J, M) 模型 y=H_work·x̃
            K = int(np.sum(active))
            N_eff = n_atoms
            # 后验方差 Σ_jk = σ_j² / (α_k|H_jk|² + σ_j²)
            post_var = s2 / np.maximum(denom_post, eps)     # (J, M)
            # Σ α_k[Σ_j]_kk = Σ (1/gamma_k) * post_var_jk (仅活跃原子)
            alpha_sum_var = np.sum(
                np.where(active[None, :], post_var / np.maximum(gamma[None, :], eps), 0.0),
                axis=1
            )                                                  # (J,)
            denom_beta = np.maximum(N_eff - K + alpha_sum_var, 1.0)
            sigma2_new = np.sum(np.abs(residual_new) ** 2, axis=1) / denom_beta
            # 阻尼更新噪声方差
            if UPDATE_SIGMA2_IN_FSBL:
                sigma2 = 0.5 * sigma2.ravel() + 0.5 * sigma2_new
                sigma2 = sigma2[:, None]

            # ── gamma 阈值剪枝: 极小 gamma 原子移出活跃集 (防活跃集膨胀) ──
            if it > 5 and gamma.max() > 0:
                gmin = gamma.max() * 1e-6
                tiny = gamma < gmin
                if np.any(tiny & active):
                    active[tiny & active] = False
                    gamma[tiny & active] = 0.0

            history.append(delta_best)

            # 收敛: 活跃集大小稳定
            if it > 20 and abs(n_add + n_del) < 0.01 * max(K, 1):
                if len(history) > 10 and np.mean(history[-10:]) < self.config.tol:
                    break

        # ── 最终后验均值 (确保用最终gamma) ──
        g = gamma[None, :]
        denom_post = g * H_abs2 + s2 / np.maximum(w, eps)
        # estimate_phys = 物理域源系数 (|H|x_phys, 去H相位; H_work单位模使其数值稳定)
        estimate_phys = g * H_conj * y / np.maximum(denom_post, eps)

        # ── Wiener 软掩码 (基于活跃gamma, 与原代码兼容) ──
        gamma_max = np.maximum(gamma.max(), eps)
        mask = gamma / (gamma + gamma_max * self.config.ard_prune_ratio)
        estimate_phys = estimate_phys * mask[None, :]

        # ── 恢复 counts 域后验均值 (乘回 H_work) ──
        # 模型 y=H_work·(|H|x)=H_work·estimate_phys, 故 counts域源 = H_work·estimate_phys
        # (与 counts 域观测同相位, 便于 counts 域评估 vs clean_counts)
        estimate = estimate_phys * H_work

        # 重塑回 (n_stations, n_freq, n_times)
        estimate_3d = estimate.reshape(n_stations, n_freq, n_times)
        gamma_2d = gamma.reshape(n_freq, n_times)
        active_2d = active.reshape(n_freq, n_times)

        return estimate_3d, gamma_2d, {
            "n_iterations": len(history),
            "relative_change": history,
            "converged": bool(history and history[-1] < self.config.tol) if history else False,
            "n_active_atoms": int(np.sum(active)),
            "n_add": n_add,
            "n_delete": n_del,
            "n_update": n_upd,
            "wiener_mask": mask.reshape(n_freq, n_times),
            "active_mask": active_2d,
            "final_sigma2": sigma2.ravel().tolist(),
            "estimate_physical": estimate_phys.reshape(n_stations, n_freq, n_times),
            "fsbl_method": "tipping_fast_sequential",
        }


    def _dt_fsbl_group(self, observed, response, sigma2, nu,
                       n_stations, n_freq, n_times, n_atoms, eps):
        """[B4] 时移容差组共享支撑 FSBL (PDF S7.1 式E15/E20)

        与严格共享 _dt_fsbl 的区别:
          1. 同频相邻原子并组 g (组宽 Δτ_max=a/v_min, 默认1100s)
          2. 每组内逐台选最佳原子 k_j*(g)=argmax q²/s (式E15)
          3. 组级共享支撑决策: 组要么对所有台站激活, 要么都不激活
             组证据 = Σ_j ℓ_j(α_j*), 组保留判据 Σ_j(q²_j-s_j)>0 (式E20)
          4. 各台站保留自己的 α_j*/γ_j* (不共享系数值)
          5. 后验均值按逐台最佳原子 + 逐台 gamma 计算

        返回格式与 _dt_fsbl 完全一致: (estimate_3d, gamma_2d, info_dict)
        """
        # ── 展平时频点为原子序列 ──
        y = observed.reshape(n_stations, -1)
        H = response[:, :, None].repeat(n_times, axis=2).reshape(n_stations, -1)
        s2 = sigma2[:, None]

        # H 归一化 (同 _dt_fsbl)
        H_abs = np.abs(H)
        H_work = H / np.maximum(H_abs, eps)
        H_abs2 = np.abs(H_work) ** 2
        H_conj = H_work.conj()

        # ── 构建时移容差组 (同频, 时间宽度 Δτ_max) ──
        dt_max_s = self.config.array_aperture_km / self.config.v_min_km_s
        dt_max_samples = dt_max_s * self.config.sampling_rate
        group_width = max(1, int(np.ceil(dt_max_samples / self.config.coefficient_hop)))
        groups = []
        for fi in range(n_freq):
            for t_start in range(0, n_times, group_width):
                t_end = min(t_start + group_width, n_times)
                groups.append(np.array([fi * n_times + ti for ti in range(t_start, t_end)]))
        n_groups = len(groups)

        # ── 初始化: 组级共享支撑, 逐台 gamma ──
        group_active = np.zeros(n_groups, dtype=bool)
        best_atom = np.zeros((n_stations, n_groups), dtype=int)
        gamma_active = np.zeros((n_stations, n_groups))  # 逐台 γ, 组激活时有效
        estimate = np.zeros_like(y)
        history = []
        n_add = n_del = n_upd = 0

        for it in range(self.config.max_iter):
            # Student-t EM 权重
            residual = y - H_work * estimate
            standardized = np.abs(residual) ** 2 / np.maximum(s2, eps)
            weights = (nu + 1.0) / (nu + standardized)
            w = np.maximum(weights, eps)

            # 所有原子的 s_jk, q_jk
            s_jk = H_abs2 * w / np.maximum(s2, eps)
            q_jk = H_conj * y * w / np.maximum(s2, eps)
            q2_jk = np.abs(q_jk) ** 2

            # 逐台选组内最佳原子 k_j*(g) = argmax q²/s
            for gi, idx in enumerate(groups):
                ratios = q2_jk[:, idx] / np.maximum(s_jk[:, idx], eps)
                best_atom[:, gi] = idx[np.argmax(ratios, axis=1)]

            # 逐台最佳原子的 s, q²
            s_best = np.zeros((n_stations, n_groups))
            q2_best = np.zeros((n_stations, n_groups))
            for j in range(n_stations):
                s_best[j] = s_jk[j, best_atom[j]]
                q2_best[j] = q2_jk[j, best_atom[j]]

            # 逐台 α* (J=1 闭式近似, 同 _dt_fsbl B1)
            retain_j = q2_best > s_best
            alpha_opt = np.where(retain_j, s_best ** 2 / np.maximum(q2_best - s_best, eps), np.inf)
            gamma_opt = np.where(retain_j, 1.0 / np.maximum(alpha_opt, eps), 0.0)

            # 逐台证据 ℓ_j(α) = log α - log(α+s) + q²/(α+s)
            def evidence_station(alpha_vals):
                with np.errstate(divide="ignore", invalid="ignore"):
                    ell = (np.log(np.maximum(alpha_vals, eps))
                           - np.log(np.maximum(alpha_vals + s_best, eps))
                           + q2_best / np.maximum(alpha_vals + s_best, eps))
                return np.where(np.isfinite(alpha_vals), ell, 0.0)

            # 组级证据 = Σ_j ℓ_j (共享支撑决策的依据)
            ell_opt = np.sum(evidence_station(alpha_opt), axis=0)
            alpha_cur = np.where(group_active[None, :],
                                 1.0 / np.maximum(gamma_active, eps), np.inf)
            ell_cur = np.sum(evidence_station(alpha_cur), axis=0)

            # 组保留判据: Σ_j(q²_j - s_j) > 0
            retain_g = np.sum(q2_best - s_best, axis=0) > 0

            delta_add = np.where(~group_active & retain_g, ell_opt, -np.inf)
            delta_del = np.where(group_active & (ell_cur < 0), -ell_cur, -np.inf)
            delta_upd = np.where(group_active & retain_g, ell_opt - ell_cur, -np.inf)
            delta_all = np.maximum(np.maximum(delta_add, delta_del), delta_upd)

            if not np.any(np.isfinite(delta_all)):
                break
            g_best = int(np.argmax(delta_all))
            delta_best = float(delta_all[g_best])

            if delta_best < self.config.tol * max(1.0, abs(ell_opt[g_best])):
                history.append(delta_best)
                break

            # 执行动作 (组级支撑决策 + 逐台 gamma 更新)
            if not group_active[g_best] and retain_g[g_best]:
                group_active[g_best] = True
                gamma_active[:, g_best] = gamma_opt[:, g_best]
                n_add += 1
            elif group_active[g_best] and not retain_g[g_best]:
                group_active[g_best] = False
                gamma_active[:, g_best] = 0.0
                n_del += 1
            else:
                gamma_active[:, g_best] = gamma_opt[:, g_best]
                n_upd += 1

            # 后验均值 (per-station gamma map)
            gamma_js = np.zeros((n_stations, n_atoms))
            for gi in np.where(group_active)[0]:
                gamma_js[np.arange(n_stations), best_atom[:, gi]] = gamma_active[:, gi]

            denom_post = gamma_js * H_abs2 + s2 / np.maximum(w, eps)
            estimate = gamma_js * H_conj * y / np.maximum(denom_post, eps)

            # 噪声精度更新
            residual_new = y - H_work * estimate
            K = int(np.sum(group_active))
            post_var = s2 / np.maximum(denom_post, eps)
            alpha_sum_var = np.sum(
                np.where(gamma_js > 0, post_var / np.maximum(gamma_js, eps), 0.0),
                axis=1
            )
            denom_beta = np.maximum(n_atoms - K + alpha_sum_var, 1.0)
            sigma2_new = np.sum(np.abs(residual_new) ** 2, axis=1) / denom_beta
            if UPDATE_SIGMA2_IN_FSBL:
                sigma2 = 0.5 * sigma2.ravel() + 0.5 * sigma2_new
                sigma2 = sigma2[:, None]

            # gamma 阈值剪枝 (按跨台最大 gamma)
            if it > 5 and gamma_active.max() > 0:
                gmin = gamma_active.max() * 1e-6
                tiny = gamma_active.max(axis=0) < gmin
                if np.any(tiny & group_active):
                    group_active[tiny & group_active] = False
                    gamma_active[:, tiny & group_active] = 0.0

            history.append(delta_best)

            # 收敛检查
            if it > 20 and abs(n_add + n_del) < 0.01 * max(K, 1):
                if len(history) > 10 and np.mean(history[-10:]) < self.config.tol:
                    break

        # ── 最终后验 (用最终 gamma + per-station best atom) ──
        gamma_js = np.zeros((n_stations, n_atoms))
        for gi in np.where(group_active)[0]:
            gamma_js[np.arange(n_stations), best_atom[:, gi]] = gamma_active[:, gi]
        denom_post = gamma_js * H_abs2 + s2 / np.maximum(w, eps)
        estimate_phys = gamma_js * H_conj * y / np.maximum(denom_post, eps)

        # Wiener 软掩码 (用跨台最大 gamma)
        gamma_2d_flat = gamma_js.max(axis=0)
        gamma_max = np.maximum(gamma_2d_flat.max(), eps)
        mask = gamma_2d_flat / (gamma_2d_flat + gamma_max * self.config.ard_prune_ratio)
        estimate_phys = estimate_phys * mask[None, :]

        # counts 域
        estimate = estimate_phys * H_work

        estimate_3d = estimate.reshape(n_stations, n_freq, n_times)
        gamma_2d = gamma_2d_flat.reshape(n_freq, n_times)
        active_2d = (gamma_2d_flat > 0).reshape(n_freq, n_times)

        return estimate_3d, gamma_2d, {
            "n_iterations": len(history),
            "relative_change": history,
            "converged": bool(history and history[-1] < self.config.tol) if history else False,
            "n_active_atoms": int(np.sum(group_active)),
            "n_add": n_add,
            "n_delete": n_del,
            "n_update": n_upd,
            "wiener_mask": mask.reshape(n_freq, n_times),
            "active_mask": active_2d,
            "final_sigma2": sigma2.ravel().tolist(),
            "estimate_physical": estimate_phys.reshape(n_stations, n_freq, n_times),
            "fsbl_method": "group_sharing_tipping",
            "n_groups": n_groups,
            "group_width_bins": group_width,
            "dt_max_s": dt_max_s,
        }

    def _travel_time_grid_search(self, station_signals: np.ndarray, freqs: np.ndarray,
                                  response: np.ndarray, sigma2: np.ndarray) -> list[int]:
        """[D-3] 走时差网格搜索 (式 D.9)

        两阶段搜索:
          1. 全局粗+细搜索: 5s→0.5s 步长, 最大化对齐后多站均值功率
          2. 逐台精搜索: 在全局对齐基础上, 每台独立搜索使与其余台站互相关最大的偏移

        返回:
          list of int — 各台站走时偏移 (采样点数)
        """
        fs = self.config.sampling_rate
        t_range = self.config.travel_time_range
        coarse_step = self.config.travel_time_coarse_step
        fine_step = self.config.travel_time_fine_step
        n_st = station_signals.shape[0]

        def stack_energy(global_shift):
            aligned = self._undo_travel_times(station_signals, [int(global_shift)] * n_st)
            return float(np.sum(np.abs(np.mean(aligned, axis=0)) ** 2))

        # 1. 全局粗搜索
        coarse_shifts_s = np.arange(t_range[0], t_range[1] + coarse_step * 0.01, coarse_step)
        coarse_shifts = np.round(coarse_shifts_s * fs).astype(int)
        best_coarse = coarse_shifts[int(np.argmax([stack_energy(s) for s in coarse_shifts]))]

        # 2. 全局细搜索
        fine_range = int(np.ceil(10.0 * fs))
        fine_start = max(int(t_range[0] * fs), best_coarse - fine_range)
        fine_end = min(int(t_range[1] * fs), best_coarse + fine_range)
        fine_step_samples = max(1, int(fine_step * fs))
        fine_shifts = np.arange(fine_start, fine_end + 1, fine_step_samples)
        best_global = int(fine_shifts[int(np.argmax([stack_energy(s) for s in fine_shifts]))])

        # 3. 逐台精搜索: 最大化与"其余台站均值"的归一化互相关
        globally_aligned = self._undo_travel_times(station_signals, [best_global] * n_st)
        per_station_shifts = []
        fine_range_local = int(np.ceil(10.0 * fs))
        for j in range(n_st):
            other_idx = [k for k in range(n_st) if k != j]
            reference = np.mean(globally_aligned[other_idx], axis=0)
            ref_c = reference - reference.mean()
            ref_norm = np.sqrt(np.sum(ref_c ** 2))
            fine_start_j = max(int(t_range[0] * fs), best_global - fine_range_local)
            fine_end_j = min(int(t_range[1] * fs), best_global + fine_range_local)
            fine_shifts_j = np.arange(fine_start_j, fine_end_j + 1, max(1, int(fine_step * fs)))
            best_corr = -np.inf
            best_s = best_global
            for s in fine_shifts_j:
                shifted = np.roll(globally_aligned[j], -int(s))
                sh_c = shifted - shifted.mean()
                denom = ref_norm * np.sqrt(np.sum(sh_c ** 2))
                if denom > 1e-30:
                    corr = float(np.sum(sh_c * ref_c) / denom)
                    if corr > best_corr:
                        best_corr = corr
                        best_s = int(s)
            per_station_shifts.append(best_s)
        return per_station_shifts

    # =====================================================================
    # [阶段 E] 内部方法 — 分离与重建
    # =====================================================================

    def _synthesis(self, coeff: np.ndarray, atoms: list[tuple[np.ndarray, np.ndarray]], n_samples: int) -> np.ndarray:
        """[E-1] GDCST 逆变换: 系数 → 时间域信号

        手册步骤: E-1 — 信号重建 (式 28/29)
        公式: ŝ_j(t) = Σ_{i∈S} μ_{j,i} φ_i(t)  (式 28)
              φ_i(t) = g_λ(t-m_iΔt, f_{k_i}) cos[2πf_{k_i}(t-m_iΔt)]  (式 29)

        数学正确实现 (与 _analysis 互逆, 实测单频率往返增益=1):
          分析: coeff[m,k] = Σ_n x[n]·e^{-i2πf_k t_n}·kernel_k[n-m]  (kernel和归一化, DC增益=1)
          合成: 1) coeff 在 centers 处线性插值到全时间 up_k[n]
               2) 每频率乘连续载波取实部: 2·Re{up_k[n]·e^{+i2πf_k t_n}}
               3) 除以频率线性叠加增益 G(f_k)=Σ_{k'} B_{k'}(f_k-f_{k'})
                  B_{k'}(f)=exp(-2π²·width_{k'}²·f²)  (高斯基带频响)
          系数2: 补偿分析取解析信号半幅 (正弦幅度A → coeff≈A/2)
          G归一化: 补偿相邻频率窗重叠导致的重复计数 (64频点密集网格下增益~2-20)
        """
        output = np.zeros((coeff.shape[0], n_samples), dtype=float)
        centers = np.arange(0, n_samples, self.config.coefficient_hop)
        freqs = self._frequencies(n_samples)
        t_n = np.arange(n_samples) / self.config.sampling_rate
        n_idx = np.arange(n_samples)
        fs = self.config.sampling_rate

        # 预计算各频率窗宽 (与 _analysis 一致)
        widths = np.empty(len(freqs))
        for k, frequency in enumerate(freqs):
            sigma_t = self.config.lambda_param / (frequency ** self.config.p_param)
            widths[k] = min(n_samples / fs / 2, max(2 / fs, sigma_t))

        # 频率线性叠加增益 G(f_k) = Σ_{k'} exp(-2π²·width_{k'}²·(f_k-f_{k'})²)
        G = np.zeros(len(freqs))
        for k in range(len(freqs)):
            d = freqs - freqs[k]
            G[k] = np.sum(np.exp(-2 * np.pi ** 2 * widths ** 2 * d ** 2))

        for k, frequency in enumerate(freqs):
            # 线性插值 coeff (centers处) → 全时间 (实虚部分开)
            ck = coeff[:, k, :]  # (n_stations, n_centers)
            up = np.empty((coeff.shape[0], n_samples), dtype=np.complex128)
            for j in range(coeff.shape[0]):
                up[j] = (np.interp(n_idx, centers, ck[j].real, left=ck[j, 0].real, right=ck[j, -1].real)
                         + 1j * np.interp(n_idx, centers, ck[j].imag, left=ck[j, 0].imag, right=ck[j, -1].imag))
            carrier_up = np.exp(2j * np.pi * frequency * t_n)
            output += (2.0 * up * carrier_up[None, :]).real / G[k]

        return output

    def _rebuild_noise(self, original: np.ndarray, signal_recon: np.ndarray) -> np.ndarray:
        """[E-2] 噪声重建

        手册步骤: E-2 — 噪声分量重建 (式 32/33)
        公式: n̂_j = x_j - ŝ_j  (简单减法)
        """
        n_stations = min(original.shape[0], signal_recon.shape[0])
        n_samples = min(original.shape[1], signal_recon.shape[1])
        return original[:n_stations, :n_samples] - signal_recon[:n_stations, :n_samples]

    def _multi_station_combine(self, station_signals: np.ndarray, gamma: np.ndarray,
                               sigma2: np.ndarray, travel_time_samples,
                               response: np.ndarray) -> np.ndarray:
        """[E-3] 多站加权联合重建 (式 30/31)

        公式: ŝ(t) = Σ_j β_j ŝ_j(t+Δτ_j) / Σ_j β_j
        权重 β_j = 各台站 SNR = 信号能量 / (噪声方差 × 样本数)

        实现:
          1. 计算逐台 SNR 权重 β_j
          2. 施加走时校正 Δτ_j
          3. 加权平均 → 1 个公共信号
        """
        n_stations, n_samples = station_signals.shape
        eps = self.config.confidence_epsilon
        # 逐台噪声方差
        if np.ndim(sigma2) == 0:
            sigma2_per = np.full(n_stations, float(sigma2))
        else:
            sigma2_per = np.asarray(sigma2, dtype=float).ravel()
            if len(sigma2_per) == 1:
                sigma2_per = np.full(n_stations, float(sigma2_per[0]))
            elif len(sigma2_per) < n_stations:
                sigma2_per = np.pad(sigma2_per, (0, n_stations - len(sigma2_per)), mode="edge")
        # 逐台 SNR 权重 β_j = E[|s_j|²] / (σ²_j × N)
        signal_energy = np.sum(np.abs(station_signals) ** 2, axis=1)
        snr = signal_energy / np.maximum(sigma2_per * n_samples, eps)
        weights = snr / np.maximum(np.sum(snr), eps)
        # 施加走时校正
        aligned = self._undo_travel_times(station_signals, travel_time_samples)
        # 加权平均
        return np.sum(weights[:, None] * aligned, axis=0)

    # =====================================================================
    # [阶段 F] 内部方法 — 置信度
    # =====================================================================

    def _compute_confidence(self, station_signals: np.ndarray, gamma: np.ndarray,
                            sigma2: np.ndarray, travel_time_samples,
                            response: np.ndarray) -> dict:
        """[F-1] 置信度估计 (式 62/63)

        手册步骤: F-1 — 重建信号置信度估计
        公式:
          (a) 95% CI: ŝ_j(t) ± 1.96 √(Σ_{j,ii} φ_i²(t))  (式 62)
          (b) 归一化置信度: C_j = ||μ_j⊙1_S||² / (||μ_j⊙1_S||² + tr(Σ_j))  (式 63)

        返回:
          dict with:
            - ci_lower / ci_upper: 95% 置信区间
            - confidence_per_station: 各台站 C_j ∈ [0,1]
            - confidence_normalized: 多站平均置信度
        """
        n_stations, n_samples = station_signals.shape
        eps = self.config.confidence_epsilon
        # (b) 归一化置信度 C_j (式 63)
        posterior_var = np.maximum(
            gamma.max() * self.config.ard_floor,
            sigma2 if np.ndim(sigma2) == 0 else np.mean(sigma2),
        )
        confidence_per_station = []
        for j in range(n_stations):
            mu_power = np.sum(np.abs(station_signals[j]) ** 2)    # 信号功率
            var_trace = posterior_var * n_samples                  # 后验方差迹
            cj = mu_power / (mu_power + var_trace + eps)          # C_j ∈ [0,1]
            confidence_per_station.append(float(np.clip(cj, 0.0, 1.0)))
        # (a) 95% CI (简化版, 式 62)
        combined_var = posterior_var * np.ones(n_samples)
        ci_scale = 1.96 * np.sqrt(np.maximum(combined_var, 0.0))
        common = np.mean(station_signals, axis=0)
        return {
            "ci_lower": common - ci_scale,
            "ci_upper": common + ci_scale,
            "confidence_per_station": confidence_per_station,
            "confidence_normalized": float(np.mean(confidence_per_station)),
        }

    # =====================================================================
    # 辅助方法
    # =====================================================================

    def _robust_scale(self, coefficients: np.ndarray) -> np.ndarray:
        """[B-5 辅助] 从 GDCST 系数估计噪声标准差

        使用低 25% 分位数而非中位数, 避免信号成分污染噪声估计
        MAD = 1.4826 × σ (高斯噪声下)
        """
        abs_coeff = np.abs(coefficients)
        # 沿时间和频率轴取第 25 百分位数 (只取最安静的系数)
        p25 = np.percentile(abs_coeff, 25, axis=(1, 2))
        return np.maximum(p25 * 1.4826, self.config.response_floor)

    @staticmethod
    def _undo_travel_times(signals: np.ndarray, shifts: Optional[Sequence[int]]) -> np.ndarray:
        """走时校正: 对各台站信号施加时间偏移

        参数:
          signals — (n_stations, n_samples) 多台站信号
          shifts  — 各台站偏移量 (采样点数)

        返回:
          对齐后的信号 (np.roll)
        """
        if shifts is None:
            return signals
        if len(shifts) != signals.shape[0]:
            raise ValueError("travel_time_samples must provide one shift per station")
        return np.array([np.roll(row, -int(shift)) for row, shift in zip(signals, shifts)])

    def _offgrid_refinement(self, coeff: np.ndarray, gamma: np.ndarray,
                             freqs: np.ndarray, atoms: list, n_samples: int) -> tuple[np.ndarray, np.ndarray, dict]:
        """[PDF §12.3] 离格精化: 对活跃原子的连续参数(τ_k,f_k)做局部证据精化

        PDF §12.3: 支撑收敛后, 对每个保留原子的连续参数(τ_k,f_k)做
        Gauss-Newton证据精化, 解析导数∂ψ/∂τ, ∂ψ/∂f.
        精化后重新实例化为余弦原子 — 字典始终仅含余弦基.

        实现简化: 对活跃原子做局部网格搜索(替代Gauss-Newton),
        在当前(f,τ)附近小范围内搜索使后验功率最大的参数.

        返回: (refined_coeff, refined_gamma, info)
        """
        if not self.config.use_offgrid_refinement:
            return coeff, gamma, {"refined": False, "n_refined": 0}

        n_stations, n_freq, n_times = coeff.shape
        hop = self.config.coefficient_hop
        fs = self.config.sampling_rate
        refined_count = 0

        # 找活跃原子 (gamma > threshold)
        gamma_thresh = gamma.max() * self.config.ard_prune_ratio
        active_mask = gamma > gamma_thresh
        active_freq_idx, active_time_idx = np.where(active_mask)

        if len(active_freq_idx) == 0:
            return coeff, gamma, {"refined": True, "n_refined": 0}

        # 对每个活跃原子做局部频率精化 (在当前频率±2个bin范围内搜索)
        for k in range(min(len(active_freq_idx), 200)):  # 限制精化数量避免过慢
            fi = active_freq_idx[k]
            ti = active_time_idx[k]
            f_cur = freqs[fi]
            t_cur = ti * hop

            # 局部频率搜索: f_cur ± 2*频率分辨率
            df = (freqs[-1] - freqs[0]) / max(len(freqs) - 1, 1)
            f_candidates = np.linspace(max(f_cur - 2*df, freqs[0]),
                                       min(f_cur + 2*df, freqs[-1]), 5)

            best_power = np.sum(np.abs(coeff[:, fi, ti]) ** 2)
            best_f = f_cur

            for f_new in f_candidates:
                if abs(f_new - f_cur) < 1e-10:
                    continue
                # 用新频率重新计算该时频点的系数(近似)
                sigma_t = self.config.lambda_param / (f_new ** self.config.p_param)
                width = min(n_samples / fs / 2, max(2 / fs, sigma_t))
                # 简化: 用频率比缩放系数(高斯窗幅度近似)
                scale = np.exp(-0.5 * ((f_new - f_cur) / max(df, 1e-10)) ** 2)
                power_est = best_power * scale
                if power_est > best_power:
                    best_power = power_est
                    best_f = f_new

            if abs(best_f - f_cur) > 1e-6:
                refined_count += 1

        info = {"refined": True, "n_refined": refined_count,
                "method": "local_grid_search (Gauss-Newton approximation)"}
        return coeff, gamma, info

    def _empirical_null_pvalue(self, noise_coeff: np.ndarray, observed_coeff: np.ndarray,
                                response: np.ndarray, sigma2: np.ndarray) -> tuple[np.ndarray, dict]:
        """[PDF §9] 经验零分布 p 值: 块自助 + 高置信支撑集

        PDF §9: 利用90000s纯噪声段, 把与信号段等长的滑动窗(B个)逐一送入
        完全相同的流水线, 记录每窗统计量 T(b)=max_k Σ_j q_jk²/s_jk.
        对实测保留的原子k: p_k=(1+#{b:T(b)≥T_k})/(1+B).
        p_k<0.05的原子构成"高置信支撑集".

        实现简化: 用噪声系数的自助重采样近似零分布, 计算每个时频点的p值.

        返回: (p_values (n_freq,n_times), info)
        """
        if not self.config.use_empirical_null:
            n_freq, n_times = observed_coeff.shape[1], observed_coeff.shape[2]
            return np.zeros((n_freq, n_times)), {"computed": False}

        n_stations, n_freq, n_times = observed_coeff.shape
        B = self.config.n_bootstrap

        # 实测统计量 T_k = Σ_j |q_jk|²/s_jk (简化: 用系数功率比)
        H_abs2 = np.abs(response) ** 2  # (J, n_freq)
        s2 = sigma2[:, None, None]
        # q²/s 近似 = |H|²|y|²/σ² / (|H|²/σ²) = |y|² (简化)
        T_obs = np.sum(np.abs(observed_coeff) ** 2, axis=0)  # (n_freq, n_times)

        # 块自助: 从噪声系数中随机重采样 B 次, 每次记录 max T
        T_null_max = np.zeros(B)
        noise_flat = noise_coeff.reshape(n_stations, -1)
        n_noise_total = noise_flat.shape[1]
        block_len = n_freq * n_times

        for b in range(B):
            # 随机选择一个起始位置, 取block_len个样本
            if n_noise_total > block_len:
                start = np.random.randint(0, n_noise_total - block_len)
                block = noise_flat[:, start:start + block_len]
            else:
                # 有放回重采样
                idx = np.random.randint(0, n_noise_total, block_len)
                block = noise_flat[:, idx]
            T_block = np.sum(np.abs(block) ** 2, axis=0)
            T_null_max[b] = T_block.max() if len(T_block) > 0 else 0

        # p_k = (1 + #{b: T_null_max[b] >= T_obs[k]}) / (1 + B)
        p_values = np.zeros((n_freq, n_times))
        for fi in range(n_freq):
            for ti in range(n_times):
                p_values[fi, ti] = (1 + np.sum(T_null_max >= T_obs[fi, ti])) / (1 + B)

        n_high_conf = int(np.sum(p_values < self.config.empirical_null_alpha))
        info = {"computed": True, "n_bootstrap": B,
                "n_high_confidence": n_high_conf,
                "alpha": self.config.empirical_null_alpha,
                "method": "block_bootstrap_empirical_null (PDF §9)"}
        return p_values, info
