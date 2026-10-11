import type { FormulaCard, Series } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ray-parameter-conservation */
const rayParameterConservation: FormulaCard = {
  id: 'ray-parameter-conservation',
  name: t('射线参数沿射线的守恒性', 'Conservation of the Ray Parameter along a Ray'),
  aliases: {
    zh: ['射线参数守恒', '水平慢度', '表观速度'],
    en: ['ray parameter conservation', 'horizontal slowness', 'apparent velocity'],
  },
  node: 'S2.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.VECTOR'],
    method: ['METH.EXPL', 'METH.TELE', 'METH.INV'],
    quantity: ['Q.VEL', 'Q.GEOM'],
    keywords: t('射线参数 水平慢度 守恒 表观速度 分层介质 Snell 全反射', 'ray parameter horizontal slowness conservation apparent velocity layered medium Snell total reflection'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`p=\frac{\sin i\left(z\right)}{v\left(z\right)}=\text{const}\quad\text{沿同一条射线}`,
    variants: [
      {
        name: t('分层介质的逐层形式', 'Layer-by-layer form'),
        latex: String.raw`\frac{\sin i_{1}}{v_{1}}=\frac{\sin i_{2}}{v_{2}}=\cdots=\frac{\sin i_{n}}{v_{n}}=p`,
      },
      {
        name: t('表观速度形式', 'Apparent-velocity form'),
        latex: String.raw`p=\frac{1}{v_{\mathrm{app}}},\qquad v_{\mathrm{app}}=\frac{v}{\sin i}`,
      },
      {
        name: t('球对称地球', 'Spherical Earth'),
        latex: String.raw`p=\frac{r\sin i}{v\left(r\right)}`,
      },
      {
        name: t('转换波同样共用 p', 'Converted waves share the same p'),
        latex: String.raw`\frac{\sin i_{P}}{\alpha}=\frac{\sin j_{S}}{\beta}=p`,
      },
    ],
  },
  meaning: t(
    '在水平层状介质中，速度到处在变，射线到处在弯，但有且只有一个量始终不变：射线参数 p，也就是水平慢度。它的倒数正是波沿地表传播的表观速度。一条射线的全部运动学（走时、偏移距、转折点深度）都可以只用一个数 p 参数化——这是 τ–p 变换、VSP 反演、平面波分解的共同起点。',
    'In a horizontally layered medium the velocity changes everywhere and the ray bends everywhere, yet exactly one quantity never changes: the ray parameter p, the horizontal slowness. Its reciprocal is the apparent velocity with which the wave sweeps along the surface. The entire kinematics of a ray — travel time, offset, turning depth — can be parameterised by that single number, which is the common starting point of τ–p transforms, VSP inversion and plane-wave decomposition.',
  ),
  symbols: [
    { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/m', typical: '1e-4 – 6e-4' },
    { sym: 'i\\left(z\\right)', name: t('射线与铅垂方向（界面法线）的夹角', 'angle between the ray and the vertical (interface normal)'), unit: '°', typical: '0 – 90' },
    { sym: 'v\\left(z\\right)', name: t('随深度变化的速度', 'depth-dependent velocity'), unit: 'm/s', typical: '1500 – 8000' },
    { sym: 'v_{\\mathrm{app}}', name: t('表观速度（沿地表测得的视速度）', 'apparent velocity measured along the surface'), unit: 'm/s', typical: '≥ v' },
    { sym: 'z_{t}', name: t('射线转折点深度，由 p\\,v(z_t) = 1 决定', 'turning depth, fixed by p·v(z_t) = 1'), unit: 'm' },
    { sym: 'r', name: t('球对称介质中的半径', 'radius in a spherically symmetric medium'), unit: 'km' },
  ],
  conditions: {
    applies: [
      t('速度只随深度变化（水平层状或球对称）的介质', 'Media whose velocity varies with depth only (horizontally layered or spherically symmetric)'),
      t('高频（射线）近似下的一切走时与偏移距计算', 'All travel-time and offset calculations in the high-frequency (ray) limit'),
    ],
    assumes: [
      t('各向同性、界面光滑、无横向变速', 'Isotropy, smooth interfaces, no lateral velocity variation'),
      t('忽略绕射与波导效应', 'Diffraction and waveguide effects are ignored'),
    ],
    breaks: [
      t('存在横向变速（如盐丘侧翼、俯冲带）时 p 沿射线改变', 'With lateral velocity variation (salt flanks, subduction zones) p changes along the ray'),
      t('层厚接近波长时射线理论失效，需用全波场方法', 'When layer thickness approaches the wavelength, ray theory fails and full-wavefield methods are needed'),
      t('各向异性介质中要区分相慢度与群慢度', 'In anisotropic media phase and group slowness must be distinguished'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('把介质切成一系列水平薄层', 'Slice the medium into horizontal thin layers'),
      latex: String.raw`v\left(z\right)\to v_{1},v_{2},\dots,v_{n}\quad(\text{第 }k\text{ 层内恒定})`,
    },
    {
      n: 2,
      op: 'physics',
      title: t('每个界面上施加 Snell 定律', 'Apply Snell\'s law at every interface'),
      latex: String.raw`\frac{\sin i_{k}}{v_{k}}=\frac{\sin i_{k+1}}{v_{k+1}}\qquad k=1,\dots,n-1`,
    },
    {
      n: 3,
      op: 'algebra',
      title: t('连锁相等', 'Chain the equalities'),
      latex: String.raw`\frac{\sin i_{1}}{v_{1}}=\frac{\sin i_{2}}{v_{2}}=\cdots=\frac{\sin i_{n}}{v_{n}}\equiv p`,
    },
    {
      n: 4,
      op: 'transform',
      title: t('取连续极限', 'Take the continuum limit'),
      latex: String.raw`\lim_{n\to\infty}\frac{\sin i_{k}}{v_{k}}=\frac{\sin i\left(z\right)}{v\left(z\right)}=p=\text{const}`,
      note: t('层数趋于无穷、每层厚度趋于零，就得到速度连续变化时的守恒形式。', 'Letting the number of layers go to infinity and the thickness to zero gives the conserved form for continuously varying velocity.'),
    },
    {
      n: 5,
      op: 'geometry',
      title: t('转折点：sin i 达到 1', 'Turning point: sin i reaches 1'),
      latex: String.raw`p\,v\left(z_{t}\right)=1\;\Longrightarrow\; z_{t}=v^{-1}\!\left(1/p\right)`,
      note: t('一旦 p·v ≥ 1 就无实数解，射线在该深度全反射并折返——这就是回折波。', 'Once p·v ≥ 1 there is no real solution and the ray is totally reflected back upward at that depth — a diving wave.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('物理意义：p 的倒数是表观速度', 'Physical meaning: the reciprocal of p is the apparent velocity'),
      latex: String.raw`v_{\mathrm{app}}=\frac{\mathrm{d}x}{\mathrm{d}t}\bigg|_{\text{地表}}=\frac{1}{p}\ge v\left(z\right)`,
      note: t('因为 sin i ≤ 1，表观速度永远不小于介质速度，这正是「首波看起来比直达波快」的原因之一。', 'Since sin i ≤ 1 the apparent velocity is never smaller than the medium velocity, which is part of why a head wave can look faster than the direct wave.'),
    },
  ],
  viz: [
    {
      id: 'ray-path',
      level: 'V1',
      title: t('三层介质中的射线路径与折返', 'Ray path and turn-over in a three-layer medium'),
      xlabel: t('水平距离 x (m)', 'horizontal distance x (m)'),
      ylabel: t('高程 z (m)', 'elevation z (m)'),
      controls: [
        { id: 'rv1', label: t('第一层速度 v₁', 'layer-1 velocity v₁'), min: 1000, max: 3500, step: 50, value: 2000, unit: 'm/s' },
        { id: 'rv2', label: t('第二层速度 v₂', 'layer-2 velocity v₂'), min: 1500, max: 5000, step: 50, value: 3000, unit: 'm/s' },
        { id: 'i0', label: t('地表出射角 i₀', 'surface take-off angle i₀'), min: 5, max: 80, step: 1, value: 45, unit: '°' },
      ],
      note: t('射线在每一层里都是直线，但每穿过一个更快的层就更接近水平；一旦 p·v ≥ 1 就无实数解，射线在界面上全反射并折返地表。把出射角调大（p 变大），折返点会一层层变浅——同样一条射线，p 决定它究竟能探多深。', 'The ray is straight inside each layer but becomes more horizontal in every faster layer; once p·v ≥ 1 no real solution exists and the ray is totally reflected back to the surface. Increase the take-off angle (larger p) and the turning point migrates upward layer by layer — p alone decides how deep a given ray can probe.'),
      compute: (p) => {
        const v1 = p['rv1']
        const v2 = p['rv2']
        const i0 = p['i0']
        const vs = [v1, v2, Math.max(v2 + 500, v2 * 1.3), Math.max(v2 + 1000, v2 * 1.6)]
        const th = 800
        const pr = Math.sin((i0 * Math.PI) / 180) / v1
        const dxs: number[] = []
        for (let k = 0; k < vs.length; k++) {
          const s = pr * vs[k]
          if (s >= 0.999) break
          dxs.push((th * s) / Math.sqrt(1 - s * s))
        }
        const pts: Array<[number, number]> = [[0, 0]]
        let xc = 0
        let zc = 0
        for (const dx of dxs) {
          zc += th
          xc += dx
          pts.push([xc, -zc])
        }
        for (let k = dxs.length - 1; k >= 0; k--) {
          zc -= th
          xc += dxs[k]
          pts.push([xc, -zc])
        }
        const maxX = Math.max(xc, 1000)
        const out: Series[] = [
          { label: t('射线路径', 'ray path'), color: '#185FA5', points: pts },
        ]
        for (let k = 1; k <= vs.length; k++) {
          out.push({
            label: t(`界面 ${k}（${Math.round(k * th)} m）`, `interface ${k} (${Math.round(k * th)} m)`),
            color: '#B4B2A9',
            dash: true,
            points: [
              [0, -k * th],
              [maxX, -k * th],
            ],
          })
        }
        return out
      },
    },
  ],
  example: {
    title: t('由表观速度反推转折点', 'Recovering the turning point from the apparent velocity'),
    input: t('地表测得 P 波视速度 v_app = 6000 m/s，介质速度 v(z) = 2000 + 0.6 z（m/s，z 以 m 计）', 'A P wave is observed with apparent velocity v_app = 6000 m/s in a medium v(z) = 2000 + 0.6 z (m/s, z in m)'),
    steps: [
      t('p = 1/6000 = 1.667×10⁻⁴ s/m', 'p = 1/6000 = 1.667×10⁻⁴ s/m'),
      t('转折点满足 p·v(z_t) = 1 → v(z_t) = 6000 m/s', 'The turning point satisfies p·v(z_t) = 1, hence v(z_t) = 6000 m/s'),
      t('2000 + 0.6 z_t = 6000 → z_t ≈ 6667 m', '2000 + 0.6 z_t = 6000 → z_t ≈ 6667 m'),
    ],
    output: t('该射线最深只能探测到约 6.7 km；要看得更深就必须用更小的 p（更陡的出射、更长的排列）', 'This ray can probe no deeper than about 6.7 km; seeing deeper requires a smaller p — a steeper take-off and a longer spread'),
  },
  links: {
    upstream: [{ id: 'snell-ray-parameter', note: t('本条是其守恒形式的推广', 'this card is the generalisation of the conserved form') }],
    downstream: [
      { id: 'ray-parameter-slope', note: t('p 同时是走时曲线的斜率', 'p is also the slope of the travel-time curve') },
      { id: 'snell-law-spherical-interface', note: t('球对称时要改用 r sin i / v', 'for a spherical Earth one uses r sin i / v') },
    ],
    seealso: [{ id: 'snell-law-converted-waves' }],
  },
  refs: [
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.1' },
    { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.3' },
  ],
}

export default rayParameterConservation
