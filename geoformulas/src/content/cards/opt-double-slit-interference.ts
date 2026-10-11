import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-double-slit-interference */
const optDoubleSlitInterference: FormulaCard = {
  id: 'opt-double-slit-interference',
  name: t('杨氏双缝干涉', "Young's Double-Slit Interference"),
  aliases: { zh: ['双缝干涉', '条纹间距 Δy=λL/d'], en: ['double-slit experiment', 'fringe spacing Δy = λL/d'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS', 'METH.INSTR'],
    quantity: ['Q.OPT'],
    keywords: t('双缝干涉 杨氏 条纹间距 Δy=λL/d 明纹位置 干涉条纹', 'double-slit Young fringe spacing bright fringe position interference pattern'),
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`\Delta y=\frac{\lambda L}{d},\qquad y_k=\frac{k\lambda L}{d}`,
    variants: [
      { name: t('屏上光强分布', 'Intensity on the screen'), latex: String.raw`I(y)=I_0\cos^2\!\left(\frac{\pi d\,y}{\lambda L}\right)` },
    ],
  },
  meaning: t(
    'Young 双缝让一束光穿过两条相距 d 的狭缝，在远处 L 的屏上得到明暗相间、等间距的直条纹。相邻明纹间距 Δy = λL/d：缝越窄（d 小）、光波长越长（λ 大）、屏越远（L 大），条纹越疏。它第一次以无可辩驳的证据确立了光的波动性，也是测波长的经典实验。',
    "Young's double slit passes light through two slits separated by d and, on a screen at distance L, yields evenly spaced bright and dark fringes. Adjacent bright fringes are Δy = λL/d apart: narrower slits (smaller d), longer wavelength (larger λ) and a farther screen (larger L) all make the fringes wider. It was the experiment that decisively established the wave nature of light and remains a classic way to measure wavelength.",
  ),
  symbols: [
    { sym: '\\Delta y', name: t('相邻明纹（或暗纹）间距', 'spacing between adjacent bright (or dark) fringes'), unit: 'm' },
    { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm', typical: '400 – 700 nm' },
    { sym: 'L', name: t('缝到屏的距离', 'distance from slits to screen'), unit: 'm' },
    { sym: 'd', name: t('两缝间距', 'separation of the two slits'), unit: 'm' },
    { sym: 'y_k', name: t('第 k 级明纹中心位置', 'position of the k-th bright fringe'), unit: 'm' },
  ],
  conditions: {
    applies: [t('L≫d、L≫y 的远场近似（Fraunhofer）', 'Far-field Fraunhofer regime, L ≫ d and L ≫ y')],
    assumes: [t('两缝宽度可忽略、宽度相同', 'Slit width negligible and equal')],
    breaks: [t('缝宽不可忽略时单缝衍射包络调制条纹', 'When slit width matters a single-slit diffraction envelope modulates the fringes')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('两缝到屏上 y 点的光程差', 'Path difference to point y on the screen'), latex: String.raw`\delta=d\sin\theta\approx d\,\frac{y}{L}` },
    { n: 2, op: 'physics', title: t('明纹条件 δ=kλ', 'Bright-fringe condition δ = kλ'), latex: String.raw`d\,\frac{y_k}{L}=k\lambda\;\Rightarrow\;y_k=\frac{k\lambda L}{d}` },
    { n: 3, op: 'algebra', title: t('相邻明纹间距', 'Spacing of adjacent bright fringes'), latex: String.raw`\Delta y=y_{k+1}-y_k=\frac{\lambda L}{d}` },
  ],
  viz: [
    {
      id: 'fringe-pattern',
      level: 'V1',
      title: t('双缝干涉光强随屏上位置的变化', 'Double-slit intensity versus position on screen'),
      xlabel: t('屏上位置 y (mm)', 'position on screen y (mm)'),
      ylabel: t('相对光强 I/I₀', 'relative intensity I/I0'),
      controls: [
        { id: 'd', label: t('缝间距 d (μm)', 'slit separation d (μm)'), min: 20, max: 200, step: 5, value: 80, unit: 'μm' },
        { id: 'lam', label: t('波长 λ (nm)', 'wavelength λ (nm)'), min: 400, max: 700, step: 10, value: 550, unit: 'nm' },
      ],
      xRange: [-20, 20],
      note: t('把 d 调大，条纹挤密（Δy∝1/d）；把 λ 调大（红光），条纹变疏。这就是为什么红光干涉条纹比紫光宽。',
        'Increase d and the fringes pack together (Δy ∝ 1/d); increase λ (toward red) and they widen. This is why red fringes are wider than violet ones.'),
      compute: (p) => {
        const d = (p['d'] * 1e-6)
        const lam = (p['lam'] * 1e-9)
        const L = 1.0
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const y = (-0.02 + (i / 400) * 0.04)
          const arg = (Math.PI * d * y) / (lam * L)
          pts.push([(y * 1000), Math.cos(arg) * Math.cos(arg)])
        }
        return [{ label: t('I(y)/I₀', 'I(y)/I0'), color: '#185FA5', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'opt-path-difference-phase' }],
    downstream: [{ id: 'opt-single-slit-diffraction' }, { id: 'opt-diffraction-grating' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §9.3' }],
}

export default optDoubleSlitInterference
