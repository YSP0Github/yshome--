import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** periodic-multiple */
const periodicMultiple: FormulaCard = {
  id: 'periodic-multiple',
  name: t('周期性多次波', 'Periodic Multiples'),
  aliases: { zh: ['多次波', '水层多次波', '自由表面多次波'], en: ['multiples', 'water-bottom reverberation', 'surface multiple'] },
  node: 'S3.7',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.EXPL', 'METH.PROC'],
    quantity: ['Q.TIME', 'Q.AMP'],
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`t^{(m)} = (m+1)\,t_{wb},\qquad \Delta t = \frac{2h}{v_{w}}`,
    variants: [
      { name: t('振幅随阶次衰减', 'Amplitude decays with order'), latex: String.raw`A^{(m)} = A_{0}\,|R|^{m}` },
      { name: t('海底反射系数', 'Seafloor reflection coefficient'), latex: String.raw`R = \frac{Z_{b}-Z_{w}}{Z_{b}+Z_{w}}` },
      { name: t('与一次波的关系', 'Relation to the primary'), latex: String.raw`t^{(m)} = t_{prim} + m\,\Delta t` },
    ],
  },
  meaning: t(
    '海洋地震里最常见的干扰是水层中的来回反射：波在海水层里上下弹跳，每多弹一次就在记录上多出一条与海底反射「长得一模一样」、时间上等间隔的同相轴。识别它的诀窍是看周期性 —— 相邻两条的间隔恰好等于水层的双程时间。',
    'The most common noise in marine seismics is reverberation in the water layer: the wave bounces up and down between sea surface and seafloor, and each extra bounce adds an event that looks exactly like the seafloor reflection, spaced at equal intervals. The trick to recognising it is the periodicity — the spacing equals the two-way time through the water.',
  ),
  symbols: [
    { sym: 't^{(m)}', name: t('第 m 阶多次波到时', 'arrival time of the m-th order multiple'), unit: 's' },
    { sym: 't_{wb}', name: t('海底反射的双程时间', 'two-way time of the seafloor reflection'), unit: 's' },
    { sym: 'h', name: t('水深', 'water depth'), unit: 'm' },
    { sym: 'v_{w}', name: t('水中声速', 'sound speed in water'), unit: 'm/s', typical: '1500' },
    { sym: 'R', name: t('海底反射系数', 'seafloor reflection coefficient'), unit: '无量纲', typical: '0.2 – 0.5' },
  ],
  conditions: {
    applies: [t('海洋地震资料中的水层混响识别与压制', 'Recognition and suppression of water-layer reverberation in marine data')],
    assumes: [
      t('水平海底、常速水层', 'Flat seafloor, constant-velocity water layer'),
      t('海面反射系数为 −1', 'The sea-surface reflection coefficient is −1'),
    ],
    breaks: [
      t('海底起伏或倾斜时周期性被破坏', 'Rugged or dipping seafloor destroys the periodicity'),
      t('水深变化剧烈时不能用单一周期预测', 'Strongly varying water depth cannot be predicted with a single period'),
    ],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('一阶多次波多走一趟水层', 'A first-order multiple makes one extra round trip'),
      latex: String.raw`L^{(1)} = L_{prim} + 2h` },
    { n: 2, op: 'substitute', title: t('换成时间', 'Convert to time'),
      latex: String.raw`t^{(1)} = t_{wb} + \frac{2h}{v_w} = 2t_{wb}` },
    { n: 3, op: 'algebra', title: t('推广到 m 阶', 'Generalise to order m'),
      latex: String.raw`t^{(m)} = t_{wb} + m\frac{2h}{v_w} = (m+1)t_{wb}` },
    { n: 4, op: 'physics', title: t('每多一次海底反射乘一次 R', 'Each extra seafloor bounce multiplies by R'),
      latex: String.raw`A^{(m)} = A_0\,|R|^{m}` },
    { n: 5, op: 'result', title: t('周期就是水层双程时间', 'The period is the water-layer two-way time'),
      latex: String.raw`\Delta t = \frac{2h}{v_w}` },
  ],
  viz: [
    {
      id: 'water-reverb',
      level: 'V2',
      title: t('水层混响的合成道', 'Synthetic trace with water-layer reverberation'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('振幅', 'amplitude'),
      controls: [
        { id: 'h', label: t('水深 h (m)', 'water depth h (m)'), min: 50, max: 3000, step: 10, value: 500 },
        { id: 'R', label: t('海底反射系数 R', 'seafloor reflection coefficient R'), min: 0.05, max: 0.8, step: 0.01, value: 0.4 },
      ],
      note: t('注意海面反射系数为 −1，所以相邻阶次的极性交替 —— 这是判断混响的第二个线索。', 'The sea-surface coefficient is −1, so successive orders alternate in polarity — the second clue for recognising reverberation.'),
      compute: (p) => {
        const h = p['h'], R = p['R']
        const vw = 1500
        const twb = (2 * h) / vw
        const N = 800
        const dt = 0.004
        const pts: Array<[number, number]> = []
        for (let i = 0; i < N; i++) {
          const tt = i * dt
          let a = 0
          for (let m = 0; m <= 5; m++) {
            const tm = (m + 1) * twb
            const arg = (tt - tm) / 0.012
            a += Math.pow(-R, m) * Math.exp(-arg * arg)
          }
          pts.push([tt, a])
        }
        return [{ label: t('合成道', 'synthetic trace'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('500 m 水深处的混响周期', 'Reverberation period for 500 m of water'),
    input: t('h = 500 m，v_w = 1500 m/s', 'h = 500 m, v_w = 1500 m/s'),
    steps: [
      t('t_wb = 2×500/1500 = 0.667 s', 't_wb = 2×500/1500 = 0.667 s'),
      t('多次波出现在 1.333 s、2.000 s、2.667 s …', 'Multiples appear at 1.333 s, 2.000 s, 2.667 s …'),
    ],
    output: t('周期 0.667 s，与任何地质反射都不同 —— 一眼可辨', 'A 0.667 s period, unlike any geological reflection — recognisable at a glance'),
  },
  links: {
    upstream: [
      { id: 'acoustic-reflection-coefficient', note: t('反射系数的计算', 'Computing the reflection coefficient') },
      { id: 'transmission-coefficient', note: t('透射系数决定能量分配', 'Transmission coefficients set the energy partition') },
    ],
    downstream: [{ id: 'srme-surface-multiple-prediction', note: t('压制它的数据驱动方法', 'The data-driven method to remove it') }],
    seealso: [{ id: 'interbed-multiple', note: t('另一类多次波', 'The other class of multiples') }],
  },
  refs: [{ text: 'Verschuur, D. (2006). Seismic Multiple Removal Techniques. EAGE' }],
}

export default periodicMultiple
