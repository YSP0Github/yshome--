import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** synthetic-seismogram */
const syntheticSeismogram: FormulaCard = {
  id: 'synthetic-seismogram',
  name: t('合成地震记录（褶积模型）', 'Synthetic Seismogram (Convolutional Model)'),
  aliases: { zh: ['合成记录', '褶积模型', '一维正演'], en: ['synthetic seismogram', 'convolutional model', '1D forward modelling'] },
  node: 'S3.1',
  tags: {
    math: ['MATH.FOURIER', 'MATH.ALGEBRA'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: { zh: '子波、标定、井震结合', en: 'wavelet, calibration, well tie' },
  },
  audience: 'bachelor',
  complete: 'L4',
  statement: {
    main: String.raw`s(t) = w(t) * r(t) + n(t)`,
    variants: [
      { name: t('频率域写法', 'Frequency-domain form'), latex: String.raw`S(\omega) = W(\omega)\,R(\omega) + N(\omega)` },
      { name: t('Ricker 子波', 'The Ricker wavelet'), latex: String.raw`w(t) = \left(1 - 2\pi^{2}f_{m}^{2}t^{2}\right)\exp\!\left(-\pi^{2}f_{m}^{2}t^{2}\right)` },
      { name: t('反射系数序列', 'The reflectivity series'), latex: String.raw`r(t) = \sum_{n} r_{n}\,\delta(t - t_{n})` },
    ],
  },
  meaning: t(
    '一维褶积模型是地震解释的「最小可用模型」：地层给出一串反射系数尖脉冲，地震子波把它抹成有限宽度的波形，再加上噪声就是实际记录。井震标定、子波提取、反演都以它为出发点。',
    'The 1D convolutional model is the minimal usable model of seismic interpretation: the layering supplies a spike train of reflection coefficients, the seismic wavelet smears each spike into a finite-width waveform, and noise is added on top. Well ties, wavelet estimation and inversion all start from it.',
  ),
  symbols: [
    { sym: 's(t)', name: t('合成地震道', 'synthetic trace'), unit: '振幅' },
    { sym: 'w(t)', name: t('地震子波', 'seismic wavelet'), unit: '无量纲' },
    { sym: 'r(t)', name: t('反射系数序列', 'reflectivity series'), unit: '无量纲' },
    { sym: 'n(t)', name: t('噪声', 'noise'), unit: '振幅' },
    { sym: 'f_{m}', name: t('子波主频', 'dominant wavelet frequency'), unit: 'Hz', typical: '10 – 60' },
    { sym: 'r_{n}', name: t('第 n 个界面的反射系数', 'reflection coefficient at interface n'), unit: '无量纲', typical: '−0.3 – 0.3' },
  ],
  conditions: {
    applies: [t('一维层状介质、垂直入射、已去除多次波的情形', '1D layered media, normal incidence, with multiples removed')],
    assumes: [
      t('子波在传播过程中不变（或已做 Q 补偿）', 'The wavelet is stationary during propagation (or Q-compensated)'),
      t('忽略透射损失与层间多次波', 'Transmission loss and internal multiples are ignored'),
    ],
    breaks: [
      t('薄层调谐使相邻反射相互干涉，需要全波形正演', 'Thin-bed tuning makes neighbouring reflections interfere; full waveform modelling is needed'),
      t('大角度、强横向变化时必须做弹性正演', 'Large angles and strong lateral variation require elastic modelling'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('线性时不变系统假设', 'Linear time-invariant assumption'),
      latex: String.raw`\text{地层响应} = \text{线性叠加},\quad \text{子波} = \text{系统冲激响应}` },
    { n: 2, op: 'setup', title: t('把地层写成尖脉冲串', 'Write the layering as a spike train'),
      latex: String.raw`r(t) = \sum_n r_n\,\delta(t-t_n)` },
    { n: 3, op: 'substitute', title: t('与子波褶积', 'Convolve with the wavelet'),
      latex: String.raw`s(t) = \int w(\tau)r(t-\tau)\,d\tau = \sum_n r_n\,w(t-t_n)` },
    { n: 4, op: 'transform', title: t('换到频率域', 'Move to the frequency domain'),
      latex: String.raw`S(\omega) = W(\omega)R(\omega)` },
    { n: 5, op: 'result', title: t('加上噪声完成模型', 'Add noise to complete the model'),
      latex: String.raw`s(t) = w(t)*r(t) + n(t)` },
  ],
  viz: [
    {
      id: 'conv-synthetic',
      level: 'V3',
      title: t('反射系数序列与 Ricker 子波褶积', 'Reflectivity series convolved with a Ricker wavelet'),
      xlabel: t('时间样点', 'time sample'),
      ylabel: t('振幅', 'amplitude'),
      controls: [
        { id: 'fm', label: t('主频 f_m (Hz)', 'dominant frequency f_m (Hz)'), min: 10, max: 70, step: 1, value: 30 },
        { id: 'amp', label: t('阻抗反差幅度', 'impedance contrast amplitude'), min: 0.05, max: 0.5, step: 0.01, value: 0.22 },
      ],
      note: t('主频越高，两个相邻界面越能被分开；主频降低时它们会合并成一个「调谐」波形。', 'Higher dominant frequency separates adjacent interfaces better; lowering it merges them into a single tuned waveform.'),
      compute: (p) => {
        const fm = p['fm'], amp = p['amp']
        const dt = 0.002
        const N = 400
        const z0 = 6000
        const z: number[] = []
        for (let n = 0; n < N; n++) {
          z.push(z0 * (1 + amp * Math.sin((2 * Math.PI * n) / 90) + 0.4 * amp * Math.sin((2 * Math.PI * n) / 23)))
        }
        const r: number[] = []
        for (let n = 0; n < N - 1; n++) r.push((z[n + 1] - z[n]) / (z[n + 1] + z[n]))
        const half = Math.round(0.08 / dt)
        const w: number[] = []
        for (let k = -half; k <= half; k++) {
          const tt = k * dt
          const a = Math.PI * fm * tt
          w.push((1 - 2 * a * a) * Math.exp(-a * a))
        }
        const syn: Array<[number, number]> = []
        const ref: Array<[number, number]> = []
        for (let i = 0; i < N - 1; i++) {
          let s = 0
          for (let k = -half; k <= half; k++) {
            const j = i - k
            if (j >= 0 && j < r.length) s += w[k + half] * r[j]
          }
          syn.push([i, s * 8])
          ref.push([i, r[i] * 4])
        }
        return [
          { label: t('合成记录 s(t)', 'synthetic s(t)'), color: '#185FA5', points: syn },
          { label: t('反射系数 r(t)', 'reflectivity r(t)'), color: '#993C1D', points: ref, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('30 Hz 子波能分辨多薄的地层', 'How thin a bed can a 30 Hz wavelet resolve'),
    input: t('f_m = 30 Hz，层速度 3000 m/s', 'f_m = 30 Hz, interval velocity 3000 m/s'),
    steps: [
      t('主波长 λ = v/f = 3000/30 = 100 m', 'Dominant wavelength λ = v/f = 3000/30 = 100 m'),
      t('可分辨厚度 ≈ λ/4 = 25 m，对应双程时间 16.7 ms', 'Resolvable thickness ≈ λ/4 = 25 m, i.e. 16.7 ms two-way time'),
    ],
    output: t('比 25 m 更薄的地层进入调谐区，振幅不再与厚度成正比', 'Beds thinner than 25 m enter the tuning zone, where amplitude no longer scales with thickness'),
  },
  links: {
    upstream: [
      { id: 'acoustic-reflection-coefficient', note: t('反射系数的来源', 'Where reflectivity comes from') },
      { id: 'convolution-integral', note: t('褶积的数学定义', 'Mathematical definition of convolution') },
    ],
    downstream: [{ id: 'thin-bed-tuning', note: t('薄层时的干涉现象', 'Interference when beds are thin') }],
    seealso: [{ id: 'vertical-resolution', note: t('分辨率的定量判据', 'Quantitative resolution criteria') }],
  },
  refs: [{ text: 'Yilmaz, Seismic Data Analysis, ch. 2 (synthetic seismograms)' }],
}

export default syntheticSeismogram
