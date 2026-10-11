import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-elastic-potential-energy */
const physElasticPotentialEnergy: FormulaCard = {
  id: 'phys-elastic-potential-energy',
  name: t('弹性势能（Hooke 定律）', 'Elastic Potential Energy (Hooke’s Law)'),
  aliases: { zh: ['弹簧势能', '½kx²'], en: ['elastic potential energy', '½kx²', 'Hooke’s law'] },
  node: 'S18.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('弹性势能 弹簧 劲度系数 k 胡克定律 ½kx²', 'elastic potential energy spring stiffness k Hooke half kx squared'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`F=-kx,\qquad U_e=\tfrac{1}{2}k x^{2}`,
    variants: [
      { name: t('劲度系数并联/串联', 'springs in parallel / series'), latex: String.raw`k_{\parallel}=\sum k_i,\quad \dfrac{1}{k_{\text{series}}}=\sum\dfrac{1}{k_i}` },
    ],
  },
  meaning: t(
    '弹簧被拉长（或压缩）x 时，储存的弹性势能是 ½kx²，像把能量「上发条」。恢复力 F=-kx 与形变成正比、方向指向原长（负号），这就是 Hooke 定律——它是后面简谐振动的物理根源。',
    'When a spring is stretched or compressed by x, it stores elastic potential energy ½kx², like winding a spring. The restoring force F = −kx is proportional to the deformation and points back to equilibrium — Hooke’s law, the physical root of simple harmonic motion.',
  ),
  symbols: [
    { sym: 'k', name: t('劲度系数', 'spring constant'), unit: 'N/m' },
    { sym: 'x', name: t('相对原长的形变', 'displacement from natural length'), unit: 'm' },
    { sym: 'F', name: t('弹簧恢复力', 'restoring force'), unit: 'N' },
    { sym: 'U_e', name: t('弹性势能', 'elastic potential energy'), unit: 'J' },
  ],
  conditions: {
    applies: [t('弹性限度内的线性弹簧', 'Linear springs within their elastic limit')],
    assumes: [t('无质量、无阻尼', 'Massless, undamped')],
    breaks: [t('超过弹性限度发生塑性变形', 'Beyond the elastic limit deformation becomes plastic')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('Hooke 恢复力 F=-kx', 'Hooke restoring force F = −kx'), latex: String.raw`F=-kx` },
    { n: 2, op: 'physics', title: t('外力克服弹力做功储存势能', 'External work against the force stores energy'), latex: String.raw`U_e=\int_0^x k x'\,\mathrm{d}x'` },
    { n: 3, op: 'algebra', title: t('积分得 ½kx²', 'Integrate to ½kx²'), latex: String.raw`U_e=\tfrac{1}{2}k x^{2}` },
  ],
  links: {
    downstream: [{ id: 'phys-conservation-mechanical-energy' }, { id: 'phys-mass-spring-oscillator' }],
  },
}

export default physElasticPotentialEnergy
