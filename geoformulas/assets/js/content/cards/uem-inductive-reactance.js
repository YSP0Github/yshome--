import { t } from '../../core/types.js';
/** uem-inductive-reactance */
const uemInductiveReactance = {
    id: 'uem-inductive-reactance',
    name: t('感抗', 'Inductive Reactance'),
    aliases: { zh: ['感抗 XL=ωL', '电感对交流阻碍'], en: ['inductive reactance', 'XL=ωL'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC', 'Q.FREQ'],
        keywords: t('感抗 XL=ωL=2πfL 电感 交流 相位超前', 'inductive reactance XL omega L 2 pi f L AC phase leads'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `X_{L}=\omega L=2\pi f\,L`,
        variants: [
            { name: t('电压相位', 'Voltage phase'), latex: String.raw `\varphi_{u}-\varphi_{i}=\dfrac{\pi}{2}\ (\text{电压超前电流 }90^\circ)` },
        ],
    },
    meaning: t('电感对交流电的阻碍作用称感抗 X_L=ωL：频率越高、电感越大，感抗越大。电感两端电压相位超前电流 90°。直流（f=0）时感抗为零，电感相当于短路。', 'The opposition of an inductor to AC is its inductive reactance X_L=ωL: higher frequency and larger inductance give larger reactance. The voltage leads the current by 90°. For DC (f=0) the reactance is zero, so the inductor acts as a short.'),
    symbols: [
        { sym: 'X_{L}', name: t('感抗', 'inductive reactance'), unit: 'Ω' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: 'L', name: t('电感', 'inductance'), unit: 'H' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
    ],
    conditions: {
        applies: [t('正弦稳态交流；理想电感', 'Sinusoidal steady state; ideal inductor')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电感电压', 'Inductor voltage'),
            latex: String.raw `u_{L}=L\dfrac{di}{dt}=L\dfrac{d}{dt}(I_{m}\sin\omega t)=\omega L\,I_{m}\cos\omega t` },
        { n: 2, op: 'algebra', title: t('幅值比即感抗', 'Amplitude ratio = reactance'),
            latex: String.raw `X_{L}=\dfrac{U_{m}}{I_{m}}=\omega L` },
    ],
    links: {
        upstream: [{ id: 'uem-ac-peak-rms' }, { id: 'uem-self-inductance' }],
        downstream: [{ id: 'uem-rlc-impedance' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §31' }],
};
export default uemInductiveReactance;
//# sourceMappingURL=uem-inductive-reactance.js.map