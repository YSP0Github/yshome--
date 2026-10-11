import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-mass-spring-oscillator */
const physMassSpringOscillator: FormulaCard = {
  id: 'phys-mass-spring-oscillator',
  name: t('弹簧振子周期', 'Period of a Mass–Spring Oscillator'),
  aliases: { zh: ['弹簧振子 T=2π√(m/k)'], en: ['mass-spring oscillator', 'T = 2π√(m/k)'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.FREQ', 'Q.TIME'],
    keywords: t('弹簧振子 周期 质量 劲度系数 等时性', 'mass spring period stiffness mass isochronism'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`T=2\pi\sqrt{\frac{m}{k}},\qquad f=\frac{1}{2\pi}\sqrt{\frac{k}{m}}`,
  },
  meaning: t(
    '弹簧振子的周期只由质量 m 和劲度系数 k 决定，与振幅无关（等时性）。质量越大、弹簧越软，振得越慢；这个周期是从「回复力 kx 与惯性 m 的较量」中自然出来的——回复力强则快，惯性大则慢。',
    'The period of a mass–spring oscillator depends only on mass m and stiffness k, not on amplitude (isochronism). Heavier mass or softer spring means slower oscillation; the period comes from the contest between restoring force kx and inertia m — strong restoring force speeds it up, large mass slows it down.',
  ),
  symbols: [
    { sym: 'T', name: t('周期', 'period'), unit: 's' },
    { sym: 'm', name: t('振子质量', 'oscillating mass'), unit: 'kg' },
    { sym: 'k', name: t('弹簧劲度系数', 'spring constant'), unit: 'N/m' },
  ],
  conditions: {
    applies: [t('水平或竖直弹簧、忽略弹簧质量', 'Horizontal or vertical spring, spring mass neglected')],
    assumes: [t('小振幅、无阻尼', 'Small amplitude, undamped')],
    breaks: [t('大振幅超出线性范围', 'Breaks beyond the linear range')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('运动方程 mẍ=-kx', 'Equation mẍ = −kx'), latex: String.raw`m\ddot{x}=-kx` },
    { n: 2, op: 'algebra', title: t('对比 ẍ+ω²x=0', 'Compare with ẍ + ω²x = 0'), latex: String.raw`\omega^{2}=\dfrac{k}{m}` },
    { n: 3, op: 'identity', title: t('T=2π/ω', 'Use T = 2π/ω'), latex: String.raw`T=\dfrac{2\pi}{\omega}=2\pi\sqrt{\dfrac{m}{k}}` },
  ],
  links: {
    upstream: [{ id: 'phys-simple-harmonic-motion' }, { id: 'phys-elastic-potential-energy' }],
    seealso: [{ id: 'phys-simple-pendulum' }],
  },
}

export default physMassSpringOscillator
