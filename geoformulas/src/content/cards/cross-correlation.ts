import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** cross-correlation */
const crossCorrelation: FormulaCard = {
  id: 'cross-correlation',
  name: t('互相关', 'Cross-correlation'),
  aliases: { zh: ['相关', '互相关系数'], en: ['cross-correlation', 'correlation function'] },
  node: 'S9.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.PROC', 'METH.SURF'],
    quantity: ['Q.AMP', 'Q.TIME'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`C_{fg}(\tau)=\int f(t)\,g(t+\tau)\,\mathrm{d}t=\left(f\star g\right)(\tau)`,
    variants: [
      { name: t('归一化相关系数', 'Normalised correlation coefficient'), latex: String.raw`\rho(\tau)=\frac{C_{fg}(\tau)}{\sqrt{C_{ff}(0)\,C_{gg}(0)}},\qquad |\rho|\le1` },
      { name: t('与褶积的关系', 'Relation to convolution'), latex: String.raw`f\star g=f(-t)*g(t)` },
      { name: t('频域形式', 'Frequency-domain form'), latex: String.raw`\tilde{C}_{fg}=\tilde{f}^{*}\,\tilde{g}` },
    ],
  },
  meaning: t(
    '互相关衡量「把 g 平移 τ 之后与 f 有多像」。它是地震学里用途最广的运算之一：互相关走时拾取给出亚采样精度的到时差、模板匹配检测微小地震、双台噪声互相关提取格林函数 —— 三者用的是同一个公式。',
    'Cross-correlation measures how similar g is to f after shifting by τ. It is among the most widely used operations in seismology: cross-correlation travel-time picking gives subsample-precision differential times, template matching detects tiny earthquakes, and two-station noise correlation extracts Green functions — all the same formula.',
  ),
  symbols: [
    { sym: 'C_{fg}(\\tau)', name: t('互相关函数', 'cross-correlation function'), unit: '信号平方 × 时间' },
    { sym: '\\tau', name: t('时移（滞后）', 'time lag'), unit: 's' },
    { sym: '\\rho(\\tau)', name: t('归一化相关系数', 'normalised correlation coefficient'), unit: '无量纲' },
    { sym: '\\tilde{f}^{*}', name: t('f 频谱的复共轭', 'complex conjugate of the spectrum of f'), unit: '与 f 同' },
  ],
  conditions: {
    applies: [t('任意两个实信号的相似性度量与到时差测量', 'Measuring similarity and differential arrival times between two real signals')],
    assumes: [t('信号为平稳或已做窗化处理', 'Signals are stationary or have been windowed')],
    breaks: [t('两个信号波形差异大时，互相关峰不明显甚至出现假峰', 'When waveforms differ substantially the correlation peak is weak or spurious')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义内积形式的相似度', 'Define similarity as an inner product'),
      latex: String.raw`C_{fg}(\tau)=\left\langle f(t),\,g(t+\tau)\right\rangle=\int f(t)\,g(t+\tau)\,\mathrm{d}t` },
    { n: 2, op: 'identity', title: t('写成褶积', 'Write as a convolution'),
      latex: String.raw`C_{fg}(\tau)=\int f(t-\tau)\,g(t)\,\mathrm{d}t=f(-t)*g(t)` },
    { n: 3, op: 'transform', title: t('利用褶积定理', 'Use the convolution theorem'),
      latex: String.raw`\mathcal{F}\left\{f(-t)*g(t)\right\}=\tilde{f}^{*}(f)\,\tilde{g}(f)` },
    { n: 4, op: 'result', title: t('峰值位置即到时差', 'The peak position is the differential arrival time'),
      latex: String.raw`\hat\tau=\arg\max_\tau C_{fg}(\tau)` },
  ],
  links: {
    upstream: [{ id: 'convolution-integral', note: t('相关是反向褶积', 'Correlation is reversed convolution') }],
    downstream: [{ id: 'ambient-noise-green-function', note: t('噪声互相关的核心运算', 'The core operation behind noise correlation') }],
  },
  refs: [{ text: 'Schuster, Seismic Interferometry' }],
}

export default crossCorrelation
