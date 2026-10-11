import { t } from '../../core/types.js';
/** modified-omori-law */
const modifiedOmoriLaw = {
    id: 'modified-omori-law',
    name: t('修正大森定律', 'The Modified Omori Law'),
    aliases: { zh: ['大森定律', '余震衰减', 'Omori 公式'], en: ['Omori law', 'aftershock decay', 'Omori formula'] },
    node: 'S12.2',
    tags: {
        math: ['MATH.STAT', 'MATH.ALGEBRA'],
        method: ['METH.STAT'],
        quantity: ['Q.TIME', 'Q.SOURCE'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `n(t) = \frac{K}{(t+c)^{p}},\qquad
N(t) = \begin{cases} \dfrac{K\left[(t+c)^{1-p}-c^{1-p}\right]}{1-p}, & p \neq 1 \\[2mm] K\ln\!\left(\dfrac{t+c}{c}\right), & p = 1 \end{cases}`,
        variants: [
            { name: t('原始大森定律（p = 1）', 'The original Omori law (p = 1)'), latex: String.raw `n(t) = \frac{K}{t+c}` },
            { name: t('累积数的对数形式', 'Logarithmic form for the cumulative count'), latex: String.raw `N(t) \propto t^{1-p}\ \ (t \gg c,\ p<1)` },
            { name: t('主震后单位时间的发生率', 'Rate per unit time after the mainshock'), latex: String.raw `\lambda(t) = \lambda_0\,t^{-p}\ \text{与 GR 律结合后}` },
            { name: t('余震发生率与主震震级的关系', 'Aftershock productivity versus mainshock magnitude'), latex: String.raw `K \propto 10^{\alpha(M_m - M_c)}` },
        ],
    },
    meaning: t('1894 年大森房吉发现余震的发生率随时间按双曲线衰减，这是地震学最早确立的统计定律之一，至今仍是余震预报与危险性评估的基石。修正版本引入幂指数 p：p ≈ 1 是典型值，但不同构造区差异明显（火山与高温区 p 偏大，衰减更快）。参数 c 描述早期「缺震」现象 —— 主震后最初一段时间余震往往记录不全，这在实时预警中必须单独处理。', 'In 1894 Fusakichi Omori found that the aftershock rate decays hyperbolically with time; this is one of the oldest established statistical laws in seismology and remains the basis of aftershock forecasting and hazard assessment. The modified version introduces the exponent p: p ≈ 1 is typical, but tectonic settings differ markedly (volcanic and high-temperature regions have larger p and decay faster). Parameter c describes the early "deficit" — aftershocks are often incompletely recorded right after the mainshock, which must be handled separately in real-time forecasting.'),
    symbols: [
        { sym: 'n(t)', name: t('单位时间的余震发生率', 'aftershock rate per unit time'), unit: '1/day' },
        { sym: 'N(t)', name: t('到时刻 t 的累积余震数', 'cumulative aftershock count up to time t'), unit: '个' },
        { sym: 'K', name: t('余震生产率（与主震震级有关）', 'aftershock productivity (depends on mainshock magnitude)'), unit: '—' },
        { sym: 'c', name: t('时间偏移（早期不完备）', 'time offset (early incompleteness)'), unit: 'day' },
        { sym: 'p', name: t('衰减指数（典型 0.9–1.5）', 'decay exponent (typically 0.9–1.5)'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('余震序列建模、短期危险性评估、ETAS 模型的基础项', 'Aftershock sequence modelling, short-term hazard assessment, the base term of ETAS')],
        assumes: [t('目录在主震后短时间内完备', 'The catalogue is complete shortly after the mainshock')],
        breaks: [t('强余震触发次级序列时单一 Omori 曲线不够（需 ETAS）', 'A single Omori curve is insufficient when strong aftershocks trigger secondary sequences (ETAS needed)'), t('c 参数与目录完备性高度耦合，直接拟合不稳定', 'c is strongly coupled to catalogue completeness and is unstable to fit directly')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('经验设定发生率随时间衰减', 'Assume empirically that the rate decays with time'), latex: String.raw `n(t) = \frac{K}{(t+c)^{p}}` },
        { n: 2, op: 'identity', title: t('累积数是发生率的积分', 'The cumulative count is the integral of the rate'), latex: String.raw `N(t) = \int_0^{t}\frac{K}{(\tau+c)^{p}}\,\mathrm{d}\tau` },
        { n: 3, op: 'algebra', title: t('p ≠ 1 时的积分结果', 'Result of the integral for p ≠ 1'), latex: String.raw `N(t) = \frac{K}{1-p}\left[(t+c)^{1-p}-c^{1-p}\right]` },
        { n: 4, op: 'algebra', title: t('p = 1 时取极限，得到对数形式', 'Take the limit p → 1 to obtain the logarithmic form'), latex: String.raw `N(t) = K\ln\frac{t+c}{c}` },
        { n: 5, op: 'result', title: t('两者都可对观测直接拟合', 'Both can be fitted directly to observations'), latex: String.raw `p \approx 1,\ c \approx 0.01\text{–}1\ \text{天}` },
    ],
    viz: [
        {
            id: 'omori-rate',
            level: 'V2',
            title: t('余震发生率与累积数的衰减曲线', 'Decay curves of aftershock rate and cumulative count'),
            xlabel: t('主震后时间 t (天)', 'time after mainshock t (days)'),
            ylabel: t('发生率 n(t) / 累积数 N(t)', 'rate n(t) / cumulative N(t)'),
            controls: [
                { id: 'K', label: t('生产率 K', 'productivity K'), min: 5, max: 500, step: 5, value: 80 },
                { id: 'p', label: t('衰减指数 p', 'decay exponent p'), min: 0.6, max: 1.8, step: 0.01, value: 1.05 },
                { id: 'c', label: t('时间偏移 c (天)', 'time offset c (days)'), min: 0.001, max: 1, step: 0.005, value: 0.05 },
                { id: 'log', label: t('0 = 线性坐标, 1 = 双对数', '0 = linear, 1 = log–log'), min: 0, max: 1, step: 1, value: 0 },
            ],
            note: t('在双对数坐标下，n(t) 在 t ≫ c 时变成一条斜率为 −p 的直线 —— 这是从观测数据里读 p 值最直观的方法。c 的大小决定了曲线何时开始变直。', 'On log–log axes n(t) becomes a straight line of slope −p once t ≫ c — the most direct way to read p off observed data. The size of c determines when the curve starts to straighten.'),
            compute: (p) => {
                const K = p['K'], pp = p['p'], cc = p['c'], lg = Math.round(p['log']);
                const rate = [];
                const cum = [];
                const tmax = lg === 1 ? 1000 : 120;
                for (let i = 0; i <= 400; i++) {
                    const t = lg === 1
                        ? Math.pow(10, -2 + (i / 400) * 5)
                        : 0.05 + (i / 400) * tmax;
                    const n = K / Math.pow(t + cc, pp);
                    const N = Math.abs(1 - pp) < 1e-6
                        ? K * Math.log((t + cc) / cc)
                        : (K * (Math.pow(t + cc, 1 - pp) - Math.pow(cc, 1 - pp))) / (1 - pp);
                    rate.push([t, n]);
                    cum.push([t, lg === 1 ? N / 40 : N / 8]);
                }
                if (lg === 1) {
                    return [
                        { label: t('n(t) 双对数', 'n(t) log–log'), color: '#185FA5', points: rate.map(([x, y]) => [Math.log10(x), Math.log10(Math.max(y, 1e-12))]) },
                        { label: t('N(t)/40 双对数', 'N(t)/40 log–log'), color: '#993C1D', points: cum.map(([x, y]) => [Math.log10(x), Math.log10(Math.max(y, 1e-12))]) },
                    ];
                }
                return [
                    { label: t('发生率 n(t)', 'rate n(t)'), color: '#185FA5', points: rate },
                    { label: t('累积数 N(t)/8', 'cumulative N(t)/8'), color: '#993C1D', points: cum },
                ];
            },
        },
    ],
    example: {
        title: t('预估未来余震数', 'Forecasting the number of future aftershocks'),
        input: t('K = 80，p = 1.05，c = 0.05 天，问第 10 到 30 天之间有多少个 M ≥ 3 余震', 'K = 80, p = 1.05, c = 0.05 d; how many M ≥ 3 aftershocks between days 10 and 30'),
        steps: [
            t('N(30) = 80×[(30.05)^(−0.05) − 0.05^(−0.05)]/(−0.05) = 80×(0.8553 − 1.2699)/(−0.05) = 663', 'N(30) = 80×[(30.05)^(−0.05) − 0.05^(−0.05)]/(−0.05) = 80×(0.8553 − 1.2699)/(−0.05) = 663'),
            t('N(10) = 80×[(10.05)^(−0.05) − 1.2699]/(−0.05) = 80×(0.9004 − 1.2699)/(−0.05) = 591', 'N(10) = 80×[(10.05)^(−0.05) − 1.2699]/(−0.05) = 80×(0.9004 − 1.2699)/(−0.05) = 591'),
        ],
        output: t('第 10–30 天新增约 72 个余震，衰减已明显放缓', 'About 72 new aftershocks between days 10 and 30; the decay has clearly slowed'),
    },
    links: {
        upstream: [{ id: 'omori-law', note: t('原始大森定律是 p = 1 的特例', 'The original Omori law is the p = 1 special case') }],
        downstream: [{ id: 'etas-model', note: t('ETAS 把 Omori 作为基础触发项', 'ETAS uses Omori as the base triggering term') }],
        seealso: [{ id: 'gutenberg-richter-law', note: t('GR 律描述震级分布，Omori 描述时间分布', 'GR describes the magnitude distribution, Omori the time distribution') }],
    },
    refs: [{ text: 'Utsu (1961), A statistical study on the occurrence of aftershocks, Geophys. Mag. 30, 521–605' }],
};
export default modifiedOmoriLaw;
//# sourceMappingURL=modified-omori-law.js.map