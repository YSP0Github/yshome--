import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** absorption-band-q */
const absorptionBandQ: FormulaCard = {
  id: 'absorption-band-q',
  name: t('吸收带模型与 Q 的频率依赖', 'Absorption-band Models & Frequency Dependence of Q'),
  aliases: { zh: ['吸收带', '幂律 Q'], en: ['absorption band', 'power-law Q', 'frequency-dependent Q'] },
  node: 'S6.3',
  tags: {
    math: ['MATH.APPROX', 'MATH.COMPLEX', 'MATH.DIFF'],
    method: ['METH.ATTEN'],
    quantity: ['Q.AMP', 'Q.FREQ'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`Q^{-1}(\omega)=Q_m^{-1}\cdot\frac{2}{\pi}\arctan\!\left(\frac{\omega\tau_m}{Q_m}\cdot\frac{1}{1+\omega^{2}\tau_m^{2}}\cdot\left(\text{标准线性固体}\right)\right)`,
    variants: [
      { name: t('幂律形式（观测常用）', 'Power-law form (common observationally)'), latex: String.raw`Q(\omega)=Q_0\left(\frac{\omega}{\omega_0}\right)^{\alpha},\qquad 0\le\alpha\le1` },
      { name: t('对应的复模量', 'Corresponding complex modulus'), latex: String.raw`M(\omega)=M_0\left[1+\frac{2}{\pi Q}\ln\frac{\omega}{\omega_0}-\frac{i}{2Q}\right]` },
      { name: t('常数 Q 时的相速度频散', 'Phase-velocity dispersion for constant Q'), latex: String.raw`\frac{c(\omega_2)}{c(\omega_1)}=1+\frac{1}{\pi Q}\ln\frac{\omega_2}{\omega_1}` },
    ],
  },
  meaning: t(
    '严格来说 Q 不可能是常数：因果性（Kramers–Kronig）要求只要有衰减，速度就必须随频率变化。所谓「常数 Q」其实意味着速度以对数方式随频率缓慢增加 —— 这个频散量很小（Q = 100 时每十倍频程约 0.7%），但足以让远震体波的波形随传播距离逐渐变宽。',
    'Strictly, Q cannot be constant: causality (Kramers–Kronig) requires that any attenuation implies frequency-dependent velocity. A "constant Q" actually means velocity increases slowly and logarithmically with frequency — a small effect (about 0.7% per decade for Q = 100), but enough to broaden teleseismic body waveforms progressively with propagation distance.',
  ),
  symbols: [
    { sym: 'Q^{-1}(\\omega)', name: t('内禀衰减（损耗）', 'intrinsic attenuation (loss)'), unit: '无量纲' },
    { sym: '\\tau_m', name: t('松弛时间', 'relaxation time'), unit: 's' },
    { sym: '\\alpha', name: t('幂律指数', 'power-law exponent'), unit: '无量纲', typical: '0 – 0.5' },
    { sym: 'c(\\omega)', name: t('相速度', 'phase velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('宽频带衰减观测与波形正演中的 Q 建模', 'Modelling Q in broadband attenuation observations and waveform forward modelling')],
    assumes: [t('线性黏弹性、弛豫谱连续', 'Linear viscoelasticity with a continuous relaxation spectrum')],
    breaks: [t('在地震频带之外（超声实验室频率）外推需要谨慎', 'Extrapolation outside the seismic band (to ultrasonic laboratory frequencies) requires caution')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('标准线性固体的复模量', 'Complex modulus of the standard linear solid'),
      latex: String.raw`M(\omega)=M_R\frac{1+i\omega\tau_\sigma}{1+i\omega\tau_\varepsilon}` },
    { n: 2, op: 'algebra', title: t('分离实虚部', 'Separate real and imaginary parts'),
      latex: String.raw`\operatorname{Re}M=M_R\frac{1+\omega^{2}\tau_\sigma\tau_\varepsilon}{1+\omega^{2}\tau_\varepsilon^{2}},\qquad \operatorname{Im}M=M_R\frac{\omega\left(\tau_\sigma-\tau_\varepsilon\right)}{1+\omega^{2}\tau_\varepsilon^{2}}` },
    { n: 3, op: 'identity', title: t('Q⁻¹ = Im M / Re M', 'Q⁻¹ = Im M / Re M'),
      latex: String.raw`Q^{-1}(\omega)=\frac{\omega\left(\tau_\sigma-\tau_\varepsilon\right)}{1+\omega^{2}\tau_\sigma\tau_\varepsilon}` },
    { n: 4, op: 'result', title: t('常数 Q 时积分出速度频散', 'Integrate to get velocity dispersion for constant Q'),
      latex: String.raw`\frac{c(\omega_2)}{c(\omega_1)}=1+\frac{1}{\pi Q}\ln\frac{\omega_2}{\omega_1}` },
  ],
  viz: [
    {
      id: 'constant-q-dispersion',
      level: 'V1',
      title: t('常数 Q 下的速度频散', 'Velocity dispersion for constant Q'),
      xlabel: t('频率 (Hz)', 'frequency (Hz)'),
      ylabel: t('相速度相对变化 (%)', 'relative change in phase velocity (%)'),
      xScale: 'log',
      controls: [
        { id: 'Q', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 1000, step: 10, value: 100 },
      ],
      compute: (p) => {
        const Q = p['Q']
        const pts: Array<[number, number]> = []
        const f0 = 0.01
        for (let i = 0; i <= 200; i++) {
          const f = 0.001 * Math.pow(10, (i / 200) * 5)
          pts.push([f, (100 / (Math.PI * Q)) * Math.log(f / f0)])
        }
        return [{ label: t('Δc/c (%)', 'Δc/c (%)'), color: '#185FA5', points: pts }]
      },
      note: t('Q = 100 时每十倍频程约 0.73% —— 很小，但正是它让远震 P 波在传播中逐渐被"拉宽"。', 'For Q = 100 the change is about 0.73% per decade — small, yet exactly what progressively broadens teleseismic P waves as they propagate.'),
    },
  ],
  links: {
    upstream: [
      { id: 'kramers-kronig-dispersion', note: t('频散与衰减的因果联系', 'The causal link between dispersion and attenuation') },
      { id: 'quality-factor-q', note: t('Q 的定义', 'Definition of Q') },
    ],
  },
  refs: [{ text: 'Liu, Anderson & Kanamori (1976), Geophys. J. R. Astron. Soc., 47' }],
}

export default absorptionBandQ
