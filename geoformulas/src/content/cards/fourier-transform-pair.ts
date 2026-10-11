import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** fourier-transform-pair */
const fourierTransformPair: FormulaCard = {
  id: 'fourier-transform-pair',
  name: t('Fourier 变换对与归一化约定', 'The Fourier Transform Pair and Its Normalisation'),
  aliases: { zh: ['正反变换', '傅里叶变换对', '2π 约定'], en: ['forward and inverse transform', 'Fourier pair', 'two-pi convention'] },
  node: 'S0.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.COMPLEX'],
    method: ['METH.PROC'],
    quantity: ['Q.FREQ', 'Q.AMP'],
    keywords: t('傅里叶变换 反变换 归一化 2π 约定 频谱 相位谱 存在条件', 'Fourier transform inverse normalisation two-pi convention amplitude spectrum phase spectrum existence'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`F(\omega)=\int_{-\infty}^{\infty}f(t)\,e^{-i\omega t}\,\dd t,\qquad f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}F(\omega)\,e^{i\omega t}\,\dd\omega`,
    variants: [
      { name: t('用普通频率 f（2π 分摊到两侧）', 'In ordinary frequency f, with 2π shared between the two sides'), latex: String.raw`\tilde{f}(f)=\int_{-\infty}^{\infty}f(t)\,e^{-2\pi i f t}\,\dd t,\qquad f(t)=\int_{-\infty}^{\infty}\tilde{f}(f)\,e^{2\pi i f t}\,\dd f` },
      { name: t('对称（酉）约定', 'The symmetric, or unitary, convention'), latex: String.raw`\hat{f}(\omega)=\frac{1}{\sqrt{2\pi}}\int f(t)e^{-i\omega t}\dd t,\qquad f(t)=\frac{1}{\sqrt{2\pi}}\int \hat{f}(\omega)e^{i\omega t}\dd\omega` },
      { name: t('振幅谱与相位谱', 'Amplitude and phase spectra'), latex: String.raw`|F(\omega)|=\sqrt{(\Re F)^{2}+(\Im F)^{2}},\qquad \phi(\omega)=\arg F(\omega)=\arctan\frac{\Im F}{\Re F}` },
      { name: t('实信号的共轭对称性', 'Conjugate symmetry of a real signal'), latex: String.raw`f(t)\in\mathbb{R}\;\Longrightarrow\;F(-\omega)=F^{*}(\omega)` },
    ],
  },
  meaning: t(
    '正变换把时间域信号 f(t) 投影到一族永不衰减的正交基 e^{iωt} 上，得到每个频率的复振幅 F(ω)；反变换把所有这些复振幅重新叠加，完好地还原原信号。两式构成一个「无损翻译」：时间域丢失的信息在频率域里一点都不少，反之亦然。真正容易出错的不是公式本身，而是 2π 放在哪一侧 —— 换文献、换软件包时务必先确认归一化约定。',
    'The forward transform projects a time-domain signal f(t) onto the family of non-decaying orthogonal basis functions e^{iωt}, yielding the complex amplitude F(ω) at each frequency; the inverse transform superposes all those complex amplitudes and restores the original signal exactly. Together they form a lossless translation: no information is lost going from time to frequency, or back. What actually trips people up is not the formula but where the 2π sits — always check the normalisation convention before switching between papers or software packages.',
  ),
  symbols: [
    { sym: 'f(t)', name: t('时间域信号（地震图、震源时间函数等）', 'time-domain signal: a seismogram, a source time function, and so on'), unit: '同原物理量' },
    { sym: 'F(\\omega)', name: t('频率域谱，一般为复数', 'frequency-domain spectrum, generally complex'), unit: '原物理量 · s' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'f', name: t('普通频率（注意与信号 f(t) 重名，靠上下文区分）', 'ordinary frequency — note the clash with the signal name f(t), resolved by context'), unit: 'Hz' },
    { sym: '|F(\\omega)|', name: t('振幅谱', 'amplitude spectrum'), unit: '原物理量 · s' },
    { sym: '\\phi(\\omega)', name: t('相位谱', 'phase spectrum'), unit: 'rad' },
    { sym: 'e^{-i\\omega t}', name: t('Fourier 核（正交基函数）', 'Fourier kernel, the orthogonal basis function'), unit: '1' },
  ],
  conditions: {
    applies: [
      t('绝对可积或平方可积信号：有限能量的地震记录一定可以变换', 'Absolutely or square integrable signals: any finite-energy seismic record can be transformed'),
      t('广义函数（δ、阶跃、常数）在分布意义下同样成立', 'Generalised functions such as δ, steps and constants are covered in the distributional sense'),
    ],
    assumes: [
      t('信号定义在整个实轴上；实测记录窗外视为零（等价于加矩形窗）', 'The signal is defined on the whole real axis; a recorded trace is treated as zero outside the window, which is equivalent to applying a rectangular window'),
      t('线性系统：变换本身是线性的', 'Linearity: the transform itself is linear'),
    ],
    breaks: [
      t('非平稳信号（能量随时间迁移）需要短时 Fourier 或小波，单一 F(ω) 抹掉了时间信息', 'For non-stationary signals, whose energy migrates in time, one needs the short-time Fourier transform or wavelets; a single F(ω) erases the time information'),
      t('截断与离散化会引入频谱泄漏与混叠，需加窗并遵守采样定理', 'Truncation and discretisation introduce spectral leakage and aliasing, so windowing and the sampling theorem must be respected'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('把信号看成谐和波的连续叠加', 'Regard the signal as a continuous superposition of harmonic waves'),
      latex: String.raw`f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}F(\omega)\,e^{i\omega t}\,\dd\omega`,
      note: t('这就是反变换：每个频率贡献一个复权重 F(ω)dω/2π。', 'This is the inverse transform: each frequency contributes a complex weight F(ω)dω/2π.'),
    },
    {
      n: 2,
      op: 'identity',
      title: t('用正交性把某个频率「挑」出来', 'Use orthogonality to isolate one frequency'),
      latex: String.raw`\int_{-\infty}^{\infty}e^{i(\omega-\omega')t}\,\dd t=2\pi\,\delta(\omega-\omega')`,
      note: t('这是 Dirac δ 的积分表示，也是整个变换可逆的根本原因。', 'This is the integral representation of the Dirac delta and the reason the whole transform is invertible.'),
    },
    {
      n: 3,
      op: 'transform',
      title: t('两边同乘 e^{-iω\'t} 并对 t 积分', 'Multiply both sides by e^{−iω′t} and integrate over t'),
      latex: String.raw`\int f(t)e^{-i\omega' t}\dd t=\frac{1}{2\pi}\int F(\omega)\left[\int e^{i(\omega-\omega')t}\dd t\right]\dd\omega`,
    },
    {
      n: 4,
      op: 'substitute',
      title: t('代入正交关系，δ 函数完成筛选', 'Insert the orthogonality relation; the delta does the sifting'),
      latex: String.raw`=\frac{1}{2\pi}\int F(\omega)\,2\pi\delta(\omega-\omega')\,\dd\omega=F(\omega')`,
    },
    {
      n: 5,
      op: 'result',
      title: t('得到正变换，即所求的变换对', 'The forward transform, completing the pair'),
      latex: String.raw`F(\omega)=\int_{-\infty}^{\infty}f(t)\,e^{-i\omega t}\,\dd t`,
      note: t('把 2π 全部放在反变换一侧，就是本卡片采用的约定，也是 Aki & Richards 与 Shearer 的惯例。', 'Putting the whole 2π on the inverse side is the convention adopted here, and the one used by Aki & Richards and by Shearer.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('重要的配套性质', 'Important companion properties'),
      latex: String.raw`\mathcal{F}\!\left\{\frac{\dd f}{\dd t}\right\}=i\omega F(\omega),\qquad \mathcal{F}\{f*g\}=F(\omega)G(\omega)`,
      note: t('求导变乘法、褶积变乘法 —— 这两条性质才是地震学真正依赖 Fourier 变换的理由。', 'Differentiation becomes multiplication, convolution becomes multiplication — these two properties are the real reason seismology leans on the Fourier transform.'),
    },
  ],
  viz: [
    {
      id: 'boxcar-sinc',
      level: 'V1',
      title: t('矩形脉冲的谱：时间越窄，频谱越宽', 'Spectrum of a rectangular pulse: narrower in time means broader in frequency'),
      xlabel: t('角频率 ω (rad/s)', 'angular frequency ω (rad/s)'),
      ylabel: t('归一化振幅谱 |F(ω)| / (A τ)', 'normalised amplitude spectrum |F(ω)| / (A τ)'),
      controls: [
        { id: 'tau', label: t('脉冲宽度 τ', 'pulse width τ'), min: 0.1, max: 5, step: 0.05, value: 1, unit: 's' },
      ],
      xRange: [-40, 40],
      note: t('矩形脉冲的谱是 sinc 函数：|F(ω)| = A τ |sinc(ωτ/2)|，主瓣宽度 ≈ 4π/τ。把 τ 减半，主瓣加倍 —— 这就是「时间分辨率与频率分辨率不可兼得」的定量形式，也是子波处理中一切折中的根源。',
        'The spectrum of a rectangular pulse is a sinc: |F(ω)| = A τ |sinc(ωτ/2)| with a main lobe about 4π/τ wide. Halving τ doubles the lobe — the quantitative form of the statement that time and frequency resolution cannot both be maximised, and the origin of every compromise in wavelet processing.'),
      compute: (p) => {
        const tau = p['tau']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 800; i++) {
          const w = -40 + (i / 800) * 80
          const x = (w * tau) / 2
          const v = Math.abs(x) < 1e-9 ? 1 : Math.abs(Math.sin(x) / x)
          pts.push([w, v])
        }
        return [{ label: t('|sinc(ωτ/2)|', '|sinc(ωτ/2)|'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'spectrum-of-tone',
      level: 'V1',
      title: t('加窗正弦：有限长度如何把谱线抹宽', 'A windowed sinusoid: how finite length smears the spectral line'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('振幅谱（归一化）', 'amplitude spectrum (normalised)'),
      controls: [
        { id: 'f0', label: t('正弦频率 f₀', 'sinusoid frequency f₀'), min: 0.5, max: 10, step: 0.1, value: 3, unit: 'Hz' },
        { id: 'L', label: t('记录长度 L', 'record length L'), min: 0.2, max: 10, step: 0.1, value: 2, unit: 's' },
      ],
      xRange: [0, 15],
      note: t('无限长正弦的谱是两根 δ 谱线；记录长度有限后，谱线被窗函数的谱抹成一个主瓣加一串旁瓣。L 越长，主瓣越窄（≈ 1/L），越能分开两个靠近的频率。',
        'An infinitely long sinusoid has two delta spikes as its spectrum; once the record is finite the line is smeared by the window spectrum into a main lobe plus side lobes. The longer L is, the narrower the lobe, roughly 1/L, and the better two nearby frequencies can be separated.'),
      compute: (p) => {
        const f0 = p['f0']
        const L = p['L']
        const pts: Array<[number, number]> = []
        let peak = 0
        for (let i = 0; i <= 1200; i++) {
          const f = (i / 1200) * 15
          const x = Math.PI * (f - f0) * L
          const v = Math.abs(x) < 1e-9 ? 1 : Math.abs(Math.sin(x) / x)
          if (v > peak) peak = v
          pts.push([f, v])
        }
        const scale = peak > 0 ? 1 / peak : 1
        return [{ label: t('加窗正弦的振幅谱', 'amplitude spectrum of the windowed sinusoid'), color: '#0F6E56', points: pts.map(([a, b]) => [a, b * scale] as [number, number]) }]
      },
    },
  ],
  example: {
    title: t('检查归一化约定是否一致', 'Checking that the normalisation convention is consistent'),
    input: t('对常数信号 f(t) = 1 做变换', 'Transform the constant signal f(t) = 1'),
    steps: [
      t('F(ω) = ∫ e^{-iωt} dt = 2π δ(ω)', 'F(ω) = ∫ e^{−iωt} dt = 2π δ(ω)'),
      t('反变换：(1/2π)∫ 2πδ(ω) e^{iωt} dω = 1，恒等式成立', 'Inverse: (1/2π)∫ 2πδ(ω) e^{iωt} dω = 1，恒等式成立'),
    ],
    output: t('若某本教材把 1/2π 写在正变换一侧，则常数信号的谱会变成 δ(ω) 而非 2πδ(ω)', 'If a textbook puts the 1/2π on the forward side instead, the spectrum of a constant becomes δ(ω) rather than 2πδ(ω)'),
  },
  links: {
    upstream: [
      { id: 'harmonic-plane-wave', note: t('变换的基函数就是谐和波', 'the basis functions are harmonic waves') },
      { id: 'dirac-delta-sifting', note: t('正交性用到 δ 的筛选性质', 'orthogonality relies on the sifting property of δ') },
    ],
    downstream: [
      { id: 'discrete-fourier-transform', note: t('计算机上实际用的是离散版本', 'in practice a computer uses the discrete version') },
      { id: 'convolution-theorem', note: t('变换最重要的用途', 'the most important use of the transform') },
      { id: 'fourier-shift-theorem', note: t('时移只改相位', 'a time shift only changes the phase') },
    ],
    seealso: [{ id: 'fourier-transform' }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.4' },
    { text: 'Bracewell, The Fourier Transform and Its Applications, 3rd ed., §2' },
  ],
}

export default fourierTransformPair
