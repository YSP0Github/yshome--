import { t } from '../../core/types.js';
/** ccp-stacking */
const ccpStacking = {
    id: 'ccp-stacking',
    name: t('共转换点叠加（CCP）', 'Common-conversion-point (CCP) Stacking'),
    aliases: { zh: ['CCP 叠加', '共转换点', '转换波成像'], en: ['CCP stacking', 'common conversion point', 'converted-wave imaging'] },
    node: 'S7.4',
    tags: {
        math: ['MATH.GEOM', 'MATH.STAT'],
        method: ['METH.INV', 'METH.STRUCT'],
        quantity: ['Q.GEOM', 'Q.AMP'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\bar{R}(x, z) = \frac{\sum_{i=1}^{N} w_i\,R_i\big(t_{Ps}(x_i, z)\big)}{\sum_{i=1}^{N} w_i},\qquad
z = \int_0^{t_{Ps}}\frac{\mathrm{d}t}{p_{S}^{-1} - p_{P}^{-1}}\ \text{的时间—深度转换}`,
        variants: [
            { name: t('由 Ps–P 到时差求深度', 'Depth from the Ps–P differential time'), latex: String.raw `H = \frac{t_{Ps}}{\sqrt{\dfrac{1}{V_S^{2}}-p^{2}} - \sqrt{\dfrac{1}{V_P^{2}}-p^{2}}}` },
            { name: t('转换点的横向偏移', 'Lateral shift of the conversion point'), latex: String.raw `\Delta x(z) = \int_0^{z}\tan i_S\,\mathrm{d}z' \neq \text{台站位置}` },
            { name: t('叠加提高信噪比', 'Stacking improves the signal-to-noise ratio'), latex: String.raw `\mathrm{SNR} \propto \sqrt{N}\ \ (\text{信号相干、噪声不相干})` },
            { name: t('加权方案', 'Weighting schemes'), latex: String.raw `w_i = \frac{1}{\sigma_i^{2}}\ \text{或}\ w_i = \cos^{2}\!\big(\text{入射角}\big)` },
        ],
    },
    meaning: t('单个台站的接收函数只给出台站正下方的一根柱子。要成像一条剖面，就要把许多台站的接收函数按其转换点位置归位后叠加。关键的一步是「时深转换」：把每个振幅样点从时间轴搬到深度轴，而搬的位置依赖速度模型 —— 这既是要反演的目标又是转换的前提，所以 CCP 成像总是迭代进行的。', 'A single station\'s receiver function gives only a column beneath that station. To image a cross-section, receiver functions from many stations must be moved to their conversion-point positions and stacked. The crucial step is the time-to-depth conversion: each amplitude sample is carried from the time axis to the depth axis, and where it lands depends on the velocity model — which is both the target of the inversion and the prerequisite for the conversion, so CCP imaging is inherently iterative.'),
    symbols: [
        { sym: '\\bar{R}(x,z)', name: t('叠加后的转换波振幅', 'stacked converted-wave amplitude'), unit: '无量纲' },
        { sym: 't_{Ps}', name: t('Ps 与直达 P 的到时差', 'differential time between Ps and direct P'), unit: 's' },
        { sym: 'p', name: t('射线参数', 'ray parameter'), unit: 's/km' },
        { sym: 'w_i', name: t('第 i 条接收函数的权重', 'weight of the i-th receiver function'), unit: '无量纲' },
        { sym: 'N', name: t('落入同一网格单元的射线数', 'number of rays falling in the same bin'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('地壳与上地幔间断面成像、Moho 深度填图、俯冲板片成像', 'Imaging crustal and upper-mantle discontinuities, Moho depth mapping, slab imaging')],
        assumes: [t('转换点位置计算所用的速度模型大致正确', 'The velocity model used to compute conversion points is roughly correct')],
        breaks: [t('速度模型错误超过约 5% 时界面会被明显抹平或错位', 'Velocity errors beyond about 5% visibly smear or misplace interfaces'), t('倾斜或强横向变速界面无法用简单的 CCP 归位', 'Dipping or strongly laterally varying interfaces defeat simple CCP binning')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('每条接收函数是时间域序列 R_i(t)', 'Each receiver function is a time series R_i(t)'), latex: String.raw `R_i(t) = \frac{R_{\text{radial}}(t) \ast \text{deconv}}{R_{\text{vertical}}(t)}` },
        { n: 2, op: 'geometry', title: t('P 与 S 的下行/上行慢度之差决定到时差', 'The difference between P and S slownesses sets the differential time'), latex: String.raw `t_{Ps} = H\left(\sqrt{\frac{1}{V_S^{2}}-p^{2}} - \sqrt{\frac{1}{V_P^{2}}-p^{2}}\right)` },
        { n: 3, op: 'algebra', title: t('解出深度 H', 'Solve for depth H'), latex: String.raw `H = \frac{t_{Ps}}{\sqrt{V_S^{-2}-p^{2}}-\sqrt{V_P^{-2}-p^{2}}}` },
        { n: 4, op: 'identity', title: t('转换点不在台站正下方，要沿射线回退', 'The conversion point is not beneath the station; back-project along the ray'), latex: String.raw `x_c = x_{\text{台站}} - \int_0^{H}\tan i_P\,\mathrm{d}z` },
        { n: 5, op: 'result', title: t('把样点投进 (x, z) 网格后做加权平均', 'Project samples onto the (x, z) grid and take a weighted mean'), latex: String.raw `\bar{R}(x,z) = \frac{\sum_i w_i R_i}{\sum_i w_i},\quad \mathrm{SNR} \propto \sqrt{N}` },
    ],
    viz: [
        {
            id: 'ccp-depth',
            level: 'V2',
            title: t('Ps 到时差到深度的非线性映射', 'Nonlinear mapping from Ps differential time to depth'),
            xlabel: t('Ps–P 到时差 t_Ps (s)', 'Ps–P differential time t_Ps (s)'),
            ylabel: t('深度 H (km)', 'depth H (km)'),
            controls: [
                { id: 'vp', label: t('地壳 Vp (km/s)', 'crustal Vp (km/s)'), min: 5, max: 7.5, step: 0.02, value: 6.2 },
                { id: 'nu', label: t('泊松比 ν', "Poisson's ratio ν"), min: 0.2, max: 0.35, step: 0.005, value: 0.27 },
                { id: 'p', label: t('射线参数 p (s/km)', 'ray parameter p (s/km)'), min: 0.01, max: 0.12, step: 0.002, value: 0.06 },
            ],
            note: t('这是 CCP 成像的「尺子」。泊松比改变（即 Vs 改变）会显著改变尺子的刻度：ν 从 0.25 变到 0.30，同样的 5 s 到时差对应的 Moho 深度会差好几公里 —— 这就是 CCP 深度不确定性的主要来源。', 'This is the "ruler" of CCP imaging. Changing Poisson\'s ratio (i.e. Vs) markedly changes the ruler: as ν goes from 0.25 to 0.30, the same 5 s differential time maps to Moho depths differing by several kilometres — the dominant source of CCP depth uncertainty.'),
            compute: (p) => {
                const vp = p['vp'], nu = p['nu'], pr = p['p'];
                const vs = vp * Math.sqrt((0.5 - nu) / (1 - nu));
                const qp = Math.sqrt(Math.max(1e-6, 1 / (vp * vp) - pr * pr));
                const qs = Math.sqrt(Math.max(1e-6, 1 / (vs * vs) - pr * pr));
                const den = qs - qp;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const tt = 0.2 + (i / 200) * 9.8;
                    pts.push([tt, tt / den]);
                }
                return [{ label: t('H(t_Ps)', 'H(t_Ps)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'ccp-snr',
            level: 'V1',
            title: t('叠加条数对信噪比的提升', 'Signal-to-noise gain versus number of stacked traces'),
            xlabel: t('叠加条数 N', 'number of stacked traces N'),
            ylabel: t('相对信噪比', 'relative SNR'),
            controls: [{ id: 'coh', label: t('信号相干度 (0–1)', 'signal coherence (0–1)'), min: 0.2, max: 1, step: 0.02, value: 0.9 }],
            note: t('完全相干时 SNR ∝ √N：100 条叠加提高 10 倍。但真实数据里信号并非完全相干（速度模型误差、倾斜界面），相干度降到 0.6 左右时，叠加超过约 30 条就几乎不再有收益。', 'With perfect coherence SNR ∝ √N: stacking 100 traces gives a factor of 10. Real data are not perfectly coherent (velocity-model error, dipping interfaces); once coherence drops to about 0.6, stacking beyond roughly 30 traces yields almost no further gain.'),
            compute: (p) => {
                const coh = p['coh'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const N = 1 + (i / 200) * 199;
                    const snr = (coh * N) / Math.sqrt(coh * N + (1 - coh) * N * N) / Math.sqrt(1);
                    pts.push([N, snr]);
                }
                const m = Math.max(...pts.map((q) => q[1]));
                return [{ label: t('相对 SNR', 'relative SNR'), color: '#993C1D', points: pts.map(([x, y]) => [x, y / m]) }];
            },
        },
    ],
    example: {
        title: t('把 5 s 的 Ps 震相换算成 Moho 深度', 'Converting a 5 s Ps phase into Moho depth'),
        input: t('Vp = 6.2 km/s，ν = 0.27，p = 0.06 s/km', 'Vp = 6.2 km/s, ν = 0.27, p = 0.06 s/km'),
        steps: [
            t('Vs = 6.2 × √(0.23/0.73) = 3.48 km/s', 'Vs = 6.2 × √(0.23/0.73) = 3.48 km/s'),
            t('√(Vs⁻²−p²) = 0.2686，√(Vp⁻²−p²) = 0.1488', '√(Vs⁻²−p²) = 0.2686, √(Vp⁻²−p²) = 0.1488'),
            t('H = 5 / (0.2686 − 0.1488) = 41.8 km', 'H = 5 / (0.2686 − 0.1488) = 41.8 km'),
        ],
        output: t('Moho 深度约 42 km，符合造山带地壳', 'Moho depth about 42 km, consistent with an orogenic crust'),
    },
    links: {
        upstream: [
            { id: 'receiver-function-deconvolution', note: t('先要有接收函数', 'Receiver functions must exist first') },
            { id: 'ray-parameter-conservation', note: t('p 由震中距与模型给出', 'p comes from epicentral distance and the model') },
        ],
        downstream: [{ id: 'receiver-function-h-kappa', note: t('H–κ 是单台版的同类方法', 'H–κ is the single-station analogue') }],
        seealso: [{ id: 'mohorovicic-discontinuity', note: t('Moho 是最常见的目标界面', 'The Moho is the most common target interface') }],
    },
    refs: [{ text: 'Dueker & Sheehan (1997), Mantle discontinuity structure from midpoint stacks, JGR 102, 9853–9867' }],
};
export default ccpStacking;
//# sourceMappingURL=ccp-stacking.js.map