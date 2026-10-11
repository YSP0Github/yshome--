import { t } from '../../core/types.js';
/** uem-rlc-impedance */
const uemRlcImpedance = {
    id: 'uem-rlc-impedance',
    name: t('RLC 串联阻抗', 'RLC Series Impedance'),
    aliases: { zh: ['阻抗 Z=√(R²+(XL−XC)²)', '复阻抗'], en: ['RLC impedance', 'complex impedance'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('RLC 串联 阻抗 Z 感抗 容抗 相位角 阻抗三角形', 'RLC series impedance Z reactance phase angle impedance triangle'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `Z=\sqrt{R^{2}+\left(X_{L}-X_{C}\right)^{2}},\qquad \varphi=\tan^{-1}\!\frac{X_{L}-X_{C}}{R}`,
        variants: [
            { name: t('复数阻抗', 'Complex impedance'), latex: String.raw `\mathbf{Z}=R+j(\omega L-\dfrac{1}{\omega C})` },
            { name: t('交流 Ohm 定律', 'AC Ohm law'), latex: String.raw `I=\dfrac{U}{Z}` },
        ],
    },
    meaning: t('RLC 串联电路中，电阻 R 与两个反相的电抗 X_L、X_C 合成总阻抗 Z。电压与电流的相位差 φ 由净电抗与电阻之比决定。它是分析交流电路与谐振的基础。', 'In a series RLC circuit the resistance R combines with two opposing reactances X_L and X_C into a total impedance Z. The phase difference φ between voltage and current is set by the net reactance over the resistance. It is the basis of AC circuit analysis and resonance.'),
    symbols: [
        { sym: 'Z', name: t('阻抗', 'impedance'), unit: 'Ω' },
        { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
        { sym: 'X_{L}', name: t('感抗', 'inductive reactance'), unit: 'Ω' },
        { sym: 'X_{C}', name: t('容抗', 'capacitive reactance'), unit: 'Ω' },
        { sym: '\\varphi', name: t('相位差', 'phase difference'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('正弦稳态 RLC 串联电路', 'Sinusoidal steady-state series RLC circuit')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电阻与电抗正交', 'R and reactances are orthogonal'),
            latex: String.raw `\mathbf{Z}=R+j(X_{L}-X_{C})` },
        { n: 2, op: 'algebra', title: t('求模', 'Take the modulus'),
            latex: String.raw `|\mathbf{Z}|=\sqrt{R^{2}+(X_{L}-X_{C})^{2}}` },
        { n: 3, op: 'result', title: t('相位角', 'Phase angle'),
            latex: String.raw `\varphi=\tan^{-1}\dfrac{X_{L}-X_{C}}{R}` },
    ],
    viz: [
        {
            id: 'z-vs-freq',
            level: 'V2',
            title: t('RLC 串联阻抗随频率', 'RLC series impedance vs frequency'),
            xlabel: t('角频率 ω (rad/s)', 'angular frequency ω (rad/s)'),
            ylabel: t('阻抗 |Z| (Ω)', 'impedance |Z| (Ω)'),
            xScale: 'log',
            controls: [
                { id: 'rres', label: t('电阻 R (Ω)', 'resistance R'), min: 1, max: 200, step: 1, value: 50, unit: 'Ω' },
                { id: 'lind', label: t('电感 L (mH)', 'inductance L'), min: 10, max: 1000, step: 10, value: 100, unit: 'mH' },
                { id: 'ccap', label: t('电容 C (μF)', 'capacitance C'), min: 1, max: 100, step: 1, value: 10, unit: 'μF' },
            ],
            compute: (p) => {
                const R = p['rres'];
                const L = p['lind'] * 1e-3;
                const C = p['ccap'] * 1e-6;
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const w = Math.pow(10, 1 + (i / 300) * 3); // 10 .. 1e4 rad/s
                    const XL = w * L;
                    const XC = 1 / (w * C);
                    const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
                    pts.push([w, Z]);
                }
                return [{ label: t('|Z|=√(R²+(XL−XC)²)', '|Z|=√(R²+(XL−XC)²)'), color: '#185FA5', points: pts }];
            },
            note: t('曲线在谐振角频率 ω0=1/√(LC) 处达到极小值 Z=R。', 'The curve bottoms out at the resonance ω0=1/√(LC) with Z=R.'),
        },
    ],
    links: {
        upstream: [{ id: 'uem-inductive-reactance' }, { id: 'uem-capacitive-reactance' }],
        downstream: [{ id: 'uem-series-resonance' }, { id: 'uem-ac-power-factor' }],
        seealso: [{ id: 'complex-phasor-representation' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §31' }],
};
export default uemRlcImpedance;
//# sourceMappingURL=uem-rlc-impedance.js.map