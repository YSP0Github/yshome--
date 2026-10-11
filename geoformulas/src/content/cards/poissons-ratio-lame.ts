import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** poissons-ratio-lame */
const poissonsRatioLame: FormulaCard = {
  id: 'poissons-ratio-lame',
  name: t('泊松比与 Lamé 常数的关系', "Poisson's Ratio in Terms of the Lamé Constants"),
  aliases: {
    zh: ['泊松比定义', '横向变形系数', 'ν = λ/2(λ+μ)'],
    en: ["Poisson's ratio", 'lateral contraction ratio', 'nu = lambda / 2(lambda+mu)'],
  },
  node: 'S1.3',
  tags: {
    math: ['MATH.LINALG'],
    method: ['METH.ROCK'],
    quantity: ['Q.MAT'],
    keywords: t('泊松比 ν Lamé 常数 横向收缩 不可压缩 含气砂岩 泊松固体 取值范围', 'Poisson ratio Lamé constants lateral contraction incompressible gas sand Poisson solid admissible range'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\nu=\frac{\lambda}{2\left(\lambda+\mu\right)}`,
    variants: [
      { name: t('几何定义（单轴拉伸）', 'Geometric definition (uniaxial extension)'), latex: String.raw`\nu=-\frac{\varepsilon_{22}}{\varepsilon_{11}}=-\frac{\varepsilon_{33}}{\varepsilon_{11}}` },
      { name: t('用体积模量与剪切模量', 'In bulk and shear modulus'), latex: String.raw`\nu=\frac{3K-2\mu}{2\left(3K+\mu\right)}` },
      { name: t('反解 λ（地震学里最常用）', 'Inverted for λ, the seismological favourite'), latex: String.raw`\lambda=\frac{2\mu\nu}{1-2\nu},\qquad \lambda+\mu=\frac{\mu}{1-2\nu}` },
      { name: t('由速度比反算', 'Back-solved from the velocity ratio'), latex: String.raw`\nu=\frac{\alpha^{2}-2\beta^{2}}{2\left(\alpha^{2}-\beta^{2}\right)}` },
    ],
  },
  meaning: t(
    '泊松比描述"你把它拉长时它侧向缩多少"，是一个纯几何的、无量纲的量，也因此成为跨尺度对比岩石的最佳语言：实验室岩心、测井、地震反演都能给出 ν，因而可以直接互校。ν = 0.25 叫泊松固体（λ = μ），是地壳岩石的典型值；ν → 0.5 是不可压缩（流体）；含气砂岩 ν 可低到 0.1，AVO 找气正是盯住这个异常。',
    'Poisson’s ratio describes how much a body contracts sideways when you stretch it lengthwise — a purely geometric, dimensionless number, which makes it the best common language for comparing rocks across scales: core measurements, well logs and seismic inversion all yield ν and can be cross-checked directly. ν = 0.25 is the Poisson solid (λ = μ), typical of crustal rock; ν → 0.5 means incompressible (fluids); gas sands can reach ν ≈ 0.1, and AVO hydrocarbon detection hunts exactly this anomaly.',
  ),
  symbols: [
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '石英 0.07；砂岩 0.15–0.30；灰岩 0.28；流体 0.5' },
    { sym: '\\lambda', name: t('Lamé 第一常数', 'first Lamé constant'), unit: 'Pa' },
    { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa' },
    { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa' },
    { sym: '\\varepsilon_{11}', name: t('轴向应变', 'axial strain'), unit: '', dimension: '无量纲' },
    { sym: '\\varepsilon_{22}', name: t('侧向应变', 'lateral strain'), unit: '', dimension: '无量纲' },
    { sym: '\\alpha,\\beta', name: t('P 波与 S 波速度', 'P- and S-wave velocities'), unit: 'm/s' },
  ],
  conditions: {
    applies: [
      t('各向同性线弹性介质；单轴应力状态', 'Isotropic linear elastic media under uniaxial stress'),
      t('由应变能正定性推出 −1 < ν < 1/2', 'Positive strain energy implies −1 < ν < 1/2'),
    ],
    assumes: [
      t('拉长时侧向收缩（ν > 0），绝大多数天然材料如此', 'Extension causes lateral contraction (ν > 0), true of nearly all natural materials'),
      t('各向同性；各向异性材料不同方向有不同 ν', 'Isotropy; anisotropic materials have direction-dependent ν'),
    ],
    breaks: [
      t('ν = 0.5 时公式 λ = 2μν/(1−2ν) 发散（流体 μ = 0）', 'At ν = 0.5 the inversion λ = 2μν/(1−2ν) diverges (fluids have μ = 0)'),
      t('负泊松比材料（拉胀材料）天然岩石中罕见但确实存在', 'Auxetic (negative-ν) materials are rare in natural rock but do exist'),
      t('裂隙岩石在饱和流体替换时 ν 变化剧烈，需 Gassmann 理论', 'Fluid substitution in cracked rock changes ν strongly and needs Gassmann theory'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('单轴拉伸并定义泊松比', 'Uniaxial extension and the definition'),
      latex: String.raw`\sigma_{11}=\sigma,\quad \sigma_{kk}=\sigma,\qquad \nu\equiv-\frac{\varepsilon_{22}}{\varepsilon_{11}}`,
      note: t('负号保证拉长（ε_11 > 0）收缩（ε_22 < 0）时 ν 为正。', 'The minus sign keeps ν positive when stretching (ε_11 > 0) causes contraction (ε_22 < 0).') },
    { n: 2, op: 'substitute', title: t('用柔度形式写出两个侧向/轴向应变', 'Write both strains with the compliance form'),
      latex: String.raw`\varepsilon_{11}=\frac{\sigma}{2\mu}-\frac{\lambda\,\sigma}{2\mu\left(3\lambda+2\mu\right)},\qquad \varepsilon_{22}=0-\frac{\lambda\,\sigma}{2\mu\left(3\lambda+2\mu\right)}` },
    { n: 3, op: 'algebra', title: t('取比值，σ 与分母自动约掉', 'Take the ratio; σ and the denominator cancel'),
      latex: String.raw`\nu=-\frac{\varepsilon_{22}}{\varepsilon_{11}}=\frac{\dfrac{\lambda\,\sigma}{2\mu\left(3\lambda+2\mu\right)}}{\dfrac{\sigma\left(\lambda+\mu\right)}{\mu\left(3\lambda+2\mu\right)}}=\frac{\lambda}{2\left(\lambda+\mu\right)}` },
    { n: 4, op: 'substitute', title: t('换成 K、μ 表达', 'Rewrite in terms of K and μ'),
      latex: String.raw`\lambda=K-\frac{2}{3}\mu\;\Rightarrow\; \nu=\frac{K-\frac{2}{3}\mu}{2\left(K+\frac{1}{3}\mu\right)}=\frac{3K-2\mu}{2\left(3K+\mu\right)}` },
    { n: 5, op: 'identity', title: t('几个标志性取值', 'A few landmark values'),
      latex: String.raw`\nu=0\Rightarrow\lambda=0;\;\; \nu=\frac14\Rightarrow\lambda=\mu\ \text{(泊松固体)};\;\; \nu\to\frac12\Rightarrow K\to\infty` },
    { n: 6, op: 'result', title: t('由应变能正定性给出取值范围', 'Positive strain energy bounds the admissible range'),
      latex: String.raw`W>0\;\Rightarrow\; \mu>0,\; K>0\;\Rightarrow\; -1<\nu<\frac{1}{2}` },
  ],
  links: {
    upstream: [
      { id: 'isotropic-hooke-law' },
      { id: 'bulk-modulus-lame' },
      { id: 'youngs-modulus-lame', note: t('E = 2μ(1+ν) 是同一推导的副产品', 'E = 2μ(1+ν) is a by-product of the same derivation') },
    ],
    downstream: [
      { id: 'velocity-ratio-poisson', note: t('ν 直接决定 α/β', 'ν sets α/β directly') },
      { id: 'elastic-moduli-conversions' },
      { id: 'shuey-approximation', note: t('AVO 梯度项主要由 ν 的对比驱动', 'the AVO gradient is driven mainly by the ν contrast') },
    ],
    seealso: [
      { id: 'poisson-from-velocities' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook, 2nd ed., §1' },
  ],
}

export default poissonsRatioLame
