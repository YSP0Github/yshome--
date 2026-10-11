import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rel-sr-postulates */
const relSrPostulates: FormulaCard = {
  id: 'rel-sr-postulates',
  name: t('狭义相对论基本假设', 'Postulates of Special Relativity'),
  aliases: { zh: ['相对性原理 光速不变原理'], en: ['principle of relativity', 'constancy of the speed of light'] },
  node: 'S20.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL'],
    keywords: t('狭义相对论 相对性原理 光速不变 惯性系 物理定律协变', 'special relativity principle of relativity constancy of light speed inertial frame covariance'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`c=\text{常量（与光源、观察者运动无关）},\qquad \text{物理定律在所有惯性系中形式相同}`,
    variants: [
      { name: t('光速数值', 'Numerical value of c'), latex: String.raw`c=2.998\times10^8\ \mathrm{m/s}` },
    ],
  },
  meaning: t(
    'Einstein 1905 年只靠两条假设就重建了时空观：(1) 相对性原理——所有惯性系中物理定律形式相同；(2) 光速不变原理——真空中光速 c 与光源和观察者的运动无关。第二条彻底否定了 Galileo 速度叠加：哪怕你追着光跑，光相对你仍是 c。所有相对论效应（时间膨胀、长度收缩、质能方程）都从这两条逻辑地推出。',
    "In 1905 Einstein rebuilt the notion of spacetime from just two postulates: (1) the principle of relativity — the laws of physics take the same form in every inertial frame; (2) the principle of the constancy of the speed of light — c in vacuum is independent of the motion of source or observer. The second demolishes Galilean velocity addition: even running after light, it still approaches you at c. Every relativistic effect (time dilation, length contraction, mass–energy) follows logically from these two.",
  ),
  symbols: [
    { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('惯性系（无加速度）', 'Inertial frames (no acceleration)')],
    assumes: [t('无引力（广义相对论处理引力）', 'No gravity (general relativity handles gravity)')],
    breaks: [t('强引力场/大加速度需广义相对论', 'Strong gravity or large acceleration needs general relativity')],
  },
  links: {
    upstream: [{ id: 'rel-galilean-transformation' }],
    downstream: [{ id: 'rel-lorentz-transformation' }],
  },
  refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 1' }],
}

export default relSrPostulates
