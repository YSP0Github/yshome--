import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-newton-second-law */
const physNewtonSecondLaw: FormulaCard = {
  id: 'phys-newton-second-law',
  name: t('Newton 第二定律', "Newton's Second Law"),
  aliases: { zh: ['F=ma', '牛顿第二定律'], en: ['F = ma', 'Newton II', 'equation of motion'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.VEL'],
    keywords: t('牛顿第二定律 合外力 质量 加速度 F=ma', "Newton's second law net force mass acceleration F=ma"),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\sum \mathbf{F}=m\,\mathbf{a}=m\,\frac{\mathrm{d}\mathbf{v}}{\mathrm{d}t}`,
    variants: [
      { name: t('动量形式（更普遍）', 'momentum form (more general)'), latex: String.raw`\sum \mathbf{F}=\frac{\mathrm{d}\mathbf{p}}{\mathrm{d}t}` },
      { name: t('分量形式', 'component form'), latex: String.raw`\sum F_x=m a_x,\quad \sum F_y=m a_y` },
    ],
  },
  meaning: t(
    '物体的加速度与所受合外力成正比、与质量成反比，方向与合外力相同。这是整个经典动力学的核心方程：已知力求运动（正问题），或已知运动反推力（反问题）。质量 m 是物体惯性大小的量度。',
    'A body’s acceleration is proportional to the net force and inversely proportional to its mass, in the same direction as the force. This is the central equation of classical dynamics: solve for motion from forces (forward problem) or infer forces from motion (inverse problem). Mass m measures how much inertia a body has.',
  ),
  symbols: [
    { sym: '\\sum\\mathbf{F}', name: t('合外力矢量', 'net external force'), unit: 'N' },
    { sym: 'm', name: t('质量（惯性质量）', 'mass (inertial mass)'), unit: 'kg' },
    { sym: '\\mathbf{a}', name: t('加速度', 'acceleration'), unit: 'm/s²' },
    { sym: '\\mathbf{p}', name: t('动量', 'momentum'), unit: 'kg·m/s' },
  ],
  conditions: {
    applies: [t('惯性系、质量恒定的宏观物体', 'Inertial frame, constant-mass macroscopic bodies')],
    assumes: [t('非相对论速度', 'Non-relativistic speeds')],
    breaks: [t('变质量（火箭）或近光速时需修正', 'Needs modification for variable mass (rockets) or near light speed')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('力等于动量的时间变化率', 'Force equals the time rate of momentum'), latex: String.raw`\sum\mathbf{F}=\dfrac{\mathrm{d}\mathbf{p}}{\mathrm{d}t}` },
    { n: 2, op: 'substitute', title: t('动量 p=mv', 'Momentum p = mv'), latex: String.raw`\sum\mathbf{F}=\dfrac{\mathrm{d}(m\mathbf{v})}{\mathrm{d}t}` },
    { n: 3, op: 'algebra', title: t('质量恒定时提出 m', 'For constant mass pull m out'), latex: String.raw`\sum\mathbf{F}=m\dfrac{\mathrm{d}\mathbf{v}}{\mathrm{d}t}=m\mathbf{a}` },
  ],
  links: {
    upstream: [{ id: 'phys-newton-first-law' }],
    downstream: [
      { id: 'phys-work-energy-theorem', note: t('对位移积分得动能定理', 'Integrating over displacement gives the work–energy theorem') },
      { id: 'phys-impulse-momentum', note: t('对时间积分得冲量定理', 'Integrating over time gives the impulse theorem') },
    ],
  },
}

export default physNewtonSecondLaw
