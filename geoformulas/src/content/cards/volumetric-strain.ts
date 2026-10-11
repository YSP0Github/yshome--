import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** volumetric-strain */
const volumetricStrain: FormulaCard = {
  id: 'volumetric-strain',
  name: t('体积应变（散度）', 'Volumetric Strain (Divergence)'),
  aliases: { zh: ['体应变', '膨胀', '位移散度', '压缩'], en: ['volumetric strain', 'dilatation', 'divergence', 'cubical strain'] },
  node: 'S1.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR', 'Q.MAT'],
    keywords: t('体积应变 体应变 散度 膨胀 迹 密度扰动 P波 S波 等容', 'volumetric strain dilatation divergence trace density perturbation P wave S wave isochoric'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\theta=\varepsilon_{kk}=\nabla\cdot\boldsymbol{u}=\frac{\Delta V}{V}`,
    variants: [
      { name: t('与密度扰动的关系', 'Relation to the density perturbation'), latex: String.raw`\theta=-\frac{\Delta\rho}{\rho}` },
      { name: t('由应力给出的形式', 'In terms of the stress'), latex: String.raw`\theta=\frac{\bar{\sigma}}{K}=\frac{\sigma_{kk}}{3K},\qquad K=\lambda+\frac{2}{3}\mu` },
      { name: t('P 波与 S 波的判别式', 'The P-versus-S discriminator'), latex: String.raw`\text{P wave:}\ \nabla\times\boldsymbol{u}=0,\ \theta\neq 0;\qquad \text{S wave:}\ \nabla\cdot\boldsymbol{u}=0,\ \theta=0` },
      { name: t('在波数域（谐和波）', 'In the wavenumber domain for a harmonic wave'), latex: String.raw`\boldsymbol{u}=\boldsymbol{A}\,e^{i(\omega t-\boldsymbol{k}\cdot\boldsymbol{x})}\;\Longrightarrow\;\theta=-i\,\boldsymbol{k}\cdot\boldsymbol{A}` },
      { name: t('Helmholtz 分解中的势', 'The potential in the Helmholtz decomposition'), latex: String.raw`\boldsymbol{u}=\nabla\phi+\nabla\times\boldsymbol{\psi}\;\Longrightarrow\;\theta=\nabla^{2}\phi` },
    ],
  },
  meaning: t(
    '体应变就是「一小块岩石的体积改变了百分之几」，也等于位移场的散度。它是区分 P 波与 S 波的那把刀：P 波有体应变（压缩与膨胀交替），S 波完全没有（纯形状改变，体积守恒）。在震源理论里它还直接联系到矩张量的各向同性部分 —— 爆炸源有 θ，剪切位错源没有。',
    'Volumetric strain is simply the fractional change of volume of a small piece of rock, and it equals the divergence of the displacement field. It is the knife that separates P from S waves: P waves carry volume change, alternating compression and dilatation, while S waves carry none at all, being pure shape change at constant volume. In source theory it also connects directly to the isotropic part of the moment tensor: explosions have θ, shear dislocations do not.',
  ),
  symbols: [
    { sym: '\\theta', name: t('体积应变（膨胀量，此处不是入射角）', 'volumetric strain / dilatation (not the incidence angle here)'), unit: '', dimension: '无量纲', typical: '10⁻⁶ – 10⁻⁴（地震波）' },
    { sym: '\\varepsilon_{kk}', name: t('应变张量的迹', 'trace of the strain tensor'), unit: '', dimension: '无量纲' },
    { sym: '\\nabla\\cdot\\boldsymbol{u}', name: t('位移场的散度', 'divergence of the displacement field'), unit: '', dimension: '无量纲' },
    { sym: '\\Delta V', name: t('体积变化量', 'change of volume'), unit: 'm³' },
    { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa', typical: '10¹⁰ – 10¹¹ Pa' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数（μ 也是剪切模量）', 'Lamé constants (μ also being the shear modulus)'), unit: 'Pa', typical: '10¹⁰ Pa' },
    { sym: '\\Delta\\rho', name: t('密度扰动', 'density perturbation'), unit: 'kg/m³' },
    { sym: '\\phi', name: t('P 波位移势（标量势）', 'P-wave scalar potential'), unit: 'm²' },
  ],
  conditions: {
    applies: [
      t('小变形；θ > 0 表示膨胀，θ < 0 表示压缩', 'Small deformation; θ > 0 means dilatation and θ < 0 compression'),
      t('区分 P 波与 S 波、判断震源是否含各向同性分量时', 'Distinguishing P from S and judging whether a source has an isotropic component'),
    ],
    assumes: [
      t('连续介质、质量守恒', 'A continuum obeying mass conservation'),
      t('线弹性：θ 与平均应力成正比', 'Linear elasticity, so θ is proportional to the mean stress'),
    ],
    breaks: [
      t('不可压缩极限（ν → 0.5）下 K → ∞，θ → 0，公式退化', 'In the incompressible limit ν → 0.5 the bulk modulus diverges, θ vanishes and the relation degenerates'),
      t('含流体孔隙介质中总体积应变与固相骨架应变不同（需用 Biot 理论）', 'In fluid-saturated porous media the total volumetric strain differs from that of the solid frame, requiring Biot theory'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('取一个与主轴对齐的微小长方体', 'Take a tiny rectangular box aligned with the principal axes'),
      latex: String.raw`V=\mathrm{d}x_1\,\mathrm{d}x_2\,\mathrm{d}x_3` },
    { n: 2, op: 'taylor', title: t('三个方向各自伸长', 'Each direction stretches on its own'),
      latex: String.raw`\mathrm{d}x'_1=\left(1+\varepsilon_{11}\right)\mathrm{d}x_1,\quad \mathrm{d}x'_2=\left(1+\varepsilon_{22}\right)\mathrm{d}x_2,\quad \mathrm{d}x'_3=\left(1+\varepsilon_{33}\right)\mathrm{d}x_3` },
    { n: 3, op: 'algebra', title: t('体积之比，略去二阶项', 'Take the volume ratio and drop second-order terms'),
      latex: String.raw`\frac{V'}{V}=\left(1+\varepsilon_{11}\right)\left(1+\varepsilon_{22}\right)\left(1+\varepsilon_{33}\right)\approx 1+\varepsilon_{11}+\varepsilon_{22}+\varepsilon_{33}` },
    { n: 4, op: 'result', title: t('得到体应变', 'The volumetric strain follows'),
      latex: String.raw`\theta=\frac{\Delta V}{V}=\varepsilon_{kk}=\frac{\partial u_1}{\partial x_1}+\frac{\partial u_2}{\partial x_2}+\frac{\partial u_3}{\partial x_3}=\nabla\cdot\boldsymbol{u}`,
      note: t('注意这里不需要主轴：迹在任何坐标系下都一样，所以直接用 ε_kk 即可。', 'No principal axes are needed: the trace is the same in every coordinate system, so ε_kk can be used directly.') },
    { n: 5, op: 'identity', title: t('质量守恒把体应变与密度扰动锁在一起', 'Mass conservation locks volumetric strain to the density perturbation'),
      latex: String.raw`\rho V=\text{const}\;\Longrightarrow\; \frac{\Delta\rho}{\rho}=-\frac{\Delta V}{V}=-\theta` },
    { n: 6, op: 'substitute', title: t('代入 Hooke 定律取迹，得到 K', 'Take the trace of Hooke’s law to obtain K'),
      latex: String.raw`\sigma_{kk}=\left(3\lambda+2\mu\right)\theta\;\Longrightarrow\; \frac{\sigma_{kk}}{3}=\left(\lambda+\frac{2}{3}\mu\right)\theta=K\,\theta` },
    { n: 7, op: 'result', title: t('S 波为何没有体应变', 'Why S waves carry no volumetric strain'),
      latex: String.raw`\nabla\cdot\left(\nabla\times\boldsymbol{\psi}\right)=0\;\Longrightarrow\; \theta_{S}=0`,
      note: t('任何旋度场的散度恒为零，所以 S 波是等容的 —— 它只扭形状，不挤体积。', 'The divergence of any curl vanishes identically, so S waves are isochoric: they change shape without ever changing volume.') },
  ],
  viz: [
    {
      id: 'theta-vs-shear-modulus',
      level: 'V1',
      title: t('在给定压力下，体积应变随剪切模量的变化', 'Volumetric strain versus shear modulus at fixed pressure'),
      xlabel: t('剪切模量 μ (GPa)', 'shear modulus μ (GPa)'),
      ylabel: t('压缩体应变 −θ (‰)', 'compressive volumetric strain −θ (per mille)'),
      controls: [
        { id: 'lam', label: t('Lamé 常数 λ', 'Lamé constant λ'), min: 5, max: 120, step: 1, value: 30, unit: 'GPa' },
        { id: 'press', label: t('施加的压力 p', 'applied pressure p'), min: 1, max: 400, step: 1, value: 50, unit: 'MPa' },
      ],
      xRange: [1, 200],
      note: t('μ 越大，体积模量 K = λ + 2μ/3 也越大，同样的压力压出的体应变就越小。把 μ 推到 100 GPa 以上，−θ 迅速趋近于零 —— 这就是「不可压缩」的极限，此时 P 波速度趋于无穷，而 S 波速度仍是有限的。把 λ 调到很小（接近液体）时，同样的压力下体应变会大得多。', 'Larger μ raises the bulk modulus K = λ + 2μ/3, so the same pressure produces less volume change. Push μ past 100 GPa and −θ collapses towards zero, the incompressible limit where the P velocity diverges while the S velocity stays finite. Setting λ very small, as in a fluid, gives far larger volumetric strain under the same pressure.'),
      compute: (p) => {
        const lam = p['lam'] * 1e9
        const press = p['press'] * 1e6
        const hi: Array<[number, number]> = []
        const lo: Array<[number, number]> = []
        const N = 240
        for (let i = 0; i <= N; i++) {
          const muGPa = 1 + (i / N) * 199
          const mu = muGPa * 1e9
          const K = lam + (2 / 3) * mu
          const th1 = -press / K
          const th2 = -(press / 2) / K
          hi.push([muGPa, -th1 * 1000])
          lo.push([muGPa, -th2 * 1000])
        }
        return [
          { label: t('施加压力 p', 'applied pressure p'), color: '#185FA5', points: hi },
          { label: t('压力减半 p/2', 'half the pressure p/2'), color: '#BA7517', dash: true, points: lo },
        ]
      },
    },
  ],
  example: {
    title: t('1 km 深处地震波的体积变化', 'Volume change carried by a seismic wave at 1 km depth'),
    input: t('λ = 30 GPa，μ = 30 GPa，动态应力扰动幅度 0.1 MPa。', 'λ = 30 GPa, μ = 30 GPa, with a dynamic stress perturbation of 0.1 MPa.'),
    steps: [
      t('K = λ + 2μ/3 = 30 + 20 = 50 GPa', 'K = λ + 2μ/3 = 30 + 20 = 50 GPa'),
      t('θ = σ̄/K = 0.1 MPa / 50000 MPa = 2 × 10⁻⁶', 'θ = σ̄/K = 0.1 MPa / 50000 MPa = 2 × 10⁻⁶'),
      t('密度扰动 Δρ/ρ = −θ = −2 × 10⁻⁶，即 2700 kg/m³ 时约 0.005 kg/m³', 'density perturbation Δρ/ρ = −θ = −2 × 10⁻⁶, about 0.005 kg/m³ when ρ = 2700 kg/m³'),
    ],
    output: t('即使是 0.1 MPa 的应力扰动，引起的相对体积变化也只有百万分之二 —— 这么小的数字正是线性弹性之所以精确的原因。', 'Even a stress perturbation of 0.1 MPa changes the volume by only two parts per million, and numbers this small are exactly why linear elasticity is so accurate for seismic waves.'),
  },
  links: {
    upstream: [{ id: 'infinitesimal-strain-tensor', note: t('体应变就是应变张量的迹', 'volumetric strain is the trace of the strain tensor') }],
    downstream: [
      { id: 'hookes-law-isotropic', note: t('θ 与球应力通过 K 相连', 'θ and the spherical stress are linked by K') },
      { id: 'ps-wave-velocities', note: t('K + 4μ/3 给出 P 波速度', 'K + 4μ/3 gives the P velocity') },
    ],
    seealso: [{ id: 'strain-tensor' }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
  ],

}

export default volumetricStrain
