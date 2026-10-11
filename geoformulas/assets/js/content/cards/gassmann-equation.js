import { t } from '../../core/types.js';
/** gassmann-equation */
const gassmannEquation = {
    id: 'gassmann-equation',
    name: t('Gassmann 方程（流体替换）', 'Gassmann’s Equations (Fluid Substitution)'),
    aliases: { zh: ['Gassmann 流体替换'], en: ['Gassmann equation', 'fluid substitution', 'Biot-Gassmann'] },
    node: 'S13.2',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.ROCK', 'METH.EXPL'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `K_{\mathrm{sat}}=K_{\mathrm{dry}}+\frac{\left(1-\dfrac{K_{\mathrm{dry}}}{K_0}\right)^{2}}{\dfrac{\phi}{K_f}+\dfrac{1-\phi}{K_0}-\dfrac{K_{\mathrm{dry}}}{K_0^{2}}},\qquad \mu_{\mathrm{sat}}=\mu_{\mathrm{dry}}`,
        variants: [
            { name: t('饱和后的纵波速度', 'P-wave velocity after saturation'), latex: String.raw `v_P=\sqrt{\frac{K_{\mathrm{sat}}+\tfrac{4}{3}\mu_{\mathrm{sat}}}{\rho_{\mathrm{sat}}}}` },
            { name: t('饱和岩石密度', 'Density of the saturated rock'), latex: String.raw `\rho_{\mathrm{sat}}=(1-\phi)\rho_0+\phi\rho_f` },
            { name: t('剪切模量不变是核心结论', 'The invariance of shear modulus is the core result'), latex: String.raw `\mu_{\mathrm{sat}}=\mu_{\mathrm{dry}}\quad(\text{流体不抗剪})` },
        ],
    },
    meaning: t('Gassmann 方程回答油藏地球物理最核心的问题：「如果孔隙里的水换成油或气，地震速度会变成多少」。它的两个关键结论是：剪切模量与流体无关，体积模量随流体可压缩性变化。这直接解释了为什么含气砂岩的 P 波速度骤降而 S 波速度几乎不变 —— 这正是 AVO 与 4D 监测的物理根据。', 'Gassmann’s equations answer the central question of reservoir geophysics: what happens to seismic velocity if the pore water is replaced by oil or gas. Two key results: the shear modulus is independent of the fluid, while the bulk modulus varies with fluid compressibility. This explains directly why a gas sand shows a sharp drop in P velocity with almost no change in S velocity — the physical basis of AVO and 4D monitoring.'),
    symbols: [
        { sym: 'K_{\\mathrm{sat}},K_{\\mathrm{dry}}', name: t('饱和与干燥岩石的体积模量', 'bulk modulus of saturated and dry rock'), unit: 'Pa' },
        { sym: 'K_0', name: t('矿物基质的体积模量', 'bulk modulus of the mineral matrix'), unit: 'Pa', typical: '3.7×10¹⁰（石英）' },
        { sym: 'K_f', name: t('孔隙流体的体积模量', 'bulk modulus of the pore fluid'), unit: 'Pa', typical: '2.2×10⁹（水）/ 0.02×10⁹（气）' },
        { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲' },
        { sym: '\\mu', name: t('剪切模量（饱不饱都一样）', 'shear modulus (same saturated or dry)'), unit: 'Pa' },
    ],
    conditions: {
        applies: [t('各向同性、均质、连通孔隙的岩石在低频极限下', 'Isotropic, homogeneous rocks with connected pores, at the low-frequency limit')],
        assumes: [
            t('频率足够低，孔隙压力在整个孔隙空间平衡（松弛状态）', 'Frequency is low enough that pore pressure equilibrates across the pore space (relaxed state)'),
            t('流体不与骨架发生化学作用', 'The fluid does not chemically interact with the frame'),
        ],
        breaks: [
            t('高频（超声实验室测量）下不成立，需 Biot 理论', 'It fails at high (ultrasonic laboratory) frequencies, where Biot theory is needed'),
            t('含粘土、微裂缝时干燥模量本身难以测定', 'With clay or microcracks the dry modulus itself is hard to determine'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('流体不抗剪，故 μ 不变', 'Fluids do not resist shear, so μ is unchanged'),
            latex: String.raw `\mu_{\mathrm{sat}}=\mu_{\mathrm{dry}}` },
        { n: 2, op: 'physics', title: t('引入孔隙压力增量与体积应变的关系', 'Relate the pore-pressure increment to volumetric strain'),
            latex: String.raw `\delta p_f=-\frac{K_f}{\phi}\,\delta\phi_{\text{流体}}` },
        { n: 3, op: 'algebra', title: t('把骨架与流体的压缩性串联', 'Put frame and fluid compressibility in series'),
            latex: String.raw `\frac{1}{K_{\mathrm{sat}}}=\frac{1}{K_{\mathrm{dry}}}+\text{流体项}` },
        { n: 4, op: 'result', title: t('整理得到 Gassmann 关系', 'Rearrangement gives the Gassmann relation'),
            latex: String.raw `K_{\mathrm{sat}}=K_{\mathrm{dry}}+\frac{\left(1-\dfrac{K_{\mathrm{dry}}}{K_0}\right)^{2}}{\dfrac{\phi}{K_f}+\dfrac{1-\phi}{K_0}-\dfrac{K_{\mathrm{dry}}}{K_0^{2}}}` },
    ],
    links: {
        upstream: [{ id: 'bulk-modulus-lame', note: t('K 与 Lamé 常数的关系', 'Relation between K and the Lamé constants') }],
        seealso: [{ id: 'wyllie-time-average', note: t('更粗糙的孔隙度—速度关系', 'A cruder porosity–velocity relation') }],
    },
    refs: [{ text: 'Gassmann (1951), Vierteljahrsschrift der Naturforschenden Gesellschaft in Zürich, 96' }, { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook, §6' }],
};
export default gassmannEquation;
//# sourceMappingURL=gassmann-equation.js.map