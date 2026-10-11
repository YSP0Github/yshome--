import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-faraday-law-emf */
const uemFaradayLawEmf: FormulaCard = {
  id: 'uem-faraday-law-emf',
  name: t('Faraday 电磁感应定律', "Faraday's Law of Induction"),
  aliases: { zh: ['法拉第定律 ε=-dΦ/dt', '感应电动势'], en: ["Faraday's law", 'induced EMF'] },
  node: 'S19.4',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC', 'Q.MAG'],
    keywords: t('法拉第定律 感应电动势 磁通量变化率 N匝 发电机', "Faraday's law induced EMF flux change rate N turns generator"),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathcal{E}=-N\,\frac{d\Phi_{B}}{dt}`,
    variants: [
      { name: t('积分形式', 'Integral form'), latex: String.raw`\oint_{C}\mathbf{E}\cdot d\mathbf{l}=-\dfrac{d}{dt}\iint_{S}\mathbf{B}\cdot d\mathbf{S}` },
      { name: t('微分形式', 'Differential form'), latex: String.raw`\nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t}` },
    ],
  },
  meaning: t(
    '穿过闭合回路的磁通量随时间变化时，回路中产生感应电动势，大小等于通量变化率的 N 倍（N 为匝数），负号由 Lenz 定律确定方向。它是发电机、变压器、感应充电的物理基础。',
    'When the magnetic flux through a closed loop changes in time, an EMF is induced equal to N times the rate of flux change (N = turns), with the sign set by Lenz\'s law. It is the physical basis of generators, transformers and inductive charging.',
  ),
  symbols: [
    { sym: '\\mathcal{E}', name: t('感应电动势', 'induced EMF'), unit: 'V' },
    { sym: '\\Phi_{B}', name: t('磁通量', 'magnetic flux'), unit: 'Wb' },
    { sym: 'N', name: t('线圈匝数', 'number of turns'), unit: '—' },
    { sym: '\\mathbf{E}', name: t('感应电场', 'induced electric field'), unit: 'V/m' },
  ],
  conditions: {
    applies: [t('回路磁通量随时间变化（场、面积或取向改变）', 'Loop flux changing in time (field, area, or orientation)')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('通量定义', 'Define flux'),
      latex: String.raw`\Phi_{B}=\int_{S}\mathbf{B}\cdot d\mathbf{S}` },
    { n: 2, op: 'physics', title: t('电动势=通量变化率', 'EMF = rate of flux change'),
      latex: String.raw`\mathcal{E}=-N\dfrac{d\Phi_{B}}{dt}` },
    { n: 3, op: 'transform', title: t('电动势即 E 环路积分', 'EMF as loop integral of E'),
      latex: String.raw`\oint\mathbf{E}\cdot d\mathbf{l}=-\dfrac{d\Phi_{B}}{dt}\ \xrightarrow{\text{Stokes}}\ \nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t}` },
  ],
  links: {
    upstream: [{ id: 'uem-magnetic-flux-def' }],
    downstream: [{ id: 'uem-lenz-law' }, { id: 'uem-motional-emf' }, { id: 'uem-self-inductance' }],
    seealso: [{ id: 'em-faraday-induction', note: t('勘探电磁视角版本', 'exploration-geophysics version') }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
}

export default uemFaradayLawEmf
