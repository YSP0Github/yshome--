import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** modphys-wavefunction-probability */
const modphysWavefunctionProbability: FormulaCard = {
  id: 'modphys-wavefunction-probability',
  name: t('波函数与概率密度（Born 诠释）', 'Wavefunction and Probability Density (Born Interpretation)'),
  aliases: { zh: ['波函数统计诠释', '|ψ|² 概率密度', '归一化'], en: ['Born rule', '|ψ|^2 probability density', 'normalization'] },
  node: 'S20.3',
  tags: {
    math: ['MATH.STAT', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.AMP'],
    keywords: t('波函数 概率密度 |ψ|² Born 统计诠释 归一化 量子测量', 'wavefunction probability density Born rule normalization quantum measurement'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`P(x)\,dx=|\psi(x)|^2\,dx,\qquad \int_{-\infty}^{\infty}|\psi|^2\,dx=1`,
    variants: [
      { name: t('位置期望值', 'Expectation value of position'), latex: String.raw`\langle x\rangle=\int_{-\infty}^{\infty}\psi^*\,x\,\psi\,dx` },
    ],
  },
  meaning: t(
    '波函数 ψ 本身不代表"波的位移"，它是概率幅：粒子在 x 附近 dx 内出现的概率等于 |ψ(x)|² dx（Born 统计诠释）。整个空间找到粒子的总概率必须归一到 1。这意味着量子力学只能预言概率，不能预言单个电子"到底在哪"——测量前它同时处于各处的叠加态中。',
    "The wavefunction ψ is not a 'wave displacement'; it is a probability amplitude: the probability of finding the particle in dx near x equals |ψ(x)|² dx (Born's statistical interpretation). The total probability over all space must normalize to 1. Quantum mechanics therefore predicts only probabilities, not where any single electron 'actually is' — before measurement it is in a superposition of being everywhere at once.",
  ),
  symbols: [
    { sym: '\\psi(x)', name: t('波函数（概率幅）', 'wavefunction (probability amplitude)'), unit: 'm^(-1/2)' },
    { sym: '|\\psi|^2', name: t('概率密度', 'probability density'), unit: 'm⁻¹' },
    { sym: 'P(x)dx', name: t('在 dx 内找到粒子的概率', 'probability of finding the particle in dx'), unit: '1' },
    { sym: '\\langle x\\rangle', name: t('位置期望值', 'expectation value of position'), unit: 'm' },
  ],
  conditions: {
    applies: [t('所有量子态的统计描述', 'Statistical description of any quantum state')],
    assumes: [t('波函数平方可积、可归一化', 'The wavefunction is square-integrable and normalizable')],
    breaks: [t('自由粒子散射态不可归一化（用 δ 函数归一）', 'Scattering states are not normalizable (δ-function normalization)')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('类比光强 ∝ |电场|²', 'By analogy, intensity ∝ |E-field|²'), latex: String.raw`I\propto |E|^2` },
    { n: 2, op: 'identity', title: t('量子力学中 I ↔ 概率 P ∝ |ψ|²', 'In quantum mechanics, I ↔ probability P ∝ |ψ|²'), latex: String.raw`P(x)\,dx=|\psi(x)|^2\,dx` },
    { n: 3, op: 'setup', title: t('归一化条件', 'Normalization condition'), latex: String.raw`\int |\psi|^2 dx=1` },
  ],
  links: {
    upstream: [{ id: 'modphys-schrodinger-equation' }],
    seealso: [{ id: 'modphys-heisenberg-uncertainty' }],
  },
  refs: [{ text: 'Brehme & Beiser, Modern Physics, §8' }],
}

export default modphysWavefunctionProbability
