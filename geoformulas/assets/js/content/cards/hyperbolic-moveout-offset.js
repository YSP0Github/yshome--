import { t } from '../../core/types.js';
/** hyperbolic-moveout-offset */
const hyperbolicMoveoutOffset = {
    id: 'hyperbolic-moveout-offset',
    name: t('双曲时距的动校正量与偏移距', 'Hyperbolic Moveout and Its Offset Dependence'),
    aliases: {
        zh: ['动校正量', 'NMO', '残余时差', '拉伸'],
        en: ['moveout', 'NMO correction', 'residual moveout', 'stretch'],
    },
    node: 'S2.3',
    tags: {
        math: ['MATH.APPROX', 'MATH.GEOM'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
        keywords: t('动校正 NMO 时差 偏移距 残余时差 速度误差 拉伸切除 非双曲', 'moveout NMO offset residual moveout velocity error stretch mute non-hyperbolic'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\Delta t_{\mathrm{NMO}}\left(x\right)=t\left(x\right)-t_{0}=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}-t_{0}`,
        variants: [
            {
                name: t('小偏移距二阶近似', 'Second-order small-offset approximation'),
                latex: String.raw `\Delta t_{\mathrm{NMO}}\simeq\frac{x^{2}}{2v^{2}t_{0}}\qquad (x\ll vt_{0})`,
            },
            {
                name: t('速度取错时的残余时差', 'Residual moveout when the velocity is wrong'),
                latex: String.raw `\Delta t_{\mathrm{res}}\left(x\right)=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}-\sqrt{t_{0}^{2}+\frac{x^{2}}{v_{c}^{2}}}`,
            },
            {
                name: t('校正后的子波拉伸因子', 'Wavelet stretch factor after correction'),
                latex: String.raw `S=\frac{t}{t_{0}}=\sqrt{1+\frac{x^{2}}{v^{2}t_{0}^{2}}}\;\ge 1`,
            },
            {
                name: t('层状介质用均方根速度', 'Layered media use the rms velocity'),
                latex: String.raw `\Delta t_{\mathrm{NMO}}\left(x\right)=\sqrt{t_{0}^{2}+\frac{x^{2}}{v_{\mathrm{rms}}^{2}}}-t_{0}`,
            },
        ],
    },
    meaning: t('动校正量就是把倾斜的同相轴拉平所需要的时移。它随偏移距的平方增长，所以在浅层、远道上可以达到与 t₀ 同量级——这正是 NMO 拉伸与切除的根源。反过来，残余时差为零也是速度分析的判据：校正速度选对时同相轴完全拉平，选错时残余时差随偏移距呈抛物线，其符号直接指示速度偏高还是偏低。', 'The moveout correction is the time shift needed to flatten a dipping (in offset) event. It grows as the square of the offset, so on shallow far traces it can reach the same order as t₀ itself — the root cause of NMO stretch and muting. Run backwards, zero residual moveout is the criterion of velocity analysis: with the right correction velocity the event flattens completely, and with the wrong one the residual moveout is parabolic in offset, its sign telling directly whether the velocity is too high or too low.'),
    symbols: [
        { sym: '\\Delta t_{\\mathrm{NMO}}', name: t('动校正量（正常时差）', 'normal moveout correction'), unit: 's', typical: '0 – 1.5' },
        { sym: 't', name: t('双程反射走时', 'two-way reflection travel time'), unit: 's' },
        { sym: 't_{0}', name: t('零偏移距双程走时', 'zero-offset two-way travel time'), unit: 's', typical: '0.2 – 5' },
        { sym: 'x', name: t('炮检距（偏移距）', 'offset'), unit: 'm', typical: '100 – 8000' },
        { sym: 'v', name: t('上覆介质速度（层状时为 v_rms）', 'velocity above the reflector (v_rms for layering)'), unit: 'm/s', typical: '1500 – 5000' },
        { sym: 'v_{c}', name: t('实际使用的校正速度', 'correction velocity actually used'), unit: 'm/s' },
        { sym: '\\Delta t_{\\mathrm{res}}', name: t('残余时差（校正后残留的弯曲）', 'residual moveout (curvature left after correction)'), unit: 's' },
        { sym: 'S', name: t('子波拉伸因子，大于 1.3 时通常切除', 'wavelet stretch factor; muting is usual above about 1.3'), unit: '—', typical: '1.0 – 2.5' },
    ],
    conditions: {
        applies: [
            t('CMP 道集的动校正、速度分析与水平叠加', 'NMO correction, velocity analysis and CMP stacking of common-midpoint gathers'),
            t('评估拉伸切除的门限与远道可用性', 'Choosing stretch-mute thresholds and judging far-trace usability'),
        ],
        assumes: [
            t('单一水平反射界面，上覆速度恒定或可用 v_rms 近似', 'A single horizontal reflector with constant velocity or a v_rms approximation'),
            t('各向同性、无波型转换', 'Isotropy and no mode conversion'),
        ],
        breaks: [
            t('x/z ≳ 1 时双曲近似失效，需非双曲（四阶）或各向异性校正', 'For x/z ≳ 1 the hyperbolic approximation fails; fourth-order or anisotropic corrections are needed'),
            t('界面倾斜时动校正速度变为 v/cos φ，需先做 DMO 或偏移', 'With dip the correction velocity becomes v/cos φ, requiring DMO or migration'),
            t('浅层远道 S 很大，校正后波形严重畸变，必须切除而非强行拉平', 'On shallow far traces S is large and the corrected waveform is badly distorted; these traces must be muted rather than forcibly flattened'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('从双曲时距出发', 'Start from the hyperbolic travel time'),
            latex: String.raw `t\left(x\right)=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}`,
        },
        {
            n: 2,
            op: 'algebra',
            title: t('减去零偏移距走时', 'Subtract the zero-offset time'),
            latex: String.raw `\Delta t_{\mathrm{NMO}}=t-t_{0}=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}-t_{0}`,
        },
        {
            n: 3,
            op: 'taylor',
            title: t('小偏移距展开到二阶', 'Expand to second order in offset'),
            latex: String.raw `\Delta t_{\mathrm{NMO}}=t_{0}\left(\sqrt{1+\frac{x^{2}}{v^{2}t_{0}^{2}}}-1\right)\simeq\frac{x^{2}}{2v^{2}t_{0}}`,
            note: t('校正量正比于 x²、反比于 t₀：浅层（t₀ 小）的校正量最大。', 'The correction scales as x² and inversely with t₀: shallow events (small t₀) need the largest correction.'),
        },
        {
            n: 4,
            op: 'substitute',
            title: t('若校正速度取成 v_c ≠ v', 'If the correction velocity is taken as v_c ≠ v'),
            latex: String.raw `\Delta t_{\mathrm{res}}=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}-\sqrt{t_{0}^{2}+\frac{x^{2}}{v_{c}^{2}}}`,
            note: t('v_c < v 为过校正（残余时差为负，同相轴向下弯）；v_c > v 为欠校正（残余时差为正）。', 'v_c < v over-corrects (negative residual, the event bends downward); v_c > v under-corrects (positive residual).'),
        },
        {
            n: 5,
            op: 'identity',
            title: t('残余时差的小偏移距形式', 'Small-offset form of the residual'),
            latex: String.raw `\Delta t_{\mathrm{res}}\simeq\frac{x^{2}}{2t_{0}}\left(\frac{1}{v^{2}}-\frac{1}{v_{c}^{2}}\right)`,
            note: t('抛物线形，且在 t₀ 处放大 —— 浅层的速度误差在残余时差上最明显。', 'Parabolic in x and amplified by 1/t₀: velocity errors show up most clearly on shallow events.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('拉伸因子：校正把子波拉长多少倍', 'Stretch factor: how much the correction stretches the wavelet'),
            latex: String.raw `S=\frac{\mathrm{d}t}{\mathrm{d}t_{0}}=\frac{t}{t_{0}}=\sqrt{1+\frac{x^{2}}{v^{2}t_{0}^{2}}}`,
            note: t('S 就是频率被压缩的倍数；S > 1.3 时远道的频谱已被严重压低，通常直接切除。', 'S is the factor by which frequency is compressed; above about 1.3 the far-trace spectrum is severely degraded and the trace is usually muted.'),
        },
    ],
    viz: [
        {
            id: 'residual-moveout',
            level: 'V1',
            title: t('速度误差造成的残余时差', 'Residual moveout caused by a velocity error'),
            xlabel: t('偏移距 x (m)', 'offset x (m)'),
            ylabel: t('残余时差 Δt_res (s)', 'residual moveout Δt_res (s)'),
            controls: [
                { id: 'mt0', label: t('零偏移距走时 t₀', 'zero-offset time t₀'), min: 0.3, max: 4, step: 0.05, value: 1.0, unit: 's' },
                { id: 'mv', label: t('真实速度 v', 'true velocity v'), min: 1500, max: 5000, step: 50, value: 2500, unit: 'm/s' },
                { id: 'merr', label: t('校正速度误差', 'correction velocity error'), min: -25, max: 25, step: 1, value: 10, unit: '%' },
            ],
            xRange: [0, 6000],
            note: t('误差为正（校正速度偏大、欠校正）时残余时差为正，同相轴还是向上翘；误差为负（过校正）时它向下弯，且弯曲更陡——过校正比欠校正更容易用肉眼识别。把 t₀ 调小到 0.4 s，同样的速度误差会放大数倍。', 'Positive error (correction velocity too large, under-correction) leaves a positive residual with the event still curving upward; negative error (over-correction) bends it downward more steeply — over-correction is easier to spot by eye. Reduce t₀ to 0.4 s and the same velocity error is amplified severalfold.'),
            compute: (p) => {
                const t0 = p['mt0'];
                const v = p['mv'];
                const err = p['merr'];
                const vc = v * (1 + err / 100);
                const res = [];
                const zero = [];
                for (let i = 0; i <= 300; i++) {
                    const x = (i / 300) * 6000;
                    const t = Math.sqrt(t0 * t0 + (x * x) / (v * v));
                    const tc = Math.sqrt(t0 * t0 + (x * x) / (vc * vc));
                    res.push([x, t - tc]);
                    zero.push([x, 0]);
                }
                return [
                    { label: t(`v_c = ${Math.round(vc)} m/s`, `v_c = ${Math.round(vc)} m/s`), color: '#185FA5', points: res },
                    { label: t('完全拉平（参考）', 'perfectly flattened (reference)'), color: '#B4B2A9', dash: true, points: zero },
                ];
            },
        },
        {
            id: 'stretch-factor',
            level: 'V1',
            title: t('动校正的拉伸因子随偏移距增长', 'NMO stretch factor versus offset'),
            xlabel: t('偏移距 x (m)', 'offset x (m)'),
            ylabel: t('拉伸因子 S = t/t₀', 'stretch factor S = t/t₀'),
            controls: [
                { id: 'st0', label: t('零偏移距走时 t₀', 'zero-offset time t₀'), min: 0.3, max: 4, step: 0.05, value: 1.0, unit: 's' },
                { id: 'sv2', label: t('速度 v', 'velocity v'), min: 1500, max: 5000, step: 50, value: 2500, unit: 'm/s' },
            ],
            xRange: [0, 6000],
            note: t('S 是子波被拉长的倍数，也是频率被压低的倍数。虚线 S = 1.3 是常用的切除门限：越过它，远道的频谱已被压到叠加会伤及分辨率的程度。浅层（t₀ 小）在很短的偏移距上就越过门限。', 'S is the factor by which the wavelet is stretched and its frequency compressed. The dashed line at S = 1.3 is a common mute threshold: beyond it the far-trace spectrum is compressed to the point where stacking damages resolution. Shallow events (small t₀) cross the threshold at very short offsets.'),
            compute: (p) => {
                const t0 = p['st0'];
                const v = p['sv2'];
                const cur = [];
                const lim = [];
                for (let i = 0; i <= 300; i++) {
                    const x = (i / 300) * 6000;
                    cur.push([x, Math.sqrt(1 + (x * x) / (v * v * t0 * t0))]);
                    lim.push([x, 1.3]);
                }
                return [
                    { label: t('S = √(1 + x²/(v²t₀²))', 'S = √(1 + x²/(v²t₀²))'), color: '#0F6E56', points: cur },
                    { label: t('切除门限 S = 1.3', 'mute threshold S = 1.3'), color: '#BA7517', dash: true, points: lim },
                ];
            },
        },
    ],
    example: {
        title: t('浅层远道是否该切除', 'Should a shallow far trace be muted?'),
        input: t('t₀ = 0.4 s，v = 1800 m/s，x = 1500 m', 't₀ = 0.4 s, v = 1800 m/s, x = 1500 m'),
        steps: [
            t('x/(v t₀) = 1500/(1800×0.4) = 2.083', 'x/(v t₀) = 1500/(1800×0.4) = 2.083'),
            t('S = √(1 + 4.34) = 2.31', 'S = √(1 + 4.34) = 2.31'),
            t('Δt_NMO = √(0.16 + 0.694) − 0.4 = 0.524 s', 'Δt_NMO = √(0.16 + 0.694) − 0.4 = 0.524 s'),
        ],
        output: t('子波被拉长 2.3 倍、主频降到约 43%，远超 1.3 门限 —— 必须切除，否则叠加会严重降低分辨率', 'The wavelet is stretched 2.3-fold and its dominant frequency drops to about 43%, far beyond the 1.3 threshold — it must be muted, otherwise stacking badly degrades resolution'),
    },
    links: {
        upstream: [{ id: 'reflection-hyperbola', note: t('本条是其校正量形式', 'this card is the correction form of that one') }],
        downstream: [{ id: 'nmo-correction', note: t('实际处理流程中的动校正步骤', 'the NMO step in actual processing') }],
        seealso: [
            { id: 'dipping-reflector-travel-time', note: t('倾斜时校正速度变为 v/cos φ', 'with dip the correction velocity becomes v/cos φ') },
            { id: 'rms-velocity-definition' },
        ],
    },
    refs: [
        { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 3' },
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.3' },
    ],
};
export default hyperbolicMoveoutOffset;
//# sourceMappingURL=hyperbolic-moveout-offset.js.map