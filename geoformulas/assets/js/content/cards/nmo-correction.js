import { t } from '../../core/types.js';
/** nmo-correction */
const nmoCorrection = {
    id: 'nmo-correction',
    name: t('NMO 校正与拉伸切除准则', 'NMO Correction and the Stretch-mute Criterion'),
    aliases: { zh: ['动校正', '拉伸切除'], en: ['NMO correction', 'stretch mute'] },
    node: 'S3.4',
    tags: {
        math: ['MATH.APPROX'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.TIME', 'Q.FREQ'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta t_{\mathrm{NMO}}=t(x)-t_{0}=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}-t_{0}`,
        variants: [
            { name: t('拉伸因子 S', 'Stretch factor S'), latex: String.raw `S=\frac{t_{0}}{x}\frac{\dd x}{\dd t_{0}}\;\Longrightarrow\; \text{相对拉伸}=S-1` },
            { name: t('切除算子', 'Mute criterion'), latex: String.raw `S\le S_{\max}\;\text{（工程上常取 } S_{\max}=1.5\sim2.0\text{）}` },
        ],
    },
    meaning: t('把 CMP 道集上弯曲的同相轴「掰平」，才能同相叠加。掰平的过程会把子波往下拉伸，越浅、越远越严重 —— 所以切除不是一个随意的手艺活，它有定量判据。', 'Flattening the curved events on a CMP gather is what makes stacking possible. But flattening stretches the wavelet — worse for shallow events and far offsets — so muting is a quantitative trade-off, not a matter of taste.'),
    symbols: [
        { sym: '\\Delta t_{\\mathrm{NMO}}', name: t('动校正量（需减去的时差）', 'NMO correction to subtract'), unit: 's' },
        { sym: 'S', name: t('拉伸因子', 'stretch factor'), unit: '', dimension: '无量纲' },
        { sym: 'x', name: t('偏移距', 'offset'), unit: 'm' },
        { sym: 'v', name: t('叠加速度', 'stacking velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('水平层、双曲时距成立的道集', 'Horizontal layering with valid hyperbolic moveout')],
        assumes: [t('校正后的子波主频降低可接受', 'Reduced dominant frequency after correction is acceptable')],
        breaks: [t('浅层远道：S 迅速超过阈值，拉伸假象无法挽回', 'Shallow far traces: S blows past the threshold and the distortion is irreversible')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('直接定义就得到校正量', 'The correction follows from the definition'),
            latex: String.raw `\Delta t_{\mathrm{NMO}}=t(x)-t_{0}=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}-t_{0}` },
        { n: 2, op: 'algebra', title: t('考虑相邻深度 Δ 一个小时间窗 Δt₀', 'Consider a small time window Δt₀ around t₀'),
            latex: String.raw `\dd x = v^{2}\,\frac{t_{0}}{x}\,\dd t_{0}\quad\Rightarrow\quad \frac{x}{t_{0}}\frac{\dd t_{0}}{\dd x}=\frac{v^{2}t_{0}^{2}}{x^{2}}` },
        { n: 3, op: 'identity', title: t('定义拉伸因子并化简', 'Define the stretch factor and simplify'),
            latex: String.raw `S\equiv\frac{t_{0}}{x}\frac{\dd x}{\dd t_{0}}=\frac{x}{v^{2}t_{0}}\cdot\frac{x}{t_{0}}\cdot\frac{v^{2}t_{0}^{2}}{x^{2}}\cdot\frac{t_{0}}{x}\cdot\frac{x}{t_{0}}=1+\frac{x^{2}}{v^{2}t_{0}^{2}}` },
        { n: 4, op: 'result', title: t('工程判据', 'The engineering criterion'),
            latex: String.raw `\frac{x^{2}}{v^{2}t_{0}^{2}}\le S_{\max}-1\;\Longrightarrow\; x\le v\,t_{0}\sqrt{S_{\max}-1}`,
            note: t('注意 x_max ∝ t₀：浅层（小 t₀）的可保留偏移距急剧变小，这就是浅层资料远道必须被切掉的原因。', 'Note x_max ∝ t₀: shallow events can keep far less offset, which is exactly why shallow far traces get muted.') },
    ],
    example: {
        input: t('t₀ = 0.4 s，v = 2000 m/s，S_max = 1.5', 't₀ = 0.4 s, v = 2000 m/s, S_max = 1.5'),
        steps: [
            t('x_max = 2000 × 0.4 × √0.5 = 566 m', 'x_max = 2000 × 0.4 × √0.5 = 566 m'),
            t('同样条件下 t₀ = 1.6 s 时 x_max = 2263 m', 'for t₀ = 1.6 s the same criterion gives x_max = 2263 m'),
        ],
        output: t('浅层的可用偏移距只有深层的 1/4', 'Usable offset for the shallow event is only a quarter of the deep one'),
    },
    links: {
        upstream: [{ id: 'reflection-hyperbola' }],
    },
    refs: [{ text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 4' }],
};
export default nmoCorrection;
//# sourceMappingURL=nmo-correction.js.map