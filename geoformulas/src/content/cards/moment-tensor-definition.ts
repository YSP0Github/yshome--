import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** moment-tensor-definition */
const momentTensorDefinition: FormulaCard = {
  id: 'moment-tensor-definition',
  name: t('矩张量', 'The Moment Tensor'),
  aliases: { zh: ['地震矩张量'], en: ['moment tensor', 'seismic moment tensor'] },
  node: 'S4.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.LINALG'],
    method: ['METH.TELE', 'METH.INV'],
    quantity: ['Q.TENSOR', 'Q.SOURCE'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`M_{ij}=\mu\,A\left(\hat{\nu}_i\,\bar{D}_j+\hat{\nu}_j\,\bar{D}_i\right)`,
    variants: [
      { name: t('远场位移的矩张量表示', 'Far-field displacement in terms of the moment tensor'), latex: String.raw`u_i(\boldsymbol{x},t)=\frac{1}{4\pi\rho c^{3}r}\,\gamma_i\,M_{ij}\,\gamma_j\,\dot{S}\!\left(t-\frac{r}{c}\right)` },
      { name: t('矩阵形式', 'Matrix form'), latex: String.raw`\mathbf{M}=\begin{bmatrix}M_{11}&M_{12}&M_{13}\\ M_{21}&M_{22}&M_{23}\\ M_{31}&M_{32}&M_{33}\end{bmatrix}` },
    ],
  },
  meaning: t(
    '矩张量把「震源」从「一个数字」升级成「一个对称二阶张量」：它同时编码了断层的取向、滑动方向、以及是否伴随体积变化。纯构造地震的矩张量是纯双力偶（迹为零），而火山、塌陷、流体注入等会产生各向同性分量 —— 矩张量反演正是靠这个区别来识别震源类型。',
    'The moment tensor upgrades the source from a single number to a symmetric second-rank tensor: it encodes fault orientation, slip direction and whether volume change is involved. Pure tectonic earthquakes give a pure double couple (zero trace), whereas volcanic, collapse and fluid-injection sources carry an isotropic component. Moment-tensor inversion identifies source type precisely through this distinction.',
  ),
  symbols: [
    { sym: 'M_{ij}', name: t('矩张量分量', 'moment tensor component'), unit: 'N·m' },
    { sym: '\\hat{\\nu}', name: t('断层面法向单位矢量', 'unit normal to the fault plane'), unit: '无量纲' },
    { sym: '\\bar{\\boldsymbol{D}}', name: t('平均滑移矢量', 'average slip vector'), unit: 'm' },
    { sym: '\\gamma_i', name: t('射线方向余弦', 'direction cosine of the ray'), unit: '无量纲' },
    { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa' },
  ],
  conditions: {
    applies: [t('点源近似成立（观测距离远大于震源尺度）', 'Under the point-source approximation (observation distance much larger than source dimension)')],
    assumes: [
      t('远场、均匀介质、无衰减', 'Far field, uniform medium, no attenuation'),
      t('矩张量对称 M_ij = M_ji（角动量守恒）', 'The moment tensor is symmetric, M_ij = M_ji (angular momentum conservation)'),
    ],
    breaks: [t('近场或有限尺度震源需积分整个破裂面', 'Near field or finite sources require integration over the rupture surface')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('断层两侧的位移跃变', 'Displacement jump across the fault'),
      latex: String.raw`\left[u_i\right]=u_i^{+}-u_i^{-}=\bar{D}_i` },
    { n: 2, op: 'physics', title: t('等价于体力偶极', 'Equivalent to a body-force dipole'),
      latex: String.raw`f_i(\boldsymbol{x},t)=-M_{ij}\,\frac{\partial}{\partial x_j}\,\delta(\boldsymbol{x})\,S(t)` },
    { n: 3, op: 'identity', title: t('用表示定理写出位移', 'Write the displacement via the representation theorem'),
      latex: String.raw`u_i=\int G_{ij}\,f_j\,\mathrm{d}V` },
    { n: 4, op: 'substitute', title: t('代入 Green 函数', 'Substitute the Green function'),
      latex: String.raw`G_{ij}=\frac{1}{4\pi\rho c^{2}r}\,\gamma_i\gamma_j\,\delta\!\left(t-\frac{r}{c}\right)` },
    { n: 5, op: 'result', title: t('得到远场位移', 'The far-field displacement'),
      latex: String.raw`u_i(\boldsymbol{x},t)=\frac{\gamma_i M_{ij}\gamma_j}{4\pi\rho c^{3}r}\,\dot{S}\!\left(t-\frac{r}{c}\right)`,
      note: t('注意是对震源时间函数求导 —— 远场位移正比于滑动速率而非滑动量。', 'Note the time derivative of the source time function: far-field displacement is proportional to slip rate, not slip.') },
  ],
  links: {
    upstream: [{ id: 'seismic-moment', note: t('矩张量的模给出 M₀', 'The norm of the tensor gives M₀') }],
    downstream: [{ id: 'dc-iso-clvd-decomposition', note: t('把矩张量拆成物理分量', 'Splits the tensor into physical components') }],
    seealso: [{ id: 'strain-tensor', note: t('同为对称二阶张量', 'Also a symmetric second-rank tensor') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §3.3' }],
}

export default momentTensorDefinition
