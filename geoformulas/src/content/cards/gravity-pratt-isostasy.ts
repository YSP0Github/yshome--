import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-pratt-isostasy */
const gravityPrattIsostasy: FormulaCard = {
  id: 'gravity-pratt-isostasy',
  name: t('Pratt 地壳均衡', 'Pratt Isostasy'),
  aliases: { zh: ['Pratt 模式', '密度补偿'], en: ['Pratt isostasy', 'density compensation'] },
  node: 'S14.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.GRAV', 'METH.STRUCT'],
    quantity: ['Q.GRAV', 'Q.MAT'],
    keywords: t('Pratt 均衡 补偿深度 密度横向变化', 'Pratt isostasy compensation depth lateral density'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\rho(h)\,(T+h)=\rho_0\,T,\qquad \rho(h)=\rho_0\,\frac{T}{T+h}`,
  },
  meaning: t(
    'Pratt 模式不靠山根，而靠"同一补偿深度 T 以上各柱体总质量相等"：山越高，其下岩石密度越低（热膨胀、成分更酸性），从而整柱质量与低地一致。它与 Airy 是两种互补的均衡机制：年轻造山带偏 Airy（山根），大洋中脊和热点区域偏 Pratt（低密度热柱）。',
    'Pratt does not use a root; instead the total mass of every column down to a compensation depth T is equal: the higher the column, the lower its density (thermal expansion, more felsic composition), so the whole column matches lowland mass. Pratt and Airy are complementary: young orogens lean Airy (root), while mid-ocean ridges and hotspots lean Pratt (low-density hot column).',
  ),
  symbols: [
    { sym: '\\rho(h)', name: t('高出 h 的柱体密度', 'density of a column of height h'), unit: 'kg/m³' },
    { sym: '\\rho_0', name: t('低地（h=0）参考密度', 'reference density at h=0'), unit: 'kg/m³' },
    { sym: 'T', name: t('均衡补偿深度', 'compensation depth'), unit: 'm', typical: '30–100 km' },
    { sym: 'h', name: t('柱体相对低地的高度', 'column height relative to lowland'), unit: 'm' },
  ],
  conditions: {
    applies: [t('大洋中脊、热点、张性背景', 'Mid-ocean ridges, hotspots, extensional settings')],
    assumes: [t('补偿深度以下密度统一', 'Uniform density below compensation depth')],
    breaks: [t('刚性岩石圈未充分补偿处', 'Rigid lithosphere where compensation incomplete')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('各柱体底面静压力相等', 'Equal basal pressure under every column'),
      latex: String.raw`\rho(h)\,(T+h)=\rho_0\,T` },
    { n: 2, op: 'algebra', title: t('解出柱体密度', 'Solve for column density'),
      latex: String.raw`\rho(h)=\rho_0\,\frac{T}{T+h}` },
    { n: 3, op: 'algebra', title: t('h≪T 时近似线性偏低', 'For h≪T, density slightly and linearly lower'),
      latex: String.raw`\rho(h)\approx\rho_0\left(1-\frac{h}{T}\right)` },
    { n: 4, op: 'result', title: t('高山低密度、低地正常密度', 'Mountains low-density, lowlands normal'),
      latex: String.raw`h>0\ \Rightarrow\ \rho(h)<\rho_0` },
  ],
  links: {
    upstream: [{ id: 'gravity-airy-isostasy' }],
    seealso: [{ id: 'gravity-bouguer-anomaly' }],
  },
  refs: [{ text: 'Pratt (1855); Telford et al., §3.7' }],
}

export default gravityPrattIsostasy
