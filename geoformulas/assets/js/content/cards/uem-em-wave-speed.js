import { t } from '../../core/types.js';
/** uem-em-wave-speed */
const uemEmWaveSpeed = {
    id: 'uem-em-wave-speed',
    name: t('电磁波速与光速', 'EM Wave Speed and the Speed of Light'),
    aliases: { zh: ['c=1/√(μ0ε0)', '光速=电磁波速'], en: ['speed of light', 'EM wave speed c'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL'],
        keywords: t('电磁波速 c 1/√μ0ε0 光速 真空 光即电磁波', 'EM wave speed c 1 over sqrt mu0 epsilon0 speed of light light is EM wave'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `c=\frac{1}{\sqrt{\mu_{0}\varepsilon_{0}}}\approx 3.00\times 10^{8}\ \mathrm{m/s}`,
        variants: [
            { name: t('介质中', 'In a medium'), latex: String.raw `v=\dfrac{1}{\sqrt{\mu\varepsilon}}=\dfrac{c}{n}` },
        ],
    },
    meaning: t('从 Maxwell 方程组可推出真空中交变电磁场以波传播，波速恰好等于由 μ0、ε0 算出的常数——正好是实测光速。Maxwell 由此预言"光就是一种电磁波"，完成光学与电磁学的统一。', 'From Maxwell\'s equations, time-varying E and B propagate as a wave in vacuum with a speed set by μ0 and ε0—numerically equal to the measured speed of light. Maxwell thus predicted that "light is an electromagnetic wave", unifying optics and electromagnetism.'),
    symbols: [
        { sym: 'c', name: t('真空中光速（区别于电容 C）', 'speed of light in vacuum'), unit: 'm/s', typical: '3.00×10⁸' },
        { sym: '\\mu_{0}', name: t('真空磁导率', 'permeability'), unit: 'H/m' },
        { sym: '\\varepsilon_{0}', name: t('真空介电常数', 'permittivity'), unit: 'F/m' },
        { sym: 'n', name: t('介质折射率', 'refractive index'), unit: '—' },
    ],
    conditions: {
        applies: [t('真空；非磁性介质', 'Vacuum; non-magnetic medium')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('真空无电荷电流', 'No charges/currents in vacuum'),
            latex: String.raw `\nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t},\quad \nabla\times\mathbf{B}=\mu_{0}\varepsilon_{0}\dfrac{\partial\mathbf{E}}{\partial t}` },
        { n: 2, op: 'transform', title: t('取旋度得波动方程', 'Take curl to get wave equation'),
            latex: String.raw `\nabla^{2}\mathbf{E}=\mu_{0}\varepsilon_{0}\dfrac{\partial^{2}\mathbf{E}}{\partial t^{2}}` },
        { n: 3, op: 'result', title: t('读出波速', 'Read off wave speed'),
            latex: String.raw `v^{2}=\dfrac{1}{\mu_{0}\varepsilon_{0}}\ \Rightarrow\ c=\dfrac{1}{\sqrt{\mu_{0}\varepsilon_{0}}}` },
    ],
    links: {
        upstream: [{ id: 'uem-maxwell-equations' }],
        downstream: [{ id: 'uem-poynting-vector-energy' }, { id: 'uem-em-spectrum' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §9.2' }],
};
export default uemEmWaveSpeed;
//# sourceMappingURL=uem-em-wave-speed.js.map