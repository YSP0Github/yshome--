import { t } from '../../core/types.js';
/** forced-oscillator-green-function */
const forcedOscillatorGreenFunction = {
    id: 'forced-oscillator-green-function',
    name: t('受迫阻尼振子的 Green 函数', 'The Green Function of a Forced Damped Oscillator'),
    aliases: { zh: ['阻尼振子脉冲响应', '二阶系统格林函数', '传递函数'], en: ['damped oscillator impulse response', 'second-order system Green function', 'transfer function'] },
    node: 'S0.7',
    tags: {
        math: ['MATH.DIFF', 'MATH.FOURIER'],
        method: ['METH.INSTR'],
        quantity: ['Q.FREQ', 'Q.AMP'],
        keywords: t('阻尼振子 脉冲响应 传递函数 共振 欠阻尼 临界阻尼 品质因子 地震计', 'damped oscillator impulse response transfer function resonance underdamped critically damped quality factor seismometer'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `g(t)=\frac{1}{\omega_{d}}e^{-\gamma t}\sin\!\left(\omega_{d}t\right)H(t),\qquad \omega_{d}=\sqrt{\omega_{0}^{2}-\gamma^{2}}`,
        variants: [
            { name: t('所满足的方程（单位脉冲源）', 'The equation it satisfies (unit impulse source)'), latex: String.raw `\ddot g+2\gamma\dot g+\omega_{0}^{2}g=\delta(t),\qquad g(t<0)=0` },
            { name: t('任意力的响应：卷积', 'Response to an arbitrary force: convolution'), latex: String.raw `x(t)=\int_{-\infty}^{t}g(t-\tau)f(\tau)\,\mathrm{d}\tau` },
            { name: t('频域传递函数', 'Frequency-domain transfer function'), latex: String.raw `G(\omega)=\frac{1}{\omega_{0}^{2}-\omega^{2}+2i\gamma\omega},\qquad |G|=\frac{1}{\sqrt{\left(\omega_{0}^{2}-\omega^{2}\right)^{2}+4\gamma^{2}\omega^{2}}}` },
            { name: t('临界阻尼情形', 'Critically damped case'), latex: String.raw `\gamma=\omega_{0}\;\Longrightarrow\; g(t)=t\,e^{-\omega_{0}t}H(t)` },
            { name: t('过阻尼情形', 'Overdamped case'), latex: String.raw `\gamma>\omega_{0}\;\Longrightarrow\; g(t)=\frac{e^{-\gamma t}\sinh\!\left(\sqrt{\gamma^{2}-\omega_{0}^{2}}\,t\right)}{\sqrt{\gamma^{2}-\omega_{0}^{2}}}H(t)` },
            { name: t('与品质因子的关系', 'Relation to the quality factor'), latex: String.raw `Q=\frac{\omega_{0}}{2\gamma},\qquad \text{半功率带宽}\ \Delta\omega=2\gamma=\frac{\omega_{0}}{Q}` },
        ],
    },
    meaning: t('受迫阻尼振子是地震计、检波器、隔振台乃至建筑物地震响应的通用模型，其 Green 函数（脉冲响应）就是「敲一下之后的自由振动」：一个按 e^{−γt} 衰减、以阻尼频率 ω_d 振荡的波形。把它与任意外力做卷积就得到响应；它在频域的模 |G(ω)| 就是仪器的幅频特性，共振峰的高度由 γ 决定，而 γ 又由品质因子 Q 决定。去仪器响应，本质上是把这个 G 除掉。', 'A forced damped oscillator is the universal model of a seismometer, a geophone, an isolation table and even a building under earthquake loading. Its Green function, the impulse response, is simply the free motion after a knock: a waveform oscillating at the damped frequency ω_d and decaying as e^{−γt}. Convolving it with any force gives the response, and its modulus |G(ω)| is the amplitude response of the instrument. The height of the resonance peak is set by γ, which in turn is set by the quality factor Q. Deconvolving an instrument response is, in essence, dividing out this G.'),
    symbols: [
        { sym: 'g(t)', name: t('脉冲响应（Green 函数）', 'impulse response (Green function)'), unit: 's' },
        { sym: '\\omega_0', name: t('无阻尼固有角频率', 'undamped natural angular frequency'), unit: 'rad/s' },
        { sym: '\\gamma', name: t('阻尼系数（方程中写作 2γ）', 'damping coefficient (written 2γ in the equation)'), unit: 's⁻¹' },
        { sym: '\\omega_d', name: t('有阻尼时的振荡角频率', 'damped oscillation angular frequency'), unit: 'rad/s' },
        { sym: 'G(\\omega)', name: t('频域传递函数', 'frequency-domain transfer function'), unit: 's²' },
        { sym: 'H(t)', name: t('Heaviside 阶跃函数（保证因果性）', 'Heaviside step function (guarantees causality)'), unit: '1' },
        { sym: 'Q', name: t('品质因子 Q = ω₀/(2γ)', 'quality factor Q = ω₀/(2γ)'), unit: '1' },
        { sym: 'f(t)', name: t('外加驱动力（每单位质量）', 'applied driving force (per unit mass)'), unit: 'm/s²' },
    ],
    conditions: {
        applies: [
            t('线性、时不变、集中参数的二阶系统', 'Linear, time-invariant, lumped-parameter second-order systems'),
            t('小振幅、阻尼与速度成正比（黏性阻尼）', 'Small amplitudes with damping proportional to velocity (viscous damping)'),
        ],
        assumes: [
            t('γ ≥ 0，系统被动（不自身注入能量）', 'γ ≥ 0, the system is passive (injects no energy itself)'),
            t('因果性：t < 0 时 g = 0', 'Causality: g = 0 for t < 0'),
        ],
        breaks: [
            t('γ = 0 时脉冲响应永不衰减，系统不返回平衡（临界稳定）', 'For γ = 0 the impulse response never decays and the system is marginally stable'),
            t('结构非线性（摩擦阻尼、间隙）时叠加原理不成立', 'With structural nonlinearity (friction damping, backlash) superposition fails'),
            t('强阻尼（γ > ω₀）时不再振荡，公式改用双曲正弦（见变体）', 'For heavy damping (γ > ω₀) there is no oscillation and the hyperbolic-sine form applies (see variants)'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('写出运动方程与脉冲源', 'Write the equation of motion with an impulsive source'),
            latex: String.raw `\ddot x+2\gamma\dot x+\omega_{0}^{2}x=f(t),\qquad f(t)=\delta(t)` },
        { n: 2, op: 'transform', title: t('做 Laplace 变换（零初始条件）', 'Take the Laplace transform (zero initial conditions)'),
            latex: String.raw `\left(s^{2}+2\gamma s+\omega_{0}^{2}\right)G(s)=1\;\Longrightarrow\; G(s)=\frac{1}{(s+\gamma)^{2}+\omega_{d}^{2}}` },
        { n: 3, op: 'identity', title: t('配方并识别标准形式', 'Complete the square and recognise the standard form'),
            latex: String.raw `s^{2}+2\gamma s+\omega_{0}^{2}=(s+\gamma)^{2}+\left(\omega_{0}^{2}-\gamma^{2}\right)=(s+\gamma)^{2}+\omega_{d}^{2}` },
        { n: 4, op: 'substitute', title: t('查表反演：指数 × 正弦', 'Invert from tables: exponential times sine'),
            latex: String.raw `\mathcal{L}^{-1}\!\left\{\frac{1}{(s+\gamma)^{2}+\omega_{d}^{2}}\right\}=\frac{1}{\omega_{d}}e^{-\gamma t}\sin(\omega_{d}t)H(t)`,
            note: t('因子 H(t) 是因果性的数学保证：激励之前没有响应。', 'The factor H(t) is the mathematical guarantee of causality: no response before the excitation.') },
        { n: 5, op: 'physics', title: t('检验：脉冲给系统一个单位速度跳变', 'Check: the impulse imparts a unit jump in velocity'),
            latex: String.raw `\int_{0^{-}}^{0^{+}}\ddot x\,\mathrm{d}t=1\;\Longrightarrow\; \dot x(0^{+})=1,\qquad \dot g(0^{+})=\frac{1}{\omega_{d}}\cdot\omega_{d}=1` },
        { n: 6, op: 'result', title: t('频域形式：令 s = iω', 'Frequency-domain form: set s = iω'),
            latex: String.raw `G(\omega)=\frac{1}{\omega_{0}^{2}-\omega^{2}+2i\gamma\omega}` },
        { n: 7, op: 'result', title: t('共振与半功率带宽', 'Resonance and the half-power bandwidth'),
            latex: String.raw `\omega_{\text{峰值}}=\sqrt{\omega_{0}^{2}-2\gamma^{2}},\qquad |G|_{\max}\approx\frac{Q}{\omega_{0}^{2}},\qquad \Delta\omega=2\gamma=\frac{\omega_{0}}{Q}`,
            note: t('Q 越大峰越尖越窄：这就是地震计在固有频率附近灵敏度极高、却又极易被噪声激发的两面性。', 'Larger Q gives a taller, narrower peak. This is the two-sided nature of a seismometer near its natural frequency: extremely sensitive, yet easily excited by noise.') },
    ],
    viz: [
        {
            id: 'oscillator-impulse-response',
            level: 'V1',
            title: t('脉冲响应：敲一下之后的自由振动', 'Impulse response: the free motion after a knock'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('g(t)', 'g(t)'),
            controls: [
                { id: 'f0', label: t('固有频率 f₀', 'natural frequency f₀'), min: 0.1, max: 5, step: 0.05, value: 1, unit: 'Hz' },
                { id: 'qq', label: t('品质因子 Q', 'quality factor Q'), min: 0.4, max: 50, step: 0.1, value: 5, unit: '1' },
            ],
            xRange: [0, 8],
            note: t('Q 越大，衰减越慢、振荡维持越久；Q < 0.5 时（过阻尼）完全看不出振荡，只剩一个单峰然后缓慢回落。地震计通常工作在 Q ≈ 0.5–1 附近，正是为了既不共振又不过阻尼。', 'Larger Q means slower decay and longer ringing. For Q < 0.5 (overdamped) there is no oscillation at all, just a single hump decaying slowly. Seismometers are usually operated near Q ≈ 0.5–1 precisely to avoid both resonance and excessive sluggishness.'),
            compute: (p) => {
                const f0 = p['f0'], Q = p['qq'];
                const w0 = 2 * Math.PI * f0;
                const gamma = w0 / (2 * Q);
                const pts = [];
                for (let i = 0; i <= 800; i++) {
                    const tt = (i / 800) * 8;
                    let v;
                    if (gamma < w0) {
                        const wd = Math.sqrt(w0 * w0 - gamma * gamma);
                        v = (Math.exp(-gamma * tt) * Math.sin(wd * tt)) / wd;
                    }
                    else if (Math.abs(gamma - w0) < 1e-9) {
                        v = tt * Math.exp(-w0 * tt);
                    }
                    else {
                        const s = Math.sqrt(gamma * gamma - w0 * w0);
                        v = (Math.exp(-gamma * tt) * Math.sinh(s * tt)) / s;
                    }
                    pts.push([tt, v]);
                }
                return [{ label: t('脉冲响应 g(t)', 'impulse response g(t)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'oscillator-frequency-response',
            level: 'V1',
            title: t('幅频与相频响应', 'Amplitude and phase response'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('|G|（相对单位） / 相位（rad）', '|G| (relative) / phase (rad)'),
            controls: [
                { id: 'f0b', label: t('固有频率 f₀', 'natural frequency f₀'), min: 0.2, max: 5, step: 0.05, value: 1, unit: 'Hz' },
                { id: 'qb', label: t('品质因子 Q', 'quality factor Q'), min: 0.5, max: 50, step: 0.1, value: 5, unit: '1' },
            ],
            xRange: [0, 5],
            yRange: [-3.5, 3.5],
            note: t('共振峰就在 f₀ 附近；相位于此从 0 平滑转到 −π。Q 越大峰越尖，同时相位的过渡也越陡 —— 这正是宽频带地震计必须精心标定相位的原因。', 'The resonance peak sits near f₀, where the phase sweeps smoothly from 0 to −π. Larger Q sharpens the peak and steepens the phase transition, which is why broadband seismometers require careful phase calibration.'),
            compute: (p) => {
                const f0 = p['f0b'], Q = p['qb'];
                const w0 = 2 * Math.PI * f0;
                const gamma = w0 / (2 * Q);
                const mag = [];
                const ph = [];
                let scale = 0;
                for (let i = 0; i <= 800; i++) {
                    const f = (i / 800) * 5;
                    const w = 2 * Math.PI * f;
                    const re = w0 * w0 - w * w;
                    const im = 2 * gamma * w;
                    const m = 1 / Math.sqrt(re * re + im * im);
                    if (m > scale)
                        scale = m;
                }
                if (!(scale > 0))
                    scale = 1;
                for (let i = 0; i <= 800; i++) {
                    const f = (i / 800) * 5;
                    const w = 2 * Math.PI * f;
                    const re = w0 * w0 - w * w;
                    const im = 2 * gamma * w;
                    const m = 1 / Math.sqrt(re * re + im * im);
                    mag.push([f, (m / scale) * 3]);
                    ph.push([f, -Math.atan2(im, re)]);
                }
                return [
                    { label: t('|G|（归一化）', '|G| (normalised)'), color: '#185FA5', points: mag },
                    { label: t('相位 arg G', 'phase arg G'), color: '#BA7517', dash: true, points: ph },
                ];
            },
        },
    ],
    example: {
        title: t('一台固有周期 1 s 的地震计', 'A seismometer with a natural period of 1 s'),
        input: t('f₀ = 1 Hz，Q = 0.7（接近临界阻尼的常用工作点）', 'f₀ = 1 Hz, Q = 0.7 (a common operating point near critical damping)'),
        steps: [
            t('ω₀ = 2π × 1 = 6.28 rad/s', 'ω₀ = 2π × 1 = 6.28 rad/s'),
            t('γ = ω₀/(2Q) = 6.28/1.4 = 4.49 s⁻¹', 'γ = ω₀/(2Q) = 6.28/1.4 = 4.49 s⁻¹'),
            t('ω_d = √(39.5 − 20.1) = 4.40 rad/s，即 0.70 Hz', 'ω_d = √(39.5 − 20.1) = 4.40 rad/s, i.e. 0.70 Hz'),
            t('e 折时间 1/γ = 0.22 s，约半个周期就衰减到 1/e', 'The e-folding time is 1/γ = 0.22 s, so it decays to 1/e within about half a cycle'),
        ],
        output: t('这台仪器几乎不振铃，响应平坦而因果 —— 这正是短周期地震计刻意压低 Q 换来的好处。', 'The instrument barely rings and its response is flat and causal. That is precisely the benefit bought by deliberately lowering Q in a short-period seismometer.'),
    },
    links: {
        upstream: [
            { id: 'green-function-definition', note: t('它是该定义在二阶常微分算子下的实例', 'it is that definition instantiated for a second-order ODE operator') },
        ],
        seealso: [
            { id: 'seismometer-equation', note: t('地震计就是这样一个受迫阻尼振子', 'a seismometer is exactly such a forced damped oscillator') },
            { id: 'quality-factor-q', note: t('Q 决定阻尼与共振峰宽度', 'Q sets the damping and the width of the resonance peak') },
            { id: 'laplace-transform', note: t('求 G(s) 的标准工具', 'the standard tool for finding G(s)') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §11.2' },
        { text: 'Havskov & Alguacil, Instrumentation in Earthquake Seismology, Ch. 2' },
    ],
};
export default forcedOscillatorGreenFunction;
//# sourceMappingURL=forced-oscillator-green-function.js.map