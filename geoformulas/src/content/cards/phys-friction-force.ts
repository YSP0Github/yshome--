import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-friction-force */
const physFrictionForce: FormulaCard = {
  id: 'phys-friction-force',
  name: t('静摩擦与动摩擦', 'Static and Kinetic Friction'),
  aliases: { zh: ['摩擦力', '摩擦系数'], en: ['friction', 'coefficient of friction'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('静摩擦 动摩擦 摩擦系数 正压力 μN 最大静摩擦', 'static kinetic friction coefficient normal force limiting friction'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`f_s\le \mu_s N,\qquad f_k=\mu_k N`,
    variants: [
      { name: t('最大静摩擦力', 'limiting static friction'), latex: String.raw`f_{s,\max}=\mu_s N` },
    ],
  },
  meaning: t(
    '两个接触面之间的摩擦力正比于正压力 N，比例系数就是摩擦系数。静摩擦是「被动力」：它随外力增大而增大，直到超过最大值 μ_s N 才开始滑动；一旦滑动，摩擦力突降为动摩擦 μ_k N，通常 μ_k < μ_s。这就是推动重物时「启动最难、动起来省力」的原因。',
    'The friction between two contact surfaces is proportional to the normal force N, with the friction coefficient as the constant. Static friction is a “passive” force: it grows with the applied push until it exceeds μ_s N, then slipping starts. Once sliding, friction drops to kinetic μ_k N, usually smaller — which is why starting a heavy crate is harder than keeping it moving.',
  ),
  symbols: [
    { sym: 'f_s', name: t('静摩擦力', 'static friction force'), unit: 'N' },
    { sym: 'f_k', name: t('动摩擦力', 'kinetic friction force'), unit: 'N' },
    { sym: '\\mu_s,\\mu_k', name: t('静、动摩擦系数', 'static and kinetic coefficients'), unit: '—', typical: '0.1 – 1.0' },
    { sym: 'N', name: t('正压力', 'normal force'), unit: 'N' },
  ],
  conditions: {
    applies: [t('干摩擦（Coulomb 摩擦）、固体接触面', 'Dry (Coulomb) friction between solid surfaces')],
    assumes: [t('系数与接触面积、相对速度无关的近似', 'Coefficients approximated independent of area and speed')],
    breaks: [t('润滑、流体膜或高速滑动时不成立', 'Breaks with lubrication, fluid films or high sliding speed')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('接触面挤压产生正压力 N', 'Contact surfaces are pressed together by N'), latex: String.raw`N=\text{垂直于接触面的合力}` },
    { n: 2, op: 'physics', title: t('静摩擦阻碍相对滑动趋势', 'Static friction opposes the tendency to slip'), latex: String.raw`f_s=F_{\text{外}}\ (\text{未滑动时})` },
    { n: 3, op: 'result', title: t('达到极限后滑动，摩擦降为 μ_k N', 'At the limit slipping starts and friction drops'), latex: String.raw`f_s\le\mu_s N,\quad f_k=\mu_k N` },
  ],
  links: {
    upstream: [{ id: 'phys-newton-second-law' }],
    downstream: [{ id: 'phys-inclined-plane' }],
  },
}

export default physFrictionForce
