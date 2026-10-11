import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** strain-tensor */
const strainTensor: FormulaCard = {
  id: 'strain-tensor',
  name: t('无穷小应变张量', 'The Infinitesimal Strain Tensor'),
  aliases: { zh: ['应变张量', '形变张量'], en: ['strain tensor', 'deformation tensor'] },
  node: 'S1.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.APPROX'],
    method: [],
    quantity: ['Q.TENSOR', 'Q.MAT'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\varepsilon_{ij}=\frac{1}{2}\left(\frac{\partial u_i}{\partial x_j}+\frac{\partial u_j}{\partial x_i}\right)`,
    variants: [
      { name: t('矩阵形式', 'Matrix form'), latex: String.raw`\boldsymbol{\varepsilon}=\frac{1}{2}\left(\nabla\boldsymbol{u}+\left(\nabla\boldsymbol{u}\right)^{T}\right)` },
      { name: t('体应变（对角之和）', 'Volumetric strain (trace)'), latex: String.raw`\theta=\varepsilon_{kk}=\nabla\cdot\boldsymbol{u}` },
    ],
  },
  meaning: t(
    '懂得为什么减去对称部分之外的旋转很重要：纯转动不改变任何两点之间的距离，所以不该产生应力，也不该算作应变。这就是那个 1/2 对称化的全部理由。',
    'The symmetrisation is the whole point: a rigid rotation does not change the distance between any two points, so it cannot create stress and must not count as strain. That is the entire reason for the factor 1/2.',
  ),
  symbols: [
    { sym: '\\varepsilon_{ij}', name: t('应变张量分量', 'strain tensor components'), unit: '', dimension: '无量纲' },
    { sym: 'u_i', name: t('位移矢量第 i 个分量', 'i-th component of displacement'), unit: 'm' },
    { sym: 'x_j', name: t('第 j 个空间坐标', 'j-th spatial coordinate'), unit: 'm' },
    { sym: '\\theta', name: t('体应变（体积相对变化）', 'volumetric strain (relative volume change)'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [t('地震学关心的情形：位移梯度 ≪ 1', 'Displacement gradients ≪ 1 — always true for seismic waves')],
    assumes: [t('忽略二阶项 ∂u_k/∂x_i · ∂u_k/∂x_j', 'Second-order products are neglected')],
    breaks: [t('有限变形（如工程塑性，不属于地震学范围）', 'Finite deformation, e.g. plasticity, outside seismology')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('考察两邻近质点距离的变化', 'Consider the distance between two neighbouring particles'),
      latex: String.raw`\dd s^{2}=\left(\dd x_i+\frac{\partial u_i}{\partial x_k}\dd x_k\right)\left(\dd x_i+\frac{\partial u_i}{\partial x_l}\dd x_l\right)`,
      note: t('变形前相距 dx，变形后位移场把两端拉到了不同位置。', 'Before deformation neighbours are dx apart; afterwards the displacement field moves them differently.') },
    { n: 2, op: 'algebra', title: t('展开并略去二阶项', 'Expand and drop second-order terms'),
      latex: String.raw`\dd s'^{2}-\dd s^{2}=2\,\frac{\partial u_i}{\partial x_j}\dd x_i \dd x_j` },
    { n: 3, op: 'identity', title: t('把梯度分解为对称 + 反对称', 'Split the gradient into symmetric + antisymmetric'),
      latex: String.raw`\frac{\partial u_i}{\partial x_j}=\underbrace{\frac{1}{2}\!\left(\frac{\partial u_i}{\partial x_j}+\frac{\partial u_j}{\partial x_i}\right)}_{\varepsilon_{ij}}+\underbrace{\frac{1}{2}\!\left(\frac{\partial u_i}{\partial x_j}-\frac{\partial u_j}{\partial x_i}\right)}_{\omega_{ij}}` },
    { n: 4, op: 'identity', title: t('反对称部分贡献为零', 'The antisymmetric part contributes nothing'),
      latex: String.raw`\omega_{ij}\,\dd x_i \dd x_j = 0`,
      note: t('因为 ω_ij = −ω_ji 而 dx_i dx_j 是对称的，两者缩并必为零。这证明旋转不改变长度。', 'Since ω_ij = −ω_ji while dx_i dx_j is symmetric, their contraction vanishes. Rotation preserves length.') },
    { n: 5, op: 'result', title: t('留下对称部分', 'Only the symmetric part remains'),
      latex: String.raw`\dd s'^{2}-\dd s^{2}=2\,\varepsilon_{ij}\,\dd x_i \dd x_j` },
    { n: 6, op: 'identity', title: t('对角线之和即体应变', 'The trace is the volumetric strain'),
      latex: String.raw`\frac{\dd V'-\dd V}{\dd V}=\varepsilon_{11}+\varepsilon_{22}+\varepsilon_{33}=\nabla\cdot\boldsymbol{u}` },
  ],
  links: {
    downstream: [
      { id: 'hookes-law-isotropic', note: t('有应变才有应力', 'Strain is what drives stress') },
      { id: 'navier-equation' },
    ],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' }],

}

export default strainTensor
