import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** maximum-likelihood-estimation */
const maximumLikelihoodEstimation: FormulaCard = {
  id: 'maximum-likelihood-estimation',
  name: t('极大似然估计', 'Maximum Likelihood Estimation'),
  aliases: { zh: ['最大似然估计', '极大似然法', 'MLE'], en: ['maximum likelihood', 'MLE', 'maximum likelihood estimator'] },
  node: 'S0.6',
  tags: {
    math: ['MATH.STAT', 'MATH.ROOT'],
    method: ['METH.STAT', 'METH.INV'],
    keywords: t('极大似然 似然函数 对数似然 充分统计量 无偏性 Cramer-Rao 方差估计', 'maximum likelihood likelihood function log-likelihood sufficient statistic unbiasedness Cramer-Rao variance estimate'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\hat{\boldsymbol\theta}_{\mathrm{ML}}=\arg\max_{\boldsymbol\theta}\ \ln L(\boldsymbol\theta)=\arg\max_{\boldsymbol\theta}\sum_{i=1}^{N}\ln p\!\left(x_{i}\mid\boldsymbol\theta\right)`,
    variants: [
      { name: t('正态独立同分布情形的均值估计', 'Mean estimate for independent normal data'), latex: String.raw`\hat\mu_{\mathrm{ML}}=\bar x=\frac{1}{N}\sum_{i=1}^{N}x_{i}` },
      { name: t('方差的极大似然估计（有偏）', 'Maximum-likelihood variance estimate (biased)'), latex: String.raw`\hat\sigma_{\mathrm{ML}}^{2}=\frac{1}{N}\sum_{i=1}^{N}\left(x_{i}-\bar x\right)^{2}` },
      { name: t('无偏修正', 'Unbiased correction'), latex: String.raw`s^{2}=\frac{1}{N-1}\sum_{i=1}^{N}\left(x_{i}-\bar x\right)^{2},\qquad E[s^{2}]=\sigma^{2}` },
      { name: t('高斯对数似然函数', 'Gaussian log-likelihood'), latex: String.raw`\ln L=-\frac{N}{2}\ln\!\left(2\pi\sigma^{2}\right)-\frac{1}{2\sigma^{2}}\sum_{i=1}^{N}\left(x_{i}-\mu\right)^{2}` },
      { name: t('加权最小二乘与似然的关系', 'Relation between weighted least squares and likelihood'), latex: String.raw`\text{高斯噪声}\;\Longrightarrow\;\max\ln L\;\Longleftrightarrow\;\min\sum_{i}\frac{\left(d_{i}-g_{i}(\mathbf m)\right)^{2}}{\sigma_{i}^{2}}` },
      { name: t('Fisher 信息量与下界', 'Fisher information and the lower bound'), latex: String.raw`\operatorname{Var}(\hat\theta)\ge\frac{1}{\mathcal{I}(\theta)},\qquad \mathcal{I}(\theta)=-E\!\left[\frac{\partial^{2}\ln L}{\partial\theta^{2}}\right]` },
    ],
  },
  meaning: t(
    '极大似然的思想极其朴素：在已观测到的这组数据下，选择那个「让这组数据出现概率最大」的参数值。它的威力在于，只要噪声是高斯的，极大化似然就完全等价于极小化加权的残差平方和——于是最小二乘不再是一个凭直觉的约定，而是高斯噪声假设下的最优推断。地震定位、震源机制反演、层析成像的目标函数，追根溯源都是对数似然。',
    'The idea behind maximum likelihood is extremely plain: given the data actually observed, choose the parameter value that makes those data most probable. Its power lies in the fact that, provided the noise is Gaussian, maximising the likelihood is exactly equivalent to minimising the weighted sum of squared residuals — so least squares stops being a convention taken on faith and becomes the optimal inference under a Gaussian noise assumption. The objective functions of earthquake location, focal-mechanism inversion and tomography are all, at root, log-likelihoods.',
  ),
  symbols: [
    { sym: '\\boldsymbol\\theta', name: t('待估参数向量（模型）', 'parameter vector to be estimated (the model)'), unit: '随问题而定' },
    { sym: 'L(\\boldsymbol\\theta)', name: t('似然函数', 'likelihood function'), unit: '1' },
    { sym: '\\ln L', name: t('对数似然（单调变换，极值点不变）', 'log-likelihood (monotone, so the maximiser is unchanged)'), unit: '1' },
    { sym: 'p(x_i\\mid\\boldsymbol\\theta)', name: t('给定参数时第 i 个观测的概率密度', 'probability density of observation i given the parameters'), unit: '1/x' },
    { sym: 'N', name: t('样本量', 'sample size'), unit: '1' },
    { sym: '\\bar x', name: t('样本均值（正态情形下的充分统计量）', 'sample mean (a sufficient statistic in the normal case)'), unit: '与 x 同' },
    { sym: '\\mathcal{I}(\\theta)', name: t('Fisher 信息量', 'Fisher information'), unit: '1/θ²' },
  ],
  conditions: {
    applies: [
      t('观测独立同分布，且噪声的概率模型已知（至少形式上已知）', 'Observations independent and identically distributed, with the noise model known at least in form'),
      t('样本量足够大，使估计量接近渐近正态', 'Sample size large enough for the estimator to be close to asymptotically normal'),
    ],
    assumes: [
      t('模型族 p(x|θ) 正确指定（不误设）', 'The model family p(x|θ) is correctly specified (no misspecification)'),
      t('取对数只是单调变换，不改变极值位置', 'Taking logarithms is a monotone transformation and does not move the maximiser'),
    ],
    breaks: [
      t('噪声非高斯（如有粗差）时，极大似然不再等价于最小二乘，需用 L1 或 Huber 损失', 'With non-Gaussian noise (outliers) maximum likelihood is no longer least squares; L1 or Huber losses are needed'),
      t('观测相关时不能把联合密度写成乘积，必须引入协方差矩阵', 'Correlated observations cannot be factorised; the covariance matrix must enter'),
      t('参数过多、模型过柔时会过拟合，需要正则化（即先验，见贝叶斯推断）', 'Too many parameters and an overly flexible model cause overfitting; regularisation, that is a prior, is needed'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('独立观测的联合密度等于乘积', 'The joint density of independent observations factorises'),
      latex: String.raw`L(\boldsymbol\theta)=p(x_{1},\dots,x_{N}\mid\boldsymbol\theta)=\prod_{i=1}^{N}p(x_{i}\mid\boldsymbol\theta)` },
    { n: 2, op: 'identity', title: t('取对数，乘积变求和', 'Take logarithms: products become sums'),
      latex: String.raw`\ln L=\sum_{i=1}^{N}\ln p(x_{i}\mid\boldsymbol\theta)`,
      note: t('对数不但让求导变简单，还避免了许多小概率相乘导致的数值下溢。', 'Logarithms simplify differentiation and avoid numerical underflow when many small probabilities are multiplied.') },
    { n: 3, op: 'substitute', title: t('代入高斯密度', 'Insert the Gaussian density'),
      latex: String.raw`\ln L=-\frac{N}{2}\ln\!\left(2\pi\sigma^{2}\right)-\frac{1}{2\sigma^{2}}\sum_{i=1}^{N}\left(x_{i}-\mu\right)^{2}` },
    { n: 4, op: 'algebra', title: t('对 μ 求导并令其为零', 'Differentiate with respect to μ and set to zero'),
      latex: String.raw`\frac{\partial\ln L}{\partial\mu}=\frac{1}{\sigma^{2}}\sum_{i=1}^{N}\left(x_{i}-\mu\right)=0\;\Longrightarrow\;\hat\mu=\frac{1}{N}\sum_{i}x_{i}=\bar x` },
    { n: 5, op: 'algebra', title: t('对 σ² 求导并令其为零', 'Differentiate with respect to σ² and set to zero'),
      latex: String.raw`\frac{\partial\ln L}{\partial\sigma^{2}}=-\frac{N}{2\sigma^{2}}+\frac{1}{2\sigma^{4}}\sum_{i}\left(x_{i}-\mu\right)^{2}=0\;\Longrightarrow\;\hat\sigma^{2}=\frac{1}{N}\sum_{i}\left(x_{i}-\bar x\right)^{2}` },
    { n: 6, op: 'result', title: t('检验：这个方差估计是有偏的', 'Check: this variance estimate is biased'),
      latex: String.raw`E\!\left[\hat\sigma^{2}\right]=\frac{N-1}{N}\sigma^{2}\;\Longrightarrow\; s^{2}=\frac{N}{N-1}\hat\sigma^{2}=\frac{1}{N-1}\sum_{i}\left(x_{i}-\bar x\right)^{2}`,
      note: t('少一个自由度是因为均值 μ 也是从同一批数据估出来的。N 大时差异可以忽略。', 'One degree of freedom is lost because the mean μ was estimated from the same data. For large N the difference is negligible.') },
    { n: 7, op: 'result', title: t('与最小二乘的等价性', 'Equivalence with least squares'),
      latex: String.raw`\max_{\mathbf m}\ln L\;\Longleftrightarrow\;\min_{\mathbf m}\left(\mathbf d-\mathbf g(\mathbf m)\right)^{\mathrm T}\mathbf C_{d}^{-1}\left(\mathbf d-\mathbf g(\mathbf m)\right)`,
      note: t('只要噪声是高斯的，反演的「目标函数」就不再是人为主观选择，而是由噪声统计决定的。', 'Provided the noise is Gaussian, the objective function of an inversion is not a subjective choice; it is dictated by the noise statistics.') },
  ],
  viz: [
    {
      id: 'mle-mu',
      level: 'V1',
      title: t('均值参数的对数似然曲线', 'Log-likelihood curve for the mean parameter'),
      xlabel: t('候选均值 μ', 'candidate mean μ'),
      ylabel: t('ln L(μ)', 'ln L(μ)'),
      controls: [
        { id: 'sg', label: t('假定的噪声 σ', 'assumed noise σ'), min: 0.05, max: 1, step: 0.05, value: 0.3, unit: '1' },
        { id: 'shift', label: t('数据的整体偏移', 'overall shift of the data'), min: -1, max: 1.5, step: 0.1, value: 0, unit: '1' },
      ],
      xRange: [-1, 3],
      note: t('曲线是一条开口向下的抛物线，顶点恰好落在样本均值处 —— 高斯假设下，似然对均值永远是单峰的，这是优化能收敛的保证。', 'The curve is a downward parabola whose vertex sits exactly at the sample mean. Under a Gaussian assumption the likelihood in the mean is always unimodal, which guarantees that optimisation converges.'),
      compute: (p) => {
        const sg = Math.max(0.02, p['sg'])
        const sh = p['shift']
        const data = [1.2, 0.8, 1.5, 0.9, 1.1, 1.35, 0.95, 1.05].map((v) => v + sh)
        const N = data.length
        let mean = 0
        for (const v of data) mean += v / N
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const mu = -1 + (i / 400) * 4
          let s = 0
          for (const v of data) s += (v - mu) * (v - mu)
          pts.push([mu, (-s / (2 * sg * sg))])
        }
        const top = 0
        const bot = -peakDepth(data, mean, sg)
        const marker: Array<[number, number]> = []
        for (let i = 0; i <= 60; i++) marker.push([mean, top + (i / 60) * (bot - top)])
        return [
          { label: t('ln L(μ)（去掉常数项）', 'ln L(μ) (constant dropped)'), color: '#185FA5', points: pts },
          { label: t('极大似然点 μ_ML = x 均值', 'maximum at μ_ML = sample mean'), color: '#BA7517', dash: true, points: marker },
        ]
      },
    },
    {
      id: 'mle-sigma',
      level: 'V1',
      title: t('方差参数的对数似然曲线', 'Log-likelihood curve for the variance parameter'),
      xlabel: t('候选标准差 σ', 'candidate standard deviation σ'),
      ylabel: t('ln L(σ)', 'ln L(σ)'),
      controls: [
        { id: 'mu2', label: t('假定的均值 μ', 'assumed mean μ'), min: 0.5, max: 2, step: 0.05, value: 1.1, unit: '1' },
      ],
      xRange: [0.05, 1.5],
      note: t('曲线明显不对称：向大 σ 一侧拖着长尾。这说明 σ 的不确定性不能用对称的 ±Δσ 描述，小样本时尤其如此。', 'The curve is clearly asymmetric with a long tail toward large σ. The uncertainty in σ therefore cannot be described by a symmetric ±Δσ, especially for small samples.'),
      compute: (p) => {
        const mu = p['mu2']
        const data = [1.2, 0.8, 1.5, 0.9, 1.1, 1.35, 0.95, 1.05]
        const N = data.length
        let s2 = 0
        for (const v of data) s2 += (v - mu) * (v - mu)
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const sg = 0.05 + (i / 400) * 1.45
          pts.push([sg, -N * Math.log(sg) - s2 / (2 * sg * sg)])
        }
        return [{ label: t('ln L(σ)', 'ln L(σ)'), color: '#0F6E56', points: pts }]
      },
    },
  ],
  example: {
    title: t('用 8 个到时残差估计噪声水平', 'Estimating the noise level from eight arrival-time residuals'),
    input: t('残差（s）：0.10, −0.30, 0.40, −0.20, 0.00, 0.25, −0.15, −0.05', 'Residuals (s): 0.10, −0.30, 0.40, −0.20, 0.00, 0.25, −0.15, −0.05'),
    steps: [
      t('均值 μ_ML = 0.0063 s（几乎为零，符合无系统偏差的预期）', 'Mean μ_ML = 0.0063 s (essentially zero, as expected for no systematic bias)'),
      t('ML 方差 σ²_ML = (1/8)Σ(x−x均值)² = 0.0472 s²，σ_ML = 0.217 s', 'ML variance σ²_ML = (1/8)Σ(x − x_mean)² = 0.0472 s², σ_ML = 0.217 s'),
      t('无偏修正 s² = (8/7)×0.0472 = 0.0540 s²，s = 0.232 s', 'Unbiased correction s² = (8/7)×0.0472 = 0.0540 s², s = 0.232 s'),
    ],
    output: t('用 8 个数据点估计方差，有偏与无偏差了 14% —— 样本越小差别越大，这正是一自由度修正的意义。', 'With only eight points the biased and unbiased variance estimates differ by 14%. The smaller the sample the larger the gap, which is the whole point of the one-degree-of-freedom correction.'),
  },
  links: {
    upstream: [
      { id: 'gaussian-distribution', note: t('似然函数由它写出', 'the likelihood is written from it') },
    ],
    seealso: [
      { id: 'chi-square-goodness', note: t('似然比与 χ² 增量直接相关', 'likelihood ratios relate directly to χ² increments') },
      { id: 'damped-least-squares', note: t('正则化相当于加入先验', 'regularisation amounts to adding a prior') },
    ],
  },
  refs: [
    { text: 'Tarantola, Inverse Problem Theory, §2.4' },
    { text: 'Menke, Geophysical Data Analysis: Discrete Inverse Techniques, Ch. 2' },
  ],
}

function peakDepth(data: number[], mean: number, sg: number): number {
  let s = 0
  for (const v of data) s += (v - mean) * (v - mean)
  return s / (2 * sg * sg)
}

export default maximumLikelihoodEstimation
