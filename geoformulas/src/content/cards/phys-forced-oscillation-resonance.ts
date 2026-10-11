import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-forced-oscillation-resonance */
const physForcedOscillationResonance: FormulaCard = {
  id: 'phys-forced-oscillation-resonance',
  name: t('受迫振动与共振', 'Forced Oscillation and Resonance'),
  aliases: { zh: ['共振', '受迫振动'], en: ['forced oscillation', 'resonance'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: t('受迫振动 共振 驱动力 共振峰 振幅最大', 'forced oscillation resonance driving frequency peak amplitude'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`A=\frac{F_0/m}{\sqrt{(\omega_0^{2}-\omega^{2})^{2}+(2\gamma\omega)^{2}}}`,
    variants: [
      { name: t('共振条件（弱阻尼）', 'resonance condition (weak damping)'), latex: String.raw`\omega\approx\omega_0\;\Rightarrow\; A_{\max}=\dfrac{F_0}{2\gamma m\omega_0}` },
    ],
  },
  meaning: t(
    '周期性外力持续推一个振子，振子最终会以驱动力的频率振动。当驱动频率接近固有频率 ω₀ 时，振幅急剧增大——这就是共振。荡秋千时顺着节奏推会越荡越高就是共振；但桥梁、机器怕共振，因为振幅过大可致破坏（塔科马海峡桥事故）。阻尼越小，共振峰越尖越高。',
    'A periodic drive makes an oscillator eventually vibrate at the drive frequency. When the drive frequency nears the natural frequency ω₀, the amplitude swells sharply — resonance. Pushing a swing in rhythm makes it go higher; but bridges and machines fear resonance, because huge amplitudes can destroy them (Tacoma Narrows). The lighter the damping, the sharper and higher the resonance peak.',
  ),
  symbols: [
    { sym: 'A', name: t('稳态振幅', 'steady-state amplitude'), unit: 'm' },
    { sym: 'F_0', name: t('驱动力幅值', 'drive-force amplitude'), unit: 'N' },
    { sym: '\\omega', name: t('驱动频率', 'drive frequency'), unit: 'rad/s' },
    { sym: '\\omega_0', name: t('固有频率', 'natural frequency'), unit: 'rad/s' },
    { sym: '\\gamma', name: t('阻尼系数', 'damping coefficient'), unit: 's⁻¹' },
  ],
  conditions: {
    applies: [t('线性振子受周期外力', 'Linear oscillator under a periodic drive')],
    assumes: [t('稳态、已达稳态响应', 'Steady-state response reached')],
    breaks: [t('非线性振子共振峰会偏移', 'Nonlinear oscillators shift the resonance peak')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('含驱动力的运动方程', 'Equation with a drive force'), latex: String.raw`m\ddot{x}+b\dot{x}+kx=F_0\cos\omega t` },
    { n: 2, op: 'algebra', title: t('求稳态解振幅', 'Steady-state solution amplitude'), latex: String.raw`A=\dfrac{F_0/m}{\sqrt{(\omega_0^{2}-\omega^{2})^{2}+(2\gamma\omega)^{2}}}` },
    { n: 3, op: 'identity', title: t('分母最小时振幅最大', 'Minimum denominator gives max amplitude'), latex: String.raw`\omega\approx\omega_0\;\Rightarrow\;\text{共振}` },
  ],
  links: {
    upstream: [{ id: 'phys-damped-harmonic-oscillator' }],
    seealso: [{ id: 'seismometer-frequency-response' }],
  },
}

export default physForcedOscillationResonance
