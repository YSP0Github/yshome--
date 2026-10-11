import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ps-potential-decoupling */
const psPotentialDecoupling: FormulaCard = {
  id: 'ps-potential-decoupling',
  name: t('P 波与 S 波的解耦：两个势各自满足波动方程', 'Decoupling P and S: Each Potential Obeys Its Own Wave Equation'),
  aliases: {
    zh: ['纵横波解耦', '势函数波动方程', 'P/S 分离'],
    en: ['P/S decoupling', 'potential wave equations', 'separation of P and S'],
  },
  node: 'S1.4',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.STRUCT'],
    quantity: ['Q.VEL', 'Q.TENSOR'],
    keywords: t('P 波 S 波 解耦 标量势 矢量势 波动方程 无旋 无散 正交 偏振 SV SH', 'P wave S wave decoupling scalar potential vector potential wave equation irrotational solenoidal orthogonal polarisation SV SH'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\nabla^{2}\phi=\frac{1}{\alpha^{2}}\frac{\partial^{2}\phi}{\partial t^{2}},\qquad \nabla^{2}\boldsymbol{\psi}=\frac{1}{\beta^{2}}\frac{\partial^{2}\boldsymbol{\psi}}{\partial t^{2}}`,
    variants: [
      { name: t('两个速度同时被读出', 'Both speeds are read off at once'), latex: String.raw`\alpha^{2}=\frac{\lambda+2\mu}{\rho},\qquad \beta^{2}=\frac{\mu}{\rho}` },
      { name: t('频域写法（各成一个 Helmholtz 方程）', 'Frequency-domain form (one Helmholtz equation each)'), latex: String.raw`\nabla^{2}\tilde{\phi}+\frac{\omega^{2}}{\alpha^{2}}\tilde{\phi}=0,\qquad \nabla^{2}\tilde{\boldsymbol{\psi}}+\frac{\omega^{2}}{\beta^{2}}\tilde{\boldsymbol{\psi}}=0` },
      { name: t('解耦前的原方程（对比用）', 'Before decoupling, for comparison'), latex: String.raw`\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\,\nabla\times\left(\nabla\times\boldsymbol{u}\right)` },
      { name: t('位移最终由两个势合成', 'Finally, displacement is reassembled from the two potentials'), latex: String.raw`\boldsymbol{u}=\underbrace{\nabla\phi}_{\text{P 波}}+\underbrace{\nabla\times\boldsymbol{\psi}}_{\text{S 波}}` },
    ],
  },
  meaning: t(
    '把位移分解成标量势 φ 与矢量势 ψ 之后，Navier 方程里那两个纠缠在一起的算子突然各归各位：∇(∇·u) 只吃 φ，∇×(∇×u) 只吃 ψ。于是"一条耦合方程"变成"两条独立波动方程"，P 波以 α 传播、S 波以 β 传播，互不干扰（在均匀介质中）。这是"地震图上有独立的 P 震相和 S 震相"这一观测事实的理论根据。',
    'After splitting displacement into the scalar potential φ and the vector potential ψ, the two entangled operators in the Navier equation fall into place: ∇(∇·u) consumes only φ, ∇×(∇×u) consumes only ψ. One coupled equation becomes two independent wave equations — P travelling at α, S at β, ignoring each other in homogeneous media. This is the theoretical basis for the observed fact that seismograms show separate P and S phases.',
  ),
  symbols: [
    { sym: '\\phi', name: t('标量位移势（P 波）', 'scalar displacement potential (P waves)'), unit: 'm²' },
    { sym: '\\boldsymbol{\\psi}', name: t('矢量位移势（S 波）', 'vector displacement potential (S waves)'), unit: 'm²' },
    { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s', typical: '1500 – 13700' },
    { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s', typical: '0 – 7200' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
  ],
  conditions: {
    applies: [
      t('均匀（λ、μ、ρ 为常数）、各向同性、线弹性介质', 'Homogeneous (constant λ, μ, ρ), isotropic, linear elastic media'),
      t('无体力，或体力本身也可作 Helmholtz 分解并入右端', 'No body force, or a body force that is itself decomposed and absorbed into the right-hand side'),
    ],
    assumes: [
      t('规范条件 ∇·ψ = 0', 'The gauge condition ∇·ψ = 0'),
      t('势在无穷远满足辐射条件（只保留出射波）', 'Potentials satisfy a radiation condition at infinity (outgoing waves only)'),
    ],
    breaks: [
      t('非均匀介质：∇λ、∇μ 项会把 φ 与 ψ 重新耦合起来', 'Heterogeneous media: the ∇λ, ∇μ terms recouple φ and ψ'),
      t('界面上 P 与 S 互相转换（反射/透射系数描述）', 'At interfaces P and S convert into each other, described by reflection and transmission coefficients'),
      t('各向异性：不存在这样干净的标量/矢量势分离', 'Anisotropy: no such clean scalar/vector separation exists'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('无体力均匀介质的 Navier 方程', 'The Navier equation without body force in a homogeneous medium'),
      latex: String.raw`\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\,\nabla\times\left(\nabla\times\boldsymbol{u}\right)` },
    { n: 2, op: 'substitute', title: t('代入 Helmholtz 分解', 'Insert the Helmholtz decomposition'),
      latex: String.raw`\boldsymbol{u}=\nabla\phi+\nabla\times\boldsymbol{\psi},\qquad \nabla\cdot\boldsymbol{\psi}=0`,
      note: t('左端的加速度也跟着分解：ü = ∇φ̈ + ∇×ψ̈。', 'The acceleration splits too: ü = ∇φ̈ + ∇×ψ̈.') },
    { n: 3, op: 'identity', title: t('两个微分算子各只作用于一个势', 'Each differential operator acts on one potential only'),
      latex: String.raw`\nabla\left(\nabla\cdot\boldsymbol{u}\right)=\nabla\left(\nabla^{2}\phi\right),\qquad \nabla\times\left(\nabla\times\boldsymbol{u}\right)=-\nabla^{2}\left(\nabla\times\boldsymbol{\psi}\right)`,
      note: t('关键恒等式：∇×∇φ = 0 与 ∇·(∇×ψ) = 0 把交叉项全部清掉。', 'The key identities ∇×∇φ = 0 and ∇·(∇×ψ) = 0 remove every cross term.') },
    { n: 4, op: 'algebra', title: t('把 φ 的部分与 ψ 的部分分列两边', 'Separate the φ part from the ψ part'),
      latex: String.raw`\nabla\left[\rho\,\ddot{\phi}-\left(\lambda+2\mu\right)\nabla^{2}\phi\right]+\nabla\times\left[\rho\,\ddot{\boldsymbol{\psi}}-\mu\nabla^{2}\boldsymbol{\psi}\right]=\boldsymbol{0}` },
    { n: 5, op: 'identity', title: t('无旋场与无散场正交，只能各自为零', 'Irrotational and solenoidal fields are orthogonal, so each must vanish'),
      latex: String.raw`\rho\,\ddot{\phi}=\left(\lambda+2\mu\right)\nabla^{2}\phi,\qquad \rho\,\ddot{\boldsymbol{\psi}}=\mu\nabla^{2}\boldsymbol{\psi}`,
      note: t('一个梯度场加一个旋度场等于零，则两者分别等于零（在衰减边界条件下）。', 'If a gradient field plus a curl field vanishes, each vanishes separately under decaying boundary conditions.') },
    { n: 6, op: 'result', title: t('读出两条波动方程与两个速度', 'Read off the two wave equations and the two speeds'),
      latex: String.raw`\nabla^{2}\phi=\frac{1}{\alpha^{2}}\ddot{\phi},\quad \alpha=\sqrt{\frac{\lambda+2\mu}{\rho}};\qquad \nabla^{2}\boldsymbol{\psi}=\frac{1}{\beta^{2}}\ddot{\boldsymbol{\psi}},\quad \beta=\sqrt{\frac{\mu}{\rho}}`,
      note: t('ψ 只有两个独立分量，正好对应 S 波的两个偏振 SV 与 SH。', 'ψ carries only two independent components, matching the two S polarisations SV and SH.') },
  ],
  links: {
    upstream: [
      { id: 'navier-equation' },
      { id: 'helmholtz-decomposition', note: t('解耦所依赖的分解定理', 'the decomposition theorem this relies on') },
    ],
    downstream: [
      { id: 'ps-wave-velocities', note: t('α 与 β 的主条目', 'the main entry for α and β') },
      { id: 'p-wave-velocity-formula' },
      { id: 's-wave-velocity-formula' },
      { id: 'reduced-wave-equation' },
    ],
    seealso: [
      { id: 'navier-equation-expanded', note: t('非均匀介质中解耦不再成立', 'decoupling fails in heterogeneous media') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
  ],
}

export default psPotentialDecoupling
