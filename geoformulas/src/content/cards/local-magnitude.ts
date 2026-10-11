import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** local-magnitude */
const localMagnitude: FormulaCard = {
  id: 'local-magnitude',
  name: t('地方性震级 M_L', 'Local Magnitude M_L'),
  aliases: { zh: ['里氏震级', '近震震级'], en: ['local magnitude', 'Richter magnitude', 'ML'] },
  node: 'S4.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM', 'MATH.STAT'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`M_L=\log_{10}A-\log_{10}A_0(\Delta)`,
    variants: [
      { name: t('Wood–Anderson 标准地震计的定义', 'Definition with the Wood–Anderson standard seismometer'), latex: String.raw`M_L=\log_{10}\left(\frac{A}{1\ \mu\mathrm{m}}\right)\ \text{在}\ \Delta=100\ \mathrm{km}\ \text{处}` },
      { name: t('南加州常用的量规函数', 'Calibration function commonly used in southern California'), latex: String.raw`-\log_{10}A_0(\Delta)=1.11\log_{10}\Delta+0.00189\,\Delta-2.09` },
    ],
  },
  meaning: t(
    '1935 年里克特定义的原始震级：把标准地震计在 100 km 处记录到 1 微米振幅的地震定为零级。它简单直观、至今仍是地方震台网的日常标度，但有两个硬伤：一是依赖特定仪器（Wood–Anderson），二是在 M > 6.5 左右饱和 —— 地震越大，这个数越追不上真实的破坏力。',
    'The original magnitude defined by Richter in 1935: an earthquake recorded at 100 km with 1 micrometre amplitude on a standard seismometer has magnitude zero. It is simple and intuitive, and remains the daily scale of local networks, but has two hard flaws: it depends on a specific instrument (the Wood–Anderson), and it saturates around M 6.5 — the larger the earthquake, the more it understates the true energy.',
  ),
  symbols: [
    { sym: 'M_L', name: t('地方性震级', 'local magnitude'), unit: '无量纲', typical: '−1 – 7' },
    { sym: 'A', name: t('记录到的最大振幅', 'maximum recorded amplitude'), unit: 'μm' },
    { sym: 'A_0(\\Delta)', name: t('量规函数（距离校正）', 'calibration function (distance correction)'), unit: 'μm' },
    { sym: '\\Delta', name: t('震中距', 'epicentral distance'), unit: 'km', typical: '0 – 600' },
  ],
  conditions: {
    applies: [t('地方震（Δ < 600 km）、短周期仪器', 'Local earthquakes (Δ < 600 km) with short-period instruments')],
    assumes: [t('已换算到 Wood–Anderson 响应', 'Conversion to the Wood–Anderson response has been made')],
    breaks: [t('M > 6.5 后饱和，且对深震、远震完全不适用', 'It saturates above M 6.5 and is entirely inapplicable to deep or teleseismic events')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('震级应当正比于振幅的对数', 'Magnitude should scale as the logarithm of amplitude'),
      latex: String.raw`M\propto\log_{10}A` },
    { n: 2, op: 'geometry', title: t('振幅随距离衰减，需做距离校正', 'Amplitude decays with distance, so correct for distance'),
      latex: String.raw`M=\log_{10}A+f(\Delta)` },
    { n: 3, op: 'setup', title: t('规定零点：100 km 处 1 μm 为 0 级', 'Fix the zero point: 1 μm at 100 km is magnitude 0'),
      latex: String.raw`M_L=0\ \text{当}\ A=1\ \mu\mathrm{m},\ \Delta=100\ \mathrm{km}` },
    { n: 4, op: 'result', title: t('写成标准形式', 'Write the standard form'),
      latex: String.raw`M_L=\log_{10}A-\log_{10}A_0(\Delta),\qquad -\log_{10}A_0(\Delta)\ \text{由观测标定}` },
  ],
  viz: [
    {
      id: 'ml-calibration',
      level: 'V1',
      title: t('量规函数：不同距离上同样震级对应的振幅', 'Calibration function: amplitude for the same magnitude at different distances'),
      xlabel: t('震中距 Δ (km)', 'epicentral distance Δ (km)'),
      ylabel: t('A₀ (μm)', 'A₀ (μm)'),
      xScale: 'log',
      yScale: 'log',
      controls: [],
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const d = 5 * Math.pow(10, (i / 200) * 2.1)
          const logA0 = -(1.11 * Math.log10(d) + 0.00189 * d - 2.09)
          pts.push([d, Math.pow(10, logA0)])
        }
        return [{ label: t('A₀(Δ)', 'A₀(Δ)'), color: '#185FA5', points: pts }]
      },
      note: t('距离越远，同样震级需要的振幅越小 —— 量规函数把这一点补回来。', 'The farther away, the smaller the amplitude for the same magnitude — the calibration function compensates exactly for that.'),
    },
  ],
  example: {
    title: t('一次地方震', 'A local earthquake'),
    input: t('Δ = 50 km，记录最大振幅 100 μm', 'Δ = 50 km, maximum recorded amplitude 100 μm'),
    steps: [
      t('−log A₀ = 1.11 log 50 + 0.00189×50 − 2.09 = 1.887 + 0.095 − 2.09 = −0.108', '−log A₀ = 1.11 log 50 + 0.00189×50 − 2.09 = 1.887 + 0.095 − 2.09 = −0.108'),
      t('M_L = log 100 − 0.108 = 2 − 0.108 = 1.9', 'M_L = log 100 − 0.108 = 2 − 0.108 = 1.9'),
    ],
    output: t('M_L ≈ 1.9 —— 人能感觉到但不会造成破坏', 'M_L ≈ 1.9 — felt by people but causing no damage'),
  },
  links: {
    seealso: [
      { id: 'body-wave-magnitude', note: t('远震体波震级', 'The teleseismic body-wave magnitude') },
      { id: 'mw-moment-magnitude', note: t('不会饱和的现代标度', 'The modern scale that does not saturate') },
    ],
  },
  refs: [{ text: 'Richter (1935), Bull. Seismol. Soc. Am., 25' }],
}

export default localMagnitude
