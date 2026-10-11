import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-field-from-potential */
const gravityFieldFromPotential: FormulaCard = {
  id: 'gravity-field-from-potential',
  name: t('引力场与引力位的梯度关系', 'Gravity Field as the Negative Gradient of Potential'),
  aliases: { zh: ['g=−∇V', '重力位梯度'], en: ['gradient of potential'] },
  node: 'S14.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('梯度 引力场 位 负梯度', 'gradient gravity field potential negative gradient'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{g}=-\nabla V=-\frac{\partial V}{\partial x}\,\hat{\mathbf{x}}-\frac{\partial V}{\partial y}\,\hat{\mathbf{y}}-\frac{\partial V}{\partial z}\,\hat{\mathbf{z}}`,
    variants: [
      { name: t('球对称情形（径向）', 'spherically symmetric (radial) case'), latex: String.raw`g_r=-\frac{dV}{dr}=\frac{GM}{r^{2}}` },
    ],
  },
  meaning: t(
    '引力场矢量等于引力位标量场的负梯度：场指向位降低最快的方向。把重力问题写成标量位的梯度，就可以用一整套标量数学（积分、球谐、位场论）来处理，而不必直接算矢量叠加。在地面测量中，重力仪测的主要是这个场的垂直分量 g_z。',
    'The gravity vector equals the negative gradient of the scalar potential: the field points in the direction of fastest decrease of V. Writing gravity as the gradient of a scalar lets us borrow the full machinery of scalar field theory (integration, spherical harmonics, potential theory) instead of summing vectors directly. A gravimeter essentially measures the vertical component g_z of this field.',
  ),
  symbols: [
    { sym: '\\mathbf{g}', name: t('引力加速度矢量', 'gravitational acceleration vector'), unit: 'm/s²' },
    { sym: 'V', name: t('引力位', 'gravitational potential'), unit: 'm²/s²' },
    { sym: '\\nabla', name: t('梯度算子', 'gradient operator'), unit: 'm⁻¹' },
    { sym: 'g_z', name: t('垂直重力分量（向上为正）', 'vertical gravity component (up positive)'), unit: 'm/s²' },
  ],
  conditions: {
    applies: [t('任意质量分布的引力位场', 'The gravitational potential field of any mass distribution')],
    assumes: [t('场可由标量位导出（无旋场）', 'The field is irrotational and derivable from a scalar')],
    breaks: [t('含离心力的重力位需另加旋转位', 'Add the rotational potential for the effective gravity')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义标量引力位 V', 'Define the scalar gravitational potential V'),
      latex: String.raw`V(r)=-\frac{GM}{r}` },
    { n: 2, op: 'geometry', title: t('球坐标梯度只保留径向项', 'Spherical-coordinate gradient keeps only radial term'),
      latex: String.raw`\nabla V=\frac{dV}{dr}\,\hat{\mathbf{r}}` },
    { n: 3, op: 'substitute', title: t('求导', 'Differentiate'),
      latex: String.raw`\frac{dV}{dr}=\frac{d}{dr}\left(-\frac{GM}{r}\right)=\frac{GM}{r^{2}}` },
    { n: 4, op: 'result', title: t('场为位的负梯度', 'Field is negative gradient of V'),
      latex: String.raw`\mathbf{g}=-\nabla V=\frac{GM}{r^{2}}\,\hat{\mathbf{r}}\ \text{（指向场源）}` },
  ],
  links: {
    upstream: [{ id: 'gravity-potential-point' }],
    downstream: [{ id: 'gravity-potential-second-derivatives', note: t('再求一次导得位的二阶导数', 'One more derivative gives second derivatives') }],
    seealso: [{ id: 'gradient' }],
  },
  refs: [{ text: 'Blakely, Potential Theory in Gravity and Magnetic Applications, §3' }],
}

export default gravityFieldFromPotential
