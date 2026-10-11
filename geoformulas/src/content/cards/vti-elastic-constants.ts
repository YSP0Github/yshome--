import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** vti-elastic-constants */
const vtiElasticConstants: FormulaCard = {
  id: 'vti-elastic-constants',
  name: t('VTI（横向各向同性）介质的 5 个独立弹性常数', 'The Five Independent Elastic Constants of a VTI Medium'),
  aliases: {
    zh: ['横向各向同性', 'TI 介质', '六方晶系刚度矩阵'],
    en: ['VTI medium', 'transverse isotropy', 'hexagonal stiffness matrix', 'TI constants'],
  },
  node: 'S1.6',
  tags: {
    subject: 'S1.6',
    math: ['MATH.LINALG', 'MATH.VECTOR'],
    method: ['METH.STRUCT', 'METH.ROCK'],
    quantity: ['Q.TENSOR', 'Q.MAT'],
    keywords: t('VTI 横向各向同性 对称轴 五个独立常数 C11 C13 C33 C44 C66 薄互层 页岩', 'VTI transverse isotropy symmetry axis five independent constants thin layering shale hexagonal'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{C}_{\mathrm{VTI}}=\begin{bmatrix}C_{11}&C_{11}-2C_{66}&C_{13}&0&0&0\\ C_{11}-2C_{66}&C_{11}&C_{13}&0&0&0\\ C_{13}&C_{13}&C_{33}&0&0&0\\ 0&0&0&C_{44}&0&0\\ 0&0&0&0&C_{44}&0\\ 0&0&0&0&0&C_{66}\end{bmatrix}`,
    variants: [
      {
        name: t('独立常数：C₁₁、C₁₃、C₃₃、C₄₄、C₆₆（且 C₁₂ = C₁₁ − 2C₆₆）', 'Independent constants: C₁₁, C₁₃, C₃₃, C₄₄, C₆₆, with C₁₂ = C₁₁ − 2C₆₆'),
        latex: String.raw`C_{12}=C_{11}-2C_{66},\qquad C_{55}=C_{44}`,
      },
      {
        name: t('用垂向速度表示的三个对角元', 'Three diagonal entries expressed through vertical velocities'),
        latex: String.raw`C_{33}=\rho\alpha_{0}^{2},\qquad C_{44}=\rho\beta_{0}^{2},\qquad C_{66}=\rho\beta_{0}^{2}\left(1+2\gamma\right)`,
      },
      {
        name: t('用 Thomsen 参数表示全部 5 个常数', 'All five constants in terms of the Thomsen parameters'),
        latex: String.raw`C_{11}=\rho\alpha_{0}^{2}\left(1+2\varepsilon\right),\qquad C_{13}=-C_{44}+\sqrt{\left(C_{33}-C_{44}\right)^{2}+2\delta\,C_{33}\left(C_{33}-C_{44}\right)}`,
      },
      {
        name: t('各向同性退化', 'Isotropic degeneration'),
        latex: String.raw`\varepsilon=\delta=\gamma=0\;\Longrightarrow\; C_{33}=C_{11}=\lambda+2\mu,\quad C_{13}=C_{12}=\lambda,\quad C_{44}=C_{66}=\mu`,
      },
    ],
  },
  meaning: t(
    '横向各向同性（VTI）指介质绕一条垂直轴旋转任意角度都不变 —— 沉积岩的薄互层、页岩的片状矿物定向排列，在波长大于层厚时都表现为 VTI。21 个独立常数被这条对称性削到 5 个：3 个控制 P/SV（C₁₁、C₁₃、C₃₃、C₄₄ 中取 4 个），C₆₆ 单独控制 SH。实测上我们并不直接测 C_IJ，而是测「垂向速度 + Thomsen 参数」这组更有物理意义的组合。',
    'Transverse isotropy with a vertical axis (VTI) means the medium is invariant under rotation by any angle about a vertical axis. Thinly layered sediments and shales with aligned platy minerals both behave as VTI at wavelengths larger than the layer spacing. The symmetry axis cuts the 21 constants down to 5: four of them (C₁₁, C₁₃, C₃₃, C₄₄) control P/SV, while C₆₆ alone controls SH. In practice one does not measure C_IJ directly but the physically more meaningful pair "vertical velocity + Thomsen parameters".',
  ),
  symbols: [
    { sym: 'C_{11}', name: t('水平方向的 P 波模量', 'horizontal P-wave modulus'), unit: 'Pa', typical: 'ρ α₀²(1+2ε)，约 3×10¹⁰' },
    { sym: 'C_{33}', name: t('垂直方向的 P 波模量', 'vertical P-wave modulus'), unit: 'Pa', typical: 'ρ α₀²，约 2×10¹⁰' },
    { sym: 'C_{13}', name: t('垂向–水平耦合模量', 'vertical–horizontal coupling modulus'), unit: 'Pa', typical: '由 δ 反解，约 λ' },
    { sym: 'C_{44}', name: t('垂向 SH / SV 剪切模量', 'vertical shear modulus (SH and SV)'), unit: 'Pa', typical: 'ρ β₀²，约 5×10⁹' },
    { sym: 'C_{66}', name: t('水平面内剪切模量', 'in-plane horizontal shear modulus'), unit: 'Pa', typical: 'ρβ₀²(1+2γ)' },
    { sym: '\\alpha_0', name: t('垂直传播的 P 波速度', 'vertically propagating P velocity'), unit: 'm/s', typical: '2000 – 4000' },
    { sym: '\\beta_0', name: t('垂直传播的 S 波速度', 'vertically propagating S velocity'), unit: 'm/s', typical: '900 – 2200' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '2000 – 2700' },
  ],
  conditions: {
    applies: [
      t('对称轴垂直的横向各向同性介质（VTI）', 'Transversely isotropic media with a vertical symmetry axis (VTI)'),
      t('波长显著大于层厚时的薄互层等效介质（Backus 平均）', 'Thinly layered media at wavelengths much larger than the layer thickness (Backus averaging)'),
      t('对称轴水平的情形（HTI）只需把坐标轴整体旋转 90°', 'The horizontal-axis case (HTI) follows by rotating the coordinate frame by 90°'),
    ],
    assumes: [
      t('介质均匀、线性弹性、无损', 'Homogeneous, linearly elastic and lossless'),
      t('对称轴取为 x₃ 轴（垂直方向）', 'The symmetry axis is taken as the x₃ (vertical) direction'),
      t('各向同性平面为水平的 x₁–x₂ 平面', 'The isotropy plane is the horizontal x₁–x₂ plane'),
    ],
    breaks: [
      t('存在两组正交裂隙组时为斜方（正交）各向异性，需要 9 个常数', 'Two orthogonal fracture sets give orthorhombic symmetry with 9 constants'),
      t('对称轴倾斜（TTI）时矩阵在地表坐标系里不再有这些零元', 'A tilted symmetry axis (TTI) destroys the zero pattern in the surface coordinate frame'),
      t('层厚与波长可比时必须按真实层状介质处理，不能用等效 VTI', 'When layer thickness is comparable to the wavelength, the true layered medium must be treated explicitly'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('TI 的定义：绕 x₃ 轴旋转任意角 φ 后 C 不变', 'Definition of TI: C is invariant under rotation by any angle φ about x₃'),
      latex: String.raw`C'_{ijkl}=Q_{ip}Q_{jq}Q_{kr}Q_{ls}C_{pqrs}=C_{ijkl},\qquad Q_{33}=1`,
      note: t('这是「横向各向同性」四个字的数学定义：有一个旋转对称轴（这里取垂直），垂直于它的平面内完全各向同性。', 'This is the mathematical definition of transverse isotropy: one rotational symmetry axis (taken vertical here), with complete isotropy in the plane perpendicular to it.'),
    },
    {
      n: 2,
      op: 'transform',
      title: t('先做镜像反射：指标 1 出现奇数次的分量全部为零', 'First apply a mirror reflection: all components with an odd number of index 1 vanish'),
      latex: String.raw`x_1\to-x_1\;\Longrightarrow\; C_{1112}=C_{1222}=C_{1231}=C_{1332}=\dots=0`,
      note: t('镜像不变性是最便宜的一步：一次反射就把所有含奇数个「1」的分量清零。', 'The mirror argument is the cheapest step: one reflection annihilates every component containing an odd number of index 1.'),
    },
    {
      n: 3,
      op: 'transform',
      title: t('再旋转 90°：水平与垂直方向互换，得到两组等式', 'Then rotate by 90°: horizontal and vertical directions swap, giving two sets of equalities'),
      latex: String.raw`x_1\to x_2,\ x_2\to -x_1\;\Longrightarrow\; C_{22}=C_{11},\quad C_{23}=C_{13},\quad C_{55}=C_{44}`,
      note: t('90° 旋转把 x₁ 轴变成 x₂ 轴，于是「沿 1」与「沿 2」的一切性质必须相同。', 'A 90° rotation carries the x₁ axis onto x₂, so every property "along 1" must equal its counterpart "along 2".'),
    },
    {
      n: 4,
      op: 'identity',
      title: t('再旋转 45°：推出 C₆₆ 与 C₁₁、C₁₂ 的关系', 'Then rotate by 45°: this fixes C₆₆ in terms of C₁₁ and C₁₂'),
      latex: String.raw`\hat{\mathbf{e}}'_1=\frac{1}{\sqrt{2}}\left(\hat{\mathbf{e}}_1+\hat{\mathbf{e}}_2\right)\;\Longrightarrow\; C'_{1111}=\frac{1}{2}C_{11}+C_{66}+\frac{1}{2}C_{12}`,
      note: t('这是最漂亮的一步：把 4 个指标都投到 45° 方向上，展开后只有一个未知量 C₆₆ 出现。', 'This is the nicest step: projecting all four indices onto the 45° direction leaves C₆₆ as the only unknown in the expansion.'),
    },
    {
      n: 5,
      op: 'algebra',
      title: t('令 C′₁₁₁₁ = C₁₁₁₁，解出 C₆₆', 'Set C′₁₁₁₁ = C₁₁₁₁ and solve for C₆₆'),
      latex: String.raw`C_{11}=\frac{1}{2}C_{11}+C_{66}+\frac{1}{2}C_{12}\;\Longrightarrow\; C_{66}=\frac{C_{11}-C_{12}}{2},\qquad C_{12}=C_{11}-2C_{66}`,
      note: t('所以 VTI 的 5 个自由度是 C₁₁、C₁₃、C₃₃、C₄₄、C₆₆；C₁₂ 不是独立的。', 'The five degrees of freedom of a VTI solid are therefore C₁₁, C₁₃, C₃₃, C₄₄ and C₆₆; C₁₂ is not independent.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('换成可测量的速度参数', 'Switch to measurable velocity parameters'),
      latex: String.raw`\alpha_0=\sqrt{\frac{C_{33}}{\rho}},\qquad \beta_0=\sqrt{\frac{C_{44}}{\rho}},\qquad \varepsilon=\frac{C_{11}-C_{33}}{2C_{33}},\qquad \gamma=\frac{C_{66}-C_{44}}{2C_{44}}`,
      note: t('α₀、β₀ 是垂直传播的 P、S 速度（测井与 VSP 直接给出）；ε 与 γ 则度量水平与垂直的速度差。', 'α₀ and β₀ are the vertically propagating P and S velocities (directly available from well logs and VSP), while ε and γ measure the horizontal-to-vertical velocity contrast.'),
    },
  ],
  links: {
    upstream: [{ id: 'voigt-notation-stiffness-matrix', note: t('VTI 矩阵是 6×6 矩阵的特例', 'the VTI matrix is a special case of the 6×6 matrix') }],
    downstream: [
      { id: 'thomsen-parameters', note: t('引入 ε、δ、γ 三参数', 'introduces ε, δ, γ') },
      { id: 'christoffel-equation', note: t('用 C_IJ 构造 Christoffel 矩阵', 'builds the Christoffel matrix from C_IJ') },
    ],
    seealso: [{ id: 'hookes-law-isotropic', note: t('各向同性极限', 'the isotropic limit') }],
  },
  refs: [
    { text: 'Backus (1962), Long-wave elastic anisotropy produced by horizontal layering, JGR 67' },
    { text: 'Thomsen (1986), Weak elastic anisotropy, Geophysics 51, 1954–1966' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.2' },
  ],
}

export default vtiElasticConstants
