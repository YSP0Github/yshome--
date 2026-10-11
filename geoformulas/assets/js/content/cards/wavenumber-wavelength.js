import { t } from '../../core/types.js';
/** wavenumber-wavelength */
const wavenumberWavelength = {
    id: 'wavenumber-wavelength',
    name: t('波数与波长', 'Wavenumber and Wavelength'),
    aliases: { zh: ['k=2π/λ', '空间频率'], en: ['wavenumber', 'spatial frequency', 'k = 2 pi over lambda'] },
    node: 'S0.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.FOURIER'],
        method: ['METH.PROC'],
        quantity: ['Q.FREQ', 'Q.GEOM'],
        keywords: t('波数 波长 空间频率 每米相位 视波数', 'wavenumber wavelength spatial frequency phase per metre apparent wavenumber'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `k=\frac{2\pi}{\lambda}`,
        variants: [
            { name: t('由相位定义', 'Defined through the phase'), latex: String.raw `k\equiv \frac{\dd\varphi}{\dd x},\qquad \varphi(x)=kx+\varphi_0` },
            { name: t('矢量形式：波数矢量指向传播方向', 'Vector form: the wavenumber vector points along propagation'), latex: String.raw `\mathbf{k}=k\,\hat{\mathbf{n}},\qquad |\mathbf{k}|=\frac{2\pi}{\lambda},\qquad \mathbf{k}\cdot\mathbf{x}=k_ix_i` },
            { name: t('水平视波数（台阵测量）', 'Horizontal apparent wavenumber, as measured by an array'), latex: String.raw `k_x=k\sin\theta=\omega p=\frac{\omega\sin\theta}{c}` },
        ],
    },
    meaning: t('波长 λ 说的是「空间上多长算一个循环」，波数 k 说的是「每走一米相位前进多少弧度」，两者互为 2π 倍的倒数，正如 T 与 ω 的关系。进入二维、三维后，波长升格为波数矢量 k，它的方向就是传播方向，大小仍是 2π/λ —— 射线参数、台阵聚束、f-k 滤波都建立在这个矢量之上。', 'Wavelength λ asks how long one cycle is in space; wavenumber k asks how many radians of phase advance per metre travelled. They are reciprocals up to the same 2π that links T and ω. In two and three dimensions the wavelength is promoted to the wavenumber vector k, whose direction is the propagation direction and whose magnitude is still 2π/λ — ray parameter, array beamforming and f-k filtering are all built on that vector.'),
    symbols: [
        { sym: 'k', name: t('波数（角波数）', 'wavenumber, or angular wavenumber'), unit: 'rad/m', dimension: 'L⁻¹', typical: '10⁻⁵ – 10⁻¹ rad/m' },
        { sym: '\\lambda', name: t('波长（此处为波长，非 Lamé 常数）', 'wavelength — note: wavelength here, not the Lamé constant'), unit: 'm', typical: '10² – 10⁵ m' },
        { sym: '\\mathbf{k}', name: t('波数矢量', 'wavenumber vector'), unit: 'rad/m' },
        { sym: '\\hat{\\mathbf{n}}', name: t('传播方向的单位矢量', 'unit vector along the propagation direction'), unit: '1' },
        { sym: 'k_x', name: t('水平（视）波数', 'horizontal, or apparent, wavenumber'), unit: 'rad/m' },
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter, that is, horizontal slowness'), unit: 's/m' },
        { sym: '\\theta', name: t('入射角（相对法向）', 'incidence angle measured from the normal'), unit: 'rad' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
    ],
    conditions: {
        applies: [
            t('单色平面波，或任意波场按平面波分解后的每一个分量', 'A monochromatic plane wave, or each component after decomposing an arbitrary wavefield into plane waves'),
            t('均匀介质中 k 为常数；层状介质中 k 逐层不同', 'k is constant in a homogeneous medium and differs from layer to layer in a stratified one'),
        ],
        assumes: [
            t('介质在波长尺度上可视为均匀（否则 k 是位置的函数）', 'The medium is homogeneous on the scale of a wavelength, otherwise k becomes a function of position'),
            t('传播方向明确，可以定义单一 k̂', 'A single propagation direction exists so that a single k̂ can be defined'),
        ],
        breaks: [
            t('近场、倏逝波中 k 为复数，虚部描述指数衰减', 'In the near field and for evanescent waves k is complex, its imaginary part describing exponential decay'),
            t('强散射介质中波场不是单一平面波，需按 k 谱统计描述', 'In strongly scattering media the field is not one plane wave and must be described statistically by its k-spectrum'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'geometry',
            title: t('空间上一个循环 = 一个波长', 'One cycle in space is one wavelength'),
            latex: String.raw `1\ \text{个空间循环}=\lambda\ \text{m}\;\hat{=}\;2\pi\ \text{rad}`,
            note: t('与「一个周期 T 对应 2π 弧度」完全对称，只是把时间换成空间。', 'Exactly symmetric to "one period T corresponds to 2π radians", with space replacing time.'),
        },
        {
            n: 2,
            op: 'setup',
            title: t('波数定义为相位的空间变化率', 'Define the wavenumber as the spatial rate of change of phase'),
            latex: String.raw `k\equiv\frac{\dd\varphi}{\dd x}`,
        },
        {
            n: 3,
            op: 'physics',
            title: t('沿传播方向走过一个 λ，相位恰好增加 2π', 'Travelling one λ along the propagation direction advances the phase by 2π'),
            latex: String.raw `\varphi(x+\lambda)-\varphi(x)=k\lambda=2\pi`,
        },
        {
            n: 4,
            op: 'algebra',
            title: t('解出 k', 'Solve for k'),
            latex: String.raw `k=\frac{2\pi}{\lambda}`,
        },
        {
            n: 5,
            op: 'identity',
            title: t('升维：波长变成波数矢量', 'Going up a dimension: the wavelength becomes a wavenumber vector'),
            latex: String.raw `\mathbf{k}=\frac{2\pi}{\lambda}\,\hat{\mathbf{n}},\qquad u(\mathbf{x},t)=A\cos(\mathbf{k}\cdot\mathbf{x}-\omega t)`,
            note: t('在三维里「波长」只能给出长度，说不清波往哪走；写成 k 矢量后方向自动带上。', 'In three dimensions a wavelength only supplies a length and cannot say where the wave is heading; the vector k carries the direction automatically.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('与射线参数的关系', 'Relation to the ray parameter'),
            latex: String.raw `k_x=k\sin\theta=\frac{\omega}{c}\sin\theta=\omega p`,
            note: t('这条式子是台阵测视速度、做 f-k 滤波的直接依据。', 'This expression is the direct basis of array apparent-velocity measurement and of f-k filtering.'),
        },
    ],
    viz: [
        {
            id: 'spatial-cycles',
            level: 'V1',
            title: t('一个波长之内相位走完 2π', 'The phase completes 2π within one wavelength'),
            xlabel: t('位置 x (m)', 'position x (m)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'lam', label: t('波长 λ', 'wavelength λ'), min: 20, max: 400, step: 5, value: 100, unit: 'm' },
                { id: 'A', label: t('振幅 A', 'amplitude A'), min: 0.1, max: 2, step: 0.05, value: 1, unit: 'm' },
            ],
            xRange: [0, 800],
            note: t('λ 越小，同样距离里塞进的循环越多，k 越大 —— k 就是「空间里的频率」。这就是为什么短波长（高频）能分辨小尺度构造。', 'The smaller λ is, the more cycles are packed into the same distance, and the larger k becomes — k is literally frequency in space. That is why short wavelengths, that is high frequencies, resolve small structures.'),
            compute: (p) => {
                const lam = p['lam'];
                const A = p['A'];
                const k = (2 * Math.PI) / lam;
                const pts = [];
                for (let i = 0; i <= 800; i++) {
                    const x = (i / 800) * 800;
                    pts.push([x, A * Math.cos(k * x)]);
                }
                return [{ label: t('u(x) = A cos(kx)', 'u(x) = A cos(kx)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'k-spectrum',
            level: 'V1',
            title: t('k 与 λ 的反比关系（双对数）', 'k versus λ on logarithmic axes'),
            xlabel: t('波长 λ (m)', 'wavelength λ (m)'),
            ylabel: t('波数 k (rad/m)', 'wavenumber k (rad/m)'),
            xScale: 'log',
            yScale: 'log',
            controls: [
                { id: 'dummy', label: t('曲线无额外参数（占位控件）', 'no free parameter, placeholder control'), min: 0, max: 1, step: 1, value: 0, unit: '1' },
            ],
            xRange: [1, 100000],
            note: t('在双对数坐标上 k = 2π/λ 是一条斜率 −1 的直线：波长每增大十倍，波数减小十倍。地震学跨越 10⁰ – 10⁵ m 的波长范围，对应的 k 跨越五个数量级。', 'On logarithmic axes k = 2π/λ is a straight line of slope −1: every tenfold increase in wavelength divides the wavenumber by ten. Seismology spans wavelengths from 1 to 10⁵ m, five orders of magnitude in k.'),
            compute: () => {
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const lam = Math.pow(10, (i / 200) * 5);
                    pts.push([lam, (2 * Math.PI) / lam]);
                }
                return [{ label: t('k = 2π/λ', 'k = 2π/λ'), color: '#0F6E56', points: pts }];
            },
        },
    ],
    example: {
        title: t('近地表勘探中的波数', 'Wavenumber in near-surface exploration'),
        input: t('面波相速度 c = 200 m/s，频率 f = 20 Hz', 'surface-wave phase velocity c = 200 m/s at f = 20 Hz'),
        steps: [
            t('λ = c/f = 10 m', 'λ = c/f = 10 m'),
            t('k = 2π/λ = 0.628 rad/m', 'k = 2π/λ = 0.628 rad/m'),
            t('ω = 2πf = 125.7 rad/s，校核 ω = kc = 125.7 rad/s', 'ω = 2πf = 125.7 rad/s, and the check ω = kc gives the same'),
        ],
        output: t('10 m 波长意味着该方法能分辨的横向尺度约为半个波长，即 5 m', 'A 10 m wavelength means the resolved lateral scale is about half a wavelength, roughly 5 m'),
    },
    links: {
        upstream: [{ id: 'angular-frequency', note: t('ω 与 k 通过 c 配对', 'ω and k are paired through c') }],
        downstream: [
            { id: 'phase-velocity', note: t('c = ω/k', 'c = ω/k') },
            { id: 'snell-ray-parameter', note: t('k_x = ωp', 'k_x = ωp') },
        ],
        seealso: [{ id: 'harmonic-plane-wave' }],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' },
    ],
};
export default wavenumberWavelength;
//# sourceMappingURL=wavenumber-wavelength.js.map