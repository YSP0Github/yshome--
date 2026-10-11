import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** convolution-integral */
const convolutionIntegral: FormulaCard = {
  id: 'convolution-integral',
  name: t('褶积积分', 'The Convolution Integral'),
  aliases: { zh: ['卷积', '褶积'], en: ['convolution', 'superposition integral'] },
  node: 'S9.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.DIFF'],
    method: ['METH.PROC'],
    quantity: ['Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`y(t)=\left(f*g\right)(t)=\int_{-\infty}^{\infty}f(\tau)\,g(t-\tau)\,\mathrm{d}\tau`,
    variants: [
      { name: t('离散形式', 'Discrete form'), latex: String.raw`y[n]=\sum_{k}f[k]\,g[n-k]` },
      { name: t('交换律与结合律', 'Commutativity and associativity'), latex: String.raw`f*g=g*f,\qquad (f*g)*h=f*(g*h)` },
      { name: t('与 δ 函数的褶积', 'Convolution with a delta'), latex: String.raw`f*\delta=f,\qquad f*\delta(t-t_0)=f(t-t_0)` },
    ],
  },
  meaning: t(
    '褶积是线性时不变系统里「输入怎么变成输出」的通用答案：把输入拆成一串脉冲，每个脉冲激发一个缩放平移后的冲激响应，再全部叠加起来就是输出。地震图 = 震源时间函数 * 传播响应 * 仪器响应 —— 整条链路就是一串褶积。',
    'Convolution is the universal answer to how input becomes output in a linear time-invariant system: split the input into a train of impulses, let each excite a scaled and shifted impulse response, and superpose. A seismogram equals source time function * propagation response * instrument response — the whole chain is a sequence of convolutions.',
  ),
  symbols: [
    { sym: 'f(t)', name: t('输入信号', 'input signal'), unit: '任意' },
    { sym: 'g(t)', name: t('系统冲激响应', 'impulse response of the system'), unit: '任意' },
    { sym: 'y(t)', name: t('输出信号', 'output signal'), unit: '任意' },
    { sym: '\\tau', name: t('积分哑变量', 'dummy integration variable'), unit: 's' },
  ],
  conditions: {
    applies: [t('线性时不变（LTI）系统', 'Linear time-invariant (LTI) systems')],
    assumes: [t('系统线性且参数不随时间变化', 'The system is linear and its parameters do not vary with time')],
    breaks: [t('非线性或时变系统（如强震下的土体）不能用褶积描述', 'Nonlinear or time-varying systems, such as soil under strong shaking, cannot be described by convolution')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把输入拆成脉冲的叠加', 'Decompose the input into a superposition of impulses'),
      latex: String.raw`f(t)=\int f(\tau)\,\delta(t-\tau)\,\mathrm{d}\tau` },
    { n: 2, op: 'physics', title: t('δ 输入激发冲激响应', 'A delta input excites the impulse response'),
      latex: String.raw`\delta(t)\longrightarrow g(t)` },
    { n: 3, op: 'identity', title: t('利用时不变性做平移', 'Use time invariance to shift'),
      latex: String.raw`\delta(t-\tau)\longrightarrow g(t-\tau)` },
    { n: 4, op: 'identity', title: t('利用线性做加权叠加', 'Use linearity to superpose'),
      latex: String.raw`f(\tau)\,\delta(t-\tau)\longrightarrow f(\tau)\,g(t-\tau)` },
    { n: 5, op: 'result', title: t('对所有 τ 积分', 'Integrate over all τ'),
      latex: String.raw`y(t)=\int f(\tau)\,g(t-\tau)\,\mathrm{d}\tau` },
  ],
  viz: [
    {
      id: 'conv-demo',
      level: 'V1',
      title: t('尖脉冲与衰减正弦褶积的结果', 'A spike convolved with a decaying sinusoid'),
      xlabel: t('时间 t (s)', 'time t (s)'),
      ylabel: t('幅值', 'amplitude'),
      controls: [
        { id: 'f0', label: t('子波主频 f₀', 'wavelet dominant frequency f₀'), min: 1, max: 40, step: 1, value: 12, unit: 'Hz' },
        { id: 'dec', label: t('衰减率', 'decay rate'), min: 2, max: 30, step: 1, value: 10, unit: '1/s' },
        { id: 't2', label: t('第二个尖脉冲时刻', 'second spike time'), min: 0.05, max: 1.2, step: 0.05, value: 0.35, unit: 's' },
      ],
      compute: (p) => {
        const w = (t: number) => (t < 0 ? 0 : Math.sin(2 * Math.PI * p['f0'] * t) * Math.exp(-p['dec'] * t))
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 800; i++) {
          const t = (i / 800) * 2
          pts.push([t, w(t) + 0.7 * w(t - p['t2'])])
        }
        return [{ label: t('合成记录', 'synthetic record'), color: '#185FA5', points: pts }]
      },
      note: t('两张反射系数尖脉冲分别与子波褶积再相加 —— 这就是最简单的合成地震记录。', 'Two reflectivity spikes convolved with the wavelet and summed — the simplest possible synthetic seismogram.'),
    },
  ],
  links: {
    upstream: [{ id: 'dirac-delta-sifting', note: t('δ 的筛选性质', 'The sifting property of δ') }],
    downstream: [{ id: 'convolution-theorem', note: t('频域中变成乘法', 'Becomes multiplication in the frequency domain') }],
  },
  refs: [{ text: 'Bracewell, The Fourier Transform and Its Applications' }],
}

export default convolutionIntegral
