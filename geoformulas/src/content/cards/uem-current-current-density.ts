import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-current-current-density */
const uemCurrentCurrentDensity: FormulaCard = {
  id: 'uem-current-current-density',
  name: t('电流与电流密度', 'Electric Current and Current Density'),
  aliases: { zh: ['电流 I=dQ/dt', '电流密度 J'], en: ['electric current', 'current density'] },
  node: 'S19.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC'],
    keywords: t('电流 dQ/dt 电流密度 J=nqv 漂移速度 横截面积', 'electric current dQ/dt current density J drift velocity cross section'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`I=\frac{dQ}{dt},\qquad \mathbf{J}=n\,q\,\mathbf{v}_{d},\qquad I=\iint_{S}\mathbf{J}\cdot d\mathbf{A}`,
    variants: [
      { name: t('金属中', 'In a metal'), latex: String.raw`\mathbf{J}=n\,e\,\mathbf{v}_{d}` },
    ],
  },
  meaning: t(
    '电流是单位时间流过截面的电荷，方向取正电荷流动方向。电流密度 J 描述某点单位面积的电流及其方向，是矢量；I 是 J 在截面上的通量。金属中 J 由自由电子的漂移速度 v_d 决定。',
    'Electric current is charge passing a cross-section per unit time, taken in the direction of positive-charge flow. Current density J is a vector describing current per unit area at a point; I is the flux of J through a section. In metals J is set by the drift velocity v_d of free electrons.',
  ),
  symbols: [
    { sym: 'I', name: t('电流', 'electric current'), unit: 'A' },
    { sym: '\\mathbf{J}', name: t('电流密度', 'current density'), unit: 'A/m²' },
    { sym: 'n', name: t('载流子数密度', 'carrier number density'), unit: 'm⁻³' },
    { sym: 'q', name: t('载流子电荷', 'carrier charge'), unit: 'C' },
    { sym: 'v_{d}', name: t('漂移速度', 'drift velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('稳恒或缓变电流；均匀截面', 'Steady or slowly varying current; uniform section')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('Δt 内过截面电荷', 'Charge crossing in Δt'),
      latex: String.raw`\Delta Q=n\,q\,v_{d}\,\Delta t\,A` },
    { n: 2, op: 'algebra', title: t('I=ΔQ/Δt', 'Divide by Δt'),
      latex: String.raw`I=\dfrac{\Delta Q}{\Delta t}=nqv_{d}A=J\,A` },
    { n: 3, op: 'result', title: t('写成矢量通量', 'As vector flux'),
      latex: String.raw`I=\int_{S}\mathbf{J}\cdot d\mathbf{A}` },
  ],
  links: {
    downstream: [{ id: 'uem-ohms-law' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §26' }],
}

export default uemCurrentCurrentDensity
