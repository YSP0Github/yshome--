import { t } from '../../core/types.js';
/** phys-constant-acceleration */
const physConstantAcceleration = {
    id: 'phys-constant-acceleration',
    name: t('匀加速直线运动方程', 'Kinematics of Uniformly Accelerated Motion'),
    aliases: { zh: ['匀加速公式', '运动学三大公式'], en: ['constant acceleration equations', 'SUVAT equations'] },
    node: 'S18.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('匀加速 初速度 位移 速度平方 自由落体', 'constant acceleration initial velocity displacement velocity squared'),
    },
    audience: 'highschool',
    complete: 'L3',
    statement: {
        main: String.raw `v=v_0+a\,t,\qquad x=x_0+v_0 t+\tfrac{1}{2}a\,t^{2},\qquad v^{2}=v_0^{2}+2a(x-x_0)`,
        variants: [
            { name: t('位移用平均速度表示', 'Displacement via average velocity'), latex: String.raw `x-x_0=\bar{v}\,t=\tfrac{1}{2}(v_0+v)\,t` },
        ],
    },
    meaning: t('当加速度 a 是常数时，对 v=∫a dt 和 x=∫v dt 直接积分，就得到这一组只用代数即可互相推导的公式。它们是整个质点运动学最常用的一套：已知五个量中任意三个，剩下两个都能解出。第三式消去了时间，特别适合求「速度—位移」关系。', 'When acceleration a is constant, integrating v = ∫a dt and x = ∫v dt directly yields this interconvertible set. Given any three of the five quantities, the remaining two follow algebraically. The third relation eliminates time and is especially useful for speed-versus-distance questions.'),
    symbols: [
        { sym: 'v_0', name: t('初速度', 'initial velocity'), unit: 'm/s' },
        { sym: 'v', name: t('末速度', 'final velocity'), unit: 'm/s' },
        { sym: 'a', name: t('恒定加速度', 'constant acceleration'), unit: 'm/s²' },
        { sym: 't', name: t('时间', 'time'), unit: 's' },
        { sym: 'x_0,x', name: t('初、末位置', 'initial and final position'), unit: 'm' },
    ],
    conditions: {
        applies: [t('一维直线运动且加速度恒定', 'Straight-line motion with constant acceleration')],
        assumes: [t('参考系惯性、忽略空气阻力', 'Inertial frame, air resistance neglected')],
        breaks: [t('加速度随时间变化时须重新积分', 'Fails when acceleration varies in time; re-integrate')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设 a 为常数', 'Let a be constant'), latex: String.raw `a=\dfrac{\mathrm{d}v}{\mathrm{d}t}=\text{const}` },
        { n: 2, op: 'physics', title: t('对时间积分得速度', 'Integrate in time to get velocity'), latex: String.raw `v=v_0+\int_0^t a\,\mathrm{d}\tau=v_0+a t` },
        { n: 3, op: 'physics', title: t('再积分得位移', 'Integrate again for position'), latex: String.raw `x=x_0+\int_0^t v\,\mathrm{d}\tau=x_0+v_0 t+\tfrac{1}{2}a t^{2}` },
        { n: 4, op: 'algebra', title: t('从前两式消去 t', 'Eliminate t between the two equations'), latex: String.raw `t=\dfrac{v-v_0}{a}\;\Rightarrow\; v^{2}=v_0^{2}+2a(x-x_0)` },
    ],
    viz: [
        {
            id: 'const-acc-motion',
            level: 'V1',
            title: t('v(t) 直线与 x(t) 抛物线', 'v(t) as a straight line and x(t) as a parabola'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('速度 v (m/s)', 'velocity v (m/s)'),
            controls: [
                { id: 'v0', label: t('初速度 v₀', 'initial velocity v₀'), min: 0, max: 30, step: 1, value: 5, unit: 'm/s' },
                { id: 'acc', label: t('加速度 a', 'acceleration a'), min: -5, max: 10, step: 0.5, value: 2, unit: 'm/s²' },
            ],
            xRange: [0, 10],
            note: t('v(t) 是斜率为 a 的直线；a 为负时它会先减到零再反向。', 'v(t) is a straight line of slope a; with negative a it first drops to zero and then reverses.'),
            compute: (p) => {
                const v0 = p['v0'];
                const a = p['acc'];
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const tt = (i / 400) * 10;
                    pts.push([tt, v0 + a * tt]);
                }
                return [{ label: t('v(t) = v₀ + at', 'v(t) = v₀ + at'), color: '#185FA5', points: pts }];
            },
        },
    ],
    links: {
        upstream: [{ id: 'phys-kinematic-derivatives', note: t('由微分定义积分而来', 'Integrated from the differential definitions') }],
        downstream: [{ id: 'phys-free-fall', note: t('a=g 的特例', 'Special case a = g') }],
    },
};
export default physConstantAcceleration;
//# sourceMappingURL=phys-constant-acceleration.js.map