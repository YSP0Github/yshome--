import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** isotropic-hooke-law */
const isotropicHookeLaw: FormulaCard = {
  id: 'isotropic-hooke-law',
  name: t('各向同性 Hooke 定律的矩阵形式', "Matrix Form of Hooke's Law for Isotropic Media"),
  aliases: {
    zh: ['刚度矩阵', '柔度矩阵', 'Voigt 矩阵', '各向同性本构矩阵'],
    en: ['stiffness matrix', 'compliance matrix', 'Voigt matrix', 'isotropic constitutive matrix'],
  },
  node: 'S1.3',
  tags: {
    math: ['MATH.LINALG'],
    method: ['METH.ROCK', 'METH.STRUCT'],
    quantity: ['Q.TENSOR', 'Q.MAT'],
    keywords: t('刚度矩阵 柔度矩阵 Voigt 6×6 各向同性 λ μ E ν 体积响应 偏量响应', 'stiffness matrix compliance matrix Voigt 6x6 isotropic lambda mu Young Poisson volumetric deviatoric'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\begin{bmatrix}\sigma_{11}\\ \sigma_{22}\\ \sigma_{33}\\ \sigma_{23}\\ \sigma_{13}\\ \sigma_{12}\end{bmatrix}=\begin{bmatrix}\lambda+2\mu&\lambda&\lambda&0&0&0\\ \lambda&\lambda+2\mu&\lambda&0&0&0\\ \lambda&\lambda&\lambda+2\mu&0&0&0\\ 0&0&0&\mu&0&0\\ 0&0&0&0&\mu&0\\ 0&0&0&0&0&\mu\end{bmatrix}\begin{bmatrix}\varepsilon_{11}\\ \varepsilon_{22}\\ \varepsilon_{33}\\ 2\varepsilon_{23}\\ 2\varepsilon_{13}\\ 2\varepsilon_{12}\end{bmatrix}`,
    variants: [
      { name: t('张量形式（同一条定律的紧凑写法）', 'Tensor form (the same law, compactly)'), latex: String.raw`\sigma_{ij}=\lambda\,\delta_{ij}\,\varepsilon_{kk}+2\mu\,\varepsilon_{ij}` },
      { name: t('柔度矩阵：由应力求应变', 'Compliance matrix: strain from stress'), latex: String.raw`\begin{bmatrix}\varepsilon_{11}\\ \varepsilon_{22}\\ \varepsilon_{33}\\ 2\varepsilon_{23}\\ 2\varepsilon_{13}\\ 2\varepsilon_{12}\end{bmatrix}=\begin{bmatrix}\frac{1}{E}&-\frac{\nu}{E}&-\frac{\nu}{E}&0&0&0\\ -\frac{\nu}{E}&\frac{1}{E}&-\frac{\nu}{E}&0&0&0\\ -\frac{\nu}{E}&-\frac{\nu}{E}&\frac{1}{E}&0&0&0\\ 0&0&0&\frac{1}{\mu}&0&0\\ 0&0&0&0&\frac{1}{\mu}&0\\ 0&0&0&0&0&\frac{1}{\mu}\end{bmatrix}\begin{bmatrix}\sigma_{11}\\ \sigma_{22}\\ \sigma_{33}\\ \sigma_{23}\\ \sigma_{13}\\ \sigma_{12}\end{bmatrix}` },
      { name: t('体积响应与偏量响应彻底分离', 'Volumetric and deviatoric responses separate cleanly'), latex: String.raw`\sigma_{kk}=3K\,\varepsilon_{kk},\qquad \sigma'_{ij}=2\mu\,\varepsilon'_{ij}` },
      { name: t('剪切行用工程常数写出', 'Shear rows in engineering constants'), latex: String.raw`\frac{1}{\mu}=\frac{2(1+\nu)}{E}` },
    ],
  },
  meaning: t(
    '把各向同性 Hooke 定律摊开成 6×6 矩阵，能一眼看出两件事：正应力之间靠 λ 互相"牵连"（挤压一个方向会带动另外两个方向），而剪切行是干净的 μ、和正应力完全不耦合 —— 这正是 P 波与 S 波可以分开处理的矩阵层面原因。矩阵里只有 λ 与 μ 两个数，说明各向同性岩石的全部弹性信息就是这两个数。',
    'Laying isotropic Hooke’s law out as a 6×6 matrix reveals two things at a glance: normal stresses are coupled to each other through λ (squeezing one direction drags the other two along), while the shear rows are cleanly μ and completely decoupled from normal stress — the matrix-level reason why P and S waves can be treated separately. Only two numbers appear, λ and μ: all elastic information about an isotropic rock.',
  ),
  symbols: [
    { sym: '\\mathbf{C}', name: t('6×6 刚度矩阵（Voigt 记法）', '6×6 stiffness matrix (Voigt notation)'), unit: 'Pa' },
    { sym: '\\mathbf{S}', name: t('6×6 柔度矩阵，S = C⁻¹', '6×6 compliance matrix, S = C⁻¹'), unit: 'Pa⁻¹' },
    { sym: '\\lambda', name: t('Lamé 第一常数（矩阵的非对角元）', 'first Lamé constant (the off-diagonal entries)'), unit: 'Pa', typical: '10¹⁰' },
    { sym: '\\mu', name: t('剪切模量（矩阵剪切行的对角元）', 'shear modulus (the shear diagonal entries)'), unit: 'Pa', typical: '10¹⁰' },
    { sym: 'K', name: t('体积模量 K = λ + 2μ/3', 'bulk modulus K = λ + 2μ/3'), unit: 'Pa' },
    { sym: "\\sigma'_{ij}", name: t('偏应力张量 σ_ij − (1/3)σ_kk δ_ij', 'deviatoric stress σ_ij − (1/3)σ_kk δ_ij'), unit: 'Pa' },
    { sym: "\\varepsilon'_{ij}", name: t('偏应变张量', 'deviatoric strain tensor'), unit: '', dimension: '无量纲' },
    { sym: 'E,\\nu', name: t('杨氏模量与泊松比', "Young's modulus and Poisson's ratio"), unit: 'Pa / 无量纲' },
  ],
  conditions: {
    applies: [
      t('均匀各向同性线弹性介质；本卡是 hookes-law-isotropic 的矩阵展开', 'Homogeneous, isotropic, linearly elastic media; this card is the matrix expansion of hookes-law-isotropic'),
    ],
    assumes: [
      t('Voigt 记法中剪切分量按工程剪应变 2ε_ij 排列', 'In Voigt notation the shear slots hold engineering shear strain 2ε_ij'),
      t('小应变，叠加原理成立', 'Small strains, so superposition holds'),
    ],
    breaks: [
      t('各向异性：矩阵不再只有两个独立常数，甚至不再块对角', 'Anisotropy: more than two independent constants and the matrix is no longer block-diagonal'),
      t('大变形或非线性岩石（如近破裂带）', 'Large deformation or non-linear rock, e.g. near rupture zones'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从各向同性张量公式出发', 'Start from the isotropic tensor form'),
      latex: String.raw`\sigma_{ij}=\lambda\,\delta_{ij}\,\varepsilon_{kk}+2\mu\,\varepsilon_{ij}`,
      note: t('δ_ij 决定哪些分量被 λ 牵连，δ_ij 为零的地方只剩 2μ ε_ij。', 'The Kronecker delta decides which components are coupled by λ; where δ_ij vanishes only 2μ ε_ij remains.') },
    { n: 2, op: 'substitute', title: t('写出对角元（i = j）', 'Write out the diagonal entries (i = j)'),
      latex: String.raw`\sigma_{11}=\lambda\left(\varepsilon_{11}+\varepsilon_{22}+\varepsilon_{33}\right)+2\mu\,\varepsilon_{11}=\left(\lambda+2\mu\right)\varepsilon_{11}+\lambda\,\varepsilon_{22}+\lambda\,\varepsilon_{33}` },
    { n: 3, op: 'substitute', title: t('写出非对角元（i ≠ j）', 'Write out the off-diagonal entries (i ≠ j)'),
      latex: String.raw`\sigma_{12}=2\mu\,\varepsilon_{12}=\mu\left(2\varepsilon_{12}\right)=\mu\,\gamma_{12}`,
      note: t('非对角元不含 λ：纯剪切不产生体积变化，所以与 λ 无关。', 'No λ appears off the diagonal: pure shear changes no volume, so λ is irrelevant to it.') },
    { n: 4, op: 'algebra', title: t('按顺序排成 6 维向量', 'Arrange the six independent components into a vector'),
      latex: String.raw`\boldsymbol{\sigma}=\left(\sigma_{11},\sigma_{22},\sigma_{33},\sigma_{23},\sigma_{13},\sigma_{12}\right)^{\mathrm{T}},\qquad \boldsymbol{\varepsilon}=\left(\varepsilon_{11},\varepsilon_{22},\varepsilon_{33},\gamma_{23},\gamma_{13},\gamma_{12}\right)^{\mathrm{T}}` },
    { n: 5, op: 'identity', title: t('取迹得到体积响应', 'Take the trace for the volumetric response'),
      latex: String.raw`\sigma_{kk}=\left(3\lambda+2\mu\right)\varepsilon_{kk}=3K\,\varepsilon_{kk},\qquad K=\lambda+\frac{2}{3}\mu`,
      note: t('矩阵左上角 3×3 块描述体积，右下角 3×3 块描述形状，两者互不干扰。', 'The upper-left 3×3 block describes volume, the lower-right block describes shape, and they never talk to each other.') },
    { n: 6, op: 'result', title: t('求逆即得柔度矩阵', 'Invert to obtain the compliance matrix'),
      latex: String.raw`\mathbf{S}=\mathbf{C}^{-1}:\quad \frac{1}{E}=\frac{\lambda+\mu}{\mu(3\lambda+2\mu)},\qquad -\frac{\nu}{E}=-\frac{\lambda}{2\mu(3\lambda+2\mu)},\qquad \frac{1}{\mu}=\frac{2(1+\nu)}{E}` },
  ],
  links: {
    upstream: [
      { id: 'generalized-hooke-law', note: t('各向同性时 C_ijkl 的具体取值', 'the specific C_ijkl for isotropy') },
      { id: 'strain-tensor' },
    ],
    downstream: [
      { id: 'elastic-moduli-conversions', note: t('矩阵元素与 E、ν、K 的互换', 'converting matrix entries to E, ν, K') },
      { id: 'bulk-modulus-lame' },
      { id: 'navier-equation' },
    ],
    seealso: [
      { id: 'hookes-law-isotropic' },
      { id: 'strain-energy-density' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
  ],
}

export default isotropicHookeLaw
