import { t } from '../../core/types.js';
/** mag-marine-anomaly-stripe */
const magMarineAnomalyStripe = {
    id: 'mag-marine-anomaly-stripe',
    name: t('海底磁异常条带与 Vine–Matthews 假说', 'Marine Magnetic Anomaly Stripes and the Vine–Matthews Hypothesis'),
    aliases: { zh: ['磁条带', '海底扩张证据'], en: ['marine magnetic stripes', 'Vine–Matthews'] },
    node: 'S15.4',
    tags: {
        math: ['MATH.GEOM'],
        method: ['METH.MAG', 'METH.STRUCT'],
        quantity: ['Q.MAG', 'Q.GEOM'],
        keywords: t('海底磁异常条带 Vine Matthews 海底扩张', 'marine magnetic anomaly stripes Vine Matthews seafloor spreading'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta x=2\,v_s\,\Delta t`,
    },
    meaning: t('Vine 与 Matthews 1963 年提出：洋中脊不断涌出玄武岩，冷却时记录当时地磁场方向；海底向两侧匀速扩张，把正反极性的新地壳像磁带一样对称铺开。船测磁力异常于是呈现以脊为轴、正负相间的平行条带——这是海底扩张和板块构造最直接、最漂亮的证据。条带宽度 2Δx = 2 v_s Δt。', 'Vine and Matthews (1963) proposed that basalt erupting at a mid-ocean ridge records the field direction at cooling; as the seafloor spreads symmetrically away, normally and reversely magnetized crust is laid down like a tape. Shipborne magnetometry thus shows alternating positive/negative stripes symmetric about the ridge — the most direct, elegant evidence for seafloor spreading and plate tectonics. Stripe half-width Δx = v_s Δt, full pair width 2Δx = 2 v_s Δt.'),
    symbols: [
        { sym: '\\Delta x', name: t('一条极性条带的半宽', 'half-width of one polarity stripe'), unit: 'km' },
        { sym: 'v_s', name: t('海底半扩张速率', 'half-spreading rate'), unit: 'km/Ma' },
        { sym: '\\Delta t', name: t('该极性段持续时间', 'duration of that polarity chron'), unit: 'Ma' },
    ],
    conditions: {
        applies: [t('洋中脊及其两侧洋盆', 'Mid-ocean ridges and adjacent basins')],
        assumes: [t('扩张速率近似恒定', 'Spreading rate approximately constant')],
        breaks: [t('转换断层、非对称扩张、叠覆扩张', 'Transform faults, asymmetric spreading, overlapping spreads')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('新洋壳在脊处形成并磁化', 'New crust forms and magnetizes at the ridge'),
            latex: String.raw `\text{TRM}\ \text{沿脊对称记录}` },
        { n: 2, op: 'geometry', title: t('以速率 v_s 向两侧推移', 'Carried away at half-rate v_s'),
            latex: String.raw `x=v_s\,t` },
        { n: 3, op: 'algebra', title: t('Δt 时段形成的条带半宽', 'Stripe half-width formed in Δt'),
            latex: String.raw `\Delta x=v_s\,\Delta t` },
        { n: 4, op: 'result', title: t('一对正反条带总宽', 'Full pair of stripes spans 2Δx'),
            latex: String.raw `\Delta x_{\text{pair}}=2\,v_s\,\Delta t` },
    ],
    links: {
        upstream: [{ id: 'mag-geomagnetic-reversal' }, { id: 'mag-thermal-remanence' }],
        seealso: [{ id: 'mag-depositional-remanence' }],
    },
    refs: [{ text: 'Vine & Matthews (1963), Nature; Heirtzler et al. (1968)' }],
};
export default magMarineAnomalyStripe;
//# sourceMappingURL=mag-marine-anomaly-stripe.js.map