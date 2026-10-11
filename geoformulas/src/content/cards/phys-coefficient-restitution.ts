import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-coefficient-restitution */
const physCoefficientRestitution: FormulaCard = {
  id: 'phys-coefficient-restitution',
  name: t('恢复系数', 'Coefficient of Restitution'),
  aliases: { zh: ['碰撞恢复系数 e'], en: ['coefficient of restitution', 'e'] },
  node: 'S18.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('恢复系数 e 碰撞 相对速度 弹回 1 弹性 0 完全非弹性', 'coefficient of restitution relative speed rebound elastic inelastic'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`e=\frac{v_2'-v_1'}{v_1-v_2}`,
    variants: [
      { name: t('球撞固定壁', 'ball hitting a fixed wall'), latex: String.raw`e=\dfrac{v_{\text{反弹}}}{v_{\text{入射}}}` },
      { name: t('回弹高度', 'rebound height'), latex: String.raw`e=\sqrt{\dfrac{h_{\text{弹起}}}{h_{\text{落下}}}}` },
    ],
  },
  meaning: t(
    '恢复系数 e 是碰后与碰前相对速率之比，把碰撞的「弹性程度」量化：e=1 是完全弹性（无损失），e=0 是完全非弹性（粘住不动），中间值 0<e<1 就是日常碰撞。测一个球从 h 落下能弹多高，就能算出它和地面的 e。',
    'The coefficient e is the ratio of post- to pre-collision relative speed, quantifying how “bouncy” a collision is: e = 1 perfectly elastic, e = 0 perfectly inelastic (stuck), and 0 < e < 1 for everyday impacts. Drop a ball from height h and measure the rebound height to get its e against the floor.',
  ),
  symbols: [
    { sym: 'e', name: t('恢复系数', 'coefficient of restitution'), unit: '—', typical: '0 – 1' },
    { sym: "v_1-v_2", name: t('碰前接近速率', 'approach speed'), unit: 'm/s' },
    { sym: "v_2'-v_1'", name: t('碰后分离速率', 'separation speed'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('一维对心碰撞', 'Head-on one-dimensional collisions')],
    assumes: [t('e 视为材料常数', 'e treated as a material constant')],
    breaks: [t('高速下 e 随速度变化', 'e varies with speed at high impact')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义分离/接近速率比', 'Define the ratio of separation to approach speed'), latex: String.raw`e=\dfrac{\text{分离速率}}{\text{接近速率}}` },
    { n: 2, op: 'identity', title: t('用速度差写出', 'Write in terms of velocity differences'), latex: String.raw`e=\dfrac{v_2'-v_1'}{v_1-v_2}` },
    { n: 3, op: 'result', title: t('与动量守恒联立即得一般碰撞解', 'Combine with momentum conservation for the general collision'), latex: String.raw`e=1\Rightarrow\text{弹性},\quad e=0\Rightarrow\text{完全非弹性}` },
  ],
  links: {
    upstream: [{ id: 'phys-elastic-collision' }, { id: 'phys-inelastic-collision' }],
    seealso: [{ id: 'phys-conservation-momentum' }],
  },
}

export default physCoefficientRestitution
