import { t } from '../../core/types.js';
/** radon-multiple-attenuation */
const radonMultipleAttenuation = {
    id: 'radon-multiple-attenuation',
    name: t('Radon 域多次波压制', 'Radon-domain Multiple Attenuation'),
    aliases: { zh: ['多次波压制', '视速度滤波', 'τ-p 去多次波'], en: ['multiple attenuation', 'apparent-velocity filtering', 'tau-p demultiple'] },
    node: 'S3.7',
    tags: {
        math: ['MATH.TRANSFORM', 'MATH.GEOM'],
        method: ['METH.PROC'],
        quantity: ['Q.VEL', 'Q.TIME'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `p_{mult} < p_{prim},\qquad p = \frac{dt}{dx} = \frac{x}{v^{2}t}`,
        variants: [
            { name: t('双曲时距下的射线参数', 'Ray parameter for a hyperbolic moveout'), latex: String.raw `p(x,t_0) = \frac{x}{v\sqrt{v^{2}t_0^{2}+x^{2}}} = \frac{x}{v^{2}t}` },
            { name: t('m 阶多次波的到时', 'Arrival time of the m-th multiple'), latex: String.raw `t^{(m)} = \sqrt{(m t_0)^{2} + \frac{x^{2}}{v^{2}}}` },
            { name: t('可分离判据', 'Separability criterion'), latex: String.raw `\Delta p = p_{prim} - p_{mult} > \Delta p_{res} \approx \frac{1}{2\pi f X_{\max}}` },
        ],
    },
    meaning: t('多次波与一次波在道集上的根本差别是「更平」：同一偏移距上，多次波的走时更大，因而 dt/dx 更小、视速度更高。在 τ–p（或 Radon）域里这一点被放大成明显的横向距离，用一次掩膜就能把它们分开。', 'The fundamental difference between multiples and primaries in a gather is that multiples are flatter: at the same offset their travel time is larger, so dt/dx is smaller and the apparent velocity higher. In the τ–p (or Radon) domain this becomes a clear horizontal separation that a single mask can split apart.'),
    symbols: [
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/km' },
        { sym: 'p_{prim}', name: t('一次波的射线参数', 'ray parameter of the primary'), unit: 's/km' },
        { sym: 'p_{mult}', name: t('多次波的射线参数', 'ray parameter of the multiple'), unit: 's/km' },
        { sym: '\\Delta p_{res}', name: t('Radon 域斜率分辨率', 'Radon slope resolution'), unit: 's/km' },
        { sym: 'X_{\\max}', name: t('最大偏移距', 'maximum offset'), unit: 'km' },
    ],
    conditions: {
        applies: [t('CMP 道集上视速度差异明显时的多次波压制', 'Multiple attenuation when apparent velocities differ clearly on CMP gathers')],
        assumes: [
            t('多次波与一次波在 τ–p 域可分离', 'Multiples and primaries are separable in the τ–p domain'),
            t('长排列、道间距足够密', 'Long offsets and dense enough trace spacing'),
        ],
        breaks: [
            t('近道处两者视速度接近，压制会伤害一次波', 'At near offsets the apparent velocities converge and attenuation damages primaries'),
            t('非双曲时距（VTI、大偏移距）时分离不干净', 'Non-hyperbolic moveout (VTI, large offsets) leaves them inseparable'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('双曲时距关系', 'The hyperbolic moveout'),
            latex: String.raw `t(x) = \sqrt{t_0^{2}+\frac{x^{2}}{v^{2}}}` },
        { n: 2, op: 'algebra', title: t('对 x 求导得到射线参数', 'Differentiate with respect to x to get the ray parameter'),
            latex: String.raw `p = \frac{dt}{dx} = \frac{x}{v^{2}t}` },
        { n: 3, op: 'substitute', title: t('m 阶多次波把 t₀ 换成 m t₀', 'An m-th multiple replaces t₀ by m t₀'),
            latex: String.raw `t^{(m)} = \sqrt{(mt_0)^{2}+\frac{x^{2}}{v^{2}}} \Longrightarrow p^{(m)} = \frac{x}{v^{2}t^{(m)}}` },
        { n: 4, op: 'algebra', title: t('比较两者', 'Compare the two'),
            latex: String.raw `\frac{p^{(m)}}{p_{prim}} = \frac{t}{t^{(m)}} < 1` },
        { n: 5, op: 'result', title: t('与 Radon 分辨率比较', 'Compare with the Radon resolution'),
            latex: String.raw `\Delta p > \frac{1}{2\pi f X_{\max}} \Longrightarrow \text{可分离}` },
    ],
    viz: [
        {
            id: 'radon-separation',
            level: 'V2',
            title: t('一次波与多次波在 p–t₀ 平面上的分离', 'Separation of primaries and multiples in the p–t₀ plane'),
            xlabel: t('t₀ (s)', 't₀ (s)'),
            ylabel: t('射线参数 p (s/km)', 'ray parameter p (s/km)'),
            controls: [
                { id: 'x', label: t('偏移距 x (km)', 'offset x (km)'), min: 0.5, max: 5, step: 0.05, value: 2.0 },
                { id: 'v', label: t('速度 v (km/s)', 'velocity v (km/s)'), min: 1.5, max: 4, step: 0.05, value: 2.0 },
            ],
            note: t('同一偏移距上多次波的 p 明显更小。曲线之间的间距就是 Radon 域掩膜可以下手的空间。', 'At the same offset the multiple has a distinctly smaller p. The gap between the curves is the room in which a Radon mask can operate.'),
            compute: (p) => {
                const x = p['x'], v = p['v'];
                const p1 = [];
                const p2 = [];
                const p3 = [];
                for (let i = 0; i <= 200; i++) {
                    const t0 = 0.2 + (i / 200) * 2.8;
                    const tp = Math.sqrt(t0 * t0 + (x * x) / (v * v));
                    const t2 = Math.sqrt((2 * t0) ** 2 + (x * x) / (v * v));
                    const t3 = Math.sqrt((3 * t0) ** 2 + (x * x) / (v * v));
                    p1.push([t0, x / (v * v * tp)]);
                    p2.push([t0, x / (v * v * t2)]);
                    p3.push([t0, x / (v * v * t3)]);
                }
                return [
                    { label: t('一次波', 'primary'), color: '#185FA5', points: p1 },
                    { label: t('一阶多次波', 'first multiple'), color: '#993C1D', points: p2, dash: true },
                    { label: t('二阶多次波', 'second multiple'), color: '#0F6E56', points: p3, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('2 km 偏移距处的分离度', 'Separation at 2 km offset'),
        input: t('t₀ = 1.0 s，v = 2.0 km/s，x = 2 km', 't₀ = 1.0 s, v = 2.0 km/s, x = 2 km'),
        steps: [
            t('一次波 t = √(1+1) = 1.414 s，p = 2/(4×1.414) = 0.354 s/km', 'Primary: t = √(1+1) = 1.414 s, p = 2/(4×1.414) = 0.354 s/km'),
            t('一阶多次波 t = √(4+1) = 2.236 s，p = 0.224 s/km', 'First multiple: t = √(4+1) = 2.236 s, p = 0.224 s/km'),
        ],
        output: t('Δp = 0.130 s/km，远大于典型分辨率 —— 分离毫无困难', 'Δp = 0.130 s/km, far above typical resolution — separation is trivial'),
    },
    links: {
        upstream: [
            { id: 'radon-transform-linear', note: t('Radon 变换的定义', 'Definition of the Radon transform') },
            { id: 'periodic-multiple', note: t('压制的目标', 'The target of attenuation') },
        ],
        seealso: [{ id: 'slant-stack-discrete', note: t('离散实现方式', 'The discrete implementation') }],
    },
    refs: [{ text: 'Yilmaz, Seismic Data Analysis, ch. 6 (τ–p and Radon demultiple)' }],
};
export default radonMultipleAttenuation;
//# sourceMappingURL=radon-multiple-attenuation.js.map