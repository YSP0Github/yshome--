import { t } from '../../core/types.js';
/** green-function-definition */
const greenFunctionDefinition = {
    id: 'green-function-definition',
    name: t('Green 函数的定义与叠加原理', 'Definition of the Green Function and the Superposition Principle'),
    aliases: { zh: ['格林函数', '点源解', '基本解', '叠加原理'], en: ['Green function', 'point-source solution', 'fundamental solution', 'superposition'] },
    node: 'S0.7',
    tags: {
        math: ['MATH.DIFF', 'MATH.LINALG'],
        method: ['METH.INV'],
        quantity: ['Q.AMP'],
        keywords: t('格林函数 基本解 点源 叠加原理 狄拉克函数 线性算子 卷积', 'Green function fundamental solution point source superposition Dirac delta linear operator convolution'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `L\,G(\mathbf r,\mathbf r')=\delta(\mathbf r-\mathbf r'),\qquad u(\mathbf r)=\int G(\mathbf r,\mathbf r')\,f(\mathbf r')\,\mathrm{d}\mathbf r'`,
        variants: [
            { name: t('一阶常微分方程形式', 'First-order ODE form'), latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}t}g(t-t')=\delta(t-t')\;\Longrightarrow\; g=H(t-t')` },
            { name: t('离散（矩阵）形式：Green 函数即逆矩阵', 'Discrete (matrix) form: the Green function is the inverse matrix'), latex: String.raw `\mathbf L\,\mathbf G=\mathbf I\;\Longrightarrow\;\mathbf u=\mathbf G\,\mathbf f,\qquad G_{ij}=\left(\mathbf L^{-1}\right)_{ij}` },
            { name: t('时不变系统的卷积形式', 'Convolution form for time-invariant systems'), latex: String.raw `u(t)=\int_{-\infty}^{\infty}g(t-t')\,f(t')\,\mathrm{d}t'=g*f` },
            { name: t('含初值问题的完整写法', 'Complete form including initial conditions'), latex: String.raw `u=G*f+\text{（齐次解，用于满足初值与边界条件）}` },
            { name: t('互易性', 'Reciprocity'), latex: String.raw `G(\mathbf r,\mathbf r')=G(\mathbf r',\mathbf r)\quad\text{（自伴算子）}` },
        ],
    },
    meaning: t('Green 函数是「算子 L 对单位点源的响应」。一旦知道它，任何源 f 的响应都只是加权叠加（积分或卷积）——这就是线性问题最有力的降维思想：把一个随每次源而变的求解问题，变成一次性的求逆问题。地震学里它是正演与反演的共同语言：正演是 u = Gm，反演就是从 u 里把 m 找回来。', 'The Green function is the response of an operator L to a unit point source. Once it is known, the response to any source f is just a weighted superposition (an integral or a convolution). This is the most powerful dimensionality reduction in linear problems: a problem that changes with every source becomes a one-off inversion of the operator. In seismology it is the shared language of forward modelling and inversion: forward modelling is u = Gm, and inversion is recovering m from u.'),
    symbols: [
        { sym: 'L', name: t('线性微分算子（如 ∇²、波动算子）', 'linear differential operator (e.g. ∇², the wave operator)'), unit: '随问题而定' },
        { sym: 'G(\\mathbf r,\\mathbf r\')', name: t('Green 函数：位于 r′ 的单位点源在 r 处产生的场', 'Green function: field at r from a unit point source at r′'), unit: '随问题而定' },
        { sym: '\\delta(\\mathbf r-\\mathbf r\')', name: t('Dirac δ 函数（单位点源）', 'Dirac delta function (unit point source)'), unit: '1/体积' },
        { sym: 'f(\\mathbf r\')', name: t('源项（体力的空间分布）', 'source term (spatial distribution of the body force)'), unit: '随问题而定' },
        { sym: 'u', name: t('待求的场', 'the field to be found'), unit: '随问题而定' },
        { sym: 'H(t)', name: t('Heaviside 阶跃函数', 'Heaviside step function'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('线性算子 L（叠加原理成立）', 'Linear operator L, so superposition holds'),
            t('边界条件与初值条件齐次，或已通过齐次解单独处理', 'Homogeneous boundary and initial conditions, or handled separately through homogeneous solutions'),
        ],
        assumes: [
            t('介质不随时间变化（时不变）时，G 只依赖差值 t − t′', 'For time-invariant media G depends only on the difference t − t′'),
            t('G 满足与 u 相同的边界条件', 'G satisfies the same boundary conditions as u'),
        ],
        breaks: [
            t('非线性问题没有 Green 函数，只能用 Born 近似或数值求解', 'Nonlinear problems have no Green function; Born approximation or numerical solution is needed'),
            t('复杂边界（自由地表、起伏界面）下 G 无解析形式，须数值计算', 'With complicated boundaries (free surface, topography) G has no closed form and must be computed numerically'),
            t('时变介质中 G(r, t; r′, t′) 不能简化为 t − t′ 的函数', 'In time-varying media G(r, t; r′, t′) cannot be reduced to a function of t − t′'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('待解问题', 'The problem to be solved'),
            latex: String.raw `L\,u=f` },
        { n: 2, op: 'identity', title: t('用 δ 函数的筛选性质把源拆成点源的叠加', 'Use the sifting property of the delta to split the source into point sources'),
            latex: String.raw `f(\mathbf r)=\int \delta(\mathbf r-\mathbf r')\,f(\mathbf r')\,\mathrm{d}\mathbf r'`,
            note: t('这一步是整个思想的支点：任意源 = 无穷多个带权点源的和。', 'This step is the fulcrum of the whole idea: any source is a sum of infinitely many weighted point sources.') },
        { n: 3, op: 'setup', title: t('定义单位点源的响应', 'Define the response to a unit point source'),
            latex: String.raw `L\,G(\mathbf r,\mathbf r')=\delta(\mathbf r-\mathbf r')` },
        { n: 4, op: 'physics', title: t('叠加原理：线性算子对和的响应等于响应的和', 'Superposition: a linear operator applied to a sum gives the sum of responses'),
            latex: String.raw `L\!\left[\int G(\mathbf r,\mathbf r')f(\mathbf r')\,\mathrm{d}\mathbf r'\right]=\int \delta(\mathbf r-\mathbf r')f(\mathbf r')\,\mathrm{d}\mathbf r'=f(\mathbf r)` },
        { n: 5, op: 'result', title: t('于是解就是 Green 函数与源的卷积', 'Hence the solution is the convolution of the Green function with the source'),
            latex: String.raw `u(\mathbf r)=\int G(\mathbf r,\mathbf r')\,f(\mathbf r')\,\mathrm{d}\mathbf r'` },
        { n: 6, op: 'result', title: t('离散化后它就是逆矩阵', 'After discretisation it is simply the inverse matrix'),
            latex: String.raw `\mathbf u=\mathbf L^{-1}\mathbf f=\mathbf G\,\mathbf f`,
            note: t('这一行把「求 Green 函数」和「求逆矩阵」等同起来，也解释了为什么数值正演等价于解一个大型线性系统。', 'This line identifies finding the Green function with inverting a matrix, and explains why numerical forward modelling amounts to solving one large linear system.') },
    ],
    example: {
        title: t('把 Green 函数当作脉冲响应', 'Reading the Green function as an impulse response'),
        input: t('一维阻尼系统 L = d/dt + a，求 G 并用它解 f(t) = e^{−t}H(t)', 'The 1D damped system L = d/dt + a; find G and solve for f(t) = e^{−t}H(t)'),
        steps: [
            t('解 (d/dt + a)g = δ(t)，得 g(t) = e^{−at}H(t)', 'Solve (d/dt + a)g = δ(t) to get g(t) = e^{−at}H(t)'),
            t('卷积：u(t) = ∫₀^t e^{−a(t−τ)}e^{−τ}dτ', 'Convolve: u(t) = ∫₀^t e^{−a(t−τ)}e^{−τ}dτ'),
            t('a ≠ 1 时 u(t) = (e^{−t} − e^{−at})/(a − 1)', 'For a ≠ 1, u(t) = (e^{−t} − e^{−at})/(a − 1)'),
            t('u(0) = 0，符合零初始条件', 'u(0) = 0, consistent with the zero initial condition'),
        ],
        output: t('整个求解过程只做了一次卷积 —— 这就是 Green 函数方法的实际收益：一个脉冲响应，应付所有输入。', 'The whole solution required a single convolution. That is the practical payoff of the Green function method: one impulse response handles every input.'),
    },
    links: {
        downstream: [
            { id: 'helmholtz-green-function', note: t('Helmholtz 算子的具体 Green 函数', 'the explicit Green function of the Helmholtz operator') },
            { id: 'forced-oscillator-green-function', note: t('阻尼振子算子的具体 Green 函数', 'the explicit Green function of the damped oscillator operator') },
        ],
        seealso: [
            { id: 'laplace-transform', note: t('求 G 最常用的工具', 'the most common tool for finding G') },
            { id: 'dalembert-solution', note: t('一维波动方程的 Green 函数形式', 'the Green function form of the 1D wave equation') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.1' },
        { text: 'Morse & Feshbach, Methods of Theoretical Physics, Ch. 7' },
    ],
};
export default greenFunctionDefinition;
//# sourceMappingURL=green-function-definition.js.map