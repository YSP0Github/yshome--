import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** source-spectral-scaling */
const sourceSpectralScaling: FormulaCard = {
  id: 'source-spectral-scaling',
  name: t('震源标度关系（自相似与 L 模型）', 'Source Scaling Relations (Self-similarity & the L Model)'),
  aliases: { zh: ['标度关系', '自相似', 'L 模型'], en: ['scaling relations', 'self-similarity', 'L model'] },
  node: 'S4.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.GEOM'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`M_{0} = \frac{16}{7}\,\Delta\sigma\,a^{3},\qquad f_{c} \approx 0.49\,\beta\left(\frac{\Delta\sigma}{M_{0}}\right)^{1/3}`,
    variants: [
      { name: t('自相似（恒定应力降）', 'Self-similar (constant stress drop)'), latex: String.raw`\Delta\sigma = \text{const} \Longrightarrow f_c \propto M_0^{-1/3},\quad \bar{u}\propto L,\quad M_0\propto L^{3}` },
      { name: t('L 模型（恒定滑动）', 'The L model (constant slip)'), latex: String.raw`\bar{u} = \text{const} \Longrightarrow M_0 \propto L^{2},\quad \Delta\sigma \propto L^{-1}` },
      { name: t('平均滑动与应力降', 'Average slip and stress drop'), latex: String.raw`\Delta\sigma = \frac{7\pi}{16}\frac{\mu\,\bar{u}}{a}` },
    ],
  },
  meaning: t(
    '地震到底怎么「变大」？如果两个地震只是尺寸不同、其他都一样（自相似），那么应力降恒定、滑动随尺度线性增长、地震矩按尺度三次方增长。观测上小震确实如此，但大地震似乎更接近「滑动恒定、面积增大」的 L 模型 —— 这一争论至今没有定论，直接影响强地面运动预测。',
    'How exactly do earthquakes get bigger? If two events differ only in size and are otherwise identical (self-similar), the stress drop is constant, slip grows linearly with dimension, and moment grows as the cube of dimension. Small earthquakes do behave this way, but large ones appear closer to the L model of constant slip on a growing area — an argument still unresolved, with direct consequences for strong-motion prediction.',
  ),
  symbols: [
    { sym: 'a', name: t('等效破裂半径', 'equivalent rupture radius'), unit: 'm' },
    { sym: 'L', name: t('破裂长度', 'rupture length'), unit: 'm' },
    { sym: '\\Delta\\sigma', name: t('静态应力降', 'static stress drop'), unit: 'Pa', typical: '0.1 – 10 MPa' },
    { sym: '\\bar{u}', name: t('平均滑动量', 'average slip'), unit: 'm' },
    { sym: 'f_{c}', name: t('拐角频率', 'corner frequency'), unit: 'Hz' },
    { sym: '\\beta', name: t('S 波速度', 'S velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('由震级反推破裂尺度、标定强地面运动模型', 'Inferring rupture dimension from magnitude; calibrating strong-motion models')],
    assumes: [
      t('圆形破裂（Eshelby）近似', 'Circular-crack (Eshelby) approximation'),
      t('均匀介质、均匀应力降', 'Uniform medium and uniform stress drop'),
    ],
    breaks: [
      t('大地震的长宽比远大于 1，圆形假设失效', 'Great earthquakes have large aspect ratios; the circular assumption fails'),
      t('滑动分布极不均匀，等效半径的定义不明确', 'Slip is highly heterogeneous, so the equivalent radius is ill-defined'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('Eshelby 圆形裂纹解', 'The Eshelby circular-crack solution'),
      latex: String.raw`\bar{u} = \frac{16\,\Delta\sigma\,a}{7\pi\mu}` },
    { n: 2, op: 'substitute', title: t('代入地震矩定义', 'Substitute into the definition of seismic moment'),
      latex: String.raw`M_0 = \mu\bar{u}\,\pi a^{2} = \frac{16}{7}\Delta\sigma\,a^{3}` },
    { n: 3, op: 'algebra', title: t('解出半径', 'Solve for the radius'),
      latex: String.raw`a = \left(\frac{7M_0}{16\Delta\sigma}\right)^{1/3}` },
    { n: 4, op: 'identity', title: t('拐角频率与尺度成反比', 'Corner frequency is inversely proportional to dimension'),
      latex: String.raw`f_c \approx \frac{0.32\,\beta}{a}` },
    { n: 5, op: 'result', title: t('合并得到 f_c 与 Δσ、M₀ 的关系', 'Combine to relate f_c to Δσ and M₀'),
      latex: String.raw`f_c \approx 0.49\,\beta\left(\frac{\Delta\sigma}{M_0}\right)^{1/3}` },
  ],
  viz: [
    {
      id: 'scaling-m0-fc',
      level: 'V1',
      title: t('恒定应力降下的 M₀–f_c 标度线', 'M₀–f_c scaling lines at constant stress drop'),
      xlabel: t('log₁₀ M₀ (N·m)', 'log₁₀ M₀ (N·m)'),
      ylabel: t('log₁₀ f_c (Hz)', 'log₁₀ f_c (Hz)'),
      controls: [
        { id: 'beta', label: t('S 波速度 β (km/s)', 'S velocity β (km/s)'), min: 2, max: 4.8, step: 0.05, value: 3.5 },
        { id: 'ds', label: t('应力降 Δσ (MPa)', 'stress drop Δσ (MPa)'), min: 0.1, max: 30, step: 0.1, value: 3 },
      ],
      note: t('斜率固定为 −1/3（自相似）；观测点如果偏离这条线，就说明应力降随震级变化。', 'The slope is fixed at −1/3 (self-similar); data points off this line mean the stress drop varies with magnitude.'),
      compute: (p) => {
        const beta = p['beta'] * 1000, ds = p['ds'] * 1e6
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const lm0 = 11 + (i / 200) * 12
          const m0 = Math.pow(10, lm0)
          const fc = 0.49 * beta * Math.pow(ds / m0, 1 / 3)
          pts.push([lm0, Math.log10(fc)])
        }
        return [{ label: t('f_c(M₀)', 'f_c(M₀)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('M_w 7 破裂有多大', 'How big is an M_w 7 rupture'),
    input: t('M₀ = 4×10¹⁹ N·m，Δσ = 3 MPa', 'M₀ = 4×10¹⁹ N·m, Δσ = 3 MPa'),
    steps: [
      t('a = (7×4×10¹⁹/(16×3×10⁶))^{1/3} = (5.83×10¹²)^{1/3} = 18.0 km', 'a = (7×4×10¹⁹/(16×3×10⁶))^{1/3} = (5.83×10¹²)^{1/3} = 18.0 km'),
      t('等效直径约 36 km', 'Equivalent diameter about 36 km'),
    ],
    output: t('与野外地表破裂带长度的量级一致', 'Consistent with the length of observed surface rupture zones'),
  },
  links: {
    upstream: [{ id: 'static-stress-drop', note: t('应力降的定义', 'Definition of stress drop') }],
    downstream: [{ id: 'corner-frequency-source-dimension', note: t('拐角频率与尺度的换算', 'Corner frequency to dimension') }],
    seealso: [{ id: 'earthquake-scaling-laws', note: t('更完整的标度律综述', 'A broader review of scaling laws') }],
  },
  refs: [{ text: 'Eshelby, J. D. (1957). The determination of the elastic field of an ellipsoidal inclusion. Proc. R. Soc. A, 241, 376–396' }],
}

export default sourceSpectralScaling
