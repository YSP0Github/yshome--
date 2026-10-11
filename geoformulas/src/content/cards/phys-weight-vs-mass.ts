import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-weight-vs-mass */
const physWeightVsMass: FormulaCard = {
  id: 'phys-weight-vs-mass',
  name: t('质量与重量', 'Mass and Weight'),
  aliases: { zh: ['重力', '重量 W=mg'], en: ['weight', 'W = mg'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.GRAV', 'Q.ENERGY'],
    keywords: t('质量 重量 重力 mg 千克 牛顿 区别', 'mass weight gravity kg newton distinction'),
  },
  audience: 'highschool',
  complete: 'L1',
  statement: {
    main: String.raw`W=m\,g`,
    variants: [
      { name: t('月球上的重量', 'weight on the Moon'), latex: String.raw`W_{\ Moon}=m\,g_{\ Moon},\quad g_{\ Moon}\approx 1.62\ \text{m/s}^{2}` },
    ],
  },
  meaning: t(
    '质量 m 是物体含物质多少、惯性大小的量度，单位千克（kg），在任何地方都不变；重量 W 是地球对物体的引力（重力），单位牛顿（N），随 g 变化。同一物体在月球上质量不变，但重量只有地球的约 1/6。',
    'Mass m is how much matter a body contains and how much inertia it has, measured in kilograms and invariant; weight W is the gravitational pull of the Earth, measured in newtons and varying with g. The same object has unchanged mass on the Moon but weighs about one sixth.',
  ),
  symbols: [
    { sym: 'W', name: t('重量（重力大小）', 'weight (magnitude of gravity)'), unit: 'N' },
    { sym: 'm', name: t('质量', 'mass'), unit: 'kg' },
    { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²', typical: '≈ 9.8' },
  ],
  conditions: {
    applies: [t('近地面物体所受重力', 'Weight of a body near the ground')],
    assumes: [t('地球参考系、忽略自转离心效应', 'Earth frame, centrifugal effect of rotation neglected')],
    breaks: [t('在其他星球或轨道失重环境中 g 不同', 'g differs on other bodies or in orbit')],
  },
  links: {
    upstream: [{ id: 'gravity-newton-law', note: t('由万有引力在地面取近似', 'Approximated from universal gravitation at the surface') }],
    downstream: [{ id: 'phys-apparent-weight-elevator' }],
  },
}

export default physWeightVsMass
