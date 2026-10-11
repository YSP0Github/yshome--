import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-newton-first-law */
const physNewtonFirstLaw: FormulaCard = {
  id: 'phys-newton-first-law',
  name: t('Newton 第一定律（惯性定律）', "Newton's First Law (Inertia)"),
  aliases: { zh: ['惯性定律', '惰性定律'], en: ['law of inertia', 'Newton I'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL', 'Q.ENERGY'],
    keywords: t('惯性 合外力为零 匀速直线运动 惯性参考系', 'inertia zero net force uniform straight motion inertial frame'),
  },
  audience: 'highschool',
  complete: 'L1',
  statement: {
    main: String.raw`\sum \mathbf{F}=0\;\Longrightarrow\; \mathbf{v}=\text{常量}`,
  },
  meaning: t(
    '物体在不受外力或合外力为零时，保持静止或匀速直线运动状态。这说明「运动不需要力来维持」，力不是维持速度的原因，而是改变速度（产生加速度）的原因。它同时定义了什么是惯性参考系。',
    'A body keeps at rest or in uniform straight motion when no net force acts on it. Motion needs no force to sustain it; a force changes the velocity (produces acceleration). The law also defines what an inertial frame is.',
  ),
  symbols: [
    { sym: '\\sum\\mathbf{F}', name: t('合外力', 'net external force'), unit: 'N' },
    { sym: '\\mathbf{v}', name: t('速度矢量', 'velocity vector'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('惯性参考系中的质点', 'A point mass in an inertial frame')],
    assumes: [t('忽略相对论与量子效应', 'Non-relativistic, non-quantum regime')],
    breaks: [t('非惯性系中需引入惯性力', 'In non-inertial frames inertial forces must be added')],
  },
  links: {
    downstream: [{ id: 'phys-newton-second-law', note: t('合外力不为零时的推广', 'Generalised to non-zero net force') }],
  },
}

export default physNewtonFirstLaw
