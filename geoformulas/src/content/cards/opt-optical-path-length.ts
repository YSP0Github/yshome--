import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-optical-path-length */
const optOpticalPathLength: FormulaCard = {
  id: 'opt-optical-path-length',
  name: t('光程与光程差', 'Optical Path Length and Path Difference'),
  aliases: { zh: ['光程 L=Σnᵢlᵢ', '光程差'], en: ['optical path', 'optical path difference'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.GEOM'],
    keywords: t('光程 光程差 相位差 n×l 干涉 透镜等光程', 'optical path optical path difference phase difference n times l interference'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`L_{\text{opt}}=\sum_i n_i l_i,\qquad \delta=\Delta L_{\text{opt}}`,
    variants: [
      { name: t('相位差与光程差', 'Phase difference in terms of optical path difference'), latex: String.raw`\Delta\varphi=\frac{2\pi}{\lambda_0}\,\delta` },
    ],
  },
  meaning: t(
    '光程不是真实几何路程，而是把光在介质中走过的路程按折射率折算成"真空中等效路程"：L_opt = Σ nᵢlᵢ。两束光到达同一点的光程差 δ，决定了它们是相长还是相消干涉——δ = kλ 加强，δ = (k+½)λ 减弱。透镜不产生附加光程差（等光程性），这是干涉与成像理论的基石。',
    'Optical path length is not the physical distance; it converts the distance travelled in a medium into the equivalent distance in vacuum: L_opt = Σ nᵢlᵢ. The optical path difference δ between two rays reaching the same point decides whether they interfere constructively (δ = kλ) or destructively (δ = (k+½)λ). A lens introduces no extra optical-path difference (equal optical path), which is the cornerstone of interference and imaging theory.',
  ),
  symbols: [
    { sym: 'L_{\\text{opt}}', name: t('光程', 'optical path length'), unit: 'm' },
    { sym: 'n_i', name: t('第 i 段介质折射率', 'refractive index of segment i'), unit: '1' },
    { sym: 'l_i', name: t('第 i 段几何路程', 'geometrical length of segment i'), unit: 'm' },
    { sym: '\\delta', name: t('两束光的光程差', 'optical path difference between two rays'), unit: 'm' },
    { sym: '\\lambda_0', name: t('真空中波长（此处为波长）', 'wavelength in vacuum — note: wavelength here'), unit: 'm' },
    { sym: '\\Delta\\varphi', name: t('相位差', 'phase difference'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('同一频率的两束相干光', 'Two coherent rays of the same frequency')],
    assumes: [t('介质无色散、各段均匀', 'Non-dispersive medium, uniform segments')],
    breaks: [t('两束光不相干时谈光程差无意义', 'Path difference is meaningless for incoherent rays')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('光在介质中速度 v=c/n', 'Light travels at v = c/n in a medium'), latex: String.raw`v=\frac{c}{n}` },
    { n: 2, op: 'physics', title: t('走过 l 的时间 = l/v', 'Time to cover l is l/v'), latex: String.raw`t=\frac{l}{v}=\frac{n\,l}{c}` },
    { n: 3, op: 'algebra', title: t('折算成真空中等效路程 c·t', 'Equivalent vacuum distance c·t'), latex: String.raw`L_{\text{opt}}=c\,t=n\,l` },
    { n: 4, op: 'result', title: t('多段介质求和', 'Sum over multiple segments'), latex: String.raw`L_{\text{opt}}=\sum_i n_i l_i,\qquad \delta=L_{\text{opt},1}-L_{\text{opt},2}` },
  ],
  links: {
    upstream: [{ id: 'opt-refractive-index' }],
    downstream: [{ id: 'opt-path-difference-phase' }, { id: 'opt-double-slit-interference' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §8.1' }],
}

export default optOpticalPathLength
