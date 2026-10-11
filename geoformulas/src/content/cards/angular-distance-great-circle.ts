import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** angular-distance-great-circle */
const angularDistanceGreatCircle: FormulaCard = {
  id: 'angular-distance-great-circle',
  name: t('角震中距与大圆距离', 'Angular Distance & Great-circle Range'),
  aliases: { zh: ['震中距换算', '大圆距离', '球面余弦公式'], en: ['epicentral distance', 'great-circle distance', 'spherical law of cosines'] },
  node: 'S2.4',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.TELE', 'METH.STRUCT'],
    quantity: ['Q.GEOM', 'Q.TIME'],
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\cos\Delta = \sin\phi_{1}\sin\phi_{2} + \cos\phi_{1}\cos\phi_{2}\cos(\lambda_{2}-\lambda_{1})`,
    variants: [
      { name: t('弧长（沿地表）', 'Arc length (along the surface)'), latex: String.raw`X = a\Delta = \frac{\pi a}{180^{\circ}}\Delta_{deg} \approx 111.19\,\Delta_{deg}\ \text{km}` },
      { name: t('弦长（穿过地球）', 'Chord length (through the Earth)'), latex: String.raw`D = 2a\sin\frac{\Delta}{2}` },
      { name: t('震源距与震中距', 'Hypocentral versus epicentral distance'), latex: String.raw`R = \sqrt{D^{2} + h^{2}}` },
    ],
  },
  meaning: t(
    '地震学里震中距几乎一律用「地心张角 Δ」来报告，而不是公里数。因为球面上走时只依赖于这个张角，与台站、震中的绝对位置无关。公式（主式）就是球面余弦定理，它把两点的经纬度直接变成 Δ。',
    'In seismology, epicentral distance is almost always reported as the geocentric angle Δ rather than in kilometres, because travel times on a sphere depend only on that angle and not on the absolute positions. The main formula is the spherical law of cosines, turning two lon/lat pairs directly into Δ.',
  ),
  symbols: [
    { sym: '\\Delta', name: t('震中距（地心张角）', 'epicentral distance (geocentric angle)'), unit: '°', typical: '0 – 180' },
    { sym: '\\phi', name: t('地理纬度', 'geographic latitude'), unit: '°' },
    { sym: '\\lambda', name: t('经度', 'longitude'), unit: '°' },
    { sym: 'X', name: t('大圆弧长', 'great-circle arc length'), unit: 'km' },
    { sym: 'D', name: t('弦长', 'chord length'), unit: 'km' },
    { sym: 'h', name: t('震源深度', 'source depth'), unit: 'km' },
    { sym: 'R', name: t('震源距', 'hypocentral distance'), unit: 'km' },
  ],
  conditions: {
    applies: [t('把地球当作球时的台站—震中几何换算', 'Station–source geometry when the Earth is treated as a sphere')],
    assumes: [
      t('地球为半径 a 的球', 'The Earth is a sphere of radius a'),
      t('纬度为地理纬度', 'Latitudes are geographic latitudes'),
    ],
    breaks: [
      t('要求亚公里精度时必须改用 WGS84 椭球大地线', 'Sub-kilometre accuracy requires the WGS84 ellipsoidal geodesic'),
      t('Δ 接近 180° 时反余弦对舍入误差敏感', 'Near Δ = 180° the arccosine is sensitive to round-off'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把两点写成单位球上的矢量', 'Write both points as unit-sphere vectors'),
      latex: String.raw`\hat{r}_i = (\cos\phi_i\cos\lambda_i,\ \cos\phi_i\sin\lambda_i,\ \sin\phi_i)` },
    { n: 2, op: 'identity', title: t('张角由点积给出', 'The angle comes from the dot product'),
      latex: String.raw`\hat{r}_1\cdot\hat{r}_2 = \cos\Delta = \sin\phi_1\sin\phi_2 + \cos\phi_1\cos\phi_2\cos(\lambda_2-\lambda_1)` },
    { n: 3, op: 'geometry', title: t('弧长与弦长', 'Arc and chord'),
      latex: String.raw`X = a\Delta,\qquad D = 2a\sin\frac{\Delta}{2}` },
    { n: 4, op: 'result', title: t('常用换算常数', 'The everyday conversion constant'),
      latex: String.raw`1^{\circ} = \frac{\pi\times 6371}{180} = 111.19\ \text{km},\qquad 111.19\ \text{km} \approx 69.1\ \text{mile}` },
  ],
  viz: [
    {
      id: 'arc-vs-chord',
      level: 'V1',
      title: t('弧长与弦长随震中距的变化', 'Arc and chord length versus epicentral distance'),
      xlabel: t('Δ (°)', 'Δ (°)'),
      ylabel: t('距离 (km)', 'distance (km)'),
      controls: [
        { id: 'a', label: t('地球半径 a (km)', 'Earth radius a (km)'), min: 6000, max: 6500, step: 1, value: 6371 },
      ],
      note: t('两条曲线在 Δ 小的时候几乎重合，到 180° 时差到整个地球直径 —— 体波走的是弦，面波走的是弧。', 'The two curves coincide at small Δ and differ by a full Earth diameter at 180° — body waves sample the chord, surface waves the arc.'),
      compute: (p) => {
        const a = p['a']
        const arc: Array<[number, number]> = []
        const chord: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const d = i
          const rad = (d * Math.PI) / 180
          arc.push([d, a * rad])
          chord.push([d, 2 * a * Math.sin(rad / 2)])
        }
        return [
          { label: t('弧长 X = aΔ', 'arc X = aΔ'), color: '#185FA5', points: arc },
          { label: t('弦长 D', 'chord D'), color: '#0F6E56', points: chord, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('北京到东京的震中距', 'Epicentral distance from Beijing to Tokyo'),
    input: t('φ₁ = 39.90°N, λ₁ = 116.41°E；φ₂ = 35.68°N, λ₂ = 139.69°E', 'φ₁ = 39.90°N, λ₁ = 116.41°E; φ₂ = 35.68°N, λ₂ = 139.69°E'),
    steps: [
      t('cos Δ = sin39.90 sin35.68 + cos39.90 cos35.68 cos(23.28)', 'cos Δ = sin39.90 sin35.68 + cos39.90 cos35.68 cos(23.28)'),
      t('= 0.6413×0.5829 + 0.7673×0.8125×0.9187 = 0.3738 + 0.5727 = 0.9465', '= 0.6413×0.5829 + 0.7673×0.8125×0.9187 = 0.3738 + 0.5727 = 0.9465'),
      t('Δ = 18.81° → X = 111.19 × 18.81 = 2091 km', 'Δ = 18.81° → X = 111.19 × 18.81 = 2091 km'),
    ],
    output: t('Δ ≈ 18.8°，约 2090 km', 'Δ ≈ 18.8°, about 2090 km'),
  },
  links: {
    seealso: [
      { id: 'hypocentral-distance-geometry', note: t('震源距的勾股关系', 'Pythagorean relation for hypocentral distance') },
      { id: 'ellipticity-correction', note: t('球近似的修正', 'The correction to the spherical approximation') },
    ],
  },
  refs: [{ text: 'Bullen & Bolt, An Introduction to the Theory of Seismology, 4th ed., ch. 8' }],
}

export default angularDistanceGreatCircle
