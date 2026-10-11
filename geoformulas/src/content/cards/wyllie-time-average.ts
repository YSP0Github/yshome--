import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wyllie-time-average */
const wyllieTimeAverage: FormulaCard = {
  id: 'wyllie-time-average',
  name: t('Wyllie 时间平均方程', 'The Wyllie Time-average Equation'),
  aliases: { zh: ['时间平均方程', 'Wyllie 公式'], en: ['Wyllie time-average', 'time-average equation'] },
  node: 'S13.1',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.APPROX'],
    method: ['METH.ROCK'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{1}{v}=\frac{\phi}{v_f}+\frac{1-\phi}{v_m}`,
    variants: [
      { name: t('解出孔隙度', 'Solved for porosity'), latex: String.raw`\phi=\frac{\dfrac{1}{v}-\dfrac{1}{v_m}}{\dfrac{1}{v_f}-\dfrac{1}{v_m}}` },
      { name: t('Raymer–Hunt–Gardner 经验式', 'Raymer–Hunt–Gardner empirical relation'), latex: String.raw`\frac{1}{v}=\frac{\phi}{v_f}+\frac{1-\phi^{2}}{v_m}\quad(\text{高孔隙度段改进})` },
    ],
  },
  meaning: t(
    '这是岩石物理里最著名也最被滥用的一条经验关系：岩石的慢度等于孔隙流体慢度与骨架慢度按体积分数的加权平均。它在干净、胶结良好的砂岩里相当准，但在泥质含量高、裂缝发育或未固结的岩石里误差很大 —— 用之前务必想清楚你的岩石是不是它标定时的那种岩石。',
    'This is the most famous and most misused empirical relation in rock physics: the slowness of a rock equals the volume-weighted average of pore-fluid and matrix slowness. It works well for clean, well-cemented sandstones, but errs badly in shaly, fractured or unconsolidated rocks. Before using it, always ask whether your rock resembles the rocks it was calibrated on.',
  ),
  symbols: [
    { sym: 'v', name: t('岩石的纵波速度', 'P-wave velocity of the rock'), unit: 'm/s' },
    { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲', typical: '0.05 – 0.4' },
    { sym: 'v_f', name: t('孔隙流体速度（水约 1500 m/s）', 'pore-fluid velocity (water ≈ 1500 m/s)'), unit: 'm/s' },
    { sym: 'v_m', name: t('基质（矿物骨架）速度（石英约 6000 m/s）', 'matrix (mineral) velocity (quartz ≈ 6000 m/s)'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('干净、胶结良好的碎屑岩，孔隙被单一流体饱和', 'Clean, well-cemented clastic rocks saturated with a single fluid')],
    assumes: [
      t('波长远大于孔隙尺度（等效介质成立）', 'The wavelength is far larger than the pore scale (effective medium valid)'),
      t('孔隙均匀分布、连通性良好', 'Pores are uniformly distributed and well connected'),
    ],
    breaks: [
      t('含泥质时速度被显著拉低，需用泥质校正', 'Clay content lowers velocity markedly; a shale correction is needed'),
      t('含气时 Gassmann 效应远比时间平均复杂（见流体替换）', 'With gas present the Gassmann effect is far more complex than simple averaging'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设岩石为厚度比例的层状堆叠', 'Model the rock as a stack of layers in proportion'),
      latex: String.raw`\text{总厚度}=\underbrace{\phi}_{\text{流体层}}+\underbrace{1-\phi}_{\text{骨架层}}` },
    { n: 2, op: 'geometry', title: t('波穿过总厚度的旅行时间', 'Travel time through the total thickness'),
      latex: String.raw`t=\frac{\phi}{v_f}+\frac{1-\phi}{v_m}` },
    { n: 3, op: 'algebra', title: t('有效速度 = 总厚度 / 总时间', 'Effective velocity = total thickness / total time'),
      latex: String.raw`v=\frac{1}{t}\;\Longrightarrow\; \frac{1}{v}=\frac{\phi}{v_f}+\frac{1-\phi}{v_m}` },
  ],
  viz: [
    {
      id: 'wyllie-curve',
      level: 'V1',
      title: t('速度随孔隙度的变化', 'Velocity versus porosity'),
      xlabel: t('孔隙度 φ', 'porosity φ'),
      ylabel: t('纵波速度 v (m/s)', 'P-wave velocity v (m/s)'),
      controls: [
        { id: 'vm', label: t('基质速度 v_m', 'matrix velocity v_m'), min: 3500, max: 7000, step: 50, value: 6000, unit: 'm/s' },
        { id: 'vf', label: t('流体速度 v_f', 'fluid velocity v_f'), min: 300, max: 1800, step: 50, value: 1500, unit: 'm/s' },
      ],
      compute: (p) => {
        const vm = p['vm'], vf = p['vf']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const phi = (i / 200) * 0.6
          pts.push([phi, 1 / (phi / vf + (1 - phi) / vm)])
        }
        return [{ label: t('Wyllie', 'Wyllie'), color: '#185FA5', points: pts }]
      },
      note: t('把流体换成气（v_f ≈ 400 m/s），速度会暴跌 —— 这就是"亮点"技术的物理基础，但也说明该式对含气太敏感而失真。', 'Switching the fluid to gas (v_f ≈ 400 m/s) collapses the velocity — the physical basis of bright-spot technology, and also a sign that the equation over-reacts to gas.'),
    },
  ],
  example: {
    title: t('含水砂岩', 'A water-saturated sandstone'),
    input: t('φ = 0.25，v_f = 1500 m/s（水），v_m = 6000 m/s（石英）', 'φ = 0.25, v_f = 1500 m/s (water), v_m = 6000 m/s (quartz)'),
    steps: [
      t('1/v = 0.25/1500 + 0.75/6000 = 1.667×10⁻⁴ + 1.25×10⁻⁴ = 2.917×10⁻⁴ s/m', '1/v = 0.25/1500 + 0.75/6000 = 1.667×10⁻⁴ + 1.25×10⁻⁴ = 2.917×10⁻⁴ s/m'),
    ],
    output: t('v ≈ 3429 m/s —— 典型的中浅层含水砂岩速度', 'v ≈ 3429 m/s — a typical velocity for a shallow water-saturated sandstone'),
  },
  links: {
    seealso: [{ id: 'gassmann-equation', note: t('流体替换的正确工具', 'The proper tool for fluid substitution') }],
  },
  refs: [{ text: 'Wyllie et al. (1956), Geophysics, 21' }, { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook' }],
}

export default wyllieTimeAverage
