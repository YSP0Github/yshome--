import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** thomsen-qp-qsv-velocity */
const thomsenQpQsvVelocity: FormulaCard = {
  id: 'thomsen-qp-qsv-velocity',
  name: t('VTI 介质 qP 与 qSV 相速度的 Thomsen 弱各向异性近似', 'Thomsen Weak-Anisotropy Phase Velocities of qP and qSV in VTI Media'),
  aliases: {
    zh: ['Thomsen 相速度近似', '弱各向异性 qP qSV', '非椭圆相速度'],
    en: ['Thomsen phase-velocity approximation', 'weak-anisotropy qP qSV velocities', 'anelliptic phase velocity'],
  },
  node: 'S1.6',
  tags: {
    subject: 'S1.6',
    math: ['MATH.APPROX', 'MATH.LINALG'],
    method: ['METH.STRUCT', 'METH.ROCK'],
    quantity: ['Q.VEL', 'Q.MAT'],
    keywords: t('Thomsen 近似 qP qSV 相速度 弱各向异性 非椭圆度 角度依赖 VTI', 'Thomsen approximation qP qSV phase velocity weak anisotropy anellipticity angular dependence VTI'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`v_{P}(\theta)\approx\alpha_{0}\left(1+\delta\sin^{2}\theta\cos^{2}\theta+\varepsilon\sin^{4}\theta\right),\qquad v_{SV}(\theta)\approx\beta_{0}\left[1+\left(\frac{\alpha_{0}}{\beta_{0}}\right)^{2}\left(\varepsilon-\delta\right)\sin^{2}\theta\cos^{2}\theta\right]`,
    variants: [
      {
        name: t('qP 的等价写法（按 sin² 与 sin⁴ 展开）', 'Equivalent qP form (expanded in sin² and sin⁴)'),
        latex: String.raw`v_{P}(\theta)\approx\alpha_{0}\left(1+\delta\sin^{2}\theta+\left(\varepsilon-\delta\right)\sin^{4}\theta\right)`,
      },
      {
        name: t('P–SV 耦合的精确解（Christoffel 正根与负根）', 'Exact P–SV solution (positive and negative Christoffel roots)'),
        latex: String.raw`2\rho v^{2}=\left(\Gamma_{11}+\Gamma_{33}\right)\pm\sqrt{\left(\Gamma_{11}-\Gamma_{33}\right)^{2}+4\Gamma_{13}^{2}}`,
      },
      {
        name: t('squared-velocity 形式（更常用的写法）', 'Squared-velocity form (the more common way to quote it)'),
        latex: String.raw`v_{P}^{2}\approx\alpha_{0}^{2}\left(1+2\delta\sin^{2}\theta\cos^{2}\theta+2\varepsilon\sin^{4}\theta\right),\qquad v_{SV}^{2}\approx\beta_{0}^{2}\left[1+2\left(\frac{\alpha_{0}}{\beta_{0}}\right)^{2}\left(\varepsilon-\delta\right)\sin^{2}\theta\cos^{2}\theta\right]`,
      },
      {
        name: t('两个端点：垂直与水平', 'The two endpoints: vertical and horizontal'),
        latex: String.raw`v_{P}(0)=\alpha_{0},\quad v_{P}\!\left(90^{\circ}\right)=\alpha_{0}\sqrt{1+2\varepsilon},\quad v_{SV}(0)=v_{SV}\!\left(90^{\circ}\right)=\beta_{0}`,
      },
    ],
  },
  meaning: t(
    '这两条式子是 Thomsen 参数真正兑现价值的地方：把 5 个 GPa 量级的弹性常数，换成「垂直速度 + 两个无量纲数」后，相速度随角度的变化就是几条 sin²、sin⁴ 的简单组合。qP 的水平快慢由 ε 管，近垂直弯曲由 δ 管；而 qSV 的角度变化几乎完全由 ε − δ 决定，还乘了 (α₀/β₀)² 这个放大因子 —— 所以横波对非椭圆度远比纵波敏感。地震处理里的非双曲时差、VTI 偏移的速度模型，用的就是这两条式子。',
    'These two expressions are where the Thomsen parameters deliver on their promise: five elastic constants in GPa are replaced by "vertical velocity plus two dimensionless numbers", and the angular variation of phase velocity becomes a handful of sin² and sin⁴ terms. For qP, ε governs the horizontal speed and δ the near-vertical curvature; for qSV, the angular variation is controlled almost entirely by ε − δ, amplified by the factor (α₀/β₀)². Shear waves are therefore far more sensitive to anellipticity than compressional waves. Non-hyperbolic moveout and VTI migration velocity models rest on these two formulas.',
  ),
  symbols: [
    { sym: 'v_P', name: t('qP 相速度', 'qP phase velocity'), unit: 'm/s', typical: '2000 – 5000' },
    { sym: 'v_{SV}', name: t('qSV 相速度', 'qSV phase velocity'), unit: 'm/s', typical: '900 – 2500' },
    { sym: '\\alpha_0', name: t('垂直 P 波速度', 'vertical P velocity'), unit: 'm/s', typical: '2000 – 4000' },
    { sym: '\\beta_0', name: t('垂直 S 波速度', 'vertical S velocity'), unit: 'm/s', typical: '900 – 2200' },
    { sym: '\\varepsilon', name: t('P 波各向异性强度', 'P-wave anisotropy strength'), unit: '1', typical: '0.00 – 0.30' },
    { sym: '\\delta', name: t('近垂直弯曲参数', 'near-vertical curvature parameter'), unit: '1', typical: '−0.05 – 0.20' },
    { sym: '\\theta', name: t('传播方向与对称轴的夹角', 'angle from the symmetry axis'), unit: 'rad' },
    { sym: '\\Gamma_{ij}', name: t('Christoffel 矩阵分量', 'Christoffel-matrix components'), unit: 'Pa' },
  ],
  conditions: {
    applies: [
      t('弱到中等各向异性的 VTI 介质，|ε|、|δ| ≲ 0.2 时误差 < 1%', 'VTI media with weak to moderate anisotropy; the error stays below 1% for |ε|, |δ| ≲ 0.2'),
      t('P–SV 耦合的两个模式（qP 与 qSV），SH 支另算', 'The two coupled P–SV modes (qP and qSV); the SH branch is treated separately'),
    ],
    assumes: [
      t('只保留 ε、δ 的一阶项，忽略 O(ε², δ², εδ)', 'Only first-order terms in ε and δ are kept; O(ε², δ², εδ) is dropped'),
      t('C₃₃ > C₄₄（α₀ > β₀），保证根号展开合法', 'C₃₃ > C₄₄ (α₀ > β₀) so that the square-root expansion is legitimate'),
      t('介质均匀、无损，相速度与频率无关', 'Homogeneous and lossless, so the phase velocity is frequency independent'),
    ],
    breaks: [
      t('强各向异性（ε > 0.4）时一阶式在中间角度可有 2–5% 偏差，须回到精确 Christoffel 解', 'For strong anisotropy (ε > 0.4) the first-order form can be off by 2–5% at intermediate angles; return to the exact Christoffel solution'),
      t('α₀/β₀ 很大（松软沉积）时，(α₀/β₀)²(ε−δ) 不再小，qSV 近似式最先失效', 'When α₀/β₀ is large (soft sediments) the product (α₀/β₀)²(ε − δ) is no longer small and the qSV approximation fails first'),
      t('近 90° 附近 qSV 可能出现「垂向慢度多值/三角波前」，一阶式完全无法描述', 'Near 90° qSV can develop a multi-valued vertical slowness (the triplication); the first-order form cannot describe it at all'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('从 VTI 的 P–SV 精确解出发', 'Start from the exact VTI P–SV solution'),
      latex: String.raw`2\rho v^{2}=\left(\Gamma_{11}+\Gamma_{33}\right)\pm\sqrt{\left(\Gamma_{11}-\Gamma_{33}\right)^{2}+4\Gamma_{13}^{2}}`,
      note: t('这是 Christoffel 矩阵在 x₁–x₃ 平面内的 2×2 P–SV 块；SH 支（Γ₂₂）已经解耦出去。', 'This is the 2×2 P–SV block of the Christoffel matrix inside the x₁–x₃ plane; the SH branch (Γ₂₂) has already decoupled.'),
    },
    {
      n: 2,
      op: 'setup',
      title: t('写出三个矩阵元', 'Write out the three matrix entries'),
      latex: String.raw`\Gamma_{11}=C_{11}\sin^{2}\theta+C_{44}\cos^{2}\theta,\quad \Gamma_{33}=C_{44}\sin^{2}\theta+C_{33}\cos^{2}\theta,\quad \Gamma_{13}=\left(C_{13}+C_{44}\right)\sin\theta\cos\theta`,
    },
    {
      n: 3,
      op: 'substitute',
      title: t('换用 Thomsen 参数：a ≡ C₃₃，b ≡ C₄₄，D ≡ a − b', 'Switch to Thomsen parameters: let a ≡ C₃₃, b ≡ C₄₄, D ≡ a − b'),
      latex: String.raw`C_{11}=a\left(1+2\varepsilon\right),\qquad C_{13}+C_{44}=D+\delta a,\qquad a=\rho\alpha_{0}^{2},\quad b=\rho\beta_{0}^{2}`,
      note: t('第二式是 δ 定义的直接推论：把 (C₁₃+C₄₄)² = D² + 2δaD 展开到 δ 的一阶即得 C₁₃+C₄₄ = D + δa。', 'The second relation is a direct consequence of the definition of δ: expanding (C₁₃+C₄₄)² = D² + 2δaD to first order in δ gives C₁₃+C₄₄ = D + δa.'),
    },
    {
      n: 4,
      op: 'taylor',
      title: t('把根号里的表达式展开到一阶', 'Expand the expression under the square root to first order'),
      latex: String.raw`\left(\Gamma_{11}-\Gamma_{33}\right)^{2}+4\Gamma_{13}^{2}=D^{2}+4Da\sin^{2}\theta\left[\varepsilon\left(\sin^{2}\theta-\cos^{2}\theta\right)+2\delta\cos^{2}\theta\right]+O(\varepsilon^{2},\delta^{2})`,
      note: t('关键在于 D²(1 − 4s²c²) 中的 −4D²s²c² 与 4D²s²c² 恰好相消，根号里只剩 D² 加一个一阶修正量。', 'The crucial point is that −4D²s²c² inside D²(1 − 4s²c²) exactly cancels the +4D²s²c² term, leaving D² plus one first-order correction.'),
    },
    {
      n: 5,
      op: 'algebra',
      title: t('开方后取正根得到 qP', 'Take the square root and the positive root to obtain qP'),
      latex: String.raw`\sqrt{\;\cdot\;}\simeq D+2a\sin^{2}\theta\left[\varepsilon\left(\sin^{2}\theta-\cos^{2}\theta\right)+2\delta\cos^{2}\theta\right]\;\Longrightarrow\; \rho v_{P}^{2}=a+2a\left(\varepsilon\sin^{4}\theta+\delta\sin^{2}\theta\cos^{2}\theta\right)`,
      note: t('整理时用到 1 + sin²θ − cos²θ = 2sin²θ，于是 ε 项自动变成 sin⁴θ。', 'The algebra uses 1 + sin²θ − cos²θ = 2sin²θ, so the ε term turns into sin⁴θ automatically.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('取负根得到 qSV，并开方', 'Take the negative root for qSV and extract the square root'),
      latex: String.raw`\rho v_{SV}^{2}=b+2a\left(\varepsilon-\delta\right)\sin^{2}\theta\cos^{2}\theta\;\Longrightarrow\; v_{SV}\approx\beta_{0}\left[1+\left(\frac{\alpha_{0}}{\beta_{0}}\right)^{2}\left(\varepsilon-\delta\right)\sin^{2}\theta\cos^{2}\theta\right]`,
      note: t('这里用到 1 − sin²θ + cos²θ = 2cos²θ。(α₀/β₀)² 通常 3–6，所以 qSV 的角度变化被放大好几倍。', 'Here one uses 1 − sin²θ + cos²θ = 2cos²θ. Since (α₀/β₀)² is typically 3–6, the angular variation of qSV is amplified severalfold.'),
    },
  ],
  viz: [
    {
      id: 'qp-qsv-exact-vs-thomsen',
      level: 'V1',
      title: t('精确 Christoffel 解 vs Thomsen 一阶近似', 'Exact Christoffel solution versus the first-order Thomsen approximation'),
      xlabel: t('与对称轴的夹角 θ (°)', 'angle from the symmetry axis θ (°)'),
      ylabel: t('相速度 (m/s)', 'phase velocity (m/s)'),
      controls: [
        { id: 'qa0', label: t('垂直 P 波速度 α₀', 'vertical P velocity α₀'), min: 2000, max: 6000, step: 50, value: 3000, unit: 'm/s' },
        { id: 'qb0', label: t('垂直 S 波速度 β₀', 'vertical S velocity β₀'), min: 800, max: 3000, step: 20, value: 1500, unit: 'm/s' },
        { id: 'qeps', label: t('P 波各向异性 ε', 'P anisotropy ε'), min: 0, max: 0.45, step: 0.01, value: 0.2, unit: '1' },
        { id: 'qdel', label: t('近垂直弯曲 δ', 'near-vertical curvature δ'), min: -0.15, max: 0.35, step: 0.01, value: 0.05, unit: '1' },
      ],
      xRange: [0, 90],
      note: t('实线是精确解，虚线是 Thomsen 一阶近似。把 ε 慢慢推到 0.4 以上，可以看到 qSV 的虚线先「跑掉」—— 因为它的误差被 (α₀/β₀)² 放大了。这就是「弱各向异性」四个字的适用范围。', 'Solid lines are the exact solution, dashed lines the first-order Thomsen approximation. Push ε beyond 0.4 and the qSV dashed curve is the first to run away, because its error is amplified by (α₀/β₀)². That is precisely the domain of validity of the words "weak anisotropy".'),
      compute: (p) => {
        const rho = 2500
        const a0 = p['qa0'], b0 = p['qb0'], eps = p['qeps'], del = p['qdel']
        if (!(a0 > b0 * 1.15)) return []
        const C33 = rho * a0 * a0
        const C44 = rho * b0 * b0
        const C11 = C33 * (1 + 2 * eps)
        const D = C33 - C44
        const arg = D * D + 2 * del * C33 * D
        if (!(arg > 0)) return []
        const C13 = -C44 + Math.sqrt(arg)
        const ratio2 = (a0 / b0) * (a0 / b0)
        const exP: Array<[number, number]> = []
        const exS: Array<[number, number]> = []
        const thP: Array<[number, number]> = []
        const thS: Array<[number, number]> = []
        const N = 180
        for (let i = 0; i <= N; i++) {
          const th = (i / N) * (Math.PI / 2)
          const s = Math.sin(th)
          const c = Math.cos(th)
          const s2 = s * s
          const c2 = c * c
          const deg = (i / N) * 90
          const G11 = C11 * s2 + C44 * c2
          const G33 = C44 * s2 + C33 * c2
          const G13 = (C13 + C44) * s * c
          const tr = 0.5 * (G11 + G33)
          const dif = 0.5 * (G11 - G33)
          const rad = Math.sqrt(dif * dif + G13 * G13)
          exP.push([deg, Math.sqrt(Math.max(tr + rad, 1e-6) / rho)])
          exS.push([deg, Math.sqrt(Math.max(tr - rad, 1e-6) / rho)])
          thP.push([deg, a0 * (1 + del * s2 * c2 + eps * s2 * s2)])
          thS.push([deg, b0 * (1 + ratio2 * (eps - del) * s2 * c2)])
        }
        return [
          { label: t('qP 精确解', 'qP exact'), color: '#185FA5', points: exP },
          { label: t('qP Thomsen 近似', 'qP Thomsen approximation'), color: '#185FA5', dash: true, points: thP },
          { label: t('qSV 精确解', 'qSV exact'), color: '#0F6E56', points: exS },
          { label: t('qSV Thomsen 近似', 'qSV Thomsen approximation'), color: '#0F6E56', dash: true, points: thS },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'christoffel-equation', note: t('给出精确的 P–SV 本征值', 'provides the exact P–SV eigenvalues') },
      { id: 'thomsen-parameters', note: t('给出 ε、δ 的定义', 'provides the definitions of ε and δ') },
    ],
    seealso: [
      { id: 'nmo-correction', note: t('非椭圆度导致的非双曲时差', 'non-hyperbolic moveout due to anellipticity') },
      { id: 'ps-wave-velocities', note: t('各向同性下的 α、β 定义', 'the isotropic definitions of α and β') },
    ],
  },
  refs: [
    { text: 'Thomsen (1986), Weak elastic anisotropy, Geophysics 51, 1954–1966' },
    { text: 'Tsvankin, Seismic Signatures and Analysis of Reflection Data in Anisotropic Media, ch. 1' },
  ],
}

export default thomsenQpQsvVelocity
