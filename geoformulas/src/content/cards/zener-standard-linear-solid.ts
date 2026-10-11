import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** zener-standard-linear-solid */
const zenerStandardLinearSolid: FormulaCard = {
  id: 'zener-standard-linear-solid',
  name: t('标准线性固体（Zener）模型的复模量', 'Complex Modulus of the Standard Linear Solid (Zener) Model'),
  aliases: {
    zh: ['Zener 模型', '标准线性固体', 'SLS', '三参数黏弹性模型'],
    en: ['Zener model', 'standard linear solid', 'SLS', 'three-parameter viscoelastic model'],
  },
  node: 'S1.7',
  tags: {
    subject: 'S1.7',
    math: ['MATH.COMPLEX', 'MATH.DIFF', 'MATH.FOURIER'],
    method: ['METH.ATTEN', 'METH.ROCK'],
    quantity: ['Q.MAT', 'Q.FREQ'],
    keywords: t('Zener 标准线性固体 松弛时间 蠕变时间 未松弛模量 松弛模量 复模量 弹簧 黏壶 Maxwell', 'Zener standard linear solid relaxation time retardation time unrelaxed modulus relaxed modulus complex modulus spring dashpot Maxwell'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\sigma+\tau_{\sigma}\,\dot{\sigma}=M_{R}\left(\varepsilon+\tau_{\varepsilon}\,\dot{\varepsilon}\right)\;\Longrightarrow\; M^{*}(\omega)=M_{R}\,\frac{1+i\omega\tau_{\varepsilon}}{1+i\omega\tau_{\sigma}}`,
    variants: [
      {
        name: t('实部与虚部分开', 'Real and imaginary parts separated'),
        latex: String.raw`M'(\omega)=M_{R}\,\frac{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}}{1+\omega^{2}\tau_{\sigma}^{2}},\qquad M''(\omega)=M_{R}\,\frac{\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\sigma}^{2}}`,
      },
      {
        name: t('低频与高频极限：松弛与未松弛模量', 'Low- and high-frequency limits: relaxed and unrelaxed moduli'),
        latex: String.raw`M^{*}(0)=M_{R},\qquad M^{*}(\infty)=M_{R}\,\frac{\tau_{\varepsilon}}{\tau_{\sigma}}\equiv M_{U}>M_{R}`,
      },
      {
        name: t('对应的衰减（Q 的倒数）', 'The associated attenuation (inverse Q)'),
        latex: String.raw`Q^{-1}(\omega)=\frac{M''}{M'}=\frac{\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}}`,
      },
      {
        name: t('用 M_U 与松弛强度 Δ 表示', 'In terms of M_U and the relaxation strength Δ'),
        latex: String.raw`\Delta=\frac{M_{U}-M_{R}}{M_{R}}=\frac{\tau_{\varepsilon}-\tau_{\sigma}}{\tau_{\sigma}},\qquad M^{*}=M_{U}-\frac{M_{U}-M_{R}}{1+i\omega\tau_{\sigma}}`,
      },
      {
        name: t('蠕变柔量形式（ retardation 形式）', 'Creep-compliance (retardation) form'),
        latex: String.raw`J^{*}(\omega)=\frac{1}{M^{*}}=J_{U}\,\frac{1+i\omega\tau_{\sigma}}{1+i\omega\tau_{\varepsilon}},\qquad J_{U}=\frac{1}{M_{U}}`,
      },
    ],
  },
  meaning: t(
    'Zener 模型（标准线性固体，SLS）是能同时给出「瞬时弹性 + 延迟弹性 + 稳态流变之外不流动」的最简单网络：一根弹簧 M_R 与一个 Maxwell 元件并联。它只有三个参数（M_R、τ_σ、τ_ε），却同时刻画了模量随频率的台阶式上升和衰减随频率的单峰。几乎所有关于「Q 随频率变化」的定性讨论，都是从这条 M*(ω) 出发的。',
    'The Zener model, or standard linear solid (SLS), is the simplest network that delivers instantaneous elasticity plus delayed elasticity without steady flow: a spring M_R in parallel with a Maxwell element. It has only three parameters (M_R, τ_σ, τ_ε) yet captures both the step-like rise of the modulus with frequency and the single peak of attenuation. Essentially every qualitative discussion of how Q varies with frequency starts from this M*(ω).',
  ),
  symbols: [
    { sym: 'M_R', name: t('松弛（低频）模量', 'relaxed (low-frequency) modulus'), unit: 'Pa', typical: '10¹⁰ – 10¹¹' },
    { sym: 'M_U', name: t('未松弛（高频）模量', 'unrelaxed (high-frequency) modulus'), unit: 'Pa', typical: 'M_R(1+Δ)，Δ ≈ 0.01 – 0.3' },
    { sym: '\\tau_\\sigma', name: t('应力松弛时间（恒应变下的衰减时间）', 'stress relaxation time (decay time at constant strain)'), unit: 's', typical: '10⁻⁶ – 10⁶' },
    { sym: '\\tau_\\varepsilon', name: t('应变滞后（蠕变）时间（恒应力下）', 'strain retardation (creep) time at constant stress'), unit: 's', typical: '10⁻⁶ – 10⁶' },
    { sym: '\\Delta', name: t('松弛强度 (M_U − M_R)/M_R', 'relaxation strength (M_U − M_R)/M_R'), unit: '1', typical: '0.01 – 0.3' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s', typical: '10⁻² – 10³' },
    { sym: 'J^{*}', name: t('复柔量', 'complex compliance'), unit: 'Pa⁻¹' },
  ],
  conditions: {
    applies: [
      t('单一弛豫机制的线性黏弹性介质（如颗粒边界滑移、晶内位错、流体局部流动）', 'Linear viscoelastic media dominated by a single relaxation mechanism (grain-boundary sliding, intracrystalline dislocations, local fluid flow)'),
      t('作为构建「多个机制叠加」模型的基本单元', 'As the building block of multi-mechanism superposition models'),
    ],
    assumes: [
      t('τ_ε > τ_σ > 0，否则 M_U < M_R，违反被动性', 'τ_ε > τ_σ > 0; otherwise M_U < M_R, violating passivity'),
      t('采用 e^{+iωt} 时间约定', 'The e^{+iωt} time convention is used'),
      t('应变为无限小，参数为常数（不随温度、压力变）', 'Infinitesimal strain and constant parameters (no temperature or pressure dependence)'),
    ],
    breaks: [
      t('真实地球在地震频带内 Q 近似常数，单一 SLS 只在 τ 附近有一个 Debye 峰，必须叠加多个机制', 'The real Earth has nearly constant Q across the seismic band, whereas a single SLS has only one Debye peak near τ; several mechanisms must be superposed'),
      t('温度、压力变化会移动 τ（Arrhenius 关系），等温假设在深部不成立', 'Temperature and pressure shift τ (Arrhenius behaviour), so the isothermal assumption fails at depth'),
      t('高应变振幅下的非线性流变不能用固定 τ 描述', 'Nonlinear rheology at high strain amplitude cannot be described by a fixed τ'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('Zener 模型的本构方程', 'The constitutive equation of the Zener model'),
      latex: String.raw`\sigma+\tau_{\sigma}\dot{\sigma}=M_{R}\left(\varepsilon+\tau_{\varepsilon}\dot{\varepsilon}\right)`,
      note: t('左边是 Maxwell 元件的行为，右边是并联弹簧 M_R 与黏壶的组合。两个 τ 分别量度「应力松弛」与「应变滞后」。', 'The left-hand side encodes a Maxwell element, the right-hand side a spring M_R working against a dashpot. The two τ measure stress relaxation and strain retardation respectively.'),
    },
    {
      n: 2,
      op: 'transform',
      title: t('代入谐和扰动：时间导数变成 iω', 'Insert harmonic disturbances: time derivatives become iω'),
      latex: String.raw`\varepsilon=\varepsilon_{0}e^{i\omega t},\ \sigma=\sigma_{0}e^{i\omega t}\;\Longrightarrow\; \sigma_{0}\left(1+i\omega\tau_{\sigma}\right)=M_{R}\varepsilon_{0}\left(1+i\omega\tau_{\varepsilon}\right)`,
      note: t('这是把微分方程变成代数方程的全部代价 —— 也是谐和假定最大的便利。', 'This is the entire cost of turning a differential equation into an algebraic one, and the biggest convenience of the harmonic assumption.'),
    },
    {
      n: 3,
      op: 'algebra',
      title: t('取比值即得复模量', 'Take the ratio to obtain the complex modulus'),
      latex: String.raw`M^{*}(\omega)=\frac{\sigma_{0}}{\varepsilon_{0}}=M_{R}\,\frac{1+i\omega\tau_{\varepsilon}}{1+i\omega\tau_{\sigma}}`,
    },
    {
      n: 4,
      op: 'algebra',
      title: t('分子分母同乘共轭，分离实虚部', 'Multiply by the conjugate to separate real and imaginary parts'),
      latex: String.raw`M^{*}=M_{R}\,\frac{\left(1+i\omega\tau_{\varepsilon}\right)\left(1-i\omega\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\sigma}^{2}}=M_{R}\,\frac{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}+i\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\sigma}^{2}}`,
      note: t('虚部只在 τ_ε ≠ τ_σ 时才不为零：两个时间常数相等意味着模量不随频率变，也就没有耗散。', 'The imaginary part is non-zero only when τ_ε ≠ τ_σ: equal time constants would mean a frequency-independent modulus and hence no dissipation.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('两个极限：低频松弛、高频未松弛', 'The two limits: relaxed at low frequency, unrelaxed at high frequency'),
      latex: String.raw`M'\left(0\right)=M_{R},\qquad M'\left(\infty\right)=M_{R}\frac{\tau_{\varepsilon}}{\tau_{\sigma}}=M_{U},\qquad \Delta=\frac{M_{U}-M_{R}}{M_{R}}=\frac{\tau_{\varepsilon}-\tau_{\sigma}}{\tau_{\sigma}}`,
      note: t('物理图像：频率太低时，黏壶有时间松弛，介质显得软（M_R）；频率太高时黏壶来不及动，介质显得硬（M_U）。台阶高度就是 Δ。', 'The physical picture: at very low frequency the dashpot has time to relax and the medium appears soft (M_R); at very high frequency it cannot keep up and the medium appears stiff (M_U). The step height is Δ.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('对应的 Q⁻¹：一个单峰', 'The corresponding Q⁻¹: a single peak'),
      latex: String.raw`Q^{-1}(\omega)=\frac{M''}{M'}=\frac{\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}},\qquad \omega_{\text{峰}}=\frac{1}{\sqrt{\tau_{\varepsilon}\tau_{\sigma}}}`,
      note: t('峰值位置在几何平均时间 √(τ_ετ_σ) 的倒数上，峰值高度是 (τ_ε−τ_σ)/(2√(τ_ετ_σ)) —— 这就是 Debye 峰。', 'The peak sits at the reciprocal of the geometric mean time √(τ_ετ_σ) with height (τ_ε−τ_σ)/(2√(τ_ετ_σ)); that is the Debye peak.'),
    },
  ],
  viz: [
    {
      id: 'zener-modulus-vs-frequency',
      level: 'V1',
      title: t('Zener 模型的储能模量与损耗模量随频率的变化', 'Storage and loss modulus of the Zener model versus frequency'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('模量 (Pa)', 'modulus (Pa)'),
      xScale: 'log',
      controls: [
        { id: 'mr', label: t('松弛模量 M_R', 'relaxed modulus M_R'), min: 5, max: 200, step: 1, value: 60, unit: 'GPa' },
        { id: 'lts', label: t('log₁₀ τ_σ (s)', 'log₁₀ τ_σ (s)'), min: -6, max: 4, step: 0.1, value: -3, unit: '1' },
        { id: 'lte', label: t('log₁₀ τ_ε (s)', 'log₁₀ τ_ε (s)'), min: -6, max: 4, step: 0.1, value: -1, unit: '1' },
      ],
      xRange: [1e-6, 1e6],
      note: t('M′ 是一条从 M_R 上升到 M_U 的 S 形台阶，拐点在 f ≈ 1/(2πτ_σ)；M″ 则是一个钟形峰，峰在 f ≈ 1/(2π√(τ_ετ_σ))。把 τ_ε 与 τ_σ 拉近，台阶变矮、峰变低 —— 两个时间常数相等时耗散完全消失。', 'M′ is a sigmoid step rising from M_R to M_U with its inflection near f ≈ 1/(2πτ_σ), while M″ is a bell-shaped peak at f ≈ 1/(2π√(τ_ετ_σ)). Bringing τ_ε and τ_σ closer lowers both the step and the peak; when the two time constants are equal dissipation disappears entirely.'),
      compute: (p) => {
        const mr = p['mr'] * 1e9
        const ts = Math.pow(10, p['lts'])
        const te = Math.pow(10, p['lte'])
        if (!(te > ts && ts > 0)) return []
        const mp: Array<[number, number]> = []
        const mpp: Array<[number, number]> = []
        const refR: Array<[number, number]> = []
        const refU: Array<[number, number]> = []
        const N = 400
        const f0 = 1e-6
        const f1 = 1e6
        for (let i = 0; i <= N; i++) {
          const f = Math.pow(10, Math.log10(f0) + (i / N) * Math.log10(f1 / f0))
          const w = 2 * Math.PI * f
          const den = 1 + w * w * ts * ts
          const r = mr * (1 + w * w * te * ts) / den
          const im = mr * (w * (te - ts)) / den
          mp.push([f, r])
          mpp.push([f, im])
          refR.push([f, mr])
          refU.push([f, (mr * te) / ts])
        }
        return [
          { label: t('储能模量 M′', 'storage modulus M′'), color: '#185FA5', points: mp },
          { label: t('损耗模量 M″', 'loss modulus M″'), color: '#BA7517', points: mpp },
          { label: t('M_R（低频极限）', 'M_R (low-frequency limit)'), color: '#B4B2A9', dash: true, points: refR },
          { label: t('M_U（高频极限）', 'M_U (high-frequency limit)'), color: '#993C1D', dash: true, points: refU },
        ]
      },
    },
  ],
  links: {
    upstream: [{ id: 'complex-modulus', note: t('M* = M′ + iM″ 的一般框架', 'the general framework M* = M′ + iM″') }],
    downstream: [
      { id: 'debye-peak-relaxation', note: t('Q⁻¹(ω) 的单峰结构', 'the single-peak structure of Q⁻¹(ω)') },
      { id: 'q-from-complex-modulus', note: t('由 M″/M′ 得到 Q', 'obtaining Q from M″/M′') },
    ],
    seealso: [{ id: 'quality-factor-q', note: t('Q 的宏观定义', 'the macroscopic definition of Q') }],
  },
  refs: [
    { text: 'Zener, Elasticity and Anelasticity of Metals, University of Chicago Press (1948)' },
    { text: 'Nowick & Berry, Anelastic Relaxation in Crystalline Solids, Academic Press (1972)' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.4' },
  ],
}

export default zenerStandardLinearSolid
