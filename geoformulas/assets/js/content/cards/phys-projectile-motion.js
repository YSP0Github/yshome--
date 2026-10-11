import { t } from '../../core/types.js';
/** phys-projectile-motion */
const physProjectileMotion = {
    id: 'phys-projectile-motion',
    name: t('抛体运动', 'Projectile Motion'),
    aliases: { zh: ['斜抛', '平抛', '射程', '最大高度'], en: ['projectile', 'trajectory', 'range', 'maximum height'] },
    node: 'S18.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.GEOM'],
        keywords: t('抛体 斜抛 射程 最大高度 轨迹 初速度角', 'projectile range maximum height trajectory launch angle'),
    },
    audience: 'highschool',
    complete: 'L4',
    statement: {
        main: String.raw `x=v_0\cos\theta\,t,\qquad y=v_0\sin\theta\,t-\tfrac{1}{2}g\,t^{2}`,
        variants: [
            { name: t('轨迹方程（抛物线）', 'trajectory (parabola)'), latex: String.raw `y=x\tan\theta-\dfrac{g\,x^{2}}{2\,v_0^{2}\cos^{2}\theta}` },
            { name: t('射程（落回同一高度）', 'range at launch level'), latex: String.raw `R=\dfrac{v_0^{2}\sin 2\theta}{g}` },
            { name: t('最大高度', 'maximum height'), latex: String.raw `H=\dfrac{v_0^{2}\sin^{2}\theta}{2g}` },
        ],
    },
    meaning: t('把斜抛运动按水平、竖直两个方向拆开：水平方向不受力、做匀速直线运动；竖直方向只受重力、做加速度为 g 的匀减速运动。两个方向互相独立，合起来轨迹是一条抛物线。射程在 θ=45° 时最大，这是因为 sin2θ 在 45° 取到 1。', 'Split an oblique throw into horizontal and vertical parts: horizontally there is no force, so uniform motion; vertically gravity gives constant deceleration g. The two directions are independent, and together they trace a parabola. The range is maximal at θ = 45°, where sin 2θ reaches 1.'),
    symbols: [
        { sym: 'v_0', name: t('初速度大小', 'initial speed'), unit: 'm/s' },
        { sym: '\\theta', name: t('抛射角', 'launch angle'), unit: 'rad' },
        { sym: 'R', name: t('射程', 'horizontal range'), unit: 'm' },
        { sym: 'H', name: t('最大射高', 'maximum height'), unit: 'm' },
        { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²' },
    ],
    conditions: {
        applies: [t('近地面、忽略空气阻力、落回同一水平面', 'Near ground, no air drag, landing at launch level')],
        assumes: [t('重力恒定向下、地面水平', 'Gravity constant and vertical, flat ground')],
        breaks: [t('高速弹丸、有风或地形起伏时需修正', 'Corrections needed for fast projectiles, wind, or uneven terrain')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('分解初速度', 'Decompose the initial velocity'), latex: String.raw `v_{0x}=v_0\cos\theta,\quad v_{0y}=v_0\sin\theta` },
        { n: 2, op: 'identity', title: t('水平匀速、竖直匀加速', 'Horizontal uniform, vertical uniformly accelerated'), latex: String.raw `x=v_0\cos\theta\,t,\quad y=v_0\sin\theta\,t-\tfrac{1}{2}g t^{2}` },
        { n: 3, op: 'algebra', title: t('消去 t 得轨迹', 'Eliminate t for the trajectory'), latex: String.raw `y=x\tan\theta-\dfrac{g x^{2}}{2 v_0^{2}\cos^{2}\theta}` },
        { n: 4, op: 'algebra', title: t('令 y=0 解射程（非平凡根）', 'Set y=0 for the range (nontrivial root)'), latex: String.raw `R=\dfrac{v_0^{2}\sin 2\theta}{g}` },
        { n: 5, op: 'identity', title: t('最高点竖直速度为零', 'At apex the vertical velocity vanishes'), latex: String.raw `0=v_0\sin\theta-g t_{H}\;\Rightarrow\; H=\dfrac{v_0^{2}\sin^{2}\theta}{2g}` },
    ],
    viz: [
        {
            id: 'projectile-trajectory',
            level: 'V1',
            title: t('不同抛射角的抛物线轨迹', 'Parabolic trajectories for different launch angles'),
            xlabel: t('水平距离 x (m)', 'horizontal distance x (m)'),
            ylabel: t('高度 y (m)', 'height y (m)'),
            controls: [
                { id: 'v0', label: t('初速度 v₀', 'initial speed v₀'), min: 5, max: 60, step: 1, value: 30, unit: 'm/s' },
                { id: 'ang', label: t('抛射角 θ', 'launch angle θ'), min: 5, max: 85, step: 1, value: 45, unit: '°' },
            ],
            xRange: [0, 120],
            yRange: [0, 60],
            note: t('θ=45° 时射程最远；40° 与 50° 射程相同（互补角 sin2θ 相等）。', 'Range is greatest at 45°; 40° and 50° give the same range (complementary angles share sin2θ).'),
            compute: (p) => {
                const v0 = p['v0'];
                const th = (p['ang'] * Math.PI) / 180;
                const g = 9.8;
                const range = (v0 * v0 * Math.sin(2 * th)) / g;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const x = (i / 200) * range;
                    const y = x * Math.tan(th) - (g * x * x) / (2 * v0 * v0 * Math.cos(th) * Math.cos(th));
                    pts.push([x, Math.max(y, 0)]);
                }
                return [{ label: t('轨迹', 'trajectory'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('运动员掷铅球', 'Shot put'),
        input: t('v₀ = 14 m/s，θ = 45°，g = 9.8 m/s²', 'v₀ = 14 m/s, θ = 45°, g = 9.8 m/s²'),
        steps: [
            t('R = v₀² sin90° / g = 196 / 9.8 = 20 m', 'R = v₀² sin90° / g = 196 / 9.8 = 20 m'),
            t('H = v₀² sin²45° / (2g) = 196×0.5 / 19.6 = 5 m', 'H = v₀² sin²45° / (2g) = 196×0.5 / 19.6 = 5 m'),
        ],
        output: t('理想射程约 20 m，最高点约 5 m', 'Ideal range ≈ 20 m, apex ≈ 5 m'),
    },
    links: {
        upstream: [{ id: 'phys-constant-acceleration' }],
        seealso: [{ id: 'phys-free-fall' }],
    },
};
export default physProjectileMotion;
//# sourceMappingURL=phys-projectile-motion.js.map