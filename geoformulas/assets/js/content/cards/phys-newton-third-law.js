import { t } from '../../core/types.js';
/** phys-newton-third-law */
const physNewtonThirdLaw = {
    id: 'phys-newton-third-law',
    name: t('Newton 第三定律（作用与反作用）', "Newton's Third Law (Action–Reaction)"),
    aliases: { zh: ['作用力反作用力'], en: ['action–reaction', 'Newton III'] },
    node: 'S18.2',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('作用力 反作用力 大小相等方向相反 系统内力', 'action reaction equal opposite internal forces'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{F}_{AB}=-\mathbf{F}_{BA}`,
    },
    meaning: t('物体 A 对 B 施加的力，与 B 对 A 施加的力大小相等、方向相反、沿同一直线。注意：这一对力作用在两个不同物体上，不能互相抵消；它们同时产生、同时消失，且属于同一种性质的力。', 'The force A exerts on B equals and opposes the force B exerts on A, along the same line. Crucially the two act on different bodies, so they never cancel; they arise and vanish together and are always of the same type.'),
    symbols: [
        { sym: '\\mathbf{F}_{AB}', name: t('A 对 B 的作用力', 'force on B by A'), unit: 'N' },
        { sym: '\\mathbf{F}_{BA}', name: t('B 对 A 的反作用力', 'reaction on A by B'), unit: 'N' },
    ],
    conditions: {
        applies: [t('任何两个相互作用的物体', 'Any pair of interacting bodies')],
        assumes: [t('瞬时超距作用成立（经典力学）', 'Instantaneous action at a distance (classical)')],
        breaks: [t('电磁场中动量需计入场动量，作用反作用成对出现', 'In EM fields momentum includes the field; pairs still hold globally')],
    },
    links: { seealso: [{ id: 'phys-newton-second-law' }] },
};
export default physNewtonThirdLaw;
//# sourceMappingURL=phys-newton-third-law.js.map