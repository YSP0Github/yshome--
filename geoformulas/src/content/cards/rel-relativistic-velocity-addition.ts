import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rel-relativistic-velocity-addition */
const relRelativisticVelocityAddition: FormulaCard = {
  id: 'rel-relativistic-velocity-addition',
  name: t('相对论速度合成', 'Relativistic Velocity Addition'),
  aliases: { zh: ['速度叠加公式', 'u=(u′+v)/(1+u′v/c²)'], en: ['relativistic velocity addition', 'u = (u\'+v)/(1+u\'v/c^2)'] },
  node: 'S20.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL'],
    keywords: t('相对论速度合成 速度叠加 光速不变 追光', 'relativistic velocity addition speed composition constancy of light chasing light'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`u=\frac{u'+v}{1+\dfrac{u'v}{c^2}}`,
    variants: [
      { name: t('低速时退回 Galileo 叠加', 'Reduces to Galilean addition at low speed'), latex: String.raw`u'\ll c,\ v\ll c\ \Rightarrow\ u\approx u'+v` },
    ],
  },
  meaning: t(
    '两速度不能再直接相加。若 S′ 系相对 S 系以 v 运动，物体在 S′ 系中速度为 u′，则在 S 系中不是 u′+v，而是 u=(u′+v)/(1+u′v/c²)。分母那个修正项保证：哪怕两束光相向而行，相对速度也不会超过 c——你永远追不上光，光速对任何观察者都是 c。',
    'Velocities can no longer be added directly. If frame S′ moves at v relative to S and an object has speed u′ in S′, then in S its speed is not u′+v but u = (u′+v)/(1+u′v/c²). The denominator correction guarantees that even when two light beams approach head-on, their relative speed never exceeds c — you can never catch light, and c is c for every observer.'
  ),
  symbols: [
    { sym: "u'", name: t('物体在 S′ 系中的速度', 'object speed in frame S′'), unit: 'm/s' },
    { sym: 'v', name: t('S′ 相对 S 的速度', 'speed of S′ relative to S'), unit: 'm/s' },
    { sym: 'u', name: t('物体在 S 系中的速度', 'object speed in frame S'), unit: 'm/s' },
    { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('沿同一直线运动的速度合成', 'Velocity composition along one line')],
    assumes: [t('惯性系之间', 'Between inertial frames')],
    breaks: [t('低速时近似 u≈u′+v', 'At low speed, u ≈ u′+v')],
  },
  derivation: [
    { n: 1, op: 'transform', title: t('由 Lorentz 变换微分', 'Differentiate the Lorentz transformation'), latex: String.raw`u=\frac{dx}{dt}=\frac{\gamma(dx'+v\,dt')}{\gamma(dt'+v\,dx'/c^2)}` },
    { n: 2, op: 'algebra', title: t('分子分母同除 dt′', 'Divide numerator and denominator by dt′'), latex: String.raw`u=\frac{u'+v}{1+u'v/c^2}` },
  ],
  links: {
    upstream: [{ id: 'rel-lorentz-transformation' }],
    seealso: [{ id: 'rel-time-dilation' }],
  },
  refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 3' }],
}

export default relRelativisticVelocityAddition
