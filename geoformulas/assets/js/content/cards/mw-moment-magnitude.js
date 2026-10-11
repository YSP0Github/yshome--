import { t } from '../../core/types.js';
/** mw-moment-magnitude */
const momentMagnitude = {
    id: 'mw-moment-magnitude',
    name: t('地震矩与矩震级 Mw', 'Seismic Moment and Moment Magnitude Mw'),
    aliases: { zh: ['矩震级', '地震矩', 'Mw'], en: ['moment magnitude', 'seismic moment', 'Mw'] },
    node: 'S4.2',
    tags: {
        math: [],
        method: ['METH.TELE'],
        quantity: ['Q.AMP', 'Q.GEOM'],
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `M_{\mathrm{w}}=\frac{2}{3}\left(\log_{10} M_{0}-9.1\right),\qquad M_{0}\ \text{以 N·m 为单位}`,
        variants: [
            { name: t('地震矩定义', 'Definition of seismic moment'), latex: String.raw `M_{0}=\mu\,A\,\bar{D}` },
            { name: t('dyne·cm 单位下的写法', 'In dyne·cm'), latex: String.raw `M_{\mathrm{w}}=\frac{2}{3}\left(\log_{10} M_{0}-16.1\right),\qquad M_{0}\ \text{以 dyne·cm 为单位}` },
            { name: t('反解地震矩', 'Inverted'), latex: String.raw `M_{0}=10^{1.5M_{\mathrm{w}}+9.1}\ \text{N·m}` },
        ],
    },
    meaning: t('所有其它震级标度都会「饱和」—— 大到一定程度就再也量不出更大。Mw 直接量的是断层滑动了多少面积、滑了多少距离，是一个物理量而不是一个读数，因此不会饱和。这就是为什么现代地震目录统一用 Mw。', 'Every other magnitude scale saturates: beyond some size it can no longer distinguish "bigger". Mw measures a physical quantity — how big the rupture area was and how far it slipped — so it never saturates. That is why modern catalogues standardise on Mw.'),
    symbols: [
        { sym: 'M_{\\mathrm{w}}', name: t('矩震级', 'moment magnitude'), unit: '', dimension: '无量纲', typical: '−2 – 9.5' },
        { sym: 'M_0', name: t('地震矩', 'seismic moment'), unit: 'N·m', typical: '10⁶ – 10²³' },
        { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '3×10¹⁰' },
        { sym: 'A', name: t('断裂面积', 'rupture area'), unit: 'm²' },
        { sym: '\\bar{D}', name: t('平均滑移量', 'average slip'), unit: 'm' },
        { sym: 'E_s', name: t('辐射地震能', 'radiated seismic energy'), unit: 'J' },
    ],
    conditions: {
        applies: [t('与地震大小无关：从实验室微震到 9 级巨震都适用', 'Valid at all sizes, from laboratory microquakes to Mw 9 megathrusts')],
        assumes: [t('断层可以用一个等效的剪切位错表示', 'The fault is representable by an equivalent shear dislocation')],
        breaks: [t('极慢地震（慢滑事件）中 Mw 会低估实际的慢滑释放量', 'For slow-slip events Mw underestimates the total slow release')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('先定义地震矩（这是纯力学量）', 'Define seismic moment first (purely mechanical)'),
            latex: String.raw `M_{0}=\mu A \bar{D}`,
            note: t('μ 是刚度，A·D̄ 是「滑了多少」的几何量，两者相乘就是克服阻力所需的力矩量级。', 'μ is stiffness and A·D̄ is the geometric amount of slip; their product has the dimensions of moment.') },
        { n: 2, op: 'setup', title: t('Gutenberg–Richter 能量—震级经验关系', 'The Gutenberg–Richter energy–magnitude relation'),
            latex: String.raw `\log_{10} E_s = 1.5\,M_{\mathrm{s}}+11.8\qquad (E_s\ \text{以 erg 计})`,
            note: t('这是纯经验关系，把面波震级与辐射能量联系起来。注意常数 11.8（不是常被误写的 4.8）。', 'A purely empirical relation linking surface-wave magnitude to radiated energy. Note the constant is 11.8, not the 4.8 that is often miscopied.') },
        { n: 3, op: 'physics', title: t('把能量与地震矩联系起来', 'Link energy to seismic moment'),
            latex: String.raw `E_s=\frac{\Delta\sigma}{2\mu}\,M_{0}\simeq 5\times10^{-5}M_{0}`,
            note: t('取典型应力降 Δσ ≈ 3 MPa、μ ≈ 3×10¹⁰ Pa，则 Δσ/(2μ) ≈ 5×10⁻⁵。', 'With a typical stress drop Δσ ≈ 3 MPa and μ ≈ 3×10¹⁰ Pa, the ratio Δσ/(2μ) ≈ 5×10⁻⁵.') },
        { n: 4, op: 'substitute', title: t('单位换算到 erg：1 N·m = 10⁷ erg', 'Convert units: 1 N·m = 10⁷ erg'),
            latex: String.raw `E_s[\text{erg}]=5\times10^{-5}\times10^{7}\,M_{0}[\text{N·m}]=500\,M_{0}` },
        { n: 5, op: 'algebra', title: t('代入能量关系并要求 Ms ≡ Mw', 'Substitute and require Ms ≡ Mw'),
            latex: String.raw `\log_{10}M_{0}+\log_{10}500=1.5M_{\mathrm{w}}+11.8` },
        { n: 6, op: 'result', title: t('解出 Mw', 'Solve for Mw'),
            latex: String.raw `M_{\mathrm{w}}=\frac{2}{3}\left(\log_{10}M_{0}+2.699-11.8\right)=\frac{2}{3}\left(\log_{10}M_{0}-9.1\right)` },
    ],
    viz: [
        {
            id: 'mw-energy',
            level: 'V1',
            title: t('Mw 每差 1 级，矩和能量差多少', 'What one magnitude unit really means'),
            xlabel: t('矩震级 Mw', 'moment magnitude Mw'),
            ylabel: t('量值（对数刻度）', 'value (log scale)'),
            yScale: 'log',
            controls: [],
            xRange: [0, 9.5],
            note: t('注意两条线斜率不同：地震矩 M₀ 每级差 10^1.5 ≈ 31.6 倍，辐射能量差 10^1.5 ≈ 31.6 倍（因为 E ∝ M₀）。但常用误解是「每级差 10 倍」——那是不对的。', 'Note: M₀ increases by 10^1.5 ≈ 31.6 per unit magnitude. A frequent misconception is that it is 10× per unit — it is not.'),
            compute: () => {
                const m0 = [];
                const es = [];
                for (let i = 0; i <= 190; i++) {
                    const mw = (i / 190) * 9.5;
                    const M0 = Math.pow(10, 1.5 * mw + 9.1);
                    m0.push([mw, M0]);
                    es.push([mw, 5e-5 * M0]);
                }
                return [
                    { label: t('地震矩 M₀ (N·m)', 'seismic moment M₀ (N·m)'), color: '#185FA5', points: m0 },
                    { label: t('辐射能 E_s (J)', 'radiated energy E_s (J)'), color: '#A32D2D', dash: true, points: es },
                ];
            },
        },
    ],
    example: {
        title: t('2011 Mw 9.0 东北地震', 'The 2011 Mw 9.0 Tohoku earthquake'),
        input: t('断层长 ~500 km、宽 ~200 km，平均滑移 ~10 m，μ = 4×10¹⁰ Pa', 'rupture ~500 km × ~200 km, average slip ~10 m, μ = 4×10¹⁰ Pa'),
        steps: [
            t('A = 5×10⁵ × 2×10⁵ = 1×10¹¹ m²', 'A = 5×10⁵ × 2×10⁵ = 1×10¹¹ m²'),
            t('M₀ = 4×10¹⁰ × 10¹¹ × 10 = 4×10²² N·m', 'M₀ = 4×10¹⁰ × 10¹¹ × 10 = 4×10²² N·m'),
            t('Mw = (2/3)(22.6 − 9.1) = 9.0', 'Mw = (2/3)(22.6 − 9.1) = 9.0'),
        ],
        output: t('与 USGS 给出的 Mw 9.0–9.1 一致', 'Consistent with the USGS value of Mw 9.0–9.1'),
    },
    links: {
        downstream: [
            { id: 'brune-source-spectrum', note: t('知道了 M₀ 才能定标震源谱', 'M₀ sets the spectral level') },
        ],
    },
    refs: [
        { text: 'Kanamori (1977), JGR 82, 2981–2987' },
        { text: 'Hanks & Kanamori (1979), JGR 84, 2348–2350' },
    ],
};
export default momentMagnitude;
//# sourceMappingURL=mw-moment-magnitude.js.map