import { t } from '../../core/types.js';
/** gravity-terrain-correction */
const gravityTerrainCorrection = {
    id: 'gravity-terrain-correction',
    name: t('地形校正', 'Terrain Correction'),
    aliases: { zh: ['地形改正', 'TC'], en: ['terrain correction'] },
    node: 'S14.3',
    tags: {
        math: ['MATH.TRANSFORM', 'MATH.GEOM'],
        method: ['METH.GRAV'],
        quantity: ['Q.GRAV', 'Q.GEOM'],
        keywords: t('地形校正 山地 山谷 布格', 'terrain correction mountains valleys Bouguer'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\delta g_{\text{T}}=G\rho\int\!\!\int\!\!\int\frac{z}{(x^{2}+y^{2}+z^{2})^{3/2}}\,dxdydz`,
        variants: [
            { name: t('扇形/锥环近似（Hammer 模板）', 'sector/annulus approximation (Hammer chart)'), latex: String.raw `\delta g_{\text{T}}\approx G\rho\sum_{i}\Delta\varphi_{i}\left(\sqrt{R_{i}^{2}+z_{i}^{2}}-R_{i}-|h_{i}|\right)` },
        ],
    },
    meaning: t('布格校正把中间层当成无限水平板，但真实地形有山头和山谷：山头比板面高出的部分向上（抵消一部分引力），山谷比板面低的部分少了一块向下的引力。两种情况都使观测值偏小，因此地形校正恒为正、必须加回。它是山区重力解释精度的决定因素。', 'The Bouguer correction treats the layer as an infinite slab, but real terrain has hills and valleys: material above the slab pulls upward (reducing g), while valleys remove downward mass. Both effects make the observation smaller, so the terrain correction is always positive and must be added back. It dominates the accuracy of mountain gravity interpretation.'),
    symbols: [
        { sym: '\\delta g_{\\text{T}}', name: t('地形校正量（恒为正）', 'terrain correction (always positive)'), unit: 'mGal' },
        { sym: '\\rho', name: t('表层岩石密度', 'surface rock density'), unit: 'g/cm³' },
        { sym: 'R_i', name: t('扇形环带半径', 'sector annulus radius'), unit: 'm' },
        { sym: 'h_i', name: t('环带平均高程差', 'mean elevation difference of sector'), unit: 'm' },
    ],
    conditions: {
        applies: [t('起伏地形、山区、丘陵', 'Rugged terrain, mountains, hills')],
        assumes: [t('密度均匀、地形数字化', 'Uniform density, digital terrain model')],
        breaks: [t('覆盖层密度未知时引入误差', 'Error when overburden density is unknown')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('高出板面的质量元 dm', 'Mass element dm above the slab plane'),
            latex: String.raw `dm=\rho\,dV` },
        { n: 2, op: 'physics', title: t('它对测点的引力向上分量', 'Its upward component on the station'),
            latex: String.raw `dg_{\text{up}}=G\,\rho\,\frac{z}{(x^{2}+y^{2}+z^{2})^{3/2}}\,dV` },
        { n: 3, op: 'transform', title: t('山谷缺少的质量同理为负贡献', 'Valley missing mass gives analogous negative contribution'),
            latex: String.raw `\delta g_{\text{T}}=G\rho\int\!\!\int\!\!\int\frac{z}{(x^{2}+y^{2}+z^{2})^{3/2}}\,dV` },
        { n: 4, op: 'result', title: t('数值上用 Hammer 环带求和', 'Numerically summed with Hammer sectors'),
            latex: String.raw `\delta g_{\text{T}}>0\ \Rightarrow\ g_{\text{obs}}\ \text{加回}\ \delta g_{\text{T}}` },
    ],
    links: {
        upstream: [{ id: 'gravity-bouguer-simple' }],
        downstream: [{ id: 'gravity-bouguer-complete', note: t('完全布格 = 布格板 − 地形', 'Complete Bouguer = slab − terrain') }],
    },
    refs: [{ text: 'Hammer (1939), Geophysics; Telford et al., §3.5' }],
};
export default gravityTerrainCorrection;
//# sourceMappingURL=gravity-terrain-correction.js.map