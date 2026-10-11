import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** resolution-matrix */
const resolutionMatrix: FormulaCard = {
  id: 'resolution-matrix',
  name: t('分辨率矩阵与协方差', 'Resolution Matrix & Covariance'),
  aliases: { zh: ['分辨率', '模型协方差', '权衡曲线'], en: ['resolution matrix', 'model covariance', 'trade-off curve'] },
  node: 'S10.5',
  tags: {
    math: ['MATH.LINALG', 'MATH.STAT'],
    method: ['METH.INV'],
    quantity: ['Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{R}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{G},\qquad \hat{\boldsymbol{m}}=\mathbf{R}\,\boldsymbol{m}^{\text{真}}`,
    variants: [
      { name: t('模型协方差', 'Model covariance'), latex: String.raw`\mathbf{C}_m=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{C}_d\,\mathbf{G}\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}` },
      { name: t('信息密度（射线覆盖）', 'Information density (ray coverage)'), latex: String.raw`\rho_j=\frac{R_{jj}}{\max_k R_{kk}},\qquad \rho_j\to1\ \text{表示第 }j\text{ 个参数被良好分辨}` },
      { name: t('分辨宽度（Backus–Gilbert）', 'Resolution width (Backus–Gilbert)'), latex: String.raw`W_j=\frac{\sum_k\left(\boldsymbol{r}_j\right)_k^{2}\,w_{jk}}{\left(\sum_k\left(\boldsymbol{r}_j\right)_k\right)^{2}}` },
    ],
  },
  meaning: t(
    '反演给出的不是真模型，而是真模型被分辨率矩阵「模糊」后的版本。R 的对角元告诉你每个参数被分辨得多好，非对角元告诉你相邻参数之间串了多少。没有 R 就谈反演结果，等于把一张模糊照片当成清晰照片来解释 —— 这是层析成像论文最常见的问题。',
    'Inversion does not return the true model but the true model blurred by the resolution matrix. The diagonal of R tells how well each parameter is resolved; the off-diagonal terms tell how much neighbouring parameters leak into each other. Discussing tomographic results without R is like interpreting a blurred photo as a sharp one — the most common failing of tomography papers.',
  ),
  symbols: [
    { sym: '\\mathbf{R}', name: t('模型分辨率矩阵', 'model resolution matrix'), unit: '无量纲' },
    { sym: '\\mathbf{C}_m', name: t('后验模型协方差', 'posterior model covariance'), unit: '参数平方' },
    { sym: 'R_{jj}', name: t('第 j 个参数自分辨程度', 'self-resolution of parameter j'), unit: '无量纲', typical: '0 – 1' },
    { sym: '\\varepsilon', name: t('阻尼因子', 'damping factor'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('线性（或已线性化）反演的结果评估', 'Assessing results of linear or linearised inversions')],
    assumes: [t('正演算子与噪声统计已知', 'The forward operator and noise statistics are known')],
    breaks: [t('强非线性问题时 R 只在当前模型附近成立', 'For strongly nonlinear problems R is valid only near the current model')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('写出阻尼最小二乘解', 'Write the damped least-squares solution'),
      latex: String.raw`\hat{\boldsymbol{m}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{d}` },
    { n: 2, op: 'substitute', title: t('代入 d = G m^真', 'Substitute d = G m^true'),
      latex: String.raw`\hat{\boldsymbol{m}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{G}\,\boldsymbol{m}^{\text{真}}` },
    { n: 3, op: 'identity', title: t('定义分辨率矩阵', 'Define the resolution matrix'),
      latex: String.raw`\mathbf{R}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{G}` },
    { n: 4, op: 'result', title: t('ε → 0 时 R → I（完全分辨）', 'As ε → 0, R → I (perfect resolution)'),
      latex: String.raw`\varepsilon\to0:\ \mathbf{R}\to\mathbf{I}\quad\text{但方差同时爆炸 —— 这就是权衡}` },
  ],
  links: {
    upstream: [{ id: 'damped-least-squares', note: t('解的形式来自它', 'The solution form comes from it') }],
    seealso: [{ id: 'travel-time-tomography', note: t('最需要 R 的应用场景', 'The application that most needs R') }],
  },
  refs: [{ text: 'Menke, Geophysical Data Analysis: Discrete Inverse Theory' }, { text: 'Backus & Gilbert (1968), Geophys. J. R. Astron. Soc., 16' }],
}

export default resolutionMatrix
