import { t } from '../../core/types.js';
/** poisson-earthquake-occurrence */
const poissonEarthquakeOccurrence = {
    id: 'poisson-earthquake-occurrence',
    name: t('地震发生的泊松模型', 'Poisson Model of Earthquake Occurrence'),
    aliases: { zh: ['泊松过程', '复发间隔'], en: ['Poisson process', 'recurrence interval', 'BPT model'] },
    node: 'S12.3',
    tags: {
        math: ['MATH.STAT'],
        method: ['METH.STAT', 'METH.HAZARD'],
        quantity: ['Q.TIME'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `P(N(T)=k)=\frac{\left(\lambda T\right)^{k}}{k!}\,e^{-\lambda T},\qquad P(\text{无事件})=e^{-\lambda T}`,
        variants: [
            { name: t('指数分布的等待时间', 'Exponentially distributed waiting time'), latex: String.raw `f(\Delta t)=\lambda\,e^{-\lambda\Delta t},\qquad \Delta t_{\text{平均}}=\frac{1}{\lambda}` },
            { name: t('布朗经过时间（BPT）模型', 'The Brownian passage time (BPT) model'), latex: String.raw `f(\Delta t)=\sqrt{\frac{\mu}{2\pi\alpha^{2}\Delta t^{3}}}\exp\!\left[-\frac{\left(\Delta t-\mu\right)^{2}}{2\alpha^{2}\mu\Delta t}\right]` },
            { name: t('变异系数（Poisson 为 1）', 'Coefficient of variation (1 for Poisson)'), latex: String.raw `C_v=\frac{\sigma_{\Delta t}}{\overline{\Delta t}}=\sqrt{\frac{\alpha^{2}\mu}{\mu^{2}}}=\alpha\quad (\text{BPT})` },
        ],
    },
    meaning: t('泊松模型假设地震「无记忆」：刚发生过大地震不代表未来更安全或更危险，复发间隔服从指数分布。这是危险性分析最常用的零假设，但它明显不符合单条断层的实际行为 —— 真实断层有准周期性的应力积累，因此引入了 BPT、对数正态等「有记忆」模型，它们的复发间隔分布更集中（C_v < 1）。', 'The Poisson model assumes earthquakes are memoryless: a recent large event does not make the future safer or more dangerous, and recurrence intervals are exponentially distributed. It is the most common null hypothesis in hazard analysis, but it clearly contradicts the behaviour of individual faults, which accumulate stress quasi-periodically. Hence memory-bearing models such as BPT and lognormal, whose recurrence intervals are more clustered (C_v < 1).'),
    symbols: [
        { sym: '\\lambda', name: t('年平均发生率', 'mean annual occurrence rate'), unit: '1/a' },
        { sym: '\\Delta t', name: t('复发间隔', 'recurrence interval'), unit: 'a' },
        { sym: '\\mu', name: t('平均复发间隔', 'mean recurrence interval'), unit: 'a', typical: '100 – 10000' },
        { sym: '\\alpha', name: t('BPT 的变异系数', 'aperiodicity (coefficient of variation) of BPT'), unit: '无量纲', typical: '0.3 – 0.7' },
    ],
    conditions: {
        applies: [t('区域尺度的长期发生率建模、危险性分析', 'Long-term rate modelling at regional scale; hazard analysis')],
        assumes: [t('事件相互独立、发生率恒定', 'Events are independent and the rate is constant')],
        breaks: [t('余震序列、触发、应力相互作用明显时，泊松假设不成立', 'When aftershock triggering and stress interaction are pronounced the Poisson assumption fails')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设单位时间内发生一次的概率为 λ dt', 'In a unit interval the probability of one event is λ dt'),
            latex: String.raw `P(1\ \text{in}\ \mathrm{d}t)=\lambda\,\mathrm{d}t+o(\mathrm{d}t)` },
        { n: 2, op: 'identity', title: t('无记忆性 → 指数等待时间', 'Memorylessness → exponential waiting time'),
            latex: String.raw `P(\Delta t>t+s\mid\Delta t>s)=P(\Delta t>t)\;\Longrightarrow\; f(\Delta t)=\lambda e^{-\lambda\Delta t}` },
        { n: 3, op: 'result', title: t('区间内计数服从泊松分布', 'The count in an interval is Poisson'),
            latex: String.raw `P(N(T)=k)=\frac{(\lambda T)^k}{k!}e^{-\lambda T}` },
    ],
    links: {
        upstream: [{ id: 'gutenberg-richter-law', note: t('λ 由它对目标震级积分得到', 'λ follows by integrating it up to the target magnitude') }],
        seealso: [{ id: 'psha-integral', note: t('泊松假设是 PSHA 的基石', 'The Poisson assumption underpins PSHA') }],
    },
    refs: [{ text: 'Matthews et al. (2002), Bull. Seismol. Soc. Am., 92' }],
};
export default poissonEarthquakeOccurrence;
//# sourceMappingURL=poisson-earthquake-occurrence.js.map