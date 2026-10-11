import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-rotational-kinetic-energy */
const physRotationalKineticEnergy: FormulaCard = {
  id: 'phys-rotational-kinetic-energy',
  name: t('转动动能', 'Rotational Kinetic Energy'),
  aliases: { zh: ['转动动能 ½Iω²'], en: ['rotational kinetic energy', '½Iω²'] },
  node: 'S18.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('转动动能 ½Iω² 纯滚动 飞轮储能', 'rotational kinetic energy rolling flywheel energy storage'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`K_{\text{rot}}=\tfrac{1}{2}I\omega^{2}`,
    variants: [
      { name: t('纯滚动总动能', 'total KE of rolling without slipping'), latex: String.raw`K=\tfrac{1}{2}M v_{\mathrm{cm}}^{2}+\tfrac{1}{2}I\omega^{2},\quad v_{\mathrm{cm}}=R\omega` },
    ],
  },
  meaning: t(
    '刚体转动具有的动能是 ½Iω²，把平动动能 ½mv² 里的 m 换成 I、v 换成 ω 即可。一个既往前走又在转的轮子，总动能是平动加转动两部分。飞轮就是靠高速转动储存能量的装置。',
    'A rotating body has kinetic energy ½Iω², obtained from ½mv² by replacing m with I and v with ω. A wheel that both translates and spins carries the sum of both kinds of kinetic energy. A flywheel stores energy precisely by spinning fast.',
  ),
  symbols: [
    { sym: 'K_{rot}', name: t('转动动能', 'rotational kinetic energy'), unit: 'J' },
    { sym: 'I', name: t('转动惯量', 'moment of inertia'), unit: 'kg·m²' },
    { sym: '\\omega', name: t('角速度', 'angular velocity'), unit: 'rad/s' },
  ],
  conditions: {
    applies: [t('绕固定轴转动的刚体', 'Rigid body rotating about a fixed axis')],
    assumes: [t('非相对论', 'Non-relativistic')],
    breaks: [t('近光速需相对论动能', 'Relativistic KE near light speed')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('质元动能求和', 'Sum KE of mass elements'), latex: String.raw`K=\sum \tfrac{1}{2}m_i v_i^{2}` },
    { n: 2, op: 'substitute', title: t('v_i=ω r_i', 'Substitute v_i = ω r_i'), latex: String.raw`K=\sum \tfrac{1}{2}m_i \omega^{2} r_i^{2}` },
    { n: 3, op: 'algebra', title: t('提出 ½ω²，余下为 I', 'Pull out ½ω²; the rest is I'), latex: String.raw`K=\tfrac{1}{2}\left(\sum m_i r_i^{2}\right)\omega^{2}=\tfrac{1}{2}I\omega^{2}` },
  ],
  links: {
    upstream: [{ id: 'phys-kinetic-energy' }, { id: 'phys-moment-of-inertia' }],
    seealso: [{ id: 'phys-conservation-mechanical-energy' }],
  },
}

export default physRotationalKineticEnergy
