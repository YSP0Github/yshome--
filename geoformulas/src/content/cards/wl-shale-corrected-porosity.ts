import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-shale-corrected-porosity */
const wlShaleCorrectedPorosity: FormulaCard = {
  id: 'wl-shale-corrected-porosity',
  name: t('含泥质校正孔隙度', 'Shale-corrected Porosity'),
  aliases: { zh: ['校正孔隙度', '泥质影响扣除'], en: ['shale-corrected porosity', 'clay correction'] },
  node: 'S17.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG', 'METH.ROCK'],
    quantity: ['Q.POR'],
    keywords: t('含泥质校正 孔隙度 Vsh 泥质孔隙度 有效孔隙度', 'shale corrected porosity Vsh shale porosity effective'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\phi_{e}=\phi_{log}-V_{sh}\,\phi_{shale}`,    variants: [
      { name: t('密度—中子交会形式', 'From neutron–density'), latex: String.raw`\phi_{e}=\phi_{N/D}-V_{sh}\,\phi_{N,D}^{shale}` },
    ],
  },
  meaning: t(
    '泥岩本身也有"孔隙"（结合水），所以含泥质地层的测井孔隙度会把泥质部分也算进去。用 Vsh 乘以纯泥岩的孔隙度 φshale，从总测井孔隙度中扣除，才得到真正的有效孔隙度 φe。这是代入 Archie 求 Sw 之前必须做的一步。',
    'Shale itself carries "porosity" (bound water), so the log-derived porosity of a shaly bed includes the shale fraction. Multiplying Vsh by the shale porosity φshale and subtracting from the total log porosity yields the true effective porosity φe — a required step before feeding Archie for Sw.',
  ),
  symbols: [
    { sym: '\\phi_{e}', name: t('有效孔隙度', 'effective porosity'), unit: 'v/v' },
    { sym: '\\phi_{log}', name: t('测井读出的总孔隙度', 'log total porosity'), unit: 'v/v' },
    { sym: 'V_{sh}', name: t('泥质体积分数', 'shale volume fraction'), unit: 'v/v' },
    { sym: '\\phi_{shale}', name: t('纯泥岩孔隙度', 'pure-shale porosity'), unit: 'v/v' },
  ],
  conditions: {
    applies: [t('含泥质砂岩，Vsh 已知', 'Shaly sandstone with known Vsh')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('测井孔隙度含泥质贡献', 'Log porosity includes shale'),
      latex: String.raw`\phi_{log}=(1-V_{sh})\phi_{e}+V_{sh}\phi_{shale}` },
    { n: 2, op: 'algebra', title: t('解出 φe', 'Solve for φe'),
      latex: String.raw`\phi_{e}=\dfrac{\phi_{log}-V_{sh}\phi_{shale}}{1-V_{sh}}` },
    { n: 3, op: 'result', title: t('近似式', 'Approximation'),
      latex: String.raw`\phi_{e}\approx\phi_{log}-V_{sh}\phi_{shale}` },
  ],
  links: {
    upstream: [{ id: 'wl-shale-volume-larionov' }],
    downstream: [{ id: 'wl-archie-water-saturation' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §12' }],
}

export default wlShaleCorrectedPorosity
