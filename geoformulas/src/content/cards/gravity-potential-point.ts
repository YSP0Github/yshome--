import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-potential-point */
const gravityPotentialPoint: FormulaCard = {
  id: 'gravity-potential-point',
  name: t('质点的引力位', 'Gravitational Potential of a Point Mass'),
  aliases: { zh: ['引力位', '重力位'], en: ['gravitational potential'] },
  node: 'S14.1',
  tags: {
    math: ['MATH.VECTOR'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('引力位 标量位 单位质量势能', 'gravitational potential scalar potential potential energy per unit mass'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`V(r)=-\frac{GM}{r}`,
    variants: [
      { name: t('单位质量的引力势能', 'potential energy per unit mass'), latex: String.raw`U=m\,V=-m\,\frac{GM}{r}` },
    ],
  },
  meaning: t(
    '引力位是单位质量在引力场中具有的势能，是一个标量场，比直接处理矢量场方便得多。质点 M 在距离 r 处产生的引力位为 −GM/r，负号把它和"无穷远为零"的约定联系起来。所有重力异常的正演与反演，本质上都是在算这个标量场及其导数。',
    'The gravitational potential is the potential energy per unit mass, a scalar field far easier to work with than the vector field. A point mass M produces V = −GM/r at distance r; the minus sign encodes the zero-at-infinity convention. Almost all forward and inverse gravity work reduces to computing this scalar and its derivatives.',
  ),
  symbols: [
    { sym: 'V', name: t('引力位（单位质量势能）', 'gravitational potential (potential energy per unit mass)'), unit: 'm²/s²' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³ kg⁻¹ s⁻²', typical: '6.674×10⁻¹¹' },
    { sym: 'M', name: t('场源质量', 'source mass'), unit: 'kg' },
    { sym: 'r', name: t('到场源的距离', 'distance to the source'), unit: 'm' },
  ],
  conditions: {
    applies: [t('质点或球对称质量外部', 'Outside a point mass or spherically symmetric body')],
    assumes: [t('无穷远处位取零', 'Potential set to zero at infinity')],
    breaks: [t('连续分布质量需对体积积分', 'Continuous mass requires a volume integral')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('引力加速度 g=GM/r²', 'Gravitational acceleration g=GM/r²'),
      latex: String.raw`g(r)=\frac{GM}{r^{2}}` },
    { n: 2, op: 'physics', title: t('位是把单位质量从无穷远移来的功', 'Potential is the work to bring unit mass from infinity'),
      latex: String.raw`V(r)=-\int_{\infty}^{r} g(r')\,dr'` },
    { n: 3, op: 'transform', title: t('代入并积分', 'Substitute and integrate'),
      latex: String.raw`V(r)=-\int_{\infty}^{r}\frac{GM}{r'^{2}}\,dr'=-\left[-\frac{GM}{r'}\right]_{\infty}^{r}` },
    { n: 4, op: 'result', title: t('得质点引力位', 'Obtain the point-mass potential'),
      latex: String.raw`V(r)=-\frac{GM}{r}` },
  ],
  links: {
    upstream: [{ id: 'gravity-newton-law' }],
    downstream: [{ id: 'gravity-field-from-potential', note: t('位的负梯度给出引力场', 'Negative gradient of V gives the field') }],
    seealso: [{ id: 'gravity-potential-second-derivatives' }],
  },
  refs: [{ text: 'Hofmann-Wellenhof & Moritz, Physical Geodesy, §2' }],
}

export default gravityPotentialPoint
