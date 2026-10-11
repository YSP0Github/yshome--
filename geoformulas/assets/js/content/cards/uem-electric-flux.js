import { t } from '../../core/types.js';
/** uem-electric-flux */
const uemElectricFlux = {
    id: 'uem-electric-flux',
    name: t('电通量', 'Electric Flux'),
    aliases: { zh: ['电场通量', 'E·dA'], en: ['electric flux', 'flux of E'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('电通量 电场线穿过面积 点积 闭合曲面', 'electric flux field lines through area dot product closed surface'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\Phi_{E}=\iint_{S}\mathbf{E}\cdot d\mathbf{A}=\iint_{S}E\cos\theta\,dA`,
        variants: [
            { name: t('匀强场平面', 'Uniform field through flat area'), latex: String.raw `\Phi_{E}=E\,A\cos\theta` },
        ],
    },
    meaning: t('电通量度量穿过一个面的电场线"数量"。它是 E 与面元法向 dA 的点积积分：场越强、面越大、越正对场方向，通量越大。闭合曲面的净通量是 Gauss 定律的入口。', 'Electric flux measures the "number" of field lines passing through a surface. It is the integral of E dotted with the area-normal dA: stronger field, larger area, and better alignment all increase flux. The net flux through a closed surface is the entry point to Gauss\'s law.'),
    symbols: [
        { sym: '\\Phi_{E}', name: t('电通量', 'electric flux'), unit: 'N·m²/C' },
        { sym: '\\mathbf{E}', name: t('电场', 'electric field'), unit: 'V/m' },
        { sym: 'd\\mathbf{A}', name: t('面元矢量（外法向）', 'area element, outward normal'), unit: 'm²' },
        { sym: '\\theta', name: t('E 与法向夹角', 'angle between E and normal'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('任意曲面；场已知', 'Any surface with a known field')],
    },
    links: {
        downstream: [{ id: 'uem-gauss-law' }],
        seealso: [{ id: 'divergence-theorem' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §23' }],
};
export default uemElectricFlux;
//# sourceMappingURL=uem-electric-flux.js.map