import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** refracted-wave-intercept-time */
const refractedWaveInterceptTime: FormulaCard = {
  id: 'refracted-wave-intercept-time',
  name: t('折射波的截距时间', 'Intercept Time of Refracted Waves'),
  aliases: {
    zh: ['截距时间', '交叉时', '折射深度反演'],
    en: ['intercept time', 'intercept', 'refraction depth inversion'],
  },
  node: 'S2.3',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.EXPL', 'METH.INV', 'METH.STRUCT'],
    quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    keywords: t('截距时间 交叉时 折射波 深度反演 折射层 首波', 'intercept time refraction depth inversion refractor head wave'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`t_{i}=\frac{2h\cos i_{c}}{v_{1}}=\frac{2h\sqrt{v_{2}^{2}-v_{1}^{2}}}{v_{1}v_{2}}`,
    variants: [
      {
        name: t('走时直线中的角色', 'Its role in the travel-time line'),
        latex: String.raw`t\left(x\right)=\frac{x}{v_{2}}+t_{i}`,
      },
      {
        name: t('由截距反演深度', 'Inverting the intercept for depth'),
        latex: String.raw`h=\frac{t_{i}\,v_{1}v_{2}}{2\sqrt{v_{2}^{2}-v_{1}^{2}}}`,
      },
      {
        name: t('多层介质的推广', 'Generalisation to many layers'),
        latex: String.raw`t_{i}=\sum_{k=1}^{n-1}2h_{k}\sqrt{\frac{1}{v_{k}^{2}}-\frac{1}{v_{n}^{2}}}`,
      },
      {
        name: t('用射线参数写出', 'Written with the ray parameter'),
        latex: String.raw`t_{i}=2\int_{0}^{z_{n}}\sqrt{\frac{1}{v^{2}\left(z\right)}-p^{2}}\,\mathrm{d}z`,
      },
    ],
  },
  meaning: t(
    '首波时距直线在 t 轴上的截距不是「零偏移距走时」，而是射线以临界角往返穿越上覆层所需的时间。它把深度信息单独装在一个可测量的数里：读出斜率得折射层速度，读出截距就得深度。多层介质中截距是各层贡献之和，每一层的贡献都含该层的厚度与速度——这正是折射测深能逐层求深的根据。',
    'The intercept of the head-wave line on the time axis is not a zero-offset travel time; it is the time the ray needs to cross the overlying layer down and back up at the critical angle. It packs the depth information into a single measurable number: the slope gives the refractor velocity and the intercept gives the depth. In a layered medium the intercept is the sum of contributions from every layer above the refractor, each containing that layer\'s thickness and velocity — the very basis on which refraction sounding solves depth layer by layer.',
  ),
  symbols: [
    { sym: 't_{i}', name: t('截距时间（交叉时）', 'intercept time'), unit: 's', typical: '0.02 – 2' },
    { sym: 'h', name: t('折射界面深度', 'depth of the refractor'), unit: 'm', typical: '10 – 5000' },
    { sym: 'h_{k}', name: t('第 k 层厚度', 'thickness of layer k'), unit: 'm' },
    { sym: 'i_{c}', name: t('临界角，sin i_c = v₁/v₂', 'critical angle, sin i_c = v₁/v₂'), unit: '°' },
    { sym: 'v_{1}', name: t('上覆层速度', 'velocity of the overlying layer'), unit: 'm/s', typical: '1500 – 5000' },
    { sym: 'v_{2}\\ \\text{或}\\ v_{n}', name: t('折射层速度', 'refractor velocity'), unit: 'm/s', typical: '3000 – 7000' },
    { sym: 'p', name: t('射线参数，等于 1/v_n', 'ray parameter, equal to 1/v_n'), unit: 's/m' },
    { sym: 'x', name: t('炮检距', 'offset'), unit: 'm' },
  ],
  conditions: {
    applies: [
      t('折射初至的斜率—截距解释、折射测深与工程勘察', 'Slope–intercept interpretation of refraction first arrivals, refraction sounding and engineering surveys'),
      t('由首波走时直线反演折射面深度与起伏', 'Inverting refractor depth and relief from head-wave travel-time lines'),
    ],
    assumes: [
      t('界面水平、层内速度恒定、v_n 随深度递增', 'Horizontal interfaces, constant velocity within layers, v_n increasing with depth'),
      t('首波已被正确识别为初至，且排列足够长', 'The head wave is correctly identified as first arrival and the spread is long enough'),
    ],
    breaks: [
      t('存在隐伏层（盲层）或速度倒转时截距不再对应真实深度', 'With hidden layers (blind zones) or velocity reversals the intercept no longer maps to a true depth'),
      t('界面倾斜时截距随炮点位置变化，需用相遇法（正反双向）分别求取', 'For a dipping refractor the intercept varies with shot position and reciprocal (forward and reverse) profiling is required'),
      t('上覆层为速度梯度时首波概念失效，应改用回折波与 τ–p 反演', 'With a gradient overburden the head-wave concept fails and diving waves with τ–p inversion should be used'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('从首波的三段走时出发', 'Start from the three legs of the head wave'),
      latex: String.raw`t=\frac{2h}{v_{1}\cos i_{c}}+\frac{x-2h\tan i_{c}}{v_{2}}`,
    },
    {
      n: 2,
      op: 'identity',
      title: t('代入临界角条件', 'Insert the critical-angle condition'),
      latex: String.raw`\sin i_{c}=\frac{v_{1}}{v_{2}},\qquad \cos i_{c}=\sqrt{1-\frac{v_{1}^{2}}{v_{2}^{2}}}=\frac{\sqrt{v_{2}^{2}-v_{1}^{2}}}{v_{2}}`,
    },
    {
      n: 3,
      op: 'algebra',
      title: t('合并两项，含 x 的项留下，含 h 的项合并', 'Group the x term and combine the h terms'),
      latex: String.raw`t=\frac{x}{v_{2}}+\frac{2h}{v_{1}\cos i_{c}}\left(1-\frac{v_{1}^{2}}{v_{2}^{2}}\right)=\frac{x}{v_{2}}+\frac{2h\cos i_{c}}{v_{1}}`,
    },
    {
      n: 4,
      op: 'result',
      title: t('截距时间', 'Intercept time'),
      latex: String.raw`t_{i}=\frac{2h\cos i_{c}}{v_{1}}=\frac{2h\sqrt{v_{2}^{2}-v_{1}^{2}}}{v_{1}v_{2}}`,
      note: t('注意 t_i 随速度反差增大而增大：反差越大临界角越小，射线上下行越接近垂直，耗时越接近 2h/v₁。', 'Note that t_i grows with the velocity contrast: a larger contrast means a smaller critical angle, a more nearly vertical down-and-up path, and a time approaching 2h/v₁.'),
    },
    {
      n: 5,
      op: 'transform',
      title: t('多层推广：每层以自己的临界角穿越', 'Generalisation: each layer is crossed at its own critical angle'),
      latex: String.raw`\sin i_{k}=\frac{v_{k}}{v_{n}}\;\Longrightarrow\; t_{i}=\sum_{k=1}^{n-1}\frac{2h_{k}\cos i_{k}}{v_{k}}=\sum_{k=1}^{n-1}2h_{k}\sqrt{\frac{1}{v_{k}^{2}}-\frac{1}{v_{n}^{2}}}`,
      note: t('被开方的量就是垂直慢度的平方 1/v_k² − p²，所以截距时间就是垂直慢度沿深度的积分。', 'The quantity under the root is the squared vertical slowness 1/v_k² − p², so the intercept time is the integral of vertical slowness over depth.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('逐层反演', 'Layer-by-layer inversion'),
      latex: String.raw`h_{n-1}=\frac{t_{i}^{\left(n\right)}-\sum_{k<n-1}2h_{k}\sqrt{1/v_{k}^{2}-1/v_{n}^{2}}}{2\sqrt{1/v_{n-1}^{2}-1/v_{n}^{2}}}`,
      note: t('从浅到深逐层剥离：每反演出一层厚度，就把它从截距里扣掉，再算下一层。', 'Peel from shallow to deep: each recovered thickness is subtracted from the intercept before the next layer is computed.'),
    },
  ],
  viz: [
    {
      id: 'intercept-vs-contrast',
      level: 'V1',
      title: t('截距时间随折射层速度的变化', 'Intercept time versus refractor velocity'),
      xlabel: t('折射层速度 v₂ (m/s)', 'refractor velocity v₂ (m/s)'),
      ylabel: t('截距时间 t_i (s)', 'intercept time t_i (s)'),
      controls: [
        { id: 'iv1', label: t('上覆层速度 v₁', 'overlying velocity v₁'), min: 1000, max: 4000, step: 50, value: 2000, unit: 'm/s' },
      ],
      xRange: [1500, 9000],
      note: t('三条曲线对应 500、1000、2000 m 三个深度。速度反差越小（v₂ 越接近 v₁），截距越小并趋于零——反差微弱时首波几乎与直达波重合，深度信息也随之消失。反差大时截距趋于 2h/v₁，即垂直往返时间。', 'The three curves are for depths of 500, 1000 and 2000 m. The smaller the velocity contrast (v₂ close to v₁), the smaller the intercept, tending to zero — with a weak contrast the head wave nearly coincides with the direct wave and the depth information disappears with it. For a large contrast the intercept tends to 2h/v₁, the vertical two-way time.'),
      compute: (p) => {
        const v1 = p['iv1']
        const palette = ['#185FA5', '#0F6E56', '#BA7517']
        const depths = [500, 1000, 2000]
        const out = []
        for (let j = 0; j < depths.length; j++) {
          const h = depths[j]
          const pts: Array<[number, number]> = []
          for (let i = 0; i <= 300; i++) {
            const v2 = 1500 + (i / 300) * 7500
            if (v2 <= v1) continue
            const ti = (2 * h * Math.sqrt(v2 * v2 - v1 * v1)) / (v1 * v2)
            pts.push([v2, ti])
          }
          out.push({
            label: t(`h = ${h} m`, `h = ${h} m`),
            color: palette[j],
            points: pts,
          })
        }
        return out
      },
    },
  ],
  example: {
    title: t('用截距求基岩深度', 'Bedrock depth from the intercept'),
    input: t('读得首波斜率 1/5000 s/m、截距 t_i = 0.92 s，上覆层 v₁ = 2000 m/s', 'The head-wave line has slope 1/5000 s/m and intercept t_i = 0.92 s, with v₁ = 2000 m/s'),
    steps: [
      t('由斜率得 v₂ = 5000 m/s', 'The slope gives v₂ = 5000 m/s'),
      t('√(v₂² − v₁²) = √(25×10⁶ − 4×10⁶) = 4583 m/s', '√(v₂² − v₁²) = √(25×10⁶ − 4×10⁶) = 4583 m/s'),
      t('h = 0.92 × 2000 × 5000 /(2 × 4583) ≈ 1003 m', 'h = 0.92 × 2000 × 5000 /(2 × 4583) ≈ 1003 m'),
    ],
    output: t('基岩埋深约 1.0 km；若 v₁ 估计偏高 10%，深度结果会偏大约 10%，说明截距法对上覆层速度很敏感', 'The bedrock lies about 1.0 km deep; a 10% overestimate of v₁ biases the depth by roughly 10% as well, showing how sensitive the intercept method is to the overburden velocity'),
  },
  links: {
    upstream: [{ id: 'head-wave-critical-angle', note: t('截距来自首波走时直线', 'the intercept comes from the head-wave line') }],
    downstream: [{ id: 'average-velocity-conversion', note: t('折射求深常与时深转换互相校验', 'refraction depths are often cross-checked against time-depth conversion') }],
    seealso: [{ id: 'ray-parameter-slope', note: t('截距时间的 τ–p 解释', 'the τ–p interpretation of the intercept') }],
  },
  refs: [
    { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.4' },
    { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 7' },
  ],
}

export default refractedWaveInterceptTime
