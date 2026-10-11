import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-single-slit-diffraction */
const optSingleSlitDiffraction: FormulaCard = {
  id: 'opt-single-slit-diffraction',
  name: t('单缝夫琅禾费衍射', 'Single-Slit Fraunhofer Diffraction'),
  aliases: { zh: ['单缝衍射', '暗纹条件 a sinθ=kλ'], en: ['single-slit diffraction', 'dark fringes a sin θ = kλ'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA', 'MATH.APPROX'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT'],
    keywords: t('单缝衍射 暗纹条件 a sinθ=kλ 中央亮纹 sinc 菲涅耳半波带', 'single slit diffraction dark fringe condition central maximum sinc Fresnel half-period zones'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`a\sin\theta=k\lambda\ (\text{暗纹}),\qquad I(\theta)=I_0\left(\frac{\sin\alpha}{\alpha}\right)^2,\quad \alpha=\frac{\pi a\sin\theta}{\lambda}`,
    variants: [
      { name: t('中央亮纹角宽度', 'Angular width of the central maximum'), latex: String.raw`\Delta\theta_0\approx\frac{2\lambda}{a}` },
    ],
  },
  meaning: t(
    '光穿过一条宽 a 的狭缝后并不会聚成一条亮线，而是铺展成中央宽亮、两侧逐级衰减的衍射条纹。暗纹位置满足 a sinθ = kλ，中央亮纹角宽 2λ/a——缝越窄，衍射铺得越开。光强按 (sinα/α)² 变化，主极大在 θ=0，次极大在约 1.43λ/a、2.46λ/a 处。',
    'Light through a single slit of width a does not focus to a sharp line but spreads into a broad central maximum flanked by fading side lobes. Dark fringes lie at a sinθ = kλ, and the central maximum spans an angular width 2λ/a — narrower slit, wider spread. The intensity follows (sinα/α)², with the principal maximum at θ = 0 and secondary maxima near 1.43λ/a and 2.46λ/a.',
  ),
  symbols: [
    { sym: 'a', name: t('缝宽', 'slit width'), unit: 'm' },
    { sym: '\\theta', name: t('衍射角', 'diffraction angle'), unit: 'rad' },
    { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
    { sym: 'k', name: t('暗纹级次（±1,±2,…）', 'dark-fringe order (±1, ±2, …)'), unit: '1' },
    { sym: '\\alpha', name: t('相位参数', 'phase parameter'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('远场 Fraunhofer 衍射，光源与屏都在无穷远（或透镜焦面）', 'Far-field Fraunhofer regime; source and screen effectively at infinity or in focal planes')],
    assumes: [t('缝很长，只考虑单方向衍射', 'Long slit, diffraction in one direction only')],
    breaks: [t('缝宽远大于波长时光线近似直线传播', 'When the slit is far wider than the wavelength light propagates nearly in straight lines')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('把缝面波前切成 N 个次波源叠加', 'Slice the slit into N Huygens sources and sum'), latex: String.raw`A(\alpha)=A_0\int_{-1/2}^{1/2}e^{i\,2\pi\alpha u}\,du` },
    { n: 2, op: 'algebra', title: t('积分得 sinc 形式', 'Integrate to the sinc form'), latex: String.raw`A(\alpha)=A_0\frac{\sin\alpha}{\alpha}` },
    { n: 3, op: 'result', title: t('暗纹（零点）条件 sinα=0', 'Dark-fringe (zero) condition sin α = 0'), latex: String.raw`\alpha=k\pi\;\Rightarrow\;a\sin\theta=k\lambda` },
  ],
  viz: [
    {
      id: 'single-slit-pattern',
      level: 'V1',
      title: t('单缝衍射光强分布 (sinα/α)²', 'Single-slit intensity profile (sin α/α)²'),
      xlabel: t('衍射角方向 sinθ', 'diffraction direction sin θ'),
      ylabel: t('相对光强 I/I₀', 'relative intensity I/I0'),
      controls: [
        { id: 'a', label: t('缝宽 a (μm)', 'slit width a (μm)'), min: 20, max: 300, step: 5, value: 100, unit: 'μm' },
        { id: 'lam', label: t('波长 λ (nm)', 'wavelength λ (nm)'), min: 400, max: 700, step: 10, value: 550, unit: 'nm' },
      ],
      xRange: [-0.02, 0.02],
      note: t('把 a 调小，中央亮纹立刻变宽——这就是"孔越小光越散"。暗纹位置 sinθ=kλ/a 随 a 减小而外移。',
        'Decrease a and the central maximum immediately widens — "the smaller the aperture, the more the light spreads". Dark fringes sinθ = kλ/a move outward as a shrinks.'),
      compute: (p) => {
        const a = p['a'] * 1e-6
        const lam = p['lam'] * 1e-9
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 500; i++) {
          const st = -0.02 + (i / 500) * 0.04
          const alpha = (Math.PI * a * st) / lam
          const ratio = Math.abs(alpha) < 1e-6 ? 1 : Math.sin(alpha) / alpha
          pts.push([st, ratio * ratio])
        }
        return [{ label: t('I(θ)/I₀', 'I(θ)/I0'), color: '#185FA5', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'opt-double-slit-interference' }],
    downstream: [{ id: 'opt-circular-aperture-airy' }, { id: 'opt-diffraction-grating' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §9.2' }],
}

export default optSingleSlitDiffraction
