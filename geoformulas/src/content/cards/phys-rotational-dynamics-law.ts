import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-rotational-dynamics-law */
const physRotationalDynamicsLaw: FormulaCard = {
  id: 'phys-rotational-dynamics-law',
  name: t('转动定律', 'Rotational Dynamics: τ = Iα'),
  aliases: { zh: ['转动第二定律', 'τ=Iα'], en: ["Newton's second law for rotation", 'τ = Iα'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('转动定律 力矩 转动惯量 角加速度 τ=Iα', 'rotational law torque moment of inertia angular acceleration'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\sum \tau=I\,\alpha`,
  },
  meaning: t(
    '转动定律是 Newton 第二定律的转动版：合外力矩等于转动惯量乘以角加速度。三者一一对应——力矩↔力，转动惯量↔质量，角加速度↔线加速度。它告诉你：要让一个大飞轮快速转起来，不仅力矩要大，还得考虑它的转动惯量。',
    'The rotational law is Newton’s second law for rotation: net torque equals moment of inertia times angular acceleration. The mapping is one-to-one — torque↔force, moment of inertia↔mass, angular acceleration↔linear acceleration. It says spinning up a heavy flywheel quickly needs both a large torque and awareness of its large I.',
  ),
  symbols: [
    { sym: '\\sum\\tau', name: t('合外力矩', 'net external torque'), unit: 'N·m' },
    { sym: 'I', name: t('转动惯量', 'moment of inertia'), unit: 'kg·m²' },
    { sym: '\\alpha', name: t('角加速度', 'angular acceleration'), unit: 'rad/s²' },
  ],
  conditions: {
    applies: [t('绕固定轴的刚体', 'A rigid body about a fixed axis')],
    assumes: [t('惯性系、轴固定', 'Inertial frame, fixed axis')],
    breaks: [t('动点轴或非惯性系需修正', 'Needs correction for moving axes or non-inertial frames')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('对每个质元列 F=ma', 'Apply F=ma to each mass element'), latex: String.raw`F_i=m_i a_i=m_i\,r_i\alpha` },
    { n: 2, op: 'substitute', title: t('两边乘 r_i 得力矩', 'Multiply by r_i to get the torque'), latex: String.raw`\tau_i=r_i F_i=m_i r_i^{2}\alpha` },
    { n: 3, op: 'algebra', title: t('对全体求和', 'Sum over all elements'), latex: String.raw`\sum\tau_i=\left(\sum m_i r_i^{2}\right)\alpha=I\alpha` },
  ],
  links: {
    upstream: [{ id: 'phys-torque-definition' }, { id: 'phys-moment-of-inertia' }],
    downstream: [{ id: 'phys-angular-momentum' }],
  },
}

export default physRotationalDynamicsLaw
