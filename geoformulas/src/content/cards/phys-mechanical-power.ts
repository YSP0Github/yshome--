import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-mechanical-power */
const physMechanicalPower: FormulaCard = {
  id: 'phys-mechanical-power',
  name: t('功率', 'Mechanical Power'),
  aliases: { zh: ['功率 P=Fv'], en: ['power', 'P = F v'] },
  node: 'S18.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.TIME'],
    keywords: t('功率 瓦特 做功快慢 P=Fv 额定功率', 'power watt rate of work Fv rated power'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`P=\frac{W}{t}=\mathbf{F}\cdot\mathbf{v}=F\,v\cos\theta`,
    variants: [
      { name: t('瞬时功率', 'instantaneous power'), latex: String.raw`P=\dfrac{\mathrm{d}W}{\mathrm{d}t}` },
    ],
  },
  meaning: t(
    '功率描述做功的快慢，单位是瓦特（1 W = 1 J/s）。做同样多的功，用的时间越短功率越大。当力与速度方向相同时，P=Fv：汽车低速挡牵引力大、高速挡速度高，正是发动机额定功率 P 有限时 F 与 v 的此消彼长。',
    'Power measures how fast work is done, in watts (1 W = 1 J/s). For the same work, shorter time means higher power. When force and velocity align, P = F v: a car’s low gear gives large pull and high gear gives high speed, the trade-off forced by the engine’s limited rated power P.',
  ),
  symbols: [
    { sym: 'P', name: t('功率', 'power'), unit: 'W' },
    { sym: 'W', name: t('功', 'work'), unit: 'J' },
    { sym: 't', name: t('时间', 'time'), unit: 's' },
    { sym: 'F', name: t('力', 'force'), unit: 'N' },
    { sym: 'v', name: t('速率', 'speed'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('力作用下运动的物体', 'A body moving under a force')],
    assumes: [t('P=Fv 中力与速度同向', 'P = F v assumes force parallel to velocity')],
    breaks: [t('力与速度垂直时瞬时功率为零', 'Power is zero when force ⊥ velocity')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('平均功率为单位时间做功', 'Average power is work per unit time'), latex: String.raw`\bar{P}=\dfrac{W}{t}` },
    { n: 2, op: 'substitute', title: t('恒力功 W=F·d', 'Constant-force work W = F·d'), latex: String.raw`P=\dfrac{F d}{t}=F\dfrac{d}{t}` },
    { n: 3, op: 'identity', title: t('d/t 即速度 v', 'd/t is the velocity v'), latex: String.raw`P=F v` },
  ],
  links: { seealso: [{ id: 'phys-work-by-force' }] },
}

export default physMechanicalPower
