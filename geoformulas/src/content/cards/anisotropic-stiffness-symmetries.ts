import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** anisotropic-stiffness-symmetries */
const anisotropicStiffnessSymmetries: FormulaCard = {
  id: 'anisotropic-stiffness-symmetries',
  name: t('各向异性广义胡克定律与刚度张量的对称性', 'Generalized Hooke Law and the Symmetries of the Stiffness Tensor'),
  aliases: {
    zh: ['广义胡克定律', '四阶刚度张量', '21 个独立弹性常数'],
    en: ['generalized Hooke law', 'fourth-rank stiffness tensor', '21 independent elastic constants'],
  },
  node: 'S1.6',
  tags: {
    subject: 'S1.6',
    math: ['MATH.LINALG', 'MATH.VECTOR'],
    method: ['METH.STRUCT', 'METH.ROCK'],
    quantity: ['Q.TENSOR', 'Q.MAT'],
    keywords: t('各向异性 刚度张量 次对称性 主对称性 独立常数 应变能 四阶张量 三斜晶系', 'anisotropy stiffness tensor minor symmetry major symmetry independent constants strain energy fourth-rank tensor triclinic'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\sigma_{ij}=C_{ijkl}\,\varepsilon_{kl}`,
    variants: [
      {
        name: t('应变能密度（二次势）', 'Strain-energy density (quadratic potential)'),
        latex: String.raw`W=\frac{1}{2}\,C_{ijkl}\,\varepsilon_{ij}\,\varepsilon_{kl},\qquad \sigma_{ij}=\frac{\partial W}{\partial \varepsilon_{ij}}`,
      },
      {
        name: t('次对称性：来自应力与应变各自的对称性', 'Minor symmetries: from the symmetry of stress and strain'),
        latex: String.raw`C_{ijkl}=C_{jikl}=C_{ijlk}`,
      },
      {
        name: t('主对称性：来自应变能势的存在', 'Major symmetry: from the existence of a strain-energy potential'),
        latex: String.raw`C_{ijkl}=C_{klij}`,
      },
      {
        name: t('独立常数计数：81 → 36 → 21', 'Counting independent constants: 81 → 36 → 21'),
        latex: String.raw`3^{4}=81\;\xrightarrow{\ \text{次对称}\ }\;6\times 6=36\;\xrightarrow{\ \text{主对称}\ }\;\frac{6\times 7}{2}=21`,
      },
      {
        name: t('各向同性极限：只剩下 Lamé 的两个常数', 'Isotropic limit: only the two Lamé constants survive'),
        latex: String.raw`C_{ijkl}=\lambda\,\delta_{ij}\delta_{kl}+\mu\left(\delta_{ik}\delta_{jl}+\delta_{il}\delta_{jk}\right)`,
      },
    ],
  },
  meaning: t(
    '把胡克定律从「两个 Lamé 常数」推广到最一般的形式，就是一个四阶张量 C_ijkl 把应变线性地映射到应力。它表面上 81 个分量，但对称性把它砍到 21 个：次对称性来自应力与应变本身对称（6×6），主对称性来自「变形做的功可以存起来」（36→21）。这 21 个数字是三斜晶系（最低对称性）的完整弹性描述，地球上绝大多数岩石的弹性复杂性都装在这个盒子里面。',
    'Promoting Hooke law from two Lamé constants to its most general form means a fourth-rank tensor C_ijkl mapping strain linearly onto stress. It nominally has 81 components, but symmetry cuts it to 21: the minor symmetries come from stress and strain being symmetric themselves (6×6), the major symmetry from deformation work being storable (36 → 21). Those 21 numbers are the complete elastic description of a triclinic solid — the lowest symmetry possible — and essentially all elastic complexity encountered in rocks fits inside that box.',
  ),
  symbols: [
    { sym: '\\sigma_{ij}', name: t('应力张量分量', 'stress tensor component'), unit: 'Pa', typical: '10⁶ – 10⁹（地震波扰动）' },
    { sym: '\\varepsilon_{kl}', name: t('应变张量分量', 'strain tensor component'), unit: '1', typical: '10⁻⁹ – 10⁻⁶（地震波扰动）' },
    { sym: 'C_{ijkl}', name: t('四阶刚度张量', 'fourth-rank stiffness tensor'), unit: 'Pa', typical: '10⁹ – 10¹¹' },
    { sym: 'W', name: t('单位体积应变能', 'strain energy per unit volume'), unit: 'J/m³' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数（各向同性极限）', 'Lamé constants (isotropic limit)'), unit: 'Pa', typical: '10⁹ – 10¹¹' },
    { sym: '\\delta_{ij}', name: t('Kronecker 符号', 'Kronecker delta'), unit: '1' },
  ],
  conditions: {
    applies: [
      t('任意对称性的线性弹性固体（三斜、单斜、正交、TI、各向同性皆可）', 'Any linear elastic solid, whatever its symmetry class (triclinic through isotropic)'),
      t('小应变、无限小变形框架下的本构关系', 'Small-strain, infinitesimal-deformation constitutive law'),
    ],
    assumes: [
      t('应力与应变之间存在一一对应的线性映射（无滞回、无时率效应）', 'A one-to-one linear map between stress and strain (no hysteresis, no rate effects)'),
      t('变形是可逆的：存在单值应变能势（纯弹性、无耗散）', 'Deformation is reversible: a single-valued strain-energy potential exists (purely elastic, non-dissipative)'),
      t('无初始预应力；C 与频率无关', 'No pre-stress; C is frequency independent'),
    ],
    breaks: [
      t('有耗散（黏弹性）时 C_ijkl 变复数，主对称性改由热力学势与 Onsager 关系约束', 'With dissipation (viscoelasticity) C_ijkl becomes complex and the major symmetry is instead constrained by thermodynamic potentials and Onsager relations'),
      t('有限应变或高压下需要三阶、四阶弹性常数（非线性声弹性）', 'Finite strain or high confining pressure requires third- and fourth-order elastic constants (nonlinear acousto-elasticity)'),
      t('含裂隙/流体的等效介质中，C 还依赖于频率与流体压力', 'In fractured or fluid-saturated effective media, C additionally depends on frequency and pore pressure'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('最一般的线性本构', 'The most general linear constitutive law'),
      latex: String.raw`\sigma_{ij}=C_{ijkl}\,\varepsilon_{kl},\qquad C_{ijkl}=\left.\frac{\partial \sigma_{ij}}{\partial \varepsilon_{kl}}\right|_{\boldsymbol{\varepsilon}=0}`,
      note: t('没有任何对称性假设时，4 个指标各取 1、2、3，共 3⁴ = 81 个分量。', 'With no symmetry assumed, each of the four indices runs over 1, 2, 3, giving 3⁴ = 81 components.'),
    },
    {
      n: 2,
      op: 'physics',
      title: t('角动量守恒 ⟹ 应力对称；应变按定义对称', 'Angular-momentum balance makes stress symmetric; strain is symmetric by definition'),
      latex: String.raw`\sigma_{ij}=\sigma_{ji},\qquad \varepsilon_{kl}=\varepsilon_{lk}`,
      note: t('应力对称来自力矩平衡（无体耦）；应变对称来自 ε_kl = ½(∂_l u_k + ∂_k u_l) 的定义，刚体转动不产生应变。', 'Stress symmetry follows from moment equilibrium (no body couples); strain symmetry from the definition ε_kl = ½(∂_l u_k + ∂_k u_l), which eliminates rigid rotation.'),
    },
    {
      n: 3,
      op: 'identity',
      title: t('由此得到次对称性，指标对 (ij) 只有 6 种', 'Hence the minor symmetries: the index pair (ij) takes only 6 values'),
      latex: String.raw`C_{ijkl}=C_{jikl}=C_{ijlk}\;\Longrightarrow\; C_{ijkl}\to C_{IJ},\quad I,J=1,\dots,6`,
      note: t('这一步把 81 降到 6×6 = 36。指标对 (ij) 与 (ji) 等价，所以每对只算一次。', 'This step reduces 81 to 6×6 = 36. The pairs (ij) and (ji) are equivalent, so each pair is counted once.'),
    },
    {
      n: 4,
      op: 'physics',
      title: t('可逆性 ⟹ 存在应变能势 W(ε)', 'Reversibility implies a strain-energy potential W(ε)'),
      latex: String.raw`\mathrm{d}W=\sigma_{ij}\,\mathrm{d}\varepsilon_{ij}\;\Longrightarrow\; W=\frac{1}{2}C_{ijkl}\,\varepsilon_{ij}\,\varepsilon_{kl}`,
      note: t('沿任意闭合的应变路径做功为零，积分才与路径无关，W 才是状态函数 —— 这正是「弹性」二字的含义。', 'Work along any closed strain path vanishes, so the integral is path independent and W is a state function. That is precisely what "elastic" means.'),
    },
    {
      n: 5,
      op: 'identity',
      title: t('W 的二阶混合偏导可交换 ⟹ 主对称性', 'The mixed second derivatives of W commute, giving the major symmetry'),
      latex: String.raw`C_{ijkl}=\frac{\partial^{2}W}{\partial \varepsilon_{ij}\,\partial \varepsilon_{kl}}=\frac{\partial^{2}W}{\partial \varepsilon_{kl}\,\partial \varepsilon_{ij}}=C_{klij}`,
      note: t('于是 36 个分量再对称化一次：上三角含对角线共 6×7/2 = 21 个独立常数。', 'The 36 components are then symmetrized once more: the upper triangle including the diagonal holds 6×7/2 = 21 independent constants.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('结论与各向同性退化', 'Result, and the isotropic degeneration'),
      latex: String.raw`N_{\text{indep}}=\frac{6\times 7}{2}=21,\qquad C_{ijkl}=\lambda\,\delta_{ij}\delta_{kl}+\mu\left(\delta_{ik}\delta_{jl}+\delta_{il}\delta_{jk}\right)`,
      note: t('21 = 三斜晶系；对称性每升高一级（单斜 13、正交 9、TI 5、立方 3、各向同性 2），独立常数就再减少。各向同性时 C 只能由 δ 张量拼出，只剩 λ 与 μ。', '21 corresponds to triclinic symmetry. Each step up in symmetry (monoclinic 13, orthorhombic 9, TI 5, cubic 3, isotropic 2) removes more constants. For isotropy, C can only be built from Kronecker deltas, leaving λ and μ.'),
    },
  ],
  links: {
    upstream: [{ id: 'strain-tensor', note: t('提供小应变张量的定义', 'supplies the definition of the infinitesimal strain tensor') }],
    downstream: [
      { id: 'voigt-notation-stiffness-matrix', note: t('把 36 个双指标分量写成 6×6 矩阵', 'writes the 36 pair-indexed components as a 6×6 matrix') },
      { id: 'vti-elastic-constants', note: t('把 21 降到 TI 的 5 个', 'reduces 21 to the 5 constants of a TI solid') },
    ],
    seealso: [{ id: 'hookes-law-isotropic', note: t('两个 Lamé 常数的特例', 'the two-Lamé-constant special case') }],
  },
  refs: [
    { text: 'Nye, Physical Properties of Crystals, Oxford University Press, §VIII' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Thomsen (1986), Weak elastic anisotropy, Geophysics 51, 1954–1966' },
  ],
}

export default anisotropicStiffnessSymmetries
