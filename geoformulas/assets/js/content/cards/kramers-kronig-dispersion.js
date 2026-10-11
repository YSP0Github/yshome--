import { t } from '../../core/types.js';
/** kramers-kronig-dispersion */
const kramersKronigDispersion = {
    id: 'kramers-kronig-dispersion',
    name: t('Kramers–Kronig 关系：Q 与相速度频散的因果联系', 'The Kramers–Kronig Relations: Causal Link between Q and Velocity Dispersion'),
    aliases: {
        zh: ['Kramers–Kronig 关系', '因果性与频散', '希尔伯特变换对', '对数频散'],
        en: ['Kramers-Kronig relations', 'causality and dispersion', 'Hilbert transform pair', 'logarithmic dispersion'],
    },
    node: 'S1.7',
    tags: {
        subject: 'S1.7',
        math: ['MATH.COMPLEX', 'MATH.FOURIER', 'MATH.APPROX'],
        method: ['METH.ATTEN'],
        quantity: ['Q.VEL', 'Q.FREQ'],
        keywords: t('Kramers Kronig 因果性 解析性 频散 主值积分 希尔伯特变换 常数 Q 对数频散', 'Kramers Kronig causality analyticity dispersion principal value Hilbert transform constant Q logarithmic dispersion'),
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `M'(\omega)-M(\infty)=\frac{2}{\pi}\,\mathcal{P}\!\int_{0}^{\infty}\frac{\omega' M''(\omega')}{\omega^{2}-\omega'^{2}}\,\mathrm{d}\omega',\qquad M''(\omega)=\frac{2\omega}{\pi}\,\mathcal{P}\!\int_{0}^{\infty}\frac{M'(\omega')-M(\infty)}{\omega'^{2}-\omega^{2}}\,\mathrm{d}\omega'`,
        variants: [
            {
                name: t('因果性的数学表述：M*(ω) 在下半平面解析', 'Mathematical statement of causality: M*(ω) is analytic in the lower half-plane'),
                latex: String.raw `M^{*}(\omega)=i\omega\int_{0}^{\infty}\!M(\tau)\,e^{-i\omega\tau}\,\mathrm{d}\tau\;\Longrightarrow\; M^{*}(\omega)\ \text{在}\ \operatorname{Im}\omega<0\ \text{解析}`,
            },
            {
                name: t('最实用的推论：Q 为常数 ⟹ 速度随频率对数上升', 'The most useful corollary: constant Q implies a logarithmic rise of velocity with frequency'),
                latex: String.raw `\frac{c(\omega_{2})}{c(\omega_{1})}=1+\frac{1}{\pi Q}\ln\frac{\omega_{2}}{\omega_{1}},\qquad \frac{1}{Q}=\pi\,\frac{\mathrm{d}\ln c}{\mathrm{d}\ln\omega}`,
            },
            {
                name: t('写成模量形式', 'In modulus form'),
                latex: String.raw `\frac{M'(\omega_{2})}{M'(\omega_{1})}=1+\frac{2}{\pi Q}\ln\frac{\omega_{2}}{\omega_{1}}`,
            },
            {
                name: t('一般（Q 随频率变）的局部形式', 'Local form for a general, frequency-dependent Q'),
                latex: String.raw `\frac{1}{Q(\omega)}\approx\pi\,\frac{\mathrm{d}\ln c}{\mathrm{d}\ln\omega}\bigg|_{\omega}\quad (\text{要求}\ Q^{-1}\ \text{随}\ \omega\ \text{缓变})`,
            },
            {
                name: t('离散（对数等间隔）求和形式，便于数值实现', 'Discrete (log-spaced) sum form, convenient for numerical work'),
                latex: String.raw `\frac{c(\omega)}{c(\omega_{0})}\approx 1+\frac{1}{\pi Q}\ln\frac{\omega}{\omega_{0}}\;\xrightarrow{\ \text{分段常数}\ Q\ }\; 1+\frac{1}{\pi}\sum_{n}\frac{1}{Q_{n}}\ln\frac{\omega_{n+1}}{\omega_{n}}`,
            },
        ],
    },
    meaning: t('因果性（响应不能早于激励）在数学上等价于复模量在半个复频率平面上解析，而解析性又强迫实部与虚部互为希尔伯特变换 —— 这就是 Kramers–Kronig 关系。它的物理分量极重：衰减（M″，也就是 Q）与频散（M′ 随 ω 的变化，也就是速度随频率的变化）不是两个独立现象，而是同一件事的两面。想造一个「有衰减但不频散」的介质，就像想造一个只有北面没有南面的磁铁一样不可能。在地幔里，Q ≈ 常数意味着速度按 ln ω 上升，地震频段（mHz–Hz）与实验室频段（MHz）的速度差因此可达几个百分点。', 'Causality (a response cannot precede its stimulus) is mathematically equivalent to the complex modulus being analytic in one half of the complex frequency plane, and analyticity forces the real and imaginary parts to be Hilbert transforms of each other. That is the Kramers–Kronig relation. Its physical weight is considerable: attenuation (M″, hence Q) and dispersion (the variation of M′ with ω, hence of velocity with frequency) are not two independent phenomena but two faces of the same one. Building a medium that attenuates without dispersing is as impossible as a magnet with a north pole and no south pole. In the mantle, near-constant Q means that velocity rises as ln ω, so velocities in the seismic band (mHz–Hz) and in the laboratory (MHz) can differ by several percent.'),
    symbols: [
        { sym: 'M\'(\\omega)', name: t('储能模量（决定相速度）', 'storage modulus (sets the phase velocity)'), unit: 'Pa', typical: '10¹⁰ – 10¹¹' },
        { sym: 'M\'\'(\\omega)', name: t('损耗模量（决定 Q⁻¹）', 'loss modulus (sets Q⁻¹)'), unit: 'Pa', typical: '10⁷ – 10⁹' },
        { sym: 'M(\\infty)', name: t('未松弛（高频）模量 M_U', 'unrelaxed (high-frequency) modulus M_U'), unit: 'Pa' },
        { sym: '\\mathcal{P}', name: t('柯西主值积分', 'Cauchy principal value of the integral'), unit: '1' },
        { sym: 'c(\\omega)', name: t('频率相关的相速度', 'frequency-dependent phase velocity'), unit: 'm/s', typical: '2000 – 8000' },
        { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '1', typical: '20 – 600' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s', typical: '10⁻³ – 10⁶' },
    ],
    conditions: {
        applies: [
            t('任何线性、因果、稳定的黏弹性介质', 'Any linear, causal and stable viscoelastic medium'),
            t('需要从衰减谱预测速度频散（或反过来）时', 'Whenever the velocity dispersion must be predicted from the attenuation spectrum, or conversely'),
        ],
        assumes: [
            t('采用 u ∝ e^{+iωt} 约定；此时 M*(ω) 在下半平面解析。若改用 e^{−iωt}，两式的整体符号要反过来', 'The u ∝ e^{+iωt} convention is used, under which M*(ω) is analytic in the lower half-plane. With e^{−iωt} the overall signs of both relations reverse'),
            t('M*(ω) 在无穷远处有界（趋于 M_U）', 'M*(ω) is bounded at infinity (tending to M_U)'),
            t('M*(−ω) = conj(M*(ω))，即松弛函数为实函数', 'M*(−ω) = conj(M*(ω)), that is, the relaxation function is real'),
        ],
        breaks: [
            t('实测只能在有限频带内进行，主值积分必须截断，因此需要假设带外行为（通常用常数 Q 外推）', 'Measurements span a finite band only, so the principal-value integral must be truncated and out-of-band behaviour assumed (usually constant-Q extrapolation)'),
            t('若把散射造成的「视衰减」代入，会预测出并不存在的速度频散', 'Inserting the apparent attenuation caused by scattering predicts a velocity dispersion that does not exist'),
            t('非线性或非平衡的介质不满足叠加性，KK 关系不成立', 'Nonlinear or non-equilibrated media violate superposition and the KK relations do not apply'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'physics',
            title: t('因果性：松弛函数只在 τ > 0 时有值', 'Causality: the relaxation function is non-zero only for τ > 0'),
            latex: String.raw `\sigma(t)=\int_{-\infty}^{t}\!M(t-t')\,\dot{\varepsilon}(t')\,\mathrm{d}t'\;\Longrightarrow\; M^{*}(\omega)=i\omega\int_{0}^{\infty}\!M(\tau)\,e^{-i\omega\tau}\,\mathrm{d}\tau`,
            note: t('积分下限是 0 而不是 −∞，这是因果性的全部内容；换成 e^{+iωt} 约定则解析性在下半平面。', 'The lower limit being 0 rather than −∞ is the entire content of causality. With the e^{+iωt} convention this places analyticity in the lower half-plane.'),
        },
        {
            n: 2,
            op: 'transform',
            title: t('柯西定理 ⟹ Plemelj 公式（单侧谱关系）', 'Cauchy theorem implies the Plemelj formula (one-sided spectral relation)'),
            latex: String.raw `M^{*}(\omega)-M(\infty)=\frac{i}{\pi}\,\mathcal{P}\!\int_{-\infty}^{\infty}\frac{M^{*}(\omega')-M(\infty)}{\omega'-\omega}\,\mathrm{d}\omega'`,
            note: t('在下半平面闭合围道、大圆弧上被积函数趋于零，剩下的就是沿实轴的主值积分。', 'Closing the contour in the lower half-plane, where the integrand vanishes on the large arc, leaves the principal-value integral along the real axis.'),
        },
        {
            n: 3,
            op: 'identity',
            title: t('利用 M*(−ω) = conj(M*(ω)) 把积分折到正频率', 'Fold the integral onto positive frequencies using M*(−ω) = conj(M*(ω))'),
            latex: String.raw `\int_{-\infty}^{\infty}\to\int_{0}^{\infty}\frac{2\omega\,g_{R}(\omega')+2i\omega' g_{I}(\omega')}{\omega'^{2}-\omega^{2}}\,\mathrm{d}\omega',\qquad g\equiv M^{*}-M(\infty)`,
            note: t('这一步把 −∞ 到 0 的部分与 0 到 ∞ 的部分合并，实部与虚部分别对应 M′ − M_U 与 M″。', 'This step merges the −∞ to 0 portion with the 0 to ∞ portion; the real and imaginary parts map onto M′ − M_U and M″ respectively.'),
        },
        {
            n: 4,
            op: 'algebra',
            title: t('分出实部与虚部，得到 Kramers–Kronig 对', 'Split real and imaginary parts to obtain the Kramers–Kronig pair'),
            latex: String.raw `M'(\omega)-M(\infty)=\frac{2}{\pi}\,\mathcal{P}\!\int_{0}^{\infty}\frac{\omega' M''(\omega')}{\omega^{2}-\omega'^{2}}\,\mathrm{d}\omega',\qquad M''(\omega)=\frac{2\omega}{\pi}\,\mathcal{P}\!\int_{0}^{\infty}\frac{M'(\omega')-M(\infty)}{\omega'^{2}-\omega^{2}}\,\mathrm{d}\omega'`,
            note: t('第一式说：只要知道所有频率上的 Q，就能算出任何频率的速度。第二式是它的逆。', 'The first relation says that knowing Q at all frequencies determines the velocity at any frequency. The second is its inverse.'),
        },
        {
            n: 5,
            op: 'substitute',
            title: t('代入 Q⁻¹ = 常数：做积分得到对数频散', 'Insert Q⁻¹ = constant: the integral yields logarithmic dispersion'),
            latex: String.raw `M''=\frac{M'}{Q}\ \text{(常数比)}\;\Longrightarrow\; M'(\omega)\propto \omega^{\,2/\pi Q}\ \text{的线性化}\;\Longrightarrow\; \frac{M'(\omega_{2})}{M'(\omega_{1})}=1+\frac{2}{\pi Q}\ln\frac{\omega_{2}}{\omega_{1}}`,
            note: t('严格的做法是把 M* = M₁(iω)^{2a}（a = Q⁻¹/π）代入并验证它确实满足解析性；这样 |M*| ∝ ω^{2a}，一步得到幂律。', 'Rigorously one inserts M* = M₁(iω)^{2a} with a = Q⁻¹/π and verifies that it is analytic; then |M*| ∝ ω^{2a} and the power law follows in one step.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('换成速度，并给出局部（微分）形式', 'Convert to velocity and give the local (differential) form'),
            latex: String.raw `c=\sqrt{\frac{M'}{\rho}}\;\Longrightarrow\; \frac{c(\omega_{2})}{c(\omega_{1})}=1+\frac{1}{\pi Q}\ln\frac{\omega_{2}}{\omega_{1}},\qquad \frac{1}{Q(\omega)}=\pi\,\frac{\mathrm{d}\ln c}{\mathrm{d}\ln\omega}`,
            note: t('开方把系数 2 变成 1。这个式子被广泛用于把实验室超声速度「校正」到地震频带，也被用于从频散曲线反推 Q。', 'Taking the square root halves the coefficient from 2 to 1. This expression is widely used to correct laboratory ultrasonic velocities down to the seismic band and to invert Q from dispersion curves.'),
        },
    ],
    viz: [
        {
            id: 'constant-q-dispersion',
            level: 'V1',
            title: t('常数 Q 导致的对数速度频散', 'Logarithmic velocity dispersion caused by constant Q'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('c(f)/c(f₀)', 'c(f)/c(f₀)'),
            xScale: 'log',
            controls: [
                { id: 'kq', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 1000, step: 10, value: 100, unit: '1' },
                { id: 'kf0', label: t('参考频率 f₀', 'reference frequency f₀'), min: 0.01, max: 100, step: 0.01, value: 1, unit: 'Hz' },
            ],
            xRange: [1e-3, 1e3],
            note: t('纵轴是速度相对于参考频率 f₀ 处的值。Q 越小，斜率越大（频散越强）；Q = 1000 时曲线几乎水平。从 1 mHz 到 1 kHz（六个十进位）、Q = 100，速度只上升约 4.4% —— 这个量级刚好是「地震频带 vs 实验室频带」观测到的差异。', 'The vertical axis is the velocity relative to its value at the reference frequency f₀. The smaller Q, the steeper the slope (the stronger the dispersion); at Q = 1000 the curve is nearly flat. From 1 mHz to 1 kHz (six decades) with Q = 100 the velocity rises by only about 4.4%, which is just the size of the discrepancy observed between seismic and laboratory bands.'),
            compute: (p) => {
                const q = p['kq'], f0 = p['kf0'];
                if (!(q > 0 && f0 > 0))
                    return [];
                const pts = [];
                const N = 300;
                const lo = 1e-3;
                const hi = 1e3;
                for (let i = 0; i <= N; i++) {
                    const f = Math.pow(10, Math.log10(lo) + (i / N) * Math.log10(hi / lo));
                    pts.push([f, 1 + (1 / (Math.PI * q)) * Math.log(f / f0)]);
                }
                return [{ label: t('c(f)/c(f₀)', 'c(f)/c(f₀)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    links: {
        upstream: [
            { id: 'complex-modulus', note: t('M* = M′ + iM″ 的复表示', 'the complex representation M* = M′ + iM″') },
            { id: 'debye-peak-relaxation', note: t('给出 Q⁻¹(ω) 的具体频谱', 'gives an explicit spectrum for Q⁻¹(ω)') },
        ],
        seealso: [
            { id: 'quality-factor-q', note: t('Q 的观测值', 'observed values of Q') },
            { id: 'fourier-transform', note: t('因果性与解析性的变换论基础', 'the transform-theoretic basis of causality and analyticity') },
        ],
    },
    refs: [
        { text: 'Futterman (1962), Dispersive body waves, JGR 67, 5279–5291' },
        { text: 'Liu, Anderson & Kanamori (1976), Velocity dispersion due to anelasticity, GJI 47, 41–58' },
        { text: 'Kanamori & Anderson (1977), Importance of physical dispersion in surface-wave and free-oscillation problems, RG 15, 105–112' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.5' },
    ],
};
export default kramersKronigDispersion;
//# sourceMappingURL=kramers-kronig-dispersion.js.map