import { t } from '../../core/types.js';
/** dispersion-curve-inversion */
const dispersionCurveInversion = {
    id: 'dispersion-curve-inversion',
    name: t('频散曲线反演与非唯一性', 'Dispersion-curve Inversion & Non-uniqueness'),
    aliases: { zh: ['频散反演', '面波反演', 'Vs 剖面'], en: ['dispersion inversion', 'surface-wave inversion', 'Vs profile'] },
    node: 'S5.3',
    tags: {
        math: ['MATH.STAT', 'MATH.ROOT'],
        method: ['METH.SURF', 'METH.INV'],
        quantity: ['Q.VEL', 'Q.GEOM'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\hat{\mathbf{m}} = \arg\min_{\mathbf{m}}\sum_{j}\left(\frac{c^{\text{obs}}(T_j)-c^{\text{syn}}(T_j;\mathbf{m})}{\sigma_j}\right)^{2}
+ \lambda\|\mathbf{L}\mathbf{m}\|^{2}`,
        variants: [
            { name: t('线性化的灵敏度', 'Linearised sensitivity'), latex: String.raw `\delta c(T_j) = \sum_k \frac{\partial c(T_j)}{\partial V_S(z_k)}\,\delta V_S(z_k)` },
            { name: t('灵敏度核随周期变化（穿透深度）', 'The sensitivity kernel varies with period (penetration depth)'), latex: String.raw `z_{\text{敏感}} \approx \frac{\lambda}{3} \approx \frac{c\,T}{3}` },
            { name: t('等效半波长经验法则', 'Equivalent half-wavelength rule of thumb'), latex: String.raw `z_{\max} \approx \frac{\lambda}{2} = \frac{cT}{2}` },
            { name: t('非唯一性：不同模型给出近乎相同的频散曲线', 'Non-uniqueness: different models give nearly identical dispersion curves'), latex: String.raw `\|\mathbf{m}_1 - \mathbf{m}_2\| \gg 0\ \text{但}\ \|c(\mathbf{m}_1)-c(\mathbf{m}_2)\| < \sigma` },
        ],
    },
    meaning: t('从面波频散曲线反推 Vs 剖面，是浅地表与岩石圈成像的主力方法。它的物理基础很直观：长周期面波「感觉」得深、短周期「感觉」得浅，因此一条频散曲线就编码了整个深度剖面的平均信息。但反演是严重非唯一的 —— 速度与厚度的组合可以互换而不改变频散曲线。这就是为什么必须加正则化（或先验约束层厚、密度、Vp/Vs），也是为什么频散反演的结果常被表述为一个模型集合而非单个模型。', 'Inverting surface-wave dispersion curves for a Vs profile is the workhorse of near-surface and lithospheric imaging. Its physical basis is intuitive: long-period surface waves "feel" deep and short-period ones shallow, so a single dispersion curve encodes average information about the whole depth profile. But the inversion is severely non-unique — velocity and thickness combinations can trade off without changing the dispersion curve. That is why regularization (or prior constraints on thickness, density and Vp/Vs) is mandatory, and why dispersion-inversion results are often reported as an ensemble of models rather than a single one.'),
    symbols: [
        { sym: 'c(T)', name: t('周期 T 处的相速度', 'phase velocity at period T'), unit: 'km/s' },
        { sym: '\\mathbf{m}', name: t('模型参数（各层 Vs 与厚度）', 'model parameters (Vs and thickness of each layer)'), unit: '—' },
        { sym: '\\sigma_j', name: t('频散测量的标准差', 'standard deviation of the dispersion measurement'), unit: 'km/s' },
        { sym: 'z_{\\text{敏感}}', name: t('敏感深度', 'sensitive depth'), unit: 'km' },
    ],
    conditions: {
        applies: [t('近地表 Vs30 测定、地壳上地幔 Vs 成像、背景噪声与主动源面波', 'Near-surface Vs30 determination, crustal and upper-mantle Vs imaging, ambient-noise and active-source surface waves')],
        assumes: [t('水平层状介质、频散曲线已正确提取（含模态识别）', 'Horizontally layered media; the dispersion curve is correctly extracted (including mode identification)')],
        breaks: [t('高阶模被误认为基阶模时反演结果完全错误', 'Higher modes mistaken for the fundamental mode make the result entirely wrong'), t('横向变化剧烈时一维假设不成立', 'The 1-D assumption fails under strong lateral variability')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('正演：给定层状模型求频散曲线', 'Forward: compute the dispersion curve for a layered model'), latex: String.raw `c(T) = c(T;\mathbf{m})` },
        { n: 2, op: 'physics', title: t('长周期对应深部，短周期对应浅部', 'Long periods sample deep, short periods shallow'), latex: String.raw `z_{\text{敏感}} \approx \frac{cT}{3}` },
        { n: 3, op: 'taylor', title: t('在当前模型处线性化', 'Linearise about the current model'), latex: String.raw `\delta c_j = \sum_k G_{jk}\,\delta m_k,\quad G_{jk} = \frac{\partial c_j}{\partial m_k}` },
        { n: 4, op: 'algebra', title: t('带阻尼的最小二乘迭代', 'Damped least-squares iteration'), latex: String.raw `\delta\mathbf{m} = (\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\mathbf{G}+\lambda^{2}\mathbf{L}^{\mathsf{T}}\mathbf{L})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\delta\mathbf{c}` },
        { n: 5, op: 'result', title: t('迭代至收敛，得到 Vs(z)', 'Iterate to convergence to obtain Vs(z)'), latex: String.raw `\mathbf{m} \leftarrow \mathbf{m}+\delta\mathbf{m}` },
    ],
    viz: [
        {
            id: 'disp-sens',
            level: 'V2',
            title: t('不同周期的面波敏感深度', 'Sensitive depth of surface waves at different periods'),
            xlabel: t('深度 z (km)', 'depth z (km)'),
            ylabel: t('相对灵敏度', 'relative sensitivity'),
            controls: [
                { id: 'T', label: t('周期 T (s)', 'period T (s)'), min: 0.2, max: 120, step: 0.2, value: 10 },
                { id: 'c', label: t('相速度 c (km/s)', 'phase velocity c (km/s)'), min: 0.3, max: 4.5, step: 0.02, value: 2.5 },
            ],
            note: t('灵敏度峰的深度约为 cT/3。周期从 1 s 变到 100 s，敏感深度从几百米变到近百公里 —— 这就是为什么「想要多深就要多长的周期」。反演的垂向分辨率直接由可用周期范围决定。', 'The sensitivity peak depth is about cT/3. Going from 1 s to 100 s moves the sensitive depth from a few hundred metres to nearly a hundred kilometres — which is why "how deep you want determines how long a period you need". Vertical resolution is set directly by the available period range.'),
            compute: (p) => {
                const T = p['T'], c = p['c'];
                const lam = c * T;
                const zc = lam / 3;
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const z = (i / 300) * Math.max(4 * zc, 1);
                    const u = z / zc;
                    const v = u > 0 ? Math.pow(u, 1.6) * Math.exp(-1.6 * (u - 1)) : 0;
                    pts.push([z, v]);
                }
                const mx = Math.max(...pts.map((q) => q[1]), 1e-9);
                return [{ label: t('灵敏度（峰值深度 ≈ ' + zc.toFixed(2) + ' km）', 'sensitivity (peak depth ≈ ' + zc.toFixed(2) + ' km)'), color: '#185FA5', points: pts.map(([x, y]) => [x, y / mx]) }];
            },
        },
        {
            id: 'disp-nonuniq',
            level: 'V2',
            title: t('非唯一性：两个模型给出几乎相同的频散曲线', 'Non-uniqueness: two models give almost identical dispersion curves'),
            xlabel: t('周期 T (s)', 'period T (s)'),
            ylabel: t('相速度 c (km/s)', 'phase velocity c (km/s)'),
            controls: [
                { id: 'h1', label: t('模型 A 层厚 (km)', 'model A layer thickness (km)'), min: 0.2, max: 5, step: 0.05, value: 1 },
                { id: 'v1', label: t('模型 A 层速度 (km/s)', 'model A layer velocity (km/s)'), min: 0.4, max: 3, step: 0.02, value: 1.2 },
                { id: 'ratio', label: t('模型 B 的厚/速 缩放因子', 'model B thickness/velocity scaling factor'), min: 0.5, max: 2, step: 0.01, value: 1.35 },
            ],
            note: t('把层厚乘以 s 同时把速度除以 s（保持 h/Vs 即走时不变），频散曲线几乎不变 —— 这就是经典的「厚度—速度」trade-off。它意味着单靠频散曲线无法确定绝对层厚，必须引入独立约束（如接收函数、钻井或地质先验）。', 'Multiplying thickness by s while dividing velocity by s (keeping h/Vs, i.e. travel time, unchanged) leaves the dispersion curve almost unchanged — the classic thickness–velocity trade-off. It means dispersion data alone cannot fix absolute layer thickness; independent constraints (receiver functions, boreholes or geological priors) are required.'),
            compute: (p) => {
                const h1 = p['h1'], v1 = p['v1'], s = p['ratio'];
                const half = 3.6;
                const disp = (h, v, T) => {
                    // 两层模型的极简化频散：长周期→半空间，短周期→层速度
                    const w = 1 / (1 + Math.exp(-(Math.log10(T) - Math.log10(h / v * 4)) / 0.45));
                    return v * w + half * (1 - w);
                };
                const A = [];
                const B = [];
                for (let i = 0; i <= 200; i++) {
                    const T = 0.2 + (i / 200) * 79.8;
                    A.push([T, disp(h1, v1, T)]);
                    B.push([T, disp(h1 * s, v1 / s, T)]);
                }
                return [
                    { label: t('模型 A', 'model A'), color: '#185FA5', points: A },
                    { label: t('模型 B（厚度 ×' + s.toFixed(2) + '，速度 ÷' + s.toFixed(2) + '）', 'model B (thickness ×' + s.toFixed(2) + ', velocity ÷' + s.toFixed(2) + ')'), color: '#993C1D', points: B },
                ];
            },
        },
    ],
    example: {
        title: t('需要多长的周期', 'How long a period is needed'),
        input: t('目标深度 30 km，平均 Vs = 3.4 km/s', 'Target depth 30 km, average Vs = 3.4 km/s'),
        steps: [
            t('由 z ≈ cT/3 得 T ≈ 3z/c = 90/3.4 = 26 s', 'From z ≈ cT/3, T ≈ 3z/c = 90/3.4 = 26 s'),
            t('实际工作中需到 40–60 s 才能稳定约束该深度', 'In practice 40–60 s is needed to constrain that depth stably'),
        ],
        output: t('约束 30 km 深度至少需要 30 s 以上的长周期频散数据', 'Constraining 30 km depth requires dispersion data beyond about 30 s'),
    },
    links: {
        upstream: [
            { id: 'love-wave-dispersion', note: t('Love 波频散的正演', 'Forward modelling of Love-wave dispersion') },
            { id: 'surface-wave-sensitivity-kernel', note: t('灵敏度核是反演矩阵 G', 'The sensitivity kernel is the inversion matrix G') },
        ],
        downstream: [{ id: 'noise-cross-correlation-stacking', note: t('噪声互相关提供频散观测', 'Noise cross-correlation provides the dispersion observations') }],
        seealso: [{ id: 'damped-least-squares', note: t('阻尼是压制非唯一性的手段', 'Damping is the tool that suppresses non-uniqueness') }],
    },
    refs: [{ text: 'Xia, Miller & Park (1999), Estimation of near-surface shear-wave velocity by inversion of Rayleigh waves, Geophysics 64, 691–700' }],
};
export default dispersionCurveInversion;
//# sourceMappingURL=dispersion-curve-inversion.js.map