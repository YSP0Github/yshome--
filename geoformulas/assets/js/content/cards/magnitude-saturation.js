import { t } from '../../core/types.js';
/** magnitude-saturation */
const magnitudeSaturating = {
    id: 'magnitude-saturation',
    name: t('震级标度的饱和', 'Saturation of Magnitude Scales'),
    aliases: { zh: ['震级饱和', 'Ms 饱和', 'mb 饱和'], en: ['magnitude saturation', 'Ms saturation', 'mb saturation'] },
    node: 'S4.2',
    tags: {
        math: ['MATH.APPROX'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `M = \log_{10}\frac{A}{T} + f(\Delta,h) + C`,
        variants: [
            { name: t('矩震级不饱和', 'Moment magnitude does not saturate'), latex: String.raw `M_w = \frac{2}{3}\left(\log_{10}M_0 - 9.1\right)` },
            { name: t('饱和的定量条件', 'Quantitative saturation condition'), latex: String.raw `\text{震源持续时间} \gtrsim \frac{1}{f_{\text{测量}}} \Longrightarrow \text{饱和}` },
            { name: t('典型饱和阈值', 'Typical saturation thresholds'), latex: String.raw `M_L \approx 6,\quad m_b \approx 6.5,\quad M_s \approx 8.3` },
        ],
    },
    meaning: t('每一种传统震级都用「某个固定周期上的振幅」来定义。当地震大到其破裂持续时间超过这个周期时，继续增大震源也不会再让这个周期的振幅变大 —— 震级就「饱和」了。矩震级直接由地震矩定义，因此不存在这个问题，这也是它成为大地震唯一标准标度的原因。', 'Every traditional magnitude is defined from the amplitude at some fixed period. Once an earthquake is large enough that its rupture duration exceeds that period, making the source bigger no longer increases the amplitude at that period — the magnitude saturates. Moment magnitude is defined directly from seismic moment and has no such problem, which is why it is the only standard scale for great earthquakes.'),
    symbols: [
        { sym: 'A', name: t('测量振幅', 'measured amplitude'), unit: 'm' },
        { sym: 'T', name: t('测量周期', 'measurement period'), unit: 's' },
        { sym: 'f(\\Delta,h)', name: t('震中距与深度校正', 'distance and depth correction'), unit: '无量纲' },
        { sym: 'M_{sat}', name: t('饱和阈值震级', 'saturation-threshold magnitude'), unit: '无量纲' },
        { sym: 'M_{0}', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
    ],
    conditions: {
        applies: [t('不同震级标度之间的换算与大地震定级', 'Conversion among magnitude scales and the sizing of great earthquakes')],
        assumes: [
            t('示意曲线为定性描述，实际饱和过程依赖具体标度定义', 'The schematic curves are qualitative; actual saturation depends on the scale definition'),
            t('矩震级的 9.1 常数对应 M₀ 以 N·m 为单位', 'The 9.1 constant corresponds to M₀ in N·m'),
        ],
        breaks: [
            t('小震（M < 3）时矩震级反而不如地方性震级精确', 'For small events (M < 3) moment magnitude is less precise than local magnitude'),
            t('不同机构给出的 M_s 定义略有差异，饱和点不是硬边界', 'Different agencies define M_s slightly differently; the saturation point is not a hard boundary'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('震级由固定周期的振幅定义', 'Magnitude is defined from a fixed-period amplitude'),
            latex: String.raw `M = \log_{10}\frac{A}{T} + f(\Delta,h) + C` },
        { n: 2, op: 'physics', title: t('震源谱在该周期上的取值', 'Value of the source spectrum at that period'),
            latex: String.raw `A(T) \propto |\dot{M}(f = 1/T)|` },
        { n: 3, op: 'identity', title: t('低频极限时谱平坦，等于 M₀', 'At the low-frequency limit the spectrum is flat and equals M₀'),
            latex: String.raw `\dot{M}(f \ll f_c) \approx M_0` },
        { n: 4, op: 'physics', title: t('大地震使 f_c 降到测量频率以下', 'Great earthquakes push f_c below the measurement frequency'),
            latex: String.raw `f_c < \frac{1}{T} \Longrightarrow A \text{ 不再随 } M_0 \text{ 增大}` },
        { n: 5, op: 'result', title: t('矩震级不受此限', 'Moment magnitude is exempt'),
            latex: String.raw `M_w = \frac{2}{3}(\log_{10}M_0 - 9.1)\ \text{对任意 } M_0 \text{ 成立}` },
    ],
    viz: [
        {
            id: 'saturation-curves',
            level: 'V1',
            title: t('各震级标度与矩震级的对比（示意）', 'Magnitude scales versus moment magnitude (schematic)'),
            xlabel: t('矩震级 M_w', 'moment magnitude M_w'),
            ylabel: t('表观震级', 'apparent magnitude'),
            controls: [],
            note: t('M_w 是一条 45° 直线，其余标度在不同位置弯折 —— 弯折点就是该标度的饱和阈值。', 'M_w is a 45° line while the others bend at different points — the bend marks each scale’s saturation threshold.'),
            compute: () => {
                const mw = [];
                const ml = [];
                const mb = [];
                const ms = [];
                const sat = (x, m) => m * Math.tanh(x / m);
                for (let i = 0; i <= 200; i++) {
                    const x = (i / 200) * 9.5;
                    mw.push([x, x]);
                    ml.push([x, sat(x, 6.0)]);
                    mb.push([x, sat(x, 6.5)]);
                    ms.push([x, sat(x, 8.3)]);
                }
                return [
                    { label: t('M_w', 'M_w'), color: '#185FA5', points: mw },
                    { label: t('M_L（≈6 饱和）', 'M_L (saturates ≈6)'), color: '#993C1D', points: ml, dash: true },
                    { label: t('m_b（≈6.5 饱和）', 'm_b (saturates ≈6.5)'), color: '#0F6E56', points: mb, dash: true },
                    { label: t('M_s（≈8.3 饱和）', 'M_s (saturates ≈8.3)'), color: '#7F77DD', points: ms, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('1960 年智利地震', 'The 1960 Chile earthquake'),
        input: t('M_w = 9.5', 'M_w = 9.5'),
        steps: [
            t('M_s 只给出约 8.5', 'M_s gave only about 8.5'),
            t('M_w − M_s = 1.0，差了整整一个震级单位', 'M_w − M_s = 1.0, a full magnitude unit apart'),
        ],
        output: t('能量上相差约 32 倍 —— 这就是饱和造成的系统性低估', 'Equivalent to a factor of about 32 in energy — the systematic underestimate caused by saturation'),
    },
    links: {
        upstream: [
            { id: 'local-magnitude', note: t('地方性震级', 'Local magnitude') },
            { id: 'surface-wave-magnitude', note: t('面波震级', 'Surface-wave magnitude') },
            { id: 'body-wave-magnitude', note: t('体波震级', 'Body-wave magnitude') },
        ],
        downstream: [{ id: 'mw-moment-magnitude', note: t('不饱和的标度', 'The non-saturating scale') }],
    },
    refs: [{ text: 'Kanamori, H. (1977). The energy release in great earthquakes. J. Geophys. Res., 82, 2981–2987' }],
};
export default magnitudeSaturating;
//# sourceMappingURL=magnitude-saturation.js.map