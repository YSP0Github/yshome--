import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-bouguer-complete */
const gravityBouguerComplete: FormulaCard = {
  id: 'gravity-bouguer-complete',
  name: t('完全布格校正', 'Complete Bouguer Correction'),
  aliases: { zh: ['完全布格', 'TC+BC'], en: ['complete Bouguer correction'] },
  node: 'S14.3',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('完全布格校正 地形 综合', 'complete Bouguer correction terrain combined'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\delta g_{\text{CB}}=\delta g_{\text{FA}}-\delta g_{\text{B}}+\delta g_{\text{T}}`,
    variants: [
      { name: t('代入数值（ρ=2.67）', 'Numerical form (ρ=2.67)'), latex: String.raw`\delta g_{\text{CB}}=(0.3086-0.112)\,h+\delta g_{\text{T}}=0.197\,h+\delta g_{\text{T}}` },
    ],
  },
  meaning: t(
    '完全布格校正把自由空气校正、无限布格板、地形校正三项合成一个高度归算项：先加回升高造成的引力损失（FA），再减去中间岩石板的引力（B），最后把山头/山谷偏离平板的部分修正回来（TC）。它把任意高程测点都归算成"大地水准面上的等效重力"。',
    'The complete Bouguer reduction combines free-air, infinite-slab and terrain corrections into one height reduction: add back the loss from elevation (FA), remove the slab attraction (B), then restore the hill/valley deviations from a flat slab (TC). It reduces any station to "equivalent gravity on the geoid".',
  ),
  symbols: [
    { sym: '\\delta g_{\\text{CB}}', name: t('完全布格校正', 'complete Bouguer correction'), unit: 'mGal' },
    { sym: '\\delta g_{\\text{FA}}', name: t('自由空气校正', 'free-air correction'), unit: 'mGal' },
    { sym: '\\delta g_{\\text{B}}', name: t('布格板校正', 'Bouguer slab correction'), unit: 'mGal' },
    { sym: '\\delta g_{\\text{T}}', name: t('地形校正', 'terrain correction'), unit: 'mGal' },
  ],
  conditions: {
    applies: [t('陆地上任意高程与地形', 'Land stations at any elevation/terrain')],
    assumes: [t('表层密度取固定值（常 2.67）', 'Fixed near-surface density (often 2.67)')],
    breaks: [t('厚覆盖层或雪盖密度未知', 'Fails with unknown overburden/ice density')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('自由空气加回', 'Add back free-air loss'),
      latex: String.raw`+\delta g_{\text{FA}}=+0.3086\,h` },
    { n: 2, op: 'setup', title: t('减去布格板', 'Subtract Bouguer slab'),
      latex: String.raw`-\delta g_{\text{B}}=-2\pi G\rho h` },
    { n: 3, op: 'setup', title: t('加回地形偏差', 'Add back terrain deviation'),
      latex: String.raw`+\delta g_{\text{T}}` },
    { n: 4, op: 'result', title: t('合成完全布格校正', 'Combine into complete Bouguer reduction'),
      latex: String.raw`\delta g_{\text{CB}}=\delta g_{\text{FA}}-\delta g_{\text{B}}+\delta g_{\text{T}}` },
  ],
  links: {
    upstream: [{ id: 'gravity-bouguer-simple' }, { id: 'gravity-terrain-correction' }],
    downstream: [{ id: 'gravity-bouguer-anomaly' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §3.5' }],
}

export default gravityBouguerComplete
