import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** damped-least-squares */
const dampedLeastSquares: FormulaCard = {
  id: 'damped-least-squares',
  name: t('阻尼最小二乘反演解', 'The Damped Least-squares Inverse'),
  aliases: { zh: ['最小二乘', '正则化', '吉洪诺夫正则化'], en: ['least squares', 'regularization', 'Tikhonov', 'ridge'] },
  node: 'S10.1',
  tags: {
    math: ['MATH.LINALG', 'MATH.VECTOR'],
    method: ['METH.INV'],
    quantity: [],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\hat{\boldsymbol{m}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{d}`,
    variants: [
      { name: t('数据量级差异大时加仪器协方差权重', 'With data weighting when levels differ'), latex: String.raw`\hat{\boldsymbol{m}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{C}_{d}^{-1}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{C}_{d}^{-1}\boldsymbol{d}` },
      { name: t('广义形式', 'Generalised form'), latex: String.raw`\hat{\boldsymbol{m}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{W}^{\mathsf{T}}\mathbf{W}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{d}` },
      { name: t('一阶差分（粗糙度）正则化', 'First-difference roughness regularization'), latex: String.raw`\mathbf{W}=\mathbf{D}_{1}:\quad \varepsilon^{2}\sum_i\left(m_{i+1}-m_i\right)^{2}` },
    ],
  },
  meaning: t(
    '地震学反演几乎总是欠定的：数据不够，或者观测对某些参数完全不敏感。ε² 的作用就是明确地承认「我知道有无数解，我只取其中最平滑的那个」。它不是在掩盖问题，而是把先验假设写进了公式。',
    'Seismological inversions are almost always under-determined: not enough data, or total insensitivity to some parameters. The ε² term openly acknowledges that infinitely many solutions exist and picks the smoothest. It does not hide the problem — it writes the prior assumption into the formula.',
  ),
  symbols: [
    { sym: '\\mathbf{G}', name: t('正演算子矩阵（核函数）', 'forward operator matrix (kernel)'), unit: '' },
    { sym: '\\boldsymbol{m}', name: t('模型参数向量', 'model parameter vector'), unit: '' },
    { sym: '\\boldsymbol{d}', name: t('观测数据向量', 'data vector'), unit: '' },
    { sym: '\\varepsilon^{2}', name: t('阻尼因子（Trade-off 参数）', 'damping factor (trade-off parameter)'), unit: '', dimension: '无量纲' },
    { sym: '\\mathbf{I}', name: t('单位矩阵', 'identity matrix'), unit: '' },
    { sym: '\\mathbf{C}_d', name: t('数据协方差矩阵', 'data covariance matrix'), unit: '' },
  ],
  conditions: {
    applies: [t('线性（或线性化）正演问题 Gm = d', 'Linear (or linearised) forward problems Gm = d')],
    assumes: [
      t('数据与模型的先验都服从高斯分布', 'Gaussian priors on both data and model'),
      t('已把非线性问题在某个起点处线性化（迭代求解）', 'Non-linear problems are linearised about a starting model'),
    ],
    breaks: [
      t('强非线性且初值差时会收敛到局部极小', 'Strong non-linearity with a poor starting model converges to local minima'),
      t('数据存在离群点时应改用 L1 范数', 'Outlier-contaminated data call for an L1 norm'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('同时最小化数据残差与模型长度', 'Minimise data misfit and model length together'),
      latex: String.raw`\Phi(\boldsymbol{m})=\|\mathbf{G}\boldsymbol{m}-\boldsymbol{d}\|^{2}+\varepsilon^{2}\|\boldsymbol{m}\|^{2}` },
    { n: 2, op: 'algebra', title: t('用矩阵形式展开', 'Expand in matrix form'),
      latex: String.raw`\Phi=\boldsymbol{m}^{\mathsf{T}}\mathbf{G}^{\mathsf{T}}\mathbf{G}\boldsymbol{m}-2\boldsymbol{m}^{\mathsf{T}}\mathbf{G}^{\mathsf{T}}\boldsymbol{d}+\boldsymbol{d}^{\mathsf{T}}\boldsymbol{d}+\varepsilon^{2}\boldsymbol{m}^{\mathsf{T}}\boldsymbol{m}` },
    { n: 3, op: 'algebra', title: t('对 m 求梯度', 'Take the gradient with respect to m'),
      latex: String.raw`\nabla_{\!m}\Phi=2\mathbf{G}^{\mathsf{T}}\mathbf{G}\boldsymbol{m}-2\mathbf{G}^{\mathsf{T}}\boldsymbol{d}+2\varepsilon^{2}\boldsymbol{m}` },
    { n: 4, op: 'algebra', title: t('令梯度为零', 'Set the gradient to zero'),
      latex: String.raw`\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)\hat{\boldsymbol{m}}=\mathbf{G}^{\mathsf{T}}\boldsymbol{d}` },
    { n: 5, op: 'result', title: t('得到阻尼最小二乘解', 'The damped least-squares solution'),
      latex: String.raw`\hat{\boldsymbol{m}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{d}` },
    { n: 6, op: 'identity', title: t('阻尼为什么能救活奇异矩阵', 'Why damping rescues a singular matrix'),
      latex: String.raw`\lambda_i\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{I}\right)=\lambda_i\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}\right)+\varepsilon^{2}>0`,
      note: t('原本接近零的特征值（即数据完全约束不了的方向）被抬到 ε²，于是矩阵可求逆 —— 代价是那些方向上的解被强行压向零（也就被压向平滑）。', 'Eigenvalues that were near zero — precisely the directions data cannot constrain — are lifted to ε², making the matrix invertible. The price is that the solution along those directions is forced toward zero, hence toward smoothness.') },
  ],
  example: {
    title: t('如何选择 ε²', 'Choosing ε² in practice'),
    input: t('L-curve：横轴 log‖Gm−d‖，纵轴 log‖m‖，在 ε² 上扫一遍', 'The L-curve: plot log‖Gm−d‖ against log‖m‖ while sweeping ε²'),
    steps: [
      t('ε² → 0：数据拟合极好但模型剧烈震荡（过拟合）', 'ε² → 0: excellent fit but a wildly oscillating model (over-fitting)'),
      t('ε² → ∞：模型极平滑但几乎不拟合数据（欠拟合）', 'ε² → ∞: very smooth model that barely fits the data (under-fitting)'),
      t('取曲线拐角处的 ε²', 'Choose ε² at the corner of the L-curve'),
    ],
    output: t('拐角坐标 batik 数据残差与模型大小之间的最佳妥协点', 'The corner is the optimal compromise between data misfit and model size'),
  },
  numerics: [
    { note: t('大型问题不要真的求逆，改用共轭梯度（CG）迭代', 'For large problems never form the inverse; use conjugate gradients'), snippet: 'solve (GᵀG + ε²I) m = Gᵀd  via CG仅需 forward 与 adjoint 算子的调用' },
  ],
  links: {
    upstream: [{ id: 'fourier-transform' }],
  },
  refs: [
    { text: 'Menke, Geophysical Data Analysis: Discrete Inverse Theory' },
    { text: 'Aster, Borchers & Thurber, Parameter Estimation and Inverse Problems' },
  ],

}

export default dampedLeastSquares
