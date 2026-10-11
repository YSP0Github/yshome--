import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-sound-intensity-level */
const physSoundIntensityLevel: FormulaCard = {
  id: 'phys-sound-intensity-level',
  name: t('声强与分贝', 'Sound Intensity Level (Decibel)'),
  aliases: { zh: ['分贝 dB', '声强级'], en: ['sound intensity level', 'decibel', 'dB'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.AMP'],
    keywords: t('声强 分贝 dB 对数标度 参考强度 噪音', 'sound intensity decibel dB log scale reference noise'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\beta=10\log_{10}\!\left(\frac{I}{I_0}\right)`,
    variants: [
      { name: t('点源声强随距离衰减', 'inverse-square intensity of a point source'), latex: String.raw`I=\dfrac{P}{4\pi r^{2}}` },
    ],
  },
  meaning: t(
    '人耳能听到的声强范围极宽（10⁻¹² 到 1 W/m²，跨 12 个数量级），所以用对数分贝标度 β 来表示：β=10 log(I/I₀)，参考声强 I₀=10⁻¹² W/m² 是听阈。声强每变 10 倍，分贝加 10；每翻倍约加 3 dB。轻声耳语约 30 dB，繁忙马路约 80 dB，摇滚音乐会可达 110 dB。',
    'The range of human hearing spans 12 orders of magnitude (10⁻¹² to 1 W/m²), so we use the logarithmic decibel scale β = 10 log(I/I₀), with the reference I₀ = 10⁻¹² W/m² as the threshold of hearing. Tenfold intensity adds 10 dB; doubling adds about 3 dB. A whisper is ~30 dB, a busy road ~80 dB, a rock concert up to 110 dB.',
  ),
  symbols: [
    { sym: '\\beta', name: t('声强级', 'sound intensity level'), unit: 'dB' },
    { sym: 'I', name: t('声强', 'sound intensity'), unit: 'W/m²' },
    { sym: 'I_0', name: t('参考声强（听阈）', 'reference intensity (threshold)'), unit: 'W/m²', typical: '10⁻¹²' },
  ],
  conditions: {
    applies: [t('空气中的声波强度', 'Acoustic intensity in air')],
    assumes: [t('对数以 10 为底', 'Base-10 logarithm')],
    breaks: [t('多源叠加应对强度相加再取分贝', 'Combine sources by adding intensities, not dB')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('声强定义为能流密度', 'Intensity is the power flux'), latex: String.raw`I=\dfrac{P}{A}` },
    { n: 2, op: 'physics', title: t('人耳响应近似对数', 'Ear response is roughly logarithmic'), latex: String.raw`\beta=10\log_{10}\dfrac{I}{I_0}` },
  ],
  links: { seealso: [{ id: 'phys-wave-speed-relation' }] },
}

export default physSoundIntensityLevel
