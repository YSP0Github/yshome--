import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** p-wave-velocity-formula */
const pWaveVelocityFormula: FormulaCard = {
  id: 'p-wave-velocity-formula',
  name: t('P 波速度的等价表达式族', 'The Family of Equivalent Expressions for P-Wave Velocity'),
  aliases: {
    zh: ['P 波速度公式', '纵波速度', 'α = √((λ+2μ)/ρ)'],
    en: ['P-wave velocity formula', 'compressional velocity', 'alpha from Lamé constants'],
  },
  node: 'S1.5',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.ROCK', 'METH.STRUCT'],
    quantity: ['Q.VEL', 'Q.MAT'],
    keywords: t('P 波速度 纵波模量 λ+2μ 体积模量 细杆速度 侧向约束 泊松比 密度', 'P-wave velocity P-wave modulus bulk modulus rod velocity lateral constraint Poisson ratio density'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\alpha=\sqrt{\frac{\lambda+2\mu}{\rho}}`,
    variants: [
      { name: t('用体积模量与剪切模量', 'In bulk and shear modulus'), latex: String.raw`\alpha=\sqrt{\frac{K+\frac{4}{3}\mu}{\rho}}` },
      { name: t('用杨氏模量与泊松比', "In Young's modulus and Poisson's ratio"), latex: String.raw`\alpha=\sqrt{\frac{E\left(1-\nu\right)}{\rho\left(1+\nu\right)\left(1-2\nu\right)}}` },
      { name: t('用 μ 与 ν（最省事）', 'In μ and ν, the tidiest'), latex: String.raw`\alpha=\sqrt{\frac{2\mu\left(1-\nu\right)}{\rho\left(1-2\nu\right)}}=\beta\sqrt{\frac{2\left(1-\nu\right)}{1-2\nu}}` },
      { name: t('细杆（侧向自由）中的纵波速度，注意与 α 不同', 'Longitudinal speed in a thin rod (sides free), note it differs from α'), latex: String.raw`c_{\text{rod}}=\sqrt{\frac{E}{\rho}}=\sqrt{\frac{2\mu\left(1+\nu\right)}{\rho}}` },
    ],
  },
  meaning: t(
    'P 波速度由"纵波模量 λ+2μ"与密度决定。它之所以大于细杆里的 √(E/ρ)，是因为无限介质中的平面波侧向无法自由收缩——材料被"约束"得更硬。这一点常被混淆：实验室细长岩样测到的杆速度并不是 α，换算时必须补上侧向约束。此外 α 只依赖于 (λ+2μ)/ρ 这个组合，因此高速层既可能是"硬"也可能是"轻"。',
    'P-wave velocity is set by the P-wave modulus λ+2μ and density. It exceeds the thin-rod value √(E/ρ) because a plane wave in an unbounded medium cannot contract laterally — the material is constrained and therefore effectively stiffer. This is a classic source of confusion: the rod velocity measured on a slender core sample is not α, and converting between them requires accounting for lateral constraint. Note also that α depends only on the combination (λ+2μ)/ρ, so a fast layer may simply be light rather than stiff.',
  ),
  symbols: [
    { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s', typical: '水 1500；砂岩 3000–4500；地幔 8000–13700' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
    { sym: 'K', name: t('体积模量 K = λ + 2μ/3', 'bulk modulus K = λ + 2μ/3'), unit: 'Pa' },
    { sym: 'E', name: t('杨氏模量', "Young's modulus"), unit: 'Pa' },
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.25' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '1000 – 3300' },
    { sym: 'c_{\\text{rod}}', name: t('细杆纵波速度（侧向自由）', 'thin-rod longitudinal velocity (sides free)'), unit: 'm/s' },
  ],
  conditions: {
    applies: [
      t('均匀各向同性线弹性介质中的体波', 'Body waves in homogeneous isotropic linear elastic media'),
      t('无频散、无衰减的理想弹性情形', 'Ideal elastic case: non-dispersive and non-attenuating'),
    ],
    assumes: [
      t('波长远大于颗粒与裂隙尺度（否则要升尺度）', 'Wavelength far exceeds grain and crack scale, otherwise upscaling is needed'),
      t('讨论 α 时用"单轴应变"状态，讨论 c_rod 时用"单轴应力"状态', 'α refers to uniaxial strain, c_rod to uniaxial stress'),
    ],
    breaks: [
      t('含流体孔隙介质：需用 Gassmann–Biot 计算等效模量', 'Fluid-saturated porous media need Gassmann–Biot effective moduli'),
      t('ν → 0.5 时 α → ∞（不可压缩极限，但此时 μ 也趋于 0，需整体考虑）', 'As ν → 0.5, α → ∞ (incompressible limit, though μ → 0 as well and must be treated together)'),
      t('各向异性介质中速度随方向变，无单一 α', 'Anisotropic media have no single α'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设一个沿 x₁ 传播的一维纵波', 'Take a one-dimensional compressional wave along x₁'),
      latex: String.raw`\boldsymbol{u}=\left(u_1\left(x_1,t\right),0,0\right)\;\Rightarrow\; \varepsilon_{11}=\frac{\partial u_1}{\partial x_1},\qquad \theta=\varepsilon_{11}`,
      note: t('无限介质中的平面波：侧向来不及收缩，ε_22 = ε_33 = 0，这是"单轴应变"状态。', 'For a plane wave in an unbounded medium the sides have no time to contract: ε_22 = ε_33 = 0, the uniaxial-strain state.') },
    { n: 2, op: 'physics', title: t('本构关系给出唯一的非零应力', 'The constitutive law gives the single non-zero stress'),
      latex: String.raw`\sigma_{11}=\lambda\,\theta+2\mu\,\varepsilon_{11}=\left(\lambda+2\mu\right)\frac{\partial u_1}{\partial x_1}` },
    { n: 3, op: 'physics', title: t('代入运动方程', 'Insert into the equation of motion'),
      latex: String.raw`\rho\,\ddot{u}_1=\frac{\partial\sigma_{11}}{\partial x_1}=\left(\lambda+2\mu\right)\frac{\partial^{2}u_1}{\partial x_1^{2}}` },
    { n: 4, op: 'identity', title: t('与标准波动方程对比', 'Compare with the standard wave equation'),
      latex: String.raw`\frac{\partial^{2}u_1}{\partial t^{2}}=\alpha^{2}\frac{\partial^{2}u_1}{\partial x_1^{2}}\;\Rightarrow\; \alpha^{2}=\frac{\lambda+2\mu}{\rho}` },
    { n: 5, op: 'substitute', title: t('换成 K 与 E、ν 的常见形式', 'Convert to the familiar K and E, ν forms'),
      latex: String.raw`\lambda+2\mu=K+\frac{4}{3}\mu=\frac{E\left(1-\nu\right)}{\left(1+\nu\right)\left(1-2\nu\right)}` },
    { n: 6, op: 'result', title: t('与细杆速度对比，看清"侧向约束"的价值', 'Compare with the rod velocity to expose the value of lateral constraint'),
      latex: String.raw`\frac{\alpha^{2}}{c_{\text{rod}}^{2}}=\frac{\lambda+2\mu}{E}=\frac{1-\nu}{\left(1+\nu\right)\left(1-2\nu\right)}\;\xrightarrow{\nu=0.25}\; 1.2`,
      note: t('ν = 0.25 时 α ≈ 1.095 c_rod：无限介质比细杆快约 10%。', 'At ν = 0.25, α ≈ 1.095 c_rod: the unbounded medium is about 10% faster than a thin rod.') },
  ],
  viz: [
    {
      id: 'alpha-vs-nu',
      level: 'V1',
      title: t('P 波速度与细杆速度随泊松比的变化', 'P-wave and rod velocities versus Poisson’s ratio'),
      xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
      ylabel: t('速度 (km/s)', 'velocity (km/s)'),
      controls: [
        { id: 'mu', label: t('剪切模量 μ', 'shear modulus μ'), min: 5, max: 120, step: 1, value: 40, unit: 'GPa' },
        { id: 'rho', label: t('密度 ρ', 'density ρ'), min: 1500, max: 3500, step: 25, value: 2700, unit: 'kg/m³' },
      ],
      xRange: [0, 0.45],
      note: t('三条曲线的间距揭示了侧向约束的代价：α 始终高于细杆速度 √(E/ρ)，而 β 最低。ν 越大，α 与 β 拉得越开——这正是含气砂岩（低 ν）在地震上表现为"低速 + 低 α/β"的原因。', 'The spacing between the curves reveals the price of lateral constraint: α always exceeds the rod velocity √(E/ρ), with β lowest of all. Larger ν pulls α and β further apart — which is why gas sands (low ν) show up seismically as low velocity plus a low α/β.'),
      compute: (p) => {
        const mu = p['mu'] * 1e9
        const rho = p['rho']
        const aPts: Array<[number, number]> = []
        const rodPts: Array<[number, number]> = []
        const bPts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const nu = (i / 180) * 0.45
          const den = 1 - 2 * nu
          aPts.push([nu, Math.sqrt((2 * mu * (1 - nu)) / (rho * den)) / 1000])
          rodPts.push([nu, Math.sqrt((2 * mu * (1 + nu)) / rho) / 1000])
          bPts.push([nu, Math.sqrt(mu / rho) / 1000])
        }
        return [
          { label: t('α（无限介质，侧向约束）', 'α (unbounded medium, constrained)'), color: '#185FA5', points: aPts },
          { label: t('√(E/ρ)（细杆，侧向自由）', '√(E/ρ) (thin rod, sides free)'), color: '#BA7517', points: rodPts },
          { label: t('β（S 波）', 'β (S wave)'), color: '#0F6E56', dash: true, points: bPts },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'ps-potential-decoupling', note: t('α 从解耦后的标量势方程中浮现', 'α emerges from the decoupled scalar-potential equation') },
      { id: 'elastic-moduli-conversions' },
      { id: 'youngs-modulus-lame' },
    ],
    downstream: [
      { id: 'velocity-ratio-poisson' },
      { id: 'p-and-s-impedance' },
      { id: 'snell-ray-parameter' },
    ],
    seealso: [
      { id: 'ps-wave-velocities', note: t('α 与 β 的主条目', 'the main entry for α and β') },
      { id: 's-wave-velocity-formula' },
      { id: 'adams-williamson' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook, 2nd ed., §1' },
  ],
}

export default pWaveVelocityFormula
