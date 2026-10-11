import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** slant-stack-discrete */
const slantStackDiscrete: FormulaCard = {
  id: 'slant-stack-discrete',
  name: t('离散 τ–p 变换（倾斜叠加）', 'Discrete τ–p Transform (Slant Stack)'),
  aliases: { zh: ['倾斜叠加', '平面波分解', 'τ-p 变换'], en: ['slant stack', 'plane-wave decomposition', 'tau-p transform'] },
  node: 'S2.6',
  tags: {
    math: ['MATH.TRANSFORM', 'MATH.FOURIER'],
    method: ['METH.PROC', 'METH.TELE'],
    quantity: ['Q.TIME', 'Q.VEL'],
    keywords: { zh: '拉冬、速度滤波、多次波压制', en: 'radon, velocity filter, multiple suppression' },
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`S(p,\tau) = \sum_{j=1}^{N} u\!\left(x_{j},\ \tau + p\,x_{j}\right)\,\Delta x`,
    variants: [
      { name: t('连续形式', 'Continuous form'), latex: String.raw`S(p,\tau) = \int_{-\infty}^{\infty} u(x,\ \tau + px)\,dx` },
      { name: t('频率域写法', 'Frequency-domain form'), latex: String.raw`S(p,\omega) = \int U(x,\omega)\,e^{-i\omega p x}\,dx` },
      { name: t('近似反变换', 'Approximate inverse'), latex: String.raw`u(x,t) \approx \sum_{p} S(p,\ t - px)\,\Delta p` },
    ],
  },
  meaning: t(
    '倾斜叠加把一张「时间—偏移距」记录沿不同斜率的直线求和。若记录里真有一条斜率为 p₀ 的直线同相轴，那么只有 p = p₀ 这一次求和是同相叠加，能量会聚成一个尖峰。于是 τ–p 域天然把不同视速度的波分开 —— 这正是压制多次波和做速度滤波的原理。',
    'A slant stack sums a time–offset record along lines of different slope. If the record really contains a linear event of slope p₀, only the summation at p = p₀ adds in phase, focusing the energy into a spike. The τ–p domain therefore separates waves with different apparent velocities — the basis of multiple suppression and velocity filtering.',
  ),
  symbols: [
    { sym: 'S(p,\\tau)', name: t('τ–p 域的平面波分解结果', 'τ–p plane-wave decomposition'), unit: '振幅·km' },
    { sym: 'p', name: t('射线参数（斜率）', 'ray parameter (slope)'), unit: 's/km' },
    { sym: '\\tau', name: t('截距时间 T − pX', 'intercept time T − pX'), unit: 's' },
    { sym: 'x_{j}', name: t('第 j 道的偏移距', 'offset of trace j'), unit: 'km' },
    { sym: '\\Delta x', name: t('道间距', 'trace spacing'), unit: 'km' },
  ],
  conditions: {
    applies: [t('共炮点或共中心点道集的平面波分解', 'Plane-wave decomposition of common-shot or CMP gathers')],
    assumes: [
      t('同相轴在道集内近似线性或双曲', 'Events are approximately linear or hyperbolic within the gather'),
      t('道间距足够密，避免空间假频', 'Trace spacing is dense enough to avoid spatial aliasing'),
    ],
    breaks: [
      t('道间距过大时陡倾角同相轴出现假频', 'Steep events alias when the trace spacing is too large'),
      t('简单求和不是精确反变换，需 ρ 滤波补偿', 'Plain summation is not an exact inverse; a ρ filter is needed'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设记录中有一条斜率为 p₁ 的直线同相轴', 'Assume a linear event of slope p₁'),
      latex: String.raw`u(x,t) = w(t - t_{0} - p_{1}x)` },
    { n: 2, op: 'substitute', title: t('代入倾斜叠加定义', 'Substitute into the slant-stack definition'),
      latex: String.raw`S(p,\tau) = \sum_j w\!\left(\tau + p x_j - t_0 - p_1 x_j\right)\Delta x = \sum_j w\!\left(\tau - t_0 + (p-p_1)x_j\right)\Delta x` },
    { n: 3, op: 'algebra', title: t('p = p₁ 时全部同相', 'At p = p₁ everything adds in phase'),
      latex: String.raw`S(p_1,\tau) = N\,\Delta x\; w(\tau - t_0)` },
    { n: 4, op: 'taylor', title: t('偏离 p₁ 时因相位差而抵消', 'Away from p₁ the phase differences cancel'),
      latex: String.raw`|p-p_1|\,X_{\max} \gg \text{子波长度} \Longrightarrow S \to 0` },
    { n: 5, op: 'result', title: t('主瓣宽度给出分辨率', 'Main-lobe width gives the resolution'),
      latex: String.raw`\Delta p \approx \frac{1}{\omega\,X_{\max}}` },
  ],
  viz: [
    {
      id: 'slant-stack-spectrum',
      level: 'V2',
      title: t('两条不同斜率同相轴在 τ–p 域的聚焦', 'Focusing of two slopes in the τ–p domain'),
      xlabel: t('射线参数 p (s/km)', 'ray parameter p (s/km)'),
      ylabel: t('叠加能量 S(p, τ₀)', 'stack energy S(p, τ₀)'),
      controls: [
        { id: 'p1', label: t('同相轴 1 斜率 p₁', 'event 1 slope p₁'), min: 0.05, max: 0.5, step: 0.005, value: 0.15 },
        { id: 'p2', label: t('同相轴 2 斜率 p₂', 'event 2 slope p₂'), min: 0.05, max: 0.5, step: 0.005, value: 0.35 },
        { id: 'X', label: t('排列半孔径 (km)', 'array half-aperture (km)'), min: 0.5, max: 6, step: 0.1, value: 2.5 },
      ],
      note: t('孔径越大主瓣越窄、分辨两个斜率的能力越强；这也是长排列去多次波效果好的原因。', 'Wider aperture gives a narrower main lobe and better slope resolution — this is why long-offset arrays suppress multiples well.'),
      compute: (p) => {
        const p1 = p['p1'], p2 = p['p2'], X = p['X']
        const N = 60
        const sig = 0.02
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const pp = (i / 400) * 0.6
          let s = 0
          for (let j = 0; j < N; j++) {
            const x = -X + (j / (N - 1)) * 2 * X
            const d1 = (pp - p1) * x
            const d2 = (pp - p2) * x
            s += Math.exp(-(d1 * d1) / (2 * sig * sig)) + Math.exp(-(d2 * d2) / (2 * sig * sig))
          }
          pts.push([pp, s / N])
        }
        return [{ label: t('S(p, τ₀)', 'S(p, τ₀)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('2.5 km 孔径能分辨的斜率差', 'Slope resolution at 2.5 km aperture'),
    input: t('f = 30 Hz，X_max = 2.5 km', 'f = 30 Hz, X_max = 2.5 km'),
    steps: [
      t('Δp ≈ 1/(ω X_max) = 1/(2π×30×2.5) = 2.12×10⁻³ s/km', 'Δp ≈ 1/(ω X_max) = 1/(2π×30×2.5) = 2.12×10⁻³ s/km'),
      t('对应视速度差 Δv_app = v²Δp ≈ 1 s/km × 2.12×10⁻³ → 极小的差异也能分辨', 'The corresponding apparent-velocity difference Δv_app = v²Δp is tiny'),
    ],
    output: t('孔径越大，τ–p 域的斜率分辨率越高', 'Larger aperture gives finer slope resolution in the τ–p domain'),
  },
  links: {
    upstream: [{ id: 'taup-transform', note: t('连续形式的理论基础', 'Theoretical basis in continuous form') }],
    downstream: [{ id: 'radon-transform-linear', note: t('离散实现即线性 Radon 变换', 'Its discrete implementation is the linear Radon transform') }],
    seealso: [{ id: 'velocity-analysis', note: t('速度分析中的同类叠加思想', 'The same stacking idea in velocity analysis') }],
  },
  refs: [{ text: 'Chapman, C. H. (1981). Generalized Radon transforms and slant stacks. Geophys. J. R. astr. Soc., 66, 445–453' }],
}

export default slantStackDiscrete
