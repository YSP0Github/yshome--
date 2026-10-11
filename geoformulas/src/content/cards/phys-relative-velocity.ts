import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-relative-velocity */
const physRelativeVelocity: FormulaCard = {
  id: 'phys-relative-velocity',
  name: t('相对速度', 'Relative Velocity'),
  aliases: { zh: ['相对运动', '伽利略速度叠加'], en: ['relative velocity', 'Galilean velocity addition'] },
  node: 'S18.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL'],
    keywords: t('相对速度 参考系 伽利略速度叠加 追及', 'relative velocity frame Galilean addition pursuit'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{v}_{AB}=\mathbf{v}_{A}-\mathbf{v}_{B}`,
    variants: [
      { name: t('换参考系的速度变换', 'Velocity transform between frames'), latex: String.raw`\mathbf{v}_{A\to \text{地}}=\mathbf{v}_{A\to B}+\mathbf{v}_{B\to \text{地}}` },
      { name: t('渡河问题（垂直最短时间）', 'river crossing (fastest crossing)'), latex: String.raw`t=\frac{D}{v_{\text{船}}},\quad \text{合速度大小}=\sqrt{v_{\text{船}}^{2}+v_{\text{水}}^{2}}` },
    ],
  },
  meaning: t(
    '在 B 看来 A 的速度，等于 A 相对地面的速度减去 B 相对地面的速度。速度是矢量，叠加要用平行四边形法则：同方向直接加减，垂直时按勾股求合速度。渡河、追及、风中航行都是它的直接应用。',
    'The velocity of A as seen by B equals A’s ground velocity minus B’s ground velocity. Velocity is a vector, so addition follows the parallelogram rule — add collinear components directly, combine perpendicular ones by Pythagoras. River crossing, pursuit, and sailing in wind are direct applications.',
  ),
  symbols: [
    { sym: '\\mathbf{v}_{AB}', name: t('A 相对 B 的速度', 'velocity of A relative to B'), unit: 'm/s' },
    { sym: '\\mathbf{v}_A,\\mathbf{v}_B', name: t('对地速度', 'velocities relative to ground'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('低速下的伽利略变换', 'Galilean transformation at low speeds')],
    assumes: [t('各参考系间匀速相对运动', 'Frames move at constant velocity relative to each other')],
    breaks: [t('近光速时须用 Lorentz 变换', 'Replaced by the Lorentz transform near light speed')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('写出各位置矢量', 'Write the position vectors'), latex: String.raw`\mathbf{r}_{A\to \text{地}}=\mathbf{r}_{B\to \text{地}}+\mathbf{r}_{A\to B}` },
    { n: 2, op: 'identity', title: t('对时间求导', 'Differentiate with respect to time'), latex: String.raw`\mathbf{v}_{A\to \text{地}}=\mathbf{v}_{B\to \text{地}}+\mathbf{v}_{A\to B}` },
    { n: 3, op: 'algebra', title: t('移项得相对速度', 'Rearrange for relative velocity'), latex: String.raw`\mathbf{v}_{A\to B}=\mathbf{v}_{A\to \text{地}}-\mathbf{v}_{B\to \text{地}}` },
  ],
  links: { seealso: [{ id: 'phys-kinematic-derivatives' }] },
}

export default physRelativeVelocity
