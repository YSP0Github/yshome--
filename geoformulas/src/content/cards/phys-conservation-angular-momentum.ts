import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-conservation-angular-momentum */
const physConservationAngularMomentum: FormulaCard = {
  id: 'phys-conservation-angular-momentum',
  name: t('角动量守恒定律', 'Conservation of Angular Momentum'),
  aliases: { zh: ['角动量守恒', '缩臂加速'], en: ['conservation of angular momentum'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('角动量守恒 无外力矩 滑冰 跳水 旋转收缩', 'conservation angular momentum no external torque skater diver'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\sum \tau_{\text{ext}}=0\;\Longrightarrow\; L=I\omega=\text{常量}`,
    variants: [
      { name: t('I 变 ω 随之反向变', 'I changes, ω adjusts inversely'), latex: String.raw`I_1\omega_1=I_2\omega_2\;\Rightarrow\; \omega_2=\dfrac{I_1}{I_2}\omega_1` },
    ],
  },
  meaning: t(
    '当系统所受合外力矩为零时，总角动量守恒。花样滑冰运动员收拢手臂（I 变小），旋转就自动加快（ω 变大），乘积 Iω 不变；跳水运动员抱膝时翻得快，展开身体入水时慢下来，都是这条定律在起作用。',
    'When the net external torque on a system is zero, total angular momentum is conserved. A skater pulling in the arms (smaller I) spins faster (larger ω) so that Iω is unchanged; a diver tucks to flip quickly and opens up to slow down before entering the water — both follow this law.',
  ),
  symbols: [
    { sym: '\\sum\\tau_{ext}', name: t('合外力矩', 'net external torque'), unit: 'N·m' },
    { sym: 'I', name: t('转动惯量', 'moment of inertia'), unit: 'kg·m²' },
    { sym: '\\omega', name: t('角速度', 'angular velocity'), unit: 'rad/s' },
  ],
  conditions: {
    applies: [t('合外力矩为零的孤立系统', 'An isolated system with zero net external torque')],
    assumes: [t('内力不改变总角动量', 'Internal forces do not change total L')],
    breaks: [t('外力矩存在时 L 随时间变化', 'L evolves when external torque is present')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('τ = dL/dt', 'Torque = rate of change of L'), latex: String.raw`\tau_{\text{ext}}=\dfrac{\mathrm{d}L}{\mathrm{d}t}` },
    { n: 2, op: 'setup', title: t('无外力矩', 'No external torque'), latex: String.raw`\tau_{\text{ext}}=0` },
    { n: 3, op: 'result', title: t('L 不随时间变', 'L is constant in time'), latex: String.raw`I_1\omega_1=I_2\omega_2` },
  ],
  links: {
    upstream: [{ id: 'phys-angular-momentum' }],
    seealso: [{ id: 'phys-conservation-momentum' }],
  },
}

export default physConservationAngularMomentum
