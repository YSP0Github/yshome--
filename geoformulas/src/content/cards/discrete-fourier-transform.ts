import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** discrete-fourier-transform */
const discreteFourierTransform: FormulaCard = {
  id: 'discrete-fourier-transform',
  name: t('离散 Fourier 变换（DFT）', 'The Discrete Fourier Transform'),
  aliases: { zh: ['DFT', '离散傅里叶变换', 'FFT'], en: ['DFT', 'discrete Fourier transform', 'FFT'] },
  node: 'S0.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.LINALG', 'MATH.COMPLEX'],
    method: ['METH.PROC', 'METH.INV'],
    quantity: ['Q.FREQ', 'Q.AMP'],
    keywords: t('DFT FFT 离散傅里叶变换 频率采样 谱线间隔 泄漏 频率分辨率 分箱', 'DFT FFT discrete transform frequency sampling bin spacing leakage resolution'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`X_n=\sum_{m=0}^{N-1}x_m\,e^{-2\pi i mn/N},\qquad n=0,1,\dots,N-1`,
    variants: [
      { name: t('反变换（IDFT）', 'The inverse transform'), latex: String.raw`x_m=\frac{1}{N}\sum_{n=0}^{N-1}X_n\,e^{2\pi i mn/N}` },
      { name: t('频率分箱与分辨率', 'Frequency bins and resolution'), latex: String.raw`f_n=\frac{n}{N\Delta t},\qquad \Delta f=\frac{1}{N\Delta t}=\frac{1}{T_{rec}}` },
      { name: t('复指数写成三角形式', 'The complex exponential in trigonometric form'), latex: String.raw`X_n=\sum_{m=0}^{N-1}x_m\left[\cos\frac{2\pi mn}{N}-i\sin\frac{2\pi mn}{N}\right]` },
      { name: t('实序列的对称性与 Nyquist 分箱', 'Symmetry for real sequences and the Nyquist bin'), latex: String.raw`X_{N-n}=X_n^{*},\qquad f_{N/2}=\frac{1}{2\Delta t}=f_{Nyq}` },
    ],
  },
  meaning: t(
    'DFT 是 Fourier 变换在计算机上的唯一可行形态：时间被 Δt 离散、长度被截断为 N 点，于是频率也只能落在 N 个等间隔的「分箱」上。它把 N 个实数变成 N 个复数，信息量守恒，且可以完全可逆。所有地震数据处理 —— 滤波、谱比法 Q 估计、频散成像、反褶积 —— 底层都是这一行公式（用 FFT 加速）。',
    'The DFT is the only form of the Fourier transform a computer can actually carry out: time is discretised at Δt, the record is truncated to N samples, and frequency is consequently forced onto N equally spaced bins. It turns N real numbers into N complex ones with no loss of information and is fully invertible. Every seismic processing step — filtering, spectral-ratio Q estimation, dispersion imaging, deconvolution — rests on this one line, accelerated by the FFT.',
  ),
  symbols: [
    { sym: 'x_m', name: t('第 m 个采样点，m = 0 … N−1', 'the m-th sample, m = 0 … N−1'), unit: '同原物理量' },
    { sym: 'X_n', name: t('第 n 个频率分箱的复谱值', 'complex spectral value in the n-th bin'), unit: '原物理量 · s' },
    { sym: 'N', name: t('采样点数（通常是 2 的整数次幂）', 'number of samples, usually a power of two'), unit: '1', typical: '2⁸ – 2¹⁴' },
    { sym: '\\Delta t', name: t('采样间隔', 'sampling interval'), unit: 's', typical: '0.001 – 0.05 s' },
    { sym: '\\Delta f', name: t('频率分辨率（分箱间隔）', 'frequency resolution, that is, bin spacing'), unit: 'Hz' },
    { sym: 'f_n', name: t('第 n 个分箱对应的频率', 'frequency of the n-th bin'), unit: 'Hz' },
    { sym: 'f_{Nyq}', name: t('Nyquist 频率 = 1/(2Δt)', 'Nyquist frequency, 1/(2Δt)'), unit: 'Hz' },
    { sym: 'T_{rec}', name: t('记录总长度 NΔt', 'total record length NΔt'), unit: 's' },
  ],
  conditions: {
    applies: [
      t('有限长、等间隔采样的离散序列', 'A finite sequence sampled at equal intervals'),
      t('隐含周期性假设：DFT 把序列当成周期延拓的一个周期', 'An implicit periodicity assumption: the DFT treats the sequence as one period of a periodic extension'),
    ],
    assumes: [
      t('采样率足够高，已无混叠（见采样定理）', 'The sampling rate is high enough that aliasing is absent'),
      t('若信号非整周期截断，需先加窗（Hann、Hanning 等）抑制泄漏', 'If the signal is not truncated at a whole number of periods, a window such as Hann must be applied to suppress leakage'),
    ],
    breaks: [
      t('信号含高于 Nyquist 频率的成分时会混叠，谱被折叠回来', 'Components above the Nyquist frequency alias and are folded back into the spectrum'),
      t('非平稳信号需要分窗（短时 Fourier）或改用小波', 'Non-stationary signals need windowing in time, the short-time Fourier transform, or wavelets'),
      t('首尾不连续会在整个频带产生 1/f 型泄漏尾巴', 'A discontinuity between the first and last sample produces a 1/f leakage tail across the whole band'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('连续变换的积分写成黎曼和', 'Write the continuous transform integral as a Riemann sum'),
      latex: String.raw`F(\omega)=\int f(t)e^{-i\omega t}\dd t\;\longrightarrow\;\sum_{m=0}^{N-1}f(m\Delta t)\,e^{-i\omega m\Delta t}\,\Delta t`,
    },
    {
      n: 2,
      op: 'setup',
      title: t('频率也只能取离散值', 'Frequency must be discretised too'),
      latex: String.raw`\omega_n=\frac{2\pi n}{N\Delta t},\qquad n=0,1,\dots,N-1`,
      note: t('N 个采样点只能确定 N 个独立频率，再多就是重复。', 'N samples can determine only N independent frequencies; beyond that everything repeats.'),
    },
    {
      n: 3,
      op: 'substitute',
      title: t('代入并丢掉公共因子 Δt（约定归一化）', 'Substitute and drop the common factor Δt by convention'),
      latex: String.raw`X_n=\sum_{m=0}^{N-1}x_m\,e^{-2\pi i mn/N}=\sum_{m=0}^{N-1}x_m\,W_N^{mn},\qquad W_N=e^{-2\pi i/N}`,
      note: t('W_N 是 N 次单位根；因为 W_N^N = 1，指数只需模 N 计算。', 'W_N is an N-th root of unity; since W_N^N = 1 the exponent only matters modulo N.'),
    },
    {
      n: 4,
      op: 'identity',
      title: t('逆变换来自单位根的正交性', 'The inverse follows from orthogonality of the roots of unity'),
      latex: String.raw`\sum_{n=0}^{N-1}W_N^{n(m-m')}=N\,\delta_{mm'}\;\Longrightarrow\;x_m=\frac{1}{N}\sum_{n=0}^{N-1}X_n\,W_N^{-mn}`,
    },
    {
      n: 5,
      op: 'result',
      title: t('频率刻度与分辨率', 'The frequency scale and the resolution'),
      latex: String.raw`f_n=\frac{n}{N\Delta t},\qquad \Delta f=\frac{1}{N\Delta t}=\frac{1}{T_{rec}}`,
      note: t('想提高频率分辨率只能加长记录 T_rec，与采样率无关 —— 这是最常被误解的一点。', 'Frequency resolution can only be improved by lengthening the record T_rec, not by sampling faster — a point that is very often misunderstood.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('整周期采样时谱线落在一根分箱上', 'Whole-period sampling puts the line exactly on one bin'),
      latex: String.raw`f_0=\frac{n_0}{N\Delta t}\;\Longrightarrow\;|X_n|= \frac{N A}{2}\ \text{仅在}\ n=n_0,N-n_0\ \text{处非零}`,
      note: t('否则能量散落到所有分箱，这就是「泄漏」。', 'Otherwise the energy spills into every bin; that is leakage.'),
    },
  ],
  viz: [
    {
      id: 'dft-leakage',
      level: 'V1',
      title: t('整周期与非整周期：泄漏的可视化', 'Whole-number versus non-integer cycles: leakage made visible'),
      xlabel: t('分箱序号 n', 'bin index n'),
      ylabel: t('振幅谱 |X_n| （归一化）', 'amplitude spectrum |X_n| (normalised)'),
      controls: [
        { id: 'cyc', label: t('记录内的循环数', 'number of cycles in the record'), min: 1, max: 24, step: 0.25, value: 8, unit: 'cycles' },
        { id: 'Nb', label: t('采样点数 N', 'number of samples N'), min: 32, max: 256, step: 32, value: 128, unit: '1' },
      ],
      xRange: [0, 64],
      note: t('把循环数调成整数（如 8），能量集中在两根谱线上；调成 8.5，能量立即散成一片 —— 这就是泄漏。野外记录永远是非整周期的，所以做谱分析前必须加窗。',
        'Set the cycle count to an integer such as 8 and the energy collapses onto two lines; set it to 8.5 and the energy smears out at once — that is leakage. Field records are never whole-period, so windowing before spectral analysis is mandatory.'),
      compute: (p) => {
        const cyc = p['cyc']
        const N = Math.round(p['Nb'])
        const re: number[] = []
        const xs: number[] = []
        for (let m = 0; m < N; m++) xs.push(Math.cos((2 * Math.PI * cyc * m) / N))
        for (let n = 0; n < N; n++) {
          let sr = 0
          let si = 0
          for (let m = 0; m < N; m++) {
            const ang = (2 * Math.PI * m * n) / N
            sr += xs[m] * Math.cos(ang)
            si -= xs[m] * Math.sin(ang)
          }
          re.push(Math.sqrt(sr * sr + si * si))
        }
        let peak = 0
        for (const v of re) if (v > peak) peak = v
        const scale = peak > 0 ? 1 / peak : 1
        const pts: Array<[number, number]> = []
        for (let n = 0; n < Math.min(N, 65); n++) pts.push([n, re[n] * scale])
        return [{ label: t('归一化振幅谱', 'normalised amplitude spectrum'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'dft-resolution',
      level: 'V1',
      title: t('两个靠近的频率：多长记录才分得开？', 'Two nearby frequencies: how long must the record be?'),
      xlabel: t('频率 (Hz)', 'frequency (Hz)'),
      ylabel: t('振幅谱（归一化）', 'amplitude spectrum (normalised)'),
      controls: [
        { id: 'L', label: t('记录长度 L', 'record length L'), min: 0.5, max: 20, step: 0.5, value: 4, unit: 's' },
        { id: 'df', label: t('两频率间隔 Δf', 'frequency separation Δf'), min: 0.05, max: 2, step: 0.05, value: 0.5, unit: 'Hz' },
      ],
      xRange: [1, 7],
      note: t('判据是 L·Δf ≳ 1：记录长度乘以频率间隔大于 1 时两个峰才分开。这是 Δf = 1/T_rec 的直接后果，也解释了为什么长周期面波的频散测量必须用很长的记录窗。',
        'The criterion is L·Δf ≳ 1: the two peaks separate once the record length times the frequency separation exceeds unity. A direct consequence of Δf = 1/T_rec, it also explains why dispersion measurement of long-period surface waves needs very long windows.'),
      compute: (p) => {
        const L = p['L']
        const df = p['df']
        const f0 = 4
        const f1 = f0 + df
        const N = 512
        const pts: Array<[number, number]> = []
        let peak = 0
        const vals: number[] = []
        for (let i = 0; i <= N; i++) {
          const f = 1 + (i / N) * 6
          const x0 = Math.PI * (f - f0) * L
          const x1 = Math.PI * (f - f1) * L
          const s0 = Math.abs(x0) < 1e-9 ? 1 : Math.abs(Math.sin(x0) / x0)
          const s1 = Math.abs(x1) < 1e-9 ? 1 : Math.abs(Math.sin(x1) / x1)
          const v = s0 + s1
          vals.push(v)
          if (v > peak) peak = v
        }
        const scale = peak > 0 ? 1 / peak : 1
        for (let i = 0; i <= N; i++) {
          const f = 1 + (i / N) * 6
          pts.push([f, vals[i] * scale])
        }
        return [{ label: t('两个加窗正弦的谱', 'spectrum of two windowed sinusoids'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('谱比法测 Q 时的频率刻度', 'Frequency scale in the spectral-ratio Q method'),
    input: t('Δt = 0.01 s，取 N = 1024 点', 'Δt = 0.01 s with N = 1024 samples'),
    steps: [
      t('T_rec = NΔt = 10.24 s', 'T_rec = NΔt = 10.24 s'),
      t('Δf = 1/T_rec = 0.0977 Hz', 'Δf = 1/T_rec = 0.0977 Hz'),
      t('f_Nyq = 1/(2Δt) = 50 Hz，对应分箱 n = N/2 = 512', 'f_Nyq = 1/(2Δt) = 50 Hz, corresponding to bin n = N/2 = 512'),
    ],
    output: t('可用频段 0.098 – 50 Hz，共 512 个独立分箱；低于 0.1 Hz 的成分在这条记录上根本无法分辨', 'The usable band is 0.098 – 50 Hz in 512 independent bins; anything below 0.1 Hz simply cannot be resolved on this record'),
  },
  links: {
    upstream: [
      { id: 'fourier-transform-pair', note: t('DFT 是它的离散化', 'the DFT is its discretisation') },
      { id: 'sampling-spectral-periodicity', note: t('离散化使频谱周期化', 'discretisation makes the spectrum periodic') },
    ],
    downstream: [
      { id: 'convolution-theorem', note: t('离散褶积定理是快速滤波的基础', 'the discrete convolution theorem underlies fast filtering') },
      { id: 'parseval-theorem', note: t('离散 Parseval 用于能量统计', 'the discrete Parseval relation is used for energy bookkeeping') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.4' },
    { text: 'Oppenheim & Schafer, Discrete-Time Signal Processing, 3rd ed., §2.6' },
  ],
}

export default discreteFourierTransform
