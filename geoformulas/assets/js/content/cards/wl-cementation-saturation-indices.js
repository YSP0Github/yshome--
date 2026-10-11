import { t } from '../../core/types.js';
/** wl-cementation-saturation-indices */
const wlCementationSaturationIndices = {
    id: 'wl-cementation-saturation-indices',
    name: t('胶结指数 m 与饱和度指数 n', 'Cementation Exponent m and Saturation Exponent n'),
    aliases: { zh: ['m n 参数', 'Archie 指数'], en: ['cementation exponent m', 'saturation exponent n'] },
    node: 'S17.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.LOG', 'METH.ROCK'],
        quantity: ['Q.POR'],
        keywords: t('胶结指数m 饱和度指数n Archie参数 胶结 孔隙结构', 'cementation exponent m saturation exponent n Archie parameters'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `F=\frac{a}{\phi^{m}}\;,\qquad I=S_{w}^{-n}`, variants: [
            { name: t('典型取值', 'Typical values'), latex: String.raw `m:1.3\ \text{(疏松)}-2.5\ \text{(碳酸岩)},\ n:2` },
        ],
    },
    meaning: t('Archie 公式里 m 描述孔隙结构（胶结程度）对地层因素 F 的影响，n 描述含水饱和度对电阻率的影响。m、n 通常由岩心实验测定，经验上取 m≈2、n≈2。选错 m、n 会直接使 Sw 计算偏差很大——它是 Archie 解释中最敏感也最难确定的参数。', 'In Archie, m describes how pore geometry (cementation) affects F, and n how water saturation affects resistivity. They are measured on core; empirically m≈2, n≈2. Picking wrong m or n biases Sw strongly — they are the most sensitive and hardest-to-constrain parameters in Archie interpretation.'),
    symbols: [
        { sym: 'm', name: t('胶结指数', 'cementation exponent'), unit: '无量纲', typical: '1.3 – 2.5' },
        { sym: 'n', name: t('饱和度指数', 'saturation exponent'), unit: '无量纲', typical: '≈ 2' },
        { sym: 'a', name: t('岩性系数', 'lithology coefficient'), unit: '无量纲', typical: '0.6 – 1.0' },
    ],
    conditions: {
        applies: [t('由岩心实验或邻井标定', 'Calibrated by core or offset wells')],
    },
    links: {
        upstream: [{ id: 'dc-archie-formation-factor' }, { id: 'dc-archie-resistivity-ratio' }],
        seealso: [{ id: 'wl-archie-water-saturation' }],
    },
    refs: [{ text: 'Archie (1942); 岩心标定见 Bassiouni (1994)' }],
};
export default wlCementationSaturationIndices;
//# sourceMappingURL=wl-cementation-saturation-indices.js.map