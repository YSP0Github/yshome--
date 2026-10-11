import { t } from '../../core/types.js';
/** high-frequency-kappa */
const highFrequencyKappa = {
    id: 'high-frequency-kappa',
    name: t('高频衰减参数 κ', 'The High-frequency Decay Parameter κ'),
    aliases: { zh: ['kappa 滤波', '高频衰减', '拐角频率之上的谱衰减'], en: ['kappa filter', 'high-frequency decay', 'spectral decay above the corner'] },
    node: 'S11.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.APPROX'],
        method: ['METH.HAZARD'],
        quantity: ['Q.HAZARD', 'Q.FREQ'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `A(f) = A_0\,e^{-\pi\kappa f},\qquad f > f_E;\qquad
\kappa = -\frac{1}{\pi}\frac{\mathrm{d}\ln A}{\mathrm{d}f}`,
        variants: [
            { name: t('κ 由路径与场地两部分组成', 'κ has a path and a site component'), latex: String.raw `\kappa = \kappa_{\text{path}}(R) + \kappa_{\text{site}} \approx \tilde{\kappa}\,R + \kappa_0` },
            { name: t('与 t* 的关系', 'Relation to t*'), latex: String.raw `\kappa = t^{*} = \int_{\text{path}}\frac{\mathrm{d}\ell}{Q\,v}` },
            { name: t('场地 κ₀ 与 Vs30 的经验关系', 'Empirical relation between site κ₀ and Vs30'), latex: String.raw `\kappa_0 \approx 0.04 - 0.00002\,V_{S30}\ \ (\text{s}),\quad V_{S30}\ \text{单位 m/s}` },
            { name: t('高频截止 f_max', 'The high-frequency cut-off f_max'), latex: String.raw `f_{\max} \sim \frac{1}{\pi\kappa}\ \text{量级}` },
        ],
    },
    meaning: t('强震记录的加速度傅里叶谱在拐角频率之上还有一个额外的指数衰减，衰减速率用 κ 描述。它综合了沿路径的介质吸收（与 t* 同源）和近地表场地的强衰减。κ 是高频地震动预测中最关键也最难约束的参数 —— 因为高频地震动恰恰是最不确定、又对短周期结构最危险的部分。', 'The acceleration Fourier spectrum of a strong-motion record has an extra exponential decay above the corner frequency, whose rate is described by κ. It combines intrinsic path attenuation (the same origin as t*) with strong near-surface site attenuation. κ is the most critical and least constrained parameter in high-frequency ground-motion prediction — because high-frequency motion is precisely the most uncertain and the most dangerous for short-period structures.'),
    symbols: [
        { sym: '\\kappa', name: t('高频衰减参数', 'high-frequency decay parameter'), unit: 's' },
        { sym: 'A_0', name: t('平台（低频）谱振幅', 'plateau (low-frequency) spectral amplitude'), unit: 'm/s' },
        { sym: 'f_E', name: t('开始指数衰减的频率', 'frequency at which exponential decay begins'), unit: 'Hz' },
        { sym: '\\kappa_0', name: t('场地（零距离）分量', 'site (zero-distance) component'), unit: 's' },
        { sym: '\\tilde{\\kappa}', name: t('路径项的距离梯度', 'distance gradient of the path term'), unit: 's/km' },
    ],
    conditions: {
        applies: [t('高频 GMPE、随机振动模拟（SMSIM）、场地 κ₀ 测量', 'High-frequency GMPEs, stochastic simulations (SMSIM), site κ₀ measurement')],
        assumes: [t('对数谱在 f_E 到 f_max 之间近似线性', 'The log spectrum is approximately linear between f_E and f_max')],
        breaks: [t('记录信噪比不足时高频段被噪声污染，κ 被高估', 'Insufficient SNR contaminates the high-frequency band and κ is overestimated'), t('强非线性场地响应时 κ 随振幅变化', 'Under strongly nonlinear site response κ varies with amplitude')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('观测到的加速度谱在高频端呈指数衰减', 'The observed acceleration spectrum decays exponentially at high frequency'), latex: String.raw `A(f) = A_0\,e^{-\pi\kappa f}` },
        { n: 2, op: 'identity', title: t('取对数得到线性关系', 'Take the logarithm to obtain a linear relation'), latex: String.raw `\ln A = \ln A_0 - \pi\kappa f` },
        { n: 3, op: 'algebra', title: t('斜率即 −πκ', 'The slope is −πκ'), latex: String.raw `\kappa = -\frac{1}{\pi}\frac{\mathrm{d}\ln A}{\mathrm{d}f}` },
        { n: 4, op: 'physics', title: t('物理来源是沿路径的 t* 与近地表衰减', 'The physical sources are path t* and near-surface attenuation'), latex: String.raw `\kappa = \int_{\text{path}}\frac{\mathrm{d}\ell}{Qv} + \kappa_{\text{site}}` },
        { n: 5, op: 'result', title: t('把距离依赖写成线性形式', 'Write the distance dependence in linear form'), latex: String.raw `\kappa(R) = \kappa_0 + \tilde{\kappa}R` },
    ],
    viz: [
        {
            id: 'kappa-spec',
            level: 'V2',
            title: t('κ 如何改变加速度谱的高频端', 'How κ changes the high-frequency end of the acceleration spectrum'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('log 加速度谱', 'log acceleration spectrum'),
            controls: [
                { id: 'k', label: t('κ (s)', 'κ (s)'), min: 0.005, max: 0.12, step: 0.002, value: 0.04 },
                { id: 'fc', label: t('拐角频率 f_c (Hz)', 'corner frequency f_c (Hz)'), min: 0.2, max: 10, step: 0.1, value: 2 },
                { id: 'm0', label: t('低频平台 (log)', 'low-frequency plateau (log)'), min: -6, max: 0, step: 0.1, value: -2 },
            ],
            note: t('κ 只影响拐角频率之上的部分：κ 越大，高频段越陡。κ = 0.02 s 时 10 Hz 处几乎没衰减；κ = 0.08 s 时 10 Hz 处已衰减了约 12 倍。这就是硬场地与软场地的差别所在。', 'κ only affects the part above the corner frequency: larger κ means a steeper high-frequency roll-off. With κ = 0.02 s there is almost no decay at 10 Hz; with κ = 0.08 s the amplitude at 10 Hz has dropped by a factor of about 12. That is the difference between hard-rock and soft-soil sites.'),
            compute: (p) => {
                const k = p['k'], fc = p['fc'], m0 = p['m0'];
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const lf = -1 + (i / 400) * 3; // log10 f: 0.1 → 100 Hz
                    const f = Math.pow(10, lf);
                    // Brune 型 ω² 谱 + κ 滤波
                    const omega2 = 1 / (1 + (f / fc) * (f / fc));
                    const kap = Math.exp(-Math.PI * k * f);
                    const v = Math.pow(10, m0) * omega2 * kap;
                    pts.push([f, Math.log10(Math.max(v, 1e-20))]);
                }
                return [{ label: t('加速度谱', 'acceleration spectrum'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'kappa-dist',
            level: 'V1',
            title: t('κ 随距离的线性增长', 'Linear growth of κ with distance'),
            xlabel: t('距离 R (km)', 'distance R (km)'),
            ylabel: t('κ (s)', 'κ (s)'),
            controls: [
                { id: 'k0', label: t('场地 κ₀ (s)', 'site κ₀ (s)'), min: 0, max: 0.1, step: 0.002, value: 0.03 },
                { id: 'kt', label: t('路径梯度 κ̃ (s/km)', 'path gradient κ̃ (s/km)'), min: 0, max: 0.0005, step: 0.00001, value: 0.00015 },
            ],
            note: t('κ(R) = κ₀ + κ̃R 是 GMPE 里高频项的标准写法。截距 κ₀ 反映场地（软土 κ₀ 大、硬岩 κ₀ 小），斜率 κ̃ 反映区域 Q。两者分离得不好是高频地震动预测不确定性的主要来源之一。', 'κ(R) = κ₀ + κ̃R is the standard form of the high-frequency term in GMPEs. The intercept κ₀ reflects the site (soft soil large, hard rock small) and the slope κ̃ reflects regional Q. Poor separation of the two is one of the main sources of uncertainty in high-frequency ground-motion prediction.'),
            compute: (p) => {
                const k0 = p['k0'], kt = p['kt'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const R = (i / 200) * 300;
                    pts.push([R, k0 + kt * R]);
                }
                return [{ label: t('κ(R)', 'κ(R)'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('硬岩与软土的 κ₀ 差别', 'κ₀ difference between hard rock and soft soil'),
        input: t('硬岩 Vs30 = 1500 m/s，软土 Vs30 = 200 m/s', 'Hard rock Vs30 = 1500 m/s, soft soil Vs30 = 200 m/s'),
        steps: [
            t('硬岩：κ₀ ≈ 0.04 − 0.00002×1500 = 0.010 s', 'Hard rock: κ₀ ≈ 0.04 − 0.00002×1500 = 0.010 s'),
            t('软土：κ₀ ≈ 0.04 − 0.00002×200 = 0.036 s', 'Soft soil: κ₀ ≈ 0.04 − 0.00002×200 = 0.036 s'),
        ],
        output: t('软土的高频衰减是硬岩的 3.6 倍，10 Hz 处振幅相差 e^(π×0.026×10) ≈ 2.3 倍', 'Soft soil attenuates high frequencies 3.6 times faster than hard rock; at 10 Hz the amplitudes differ by e^(π×0.026×10) ≈ 2.3×'),
    },
    links: {
        upstream: [
            { id: 'tstar-operator', note: t('κ 的路径部分就是 t*', 'The path part of κ is exactly t*') },
            { id: 'brune-source-spectrum', note: t('Brune 谱给出拐角频率以下的部分', 'The Brune spectrum gives the part below the corner') },
        ],
        downstream: [{ id: 'gmpe-functional-form', note: t('κ 是高频 GMPE 的核心参数', 'κ is the core parameter of high-frequency GMPEs') }],
        seealso: [{ id: 'vs30-site-term', note: t('κ₀ 与 Vs30 经验相关', 'κ₀ correlates empirically with Vs30') }],
    },
    refs: [{ text: 'Anderson & Hough (1984), A model for the shape of the Fourier amplitude spectrum of acceleration at high frequencies, BSSA 74, 1969–1993' }],
};
export default highFrequencyKappa;
//# sourceMappingURL=high-frequency-kappa.js.map