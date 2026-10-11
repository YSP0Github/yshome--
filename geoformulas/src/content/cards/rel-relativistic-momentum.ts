import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rel-relativistic-momentum */
const relRelativisticMomentum: FormulaCard = {
  id: 'rel-relativistic-momentum',
  name: t('相对论动量', 'Relativistic Momentum'),
  aliases: { zh: ['p=γmv'], en: ['relativistic momentum p = gamma m v'] },
  node: 'S20.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL', 'Q.ENERGY'],
    keywords: t('相对论动量 γmv 高速粒子 动量守恒 加速器', 'relativistic momentum gamma m v high-energy particle momentum conservation accelerator'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`p=\gamma mv=\frac{mv}{\sqrt{1-v^2/c^2}}`,
    variants: [
      { name: t('相对论动能', 'Relativistic kinetic energy'), latex: String.raw`K=(\gamma-1)mc^2` },
    ],
  },
  meaning: t(
    '经典动量 mv 在高速时不再守恒律里好用，正确的相对论动量是 p=γmv。速度接近 c 时 γ→∞，动量可以无限增大（不像经典那样线性增长），这就是粒子加速器要把粒子加速到接近光速时，动量越来越大、所需磁场越来越强的原因。低速时 γ≈1，退回 p=mv。',
    'The classical momentum mv no longer satisfies a conservation law at high speed; the correct relativistic momentum is p = γmv. As v approaches c, γ → ∞ and the momentum can grow without bound (instead of the linear classical growth) — which is why, as accelerators push particles near light speed, their momentum and the required magnetic field keep climbing. At low speed γ ≈ 1 and it reduces to p = mv.'
  ),
  symbols: [
    { sym: 'p', name: t('相对论动量', 'relativistic momentum'), unit: 'kg·m/s' },
    { sym: 'm', name: t('静质量', 'rest mass'), unit: 'kg' },
    { sym: 'v', name: t('粒子速度', 'particle speed'), unit: 'm/s' },
    { sym: '\\gamma', name: t('Lorentz 因子', 'Lorentz factor'), unit: '1' },
    { sym: 'K', name: t('相对论动能', 'relativistic kinetic energy'), unit: 'J' },
  ],
  conditions: {
    applies: [t('高速粒子、相对论力学', 'High-speed particles, relativistic mechanics')],
    assumes: [t('静质量 m 为不变量', 'Rest mass m is invariant')],
    breaks: [t('v≪c 时退回经典 p=mv', 'For v ≪ c it reduces to p = mv')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('要求碰撞中动量守恒在所有惯性系成立', 'Require momentum conservation in all inertial frames'), latex: String.raw`\mathbf{p}=\gamma m\mathbf{v}` },
    { n: 2, op: 'algebra', title: t('低速近似 γ≈1', 'Low-speed approximation γ ≈ 1'), latex: String.raw`p\approx mv` },
  ],
  links: {
    upstream: [{ id: 'rel-length-contraction' }],
    downstream: [{ id: 'rel-energy-momentum-relation' }, { id: 'rel-mass-energy-equivalence' }],
  },
  refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 4' }],
}

export default relRelativisticMomentum
