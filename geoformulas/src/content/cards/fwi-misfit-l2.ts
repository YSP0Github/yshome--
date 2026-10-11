import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** fwi-misfit-l2 */
const fwiMisfitL2: FormulaCard = {
  id: 'fwi-misfit-l2',
  name: t('全波形反演的目标函数与周期跳跃', 'The FWI Objective Function & Cycle Skipping'),
  aliases: { zh: ['FWI 目标函数', '周期跳跃', 'L2  misfit'], en: ['FWI objective', 'cycle skipping', 'L2 misfit'] },
  node: 'S10.4',
  tags: {
    math: ['MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.INV'],
    quantity: ['Q.VEL', 'Q.AMP'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\chi(\mathbf{m}) = \frac{1}{2}\sum_{s,r}\int_0^{T}\|d_{\text{obs}}(\mathbf{x}_r,t;\mathbf{x}_s) - d_{\text{syn}}(\mathbf{x}_r,t;\mathbf{x}_s;\mathbf{m})\|^{2}\,\mathrm{d}t`,
    variants: [
      { name: t('梯度（伴随状态法）', 'Gradient (adjoint-state method)'), latex: String.raw`\frac{\partial\chi}{\partial m_i} = -\int_0^{T}\frac{\partial^{2}u}{\partial t^{2}}\cdot\lambda\,\mathrm{d}t,\qquad \lambda = \text{伴随波场}` },
      { name: t('周期跳跃的判据', 'Criterion for cycle skipping'), latex: String.raw`|\Delta t| > \frac{T_{\text{dom}}}{2} \Longrightarrow \text{梯度指向错误的方向}` },
      { name: t('多尺度策略（从低频到高频）', 'Multiscale strategy (low to high frequency)'), latex: String.raw`f \in [f_1, f_2] \to [f_2, f_3] \to \cdots,\quad \text{起始 } f_1 \lesssim 3\ \text{Hz}` },
      { name: t('替代目标函数（克服周期跳跃）', 'Alternative objectives to defeat cycle skipping'), latex: String.raw`\chi_{\text{wi}} = \frac{1}{2}\left\|\mathcal{W}\{d_{\text{obs}}\}-\mathcal{W}\{d_{\text{syn}}\}\right\|^{2}\ \ (\text{最优输运、互相关时移})` },
    ],
  },
  meaning: t(
    '全波形反演直接用整段波形（而不只是到时）来反演速度结构，因此分辨率最高。但它的目标函数高度非凸：如果初始模型的预测波与观测波错开了半个周期以上，最小二乘的梯度会把模型推向错误的方向，反演收敛到一个假解 —— 这就是臭名昭著的「周期跳跃」。标准的应对是从低频开始逐级加频，低频波长长、不容易错开半个周期；也可以用最优输运、包络差等对相位不敏感的目标函数。',
    'Full-waveform inversion uses the entire waveform (not just arrival times) to invert velocity structure, so it has the highest resolution. But its objective is highly non-convex: if the predicted and observed waveforms are offset by more than half a period, the least-squares gradient pushes the model in the wrong direction and the inversion converges to a false solution — the notorious "cycle skipping". The standard remedy is multiscale inversion from low to high frequency, since long wavelengths rarely slip by half a period; phase-insensitive objectives such as optimal transport or envelope differences also help.',
  ),
  symbols: [
    { sym: '\\chi', name: t('目标函数（失配）', 'objective function (misfit)'), unit: '—' },
    { sym: 'd_{\\text{obs}}, d_{\\text{syn}}', name: t('观测与合成地震记录', 'observed and synthetic seismograms'), unit: '—' },
    { sym: '\\lambda', name: t('伴随波场（反向传播）', 'adjoint wavefield (back-propagated)'), unit: '—' },
    { sym: '\\Delta t', name: t('预测与观测的到时误差', 'arrival-time error between prediction and observation'), unit: 's' },
    { sym: 'T_{\\text{dom}}', name: t('主周期', 'dominant period'), unit: 's' },
  ],
  conditions: {
    applies: [t('高分辨率速度建模、盐体成像、浅层工程勘察', 'High-resolution velocity model building, salt imaging, shallow engineering surveys')],
    assumes: [t('初始模型足够准确（误差小于半波长）', 'The starting model is accurate enough (error below half a wavelength)')],
    breaks: [t('缺少低频（< 3 Hz）数据时几乎必然周期跳跃', 'Cycle skipping is almost inevitable without data below about 3 Hz'), t('强衰减、各向异性与弹性效应未建模时会引入假结构', 'Unmodelled attenuation, anisotropy and elastic effects introduce artefacts')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义波形残差', 'Define the waveform residual'), latex: String.raw`\delta d = d_{\text{syn}}-d_{\text{obs}}` },
    { n: 2, op: 'physics', title: t('最小二乘目标函数', 'Least-squares objective'), latex: String.raw`\chi = \frac{1}{2}\|\delta d\|^{2}` },
    { n: 3, op: 'identity', title: t('一阶变分', 'First variation'), latex: String.raw`\delta\chi = \left\langle \frac{\partial d_{\text{syn}}}{\partial\mathbf{m}}\delta\mathbf{m},\ \delta d\right\rangle` },
    { n: 4, op: 'substitute', title: t('用伴随状态法避免显式计算 Jacobian', 'Use the adjoint-state method to avoid forming the Jacobian'), latex: String.raw`\frac{\partial\chi}{\partial m_i} = -\int_0^T \ddot{u}\,\lambda\,\mathrm{d}t` },
    { n: 5, op: 'result', title: t('若 Δt > T_dom/2，残差与正确方向反号，梯度错误', 'If Δt > T_dom/2 the residual has the wrong sign and the gradient is wrong'), latex: String.raw`\Delta t > \frac{T_{\text{dom}}}{2} \Longrightarrow \text{周期跳跃}` },
  ],
  viz: [
    {
      id: 'cycle-skip',
      level: 'V2',
      title: t('周期跳跃：到时误差如何翻转梯度的符号', 'Cycle skipping: how timing error flips the sign of the gradient'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('振幅', 'amplitude'),
      controls: [
        { id: 'dt', label: t('到时误差 Δt (s)', 'arrival-time error Δt (s)'), min: -1.2, max: 1.2, step: 0.01, value: 0.15 },
        { id: 'f', label: t('主频 f (Hz)', 'dominant frequency f (Hz)'), min: 0.5, max: 12, step: 0.1, value: 2 },
      ],
      note: t('蓝色为观测、红色为合成。当 Δt 小于半个周期时残差（灰）与合成波同相，梯度把模型推向正确方向；一旦 Δt 超过半个周期，残差反相，梯度就会把模型推得更远 —— 反演从此走向假解。降低频率（拉长周期）能安全地容忍更大的到时误差。', 'Blue is observed, red synthetic. When Δt is below half a period the residual (grey) is in phase with the synthetic and the gradient moves the model correctly; once Δt exceeds half a period the residual is antiphase and the gradient pushes the model further away — the inversion then heads for a false solution. Lowering the frequency (lengthening the period) safely tolerates larger timing errors.'),
      compute: (p) => {
        const dt = p['dt'], f = p['f']
        const T = 1 / f
        const obs: Array<[number, number]> = []
        const syn: Array<[number, number]> = []
        const res: Array<[number, number]> = []
        const corr: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const t = -1 + (i / 600) * 6
          const w = (x: number) => Math.exp(-((x * x) / (0.4 * T * T))) * Math.cos((2 * Math.PI * (x)) / T)
          const o = w(t)
          const s = w(t - dt)
          obs.push([t, o])
          syn.push([t, s])
          res.push([t, s - o])
          corr.push([t, o * s])
        }
        const integ = corr.reduce((s, q, i) => (i === 0 ? 0 : s + q[1] * (6 / 600)), 0)
        return [
          { label: t('观测', 'observed'), color: '#185FA5', points: obs },
          { label: t('合成', 'synthetic'), color: '#993C1D', points: syn },
          { label: t('残差（梯度方向）', 'residual (gradient direction)'), color: '#888780', points: res },
          { label: t('相关值 ' + integ.toFixed(3), 'correlation ' + integ.toFixed(3)), color: '#0F6E56', points: [[Math.abs(dt) > T / 2 ? 4.4 : 4.4, integ]] },
        ]
      },
    },
    {
      id: 'skip-bound',
      level: 'V1',
      title: t('各频率下可容忍的最大到时误差', 'Maximum tolerable timing error per frequency'),
      xlabel: t('主频 f (Hz)', 'dominant frequency f (Hz)'),
      ylabel: t('最大可容忍 Δt (s)', 'maximum tolerable Δt (s)'),
      controls: [],
      note: t('可容忍误差 = T/2 = 1/(2f)。2 Hz 时可容忍 0.25 s，10 Hz 时只剩 0.05 s —— 这就是 FWI 必须按频率从低到高逐级进行的原因：每一级都为下一级提供足够准确的起始模型。', 'Tolerable error = T/2 = 1/(2f). At 2 Hz it is 0.25 s; at 10 Hz only 0.05 s — which is why FWI must proceed frequency by frequency from low to high: each stage provides a sufficiently accurate starting model for the next.'),
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = 0.5 + (i / 200) * 14.5
          pts.push([f, 1 / (2 * f)])
        }
        return [{ label: t('T/2 = 1/(2f)', 'T/2 = 1/(2f)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('是否会发生周期跳跃', 'Will cycle skipping occur'),
    input: t('初始模型到时误差 0.2 s，主频 3 Hz', 'Starting-model timing error 0.2 s, dominant frequency 3 Hz'),
    steps: [
      t('T = 1/3 = 0.333 s，T/2 = 0.167 s', 'T = 1/3 = 0.333 s, T/2 = 0.167 s'),
      t('0.2 > 0.167 → 会发生周期跳跃', '0.2 > 0.167 → cycle skipping will occur'),
      t('改用 1.5 Hz 起步：T/2 = 0.333 s > 0.2 s，安全', 'Start at 1.5 Hz instead: T/2 = 0.333 s > 0.2 s, safe'),
    ],
    output: t('必须先从 1.5 Hz 以下的低频开始反演', 'The inversion must start from frequencies below 1.5 Hz'),
  },
  links: {
    upstream: [
      { id: 'fwi-adjoint-gradient', note: t('伴随梯度是本卡目标函数的导数', 'The adjoint gradient is the derivative of the objective here') },
      { id: 'least-squares-normal-equations', note: t('FWI 是非线性最小二乘', 'FWI is nonlinear least squares') },
    ],
    downstream: [{ id: 'ray-path-perturbation-frechet', note: t('线性化后的核与层析一致', 'The linearised kernel matches tomography') }],
    seealso: [{ id: 'rayleigh-hv-ellipticity', note: t('频散反演是稳健的替代方案', 'Dispersion inversion is a robust alternative') }],
  },
  refs: [{ text: 'Virieux & Operto (2009), An overview of full-waveform inversion in exploration geophysics, Geophysics 74, WCC1–WCC26' }],
}

export default fwiMisfitL2
