import { t } from '../../core/types.js';
/** peterson-noise-model */
const petersonNoiseModel = {
    id: 'peterson-noise-model',
    name: t('地球噪声模型（Peterson NHNM/NLNM）', 'Earth Noise Models (Peterson NHNM/NLNM)'),
    aliases: { zh: ['噪声模型', 'NLNM', 'NHNM'], en: ['Peterson noise model', 'NLNM', 'NHNM', 'ambient noise'] },
    node: 'S8.4',
    tags: {
        math: ['MATH.STAT', 'MATH.FOURIER'],
        method: ['METH.INSTR'],
        quantity: ['Q.AMP', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `P(f)=10^{\,a(f)/10}\ \left(\mathrm{dB\ re\ }1\ \mathrm{m^2/s^4/Hz}\right)`,
        variants: [
            { name: t('主要噪声源的频段归属', 'Frequency bands of the main noise sources'), latex: String.raw `\begin{aligned} <3\ \text{mHz}&:\ \text{大气与潮汐}\\ 0.05\text{–}0.1\ \text{Hz}&:\ \text{海洋微震（双频峰）}\\ >1\ \text{Hz}&:\ \text{风、人文噪声} \end{aligned}` },
            { name: t('微震双峰', 'The double microseism peak'), latex: String.raw `\text{单频峰}\approx0.07\ \text{Hz},\qquad \text{双频峰}\approx0.14\ \text{Hz}` },
        ],
    },
    meaning: t('Peterson 1993 年汇总全球台站记录，给出了地球背景噪声的上下界（NLNM 与 NHNM）。它回答了台站建设最实际的问题：「这个台址够不够安静，能测到多小的地震」。微震峰（0.05–0.3 Hz）是全球噪声最强的地方，几乎所有台站都被它限制 —— 这也是为什么长周期面波成像偏爱这个频段之外的原因。', 'Peterson (1993) compiled global station records and defined the upper and lower bounds of Earth’s ambient noise (NHNM and NLNM). It answers the most practical question of station siting: is this site quiet enough, and how small an event can be detected? The microseism peak at 0.05–0.3 Hz is the loudest part of the global noise field and limits nearly every station — which is why long-period surface-wave imaging prefers to work outside that band.'),
    symbols: [
        { sym: 'P(f)', name: t('加速度功率谱密度', 'acceleration power spectral density'), unit: 'm²/s⁴/Hz' },
        { sym: '\\mathrm{dB}', name: t('分贝（相对 1 m²/s⁴/Hz）', 'decibels relative to 1 m²/s⁴/Hz'), unit: 'dB' },
        { sym: '\\mathrm{NLNM}', name: t('新低噪声模型（全球最安静台站的下包络）', 'new low-noise model (lower envelope of the quietest stations)'), unit: 'dB' },
        { sym: '\\mathrm{NHNM}', name: t('新高噪声模型', 'new high-noise model'), unit: 'dB' },
    ],
    conditions: {
        applies: [t('台址评价、仪器动态范围设计、检测能力估计', 'Site evaluation, instrument dynamic-range design, detection-capability estimation')],
        assumes: [t('噪声统计平稳，不含局部瞬态干扰', 'Noise is statistically stationary with no local transient disturbance')],
        breaks: [t('城市台站、近海台站的实测噪声常显著高于 NHNM', 'Urban and coastal stations often exceed NHNM substantially')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('收集全球大量台站的长时间噪声谱', 'Collect long noise spectra from many global stations'),
            latex: String.raw `\left\{P_i(f)\right\}_{i=1}^{N}` },
        { n: 2, op: 'identity', title: t('取分贝', 'Convert to decibels'),
            latex: String.raw `a_i(f)=10\log_{10}P_i(f)` },
        { n: 3, op: 'result', title: t('按频率取分位数得到上下包络', 'Take quantiles per frequency to get the envelopes'),
            latex: String.raw `\mathrm{NLNM}(f)=\text{低分位数},\qquad \mathrm{NHNM}(f)=\text{高分位数}` },
    ],
    viz: [
        {
            id: 'noise-model',
            level: 'V1',
            title: t('地球噪声模型示意（含微震峰）', 'Schematic Earth noise model with the microseism peak'),
            xlabel: t('频率 (Hz)', 'frequency (Hz)'),
            ylabel: t('噪声功率谱 (dB)', 'noise PSD (dB)'),
            xScale: 'log',
            controls: [
                { id: 'ms', label: t('微震峰高度 (dB)', 'microseism peak height (dB)'), min: -160, max: -100, step: 1, value: -130 },
            ],
            compute: (p) => {
                const ms = p['ms'];
                const lo = [];
                const hi = [];
                for (let i = 0; i <= 300; i++) {
                    const f = 0.0003 * Math.pow(10, (i / 300) * 4);
                    // 低频上升 + 微震双峰 + 高频下降
                    const hum = ms + 25 * Math.exp(-((Math.log10(f) + 2.3) ** 2) / 0.05);
                    const peak = -12 * Math.exp(-((Math.log10(f) + 0.85) ** 2) / 0.02);
                    lo.push([f, hum + peak]);
                    hi.push([f, hum + peak + 40]);
                }
                return [
                    { label: t('NLNM', 'NLNM'), color: '#185FA5', points: lo },
                    { label: t('NHNM', 'NHNM'), color: '#B4B2A9', points: hi, dash: true },
                ];
            },
            note: t('微震峰（约 0.07–0.14 Hz）是全球噪声的最高点，由海浪与海底非线性相互作用激发。', 'The microseism peak near 0.07–0.14 Hz is the loudest part of the global noise field, excited by nonlinear interaction of ocean waves.'),
        },
    ],
    links: {
        seealso: [{ id: 'pole-zero-response', note: t('仪器响应决定能否测到噪声之上的信号', 'Instrument response determines whether signals above noise can be measured') }],
    },
    refs: [{ text: 'Peterson (1993), U.S. Geol. Surv. Open-File Rep. 93-322' }],
};
export default petersonNoiseModel;
//# sourceMappingURL=peterson-noise-model.js.map