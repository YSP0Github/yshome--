import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-newton-law */
const gravityNewtonLaw: FormulaCard = {
  id: 'gravity-newton-law',
  name: t('Newton 万有引力定律', "Newton's Law of Universal Gravitation"),
  aliases: { zh: ['万有引力公式', 'Newton 引力'], en: ['universal gravitation', 'inverse-square gravity'] },
  node: 'S14.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('万有引力 引力常数 平方反比', 'universal gravitation gravitational constant inverse square'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{F}=-G\,\frac{m_1\,m_2}{r^{2}}\,\hat{\mathbf{r}},\qquad |\mathbf{F}|=G\,\frac{m_1 m_2}{r^{2}}`,
    variants: [
      { name: t('质点产生的引力加速度', 'gravitational acceleration of a point mass'), latex: String.raw`g(r)=\frac{GM}{r^{2}}` },
    ],
  },
  meaning: t(
    '任意两个质点之间相互吸引的力沿连线方向、大小与质量乘积成正比、与距离平方成反比。它是整个重力勘探的物理基石：地下密度差异造成的引力差异，正是被重力仪捕捉到的那个量。式中 g 为引力加速度（单位 m/s²），与地震学中的速度符号无关。',
    'Any two point masses attract along the line joining them, with a magnitude proportional to the product of masses and inversely proportional to the squared distance. It is the physical foundation of gravity exploration: the density contrast in the subsurface produces the tiny gravity difference the gravimeter records. Here g is gravitational acceleration (m/s²), not a seismic velocity.',
  ),
  symbols: [
    { sym: '\\mathbf{F}', name: t('引力矢量', 'gravitational force vector'), unit: 'N' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³ kg⁻¹ s⁻²', typical: '6.674×10⁻¹¹' },
    { sym: 'm_1,m_2', name: t('两质点质量', 'masses of the two bodies'), unit: 'kg' },
    { sym: 'r', name: t('两质点间距', 'separation of the masses'), unit: 'm' },
    { sym: '\\hat{\\mathbf{r}}', name: t('由 m1 指向 m2 的单位矢量', 'unit vector from m1 to m2'), unit: '—' },
  ],
  conditions: {
    applies: [t('质点或可视为质点的均匀球体', 'Point masses, or spherically symmetric bodies acting as point masses')],
    assumes: [t('经典力学、非相对论、非量子', 'Classical, non-relativistic, non-quantum regime')],
    breaks: [t('强引力场（黑洞附近）需广义相对论', 'Breaks in strong fields (near black holes), where GR is needed')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设定两质点与连线方向', 'Set up two masses and the line joining them'),
      latex: String.raw`\mathbf{r}=\mathbf{r}_2-\mathbf{r}_1,\quad \hat{\mathbf{r}}=\mathbf{r}/r`, note: t('以从 m1 指向 m2 的方向为径向正方向', 'Radial direction taken from m1 toward m2') },
    { n: 2, op: 'physics', title: t('平方反比律与质量乘积', 'Inverse-square law and product of masses'),
      latex: String.raw`|\mathbf{F}|\propto\frac{m_1 m_2}{r^{2}}` },
    { n: 3, op: 'substitute', title: t('引入比例常数 G', 'Introduce proportionality constant G'),
      latex: String.raw`|\mathbf{F}|=G\,\frac{m_1 m_2}{r^{2}}` },
    { n: 4, op: 'result', title: t('引力为吸引力，方向取负径向', 'Attractive force points opposite to outward radial'),
      latex: String.raw`\mathbf{F}=-G\,\frac{m_1 m_2}{r^{2}}\,\hat{\mathbf{r}}` },
  ],
  links: {
    downstream: [{ id: 'gravity-potential-point', note: t('由力定义引力位', 'The potential defined from this force') }],
    seealso: [{ id: 'gravity-field-from-potential' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §3.2' }],
}

export default gravityNewtonLaw
