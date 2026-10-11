import { t } from '../../core/types.js';
/** gravity-free-air-gradient */
const gravityFreeAirGradient = {
    id: 'gravity-free-air-gradient',
    name: t('自由空气垂直重力梯度', 'Free-air Vertical Gravity Gradient'),
    aliases: { zh: ['自由空气梯度', '2g/R'], en: ['free-air gradient', 'vertical gravity gradient'] },
    node: 'S14.2',
    tags: {
        math: ['MATH.DIFF', 'MATH.APPROX'],
        method: ['METH.GRAV'],
        quantity: ['Q.GRAV', 'Q.GEOM'],
        keywords: t('自由空气梯度 2g/R 高度 0.3086', 'free-air gradient height 0.3086 mGal/m'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{dg}{dh}\approx-\frac{2g}{R}\approx-0.3086\ \mathrm{mGal/m}`,
    },
    meaning: t('离开地面高度 h 处的引力按 1/r² 衰减，对半径 R 的地球求微分即得垂直梯度约 −2g/R ≈ −0.3086 mGal/m：每升高 1 m，重力减少约 0.3 mGal。这就是"自由空气"校正的物理来源——只考虑升高后离地球更远，不考虑中间岩石的引力。', 'Gravitational attraction decays as 1/r²; differentiating for an Earth of radius R gives the vertical gradient −2g/R ≈ −0.3086 mGal/m: each metre of height reduces gravity by about 0.3 mGal. This is the physical basis of the free-air correction — it accounts only for being farther from Earth, ignoring the rock in between.'),
    symbols: [
        { sym: 'dg/dh', name: t('垂直重力梯度（向上为正）', 'vertical gravity gradient (up positive)'), unit: 'mGal/m', typical: '−0.3086' },
        { sym: 'g', name: t('当地重力加速度', 'local gravitational acceleration'), unit: 'm/s²', typical: '9.8' },
        { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'm', typical: '6.371×10⁶' },
        { sym: 'h', name: t('高出基准面的高度', 'height above datum'), unit: 'm' },
    ],
    conditions: {
        applies: [t('近地表、小高度近似', 'Near-surface, small-height approximation')],
        assumes: [t('地球球对称、无中间物质', 'Spherical Earth, no intervening mass')],
        breaks: [t('高山地区叠加岩石质量，需布格校正', 'Mountain regions add rock mass; Bouguer correction needed')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('地表外引力 g=GM/r²', 'Exterior gravity g=GM/r²'),
            latex: String.raw `g(r)=\frac{GM}{r^{2}},\quad GM=gR^{2}` },
        { n: 2, op: 'algebra', title: t('对 r 求导', 'Differentiate with respect to r'),
            latex: String.raw `\frac{dg}{dr}=-\frac{2GM}{r^{3}}=-\frac{2gR^{2}}{R^{3}}=-\frac{2g}{R}` },
        { n: 3, op: 'substitute', title: t('代入数值', 'Plug in numbers'),
            latex: String.raw `\frac{2g}{R}=\frac{2\times9.8}{6.371\times10^{6}}\approx3.076\times10^{-6}\ \mathrm{s^{-2}}` },
        { n: 4, op: 'result', title: t('换算为 mGal/m', 'Convert to mGal/m'),
            latex: String.raw `\frac{dg}{dh}\approx-0.3086\ \mathrm{mGal/m}` },
    ],
    links: {
        upstream: [{ id: 'gravity-normal-formula' }],
        downstream: [{ id: 'gravity-free-air-correction', note: t('梯度乘以高度得自由空气校正', 'Gradient × height gives free-air correction') }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, §3.5' }],
};
export default gravityFreeAirGradient;
//# sourceMappingURL=gravity-free-air-gradient.js.map