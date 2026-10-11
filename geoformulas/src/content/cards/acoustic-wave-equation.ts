import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** acoustic-wave-equation */
const acousticWaveEquation: FormulaCard = {
  id: 'acoustic-wave-equation',
  name: t('声波方程', 'The Acoustic Wave Equation'),
  aliases: { zh: ['标量波动方程'], en: ['acoustic wave equation', 'scalar wave equation'] },
  node: 'S1.4',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.EXPL'],
    quantity: ['Q.VEL'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\nabla^{2}p-\frac{1}{v^{2}}\frac{\partial^{2}p}{\partial t^{2}}=0`,
    variants: [
      { name: t('含源项的形式', 'Form with a source term'), latex: String.raw`\nabla^{2}p-\frac{1}{v^{2}}\frac{\partial^{2}p}{\partial t^{2}}=-s(\boldsymbol{x},t)` },
      { name: t('频域（Helmholtz）形式', 'Frequency-domain (Helmholtz) form'), latex: String.raw`\nabla^{2}P+k^{2}P=0,\qquad k=\frac{\omega}{v}` },
      { name: t('变密度形式', 'Variable-density form'), latex: String.raw`\nabla\cdot\left(\frac{1}{\rho}\nabla p\right)-\frac{1}{\rho v^{2}}\frac{\partial^{2}p}{\partial t^{2}}=0` },
    ],
  },
  meaning: t(
    '这是全站最简的波动方程：忽略 S 波与转换波，只追踪压力场。反射地震勘探的绝大多数正演、偏移、反演都建立在它之上 —— 因为在处理 P 波数据时它够用，而计算量只有弹性方程的三分之一。',
    'The simplest wave equation in the whole site: it ignores S waves and converted phases and tracks only the pressure field. Most forward modelling, migration and inversion in reflection seismology rest on it, because it suffices for P-wave data while costing about a third of the elastic equations.',
  ),
  symbols: [
    { sym: 'p', name: t('压力场（声压）', 'pressure field'), unit: 'Pa' },
    { sym: 'v', name: t('声波速度', 'acoustic velocity'), unit: 'm/s' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: 'k', name: t('波数 ω/v', 'wavenumber ω/v'), unit: 'rad/m' },
  ],
  conditions: {
    applies: [t('流体介质或只关心 P 波的固体近似', 'Fluid media, or solids where only P waves matter')],
    assumes: [t('小振幅、线性、无衰减', 'Small amplitude, linear, lossless')],
    breaks: [t('涉及转换波、S 波、各向异性时必须用弹性方程', 'Converted waves, S waves and anisotropy require the elastic equations')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('运动方程（Euler）', 'Equation of motion (Euler)'),
      latex: String.raw`\rho\frac{\partial \boldsymbol{v}}{\partial t}=-\nabla p` },
    { n: 2, op: 'physics', title: t('本构关系（体积模量）', 'Constitutive relation (bulk modulus)'),
      latex: String.raw`p=-K\,\nabla\cdot\boldsymbol{u}\;\Longrightarrow\; \frac{\partial p}{\partial t}=-K\nabla\cdot\boldsymbol{v}` },
    { n: 3, op: 'substitute', title: t('消去速度场 v', 'Eliminate the velocity field'),
      latex: String.raw`\frac{\partial^{2}p}{\partial t^{2}}=-K\nabla\cdot\frac{\partial\boldsymbol{v}}{\partial t}=K\nabla\cdot\left(\frac{1}{\rho}\nabla p\right)` },
    { n: 4, op: 'result', title: t('均匀密度下化简', 'Simplify for uniform density'),
      latex: String.raw`\frac{\partial^{2}p}{\partial t^{2}}=\frac{K}{\rho}\nabla^{2}p=v^{2}\nabla^{2}p,\qquad v=\sqrt{\frac{K}{\rho}}` },
  ],
  links: {
    upstream: [{ id: 'bulk-modulus-lame', note: t('v = √(K/ρ) 的来由', 'Where v = √(K/ρ) comes from') }],
    seealso: [{ id: 'helmholtz-green-function', note: t('它的频域 Green 函数', 'Its frequency-domain Green function') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.1' }],
}

export default acousticWaveEquation
