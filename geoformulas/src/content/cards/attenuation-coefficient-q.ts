import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** attenuation-coefficient-q */
const attenuationCoefficientQ: FormulaCard = {
  id: 'attenuation-coefficient-q',
  name: t('空间衰减系数与 Q', 'Spatial Attenuation Coefficient & Q'),
  aliases: { zh: ['衰减系数', '振幅随距离衰减', 'α'], en: ['attenuation coefficient', 'amplitude decay with distance', 'alpha'] },
  node: 'S6.1',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.COMPLEX'],
    method: ['METH.ATTEN'],
    quantity: ['Q.AMP', 'Q.FREQ'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`A(x) = A_{0}\,e^{-\alpha x},\qquad \alpha = \frac{\pi f}{Q\,v}`,
    variants: [
      { name: t('用波长表示', 'In terms of wavelength'), latex: String.raw`\alpha = \frac{\pi}{Q\lambda},\qquad \frac{A(x)}{A_0} = e^{-\pi x/(Q\lambda)}` },
      { name: t('走过一个波长损失多少', 'Loss over one wavelength'), latex: String.raw`\frac{A(\lambda)}{A_0} = e^{-\pi/Q} \approx 1 - \frac{\pi}{Q}\ (Q\gg 1)` },
      { name: t('与 t* 的关系', 'Relation to t*'), latex: String.raw`\alpha x = \frac{\omega}{2}\int\frac{dt}{Q} = \frac{\omega\,t^{*}}{2}` },
    ],
  },
  meaning: t(
    'Q 描述的是「每个振动周期损失多少能量」，把它换算成「每公里损失多少振幅」就是这个衰减系数 α。两者只差一个 π f / v 的因子，但工程上用 α 更直观：它直接告诉你信号传多远就衰减到 1/e。注意 α 正比于频率 —— 高频衰减得快得多。',
    'Q describes how much energy is lost per oscillation cycle; converting it into how much amplitude is lost per kilometre gives the attenuation coefficient α. The two differ only by a factor π f / v, but α is more intuitive in practice: it tells you directly how far a signal travels before decaying to 1/e. Note that α scales with frequency — high frequencies attenuate far faster.',
  ),
  symbols: [
    { sym: '\\alpha', name: t('空间振幅衰减系数', 'spatial amplitude attenuation coefficient'), unit: '1/km' },
    { sym: 'A_{0}', name: t('初始振幅', 'initial amplitude'), unit: 'm' },
    { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '无量纲', typical: '50 – 1000' },
    { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
    { sym: 'v', name: t('波速', 'wave speed'), unit: 'km/s' },
    { sym: '\\lambda', name: t('波长', 'wavelength'), unit: 'km' },
  ],
  conditions: {
    applies: [t('振幅随距离的定量预测、Q 与衰减的换算', 'Quantitative prediction of amplitude with distance; converting between Q and attenuation')],
    assumes: [
      t('Q 与频率无关（或已在所论频率上取值）', 'Q is frequency independent (or evaluated at the frequency of interest)'),
      t('只考虑固有衰减，几何扩散另计', 'Only intrinsic attenuation; geometrical spreading is separate'),
    ],
    breaks: [
      t('散射衰减与几何扩散会混进来，需分离', 'Scattering attenuation and geometrical spreading must be separated out'),
      t('Q 随频率变化时 α ∝ f 的关系不再成立', 'When Q is frequency dependent the α ∝ f relation no longer holds'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('写出衰减波', 'Write the attenuated wave'),
      latex: String.raw`A(x,t) = A_0\,e^{-\alpha x}e^{i\omega(t-x/v)}` },
    { n: 2, op: 'identity', title: t('把它写成复波数', 'Write it as a complex wavenumber'),
      latex: String.raw`k = \frac{\omega}{v} - i\alpha` },
    { n: 3, op: 'physics', title: t('Q 的定义：每周期的相对能量损失', 'Definition of Q: relative energy loss per cycle'),
      latex: String.raw`\frac{1}{Q} = -\frac{\Delta E}{2\pi E}` },
    { n: 4, op: 'algebra', title: t('能量正比于振幅平方，故振幅衰率加倍', 'Energy scales as amplitude squared, so the amplitude decay rate doubles'),
      latex: String.raw`\frac{\Delta E}{E} \text{ 每周期} = \frac{2\pi}{Q} \Longrightarrow \alpha\lambda = \frac{\pi}{Q}` },
    { n: 5, op: 'result', title: t('解出 α', 'Solve for α'),
      latex: String.raw`\alpha = \frac{\pi}{Q\lambda} = \frac{\pi f}{Qv}` },
  ],
  viz: [
    {
      id: 'alpha-decay',
      level: 'V1',
      title: t('振幅随距离的指数衰减', 'Exponential amplitude decay with distance'),
      xlabel: t('距离 x (km)', 'distance x (km)'),
      ylabel: t('A(x)/A₀', 'A(x)/A₀'),
      controls: [
        { id: 'Q', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 800, step: 5, value: 200 },
        { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 0.1, max: 50, step: 0.1, value: 5 },
        { id: 'v', label: t('波速 v (km/s)', 'velocity v (km/s)'), min: 1.5, max: 8, step: 0.05, value: 3.5 },
      ],
      note: t('把频率从 1 Hz 提到 20 Hz，衰减距离缩短 20 倍 —— 这就是远震记录只剩低频的原因。', 'Raising the frequency from 1 Hz to 20 Hz shortens the decay distance 20-fold — that is why teleseismic records contain only low frequencies.'),
      compute: (p) => {
        const Q = p['Q'], f = p['f'], v = p['v']
        const alpha = (Math.PI * f) / (Q * v)
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 240; i++) {
          const x = (i / 240) * Math.min(2000, 6 / alpha)
          pts.push([x, Math.exp(-alpha * x)])
        }
        return [{ label: t('A(x)/A₀', 'A(x)/A₀'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('5 Hz 地震波能传多远', 'How far can a 5 Hz wave travel'),
    input: t('Q = 200，v = 3.5 km/s，f = 5 Hz', 'Q = 200, v = 3.5 km/s, f = 5 Hz'),
    steps: [
      t('α = π×5/(200×3.5) = 0.0224 /km', 'α = π×5/(200×3.5) = 0.0224 /km'),
      t('衰减到 1/e 的距离 = 1/α = 44.6 km', 'Distance for decay to 1/e = 1/α = 44.6 km'),
    ],
    output: t('5 Hz 的成分在约 45 km 后只剩 37%', 'At 5 Hz only 37% of the amplitude remains after about 45 km'),
  },
  links: {
    upstream: [{ id: 'quality-factor-q', note: t('Q 的定义', 'Definition of Q') }],
    downstream: [{ id: 'tstar-operator', note: t('沿路径积分的衰减', 'Attenuation integrated along the path') }],
    seealso: [{ id: 'complex-velocity-attenuation', note: t('复速度表述', 'The complex-velocity formulation') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.5' }],
}

export default attenuationCoefficientQ
