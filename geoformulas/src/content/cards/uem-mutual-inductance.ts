import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-mutual-inductance */
const uemMutualInductance: FormulaCard = {
  id: 'uem-mutual-inductance',
  name: t('互感', 'Mutual Inductance'),
  aliases: { zh: ['互感 M', '变压器原理'], en: ['mutual inductance', 'transformer principle'] },
  node: 'S19.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC', 'Q.MAG'],
    keywords: t('互感 M 两线圈 磁耦合 变压器 匝数比', 'mutual inductance M two coils magnetic coupling transformer turns ratio'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathcal{E}_{2}=-M\,\frac{dI_{1}}{dt},\qquad M=\frac{N_{2}\Phi_{21}}{I_{1}}`,
    variants: [
      { name: t('变压器电压比', 'Transformer voltage ratio'), latex: String.raw`\dfrac{U_{1}}{U_{2}}=\dfrac{N_{1}}{N_{2}}` },
    ],
  },
  meaning: t(
    '两个靠近的线圈彼此磁耦合：一个线圈电流变化会在另一个线圈中感应出电动势，互感 M 描述这种耦合强度。它是变压器、无线充电的工作原理。',
    'Two nearby coils are magnetically coupled: a changing current in one induces an EMF in the other, with mutual inductance M measuring the coupling strength. It is the working principle of transformers and wireless charging.',
  ),
  symbols: [
    { sym: 'M', name: t('互感', 'mutual inductance'), unit: 'H' },
    { sym: 'I_{1}', name: t('原线圈电流', 'primary current'), unit: 'A' },
    { sym: '\\mathcal{E}_{2}', name: t('副线圈感应电动势', 'secondary induced EMF'), unit: 'V' },
    { sym: 'N_{1},N_{2}', name: t('原/副线圈匝数', 'primary/secondary turns'), unit: '—' },
  ],
  conditions: {
    applies: [t('两线圈磁耦合；线性介质', 'Magnetically coupled coils; linear medium')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('线圈1磁通穿过线圈2', 'Flux of coil 1 through coil 2'),
      latex: String.raw`N_{2}\Phi_{21}=M\,I_{1}` },
    { n: 2, op: 'physics', title: t('法拉第定律', 'Faraday induction'),
      latex: String.raw`\mathcal{E}_{2}=-N_{2}\dfrac{d\Phi_{21}}{dt}=-M\dfrac{dI_{1}}{dt}` },
  ],
  links: {
    upstream: [{ id: 'uem-self-inductance' }],
    seealso: [{ id: 'uem-ac-power-factor' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
}

export default uemMutualInductance
