import { t } from '../../core/types.js';
/** shooting-method-ray-tracing */
const shootingMethodRayTracing = {
    id: 'shooting-method-ray-tracing',
    name: t('打靶法射线追踪', 'Shooting Method for Ray Tracing'),
    aliases: { zh: ['初值打靶', '两点射线追踪'], en: ['shooting method', 'initial-value ray tracing'] },
    node: 'S2.5',
    tags: {
        math: ['MATH.ROOT', 'MATH.DIFF'],
        method: ['METH.INV', 'METH.TELE'],
        quantity: ['Q.TIME', 'Q.GEOM'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\text{求 } i_{0}\ \text{使得}\ X(i_{0}) - X_{\text{target}} = 0`,
        variants: [
            { name: t('常梯度介质中的解析偏移距', 'Analytic offset in a constant-gradient medium'), latex: String.raw `X(i_{0}) = \frac{2v_{0}}{k}\cot i_{0}` },
            { name: t('牛顿迭代', 'Newton iteration'), latex: String.raw `i_{0}^{(n+1)} = i_{0}^{(n)} - \frac{X(i_{0}^{(n)}) - X_{t}}{dX/di_{0}}` },
        ],
    },
    meaning: t('打靶法把「两点射线追踪」变成一个一维求根问题：从震源以某个出射角 i₀ 发射射线，看它落地的位置离目标台站差多少，然后调整角度重试。思路极简，但在影区里会彻底失败 —— 那里根本没有射线到达，残差函数没有零点。', 'The shooting method turns two-point ray tracing into a one-dimensional root-finding problem: launch a ray from the source at take-off angle i₀, see how far from the target station it lands, then adjust the angle and retry. The idea is minimal, but it fails completely inside shadow zones, where no ray arrives and the residual function has no zero.'),
    symbols: [
        { sym: 'i_{0}', name: t('出射角（自竖直量起）', 'take-off angle from vertical'), unit: '°' },
        { sym: 'X_{t}', name: t('目标偏移距', 'target offset'), unit: 'km' },
        { sym: 'X(i_{0})', name: t('射线落地位置', 'landing position of the ray'), unit: 'km' },
        { sym: 'k', name: t('速度梯度', 'velocity gradient'), unit: 's⁻¹' },
        { sym: 'v_{0}', name: t('震源处速度', 'velocity at the source'), unit: 'km/s' },
    ],
    conditions: {
        applies: [t('已知震源与接收点位置，求连接两者的射线', 'Finding the ray connecting a known source and receiver')],
        assumes: [
            t('X(i₀) 在搜索区间内单调或至少有一个零点', 'X(i₀) is monotonic or at least has one zero in the search interval'),
            t('速度模型光滑、无强影区', 'The velocity model is smooth and free of strong shadow zones'),
        ],
        breaks: [
            t('低速层或强间断面造成影区时无解', 'No solution when low-velocity zones or strong discontinuities create shadow zones'),
            t('多解（三重值）时打靶法只找到一个分支', 'With multiple solutions (triplication) shooting finds only one branch'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把问题写成残差函数', 'Write the problem as a residual function'),
            latex: String.raw `F(i_{0}) = X(i_{0}) - X_{t}` },
        { n: 2, op: 'geometry', title: t('常梯度时 X 有闭式', 'For a constant gradient X has a closed form'),
            latex: String.raw `X(i_{0}) = \frac{2\cos i_{0}}{pk} = \frac{2\cos i_{0}\,v_{0}}{k\sin i_{0}} = \frac{2v_{0}}{k}\cot i_{0}` },
        { n: 3, op: 'algebra', title: t('直接反解', 'Invert directly'),
            latex: String.raw `\cot i_{0} = \frac{k X_{t}}{2v_{0}}\ \Longrightarrow\ i_{0} = \mathrm{arccot}\!\left(\frac{kX_{t}}{2v_{0}}\right)` },
        { n: 4, op: 'identity', title: t('一般模型用牛顿迭代', 'For a general model use Newton iteration'),
            latex: String.raw `i_{0}^{(n+1)} = i_{0}^{(n)} - \frac{F(i_{0}^{(n)})}{F'(i_{0}^{(n)})}` },
        { n: 5, op: 'result', title: t('收敛判据', 'Convergence criterion'),
            latex: String.raw `|F(i_{0})| < \varepsilon \quad (\varepsilon \sim 10^{-4}\ \text{km})` },
    ],
    viz: [
        {
            id: 'shooting-residual',
            level: 'V1',
            title: t('打靶残差随出射角的变化', 'Shooting residual versus take-off angle'),
            xlabel: t('出射角 i₀ (°)', 'take-off angle i₀ (°)'),
            ylabel: t('X(i₀) − X_t (km)', 'X(i₀) − X_t (km)'),
            controls: [
                { id: 'v0', label: t('震源速度 v₀ (km/s)', 'source velocity v₀ (km/s)'), min: 3, max: 8, step: 0.05, value: 5.5 },
                { id: 'k', label: t('梯度 k × 10³', 'gradient k × 10³'), min: 0.2, max: 4, step: 0.05, value: 1.5 },
                { id: 'xt', label: t('目标偏移距 (km)', 'target offset (km)'), min: 20, max: 500, step: 5, value: 200 },
            ],
            note: t('曲线与零线的交点就是解。函数严格单调，所以打靶法在这个模型里万无一失。', 'The intersection with the zero line is the solution. The function is strictly monotonic, so shooting never fails for this model.'),
            compute: (p) => {
                const v0 = p['v0'], k = p['k'] * 1e-3, xt = p['xt'];
                const res = [];
                const zero = [];
                for (let i = 0; i <= 300; i++) {
                    const deg = 2 + (i / 300) * 88;
                    const i0 = (deg * Math.PI) / 180;
                    const X = ((2 * v0) / k) * (Math.cos(i0) / Math.sin(i0));
                    res.push([deg, X - xt]);
                    zero.push([deg, 0]);
                }
                return [
                    { label: t('残差 F(i₀)', 'residual F(i₀)'), color: '#185FA5', points: res },
                    { label: t('零线', 'zero line'), color: '#888780', points: zero, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('200 km 偏移距的打靶', 'Shooting for a 200 km offset'),
        input: t('v₀ = 5.5 km/s，k = 0.0015 s⁻¹，X_t = 200 km', 'v₀ = 5.5 km/s, k = 0.0015 s⁻¹, X_t = 200 km'),
        steps: [
            t('cot i₀ = 0.0015 × 200 / (2 × 5.5) = 0.02727', 'cot i₀ = 0.0015 × 200 / (2 × 5.5) = 0.02727'),
            t('i₀ = arccot(0.02727) = 88.44°', 'i₀ = arccot(0.02727) = 88.44°'),
        ],
        output: t('射线以接近水平的出射角下行，在最深处折返后正好落在 200 km 处', 'The ray leaves almost horizontally, turns at depth and lands exactly at 200 km'),
    },
    links: {
        upstream: [{ id: 'kinematic-ray-equations', note: t('积分射线方程得到 X(i₀)', 'Integrating the ray equations gives X(i₀)') }],
        seealso: [{ id: 'bending-method-ray-tracing', note: t('另一种两点追踪策略', 'The alternative two-point strategy') }],
    },
    refs: [{ text: 'Julian & Gubbins (1977). Three-dimensional seismic ray tracing. J. Geophys., 43, 95–113' }],
};
export default shootingMethodRayTracing;
//# sourceMappingURL=shooting-method-ray-tracing.js.map