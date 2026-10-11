import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** free-surface-amplification */
const freeSurfaceAmplification: FormulaCard = {
  id: 'free-surface-amplification',
  name: t('自由表面放大', 'Free-surface Amplification'),
  aliases: { zh: ['表面放大', '入射波与反射波叠加'], en: ['free-surface amplification', 'surface amplification factor'] },
  node: 'S8.4',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.VECTOR'],
    method: ['METH.INSTR', 'METH.HAZARD'],
    quantity: ['Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`A_{\text{地表}}=(1+R)\,A_{\text{入射}}\approx2\,A_{\text{入射}}\quad(\text{垂直入射})`,
    variants: [
      { name: t('由阻抗关系给出', 'From the impedance relation'), latex: String.raw`1+R=\frac{2Z_1}{Z_1+Z_2}\;\xrightarrow[\ Z_2\to0\ ]{}\ 2` },
      { name: t('斜入射时随入射角变化', 'At oblique incidence it varies with angle'), latex: String.raw`\text{放大因子}\in[1,2]\ \text{，随波型与入射角变化，可超过 2（临界角附近）}` },
      { name: t('S 波常被放大得更多', 'S waves are often amplified more'), latex: String.raw`\text{实际记录中}\ \frac{A_S}{A_P}\ \text{常大于理论值}` },
    ],
  },
  meaning: t(
    '为什么地表记录到的地震动是「地下同一深度处入射波的两倍」？因为自由表面必须让应力为零，于是入射波激发一个同号反射波，两者在地表相加。这条最简单的结论解释了很多事：为什么竖井里的井下地震计记录的地震动比地表小、为什么山脊和陡坡震害更重。',
    'Why is ground motion at the surface twice that of the incident wave at depth? Because the free surface must have zero traction, so the incident wave excites a same-sign reflected wave and the two add at the surface. This simplest of results explains a great deal: why borehole seismometers record weaker shaking than surface ones, and why ridges and steep slopes suffer greater damage.',
  ),
  symbols: [
    { sym: 'A_{\\text{地表}}', name: t('地表记录的振幅', 'amplitude recorded at the surface'), unit: '与位移同' },
    { sym: 'R', name: t('自由表面的反射系数（位移）', 'reflection coefficient at the free surface (displacement)'), unit: '无量纲', typical: '≈ −1（压力）/ +1（位移）' },
    { sym: 'Z', name: t('波阻抗', 'acoustic impedance'), unit: 'kg m⁻² s⁻¹' },
  ],
  conditions: {
    applies: [t('P 波或 S 波垂直入射到自由表面', 'P or S waves at normal incidence on a free surface')],
    assumes: [t('介质均匀、表面水平', 'Uniform medium, horizontal surface')],
    breaks: [t('地形起伏（山脊、峡谷）时放大可达 3–5 倍，需用数值模拟', 'With topography such as ridges or canyons amplification reaches 3–5× and numerical modelling is needed')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('自由表面牵引力为零', 'Traction vanishes at the free surface'),
      latex: String.raw`\sigma_{zz}=0\quad (z=0)` },
    { n: 2, op: 'physics', title: t('入射波 + 反射波', 'Incident plus reflected waves'),
      latex: String.raw`\sigma_{zz}\propto p_{\text{入}}+p_{\text{反}}=0\;\Longrightarrow\; p_{\text{反}}=-p_{\text{入}}` },
    { n: 3, op: 'identity', title: t('位移与压力符号相反', 'Displacement carries the opposite sign to pressure'),
      latex: String.raw`u\propto-\frac{p}{Z}\ \text{（反射波反向传播）}\;\Longrightarrow\; u_{\text{反}}=+u_{\text{入}}` },
    { n: 4, op: 'result', title: t('地表位移为两倍', 'Surface displacement is doubled'),
      latex: String.raw`u_{\text{地表}}=u_{\text{入}}+u_{\text{反}}=2u_{\text{入}}` },
  ],
  viz: [
    {
      id: 'fs-amp',
      level: 'V1',
      title: t('入射波与反射波在地表叠加', 'Superposition of incident and reflected waves at the surface'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('位移（相对）', 'displacement (relative)'),
      controls: [
        { id: 't0', label: t('入射波到时', 'incident arrival time'), min: 0.1, max: 1.5, step: 0.05, value: 0.6, unit: 's' },
      ],
      compute: (p) => {
        const t0 = p['t0']
        const w = (t: number, c: number) => {
          const x = t - c
          return Math.exp(-40 * x * x) * Math.cos(2 * Math.PI * 8 * x)
        }
        const inc: Array<[number, number]> = []
        const tot: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const t = (i / 600) * 2
          inc.push([t, w(t, t0)])
          tot.push([t, w(t, t0) + w(t, t0)])
        }
        return [
          { label: t('入射波', 'incident'), color: '#B4B2A9', points: inc, dash: true },
          { label: t('地表记录 = 2×', 'surface record = 2×'), color: '#185FA5', points: tot },
        ]
      },
      note: t('两个完全相同的波叠加 → 幅值翻倍。井下地震计放在深处，测到的就是那条虚线。', 'Two identical waves superpose to double the amplitude. A borehole sensor at depth records the dashed curve.'),
    },
  ],
  links: {
    upstream: [{ id: 'acoustic-reflection-coefficient', note: t('R 的定义', 'Definition of R') }],
    seealso: [{ id: 'site-amplification-hv', note: t('土层共振在此之上再叠加', 'Soil resonance superposes on top of this') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' }],
}

export default freeSurfaceAmplification
