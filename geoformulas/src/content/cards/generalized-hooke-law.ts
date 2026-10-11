import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** generalized-hooke-law */
const generalizedHookeLaw: FormulaCard = {
  id: 'generalized-hooke-law',
  name: t('广义 Hooke 定律（四阶弹性张量）', "Generalized Hooke's Law (Fourth-Rank Elastic Tensor)"),
  aliases: {
    zh: ['广义胡克定律', '线弹性本构关系', '刚度张量'],
    en: ['generalized Hooke law', 'linear elastic constitutive law', 'stiffness tensor'],
  },
  node: 'S1.3',
  tags: {
    math: ['MATH.LINALG', 'MATH.VECTOR'],
    method: ['METH.ROCK'],
    quantity: ['Q.TENSOR', 'Q.MAT'],
    keywords: t('广义胡克定律 弹性张量 Cijkl 21 个独立常数 Voigt 记法 各向异性 本构关系', 'generalized Hooke law elastic tensor Cijkl 21 independent constants Voigt notation anisotropy constitutive relation'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\sigma_{ij}=C_{ijkl}\,\varepsilon_{kl}`,
    variants: [
      { name: t('用柔度张量反解应变', 'Inverted with the compliance tensor'), latex: String.raw`\varepsilon_{ij}=S_{ijkl}\,\sigma_{kl},\qquad \mathbf{S}=\mathbf{C}^{-1}` },
      { name: t('Voigt 缩写记法（6 维向量形式）', 'Voigt contracted notation (6-vector form)'), latex: String.raw`\sigma_{I}=C_{IJ}\,\varepsilon_{I},\qquad I,J=1,\dots ,6` },
      { name: t('各向同性退化：只剩两个常数', 'Isotropic reduction: only two constants survive'), latex: String.raw`C_{ijkl}=\lambda\,\delta_{ij}\delta_{kl}+\mu\left(\delta_{ik}\delta_{jl}+\delta_{il}\delta_{jk}\right)` },
    ],
  },
  meaning: t(
    '这是线弹性的定义式：应力与应变之间最一般的线性映射，比例系数是一个四阶张量 C。它一开始有 81 个分量，靠三重对称性砍到 21 个；各向同性再把它砍到 2 个（λ 与 μ）。地震学里凡是谈"各向异性"、"裂隙定向"、"地幔晶格优选方位"，本质上都是在讨论这 21 个分量里剩下的那些自由度。',
    'This is the definition of linear elasticity: the most general linear map from strain to stress, with a fourth-rank tensor C as the coefficient. It starts with 81 components, symmetry cuts it to 21, and isotropy cuts it further to two (λ and μ). Whenever seismology talks about anisotropy, aligned cracks or lattice-preferred orientation in the mantle, it is really talking about the remaining degrees of freedom among those 21 components.',
  ),
  symbols: [
    { sym: '\\sigma_{ij}', name: t('应力张量分量', 'stress tensor component'), unit: 'Pa', typical: '10⁶ – 10¹¹' },
    { sym: '\\varepsilon_{kl}', name: t('小应变张量分量', 'infinitesimal strain tensor component'), unit: '', dimension: '无量纲', typical: '10⁻⁶ – 10⁻³（地震波动）' },
    { sym: 'C_{ijkl}', name: t('四阶弹性刚度张量', 'fourth-rank elastic stiffness tensor'), unit: 'Pa', typical: '10¹⁰ – 10¹¹（岩石）' },
    { sym: 'S_{ijkl}', name: t('四阶柔度张量', 'fourth-rank compliance tensor'), unit: 'Pa⁻¹' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数（各向同性情形）', 'Lamé constants (isotropic case)'), unit: 'Pa' },
    { sym: '\\delta_{ij}', name: t('Kronecker δ', 'Kronecker delta'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [
      t('线弹性、小应变（|ε| ≪ 1）、无初应力的连续介质', 'Linear elastic, small strain (|ε| ≪ 1), initial-stress-free continuum'),
      t('最一般情形含 21 个独立常数，涵盖任意各向异性', 'The general case carries 21 independent constants and covers arbitrary anisotropy'),
    ],
    assumes: [
      t('应力只依赖于当前应变，与应变率和历史无关', 'Stress depends only on the current strain, not on strain rate or history'),
      t('变形可逆，加载与卸载走同一条路径', 'Deformation is reversible: loading and unloading follow the same path'),
    ],
    breaks: [
      t('塑性、破裂、摩擦滑动等不可逆变形', 'Plasticity, fracturing, frictional sliding and other irreversible deformation'),
      t('孔隙流体参与时需要 Biot 多孔弹性理论', 'Fluid-saturated rock requires Biot poroelasticity'),
      t('黏弹性/衰减：模量变成复数且依赖频率（见 Q）', 'Anelasticity: moduli become complex and frequency dependent (see Q)'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('最一般的线性假设', 'The most general linear assumption'),
      latex: String.raw`\sigma_{ij}=C_{ijkl}\,\varepsilon_{kl},\qquad i,j,k,l=1,2,3`,
      note: t('把应力写为应变的线性函数；四个指标各有 3 个取值，共 3⁴ = 81 个系数。', 'Write stress as a linear function of strain; four indices with three values each give 3⁴ = 81 coefficients.') },
    { n: 2, op: 'identity', title: t('应变张量对称带来的次对称性', 'Minor symmetry from the symmetric strain tensor'),
      latex: String.raw`\varepsilon_{kl}=\varepsilon_{lk}\;\Rightarrow\; C_{ijkl}=C_{ijlk}\;\Rightarrow\; 81 \to 54`,
      note: t('对称张量只有 6 个独立分量，于是后两个指标可交换。', 'A symmetric tensor has only six independent components, so the last two indices may be swapped.') },
    { n: 3, op: 'physics', title: t('角动量平衡要求应力对称', 'Angular momentum balance requires symmetric stress'),
      latex: String.raw`\sigma_{ij}=\sigma_{ji}\;\Rightarrow\; C_{ijkl}=C_{jikl}\;\Rightarrow\; 54 \to 36` },
    { n: 4, op: 'identity', title: t('应变能存在给出主对称性', 'Existence of a strain-energy potential gives major symmetry'),
      latex: String.raw`W=\frac{1}{2}C_{ijkl}\,\varepsilon_{ij}\varepsilon_{kl}\;\Rightarrow\; C_{ijkl}=C_{klij}\;\Rightarrow\; 36 \to 21`,
      note: t('若变形是保守的，刚度张量必须自伴，独立常数最终定格在 21。', 'If deformation is conservative the stiffness tensor must be self-adjoint, fixing the count at 21.') },
    { n: 5, op: 'transform', title: t('压缩成 6×6 的 Voigt 矩阵', 'Contract to a 6×6 Voigt matrix'),
      latex: String.raw`\left(11,22,33,23,13,12\right)\mapsto\left(1,2,3,4,5,6\right),\qquad \boldsymbol{\sigma}_{6\times1}=\mathbf{C}_{6\times6}\,\boldsymbol{\varepsilon}_{6\times1}`,
      note: t('工程上从不写四阶张量，而是写这个对称的 6×6 矩阵。', 'Engineers never write the fourth-rank tensor; they write this symmetric 6×6 matrix instead.') },
    { n: 6, op: 'result', title: t('各向同性时收敛到两个 Lamé 常数', 'Isotropy collapses everything onto two Lamé constants'),
      latex: String.raw`C_{ijkl}=\lambda\,\delta_{ij}\delta_{kl}+\mu\left(\delta_{ik}\delta_{jl}+\delta_{il}\delta_{jk}\right)\;\Rightarrow\; \sigma_{ij}=\lambda\,\varepsilon_{kk}\delta_{ij}+2\mu\,\varepsilon_{ij}` },
  ],
  links: {
    upstream: [{ id: 'strain-tensor', note: t('提供 ε_kl', 'supplies ε_kl') }],
    downstream: [
      { id: 'isotropic-hooke-law', note: t('各向同性时 C 的 6×6 显式写法', 'explicit 6×6 form of C when isotropic') },
      { id: 'hookes-law-isotropic' },
      { id: 'strain-energy-density', note: t('W = ½ C ε ε 是主对称性的来源', 'W = ½ C ε ε is where major symmetry comes from') },
    ],
    seealso: [
      { id: 'elastic-moduli-conversions' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Nye, Physical Properties of Crystals, §VIII (tensor symmetry)' },
  ],
}

export default generalizedHookeLaw
