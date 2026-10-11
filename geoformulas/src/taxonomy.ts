import type { BText, TaxoNode } from './core/types.js'
import { t } from './core/types.js'

/**
 * 地震学学科分类树。
 * 一级 S0–S13：按「数学物理基础 → 介质本构 → 波传播 → 界面响应 → 震源 → 面波
 *               → 衰减 → 内部结构 → 观测 → 处理 → 反演 → 强地面运动
 *               → 统计地震学 → 岩石物理」的认识顺序排列。
 * 每条公式卡片通过 node 字段挂在这棵树上（挂在叶子节点上）。
 */
export const TAXONOMY: TaxoNode[] = [
  // ───────────────────────── S0 数学与波动基础 ─────────────────────────
  { id: 'S0', name: t('数学与波动基础', 'Mathematical & Wave Preliminaries'), desc: t('进入地震学前必须掌握的数学语言', 'The mathematical language required before entering seismology') },
  { id: 'S0.1', parent: 'S0', name: t('谐和振动与波的参数', 'Harmonic Motion & Wave Parameters'), desc: t('频率、角频率、波数、相速度的基本定义', 'Definitions of frequency, angular frequency, wavenumber, phase velocity') },
  { id: 'S0.2', parent: 'S0', name: t('Fourier 变换与谱', 'Fourier Transform & Spectra'), desc: t('时间域与频率域互换的工具箱', 'The toolbox connecting time and frequency domains') },
  { id: 'S0.3', parent: 'S0', name: t('矢量分析与张量运算', 'Vector Calculus & Tensor Algebra'), desc: t('梯度、散度、旋度与指标记法', 'Gradient, divergence, curl and index notation') },
  { id: 'S0.4', parent: 'S0', name: t('复变函数与解析信号', 'Complex Analysis & Analytic Signal'), desc: t('相量、留数、Hilbert 变换与包络', 'Phasors, residues, the Hilbert transform and envelopes') },
  { id: 'S0.5', parent: 'S0', name: t('特殊函数与积分变换', 'Special Functions & Integral Transforms'), desc: t('Bessel、Legendre、球谐与 Laplace 变换', 'Bessel, Legendre, spherical harmonics and the Laplace transform') },
  { id: 'S0.6', parent: 'S0', name: t('概率与统计基础', 'Probability & Statistics'), desc: t('分布、似然、误差传播', 'Distributions, likelihood and error propagation') },
  { id: 'S0.7', parent: 'S0', name: t('微分方程与 Green 函数', 'Differential Equations & Green Functions'), desc: t('常/偏微分方程的基本解', 'Fundamental solutions of ODEs and PDEs') },

  // ───────────────────────── S1 弹性力学与本构 ─────────────────────────
  { id: 'S1', name: t('弹性力学与本构关系', 'Elasticity & Constitutive Relations'), desc: t('岩石如何变形，形变如何决定波速', 'How rock deforms and how deformation sets wave speeds') },
  { id: 'S1.1', parent: 'S1', name: t('应力张量', 'Stress Tensor'), desc: t('牵引力、Cauchy 应力、主应力', 'Traction, Cauchy stress, principal stresses') },
  { id: 'S1.2', parent: 'S1', name: t('应变张量与位移梯度', 'Strain Tensor & Displacement Gradient'), desc: t('小应变张量、体积应变、旋转', 'Infinitesimal strain, volumetric strain, rotation') },
  { id: 'S1.3', parent: 'S1', name: t('本构关系与弹性常数', 'Constitutive Law & Elastic Constants'), desc: t("Hooke 定律、Lamé 常数与各模量互换", "Hooke's law, Lamé constants and conversions among moduli") },
  { id: 'S1.4', parent: 'S1', name: t('弹性波方程', 'Elastodynamic Equations'), desc: t('Navier 方程与波动方程的来源', 'Origin of the Navier and wave equations') },
  { id: 'S1.5', parent: 'S1', name: t('波速与弹性参数', 'Wave Speeds & Elastic Parameters'), desc: t('P 波、S 波速度的物理决定因素', 'What physically determines P and S wave speeds') },
  { id: 'S1.6', parent: 'S1', name: t('各向异性弹性', 'Anisotropic Elasticity'), desc: t('TI 介质、Thomsen 参数、Christoffel 方程', 'TI media, Thomsen parameters, the Christoffel equation') },
  { id: 'S1.7', parent: 'S1', name: t('非弹性与黏弹性', 'Anelasticity & Viscoelasticity'), desc: t('复模量、松弛时间与 Q 的微观来源', 'Complex moduli, relaxation times and the microscopic origin of Q') },

  // ───────────────────────── S2 体波与射线理论 ─────────────────────────
  { id: 'S2', name: t('体波与射线理论', 'Body Waves & Ray Theory'), desc: t('高频近似下波如何走、走多久', 'How waves travel and how long they take, in the high-frequency limit') },
  { id: 'S2.1', parent: 'S2', name: t('地震相与体波类型', 'Seismic Phases & Body Wave Types'), desc: t('P、S、PKP、ScS 等命名体系', 'Naming system of P, S, PKP, ScS …') },
  { id: 'S2.2', parent: 'S2', name: t('Snell 定律与射线参数', "Snell's Law & Ray Parameter"), desc: t('界面上的射线行为与守恒量', 'Ray behaviour at interfaces and its conserved quantity') },
  { id: 'S2.3', parent: 'S2', name: t('走时与时距关系', 'Travel Time & Time–Distance Relations'), desc: t('双曲时距关系与其物理解释', 'Hyperbolic time–distance relation and its physical meaning') },
  { id: 'S2.4', parent: 'S2', name: t('球对称地球中的射线', 'Rays in a Spherical Earth'), desc: t('地球曲率、扁平度与震中距', 'Earth curvature, ellipticity and epicentral distance') },
  { id: 'S2.5', parent: 'S2', name: t('射线追踪微分方程', 'Ray-tracing Differential Equations'), desc: t('运动学射线方程组与程函方程', 'Kinematic ray equations and the eikonal equation') },
  { id: 'S2.6', parent: 'S2', name: t('τ–p 与 Gutenberg 反演', 'τ–p & the Gutenberg Inversion'), desc: t('由 τ(p) 反推速度结构', 'Recovering velocity structure from τ(p)') },

  // ───────────────────────── S3 反射、透射与成像 ─────────────────────────
  { id: 'S3', name: t('反射、透射与成像', 'Reflection, Transmission & Imaging'), desc: t('界面两侧能量如何分配，时间剖面如何变成地质剖面', 'How energy is partitioned at an interface and how a time section becomes a geological section') },
  { id: 'S3.1', parent: 'S3', name: t('声学反射系数', 'Acoustic Reflection Coefficient'), desc: t('垂直入射时最简单的能量分配', 'The simplest partitioning at normal incidence') },
  { id: 'S3.2', parent: 'S3', name: t('Zoeppritz 方程组', 'Zoeppritz Equations'), desc: t('弹性界面的精确解', 'Exact solution for an elastic interface') },
  { id: 'S3.3', parent: 'S3', name: t('AVO 近似式', 'AVO Approximations'), desc: t('Aki–Richards、Shuey 与实际应用', 'Aki–Richards, Shuey and practical usage') },
  { id: 'S3.4', parent: 'S3', name: t('NMO、叠加与速度分析', 'NMO, Stacking & Velocity Analysis'), desc: t('从 CMP 道集到叠加剖面', 'From CMP gathers to the stacked section') },
  { id: 'S3.5', parent: 'S3', name: t('偏移成像', 'Migration Imaging'), desc: t('绕射收敛、爆炸反射面与 Kirchhoff 偏移', 'Diffraction collapse, the exploding-reflector model and Kirchhoff migration') },
  { id: 'S3.6', parent: 'S3', name: t('分辨率、子波与调谐', 'Resolution, Wavelet & Tuning'), desc: t('垂向/横向分辨率与薄层调谐', 'Vertical/lateral resolution and thin-bed tuning') },
  { id: 'S3.7', parent: 'S3', name: t('透射损失与多次波', 'Transmission Loss & Multiples'), desc: t('层间透射衰减与周期性多次波', 'Interbed transmission loss and periodic multiples') },

  // ───────────────────────── S4 震源物理 ─────────────────────────
  { id: 'S4', name: t('震源物理', 'Source Physics'), desc: t('地震为何发生、有多大、怎么破裂', 'Why earthquakes happen, how large they are and how they rupture') },
  { id: 'S4.1', parent: 'S4', name: t('矩张量与双力偶', 'Moment Tensor & Double Couple'), desc: t('震源的力学等价表示', 'Mechanically equivalent representation of a source') },
  { id: 'S4.2', parent: 'S4', name: t('震级标度', 'Magnitude Scales'), desc: t('ML、mb、Ms、Mw 的换算与饱和', 'Conversions among ML, mb, Ms, Mw and their saturation') },
  { id: 'S4.3', parent: 'S4', name: t('震源谱与尺度律', 'Source Spectra & Scaling'), desc: t('ω² 模型、Brune 谱与拐角频率', 'ω² model, Brune spectrum and corner frequency') },
  { id: 'S4.4', parent: 'S4', name: t('位错理论与静态位移场', 'Dislocation Theory & Static Displacement'), desc: t('弹性位错、位错面与静态形变', 'Elastic dislocation, fault planes and static deformation') },
  { id: 'S4.5', parent: 'S4', name: t('应力降与断裂能量', 'Stress Drop & Fracture Energy'), desc: t('静态/动态应力降、视应力与辐射效率', 'Static/dynamic stress drop, apparent stress and radiation efficiency') },
  { id: 'S4.6', parent: 'S4', name: t('震源时间函数与破裂过程', 'Source Time Function & Rupture'), desc: t('破裂持续时间、上升时间与方向性', 'Rupture duration, rise time and directivity') },
  { id: 'S4.7', parent: 'S4', name: t('矩张量反演与分解', 'Moment Tensor Inversion & Decomposition'), desc: t('ISO/DC/CLVD 分解与误差', 'ISO/DC/CLVD decomposition and uncertainty') },

  // ───────────────────────── S5 面波与自由振荡 ─────────────────────────
  { id: 'S5', name: t('面波与自由振荡', 'Surface Waves & Free Oscillations'), desc: t('束缚在界面和整个地球上的振动', 'Motions trapped at interfaces and vibrations of the whole Earth') },
  { id: 'S5.1', parent: 'S5', name: t('Love 波频散', 'Love Wave Dispersion'), desc: t('SH 波在低速层中的导波', 'SH guided waves in a low-velocity layer') },
  { id: 'S5.2', parent: 'S5', name: t('Rayleigh 波', 'Rayleigh Waves'), desc: t('P–SV 耦合的椭圆极化', 'Elliptical polarization from coupled P–SV motion') },
  { id: 'S5.3', parent: 'S5', name: t('频散测量与反演', 'Dispersion Measurement & Inversion'), desc: t('频散曲线到速度结构', 'From dispersion curves to velocity structure') },
  { id: 'S5.4', parent: 'S5', name: t('面波各向异性', 'Surface-wave Anisotropy'), desc: t('方位各向异性与 2ψ/4ψ 项', 'Azimuthal anisotropy and the 2ψ/4ψ terms') },
  { id: 'S5.5', parent: 'S5', name: t('地球自由振荡', 'Earth Free Oscillations'), desc: t('球型模与环型模的本征频率', 'Eigenfrequencies of spheroidal and toroidal modes') },
  { id: 'S5.6', parent: 'S5', name: t('简正模与球谐展开', 'Normal Modes & Spherical Harmonics'), desc: t('球谐函数与简正模求和', 'Spherical harmonics and normal-mode summation') },

  // ───────────────────────── S6 衰减与 Q ─────────────────────────
  { id: 'S6', name: t('衰减与 Q 值', 'Attenuation & Q'), desc: t('波为什么会越来越弱', 'Why waves get weaker as they travel') },
  { id: 'S6.1', parent: 'S6', name: t('品质因子 Q', 'The Quality Factor Q'), desc: t('振幅衰减、能量损失的定义', 'Defining amplitude decay and energy loss') },
  { id: 'S6.2', parent: 'S6', name: t('t* 算子与频谱比', 'The t* Operator & Spectral Ratios'), desc: t('沿路径累积的衰减效应', 'Attenuation accumulated along the path') },
  { id: 'S6.3', parent: 'S6', name: t('吸收带模型与物理机制', 'Absorption-band Models & Mechanisms'), desc: t('标准线性固体、幂律 Q 与热激活', 'Standard linear solid, power-law Q and thermal activation') },
  { id: 'S6.4', parent: 'S6', name: t('Q 的提取方法', 'Measuring Q'), desc: t('谱比法、脉宽法、Lg 与 coda Q', 'Spectral ratio, pulse broadening, Lg and coda Q') },

  // ───────────────────────── S7 地球内部结构 ─────────────────────────
  { id: 'S7', name: t('地球内部结构', 'Earth Internal Structure'), desc: t('由地震学反推出的地球分层', 'Earth layering inferred from seismology') },
  { id: 'S7.1', parent: 'S7', name: t('一维速度模型', '1D Velocity Models'), desc: t('PREM、IASP91、AK135', 'PREM, IASP91, AK135') },
  { id: 'S7.2', parent: 'S7', name: t('密度与压力剖面', 'Density & Pressure Profiles'), desc: t('Adams–Williamson 方程与静水压平衡', 'The Adams–Williamson equation and hydrostatic equilibrium') },
  { id: 'S7.3', parent: 'S7', name: t('地幔与地核结构', 'Mantle & Core Structure'), desc: t('间断面、D″层、内外核', 'Discontinuities, the D″ layer, inner and outer core') },
  { id: 'S7.4', parent: 'S7', name: t('接收函数与转换波', 'Receiver Functions & Converted Phases'), desc: t('Ps 转换波与 H–κ 叠加', 'Ps converted phases and H–κ stacking') },
  { id: 'S7.5', parent: 'S7', name: t('各向异性与剪切波分裂', 'Anisotropy & Shear-wave Splitting'), desc: t('快慢波延迟与分裂参数', 'Fast/slow delay times and splitting parameters') },

  // ───────────────────────── S8 观测与仪器 ─────────────────────────
  { id: 'S8', name: t('地震观测与仪器', 'Observation & Instrumentation'), desc: t('地面运动如何被记录下来', 'How ground motion gets recorded') },
  { id: 'S8.1', parent: 'S8', name: t('地震计原理', 'Seismometer Principles'), desc: t('阻尼振子、运动方程、传递函数', 'Damped oscillator, equation of motion, transfer function') },
  { id: 'S8.2', parent: 'S8', name: t('仪器响应与去卷积', 'Instrument Response & Deconvolution'), desc: t('零极点表示与响应去除', 'Pole–zero representation and response removal') },
  { id: 'S8.3', parent: 'S8', name: t('台阵与波数滤波', 'Arrays & Wavenumber Filtering'), desc: t('慢度估计、聚束与 f-k 分析', 'Slowness estimation, beamforming and f–k analysis') },
  { id: 'S8.4', parent: 'S8', name: t('噪声与场地响应', 'Noise & Site Response'), desc: t('噪声模型、H/V 谱比与场地放大', 'Noise models, H/V spectral ratios and site amplification') },

  // ───────────────────────── S9 数据处理与信号分析 ─────────────────────────
  { id: 'S9', name: t('数据处理与信号分析', 'Data Processing & Signal Analysis'), desc: t('从原始记录到可用信息', 'From raw records to usable information') },
  { id: 'S9.1', parent: 'S9', name: t('采样与假频', 'Sampling & Aliasing'), desc: t('Nyquist 定理及其工程后果', 'Nyquist theorem and its engineering consequences') },
  { id: 'S9.2', parent: 'S9', name: t('褶积、相关与滤波', 'Convolution, Correlation & Filtering'), desc: t('线性时不变系统的全部实用性', 'All the practical power of LTI systems') },
  { id: 'S9.3', parent: 'S9', name: t('谱估计与窗函数', 'Spectral Estimation & Windows'), desc: t('周期图、多窗谱与泄漏', 'Periodogram, multitaper and leakage') },
  { id: 'S9.4', parent: 'S9', name: t('时频分析', 'Time–frequency Analysis'), desc: t('STFT、小波与 S 变换', 'STFT, wavelets and the S transform') },
  { id: 'S9.5', parent: 'S9', name: t('反褶积与子波估计', 'Deconvolution & Wavelet Estimation'), desc: t('维纳滤波、预测反褶积与稀疏脉冲', 'Wiener filtering, predictive deconvolution and sparse spikes') },
  { id: 'S9.6', parent: 'S9', name: t('互相关与背景噪声', 'Cross-correlation & Ambient Noise'), desc: t('经验 Green 函数与噪声成像', 'Empirical Green functions and noise-based imaging') },

  // ───────────────────────── S10 反演 ─────────────────────────
  { id: 'S10', name: t('地震学反演', 'Seismological Inversion'), desc: t('由观测回到模型参数', 'Getting back to model parameters from observations') },
  { id: 'S10.1', parent: 'S10', name: t('线性反演与正则化', 'Linear Inversion & Regularization'), desc: t('最小二乘、阻尼、分辨率', 'Least squares, damping, resolution') },
  { id: 'S10.2', parent: 'S10', name: t('走时层析成像', 'Travel-time Tomography'), desc: t('射线覆盖与反演网格', 'Ray coverage and inversion grids') },
  { id: 'S10.3', parent: 'S10', name: t('贝叶斯与概率反演', 'Bayesian & Probabilistic Inversion'), desc: t('先验、似然与后验采样', 'Priors, likelihood and posterior sampling') },
  { id: 'S10.4', parent: 'S10', name: t('全波形反演', 'Full-waveform Inversion'), desc: t('伴随状态法与梯度', 'The adjoint-state method and gradients') },
  { id: 'S10.5', parent: 'S10', name: t('分辨率与不确定性', 'Resolution & Uncertainty'), desc: t('分辨率矩阵、协方差与权衡曲线', 'Resolution matrix, covariance and trade-off curves') },

  // ───────────────────────── S11 强地面运动与地震灾害 ─────────────────────────
  { id: 'S11', name: t('强地面运动与地震灾害', 'Strong Motion & Seismic Hazard'), desc: t('地震动有多大、会造成什么', 'How strong the shaking is and what it causes') },
  { id: 'S11.1', parent: 'S11', name: t('地震动参数', 'Ground-motion Parameters'), desc: t('PGA、PGV、PGD、谱加速度与 Arias 强度', 'PGA, PGV, PGD, spectral acceleration and Arias intensity') },
  { id: 'S11.2', parent: 'S11', name: t('地震动预测方程', 'Ground-motion Prediction Equations'), desc: t('GMPE 的函数形式与回归', 'Functional form and regression of GMPEs') },
  { id: 'S11.3', parent: 'S11', name: t('场地放大效应', 'Site Amplification'), desc: t('土层共振、放大因子与 Vs30', 'Soil resonance, amplification factors and Vs30') },
  { id: 'S11.4', parent: 'S11', name: t('地震烈度', 'Seismic Intensity'), desc: t('MMI、EMS-98 与烈度—地震动换算', 'MMI, EMS-98 and intensity–motion conversions') },
  { id: 'S11.5', parent: 'S11', name: t('概率地震危险性分析', 'Probabilistic Seismic Hazard Analysis'), desc: t('PSHA 的积分与超越概率', 'The PSHA integral and exceedance probability') },

  // ───────────────────────── S12 统计地震学 ─────────────────────────
  { id: 'S12', name: t('统计地震学', 'Statistical Seismology'), desc: t('地震在时间与大小上的统计规律', 'Statistical regularities of earthquakes in time and size') },
  { id: 'S12.1', parent: 'S12', name: t('Gutenberg–Richter 定律', 'The Gutenberg–Richter Law'), desc: t('震级—频度关系与 b 值', 'Magnitude–frequency relation and the b value') },
  { id: 'S12.2', parent: 'S12', name: t('余震衰减与触发', 'Aftershock Decay & Triggering'), desc: t('Omori 定律与 Bath 定律', "Omori's law and Bath's law") },
  { id: 'S12.3', parent: 'S12', name: t('点过程与复发模型', 'Point Processes & Recurrence'), desc: t('泊松过程、BPT 与复发间隔', 'Poisson process, BPT and recurrence intervals') },
  { id: 'S12.4', parent: 'S12', name: t('b 值估计与完备性', 'b-value Estimation & Completeness'), desc: t('Aki 极大似然估计与 Mc 确定', 'Aki maximum-likelihood estimator and Mc determination') },
  { id: 'S12.5', parent: 'S12', name: t('ETAS 与可预测性', 'ETAS & Predictability'), desc: t('传染型余震序列模型', 'The epidemic-type aftershock sequence model') },

  // ───────────────────────── S13 岩石物理与介质性质 ─────────────────────────
  { id: 'S13', name: t('岩石物理与介质性质', 'Rock Physics & Medium Properties'), desc: t('地震波速与岩石物性之间的桥梁', 'The bridge between seismic velocity and rock properties') },
  { id: 'S13.1', parent: 'S13', name: t('速度与孔隙度关系', 'Velocity–Porosity Relations'), desc: t('Wyllie 时间平均、Raymer 与临界孔隙度', 'Wyllie time-average, Raymer and critical porosity') },
  { id: 'S13.2', parent: 'S13', name: t('Gassmann 方程', "Gassmann's Equations"), desc: t('流体替换与饱和效应', 'Fluid substitution and saturation effects') },
  { id: 'S13.3', parent: 'S13', name: t('Biot 孔隙弹性理论', "Biot's Poroelasticity"), desc: t('快/慢纵波与 Biot 系数', 'Fast/slow P waves and Biot coefficients') },
  { id: 'S13.4', parent: 'S13', name: t('经验速度—岩性关系', 'Empirical Velocity–Lithology Relations'), desc: t('Gardner 关系、泥岩基线、AVO 岩性指示', 'Gardner relation, mudrock line, AVO lithology indicators') },
]

/** 分面筛选用：目标读者 → 中文/英文标签与颜色 */
export const AUDIENCE_META: Record<string, { zh: string; en: string; color: string }> = {
  highschool: { zh: '高中', en: 'High school', color: '#639922' },
  bachelor:   { zh: '本科', en: 'Bachelor',    color: '#185FA5' },
  master:     { zh: '硕士', en: 'Master',      color: '#BA7517' },
  phd:        { zh: '博士', en: 'PhD',         color: '#993C1D' },
}

/** 一套独立的分类/编目体系 */
export interface FacetSystem {
  id: string
  name: BText
  desc: BText
  /** 体系内部的类目；subject 体系带层级，其余为平铺 */
  items: TaxoNode[]
  /** 是否允许一条公式同时属于多个类目 */
  multi: boolean
  color: string
}

/**
 * 全站分类体系清单。
 * subject 是主体系（层级树），其余三套是交叉体系（多值），
 * 配合 audience / complete 两个内置属性，一共 5 个可排序/筛选/聚合的维度。
 */
export const SYSTEMS: FacetSystem[] = [
  {
    id: 'subject',
    name: t('学科体系', 'Subject'),
    desc: t('按地震学自身的知识结构组织，由浅入深、层级递进', 'Organised by the internal structure of seismology, hierarchical and progressive'),
    items: TAXONOMY,
    multi: false,
    color: '#185FA5',
  },
  {
    id: 'math',
    name: t('数学工具体系', 'Mathematical toolbox'),
    desc: t('按「推导过程中实际用到的数学手段」重组：哪些公式共享同一套工具', 'Regrouped by the mathematics actually used in each derivation'),
    items: [
      { id: 'MATH.DIFF', name: t('微分方程', 'Differential equations'), desc: t('ODE 与 PDE 的建立与求解', 'Setting up and solving ODEs and PDEs') },
      { id: 'MATH.FOURIER', name: t('Fourier 与谱分析', 'Fourier & spectral analysis'), desc: t('时频互换、频谱、滤波', 'Time–frequency transform, spectra, filtering') },
      { id: 'MATH.VECTOR', name: t('矢量与张量分析', 'Vector & tensor calculus'), desc: t('梯度散度旋度、二阶张量', 'Gradient, divergence, curl, second-rank tensors') },
      { id: 'MATH.LINALG', name: t('线性代数与矩阵', 'Linear algebra & matrices'), desc: t('特征值、最小二乘、矩阵求逆', 'Eigenvalues, least squares, matrix inversion') },
      { id: 'MATH.COMPLEX', name: t('复数与相位', 'Complex numbers & phase'), desc: t('相量表示、传递函数、零极点', 'Phasors, transfer functions, poles and zeros') },
      { id: 'MATH.GEOM', name: t('几何与三角', 'Geometry & trigonometry'), desc: t('路径、射线几何、勾股关系', 'Path length, ray geometry, Pythagorean relations') },
      { id: 'MATH.ALGEBRA', name: t('代数与方程', 'Algebra & equations'), desc: t('联立求解、因式分解、边界条件代数', 'Solving simultaneous equations, factorisation, boundary-condition algebra') },
      { id: 'MATH.APPROX', name: t('展开与近似', 'Expansions & approximations'), desc: t('Taylor 展开、线性化、弱反差', 'Taylor expansion, linearisation, weak contrast') },
      { id: 'MATH.ROOT', name: t('超越方程求根', 'Transcendental root-finding'), desc: t('频散方程等隐函数的数值求解', 'Numerical solution of implicit equations such as dispersion relations') },
      { id: 'MATH.TRANSFORM', name: t('积分变换', 'Integral transforms'), desc: t('Laplace、Hankel、Radon 与 τ–p 等变换对', 'Laplace, Hankel, Radon and τ–p transform pairs') },
      { id: 'MATH.STAT', name: t('概率与统计', 'Probability & statistics'), desc: t('分布、似然、回归、点过程', 'Distributions, likelihood, regression, point processes') },
    ],
    multi: true,
    color: '#7F77DD',
  },
  {
    id: 'method',
    name: t('方法与应用体系', 'Method & application'),
    desc: t('按「在现场用这套公式干什么活」重组', 'Regrouped by what the formula is used for in practice'),
    items: [
      { id: 'METH.EXPL', name: t('反射地震勘探', 'Reflection seismology'), desc: t('油气与工程勘探的处理—解释链条', 'The processing–interpretation chain in hydrocarbon and engineering surveys') },
      { id: 'METH.TELE', name: t('天然地震学', 'Earthquake seismology'), desc: t('震源参数、走时、震级', 'Source parameters, travel times, magnitude') },
      { id: 'METH.SURF', name: t('面波与频散', 'Surface waves & dispersion'), desc: t('背景噪声、面波成像', 'Ambient noise and surface-wave imaging') },
      { id: 'METH.STRUCT', name: t('内部结构', 'Internal structure'), desc: t('速度/密度剖面的建立', 'Building velocity and density profiles') },
      { id: 'METH.INSTR', name: t('观测与仪器', 'Instrumentation'), desc: t('台站建设、仪器响应', 'Station siting and instrument response') },
      { id: 'METH.PROC', name: t('数据处理', 'Data processing'), desc: t('采样、滤波、去卷积', 'Sampling, filtering, deconvolution') },
      { id: 'METH.INV', name: t('反演与成像', 'Inversion & imaging'), desc: t('正则化、层析', 'Regularisation, tomography') },
      { id: 'METH.ATTEN', name: t('衰减成像', 'Attenuation imaging'), desc: t('Q 与 t* 的提取', 'Extracting Q and t*') },
      { id: 'METH.HAZARD', name: t('强地面运动与灾害', 'Strong motion & hazard'), desc: t('地震动预测、场地效应、危险性', 'Ground-motion prediction, site effects, hazard') },
      { id: 'METH.STAT', name: t('统计地震学', 'Statistical seismology'), desc: t('目录统计、发生率、预报检验', 'Catalogue statistics, rates, forecast testing') },
      { id: 'METH.ROCK', name: t('岩石物理', 'Rock physics'), desc: t('速度—物性转换、流体替换', 'Velocity–property transforms, fluid substitution') },
    ],
    multi: true,
    color: '#0F6E56',
  },
  {
    id: 'quantity',
    name: t('核心物理量体系', 'Core physical quantity'),
    desc: t('按「这条公式最终回答的那个数是什么」重组', 'Regrouped by which quantity the formula ultimately delivers'),
    items: [
      { id: 'Q.VEL', name: t('速度与慢度', 'Velocity & slowness'), desc: t('α、β、c、射线参数 p', 'α, β, c, ray parameter p') },
      { id: 'Q.TIME', name: t('走时与校正', 'Travel time & corrections'), desc: t('t、Δt_NMO', 't, Δt_NMO') },
      { id: 'Q.AMP', name: t('振幅与能量', 'Amplitude & energy'), desc: t('R、T、谱、震级、Q', 'R, T, spectra, magnitude, Q') },
      { id: 'Q.FREQ', name: t('频率与尺度', 'Frequency & scale'), desc: t('拐角频率、假频、震源尺度', 'corner frequency, aliasing, source dimension') },
      { id: 'Q.MAT', name: t('介质弹性参数', 'Elastic parameters'), desc: t('λ、μ、K、ν、ρ', 'λ, μ, K, ν, ρ') },
      { id: 'Q.TENSOR', name: t('张量与场量', 'Tensors & fields'), desc: t('应力、应变、矩张量', 'stress, strain, moment tensor') },
      { id: 'Q.GEOM', name: t('几何与深度', 'Geometry & depth'), desc: t('H、z、r、倾角', 'thickness, depth, radius, dip') },
      { id: 'Q.SOURCE', name: t('震源参数', 'Source parameters'), desc: t('M₀、Mw、Δσ、破裂尺度', 'M₀, Mw, Δσ, rupture dimension') },
      { id: 'Q.HAZARD', name: t('灾害与地震动', 'Hazard & ground motion'), desc: t('PGA、SA、烈度、超越概率', 'PGA, SA, intensity, exceedance probability') },
    ],
    multi: true,
    color: '#BA7517',
  },
]

export const COMPLETE_META: Record<string, { desc: { zh: string; en: string } }> = {
  L1: { desc: { zh: '条目 + 符号表',              en: 'Entry + symbol table' } },
  L2: { desc: { zh: '含完整分步推导',             en: 'Full step-by-step derivation' } },
  L3: { desc: { zh: '含交互可视化',               en: 'Interactive visualization' } },
  L4: { desc: { zh: '含数值仿真 / 算例 / 代码',   en: 'Simulation / worked example / code' } },
}
