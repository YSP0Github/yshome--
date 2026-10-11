import { t } from '../../core/types.js';
/** triplication-caustic */
const triplicationCaustic = {
    id: 'triplication-caustic',
    name: t('走时三重值与焦散', 'Travel-time Triplication & Caustics'),
    aliases: { zh: ['三分支', '焦散面', '走时曲线折返'], en: ['triplication', 'caustic', 'travel-time cusp'] },
    node: 'S2.5',
    tags: {
        math: ['MATH.GEOM', 'MATH.ROOT'],
        method: ['METH.TELE', 'METH.STRUCT'],
        quantity: ['Q.TIME', 'Q.AMP'],
    },
    audience: 'phd',
    complete: 'L4',
    statement: {
        main: String.raw `\frac{dX}{dp} = 0 \ \Longrightarrow\ \text{焦散};\qquad A \propto \left|\frac{dp}{dX}\right|^{1/2}`,
        variants: [
            { name: t('常梯度层中的走时与偏移距', 'Travel time and offset in a constant-gradient layer'), latex: String.raw `X(p) = \frac{2\cos i_{0}}{pk},\qquad T(p) = -\frac{2}{k}\ln\tan\frac{i_{0}}{2},\qquad \sin i_{0} = p\,v_{0}` },
            { name: t('穿过界面继续下行时', 'When the ray continues below an interface'), latex: String.raw `X = 2\left[\frac{\cos i_{0}-\cos i_{H}}{pk_{1}} + \frac{\cos i_{2b}}{pk_{2}}\right],\quad T = 2\left[\frac{1}{k_{1}}\ln\frac{\tan(i_{H}/2)}{\tan(i_{0}/2)} - \frac{1}{k_{2}}\ln\tan\frac{i_{2b}}{2}\right]` },
        ],
    },
    meaning: t('当地球内部出现速度跳跃或强梯度时，同一个震中距上会有三条（甚至更多）射线到达：这就是走时曲线的「三重值」。折返点是焦散，那里 dp/dX → ∞，射线理论预测无限大振幅，实际观测是一个振幅很大但有限的尖峰。上地幔 410 km 与 660 km 间断面就是靠三重值被发现的。', 'Where the Earth contains a velocity jump or a strong gradient, three (or more) rays arrive at the same epicentral distance: the travel-time curve becomes triplicated. The cusp is a caustic, where dp/dX → ∞ and ray theory predicts infinite amplitude; in practice one observes a large but finite spike. The 410 km and 660 km mantle discontinuities were discovered through exactly this triplication.'),
    symbols: [
        { sym: 'X', name: t('偏移距 / 震中距', 'offset / epicentral distance'), unit: 'km' },
        { sym: 'p', name: t('射线参数', 'ray parameter'), unit: 's/km' },
        { sym: 'i_{0}', name: t('出射角（自竖直量起）', 'take-off angle from vertical'), unit: '°' },
        { sym: 'k_{1}, k_{2}', name: t('界面上下的速度梯度', 'velocity gradients above and below the interface'), unit: 's⁻¹' },
        { sym: 'H', name: t('界面深度', 'interface depth'), unit: 'km' },
        { sym: '\\Delta v', name: t('界面上的速度跳跃', 'velocity jump at the interface'), unit: 'km/s' },
    ],
    conditions: {
        applies: [t('含速度间断面或强梯度层的走时曲线分析', 'Travel-time analysis of models with velocity discontinuities or strong gradients')],
        assumes: [
            t('分段常梯度（线性速度）模型', 'Piecewise constant-gradient (linear velocity) model'),
            t('射线理论适用', 'Ray theory applies'),
        ],
        breaks: [
            t('焦散处（dX/dp = 0）射线理论发散', 'Ray theory diverges at the caustic (dX/dp = 0)'),
            t('梯度为零的均匀层需要单独取极限', 'Uniform layers with zero gradient require a separate limit'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('写出 dx 与 dt 的微分', 'Write the differentials dx and dt'),
            latex: String.raw `dx = dz\tan i,\qquad dt = \frac{dz}{v\cos i}` },
        { n: 2, op: 'substitute', title: t('用 Snell 定律把 i 换成 v', 'Use Snell to replace i by v'),
            latex: String.raw `\sin i = pv \Longrightarrow \cos i = \sqrt{1-p^{2}v^{2}},\quad dz = \frac{dv}{k}` },
        { n: 3, op: 'transform', title: t('换成对角变量 i 积分', 'Change variable to the angle i'),
            latex: String.raw `\sin i = p(v_0 + kz) \Longrightarrow dz = \frac{\cos i}{pk}\,di,\quad ds = \frac{di}{pk},\quad dt = \frac{di}{k\sin i}` },
        { n: 4, op: 'algebra', title: t('积分出单层的结果', 'Integrate for a single layer'),
            latex: String.raw `X = 2\!\int_{i_0}^{\pi/2}\!\frac{\sin i}{pk}di = \frac{2\cos i_0}{pk},\qquad T = 2\!\int_{i_0}^{\pi/2}\!\frac{di}{k\sin i} = -\frac{2}{k}\ln\tan\frac{i_0}{2}` },
        { n: 5, op: 'result', title: t('焦散条件', 'The caustic condition'),
            latex: String.raw `\frac{dX}{dp}=0,\qquad A\propto\sqrt{\left|\frac{dp}{dX}\right|}\ \xrightarrow[\ dX/dp\to 0\ ]{}\ \infty` },
    ],
    viz: [
        {
            id: 'triplication-tx',
            level: 'V3',
            title: t('含间断面的走时曲线三重值', 'Travel-time triplication from a velocity discontinuity'),
            xlabel: t('偏移距 X (km)', 'offset X (km)'),
            ylabel: t('走时 T (s)', 'travel time T (s)'),
            controls: [
                { id: 'v0', label: t('地表速度 v₀ (km/s)', 'surface velocity v₀ (km/s)'), min: 4, max: 8, step: 0.05, value: 5.8 },
                { id: 'k1', label: t('上层梯度 k₁ × 10³', 'upper gradient k₁ × 10³'), min: 0.5, max: 4, step: 0.05, value: 1.6 },
                { id: 'H', label: t('界面深度 H (km)', 'interface depth H (km)'), min: 10, max: 120, step: 1, value: 35 },
                { id: 'dv', label: t('速度跳跃 Δv (km/s)', 'velocity jump Δv (km/s)'), min: 0, max: 2.5, step: 0.05, value: 0.9 },
                { id: 'k2', label: t('下层梯度 k₂ × 10³', 'lower gradient k₂ × 10³'), min: 0.2, max: 3, step: 0.05, value: 0.9 },
            ],
            note: t('把 Δv 调到 1 km/s 以上，走时曲线就会自己折回去，出现 A、B、C 三个分支。', 'Push Δv above 1 km/s and the travel-time curve folds back on itself, producing the A, B, C branches.'),
            compute: (p) => {
                const v0 = p['v0'], k1 = p['k1'] * 1e-3, H = p['H'], dv = p['dv'], k2 = p['k2'] * 1e-3;
                const vH = v0 + k1 * H;
                const v2 = vH + dv;
                const pts = [];
                for (let j = 0; j <= 600; j++) {
                    const i0 = (5 + (j / 600) * 84) * (Math.PI / 180);
                    const pp = Math.sin(i0) / v0;
                    let X, T;
                    const ci0 = Math.cos(i0);
                    if (pp * vH >= 1) {
                        X = (2 * ci0) / (pp * k1);
                        T = (-2 / k1) * Math.log(Math.tan(i0 / 2));
                    }
                    else {
                        const siH = pp * vH;
                        const iH = Math.asin(siH);
                        const ciH = Math.cos(iH);
                        const X1 = (ci0 - ciH) / (pp * k1);
                        const T1 = (1 / k1) * Math.log(Math.tan(iH / 2) / Math.tan(i0 / 2));
                        const si2 = Math.min(pp * v2, 0.999999);
                        const i2b = Math.asin(si2);
                        const X2 = Math.cos(i2b) / (pp * k2);
                        const T2 = (-1 / k2) * Math.log(Math.tan(i2b / 2));
                        X = 2 * (X1 + X2);
                        T = 2 * (T1 + T2);
                    }
                    if (Number.isFinite(X) && Number.isFinite(T))
                        pts.push([X, T]);
                }
                pts.sort((a, b) => a[0] - b[0]);
                return [{ label: t('T(X)', 'T(X)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('莫霍面造成的 Pn 三重值', 'Triplication from the Moho'),
        input: t('v₀ = 5.8，k₁ = 0.0016，H = 35 km，Δv = 0.9 km/s，k₂ = 0.0009', 'v₀ = 5.8, k₁ = 0.0016, H = 35 km, Δv = 0.9 km/s, k₂ = 0.0009'),
        steps: [
            t('临界 p 对应 v_H = 5.8 + 0.056 = 5.856 km/s → p = 0.1708 s/km', 'The critical p corresponds to v_H = 5.8 + 0.056 = 5.856 km/s → p = 0.1708 s/km'),
            t('p 略小于此值时射线穿入上地幔，走时出现第二个分支', 'Slightly smaller p lets the ray penetrate the upper mantle, producing a second branch'),
        ],
        output: t('在 100–200 km 偏移距上出现三重值，这正是 Pn/P 交叉的经典形态', 'A triplication appears at 100–200 km offset, the classic Pn/P crossover geometry'),
    },
    links: {
        upstream: [
            { id: 'turning-point-depth', note: t('转折点决定分支归属', 'Turning points determine branch membership') },
            { id: 'kinematic-ray-equations', note: t('射线路径的数值基础', 'Numerical basis of the ray path') },
        ],
        downstream: [{ id: 'mantle-discontinuities', note: t('三重值是发现间断面的直接证据', 'Triplication is the direct evidence for discontinuities') }],
        seealso: [{ id: 'core-shadow-zone', note: t('核幔边界造成的影区与焦散', 'Shadow zone and caustics from the core–mantle boundary') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §12.2' }],
};
export default triplicationCaustic;
//# sourceMappingURL=triplication-caustic.js.map