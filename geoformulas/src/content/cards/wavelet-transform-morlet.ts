import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wavelet-transform-morlet */
const waveletTransformMorlet: FormulaCard = {
  id: 'wavelet-transform-morlet',
  name: t('Morlet 小波变换', 'The Morlet Wavelet Transform'),
  aliases: { zh: ['小波变换', 'Morlet 小波', '时频分析'], en: ['wavelet transform', 'Morlet wavelet', 'time–frequency analysis'] },
  node: 'S9.4',
  tags: {
    math: ['MATH.FOURIER', 'MATH.TRANSFORM'],
    method: ['METH.PROC'],
    quantity: ['Q.FREQ', 'Q.TIME'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`W(a,b) = \frac{1}{\sqrt{a}}\int_{-\infty}^{\infty} x(t)\,\psi^{*}\!\left(\frac{t-b}{a}\right)\mathrm{d}t,\qquad
\psi(\eta) = \pi^{-1/4}e^{i\omega_0\eta}e^{-\eta^{2}/2}`,
    variants: [
      { name: t('Morlet 小波的容许性条件', 'Admissibility condition for the Morlet wavelet'), latex: String.raw`\omega_0 \ge 5\ \text{时}\ \int\psi\,\mathrm{d}t\approx 0\ \text{（近似容许）}` },
      { name: t('尺度与频率的对应', 'Correspondence between scale and frequency'), latex: String.raw`f = \frac{f_c}{a\,\Delta t},\qquad f_c = \frac{\omega_0+\sqrt{2+\omega_0^{2}}}{4\pi}` },
      { name: t('时频分辨率的权衡', 'Time–frequency resolution trade-off'), latex: String.raw`\Delta t\cdot\Delta f \ge \frac{1}{4\pi};\quad \text{小波：高频时间好、低频频率好}` },
      { name: t('离散实现（频率域乘积）', 'Discrete implementation (frequency-domain product)'), latex: String.raw`W(b, a) = \sum_k \hat{x}(\omega_k)\,\hat{\psi}^{*}(a\omega_k)\,e^{i\omega_k b}` },
    ],
  },
  meaning: t(
    '短时 Fourier 变换用固定宽度的窗，因此所有频率上的时间—频率分辨率都一样。小波变换改用可伸缩的窗：分析高频时用窄窗（时间分辨率好、频率分辨率差），分析低频时用宽窗（反之）。这个自适应的权衡正好符合地震记录的特性 —— 高频面波到达时间要准，低频自由振荡的频率要准。',
    'The short-time Fourier transform uses a fixed-width window, so time–frequency resolution is the same at all frequencies. The wavelet transform uses a scalable window instead: a narrow window for high frequencies (good time resolution, poor frequency resolution) and a wide one for low frequencies (vice versa). This adaptive trade-off matches the nature of seismic records — high-frequency arrivals need accurate timing, low-frequency free oscillations need accurate frequency.',
  ),
  symbols: [
    { sym: 'a', name: t('尺度（伸缩）参数', 'scale (dilation) parameter'), unit: '—' },
    { sym: 'b', name: t('平移参数（时间位置）', 'translation parameter (time position)'), unit: 's' },
    { sym: '\\psi', name: t('母小波', 'mother wavelet'), unit: '—' },
    { sym: '\\omega_0', name: t('Morlet 波数（常取 6）', 'Morlet wavenumber (usually 6)'), unit: 'rad' },
    { sym: 'f_c', name: t('小波的中心频率', 'centre frequency of the wavelet'), unit: 'Hz' },
  ],
  conditions: {
    applies: [t('时频分析、面波频散测量、非平稳信号去噪与检测', 'Time–frequency analysis, surface-wave dispersion measurement, denoising and detecting non-stationary signals')],
    assumes: [t('信号局部平稳', 'The signal is locally stationary')],
    breaks: [t('边缘效应：记录两端的结果不可信（影响锥）', 'Edge effects: results at the two ends are unreliable (cone of influence)'), t('尺度离散过稀会漏掉频率细节', 'Too-coarse scale discretisation misses frequency detail')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把母小波伸缩平移得到一族基函数', 'Dilate and translate the mother wavelet to obtain a basis family'), latex: String.raw`\psi_{a,b}(t) = \frac{1}{\sqrt{a}}\psi\!\left(\frac{t-b}{a}\right)` },
    { n: 2, op: 'identity', title: t('与信号内积即小波系数', 'The inner product with the signal is the wavelet coefficient'), latex: String.raw`W(a,b) = \langle x,\psi_{a,b}\rangle` },
    { n: 3, op: 'substitute', title: t('Morlet 小波 = 高斯窗 × 复正弦', 'The Morlet wavelet is a Gaussian window times a complex sinusoid'), latex: String.raw`\psi(\eta)=\pi^{-1/4}e^{i\omega_0\eta}e^{-\eta^{2}/2}` },
    { n: 4, op: 'transform', title: t('由卷积定理可在频域高效计算', 'By the convolution theorem it can be computed efficiently in the frequency domain'), latex: String.raw`W(b,a) = \mathcal{F}^{-1}\{\hat{x}\,\hat{\psi}^{*}(a\omega)\}` },
    { n: 5, op: 'result', title: t('频率与尺度的换算', 'Conversion between frequency and scale'), latex: String.raw`f = \frac{f_c}{a\Delta t}` },
  ],
  viz: [
    {
      id: 'morlet-scalogram',
      level: 'V3',
      title: t('一个啁啾信号的小波时频谱', 'Wavelet time–frequency spectrum of a chirp signal'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('频率 (Hz)', 'frequency (Hz)'),
      controls: [
        { id: 'w0', label: t('Morlet 波数 ω₀', 'Morlet wavenumber ω₀'), min: 3, max: 12, step: 0.5, value: 6 },
        { id: 'f1', label: t('起始频率 (Hz)', 'start frequency (Hz)'), min: 0.5, max: 8, step: 0.1, value: 1 },
        { id: 'f2', label: t('结束频率 (Hz)', 'end frequency (Hz)'), min: 0.5, max: 20, step: 0.1, value: 12 },
      ],
      note: t('频率随时间升高的啁啾信号在时频图上是一条上升的脊线。ω₀ 越大，频率分辨率越好但时间分辨率越差（脊线变粗、变模糊）；ω₀ 越小则相反。这就是时频不确定关系的直接体现。', 'A chirp whose frequency rises with time appears as an ascending ridge in the time–frequency plane. Larger ω₀ gives better frequency resolution but worse time resolution (the ridge thickens and blurs); smaller ω₀ does the opposite. This is the direct manifestation of the time–frequency uncertainty relation.'),
      compute: (p) => {
        const w0 = p['w0'], f1 = p['f1'], f2 = p['f2']
        // 用 |W| 的等值线（脊线）来表示时频图
        const ridge: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const t = (i / 200) * 10
          ridge.push([t, f1 + (f2 - f1) * (t / 10)])
        }
        // 分辨率盒子的宽度：Δf ∝ f / ω₀
        const up: Array<[number, number]> = []
        const dn: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const t = (i / 200) * 10
          const f = f1 + (f2 - f1) * (t / 10)
          const df = (f * 2 * Math.PI) / w0
          up.push([t, Math.min(f + df, 25)])
          dn.push([t, Math.max(f - df, 0)])
        }
        return [
          { label: t('时频谱脊线', 'time–frequency ridge'), color: '#185FA5', points: ridge },
          { label: t('分辨率上界', 'resolution upper bound'), color: '#993C1D', points: up },
          { label: t('分辨率下界', 'resolution lower bound'), color: '#0F6E56', points: dn },
        ]
      },
    },
    {
      id: 'morlet-kernel',
      level: 'V2',
      title: t('Morlet 母小波的形状', 'Shape of the Morlet mother wavelet'),
      xlabel: t('η', 'η'),
      ylabel: t('实部 / 虚部', 'real / imaginary part'),
      controls: [{ id: 'w0', label: t('Morlet 波数 ω₀', 'Morlet wavenumber ω₀'), min: 2, max: 14, step: 0.5, value: 6 }],
      note: t('实部是一个振荡被高斯包络压住的函数（这就是「小波」的字面意思）。ω₀ 控制振荡的圈数：ω₀ 大则圈数多、频率选择性好但时间定位差。', 'The real part is an oscillation damped by a Gaussian envelope (literally a "small wave"). ω₀ controls the number of oscillations: larger ω₀ means more cycles, better frequency selectivity but worse time localisation.'),
      compute: (p) => {
        const w0 = p['w0']
        const re: Array<[number, number]> = []
        const im: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const e = -6 + (i / 400) * 12
          const g = Math.exp(-(e * e) / 2) * Math.pow(Math.PI, -0.25)
          re.push([e, g * Math.cos(w0 * e)])
          im.push([e, g * Math.sin(w0 * e)])
        }
        return [
          { label: t('实部', 'real part'), color: '#185FA5', points: re },
          { label: t('虚部', 'imaginary part'), color: '#993C1D', points: im },
        ]
      },
    },
  ],
  example: {
    title: t('尺度换算成频率', 'Converting scale to frequency'),
    input: t('ω₀ = 6，Δt = 0.02 s，尺度 a = 20', 'ω₀ = 6, Δt = 0.02 s, scale a = 20'),
    steps: [
      t('f_c = (6 + √(2 + 36))/(4π) = 12.17/12.57 = 0.968 Hz', 'f_c = (6 + √(2 + 36))/(4π) = 12.17/12.57 = 0.968 Hz'),
      t('f = 0.968/(20 × 0.02) = 2.42 Hz', 'f = 0.968/(20 × 0.02) = 2.42 Hz'),
    ],
    output: t('尺度 20 对应约 2.4 Hz', 'Scale 20 corresponds to about 2.4 Hz'),
  },
  links: {
    upstream: [
      { id: 'short-time-fourier', note: t('STFT 是固定窗的对照', 'STFT is the fixed-window counterpart') },
      { id: 'fourier-transform-pair', note: t('小波变换在频域实现', 'The wavelet transform is implemented in the frequency domain') },
    ],
    seealso: [
      { id: 'analytic-signal-envelope', note: t('复小波模给出包络', 'The complex wavelet modulus gives the envelope') },
      { id: 'window-function-leakage', note: t('高斯窗的泄漏控制', 'Leakage control of the Gaussian window') },
    ],
  },
  refs: [{ text: 'Torrence & Compo (1998), A practical guide to wavelet analysis, BAMS 79, 61–78' }],
}

export default waveletTransformMorlet
