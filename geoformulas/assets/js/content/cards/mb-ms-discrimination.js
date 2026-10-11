import { t } from '../../core/types.js';
/** mb-ms-discrimination */
const mbMsDiscrimination = {
    id: 'mb-ms-discrimination',
    name: t('m_b–M_s 震源类型判别', 'The m_b–M_s Source Discriminant'),
    aliases: { zh: ['震源判别', '爆炸识别', 'mb:Ms'], en: ['source discrimination', 'explosion identification', 'mb:Ms'] },
    node: 'S4.2',
    tags: {
        math: ['MATH.STAT'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.AMP'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta = m_{b} - M_{s}`,
        variants: [
            { name: t('判据', 'The criterion'), latex: String.raw `\Delta < 0 \Longrightarrow \text{天然地震},\qquad \Delta > 0 \Longrightarrow \text{爆炸或其他浅源各向同性事件}` },
            { name: t('物理解释', 'Physical explanation'), latex: String.raw `m_b \sim 1\ \text{s 体波},\quad M_s \sim 20\ \text{s 面波},\quad \text{震源持续时间决定两者比值}` },
            { name: t('现代替代方案', 'Modern alternatives'), latex: String.raw `\frac{P}{S}\ \text{谱比（区域距离）},\qquad \text{矩张量的 ISO 成分}` },
        ],
    },
    meaning: t('天然地震有较长的破裂持续时间和明显的双力偶机制，激发面波的效率高于体波；爆炸是瞬时的各向同性膨胀，体波相对更强。于是「体波震级减面波震级」这个简单的差就能把两者分开 —— 这是核爆监测最经典的判别量。', 'Natural earthquakes have a long rupture duration and a clear double-couple mechanism, exciting surface waves more efficiently than body waves; explosions are instantaneous isotropic expansions that radiate body waves relatively strongly. The simple difference between body-wave and surface-wave magnitude therefore separates the two — the classic discriminant of nuclear monitoring.'),
    symbols: [
        { sym: 'm_{b}', name: t('体波震级（约 1 s 周期）', 'body-wave magnitude (~1 s period)'), unit: '无量纲' },
        { sym: 'M_{s}', name: t('面波震级（约 20 s 周期）', 'surface-wave magnitude (~20 s period)'), unit: '无量纲' },
        { sym: '\\Delta', name: t('判别量', 'discriminant'), unit: '无量纲', typical: '−1 – +1.5' },
    ],
    conditions: {
        applies: [t('核爆监测、诱发地震与天然地震的区分', 'Nuclear monitoring; distinguishing induced from natural earthquakes')],
        assumes: [
            t('两个震级都测量可靠', 'Both magnitudes are reliably measured'),
            t('震源深度较浅（深震会破坏该判别）', 'Sources are shallow (deep events break the discriminant)'),
        ],
        breaks: [
            t('深震（> 100 km）面波弱，Δ 天然偏大', 'Deep events (> 100 km) have weak surface waves and naturally large Δ'),
            t('小震级时 M_s 测不准，判别失效', 'At small magnitudes M_s is unreliable and the discriminant fails'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('体波震级测的是短周期振幅', 'Body-wave magnitude measures short-period amplitude'),
            latex: String.raw `m_b \propto \log_{10}A(T\approx 1\ \text{s})` },
        { n: 2, op: 'physics', title: t('面波震级测的是长周期振幅', 'Surface-wave magnitude measures long-period amplitude'),
            latex: String.raw `M_s \propto \log_{10}A(T\approx 20\ \text{s})` },
        { n: 3, op: 'identity', title: t('两者之比由震源谱形状决定', 'Their ratio is set by the source spectral shape'),
            latex: String.raw `\Delta = m_b - M_s \propto \log_{10}\frac{|\dot{M}(1\,\text{Hz})|}{|\dot{M}(0.05\,\text{Hz})|}` },
        { n: 4, op: 'physics', title: t('地震拐角频率低，长周期相对更强', 'Earthquakes have low corner frequencies, so long periods are relatively stronger'),
            latex: String.raw `f_c^{eq} < f_c^{exp} \Longrightarrow \Delta_{eq} < \Delta_{exp}` },
        { n: 5, op: 'result', title: t('形成两个可分的总体', 'Two separable populations result'),
            latex: String.raw `\Delta_{eq} \approx -0.5,\qquad \Delta_{exp} \approx +0.5` },
    ],
    viz: [
        {
            id: 'discriminant-pdf',
            level: 'V1',
            title: t('两类事件的判别量分布', 'Distribution of the discriminant for the two populations'),
            xlabel: t('Δ = m_b − M_s', 'Δ = m_b − M_s'),
            ylabel: t('概率密度', 'probability density'),
            controls: [
                { id: 'sep', label: t('两类中心间距', 'separation of the two centres'), min: 0.2, max: 2.5, step: 0.05, value: 1.2 },
                { id: 'sd', label: t('标准差', 'standard deviation'), min: 0.1, max: 0.8, step: 0.01, value: 0.35 },
            ],
            note: t('两类分布重叠越小判别越可靠；间距缩到与标准差同量级时误判率会急剧上升。', 'Less overlap means more reliable discrimination; when the separation shrinks to the size of the standard deviation, misclassification rises sharply.'),
            compute: (p) => {
                const sep = p['sep'], sd = p['sd'];
                const c1 = -sep / 2;
                const c2 = sep / 2;
                const eq = [];
                const ex = [];
                for (let i = 0; i <= 240; i++) {
                    const x = -2.5 + (i / 240) * 5;
                    eq.push([x, Math.exp(-((x - c1) ** 2) / (2 * sd * sd))]);
                    ex.push([x, Math.exp(-((x - c2) ** 2) / (2 * sd * sd))]);
                }
                return [
                    { label: t('天然地震', 'earthquakes'), color: '#185FA5', points: eq },
                    { label: t('爆炸', 'explosions'), color: '#993C1D', points: ex, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('一次可疑事件', 'A suspicious event'),
        input: t('m_b = 5.2，M_s = 4.1', 'm_b = 5.2, M_s = 4.1'),
        steps: [t('Δ = 5.2 − 4.1 = +1.1', 'Δ = 5.2 − 4.1 = +1.1')],
        output: t('Δ 明显为正，指向爆炸而非天然地震', 'Δ is clearly positive, pointing to an explosion rather than a natural earthquake'),
    },
    links: {
        upstream: [
            { id: 'body-wave-magnitude', note: t('m_b 的定义', 'Definition of m_b') },
            { id: 'surface-wave-magnitude', note: t('M_s 的定义', 'Definition of M_s') },
        ],
        seealso: [{ id: 'dc-iso-clvd-decomposition', note: t('矩张量中的 ISO 成分', 'The ISO component of the moment tensor') }],
    },
    refs: [{ text: 'Båth, M. (1975). Spectral Analysis in Geophysics, ch. 8 (source discrimination)' }],
};
export default mbMsDiscrimination;
//# sourceMappingURL=mb-ms-discrimination.js.map