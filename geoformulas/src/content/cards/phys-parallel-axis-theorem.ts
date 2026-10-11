import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-parallel-axis-theorem */
const physParallelAxisTheorem: FormulaCard = {
  id: 'phys-parallel-axis-theorem',
  name: t('平行轴定理', 'Parallel-Axis Theorem'),
  aliases: { zh: ['平行移轴公式'], en: ['parallel-axis theorem', 'Huygens–Steiner'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.GEOM'],
    keywords: t('平行轴定理 移轴 质心 转动惯量平移', 'parallel axis theorem shift axis centre of mass'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`I=I_{\mathrm{cm}}+M d^{2}`,
  },
  meaning: t(
    '对任意一根与过质心轴平行的轴，转动惯量等于质心轴上的转动惯量再加上 Md²。这样只要记住最常见的质心值，就能快速算出「挪个位置」后的转动惯量。例如细杆绕中心是 ML²/12，挪到端点 d=L/2，就变成 ML²/12+M(L/2)²=ML²/3。',
    'For any axis parallel to one through the centre of mass, the moment of inertia equals the centroidal value plus Md². Remembering the common centroidal values lets you quickly shift an axis. A rod is ML²/12 about its centre; shifting to the end by d = L/2 gives ML²/12 + M(L/2)² = ML²/3.',
  ),
  symbols: [
    { sym: 'I', name: t('对新轴的转动惯量', 'moment of inertia about the new axis'), unit: 'kg·m²' },
    { sym: 'I_{cm}', name: t('过质心轴的转动惯量', 'moment of inertia about the centroidal axis'), unit: 'kg·m²' },
    { sym: 'M', name: t('总质量', 'total mass'), unit: 'kg' },
    { sym: 'd', name: t('两轴间距', 'distance between the two parallel axes'), unit: 'm' },
  ],
  conditions: {
    applies: [t('两轴互相平行', 'The two axes must be parallel')],
    assumes: [t('I_cm 已知', 'The centroidal value is known')],
    breaks: [t('两轴不平行时不成立', 'Fails when axes are not parallel')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('设新轴相对质心轴平移 d', 'Shift the axis by d from the CM axis'), latex: String.raw`r_i'=r_i+d` },
    { n: 2, op: 'algebra', title: t('展开距离平方并积分', 'Expand the squared distance and integrate'), latex: String.raw`I=\int (r_i+d)^{2}\mathrm{d}m=I_{\mathrm{cm}}+d^{2}\int\mathrm{d}m+2d\int r_i\,\mathrm{d}m` },
    { n: 3, op: 'identity', title: t('质心处 ∫r_i dm=0，∫dm=M', 'About CM, ∫r_i dm=0 and ∫dm=M'), latex: String.raw`I=I_{\mathrm{cm}}+M d^{2}` },
  ],
  links: { upstream: [{ id: 'phys-moment-of-inertia' }] },
}

export default physParallelAxisTheorem
