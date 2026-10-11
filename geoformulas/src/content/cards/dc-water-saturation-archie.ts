import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** dc-water-saturation-archie */
const dcWaterSaturationArchie: FormulaCard = {
  id: 'dc-water-saturation-archie',
  name: t('Archie 含水饱和度公式', 'Archie Water-saturation Equation'),
  aliases: { zh: ['Sw 计算公式', 'Archie 综合式'], en: ['Archie water-saturation equation', 'Sw equation'] },
  node: 'S16.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.EM', 'METH.ROCK'],
    quantity: ['Q.ELEC', 'Q.POR'],
    keywords: t('含水饱和度 Sw Archie Rw Rt 孔隙度 油水层判别', 'water saturation Archie Rw Rt porosity pay discriminator'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`S_{w}=\left(\frac{a\,R_{w}}{\phi^{m}\,R_{t}}\right)^{1/n}`,
    variants: [
      { name: t('含水体积/含油饱和度', 'Water vs hydrocarbon volume'), latex: String.raw`S_{o}=1-S_{w},\quad S_{g}=1-S_{w}-S_{o}` },
      { name: t('判据', 'Pay cut-off'), latex: String.raw`S_{w}<0.4\,\text{通常视为油气层}` },
    ],
  },
  meaning: t(
    '把 F=a/φ^m 代入 I=Rt/Ro=Sw^{−n}，就得到完整的 Archie 含水饱和度公式：测到地层真电阻率 Rt、已知孔隙度 φ、地层水电阻率 Rw 和岩性参数 a、m、n，即可算出 Sw。Sw 小（<30–40%）为油气层，Sw≈1 为水层——这是电法与测井定量解释的最终产物。',
    'Substituting F=a/φ^m into I=Rt/Ro=Sw^{−n} gives the complete Archie water-saturation equation: from the measured true resistivity Rt, porosity φ, formation-water resistivity Rw and lithology constants a, m, n, compute Sw. Sw small (<30–40%) indicates a hydrocarbon pay; Sw≈1 a water leg — the end product of quantitative electrical and log interpretation.',
  ),
  symbols: [
    { sym: 'S_{w}', name: t('含水饱和度', 'water saturation'), unit: '无量纲' },
    { sym: 'a', name: t('岩性系数', 'lithology coefficient'), unit: '无量纲' },
    { sym: 'R_{w}', name: t('地层水电阻率', 'formation-water resistivity'), unit: 'Ω·m' },
    { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲' },
    { sym: 'm', name: t('胶结指数', 'cementation exponent'), unit: '无量纲' },
    { sym: 'R_{t}', name: t('原状地层真电阻率', 'true formation resistivity'), unit: 'Ω·m' },
    { sym: 'n', name: t('饱和度指数', 'saturation exponent'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('干净砂岩，单一流体导电', 'Clean sandstone, single conductive fluid')],
    assumes: [t('φ、Rw、a、m、n 均已知或合理估计', 'φ, Rw, a, m, n known or reasonably estimated')],
    breaks: [t('含泥质、低阻油层需修正（Simandoux 等）', 'Shaly/low-resistivity pay needs corrections (Simandoux, …)')],
  },
  derivation: [
    { n: 1, op: 'substitute', title: t('Ro=F·Rw=aRw/φ^m', 'Ro=F·Rw=aRw/φ^m'),
      latex: String.raw`R_{o}=\dfrac{a\,R_{w}}{\phi^{m}}` },
    { n: 2, op: 'substitute', title: t('代入 I=Rt/Ro=Sw^−n', 'Into I=Rt/Ro=Sw^−n'),
      latex: String.raw`\dfrac{R_{t}}{R_{o}}=S_{w}^{-n}\;\Rightarrow\;\dfrac{\phi^{m}R_{t}}{aR_{w}}=S_{w}^{-n}` },
    { n: 3, op: 'algebra', title: t('两边取 1/n 次方', 'Take power 1/n'),
      latex: String.raw`S_{w}=\left(\dfrac{a\,R_{w}}{\phi^{m}R_{t}}\right)^{1/n}` },
  ],
  viz: [
    {
      id: 'archie-sw-rt',
      level: 'V1',
      title: t('Sw 随地层电阻率 Rt 的变化', 'Sw versus formation resistivity Rt'),
      xlabel: t('真电阻率 Rt (Ω·m)', 'true resistivity Rt (Ω·m)'),
      ylabel: t('含水饱和度 Sw', 'water saturation Sw'),
      controls: [
        { id: 'phi', label: t('孔隙度 φ', 'porosity φ'), min: 0.05, max: 0.35, step: 0.01, value: 0.2 },
        { id: 'rw', label: t('Rw (Ω·m)', 'formation-water resistivity'), min: 0.01, max: 1, step: 0.01, value: 0.05, unit: 'Ω·m' },
        { id: 'mval', label: t('m', 'cementation exponent'), min: 1.5, max: 2.5, step: 0.1, value: 2 },
        { id: 'nval', label: t('n', 'saturation exponent'), min: 1.5, max: 3, step: 0.1, value: 2 },
      ],
      compute: (p) => {
        const phi = p['phi'], rw = p['rw'], mval = p['mval'], nval = p['nval']
        const pts: Array<[number, number]> = []
        for (let i = 1; i <= 200; i++) {
          const rt = (i / 200) * 200
          const sw = Math.pow((rw) / (Math.pow(phi, mval) * rt), 1 / nval)
          pts.push([rt, Math.min(sw, 1)])
        }
        return [{ label: t('Archie Sw', 'Archie Sw'), color: '#185FA5', points: pts }]
      },
      note: t('Rt 越高 Sw 越低；水层 Sw≈1、油层 Sw 显著下降。横向约 0.4 处即为常见油气层下限。', 'Higher Rt gives lower Sw; water leg Sw≈1, pay drops markedly. Sw≈0.4 is a common pay cut-off.'),
    },
  ],
  links: {
    upstream: [{ id: 'dc-archie-formation-factor' }, { id: 'dc-archie-resistivity-ratio' }],
    seealso: [{ id: 'wl-archie-water-saturation', note: t('测井综合算例', 'Log worked example') }],
  },
  refs: [{ text: 'Archie (1942); Bassiouni (1994), Well Logging' }],
}

export default dcWaterSaturationArchie
