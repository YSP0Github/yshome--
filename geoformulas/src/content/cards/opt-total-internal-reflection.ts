import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-total-internal-reflection */
const optTotalInternalReflection: FormulaCard = {
  id: 'opt-total-internal-reflection',
  name: t('全反射与临界角', 'Total Internal Reflection and Critical Angle'),
  aliases: { zh: ['TIR', '临界角 sinθc=n2/n1'], en: ['TIR', 'critical angle sin theta_c = n2/n1'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.GEOM'],
    keywords: t('全反射 临界角 光密到光疏 光纤 内反射', 'total internal reflection critical angle dense to rare optical fiber'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\sin\theta_c=\frac{n_2}{n_1}\qquad(n_1>n_2)`,
    variants: [
      { name: t('入射角超过临界角时无折射光', 'Beyond the critical angle there is no refracted ray'), latex: String.raw`\theta_1>\theta_c\;\Rightarrow\;\text{全部能量反射回介质 1}` },
      { name: t('水—空气界面临界角（n1=1.33）', 'Water–air critical angle (n1 = 1.33)'), latex: String.raw`\theta_c=\arcsin\frac{1}{1.33}\approx48.8^\circ` },
    ],
  },
  meaning: t(
    '光从光密介质（n₁）射向光疏介质（n₂<n₁）时，折射角大于入射角；当入射角增大到使折射角恰为 90° 时，这个入射角叫临界角 θc，满足 sinθc = n₂/n₁。入射角再大就发生全反射，光完全不逸出——光纤、内窥镜与钻石的火彩都靠它。',
    'When light travels from a denser medium (n1) toward a rarer one (n2 < n1), the refraction angle exceeds the incidence angle. At the incidence angle where the refracted ray grazes the interface (90°), that angle is the critical angle theta_c with sin theta_c = n2/n1. Beyond it light undergoes total internal reflection and never escapes — the principle behind optical fibers, endoscopes and the fire of diamonds.',
  ),
  symbols: [
    { sym: '\\theta_c', name: t('临界角', 'critical angle'), unit: 'rad' },
    { sym: 'n_1', name: t('光密介质折射率', 'index of the denser medium'), unit: '1' },
    { sym: 'n_2', name: t('光疏介质折射率', 'index of the rarer medium'), unit: '1' },
  ],
  conditions: {
    applies: [t('光线由光密射向光疏（n₁>n₂）', 'Light travels from a denser to a rarer medium (n1 > n2)')],
    assumes: [t('界面光滑、无吸收', 'Smooth interface, no absorption')],
    breaks: [t('n₁<n₂ 时不可能发生全反射', 'TIR is impossible when n1 < n2')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('由 Snell 定律出发', 'Start from Snell’s law'), latex: String.raw`n_1\sin\theta_1=n_2\sin\theta_2` },
    { n: 2, op: 'setup', title: t('临界状态：折射角恰为 90°', 'Critical state: refraction angle is exactly 90°'), latex: String.raw`\theta_2=90^\circ,\qquad \sin\theta_2=1` },
    { n: 3, op: 'algebra', title: t('代入解出临界角', 'Substitute and solve for the critical angle'), latex: String.raw`n_1\sin\theta_c=n_2\;\Rightarrow\;\sin\theta_c=\frac{n_2}{n_1}` },
  ],
  links: {
    upstream: [{ id: 'opt-snell-law' }],
    seealso: [{ id: 'critical-angle-total-reflection', note: t('地震学中的全反射临界角', 'critical-angle TIR in seismology') }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., ' }],
}

export default optTotalInternalReflection
