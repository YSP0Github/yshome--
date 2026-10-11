import { t } from '../../core/types.js';
/** phys-simple-pendulum */
const physSimplePendulum = {
    id: 'phys-simple-pendulum',
    name: t('单摆', 'Simple Pendulum'),
    aliases: { zh: ['单摆周期 T=2π√(L/g)'], en: ['simple pendulum', 'T = 2π√(L/g)'] },
    node: 'S18.5',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.PHYS'],
        quantity: ['Q.FREQ', 'Q.TIME'],
        keywords: t('单摆 周期 摆长 小角度近似 重力加速度', 'simple pendulum period length small-angle g'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `T=2\pi\sqrt{\frac{L}{g}}`,
        variants: [
            { name: t('小角度运动方程', 'small-angle equation'), latex: String.raw `\ddot{\theta}+\dfrac{g}{L}\theta=0` },
        ],
    },
    meaning: t('单摆的周期只由摆长 L 和重力加速度 g 决定，与摆球质量、小振幅都无关。这正是伽利略在教堂里用脉搏测灯摆发现的等时性。因为 T² 与 L 成正比，精确测单摆周期就能反过来测当地的 g——历史上它是测重力的重要工具。', 'The period of a simple pendulum depends only on length L and g, not on the bob mass or small amplitude. This is the isochronism Galileo timed with his pulse in a cathedral. Because T² is proportional to L, measuring the period precisely lets you infer the local g — historically a key tool for gravity measurements.'),
    symbols: [
        { sym: 'T', name: t('周期', 'period'), unit: 's' },
        { sym: 'L', name: t('摆长', 'pendulum length'), unit: 'm' },
        { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²' },
        { sym: '\\theta', name: t('摆角', 'swing angle'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('小角度摆动（<~10°）、无质量摆线', 'Small angles (<~10°), massless string')],
        assumes: [t('摆球视为质点', 'Bob treated as a point mass')],
        breaks: [t('大角度时周期变长，须用椭圆积分', 'Large angles lengthen the period; elliptic integral needed')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('切向回复力', 'Tangential restoring force'), latex: String.raw `F_t=-mg\sin\theta` },
        { n: 2, op: 'taylor', title: t('小角度 sinθ≈θ', 'Small angle sinθ ≈ θ'), latex: String.raw `-mg\theta=mL\ddot{\theta}` },
        { n: 3, op: 'algebra', title: t('整理得 ω²=g/L', 'Rearrange: ω² = g/L'), latex: String.raw `\ddot{\theta}+\dfrac{g}{L}\theta=0\;\Rightarrow\;\omega=\sqrt{\dfrac{g}{L}}` },
        { n: 4, op: 'identity', title: t('T=2π/ω', 'T = 2π/ω'), latex: String.raw `T=2\pi\sqrt{\dfrac{L}{g}}` },
    ],
    links: {
        upstream: [{ id: 'phys-simple-harmonic-motion' }],
        seealso: [{ id: 'phys-mass-spring-oscillator' }, { id: 'gravity-newton-law' }],
    },
};
export default physSimplePendulum;
//# sourceMappingURL=phys-simple-pendulum.js.map