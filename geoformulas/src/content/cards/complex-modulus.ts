import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** complex-modulus */
const complexModulus: FormulaCard = {
  id: 'complex-modulus',
  name: t('复模量 M*(ω) 与相位滞后', 'The Complex Modulus M*(ω) and Phase Lag'),
  aliases: {
    zh: ['复弹性模量', '储能模量与损耗模量', '滞回环', '相位滞后'],
    en: ['complex modulus', 'storage and loss modulus', 'hysteresis loop', 'phase lag', 'dynamic modulus'],
  },
  node: 'S1.7',
  tags: {
    subject: 'S1.7',
    math: ['MATH.COMPLEX', 'MATH.FOURIER'],
    method: ['METH.ATTEN'],
    quantity: ['Q.MAT', 'Q.AMP'],
    keywords: t('复模量 储能模量 损耗模量 相位滞后 滞回环 黏弹性 损耗角 谐波应变', 'complex modulus storage modulus loss modulus phase lag hysteresis loop viscoelasticity loss angle harmonic strain'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`M^{*}(\omega)=M'(\omega)+iM''(\omega),\qquad \varepsilon(t)=\varepsilon_{0}\,e^{i\omega t}\;\Longrightarrow\; \sigma(t)=M^{*}(\omega)\,\varepsilon(t)`,
    variants: [
      {
        name: t('时域形式：弹性项 + 黏性项', 'Time-domain form: an elastic term plus a viscous term'),
        latex: String.raw`\sigma(t)=M'\,\varepsilon(t)+\frac{M''}{\omega}\,\frac{\mathrm{d}\varepsilon}{\mathrm{d}t}`,
      },
      {
        name: t('实部与虚部分别叫储能模量与损耗模量', 'The real and imaginary parts are the storage and loss moduli'),
        latex: String.raw`M'=\left|M^{*}\right|\cos\delta_{L},\qquad M''=\left|M^{*}\right|\sin\delta_{L},\qquad \delta_{L}=\arctan\frac{M''}{M'}`,
      },
      {
        name: t('相位滞后：应力超前应变 δ_L', 'Phase lag: stress leads strain by δ_L'),
        latex: String.raw`\varepsilon=\varepsilon_{0}\cos\omega t\;\Longrightarrow\; \sigma=\varepsilon_{0}\left(M'\cos\omega t-M''\sin\omega t\right)=\left|M^{*}\right|\varepsilon_{0}\cos\left(\omega t+\delta_{L}\right)`,
      },
      {
        name: t('每周期耗散的能量正比于 M″', 'Energy dissipated per cycle is proportional to M″'),
        latex: String.raw`\Delta W=\oint \sigma\,\mathrm{d}\varepsilon=\pi M''\varepsilon_{0}^{2},\qquad W_{\text{峰}}=\frac{1}{2}M'\varepsilon_{0}^{2}`,
      },
      {
        name: t('复柔量是复模量的倒数', 'The complex compliance is the reciprocal of the complex modulus'),
        latex: String.raw`J^{*}(\omega)=\frac{1}{M^{*}(\omega)}=\frac{M'-iM''}{M'^{2}+M''^{2}}`,
      },
    ],
  },
  meaning: t(
    '真实岩石不是理想弹簧：施加谐和应变时，应力虽然同频，却超前一个相位 δ_L，应力–应变曲线不再是一条直线而变成一个椭圆滞回环。把「同相位的部分」和「落后 90° 的部分」分别记为 M′ 与 M″，就得到一个复数模量 —— 弹性用复数的实部记账，耗散用虚部记账。这个复数化是整个衰减地震学的起点：Q、复波速、频散、Kramers–Kronig 全都建立在它上面。',
    'Real rocks are not ideal springs. Under harmonic strain the stress is still at the same frequency but leads by a phase δ_L, so the stress–strain plot is no longer a straight line but an elliptical hysteresis loop. Recording the in-phase part as M′ and the 90°-shifted part as M″ gives a complex modulus, with elasticity booked in the real part and dissipation in the imaginary part. This complexification is the starting point of all attenuation seismology: Q, complex velocity, dispersion and Kramers–Kronig all build on it.',
  ),
  symbols: [
    { sym: 'M^{*}(\\omega)', name: t('复模量', 'complex modulus'), unit: 'Pa' },
    { sym: 'M\'', name: t('储能模量（同相位部分）', 'storage modulus (in-phase part)'), unit: 'Pa', typical: '10¹⁰ – 10¹¹' },
    { sym: 'M\'\'', name: t('损耗模量（正交相位部分）', 'loss modulus (quadrature part)'), unit: 'Pa', typical: '10⁷ – 10⁹' },
    { sym: '\\delta_L', name: t('损耗角（应力超前应变的相位）', 'loss angle (phase by which stress leads strain)'), unit: 'rad', typical: '10⁻³ – 10⁻¹' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s', typical: '10⁻² – 10³' },
    { sym: '\\varepsilon_0', name: t('应变振幅', 'strain amplitude'), unit: '1', typical: '10⁻⁹ – 10⁻⁶（地震波）' },
    { sym: '\\Delta W', name: t('每周期单位体积耗散的能量', 'energy dissipated per cycle per unit volume'), unit: 'J/m³' },
    { sym: 'J^{*}', name: t('复柔量', 'complex compliance'), unit: 'Pa⁻¹' },
  ],
  conditions: {
    applies: [
      t('线性黏弹性介质在稳态谐和激励下的响应', 'Linear viscoelastic media under steady-state harmonic excitation'),
      t('小应变（地震波应变 < 10⁻⁶），模量与振幅无关', 'Small strains (seismic strains below 10⁻⁶), so the modulus is amplitude independent'),
    ],
    assumes: [
      t('采用 e^{+iωt} 时间约定；若改用 e^{-iωt}，M″ 需整体变号', 'The e^{+iωt} time convention is used; with e^{-iωt} the sign of M″ flips'),
      t('系统线性且时不变 ⟹ 输出与输入同频，只改变幅度与相位', 'Linear and time invariant, so the output keeps the input frequency and only amplitude and phase change'),
      t('被动性：M″ ≥ 0（介质只耗能，不产能）', 'Passivity: M″ ≥ 0 (the medium only dissipates energy, never produces it)'),
    ],
    breaks: [
      t('应变超过约 10⁻⁵ 时岩石进入非线性，模量依赖振幅（非线性滞回）', 'Beyond strains of about 10⁻⁵ rocks become nonlinear and the modulus depends on amplitude (nonlinear hysteresis)'),
      t('瞬态（非稳态）响应不能直接用 M*(ω) 相乘，必须回到卷积形式的松弛函数', 'Transient (non-steady) responses cannot be obtained by multiplying with M*(ω); one must return to the convolution form with the relaxation function'),
      t('若介质存在损伤或流体流动，M* 还依赖于围压与饱和度', 'With damage or fluid flow, M* additionally depends on confining pressure and saturation'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('谐和应变输入', 'Harmonic strain input'),
      latex: String.raw`\varepsilon(t)=\varepsilon_{0}\,e^{i\omega t}`,
    },
    {
      n: 2,
      op: 'physics',
      title: t('线性时不变 ⟹ 输出同频，只差幅度与相位', 'Linearity plus time invariance: the output has the same frequency, differing only in amplitude and phase'),
      latex: String.raw`\sigma(t)=\left|M^{*}\right|\varepsilon_{0}\,e^{i\omega t}\,e^{i\delta_{L}}=M^{*}(\omega)\,\varepsilon(t)`,
      note: t('这是线性系统的基本性质：本征函数是复指数，本征值就是这里的复数 M*。', 'This is the defining property of a linear system: complex exponentials are eigenfunctions, and the eigenvalue here is the complex number M*.'),
    },
    {
      n: 3,
      op: 'algebra',
      title: t('把 M* 拆成实部与虚部', 'Split M* into real and imaginary parts'),
      latex: String.raw`M^{*}=M'+iM''=\left|M^{*}\right|e^{i\delta_{L}},\qquad \delta_{L}=\arctan\frac{M''}{M'}`,
      note: t('M′ 是「与应变同相位」的分量，储存能量；M″ 是「超前 90°」的分量，与应变速度同相，消耗能量。', 'M′ is the component in phase with the strain: it stores energy. M″ is the component advanced by 90°, in phase with the strain rate: it dissipates energy.'),
    },
    {
      n: 4,
      op: 'identity',
      title: t('取实部，得到可测量的时域波形', 'Take the real part to obtain the measurable time-domain waveforms'),
      latex: String.raw`\varepsilon=\varepsilon_{0}\cos\omega t,\qquad \sigma=\varepsilon_{0}\left(M'\cos\omega t-M''\sin\omega t\right)`,
      note: t('应力超前应变 δ_L = arctan(M″/M′)。理想弹簧 δ_L = 0，理想黏壶 δ_L = 90°，真实岩石在两者之间。', 'The stress leads the strain by δ_L = arctan(M″/M′). An ideal spring has δ_L = 0 and an ideal dashpot 90°, with real rocks somewhere in between.'),
    },
    {
      n: 5,
      op: 'algebra',
      title: t('滞回环面积：一个周期耗散掉的能量', 'Area of the hysteresis loop: the energy lost in one cycle'),
      latex: String.raw`\Delta W=\int_{0}^{2\pi/\omega}\sigma\,\dot{\varepsilon}\,\mathrm{d}t=\pi M''\varepsilon_{0}^{2},\qquad W_{\text{峰}}=\frac{1}{2}M'\varepsilon_{0}^{2}`,
      note: t('积分中 cos·sin 项为零，只留下 sin² 项贡献 πM″ε₀²，正比于损耗模量、正比于振幅平方。', 'In the integral the cos·sin term vanishes and only the sin² term survives, giving πM″ε₀² — proportional to the loss modulus and to the squared amplitude.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('时域等价形式与复柔量', 'Time-domain equivalent form and the complex compliance'),
      latex: String.raw`\sigma(t)=M'\varepsilon+\frac{M''}{\omega}\dot{\varepsilon},\qquad J^{*}=\frac{1}{M^{*}}=\frac{M'-iM''}{M'^{2}+M''^{2}}`,
      note: t('注意 M″/ω 扮演的是「黏度」的角色：这就是为什么 M″ 项写成对时间的导数。', 'Note that M″/ω plays the role of a viscosity, which is why the M″ term is written as a time derivative.'),
    },
  ],
  viz: [
    {
      id: 'hysteresis-loop',
      level: 'V1',
      title: t('应力–应变滞回环与损耗角', 'The stress–strain hysteresis loop and the loss angle'),
      xlabel: t('归一化应变 ε/ε₀', 'normalized strain ε/ε₀'),
      ylabel: t('归一化应力 σ/(|M*|ε₀)', 'normalized stress σ/(|M*|ε₀)'),
      controls: [
        { id: 'dl', label: t('损耗角 δ_L', 'loss angle δ_L'), min: 1, max: 45, step: 1, value: 12, unit: '°' },
      ],
      note: t('灰虚线是理想弹性（δ_L = 0）的情形 —— 沿着它走不耗能。椭圆围成的面积就是每周期耗散的能量，面积/周长比越大，Q 越小。把 δ_L 推到 30° 以上，环会明显「胖」起来。', 'The grey dashed line is the ideal elastic case (δ_L = 0), along which no energy is lost. The area enclosed by the ellipse is the energy dissipated per cycle; the larger the area relative to the loop size, the smaller Q. Push δ_L beyond 30° and the loop visibly fattens.'),
      compute: (p) => {
        const dl = (p['dl'] * Math.PI) / 180
        const loop: Array<[number, number]> = []
        const elastic: Array<[number, number]> = []
        const N = 240
        for (let i = 0; i <= N; i++) {
          const phi = (i / N) * 2 * Math.PI
          loop.push([Math.cos(phi), Math.cos(phi + dl)])
          elastic.push([Math.cos(phi), Math.cos(phi)])
        }
        return [
          { label: t('滞回环（有耗散）', 'hysteresis loop (lossy)'), color: '#185FA5', points: loop },
          { label: t('理想弹性线', 'ideal elastic line'), color: '#B4B2A9', dash: true, points: elastic },
        ]
      },
    },
    {
      id: 'phase-lag-waveforms',
      level: 'V1',
      title: t('应变与应力的相位滞后', 'Phase lag between strain and stress'),
      xlabel: t('相位 ωt (°)', 'phase ωt (°)'),
      ylabel: t('归一化幅度', 'normalized amplitude'),
      controls: [
        { id: 'dl2', label: t('损耗角 δ_L', 'loss angle δ_L'), min: 1, max: 60, step: 1, value: 15, unit: '°' },
      ],
      xRange: [0, 360],
      note: t('两条曲线的零点错开 δ_L，应力先到。时间上错开 Δt = δ_L/ω —— 频率越高，同样 Q 造成的绝对时延越小，但每周期的相对损失不变。', 'The zero crossings of the two curves are offset by δ_L, with the stress arriving first. In time the offset is Δt = δ_L/ω: the higher the frequency, the smaller the absolute delay for the same Q, while the fractional loss per cycle stays the same.'),
      compute: (p) => {
        const dl = (p['dl2'] * Math.PI) / 180
        const eps: Array<[number, number]> = []
        const sig: Array<[number, number]> = []
        const N = 360
        for (let i = 0; i <= N; i++) {
          const phi = (i / N) * 2 * Math.PI
          eps.push([(i / N) * 360, Math.cos(phi)])
          sig.push([(i / N) * 360, Math.cos(phi + dl)])
        }
        return [
          { label: t('应变 ε', 'strain ε'), color: '#0F6E56', points: eps },
          { label: t('应力 σ（超前 δ_L）', 'stress σ (leading by δ_L)'), color: '#BA7517', points: sig },
        ]
      },
    },
  ],
  links: {
    upstream: [{ id: 'hookes-law-isotropic', note: t('无损极限下 M″ = 0，M′ = 弹性模量', 'in the lossless limit M″ = 0 and M′ is the elastic modulus') }],
    downstream: [
      { id: 'q-from-complex-modulus', note: t('由 M″/M′ 定义 Q⁻¹', 'defines Q⁻¹ from M″/M′') },
      { id: 'zener-standard-linear-solid', note: t('给出 M*(ω) 的具体函数形式', 'gives an explicit functional form for M*(ω)') },
    ],
    seealso: [{ id: 'quality-factor-q', note: t('Q 的经验定义', 'the empirical definition of Q') }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.4' },
    { text: 'Nowick & Berry, Anelastic Relaxation in Crystalline Solids, Academic Press (1972)' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §6.4' },
  ],
}

export default complexModulus
