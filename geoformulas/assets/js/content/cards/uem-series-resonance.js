import { t } from '../../core/types.js';
/** uem-series-resonance */
const uemSeriesResonance = {
    id: 'uem-series-resonance',
    name: t('RLC 串联谐振', 'Series RLC Resonance'),
    aliases: { zh: ['串联谐振 f0=1/2π√LC', '谐振频率'], en: ['series resonance', 'resonant frequency'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.ROOT'],
        method: ['METH.PHYS'],
        quantity: ['Q.FREQ', 'Q.ELEC'],
        keywords: t('串联谐振 f0 1/2π√LC 谐振峰 Q值 选频电路', 'series resonance f0 1 over 2 pi sqrt LC peak Q factor tuning circuit'),
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `f_{0}=\frac{1}{2\pi\sqrt{LC}},\qquad \omega_{0}=\frac{1}{\sqrt{LC}}`,
        variants: [
            { name: t('谐振时', 'At resonance'), latex: String.raw `X_{L}=X_{C},\ Z=R,\ I=U/R\ (\text{最大})` },
            { name: t('品质因数', 'Quality factor'), latex: String.raw `Q=\dfrac{\omega_{0}L}{R}=\dfrac{1}{\omega_{0}RC}` },
        ],
    },
    meaning: t('当感抗与容抗相等时，电抗相互抵消、阻抗最小且等于 R，电流达到最大，电路发生串联谐振。谐振频率 f0=1/2π√LC。Q 值越高谐振峰越尖锐，选频（收音机选台、滤波器）越灵敏。', 'When inductive and capacitive reactances cancel, the impedance is minimized to R and the current peaks—the circuit is in series resonance. The resonant frequency is f0=1/2π√LC. A higher Q gives a sharper peak and more selective tuning (radio tuning, filters).'),
    symbols: [
        { sym: 'f_{0}', name: t('谐振频率', 'resonant frequency'), unit: 'Hz' },
        { sym: '\\omega_{0}', name: t('谐振角频率', 'resonant angular frequency'), unit: 'rad/s' },
        { sym: 'L', name: t('电感', 'inductance'), unit: 'H' },
        { sym: 'C', name: t('电容', 'capacitance'), unit: 'F' },
        { sym: 'Q', name: t('品质因数', 'quality factor'), unit: '—' },
    ],
    conditions: {
        applies: [t('正弦稳态 RLC 串联电路', 'Sinusoidal steady-state series RLC')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('谐振条件 XL=XC', 'Resonance condition XL=XC'),
            latex: String.raw `\omega L=\dfrac{1}{\omega C}` },
        { n: 2, op: 'algebra', title: t('解 ω', 'Solve for ω'),
            latex: String.raw `\omega_{0}^{2}=\dfrac{1}{LC}\ \Rightarrow\ \omega_{0}=\dfrac{1}{\sqrt{LC}},\ f_{0}=\dfrac{1}{2\pi\sqrt{LC}}` },
        { n: 3, op: 'result', title: t('此时 Z=R、电流最大', 'Then Z=R, current maximal'),
            latex: String.raw `I=\dfrac{U}{Z}=\dfrac{U}{R}` },
    ],
    viz: [
        {
            id: 'resonance-curve',
            level: 'V3',
            title: t('串联谐振电流曲线', 'Series resonance current curve'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('归一化电流 I/I0', 'normalized current I/I0'),
            xRange: [0, 2000],
            controls: [
                { id: 'lind', label: t('电感 L (mH)', 'inductance L'), min: 10, max: 1000, step: 10, value: 100, unit: 'mH' },
                { id: 'ccap', label: t('电容 C (μF)', 'capacitance C'), min: 1, max: 100, step: 1, value: 10, unit: 'μF' },
                { id: 'rres', label: t('电阻 R (Ω)', 'resistance R'), min: 1, max: 200, step: 1, value: 20, unit: 'Ω' },
            ],
            compute: (p) => {
                const L = p['lind'] * 1e-3;
                const C = p['ccap'] * 1e-6;
                const R = p['rres'];
                const pts = [];
                for (let i = 1; i <= 400; i++) {
                    const f = (i / 400) * 2000;
                    const w = 2 * Math.PI * f;
                    const XL = w * L;
                    const XC = 1 / (w * C);
                    const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
                    pts.push([f, R / Z]);
                }
                return [{ label: t('I/I0', 'I/I0'), color: '#993C1D', points: pts }];
            },
            note: t('峰位在 f0=1/2π√LC；增大 R 使峰变宽变矮（Q 降低）。', 'Peak sits at f0=1/2π√LC; increasing R broadens and lowers it (lower Q).'),
        },
    ],
    example: {
        title: t('算例：求谐振频率', 'Worked: find resonant frequency'),
        input: t('L=100 mH，C=1.0 μF，R=50 Ω', 'L=100 mH, C=1.0 μF, R=50 Ω'),
        steps: [
            t('ω0=1/√(LC)=1/√(0.1×10⁻⁶)=1/√10⁻⁷≈3162 rad/s', 'ω0=1/√(LC)=1/√(0.1×10⁻⁶)≈3162 rad/s'),
            t('f0=ω0/2π≈503 Hz', 'f0=ω0/2π≈503 Hz'),
            t('Q=ω0L/R=3162×0.1/50≈6.3', 'Q=ω0L/R=3162×0.1/50≈6.3'),
        ],
        output: t('谐振频率约 503 Hz，品质因数约 6.3。', 'Resonant frequency ≈503 Hz, Q≈6.3.'),
    },
    links: {
        upstream: [{ id: 'uem-rlc-impedance' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §31' }],
};
export default uemSeriesResonance;
//# sourceMappingURL=uem-series-resonance.js.map