import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** bath-law */
const bathLaw: FormulaCard = {
  id: 'bath-law',
  name: t('Bath 定律', "Bath's Law"),
  aliases: { zh: ['Bath 定律', '最大余震震级差', 'ΔM'], en: ["Bath's law", 'largest aftershock magnitude difference', 'ΔM'] },
  node: 'S12.2',
  tags: {
    math: ['MATH.STAT'],
    method: ['METH.STAT'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta M = M_m - M_a^{\max} \approx 1.2`,
    variants: [
      { name: t('矩释放形式的等价表述', 'Equivalent statement in terms of moment release'), latex: String.raw`\frac{M_0^{\text{最大余震}}}{M_0^{\text{主震}}} \approx 10^{-1.5\Delta M} \approx 0.016` },
      { name: t('考虑完备性修正的推广形式', 'Generalised form accounting for completeness'), latex: String.raw`\Delta M = M_m - M_a^{\max} \gtrsim 1.2\ \text{当}\ M_c \text{ 接近}\ M_a^{\max}` },
      { name: t('与 b 值和余震生产率的关联', 'Link to the b value and aftershock productivity'), latex: String.raw`\Delta M \approx \frac{1}{b}\log_{10}\frac{N_{\text{总}}}{1}\ \ (\text{由 GR 律推出})` },
    ],
  },
  meaning: t(
    'Bath 定律是一个出人意料地稳健的经验规律：无论主震多大，它最大的那个余震平均比它小约 1.2 级。这个数字不随主震震级、构造环境或深度系统性变化。它的理论解释至今仍有争议 —— 一种观点认为它只是 GR 律与余震总数统计的必然结果，另一种认为它反映了主震破裂区周围应力降的空间分布。无论哪种解释，它都是余震危险性快速估计的实用工具。',
    'Bath\'s law is a surprisingly robust empirical regularity: regardless of mainshock size, the largest aftershock is on average about 1.2 magnitude units smaller. This number does not vary systematically with mainshock magnitude, tectonic setting or depth. Its theoretical explanation is still debated — one view holds that it is merely a statistical consequence of the GR law and the total aftershock number, another that it reflects the spatial distribution of stress drop around the mainshock rupture. Either way it is a practical tool for rapid aftershock-hazard estimation.',
  ),
  symbols: [
    { sym: '\\Delta M', name: t('主震与最大余震的震级差', 'magnitude difference between mainshock and largest aftershock'), unit: '无量纲' },
    { sym: 'M_m', name: t('主震震级', 'mainshock magnitude'), unit: '无量纲' },
    { sym: 'M_a^{\\max}', name: t('最大余震震级', 'largest aftershock magnitude'), unit: '无量纲' },
    { sym: 'M_c', name: t('目录完备震级', 'catalogue completeness magnitude'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('余震危险性快速估计、序列分类（主震—余震 vs 震群）', 'Rapid aftershock-hazard estimation, sequence classification (mainshock–aftershock versus swarm)')],
    assumes: [t('序列为主震—余震型（有明确主震）', 'The sequence is of mainshock–aftershock type (a clear mainshock exists)')],
    breaks: [t('震群（无突出主震）不适用', 'Does not apply to swarms with no dominant event'), t('最大余震接近完备震级时 ΔM 被系统性高估', 'ΔM is systematically overestimated when the largest aftershock approaches the completeness magnitude')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设余震震级服从 GR 律', 'Assume aftershock magnitudes follow the GR law'), latex: String.raw`\log_{10}N(\ge M) = a - bM` },
    { n: 2, op: 'identity', title: t('「最大余震 ≥ M」的期望次数为 1', 'The expected number with magnitude ≥ M is 1 for the largest'), latex: String.raw`N(\ge M_a^{\max}) = 1 \Longrightarrow a - bM_a^{\max} = 0` },
    { n: 3, op: 'substitute', title: t('余震总数 N_总 由 a 与完备震级决定', 'The total aftershock number is set by a and the completeness magnitude'), latex: String.raw`a = \log_{10}N_{\text{总}} + bM_c` },
    { n: 4, op: 'algebra', title: t('解出 M_a^max', 'Solve for M_a^max'), latex: String.raw`M_a^{\max} = \frac{a}{b} = M_c + \frac{\log_{10}N_{\text{总}}}{b}` },
    { n: 5, op: 'result', title: t('由主震震级与余震生产率的关系得到 ΔM ≈ 1.2', 'The relation between mainshock magnitude and productivity gives ΔM ≈ 1.2'), latex: String.raw`\Delta M = M_m - M_a^{\max} \approx 1.2` },
  ],
  viz: [
    {
      id: 'bath-scatter',
      level: 'V1',
      title: t('ΔM 的观测分布', 'Observed distribution of ΔM'),
      xlabel: t('ΔM', 'ΔM'),
      ylabel: t('相对频度', 'relative frequency'),
      controls: [
        { id: 'mu', label: t('均值 μ', 'mean μ'), min: 0.6, max: 2, step: 0.02, value: 1.2 },
        { id: 'sig', label: t('标准差 σ', 'standard deviation σ'), min: 0.1, max: 0.8, step: 0.02, value: 0.35 },
      ],
      note: t('ΔM 并不是一个常数，而是一个分布：均值约 1.2，标准差约 0.3–0.4。这意味着约 5% 的序列其最大余震只比主震小 0.5 级以下 —— 那些序列在应急阶段最危险。', 'ΔM is not a constant but a distribution: mean about 1.2, standard deviation about 0.3–0.4. That means roughly 5% of sequences have a largest aftershock less than 0.5 units below the mainshock — those are the most dangerous in the emergency phase.'),
      compute: (p) => {
        const mu = p['mu'], sg = p['sig']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const x = -0.5 + (i / 200) * 4
          pts.push([x, Math.exp(-0.5 * ((x - mu) / sg) ** 2)])
        }
        const mx = Math.max(...pts.map((q) => q[1]))
        return [{ label: t('ΔM 分布', 'ΔM distribution'), color: '#185FA5', points: pts.map(([x, y]) => [x, y / mx] as [number, number]) }]
      },
    },
  ],
  example: {
    title: t('应急阶段的最大余震估计', 'Estimating the largest aftershock in the emergency phase'),
    input: t('主震 Mw 7.8，b = 1.0', 'Mainshock Mw 7.8, b = 1.0'),
    steps: [
      t('Bath 定律给出 M_a^max ≈ 7.8 − 1.2 = 6.6', "Bath's law gives M_a^max ≈ 7.8 − 1.2 = 6.6"),
      t('矩量比 10^(−1.5×1.2) = 0.016', 'Moment ratio 10^(−1.5×1.2) = 0.016'),
    ],
    output: t('预期最大余震约 M 6.6，释放的矩仅为主震的 1.6%', 'Expected largest aftershock about M 6.6, releasing only 1.6% of the mainshock moment'),
  },
  links: {
    upstream: [{ id: 'gutenberg-richter-law', note: t('GR 律是 Bath 定律的统计基础', 'The GR law is the statistical basis of Bath\'s law') }],
    downstream: [{ id: 'etas-model', note: t('ETAS 用触发项取代经验定律', 'ETAS replaces the empirical law with a triggering term') }],
    seealso: [{ id: 'aki-b-value', note: t('b 值影响 ΔM 的具体数值', 'The b value affects the numerical value of ΔM') }],
  },
  refs: [{ text: 'Richter (1958), Elementary Seismology, p. 69 (attributed to M. Bath)' }],
}

export default bathLaw
