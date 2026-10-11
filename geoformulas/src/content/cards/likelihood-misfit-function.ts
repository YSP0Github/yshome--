import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** likelihood-misfit-function */
const likelihoodMisfitFunction: FormulaCard = {
  id: 'likelihood-misfit-function',
  name: t('似然、失配函数与误差假设', 'Likelihood, Misfit Functions & Error Assumptions'),
  aliases: { zh: ['似然函数', '失配函数', '范数选择'], en: ['likelihood', 'misfit function', 'norm choice'] },
  node: 'S10.3',
  tags: {
    math: ['MATH.STAT', 'MATH.APPROX'],
    method: ['METH.INV'],
    quantity: ['Q.VEL', 'Q.AMP'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`p(\mathbf{d}\mid\mathbf{m}) = \frac{1}{Z}\exp\!\left(-\frac{1}{2}\Phi(\mathbf{m})\right),\qquad
\Phi_{L2} = \sum_i\frac{r_i^{2}}{\sigma_i^{2}},\quad \Phi_{L1} = \sum_i\frac{|r_i|}{\sigma_i}`,
    variants: [
      { name: t('高斯误差 ⇒ L2 失配', 'Gaussian errors imply an L2 misfit'), latex: String.raw`p(r) \propto e^{-r^{2}/2\sigma^{2}} \Longrightarrow \Phi = \sum r_i^{2}/\sigma_i^{2}` },
      { name: t('双指数（拉普拉斯）误差 ⇒ L1 失配', 'Double-exponential (Laplace) errors imply an L1 misfit'), latex: String.raw`p(r) \propto e^{-|r|/\sigma} \Longrightarrow \Phi = \sum |r_i|/\sigma_i` },
      { name: t('Huber 范数（折中）', 'The Huber norm (a compromise)'), latex: String.raw`\rho(r) = \begin{cases} r^{2}/2, & |r| \le k \\ k|r| - k^{2}/2, & |r| > k \end{cases}` },
      { name: t('后验 ∝ 似然 × 先验', 'Posterior ∝ likelihood × prior'), latex: String.raw`p(\mathbf{m}\mid\mathbf{d}) \propto e^{-\frac{1}{2}\Phi}\,p(\mathbf{m})` },
    ],
  },
  meaning: t(
    '「用什么范数来衡量拟合好坏」不是一个纯粹的技术选择，而是关于误差分布的显式假设。用 L2 等价于声称误差是高斯且没有离群点；用 L1 则承认存在重尾、离群点应当被容忍。地震数据几乎总有离群点（误拾的到时、被噪声污染的道、周期跳跃），所以选择失配函数就是在选择「我愿意被异常值影响多少」。把这一步说清楚，贝叶斯反演才有意义。',
    '"Which norm to use for measuring fit" is not a purely technical choice but an explicit assumption about the error distribution. Using L2 asserts that errors are Gaussian with no outliers; using L1 admits heavy tails and tolerates outliers. Seismic data almost always contain outliers (miss-picked arrivals, noise-corrupted traces, cycle skips), so choosing a misfit function means choosing "how much I am willing to be influenced by anomalies". Making this step explicit is what makes Bayesian inversion meaningful.',
  ),
  symbols: [
    { sym: '\\Phi', name: t('失配（目标）函数', 'misfit (objective) function'), unit: '无量纲' },
    { sym: 'r_i', name: t('第 i 个残差', 'i-th residual'), unit: '视问题而定' },
    { sym: '\\sigma_i', name: t('第 i 个数据的标准差', 'standard deviation of datum i'), unit: '视问题而定' },
    { sym: 'k', name: t('Huber 阈值', 'Huber threshold'), unit: '无量纲' },
    { sym: 'Z', name: t('归一化常数（证据）', 'normalising constant (evidence)'), unit: '—' },
  ],
  conditions: {
    applies: [t('任何概率反演、稳健反演、离群点处理', 'Any probabilistic inversion, robust inversion, outlier handling')],
    assumes: [t('残差之间独立（否则需引入协方差 C_d）', 'Residuals are independent (otherwise a covariance C_d is needed)')],
    breaks: [t('误差相关时简单求和不再对应正确的似然', 'With correlated errors the simple sum no longer corresponds to the correct likelihood'), t('误差分布被错误假设时后验与不确定性都不可信', 'If the error distribution is misspecified, both the posterior and the uncertainty are untrustworthy')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把观测写成正演加误差', 'Write the observation as forward model plus error'), latex: String.raw`d_i = g_i(\mathbf{m}) + e_i` },
    { n: 2, op: 'physics', title: t('假设误差密度为 p(e)', 'Assume an error density p(e)'), latex: String.raw`p(\mathbf{d}\mid\mathbf{m}) = \prod_i p(d_i - g_i(\mathbf{m}))` },
    { n: 3, op: 'identity', title: t('取负对数，把乘积变成求和', 'Take the negative logarithm to turn the product into a sum'), latex: String.raw`\Phi = -2\ln p(\mathbf{d}\mid\mathbf{m}) + \text{const}` },
    { n: 4, op: 'substitute', title: t('高斯密度给出 L2，拉普拉斯密度给出 L1', 'A Gaussian density gives L2, a Laplace density gives L1'), latex: String.raw`\Phi_{L2}=\sum\frac{r_i^{2}}{\sigma_i^{2}},\qquad \Phi_{L1}=\sum\frac{|r_i|}{\sigma_i}` },
    { n: 5, op: 'result', title: t('贝叶斯：后验正比于似然乘先验', 'Bayes: the posterior is proportional to likelihood times prior'), latex: String.raw`p(\mathbf{m}\mid\mathbf{d}) \propto e^{-\Phi/2}p(\mathbf{m})` },
  ],
  viz: [
    {
      id: 'norm-cmp',
      level: 'V2',
      title: t('L1、L2 与 Huber 的代价函数对比', 'Comparing L1, L2 and Huber cost functions'),
      xlabel: t('残差 r / σ', 'residual r / σ'),
      ylabel: t('代价 ρ(r)', 'cost ρ(r)'),
      controls: [{ id: 'k', label: t('Huber 阈值 k', 'Huber threshold k'), min: 0.3, max: 4, step: 0.05, value: 1.35 }],
      note: t('L2 在大残差处增长最快（∝ r²），所以最容易被离群点拉走；L1 增长最慢（∝ |r|），最稳健但解不唯一且不易求导；Huber 在小残差处是抛物线、大残差处是直线，兼顾光滑与稳健 —— 是实际反演中最常用的折中。', 'L2 grows fastest at large residuals (∝ r²), so it is most easily dragged by outliers; L1 grows slowest (∝ |r|), is most robust but gives non-unique solutions and is harder to differentiate; Huber is parabolic for small residuals and linear for large ones, combining smoothness with robustness — the most common compromise in practical inversion.'),
      compute: (p) => {
        const k = p['k']
        const l2: Array<[number, number]> = []
        const l1: Array<[number, number]> = []
        const hu: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const r = -5 + (i / 300) * 10
          const a = Math.abs(r)
          l2.push([r, (r * r) / 2])
          l1.push([r, a])
          hu.push([r, a <= k ? (r * r) / 2 : k * a - (k * k) / 2])
        }
        return [
          { label: t('L2 (高斯)', 'L2 (Gaussian)'), color: '#185FA5', points: l2 },
          { label: t('L1 (拉普拉斯)', 'L1 (Laplace)'), color: '#993C1D', points: l1 },
          { label: t('Huber (k = ' + k.toFixed(2) + ')', 'Huber (k = ' + k.toFixed(2) + ')'), color: '#0F6E56', points: hu },
        ]
      },
    },
    {
      id: 'norm-fit',
      level: 'V2',
      title: t('离群点如何拉偏 L2 拟合', 'How outliers drag an L2 fit'),
      xlabel: t('x', 'x'),
      ylabel: t('y', 'y'),
      controls: [
        { id: 'out', label: t('离群点偏移量（0 = 无）', 'outlier offset (0 = none)'), min: 0, max: 12, step: 0.1, value: 6 },
        { id: 'nout', label: t('离群点个数', 'number of outliers'), min: 0, max: 8, step: 1, value: 2 },
      ],
      note: t('加入两三个离群点后，L2 拟合（蓝）明显被拉歪，而 L1 拟合（红）基本不动。这就是稳健估计的价值：在地震学里，少量误拾的到时若不处理，足以让整个层析结果偏离真相。', 'After adding two or three outliers the L2 fit (blue) is visibly skewed while the L1 fit (red) barely moves. That is the value of robust estimation: in seismology a handful of mis-picked arrivals, if untreated, can push an entire tomographic result away from the truth.'),
      compute: (p) => {
        const out = p['out'], nout = Math.round(p['nout'])
        let seed = 313
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return (seed / 0x7fffffff) * 2 - 1
        }
        const xs: number[] = []
        const ys: number[] = []
        for (let i = 0; i < 25; i++) {
          const x = (i / 24) * 10
          xs.push(x)
          ys.push(2 + 0.7 * x + 0.5 * rnd())
        }
        for (let i = 0; i < nout; i++) {
          xs.push(1 + i * 3)
          ys.push(2 + 0.7 * (1 + i * 3) + out)
        }
        const fit = (w: (r: number) => number) => {
          let a = 2, b = 0.7
          for (let it = 0; it < 4000; it++) {
            let ga = 0, gb = 0
            for (let i = 0; i < xs.length; i++) {
              const r = ys[i] - (a + b * xs[i])
              const d = w(r)
              ga += d
              gb += d * xs[i]
            }
            a += 0.0008 * ga
            b += 0.0008 * gb / 10
          }
          return [[0, a], [10, a + b * 10]] as Array<[number, number]>
        }
        return [
          { label: t('数据', 'data'), color: '#888780', points: xs.map((x, i) => [x, ys[i]] as [number, number]) },
          { label: t('L2 拟合', 'L2 fit'), color: '#185FA5', points: fit((r) => r) },
          { label: t('L1 拟合', 'L1 fit'), color: '#993C1D', points: fit((r) => Math.sign(r)) },
        ]
      },
    },
  ],
  example: {
    title: t('选择范数', 'Choosing a norm'),
    input: t('走时层析，1500 个到时中约 3% 为误拾', 'Travel-time tomography: about 3% of 1500 arrivals are mis-picked'),
    steps: [
      t('L2：约 45 个离群点会主导目标函数', 'L2: about 45 outliers dominate the objective'),
      t('改用 Huber（k = 2σ）后影响被限制', 'With Huber (k = 2σ) the influence is bounded'),
    ],
    output: t('稳健失配函数下反演结果更接近真实结构', 'Under a robust misfit the inversion is closer to the true structure'),
  },
  links: {
    upstream: [
      { id: 'bayesian-inversion', note: t('似然是贝叶斯公式的一项', 'The likelihood is one term of Bayes\' formula') },
      { id: 'gaussian-distribution', note: t('高斯假设给出 L2', 'The Gaussian assumption gives L2') },
    ],
    downstream: [{ id: 'metropolis-hastings-mcmc', note: t('采样需要可计算的似然', 'Sampling needs a computable likelihood') }],
    seealso: [{ id: 'least-squares-normal-equations', note: t('L2 最小二乘是其特例', 'L2 least squares is its special case') }],
  },
  refs: [{ text: 'Tarantola, Inverse Problem Theory, Ch. 1 & 8 (probabilistic formulation of inverse problems)' }],
}

export default likelihoodMisfitFunction
