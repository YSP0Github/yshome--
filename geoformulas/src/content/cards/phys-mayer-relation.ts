import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-mayer-relation */
const physMayerRelation: FormulaCard = {
  id: 'phys-mayer-relation',
  name: t('定压与定容热容关系（Mayer 式）', 'Mayer Relation: Cp − Cv = R'),
  aliases: { zh: ['迈耶公式', 'Cp-Cv=R'], en: ['Mayer relation', 'Cp − Cv = R'] },
  node: 'S18.6',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('定压热容 定容热容 Cp Cv 迈耶 比热比', 'Cp Cv molar heat capacities Mayer heat capacity ratio'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`C_p-C_v=R,\qquad \gamma=\frac{C_p}{C_v}`,
    variants: [
      { name: t('理想气体内能', 'internal energy of ideal gas'), latex: String.raw`C_v=\dfrac{f}{2}R,\quad C_p=C_v+R` },
    ],
  },
  meaning: t(
    '把 1 mol 气体升高 1 K，定压加热要比定容加热多吸收 R 的热量——因为定压时气体会膨胀、对外做一部分功，这部分额外能量正是 R。Cp 永远大于 Cv。两者之比 γ=Cp/Cv 叫绝热指数，单原子气体 γ=5/3，常温双原子气体 γ=7/5=1.4。',
    'Heating 1 mole by 1 K at constant pressure costs R more than at constant volume, because at constant pressure the gas expands and does extra work — exactly R. Hence Cp always exceeds Cv. Their ratio γ = Cp/Cv is the adiabatic index: 5/3 for monatomic gases and 7/5 = 1.4 for diatomic gases at room temperature.',
  ),
  symbols: [
    { sym: 'C_p', name: t('定压摩尔热容', 'molar heat capacity at constant pressure'), unit: 'J/(mol·K)' },
    { sym: 'C_v', name: t('定容摩尔热容', 'molar heat capacity at constant volume'), unit: 'J/(mol·K)' },
    { sym: 'R', name: t('气体常数', 'gas constant'), unit: 'J/(mol·K)' },
    { sym: '\\gamma', name: t('绝热指数', 'adiabatic index'), unit: '—' },
  ],
  conditions: {
    applies: [t('理想气体', 'Ideal gases')],
    assumes: [t('内能只依赖温度', 'Internal energy depends only on T')],
    breaks: [t('实际气体有微小修正', 'Small corrections for real gases')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('定容：W=0，Qv=ΔU', 'Constant V: W=0, Qv = ΔU'), latex: String.raw`C_v=\dfrac{\Delta U}{\Delta T}` },
    { n: 2, op: 'physics', title: t('定压：Qp=ΔU+pΔV', 'Constant p: Qp = ΔU + pΔV'), latex: String.raw`C_p=\dfrac{\Delta U+p\Delta V}{\Delta T}=C_v+\dfrac{p\Delta V}{\Delta T}` },
    { n: 3, op: 'algebra', title: t('由 pV=RT 得 pΔV=RΔT', 'From pV=RT, pΔV = RΔT'), latex: String.raw`C_p-C_v=R` },
  ],
  links: {
    upstream: [{ id: 'phys-first-law-thermo' }, { id: 'phys-equipartition-theorem' }],
    downstream: [{ id: 'phys-adiabatic-process' }],
  },
}

export default physMayerRelation
