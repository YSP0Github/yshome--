import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** pulse-broadening-q */
const pulseBroadeningQ: FormulaCard = {
  id: 'pulse-broadening-q',
  name: t('脉宽法测 Q', 'Pulse-broadening Method for Q'),
  aliases: { zh: ['脉宽法', '上升时间法', '脉冲展宽'], en: ['pulse broadening', 'rise-time method', 'pulse width'] },
  node: 'S6.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.STAT'],
    method: ['METH.ATTEN'],
    quantity: ['Q.TIME', 'Q.FREQ'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\tau = \tau_{0} + C\,\frac{t}{Q},\qquad C \approx 0.5`,
    variants: [
      { name: t('由两个距离的脉宽反解 Q', 'Inverting Q from pulse widths at two distances'), latex: String.raw`Q = C\,\frac{t_2 - t_1}{\tau_2 - \tau_1}` },
      { name: t('脉宽的定义', 'Definition of pulse width'), latex: String.raw`\tau = \left[\frac{\int t^{2}|A(t)|^{2}dt}{\int |A(t)|^{2}dt} - \left(\frac{\int t|A(t)|^{2}dt}{\int |A(t)|^{2}dt}\right)^{2}\right]^{1/2}` },
      { name: t('与谱比法的对比', 'Comparison with the spectral-ratio method'), latex: String.raw`\text{脉宽法对散射不敏感，谱比法对散射敏感}` },
    ],
  },
  meaning: t(
    '波在衰减介质里传播时，高频先被吃掉，脉冲因此越走越宽。脉宽的增长量与走时除以 Q 成正比 —— 只要测到两个距离上的脉宽，就能反推出 Q。这个方法的最大优点是几乎不受散射影响（散射只改变波形细节，不改变整体宽度），因此常与谱比法并用。',
    'As a wave travels through an attenuating medium its high frequencies are removed first, so the pulse broadens. The growth in pulse width is proportional to travel time divided by Q — measure the width at two distances and you can invert for Q. The great advantage is near-immunity to scattering (scattering changes waveform detail but not overall width), so it is routinely used alongside the spectral-ratio method.',
  ),
  symbols: [
    { sym: '\\tau', name: t('脉冲宽度（二阶矩）', 'pulse width (second moment)'), unit: 's' },
    { sym: '\\tau_{0}', name: t('震源处的初始脉宽', 'initial pulse width at the source'), unit: 's' },
    { sym: 't', name: t('走时', 'travel time'), unit: 's' },
    { sym: 'C', name: t('经验常数', 'empirical constant'), unit: '无量纲', typical: '0.3 – 0.6' },
    { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('井间、地壳与小尺度结构的 Q 测量', 'Measuring Q in cross-hole, crustal and small-scale studies')],
    assumes: [
      t('脉冲形状可用二阶矩刻画', 'The pulse shape can be characterised by its second moment'),
      t('几何扩散与仪器响应已校正', 'Geometrical spreading and instrument response are corrected'),
    ],
    breaks: [
      t('多次波与尾波会污染脉宽测量', 'Multiples and coda contaminate the width measurement'),
      t('常数 C 依赖子波形状，不同研究取值不同', 'The constant C depends on wavelet shape and varies between studies'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('衰减等价于在频率域乘一个高斯型滤波', 'Attenuation multiplies by a Gaussian filter in frequency'),
      latex: String.raw`|A(\omega)| \propto e^{-\omega t/(2Q)}` },
    { n: 2, op: 'identity', title: t('高斯滤波在时间域仍是高斯', 'A Gaussian filter stays Gaussian in time'),
      latex: String.raw`|A(\omega)| = e^{-\omega^{2}/(4a)} \Longrightarrow a(t) \propto e^{-a t^{2}}` },
    { n: 3, op: 'algebra', title: t('时间宽度的平方与走时成正比', 'The squared time width grows linearly with travel time'),
      latex: String.raw`\tau^{2} = \tau_0^{2} + \frac{2t}{Q}\cdot(\text{常数})` },
    { n: 4, op: 'taylor', title: t('小展宽时开方近似为线性', 'For small broadening the square root linearises'),
      latex: String.raw`\tau \approx \tau_0 + C\frac{t}{Q}` },
    { n: 5, op: 'result', title: t('两个距离相减消去 τ₀', 'Differencing two distances eliminates τ₀'),
      latex: String.raw`Q = C\frac{t_2-t_1}{\tau_2-\tau_1}` },
  ],
  viz: [
    {
      id: 'pulse-width-growth',
      level: 'V1',
      title: t('脉宽随走时的增长', 'Pulse-width growth with travel time'),
      xlabel: t('走时 t (s)', 'travel time t (s)'),
      ylabel: t('脉宽 τ (s)', 'pulse width τ (s)'),
      controls: [
        { id: 'Q', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 800, step: 5, value: 150 },
        { id: 't0', label: t('初始脉宽 τ₀ (s)', 'initial width τ₀ (s)'), min: 0.01, max: 1, step: 0.01, value: 0.15 },
      ],
      note: t('斜率就是 C/Q：Q 越大斜率越小，波传播中越「保形」。', 'The slope is C/Q: larger Q means a smaller slope and a pulse that keeps its shape better.'),
      compute: (p) => {
        const Q = p['Q'], t0 = p['t0']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const t = (i / 200) * 60
          pts.push([t, t0 + (0.5 * t) / Q])
        }
        return [{ label: t('τ(t)', 'τ(t)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('两个台站的脉宽', 'Pulse widths at two stations'),
    input: t('t₁ = 10 s 时 τ₁ = 0.18 s；t₂ = 50 s 时 τ₂ = 0.31 s，C = 0.5', 'τ₁ = 0.18 s at t₁ = 10 s; τ₂ = 0.31 s at t₂ = 50 s, C = 0.5'),
    steps: [
      t('Δt = 40 s，Δτ = 0.13 s', 'Δt = 40 s, Δτ = 0.13 s'),
      t('Q = 0.5 × 40/0.13 = 154', 'Q = 0.5 × 40/0.13 = 154'),
    ],
    output: t('Q ≈ 150，典型的地壳—上地幔顶部数值', 'Q ≈ 150, a typical value for the crust and topmost upper mantle'),
  },
  links: {
    upstream: [{ id: 'tstar-operator', note: t('t* 是同一现象的谱域表述', 't* is the same phenomenon in the spectral domain') }],
    seealso: [{ id: 'spectral-ratio-q', note: t('另一种提取 Q 的方法', 'Another way to extract Q') }],
  },
  refs: [{ text: 'Gladwin, M. & Stacey, F. (1974). Anelastic degradation of acoustic pulses in rock. Phys. Earth Planet. Inter., 8, 332–336' }],
}

export default pulseBroadeningQ
