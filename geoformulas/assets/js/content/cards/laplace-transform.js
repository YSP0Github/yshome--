import { t } from '../../core/types.js';
/** laplace-transform */
const laplaceTransform = {
    id: 'laplace-transform',
    name: t('Laplace 变换', 'The Laplace Transform'),
    aliases: { zh: ['拉普拉斯变换', '单边拉普拉斯变换', '象函数'], en: ['Laplace transform', 'one-sided Laplace transform', 'Bromwich integral'] },
    node: 'S0.5',
    tags: {
        math: ['MATH.FOURIER', 'MATH.DIFF'],
        method: ['METH.INV', 'METH.INSTR'],
        quantity: ['Q.FREQ'],
        keywords: t('拉普拉斯变换 收敛域 传递函数 卷积 初值终值定理 Bromwich 反演 阻尼', 'Laplace transform region of convergence transfer function convolution initial value theorem Bromwich inversion damping'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `F(s)=\mathcal{L}\{f\}(s)=\int_{0}^{\infty}f(t)\,e^{-st}\,\mathrm{d}t,\qquad s=\sigma+i\omega`,
        variants: [
            { name: t('反演公式（Bromwich 积分）', 'Inversion formula (Bromwich integral)'), latex: String.raw `f(t)=\frac{1}{2\pi i}\int_{\sigma_{0}-i\infty}^{\sigma_{0}+i\infty}F(s)\,e^{st}\,\mathrm{d}s` },
            { name: t('导数性质（把微分方程变代数方程的关键）', 'Derivative property (the key to turning ODEs into algebra)'), latex: String.raw `\mathcal{L}\{\dot f\}=sF(s)-f(0^{+}),\qquad \mathcal{L}\{\ddot f\}=s^{2}F(s)-s\,f(0^{+})-\dot f(0^{+})` },
            { name: t('时移与时延', 'Time shift and time delay'), latex: String.raw `\mathcal{L}\{f(t-\tau)H(t-\tau)\}=e^{-s\tau}F(s)` },
            { name: t('卷积定理', 'Convolution theorem'), latex: String.raw `\mathcal{L}\{f*g\}=F(s)\,G(s)` },
            { name: t('常用对应', 'Common pairs'), latex: String.raw `\mathcal{L}\{1\}=\frac{1}{s},\qquad \mathcal{L}\{e^{-at}\}=\frac{1}{s+a},\qquad \mathcal{L}\{\sin\omega t\}=\frac{\omega}{s^{2}+\omega^{2}}` },
            { name: t('初值与终值定理', 'Initial- and final-value theorems'), latex: String.raw `f(0^{+})=\lim_{s\to\infty}sF(s),\qquad f(\infty)=\lim_{s\to 0}sF(s)` },
        ],
    },
    meaning: t('Laplace 变换是带衰减因子的 Fourier 变换：核 e^{−st} = e^{−σt}e^{−iωt} 让发散的积分收敛，同时把对时间的求导变成乘以 s。它是求解线性常系数微分方程（仪器响应、阻尼振子、RC 电路、反馈系统）的标准机器；系统对任意输入的响应就是传递函数与输入变换的乘积。反演时 s 平面上的极点位置直接给出响应的衰减率与振荡频率。', 'The Laplace transform is a Fourier transform with a damping factor: the kernel e^{−st} = e^{−σt}e^{−iωt} makes divergent integrals converge while turning time differentiation into multiplication by s. It is the standard machine for solving linear constant-coefficient ODEs (instrument response, damped oscillators, RC circuits, feedback systems). The response to any input is just the transfer function times the transformed input, and on inversion the poles in the s-plane directly give the decay rates and oscillation frequencies of the response.'),
    symbols: [
        { sym: 'F(s)', name: t('象函数（复频域表示）', 'image function (complex-frequency representation)'), unit: '与 f 同 · s' },
        { sym: 's', name: t('复频率 s = σ + iω', 'complex frequency s = σ + iω'), unit: 's⁻¹' },
        { sym: '\\sigma', name: t('衰减（收敛）参数', 'damping (convergence) parameter'), unit: 's⁻¹' },
        { sym: '\\sigma_0', name: t('收敛横坐标：所有极点都在其左侧', 'abscissa of convergence: all poles lie to its left'), unit: 's⁻¹' },
        { sym: 'f(0^{+})', name: t('初始时刻右极限', 'right-hand limit at the initial instant'), unit: '与 f 同' },
        { sym: 'H(t)', name: t('Heaviside 阶跃函数', 'Heaviside step function'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('定义在 t ≥ 0 上的因果信号与系统', 'Causal signals and systems defined for t ≥ 0'),
            t('线性、时不变、常系数系统', 'Linear, time-invariant, constant-coefficient systems'),
        ],
        assumes: [
            t('f 指数有界：|f(t)| ≤ M e^{σ₀t}，保证积分收敛', 'f is of exponential order, |f(t)| ≤ M e^{σ₀t}, so the integral converges'),
            t('单边（t ≥ 0）定义，因此初始条件自动进入变换式', 'One-sided (t ≥ 0) definition, so initial conditions enter the transform automatically'),
        ],
        breaks: [
            t('f 增长快于任何指数（如 e^{t²}）时变换不存在', 'The transform does not exist if f grows faster than any exponential (e.g. e^{t²})'),
            t('终值定理要求所有极点严格在左半平面（系统稳定）', 'The final-value theorem requires all poles strictly in the left half-plane (a stable system)'),
            t('数值反演是病态的，工程上常用部分分式展开代替围道积分', 'Numerical inversion is ill-conditioned; partial-fraction expansion is usually preferred over contour integration in practice'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从 Fourier 变换出发，加上收敛因子', 'Start from the Fourier transform and add a convergence factor'),
            latex: String.raw `\int_{0}^{\infty}f(t)\,e^{-i\omega t}\,\mathrm{d}t\;\longrightarrow\;\int_{0}^{\infty}\left[f(t)e^{-\sigma t}\right]e^{-i\omega t}\,\mathrm{d}t`,
            note: t('乘 e^{−σt} 把不衰减甚至增长的函数压下去，使积分有意义。', 'Multiplying by e^{−σt} suppresses non-decaying or growing functions so the integral makes sense.') },
        { n: 2, op: 'setup', title: t('记 s = σ + iω，得到定义式', 'Write s = σ + iω to obtain the definition'),
            latex: String.raw `F(s)=\int_{0}^{\infty}f(t)e^{-st}\,\mathrm{d}t` },
        { n: 3, op: 'identity', title: t('分部积分给出导数性质', 'Integration by parts gives the derivative property'),
            latex: String.raw `\int_{0}^{\infty}\dot f\,e^{-st}\mathrm{d}t=\left[f\,e^{-st}\right]_{0}^{\infty}+s\int_{0}^{\infty}f\,e^{-st}\mathrm{d}t=sF(s)-f(0^{+})`,
            note: t('初始条件就是在这一步「自动」出现的，这正是 Laplace 法解初值问题如此顺手的原因。', 'This is where initial conditions appear automatically, which is why the Laplace method handles initial-value problems so smoothly.') },
        { n: 4, op: 'substitute', title: t('以阻尼振子为例：微分方程变代数方程', 'Example: the damped oscillator, from differential to algebraic equation'),
            latex: String.raw `\ddot x+2\gamma\dot x+\omega_{0}^{2}x=f(t)\;\Longrightarrow\;\left(s^{2}+2\gamma s+\omega_{0}^{2}\right)X(s)=F(s)+\left(s+2\gamma\right)x(0)+\dot x(0)` },
        { n: 5, op: 'algebra', title: t('解出 X(s)，识别传递函数', 'Solve for X(s) and identify the transfer function'),
            latex: String.raw `X(s)=\underbrace{\frac{1}{s^{2}+2\gamma s+\omega_{0}^{2}}}_{G(s)}F(s),\qquad G(s)=\frac{1}{(s-s_{+})(s-s_{-})},\ \ s_{\pm}=-\gamma\pm i\omega_{d}` },
        { n: 6, op: 'transform', title: t('卷积定理给出时域响应', 'The convolution theorem gives the time-domain response'),
            latex: String.raw `x(t)=\int_{0}^{t}g(t-\tau)f(\tau)\,\mathrm{d}\tau,\qquad g(t)=\mathcal{L}^{-1}\{G\}=\frac{e^{-\gamma t}\sin\omega_{d}t}{\omega_{d}}H(t)` },
        { n: 7, op: 'result', title: t('极点位置决定稳定性', 'Pole positions determine stability'),
            latex: String.raw `\operatorname{Re}s_{\pm}=-\gamma<0\;\Longrightarrow\;\text{衰减、稳定};\qquad \operatorname{Re}s_{\pm}>0\;\Longrightarrow\;\text{发散、不稳定}` },
    ],
    example: {
        title: t('求一阶低通（仪器）的阶跃响应', 'Step response of a first-order low-pass (an instrument)'),
        input: t('τ dx/dt + x = u(t)，输入为单位阶跃，x(0) = 0', 'τ dx/dt + x = u(t), unit-step input, x(0) = 0'),
        steps: [
            t('变换：(τs + 1)X(s) = 1/s', 'Transform: (τs + 1)X(s) = 1/s'),
            t('X(s) = 1/[s(τs+1)] = 1/s − 1/(s + 1/τ)', 'X(s) = 1/[s(τs+1)] = 1/s − 1/(s + 1/τ)'),
            t('反演：x(t) = 1 − e^{−t/τ}', 'Invert: x(t) = 1 − e^{−t/τ}'),
            t('t = τ 时 x = 0.632；t = 3τ 时 x = 0.950', 'At t = τ, x = 0.632; at t = 3τ, x = 0.950'),
        ],
        output: t('时间常数 τ 就是达到终值 63% 所需的时间 —— 地震计的标定与去仪器响应，本质上就是把这个 τ（或更一般的 G(s)）除掉。', 'The time constant τ is the time needed to reach 63% of the final value. Calibrating a seismometer and removing its instrument response amounts to dividing out this τ, or more generally G(s).'),
    },
    links: {
        seealso: [
            { id: 'fourier-transform', note: t('σ → 0 时退化为 Fourier 变换', 'reduces to the Fourier transform as σ → 0') },
            { id: 'forced-oscillator-green-function', note: t('上面的 G(s) 就是脉冲响应', 'the G(s) above is the impulse response') },
            { id: 'seismometer-equation', note: t('仪器方程本身就是二阶常微分方程', 'the instrument equation is itself a second-order ODE') },
            { id: 'residue-theorem', note: t('Bromwich 反演靠留数完成', 'the Bromwich inversion is carried out by residues') },
        ],
    },
    refs: [
        { text: 'Oppenheim & Willsky, Signals and Systems, 2nd ed., Ch. 9' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.3' },
    ],
};
export default laplaceTransform;
//# sourceMappingURL=laplace-transform.js.map