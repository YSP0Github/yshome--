import { t } from '../../core/types.js';
/** uem-motional-emf */
const uemMotionalEmf = {
    id: 'uem-motional-emf',
    name: t('动生电动势', 'Motional EMF'),
    aliases: { zh: ['动生电动势 ε=BLv', '切割磁感线'], en: ['motional EMF', 'flux cutting'] },
    node: 'S19.4',
    tags: {
        math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC', 'Q.MAG'],
        keywords: t('动生电动势 BLv 导体切割磁感线 洛伦兹力 导线运动', 'motional EMF B L v conductor moving through field Lorentz force'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathcal{E}=B\,L\,v`,
        variants: [
            { name: t('一般式', 'General form'), latex: String.raw `\mathcal{E}=\int(\mathbf{v}\times\mathbf{B})\cdot d\mathbf{l}` },
        ],
    },
    meaning: t('导体在磁场中运动切割磁感线时，其中自由电子受 Lorentz 力而沿导线迁移，形成动生电动势。正交情形 ε=BLv。它是发电机转子产生电动势的微观图像。', 'When a conductor moves through a magnetic field, free electrons feel the Lorentz force and drift along the wire, creating a motional EMF. In the orthogonal case ε=BLv. It is the microscopic picture of how generator rotors produce EMF.'),
    symbols: [
        { sym: '\\mathcal{E}', name: t('动生电动势', 'motional EMF'), unit: 'V' },
        { sym: 'B', name: t('磁感应强度', 'magnetic field'), unit: 'T' },
        { sym: 'L', name: t('导线有效长度', 'effective wire length'), unit: 'm' },
        { sym: 'v', name: t('运动速度（⊥B）', 'speed perpendicular to B'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('B、L、v 三者两两垂直；均匀场', 'B, L, v mutually perpendicular; uniform field')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电子受 Lorentz 力', 'Electron feels Lorentz force'),
            latex: String.raw `F=evB` },
        { n: 2, op: 'algebra', title: t('沿导线电势差=力×长度/e', 'Potential drop = force×length/e'),
            latex: String.raw `\mathcal{E}=\dfrac{F\,L}{e}=B\,L\,v` },
        { n: 3, op: 'result', title: t('与法拉第定律一致', 'Consistent with Faraday'),
            latex: String.raw `\mathcal{E}=-\dfrac{d\Phi_{B}}{dt}=-\dfrac{d(BA)}{dt}=-B\,L\,v` },
    ],
    links: {
        upstream: [{ id: 'uem-faraday-law-emf' }, { id: 'uem-lorentz-force' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
};
export default uemMotionalEmf;
//# sourceMappingURL=uem-motional-emf.js.map