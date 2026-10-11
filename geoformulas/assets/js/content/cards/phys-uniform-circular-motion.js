import { t } from '../../core/types.js';
/** phys-uniform-circular-motion */
const physUniformCircularMotion = {
    id: 'phys-uniform-circular-motion',
    name: t('匀速圆周运动的运动学', 'Kinematics of Uniform Circular Motion'),
    aliases: { zh: ['向心加速度', '圆周运动线速度角速度'], en: ['centripetal acceleration', 'circular motion'] },
    node: 'S18.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.GEOM'],
        keywords: t('圆周运动 向心加速度 角速度 线速度 周期', 'circular motion centripetal acceleration angular velocity period'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `v=\omega\,r,\qquad a_c=\frac{v^{2}}{r}=\omega^{2}r`,
        variants: [
            { name: t('周期与频率', 'period and frequency'), latex: String.raw `T=\frac{2\pi r}{v}=\frac{2\pi}{\omega}=2\pi f` },
            { name: t('切向与法向加速度', 'tangential and normal acceleration'), latex: String.raw `a_t=\frac{\mathrm{d}v}{\mathrm{d}t}=r\alpha,\qquad a_n=\frac{v^{2}}{r}` },
        ],
    },
    meaning: t('匀速圆周运动的速率不变，但速度方向时刻在变，所以仍有加速度。这个加速度始终指向圆心（向心），大小为 v²/r；它只负责拐弯，不负责改变快慢。线速度 v 与角速度 ω 通过半径 r 联系：v=ωr。若速率也在变，则还有沿切线方向的切向加速度 a_t=rα。', 'In uniform circular motion the speed is constant but the velocity direction keeps turning, so there is still acceleration. It always points toward the centre (centripetal) with magnitude v²/r: it only steers, it never changes the speed. Linear and angular speed link through the radius: v = ωr. If the speed also changes, a tangential component a_t = rα appears.'),
    symbols: [
        { sym: 'v', name: t('线速率', 'linear speed'), unit: 'm/s' },
        { sym: '\\omega', name: t('角速度', 'angular velocity'), unit: 'rad/s' },
        { sym: 'r', name: t('圆周半径', 'radius of the circle'), unit: 'm' },
        { sym: 'a_c', name: t('向心（法向）加速度', 'centripetal (normal) acceleration'), unit: 'm/s²' },
        { sym: '\\alpha', name: t('角加速度', 'angular acceleration'), unit: 'rad/s²' },
    ],
    conditions: {
        applies: [t('沿圆周轨道运动的质点', 'A particle moving on a circular path')],
        assumes: [t('半径 r 已知且恒定', 'Radius known and fixed')],
        breaks: [t('非圆周曲线运动时曲率半径逐点变化', 'For general curves the radius of curvature varies point to point')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('一周走过弧长 2πr', 'One revolution covers arc length 2πr'), latex: String.raw `v=\dfrac{2\pi r}{T},\qquad \omega=\dfrac{2\pi}{T}` },
        { n: 2, op: 'algebra', title: t('两式相除得 v=ωr', 'Divide the two to get v=ωr'), latex: String.raw `v=\omega r` },
        { n: 3, op: 'physics', title: t('速度矢量方向转角 Δθ 时其增量', 'Velocity vector rotates by Δθ; its increment'), latex: String.raw `|\Delta\mathbf{v}|\approx v\,\Delta\theta` },
        { n: 4, op: 'identity', title: t('除以 Δt 并令其趋于零', 'Divide by Δt and take the limit'), latex: String.raw `a_c=\lim_{\Delta t\to 0}\dfrac{v\Delta\theta}{\Delta t}=v\omega=\dfrac{v^{2}}{r}=\omega^{2}r` },
    ],
    links: {
        downstream: [{ id: 'phys-centripetal-force', note: t('乘以质量即向心力', 'Multiply by mass to get centripetal force') }],
        seealso: [{ id: 'angular-frequency' }],
    },
};
export default physUniformCircularMotion;
//# sourceMappingURL=phys-uniform-circular-motion.js.map