import { t } from '../../core/types.js';
/** p-and-s-impedance */
const pAndSImpedance = {
    id: 'p-and-s-impedance',
    name: t('P 波与 S 波的波阻抗', 'P-wave and S-wave Impedance'),
    aliases: {
        zh: ['波阻抗', '声阻抗', 'Z = ρα'],
        en: ['seismic impedance', 'acoustic impedance', 'Z = rho v'],
    },
    node: 'S1.5',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.EXPL', 'METH.STRUCT'],
        quantity: ['Q.VEL', 'Q.MAT'],
        keywords: t('波阻抗 声阻抗 Z=ρc 反射系数 阻抗差 亮点 振幅 AVO 密度 速度乘积', 'impedance acoustic impedance Z = rho c reflection coefficient impedance contrast bright spot amplitude AVO'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `Z_P=\rho\,\alpha,\qquad Z_S=\rho\,\beta`,
        variants: [
            { name: t('用弹性模量写出（不含速度）', 'In elastic moduli, without velocities'), latex: String.raw `Z_P=\sqrt{\rho\left(\lambda+2\mu\right)}=\sqrt{\rho\left(K+\frac{4}{3}\mu\right)},\qquad Z_S=\sqrt{\rho\,\mu}` },
            { name: t('垂直入射的反射系数', 'Normal-incidence reflection coefficient'), latex: String.raw `R=\frac{Z_2-Z_1}{Z_2+Z_1},\qquad T=\frac{2Z_1}{Z_2+Z_1}` },
            { name: t('平面波中应力与质点速度的关系', 'Stress versus particle velocity in a plane wave'), latex: String.raw `\left|\sigma\right|=Z\left|\dot{u}\right|` },
            { name: t('单位换算（工业界常以 10⁶ 为单位）', 'Unit conversion (industry often works in units of 10⁶)'), latex: String.raw `\left[Z\right]=1\ \mathrm{Pa\cdot s/m}=1\ \mathrm{kg\,m^{-2}\,s^{-1}},\qquad Z\approx 4\times10^{6}\text{--}2\times10^{7}\ \text{in the crust}` },
        ],
    },
    meaning: t('波阻抗是介质对波动的"阻碍程度"，等于密度乘速度。它之所以重要，是因为界面反射的强弱只由阻抗差决定：阻抗完全相同的两个地层，无论岩性差别多大，都不会产生反射——这是"为什么有些地质界面在地震上看不见"的全部答案。工业上说的"亮点"（强振幅）本质上就是阻抗差大的界面。', 'Impedance measures how strongly a medium resists wave motion; it is density times velocity. It matters because reflection strength at an interface depends only on the impedance contrast: two layers with identical impedance produce no reflection at all, however different their lithology — the complete answer to why some geological boundaries are invisible seismically. Industrially, a "bright spot" is nothing but an interface with a large impedance contrast.'),
    symbols: [
        { sym: 'Z_P', name: t('P 波阻抗', 'P-wave impedance'), unit: 'Pa·s/m = kg/(m²·s)', typical: '砂泥岩 4×10⁶ – 2×10⁷' },
        { sym: 'Z_S', name: t('S 波阻抗', 'S-wave impedance'), unit: 'Pa·s/m', typical: '约为 Z_P 的一半' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '1800 – 3300' },
        { sym: '\\alpha,\\beta', name: t('P 波与 S 波速度', 'P- and S-wave velocities'), unit: 'm/s' },
        { sym: '\\dot{u}', name: t('质点速度（位移的时间导数）', 'particle velocity, the time derivative of displacement'), unit: 'm/s', typical: '10⁻⁸ – 10⁻²' },
        { sym: 'R,T', name: t('垂直入射的反射系数与透射系数', 'normal-incidence reflection and transmission coefficients'), unit: '', dimension: '无量纲', typical: '|R| = 0.02 – 0.3' },
    ],
    conditions: {
        applies: [
            t('各向同性弹性介质中的平面波（局部可取为平面波）', 'Plane waves in isotropic elastic media, at least locally'),
            t('垂直入射时的反射系数公式；斜入射需 Zoeppritz 或 Shuey 近似', 'The reflection formula is for normal incidence; oblique incidence needs Zoeppritz or the Shuey approximation'),
        ],
        assumes: [
            t('界面两侧介质各自均匀，界面尺度远小于波长', 'Media are homogeneous on each side and the interface is thin compared with the wavelength'),
            t('无衰减、无频散（否则阻抗为复数）', 'No attenuation or dispersion, otherwise the impedance is complex'),
        ],
        breaks: [
            t('强衰减介质：阻抗变复数，反射系数也变复数（相位不为 0 或 π）', 'Strongly attenuating media: complex impedance and complex reflection coefficient'),
            t('薄层（厚度小于 1/4 波长）：不再是单界面反射，而是调谐效应', 'Thin beds below a quarter wavelength no longer behave as a single interface but show tuning'),
            t('流体层：Z_S = 0，S 波完全反射', 'Fluid layers: Z_S = 0 and S waves are totally reflected'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('取一个沿 +x₁ 传播的平面 P 波', 'Take a plane P wave travelling in the +x₁ direction'),
            latex: String.raw `u_1=f\left(t-\frac{x_1}{\alpha}\right),\qquad \dot{u}_1=f'\left(t-\frac{x_1}{\alpha}\right)` },
        { n: 2, op: 'geometry', title: t('求应变', 'Compute the strain'),
            latex: String.raw `\varepsilon_{11}=\frac{\partial u_1}{\partial x_1}=-\frac{1}{\alpha}\,f'=-\frac{\dot{u}_1}{\alpha}` },
        { n: 3, op: 'physics', title: t('本构关系给出应力', 'The constitutive law gives the stress'),
            latex: String.raw `\sigma_{11}=\left(\lambda+2\mu\right)\varepsilon_{11}=\rho\alpha^{2}\left(-\frac{\dot{u}_1}{\alpha}\right)=-\rho\alpha\,\dot{u}_1`,
            note: t('负号只反映传播方向的约定，物理内容在其模量上。', 'The minus sign only reflects the propagation-direction convention; the physics lies in the magnitude.') },
        { n: 4, op: 'identity', title: t('定义波阻抗为应力与质点速度之比', 'Define impedance as the ratio of stress to particle velocity'),
            latex: String.raw `Z_P=\frac{\left|\sigma_{11}\right|}{\left|\dot{u}_1\right|}=\rho\,\alpha=\sqrt{\rho\left(\lambda+2\mu\right)}` },
        { n: 5, op: 'substitute', title: t('S 波完全同理', 'The S-wave case is identical'),
            latex: String.raw `\sigma_{12}=\mu\,\frac{\partial u_2}{\partial x_1}=-\rho\beta\,\dot{u}_2\;\Rightarrow\; Z_S=\rho\,\beta=\sqrt{\rho\mu}` },
        { n: 6, op: 'result', title: t('界面上的连续性给出反射系数', 'Continuity across an interface gives the reflection coefficient'),
            latex: String.raw `\dot{u},\sigma\ \text{连续}\;\Rightarrow\; R=\frac{Z_2-Z_1}{Z_2+Z_1}`,
            note: t('Z₁ = Z₂ 时 R = 0：再大的岩性差异也不产生反射。', 'When Z₁ = Z₂, R vanishes: no reflection, however different the lithologies.') },
    ],
    viz: [
        {
            id: 'impedance-vs-depth',
            level: 'V1',
            title: t('简化地壳剖面中波阻抗随深度的增长', 'Impedance growth with depth in a simplified crustal section'),
            xlabel: t('深度 z (km)', 'depth z (km)'),
            ylabel: t('波阻抗 (10⁶ kg·m⁻²·s⁻¹)', 'impedance (10⁶ kg·m⁻²·s⁻¹)'),
            controls: [
                { id: 'alpha0', label: t('地表 P 波速度', 'surface P velocity'), min: 3.0, max: 7.0, step: 0.1, value: 5.8, unit: 'km/s' },
                { id: 'grad', label: t('速度梯度', 'velocity gradient'), min: 0, max: 0.1, step: 0.005, value: 0.04, unit: 'km/s per km' },
                { id: 'vpvs', label: t('速度比 α/β', 'velocity ratio α/β'), min: 1.5, max: 2.2, step: 0.01, value: 1.75 },
            ],
            xRange: [0, 40],
            note: t('速度随深度增加、密度也随压实增加，两个因素叠加使阻抗单调上升，这就是为什么深部界面天然产生更强的反射。Z_S 大致是 Z_P 的一半左右：同样的岩性差异，在 S 波剖面上往往比 P 波剖面上"更显眼"。', 'Velocity increases with depth and density increases with compaction; together they make impedance rise monotonically, which is why deep interfaces naturally produce stronger reflections. Z_S is roughly half of Z_P: the same lithology contrast often stands out more clearly on an S section than on a P section.'),
            compute: (p) => {
                const alpha0 = p['alpha0'];
                const grad = p['grad'];
                const vpvs = p['vpvs'];
                const zp = [];
                const zs = [];
                for (let i = 0; i <= 200; i++) {
                    const z = (i / 200) * 40;
                    const rho = 2400 + 15 * z;
                    const alpha = (alpha0 + grad * z) * 1000;
                    const beta = alpha / vpvs;
                    zp.push([z, (rho * alpha) / 1e6]);
                    zs.push([z, (rho * beta) / 1e6]);
                }
                return [
                    { label: t('Z_P = ρα', 'Z_P = ρα'), color: '#185FA5', points: zp },
                    { label: t('Z_S = ρβ', 'Z_S = ρβ'), color: '#0F6E56', points: zs },
                ];
            },
        },
    ],
    links: {
        upstream: [
            { id: 'p-wave-velocity-formula' },
            { id: 's-wave-velocity-formula' },
            { id: 'ps-wave-velocities' },
        ],
        downstream: [
            { id: 'acoustic-reflection-coefficient', note: t('反射系数由阻抗差直接给出', 'the reflection coefficient follows directly from the impedance contrast') },
            { id: 'shuey-approximation', note: t('斜入射时 Z 的角色由 Zoeppritz 接管', 'at oblique incidence Zoeppritz takes over the role of Z') },
            { id: 'snell-ray-parameter' },
        ],
        seealso: [
            { id: 'reflection-hyperbola' },
            { id: 'nmo-correction' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2, §5.1' },
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §3.3' },
    ],
};
export default pAndSImpedance;
//# sourceMappingURL=p-and-s-impedance.js.map