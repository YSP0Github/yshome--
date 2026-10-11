import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** moment-rate-function */
const momentRateFunction: FormulaCard = {
  id: 'moment-rate-function',
  name: t('震源时间函数与矩率函数', 'Source Time Function & Moment Rate'),
  aliases: { zh: ['震源时间函数', 'STF', '矩率函数'], en: ['source time function', 'STF', 'moment rate function'] },
  node: 'S4.1',
  tags: {
    math: ['MATH.FOURIER', 'MATH.DIFF'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.TIME'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\dot{M}(t) = M_{0}\,\dot{s}(t),\qquad \int_{0}^{\infty}\dot{M}(t)\,dt = M_{0}`,
    variants: [
      { name: t('箱型（Haskell）', 'Boxcar (Haskell)'), latex: String.raw`\dot{s}(t) = \frac{1}{\tau},\ 0<t<\tau` },
      { name: t('三角形', 'Triangular'), latex: String.raw`\dot{s}(t) = \frac{2}{\tau}\left(1-\frac{2|t-\tau/2|}{\tau}\right)` },
      { name: t('Brune 型（指数）', 'Brune type (exponential)'), latex: String.raw`\dot{s}(t) = \frac{t}{\tau^{2}}e^{-t/\tau}` },
      { name: t('频域的一般性质', 'General property in the frequency domain'), latex: String.raw`\dot{M}(\omega\to 0) = M_{0}` },
    ],
  },
  meaning: t(
    '震源时间函数 s(t) 描述断层滑动如何随时间从零增长到最终值；它的导数 Ṁ(t) 决定远场波形。三者之间只差一次微分或积分，但物理含义完全不同：s 是「滑动历史」，Ṁ 是「能量释放速率」，M₀ 是「总量」。',
    'The source time function s(t) describes how fault slip grows from zero to its final value; its derivative Ṁ(t) sets the far-field waveform. The three differ only by differentiation or integration, yet mean different things: s is slip history, Ṁ is the energy release rate, and M₀ is the total.',
  ),
  symbols: [
    { sym: 's(t)', name: t('震源时间函数（归一化，s(∞)=1）', 'source time function (normalised, s(∞)=1)'), unit: '无量纲' },
    { sym: '\\dot{M}(t)', name: t('矩率函数', 'moment-rate function'), unit: 'N·m/s' },
    { sym: 'M_{0}', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
    { sym: '\\tau', name: t('特征上升时间', 'characteristic rise time'), unit: 's' },
  ],
  conditions: {
    applies: [t('震源时间过程的参数化、波形反演与正演', 'Parameterising the source time process; waveform inversion and forward modelling')],
    assumes: [
      t('点源近似', 'Point-source approximation'),
      t('单调增长（不考虑滑动反向）', 'Monotonic growth (no slip reversal)'),
    ],
    breaks: [
      t('复杂破裂（多子事件）需要多个脉冲叠加', 'Complex rupture (multiple subevents) requires superposing several pulses'),
      t('非常短上升时间时点源近似失效', 'Very short rise times invalidate the point-source approximation'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('地震矩的定义', 'Definition of seismic moment'),
      latex: String.raw`M_0 = \mu\,\bar{u}\,A` },
    { n: 2, op: 'physics', title: t('滑动随时间增长', 'Slip grows with time'),
      latex: String.raw`M(t) = M_0\,s(t),\qquad s(0)=0,\ s(\infty)=1` },
    { n: 3, op: 'algebra', title: t('求导得矩率', 'Differentiate to get the moment rate'),
      latex: String.raw`\dot{M}(t) = M_0\,\dot{s}(t)` },
    { n: 4, op: 'identity', title: t('归一化保证积分为 M₀', 'Normalisation guarantees the integral is M₀'),
      latex: String.raw`\int_0^{\infty}\dot{M}\,dt = M_0\left[s(\infty)-s(0)\right] = M_0` },
    { n: 5, op: 'result', title: t('谱的低频极限给出 M₀', 'The low-frequency limit of the spectrum gives M₀'),
      latex: String.raw`\lim_{\omega\to 0}\dot{M}(\omega) = M_0` },
  ],
  viz: [
    {
      id: 'stf-shapes',
      level: 'V1',
      title: t('三种常见矩率函数', 'Three common moment-rate functions'),
      xlabel: t('时间 / τ', 'time / τ'),
      ylabel: t('归一化矩率 × τ', 'normalised moment rate × τ'),
      controls: [],
      note: t('箱型的谱衰减最慢（高频最丰富），Brune 型最平滑 —— 真实地震的矩率介于两者之间。', 'The boxcar has the slowest spectral decay (richest high frequencies) and the Brune form is smoothest — real earthquakes lie between the two.'),
      compute: () => {
        const box: Array<[number, number]> = []
        const tri: Array<[number, number]> = []
        const bru: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const x = (i / 300) * 3
          box.push([x, x > 0 && x < 1 ? 1 : 0])
          tri.push([x, Math.max(0, 2 * (1 - Math.abs(2 * (x - 0.5) / 1))) ])
          bru.push([x, x * Math.exp(-x) * Math.E])
        }
        return [
          { label: t('箱型', 'boxcar'), color: '#185FA5', points: box },
          { label: t('三角形', 'triangular'), color: '#0F6E56', points: tri, dash: true },
          { label: t('Brune 型', 'Brune type'), color: '#993C1D', points: bru, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('M_w 8 地震的矩率峰值', 'Peak moment rate of an M_w 8 earthquake'),
    input: t('M₀ = 1×10²¹ N·m，τ = 10 s（箱型）', 'M₀ = 1×10²¹ N·m, τ = 10 s (boxcar)'),
    steps: [t('Ṁ = 10²¹/10 = 1×10²⁰ N·m/s', 'Ṁ = 10²¹/10 = 1×10²⁰ N·m/s')],
    output: t('每秒释放 10²⁰ N·m 的矩 —— 相当于 10¹⁴ W 量级的瞬时功率', 'A moment release rate of 10²⁰ N·m per second — an instantaneous power of order 10¹⁴ W'),
  },
  links: {
    upstream: [{ id: 'seismic-moment', note: t('地震矩的定义', 'Definition of seismic moment') }],
    downstream: [{ id: 'far-field-body-wave-pulse', note: t('远场波形就是它', 'The far-field waveform is exactly this') }],
    seealso: [{ id: 'brune-source-spectrum', note: t('它的频谱', 'Its spectrum') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.3' }],
}

export default momentRateFunction
