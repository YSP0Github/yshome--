import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-electromotive-force */
const uemElectromotiveForce: FormulaCard = {
  id: 'uem-electromotive-force',
  name: t('电动势', 'Electromotive Force (EMF)'),
  aliases: { zh: ['电动势 ε', '电源'], en: ['EMF', 'source voltage'] },
  node: 'S19.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC'],
    keywords: t('电动势 ε 电源内阻 端电压 电池', 'electromotive force EMF internal resistance terminal voltage battery'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`U_{\text{terminal}}=\mathcal{E}-I\,r`,
    variants: [
      { name: t('全电路欧姆定律', 'Full-circuit Ohm law'), latex: String.raw`I=\dfrac{\mathcal{E}}{R+r}` },
    ],
  },
  meaning: t(
    '电动势 ε 是电源把其他形式能量转化为电能、推动单位电荷绕电路一周的"推动力"。实际电源有内阻 r，故带载时端电压低于 ε：U=ε−Ir。',
    'EMF ε is the source\'s "driving push" that converts other energy into electric energy and moves a unit charge once around the circuit. A real source has internal resistance r, so under load the terminal voltage drops to U=ε−Ir.',
  ),
  symbols: [
    { sym: '\\mathcal{E}', name: t('电动势', 'EMF'), unit: 'V' },
    { sym: 'r', name: t('电源内阻', 'internal resistance'), unit: 'Ω' },
    { sym: 'U_{\\text{terminal}}', name: t('端电压', 'terminal voltage'), unit: 'V' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
  ],
  conditions: {
    applies: [t('含内阻的实际电源接外电阻 R', 'Real source with internal r feeding external R')],
  },
  links: {
    downstream: [{ id: 'uem-kirchhoff-laws' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §27' }],
}

export default uemElectromotiveForce
