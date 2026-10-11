import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** matched-filter-detection */
const matchedFilterDetection: FormulaCard = {
  id: 'matched-filter-detection',
  name: t('匹配滤波与模板检测', 'Matched Filtering & Template Detection'),
  aliases: { zh: ['匹配滤波', '模板匹配', '互相关检测'], en: ['matched filter', 'template matching', 'correlation detection'] },
  node: 'S9.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.PROC', 'METH.TELE'],
    quantity: ['Q.AMP', 'Q.TIME'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\mathrm{CC}(t) = \frac{\sum_k d(k)\,s(k-t)}{\sqrt{\sum_k d^{2}(k)\sum_k s^{2}(k-t)}}\in [-1, 1]`,
    variants: [
      { name: t('频率域的匹配滤波器（白化后）', 'Frequency-domain matched filter (after whitening)'), latex: String.raw`H(\omega) = \frac{S^{*}(\omega)}{|N(\omega)|^{2}}` },
      { name: t('未白化的 Wiener 形式', 'The unwhitened Wiener form'), latex: String.raw`H(\omega) = \frac{S^{*}(\omega)}{|S(\omega)|^{2} + |N(\omega)|^{2}}` },
      { name: t('输出信噪比', 'Output signal-to-noise ratio'), latex: String.raw`\mathrm{SNR}_{\text{out}} = \frac{|\langle d, s\rangle|}{\sigma_n\|s\|}` },
      { name: t('检测阈值与虚警率', 'Detection threshold and false-alarm rate'), latex: String.raw`\mathrm{CC} > \mu + n\sigma \Longrightarrow \text{判定为一次检测}` },
    ],
  },
  meaning: t(
    '如果你已经知道要看什么（一个模板波形），那么找出它在连续记录里出现位置的最优方法就是把记录与模板做归一化互相关。归一化让结果落在 −1 到 1 之间，因此可以用一个统一的阈值判断「这是不是一个重复事件」，而不必关心绝对振幅。这是低频地震、非火山震颤、重复地震与余震完备性提升的核心工具。',
    'If you already know what to look for (a template waveform), the optimal way to find where it occurs in a continuous record is to compute the normalised cross-correlation between record and template. Normalisation puts the result between −1 and 1, so a single threshold decides whether this is a repeat event, independent of absolute amplitude. This is the core tool for low-frequency earthquakes, non-volcanic tremor, repeating earthquakes and improving aftershock completeness.',
  ),
  symbols: [
    { sym: 'd(k)', name: t('连续记录', 'continuous record'), unit: '—' },
    { sym: 's(k)', name: t('模板波形', 'template waveform'), unit: '—' },
    { sym: '\\mathrm{CC}', name: t('归一化互相关系数', 'normalised cross-correlation coefficient'), unit: '无量纲' },
    { sym: 'N(\\omega)', name: t('噪声谱', 'noise spectrum'), unit: '—' },
    { sym: '\\sigma_n', name: t('噪声标准差', 'noise standard deviation'), unit: '—' },
  ],
  conditions: {
    applies: [t('重复地震检测、震颤与低频事件编目、模板匹配定位', 'Repeating-earthquake detection, tremor and LFE catalogues, template-matching relocation')],
    assumes: [t('模板与目标事件波形相似（同源同机制）', 'Template and target waveforms are similar (same source and mechanism)')],
    breaks: [t('机制或位置差异较大时相关系数显著下降', 'Correlation drops markedly when mechanisms or locations differ'), t('多台同时检测需要震相到时一致性检验', 'Multi-station detection requires phase-arrival consistency checks')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把观测写成信号加噪声', 'Write the observation as signal plus noise'), latex: String.raw`d(t) = a\,s(t-t_0) + n(t)` },
    { n: 2, op: 'physics', title: t('最大化输出 SNR 的线性滤波器', 'The linear filter that maximises output SNR'), latex: String.raw`\max_h \frac{|h^{\mathsf{T}}s|^{2}}{\sigma_n^{2}\|h\|^{2}}` },
    { n: 3, op: 'identity', title: t('由 Cauchy–Schwarz 不等式，最优解 h ∝ s', 'By the Cauchy–Schwarz inequality the optimum is h ∝ s'), latex: String.raw`h_{\text{opt}} \propto s \Longrightarrow \text{匹配滤波 = 与模板相关}` },
    { n: 4, op: 'substitute', title: t('考虑有色噪声时，在频域除以噪声谱', 'For coloured noise, divide by the noise spectrum in the frequency domain'), latex: String.raw`H(\omega) = \frac{S^{*}(\omega)}{|N(\omega)|^{2}}` },
    { n: 5, op: 'result', title: t('归一化互相关给出可直接比较的检测统计量', 'Normalised cross-correlation gives a directly comparable detection statistic'), latex: String.raw`\mathrm{CC}(t) = \frac{\sum_k d(k)s(k-t)}{\sqrt{\sum_k d^{2}\sum_k s^{2}}}` },
  ],
  viz: [
    {
      id: 'mf-scan',
      level: 'V3',
      title: t('模板在含噪记录中的互相关扫描', 'Cross-correlation scan of a template through a noisy record'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('振幅 / CC', 'amplitude / CC'),
      controls: [
        { id: 'amp', label: t('事件相对振幅 a', 'relative event amplitude a'), min: 0, max: 1.5, step: 0.02, value: 0.45 },
        { id: 'noise', label: t('噪声水平 σ', 'noise level σ'), min: 0, max: 1, step: 0.02, value: 0.35 },
        { id: 't0', label: t('事件到时 (s)', 'event arrival time (s)'), min: 5, max: 55, step: 0.5, value: 30 },
        { id: 'fo', label: t('模板主频 (Hz)', 'template dominant frequency (Hz)'), min: 0.5, max: 8, step: 0.1, value: 2.5 },
      ],
      note: t('灰色是含噪记录（几乎看不出事件），蓝色是 CC 扫描曲线。把振幅调小或噪声调大，峰值会掉到背景涨落之下 —— 检测能力的边界就在这里。CC 峰值的时间就是事件到时，可用于精定位。', 'Grey is the noisy record (the event is barely visible); blue is the CC scan curve. Lower the amplitude or raise the noise and the peak drops below the background fluctuation — that is the detection limit. The time of the CC peak is the event arrival time and can be used for precise relocation.'),
      compute: (p) => {
        const amp = p['amp'], nz = p['noise'], t0 = p['t0'], fo = p['fo']
        const N = 1200
        const dt = 0.05
        let seed = 12345
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return (seed / 0x7fffffff) * 2 - 1
        }
        const tmpl: number[] = []
        const M = 120
        for (let i = 0; i < M; i++) {
          const tt = i * dt - 1.5
          tmpl.push(Math.exp(-((tt * tt) / 0.35)) * Math.sin(2 * Math.PI * fo * tt))
        }
        const d = new Array(N).fill(0)
        for (let i = 0; i < N; i++) {
          d[i] = nz * 0.25 * (rnd() + rnd() + rnd())
          const tt = i * dt - t0 - 1.5
          if (tt > -3 && tt < 3) d[i] += amp * Math.exp(-((tt * tt) / 0.35)) * Math.sin(2 * Math.PI * fo * tt)
        }
        const rec: Array<[number, number]> = []
        for (let i = 0; i < N; i++) rec.push([i * dt, d[i]])
        const cc: Array<[number, number]> = []
        for (let s = 0; s + M < N; s++) {
          let num = 0, sd = 0, ss = 0
          for (let i = 0; i < M; i++) {
            num += d[s + i] * tmpl[i]
            sd += d[s + i] * d[s + i]
            ss += tmpl[i] * tmpl[i]
          }
          const den = Math.sqrt(sd * ss)
          cc.push([(s + M / 2) * dt, den > 1e-12 ? num / den : 0])
        }
        return [
          { label: t('含噪记录', 'noisy record'), color: '#888780', points: rec },
          { label: t('CC 扫描', 'CC scan'), color: '#185FA5', points: cc },
        ]
      },
    },
  ],
  example: {
    title: t('判定是否为重复事件', 'Deciding whether an event is a repeater'),
    input: t('CC 峰值 = 0.82，背景 CC 的均值 0.05、标准差 0.12', 'CC peak = 0.82, background CC mean 0.05, standard deviation 0.12'),
    steps: [
      t('阈值取 μ + 8σ = 0.05 + 0.96 = 1.01 → 未触发', 'Threshold μ + 8σ = 0.05 + 0.96 = 1.01 → not triggered'),
      t('阈值取 μ + 6σ = 0.77 → 触发', 'Threshold μ + 6σ = 0.77 → triggered'),
    ],
    output: t('阈值的选择直接决定编目的完备性与虚警率，必须按台网噪声水平标定', 'The threshold choice directly sets catalogue completeness and false-alarm rate and must be calibrated to network noise'),
  },
  links: {
    upstream: [
      { id: 'cross-correlation', note: t('相关是匹配滤波的时间域形式', 'Correlation is the time-domain form of matched filtering') },
      { id: 'wiener-filter', note: t('Wiener 滤波是有噪声时的推广', 'The Wiener filter is the generalisation with noise') },
    ],
    downstream: [{ id: 'ambient-noise-green-function', note: t('背景噪声成像用同样的相关运算', 'Ambient-noise imaging uses the same correlation operation') }],
    seealso: [{ id: 'chi-square-goodness', note: t('用于检验检测统计量的分布假设', 'Used to test the distributional assumption of the detection statistic') }],
  },
  refs: [{ text: 'Gibbons & Ringdal (2006), The detection of low magnitude seismic events using array-based waveform correlation, GPL 33, L14316' }],
}

export default matchedFilterDetection
