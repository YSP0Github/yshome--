import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** centroid-moment-tensor */
const centroidMomentTensor: FormulaCard = {
  id: 'centroid-moment-tensor',
  name: t('质心矩张量（CMT）', 'The Centroid Moment Tensor (CMT)'),
  aliases: { zh: ['CMT', '矩心矩张量'], en: ['CMT', 'centroid moment tensor', 'moment tensor inversion'] },
  node: 'S4.7',
  tags: {
    math: ['MATH.LINALG', 'MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.TELE', 'METH.INV'],
    quantity: ['Q.TENSOR', 'Q.SOURCE'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\min_{\boldsymbol{m},\boldsymbol{x}_c,\tau}\sum_{i}\int\left[d_i(t)-\sum_{j}G_{ij}\left(\boldsymbol{x}_c,t-\tau\right)m_j\right]^{2}\,\mathrm{d}t`,
    variants: [
      { name: t('参数化', 'Parameterisation'), latex: String.raw`\left\{M_{rr},M_{\theta\theta},M_{\phi\phi},M_{r\theta},M_{r\phi},M_{\theta\phi};\ \text{纬度, 经度, 深度, 质心时间}\right\}` },
      { name: t('线性—非线性分离', 'Linear–nonlinear separation'), latex: String.raw`\text{给定}\ \left(\boldsymbol{x}_c,\tau\right)\ \text{时对}\ \boldsymbol{m}\ \text{线性；对}\ \boldsymbol{x}_c,\tau\ \text{需网格搜索}` },
    ],
  },
  meaning: t(
    'CMT 把震源压缩成「一个点 + 一个时刻 + 一个对称张量」共 9–10 个参数。它明确承认了自己是点源近似：质心位置是能量辐射的加权中心，不代表破裂起始点；质心时间是辐射的时间重心，通常比破裂起始晚几秒到几十秒。几乎所有全球地震目录（Global CMT）都用这套参数化。',
    'The CMT compresses a source into "one point + one time + one symmetric tensor", i.e. 9–10 parameters. It openly acknowledges being a point-source approximation: the centroid is the energy-weighted centre of radiation, not the rupture initiation point, and the centroid time is the temporal centre of radiation, typically seconds to tens of seconds later than rupture onset. Nearly all global catalogues (Global CMT) use this parameterisation.',
  ),
  symbols: [
    { sym: '\\boldsymbol{x}_c', name: t('质心位置（纬度、经度、深度）', 'centroid location (lat, lon, depth)'), unit: '°, km' },
    { sym: '\\tau', name: t('质心时间（相对破裂起始）', 'centroid time (relative to rupture onset)'), unit: 's' },
    { sym: 'm_j', name: t('矩张量的 6 个独立分量', 'the six independent moment tensor components'), unit: 'N·m' },
    { sym: 'G_{ij}', name: t('格林函数及其空间/时间导数', 'Green functions and their space/time derivatives'), unit: '1/m' },
  ],
  conditions: {
    applies: [t('长周期（40–150 s）远震波形反演', 'Long-period (40–150 s) teleseismic waveform inversion')],
    assumes: [
      t('点源近似成立（周期 ≫ 破裂持续时间）', 'The point-source approximation holds (period ≫ rupture duration)'),
      t('一维参考模型给出的格林函数足够准确', 'Green functions from a 1D reference model are accurate enough'),
    ],
    breaks: [t('巨大地震（Mw > 8.5）破裂尺度与周期可比，必须用有限源反演', 'For great earthquakes (Mw > 8.5) the rupture dimension is comparable to the period and finite-source inversion is required')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把合成地震图写成矩张量的线性组合', 'Write the synthetic seismogram as a linear combination over the moment tensor'),
      latex: String.raw`u_i(t)=\sum_j G_{ij}(t)\,m_j` },
    { n: 2, op: 'setup', title: t('定义波形失配', 'Define the waveform misfit'),
      latex: String.raw`J=\sum_i\int\left(d_i-u_i\right)^{2}\mathrm{d}t` },
    { n: 3, op: 'algebra', title: t('对 m 线性求解', 'Solve linearly for m'),
      latex: String.raw`\boldsymbol{m}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{d}` },
    { n: 4, op: 'result', title: t('对质心位置与时间做网格搜索', 'Grid-search over centroid location and time'),
      latex: String.raw`\left(\hat{\boldsymbol{x}}_c,\hat\tau\right)=\arg\min_{\boldsymbol{x}_c,\tau}J\left(\boldsymbol{x}_c,\tau\right)` },
  ],
  links: {
    upstream: [{ id: 'moment-tensor-definition', note: t('被反演的对象', 'The object being inverted for') }],
    downstream: [{ id: 'dc-iso-clvd-decomposition', note: t('解出来之后的物理解释', 'Physical interpretation after inversion') }],
  },
  refs: [{ text: 'Dziewonski, Chou & Woodhouse (1981), J. Geophys. Res., 86' }],
}

export default centroidMomentTensor
