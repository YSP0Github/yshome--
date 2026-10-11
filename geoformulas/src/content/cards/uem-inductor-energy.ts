import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-inductor-energy */
const uemInductorEnergy: FormulaCard = {
  id: 'uem-inductor-energy',
  name: t('电感的磁场能', 'Energy Stored in an Inductor'),
  aliases: { zh: ['½LI²', '磁场能量密度'], en: ['inductor energy', '½LI² magnetic energy'] },
  node: 'S19.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.MAG'],
    keywords: t('电感储能 ½LI² 磁场能量密度 B²/2μ0', 'inductor energy half L I squared magnetic energy density B squared over 2 mu0'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`U_{B}=\frac{1}{2}LI^{2}`,
    variants: [
      { name: t('磁场能量密度', 'Magnetic energy density'), latex: String.raw`u_{B}=\dfrac{B^{2}}{2\mu_{0}}` },
    ],
  },
  meaning: t(
    '建立电流 I 的过程中，电源克服自感电动势做功，能量以磁场能形式储存在电感中：U_B=½LI²。它与电容的 ½CU² 对偶，是 RL 电路释放能量、电磁铁储能的来源。',
    'While building up current I, the source does work against the back-EMF and stores energy in the magnetic field: U_B=½LI². It is the dual of the capacitor\'s ½CU² and supplies the energy released in RL circuits and electromagnets.',
  ),
  symbols: [
    { sym: 'U_{B}', name: t('磁场能', 'magnetic energy'), unit: 'J' },
    { sym: 'L', name: t('电感', 'inductance'), unit: 'H' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: 'u_{B}', name: t('磁场能量密度', 'magnetic energy density'), unit: 'J/m³' },
  ],
  conditions: {
    applies: [t('载流电感；线性介质', 'Current-carrying inductor; linear medium')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('功率=εL·I', 'Power = εL·I'),
      latex: String.raw`P=\mathcal{E}_{L}I=L\dfrac{dI}{dt}\,I` },
    { n: 2, op: 'transform', title: t('从 0 充到 I 积分', 'Integrate 0 to I'),
      latex: String.raw`U_{B}=\int_{0}^{I}LI'\,dI'=\dfrac{1}{2}LI^{2}` },
  ],
  links: {
    upstream: [{ id: 'uem-self-inductance' }],
    downstream: [{ id: 'uem-rl-transient' }],
    seealso: [{ id: 'uem-capacitor-energy', note: t('对偶的电场能', 'dual electric energy') }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
}

export default uemInductorEnergy
