import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-electric-power */
const uemElectricPower: FormulaCard = {
  id: 'uem-electric-power',
  name: t('电功率与焦耳热', 'Electric Power and Joule Heating'),
  aliases: { zh: ['P=UI=I²R', '焦耳定律'], en: ['electric power', 'Joule heating'] },
  node: 'S19.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.ELEC'],
    keywords: t('电功率 P=UI=I²R=U²/R 焦耳热 发热功率', 'electric power P=UI I squared R Joule heat dissipation'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`P=UI=I^{2}R=\frac{U^{2}}{R}`,
    variants: [
      { name: t('焦耳热（单位时间）', 'Joule heat rate'), latex: String.raw`P=I^{2}R` },
      { name: t('时间 t 内热量', 'Heat over time t'), latex: String.raw`Q_{\text{heat}}=I^{2}R\,t` },
    ],
  },
  meaning: t(
    '电功率是电场力做功的速率。纯电阻电路中电能全部转化为热：P=UI=I²R=U²/R。这解释了为何大电流导线发热（I²R），也是电热器、保险丝的原理。',
    'Electric power is the rate at which the field does work. In a purely resistive circuit all energy becomes heat: P=UI=I²R=U²/R. This explains why high-current wires heat up (I²R) and underlies heaters and fuses.',
  ),
  symbols: [
    { sym: 'P', name: t('电功率', 'electric power'), unit: 'W' },
    { sym: 'U', name: t('电压', 'voltage'), unit: 'V' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
  ],
  conditions: {
    applies: [t('直流或稳态；纯电阻负载', 'DC or steady state; resistive load')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('功率=电压×电流', 'Power = voltage × current'),
      latex: String.raw`P=\dfrac{dW}{dt}=\dfrac{U\,dq}{dt}=UI` },
    { n: 2, op: 'substitute', title: t('代入 U=IR', 'Substitute U=IR'),
      latex: String.raw`P=(IR)I=I^{2}R` },
    { n: 3, op: 'algebra', title: t('或代入 I=U/R', 'Or I=U/R'),
      latex: String.raw`P=U\dfrac{U}{R}=\dfrac{U^{2}}{R}` },
  ],
  links: {
    upstream: [{ id: 'uem-ohms-law' }],
    seealso: [{ id: 'uem-ac-power-factor' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §26' }],
}

export default uemElectricPower
