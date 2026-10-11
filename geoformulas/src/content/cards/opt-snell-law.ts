import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-snell-law */
const optSnellLaw: FormulaCard = {
  id: 'opt-snell-law',
  name: t('Snell 折射定律', "Snell's Law of Refraction"),
  aliases: { zh: ['折射定律', 'n1 sinθ1 = n2 sinθ2'], en: ['law of refraction', 'n1 sin theta1 = n2 sin theta2'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.GEOM'],
    keywords: t('折射定律 Snell n1 n2 入射角 折射角 偏折', "Snell's law refraction incidence angle refraction angle bending"),
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`n_1\sin\theta_1=n_2\sin\theta_2`,
    variants: [
      { name: t('光线由光疏进入光密（n2>n1），折向法线', 'From rarer to denser medium, ray bends toward the normal'), latex: String.raw`\theta_2<\theta_1\quad(n_2>n_1)` },
      { name: t('反之折离法线', 'Reverse case: ray bends away from the normal'), latex: String.raw`\theta_2>\theta_1\quad(n_2<n_1)` },
    ],
  },
  meaning: t(
    '光线穿过两种介质界面时，入射角与折射角的正弦之比等于两介质折射率的反比——即 n₁ sinθ₁ = n₂ sinθ₂。光从光疏介质进入光密介质时折向法线，反之折离法线。它是解释透镜成像、棱镜分光与水中筷子"折断"的核心定律。',
    'When a ray crosses the interface of two media, the sines of incidence and refraction angles are in the inverse ratio of the refractive indices: n₁ sinθ₁ = n₂ sinθ₂. Entering a denser medium bends the ray toward the normal; leaving it bends the ray away. It is the key law behind lenses, prisms and the apparent "broken" stick in water.',
  ),
  symbols: [
    { sym: 'n_1,n_2', name: t('介质 1、2 的折射率', 'refractive indices of media 1 and 2'), unit: '1' },
    { sym: '\\theta_1', name: t('入射角（相对法线）', 'angle of incidence from the normal'), unit: 'rad' },
    { sym: '\\theta_2', name: t('折射角（相对法线）', 'angle of refraction from the normal'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('各向同性介质、单色光在平面界面上', 'Isotropic media, monochromatic light at a planar interface')],
    assumes: [t('两介质接触良好，无吸收', 'The two media are in optical contact, without absorption')],
    breaks: [t('入射角超过临界角时发生全反射，无折射光', 'Beyond the critical angle total internal reflection occurs and there is no refracted ray')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('界面上相位必须连续', 'Phase must be continuous along the interface'), latex: String.raw`k_1\sin\theta_1=k_2\sin\theta_2` },
    { n: 2, op: 'substitute', title: t('代入 k=2πn/λ（同一频率）', 'Substitute k = 2π n over lambda (same frequency)'), latex: String.raw`k_1=\frac{2\pi n_1}{\lambda_0},\qquad k_2=\frac{2\pi n_2}{\lambda_0}` },
    { n: 3, op: 'algebra', title: t('约去公共因子', 'Cancel the common factor'), latex: String.raw`n_1\sin\theta_1=n_2\sin\theta_2` },
  ],
  viz: [
    {
      id: 'snell-curve',
      level: 'V1',
      title: t('折射角 θ₂ 随入射角 θ₁ 的变化', 'Refraction angle theta2 versus incidence angle theta1'),
      xlabel: t('入射角 θ₁ (°)', 'incidence angle theta1 (deg)'),
      ylabel: t('折射角 θ₂ (°)', 'refraction angle theta2 (deg)'),
      controls: [
        { id: 'n1', label: t('入射侧折射率 n₁', 'incident-side index n1'), min: 1.0, max: 1.5, step: 0.01, value: 1.0, unit: '1' },
        { id: 'n2', label: t('折射侧折射率 n₂', 'refracted-side index n2'), min: 1.0, max: 2.0, step: 0.01, value: 1.5, unit: '1' },
      ],
      xRange: [0, 90],
      note: t('曲线始终在对角线下方（n₂>n₁ 时折向法线）。当 n₂<n₁ 且 sinθ₁ 超过 n₂/n₁ 时，折射角达到 90° 后不再增大——即全反射临界角。',
        'The curve stays below the diagonal when n2 > n1 (toward the normal). When n2 < n1, once n1/n2 sin theta1 exceeds 1 the refraction angle reaches 90° and stops — the critical angle for total internal reflection.'),
      compute: (p) => {
        const n1 = p['n1']
        const n2 = p['n2']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const th1 = (i / 180) * (Math.PI / 2)
          const s = (n1 / n2) * Math.sin(th1)
          const th2 = s >= 1 ? Math.PI / 2 : Math.asin(s)
          pts.push([(th1 * 180) / Math.PI, (th2 * 180) / Math.PI])
        }
        return [{ label: t('θ₂(θ₁)', 'theta2(theta1)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'opt-refractive-index' }],
    downstream: [{ id: 'opt-total-internal-reflection' }, { id: 'opt-lensmaker-equation' }],
    seealso: [{ id: 'snell-law-converted-waves', note: t('地震波中的 Snell 定律', "Snell's law for seismic waves") }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §4.7' }],
}

export default optSnellLaw
