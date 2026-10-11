import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gardner-relation */
const gardnerRelation: FormulaCard = {
  id: 'gardner-relation',
  name: t('Gardner 密度—速度关系', 'The Gardner Density–Velocity Relation'),
  aliases: { zh: ['Gardner 公式'], en: ['Gardner relation', 'Gardner equation'] },
  node: 'S13.4',
  tags: {
    math: ['MATH.APPROX', 'MATH.STAT'],
    method: ['METH.ROCK', 'METH.EXPL'],
    quantity: ['Q.VEL', 'Q.MAT'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\rho=a\,v^{b},\qquad \rho=0.23\,v^{0.25}\ \ (v\ \text{单位}\ \mathrm{ft/s},\ \rho\ \text{单位}\ \mathrm{g/cm^3})`,
    variants: [
      { name: t('SI 单位形式', 'SI-unit form'), latex: String.raw`\rho\approx1.74\,v^{0.25}\quad (v\ \text{单位}\ \mathrm{km/s},\ \rho\ \text{单位}\ \mathrm{g/cm^3})` },
      { name: t('泥岩基线（Castagna）', 'The mudrock line (Castagna)'), latex: String.raw`v_S=0.862\,v_P-1.172\quad (\text{单位}\ \mathrm{km/s})` },
    ],
  },
  meaning: t(
    '地震勘探只测速度，但反射系数、波阻抗、AVO 反演都需要密度。Gardner 关系是填这个空缺最常用的经验式：沉积岩的密度与速度的 0.25 次方成正比。它只是一句统计拟合，在蒸发岩、煤层、碳酸盐岩中会明显偏错 —— 但因为没有更好的通用办法，它至今仍是处理流程里的默认选项。',
    'Seismic surveys measure velocity, but reflection coefficients, impedance and AVO inversion all need density. The Gardner relation fills that gap: in sedimentary rocks density scales as the 0.25 power of velocity. It is only a statistical fit and errs badly for evaporites, coals and carbonates — yet with no better general alternative it remains the default choice in processing flows.',
  ),
  symbols: [
    { sym: '\\rho', name: t('体积密度', 'bulk density'), unit: 'g/cm³', typical: '1.8 – 2.7' },
    { sym: 'v', name: t('纵波速度', 'P-wave velocity'), unit: 'm/s' },
    { sym: 'a,b', name: t('岩性相关的回归系数', 'lithology-dependent regression coefficients'), unit: '—' },
  ],
  conditions: {
    applies: [t('碎屑岩沉积盆地（砂泥岩互层）', 'Clastic sedimentary basins (interbedded sand and shale)')],
    assumes: [t('岩石饱和、压实正常', 'Rocks are saturated and normally compacted')],
    breaks: [
      t('盐岩、石膏、煤层、碳酸盐岩不适用', 'Not applicable to salt, anhydrite, coal or carbonates'),
      t('欠压实、超压带密度偏低', 'Undercompacted and overpressured zones have lower density than predicted'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('收集速度—密度岩心与测井数据', 'Collect velocity–density core and log data'),
      latex: String.raw`\left\{(v_i,\rho_i)\right\}_{i=1}^{N}` },
    { n: 2, op: 'setup', title: t('假设幂律关系', 'Assume a power-law relation'),
      latex: String.raw`\rho=a\,v^{b}` },
    { n: 3, op: 'identity', title: t('取对数线性化', 'Linearise by taking logarithms'),
      latex: String.raw`\ln\rho=\ln a+b\ln v` },
    { n: 4, op: 'result', title: t('回归得 a、b', 'Regression gives a and b'),
      latex: String.raw`b\approx0.25,\qquad a=0.23\ \text{(英制单位)}` },
  ],
  viz: [
    {
      id: 'gardner-curve',
      level: 'V1',
      title: t('Gardner 曲线与实测散布', 'The Gardner curve and data scatter'),
      xlabel: t('纵波速度 v (m/s)', 'P-wave velocity v (m/s)'),
      ylabel: t('密度 ρ (g/cm³)', 'density ρ (g/cm³)'),
      controls: [
        { id: 'a', label: t('系数 a (SI)', 'coefficient a (SI)'), min: 1.2, max: 2.2, step: 0.01, value: 1.74 },
        { id: 'b', label: t('指数 b', 'exponent b'), min: 0.1, max: 0.5, step: 0.01, value: 0.25 },
      ],
      compute: (p) => {
        const a = p['a'], b = p['b']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const v = 1500 + (i / 200) * 4500
          pts.push([v, a * Math.pow(v / 1000, b)])
        }
        return [{ label: t('ρ = a·v^b', 'ρ = a·v^b'), color: '#185FA5', points: pts }]
      },
      note: t('速度从 2 km/s 到 5 km/s，密度只从 2.07 涨到 2.60 —— 密度的相对变化远小于速度，这正是 AVO 对密度不敏感的原因。', 'Velocity from 2 to 5 km/s raises density only from 2.07 to 2.60: the fractional change in density is far smaller than in velocity, which is why AVO is weakly sensitive to density.'),
    },
  ],
  links: {
    seealso: [{ id: 'gassmann-equation', note: t('物理上更严谨的密度—模量关系', 'A physically more rigorous density–modulus relation') }],
  },
  refs: [{ text: 'Gardner et al. (1974), Geophysics, 39' }],
}

export default gardnerRelation
