import { t } from '../../core/types.js';
/** thomsen-parameters */
const thomsenParameters = {
    id: 'thomsen-parameters',
    name: t('Thomsen 参数 ε、δ、γ 的定义', 'Definition of the Thomsen Parameters ε, δ, γ'),
    aliases: {
        zh: ['Thomsen 三参数', '弱各向异性参数', '各向异性强度'],
        en: ['Thomsen parameters', 'weak-anisotropy parameters', 'anisotropy strength', 'anellipticity'],
    },
    node: 'S1.6',
    tags: {
        subject: 'S1.6',
        math: ['MATH.APPROX', 'MATH.LINALG'],
        method: ['METH.STRUCT', 'METH.ROCK'],
        quantity: ['Q.VEL', 'Q.MAT'],
        keywords: t('Thomsen 参数 epsilon delta gamma 弱各向异性 非椭圆度 垂直速度 水平速度 页岩 裂隙', 'Thomsen parameters epsilon delta gamma weak anisotropy anellipticity vertical velocity horizontal velocity shale fractures'),
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\varepsilon=\frac{C_{11}-C_{33}}{2C_{33}},\qquad \gamma=\frac{C_{66}-C_{44}}{2C_{44}},\qquad \delta=\frac{\left(C_{13}+C_{44}\right)^{2}-\left(C_{33}-C_{44}\right)^{2}}{2C_{33}\left(C_{33}-C_{44}\right)}`,
        variants: [
            {
                name: t('换成速度形式：ε 是 P 波的水平/垂直差，γ 是 SH 的', 'Velocity form: ε is the P-wave horizontal/vertical contrast, γ the SH one'),
                latex: String.raw `\alpha_{h}=\alpha_{0}\sqrt{1+2\varepsilon}\approx\alpha_{0}\left(1+\varepsilon\right),\qquad \beta_{h}=\beta_{0}\sqrt{1+2\gamma}\approx\beta_{0}\left(1+\gamma\right)`,
            },
            {
                name: t('δ 控制近垂直方向的 P 波速度弯曲', 'δ controls the near-vertical curvature of the P velocity'),
                latex: String.raw `v_{P}(\theta)\approx\alpha_{0}\left(1+\delta\,\sin^{2}\theta+\left(\varepsilon-\delta\right)\sin^{4}\theta\right)`,
            },
            {
                name: t('等价写法（展开成 sin² 与 sin⁴）', 'Equivalent form (expanded in sin² and sin⁴)'),
                latex: String.raw `v_{P}(\theta)\approx\alpha_{0}\left(1+\delta\sin^{2}\theta\cos^{2}\theta+\varepsilon\sin^{4}\theta\right)`,
            },
            {
                name: t('非椭圆度 ε − δ', 'The anellipticity ε − δ'),
                latex: String.raw `\eta\equiv\varepsilon-\delta,\qquad \sigma=\left(\frac{\alpha_{0}}{\beta_{0}}\right)^{2}\left(\varepsilon-\delta\right)`,
            },
        ],
    },
    meaning: t('直接报 C_IJ（单位 GPa）在物理上不可读：看不出速度差多少、看不出成像会偏多少。Thomsen 的洞见是挑三个无量纲组合，让它们各自对应一个能直接观测的效应 —— ε 是 P 波「水平比垂直快多少」，γ 是横波分裂的强度，δ 是近垂直方向 P 波速度的弯曲程度。地震处理里真正要紧的是 ε 与 δ 的差（非椭圆度 η）：它决定双曲时差校正后还残留多少误差。', 'Quoting C_IJ in GPa is physically unreadable: it reveals neither the velocity contrast nor the resulting imaging error. Thomsen insight was to pick three dimensionless combinations, each tied to a directly observable effect — ε is how much faster P travels horizontally than vertically, γ is the strength of shear-wave splitting, and δ is the curvature of the P velocity near the vertical. What really matters in processing is the difference ε − δ (the anellipticity η), because it controls the residual error left after hyperbolic NMO correction.'),
    symbols: [
        { sym: '\\varepsilon', name: t('P 波各向异性强度', 'P-wave anisotropy strength'), unit: '1', typical: '0.00 – 0.30（页岩 0.05 – 0.25）' },
        { sym: '\\delta', name: t('近垂直 P 波速度弯曲参数', 'near-vertical P-wave curvature parameter'), unit: '1', typical: '−0.05 – 0.20' },
        { sym: '\\gamma', name: t('SH 各向异性强度 / 横波分裂', 'SH anisotropy strength (shear-wave splitting)'), unit: '1', typical: '0.00 – 0.30' },
        { sym: '\\alpha_0', name: t('垂直 P 波速度', 'vertical P velocity'), unit: 'm/s', typical: '2000 – 4000' },
        { sym: '\\beta_0', name: t('垂直 S 波速度', 'vertical S velocity'), unit: 'm/s', typical: '900 – 2200' },
        { sym: '\\alpha_h,\\beta_h', name: t('水平传播的 P / SH 速度', 'horizontally propagating P / SH velocity'), unit: 'm/s' },
        { sym: '\\eta', name: t('非椭圆度 ε − δ', 'anellipticity ε − δ'), unit: '1', typical: '0.00 – 0.15' },
        { sym: '\\theta', name: t('传播方向与对称轴的夹角', 'angle between propagation direction and the symmetry axis'), unit: 'rad' },
    ],
    conditions: {
        applies: [
            t('弱到中等各向异性（|ε|, |δ|, |γ| ≲ 0.3）的 VTI 介质', 'VTI media with weak to moderate anisotropy, |ε|, |δ|, |γ| ≲ 0.3'),
            t('需要把弹性常数换算成速度差、时差误差等量', 'Whenever elastic constants must be converted into velocity contrasts, moveout errors and similar observables'),
        ],
        assumes: [
            t('C₃₃ > C₄₄（即 α₀ > β₀），否则 δ 的平方根式无实数解', 'C₃₃ > C₄₄ (that is α₀ > β₀); otherwise the square root implicit in δ has no real solution'),
            t('用一阶近似式时要求 |ε|、|δ| 足够小，高阶项可忽略', 'First-order approximations require |ε| and |δ| small enough that higher-order terms can be dropped'),
        ],
        breaks: [
            t('强各向异性（如某些页岩 ε > 0.4）时，v_P ≈ α₀(1+δ sin²θ+ε sin⁴θ) 的误差可达数个百分点，须用精确 Christoffel 解', 'For strong anisotropy (some shales reach ε > 0.4), the approximate v_P can be off by several percent; use the exact Christoffel solution'),
            t('ε − δ < 0（某些碳酸盐岩）会导致非双曲时差的方向与常规相反', 'A negative ε − δ (as in some carbonates) reverses the sense of non-hyperbolic moveout'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('目标：把 5 个 C_IJ 换成「速度 + 无量纲比」', 'Goal: replace the five C_IJ by "velocities plus dimensionless ratios"'),
            latex: String.raw `\alpha_0=\sqrt{\frac{C_{33}}{\rho}},\qquad \beta_0=\sqrt{\frac{C_{44}}{\rho}}`,
            note: t('α₀、β₀ 是测井和 VSP 能量到的量，也是各向同性处理流程的起点。', 'α₀ and β₀ are what well logs and VSP actually measure, and they are the starting point of any isotropic processing flow.'),
        },
        {
            n: 2,
            op: 'result',
            title: t('ε 与 γ：直接定义成水平/垂直速度的相对差', 'ε and γ: defined directly as the relative horizontal/vertical velocity difference'),
            latex: String.raw `\varepsilon=\frac{C_{11}-C_{33}}{2C_{33}}=\frac{1}{2}\left(\frac{\alpha_{h}^{2}}{\alpha_{0}^{2}}-1\right),\qquad \gamma=\frac{C_{66}-C_{44}}{2C_{44}}=\frac{1}{2}\left(\frac{\beta_{h}^{2}}{\beta_{0}^{2}}-1\right)`,
            note: t('加 1/2 是为了让一阶近似 v ≈ v₀(1+ε) 成立，而不是 v ≈ v₀(1+2ε)。', 'The factor 1/2 is chosen so that the first-order form v ≈ v₀(1+ε) holds rather than v ≈ v₀(1+2ε).'),
        },
        {
            n: 3,
            op: 'setup',
            title: t('δ 没有这样直观的速度解释，只能从速度对角度的曲率反推', 'δ has no such intuitive velocity meaning; it must be backed out from the angular curvature'),
            latex: String.raw `2\rho v_{P}^{2}=\left(C_{11}+C_{44}\right)\sin^{2}\theta+\left(C_{33}+C_{44}\right)\cos^{2}\theta+\sqrt{\left[\left(C_{11}-C_{44}\right)\sin^{2}\theta-\left(C_{33}-C_{44}\right)\cos^{2}\theta\right]^{2}+4\left(C_{13}+C_{44}\right)^{2}\sin^{2}\theta\cos^{2}\theta}`,
            note: t('这是 VTI 里 P–SV 耦合的精确解（Christoffel 行列式的正根），从它出发做小角展开。', 'This is the exact P–SV solution for VTI (the positive root of the Christoffel determinant); the small-angle expansion starts from here.'),
        },
        {
            n: 4,
            op: 'taylor',
            title: t('在 θ → 0 处展开到 θ² 阶', 'Expand about θ → 0 up to order θ²'),
            latex: String.raw `\sin^{2}\theta\simeq\theta^{2},\ \cos^{2}\theta\simeq 1-\theta^{2}\;\Longrightarrow\; \rho v_{P}^{2}\simeq C_{33}+\theta^{2}\,\frac{\left(C_{13}+C_{44}\right)^{2}-\left(C_{33}-C_{44}\right)^{2}}{C_{33}-C_{44}}`,
            note: t('根号内的 A² + 4Γ₁₃² 展开时，θ² 阶的项只有三个：来自 A² 的一个、来自 Γ₁₃² 的一个、以及交叉项。', 'When √(A² + 4Γ₁₃²) is expanded, only three θ²-order pieces survive: one from A², one from Γ₁₃², and the cross term.'),
        },
        {
            n: 5,
            op: 'algebra',
            title: t('开方并令系数等于 δ', 'Take the square root and identify the coefficient with δ'),
            latex: String.raw `v_{P}(\theta)=\alpha_{0}\sqrt{1+2\delta\,\theta^{2}}\approx\alpha_{0}\left(1+\delta\,\theta^{2}\right)\;\Longrightarrow\; \delta=\frac{\left(C_{13}+C_{44}\right)^{2}-\left(C_{33}-C_{44}\right)^{2}}{2C_{33}\left(C_{33}-C_{44}\right)}`,
            note: t('这就是 δ 的唯一来源：它不是某个方向的速度差，而是近垂直方向速度随角度离开垂直的「二阶弯曲」。', 'This is the sole origin of δ: it is not a velocity contrast between two directions but the second-order curvature of the velocity as the ray departs from vertical.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('三个参数的物理分工', 'The physical division of labour among the three parameters'),
            latex: String.raw `v_{P}(90^{\circ})=\alpha_{0}\sqrt{1+2\varepsilon},\qquad \left.\frac{1}{\alpha_{0}}\frac{\mathrm{d}^{2}v_{P}}{\mathrm{d}\theta^{2}}\right|_{\theta=0}=2\delta,\qquad \frac{v_{SH}(90^{\circ})-v_{SH}(0^{\circ})}{\beta_{0}}\approx\gamma`,
            note: t('一个管水平（ε），一个管近垂直（δ），一个管横波分裂（γ）。三者全为零即回到各向同性。', 'One governs the horizontal direction (ε), one the near-vertical (δ), one shear-wave splitting (γ). All three vanishing returns isotropy.'),
        },
    ],
    viz: [
        {
            id: 'thomsen-velocity-angle',
            level: 'V1',
            title: t('Thomsen 参数如何改变相速度随角度的变化', 'How the Thomsen parameters reshape phase velocity with angle'),
            xlabel: t('与对称轴的夹角 θ (°)', 'angle from the symmetry axis θ (°)'),
            ylabel: t('相速度 (m/s)', 'phase velocity (m/s)'),
            controls: [
                { id: 'a0', label: t('垂直 P 波速度 α₀', 'vertical P velocity α₀'), min: 2000, max: 5000, step: 50, value: 3000, unit: 'm/s' },
                { id: 'b0', label: t('垂直 S 波速度 β₀', 'vertical S velocity β₀'), min: 800, max: 2500, step: 20, value: 1500, unit: 'm/s' },
                { id: 'eps', label: t('P 波各向异性 ε', 'P anisotropy ε'), min: 0, max: 0.45, step: 0.01, value: 0.15, unit: '1' },
                { id: 'del', label: t('近垂直弯曲 δ', 'near-vertical curvature δ'), min: -0.15, max: 0.35, step: 0.01, value: 0.05, unit: '1' },
                { id: 'gam', label: t('SH 各向异性 γ', 'SH anisotropy γ'), min: -0.2, max: 0.45, step: 0.01, value: 0.15, unit: '1' },
            ],
            xRange: [0, 90],
            note: t('把 ε 调大，qP 曲线在 90° 端抬起来、在中间几乎不动；把 δ 调大，曲线在 0°–30° 这一段鼓起来，而 90° 端纹丝不动 —— 这就是 ε 与 δ 的分工。当 ε = δ 时曲线是椭圆的，非椭圆度 η = ε − δ 越大，中段越「塌」。γ 只影响 SH 一支。', 'Raising ε lifts the qP curve at the 90° end while leaving the middle almost untouched; raising δ bulges the 0°–30° segment and leaves the 90° end fixed. That is the division of labour. When ε = δ the wavefront is elliptical, and the larger η = ε − δ, the more the mid-angles sag. γ affects only the SH branch.'),
            compute: (p) => {
                const a0 = p['a0'], b0 = p['b0'], eps = p['eps'], del = p['del'], gam = p['gam'];
                if (!(a0 > 0 && b0 > 0 && a0 > b0))
                    return [];
                const ratio2 = (a0 / b0) * (a0 / b0);
                const qP = [];
                const qSV = [];
                const sh = [];
                const refA = [];
                const refB = [];
                const N = 180;
                for (let i = 0; i <= N; i++) {
                    const th = (i / N) * (Math.PI / 2);
                    const s = Math.sin(th);
                    const s2 = s * s;
                    const c2 = 1 - s2;
                    const deg = (i / N) * 90;
                    qP.push([deg, a0 * (1 + del * s2 * c2 + eps * s2 * s2)]);
                    qSV.push([deg, b0 * (1 + ratio2 * (eps - del) * s2 * c2)]);
                    sh.push([deg, b0 * Math.sqrt(1 + 2 * gam * s2)]);
                    refA.push([deg, a0]);
                    refB.push([deg, b0]);
                }
                return [
                    { label: t('qP（Thomsen 一阶）', 'qP (Thomsen, first order)'), color: '#185FA5', points: qP },
                    { label: t('qSV（Thomsen 一阶）', 'qSV (Thomsen, first order)'), color: '#0F6E56', points: qSV },
                    { label: t('SH（精确）', 'SH (exact)'), color: '#BA7517', points: sh },
                    { label: t('α₀ 参考', 'α₀ reference'), color: '#B4B2A9', dash: true, points: refA },
                    { label: t('β₀ 参考', 'β₀ reference'), color: '#993C1D', dash: true, points: refB },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'vti-elastic-constants', note: t('从 5 个 C_IJ 出发', 'starts from the five C_IJ') }],
        downstream: [
            { id: 'thomsen-qp-qsv-velocity', note: t('ε、δ 决定的相速度近似式', 'the phase-velocity approximation controlled by ε and δ') },
            { id: 'vti-sh-azimuthal-velocity', note: t('γ 决定的 SH 速度', 'the SH velocity controlled by γ') },
        ],
        seealso: [{ id: 'nmo-correction', note: t('非椭圆度导致的非双曲时差', 'non-hyperbolic moveout caused by anellipticity') }],
    },
    refs: [
        { text: 'Thomsen (1986), Weak elastic anisotropy, Geophysics 51, 1954–1966' },
        { text: 'Tsvankin, Seismic Signatures and Analysis of Reflection Data in Anisotropic Media, ch. 1' },
    ],
};
export default thomsenParameters;
//# sourceMappingURL=thomsen-parameters.js.map