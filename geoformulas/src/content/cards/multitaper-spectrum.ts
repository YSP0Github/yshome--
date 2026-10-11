import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** multitaper-spectrum */
const multitaperSpectrum: FormulaCard = {
  id: 'multitaper-spectrum',
  name: t('多窗谱估计', 'Multitaper Spectral Estimation'),
  aliases: { zh: ['多正弦窗', 'Thomson 多窗法'], en: ['multitaper', 'Thomson multitaper', 'Slepian sequences'] },
  node: 'S9.3',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT', 'MATH.LINALG'],
    method: ['METH.PROC'],
    quantity: ['Q.FREQ', 'Q.AMP'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\hat S(f)=\frac{1}{K}\sum_{k=0}^{K-1}\left|\sum_{t}w_k(t)\,x(t)\,e^{-i2\pi ft}\right|^{2}`,
    variants: [
      { name: t('时间—带宽积', 'Time–bandwidth product'), latex: String.raw`NW=\frac{T\cdot W}{2}\quad\Rightarrow\quad K\approx2NW-1\ \text{个可用窗}` },
      { name: t('Slepian 序列的本征值方程', 'Eigenvalue equation of the Slepian sequences'), latex: String.raw`\sum_{t'}R(t,t')\,w_k(t')=\lambda_k\,w_k(t),\qquad R(t,t')=\frac{\sin 2\pi W(t-t')}{\pi(t-t')}` },
      { name: t('自由度与方差', 'Degrees of freedom and variance'), latex: String.raw`\nu=2K,\qquad \frac{\operatorname{Var}[\hat S]}{S^{2}}=\frac{1}{K}` },
    ],
  },
  meaning: t(
    '单一段记录的周期图方差极大（不随长度减小！）。多窗法用 K 个互相正交的 Slepian 窗分别做谱估计再平均，把方差降到 1/K，代价是频率分辨率从 1/T 降到约 2W。这是频谱估计里「偏差—方差」权衡最漂亮的解法，在接收函数、噪声互相关、低频谱分析中已成标配。',
    'The periodogram of a single segment has enormous variance that does not decrease with record length. The multitaper method computes spectra with K orthogonal Slepian tapers and averages them, cutting variance to 1/K at the cost of degrading frequency resolution from 1/T to about 2W. It is the most elegant resolution of the bias–variance trade-off in spectral estimation, and is now standard in receiver functions, noise correlation and low-frequency spectral analysis.',
  ),
  symbols: [
    { sym: '\\hat S(f)', name: t('多窗谱估计', 'multitaper spectral estimate'), unit: '信号平方/Hz' },
    { sym: 'w_k(t)', name: t('第 k 个 Slepian 窗', 'the k-th Slepian taper'), unit: '无量纲' },
    { sym: 'N', name: t('采样点数', 'number of samples'), unit: '个' },
    { sym: 'W', name: t('半带宽', 'half bandwidth'), unit: 'Hz' },
    { sym: 'K', name: t('窗的个数', 'number of tapers'), unit: '个', typical: '3 – 8' },
    { sym: '\\lambda_k', name: t('能量集中度本征值', 'energy-concentration eigenvalue'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('短记录、低信噪比的稳健谱估计', 'Robust spectral estimation from short or low-SNR records')],
    assumes: [t('信号局部平稳', 'The signal is locally stationary')],
    breaks: [t('瞬态信号（如尖锐到时）会被窗平滑掉，不适合做精确到时测量', 'Transient features such as sharp arrivals are smeared by the tapers, so the method is unsuitable for precise timing')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('要求在带宽 W 内能量最集中', 'Require maximal energy concentration within bandwidth W'),
      latex: String.raw`\max_w\frac{\int_{-W}^{W}|W(f)|^{2}\mathrm{d}f}{\int_{-1/2}^{1/2}|W(f)|^{2}\mathrm{d}f}=\lambda` },
    { n: 2, op: 'identity', title: t('化为本征值问题', 'Reduce to an eigenvalue problem'),
      latex: String.raw`\sum_{t'}\frac{\sin 2\pi W(t-t')}{\pi(t-t')}\,w(t')=\lambda\,w(t)` },
    { n: 3, op: 'identity', title: t('前 K ≈ 2NW − 1 个本征值接近 1', 'The first K ≈ 2NW − 1 eigenvalues are close to 1'),
      latex: String.raw`\lambda_0>\lambda_1>\cdots>\lambda_{K-1}\approx1` },
    { n: 4, op: 'result', title: t('各窗谱平均', 'Average the tapered spectra'),
      latex: String.raw`\hat S(f)=\frac{1}{K}\sum_{k}\lambda_k^{-1}\left|\tilde{x}_k(f)\right|^{2}\approx\frac{1}{K}\sum_k\left|\tilde{x}_k(f)\right|^{2}` },
  ],
  links: {
    upstream: [{ id: 'fourier-transform-pair', note: t('每个窗谱都是 Fourier 变换', 'Each tapered spectrum is a Fourier transform') }],
    seealso: [{ id: 'short-time-fourier', note: t('另一种处理非平稳信号的方法', 'Another approach to non-stationary signals') }],
  },
  refs: [{ text: 'Thomson (1982), Proc. IEEE, 70' }, { text: 'Percival & Walden, Spectral Analysis for Physical Applications' }],
}

export default multitaperSpectrum
