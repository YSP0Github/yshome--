import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** infinitesimal-strain-tensor */
const infinitesimalStrainTensor: FormulaCard = {
  id: 'infinitesimal-strain-tensor',
  name: t('小应变张量', 'The Infinitesimal Strain Tensor'),
  aliases: { zh: ['无穷小应变', '线性应变张量', '对称化梯度'], en: ['infinitesimal strain', 'small strain', 'linearised strain', 'symmetrised gradient'] },
  node: 'S1.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.APPROX', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR', 'Q.MAT'],
    keywords: t('小应变 对称梯度 伸长 直角改变 六个分量 线性化', 'infinitesimal strain symmetric gradient extension angle change six components linearisation'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\varepsilon_{ij}=\frac{1}{2}\left(\frac{\partial u_i}{\partial x_j}+\frac{\partial u_j}{\partial x_i}\right)`,
    variants: [
      { name: t('分量矩阵', 'Component matrix'), latex: String.raw`\boldsymbol{\varepsilon}=\begin{bmatrix} \partial_1 u_1 & \frac{1}{2}\left(\partial_2 u_1+\partial_1 u_2\right) & \frac{1}{2}\left(\partial_3 u_1+\partial_1 u_3\right)\\ \cdot & \partial_2 u_2 & \frac{1}{2}\left(\partial_3 u_2+\partial_2 u_3\right)\\ \cdot & \cdot & \partial_3 u_3 \end{bmatrix}` },
      { name: t('对角元 = 相对伸长', 'Diagonal entries are relative extensions'), latex: String.raw`\varepsilon_{11}=\frac{\partial u_1}{\partial x_1}=\frac{\mathrm{d}s'-\mathrm{d}s}{\mathrm{d}s}` },
      { name: t('非对角元 = 直角减小量的一半', 'Off-diagonal entries are half the decrease of a right angle'), latex: String.raw`2\varepsilon_{12}=\frac{\pi}{2}-\varphi,\qquad \varepsilon_{12}=\frac{1}{2}\gamma_{12}` },
      { name: t('（与转动张量并列）完整分解', 'The complete decomposition, rotation included'), latex: String.raw`\frac{\partial u_i}{\partial x_j}=\varepsilon_{ij}+\omega_{ij}` },
    ],
  },
  meaning: t(
    '应变张量的每个分量都有可以直接拿尺子量的含义：对角元是沿该方向单位长度伸长了多少，非对角元是原本互相垂直的两条线之间直角改变了多少（还要除以 2）。这里的「小」不是客套话 —— 只有在位移梯度远小于 1 时，这些几何量才与位移的导数成线性关系，才谈得上用它做线性波动理论。',
    'Every component has a meaning you could measure with a ruler. A diagonal entry is the extension per unit length along that direction; an off-diagonal entry is half the change of the right angle between two originally perpendicular lines. The word infinitesimal is not a courtesy: only when the displacement gradient is far below unity are these geometric quantities linear in the displacement derivatives, which is what makes a linear wave theory possible at all.',
  ),
  symbols: [
    { sym: '\\varepsilon_{ij}', name: t('小应变张量分量', 'infinitesimal strain components'), unit: '', dimension: '无量纲', typical: '10⁻⁶ – 10⁻³（地震波）' },
    { sym: 'u_i', name: t('位移分量', 'displacement component'), unit: 'm' },
    { sym: '\\mathrm{d}s', name: t('变形前的线段长度', 'line-element length before deformation'), unit: 'm' },
    { sym: '\\varphi', name: t('两条物质线变形后的夹角', 'angle between two material lines after deformation'), unit: 'rad' },
    { sym: '\\gamma_{12}', name: t('工程剪应变', 'engineering shear strain'), unit: '', dimension: '无量纲' },
    { sym: '\\omega_{ij}', name: t('旋转张量（反对称部分）', 'rotation tensor (antisymmetric part)'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [
      t('位移梯度 ≪ 1（地震波通常 ≲ 10⁻⁴，绰绰有余）', 'Displacement gradients far below 1, typically less than 10⁻⁴ for seismic waves'),
      t('需要把变形与刚体转动分开的场合', 'Wherever deformation must be separated from rigid rotation'),
    ],
    assumes: [
      t('忽略位移梯度乘积这类二阶项', 'Products of displacement gradients are neglected'),
      t('以变形前的坐标为参考（小变形下与变形后坐标无区别）', 'The reference configuration is used; for small deformation the distinction is immaterial'),
    ],
    breaks: [
      t('有限变形、塑性大变形：须用 Green–Lagrange 应变', 'Finite deformation and plastic flow require the Green–Lagrange strain'),
      t('旋转地震学中强转动记录需保留有限转动项', 'Rotational seismology with strong rotations must retain the finite-rotation terms'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('沿 x₁ 方向取一小段物质线', 'Take a small material line along x₁'),
      latex: String.raw`\mathrm{d}\boldsymbol{x}=\left(\mathrm{d}x_1,0,0\right)` },
    { n: 2, op: 'taylor', title: t('变形后的长度', 'Its length after deformation'),
      latex: String.raw`\mathrm{d}s'=\left|\mathrm{d}\boldsymbol{x}+\mathrm{d}\boldsymbol{u}\right|=\sqrt{\left(1+\partial_1 u_1\right)^{2}+\left(\partial_1 u_2\right)^{2}+\left(\partial_1 u_3\right)^{2}}\;\mathrm{d}x_1` },
    { n: 3, op: 'algebra', title: t('略去二阶项，得到相对伸长', 'Drop second-order terms to get the relative extension'),
      latex: String.raw`\frac{\mathrm{d}s'-\mathrm{d}s}{\mathrm{d}s}\approx \partial_1 u_1=\varepsilon_{11}` },
    { n: 4, op: 'geometry', title: t('再看两条互相垂直的线', 'Now take two mutually perpendicular lines'),
      latex: String.raw`\mathrm{d}\boldsymbol{x}^{(1)}=\left(\mathrm{d}x_1,0\right),\qquad \mathrm{d}\boldsymbol{x}^{(2)}=\left(0,\mathrm{d}x_2\right)` },
    { n: 5, op: 'algebra', title: t('变形后夹角的余弦展开到一阶', 'Expand the cosine of the deformed angle to first order'),
      latex: String.raw`\cos\varphi=\frac{\mathrm{d}\boldsymbol{x}'^{(1)}\cdot\mathrm{d}\boldsymbol{x}'^{(2)}}{\left|\mathrm{d}\boldsymbol{x}'^{(1)}\right|\left|\mathrm{d}\boldsymbol{x}'^{(2)}\right|}\approx \partial_2 u_1+\partial_1 u_2`,
      note: t('因为 cos(π/2 − Δ) ≈ Δ，所以直角减小量 Δ = ∂₂u₁ + ∂₁u₂ = 2ε₁₂。那个 ½ 就是这么来的。', 'Since cos(π/2 − Δ) ≈ Δ, the decrease of the right angle is Δ = ∂₂u₁ + ∂₁u₂ = 2ε₁₂. That is where the factor ½ comes from.') },
    { n: 6, op: 'result', title: t('推广到任意分量，得到对称化定义', 'Generalise to arbitrary components'),
      latex: String.raw`\varepsilon_{ij}=\frac{1}{2}\left(\partial_j u_i+\partial_i u_j\right),\qquad \varepsilon_{ij}=\varepsilon_{ji}\ \Rightarrow\ 6\ \text{independent components}` },
  ],
  links: {
    upstream: [{ id: 'displacement-gradient-tensor', note: t('应变 = 位移梯度的对称部分', 'strain is the symmetric part of the displacement gradient') }],
    downstream: [
      { id: 'volumetric-strain' },
      { id: 'engineering-shear-strain' },
      { id: 'principal-strain-invariants' },
      { id: 'hookes-law-isotropic', note: t('应变是应力的唯一来源', 'strain is the sole driver of stress') },
    ],
    seealso: [
      { id: 'strain-tensor', note: t('同一公式的另一种推导（距离平方的变化）', 'the same formula derived from the change of squared distance') },
      { id: 'rotation-tensor' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.1' },
  ],

}

export default infinitesimalStrainTensor
