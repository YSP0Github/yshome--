import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-spherical-shell */
const gravitySphericalShell: FormulaCard = {
  id: 'gravity-spherical-shell',
  name: t('均匀球壳的引力（壳层定理）', 'Gravity of a Uniform Spherical Shell (Shell Theorem)'),
  aliases: { zh: ['壳层定理', '球壳引力'], en: ['shell theorem', 'spherical shell gravity'] },
  node: 'S14.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.TRANSFORM'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('球壳 壳层定理 内部引力为零', 'spherical shell shell theorem zero interior gravity'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`g(r)=0\ \ (r<R_{\text{壳}}),\qquad g(r)=\frac{GM}{r^{2}}\ \ (r>R_{\text{壳}})`,
  },
  meaning: t(
    '均匀薄球壳对其内部质点的引力恰好为零，对外部质点的引力则等于把全部质量集中在球心的质点。这个壳层定理极大简化了球对称地球的引力计算：地球外部的引力只由内部总质量决定，与质量如何径向分布无关。',
    'A uniform thin spherical shell exerts zero net force on a mass inside it, while outside it behaves as if all its mass were concentrated at the centre. This shell theorem enormously simplifies spherical-earth gravity: outside the Earth the gravity depends only on the total mass, regardless of how that mass is distributed radially.',
  ),
  symbols: [
    { sym: 'g(r)', name: t('距球心 r 处的引力加速度', 'gravitational acceleration at radius r'), unit: 'm/s²' },
    { sym: 'M', name: t('球壳总质量', 'total mass of the shell'), unit: 'kg' },
    { sym: 'R', name: t('球壳半径', 'radius of the shell'), unit: 'm' },
    { sym: 'r', name: t('场点到球心距离', 'distance of field point from centre'), unit: 'm' },
  ],
  conditions: {
    applies: [t('球对称、密度只随半径变化', 'Spherical symmetry, density depending only on radius')],
    assumes: [t('薄球壳近似', 'Thin shell approximation')],
    breaks: [t('非球形或横向密度变化不成立', 'Fails for non-spherical shape or lateral density variation')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('取环带质量元 dm', 'Take an annular mass element dm'),
      latex: String.raw`dm=\frac{M}{2}\sin\theta\,d\theta` },
    { n: 2, op: 'physics', title: t('环带在轴线上的引力沿轴叠加', 'Ring contributions add along the axis'),
      latex: String.raw`dg=\frac{G\,dm}{s^{2}}\,\cos\alpha` },
    { n: 3, op: 'transform', title: t('对 θ 积分，内部项相消', 'Integrate over θ; interior contributions cancel'),
      latex: String.raw`g(r<R)=0,\qquad g(r>R)=\int dg=\frac{GM}{r^{2}}` },
    { n: 4, op: 'result', title: t('外如质点、内为零', 'Exterior like a point, interior zero'),
      latex: String.raw`g(r)=\begin{cases}0,& r<R\\ GM/r^{2},& r>R\end{cases}` },
  ],
  links: {
    upstream: [{ id: 'gravity-newton-law' }],
    downstream: [{ id: 'gravity-solid-sphere', note: t('多层球壳叠加得实心球', 'Stacking shells gives the solid sphere') }],
  },
  refs: [{ text: 'Blakely, Potential Theory, §3.3' }],
}

export default gravitySphericalShell
