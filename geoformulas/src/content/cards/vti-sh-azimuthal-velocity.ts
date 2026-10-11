import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** vti-sh-azimuthal-velocity */
const vtiShAzimuthalVelocity: FormulaCard = {
  id: 'vti-sh-azimuthal-velocity',
  name: t('VTI 介质 SH 波相速度与 γ 的方位依赖', 'SH Phase Velocity in VTI Media and the Azimuthal Dependence on γ'),
  aliases: {
    zh: ['SH 波相速度', '横波分裂', '方位各向异性', '2ψ 4ψ 谐波分解'],
    en: ['SH phase velocity', 'shear-wave splitting', 'azimuthal anisotropy', '2psi 4psi harmonic decomposition'],
  },
  node: 'S1.6',
  tags: {
    subject: 'S1.6',
    math: ['MATH.GEOM', 'MATH.APPROX', 'MATH.LINALG'],
    method: ['METH.STRUCT', 'METH.ROCK'],
    quantity: ['Q.VEL', 'Q.MAT'],
    keywords: t('SH 相速度 gamma 横波分裂 方位各向异性 HTI 极坐标 2psi 4psi 谐波 裂隙', 'SH phase velocity gamma shear-wave splitting azimuthal anisotropy HTI polar plot 2psi 4psi harmonics fractures'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\rho\,v_{SH}^{2}(\theta)=C_{66}\sin^{2}\theta+C_{44}\cos^{2}\theta\;\Longrightarrow\; v_{SH}(\theta)=\beta_{0}\sqrt{1+2\gamma\sin^{2}\theta}`,
    variants: [
      {
        name: t('弱各向异性一阶式', 'First-order weak-anisotropy form'),
        latex: String.raw`v_{SH}(\theta)\approx\beta_{0}\left(1+\gamma\sin^{2}\theta\right)=\beta_{0}\left[1+\frac{\gamma}{2}\left(1-\cos 2\theta\right)\right]`,
      },
      {
        name: t('对称轴水平（HTI）时 ψ 就是方位角', 'With a horizontal symmetry axis (HTI), ψ becomes the azimuth'),
        latex: String.raw`v_{SH}(\psi)=\beta_{0}\sqrt{1+2\gamma\sin^{2}\psi}\approx\beta_{0}\left[1+\frac{\gamma}{2}\left(1-\cos 2\psi\right)\right]`,
      },
      {
        name: t('横波分裂量', 'The shear-wave splitting'),
        latex: String.raw`\frac{\Delta v}{v}=\frac{v_{SH}-v_{SV}}{v}\approx\gamma\sin^{2}\psi,\qquad \Delta t\approx \frac{L\,\gamma}{v}\ \ (\text{沿对称轴传播时}\ \Delta t=0)`,
      },
      {
        name: t('一般方位谐波分解：2ψ 项与 4ψ 项', 'General azimuthal harmonic decomposition: the 2ψ and 4ψ terms'),
        latex: String.raw`v(\psi)=\bar{v}\left[1+a_{2}\cos 2(\psi-\psi_{2})+a_{4}\cos 4(\psi-\psi_{4})\right],\qquad a_{2}=\frac{\gamma}{2},\ a_{4}=0\ \ (\text{SH，TI})`,
      },
      {
        name: t('4ψ 项从哪来：HTI 中的 qP 速度', 'Where the 4ψ term comes from: the qP velocity in HTI'),
        latex: String.raw`v_{P}(\psi)\approx\alpha_{0}\left(1+\delta^{(V)}\sin^{2}\psi\cos^{2}\psi+\varepsilon^{(V)}\sin^{4}\psi\right)=\alpha_{0}\left[\cdots+\frac{\varepsilon^{(V)}-\delta^{(V)}}{8}\cos 4\psi+\cdots\right]`,
      },
    ],
  },
  meaning: t(
    '在 TI 介质里 SH 波是唯一一个「干净」的模式：它的偏振始终垂直于「传播方向 + 对称轴」所张的平面，不与 P–SV 耦合，速度只由 C₆₆ 与 C₄₄ 两个常数决定，因此 Thomsen 的 γ 就直接读出了横波分裂的强度。把对称轴放平（HTI，垂直裂隙的标准模型），θ 变成方位角 ψ，速度随 cos 2ψ 起伏 —— 这就是「快横波偏振平行于裂隙面、慢横波垂直于裂隙面」的数学表达。注意 SH 在 TI 下只有 2ψ 项；文献里看到的 4ψ 项来自 qP 波（sin²ψcos²ψ 与 sin⁴ψ 展开后都含 cos 4ψ），或来自斜方及更低对称性的介质。',
    'In a TI medium the SH wave is the only "clean" mode: its polarization is always perpendicular to the plane spanned by the propagation direction and the symmetry axis, it never couples to P–SV, and its velocity depends only on C₆₆ and C₄₄. Consequently Thomsen γ reads off the strength of shear-wave splitting directly. Tilt the symmetry axis horizontal (HTI, the standard model for vertical fractures) and θ becomes the azimuth ψ, with the velocity undulating as cos 2ψ. That is the mathematical expression of "the fast shear wave polarizes parallel to the fracture plane, the slow one perpendicular to it". Note that SH in TI carries a 2ψ term only; the 4ψ terms seen in the literature belong to qP (both sin²ψcos²ψ and sin⁴ψ expand into cos 4ψ) or to media of orthorhombic and lower symmetry.',
  ),
  symbols: [
    { sym: 'v_{SH}', name: t('SH 波相速度', 'SH phase velocity'), unit: 'm/s', typical: '900 – 2500' },
    { sym: '\\beta_0', name: t('沿对称轴传播的 S 波速度 √(C₄₄/ρ)', 'S velocity along the symmetry axis, √(C₄₄/ρ)'), unit: 'm/s', typical: '900 – 2200' },
    { sym: '\\gamma', name: t('SH 各向异性强度（横波分裂参数）', 'SH anisotropy strength (splitting parameter)'), unit: '1', typical: '0.00 – 0.30（裂隙储层可达 0.1 以上）' },
    { sym: '\\theta', name: t('传播方向与对称轴的夹角', 'angle between propagation direction and the symmetry axis'), unit: 'rad' },
    { sym: '\\psi', name: t('方位角（自对称轴方向起算）', 'azimuth measured from the symmetry-axis direction'), unit: 'rad' },
    { sym: 'C_{44},C_{66}', name: t('两个剪切模量（对称轴系）', 'the two shear moduli (in the symmetry-axis frame)'), unit: 'Pa', typical: '10⁹ – 10¹⁰' },
    { sym: '\\Delta v/v', name: t('横波分裂的相对速度差', 'relative velocity difference of the split shear waves'), unit: '1' },
  ],
  conditions: {
    applies: [
      t('任意 TI 介质（VTI、HTI、TTI）中的 SH / 准 SH 波', 'SH / quasi-SH waves in any TI medium (VTI, HTI, TTI)'),
      t('对称轴水平时，ψ 可直接当作野外观测的方位角', 'With a horizontal symmetry axis, ψ can be used directly as the field azimuth'),
    ],
    assumes: [
      t('C₆₆ 与 C₄₄ 为实数（无损），且 1 + 2γsin²θ > 0', 'C₆₆ and C₄₄ are real (lossless) and 1 + 2γsin²θ > 0'),
      t('一阶式 v ≈ β₀(1 + γ sin²θ) 只在 |γ| ≲ 0.2 时可靠', 'The first-order form v ≈ β₀(1 + γ sin²θ) is reliable only for |γ| ≲ 0.2'),
      t('HTI 情形假定观测面是水平面、偏振取垂直于「n 与对称轴」平面', 'In the HTI case the observation plane is assumed horizontal and the polarization perpendicular to the (n, symmetry-axis) plane'),
    ],
    breaks: [
      t('若观测面不是水平面（TTI 或倾斜测线），SH 不再是纯 SH，方位响应会混入 4ψ 项', 'If the observation plane is not horizontal (TTI or a dipping survey), the SH mode is no longer pure and 4ψ terms contaminate the azimuthal response'),
      t('两组正交裂隙 → 斜方各向异性，SH 表达式里出现两个独立的 γ 类参数', 'Two orthogonal fracture sets give orthorhombic symmetry and the SH expression involves two independent γ-like parameters'),
      t('强各向异性时 √ 不能展开：用 √(1+2γsin²θ) 本身', 'For strong anisotropy the square root must not be expanded: use √(1 + 2γsin²θ) as it stands'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('SH 波在 TI 介质中解耦', 'The SH wave decouples in a TI medium'),
      latex: String.raw`\hat{\mathbf{e}}_{2}=\frac{\mathbf{n}\times\hat{\mathbf{e}}_{3}}{\left|\mathbf{n}\times\hat{\mathbf{e}}_{3}\right|}\quad(\hat{\mathbf{e}}_{3}=\text{对称轴})\;\Longrightarrow\; \Gamma_{12}=\Gamma_{23}=0`,
      note: t('取 n 在 x₁–x₃ 平面内，则 x₂ 方向既垂直于 n 又垂直于对称轴，Christoffel 矩阵中 Γ₁₂ = Γ₂₃ = 0，x₂ 方向单独成一个 1×1 本征问题。', 'Take n inside the x₁–x₃ plane; then the x₂ direction is perpendicular to both n and the symmetry axis, so Γ₁₂ = Γ₂₃ = 0 and the x₂ direction forms a 1×1 eigenproblem of its own.'),
    },
    {
      n: 2,
      op: 'substitute',
      title: t('写出 Γ₂₂', 'Write out Γ₂₂'),
      latex: String.raw`\rho v_{SH}^{2}=\Gamma_{22}=C_{2j2l}n_{j}n_{l}=C_{66}\sin^{2}\theta+C_{44}\cos^{2}\theta`,
      note: t('n = (sinθ, 0, cosθ)：n₁² 项配 C₂₁₂₁ = C₆₆，n₃² 项配 C₂₃₂₃ = C₄₄，交叉项在 TI 下为零。', 'With n = (sinθ, 0, cosθ), the n₁² term carries C₂₁₂₁ = C₆₆ and the n₃² term C₂₃₂₃ = C₄₄; the cross term vanishes in a TI medium.'),
    },
    {
      n: 3,
      op: 'result',
      title: t('用 γ 改写：C₆₆ = C₄₄(1 + 2γ)', 'Rewrite using γ: C₆₆ = C₄₄(1 + 2γ)'),
      latex: String.raw`v_{SH}(\theta)=\beta_{0}\sqrt{\left(1+2\gamma\right)\sin^{2}\theta+\cos^{2}\theta}=\beta_{0}\sqrt{1+2\gamma\sin^{2}\theta},\qquad \beta_{0}\equiv\sqrt{\frac{C_{44}}{\rho}}`,
      note: t('θ = 0（沿对称轴）时 v = β₀，两个 S 波简并 —— 横波分裂在沿对称轴传播时消失，这是所有 S 波分裂观测的基准。', 'At θ = 0 (along the symmetry axis) v = β₀ and the two S waves are degenerate: splitting vanishes for propagation along the symmetry axis, the reference point of every shear-wave-splitting observation.'),
    },
    {
      n: 4,
      op: 'taylor',
      title: t('弱各向异性：开方并化简三角函数', 'Weak anisotropy: take the square root and reduce the trigonometry'),
      latex: String.raw`v_{SH}\approx\beta_{0}\left(1+\gamma\sin^{2}\theta\right)=\beta_{0}\left[1+\frac{\gamma}{2}\left(1-\cos 2\theta\right)\right]`,
      note: t('sin²θ = (1 − cos 2θ)/2：这一步把「随角度」翻译成「随 2θ 的余弦」—— 方位各向异性里所有 2ψ 项的来源都在这里。', 'Since sin²θ = (1 − cos 2θ)/2, this step translates "angular" into "cosine of twice the angle", and this is where every 2ψ term in azimuthal anisotropy comes from.'),
    },
    {
      n: 5,
      op: 'transform',
      title: t('把对称轴放平：θ 变成方位角 ψ（HTI 模型）', 'Lay the symmetry axis horizontal: θ becomes the azimuth ψ (the HTI model)'),
      latex: String.raw`\hat{\mathbf{e}}_{3}\to\hat{\mathbf{e}}_{1},\quad \mathbf{n}=(\cos\psi,\sin\psi,0)\;\Longrightarrow\; v_{SH}(\psi)=\beta_{0}\sqrt{1+2\gamma\sin^{2}\psi}`,
      note: t('对称轴水平 = 一组垂直裂隙（对称轴沿裂隙法向）。此时水平面内传播的横波按 ψ 分裂：ψ = 0（沿裂隙法向）无分裂，ψ = 90°（沿裂隙走向）分裂最大。', 'A horizontal symmetry axis means a set of vertical fractures (axis along the fracture normal). Shear waves travelling in the horizontal plane then split with azimuth ψ: no splitting at ψ = 0 (along the fracture normal), maximum splitting at ψ = 90° (along the fracture strike).'),
    },
    {
      n: 6,
      op: 'result',
      title: t('谐波分解：为什么 SH 只有 2ψ，而别的模式有 4ψ', 'Harmonic decomposition: why SH has only 2ψ while other modes carry 4ψ'),
      latex: String.raw`v_{SH}(\psi)=\beta_{0}\left[1+\underbrace{\frac{\gamma}{2}}_{a_{2}}\left(1-\cos 2\psi\right)\right],\qquad v_{P}(\psi)=\alpha_{0}\left[\cdots+\frac{\varepsilon^{(V)}-\delta^{(V)}}{8}\cos 4\psi+\cdots\right]`,
      note: t('一般方位各向异性写成 v = v̄[1 + a₂cos2ψ + a₄cos4ψ]。对 TI 中的 SH，a₄ ≡ 0 —— 只有单一 cos 2ψ 的椭圆型图案；4ψ 项出现在 qP 波以及斜方/单斜介质中，所以它常被用来判别「是不是只有一组裂隙」。', 'A general azimuthally anisotropic velocity reads v = v̄[1 + a₂cos2ψ + a₄cos4ψ]. For SH in a TI medium a₄ ≡ 0: an elliptical pattern with a single cos 2ψ. The 4ψ term shows up for qP waves and in orthorhombic or monoclinic media, which is why it is used as a diagnostic of whether more than one fracture set is present.'),
    },
  ],
  viz: [
    {
      id: 'sh-polar-azimuth',
      level: 'V1',
      title: t('方位各向异性的极坐标图', 'Polar plot of the azimuthal anisotropy'),
      xlabel: t('x 方向投影 v·cos ψ (m/s)', 'projection on x: v·cos ψ (m/s)'),
      ylabel: t('y 方向投影 v·sin ψ (m/s)', 'projection on y: v·sin ψ (m/s)'),
      controls: [
        { id: 'sb0', label: t('沿对称轴的 S 波速度 β₀', 'S velocity along the symmetry axis β₀'), min: 900, max: 3500, step: 20, value: 2000, unit: 'm/s' },
        { id: 'sgam', label: t('SH 各向异性 γ', 'SH anisotropy γ'), min: -0.2, max: 0.45, step: 0.01, value: 0.15, unit: '1' },
      ],
      note: t('灰虚线圆是各向同性参考。γ > 0 时曲线向外鼓成一个椭圆，长轴垂直于对称轴 —— 这就是「快横波平行于裂隙面」的几何图像。把 γ 调成负值，椭圆的长轴转 90°。', 'The grey dashed circle is the isotropic reference. For γ > 0 the curve bulges outward into an ellipse whose long axis is perpendicular to the symmetry axis — the geometric picture of "the fast shear wave is parallel to the fracture plane". Make γ negative and the long axis rotates by 90°.'),
      compute: (p) => {
        const b0 = p['sb0'], gam = p['sgam']
        if (!(b0 > 0)) return []
        const curve: Array<[number, number]> = []
        const ref: Array<[number, number]> = []
        const N = 360
        for (let i = 0; i <= N; i++) {
          const psi = (i / N) * 2 * Math.PI
          const s = Math.sin(psi)
          const c = Math.cos(psi)
          const inner = 1 + 2 * gam * s * s
          if (!(inner > 0)) continue
          const v = b0 * Math.sqrt(inner)
          curve.push([v * c, v * s])
          ref.push([b0 * c, b0 * s])
        }
        return [
          { label: t('SH 方位速度', 'SH azimuthal velocity'), color: '#185FA5', points: curve },
          { label: t('各向同性参考', 'isotropic reference'), color: '#B4B2A9', dash: true, points: ref },
        ]
      },
    },
    {
      id: 'sh-azimuth-cartesian',
      level: 'V1',
      title: t('SH 速度随方位角的变化（2ψ 振荡）', 'SH velocity versus azimuth (the 2ψ oscillation)'),
      xlabel: t('方位角 ψ (°)', 'azimuth ψ (°)'),
      ylabel: t('SH 相速度 (m/s)', 'SH phase velocity (m/s)'),
      controls: [
        { id: 'cb0', label: t('沿对称轴的 S 波速度 β₀', 'S velocity along the symmetry axis β₀'), min: 900, max: 3500, step: 20, value: 2000, unit: 'm/s' },
        { id: 'cgam', label: t('SH 各向异性 γ', 'SH anisotropy γ'), min: -0.2, max: 0.45, step: 0.01, value: 0.15, unit: '1' },
      ],
      xRange: [0, 360],
      note: t('在一个 0°–360° 的方位周期里速度只振荡两次 —— 这就是「2ψ」。振荡幅度等于 γ·β₀，所以直接用多方位的横波走时拟合余弦曲线就能反演出 γ。', 'Over one full 0°–360° azimuthal period the velocity oscillates exactly twice — that is the "2ψ". The amplitude equals γ·β₀, so fitting a cosine to multi-azimuth shear-wave travel times inverts γ directly.'),
      compute: (p) => {
        const b0 = p['cb0'], gam = p['cgam']
        if (!(b0 > 0)) return []
        const exact: Array<[number, number]> = []
        const weak: Array<[number, number]> = []
        const N = 240
        for (let i = 0; i <= N; i++) {
          const psi = (i / N) * 2 * Math.PI
          const s = Math.sin(psi)
          const inner = 1 + 2 * gam * s * s
          const deg = (i / N) * 360
          if (inner > 0) exact.push([deg, b0 * Math.sqrt(inner)])
          weak.push([deg, b0 * (1 + gam * s * s)])
        }
        return [
          { label: t('精确 √(1+2γsin²ψ)', 'exact √(1+2γsin²ψ)'), color: '#185FA5', points: exact },
          { label: t('一阶 1+γsin²ψ', 'first order 1+γsin²ψ'), color: '#BA7517', dash: true, points: weak },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'christoffel-equation', note: t('SH 支从 Christoffel 矩阵中解耦出来', 'the SH branch decouples from the Christoffel matrix') },
      { id: 'thomsen-parameters', note: t('γ 的定义', 'the definition of γ') },
    ],
    seealso: [{ id: 'ps-wave-velocities', note: t('各向同性下 α、β 的定义', 'the isotropic definitions of α and β') }],
  },
  refs: [
    { text: 'Thomsen (1986), Weak elastic anisotropy, Geophysics 51, 1954–1966' },
    { text: 'Crampin (1984), Effective anisotropic elastic constants for wave propagation through cracked solids, GJI 76' },
    { text: 'Rüger, Reflection Coefficients and Azimuthal AVO Analysis in Anisotropic Media, SEG (2002)' },
  ],
}

export default vtiShAzimuthalVelocity
