import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ray-parameter-slope */
const rayParameterSlope: FormulaCard = {
  id: 'ray-parameter-slope',
  name: t('射线参数的几何意义：走时曲线斜率', 'Geometric Meaning of the Ray Parameter: the Slope of the Travel-Time Curve'),
  aliases: {
    zh: ['dT/dX', '走时曲线斜率', 'τ-p 关系'],
    en: ['dT/dX', 'travel-time slope', 'tau-p relation'],
  },
  node: 'S2.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.GEOM'],
    method: ['METH.EXPL', 'METH.INV'],
    quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    keywords: t('射线参数 走时曲线 斜率 dT/dX 截距时间 勒让德变换', 'ray parameter travel-time curve slope dT/dX intercept time Legendre transform'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`p=\frac{\mathrm{d}T}{\mathrm{d}X}`,
    variants: [
      {
        name: t('水平反射层的显式验证', 'Explicit check for a horizontal reflector'),
        latex: String.raw`\frac{\mathrm{d}T}{\mathrm{d}X}=\frac{X}{v^{2}T}=\frac{\sin i}{v}=p`,
      },
      {
        name: t('τ–p 的勒让德结构', 'Legendre structure of τ–p'),
        latex: String.raw`T\left(X\right)=\tau\left(p\right)+pX,\qquad \frac{\mathrm{d}T}{\mathrm{d}X}=p,\qquad \frac{\mathrm{d}\tau}{\mathrm{d}p}=-X`,
      },
      {
        name: t('截距时间', 'Intercept time'),
        latex: String.raw`\tau\left(p\right)=T-pX=2\int_{0}^{z_{t}}\frac{\cos i}{v}\,\mathrm{d}z`,
      },
      {
        name: t('大偏移距极限', 'Large-offset limit'),
        latex: String.raw`\lim_{X\to\infty}p=\frac{1}{v},\qquad \lim_{X\to\infty}v_{\mathrm{app}}=v`,
      },
    ],
  },
  meaning: t(
    '射线参数不只是一个几何比值，它还有直接的观测含义：走时曲线 T(X) 在某一点的斜率就是该射线的 p。有了这一条，实测走时曲线就能直接换成 p–τ 数据，从而把「读时距曲线」变成「反演速度结构」。同时它也说明：偏移距越大，射线越接近水平，表观速度越接近介质本身的真速度。',
    'The ray parameter is not merely a geometric ratio; it has a direct observational meaning: the slope of the travel-time curve T(X) at a point equals p for that ray. This turns a picked travel-time curve into p–τ data and converts "reading a time–distance curve" into "inverting for velocity structure". It also shows that as offset grows the ray becomes more horizontal and the apparent velocity approaches the true medium velocity.',
  ),
  symbols: [
    { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/m', typical: '1e-4 – 6e-4' },
    { sym: 'T', name: t('走时', 'travel time'), unit: 's', typical: '0.2 – 6' },
    { sym: 'X', name: t('偏移距（源检距）', 'offset (source–receiver distance)'), unit: 'm', typical: '100 – 10000' },
    { sym: '\\tau\\left(p\\right)', name: t('截距时间（τ），T(X) 在 T 轴上的截距', 'intercept time τ, the intercept of T(X) on the T axis'), unit: 's' },
    { sym: 'i', name: t('射线与铅垂方向的夹角', 'angle between the ray and the vertical'), unit: '°' },
    { sym: 'z', name: t('反射界面深度', 'reflector depth'), unit: 'm' },
    { sym: 'v', name: t('介质速度', 'medium velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [
      t('把实测走时曲线 T(X) 转换为 p–τ 域（τ–p 变换、倾斜叠加）', 'Converting a measured travel-time curve T(X) into the p–τ domain (τ–p transform, slant stacking)'),
      t('由斜率直接读出射线参数、由截距读出深度', 'Reading the ray parameter from the slope and depth from the intercept'),
    ],
    assumes: [
      t('T(X) 光滑可微、单一同相轴（无交叉与三折）', 'T(X) is smooth and differentiable, a single event with no crossing or triplication'),
      t('水平层状（或球对称）介质，p 沿射线守恒', 'Horizontally layered (or spherically symmetric) media, so p is conserved along the ray'),
    ],
    breaks: [
      t('三折区（triplication）中 T(X) 多值，斜率不再唯一对应一条射线', 'In triplications T(X) is multivalued and the slope no longer maps to a unique ray'),
      t('存在横向变速时 dT/dX 不再等于水平慢度', 'With lateral velocity variation dT/dX is no longer the horizontal slowness'),
      t('离散采样与到时拾取误差会放大斜率噪声，需要平滑或拟合', 'Discrete sampling and pick errors amplify slope noise, so smoothing or fitting is required'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('水平反射层，深度 z，速度 v', 'Horizontal reflector at depth z with velocity v'),
      latex: String.raw`L=\sqrt{z^{2}+\left(\frac{X}{2}\right)^{2}},\qquad T=\frac{2L}{v}`,
    },
    {
      n: 2,
      op: 'geometry',
      title: t('写出入射角的正弦', 'Write the sine of the incidence angle'),
      latex: String.raw`\sin i=\frac{X/2}{L}\;\Longrightarrow\; p=\frac{\sin i}{v}=\frac{X}{2vL}`,
    },
    {
      n: 3,
      op: 'identity',
      title: t('对 X 求导', 'Differentiate with respect to X'),
      latex: String.raw`\frac{\mathrm{d}T}{\mathrm{d}X}=\frac{2}{v}\cdot\frac{1}{2L}\cdot\frac{X}{2}=\frac{X}{2vL}`,
    },
    {
      n: 4,
      op: 'result',
      title: t('两式相同', 'The two expressions coincide'),
      latex: String.raw`\boxed{\ \frac{\mathrm{d}T}{\mathrm{d}X}=p\ }`,
      note: t('这正是「斜率即慢度」：把实测曲线微分一次就得到射线参数，不需要知道深度。', 'This is "slope is slowness": differentiating the measured curve once gives the ray parameter, with no need to know the depth.'),
    },
    {
      n: 5,
      op: 'transform',
      title: t('勒让德变换：T = τ + pX', 'Legendre transform: T = τ + pX'),
      latex: String.raw`\tau=T-pX,\qquad \mathrm{d}T=p\,\mathrm{d}X+X\,\mathrm{d}p+\mathrm{d}\tau\;\Longrightarrow\;\frac{\mathrm{d}\tau}{\mathrm{d}p}=-X`,
      note: t('一对共轭变量 (p, X) 与 (τ, T)，这就是 τ–p 方法的数学骨架。', 'A conjugate pair (p, X) and (τ, T): the mathematical skeleton of the τ–p method.'),
    },
    {
      n: 6,
      op: 'algebra',
      title: t('（附）大偏移距极限', '(Appendix) the large-offset limit'),
      latex: String.raw`X\gg z:\quad \sin i\to 1,\ p\to\frac{1}{v},\ v_{\mathrm{app}}\to v`,
      note: t('远道斜率趋于 1/v，所以远道的视速度就是介质真速度——这是折射法测速度的原理。', 'The far-offset slope tends to 1/v, so the apparent velocity of far traces is the true medium velocity — the principle behind refraction velocity analysis.'),
    },
  ],
  viz: [
    {
      id: 'slope-p',
      level: 'V1',
      title: t('走时曲线斜率 p 随偏移距的变化', 'Slope p of the travel-time curve versus offset'),
      xlabel: t('偏移距 X (m)', 'offset X (m)'),
      ylabel: t('射线参数 p (s/km)', 'ray parameter p (s/km)'),
      controls: [
        { id: 'sv', label: t('介质速度 v', 'medium velocity v'), min: 1500, max: 5000, step: 50, value: 2500, unit: 'm/s' },
        { id: 'sz', label: t('反射面深度 z', 'reflector depth z'), min: 500, max: 5000, step: 100, value: 2000, unit: 'm' },
      ],
      xRange: [0, 8000],
      note: t('p 从零开始随偏移距单调增大，并渐近趋于一条水平线 1/v（虚线）：无论排列多长，斜率都不可能超过 1/v。深度越大，曲线越晚靠近这条渐近线——深层的远道才真正接近水平传播。', 'p rises monotonically from zero and asymptotes to the dashed line at 1/v: however long the spread, the slope can never exceed 1/v. The deeper the reflector, the later the curve approaches the asymptote — only far traces from deep events are truly near-horizontal.'),
      compute: (p) => {
        const v = p['sv']
        const z = p['sz']
        const cur: Array<[number, number]> = []
        const lim: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const X = (i / 300) * 8000
          const L = Math.sqrt(z * z + (X / 2) * (X / 2))
          cur.push([X, (1000 * X) / (2 * v * L)])
          lim.push([X, 1000 / v])
        }
        return [
          { label: t('p = dT/dX = X/(2vL)', 'p = dT/dX = X/(2vL)'), color: '#185FA5', points: cur },
          { label: t('渐近线 1/v', 'asymptote 1/v'), color: '#BA7517', dash: true, points: lim },
        ]
      },
    },
  ],
  example: {
    title: t('由斜率读取射线参数', 'Reading the ray parameter from a slope'),
    input: t('v = 2500 m/s，z = 2000 m，X = 4000 m', 'v = 2500 m/s, z = 2000 m, X = 4000 m'),
    steps: [
      t('L = √(2000² + 2000²) = 2828 m，T = 2×2828/2500 = 2.263 s', 'L = √(2000² + 2000²) = 2828 m, T = 2×2828/2500 = 2.263 s'),
      t('p = X/(2vL) = 4000/(2×2500×2828) = 2.83×10⁻⁴ s/m', 'p = X/(2vL) = 4000/(2×2500×2828) = 2.83×10⁻⁴ s/m'),
      t('1/v = 4.0×10⁻⁴ s/m，sin i = p·v = 0.707，i = 45°', '1/v = 4.0×10⁻⁴ s/m, sin i = p·v = 0.707, i = 45°'),
    ],
    output: t('该道的视速度为 1/p ≈ 3536 m/s；X = 4000 m 时射线以 45° 入射到反射面', 'The apparent velocity of this trace is 1/p ≈ 3536 m/s; at X = 4000 m the ray hits the reflector at 45°'),
  },
  links: {
    upstream: [{ id: 'ray-parameter-conservation', note: t('p 沿射线守恒是本条的前提', 'conservation of p along the ray is the premise') }],
    downstream: [{ id: 'reflection-hyperbola', note: t('双曲时距的斜率就是这个 p', 'the slope of the hyperbolic travel time is exactly this p') }],
    seealso: [{ id: 'nmo-correction' }],
  },
  refs: [
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.2' },
    { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 4' },
  ],
}

export default rayParameterSlope
