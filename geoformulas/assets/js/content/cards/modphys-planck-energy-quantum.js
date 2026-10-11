import { t } from '../../core/types.js';
/** modphys-planck-energy-quantum */
const modphysPlanckEnergyQuantum = {
    id: 'modphys-planck-energy-quantum',
    name: t('Planck 能量子假说', "Planck's Energy-Quantum Hypothesis"),
    aliases: { zh: ['能量子', 'E=hν', '普朗克常数'], en: ['energy quantum', 'E = h nu', 'Planck constant'] },
    node: 'S20.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.ENERGY'],
        keywords: t('普朗克 能量子 E=hν 量子化 普朗克常数 黑体紫外灾难', "Planck energy quantum E = h nu quantization blackbody ultraviolet catastrophe"),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `E=h\nu,\qquad h=6.626\times10^{-34}\ \mathrm{J\cdot s}`,
        variants: [
            { name: t('用角频率表示', 'In terms of angular frequency'), latex: String.raw `E=\hbar\omega,\qquad \hbar=\frac{h}{2\pi}=1.055\times10^{-34}\ \mathrm{J\cdot s}` },
        ],
    },
    meaning: t('1900 年 Planck 为了凑出与实验吻合的黑体谱，被迫假设：谐振子发射/吸收的能量不是连续的，而是一份份"能量子" E=hν 的整数倍。这个 h（普朗克常数）小得惊人（10⁻³⁴ J·s），所以宏观世界看着连续；但在原子尺度它是能量的基本"颗粒度"，标志量子物理的开端。', 'In 1900 Planck, forced to fit a blackbody spectrum that matched experiment, had to assume that oscillators emit and absorb energy not continuously but in discrete "energy quanta" E = hν. The constant h is tiny (10⁻³⁴ J·s), which is why the macro world looks continuous; at the atomic scale it is the basic granularity of energy and marks the birth of quantum physics.'),
    symbols: [
        { sym: 'E', name: t('能量子能量', 'energy of one quantum'), unit: 'J' },
        { sym: '\\nu', name: t('频率', 'frequency'), unit: 'Hz' },
        { sym: 'h', name: t('Planck 常数', 'Planck constant'), unit: 'J·s' },
        { sym: '\\hbar', name: t('约化 Planck 常数', 'reduced Planck constant'), unit: 'J·s' },
    ],
    conditions: {
        applies: [t('微观谐振子的能量交换', 'Energy exchange of microscopic oscillators')],
        assumes: [t('谐振子频率 ν 固定', 'The oscillator frequency ν is fixed')],
        breaks: [t('宏观物体能量间隔小到不可分辨', 'For macroscopic bodies the energy levels are too close to resolve')],
    },
    links: {
        downstream: [{ id: 'modphys-photoelectric-effect' }, { id: 'modphys-wien-displacement-law' }],
    },
    refs: [{ text: 'Brehme & Beiser, Modern Physics, §2' }],
};
export default modphysPlanckEnergyQuantum;
//# sourceMappingURL=modphys-planck-energy-quantum.js.map