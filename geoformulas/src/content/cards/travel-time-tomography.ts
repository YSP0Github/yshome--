import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** travel-time-tomography */
const travelTimeTomography: FormulaCard = {
  id: 'travel-time-tomography',
  name: t('走时层析成像', 'Travel-time Tomography'),
  aliases: { zh: ['层析成像', '走时反演'], en: ['travel-time tomography', 'seismic tomography'] },
  node: 'S10.2',
  tags: {
    math: ['MATH.LINALG', 'MATH.APPROX', 'MATH.DIFF'],
    method: ['METH.INV', 'METH.STRUCT'],
    quantity: ['Q.VEL', 'Q.TIME'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\delta t_i=\int_{\text{ray}_i}\delta u(\boldsymbol{x})\,\mathrm{d}s\;\approx\;\sum_{j}G_{ij}\,\delta u_j`,
    variants: [
      { name: t('矩阵形式', 'Matrix form'), latex: String.raw`\boldsymbol{\delta t}=\mathbf{G}\,\boldsymbol{\delta u}` },
      { name: t('阻尼最小二乘解', 'Damped least-squares solution'), latex: String.raw`\delta\hat{\boldsymbol{u}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{D}^{\mathsf{T}}\mathbf{D}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{\delta t}` },
      { name: t('核函数 G_ij 的含义', 'Meaning of the kernel G_ij'), latex: String.raw`G_{ij}=\text{第 }i\text{ 条射线在第 }j\text{ 个网格内的长度}` },
    ],
  },
  meaning: t(
    '层析成像把地球切成网格，用成千上万条射线的走时残差反推每个网格的慢度扰动。它的数学形式与医学 CT 完全相同 —— 区别只在于地震学里射线弯曲、覆盖极不均匀、噪声大，因此必须正则化。射线覆盖的稀疏程度直接决定分辨率：太平洋中部的上地幔与欧洲下方的深部，成像质量能差一个量级。',
    'Tomography cuts the Earth into cells and uses travel-time residuals from thousands of rays to recover the slowness perturbation in each cell. The mathematics is identical to medical CT; the difference is that in seismology rays bend, coverage is extremely uneven and noise is large, so regularisation is mandatory. Ray coverage directly determines resolution: the upper mantle beneath the central Pacific and the deep mantle beneath Europe differ in image quality by an order of magnitude.',
  ),
  symbols: [
    { sym: '\\delta t_i', name: t('第 i 条射线的走时残差', 'travel-time residual of ray i'), unit: 's', typical: '−5 – 5' },
    { sym: '\\delta u', name: t('慢度扰动', 'slowness perturbation'), unit: 's/km' },
    { sym: 'G_{ij}', name: t('射线长度核', 'ray-length kernel'), unit: 'km' },
    { sym: '\\varepsilon', name: t('阻尼因子', 'damping factor'), unit: '无量纲', typical: '0.1 – 10' },
    { sym: '\\mathbf{D}', name: t('正则化算子（二阶差分或梯度）', 'regularisation operator (second difference or gradient)'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('射线理论成立（周期不太长）、扰动较小', 'Ray theory holds (periods not too long) and perturbations are small')],
    assumes: [
      t('线性化：射线路径不随扰动改变', 'Linearisation: ray paths do not change with the perturbation'),
      t('已校正震源参数、高程、椭率', 'Source parameters, elevation and ellipticity have been corrected'),
    ],
    breaks: [t('扰动超过约 10% 时需迭代重算射线路径', 'For perturbations beyond about 10%, ray paths must be recomputed iteratively')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('走时是慢度的线积分', 'Travel time is a line integral of slowness'),
      latex: String.raw`T=\int_{\text{ray}}u(\boldsymbol{x})\,\mathrm{d}s` },
    { n: 2, op: 'taylor', title: t('取一阶扰动', 'Take the first-order perturbation'),
      latex: String.raw`\delta T=\int_{\text{ray}}\delta u(\boldsymbol{x})\,\mathrm{d}s` },
    { n: 3, op: 'algebra', title: t('把介质离散成网格', 'Discretise the medium into cells'),
      latex: String.raw`\delta u(\boldsymbol{x})=\sum_j\delta u_j\,\phi_j(\boldsymbol{x})\;\Longrightarrow\; \delta T_i=\sum_jG_{ij}\delta u_j` },
    { n: 4, op: 'identity', title: t('射线长度核', 'The ray-length kernel'),
      latex: String.raw`G_{ij}=\int_{\text{ray}_i}\phi_j(\boldsymbol{x})\,\mathrm{d}s` },
    { n: 5, op: 'result', title: t('求解大规模稀疏线性系统', 'Solve the large sparse linear system'),
      latex: String.raw`\delta\hat{\boldsymbol{u}}=\left(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\varepsilon^{2}\mathbf{D}^{\mathsf{T}}\mathbf{D}\right)^{-1}\mathbf{G}^{\mathsf{T}}\boldsymbol{\delta t}` },
  ],
  links: {
    upstream: [{ id: 'damped-least-squares', note: t('求解所用的正则化工具', 'The regularisation tool used to solve it') }],
    seealso: [{ id: 'resolution-matrix', note: t('解出来之后如何评估可信度', 'How to assess confidence after solving') }],
  },
  refs: [{ text: 'Nolet, Seismic Tomography' }, { text: 'van der Hilst et al. (1997), Rev. Geophys., 35' }],
}

export default travelTimeTomography
