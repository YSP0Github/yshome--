import { t } from '../../core/types.js';
/** model-covariance-matrix */
const modelCovarianceMatrix = {
    id: 'model-covariance-matrix',
    name: t('模型协方差与误差椭球', 'Model Covariance & the Error Ellipsoid'),
    aliases: { zh: ['模型协方差', '误差椭球', '参数相关性'], en: ['model covariance', 'error ellipsoid', 'parameter correlation'] },
    node: 'S10.5',
    tags: {
        math: ['MATH.LINALG', 'MATH.STAT'],
        method: ['METH.INV'],
        quantity: ['Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\mathbf{C}_m = (\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\mathbf{G} + \mathbf{C}_{m_0}^{-1})^{-1},\qquad
\rho_{ij} = \frac{C_{ij}}{\sqrt{C_{ii}C_{jj}}}`,
        variants: [
            { name: t('线性高斯情形下的后验', 'Posterior in the linear Gaussian case'), latex: String.raw `p(\mathbf{m}\mid\mathbf{d}) \propto \exp\!\left(-\frac{1}{2}(\mathbf{m}-\hat{\mathbf{m}})^{\mathsf{T}}\mathbf{C}_m^{-1}(\mathbf{m}-\hat{\mathbf{m}})\right)` },
            { name: t('误差椭球的半轴', 'Semi-axes of the error ellipsoid'), latex: String.raw `a_k = \sqrt{\lambda_k(\mathbf{C}_m)},\qquad \text{方向为对应特征向量}` },
            { name: t('置信区域', 'Confidence region'), latex: String.raw `(\mathbf{m}-\hat{\mathbf{m}})^{\mathsf{T}}\mathbf{C}_m^{-1}(\mathbf{m}-\hat{\mathbf{m}}) \le \chi^{2}_{p}(1-\alpha)` },
            { name: t('参数线性组合的方差', 'Variance of a linear combination'), latex: String.raw `\mathrm{Var}(\mathbf{w}^{\mathsf{T}}\mathbf{m}) = \mathbf{w}^{\mathsf{T}}\mathbf{C}_m\mathbf{w}` },
        ],
    },
    meaning: t('反演给出的不只是一个模型，还有一个「这个模型有多不可信」的度量。模型协方差矩阵的对角元给出每个参数的标准差，非对角元给出参数之间的相关性 —— 后者往往更致命：比如地震定位中的深度与发震时刻高度相关（更深的源 + 更晚的起始时间产生几乎相同的走时），这种 trade-off 在方差上表现为一个被拉长、倾斜的误差椭球。只报标准差而不报相关性，等于隐藏了一半的不确定性。', 'An inversion produces not just a model but a measure of how untrustworthy it is. The diagonal of the model covariance gives each parameter\'s standard deviation; the off-diagonals give correlations between parameters — and the latter are often more damaging. In earthquake location, for example, depth and origin time are strongly correlated (a deeper source plus a later origin time gives nearly identical travel times); that trade-off appears as a stretched, tilted error ellipsoid. Reporting standard deviations without correlations hides half the uncertainty.'),
    symbols: [
        { sym: '\\mathbf{C}_m', name: t('模型后验协方差矩阵', 'model posterior covariance matrix'), unit: '—' },
        { sym: '\\mathbf{C}_d', name: t('数据协方差矩阵', 'data covariance matrix'), unit: '—' },
        { sym: '\\mathbf{C}_{m_0}', name: t('先验模型协方差', 'prior model covariance'), unit: '—' },
        { sym: '\\rho_{ij}', name: t('第 i、j 个参数的相关系数', 'correlation coefficient between parameters i and j'), unit: '无量纲' },
        { sym: '\\lambda_k', name: t('协方差矩阵的第 k 个特征值', 'k-th eigenvalue of the covariance matrix'), unit: '—' },
    ],
    conditions: {
        applies: [t('反演结果的误差评估、实验设计、参数可分辨性分析', 'Error assessment of inversion results, experimental design, parameter resolvability analysis')],
        assumes: [t('线性（或已线性化）且误差为高斯', 'Linear (or linearised) with Gaussian errors')],
        breaks: [t('强非线性时协方差矩阵只是局部近似', 'Under strong nonlinearity the covariance is only a local approximation'), t('约束（如非负性）使后验偏离椭圆', 'Constraints such as non-negativity make the posterior non-elliptical')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('高斯先验与高斯似然', 'Gaussian prior and Gaussian likelihood'), latex: String.raw `p(\mathbf{m}) \propto e^{-\frac{1}{2}(\mathbf{m}-\mathbf{m}_0)^{\mathsf{T}}\mathbf{C}_{m_0}^{-1}(\mathbf{m}-\mathbf{m}_0)}` },
        { n: 2, op: 'identity', title: t('后验正比于似然 × 先验', 'The posterior is proportional to likelihood times prior'), latex: String.raw `p(\mathbf{m}\mid\mathbf{d}) \propto p(\mathbf{d}\mid\mathbf{m})p(\mathbf{m})` },
        { n: 3, op: 'algebra', title: t('指数部分合并为二次型', 'The exponent combines into a quadratic form'), latex: String.raw `\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\mathbf{G} + \mathbf{C}_{m_0}^{-1}` },
        { n: 4, op: 'identity', title: t('二次型的逆即协方差', 'The inverse of the quadratic form is the covariance'), latex: String.raw `\mathbf{C}_m = (\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\mathbf{G}+\mathbf{C}_{m_0}^{-1})^{-1}` },
        { n: 5, op: 'result', title: t('标准化得到相关系数', 'Normalise to obtain correlation coefficients'), latex: String.raw `\rho_{ij} = \frac{C_{ij}}{\sqrt{C_{ii}C_{jj}}}` },
    ],
    viz: [
        {
            id: 'ellipsoid',
            level: 'V2',
            title: t('二维误差椭球与参数相关性', 'Two-dimensional error ellipsoid and parameter correlation'),
            xlabel: t('参数 m₁', 'parameter m₁'),
            ylabel: t('参数 m₂', 'parameter m₂'),
            controls: [
                { id: 's1', label: t('σ₁', 'σ₁'), min: 0.2, max: 3, step: 0.05, value: 1 },
                { id: 's2', label: t('σ₂', 'σ₂'), min: 0.2, max: 3, step: 0.05, value: 1.5 },
                { id: 'rho', label: t('相关系数 ρ', 'correlation ρ'), min: -0.95, max: 0.95, step: 0.01, value: 0.8 },
                { id: 'nsig', label: t('置信水平 (σ)', 'confidence level (σ)'), min: 1, max: 3, step: 0.1, value: 2 },
            ],
            note: t('ρ 越大，椭球越扁越斜 —— 单个参数的边际方差看起来很大，但沿「长轴方向」的组合约束得很好。这正是「深度与发震时刻」这类 trade-off 的几何图像：你无法确定其中任何一个，但可以确定它们的某个线性组合。', 'Larger ρ makes the ellipsoid flatter and more tilted — the marginal variance of each parameter looks large, yet the combination along the "long axis" is well constrained. This is exactly the geometry of trade-offs such as depth versus origin time: neither can be determined individually, but some linear combination of them can.'),
            compute: (p) => {
                const s1 = p['s1'], s2 = p['s2'], rho = p['rho'], ns = p['nsig'];
                const c11 = s1 * s1, c22 = s2 * s2, c12 = rho * s1 * s2;
                const det = Math.max(c11 * c22 - c12 * c12, 1e-9);
                const i11 = c22 / det, i22 = c11 / det, i12 = -c12 / det;
                const C = ns * ns;
                const pts = [];
                for (let k = 0; k <= 200; k++) {
                    const th = (k / 200) * 2 * Math.PI;
                    // 沿二次型边界求解半径
                    const q = i11 * Math.cos(th) * Math.cos(th) + 2 * i12 * Math.cos(th) * Math.sin(th) + i22 * Math.sin(th) * Math.sin(th);
                    const r = Math.sqrt(C / Math.max(q, 1e-12));
                    pts.push([r * Math.cos(th), r * Math.sin(th)]);
                }
                // 主轴方向
                const tr = c11 + c22;
                const disc = Math.sqrt(Math.max((c11 - c22) * (c11 - c22) + 4 * c12 * c12, 0));
                const l1 = (tr + disc) / 2, l2 = (tr - disc) / 2;
                const ang = 0.5 * Math.atan2(2 * c12, c11 - c22);
                const ax1 = [[-Math.sqrt(l1) * ns * Math.cos(ang), -Math.sqrt(l1) * ns * Math.sin(ang)], [Math.sqrt(l1) * ns * Math.cos(ang), Math.sqrt(l1) * ns * Math.sin(ang)]];
                const ax2 = [[-Math.sqrt(l2) * ns * -Math.sin(ang), -Math.sqrt(l2) * ns * Math.cos(ang)], [Math.sqrt(l2) * ns * -Math.sin(ang), Math.sqrt(l2) * ns * Math.cos(ang)]];
                return [
                    { label: t('误差椭球边界', 'error ellipsoid boundary'), color: '#185FA5', points: pts },
                    { label: t('长轴（约束最差的方向）', 'long axis (worst-constrained direction)'), color: '#993C1D', points: ax1 },
                    { label: t('短轴（约束最好的方向）', 'short axis (best-constrained direction)'), color: '#0F6E56', points: ax2 },
                ];
            },
        },
    ],
    example: {
        title: t('震源深度与发震时刻的 trade-off', 'Depth–origin-time trade-off'),
        input: t('σ_h = 5 km，σ_t0 = 1.2 s，ρ = −0.9', 'σ_h = 5 km, σ_t0 = 1.2 s, ρ = −0.9'),
        steps: [
            t('协方差矩阵 [[25, −5.4], [−5.4, 1.44]]', 'Covariance [[25, −5.4], [−5.4, 1.44]]'),
            t('长轴半轴约 5.05 km，短轴半轴约 0.34 s', 'Long semi-axis about 5.05 km, short semi-axis about 0.34 s'),
        ],
        output: t('深度的绝对误差达 5 km，但「深度 − 4.2 km/s × 时刻」这个组合约束到 0.34 km', 'Absolute depth error reaches 5 km, but the combination "depth − 4.2 km/s × time" is constrained to 0.34 km'),
    },
    links: {
        upstream: [
            { id: 'damped-least-squares', note: t('阻尼解对应高斯先验', 'The damped solution corresponds to a Gaussian prior') },
            { id: 'error-propagation', note: t('误差传播是协方差的来源', 'Error propagation is the source of covariance') },
        ],
        downstream: [{ id: 'resolution-matrix', note: t('分辨率矩阵衡量的是另一件事', 'The resolution matrix measures something else') }],
        seealso: [{ id: 'metropolis-hastings-mcmc', note: t('非线性问题时用采样代替解析协方差', 'For nonlinear problems use sampling instead of analytic covariance') }],
    },
    refs: [{ text: 'Tarantola, Inverse Problem Theory and Methods for Model Parameter Estimation, Ch. 3' }],
};
export default modelCovarianceMatrix;
//# sourceMappingURL=model-covariance-matrix.js.map