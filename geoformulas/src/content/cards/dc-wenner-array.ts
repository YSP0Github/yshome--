import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** dc-wenner-array */
const dcWennerArray: FormulaCard = {
  id: 'dc-wenner-array',
  name: t('Wenner（对称四极）装置', 'The Wenner Array'),
  aliases: { zh: ['对称四极排列', '等距四极'], en: ['Wenner electrode array', 'equally spaced four poles'] },
  node: 'S16.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.EM'],
    quantity: ['Q.ELEC', 'Q.GEOM'],
    keywords: t('Wenner 对称四极 装置系数 2πa 电极距 a', 'Wenner array factor 2πa electrode spacing'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`K=2\pi\,a\;,\qquad \rho_{a}=2\pi a\,\frac{\Delta U}{I}`,
    variants: [
      { name: t('电极位置', 'Electrode layout'), latex: String.raw`A\!\!-\!\!a\!\!-\!\!M\!\!-\!\!a\!\!-\!\!N\!\!-\!\!a\!\!-\!\!B` },
    ],
  },
  meaning: t(
    '四个电极等间距 a 排成一条直线：A—M—N—B，相邻极间距都是 a。装置系数 K=2πa 最简单，是教学和工程中最经典的排列；增大 a 即增大探测深度，因此 Wenner 也可做电测深。缺点是 AB 极距大时电位差小、信噪比低。',
    'Four electrodes are laid out in a line with equal spacing a: A—M—N—B. Its geometric factor K=2πa is the simplest, making Wenner the classic teaching and engineering array. Enlarging a increases depth of investigation, so Wenner also sounds. The downside is a small signal (low S/N) when the spread is large.',
  ),
  symbols: [
    { sym: 'K', name: t('装置系数', 'array factor'), unit: 'm' },
    { sym: 'a', name: t('相邻电极间距', 'spacing between adjacent electrodes'), unit: 'm' },
    { sym: '\\rho_{a}', name: t('视电阻率', 'apparent resistivity'), unit: 'Ω·m' },
  ],
  conditions: {
    applies: [t('四极共线、等距、地表布置', 'Collinear, equally spaced, at the surface')],
    breaks: [t('任一电极接地不良都会显著畸变 K', 'Poor ground contact of any electrode biases K')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('代入一般 K 式的各距离', 'Distances in the general K formula'),
      latex: String.raw`r_{AM}=a,\; r_{AN}=2a,\; r_{BM}=2a,\; r_{BN}=a` },
    { n: 2, op: 'algebra', title: t('计算括号内几何项', 'Evaluate the geometric bracket'),
      latex: String.raw`\dfrac{1}{a}-\dfrac{1}{2a}-\dfrac{1}{2a}+\dfrac{1}{a}=\dfrac{1}{a}` },
    { n: 3, op: 'result', title: t('K=2πa', 'Hence K=2πa'),
      latex: String.raw`K=\dfrac{2\pi}{1/a}=2\pi a` },
  ],
  links: {
    upstream: [{ id: 'dc-array-geometric-factor' }],
    seealso: [{ id: 'dc-schlumberger-array' }, { id: 'dc-ves-curve', note: t('增大 a 做测深', 'Enlarging a for sounding') }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.3.1' }],
}

export default dcWennerArray
