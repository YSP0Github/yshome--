import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** navier-equation-expanded */
const navierEquationExpanded: FormulaCard = {
  id: 'navier-equation-expanded',
  name: t('Navier 方程的展开形式（非均匀介质）', 'The Navier Equation Expanded (Heterogeneous Media)'),
  aliases: {
    zh: ['Navier 方程展开式', '含模量梯度的波动方程', '非均匀介质 Navier 方程'],
    en: ['expanded Navier equation', 'Navier equation with modulus gradients', 'heterogeneous-medium elastodynamics'],
  },
  node: 'S1.4',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR', 'Q.VEL'],
    keywords: t('Navier 方程 展开 非均匀 模量梯度 梯度项 有限差分 谱元 强间断 弱形式', 'Navier equation expanded heterogeneous modulus gradients finite difference spectral element strong discontinuity weak form'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\rho\,\ddot{u}_i=\left(\lambda+\mu\right)\frac{\partial\theta}{\partial x_i}+\mu\nabla^{2}u_i+\frac{\partial\lambda}{\partial x_i}\,\theta+\frac{\partial\mu}{\partial x_j}\left(\frac{\partial u_i}{\partial x_j}+\frac{\partial u_j}{\partial x_i}\right)+\rho f_i`,
    variants: [
      { name: t('均匀介质：梯度项消失，回到经典 Navier 方程', 'Homogeneous medium: gradients vanish, back to the classical Navier equation'), latex: String.raw`\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)+\mu\nabla^{2}\boldsymbol{u}+\rho\boldsymbol{f}` },
      { name: t('等价的旋度写法', 'The equivalent curl form'), latex: String.raw`\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\,\nabla\times\left(\nabla\times\boldsymbol{u}\right)+\rho\boldsymbol{f}` },
      { name: t('散度形式的紧凑写法（数值离散常用）', 'Compact divergence form, the usual starting point for discretisation'), latex: String.raw`\rho\,\ddot{u}_i=\frac{\partial}{\partial x_i}\left(\lambda\,\theta\right)+\frac{\partial}{\partial x_j}\left[\mu\left(\frac{\partial u_i}{\partial x_j}+\frac{\partial u_j}{\partial x_i}\right)\right]+\rho f_i` },
      { name: t('体应变的定义', 'Definition of the volumetric strain'), latex: String.raw`\theta=\nabla\cdot\boldsymbol{u}=\frac{\partial u_k}{\partial x_k}` },
    ],
  },
  meaning: t(
    '教科书上的 Navier 方程默认 λ、μ 是常数；一旦介质分层——而地球恰恰处处分层——把 λ、μ 移到微分号外面就不合法了，必须多出两项含 ∇λ 与 ∇μ 的梯度项。这两项在介质性质突变处（自由表面、莫霍面、油气界面）贡献巨大。谱元法之所以好用，正是因为它走弱形式、把导数转嫁到试函数上，从而天然地处理了这些间断。',
    'Textbook Navier equations assume λ and μ are constants. Once the medium is layered — and the Earth is layered everywhere — moving λ and μ outside the derivative is illegal, and two extra gradient terms in ∇λ and ∇μ appear. These terms dominate wherever properties jump: the free surface, the Moho, a hydrocarbon contact. Spectral-element methods are popular precisely because their weak form shifts derivatives onto test functions and thus handles such discontinuities naturally.',
  ),
  symbols: [
    { sym: '\\rho', name: t('密度（同样可以是空间函数）', 'density, itself possibly a function of position'), unit: 'kg/m³', typical: '1800 – 3300' },
    { sym: '\\ddot{u}_i', name: t('加速度分量', 'acceleration component'), unit: 'm/s²' },
    { sym: '\\theta', name: t('体应变 ∇·u', 'volumetric strain ∇·u'), unit: '', dimension: '无量纲' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数，此处为 x 的函数', 'Lamé constants, here functions of position'), unit: 'Pa' },
    { sym: '\\partial_i\\lambda,\\partial_j\\mu', name: t('模量的空间梯度', 'spatial gradients of the moduli'), unit: 'Pa/m' },
    { sym: 'f_i', name: t('单位质量体力（若按单位体积计则去掉前面的 ρ）', 'body force per unit mass (drop the leading ρ if per unit volume)'), unit: 'm/s²', typical: '重力 9.8' },
  ],
  conditions: {
    applies: [
      t('非均匀各向同性线弹性介质，λ(x)、μ(x)、ρ(x) 可随空间变化', 'Heterogeneous isotropic linear elastic media with λ(x), μ(x), ρ(x)'),
      t('强速度梯度、层状介质、含间断界面的模型', 'Strong velocity gradients, layered media, models with sharp interfaces'),
    ],
    assumes: [
      t('λ、μ、ρ 至少一阶可微；有间断时应在弱形式下理解', 'λ, μ, ρ are at least once differentiable; at discontinuities the equation is understood weakly'),
      t('小应变线弹性、无初始应力', 'Small-strain linear elasticity, no initial stress'),
    ],
    breaks: [
      t('模量随频率变化（黏弹性）时不能直接套用', 'Frequency-dependent (anelastic) moduli cannot be inserted directly'),
      t('各向异性介质需回到完整的 ∂_j(c_ijkl ε_kl)', 'Anisotropic media require the full ∂_j(c_ijkl ε_kl)'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从运动方程与本构关系出发', 'Start from the equation of motion and the constitutive law'),
      latex: String.raw`\rho\,\ddot{u}_i=\partial_j\sigma_{ij}+\rho f_i,\qquad \sigma_{ij}=\lambda\,\theta\,\delta_{ij}+\mu\left(\partial_i u_j+\partial_j u_i\right)`,
      note: t('注意现在的 λ、μ 写在微分号里面，不能随便提出来。', 'Note that λ and μ now sit inside the derivative and cannot be pulled out.') },
    { n: 2, op: 'substitute', title: t('把应力散度逐项求导（乘积法则）', 'Differentiate the stress divergence term by term (product rule)'),
      latex: String.raw`\partial_j\sigma_{ij}=\partial_i\left(\lambda\theta\right)+\partial_j\left[\mu\left(\partial_i u_j+\partial_j u_i\right)\right]` },
    { n: 3, op: 'algebra', title: t('展开乘积法则，分离出梯度项', 'Expand the product rule and isolate the gradient terms'),
      latex: String.raw`\partial_i\left(\lambda\theta\right)=\lambda\,\partial_i\theta+\left(\partial_i\lambda\right)\theta,\qquad \partial_j\left[\mu\left(\partial_i u_j+\partial_j u_i\right)\right]=\mu\left(\partial_i\theta+\nabla^{2}u_i\right)+\left(\partial_j\mu\right)\left(\partial_i u_j+\partial_j u_i\right)`,
      note: t('这里用了 ∂_j∂_i u_j = ∂_i θ：交换一下求导次序即可。', 'This uses ∂_j∂_i u_j = ∂_i θ, obtained by swapping the order of differentiation.') },
    { n: 4, op: 'algebra', title: t('把含 μ 的两部分合并', 'Combine the two μ terms'),
      latex: String.raw`\mu\,\partial_i\theta+\mu\nabla^{2}u_i+\lambda\,\partial_i\theta=\left(\lambda+\mu\right)\partial_i\theta+\mu\nabla^{2}u_i` },
    { n: 5, op: 'result', title: t('写成展开形式', 'Write the expanded form'),
      latex: String.raw`\rho\,\ddot{u}_i=\left(\lambda+\mu\right)\partial_i\theta+\mu\nabla^{2}u_i+\left(\partial_i\lambda\right)\theta+\left(\partial_j\mu\right)\left(\partial_i u_j+\partial_j u_i\right)+\rho f_i` },
    { n: 6, op: 'identity', title: t('均匀介质中梯度项归零', 'In a homogeneous medium the gradient terms vanish'),
      latex: String.raw`\partial_i\lambda=\partial_j\mu=0\;\Rightarrow\; \rho\,\ddot{\boldsymbol{u}}=\left(\lambda+\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)+\mu\nabla^{2}\boldsymbol{u}+\rho\boldsymbol{f}`,
      note: t('再用 ∇²u = ∇(∇·u) − ∇×(∇×u) 就得到 (λ+2μ) 形式的经典写法。', 'Applying ∇²u = ∇(∇·u) − ∇×(∇×u) gives the classical (λ+2μ) form.') },
  ],
  links: {
    upstream: [
      { id: 'equation-of-motion', note: t('提供 ρ ü = ∂σ + f', 'supplies ρ ü = ∂σ + f') },
      { id: 'hookes-law-isotropic' },
    ],
    downstream: [
      { id: 'ps-potential-decoupling', note: t('均匀介质中才能干净解耦', 'clean decoupling only holds in homogeneous media') },
    ],
    seealso: [
      { id: 'navier-equation', note: t('均匀介质的主条目', 'the main entry for the homogeneous case') },
      { id: 'ps-wave-velocities' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Komatitsch & Tromp (1999), Introduction to the spectral-element method, GJI 139, 806–822' },
  ],
}

export default navierEquationExpanded
