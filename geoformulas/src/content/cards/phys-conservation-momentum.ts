import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-conservation-momentum */
const physConservationMomentum: FormulaCard = {
  id: 'phys-conservation-momentum',
  name: t('动量守恒定律', 'Conservation of Momentum'),
  aliases: { zh: ['动量守恒', '系统不受外力'], en: ['conservation of momentum'] },
  node: 'S18.3',
  tags: {
    math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('动量守恒 系统不受外力 碰撞 反冲 火箭', 'conservation of momentum closed system collision recoil rocket'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\sum m_i \mathbf{v}_i=\text{常量}\quad(\sum\mathbf{F}_{\text{ext}}=0)`,
    variants: [
      { name: t('两体碰撞前后', 'two-body collision before/after'), latex: String.raw`m_1\mathbf{v}_{1}+m_2\mathbf{v}_{2}=m_1\mathbf{v}_{1}'+m_2\mathbf{v}_{2}'` },
    ],
  },
  meaning: t(
    '一个不受外力（或合外力为零）的系统，总动量保持不变。它是比机械能守恒更普适的守恒律：即使碰撞把动能变成热，动量也分毫不差。反冲、火箭喷气、爆炸碎片飞散，都是动量守恒在起作用。',
    'A system with no net external force keeps its total momentum fixed. It is more universal than mechanical-energy conservation: even when a collision turns kinetic energy into heat, momentum is exactly conserved. Recoil, rocket exhaust, and flying fragments of an explosion all follow it.',
  ),
  symbols: [
    { sym: 'm_i', name: t('系统内各物体质量', 'masses in the system'), unit: 'kg' },
    { sym: '\\mathbf{v}_i', name: t('各物体速度', 'velocities of the bodies'), unit: 'm/s' },
    { sym: '\\sum\\mathbf{F}_{ext}', name: t('合外力', 'net external force'), unit: 'N' },
  ],
  conditions: {
    applies: [t('孤立系统（合外力为零）', 'An isolated system with zero net external force')],
    assumes: [t('内力成对抵消', 'Internal forces cancel pairwise')],
    breaks: [t('存在不可忽略外力时总动量变化', 'Total momentum changes when external force is non-negligible')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('Newton 第二定律动量形式', 'Newton II in momentum form'), latex: String.raw`\sum\mathbf{F}_{\text{ext}}=\dfrac{\mathrm{d}\mathbf{p}_{\text{tot}}}{\mathrm{d}t}` },
    { n: 2, op: 'setup', title: t('孤立系统合外力为零', 'Isolated system: net external force zero'), latex: String.raw`\sum\mathbf{F}_{\text{ext}}=0` },
    { n: 3, op: 'result', title: t('总动量不随时间变', 'Total momentum is constant in time'), latex: String.raw`\dfrac{\mathrm{d}\mathbf{p}_{\text{tot}}}{\mathrm{d}t}=0\;\Rightarrow\;\sum m_i\mathbf{v}_i=\text{const}` },
  ],
  links: {
    upstream: [{ id: 'phys-linear-momentum' }, { id: 'phys-newton-third-law' }],
    downstream: [{ id: 'phys-elastic-collision' }, { id: 'phys-inelastic-collision' }],
  },
}

export default physConservationMomentum
