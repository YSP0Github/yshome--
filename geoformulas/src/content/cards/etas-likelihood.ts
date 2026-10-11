import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** etas-likelihood */
const etasLikelihood: FormulaCard = {
  id: 'etas-likelihood',
  name: t('ETAS 模型的条件强度与似然', 'The ETAS Conditional Intensity & Likelihood'),
  aliases: { zh: ['ETAS', '条件强度', '传染型余震序列'], en: ['ETAS', 'conditional intensity', 'epidemic-type aftershock sequence'] },
  node: 'S12.5',
  tags: {
    math: ['MATH.STAT'],
    method: ['METH.STAT'],
    quantity: ['Q.TIME', 'Q.SOURCE'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\lambda(t, x, y, m \mid \mathcal{H}_t) = \left[\mu(x,y) + \sum_{i: t_i < t} \frac{K_0\,e^{a(M_i - M_c)}}{(t-t_i+c)^{p}}\,g(x-x_i, y-y_i; M_i)\right]\,\beta e^{-\beta(m-M_c)}`,
    variants: [
      { name: t('对数似然', 'Log-likelihood'), latex: String.raw`\ln L = \sum_{j} \ln\lambda(t_j, x_j, y_j, m_j) - \int\!\!\int\!\!\int \lambda\,\mathrm{d}t\,\mathrm{d}x\,\mathrm{d}y\,\mathrm{d}m` },
      { name: t('分支比（临界性判据）', 'Branching ratio (criticality criterion)'), latex: String.raw`n = \frac{K_0}{1-2^{1-p}}\cdot\frac{\beta}{\beta-a}\cdot\frac{c^{1-p}}{p-1}\ \ (p>1,\ \beta>a)` },
      { name: t('触发的空间核', 'Spatial triggering kernel'), latex: String.raw`g(r; M) \propto \left(1+\frac{r^{2}}{d^{2}e^{\gamma(M-M_c)}}\right)^{-q}` },
      { name: t('震级分布（GR）', 'Magnitude distribution (GR)'), latex: String.raw`\beta = b\ln 10` },
    ],
  },
  meaning: t(
    'ETAS 把每个地震都视为既是「被触发的余震」又是「能触发别人的主震」。它的条件强度由背景项 μ 加上历史上每个事件贡献的 Omori 型触发项组成。整个模型的可预报性全部集中在分支比 n 上：n < 1 时每个事件平均触发不到一个后代，序列指数衰减；n → 1 时接近临界，序列可以自我维持很久。观测上 n ≈ 0.7–0.9，说明地震活动是「接近临界但亚临界」的。',
    'ETAS treats every earthquake as both a triggered aftershock and a potential trigger of others. Its conditional intensity consists of a background term μ plus an Omori-type triggering contribution from every past event. All the predictability of the model concentrates in the branching ratio n: with n < 1 each event triggers fewer than one descendant on average and the sequence decays exponentially; as n → 1 the system is near critical and sequences can sustain themselves for a long time. Observations give n ≈ 0.7–0.9, meaning seismicity is "near-critical but subcritical".',
  ),
  symbols: [
    { sym: '\\lambda', name: t('条件强度（单位时间—空间—震级的期望事件数）', 'conditional intensity (expected events per unit time–space–magnitude)'), unit: '1/(day·km²·mag)' },
    { sym: '\\mu', name: t('背景（构造加载）发生率', 'background (tectonic loading) rate'), unit: '1/(day·km²)' },
    { sym: 'K_0, a', name: t('触发生产率与震级依赖', 'triggering productivity and magnitude dependence'), unit: '—' },
    { sym: 'n', name: t('分支比（每个事件的平均后代数量）', 'branching ratio (mean number of descendants per event)'), unit: '无量纲' },
    { sym: '\\beta', name: t('GR 指数（β = b ln 10）', 'GR exponent (β = b ln 10)'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('短期余震预报、可预报性研究、地震活动性异常检测', 'Short-term aftershock forecasting, predictability research, detecting seismicity anomalies')],
    assumes: [t('目录完备、震级独立同分布（GR）', 'The catalogue is complete; magnitudes are i.i.d. (GR)')],
    breaks: [t('Mc 在序列中变化时参数估计有偏', 'Parameter estimates are biased when Mc changes through the sequence'), t('极长时间尺度上需加入构造加载与断层系统结构', 'On very long time scales tectonic loading and fault-system structure must be added')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('点过程的条件强度定义为给定历史下的瞬时发生率', 'The conditional intensity of a point process is the instantaneous rate given the history'), latex: String.raw`\lambda(t\mid\mathcal{H}_t) = \lim_{\Delta t\to 0}\frac{P(\text{事件}\in[t,t+\Delta t)\mid\mathcal{H}_t)}{\Delta t}` },
    { n: 2, op: 'physics', title: t('ETAS 假定每个事件按 Omori 型触发后代', 'ETAS assumes each event triggers descendants according to an Omori-type law'), latex: String.raw`\lambda_i(t) = \frac{K_0 e^{a(M_i-M_c)}}{(t-t_i+c)^{p}}` },
    { n: 3, op: 'identity', title: t('加上背景项并对所有历史事件求和', 'Add the background term and sum over all past events'), latex: String.raw`\lambda(t) = \mu + \sum_{i:t_i<t}\lambda_i(t)` },
    { n: 4, op: 'identity', title: t('点过程的对数似然 = 求和 lnλ − 积分 λ', 'The log-likelihood of a point process is Σ lnλ − ∫λ'), latex: String.raw`\ln L = \sum_j\ln\lambda(t_j)-\int\lambda\,\mathrm{d}t` },
    { n: 5, op: 'result', title: t('分支比：每个事件触发的后代数的期望', 'Branching ratio: expected number of descendants per event'), latex: String.raw`n = K_0\int_0^{\infty}\frac{\mathrm{d}t}{(t+c)^{p}}\cdot\frac{\beta}{\beta-a} < 1\ \text{亚临界} `},
  ],
  viz: [
    {
      id: 'etas-rate',
      level: 'V3',
      title: t('ETAS 序列的模拟与级联结构', 'Simulating an ETAS sequence and its cascade structure'),
      xlabel: t('时间 (天)', 'time (days)'),
      ylabel: t('累积事件数', 'cumulative number of events'),
      controls: [
        { id: 'mu', label: t('背景率 μ (1/天)', 'background rate μ (1/day)'), min: 0.01, max: 1, step: 0.01, value: 0.15 },
        { id: 'K', label: t('触发强度 K₀', 'triggering strength K₀'), min: 0, max: 0.3, step: 0.005, value: 0.08 },
        { id: 'a', label: t('震级依赖 a', 'magnitude dependence a'), min: 0, max: 2.5, step: 0.05, value: 1.2 },
        { id: 'p', label: t('衰减指数 p', 'decay exponent p'), min: 0.8, max: 1.6, step: 0.01, value: 1.1 },
      ],
      note: t('每一次「台阶跳跃」都是一次强余震触发了自己的次级序列。K₀ 或 a 调大时跳跃变多、曲线接近爆炸增长 —— 这正是临界性（n → 1）的直观表现。真实的 ETAS 参数落在「有跳跃但总体仍衰减」的中间区域。', 'Every "step jump" is a strong aftershock triggering its own secondary sequence. Raising K₀ or a makes the jumps more frequent and the curve approach explosive growth — the visual signature of criticality (n → 1). Real ETAS parameters sit in the middle region: jumps present, but the overall trend still decays.'),
      compute: (p) => {
        const mu = p['mu'], K = p['K'], av = p['a'], pp = p['p']
        let seed = 6060
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return seed / 0x7fffffff
        }
        const beta = 2.3
        const events: Array<{ t: number; M: number; parent: number }> = []
        const T = 200
        // 背景事件
        let tCur = 0
        while (tCur < T) {
          tCur += -Math.log(Math.max(rnd(), 1e-12)) / mu
          if (tCur < T) events.push({ t: tCur, M: -Math.log(Math.max(rnd(), 1e-12)) / beta, parent: -1 })
        }
        // 逐代触发（限制总数为性能）
        const queue = events.slice()
        let guard = 0
        while (queue.length > 0 && events.length < 4000 && guard < 40000) {
          guard++
          const ev = queue.shift()!
          const rate = K * Math.exp(av * ev.M)
          let tt = ev.t
          let cnt = 0
          while (cnt < 12) {
            const rem = Math.max(rate / (pp - 1), 1e-9) * Math.pow(Math.max(0.05, 0.05), 1 - pp)
            void rem
            tt += 0.05 * Math.pow(Math.max(rnd(), 1e-9), -1 / (pp - 1)) / Math.max(rate, 1e-6)
            if (tt > T || !Number.isFinite(tt)) break
            cnt++
            const M = -Math.log(Math.max(rnd(), 1e-12)) / beta
            const e = { t: tt, M, parent: events.indexOf(ev) }
            events.push(e)
            queue.push(e)
          }
        }
        events.sort((x, y) => x.t - y.t)
        const pts: Array<[number, number]> = []
        for (let i = 0; i < events.length; i++) pts.push([events[i].t, i + 1])
        const pts2: Array<[number, number]> = events.slice(0, 800).map((e) => [e.t, e.M] as [number, number])
        return [
          { label: t('累积事件数', 'cumulative events'), color: '#185FA5', points: pts.slice(0, 1500) },
          { label: t('事件震级 ×10', 'event magnitudes ×10'), color: '#993C1D', points: pts2.map(([x, y]) => [x, y * 10] as [number, number]) },
        ]
      },
    },
    {
      id: 'etas-branch',
      level: 'V1',
      title: t('分支比 n 随参数的变化', 'Branching ratio versus parameters'),
      xlabel: t('触发强度 K₀', 'triggering strength K₀'),
      ylabel: t('分支比 n', 'branching ratio n'),
      controls: [
        { id: 'p', label: t('衰减指数 p', 'decay exponent p'), min: 1.05, max: 1.6, step: 0.01, value: 1.15 },
        { id: 'a', label: t('震级依赖 a', 'magnitude dependence a'), min: 0, max: 2.2, step: 0.05, value: 1.0 },
      ],
      note: t('n = 1 是临界线：n > 1 意味着每个事件触发多于一个后代，序列爆炸（物理上不可能长期维持）；n < 1 时序列最终衰减。实测的 n ≈ 0.7–0.9 说明地震活动接近但尚未达到临界 —— 这也是为什么余震序列可以持续数十年却终归会平息。', 'n = 1 is the critical line: n > 1 means each event triggers more than one descendant and the sequence explodes (physically unsustainable); n < 1 means the sequence eventually decays. Measured n ≈ 0.7–0.9 shows seismicity is close to but not at criticality — which is why aftershock sequences can last decades yet always die out eventually.'),
      compute: (p) => {
        const pp = p['p'], av = p['a']
        const beta = 2.3
        const c = 0.01
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const K = (i / 200) * 0.3
          const timeInt = Math.pow(c, 1 - pp) / (pp - 1)
          const magInt = beta / Math.max(beta - av, 1e-6)
          const n = K * timeInt * magInt
          pts.push([K, n])
        }
        return [{ label: t('分支比 n', 'branching ratio n'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('判断序列是否临界', 'Is the sequence critical'),
    input: t('K₀ = 0.08，p = 1.1，a = 1.0，β = 2.3，c = 0.01 天', 'K₀ = 0.08, p = 1.1, a = 1.0, β = 2.3, c = 0.01 d'),
    steps: [
      t('时间积分 c^(1−p)/(p−1) = 0.01^(−0.1)/0.1 = 15.85', 'Time integral c^(1−p)/(p−1) = 0.01^(−0.1)/0.1 = 15.85'),
      t('震级积分 β/(β−a) = 2.3/1.3 = 1.77', 'Magnitude integral β/(β−a) = 2.3/1.3 = 1.77'),
      t('n = 0.08 × 15.85 × 1.77 = 2.24 > 1', 'n = 0.08 × 15.85 × 1.77 = 2.24 > 1'),
    ],
    output: t('该参数组合为超临界，说明 K₀ 应当更小或 p 更大；实测序列总满足 n < 1', 'This combination is supercritical, so K₀ should be smaller or p larger; real sequences always satisfy n < 1'),
  },
  links: {
    upstream: [
      { id: 'etas-model', note: t('ETAS 模型的基本框架', 'The basic ETAS framework') },
      { id: 'modified-omori-law', note: t('Omori 衰减是触发项', 'Omori decay is the triggering term') },
    ],
    seealso: [
      { id: 'gutenberg-richter-law', note: t('震级分布项 β = b ln10', 'The magnitude term β = b ln 10') },
      { id: 'poisson-earthquake-occurrence', note: t('背景项 μ 是泊松过程', 'The background term μ is a Poisson process') },
    ],
  },
  refs: [{ text: 'Ogata (1988), Statistical models for earthquake occurrences and residual analysis for point processes, JASA 83, 9–27' }],
}

export default etasLikelihood
