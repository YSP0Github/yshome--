import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** earth-flattening-transformation */
const earthFlatteningTransformation: FormulaCard = {
  id: 'earth-flattening-transformation',
  name: t('地球扁平化变换', 'Earth-flattening Transformation'),
  aliases: { zh: ['EFT', '球—平变换', '扁平地球近似'], en: ['EFT', 'earth flattening approximation', 'Müller transformation'] },
  node: 'S2.4',
  tags: {
    math: ['MATH.APPROX', 'MATH.GEOM'],
    method: ['METH.TELE', 'METH.STRUCT'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`z = -a\ln\frac{r}{a},\qquad \bar{v}(z) = \frac{a}{r}\,v(r),\qquad \bar{p} = \frac{p}{a} = \frac{\sin\bar{i}}{\bar{v}}`,
    variants: [
      { name: t('反变换：回到球坐标', 'Inverse: back to spherical coordinates'), latex: String.raw`r = a\,e^{-z/a},\qquad v(r) = \frac{r}{a}\,\bar{v}\!\left(-a\ln\frac{r}{a}\right)` },
      { name: t('不变量：角度、走时、震中距', 'Invariants: angle, travel time, range'), latex: String.raw`\bar{i} = i,\qquad X = a\Delta,\qquad \bar{T}(\bar{p}) = T(p)` },
      { name: t('浅部一阶近似', 'First-order shallow approximation'), latex: String.raw`z \approx h + \frac{h^{2}}{2a},\qquad \bar{v} \approx v(h)\left(1 + \frac{h}{a}\right),\quad h = a - r` },
    ],
  },
  meaning: t(
    '球对称地球里的射线弯曲有两部分来源：速度随深度变化，以及地球本身的曲率。扁平化变换把「曲率」这一部分精确地吸收进一个等价的半空间速度模型里，于是所有平层公式（Wiechert–Herglotz、τ–p、反射时距）都能原封不动地用在球状地球上。',
    'In a spherically symmetric Earth rays bend for two reasons: the velocity increases with depth, and the Earth itself is curved. The flattening transformation absorbs the curvature exactly into an equivalent half-space velocity model, so every flat-layer formula (Wiechert–Herglotz, τ–p, reflection moveout) can be applied unchanged to the sphere.',
  ),
  symbols: [
    { sym: 'a', name: t('地球半径', 'Earth radius'), unit: 'km', typical: '6371' },
    { sym: 'r', name: t('地心半径', 'radius from Earth centre'), unit: 'km' },
    { sym: 'h', name: t('真实深度 h = a − r', 'true depth h = a − r'), unit: 'km' },
    { sym: 'z', name: t('扁平化后的等价深度', 'equivalent flattened depth'), unit: 'km' },
    { sym: '\\bar{v}', name: t('扁平化后的等价速度', 'equivalent flattened velocity'), unit: 'km/s' },
    { sym: 'p', name: t('球坐标射线参数 p = r sin i / v', 'spherical ray parameter p = r sin i / v'), unit: 's' },
    { sym: '\\bar{p}', name: t('平层射线参数 sin ī / v̄', 'flat-earth ray parameter sin ī / v̄'), unit: 's/km' },
  ],
  conditions: {
    applies: [t('球对称、速度只随 r 变化的地球模型', 'Spherically symmetric Earth models with velocity depending on r only')],
    assumes: [
      t('射线理论（高频近似）成立', 'Ray theory (high-frequency approximation) is valid'),
      t('a 取参考半径，通常 6371 km', 'a is a reference radius, usually 6371 km'),
    ],
    breaks: [
      t('横向非均匀显著时（层析尺度）无意义', 'Meaningless when lateral heterogeneity is significant (tomographic scales)'),
      t('深度接近地心时对数变换发散', 'The logarithm diverges for depths approaching the Earth centre'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('球坐标下的 Snell 定律', "Snell's law in spherical coordinates"),
      latex: String.raw`p = \frac{r\sin i}{v(r)} = \text{const}` },
    { n: 2, op: 'transform', title: t('引入对数深度坐标', 'Introduce the logarithmic depth coordinate'),
      latex: String.raw`z = -a\ln\frac{r}{a}\ \Longrightarrow\ \frac{dr}{r} = -\frac{dz}{a}`,
      note: t('选对数的目的是让球坐标的弧长元 a dΔ 变成平层的 dx。', 'The logarithm is chosen so that the spherical arc element a dΔ becomes the flat-earth dx.') },
    { n: 3, op: 'substitute', title: t('把速度按 a/r 缩放', 'Rescale the velocity by a/r'),
      latex: String.raw`\bar{v}(z) = \frac{a}{r}v(r)\ \Longrightarrow\ \frac{\sin i}{\bar{v}} = \frac{r\sin i}{a v} = \frac{p}{a} = \bar{p}`,
      note: t('角度 i 完全不变，这正是变换漂亮的地方。', 'The angle i is unchanged, which is the elegant part of the transformation.') },
    { n: 4, op: 'identity', title: t('震中距与走时的对应关系', 'Correspondence of range and travel time'),
      latex: String.raw`X = a\Delta,\qquad \frac{dT}{d\Delta} = p\ \Longleftrightarrow\ \frac{dT}{dX} = \frac{p}{a} = \bar{p}` },
    { n: 5, op: 'result', title: t('结论：走时曲线完全一致', 'Result: the travel-time curves are identical'),
      latex: String.raw`\bar{T}(\bar{p}) = T(p),\qquad \bar{X}(\bar{p}) = X(p)` },
  ],
  viz: [
    {
      id: 'eft-velocity-mapping',
      level: 'V1',
      title: t('真实速度剖面与扁平化速度剖面对比', 'True versus flattened velocity profile'),
      xlabel: t('速度 v (km/s)', 'velocity v (km/s)'),
      ylabel: t('深度 (km)', 'depth (km)'),
      controls: [
        { id: 'v0', label: t('地表速度 v₀', 'surface velocity v₀'), min: 4, max: 8, step: 0.05, value: 5.8 },
        { id: 'k', label: t('梯度 k (s⁻¹)', 'gradient k (s⁻¹)'), min: 0, max: 0.004, step: 0.0001, value: 0.0015 },
      ],
      note: t('两条曲线在浅部几乎重合，差别随深度增大 —— 这就是地球曲率被「折进」速度的那一部。', 'The two curves nearly coincide at shallow depth and diverge with depth — that divergence is the curvature folded into the velocity.'),
      compute: (p) => {
        const v0 = p['v0'], k = p['k'], a = 6371
        const real: Array<[number, number]> = []
        const flat: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const h = (i / 200) * 800
          const r = a - h
          const v = v0 + k * h
          real.push([v, h])
          const z = -a * Math.log(r / a)
          flat.push([(a / r) * v, z])
        }
        return [
          { label: t('真实 v(h)', 'true v(h)'), color: '#185FA5', points: real },
          { label: t('扁平化 v̄(z)', 'flattened v̄(z)'), color: '#993C1D', points: flat, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('上地幔 400 km 处的变换', 'Transformation at 400 km in the upper mantle'),
    input: t('a = 6371 km，h = 400 km，v = 9.0 km/s', 'a = 6371 km, h = 400 km, v = 9.0 km/s'),
    steps: [
      t('z = 6371 × ln(6371/5971) = 6371 × 0.0649 = 413.4 km', 'z = 6371 × ln(6371/5971) = 6371 × 0.0649 = 413.4 km'),
      t('v̄ = (6371/5971) × 9.0 = 1.0670 × 9.0 = 9.603 km/s', 'v̄ = (6371/5971) × 9.0 = 1.0670 × 9.0 = 9.603 km/s'),
    ],
    output: t('400 km 的真实深度在扁平模型中变成 413 km，速度放大 6.7%', 'A true depth of 400 km becomes 413 km in the flattened model, with the velocity inflated by 6.7%'),
  },
  links: {
    upstream: [{ id: 'snell-law-spherical-interface', note: t('球面 Snell 定律是其出发点', 'Spherical Snell law is its starting point') }],
    downstream: [
      { id: 'wiechert-herglotz-inversion', note: t('反演前必须先做此变换', 'This transformation precedes the inversion') },
      { id: 'spherical-earth-travel-time', note: t('球状地球走时的计算基础', 'Basis of spherical-Earth travel-time computation') },
    ],
  },
  refs: [{ text: 'Müller, G. (1971). Approximate treatment of elastic body waves in media with spherical symmetry. Geophys. J. R. astr. Soc., 23, 435–449' }],
}

export default earthFlatteningTransformation
