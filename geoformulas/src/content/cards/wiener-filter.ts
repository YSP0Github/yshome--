import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wiener-filter */
const wienerFilter: FormulaCard = {
  id: 'wiener-filter',
  name: t('维纳滤波', 'The Wiener Filter'),
  aliases: { zh: ['最优滤波', '最小均方滤波'], en: ['Wiener filter', 'optimal filter', 'least-squares filter'] },
  node: 'S9.5',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT', 'MATH.LINALG'],
    method: ['METH.PROC', 'METH.INV'],
    quantity: ['Q.AMP'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`W(f)=\frac{S_{dx}(f)}{S_{xx}(f)}=\frac{H^{*}(f)\,P_s(f)}{|H(f)|^{2}P_s(f)+P_n(f)}`,
    variants: [
      { name: t('无噪声时退化为逆滤波', 'Noise-free limit: inverse filtering'), latex: String.raw`P_n\to0\;\Longrightarrow\; W(f)=\frac{1}{H(f)}` },
      { name: t('时域的正规方程', 'Time-domain normal equations'), latex: String.raw`\sum_k w_k\,r_{xx}(m-k)=r_{dx}(m)\quad\Longleftrightarrow\quad \mathbf{R}_{xx}\boldsymbol{w}=\boldsymbol{r}_{dx}` },
    ],
  },
  meaning: t(
    '维纳滤波回答「在存在噪声的情况下，怎么设计滤波器让输出与期望信号的均方误差最小」。它的频域形式非常直观：在信噪比高的地方接近逆滤波（把系统效应完全去掉），在信噪比低的地方自动压低增益（不放大噪声）。去仪器响应、反褶积、子波整形用的都是它。',
    'The Wiener filter answers how to design a filter minimising the mean-square error between output and desired signal in the presence of noise. Its frequency-domain form is intuitive: where the signal-to-noise ratio is high it approaches inverse filtering, fully removing the system effect; where it is low, the gain is automatically reduced so noise is not amplified. Instrument deconvolution, deconvolution and wavelet shaping all use it.',
  ),
  symbols: [
    { sym: 'W(f)', name: t('维纳滤波器', 'Wiener filter'), unit: '无量纲' },
    { sym: 'S_{dx}', name: t('期望信号与输入的互功率谱', 'cross-power spectrum of desired signal and input'), unit: '信号平方/Hz' },
    { sym: 'S_{xx}', name: t('输入的自功率谱', 'auto-power spectrum of the input'), unit: '信号平方/Hz' },
    { sym: 'P_s,P_n', name: t('信号与噪声的功率谱', 'power spectra of signal and noise'), unit: '信号平方/Hz' },
    { sym: 'r_{xx},r_{dx}', name: t('自相关与互相关序列', 'autocorrelation and cross-correlation sequences'), unit: '信号平方' },
  ],
  conditions: {
    applies: [t('平稳随机信号的最优线性滤波', 'Optimal linear filtering of stationary random signals')],
    assumes: [
      t('信号与噪声广义平稳且互不相关', 'Signal and noise are wide-sense stationary and uncorrelated'),
      t('滤波器为线性、因果性可另行施加', 'The filter is linear; causality can be imposed separately'),
    ],
    breaks: [t('非平稳信号（如强震记录）需分段或改用自适应滤波', 'Non-stationary signals such as strong-motion records need segmentation or adaptive filtering')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义均方误差', 'Define the mean-square error'),
      latex: String.raw`J=E\!\left[\left(d(t)-w*x(t)\right)^{2}\right]` },
    { n: 2, op: 'transform', title: t('转到频域', 'Move to the frequency domain'),
      latex: String.raw`J=\int\left[P_s|1-WH|^{2}+P_n|W|^{2}\right]\mathrm{d}f` },
    { n: 3, op: 'taylor', title: t('对每个 f 独立最小化', 'Minimise independently at each f'),
      latex: String.raw`\frac{\partial}{\partial W}\left[P_s|1-WH|^{2}+P_n|W|^{2}\right]=0` },
    { n: 4, op: 'algebra', title: t('解出 W', 'Solve for W'),
      latex: String.raw`W=\frac{H^{*}P_s}{|H|^{2}P_s+P_n}` },
    { n: 5, op: 'result', title: t('写成信噪比形式', 'Express via the signal-to-noise ratio'),
      latex: String.raw`W=\frac{1}{H}\cdot\frac{|H|^{2}P_s}{|H|^{2}P_s+P_n}=\frac{1}{H}\cdot\frac{\mathrm{SNR}}{1+\mathrm{SNR}}` },
  ],
  links: {
    upstream: [{ id: 'convolution-theorem', note: t('频域乘法形式的基础', 'Basis of the frequency-domain product form') }],
    downstream: [{ id: 'instrument-deconvolution', note: t('去仪器响应即它的特例', 'Response removal is a special case') }],
  },
  refs: [{ text: 'Wiener (1949), Extrapolation, Interpolation, and Smoothing of Stationary Time Series' }, { text: 'Robinson & Treitel, Geophysical Signal Analysis' }],
}

export default wienerFilter
