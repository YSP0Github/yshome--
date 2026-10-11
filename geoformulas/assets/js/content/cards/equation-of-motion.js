import { t } from '../../core/types.js';
/** equation-of-motion */
const equationOfMotion = {
    id: 'equation-of-motion',
    name: t('弹性介质的运动方程（动量守恒）', 'Equation of Motion for an Elastic Medium (Momentum Balance)'),
    aliases: {
        zh: ['动量守恒方程', '柯西运动方程', '应力散度方程'],
        en: ['equation of motion', 'momentum balance', 'Cauchy equation of motion'],
    },
    node: 'S1.4',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('运动方程 动量守恒 应力散度 体力 柯西方程 角动量 应力对称 高斯定理', 'equation of motion momentum balance stress divergence body force Cauchy angular momentum stress symmetry Gauss theorem'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\rho\,\ddot{u}_i=\frac{\partial\sigma_{ij}}{\partial x_j}+f_i`,
        variants: [
            { name: t('矢量形式', 'Vector form'), latex: String.raw `\rho\,\ddot{\boldsymbol{u}}=\nabla\cdot\boldsymbol{\sigma}+\boldsymbol{f}` },
            { name: t('积分形式（真正的动量守恒）', 'Integral form (momentum conservation proper)'), latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}t}\int_V\rho\,\dot{u}_i\,\mathrm{d}V=\oint_S \sigma_{ij}n_j\,\mathrm{d}S+\int_V f_i\,\mathrm{d}V` },
            { name: t('静力平衡（加速度为零）', 'Static equilibrium (zero acceleration)'), latex: String.raw `\frac{\partial\sigma_{ij}}{\partial x_j}+f_i=0` },
            { name: t('含初应力与重力时的常见写法', 'Common form with gravity as body force'), latex: String.raw `\rho\,\ddot{u}_i=\partial_j\sigma_{ij}+\rho\,g_i` },
        ],
    },
    meaning: t('这就是连续介质版的牛顿第二定律：单位体积的质量乘加速度 = 表面邻居给的应力散度 + 外力。它是所有地震波模拟真正要离散的那一条方程；Hooke 定律只是往里填 σ 的内容，Navier 方程则是填完之后的样子。顺带一提，把角动量也守恒一遍，就能推出应力张量必须对称（σ_ij = σ_ji）—— 这条性质不是假设，而是结论。', 'Newton’s second law for a continuum: mass per unit volume times acceleration equals the divergence of stress exerted by neighbouring material plus external force. This is the equation every seismic wave simulator actually discretises; Hooke’s law merely fills in σ, and the Navier equation is what you get after filling it in. Incidentally, imposing angular momentum balance too forces the stress tensor to be symmetric (σ_ij = σ_ji) — a conclusion, not an assumption.'),
    symbols: [
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '1800 – 3300（地壳）' },
        { sym: '\\ddot{u}_i', name: t('位移的二阶时间导数（加速度）', 'second time derivative of displacement, i.e. acceleration'), unit: 'm/s²' },
        { sym: '\\sigma_{ij}', name: t('应力张量', 'stress tensor'), unit: 'Pa' },
        { sym: 'f_i', name: t('体力密度（此处按单位体积计，N/m³）', 'body force density (per unit volume here, N/m³)'), unit: 'N/m³', typical: '重力 ρg ≈ 2.7×10⁴' },
        { sym: 'g_i', name: t('重力加速度矢量', 'gravitational acceleration vector'), unit: 'm/s²', typical: '9.8' },
        { sym: 'n_j', name: t('边界面外法向单位矢量', 'outward unit normal of the bounding surface'), unit: '', dimension: '无量纲' },
        { sym: 'V,S', name: t('任意材料体及其边界面', 'arbitrary material volume and its boundary surface'), unit: 'm³, m²' },
    ],
    conditions: {
        applies: [
            t('任意连续介质（固体、流体皆可），不要求各向同性', 'Any continuum, solid or fluid; isotropy is not required'),
            t('小变形或当前构型下的 Cauchy 应力表述', 'Small deformation, or Cauchy stress in the current configuration'),
        ],
        assumes: [
            t('连续介质假设：尺度远大于颗粒与裂隙', 'Continuum hypothesis: scales far larger than grains and cracks'),
            t('无体力偶，否则应力不必对称', 'No body couples; otherwise stress need not be symmetric'),
        ],
        breaks: [
            t('Cosserat 介质等带内禀偶应力的理论', 'Cosserat-type media with intrinsic couple stresses'),
            t('强非均质性（裂隙网络）需升尺度到等效连续介质', 'Strong heterogeneity such as fracture networks requires upscaling to an equivalent continuum'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('取一块跟随材料运动的体元 V', 'Take a volume element V moving with the material'),
            latex: String.raw `\boldsymbol{P}=\int_V \rho\,\dot{\boldsymbol{u}}\,\mathrm{d}V`,
            note: t('把 V 的动量写成密度乘速度的积分。', 'Write the momentum of V as the integral of density times velocity.') },
        { n: 2, op: 'physics', title: t('动量定理：动量的变化率 = 外力之和', 'Momentum theorem: rate of momentum change equals the sum of external forces'),
            latex: String.raw `\frac{\mathrm{d}\boldsymbol{P}}{\mathrm{d}t}=\oint_S \boldsymbol{\sigma}\cdot\boldsymbol{n}\,\mathrm{d}S+\int_V \boldsymbol{f}\,\mathrm{d}V=\oint_S \sigma_{ij}n_j\,\mathrm{d}S+\int_V f_i\,\mathrm{d}V`,
            note: t('第一项是邻居通过界面施加的牵引力，第二项是重力之类的体力。', 'The first term is the traction exerted by neighbours across the interface, the second is the body force such as gravity.') },
        { n: 3, op: 'transform', title: t('用 Gauss 定理把面积分变成体积分', 'Convert the surface integral with Gauss’ theorem'),
            latex: String.raw `\oint_S \sigma_{ij}n_j\,\mathrm{d}S=\int_V \partial_j\sigma_{ij}\,\mathrm{d}V` },
        { n: 4, op: 'algebra', title: t('合并到一个积分里，并利用 V 的任意性', 'Collect into one integral and use the arbitrariness of V'),
            latex: String.raw `\int_V\left(\rho\,\ddot{u}_i-\partial_j\sigma_{ij}-f_i\right)\mathrm{d}V=0\;\Rightarrow\; \rho\,\ddot{u}_i=\partial_j\sigma_{ij}+f_i`,
            note: t('被积函数必须在每点为零，这就是"局部形式"。', 'The integrand must vanish pointwise; that is the local form.') },
        { n: 5, op: 'physics', title: t('再把角动量也守恒一遍', 'Now impose angular momentum balance as well'),
            latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}t}\int_V \boldsymbol{x}\times\rho\dot{\boldsymbol{u}}\,\mathrm{d}V=\oint_S \boldsymbol{x}\times\left(\boldsymbol{\sigma}\cdot\boldsymbol{n}\right)\mathrm{d}S+\int_V \boldsymbol{x}\times\boldsymbol{f}\,\mathrm{d}V` },
        { n: 6, op: 'result', title: t('结论：应力张量对称', 'Conclusion: the stress tensor is symmetric'),
            latex: String.raw `\epsilon_{ijk}\sigma_{jk}=0\;\Rightarrow\; \sigma_{ij}=\sigma_{ji}`,
            note: t('这里 ε_ijk 是 Levi-Civita 符号（非应变张量）。没有体力偶时，六个剪应力分量实际上只有三个独立。', 'Here ε_ijk is the Levi-Civita symbol, not the strain tensor. With no body couples, the six shear components reduce to three independent ones.') },
    ],
    links: {
        upstream: [
            { id: 'strain-tensor', note: t('应变与位移的关系，后续代入用得上', 'the strain–displacement relation needed later') },
            { id: 'isotropic-hooke-law', note: t('把 σ 换成位移的桥梁', 'the bridge that replaces σ by displacement') },
        ],
        downstream: [
            { id: 'navier-equation', note: t('代入 Hooke 定律后即得', 'obtained by substituting Hooke’s law') },
            { id: 'navier-equation-expanded' },
            { id: 'ps-potential-decoupling' },
        ],
        seealso: [
            { id: 'ps-wave-velocities' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
    ],
};
export default equationOfMotion;
//# sourceMappingURL=equation-of-motion.js.map