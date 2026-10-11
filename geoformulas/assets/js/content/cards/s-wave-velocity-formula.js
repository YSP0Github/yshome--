import { t } from '../../core/types.js';
/** s-wave-velocity-formula */
const sWaveVelocityFormula = {
    id: 's-wave-velocity-formula',
    name: t('S 波速度公式', 'The S-Wave Velocity Formula'),
    aliases: {
        zh: ['S 波速度', '横波速度', 'β = √(μ/ρ)'],
        en: ['S-wave velocity', 'shear velocity', 'beta from shear modulus'],
    },
    node: 'S1.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.ROCK', 'METH.STRUCT'],
        quantity: ['Q.VEL', 'Q.MAT'],
        keywords: t('S 波速度 横波 剪切模量 密度 外核 液态 流体 μ=0 部分熔融 泊松比', 'S-wave velocity shear wave shear modulus density outer core liquid fluid partial melt Poisson ratio'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\beta=\sqrt{\frac{\mu}{\rho}}`,
        variants: [
            { name: t('反解剪切模量（地震学最常用的方向）', 'Inverted for the shear modulus, the usual direction in seismology'), latex: String.raw `\mu=\rho\,\beta^{2}` },
            { name: t('用杨氏模量与泊松比', "In Young's modulus and Poisson's ratio"), latex: String.raw `\beta=\sqrt{\frac{E}{2\rho\left(1+\nu\right)}}` },
            { name: t('用 P 波速度与泊松比', 'From the P velocity and Poisson’s ratio'), latex: String.raw `\beta=\alpha\sqrt{\frac{1-2\nu}{2\left(1-\nu\right)}}` },
            { name: t('流体的判决式', 'The verdict for fluids'), latex: String.raw `\mu=0\ \text{(流体)}\;\Rightarrow\; \beta=0` },
        ],
    },
    meaning: t('S 波只靠剪切模量撑着，与体积模量毫无关系——因为纯剪切不改变体积。这条性质是地震学最锋利的一把刀：观测到某层没有 S 波通过，就断定那里 μ = 0，即液态。外核是液态铁这一结论，全部推理就落在这一行公式上。与此相应，β 对温度、部分熔融和裂隙流体远比 α 敏感，是监测火山与地热储层的首选观测量。', 'S waves rest entirely on the shear modulus and care nothing about the bulk modulus, because pure shear changes no volume. That makes this formula the sharpest knife in seismology: if no S wave passes through a layer, then μ = 0 there, so it is liquid. The conclusion that the outer core is liquid iron rests entirely on this one line. Correspondingly, β is far more sensitive than α to temperature, partial melt and crack fluids, making it the preferred observable for monitoring volcanoes and geothermal reservoirs.'),
    symbols: [
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s', typical: '地壳 1500–4000；地幔 4500–7200；外核 0' },
        { sym: '\\mu', name: t('剪切模量（也记作 G）', 'shear modulus, also G'), unit: 'Pa', typical: '地壳 10–80 GPa；流体 0' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '1000 – 3300' },
        { sym: 'E', name: t('杨氏模量', "Young's modulus"), unit: 'Pa' },
        { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲' },
        { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [
            t('均匀各向同性线弹性固体中的体波', 'Body waves in homogeneous isotropic linear elastic solids'),
            t('μ > 0；液态与气态介质无 S 波', 'μ > 0; liquids and gases carry no S waves'),
        ],
        assumes: [
            t('无频散、无衰减；骨架为连续介质', 'Non-dispersive, non-attenuating, and the skeleton behaves as a continuum'),
            t('骨架连通；悬浮颗粒–流体混合物需有效介质理论', 'The skeleton is connected; suspended mixtures need effective-medium theory'),
        ],
        breaks: [
            t('外核：μ = 0 ⇒ β = 0，S 波完全消失', 'Outer core: μ = 0 ⇒ β = 0, S waves vanish entirely'),
            t('部分熔融或高孔隙压力可使 β 下降 10%–30% 而 α 几乎不变', 'Partial melt or high pore pressure can drop β by 10%–30% while α barely moves'),
            t('裂隙/各向异性造成 S 波分裂，β 随偏振方向不同', 'Cracks and anisotropy cause shear-wave splitting, so β depends on polarisation'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设一个纯剪切平面波', 'Take a pure shear plane wave'),
            latex: String.raw `\boldsymbol{u}=\left(0,u_2\left(x_1,t\right),0\right)\;\Rightarrow\; \varepsilon_{12}=\frac{1}{2}\frac{\partial u_2}{\partial x_1},\qquad \theta=\nabla\cdot\boldsymbol{u}=0`,
            note: t('体应变为零：纯剪切不压缩、只改变形状，因此 λ 完全不参与。', 'Volumetric strain vanishes: pure shear changes shape without compressing, so λ plays no role at all.') },
        { n: 2, op: 'physics', title: t('本构关系只留下剪切项', 'Only the shear term survives in the constitutive law'),
            latex: String.raw `\sigma_{12}=2\mu\,\varepsilon_{12}=\mu\,\frac{\partial u_2}{\partial x_1}` },
        { n: 3, op: 'physics', title: t('代入运动方程', 'Insert into the equation of motion'),
            latex: String.raw `\rho\,\ddot{u}_2=\frac{\partial\sigma_{12}}{\partial x_1}=\mu\,\frac{\partial^{2}u_2}{\partial x_1^{2}}` },
        { n: 4, op: 'identity', title: t('对比标准波动方程', 'Compare with the standard wave equation'),
            latex: String.raw `\ddot{u}_2=\beta^{2}\,\partial_1^{2}u_2\;\Rightarrow\; \beta^{2}=\frac{\mu}{\rho}` },
        { n: 5, op: 'substitute', title: t('换成 E、ν 与 α 的形式', 'Rewrite using E, ν and α'),
            latex: String.raw `\mu=\frac{E}{2\left(1+\nu\right)},\qquad \beta=\alpha\sqrt{\frac{1-2\nu}{2\left(1-\nu\right)}}` },
        { n: 6, op: 'result', title: t('读出物理判决：μ = 0 即无 S 波', 'Read off the physical verdict: μ = 0 means no S wave'),
            latex: String.raw `\mu\to 0\ \Rightarrow\ \beta\to 0,\qquad \frac{\alpha}{\beta}\to\infty`,
            note: t('地震学正是靠"S 波阴影区"判定外核为液态。', 'The S-wave shadow zone is exactly how seismology decided the outer core is liquid.') },
    ],
    viz: [
        {
            id: 'beta-vs-mu',
            level: 'V1',
            title: t('S 波速度随剪切模量与密度的变化', 'S-wave velocity versus shear modulus and density'),
            xlabel: t('剪切模量 μ (GPa)', 'shear modulus μ (GPa)'),
            ylabel: t('S 波速度 β (km/s)', 'S-wave velocity β (km/s)'),
            controls: [
                { id: 'rho', label: t('密度 ρ', 'density ρ'), min: 1500, max: 3500, step: 25, value: 2700, unit: 'kg/m³' },
            ],
            xRange: [1, 200],
            note: t('β ∝ √μ：剪切模量翻四倍速度才翻一倍，所以"岩石变硬"对 S 波速度的影响是相当平缓的。密度大的岩石（虚线 ρ = 3300）在同一 μ 下明显更慢。μ → 0 的端点就是流体：曲线从原点出发，S 波在此归零。', 'β ∝ √μ: quadrupling the shear modulus only doubles the speed, so "stiffer rock" raises β rather gently. Denser rock (dashed, ρ = 3300) is markedly slower at the same μ. The μ → 0 endpoint is the fluid case: the curve starts at the origin, where S waves die.'),
            compute: (p) => {
                const rho = p['rho'];
                const bPts = [];
                const bRef = [];
                for (let i = 0; i <= 200; i++) {
                    const mu = 1 + (i / 200) * 199;
                    bPts.push([mu, Math.sqrt((mu * 1e9) / rho) / 1000]);
                    bRef.push([mu, Math.sqrt((mu * 1e9) / 3300) / 1000]);
                }
                return [
                    { label: t('β = √(μ/ρ)（当前密度）', 'β = √(μ/ρ) at the chosen density'), color: '#185FA5', points: bPts },
                    { label: t('β（参考：ρ = 3300 kg/m³）', 'β (reference: ρ = 3300 kg/m³)'), color: '#B4B2A9', dash: true, points: bRef },
                ];
            },
        },
    ],
    links: {
        upstream: [
            { id: 'ps-potential-decoupling', note: t('β 从矢量势方程中浮现', 'β emerges from the vector-potential equation') },
            { id: 'elastic-moduli-conversions' },
        ],
        downstream: [
            { id: 'velocity-ratio-poisson' },
            { id: 'p-and-s-impedance' },
            { id: 'shuey-approximation', note: t('AVO 对 β 的对比最敏感', 'AVO is most sensitive to the β contrast') },
        ],
        seealso: [
            { id: 'ps-wave-velocities', note: t('α 与 β 的主条目', 'the main entry for α and β') },
            { id: 'p-wave-velocity-formula' },
            { id: 'love-wave-dispersion' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
    ],
};
export default sWaveVelocityFormula;
//# sourceMappingURL=s-wave-velocity-formula.js.map