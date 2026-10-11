import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** fwi-adjoint-gradient */
const fwiAdjointGradient: FormulaCard = {
  id: 'fwi-adjoint-gradient',
  name: t('全波形反演的伴随梯度', 'The Adjoint Gradient of Full-waveform Inversion'),
  aliases: { zh: ['FWI', '伴随状态法'], en: ['full-waveform inversion', 'adjoint-state method', 'FWI gradient'] },
  node: 'S10.4',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR', 'MATH.LINALG'],
    method: ['METH.INV', 'METH.EXPL'],
    quantity: ['Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\frac{\partial J}{\partial m}=\int_0^{T}\frac{\partial^2 u^{\dagger}}{\partial t^{2}}\,\frac{1}{m^{2}}\,\frac{\partial u}{\partial t}\,\mathrm{d}t\qquad (m=\text{慢度模型})`,
    variants: [
      { name: t('目标函数', 'Objective function'), latex: String.raw`J=\frac{1}{2}\sum_s\sum_r\int\left(u_{\text{合成}}-d_{\text{观测}}\right)^{2}\mathrm{d}t` },
      { name: t('伴随波场由残差反传激发', 'The adjoint field is excited by back-propagating the residual'), latex: String.raw`\frac{1}{m^{2}}\nabla^{2}u^{\dagger}-\frac{\partial^{2}u^{\dagger}}{\partial t^{2}}=\delta u\,(\text{时间反转的残差})` },
      { name: t('更常用的零延迟互相关形式', 'The more common zero-lag cross-correlation form'), latex: String.raw`\frac{\partial J}{\partial m}\propto-\sum_s\int_0^T\dot{u}\,\dot{u}^{\dagger}\,\mathrm{d}t` },
    ],
  },
  meaning: t(
    'FWI 用完整波形（不只是走时）反演速度结构，分辨率可达波长量级。它的关键是伴随状态法：只需两次波场模拟（正传一次、把残差反传一次）就能算出全部模型参数的梯度，与参数个数无关 —— 这一点让上亿参数的三维反演成为可能。代价是极强的非线性（周期跳跃）和巨大的计算量。',
    'FWI inverts velocity structure from the complete waveform, not just travel times, reaching wavelength-scale resolution. Its key is the adjoint-state method: only two wavefield simulations (one forward, one back-propagation of the residual) give the gradient with respect to all model parameters, independent of their number. That is what makes 3D inversion with hundreds of millions of parameters feasible. The price is severe nonlinearity (cycle skipping) and enormous cost.',
  ),
  symbols: [
    { sym: 'J', name: t('波形失配目标函数', 'waveform misfit objective'), unit: '振幅平方 × 时间' },
    { sym: 'u,u^{\\dagger}', name: t('正向波场与伴随波场', 'forward and adjoint wavefields'), unit: '与位移同' },
    { sym: 'm', name: t('慢度模型参数', 'slowness model parameter'), unit: 's/m' },
    { sym: '\\delta u', name: t('合成与观测的波形残差', 'waveform residual between synthetic and observed'), unit: '与位移同' },
  ],
  conditions: {
    applies: [t('已知准确震源子波、具备低频与长偏移距数据', 'Accurate source wavelet known; low frequencies and long offsets available')],
    assumes: [
      t('初始模型足够好（预测走时误差 < 半个周期）', 'The starting model is good enough (predicted travel-time error below half a period)'),
      t('正演算子与实际物理一致', 'The forward operator matches the actual physics'),
    ],
    breaks: [t('初始模型差或缺少低频时会发生周期跳跃，梯度指向错误方向', 'With a poor starting model or missing low frequencies, cycle skipping occurs and the gradient points the wrong way')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义波形失配', 'Define the waveform misfit'),
      latex: String.raw`J=\frac12\|u(m)-d\|^{2}` },
    { n: 2, op: 'physics', title: t('波动方程作为约束', 'The wave equation as a constraint'),
      latex: String.raw`\frac{1}{m^{2}}\nabla^{2}u-\frac{\partial^{2}u}{\partial t^{2}}=f` },
    { n: 3, op: 'transform', title: t('引入拉格朗日乘子（伴随波场）', 'Introduce a Lagrange multiplier (the adjoint field)'),
      latex: String.raw`\mathcal{L}=J+\int u^{\dagger}\left(\frac{1}{m^{2}}\nabla^{2}u-\ddot{u}-f\right)` },
    { n: 4, op: 'algebra', title: t('对 m 求导，正传项消去', 'Differentiate with respect to m; forward terms cancel'),
      latex: String.raw`\frac{\partial J}{\partial m}=\int u^{\dagger}\,\frac{-2}{m^{3}}\nabla^{2}u\;\mathrm{d}t` },
    { n: 5, op: 'result', title: t('换成时间导数形式便于实现', 'Convert to a time-derivative form convenient for implementation'),
      latex: String.raw`\frac{\partial J}{\partial m}=\int_0^{T}\frac{\partial^{2}u^{\dagger}}{\partial t^{2}}\frac{1}{m^{2}}\frac{\partial u}{\partial t}\,\mathrm{d}t` },
  ],
  links: {
    upstream: [
      { id: 'bayesian-inversion', note: t('FWI 可以放进贝叶斯框架', 'FWI can be placed in a Bayesian framework') },
      { id: 'green-function-definition', note: t('伴随波场本质上是格林函数', 'The adjoint field is essentially a Green function') },
    ],
  },
  refs: [{ text: 'Tarantola (1984), Geophysics, 49' }, { text: 'Virieux & Operto (2009), Geophysics, 74' }],
}

export default fwiAdjointGradient
