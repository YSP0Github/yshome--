import { t } from '../../core/types.js';
/** ip-cole-cole-model */
const ipColeColeModel = {
    id: 'ip-cole-cole-model',
    name: t('Cole–Cole 复电阻率模型', 'The Cole–Cole Complex Resistivity Model'),
    aliases: { zh: ['Pelton 模型', '复电阻率频散'], en: ['Pelton model', 'complex resistivity dispersion'] },
    node: 'S16.3',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.APPROX'],
        method: ['METH.EM', 'METH.ROCK'],
        quantity: ['Q.ELEC', 'Q.FREQ'],
        keywords: t('Cole-Cole 复电阻率 充电率m 时间常数τ 频散 c指数', 'Cole-Cole complex resistivity chargeability time constant dispersion'),
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\rho(i\omega)=\rho_{0}\left[1-m\left(1-\frac{1}{1+(i\omega\tau)^{c}}\right)\right]`,
        variants: [
            { name: t('参数含义', 'Parameters'), latex: String.raw `\rho_{0}:\text{直流电阻率},\ m:\text{充电率},\ \tau:\text{时间常数},\ c:\text{频散指数}` },
        ],
    },
    meaning: t('Cole–Cole（Pelton）模型用四个参数描述岩石复电阻率随频率的频散：直流电阻率 ρ0、充电率 m、时间常数 τ（对应特征频率 f0=1/(2πτ)）和频散指数 c。不同岩性（浸染状硫化物、石墨、粘土）在 τ 和 c 上有差异，因此频率谱可用于区分极化体类型。', 'The Cole–Cole (Pelton) model describes the frequency dispersion of complex resistivity with four parameters: DC resistivity ρ0, chargeability m, time constant τ (characteristic frequency f0=1/(2πτ)) and dispersion exponent c. Different polarisable materials (disseminated sulphides, graphite, clays) differ in τ and c, so the spectral shape helps discriminate the polarising body.'),
    symbols: [
        { sym: '\\rho(i\\omega)', name: t('复电阻率', 'complex resistivity'), unit: 'Ω·m' },
        { sym: '\\rho_{0}', name: t('直流（低频）电阻率', 'DC (low-frequency) resistivity'), unit: 'Ω·m' },
        { sym: 'm', name: t('充电率', 'chargeability'), unit: '无量纲' },
        { sym: '\\tau', name: t('时间常数', 'time constant'), unit: 's' },
        { sym: 'c', name: t('频散指数', 'dispersion exponent'), unit: '无量纲', typical: '0.1 – 0.6' },
    ],
    conditions: {
        applies: [t('线性、弱极化岩石频谱', 'Linear, weakly polarisable rocks')],
        assumes: [t('单弛豫过程（广义可叠加）', 'Single relaxation (generalised superposition)')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('高频极限 ρ∞', 'High-frequency limit'),
            latex: String.raw `\omega\to\infty:\ \rho\to\rho_{0}(1-m)` },
        { n: 2, op: 'identity', title: t('低频极限 ρ0', 'Low-frequency limit'),
            latex: String.raw `\omega\to 0:\ \rho\to\rho_{0}` },
        { n: 3, op: 'result', title: t('中间过渡为 Cole–Cole', 'Transition given by Cole–Cole'),
            latex: String.raw `\rho(i\omega)=\rho_{0}\left[1-m\left(1-\dfrac{1}{1+(i\omega\tau)^{c}}\right)\right]` },
    ],
    viz: [
        {
            id: 'cole-cole-rho',
            level: 'V1',
            title: t('Cole–Cole 复电阻率模随频率', 'Cole–Cole |ρ| vs frequency'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('|ρ|/ρ0', '|ρ|/ρ0'),
            xScale: 'log',
            controls: [
                { id: 'mcc', label: t('充电率 m', 'chargeability m'), min: 0.05, max: 0.5, step: 0.05, value: 0.2 },
                { id: 'tau', label: t('时间常数 τ (s)', 'time constant τ'), min: 0.001, max: 1, step: 0.001, value: 0.01 },
                { id: 'cexp', label: t('c', 'dispersion exponent'), min: 0.1, max: 0.8, step: 0.05, value: 0.5 },
            ],
            compute: (p) => {
                const mcc = p['mcc'], tau = p['tau'], cexp = p['cexp'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const f = Math.pow(10, -2 + (i / 200) * 5); // 0.01 .. 1000 Hz
                    const w = 2 * Math.PI * f;
                    const wt = w * tau;
                    const mag = Math.pow(wt, cexp);
                    const ang = (Math.PI / 2) * cexp;
                    // z = mag * (cos ang + i sin ang)
                    const zr = mag * Math.cos(ang), zi = mag * Math.sin(ang);
                    // 1/(1+z)
                    const den = (1 + zr) * (1 + zr) + zi * zi;
                    const invr = (1 + zr) / den, invi = -zi / den;
                    // rho/rho0 = 1 - m*(1 - inv)
                    const rr = 1 - mcc * (1 - invr), ri = -mcc * (0 - invi);
                    pts.push([f, Math.sqrt(rr * rr + ri * ri)]);
                }
                return [{ label: t('|ρ|/ρ0', '|ρ|/ρ0'), color: '#993C1D', points: pts }];
            },
            note: t('高频段 |ρ| 从 ρ0 下跳到 ρ0(1−m)；过渡段中心在 f≈1/(2πτ)。c 越小过渡越宽。', 'At high f, |ρ| drops from ρ0 to ρ0(1−m); the transition centers near f≈1/(2πτ). Smaller c broadens the transition.'),
        },
    ],
    links: {
        upstream: [{ id: 'ip-frequency-domain-pfe' }, { id: 'ip-time-domain-chargeability' }],
        seealso: [{ id: 'ip-polarization-mechanisms' }],
    },
    refs: [{ text: 'Pelton et al. (1978), Geophysics, 43' }],
};
export default ipColeColeModel;
//# sourceMappingURL=ip-cole-cole-model.js.map