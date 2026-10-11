import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** strain-energy-density */
const strainEnergyDensity: FormulaCard = {
  id: 'strain-energy-density',
  name: t('弹性应变能密度', 'Elastic Strain-Energy Density'),
  aliases: {
    zh: ['应变能', '弹性势能密度', 'W = ½ σ ε'],
    en: ['strain energy density', 'elastic potential energy', 'W = 1/2 sigma epsilon'],
  },
  node: 'S1.3',
  tags: {
    math: ['MATH.LINALG', 'MATH.DIFF'],
    method: ['METH.ROCK'],
    quantity: ['Q.MAT', 'Q.TENSOR'],
    keywords: t('应变能密度 弹性势能 体积变形能 形状变形能 正定性 稳定性 破裂准则 主对称性', 'strain energy density elastic potential volumetric energy distortional energy positive definiteness stability failure criterion major symmetry'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`W=\frac{1}{2}\,\sigma_{ij}\,\varepsilon_{ij}`,
    variants: [
      { name: t('用刚度张量写出（二次型）', 'As a quadratic form in the stiffness tensor'), latex: String.raw`W=\frac{1}{2}\,C_{ijkl}\,\varepsilon_{ij}\varepsilon_{kl}` },
      { name: t('各向同性：λ 与 μ 分开', 'Isotropic: λ and μ separated'), latex: String.raw`W=\frac{1}{2}\lambda\,\theta^{2}+\mu\,\varepsilon_{ij}\varepsilon_{ij}` },
      { name: t('最有用的分解：体积项 + 形状项', 'The most useful split: volume plus shape'), latex: String.raw`W=\frac{1}{2}K\,\theta^{2}+\mu\,\varepsilon'_{ij}\varepsilon'_{ij},\qquad \varepsilon'_{ij}=\varepsilon_{ij}-\frac{1}{3}\theta\,\delta_{ij}` },
      { name: t('工程常数形式（主应力 + 剪应力）', 'Engineering constants (principal plus shear stresses)'), latex: String.raw`W=\frac{1}{2E}\left(\sigma_{11}^{2}+\sigma_{22}^{2}+\sigma_{33}^{2}\right)-\frac{\nu}{E}\left(\sigma_{11}\sigma_{22}+\sigma_{22}\sigma_{33}+\sigma_{33}\sigma_{11}\right)+\frac{1}{2\mu}\left(\sigma_{12}^{2}+\sigma_{23}^{2}+\sigma_{31}^{2}\right)` },
    ],
  },
  meaning: t(
    '单位体积里存了多少弹性能。它的重要性有两层：理论上，它的存在性直接推出弹性张量的主对称性 C_ijkl = C_klij（21 个常数的来历）；工程上，"体积变形能"和"形状变形能"的分家，正是岩石破裂准则（形状项超限就破坏）与地震波中 P、S 两种能量各自独立传播的物理基础。',
    'How much elastic energy is stored per unit volume. It matters on two levels. Theoretically, its very existence implies the major symmetry C_ijkl = C_klij — the origin of the count of 21 constants. Practically, the divorce between volumetric and distortional energy underlies both rock failure criteria (failure when the distortional part exceeds a limit) and the independent propagation of P and S energy in seismic waves.',
  ),
  symbols: [
    { sym: 'W', name: t('应变能密度（单位体积的弹性能）', 'strain-energy density per unit volume'), unit: 'J/m³', typical: '10⁰ – 10⁴（地震波动）' },
    { sym: '\\sigma_{ij}', name: t('应力张量分量', 'stress tensor component'), unit: 'Pa' },
    { sym: '\\varepsilon_{ij}', name: t('应变张量分量', 'strain tensor component'), unit: '', dimension: '无量纲' },
    { sym: 'C_{ijkl}', name: t('四阶刚度张量', 'fourth-rank stiffness tensor'), unit: 'Pa' },
    { sym: '\\theta', name: t('体应变 ε_kk', 'volumetric strain ε_kk'), unit: '', dimension: '无量纲' },
    { sym: "\\varepsilon'_{ij}", name: t('偏应变张量（形状变化部分）', 'deviatoric strain (the shape-changing part)'), unit: '', dimension: '无量纲' },
    { sym: 'K,\\mu', name: t('体积模量与剪切模量', 'bulk and shear moduli'), unit: 'Pa' },
  ],
  conditions: {
    applies: [
      t('线弹性、小应变、绝热或等温条件需说明', 'Linear elasticity at small strain; state whether adiabatic or isothermal'),
      t('加载缓慢到可用静态模量，波动问题则用绝热模量', 'Quasi-static loading uses static moduli; wave problems use adiabatic moduli'),
    ],
    assumes: [
      t('变形可逆、路径无关，W 是状态的单值函数', 'Deformation is reversible and path independent, so W is a single-valued function of state'),
      t('无初始应力，参考构型为自然状态', 'No initial stress; the reference configuration is the natural state'),
    ],
    breaks: [
      t('塑性、损伤、摩擦滑移会把一部分 W 变成热，不再可逆', 'Plasticity, damage and frictional sliding convert part of W into heat, irreversibly'),
      t('黏弹性介质中 W 依赖频率，需引入复模量（见 Q）', 'In anelastic media W is frequency dependent and needs complex moduli (see Q)'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从一维弹簧的常识出发', 'Start from the one-dimensional spring'),
      latex: String.raw`W=\int_{0}^{\varepsilon}\sigma\,\mathrm{d}\varepsilon'=\int_{0}^{\varepsilon}E\,\varepsilon'\,\mathrm{d}\varepsilon'=\frac{1}{2}E\varepsilon^{2}=\frac{1}{2}\sigma\varepsilon`,
      note: t('线性响应的三角形面积——这就是 1/2 的来源。', 'The area of a triangle under a linear response; that is where the 1/2 comes from.') },
    { n: 2, op: 'physics', title: t('推广到六维应变空间的比例加载', 'Generalise to proportional loading in six-dimensional strain space'),
      latex: String.raw`W=\int_{0}^{\varepsilon_{ij}}\sigma_{ij}\,\mathrm{d}\varepsilon_{ij}=C_{ijkl}\int_{0}^{1}s\,\varepsilon_{kl}\varepsilon_{ij}\,\mathrm{d}s`,
      note: t('路径无关意味着沿 s: 0→1 的比例路径积分即可。', 'Path independence means integrating along the proportional path s: 0→1 suffices.') },
    { n: 3, op: 'identity', title: t('积分给出二次型', 'The integral yields a quadratic form'),
      latex: String.raw`W=C_{ijkl}\,\varepsilon_{ij}\varepsilon_{kl}\int_{0}^{1}s\,\mathrm{d}s=\frac{1}{2}C_{ijkl}\,\varepsilon_{ij}\varepsilon_{kl}=\frac{1}{2}\sigma_{ij}\varepsilon_{ij}` },
    { n: 4, op: 'substitute', title: t('代入各向同性 Hooke 定律', 'Insert isotropic Hooke’s law'),
      latex: String.raw`W=\frac{1}{2}\left(\lambda\theta\delta_{ij}+2\mu\varepsilon_{ij}\right)\varepsilon_{ij}=\frac{1}{2}\lambda\,\theta^{2}+\mu\,\varepsilon_{ij}\varepsilon_{ij}` },
    { n: 5, op: 'identity', title: t('把 ε_ij ε_ij 拆成体积与偏量两部分', 'Split ε_ij ε_ij into volumetric and deviatoric parts'),
      latex: String.raw`\varepsilon_{ij}\varepsilon_{ij}=\varepsilon'_{ij}\varepsilon'_{ij}+\frac{1}{3}\theta^{2}\;\Rightarrow\; W=\frac{1}{2}\left(\lambda+\frac{2}{3}\mu\right)\theta^{2}+\mu\,\varepsilon'_{ij}\varepsilon'_{ij}` },
    { n: 6, op: 'result', title: t('结论与稳定性条件', 'Result and the stability condition'),
      latex: String.raw`W=\frac{1}{2}K\,\theta^{2}+\mu\,\varepsilon'_{ij}\varepsilon'_{ij}>0\;\Rightarrow\; K>0,\ \mu>0\;\Rightarrow\; -1<\nu<\frac{1}{2}`,
      note: t('W 必须正定，否则材料会自发变形。这一条同时解释了弹性张量的主对称性。', 'W must be positive definite, otherwise the material would deform spontaneously. The same argument explains the major symmetry of the elastic tensor.') },
  ],
  viz: [
    {
      id: 'energy-split-vs-nu',
      level: 'V1',
      title: t('体积变形能与形状变形能的占比随泊松比变化', 'Share of volumetric versus distortional energy versus Poisson’s ratio'),
      xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
      ylabel: t('能量占比', 'energy fraction'),
      controls: [
        { id: 'r', label: t('偏应变与体应变之比', 'deviatoric-to-volumetric strain ratio'), min: 0.2, max: 5, step: 0.1, value: 1 },
      ],
      xRange: [0, 0.45],
      yRange: [0, 1],
      note: t('给定同样的变形量，ν 越大（越接近不可压缩）体积项占比越高：ν → 0.5 时几乎全部能量都花在"压不动"的体积上，材料很难被形状改变。相反 ν 小时形状项吃掉了大部分能量，这正是延性岩石容易剪切破裂的能量学图像。', 'For the same amount of deformation, larger ν (closer to incompressible) means a larger volumetric share: near ν → 0.5 almost all the energy goes into a volume that refuses to compress. At small ν the distortional term dominates — the energetic picture of ductile rock failing in shear.'),
      compute: (p) => {
        const r = p['r']
        const volPts: Array<[number, number]> = []
        const devPts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const nu = (i / 180) * 0.45
          const den = 1 - 2 * nu
          const halfK = (1 + nu) / (3 * den)
          const wVol = halfK
          const wDev = r * r
          const f = wVol / (wVol + wDev)
          volPts.push([nu, f])
          devPts.push([nu, 1 - f])
        }
        return [
          { label: t('体积变形能占比', 'volumetric energy fraction'), color: '#185FA5', points: volPts },
          { label: t('形状变形能占比', 'distortional energy fraction'), color: '#BA7517', points: devPts },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'generalized-hooke-law', note: t('W 的存在性推出 C 的主对称性', 'existence of W implies the major symmetry of C') },
      { id: 'isotropic-hooke-law' },
      { id: 'bulk-modulus-lame' },
    ],
    downstream: [
      { id: 'equation-of-motion', note: t('能量方法是推导运动方程的另一条路', 'energy methods give an alternative route to the equation of motion') },
    ],
    seealso: [
      { id: 'elastic-moduli-conversions' },
      { id: 'quality-factor-q', note: t('Q 描述 W 中每个周期损失的比例', 'Q describes the fraction of W lost per cycle') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
  ],
}

export default strainEnergyDensity
