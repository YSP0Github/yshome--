import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-principle-superposition */
const physPrincipleSuperposition: FormulaCard = {
  id: 'phys-principle-superposition',
  name: t('波的叠加原理', 'Principle of Superposition'),
  aliases: { zh: ['叠加原理', '波相遇相加'], en: ['superposition principle'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.AMP'],
    keywords: t('波的叠加 干涉 相长 相消 波形相加', 'superposition interference constructive destructive adding waves'),
  },
  audience: 'highschool',
  complete: 'L1',
  statement: {
    main: String.raw`y_{\text{total}}=y_1+y_2`,
  },
  meaning: t(
    '两列波在同一处相遇时，该处的总位移等于各波位移的代数和。叠加可以是相长（同相、振幅相加）也可以是相消（反相、振幅相减）。这是干涉、衍射、驻波、拍等所有波动现象的共同基础。',
    'When two waves meet at a point, the total displacement is the algebraic sum of each wave’s displacement. Superposition can be constructive (in phase, amplitudes add) or destructive (out of phase, amplitudes subtract). It underlies interference, diffraction, standing waves and beats.',
  ),
  symbols: [
    { sym: 'y_1,y_2', name: t('各列波的位移', 'displacements of the individual waves'), unit: 'm' },
    { sym: 'y_{total}', name: t('合位移', 'resultant displacement'), unit: 'm' },
  ],
  conditions: {
    applies: [t('线性介质中的波', 'Waves in a linear medium')],
    assumes: [t('小振幅、线性响应', 'Small amplitude, linear response')],
    breaks: [t('非线性介质中叠加不成立', 'Fails in nonlinear media')],
  },
  links: {
    downstream: [{ id: 'phys-beats' }],
    seealso: [{ id: 'harmonic-plane-wave' }],
  },
}

export default physPrincipleSuperposition
