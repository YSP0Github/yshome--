import { t } from '../../core/types.js';
/** magnitude-completeness-mc */
const magnitudeCompletenessMc = {
    id: 'magnitude-completeness-mc',
    name: t('完备震级 Mc 的确定方法', 'Determining the Completeness Magnitude Mc'),
    aliases: { zh: ['完备震级', 'Mc', '目录完备性'], en: ['completeness magnitude', 'Mc', 'catalogue completeness'] },
    node: 'S12.4',
    tags: {
        math: ['MATH.STAT'],
        method: ['METH.STAT'],
        quantity: ['Q.SOURCE', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `M_c = \min\left\{M:\ \frac{|\hat{b}(M) - b_{\text{ref}}|}{\sigma_b} < \delta\right\},
\qquad M_c^{\text{MAXC}} = \arg\max_{M} N(\ge M)_{\text{非累积}}`,
        variants: [
            { name: t('最大曲率法 MAXC', 'Maximum-curvature method (MAXC)'), latex: String.raw `M_c^{\text{MAXC}} = \arg\max_{M} n(M)` },
            { name: t('拟合优度法（90%、95% 准则）', 'Goodness-of-fit method (90%, 95% criteria)'), latex: String.raw `R(a,b,M_c) = 100 - \frac{\sum_{M_i\ge M_c}|O_i - E_i|}{\sum_i O_i}\times 100` },
            { name: t('b 值稳定性法（MBS）', 'b-value stability method (MBS)'), latex: String.raw `M_c = M\ \text{使}\ \hat{b}(M)\ \text{开始稳定}` },
            { name: t('整个时段完备（EMR 法）', 'Entire-magnitude-range (EMR) method'), latex: String.raw `\text{对}\ M \ge M_c\ \text{拟合 GR 律并用}\chi^{2}\ \text{检验}` },
        ],
    },
    meaning: t('地震目录在小震端总是不完备的：台网漏检、白天噪声大、余震密集时段互相遮蔽。Mc 就是「这个目录从哪个震级往上可以相信」的分界。它不是一个物理常数，而是台网能力与时段的函数 —— 大震之后 Mc 会临时升高几个月。所有基于目录的统计（b 值、GR 参数、地震平静与激活分析）都必须先定 Mc，否则得到的其实是台网探测能力的变化，而不是地震活动性的变化。', 'Earthquake catalogues are always incomplete at the small end: networks miss events, daytime noise is higher, and aftershocks mask each other in dense periods. Mc is the boundary above which the catalogue can be trusted. It is not a physical constant but a function of network capability and time period — Mc rises temporarily for months after a large earthquake. Every catalogue-based statistic (b value, GR parameters, quiescence and activation analysis) must first fix Mc, otherwise what is measured is the changing detection capability of the network rather than a change in seismicity.'),
    symbols: [
        { sym: 'M_c', name: t('完备震级', 'completeness magnitude'), unit: '无量纲' },
        { sym: '\\hat{b}(M)', name: t('只取 M 以上的事件估计出的 b 值', 'b value estimated using only events above M'), unit: '无量纲' },
        { sym: 'R', name: t('拟合优度（百分比）', 'goodness of fit (percentage)'), unit: '%' },
        { sym: 'O_i, E_i', name: t('第 i 个震级档的观测与预期频度', 'observed and expected counts in magnitude bin i'), unit: '个' },
    ],
    conditions: {
        applies: [t('目录预处理、b 值估计、地震活动性变化检测', 'Catalogue preprocessing, b-value estimation, detecting seismicity changes')],
        assumes: [t('完备段内震级服从 GR 律', 'Magnitudes follow the GR law above completeness')],
        breaks: [t('震级标度不一致（如 ML 与 Mw 混用）会破坏分布', 'Mixing magnitude scales (e.g. ML and Mw) corrupts the distribution')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('完备段的震级服从 GR 律', 'Magnitudes above completeness follow the GR law'), latex: String.raw `\log_{10}N(\ge M) = a - bM,\quad M \ge M_c` },
        { n: 2, op: 'physics', title: t('低于 Mc 时探测概率 < 1，频度曲线向下弯折', 'Below Mc the detection probability is < 1, so the frequency curve bends down'), latex: String.raw `N_{\text{obs}}(M) = P_{\text{det}}(M)\,N_{\text{true}}(M)` },
        { n: 3, op: 'identity', title: t('MAXC 法：非累积频度的最大值即弯折点', 'MAXC: the maximum of the non-cumulative frequency is the bend point'), latex: String.raw `M_c^{\text{MAXC}} = \arg\max_M n(M)` },
        { n: 4, op: 'substitute', title: t('拟合优度法：逐步提高 M_c 计算 R', 'Goodness-of-fit: raise M_c step by step and compute R'), latex: String.raw `R = 100 - \frac{\sum|O_i-E_i|}{\sum O_i}\times 100` },
        { n: 5, op: 'result', title: t('取 R 首次超过 90%（或 95%）的 M 作为 Mc', 'Take the first M where R exceeds 90% (or 95%)'), latex: String.raw `M_c = \min\{M: R(M) \ge 90\%\}` },
    ],
    viz: [
        {
            id: 'mc-fmd',
            level: 'V2',
            title: t('震级—频度分布与 Mc 的位置', 'Magnitude–frequency distribution and the position of Mc'),
            xlabel: t('震级 M', 'magnitude M'),
            ylabel: t('log₁₀ N(≥M)', 'log₁₀ N(≥M)'),
            controls: [
                { id: 'a', label: t('GR 参数 a', 'GR parameter a'), min: 2, max: 7, step: 0.05, value: 4.5 },
                { id: 'b', label: t('b 值', 'b value'), min: 0.6, max: 1.5, step: 0.01, value: 1 },
                { id: 'mc', label: t('真实完备震级 Mc', 'true Mc'), min: 0.5, max: 4, step: 0.05, value: 2.2 },
                { id: 'sharp', label: t('探测函数的陡峭程度', 'sharpness of the detection function'), min: 0.3, max: 4, step: 0.05, value: 1.5 },
            ],
            note: t('灰色是真实的 GR 直线，蓝色是实际观测（在 Mc 以下因漏检而向下弯折）。MAXC 法找的就是弯折最明显的位置。探测函数越陡（台网越现代化），弯折越干脆，Mc 越容易定准。', 'Grey is the true GR line, blue is what is actually observed (bending downward below Mc because of missed detections). MAXC looks for the location of the sharpest bend. The sharper the detection function (the more modern the network), the crisper the bend and the easier Mc is to pin down.'),
            compute: (p) => {
                const a = p['a'], b = p['b'], mc = p['mc'], sh = p['sharp'];
                const obs = [];
                const tru = [];
                for (let i = 0; i <= 200; i++) {
                    const M = 0 + (i / 200) * 6;
                    const Ntrue = Math.pow(10, a - b * M);
                    const pdet = 1 / (1 + Math.exp(-sh * (M - mc)));
                    const Nobs = Ntrue * pdet;
                    tru.push([M, Math.log10(Math.max(Ntrue, 1e-6))]);
                    obs.push([M, Math.log10(Math.max(Nobs, 1e-6))]);
                }
                // 非累积频度（用于 MAXC）
                const nonc = [];
                let prev = 0;
                for (let i = 200; i >= 0; i--) {
                    const M = (i / 200) * 6;
                    const Ntrue = Math.pow(10, a - b * M);
                    const pdet = 1 / (1 + Math.exp(-sh * (M - mc)));
                    const v = Ntrue * pdet;
                    nonc.push([M, Math.max(v - prev, 1e-6)]);
                    prev = v;
                }
                const mx = Math.max(...nonc.map((q) => q[1]));
                return [
                    { label: t('观测（含漏检）', 'observed (with missed events)'), color: '#185FA5', points: obs },
                    { label: t('真实 GR 律', 'true GR law'), color: '#888780', points: tru },
                    { label: t('非累积频度（MAXC）', 'non-cumulative (MAXC)'), color: '#993C1D', points: nonc.map(([x, y]) => [x, y / mx * 4 - 1]) },
                ];
            },
        },
    ],
    example: {
        title: t('MAXC 与拟合优度法的分歧', 'Disagreement between MAXC and goodness-of-fit'),
        input: t('一个区域目录，MAXC 给出 Mc = 2.0，拟合优度法（95%）给出 Mc = 2.5', 'A regional catalogue: MAXC gives Mc = 2.0, goodness-of-fit (95%) gives Mc = 2.5'),
        steps: [
            t('MAXC 通常低估 Mc 约 0.2 级', 'MAXC typically underestimates Mc by about 0.2'),
            t('若 b 值用于物理推断，应取保守的 2.5', 'If the b value feeds physical inference, use the conservative 2.5'),
        ],
        output: t('用 Mc = 2.5 重估 b 值会更稳健', 'Re-estimating b with Mc = 2.5 is more robust'),
    },
    links: {
        upstream: [{ id: 'gutenberg-richter-law', note: t('GR 律是完备段的形式', 'The GR law is the form above completeness') }],
        downstream: [{ id: 'aki-b-value', note: t('b 值估计必须在 Mc 之上进行', 'b estimation must be done above Mc') }],
        seealso: [{ id: 'chi-square-goodness', note: t('拟合优度检验的统计基础', 'Statistical basis of the goodness-of-fit test') }],
    },
    refs: [{ text: 'Woessner & Wiemer (2005), Assessing the quality of earthquake catalogues, GJI 162, 905–929' }],
};
export default magnitudeCompletenessMc;
//# sourceMappingURL=magnitude-completeness-mc.js.map