import { t } from '../../core/types.js';
/** phys-gravitational-potential-energy */
const physGravitationalPotentialEnergy = {
    id: 'phys-gravitational-potential-energy',
    name: t('重力势能', 'Gravitational Potential Energy'),
    aliases: { zh: ['势能 mgh', '重力位能'], en: ['gravitational potential energy', 'mgh'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('重力势能 mgh 高度 参考面 保守力', 'gravitational potential energy height reference level conservative'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `U_g=mgh`,
        variants: [
            { name: t('地面附近两点势能差', 'potential difference near ground'), latex: String.raw `\Delta U_g=mg\,\Delta h` },
        ],
    },
    meaning: t('重力势能是物体由于所处高度而具有的能量。它只有相对意义：必须先选定一个零势能参考面，h 是相对于该面的高度。真正有物理意义的是势能差 ΔU = mgΔh，与参考面选在哪无关。物体越高，能落下释放的能量越多。', 'Gravitational potential energy is the energy a body has by virtue of its height. It is relative: a zero level must be chosen and h is measured from it. Only the difference ΔU = mgΔh is physical, independent of where the zero is. The higher the body, the more energy it can release on falling.'),
    symbols: [
        { sym: 'U_g', name: t('重力势能', 'gravitational potential energy'), unit: 'J' },
        { sym: 'm', name: t('质量', 'mass'), unit: 'kg' },
        { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²' },
        { sym: 'h', name: t('相对参考面的高度', 'height above the chosen reference level'), unit: 'm' },
    ],
    conditions: {
        applies: [t('近地面、g 视为常数', 'Near the ground with constant g')],
        assumes: [t('已选定零势能面', 'A reference level has been chosen')],
        breaks: [t('高度很大时 g 变化，用 GMm/r', 'Over large distances use GMm/r')],
    },
    links: {
        upstream: [{ id: 'phys-work-by-force' }],
        downstream: [{ id: 'phys-conservation-mechanical-energy' }],
    },
};
export default physGravitationalPotentialEnergy;
//# sourceMappingURL=phys-gravitational-potential-energy.js.map