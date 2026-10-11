import { t } from '../../core/types.js';
/** ps-wave-velocities */
const psWaveVelocities = {
    id: 'ps-wave-velocities',
    name: t('P 波与 S 波速度', 'P-wave and S-wave Velocities'),
    aliases: { zh: ['纵横波速度', '体波速度'], en: ['body wave velocities', 'elastic wave speeds'] },
    node: 'S1.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `\alpha=\sqrt{\frac{\lambda+2\mu}{\rho}},\qquad \beta=\sqrt{\frac{\mu}{\rho}}`,
        variants: [
            { name: t('速度比只由泊松比决定', 'The velocity ratio depends on Poisson ratio only'), latex: String.raw `\frac{\alpha}{\beta}=\sqrt{\frac{2(1-\nu)}{1-2\nu}}` },
            { name: t('用体积模量与剪切模量', 'In bulk and shear modulus'), latex: String.raw `\alpha=\sqrt{\frac{K+\frac{4}{3}\mu}{\rho}},\qquad \beta=\sqrt{\frac{\mu}{\rho}}` },
        ],
    },
    meaning: t('P 波能被压缩而不变形，所以多一项 λ+2μ 的助力，永远比 S 波快；S 波只能靠剪切模量 μ 撑着，而流体 μ = 0 —— 这就是外核没有 S 波、因而我们判定它是液态的全部推理。', 'P waves can compress without changing shape, gaining the extra λ+2μ, so they always outrun S waves. S waves rely solely on μ, and fluids have μ = 0 — the entire argument that the outer core is liquid rests on this single line.'),
    symbols: [
        { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s', typical: '1500 – 13700' },
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s', typical: '0 – 7200' },
        { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
        { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
        { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.25' },
    ],
    conditions: {
        applies: [t('均匀各向同性弹性介质', 'Homogeneous isotropic elastic media')],
        assumes: [t('无频散（不含 Q 效应）', 'Non-dispersive, no attenuation effects')],
        breaks: [
            t('外核：μ = 0 ⇒ β = 0，S 波消失', 'Outer core: μ = 0 ⇒ β = 0, S waves vanish'),
            t('各向异性介质中速度随传播方向变化', 'In anisotropic media speed depends on propagation direction'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从无体力 Navier 方程出发', 'Start from the Navier equation without body force'),
            latex: String.raw `\rho\,\ddot{\boldsymbol{u}}=\left(\lambda+2\mu\right)\nabla\left(\nabla\cdot\boldsymbol{u}\right)-\mu\,\nabla\times\left(\nabla\times\boldsymbol{u}\right)` },
        { n: 2, op: 'transform', title: t('Helmholtz 分解：把位移拆成无旋 + 无散', 'Helmholtz decomposition into irrotational + solenoidal parts'),
            latex: String.raw `\boldsymbol{u}=\nabla\phi+\nabla\times\boldsymbol{\psi},\qquad \nabla\cdot\boldsymbol{\psi}=0`,
            note: t('这一步是整段推导的关键一招：它把耦合的方程解耦成两个独立的波方程。', 'This is the crucial move: it decouples one coupled equation into two independent wave equations.') },
        { n: 3, op: 'identity', title: t('两个场各自的算子作用在 p 和 s 部分上', 'Each operator acts on only one part'),
            latex: String.raw `\nabla\times\left(\nabla\times\boldsymbol{u}\right)=-\nabla^{2}\left(\nabla\times\boldsymbol{\psi}\right),\qquad \nabla\left(\nabla\cdot\boldsymbol{u}\right)=\nabla\left(\nabla^{2}\phi\right)` },
        { n: 4, op: 'algebra', title: t('要求无旋部分与无散部分各自成立', 'Require each part to satisfy its own equation'),
            latex: String.raw `\nabla^{2}\phi=\frac{1}{\alpha^{2}}\ddot{\phi},\qquad \nabla^{2}\boldsymbol{\psi}=\frac{1}{\beta^{2}}\ddot{\boldsymbol{\psi}}` },
        { n: 5, op: 'result', title: t('读出两个速度', 'Read off the two speeds'),
            latex: String.raw `\alpha^{2}=\frac{\lambda+2\mu}{\rho},\qquad \beta^{2}=\frac{\mu}{\rho}` },
        { n: 6, op: 'identity', title: t('消去 λ, μ 得到速度比', 'Eliminate λ, μ to get the ratio'),
            latex: String.raw `\frac{\alpha^{2}}{\beta^{2}}=\frac{\lambda+2\mu}{\mu}=\frac{2(1-\nu)}{1-2\nu}`,
            note: t('ν → 0.5 时比值趋于无穷——不可压缩材料里「压缩波」几乎瞬间传遍。', 'As ν → 0.5 the ratio diverges: in an incompressible material the "compressional" wave propagates almost instantly.') },
    ],
    viz: [
        {
            id: 'vpvs-vs-nu',
            level: 'V1',
            title: t('固定 S 波速度时 P 波速度随泊松比变化', 'P velocity versus Poisson ratio at fixed S velocity'),
            xlabel: t('泊松比 ν', "Poisson's ratio ν"),
            ylabel: t('速度 (km/s)', 'velocity (km/s)'),
            controls: [
                { id: 'beta', label: t('S 波速度 β', 'S-wave velocity β'), min: 1.0, max: 4.5, step: 0.05, value: 3.0, unit: 'km/s' },
            ],
            xRange: [0, 0.49],
            note: t('注意 ν = 0.25（泊松固体）时 α = √3 β ≈ 1.732 β。含气砂岩 ν 可低至 0.1，这是 AVO 找气的物理根源。', 'At ν = 0.25 (a Poisson solid) α = √3 β ≈ 1.732 β. Gas sands can reach ν ≈ 0.1 — the physical root of AVO hydrocarbon detection.'),
            compute: (p) => {
                const beta = p['beta'];
                const vp = [];
                const ratio = [];
                for (let i = 0; i <= 240; i++) {
                    const nu = (i / 240) * 0.49;
                    const r = Math.sqrt((2 * (1 - nu)) / (1 - 2 * nu));
                    vp.push([nu, beta * r]);
                    ratio.push([nu, r]);
                }
                return [
                    { label: t('P 波速度 α', 'P velocity α'), color: '#A32D2D', points: vp },
                    { label: t('S 波速度 β（常数）', 'S velocity β (constant)'), color: '#185FA5', points: [[0, beta], [0.49, beta]] },
                    { label: t('速度比 α/β', 'ratio α/β'), color: '#0F6E56', dash: true, points: ratio },
                ];
            },
        },
        {
            id: 'vpvs-vs-density',
            level: 'V1',
            title: t('固定 μ、λ 时速度随密度变化', 'Wave speeds versus density at fixed moduli'),
            xlabel: t('密度 ρ (kg/m³)', 'density ρ (kg/m³)'),
            ylabel: t('速度 (km/s)', 'velocity (km/s)'),
            controls: [
                { id: 'lambda', label: t('Lamé λ', 'Lamé λ'), min: 5, max: 120, step: 1, value: 40, unit: 'GPa' },
                { id: 'mu', label: t('剪切模量 μ', 'shear modulus μ'), min: 5, max: 120, step: 1, value: 45, unit: 'GPa' },
            ],
            xRange: [1500, 4000],
            note: t('速度 ∝ 1/√ρ：密度越大的岩石并不越慢，因为通常它的模量也更大。这就是为什么不能单看密度判断速度。', 'Speed ∝ 1/√ρ: denser rock is not necessarily slower, because its moduli usually rise too.'),
            compute: (p) => {
                const lam = p['lambda'] * 1e9;
                const mu = p['mu'] * 1e9;
                const vp = [];
                const vs = [];
                for (let i = 0; i <= 200; i++) {
                    const rho = 1500 + (i / 200) * 2500;
                    vp.push([rho, Math.sqrt((lam + 2 * mu) / rho) / 1000]);
                    vs.push([rho, Math.sqrt(mu / rho) / 1000]);
                }
                return [
                    { label: t('P 波速度 α', 'P velocity α'), color: '#A32D2D', points: vp },
                    { label: t('S 波速度 β', 'S velocity β'), color: '#185FA5', points: vs },
                ];
            },
        },
    ],
    example: {
        title: t('PREM 下地壳顶部', 'Uppermost lower crust in PREM'),
        input: t('λ = 40 GPa，μ = 45 GPa，ρ = 2900 kg/m³', 'λ = 40 GPa, μ = 45 GPa, ρ = 2900 kg/m³'),
        steps: [
            t('α = √((40+90)×10⁹ / 2900) = 6.74 km/s', 'α = √((40+90)×10⁹ / 2900) = 6.74 km/s'),
            t('β = √(45×10⁹ / 2900) = 3.94 km/s', 'β = √(45×10⁹ / 2900) = 3.94 km/s'),
            t('α/β = 1.71 ⇒ ν ≈ 0.24，接近泊松固体', 'α/β = 1.71 ⇒ ν ≈ 0.24, close to a Poisson solid'),
        ],
        output: t('与实测下地壳速度 6.5–7.0 km/s 相符', 'Consistent with observed lower-crust velocities of 6.5–7.0 km/s'),
    },
    numerics: [
        { note: t('速度比反算泊松比', 'Back-solving Poisson ratio from velocities'), snippet: String.raw `\nu=\frac{\alpha^{2}-2\beta^{2}}{2\left(\alpha^{2}-\beta^{2}\right)}` },
    ],
    links: {
        upstream: [
            { id: 'hookes-law-isotropic', note: t('提供 λ 与 μ', 'supplies λ and μ') },
            { id: 'navier-equation' },
        ],
        downstream: [
            { id: 'snell-ray-parameter' },
            { id: 'acoustic-reflection-coefficient' },
            { id: 'love-wave-dispersion' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
        { text: 'Dziewonski & Anderson (1981), PREM, PEPI 25, 297–356' },
    ],
};
export default psWaveVelocities;
//# sourceMappingURL=ps-wave-velocities.js.map