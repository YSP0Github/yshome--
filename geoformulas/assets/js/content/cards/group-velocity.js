import { t } from '../../core/types.js';
/** group-velocity */
const groupVelocity = {
    id: 'group-velocity',
    name: t('群速度与 Rayleigh 关系', 'Group Velocity and the Rayleigh Relation'),
    aliases: { zh: ['群速度', '能量速度', '频散关系 U=c+k dc/dk'], en: ['group velocity', 'energy velocity', 'Rayleigh relation'] },
    node: 'S0.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.FOURIER'],
        method: ['METH.SURF', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.FREQ'],
        keywords: t('群速度 相速度 频散 波包 包络 艾里相 Rayleigh 关系', 'group velocity phase velocity dispersion wave packet envelope Airy phase Rayleigh relation'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `v_g=\frac{\dd\omega}{\dd k}`,
        variants: [
            { name: t('Rayleigh 关系：用相速度表达', 'Rayleigh relation, expressed through the phase velocity'), latex: String.raw `v_g=c+k\frac{\dd c}{\dd k}=c-\lambda\frac{\dd c}{\dd\lambda}` },
            { name: t('用频率表达', 'Expressed through frequency'), latex: String.raw `\frac{1}{v_g}=\frac{\dd k}{\dd\omega}=\frac{1}{c}-\frac{\omega}{c^{2}}\frac{\dd c}{\dd\omega}` },
            { name: t('非频散极限', 'The non-dispersive limit'), latex: String.raw `\frac{\dd c}{\dd k}=0\;\Longrightarrow\; v_g=c` },
            { name: t('对走时的含义', 'Meaning for travel time'), latex: String.raw `v_g=\frac{X}{t_{obs}},\qquad U=\frac{\dd\omega}{\dd k}=\frac{X}{t}\Big|_{\text{群到时}}` },
        ],
    },
    meaning: t('群速度是波包包络（也就是能量、也就是信息）的传播速度。它的定义是频散关系 ω(k) 的导数，而不是 ω/k。两者只在非频散介质中相等。面波之所以在地震图上拖成一条长长的波列、先低频后高频，正是因为不同频率的群速度不同；频散曲线上的「艾里相」就出现在群速度的极值处。', 'Group velocity is the speed at which the envelope of a wave packet — that is, the energy, that is, the information — travels. It is defined as the derivative of the dispersion relation ω(k), not as ω/k. The two agree only in a non-dispersive medium. Surface waves stretch into a long train, low frequencies first, precisely because the group velocity differs from one frequency to the next; the Airy phase of a dispersion curve sits at the extremum of group velocity.'),
    symbols: [
        { sym: 'v_g', name: t('群速度（常记作 U）', 'group velocity, often written U'), unit: 'm/s' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: 'k', name: t('波数', 'wavenumber'), unit: 'rad/m' },
        { sym: 'c', name: t('相速度 c = ω/k', 'phase velocity c = ω/k'), unit: 'm/s' },
        { sym: '\\lambda', name: t('波长（此处为波长，非 Lamé 常数）', 'wavelength — here wavelength, not the Lamé constant'), unit: 'm' },
        { sym: 'X', name: t('震中距', 'epicentral distance'), unit: 'm' },
        { sym: 't', name: t('走时', 'travel time'), unit: 's' },
        { sym: '\\Delta k', name: t('波包在 k 空间的宽度', 'width of the packet in k-space'), unit: 'rad/m' },
    ],
    conditions: {
        applies: [
            t('窄带波包：频谱集中在 k₀ 附近，ω(k) 可在该点展开', 'A narrow-band packet whose spectrum is concentrated near k₀, where ω(k) can be expanded'),
            t('弱频散、弱吸收，包络形状在传播中近似不变', 'Weak dispersion and weak absorption, so the envelope keeps its shape while propagating'),
        ],
        assumes: [
            t('ω(k) 光滑可微', 'ω(k) is smooth and differentiable'),
            t('群速度取实数：在 ω(k) 的实数分支上', 'The group velocity is real, that is, one stays on a real branch of ω(k)'),
        ],
        breaks: [
            t('强吸收介质中群速度可以是复数，「能量速度」需另用能流/能密度之比定义', 'In a strongly absorbing medium the group velocity can be complex, and the energy velocity must be defined separately as the ratio of energy flux to energy density'),
            t('波包极宽带（如尖脉冲）时，一阶近似不足，包络会显著畸变', 'For a very broadband packet such as a sharp spike, the first-order approximation fails and the envelope distorts noticeably'),
            t('在截止频率、模态分支交叉处 dω/dk 可能为零或发散', 'At cut-off frequencies or mode-branch crossings dω/dk may vanish or diverge'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('把波包写成一群相近 k 的叠加', 'Write the packet as a superposition of nearby wavenumbers'),
            latex: String.raw `u(x,t)=\int A(k)\,e^{i(kx-\omega(k)t)}\,\dd k`,
            note: t('A(k) 在 k₀ 附近有一个峰，宽度 Δk 很小，这就是「窄带」。', 'A(k) has a peak near k₀ of small width Δk; that is what "narrow band" means.'),
        },
        {
            n: 2,
            op: 'taylor',
            title: t('在 k₀ 处把 ω(k) 展开到一阶', 'Expand ω(k) about k₀ to first order'),
            latex: String.raw `\omega(k)\approx\omega_0+\left.\frac{\dd\omega}{\dd k}\right|_{k_0}(k-k_0)`,
        },
        {
            n: 3,
            op: 'substitute',
            title: t('代回积分并把常数项提出来', 'Substitute back and pull the constant terms out'),
            latex: String.raw `u(x,t)\approx e^{i(k_0x-\omega_0 t)}\int A(k)\,e^{i(k-k_0)\left(x-v_g t\right)}\,\dd k`,
            note: t('第一项是快速振荡的载波，速度 ω₀/k₀ = c；第二项是包络，速度 v_g。', 'The first factor is the rapidly oscillating carrier, moving at ω₀/k₀ = c; the second is the envelope, moving at v_g.'),
        },
        {
            n: 4,
            op: 'result',
            title: t('包络整体平移的速度即群速度', 'The speed at which the envelope translates is the group velocity'),
            latex: String.raw `v_g=\left.\frac{\dd\omega}{\dd k}\right|_{k_0}`,
        },
        {
            n: 5,
            op: 'identity',
            title: t('Rayleigh 关系：把导数换成对相速度求导', 'Rayleigh relation: convert the derivative to one of the phase velocity'),
            latex: String.raw `\omega=kc\;\Longrightarrow\;\frac{\dd\omega}{\dd k}=c+k\frac{\dd c}{\dd k}`,
            note: t('这是乘积求导的直接结果，也是频散测量里把 c(f) 换算成 U(f) 的标准公式。', 'A direct product-rule result, and the standard formula for turning measured c(f) into U(f).'),
        },
        {
            n: 6,
            op: 'algebra',
            title: t('用波长写出的等价形式', 'The equivalent form using wavelength'),
            latex: String.raw `k=\frac{2\pi}{\lambda},\qquad \dd k=-\frac{2\pi}{\lambda^{2}}\dd\lambda\;\Longrightarrow\; v_g=c-\lambda\frac{\dd c}{\dd\lambda}`,
            note: t('野外频散曲线通常是 c(λ) 或 c(T)，这一式可以直接套用。', 'Field dispersion curves are usually given as c(λ) or c(T), so this form can be applied directly.'),
        },
        {
            n: 7,
            op: 'result',
            title: t('两种极限：正常频散与反常频散', 'Two limits: normal and anomalous dispersion'),
            latex: String.raw `\frac{\dd c}{\dd k}<0\;\Rightarrow\;v_g<c;\qquad \frac{\dd c}{\dd k}>0\;\Rightarrow\;v_g>c`,
            note: t('面波在多数频段属于前者：长周期走得快，所以先到。', 'Surface waves belong to the first case over most bands: long periods travel faster and therefore arrive first.'),
        },
    ],
    viz: [
        {
            id: 'packet-motion',
            level: 'V1',
            title: t('两个相近频率的叠加：包络跑得和载波一样快吗？', 'Superposing two nearby frequencies: does the envelope keep pace with the carrier?'),
            xlabel: t('位置 x (m)', 'position x (m)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'k0', label: t('中心波数 k₀', 'central wavenumber k₀'), min: 0.02, max: 0.2, step: 0.005, value: 0.08, unit: 'rad/m' },
                { id: 'dk', label: t('波数半宽 Δk/2', 'half width Δk/2'), min: 0.002, max: 0.04, step: 0.001, value: 0.012, unit: 'rad/m' },
                { id: 'w0', label: t('频散强度 ω₀（0 表示非频散）', 'dispersion strength ω₀ (0 means non-dispersive)'), min: 0, max: 20, step: 0.5, value: 8, unit: 'rad/s' },
                { id: 'tt', label: t('时刻 t', 'time t'), min: 0, max: 60, step: 0.5, value: 12, unit: 's' },
            ],
            xRange: [0, 400],
            note: t('把 ω₀ 调成 0，包络与载波同步前进（v_g = c）；把 ω₀ 调大，频散出现，包络明显落后于载波（v_g < c）。模型取 ω(k) = sqrt(c₀²k² + ω₀²)，这正是波导与 Love 波频散定性行为的原型。', 'Set ω₀ to zero and the envelope keeps pace with the carrier, meaning v_g = c; increase ω₀ and dispersion appears, the envelope visibly lagging the carrier, meaning v_g < c. The model takes ω(k) = sqrt(c₀²k² + ω₀²), a prototype of the qualitative behaviour of guided and Love-wave dispersion.'),
            compute: (p) => {
                const k0 = p['k0'];
                const dk = p['dk'];
                const w0 = p['w0'];
                const tt = p['tt'];
                const c0 = 200;
                const omega = (k) => Math.sqrt(c0 * c0 * k * k + w0 * w0);
                const k1 = k0 - dk;
                const k2 = k0 + dk;
                const w1 = omega(k1);
                const w2 = omega(k2);
                const dW = w2 - w1;
                const dK = k2 - k1;
                const vg = dK !== 0 ? dW / dK : c0;
                const pts = [];
                const envHi = [];
                const envLo = [];
                for (let i = 0; i <= 900; i++) {
                    const x = (i / 900) * 400;
                    const a = Math.cos(k1 * x - w1 * tt);
                    const b = Math.cos(k2 * x - w2 * tt);
                    const env = Math.cos((dK / 2) * x - (dW / 2) * tt);
                    pts.push([x, a + b]);
                    envHi.push([x, 2 * Math.abs(env)]);
                    envLo.push([x, -2 * Math.abs(env)]);
                }
                const xg = vg * tt;
                return [
                    { label: t('u(x, t) 载波 + 包络', 'u(x, t): carrier plus envelope'), color: '#185FA5', points: pts },
                    { label: t('上包络', 'upper envelope'), color: '#BA7517', dash: true, points: envHi },
                    { label: t('下包络', 'lower envelope'), color: '#BA7517', dash: true, points: envLo },
                    { label: t('包络中心 x = v_g t', 'envelope centre x = v_g t'), color: '#993C1D', dash: true, points: [[xg, -2.4], [xg, 2.4]] },
                ];
            },
        },
        {
            id: 'rayleigh-relation',
            level: 'V1',
            title: t('Rayleigh 关系：由 c(k) 的斜率得到 U', 'Rayleigh relation: U from the slope of c(k)'),
            xlabel: t('波数 k (rad/m)', 'wavenumber k (rad/m)'),
            ylabel: t('速度 (m/s)', 'velocity (m/s)'),
            controls: [
                { id: 'c0r', label: t('参考速度 c₀', 'reference speed c₀'), min: 100, max: 3000, step: 50, value: 500, unit: 'm/s' },
                { id: 'w0r', label: t('频散强度 ω₀', 'dispersion strength ω₀'), min: 0, max: 20, step: 0.5, value: 8, unit: 'rad/s' },
            ],
            xRange: [0.01, 0.3],
            note: t('蓝线是相速度 c = ω/k，橙线是群速度 U = dω/dk。k → 0 时两者都趋于 c₀ 吗？注意此处 ω → ω₀ 使 c 发散，而 U → 0 —— 这正是截止频率附近群速度趋于零、能量堆积的物理图像。', 'Blue is the phase velocity c = ω/k, orange the group velocity U = dω/dk. As k → 0, c diverges because ω → ω₀, while U → 0: the energy piles up rather than propagating, exactly the picture near a cut-off frequency.'),
            compute: (p) => {
                const c0 = p['c0r'];
                const w0 = p['w0r'];
                const cPts = [];
                const uPts = [];
                for (let i = 0; i <= 300; i++) {
                    const k = 0.01 + (i / 300) * 0.29;
                    const w = Math.sqrt(c0 * c0 * k * k + w0 * w0);
                    const c = w / k;
                    const u = (c0 * c0 * k) / w;
                    if (Number.isFinite(c) && c < 1e6)
                        cPts.push([k, c]);
                    if (Number.isFinite(u))
                        uPts.push([k, u]);
                }
                return [
                    { label: t('相速度 c = ω/k', 'phase velocity c = ω/k'), color: '#185FA5', points: cPts },
                    { label: t('群速度 U = dω/dk', 'group velocity U = dω/dk'), color: '#BA7517', dash: true, points: uPts },
                ];
            },
        },
    ],
    example: {
        title: t('由实测频散曲线估算群速度', 'Estimating group velocity from a measured dispersion curve'),
        input: t('在 f = 0.05 Hz 附近测得 c = 3500 m/s，且 dc/df = −20000 (m/s)/Hz', 'Near f = 0.05 Hz one measures c = 3500 m/s with dc/df = −20000 (m/s)/Hz'),
        steps: [
            t('λ = c/f = 70000 m', 'λ = c/f = 70000 m'),
            t('用波长形式：U = c − λ dc/dλ；由 dλ/df = −c/f² 得 dc/dλ = (dc/df)(df/dλ) = (dc/df)(−f²/c)', 'Use the wavelength form U = c − λ dc/dλ; since dλ/df = −c/f², dc/dλ = (dc/df)(−f²/c)'),
            t('dc/dλ = (−20000)(−0.0025/3500) = 1.43×10⁻² s⁻¹', 'dc/dλ = (−20000)(−0.0025/3500) = 1.43×10⁻² s⁻¹'),
            t('U = 3500 − 70000 × 1.43×10⁻² ≈ 2500 m/s', 'U = 3500 − 70000 × 1.43×10⁻² ≈ 2500 m/s'),
        ],
        output: t('群速度比相速度低约 1000 m/s：面波能量比波峰到得晚，这与「先低频后高频」的观测一致', 'The group velocity lies about 1000 m/s below the phase velocity: surface-wave energy arrives later than the crests, consistent with the observed low-frequency-first pattern'),
    },
    links: {
        upstream: [
            { id: 'phase-velocity', note: t('c = ω/k 是 v_g 的比较基准', 'c = ω/k is the baseline that v_g is compared with') },
            { id: 'wavenumber-wavelength', note: t('提供 k 与 λ 的换算', 'supplies the k–λ conversion') },
        ],
        downstream: [
            { id: 'love-wave-dispersion', note: t('面波频散曲线给出 U(T)', 'surface-wave dispersion curves yield U(T)') },
        ],
        seealso: [{ id: 'harmonic-plane-wave' }],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.3' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §11.2' },
        { text: 'Rayleigh, Lord (1877), Theory of Sound, Vol. I' },
    ],
};
export default groupVelocity;
//# sourceMappingURL=group-velocity.js.map