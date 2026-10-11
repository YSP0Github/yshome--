import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** least-squares-normal-equations */
const leastSquaresNormalEquations: FormulaCard = {
  id: 'least-squares-normal-equations',
  name: t('最小二乘与正规方程', 'Least Squares & the Normal Equations'),
  aliases: { zh: ['最小二乘', '正规方程', '法方程'], en: ['least squares', 'normal equations'] },
  node: 'S10.1',
  tags: {
    math: ['MATH.LINALG', 'MATH.STAT'],
    method: ['METH.INV'],
    quantity: ['Q.VEL'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\hat{\mathbf{m}} = (\mathbf{G}^{\mathsf{T}}\mathbf{G})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{d},\qquad
\mathbf{d} = \mathbf{G}\mathbf{m} + \mathbf{e}`,
    variants: [
      { name: t('目标函数', 'Objective function'), latex: String.raw`\Phi(\mathbf{m}) = \|\mathbf{d}-\mathbf{Gm}\|^{2} = \mathbf{e}^{\mathsf{T}}\mathbf{e}` },
      { name: t('加权最小二乘', 'Weighted least squares'), latex: String.raw`\hat{\mathbf{m}} = (\mathbf{G}^{\mathsf{T}}\mathbf{W}\mathbf{G})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{W}\mathbf{d}` },
      { name: t('协方差传播', 'Covariance propagation'), latex: String.raw`\mathbf{C}_m = \sigma^{2}(\mathbf{G}^{\mathsf{T}}\mathbf{G})^{-1}` },
      { name: t('超定与欠定', 'Over- and under-determined'), latex: String.raw`N > M\ \text{超定（有解）};\qquad N < M\ \text{欠定（无穷多解）}` },
    ],
  },
  meaning: t(
    '几乎所有地震学反演的第一句话都是「把问题线性化，然后解最小二乘」。线性化把非线性的正演关系 d = g(m) 换成矩阵关系 d = Gm，最小化残差平方和就给出正规方程。这个方程看似简单，但它藏着反演的全部麻烦：GᵀG 可能接近奇异（参数不独立），这时正规方程的解会剧烈放大噪声 —— 这正是需要阻尼和正则化的原因。',
    'Nearly every seismological inversion begins with "linearise the problem, then solve least squares". Linearisation replaces the nonlinear forward relation d = g(m) with the matrix relation d = Gm, and minimising the sum of squared residuals gives the normal equations. The equation looks simple, but it hides all the trouble of inversion: GᵀG may be nearly singular (parameters not independent), in which case the solution violently amplifies noise — exactly why damping and regularisation are needed.',
  ),
  symbols: [
    { sym: '\\mathbf{G}', name: t('正演算子的线性化矩阵（灵敏度矩阵）', 'linearised forward operator (sensitivity matrix)'), unit: '—' },
    { sym: '\\mathbf{d}', name: t('观测数据向量', 'observation data vector'), unit: '视问题而定' },
    { sym: '\\mathbf{m}', name: t('模型参数向量', 'model parameter vector'), unit: '视问题而定' },
    { sym: '\\mathbf{W}', name: t('数据权重矩阵（通常为 C_d⁻¹）', 'data weight matrix (usually C_d⁻¹)'), unit: '—' },
    { sym: '\\mathbf{C}_m', name: t('模型参数的后验协方差', 'posterior covariance of model parameters'), unit: '—' },
  ],
  conditions: {
    applies: [t('走时层析、接收函数反演、震源机制反演等一切线性化反演', 'Travel-time tomography, receiver-function inversion, focal-mechanism inversion — any linearised inversion')],
    assumes: [t('误差为高斯、无偏、协方差已知', 'Errors are Gaussian, unbiased, with known covariance'), t('正演关系可线性化', 'The forward relation can be linearised')],
    breaks: [t('强非线性时需要迭代或全局搜索', 'Strong nonlinearity requires iteration or global search'), t('数据含离群点时最小二乘会被严重拉偏', 'Least squares is badly biased by outliers')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把正演线性化', 'Linearise the forward problem'), latex: String.raw`\mathbf{d} = \mathbf{g}(\mathbf{m}_0) + \mathbf{G}\,\delta\mathbf{m} + \mathbf{e}` },
    { n: 2, op: 'physics', title: t('最小化残差平方和', 'Minimise the sum of squared residuals'), latex: String.raw`\Phi = (\mathbf{d}-\mathbf{Gm})^{\mathsf{T}}(\mathbf{d}-\mathbf{Gm})` },
    { n: 3, op: 'algebra', title: t('展开并对 m 求导', 'Expand and differentiate with respect to m'), latex: String.raw`\frac{\partial\Phi}{\partial\mathbf{m}} = -2\mathbf{G}^{\mathsf{T}}\mathbf{d} + 2\mathbf{G}^{\mathsf{T}}\mathbf{G}\mathbf{m}` },
    { n: 4, op: 'identity', title: t('令导数为零，得到正规方程', 'Set the derivative to zero to obtain the normal equations'), latex: String.raw`\mathbf{G}^{\mathsf{T}}\mathbf{G}\,\hat{\mathbf{m}} = \mathbf{G}^{\mathsf{T}}\mathbf{d}` },
    { n: 5, op: 'result', title: t('形式上求逆即得解', 'Invert formally to obtain the solution'), latex: String.raw`\hat{\mathbf{m}} = (\mathbf{G}^{\mathsf{T}}\mathbf{G})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{d}` },
  ],
  viz: [
    {
      id: 'ls-line',
      level: 'V1',
      title: t('最小二乘拟合直线：几何直观', 'Least-squares line fit: a geometric picture'),
      xlabel: t('x', 'x'),
      ylabel: t('y', 'y'),
      controls: [
        { id: 'n', label: t('数据点数', 'number of data points'), min: 3, max: 60, step: 1, value: 20 },
        { id: 'sig', label: t('噪声 σ', 'noise σ'), min: 0, max: 3, step: 0.05, value: 0.8 },
        { id: 'x0', label: t('离群点强度 (0 = 无)', 'outlier strength (0 = none)'), min: 0, max: 6, step: 0.1, value: 0 },
      ],
      note: t('最小二乘把竖直方向的残差平方和最小化。加入一个离群点就能把整条直线拉偏 —— 这就是为什么地震学反演前必须做离群值剔除，或改用 L1 范数等稳健准则。', 'Least squares minimises the sum of squared residuals in the vertical direction. A single outlier can drag the whole line — which is why seismological inversions must remove outliers first, or switch to robust norms such as L1.'),
      compute: (p) => {
        const n = Math.round(p['n']), sig = p['sig'], x0 = p['x0']
        let seed = 4242
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return (seed / 0x7fffffff) * 2 - 1
        }
        const xs: number[] = []
        const ys: number[] = []
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1)) * 10
          xs.push(x)
          ys.push(2 + 0.7 * x + sig * rnd())
        }
        if (x0 > 0) {
          xs.push(9.5)
          ys.push(2 + 0.7 * 9.5 + x0 * 3)
        }
        let sx = 0, sy = 0, sxx = 0, sxy = 0
        for (let i = 0; i < xs.length; i++) {
          sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]
        }
        const N = xs.length
        const den = N * sxx - sx * sx
        const b = Math.abs(den) > 1e-12 ? (N * sxy - sx * sy) / den : 0
        const a = (sy - b * sx) / N
        const data: Array<[number, number]> = xs.map((x, i) => [x, ys[i]] as [number, number])
        const fit: Array<[number, number]> = [[0, a], [10, a + b * 10]]
        const truth: Array<[number, number]> = [[0, 2], [10, 2 + 0.7 * 10]]
        return [
          { label: t('数据', 'data'), color: '#888780', points: data },
          { label: t('最小二乘拟合', 'least-squares fit'), color: '#185FA5', points: fit },
          { label: t('真值 y = 2 + 0.7x', 'truth y = 2 + 0.7x'), color: '#993C1D', points: truth },
        ]
      },
    },
  ],
  example: {
    title: t('两点定一线 vs 多点最小二乘', 'Two points versus many points'),
    input: t('20 个点，σ = 0.8，真值 y = 2 + 0.7x', '20 points, σ = 0.8, truth y = 2 + 0.7x'),
    steps: [
      t('单个点的误差 ±0.8 会被 20 个点平均掉', 'The ±0.8 error of a single point is averaged out over 20 points'),
      t('斜率的标准差约为 σ/(√N·σ_x) ≈ 0.13', 'The standard deviation of the slope is about σ/(√N·σ_x) ≈ 0.13'),
    ],
    output: t('拟合斜率落在 0.7 ± 0.13 内', 'The fitted slope falls within 0.7 ± 0.13'),
  },
  links: {
    upstream: [
      { id: 'error-propagation', note: t('误差传播给出 C_m', 'Error propagation gives C_m') },
      { id: 'maximum-likelihood-estimation', note: t('高斯误差假设下最小二乘即极大似然', 'Under Gaussian errors least squares is maximum likelihood') },
    ],
    downstream: [
      { id: 'damped-least-squares', note: t('阻尼解决 GᵀG 奇异的问题', 'Damping fixes the singular GᵀG') },
      { id: 'resolution-matrix', note: t('分辨率矩阵衡量解的可信度', 'The resolution matrix measures how trustworthy the solution is') },
    ],
    seealso: [{ id: 'covariance-correlation', note: t('协方差是权重矩阵的来源', 'Covariance is the source of the weight matrix') }],
  },
  refs: [{ text: 'Menke, Geophysical Data Analysis: Discrete Inverse Techniques, 4th ed., Ch. 4' }],
}

export default leastSquaresNormalEquations
