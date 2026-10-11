import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-straight-wire-b */
const uemStraightWireB: FormulaCard = {
  id: 'uem-straight-wire-b',
  name: t('长直导线的磁场', 'Field of a Long Straight Wire'),
  aliases: { zh: ['直导线 B=μ0I/2πr', '右手定则'], en: ['straight-wire field', 'right-hand rule'] },
  node: 'S19.3',
  tags: {
    math: ['MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.MAG'],
    keywords: t('长直导线磁场 μ0I/2πr 同心圆 右手螺旋', 'long straight wire field concentric circles right-hand grip'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`B=\frac{\mu_{0}I}{2\pi r}`,
    variants: [
      { name: t('有限长直导线', 'Finite straight wire'), latex: String.raw`B=\dfrac{\mu_{0}I}{4\pi r}\left(\sin\theta_{1}+\sin\theta_{2}\right)` },
    ],
  },
  meaning: t(
    '无限长直载流导线在周围产生以导线为轴的同心圆磁场，方向由右手螺旋定则确定，大小 B=μ0I/2πr，随距离按 1/r 衰减。',
    'An infinite straight wire carrying current produces a concentric circular field around it, direction given by the right-hand grip rule, magnitude B=μ0I/2πr, decaying as 1/r with distance.',
  ),
  symbols: [
    { sym: 'B', name: t('磁感应强度', 'magnetic field'), unit: 'T' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: 'r', name: t('到导线垂直距离', 'perpendicular distance'), unit: 'm' },
    { sym: '\\mu_{0}', name: t('真空磁导率', 'permeability'), unit: 'H/m' },
  ],
  conditions: {
    applies: [t('导线无限长（或场点近中段）', 'Wire effectively infinite (field point near middle section)')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('由 Biot–Savart 积分', 'Integrate Biot–Savart'),
      latex: String.raw`B=\int_{-\infty}^{\infty}\dfrac{\mu_{0}I}{4\pi}\dfrac{dl\,\cos\theta}{r^{2}}` },
    { n: 2, op: 'algebra', title: t('代入几何关系', 'Substitute geometry'),
      latex: String.raw`B=\dfrac{\mu_{0}I}{4\pi r}\int_{-\pi/2}^{\pi/2}\cos\theta\,d\theta=\dfrac{\mu_{0}I}{2\pi r}` },
  ],
  links: {
    upstream: [{ id: 'uem-biot-savart-law' }],
    downstream: [{ id: 'uem-ampere-loop-law' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §29' }],
}

export default uemStraightWireB
