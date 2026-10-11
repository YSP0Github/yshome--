import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-kinetic-energy */
const physKineticEnergy: FormulaCard = {
  id: 'phys-kinetic-energy',
  name: t('动能', 'Kinetic Energy'),
  aliases: { zh: ['平动动能 ½mv²'], en: ['kinetic energy', '½mv²'] },
  node: 'S18.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('动能 ½mv² 运动的能量 焦耳', 'kinetic energy mv squared energy of motion joule'),
  },
  audience: 'highschool',
  complete: 'L1',
  statement: {
    main: String.raw`K=\tfrac{1}{2}m v^{2}`,
    variants: [
      { name: t('用动量表示', 'in terms of momentum'), latex: String.raw`K=\dfrac{p^{2}}{2m}` },
    ],
  },
  meaning: t(
    '动能是物体由于运动而具有的能量，与速率的平方成正比。这意味着速度加倍，动能变四倍——高速运动的破坏力之所以大，正源于此。它是标量，恒为非负。',
    'Kinetic energy is the energy a body has because it moves, proportional to the square of the speed. Double the speed and quadruple the energy — which is why fast motion is so destructive. It is a non-negative scalar.',
  ),
  symbols: [
    { sym: 'K', name: t('动能', 'kinetic energy'), unit: 'J' },
    { sym: 'm', name: t('质量', 'mass'), unit: 'kg' },
    { sym: 'v', name: t('速率', 'speed'), unit: 'm/s' },
    { sym: 'p', name: t('动量', 'momentum'), unit: 'kg·m/s' },
  ],
  conditions: {
    applies: [t('宏观低速物体的平动动能', 'Translational kinetic energy of a macroscopic body')],
    assumes: [t('非相对论', 'Non-relativistic')],
    breaks: [t('近光速时用相对论动能', 'Relativistic kinetic energy near light speed')],
  },
  links: {
    downstream: [{ id: 'phys-work-energy-theorem' }],
    seealso: [{ id: 'phys-rotational-kinetic-energy' }],
  },
}

export default physKineticEnergy
