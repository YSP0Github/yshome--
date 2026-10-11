import { t } from '../../core/types.js';
/** phys-archimedes-buoyancy */
const physArchimedesBuoyancy = {
    id: 'phys-archimedes-buoyancy',
    name: t('Archimedes 浮力原理', "Archimedes' Principle of Buoyancy"),
    aliases: { zh: ['阿基米德原理', '浮力'], en: ['Archimedes principle', 'buoyant force'] },
    node: 'S18.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.GEOM', 'Q.ENERGY'],
        keywords: t('浮力 阿基米德 排开液体 浮沉 漂浮 F=ρgV', 'buoyancy Archimedes displaced volume float sink'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `F_b=\rho_{\text{fluid}}\,g\,V_{\text{displaced}}`,
        variants: [
            { name: t('漂浮条件', 'floating condition'), latex: String.raw `F_b=mg\;\Rightarrow\;\rho_{\text{fluid}} V_{\text{sub}}=\rho_{\text{body}} V_{\text{body}}` },
        ],
    },
    meaning: t('物体在流体中受到的浮力，等于它排开的那部分流体的重量，方向竖直向上。物体全浸时排开体积就是自身体积；漂浮时只有一部分浸入，排开体积对应的浮力恰好等于物体重力。铁块沉是因为 ρ铁>ρ水，钢铁轮船能浮是因为空心、平均密度小于水。', 'The buoyant force on an object equals the weight of the fluid it displaces, directed upward. Fully submerged, the displaced volume is the whole object; floating, only part is immersed, and the displaced weight exactly balances the object’s weight. Iron sinks because iron is denser than water, yet a steel ship floats because its hollow hull has an average density below water.'),
    symbols: [
        { sym: 'F_b', name: t('浮力', 'buoyant force'), unit: 'N' },
        { sym: '\\rho_{fluid}', name: t('流体密度', 'fluid density'), unit: 'kg/m³' },
        { sym: 'V_{displaced}', name: t('排开流体体积', 'volume of displaced fluid'), unit: 'm³' },
    ],
    conditions: {
        applies: [t('浸在流体中的物体', 'A body immersed in a fluid')],
        assumes: [t('流体静止、连通', 'Static, connected fluid')],
        breaks: [t('物体与容器底密合无水时无浮力', 'No buoyancy when the base is sealed to the container floor')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('浮力来自上下表面压力差', 'Buoyancy comes from the pressure difference'), latex: String.raw `F_b=(p_{\text{下}}-p_{\text{上}})A=\rho g h A` },
        { n: 2, op: 'algebra', title: t('hA 即排开体积', 'hA is the displaced volume'), latex: String.raw `F_b=\rho g V_{\text{displaced}}` },
    ],
    links: { upstream: [{ id: 'phys-hydrostatic-pressure' }] },
};
export default physArchimedesBuoyancy;
//# sourceMappingURL=phys-archimedes-buoyancy.js.map