import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** seismic-moment */
const seismicMoment: FormulaCard = {
  id: 'seismic-moment',
  name: t('地震矩', 'Seismic Moment'),
  aliases: { zh: ['标量地震矩'], en: ['scalar seismic moment', 'moment release'] },
  node: 'S4.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.MAT'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`M_0=\mu\,A\,\bar{D}`,
    variants: [
      { name: t('矩形断层的形式', 'Rectangular fault form'), latex: String.raw`M_0=\mu\,L\,W\,\bar{D}` },
      { name: t('由矩张量的模给出', 'From the norm of the moment tensor'), latex: String.raw`M_0=\sqrt{\frac{1}{2}\sum_{ij}M_{ij}^{2}}` },
    ],
  },
  meaning: t(
    '地震矩是目前唯一「不会饱和」的震源大小度量：它直接等于断层面积乘平均滑移量再乘剪切模量，物理含义就是断层错动释放的总力矩。相比之下各种震级标度在大地震时都会饱和，这就是为什么 1960 年智利 9.5 级地震必须用 Mw 而不是 Ms 来标定。',
    'The seismic moment is the only measure of source size that does not saturate: it equals fault area times average slip times shear modulus, i.e. the total moment released by faulting. Every magnitude scale saturates for great earthquakes, which is why the 1960 Chile event must be quoted as Mw 9.5 rather than Ms.',
  ),
  symbols: [
    { sym: 'M_0', name: t('标量地震矩', 'scalar seismic moment'), unit: 'N·m', typical: '10¹⁰ – 10²³' },
    { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '3×10¹⁰' },
    { sym: 'A', name: t('断层面积', 'fault area'), unit: 'm²' },
    { sym: '\\bar{D}', name: t('平均滑移量', 'average slip'), unit: 'm', typical: '0.01 – 20' },
    { sym: 'L,W', name: t('断层长度与宽度', 'fault length and width'), unit: 'm' },
  ],
  conditions: {
    applies: [t('任何构造地震的震源大小度量', 'Measuring the size of any tectonic earthquake')],
    assumes: [
      t('滑移在断层面上分布可用平均值代表', 'The slip distribution can be represented by its average'),
      t('μ 取震源处的等效剪切模量', 'μ is the effective shear modulus at the source'),
    ],
    breaks: [t('慢地震、火山震颤等非双力偶源需另加非双力偶分量', 'Non-double-couple sources such as slow earthquakes and volcanic tremor require extra components')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('一对力偶的力矩', 'The moment of a force couple'),
      latex: String.raw`\text{力矩}=\text{力}\times\text{力臂}` },
    { n: 2, op: 'geometry', title: t('断层面上剪应力的合力', 'Resultant shear force on the fault'),
      latex: String.raw`F=\mu\frac{\bar{D}}{W}\cdot A=\mu\,\bar{D}\,\frac{A}{W}`,
      note: t('剪应变 ≈ D̄/W，剪应力 = μ × 剪应变。', 'Shear strain ≈ D̄/W, and shear stress = μ × shear strain.') },
    { n: 3, op: 'algebra', title: t('乘上力臂 W', 'Multiply by the lever arm W'),
      latex: String.raw`M_0=F\cdot W=\mu\,\bar{D}\,\frac{A}{W}\,W=\mu\,A\,\bar{D}` },
    { n: 4, op: 'result', title: t('矩形断层时的展开', 'Expansion for a rectangular fault'),
      latex: String.raw`A=LW\;\Longrightarrow\; M_0=\mu\,L\,W\,\bar{D}` },
  ],
  viz: [
    {
      id: 'moment-vs-slip',
      level: 'V1',
      title: t('地震矩随断层尺度与滑移量的变化', 'Seismic moment versus fault dimension and slip'),
      xlabel: t('滑移量 D̄ (m)', 'slip D̄ (m)'),
      ylabel: t('log₁₀ M₀ (N·m)', 'log₁₀ M₀ (N·m)'),
      controls: [
        { id: 'L', label: t('断层长度 L', 'fault length L'), min: 1000, max: 500000, step: 1000, value: 50000, unit: 'm' },
        { id: 'W', label: t('断层宽度 W', 'fault width W'), min: 1000, max: 100000, step: 1000, value: 20000, unit: 'm' },
      ],
      compute: (p) => {
        const mu = 3e10
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const d = 0.01 * Math.pow(10, (i / 200) * 3)
          pts.push([d, Math.log10(mu * p['L'] * p['W'] * d)])
        }
        return [{ label: t('log₁₀ M₀', 'log₁₀ M₀'), color: '#185FA5', points: pts }]
      },
      note: t('滑移量每放大 10 倍，地震矩放大 10 倍，震级增加 2/3 级。', 'Ten times more slip gives ten times the moment, i.e. two-thirds of a magnitude unit more.'),
    },
  ],
  example: {
    title: t('2011 年日本东北地震', 'The 2011 Tohoku earthquake'),
    input: t('μ = 40 GPa，L = 500 km，W = 200 km，D̄ = 10 m', 'μ = 40 GPa, L = 500 km, W = 200 km, D̄ = 10 m'),
    steps: [
      t('A = 5×10⁵ × 2×10⁵ = 10¹¹ m²', 'A = 5×10⁵ × 2×10⁵ = 10¹¹ m²'),
      t('M₀ = 4×10¹⁰ × 10¹¹ × 10 = 4×10²² N·m', 'M₀ = 4×10¹⁰ × 10¹¹ × 10 = 4×10²² N·m'),
    ],
    output: t('对应 Mw ≈ 9.0，与实测一致', 'This corresponds to Mw ≈ 9.0, consistent with observations'),
  },
  links: {
    upstream: [{ id: 'ps-wave-velocities', note: t('μ 来自介质弹性参数', 'μ comes from the elastic parameters') }],
    downstream: [
      { id: 'mw-moment-magnitude', note: t('由 M₀ 定义矩震级', 'M₀ defines the moment magnitude') },
      { id: 'static-stress-drop', note: t('M₀ 与尺度的组合给出应力降', 'M₀ combined with dimension gives stress drop') },
    ],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §3.3' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §9.1' }],
}

export default seismicMoment
