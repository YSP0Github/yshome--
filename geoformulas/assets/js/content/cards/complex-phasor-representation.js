import { t } from '../../core/types.js';
/** complex-phasor-representation */
const complexPhasorRepresentation = {
    id: 'complex-phasor-representation',
    name: t('复振幅与相量表示', 'Complex Amplitude and Phasor Representation'),
    aliases: { zh: ['相量法', '复振幅', '解析表示法'], en: ['phasor', 'complex amplitude', 'analytic representation'] },
    node: 'S0.4',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.FOURIER'],
        method: ['METH.PROC'],
        quantity: ['Q.AMP', 'Q.FREQ'],
        keywords: t('相量 复振幅 振幅谱 相位谱 复波数 衰减', 'phasor complex amplitude amplitude spectrum phase spectrum complex wavenumber attenuation'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `u(t)=\Re\!\left\{A\,e^{i\omega t}\right\}=|A|\cos\!\left(\omega t+\arg A\right)`,
        variants: [
            { name: t('复振幅的直角分解', 'Rectangular decomposition of the complex amplitude'), latex: String.raw `A=a+ib,\qquad u(t)=a\cos\omega t-b\sin\omega t` },
            { name: t('从实振动反求复振幅', 'Recovering the complex amplitude from a real signal'), latex: String.raw `A=|A|\,e^{i\varphi},\qquad |A|=\sqrt{a^{2}+b^{2}},\qquad \varphi=\arctan\!\left(\frac{b}{a}\right)` },
            { name: t('包含传播与吸收的复波数', 'Complex wavenumber including propagation and attenuation'), latex: String.raw `u(x,t)=\Re\!\left\{A\,e^{i(\omega t-kx)}\right\},\qquad k=\frac{\omega}{c}-i\alpha` },
            { name: t('多个同频振动的叠加', 'Superposition of several same-frequency motions'), latex: String.raw `\Re\!\left\{\sum_{n}A_{n}e^{i\omega t}\right\}=\Re\!\left\{\left(\sum_{n}A_{n}\right)e^{i\omega t}\right\}` },
        ],
    },
    meaning: t('相量法把「一个振动」压缩成一个复数 A：模长是振幅，辐角是初相位。这样做的好处是，所有对时间的求导、积分、相移都变成对 A 的乘除（d/dt → iω），微分方程退化为代数方程。地震学里反射系数的频率依赖、仪器的标定响应、面波的频散，全部建立在相量运算之上。', 'The phasor method collapses an entire oscillation into one complex number A: its modulus is the amplitude, its argument the initial phase. The payoff is that every time derivative, integral and phase shift becomes multiplication or division on A (d/dt becomes iω), turning differential equations into algebraic ones. Frequency-dependent reflection coefficients, instrument calibration responses and surface-wave dispersion in seismology all rest on phasor algebra.'),
    symbols: [
        { sym: 'u(t)', name: t('实值振动（物理量）', 'real-valued motion (the physical quantity)'), unit: 'm' },
        { sym: 'A', name: t('复振幅（相量）', 'complex amplitude (phasor)'), unit: 'm' },
        { sym: '|A|', name: t('振幅，即相量的模', 'amplitude, the modulus of the phasor'), unit: 'm' },
        { sym: '\\arg A', name: t('初相位，即相量的辐角', 'initial phase, the argument of the phasor'), unit: 'rad' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: '\\Re\\{\\}', name: t('取实部', 'take the real part'), unit: '1' },
        { sym: 'k', name: t('波数（复数形式时虚部为吸收）', 'wavenumber (imaginary part gives absorption)'), unit: 'rad/m' },
        { sym: '\\alpha', name: t('空间吸收系数', 'spatial absorption coefficient'), unit: 'm⁻¹' },
    ],
    conditions: {
        applies: [
            t('线性系统、单一频率的稳态振动', 'Linear systems and steady-state motion at a single frequency'),
            t('求响应时先对复数运算，最后一步再取实部', 'Operate on the complex quantity and take the real part only at the final step'),
        ],
        assumes: [
            t('频率固定，系统已到达稳态（暂态已衰减完）', 'Frequency fixed and the system has reached steady state (transients decayed)'),
            t('介质参数与频率有关但与振幅无关（线性）', 'Medium parameters depend on frequency but not on amplitude (linearity)'),
        ],
        breaks: [
            t('不同频率的信号不能直接把复振幅相加，必须分频处理', 'Signals of different frequency cannot be added as phasors; they must be handled frequency by frequency'),
            t('非线性运算（如取绝对值、平方）必须先回到实信号再做', 'Nonlinear operations (absolute value, squaring) must be carried out on the real signal, not on the phasor'),
            t('注意约定：本卡片用 e^{iωt}，若改用 e^{−iωt} 则所有辐角变号', 'Mind the convention: this card uses e^{iωt}; switching to e^{−iωt} flips the sign of every argument'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('用 Euler 公式把余弦写成指数', 'Write the cosine as exponentials via Euler formula'),
            latex: String.raw `\cos\!\left(\omega t+\varphi\right)=\frac{1}{2}\left[e^{i(\omega t+\varphi)}+e^{-i(\omega t+\varphi)}\right]`,
            note: t('实信号必然同时含 +ω 与 −ω 两个分量，二者共轭，所以只保留一项也不会丢信息。', 'A real signal necessarily contains both +ω and −ω components, which are conjugate; keeping just one loses no information.') },
        { n: 2, op: 'setup', title: t('只保留正频率那一项并记为复信号', 'Keep only the positive-frequency term and call it the complex signal'),
            latex: String.raw `u_{c}(t)=|A|\,e^{i(\omega t+\varphi)}=\underbrace{|A|\,e^{i\varphi}}_{A}\,e^{i\omega t}=A\,e^{i\omega t}`,
            note: t('把振幅与相位打包成一个复数 A = |A|e^{iφ}，这就是「复振幅」。', 'Amplitude and phase are packed into one complex number A = |A|e^{iφ}. That is the complex amplitude.') },
        { n: 3, op: 'identity', title: t('取实部即可还原真实物理量', 'Taking the real part recovers the physical quantity'),
            latex: String.raw `u(t)=\Re\!\left\{A\,e^{i\omega t}\right\}=|A|\cos\!\left(\omega t+\varphi\right)` },
        { n: 4, op: 'identity', title: t('求导变成乘以 iω', 'Differentiation becomes multiplication by iω'),
            latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}t}\left(Ae^{i\omega t}\right)=i\omega\,Ae^{i\omega t},\qquad \frac{\mathrm{d}^{2}}{\mathrm{d}t^{2}}\to-\omega^{2}`,
            note: t('这一条是相量法的全部威力所在：微分方程 → 代数方程。', 'This single line is the entire power of the method: differential equations become algebraic ones.') },
        { n: 5, op: 'identity', title: t('相移 π/2 就是乘以 i', 'A phase shift of π/2 is multiplication by i'),
            latex: String.raw `A\,e^{i\omega t}\,e^{i\pi/2}=iA\,e^{i\omega t},\qquad \mathcal{H}\{\cos\omega t\}=\sin\omega t`,
            note: t('这正是 Hilbert 变换在单频上的作用：把余弦变成正弦。', 'That is exactly what the Hilbert transform does to a single frequency: it turns a cosine into a sine.') },
        { n: 6, op: 'result', title: t('带吸收的传播：波数取复数', 'Propagation with absorption: a complex wavenumber'),
            latex: String.raw `e^{i(\omega t-kx)}=e^{-\alpha x}\,e^{i\omega\left(t-\frac{x}{c}\right)},\qquad k=\frac{\omega}{c}-i\alpha`,
            note: t('虚部 −iα 给出 e^{−αx} 的指数衰减，实部给出传播相位。Q 衰减就是这么写进波动方程的。', 'The imaginary part −iα supplies the exponential decay e^{−αx} while the real part supplies the propagation phase. This is how anelastic Q enters the wave equation.') },
    ],
    viz: [
        {
            id: 'phasor-time-series',
            level: 'V1',
            title: t('相量的两个自由度：振幅与相位', 'The two degrees of freedom of a phasor: amplitude and phase'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'amp', label: t('振幅 |A|', 'amplitude |A|'), min: 0.1, max: 2, step: 0.05, value: 1, unit: 'm' },
                { id: 'phi', label: t('初相位 φ', 'initial phase φ'), min: -3.14, max: 3.14, step: 0.05, value: 0.8, unit: 'rad' },
                { id: 'f0', label: t('频率 f', 'frequency f'), min: 0.1, max: 3, step: 0.05, value: 0.5, unit: 'Hz' },
            ],
            xRange: [0, 6],
            note: t('改振幅只上下拉伸，改相位只左右平移——两者完全独立，正好对应复数的模与辐角。', 'Changing amplitude stretches vertically, changing phase shifts horizontally. The two are completely independent, matching the modulus and argument of a complex number.'),
            compute: (p) => {
                const A = p['amp'], phi = p['phi'], f = p['f0'];
                const w = 2 * Math.PI * f;
                const pts = [];
                const env = [];
                for (let i = 0; i <= 600; i++) {
                    const tt = (i / 600) * 6;
                    pts.push([tt, A * Math.cos(w * tt + phi)]);
                    env.push([tt, A]);
                }
                return [
                    { label: t('u(t) = Re{A e^{iωt}}', 'u(t) = Re{A e^{iωt}}'), color: '#185FA5', points: pts },
                    { label: t('包络 |A|', 'envelope |A|'), color: '#B4B2A9', dash: true, points: env },
                ];
            },
        },
        {
            id: 'phasor-sum',
            level: 'V1',
            title: t('两个相量相加：干涉就是复数加法', 'Adding two phasors: interference is complex addition'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 u (m)', 'displacement u (m)'),
            controls: [
                { id: 'dphi', label: t('相位差 Δφ', 'phase difference Δφ'), min: 0, max: 6.28, step: 0.05, value: 1.2, unit: 'rad' },
                { id: 'r', label: t('振幅比 A₂/A₁', 'amplitude ratio A₂/A₁'), min: 0, max: 1.5, step: 0.05, value: 0.8, unit: '1' },
            ],
            xRange: [0, 4],
            note: t('Δφ = 0 时相长、Δφ = π 时相消。合成振幅 = |A₁ + A₂|，这就是复数加法的几何意义，也是薄层调谐效应的机理。', 'Δφ = 0 gives constructive interference, Δφ = π destructive. The resultant amplitude is |A₁ + A₂| — the geometric content of complex addition, and the mechanism behind thin-bed tuning.'),
            compute: (p) => {
                const dphi = p['dphi'], r = p['r'], f = 1;
                const w = 2 * Math.PI * f;
                const pts = [];
                const s1 = [];
                for (let i = 0; i <= 600; i++) {
                    const tt = (i / 600) * 4;
                    const v1 = Math.cos(w * tt);
                    const v2 = r * Math.cos(w * tt + dphi);
                    pts.push([tt, v1 + v2]);
                    s1.push([tt, v1]);
                }
                return [
                    { label: t('合成振动', 'resultant motion'), color: '#185FA5', points: pts },
                    { label: t('第一个分量', 'first component'), color: '#B4B2A9', dash: true, points: s1 },
                ];
            },
        },
    ],
    example: {
        title: t('两个台站记录同一震相', 'The same phase recorded at two stations'),
        input: t('台站 1：振幅 2.0，相位 30°；台站 2：振幅 1.0，相位 120°', 'Station 1: amplitude 2.0, phase 30°; station 2: amplitude 1.0, phase 120°'),
        steps: [
            t('A₁ = 2.0 e^{i30°} = 1.732 + 0.500i', 'A₁ = 2.0 e^{i30°} = 1.732 + 0.500i'),
            t('A₂ = 1.0 e^{i120°} = −0.500 + 0.866i', 'A₂ = 1.0 e^{i120°} = −0.500 + 0.866i'),
            t('A₁ + A₂ = 1.232 + 1.366i，模长 1.84，辐角 47.9°', 'A₁ + A₂ = 1.232 + 1.366i, modulus 1.84, argument 47.9°'),
        ],
        output: t('合成振幅 1.84，既不是 3.0 也不是 1.0 —— 相位差 90° 时的结果介于完全相长与完全相消之间。', 'The resultant amplitude is 1.84, neither 3.0 nor 1.0: with a 90° phase difference the outcome lies between full constructive and full destructive interference.'),
    },
    links: {
        upstream: [
            { id: 'euler-formula', note: t('相量的数学根基', 'the mathematical foundation of phasors') },
            { id: 'harmonic-plane-wave', note: t('谐和波的复数写法', 'complex notation for harmonic waves') },
        ],
        downstream: [
            { id: 'analytic-signal-envelope', note: t('把相量推广到随时间变化的包络', 'extends the phasor to a time-varying envelope') },
        ],
        seealso: [
            { id: 'quality-factor-q', note: t('复波数的虚部就是吸收', 'the imaginary part of the complex wavenumber is absorption') },
            { id: 'fourier-transform', note: t('每个频率分量各有一个相量', 'each frequency component carries its own phasor') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
        { text: 'Stein & Wysession, An Introduction to Seismology, Earthquakes and Earth Structure, §2.3' },
    ],
};
export default complexPhasorRepresentation;
//# sourceMappingURL=complex-phasor-representation.js.map