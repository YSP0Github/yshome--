import { t } from '../../core/types.js';
/** harmonic-plane-wave */
const harmonicPlaneWave = {
    id: 'harmonic-plane-wave',
    name: t('一维谐和平面波', '1D Harmonic Plane Wave'),
    aliases: { zh: ['简谐波', '平面波表达式'], en: ['sinusoidal wave', 'plane wave'] },
    node: 'S0.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.COMPLEX', 'MATH.GEOM'],
        method: ['METH.PROC'],
        quantity: ['Q.VEL', 'Q.FREQ'],
    },
    audience: 'highschool',
    complete: 'L3',
    statement: {
        main: String.raw `u(x,t)=A\cos\!\left(kx-\omega t+\varphi\right)`,
        variants: [
            { name: t('用周期与波长写出', 'In period and wavelength'), latex: String.raw `u(x,t)=A\cos\!\left[2\pi\!\left(\frac{x}{\lambda}-\frac{t}{T}\right)+\varphi\right]` },
            { name: t('复数表示（便于运算）', 'Complex representation'), latex: String.raw `u(x,t)=\Re\!\left\{A\,e^{i(kx-\omega t)}\right\}` },
        ],
    },
    meaning: t('这是整座地震学大厦的最小砖块。任何一个复杂的地震波形，都可以看成无数个这样的谐和波叠加起来。它描述的是一个形状不变、以固定速度移动的扰动。', 'The smallest building block of all seismology. Any complicated seismogram can be regarded as a superposition of infinitely many such waves. It describes a disturbance of unchanging shape moving at a fixed speed.'),
    symbols: [
        { sym: 'u', name: t('位移（质点离开平衡位置的距离）', 'displacement'), unit: 'm' },
        { sym: 'x', name: t('空间位置', 'position'), unit: 'm' },
        { sym: 't', name: t('时间', 'time'), unit: 's' },
        { sym: 'A', name: t('振幅', 'amplitude'), unit: 'm', typical: '10⁻⁹ – 10⁻² m' },
        { sym: 'k', name: t('波数', 'wavenumber'), unit: 'rad/m', dimension: 'L⁻¹' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s', dimension: 'T⁻¹' },
        { sym: '\\varphi', name: t('初相位', 'initial phase'), unit: 'rad' },
        { sym: '\\lambda', name: t('波长', 'wavelength'), unit: 'm', typical: '10² – 10⁵ m' },
        { sym: 'T', name: t('周期', 'period'), unit: 's', typical: '0.01 – 100 s' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz', dimension: 'T⁻¹' },
    ],
    conditions: {
        applies: [t('均匀、无限、无损介质中的小振幅扰动', 'Small-amplitude disturbance in a uniform, unbounded, lossless medium')],
        assumes: [
            t('沿单一方向传播（一维）', 'Propagation in a single direction (1D)'),
            t('介质不吸收能量（振幅不随距离衰减）', 'No absorption, so amplitude does not decay with distance'),
            t('线性叠加成立', 'Linear superposition holds'),
        ],
        breaks: [t('存在几何扩散或 Q 衰减时，A 需改为 A(x) 或 A(t)', 'With geometrical spreading or anelastic loss, A must become A(x) or A(t)')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('要求「波形一年不变」', 'Require the shape to be constant'),
            latex: String.raw `\text{令波形以速度 }c\text{ 向 }+x\text{ 平移： } u(x,t)=g(x-ct)`,
            note: t('这是「平移不变性」的数学写法：时间 t 之后，整条曲线整体右移 ct。', 'This is the mathematical statement of translational invariance: after time t the whole curve has shifted right by ct.') },
        { n: 2, op: 'setup', title: t('取最简单的周期形状', 'Pick the simplest periodic shape'),
            latex: String.raw `g(s)=A\cos\!\left(ks+\varphi\right)`,
            note: t('选余弦只是方便；正弦、复指数都等价，只差一个相位。', 'Choosing cosine is only a convenience; sine and complex exponentials are equivalent up to a phase shift.') },
        { n: 3, op: 'substitute', title: t('代入 s = x − ct', 'Substitute s = x − ct'),
            latex: String.raw `u(x,t)=A\cos\!\left(k(x-ct)+\varphi\right)=A\cos(kx-kct+\varphi)` },
        { n: 4, op: 'setup', title: t('定义角频率 ω ≡ kc', 'Define angular frequency ω ≡ kc'),
            latex: String.raw `\omega \equiv kc \;\Longleftrightarrow\; c=\frac{\omega}{k}`,
            note: t('于是得到标准形式 u = A cos(kx − ωt + φ)。注意符号：-ωt 表示向 +x 传播，+ωt 则是向 −x 传播。', 'This gives the standard form. Note the sign: −ωt propagates toward +x, +ωt toward −x.') },
        { n: 5, op: 'identity', title: t('波长、周期与 k、ω 的换算', 'Converting between (λ, T) and (k, ω)'),
            latex: String.raw `k=\frac{2\pi}{\lambda},\qquad \omega=\frac{2\pi}{T}=2\pi f`,
            note: t('空间上走一个 λ 相位变化 2π，时间上过一个 T 相位变化 2π。', 'The phase changes by 2π over one λ in space, and over one T in time.') },
        { n: 6, op: 'result', title: t('得到相速度的经典关系', 'The classic phase-velocity relation'),
            latex: String.raw `c=\frac{\omega}{k}=\frac{2\pi f}{2\pi/\lambda}=\lambda f=\frac{\lambda}{T}` },
    ],
    viz: [
        {
            id: 'plane-wave-profile',
            level: 'V1',
            title: t('沿空间看某一时刻的波形', 'Snapshot of the waveform in space'),
            xlabel: t('位置 x (m)', 'position x (m)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'T', label: t('周期 T', 'period T'), min: 0.5, max: 6, step: 0.1, value: 2, unit: 's' },
                { id: 'lam', label: t('波长 λ', 'wavelength λ'), min: 20, max: 200, step: 5, value: 100, unit: 'm' },
                { id: 't', label: t('观察时刻 t', 'time t'), min: 0, max: 8, step: 0.05, value: 0, unit: 's' },
                { id: 'A', label: t('振幅 A', 'amplitude A'), min: 0.1, max: 2, step: 0.05, value: 1, unit: 'm' },
            ],
            xRange: [0, 400],
            note: t('拖动 t：波形整体右移，速度就是 λ/T。这就是为什么 λ f 是速度。', 'Drag t: the shape moves right at λ/T. That is exactly why λ f is a velocity.'),
            compute: (p) => {
                const lam = p['lam'], T = p['T'], tt = p['t'], A = p['A'];
                const k = (2 * Math.PI) / lam;
                const w = (2 * Math.PI) / T;
                const xmax = 4 * lam;
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const x = (i / 600) * xmax;
                    pts.push([x, A * Math.cos(k * x - w * tt)]);
                }
                return [
                    { label: t('u(x,t)', 'u(x,t)'), color: '#185FA5', points: pts },
                    { label: t('包络 ±A', 'envelope ±A'), color: '#B4B2A9', dash: true, points: [[0, A], [xmax, A]] },
                    { label: t('包络 −A', 'envelope −A'), color: '#B4B2A9', dash: true, points: [[0, -A], [xmax, -A]] },
                ];
            },
        },
        {
            id: 'plane-wave-time',
            level: 'V1',
            title: t('固定一点看随时间的振动', 'Motion recorded at one fixed station'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'T2', label: t('周期 T', 'period T'), min: 0.5, max: 6, step: 0.1, value: 2, unit: 's' },
                { id: 'A2', label: t('振幅 A', 'amplitude A'), min: 0.1, max: 2, step: 0.05, value: 1, unit: 'm' },
                { id: 'x0', label: t('观测点位置 x', 'station position x'), min: 0, max: 400, step: 5, value: 0, unit: 'm' },
            ],
            note: t('这就是地震仪在某一台站实际记录到的东西：一条随时间起伏的曲线。', 'This is literally what a seismometer records at one station: a curve oscillating in time.'),
            compute: (p) => {
                const T = p['T2'], A = p['A2'], x0 = p['x0'];
                const lam = 100;
                const k = (2 * Math.PI) / lam;
                const w = (2 * Math.PI) / T;
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const tt = (i / 600) * 8;
                    pts.push([tt, A * Math.cos(k * x0 - w * tt)]);
                }
                return [{ label: t('u(x₀, t)', 'u(x₀, t)'), color: '#0F6E56', points: pts }];
            },
        },
    ],
    example: {
        title: t('对一次远震体波', 'For a teleseismic body wave'),
        input: t('频率 f = 1 Hz，波速 c = 8 km/s', 'frequency f = 1 Hz, speed c = 8 km/s'),
        steps: [
            t('T = 1/f = 1 s', 'T = 1/f = 1 s'),
            t('λ = c/f = 8000 m', 'λ = c/f = 8000 m'),
            t('k = 2π/λ = 7.85×10⁻⁴ rad/m', 'k = 2π/λ = 7.85×10⁻⁴ rad/m'),
        ],
        output: t('波长 8 km —— 这就是为什么分辨地下小尺度结构需要高频', 'Wavelength is 8 km — which is why resolving small structures requires high frequencies'),
    },
    links: {
        downstream: [
            { id: 'fourier-transform', note: t('任意波形 = 谐和波的叠加', 'Any waveform is a sum of these') },
            { id: 'nyquist-sampling', note: t('记录这种振动需要足够的采样率', 'Recording this needs adequate sampling rate') },
            { id: 'quality-factor-q', note: t('给 A 加上随距离的衰减', 'Adds distance-dependent decay to A') },
        ],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default harmonicPlaneWave;
//# sourceMappingURL=harmonic-plane-wave.js.map