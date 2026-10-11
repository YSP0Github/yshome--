import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** christoffel-equation */
const christoffelEquation: FormulaCard = {
  id: 'christoffel-equation',
  name: t('Christoffel 方程', 'The Christoffel Equation'),
  aliases: {
    zh: ['克里斯托费尔方程', 'Kelvin–Christoffel 矩阵', '各向异性本征值问题'],
    en: ['Christoffel equation', 'Kelvin-Christoffel matrix', 'anisotropic eigenvalue problem'],
  },
  node: 'S1.6',
  tags: {
    subject: 'S1.6',
    math: ['MATH.LINALG', 'MATH.VECTOR', 'MATH.ROOT'],
    method: ['METH.STRUCT'],
    quantity: ['Q.VEL', 'Q.TENSOR'],
    keywords: t('Christoffel 方程 本征值 偏振 相速度 准纵波 准横波 各向异性 波面', 'Christoffel equation eigenvalue polarization phase velocity quasi-longitudinal quasi-transverse anisotropy wave surface'),
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\left(\Gamma_{ik}-\rho v^{2}\delta_{ik}\right)u_{k}=0,\qquad \Gamma_{ik}=C_{ijkl}\,n_{j}n_{l}`,
    variants: [
      {
        name: t('特征值方程（v² 的三次方程）', 'Characteristic equation (a cubic in v²)'),
        latex: String.raw`\det\!\left(\Gamma_{ik}-\rho v^{2}\delta_{ik}\right)=0`,
      },
      {
        name: t('用慢度矢量 p = n / v 写出的等价形式', 'Equivalent form using the slowness vector p = n / v'),
        latex: String.raw`\left(C_{ijkl}\,p_{j}p_{l}-\rho\,\delta_{ik}\right)u_{k}=0`,
      },
      {
        name: t('VTI 介质中 n 在 x₁–x₃ 平面内的显式矩阵', 'Explicit matrix for a VTI medium with n inside the x₁–x₃ plane'),
        latex: String.raw`\Gamma=\begin{bmatrix}C_{11}\sin^{2}\theta+C_{44}\cos^{2}\theta&0&\left(C_{13}+C_{44}\right)\sin\theta\cos\theta\\ 0&C_{66}\sin^{2}\theta+C_{44}\cos^{2}\theta&0\\ \left(C_{13}+C_{44}\right)\sin\theta\cos\theta&0&C_{44}\sin^{2}\theta+C_{33}\cos^{2}\theta\end{bmatrix}`,
      },
      {
        name: t('各向同性时退化为 α² 与两个 β²', 'Degenerates to α² and a double β² in the isotropic limit'),
        latex: String.raw`C_{ijkl}=\lambda\delta_{ij}\delta_{kl}+\mu\left(\delta_{ik}\delta_{jl}+\delta_{il}\delta_{jk}\right)\;\Longrightarrow\; \rho v^{2}\in\left\{\lambda+2\mu,\ \mu,\ \mu\right\}`,
      },
    ],
  },
  meaning: t(
    '把平面波试探解代进各向异性的运动方程，空间导数全部变成「与传播方向 n 的点乘」，于是偏微分方程塌缩成一个 3×3 的对称矩阵特征值问题：特征值的平方根就是三个体波速度，特征矢量就是它们的偏振方向。这是整个各向异性地震学的枢纽 —— 相速度、偏振、群速度、反射系数、走时反演，统统从这里出发。因为矩阵对称，三个特征值恒为实数且偏振互相正交；但偏振一般既不平行也不垂直于 n，所以只能叫「准」P 波与「准」S 波。',
    'Substituting a plane-wave trial solution into the anisotropic equation of motion turns every spatial derivative into a contraction with the propagation direction n, so the PDE collapses into a 3×3 symmetric eigenvalue problem: the square roots of the eigenvalues are the three body-wave velocities and the eigenvectors are their polarizations. This is the hub of anisotropic seismology — phase velocity, polarization, group velocity, reflection coefficients and travel-time inversion all start here. Because the matrix is symmetric, the three eigenvalues are always real and the polarizations mutually orthogonal; but the polarization is generally neither parallel nor perpendicular to n, which is why the modes are called quasi-P and quasi-S.',
  ),
  symbols: [
    { sym: '\\Gamma_{ik}', name: t('Christoffel 矩阵（Kelvin–Christoffel）', 'Christoffel (Kelvin–Christoffel) matrix'), unit: 'Pa' },
    { sym: 'n_j', name: t('传播方向的单位矢量分量', 'component of the unit propagation-direction vector'), unit: '1' },
    { sym: 'u_k', name: t('偏振（位移）矢量分量', 'component of the polarization (displacement) vector'), unit: 'm' },
    { sym: 'v', name: t('相速度', 'phase velocity'), unit: 'm/s', typical: '1000 – 8000' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '2000 – 2700' },
    { sym: 'C_{ijkl}', name: t('四阶刚度张量', 'fourth-rank stiffness tensor'), unit: 'Pa' },
    { sym: '\\theta', name: t('传播方向与对称轴的夹角', 'angle between propagation direction and the symmetry axis'), unit: 'rad' },
  ],
  conditions: {
    applies: [
      t('任意各向异性弹性介质中的平面体波', 'Plane body waves in an arbitrarily anisotropic elastic medium'),
      t('介质在波长尺度上可视为均匀（局部平面波近似）', 'The medium is homogeneous at the wavelength scale (local plane-wave approximation)'),
    ],
    assumes: [
      t('无损弹性（C 为实数）⟹ Γ 实对称 ⟹ 三个实数 v² 与正交偏振', 'Lossless elasticity (real C), so Γ is real symmetric and yields three real v² with orthogonal polarizations'),
      t('Γ 正定（介质稳定）⟹ v² > 0', 'Γ positive definite (stable medium), hence v² > 0'),
      t('n 为给定的单位矢量；这里求的是相速度，不是群速度', 'n is a prescribed unit vector; the result is a phase velocity, not a group velocity'),
    ],
    breaks: [
      t('有耗散（黏弹性）时 Γ 变复数、偏振变椭圆、三个模式不再正交', 'With dissipation (viscoelasticity) Γ becomes complex, polarization becomes elliptical and the three modes are no longer orthogonal'),
      t('强非均匀或界面附近，平面波试探解本身不成立', 'Near strong heterogeneity or interfaces the plane-wave trial solution itself breaks down'),
      t('群速度（能量方向）不等于 n 方向，射线追踪必须另行计算 ∇_n(ρv²)', 'Group velocity (the energy direction) differs from n, so ray tracing requires the separate gradient ∇_n(ρv²)'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('平面波试探解', 'Plane-wave trial solution'),
      latex: String.raw`\mathbf{u}=\mathbf{a}\,e^{i\omega\left(t-\frac{\mathbf{n}\cdot\mathbf{x}}{v}\right)},\qquad |\mathbf{n}|=1`,
      note: t('n 是传播方向（相位的法向），a 是常振幅偏振矢量，v 是相速度。三者都是待求的。', 'n is the propagation direction (normal to the phase front), a is the constant polarization vector and v the phase velocity. All three are unknown at this point.'),
    },
    {
      n: 2,
      op: 'physics',
      title: t('各向异性运动方程 + 广义胡克定律', 'Anisotropic equation of motion plus the generalized Hooke law'),
      latex: String.raw`\rho\,\frac{\partial^{2}u_{i}}{\partial t^{2}}=\frac{\partial \sigma_{ij}}{\partial x_{j}},\qquad \sigma_{ij}=C_{ijkl}\,\varepsilon_{kl}=C_{ijkl}\,\frac{\partial u_{k}}{\partial x_{l}}`,
    },
    {
      n: 3,
      op: 'substitute',
      title: t('每个空间导数都带下一个 −iωn/v', 'Every spatial derivative brings down a factor −iωn/v'),
      latex: String.raw`\frac{\partial^{2}}{\partial t^{2}}\to-\omega^{2},\qquad \frac{\partial}{\partial x_{j}}\to-\frac{i\omega}{v}n_{j}\;\Longrightarrow\; -\rho\omega^{2}a_{i}=-\frac{\omega^{2}}{v^{2}}\,C_{ijkl}\,n_{j}n_{l}\,a_{k}`,
    },
    {
      n: 4,
      op: 'algebra',
      title: t('消去 −ω²，定义 Christoffel 矩阵', 'Cancel −ω² and define the Christoffel matrix'),
      latex: String.raw`C_{ijkl}\,n_{j}n_{l}\,a_{k}=\rho v^{2}a_{i}\;\Longleftrightarrow\; \Gamma_{ik}a_{k}=\rho v^{2}a_{i},\qquad \Gamma_{ik}\equiv C_{ijkl}n_{j}n_{l}`,
      note: t('注意频率 ω 完全消失了：无损弹性介质中相速度与频率无关（无色散）。', 'Note that ω drops out entirely: in a lossless elastic medium the phase velocity is frequency independent (non-dispersive).'),
    },
    {
      n: 5,
      op: 'identity',
      title: t('Γ 对称正定 ⟹ 三个正实特征值与正交偏振', 'Γ is symmetric positive definite: three positive real eigenvalues and orthogonal polarizations'),
      latex: String.raw`\Gamma_{ik}=\Gamma_{ki}\;\Longrightarrow\; \rho v^{2}\in\{\lambda_{1},\lambda_{2},\lambda_{3}\}\subset \mathbb{R}^{+},\qquad \mathbf{a}^{(m)}\cdot\mathbf{a}^{(n)}=\delta_{mn}`,
      note: t('对称性来自 C 的主对称性；正定性来自应变能必须为正（介质稳定）。', 'Symmetry follows from the major symmetry of C; positive definiteness from the requirement that strain energy be positive (a stable medium).'),
    },
    {
      n: 6,
      op: 'result',
      title: t('三个模式按偏振与 n 的夹角命名', 'The three modes are named by the angle between polarization and n'),
      latex: String.raw`\rho v_{1}^{2}\ (\text{qP}),\qquad \rho v_{2}^{2}\ (\text{qSV}),\qquad \rho v_{3}^{2}\ (\text{SH}),\qquad \cos\psi_{m}=\frac{\mathbf{a}^{(m)}\cdot\mathbf{n}}{|\mathbf{a}^{(m)}|}`,
      note: t('除对称方向外 ψ ≠ 0 且 ψ ≠ 90°，所以严格说没有纯 P 波与纯 S 波，只有「准」P 与「准」S。', 'Apart from symmetry directions, ψ is neither 0 nor 90°, so strictly speaking there is no pure P or pure S wave — only quasi-P and quasi-S.'),
    },
  ],
  viz: [
    {
      id: 'christoffel-velocity-sheets',
      level: 'V1',
      title: t('VTI 介质的三张相速度面', 'The three phase-velocity sheets of a VTI medium'),
      xlabel: t('与对称轴的夹角 θ (°)', 'angle from the symmetry axis θ (°)'),
      ylabel: t('相速度 (m/s)', 'phase velocity (m/s)'),
      controls: [
        { id: 'ca0', label: t('垂直 P 波速度 α₀', 'vertical P velocity α₀'), min: 2000, max: 6000, step: 50, value: 3000, unit: 'm/s' },
        { id: 'cb0', label: t('垂直 S 波速度 β₀', 'vertical S velocity β₀'), min: 800, max: 3000, step: 20, value: 1500, unit: 'm/s' },
        { id: 'ceps', label: t('P 波各向异性 ε', 'P anisotropy ε'), min: 0, max: 0.4, step: 0.01, value: 0.15, unit: '1' },
        { id: 'cdel', label: t('近垂直弯曲 δ', 'near-vertical curvature δ'), min: -0.15, max: 0.35, step: 0.01, value: 0.05, unit: '1' },
        { id: 'cgam', label: t('SH 各向异性 γ', 'SH anisotropy γ'), min: -0.2, max: 0.4, step: 0.01, value: 0.15, unit: '1' },
      ],
      xRange: [0, 90],
      note: t('三条曲线是 Γ 的三个特征值开方。θ = 0（沿对称轴）时 qSV 与 SH 简并 —— 这正是横波分裂沿对称轴消失的原因；一旦离开对称轴，两条 S 波曲线立刻分开，分裂量正比于 γ。', 'The three curves are the square roots of the three eigenvalues of Γ. At θ = 0 (along the symmetry axis) qSV and SH are degenerate, which is why shear-wave splitting vanishes along the symmetry axis. Away from it the two S branches separate immediately, with a splitting proportional to γ.'),
      compute: (p) => {
        const rho = 2500
        const a0 = p['ca0'], b0 = p['cb0'], eps = p['ceps'], del = p['cdel'], gam = p['cgam']
        if (!(a0 > b0 * 1.15)) return []
        const C33 = rho * a0 * a0
        const C44 = rho * b0 * b0
        const C11 = C33 * (1 + 2 * eps)
        const C66 = C44 * (1 + 2 * gam)
        const D = C33 - C44
        const arg = D * D + 2 * del * C33 * D
        if (!(arg > 0)) return []
        const C13 = -C44 + Math.sqrt(arg)
        const qP: Array<[number, number]> = []
        const qSV: Array<[number, number]> = []
        const sh: Array<[number, number]> = []
        const N = 180
        for (let i = 0; i <= N; i++) {
          const th = (i / N) * (Math.PI / 2)
          const s = Math.sin(th)
          const c = Math.cos(th)
          const s2 = s * s
          const c2 = c * c
          const G11 = C11 * s2 + C44 * c2
          const G33 = C44 * s2 + C33 * c2
          const G13 = (C13 + C44) * s * c
          const G22 = C66 * s2 + C44 * c2
          const tr = 0.5 * (G11 + G33)
          const dif = 0.5 * (G11 - G33)
          const rad = Math.sqrt(dif * dif + G13 * G13)
          const lP = tr + rad
          const lS = Math.max(tr - rad, 1e-6)
          qP.push([(i / N) * 90, Math.sqrt(lP / rho)])
          qSV.push([(i / N) * 90, Math.sqrt(lS / rho)])
          sh.push([(i / N) * 90, Math.sqrt(Math.max(G22, 1e-6) / rho)])
        }
        return [
          { label: t('qP', 'qP'), color: '#185FA5', points: qP },
          { label: t('qSV', 'qSV'), color: '#0F6E56', points: qSV },
          { label: t('SH', 'SH'), color: '#BA7517', points: sh },
        ]
      },
    },
    {
      id: 'christoffel-polarization',
      level: 'V1',
      title: t('偏振方向与传播方向的偏离角', 'Deviation of the polarization from the propagation direction'),
      xlabel: t('与对称轴的夹角 θ (°)', 'angle from the symmetry axis θ (°)'),
      ylabel: t('偏振偏离角 ψ (°)', 'polarization deviation ψ (°)'),
      controls: [
        { id: 'pa0', label: t('垂直 P 波速度 α₀', 'vertical P velocity α₀'), min: 2000, max: 6000, step: 50, value: 3000, unit: 'm/s' },
        { id: 'pb0', label: t('垂直 S 波速度 β₀', 'vertical S velocity β₀'), min: 800, max: 3000, step: 20, value: 1500, unit: 'm/s' },
        { id: 'peps', label: t('P 波各向异性 ε', 'P anisotropy ε'), min: 0, max: 0.4, step: 0.01, value: 0.15, unit: '1' },
        { id: 'pdel', label: t('近垂直弯曲 δ', 'near-vertical curvature δ'), min: -0.15, max: 0.35, step: 0.01, value: 0.05, unit: '1' },
      ],
      xRange: [0, 90],
      note: t('ψ = 0 表示偏振平行于 n（纯纵波），ψ = 90° 表示垂直（纯横波）。qP 在 0° 与 90° 两端都是纯的（ψ = 0），中间偏离最大 —— 各向异性越强，偏离越大。这就是「准」字的定量含义，也是三分量数据处理中偏振校正的直接依据。', 'ψ = 0 means the polarization is parallel to n (a pure longitudinal wave), ψ = 90° perpendicular (pure transverse). qP is pure at both ends (0° and 90°) and deviates most in between; the stronger the anisotropy, the larger the deviation. This is the quantitative meaning of the prefix "quasi", and the direct basis for polarization correction in three-component processing.'),
      compute: (p) => {
        const rho = 2500
        const a0 = p['pa0'], b0 = p['pb0'], eps = p['peps'], del = p['pdel']
        if (!(a0 > b0 * 1.15)) return []
        const C33 = rho * a0 * a0
        const C44 = rho * b0 * b0
        const C11 = C33 * (1 + 2 * eps)
        const D = C33 - C44
        const arg = D * D + 2 * del * C33 * D
        if (!(arg > 0)) return []
        const C13 = -C44 + Math.sqrt(arg)
        const eig = (a: number, b: number, d: number, lam: number): [number, number] => {
          const v1 = lam - d, v2 = b
          const w1 = b, w2 = lam - a
          const nv = v1 * v1 + v2 * v2
          const nw = w1 * w1 + w2 * w2
          return nv >= nw ? [v1, v2] : [w1, w2]
        }
        const devP: Array<[number, number]> = []
        const devS: Array<[number, number]> = []
        const N = 180
        for (let i = 0; i <= N; i++) {
          const th = (i / N) * (Math.PI / 2)
          const s = Math.sin(th)
          const c = Math.cos(th)
          const s2 = s * s
          const c2 = c * c
          const G11 = C11 * s2 + C44 * c2
          const G33 = C44 * s2 + C33 * c2
          const G13 = (C13 + C44) * s * c
          const tr = 0.5 * (G11 + G33)
          const dif = 0.5 * (G11 - G33)
          const rad = Math.sqrt(dif * dif + G13 * G13)
          const lP = tr + rad
          const lS = tr - rad
          const deg = (i / N) * 90
          const eP = eig(G11, G13, G33, lP)
          const nP = Math.sqrt(eP[0] * eP[0] + eP[1] * eP[1])
          if (nP > 1e-9) {
            const cosv = (eP[0] * s + eP[1] * c) / nP
            const cl = Math.max(-1, Math.min(1, cosv))
            devP.push([deg, (Math.acos(cl) * 180) / Math.PI])
          }
          const eS = eig(G11, G13, G33, lS)
          const nS = Math.sqrt(eS[0] * eS[0] + eS[1] * eS[1])
          if (nS > 1e-9) {
            const cosv = Math.abs(eS[0] * s + eS[1] * c) / nS
            const cl = Math.max(-1, Math.min(1, cosv))
            devS.push([deg, (Math.acos(cl) * 180) / Math.PI])
          }
        }
        return [
          { label: t('qP 的偏振偏离角', 'qP polarization deviation'), color: '#185FA5', points: devP },
          { label: t('qSV 的偏振偏离角', 'qSV polarization deviation'), color: '#0F6E56', points: devS },
        ]
      },
    },
  ],
  links: {
    upstream: [{ id: 'vti-elastic-constants', note: t('提供 C_IJ', 'supplies the C_IJ') }],
    downstream: [
      { id: 'thomsen-qp-qsv-velocity', note: t('对 P–SV 块做弱各向异性展开', 'weak-anisotropy expansion of the P–SV block') },
      { id: 'vti-sh-azimuthal-velocity', note: t('SH 支单独解耦', 'the SH branch decouples on its own') },
    ],
    seealso: [{ id: 'navier-equation', note: t('各向同性特例下的运动方程', 'the equation of motion in the isotropic special case') }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.1' },
    { text: 'Musgrave, Crystal Acoustics, Holden-Day (1970)' },
    { text: 'Tsvankin, Seismic Signatures and Analysis of Reflection Data in Anisotropic Media, ch. 1' },
  ],
}

export default christoffelEquation
