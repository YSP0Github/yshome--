import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-virtual-geomagnetic-pole */
const magVirtualGeomagneticPole: FormulaCard = {
  id: 'mag-virtual-geomagnetic-pole',
  name: t('虚地磁极（VGP）', 'Virtual Geomagnetic Pole (VGP)'),
  aliases: { zh: ['VGP', '虚磁极'], en: ['virtual geomagnetic pole', 'VGP'] },
  node: 'S15.4',
  tags: {
    math: ['MATH.GEOM', 'MATH.TRANSFORM'],
    method: ['METH.MAG', 'METH.STRUCT'],
    quantity: ['Q.MAG', 'Q.GEOM'],
    keywords: t('虚地磁极 VGP 古纬度 极移', 'virtual geomagnetic pole VGP palaeolatitude polar wander'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\tan\lambda_p=\frac{1}{2}\cot I`,
    variants: [
      { name: t('古纬度与古磁极距', 'palaeolatitude and pole distance'), latex: String.raw`\sin\lambda_p=\sin\lambda_s\cos\theta+\cos\lambda_s\sin\theta\cos D` },
    ],
  },
  meaning: t(
    '由某点测得的古地磁倾角 I，通过 tan I=2 tan λ_s 反推出该岩石形成时的古纬度 λ_s；再假设该时刻地磁场为地心偶极，把测点与偶极轴（虚地磁极 VGP）连到大圆上，就得到一个 VGP 位置。把同一时代不同大陆的 VGP 极移路径画出来，就能恢复大陆漂移和视极移曲线（APWP）。',
    'From a measured palaeomagnetic inclination I, the ancient latitude λ_s of the rock site is recovered via tan I = 2 tan λ_s. Assuming the contemporary field is a geocentric dipole, the site and the dipole axis (the Virtual Geomagnetic Pole, VGP) lie on a great circle, giving a VGP position. Plotting VGP paths from different continents of the same age yields apparent polar wander paths (APWP) and reconstructs continental drift.',
  ),
  symbols: [
    { sym: '\\lambda_p', name: t('虚地磁极余纬相关量', 'VGP co-latitude quantity'), unit: '°' },
    { sym: 'I', name: t('古地磁倾角', 'palaeomagnetic inclination'), unit: '°' },
    { sym: '\\lambda_s', name: t('测点古纬度', 'site palaeolatitude'), unit: '°' },
    { sym: 'D', name: t('古偏角', 'palaeomagnetic declination'), unit: '°' },
  ],
  conditions: {
    applies: [t('古地磁数据的全球对比', 'Global correlation of palaeomagnetic data')],
    assumes: [t('古场为地心轴向偶极', 'Ancient field is a geocentric axial dipole')],
    breaks: [t('非偶极场显著时 VGP 分散', 'VGP scatters when non-dipole field is strong')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('偶极关系 tan I=2 tan λ_s', 'Dipole relation tan I=2 tan λ_s'),
      latex: String.raw`\tan\lambda_s=\frac{1}{2}\tan I` },
    { n: 2, op: 'geometry', title: t('测点、VGP 位于同一大圆', 'Site and VGP lie on a great circle'),
      latex: String.raw`\theta=90^{\circ}-\lambda_s\ \text{(余纬)}` },
    { n: 3, op: 'transform', title: t('球面三角求 VGP 位置', 'Spherical trigonometry for VGP position'),
      latex: String.raw`\sin\lambda_p=\sin\lambda_s\cos\theta+\cos\lambda_s\sin\theta\cos D` },
    { n: 4, op: 'result', title: t('多个 VGP 平均得 APWP', 'Average many VGPs for an APWP'),
      latex: String.raw`\text{APWP}=\text{VGP 随时代的极移曲线}` },
  ],
  links: {
    upstream: [{ id: 'mag-central-dipole-field' }, { id: 'mag-thermal-remanence' }],
    seealso: [{ id: 'mag-geomagnetic-reversal' }],
  },
  refs: [{ text: 'Butler, Palaeomagnetism: Magnetic Domains to Geologic Terranes, ch. 6' }],
}

export default magVirtualGeomagneticPole
