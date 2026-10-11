import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-geomagnetic-elements */
const magGeomagneticElements: FormulaCard = {
  id: 'mag-geomagnetic-elements',
  name: t('地磁七要素', 'The Seven Geomagnetic Elements'),
  aliases: { zh: ['地磁要素', 'D I F H Z X Y'], en: ['geomagnetic elements', 'D I F H Z X Y'] },
  node: 'S15.2',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.MAG', 'METH.INSTR'],
    quantity: ['Q.MAG'],
    keywords: t('地磁要素 偏角 倾角 总强度 水平 垂直', 'geomagnetic elements declination inclination total horizontal vertical'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`F^{2}=H^{2}+Z^{2}=X^{2}+Y^{2}+Z^{2}`,
    variants: [
      { name: t('七要素一览', 'the seven elements'), latex: String.raw`D\ \text{偏角},\ I\ \text{倾角},\ F\ \text{总强度},\ H\ \text{水平强度},\ Z\ \text{垂直强度},\ X\ \text{北向分量},\ Y\ \text{东向分量}` },
    ],
  },
  meaning: t(
    '地磁场是一个空间矢量，需要一组要素来完整描述：总强度 F、水平强度 H、垂直强度 Z、北向分量 X、东向分量 Y、偏角 D（水平矢量与北向夹角）、倾角 I（矢量与水平面夹角）。它们之间通过三角关系互相换算。地面磁测大多只测总强度 F，而解释时常需要 Z 或化极，因此换算是基本功。',
    'The geomagnetic field is a spatial vector described by seven elements: total intensity F, horizontal H, vertical Z, north X, east Y, declination D (angle between horizontal vector and north) and inclination I (angle to the horizontal). They inter-convert through trigonometric relations. Ground surveys mostly measure total field F, while interpretation often needs Z or reduction to the pole — making conversion a basic skill.',
  ),
  symbols: [
    { sym: 'F', name: t('总场强度', 'total field intensity'), unit: 'nT', typical: '25 000 – 65 000' },
    { sym: 'H', name: t('水平强度', 'horizontal intensity'), unit: 'nT' },
    { sym: 'Z', name: t('垂直强度（向下为正）', 'vertical intensity (down positive)'), unit: 'nT' },
    { sym: 'X', name: t('北向分量', 'north component'), unit: 'nT' },
    { sym: 'Y', name: t('东向分量', 'east component'), unit: 'nT' },
    { sym: 'D', name: t('磁偏角', 'declination'), unit: '°' },
    { sym: 'I', name: t('磁倾角', 'inclination'), unit: '°' },
  ],
  conditions: {
    applies: [t('地面/海面地磁台站观测', 'Ground/sea magnetic observatory data')],
    assumes: [t('以当地地理北向为参考', 'Local geographic north as reference')],
    breaks: [t('强局部磁异常使方向不稳定', 'Direction unstable over strong local anomalies')],
  },
  links: {
    downstream: [{ id: 'mag-element-conversions', note: t('要素之间的三角换算', 'Trigonometric inter-conversion of elements') }],
    seealso: [{ id: 'mag-igrf-reference-field' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §4.1' }],
}

export default magGeomagneticElements
