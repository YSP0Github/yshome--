import { t } from '../../core/types.js';
/** reverse-time-migration */
const reverseTimeMigration = {
    id: 'reverse-time-migration',
    name: t('逆时偏移与互相关成像条件', 'Reverse-time Migration & the Cross-correlation Imaging Condition'),
    aliases: { zh: ['逆时偏移', 'RTM', '互相关成像条件'], en: ['reverse-time migration', 'RTM', 'cross-correlation imaging condition'] },
    node: 'S3.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.STAT'],
        method: ['METH.EXPL', 'METH.INV'],
        quantity: ['Q.AMP', 'Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `I(\mathbf{x}) = \sum_{t} S(\mathbf{x},t)\,R(\mathbf{x},t)`,
        variants: [
            { name: t('正传震源波场', 'Forward-propagated source wavefield'), latex: String.raw `\frac{1}{v^{2}}\frac{\partial^{2}S}{\partial t^{2}} - \nabla^{2}S = f(t)\,\delta(\mathbf{x}-\mathbf{x}_s)` },
            { name: t('反传接收波场', 'Back-propagated receiver wavefield'), latex: String.raw `\frac{1}{v^{2}}\frac{\partial^{2}R}{\partial t^{2}} - \nabla^{2}R = d(\mathbf{x}_r,\ T-t)` },
            { name: t('归一化（照明补偿）', 'Normalised (illumination-compensated)'), latex: String.raw `I(\mathbf{x}) = \frac{\sum_t S R}{\sum_t S^{2}}` },
            { name: t('低频噪声压制', 'Low-frequency noise suppression'), latex: String.raw `\text{拉普拉斯滤波}\ \nabla^{2}I\ \text{或高通滤波}` },
        ],
    },
    meaning: t('逆时偏移不做任何单程或旁轴近似：把震源波场正着传一遍，把记录波场沿时间倒着传一遍，两个场在空间每一点做零延迟互相关。重合的地方就是真实反射点。它能处理回转波、棱柱波、陡倾角甚至盐下结构 —— 代价是计算量比单程偏移高一个数量级以上。', 'Reverse-time migration makes no one-way or paraxial approximation: the source wavefield is propagated forward, the recorded wavefield is propagated backward in time, and the two are cross-correlated at zero lag at every point in space. Where they coincide is a true reflector. It handles turning waves, prism waves, steep dips and subsalt structure — at the cost of an order of magnitude more computation than one-way migration.'),
    symbols: [
        { sym: 'I(\\mathbf{x})', name: t('成像结果', 'image'), unit: '振幅' },
        { sym: 'S', name: t('震源波场（正传）', 'source wavefield (forward)'), unit: '振幅' },
        { sym: 'R', name: t('接收波场（反传）', 'receiver wavefield (back-propagated)'), unit: '振幅' },
        { sym: 'T', name: t('记录总时长', 'total record length'), unit: 's' },
        { sym: 'v', name: t('速度模型', 'velocity model'), unit: 'km/s' },
    ],
    conditions: {
        applies: [t('盐下、陡倾角、强横向变速等复杂构造成像', 'Imaging beneath salt, steep dips and strong lateral velocity variation')],
        assumes: [
            t('速度模型足够准确', 'The velocity model is accurate enough'),
            t('满足稳定性条件（CFL）', 'The stability condition (CFL) is satisfied'),
        ],
        breaks: [
            t('速度误差会直接造成成像不聚焦（比单程偏移更敏感）', 'Velocity error directly defocuses the image (more sensitive than one-way migration)'),
            t('零延迟互相关产生强低频噪声，必须额外滤波', 'Zero-lag cross-correlation creates strong low-frequency noise requiring extra filtering'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('波动方程的时间反演对称性', 'Time-reversal symmetry of the wave equation'),
            latex: String.raw `t\to -t\ \text{时}\ \frac{\partial^{2}}{\partial t^{2}}\ \text{不变}` },
        { n: 2, op: 'setup', title: t('把记录当作边界源反传', 'Treat the record as a boundary source and back-propagate'),
            latex: String.raw `R(\mathbf{x},t):\ \text{边界条件} = d(\mathbf{x}_r,\ T-t)` },
        { n: 3, op: 'physics', title: t('反射点处两场同时到达', 'At a reflector both fields arrive simultaneously'),
            latex: String.raw `t_S(\mathbf{x}_s\to\mathbf{x}) + t_R(\mathbf{x}\to\mathbf{x}_r) = t_{\text{obs}}` },
        { n: 4, op: 'identity', title: t('零延迟互相关检测这种同时性', 'Zero-lag cross-correlation detects this simultaneity'),
            latex: String.raw `I(\mathbf{x}) = \sum_t S(\mathbf{x},t)R(\mathbf{x},t)` },
        { n: 5, op: 'result', title: t('用震源能量归一化补偿照明不均', 'Normalise by source energy to compensate illumination'),
            latex: String.raw `I(\mathbf{x}) = \frac{\sum_t S R}{\sum_t S^{2} + \epsilon}` },
    ],
    viz: [
        {
            id: 'imaging-condition',
            level: 'V2',
            title: t('两个波场重合时互相关才出现峰值', 'Cross-correlation peaks only when the two wavefields coincide'),
            xlabel: t('时间样点', 'time sample'),
            ylabel: t('振幅', 'amplitude'),
            controls: [
                { id: 'lag', label: t('两场的时间错位（样点）', 'time lag between the fields (samples)'), min: -40, max: 40, step: 1, value: 0 },
                { id: 'wid', label: t('子波宽度（样点）', 'wavelet width (samples)'), min: 3, max: 25, step: 1, value: 8 },
            ],
            note: t('把错位从 0 挪开，乘积的积分（成像值）迅速下降 —— 这就是成像条件的 discriminating 能力。', 'Move the lag away from zero and the integral of the product (the image value) drops quickly — that is the discriminating power of the imaging condition.'),
            compute: (p) => {
                const lag = p['lag'], wid = p['wid'];
                const N = 160;
                const s = [];
                const r = [];
                const prod = [];
                const c0 = 60;
                const c1 = 60 + lag;
                for (let i = 0; i < N; i++) {
                    const a = Math.exp(-(((i - c0) / wid) ** 2));
                    const b = Math.exp(-(((i - c1) / wid) ** 2));
                    s.push([i, a]);
                    r.push([i, -b]);
                    prod.push([i, a * b]);
                }
                return [
                    { label: t('震源波场 S', 'source wavefield S'), color: '#185FA5', points: s },
                    { label: t('接收波场 R', 'receiver wavefield R'), color: '#0F6E56', points: r, dash: true },
                    { label: t('乘积 S·R', 'product S·R'), color: '#993C1D', points: prod },
                ];
            },
        },
    ],
    example: {
        title: t('成像值随时间错位的衰减', 'Decay of the image value with time lag'),
        input: t('两个高斯子波，宽度 8 样点', 'Two Gaussian wavelets of width 8 samples'),
        steps: [
            t('零错位：Σ S R = 最大', 'Zero lag: Σ S R is maximal'),
            t('错位一个宽度（8 样点）：乘积积分下降约 e^{-1/2} × ... 明显变小', 'Offset by one width (8 samples): the product integral drops markedly'),
        ],
        output: t('成像条件的分辨率约为子波宽度对应的时间长度', 'The resolution of the imaging condition is roughly the wavelet duration'),
    },
    links: {
        upstream: [
            { id: 'acoustic-wave-equation', note: t('传播所用的方程', 'The equation used for propagation') },
            { id: 'cross-correlation', note: t('互相关的定义', 'Definition of cross-correlation') },
        ],
        seealso: [
            { id: 'phase-shift-migration', note: t('常速下的高效替代', 'An efficient alternative for constant velocity') },
            { id: 'fwi-adjoint-gradient', note: t('同一套传播引擎', 'The same propagation engine') },
        ],
    },
    refs: [{ text: 'Baysal, E., Kosloff, D. & Sherwood, J. (1983). Reverse time migration. Geophysics, 48, 1514–1524' }],
};
export default reverseTimeMigration;
//# sourceMappingURL=reverse-time-migration.js.map