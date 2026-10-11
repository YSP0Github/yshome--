import { t } from '../../core/types.js';
/** dip-moveout-correction */
const dipMoveoutCorrection = {
    id: 'dip-moveout-correction',
    name: t('倾角时差校正（DMO）', 'Dip-moveout Correction (DMO)'),
    aliases: { zh: ['DMO', '倾角校正', '倾斜反射面'], en: ['DMO', 'dip moveout', 'dipping reflector'] },
    node: 'S3.4',
    tags: {
        math: ['MATH.GEOM', 'MATH.APPROX'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `t(x) = \sqrt{t_{0}^{2} + \frac{x^{2}\cos^{2}\xi}{v^{2}}}\ \Longrightarrow\ v_{NMO} = \frac{v}{\cos\xi}`,
        variants: [
            { name: t('DMO 校正量', 'The DMO correction'), latex: String.raw `\Delta t_{DMO} = \sqrt{t_0^{2}+\frac{x^{2}}{v^{2}}} - \sqrt{t_0^{2}+\frac{x^{2}\cos^{2}\xi}{v^{2}}}` },
            { name: t('校正后回到速度 v 的双曲形态', 'After correction the moveout is hyperbolic in v'), latex: String.raw `t_{DMO}(x) = \sqrt{t_0^{2}+\frac{x^{2}}{v^{2}}}` },
            { name: t('倾角与视速度', 'Dip and apparent velocity'), latex: String.raw `\cos\xi = \frac{v}{v_{NMO}}` },
        ],
    },
    meaning: t('倾斜反射面的时距曲线比水平面「平」一些：用介质的真实速度 v 去做 NMO 会校过头，必须用一个更大的速度 v/cos ξ。可是同一个 CMP 道集里可能同时有水平和倾斜两组同相轴，一个速度无法同时满足。DMO 的做法是：统一用 v 做校正，再补一个只依赖倾角、不依赖速度的校正量，把倾斜同相轴搬到正确位置。', 'A dipping reflector has a flatter moveout than a flat one: NMO with the true medium velocity v over-corrects, requiring the larger velocity v/cos ξ. But one CMP gather may contain both flat and dipping events, and no single velocity satisfies both. DMO solves this by correcting everything with v, then adding a purely dip-dependent, velocity-independent correction that moves the dipping event to the right place.'),
    symbols: [
        { sym: '\\xi', name: t('反射面倾角', 'reflector dip'), unit: '°', typical: '0 – 45' },
        { sym: 'v', name: t('介质速度', 'medium velocity'), unit: 'km/s' },
        { sym: 'v_{NMO}', name: t('倾斜界面所需的动校速度', 'NMO velocity needed for a dipping interface'), unit: 'km/s' },
        { sym: '\\Delta t_{DMO}', name: t('DMO 校正量', 'DMO correction'), unit: 's' },
        { sym: 't_{0}', name: t('零偏移距双程时间', 'zero-offset two-way time'), unit: 's' },
    ],
    conditions: {
        applies: [t('存在明显构造倾角、且同一道集内倾角不一致的区域', 'Areas with significant structural dip and mixed dips within one gather')],
        assumes: [
            t('常速或弱变速、单一倾角', 'Constant or weakly varying velocity, a single dip'),
            t('双曲时距近似成立', 'The hyperbolic approximation holds'),
        ],
        breaks: [
            t('强横向变速时 DMO 与偏移必须联合处理', 'With strong lateral velocity variation DMO and migration must be handled jointly'),
            t('倾角超过 60° 时近似失效', 'The approximation fails beyond ~60° dip'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('倾斜反射面的几何', 'Geometry of a dipping reflector'),
            latex: String.raw `\text{有效偏移距} = x\cos\xi` },
        { n: 2, op: 'substitute', title: t('把 x 换成 x cos ξ', 'Replace x by x cos ξ'),
            latex: String.raw `t(x) = \sqrt{t_0^{2} + \frac{x^{2}\cos^{2}\xi}{v^{2}}}` },
        { n: 3, op: 'algebra', title: t('写成标准双曲形式', 'Write it in standard hyperbolic form'),
            latex: String.raw `t(x) = \sqrt{t_0^{2}+\frac{x^{2}}{v_{NMO}^{2}}},\qquad v_{NMO} = \frac{v}{\cos\xi}` },
        { n: 4, op: 'algebra', title: t('用真实速度 v 做 NMO 后的残差', 'Residual after NMO with the true velocity v'),
            latex: String.raw `\Delta t_{DMO} = \sqrt{t_0^{2}+\frac{x^{2}}{v^{2}}} - \sqrt{t_0^{2}+\frac{x^{2}\cos^{2}\xi}{v^{2}}} > 0` },
        { n: 5, op: 'result', title: t('DMO 后再做速度分析与叠加', 'After DMO, redo velocity analysis and stack'),
            latex: String.raw `\text{NMO}(v) + \text{DMO} \Longrightarrow \text{倾角无关的叠加}` },
    ],
    viz: [
        {
            id: 'dmo-correction',
            level: 'V1',
            title: t('倾斜同相轴的时距与 DMO 校正量', 'Moveout of a dipping event and the DMO correction'),
            xlabel: t('偏移距 x (km)', 'offset x (km)'),
            ylabel: t('时间 (s)', 'time (s)'),
            controls: [
                { id: 't0', label: t('t₀ (s)', 't₀ (s)'), min: 0.3, max: 3, step: 0.05, value: 1.0 },
                { id: 'v', label: t('介质速度 (km/s)', 'medium velocity (km/s)'), min: 1.5, max: 5, step: 0.05, value: 2.5 },
                { id: 'xi', label: t('倾角 ξ (°)', 'dip ξ (°)'), min: 0, max: 60, step: 1, value: 25 },
            ],
            note: t('倾角越大，倾斜同相轴越平，DMO 校正量也越大。', 'The steeper the dip, the flatter the dipping event and the larger the DMO correction.'),
            compute: (p) => {
                const t0 = p['t0'], v = p['v'], xi = (p['xi'] * Math.PI) / 180;
                const flat = [];
                const dip = [];
                const dmo = [];
                for (let i = 0; i <= 200; i++) {
                    const x = (i / 200) * 4;
                    const tf = Math.sqrt(t0 * t0 + (x * x) / (v * v));
                    const td = Math.sqrt(t0 * t0 + (x * x * Math.cos(xi) ** 2) / (v * v));
                    flat.push([x, tf]);
                    dip.push([x, td]);
                    dmo.push([x, tf - td]);
                }
                return [
                    { label: t('水平界面 t(x)', 'flat t(x)'), color: '#888780', points: flat, dash: true },
                    { label: t('倾斜界面 t(x)', 'dipping t(x)'), color: '#185FA5', points: dip },
                    { label: t('Δt_DMO', 'Δt_DMO'), color: '#993C1D', points: dmo },
                ];
            },
        },
    ],
    example: {
        title: t('25° 倾角所需的动校速度', 'NMO velocity for a 25° dip'),
        input: t('v = 2.5 km/s，ξ = 25°', 'v = 2.5 km/s, ξ = 25°'),
        steps: [
            t('cos 25° = 0.906', 'cos 25° = 0.906'),
            t('v_NMO = 2.5/0.906 = 2.76 km/s', 'v_NMO = 2.5/0.906 = 2.76 km/s'),
        ],
        output: t('速度谱上会看到比介质速度高 10% 的假象，误解释会造成叠加失败', 'The velocity spectrum shows a spurious 10% high velocity; misinterpreting it ruins the stack'),
    },
    links: {
        upstream: [
            { id: 'hyperbolic-moveout-offset', note: t('水平界面的时距关系', 'The moveout for a flat interface') },
            { id: 'dipping-reflector-travel-time', note: t('倾斜反射面的走时', 'Travel time of a dipping reflector') },
        ],
        downstream: [{ id: 'velocity-analysis', note: t('DMO 之后重新做速度分析', 'Velocity analysis is redone after DMO') }],
    },
    refs: [{ text: 'Deregowski, S. (1986). What is DMO? First Break, 4, 7–24' }],
};
export default dipMoveoutCorrection;
//# sourceMappingURL=dip-moveout-correction.js.map