import { t } from '../../core/types.js';
/** bending-method-ray-tracing */
const bendingMethodRayTracing = {
    id: 'bending-method-ray-tracing',
    name: t('弯曲法与 Fermat 最小走时', 'Bending Method & Fermat’s Least Time'),
    aliases: { zh: ['费马原理', '弯曲法', '最小走时路径'], en: ['bending method', 'Fermat principle', 'least-time path'] },
    node: 'S2.5',
    tags: {
        math: ['MATH.GEOM', 'MATH.APPROX'],
        method: ['METH.INV', 'METH.TELE'],
        quantity: ['Q.TIME', 'Q.GEOM'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\delta\!\int_{A}^{B}\frac{ds}{v} = 0`,
        variants: [
            { name: t('两层介质中折返点位置的最优化', 'Optimising the bending point in a two-layer medium'), latex: String.raw `T(x) = \frac{\sqrt{x^{2}+H^{2}}}{v_{1}} + \frac{\sqrt{(X-x)^{2}+H^{2}}}{v_{2}}` },
            { name: t('取极值即得到 Snell 定律', 'Extremising recovers Snell’s law'), latex: String.raw `\frac{x}{v_{1}\sqrt{x^{2}+H^{2}}} = \frac{X-x}{v_{2}\sqrt{(X-x)^{2}+H^{2}}}\ \Longleftrightarrow\ \frac{\sin i_{1}}{v_{1}} = \frac{\sin i_{2}}{v_{2}}` },
        ],
    },
    meaning: t('Fermat 原理说：射线走的是让走时取驻值的那条路径。弯曲法直接把它变成优化问题 —— 不断微调路径形状，直到走时不再下降。与打靶法相比，它天然能处理影区（因为它始终连接着震源和接收点），代价是容易陷入局部极小。', 'Fermat’s principle states that a ray follows the path making the travel time stationary. The bending method turns this directly into an optimisation: perturb the path shape until the travel time stops decreasing. Unlike shooting, it copes naturally with shadow zones (it always keeps source and receiver connected), at the cost of getting trapped in local minima.'),
    symbols: [
        { sym: 'T', name: t('沿路径的走时', 'travel time along the path'), unit: 's' },
        { sym: 'x', name: t('折返点（弯折点）的水平位置', 'horizontal position of the bending point'), unit: 'km' },
        { sym: 'H', name: t('界面深度', 'interface depth'), unit: 'km' },
        { sym: 'X', name: t('震源到接收点的总偏移距', 'total offset from source to receiver'), unit: 'km' },
        { sym: 'v_{1}, v_{2}', name: t('上下两层速度', 'velocities of the two layers'), unit: 'km/s' },
        { sym: 'i_{1}, i_{2}', name: t('入射角与折射角（自竖直量起）', 'incidence and refraction angles from vertical'), unit: '°' },
    ],
    conditions: {
        applies: [t('两点射线追踪，尤其是打靶法失效的影区情形', 'Two-point ray tracing, especially where shooting fails in shadow zones')],
        assumes: [
            t('走时取极小值（不是极大或鞍点）', 'The travel time is a minimum (not a maximum or saddle)'),
            t('路径可参数化为有限个节点', 'The path can be parameterised by finitely many nodes'),
        ],
        breaks: [
            t('存在多个局部极小时需全局搜索', 'Multiple local minima require a global search'),
            t('焦散附近的路径走时为鞍点，弯曲法不收敛', 'Near caustics the path is a saddle and bending does not converge'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('写出 Fermat 泛函', 'Write the Fermat functional'),
            latex: String.raw `T = \int_{A}^{B}\frac{ds}{v},\qquad \delta T = 0` },
        { n: 2, op: 'geometry', title: t('两层模型里路径由一点决定', 'In a two-layer model the path is fixed by one point'),
            latex: String.raw `T(x) = \frac{\sqrt{x^{2}+H^{2}}}{v_{1}} + \frac{\sqrt{(X-x)^{2}+H^{2}}}{v_{2}}` },
        { n: 3, op: 'algebra', title: t('对 x 求导并令其为零', 'Differentiate with respect to x and set to zero'),
            latex: String.raw `\frac{dT}{dx} = \frac{x}{v_{1}\sqrt{x^{2}+H^{2}}} - \frac{X-x}{v_{2}\sqrt{(X-x)^{2}+H^{2}}} = 0` },
        { n: 4, op: 'identity', title: t('认出正弦比', 'Recognise the sine ratio'),
            latex: String.raw `\frac{x}{\sqrt{x^{2}+H^{2}}} = \sin i_{1},\qquad \frac{X-x}{\sqrt{(X-x)^{2}+H^{2}}} = \sin i_{2}` },
        { n: 5, op: 'result', title: t('Fermat 推出 Snell', 'Fermat yields Snell'),
            latex: String.raw `\frac{\sin i_{1}}{v_{1}} = \frac{\sin i_{2}}{v_{2}} = p` },
    ],
    viz: [
        {
            id: 'bending-minimum',
            level: 'V1',
            title: t('走时随折返点位置的变化', 'Travel time versus bending-point position'),
            xlabel: t('折返点位置 x (km)', 'bending point x (km)'),
            ylabel: t('走时 T (s)', 'travel time T (s)'),
            controls: [
                { id: 'v1', label: t('上层速度 v₁ (km/s)', 'upper velocity v₁ (km/s)'), min: 2, max: 7, step: 0.05, value: 4.0 },
                { id: 'v2', label: t('下层速度 v₂ (km/s)', 'lower velocity v₂ (km/s)'), min: 4, max: 9, step: 0.05, value: 7.0 },
                { id: 'H', label: t('界面深度 H (km)', 'interface depth H (km)'), min: 5, max: 60, step: 1, value: 20 },
                { id: 'X', label: t('总偏移距 X (km)', 'total offset X (km)'), min: 20, max: 400, step: 5, value: 150 },
            ],
            note: t('曲线最低点就是 Snell 定律给出的折返位置；把它挪开一点点，走时就变大 —— 这就是 Fermat 原理的全部内容。', 'The minimum is exactly the bending position given by Snell’s law; move away and the time increases — that is all Fermat’s principle says.'),
            compute: (p) => {
                const v1 = p['v1'], v2 = p['v2'], H = p['H'], X = p['X'];
                const pts = [];
                let best = Infinity;
                let bx = 0;
                for (let i = 0; i <= 400; i++) {
                    const x = (i / 400) * X;
                    const T = Math.sqrt(x * x + H * H) / v1 + Math.sqrt((X - x) ** 2 + H * H) / v2;
                    pts.push([x, T]);
                    if (T < best) {
                        best = T;
                        bx = x;
                    }
                }
                const mark = [[bx, best]];
                return [
                    { label: t('T(x)', 'T(x)'), color: '#185FA5', points: pts },
                    { label: t('最小值（Snell 解）', 'minimum (Snell solution)'), color: '#993C1D', points: mark },
                ];
            },
        },
    ],
    example: {
        title: t('两层模型的折返点', 'Bending point in a two-layer model'),
        input: t('v₁ = 4.0，v₂ = 7.0 km/s，H = 20 km，X = 150 km', 'v₁ = 4.0, v₂ = 7.0 km/s, H = 20 km, X = 150 km'),
        steps: [
            t('数值求极小得 x ≈ 13.7 km', 'Numerical minimisation gives x ≈ 13.7 km'),
            t('sin i₁ = 13.7/√(13.7²+20²) = 0.565，sin i₂ = 136.3/√(136.3²+20²) = 0.989', 'sin i₁ = 13.7/√(13.7²+20²) = 0.565, sin i₂ = 136.3/√(136.3²+20²) = 0.989'),
            t('0.565/4.0 = 0.141 = 0.989/7.0 ✓', '0.565/4.0 = 0.141 = 0.989/7.0 ✓'),
        ],
        output: t('Snell 定律成立，走时最小', 'Snell’s law holds and the travel time is minimal'),
    },
    links: {
        upstream: [{ id: 'snell-ray-parameter', note: t('Fermat 原理推出它', 'Fermat’s principle derives it') }],
        seealso: [
            { id: 'shooting-method-ray-tracing', note: t('另一种两点追踪策略', 'The alternative two-point strategy') },
            { id: 'eikonal-equation', note: t('走时场的偏微分方程形式', 'The PDE form of the travel-time field') },
        ],
    },
    refs: [{ text: 'Julian & Gubbins (1977). Three-dimensional seismic ray tracing. J. Geophys., 43, 95–113' }],
};
export default bendingMethodRayTracing;
//# sourceMappingURL=bending-method-ray-tracing.js.map