import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mantle-discontinuities */
const mantleDiscontinuities: FormulaCard = {
  id: 'mantle-discontinuities',
  name: t('地幔过渡带间断面', 'Mantle Transition-zone Discontinuities'),
  aliases: { zh: ['410', '660', '过渡带'], en: ['410 km discontinuity', '660 km discontinuity', 'transition zone'] },
  node: 'S7.3',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.STRUCT'],
    quantity: ['Q.GEOM', 'Q.VEL'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`z=\frac{\Delta t_{Ps}}{\sqrt{v_S^{-2}-p^{2}}-\sqrt{v_P^{-2}-p^{2}}}\quad(\text{给定一维参考速度与射线参数})`,
    variants: [
      { name: t('两相变界面的克拉珀龙斜率', 'Clapeyron slopes of the two phase transitions'), latex: String.raw`\frac{\mathrm{d}P}{\mathrm{d}T}=\gamma:\quad 410\ \text{约}\ +2\ \text{MPa/K},\qquad 660\ \text{约}\ -2\ \text{MPa/K}` },
      { name: t('过渡带厚度与温度的关系', 'Transition-zone thickness versus temperature'), latex: String.raw`\text{冷（俯冲）}\to\ 410\ \text{抬升},\ 660\ \text{下降}\ \to\ \text{过渡带加厚}` },
    ],
  },
  meaning: t(
    '410 km 与 660 km 是上地幔橄榄石两次相变造成的高速间断面。它们两个的克拉珀龙斜率符号相反，所以当地幔变冷时，410 抬升、660 下降，过渡带变厚 —— 这一正一反的组合让过渡带厚度成为一台「地幔温度计」，也是俯冲板片能否穿透 660 的关键判据。',
    'The 410 km and 660 km discontinuities are high-velocity jumps caused by two phase transitions of mantle olivine. Their Clapeyron slopes have opposite signs, so when the mantle cools the 410 rises and the 660 drops, thickening the transition zone. This complementary pair makes transition-zone thickness a mantle thermometer, and it is the key criterion for whether a slab can penetrate the 660.',
  ),
  symbols: [
    { sym: 'z', name: t('间断面深度', 'depth of the discontinuity'), unit: 'km', typical: '410, 660' },
    { sym: '\\gamma', name: t('克拉珀龙斜率 dP/dT', 'Clapeyron slope dP/dT'), unit: 'MPa/K', typical: '±2' },
    { sym: '\\Delta t_{Ps}', name: t('转换波与直达 P 的到时差', 'arrival difference between the Ps conversion and direct P'), unit: 's', typical: '20 – 70' },
    { sym: 'p', name: t('射线参数', 'ray parameter'), unit: 's/km' },
  ],
  conditions: {
    applies: [t('接收函数或 SS 前驱波研究上地幔间断面的深度起伏', 'Studying depth variations of upper-mantle discontinuities with receiver functions or SS precursors')],
    assumes: [t('上覆地壳与地幔速度结构已知', 'The overlying crust and mantle velocity structure is known')],
    breaks: [t('上覆速度模型误差会被误读为间断面起伏，两者难以完全分离', 'Errors in the overlying velocity model masquerade as discontinuity relief; the two are hard to separate completely')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('转换波与直达波的到时差', 'Arrival difference between converted and direct waves'),
      latex: String.raw`\Delta t_{Ps}=z\left(\sqrt{\frac{1}{v_S^{2}}-p^{2}}-\sqrt{\frac{1}{v_P^{2}}-p^{2}}\right)` },
    { n: 2, op: 'algebra', title: t('解出深度', 'Solve for depth'),
      latex: String.raw`z=\frac{\Delta t_{Ps}}{\sqrt{\dfrac{1}{v_S^{2}}-p^{2}}-\sqrt{\dfrac{1}{v_P^{2}}-p^{2}}}` },
    { n: 3, op: 'physics', title: t('相变深度对温度的依赖', 'Temperature dependence of the transition depth'),
      latex: String.raw`\Delta z=\frac{\gamma\,\Delta T}{\rho\,g}` },
    { n: 4, op: 'result', title: t('两个界面符号相反', 'The two interfaces respond with opposite signs'),
      latex: String.raw`\gamma_{410}>0,\ \gamma_{660}<0\;\Longrightarrow\; \Delta T<0\Rightarrow \Delta z_{410}<0,\ \Delta z_{660}>0` },
  ],
  example: {
    title: t('俯冲带下方的过渡带', 'The transition zone beneath a subduction zone'),
    input: t('板片温度比周围低 400 K，γ₆₆₀ = −2 MPa/K', 'The slab is 400 K colder, γ₆₆₀ = −2 MPa/K'),
    steps: [
      t('Δz = γΔT/(ρg) = (−2×10⁶)(−400)/(4000×10) ≈ 20 km', 'Δz = γΔT/(ρg) = (−2×10⁶)(−400)/(4000×10) ≈ 20 km'),
    ],
    output: t('660 下沉约 20 km，410 抬升相似幅度 —— 过渡带加厚约 40 km，是冷板片堆积的直接证据', 'The 660 depresses by about 20 km and the 410 rises by a similar amount — the transition zone thickens by about 40 km, direct evidence of cold slab pile-up'),
  },
  links: {
    upstream: [{ id: 'receiver-function-h-kappa', note: t('同一方法在地壳上的应用', 'The same method applied to the crust') }],
    seealso: [{ id: 'prem-velocity-model', note: t('参考模型给出平均深度', 'The reference model gives the mean depths') }],
  },
  refs: [{ text: 'Bina & Helffrich (1994), J. Geophys. Res., 99' }],
}

export default mantleDiscontinuities
