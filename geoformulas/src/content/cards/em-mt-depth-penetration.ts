import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** em-mt-depth-penetration */
const emMtDepthPenetration: FormulaCard = {
  id: 'em-mt-depth-penetration',
  name: t('MT 探测深度与频率的关系', 'MT Depth of Investigation vs Frequency'),
  aliases: { zh: ['趋肤深度法估计深度', 'MT测深深度', 'skin depth approximation'], en: ['MT sounding depth', 'depth–frequency relation'] },
  node: 'S16.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.EM', 'METH.INV'],
    quantity: ['Q.ELEC', 'Q.GEOM', 'Q.FREQ'],
    keywords: t('MT探测深度 趋肤深度 频率 地壳探测 频率测深', 'MT depth penetration skin depth frequency crust sounding'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`z_{invest}\approx \delta\approx 503\sqrt{\frac{\rho_{e}}{f}}\ \mathrm{m}`,
    variants: [
      { name: t('频段与深度', 'Band vs depth'), latex: String.raw`10^{3}\,\mathrm{Hz}\to 10\,\mathrm{m}\;;\quad 10^{-3}\,\mathrm{Hz}\to 100\,\mathrm{km}` },
    ],
  },
  meaning: t(
    '经验上 MT 对深度 z 的结构最敏感的频率，就是趋肤深度约等于 z 的频率。因此一套 MT 仪器从 10³ Hz 扫到 10⁻³ Hz，就能从地表一直"看"到几十公里深的地壳与上地幔顶部——这是其他电磁方法（TEM、AMT）达不到的深度。',
    'Empirically, MT is most sensitive to structure at depth z when the skin depth ≈ z. Sweeping from 10³ Hz to 10⁻³ Hz therefore images from the surface down tens of km into the crust and uppermost mantle — a depth range unmatched by TEM or AMT.',
  ),
  symbols: [
    { sym: 'z_{invest}', name: t('探测深度', 'depth of investigation'), unit: 'm' },
    { sym: '\\delta', name: t('趋肤深度', 'skin depth'), unit: 'm' },
    { sym: '\\rho_{e}', name: t('地层电阻率', 'formation resistivity'), unit: 'Ω·m' },
    { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
  ],
  conditions: {
    applies: [t('近似估计，用于实验设计与频段选择', 'Order-of-magnitude estimate for survey design')],
    breaks: [t('实际反演深度受噪声、静位移影响', 'Real depth limits depend on noise and static shift')],
  },
  links: {
    upstream: [{ id: 'em-skin-depth' }, { id: 'em-cagniard-apparent-resistivity' }],
    seealso: [{ id: 'em-mt-impedance' }],
  },
  refs: [{ text: 'Vozoff (1972), Magnetotellurics' }],
}

export default emMtDepthPenetration
