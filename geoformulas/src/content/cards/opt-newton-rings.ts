import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-newton-rings */
const optNewtonRings: FormulaCard = {
  id: 'opt-newton-rings',
  name: t('Newton 环', 'Newton’s Rings'),
  aliases: { zh: ['牛顿环', '等厚干涉环'], en: ["Newton's rings", 'equal-thickness fringes'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS', 'METH.INSTR'],
    quantity: ['Q.OPT'],
    keywords: t('牛顿环 等厚干涉 平凸透镜 空气膜 曲率半径 检测透镜', "Newton's rings equal-thickness plano-convex lens air film lens testing"),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`r_k=\sqrt{\left(k+\tfrac12\right)\lambda R}\ (\text{明环}),\qquad r_k=\sqrt{k\lambda R}\ (\text{暗环})`,
    variants: [
      { name: t('中心暗斑（半波损失）', 'Central dark spot (half-wave loss)'), latex: String.raw`r=0\ \text{处为暗斑}` },
    ],
  },
  meaning: t(
    '把一个曲率半径很大的平凸透镜放在平板玻璃上，两者之间形成一层厚度从中心向外递增的空气膜，单色光垂直照射时在反射光中看到以接触点为中心的同心圆环——Newton 环。它是等厚干涉：同一圈空气膜厚度相同。测环半径就能反推透镜曲率半径，车间里用它检验透镜表面是否磨得完美。',
    "Lay a plano-convex lens of long focal length on a flat glass plate. The air film between them grows thicker outward from the contact point; under normal monochromatic light the reflection shows concentric rings centred on the contact point — Newton's rings. They are equal-thickness fringes: a circle is one air-film thickness. Measuring the ring radius yields the lens's radius of curvature, and workshops use them to inspect a lens surface for perfection.",
  ),
  symbols: [
    { sym: 'r_k', name: t('第 k 级环半径', 'radius of the k-th ring'), unit: 'm' },
    { sym: 'R', name: t('平凸透镜的曲率半径', 'radius of curvature of the plano-convex lens'), unit: 'm' },
    { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
    { sym: 'k', name: t('环的级次', 'ring order'), unit: '1' },
  ],
  conditions: {
    applies: [t('正入射、空气膜很薄', 'Normal incidence, thin air film')],
    assumes: [t('透镜与平板接触良好，重力下压形可忽略', 'Good contact between lens and plate; negligible deformation')],
    breaks: [t('接触面有灰尘或形变时圆环畸变', 'Dust or deformation at the contact distorts the rings')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('空气膜厚度 d 与环半径 r', 'Air-film thickness d versus ring radius r'), latex: String.raw`r^2\approx 2Rd\;\Rightarrow\;d=\frac{r^2}{2R}` },
    { n: 2, op: 'physics', title: t('反射光程差 2d 加半波损失', 'Reflection path difference 2d plus half-wave loss'), latex: String.raw`\delta=2d+\frac{\lambda}{2}` },
    { n: 3, op: 'algebra', title: t('暗环条件 δ=kλ 解出 r', 'Dark-ring condition δ = kλ solved for r'), latex: String.raw`2\frac{r_k^2}{2R}=k\lambda\;\Rightarrow\;r_k=\sqrt{k\lambda R}` },
  ],
  links: {
    upstream: [{ id: 'opt-thin-film-interference' }],
    downstream: [{ id: 'opt-michelson-interferometer' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §9.4' }],
}

export default optNewtonRings
