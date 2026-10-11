import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-porosity-from-sonic */
const wlPorosityFromSonic: FormulaCard = {
  id: 'wl-porosity-from-sonic',
  name: t('声波求孔隙度 φS', 'Porosity from Sonic Log φS'),
  aliases: { zh: ['声波孔隙度', 'Wyllie 测井式'], en: ['sonic porosity', 'Wyllie log form'] },
  node: 'S17.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG', 'METH.ROCK'],
    quantity: ['Q.POR'],
    keywords: t('声波孔隙度 Wyllie Δt 时差 骨架时差 流体时差 压实校正', 'sonic porosity Wyllie slowness matrix fluid compaction correction'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\phi_{S}=\frac{\Delta t_{log}-\Delta t_{matrix}}{\Delta t_{fluid}-\Delta t_{matrix}}`,    variants: [
      { name: t('压实校正', 'Compaction correction'), latex: String.raw`\phi_{S}=\dfrac{\Delta t_{log}-\Delta t_{matrix}}{\Delta t_{fluid}-\Delta t_{matrix}}\times\dfrac{1}{B_{cp}}` },
    ],
  },
  meaning: t(
    '把 Wyllie 时间平均方程反过来，由声波测井 Δt 直接算孔隙度 φS。需要预先知道基质时差 Δt_matrix（石英约 55.5 μs/ft）和流体时差 Δt_fluid（水约 189）。未固结地层要乘压实校正系数 Bcp。声波孔隙度只探测连通孔隙，对低孔隙、致密层分辨率不如密度—中子。',
    'Inverting the Wyllie time-average equation, the sonic log Δt directly yields porosity φS. You need matrix slowness Δt_matrix (quartz ≈ 55.5 μs/ft) and fluid slowness Δt_fluid (water ≈ 189). Unconsolidated beds need a compaction correction Bcp. Sonic porosity sees connected pores and is less resolving in tight, low-porosity rock than density–neutron.',
  ),
  symbols: [
    { sym: '\\phi_{S}', name: t('声波孔隙度', 'sonic porosity'), unit: 'v/v' },
    { sym: '\\Delta t_{log}', name: t('实测声波时差', 'measured slowness'), unit: 'μs/ft' },
    { sym: '\\Delta t_{matrix}', name: t('基质时差', 'matrix slowness'), unit: 'μs/ft' },
    { sym: '\\Delta t_{fluid}', name: t('流体时差', 'fluid slowness'), unit: 'μs/ft' },
    { sym: 'B_{cp}', name: t('压实校正系数', 'compaction correction'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('胶结良好、单一流体饱和砂岩', 'Well-cemented, single-fluid sandstone')],
    breaks: [t('含气、泥质、未固结成岩均需校正', 'Gas, shale and unconsolidated rocks require corrections')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('Wyllie 时间平均', 'Wyllie time average'),
      latex: String.raw`\Delta t_{log}=\phi\Delta t_{fluid}+(1-\phi)\Delta t_{matrix}` },
    { n: 2, op: 'algebra', title: t('展开', 'Expand'),
      latex: String.raw`\Delta t_{log}=\Delta t_{matrix}+\phi(\Delta t_{fluid}-\Delta t_{matrix})` },
    { n: 3, op: 'result', title: t('解出 φS', 'Solve for φS'),
      latex: String.raw`\phi_{S}=\dfrac{\Delta t_{log}-\Delta t_{matrix}}{\Delta t_{fluid}-\Delta t_{matrix}}` },
  ],
  links: {
    upstream: [{ id: 'wl-sonic-travel-time' }, { id: 'wyllie-time-average' }],
    seealso: [{ id: 'wl-porosity-from-density' }],
  },
  refs: [{ text: 'Wyllie et al. (1956); Ellis & Singer §8' }],
}

export default wlPorosityFromSonic
