import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** sp-time-difference-distance */
const spTimeDifferenceDistance: FormulaCard = {
  id: 'sp-time-difference-distance',
  name: t('用 S−P 到时差估计震源距', 'Estimating Hypocentral Distance from the S−P Time Difference'),
  aliases: {
    zh: ['S-P 到时差', '震源距估算', '八倍法则'],
    en: ['S minus P', 'S-P time', 'distance estimate', 'rule of eight'],
  },
  node: 'S2.1',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.TELE', 'METH.HAZARD'],
    quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    keywords: t('S-P 到时差 震源距 单台定位 八倍 震级 预警', 'S minus P travel time difference hypocentral distance single-station location rule of eight early warning'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`d=\Delta t\,\frac{\alpha\beta}{\alpha-\beta},\qquad \Delta t=t_{S}-t_{P}`,
    variants: [
      {
        name: t('反解到时差', 'Inverted for the time difference'),
        latex: String.raw`\Delta t=d\left(\frac{1}{\beta}-\frac{1}{\alpha}\right)=\frac{d\left(\alpha-\beta\right)}{\alpha\beta}`,
      },
      {
        name: t('用速度比改写', 'Rewritten with the velocity ratio'),
        latex: String.raw`\frac{\alpha\beta}{\alpha-\beta}=\frac{\alpha}{\alpha/\beta-1}`,
      },
      {
        name: t('地壳中的经验法则', 'Rule of thumb for the crust'),
        latex: String.raw`d\approx 8\,\Delta t\quad (\alpha=6.0,\ \beta=3.46\ \mathrm{km/s};\ d\ \text{以 km 计},\ \Delta t\ \text{以 s 计})`,
      },
    ],
  },
  meaning: t(
    '单个台站只要读到 P 与 S 的到时差，就能立刻给出震源距——不需要台网、不需要走时表。这是地震预警前几秒里唯一可用的距离信息，也是地方台网快速定位与震级估算的第一步。代价是它假设介质均匀：真实地球的射线弯曲与速度横向变化会带来 10%–20% 的系统偏差。',
    'A single station that reads the P and S arrival times immediately obtains the hypocentral distance — no network, no travel-time tables. It is the only distance information available in the first few seconds of an earthquake early warning, and the first step of rapid location and magnitude estimation in regional networks. The price is the assumption of a homogeneous medium: ray bending and lateral heterogeneity in the real Earth introduce 10%–20% systematic bias.',
  ),
  symbols: [
    { sym: 'd', name: t('震源距（震源到台站的直线距离）', 'hypocentral distance'), unit: 'km', typical: '5 – 1000' },
    { sym: '\\Delta t', name: t('S 波与 P 波的到时差', 'S minus P arrival-time difference'), unit: 's', typical: '0.5 – 120' },
    { sym: 't_{P},\\ t_{S}', name: t('P 波、S 波的到时', 'arrival times of P and S'), unit: 's' },
    { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'km/s', typical: '5.0 – 8.0（地壳 6.0）' },
    { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'km/s', typical: '2.9 – 4.6（地壳 3.46）' },
    { sym: '\\alpha/\\beta', name: t('波速比，等价于泊松比 ν = 0.5 时的 √3', 'velocity ratio; √3 for a Poisson solid (ν = 0.25)'), unit: '—', typical: '1.60 – 1.85' },
    { sym: 'k=\\dfrac{\\alpha\\beta}{\\alpha-\\beta}', name: t('换算系数，d = k·Δt', 'conversion factor, d = k·Δt'), unit: 'km/s', typical: '7.5 – 9.0' },
  ],
  conditions: {
    applies: [
      t('单台实时定位、地震预警、地方震速报', 'Single-station real-time location, earthquake early warning, rapid regional reporting'),
      t('震源距小于约 1000 km，P 与 S 均为同一条直达射线', 'Hypocentral distances below about 1000 km, with P and S on the same direct ray'),
    ],
    assumes: [
      t('介质均匀（或可用单一平均速度代表），射线为直线', 'A homogeneous medium, or one representable by a single average velocity, so rays are straight'),
      t('P 与 S 走同一条路径，速度不随频率变化', 'P and S follow the same path and velocities are frequency-independent'),
    ],
    breaks: [
      t('远震（Δ ≳ 10°）：射线弯曲严重，S−P 与距离不再线性', 'Teleseismic distances (Δ ≳ 10°): strong ray bending destroys the linear relation'),
      t('震源深度不可忽略时必须配合震源距几何，否则把 d 当震中距会系统性偏大', 'When the depth is not negligible the hypocentral geometry must be applied, otherwise d taken as epicentral distance is systematically too large'),
      t('波速比 α/β 取错 10%，距离就错约 15%', 'A 10% error in α/β produces roughly a 15% error in distance'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('设介质均匀，P、S 沿同一条直线传播', 'Assume a homogeneous medium with P and S on the same straight ray'),
      latex: String.raw`t_{P}=\frac{d}{\alpha},\qquad t_{S}=\frac{d}{\beta}`,
    },
    {
      n: 2,
      op: 'physics',
      title: t('两式相减：慢度之差乘以距离', 'Subtract: the slowness difference times distance'),
      latex: String.raw`\Delta t=t_{S}-t_{P}=d\left(\frac{1}{\beta}-\frac{1}{\alpha}\right)`,
      note: t('注意这里出现的是「慢度差」1/β − 1/α，而不是速度差。', 'Note that what appears is the slowness difference 1/β − 1/α, not a velocity difference.'),
    },
    {
      n: 3,
      op: 'algebra',
      title: t('通分并解出 d', 'Combine fractions and solve for d'),
      latex: String.raw`\Delta t=\frac{d\left(\alpha-\beta\right)}{\alpha\beta}\;\Longrightarrow\; d=\Delta t\,\frac{\alpha\beta}{\alpha-\beta}`,
    },
    {
      n: 4,
      op: 'substitute',
      title: t('代入地壳典型速度', 'Insert typical crustal velocities'),
      latex: String.raw`k=\frac{\alpha\beta}{\alpha-\beta}=\frac{6.0\times3.46}{6.0-3.46}\approx 8.2\ \mathrm{km/s}`,
      note: t('这就是现场常说的「S−P 乘以 8」：Δt = 3 s 大约对应 25 km。', 'This is the field rule of thumb "S−P times eight": Δt = 3 s corresponds to roughly 25 km.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('用速度比形式看敏感度', 'Sensitivity, via the velocity-ratio form'),
      latex: String.raw`k=\frac{\alpha}{\alpha/\beta-1}\;\Longrightarrow\;\frac{\delta k}{k}\approx\frac{\alpha/\beta}{\alpha/\beta-1}\,\frac{\delta\left(\alpha/\beta\right)}{\alpha/\beta}`,
      note: t('速度比 1.73 时，放大倍数约为 1.73/0.73 ≈ 2.4：波速比错 5%，距离就错 12%。', 'At a ratio of 1.73 the amplification is about 1.73/0.73 ≈ 2.4: a 5% error in the velocity ratio gives a 12% error in distance.'),
    },
  ],
  viz: [
    {
      id: 'sp-dist',
      level: 'V1',
      title: t('震源距随 S−P 到时差的变化', 'Hypocentral distance versus S−P time'),
      xlabel: t('S−P 到时差 Δt (s)', 'S−P time Δt (s)'),
      ylabel: t('震源距 d (km)', 'hypocentral distance d (km)'),
      controls: [
        { id: 'alp', label: t('P 波速度 α', 'P velocity α'), min: 4.5, max: 8.0, step: 0.1, value: 6.0, unit: 'km/s' },
        { id: 'rat', label: t('波速比 α/β', 'velocity ratio α/β'), min: 1.55, max: 2.10, step: 0.01, value: 1.73, unit: '—' },
      ],
      xRange: [0, 25],
      yRange: [0, 260],
      note: t('直线斜率就是换算系数 k = α/(α/β − 1)。把 α/β 从 1.73 拉到 1.90，同样 10 s 的到时差会给出差约 15 km 的距离——单台定位的主要误差来源就在这里。', 'The slope of the line is the conversion factor k = α/(α/β − 1). Pushing α/β from 1.73 to 1.90 changes the distance for the same 10 s difference by about 15 km — the dominant error source in single-station location.'),
      compute: (p) => {
        const alp = p['alp']
        const rat = p['rat']
        const k = alp / Math.max(rat - 1, 0.05)
        const kRef = alp / (1.73 - 1)
        const cur: Array<[number, number]> = []
        const ref: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const dt = (i / 200) * 25
          cur.push([dt, k * dt])
          ref.push([dt, kRef * dt])
        }
        return [
          { label: t(`k = ${k.toFixed(1)} km/s`, `k = ${k.toFixed(1)} km/s`), color: '#185FA5', points: cur },
          { label: t('参考 α/β = 1.73', 'reference α/β = 1.73'), color: '#B4B2A9', dash: true, points: ref },
        ]
      },
    },
  ],
  example: {
    title: t('一次地方震的单台快速估计', 'Rapid single-station estimate for a local earthquake'),
    input: t('读到 t_P = 05:12:14.0，t_S = 05:12:17.6；取 α = 6.0 km/s，α/β = 1.73', 'Read t_P = 05:12:14.0 and t_S = 05:12:17.6; take α = 6.0 km/s, α/β = 1.73'),
    steps: [
      t('Δt = 3.6 s', 'Δt = 3.6 s'),
      t('k = 6.0/(1.73 − 1) = 8.22 km/s', 'k = 6.0/(1.73 − 1) = 8.22 km/s'),
      t('d = 8.22 × 3.6 ≈ 29.6 km', 'd = 8.22 × 3.6 ≈ 29.6 km'),
    ],
    output: t('震源距约 30 km；若震源在 10 km 深，则震中距 ≈ √(30² − 10²) ≈ 28 km', 'Hypocentral distance about 30 km; for a 10 km deep source the epicentral distance is ≈ √(30² − 10²) ≈ 28 km'),
  },
  links: {
    upstream: [
      { id: 'ps-wave-velocities', note: t('给出 α 与 β 以及典型波速比', 'supplies α, β and the typical velocity ratio') },
      { id: 'hypocentral-distance-geometry', note: t('把震源距换算为震中距', 'converts hypocentral to epicentral distance') },
    ],
    downstream: [{ id: 'mw-moment-magnitude', note: t('距离 + 振幅 → 震级', 'distance plus amplitude gives magnitude') }],
    seealso: [{ id: 'seismometer-equation', note: t('到时是在地震计记录上读取的', 'arrival times are read on the seismometer record') }],
  },
  refs: [
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.4' },
    { text: 'Stein & Wysession, An Introduction to Seismology, Earthquakes and Earth Structure, §4.3' },
  ],
}

export default spTimeDifferenceDistance
