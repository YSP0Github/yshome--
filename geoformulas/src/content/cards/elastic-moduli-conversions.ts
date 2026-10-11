import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** elastic-moduli-conversions */
const elasticModuliConversions: FormulaCard = {
  id: 'elastic-moduli-conversions',
  name: t('五个弹性常数的互换表', 'Conversion Table for the Five Elastic Constants'),
  aliases: {
    zh: ['模量互换', '弹性常数换算', 'E ν K μ λ 互化'],
    en: ['modulus conversion', 'elastic constant interconversion', 'E nu K mu lambda table'],
  },
  node: 'S1.3',
  tags: {
    math: ['MATH.LINALG'],
    method: ['METH.ROCK', 'METH.STRUCT'],
    quantity: ['Q.MAT'],
    keywords: t('弹性常数互换 杨氏模量 泊松比 体积模量 剪切模量 Lamé 常数 两个独立常数 岩石物理', 'elastic moduli conversion Young Poisson bulk shear Lamé two independent constants rock physics'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\begin{aligned} K&=\lambda+\frac{2}{3}\mu &&=\frac{E}{3(1-2\nu)} &&=\frac{\mu E}{3(3\mu-E)}\\ E&=\frac{\mu(3\lambda+2\mu)}{\lambda+\mu} &&=2\mu(1+\nu) &&=\frac{9K\mu}{3K+\mu}\\ \mu&=\frac{E}{2(1+\nu)} &&=\frac{3}{2}\left(K-\lambda\right) &&=\frac{3K(1-2\nu)}{2(1+\nu)}\\ \lambda&=\frac{2\mu\nu}{1-2\nu} &&=\frac{E\nu}{(1+\nu)(1-2\nu)} &&=K-\frac{2}{3}\mu\\ \nu&=\frac{\lambda}{2(\lambda+\mu)} &&=\frac{3K-2\mu}{2(3K+\mu)} &&=\frac{E}{2\mu}-1 \end{aligned}`,
    variants: [
      { name: t('以 (λ, μ) 为基：全部写出', 'With (λ, μ) as the base pair'), latex: String.raw`K=\lambda+\frac{2}{3}\mu,\qquad E=\frac{\mu(3\lambda+2\mu)}{\lambda+\mu},\qquad \nu=\frac{\lambda}{2(\lambda+\mu)}` },
      { name: t('以 (K, μ) 为基：地震学最方便', 'With (K, μ) as the base pair, the seismological favourite'), latex: String.raw`E=\frac{9K\mu}{3K+\mu},\qquad \nu=\frac{3K-2\mu}{2(3K+\mu)},\qquad \lambda=K-\frac{2}{3}\mu` },
      { name: t('以 (α, β, ρ) 为基：地震观测直接可用', 'With (α, β, ρ), directly usable from seismic observation'), latex: String.raw`\mu=\rho\beta^{2},\quad \lambda=\rho\left(\alpha^{2}-2\beta^{2}\right),\quad K=\rho\left(\alpha^{2}-\frac{4}{3}\beta^{2}\right),\quad E=\frac{\rho\beta^{2}\left(3\alpha^{2}-4\beta^{2}\right)}{\alpha^{2}-\beta^{2}}` },
      { name: t('关键提醒：只有两个是独立的', 'The key caveat: only two are independent'), latex: String.raw`\text{自由度}=2:\quad \left(E,\nu\right)\ \text{或}\ \left(K,\mu\right)\ \text{或}\ \left(\lambda,\mu\right)` },
    ],
  },
  meaning: t(
    'E、ν、K、μ、λ 五个量里只有两个是独立的，其余三个都是它们的函数。这张表存在的理由很实际：实验室给你 E 和 ν，测井给你 ρ 和速度，地震反演给你 λρ 和 μρ，而波速公式要的是 λ 和 μ —— 没有这张表，三个领域的数据根本对不上话。注意所有含 (1−2ν) 的式子都在 ν → 0.5 时发散，那正是不可压缩的极限。',
    'Only two of E, ν, K, μ and λ are independent; the other three are functions of them. The table exists for a very practical reason: the lab hands you E and ν, well logs hand you ρ and velocities, seismic inversion hands you λρ and μρ, while the velocity formula wants λ and μ. Without this table, these three worlds cannot talk to each other. Note that every expression containing (1−2ν) diverges as ν → 0.5, the incompressible limit.',
  ),
  symbols: [
    { sym: 'E', name: t('杨氏模量', "Young's modulus"), unit: 'Pa', typical: '10⁹ – 10¹¹' },
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.05 – 0.45' },
    { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa', typical: '10⁹ – 10¹¹' },
    { sym: '\\mu', name: t('剪切模量（也记作 G）', 'shear modulus (also G)'), unit: 'Pa', typical: '10⁹ – 10¹¹' },
    { sym: '\\lambda', name: t('Lamé 第一常数', 'first Lamé constant'), unit: 'Pa', typical: '10⁹ – 10¹¹' },
    { sym: '\\alpha,\\beta', name: t('P 波与 S 波速度', 'P- and S-wave velocities'), unit: 'm/s' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '1800 – 3300' },
  ],
  conditions: {
    applies: [
      t('各向同性线弹性介质；五个常数任取两个独立者即可互化', 'Isotropic linear elastic media; any two independent constants determine the rest'),
      t('量纲检查：E、K、μ、λ 都是 Pa，ν 无量纲', 'Dimensional check: E, K, μ, λ are all in Pa; ν is dimensionless'),
    ],
    assumes: [
      t('同一频率、同一温压、同一饱和状态下的常数（静态与超声值不同）', 'Constants measured at the same frequency, pressure, temperature and saturation (static and ultrasonic values differ)'),
    ],
    breaks: [
      t('μ → 0（流体）时 E → 0 且 ν → 0.5，多式退化', 'As μ → 0 (fluids), E → 0 and ν → 0.5; several formulas degenerate'),
      t('各向异性介质不存在这样一张五元表', 'No such five-way table exists for anisotropic media'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('先认定只有两个独立常数', 'First establish that only two constants are independent'),
      latex: String.raw`\sigma_{ij}=\lambda\,\varepsilon_{kk}\delta_{ij}+2\mu\,\varepsilon_{ij}\;\Rightarrow\; \text{全部弹性响应由}\ \lambda,\mu\ \text{决定}`,
      note: t('各向同性把 21 个常数压到 2 个，所以其余模量必然是 λ、μ 的函数。', 'Isotropy compresses 21 constants into 2, so every other modulus must be a function of λ and μ.') },
    { n: 2, op: 'physics', title: t('三个模量分别由三个标准实验定义', 'Three moduli, three canonical experiments'),
      latex: String.raw`K:\ \text{静水压};\qquad \mu:\ \text{纯剪切};\qquad E,\nu:\ \text{单轴拉伸}` },
    { n: 3, op: 'substitute', title: t('静水压给出 K(λ, μ)', 'Hydrostatic loading gives K(λ, μ)'),
      latex: String.raw`\sigma_{kk}=\left(3\lambda+2\mu\right)\varepsilon_{kk}\;\Rightarrow\; K=\lambda+\frac{2}{3}\mu` },
    { n: 4, op: 'substitute', title: t('单轴拉伸给出 E(λ, μ) 与 ν(λ, μ)', 'Uniaxial extension gives E(λ, μ) and ν(λ, μ)'),
      latex: String.raw`E=\frac{\mu(3\lambda+2\mu)}{\lambda+\mu},\qquad \nu=\frac{\lambda}{2(\lambda+\mu)}` },
    { n: 5, op: 'algebra', title: t('把 (λ, μ) 反解成 (K, μ)', 'Invert (λ, μ) into (K, μ)'),
      latex: String.raw`\lambda=K-\frac{2}{3}\mu,\qquad \text{代入上式即得}\ E=\frac{9K\mu}{3K+\mu},\quad \nu=\frac{3K-2\mu}{2(3K+\mu)}` },
    { n: 6, op: 'result', title: t('再换成 (E, ν) 作基并补上地震学形式', 'Switch to the (E, ν) base and add the seismological form'),
      latex: String.raw`\mu=\frac{E}{2(1+\nu)},\quad \lambda=\frac{E\nu}{(1+\nu)(1-2\nu)},\quad \mu=\rho\beta^{2},\quad \lambda=\rho\left(\alpha^{2}-2\beta^{2}\right)`,
      note: t('最后两个式子把整张表直接接到地震观测上：有了速度和密度，五个常数全都有。', 'The last two expressions connect the whole table to seismic observation: given velocities and density, all five constants follow.') },
  ],
  viz: [
    {
      id: 'moduli-vs-nu',
      level: 'V1',
      title: t('固定剪切模量时各模量随泊松比的变化', 'All moduli versus Poisson’s ratio at fixed shear modulus'),
      xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
      ylabel: t('模量 (GPa)', 'modulus (GPa)'),
      controls: [
        { id: 'mu', label: t('剪切模量 μ', 'shear modulus μ'), min: 5, max: 120, step: 1, value: 40, unit: 'GPa' },
      ],
      xRange: [0, 0.45],
      note: t('把 μ 钉死当作标尺，就能看清其余模量如何随 ν 发散：E 只从 2μ 涨到 2.9μ，而 K 与 λ 在 ν → 0.5 时冲向无穷。ν = 0.25（λ = μ）那条竖线是地壳岩石的常态。', 'Pinning μ as a ruler shows how the others diverge with ν: E merely rises from 2μ to 2.9μ, whereas K and λ run off to infinity as ν → 0.5. The vertical line at ν = 0.25 (λ = μ) is the normal state of crustal rock.'),
      compute: (p) => {
        const mu = p['mu']
        const kPts: Array<[number, number]> = []
        const ePts: Array<[number, number]> = []
        const lamPts: Array<[number, number]> = []
        const muPts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const nu = (i / 180) * 0.45
          const den = 1 - 2 * nu
          kPts.push([nu, (2 * mu * (1 + nu)) / (3 * den)])
          ePts.push([nu, 2 * mu * (1 + nu)])
          lamPts.push([nu, (2 * mu * nu) / den])
          muPts.push([nu, mu])
        }
        return [
          { label: t('体积模量 K', 'bulk modulus K'), color: '#185FA5', points: kPts },
          { label: t('杨氏模量 E', "Young's modulus E"), color: '#0F6E56', points: ePts },
          { label: t('Lamé 常数 λ', 'Lamé constant λ'), color: '#BA7517', points: lamPts },
          { label: t('剪切模量 μ（固定）', 'shear modulus μ (fixed)'), color: '#B4B2A9', dash: true, points: muPts },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'isotropic-hooke-law' },
      { id: 'hookes-law-isotropic' },
      { id: 'bulk-modulus-lame' },
      { id: 'youngs-modulus-lame' },
      { id: 'poissons-ratio-lame' },
    ],
    downstream: [
      { id: 'ps-wave-velocities', note: t('换成 α、β 才能进入地震学', 'convert to α, β to enter seismology') },
      { id: 'shuey-approximation', note: t('AVO 用的是 λρ 与 μρ', 'AVO works with λρ and μρ') },
    ],
    seealso: [
      { id: 'poisson-from-velocities' },
    ],
  },
  refs: [
    { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook, 2nd ed., Table 1.1' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
  ],
}

export default elasticModuliConversions
