import { t } from '../../core/types.js';
/** phys-free-fall */
const physFreeFall = {
    id: 'phys-free-fall',
    name: t('自由落体', 'Free Fall'),
    aliases: { zh: ['自由落体运动', '重力加速度'], en: ['free fall', 'gravitational acceleration'] },
    node: 'S18.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('自由落体 重力加速度 g 竖直上抛 下落高度', 'free fall g vertical throw drop height'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `v=v_0-g\,t,\qquad y=y_0+v_0 t-\tfrac{1}{2}g\,t^{2},\qquad v^{2}=v_0^{2}-2g(y-y_0)`,
        variants: [
            { name: t('从静止下落 h 时的落地速度', 'speed after falling from rest through h'), latex: String.raw `v=\sqrt{2gh}` },
            { name: t('下落 h 所需时间', 'time to fall through h'), latex: String.raw `t=\sqrt{2h/g}` },
        ],
    },
    meaning: t('自由落体就是加速度固定为重力加速度 g ≈ 9.8 m/s² 的匀加速运动，方向竖直向下。它告诉我们：在忽略空气阻力时，轻重物体下落得一样快——这正是 Galileo 比萨斜塔思想实验的结论。竖直上抛时把 g 前面取负号即可。', 'Free fall is uniformly accelerated motion with acceleration fixed at g ≈ 9.8 m/s² directed downward. It says that, neglecting air resistance, light and heavy bodies fall equally fast — Galileo’s leaning-tower conclusion. For a vertical upward throw, simply put a minus sign in front of g.'),
    symbols: [
        { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²', typical: '≈ 9.8' },
        { sym: 'y', name: t('竖直坐标（向上为正）', 'vertical coordinate (upward positive)'), unit: 'm' },
        { sym: 'v_0', name: t('初速度', 'initial velocity'), unit: 'm/s' },
        { sym: 'h', name: t('下落高度', 'drop height'), unit: 'm' },
    ],
    conditions: {
        applies: [t('近地面、忽略空气阻力', 'Near the ground, air resistance neglected')],
        assumes: [t('g 在运动范围内视为常数', 'g treated constant over the motion range')],
        breaks: [t('高速或长距离时空气阻力不可忽略', 'Air resistance matters at high speed or over long distances')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('重力产生恒定向下加速度 g', 'Gravity gives a constant downward acceleration g'), latex: String.raw `a=-g\ (\text{向上为正})` },
        { n: 2, op: 'substitute', title: t('代入匀加速公式', 'Substitute into the constant-acceleration set'), latex: String.raw `v=v_0-g t,\quad y=y_0+v_0 t-\tfrac{1}{2}g t^{2}` },
        { n: 3, op: 'result', title: t('从静止下落：令 v₀=0 并消去 t', 'Dropped from rest: set v₀=0 and eliminate t'), latex: String.raw `v^{2}=2gh\;\Rightarrow\; v=\sqrt{2gh}` },
    ],
    links: {
        upstream: [{ id: 'phys-constant-acceleration', note: t('a=g 的特例', 'Special case with a = g') }],
        seealso: [{ id: 'gravity-newton-law' }],
    },
};
export default physFreeFall;
//# sourceMappingURL=phys-free-fall.js.map