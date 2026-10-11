import { t } from '../../core/types.js';
/** uem-ohms-law */
const uemOhmsLaw = {
    id: 'uem-ohms-law',
    name: t('Ohm 定律', "Ohm's Law"),
    aliases: { zh: ['欧姆定律 I=U/R', 'U=IR'], en: ["Ohm's law", 'V=IR'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('欧姆定律 I=U/R U=IR 电阻 线性元件', 'Ohm law I=U/R U=IR resistance linear ohmic'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `U=I\,R\quad\Longleftrightarrow\quad I=\frac{U}{R}`,
        variants: [
            { name: t('微观形式', 'Microscopic form'), latex: String.raw `\mathbf{J}=\sigma\,\mathbf{E}=\dfrac{\mathbf{E}}{\rho_{e}}` },
        ],
    },
    meaning: t('在欧姆元件中，电压与电流成正比，比例系数即电阻 R。这是直流电路分析的基本关系；微观上 J=σE，即电流密度正比于驱动它的电场。', 'For an ohmic device, voltage is proportional to current, with resistance R as the constant of proportionality. It is the basic relation of DC circuit analysis; microscopically J=σE, i.e. current density is proportional to the driving field.'),
    symbols: [
        { sym: 'U', name: t('电压', 'voltage'), unit: 'V' },
        { sym: 'I', name: t('电流', 'current'), unit: 'A' },
        { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
        { sym: '\\sigma', name: t('电导率', 'conductivity'), unit: 'S/m' },
        { sym: '\\rho_{e}', name: t('电阻率（区别于密度 ρ）', 'resistivity (not density ρ)'), unit: 'Ω·m' },
    ],
    conditions: {
        applies: [t('线性电阻（金属、碳膜等），温度恒定', 'Linear resistors at constant temperature')],
        breaks: [t('二极管、气体、半导体等非线性器件不服从', 'Nonlinear devices (diodes, gases) do not obey it')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('微观 J=σE', 'Microscopic J=σE'),
            latex: String.raw `\mathbf{J}=\sigma\mathbf{E}` },
        { n: 2, op: 'algebra', title: t('对均匀导体截面积分', 'Integrate over a uniform conductor'),
            latex: String.raw `I=JA,\quad U=EL\ \Rightarrow\ U=E\,L=\dfrac{J}{\sigma}L=\dfrac{I\,L}{\sigma A}=IR` },
    ],
    links: {
        upstream: [{ id: 'uem-current-current-density' }],
        downstream: [{ id: 'uem-resistance-resistivity' }, { id: 'uem-electric-power' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §26' }],
};
export default uemOhmsLaw;
//# sourceMappingURL=uem-ohms-law.js.map