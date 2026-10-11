import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rotation-tensor */
const rotationTensor: FormulaCard = {
  id: 'rotation-tensor',
  name: t('转动（旋转）张量', 'The Rotation Tensor'),
  aliases: { zh: ['旋转张量', '刚体转动', '反对称部分'], en: ['rotation tensor', 'spin tensor', 'antisymmetric part', 'rigid rotation'] },
  node: 'S1.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.LINALG', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('旋转张量 反对称 刚体转动 旋度 轴矢量 转动不改变距离', 'rotation tensor antisymmetric rigid rotation curl axial vector'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\omega_{ij}=\frac{1}{2}\left(\frac{\partial u_i}{\partial x_j}-\frac{\partial u_j}{\partial x_i}\right)`,
    variants: [
      { name: t('性质：反对称，只有 3 个独立分量', 'Property: antisymmetric, only three independent entries'), latex: String.raw`\omega_{ij}=-\omega_{ji},\qquad \omega_{11}=\omega_{22}=\omega_{33}=0` },
      { name: t('矩阵形式', 'Matrix form'), latex: String.raw`\boldsymbol{\omega}=\begin{bmatrix} 0 & \omega_{12} & \omega_{13}\\ -\omega_{12} & 0 & \omega_{23}\\ -\omega_{13} & -\omega_{23} & 0 \end{bmatrix}` },
      { name: t('对偶的旋转矢量（旋度的一半）', 'The dual rotation vector: half the curl'), latex: String.raw`\boldsymbol{\omega}=\frac{1}{2}\nabla\times\boldsymbol{u},\qquad \omega_k=\frac{1}{2}\epsilon_{kij}\,\partial_j u_i` },
      { name: t('与位移梯度的关系', 'Relation to the displacement gradient'), latex: String.raw`\frac{\partial u_i}{\partial x_j}=\varepsilon_{ij}+\omega_{ij}` },
      { name: t('简单剪切 = 纯剪 + 刚体转动', 'Simple shear = pure shear plus a rigid rotation'), latex: String.raw`\begin{bmatrix} 0 & \gamma\\ 0 & 0 \end{bmatrix}=\begin{bmatrix} 0 & \gamma/2\\ \gamma/2 & 0 \end{bmatrix}+\begin{bmatrix} 0 & \gamma/2\\ -\gamma/2 & 0 \end{bmatrix}` },
    ],
  },
  meaning: t(
    '转动张量是位移梯度里「什么也没发生」的那一部分：它记录的是物质微元作为一个刚体转了多少度，既没有拉长任何一条线，也没有改变任何一个角。它不进入 Hooke 定律，不产生应力，不会影响波速 —— 因此地震学的弹性理论把它干脆丢掉。但它在旋转地震学里重新变得重要，因为摆式与光纤陀螺仪测到的正是它。',
    'The rotation tensor is the part of the displacement gradient where nothing happens. It records how far a material element spun as a rigid body, stretching no line and changing no angle. It never enters Hooke’s law, creates no stress and affects no wave speed, so the elastic theory of seismology simply discards it. It becomes important again in rotational seismology, however, because ring-laser and fibre-optic gyroscopes measure precisely this quantity.',
  ),
  symbols: [
    { sym: '\\omega_{ij}', name: t('旋转张量分量（此处不是角频率）', 'rotation tensor components (here not the angular frequency)'), unit: '', dimension: '无量纲', typical: '10⁻⁶ – 10⁻³' },
    { sym: '\\boldsymbol{\\omega}', name: t('旋转矢量：转轴沿 ω，模长即转角（小角度）', 'rotation vector: axis along ω, magnitude equal to the rotation angle for small angles'), unit: 'rad' },
    { sym: '\\epsilon_{kij}', name: t('Levi-Civita 置换符号（此处不是应变）', 'Levi-Civita permutation symbol (not strain here)'), unit: '', dimension: '无量纲' },
    { sym: '\\boldsymbol{\\theta}', name: t('有限刚体转动的转角矢量', 'rotation vector of a finite rigid rotation'), unit: 'rad' },
    { sym: '\\gamma', name: t('简单剪切量', 'amount of simple shear'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [
      t('小变形：转角矢量与旋转张量等价', 'Small deformation, where the rotation vector and rotation tensor are equivalent'),
      t('需要判断观测到的运动中有多少是「真应变」而非整体转动时', 'Whenever one must judge how much of an observed motion is genuine strain rather than bulk rotation'),
    ],
    assumes: [
      t('位移场连续可微', 'The displacement field is continuously differentiable'),
      t('转角 ≪ 1 rad，此时转角矢量可加、与顺序无关', 'Rotation angles far below 1 rad, so rotation vectors add and their order is irrelevant'),
    ],
    breaks: [
      t('大角度转动：必须改用有限转动矩阵，转角矢量不可直接相加', 'Large rotations require finite rotation matrices; rotation vectors no longer add'),
      t('位移场在断层面上间断，旋度含奇异项', 'A displacement field discontinuous across a fault gives a curl with a singular term'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从位移梯度出发', 'Start from the displacement gradient'),
      latex: String.raw`\frac{\partial u_i}{\partial x_j}=\frac{1}{2}\left(\partial_j u_i+\partial_i u_j\right)+\frac{1}{2}\left(\partial_j u_i-\partial_i u_j\right)` },
    { n: 2, op: 'identity', title: t('第二项天然反对称', 'The second term is antisymmetric by construction'),
      latex: String.raw`\omega_{ij}=-\omega_{ji}\;\Longrightarrow\; 3\ \text{independent entries:}\ \omega_{12},\ \omega_{23},\ \omega_{31}` },
    { n: 3, op: 'identity', title: t('反对称矩阵 ↔ 轴矢量（Hodge 对偶）', 'Antisymmetric matrix ↔ axial vector, a Hodge dual'),
      latex: String.raw`\omega_{k}=\frac{1}{2}\epsilon_{kij}\,\frac{\partial u_i}{\partial x_j}\quad\Longleftrightarrow\quad \boldsymbol{\omega}=\frac{1}{2}\nabla\times\boldsymbol{u}`,
      note: t('三维里这个对应是唯一的：三个独立数字，既可以放在反对称矩阵里，也可以排成一个矢量。', 'In three dimensions the correspondence is unique: three independent numbers that can live either in an antisymmetric matrix or in a vector.') },
    { n: 4, op: 'physics', title: t('检验：一个纯刚体转动的位移场', 'Check it on a purely rigid rotation'),
      latex: String.raw`\boldsymbol{u}=\boldsymbol{\theta}\times\boldsymbol{x}\;\Longrightarrow\; \nabla\times\boldsymbol{u}=2\boldsymbol{\theta}\;\Longrightarrow\; \boldsymbol{\omega}=\boldsymbol{\theta}`,
      note: t('转角正好等于旋度的一半，所以旋转矢量的模长就是转角（弧度）。', 'The rotation angle is exactly half the curl, so the magnitude of the rotation vector is the angle in radians.') },
    { n: 5, op: 'identity', title: t('同一个刚体转动在应变张量里完全消失', 'The same rigid rotation vanishes entirely from the strain tensor'),
      latex: String.raw`\varepsilon_{ij}=\frac{1}{2}\left(\epsilon_{ikj}\theta_k+\epsilon_{jki}\theta_k\right)=0`,
      note: t('这就是为什么 ω 不产生应力：它根本没有在 ε 里留下痕迹。', 'This is why ω generates no stress: it leaves no trace in ε at all.') },
    { n: 6, op: 'result', title: t('简单剪切的分解：一半应变，一半转动', 'Decomposing simple shear: half strain, half spin'),
      latex: String.raw`\partial_j u_i=\begin{bmatrix} 0 & \gamma\\ 0 & 0\end{bmatrix}\;\Rightarrow\; \varepsilon_{12}=\frac{\gamma}{2},\quad \omega_{12}=\frac{\gamma}{2}`,
      note: t('工程上说的「剪应变 γ」有一半其实是刚体转动；做本构关系时必须用 ε₁₂ = γ/2，否则剪应力会算成两倍。', 'Half of the engineering shear strain γ is really a rigid rotation. Constitutive laws must use ε₁₂ = γ/2, otherwise the shear stress comes out twice too large.') },
  ],
  links: {
    upstream: [{ id: 'displacement-gradient-tensor', note: t('旋转 = 位移梯度的反对称部分', 'rotation is the antisymmetric part of the gradient') }],
    seealso: [
      { id: 'infinitesimal-strain-tensor', note: t('两个半边之和 = 位移梯度', 'the two halves add up to the displacement gradient') },
      { id: 'engineering-shear-strain', note: t('γ 有一半来自这一项', 'half of γ comes from this term') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Malvern, Introduction to the Mechanics of a Continuous Medium, §4.5' },
  ],

}

export default rotationTensor
