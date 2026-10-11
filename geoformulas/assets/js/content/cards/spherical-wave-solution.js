import { t } from '../../core/types.js';
/** spherical-wave-solution */
const sphericalWaveSolution = {
    id: 'spherical-wave-solution',
    name: t('三维波动方程的球面波解', 'The Spherical Wave Solution of the 3D Wave Equation'),
    aliases: { zh: ['球面波', '几何扩散', '1/r 衰减'], en: ['spherical wave', 'geometrical spreading', '1 over r decay'] },
    node: 'S0.7',
    tags: {
        math: ['MATH.DIFF'],
        method: ['METH.EXPL', 'METH.ATTEN'],
        quantity: ['Q.AMP', 'Q.GEOM'],
        keywords: t('球面波 几何扩散 1/r 衰减 三维波动方程 径向变换 外向波 能流', 'spherical wave geometrical spreading 1 over r decay 3D wave equation radial transformation outgoing wave energy flux'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `u(r,t)=\frac{1}{r}f\!\left(t-\frac{r}{c}\right)+\frac{1}{r}g\!\left(t+\frac{r}{c}\right)`,
        variants: [
            { name: t('外向球面波（最常用）', 'Outgoing spherical wave (the most common one)'), latex: String.raw `u(r,t)=\frac{1}{r}f\!\left(t-\frac{r}{c}\right)` },
            { name: t('球坐标下的三维波动方程', 'The 3D wave equation in spherical coordinates'), latex: String.raw `\frac{\partial^{2}u}{\partial r^{2}}+\frac{2}{r}\frac{\partial u}{\partial r}=\frac{1}{c^{2}}\frac{\partial^{2}u}{\partial t^{2}}` },
            { name: t('关键代换：乘以 r 化为一维问题', 'The key substitution: multiply by r to reduce to 1D'), latex: String.raw `w=ru\;\Longrightarrow\;\frac{\partial^{2}w}{\partial r^{2}}=\frac{1}{c^{2}}\frac{\partial^{2}w}{\partial t^{2}}` },
            { name: t('能量守恒给出的衰减律', 'Decay law from energy conservation'), latex: String.raw `4\pi r^{2}\langle u^{2}\rangle=\text{常数}\;\Longrightarrow\; u\propto\frac{1}{r}` },
            { name: t('谐和球面波', 'Harmonic spherical wave'), latex: String.raw `u(r,t)=\frac{A}{r}e^{i(kr-\omega t)},\qquad k=\frac{\omega}{c}` },
        ],
    },
    meaning: t('三维无界介质中点源产生的波必然是球面波：振幅严格按 1/r 衰减，这叫几何扩散。它与吸收（Q）无关，纯粹是能量摊薄在越来越大的球面上的结果，却是地震图振幅随距离变化最主要的控制因素。许多关键代换 w = ru 把三维问题直接化为一维 d’Alembert 问题，因此球面波的波形本身不失真——只是被 1/r 压扁。', 'A point source in an unbounded 3D medium necessarily radiates spherical waves whose amplitude decays strictly as 1/r: geometrical spreading. It has nothing to do with absorption (Q), being purely the dilution of energy over ever larger spheres, yet it is the dominant control on how seismogram amplitude varies with distance. The substitution w = ru reduces the problem directly to a 1D d\'Alembert problem, so the waveform itself is not distorted, only compressed by 1/r.'),
    symbols: [
        { sym: 'u(r,t)', name: t('径向位移（或势函数）', 'radial displacement (or potential)'), unit: 'm' },
        { sym: 'r', name: t('离源距离', 'distance from the source'), unit: 'm' },
        { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: 'f', name: t('外向波的源时间函数', 'source time function of the outgoing wave'), unit: 'm·m' },
        { sym: 'g', name: t('内向波的源时间函数', 'source time function of the incoming wave'), unit: 'm·m' },
        { sym: 'w', name: t('代换后的辅助变量 w = ru', 'auxiliary variable w = ru after substitution'), unit: 'm·m' },
        { sym: '\\langle u^2\\rangle', name: t('时间平均的位移平方（正比于能量密度）', 'time-averaged squared displacement (proportional to energy density)'), unit: 'm²' },
    ],
    conditions: {
        applies: [
            t('均匀、各向同性、无界或远离界面的三维介质', 'Homogeneous, isotropic, unbounded media or regions far from interfaces'),
            t('点源或等效点源（远场近似 r ≫ 源尺度）', 'A point source, or an equivalent one (far field, r ≫ source dimension)'),
        ],
        assumes: [
            t('介质无频散、无吸收（Q → ∞）；有吸收时再乘 exp(−ωr/2Qc)', 'No dispersion and no absorption (Q → ∞); with absorption multiply by exp(−ωr/2Qc)'),
            t('波前是球面，即速度只依赖半径', 'Wavefronts are spherical, i.e. speed depends on radius only'),
        ],
        breaks: [
            t('r → 0 时 1/r 发散，点源解在源处奇异，须用有限源模型', 'As r → 0 the factor 1/r diverges and the point-source solution is singular; a finite-source model is required'),
            t('层状或横向非均匀介质中波前不是球面，几何扩散偏离 1/r', 'In layered or laterally heterogeneous media wavefronts are not spherical and the spreading deviates from 1/r'),
            t('二维（面波）情形是 1/√r 而非 1/r，不可混用', 'In two dimensions (surface waves) it is 1/√r, not 1/r; the two must not be confused'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('球对称时三维波动方程只含 r 与 t', 'With spherical symmetry the 3D wave equation involves only r and t'),
            latex: String.raw `\nabla^{2}u=\frac{1}{r}\frac{\partial^{2}}{\partial r^{2}}(ru)=\frac{\partial^{2}u}{\partial r^{2}}+\frac{2}{r}\frac{\partial u}{\partial r}`,
            note: t('这个恒等式很关键：∇²u 恰好等于 (1/r) 对 (ru) 的二阶导数。', 'This identity is the key: ∇²u equals (1/r) times the second derivative of (ru).') },
        { n: 2, op: 'transform', title: t('令 w = ru，方程化为一维波动方程', 'Set w = ru; the equation becomes the 1D wave equation'),
            latex: String.raw `\frac{\partial^{2}w}{\partial r^{2}}=\frac{1}{c^{2}}\frac{\partial^{2}w}{\partial t^{2}}` },
        { n: 3, op: 'identity', title: t('直接套用 d\'Alembert 通解', 'Apply the d\'Alembert general solution directly'),
            latex: String.raw `w(r,t)=f\!\left(t-\frac{r}{c}\right)+g\!\left(t+\frac{r}{c}\right)` },
        { n: 4, op: 'substitute', title: t('除回 r，得到球面波', 'Divide back by r to obtain the spherical wave'),
            latex: String.raw `u(r,t)=\frac{w}{r}=\frac{1}{r}f\!\left(t-\frac{r}{c}\right)+\frac{1}{r}g\!\left(t+\frac{r}{c}\right)`,
            note: t('物理上只取外向波 f：内向波 g 需要一个收缩到一点的波，没有对应的源。', 'Physically only the outgoing wave f is kept: an incoming wave g would require a wave collapsing onto a point, for which there is no source.') },
        { n: 5, op: 'physics', title: t('从能量守恒复核 1/r', 'Check the 1/r law from energy conservation'),
            latex: String.raw `\text{穿过半径 }r\text{ 球面的总能流不变}\;\Longrightarrow\; 4\pi r^{2}\,\langle u^{2}\rangle=\text{常数}\;\Longrightarrow\; u\propto\frac{1}{r}` },
        { n: 6, op: 'result', title: t('谐和形式：球面波的相位与振幅', 'Harmonic form: phase and amplitude of a spherical wave'),
            latex: String.raw `u(r,t)=\frac{A}{r}e^{i(kr-\omega t)},\qquad \text{振幅}\propto\frac{1}{r},\ \text{相位速度}=c=\frac{\omega}{k}` },
    ],
    viz: [
        {
            id: 'spherical-snapshot',
            level: 'V1',
            title: t('某一时刻的径向剖面：1/r 压扁', 'Radial profile at one instant: compressed by 1/r'),
            xlabel: t('距离 r (km)', 'distance r (km)'),
            ylabel: t('位移 u（相对单位）', 'displacement u (relative units)'),
            controls: [
                { id: 'tp', label: t('时刻 t', 'time t'), min: 0, max: 20, step: 0.1, value: 6, unit: 's' },
                { id: 'cv', label: t('波速 c', 'wave speed c'), min: 2, max: 10, step: 0.1, value: 6, unit: 'km/s' },
                { id: 'sg', label: t('源时间函数宽度 σ', 'source time function width σ'), min: 0.2, max: 3, step: 0.05, value: 0.8, unit: 's' },
            ],
            xRange: [1, 60],
            note: t('波包随着向前推进，峰值高度一路下降：在 t 时刻它位于 r = ct 处，峰值正比于 1/(ct)。这就是「远震体波振幅很小」的第一位原因。', 'The wave packet drops in peak height as it advances: at time t it sits at r = ct with a peak proportional to 1/(ct). This is the first-order reason why teleseismic body waves have small amplitudes.'),
            compute: (p) => {
                const tp = p['tp'], c = p['cv'], sg = p['sg'];
                const pts = [];
                const env = [];
                for (let i = 0; i <= 600; i++) {
                    const r = 1 + (i / 600) * 59;
                    const s = tp - r / c;
                    const v = Math.exp(-((s / sg) * (s / sg))) / r;
                    pts.push([r, v]);
                    env.push([r, 1 / r]);
                }
                return [
                    { label: t('u(r, t)', 'u(r, t)'), color: '#185FA5', points: pts },
                    { label: t('几何扩散包络 1/r', 'geometrical spreading envelope 1/r'), color: '#B4B2A9', dash: true, points: env },
                ];
            },
        },
        {
            id: 'spherical-two-distances',
            level: 'V1',
            title: t('两个距离上的记录对比', 'Records compared at two distances'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 u（相对单位）', 'displacement u (relative units)'),
            controls: [
                { id: 'r1', label: t('近台距离 r₁', 'near distance r₁'), min: 5, max: 50, step: 1, value: 20, unit: 'km' },
                { id: 'fac', label: t('远台倍数 r₂/r₁', 'far-station factor r₂/r₁'), min: 2, max: 10, step: 0.5, value: 4, unit: '1' },
                { id: 'c3', label: t('波速 c', 'wave speed c'), min: 2, max: 10, step: 0.1, value: 6, unit: 'km/s' },
            ],
            xRange: [0, 25],
            note: t('距离变 4 倍，振幅变 1/4，到时推迟 3r₁/c，波形完全不变。远程台阵做振幅比法测 Q 时，必须先把这个 1/r 因子除干净。', 'Quadrupling the distance quarters the amplitude and delays the arrival by 3r₁/c, with the shape unchanged. When measuring Q from amplitude ratios across a regional array, this 1/r factor must first be removed exactly.'),
            compute: (p) => {
                const r1 = p['r1'], fac = p['fac'], c = p['c3'];
                const r2 = r1 * fac;
                const sg = 0.8;
                const n1 = [];
                const n2 = [];
                for (let i = 0; i <= 600; i++) {
                    const tt = (i / 600) * 25;
                    const s1 = tt - r1 / c;
                    const s2 = tt - r2 / c;
                    n1.push([tt, Math.exp(-((s1 / sg) * (s1 / sg))) / r1]);
                    n2.push([tt, Math.exp(-((s2 / sg) * (s2 / sg))) / r2]);
                }
                return [
                    { label: t('近台 r₁', 'near station r₁'), color: '#185FA5', points: n1 },
                    { label: t('远台 r₂', 'far station r₂'), color: '#BA7517', points: n2 },
                ];
            },
        },
    ],
    example: {
        title: t('估计远震体波的振幅', 'Estimating teleseismic body-wave amplitude'),
        input: t('同一事件在 100 km 处振幅 10 μm，问 10000 km 处的几何扩散后振幅（忽略 Q）', 'Amplitude 10 μm at 100 km for one event; find the amplitude at 10000 km from geometrical spreading alone (ignoring Q)'),
        steps: [
            t('振幅比 = r₁/r₂ = 100/10000 = 0.01', 'Amplitude ratio = r₁/r₂ = 100/10000 = 0.01'),
            t('u₂ = 10 μm × 0.01 = 0.1 μm', 'u₂ = 10 μm × 0.01 = 0.1 μm'),
            t('若再计入 t* ≈ 1 s 的衰减，高频分量还要再乘 e^{−π f t*}', 'Adding attenuation with t* ≈ 1 s, high-frequency components get a further factor e^{−π f t*}'),
        ],
        output: t('仅几何扩散就使振幅下降两个数量级 —— 这正是远震台网必须用高灵敏度宽频带仪器的原因。', 'Geometrical spreading alone costs two orders of magnitude in amplitude, which is why teleseismic networks need high-sensitivity broadband instruments.'),
    },
    links: {
        upstream: [
            { id: 'dalembert-solution', note: t('代换 w = ru 后就是它', 'it becomes this after the substitution w = ru') },
        ],
        seealso: [
            { id: 'brune-source-spectrum', note: t('震源谱的形状再乘上这里的 1/r', 'the source spectrum is multiplied by this 1/r') },
            { id: 'quality-factor-q', note: t('在 1/r 之上再叠加非弹性衰减', 'anelastic attenuation is superimposed on top of 1/r') },
            { id: 'bessel-cylindrical-wave', note: t('二维对应的是 1/√r', 'the 2D counterpart is 1/√r') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.1' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.4' },
    ],
};
export default sphericalWaveSolution;
//# sourceMappingURL=spherical-wave-solution.js.map