import { t } from '../../core/types.js';
/** period-frequency */
const periodFrequency = {
    id: 'period-frequency',
    name: t('周期与频率的关系', 'The Period–Frequency Relation'),
    aliases: { zh: ['周期频率互化', 'T 与 f 的换算'], en: ['period and frequency', 'reciprocal relation', 'T = 1/f'] },
    node: 'S0.1',
    tags: {
        method: ['METH.PROC'],
        quantity: ['Q.TIME', 'Q.FREQ'],
        keywords: t('周期 频率 倒数 赫兹 每秒振动次数', 'period frequency reciprocal hertz cycles per second'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `T=\frac{1}{f}\quad\Longleftrightarrow\quad f=\frac{1}{T}`,
        variants: [
            { name: t('用角频率写出', 'In terms of angular frequency'), latex: String.raw `T=\frac{2\pi}{\omega},\qquad f=\frac{\omega}{2\pi}` },
            { name: t('与波速、波长联立', 'Combined with wave speed and wavelength'), latex: String.raw `T=\frac{\lambda}{c},\qquad f=\frac{c}{\lambda}` },
            { name: t('N 次振动耗时 Δt 时的定义式', 'Definition from N cycles in a time span Δt'), latex: String.raw `T=\frac{\Delta t}{N},\qquad f=\frac{N}{\Delta t}` },
        ],
    },
    meaning: t('周期 T 与频率 f 描述同一件事的两面：前者问「一次振动要多久」，后者问「一秒钟振动几次」，所以它们互为倒数。地震学里两端都会用到：天然地震的面波周期是几十秒，而勘探地震的主频是几十赫兹，换算能力是读图的第一基本功。', 'Period T and frequency f are two faces of the same thing: the former asks how long one cycle takes, the latter how many cycles fit into one second, so they are reciprocals. Seismology lives at both ends: surface waves from great earthquakes have periods of tens of seconds, while exploration seismics works at tens of hertz. Converting fluently between them is the first literacy of trace reading.'),
    symbols: [
        { sym: 'T', name: t('周期：完成一次完整振动所需的时间', 'period: time for one complete cycle'), unit: 's', dimension: 'T', typical: '10⁻³ – 10² s' },
        { sym: 'f', name: t('频率：单位时间内振动的次数', 'frequency: number of cycles per unit time'), unit: 'Hz = s⁻¹', dimension: 'T⁻¹', typical: '10⁻³ – 10³ Hz' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: '\\lambda', name: t('波长（此处为波长，非 Lamé 常数）', 'wavelength (here wavelength, not the Lamé constant)'), unit: 'm' },
        { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: 'N', name: t('在 Δt 内数出的完整振动次数', 'number of complete cycles counted within Δt'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('严格周期运动：每个循环完全一致', 'Strictly periodic motion: every cycle is identical'),
            t('实际地震记录中也常用于「视周期」（相邻两个峰的时间间隔）', 'Also applied to records as the "apparent period", the interval between two adjacent peaks'),
        ],
        assumes: [
            t('时间轴是均匀采样的，Δt 用同一时钟度量', 'The time axis is uniformly sampled and Δt is measured with one clock'),
            t('数峰法假设波形没有叠加第二个频率相近的成分', 'Peak counting assumes no second, similar-frequency component is superposed'),
        ],
        breaks: [
            t('非平稳信号（如 Chirp、震源时间函数）没有单一的 T 或 f', 'Non-stationary signals such as chirps or source time functions have no single T or f'),
            t('含噪声时直接数峰会严重偏估，应改用频谱估计', 'With noise, direct peak counting is badly biased; use spectral estimation instead'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('周期的定义：一个循环占用的时间', 'Definition of the period: time occupied by one cycle'),
            latex: String.raw `T\equiv \frac{\text{一次完整振动}}{\text{所经历的时间}}\;=\;\frac{\Delta t}{N}`,
            note: t('分子是「一个循环」这件事本身，所以量纲是时间。', 'The numerator is the single cycle itself, so the dimension is time.'),
        },
        {
            n: 2,
            op: 'setup',
            title: t('频率的定义：单位时间内的循环数', 'Definition of the frequency: cycles per unit time'),
            latex: String.raw `f\equiv \frac{N}{\Delta t}`,
            note: t('把同一个比值倒过来写，量纲就变成 1/时间，单位是赫兹 Hz。', 'Writing the same ratio upside down turns the dimension into inverse time, measured in hertz.'),
        },
        {
            n: 3,
            op: 'algebra',
            title: t('两式相乘消去 N 与 Δt', 'Multiply the two to cancel N and Δt'),
            latex: String.raw `T\cdot f=\frac{\Delta t}{N}\cdot\frac{N}{\Delta t}=1`,
        },
        {
            n: 4,
            op: 'result',
            title: t('得到互反关系及其量纲检查', 'The reciprocal relation, with a dimension check'),
            latex: String.raw `T=\frac{1}{f},\qquad f=\frac{1}{T},\qquad [T][f]=\mathrm{s}\cdot\mathrm{s^{-1}}=1`,
            note: t('量纲乘积为 1 是这条关系不可能写错的最强保险。', 'A dimensionless product of 1 is the strongest insurance against writing this relation wrongly.'),
        },
        {
            n: 5,
            op: 'substitute',
            title: t('换成角频率与波速的写法', 'Rewritten with angular frequency and wave speed'),
            latex: String.raw `\omega=2\pi f=\frac{2\pi}{T},\qquad c=\lambda f\;\Longrightarrow\;T=\frac{\lambda}{c}`,
            note: t('这三个式子构成后面所有波参数换算的枢纽。', 'These three expressions form the hub of every later wave-parameter conversion.'),
        },
    ],
    example: {
        title: t('读一张远震垂直分量记录', 'Reading a teleseismic vertical-component record'),
        input: t('两个相邻波峰的时间差为 20 s', 'Two adjacent peaks are 20 s apart'),
        steps: [
            t('T = 20 s', 'T = 20 s'),
            t('f = 1/T = 0.05 Hz', 'f = 1/T = 0.05 Hz'),
            t('ω = 2πf = 0.314 rad/s', 'ω = 2πf = 0.314 rad/s'),
        ],
        output: t('这是典型的 20 s 面波；同一张图上 1 Hz 的体波细节与之相差 20 倍频率', 'A typical 20 s surface wave; 1 Hz body-wave detail on the same record differs from it by a factor of twenty in frequency'),
    },
    links: {
        downstream: [
            { id: 'angular-frequency', note: t('把 f 换算成 ω', 'converts f into ω') },
            { id: 'wavenumber-wavelength', note: t('把 T 换算成空间尺度', 'converts T into a spatial scale') },
        ],
        seealso: [{ id: 'harmonic-plane-wave' }],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default periodFrequency;
//# sourceMappingURL=period-frequency.js.map