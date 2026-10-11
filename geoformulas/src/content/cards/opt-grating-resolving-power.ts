import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-grating-resolving-power */
const optGratingResolvingPower: FormulaCard = {
  id: 'opt-grating-resolving-power',
  name: t('光栅分辨本领', 'Resolving Power of a Grating'),
  aliases: { zh: ['色分辨本领', 'R = kN'], en: ['chromatic resolving power', 'R = k N'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS', 'METH.INSTR'],
    quantity: ['Q.OPT'],
    keywords: t('光栅分辨本领 色分辨本领 R=kN 瑞利判据 双线 光谱分辨', 'grating resolving power chromatic R = k N Rayleigh criterion doublet spectral resolution'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`R=\frac{\lambda}{\Delta\lambda}=kN`,
    variants: [
      { name: t('可分辨的最小波长差', 'Minimum resolvable wavelength separation'), latex: String.raw`\Delta\lambda=\frac{\lambda}{kN}` },
    ],
  },
  meaning: t(
    '光栅分辨本领 R = λ/Δλ 是刚能分辨的两条谱线的平均波长与波长差之比。它只等于"级次 k × 总缝数 N"——与光栅常数 d 无关。这意味着想分辨钠双线（589.0/589.6 nm），就得用足够多的刻线，而不是把刻线刻得更密。',
    'The grating resolving power R = λ/Δλ is the ratio of the mean wavelength of two just-resolvable lines to their separation. It equals only "order k × total slits N" — independent of the grating constant d. To split the sodium doublet (589.0/589.6 nm) one therefore needs more grooves, not denser grooves.',
  ),
  symbols: [
    { sym: 'R', name: t('色分辨本领', 'chromatic resolving power'), unit: '1' },
    { sym: '\\lambda', name: t('平均波长（此处为波长）', 'mean wavelength — note: wavelength here'), unit: 'm' },
    { sym: '\\Delta\\lambda', name: t('刚能分辨的最小波长差', 'minimum resolvable wavelength difference'), unit: 'm' },
    { sym: 'k', name: t('光谱级次', 'spectral order'), unit: '1' },
    { sym: 'N', name: t('被照射的总缝数', 'total number of illuminated slits'), unit: '1' },
  ],
  conditions: {
    applies: [t('同一级次 k 内的两条谱线', 'Two lines within the same order k')],
    assumes: [t('按 Rayleigh 判据定义"刚能分辨"', '"Just resolvable" by the Rayleigh criterion')],
    breaks: [t('狭缝宽到出现缺级或像差时 R 下降', 'R drops if slit width causes missing orders or aberrations')],
  },
  links: {
    upstream: [{ id: 'opt-diffraction-grating' }],
    downstream: [{ id: 'opt-rayleigh-criterion' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §10.4' }],
}

export default optGratingResolvingPower
