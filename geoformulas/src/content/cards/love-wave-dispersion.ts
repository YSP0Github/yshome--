import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** love-wave-dispersion */
const loveWaveDispersion: FormulaCard = {
  id: 'love-wave-dispersion',
  name: t('Love 波频散方程', 'The Love-wave Dispersion Equation'),
  aliases: { zh: ['乐甫波', '面波频散'], en: ['Love wave', 'dispersion equation', 'guided wave'] },
  node: 'S5.1',
  tags: {
    math: ['MATH.DIFF', 'MATH.ROOT'],
    method: ['METH.SURF'],
    quantity: ['Q.VEL', 'Q.FREQ'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\tan\!\left(\omega H\eta_{1}\right)=\frac{\mu_{2}\,\hat{\eta}_{2}}{\mu_{1}\,\eta_{1}}`,
    variants: [
      { name: t('层内垂直慢度（实数，波动）', 'Vertical slowness in the layer (real, oscillatory)'), latex: String.raw`\eta_{1}=\sqrt{\frac{1}{\beta_{1}^{2}}-\frac{1}{c^{2}}}` },
      { name: t('半空间垂直慢度（实数则全反射）', 'Vertical slowness in the half-space'), latex: String.raw`\hat{\eta}_{2}=\sqrt{\frac{1}{c^{2}}-\frac{1}{\beta_{2}^{2}}}` },
      { name: t('存在条件', 'Existence condition'), latex: String.raw`\beta_{1}<c<\beta_{2}` },
      { name: t('若密度相同，模量比化为速度比', 'If densities are equal the moduli ratio reduces'), latex: String.raw`\frac{\mu_{2}}{\mu_{1}}=\frac{\beta_{2}^{2}}{\beta_{1}^{2}}` },
    ],
  },
  meaning: t(
    '低速夹层把 SH 能量「关」在里面来回反射，形成导波。不同频率穿透深度不同，因而速度不同 —— 长周期先到、短周期后到，地震图上的面波因此拖成一长串。这条超越方程的每个解就是一个传播模态。',
    'A low-velocity layer traps SH energy and guides it. Different frequencies sample different depths and therefore travel at different speeds — long periods arrive first, short periods later, which is why a surface-wave train stretches out. Every root of this transcendental equation is one propagating mode.',
  ),
  symbols: [
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'H', name: t('低速层厚度', 'thickness of the low-velocity layer'), unit: 'm', typical: '10³ – 10⁵ m' },
    { sym: '\\beta_1', name: t('层内 S 波速度', 'S velocity within the layer'), unit: 'm/s' },
    { sym: '\\beta_2', name: t('半空间 S 波速度', 'S velocity in the half-space'), unit: 'm/s' },
    { sym: '\\mu_1,\\mu_2', name: t('层内与半空间的剪切模量', 'shear modulus in layer and half-space'), unit: 'Pa' },
    { sym: 'c', name: t('Love 波相速度', 'Love-wave phase velocity'), unit: 'm/s' },
    { sym: '\\eta_1', name: t('层内的垂直慢度', 'vertical slowness within the layer'), unit: 's/m' },
    { sym: '\\hat{\\eta}_2', name: t('半空间中的（正）衰减常数', 'decay constant in the half-space'), unit: 's/m' },
  ],
  conditions: {
    applies: [t('水平层 + 半空间，且 β₁ < β₂（低速层覆盖）', 'A layer over a half-space with β₁ < β₂')],
    assumes: [
      t('两层均为均匀、各向同性、弹性的介质', 'Both layers homogeneous, isotropic and elastic'),
      t('无衰减（Q → ∞）', 'No attenuation'),
      t('界面水平且完全接触', 'Horizontal, welded interfaces'),
    ],
    breaks: [
      t('实际频散曲线常出现多支，野外需要模态分离', 'Real dispersion curves carry multiple branches; field work requires mode separation'),
      t('横向非均匀引起散射与模态耦合', 'Lateral heterogeneity causes scattering and mode coupling'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('SH 波只有 y 方向位移，与 P–SV 完全解耦', 'SH motion has only the y component and fully decouples from P–SV'),
      latex: String.raw`\frac{\partial^{2}v}{\partial x^{2}}+\frac{\partial^{2}v}{\partial z^{2}}=\frac{1}{\beta^{2}}\frac{\partial^{2}v}{\partial t^{2}},\qquad v=v_y` },
    { n: 2, op: 'setup', title: t('设为沿 x 传播的谐和波', 'Assume harmonic propagation along x'),
      latex: String.raw`v=f(z)\,e^{i(\omega t-kx)},\qquad k=\frac{\omega}{c}` },
    { n: 3, op: 'substitute', title: t('得到 z 方向的常微分方程', 'An ODE in z remains'),
      latex: String.raw`f''+\omega^{2}\!\left(\frac{1}{\beta^{2}}-\frac{1}{c^{2}}\right)f=0` },
    { n: 4, op: 'setup', title: t('层内 c > β₁ ⟹ 振荡解；半空间 c < β₂ ⟹ 衰减解', 'In the layer c > β₁ so oscillatory; in the half-space c < β₂ so evanescent'),
      latex: String.raw`f_1=A\cos(\omega\eta_1 z)+B\sin(\omega\eta_1 z),\qquad f_2=C\,e^{-\omega\hat{\eta}_2 \zeta}`,
      note: t('这一步是整个现象的核心：c < β₂ 使半空间解指数衰减，能量无法泄漏下去 —— 这就是「导波」四个字的数学含义。', 'This step is the heart of the phenomenon: c < β₂ makes the half-space solution decay exponentially so energy cannot leak downward. That is precisely what "guided wave" means.') },
    { n: 5, op: 'physics', title: t('自由地表：z = 0 处应力为零', 'Free surface: traction vanishes at z = 0'),
      latex: String.raw`\mu_1 f_1'(0)=0\;\Longrightarrow\; B=0` },
    { n: 6, op: 'physics', title: t('界面 z = H 处位移与引力连续', 'Continuity of displacement and traction at z = H'),
      latex: String.raw`A\cos(\omega\eta_1H)=C,\qquad -\mu_1 A\omega\eta_1\sin(\omega\eta_1H)=-\mu_2 C\omega\hat{\eta}_2` },
    { n: 7, op: 'result', title: t('两式相除得到频散方程', 'Divide to obtain the dispersion equation'),
      latex: String.raw`\tan\!\left(\omega H\eta_{1}\right)=\frac{\mu_{2}\hat{\eta}_{2}}{\mu_{1}\eta_{1}}` },
    { n: 8, op: 'result', title: t('为什么它叫「频散」', 'Why this is called dispersion'),
      latex: String.raw`c=c(\omega)\;\Longrightarrow\; U=c+k\frac{\dd c}{\dd k}\neq c`,
      note: t('相速度依赖频率 ⟹ 群速度不等于相速度 ⟹ 波列随距离拉长。野外观测到「先低频后高频」正是这个效应。', 'Phase velocity depending on frequency means group velocity differs from phase velocity, stretching the wave train with distance. The observed low-frequency-first pattern is exactly this effect.') },
  ],
  viz: [
    {
      id: 'love-dispersion',
      level: 'V1',
      title: t('多模态频散曲线：相速度 vs 频率', 'Multimode dispersion curves: phase velocity versus frequency'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('相速度 c (m/s)', 'phase velocity c (m/s)'),
      xScale: 'log',
      controls: [
        { id: 'b1', label: t('层内 S 波速度 β₁', 'layer S velocity β₁'), min: 300, max: 2000, step: 10, value: 800, unit: 'm/s' },
        { id: 'b2', label: t('半空间 S 波速度 β₂', 'half-space S velocity β₂'), min: 1500, max: 4500, step: 10, value: 2800, unit: 'm/s' },
        { id: 'Hh', label: t('层厚 H', 'layer thickness H'), min: 50, max: 5000, step: 50, value: 1000, unit: 'm' },
      ],
      xRange: [0.02, 20],
      note: t('每个分支是一个模态；基阶在长周期端趋于 β₂、短周期端趋于 β₁。把层厚 H 调大，模态数量增加 —— 沉积盆地「又厚又软」正是靠这个特征被识别出来的。', 'Each branch is one mode. The fundamental tends to β₂ at long periods and to β₁ at short periods. Increasing H adds modes — this is how thick, soft sedimentary basins are identified.'),
      compute: (p) => {
        const b1 = p['b1'], b2 = p['b2'], H = p['Hh']
        if (!(b2 > b1 * 1.05)) return []
        const mu1 = b1 * b1
        const mu2 = b2 * b2
        const etaMax = Math.sqrt(1 / (b1 * b1) - 1 / (b2 * b2))
        const palette = ['#185FA5', '#A32D2D', '#0F6E56', '#BA7517', '#7F77DD']
        const modes = 4
        const curves: Array<Array<[number, number]>> = Array.from({ length: modes }, () => [])
        const NF = 180
        for (let i = 0; i <= NF; i++) {
          const f = Math.pow(10, Math.log10(0.02) + (i / NF) * Math.log10(1000))
          const w = 2 * Math.PI * f
          const xmax = w * H * etaMax
          for (let n = 0; n < modes; n++) {
            const lo = n * Math.PI + 1e-7
            const hi = Math.min(n * Math.PI + Math.PI / 2 - 1e-7, xmax - 1e-9)
            if (lo >= hi) continue
            const resid = (x: number): number => {
              const eta1 = x / (w * H)
              const invc2 = 1 / (b1 * b1) - eta1 * eta1
              if (invc2 <= 0) return -1
              const eh2sq = invc2 - 1 / (b2 * b2)
              if (eh2sq <= 0) return 1
              return Math.tan(x) - (mu2 * Math.sqrt(eh2sq)) / (mu1 * eta1)
            }
            let a = lo
            let bb = hi
            if (resid(a) * resid(bb) > 0) continue
            for (let it = 0; it < 60; it++) {
              const m = (a + bb) / 2
              if (resid(a) * resid(m) <= 0) bb = m
              else a = m
            }
            const x = (a + bb) / 2
            const eta1 = x / (w * H)
            const invc2 = 1 / (b1 * b1) - eta1 * eta1
            if (invc2 <= 0) continue
            const c = 1 / Math.sqrt(invc2)
            if (c > b1 && c <= b2) curves[n].push([f, c])
          }
        }
        return curves
          .map((pts, n) => ({
            label: n === 0
              ? t('基阶第 0 模态', 'fundamental mode')
              : t(`高阶模态 ${n}`, `higher mode ${n}`),
            color: palette[n % palette.length],
            points: pts,
          }))
          .filter((s) => s.points.length > 1)
      },
    },
    {
      id: 'love-group-velocity',
      level: 'V1',
      title: t('相速度与群速度的差异', 'Phase versus group velocity'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('速度 (m/s)', 'velocity (m/s)'),
      xScale: 'log',
      controls: [
        { id: 'b1g', label: t('层内 S 波速度 β₁', 'layer S velocity β₁'), min: 300, max: 2000, step: 10, value: 800, unit: 'm/s' },
        { id: 'b2g', label: t('半空间 S 波速度 β₂', 'half-space S velocity β₂'), min: 1500, max: 4500, step: 10, value: 2800, unit: 'm/s' },
        { id: 'Hg', label: t('层厚 H', 'layer thickness H'), min: 50, max: 5000, step: 50, value: 1000, unit: 'm' },
      ],
      xRange: [0.05, 20],
      note: t('群速度 U = c + k dc/dk，是能量真正传播的速度。U 通常出现比 c 更低的最小值 —— 频散曲线上的那个「艾里相」就是对应 U 极值处的强烈到时。', 'Group velocity U = c + k dc/dk is what actually carries energy. U usually dips to a minimum below c: the Airy phase on a dispersion curve corresponds to the energetic arrival at that extremum.'),
      compute: (p) => {
        const b1 = p['b1g'], b2 = p['b2g'], H = p['Hg']
        if (!(b2 > b1 * 1.05)) return []
        const mu1 = b1 * b1
        const mu2 = b2 * b2
        const etaMax = Math.sqrt(1 / (b1 * b1) - 1 / (b2 * b2))
        const phase = (f: number): number => {
          const w = 2 * Math.PI * f
          const xmax = w * H * etaMax
          const resid = (x: number): number => {
            const eta1 = x / (w * H)
            const invc2 = 1 / (b1 * b1) - eta1 * eta1
            if (invc2 <= 0) return -1
            const eh2sq = invc2 - 1 / (b2 * b2)
            if (eh2sq <= 0) return 1
            return Math.tan(x) - (mu2 * Math.sqrt(eh2sq)) / (mu1 * eta1)
          }
          const lo = 1e-7
          const hi = Math.min(Math.PI / 2 - 1e-7, xmax - 1e-9)
          if (lo >= hi) return NaN
          let a = lo, bb = hi
          if (resid(a) * resid(bb) > 0) return NaN
          for (let it = 0; it < 60; it++) {
            const m = (a + bb) / 2
            if (resid(a) * resid(m) <= 0) bb = m
            else a = m
          }
          const x = (a + bb) / 2
          const eta1 = x / (w * H)
          const invc2 = 1 / (b1 * b1) - eta1 * eta1
          if (invc2 <= 0) return NaN
          return 1 / Math.sqrt(invc2)
        }
        const cPts: Array<[number, number]> = []
        const uPts: Array<[number, number]> = []
        const xs: number[] = []
        const cs: number[] = []
        for (let i = 0; i <= 160; i++) {
          const f = Math.pow(10, Math.log10(0.05) + (i / 160) * Math.log10(400))
          const c = phase(f)
          if (Number.isFinite(c)) { xs.push(f); cs.push(c) }
        }
        for (let i = 0; i < xs.length; i++) {
          cPts.push([xs[i], cs[i]])
          let dcdk = NaN
          if (i > 0 && i < xs.length - 1) {
            // U = c + k*(dc/dk)，这里 k = ω/c，直接用频率做有限差分近似
            const kprev = (2 * Math.PI * xs[i - 1]) / cs[i - 1]
            const knext = (2 * Math.PI * xs[i + 1]) / cs[i + 1]
            const cprev = cs[i - 1]
            const cnext = cs[i + 1]
            if (knext > kprev) {
              const dcdkVal = (cnext - cprev) / (knext - kprev)
              const k = (2 * Math.PI * xs[i]) / cs[i]
              dcdk = cs[i] + k * dcdkVal
            }
          }
          if (Number.isFinite(dcdk)) uPts.push([xs[i], dcdk])
        }
        return [
          { label: t('相速度 c', 'phase velocity c'), color: '#185FA5', points: cPts },
          { label: t('群速度 U', 'group velocity U'), color: '#A32D2D', dash: true, points: uPts },
        ]
      },
    },
  ],
  numerics: [
    { note: t('求解策略：把方程改写为对 x = ωHη₁ 求根，在第 n 分支 x ∈ (nπ, nπ+π/2) 上二分（本页即用此法实时求解）', 'Solution strategy: solve for x = ωHη₁ and bisect on the n-th branch x ∈ (nπ, nπ+π/2) — this is what this page does live'), snippet: 'bisect(resid, nπ+ε, min(nπ+π/2−ε, ωHη_max))' },
  ],
  links: {
    upstream: [{ id: 'ps-wave-velocities', note: t('提供各层 β', 'supplies per-layer β') }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §7.2' },
    { text: 'Love (1911), Some Problems of Geodynamics' },
  ],

}

export default loveWaveDispersion
