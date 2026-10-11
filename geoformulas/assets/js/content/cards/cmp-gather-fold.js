import { t } from '../../core/types.js';
/** cmp-gather-fold */
const cmpGatherFold = {
    id: 'cmp-gather-fold',
    name: t('CMP 道集与覆盖次数', 'CMP Gathers & Fold'),
    aliases: { zh: ['覆盖次数', '共中心点道集', '面元'], en: ['fold', 'CMP gather', 'bin'] },
    node: 'S3.4',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.GEOM', 'Q.AMP'],
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `F = \frac{N_{ch}\,\Delta g}{2\,\Delta s}`,
        variants: [
            { name: t('面元宽度', 'Bin width'), latex: String.raw `b = \frac{\Delta g}{2}` },
            { name: t('CMP 位置', 'CMP position'), latex: String.raw `x_{CMP} = \frac{x_{source} + x_{receiver}}{2}` },
            { name: t('叠加对随机噪声的改善', 'Stacking gain against random noise'), latex: String.raw `\frac{S}{N}\bigg|_{stack} = \sqrt{F}\,\frac{S}{N}\bigg|_{single}` },
        ],
    },
    meaning: t('把不同炮、不同道的记录按「中点位置」重新归拢，就得到 CMP 道集 —— 同一地下点被看了很多次。看多少次就是覆盖次数。覆盖次数越高，随机噪声被压制得越好（按 √F 改善），但采集成本也越高。', 'Sorting traces from different shots and receivers by their midpoint position gives a CMP gather — the same subsurface point seen many times. How many times is the fold. Higher fold suppresses random noise better (improving as √F), but costs more to acquire.'),
    symbols: [
        { sym: 'F', name: t('覆盖次数', 'fold'), unit: '无量纲', typical: '12 – 240' },
        { sym: 'N_{ch}', name: t('接收道数', 'number of channels'), unit: '道', typical: '48 – 10000' },
        { sym: '\\Delta g', name: t('道间距（检波器间距）', 'group (receiver) interval'), unit: 'm', typical: '12.5 – 100' },
        { sym: '\\Delta s', name: t('炮点距', 'shot interval'), unit: 'm', typical: '12.5 – 100' },
        { sym: 'b', name: t('CMP 面元宽度', 'CMP bin width'), unit: 'm' },
    ],
    conditions: {
        applies: [t('反射地震采集设计与叠加质量预估', 'Reflection acquisition design and stack quality prediction')],
        assumes: [
            t('单边（端点）排列、规则观测系统', 'End-on spread with a regular geometry'),
            t('炮点距是道间距的整数倍或半整数倍', 'The shot interval is an integer or half-integer multiple of the group interval'),
        ],
        breaks: [
            t('不规则观测系统（海底电缆、节点仪）需要逐道统计实际覆盖', 'Irregular geometries (OBC, nodes) require counting fold trace by trace'),
            t('三维观测系统的覆盖次数还取决于接收线距与炮线距', 'In 3D the fold also depends on receiver-line and shot-line spacing'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('CMP 位置的定义', 'Definition of the CMP position'),
            latex: String.raw `x_{CMP} = \frac{x_s + x_r}{2}` },
        { n: 2, op: 'geometry', title: t('相邻道的 CMP 相差半个道间距', 'Adjacent traces differ by half a group interval'),
            latex: String.raw `b = \frac{\Delta g}{2}` },
        { n: 3, op: 'algebra', title: t('在长度 L 内数一数道数与面元数', 'Count traces and bins over a length L'),
            latex: String.raw `N_{\text{traces}} = \frac{L}{\Delta s}N_{ch},\qquad N_{\text{bins}} = \frac{L}{\Delta g/2} = \frac{2L}{\Delta g}` },
        { n: 4, op: 'algebra', title: t('两者相除', 'Divide the two'),
            latex: String.raw `F = \frac{N_{ch}L/\Delta s}{2L/\Delta g} = \frac{N_{ch}\,\Delta g}{2\,\Delta s}` },
        { n: 5, op: 'result', title: t('叠加对随机噪声的改善', 'Stacking gain against random noise'),
            latex: String.raw `\frac{S}{N}\bigg|_{stack} = \sqrt{F}\,\frac{S}{N}\bigg|_{single}` },
    ],
    viz: [
        {
            id: 'fold-vs-shot',
            level: 'V1',
            title: t('覆盖次数随炮点距的变化', 'Fold versus shot interval'),
            xlabel: t('炮点距 Δs (m)', 'shot interval Δs (m)'),
            ylabel: t('覆盖次数 F', 'fold F'),
            controls: [
                { id: 'nch', label: t('接收道数 N_ch', 'channels N_ch'), min: 24, max: 1000, step: 4, value: 240 },
                { id: 'dg', label: t('道间距 Δg (m)', 'group interval Δg (m)'), min: 12.5, max: 100, step: 2.5, value: 25 },
            ],
            note: t('炮点距减半，覆盖次数翻倍 —— 采集成本也随之翻倍。', 'Halving the shot interval doubles the fold — and doubles the acquisition cost.'),
            compute: (p) => {
                const nch = p['nch'], dg = p['dg'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const ds = 12.5 + (i / 200) * 87.5;
                    pts.push([ds, (nch * dg) / (2 * ds)]);
                }
                return [{ label: t('F(Δs)', 'F(Δs)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('240 道、25 m 道距、50 m 炮距', '240 channels, 25 m groups, 50 m shots'),
        input: t('N_ch = 240，Δg = 25 m，Δs = 50 m', 'N_ch = 240, Δg = 25 m, Δs = 50 m'),
        steps: [t('F = 240 × 25 / (2 × 50) = 60', 'F = 240 × 25 / (2 × 50) = 60')],
        output: t('60 次覆盖，随机噪声压制 √60 ≈ 7.7 倍', '60-fold coverage, suppressing random noise by √60 ≈ 7.7×'),
    },
    links: {
        upstream: [{ id: 'hyperbolic-moveout-offset', note: t('道集内的时距关系', 'The moveout within a gather') }],
        downstream: [{ id: 'velocity-analysis', note: t('道集是速度分析的输入', 'The gather feeds velocity analysis') }],
        seealso: [{ id: 'stacking-response', note: t('叠加对信号的影响', 'How stacking affects the signal') }],
    },
    refs: [{ text: 'Yilmaz, Seismic Data Analysis, ch. 1 & 4' }],
};
export default cmpGatherFold;
//# sourceMappingURL=cmp-gather-fold.js.map