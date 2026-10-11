import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-heat-capacity */
const physHeatCapacity: FormulaCard = {
  id: 'phys-heat-capacity',
  name: t('热量与比热容', 'Heat and Specific Heat Capacity'),
  aliases: { zh: ['Q=cmΔT', '比热容'], en: ['heat', 'specific heat capacity', 'Q = cmΔT'] },
  node: 'S18.6',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('热量 比热容 热容 温度变化 Q=cmΔT 水的比热', 'heat specific heat capacity temperature change water c'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`Q=m\,c\,\Delta T`,
    variants: [
      { name: t('热容（升高 1 K 所需热量）', 'heat capacity (heat per K)'), latex: String.raw`C=\dfrac{Q}{\Delta T}=m c` },
    ],
  },
  meaning: t(
    '把物体升高一定温度 ΔT 需要的热量 Q 正比于质量 m 和温升，比例系数就是比热容 c。水的比热容特别大（4186 J/(kg·K)），所以海边昼夜温差小、热水袋暖和持久。水的「大脾气」正是地球气候温和的重要原因。',
    'The heat needed to raise a body by ΔT is proportional to its mass m and the temperature rise, with the specific heat c as the constant. Water has an unusually large c (4186 J/(kg·K)), which is why coastal climates stay mild and why hot-water bottles keep warm. Water’s “big capacity” is a major reason Earth’s climate is livable.',
  ),
  symbols: [
    { sym: 'Q', name: t('吸收/放出的热量', 'heat absorbed or released'), unit: 'J' },
    { sym: 'm', name: t('质量', 'mass'), unit: 'kg' },
    { sym: 'c', name: t('比热容', 'specific heat capacity'), unit: 'J/(kg·K)' },
    { sym: '\\Delta T', name: t('温度变化', 'temperature change'), unit: 'K' },
  ],
  conditions: {
    applies: [t('无相变、温度区间内 c 近似常数', 'No phase change, c roughly constant over the range')],
    assumes: [t('无化学反应', 'No chemical reaction')],
    breaks: [t('相变点需加潜热 L', 'At a phase transition add the latent heat L')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('热容定义为 dQ/dT', 'Heat capacity is dQ/dT'), latex: String.raw`C=\dfrac{\mathrm{d}Q}{\mathrm{d}T}` },
    { n: 2, op: 'algebra', title: t('c 为常数时积分', 'Integrate when c is constant'), latex: String.raw`Q=\int m c\,\mathrm{d}T=m c\Delta T` },
  ],
  links: { downstream: [{ id: 'phys-first-law-thermo' }] },
}

export default physHeatCapacity
