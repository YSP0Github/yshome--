import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** head-wave-critical-angle */
const headWaveCriticalAngle: FormulaCard = {
  id: 'head-wave-critical-angle',
  name: t('首波（折射波）与临界角', 'Head Waves and the Critical Angle'),
  aliases: {
    zh: ['首波', '折射波', '滑行波', '临界角', '广角反射'],
    en: ['head wave', 'refracted arrival', 'critical refraction', 'wide-angle reflection'],
  },
  node: 'S2.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.EXPL', 'METH.TELE', 'METH.STRUCT'],
    quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    keywords: t('首波 折射波 临界角 滑行波 交叉距离 截距时间 折射地震学', 'head wave refracted arrival critical angle crossover distance intercept time refraction seismology'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`t_{\mathrm{head}}\left(x\right)=\frac{x}{v_{2}}+\frac{2h\cos i_{c}}{v_{1}},\qquad \sin i_{c}=\frac{v_{1}}{v_{2}}`,
    variants: [
      {
        name: t('截距时间的显式形式', 'Intercept time written explicitly'),
        latex: String.raw`t_{i}=\frac{2h\cos i_{c}}{v_{1}}=\frac{2h\sqrt{v_{2}^{2}-v_{1}^{2}}}{v_{1}v_{2}}`,
      },
      {
        name: t('临界距离（首波开始出现）', 'Critical distance (where the head wave first appears)'),
        latex: String.raw`x_{c}=2h\tan i_{c}=\frac{2hv_{1}}{\sqrt{v_{2}^{2}-v_{1}^{2}}}`,
      },
      {
        name: t('交叉距离（首波取代直达波成为初至）', 'Crossover distance (where the head wave becomes the first arrival)'),
        latex: String.raw`x_{x}=2h\sqrt{\frac{v_{2}+v_{1}}{v_{2}-v_{1}}}`,
      },
      {
        name: t('表观速度', 'Apparent velocity'),
        latex: String.raw`\frac{\mathrm{d}t_{\mathrm{head}}}{\mathrm{d}x}=\frac{1}{v_{2}}`,
      },
    ],
  },
  meaning: t(
    '当下伏层更快时，以临界角入射的波会沿界面以 v₂ 滑行，并持续向上辐射能量——这就是首波。它在时距图上是一条斜率为 1/v₂ 的直线，比直达波更平缓，所以在远偏移距必然反超直达波成为初至。折射地震学正是靠读这条直线的斜率和截距，同时得到折射层速度 v₂ 与深度 h。',
    'When the underlying layer is faster, a wave incident at the critical angle travels along the interface at v₂ while continuously radiating energy back upward — the head wave. On a time–distance plot it is a straight line of slope 1/v₂, flatter than the direct wave, so at large offsets it inevitably overtakes the direct arrival. Refraction seismology reads the slope and the intercept of that line to obtain both the refractor velocity v₂ and its depth h.',
  ),
  symbols: [
    { sym: 't_{\\mathrm{head}}', name: t('首波走时', 'head-wave travel time'), unit: 's', typical: '0.1 – 5' },
    { sym: 'x', name: t('炮检距（震源到台站的水平距离）', 'offset (horizontal source–receiver distance)'), unit: 'm', typical: '100 – 30000' },
    { sym: 'v_{1}', name: t('上覆层速度', 'velocity of the overlying layer'), unit: 'm/s', typical: '1500 – 5000' },
    { sym: 'v_{2}', name: t('折射层（下伏高速层）速度', 'velocity of the refractor (faster layer below)'), unit: 'm/s', typical: '3000 – 7000' },
    { sym: 'h', name: t('折射界面深度', 'depth of the refractor'), unit: 'm', typical: '10 – 5000' },
    { sym: 'i_{c}', name: t('临界角（自界面法线量起）', 'critical angle (measured from the interface normal)'), unit: '°', typical: '30 – 80' },
    { sym: 't_{i}', name: t('截距时间（交叉时），直线的 t 轴截距', 'intercept time (intercept on the t axis)'), unit: 's', typical: '0.02 – 1' },
    { sym: 'x_{c}', name: t('临界距离', 'critical distance'), unit: 'm' },
    { sym: 'x_{x}', name: t('交叉距离', 'crossover distance'), unit: 'm' },
  ],
  conditions: {
    applies: [
      t('下伏层速度大于上覆层（v₂ > v₁）的水平层状介质', 'Horizontally layered media with the underlying layer faster (v₂ > v₁)'),
      t('远偏移距记录（广角反射 / 折射勘探、地震测深）', 'Wide-offset recording (wide-angle reflection, refraction profiling, seismic sounding)'),
    ],
    assumes: [
      t('界面水平、速度在层内恒定', 'The interface is horizontal and velocity is constant within each layer'),
      t('高频（射线）近似成立，界面尺度远大于波长', 'The high-frequency (ray) approximation holds; the interface is smooth on the wavelength scale'),
    ],
    breaks: [
      t('v₂ ≤ v₁ 时不产生首波', 'No head wave is generated when v₂ ≤ v₁'),
      t('速度梯度型介质（无清晰界面）要用回折波而非首波描述', 'Gradient media without a sharp interface require diving waves rather than head waves'),
      t('隐伏高速薄层（盲层）在时距图上不出现首波段，会被漏掉', 'A hidden thin high-velocity layer (blind zone) produces no head-wave segment and will be missed'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'geometry',
      title: t('首波的三段路径', 'The three legs of a head wave'),
      latex: String.raw`\text{下行（入射角 } i_{c})\ \to\ \text{沿界面滑行（} v_{2})\ \to\ \text{上行（出射角 } i_{c})`,
      note: t('滑行段的能量不断向上泄漏，才使我们能在地表收到它。', 'The creeping segment leaks energy upward continuously, which is why we can record it at the surface.'),
    },
    {
      n: 2,
      op: 'physics',
      title: t('三段走时相加', 'Add the travel times of the three legs'),
      latex: String.raw`t=\frac{2h}{v_{1}\cos i_{c}}+\frac{x-2h\tan i_{c}}{v_{2}}`,
    },
    {
      n: 3,
      op: 'identity',
      title: t('代入临界角条件 sin i_c = v₁/v₂', 'Insert the critical-angle condition sin i_c = v₁/v₂'),
      latex: String.raw`\frac{2h\tan i_{c}}{v_{2}}=\frac{2h\sin i_{c}}{v_{2}\cos i_{c}}=\frac{2h\,v_{1}}{v_{2}^{2}\cos i_{c}}`,
    },
    {
      n: 4,
      op: 'algebra',
      title: t('合并含 h 的两项', 'Combine the two terms containing h'),
      latex: String.raw`\frac{2h}{v_{1}\cos i_{c}}-\frac{2h v_{1}}{v_{2}^{2}\cos i_{c}}=\frac{2h}{v_{1}\cos i_{c}}\left(1-\frac{v_{1}^{2}}{v_{2}^{2}}\right)=\frac{2h\cos i_{c}}{v_{1}}`,
      note: t('关键一步：1 − v₁²/v₂² = cos²i_c，正好把 1/cos 抵消掉一个。', 'The key step: 1 − v₁²/v₂² = cos²i_c cancels one power of 1/cos.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('直线形式：斜率给 v₂，截距给 h', 'Straight-line form: the slope gives v₂, the intercept gives h'),
      latex: String.raw`t\left(x\right)=\frac{x}{v_{2}}+t_{i},\qquad t_{i}=\frac{2h\sqrt{v_{2}^{2}-v_{1}^{2}}}{v_{1}v_{2}}`,
    },
    {
      n: 6,
      op: 'algebra',
      title: t('与直达波比较，求交叉距离', 'Compare with the direct wave to get the crossover distance'),
      latex: String.raw`\frac{x}{v_{1}}=\frac{x}{v_{2}}+t_{i}\;\Longrightarrow\; x_{x}=\frac{t_{i}v_{1}v_{2}}{v_{2}-v_{1}}=2h\sqrt{\frac{v_{2}+v_{1}}{v_{2}-v_{1}}}`,
      note: t('速度反差越小，交叉距离越远：野外布置排列长度必须超过它，否则看不到首波。', 'The smaller the velocity contrast, the more distant the crossover: field spreads must be longer than it, otherwise no head wave is recorded.'),
    },
  ],
  viz: [
    {
      id: 'head-tt',
      level: 'V1',
      title: t('直达波与首波的时距曲线', 'Travel-time curves of the direct and head waves'),
      xlabel: t('炮检距 x (m)', 'offset x (m)'),
      ylabel: t('走时 t (s)', 'travel time t (s)'),
      controls: [
        { id: 'hv1', label: t('上覆层速度 v₁', 'overlying velocity v₁'), min: 1000, max: 4000, step: 50, value: 2000, unit: 'm/s' },
        { id: 'hv2', label: t('折射层速度 v₂', 'refractor velocity v₂'), min: 2500, max: 7000, step: 50, value: 5000, unit: 'm/s' },
        { id: 'hh', label: t('折射面深度 h', 'refractor depth h'), min: 100, max: 4000, step: 50, value: 1000, unit: 'm' },
      ],
      xRange: [0, 20000],
      note: t('蓝线是直达波（斜率 1/v₁），绿线是首波（斜率 1/v₂、截距 t_i）。两线交点就是交叉距离 x_x，超过它首波才是初至。把 v₂ 调到接近 v₁，交点会迅速冲出排列之外——这正是折射勘探必须放长排列的原因。', 'Blue is the direct wave (slope 1/v₁), green the head wave (slope 1/v₂ with intercept t_i). Their intersection is the crossover distance x_x, beyond which the head wave is the first arrival. Bring v₂ close to v₁ and the intersection runs off the end of the spread — exactly why refraction surveys need long spreads.'),
      compute: (p) => {
        const v1 = p['hv1']
        const v2 = p['hv2']
        const h = p['hh']
        const XMAX = 20000
        const dir: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const x = (i / 400) * XMAX
          dir.push([x, x / v1])
        }
        const head: Array<[number, number]> = []
        const s = v1 / v2
        const cosIc = Math.sqrt(Math.max(0, 1 - s * s))
        if (cosIc > 1e-6) {
          const ti = (2 * h * cosIc) / v1
          const xc = (2 * h * s) / cosIc
          for (let i = 0; i <= 400; i++) {
            const x = (i / 400) * XMAX
            if (x >= xc) head.push([x, x / v2 + ti])
          }
        }
        return [
          { label: t('直达波 x/v₁', 'direct wave x/v₁'), color: '#185FA5', points: dir },
          { label: t('首波 x/v₂ + t_i', 'head wave x/v₂ + t_i'), color: '#0F6E56', points: head },
        ]
      },
    },
  ],
  example: {
    title: t('浅层折射勘探的典型排列', 'A typical shallow refraction spread'),
    input: t('v₁ = 2000 m/s，v₂ = 5000 m/s，h = 1000 m', 'v₁ = 2000 m/s, v₂ = 5000 m/s, h = 1000 m'),
    steps: [
      t('sin i_c = 0.4，i_c = 23.6°，cos i_c = 0.917', 'sin i_c = 0.4, i_c = 23.6°, cos i_c = 0.917'),
      t('t_i = 2·1000·0.917/2000 = 0.917 s', 't_i = 2·1000·0.917/2000 = 0.917 s'),
      t('x_x = 2·1000·√((5000+2000)/(5000−2000)) = 3055 m', 'x_x = 2·1000·√((5000+2000)/(5000−2000)) = 3055 m'),
    ],
    output: t('排列必须长于约 3 km 才能记录到作为初至的首波；读出斜率 1/5000 与截距 0.917 s 即可反演出 v₂ 与 h', 'The spread must exceed about 3 km to record the head wave as first arrival; the slope 1/5000 and intercept 0.917 s invert directly to v₂ and h'),
  },
  links: {
    upstream: [
      { id: 'snell-ray-parameter', note: t('临界角来自 Snell 定律', 'the critical angle follows from Snell\'s law') },
      { id: 'direct-wave-travel-time', note: t('直达波是被首波反超的基准', 'the direct wave is the baseline the head wave overtakes') },
    ],
    downstream: [{ id: 'refracted-wave-intercept-time', note: t('截距时间是深度反演的观测量', 'the intercept time is the observable for depth inversion') }],
    seealso: [{ id: 'critical-angle-total-reflection' }],
  },
  refs: [
    { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.4' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.2' },
  ],
}

export default headWaveCriticalAngle
