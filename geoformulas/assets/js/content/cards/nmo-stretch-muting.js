import { t } from '../../core/types.js';
/** nmo-stretch-muting */
const nmoStretchMuting = {
    id: 'nmo-stretch-muting',
    name: t('NMO 拉伸与远道切除', 'NMO Stretch & Far-offset Mute'),
    aliases: { zh: ['动校拉伸', '切除', '频率降低'], en: ['NMO stretch', 'stretch mute', 'frequency distortion'] },
    node: 'S3.4',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.TIME', 'Q.FREQ'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `S = \frac{t}{t_{0}} = \sqrt{1 + \frac{x^{2}}{v^{2}t_{0}^{2}}},\qquad f_{\text{after}} = \frac{f_{\text{before}}}{S}`,
        variants: [
            { name: t('双曲时距关系', 'The hyperbolic moveout'), latex: String.raw `t(x) = \sqrt{t_{0}^{2} + \frac{x^{2}}{v^{2}}}` },
            { name: t('切除判据', 'The mute criterion'), latex: String.raw `S > S_{\max}\ (1.5\text{–}2.0) \Longrightarrow \text{切除}` },
            { name: t('切除对应的最大偏移距', 'Maximum usable offset'), latex: String.raw `x_{\max} = v t_{0}\sqrt{S_{\max}^{2}-1}` },
        ],
    },
    meaning: t('动校正把远道的同相轴拉回 t₀，但这是一种非线性时间重映射：浅层远道的拉伸可以高达两三倍，子波主频被同等程度地拉低。叠加之后，浅层分辨率因此严重恶化。切除就是把拉伸过度的那一段扔掉 —— 这是「要覆盖次数还是要分辨率」之间的一次直接权衡。', 'NMO pulls far-offset events back to t₀, but this is a nonlinear time remap: shallow far-offset traces can be stretched by a factor of two or three, lowering the dominant frequency by the same amount. After stacking, shallow resolution is badly degraded. Muting discards the over-stretched part — a direct trade-off between fold and resolution.'),
    symbols: [
        { sym: 'S', name: t('拉伸因子', 'stretch factor'), unit: '无量纲', typical: '1 – 3' },
        { sym: 't_{0}', name: t('零偏移距双程时间', 'zero-offset two-way time'), unit: 's' },
        { sym: 't', name: t('偏移距 x 处的双程时间', 'two-way time at offset x'), unit: 's' },
        { sym: 'x', name: t('偏移距', 'offset'), unit: 'km' },
        { sym: 'v', name: t('叠加速度', 'stacking velocity'), unit: 'km/s' },
        { sym: 'S_{\\max}', name: t('可接受的最大拉伸', 'maximum acceptable stretch'), unit: '无量纲', typical: '1.5 – 2' },
    ],
    conditions: {
        applies: [t('CMP 道集动校正后的质量控制与切除设计', 'QC and mute design after NMO correction of CMP gathers')],
        assumes: [
            t('双曲时距关系成立', 'The hyperbolic moveout holds'),
            t('速度准确（速度偏大会加剧拉伸）', 'Velocities are accurate (over-estimated velocity worsens stretch)'),
        ],
        breaks: [
            t('非双曲（大偏移距、VTI 介质）时需用非双曲时距', 'Non-hyperbolic moveout is needed for large offsets and VTI media'),
            t('浅层折射与直达波区域的拉伸公式不适用', 'The formula does not apply in the shallow refraction/direct-wave zone'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('双曲时距关系', 'The hyperbolic moveout'),
            latex: String.raw `t(x) = \sqrt{t_0^{2} + \frac{x^{2}}{v^{2}}}` },
        { n: 2, op: 'algebra', title: t('反解出 t₀', 'Solve back for t₀'),
            latex: String.raw `t_0 = \sqrt{t^{2} - \frac{x^{2}}{v^{2}}}` },
        { n: 3, op: 'algebra', title: t('时间重映射的雅可比就是拉伸因子', 'The Jacobian of the time remap is the stretch factor'),
            latex: String.raw `S = \frac{dt_0}{dt} = \frac{t}{\sqrt{t^{2}-x^{2}/v^{2}}} = \frac{t}{t_0}` },
        { n: 4, op: 'identity', title: t('写成偏移距的显式', 'Write it explicitly in terms of offset'),
            latex: String.raw `S = \frac{\sqrt{t_0^{2}+x^{2}/v^{2}}}{t_0} = \sqrt{1+\frac{x^{2}}{v^{2}t_0^{2}}}` },
        { n: 5, op: 'result', title: t('解出可保留的最大偏移距', 'Solve for the largest usable offset'),
            latex: String.raw `S \le S_{\max} \Longrightarrow x \le v t_0\sqrt{S_{\max}^{2}-1}` },
    ],
    viz: [
        {
            id: 'stretch-vs-offset',
            level: 'V1',
            title: t('拉伸因子随偏移距与 t₀ 的变化', 'Stretch factor versus offset and t₀'),
            xlabel: t('偏移距 x (km)', 'offset x (km)'),
            ylabel: t('拉伸因子 S', 'stretch factor S'),
            controls: [
                { id: 't0', label: t('t₀ (s)', 't₀ (s)'), min: 0.2, max: 3, step: 0.05, value: 0.6 },
                { id: 'v', label: t('叠加速度 (km/s)', 'stacking velocity (km/s)'), min: 1.5, max: 5, step: 0.05, value: 2.5 },
                { id: 'smax', label: t('可接受拉伸 S_max', 'acceptable stretch S_max'), min: 1.2, max: 3, step: 0.05, value: 1.8 },
            ],
            note: t('t₀ 越小拉伸越剧烈 —— 浅层总是最先被切掉。', 'Smaller t₀ means more severe stretch — the shallow section is always muted first.'),
            compute: (p) => {
                const t0 = p['t0'], v = p['v'], smax = p['smax'];
                const cur = [];
                const lim = [];
                for (let i = 0; i <= 200; i++) {
                    const x = (i / 200) * 6;
                    cur.push([x, Math.sqrt(1 + (x * x) / (v * v * t0 * t0))]);
                    lim.push([x, smax]);
                }
                return [
                    { label: t('S(x)', 'S(x)'), color: '#185FA5', points: cur },
                    { label: t('切除阈值', 'mute threshold'), color: '#993C1D', points: lim, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('浅层远道的切除', 'Muting a shallow far trace'),
        input: t('t₀ = 0.5 s，v = 2.0 km/s，x = 2 km', 't₀ = 0.5 s, v = 2.0 km/s, x = 2 km'),
        steps: [
            t('S = √(1 + 4/(4×0.25)) = √(1+4) = 2.24', 'S = √(1 + 4/(4×0.25)) = √(1+4) = 2.24'),
            t('40 Hz 的子波被拉成 40/2.24 = 17.9 Hz', 'A 40 Hz wavelet is stretched to 40/2.24 = 17.9 Hz'),
        ],
        output: t('该道必须切除，否则叠加后浅层分辨率崩溃', 'This trace must be muted, otherwise shallow resolution collapses after stacking'),
    },
    links: {
        upstream: [
            { id: 'nmo-correction', note: t('动校正量本身', 'The NMO correction itself') },
            { id: 'hyperbolic-moveout-offset', note: t('双曲时距关系', 'The hyperbolic moveout') },
        ],
        seealso: [{ id: 'nonhyperbolic-moveout', note: t('大偏移距时的修正', 'Correction at large offsets') }],
    },
    refs: [{ text: 'Dunkin, J. & Levin, F. (1973). Effect of normal moveout on a seismic pulse. Geophysics, 38, 635–642' }],
};
export default nmoStretchMuting;
//# sourceMappingURL=nmo-stretch-muting.js.map