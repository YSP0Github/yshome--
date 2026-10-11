import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** quarter-wavelength-amplification */
const quarterWavelengthAmplification: FormulaCard = {
  id: 'quarter-wavelength-amplification',
  name: t('土层共振与 1/4 波长放大', 'Soil Resonance & Quarter-wavelength Amplification'),
  aliases: { zh: ['场地共振', '土层放大', '1/4 波长法'], en: ['site resonance', 'soil amplification', 'quarter-wavelength method'] },
  node: 'S11.3',
  tags: {
    math: ['MATH.GEOM', 'MATH.FOURIER'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`f_n = \frac{(2n+1)V_S}{4H},\qquad n = 0,1,2,\dots;\qquad
A_{\max} \simeq \frac{2}{\pi}\,\frac{\rho_2 V_{S2}}{\rho_1 V_{S1}}`,
    variants: [
      { name: t('基阶共振周期', 'Fundamental resonance period'), latex: String.raw`T_0 = \frac{4H}{V_S}` },
      { name: t('阻抗比决定放大上限', 'The impedance ratio sets the amplification ceiling'), latex: String.raw`\text{无阻尼时}\ A_{\max} \to \frac{2\rho_2 V_{S2}}{\rho_1 V_{S1}};\quad \text{有阻尼时约为其}\ \frac{1}{\pi}\ \text{倍}` },
      { name: t('传递函数（一层覆盖半空间）', 'Transfer function (a layer over a half-space)'), latex: String.raw`|T(\omega)| = \frac{1}{\left|\cos\frac{\omega H}{V_{S1}} + i\,\frac{\rho_2 V_{S2}}{\rho_1 V_{S1}}\sin\frac{\omega H}{V_{S1}}\right|}` },
      { name: t('土层非线性使 f₀ 随振幅下降', 'Soil nonlinearity lowers f₀ as amplitude grows'), latex: String.raw`G/G_{\max}\ \downarrow \Rightarrow V_S \downarrow \Rightarrow f_0 \downarrow` },
    ],
  },
  meaning: t(
    '沉积层之所以放大地震动，是因为波在软层与硬基底之间来回反射形成驻波。当层厚恰好等于 1/4 波长的奇数倍时，所有反射同相叠加，放大达到极大。这条简单规律解释了 1985 年墨西哥城地震最著名的灾难：远离震中 400 km 的湖床沉积层（H ≈ 40 m，Vs ≈ 80 m/s）共振周期约 2 s，恰好与中层建筑的周期吻合，于是远离震中的高楼成片倒塌。',
    'Sediments amplify ground motion because waves reflect back and forth between the soft layer and the stiff basement, forming standing waves. When the thickness equals an odd multiple of a quarter wavelength all reflections add in phase and amplification is maximal. This simple rule explains the most famous disaster of the 1985 Mexico City earthquake: lake-bed sediments 400 km from the epicentre (H ≈ 40 m, Vs ≈ 80 m/s) have a resonance period near 2 s, exactly matching mid-rise buildings, so tall buildings far from the source collapsed in large numbers.',
  ),
  symbols: [
    { sym: 'f_n', name: t('第 n 阶共振频率', 'n-th resonance frequency'), unit: 'Hz' },
    { sym: 'H', name: t('土层厚度', 'soil layer thickness'), unit: 'm' },
    { sym: 'V_S', name: t('土层平均 S 波速度', 'average S velocity of the layer'), unit: 'm/s' },
    { sym: '\\rho V_S', name: t('S 波阻抗', 'S-wave impedance'), unit: 'kg/(m²·s)' },
    { sym: 'A_{\\max}', name: t('共振处的放大倍数', 'amplification factor at resonance'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('场地效应评估、微区划、土层地震反应分析', 'Site-effect assessment, microzonation, soil seismic-response analysis')],
    assumes: [t('水平成层、SH 波垂直入射', 'Horizontal layering, vertically incident SH waves')],
    breaks: [t('强非线性（大应变）时共振频率与放大倍数都随振幅改变', 'Under strong nonlinearity the resonance frequency and amplification both change with amplitude'), t('二维/三维盆地效应（聚焦、边缘波）无法用一维模型描述', '2-D/3-D basin effects (focusing, edge waves) cannot be described by a 1-D model')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('一层覆盖半空间，波垂直入射', 'A layer over a half-space with vertical incidence'), latex: String.raw`u(z,\omega) = A e^{ikz}+B e^{-ikz}` },
    { n: 2, op: 'physics', title: t('自由表面应力为零、基底位移连续', 'Zero traction at the free surface, continuous displacement at the base'), latex: String.raw`\sigma_{xz}(0)=0;\quad u(H^-)=u(H^+)` },
    { n: 3, op: 'algebra', title: t('导出地表与基底位移之比', 'Derive the surface-to-base displacement ratio'), latex: String.raw`|T(\omega)| = \frac{1}{\left|\cos kH + i\,\alpha\sin kH\right|},\quad \alpha = \frac{\rho_2V_{S2}}{\rho_1V_{S1}}` },
    { n: 4, op: 'identity', title: t('cos(kH) = 0 时取极小分母，即 kH = (2n+1)π/2', 'The denominator is minimal when cos(kH) = 0, i.e. kH = (2n+1)π/2'), latex: String.raw`kH = \frac{(2n+1)\pi}{2} \Longrightarrow \frac{\omega H}{V_S} = \frac{(2n+1)\pi}{2}` },
    { n: 5, op: 'result', title: t('解出共振频率', 'Solve for the resonance frequencies'), latex: String.raw`f_n = \frac{(2n+1)\pi}{2}\cdot\frac{V_S}{2\pi H} = \frac{(2n+1)V_S}{4H}` },
  ],
  viz: [
    {
      id: 'soil-tf',
      level: 'V2',
      title: t('一层土的传递函数', 'Transfer function of a single soil layer'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('放大倍数 |T|', 'amplification |T|'),
      controls: [
        { id: 'H', label: t('土层厚度 H (m)', 'soil thickness H (m)'), min: 5, max: 300, step: 1, value: 40 },
        { id: 'vs1', label: t('土层 Vs (m/s)', 'soil Vs (m/s)'), min: 60, max: 800, step: 5, value: 150 },
        { id: 'imp', label: t('阻抗比 ρ₂Vs₂/ρ₁Vs₁', 'impedance ratio ρ₂Vs₂/ρ₁Vs₁'), min: 1.2, max: 12, step: 0.1, value: 5 },
        { id: 'damp', label: t('土层阻尼比', 'soil damping ratio'), min: 0.01, max: 0.2, step: 0.005, value: 0.05 },
      ],
      note: t('曲线的每个尖峰就是一阶共振，峰位等间隔（基频的奇数倍）。阻抗比越大峰越高，阻尼越大峰越钝 —— 在真实土层中阻尼往往在 3–10%，这把理论上的无穷放大限制到几倍到十几倍。', 'Each spike is a resonance, spaced at odd multiples of the fundamental. A larger impedance contrast gives taller peaks, larger damping blunter ones — real soils typically have 3–10% damping, which limits the theoretically infinite amplification to a factor of a few to a dozen.'),
      compute: (p) => {
        const H = p['H'], vs1 = p['vs1'], imp = p['imp'], damp = p['damp']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 500; i++) {
          const f = 0.05 + (i / 500) * 14.95
          const w = 2 * Math.PI * f
          const k = w / vs1
          // 复波数 k(1 − i·damp)：cos/sinh 项给出阻尼引起的额外衰减
          const ar = Math.cos(k * H)
          const ai = imp * Math.sin(k * H)
          const mod = Math.sqrt(ar * ar + ai * ai) + damp * imp * k * H
          pts.push([f, Math.max(0.3, 1 / Math.max(mod, 0.05))])
        }
        return [{ label: t('|T(f)|', '|T(f)|'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'soil-res',
      level: 'V1',
      title: t('基阶共振频率与厚度的关系', 'Fundamental resonance frequency versus thickness'),
      xlabel: t('土层厚度 H (m)', 'soil thickness H (m)'),
      ylabel: t('基阶共振频率 f₀ (Hz)', 'fundamental resonance frequency f₀ (Hz)'),
      controls: [{ id: 'vs1', label: t('土层 Vs (m/s)', 'soil Vs (m/s)'), min: 60, max: 800, step: 5, value: 150 }],
      note: t('f₀ = Vs/(4H) 是一条双曲线。厚度 10 m 的硬土共振在 3.75 Hz（影响低矮房屋），厚度 150 m 的软土共振在 0.25 Hz（影响高层建筑与长周期结构）—— 这条曲线就是微区划图的理论骨架。', 'f₀ = Vs/(4H) is a hyperbola. A 10 m stiff-soil layer resonates at 3.75 Hz (affecting low-rise buildings); a 150 m soft layer at 0.25 Hz (affecting tall buildings and long-period structures) — this curve is the theoretical backbone of microzonation maps.'),
      compute: (p) => {
        const vs1 = p['vs1']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const H = 2 + (i / 200) * 298
          pts.push([H, vs1 / (4 * H)])
        }
        return [{ label: t('f₀ = Vs/(4H)', 'f₀ = Vs/(4H)'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('墨西哥城湖床区', 'The Mexico City lake bed'),
    input: t('H = 40 m，Vs = 80 m/s，阻抗比约 5–10', 'H = 40 m, Vs = 80 m/s, impedance ratio about 5–10'),
    steps: [
      t('f₀ = 80/(4×40) = 0.5 Hz，T₀ = 2 s', 'f₀ = 80/(4×40) = 0.5 Hz, T₀ = 2 s'),
      t('该周期与 6–15 层建筑的自振周期重合', 'That period coincides with the natural period of 6–15 storey buildings'),
    ],
    output: t('放大倍数达到 5 倍以上，1985 年造成远处高楼集中倒塌', 'Amplification above a factor of 5, causing concentrated collapse of tall buildings far from the source in 1985'),
  },
  links: {
    upstream: [
      { id: 'site-amplification-hv', note: t('H/V 法测的就是这个共振频率', 'The H/V method measures exactly this frequency') },
      { id: 'free-surface-amplification', note: t('自由表面本身就有 2 倍放大', 'The free surface alone gives a factor of 2') },
    ],
    downstream: [{ id: 'vs30-site-term', note: t('Vs30 场地项是工程化的简化', 'The Vs30 site term is the engineering simplification') }],
    seealso: [{ id: 'rayleigh-hv-ellipticity', note: t('H/V 椭圆率峰值对应同一频率', 'The H/V ellipticity peak corresponds to the same frequency') }],
  },
  refs: [{ text: 'Kramer, Geotechnical Earthquake Engineering, Ch. 8 (site response)' }],
}

export default quarterWavelengthAmplification
