import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** dirac-delta-sifting */
const diracDeltaSifting: FormulaCard = {
  id: 'dirac-delta-sifting',
  name: t('Dirac δ 函数的筛选性质与其 Fourier 变换', 'The Dirac Delta: Sifting Property and Transform'),
  aliases: { zh: ['δ 函数', '狄拉克函数', '筛选性质', '冲激函数'], en: ['Dirac delta', 'delta function', 'sifting property', 'impulse'] },
  node: 'S0.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.COMPLEX'],
    method: ['METH.PROC'],
    quantity: ['Q.AMP', 'Q.SOURCE'],
    keywords: t('狄拉克 δ 筛选性质 广义函数 冲激响应 频谱为常数 格林函数', 'Dirac delta sifting distribution impulse response flat spectrum Green function'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\int_{-\infty}^{\infty}f(t)\,\delta(t-t_0)\,\dd t=f(t_0)`,
    variants: [
      { name: t('与常数 1 互为变换对', 'The pair formed with the constant 1'), latex: String.raw`\delta(t)\;\Longleftrightarrow\;1,\qquad 1\;\Longleftrightarrow\;2\pi\,\delta(\omega)` },
      { name: t('平移后的变换', 'The transform of a shifted delta'), latex: String.raw`\delta(t-t_0)\;\Longleftrightarrow\;e^{-i\omega t_0}` },
      { name: t('缩放性质', 'Scaling'), latex: String.raw`\delta(a t)=\frac{1}{|a|}\,\delta(t)` },
      { name: t('与函数相乘', 'Multiplication by a function'), latex: String.raw`f(t)\,\delta(t-t_0)=f(t_0)\,\delta(t-t_0)` },
      { name: t('δ 的导数', 'The derivative of δ'), latex: String.raw`\int f(t)\,\delta'(t-t_0)\,\dd t=-f'(t_0)` },
      { name: t('三维形式（点源）', 'Three-dimensional form, a point source'), latex: String.raw`\iiint f(\mathbf{x})\,\delta^{3}(\mathbf{x}-\mathbf{x}_0)\,\dd V=f(\mathbf{x}_0)` },
    ],
  },
  meaning: t(
    'δ 不是普通函数而是一个「测量装置」：把它放在积分里，它就把被积函数在指定点的值挑出来，其余全部忽略。它的 Fourier 变换是常数 1，意味着它包含所有频率且强度相同 —— 这是「脉冲响应」能完整刻画一个线性系统的根本原因，也是震源时间函数、点源、Green 函数等一系列概念的共同底座。',
    'The delta is not an ordinary function but a measuring device: placed inside an integral it picks out the value of the integrand at one chosen point and ignores everything else. Its Fourier transform is the constant 1, meaning it contains every frequency at equal strength — the fundamental reason why an impulse response characterises a linear system completely, and the common foundation of source time functions, point sources and Green functions.',
  ),
  symbols: [
    { sym: '\\delta(t)', name: t('Dirac δ 函数（广义函数、分布）', 'the Dirac delta, a generalised function or distribution'), unit: '1/自变量单位' },
    { sym: 't_0', name: t('δ 所在的时刻（冲激时刻）', 'the instant at which the delta sits'), unit: 's' },
    { sym: 'f(t)', name: t('被筛选的光滑检验函数', 'the smooth test function being sifted'), unit: '任意' },
    { sym: '\\delta^{3}(\\mathbf{x})', name: t('三维 δ（点源的数学表达）', 'the three-dimensional delta, the mathematical form of a point source'), unit: 'm⁻³' },
    { sym: '\\delta^{\\prime}(t)', name: t('δ 的导数（偶极子源）', 'the derivative of δ, that is, a dipole source'), unit: '1/自变量单位²' },
  ],
  conditions: {
    applies: [
      t('作为分布（广义函数）严格成立，需配合光滑检验函数使用', 'Strictly valid in the distributional sense, acting on smooth test functions'),
      t('线性系统的冲激响应、点源、采样梳的构造', 'Constructing impulse responses, point sources and sampling combs'),
    ],
    assumes: [
      t('f 在 t₀ 处连续（否则取值需约定）', 'f is continuous at t₀, otherwise a convention for the value is needed'),
      t('积分域包含 t₀', 'The integration domain contains t₀'),
    ],
    breaks: [
      t('把 δ 当作逐点取值的普通函数会得出矛盾（它在 t₀ 处不是有限值）', 'Treating δ as an ordinary pointwise function leads to contradictions, since it is not a finite value at t₀'),
      t('数值实现中必须换成窄脉冲或离散 Kronecker δ，不能直接用「无穷高」', 'Numerically one must substitute a narrow pulse or the discrete Kronecker delta; an infinite spike cannot be used directly'),
      t('δ² 与 δ 的乘积无定义', 'δ² and products of deltas are undefined'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('把 δ 定义为窄脉冲序列的极限', 'Define δ as the limit of a sequence of narrow pulses'),
      latex: String.raw`\delta(t)=\lim_{\varepsilon\to 0}p_{\varepsilon}(t),\qquad p_{\varepsilon}(t)=\begin{cases}1/\varepsilon & |t|<\varepsilon/2\\ 0 & \text{otherwise}\end{cases},\qquad \int p_{\varepsilon}(t)\,\dd t=1`,
      note: t('任何面积恒为 1、宽度趋于零的脉冲族都定义同一个 δ，这叫「δ 序列」。', 'Any family of pulses with unit area whose width tends to zero defines the same δ; such a family is called a delta sequence.'),
    },
    {
      n: 2,
      op: 'transform',
      title: t('对窄脉冲做积分，用积分中值定理', 'Integrate against the narrow pulse, using the mean value theorem'),
      latex: String.raw`\int f(t)\,p_{\varepsilon}(t-t_0)\,\dd t=\frac{1}{\varepsilon}\int_{t_0-\varepsilon/2}^{t_0+\varepsilon/2}f(t)\,\dd t\approx f(t_0)`,
    },
    {
      n: 3,
      op: 'result',
      title: t('取极限得到筛选性质', 'Take the limit to obtain the sifting property'),
      latex: String.raw`\lim_{\varepsilon\to 0}\;=\;f(t_0)\;\Longrightarrow\;\int f(t)\,\delta(t-t_0)\,\dd t=f(t_0)`,
      note: t('整个积分的值只取决于 f 在一个点上的值，这就是「筛选」。', 'The whole integral depends only on the value of f at one point; that is the sifting.'),
    },
    {
      n: 4,
      op: 'transform',
      title: t('求它的 Fourier 变换', 'Compute its Fourier transform'),
      latex: String.raw`\mathcal{F}\{\delta(t-t_0)\}=\int \delta(t-t_0)\,e^{-i\omega t}\dd t=e^{-i\omega t_0}`,
      note: t('直接套用筛选性质即可，无需任何积分技巧。', 'Just apply the sifting property; no integration technique is needed.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('特别地：位于原点的 δ 变换为 1', 'In particular, a delta at the origin transforms to 1'),
      latex: String.raw`\delta(t)\;\Longleftrightarrow\;1,\qquad \delta(t-t_0)\;\Longleftrightarrow\;e^{-i\omega t_0},\qquad 1\;\Longleftrightarrow\;2\pi\,\delta(\omega)`,
      note: t('一个冲激含有所有频率且幅度相同，所以拿它去激励系统，得到的响应就是系统的完整指纹。', 'An impulse contains all frequencies at equal amplitude, so using it to excite a system yields the complete fingerprint of the system.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('地震学中的直接应用', 'The direct application in seismology'),
      latex: String.raw`\text{点源：}\ \mathbf{f}(\mathbf{x},t)=\mathbf{M}\,\delta^{3}(\mathbf{x}-\boldsymbol{\xi})\,S(t)\;\Longrightarrow\; \mathbf{u}=G*S`,
      note: t('把震源写成 δ 点源，位移就等于 Green 函数与源时间函数的褶积 —— 整个震源理论由此展开。', 'Writing the source as a delta-like point source makes the displacement the convolution of the Green function with the source time function, and the whole of source theory unfolds from there.'),
    },
  ],
  example: {
    title: t('冲激响应完整刻画仪器', 'An impulse response characterises an instrument completely'),
    input: t('给地震仪输入一个 δ 型脉冲，记录到输出 h(t)', 'Feed a delta-like impulse into a seismometer and record the output h(t)'),
    steps: [
      t('H(ω) = ∫ h(t) e^{-iωt} dt 即仪器的频率响应', 'H(ω) = ∫ h(t) e^{−iωt} dt is the instrument frequency response'),
      t('任意输入 u(t) 的输出为 d(t) = u * h，即 D(ω) = U(ω)H(ω)', 'Any input u(t) gives d(t) = u * h, that is, D(ω) = U(ω)H(ω)'),
    ],
    output: t('一次冲激标定即可预测仪器对任意波形的响应 —— 前提是系统线性时不变', 'A single impulse calibration predicts the response to any waveform, provided the system is linear and time-invariant'),
  },
  links: {
    upstream: [{ id: 'fourier-transform-pair', note: t('δ 是变换理论的基本构件', 'δ is a basic building block of transform theory') }],
    downstream: [
      { id: 'convolution-theorem', note: t('冲激响应 + 褶积 = 系统理论', 'impulse response plus convolution gives system theory') },
      { id: 'sampling-spectral-periodicity', note: t('Dirac 梳即一串 δ', 'a Dirac comb is a train of deltas') },
    ],
    seealso: [{ id: 'seismometer-equation' }],
  },
  refs: [
    { text: 'Bracewell, The Fourier Transform and Its Applications, 3rd ed., §5' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
  ],
}

export default diracDeltaSifting
