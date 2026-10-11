import { t } from '../../core/types.js';
/** dix-formula */
const dixFormula = {
    id: 'dix-formula',
    name: t('Dix 公式（由均方根速度反推层速度）', 'The Dix Formula (Interval Velocity from RMS Velocities)'),
    aliases: {
        zh: ['Dix 公式', '层速度反演', '叠加速度转换'],
        en: ['Dix formula', 'interval velocity', 'stacking velocity conversion'],
    },
    node: 'S2.3',
    tags: {
        math: ['MATH.APPROX', 'MATH.STAT'],
        method: ['METH.EXPL', 'METH.INV', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('Dix 公式 层速度 均方根速度 叠加速度 反演 误差放大', 'Dix formula interval velocity rms velocity stacking velocity inversion error amplification'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `v_{n}^{2}=\frac{V_{n}^{2}\,t_{n}-V_{n-1}^{2}\,t_{n-1}}{t_{n}-t_{n-1}}`,
        variants: [
            {
                name: t('增量形式', 'Incremental form'),
                latex: String.raw `v_{n}^{2}=V_{n-1}^{2}+\frac{t_{n}}{t_{n}-t_{n-1}}\left(V_{n}^{2}-V_{n-1}^{2}\right)`,
            },
            {
                name: t('等价的差分写法', 'Equivalent difference form'),
                latex: String.raw `v_{n}^{2}=\frac{\Delta\left(V^{2}t\right)}{\Delta t}`,
            },
            {
                name: t('误差放大系数', 'Error amplification factor'),
                latex: String.raw `\frac{\delta v_{n}}{v_{n}}\simeq\frac{V_{n}}{v_{n}}\cdot\frac{t_{n}}{t_{n}-t_{n-1}}\cdot\frac{\delta V_{n}}{V_{n}}`,
            },
            {
                name: t('双程时间同样适用', 'Two-way times work equally well'),
                latex: String.raw `v_{n}^{2}=\frac{V_{n}^{2}\,T_{n}-V_{n-1}^{2}\,T_{n-1}}{T_{n}-T_{n-1}}\qquad (T=2t)`,
            },
        ],
    },
    meaning: t('速度分析给出的是各层的均方根速度 V_n，而地质解释需要的是层速度 v_n。Dix 公式把「累计量」的差分换算成「本层量」，是地震处理里使用频率最高的反演公式之一。它的代价也很有名：分子是两个大数相减，层间时间差越小，拾取误差被放得越大，深层薄层的层速度因此极不稳定。', 'Velocity analysis yields rms velocities V_n, whereas geological interpretation needs interval velocities v_n. The Dix formula converts the difference of a cumulative quantity into a local one, and is among the most frequently used inversion formulas in seismic processing. Its cost is equally famous: the numerator is a difference of two large numbers, so the smaller the time separation between layers the more the pick error is amplified, making interval velocities of thin deep layers extremely unstable.'),
    symbols: [
        { sym: 'v_{n}', name: t('第 n 层的层速度（待求）', 'interval velocity of layer n (the unknown)'), unit: 'm/s', typical: '1500 – 6000' },
        { sym: 'V_{n}', name: t('到第 n 层底界面的均方根速度（拾取值）', 'rms velocity down to the base of layer n (the picked value)'), unit: 'm/s', typical: '1500 – 5000' },
        { sym: 't_{n}', name: t('到第 n 层底界面的垂直走时（单程或双程，前后一致即可）', 'vertical time to the base of layer n (one- or two-way, used consistently)'), unit: 's', typical: '0.2 – 5' },
        { sym: '\\Delta t=t_{n}-t_{n-1}', name: t('第 n 层的垂直时间厚度', 'vertical time thickness of layer n'), unit: 's', typical: '0.02 – 1' },
        { sym: '\\delta V_{n}', name: t('均方根速度的拾取误差', 'pick error of the rms velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [
            t('由叠加速度或均方根速度剖面反推层速度（建立层速度模型、时深转换）', 'Recovering interval velocities from stacking or rms velocity profiles (building interval-velocity models, time-depth conversion)'),
            t('水平层状、小—中等偏移距的双曲近似成立时', 'Horizontally layered media where the small-to-moderate-offset hyperbolic approximation holds'),
        ],
        assumes: [
            t('各层水平、各向同性，V_n 是真正的均方根速度', 'Horizontal isotropic layers, and V_n is a true rms velocity'),
            t('相邻两个界面的 t 与 V 都拾取自同一条速度谱', 'Both t and V at adjacent interfaces are picked from the same velocity spectrum'),
        ],
        breaks: [
            t('Δt 很小（薄层）时分子相减近乎抵消，结果对噪声极度敏感甚至出现虚数（V 下降过快）', 'For small Δt (thin layers) the numerator nearly cancels; the result is hypersensitive to noise and may even go imaginary if V decreases too fast'),
            t('各向异性或倾斜层时叠加速度不等于 v_rms，Dix 结果有系统偏差', 'With anisotropy or dip the stacking velocity differs from v_rms and the Dix result is systematically biased'),
            t('V_n 随深度非单调时反演出的层速度可能为负或无实数解', 'If V_n is non-monotonic with depth the inverted interval velocity can be negative or have no real solution'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('把均方根速度的定义写成累计量', 'Write the definition of v_rms as a cumulative quantity'),
            latex: String.raw `V_{n}^{2}\,t_{n}=\sum_{i=1}^{n}v_{i}^{2}\,\tau_{i}`,
        },
        {
            n: 2,
            op: 'algebra',
            title: t('对 n 与 n−1 各写一次', 'Write it for n and for n−1'),
            latex: String.raw `V_{n}^{2}t_{n}=\sum_{i=1}^{n-1}v_{i}^{2}\tau_{i}+v_{n}^{2}\tau_{n},\qquad V_{n-1}^{2}t_{n-1}=\sum_{i=1}^{n-1}v_{i}^{2}\tau_{i}`,
        },
        {
            n: 3,
            op: 'substitute',
            title: t('两式相减，累计和整体抵消', 'Subtract: the cumulative sum cancels entirely'),
            latex: String.raw `V_{n}^{2}t_{n}-V_{n-1}^{2}t_{n-1}=v_{n}^{2}\tau_{n}=v_{n}^{2}\left(t_{n}-t_{n-1}\right)`,
            note: t('这一步正是 Dix 公式的全部精华，也是它全部脆弱性的来源。', 'This single step is the whole elegance of the Dix formula — and the whole source of its fragility.'),
        },
        {
            n: 4,
            op: 'result',
            title: t('解出层速度', 'Solve for the interval velocity'),
            latex: String.raw `v_{n}=\sqrt{\frac{V_{n}^{2}t_{n}-V_{n-1}^{2}t_{n-1}}{t_{n}-t_{n-1}}}`,
        },
        {
            n: 5,
            op: 'algebra',
            title: t('改写为增量形式（数值上更直观）', 'Rewrite in incremental form (numerically more transparent)'),
            latex: String.raw `v_{n}^{2}=V_{n-1}^{2}+\frac{t_{n}}{t_{n}-t_{n-1}}\left(V_{n}^{2}-V_{n-1}^{2}\right)`,
            note: t('可见层速度是「上一层的 V²」加上一个被 t_n/Δt 放大的增量。', 'The interval velocity is the previous V² plus an increment amplified by t_n/Δt.'),
        },
        {
            n: 6,
            op: 'taylor',
            title: t('误差传播：为什么薄层不可靠', 'Error propagation: why thin layers are unreliable'),
            latex: String.raw `2v_{n}\,\delta v_{n}\simeq\frac{2V_{n}t_{n}}{t_{n}-t_{n-1}}\,\delta V_{n}\;\Longrightarrow\;\frac{\delta v_{n}}{v_{n}}\simeq\frac{V_{n}}{v_{n}}\frac{t_{n}}{\Delta t}\,\frac{\delta V_{n}}{V_{n}}`,
            note: t('放大倍数 ∝ t_n/Δt：深层薄层（t 大、Δt 小）可以把 2% 的拾取误差放大到 20% 以上。', 'The amplification scales as t_n/Δt: a deep thin layer (large t, small Δt) can turn a 2% pick error into more than 20%.'),
        },
    ],
    viz: [
        {
            id: 'dix-amplification',
            level: 'V1',
            title: t('Dix 反演的误差放大倍数', 'Error amplification of the Dix inversion'),
            xlabel: t('层时间厚度 Δt = t_n − t_{n−1} (s)', 'layer time thickness Δt = t_n − t_{n−1} (s)'),
            ylabel: t('放大倍数 |δv_n/v_n| / |δV_n/V_n|', 'amplification |δv_n/v_n| / |δV_n/V_n|'),
            controls: [
                { id: 'dt1', label: t('上层界面时间 t_{n−1}', 'upper interface time t_{n−1}'), min: 0.3, max: 3.0, step: 0.05, value: 1.0, unit: 's' },
                { id: 'dvn', label: t('真实层速度 v_n', 'true interval velocity v_n'), min: 2000, max: 5000, step: 50, value: 3000, unit: 'm/s' },
                { id: 'dv1', label: t('上层均方根速度 V_{n−1}', 'upper rms velocity V_{n−1}'), min: 1500, max: 4000, step: 50, value: 2200, unit: 'm/s' },
            ],
            xRange: [0.05, 1.0],
            note: t('两条曲线都随 Δt 减小而暴涨：蓝线是下层拾取误差 V_n 的放大，橙线是上层 V_{n−1} 的放大。深层（t_{n−1} 大）薄层可以把百分之几的拾取误差放大到几十个百分点——这就是解释人员不愿对薄层报层速度的原因。', 'Both curves explode as Δt shrinks: blue is the amplification of the deeper pick V_n, orange that of the shallower V_{n−1}. A deep (large t_{n−1}) thin layer can turn a few percent of pick error into several tens of percent — which is why interpreters are reluctant to quote interval velocities for thin beds.'),
            compute: (p) => {
                const t1 = p['dt1'];
                const vint = p['dvn'];
                const V1 = p['dv1'];
                const ampN = [];
                const amp1 = [];
                for (let i = 0; i <= 200; i++) {
                    const dt = 0.05 + (i / 200) * 0.95;
                    const tn = t1 + dt;
                    const Vn = Math.sqrt((V1 * V1 * t1 + vint * vint * dt) / tn);
                    ampN.push([dt, (Vn * tn) / (vint * dt)]);
                    amp1.push([dt, (V1 * t1) / (vint * dt)]);
                }
                return [
                    { label: t('来自 V_n 的误差', 'error from V_n'), color: '#185FA5', points: ampN },
                    { label: t('来自 V_{n−1} 的误差', 'error from V_{n−1}'), color: '#BA7517', points: amp1 },
                ];
            },
        },
        {
            id: 'dix-recover',
            level: 'V1',
            title: t('拾取误差导致的层速度偏移', 'Interval-velocity bias caused by a pick error'),
            xlabel: t('层时间厚度 Δt (s)', 'layer time thickness Δt (s)'),
            ylabel: t('反演得到的 v_n (m/s)', 'inverted v_n (m/s)'),
            controls: [
                { id: 'rt1', label: t('上层界面时间 t_{n−1}', 'upper interface time t_{n−1}'), min: 0.3, max: 3.0, step: 0.05, value: 1.0, unit: 's' },
                { id: 'rvn', label: t('真实层速度 v_n', 'true interval velocity v_n'), min: 2000, max: 5000, step: 50, value: 3000, unit: 'm/s' },
                { id: 'rv1', label: t('上层均方根速度 V_{n−1}', 'upper rms velocity V_{n−1}'), min: 1500, max: 4000, step: 50, value: 2200, unit: 'm/s' },
                { id: 'rerr', label: t('V_n 的拾取误差', 'pick error of V_n'), min: -4, max: 4, step: 0.1, value: 2.0, unit: '%' },
            ],
            xRange: [0.05, 1.0],
            note: t('灰色虚线是真值。只要误差为正，反演出的层速度就整体偏高；误差为负时，薄层处会先掉到无实数解（曲线断开），再变成严重偏低。真实处理中必须对 V 做平滑后再 Dix，否则薄层结果没有意义。', 'The grey dashed line is the true value. A positive error biases the inverted interval velocity high everywhere; a negative error first drives thin layers into the non-real region (the curve breaks) and then far too low. In practice V must be smoothed before Dix, otherwise thin-layer results are meaningless.'),
            compute: (p) => {
                const t1 = p['rt1'];
                const vint = p['rvn'];
                const V1 = p['rv1'];
                const err = p['rerr'];
                const got = [];
                const trueLine = [];
                for (let i = 0; i <= 200; i++) {
                    const dt = 0.05 + (i / 200) * 0.95;
                    const tn = t1 + dt;
                    const Vn = Math.sqrt((V1 * V1 * t1 + vint * vint * dt) / tn) * (1 + err / 100);
                    const num = Vn * Vn * tn - V1 * V1 * t1;
                    const v2 = num / dt;
                    if (v2 > 0)
                        got.push([dt, Math.sqrt(v2)]);
                    trueLine.push([dt, vint]);
                }
                return [
                    { label: t('Dix 反演结果', 'Dix inversion result'), color: '#0F6E56', points: got },
                    { label: t('真值 v_n', 'true v_n'), color: '#B4B2A9', dash: true, points: trueLine },
                ];
            },
        },
    ],
    example: {
        title: t('两层模型的层速度反演', 'Interval velocity for a two-layer model'),
        input: t('t₁ = 1.0 s、V₁ = 2200 m/s；t₂ = 1.2 s、V₂ = 2352 m/s（时间均取单程）', 't₁ = 1.0 s, V₁ = 2200 m/s; t₂ = 1.2 s, V₂ = 2352 m/s (one-way times)'),
        steps: [
            t('V₂²t₂ = 5.532×10⁶ × 1.2 = 6.638×10⁶', 'V₂²t₂ = 5.532×10⁶ × 1.2 = 6.638×10⁶'),
            t('V₁²t₁ = 4.840×10⁶ × 1.0 = 4.840×10⁶', 'V₁²t₁ = 4.840×10⁶ × 1.0 = 4.840×10⁶'),
            t('v₂² = (6.638 − 4.840)×10⁶ / 0.2 = 8.99×10⁶ → v₂ ≈ 3000 m/s', 'v₂² = (6.638 − 4.840)×10⁶ / 0.2 = 8.99×10⁶ → v₂ ≈ 3000 m/s'),
        ],
        output: t('第二层层速度约 3000 m/s；若 V₂ 被高估 2%（≈ 2399 m/s），v₂ 会变成约 3220 m/s，偏差 7%', 'The interval velocity of the second layer is about 3000 m/s; if V₂ is overestimated by 2% (≈ 2399 m/s), v₂ becomes about 3220 m/s, a 7% bias'),
    },
    links: {
        upstream: [{ id: 'rms-velocity-definition', note: t('Dix 是它的差分形式', 'Dix is the difference form of that definition') }],
        downstream: [{ id: 'average-velocity-conversion', note: t('用平均速度反演层速度更稳定', 'inverting with average velocities is more stable') }],
        seealso: [{ id: 'hyperbolic-moveout-offset' }],
    },
    refs: [
        { text: 'Dix (1955), Seismic velocities from surface measurements, Geophysics 20, 68–86' },
        { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 3' },
    ],
};
export default dixFormula;
//# sourceMappingURL=dix-formula.js.map