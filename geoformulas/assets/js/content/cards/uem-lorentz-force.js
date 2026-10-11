import { t } from '../../core/types.js';
/** uem-lorentz-force */
const uemLorentzForce = {
    id: 'uem-lorentz-force',
    name: t('Lorentz 力', 'Lorentz Force'),
    aliases: { zh: ['洛伦兹力 F=qvB', 'q(E+v×B)'], en: ['Lorentz force', 'electromagnetic force on charge'] },
    node: 'S19.3',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.MAG', 'Q.ELEC'],
        keywords: t('洛伦兹力 qv×B qE 带电粒子 磁场 电场 不做功', 'Lorentz force q v cross B charge particle magnetic electric no work'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{F}=q\,(\mathbf{E}+\mathbf{v}\times\mathbf{B})`,
        variants: [
            { name: t('纯磁场中', 'Pure magnetic field'), latex: String.raw `\mathbf{F}=q\,\mathbf{v}\times\mathbf{B},\qquad F=qvB\sin\theta` },
        ],
    },
    meaning: t('带电粒子所受电磁力是电场力 qE 与磁场力 qv×B 之和。磁力始终垂直于速度，故不做功、只改变方向；这是回旋加速器、质谱仪、磁约束的物理基础。', 'The electromagnetic force on a charge is the sum of the electric force qE and the magnetic force qv×B. The magnetic part is always perpendicular to velocity, so it does no work—it only changes direction. It underlies cyclotrons, mass spectrometers and magnetic confinement.'),
    symbols: [
        { sym: '\\mathbf{F}', name: t('Lorentz 力', 'Lorentz force'), unit: 'N' },
        { sym: 'q', name: t('粒子电荷', 'charge'), unit: 'C' },
        { sym: '\\mathbf{E}', name: t('电场', 'electric field'), unit: 'V/m' },
        { sym: '\\mathbf{v}', name: t('粒子速度', 'velocity'), unit: 'm/s' },
        { sym: '\\mathbf{B}', name: t('磁感应强度', 'magnetic field'), unit: 'T' },
    ],
    conditions: {
        applies: [t('经典力学（v≪c）、点电荷', 'Classical regime (v≪c), point charge')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电场力', 'Electric force'),
            latex: String.raw `\mathbf{F}_{E}=q\mathbf{E}` },
        { n: 2, op: 'physics', title: t('磁场力', 'Magnetic force'),
            latex: String.raw `\mathbf{F}_{B}=q\mathbf{v}\times\mathbf{B}` },
        { n: 3, op: 'result', title: t('叠加', 'Add them'),
            latex: String.raw `\mathbf{F}=q(\mathbf{E}+\mathbf{v}\times\mathbf{B})` },
    ],
    links: {
        upstream: [{ id: 'uem-magnetic-field-b' }],
        downstream: [{ id: 'uem-charged-particle-cyclotron' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §5.1' }],
};
export default uemLorentzForce;
//# sourceMappingURL=uem-lorentz-force.js.map