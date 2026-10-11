import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gutenberg-richter-law */
const gutenbergRichterLaw: FormulaCard = {
  id: 'gutenberg-richter-law',
  name: t('Gutenberg–Richter 定律', 'The Gutenberg–Richter Law'),
  aliases: { zh: ['GR 定律', '震级频度关系'], en: ['Gutenberg-Richter law', 'magnitude-frequency relation', 'b-value'] },
  node: 'S12.1',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.STAT'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\log_{10}N(M)=a-bM`,
    variants: [
      { name: t('累积形式', 'Cumulative form'), latex: String.raw`\log_{10}N(\ge M)=a-bM` },
      { name: t('增量（分档）形式', 'Incremental (binned) form'), latex: String.raw`\log_{10}N(M\pm\Delta M/2)=a'-bM` },
      { name: t('震级—能量版本', 'Magnitude–energy version'), latex: String.raw`\log_{10}N(\ge M)=-\frac{2}{3}b\,\log_{10}E+\text{const}\;\Longrightarrow\; N\propto E^{-2b/3}` },
    ],
  },
  meaning: t(
    '地震学里最稳固的经验定律：震级每减小 1 级，地震数目约增加 10^b 倍（b ≈ 1，即约 10 倍）。它意味着小震无穷多、大震极少，且这个幂律跨越十几个数量级都成立。b 值是唯一被广泛用作「应力状态指示器」的统计量：低 b 值对应高应力、高 b 值对应低应力或高温/高流体压力环境。',
    'The most robust empirical law in seismology: each unit drop in magnitude brings roughly 10^b more events (b ≈ 1, i.e. about ten times more). It says small earthquakes are innumerable and great ones rare, and this power law holds across more than ten orders of magnitude. The b value is the only statistic widely used as a stress-state indicator: low b means high stress, high b means low stress or high temperature/fluid pressure.',
  ),
  symbols: [
    { sym: 'N(M)', name: t('震级 ≥ M 的地震数', 'number of earthquakes with magnitude ≥ M'), unit: '个' },
    { sym: 'a', name: t('活动性水平（与观测时段、区域面积有关）', 'activity level (depends on observation period and area)'), unit: '无量纲' },
    { sym: 'b', name: t('b 值，通常 ≈ 1', 'b value, usually ≈ 1'), unit: '无量纲', typical: '0.6 – 1.4' },
    { sym: 'E', name: t('地震能量', 'earthquake energy'), unit: 'J' },
  ],
  conditions: {
    applies: [t('完备目录的震级—频度统计', 'Magnitude–frequency statistics of a complete catalogue')],
    assumes: [t('目录在 M ≥ M_c 上完备', 'The catalogue is complete for M ≥ M_c')],
    breaks: [t('小震端因检测能力不足而偏离直线（"掉头"），必须先用 Mc 截断', 'The small-magnitude end falls off because of incomplete detection; one must first truncate at Mc')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('假设震级分布为指数型', 'Assume an exponential magnitude distribution'),
      latex: String.raw`n(M)\,\mathrm{d}M\propto10^{-bM}\,\mathrm{d}M` },
    { n: 2, op: 'identity', title: t('累积数即积分', 'The cumulative count is the integral'),
      latex: String.raw`N(\ge M)=\int_M^{\infty}n(M')\,\mathrm{d}M'\propto10^{-bM}` },
    { n: 3, op: 'result', title: t('取对数', 'Take logarithms'),
      latex: String.raw`\log_{10}N(\ge M)=a-bM` },
    { n: 4, op: 'substitute', title: t('换成能量', 'Convert to energy'),
      latex: String.raw`\log_{10}E=1.5M+\text{const}\;\Longrightarrow\; N\propto E^{-2b/3}` },
  ],
  viz: [
    {
      id: 'gr-plot',
      level: 'V1',
      title: t('震级—频度分布与 b 值、完备震级', 'Magnitude–frequency distribution, b value and completeness'),
      xlabel: t('震级 M', 'magnitude M'),
      ylabel: t('log₁₀ N(≥M)', 'log₁₀ N(≥M)'),
      yScale: 'log',
      controls: [
        { id: 'b', label: t('b 值', 'b value'), min: 0.5, max: 1.5, step: 0.01, value: 1.0 },
        { id: 'a', label: t('a 值', 'a value'), min: 2, max: 7, step: 0.1, value: 5 },
        { id: 'mc', label: t('完备震级 M_c', 'completeness magnitude M_c'), min: 0.5, max: 4, step: 0.1, value: 2 },
      ],
      compute: (p) => {
        const b = p['b'], a = p['a'], mc = p['mc']
        const pts: Array<[number, number]> = []
        const roll: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const M = -1 + (i / 200) * 8
          // 用正态型检测函数模拟小震端"掉头"
          const det = 0.5 * (1 + erf((M - mc) / 0.4))
          pts.push([M, Math.pow(10, a - b * M)])
          roll.push([M, Math.pow(10, a - b * M) * det])
        }
        return [
          { label: t('理论 GR 直线', 'theoretical GR line'), color: '#B4B2A9', points: pts, dash: true },
          { label: t('实际观测（含检测掉头）', 'observed (with detection roll-off)'), color: '#185FA5', points: roll },
        ]
      },
      note: t('M_c 以下曲线明显下弯 —— 那不是物理规律，是台网看不见小震。拟合 b 值必须只用 M_c 以上的点。', 'Below M_c the curve bends down — that is not physics but the network failing to see small events. Fit b using only points above M_c.'),
    },
  ],
  example: {
    title: t('估算大震的复发率', 'Estimating the recurrence rate of a large event'),
    input: t('a = 5，b = 1，即每年 M ≥ 2 的地震约 10⁵ 次区域', 'a = 5, b = 1, i.e. a region with about 10⁵ events per year at M ≥ 2'),
    steps: [
      t('M ≥ 6：log N = 5 − 6 = −1 → 0.1 次/年', 'M ≥ 6: log N = 5 − 6 = −1 → 0.1 per year'),
      t('M ≥ 7：log N = −2 → 0.01 次/年', 'M ≥ 7: log N = −2 → 0.01 per year'),
    ],
    output: t('M ≥ 7 约每 100 年一次 —— 这正是危险性分析外推大震速率的方式', 'M ≥ 7 roughly once per 100 years — exactly how hazard analysis extrapolates large-event rates'),
  },
  links: {
    downstream: [
      { id: 'aki-b-value', note: t('b 值的极大似然估计', 'Maximum-likelihood estimation of b') },
      { id: 'psha-integral', note: t('GR 提供震级分布', 'GR supplies the magnitude distribution') },
    ],
  },
  refs: [{ text: 'Gutenberg & Richter (1944), Bull. Seismol. Soc. Am., 34' }],
}

// 误差函数（Abramowitz & Stegun 近似）
function erf(x: number): number {
  const s = Math.sign(x)
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x)
  return s * y
}

export default gutenbergRichterLaw
