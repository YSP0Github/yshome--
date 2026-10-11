import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-brewster-angle */
const optBrewsterAngle: FormulaCard = {
  id: 'opt-brewster-angle',
  name: t('Brewster 角（起偏角）', "Brewster's Angle (Polarizing Angle)"),
  aliases: { zh: ['布儒斯特角', 'tanθB = n2/n1', '起偏角'], en: ["Brewster's angle", 'tan theta_B = n2/n1', 'polarizing angle'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT'],
    keywords: t('布儒斯特角 起偏角 tanθB=n2/n1 反射全偏振 窗 激光器', "Brewster's angle polarizing angle fully polarized reflection polarizing window laser"),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\tan\theta_B=\frac{n_2}{n_1}`,
    variants: [
      { name: t('此时反射光线与折射光线垂直', 'At this angle reflected and refracted rays are perpendicular'), latex: String.raw`\theta_B+\theta_r=90^\circ` },
      { name: t('空气—玻璃（n2=1.5）', 'Air–glass (n2 = 1.5)'), latex: String.raw`\theta_B=\arctan 1.5\approx56.3^\circ` },
    ],
  },
  meaning: t(
    '自然光以特定角度射到介质界面时，反射光会成为完全线偏振光（垂直入射面），这个角度叫 Brewster 角，满足 tanθ_B = n₂/n₁。此时反射光与折射光恰好垂直（反射的 p 偏振分量为零）。激光器的"布儒斯特窗"、偏振太阳镜正是利用这一点。',
    'When unpolarized light strikes an interface at a special angle, the reflected ray becomes fully linearly polarized (perpendicular to the plane of incidence). That angle is Brewster’s angle, tanθ_B = n₂/n₁, at which the reflected and refracted rays are exactly perpendicular (the reflected p-polarized component vanishes). "Brewster windows" in lasers and polarized sunglasses exploit this.',
  ),
  symbols: [
    { sym: '\\theta_B', name: t('Brewster 角', "Brewster's angle"), unit: 'rad' },
    { sym: 'n_1,n_2', name: t('入射、折射介质折射率', 'indices of incident and refracting media'), unit: '1' },
    { sym: '\\theta_r', name: t('折射角', 'refraction angle'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('各向同性介质平面界面', 'Planar interface between isotropic media')],
    assumes: [t('入射光为自然光（非偏振）', 'Incident light is unpolarized (natural light)')],
    breaks: [t('金属反射面不产生纯偏振反射', 'Metal reflectors do not produce purely polarized reflection')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('由 Fresnel 公式 p 分量反射系数为零', 'Fresnel p-component reflection coefficient vanishes'), latex: String.raw`r_p=0\;\Rightarrow\;\theta_i+\theta_r=90^\circ` },
    { n: 2, op: 'substitute', title: t('代入 Snell 定律 n₁sinθB = n₂sinθr', 'Substitute Snell n1 sin θB = n2 sin θr'), latex: String.raw`n_1\sin\theta_B=n_2\sin(90^\circ-\theta_B)=n_2\cos\theta_B` },
    { n: 3, op: 'algebra', title: t('整理得 tanθB', 'Rearrange for tan θB'), latex: String.raw`\tan\theta_B=\frac{n_2}{n_1}` },
  ],
  links: {
    upstream: [{ id: 'opt-snell-law' }],
    downstream: [{ id: 'opt-malus-law' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §4.6' }],
}

export default optBrewsterAngle
