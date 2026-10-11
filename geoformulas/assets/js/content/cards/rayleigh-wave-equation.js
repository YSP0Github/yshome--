import { t } from '../../core/types.js';
/** rayleigh-wave-equation */
const rayleighWaveEquation = {
    id: 'rayleigh-wave-equation',
    name: t('Rayleigh 波特征方程', 'The Rayleigh-wave Characteristic Equation'),
    aliases: { zh: ['Rayleigh 方程', '瑞利波频散方程'], en: ['Rayleigh equation', 'Rayleigh dispersion function'] },
    node: 'S5.2',
    tags: {
        math: ['MATH.ROOT', 'MATH.ALGEBRA', 'MATH.DIFF'],
        method: ['METH.SURF'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\left(2-\frac{c^{2}}{\beta^{2}}\right)^{2}=4\sqrt{1-\frac{c^{2}}{\alpha^{2}}}\,\sqrt{1-\frac{c^{2}}{\beta^{2}}}`,
        variants: [
            { name: t('写成求根函数', 'As a root-finding function'), latex: String.raw `F(c)=\left(2-\frac{c^{2}}{\beta^{2}}\right)^{2}-4\sqrt{1-\frac{c^{2}}{\alpha^{2}}}\sqrt{1-\frac{c^{2}}{\beta^{2}}}=0` },
            { name: t('存在条件', 'Existence condition'), latex: String.raw `0<c<\beta<\alpha` },
        ],
    },
    meaning: t('Rayleigh 波是 P 波与 SV 波在自由表面耦合出的一种沿界面滑行的波，质点做逆椭圆运动。这个特征方程就是「自由表面法向与切向应力同时为零」这个边界条件逼出来的：只有特定的相速度 c 才能同时满足两个应力条件，所以 Rayleigh 波在均匀半空间里根本不频散 —— 它的速度只由介质的泊松比决定。', 'A Rayleigh wave is a P–SV coupled wave gliding along a free surface, with retrograde elliptical particle motion. The characteristic equation follows from requiring both normal and tangential traction to vanish at the free surface: only particular phase velocities satisfy both conditions at once. Consequently a Rayleigh wave in a uniform half-space is not dispersive at all — its speed is set entirely by Poisson’s ratio.'),
    symbols: [
        { sym: 'c', name: t('Rayleigh 波相速度', 'Rayleigh-wave phase velocity'), unit: 'm/s', typical: '0.86β – 0.95β' },
        { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s' },
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s' },
        { sym: '\\nu', name: t('泊松比', 'Poisson’s ratio'), unit: '无量纲', typical: '0.25' },
    ],
    conditions: {
        applies: [t('均匀弹性半空间表面的 Rayleigh 波', 'Rayleigh waves at the surface of a uniform elastic half-space')],
        assumes: [
            t('均匀、各向同性、弹性半空间', 'Uniform, isotropic, elastic half-space'),
            t('自由表面，无覆盖层', 'A free surface with no overlying layer'),
        ],
        breaks: [t('有覆盖层时 Rayleigh 波强烈频散，需用层状介质频散方程', 'With a surficial layer Rayleigh waves are strongly dispersive and the layered dispersion function is required')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设沿 x 传播、沿 z 衰减的势函数', 'Potentials propagating in x and decaying in z'),
            latex: String.raw `\phi=A\,e^{-k q_{\alpha} z}e^{i k(x-ct)},\qquad \psi=B\,e^{-k q_{\beta} z}e^{i k(x-ct)}`,
            note: t('q_α = √(1 − c²/α²)，q_β = √(1 − c²/β²)，两者都要求 c < β < α。', 'q_α = √(1 − c²/α²) and q_β = √(1 − c²/β²), both requiring c < β < α.') },
        { n: 2, op: 'physics', title: t('自由表面法向应力为零', 'Normal traction vanishes at the free surface'),
            latex: String.raw `\sigma_{zz}\big|_{z=0}=0` },
        { n: 3, op: 'physics', title: t('自由表面切向应力为零', 'Tangential traction vanishes at the free surface'),
            latex: String.raw `\sigma_{xz}\big|_{z=0}=0` },
        { n: 4, op: 'algebra', title: t('两个方程关于 A、B 齐次', 'Two homogeneous equations in A and B'),
            latex: String.raw `\begin{aligned} \left(2-\frac{c^{2}}{\beta^{2}}\right)A-2i\,q_{\beta}\,B&=0\\ 2i\,q_{\alpha}\,A+\left(2-\frac{c^{2}}{\beta^{2}}\right)B&=0 \end{aligned}` },
        { n: 5, op: 'algebra', title: t('非零解要求行列式为零', 'A non-trivial solution requires the determinant to vanish'),
            latex: String.raw `\left(2-\frac{c^{2}}{\beta^{2}}\right)^{2}-4\,q_{\alpha}\,q_{\beta}=0` },
        { n: 6, op: 'result', title: t('得到 Rayleigh 方程', 'The Rayleigh equation'),
            latex: String.raw `\boxed{\left(2-\frac{c^{2}}{\beta^{2}}\right)^{2}=4\sqrt{1-\frac{c^{2}}{\alpha^{2}}}\sqrt{1-\frac{c^{2}}{\beta^{2}}}}` },
    ],
    viz: [
        {
            id: 'rayleigh-root',
            level: 'V1',
            title: t('求根函数 F(c) 与 Rayleigh 波速度', 'The root-finding function F(c) and the Rayleigh velocity'),
            xlabel: t('c/β', 'c/β'),
            ylabel: t('F(c)', 'F(c)'),
            controls: [
                { id: 'nu', label: t('泊松比 ν', 'Poisson’s ratio ν'), min: 0.05, max: 0.45, step: 0.01, value: 0.25 },
            ],
            compute: (p) => {
                const nu = p['nu'];
                const r = (1 - 2 * nu) / (2 * (1 - nu));
                const ratio2 = r * r;
                const beta = 1;
                const alpha = beta / Math.sqrt(r);
                const F = (c) => {
                    const qa = Math.sqrt(Math.max(0, 1 - (c * c) / (alpha * alpha)));
                    const qb = Math.sqrt(Math.max(0, 1 - (c * c) / (beta * beta)));
                    const t = 2 - (c * c) / (beta * beta);
                    return t * t - 4 * qa * qb;
                };
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const c = 0.02 + (i / 400) * 0.97;
                    pts.push([c, F(c)]);
                }
                // 在 (0.5, 0.99) 上找根
                let lo = 0.5, hi = 0.999;
                let root = NaN;
                if (F(lo) * F(hi) < 0) {
                    for (let k = 0; k < 80; k++) {
                        const mid = 0.5 * (lo + hi);
                        if (F(lo) * F(mid) <= 0)
                            hi = mid;
                        else
                            lo = mid;
                    }
                    root = 0.5 * (lo + hi);
                }
                const out = [
                    { label: t('F(c)', 'F(c)'), color: '#185FA5', points: pts },
                    { label: t('F = 0', 'F = 0'), color: '#B4B2A9', points: [[0, 0], [1, 0]], dash: true },
                ];
                if (Number.isFinite(root)) {
                    out.push({
                        label: t(`c_R/β = ${root.toFixed(4)}`, `c_R/β = ${root.toFixed(4)}`),
                        color: '#993C1D',
                        points: [[root, F(root)], [root, F(root)]],
                    });
                }
                void ratio2;
                return out;
            },
            note: t('把 ν 从 0.05 拉到 0.45，看 c_R/β 如何从 0.83 升到 0.95 —— 泊松比越高，Rayleigh 波越接近 S 波。', 'Drag ν from 0.05 to 0.45 and watch c_R/β rise from about 0.83 to 0.95: the higher the Poisson ratio, the closer the Rayleigh wave gets to the S wave.'),
        },
    ],
    example: {
        title: t('泊松固体 ν = 0.25', 'Poisson solid, ν = 0.25'),
        input: t('α/β = √3，β = 1', 'α/β = √3, β = 1'),
        steps: [
            t('代入 F(c) = (2 − c²)² − 4√(1 − c²/3)√(1 − c²)', 'Substitute F(c) = (2 − c²)² − 4√(1 − c²/3)√(1 − c²)'),
            t('在 (0.9, 0.95) 内二分求根', 'Bisect within (0.9, 0.95)'),
        ],
        output: t('c_R ≈ 0.9194 β —— 这是教科书上的经典数值', 'c_R ≈ 0.9194 β — the classic textbook value'),
    },
    links: {
        upstream: [
            { id: 'ps-wave-velocities', note: t('α、β 来自弹性参数', 'α and β come from the elastic parameters') },
            { id: 'velocity-ratio-poisson', note: t('ν 与 α/β 的换算', 'Converts between ν and α/β') },
        ],
        seealso: [{ id: 'rayleigh-velocity-approximation', note: t('避免求根的近似式', 'A root-free approximation') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §7.4' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §11.4' }],
};
export default rayleighWaveEquation;
//# sourceMappingURL=rayleigh-wave-equation.js.map