import { t } from '../../core/types.js';
/** phys-linear-momentum */
const physLinearMomentum = {
    id: 'phys-linear-momentum',
    name: t('动量', 'Linear Momentum'),
    aliases: { zh: ['动量 p=mv'], en: ['linear momentum', 'p = mv'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('动量 p=mv 矢量 动量守恒 碰撞', 'linear momentum p=mv vector collision conservation'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{p}=m\,\mathbf{v}`,
    },
    meaning: t('动量是质量与速度的乘积，是矢量，方向与速度一致。它描述「运动的量」有多大：同样速率下，大卡车比小汽车更难停下，正是因为动量更大。动量是比动能更基本的守恒量——在碰撞这类问题中，能量可能变成热，但动量守恒永远成立。', 'Momentum is mass times velocity, a vector pointing along the velocity. It measures “how much motion” is present: at the same speed a truck is harder to stop than a car precisely because it carries more momentum. Momentum is the more fundamental conserved quantity — in collisions energy may turn into heat, but momentum is always conserved.'),
    symbols: [
        { sym: '\\mathbf{p}', name: t('动量矢量', 'momentum vector'), unit: 'kg·m/s' },
        { sym: 'm', name: t('质量', 'mass'), unit: 'kg' },
        { sym: '\\mathbf{v}', name: t('速度矢量', 'velocity vector'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('宏观低速物体', 'Macroscopic bodies at low speed')],
        assumes: [t('非相对论', 'Non-relativistic')],
        breaks: [t('近光速时用相对论动量 γmv', 'Relativistic momentum γmv near light speed')],
    },
    links: {
        downstream: [{ id: 'phys-conservation-momentum' }, { id: 'phys-impulse-momentum' }],
        seealso: [{ id: 'phys-kinetic-energy' }],
    },
};
export default physLinearMomentum;
//# sourceMappingURL=phys-linear-momentum.js.map