import { t } from '../../core/types.js';
/** turning-point-depth */
const turningPointDepth = {
    id: 'turning-point-depth',
    name: t('射线转折点深度', 'Turning-point Depth of a Ray'),
    aliases: { zh: ['转折点', '最深穿透深度', '底部速度'], en: ['turning depth', 'bottoming depth', 'maximum penetration'] },
    node: 'S2.4',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.ROOT'],
        method: ['METH.TELE', 'METH.STRUCT'],
        quantity: ['Q.VEL', 'Q.GEOM'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\sin i(z_{t}) = 1 \quad\Longleftrightarrow\quad v(z_{t}) = \frac{1}{p}`,
        variants: [
            { name: t('球坐标形式', 'Spherical form'), latex: String.raw `\frac{r_{t}}{v(r_{t})} = p \equiv \eta(r)` },
            { name: t('常梯度介质中的显式解', 'Explicit solution for a constant gradient'), latex: String.raw `v(z) = v_{0} + kz \Longrightarrow z_{t} = \frac{1/p - v_{0}}{k}` },
        ],
    },
    meaning: t('一条下行射线在 sin i = 1 处「打平」，然后折返向上 —— 这个深度就是转折点。它同时告诉我们两件事：射线的射线参数 p 直接读出底部速度 v = 1/p，因而走时曲线的斜率 dT/dX = p 就是一张「深度探针」读数表。', 'A downgoing ray flattens out where sin i = 1 and then turns back up — that is the turning point. It tells us two things at once: the ray parameter p directly reads off the velocity at the bottom, v = 1/p, so the slope of the travel-time curve, dT/dX = p, is a depth-probe reading.'),
    symbols: [
        { sym: 'z_{t}', name: t('转折点深度', 'turning-point depth'), unit: 'km' },
        { sym: 'i', name: t('射线与竖直方向夹角', 'angle of the ray from vertical'), unit: '°' },
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/km' },
        { sym: 'v_{t}', name: t('转折点处的速度', 'velocity at the turning point'), unit: 'km/s' },
        { sym: 'k', name: t('速度梯度 dv/dz', 'velocity gradient dv/dz'), unit: 's⁻¹' },
        { sym: '\\eta(r)', name: t('球坐标慢度比 r/v', 'spherical slowness ratio r/v'), unit: 's' },
    ],
    conditions: {
        applies: [t('速度随深度单调增加的介质', 'Media in which velocity increases monotonically with depth')],
        assumes: [
            t('射线理论适用', 'Ray theory applies'),
            t('无低速层（否则出现影区而非转折点）', 'No low-velocity zone (otherwise shadow zones rather than turning points)'),
        ],
        breaks: [
            t('存在低速层时射线会被「困住」或绕开，无转折点', 'With a low-velocity zone rays are trapped or bypassed and there is no turning point'),
            t('间断面处发生反射/透射，需另行列边界条件', 'At discontinuities reflection/transmission occurs and boundary conditions must be written separately'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('Snell 定律给出守恒量', "Snell's law supplies the conserved quantity"),
            latex: String.raw `p = \frac{\sin i}{v(z)} = \text{const}` },
        { n: 2, op: 'geometry', title: t('转折点处射线水平', 'At the turning point the ray is horizontal'),
            latex: String.raw `i = 90^{\circ}\ \Longrightarrow\ \sin i = 1` },
        { n: 3, op: 'substitute', title: t('代入得到底部速度', 'Substitute to get the bottoming velocity'),
            latex: String.raw `v(z_{t}) = \frac{1}{p}` },
        { n: 4, op: 'algebra', title: t('常梯度时直接解出深度', 'For a constant gradient, solve for depth directly'),
            latex: String.raw `v_{0} + k z_{t} = \frac{1}{p}\ \Longrightarrow\ z_{t} = \frac{1/p - v_{0}}{k}` },
        { n: 5, op: 'result', title: t('球坐标的等价写法', 'Equivalent spherical statement'),
            latex: String.raw `\eta(r_{t}) \equiv \frac{r_{t}}{v(r_{t})} = p` },
    ],
    viz: [
        {
            id: 'turning-depth-vs-p',
            level: 'V1',
            title: t('转折点深度随射线参数的变化', 'Turning depth versus ray parameter'),
            xlabel: t('射线参数 p (s/km)', 'ray parameter p (s/km)'),
            ylabel: t('转折点深度 z_t (km)', 'turning depth z_t (km)'),
            controls: [
                { id: 'v0', label: t('地表速度 v₀ (km/s)', 'surface velocity v₀ (km/s)'), min: 3, max: 8, step: 0.05, value: 5.5 },
                { id: 'k', label: t('梯度 k (s⁻¹)', 'gradient k (s⁻¹)'), min: 0.0005, max: 0.006, step: 0.0001, value: 0.0018 },
            ],
            note: t('p 越小（越平缓出射）射线扎得越深。p = 1/v₀ 时转折点就在地表。', 'Smaller p (flatter take-off) means the ray bottoms deeper. At p = 1/v₀ the turning point is at the surface.'),
            compute: (p) => {
                const v0 = p['v0'], k = p['k'];
                const zmax = 800;
                const pTop = 1 / v0;
                const pBot = 1 / (v0 + k * zmax);
                const pts = [];
                for (let i = 0; i <= 240; i++) {
                    const pp = pTop - (i / 240) * (pTop - pBot);
                    const z = (1 / pp - v0) / k;
                    pts.push([pp, Math.max(0, Math.min(zmax, z))]);
                }
                return [{ label: t('z_t(p)', 'z_t(p)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('上地幔 P 波的转折点', 'Turning point of an upper-mantle P wave'),
        input: t('v₀ = 6.0 km/s，k = 0.0018 s⁻¹，Δ = 20°（p ≈ 0.11 s/km）', 'v₀ = 6.0 km/s, k = 0.0018 s⁻¹, Δ = 20° (p ≈ 0.11 s/km)'),
        steps: [
            t('v(z_t) = 1/0.11 = 9.09 km/s', 'v(z_t) = 1/0.11 = 9.09 km/s'),
            t('z_t = (9.09 − 6.0)/0.0018 = 1717 km', 'z_t = (9.09 − 6.0)/0.0018 = 1717 km'),
        ],
        output: t('该射线最深处约 1700 km，已穿过上地幔进入下地幔顶部', 'This ray bottoms near 1700 km, already through the upper mantle into the top of the lower mantle'),
    },
    links: {
        upstream: [{ id: 'snell-ray-parameter', note: t('射线参数的定义', 'Definition of the ray parameter') }],
        downstream: [{ id: 'wiechert-herglotz-inversion', note: t('由 p—深度关系反演速度结构', 'Invert velocity structure from the p–depth relation') }],
        seealso: [{ id: 'triplication-caustic', note: t('间断面附近的转折点行为', 'Turning behaviour near discontinuities') }],
    },
    refs: [{ text: 'Shearer, Introduction to Seismology, 2nd ed., §6.2' }],
};
export default turningPointDepth;
//# sourceMappingURL=turning-point-depth.js.map