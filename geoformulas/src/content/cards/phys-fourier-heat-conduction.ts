import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-fourier-heat-conduction */
const physFourierHeatConduction: FormulaCard = {
  id: 'phys-fourier-heat-conduction',
  name: t('Fourier 热传导定律', "Fourier's Law of Heat Conduction"),
  aliases: { zh: ['傅里叶导热', '热流密度'], en: ["Fourier's law", 'heat conduction'] },
  node: 'S18.6',
  tags: {
    math: ['MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('热传导 傅里叶定律 热导率 温差 隔热', 'Fourier heat conduction thermal conductivity temperature gradient insulation'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\frac{Q}{t}=-\kappa A\frac{\mathrm{d}T}{\mathrm{d}x}`,
    variants: [
      { name: t('平板稳态传热', 'steady slab conduction'), latex: String.raw`\dfrac{Q}{t}=\kappa A\dfrac{\Delta T}{L}` },
    ],
  },
  meaning: t(
    '单位时间通过面积 A 传导的热量，正比于热导率 κ 和两端温差、反比于厚度 L。热导率 κ 大的铜是良导热体，泡沫塑料 κ 小、是保温材料。冬天摸铁觉得冷、摸木头觉得暖，不是因为它们温度不同，而是铁导热快、把你手上热量迅速导走。',
    'The heat conducted per second through area A is proportional to the conductivity κ and the temperature difference, and inversely proportional to thickness L. Copper (large κ) conducts well; foamed plastic (small κ) insulates. Iron feels colder than wood in winter not because it is colder, but because it conducts heat away from your hand rapidly.',
  ),
  symbols: [
    { sym: 'Q/t', name: t('热流功率', 'heat flow rate'), unit: 'W' },
    { sym: '\\kappa', name: t('热导率', 'thermal conductivity'), unit: 'W/(m·K)' },
    { sym: 'A', name: t('传热面积', 'cross-sectional area'), unit: 'm²' },
    { sym: 'dT/dx', name: t('温度梯度', 'temperature gradient'), unit: 'K/m' },
    { sym: 'L', name: t('厚度', 'thickness'), unit: 'm' },
  ],
  conditions: {
    applies: [t('固体或静止流体中的导热', 'Conduction in solids or static fluids')],
    assumes: [t('一维、稳态', '1-D, steady state')],
    breaks: [t('对流或辐射主导时需另算', 'Convection or radiation must be added separately')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('热流从高温流向低温', 'Heat flows from hot to cold'), latex: String.raw`\dfrac{Q}{t}\propto -A\dfrac{\Delta T}{L}` },
    { n: 2, op: 'algebra', title: t('引入比例系数 κ', 'Introduce the proportionality constant κ'), latex: String.raw`\dfrac{Q}{t}=\kappa A\dfrac{\Delta T}{L}` },
  ],
  links: { seealso: [{ id: 'phys-thermal-linear-expansion' }] },
}

export default physFourierHeatConduction
