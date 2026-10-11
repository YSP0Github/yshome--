import { t } from '../../core/types.js';
/** mode-multiplet-splitting */
const modeMultipletSplitting = {
    id: 'mode-multiplet-splitting',
    name: t('自由振荡多线态的分裂', 'Splitting of Free-oscillation Multiplets'),
    aliases: { zh: ['模态分裂', '多线态', '分裂函数'], en: ['mode splitting', 'multiplet', 'splitting function'] },
    node: 'S5.6',
    tags: {
        math: ['MATH.LINALG', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.FREQ', 'Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\delta\omega_{m} = \frac{1}{2\ell+1}\sum_{s=0}^{2\ell}\sum_{t=-s}^{s} c_{s}^{t}\int_{\oplus} \delta m_{s}^{t}(r)\,K_{s}(r)\,\mathrm{d}r
\;\equiv\; \sum_{s,t} c_{s}^{t}\,A_{s}^{t}`,
        variants: [
            { name: t('球对称地球中 2ℓ+1 个 singlet 简并', 'In a spherical Earth the 2ℓ+1 singlets are degenerate'), latex: String.raw `\omega_{\ell}^{m} = \omega_{\ell}\quad (m = -\ell,\dots,\ell)` },
            { name: t('自转与椭率造成 m 线性分裂（一阶）', 'Rotation and ellipticity split m linearly (first order)'), latex: String.raw `\delta\omega_m \approx a + b\,m + c\,m^{2}` },
            { name: t('偶次项（s = 2）对应方位各向异性', 'The even-degree term (s = 2) corresponds to azimuthal anisotropy'), latex: String.raw `c_2^{t} \longleftrightarrow \text{2}\psi\ \text{方位各向异性}` },
        ],
    },
    meaning: t('球对称地球中，角序数为 ℓ 的振型有 2ℓ+1 个完全相同频率的分量（singlet），观测上只看到一条谱线。地球自转、椭率和三维非均匀性打破了这个简并，把一条谱线劈成一簇 —— 这就是多线态分裂。测量分裂的宽度和形状，等价于测量地球内部的三维结构在球谐域中的展开系数。', 'In a spherically symmetric Earth the mode of angular order ℓ has 2ℓ+1 components (singlets) with identical frequency, so only one spectral line is observed. Earth rotation, ellipticity and 3-D heterogeneity break this degeneracy and split the line into a cluster — a multiplet. Measuring the width and shape of the splitting is equivalent to measuring the spherical-harmonic expansion coefficients of the Earth\'s 3-D structure.'),
    symbols: [
        { sym: '\\ell, m', name: t('球谐的角序数与方位序数', 'angular and azimuthal orders of the spherical harmonic'), unit: '无量纲' },
        { sym: '\\delta\\omega_m', name: t('第 m 个 singlet 的频率扰动', 'frequency perturbation of the m-th singlet'), unit: 'rad/s' },
        { sym: 'c_s^{t}', name: t('结构扰动的球谐系数', 'spherical-harmonic coefficients of the structural perturbation'), unit: '—' },
        { sym: 'K_s(r)', name: t('深度方向的灵敏度核', 'depth sensitivity kernel'), unit: '—' },
        { sym: 'A_s^{t}', name: t('分裂系数（可观测量）', 'splitting coefficient (observable)'), unit: 'rad/s' },
    ],
    conditions: {
        applies: [t('大地震后的自由振荡谱分析、全球各向异性成像', 'Free-oscillation spectral analysis after great earthquakes, global anisotropic imaging')],
        assumes: [t('扰动为一阶小量（Born 近似）', 'Perturbation is first order (Born approximation)')],
        breaks: [t('高阶振型或强扰动时一阶微扰失效', 'First-order perturbation fails for high-order modes or strong perturbations')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('简并微扰论：在简并子空间内对角化', 'Degenerate perturbation theory: diagonalise within the degenerate subspace'), latex: String.raw `\delta\omega_m = \langle \mathbf{s}_{\ell m}|\delta V|\mathbf{s}_{\ell m}\rangle` },
        { n: 2, op: 'identity', title: t('把结构扰动展开成球谐', 'Expand the structural perturbation in spherical harmonics'), latex: String.raw `\delta m(r,\theta,\phi) = \sum_{s,t}\delta m_s^{t}(r)\,Y_s^{t}(\theta,\phi)` },
        { n: 3, op: 'identity', title: t('三个球谐的积分用 Wigner 3j 符号表示', 'The triple-spherical-harmonic integral is expressed with Wigner 3j symbols'), latex: String.raw `\int Y_\ell^{m*}Y_s^{t}Y_\ell^{m'}\,\mathrm{d}\Omega \propto \begin{pmatrix}\ell & s & \ell\\ -m & t & m'\end{pmatrix}` },
        { n: 4, op: 'physics', title: t('三角不等式限制 s ≤ 2ℓ', 'The triangle inequality restricts s ≤ 2ℓ'), latex: String.raw `|\ell - s| \le \ell \Longrightarrow s \le 2\ell` },
        { n: 5, op: 'result', title: t('得到线性反演问题 A = ∫ δm·K', 'Obtain the linear inverse problem A = ∫ δm·K'), latex: String.raw `A_s^{t} = \int_{\oplus}\delta m_s^{t}(r)\,K_s(r)\,\mathrm{d}r` },
    ],
    viz: [
        {
            id: 'multiplet',
            level: 'V2',
            title: t('一条谱线如何被分裂成 2ℓ+1 个 singlet', 'How one spectral line splits into 2ℓ+1 singlets'),
            xlabel: t('频率偏移 δω (µHz)', 'frequency shift δω (µHz)'),
            ylabel: t('谱振幅', 'spectral amplitude'),
            controls: [
                { id: 'l', label: t('角序数 ℓ', 'angular order ℓ'), min: 2, max: 20, step: 1, value: 8 },
                { id: 'a', label: t('偶次分裂系数 a (µHz)', 'even splitting a (µHz)'), min: 0, max: 6, step: 0.1, value: 2.5 },
                { id: 'b', label: t('奇次（自转）系数 b (µHz)', 'odd (rotation) coefficient b (µHz)'), min: -3, max: 3, step: 0.05, value: 1.2 },
                { id: 'q', label: t('品质因子 Q', 'quality factor Q'), min: 100, max: 3000, step: 20, value: 800 },
            ],
            note: t('a 项把谱线展宽成对称的一簇，b 项（自转/椭率）让整簇随 m 线性移动，Q 决定每个峰的宽度。当 Q 太低时各 singlet 互相重叠，就再也分不出分裂结构了。', 'The a term broadens the line into a symmetric cluster, the b term (rotation/ellipticity) shifts the cluster linearly with m, and Q sets the width of each peak. When Q is too low the singlets overlap and the splitting can no longer be resolved.'),
            compute: (p) => {
                const L = Math.round(p['l']), a = p['a'], b = p['b'], Q = p['q'];
                const f0 = 1000 + 30 * L; // µHz 量级的名义本征频率
                const gam = f0 / Q; // 半峰宽量级
                const pts = [];
                const N = 900;
                const lo = -Math.max(8, a * 1.6 + Math.abs(b) * L * 1.2);
                const hi = Math.max(8, a * 1.6 + Math.abs(b) * L * 1.2);
                for (let i = 0; i <= N; i++) {
                    const x = lo + ((hi - lo) * i) / N;
                    let s = 0;
                    for (let m = -L; m <= L; m++) {
                        // 一阶分裂：δω = a(3m²−L(L+1))/(L(2L−1)) + b·m
                        const quad = L > 0 ? (3 * m * m - L * (L + 1)) / Math.max(1, L * (2 * L - 1)) : 0;
                        const dw = a * quad + b * m;
                        const d = x - dw;
                        s += gam / (d * d + gam * gam);
                    }
                    pts.push([x, s]);
                }
                const mx = Math.max(...pts.map((q) => q[1]));
                return [{ label: t('多线态谱形', 'multiplet spectrum'), color: '#185FA5', points: pts.map(([x, y]) => [x, y / mx]) }];
            },
        },
    ],
    example: {
        title: t('ℓ = 8 的分裂宽度', 'Splitting width for ℓ = 8'),
        input: t('a = 2.5 µHz，b = 1.2 µHz，Q = 800', 'a = 2.5 µHz, b = 1.2 µHz, Q = 800'),
        steps: [
            t('二次项跨度约为 a·(3ℓ²−ℓ(ℓ+1))/(ℓ(2ℓ−1)) ≈ 2.5 µHz', 'The quadratic span is about a·(3ℓ²−ℓ(ℓ+1))/(ℓ(2ℓ−1)) ≈ 2.5 µHz'),
            t('自转项跨度 2bℓ = 19.2 µHz', 'The rotational span is 2bℓ = 19.2 µHz'),
            t('半峰宽 f₀/Q ≈ (1000+240)/800 ≈ 1.55 µHz，小于分裂间距', 'Half-width f₀/Q ≈ (1000+240)/800 ≈ 1.55 µHz, smaller than the splitting spacing'),
        ],
        output: t('各 singlet 可被分辨，谱线呈清晰的梳状结构', 'Individual singlets are resolvable and the line shows a clear comb structure'),
    },
    links: {
        upstream: [
            { id: 'spheroidal-toroidal-modes', note: t('先要知道本征频率', 'The eigenfrequencies must be known first') },
            { id: 'spherical-harmonics', note: t('球谐是展开基', 'Spherical harmonics are the expansion basis') },
        ],
        seealso: [{ id: 'normal-mode-summation', note: t('分裂与合成地震图的耦合', 'Coupling between splitting and synthetic seismograms') }],
    },
    refs: [{ text: 'Dahlen & Tromp, Theoretical Global Seismology, Ch. 14' }],
};
export default modeMultipletSplitting;
//# sourceMappingURL=mode-multiplet-splitting.js.map