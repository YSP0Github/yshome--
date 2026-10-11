import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** adams-williamson */
const adamsWilliamson: FormulaCard = {
  id: 'adams-williamson',
  name: t('Adams–Williamson 方程', 'The Adams–Williamson Equation'),
  aliases: { zh: ['密度剖面', '绝热压缩', '地球内部密度'], en: ['Adams-Williamson', 'density profile', 'adiabatic compression'] },
  node: 'S7.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.STRUCT'],
    quantity: ['Q.MAT', 'Q.GEOM'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\frac{\dd \rho}{\dd r}=-\frac{\rho(r)\,g(r)}{\phi(r)}`,
    variants: [
      { name: t('地震学参数 φ', 'The seismic parameter φ'), latex: String.raw`\phi=\frac{K_S}{\rho}=\alpha^{2}-\frac{4}{3}\beta^{2}` },
      { name: t('重力加速度', 'Gravitational acceleration'), latex: String.raw`g(r)=\frac{G\,m(r)}{r^{2}},\qquad m(r)=4\pi\!\int_0^{r}\rho(s)s^{2}\dd s` },
    ],
  },
  meaning: t(
    'PREM 的地幔密度剖面主要不是直接测出来的，而是由地震波速通过这个方程算出来的。它把「可以由地震学测到的量」（α、β）和「无法直接测到的量」（ρ）连在了一起。',
    'The mantle density profile in PREM is not measured directly — it is computed from seismic velocities through this equation. It links what seismology can observe (α, β) to what it otherwise cannot (ρ).',
  ),
  symbols: [
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: 'r', name: t('地心距', 'radius from Earth centre'), unit: 'm' },
    { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²' },
    { sym: '\\phi', name: t('地震学参数', 'seismic parameter'), unit: 'm²/s²' },
    { sym: 'K_S', name: t('绝热体积模量', 'adiabatic bulk modulus'), unit: 'Pa' },
    { sym: '\\alpha,\\beta', name: t('P 波与 S 波速度', 'P and S wave velocities'), unit: 'm/s' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³kg⁻¹s⁻²' },
  ],
  conditions: {
    applies: [t('化学组成均匀、处于静水平衡且绝热自压缩的区域（主要是下地幔）', 'Chemically homogeneous regions in hydrostatic equilibrium undergoing adiabatic self-compression — mainly the lower mantle')],
    assumes: [
      t('各处位于同一绝热线上（无化学分层、无热边界层）', 'Everything sits on a single adiabat: no chemical stratification, no thermal boundary layer'),
      t('静水平衡成立', 'Hydrostatic equilibrium'),
    ],
    breaks: [
      t('化学分层的地幔（可能有两层系统），须引入 Bullen 参数判据', 'Chemically stratified mantle requires the Bullen parameter test'),
      t('相变界面（如 660 km）处密度出现跳变，方程不适用', 'Phase boundaries such as 660 km produce density jumps the equation cannot handle'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('静水平衡', 'Hydrostatic equilibrium'),
      latex: String.raw`\frac{\dd P}{\dd r}=-\rho(r)\,g(r)`,
      note: t('意思是：深度向下增加时，压力的增加恰好用来托住上面全部物质的重量。', 'Going deeper, the pressure increase exactly supports the weight of everything above.') },
    { n: 2, op: 'setup', title: t('绝热体积模量的定义', 'Definition of the adiabatic bulk modulus'),
      latex: String.raw`K_S=\rho\left(\frac{\partial P}{\partial \rho}\right)_{S}\;\Longrightarrow\;\dd P=\frac{K_S}{\rho}\,\dd\rho` },
    { n: 3, op: 'substitute', title: t('代入静水平衡式', 'Substitute into the equilibrium relation'),
      latex: String.raw`\frac{K_S}{\rho}\frac{\dd\rho}{\dd r}=-\rho g` },
    { n: 4, op: 'result', title: t('得到 Adams–Williamson 方程', 'The Adams–Williamson equation'),
      latex: String.raw`\frac{\dd \rho}{\dd r}=-\frac{\rho\,g}{K_S/\rho}=-\frac{\rho\,g}{\phi}` },
    { n: 5, op: 'identity', title: t('把 φ 换成可直接测量的地震速度', 'Rewrite φ in terms of observable seismic velocities'),
      latex: String.raw`\phi=\frac{K_S}{\rho}=\frac{\lambda+\tfrac{2}{3}\mu}{\rho}=\frac{\lambda+2\mu}{\rho}-\frac{4}{3}\frac{\mu}{\rho}=\alpha^{2}-\frac{4}{3}\beta^{2}`,
      note: t('这是关键一步：把不可测的 K_S 换成地震学天天在测的 α 和 β。', 'The crucial step: trading an unmeasurable bulk modulus for α and β, which seismology measures routinely.') },
    { n: 6, op: 'identity', title: t('配上 g(r) 的递推式，即可从地表向下积分', 'Together with g(r) this integrates downward from the surface'),
      latex: String.raw`g(r)=\frac{G}{r^{2}}\cdot 4\pi\!\int_0^{r}\rho(s)s^{2}\dd s`,
      note: t('ρ、g、φ 三者耦合，实际做法是从已知的地表/地壳条件往下做数值积分（通常取 ζ = ρ/φ 作为积分变量以改善稳定性）。', 'The three quantities are coupled, so the practical approach is numerical integration downward from known near-surface conditions, often using ζ = ρ/φ as the integration variable for stability.') },
  ],
  example: {
    title: t('下地幔中部', 'Mid lower mantle'),
    input: t('ρ = 4600 kg/m³，g = 10.0 m/s²，α = 11.0 km/s，β = 6.0 km/s', 'ρ = 4600 kg/m³, g = 10.0 m/s², α = 11.0 km/s, β = 6.0 km/s'),
    steps: [
      t('φ = (11.0)² − (4/3)(6.0)² = 121 − 48 = 73 km²/s² = 7.3×10⁷ m²/s²', 'φ = (11.0)² − (4/3)(6.0)² = 121 − 48 = 73 km²/s² = 7.3×10⁷ m²/s²'),
      t('dρ/dr = −4600 × 10.0 / 7.3×10⁷ = −6.3×10⁻⁴ kg/m⁴', 'dρ/dr = −4600 × 10.0 / 7.3×10⁷ = −6.3×10⁻⁴ kg/m⁴'),
    ],
    output: t('即密度向下每公里增加约 0.63 kg/m³ —— 与 PREM 的下地幔梯度吻合', 'Density increases by roughly 0.63 kg/m³ per km downward, consistent with PREM in the lower mantle'),
  },
  links: {
    upstream: [
      { id: 'ps-wave-velocities', note: t('提供 α、β', 'supplies α and β') },
      { id: 'hookes-law-isotropic', note: t('提供 K 与 μ 的关系', 'supplies the K–μ relation') },
    ],
  },
  refs: [
    { text: 'Dziewonski & Anderson (1981), PREM, PEPI 25, 297–356' },
    { text: 'Stacey & Davis, Physics of the Earth, 4th ed., Ch. 2' },
  ],

}

export default adamsWilliamson
