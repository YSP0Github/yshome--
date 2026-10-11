import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-newton-viscosity */
const physNewtonViscosity: FormulaCard = {
  id: 'phys-newton-viscosity',
  name: t('Newton 黏性内摩擦定律', "Newton's Law of Viscosity"),
  aliases: { zh: ['牛顿黏滞定律', '切应力与速度梯度'], en: ["Newton's viscosity law", 'shear stress and velocity gradient'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL', 'Q.ENERGY'],
    keywords: t('黏度 黏性 内摩擦 速度梯度 牛顿流体 切应力', 'viscosity internal friction velocity gradient Newtonian fluid shear stress'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`\tau=\mu\,\frac{\mathrm{d}u}{\mathrm{d}y}`,
    variants: [
      { name: t('平行板间流量（Poiseuille）', 'flow between plates (Poiseuille)'), latex: String.raw`Q=\dfrac{\pi R^{4}\Delta p}{8\mu L}` },
    ],
  },
  meaning: t(
    '黏性是流体「内摩擦」：相邻流层速度不同时，慢层会拖慢快层。Newton 黏性定律说，层间切应力 τ 正比于垂直于流动方向的速度梯度 du/dy，比例系数就是动力黏度 μ。水的 μ 很小、蜂蜜很大；空气阻力、血流阻力都由它描述。',
    'Viscosity is a fluid’s internal friction: when neighbouring layers move at different speeds, the slower layer drags on the faster. Newton’s viscosity law says the shear stress τ is proportional to the velocity gradient du/dy across the flow, with the dynamic viscosity μ as the constant. Water has a tiny μ, honey a large one; air drag and blood-flow resistance are described by it.',
  ),
  symbols: [
    { sym: '\\tau', name: t('切应力', 'shear stress'), unit: 'Pa' },
    { sym: '\\mu', name: t('动力黏度', 'dynamic viscosity'), unit: 'Pa·s' },
    { sym: '\\dfrac{\\mathrm{d}u}{\\mathrm{d}y}', name: t('速度梯度', 'velocity gradient'), unit: 's⁻¹' },
  ],
  conditions: {
    applies: [t('牛顿流体（如水、空气）', 'Newtonian fluids such as water and air')],
    assumes: [t('层流、μ 与剪切率无关', 'Laminar flow, μ independent of shear rate')],
    breaks: [t('油漆、聚合物等非牛顿流体 μ 随剪切变', 'Non-Newtonian fluids (paint, polymers) have shear-dependent μ')],
  },
  links: { seealso: [{ id: 'phys-bernoulli-equation', note: t('Bernoulli 忽略黏性的极端', 'Bernoulli is the inviscid limit') }] },
}

export default physNewtonViscosity
