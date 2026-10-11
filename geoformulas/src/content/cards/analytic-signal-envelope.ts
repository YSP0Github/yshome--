import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** analytic-signal-envelope */
const analyticSignalEnvelope: FormulaCard = {
  id: 'analytic-signal-envelope',
  name: t('解析信号与瞬时包络', 'Analytic Signal and Instantaneous Envelope'),
  aliases: { zh: ['解析信号', '瞬时振幅', '瞬时相位', '瞬时频率', '复地震道'], en: ['analytic signal', 'instantaneous amplitude', 'instantaneous phase', 'instantaneous frequency', 'complex trace'] },
  node: 'S0.4',
  tags: {
    math: ['MATH.COMPLEX', 'MATH.FOURIER'],
    method: ['METH.PROC'],
    quantity: ['Q.AMP', 'Q.TIME', 'Q.FREQ'],
    keywords: t('解析信号 包络 瞬时振幅 瞬时相位 瞬时频率 复地震道 属性提取', 'analytic signal envelope instantaneous amplitude phase frequency complex trace attribute'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`z(t)=x(t)+i\,\mathcal{H}\{x\}(t)=a(t)\,e^{i\phi(t)}`,
    variants: [
      { name: t('瞬时包络（瞬时振幅）', 'Instantaneous envelope (instantaneous amplitude)'), latex: String.raw`a(t)=|z(t)|=\sqrt{x^{2}(t)+\mathcal{H}^{2}\{x\}(t)}` },
      { name: t('瞬时相位', 'Instantaneous phase'), latex: String.raw`\phi(t)=\arg z(t)=\arctan\!\left(\frac{\mathcal{H}\{x\}(t)}{x(t)}\right)` },
      { name: t('瞬时频率', 'Instantaneous frequency'), latex: String.raw`f(t)=\frac{1}{2\pi}\frac{\mathrm{d}\phi}{\mathrm{d}t}=\frac{1}{2\pi}\,\Im\!\left\{\frac{\dot z(t)}{z(t)}\right\}` },
      { name: t('频谱：只有正频率，且加倍', 'Spectrum: positive frequencies only, doubled'), latex: String.raw`Z(\omega)=2\,X(\omega)\,H(\omega)\;\Longrightarrow\;\left|Z\right|=2\left|X\right|\ \ (\omega>0),\ \ Z(\omega)=0\ \ (\omega<0)` },
    ],
  },
  meaning: t(
    '把一道地震记录和它的 Hilbert 正交道配成复数，就得到解析信号 z(t)。它的模 a(t) 就是「振幅随时间怎么变」——震相到时、能量衰减、薄层调谐都靠它读出；它的辐角求导就是瞬时频率——地层吸收造成的低频化、频散造成的频率漂移都靠它读出。这是地震道属性分析（三瞬：瞬时振幅、瞬时相位、瞬时频率）的数学核心。',
    'Pairing a seismic trace with its Hilbert quadrature trace as a complex number gives the analytic signal z(t). Its modulus a(t) is how the amplitude varies in time — phase arrival, energy decay and thin-bed tuning are all read from it; differentiating its argument gives the instantaneous frequency — the low-frequency shift from anelastic absorption and the drift from dispersion are read from it. This is the mathematical core of complex-trace attribute analysis (the three instantaneous attributes).',
  ),
  symbols: [
    { sym: 'z(t)', name: t('解析信号（复地震道）', 'analytic signal (complex trace)'), unit: '与信号同' },
    { sym: 'x(t)', name: t('原始实信号', 'original real signal'), unit: 'm/s 或 m' },
    { sym: '\\mathcal{H}\\{x\\}(t)', name: t('正交道', 'quadrature trace'), unit: '与信号同' },
    { sym: 'a(t)', name: t('瞬时包络（瞬时振幅）', 'instantaneous envelope (amplitude)'), unit: '与信号同' },
    { sym: '\\phi(t)', name: t('瞬时相位', 'instantaneous phase'), unit: 'rad' },
    { sym: 'f(t)', name: t('瞬时频率', 'instantaneous frequency'), unit: 'Hz' },
    { sym: 'H(\\omega)', name: t('Heaviside 阶跃函数', 'Heaviside step function'), unit: '1' },
    { sym: '\\Im\\{\\}', name: t('取虚部', 'take the imaginary part'), unit: '1' },
  ],
  conditions: {
    applies: [
      t('窄带信号：频谱集中在主频附近（Bedrosian 定理）', 'Narrow-band signals whose spectrum concentrates near a dominant frequency (Bedrosian theorem)'),
      t('单道、已去均值并做过带通滤波的地震记录', 'Single traces that are de-meaned and band-pass filtered'),
    ],
    assumes: [
      t('包络 a(t) 的频谱与载波 cos φ(t) 的频谱不重叠', 'The spectrum of the envelope a(t) does not overlap that of the carrier cos φ(t)'),
      t('信号为线性叠加的振动，不含强散射噪声', 'The signal is a linear superposition of oscillations without strong scattering noise'),
    ],
    breaks: [
      t('宽带或强噪声时包络会出现负值般的剧烈抖动，瞬时频率可以跳到物理上无意义的值', 'For broad-band or noisy data the envelope jitters wildly and the instantaneous frequency can jump to physically meaningless values'),
      t('多震相重叠时单一瞬时频率没有意义，应分窗口计算', 'When several phases overlap a single instantaneous frequency is meaningless; use time windows'),
      t('a(t) 过零时瞬时相位不连续，需做相位解缠', 'Where a(t) vanishes the phase is discontinuous and must be unwrapped'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('实信号的谱共轭对称，一半是冗余的', 'The spectrum of a real signal is conjugate symmetric, so half of it is redundant'),
      latex: String.raw`X(-\omega)=X^{*}(\omega)`,
      note: t('负频率不含新信息，把它删掉不会丢东西，反而得到一个「更紧凑」的表示。', 'Negative frequencies carry no new information; deleting them loses nothing and gives a more compact representation.') },
    { n: 2, op: 'setup', title: t('删掉负频率并把正频率加倍', 'Delete negative frequencies and double the positive ones'),
      latex: String.raw`Z(\omega)=2\,H(\omega)\,X(\omega)` },
    { n: 3, op: 'transform', title: t('逆变换：H(ω) 对应 δ(t)/2 + i/(2πt)', 'Inverse transform: H(ω) corresponds to δ(t)/2 + i/(2πt)'),
      latex: String.raw`z(t)=x(t)+\frac{i}{\pi}\,\mathrm{P.V.}\!\int_{-\infty}^{\infty}\frac{x(\tau)}{t-\tau}\,\mathrm{d}\tau=x(t)+i\,\mathcal{H}\{x\}(t)`,
      note: t('虚部恰好就是 Hilbert 变换 —— 这就是解析信号与 Hilbert 变换的必然联系。', 'The imaginary part is exactly the Hilbert transform, which is why the analytic signal and the Hilbert transform are inseparable.') },
    { n: 4, op: 'identity', title: t('写成极坐标形式', 'Write it in polar form'),
      latex: String.raw`z(t)=a(t)\,e^{i\phi(t)},\qquad x(t)=a(t)\cos\phi(t)`,
      note: t('于是任何实振动都可以看成「慢变的振幅 a(t)」乘上「快变的振荡 cos φ(t)」。', 'Any real oscillation is thus a slowly varying amplitude a(t) times a rapidly varying oscillation cos φ(t).') },
    { n: 5, op: 'identity', title: t('取模与辐角', 'Take modulus and argument'),
      latex: String.raw`a(t)=\sqrt{x^{2}+\mathcal{H}^{2}\{x\}},\qquad \phi(t)=\arctan\!\left(\frac{\mathcal{H}\{x\}}{x}\right)` },
    { n: 6, op: 'result', title: t('对相位求导得到瞬时频率', 'Differentiate the phase to get instantaneous frequency'),
      latex: String.raw`\omega(t)=\dot\phi(t)=\Im\!\left\{\frac{\dot z}{z}\right\}=\frac{x\,\dot{\hat x}-\hat x\,\dot x}{x^{2}+\hat{x}^{2}}`,
      note: t('这个式子避免了相位解缠，实际计算瞬时频率时最常用。', 'This form avoids phase unwrapping and is the standard practical formula for instantaneous frequency.') },
  ],
  viz: [
    {
      id: 'envelope-two-arrivals',
      level: 'V1',
      title: t('两个震相的包络：到时拾取的原理', 'Envelope of two arrivals: the principle of arrival picking'),
      xlabel: t('时间 t (s)', 'time t (s)'),
      ylabel: t('幅度', 'amplitude'),
      controls: [
        { id: 'dt0', label: t('到时差 Δt', 'arrival separation Δt'), min: 0.5, max: 8, step: 0.1, value: 4, unit: 's' },
        { id: 'f0', label: t('主频 f₀', 'dominant frequency f₀'), min: 0.3, max: 4, step: 0.1, value: 1.5, unit: 'Hz' },
        { id: 'rt', label: t('第二震相相对振幅', 'relative amplitude of the second arrival'), min: 0.1, max: 1.5, step: 0.05, value: 0.7, unit: '1' },
        { id: 'sg', label: t('子波宽度 σ', 'wavelet width σ'), min: 0.2, max: 1.5, step: 0.05, value: 0.5, unit: 's' },
      ],
      xRange: [0, 12],
      note: t('包络把振荡「整流」成两个光滑的鼓包，鼓包的位置就是到时、高度就是相对能量。当 Δt 小到两个鼓包合并，就分辨不出两个震相了 —— 这就是分辨率极限的直观来源。', 'The envelope rectifies the oscillation into two smooth bumps: their positions are the arrival times, their heights the relative energy. When Δt becomes small enough for the bumps to merge, the two phases can no longer be separated, which is exactly where the resolution limit comes from.'),
      compute: (p) => {
        const dt0 = p['dt0'], f0 = p['f0'], rt = p['rt'], sg = p['sg']
        const T = 12
        const N = 601
        const step = T / (N - 1)
        const ts: number[] = []
        const xs: number[] = []
        for (let i = 0; i < N; i++) {
          const tt = i * step
          const g1 = Math.exp(-(((tt - 3) / sg) * ((tt - 3) / sg)))
          const g2 = rt * Math.exp(-(((tt - 3 - dt0) / sg) * ((tt - 3 - dt0) / sg)))
          ts.push(tt)
          xs.push(g1 * Math.cos(2 * Math.PI * f0 * (tt - 3)) + g2 * Math.cos(2 * Math.PI * f0 * (tt - 3 - dt0)))
        }
        const env: Array<[number, number]> = []
        const tr: Array<[number, number]> = []
        for (let i = 0; i < N; i++) {
          let s = 0
          for (let j = 0; j < N; j++) {
            if (j === i) continue
            s += xs[j] / (ts[i] - ts[j])
          }
          const q = (s * step) / Math.PI
          tr.push([ts[i], xs[i]])
          env.push([ts[i], Math.sqrt(xs[i] * xs[i] + q * q)])
        }
        return [
          { label: t('地震道 x(t)', 'seismic trace x(t)'), color: '#185FA5', points: tr },
          { label: t('瞬时包络 a(t)', 'instantaneous envelope a(t)'), color: '#BA7517', points: env },
        ]
      },
    },
    {
      id: 'instantaneous-frequency-chirp',
      level: 'V1',
      title: t('瞬时频率：一个扫频信号', 'Instantaneous frequency: a chirp'),
      xlabel: t('时间 t (s)', 'time t (s)'),
      ylabel: t('幅度 / 频率 (Hz)', 'amplitude / frequency (Hz)'),
      controls: [
        { id: 'f0c', label: t('起始频率 f₀', 'start frequency f₀'), min: 0.5, max: 4, step: 0.1, value: 1, unit: 'Hz' },
        { id: 'kk', label: t('扫频率 k', 'chirp rate k'), min: -1.5, max: 1.5, step: 0.05, value: 0.6, unit: 'Hz/s' },
      ],
      xRange: [0, 8],
      note: t('k > 0 时频率随时间升高。地震波在传播中因高频吸收更强而「低频化」，实际记录到的正是 k < 0 的情形 —— 瞬时频率随时间下降。', 'For k > 0 the frequency rises in time. Seismic waves lose high frequencies preferentially during propagation, so real records show the k < 0 case: instantaneous frequency decaying with time.'),
      compute: (p) => {
        const f0 = p['f0c'], k = p['kk']
        const tr: Array<[number, number]> = []
        const fr: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const tt = (i / 600) * 8
          const ph = 2 * Math.PI * (f0 * tt + 0.5 * k * tt * tt)
          const env = Math.exp(-(((tt - 4) / 2.2) * ((tt - 4) / 2.2)))
          tr.push([tt, env * Math.cos(ph)])
          fr.push([tt, f0 + k * tt])
        }
        return [
          { label: t('扫频子波', 'chirp wavelet'), color: '#185FA5', points: tr },
          { label: t('瞬时频率 f(t)', 'instantaneous frequency f(t)'), color: '#0F6E56', dash: true, points: fr },
        ]
      },
    },
  ],
  example: {
    title: t('一个简单的解析信号', 'A simple analytic signal'),
    input: t('x(t) = a cos(ω₀t)，其中 a 为常数', 'x(t) = a cos(ω₀t) with constant a'),
    steps: [
      t('正交道 H{x} = a sin(ω₀t)', 'Quadrature trace H{x} = a sin(ω₀t)'),
      t('z = a[cos(ω₀t) + i sin(ω₀t)] = a e^{iω₀t}', 'z = a[cos(ω₀t) + i sin(ω₀t)] = a e^{iω₀t}'),
      t('包络 a(t) = |z| = a（常数）；相位 φ = ω₀t', 'Envelope a(t) = |z| = a (constant); phase φ = ω₀t'),
      t('瞬时频率 = dφ/dt 再除以 2π，等于 f₀（常数）', 'Instantaneous frequency = (dφ/dt)/(2π) = f₀ (constant)'),
    ],
    output: t('常振幅单频信号的解析信号就是一个匀速旋转的相量：包络平、频率平。任何偏离都意味着真实的物理变化。', 'The analytic signal of a constant-amplitude single-frequency signal is a uniformly rotating phasor: flat envelope, flat frequency. Any departure from that means a real physical change.'),
  },
  links: {
    upstream: [
      { id: 'hilbert-transform', note: t('提供虚部（正交道）', 'supplies the imaginary part (quadrature trace)') },
      { id: 'complex-phasor-representation', note: t('相量概念的时变推广', 'the time-varying extension of a phasor') },
    ],
    seealso: [
      { id: 'quality-factor-q', note: t('吸收使瞬时频率随时间下降', 'absorption makes instantaneous frequency decay in time') },
      { id: 'nyquist-sampling', note: t('采样率限制了瞬时频率的可解析范围', 'sampling rate bounds the resolvable instantaneous frequency') },
    ],
  },
  refs: [
    { text: 'Taner, Koehler & Sheriff (1979), Complex seismic trace analysis, Geophysics 44, 1041' },
    { text: 'Boashash (1992), Estimating and interpreting the instantaneous frequency of a signal, Proc. IEEE 80, 520' },
  ],
}

export default analyticSignalEnvelope
