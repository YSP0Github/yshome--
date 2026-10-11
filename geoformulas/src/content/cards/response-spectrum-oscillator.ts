import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** response-spectrum-oscillator */
const responseSpectrumOscillator: FormulaCard = {
  id: 'response-spectrum-oscillator',
  name: t('单自由度振子与反应谱', 'The Single-degree-of-freedom Oscillator & Response Spectra'),
  aliases: { zh: ['反应谱', '加速度反应谱', 'SDOF 振子'], en: ['response spectrum', 'acceleration response spectrum', 'SDOF oscillator'] },
  node: 'S11.1',
  tags: {
    math: ['MATH.DIFF', 'MATH.FOURIER'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.FREQ'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\ddot{u} + 2\zeta\omega_n\dot{u} + \omega_n^{2}u = -\ddot{u}_g(t),\qquad
S_a(T,\zeta) = \max_t \left|\ddot{u}(t) + \ddot{u}_g(t)\right| = \omega_n^{2}\max_t|u(t)|`,
    variants: [
      { name: t('拟加速度与位移的关系', 'Relation between pseudo-acceleration and displacement'), latex: String.raw`S_a = \omega_n^{2}S_d = \left(\frac{2\pi}{T}\right)^{2}S_d,\qquad S_v = \omega_n S_d` },
      { name: t('相对速度反应谱', 'Relative velocity response spectrum'), latex: String.raw`S_v(T,\zeta) = \max_t|\dot{u}(t)|` },
      { name: t('Duhamel 积分解', 'Duhamel integral solution'), latex: String.raw`u(t) = -\frac{1}{\omega_d}\int_0^{t}\ddot{u}_g(\tau)\,e^{-\zeta\omega_n(t-\tau)}\sin\omega_d(t-\tau)\,\mathrm{d}\tau` },
      { name: t('阻尼修正系数', 'Damping correction factor'), latex: String.raw`\frac{S_a(\zeta)}{S_a(0.05)} \approx \left(\frac{0.05}{\zeta}\right)^{0.3}\ \ (\zeta > 0.02)` },
    ],
  },
  meaning: t(
    '地震动的破坏力不只取决于它有多强，还取决于它「对什么结构」强。反应谱回答这个问题：让一个给定自振周期、给定阻尼的结构去经历这条地震动，记录它的最大响应，再把所有周期的结果画成一条曲线。这是抗震设计规范的骨架 —— 规范里的设计谱，就是大量记录的反应谱经过统计平滑后的包络。',
    'The destructive power of ground motion depends not only on how strong it is but on what structure it is strong against. The response spectrum answers this: subject a structure of given natural period and damping to the motion, record its maximum response, and plot the result for all periods. This is the backbone of seismic design codes — the design spectrum in codes is the statistically smoothed envelope of response spectra from many records.',
  ),
  symbols: [
    { sym: '\\zeta', name: t('阻尼比（常取 0.05）', 'damping ratio (usually 0.05)'), unit: '无量纲' },
    { sym: '\\omega_n', name: t('无阻尼自振圆频率', 'undamped natural circular frequency'), unit: 'rad/s' },
    { sym: '\\omega_d', name: t('有阻尼自振圆频率', 'damped natural circular frequency'), unit: 'rad/s' },
    { sym: '\\ddot{u}_g', name: t('地面加速度时程', 'ground acceleration time history'), unit: 'm/s²' },
    { sym: 'S_a, S_v, S_d', name: t('加速度 / 速度 / 位移反应谱', 'acceleration / velocity / displacement response spectra'), unit: 'm/s², m/s, m' },
  ],
  conditions: {
    applies: [t('抗震设计谱、地震动记录表征、结构动力分析', 'Seismic design spectra, characterising strong-motion records, structural dynamic analysis')],
    assumes: [t('结构为线性单自由度体系', 'The structure is a linear single-degree-of-freedom system')],
    breaks: [t('结构进入非线性时需用非线性时程分析或等效线性化', 'Nonlinear behaviour requires nonlinear time-history analysis or equivalent linearisation'), t('长周期段（T > 5 s）反应谱受记录处理方式强烈影响', 'At long periods (T > 5 s) the spectrum is strongly affected by record processing')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('质量—弹簧—阻尼体系相对于地面运动', 'A mass–spring–dashpot system relative to the ground motion'), latex: String.raw`m(\ddot{u}+\ddot{u}_g) + c\dot{u} + ku = 0` },
    { n: 2, op: 'algebra', title: t('移项并除以 m', 'Rearrange and divide by m'), latex: String.raw`\ddot{u} + 2\zeta\omega_n\dot{u}+\omega_n^{2}u = -\ddot{u}_g` },
    { n: 3, op: 'identity', title: t('用 Duhamel 积分求解', 'Solve with the Duhamel integral'), latex: String.raw`u(t) = -\frac{1}{\omega_d}\int_0^t \ddot{u}_g(\tau)e^{-\zeta\omega_n(t-\tau)}\sin\omega_d(t-\tau)\,\mathrm{d}\tau` },
    { n: 4, op: 'physics', title: t('绝对加速度 = −(2ζω_n u̇ + ω_n² u)，小阻尼时 ≈ ω_n² u', 'Absolute acceleration = −(2ζω_n u̇ + ω_n² u), approximately ω_n² u for small damping'), latex: String.raw`\ddot{u}_{\text{abs}} = -\omega_n^{2}u - 2\zeta\omega_n\dot{u} \approx -\omega_n^{2}u` },
    { n: 5, op: 'result', title: t('取时间最大值即拟加速度谱', 'Taking the time maximum gives the pseudo-acceleration spectrum'), latex: String.raw`S_a(T,\zeta) = \omega_n^{2}\max_t|u(t)|` },
  ],
  viz: [
    {
      id: 'sa-spectrum',
      level: 'V3',
      title: t('一条合成地震动的三联反应谱', 'Tripartite response spectrum of a synthetic accelerogram'),
      xlabel: t('周期 T (s)', 'period T (s)'),
      ylabel: t('S_a (g)', 'S_a (g)'),
      controls: [
        { id: 'pga', label: t('峰值加速度 (g)', 'peak acceleration (g)'), min: 0.02, max: 1.2, step: 0.01, value: 0.3 },
        { id: 'zeta', label: t('阻尼比 ζ', 'damping ratio ζ'), min: 0.01, max: 0.3, step: 0.005, value: 0.05 },
        { id: 'dur', label: t('持时 (s)', 'duration (s)'), min: 5, max: 60, step: 1, value: 20 },
        { id: 'fc', label: t('拐角频率 (Hz)', 'corner frequency (Hz)'), min: 0.2, max: 8, step: 0.1, value: 1.5 },
      ],
      note: t('这是抗震设计中最常见的一张图：短周期段（刚性结构）S_a 逼近 PGA，中长周期段快速衰减。加大阻尼会把整条曲线压平 —— 这就是「加阻尼器能有效减震」的定量依据。', 'The most common figure in seismic design: at short periods (stiff structures) S_a approaches the PGA, then decays rapidly at longer periods. Increasing damping flattens the whole curve — the quantitative basis for "adding dampers effectively reduces the response".'),
      compute: (p) => {
        const pga = p['pga'], z = p['zeta'], dur = p['dur'], fc = p['fc']
        const N = 2048
        const dt = 0.02
        // 合成一段带包络的随机地震动（Kanai–Tajimi 型滤波白噪声）
        let seed = 31337
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return (seed / 0x7fffffff) * 2 - 1
        }
        const wg = 2 * Math.PI * fc
        const zg = 0.6
        let x1 = 0, x2 = 0
        const acc: number[] = []
        for (let i = 0; i < N; i++) {
          const w = rnd()
          const a = wg * wg * w
          x2 += dt * (a - 2 * zg * wg * x2 - wg * wg * x1)
          x1 += dt * x2
          const t = i * dt
          const env = Math.exp(-t / (dur * 0.6)) * (1 - Math.exp(-t / 0.5))
          acc.push(env * x2)
        }
        let mx = 0
        for (const a of acc) mx = Math.max(mx, Math.abs(a))
        for (let i = 0; i < N; i++) acc[i] = (acc[i] / Math.max(mx, 1e-12)) * pga * 9.81
        // 对每个周期积分 SDOF
        const pts: Array<[number, number]> = []
        for (let k = 0; k <= 80; k++) {
          const T = 0.05 + (k / 80) * 4.95
          const wn = (2 * Math.PI) / T
          let u = 0, v = 0, umax = 0
          for (let i = 0; i < N; i++) {
            const ag = acc[i]
            for (let s = 0; s < 4; s++) {
              const h = dt / 4
              const au = -ag - 2 * z * wn * v - wn * wn * u
              v += au * h
              u += v * h
            }
            umax = Math.max(umax, Math.abs(u))
          }
          pts.push([T, (wn * wn * umax) / 9.81])
        }
        return [{ label: t('S_a(T)', 'S_a(T)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('由位移谱换算加速度谱', 'Converting the displacement spectrum to acceleration'),
    input: t('T = 0.5 s，S_d = 20 mm，ζ = 0.05', 'T = 0.5 s, S_d = 20 mm, ζ = 0.05'),
    steps: [
      t('ω_n = 2π/0.5 = 12.57 rad/s', 'ω_n = 2π/0.5 = 12.57 rad/s'),
      t('S_a = ω_n² S_d = 158 × 0.020 = 3.16 m/s² = 0.32 g', 'S_a = ω_n² S_d = 158 × 0.020 = 3.16 m/s² = 0.32 g'),
    ],
    output: t('0.32 g 的谱加速度，属于中等强度设计地震动', 'A spectral acceleration of 0.32 g, a moderate design-level motion'),
  },
  links: {
    upstream: [
      { id: 'damping-ratio', note: t('阻尼比的定义', 'Definition of the damping ratio') },
      { id: 'forced-oscillator-green-function', note: t('受迫振子的 Green 函数解', 'Green-function solution of the forced oscillator') },
    ],
    downstream: [{ id: 'gmpe-functional-form', note: t('GMPE 预测的就是谱加速度', 'GMPEs predict spectral acceleration') }],
    seealso: [{ id: 'ground-motion-parameters', note: t('PGA/PGV 是反应谱的两个端点', 'PGA and PGV are two endpoints of the spectrum') }],
  },
  refs: [{ text: 'Chopra, Dynamics of Structures, 6th ed., Ch. 6' }],
}

export default responseSpectrumOscillator
