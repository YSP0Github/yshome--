import { t } from '../../core/types.js';
/** debye-peak-relaxation */
const debyePeakRelaxation = {
    id: 'debye-peak-relaxation',
    name: t('松弛时间、Debye 峰与 Q⁻¹(ω) 的频散', 'Relaxation Times, the Debye Peak and the Dispersion of Q⁻¹(ω)'),
    aliases: {
        zh: ['Debye 峰', '弛豫峰', '吸收带', 'Q 频散'],
        en: ['Debye peak', 'relaxation peak', 'absorption band', 'Q dispersion'],
    },
    node: 'S1.7',
    tags: {
        subject: 'S1.7',
        math: ['MATH.COMPLEX', 'MATH.FOURIER', 'MATH.APPROX'],
        method: ['METH.ATTEN', 'METH.ROCK'],
        quantity: ['Q.FREQ', 'Q.MAT'],
        keywords: t('Debye 峰 弛豫时间 吸收带 Q 频散 半高宽 机制叠加 Arrhenius 活化能', 'Debye peak relaxation time absorption band Q dispersion full width at half maximum mechanism superposition Arrhenius activation energy'),
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `Q^{-1}(\omega)=\frac{\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}}=\Delta\,\frac{\omega\tau_{m}}{1+\omega^{2}\tau_{m}^{2}},\qquad \tau_{m}\equiv\sqrt{\tau_{\varepsilon}\tau_{\sigma}}`,
        variants: [
            {
                name: t('用峰高与峰位写成标准 Debye 形式', 'Standard Debye form written with peak height and peak position'),
                latex: String.raw `Q^{-1}(\omega)=2Q^{-1}_{\max}\,\frac{\omega\tau_{m}}{1+\omega^{2}\tau_{m}^{2}},\qquad Q^{-1}_{\max}=\frac{\tau_{\varepsilon}-\tau_{\sigma}}{2\sqrt{\tau_{\varepsilon}\tau_{\sigma}}}=\frac{\Delta}{2}`,
            },
            {
                name: t('峰值条件与峰值高度', 'Peak condition and peak height'),
                latex: String.raw `\left.\frac{\mathrm{d}Q^{-1}}{\mathrm{d}\omega}\right|_{\omega\,\tau_{m}=1}=0,\qquad \omega_{\text{峰}}=\frac{1}{\tau_{m}},\qquad f_{\text{峰}}=\frac{1}{2\pi\tau_{m}}`,
            },
            {
                name: t('半高宽：在 log 频率上恒定约 1.144 个十进位', 'Full width at half maximum: a constant 1.144 decades in log frequency'),
                latex: String.raw `\frac{\omega\tau_{m}}{1+\omega^{2}\tau_{m}^{2}}=\frac{1}{4}\;\Longrightarrow\; \omega\tau_{m}=2\pm\sqrt{3},\qquad \log_{10}\frac{2+\sqrt{3}}{2-\sqrt{3}}=1.144`,
            },
            {
                name: t('叠加多个机制：近似与频率无关的 Q', 'Superposing several mechanisms: a nearly frequency-independent Q'),
                latex: String.raw `Q^{-1}(\omega)=\sum_{n}2Q^{-1}_{\max,n}\,\frac{\omega\tau_{n}}{1+\omega^{2}\tau_{n}^{2}}\;\xrightarrow[\tau_n\ \text{对数均匀}]{}\ \text{常数}`,
            },
            {
                name: t('松弛时间的温度依赖（Arrhenius）', 'Temperature dependence of the relaxation time (Arrhenius)'),
                latex: String.raw `\tau(T)=\tau_{0}\exp\!\left(\frac{H^{*}}{RT}\right),\qquad H^{*}=E^{*}+PV^{*}`,
            },
        ],
    },
    meaning: t('一个单一的弛豫机制只在它自己的特征频率附近耗能：Q⁻¹ 在 ωτ_m = 1 处出现一个钟形峰，峰宽在频率对数轴上固定为 1.144 个十进位（这就是 Debye 峰）。可是地震观测告诉我们，地球在 10⁻³ – 10² Hz 的宽频带内 Q 几乎是常数。矛盾的解法是：把许多特征时间横跨若干十进位的机制叠加起来，峰与峰互相填平，就得到一条平的吸收带。这条思路是「用 Q 的频散反推地幔温度与粒度」这类研究的理论基石。', 'A single relaxation mechanism dissipates energy only near its own characteristic frequency: Q⁻¹ shows a bell-shaped peak at ωτ_m = 1 whose width is fixed at 1.144 decades on a frequency logarithm axis. This is the Debye peak. Yet seismic observation shows that the Earth has an almost constant Q across the broad band from 10⁻³ to 10² Hz. The resolution is to superpose many mechanisms whose characteristic times span several decades: the peaks fill each other in and a flat absorption band results. That idea underpins studies which infer mantle temperature and grain size from the dispersion of Q.'),
    symbols: [
        { sym: 'Q^{-1}(\\omega)', name: t('内耗的频谱', 'the spectrum of internal friction'), unit: '1', typical: '0.002 – 0.05' },
        { sym: '\\tau_m', name: t('特征（几何平均）松弛时间', 'characteristic (geometric mean) relaxation time'), unit: 's', typical: '10⁻⁶ – 10⁶' },
        { sym: '\\tau_\\sigma,\\tau_\\varepsilon', name: t('应力松弛与应变滞后时间', 'stress-relaxation and strain-retardation times'), unit: 's' },
        { sym: '\\Delta', name: t('松弛强度 (τ_ε − τ_σ)/τ_m', 'relaxation strength (τ_ε − τ_σ)/τ_m'), unit: '1', typical: '0.01 – 0.3' },
        { sym: 'Q^{-1}_{\\max}', name: t('Debye 峰的峰值高度 Δ/2', 'peak height of the Debye peak, Δ/2'), unit: '1', typical: '0.005 – 0.15' },
        { sym: 'H^{*}', name: t('活化焓', 'activation enthalpy'), unit: 'J/mol', typical: '2×10⁵ – 6×10⁵' },
        { sym: 'T', name: t('绝对温度', 'absolute temperature'), unit: 'K', typical: '600 – 1800（上地幔）' },
    ],
    conditions: {
        applies: [
            t('单一或若干离散弛豫机制主导的线性黏弹性介质', 'Linear viscoelastic media dominated by one or several discrete relaxation mechanisms'),
            t('把实验室（高频）结果外推到地震频带（低频）时', 'Extrapolating laboratory (high-frequency) results into the seismic band (low frequency)'),
        ],
        assumes: [
            t('每个机制都可用一个标准线性固体描述，机制之间线性叠加', 'Each mechanism is described by a standard linear solid and the mechanisms superpose linearly'),
            t('τ_ε > τ_σ（被动性）', 'τ_ε > τ_σ (passivity)'),
            t('恒压恒温；温度效应通过 Arrhenius 关系单独引入', 'Constant pressure and temperature; temperature effects enter separately through the Arrhenius relation'),
        ],
        breaks: [
            t('真实的地幔矿物往往表现为「连续谱」而非离散机制，此时应改用分布的 τ（如 Cole–Cole 或 Andrade 模型）', 'Real mantle minerals often show a continuous rather than a discrete spectrum; a distributed τ (Cole–Cole or Andrade models) is then more appropriate'),
            t('部分熔融、流体饱和引起的衰减与频率的依赖形式不同（Biot 型峰在超声频段）', 'Attenuation from partial melt or fluid saturation has a different frequency dependence (Biot-type peaks sit in the ultrasonic band)'),
            t('散射造成的「视 Q」不是本征衰减，不能用弛豫谱描述', 'Apparent Q from scattering is not intrinsic attenuation and cannot be described by a relaxation spectrum'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('从标准线性固体的 M′、M″ 出发', 'Start from M′ and M″ of the standard linear solid'),
            latex: String.raw `M'=M_{R}\frac{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}}{1+\omega^{2}\tau_{\sigma}^{2}},\qquad M''=M_{R}\frac{\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\sigma}^{2}}`,
        },
        {
            n: 2,
            op: 'substitute',
            title: t('取比值 Q⁻¹ = M″/M′', 'Form the ratio Q⁻¹ = M″/M′'),
            latex: String.raw `Q^{-1}(\omega)=\frac{M''}{M'}=\frac{\omega\left(\tau_{\varepsilon}-\tau_{\sigma}\right)}{1+\omega^{2}\tau_{\varepsilon}\tau_{\sigma}}`,
            note: t('分母里的 τ_σ² 被 τ_ετ_σ 替换 —— 这一步化简是 Zener 模型特有的，别的黏弹性网络给不出这么干净的形式。', 'The τ_σ² in the denominator is replaced by τ_ετ_σ: this simplification is specific to the Zener model, and other viscoelastic networks do not produce such a clean form.'),
        },
        {
            n: 3,
            op: 'identity',
            title: t('引入几何平均时间与松弛强度', 'Introduce the geometric mean time and the relaxation strength'),
            latex: String.raw `\tau_{m}\equiv\sqrt{\tau_{\varepsilon}\tau_{\sigma}},\qquad \Delta\equiv\frac{\tau_{\varepsilon}-\tau_{\sigma}}{\tau_{m}}\;\Longrightarrow\; Q^{-1}=\Delta\,\frac{\omega\tau_{m}}{1+\omega^{2}\tau_{m}^{2}}`,
            note: t('整个频谱只由两个数决定：峰位 τ_m 与峰高 Δ/2。', 'The whole spectrum is determined by just two numbers: the peak position τ_m and the peak height Δ/2.'),
        },
        {
            n: 4,
            op: 'algebra',
            title: t('求导定峰位与峰高', 'Differentiate to locate the peak and its height'),
            latex: String.raw `\frac{\mathrm{d}Q^{-1}}{\mathrm{d}\omega}=\Delta\,\tau_{m}\frac{1-\omega^{2}\tau_{m}^{2}}{\left(1+\omega^{2}\tau_{m}^{2}\right)^{2}}=0\;\Longrightarrow\; \omega_{\text{峰}}=\frac{1}{\tau_{m}},\qquad Q^{-1}_{\max}=\frac{\Delta}{2}`,
            note: t('因为 1 − ω²τ_m² 变号，峰是严格单峰的；且 Q⁻¹ 在 ω → 0 与 ω → ∞ 都以 0 收尾。', 'Because 1 − ω²τ_m² changes sign the peak is strictly single, and Q⁻¹ tends to zero at both ω → 0 and ω → ∞.'),
        },
        {
            n: 5,
            op: 'algebra',
            title: t('半高宽：在频率对数轴上是一个常数', 'Full width at half maximum: a constant on a logarithmic frequency axis'),
            latex: String.raw `Q^{-1}=\frac{1}{2}Q^{-1}_{\max}\;\Longrightarrow\; \omega\tau_{m}=2\pm\sqrt{3},\qquad \log_{10}\!\left(\frac{2+\sqrt{3}}{2-\sqrt{3}}\right)=1.144\ \text{decades}`,
            note: t('这个 1.144 与 τ_m、Δ 完全无关 —— 它是 Debye 峰的「指纹」。野外若测到明显更宽的峰，就说明不是一个机制。', 'The value 1.144 is completely independent of τ_m and Δ: it is the fingerprint of a Debye peak. A measurably wider peak in the field means more than one mechanism is involved.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('叠加多个机制 ⟹ 平的吸收带；温度通过 τ 移动整条谱', 'Superposing mechanisms gives a flat band; temperature shifts the whole spectrum through τ'),
            latex: String.raw `Q^{-1}(\omega)=\sum_{n}\Delta_{n}\frac{\omega\tau_{n}}{1+\omega^{2}\tau_{n}^{2}},\qquad \tau_{n}(T)=\tau_{0}\exp\!\left(\frac{H^{*}}{RT}\right)`,
            note: t('τ 随温度指数变化，所以同一个机制在热的地方落在高频、在冷的地方落在低频。这解释了为什么同一套岩石在实验室（MHz）与地震频带（Hz）表现完全不同，也让 Q 成为温度计。', 'Because τ varies exponentially with temperature, the same mechanism sits at high frequency where it is hot and at low frequency where it is cold. That is why the same rock behaves so differently in the laboratory (MHz) and in the seismic band (Hz), and why Q can serve as a thermometer.'),
        },
    ],
    viz: [
        {
            id: 'debye-peak-spectrum',
            level: 'V1',
            title: t('Debye 峰随松弛时间移动，以及叠加后的吸收带', 'The Debye peak shifting with relaxation time, and the absorption band after superposition'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('内耗 Q⁻¹', 'internal friction Q⁻¹'),
            xScale: 'log',
            controls: [
                { id: 'ltm', label: t('log₁₀ τ_m (s)', 'log₁₀ τ_m (s)'), min: -6, max: 4, step: 0.1, value: -2, unit: '1' },
                { id: 'qmin', label: t('峰值处的 Q_min', 'Q_min at the peak'), min: 5, max: 500, step: 5, value: 50, unit: '1' },
                { id: 'ndec', label: t('叠加机制的跨度（十进位）', 'span of superposed mechanisms (decades)'), min: 0, max: 6, step: 0.5, value: 4, unit: 'dec' },
            ],
            xRange: [1e-6, 1e6],
            note: t('蓝线是单一机制的 Debye 峰：拖动 τ_m 可以让它整条沿频率轴平移，峰高与峰宽不变。绿线是把若干特征时间对数均匀分布的机制叠加后的结果 —— 跨度越大，峰顶越平。地震频带内 Q 近似常数，正是这个「峰填峰」的后果。', 'The blue curve is the Debye peak of a single mechanism: dragging τ_m translates the whole curve along the frequency axis while the height and width stay fixed. The green curve superposes mechanisms whose characteristic times are log-uniformly distributed; the wider the span, the flatter the top. The near-constant Q observed across the seismic band is a consequence of this peak-filling.'),
            compute: (p) => {
                const tauM = Math.pow(10, p['ltm']);
                const qmin = p['qmin'];
                const span = p['ndec'];
                if (!(tauM > 0 && qmin > 0))
                    return [];
                const peak = 1 / qmin;
                const single = [];
                const band = [];
                const N = 400;
                const f0 = 1e-6;
                const f1 = 1e6;
                const nM = 25;
                const taus = [];
                for (let n = 0; n < nM; n++) {
                    const u = n / (nM - 1);
                    const lg = Math.log10(tauM) + (u - 0.5) * span;
                    taus.push(Math.pow(10, lg));
                }
                for (let i = 0; i <= N; i++) {
                    const f = Math.pow(10, Math.log10(f0) + (i / N) * Math.log10(f1 / f0));
                    const w = 2 * Math.PI * f;
                    const x = w * tauM;
                    single.push([f, (2 * peak * x) / (1 + x * x)]);
                    let s = 0;
                    for (let n = 0; n < nM; n++) {
                        const y = w * taus[n];
                        s += (2 * peak * y) / (1 + y * y);
                    }
                    band.push([f, s / Math.sqrt(Math.max(1, span))]);
                }
                return [
                    { label: t('单一机制的 Debye 峰', 'Debye peak of a single mechanism'), color: '#185FA5', points: single },
                    { label: t('叠加后的吸收带', 'superposed absorption band'), color: '#0F6E56', points: band },
                ];
            },
        },
    ],
    links: {
        upstream: [
            { id: 'zener-standard-linear-solid', note: t('提供 M′、M″ 与两个 τ', 'supplies M′, M″ and the two τ') },
            { id: 'q-from-complex-modulus', note: t('Q⁻¹ = M″/M′', 'Q⁻¹ = M″/M′') },
        ],
        seealso: [{ id: 'quality-factor-q', note: t('观测到的 Q 与频率的弱依赖', 'the observed weak frequency dependence of Q') }],
    },
    refs: [
        { text: 'Liu, Anderson & Kanamori (1976), Velocity dispersion due to anelasticity, GJI 47, 41–58' },
        { text: 'Minster & Anderson (1981), A model of dislocation-controlled rheology for the mantle, Phil. Trans. R. Soc. A 299' },
        { text: 'Karato, Deformation of Earth Materials, Cambridge University Press (2008), ch. 11' },
    ],
};
export default debyePeakRelaxation;
//# sourceMappingURL=debye-peak-relaxation.js.map