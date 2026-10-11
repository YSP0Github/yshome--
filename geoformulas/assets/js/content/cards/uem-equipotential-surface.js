import { t } from '../../core/types.js';
/** uem-equipotential-surface */
const uemEquipotentialSurface = {
    id: 'uem-equipotential-surface',
    name: t('等势面', 'Equipotential Surface'),
    aliases: { zh: ['等势面', '等势线'], en: ['equipotential', 'equipotential lines'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.GEOM'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('等势面 电场线垂直 不做功 导体表面', 'equipotential surface perpendicular field lines no work conductor surface'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `V(\mathbf{r})=\text{const},\qquad \mathbf{E}\perp(\text{等势面}),\qquad W_{\text{沿等势面}}=0`,
        variants: [
            { name: t('相邻等势面间距', 'Spacing between adjacent equipotentials'), latex: String.raw `\Delta d\approx\dfrac{\Delta V}{E}` },
        ],
    },
    meaning: t('等势面是电势相等的点连成的面。电场线处处与等势面垂直，沿等势面移动电荷电场不做功。导体表面就是一个等势面；等势面越密处场强越大。', 'An equipotential surface joins points of equal potential. Field lines are everywhere perpendicular to it, and moving a charge along it requires no work. A conductor surface is an equipotential; where equipotentials are closer together the field is stronger.'),
    symbols: [
        { sym: 'V', name: t('电势', 'electric potential'), unit: 'V' },
        { sym: '\\mathbf{E}', name: t('电场（垂直等势面）', 'field (normal to surface)'), unit: 'V/m' },
    ],
    conditions: {
        applies: [t('静电场中任意电势分布', 'Any electrostatic potential distribution')],
    },
    links: {
        upstream: [{ id: 'uem-potential-gradient-e' }],
        seealso: [{ id: 'uem-conductor-electrostatic-equilibrium' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §24' }],
};
export default uemEquipotentialSurface;
//# sourceMappingURL=uem-equipotential-surface.js.map