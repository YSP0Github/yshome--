import { t } from '../../core/types.js';
/** uem-capacitive-reactance */
const uemCapacitiveReactance = {
    id: 'uem-capacitive-reactance',
    name: t('容抗', 'Capacitive Reactance'),
    aliases: { zh: ['容抗 XC=1/ωC', '电容对交流阻碍'], en: ['capacitive reactance', 'XC=1/ωC'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC', 'Q.FREQ'],
        keywords: t('容抗 XC=1/ωC 电容 交流 相位滞后 隔直通交', 'capacitive reactance XC 1 over omega C AC phase lags blocks DC'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `X_{C}=\frac{1}{\omega C}=\frac{1}{2\pi f\,C}`,
        variants: [
            { name: t('电流相位', 'Current phase'), latex: String.raw `\varphi_{i}-\varphi_{u}=\dfrac{\pi}{2}\ (\text{电流超前电压 }90^\circ)` },
        ],
    },
    meaning: t('电容对交流电的阻碍称容抗 X_C=1/ωC：频率越高、电容越大，容抗越小。电容电流相位超前电压 90°。直流（f=0）时容抗无穷大，电容"隔直通交"。', 'The opposition of a capacitor to AC is its capacitive reactance X_C=1/ωC: higher frequency and larger capacitance give smaller reactance. The current leads the voltage by 90°. For DC (f=0) the reactance is infinite, so a capacitor "blocks DC and passes AC".'),
    symbols: [
        { sym: 'X_{C}', name: t('容抗', 'capacitive reactance'), unit: 'Ω' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: 'C', name: t('电容', 'capacitance'), unit: 'F' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
    ],
    conditions: {
        applies: [t('正弦稳态交流；理想电容', 'Sinusoidal steady state; ideal capacitor')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电容电流', 'Capacitor current'),
            latex: String.raw `i=C\dfrac{du}{dt}=C\dfrac{d}{dt}(U_{m}\sin\omega t)=\omega C\,U_{m}\cos\omega t` },
        { n: 2, op: 'algebra', title: t('幅值比倒数即容抗', 'Inverse amplitude ratio = reactance'),
            latex: String.raw `X_{C}=\dfrac{U_{m}}{I_{m}}=\dfrac{1}{\omega C}` },
    ],
    links: {
        upstream: [{ id: 'uem-ac-peak-rms' }, { id: 'uem-capacitance' }],
        downstream: [{ id: 'uem-rlc-impedance' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §31' }],
};
export default uemCapacitiveReactance;
//# sourceMappingURL=uem-capacitive-reactance.js.map