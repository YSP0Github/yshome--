import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-poynting-vector-energy */
const uemPoyntingVectorEnergy: FormulaCard = {
  id: 'uem-poynting-vector-energy',
  name: t('Poynting 矢量与电磁波能量', 'Poynting Vector and EM Wave Energy'),
  aliases: { zh: ['Poynting矢量 S=E×B/μ0', '能流密度'], en: ['Poynting vector', 'EM energy flux'] },
  node: 'S19.5',
  tags: {
    math: ['MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.ELEC'],
    keywords: t('Poynting 矢量 能流密度 E×B/μ0 光强 辐射压力', 'Poynting vector energy flux E cross B over mu0 light intensity radiation pressure'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{S}=\frac{1}{\mu_{0}}\,\mathbf{E}\times\mathbf{B}`,
    variants: [
      { name: t('平均能流（光强）', 'Average flux (intensity)'), latex: String.raw`I=\langle S\rangle=\dfrac{E_{\max}B_{\max}}{2\mu_{0}}=\dfrac{E_{\max}^{2}}{2\mu_{0}c}` },
      { name: t('能量密度', 'Energy density'), latex: String.raw`u=\dfrac{1}{2}\varepsilon_{0}E^{2}+\dfrac{B^{2}}{2\mu_{0}}` },
    ],
  },
  meaning: t(
    'Poynting 矢量 S 描述电磁波能量的流动方向与大小（单位面积功率），S=E×B/μ0，沿传播方向。其时间平均即光强 I。它把电场能与磁场能统一到电磁波的能流中。',
    'The Poynting vector S describes the direction and magnitude of energy flow in an EM wave (power per unit area): S=E×B/μ0, pointing along propagation. Its time average is the light intensity I. It unifies electric and magnetic energy into the wave\'s energy flux.',
  ),
  symbols: [
    { sym: '\\mathbf{S}', name: t('Poynting 矢量', 'Poynting vector'), unit: 'W/m²' },
    { sym: '\\mathbf{E}', name: t('电场', 'electric field'), unit: 'V/m' },
    { sym: '\\mathbf{B}', name: t('磁场', 'magnetic field'), unit: 'T' },
    { sym: 'I', name: t('光强（平均能流）', 'intensity'), unit: 'W/m²' },
  ],
  conditions: {
    applies: [t('平面电磁波；真空', 'Plane EM wave; vacuum')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('能量密度=电+磁', 'Energy density = electric + magnetic'),
      latex: String.raw`u=\dfrac{1}{2}\varepsilon_{0}E^{2}+\dfrac{B^{2}}{2\mu_{0}}` },
    { n: 2, op: 'algebra', title: t('平面波中 E=cB 相等贡献', 'In a plane wave E=cB, equal contributions'),
      latex: String.raw`u=\varepsilon_{0}E^{2}` },
    { n: 3, op: 'result', title: t('能流=u·c，写成叉乘', 'Flux = u·c, written as cross product'),
      latex: String.raw`\mathbf{S}=u\,c\,\hat{\mathbf{k}}=\dfrac{1}{\mu_{0}}\mathbf{E}\times\mathbf{B}` },
  ],
  links: {
    upstream: [{ id: 'uem-em-wave-speed' }],
    seealso: [{ id: 'uem-electrostatic-energy' }, { id: 'uem-inductor-energy' }],
  },
  refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §9.3' }],
}

export default uemPoyntingVectorEnergy
