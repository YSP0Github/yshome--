import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-hydrostatic-pressure */
const physHydrostaticPressure: FormulaCard = {
  id: 'phys-hydrostatic-pressure',
  name: t('流体静压强', 'Hydrostatic Pressure'),
  aliases: { zh: ['液体压强 p=ρgh'], en: ['hydrostatic pressure', 'p = p0 + ρgh'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.GEOM', 'Q.ENERGY'],
    keywords: t('液体压强 静压强 深度 大气压 ρgh 潜水', 'hydrostatic pressure depth atmosphere diving ρgh'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`p=p_0+\rho g h`,
    variants: [
      { name: t('同一水平面上压强相等', 'pressure equal on a horizontal plane'), latex: String.raw`\Delta p=\rho g\,\Delta h` },
    ],
  },
  meaning: t(
    '静止液体中，深度 h 处的压强比液面大 ρgh：上面那一截液体的重量压下来。深度每增加约 10 m，压强就增加约 1 个大气压，所以潜水越深水雷、潜水艇要承受的压力越大。它与容器形状无关，只看深度。',
    'In a static liquid the pressure at depth h exceeds the surface pressure by ρgh — the weight of the column above. Every 10 m of depth adds about one atmosphere, which is why deeper water means larger loads on submarines. It depends only on depth, not on the shape of the container.',
  ),
  symbols: [
    { sym: 'p', name: t('深度 h 处压强', 'pressure at depth h'), unit: 'Pa' },
    { sym: 'p_0', name: t('液面大气压', 'surface atmospheric pressure'), unit: 'Pa' },
    { sym: '\\rho', name: t('液体密度', 'fluid density'), unit: 'kg/m³' },
    { sym: 'h', name: t('深度', 'depth below the surface'), unit: 'm' },
  ],
  conditions: {
    applies: [t('静止、不可压缩流体', 'Static, incompressible fluid')],
    assumes: [t('ρ、g 视为常数', 'ρ and g treated constant')],
    breaks: [t('流动或密度变化时须用 Bernoulli', 'Use Bernoulli when the fluid flows or density varies')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('取面积 A、高 h 的液柱', 'Take a column of area A and height h'), latex: String.raw`V=A h,\quad m=\rho A h` },
    { n: 2, op: 'physics', title: t('液柱重量压在底面上', 'Its weight presses on the base'), latex: String.raw`F=mg=\rho g A h` },
    { n: 3, op: 'algebra', title: t('压强=力/面积', 'Pressure = force / area'), latex: String.raw`\Delta p=\dfrac{F}{A}=\rho g h\;\Rightarrow\; p=p_0+\rho g h` },
  ],
  links: {
    downstream: [{ id: 'phys-archimedes-buoyancy' }, { id: 'phys-pascal-principle' }],
    seealso: [{ id: 'lithostatic-pressure' }],
  },
}

export default physHydrostaticPressure
