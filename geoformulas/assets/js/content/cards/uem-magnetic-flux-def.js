import { t } from '../../core/types.js';
/** uem-magnetic-flux-def */
const uemMagneticFluxDef = {
    id: 'uem-magnetic-flux-def',
    name: t('磁通量', 'Magnetic Flux'),
    aliases: { zh: ['磁通量 ΦB', 'B·dS'], en: ['magnetic flux', 'flux of B'] },
    node: 'S19.4',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.MAG'],
        keywords: t('磁通量 B·dS 穿过线圈 韦伯 匀强 B A cosθ', 'magnetic flux B dot dS through loop weber uniform B A cos theta'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\Phi_{B}=\iint_{S}\mathbf{B}\cdot d\mathbf{S}`,
        variants: [
            { name: t('匀强平面', 'Uniform field, flat area'), latex: String.raw `\Phi_{B}=BA\cos\theta` },
        ],
    },
    meaning: t('磁通量是穿过某面的磁感线"数量"，等于 B 与面元法向的点积积分。它是 Faraday 电磁感应的核心：感应电动势由磁通量的变化率决定。', 'Magnetic flux measures the "number" of field lines passing through a surface—the integral of B dotted with the area-normal. It is the heart of Faraday induction: the induced EMF is set by the rate of change of flux.'),
    symbols: [
        { sym: '\\Phi_{B}', name: t('磁通量', 'magnetic flux'), unit: 'Wb' },
        { sym: '\\mathbf{B}', name: t('磁感应强度', 'magnetic field'), unit: 'T' },
        { sym: 'd\\mathbf{S}', name: t('面元矢量', 'area element'), unit: 'm²' },
    ],
    conditions: {
        applies: [t('任意曲面；场已知', 'Any surface with known field')],
    },
    links: {
        downstream: [{ id: 'uem-faraday-law-emf' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
};
export default uemMagneticFluxDef;
//# sourceMappingURL=uem-magnetic-flux-def.js.map