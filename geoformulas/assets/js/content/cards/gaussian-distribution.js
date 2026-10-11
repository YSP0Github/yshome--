import { t } from '../../core/types.js';
/** gaussian-distribution */
const gaussianDistribution = {
    id: 'gaussian-distribution',
    name: t('高斯（正态）分布', 'The Gaussian (Normal) Distribution'),
    aliases: { zh: ['正态分布', '高斯分布', '钟形曲线'], en: ['normal distribution', 'Gaussian distribution', 'bell curve'] },
    node: 'S0.6',
    tags: {
        math: ['MATH.STAT'],
        method: ['METH.STAT'],
        keywords: t('正态分布 高斯 均值 方差 标准差 中心极限定理 68-95-99.7 误差函数', 'normal distribution Gaussian mean variance standard deviation central limit theorem empirical rule error function'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `p(x)=\frac{1}{\sigma\sqrt{2\pi}}\,\exp\!\left[-\frac{(x-\mu)^{2}}{2\sigma^{2}}\right]`,
        variants: [
            { name: t('标准正态分布', 'Standard normal distribution'), latex: String.raw `z=\frac{x-\mu}{\sigma},\qquad \phi(z)=\frac{1}{\sqrt{2\pi}}e^{-z^{2}/2}` },
            { name: t('累积分布函数', 'Cumulative distribution function'), latex: String.raw `P(X\le x)=\Phi\!\left(\frac{x-\mu}{\sigma}\right)=\frac{1}{2}\left[1+\operatorname{erf}\!\left(\frac{x-\mu}{\sigma\sqrt{2}}\right)\right]` },
            { name: t('68–95–99.7 经验法则', 'The 68–95–99.7 empirical rule'), latex: String.raw `P(|X-\mu|<\sigma)=0.683,\quad P(|X-\mu|<2\sigma)=0.954,\quad P(|X-\mu|<3\sigma)=0.997` },
            { name: t('多维情形', 'Multivariate case'), latex: String.raw `p(\mathbf x)=\frac{1}{(2\pi)^{n/2}|\boldsymbol\Sigma|^{1/2}}\exp\!\left[-\frac{1}{2}(\mathbf x-\boldsymbol\mu)^{\mathrm T}\boldsymbol\Sigma^{-1}(\mathbf x-\boldsymbol\mu)\right]` },
            { name: t('中心极限定理（为什么到处都是它）', 'Central limit theorem (why it appears everywhere)'), latex: String.raw `\frac{1}{\sqrt{N}}\sum_{i=1}^{N}\frac{X_{i}-\mu}{\sigma}\;\xrightarrow{\;N\to\infty\;}\;\mathcal{N}(0,1)` },
        ],
    },
    meaning: t('高斯分布是「许多独立小扰动叠加」的必然结果（中心极限定理），因此它几乎是测量误差的默认模型。地震学里到时拾取误差、速度模型扰动、噪声背景，通常都先假设为正态，再由此导出最小二乘、极大似然与误差传播。只要前两阶矩（均值、方差）就完全确定一个正态分布，这是它无比好用的根本原因。', 'The Gaussian distribution is the inevitable outcome of adding many independent small perturbations (the central limit theorem), which makes it the default model for measurement error. Arrival-time picking errors, velocity-model perturbations and ambient noise in seismology are usually assumed normal at the outset, and least squares, maximum likelihood and error propagation all follow from that assumption. The fact that the first two moments (mean and variance) completely determine a normal distribution is the fundamental reason it is so convenient.'),
    symbols: [
        { sym: 'p(x)', name: t('概率密度', 'probability density'), unit: '1/x 的单位' },
        { sym: '\\mu', name: t('均值（期望）', 'mean (expectation)'), unit: '与 x 同' },
        { sym: '\\sigma', name: t('标准差', 'standard deviation'), unit: '与 x 同' },
        { sym: '\\sigma^2', name: t('方差', 'variance'), unit: 'x 单位的平方' },
        { sym: '\\Phi', name: t('标准正态累积分布函数', 'standard normal cumulative distribution function'), unit: '1' },
        { sym: '\\operatorname{erf}', name: t('误差函数', 'error function'), unit: '1' },
        { sym: '\\boldsymbol\\Sigma', name: t('协方差矩阵', 'covariance matrix'), unit: 'x 单位的平方' },
        { sym: 'z', name: t('标准化变量（偏离均值的 σ 数）', 'standardised variable (deviation in units of σ)'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('连续型随机变量的误差建模', 'Error modelling of continuous random variables'),
            t('误差由许多独立、同量级的小来源叠加而成', 'The error arises from many independent, comparable small contributions'),
        ],
        assumes: [
            t('各误差来源相互独立且方差有限', 'Error sources are mutually independent with finite variance'),
            t('分布对称、单峰，由均值和方差完全描述', 'The distribution is symmetric and unimodal, fully described by mean and variance'),
        ],
        breaks: [
            t('存在粗差（outlier）时尾部远比高斯厚，最小二乘会被单点带偏', 'With outliers the tails are much heavier than Gaussian and least squares is dragged by single points'),
            t('严格正定的量（如 Q、震级增量）在接近零时不能正态，宜用对数正态', 'Strictly positive quantities (Q, magnitude increments) cannot be normal near zero; a log-normal is preferable'),
            t('离散计数（地震个数）服从 Poisson 而非正态（除非计数值很大）', 'Discrete counts (number of earthquakes) follow a Poisson law rather than a normal one, unless the counts are large'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('两个独立的合理要求', 'Two independent, reasonable requirements'),
            latex: String.raw `\text{(i) 误差只依赖 }|x|;\qquad \text{(ii) 两个独立误差的联合概率可分解为 }p(x)p(y)`,
            note: t('第一条来自对称性（正负误差同等可能），第二条来自独立性。', 'The first follows from symmetry (positive and negative errors equally likely), the second from independence.') },
        { n: 2, op: 'setup', title: t('在极坐标下写出径向不变性', 'Write radial invariance in polar coordinates'),
            latex: String.raw `p(x)p(y)=g\!\left(\sqrt{x^{2}+y^{2}}\right)` },
        { n: 3, op: 'identity', title: t('取对数并对 x 求导', 'Take logarithms and differentiate with respect to x'),
            latex: String.raw `\frac{p'(x)}{p(x)}\cdot\frac{1}{x}=\text{常数}=-2a`,
            note: t('左边只依赖 x、右边（由对称性）只依赖 r，故只能是常数 —— 这是函数方程的标准解法。', 'The left side depends only on x and the right only on r, so both equal a constant. This is the standard way to solve such functional equations.') },
        { n: 4, op: 'algebra', title: t('解微分方程', 'Solve the differential equation'),
            latex: String.raw `\frac{p'}{p}=-2ax\;\Longrightarrow\; \ln p=-ax^{2}+C\;\Longrightarrow\; p(x)=A\,e^{-ax^{2}}` },
        { n: 5, op: 'identity', title: t('归一化定出 A', 'Normalisation fixes A'),
            latex: String.raw `\int_{-\infty}^{\infty}A e^{-ax^{2}}\mathrm{d}x=A\sqrt{\frac{\pi}{a}}=1\;\Longrightarrow\; A=\sqrt{\frac{a}{\pi}}` },
        { n: 6, op: 'result', title: t('用方差标定 a，得到标准形式', 'Calibrate a by the variance to get the standard form'),
            latex: String.raw `\sigma^{2}=\frac{1}{2a}\;\Longrightarrow\; p(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^{2}}{2\sigma^{2}}}` },
    ],
    viz: [
        {
            id: 'gaussian-pdf',
            level: 'V1',
            title: t('概率密度：均值决定位置，标准差决定宽度', 'Density: the mean sets the location, the standard deviation the width'),
            xlabel: t('x', 'x'),
            ylabel: t('概率密度 p(x)', 'probability density p(x)'),
            controls: [
                { id: 'mu', label: t('均值 μ', 'mean μ'), min: -3, max: 3, step: 0.1, value: 0, unit: '1' },
                { id: 'sg', label: t('标准差 σ', 'standard deviation σ'), min: 0.2, max: 3, step: 0.05, value: 1, unit: '1' },
            ],
            xRange: [-8, 8],
            note: t('σ 减半时峰高加倍：密度曲线下的面积必须恒为 1。峰高 1/(σ√(2π)) 正比于 1/σ。', 'Halving σ doubles the peak height because the area under the density must stay equal to 1. The peak 1/(σ√(2π)) is proportional to 1/σ.'),
            compute: (p) => {
                const mu = p['mu'], sg = Math.max(0.05, p['sg']);
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const x = -8 + (i / 600) * 16;
                    const z = (x - mu) / sg;
                    pts.push([x, Math.exp(-0.5 * z * z) / (sg * Math.sqrt(2 * Math.PI))]);
                }
                return [{ label: t('p(x)', 'p(x)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'gaussian-cdf',
            level: 'V1',
            title: t('累积分布与经验法则', 'Cumulative distribution and the empirical rule'),
            xlabel: t('偏离均值的 σ 数', 'deviation in units of σ'),
            ylabel: t('P(X ≤ x)', 'P(X ≤ x)'),
            controls: [
                { id: 'k', label: t('分位点（以 σ 计）', 'quantile level (in σ)'), min: -3, max: 3, step: 0.05, value: 1, unit: 'σ' },
            ],
            xRange: [-4, 4],
            yRange: [0, 1],
            note: t('±1σ 覆盖 68.3%、±2σ 覆盖 95.4%、±3σ 覆盖 99.7%。地震定位给出的「1σ 误差椭圆」就是这个含义：真值有约 68% 的概率落在里面。', '±1σ covers 68.3%, ±2σ covers 95.4%, ±3σ covers 99.7%. A "1σ error ellipse" in earthquake location means exactly this: the true location lies inside it with about 68% probability.'),
            compute: (p) => {
                const k = p['k'];
                const cdf = [];
                for (let i = 0; i <= 600; i++) {
                    const z = -4 + (i / 600) * 8;
                    cdf.push([z, 0.5 * (1 + erf(z / Math.SQRT2))]);
                }
                const marker = [];
                const yv = 0.5 * (1 + erf(k / Math.SQRT2));
                for (let i = 0; i <= 100; i++) {
                    marker.push([k, (i / 100) * yv]);
                }
                return [
                    { label: t('Φ(z)', 'Φ(z)'), color: '#0F6E56', points: cdf },
                    { label: t('当前分位点', 'current quantile'), color: '#BA7517', dash: true, points: marker },
                ];
            },
        },
    ],
    example: {
        title: t('到时拾取误差的概率', 'Probability of an arrival-time picking error'),
        input: t('拾取误差服从 μ = 0、σ = 0.05 s 的正态分布，问误差超过 0.1 s 的概率', 'Picking error is normal with μ = 0 and σ = 0.05 s; probability that it exceeds 0.1 s'),
        steps: [
            t('标准化：z = 0.1/0.05 = 2', 'Standardise: z = 0.1/0.05 = 2'),
            t('P(|z| > 2) = 2[1 − Φ(2)] = 2(1 − 0.9772) = 0.0456', 'P(|z| > 2) = 2[1 − Φ(2)] = 2(1 − 0.9772) = 0.0456'),
        ],
        output: t('约 4.6% 的拾取误差会超过 0.1 s。若一次定位用了 20 个到时，平均就有一个这样的「坏点」—— 这正是需要稳健加权的原因。', 'About 4.6% of picks err by more than 0.1 s. With 20 arrivals in one location there will be roughly one such bad pick on average, which is exactly why robust weighting is needed.'),
    },
    links: {
        downstream: [
            { id: 'maximum-likelihood-estimation', note: t('正态假设下的似然函数', 'the likelihood function under a normal assumption') },
            { id: 'chi-square-goodness', note: t('正态残差的平方和服从卡方分布', 'the sum of squared normal residuals is chi-square') },
        ],
        seealso: [
            { id: 'error-propagation', note: t('方差如何传递到导出量', 'how variance propagates to derived quantities') },
            { id: 'covariance-correlation', note: t('多维情形的二阶矩', 'second moments in the multivariate case') },
        ],
    },
    refs: [
        { text: 'Tarantola, Inverse Problem Theory, §2.3' },
        { text: 'Menke, Geophysical Data Analysis: Discrete Inverse Techniques, Ch. 2' },
    ],
};
function erf(x) {
    const s = Math.sign(x);
    const ax = Math.abs(x);
    const tt = 1 / (1 + 0.3275911 * ax);
    const y = 1 - ((((1.061405429 * tt - 1.453152027) * tt + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-ax * ax);
    return s * y;
}
export default gaussianDistribution;
//# sourceMappingURL=gaussian-distribution.js.map