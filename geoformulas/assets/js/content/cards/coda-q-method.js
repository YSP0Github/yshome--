import { t } from '../../core/types.js';
/** coda-q-method */
const codaQMethod = {
    id: 'coda-q-method',
    name: t('尾波 Q（Aki–Chouet 方法）', 'Coda Q (Aki–Chouet Method)'),
    aliases: { zh: ['尾波 Q', 'coda Q'], en: ['coda Q', 'Aki-Chouet method'] },
    node: 'S6.4',
    tags: {
        math: ['MATH.FOURIER', 'MATH.STAT'],
        method: ['METH.ATTEN'],
        quantity: ['Q.AMP', 'Q.TIME'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `A(f,t)=C(f)\,t^{-n}\,e^{-\pi f t/Q_c}`,
        variants: [
            { name: t('单散射模型下的取对数形式', 'Logarithmic form under the single-scattering model'), latex: String.raw `\ln\!\left[A(f,t)\,t^{n}\right]=\ln C(f)-\frac{\pi f}{Q_c}\,t` },
            { name: t('n 的取值', 'Value of n'), latex: String.raw `n=1\ (\text{体波单散射}),\quad n=1/2\ (\text{面波}),\quad n=3/2\ (\text{扩散近似})` },
        ],
    },
    meaning: t('地震图尾部的「尾波」是波在介质中被无数小尺度非均匀散射后堆积起来的。Aki 与 Chouet 指出：尾波振幅随时间指数衰减，衰减率只由介质的 Q 决定，而与震源、路径、场地几乎无关。这让 coda Q 成为最容易测量、也最稳定的 Q 指标 —— 代价是它对 Q 的空间分布几乎不敏感。', 'The coda at the tail of a seismogram is built up by scattering from innumerable small-scale heterogeneities. Aki and Chouet showed that coda amplitude decays exponentially in time at a rate set only by the medium Q, almost independent of source, path and site. This makes coda Q the easiest and most stable Q measure — at the price of being nearly insensitive to the spatial distribution of Q.'),
    symbols: [
        { sym: 'A(f,t)', name: t('t 时刻、频率 f 的尾波均方根振幅', 'RMS coda amplitude at time t and frequency f'), unit: '与位移同' },
        { sym: 'Q_c', name: t('尾波 Q', 'coda Q'), unit: '无量纲', typical: '50 – 1000' },
        { sym: 'n', name: t('几何扩散指数', 'geometrical spreading exponent'), unit: '无量纲' },
        { sym: 'C(f)', name: t('与震源有关的常数', 'source-dependent constant'), unit: '与位移同' },
    ],
    conditions: {
        applies: [t('地方震尾波（单次散射主导）', 'Local-earthquake codas (single-scattering dominated)')],
        assumes: [
            t('散射体在震源—台站周围椭球体内均匀分布', 'Scatterers are uniformly distributed in an ellipsoid around the source and station'),
            t('单次散射近似（多次散射可忽略）', 'Single-scattering approximation (multiple scattering negligible)'),
        ],
        breaks: [t('长时间尾波受多次散射控制，衰减偏离单指数', 'At long lapse times multiple scattering dominates and the decay departs from a single exponential')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('尾波由散射波叠加而成', 'The coda is a superposition of scattered waves'),
            latex: String.raw `A(f,t)\propto t^{-n}\,e^{-\pi f t/Q_c}` },
        { n: 2, op: 'identity', title: t('取对数并移项', 'Take logs and rearrange'),
            latex: String.raw `\ln\!\left[A(f,t)\,t^{n}\right]=\ln C(f)-\frac{\pi f}{Q_c}t` },
        { n: 3, op: 'result', title: t('由斜率求 Q_c', 'Obtain Q_c from the slope'),
            latex: String.raw `\text{slope}=-\frac{\pi f}{Q_c}\;\Longrightarrow\; Q_c=-\frac{\pi f}{\text{slope}}` },
    ],
    links: {
        seealso: [
            { id: 'spectral-ratio-q', note: t('对路径敏感的另一类方法', 'A path-sensitive alternative') },
            { id: 'quality-factor-q', note: t('Q 的定义', 'Definition of Q') },
        ],
    },
    refs: [{ text: 'Aki & Chouet (1975), J. Geophys. Res., 80' }],
};
export default codaQMethod;
//# sourceMappingURL=coda-q-method.js.map