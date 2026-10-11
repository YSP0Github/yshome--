import { t } from '../../core/types.js';
/** bulk-modulus-lame */
const bulkModulusLame = {
    id: 'bulk-modulus-lame',
    name: t('体积模量与 Lamé 常数的关系', 'Bulk Modulus in Terms of the Lamé Constants'),
    aliases: {
        zh: ['体积模量', '抗压缩模量', 'K = λ + 2μ/3'],
        en: ['bulk modulus', 'incompressibility', 'K = lambda + 2mu/3'],
    },
    node: 'S1.3',
    tags: {
        math: ['MATH.LINALG'],
        method: ['METH.ROCK'],
        quantity: ['Q.MAT'],
        keywords: t('体积模量 K Lamé 常数 不可压缩 静水压 抗压 泊松比 发散', 'bulk modulus Lamé constants incompressibility hydrostatic pressure Poisson ratio divergence'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `K=\lambda+\frac{2}{3}\mu`,
        variants: [
            { name: t('用杨氏模量与泊松比', 'In Young’s modulus and Poisson’s ratio'), latex: String.raw `K=\frac{E}{3(1-2\nu)}` },
            { name: t('用 μ 与 ν（地震学最常用）', 'In μ and ν, the seismological favourite'), latex: String.raw `K=\frac{2\mu(1+\nu)}{3(1-2\nu)}` },
            { name: t('用 P、S 波速度反算', 'Back-solved from P and S velocities'), latex: String.raw `K=\rho\left(\alpha^{2}-\frac{4}{3}\beta^{2}\right)` },
            { name: t('定义的原始形式', 'The original definition'), latex: String.raw `K=-V\frac{\partial P}{\partial V}=\frac{1}{\kappa},\qquad \theta=\varepsilon_{kk}=-\frac{P}{K}` },
        ],
    },
    meaning: t('体积模量只回答一个问题：把这块岩石四面八方均匀挤压，它抵抗得多狠？由于纯压缩同时动用了 λ 和 μ 两个机制，所以 K = λ + 2μ/3 —— 分子上的 2/3 来自三维几何。ν → 0.5 时 K → ∞，这就是"不可压缩"的数学说法：外核液态铁能传 P 波却几乎不可压缩，靠的正是这个巨大的 K。', 'The bulk modulus answers exactly one question: squeeze this rock uniformly from all sides, how hard does it push back? Uniform compression engages both λ and μ, hence K = λ + 2μ/3 — the 2/3 is pure three-dimensional geometry. As ν → 0.5, K → ∞, which is the mathematical way of saying incompressible: liquid iron in the outer core transmits P waves yet barely compresses, thanks to this enormous K.'),
    symbols: [
        { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa', typical: '地壳 50 GPa；外核 600 GPa' },
        { sym: '\\lambda', name: t('Lamé 第一常数', 'first Lamé constant'), unit: 'Pa', typical: '10¹⁰' },
        { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '10¹⁰' },
        { sym: 'P', name: t('静水压力', 'hydrostatic pressure'), unit: 'Pa', typical: '地壳底部约 1 GPa' },
        { sym: '\\theta', name: t('体应变 ε_kk（压缩为负）', 'volumetric strain ε_kk (negative in compression)'), unit: '', dimension: '无量纲' },
        { sym: '\\kappa', name: t('压缩系数 κ = 1/K', 'compressibility κ = 1/K'), unit: 'Pa⁻¹' },
        { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.25' },
    ],
    conditions: {
        applies: [
            t('各向同性线弹性介质，静态或低频极限', 'Isotropic linear elastic media, static or low-frequency limit'),
        ],
        assumes: [
            t('小应变、等温（实验室）或绝热（地震波）条件需区分，二者 K 相差约 1%', 'Small strain; isothermal (lab) and adiabatic (seismic) values differ by about 1% and must not be mixed'),
        ],
        breaks: [
            t('孔隙流体未排干时要用 Biot 的排水/不排水模量', 'Undrained pore fluid requires Biot drained/undrained moduli'),
            t('接近熔融或部分熔融时 K 大幅下降', 'K drops sharply near partial melt'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('施加纯静水压', 'Apply a pure hydrostatic pressure'),
            latex: String.raw `\sigma_{ij}=-P\,\delta_{ij},\qquad \varepsilon_{ij}=-\frac{P}{3K}\,\delta_{ij}`,
            note: t('静水压状态下没有偏应力，只有体积变化。', 'In hydrostatic loading there is no deviatoric stress, only volume change.') },
        { n: 2, op: 'substitute', title: t('代入各向同性 Hooke 定律', 'Substitute into isotropic Hooke’s law'),
            latex: String.raw `\sigma_{ij}=\lambda\,\varepsilon_{kk}\delta_{ij}+2\mu\,\varepsilon_{ij}=\left(\lambda\,\theta-\frac{2\mu P}{3K}\right)\delta_{ij}` },
        { n: 3, op: 'identity', title: t('对指标取迹（i = j 求和）', 'Contract the indices (sum over i = j)'),
            latex: String.raw `\sigma_{kk}=-3P=\left(3\lambda+2\mu\right)\theta`,
            note: t('取迹把六个分量压成一个标量方程，λ 和 μ 以 3λ+2μ 的组合出现。', 'Taking the trace collapses six components into one scalar equation with λ and μ entering as 3λ+2μ.') },
        { n: 4, op: 'substitute', title: t('用体应变的定义 θ = −P/K', 'Use the definition θ = −P/K'),
            latex: String.raw `-3P=\left(3\lambda+2\mu\right)\left(-\frac{P}{K}\right)` },
        { n: 5, op: 'algebra', title: t('约掉 −P 并解出 K', 'Cancel −P and solve for K'),
            latex: String.raw `K=\frac{3\lambda+2\mu}{3}=\lambda+\frac{2}{3}\mu` },
        { n: 6, op: 'result', title: t('换成 μ、ν 表达，看不可压缩极限', 'Rewrite in μ, ν to expose the incompressible limit'),
            latex: String.raw `K=\frac{2\mu(1+\nu)}{3(1-2\nu)}\;\xrightarrow[\nu\to 0.5]{}\;\infty`,
            note: t('分母 1−2ν → 0 意味着：不可压缩物体需要无限大的压力才能改变体积。', 'The vanishing denominator 1−2ν means an incompressible body needs infinite pressure to change its volume.') },
    ],
    viz: [
        {
            id: 'k-vs-nu',
            level: 'V1',
            title: t('固定剪切模量时 K 与 λ 随泊松比的变化', 'K and λ versus Poisson’s ratio at fixed shear modulus'),
            xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
            ylabel: t('模量 (GPa)', 'modulus (GPa)'),
            controls: [
                { id: 'mu', label: t('剪切模量 μ', 'shear modulus μ'), min: 5, max: 120, step: 1, value: 40, unit: 'GPa' },
            ],
            xRange: [0, 0.45],
            note: t('μ 固定时 ν 越大，λ 与 K 都急剧膨胀；ν = 1/3 时 λ = 2μ，ν → 0.5 时两者一起发散。含气砂岩 ν 小，K 也小 —— 这是地震上识别含气层的另一条线索。', 'At fixed μ, larger ν inflates both λ and K dramatically; ν = 1/3 gives λ = 2μ, and both diverge as ν → 0.5. Gas sands have low ν and hence low K — another seismic clue for hydrocarbon detection.'),
            compute: (p) => {
                const mu = p['mu'];
                const kPts = [];
                const lamPts = [];
                const muPts = [];
                for (let i = 0; i <= 180; i++) {
                    const nu = (i / 180) * 0.45;
                    const den = 1 - 2 * nu;
                    kPts.push([nu, (mu * 2 * (1 + nu)) / (3 * den)]);
                    lamPts.push([nu, (mu * 2 * nu) / den]);
                    muPts.push([nu, mu]);
                }
                return [
                    { label: t('体积模量 K', 'bulk modulus K'), color: '#185FA5', points: kPts },
                    { label: t('Lamé 常数 λ', 'Lamé constant λ'), color: '#0F6E56', points: lamPts },
                    { label: t('剪切模量 μ（固定）', 'shear modulus μ (fixed)'), color: '#B4B2A9', dash: true, points: muPts },
                ];
            },
        },
    ],
    links: {
        upstream: [
            { id: 'isotropic-hooke-law', note: t('取迹即可得体积响应', 'taking the trace gives the volumetric response') },
            { id: 'hookes-law-isotropic' },
        ],
        downstream: [
            { id: 'youngs-modulus-lame' },
            { id: 'elastic-moduli-conversions' },
            { id: 'ps-wave-velocities', note: t('α = √((K + 4μ/3)/ρ)', 'α = √((K + 4μ/3)/ρ)') },
        ],
        seealso: [
            { id: 'poissons-ratio-lame' },
            { id: 'adams-williamson', note: t('K 与 ρ 共同决定地球内部的密度剖面', 'K and ρ together determine the Earth’s density profile') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
    ],
};
export default bulkModulusLame;
//# sourceMappingURL=bulk-modulus-lame.js.map