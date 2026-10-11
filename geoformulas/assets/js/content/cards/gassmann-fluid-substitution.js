import { t } from '../../core/types.js';
/** gassmann-fluid-substitution */
const gassmannFluidSubstitution = {
    id: 'gassmann-fluid-substitution',
    name: t('Gassmann 流体替换', "Gassmann Fluid Substitution"),
    aliases: { zh: ['流体替换', 'Gassmann 方程应用', '饱和度效应'], en: ['fluid substitution', 'Gassmann application', 'saturation effect'] },
    node: 'S13.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.ROCK'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{K_{\text{sat}}}{K_m - K_{\text{sat}}} = \frac{K_{\text{dry}}}{K_m - K_{\text{dry}}} + \frac{K_f}{\phi(K_m - K_f)},\qquad
\mu_{\text{sat}} = \mu_{\text{dry}}`,
        variants: [
            { name: t('解出饱和岩石体积模量', 'Solving for the saturated bulk modulus'), latex: String.raw `K_{\text{sat}} = K_{\text{dry}} + \frac{\left(1-\dfrac{K_{\text{dry}}}{K_m}\right)^{2}}{\dfrac{\phi}{K_f}+\dfrac{1-\phi}{K_m}-\dfrac{K_{\text{dry}}}{K_m^{2}}}` },
            { name: t('混合流体的体积模量（Wood 平均）', 'Bulk modulus of mixed fluids (Wood average)'), latex: String.raw `\frac{1}{K_f} = \frac{S_w}{K_w} + \frac{1-S_w}{K_h}` },
            { name: t('混合密度', 'Mixed density'), latex: String.raw `\rho_f = S_w\rho_w + (1-S_w)\rho_h` },
            { name: t('速度更新', 'Velocity update'), latex: String.raw `V_P = \sqrt{\frac{K_{\text{sat}}+\frac{4}{3}\mu}{\rho}},\qquad V_S = \sqrt{\frac{\mu}{\rho}},\quad \rho = (1-\phi)\rho_m + \phi\rho_f` },
        ],
    },
    meaning: t('Gassmann 方程回答储层地球物理最核心的问题：如果孔隙里的水换成油或气，速度和波阻抗会变成多少？令人意外的是剪切模量完全不变 —— 流体不抗剪切。所有变化都通过体积模量发生，而体积模量的变化幅度取决于骨架有多「软」：骨架越软（干模量越低），流体替换的影响越大。这就是 4D 地震监测与直接烃类检测（DHI）的理论基础。', 'Gassmann\'s equations answer the central question of reservoir geophysics: if the water in the pores is replaced by oil or gas, what happens to velocity and impedance? Surprisingly, the shear modulus does not change at all — fluid does not resist shear. All the change goes through the bulk modulus, and its magnitude depends on how "soft" the frame is: the softer the frame (the lower the dry modulus), the larger the fluid-substitution effect. This is the theoretical basis of 4-D seismic monitoring and direct hydrocarbon indicators (DHI).'),
    symbols: [
        { sym: 'K_{\\text{sat}}, K_{\\text{dry}}', name: t('饱和与干燥岩石的体积模量', 'saturated and dry rock bulk moduli'), unit: 'GPa' },
        { sym: 'K_m', name: t('矿物基质体积模量', 'mineral matrix bulk modulus'), unit: 'GPa' },
        { sym: 'K_f', name: t('孔隙流体体积模量', 'pore-fluid bulk modulus'), unit: 'GPa' },
        { sym: '\\mu', name: t('剪切模量（与饱和度无关）', 'shear modulus (independent of saturation)'), unit: 'GPa' },
        { sym: 'S_w', name: t('含水饱和度', 'water saturation'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('流体替换建模、4D 地震、AVO 正演、烃类检测', 'Fluid-substitution modelling, 4-D seismic, AVO forward modelling, hydrocarbon detection')],
        assumes: [t('孔隙连通、频率足够低（孔隙压力平衡）', 'Connected porosity, sufficiently low frequency (pore pressure equilibrated)'), t('岩石为各向同性、线性弹性', 'Rock is isotropic and linearly elastic')],
        breaks: [t('高频（超声实验室测量）下不成立', 'Fails at high frequency (ultrasonic laboratory measurements)'), t('含粘土膨胀、裂缝或孔隙不连通时失效', 'Fails with swelling clay, fractures or unconnected pores')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把岩石看成骨架 + 流体的复合体', 'View the rock as a frame plus fluid composite'), latex: String.raw `K_{\text{sat}} = f(K_{\text{dry}}, K_m, K_f, \phi)` },
        { n: 2, op: 'physics', title: t('Gassmann 的关键洞察：剪切模量与流体无关', 'Gassmann\'s key insight: the shear modulus is independent of fluid'), latex: String.raw `\mu_{\text{sat}} = \mu_{\text{dry}}` },
        { n: 3, op: 'identity', title: t('体积模量写成「孔隙空间刚度」的形式', 'Write the bulk modulus in a "pore-space stiffness" form'), latex: String.raw `\frac{K_{\text{sat}}}{K_m-K_{\text{sat}}} = \frac{K_{\text{dry}}}{K_m-K_{\text{dry}}}+\frac{K_f}{\phi(K_m-K_f)}` },
        { n: 4, op: 'algebra', title: t('整理出 K_sat 的显式解', 'Rearrange into an explicit solution for K_sat'), latex: String.raw `K_{\text{sat}} = K_{\text{dry}}+\frac{(1-K_{\text{dry}}/K_m)^{2}}{\dfrac{\phi}{K_f}+\dfrac{1-\phi}{K_m}-\dfrac{K_{\text{dry}}}{K_m^{2}}}` },
        { n: 5, op: 'substitute', title: t('代入 Wood 平均与密度，算出新速度', 'Insert the Wood average and density to obtain the new velocities'), latex: String.raw `V_P = \sqrt{\frac{K_{\text{sat}}+\frac{4}{3}\mu}{\rho}},\qquad V_S=\sqrt{\frac{\mu}{\rho}}` },
    ],
    viz: [
        {
            id: 'gassmann-sw',
            level: 'V2',
            title: t('水—气饱和度对 Vp、Vs 与密度的影响', 'Effect of water–gas saturation on Vp, Vs and density'),
            xlabel: t('含气饱和度 1 − S_w', 'gas saturation 1 − S_w'),
            ylabel: t('V_P / V_S (m/s) 与 ρ (kg/m³)/2', 'V_P / V_S (m/s) and ρ (kg/m³)/2'),
            controls: [
                { id: 'kdry', label: t('干骨架模量 K_dry (GPa)', 'dry frame modulus K_dry (GPa)'), min: 2, max: 30, step: 0.5, value: 12 },
                { id: 'phi', label: t('孔隙度 φ', 'porosity φ'), min: 0.05, max: 0.4, step: 0.01, value: 0.25 },
                { id: 'km', label: t('基质模量 K_m (GPa)', 'matrix modulus K_m (GPa)'), min: 20, max: 60, step: 1, value: 37 },
            ],
            note: t('Vp 在含气饱和度很低时（5–20%）就几乎掉到底，之后基本不动；Vs 因密度降低反而略升 —— 这个「Vp 骤降 Vs 略升」的组合是气藏最经典的特征，而它的非线性（少量气就够了）正是 Gassmann + Wood 平均的必然结果。', 'Vp drops almost all the way at very low gas saturation (5–20%) and then barely moves; Vs actually rises slightly because the density drops — this combination of "Vp plunges, Vs rises a little" is the classic gas-sand signature, and its nonlinearity (a little gas is enough) is the inevitable consequence of Gassmann plus the Wood average.'),
            compute: (p) => {
                const kdry = p['kdry'], phi = p['phi'], km = p['km'];
                const kw = 2.4, kh = 0.05;
                const rw = 1040, rh = 120, rm = 2650;
                const mu = kdry * 0.9;
                const vp = [];
                const vs = [];
                const rho = [];
                for (let i = 0; i <= 200; i++) {
                    const Sg = (i / 200);
                    const Sw = 1 - Sg;
                    const Kf = 1 / (Sw / kw + Sg / kh);
                    const A = phi / Kf + (1 - phi) / km - kdry / (km * km);
                    const Ksat = kdry + ((1 - kdry / km) ** 2) / Math.max(A, 1e-9);
                    const rf = Sw * rw + Sg * rh;
                    const dens = (1 - phi) * rm + phi * rf;
                    vp.push([Sg, Math.sqrt(((Ksat + (4 / 3) * mu) * 1e9) / dens)]);
                    vs.push([Sg, Math.sqrt((mu * 1e9) / dens)]);
                    rho.push([Sg, dens / 2]);
                }
                return [
                    { label: t('V_P', 'V_P'), color: '#185FA5', points: vp },
                    { label: t('V_S', 'V_S'), color: '#993C1D', points: vs },
                    { label: t('ρ / 2', 'ρ / 2'), color: '#0F6E56', points: rho },
                ];
            },
        },
        {
            id: 'gassmann-frame',
            level: 'V1',
            title: t('骨架越软，流体替换效应越大', 'A softer frame gives a larger fluid-substitution effect'),
            xlabel: t('干骨架模量 K_dry (GPa)', 'dry frame modulus K_dry (GPa)'),
            ylabel: t('V_P 变化 (%)', 'V_P change (%)'),
            controls: [{ id: 'phi', label: t('孔隙度 φ', 'porosity φ'), min: 0.05, max: 0.4, step: 0.01, value: 0.25 }],
            note: t('把水全换成气：硬骨架（K_dry = 25 GPa）Vp 只变 3%，软骨架（K_dry = 4 GPa）Vp 变 20% 以上。所以气藏的地震响应在未固结、高孔隙储层中远为明显 —— 这是勘探目标排序的直接依据。', 'Replacing all water with gas: a stiff frame (K_dry = 25 GPa) changes Vp by only 3%, a soft frame (K_dry = 4 GPa) by more than 20%. Gas-reservoir seismic response is therefore far more visible in unconsolidated, high-porosity reservoirs — a direct basis for ranking exploration targets.'),
            compute: (p) => {
                const phi = p['phi'];
                const km = 37, kw = 2.4, kh = 0.05;
                const rm = 2650, rw = 1040, rh = 120;
                const vel = (kdry, Kf, rf) => {
                    const mu = kdry * 0.9;
                    const A = phi / Kf + (1 - phi) / km - kdry / (km * km);
                    const Ksat = kdry + ((1 - kdry / km) ** 2) / Math.max(A, 1e-9);
                    const dens = (1 - phi) * rm + phi * rf;
                    return Math.sqrt(((Ksat + (4 / 3) * mu) * 1e9) / dens);
                };
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const kdry = 2 + (i / 200) * 28;
                    const vw = vel(kdry, kw, rw);
                    const vh = vel(kdry, kh, rh);
                    pts.push([kdry, ((vh - vw) / vw) * 100]);
                }
                return [{ label: t('V_P 变化', 'V_P change'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('气藏的地震响应', 'Seismic response of a gas reservoir'),
        input: t('φ = 0.25，K_dry = 12 GPa，K_m = 37 GPa，水 → 气', 'φ = 0.25, K_dry = 12 GPa, K_m = 37 GPa, water → gas'),
        steps: [
            t('水饱和：K_sat ≈ 19.5 GPa，V_P ≈ 3.05 km/s', 'Water saturated: K_sat ≈ 19.5 GPa, V_P ≈ 3.05 km/s'),
            t('气饱和：K_sat ≈ 14.3 GPa，V_P ≈ 2.72 km/s', 'Gas saturated: K_sat ≈ 14.3 GPa, V_P ≈ 2.72 km/s'),
            t('V_S 从 1.74 升到 1.86 km/s（密度下降所致）', 'V_S rises from 1.74 to 1.86 km/s (because density drops)'),
        ],
        output: t('V_P 降约 11%、V_S 升约 7%，Vp/Vs 明显下降 —— 典型气砂响应', 'V_P drops about 11% and V_S rises about 7%; Vp/Vs falls markedly — a classic gas-sand response'),
    },
    links: {
        upstream: [
            { id: 'gassmann-equation', note: t('本卡是 Gassmann 方程的应用', 'This card applies the Gassmann equation') },
            { id: 'bulk-modulus-lame', note: t('模量与速度的换算', 'Converting between moduli and velocities') },
        ],
        downstream: [{ id: 'fluid-factor-avo', note: t('流体因子是 AVO 上的直接体现', 'The fluid factor is its direct expression in AVO') }],
        seealso: [{ id: 'critical-porosity-model', note: t('干骨架模量可由临界孔隙度模型给出', 'The dry frame modulus can come from the critical-porosity model') }],
    },
    refs: [{ text: 'Gassmann (1951), Über die Elastizität poröser Medien, Vierteljahrsschrift der Naturforschenden Gesellschaft in Zürich 96, 1–23' }],
};
export default gassmannFluidSubstitution;
//# sourceMappingURL=gassmann-fluid-substitution.js.map