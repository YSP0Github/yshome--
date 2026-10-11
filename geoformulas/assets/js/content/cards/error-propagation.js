import { t } from '../../core/types.js';
/** error-propagation */
const errorPropagation = {
    id: 'error-propagation',
    name: t('误差传播公式', 'The Error Propagation Formula'),
    aliases: { zh: ['误差传递', '协方差传播', '方差传播定律'], en: ['error propagation', 'propagation of uncertainty', 'delta method'] },
    node: 'S0.6',
    tags: {
        math: ['MATH.STAT', 'MATH.APPROX'],
        method: ['METH.STAT', 'METH.INV'],
        keywords: t('误差传播 协方差传播 雅可比 一阶近似 相对误差 不确定性', 'error propagation covariance propagation Jacobian first-order approximation relative uncertainty'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\sigma_{f}^{2}=\sum_{i}\sum_{j}\frac{\partial f}{\partial x_{i}}\frac{\partial f}{\partial x_{j}}\,\mathrm{Cov}\!\left(x_{i},x_{j}\right)`,
        variants: [
            { name: t('矩阵形式（最通用）', 'Matrix form (the most general)'), latex: String.raw `\mathbf C_{f}=\mathbf J\,\mathbf C_{x}\,\mathbf J^{\mathrm T},\qquad J_{ai}=\frac{\partial f_{a}}{\partial x_{i}}` },
            { name: t('各输入独立时的简化式', 'Simplified form when the inputs are independent'), latex: String.raw `\sigma_{f}^{2}=\sum_{i}\left(\frac{\partial f}{\partial x_{i}}\right)^{2}\sigma_{i}^{2}` },
            { name: t('乘幂形式的相对误差', 'Relative error for a product of powers'), latex: String.raw `f=x^{a}y^{b}\;\Longrightarrow\;\left(\frac{\sigma_{f}}{f}\right)^{2}=a^{2}\left(\frac{\sigma_{x}}{x}\right)^{2}+b^{2}\left(\frac{\sigma_{y}}{y}\right)^{2}` },
            { name: t('和与差的绝对误差', 'Absolute error for sums and differences'), latex: String.raw `f=x\pm y\;\Longrightarrow\;\sigma_{f}^{2}=\sigma_{x}^{2}+\sigma_{y}^{2}\pm 2\,\mathrm{Cov}(x,y)` },
            { name: t('忽略相关项会低估还是高估', 'Does ignoring covariance under- or over-estimate'), latex: String.raw `\mathrm{Cov}(x,y)>0\ \text{时忽略相关项会低估}\ \sigma_{x+y}` },
        ],
    },
    meaning: t('误差传播回答的是「输入有多不准，输出就有多不准」。做法是把非线性函数在数据点附近做一阶展开，于是输出的不确定性只由雅可比矩阵和输入的协方差矩阵决定。地震学里从速度模型误差推算走时误差、从到时误差推算震源位置误差、从频谱比推算 Q 的误差，用的都是这条公式。它是最常用、也最容易被误用的公式：前提是线性近似成立。', 'Error propagation answers the question: how uncertain is the output given how uncertain the inputs are. The trick is to expand the nonlinear function to first order about the data point, so the output uncertainty is fixed by the Jacobian and the input covariance matrix. Propagating velocity-model error into travel-time error, arrival-time error into hypocentre error, and spectral-ratio error into Q all use this formula. It is the most widely used and most easily abused formula in the toolbox: everything rests on the linear approximation being valid.'),
    symbols: [
        { sym: '\\sigma_f^2', name: t('输出量的方差', 'variance of the output quantity'), unit: 'f 单位的平方' },
        { sym: '\\partial f/\\partial x_i', name: t('f 对第 i 个输入的偏导数（敏感度）', 'partial derivative of f with respect to input i (sensitivity)'), unit: 'f/x_i' },
        { sym: '\\mathrm{Cov}(x_i,x_j)', name: t('第 i、j 个输入的协方差', 'covariance of inputs i and j'), unit: 'x_i·x_j' },
        { sym: '\\mathbf J', name: t('雅可比矩阵（敏感度矩阵）', 'Jacobian matrix (sensitivity matrix)'), unit: '随问题而定' },
        { sym: '\\mathbf C_x', name: t('输入的协方差矩阵', 'covariance matrix of the inputs'), unit: '随问题而定' },
        { sym: '\\sigma_i', name: t('第 i 个输入的标准差', 'standard deviation of input i'), unit: '与 x_i 同' },
    ],
    conditions: {
        applies: [
            t('输入的不确定性远小于函数的曲率尺度（一阶近似成立）', 'Input uncertainties are small compared with the curvature scale of the function (first-order approximation valid)'),
            t('输入的一、二阶矩（均值与协方差）已知', 'First and second moments of the inputs (mean and covariance) are known'),
        ],
        assumes: [
            t('偏导数在均值处取值，f 在该邻域内近似线性', 'Partial derivatives evaluated at the mean; f is approximately linear in that neighbourhood'),
            t('忽略二阶及更高阶项（即忽略 E[f] 与 f(E[x]) 的偏差）', 'Second and higher order terms dropped, i.e. the bias between E[f] and f(E[x]) is neglected'),
        ],
        breaks: [
            t('强非线性（如接近奇点、拐角频率附近）时一阶近似严重失真，应改用蒙特卡洛采样', 'Under strong nonlinearity (near singularities, near a corner frequency) the first-order approximation fails badly; use Monte Carlo sampling'),
            t('输入分布有厚尾或粗差时，方差本身就不能刻画不确定性', 'With heavy tails or outliers the variance itself no longer characterises the uncertainty'),
            t('相关项被忽略是实践中最常见的错误，往往导致过于乐观的误差估计', 'Neglecting covariance terms is the most common practical mistake and usually yields overly optimistic error bars'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把 f 在均值处做一阶展开', 'Expand f about the mean to first order'),
            latex: String.raw `f(\mathbf x)\approx f(\bar{\mathbf x})+\sum_{i}\frac{\partial f}{\partial x_{i}}\,\delta x_{i},\qquad \delta x_{i}=x_{i}-\bar x_{i}` },
        { n: 2, op: 'identity', title: t('输出的扰动是输入扰动的线性组合', 'The output perturbation is a linear combination of the input perturbations'),
            latex: String.raw `\delta f=\sum_{i}J_{i}\,\delta x_{i},\qquad E[\delta f]=0` },
        { n: 3, op: 'identity', title: t('方差定义为扰动平方的期望', 'Variance is the expectation of the squared perturbation'),
            latex: String.raw `\sigma_{f}^{2}=E\!\left[\delta f^{2}\right]=E\!\left[\left(\sum_{i}J_{i}\delta x_{i}\right)\left(\sum_{j}J_{j}\delta x_{j}\right)\right]` },
        { n: 4, op: 'algebra', title: t('把期望号移进求和', 'Move the expectation inside the sums'),
            latex: String.raw `\sigma_{f}^{2}=\sum_{i}\sum_{j}J_{i}J_{j}\,E\!\left[\delta x_{i}\delta x_{j}\right]=\sum_{i}\sum_{j}\frac{\partial f}{\partial x_{i}}\frac{\partial f}{\partial x_{j}}\,\mathrm{Cov}(x_{i},x_{j})` },
        { n: 5, op: 'substitute', title: t('矩阵化', 'Write it in matrix form'),
            latex: String.raw `\mathbf C_{f}=\mathbf J\,\mathbf C_{x}\,\mathbf J^{\mathrm T}` },
        { n: 6, op: 'taylor', title: t('检验幂函数情形', 'Check the power-law case'),
            latex: String.raw `f=x^{a}y^{b}\;\Rightarrow\;\frac{\partial f}{\partial x}=\frac{a f}{x},\ \frac{\partial f}{\partial y}=\frac{b f}{y}\;\Rightarrow\;\left(\frac{\sigma_{f}}{f}\right)^{2}=a^{2}\left(\frac{\sigma_{x}}{x}\right)^{2}+b^{2}\left(\frac{\sigma_{y}}{y}\right)^{2}` },
        { n: 7, op: 'result', title: t('相关性为何重要', 'Why correlation matters'),
            latex: String.raw `f=x+y:\ \sigma_{f}^{2}=\sigma_{x}^{2}+\sigma_{y}^{2}+2\rho\,\sigma_{x}\sigma_{y},\qquad \rho=+1\Rightarrow\sigma_{f}=\sigma_{x}+\sigma_{y}`,
            note: t('完全正相关时误差直接相加而非平方相加 —— 共模误差（如共同的速度模型偏差）就是这样把误差放大的。', 'Under perfect positive correlation errors add linearly rather than in quadrature. Common-mode errors such as a shared velocity-model bias amplify uncertainty exactly this way.') },
    ],
    example: {
        title: t('由走时与距离误差估计速度误差', 'Estimating velocity error from travel-time and distance errors'),
        input: t('v = x/t，x = 100.0 ± 0.5 km，t = 12.50 ± 0.05 s，二者独立', 'v = x/t with x = 100.0 ± 0.5 km, t = 12.50 ± 0.05 s, independent'),
        steps: [
            t('v = 100/12.5 = 8.00 km/s', 'v = 100/12.5 = 8.00 km/s'),
            t('相对误差：σ_v/v = √[(0.5/100)² + (0.05/12.5)²] = √(2.5×10⁻⁵ + 1.6×10⁻⁵) = 0.0064', 'Relative error: σ_v/v = √[(0.5/100)² + (0.05/12.5)²] = √(2.5×10⁻⁵ + 1.6×10⁻⁵) = 0.0064'),
            t('σ_v = 8.00 × 0.0064 = 0.051 km/s', 'σ_v = 8.00 × 0.0064 = 0.051 km/s'),
        ],
        output: t('速度的 1σ 不确定度为 0.05 km/s（0.64%）。时间误差与距离误差的贡献量级相当 —— 想再提高精度，两边都得改进。', 'The 1σ uncertainty of the velocity is 0.05 km/s (0.64%). Timing and distance errors contribute comparably, so improving precision further requires improving both.'),
    },
    links: {
        upstream: [
            { id: 'covariance-correlation', note: t('公式中的协方差项来自这里', 'the covariance terms come from here') },
        ],
        seealso: [
            { id: 'gaussian-distribution', note: t('通常假定输入误差服从正态分布', 'input errors are usually assumed normal') },
            { id: 'damped-least-squares', note: t('反演中雅可比即 Frechet 导数矩阵', 'in inversions the Jacobian is the Frechet derivative matrix') },
        ],
    },
    refs: [
        { text: 'Bevington & Robinson, Data Reduction and Error Analysis, Ch. 3' },
        { text: 'Tarantola, Inverse Problem Theory, §5.2' },
    ],
};
export default errorPropagation;
//# sourceMappingURL=error-propagation.js.map