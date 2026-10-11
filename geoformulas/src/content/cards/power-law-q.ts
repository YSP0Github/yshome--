import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** power-law-q */
const powerLawQ: FormulaCard = {
  id: 'power-law-q',
  name: t('幂律 Q 与频率依赖', 'Power-law Q & Frequency Dependence'),
  aliases: { zh: ['幂律 Q', '频率依赖', '吸收带'], en: ['power-law Q', 'frequency dependence', 'absorption band'] },
  node: 'S6.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.APPROX'],
    method: ['METH.ATTEN'],
    quantity: ['Q.FREQ', 'Q.AMP'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`Q(f) = Q_{0}\,f^{\,\eta}`,
    variants: [
      { name: t('Q⁻¹ 的写法', 'Written for Q⁻¹'), latex: String.raw`Q^{-1}(f) = Q_0^{-1}\,f^{-\eta}` },
      { name: t('t* 的频率依赖', 'Frequency dependence of t*'), latex: String.raw`t^{*}(f) = \int\frac{dt}{Q(f)} = \frac{t^{*}_{0}}{f^{\eta}}` },
      { name: t('常见取值', 'Typical values'), latex: String.raw`\eta \approx 0.2\text{–}0.7\ (\text{岩石圈与上地幔}),\qquad Q_0 = Q(1\ \text{Hz})` },
      { name: t('η = 0 退化为频率无关', 'η = 0 reduces to frequency independence'), latex: String.raw`\eta = 0 \Longrightarrow Q = Q_0 = \text{const}` },
    ],
  },
  meaning: t(
    '早期研究常假设 Q 与频率无关（这纯粹是为了数学方便）。实际观测表明，在很宽的频带内 Q 更接近一个幂律：频率越高 Q 越大，也就是「高频衰减得没那么快」。这个 η 指数是吸收带模型的直接可测量，也是连接实验室岩石物理与地震观测的关键量。',
    'Early work often assumed Q to be frequency independent, purely for mathematical convenience. Observations show instead that over a broad band Q follows a power law: higher frequency means larger Q, i.e. high frequencies attenuate less severely than a constant-Q model predicts. The exponent η is the directly measurable signature of the absorption band and a key quantity linking laboratory rock physics with seismic observation.',
  ),
  symbols: [
    { sym: 'Q_{0}', name: t('1 Hz 处的 Q 值', 'Q at 1 Hz'), unit: '无量纲', typical: '50 – 500' },
    { sym: '\\eta', name: t('频率依赖指数', 'frequency-dependence exponent'), unit: '无量纲', typical: '0.2 – 0.7' },
    { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
    { sym: 't^{*}', name: t('累积衰减算子', 'cumulative attenuation operator'), unit: 's' },
  ],
  conditions: {
    applies: [t('宽频带资料的 Q 校正、震源谱与衰减的分离', 'Q correction of broadband data; separating source spectrum from attenuation')],
    assumes: [
      t('在所论频带内为单一幂律', 'A single power law holds over the band of interest'),
      t('Q 与深度的关系另行处理', 'The depth dependence of Q is handled separately'),
    ],
    breaks: [
      t('极宽频带（mHz–kHz）需要多个吸收带叠加', 'Very broad bands (mHz–kHz) need several absorption bands superposed'),
      t('散射与固有衰减混在一起时 η 无明确物理意义', 'When scattering and intrinsic attenuation mix, η loses a clear physical meaning'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把观测写成幂律形式', 'Write the observation as a power law'),
      latex: String.raw`Q(f) = Q_0 f^{\eta}` },
    { n: 2, op: 'algebra', title: t('取对数变成直线', 'Take logarithms to get a straight line'),
      latex: String.raw`\log Q = \log Q_0 + \eta\log f` },
    { n: 3, op: 'substitute', title: t('代入 t* 的定义', 'Insert into the definition of t*'),
      latex: String.raw`t^{*}(f) = \int\frac{dt}{Q_0 f^{\eta}} = \frac{1}{Q_0 f^{\eta}}\int dt` },
    { n: 4, op: 'identity', title: t('写成 t*₀ 的形式', 'Write it in terms of t*₀'),
      latex: String.raw`t^{*}(f) = \frac{t_0^{*}}{f^{\eta}},\qquad t_0^{*} = \frac{T}{Q_0}` },
    { n: 5, op: 'result', title: t('用于谱校正', 'Use it for spectral correction'),
      latex: String.raw`A_{\text{corr}}(f) = A_{\text{obs}}(f)\,\exp\!\left(\frac{\pi f t_0^{*}}{f^{\eta}}\right) = A_{\text{obs}}\,e^{\pi t_0^{*} f^{1-\eta}}` },
  ],
  viz: [
    {
      id: 'power-law-q',
      level: 'V1',
      title: t('不同 η 下的 Q(f)', 'Q(f) for different exponents'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('Q', 'Q'),
      xScale: 'log',
      yScale: 'log',
      controls: [
        { id: 'q0', label: t('Q₀ = Q(1 Hz)', 'Q₀ = Q(1 Hz)'), min: 20, max: 800, step: 5, value: 150 },
        { id: 'eta', label: t('指数 η', 'exponent η'), min: 0, max: 1, step: 0.01, value: 0.4 },
      ],
      note: t('η = 0.4 时，从 0.1 Hz 到 10 Hz，Q 增长 10^0.8 ≈ 6.3 倍。', 'With η = 0.4, Q grows by 10^0.8 ≈ 6.3× from 0.1 Hz to 10 Hz.'),
      compute: (p) => {
        const q0 = p['q0'], eta = p['eta']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = Math.pow(10, -2 + (i / 200) * 4)
          pts.push([f, q0 * Math.pow(f, eta)])
        }
        return [{ label: t('Q(f)', 'Q(f)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('用幂律 Q 做谱校正', 'Spectral correction with a power-law Q'),
    input: t('Q₀ = 150，η = 0.4，t*₀ = 0.5 s（1 Hz）', 'Q₀ = 150, η = 0.4, t*₀ = 0.5 s (at 1 Hz)'),
    steps: [
      t('f = 10 Hz：t* = 0.5/10^0.4 = 0.199 s', 'f = 10 Hz: t* = 0.5/10^0.4 = 0.199 s'),
      t('衰减因子 exp(−π f t*) = exp(−π×10×0.199) = exp(−6.25) = 1.9×10⁻³', 'Attenuation factor exp(−π f t*) = exp(−π×10×0.199) = exp(−6.25) = 1.9×10⁻³'),
    ],
    output: t('若误用频率无关 Q，10 Hz 处的校正量会差好几倍', 'Using a frequency-independent Q by mistake mis-corrects the 10 Hz value by several times'),
  },
  links: {
    upstream: [{ id: 'absorption-band-q', note: t('吸收带模型给出幂律', 'The absorption-band model yields the power law') }],
    downstream: [{ id: 'tstar-operator', note: t('t* 的频率依赖', 'Frequency dependence of t*') }],
    seealso: [{ id: 'spectral-ratio-q', note: t('测量 η 的常用手段', 'A common way to measure η') }],
  },
  refs: [{ text: 'Anderson, D. & Given, J. (1982). Absorption band Q model for the Earth. J. Geophys. Res., 87, 3893–3898' }],
}

export default powerLawQ
