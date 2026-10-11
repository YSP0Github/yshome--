import { t } from './core/types.js';
/**
 * 地震学学科分类树。
 * 一级 S0–S13：按「数学物理基础 → 介质本构 → 波传播 → 界面响应 → 震源 → 面波
 *               → 衰减 → 内部结构 → 观测 → 处理 → 反演 → 强地面运动
 *               → 统计地震学 → 岩石物理」的认识顺序排列。
 * 每条公式卡片通过 node 字段挂在这棵树上（挂在叶子节点上）。
 */
export const TAXONOMY = [
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
    // ───────────────────────── S14 重力勘探 ─────────────────────────
    { id: 'S14', name: t('重力勘探与引力场', 'Gravity Methods & Gravitational Field'), desc: t('由引力场及其异常推断地下密度分布', 'Inferring subsurface density from the gravity field and its anomalies') },
    { id: 'S14.1', parent: 'S14', name: t('万有引力与引力位', 'Gravitation & Gravitational Potential'), desc: t('Newton 万有引力、引力位及其二阶导', "Newton's law, gravitational potential and its second derivatives") },
    { id: 'S14.2', parent: 'S14', name: t('正常重力与参考场', 'Normal Gravity & Reference Field'), desc: t('正常重力公式及其随纬度、高度的变化', 'The normal-gravity formula and its variation with latitude and height') },
    { id: 'S14.3', parent: 'S14', name: t('重力校正与重力异常', 'Gravity Reductions & Anomalies'), desc: t('自由空气、布格、地形、Eötvös 校正与异常', 'Free-air, Bouguer, terrain and Eötvös corrections and anomalies') },
    { id: 'S14.4', parent: 'S14', name: t('地壳均衡与大地水准面', 'Isostasy & the Geoid'), desc: t('Airy/Pratt 均衡、大地水准面与球谐展开', 'Airy/Pratt isostasy, the geoid and spherical-harmonic expansion') },
    // ───────────────────────── S15 地磁学 ─────────────────────────
    { id: 'S15', name: t('地磁学与磁法勘探', 'Geomagnetism & Magnetic Methods'), desc: t('地磁场的成因、要素与岩石磁性记录', 'Origin and elements of the geomagnetic field and its rock-magnetic record') },
    { id: 'S15.1', parent: 'S15', name: t('磁场与磁偶极子', 'Magnetic Field & Dipoles'), desc: t('磁 Coulomb 定律、磁偶极子场与磁位', "Magnetic Coulomb's law, the dipole field and magnetic potential") },
    { id: 'S15.2', parent: 'S15', name: t('地磁要素与参考场', 'Geomagnetic Elements & IGRF'), desc: t('D/I/F/H/Z/X/Y 七要素与 IGRF 参考场', 'The D/I/F/H/Z/X/Y elements and the IGRF reference field') },
    { id: 'S15.3', parent: 'S15', name: t('岩石磁性与磁化', 'Rock Magnetism & Magnetization'), desc: t('磁化率、磁化强度、居里定律与各类剩磁', 'Susceptibility, magnetization, Curie’s law and remanence types') },
    { id: 'S15.4', parent: 'S15', name: t('古地磁、倒转与磁异常', 'Paleomagnetism, Reversals & Anomalies'), desc: t('地磁倒转、海底磁异常条带与日变改正', 'Reversals, marine magnetic-anomaly stripes and diurnal correction') },
    // ───────────────────────── S16 电法与电磁勘探 ─────────────────────────
    { id: 'S16', name: t('电法与电磁勘探', 'Electrical & Electromagnetic Methods'), desc: t('由电阻率、电化学与电磁感应探测地下', 'Probing the subsurface via resistivity, electrochemistry and induction') },
    { id: 'S16.1', parent: 'S16', name: t('电阻率与直流电法', 'Resistivity & DC Methods'), desc: t('Ohm 定律、Archie 定律、装置排列与电测深', "Ohm's and Archie's laws, electrode arrays and DC sounding") },
    { id: 'S16.2', parent: 'S16', name: t('电磁感应与大地电磁', 'EM Induction & Magnetotellurics'), desc: t('Maxwell 方程、趋肤深度与 Cagniard 视电阻率', "Maxwell's equations, skin depth and the Cagniard apparent resistivity") },
    { id: 'S16.3', parent: 'S16', name: t('激发极化', 'Induced Polarization'), desc: t('极化率、充电率与激发极化机制', 'Chargeability and the mechanisms of induced polarization') },
    // ───────────────────────── S17 测井 ─────────────────────────
    { id: 'S17', name: t('地球物理测井', 'Geophysical Well Logging'), desc: t('井中测量岩性、孔隙度与流体饱和度', 'Downhole measurement of lithology, porosity and fluid saturation') },
    { id: 'S17.1', parent: 'S17', name: t('测井方法与曲线', 'Logging Methods & Curves'), desc: t('自然伽马、电阻率、声波、密度、中子、自然电位', 'Gamma-ray, resistivity, sonic, density, neutron and SP logs') },
    { id: 'S17.2', parent: 'S17', name: t('孔隙度、饱和度与综合解释', 'Porosity, Saturation & Interpretation'), desc: t('Archie 求 Sw、泥质含量、孔隙度换算与交会解释', 'Archie Sw, shale volume, porosity conversion and cross-plot interpretation') },
    // ───────────────────────── S18 大学物理：力学与热学 ─────────────────────────
    { id: 'S18', name: t('大学物理：力学与热学', 'University Physics: Mechanics & Thermodynamics'), desc: t('经典力学、机械波与热现象的核心公式', 'Core formulas of classical mechanics, mechanical waves and thermal physics') },
    { id: 'S18.1', parent: 'S18', name: t('质点运动学', 'Particle Kinematics'), desc: t('匀加速、自由落体与抛体运动', 'Uniform acceleration, free fall and projectile motion') },
    { id: 'S18.2', parent: 'S18', name: t('Newton 定律与动力学', "Newton's Laws & Dynamics"), desc: t('Newton 三定律、摩擦力与圆周运动', "Newton's three laws, friction and circular motion") },
    { id: 'S18.3', parent: 'S18', name: t('功、能与动量', 'Work, Energy & Momentum'), desc: t('动能定理、机械能守恒、冲量动量与碰撞', 'Work–energy, conservation of mechanical energy, impulse, momentum and collisions') },
    { id: 'S18.4', parent: 'S18', name: t('刚体转动与流体', 'Rigid-body Rotation & Fluids'), desc: t('转动惯量、角动量、转动动能与流体力学', 'Moment of inertia, angular momentum, rotational kinetic energy and fluid mechanics') },
    { id: 'S18.5', parent: 'S18', name: t('振动与机械波', 'Oscillations & Mechanical Waves'), desc: t('简谐与阻尼振动、波动方程、Doppler 与声强', 'Simple/damped oscillations, the wave equation, Doppler effect and sound intensity') },
    { id: 'S18.6', parent: 'S18', name: t('热学与热力学', 'Heat & Thermodynamics'), desc: t('理想气体、热力学定律、热机效率、熵与热传导', 'Ideal gas, thermodynamic laws, heat-engine efficiency, entropy and conduction') },
    // ───────────────────────── S19 大学物理：电磁学 ─────────────────────────
    { id: 'S19', name: t('大学物理：电磁学', 'University Physics: Electromagnetism'), desc: t('静电、电路、磁、电磁感应与电磁波', 'Electrostatics, circuits, magnetism, induction and electromagnetic waves') },
    { id: 'S19.1', parent: 'S19', name: t('静电场', 'Electrostatics'), desc: t('Coulomb 定律、电场电势与 Gauss 定律', "Coulomb's law, electric field/potential and Gauss's law") },
    { id: 'S19.2', parent: 'S19', name: t('电容、电流与直流电路', 'Capacitance, Current & DC Circuits'), desc: t('电容、Ohm 定律、电阻与 Kirchhoff 定律', "Capacitance, Ohm's law, resistance and Kirchhoff's laws") },
    { id: 'S19.3', parent: 'S19', name: t('稳恒磁场', 'Magnetostatics'), desc: t('Biot-Savart、安培环路定律与 Lorentz 力', 'Biot–Savart, Ampère’s law and the Lorentz force') },
    { id: 'S19.4', parent: 'S19', name: t('电磁感应与暂态', 'Induction & Transients'), desc: t('Faraday 定律、电感、磁场能与 RL/RC 暂态', "Faraday's law, inductance, magnetic energy and RL/RC transients") },
    { id: 'S19.5', parent: 'S19', name: t('交流电、Maxwell 方程与电磁波', 'AC Circuits, Maxwell & EM Waves'), desc: t('交流阻抗与谐振、Maxwell 方程组与电磁波', 'AC impedance and resonance, Maxwell’s equations and electromagnetic waves') },
    // ───────────────────────── S20 大学物理：光学与近代物理 ─────────────────────────
    { id: 'S20', name: t('大学物理：光学与近代物理', 'University Physics: Optics & Modern Physics'), desc: t('几何/波动光学、量子、相对论与原子核', 'Geometrical/wave optics, quantum physics, relativity and the nucleus') },
    { id: 'S20.1', parent: 'S20', name: t('几何光学', 'Geometrical Optics'), desc: t('反射、Snell 折射、全反射、透镜与镜面', 'Reflection, Snell refraction, total internal reflection, lenses and mirrors') },
    { id: 'S20.2', parent: 'S20', name: t('波动光学', 'Wave Optics'), desc: t('干涉、衍射、光栅、分辨本领与偏振', 'Interference, diffraction, gratings, resolving power and polarization') },
    { id: 'S20.3', parent: 'S20', name: t('量子物理', 'Quantum Physics'), desc: t('黑体辐射、光电效应、Bohr 模型、de Broglie 与 Schrödinger', 'Blackbody radiation, photoelectric effect, Bohr model, de Broglie and Schrödinger') },
    { id: 'S20.4', parent: 'S20', name: t('狭义相对论', 'Special Relativity'), desc: t('Lorentz 变换、时空效应、质能方程与相对论动量', 'Lorentz transform, spacetime effects, mass–energy and relativistic momentum') },
    { id: 'S20.5', parent: 'S20', name: t('原子核物理', 'Nuclear Physics'), desc: t('结合能、放射性衰变与半衰期', 'Binding energy, radioactive decay and half-life') },
];
/** 分面筛选用：目标读者 → 中文/英文标签与颜色 */
export const AUDIENCE_META = {
    highschool: { zh: '高中', en: 'High school', color: '#639922' },
    bachelor: { zh: '本科', en: 'Bachelor', color: '#185FA5' },
    master: { zh: '硕士', en: 'Master', color: '#BA7517' },
    phd: { zh: '博士', en: 'PhD', color: '#993C1D' },
};
/**
 * 全站分类体系清单。
 * subject 是主体系（层级树），其余三套是交叉体系（多值），
 * 配合 audience / complete 两个内置属性，一共 5 个可排序/筛选/聚合的维度。
 */
export const SYSTEMS = [
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
            { id: 'METH.GRAV', name: t('重力勘探', 'Gravity surveying'), desc: t('重力测量、各项校正与均衡解释', 'Gravity measurement, reductions and isostatic interpretation') },
            { id: 'METH.MAG', name: t('磁法勘探', 'Magnetic surveying'), desc: t('磁测、地磁参考场与磁异常解释', 'Magnetic surveying, reference field and magnetic-anomaly interpretation') },
            { id: 'METH.EM', name: t('电法与电磁勘探', 'Electrical & EM surveying'), desc: t('直流电法、大地电磁与激发极化', 'DC resistivity, magnetotellurics and induced polarization') },
            { id: 'METH.LOG', name: t('地球物理测井', 'Well logging'), desc: t('测井采集、孔隙度与饱和度解释', 'Log acquisition, porosity and saturation interpretation') },
            { id: 'METH.PHYS', name: t('大学物理', 'University physics'), desc: t('力热电磁光与近代物理基础公式', 'Foundational formulas of mechanics, heat, EM, optics and modern physics') },
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
            { id: 'Q.GRAV', name: t('重力与引力位', 'Gravity & potential'), desc: t('g、引力位 V、重力异常', 'g, gravitational potential V, gravity anomalies') },
            { id: 'Q.MAG', name: t('磁场与磁化强度', 'Magnetic field & magnetization'), desc: t('B、H、磁位、磁化率与磁化强度', 'B, H, magnetic potential, susceptibility and magnetization') },
            { id: 'Q.ELEC', name: t('电场、电阻率与电磁量', 'Electric field, resistivity & EM'), desc: t('ρ、视电阻率、阻抗、趋肤深度', 'Resistivity, apparent resistivity, impedance, skin depth') },
            { id: 'Q.POR', name: t('孔隙度、饱和度与测井量', 'Porosity, saturation & log quantities'), desc: t('φ、Sw、泥质含量、声波时差', 'Porosity, water saturation, shale volume, sonic interval transit time') },
            { id: 'Q.ENERGY', name: t('能量、动量与热学量', 'Energy, momentum & thermal quantities'), desc: t('功、动能、动量、内能、熵与温度', 'Work, kinetic energy, momentum, internal energy, entropy and temperature') },
            { id: 'Q.OPT', name: t('光学与量子量', 'Optical & quantum quantities'), desc: t('焦距、条纹间距、能级、波长与频率', 'Focal length, fringe spacing, energy levels, wavelength and frequency') },
        ],
        multi: true,
        color: '#BA7517',
    },
];
export const COMPLETE_META = {
    L1: { desc: { zh: '条目 + 符号表', en: 'Entry + symbol table' } },
    L2: { desc: { zh: '含完整分步推导', en: 'Full step-by-step derivation' } },
    L3: { desc: { zh: '含交互可视化', en: 'Interactive visualization' } },
    L4: { desc: { zh: '含数值仿真 / 算例 / 代码', en: 'Simulation / worked example / code' } },
};
//# sourceMappingURL=taxonomy.js.map