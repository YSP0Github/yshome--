import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** navier-equation */
const navierEquation: FormulaCard = {
  id: 'navier-equation',
  name: t('Navier 运动方程', 'The Navier Equation of Motion'),
  aliases: { zh: ['纳维尔方程', '弹性波动方程'], en: ['Navier equation', 'elastodynamic equation'] },
  node: 'S1.4',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.INV'],
    quantity: ['Q.TENSOR', 'Q.VEL'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\rho\,\frac{\partial^{2}\boldsymbol{u}}{\partial t^{2}}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\,\nabla\times\left(\nabla\times\boldsymbol{u}\right)+\boldsymbol{f}`,
    variants: [
      { name: t('用分量指标记法', 'Index notation'), latex: String.raw`\rho\,\ddot{u}_i=\partial_j\sigma_{ij}+f_i` },
      { name: t('无体力、均匀介质', 'Homogeneous, no body force'), latex: String.raw`\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\,\nabla\times\left(\nabla\times\boldsymbol{u}\right)` },
    ],
  },
  meaning: t(
    '牛顿第二定律在连续介质里的样子：「质量×加速度 = 应力梯度 + 体力」。它是所有地震波数值模拟（包括你熟悉的 SPECFEM3D）最后要离散的那个方程。',
    "Newton's second law written for a continuum: mass × acceleration = stress gradient + body force. This is the equation every seismic wave simulator — SPECFEM included — ultimately discretises.",
  ),
  symbols: [
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '2000 – 3300' },
    { sym: '\\boldsymbol{u}', name: t('位移矢量', 'displacement vector'), unit: 'm' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
    { sym: '\\boldsymbol{f}', name: t('体力（单位体积的外力）', 'body force per unit volume'), unit: 'N/m³' },
  ],
  conditions: {
    applies: [t('均匀、各向同性、线弹性介质', 'Homogeneous, isotropic, linear elastic media')],
    assumes: [t('连续介质假设成立（远大于颗粒尺度）', 'Continuum assumption holds (scales far above grain size)')],
    breaks: [
      t('强速度梯度时需保留 ∇λ、∇μ 项', 'Strong velocity gradients require keeping ∇λ, ∇μ terms'),
      t('各向异性介质需使用完整的 c_ijkl', 'Anisotropic media need the full c_ijkl'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('牛顿第二定律作用于微元体', "Newton's second law on a volume element"),
      latex: String.raw`\iiint_V \rho\,\ddot{u}_i\,\dd V=\iint_S \sigma_{ij}n_j\,\dd S+\iiint_V f_i\,\dd V`,
      note: t('左边是质量乘加速度，右边第一项是邻居通过表面施加的牵引力。', 'Left is mass times acceleration; the first term on the right is the traction exerted by neighbours through the surface.') },
    { n: 2, op: 'identity', title: t('用 Gauss 定理把面积分化为体积分', 'Convert the surface integral with Gauss theorem'),
      latex: String.raw`\iint_S \sigma_{ij}n_j\,\dd S=\iiint_V \partial_j\sigma_{ij}\,\dd V` },
    { n: 3, op: 'algebra', title: t('由于微元 V 任意', 'Since the volume element is arbitrary'),
      latex: String.raw`\rho\,\ddot{u}_i=\partial_j\sigma_{ij}+f_i` },
    { n: 4, op: 'substitute', title: t('代入各向同性 Hooke 定律', "Substitute isotropic Hooke's law"),
      latex: String.raw`\partial_j\sigma_{ij}=\partial_j\left(\lambda\theta\delta_{ij}+2\mu\varepsilon_{ij}\right)=\lambda\partial_i\theta+2\mu\,\partial_j\varepsilon_{ij}` },
    { n: 5, op: 'substitute', title: t('把应变换成位移', 'Replace strain with displacement'),
      latex: String.raw`2\,\partial_j\varepsilon_{ij}=\partial_j\partial_i u_j+\partial_j\partial_j u_i=\partial_i\left(\nabla\cdot\boldsymbol{u}\right)+\nabla^{2}u_i` },
    { n: 6, op: 'identity', title: t('合并同类项并用矢量恒等式整理', 'Collect terms using a vector identity'),
      latex: String.raw`\nabla^{2}\boldsymbol{u}=\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\nabla\times\left(\nabla\times\boldsymbol{u}\right)` },
    { n: 7, op: 'result', title: t('得到 Navier 方程', 'The Navier equation'),
      latex: String.raw`\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)+\mu\nabla^{2}\boldsymbol{u}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\nabla\times\left(\nabla\times\boldsymbol{u}\right)` },
  ],
  links: {
    upstream: [
      { id: 'strain-tensor' },
      { id: 'hookes-law-isotropic' },
    ],
    downstream: [
      { id: 'ps-wave-velocities', note: t('Helmholtz 分解后两个速度各自浮现', 'Helmholtz decomposition makes the two speeds appear') },
    ],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' }],

}

export default navierEquation
