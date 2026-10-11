import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** complex-velocity-attenuation */
const complexVelocityAttenuation: FormulaCard = {
  id: 'complex-velocity-attenuation',
  name: t('复波速与振幅的空间衰减 e^{−ωx/(2Qc)}', 'Complex Velocity and the Spatial Decay exp(−ωx/(2Qc))'),
  aliases: {
    zh: ['复波速', '空间衰减', '吸收系数', 't* 算子'],
    en: ['complex velocity', 'spatial attenuation', 'absorption coefficient', 't-star operator'],
  },
  node: 'S1.7',
  tags: {
    subject: 'S1.7',
    math: ['MATH.COMPLEX', 'MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.ATTEN', 'METH.PROC'],
    quantity: ['Q.AMP', 'Q.VEL'],
    keywords: t('复波速 复波数 空间衰减 吸收系数 t星 谱比法 振幅衰减 指数衰减', 'complex velocity complex wavenumber spatial attenuation absorption coefficient t-star spectral ratio amplitude decay exponential decay'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`u(x,t)=A_{0}\,\exp\!\left(-\frac{\omega x}{2Qc}\right)\exp\!\left[i\omega\left(t-\frac{x}{c}\right)\right],\qquad \alpha(\omega)=\frac{\omega}{2Qc}`,
    variants: [
      {
        name: t('复波数与复波速', 'Complex wavenumber and complex velocity'),
        latex: String.raw`k^{*}(\omega)=\frac{\omega}{c}-i\alpha=\frac{\omega}{c^{*}},\qquad c^{*}(\omega)=c\left(1+\frac{i}{2Q}\right)`,
      },
      {
        name: t('由复模量推出复波数', 'Complex wavenumber derived from the complex modulus'),
        latex: String.raw`k^{*}=\omega\sqrt{\frac{\rho}{M^{*}}}=\frac{\omega}{c}\left(1+iQ^{-1}\right)^{-1/2}\approx\frac{\omega}{c}\left(1-\frac{i}{2Q}\right)`,
      },
      {
        name: t('Q 与复波数的关系', 'Q in terms of the complex wavenumber'),
        latex: String.raw`Q^{-1}=-\frac{2\,\operatorname{Im}k^{*}}{\operatorname{Re}k^{*}}=\frac{2\alpha c}{\omega}`,
      },
      {
        name: t('累积衰减算子 t* 与谱比法', 'The cumulative attenuation operator t* and the spectral-ratio method'),
        latex: String.raw`A(x,\omega)=A_{0}(\omega)\exp\!\left(-\frac{\omega t^{*}}{2}\right),\qquad t^{*}=\int_{0}^{x}\frac{\mathrm{d}s}{Q\,c}`,
      },
      {
        name: t('以分贝计的空间衰减率', 'Spatial attenuation rate in decibels'),
        latex: String.raw`\alpha_{\mathrm{dB}}=8.686\,\alpha=8.686\,\frac{\omega}{2Qc}=\frac{8.686\,\pi f}{Qc}`,
      },
    ],
  },
  meaning: t(
    '衰减在波场里只有一个可观测后果：沿传播方向振幅按指数掉，而且掉得快与频率成正比 —— 高频先掉光，这就是地震图「越远越闷」的原因。写成复数就是把衰减装进波数（或波速）的虚部里：k = ω/c − iα。把 α 沿路径积起来并除以 c，就得到 t*，它把整条射线的吸收压缩成一个数，谱比法测 Q 用的正是它。',
    'Attenuation has one observable consequence in the wave field: the amplitude decays exponentially along the propagation direction, at a rate proportional to frequency, so high frequencies die first. That is why distant seismograms sound muffled. Writing it in complex form puts the decay into the imaginary part of the wavenumber (or velocity): k = ω/c − iα. Integrating α along the path and dividing by c gives t*, which compresses the absorption of an entire ray into a single number; the spectral-ratio method for Q is based on it.',
  ),
  symbols: [
    { sym: '\\alpha', name: t('空间衰减系数（奈培/米）', 'spatial attenuation coefficient (nepers per metre)'), unit: 'm⁻¹', typical: '10⁻⁶ – 10⁻³（地震频带）' },
    { sym: 'k^{*}', name: t('复波数', 'complex wavenumber'), unit: 'rad/m' },
    { sym: 'c^{*}', name: t('复相速度', 'complex phase velocity'), unit: 'm/s' },
    { sym: 'c', name: t('（实）相速度', '(real) phase velocity'), unit: 'm/s', typical: '2000 – 8000' },
    { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '1', typical: '20 – 600' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s', typical: '10⁻² – 10³' },
    { sym: 't^{*}', name: t('累积衰减算子 ∫ds/(Qc)', 'cumulative attenuation operator ∫ds/(Qc)'), unit: 's', typical: '地幔路径 0.1 – 1 s，地核路径可达 3 s' },
    { sym: 'x', name: t('传播距离', 'propagation distance'), unit: 'm', typical: '10³ – 10⁷' },
  ],
  conditions: {
    applies: [
      t('弱衰减（Q ≳ 10）的均匀或缓变介质中的平面波', 'Plane waves in homogeneous or slowly varying media with weak attenuation (Q ≳ 10)'),
      t('把本征吸收与几何扩散都已分离之后', 'After intrinsic absorption has been separated from geometrical spreading'),
    ],
    assumes: [
      t('采用 u ∝ e^{i(ωt − k*x)} 约定，衰减对应 Im k* < 0', 'The convention u ∝ e^{i(ωt − k*x)} is used, so attenuation corresponds to Im k* < 0'),
      t('Q 在观测频带内近似与频率无关', 'Q is approximately frequency independent over the observation band'),
      t('只考虑本征吸收；散射需另行处理', 'Only intrinsic absorption is considered; scattering must be treated separately'),
    ],
    breaks: [
      t('强衰减（Q < 10）时 (1 + i/Q)^{−1/2} 的一阶展开不够，须完整求复平方根', 'For strong attenuation (Q < 10) the first-order expansion of (1 + i/Q)^{−1/2} is insufficient; the full complex square root is required'),
      t('几何扩散、透射损失、场地响应与仪器响应同样压低振幅，直接拟合 e^{−αx} 会把它们误当成 Q', 'Geometrical spreading, transmission losses, site and instrument responses all reduce the amplitude too, so fitting e^{−αx} directly misattributes them to Q'),
      t('散射主导时（岩石圈浅部）衰减不再是 e^{−αx} 的指数形式', 'Where scattering dominates (shallow lithosphere) the decay is no longer the exponential e^{−αx}'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('带复波数的平面波试探解', 'Plane-wave trial solution with a complex wavenumber'),
      latex: String.raw`u=A_{0}\,e^{i\left(\omega t-k^{*}x\right)},\qquad k^{*}=k_{r}+ik_{i}`,
    },
    {
      n: 2,
      op: 'physics',
      title: t('复波数由复模量决定', 'The complex wavenumber is fixed by the complex modulus'),
      latex: String.raw`k^{*}=\omega\sqrt{\frac{\rho}{M^{*}}}=\omega\sqrt{\frac{\rho}{M'\left(1+iQ^{-1}\right)}}=\frac{\omega}{c}\left(1+iQ^{-1}\right)^{-1/2},\qquad c\equiv\sqrt{\frac{M'}{\rho}}`,
      note: t('注意开方的是 M* 的倒数：模量越大波越快，所以速度里出现的是 1/√M*。', 'Note that it is the reciprocal of M* that is square-rooted: a stiffer medium carries waves faster, so the velocity involves 1/√M*.'),
    },
    {
      n: 3,
      op: 'taylor',
      title: t('弱衰减：一阶展开', 'Weak attenuation: first-order expansion'),
      latex: String.raw`\left(1+iQ^{-1}\right)^{-1/2}\approx 1-\frac{i}{2Q}\;\Longrightarrow\; k^{*}\approx\frac{\omega}{c}-i\,\underbrace{\frac{\omega}{2Qc}}_{\alpha}`,
      note: t('虚部为负，正好给出向 +x 方向的衰减；这一符号是被动性的直接后果。', 'The imaginary part is negative, giving decay in the +x direction; this sign is a direct consequence of passivity.'),
    },
    {
      n: 4,
      op: 'algebra',
      title: t('把相位与振幅分开', 'Separate phase and amplitude'),
      latex: String.raw`u=A_{0}\,e^{i\omega t}\,e^{-i\frac{\omega}{c}x}\,e^{-\alpha x}=A_{0}\,e^{-\alpha x}\,e^{i\omega\left(t-\frac{x}{c}\right)}`,
      note: t('两个指数因子各有分工：第一个管振幅随距离掉，第二个管相位随距离跑。', 'The two exponential factors have distinct jobs: one governs how the amplitude falls with distance, the other how the phase advances with distance.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('衰减率正比于频率：高频先消失', 'The decay rate is proportional to frequency: high frequencies go first'),
      latex: String.raw`\frac{A(x)}{A_{0}}=e^{-\alpha x}=\exp\!\left(-\frac{\omega x}{2Qc}\right),\qquad \alpha=\frac{\pi f}{Qc}`,
      note: t('比如 Q = 100、c = 4000 m/s、f = 10 Hz：α = π·10/(100·4000) ≈ 7.9×10⁻⁵ m⁻¹，走 100 km 只剩 e⁻⁷·⁹ ≈ 4×10⁻⁴。', 'For Q = 100, c = 4000 m/s and f = 10 Hz, α = π·10/(100·4000) ≈ 7.9×10⁻⁵ m⁻¹, so after 100 km only e⁻⁷·⁹ ≈ 4×10⁻⁴ remains.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('沿路径累积：t* 与谱比法', 'Accumulating along the path: t* and the spectral-ratio method'),
      latex: String.raw`\ln\frac{A(x,\omega)}{A_{0}(\omega)}=-\frac{\omega}{2}\int_{0}^{x}\frac{\mathrm{d}s}{Q c}=-\frac{\omega t^{*}}{2}\;\Longrightarrow\; t^{*}=\frac{2}{\omega}\ln\frac{A_{0}}{A}=-\frac{1}{\pi f}\ln\frac{A}{A_{0}}`,
      note: t('把 ln A 对 f 作直线，斜率就是 −πt*。这是从两张地震图里估 Q 最经典的做法。', 'Plotting ln A against f gives a straight line of slope −πt*. This is the classic way to estimate Q from a pair of seismograms.'),
    },
  ],
  viz: [
    {
      id: 'amplitude-vs-distance',
      level: 'V1',
      title: t('三个频率的振幅随距离衰减', 'Amplitude decay with distance at three frequencies'),
      xlabel: t('传播距离 x (m)', 'propagation distance x (m)'),
      ylabel: t('相对振幅 A/A₀', 'relative amplitude A/A₀'),
      controls: [
        { id: 'aq', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 600, step: 5, value: 100, unit: '1' },
        { id: 'ac', label: t('相速度 c', 'phase velocity c'), min: 1500, max: 8000, step: 50, value: 4000, unit: 'm/s' },
        { id: 'af', label: t('参考频率 f', 'reference frequency f'), min: 0.1, max: 50, step: 0.1, value: 5, unit: 'Hz' },
      ],
      xRange: [0, 40000],
      note: t('频率每翻一倍，衰减率就翻一倍 —— 同一条路径上 20 Hz 的能量比 5 Hz 掉得快 4 倍。这就是为什么远震记录只剩低频，也是为什么「提高分辨率」在深部反射地震里几乎不可能。', 'Doubling the frequency doubles the decay rate: along the same path, 20 Hz energy disappears four times faster than 5 Hz. That is why teleseismic records retain only low frequencies and why raising resolution is nearly impossible in deep reflection seismology.'),
      compute: (p) => {
        const q = p['aq'], c = p['ac'], f = p['af']
        if (!(q > 0 && c > 0 && f > 0)) return []
        const xmax = 40000
        const N = 300
        const series: Array<{ label: { zh: string; en: string }; color: string; points: Array<[number, number]> }> = []
        const cols = ['#185FA5', '#0F6E56', '#BA7517']
        const mult = [1, 2, 4]
        for (let m = 0; m < 3; m++) {
          const fq = f * mult[m]
          const alpha = (Math.PI * fq) / (q * c)
          const pts: Array<[number, number]> = []
          for (let i = 0; i <= N; i++) {
            const x = (i / N) * xmax
            pts.push([x, Math.exp(-alpha * x)])
          }
          series.push({
            label: t(`${(Math.round(fq * 10) / 10)} Hz`, `${(Math.round(fq * 10) / 10)} Hz`),
            color: cols[m],
            points: pts,
          })
        }
        return series
      },
    },
    {
      id: 'spectral-ratio',
      level: 'V1',
      title: t('谱比法：ln A 对 f 的直线斜率就是 −πt*', 'Spectral ratio: the slope of ln A against f is −πt*'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('ln[A(f)/A₀]', 'ln[A(f)/A₀]'),
      controls: [
        { id: 'ts', label: t('累积衰减算子 t*', 'cumulative attenuation operator t*'), min: 0.005, max: 1, step: 0.005, value: 0.1, unit: 's' },
      ],
      xRange: [0, 40],
      note: t('t* 越大，直线越陡，高频端被削得越狠。实测时把直达波与后续震相（或两个不同震中距的同一震相）的谱相除，再取对数对 f 作直线，斜率直接给出 t*，进而给出路径平均的 Q。', 'The larger t*, the steeper the line and the more severely the high-frequency end is clipped. In practice one divides the spectra of two arrivals (or of the same phase at two distances), takes the logarithm and fits a straight line against f; the slope gives t* directly and hence the path-averaged Q.'),
      compute: (p) => {
        const ts = p['ts']
        if (!(ts > 0)) return []
        const cols = ['#185FA5', '#0F6E56', '#BA7517']
        const mult = [1, 2, 4]
        const out: Array<{ label: { zh: string; en: string }; color: string; points: Array<[number, number]> }> = []
        const N = 200
        for (let m = 0; m < 3; m++) {
          const tv = ts * mult[m]
          const pts: Array<[number, number]> = []
          for (let i = 0; i <= N; i++) {
            const f = (i / N) * 40
            pts.push([f, -Math.PI * f * tv])
          }
          out.push({
            label: t(`t* = ${(Math.round(tv * 1000) / 1000)} s`, `t* = ${(Math.round(tv * 1000) / 1000)} s`),
            color: cols[m],
            points: pts,
          })
        }
        return out
      },
    },
  ],
  links: {
    upstream: [
      { id: 'q-from-complex-modulus', note: t('提供 Q⁻¹ = M″/M′', 'supplies Q⁻¹ = M″/M′') },
      { id: 'fourier-transform', note: t('谱比法需要把波形变到频域', 'the spectral-ratio method requires transforming to the frequency domain') },
    ],
    seealso: [
      { id: 'quality-factor-q', note: t('Q 的定义与典型值', 'the definition and typical values of Q') },
      { id: 'harmonic-plane-wave', note: t('无损时的平面波解', 'the lossless plane-wave solution') },
      { id: 'brune-source-spectrum', note: t('震源谱与衰减谱需要在频域里分离', 'source and attenuation spectra must be separated in the frequency domain') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.4–5.5' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §6.4' },
    { text: "Futterman (1962), Dispersive body waves, JGR 67, 5279–5291" },
  ],
}

export default complexVelocityAttenuation
