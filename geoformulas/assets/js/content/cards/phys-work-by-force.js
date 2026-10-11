import { t } from '../../core/types.js';
/** phys-work-by-force */
const physWorkByForce = {
    id: 'phys-work-by-force',
    name: t('恒力的功', 'Work Done by a Constant Force'),
    aliases: { zh: ['功 W=Fdcosθ'], en: ['work', 'W = F d cos θ'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('功 力 位移 夹角 焦耳 标量', 'work force displacement angle joule scalar'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `W=F\,d\cos\theta=\mathbf{F}\cdot\mathbf{d}`,
        variants: [
            { name: t('变力的功（积分）', 'work by a variable force'), latex: String.raw `W=\int_{s_1}^{s_2}\mathbf{F}\cdot\mathrm{d}\mathbf{s}` },
            { name: t('合力的功', 'work by the net force'), latex: String.raw `W_{\text{net}}=\sum_i W_i` },
        ],
    },
    meaning: t('功是力在位移方向上的分量乘以位移，是个标量。力与位移垂直时不做功（θ=90°，cosθ=0）；夹角大于 90° 时做负功，即物体对外输出能量。功的单位是焦耳，1 J = 1 N·m。', 'Work is the component of force along the displacement times the displacement, a scalar. A force perpendicular to displacement does no work (θ = 90°, cosθ = 0); above 90° it does negative work, i.e. the body gives energy away. Unit: joule, 1 J = 1 N·m.'),
    symbols: [
        { sym: 'W', name: t('功', 'work'), unit: 'J' },
        { sym: 'F', name: t('力的大小', 'force magnitude'), unit: 'N' },
        { sym: 'd', name: t('位移大小', 'displacement magnitude'), unit: 'm' },
        { sym: '\\theta', name: t('力与位移夹角', 'angle between force and displacement'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('恒力作用下的直线位移', 'Straight-line displacement under a constant force')],
        assumes: [t('力在位移过程中大小方向不变', 'Force constant along the path')],
        breaks: [t('力随位置变化时须用积分', 'Use the integral form when the force varies')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把力分解到位移方向', 'Resolve force along the displacement'), latex: String.raw `F_{\parallel}=F\cos\theta` },
        { n: 2, op: 'physics', title: t('只有平行分量推动物体前进', 'Only the parallel component advances the body'), latex: String.raw `W=F_{\parallel}\,d=F d\cos\theta` },
    ],
    links: {
        downstream: [{ id: 'phys-work-energy-theorem', note: t('合外力的功改变动能', 'Net work changes kinetic energy') }],
    },
};
export default physWorkByForce;
//# sourceMappingURL=phys-work-by-force.js.map