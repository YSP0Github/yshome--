import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** modphys-heisenberg-uncertainty */
const modphysHeisenbergUncertainty: FormulaCard = {
  id: 'modphys-heisenberg-uncertainty',
  name: t('Heisenberg 不确定关系', 'Heisenberg Uncertainty Principle'),
  aliases: { zh: ['测不准关系', 'ΔxΔp≥ℏ/2', '能量时间不确定'], en: ['uncertainty principle', 'delta x delta p >= hbar/2', 'energy-time uncertainty'] },
  node: 'S20.3',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.TIME'],
    keywords: t('海森堡不确定关系 测不准 ΔxΔp 能量时间 量子极限', 'Heisenberg uncertainty principle delta x delta p energy time quantum limit'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`\Delta x\,\Delta p_x\geq\frac{\hbar}{2}`,
    variants: [
      { name: t('能量—时间不确定关系', 'Energy–time uncertainty'), latex: String.raw`\Delta E\,\Delta t\geq\frac{\hbar}{2}` },
    ],
  },
  meaning: t(
    '微观粒子的位置和动量不能同时测准：位置越确定（Δx 小），动量就越不确定（Δp 大），反之亦然，乘积下限 ℏ/2。这不是仪器精度问题，而是波粒二象性的内禀后果——局限宽度越窄的波包频谱越宽。它排除了"电子沿确定轨道运动"的经典图像，也是量子隧穿、零点能的根源。',
    'The position and momentum of a microscopic particle cannot both be known precisely: the more definite the position (small Δx), the less definite the momentum (large Δp), and vice versa, with product bounded below by ℏ/2. This is not an instrumental limit but an intrinsic consequence of wave–particle duality — a wave packet confined narrowly has a broad spectrum. It rules out the classical picture of an electron on a definite orbit and underlies tunnelling and zero-point energy.'
  ),
  symbols: [
    { sym: '\\Delta x', name: t('位置不确定度（标准差）', 'position uncertainty (standard deviation)'), unit: 'm' },
    { sym: '\\Delta p_x', name: t('动量不确定度', 'momentum uncertainty'), unit: 'kg·m/s' },
    { sym: '\\Delta E', name: t('能量不确定度', 'energy uncertainty'), unit: 'J' },
    { sym: '\\Delta t', name: t('时间间隔', 'time interval'), unit: 's' },
    { sym: '\\hbar', name: t('约化 Planck 常数', 'reduced Planck constant'), unit: 'J·s' },
  ],
  conditions: {
    applies: [t('微观量子态的统计描述', 'Statistical description of microscopic quantum states')],
    assumes: [t('Δ 用统计标准差定义', 'Δ defined as statistical standard deviation')],
    breaks: [t('宏观物体 ℏ 效应可忽略', 'For macroscopic objects the ℏ effect is negligible')],
  },
  links: {
    upstream: [{ id: 'modphys-de-broglie-wavelength' }],
    downstream: [{ id: 'modphys-schrodinger-equation' }],
  },
  refs: [{ text: 'Brehme & Beiser, Modern Physics, §8' }],
}

export default modphysHeisenbergUncertainty
