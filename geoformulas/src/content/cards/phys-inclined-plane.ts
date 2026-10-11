import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-inclined-plane */
const physInclinedPlane: FormulaCard = {
  id: 'phys-inclined-plane',
  name: t('斜面受力分析', 'Forces on an Inclined Plane'),
  aliases: { zh: ['斜面', '斜面上的物体'], en: ['inclined plane', 'object on a slope'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.GEOM'],
    keywords: t('斜面 重力分解 正压力 下滑力 摩擦角', 'inclined plane gravity components normal force friction angle'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`N=mg\cos\theta,\qquad mg\sin\theta-f=ma`,
    variants: [
      { name: t('刚好下滑的摩擦角', 'angle of repose'), latex: String.raw`\tan\theta=\mu_s\;\Rightarrow\; \theta=\arctan\mu_s` },
      { name: t('光滑斜面加速度', 'acceleration on a smooth incline'), latex: String.raw`a=g\sin\theta` },
    ],
  },
  meaning: t(
    '把重力 mg 沿斜面和垂直斜面两个方向分解：垂直分量 mg cosθ 压在斜面上、决定正压力；沿斜面向下分量 mg sinθ 是「下滑力」。两者相减（再减摩擦）就是沿斜面的合力。物体刚好不滑下时，tanθ=μ_s，这个 θ 叫摩擦角——可以直接用它从坡度读出摩擦系数。',
    'Resolve gravity mg along and normal to the slope: the normal component mg cosθ presses the surface and sets the normal force; the down-slope component mg sinθ is the “driving” force. Their difference (minus friction) is the net force along the plane. When the body just stops sliding, tanθ = μ_s; this angle of repose lets you read off the friction coefficient from a slope.',
  ),
  symbols: [
    { sym: 'N', name: t('斜面对物体的支持力', 'normal reaction from the plane'), unit: 'N' },
    { sym: 'mg\\sin\\theta', name: t('沿斜面向下的重力分量', 'down-slope component of weight'), unit: 'N' },
    { sym: 'mg\\cos\\theta', name: t('垂直斜面的重力分量', 'normal component of weight'), unit: 'N' },
    { sym: '\\theta', name: t('斜面倾角', 'inclination angle'), unit: 'rad' },
    { sym: 'f', name: t('摩擦力', 'friction force'), unit: 'N' },
  ],
  conditions: {
    applies: [t('物体静止或沿斜面滑动', 'A body resting on or sliding along a slope')],
    assumes: [t('斜面刚性、物体视为质点', 'Rigid plane, body treated as a point mass')],
    breaks: [t('物体有转动或翻倒趋势时需考虑力矩', 'Torques matter if the body may tip or rotate')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('建立沿斜面/垂直斜面坐标', 'Set axes along and normal to the plane'), latex: String.raw`x\parallel\text{斜面},\quad y\perp\text{斜面}` },
    { n: 2, op: 'substitute', title: t('分解重力', 'Decompose weight'), latex: String.raw`mg_x=mg\sin\theta,\quad mg_y=mg\cos\theta` },
    { n: 3, op: 'physics', title: t('垂直方向无加速度：N=mgcosθ', 'No normal acceleration: N = mg cosθ'), latex: String.raw`N=mg\cos\theta` },
    { n: 4, op: 'physics', title: t('沿斜面列 Newton 第二定律', 'Apply Newton II along the slope'), latex: String.raw`mg\sin\theta-f=ma` },
  ],
  links: {
    upstream: [{ id: 'phys-newton-second-law' }, { id: 'phys-friction-force' }],
    seealso: [{ id: 'phys-weight-vs-mass' }],
  },
}

export default physInclinedPlane
