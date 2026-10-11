import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-igrf-reference-field */
const magIgrfReferenceField: FormulaCard = {
  id: 'mag-igrf-reference-field',
  name: t('IGRF 国际参考地磁场', 'IGRF — International Geomagnetic Reference Field'),
  aliases: { zh: ['IGRF', '国际参考场'], en: ['IGRF', 'reference field model'] },
  node: 'S15.2',
  tags: {
    math: ['MATH.TRANSFORM'],
    method: ['METH.MAG', 'METH.PROC'],
    quantity: ['Q.MAG'],
    keywords: t('IGRF 参考场 球谐 主磁场 长期变化', 'IGRF reference field spherical harmonic secular variation'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`V(r,\varphi,\lambda)=R\sum_{n=1}^{N}\left(\frac{R}{r}\right)^{n+1}\sum_{m=0}^{n}\left(g_n^m\cos m\lambda+h_n^m\sin m\lambda\right)P_n^m(\sin\varphi)`,
  },
  meaning: t(
    'IGRF 是国际地磁学与高空大气物理协会（IAGA）每 5 年更新一次的主磁场球谐模型，用一组球谐系数 g_n^m、h_n^m 描述地心主磁场及其长期变化。磁法勘探把观测值减去该参考场，剩下的就是反映地壳磁性的"磁异常"。',
    'The IGRF is a spherical-harmonic model of the main field and its secular variation, updated every 5 years by IAGA, using coefficients g_n^m and h_n^m. Magnetic surveys subtract this reference field from observations; what remains is the "magnetic anomaly" reflecting crustal magnetization.',
  ),
  symbols: [
    { sym: 'V', name: t('磁位', 'magnetic potential'), unit: 'nT' },
    { sym: 'g_n^m,h_n^m', name: t('球谐高斯系数', 'Gaussian spherical-harmonic coefficients'), unit: 'nT' },
    { sym: 'R', name: t('参考地球半径（6371.2 km）', 'reference radius (6371.2 km)'), unit: 'km' },
    { sym: 'P_n^m', name: t('n 阶 m 次缔合 Legendre 函数', 'associated Legendre function'), unit: '—' },
  ],
  conditions: {
    applies: [t('全球主磁场（含长期变化）', 'Global main field (with secular variation)')],
    assumes: [t('不含地壳磁异常与日变', 'Excludes crustal anomalies and diurnal variation')],
    breaks: [t('强局部磁异常或磁暴期', 'Strong local anomalies or magnetic storms')],
  },
  links: {
    upstream: [{ id: 'mag-geomagnetic-elements' }],
    downstream: [{ id: 'mag-central-dipole-field' }],
  },
  refs: [{ text: 'IAGA Working Group V-MOD, IGRF-13 (2020)' }],
}

export default magIgrfReferenceField
