import { t } from '../../core/types.js';
/** dc-archie-formation-factor */
const dcArchieFormationFactor = {
    id: 'dc-archie-formation-factor',
    name: t('Archie 定律：地层因素与孔隙度', "Archie's Law: Formation Factor vs Porosity"),
    aliases: { zh: ['Archie 第一定律', 'F=a/φ^m'], en: ["Archie's first law", 'formation factor equation'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.STAT'],
        method: ['METH.EM', 'METH.ROCK'],
        quantity: ['Q.ELEC', 'Q.POR'],
        keywords: t('Archie定律 地层因素 孔隙度 胶结指数m a系数', 'Archie law formation factor porosity cementation exponent m'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `F=\frac{a}{\phi^{m}}`,
        variants: [
            { name: t('联立 Ro=Rw·F', 'Combine with Ro=Rw·F'), latex: String.raw `R_{o}=a\,R_{w}/\phi^{m}` },
            { name: t('常见取值', 'Common values'), latex: String.raw `a\approx 0.6-1.0,\quad m\approx 1.3-2.5` },
        ],
    },
    meaning: t('Archie 1942 年由实验归纳：干净砂岩的地层因素 F 随孔隙度 φ 的 m 次方反比下降。胶结好的砂岩 m≈2，疏松砂岩 m≈1.3–1.5，碳酸盐岩 m 可高达 2.5。它把"测到的电阻率"翻译成"岩石里有多少孔隙"，是电法与测井定量解释的基石。', 'Archie (1942) found empirically that the formation factor F decreases as φ to the power m: F=a/φ^m. Well-cemented sandstones have m≈2, unconsolidated sands m≈1.3–1.5, carbonates up to 2.5. It translates measured resistivity into pore volume — the cornerstone of quantitative electrical and log interpretation.'),
    symbols: [
        { sym: 'F', name: t('地层因素', 'formation factor'), unit: '无量纲' },
        { sym: 'a', name: t('岩性系数', 'lithology coefficient'), unit: '无量纲', typical: '0.6 – 1.0' },
        { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲' },
        { sym: 'm', name: t('胶结指数（孔隙结构指数）', 'cementation exponent'), unit: '无量纲', typical: '1.3 – 2.5' },
    ],
    conditions: {
        applies: [t('干净（无泥质）、孔隙连通的砂岩', 'Clean, permeable sandstone')],
        assumes: [t('导电路径只有孔隙水，电子导电矿物可忽略', 'Conduction only via pore water; electronic conductors absent')],
        breaks: [t('含泥质时 S 胶结/泥质导电使 Archie 不成立', 'Shaliness adds a conduction pathway and breaks Archie')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('实验发现 F 与 φ 幂律相关', 'Empirical power law between F and φ'),
            latex: String.raw `F\propto \phi^{-m}` },
        { n: 2, op: 'algebra', title: t('引入岩性系数 a', 'Introduce lithology coefficient a'),
            latex: String.raw `F=a\,\phi^{-m}=a/\phi^{m}` },
        { n: 3, op: 'substitute', title: t('代入 F=Ro/Rw', 'Substitute F=Ro/Rw'),
            latex: String.raw `R_{o}=a\,R_{w}/\phi^{m}` },
    ],
    viz: [
        {
            id: 'archie-f-phi',
            level: 'V1',
            title: t('F–φ 关系（不同胶结指数 m）', 'F vs φ for different cementation exponent m'),
            xlabel: t('孔隙度 φ', 'porosity φ'),
            ylabel: t('地层因素 F', 'formation factor F'),
            controls: [
                { id: 'mval', label: t('胶结指数 m', 'cementation exponent m'), min: 1.3, max: 2.5, step: 0.1, value: 2.0 },
                { id: 'aval', label: t('系数 a', 'coefficient a'), min: 0.6, max: 1.0, step: 0.05, value: 1.0 },
            ],
            compute: (p) => {
                const mval = p['mval'], aval = p['aval'];
                const pts = [];
                for (let i = 1; i <= 200; i++) {
                    const phi = (i / 200) * 0.4;
                    pts.push([phi, aval / Math.pow(phi, mval)]);
                }
                return [{ label: t('F=a/φ^m', 'F=a/φ^m'), color: '#185FA5', points: pts }];
            },
            note: t('孔隙度越高 F 越小；m 越大曲线越陡。低孔隙致密岩 F 可达几十至上百。', 'Higher porosity gives smaller F; larger m steepens the curve. Tight rocks can have F of tens to hundreds.'),
        },
    ],
    links: {
        upstream: [{ id: 'dc-formation-factor-ro-rw' }],
        downstream: [{ id: 'dc-archie-resistivity-ratio' }, { id: 'dc-water-saturation-archie' }],
        seealso: [{ id: 'wl-porosity-from-density' }],
    },
    refs: [{ text: 'Archie (1942), Trans. AIME, 146' }],
};
export default dcArchieFormationFactor;
//# sourceMappingURL=dc-archie-formation-factor.js.map