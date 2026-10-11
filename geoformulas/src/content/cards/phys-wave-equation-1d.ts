import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-wave-equation-1d */
const physWaveEquation1d: FormulaCard = {
  id: 'phys-wave-equation-1d',
  name: t('一维波动方程', 'One-Dimensional Wave Equation'),
  aliases: { zh: ['波动方程', '∂²y/∂t²=v²∂²y/∂x²'], en: ['wave equation', 'd’Alembert equation'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.AMP', 'Q.VEL'],
    keywords: t('波动方程 二阶偏导 波速 行波 弦', 'wave equation second derivative travelling wave string'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\frac{\partial^{2} y}{\partial t^{2}}=v^{2}\frac{\partial^{2} y}{\partial x^{2}}`,
    variants: [
      { name: t('通解（行波）', 'general solution (travelling waves)'), latex: String.raw`y(x,t)=f(x-vt)+g(x+vt)` },
      { name: t('简谐波解', 'harmonic solution'), latex: String.raw`y=A\cos(kx-\omega t),\quad \omega=vk` },
    ],
  },
  meaning: t(
    '波动方程是描述所有波（绳波、声波、光波）共同骨架的二阶偏微分方程：对时间的二阶导数等于对空间二阶导数乘以波速平方 v²。它的解是任意形状的波形以速度 v 左右传播——这就是「波」的本质。不同介质只改变 v，方程本身不变。',
    'The wave equation is the second-order PDE that all waves share — string, sound, light: the second time derivative equals the second space derivative times v². Its solutions are arbitrary waveforms travelling left or right at speed v — that is what a wave is. Different media only change v; the equation itself is universal.',
  ),
  symbols: [
    { sym: 'y(x,t)', name: t('位移', 'displacement'), unit: 'm' },
    { sym: 'v', name: t('波速', 'wave speed'), unit: 'm/s' },
    { sym: 'x,t', name: t('位置、时间', 'position and time'), unit: 'm, s' },
  ],
  conditions: {
    applies: [t('线性、无色散的一维波', 'Linear, dispersionless 1-D waves')],
    assumes: [t('小振幅、连续介质', 'Small amplitude, continuous medium')],
    breaks: [t('色散介质中 v 依赖频率', 'Dispersive media make v frequency-dependent')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('对弦元列 Newton 第二定律', 'Apply Newton II to a string element'), latex: String.raw`\mu\,\mathrm{d}x\,\dfrac{\partial^{2}y}{\partial t^{2}}=T\,\dfrac{\partial^{2}y}{\partial x^{2}}\mathrm{d}x` },
    { n: 2, op: 'algebra', title: t('约去 dx 并定义 v²=T/μ', 'Cancel dx and define v² = T/μ'), latex: String.raw`\dfrac{\partial^{2}y}{\partial t^{2}}=\dfrac{T}{\mu}\dfrac{\partial^{2}y}{\partial x^{2}}=v^{2}\dfrac{\partial^{2}y}{\partial x^{2}}` },
  ],
  links: {
    downstream: [{ id: 'phys-string-wave-speed' }, { id: 'phys-wave-speed-relation' }],
    seealso: [{ id: 'dalembert-solution' }, { id: 'acoustic-wave-equation' }],
  },
}

export default physWaveEquation1d
