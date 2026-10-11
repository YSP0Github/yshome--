import { t } from '../../core/types.js';
/** phys-apparent-weight-elevator */
const physApparentWeightElevator = {
    id: 'phys-apparent-weight-elevator',
    name: t('电梯中的视重（超重与失重）', 'Apparent Weight in an Elevator'),
    aliases: { zh: ['超重', '失重', '电梯称重'], en: ['apparent weight', 'overweight', 'weightless in lift'] },
    node: 'S18.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.GRAV', 'Q.ENERGY'],
        keywords: t('超重 失重 电梯 视重 支持力 加速度向上', 'apparent weight elevator over weightless normal reaction'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `N=m(g+a)`,
        variants: [
            { name: t('加速上升 / 减速下降（超重）', 'accelerating up / decelerating down'), latex: String.raw `a>0\ \Rightarrow\ N>mg\ (\text{超重})` },
            { name: t('加速下降（失重）', 'accelerating down'), latex: String.raw `a<0\ \Rightarrow\ N<mg;\quad a=-g\ \Rightarrow\ N=0\ (\text{完全失重})` },
        ],
    },
    meaning: t('秤显示的「重量」其实是它对你的支持力 N，而不是真实重力 mg。电梯加速上升时，地板要额外推你一把才能让你跟着加速，于是 N>mg，你觉得变重；电梯缆绳断了自由下落，a=-g，N=0，就是完全失重。轨道上的失重和它是同一回事。', 'A scale reads the normal reaction N it exerts on you, not your true weight mg. When the lift accelerates upward, the floor must push harder to accelerate you along, so N > mg and you feel heavier. If the cable snaps and you free-fall with a = −g, N = 0 — that is weightlessness, the same physics as in orbit.'),
    symbols: [
        { sym: 'N', name: t('支持力（秤的读数）', 'normal reaction (scale reading)'), unit: 'N' },
        { sym: 'm', name: t('人的质量', 'person’s mass'), unit: 'kg' },
        { sym: 'a', name: t('电梯加速度（向上为正）', 'elevator acceleration (upward positive)'), unit: 'm/s²' },
        { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²' },
    ],
    conditions: {
        applies: [t('在竖直加速的参考系中称重', 'Weighing in a vertically accelerating frame')],
        assumes: [t('人相对电梯静止', 'Person at rest relative to the lift')],
        breaks: [t('水平加速时有水平惯性分量，需另算', 'Horizontal acceleration adds a separate inertial component')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('取向上为正，列人所受力', 'Take upward positive; forces on the person'), latex: String.raw `N-mg` },
        { n: 2, op: 'physics', title: t('随电梯以 a 加速，列 Newton 第二定律', 'Accelerate with the lift at a: Newton II'), latex: String.raw `N-mg=ma` },
        { n: 3, op: 'algebra', title: t('解出视重 N', 'Solve for the apparent weight'), latex: String.raw `N=m(g+a)` },
    ],
    links: {
        upstream: [{ id: 'phys-weight-vs-mass' }, { id: 'phys-newton-second-law' }],
        seealso: [{ id: 'phys-satellite-orbit' }],
    },
};
export default physApparentWeightElevator;
//# sourceMappingURL=phys-apparent-weight-elevator.js.map