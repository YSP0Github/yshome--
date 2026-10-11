import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** dc-formation-factor-ro-rw */
const dcFormationFactorRoRw: FormulaCard = {
  id: 'dc-formation-factor-ro-rw',
  name: t('地层因素 F = Ro/Rw', 'Formation Factor F = Ro/Rw'),
  aliases: { zh: ['地层因数', '水层电阻放大倍数'], en: ['formation factor', 'Ro/Rw'] },
  node: 'S16.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.EM', 'METH.ROCK'],
    quantity: ['Q.ELEC', 'Q.POR'],
    keywords: t('地层因素 F Ro Rw 100%含水地层 水层电阻率', 'formation factor Ro Rw 100% water saturated'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`F=\frac{R_{o}}{R_{w}}`,
    variants: [
      { name: t('意义', 'Meaning'), latex: String.raw`F=\dfrac{\text{地层真电阻}}{\text{同体积地层水电阻}}>1` },
    ],
  },
  meaning: t(
    'Ro 是 100% 被地层水饱和时的地层电阻率，Rw 是孔隙中地层水本身的电阻率。地层因素 F=Ro/Rw 是大于 1 的无量纲倍数：岩石孔隙像弯弯曲曲的水管，电流要绕着骨架走，所以同一杯水装在岩石孔隙里比自由水流得慢。F 只与孔隙结构有关，与含不含油无关——这是把"电阻率"和"孔隙度"挂钩的第一步。',
    'Ro is the resistivity of the formation when 100% saturated with formation water, and Rw the resistivity of that pore water itself. The formation factor F=Ro/Rw is a dimensionless multiplier >1: pore throats are tortuous, so water in rock conducts worse than free water. F depends only on pore geometry, not on hydrocarbons — the first step linking resistivity to porosity.',
  ),
  symbols: [
    { sym: 'F', name: t('地层因素', 'formation factor'), unit: '无量纲' },
    { sym: 'R_{o}', name: t('100% 含水地层电阻率', 'resistivity when fully water-saturated'), unit: 'Ω·m' },
    { sym: 'R_{w}', name: t('地层水电阻率', 'formation-water resistivity'), unit: 'Ω·m' },
  ],
  conditions: {
    applies: [t('纯净（无泥质）、孔隙连通的含水岩石', 'Clean, permeable, water-bearing rock')],
    assumes: [t('导电路径全为孔隙水', 'Conduction is entirely via pore water')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('岩石电阻 = 水电阻 × 曲折度/面积', 'Rock resistance = water resistance × geometry factor'),
      latex: String.raw`R_{o}=\rho_{e,rock}\dfrac{L}{A}` },
    { n: 2, op: 'identity', title: t('把几何因子归一成 F', 'Collapse geometry into F'),
      latex: String.raw`R_{o}=F\,R_{w}` },
    { n: 3, op: 'result', title: t('解出 F', 'Hence F'),
      latex: String.raw`F=R_{o}/R_{w}` },
  ],
  links: {
    downstream: [{ id: 'dc-archie-formation-factor', note: t('F 与孔隙度的定量关系', 'How F depends on porosity') }],
    seealso: [{ id: 'dc-archie-resistivity-ratio' }],
  },
  refs: [{ text: 'Archie (1942), Trans. AIME' }],
}

export default dcFormationFactorRoRw
