import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-curie-temperature */
const magCurieTemperature: FormulaCard = {
  id: 'mag-curie-temperature',
  name: t('居里温度（居里点）', 'Curie Temperature (Curie Point)'),
  aliases: { zh: ['居里点', 'Tc'], en: ['Curie point', 'Tc'] },
  node: 'S15.3',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.MAG', 'METH.STRUCT'],
    quantity: ['Q.MAG', 'Q.ENERGY'],
    keywords: t('居里温度 磁铁矿 580 居里点', 'Curie temperature magnetite 580 Curie point'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`T_c\approx580^{\circ}\mathrm{C}\ \text{(磁铁矿)},\qquad T_c\approx675^{\circ}\mathrm{C}\ \text{(赤铁矿)}`,
  },
  meaning: t(
    '每种铁磁性矿物都有一个临界温度 Tc：低于它磁矩自发有序（铁磁性，强磁化）；高于它热运动摧毁有序，矿物退化为顺磁（弱磁化，χ=C/T）。磁铁矿 Tc≈580°C。地下磁性层的底界（居里等温面）大致对应 Tc≈580°C 的深度，深度变化直接控制磁异常的最大深度。',
    'Each ferromagnetic mineral has a critical temperature Tc: below it moments are spontaneously ordered (ferromagnetic, strongly magnetic); above it thermal motion destroys the order and the mineral becomes paramagnetic (weak, χ=C/T). Magnetite Tc≈580°C. The basal boundary of the magnetic layer — the Curie isotherm — roughly follows the 580°C depth; its depth variation sets the maximum depth of magnetic anomalies.',
  ),
  symbols: [
    { sym: 'T_c', name: t('居里温度', 'Curie temperature'), unit: '°C' },
    { sym: '\\chi', name: t('高温端顺磁磁化率', 'high-T paramagnetic susceptibility'), unit: '—' },
  ],
  conditions: {
    applies: [t('铁磁性矿物的有序—无序转变', 'Order–disorder transition in ferromagnetic minerals')],
    assumes: [t('常压、化学稳定', 'Ambient pressure, chemically stable')],
    breaks: [t('高压或成分变化会移动 Tc', 'Pressure/composition shifts Tc')],
  },
  links: {
    upstream: [{ id: 'mag-curie-law' }],
    downstream: [{ id: 'mag-thermal-remanence', note: t('穿过 Tc 冷却时获得热剩磁', 'Cooling through Tc locks in TRM') }],
  },
  refs: [{ text: 'Dunlop & Özdemir, Rock Magnetism, ch. 10' }],
}

export default magCurieTemperature
