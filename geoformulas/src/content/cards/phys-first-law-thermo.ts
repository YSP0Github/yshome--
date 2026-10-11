import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-first-law-thermo */
const physFirstLawThermo: FormulaCard = {
  id: 'phys-first-law-thermo',
  name: t('热力学第一定律', 'First Law of Thermodynamics'),
  aliases: { zh: ['ΔU=Q−W', '能量守恒在热学'], en: ['first law of thermodynamics', 'ΔU = Q − W'] },
  node: 'S18.6',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('热力学第一定律 内能 热量 做功 能量守恒', 'first law thermodynamics internal energy heat work conservation'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta U=Q-W`,
    variants: [
      { name: t('微分形式', 'differential form'), latex: String.raw`\mathrm{d}U=\delta Q-\delta W,\qquad \delta W=p\,\mathrm{d}V` },
    ],
  },
  meaning: t(
    '热力学第一定律就是热现象中的能量守恒：系统内能的增量，等于它吸收的热量减去它对外做的功。热量和功不是「状态量」，而是「过程量」——能量只能通过传热或做功这两种方式进出系统。它否决了第一类永动机（不做功却凭空产生能量）。',
    'The first law is energy conservation for heat phenomena: the increase of internal energy equals the heat absorbed minus the work done by the system. Heat and work are not state variables but processes — energy enters or leaves only through these two channels. It rules out perpetual-motion machines of the first kind (creating energy from nothing).',
  ),
  symbols: [
    { sym: '\\Delta U', name: t('内能变化', 'change in internal energy'), unit: 'J' },
    { sym: 'Q', name: t('吸收的热量（吸热为正）', 'heat absorbed (positive in)'), unit: 'J' },
    { sym: 'W', name: t('系统对外做功', 'work done by the system'), unit: 'J' },
  ],
  conditions: {
    applies: [t('任何热力学系统', 'Any thermodynamic system')],
    assumes: [t('孤立系统总能量守恒', 'Total energy of an isolated system is conserved')],
    breaks: [t('考虑核反应质量亏损时须并入质能', 'Mass–energy included for nuclear reactions')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('能量守恒：内能变化来自进出能量', 'Energy balance: ΔU = energy in − energy out'), latex: String.raw`\Delta U=Q-W` },
    { n: 2, op: 'identity', title: t('膨胀对外做功 δW=p dV', 'Expansion work δW = p dV'), latex: String.raw`\mathrm{d}U=\delta Q-p\,\mathrm{d}V` },
  ],
  links: {
    upstream: [{ id: 'phys-heat-capacity' }, { id: 'phys-ideal-gas-law' }],
    downstream: [{ id: 'phys-mayer-relation' }, { id: 'phys-adiabatic-process' }],
  },
}

export default physFirstLawThermo
