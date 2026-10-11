import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-airy-isostasy */
const gravityAiryIsostasy: FormulaCard = {
  id: 'gravity-airy-isostasy',
  name: t('Airy 地壳均衡', 'Airy Isostasy'),
  aliases: { zh: ['山根', 'Airy 模式'], en: ['Airy isostasy', 'mountain root'] },
  node: 'S14.4',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.GRAV', 'METH.STRUCT'],
    quantity: ['Q.GRAV', 'Q.GEOM'],
    keywords: t('Airy 均衡 山根 反山根 低密度地壳', 'Airy isostasy mountain root crustal thickness'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`(\rho_m-\rho_c)\,r=\rho_c\,h,\qquad r=\frac{\rho_c}{\rho_m-\rho_c}\,h`,
    variants: [
      { name: t('典型密度（ρc=2.67, ρm=3.27）', 'typical densities (ρc=2.67, ρm=3.27)'), latex: String.raw`r\approx4.45\,h` },
    ],
  },
  meaning: t(
    'Airy 把地壳看成漂浮在高密度地幔上的低密度"块体"：山越高，向下扎入地幔的"山根"越深，像冰山。基准地壳厚度 t 之上有山高 h 时，山根 r 满足浮力平衡 (ρm−ρc)r=ρc h。典型比例下山根约为山高的 4.5 倍——这正是布格异常在山区偏负的原因。',
    'Airy treats the crust as low-density blocks floating on the denser mantle: the higher the mountain, the deeper its "root" plunges into the mantle, like an iceberg. For a mountain of height h above a reference crust of thickness t, the root depth r follows buoyancy (ρm−ρc)r = ρc h. With typical densities the root is about 4.5× the mountain height — explaining why Bouguer anomalies are negative over mountains.',
  ),
  symbols: [
    { sym: 'h', name: t('山体高出基准面的高度', 'mountain height above datum'), unit: 'm' },
    { sym: 'r', name: t('山根（插入地幔深度）', 'mountain root depth into mantle'), unit: 'm' },
    { sym: '\\rho_c', name: t('地壳密度', 'crustal density'), unit: 'kg/m³', typical: '2670' },
    { sym: '\\rho_m', name: t('地幔密度', 'mantle density'), unit: 'kg/m³', typical: '3270' },
  ],
  conditions: {
    applies: [t('造山带、高原的均衡补偿', 'Isostatic compensation of orogens and plateaus')],
    assumes: [t('地壳刚性块体、地幔流体静力平衡', 'Rigid crustal blocks, hydrostatic mantle')],
    breaks: [t('活动带未补偿（加载后仍在调整）', 'Uncompensated active belts still adjusting after loading')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('漂浮块体浮力平衡', 'Buoyancy equilibrium of floating block'),
      latex: String.raw`\rho_c\,(t+h)=\rho_c\,t+\rho_m\,r_{\text{net}}` },
    { n: 2, op: 'algebra', title: t('化简：附加山体由山根承重', 'Simplify: extra mountain supported by root'),
      latex: String.raw`\rho_c\,h=(\rho_m-\rho_c)\,r` },
    { n: 3, op: 'algebra', title: t('解出山根深度', 'Solve for root depth'),
      latex: String.raw`r=\frac{\rho_c}{\rho_m-\rho_c}\,h` },
    { n: 4, op: 'result', title: t('代入典型密度', 'Substitute typical densities'),
      latex: String.raw`r=\frac{2.67}{3.27-2.67}\,h\approx4.45\,h` },
  ],
  links: {
    downstream: [{ id: 'gravity-pratt-isostasy', note: t('密度变化补偿的替代模式', 'Alternative density-variation model') }],
    seealso: [{ id: 'gravity-bouguer-anomaly' }, { id: 'hydrostatic-equilibrium' }],
  },
  refs: [{ text: 'Airy (1855); Telford et al., §3.7' }],
}

export default gravityAiryIsostasy
