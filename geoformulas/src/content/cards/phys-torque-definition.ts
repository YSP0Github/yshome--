import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-torque-definition */
const physTorqueDefinition: FormulaCard = {
  id: 'phys-torque-definition',
  name: t('力矩', 'Torque'),
  aliases: { zh: ['力矩 τ=rF', '力臂'], en: ['torque', 'moment of force', 'lever arm'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.VECTOR', 'MATH.GEOM'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.GEOM'],
    keywords: t('力矩 力臂 扳手 转动作用效果 τ=rFsinθ', 'torque lever arm wrench rotational effect'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\tau = r F \sin\theta = r_\perp F`,
    variants: [
      { name: t('矢量叉乘', 'vector cross product'), latex: String.raw`\boldsymbol{\tau}=\mathbf{r}\times\mathbf{F}` },
    ],
  },
  meaning: t(
    '力矩是使物体转动起来的「推动」，相当于转动版的力。它不仅取决于力 F 的大小，还取决于力臂——转轴到力作用线的垂直距离 r⊥。同样的力，扳手越长越省力，正是因为力臂大、力矩大。',
    'Torque is the “push” that turns a body, the rotational analogue of force. It depends not only on the force F but also on the lever arm — the perpendicular distance from the pivot to the line of action. That is why a longer wrench needs less force: a bigger lever arm gives a bigger torque.',
  ),
  symbols: [
    { sym: '\\tau', name: t('力矩', 'torque'), unit: 'N·m' },
    { sym: 'r', name: t('转轴到作用点距离', 'distance from pivot to point of application'), unit: 'm' },
    { sym: 'F', name: t('力', 'force'), unit: 'N' },
    { sym: '\\theta', name: t('r 与 F 夹角', 'angle between r and F'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('绕固定轴的转动', 'Rotation about a fixed axis')],
    assumes: [t('力作用在垂直于轴的平面内', 'Force lies in the plane perpendicular to the axis')],
    breaks: [t('力平行于轴时不产生绕轴力矩', 'A force parallel to the axis gives no axial torque')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('把力分解为切向/径向', 'Resolve force into tangential / radial parts'), latex: String.raw`F_t=F\sin\theta,\quad F_r=F\cos\theta` },
    { n: 2, op: 'physics', title: t('只有切向分量产生转动效果', 'Only the tangential component turns the body'), latex: String.raw`\tau=r F_t=r F\sin\theta` },
  ],
  links: {
    downstream: [{ id: 'phys-rotational-dynamics-law' }],
  },
}

export default physTorqueDefinition
