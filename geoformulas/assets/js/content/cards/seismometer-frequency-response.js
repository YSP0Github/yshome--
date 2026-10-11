import { t } from '../../core/types.js';
/** seismometer-frequency-response */
const seismometerFrequencyResponse = {
    id: 'seismometer-frequency-response',
    name: t('地震计的频响与类型', 'Seismometer Frequency Response & Types'),
    aliases: { zh: ['频响曲线', '速度计', '加速度计'], en: ['frequency response', 'velocity sensor', 'accelerometer'] },
    node: 'S8.1',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.FOURIER'],
        method: ['METH.INSTR'],
        quantity: ['Q.FREQ', 'Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `T(\omega) = \frac{(i\omega)^{m}\,\omega^{2}}{\omega^{2} + 2i h\omega_0\omega - \omega_0^{2}}\,G`,
        variants: [
            { name: t('m = 0：位移计', 'm = 0: displacement sensor'), latex: String.raw `T \propto \omega^{2}\ (\omega\ll\omega_0),\qquad T \to G\ (\omega\gg\omega_0)` },
            { name: t('m = 1：速度计', 'm = 1: velocity sensor'), latex: String.raw `T \propto \omega\ \text{在通带内平坦}` },
            { name: t('m = 2：加速度计', 'm = 2: accelerometer'), latex: String.raw `T \propto \omega^{2}\ (\omega\ll\omega_0)\ \text{的低频段被抬升}` },
            { name: t('固有频率与阻尼', 'Natural frequency and damping'), latex: String.raw `\omega_0 = 2\pi f_0,\qquad h \approx 0.7\ (\text{临界略欠阻尼})` },
        ],
    },
    meaning: t('同一个机械摆，读出的是位移、速度还是加速度，取决于线圈之后的电路。这决定了三种仪器的频响形状完全不同：位移计在低频段按 ω² 衰减，速度计在通带内平坦，加速度计则相反。选错仪器类型，会把长周期信号埋进噪声里。', 'The same mechanical pendulum reads out displacement, velocity or acceleration depending on the electronics after the coil. This gives the three instrument types completely different response shapes: a displacement sensor rolls off as ω² at low frequency, a velocity sensor is flat in its passband, and an accelerometer is the opposite. Choosing the wrong type buries long-period signal in noise.'),
    symbols: [
        { sym: 'T(\\omega)', name: t('复频响函数', 'complex frequency response'), unit: 'V/(m/s^k)' },
        { sym: '\\omega_0', name: t('摆的固有角频率', 'natural angular frequency of the pendulum'), unit: 'rad/s' },
        { sym: 'h', name: t('阻尼比', 'damping ratio'), unit: '无量纲', typical: '0.6 – 0.8' },
        { sym: 'm', name: t('输出类型：0 位移 / 1 速度 / 2 加速度', 'output type: 0 displacement, 1 velocity, 2 acceleration'), unit: '无量纲' },
        { sym: 'G', name: t('灵敏度增益', 'sensitivity gain'), unit: 'V/(m/s^k)' },
    ],
    conditions: {
        applies: [t('仪器选型、频响校正与记录单位换算', 'Instrument selection, response correction and unit conversion')],
        assumes: [
            t('二阶机械摆模型', 'A second-order mechanical pendulum model'),
            t('线性、时不变', 'Linear and time invariant'),
        ],
        breaks: [
            t('力反馈地震计的频响不再是简单二阶形式', 'Force-feedback seismometers no longer follow the simple second-order form'),
            t('数字采集器的 FIR 滤波器需单独计入', 'The digitizer FIR filters must be accounted for separately'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('摆的运动方程', 'Equation of motion of the pendulum'),
            latex: String.raw `\ddot{x} + 2h\omega_0\dot{x} + \omega_0^{2}x = -\ddot{u}` },
        { n: 2, op: 'transform', title: t('做 Fourier 变换', 'Fourier transform'),
            latex: String.raw `X(\omega) = \frac{\omega^{2}}{\omega^{2}+2ih\omega_0\omega-\omega_0^{2}}\,U(\omega)` },
        { n: 3, op: 'identity', title: t('输出是位移的 m 阶导数', 'The output is the m-th derivative of displacement'),
            latex: String.raw `V(\omega) = (i\omega)^{m}G\,X(\omega)` },
        { n: 4, op: 'substitute', title: t('合并得到频响', 'Combine to get the response'),
            latex: String.raw `T(\omega) = \frac{(i\omega)^{m}\omega^{2}G}{\omega^{2}+2ih\omega_0\omega-\omega_0^{2}}` },
        { n: 5, op: 'result', title: t('低频渐近行为', 'Low-frequency asymptotic behaviour'),
            latex: String.raw `\omega\ll\omega_0:\ |T| \propto \omega^{m+2}/\omega_0^{2}` },
    ],
    viz: [
        {
            id: 'response-types',
            level: 'V1',
            title: t('三种输出类型的频响曲线', 'Response curves for the three output types'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('相对灵敏度 (dB)', 'relative sensitivity (dB)'),
            xScale: 'log',
            controls: [
                { id: 'f0', label: t('固有频率 f₀ (Hz)', 'natural frequency f₀ (Hz)'), min: 0.01, max: 5, step: 0.01, value: 1 },
                { id: 'h', label: t('阻尼比 h', 'damping ratio h'), min: 0.3, max: 1.2, step: 0.01, value: 0.7 },
            ],
            note: t('位移计在低于 f₀ 时每倍频程掉 12 dB，速度计掉 6 dB，加速度计平坦 —— 这就是宽带与短周期仪器差别的来源。', 'Below f₀ a displacement sensor loses 12 dB per octave, a velocity sensor 6 dB and an accelerometer is flat — the origin of the difference between broadband and short-period instruments.'),
            compute: (p) => {
                const f0 = p['f0'], h = p['h'];
                const resp = (f, m) => {
                    const w = 2 * Math.PI * f;
                    const w0 = 2 * Math.PI * f0;
                    const dr = w0 * w0 - w * w;
                    const di = 2 * h * w0 * w;
                    const num = Math.pow(w, m + 2);
                    const den = Math.sqrt(dr * dr + di * di);
                    return num / den;
                };
                const norm = (m) => resp(1000 * f0, m);
                const out = [];
                const cols = ['#185FA5', '#993C1D', '#0F6E56'];
                const names = [t('位移计', 'displacement'), t('速度计', 'velocity'), t('加速度计', 'acceleration')];
                for (let m = 0; m < 3; m++) {
                    const pts = [];
                    const n0 = norm(m);
                    for (let i = 0; i <= 200; i++) {
                        const f = Math.pow(10, -3 + (i / 200) * 5);
                        const v = resp(f, m) / n0;
                        pts.push([f, 20 * Math.log10(Math.max(v, 1e-12))]);
                    }
                    out.push({ label: names[m], color: cols[m], points: pts, dash: m === 2 });
                }
                return out;
            },
        },
    ],
    example: {
        title: t('1 Hz 速度计在 0.01 Hz 处的灵敏度', 'Sensitivity of a 1 Hz velocity sensor at 0.01 Hz'),
        input: t('f₀ = 1 Hz，f = 0.01 Hz', 'f₀ = 1 Hz, f = 0.01 Hz'),
        steps: [
            t('ω/ω₀ = 0.01，|T| ∝ ω/ω₀ = 0.01', 'ω/ω₀ = 0.01, |T| ∝ ω/ω₀ = 0.01'),
            t('即衰减 40 dB', 'i.e. 40 dB down'),
        ],
        output: t('长周期信号被压低 100 倍，必须换用宽带或长周期仪器', 'Long-period signal is suppressed 100-fold; a broadband or long-period instrument is required'),
    },
    links: {
        upstream: [{ id: 'seismometer-equation', note: t('摆的运动方程', 'The pendulum equation of motion') }],
        downstream: [{ id: 'pole-zero-response', note: t('零极点表示', 'The pole–zero representation') }],
        seealso: [{ id: 'instrument-deconvolution', note: t('频响如何被去除', 'How the response is removed') }],
    },
    refs: [{ text: 'Havskov, J. & Alguacil, G. (2004). Instrumentation in Earthquake Seismology. Springer' }],
};
export default seismometerFrequencyResponse;
//# sourceMappingURL=seismometer-frequency-response.js.map