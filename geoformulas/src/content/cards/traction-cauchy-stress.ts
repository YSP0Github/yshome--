import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** traction-cauchy-stress */
const tractionCauchyStress: FormulaCard = {
  id: 'traction-cauchy-stress',
  name: t('牵引力与 Cauchy 应力公式', 'Traction and the Cauchy Stress Formula'),
  aliases: { zh: ['柯西公式', '应力矢量', '面力'], en: ['Cauchy formula', 'traction vector', 'stress vector'] },
  node: 'S1.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.LINALG'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('牵引力 柯西公式 应力张量 法向应力 剪应力 四面体 t=σn', 'traction Cauchy formula stress tensor normal shear tetrahedron'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`t_i=\sigma_{ij}\,n_j`,
    variants: [
      { name: t('矩阵（并矢）形式', 'Matrix / dyadic form'), latex: String.raw`\boldsymbol{t}=\boldsymbol{\sigma}\,\hat{\boldsymbol{n}}` },
      { name: t('写成分量', 'Written out in components'), latex: String.raw`\begin{aligned} t_1&=\sigma_{11}n_1+\sigma_{12}n_2+\sigma_{13}n_3\\ t_2&=\sigma_{21}n_1+\sigma_{22}n_2+\sigma_{23}n_3\\ t_3&=\sigma_{31}n_1+\sigma_{32}n_2+\sigma_{33}n_3 \end{aligned}` },
      { name: t('分解为法向与切向两部分', 'Split into normal and shear parts'), latex: String.raw`\sigma_n=t_i n_i=\sigma_{ij}n_i n_j,\qquad \tau=\sqrt{t_i t_i-\sigma_n^{2}}` },
      { name: t('反演：给定任意三个面的牵引力即可定出 σ', 'Inverse: three independent faces determine σ'), latex: String.raw`\sigma_{ij}=t_i^{(j)}\quad\text{where}\quad \boldsymbol{t}^{(j)}=\boldsymbol{\sigma}\,\hat{\boldsymbol{e}}_j` },
    ],
  },
  meaning: t(
    '岩石内部任意一点、任意取向的那个截面上，内力密度是多少？Cauchy 的回答是：不必为每个截面单独测量，只要知道 9 个分量 σ_ij，任意截面的牵引力都是一次矩阵乘法。这就是「张量」这个词最实在的物理内容 —— 它不是一堆数的表格，而是一台把法向矢量变成力矢量的机器。',
    'How much internal force acts across a plane of arbitrary orientation at a point? Cauchy’s answer: you never need to measure every plane separately. Once you know the nine components σ_ij, the traction on any plane is a single matrix–vector product. That is the physical content of the word tensor — not a table of numbers but a machine that turns an orientation into a force.',
  ),
  symbols: [
    { sym: 't_i', name: t('牵引力矢量（面力密度）第 i 分量', 'i-th component of the traction vector'), unit: 'Pa', typical: '10⁶ – 10⁹ Pa' },
    { sym: '\\sigma_{ij}', name: t('Cauchy 应力张量：第 j 个坐标面上力的第 i 分量', 'Cauchy stress tensor: i-th force component on the face with normal along j'), unit: 'Pa', typical: '10⁶ – 10⁹ Pa' },
    { sym: 'n_j', name: t('截面单位法向的第 j 分量（n_i n_i = 1）', 'j-th component of the unit normal (n_i n_i = 1)'), unit: '', dimension: '无量纲' },
    { sym: '\\hat{\\boldsymbol{n}}', name: t('单位法向矢量', 'unit normal vector'), unit: '', dimension: '无量纲' },
    { sym: '\\sigma_n', name: t('正应力（沿法向的分量，拉为正）', 'normal stress (component along n, tension positive)'), unit: 'Pa' },
    { sym: '\\tau', name: t('剪应力（面内分量）', 'shear stress (in-plane component)'), unit: 'Pa' },
  ],
  conditions: {
    applies: [
      t('连续介质内部任意一点、任意取向的截面', 'Any internal point and any plane orientation in a continuum'),
      t('静态或动态（含波动）情形均成立，只要介质连续', 'Static or dynamic (including wave propagation), provided the medium is continuous'),
    ],
    assumes: [
      t('小变形：不区分变形前与变形后的构形（Cauchy 应力以现时构形为参考）', 'Small deformation so that the current and reference configurations need not be distinguished'),
      t('面力是位移导数的一阶量，体力（重力）随体积 ∼ L³ 衰减更快', 'Surface forces scale as L² while body forces scale as L³, so body forces drop out in the limit'),
      t('n 必须是单位矢量，否则 t 的量纲要乘上 |n|', 'n must be a unit vector; otherwise t picks up a factor |n|'),
    ],
    breaks: [
      t('存在偶应力 / 微极（Cosserat）介质时 σ 不再对称，本式的基本假定失效', 'In couple-stress or Cosserat media σ is no longer symmetric and the derivation breaks'),
      t('跨越断层面、冲击波前的强间断，须改用 Rankine–Hugoniot 跳跃条件', 'Across a fault or shock front the strong discontinuity requires Rankine–Hugoniot jump conditions'),
      t('颗粒介质、裂隙岩体在尺度小于代表体元时不再是连续介质', 'Granular or heavily fractured rock is not a continuum below the representative elementary volume'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义牵引力：内力除以面积', 'Define traction as internal force per unit area'),
      latex: String.raw`\boldsymbol{t}^{(\hat{\boldsymbol{n}})}=\lim_{\Delta S\to 0}\frac{\Delta \boldsymbol{F}}{\Delta S}`,
      note: t('注意它依赖两个东西：点的位置，以及截面的取向 n。所以它不是矢量场，而是「矢量 + 一个方向自变量的映射」。', 'Note that it depends on two things: the position and the orientation n. It is therefore not simply a vector field but a map from orientations to vectors.') },
    { n: 2, op: 'geometry', title: t('取 Cauchy 四面体：三个坐标面 + 一个斜面', 'Take the Cauchy tetrahedron: three coordinate faces plus one inclined face'),
      latex: String.raw`\Delta S_i=\Delta S\,n_i,\qquad \Delta V=\frac{1}{3}\Delta S\,h`,
      note: t('斜面的投影就是坐标面的面积，这是纯几何：n_i 既是法向分量，也是面积比。', 'The projection of the inclined face gives the coordinate-face areas — pure geometry: n_i is both a normal component and an area ratio.') },
    { n: 3, op: 'physics', title: t('四面体的力平衡（Newton 第二定律）', 'Force balance on the tetrahedron'),
      latex: String.raw`\boldsymbol{t}^{(\hat{\boldsymbol{n}})}\Delta S-\boldsymbol{t}^{(1)}\Delta S_1-\boldsymbol{t}^{(2)}\Delta S_2-\boldsymbol{t}^{(3)}\Delta S_3+\rho\,\boldsymbol{b}\,\Delta V=\rho\,\Delta V\,\ddot{\boldsymbol{u}}`,
      note: t('加速度项与重力项都是体积量 ∼ L³，而面力项是 ∼ L²；缩小四面体时体积项会更快消失。', 'Both the acceleration and the gravity terms are volume terms of order L³ while surface forces are of order L², so the volume terms vanish faster as the element shrinks.') },
    { n: 4, op: 'algebra', title: t('除以 ΔS 并取极限 h → 0', 'Divide by ΔS and let h → 0'),
      latex: String.raw`\boldsymbol{t}^{(\hat{\boldsymbol{n}})}=\boldsymbol{t}^{(1)}n_1+\boldsymbol{t}^{(2)}n_2+\boldsymbol{t}^{(3)}n_3`,
      note: t('这一步是整套理论的关键：四面体的体积 ∼ L³ 而面积 ∼ L²，比值 ∼ L → 0，所以体力和惯性力被抹掉，只剩下纯几何关系。', 'This step is the crux: volume scales as L³ but area as L², so their ratio vanishes as L → 0 and body plus inertial forces disappear, leaving a purely geometric relation.') },
    { n: 5, op: 'substitute', title: t('定义九个分量 σ_ij ≡ t_i^(j)', 'Define the nine components σ_ij ≡ t_i^(j)'),
      latex: String.raw`t_i=\sigma_{ij}n_j`,
      note: t('第一个下标是「力的方向」，第二个是「作用面的法向」。记反了整个弹性力学都会写错符号。', 'The first index is the direction of the force, the second is the normal of the face it acts on. Getting them backwards ruins every sign in elasticity.') },
    { n: 6, op: 'result', title: t('分解为法向与切向', 'Decompose into normal and shear parts'),
      latex: String.raw`\boldsymbol{t}=\underbrace{\left(\boldsymbol{t}\cdot\hat{\boldsymbol{n}}\right)\hat{\boldsymbol{n}}}_{\sigma_n \hat{\boldsymbol{n}}}+\underbrace{\left[\boldsymbol{t}-\sigma_n\hat{\boldsymbol{n}}\right]}_{\boldsymbol{\tau}},\qquad \sigma_n=\sigma_{ij}n_i n_j`,
      note: t('σ_n 是二次型，这正是后面 Mohr 圆与主应力分析的出发点。', 'σ_n is a quadratic form, and that is exactly the starting point for Mohr circles and principal-stress analysis.') },
  ],
  viz: [
    {
      id: 'traction-vs-angle',
      level: 'V1',
      title: t('截面取向如何决定正应力与剪应力', 'How plane orientation sets normal and shear stress'),
      xlabel: t('截面法向与 x₁ 轴的夹角 θ (度)', 'angle θ between the normal and the x₁ axis (degrees)'),
      ylabel: t('应力 (MPa)', 'stress (MPa)'),
      controls: [
        { id: 'sxx', label: t('σ₁₁', 'σ₁₁'), min: -200, max: 200, step: 5, value: 100, unit: 'MPa' },
        { id: 'syy', label: t('σ₂₂', 'σ₂₂'), min: -200, max: 200, step: 5, value: 30, unit: 'MPa' },
        { id: 'sxy', label: t('σ₁₂（剪应力分量）', 'σ₁₂ (shear component)'), min: -100, max: 100, step: 2, value: 20, unit: 'MPa' },
      ],
      xRange: [0, 360],
      note: t('转动一个假想的截面，看正应力与剪应力如何此消彼长：剪应力为零的那两个方向就是主应力方向，正应力取极值处剪应力恰好为零。把 σ₁₂ 调到 0，主轴立刻回到坐标轴上。', 'Rotate an imaginary plane and watch normal and shear stress trade off. The two directions where shear vanishes are the principal directions, and normal stress is extremal exactly there. Set σ₁₂ to zero and the principal axes snap back onto the coordinate axes.'),
      compute: (p) => {
        const sxx = p['sxx'], syy = p['syy'], sxy = p['sxy']
        const nrm: Array<[number, number]> = []
        const shr: Array<[number, number]> = []
        const mag: Array<[number, number]> = []
        for (let i = 0; i <= 360; i++) {
          const th = (i / 360) * Math.PI * 2
          const c = Math.cos(th), s = Math.sin(th)
          const t1 = sxx * c + sxy * s
          const t2 = sxy * c + syy * s
          const sn = t1 * c + t2 * s
          const tau = -t1 * s + t2 * c
          const deg = (i / 360) * 360
          nrm.push([deg, sn])
          shr.push([deg, tau])
          mag.push([deg, Math.sqrt(sn * sn + tau * tau)])
        }
        return [
          { label: t('正应力 σn', 'normal stress σn'), color: '#185FA5', points: nrm },
          { label: t('剪应力 τ', 'shear stress τ'), color: '#BA7517', points: shr },
          { label: t('牵引力模长 |t|', 'traction magnitude |t|'), color: '#B4B2A9', dash: true, points: mag },
        ]
      },
    },
  ],
  example: {
    title: t('斜面牵引力：一个 45° 截面', 'Traction on a 45° plane'),
    input: t('σ₁₁ = 100 MPa，σ₂₂ = 30 MPa，σ₁₂ = 20 MPa，截面法向 n = (cos45°, sin45°)。', 'σ₁₁ = 100 MPa, σ₂₂ = 30 MPa, σ₁₂ = 20 MPa, with normal n = (cos45°, sin45°).'),
    steps: [
      t('t₁ = 100 × 0.707 + 20 × 0.707 = 84.9 MPa；t₂ = 20 × 0.707 + 30 × 0.707 = 35.4 MPa', 't₁ = 100 × 0.707 + 20 × 0.707 = 84.9 MPa; t₂ = 20 × 0.707 + 30 × 0.707 = 35.4 MPa'),
      t('σn = t·n = (84.9 + 35.4) × 0.707 = 85.0 MPa', 'σn = t·n = (84.9 + 35.4) × 0.707 = 85.0 MPa'),
      t('|t| = √(84.9² + 35.4²) = 92.0 MPa，τ = √(92.0² − 85.0²) = 35.1 MPa', '|t| = √(84.9² + 35.4²) = 92.0 MPa, so τ = √(92.0² − 85.0²) = 35.1 MPa'),
    ],
    output: t('这个面上的平均应力约 85 MPa，剪应力约 35 MPa —— 同一应力状态下，换个取向，剪应力从 20 MPa 涨到 35 MPa。', 'On this plane the normal stress is about 85 MPa and the shear stress about 35 MPa: the same stress state, a different orientation, and shear grows from 20 to 35 MPa.'),
  },
  links: {
    downstream: [
      { id: 'principal-stress-eigenvalues', note: t('τ = 0 的方向即主方向', 'the directions with τ = 0 are the principal axes') },
      { id: 'mohr-circle-max-shear' },
    ],
    seealso: [
      { id: 'stress-tensor-symmetry', note: t('保证 σ 可对角化', 'guarantees σ can be diagonalised') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Jaeger, Cook & Zimmerman, Fundamentals of Rock Mechanics, 4th ed., §2.2' },
  ],

}

export default tractionCauchyStress
