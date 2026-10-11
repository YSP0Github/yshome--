import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-bouguer-simple */
const gravityBouguerSimple: FormulaCard = {
  id: 'gravity-bouguer-simple',
  name: t('简单布格校正（无限水平板）', 'Simple Bouguer Correction (Infinite Slab)'),
  aliases: { zh: ['布格校正', '无限平板校正'], en: ['Bouguer correction', 'infinite slab'] },
  node: 'S14.3',
  tags: {
    math: ['MATH.TRANSFORM', 'MATH.APPROX'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV', 'Q.MAT'],
    keywords: t('布格校正 无限平板 2πGρh 密度', 'Bouguer correction infinite slab 2πGρh density'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\delta g_{\text{B}}=2\pi G\,\rho\,h\approx0.0419\,\rho\,h\ \ \mathrm{mGal}`,
    variants: [
      { name: t('ρ=2.67 g/cm³ 的典型值', 'typical value at ρ=2.67 g/cm³'), latex: String.raw`\delta g_{\text{B}}\approx0.112\,h\ \ \mathrm{mGal/m}` },
    ],
  },
  meaning: t(
    '自由空气校正把测点以下到基准面之间当成空的，但实际上那是一层厚 h、密度 ρ 的岩石板。这层板对测点有向下的引力，必须减去。把它近似为无限大水平板，引力恰为 2πGρh，与板的横向范围无关。典型 ρ=2.67 g/cm³ 时约 0.112 mGal/m。',
    'The free-air correction treats the layer between station and datum as empty, but it is actually a slab of rock of thickness h and density ρ. This slab pulls downward on the station and must be removed. Approximating it as an infinite horizontal slab gives exactly 2πGρh, independent of lateral extent; at ρ=2.67 g/cm³ this is about 0.112 mGal/m.',
  ),
  symbols: [
    { sym: '\\delta g_{\\text{B}}', name: t('布格校正量（向下减）', 'Bouguer correction (subtracted)'), unit: 'mGal' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³ kg⁻¹ s⁻²' },
    { sym: '\\rho', name: t('中间岩石板密度', 'density of the slab'), unit: 'g/cm³', typical: '2.67' },
    { sym: 'h', name: t('板厚（测点高程）', 'slab thickness (station elevation)'), unit: 'm' },
  ],
  conditions: {
    applies: [t('近水平、起伏不大的地区', 'Nearly flat, low-relief areas')],
    assumes: [t('岩层水平延伸无限、密度均匀', 'Infinite laterally, uniform density')],
    breaks: [t('山地山谷需叠加地形校正', 'Mountains/valleys need terrain correction')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('水平薄板在中心的引力', 'Attraction of a thin horizontal sheet at its centre'),
      latex: String.raw`dg=2\pi G\,\rho\,dz` },
    { n: 2, op: 'transform', title: t('从 0 到 h 积分板厚', 'Integrate slab thickness 0 to h'),
      latex: String.raw`\delta g_{\text{B}}=\int_{0}^{h}2\pi G\rho\,dz=2\pi G\rho h` },
    { n: 3, op: 'substitute', title: t('换算为 mGal（ρ 用 g/cm³）', 'Convert to mGal (ρ in g/cm³)'),
      latex: String.raw`2\pi G\approx4.19\times10^{-10}\ \mathrm{SI}\ \Rightarrow\ 0.0419\,\rho\,h\ \mathrm{mGal}` },
    { n: 4, op: 'result', title: t('板向下拉，须减去', 'Slab pulls down; must be subtracted'),
      latex: String.raw`g\ \text{归算}=g_{\text{obs}}+\delta g_{\text{FA}}-\delta g_{\text{B}}` },
  ],
  viz: [
    {
      id: 'bouguer-slab-vs-elevation',
      level: 'V1',
      title: t('布格校正与自由空气校正随高程', 'Bouguer vs free-air correction with elevation'),
      xlabel: t('高程 h (m)', 'elevation h (m)'),
      ylabel: t('校正量 (mGal)', 'correction (mGal)'),
      controls: [
        { id: 'rho', label: t('板密度 ρ', 'slab density ρ'), min: 1.8, max: 3.2, step: 0.05, value: 2.67, unit: 'g/cm³' },
      ],
      compute: (p) => {
        const rho = p['rho']
        const fa: Array<[number, number]> = []
        const bguer: Array<[number, number]> = []
        const net: Array<[number, number]> = []
        for (let i = 0; i <= 100; i++) {
          const h = i * 10
          const faVal = 0.3086 * h
          const bVal = 0.0419 * rho * h
          fa.push([h, faVal])
          bguer.push([h, bVal])
          net.push([h, faVal - bVal])
        }
        return [
          { label: t('自由空气 FA', 'free-air FA'), color: '#185FA5', points: fa },
          { label: t('布格板 B', 'Bouguer slab B'), color: '#BA7517', points: bguer },
          { label: t('净 = FA − B', 'net = FA − B'), color: '#0F6E56', points: net },
        ]
      },
      note: t('净校正 ≈(0.3086−0.0419ρ)h；ρ=2.67 时约 0.197h mGal/m —— 升高 1000 m 仍需加约 197 mGal。', 'Net correction ≈(0.3086−0.0419ρ)h; at ρ=2.67 about 0.197h mGal/m — raising 1000 m still adds ~197 mGal.'),
    },
  ],
  links: {
    upstream: [{ id: 'gravity-free-air-correction' }],
    downstream: [{ id: 'gravity-bouguer-complete' }, { id: 'gravity-bouguer-anomaly' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §3.5' }],
}

export default gravityBouguerSimple
