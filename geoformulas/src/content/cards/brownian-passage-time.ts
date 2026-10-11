import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** brownian-passage-time */
const brownianPassageTime: FormulaCard = {
  id: 'brownian-passage-time',
  name: t('布朗过程时间（BPT）复发模型', 'The Brownian Passage Time Recurrence Model'),
  aliases: { zh: ['BPT 模型', '复发间隔', '地震周期模型'], en: ['BPT model', 'recurrence interval', 'earthquake cycle model'] },
  node: 'S12.3',
  tags: {
    math: ['MATH.STAT'],
    method: ['METH.STAT', 'METH.HAZARD'],
    quantity: ['Q.TIME', 'Q.HAZARD'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`f(t\mid \mu,\alpha) = \sqrt{\frac{\mu}{2\pi\alpha^{2}t^{3}}}\,\exp\!\left(-\frac{(t-\mu)^{2}}{2\mu\alpha^{2}t}\right),
\qquad \alpha = \frac{\sigma}{\mu}`,
    variants: [
      { name: t('累积分布', 'Cumulative distribution'), latex: String.raw`F(t) = \Phi\!\left(\frac{t-\mu}{\alpha\sqrt{\mu t}}\right) + e^{2/(\alpha^{2}\mu)}\Phi\!\left(-\frac{t+\mu}{\alpha\sqrt{\mu t}}\right)` },
      { name: t('条件概率（已等待 T 年）', 'Conditional probability (having waited T years)'), latex: String.raw`P(T < t < T+\Delta t \mid t > T) = \frac{F(T+\Delta t)-F(T)}{1-F(T)}` },
      { name: t('危险率函数', 'Hazard rate function'), latex: String.raw`h(t) = \frac{f(t)}{1-F(t)}` },
      { name: t('与对数正态和 Weibull 的比较', 'Comparison with lognormal and Weibull'), latex: String.raw`\text{BPT：}t\to 0\ \text{时}\ f \to 0;\qquad \text{对数正态：右尾更重}` },
    ],
  },
  meaning: t(
    '地震复发间隔不是随机的指数分布（那对应无记忆的泊松过程），也不是完全确定的周期（那意味着完美可预报）。BPT 模型取中间立场：把断层上的应力积累看成一个带随机扰动的加载过程，当它首次达到临界阈值时发震。得到的分布右偏、有明确均值、且在 t → 0 时概率迅速趋于零（刚震完不可能立刻再震）—— 这三条性质都与古地震观测相符，因此 BPT 成为长期概率预报（如加州 UCERF）的标准复发模型。',
    'Earthquake recurrence intervals are neither exponential (which corresponds to the memoryless Poisson process) nor perfectly periodic (which would mean perfect predictability). The BPT model takes a middle position: it views stress accumulation on a fault as a loading process with random perturbation, and the event occurs when the process first reaches a critical threshold. The resulting distribution is right-skewed, has a well-defined mean, and its density tends rapidly to zero as t → 0 (an earthquake cannot immediately repeat) — all three properties match palaeoseismic observations, which is why BPT became the standard recurrence model for long-term forecasts such as California\'s UCERF.',
  ),
  symbols: [
    { sym: '\\mu', name: t('平均复发间隔', 'mean recurrence interval'), unit: 'year' },
    { sym: '\\alpha', name: t('变异系数（非周期性）', 'coefficient of variation (aperiodicity)'), unit: '无量纲' },
    { sym: '\\sigma', name: t('复发间隔的标准差', 'standard deviation of the recurrence interval'), unit: 'year' },
    { sym: '\\Phi', name: t('标准正态累积分布函数', 'standard normal cumulative distribution function'), unit: '无量纲' },
    { sym: 'h(t)', name: t('危险率', 'hazard rate'), unit: '1/year' },
  ],
  conditions: {
    applies: [t('长期概率危险性分析（PSHA 的时间相关分支）、古地震数据拟合', 'Time-dependent PSHA, fitting palaeoseismic data')],
    assumes: [t('单一断层的特征地震复发', 'Characteristic earthquake recurrence on a single fault')],
    breaks: [t('断层系统相互作用、级联破裂时不适用', 'Does not apply when fault systems interact or ruptures cascade'), t('α 很大（> 0.8）时 BPT 退化为近似无记忆', 'For large α (> 0.8) BPT degenerates to nearly memoryless')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('应力积累写成带噪声的加载过程', 'Write stress accumulation as a loading process with noise'), latex: String.raw`S(t) = \lambda t + \varepsilon(t),\quad \varepsilon = \text{布朗运动（方差}\ \alpha^{2}\lambda t)` },
    { n: 2, op: 'physics', title: t('当 S 首次达到阈值时发震（首次穿越问题）', 'The event occurs when S first reaches the threshold (a first-passage problem)'), latex: String.raw`T = \inf\{t: S(t) \ge S_c\}` },
    { n: 3, op: 'identity', title: t('带漂移布朗运动的首次穿越时间服从逆高斯分布', 'The first-passage time of Brownian motion with drift is inverse-Gaussian'), latex: String.raw`T \sim \text{Inv-Gauss}(\mu, \mu\alpha^{2})` },
    { n: 4, op: 'substitute', title: t('写出逆高斯密度', 'Write out the inverse-Gaussian density'), latex: String.raw`f(t) = \sqrt{\frac{\mu}{2\pi\alpha^{2}t^{3}}}\exp\!\left(-\frac{(t-\mu)^{2}}{2\mu\alpha^{2}t}\right)` },
    { n: 5, op: 'result', title: t('代入条件概率公式即得时间相关危险性', 'Substituting into the conditional-probability formula gives time-dependent hazard'), latex: String.raw`P = \frac{F(T+\Delta t)-F(T)}{1-F(T)}` },
  ],
  viz: [
    {
      id: 'bpt-pdf',
      level: 'V2',
      title: t('BPT 复发间隔的密度与危险率', 'BPT recurrence-interval density and hazard rate'),
      xlabel: t('距上次地震时间 t (年)', 'time since last earthquake t (years)'),
      ylabel: t('概率密度 / 危险率', 'probability density / hazard rate'),
      controls: [
        { id: 'mu', label: t('平均复发间隔 μ (年)', 'mean recurrence interval μ (years)'), min: 20, max: 2000, step: 10, value: 200 },
        { id: 'a', label: t('非周期性 α', 'aperiodicity α'), min: 0.1, max: 0.9, step: 0.01, value: 0.4 },
        { id: 'what', label: t('0 = 密度, 1 = 危险率', '0 = density, 1 = hazard rate'), min: 0, max: 1, step: 1, value: 1 },
      ],
      note: t('危险率曲线是 BPT 最有说服力的形状：地震刚发生后危险率极低（「安全期」），随时间上升并在 μ 附近饱和。对比之下，泊松模型的危险率是水平直线 —— 完全没有「距上次地震越久越危险」的概念。α 越大，曲线上升越平缓，越接近泊松。', 'The hazard-rate curve is BPT\'s most persuasive shape: right after an event the rate is very low (a "safe period"), then it rises and saturates near μ. By contrast, the Poisson hazard rate is flat — with no notion of "the longer since the last event, the more dangerous". Larger α makes the rise gentler and closer to Poisson.'),
      compute: (p) => {
        const mu = p['mu'], a = p['a'], what = Math.round(p['what'])
        const pdf = (t: number) => Math.sqrt(mu / (2 * Math.PI * a * a * t * t * t)) * Math.exp(-((t - mu) * (t - mu)) / (2 * mu * a * a * t))
        const erf = (x: number) => {
          const s = x < 0 ? -1 : 1
          const xa = Math.abs(x)
          const t = 1 / (1 + 0.3275911 * xa)
          const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-xa * xa)
          return s * y
        }
        const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
        const cdf = (t: number) => {
          const u = (t - mu) / (a * Math.sqrt(mu * t))
          const v = -(t + mu) / (a * Math.sqrt(mu * t))
          const e = Math.exp(Math.min(2 / (a * a * mu), 50))
          return Phi(u) + e * Phi(v)
        }
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const t = 0.5 + (i / 400) * 3 * mu
          if (what === 0) {
            pts.push([t, pdf(t)])
          } else {
            const s = 1 - cdf(t)
            pts.push([t, s > 1e-9 ? pdf(t) / s : 0])
          }
        }
        const mx = Math.max(...pts.map((q) => q[1]))
        return [{ label: what === 0 ? t('概率密度', 'probability density') : t('危险率', 'hazard rate'), color: what === 0 ? '#185FA5' : '#993C1D', points: pts.map(([x, y]) => [x, y / mx] as [number, number]) }]
      },
    },
  ],
  example: {
    title: t('条件概率估计', 'Conditional probability estimation'),
    input: t('μ = 200 年，α = 0.4，上次地震距今 180 年，问未来 30 年的发震概率', 'μ = 200 years, α = 0.4, last event 180 years ago; probability in the next 30 years'),
    steps: [
      t('F(180) ≈ 0.35，F(210) ≈ 0.53', 'F(180) ≈ 0.35, F(210) ≈ 0.53'),
      t('P = (0.53 − 0.35)/(1 − 0.35) = 0.28', 'P = (0.53 − 0.35)/(1 − 0.35) = 0.28'),
    ],
    output: t('未来 30 年的条件概率约 28%，显著高于泊松模型的 14%', 'Conditional probability about 28% over the next 30 years, well above the 14% of a Poisson model'),
  },
  links: {
    upstream: [
      { id: 'poisson-earthquake-occurrence', note: t('泊松模型是无记忆的对比基准', 'The Poisson model is the memoryless baseline') },
      { id: 'gaussian-distribution', note: t('布朗运动的增量是高斯', 'Brownian increments are Gaussian') },
    ],
    downstream: [{ id: 'psha-integral', note: t('时间相关模型改变 PSHA 的时间窗权重', 'Time-dependent models change the PSHA time-window weighting') }],
    seealso: [{ id: 'coulomb-stress-change', note: t('库仑应力改变是 BPT 的物理动因之一', 'Coulomb stress changes are one physical driver behind BPT') }],
  },
  refs: [{ text: 'Matthews et al. (2002), A Brownian model for recurrent earthquakes, BSSA 92, 2233–2250' }],
}

export default brownianPassageTime
