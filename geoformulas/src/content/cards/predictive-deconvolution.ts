import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** predictive-deconvolution */
const predictiveDeconvolution: FormulaCard = {
  id: 'predictive-deconvolution',
  name: t('预测反褶积', 'Predictive Deconvolution'),
  aliases: { zh: ['预测反褶积', '多次波压制', '脉冲压缩'], en: ['predictive deconvolution', 'multiple suppression', 'pulse compression'] },
  node: 'S9.5',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.PROC', 'METH.EXPL'],
    quantity: ['Q.TIME', 'Q.AMP'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\hat{x}(t+\alpha) = \sum_{k} a_k\,x(t-k),\qquad
\mathbf{a} = \mathbf{R}^{-1}\mathbf{r},\qquad
R_{ij} = \sum_t x(t-i)x(t-j) + \lambda\delta_{ij}`,
    variants: [
      { name: t('预测误差（反褶积输出）', 'Prediction error (deconvolution output)'), latex: String.raw`e(t) = x(t+\alpha)-\hat{x}(t+\alpha)` },
      { name: t('α = 1（脉冲反褶积，Whitening）', 'α = 1 (spiking deconvolution, whitening)'), latex: String.raw`\alpha = 1 \Longrightarrow e(t) \approx \text{反射系数序列}` },
      { name: t('α 很大时只预测周期性多次波', 'Large α predicts only periodic multiples'), latex: String.raw`\alpha \gg \text{子波长度} \Longrightarrow e(t) = \text{去掉周期性成分的记录}` },
      { name: t('白噪增益 λ', 'White-noise gain λ'), latex: String.raw`R_{ii} \to R_{ii}(1+\lambda),\quad \lambda \approx 0.01\text{–}0.1` },
    ],
  },
  meaning: t(
    '预测反褶积的思路很朴素：如果一个地震道里存在周期性（海面鸣震、层间多次波），那么「未来」的样点可以由「过去」的样点线性预测出来。把可预测的部分减掉，剩下的就是不可预测的 —— 也就是一次反射。预测步长 α 是核心开关：α = 1 时压缩子波、 whitening 整个谱；α 较大时只去掉长周期的多次波而保留一次反射。这是勘探地震处理里最经典、也最有效的多次波压制手段。',
    'The idea of predictive deconvolution is simple: if a seismic trace contains periodicity (sea-surface reverberation, interbed multiples), then future samples can be predicted linearly from past ones. Subtract the predictable part and what remains is the unpredictable part — that is, primaries. The prediction lag α is the key switch: α = 1 compresses the wavelet and whitens the whole spectrum; larger α removes only long-period multiples and preserves primaries. It is the most classic and effective multiple-suppression tool in exploration processing.',
  ),
  symbols: [
    { sym: '\\alpha', name: t('预测步长（间隔）', 'prediction lag (gap)'), unit: '样点数' },
    { sym: 'a_k', name: t('预测滤波器系数', 'prediction filter coefficients'), unit: '无量纲' },
    { sym: '\\mathbf{R}, \\mathbf{r}', name: t('自相关矩阵与互相关向量', 'autocorrelation matrix and cross-correlation vector'), unit: '—' },
    { sym: '\\lambda', name: t('白噪增益（对角加载）', 'white-noise gain (diagonal loading)'), unit: '无量纲' },
    { sym: 'e(t)', name: t('预测误差（即反褶积结果）', 'prediction error (the deconvolution result)'), unit: '—' },
  ],
  conditions: {
    applies: [t('多次波压制、子波压缩、提高地震记录分辨率', 'Multiple suppression, wavelet compression, raising the resolution of seismic records')],
    assumes: [t('子波为最小相位、反射系数为白噪', 'The wavelet is minimum phase and reflectivity is white'), t('周期性成分在时间上稳定', 'The periodic component is stable in time')],
    breaks: [t('非周期性多次波（如绕射多次波）无法用此法压制', 'Non-periodic multiples (e.g. diffracted multiples) cannot be suppressed this way'), t('反射系数强相关时脉冲反褶积会破坏真实振幅', 'Spiking deconvolution corrupts true amplitudes when reflectivity is strongly correlated')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('最小二乘预测未来样点', 'Predict the future sample by least squares'), latex: String.raw`\min_{\mathbf{a}}\sum_t\left(x(t+\alpha)-\sum_k a_k x(t-k)\right)^{2}` },
    { n: 2, op: 'algebra', title: t('求导得到 Wiener–Hopf（Toeplitz）方程', 'Differentiating gives the Wiener–Hopf (Toeplitz) equations'), latex: String.raw`\sum_k a_k R(i-k) = r(i),\qquad R(i)=\sum_t x(t)x(t-i)` },
    { n: 3, op: 'identity', title: t('右端项是 x(t+α) 与过去的互相关', 'The right-hand side is the cross-correlation of x(t+α) with the past'), latex: String.raw`r(i) = \sum_t x(t+\alpha)x(t-i)` },
    { n: 4, op: 'substitute', title: t('加对角加载稳定求逆', 'Add diagonal loading to stabilise the inversion'), latex: String.raw`\mathbf{R} \to \mathbf{R} + \lambda\,\mathrm{diag}(\mathbf{R})` },
    { n: 5, op: 'result', title: t('预测误差即去掉周期性的记录', 'The prediction error is the record with periodicity removed'), latex: String.raw`e(t) = x(t+\alpha)-\sum_k a_k x(t-k)` },
  ],
  viz: [
    {
      id: 'pred-decon',
      level: 'V3',
      title: t('预测步长 α 对输出的影响', 'Effect of the prediction lag α on the output'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('振幅', 'amplitude'),
      controls: [
        { id: 'alpha', label: t('预测步长 α (样点)', 'prediction lag α (samples)'), min: 1, max: 40, step: 1, value: 12 },
        { id: 'per', label: t('多次波周期 (样点)', 'multiple period (samples)'), min: 5, max: 60, step: 1, value: 24 },
        { id: 'amp', label: t('多次波振幅', 'multiple amplitude'), min: 0, max: 0.9, step: 0.02, value: 0.45 },
        { id: 'nfil', label: t('滤波器长度', 'filter length'), min: 8, max: 120, step: 2, value: 60 },
      ],
      note: t('把 α 调到多次波周期的整数倍附近（这里是 24），周期性鸣震被大幅压制而一次反射保留；把 α 调到 1，整个子波被压缩成尖脉冲（谱被拉平），但一次反射的相对振幅关系会被打乱。', 'Setting α near an integer multiple of the multiple period (here 24) strongly suppresses the periodic reverberation while preserving primaries; setting α = 1 compresses the whole wavelet into spikes (whitening the spectrum), but distorts the relative amplitudes of primaries.'),
      compute: (p) => {
        const al = Math.round(p['alpha']), per = Math.round(p['per']), am = p['amp'], L = Math.round(p['nfil'])
        const N = 600
        const dt = 0.004
        let seed = 4321
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return (seed / 0x7fffffff) * 2 - 1
        }
        const wav = (i: number) => {
          const tt = i * dt
          return Math.exp(-((tt - 0.03) * (tt - 0.03)) / (2 * 0.012 * 0.012)) * Math.cos(2 * Math.PI * 30 * (tt - 0.03))
        }
        const refl: number[] = new Array(N).fill(0)
        refl[80] = 1
        refl[200] = -0.6
        refl[360] = 0.8
        refl[480] = -0.4
        const x = new Array(N).fill(0)
        for (let i = 0; i < N; i++) {
          let s = 0
          for (let k = 0; k < 90 && i - k >= 0; k++) s += refl[i - k] * wav(k)
          // 周期性多次波
          if (i - per >= 0) s += am * x[i - per]
          x[i] = s + 0.002 * rnd()
        }
        // 自相关
        const R = (lag: number) => {
          let s = 0
          for (let i = Math.abs(lag); i < N; i++) s += x[i] * x[i - Math.abs(lag)]
          return s
        }
        const r: number[] = []
        for (let i = 0; i < L; i++) r.push(R(al + i))
        // 解 Toeplitz（高斯消元，L ≤ 120）
        const A: number[][] = []
        for (let i = 0; i < L; i++) {
          const row: number[] = []
          for (let j = 0; j < L; j++) row.push(R(i - j) * (1 + (i === j ? 0.02 : 0)))
          row.push(r[i])
          A.push(row)
        }
        const aa = new Array(L).fill(0)
        for (let c = 0; c < L; c++) {
          let piv = c
          for (let rr = c + 1; rr < L; rr++) if (Math.abs(A[rr][c]) > Math.abs(A[piv][c])) piv = rr
          if (Math.abs(A[piv][c]) < 1e-18) continue
          const tmp = A[c]; A[c] = A[piv]; A[piv] = tmp
          for (let rr = 0; rr < L; rr++) {
            if (rr === c) continue
            const f = A[rr][c] / A[c][c]
            for (let cc2 = c; cc2 <= L; cc2++) A[rr][cc2] -= f * A[c][cc2]
          }
        }
        for (let i = 0; i < L; i++) aa[i] = Math.abs(A[i][i]) > 1e-18 ? A[i][L] / A[i][i] : 0
        const e: number[] = new Array(N).fill(0)
        for (let i = 0; i < N; i++) {
          let pr = 0
          for (let k = 0; k < L && i - al - k >= 0; k++) pr += aa[k] * x[i - al - k]
          e[i] = x[i] - pr
        }
        const mx = Math.max(...x.map(Math.abs), 1e-9)
        const ptsX: Array<[number, number]> = []
        const ptsE: Array<[number, number]> = []
        for (let i = 0; i < N; i++) {
          ptsX.push([i * dt, x[i] / mx])
          ptsE.push([i * dt, e[i] / mx])
        }
        return [
          { label: t('原始记录（含鸣震）', 'original (with reverberation)'), color: '#888780', points: ptsX },
          { label: t('预测反褶积输出', 'predictive deconvolution output'), color: '#185FA5', points: ptsE },
        ]
      },
    },
  ],
  example: {
    title: t('海上鸣震压制', 'Suppressing marine reverberation'),
    input: t('海底多次波周期 24 样点（Δt = 4 ms，即 96 ms），振幅 0.45', 'Seafloor multiple period 24 samples (Δt = 4 ms, i.e. 96 ms), amplitude 0.45'),
    steps: [
      t('取 α = 24，滤波器长 60 样点', 'Take α = 24 with a 60-sample filter'),
      t('周期性成分被预测并减去，一次反射保留', 'The periodic component is predicted and subtracted; primaries remain'),
    ],
    output: t('鸣震尾巴显著衰减，同相轴更清晰', 'The reverberation tail decays markedly and events become clearer'),
  },
  links: {
    upstream: [
      { id: 'wiener-filter', note: t('Wiener 滤波是同一数学框架', 'The Wiener filter is the same mathematical framework') },
      { id: 'convolution-theorem', note: t('褶积模型是反褶积的前提', 'The convolution model is the premise of deconvolution') },
    ],
    downstream: [{ id: 'radon-multiple-attenuation', note: t('Radon 变换是另一种压制手段', 'The Radon transform is another suppression tool') }],
    seealso: [{ id: 'periodic-multiple', note: t('周期性多次波是可预测性的来源', 'Periodic multiples are the source of predictability') }],
  },
  refs: [{ text: 'Peacock & Treitel (1969), Predictive deconvolution: theory and practice, Geophysics 34, 155–169' }],
}

export default predictiveDeconvolution
