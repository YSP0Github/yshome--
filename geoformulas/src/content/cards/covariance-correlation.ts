import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** covariance-correlation */
const covarianceCorrelation: FormulaCard = {
  id: 'covariance-correlation',
  name: t('协方差与相关系数', 'Covariance and the Correlation Coefficient'),
  aliases: { zh: ['协方差', '相关系数', '皮尔逊相关'], en: ['covariance', 'correlation coefficient', 'Pearson correlation'] },
  node: 'S0.6',
  tags: {
    math: ['MATH.STAT', 'MATH.LINALG'],
    method: ['METH.STAT'],
    keywords: t('协方差 相关系数 皮尔逊 柯西施瓦茨 标准化 协方差矩阵 独立性', 'covariance correlation coefficient Pearson Cauchy-Schwarz standardisation covariance matrix independence'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathrm{Cov}(X,Y)=E\!\left[(X-\mu_{X})(Y-\mu_{Y})\right]=E[XY]-\mu_{X}\mu_{Y}`,
    variants: [
      { name: t('相关系数（归一化后的协方差）', 'Correlation coefficient (normalised covariance)'), latex: String.raw`\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sigma_{X}\sigma_{Y}}\in[-1,1]` },
      { name: t('样本估计', 'Sample estimates'), latex: String.raw`\widehat{\mathrm{Cov}}=\frac{1}{N-1}\sum_{i=1}^{N}\left(x_{i}-\bar x\right)\left(y_{i}-\bar y\right),\qquad \hat\rho=\frac{\widehat{\mathrm{Cov}}}{s_{x}s_{y}}` },
      { name: t('协方差矩阵', 'Covariance matrix'), latex: String.raw`\mathbf C=\begin{bmatrix}\sigma_{1}^{2} & \rho_{12}\sigma_{1}\sigma_{2} & \cdots\\ \rho_{12}\sigma_{1}\sigma_{2} & \sigma_{2}^{2} & \cdots\\ \vdots & \vdots & \ddots\end{bmatrix}` },
      { name: t('线性变换下的行为', 'Behaviour under a linear transformation'), latex: String.raw`\mathbf C_{\mathbf{Ax}}=\mathbf A\,\mathbf C_{\mathbf x}\,\mathbf A^{\mathrm T}` },
      { name: t('独立蕴含不相关（反之不成立）', 'Independence implies zero correlation (the converse fails)'), latex: String.raw`X\perp Y\;\Longrightarrow\;\mathrm{Cov}(X,Y)=0,\qquad \mathrm{Cov}=0\;\not\Longrightarrow\;X\perp Y` },
    ],
  },
  meaning: t(
    '协方差刻画两个量「一起偏离各自均值」的倾向，相关系数则把这一度量归一化到 [−1, 1]，因而可以跨量纲比较。二者是全部统计推断的二阶语言：误差传播、最小二乘的加权矩阵、反演中的模型协方差，都建立在它们之上。务必记住 ρ = 0 只说明没有线性关联，不能推出独立，除非联合分布是高斯的。',
    'Covariance measures the tendency of two quantities to deviate from their own means together, while the correlation coefficient normalises that measure to [−1, 1] so it can be compared across units. Together they are the second-order language of all statistical inference: error propagation, the weighting matrix of least squares and the model covariance in inversions all rest on them. Always remember that ρ = 0 only rules out linear association; independence follows only if the joint distribution is Gaussian.',
  ),
  symbols: [
    { sym: '\\mathrm{Cov}(X,Y)', name: t('X 与 Y 的协方差', 'covariance of X and Y'), unit: 'X·Y 单位之积' },
    { sym: '\\rho_{XY}', name: t('Pearson 相关系数', 'Pearson correlation coefficient'), unit: '1' },
    { sym: '\\mu_X', name: t('X 的期望', 'expectation of X'), unit: '与 X 同' },
    { sym: '\\sigma_X', name: t('X 的标准差', 'standard deviation of X'), unit: '与 X 同' },
    { sym: '\\mathbf C', name: t('协方差矩阵（对称半正定）', 'covariance matrix (symmetric, positive semi-definite)'), unit: '随问题而定' },
    { sym: 'N', name: t('样本量', 'sample size'), unit: '1' },
    { sym: 's_x', name: t('X 的样本标准差', 'sample standard deviation of X'), unit: '与 X 同' },
  ],
  conditions: {
    applies: [
      t('两个随机变量（或两道数据）之间存在线性关联', 'A linear association exists between two random variables (or two data traces)'),
      t('二阶矩存在且有限', 'Second moments exist and are finite'),
    ],
    assumes: [
      t('样本估计用 N − 1 归一化以保证无偏', 'Sample estimates use N − 1 normalisation to be unbiased'),
      t('相关系数只度量线性依赖', 'The correlation coefficient measures linear dependence only'),
    ],
    breaks: [
      t('存在非线性依赖时 ρ 可以接近 0（如 Y = X² 且 X 对称分布）', 'With nonlinear dependence ρ can be near zero (e.g. Y = X² with X symmetric)'),
      t('粗差会剧烈扭曲 ρ；个别离群点能把 ρ 从 0 拉到 0.8', 'Outliers distort ρ severely; a single aberrant point can drag ρ from 0 to 0.8'),
      t('两道数据都含共同的强趋势时会出现伪相关，必须先去趋势', 'Two traces sharing a strong trend show spurious correlation; detrend first'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义中心化变量', 'Define centred variables'),
      latex: String.raw`\tilde X=X-\mu_{X},\qquad \tilde Y=Y-\mu_{Y},\qquad E[\tilde X]=E[\tilde Y]=0` },
    { n: 2, op: 'setup', title: t('协方差即中心化变量乘积的期望', 'Covariance is the expectation of the product of centred variables'),
      latex: String.raw`\mathrm{Cov}(X,Y)=E[\tilde X\tilde Y]=E[XY]-\mu_{X}E[Y]-\mu_{Y}E[X]+\mu_{X}\mu_{Y}=E[XY]-\mu_{X}\mu_{Y}` },
    { n: 3, op: 'identity', title: t('柯西–施瓦茨不等式给出上界', 'The Cauchy–Schwarz inequality gives the bound'),
      latex: String.raw`\left|E[\tilde X\tilde Y]\right|^{2}\le E[\tilde X^{2}]\,E[\tilde Y^{2}]=\sigma_{X}^{2}\sigma_{Y}^{2}` },
    { n: 4, op: 'result', title: t('于是相关系数落在 [−1, 1]', 'Hence the correlation coefficient lies in [−1, 1]'),
      latex: String.raw`-1\le\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sigma_{X}\sigma_{Y}}\le 1`,
      note: t('等号成立当且仅当 Y = aX + b 且 a > 0（ρ = +1）或 a < 0（ρ = −1）。', 'Equality holds if and only if Y = aX + b with a > 0 (ρ = +1) or a < 0 (ρ = −1).') },
    { n: 5, op: 'identity', title: t('独立 ⟹ 不相关', 'Independence implies zero correlation'),
      latex: String.raw`X\perp Y\;\Rightarrow\;E[XY]=E[X]E[Y]\;\Rightarrow\;\mathrm{Cov}=0` },
    { n: 6, op: 'result', title: t('方差是协方差的特例，双线性是它的代数结构', 'Variance is a special case; bilinearity is its algebraic structure'),
      latex: String.raw`\mathrm{Cov}(X,X)=\sigma_{X}^{2},\qquad \mathrm{Cov}(aX+bY,Z)=a\,\mathrm{Cov}(X,Z)+b\,\mathrm{Cov}(Y,Z)`,
      note: t('双线性直接推出线性变换公式 C_{Ax} = A C_x A^T，这是误差传播矩阵形式的基础。', 'Bilinearity immediately gives the transformation law C_{Ax} = A C_x A^T, the basis of the matrix form of error propagation.') },
  ],
  example: {
    title: t('两个台站的噪声是否相关', 'Is the noise at two stations correlated'),
    input: t('N = 100 个噪声样点，s_x = s_y = 2.0，样本协方差 = 1.2', 'N = 100 noise samples, s_x = s_y = 2.0, sample covariance = 1.2'),
    steps: [
      t('ρ_est = 1.2/(2.0 × 2.0) = 0.30', 'ρ_est = 1.2/(2.0 × 2.0) = 0.30'),
      t('ρ_est 的标准误约 1/√N = 0.10，故 ρ_est = 0.30 约为 3 个标准误', 'The standard error of ρ_est is about 1/√N = 0.10, so ρ_est = 0.30 is about three standard errors'),
      t('结论：存在显著但中等的正相关', 'Conclusion: significant but moderate positive correlation'),
    ],
    output: t('中等相关意味着不能把两台站的噪声当作独立处理：联合反演时协方差矩阵的非对角项必须保留。', 'Moderate correlation means the two stations cannot be treated as independent: the off-diagonal terms of the covariance matrix must be kept in a joint inversion.'),
  },
  links: {
    downstream: [
      { id: 'error-propagation', note: t('非对角项就是误差传播里的交叉项', 'the off-diagonal terms are the cross terms in error propagation') },
    ],
    seealso: [
      { id: 'gaussian-distribution', note: t('多维正态完全由均值与协方差矩阵确定', 'a multivariate normal is fully determined by its mean and covariance matrix') },
      { id: 'damped-least-squares', note: t('数据协方差决定加权方式', 'the data covariance determines the weighting') },
    ],
  },
  refs: [
    { text: 'Bevington & Robinson, Data Reduction and Error Analysis, Ch. 2' },
    { text: 'Tarantola, Inverse Problem Theory, §2.3' },
  ],
}

export default covarianceCorrelation
