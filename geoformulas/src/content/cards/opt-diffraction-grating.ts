import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-diffraction-grating */
const optDiffractionGrating: FormulaCard = {
  id: 'opt-diffraction-grating',
  name: t('衍射光栅方程', 'Diffraction Grating Equation'),
  aliases: { zh: ['光栅方程', 'd sinθ=kλ', '主极大条件'], en: ['grating equation', 'd sin θ = k λ', 'principal maxima'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS', 'METH.INSTR'],
    quantity: ['Q.OPT'],
    keywords: t('衍射光栅 光栅方程 d sinθ=kλ 主极大 级次 光谱 色散', 'diffraction grating grating equation principal maxima order spectrum dispersion'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`d\sin\theta_k=k\lambda`,
    variants: [
      { name: t('正入射时光强分布', 'Intensity under normal incidence'), latex: String.raw`I(\theta)=I_0\left[\frac{\sin(N\beta)}{N\sin\beta}\right]^2,\quad \beta=\frac{\pi d\sin\theta}{\lambda}` },
      { name: t('缺级（缝衍射包络零点点掉光栅主极大）', 'Missing order (a diffraction zero coincides with a grating maximum)'), latex: String.raw`\frac{d}{a}=\frac{k}{m}\ \text{整数时第 }k\text{ 级缺级}` },
    ],
  },
  meaning: t(
    '衍射光栅是在玻璃或金属上刻出大量等间距狭缝（每毫米几百到上万条），光栅常数 d 就是相邻缝间距。光栅方程 d sinθ = kλ 给出主极大位置：不同波长在同一级次 k 下偏折角不同，于是白光被展开成光谱。缝数 N 越多，亮线越细越亮，光栅成为光谱仪、单色仪的核心分光元件。',
    'A diffraction grating carries many equally spaced slits ruled on glass or metal (hundreds to tens of thousands per mm); the grating constant d is the slit spacing. The grating equation d sinθ = kλ gives the principal maxima: at a fixed order k, different wavelengths bend by different angles, so white light spreads into a spectrum. The more slits N, the sharper and brighter the lines — gratings are the dispersive heart of spectrometers and monochromators.',
  ),
  symbols: [
    { sym: 'd', name: t('光栅常数（相邻缝间距）', 'grating constant (adjacent slit spacing)'), unit: 'm' },
    { sym: '\\theta_k', name: t('第 k 级主极大衍射角', 'diffraction angle of the k-th principal maximum'), unit: 'rad' },
    { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
    { sym: 'k', name: t('光谱级次（0,±1,±2,…）', 'spectral order (0, ±1, ±2, …)'), unit: '1' },
    { sym: 'N', name: t('总缝数', 'total number of slits'), unit: '1' },
  ],
  conditions: {
    applies: [t('正入射、远场', 'Normal incidence, far field')],
    assumes: [t('狭缝等宽等间距', 'Equal, evenly spaced slits')],
    breaks: [t('|sinθ|>1 时该级次不存在（高级次缺级）', 'An order is absent when |sinθ| > 1')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('相邻缝到远场 P 点光程差 d sinθ', 'Path difference between adjacent slits to far-field point P'), latex: String.raw`\delta=d\sin\theta` },
    { n: 2, op: 'physics', title: t('相长干涉要求光程差为整数波长', 'Constructive interference requires δ = integer λ'), latex: String.raw`d\sin\theta=k\lambda` },
    { n: 3, op: 'result', title: t('N 缝干涉主极大', 'N-slit principal maxima'), latex: String.raw`I\propto\left[\frac{\sin(N\beta)}{N\sin\beta}\right]^2,\quad \beta=\frac{\pi d\sin\theta}{\lambda}` },
  ],
  viz: [
    {
      id: 'grating-pattern',
      level: 'V1',
      title: t('N=20 缝光栅光强（窄峰即主极大）', 'Intensity of a 20-slit grating (narrow peaks are principal maxima)'),
      xlabel: t('衍射方向 sinθ', 'diffraction direction sin θ'),
      ylabel: t('相对光强 I/I₀', 'relative intensity I/I0'),
      controls: [
        { id: 'lines', label: t('刻线密度 (条/mm)', 'groove density (lines/mm)'), min: 200, max: 2000, step: 50, value: 600, unit: '/mm' },
        { id: 'lam', label: t('波长 λ (nm)', 'wavelength λ (nm)'), min: 400, max: 700, step: 10, value: 550, unit: 'nm' },
      ],
      xRange: [-0.6, 0.6],
      note: t('峰位满足 d sinθ=kλ；λ 越大（红光）同一级次峰偏折越远，这就是光栅把白光拉开成光谱的原因。',
        'Peaks sit at d sinθ = kλ; the larger λ (toward red), the farther a given order is bent — this is how a grating spreads white light into a spectrum.'),
      compute: (p) => {
        const d = 1e-3 / p['lines']
        const lam = p['lam'] * 1e-9
        const N = 20
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const st = -0.6 + (i / 600) * 1.2
          const beta = (Math.PI * d * st) / lam
          const den = Math.sin(beta)
          const num = Math.sin(N * beta)
          const ratio = Math.abs(den) < 1e-4 ? 1 : num / (N * den)
          pts.push([st, ratio * ratio])
        }
        return [{ label: t('I(θ)/I₀', 'I(θ)/I0'), color: '#993C1D', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'opt-single-slit-diffraction' }],
    downstream: [{ id: 'opt-grating-resolving-power' }],
    seealso: [{ id: 'opt-prism-minimum-deviation', note: t('棱镜也分光但线性度差', 'A prism also disperses but less linearly') }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §10.2' }],
}

export default optDiffractionGrating
