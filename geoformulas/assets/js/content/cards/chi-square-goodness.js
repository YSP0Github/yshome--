import { t } from '../../core/types.js';
/** chi-square-goodness */
const chiSquareGoodness = {
    id: 'chi-square-goodness',
    name: t('卡方拟合优度与自由度', 'Chi-square Goodness of Fit and Degrees of Freedom'),
    aliases: { zh: ['卡方检验', '拟合优度', '约化卡方', '自由度'], en: ['chi-square test', 'goodness of fit', 'reduced chi-square', 'degrees of freedom'] },
    node: 'S0.6',
    tags: {
        math: ['MATH.STAT'],
        method: ['METH.STAT', 'METH.INV'],
        keywords: t('卡方 拟合优度 约化卡方 自由度 残差 假设检验 显著性 p 值', 'chi-square goodness of fit reduced chi-square degrees of freedom residual hypothesis test significance p-value'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\chi^{2}=\sum_{i=1}^{N}\frac{\left(O_{i}-E_{i}\right)^{2}}{\sigma_{i}^{2}},\qquad \nu=N-p`,
        variants: [
            { name: t('约化卡方（每自由度的卡方）', 'Reduced chi-square (per degree of freedom)'), latex: String.raw `\chi_{\nu}^{2}=\frac{\chi^{2}}{\nu},\qquad E\!\left[\chi_{\nu}^{2}\right]=1` },
            { name: t('卡方分布的均值与方差', 'Mean and variance of the chi-square distribution'), latex: String.raw `E[\chi^{2}]=\nu,\qquad \mathrm{Var}(\chi^{2})=2\nu,\qquad \sigma_{\chi^{2}}=\sqrt{2\nu}` },
            { name: t('概率密度（ν 个自由度）', 'Probability density (ν degrees of freedom)'), latex: String.raw `p(x)=\frac{x^{\nu/2-1}e^{-x/2}}{2^{\nu/2}\,\Gamma(\nu/2)}` },
            { name: t('残差形式（地震学常用写法）', 'Residual form (the usual seismological one)'), latex: String.raw `\chi^{2}=\left(\mathbf d-\mathbf g(\mathbf m)\right)^{\mathrm T}\mathbf C_{d}^{-1}\left(\mathbf d-\mathbf g(\mathbf m)\right)` },
            { name: t('与正态残差的关系', 'Relation to normal residuals'), latex: String.raw `z_{i}=\frac{O_{i}-E_{i}}{\sigma_{i}}\sim\mathcal{N}(0,1)\;\Longrightarrow\;\sum_{i}z_{i}^{2}\sim\chi_{\nu}^{2}` },
        ],
    },
    meaning: t('χ² 把「拟合得好不好」压缩成一个数：它是标准化残差的平方和。真正关键的不是 χ² 本身，而是自由度 ν = N − p：因为拟合会消耗 p 个自由度，χ² 的期望恰好等于 ν。所以 χ²_ν ≈ 1 表示残差与假定的噪声水平相符；远大于 1 说明噪声被低估或模型不对；远小于 1 说明噪声被高估或数据被过度平滑。这是检验反演结果是否可信的第一道门槛。', 'χ² compresses the quality of a fit into a single number: the sum of squared standardised residuals. What really matters is not χ² itself but the degrees of freedom ν = N − p, because fitting consumes p degrees of freedom and the expectation of χ² is exactly ν. Hence χ²_ν ≈ 1 means the residuals are consistent with the assumed noise level; much larger than 1 means the noise was underestimated or the model is wrong; much smaller than 1 means the noise was overestimated or the data were over-smoothed. This is the first gate any inversion result must pass to be credible.'),
    symbols: [
        { sym: '\\chi^2', name: t('卡方统计量', 'chi-square statistic'), unit: '1' },
        { sym: 'O_i', name: t('第 i 个观测值', 'the i-th observed value'), unit: '随问题而定' },
        { sym: 'E_i', name: t('第 i 个模型预测值', 'the i-th model prediction'), unit: '随问题而定' },
        { sym: '\\sigma_i', name: t('第 i 个观测的标准差', 'standard deviation of observation i'), unit: '与 O_i 同' },
        { sym: 'N', name: t('数据个数', 'number of data'), unit: '1' },
        { sym: 'p', name: t('自由模型参数个数', 'number of free model parameters'), unit: '1' },
        { sym: '\\nu', name: t('自由度 ν = N − p', 'degrees of freedom ν = N − p'), unit: '1' },
        { sym: '\\Gamma', name: t('Gamma 函数', 'Gamma function'), unit: '1' },
        { sym: '\\mathbf C_d', name: t('数据协方差矩阵', 'data covariance matrix'), unit: '随问题而定' },
    ],
    conditions: {
        applies: [
            t('残差近似正态、且 σ_i 已知（或已可靠估计）', 'Residuals approximately normal with known (or reliably estimated) σ_i'),
            t('模型对参数是线性的，或已局部线性化', 'The model is linear in the parameters, or has been locally linearised'),
        ],
        assumes: [
            t('各数据点的误差相互独立（否则要用协方差矩阵形式）', 'Data errors mutually independent (otherwise use the covariance-matrix form)'),
            t('σ_i 是真值而不是估计值；若 σ 本身由数据估出，分布应改用 F 或 t 分布', 'σ_i are true values rather than estimates; if σ is itself estimated from the data the distribution becomes F or t'),
        ],
        breaks: [
            t('ν 很小（< 5）时 χ²_ν 的分布极宽，单次数值几乎无判别力', 'For small ν (< 5) the spread of χ²_ν is very wide and a single value carries almost no diagnostic power'),
            t('存在粗差时 χ² 会被单主导，应配合稳健统计（L1、Huber）', 'With outliers χ² is dominated by single points; robust statistics (L1, Huber) should be used alongside'),
            t('非线性模型中 ν 的定义变为 ν = N − p_eff，有效参数个数需另行估计', 'In nonlinear models ν becomes N − p_eff and the effective number of parameters must be estimated separately'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('标准化残差', 'Standardised residuals'),
            latex: String.raw `z_{i}=\frac{O_{i}-E_{i}}{\sigma_{i}}\;\sim\;\mathcal{N}(0,1)` },
        { n: 2, op: 'setup', title: t('平方和的分布', 'Distribution of the sum of squares'),
            latex: String.raw `\chi^{2}=\sum_{i=1}^{N}z_{i}^{2}` },
        { n: 3, op: 'identity', title: t('一个标准正态的平方的期望与方差', 'Mean and variance of the square of one standard normal'),
            latex: String.raw `E[z^{2}]=1,\qquad E[z^{4}]=3\;\Longrightarrow\;\mathrm{Var}(z^{2})=2` },
        { n: 4, op: 'substitute', title: t('然而拟合消耗了 p 个自由度', 'But fitting consumes p degrees of freedom'),
            latex: String.raw `E\!\left[\chi^{2}\right]=N-p=\nu,\qquad \mathrm{Var}(\chi^{2})=2\nu`,
            note: t('因为 p 个参数被调整到让残差尽量小，N 个残差中只有 N − p 个是「自由」的。', 'Because p parameters were adjusted to make the residuals as small as possible, only N − p of the N residuals are free.') },
        { n: 5, op: 'transform', title: t('由正态分布导出密度函数', 'Derive the density from the normal distribution'),
            latex: String.raw `p(x)=\frac{x^{\nu/2-1}e^{-x/2}}{2^{\nu/2}\Gamma(\nu/2)}`,
            note: t('ν 很大时它趋于均值 ν、方差 2ν 的正态分布 —— 这就是「约化卡方应接近 1」的定量依据。', 'For large ν it tends to a normal distribution with mean ν and variance 2ν. That is the quantitative basis for expecting a reduced chi-square near 1.') },
        { n: 6, op: 'result', title: t('判据', 'The criterion'),
            latex: String.raw `\chi_{\nu}^{2}=\frac{\chi^{2}}{\nu}\approx 1\ \text{（可接受）},\qquad \sqrt{\frac{2}{\nu}}\ \text{为其 1}\sigma\ \text{波动}` },
    ],
    viz: [
        {
            id: 'chi2-pdf',
            level: 'V1',
            title: t('卡方分布随自由度的变化', 'The chi-square distribution versus degrees of freedom'),
            xlabel: t('χ²', 'χ²'),
            ylabel: t('概率密度 p(χ²)', 'probability density p(χ²)'),
            controls: [
                { id: 'nu', label: t('自由度 ν', 'degrees of freedom ν'), min: 1, max: 40, step: 1, value: 10, unit: '1' },
            ],
            xRange: [0, 60],
            note: t('ν 增大时分布向右平移并逐渐变对称（趋于正态）。峰在 ν − 2 处，均值在 ν 处 —— 自由度越大，χ² 越集中在 ν 附近，「χ²_ν ≈ 1」的判据也越有判别力。', 'As ν grows the distribution shifts right and becomes symmetric (tending to normal). The peak sits at ν − 2 while the mean sits at ν. The larger the degrees of freedom the more tightly χ² concentrates near ν, and the more discriminating the χ²_ν ≈ 1 criterion becomes.'),
            compute: (p) => {
                const nu = Math.max(1, Math.round(p['nu']));
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const x = 0.02 + (i / 600) * 60;
                    const lg = ((nu / 2 - 1) * Math.log(x)) - x / 2 - (nu / 2) * Math.LN2 - lgamma(nu / 2);
                    pts.push([x, Math.exp(lg)]);
                }
                const mean = [];
                for (let i = 0; i <= 60; i++)
                    mean.push([nu, (i / 60) * chiPdf(nu, nu)]);
                return [
                    { label: t(`ν = ${nu} 的卡方分布`, `chi-square with ν = ${nu}`), color: '#185FA5', points: pts },
                    { label: t('均值 χ² = ν', 'mean χ² = ν'), color: '#BA7517', dash: true, points: mean },
                ];
            },
        },
        {
            id: 'reduced-chi2-vs-sigma',
            level: 'V1',
            title: t('用 χ²_ν = 1 反推噪声水平', 'Recovering the noise level from χ²_ν = 1'),
            xlabel: t('假定的噪声标准差 σ', 'assumed noise standard deviation σ'),
            ylabel: t('约化卡方 χ²_ν', 'reduced chi-square χ²_ν'),
            controls: [
                { id: 'pp', label: t('模型参数个数 p', 'number of model parameters p'), min: 1, max: 20, step: 1, value: 4, unit: '1' },
            ],
            xRange: [0.05, 1.2],
            yRange: [0, 12],
            note: t('固定 40 个残差（真噪声 0.30）时，χ²_ν 随假定的 σ 迅速下降。它与 1 的交点就是数据自洽的噪声估计 —— 这是反演前标定 σ 的标准做法。', 'With 40 fixed residuals (true noise 0.30), χ²_ν drops rapidly as the assumed σ increases. Its crossing with 1 is the noise estimate consistent with the data, the standard way to calibrate σ before an inversion.'),
            compute: (p) => {
                const pp = Math.max(1, Math.round(p['pp']));
                const N = 40;
                const ssr = 3.6;
                const nu = Math.max(1, N - pp);
                const curve = [];
                for (let i = 0; i <= 400; i++) {
                    const sg = 0.05 + (i / 400) * 1.15;
                    curve.push([sg, ssr / (sg * sg) / nu]);
                }
                const one = [];
                for (let i = 0; i <= 400; i++)
                    one.push([0.05 + (i / 400) * 1.15, 1]);
                return [
                    { label: t('χ²_ν(σ)', 'χ²_ν(σ)'), color: '#0F6E56', points: curve },
                    { label: t('目标值 1', 'target value 1'), color: '#B4B2A9', dash: true, points: one },
                ];
            },
        },
    ],
    example: {
        title: t('一次反演结果是否可信', 'Is an inversion result credible'),
        input: t('N = 200 个数据，p = 12 个参数，加权残差平方和 χ² = 260', 'N = 200 data, p = 12 parameters, weighted sum of squared residuals χ² = 260'),
        steps: [
            t('ν = 200 − 12 = 188', 'ν = 200 − 12 = 188'),
            t('χ²_ν = 260/188 = 1.38', 'χ²_ν = 260/188 = 1.38'),
            t('1σ 波动 √(2/ν) = √(2/188) = 0.103', 'The 1σ fluctuation is √(2/ν) = √(2/188) = 0.103'),
            t('1.38 比 1 高出约 3.7 个 σ', '1.38 exceeds 1 by about 3.7 σ'),
        ],
        output: t('显著偏高：要么噪声被低估约 √1.38 ≈ 1.18 倍，要么模型还有系统性偏差。应当检查残差是否还有结构。', 'Significantly high: either the noise was underestimated by about √1.38 ≈ 1.18, or the model still has a systematic bias. Check the residuals for remaining structure.'),
    },
    links: {
        upstream: [
            { id: 'gaussian-distribution', note: t('正态残差的平方和才是卡方', 'the sum of squared normal residuals is chi-square') },
        ],
        seealso: [
            { id: 'maximum-likelihood-estimation', note: t('高斯噪声下 χ² 就是 −2 ln L', 'under Gaussian noise χ² is −2 ln L') },
            { id: 'damped-least-squares', note: t('反演的目标函数常写成 χ² + 正则项', 'inversion objectives are often written as χ² plus a regularisation term') },
        ],
    },
    refs: [
        { text: 'Bevington & Robinson, Data Reduction and Error Analysis, Ch. 10' },
        { text: 'Menke, Geophysical Data Analysis: Discrete Inverse Techniques, Ch. 9' },
    ],
};
function lgamma(x) {
    const g = [
        676.5203681218851, -1259.1392167224028, 771.3234287776531,
        -176.6150291621406, 12.507343278686905, -0.13857109526572012,
        9.984369578019572e-6, 1.5056327351493116e-7,
    ];
    if (x < 0.5)
        return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    const z = x - 1;
    let a = 0.9999999999998099;
    for (let i = 0; i < g.length; i++)
        a += g[i] / (z + i + 1);
    const tt = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(tt) - tt + Math.log(a);
}
function chiPdf(nu, x) {
    if (x <= 0)
        return 0;
    const lg = (nu / 2 - 1) * Math.log(x) - x / 2 - (nu / 2) * Math.LN2 - lgamma(nu / 2);
    return Math.exp(lg);
}
export default chiSquareGoodness;
//# sourceMappingURL=chi-square-goodness.js.map