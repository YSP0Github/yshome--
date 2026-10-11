import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-self-inductance */
const uemSelfInductance: FormulaCard = {
  id: 'uem-self-inductance',
  name: t('自感与电感', 'Self-Inductance'),
  aliases: { zh: ['自感 L', '电感 L=Φ/I'], en: ['self-inductance', 'inductor L'] },
  node: 'S19.4',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC', 'Q.MAG'],
    keywords: t('自感 电感 L=Φ/I ε=-L dI/dt 螺线管电感', 'self-inductance L flux over I EMF minus L dI/dt solenoid inductance'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`L=\frac{N\Phi_{B}}{I},\qquad \mathcal{E}_{L}=-L\,\frac{dI}{dt}`,
    variants: [
      { name: t('长螺线管电感', 'Long solenoid'), latex: String.raw`L=\mu_{0}n^{2}A\,l` },
    ],
  },
  meaning: t(
    '线圈自身电流变化时，穿过自身的磁通量随之变化，从而产生反电动势阻碍电流变化，这种性质即自感 L。L=Φ/I，反电动势 ε_L=−L dI/dt。电感是"电流惯性"元件，使电流不能突变。',
    'When a coil\'s own current changes, the flux through itself changes and induces a back-EMF opposing the change—this property is self-inductance L. L=Φ/I and the back-EMF is ε_L=−L dI/dt. The inductor acts like "current inertia", so current cannot jump abruptly.',
  ),
  symbols: [
    { sym: 'L', name: t('自感（电感）', 'self-inductance'), unit: 'H' },
    { sym: '\\Phi_{B}', name: t('每匝磁通量', 'flux per turn'), unit: 'Wb' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: '\\mathcal{E}_{L}', name: t('自感电动势', 'self-induced EMF'), unit: 'V' },
  ],
  conditions: {
    applies: [t('线性、非磁性介质；无铁芯饱和', 'Linear non-magnetic medium; no iron-core saturation')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('磁通量正比于电流', 'Flux proportional to current'),
      latex: String.raw`N\Phi_{B}=L\,I` },
    { n: 2, op: 'algebra', title: t('定义 L', 'Define L'),
      latex: String.raw`L=\dfrac{N\Phi_{B}}{I}` },
    { n: 3, op: 'physics', title: t('法拉第定律求反电动势', 'Faraday gives back-EMF'),
      latex: String.raw`\mathcal{E}_{L}=-N\dfrac{d\Phi_{B}}{dt}=-L\dfrac{dI}{dt}` },
  ],
  links: {
    upstream: [{ id: 'uem-faraday-law-emf' }],
    downstream: [{ id: 'uem-inductor-energy' }, { id: 'uem-rl-transient' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
}

export default uemSelfInductance
