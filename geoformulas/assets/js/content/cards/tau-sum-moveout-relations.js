import { t } from '../../core/types.js';
/** tau-sum-moveout-relations */
const tauSumMoveoutRelations = {
    id: 'tau-sum-moveout-relations',
    name: t('τ 求和与走时的微分关系', 'The τ Sum and Travel-time Differential Relations'),
    aliases: { zh: ['τ-p 微分关系', '截距时间', 'dT/dX'], en: ['tau sum', 'intercept time', 'dT/dX'] },
    node: 'S2.6',
    tags: {
        math: ['MATH.APPROX', 'MATH.GEOM'],
        method: ['METH.TELE', 'METH.STRUCT'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\tau(p) = T(p) - p\,X(p),\qquad \frac{dT}{dX} = p,\qquad \frac{d\tau}{dp} = -X`,
        variants: [
            { name: t('X 与 T 的积分表达', 'Integral expressions for X and T'), latex: String.raw `X(p) = 2\!\int_0^{z_t}\!\frac{pv}{\sqrt{1-p^{2}v^{2}}}\,dz,\qquad T(p) = 2\!\int_0^{z_t}\!\frac{dz}{v\sqrt{1-p^{2}v^{2}}}` },
            { name: t('常梯度介质中的闭式解', 'Closed form for a constant gradient'), latex: String.raw `X = \frac{2\cos i_0}{pk},\qquad T = -\frac{2}{k}\ln\tan\frac{i_0}{2},\qquad \tau = T - pX` },
            { name: t('反演用的核心关系', 'The key relation used for inversion'), latex: String.raw `z_t(p):\ v(z_t) = \frac{1}{p}` },
        ],
    },
    meaning: t('τ 是「把走时里的水平传播部分扣掉之后剩下的那部分时间」，也叫截距时间。它的导数直接给出震中距，而 T 的导数直接给出射线参数。这一对共轭关系是 τ–p 方法的核心：在 τ 域里，每一条同相轴都变成一个点，速度分析、多次波压制、反演全都因此变得干净。', 'τ is the travel time with the horizontal propagation part removed — the intercept time. Its derivative gives the range directly, while the derivative of T gives the ray parameter. This conjugate pair is the heart of τ–p methods: in the τ domain each event collapses to a point, which makes velocity analysis, multiple suppression and inversion far cleaner.'),
    symbols: [
        { sym: '\\tau', name: t('截距时间 τ = T − pX', 'intercept time τ = T − pX'), unit: 's' },
        { sym: 'T', name: t('走时', 'travel time'), unit: 's' },
        { sym: 'X', name: t('震中距 / 偏移距', 'epicentral distance / offset'), unit: 'km' },
        { sym: 'p', name: t('射线参数 dT/dX', 'ray parameter dT/dX'), unit: 's/km' },
        { sym: 'i_{0}', name: t('出射角（自竖直量起）', 'take-off angle from vertical'), unit: '°' },
        { sym: 'k', name: t('速度梯度', 'velocity gradient'), unit: 's⁻¹' },
    ],
    conditions: {
        applies: [t('水平分层介质中走时曲线与速度结构的互换', 'Interchange between travel-time curves and velocity structure in horizontally layered media')],
        assumes: [
            t('速度随深度单调增加', 'Velocity increases monotonically with depth'),
            t('无低速层', 'No low-velocity zone'),
        ],
        breaks: [
            t('低速层使 τ(p) 出现多值', 'Low-velocity zones make τ(p) multivalued'),
            t('焦散处 dX/dp = 0，dτ/dp 有限但 dT/dX 的映射退化', 'At caustics dX/dp = 0 and the dT/dX mapping degenerates'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把走时写成沿射线的积分', 'Write the travel time as an integral along the ray'),
            latex: String.raw `T = 2\!\int_0^{z_t}\frac{dz}{v\cos i},\qquad X = 2\!\int_0^{z_t}\tan i\,dz` },
        { n: 2, op: 'substitute', title: t('用 Snell 定律消去角度', 'Eliminate the angle with Snell’s law'),
            latex: String.raw `\sin i = pv,\quad \cos i = \sqrt{1-p^2v^2},\quad \tan i = \frac{pv}{\sqrt{1-p^2v^2}}` },
        { n: 3, op: 'algebra', title: t('对 p 求导，边界项相消', 'Differentiate with respect to p; boundary terms cancel'),
            latex: String.raw `\frac{dT}{dp} = p\frac{dX}{dp}` },
        { n: 4, op: 'algebra', title: t('得到共轭关系', 'Obtain the conjugate relations'),
            latex: String.raw `\frac{dT}{dX} = \frac{dT/dp}{dX/dp} = p,\qquad \frac{d\tau}{dp} = \frac{dT}{dp} - p\frac{dX}{dp} - X = -X` },
        { n: 5, op: 'result', title: t('常梯度下写成闭式', 'Closed form for a constant gradient'),
            latex: String.raw `\tau(p) = -\frac{2}{k}\ln\tan\frac{i_0}{2} - \frac{2\cos i_0}{k} = -\frac{2}{k}\left[\ln\tan\frac{i_0}{2} + \cos i_0\right]` },
    ],
    viz: [
        {
            id: 'tau-p-curves',
            level: 'V2',
            title: t('常梯度介质中的 T(p)、X(p)、τ(p)', 'T(p), X(p) and τ(p) in a constant-gradient medium'),
            xlabel: t('射线参数 p (s/km)', 'ray parameter p (s/km)'),
            ylabel: t('数值', 'value'),
            controls: [
                { id: 'v0', label: t('地表速度 v₀ (km/s)', 'surface velocity v₀ (km/s)'), min: 3, max: 8, step: 0.05, value: 5.5 },
                { id: 'k', label: t('梯度 k × 10³', 'gradient k × 10³'), min: 0.5, max: 4, step: 0.05, value: 1.5 },
            ],
            note: t('三条曲线共享同一个横坐标；τ 随 p 增大而下降，其斜率就是 −X。', 'All three curves share the same abscissa; τ decreases with p and its slope is −X.'),
            compute: (p) => {
                const v0 = p['v0'], k = p['k'] * 1e-3;
                const tt = [];
                const xx = [];
                const ta = [];
                const pTop = 1 / v0;
                for (let i = 0; i <= 300; i++) {
                    const pp = 0.06 + (i / 300) * (pTop - 0.06);
                    const si0 = Math.min(pp * v0, 0.999999);
                    const i0 = Math.asin(si0);
                    const X = (2 * Math.cos(i0)) / (pp * k);
                    const T = (-2 / k) * Math.log(Math.tan(i0 / 2));
                    tt.push([pp, T]);
                    xx.push([pp, X]);
                    ta.push([pp, T - pp * X]);
                }
                return [
                    { label: t('T (s)', 'T (s)'), color: '#185FA5', points: tt },
                    { label: t('X/200 (km)', 'X/200 (km)'), color: '#0F6E56', points: xx.map(([a, b]) => [a, b / 200]) },
                    { label: t('τ (s)', 'τ (s)'), color: '#993C1D', points: ta, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('p = 0.12 s/km 时的 τ', 'τ at p = 0.12 s/km'),
        input: t('v₀ = 5.5 km/s，k = 0.0015 s⁻¹，p = 0.12 s/km', 'v₀ = 5.5 km/s, k = 0.0015 s⁻¹, p = 0.12 s/km'),
        steps: [
            t('sin i₀ = 0.12 × 5.5 = 0.66 → i₀ = 41.3°', 'sin i₀ = 0.12 × 5.5 = 0.66 → i₀ = 41.3°'),
            t('X = 2cos(41.3°)/(0.12×0.0015) = 1.50/0.00018 = 8333 km（超出常梯度模型适用范围，仅作演示）', 'X = 2cos(41.3°)/(0.12×0.0015) = 1.50/0.00018 = 8333 km (beyond the model range, for illustration only)'),
        ],
        output: t('实际地球中该 p 值对应的射线会在数百公里内折返，τ 为其截距时间', 'In the real Earth a ray with this p bottoms within a few hundred km; τ is its intercept time'),
    },
    links: {
        upstream: [{ id: 'taup-transform', note: t('τ–p 变换的定义', 'Definition of the τ–p transform') }],
        downstream: [{ id: 'wiechert-herglotz-inversion', note: t('由 τ(p) 反演速度结构', 'Invert the velocity structure from τ(p)') }],
        seealso: [{ id: 'turning-point-depth', note: t('v = 1/p 给出转折点', 'v = 1/p gives the turning point') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §12.1' }],
};
export default tauSumMoveoutRelations;
//# sourceMappingURL=tau-sum-moveout-relations.js.map