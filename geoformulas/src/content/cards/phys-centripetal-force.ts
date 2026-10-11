import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-centripetal-force */
const physCentripetalForce: FormulaCard = {
  id: 'phys-centripetal-force',
  name: t('向心力', 'Centripetal Force'),
  aliases: { zh: ['离心力（惯性系）', '圆周运动动力学'], en: ['centripetal force', 'centrifugal (in rotating frame)'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL', 'Q.GEOM'],
    keywords: t('向心力 圆周运动 向心力公式 转弯 圆锥摆', 'centripetal force circular motion turning conical pendulum'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`F_c=m\frac{v^{2}}{r}=m\omega^{2}r`,
    variants: [
      { name: t('汽车水平转弯（摩擦提供向心力）', 'level road turn (friction provides it)'), latex: String.raw`\mu m g=m\dfrac{v^{2}}{r}\;\Rightarrow\; v_{\max}=\sqrt{\mu g r}` },
      { name: t('倾斜路面（banked curve）', 'banked curve'), latex: String.raw`\tan\theta=\dfrac{v^{2}}{rg}` },
    ],
  },
  meaning: t(
    '做圆周运动需要一个始终指向圆心的合力，它把速度矢量不断掰向圆心。向心力不是新出现的「第五种力」，而是已有的某个力（摩擦、张力、重力、弹力……）在径向的分量之和。在旋转参考系里，人们会引入一个向外的「离心力」来形式上平衡它，但那是惯性力。',
    'Circular motion needs a net force always pointing to the centre, continuously bending the velocity vector. Centripetal force is not a new “fifth force”; it is the radial component sum of familiar forces (friction, tension, gravity, normal…). In a rotating frame one may introduce an outward “centrifugal” force to balance it formally, but that is a fictitious inertial force.',
  ),
  symbols: [
    { sym: 'F_c', name: t('向心力大小', 'centripetal force magnitude'), unit: 'N' },
    { sym: 'm', name: t('质量', 'mass'), unit: 'kg' },
    { sym: 'v', name: t('线速率', 'linear speed'), unit: 'm/s' },
    { sym: 'r', name: t('圆周半径', 'radius'), unit: 'm' },
    { sym: '\\omega', name: t('角速度', 'angular velocity'), unit: 'rad/s' },
  ],
  conditions: {
    applies: [t('质点沿半径 r 的圆周运动', 'A particle on a circle of radius r')],
    assumes: [t('惯性参考系', 'Inertial reference frame')],
    breaks: [t('变速圆周运动需再叠加切向力', 'Add a tangential force for non-uniform circular motion')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('向心加速度 a_c = v²/r', 'Centripetal acceleration a_c = v²/r'), latex: String.raw`a_c=\dfrac{v^{2}}{r}` },
    { n: 2, op: 'physics', title: t('由 Newton 第二定律乘质量', 'Multiply by m via Newton II'), latex: String.raw`F_c=m a_c=m\dfrac{v^{2}}{r}=m\omega^{2}r` },
  ],
  links: {
    upstream: [{ id: 'phys-uniform-circular-motion', note: t('运动学 → 乘质量得力', 'Kinematics → times m gives the force') }],
    downstream: [{ id: 'phys-satellite-orbit', note: t('重力恰好提供向心力', 'Gravity supplies the centripetal force') }],
  },
}

export default physCentripetalForce
