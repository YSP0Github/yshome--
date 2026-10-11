import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** aliasing-frequency-folding */
const aliasingFrequencyFolding: FormulaCard = {
  id: 'aliasing-frequency-folding',
  name: t('假频与频率折叠', 'Aliasing & Frequency Folding'),
  aliases: { zh: ['假频', '频率混叠', '折叠频率'], en: ['aliasing', 'frequency folding', 'folded frequency'] },
  node: 'S9.1',
  tags: {
    math: ['MATH.FOURIER', 'MATH.ALGEBRA'],
    method: ['METH.PROC', 'METH.INSTR'],
    quantity: ['Q.FREQ'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`f_{\text{alias}} = \big|f - 2f_N\,\mathrm{round}\!\left(\frac{f}{2f_N}\right)\big|,\qquad f_N = \frac{1}{2\Delta t}`,
    variants: [
      { name: t('采样使频谱周期化', 'Sampling makes the spectrum periodic'), latex: String.raw`X_s(f) = \frac{1}{\Delta t}\sum_{k=-\infty}^{\infty} X\!\left(f - \frac{k}{\Delta t}\right)` },
      { name: t('Nyquist 条件', 'The Nyquist condition'), latex: String.raw`f_{\max} < f_N = \frac{1}{2\Delta t}\ \Rightarrow\ \text{无假频}` },
      { name: t('折叠的几何图像', 'Geometrical picture of folding'), latex: String.raw`f > f_N \Longrightarrow f_{\text{表观}} = 2f_N - f` },
      { name: t('采样率与 Nyquist 的对应', 'Sampling rate versus Nyquist'), latex: String.raw`\Delta t = 0.01\ \text{s} \Rightarrow f_N = 50\ \text{Hz};\quad \Delta t = 1\ \text{s} \Rightarrow f_N = 0.5\ \text{Hz}` },
    ],
  },
  meaning: t(
    '以间隔 Δt 采样之后，频率高于 1/(2Δt) 的成分并不会消失，而是被「折」回低频，伪装成一个慢得多的振动。所以在 1 sps 的采样下，一个 0.8 Hz 的信号看起来和一个 0.2 Hz 的信号完全一样。假频无法在采样后补救 —— 唯一的办法是在采样前用模拟低通滤波器把高频切掉，这就是每台数字地震仪都必须有抗混叠滤波器的原因。',
    'After sampling with interval Δt, components above 1/(2Δt) do not disappear; they are folded back to low frequency, masquerading as a much slower oscillation. With 1 sps sampling, a 0.8 Hz signal looks exactly like a 0.2 Hz one. Aliasing cannot be repaired after sampling — the only remedy is to cut high frequencies with an analogue low-pass filter before sampling, which is why every digital seismograph must have an anti-alias filter.',
  ),
  symbols: [
    { sym: 'f_N', name: t('Nyquist 频率', 'Nyquist frequency'), unit: 'Hz' },
    { sym: '\\Delta t', name: t('采样间隔', 'sampling interval'), unit: 's' },
    { sym: 'f_{\\text{alias}}', name: t('折回后观测到的表观频率', 'apparent frequency observed after folding'), unit: 'Hz' },
    { sym: 'X_s(f)', name: t('采样后序列的频谱', 'spectrum of the sampled sequence'), unit: '—' },
  ],
  conditions: {
    applies: [t('采样率选择、重采样、数字滤波器设计', 'Choosing sampling rates, resampling, digital filter design')],
    assumes: [t('等间隔采样', 'Uniform sampling')],
    breaks: [t('非等间隔采样时 Nyquist 概念不直接适用', 'The Nyquist concept does not apply directly to non-uniform sampling')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('采样 = 连续信号乘以冲激串', 'Sampling is multiplying the continuous signal by an impulse train'), latex: String.raw`x_s(t) = x(t)\sum_n \delta(t - n\Delta t)` },
    { n: 2, op: 'transform', title: t('冲激串的 Fourier 变换还是冲激串', 'The Fourier transform of an impulse train is another impulse train'), latex: String.raw`\sum_n\delta(t-n\Delta t) \;\longleftrightarrow\; \frac{1}{\Delta t}\sum_k \delta\!\left(f - \frac{k}{\Delta t}\right)` },
    { n: 3, op: 'identity', title: t('时域相乘 = 频域卷积，故频谱被复制并搬移', 'Time-domain multiplication becomes frequency-domain convolution, so the spectrum is replicated and shifted'), latex: String.raw`X_s(f) = \frac{1}{\Delta t}\sum_k X\!\left(f-\frac{k}{\Delta t}\right)` },
    { n: 4, op: 'algebra', title: t('当 f_max > 1/(2Δt) 时相邻副本重叠', 'When f_max > 1/(2Δt) adjacent replicas overlap'), latex: String.raw`\frac{1}{\Delta t} - f_{\max} < f_{\max} \Longleftrightarrow f_{\max} > \frac{1}{2\Delta t}` },
    { n: 5, op: 'result', title: t('重叠部分折回：f_alias = |f − 2f_N·round(f/2f_N)|', 'The overlapping part folds back: f_alias = |f − 2f_N·round(f/2f_N)|'), latex: String.raw`f_{\text{alias}} = \left|f - 2f_N\,\mathrm{round}\!\left(\frac{f}{2f_N}\right)\right|` },
  ],
  viz: [
    {
      id: 'fold-map',
      level: 'V1',
      title: t('真实频率到表观频率的折叠映射', 'Folding map from true frequency to apparent frequency'),
      xlabel: t('真实频率 f (Hz)', 'true frequency f (Hz)'),
      ylabel: t('表观频率 (Hz)', 'apparent frequency (Hz)'),
      controls: [{ id: 'fn', label: t('Nyquist 频率 f_N (Hz)', 'Nyquist frequency f_N (Hz)'), min: 0.5, max: 50, step: 0.5, value: 5 }],
      note: t('这是条锯齿形的「折叠曲线」：0 到 f_N 之间是恒等直线，然后反复折返。任何一个高于 f_N 的频率都落在锯齿的某一支上，被读成一个小于 f_N 的频率 —— 信息就此永久丢失。', 'A sawtooth "folding curve": the identity line from 0 to f_N, then repeated fold-backs. Any frequency above f_N lands on some branch of the sawtooth and is read as a frequency below f_N — the information is lost permanently.'),
      compute: (p) => {
        const fn = p['fn']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const f = (i / 600) * 4 * fn
          const fa = Math.abs(f - 2 * fn * Math.round(f / (2 * fn)))
          pts.push([f, fa])
        }
        return [{ label: t('表观频率', 'apparent frequency'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'alias-demo',
      level: 'V2',
      title: t('同一个采样点序列的两种解释', 'Two interpretations of the same sample sequence'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('振幅', 'amplitude'),
      controls: [
        { id: 'f', label: t('真实频率 f (Hz)', 'true frequency f (Hz)'), min: 0.1, max: 9.9, step: 0.05, value: 8 },
        { id: 'dt', label: t('采样间隔 Δt (s)', 'sampling interval Δt (s)'), min: 0.05, max: 1, step: 0.01, value: 0.1 },
      ],
      note: t('黑点是以 Δt 采到的样点。高频信号（细线）与它的低频别名（粗线）在所有采样点上完全重合 —— 一旦只留下黑点，就无法区分两者。', 'Black dots are the samples taken at Δt. The high-frequency signal (thin line) and its low-frequency alias (thick line) coincide at every sample point — once only the dots remain, the two are indistinguishable.'),
      compute: (p) => {
        const f = p['f'], dt = p['dt']
        const fn = 1 / (2 * dt)
        const fa = Math.abs(f - 2 * fn * Math.round(f / (2 * fn)))
        const hi: Array<[number, number]> = []
        const lo: Array<[number, number]> = []
        const dots: Array<[number, number]> = []
        for (let i = 0; i <= 800; i++) {
          const tt = (i / 800) * 5
          hi.push([tt, Math.cos(2 * Math.PI * f * tt)])
          lo.push([tt, Math.cos(2 * Math.PI * fa * tt)])
        }
        for (let n = 0; n * dt <= 5; n++) {
          const tt = n * dt
          dots.push([tt, Math.cos(2 * Math.PI * f * tt)])
        }
        return [
          { label: t('别名（观测到的）', 'alias (what is observed)'), color: '#185FA5', points: lo },
          { label: t('真实高频信号', 'true high-frequency signal'), color: '#993C1D', points: hi },
          { label: t('采样点', 'samples'), color: '#2E2A25', points: dots },
        ]
      },
    },
  ],
  example: {
    title: t('1 sps 采样下的假频', 'Aliasing at 1 sps'),
    input: t('Δt = 1 s ⇒ f_N = 0.5 Hz；真实信号 0.8 Hz', 'Δt = 1 s gives f_N = 0.5 Hz; true signal 0.8 Hz'),
    steps: [
      t('round(0.8 / 1.0) = 1', 'round(0.8 / 1.0) = 1'),
      t('f_alias = |0.8 − 2×0.5×1| = 0.2 Hz', 'f_alias = |0.8 − 2×0.5×1| = 0.2 Hz'),
    ],
    output: t('0.8 Hz 的信号被读成 0.2 Hz，周期从 1.25 s 变成 5 s', 'A 0.8 Hz signal is read as 0.2 Hz; the period changes from 1.25 s to 5 s'),
  },
  links: {
    upstream: [{ id: 'nyquist-sampling', note: t('Nyquist 定理给出临界频率', 'The Nyquist theorem gives the critical frequency') }],
    downstream: [{ id: 'discrete-fourier-transform', note: t('DFT 只能看到 0 到 f_N 的频段', 'The DFT only sees the band from 0 to f_N') }],
    seealso: [
      { id: 'sampling-spectral-periodicity', note: t('频谱周期化是折叠的根源', 'Spectral periodicity is the root of folding') },
      { id: 'counts-to-ground-motion', note: t('数字记录的第一步就是采样', 'Sampling is the first step of digital recording') },
    ],
  },
  refs: [{ text: 'Oppenheim & Schafer, Discrete-Time Signal Processing, 3rd ed., §4.2' }],
}

export default aliasingFrequencyFolding
