import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** divergence */
const divergence: FormulaCard = {
  id: 'divergence',
  name: t('散度', 'The Divergence'),
  aliases: { zh: ['∇·u', '散度', '通量源密度'], en: ['divergence', 'div', 'flux source density'] },
  node: 'S0.3',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('散度 通量 源 汇 体积应变 连续性方程 高斯定理', 'divergence flux source sink volumetric strain continuity equation Gauss theorem'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\nabla\cdot\mathbf{u}=\frac{\partial u_x}{\partial x}+\frac{\partial u_y}{\partial y}+\frac{\partial u_z}{\partial z}=\frac{\partial u_i}{\partial x_i}`,
    variants: [
      { name: t('与坐标无关的（极限）定义', 'The coordinate-free definition as a limit'), latex: String.raw`\nabla\cdot\mathbf{u}=\lim_{V\to 0}\frac{1}{V}\oiint_{\partial V}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd S` },
      { name: t('与体积应变的关系', 'Relation to volumetric strain'), latex: String.raw`\nabla\cdot\mathbf{u}=\varepsilon_{kk}=\varepsilon_{xx}+\varepsilon_{yy}+\varepsilon_{zz}=\frac{\dd V}{V}` },
      { name: t('柱坐标与球坐标下的形式', 'Forms in cylindrical and spherical coordinates'), latex: String.raw`\nabla\cdot\mathbf{u}=\frac{1}{r}\frac{\partial}{\partial r}(r u_r)+\frac{1}{r}\frac{\partial u_\theta}{\partial\theta}+\frac{\partial u_z}{\partial z}` },
      { name: t('连续性方程（质量守恒）', 'The continuity equation, conservation of mass'), latex: String.raw`\frac{\partial \rho}{\partial t}+\nabla\cdot(\rho\mathbf{v})=0` },
    ],
  },
  meaning: t(
    '散度衡量一个矢量场在某点「净流出多少」：为正说明该点是源（有东西在产生），为负说明是汇（有东西在消失），为零说明流入流出相等。对位移场而言，散度就是体积应变 ε_kk —— 介质被压缩还是膨胀，这一件事就决定了 P 波是否存在。它与 Gauss 定理配合，把「局部的源」和「穿过边界的总通量」连在一起。',
    'Divergence measures how much of a vector field flows net out of a point: positive marks a source where something is created, negative a sink where it vanishes, and zero means inflow balances outflow. For a displacement field the divergence is exactly the volumetric strain ε_kk — whether the medium is compressed or dilated, the very thing that decides whether a P wave exists at all. Paired with Gauss theorem it links a local source to the total flux through a boundary.',
  ),
  symbols: [
    { sym: '\\nabla\\cdot\\mathbf{u}', name: t('u 的散度（标量）', 'divergence of u, a scalar'), unit: 'u 的单位 / m' },
    { sym: '\\mathbf{u}', name: t('矢量场（位移、速度、能流等）', 'vector field: displacement, velocity, energy flux'), unit: '任意' },
    { sym: '\\hat{\\mathbf{n}}', name: t('闭合曲面的外法向单位矢量', 'outward unit normal of the closed surface'), unit: '1' },
    { sym: 'V', name: t('包围该点的小体积', 'a small volume enclosing the point'), unit: 'm³' },
    { sym: '\\varepsilon_{kk}', name: t('体积应变（应变张量的迹）', 'volumetric strain, the trace of the strain tensor'), unit: '1' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: '\\mathbf{v}', name: t('质点速度场', 'particle velocity field'), unit: 'm/s' },
  ],
  conditions: {
    applies: [
      t('u 一阶可微的矢量场', 'A vector field u with continuous first derivatives'),
      t('常用于位移场、速度场、能流密度场、电场', 'Commonly applied to displacement, velocity, energy-flux and electric fields'),
    ],
    assumes: [
      t('直角正交坐标；曲线坐标下形式不同（见变体）', 'Cartesian orthonormal coordinates; curvilinear coordinates give a different form'),
      t('小变形线性理论下，∇·u 才等于体积应变', 'Only in small-strain linear theory does ∇·u equal the volumetric strain'),
    ],
    breaks: [
      t('场不连续（断层、物性突变界面）时，界面上散度含 δ 型贡献，须用跳跃条件处理', 'Where the field is discontinuous, at faults or sharp property contrasts, the divergence carries delta-like contributions and jump conditions are required'),
      t('有限变形需用有限应变张量的 Jacobian 行列式，而非 ∇·u', 'For finite deformation use the Jacobian determinant of the finite strain tensor rather than ∇·u'),
      t('数值微分在大梯度处噪声敏感，宜用守恒型离散', 'Numerical differentiation is noise-sensitive where gradients are large; use a conservative discretisation'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'geometry',
      title: t('取一个以该点为中心的小长方盒', 'Take a small rectangular box centred on the point'),
      latex: String.raw`\text{体积 } V=\Delta x\,\Delta y\,\Delta z`,
    },
    {
      n: 2,
      op: 'physics',
      title: t('只算一对 x 面的净流出', 'Compute the net outflow through the pair of x faces only'),
      latex: String.raw`\Phi_x=\left[u_x\!\left(x+\tfrac{\Delta x}{2}\right)-u_x\!\left(x-\tfrac{\Delta x}{2}\right)\right]\Delta y\,\Delta z`,
      note: t('右侧面流出减去左侧面流入；y、z 两面同理。', 'Flux out of the right face minus flux in through the left; the y and z pairs follow the same pattern.'),
    },
    {
      n: 3,
      op: 'taylor',
      title: t('一阶展开差值', 'Expand the difference to first order'),
      latex: String.raw`u_x\!\left(x+\tfrac{\Delta x}{2}\right)-u_x\!\left(x-\tfrac{\Delta x}{2}\right)\approx \frac{\partial u_x}{\partial x}\,\Delta x\;\Longrightarrow\;\Phi_x\approx \frac{\partial u_x}{\partial x}\,V`,
    },
    {
      n: 4,
      op: 'algebra',
      title: t('三个方向相加并除以体积', 'Add the three directions and divide by the volume'),
      latex: String.raw`\frac{\Phi_{total}}{V}\approx \frac{\partial u_x}{\partial x}+\frac{\partial u_y}{\partial y}+\frac{\partial u_z}{\partial z}`,
    },
    {
      n: 5,
      op: 'result',
      title: t('取 V → 0 的极限得到散度', 'Take the limit V → 0 to obtain the divergence'),
      latex: String.raw`\nabla\cdot\mathbf{u}=\lim_{V\to 0}\frac{\Phi_{total}}{V}=\frac{\partial u_i}{\partial x_i}`,
      note: t('所以散度的物理定义是「单位体积的净通量」，而 ∂_i u_i 只是它在直角坐标下的分量写法。', 'The physical definition is therefore net flux per unit volume, with ∂_i u_i merely its component form in Cartesian coordinates.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('力学含义：散度即体积应变', 'Mechanical meaning: the divergence is the volumetric strain'),
      latex: String.raw`\nabla\cdot\mathbf{u}=\varepsilon_{kk}=\frac{\Delta V}{V}\;\Longrightarrow\; \varepsilon_{kk}=0\ \text{表示纯剪切（无体积变化，只有 S 波）}`,
      note: t('P 波的本质就是 ε_kk ≠ 0，S 波的本质是 ε_kk = 0。', 'The essence of a P wave is ε_kk ≠ 0, that of an S wave is ε_kk = 0.'),
    },
  ],
  viz: [
    {
      id: 'flux-per-area',
      level: 'V1',
      title: t('通量/面积随圆半径的变化：极限就是散度', 'Flux per unit area versus radius: the limit is the divergence'),
      xlabel: t('圆半径 R (m)', 'circle radius R (m)'),
      ylabel: t('单位面积净通量 Φ/(πR²)', 'net flux per unit area Φ/(πR²)'),
      controls: [
        { id: 'A', label: t('x 方向拉伸率 A', 'stretch rate A in x'), min: -3, max: 3, step: 0.1, value: 1.2, unit: '1' },
        { id: 'B', label: t('y 方向拉伸率 B', 'stretch rate B in y'), min: -3, max: 3, step: 0.1, value: -0.4, unit: '1' },
      ],
      xRange: [0.05, 3],
      note: t('对线性场 u = (A x, B y)，散度处处等于 A + B，与圆的半径无关 —— 所以曲线是一条水平线。这正是「散度是局部量」的含义：把它调成 A = −B，散度为零，场在 x 方向拉伸、在 y 方向压缩，净体积不变，这正是纯剪切。',
        'For the linear field u = (A x, B y) the divergence equals A + B everywhere, independent of the radius, so the curve is a horizontal line. That is exactly what a local quantity means. Setting A = −B makes the divergence vanish: the field stretches in x and compresses in y with no net volume change, which is pure shear.'),
      compute: (p) => {
        const A = p['A'], B = p['B']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const R = 0.05 + (i / 300) * 2.95
          let flux = 0
          const M = 720
          const dth = (2 * Math.PI) / M
          for (let j = 0; j < M; j++) {
            const th = (j + 0.5) * dth
            const x = R * Math.cos(th)
            const y = R * Math.sin(th)
            const ux = A * x
            const uy = B * y
            flux += (ux * Math.cos(th) + uy * Math.sin(th)) * R * dth
          }
          pts.push([R, flux / (Math.PI * R * R)])
        }
        return [
          { label: t('数值通量/面积', 'numerical flux per area'), color: '#185FA5', points: pts },
          { label: t('解析值 A + B', 'analytic value A + B'), color: '#BA7517', dash: true, points: [[0.05, A + B], [3, A + B]] },
        ]
      },
    },
    {
      id: 'point-source-flux',
      level: 'V1',
      title: t('点源场：通量不变，散度却处处为零', 'A point-source field: constant flux, yet zero divergence everywhere'),
      xlabel: t('圆半径 R (m)', 'circle radius R (m)'),
      ylabel: t('量值', 'value'),
      controls: [
        { id: 's', label: t('源强 s', 'source strength s'), min: 0.5, max: 5, step: 0.1, value: 2, unit: '1' },
      ],
      xRange: [0.2, 5],
      note: t('取径向场 u = (s/r) r̂。穿过任意圆周的总通量恒为 2πs（水平线），但除原点以外 ∇·u 处处为零：随着 R 增大，通量被摊到越来越大的面积上，单位面积通量 2s/R² 趋于零。所有的「源」都集中在原点的一个 δ 上 —— 这正是点源、点电荷与井间注水问题的数学原型。',
        'Take the radial field u = (s/r) r̂. The total flux through any circle is a constant 2πs, the horizontal line, yet ∇·u vanishes everywhere except at the origin: as R grows the flux is spread over ever more area and the flux per unit area, 2s/R², tends to zero. All of the "source" is concentrated into a delta at the origin — the mathematical prototype of point sources, point charges and well injection problems.'),
      compute: (p) => {
        const s = p['s']
        const fluxPts: Array<[number, number]> = []
        const densPts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const R = 0.2 + (i / 300) * 4.8
          const flux = 2 * Math.PI * s
          fluxPts.push([R, flux])
          densPts.push([R, flux / (Math.PI * R * R)])
        }
        return [
          { label: t('总通量 ∮u·n̂ dl', 'total flux ∮u·n̂ dl'), color: '#185FA5', points: fluxPts },
          { label: t('单位面积通量', 'flux per unit area'), color: '#BA7517', dash: true, points: densPts },
        ]
      },
    },
  ],
  example: {
    title: t('判断一个位移场是 P 波还是 S 波', 'Deciding whether a displacement field is P or S'),
    input: t('u = (a sin(kz − ωt), 0, 0)，只有 x 分量、沿 z 传播', 'u = (a sin(kz − ωt), 0, 0): only the x component, propagating along z'),
    steps: [
      t('∇·u = ∂u_x/∂x + ∂u_y/∂y + ∂u_z/∂z = 0', '∇·u = ∂u_x/∂x + ∂u_y/∂y + ∂u_z/∂z = 0'),
      t('体积应变 ε_kk = 0，介质只发生形状改变', 'The volumetric strain ε_kk vanishes, so the medium changes shape only'),
    ],
    output: t('散度为零 ⟹ 无体积变化 ⟹ 这是 SH 或 SV 型的剪切波，而非 P 波', 'Zero divergence means no volume change, so this is a shear wave of SH or SV type rather than a P wave'),
  },
  links: {
    upstream: [{ id: 'gradient', note: t('∇ 算子的点积形式', 'the dot-product form of the ∇ operator') }],
    downstream: [
      { id: 'divergence-theorem', note: t('把散度的体积分变成面积分', 'turns the volume integral of divergence into a surface integral') },
      { id: 'curl', note: t('另一个一阶微分不变量', 'the other first-order differential invariant') },
    ],
    seealso: [{ id: 'strain-tensor' }],
  },
  refs: [
    { text: 'Arfken, Weber & Harris, Mathematical Methods for Physicists, 7th ed., §1.8' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
  ],
}

export default divergence
