import { t } from '../../core/types.js';
/** fourier-shift-theorem */
const fourierShiftTheorem = {
    id: 'fourier-shift-theorem',
    name: t('Fourier 变换的时移与频移定理', 'The Time- and Frequency-Shift Theorems'),
    aliases: { zh: ['时移定理', '频移定理', '延迟相位'], en: ['shift theorem', 'time shift', 'frequency shift', 'modulation'] },
    node: 'S0.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.PROC'],
        quantity: ['Q.TIME', 'Q.FREQ', 'Q.AMP'],
        keywords: t('时移 频移 调制 线性相位 延迟 到时 群延迟 解调', 'time shift frequency shift modulation linear phase delay arrival time group delay demodulation'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathcal{F}\{f(t-t_0)\}=e^{-i\omega t_0}\,F(\omega)`,
        variants: [
            { name: t('频移（调制）定理', 'The frequency-shift, or modulation, theorem'), latex: String.raw `\mathcal{F}\{f(t)\,e^{i\omega_0 t}\}=F(\omega-\omega_0)` },
            { name: t('空间平移（与波数对应）', 'Spatial shift, the counterpart in wavenumber'), latex: String.raw `\mathcal{F}\{f(x-x_0)\}=e^{-ikx_0}\,F(k)` },
            { name: t('尺度变换', 'Scaling'), latex: String.raw `\mathcal{F}\{f(at)\}=\frac{1}{|a|}F\!\left(\frac{\omega}{a}\right)` },
            { name: t('复数形式的延迟：振幅不变、相位线性', 'A delay in complex form: amplitude unchanged, phase linear'), latex: String.raw `|e^{-i\omega t_0}|=1,\qquad \arg e^{-i\omega t_0}=-\omega t_0` },
        ],
    },
    meaning: t('把一个地震图整体推迟 t₀ 秒，它的振幅谱一点不变，只是相位谱多了一条斜率 −t₀ 的直线。这句话是地震学许多技术的底层：用互相关测到时差、用相位谱求群延迟、用线性相位做时移校正、用频移做解调与混频。反之，在频率域把谱整体平移 ω₀，等价于时间域乘以 e^{iω₀t}（调制）。', 'Delaying a whole seismogram by t₀ leaves its amplitude spectrum untouched and merely adds a straight line of slope −t₀ to the phase spectrum. That single sentence underlies a great deal of seismology: measuring arrival-time differences by cross-correlation, recovering group delay from the phase spectrum, applying linear-phase time shifts, and demodulating or mixing signals by shifting spectra. Conversely, translating a spectrum by ω₀ in the frequency domain multiplies the time signal by e^{iω₀t}, which is modulation.'),
    symbols: [
        { sym: 't_0', name: t('时间延迟（正值为推迟）', 'time delay, positive meaning later'), unit: 's' },
        { sym: '\\omega_0', name: t('频移量（载波角频率）', 'frequency shift, that is, the carrier angular frequency'), unit: 'rad/s' },
        { sym: 'F(\\omega)', name: t('原信号的谱', 'spectrum of the original signal'), unit: '原物理量 · s' },
        { sym: 'e^{-i\\omega t_0}', name: t('全通相位因子（模为 1）', 'all-pass phase factor of unit modulus'), unit: '1' },
        { sym: '\\tau_g', name: t('群延迟 −dφ/dω', 'group delay, −dφ/dω'), unit: 's' },
        { sym: 'k', name: t('波数', 'wavenumber'), unit: 'rad/m' },
    ],
    conditions: {
        applies: [
            t('任意可 Fourier 变换的信号（含广义函数）', 'Any signal with a Fourier transform, generalised functions included'),
            t('时移不改变记录长度时（严格平移）；实际截断窗口下会有边缘效应', 'Exact translation with no change of record length; with a real truncated window there are edge effects'),
        ],
        assumes: [
            t('变换采用 e^{-iωt} 核（本卡片约定）', 'The transform uses the e^{−iωt} kernel, the convention of this card'),
            t('系统是线性时不变的，时移才等价于乘以相位因子', 'The system is linear and time-invariant, so that a time shift is equivalent to a phase factor'),
        ],
        breaks: [
            t('频变延迟（频散传播）时相位不再是 ω 的线性函数，需用群延迟描述', 'With frequency-dependent delay, as in dispersive propagation, the phase is no longer linear in ω and one must use the group delay'),
            t('循环移位（DFT 隐含周期）与线性移位不同，需注意边界', 'A circular shift, which the DFT implicitly assumes, differs from a linear shift; watch the boundaries'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('写出平移后信号的正变换', 'Write the forward transform of the shifted signal'),
            latex: String.raw `\mathcal{F}\{f(t-t_0)\}=\int_{-\infty}^{\infty}f(t-t_0)\,e^{-i\omega t}\,\dd t`,
        },
        {
            n: 2,
            op: 'transform',
            title: t('换元 τ = t − t₀', 'Change variables, τ = t − t₀'),
            latex: String.raw `t=\tau+t_0,\qquad \dd t=\dd\tau\;\Longrightarrow\;\int f(\tau)\,e^{-i\omega(\tau+t_0)}\,\dd\tau`,
        },
        {
            n: 3,
            op: 'algebra',
            title: t('把与 τ 无关的因子提出积分号', 'Pull the τ-independent factor out of the integral'),
            latex: String.raw `=e^{-i\omega t_0}\int f(\tau)e^{-i\omega\tau}\dd\tau=e^{-i\omega t_0}F(\omega)`,
        },
        {
            n: 4,
            op: 'result',
            title: t('结论：振幅谱不变，相位谱加一条直线', 'Conclusion: amplitude unchanged, phase gains a straight line'),
            latex: String.raw `|F_{shift}|=|F|,\qquad \phi_{shift}(\omega)=\phi(\omega)-\omega t_0`,
            note: t('反过来说：只要测出相位谱是 ω 的线性函数，其斜率就是到时。这就是频域测到时的原理。', 'Read the other way round: whenever the measured phase spectrum is linear in ω, its slope is the arrival time. That is the principle of frequency-domain arrival-time measurement.'),
        },
        {
            n: 5,
            op: 'identity',
            title: t('对偶性：把同样推导搬到频率域', 'Duality: run the same argument in the frequency domain'),
            latex: String.raw `\mathcal{F}\{f(t)e^{i\omega_0 t}\}=\int f(t)e^{-i(\omega-\omega_0)t}\dd t=F(\omega-\omega_0)`,
            note: t('注意符号：乘以 e^{+iω₀t} 把谱往 +ω₀ 方向搬。', 'Watch the sign: multiplying by e^{+iω₀t} moves the spectrum toward +ω₀.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('频散情形：群延迟取代常数延迟', 'In the dispersive case the group delay replaces the constant delay'),
            latex: String.raw `\phi(\omega)=-\omega\,t(\omega)\;\Longrightarrow\;\tau_g=-\frac{\dd\phi}{\dd\omega}=t+\omega\frac{\dd t}{\dd\omega}`,
            note: t('面波频散分析中测到的正是这个 τ_g，它被当作该频率的群到时。', 'What dispersion analysis of surface waves actually measures is this τ_g, treated as the group arrival time at that frequency.'),
        },
    ],
    example: {
        title: t('用相位谱求两台站的到时差', 'Recovering the arrival-time difference between two stations from the phase spectrum'),
        input: t('两台站同一震相的相位差 Δφ(ω) = −0.8 ω（ω 单位 rad/s）', 'The phase difference of one phase between two stations is Δφ(ω) = −0.8 ω'),
        steps: [
            t('线性相位的斜率即延迟：Δt = −dΔφ/dω = 0.8 s', 'The slope of the linear phase is the delay: Δt = −dΔφ/dω = 0.8 s'),
            t('若两站相距 4 km，则视速度 = 4000/0.8 = 5000 m/s', 'If the stations are 4 km apart, the apparent velocity is 4000/0.8 = 5000 m/s'),
        ],
        output: t('这条「相位斜率 → 到时 → 视速度」的链条正是台阵聚束与频散测量的核心', 'The chain phase slope, then arrival time, then apparent velocity is exactly the core of array beamforming and dispersion measurement'),
    },
    links: {
        upstream: [{ id: 'fourier-transform-pair', note: t('定理依附于变换的定义', 'the theorem rests on the definition of the transform') }],
        downstream: [
            { id: 'convolution-theorem', note: t('褶积可看作平移的叠加', 'convolution can be seen as a superposition of shifts') },
            { id: 'sampling-spectral-periodicity', note: t('采样冲激串用到频移定理', 'the sampling impulse train uses the shift theorem') },
        ],
        seealso: [{ id: 'nmo-correction' }],
    },
    refs: [
        { text: 'Bracewell, The Fourier Transform and Its Applications, 3rd ed., §4' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.4' },
    ],
};
export default fourierShiftTheorem;
//# sourceMappingURL=fourier-shift-theorem.js.map