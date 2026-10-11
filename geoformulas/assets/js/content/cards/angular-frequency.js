import { t } from '../../core/types.js';
/** angular-frequency */
const angularFrequency = {
    id: 'angular-frequency',
    name: t('角频率', 'Angular Frequency'),
    aliases: { zh: ['圆频率', 'ω=2πf'], en: ['angular frequency', 'radian frequency', 'omega = 2 pi f'] },
    node: 'S0.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.COMPLEX'],
        method: ['METH.PROC'],
        quantity: ['Q.FREQ', 'Q.TIME'],
        keywords: t('角频率 圆频率 弧度每秒 相位变化率 复指数', 'angular frequency radian frequency radian per second phase rate complex exponential'),
    },
    audience: 'highschool',
    complete: 'L3',
    statement: {
        main: String.raw `\omega=2\pi f=\frac{2\pi}{T}`,
        variants: [
            { name: t('由相位定义', 'Defined through the phase'), latex: String.raw `\omega\equiv \frac{\dd\varphi}{\dd t},\qquad \varphi(t)=\omega t+\varphi_0` },
            { name: t('与波数、波速的关系', 'Relation to wavenumber and speed'), latex: String.raw `\omega=k\,c` },
            { name: t('无阻尼振子的固有角频率', 'Natural angular frequency of an undamped oscillator'), latex: String.raw `\omega_0=\sqrt{\frac{k_s}{m}}=2\pi f_0` },
        ],
    },
    meaning: t('普通频率 f 数的是「一秒钟转了几圈」，角频率 ω 数的是「一秒钟转了多少弧度」——一圈是 2π 弧度，所以两者只差一个 2π。之所以要引入 ω，是因为正弦、余弦、复指数的自变量必须是弧度，写成 e^{iωt} 后所有微积分运算都变得干净：求导只落下一个因子 iω。', 'Ordinary frequency f counts how many revolutions occur per second; angular frequency ω counts how many radians per second. One revolution is 2π radians, so the two differ only by that factor. The reason for introducing ω is that sine, cosine and the complex exponential take radians as their argument: once written as e^{iωt}, every differentiation simply pulls down a factor iω.'),
    symbols: [
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s', dimension: 'T⁻¹', typical: '10⁻² – 10⁴ rad/s' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz', dimension: 'T⁻¹' },
        { sym: 'T', name: t('周期', 'period'), unit: 's' },
        { sym: '\\varphi', name: t('相位（弧度）', 'phase (in radians)'), unit: 'rad' },
        { sym: 'k', name: t('波数', 'wavenumber'), unit: 'rad/m' },
        { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: 'k_s', name: t('弹簧劲度系数（避免与波数 k 混淆）', 'spring stiffness, to avoid confusion with wavenumber k'), unit: 'N/m' },
        { sym: 'm', name: t('振子质量', 'oscillator mass'), unit: 'kg' },
    ],
    conditions: {
        applies: [
            t('任意谐和量：位移、速度、应力、电场……只要它按正弦规律振荡', 'Any harmonic quantity: displacement, velocity, stress, electric field — anything oscillating sinusoidally'),
            t('也是 Fourier 变换中频率域坐标的标准写法', 'Also the standard frequency-domain coordinate in the Fourier transform'),
        ],
        assumes: [
            t('频率在观测时间窗内不变（平稳）', 'The frequency is constant over the observation window, that is, the signal is stationary'),
            t('弧度是无量纲的，rad 只是记号而非真实单位', 'Radians are dimensionless; rad is a label, not a genuine unit'),
        ],
        breaks: [
            t('调频信号（chirp）中 ω 本身随时间变化，需改用瞬时频率 dφ/dt', 'In a chirp ω itself varies, so one must use the instantaneous frequency dφ/dt'),
            t('把 f 与 ω 混用会把 2π 因子弄丢，是地震学最常见的量级错误之一', 'Mixing f and ω loses a factor of 2π, one of the most common order-of-magnitude errors in seismology'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'geometry',
            title: t('把一次振动看成转一圈', 'Regard one cycle as one full revolution'),
            latex: String.raw `1\ \text{圈}=2\pi\ \text{rad}`,
            note: t('这正是「谐和运动 = 圆周运动在一条直径上的投影」的几何来源。', 'This is the geometric origin of the statement that harmonic motion is circular motion projected onto a diameter.'),
        },
        {
            n: 2,
            op: 'setup',
            title: t('相位随时间线性增长', 'The phase grows linearly in time'),
            latex: String.raw `\varphi(t)=\omega t+\varphi_0`,
            note: t('ω 就是这条直线的斜率，即相位的变化率。', 'ω is the slope of this straight line, that is, the rate of change of phase.'),
        },
        {
            n: 3,
            op: 'physics',
            title: t('经过一个周期 T，相位恰好增加 2π', 'After one period T the phase has advanced by exactly 2π'),
            latex: String.raw `\varphi(t+T)-\varphi(t)=\omega T=2\pi`,
        },
        {
            n: 4,
            op: 'algebra',
            title: t('解出 ω 并用 f = 1/T 代换', 'Solve for ω and substitute f = 1/T'),
            latex: String.raw `\omega=\frac{2\pi}{T}=2\pi f`,
        },
        {
            n: 5,
            op: 'identity',
            title: t('为什么非用 ω 不可：复指数求导', 'Why ω is unavoidable: differentiating the complex exponential'),
            latex: String.raw `\frac{\dd}{\dd t}e^{i\omega t}=i\omega\,e^{i\omega t},\qquad \frac{\dd^{2}}{\dd t^{2}}e^{i\omega t}=-\omega^{2}e^{i\omega t}`,
            note: t('用 f 写则每次求导都会掉出 2π；用了 ω，微分方程里只剩干净的 -ω²。', 'Writing it with f would spill a 2π at every differentiation; with ω, the differential equation keeps only the clean factor −ω².'),
        },
    ],
    viz: [
        {
            id: 'phase-ramp',
            level: 'V1',
            title: t('相位随时间的增长：ω 就是那条直线的斜率', 'Phase versus time: ω is the slope of that line'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('相位 (rad)', 'phase (rad)'),
            controls: [
                { id: 'f', label: t('频率 f', 'frequency f'), min: 0.05, max: 2, step: 0.05, value: 0.5, unit: 'Hz' },
                { id: 'phi0', label: t('初相位 φ₀', 'initial phase φ₀'), min: 0, max: 6.28, step: 0.05, value: 0, unit: 'rad' },
            ],
            xRange: [0, 4],
            note: t('展开相位是一条直线，斜率即 ω；把它对 2π 取余就得到每周期重复一次的锯齿，锯齿跳变处正好对应波形的一个新循环。把 f 加倍，斜率加倍 —— 这就是 ω = 2πf。', 'The unwrapped phase is a straight line whose slope is ω. Taking it modulo 2π gives a sawtooth repeating once per cycle, and each jump marks the start of a new cycle. Doubling f doubles the slope — that is ω = 2πf.'),
            compute: (p) => {
                const f = p['f'];
                const phi0 = p['phi0'];
                const w = 2 * Math.PI * f;
                const unwrapped = [];
                const wrapped = [];
                for (let i = 0; i <= 600; i++) {
                    const tt = (i / 600) * 4;
                    const ph = w * tt + phi0;
                    unwrapped.push([tt, ph]);
                    wrapped.push([tt, ph % (2 * Math.PI)]);
                }
                return [
                    { label: t('展开相位 ωt + φ₀', 'unwrapped phase ωt + φ₀'), color: '#185FA5', points: unwrapped },
                    { label: t('折叠相位 (mod 2π)', 'wrapped phase (mod 2π)'), color: '#BA7517', dash: true, points: wrapped },
                ];
            },
        },
        {
            id: 'omega-waveform',
            level: 'V1',
            title: t('同一振动在 1 秒内的循环数', 'How many cycles fit into one second'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'f2', label: t('频率 f', 'frequency f'), min: 0.25, max: 5, step: 0.05, value: 1, unit: 'Hz' },
                { id: 'A2', label: t('振幅 A', 'amplitude A'), min: 0.1, max: 2, step: 0.05, value: 1, unit: 'm' },
            ],
            xRange: [0, 2],
            note: t('数一秒钟里的峰的个数就是 f；每个峰之间相位差 2π，于是相位每秒推进 2πf 弧度。', 'Counting the peaks inside one second gives f; between neighbouring peaks the phase differs by 2π, so the phase advances by 2πf radians per second.'),
            compute: (p) => {
                const f = p['f2'];
                const A = p['A2'];
                const w = 2 * Math.PI * f;
                const pts = [];
                for (let i = 0; i <= 800; i++) {
                    const tt = (i / 800) * 2;
                    pts.push([tt, A * Math.sin(w * tt)]);
                }
                return [{ label: t('u(t) = A sin(ωt)', 'u(t) = A sin(ωt)'), color: '#0F6E56', points: pts }];
            },
        },
    ],
    example: {
        title: t('地震仪的标定频率', 'Calibration frequency of a seismometer'),
        input: t('厂家给出固有频率 f₀ = 1 Hz', 'The manufacturer quotes a natural frequency f₀ = 1 Hz'),
        steps: [
            t('ω₀ = 2πf₀ = 6.283 rad/s', 'ω₀ = 2πf₀ = 6.283 rad/s'),
            t('方程写成 d²u/dt² + 2hω₀ du/dt + ω₀²u = 0', 'The equation reads d²u/dt² + 2hω₀ du/dt + ω₀²u = 0'),
        ],
        output: t('用 ω₀ 写方程可以省掉所有 2π，后续做频响分析时不容易出错', 'Writing the equation with ω₀ removes every 2π and keeps later response analysis error-free'),
    },
    links: {
        upstream: [{ id: 'period-frequency', note: t('提供 T 与 f', 'supplies T and f') }],
        downstream: [
            { id: 'phase-velocity', note: t('ω = kc 的主角之一', 'one of the two protagonists of ω = kc') },
            { id: 'seismometer-equation', note: t('仪器方程里的 ω₀', 'the ω₀ in the instrument equation') },
        ],
        seealso: [{ id: 'harmonic-plane-wave' }],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default angularFrequency;
//# sourceMappingURL=angular-frequency.js.map