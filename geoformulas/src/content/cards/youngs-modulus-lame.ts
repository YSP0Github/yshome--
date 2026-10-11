import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** youngs-modulus-lame */
const youngsModulusLame: FormulaCard = {
  id: 'youngs-modulus-lame',
  name: t('杨氏模量与 Lamé 常数的关系', "Young's Modulus in Terms of the Lamé Constants"),
  aliases: {
    zh: ['杨氏模量', '弹性模量 E', '单轴拉伸模量'],
    en: ["Young's modulus", 'elastic modulus E', 'uniaxial modulus'],
  },
  node: 'S1.3',
  tags: {
    math: ['MATH.LINALG'],
    method: ['METH.ROCK'],
    quantity: ['Q.MAT'],
    keywords: t('杨氏模量 E Lamé 常数 单轴拉伸 侧向自由 侧向约束 纵波模量 λ+2μ', 'Young modulus Lamé constants uniaxial extension laterally free laterally constrained P-wave modulus'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`E=\frac{\mu\left(3\lambda+2\mu\right)}{\lambda+\mu}`,
    variants: [
      { name: t('用 μ 与 ν（最简洁）', 'In μ and ν, the tidiest form'), latex: String.raw`E=2\mu(1+\nu)` },
      { name: t('用 K 与 μ', 'In K and μ'), latex: String.raw`E=\frac{9K\mu}{3K+\mu}` },
      { name: t('用 K 与 ν', 'In K and ν'), latex: String.raw`E=3K(1-2\nu)` },
      { name: t('单轴应变（侧向受限）时的等效模量', 'The constrained (uniaxial strain) modulus'), latex: String.raw`M=\lambda+2\mu=\frac{E(1-\nu)}{(1+\nu)(1-2\nu)}` },
    ],
  },
  meaning: t(
    '杨氏模量是实验室里最容易测的那个量：一根柱子单轴拉伸、侧向自由时的应力–应变比。它之所以比"波速用的模量"小，是因为侧向可以自由收缩——材料"躲"掉了部分阻力。地震波在无限介质中传播时侧向无法自由收缩，于是不用 E 而用 λ+2μ（P 波）或 μ（S 波）。搞清楚 E 与 λ+2μ 的区别，就搞清楚了为什么不能拿岩心测的 E 直接当波速模量用。',
    'Young’s modulus is the easiest quantity to measure in the lab: the stress–strain ratio of a bar pulled uniaxially with its sides free. It is smaller than the moduli that control wave speeds precisely because the sides may contract freely — the material dodges part of the load. Seismic waves in an unbounded medium cannot contract laterally, so they see λ+2μ (P) or μ (S) instead of E. Understanding this difference is why core-measured E cannot be plugged straight into a velocity formula.',
  ),
  symbols: [
    { sym: 'E', name: t('杨氏模量', "Young's modulus"), unit: 'Pa', typical: '砂岩 10–80 GPa' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.25' },
    { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa' },
    { sym: 'M', name: t('纵波模量 λ+2μ（单轴应变模量）', 'P-wave modulus λ+2μ (constrained modulus)'), unit: 'Pa', typical: '比 E 大约 20%–50%' },
    { sym: '\\varepsilon_{11}', name: t('轴向应变', 'axial strain'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [
      t('各向同性线弹性介质；单轴应力状态（侧向应力为零）', 'Isotropic linear elastic media under uniaxial stress (zero lateral stress)'),
    ],
    assumes: [
      t('小应变、均匀变形、无初始应力', 'Small strain, uniform deformation, no initial stress'),
      t('讨论 M 时改为单轴应变状态（侧向应变被约束为零）', 'For M the state switches to uniaxial strain (lateral strain constrained to zero)'),
    ],
    breaks: [
      t('岩石含各向异性裂隙时单轴拉伸的 E 随方向变', 'With aligned cracks, E becomes direction dependent'),
      t('多孔岩石排水/不排水条件下的 E 不同', 'Drained and undrained E differ in porous rock'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设定单轴应力状态', 'Set up a uniaxial stress state'),
      latex: String.raw`\sigma_{11}=\sigma,\qquad \sigma_{22}=\sigma_{33}=\sigma_{12}=\sigma_{13}=\sigma_{23}=0`,
      note: t('侧向自由，所以侧向应力为零 —— 这正是 E 的定义条件。', 'The sides are free, so lateral stresses vanish — exactly the condition defining E.') },
    { n: 2, op: 'substitute', title: t('用柔度形式把应变写成应力的函数', 'Write strain in terms of stress using the compliance form'),
      latex: String.raw`\varepsilon_{ij}=\frac{1}{2\mu}\sigma_{ij}-\frac{\lambda}{2\mu\left(3\lambda+2\mu\right)}\sigma_{kk}\,\delta_{ij}` },
    { n: 3, op: 'algebra', title: t('代入 σ_kk = σ 得轴向应变', 'Insert σ_kk = σ to get the axial strain'),
      latex: String.raw`\varepsilon_{11}=\frac{\sigma}{2\mu}-\frac{\lambda\,\sigma}{2\mu\left(3\lambda+2\mu\right)}=\frac{\sigma\left(\lambda+\mu\right)}{\mu\left(3\lambda+2\mu\right)}` },
    { n: 4, op: 'algebra', title: t('按定义 E = σ/ε_11', 'By definition E = σ/ε_11'),
      latex: String.raw`E=\frac{\sigma}{\varepsilon_{11}}=\frac{\mu\left(3\lambda+2\mu\right)}{\lambda+\mu}` },
    { n: 5, op: 'substitute', title: t('换成 μ、ν 化简', 'Simplify with μ and ν'),
      latex: String.raw`\lambda=\frac{2\mu\nu}{1-2\nu}\;\Rightarrow\; E=\frac{\mu\left(\frac{6\mu\nu}{1-2\nu}+2\mu\right)}{\frac{\mu}{1-2\nu}}=2\mu\left(1+\nu\right)` },
    { n: 6, op: 'result', title: t('顺手得到侧向应变与泊松比', 'Lateral strain and Poisson’s ratio fall out on the way'),
      latex: String.raw`\varepsilon_{22}=-\frac{\lambda\,\sigma}{2\mu\left(3\lambda+2\mu\right)}=-\nu\,\varepsilon_{11},\qquad \nu=\frac{\lambda}{2\left(\lambda+\mu\right)}` },
  ],
  viz: [
    {
      id: 'e-vs-nu',
      level: 'V1',
      title: t('侧向自由与侧向约束：E 与 λ+2μ 的差距', 'Free versus constrained sides: E against λ+2μ'),
      xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
      ylabel: t('模量 (GPa)', 'modulus (GPa)'),
      controls: [
        { id: 'mu', label: t('剪切模量 μ', 'shear modulus μ'), min: 5, max: 120, step: 1, value: 40, unit: 'GPa' },
      ],
      xRange: [0, 0.45],
      note: t('两条曲线的间距就是"侧向能不能自由收缩"的价值：ν = 0.25 时 E = 2.5μ 而 λ+2μ = 3μ，差 20%。ν → 0.5 时侧向几乎动不了，约束模量趋于无穷，而 E 只到 3μ。', 'The gap between the curves is the price of lateral freedom: at ν = 0.25, E = 2.5μ while λ+2μ = 3μ, a 20% difference. As ν → 0.5 the sides can barely move, so the constrained modulus diverges while E merely reaches 3μ.'),
      compute: (p) => {
        const mu = p['mu']
        const ePts: Array<[number, number]> = []
        const mPts: Array<[number, number]> = []
        const muPts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const nu = (i / 180) * 0.45
          const den = 1 - 2 * nu
          ePts.push([nu, 2 * mu * (1 + nu)])
          mPts.push([nu, (2 * mu * (1 - nu)) / den])
          muPts.push([nu, mu])
        }
        return [
          { label: t('E = 2μ(1+ν)（侧向自由）', 'E = 2μ(1+ν), sides free'), color: '#185FA5', points: ePts },
          { label: t('λ+2μ（侧向约束，P 波模量）', 'λ+2μ, sides constrained (P-wave modulus)'), color: '#BA7517', points: mPts },
          { label: t('μ（S 波模量）', 'μ (S-wave modulus)'), color: '#B4B2A9', dash: true, points: muPts },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'isotropic-hooke-law', note: t('柔度矩阵给出 ε_11 与 σ 的关系', 'the compliance matrix relates ε_11 to σ') },
      { id: 'bulk-modulus-lame' },
    ],
    downstream: [
      { id: 'poissons-ratio-lame' },
      { id: 'elastic-moduli-conversions' },
    ],
    seealso: [
      { id: 'p-wave-velocity-formula', note: t('P 波用 λ+2μ 而不是 E', 'P waves use λ+2μ, not E') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook, 2nd ed., §1' },
  ],
}

export default youngsModulusLame
