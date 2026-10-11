import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rel-galilean-transformation */
const relGalileanTransformation: FormulaCard = {
  id: 'rel-galilean-transformation',
  name: t('Galilean 变换与经典时空观', 'Galilean Transformation and Classical Spacetime'),
  aliases: { zh: ['伽利略变换', 'u′=u−v'], en: ['Galilean transformation', "u' = u - v"] },
  node: 'S20.4',
  tags: {
    math: ['MATH.LINALG', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL', 'Q.TIME'],
    keywords: t('伽利略变换 经典时空 绝对速度叠加 绝对时间 惯性系', 'Galilean transformation classical spacetime velocity addition absolute time inertial frame'),
  },
  audience: 'highschool',
  complete: 'L1',
  statement: {
    main: String.raw`x'=x-vt,\qquad t'=t,\qquad u'=u-v`,
    variants: [
      { name: t('速度叠加', 'Velocity addition'), latex: String.raw`u'_x=u_x-v` },
    ],
  },
  meaning: t(
    '在牛顿的经典世界里，从匀速运动的参考系看另一参考系，坐标按 x′=x−vt 变换，时间是绝对的 t′=t，速度直接相减 u′=u−v。这就是"船上的球和岸上的球遵循同样力学定律"的数学表达——Galileo 早在 1632 年就描述了它。但它在光速面前失效，于是有了狭义相对论。',
    "In Newton's classical world, transforming between frames moving at constant velocity gives x′ = x − vt, with absolute time t′ = t and velocities subtracted directly, u′ = u − v. This is the mathematics behind 'a ball on a ship obeys the same mechanics as a ball on shore' — described by Galileo in 1632. But it fails at the speed of light, which is why special relativity was needed.",
  ),
  symbols: [
    { sym: "x,x'", name: t('两参考系中的坐标', 'coordinates in the two frames'), unit: 'm' },
    { sym: "t,t'", name: t('时间（经典中绝对）', 'time (absolute in classical physics)'), unit: 's' },
    { sym: 'v', name: t('两参考系相对速度', 'relative speed of the two frames'), unit: 'm/s' },
    { sym: "u,u'", name: t('物体在两系中的速度', 'object velocity in the two frames'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('远小于光速的日常速度', 'Everyday speeds much below c')],
    assumes: [t('时间与空间互不相关', 'Time and space are independent')],
    breaks: [t('速度接近 c 时必须用 Lorentz 变换', 'Near c the Lorentz transformation must be used')],
  },
  links: {
    downstream: [{ id: 'rel-lorentz-transformation' }],
    seealso: [{ id: 'rel-sr-postulates' }],
  },
  refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 1' }],
}

export default relGalileanTransformation
