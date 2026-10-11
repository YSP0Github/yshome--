import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** poisson-from-velocities */
const poissonFromVelocities: FormulaCard = {
  id: 'poisson-from-velocities',
  name: t('由速度反解泊松比', 'Back-Solving Poisson’s Ratio from Velocities'),
  aliases: {
    zh: ['由 Vp/Vs 求泊松比', '速度反算 ν', 'λρ 与 μρ'],
    en: ['Poisson ratio from Vp/Vs', 'inverting velocities for nu', 'lambda-rho and mu-rho'],
  },
  node: 'S1.5',
  tags: {
    math: ['MATH.ROOT', 'MATH.LINALG'],
    method: ['METH.INV', 'METH.EXPL'],
    quantity: ['Q.VEL', 'Q.MAT'],
    keywords: t('反解泊松比 Vp/Vs 误差放大 λρ μρ 地震反演 含气检测 岩石物理', 'invert Poisson ratio Vp/Vs error amplification lambda-rho mu-rho seismic inversion gas detection rock physics'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\nu=\frac{\alpha^{2}-2\beta^{2}}{2\left(\alpha^{2}-\beta^{2}\right)}`,
    variants: [
      { name: t('只写速度比的形式', 'Written purely in the velocity ratio'), latex: String.raw`\nu=\frac{\left(\alpha/\beta\right)^{2}-2}{2\left[\left(\alpha/\beta\right)^{2}-1\right]}` },
      { name: t('顺手得到的两个模量', 'Two moduli that fall out on the way'), latex: String.raw`\mu=\rho\,\beta^{2},\qquad \lambda=\rho\left(\alpha^{2}-2\beta^{2}\right)` },
      { name: t('地震反演常用的"λρ–μρ"形式', 'The λρ–μρ form used in seismic inversion'), latex: String.raw`\lambda\rho=\rho^{2}\left(\alpha^{2}-2\beta^{2}\right),\qquad \mu\rho=\rho^{2}\beta^{2}` },
      { name: t('用体积模量校验', 'Cross-check via the bulk modulus'), latex: String.raw`K=\rho\left(\alpha^{2}-\frac{4}{3}\beta^{2}\right)>0\;\Rightarrow\; \frac{\alpha}{\beta}>\sqrt{\frac{4}{3}}` },
    ],
  },
  meaning: t(
    '地震观测直接给的是速度而不是模量，所以要反过来用 α、β 把 ν 解出来。这一步看似只是代数，实践中却是最容易翻车的地方：ν 是两条速度的"差之比"，α 或 β 各 1% 的误差就可能让 ν 偏 0.02–0.05，足以把"含水砂岩"误判成"含气砂岩"。因此 AVO 与地震反演中必须同时给出 λρ 与 μρ 的不确定性，不能只报一个 ν 值。',
    'Seismic observation provides velocities, not moduli, so ν has to be back-solved from α and β. This looks like mere algebra, but in practice it is where inversions most often go wrong: ν is a ratio of differences of two velocities, so a 1% error in either can shift ν by 0.02–0.05 — enough to mistake a water sand for a gas sand. That is why AVO and seismic inversion must report the uncertainty in λρ and μρ, not a single ν value.',
  ),
  symbols: [
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.05 – 0.45' },
    { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s', typical: '1500 – 8000' },
    { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s', typical: '0 – 4500' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
    { sym: '\\alpha/\\beta', name: t('速度比（反演的输入）', 'velocity ratio, the input to the inversion'), unit: '', dimension: '无量纲', typical: '1.5 – 2.2' },
  ],
  conditions: {
    applies: [
      t('已知 α、β（必要时还有 ρ）的各向同性介质', 'Isotropic media with known α and β (and ρ when moduli are wanted)'),
      t('要求 α/β > √(4/3) ≈ 1.155，否则 K < 0 无物理意义', 'Requires α/β > √(4/3) ≈ 1.155, otherwise K < 0 and the result is unphysical'),
    ],
    assumes: [
      t('α 与 β 来自同一次测量、同一频带、同一饱和状态', 'α and β come from the same measurement, frequency band and saturation state'),
      t('速度比已做过校正（各向异性、频散、压实趋势）', 'The velocity ratio has been corrected for anisotropy, dispersion and compaction trends'),
    ],
    breaks: [
      t('β = 0（流体层）时无定义', 'Undefined when β = 0, i.e. fluid layers'),
      t('α/β < 1.155 说明数据有误或介质非各向同性弹性', 'α/β < 1.155 indicates bad data or a non-isotropic-elastic medium'),
      t('强各向异性下"一个 ν"没有意义', 'Under strong anisotropy a single ν is meaningless'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从速度比公式出发', 'Start from the velocity-ratio formula'),
      latex: String.raw`r\equiv\frac{\alpha^{2}}{\beta^{2}}=\frac{2\left(1-\nu\right)}{1-2\nu}` },
    { n: 2, op: 'algebra', title: t('去分母', 'Clear the denominator'),
      latex: String.raw`r\left(1-2\nu\right)=2-2\nu\;\Rightarrow\; r-2r\nu=2-2\nu` },
    { n: 3, op: 'algebra', title: t('把含 ν 的项集中到一侧', 'Collect the ν terms on one side'),
      latex: String.raw`r-2=2r\nu-2\nu=2\nu\left(r-1\right)` },
    { n: 4, op: 'algebra', title: t('解出 ν 并还原成速度', 'Solve for ν and restore the velocities'),
      latex: String.raw`\nu=\frac{r-2}{2\left(r-1\right)}=\frac{\dfrac{\alpha^{2}}{\beta^{2}}-2}{2\left(\dfrac{\alpha^{2}}{\beta^{2}}-1\right)}=\frac{\alpha^{2}-2\beta^{2}}{2\left(\alpha^{2}-\beta^{2}\right)}` },
    { n: 5, op: 'substitute', title: t('顺手解出 λ 与 μ', 'Solve for λ and μ while we are at it'),
      latex: String.raw`\mu=\rho\beta^{2},\qquad \lambda=\rho\alpha^{2}-2\mu=\rho\left(\alpha^{2}-2\beta^{2}\right)` },
    { n: 6, op: 'result', title: t('误差敏感度：ν 会被放大多少', 'Error sensitivity: how strongly ν is amplified'),
      latex: String.raw`\frac{\mathrm{d}\nu}{\mathrm{d}r}=\frac{1}{2\left(r-1\right)^{2}},\qquad r=\frac{\alpha^{2}}{\beta^{2}}`,
      note: t('r 越接近 1（低 ν）分母越小，ν 的误差放大越严重；r 大时反而稳健。', 'The closer r is to 1 (low ν), the smaller the denominator and the worse the amplification; large r is comparatively robust.') },
  ],
  viz: [
    {
      id: 'nu-from-ratio',
      level: 'V1',
      title: t('由速度比反解 ν，以及 1%–10% 的速度误差如何传播', 'Back-solving ν from the velocity ratio, and how a 1%–10% velocity error propagates'),
      xlabel: t('速度比 α/β', 'velocity ratio α/β'),
      ylabel: t('泊松比 ν', 'Poisson’s ratio ν'),
      controls: [
        { id: 'err', label: t('速度比的系统误差', 'systematic error in the velocity ratio'), min: 0, max: 10, step: 0.5, value: 2, unit: '%' },
      ],
      xRange: [1.45, 3.5],
      yRange: [0, 0.5],
      note: t('两条曲线的垂直间距就是"速度误差变成泊松比误差"的大小。低比值端（含气砂岩）间距最大：同样 2% 的速度误差，在 α/β = 1.5 处造成的 ν 偏差远大于 α/β = 2.5 处。所以含气检测最需要谨慎地做速度质控。', 'The vertical gap between the two curves is how much velocity error turns into Poisson-ratio error. The gap is widest at the low-ratio end (gas sands): the same 2% velocity error causes a far bigger ν bias at α/β = 1.5 than at α/β = 2.5. Gas detection therefore demands the most careful velocity QC.'),
      compute: (p) => {
        const err = p['err']
        const nuPts: Array<[number, number]> = []
        const nuErrPts: Array<[number, number]> = []
        const nuOf = (r: number): number => {
          const s = r * r
          return (s - 2) / (2 * (s - 1))
        }
        for (let i = 0; i <= 230; i++) {
          const r = 1.2 + (i / 230) * 2.3
          nuPts.push([r, nuOf(r)])
          nuErrPts.push([r, nuOf(r * (1 + err / 100))])
        }
        return [
          { label: t('ν(α/β)', 'ν(α/β)'), color: '#185FA5', points: nuPts },
          { label: t('ν（速度比偏大后的结果）', 'ν from a biased velocity ratio'), color: '#BA7517', dash: true, points: nuErrPts },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'velocity-ratio-poisson', note: t('本式是它的反函数', 'this is the inverse of that') },
      { id: 'ps-wave-velocities' },
      { id: 'poissons-ratio-lame' },
    ],
    downstream: [
      { id: 'shuey-approximation', note: t('ν 的对比驱动 AVO 梯度', 'the ν contrast drives the AVO gradient') },
      { id: 'elastic-moduli-conversions' },
    ],
    seealso: [
      { id: 'damped-least-squares', note: t('反演中如何压制这种误差放大', 'how inversion suppresses such amplification') },
      { id: 'acoustic-reflection-coefficient' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Goodway, Chen & Downton (1997), Improved AVO fluid detection via λρ and μρ, CSEG' },
  ],
}

export default poissonFromVelocities
