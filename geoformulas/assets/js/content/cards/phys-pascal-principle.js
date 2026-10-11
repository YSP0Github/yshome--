import { t } from '../../core/types.js';
/** phys-pascal-principle */
const physPascalPrinciple = {
    id: 'phys-pascal-principle',
    name: t('Pascal 原理', "Pascal's Principle"),
    aliases: { zh: ['帕斯卡原理', '液压机'], en: ["Pascal's principle", 'hydraulic lift'] },
    node: 'S18.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.GEOM', 'Q.ENERGY'],
        keywords: t('帕斯卡原理 液压机 压强传递 小力举重物', 'Pascal principle hydraulic lift pressure transmitted force multiplication'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `\frac{F_1}{A_1}=\frac{F_2}{A_2}\;\Rightarrow\; F_2=F_1\frac{A_2}{A_1}`,
    },
    meaning: t('密闭液体上外加的压强会大小不变地传到液体各处和器壁。液压机正是利用它：在小面积活塞上用小力 F₁ 产生压强，这个压强在大面积活塞上顶起大重物 F₂。面积比 A₂/A₁ 就是力的放大倍数——汽车刹车、千斤顶都靠它。', 'Pressure applied to an enclosed fluid is transmitted undiminished to every point and the walls. A hydraulic lift exploits this: a small force F₁ on a small piston creates a pressure that lifts a heavy load F₂ on a large piston. The area ratio A₂/A₁ is the force multiplier — car brakes and hydraulic jacks work this way.'),
    symbols: [
        { sym: 'F_1,F_2', name: t('两活塞上的力', 'forces on the two pistons'), unit: 'N' },
        { sym: 'A_1,A_2', name: t('两活塞面积', 'areas of the two pistons'), unit: 'm²' },
    ],
    conditions: {
        applies: [t('密闭、不可压缩流体', 'Enclosed, incompressible fluid')],
        assumes: [t('连通器、忽略活塞自重与摩擦', 'Communicating vessels, piston weight and friction neglected')],
        breaks: [t('液体可压缩或有泄漏时放大比偏离', 'Ratio deviates if the fluid compresses or leaks')],
    },
    links: { upstream: [{ id: 'phys-hydrostatic-pressure' }] },
};
export default physPascalPrinciple;
//# sourceMappingURL=phys-pascal-principle.js.map