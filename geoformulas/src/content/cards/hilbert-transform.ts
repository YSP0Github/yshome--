import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** hilbert-transform */
const hilbertTransform: FormulaCard = {
  id: 'hilbert-transform',
  name: t('Hilbert 变换', 'The Hilbert Transform'),
  aliases: { zh: ['希尔伯特变换', '正交滤波', '90 度相移'], en: ['Hilbert transform', 'quadrature filter', '90-degree phase shift'] },
  node: 'S0.4',
  tags: {
    math: ['MATH.COMPLEX', 'MATH.FOURIER'],
    method: ['METH.PROC'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: t('希尔伯特变换 正交道 主值积分 相移 解析信号 包络', 'Hilbert transform quadrature principal value phase shift analytic signal envelope'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\mathcal{H}\{x\}(t)=\frac{1}{\pi}\,\mathrm{P.V.}\!\int_{-\infty}^{\infty}\frac{x(\tau)}{t-\tau}\,\mathrm{d}\tau`,
    variants: [
      { name: t('等价的反对称形式（避开主值记号）', 'Equivalent antisymmetric form (no principal value needed)'), latex: String.raw`\mathcal{H}\{x\}(t)=\frac{1}{\pi}\int_{0}^{\infty}\frac{x(t-\tau)-x(t+\tau)}{\tau}\,\mathrm{d}\tau` },
      { name: t('频域定义：最实用的一条', 'Frequency-domain definition: the most practical one'), latex: String.raw`\hat{X}(\omega)=-i\,\operatorname{sgn}(\omega)\,X(\omega)` },
      { name: t('单频信号的作用结果', 'Action on a single-frequency signal'), latex: String.raw`\mathcal{H}\{\cos\omega_{0}t\}=\sin\omega_{0}t,\qquad \mathcal{H}\{\sin\omega_{0}t\}=-\cos\omega_{0}t` },
      { name: t('两次变换回到负的原信号', 'Applying it twice returns minus the original'), latex: String.raw`\mathcal{H}^{2}\{x\}=-x,\qquad \mathcal{H}^{-1}=-\mathcal{H}` },
    ],
  },
  meaning: t(
    'Hilbert 变换是一个理想的全通 90° 相移器：它把所有正频率分量延后 π/2、把所有负频率分量提前 π/2，而振幅谱一点不变。在地震学中它是构造正交道、计算瞬时包络与瞬时频率的标准工具——地震图的「振幅随时间怎么变」几乎全靠它提取。注意它是非局域的：每一点的变换值都依赖整个时间序列。',
    'The Hilbert transform is an ideal all-pass 90-degree phase shifter: it delays every positive-frequency component by π/2 and advances every negative-frequency one by π/2, leaving the amplitude spectrum untouched. In seismology it is the standard tool for building the quadrature trace and computing instantaneous envelope and instantaneous frequency — almost every statement about how amplitude varies along a seismogram is extracted with it. Note that it is non-local: the transformed value at each point depends on the entire time series.',
  ),
  symbols: [
    { sym: 'x(t)', name: t('输入的实信号', 'input real signal'), unit: '与信号同' },
    { sym: '\\mathcal{H}\\{x\\}(t)', name: t('Hilbert 变换，也称正交道', 'Hilbert transform, also called the quadrature trace'), unit: '与信号同' },
    { sym: '\\mathrm{P.V.}', name: t('柯西主值', 'Cauchy principal value'), unit: '1' },
    { sym: 'X(\\omega)', name: t('信号的 Fourier 谱', 'Fourier spectrum of the signal'), unit: '与信号同 · s' },
    { sym: '\\operatorname{sgn}(\\omega)', name: t('符号函数：ω>0 取 +1，ω<0 取 −1', 'sign function: +1 for ω > 0, −1 for ω < 0'), unit: '1' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: '\\tau', name: t('积分哑变量（滞后时间）', 'integration dummy variable (lag time)'), unit: 's' },
  ],
  conditions: {
    applies: [
      t('平方可积的实信号 x ∈ L²', 'Square-integrable real signals x in L²'),
      t('离散实现要求信号截断后两端接近零，否则要做加窗或补零', 'Discrete implementations require the signal to taper to near zero at both ends, otherwise windowing or zero padding is needed'),
    ],
    assumes: [
      t('信号是实的、线性叠加成立', 'The signal is real and linear superposition holds'),
      t('在离散形式中默认周期延拓，因此端点会有环绕误差', 'The discrete form implicitly assumes periodic extension, so endpoints carry wrap-around error'),
    ],
    breaks: [
      t('含直流或极低频漂移时，正交道会出现虚假的长周期起伏', 'With DC offset or very low-frequency drift the quadrature trace develops spurious long-period undulations'),
      t('窄带假设（Bedrosian 定理）不成立时，包络不再等于实际的幅度调制', 'When the narrow-band assumption (Bedrosian theorem) fails, the envelope no longer equals the true amplitude modulation'),
      t('强噪声会放大正交道，因为变换对高频不衰减', 'Strong noise is amplified in the quadrature trace because the transform does not attenuate high frequencies'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('目标：造一个把余弦变正弦的算子', 'Goal: build an operator that turns cosine into sine'),
      latex: String.raw`\cos\omega t\;\longrightarrow\;\sin\omega t=\cos\!\left(\omega t-\frac{\pi}{2}\right)`,
      note: t('单看正频率，这等价于把相位延后 π/2，即乘以 e^{−iπ/2} = −i。', 'For positive frequencies alone this delays the phase by π/2, i.e. multiplies by e^{−iπ/2} = −i.') },
    { n: 2, op: 'setup', title: t('在频域写出这个乘子', 'Write the multiplier in the frequency domain'),
      latex: String.raw`\hat{X}(\omega)=-i\,\operatorname{sgn}(\omega)\,X(\omega)`,
      note: t('负频率取 +i 是为了保证结果是实的：实信号的谱满足 X(−ω) = X*(ω)，共轭对称必须保持。', 'The +i for negative frequencies guarantees a real output: a real signal obeys X(−ω) = X*(ω), and that conjugate symmetry must be preserved.') },
    { n: 3, op: 'identity', title: t('乘子的模恒为 1：全通', 'The multiplier has unit modulus: all-pass'),
      latex: String.raw`\left|-i\,\mathrm{sgn}(\omega)\right|=1\;\Longrightarrow\; \left|\hat{X}(\omega)\right|=\left|X(\omega)\right|`,
      note: t('振幅谱完全不变 —— 所以它不改变能量，只重排相位。', 'The amplitude spectrum is unchanged, so it redistributes phase without changing energy.') },
    { n: 4, op: 'transform', title: t('取逆 Fourier 变换求时域核', 'Inverse transform to obtain the time-domain kernel'),
      latex: String.raw`h(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\left[-i\,\mathrm{sgn}(\omega)\right]e^{i\omega t}\,\mathrm{d}\omega=\frac{1}{\pi t}` },
    { n: 5, op: 'substitute', title: t('与信号卷积，得到主值积分', 'Convolve with the signal to get the principal-value integral'),
      latex: String.raw`\mathcal{H}\{x\}(t)=x*h=\frac{1}{\pi}\,\mathrm{P.V.}\!\int_{-\infty}^{\infty}\frac{x(\tau)}{t-\tau}\,\mathrm{d}\tau`,
      note: t('核 1/(πt) 在 t = 0 处不可积，积分只能按柯西主值理解：对称地挖掉奇点。', 'The kernel 1/(πt) is not integrable at t = 0, so the integral must be read as a Cauchy principal value: remove the singularity symmetrically.') },
    { n: 6, op: 'identity', title: t('验证单频情形', 'Check the single-frequency case'),
      latex: String.raw`\mathcal{H}\{\cos\omega_{0}t\}=\frac{1}{2}\mathcal{H}\{e^{i\omega_{0}t}+e^{-i\omega_{0}t}\}=\frac{-i\,e^{i\omega_{0}t}+i\,e^{-i\omega_{0}t}}{2}=\sin\omega_{0}t` },
    { n: 7, op: 'result', title: t('作用两次得到 −1（幂等性的记号）', 'Applying twice gives −1'),
      latex: String.raw`\left[-i\,\mathrm{sgn}(\omega)\right]^{2}=-1\;\Longrightarrow\;\mathcal{H}^{2}\{x\}=-x` },
  ],
  viz: [
    {
      id: 'hilbert-quadrature',
      level: 'V1',
      title: t('一个地震子波与它的正交道', 'A seismic wavelet and its quadrature trace'),
      xlabel: t('时间 t (s)', 'time t (s)'),
      ylabel: t('幅度', 'amplitude'),
      controls: [
        { id: 'sg', label: t('子波宽度 σ', 'wavelet width σ'), min: 0.3, max: 3, step: 0.05, value: 1, unit: 's' },
        { id: 'f0', label: t('主频 f₀', 'dominant frequency f₀'), min: 0.2, max: 3, step: 0.05, value: 1, unit: 'Hz' },
      ],
      xRange: [-5, 5],
      note: t('正交道就是把每个周期往后推四分之一周：波峰对应正交道的零交叉。把两道当作复平面的实部与虚部，就得到解析信号。', 'The quadrature trace shifts each cycle back by a quarter period: peaks of the wavelet line up with zero crossings of the quadrature trace. Reading the two as real and imaginary parts gives the analytic signal.'),
      compute: (p) => {
        const sg = p['sg'], f0 = p['f0']
        const res = numericHilbert(sg, f0)
        return [
          { label: t('x(t) 原始子波', 'x(t) original wavelet'), color: '#185FA5', points: res.x },
          { label: t('H{x}(t) 正交道', 'H{x}(t) quadrature trace'), color: '#BA7517', points: res.q },
        ]
      },
    },
    {
      id: 'hilbert-single-frequency',
      level: 'V1',
      title: t('单频情形：余弦变正弦', 'Single frequency: cosine becomes sine'),
      xlabel: t('时间 t (s)', 'time t (s)'),
      ylabel: t('幅度', 'amplitude'),
      controls: [
        { id: 'f1', label: t('频率 f', 'frequency f'), min: 0.1, max: 2, step: 0.05, value: 0.5, unit: 'Hz' },
      ],
      xRange: [0, 6],
      note: t('振幅完全相同、相位恰好差 90°。这就是「全通相移」的字面含义，也是所有 Hilbert 变换性质的检验基准。', 'Identical amplitude, exactly 90° apart in phase. That is the literal content of all-pass phase shift, and the benchmark against which every Hilbert-transform property is checked.'),
      compute: (p) => {
        const f = p['f1']
        const w = 2 * Math.PI * f
        const c: Array<[number, number]> = []
        const s: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const tt = (i / 600) * 6
          c.push([tt, Math.cos(w * tt)])
          s.push([tt, Math.sin(w * tt)])
        }
        return [
          { label: t('cos(ωt)', 'cos(ωt)'), color: '#185FA5', points: c },
          { label: t('H{cos} = sin(ωt)', 'H{cos} = sin(ωt)'), color: '#0F6E56', dash: true, points: s },
        ]
      },
    },
  ],
  example: {
    title: t('检查一个余弦子波', 'Check a cosine wavelet'),
    input: t('x(t) = cos(2π·2 t)，即 f = 2 Hz', 'x(t) = cos(2π·2 t), i.e. f = 2 Hz'),
    steps: [
      t('X(ω) = π[δ(ω − ω₀) + δ(ω + ω₀)]', 'X(ω) = π[δ(ω − ω₀) + δ(ω + ω₀)]'),
      t('乘以 −i sgn(ω) 后，正频率项得 −iπ、负频率项得 +iπ', 'After multiplying by −i sgn(ω) the positive term gets −iπ and the negative term +iπ'),
      t('逆变换：X_H = (−iπ e^{iω₀t} + iπ e^{−iω₀t})/(2π) = sin(ω₀t)', 'Inverse transform: X_H = (−iπ e^{iω₀t} + iπ e^{−iω₀t})/(2π) = sin(ω₀t)'),
    ],
    output: t('H{cos(2π·2t)} = sin(2π·2t)，振幅 1 不变，滞后四分之一周期（0.125 s）。', 'H{cos(2π·2t)} = sin(2π·2t): amplitude 1 unchanged, delayed by a quarter period (0.125 s).'),
  },
  links: {
    upstream: [
      { id: 'fourier-transform', note: t('频域定义以此为基础', 'the frequency-domain definition rests on it') },
    ],
    downstream: [
      { id: 'analytic-signal-envelope', note: t('正交道是解析信号的虚部', 'the quadrature trace is the imaginary part of the analytic signal') },
    ],
    seealso: [
      { id: 'complex-phasor-representation', note: t('乘以 i 就是 90° 相移', 'multiplying by i is a 90° phase shift') },
      { id: 'residue-theorem', note: t('主值积分的严格处理', 'rigorous treatment of principal-value integrals') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
    { text: 'Taner, Koehler & Sheriff (1979), Complex seismic trace analysis, Geophysics 44, 1041' },
  ],
}

function numericHilbert(sigma: number, f0: number): { x: Array<[number, number]>; q: Array<[number, number]> } {
  const T = 14
  const N = 561
  const dt = (2 * T) / (N - 1)
  const ts: number[] = []
  const xs: number[] = []
  for (let i = 0; i < N; i++) {
    const tt = -T + i * dt
    ts.push(tt)
    xs.push(Math.exp(-((tt / sigma) * (tt / sigma))) * Math.cos(2 * Math.PI * f0 * tt))
  }
  const x: Array<[number, number]> = []
  const q: Array<[number, number]> = []
  for (let i = 0; i < N; i++) {
    if (Math.abs(ts[i]) > 5) continue
    let s = 0
    for (let j = 0; j < N; j++) {
      if (j === i) continue
      s += xs[j] / (ts[i] - ts[j])
    }
    x.push([ts[i], xs[i]])
    q.push([ts[i], (s * dt) / Math.PI])
  }
  return { x, q }
}

export default hilbertTransform
