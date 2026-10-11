import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** displacement-gradient-tensor */
const displacementGradientTensor: FormulaCard = {
  id: 'displacement-gradient-tensor',
  name: t('位移梯度张量', 'The Displacement Gradient Tensor'),
  aliases: { zh: ['位移梯度', '变形梯度', '张量分解'], en: ['displacement gradient', 'deformation gradient', 'tensor decomposition'] },
  node: 'S1.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.LINALG', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('位移梯度 对称 反对称 分解 应变 旋转 变形梯度', 'displacement gradient symmetric antisymmetric decomposition strain rotation'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`J_{ij}=\frac{\partial u_i}{\partial x_j}`,
    variants: [
      { name: t('增量形式：邻近两点的位移差', 'Incremental form: displacement difference between neighbours'), latex: String.raw`\mathrm{d}u_i=\frac{\partial u_i}{\partial x_j}\mathrm{d}x_j` },
      { name: t('矩阵形式（三维）', 'Matrix form in three dimensions'), latex: String.raw`\boldsymbol{J}=\nabla\boldsymbol{u}=\begin{bmatrix} \partial_1 u_1 & \partial_2 u_1 & \partial_3 u_1\\ \partial_1 u_2 & \partial_2 u_2 & \partial_3 u_2\\ \partial_1 u_3 & \partial_2 u_3 & \partial_3 u_3 \end{bmatrix}` },
      { name: t('核心分解：对称 + 反对称', 'The central decomposition: symmetric plus antisymmetric'), latex: String.raw`\frac{\partial u_i}{\partial x_j}=\underbrace{\varepsilon_{ij}}_{\text{symmetric}}+\underbrace{\omega_{ij}}_{\text{antisymmetric}}` },
      { name: t('有限变形时的变形梯度', 'The deformation gradient for finite deformation'), latex: String.raw`F_{ij}=\delta_{ij}+\frac{\partial u_i}{\partial x_j},\qquad E_{ij}=\frac{1}{2}\left(F_{ki}F_{kj}-\delta_{ij}\right)` },
    ],
  },
  meaning: t(
    '要描述变形，先要描述「邻近两点位移差多少」—— 这正是一个把位置增量变成位移增量的线性映射，也就是位移梯度。它一共只有九个偏导数，却藏着应变与旋转两件完全不同的事：它的对称部分是应变（会改变距离、会产生应力），反对称部分是刚体转动（什么也不改变）。一切弹性力学都从把这九个数字劈成两半开始。',
    'To describe deformation you must first describe how much the displacement changes between neighbouring points. That is a linear map turning a position increment into a displacement increment: the displacement gradient. Nine partial derivatives, but they hide two utterly different things. The symmetric part is strain, which changes distances and creates stress; the antisymmetric part is a rigid rotation that changes nothing. All of elasticity begins by splitting those nine numbers in half.',
  ),
  symbols: [
    { sym: 'J_{ij}', name: t('位移梯度张量分量（也写作 ∂_j u_i 或 u_{i,j}）', 'displacement gradient components (also ∂_j u_i or u_{i,j})'), unit: '', dimension: '无量纲' },
    { sym: 'u_i', name: t('位移矢量第 i 分量', 'i-th component of the displacement vector'), unit: 'm' },
    { sym: 'x_j', name: t('第 j 个空间坐标', 'j-th spatial coordinate'), unit: 'm' },
    { sym: '\\varepsilon_{ij}', name: t('应变张量（对称部分）', 'strain tensor (symmetric part)'), unit: '', dimension: '无量纲' },
    { sym: '\\omega_{ij}', name: t('旋转张量（反对称部分）', 'rotation tensor (antisymmetric part)'), unit: '', dimension: '无量纲' },
    { sym: 'F_{ij}', name: t('变形梯度（有限变形理论）', 'deformation gradient (finite-deformation theory)'), unit: '', dimension: '无量纲' },
    { sym: 'E_{ij}', name: t('Green–Lagrange 应变（有限变形）', 'Green–Lagrange strain (finite deformation)'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [
      t('任意连续位移场，任意尺度', 'Any continuous displacement field at any scale'),
      t('地震学：位移梯度 ≪ 1，线性化完全够用', 'In seismology displacement gradients are far below unity, so linearisation is ample'),
    ],
    assumes: [
      t('位移场可微（跨越断层面不成立）', 'The displacement field is differentiable, which fails across a fault'),
      t('「梯度」指的是相对于变形前坐标（Lagrange 观点）；小变形下与 Euler 观点等价', 'The gradient is taken with respect to the undeformed coordinates; for small deformation the Eulerian view is equivalent'),
    ],
    breaks: [
      t('跨断层的不连续位移场：梯度含 Dirac δ 型奇性', 'Discontinuous displacement across a fault: the gradient contains a Dirac-like singularity'),
      t('有限变形（|J| ≳ 0.1）时必须改用 Green–Lagrange 应变', 'For finite deformation, say |J| ≳ 0.1, one must switch to Green–Lagrange strain'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('相距 dx 的两个质点', 'Two particles a distance dx apart'),
      latex: String.raw`P:\ \boldsymbol{x},\qquad Q:\ \boldsymbol{x}+\mathrm{d}\boldsymbol{x}`,
      note: t('变形后它们各自移动到 x + u(x) 与 x + dx + u(x + dx)。', 'After deformation they sit at x + u(x) and at x + dx + u(x + dx).') },
    { n: 2, op: 'taylor', title: t('把 Q 的位移在 P 处作一阶展开', 'Expand the displacement of Q about P to first order'),
      latex: String.raw`u_i(\boldsymbol{x}+\mathrm{d}\boldsymbol{x})=u_i(\boldsymbol{x})+\frac{\partial u_i}{\partial x_j}\mathrm{d}x_j+O\!\left(|\mathrm{d}\boldsymbol{x}|^{2}\right)` },
    { n: 3, op: 'result', title: t('两点位移之差', 'The difference between the two displacements'),
      latex: String.raw`\mathrm{d}u_i=\frac{\partial u_i}{\partial x_j}\mathrm{d}x_j\;\equiv\;J_{ij}\,\mathrm{d}x_j`,
      note: t('J 是一个线性算子：给它一个方向，它返回一个位移增量。这就是张量的本来面目。', 'J is a linear operator: hand it a direction and it returns a displacement increment. That is what a tensor really is.') },
    { n: 4, op: 'identity', title: t('任何方阵都能唯一地劈成对称 + 反对称', 'Any square matrix splits uniquely into symmetric plus antisymmetric'),
      latex: String.raw`J_{ij}=\frac{1}{2}\left(J_{ij}+J_{ji}\right)+\frac{1}{2}\left(J_{ij}-J_{ji}\right)`,
      note: t('唯一性来自：若某矩阵既对称又反对称，则它只能是零矩阵。', 'Uniqueness follows because a matrix that is both symmetric and antisymmetric must be zero.') },
    { n: 5, op: 'identity', title: t('反对称部分等价于一个轴矢量（旋度的一半）', 'The antisymmetric part is equivalent to an axial vector'),
      latex: String.raw`\omega_{ij}=-\omega_{ji},\qquad \omega_k=\frac{1}{2}\epsilon_{kij}\frac{\partial u_i}{\partial x_j}\;\Longleftrightarrow\;\boldsymbol{\omega}=\frac{1}{2}\nabla\times\boldsymbol{u}`,
      note: t('反对称的 3×3 矩阵只有三个独立分量，正好可以塞进一个矢量里 —— 它就是局部刚体转动的转轴与转角。', 'An antisymmetric 3×3 matrix has only three independent components, exactly enough to pack into a vector: the axis and angle of the local rigid rotation.') },
    { n: 6, op: 'result', title: t('几何含义：对角 = 伸长，非对角 = 剪切 + 转动', 'Geometric reading: diagonal means stretch, off-diagonal means shear plus spin'),
      latex: String.raw`J_{11}=\frac{\partial u_1}{\partial x_1}\ (\text{伸长}),\quad J_{12}=\frac{\partial u_1}{\partial x_2}\ (\text{剪切}+\text{转动})` },
  ],
  viz: [
    {
      id: 'gradient-decomposition',
      level: 'V1',
      title: t('同一个位移梯度的两种画法：含转动 vs 纯剪', 'One displacement gradient, two pictures: with spin and without'),
      xlabel: t('x₁', 'x₁'),
      ylabel: t('x₂', 'x₂'),
      controls: [
        { id: 'gg', label: t('简单剪切量 γ', 'simple-shear amount γ'), min: -0.8, max: 0.8, step: 0.02, value: 0.5, unit: '' },
        { id: 'phi', label: t('附加的刚体转角 φ', 'additional rigid rotation φ'), min: -60, max: 60, step: 1, value: 0, unit: '°' },
      ],
      xRange: [-2, 2.5],
      yRange: [-2, 2.5],
      note: t('蓝框是「简单剪切 + 刚体转动」的完整变形，绿框只保留位移梯度的对称部分（纯剪）。两者对单位圆内接正方形造成的形状改变完全一样 —— 差别只有整体转了一个角度。这就是应变与旋转必须分开的全部理由：转动不产生应力。', 'The blue frame is the full deformation, simple shear plus a rigid rotation; the green frame keeps only the symmetric part of the gradient, a pure shear. Both change the shape of the square in exactly the same way, differing only by an overall rotation. That is the entire reason strain and rotation must be separated: rotation generates no stress.'),
      compute: (p) => {
        const g = p['gg']
        const ph = (p['phi'] * Math.PI) / 180
        const cp = Math.cos(ph), sp = Math.sin(ph)
        const corners: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
        const full = corners.map(([x, y]): [number, number] => {
          const sx = x + g * y
          const sy = y
          return [cp * sx - sp * sy, sp * sx + cp * sy]
        })
        const pure = corners.map(([x, y]): [number, number] => [
          x + (g / 2) * y,
          y + (g / 2) * x,
        ])
        return [
          { label: t('原始正方形', 'undeformed square'), color: '#B4B2A9', dash: true, points: corners.map((q): [number, number] => [q[0], q[1]]) },
          { label: t('含刚体转动的完整变形', 'full deformation with rigid spin'), color: '#185FA5', points: full },
          { label: t('仅对称部分（纯剪）', 'symmetric part only (pure shear)'), color: '#0F6E56', points: pure },
        ]
      },
    },
  ],
  links: {
    downstream: [
      { id: 'infinitesimal-strain-tensor', note: t('取对称部分', 'take the symmetric part') },
      { id: 'rotation-tensor', note: t('取反对称部分', 'take the antisymmetric part') },
    ],
    seealso: [{ id: 'strain-tensor' }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Malvern, Introduction to the Mechanics of a Continuous Medium, §4.4' },
  ],

}

export default displacementGradientTensor
