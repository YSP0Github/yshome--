import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-damped-harmonic-oscillator */
const physDampedHarmonicOscillator: FormulaCard = {
  id: 'phys-damped-harmonic-oscillator',
  name: t('阻尼振动', 'Damped Harmonic Oscillation'),
  aliases: { zh: ['欠阻尼', '衰减振动'], en: ['damped oscillation', 'underdamped decay'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: t('阻尼振动 欠阻尼 振幅指数衰减 阻尼系数', 'damped oscillation underdamped exponential decay damping coefficient'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`x(t)=A e^{-\gamma t}\cos(\omega_d t+\varphi),\qquad \omega_d=\sqrt{\omega_0^{2}-\gamma^{2}}`,
    variants: [
      { name: t('三种状态', 'three regimes'), latex: String.raw`\gamma<\omega_0\ \text{欠阻尼};\quad \gamma=\omega_0\ \text{临界};\quad \gamma>\omega_0\ \text{过阻尼}` },
    ],
  },
  meaning: t(
    '真实振子总会受摩擦/空气阻力，振幅随时间按指数 e^{-γt} 衰减，同时频率略微变慢。阻尼很小时振很久才停（欠阻尼）；阻尼适中时最快回到平衡位置而不晃（临界阻尼，门的液压合页就是它）；阻尼过大则缓慢爬回、完全不振（过阻尼）。',
    'Every real oscillator suffers friction or drag, so the amplitude decays exponentially as e^{−γt} while the frequency slows slightly. Light damping rings a long time (underdamped); moderate damping settles fastest without overshoot (critical damping, as in a hydraulic door closer); heavy damping crawls back without oscillating (overdamped).',
  ),
  symbols: [
    { sym: 'A', name: t('初始振幅', 'initial amplitude'), unit: 'm' },
    { sym: '\\gamma', name: t('阻尼系数', 'damping coefficient'), unit: 's⁻¹' },
    { sym: '\\omega_0', name: t('固有角频率', 'natural angular frequency'), unit: 'rad/s' },
    { sym: '\\omega_d', name: t('有阻尼角频率', 'damped angular frequency'), unit: 'rad/s' },
  ],
  conditions: {
    applies: [t('黏性阻尼下的自由振子', 'Free oscillator with viscous damping')],
    assumes: [t('欠阻尼 regime', 'Underdamped regime')],
    breaks: [t('干摩擦阻尼形式不同', 'Coulomb friction has a different decay law')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('运动方程含阻尼项', 'Equation with damping term'), latex: String.raw`m\ddot{x}+b\dot{x}+kx=0` },
    { n: 2, op: 'algebra', title: t('写成标准形式', 'Rewrite in standard form'), latex: String.raw`\ddot{x}+2\gamma\dot{x}+\omega_0^{2}x=0` },
    { n: 3, op: 'result', title: t('欠阻尼解', 'Underdamped solution'), latex: String.raw`x=A e^{-\gamma t}\cos(\omega_d t+\varphi)` },
  ],
  links: {
    upstream: [{ id: 'phys-simple-harmonic-motion' }],
    downstream: [{ id: 'phys-forced-oscillation-resonance' }],
    seealso: [{ id: 'damping-ratio' }],
  },
}

export default physDampedHarmonicOscillator
