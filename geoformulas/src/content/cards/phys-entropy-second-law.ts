import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-entropy-second-law */
const physEntropySecondLaw: FormulaCard = {
  id: 'phys-entropy-second-law',
  name: t('热力学第二定律与熵', 'Second Law of Thermodynamics and Entropy'),
  aliases: { zh: ['熵增原理', 'ΔS=Q/T'], en: ['second law of thermodynamics', 'entropy', 'ΔS = Q/T'] },
  node: 'S18.6',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('熵 热力学第二定律 不可逆 熵增 热寂', 'entropy second law irreversible entropy increase heat death'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta S=\frac{Q}{T}\ (\text{可逆}),\qquad \Delta S_{\text{孤立}}\ge 0`,
    variants: [
      { name: t('Clausius 表述', 'Clausius statement'), latex: String.raw`\text{热量不能自发地从低温流向高温}` },
      { name: t('Kelvin–Planck 表述', 'Kelvin–Planck statement'), latex: String.raw`\text{不能从单一热源吸热全部变功}` },
    ],
  },
  meaning: t(
    '熵是描述系统无序程度的状态量。热力学第二定律说：孤立系统的熵永不减少——自发过程总是朝着更无序的方向进行。热不能自发从冷处流向热处、打碎的杯子不会自动复原，都是它的体现。它给时间指了一个方向：过去熵低、未来熵高。',
    'Entropy measures the disorder of a system. The second law says the entropy of an isolated system never decreases — spontaneous processes always run toward more disorder. Heat never flows spontaneously cold-to-hot, and a broken cup never reassembles; both are instances of it. It gives time an arrow: past low entropy, future high entropy.',
  ),
  symbols: [
    { sym: '\\Delta S', name: t('熵变', 'entropy change'), unit: 'J/K' },
    { sym: 'Q', name: t('可逆过程吸热', 'heat absorbed reversibly'), unit: 'J' },
    { sym: 'T', name: t('热力学温度', 'temperature'), unit: 'K' },
  ],
  conditions: {
    applies: [t('宏观系统、统计意义', 'Macroscopic systems, statistical sense')],
    assumes: [t('孤立系统', 'Isolated system')],
    breaks: [t('局部熵可减，但必须以环境熵更大增加为代价', 'Local entropy can drop, but only at the cost of larger environmental increase')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('可逆等温过程熵变', 'Entropy change in reversible isothermal process'), latex: String.raw`\Delta S=\dfrac{Q}{T}` },
    { n: 2, op: 'physics', title: t('孤立系统与外界无热交换', 'Isolated system exchanges no heat'), latex: String.raw`Q=0\;\Rightarrow\;\Delta S_{\text{孤立}}\ge 0` },
    { n: 3, op: 'result', title: t('自发过程熵不减', 'Spontaneous processes never decrease entropy'), latex: String.raw`\Delta S_{\text{孤立}}\ge 0` },
  ],
  links: {
    upstream: [{ id: 'phys-carnot-efficiency' }],
    seealso: [{ id: 'phys-first-law-thermo' }],
  },
}

export default physEntropySecondLaw
