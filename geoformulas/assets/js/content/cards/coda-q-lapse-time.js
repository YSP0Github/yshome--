import { t } from '../../core/types.js';
/** coda-q-lapse-time */
const codaQlapseTime = {
    id: 'coda-q-lapse-time',
    name: t('尾波 Q 的流逝时间依赖', 'Lapse-time Dependence of Coda Q'),
    aliases: { zh: ['尾波 Q', '流逝时间', 'Qc 依赖'], en: ['coda Q', 'lapse time', 'Qc dependence'] },
    node: 'S6.4',
    tags: {
        math: ['MATH.APPROX', 'MATH.STAT'],
        method: ['METH.ATTEN'],
        quantity: ['Q.AMP', 'Q.TIME'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `A_c(f, t) = S(f)\,t^{-\gamma}\exp\!\left(-\frac{\pi f t}{Q_c(f)}\right)
\quad\Longrightarrow\quad
Q_c(f) \text{ 由 } \ln\!\big[A_c(f,t)\,t^{\gamma}\big] \text{ 对 } t \text{ 的斜率给出}`,
        variants: [
            { name: t('单散射（Sato）尾波包络模型', 'Single-scattering (Sato) coda envelope'), latex: String.raw `A_c(f,t) \propto t^{-1}\exp\!\left(-\frac{\pi f t}{Q_c}\right)\ \ (\gamma = 1)` },
            { name: t('经验幂律', 'Empirical power law'), latex: String.raw `Q_c(f) = Q_0 f^{\alpha}` },
            { name: t('Qc 随流逝时间增大而增大', 'Qc increases with lapse time'), latex: String.raw `Q_c(t) \approx Q_c(t_0)\left(\frac{t}{t_0}\right)^{\delta},\quad \delta \approx 0.2\text{–}0.5` },
        ],
    },
    meaning: t('地震图的尾波部分来自岩石圈里无数小尺度非均匀性的散射。它的振幅随时间按两个机制衰减：几何扩散（幂律 t^−γ）和介质吸收（指数 exp(−πft/Qc)）。把几何扩散校正掉之后，剩下的指数衰减速率就给出 Qc。一个稳健的经验事实是：取的尾波窗口越晚，算出的 Qc 越大 —— 因为晚到尾波的平均传播路径更深，而深部 Q 更高。', 'The coda of a seismogram comes from scattering off innumerable small-scale heterogeneities in the lithosphere. Its amplitude decays by two mechanisms: geometrical spreading (a power law t^−γ) and intrinsic absorption (an exponential exp(−πft/Qc)). After correcting for geometrical spreading, the remaining exponential decay rate yields Qc. A robust empirical fact: the later the coda window, the larger the Qc — because late coda samples deeper propagation paths where Q is higher.'),
    symbols: [
        { sym: 'A_c', name: t('尾波均方根振幅', 'coda RMS amplitude'), unit: '—' },
        { sym: 't', name: t('从发震时刻起算的流逝时间', 'lapse time from the origin time'), unit: 's' },
        { sym: '\\gamma', name: t('几何扩散指数（1=体波, 0.5=面波）', 'geometrical spreading exponent (1 body wave, 0.5 surface wave)'), unit: '无量纲' },
        { sym: 'Q_c', name: t('尾波品质因子', 'coda quality factor'), unit: '无量纲' },
        { sym: 'Q_0, \\alpha', name: t('频率依赖幂律的系数与指数', 'coefficient and exponent of the frequency power law'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('区域 Qc 成像、火山与断层带监测、Qc 随时间变化', 'Regional Qc imaging, volcano and fault-zone monitoring, temporal Qc changes')],
        assumes: [t('单次散射主导（Aki & Chouet 模型）', 'Single scattering dominates (Aki & Chouet model)')],
        breaks: [t('多次散射占优时单散射模型失效', 'The single-scattering model fails when multiple scattering dominates'), t('尾波窗口内混入后续事件或强噪声', 'Later events or strong noise inside the coda window')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把尾波振幅写成扩散项 × 吸收项', 'Write the coda amplitude as a spreading term times an absorption term'), latex: String.raw `A_c(f,t) = S(f)\,t^{-\gamma}\,e^{-\pi f t/Q_c}` },
        { n: 2, op: 'identity', title: t('取对数使两项分离', 'Take the logarithm to separate the two terms'), latex: String.raw `\ln A_c = \ln S - \gamma\ln t - \frac{\pi f}{Q_c}t` },
        { n: 3, op: 'algebra', title: t('移项，构造对 t 的线性关系', 'Rearrange into a linear relation in t'), latex: String.raw `\ln\!\big[A_c t^{\gamma}\big] = \ln S - \frac{\pi f}{Q_c}t` },
        { n: 4, op: 'substitute', title: t('斜率 b = −πf/Qc', 'The slope is b = −πf/Qc'), latex: String.raw `b = -\frac{\pi f}{Q_c}` },
        { n: 5, op: 'result', title: t('解出 Qc', 'Solve for Qc'), latex: String.raw `Q_c = -\frac{\pi f}{b}` },
    ],
    viz: [
        {
            id: 'coda-fit',
            level: 'V2',
            title: t('尾波包络与 Qc 的线性拟合', 'Coda envelope and the linear fit for Qc'),
            xlabel: t('流逝时间 t (s)', 'lapse time t (s)'),
            ylabel: t('ln A_c 与 ln[A_c · t^γ]', 'ln A_c and ln[A_c · t^γ]'),
            controls: [
                { id: 'qc', label: t('真实 Qc', 'true Qc'), min: 50, max: 1200, step: 10, value: 350 },
                { id: 'f', label: t('分析频率 f (Hz)', 'analysis frequency f (Hz)'), min: 0.5, max: 16, step: 0.1, value: 3 },
                { id: 'gam', label: t('扩散指数 γ', 'spreading exponent γ'), min: 0.2, max: 1.5, step: 0.05, value: 1 },
            ],
            note: t('灰色曲线是原始尾波振幅（弯曲，因为混了几何扩散）；蓝色直线是校正掉 t^γ 之后的结果 —— 只有它才是真正的直线，斜率给出 Qc。γ 取错会得到一条弯的线，进而得到错误的 Qc。', 'The grey curve is the raw coda amplitude (curved because geometrical spreading is mixed in); the blue line is the result after correcting for t^γ — only it is truly straight and its slope gives Qc. Choosing γ wrongly leaves a curved line and hence a wrong Qc.'),
            compute: (p) => {
                const qc = p['qc'], f = p['f'], gam = p['gam'];
                const lnS = Math.log(1e-3);
                const raw = [];
                const cor = [];
                for (let i = 0; i <= 200; i++) {
                    const t = 10 + (i / 200) * 190;
                    const lnA = lnS - gam * Math.log(t) - (Math.PI * f * t) / qc;
                    const jitter = 0.04 * Math.sin(t * 1.7);
                    raw.push([t, lnA + jitter]);
                    cor.push([t, lnA + gam * Math.log(t) + jitter]);
                }
                const shift = cor[0][1] - raw[0][1];
                return [
                    { label: t('ln A_c（原始）', 'ln A_c (raw)'), color: '#888780', points: raw },
                    { label: t('ln[A_c t^γ]（校正后）', 'ln[A_c t^γ] (corrected)'), color: '#185FA5', points: cor.map(([x, y]) => [x, y - shift]) },
                ];
            },
        },
        {
            id: 'coda-depth',
            level: 'V1',
            title: t('Qc 随流逝时间（等效深度）增大', 'Qc increases with lapse time (equivalent depth)'),
            xlabel: t('流逝时间 t (s)', 'lapse time t (s)'),
            ylabel: t('Q_c', 'Q_c'),
            controls: [
                { id: 'q0', label: t('起始 Qc', 'starting Qc'), min: 40, max: 600, step: 5, value: 120 },
                { id: 'd', label: t('增长率指数 δ', 'growth exponent δ'), min: 0, max: 0.8, step: 0.02, value: 0.35 },
            ],
            note: t('这条上升曲线是尾波 Q 最重要的经验特征：它说明浅部地壳 Q 低（裂隙、流体、沉积层），深部 Q 高。用不同流逝时间窗测 Qc，实际上是在给不同深度区间采样。', 'This rising curve is the most important empirical feature of coda Q: it says shallow crust has low Q (cracks, fluids, sediments) while the deep crust has high Q. Measuring Qc with different lapse-time windows effectively samples different depth ranges.'),
            compute: (p) => {
                const q0 = p['q0'], d = p['d'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const t = 10 + (i / 200) * 190;
                    pts.push([t, q0 * Math.pow(t / 10, d)]);
                }
                return [{ label: t('Q_c(t) = Q_c(t₀)(t/t₀)^δ', 'Q_c(t) = Q_c(t₀)(t/t₀)^δ'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('从斜率算 Qc', 'Computing Qc from the slope'),
        input: t('f = 3 Hz，拟合斜率 b = −0.027 s⁻¹', 'f = 3 Hz, fitted slope b = −0.027 s⁻¹'),
        steps: [
            t('Qc = −πf / b', 'Qc = −πf / b'),
            t('Qc = −π × 3 / (−0.027) = 349', 'Qc = −π × 3 / (−0.027) = 349'),
        ],
        output: t('Qc ≈ 350，属于构造活跃区的典型值', 'Qc ≈ 350, a typical value for a tectonically active region'),
    },
    links: {
        upstream: [
            { id: 'coda-q-method', note: t('尾波 Q 的基本提取流程', 'The basic coda-Q extraction procedure') },
            { id: 'attenuation-coefficient-q', note: t('吸收系数的定义', 'Definition of the absorption coefficient') },
        ],
        seealso: [
            { id: 'power-law-q', note: t('Q(f) = Q₀f^α 的经验形式', 'The empirical form Q(f) = Q₀f^α') },
            { id: 'geometrical-spreading', note: t('几何扩散是必须校正的另一项', 'Geometrical spreading is the other term to correct') },
        ],
    },
    refs: [{ text: 'Aki & Chouet (1975), Origin of coda waves, JGR 80, 3322–3342' }],
};
export default codaQlapseTime;
//# sourceMappingURL=coda-q-lapse-time.js.map