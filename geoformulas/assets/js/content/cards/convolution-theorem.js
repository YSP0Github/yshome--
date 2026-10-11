import { t } from '../../core/types.js';
/** convolution-theorem */
const convolutionTheorem = {
    id: 'convolution-theorem',
    name: t('褶积定理', 'The Convolution Theorem'),
    aliases: { zh: ['卷积定理', '褶积定理', '时域褶积频域相乘'], en: ['convolution theorem', 'faltung', 'time convolution frequency multiplication'] },
    node: 'S0.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.PROC', 'METH.INSTR'],
        quantity: ['Q.AMP', 'Q.FREQ'],
        keywords: t('褶积 卷积 定理 滤波 反褶积 子波 仪器响应 源时间函数', 'convolution faltung filtering deconvolution wavelet instrument response source time function'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\mathcal{F}\{f*g\}=F(\omega)\,G(\omega)`,
        variants: [
            { name: t('褶积的定义', 'Definition of convolution'), latex: String.raw `(f*g)(t)=\int_{-\infty}^{\infty}f(\tau)\,g(t-\tau)\,\dd\tau` },
            { name: t('对偶形式：频域褶积对应时域相乘', 'Dual form: convolution in frequency corresponds to multiplication in time'), latex: String.raw `\mathcal{F}\{f\,g\}=\frac{1}{2\pi}\,(F*G)(\omega)` },
            { name: t('反褶积（除法形式）', 'Deconvolution, the division form'), latex: String.raw `f(t)=\mathcal{F}^{-1}\!\left\{\frac{(f*g)^{\wedge}(\omega)}{G(\omega)}\right\}` },
            { name: t('离散形式（循环褶积）', 'Discrete form, circular convolution'), latex: String.raw `\mathrm{DFT}\{x\circledast h\}_n=X_n\,H_n` },
        ],
    },
    meaning: t('褶积定理说：时间域里最笨重的操作（把一个函数翻转、平移、逐点相乘再积分），到了频率域只是两个数相乘。地震学几乎所有正演都是褶积 —— 震源时间函数 * 传播算子 * 仪器响应 * 反射系数序列 —— 而所有反问题（反褶积、去仪器、提分辨率）都是在这个定理的指导下做除法。', 'The convolution theorem says that the clumsiest operation in the time domain — flip one function, shift it, multiply point by point, integrate — is nothing more than the multiplication of two numbers in the frequency domain. Almost every forward problem in seismology is a convolution: source time function convolved with the propagation operator, the instrument response and the reflectivity series. Every inverse problem — deconvolution, instrument removal, resolution enhancement — is a division guided by this very theorem.'),
    symbols: [
        { sym: 'f*g', name: t('f 与 g 的褶积', 'convolution of f with g'), unit: '两者单位之积 · s' },
        { sym: 'F(\\omega), G(\\omega)', name: t('各自的 Fourier 变换', 'the respective Fourier transforms'), unit: '各自单位 · s' },
        { sym: '\\tau', name: t('积分哑变量（滞后时间）', 'dummy integration variable, the lag'), unit: 's' },
        { sym: 'h(t)', name: t('滤波器或仪器的脉冲响应', 'impulse response of a filter or instrument'), unit: '1' },
        { sym: '\\circledast', name: t('循环褶积（DFT 下的褶积）', 'circular convolution, the convolution implied by the DFT'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('f、g 至少一方绝对可积或平方可积', 'At least one of f and g is absolutely or squarely integrable'),
            t('离散情形需补零至足够长度，避免循环褶积混叠', 'In the discrete case, pad with zeros to sufficient length so that circular convolution does not wrap around'),
        ],
        assumes: [
            t('线性时不变（LTI）系统：褶积才是对输入的完整描述', 'A linear time-invariant system, so that convolution fully describes the response to any input'),
            t('反褶积时 G(ω) 在关心频带内不为零', 'For deconvolution, G(ω) must be non-zero throughout the band of interest'),
        ],
        breaks: [
            t('时变系统（如随时间变化的增益）不能写成单一褶积', 'A time-varying system, a time-dependent gain for instance, cannot be written as a single convolution'),
            t('G(ω) 有零点或近零点时除法放大噪声，需加白噪（预白化）或正则化', 'Where G(ω) vanishes or nearly vanishes, division amplifies noise: add white noise, that is pre-whitening, or regularise'),
            t('非线性效应（如强地面运动中的土体非线性）破坏褶积模型', 'Nonlinear effects such as soil nonlinearity in strong motion break the convolution model'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('写出褶积的 Fourier 变换', 'Write the Fourier transform of the convolution'),
            latex: String.raw `\mathcal{F}\{f*g\}=\int\left[\int f(\tau)g(t-\tau)\dd\tau\right]e^{-i\omega t}\dd t`,
        },
        {
            n: 2,
            op: 'algebra',
            title: t('交换积分次序（Fubini）', 'Swap the order of integration, Fubini'),
            latex: String.raw `=\int f(\tau)\left[\int g(t-\tau)e^{-i\omega t}\dd t\right]\dd\tau`,
        },
        {
            n: 3,
            op: 'transform',
            title: t('对内层积分换元 s = t − τ', 'Change variables in the inner integral, s = t − τ'),
            latex: String.raw `\int g(s)\,e^{-i\omega(s+\tau)}\dd s=e^{-i\omega\tau}G(\omega)`,
            note: t('这正是时移定理：平移 τ 只是多出一个相位因子。', 'This is precisely the shift theorem: a shift by τ contributes only a phase factor.'),
        },
        {
            n: 4,
            op: 'substitute',
            title: t('代回外层积分', 'Substitute back into the outer integral'),
            latex: String.raw `=\int f(\tau)e^{-i\omega\tau}\dd\tau\;G(\omega)=F(\omega)\,G(\omega)`,
        },
        {
            n: 5,
            op: 'result',
            title: t('结论与物理解读', 'Conclusion and its physical reading'),
            latex: String.raw `\mathcal{F}\{f*g\}=F\,G\;\Longleftrightarrow\; (f*g)(t)=\frac{1}{2\pi}\int F(\omega)G(\omega)e^{i\omega t}\dd\omega`,
            note: t('褶积就是「先把两个谱逐频点相乘，再变回来」。计算量从 O(N²) 降到 O(N log N)，这是 FFT 改变地震数据处理的根本原因。', 'Convolving means multiplying the two spectra bin by bin and transforming back. The cost falls from O(N²) to O(N log N), the reason the FFT transformed seismic processing.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('地震学的标准用例', 'The standard seismological use'),
            latex: String.raw `d(t)=s(t)*e(t)*g(t)*r(t)\;\Longrightarrow\;D(\omega)=S\,E\,G\,R`,
            note: t('震源、传播、仪器、反射率四者的谱直接相乘，因此每一环都可以单独剔除 —— 这就是反褶积。', 'The spectra of source, propagation, instrument and reflectivity simply multiply, so each link can be removed on its own; that is deconvolution.'),
        },
    ],
    viz: [
        {
            id: 'box-convolution',
            level: 'V1',
            title: t('两个矩形褶积成三角形', 'Two boxes convolve into a triangle'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('归一化幅度', 'normalised amplitude'),
            controls: [
                { id: 'a', label: t('第一个矩形宽度 a', 'width a of the first box'), min: 0.2, max: 4, step: 0.1, value: 1, unit: 's' },
                { id: 'b', label: t('第二个矩形宽度 b', 'width b of the second box'), min: 0.2, max: 4, step: 0.1, value: 2, unit: 's' },
            ],
            xRange: [-2, 8],
            note: t('两个宽度分别为 a、b 的矩形褶积，结果是高为 min(a,b)、底宽 a+b 的梯形（a = b 时退化为三角形）。在时间域要翻转、平移、积分；在频率域只需把两个 sinc 相乘。', 'Convolving boxes of widths a and b gives a trapezoid of height min(a,b) and base a+b, degenerating to a triangle when a = b. In the time domain this needs flipping, shifting and integrating; in the frequency domain it is just the product of two sincs.'),
            compute: (p) => {
                const a = p['a'];
                const b = p['b'];
                const lo = -2;
                const hi = 8;
                const M = 600;
                const boxA = [];
                const boxB = [];
                const conv = [];
                for (let i = 0; i <= M; i++) {
                    const t = lo + (i / M) * (hi - lo);
                    const va = t >= 0 && t <= a ? 1 : 0;
                    const vb = t >= 0 && t <= b ? 1 : 0;
                    boxA.push([t, va]);
                    boxB.push([t, vb]);
                    let s = 0;
                    const nStep = 400;
                    for (let j = 0; j <= nStep; j++) {
                        const tau = (j / nStep) * a;
                        const inB = t - tau >= 0 && t - tau <= b ? 1 : 0;
                        s += inB;
                    }
                    conv.push([t, (s * a) / nStep]);
                }
                return [
                    { label: t('矩形 a', 'box a'), color: '#B4B2A9', dash: true, points: boxA },
                    { label: t('矩形 b', 'box b'), color: '#BA7517', dash: true, points: boxB },
                    { label: t('褶积结果', 'convolution result'), color: '#185FA5', points: conv },
                ];
            },
        },
        {
            id: 'spectral-product',
            level: 'V1',
            title: t('频域相乘：两个 sinc 的乘积', 'Multiplication in frequency: the product of two sincs'),
            xlabel: t('角频率 ω (rad/s)', 'angular frequency ω (rad/s)'),
            ylabel: t('归一化幅度', 'normalised amplitude'),
            controls: [
                { id: 'a2', label: t('第一个矩形宽度 a', 'width a of the first box'), min: 0.2, max: 4, step: 0.1, value: 1, unit: 's' },
                { id: 'b2', label: t('第二个矩形宽度 b', 'width b of the second box'), min: 0.2, max: 4, step: 0.1, value: 2, unit: 's' },
            ],
            xRange: [-30, 30],
            note: t('按褶积定理，把两个矩形的谱逐频点相乘，再变回时间域就得到上一张图的三角形。相乘后的谱高频衰减更快 —— 褶积总是让波形变平滑，这就是子波使反射系数序列「变胖」的原因。', 'By the convolution theorem, multiplying the two box spectra bin by bin and transforming back yields the triangle of the previous figure. The product decays faster at high frequencies: convolution always smooths, which is why a wavelet fattens a reflectivity series.'),
            compute: (p) => {
                const a = p['a2'];
                const b = p['b2'];
                const fA = [];
                const fB = [];
                const prod = [];
                for (let i = 0; i <= 900; i++) {
                    const w = -30 + (i / 900) * 60;
                    const xa = (w * a) / 2;
                    const xb = (w * b) / 2;
                    const sa = Math.abs(xa) < 1e-9 ? 1 : Math.abs(Math.sin(xa) / xa);
                    const sb = Math.abs(xb) < 1e-9 ? 1 : Math.abs(Math.sin(xb) / xb);
                    fA.push([w, sa]);
                    fB.push([w, sb]);
                    prod.push([w, sa * sb]);
                }
                return [
                    { label: t('|Fa(ω)|', '|Fa(ω)|'), color: '#B4B2A9', dash: true, points: fA },
                    { label: t('|Fb(ω)|', '|Fb(ω)|'), color: '#BA7517', dash: true, points: fB },
                    { label: t('乘积 |Fa·Fb|', 'product |Fa·Fb|'), color: '#0F6E56', points: prod },
                ];
            },
        },
    ],
    example: {
        title: t('去掉仪器响应', 'Removing the instrument response'),
        input: t('记录 d(t) = 地面运动 u(t) * 仪器响应 i(t)，已知 I(ω)', 'A record d(t) = ground motion u(t) convolved with the instrument response i(t), with I(ω) known'),
        steps: [
            t('变换：D(ω) = U(ω) I(ω)', 'Transform: D(ω) = U(ω) I(ω)'),
            t('除法：U(ω) = D(ω)/I(ω)，在 I 接近零的频段加水印正则化', 'Divide: U(ω) = D(ω)/I(ω), with water-level regularisation where I approaches zero'),
            t('反变换得到真实地面运动', 'Transform back to obtain the true ground motion'),
        ],
        output: t('这一步做完，不同台网的记录才可互相比较，也才能用于震级与震源谱测定', 'Only after this step are records from different networks comparable, and usable for magnitude and source-spectrum work'),
    },
    links: {
        upstream: [
            { id: 'fourier-transform-pair', note: t('定理的基础', 'the foundation of the theorem') },
            { id: 'fourier-shift-theorem', note: t('推导内层积分时用到', 'used when evaluating the inner integral') },
        ],
        downstream: [
            { id: 'discrete-fourier-transform', note: t('实际计算用 DFT 实现快速褶积', 'in practice fast convolution is implemented with the DFT') },
            { id: 'seismometer-equation', note: t('仪器响应就是一个褶积核', 'the instrument response is exactly a convolution kernel') },
        ],
        seealso: [{ id: 'brune-source-spectrum' }],
    },
    refs: [
        { text: 'Bracewell, The Fourier Transform and Its Applications, 3rd ed., §4' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.4' },
    ],
};
export default convolutionTheorem;
//# sourceMappingURL=convolution-theorem.js.map