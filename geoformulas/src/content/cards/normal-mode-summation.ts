import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** normal-mode-summation */
const normalModeSummation: FormulaCard = {
  id: 'normal-mode-summation',
  name: t('简正模合成地震图', 'Normal-mode Summation of Seismograms'),
  aliases: { zh: ['简正模叠加', '模求和'], en: ['normal-mode summation', 'mode synthesis'] },
  node: 'S5.6',
  tags: {
    math: ['MATH.FOURIER', 'MATH.VECTOR'],
    method: ['METH.STRUCT'],
    quantity: ['Q.AMP', 'Q.FREQ'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`u(\boldsymbol{r},t)=\sum_{k}A_k(\boldsymbol{r},\boldsymbol{r}_s)\,M_k\,\cos\!\left(\omega_k t\right)e^{-\omega_k t/2Q_k}`,
    variants: [
      { name: t('激发系数', 'Excitation coefficient'), latex: String.raw`A_k=\boldsymbol{u}_k(\boldsymbol{r})\cdot\left[\boldsymbol{M}:\nabla\boldsymbol{u}_k(\boldsymbol{r}_s)\right]` },
      { name: t('周期很长时的低频近似', 'Low-frequency limit at very long periods'), latex: String.raw`T>500\ \text{s 时简正模求和比射线理论更高效}` },
    ],
  },
  meaning: t(
    '周期超过几百秒时，地震波已经「感觉不到」射线，而是整个地球的驻波。此时把地球的所有本征振动按激发强度叠加起来，就能合成出完整的地震图 —— 这是计算长周期理论地震图最自然的方法，也是反演地球整体结构（密度、内核各向异性）的唯一途径。',
    'At periods beyond a few hundred seconds seismic waves no longer behave like rays but as standing waves of the whole Earth. Superposing all the Earth’s eigenvibrations weighted by their excitation then synthesises the complete seismogram. This is the most natural way to compute long-period synthetic seismograms, and the only route to inverting the Earth’s overall structure, including density and inner-core anisotropy.',
  ),
  symbols: [
    { sym: 'k', name: t('模的索引（含 n、ℓ、m）', 'mode index (covering n, ℓ, m)'), unit: '无量纲' },
    { sym: 'A_k', name: t('第 k 个模的激发系数', 'excitation coefficient of mode k'), unit: 'm' },
    { sym: '\\omega_k', name: t('本征角频率', 'eigenfrequency'), unit: 'rad/s' },
    { sym: 'Q_k', name: t('该模的品质因子', 'quality factor of that mode'), unit: '无量纲' },
    { sym: 'M_k', name: t('矩张量在该模上的投影', 'projection of the moment tensor onto that mode'), unit: 'N·m' },
  ],
  conditions: {
    applies: [t('周期长于约 200 s 的全球地震图合成', 'Synthesising global seismograms at periods longer than about 200 s')],
    assumes: [t('SNREI 地球模型，线性弹性', 'SNREI Earth model, linear elasticity')],
    breaks: [t('短周期需要海量高阶模，实用上改用射线理论或谱元法', 'At short periods an enormous number of high-order modes is needed, so ray theory or spectral-element methods are used instead')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把位移按本征函数展开', 'Expand the displacement in eigenfunctions'),
      latex: String.raw`\boldsymbol{u}(\boldsymbol{r},t)=\sum_k a_k(t)\,\boldsymbol{u}_k(\boldsymbol{r})` },
    { n: 2, op: 'physics', title: t('每个模满足阻尼振子方程', 'Each mode satisfies a damped-oscillator equation'),
      latex: String.raw`\ddot a_k+\frac{\omega_k}{Q_k}\dot a_k+\omega_k^{2}a_k=f_k(t)` },
    { n: 3, op: 'transform', title: t('对震源项做卷积', 'Convolve with the source term'),
      latex: String.raw`a_k(t)=\frac{M_k}{\omega_k}\sin\!\left(\omega_k t\right)e^{-\omega_k t/2Q_k}` },
    { n: 4, op: 'result', title: t('全模叠加', 'Sum over all modes'),
      latex: String.raw`u(\boldsymbol{r},t)=\sum_k A_k\,a_k(t)` },
  ],
  links: {
    upstream: [
      { id: 'free-oscillation-modes', note: t('提供本征函数与本征频率', 'Supplies eigenfunctions and eigenfrequencies') },
      { id: 'moment-tensor-definition', note: t('震源项来自矩张量', 'The source term comes from the moment tensor') },
    ],
  },
  refs: [{ text: 'Dahlen & Tromp, Theoretical Global Seismology, §10' }],
}

export default normalModeSummation
