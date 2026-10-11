import { t } from '../../core/types.js';
/** noise-cross-correlation-stacking */
const noiseCrossCorrelationStacking = {
    id: 'noise-cross-correlation-stacking',
    name: t('噪声互相关的叠加与信噪比增长', 'Stacking of Noise Cross-correlations & SNR Growth'),
    aliases: { zh: ['噪声互相关叠加', '经验 Green 函数', '信噪比增长'], en: ['noise cross-correlation stacking', 'empirical Green function', 'SNR growth'] },
    node: 'S9.6',
    tags: {
        math: ['MATH.STAT', 'MATH.FOURIER'],
        method: ['METH.SURF', 'METH.PROC'],
        quantity: ['Q.AMP', 'Q.TIME'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `C_{AB}(\tau) = \frac{1}{T}\int_0^{T} u_A(t)\,u_B(t+\tau)\,\mathrm{d}t
\;\xrightarrow[\text{长期平均}]{}\; -G_{AB}(\tau) + G_{BA}(-\tau)`,
        variants: [
            { name: t('因果与非因果分支', 'Causal and acausal branches'), latex: String.raw `C_{AB}(+\tau)\ \text{含}\ A\to B;\qquad C_{AB}(-\tau)\ \text{含}\ B\to A` },
            { name: t('信噪比随叠加天数增长', 'SNR growth with the number of stacked days'), latex: String.raw `\mathrm{SNR} \propto \sqrt{N_{\text{days}}}` },
            { name: t('非对称性的度量', 'Measuring asymmetry'), latex: String.raw `A(\tau) = \frac{C(+\tau)-C(-\tau)}{C(+\tau)+C(-\tau)}` },
            { name: t('对噪声源分布的要求', 'Requirement on the noise-source distribution'), latex: String.raw `\text{源方位均匀} \Longleftrightarrow C_{AB}\ \text{对称且收敛到 Green 函数}` },
        ],
    },
    meaning: t('两个台站长期背景噪声的互相关会收敛到它们之间的经验格林函数 —— 这是过去二十年地震学最重要的发现之一。但单天的互相关几乎全是噪声，必须把几十到几百天的结果叠加起来，面波信号才浮现。信噪比按 √N 增长意味着：要把信噪比提高 10 倍，需要 100 倍的数据。这既是好消息（确实能收敛）也是坏消息（边际收益递减）。', 'The cross-correlation of long-duration ambient noise between two stations converges to their empirical Green function — one of the most important discoveries in seismology in the past two decades. But a single day of cross-correlation is almost pure noise; tens to hundreds of days must be stacked before the surface-wave signal emerges. SNR growing as √N means that improving the SNR tenfold requires a hundredfold more data. That is both good news (it does converge) and bad news (diminishing returns).'),
    symbols: [
        { sym: 'C_{AB}(\\tau)', name: t('台站 A、B 记录的相关函数', 'correlation function of records at A and B'), unit: '—' },
        { sym: 'G_{AB}', name: t('A 到 B 的格林函数', 'Green function from A to B'), unit: '—' },
        { sym: 'N_{\\text{days}}', name: t('叠加天数', 'number of stacked days'), unit: '天' },
        { sym: 'A(\\tau)', name: t('因果/非因果不对称度', 'causal/acausal asymmetry'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('背景噪声面波成像、噪声源监测、台站时钟与方位校正', 'Ambient-noise surface-wave imaging, noise-source monitoring, station clock and orientation correction')],
        assumes: [t('噪声场为弥散场（源分布足够均匀或可用衰减补偿）', 'The noise field is diffuse (sources distributed evenly enough)')],
        breaks: [t('噪声源强烈单向（如持续的风暴方向）会造成虚假到时', 'Strongly one-sided noise sources (e.g. persistent storm direction) bias the apparent arrival time'), t('仪器时钟漂移会直接破坏叠加', 'Instrument clock drift directly destroys the stack')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('两个台站的噪声记录分别写为源的卷积', 'Write the noise records at two stations as convolutions with the sources'), latex: String.raw `u_A(t) = \sum_s G_{As}*n_s(t),\quad u_B(t) = \sum_s G_{Bs}*n_s(t)` },
        { n: 2, op: 'physics', title: t('互相关的期望值含 G_As 与 G_Bs 的乘积', 'The expectation of the cross-correlation contains a product of G_As and G_Bs'), latex: String.raw `\langle u_A u_B\rangle \propto \sum_s G_{As}G_{Bs}^{\ast}` },
        { n: 3, op: 'identity', title: t('弥散场假设下对源求和等价于路径积分', 'Under the diffuse-field assumption the sum over sources equals a path integral'), latex: String.raw `\sum_s \to \oint \mathrm{d}\Omega \Longrightarrow \sum_s G_{As}G_{Bs}^{\ast} \to -\mathrm{Im}\,G_{AB}` },
        { n: 4, op: 'substitute', title: t('得到相关函数收敛到格林函数', 'The correlation converges to the Green function'), latex: String.raw `C_{AB}(\tau) \to -G_{AB}(\tau) + G_{BA}(-\tau)` },
        { n: 5, op: 'result', title: t('叠加 N 天，不相干噪声按 √N 压低', 'Stacking N days suppresses incoherent noise as √N'), latex: String.raw `\mathrm{SNR} = \frac{N\,S}{\sqrt{N}\,\sigma} = \sqrt{N}\,\frac{S}{\sigma}` },
    ],
    viz: [
        {
            id: 'noise-stack',
            level: 'V3',
            title: t('叠加天数对经验格林函数信噪比的影响', 'Effect of stacking duration on the empirical Green function SNR'),
            xlabel: t('时间 τ (s)', 'lag τ (s)'),
            ylabel: t('归一化相关振幅', 'normalised correlation amplitude'),
            controls: [
                { id: 'nday', label: t('叠加天数 N', 'number of stacked days N'), min: 1, max: 400, step: 1, value: 30 },
                { id: 'noise', label: t('单天噪声水平', 'single-day noise level'), min: 0.1, max: 3, step: 0.05, value: 1 },
                { id: 'd', label: t('台间距 (km)', 'station separation (km)'), min: 20, max: 800, step: 5, value: 200 },
                { id: 'asym', label: t('源分布不对称度 (0–1)', 'source asymmetry (0–1)'), min: 0, max: 1, step: 0.02, value: 0.3 },
            ],
            note: t('面波到时（因果 ±τ 两支）随天数增加逐渐从噪声中浮现。把 N 从 5 调到 200，可以看到曲线从「毛刺」变成清晰的双支 —— 但不对称度调大时，其中一支会明显变弱，这正是噪声源分布不均的表现。', 'The surface-wave arrivals (both causal and acausal branches) emerge from noise as the number of days grows. Moving N from 5 to 200 turns the curve from "fuzz" into two clean branches — but raising the asymmetry visibly weakens one branch, exactly how an uneven noise-source distribution manifests.'),
            compute: (p) => {
                const N = Math.round(p['nday']), nz = p['noise'], D = p['d'], as = p['asym'];
                const v = 3.0;
                const t0 = D / v;
                let seed = 8080;
                const rnd = () => {
                    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                    return (seed / 0x7fffffff) * 2 - 1;
                };
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const tau = -100 + (i / 400) * 200;
                    // 因果支（+t0）与非因果支（−t0），振幅受不对称度影响
                    const sig = (tt, amp) => {
                        const u = (tt - t0) / 8;
                        return amp * Math.exp(-u * u) * Math.cos(2 * Math.PI * 0.12 * (tt - t0));
                    };
                    const sig2 = (tt, amp) => {
                        const u = (tt + t0) / 8;
                        return amp * Math.exp(-u * u) * Math.cos(2 * Math.PI * 0.12 * (tt + t0));
                    };
                    const s = sig(tau, 1 - as * 0.8) + sig2(tau, 1);
                    const noise = (nz * rnd()) / Math.sqrt(N);
                    pts.push([tau, (s + noise) / 2]);
                }
                return [{ label: t('叠加相关函数（N = ' + N + ' 天）', 'stacked correlation (N = ' + N + ' days)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'snr-growth',
            level: 'V1',
            title: t('信噪比随叠加天数的 √N 增长', 'SNR grows as √N with stacking duration'),
            xlabel: t('叠加天数 N', 'stacked days N'),
            ylabel: t('相对信噪比', 'relative SNR'),
            controls: [{ id: 'snr1', label: t('单天信噪比', 'single-day SNR'), min: 0.01, max: 2, step: 0.01, value: 0.15 }],
            note: t('√N 增长意味着边际收益递减：前 30 天把信噪比提高到 5.5 倍，再想要同样的倍数增长就需要 30×30 = 900 天。实际工作中 3–12 个月的数据通常已足够得到可靠的面波频散。', '√N means diminishing returns: the first 30 days raise the SNR by 5.5×, and getting the same factor again would need 30×30 = 900 days. In practice 3–12 months of data usually suffice for reliable surface-wave dispersion.'),
            compute: (p) => {
                const s1 = p['snr1'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const N = 1 + (i / 200) * 499;
                    pts.push([N, s1 * Math.sqrt(N)]);
                }
                return [{ label: t('SNR ∝ √N', 'SNR ∝ √N'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('需要多少天数据', 'How many days of data are needed'),
        input: t('单天信噪比 0.15，目标信噪比 10', 'Single-day SNR 0.15, target SNR 10'),
        steps: [
            t('N = (10/0.15)² = 4444', 'N = (10/0.15)² = 4444'),
            t('约 12 年的连续数据 —— 显然不现实', 'About 12 years of continuous data — clearly unrealistic'),
            t('改用频带滤波与相位加权叠加可提高单天信噪比', 'Band filtering and phase-weighted stacking raise the single-day SNR'),
        ],
        output: t('实际工作中靠预处理提升单天信噪比，而非无限延长叠加', 'In practice preprocessing raises the single-day SNR rather than extending the stack indefinitely'),
    },
    links: {
        upstream: [
            { id: 'ambient-noise-green-function', note: t('经验格林函数的理论', 'Theory of the empirical Green function') },
            { id: 'cross-correlation', note: t('相关运算的定义', 'Definition of the correlation operation') },
        ],
        downstream: [{ id: 'surface-wave-sensitivity-kernel', note: t('提取频散后进入反演', 'After extracting dispersion, move on to inversion') }],
        seealso: [{ id: 'matched-filter-detection', note: t('相位加权叠加与匹配滤波同源', 'Phase-weighted stacking and matched filtering share an origin') }],
    },
    refs: [{ text: 'Shapiro & Campillo (2004), Emergence of broadband Rayleigh waves from correlations of the ambient seismic noise, GRL 31, L07614' }],
};
export default noiseCrossCorrelationStacking;
//# sourceMappingURL=noise-cross-correlation-stacking.js.map