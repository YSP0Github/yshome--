import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** semblance-velocity-spectrum */
const semblanceVelocitySpectrum: FormulaCard = {
  id: 'semblance-velocity-spectrum',
  name: t('相似性速度谱', 'Semblance Velocity Spectrum'),
  aliases: { zh: ['速度谱', '相似性', '叠加速度分析'], en: ['semblance', 'velocity spectrum', 'stacking velocity analysis'] },
  node: 'S3.4',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.EXPL', 'METH.PROC'],
    quantity: ['Q.VEL', 'Q.TIME'],
  },
  audience: 'bachelor',
  complete: 'L4',
  statement: {
    main: String.raw`S(v) = \frac{\sum_{t}\left[\sum_{j=1}^{N} f_{j}\!\left(t+\Delta t_{j}(v)\right)\right]^{2}}{N\sum_{t}\sum_{j=1}^{N} f_{j}^{2}\!\left(t+\Delta t_{j}(v)\right)}`,
    variants: [
      { name: t('动校正量', 'The NMO correction'), latex: String.raw`\Delta t_j(v) = t_j - t_0 = \sqrt{t_0^{2}+\frac{x_j^{2}}{v^{2}}} - t_0` },
      { name: t('取值范围', 'Range of values'), latex: String.raw`0 \le S \le 1,\qquad S = 1 \Longleftrightarrow \text{所有道完全一致}` },
      { name: t('非归一化版本', 'Unnormalised version'), latex: String.raw`E(v) = \sum_t\left[\sum_j f_j(t+\Delta t_j)\right]^{2}` },
    ],
  },
  meaning: t(
    '速度分析就是在每个 t₀ 上试着用各种速度做动校正，看哪一种速度能把道集里的同相轴拉得最平。相似性是一个归一化到 [0,1] 的「拉平程度」度量：它比单纯叠加能量更公平，因为不受振幅强弱影响，弱反射也能在速度谱上显形。',
    'Velocity analysis tries NMO with many velocities at each t₀ and asks which one flattens the gather best. Semblance is a measure of flatness normalised to [0,1]; it is fairer than raw stack energy because it is insensitive to amplitude, so weak reflections also show up in the velocity spectrum.',
  ),
  symbols: [
    { sym: 'S(v)', name: t('相似性', 'semblance'), unit: '无量纲', typical: '0 – 1' },
    { sym: 'f_{j}', name: t('第 j 道', 'trace j'), unit: '振幅' },
    { sym: '\\Delta t_{j}(v)', name: t('第 j 道的动校正量', 'NMO correction for trace j'), unit: 's' },
    { sym: 'x_{j}', name: t('第 j 道的偏移距', 'offset of trace j'), unit: 'km' },
    { sym: 'N', name: t('道集内的道数', 'number of traces in the gather'), unit: '道' },
  ],
  conditions: {
    applies: [t('由 CMP 道集估计叠加速度', 'Estimating stacking velocity from CMP gathers')],
    assumes: [
      t('同相轴双曲、道集内振幅一致', 'Events are hyperbolic and amplitudes are consistent'),
      t('已做去噪与静校正', 'Noise attenuation and statics have been applied'),
    ],
    breaks: [
      t('道集内有倾角冲突时需先做 DMO', 'Conflicting dips require DMO first'),
      t('多次波会在速度谱上形成低速假峰', 'Multiples create spurious low-velocity peaks'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('沿试算速度 v 的时距曲线取一个时窗', 'Take a time window along the trial moveout'),
      latex: String.raw`f_j(t+\Delta t_j(v)),\qquad t\in[t_0-W,\ t_0+W]` },
    { n: 2, op: 'algebra', title: t('先求和再平方：同相叠加的度量', 'Sum then square: a measure of coherent stacking'),
      latex: String.raw`\text{分子} = \sum_t\left[\sum_j f_j\right]^{2}` },
    { n: 3, op: 'algebra', title: t('用总能量归一化', 'Normalise by the total energy'),
      latex: String.raw`\text{分母} = N\sum_t\sum_j f_j^{2}` },
    { n: 4, op: 'identity', title: t('由 Cauchy–Schwarz 不等式保证上界为 1', 'Cauchy–Schwarz guarantees the upper bound of 1'),
      latex: String.raw`\left(\sum_j f_j\right)^{2} \le N\sum_j f_j^{2}\ \Longrightarrow\ S \le 1` },
    { n: 5, op: 'result', title: t('取最大相似性对应的速度为叠加速度', 'The velocity maximising semblance is the stacking velocity'),
      latex: String.raw`v_{stack}(t_0) = \arg\max_v S(v)` },
  ],
  viz: [
    {
      id: 'semblance-peak',
      level: 'V3',
      title: t('合成道集上的速度谱', 'Velocity spectrum for a synthetic gather'),
      xlabel: t('试算速度 v (km/s)', 'trial velocity v (km/s)'),
      ylabel: t('相似性 S', 'semblance S'),
      controls: [
        { id: 'vt', label: t('真实速度 (km/s)', 'true velocity (km/s)'), min: 1.5, max: 5, step: 0.02, value: 2.5 },
        { id: 'xmax', label: t('最大偏移距 (km)', 'maximum offset (km)'), min: 0.5, max: 4, step: 0.05, value: 2.0 },
        { id: 'noise', label: t('噪声水平', 'noise level'), min: 0, max: 1, step: 0.01, value: 0.15 },
      ],
      note: t('把最大偏移距调小，峰会变宽 —— 这就是为什么长排列对速度精度至关重要。', 'Shrink the maximum offset and the peak broadens — this is why long offsets are crucial for velocity accuracy.'),
      compute: (p) => {
        const vt = p['vt'], xmax = p['xmax'], noise = p['noise']
        const N = 24
        const t0 = 1.0
        const dt = 0.004
        const W = 0.06
        const nSamp = Math.round((2 * W) / dt)
        const sig = 0.012
        const pts: Array<[number, number]> = []
        for (let k = 0; k <= 120; k++) {
          const v = 1.6 + (k / 120) * 2.8
          let num = 0
          let den = 0
          for (let s = 0; s < nSamp; s++) {
            const tt = -W + s * dt
            let sum = 0
            let sq = 0
            for (let j = 0; j < N; j++) {
              const x = (j / (N - 1)) * xmax
              const dtn = Math.sqrt(t0 * t0 + (x * x) / (v * v)) - t0
              const dtt = Math.sqrt(t0 * t0 + (x * x) / (vt * vt)) - t0
              const arg = (tt + dtn - dtt) / sig
              let a = Math.exp(-arg * arg)
              let seed = Math.sin(12.9898 * (j + 1) + 78.233 * (s + 1) + 3.7 * v)
              a += noise * (seed - Math.floor(seed) - 0.5)
              sum += a
              sq += a * a
            }
            num += sum * sum
            den += sq
          }
          pts.push([v, den > 0 ? num / (N * den) : 0])
        }
        return [{ label: t('S(v)', 'S(v)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('2 km 排列上的速度精度', 'Velocity accuracy with a 2 km spread'),
    input: t('t₀ = 1.0 s，v_true = 2.5 km/s，x_max = 2 km', 't₀ = 1.0 s, v_true = 2.5 km/s, x_max = 2 km'),
    steps: [
      t('远道时差 Δt = √(1 + 4/6.25) − 1 = 0.281 s', 'Far-trace moveout Δt = √(1 + 4/6.25) − 1 = 0.281 s'),
      t('时差对速度求导，误差 1% 的速度造成约 3 ms 的剩余时差', 'Differentiating: a 1% velocity error causes about 3 ms of residual moveout'),
    ],
    output: t('2 km 排列通常能把速度定到 1–2% 以内', 'A 2 km spread typically constrains velocity to within 1–2%'),
  },
  links: {
    upstream: [
      { id: 'nmo-correction', note: t('动校正量公式', 'The NMO correction formula') },
      { id: 'cmp-gather-fold', note: t('道集的构成', 'How a gather is formed') },
    ],
    seealso: [{ id: 'dix-formula', note: t('由叠加速度求层速度', 'From stacking velocity to interval velocity') }],
  },
  refs: [{ text: 'Taner, M. & Koehler, F. (1969). Velocity spectra — digital computer derivation. Geophysics, 34, 859–881' }],
}

export default semblanceVelocitySpectrum
