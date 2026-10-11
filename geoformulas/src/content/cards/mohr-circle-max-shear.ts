import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mohr-circle-max-shear */
const mohrCircleMaxShear: FormulaCard = {
  id: 'mohr-circle-max-shear',
  name: t('最大剪应力与 Mohr 圆', 'Maximum Shear Stress and the Mohr Circle'),
  aliases: { zh: ['莫尔圆', '应力圆', '库仑破裂准则'], en: ['Mohr circle', 'stress circle', 'Coulomb failure criterion'] },
  node: 'S1.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.LINALG'],
    method: ['METH.ROCK', 'METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('莫尔圆 最大剪应力 主应力 库仑破裂 内聚力 摩擦系数 断层面 45度', 'Mohr circle maximum shear principal stress Coulomb failure cohesion friction fault plane'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\left(\sigma_n-\frac{\sigma_1+\sigma_3}{2}\right)^{2}+\tau^{2}=\left(\frac{\sigma_1-\sigma_3}{2}\right)^{2}`,
    variants: [
      { name: t('参数形式（θ 为截面法向与 σ₁ 轴的夹角）', 'Parametric form, θ being the angle between the plane normal and σ₁'), latex: String.raw`\sigma_n=\frac{\sigma_1+\sigma_3}{2}+\frac{\sigma_1-\sigma_3}{2}\cos 2\theta,\qquad \tau=-\frac{\sigma_1-\sigma_3}{2}\sin 2\theta` },
      { name: t('最大剪应力与作用面', 'Maximum shear stress and where it acts'), latex: String.raw`\tau_{\max}=\frac{\sigma_1-\sigma_3}{2}\quad\text{at}\quad \theta=45^{\circ}` },
      { name: t('三维：三个圆', 'In three dimensions: three circles'), latex: String.raw`\text{radii:}\ \frac{\sigma_1-\sigma_2}{2},\ \frac{\sigma_2-\sigma_3}{2},\ \frac{\sigma_1-\sigma_3}{2}` },
      { name: t('库仑破裂准则（压为正）', 'Coulomb failure criterion, compression positive'), latex: String.raw`\tau=C+\mu_f\,\sigma_n` },
      { name: t('由摩擦角给出断层夹角', 'Fault angle from the friction angle'), latex: String.raw`\mu_f=\tan\varphi\;\Longrightarrow\; \theta_f=45^{\circ}+\frac{\varphi}{2}` },
    ],
  },
  meaning: t(
    '把一个点的全部应力状态画成一个圆：横坐标是截面上的正应力，纵坐标是剪应力，圆上每一点对应一个取向的截面。圆与破裂包络线相切的那一刻就是岩石破裂的时刻 —— 这张图把「应力状态」「岩石强度」「断层面取向」三件事压在了一张纸上，是岩石力学里最有力的一张图。',
    'Draw the entire stress state at a point as one circle: the abscissa is the normal stress on a plane, the ordinate the shear stress, and every point on the circle is one orientation. The instant the circle touches the failure envelope is the instant the rock breaks. This single diagram compresses three things — the stress state, the rock strength and the fault-plane orientation — onto one sheet of paper, and it is the most powerful picture in rock mechanics.',
  ),
  symbols: [
    { sym: '\\sigma_n', name: t('截面上的正应力（压为正）', 'normal stress on the plane, compression positive'), unit: 'Pa' },
    { sym: '\\tau', name: t('截面上的剪应力', 'shear stress on the plane'), unit: 'Pa' },
    { sym: '\\sigma_1,\\sigma_3', name: t('最大与最小主应力', 'maximum and minimum principal stresses'), unit: 'Pa', typical: '10⁶ – 10⁹ Pa' },
    { sym: '\\theta', name: t('截面法向与 σ₁ 轴的夹角', 'angle between the plane normal and the σ₁ axis'), unit: '°', typical: '0 – 90' },
    { sym: '\\tau_{\\max}', name: t('最大剪应力', 'maximum shear stress'), unit: 'Pa' },
    { sym: 'C', name: t('内聚力（ cohesion，不是弹性张量）', 'cohesion (not the elastic tensor)'), unit: 'Pa', typical: '1 – 50 MPa' },
    { sym: '\\mu_f', name: t('内摩擦系数（不是剪切模量）', 'internal friction coefficient (not the shear modulus)'), unit: '', dimension: '无量纲', typical: '0.6 – 1.0' },
    { sym: '\\varphi', name: t('内摩擦角', 'internal friction angle'), unit: '°', typical: '30 – 45' },
  ],
  conditions: {
    applies: [
      t('任意二维（或取最大圆的三维）应力状态', 'Any two-dimensional stress state, or the largest circle in 3D'),
      t('判断岩石是否破裂、以及将沿哪个面破裂', 'Deciding whether rock fails and on which plane'),
    ],
    assumes: [
      t('压为正（地震学约定）；工程力学若取拉为正需把圆沿 σ 轴翻转', 'Compression positive, the seismological convention; engineering texts taking tension positive flip the circle'),
      t('材料均匀、无先存弱面（先存断层需另加滑动准则）', 'The material is homogeneous with no pre-existing weak plane; a pre-existing fault requires a separate slip criterion'),
      t('有效应力：孔隙压力要从 σ_n 中扣除', 'Effective stress: pore pressure must be subtracted from σ_n'),
    ],
    breaks: [
      t('存在先存断层面时，破裂发生在弱面上而非最有利面上', 'With a pre-existing fault, slip occurs on the weak plane rather than on the optimal one'),
      t('延性变形、高温蠕变区不再适用库仑准则', 'Ductile deformation and high-temperature creep no longer obey the Coulomb criterion'),
      t('真三轴状态下中间主应力 σ₂ 也会影响强度，二维 Mohr 圆无法体现', 'In true triaxial states the intermediate principal stress also affects strength, which a 2D Mohr circle cannot capture'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('在主轴坐标系里写应力', 'Write the stress in the principal frame'),
      latex: String.raw`\boldsymbol{\sigma}=\begin{bmatrix} \sigma_1 & 0\\ 0 & \sigma_3 \end{bmatrix},\qquad \hat{\boldsymbol{n}}=\begin{bmatrix} \cos\theta\\ \sin\theta \end{bmatrix}` },
    { n: 2, op: 'substitute', title: t('代入 Cauchy 公式求牵引力', 'Insert into Cauchy’s formula for the traction'),
      latex: String.raw`t_1=\sigma_1\cos\theta,\qquad t_2=\sigma_3\sin\theta` },
    { n: 3, op: 'geometry', title: t('投影到法向与切向', 'Project onto the normal and tangential directions'),
      latex: String.raw`\sigma_n=\boldsymbol{t}\cdot\hat{\boldsymbol{n}}=\sigma_1\cos^{2}\theta+\sigma_3\sin^{2}\theta,\qquad \tau=t_2\cos\theta-t_1\sin\theta` },
    { n: 4, op: 'identity', title: t('用倍角公式改写', 'Rewrite with the double-angle identities'),
      latex: String.raw`\sigma_n=\frac{\sigma_1+\sigma_3}{2}+\frac{\sigma_1-\sigma_3}{2}\cos 2\theta,\qquad \tau=-\frac{\sigma_1-\sigma_3}{2}\sin 2\theta`,
      note: t('到这一步已经能看出这是个圆的参数方程：θ 只以 2θ 的形式出现，说明截面转 180° 对应圆上走一圈。', 'At this point the parametric equation of a circle is visible: θ appears only as 2θ, so rotating the plane through 180° traverses the circle once.') },
    { n: 5, op: 'algebra', title: t('消去 θ 得到圆方程', 'Eliminate θ to obtain the circle'),
      latex: String.raw`\left(\sigma_n-\frac{\sigma_1+\sigma_3}{2}\right)^{2}+\tau^{2}=\left(\frac{\sigma_1-\sigma_3}{2}\right)^{2}`,
      note: t('圆心在 ((σ₁+σ₃)/2, 0)，半径 (σ₁−σ₃)/2 —— 半径就是最大剪应力。', 'The centre sits at ((σ₁+σ₃)/2, 0) with radius (σ₁−σ₃)/2, and that radius is the maximum shear stress.') },
    { n: 6, op: 'result', title: t('令 dτ/dθ = 0，最大剪应力出现在 45° 面上', 'Setting dτ/dθ = 0, the maximum shear lies on 45° planes'),
      latex: String.raw`\tau_{\max}=\frac{\sigma_1-\sigma_3}{2}\ \text{at}\ 2\theta=90^{\circ},\qquad \sigma_n=\frac{\sigma_1+\sigma_3}{2}` },
    { n: 7, op: 'result', title: t('与库仑包络相切 ⟹ 破裂角', 'Tangency to the Coulomb envelope gives the failure angle'),
      latex: String.raw`\frac{\mathrm{d}\tau}{\mathrm{d}\sigma_n}\bigg|_{\text{envelope}}=\mu_f=\tan\varphi\;\Longrightarrow\; 2\theta_f=90^{\circ}+\varphi`,
      note: t('取 μ_f ≈ 0.6（φ ≈ 30°）得 θ_f ≈ 60°，即断层面法向与 σ₁ 成 60° —— 断层面本身与 σ₁ 成约 30°，与野外观测的共轭断层夹角一致。', 'With μ_f ≈ 0.6, that is φ ≈ 30°, the result is θ_f ≈ 60°: the fault normal lies 60° from σ₁, so the fault plane itself is about 30° from σ₁, matching the conjugate fault angles seen in the field.') },
  ],
  viz: [
    {
      id: 'mohr-circle',
      level: 'V1',
      title: t('Mohr 圆与库仑破裂包络', 'The Mohr circle and the Coulomb failure envelope'),
      xlabel: t('正应力 σn (MPa，压为正)', 'normal stress σn (MPa, compression positive)'),
      ylabel: t('剪应力 τ (MPa)', 'shear stress τ (MPa)'),
      controls: [
        { id: 'mc1', label: t('最大主应力 σ₁', 'maximum principal stress σ₁'), min: 0, max: 600, step: 5, value: 200, unit: 'MPa' },
        { id: 'mc3', label: t('最小主应力 σ₃', 'minimum principal stress σ₃'), min: 0, max: 600, step: 5, value: 40, unit: 'MPa' },
        { id: 'muf', label: t('内摩擦系数 μf', 'friction coefficient μf'), min: 0.1, max: 1.5, step: 0.05, value: 0.6, unit: '' },
        { id: 'coh', label: t('内聚力 C', 'cohesion C'), min: 0, max: 60, step: 1, value: 10, unit: 'MPa' },
      ],
      xRange: [0, 620],
      yRange: [0, 320],
      note: t('同时拖 σ₁ 与 σ₃ 只改圆的位置和半径；拖 μf 与 C 只改包络线的斜率与截距。当圆与红线相切时岩石破裂；让 σ₃ 变小（或孔隙压力等效地降低 σ₃），圆左移变大，很快就切到包络线 —— 这就是「降低有效围压可以诱发地震」的几何说法。', 'Dragging σ₁ and σ₃ moves and resizes the circle; μf and C set the slope and intercept of the envelope. The rock fails when the circle touches the red line. Lower σ₃, or equivalently raise pore pressure, and the circle shifts left and grows until it touches the envelope — the geometric statement of why reducing effective confining pressure can trigger earthquakes.'),
      compute: (p) => {
        const s1 = Math.max(p['mc1'], p['mc3'])
        const s3 = Math.min(p['mc1'], p['mc3'])
        const muf = p['muf']
        const coh = p['coh']
        const c = (s1 + s3) / 2
        const r = (s1 - s3) / 2
        const circ: Array<[number, number]> = []
        for (let i = 0; i <= 240; i++) {
          const th = (i / 240) * Math.PI * 2
          const sn = c + r * Math.cos(th)
          const tau = r * Math.sin(th)
          circ.push([sn, tau])
        }
        circ.push([circ[0][0], circ[0][1]])
        const env: Array<[number, number]> = []
        const xmax = Math.max(s1 + 40, 100)
        for (let i = 0; i <= 200; i++) {
          const sn = (i / 200) * xmax
          env.push([sn, coh + muf * sn])
        }
        const axis: Array<[number, number]> = [[0, 0], [xmax, 0]]
        return [
          { label: t('Mohr 圆（所有可能截面）', 'Mohr circle (all possible planes)'), color: '#185FA5', points: circ },
          { label: t('库仑包络 τ = C + μf σn', 'Coulomb envelope τ = C + μf σn'), color: '#993C1D', points: env },
          { label: t('τ = 0', 'τ = 0'), color: '#B4B2A9', dash: true, points: axis },
        ]
      },
    },
  ],
  example: {
    title: t('一个岩石是否会破裂', 'Will this rock fail?'),
    input: t('σ₁ = 200 MPa，σ₃ = 40 MPa，μf = 0.6，C = 10 MPa。', 'σ₁ = 200 MPa, σ₃ = 40 MPa, μf = 0.6, C = 10 MPa.'),
    steps: [
      t('圆心 = (200 + 40)/2 = 120 MPa，半径 = (200 − 40)/2 = 80 MPa', 'centre = (200 + 40)/2 = 120 MPa, radius = (200 − 40)/2 = 80 MPa'),
      t('圆到包络线 τ = 10 + 0.6σn 的距离：将直线写成 0.6σn − τ + 10 = 0', 'distance from the centre to the envelope: write the line as 0.6σn − τ + 10 = 0'),
      t('d = |0.6 × 120 − 0 + 10| / √(0.6² + 1) = 82 / 1.166 = 70.3 MPa', 'd = |0.6 × 120 − 0 + 10| / √(0.6² + 1) = 82 / 1.166 = 70.3 MPa'),
      t('d = 70.3 MPa < 半径 80 MPa，圆与包络相交', 'd = 70.3 MPa is less than the radius of 80 MPa, so the circle cuts the envelope'),
      t('破裂面：2θf = 90° + arctan 0.6 = 121.0° ⟹ θf = 60.5°', 'failure plane: 2θf = 90° + arctan 0.6 = 121.0°, hence θf = 60.5°'),
    ],
    output: t('该应力状态已超过岩石强度，会发生剪破裂；破裂面法向与 σ₁ 成约 60.5°，即断层面与 σ₁ 方向夹角约 29.5°。', 'The stress state exceeds the rock strength and shear failure occurs. The fault normal lies about 60.5° from σ₁, so the fault plane itself is inclined about 29.5° to σ₁.'),
  },
  links: {
    upstream: [
      { id: 'principal-stress-eigenvalues', note: t('σ₁ 与 σ₃ 就是圆的两个端点', 'σ₁ and σ₃ are the two ends of the circle') },
      { id: 'traction-cauchy-stress' },
    ],
    seealso: [
      { id: 'deviatoric-stress', note: t('半径 (σ₁−σ₃)/2 正比于偏应力强度', 'the radius (σ₁−σ₃)/2 scales with the deviatoric intensity') },
      { id: 'lithostatic-pressure', note: t('围压决定圆在 σ 轴上的位置', 'confining pressure sets where the circle sits on the σ axis') },
    ],
  },
  refs: [
    { text: 'Jaeger, Cook & Zimmerman, Fundamentals of Rock Mechanics, 4th ed., §4.2' },
    { text: 'Zoback, Reservoir Geomechanics, §4.1' },
  ],

}

export default mohrCircleMaxShear
