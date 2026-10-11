import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** q-from-complex-modulus */
const qFromComplexModulus: FormulaCard = {
  id: 'q-from-complex-modulus',
  name: t('Q 与复模量的关系：Q⁻¹ = M″/M′ = tan δ_L', 'Q from the Complex Modulus: Q⁻¹ = M″/M′ = tan δ_L'),
  aliases: {
    zh: ['Q 与损耗角', '内耗', '品质因子定义', '滞回比'],
    en: ['Q and the loss angle', 'internal friction', 'definition of the quality factor', 'hysteresis ratio'],
  },
  node: 'S1.7',
  tags: {
    subject: 'S1.7',
    math: ['MATH.COMPLEX'],
    method: ['METH.ATTEN'],
    quantity: ['Q.MAT', 'Q.AMP'],
    keywords: t('品质因子 Q 损耗角 内耗 储能模量 损耗模量 滞回环面积 每周期能量损失', 'quality factor Q loss angle internal friction storage modulus loss modulus hysteresis loop area energy loss per cycle'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`Q^{-1}(\omega)=\frac{M''(\omega)}{M'(\omega)}=\tan\delta_{L}(\omega)`,
    variants: [
      {
        name: t('最原始的能量定义', 'The most fundamental, energetic definition'),
        latex: String.raw`Q^{-1}=\frac{1}{2\pi}\,\frac{\Delta W}{W_{\text{峰}}}`,
      },
      {
        name: t('弱衰减时 Q⁻¹ ≈ δ_L（弧度）', 'For weak attenuation Q⁻¹ ≈ δ_L (in radians)'),
        latex: String.raw`Q^{-1}=\tan\delta_{L}\approx\delta_{L}\quad (\delta_{L}\ll 1)`,
      },
      {
        name: t('用应变振幅表达的耗散', 'Dissipation expressed through the strain amplitude'),
        latex: String.raw`\Delta W=\pi M''\varepsilon_{0}^{2},\qquad W_{\text{峰}}=\frac{1}{2}M'\varepsilon_{0}^{2}\;\Longrightarrow\; Q^{-1}=\frac{\pi M''\varepsilon_{0}^{2}}{2\pi\cdot\frac{1}{2}M'\varepsilon_{0}^{2}}=\frac{M''}{M'}`,
      },
      {
        name: t('等价的复平面写法', 'Equivalent complex-plane form'),
        latex: String.raw`M^{*}=\left|M^{*}\right|e^{i\delta_{L}},\qquad Q^{-1}=\frac{\operatorname{Im}M^{*}}{\operatorname{Re}M^{*}}`,
      },
    ],
  },
  meaning: t(
    'Q 的严格定义是「每周期损失的能量」与「储存的能量」之比除以 2π。把谐和载荷下的滞回环面积算出来，这个比值恰好等于复模量的虚部与实部之比 —— 也就是损耗角的正切。这个等式把三个看似不同的实验量（能量比、模量比、相位角）绑在一起：岩石力学实验测滞回环，共振棒实验测相位，地震观测测振幅衰减，得到的其实是同一个数。',
    'The rigorous definition of Q is the energy lost per cycle divided by the energy stored, over 2π. Evaluating the area of the hysteresis loop under harmonic loading shows that this ratio is exactly the imaginary-to-real part of the complex modulus, that is, the tangent of the loss angle. The identity ties together three seemingly different measurements — an energy ratio, a modulus ratio and a phase angle. Hysteresis loops in rock mechanics, phase in resonant-bar experiments and amplitude decay in seismic observations all yield the same number.',
  ),
  symbols: [
    { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '1', typical: '地壳 100 – 500，地幔 100 – 600，沉积层 20 – 150' },
    { sym: 'Q^{-1}', name: t('内耗（衰减的度量）', 'internal friction (the measure of attenuation)'), unit: '1', typical: '0.002 – 0.05' },
    { sym: 'M\'', name: t('储能模量', 'storage modulus'), unit: 'Pa', typical: '10¹⁰ – 10¹¹' },
    { sym: 'M\'\'', name: t('损耗模量', 'loss modulus'), unit: 'Pa', typical: '10⁷ – 10⁹' },
    { sym: '\\delta_L', name: t('损耗角（应力超前应变的相位）', 'loss angle (phase by which stress leads strain)'), unit: 'rad', typical: '10⁻³ – 10⁻¹' },
    { sym: '\\Delta W', name: t('每周期单位体积耗散的能量', 'energy dissipated per cycle per unit volume'), unit: 'J/m³' },
    { sym: 'W_{\\text{峰}}', name: t('峰值储存的弹性能', 'peak stored elastic energy'), unit: 'J/m³' },
    { sym: '\\varepsilon_0', name: t('应变振幅', 'strain amplitude'), unit: '1', typical: '10⁻⁹ – 10⁻⁶' },
  ],
  conditions: {
    applies: [
      t('线性黏弹性介质在谐和载荷下的稳态响应', 'Linear viscoelastic media under steady-state harmonic loading'),
      t('任何可用复模量描述的耗散过程', 'Any dissipative process that can be described by a complex modulus'),
    ],
    assumes: [
      t('弱衰减（Q ≳ 10），此时 W_峰 可用无损弹性公式 (1/2)M′ε₀² 近似', 'Weak attenuation (Q ≳ 10), so the peak stored energy is well approximated by the lossless expression (1/2)M′ε₀²'),
      t('应变足够小，M′ 与 M″ 与振幅无关', 'Strain small enough that M′ and M″ are amplitude independent'),
      t('采用 e^{+iωt} 约定，M″ > 0', 'The e^{+iωt} convention is used with M″ > 0'),
    ],
    breaks: [
      t('Q < 10 的强衰减介质（部分未固结沉积、部分熔融）中，M′ 与 M″ 同量级，一阶近似失效', 'In strongly attenuating media with Q < 10 (some unconsolidated sediments, partial melts) M′ and M″ are comparable and the first-order approximation fails'),
      t('散射衰减（几何扩散、多次散射）不产生滞回环，不能用 M″/M′ 描述', 'Scattering attenuation (geometric spreading, multiple scattering) produces no hysteresis loop and cannot be described by M″/M′'),
      t('非线性滞回时 Q 依赖应变振幅，不再是一个材料常数', 'With nonlinear hysteresis Q depends on the strain amplitude and is no longer a material constant'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('谐和应变与复数形式的应力', 'Harmonic strain and the complex form of the stress'),
      latex: String.raw`\varepsilon(t)=\varepsilon_{0}e^{i\omega t},\qquad \sigma(t)=M^{*}(\omega)\,\varepsilon(t)`,
    },
    {
      n: 2,
      op: 'identity',
      title: t('取实部：应变与应力的实测波形', 'Take the real part: the measurable strain and stress waveforms'),
      latex: String.raw`\varepsilon=\varepsilon_{0}\cos\omega t,\qquad \sigma=\varepsilon_{0}\left(M'\cos\omega t-M''\sin\omega t\right)=\left|M^{*}\right|\varepsilon_{0}\cos\left(\omega t+\delta_{L}\right)`,
      note: t('损耗角 δ_L = arctan(M″/M′) 就是应力超前应变的相位。', 'The loss angle δ_L = arctan(M″/M′) is the phase by which the stress leads the strain.'),
    },
    {
      n: 3,
      op: 'physics',
      title: t('Q 的能量定义：一个周期损失的能量比上储存的能量', 'The energetic definition of Q: energy lost per cycle over energy stored'),
      latex: String.raw`Q^{-1}\equiv\frac{1}{2\pi}\,\frac{\Delta W}{W_{\text{峰}}},\qquad \Delta W=\oint \sigma\,\mathrm{d}\varepsilon=\int_{0}^{2\pi/\omega}\sigma\,\dot{\varepsilon}\,\mathrm{d}t`,
      note: t('除以 2π 是约定：这样在一个无损振子里 Q 正好是振幅衰减到 1/e 所需的周期数除以 2π。', 'The factor 1/2π is conventional: it makes Q equal to the number of cycles for the amplitude of a lossless oscillator to decay by 1/e, divided by 2π.'),
    },
    {
      n: 4,
      op: 'algebra',
      title: t('计算环积分：只有 sin² 项存活', 'Evaluate the loop integral: only the sin² term survives'),
      latex: String.raw`\dot{\varepsilon}=-\omega\varepsilon_{0}\sin\omega t\;\Longrightarrow\; \Delta W=M'\omega\varepsilon_{0}^{2}\!\int_{0}^{2\pi/\omega}\!\!\left(-\cos\omega t\sin\omega t\right)\mathrm{d}t+M''\omega\varepsilon_{0}^{2}\!\int_{0}^{2\pi/\omega}\!\!\sin^{2}\omega t\,\mathrm{d}t=\pi M''\varepsilon_{0}^{2}`,
      note: t('第一项（M′ 的贡献）在一个整周期上积分为零：储能部分净耗能为零，这正是「弹性」的含义。', 'The first term (the M′ contribution) integrates to zero over a full cycle: the storage part dissipates nothing net, which is exactly what "elastic" means.'),
    },
    {
      n: 5,
      op: 'algebra',
      title: t('峰值储能与比值', 'Peak stored energy and the ratio'),
      latex: String.raw`W_{\text{峰}}=\frac{1}{2}M'\varepsilon_{0}^{2}\;\Longrightarrow\; Q^{-1}=\frac{1}{2\pi}\cdot\frac{\pi M''\varepsilon_{0}^{2}}{\frac{1}{2}M'\varepsilon_{0}^{2}}=\frac{M''}{M'}`,
      note: t('ε₀² 完全约掉：Q 是材料属性，与激励幅度无关（在线性范围内）。', 'The factor ε₀² cancels completely: within the linear range Q is a material property, independent of the excitation amplitude.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('与损耗角的关系，以及小角度近似', 'Relation to the loss angle, and the small-angle approximation'),
      latex: String.raw`Q^{-1}=\frac{M''}{M'}=\tan\delta_{L}\approx\delta_{L}\qquad (\delta_{L}\ll 1)`,
      note: t('地球介质的 Q⁻¹ 大约 0.002 – 0.05，对应 δ_L 只有 0.1° – 3°，所以「小角近似」在地震学里几乎永远成立。', 'Earth materials have Q⁻¹ of roughly 0.002–0.05, corresponding to δ_L of only 0.1°–3°, so the small-angle approximation essentially always holds in seismology.'),
    },
  ],
  links: {
    upstream: [
      { id: 'complex-modulus', note: t('M′、M″ 与滞回环', 'M′, M″ and the hysteresis loop') },
      { id: 'zener-standard-linear-solid', note: t('给出 M′(ω) 与 M″(ω) 的具体形式', 'gives explicit forms for M′(ω) and M″(ω)') },
    ],
    seealso: [
      { id: 'quality-factor-q', note: t('Q 的经验定义与典型值', 'the empirical definition and typical values of Q') },
      { id: 'seismometer-equation', note: t('阻尼振子里的同一个 Q', 'the same Q in a damped oscillator') },
    ],
  },
  refs: [
    { text: 'Knopoff (1964), Q, Reviews of Geophysics 2, 625–660' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.4' },
    { text: 'Nowick & Berry, Anelastic Relaxation in Crystalline Solids, Academic Press (1972)' },
  ],
}

export default qFromComplexModulus
