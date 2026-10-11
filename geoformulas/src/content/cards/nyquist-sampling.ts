import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** nyquist-sampling */
const nyquistSampling: FormulaCard = {
  id: 'nyquist-sampling',
  name: t('Nyquist 采样定理与假频', 'The Nyquist Sampling Theorem and Aliasing'),
  aliases: { zh: ['采样定理', '假频', '折叠频率'], en: ['Nyquist', 'sampling theorem', 'aliasing', 'folding'] },
  node: 'S9.1',
  tags: {
    math: ['MATH.FOURIER'],
    method: ['METH.PROC', 'METH.INSTR'],
    quantity: ['Q.FREQ', 'Q.TIME'],
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`f_{\mathrm{s}}>2f_{\max}\qquad\text{等价于}\qquad f_{\max}<\frac{f_{\mathrm{s}}}{2}=f_{\mathrm{Nyq}}`,
    variants: [
      { name: t('假频（折叠）公式', 'Alias (folded) frequency'), latex: String.raw`f_{\text{alias}}=\left|\,f-N f_{\mathrm{s}}\,\right|,\qquad N=\operatorname{round}\!\left(\frac{f}{f_{\mathrm{s}}}\right)` },
      { name: t('更直观的写法', 'A more intuitive form'), latex: String.raw`f_{\text{alias}}=f_{\mathrm{s}}-\left|f \bmod f_{\mathrm{s}}\right|\ \text{当结果超过 } f_{\mathrm{s}}/2\text{ 时折叠回来}` },
    ],
  },
  meaning: t(
    '如果每秒记的样点不够多，一个高频信号会被「记成」一个完全不同的低频信号，并且再也无法挽回 —— 这就是假频。它不是噪声，不是失真，是彻底的错误信息。台站建设的第一条铁律由此而来。',
    'With too few samples per second a high-frequency signal is recorded as a completely different, lower-frequency one — irreversibly. That is aliasing. It is not noise and not distortion; it is outright wrong information. Hence the first rule of station design.',
  ),
  symbols: [
    { sym: 'f_{\\mathrm{s}}', name: t('采样率', 'sampling rate'), unit: 'Hz', typical: '短周期 50–100 Hz；强震 200 Hz' },
    { sym: 'f_{\\mathrm{Nyq}}', name: t('Nyquist 频率（= f_s/2）', 'Nyquist frequency (= f_s/2)'), unit: 'Hz' },
    { sym: 'f_{\\max}', name: t('信号中的最高频率', 'highest frequency present'), unit: 'Hz' },
    { sym: 'f_{\\text{alias}}', name: t('出现的假频', 'resulting alias frequency'), unit: 'Hz' },
    { sym: 'N', name: t('最接近 f/f_s 的整数', 'nearest integer to f/f_s'), unit: '', dimension: '无量纲' },
  ],
  conditions: {
    applies: [t('等间隔采样', 'Uniform sampling')],
    assumes: [t('采样前必须是理想带限信号', 'The signal must be band-limited before sampling')],
    breaks: [
      t('未经抗混叠滤波就采样，高频会被永久性地折进地震图', 'Sampling without an anti-alias filter permanently folds high frequencies into the seismogram'),
      t('非均匀采样（如某些节点仪器）需要专门重建算法', 'Non-uniform sampling needs dedicated reconstruction algorithms'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('采样 = 连续信号乘一串 δ 脉冲', 'Sampling multiplies the signal by a train of delta functions'),
      latex: String.raw`x_{\mathrm{s}}(t)=x(t)\cdot\sum_{n=-\infty}^{\infty}\delta(t-n\Delta t),\qquad \Delta t=\frac{1}{f_{\mathrm{s}}}` },
    { n: 2, op: 'identity', title: t('脉冲串的 Fourier 变换仍是脉冲串', 'The transform of a pulse train is a pulse train'),
      latex: String.raw`\mathcal{F}\!\left[\sum_n\delta(t-n\Delta t)\right]=\frac{1}{\Delta t}\sum_{k=-\infty}^{\infty}\delta\!\left(f-\frac{k}{\Delta t}\right)` },
    { n: 3, op: 'identity', title: t('时域相乘 = 频域卷积', 'Multiplication in time is convolution in frequency'),
      latex: String.raw`X_{\mathrm{s}}(f)=f_{\mathrm{s}}\sum_{k=-\infty}^{\infty}X\!\left(f-k f_{\mathrm{s}}\right)`,
      note: t('频谱被复制成无限多份，彼此间隔 f_s。', 'The spectrum is replicated infinitely many times, spaced f_s apart.') },
    { n: 4, op: 'algebra', title: t('若 X(f) 的支撑超出 ±f_s/2，相邻副本就会重叠', 'If X(f) extends beyond ±f_s/2 neighbouring copies overlap'),
      latex: String.raw`X(f)\neq 0\ \text{当}\ |f|>\frac{f_{\mathrm{s}}}{2}\;\Rightarrow\; \text{各副本混叠，无法解开}` },
    { n: 5, op: 'result', title: t('得到 Nyquist 条件', 'The Nyquist condition'),
      latex: String.raw`f_{\max}<\frac{f_{\mathrm{s}}}{2}` },
    { n: 6, op: 'result', title: t('假频出现在哪里', 'Where the alias lands'),
      latex: String.raw`f_{\text{alias}}=\left|f-N f_{\mathrm{s}}\right|`,
      note: t('举例：f_s = 50 Hz，真实 f = 62 Hz ⟹ f_alias = |62 − 50| = 12 Hz，地震图上会凭空出现一个 12 Hz 的振动。', 'Example: f_s = 50 Hz with a true 62 Hz signal gives f_alias = |62 − 50| = 12 Hz, conjuring a 12 Hz oscillation out of thin air.') },
  ],
  viz: [
    {
      id: 'alias-demo',
      level: 'V1',
      title: t('同一个样子可以有无限多种解释', 'One sample train admits infinitely many interpretations'),
      xlabel: t('时间 t (s)', 'time t (s)'),
      ylabel: t('振幅', 'amplitude'),
      controls: [
        { id: 'fs', label: t('采样率 f_s', 'sampling rate f_s'), min: 1, max: 20, step: 0.5, value: 5, unit: 'Hz' },
        { id: 'fsig', label: t('真实信号频率 f', 'true signal frequency f'), min: 0.2, max: 20, step: 0.1, value: 7, unit: 'Hz' },
      ],
      xRange: [0, 2],
      note: t('把 f 调到超过 f_s/2：采样点（圆点）会完美地落在一个更慢的正弦上，而这个假信号才是你从记录里能读出来的东西。', 'Push f past f_s/2: the samples land perfectly on a slower sinusoid, and that fake signal is all you can recover from the record.'),
      compute: (p) => {
        const fs = p['fs'], f = p['fsig']
        const truePts: Array<[number, number]> = []
        const aliasPts: Array<[number, number]> = []
        const samples: Array<[number, number]> = []
        const N = Math.round(f / fs)
        const fa = Math.abs(f - N * fs)
        for (let i = 0; i <= 1200; i++) {
          const t = (i / 1200) * 2
          truePts.push([t, Math.sin(2 * Math.PI * f * t)])
          // 注意：真正穿过采样点的是符号版本 sin(2π(f−Nf_s)t)，样本值序列与之逐点相等
          aliasPts.push([t, Math.sin(2 * Math.PI * (f - N * fs) * t)])
        }
        for (let n = 0; n * (1 / fs) <= 2; n++) {
          const t = n * (1 / fs)
          samples.push([t, Math.sin(2 * Math.PI * f * t)])
        }
        return [
          { label: t(`真实信号 f = ${f.toFixed(1)} Hz`, `true signal f = ${f.toFixed(1)} Hz`), color: '#185FA5', points: truePts },
          { label: t(`采样点`, `samples`), color: '#2C2C2A', points: samples },
          { label: t(`假频 f_alias = ${fa.toFixed(2)} Hz`, `alias f = ${fa.toFixed(2)} Hz`), color: '#E24B4A', dash: true, points: aliasPts },
        ]
      },
    },
    {
      id: 'alias-map',
      level: 'V1',
      title: t('频率折叠映射图', 'The frequency folding map'),
      xlabel: t('真实频率 f (Hz)', 'true frequency f (Hz)'),
      ylabel: t('观测到的频率 (Hz)', 'observed frequency (Hz)'),
      controls: [
        { id: 'fs2', label: t('采样率 f_s', 'sampling rate f_s'), min: 2, max: 20, step: 0.5, value: 10, unit: 'Hz' },
      ],
      xRange: [0, 25],
      note: t('典型的锯齿（折叠）曲线：Nyquist 频率是个镜子，超过它的部分被反射回来。台站必须在采样前用抗混叠低通把高于 f_s/2 的内容切掉。', 'The classic sawtooth: the Nyquist frequency acts as a mirror reflecting everything above it back. Stations must low-pass above f_s/2 before sampling.'),
      compute: (p) => {
        const fs = p['fs2']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 500; i++) {
          const f = (i / 500) * 25
          const N = Math.round(f / fs)
          pts.push([f, Math.abs(f - N * fs)])
        }
        return [{ label: t('观测频率', 'observed frequency'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('一次常见的踩坑', 'A common trap'),
    input: t('用 50 Hz 采样率记录 62 Hz 的振动', 'Sampling a 62 Hz signal at 50 Hz'),
    steps: [
      t('f_s/2 = 25 Hz < 62 Hz ⟹ 违反 Nyquist', 'f_s/2 = 25 Hz < 62 Hz, violating Nyquist'),
      t('N = round(62/50) = 1', 'N = round(62/50) = 1'),
      t('f_alias = |62 − 50| = 12 Hz', 'f_alias = |62 − 50| = 12 Hz'),
    ],
    output: t('地震图上出现一个根本不存在的 12 Hz 信号，且事后无法去除', 'A 12 Hz signal appears that does not exist, and it cannot be removed afterwards'),
  },
  links: {
    upstream: [{ id: 'harmonic-plane-wave' }],
  },
  refs: [
    { text: 'Oppenheim & Schafer, Discrete-Time Signal Processing' },
    { text: 'Havskov & Ottemöller, Routines for Earthquake Data Analysis' },
  ],

}

export default nyquistSampling
