import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-dipole-potential */
const magDipolePotential: FormulaCard = {
  id: 'mag-dipole-potential',
  name: t('磁偶极子的磁标势', 'Scalar Magnetic Potential of a Dipole'),
  aliases: { zh: ['磁标势', '偶极子势'], en: ['magnetic scalar potential', 'dipole potential'] },
  node: 'S15.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.GEOM'],
    method: ['METH.MAG'],
    quantity: ['Q.MAG'],
    keywords: t('磁标势 偶极子 m cosθ r²', 'magnetic scalar potential dipole m cos theta r squared'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`V(\mathbf{r})=\frac{\mu_0}{4\pi}\,\frac{\mathbf{m}\cdot\hat{\mathbf{r}}}{r^{2}}=\frac{\mu_0}{4\pi}\,\frac{m\cos\theta}{r^{2}}`,
  },
  meaning: t(
    '一个磁偶极子（小磁针、磁化岩体、地心主磁场）在远处产生的磁标势，正比于磁矩 m 与观测方向夹角的余弦、反比于距离平方。它是所有地磁学的出发点：地球主磁场、岩石剩余磁化、磁异常正演，都是在处理这个偶极势的空间导数。',
    'The scalar magnetic potential of a dipole (a compass needle, a magnetized body, the main geomagnetic field) is proportional to m cos theta over r squared. It is the starting point of all geomagnetism: the main field, rock remanence and magnetic-anomaly forward modelling are all spatial derivatives of this dipole potential.',
  ),
  symbols: [
    { sym: 'V', name: t('磁标势', 'magnetic scalar potential'), unit: 'A·m' },
    { sym: '\\mu_0', name: t('真空磁导率', 'vacuum permeability'), unit: 'H/m' },
    { sym: '\\mathbf{m}', name: t('磁偶极矩', 'magnetic dipole moment'), unit: 'A·m²' },
    { sym: 'r', name: t('到场点距离', 'distance to field point'), unit: 'm' },
    { sym: '\\theta', name: t('m 与观测方向夹角', 'angle between m and observation direction'), unit: '°' },
  ],
  conditions: {
    applies: [t('远场（r 远大于偶极尺度）', 'Far field (r much larger than dipole size)')],
    assumes: [t('无自由电流区域（可标势）', 'Current-free region (scalar potential valid)')],
    breaks: [t('近偶极尺度需高阶多极项', 'Near the dipole, higher multipoles needed')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('正负磁荷相距 2l 构成偶极', 'Two opposite poles separated by 2l form a dipole'),
      latex: String.raw`\mathbf{m}=p\cdot 2l\,\hat{\mathbf{m}}` },
    { n: 2, op: 'setup', title: t('两磁荷标势叠加', 'Superpose potentials of two poles'),
      latex: String.raw`V=\frac{\mu_0}{4\pi}\left(\frac{p}{r_+}-\frac{p}{r_-}\right)` },
    { n: 3, op: 'taylor', title: t('远场展开', 'Far-field expansion'),
      latex: String.raw`\frac{1}{r_+}-\frac{1}{r_-}\approx\frac{2l\cos\theta}{r^{2}}` },
    { n: 4, op: 'result', title: t('得偶极标势', 'Obtain dipole scalar potential'),
      latex: String.raw`V=\frac{\mu_0}{4\pi}\frac{m\cos\theta}{r^{2}}` },
  ],
  links: {
    upstream: [{ id: 'mag-coulomb-law' }],
    downstream: [{ id: 'mag-dipole-field-general', note: t('势的负梯度得偶极场', 'Negative gradient gives the dipole field') }],
  },
  refs: [{ text: 'Blakely, Potential Theory, §5' }],
}

export default magDipolePotential
