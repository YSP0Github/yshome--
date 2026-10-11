import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** fluid-factor-avo */
const fluidFactorAvo: FormulaCard = {
  id: 'fluid-factor-avo',
  name: t('流体因子（Smith–Gidlow）', 'The Fluid Factor (Smith & Gidlow)'),
  aliases: { zh: ['流体因子', 'ΔF', '烃类指示'], en: ['fluid factor', 'delta F', 'hydrocarbon indicator'] },
  node: 'S3.2',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.VEL'],
    keywords: { zh: '亮点、含气检测', en: 'bright spot, gas detection' },
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta F = \frac{\Delta\alpha}{\alpha} - 1.16\,\frac{\beta^{2}}{\alpha^{2}}\,\frac{\Delta\beta}{\beta}`,
    variants: [
      { name: t('由 Gardner 关系消去密度项', 'Eliminating density with Gardner’s relation'), latex: String.raw`\frac{\Delta\rho}{\rho} = \frac{1}{4}\frac{\Delta\alpha}{\alpha}` },
      { name: t('代入后的反射系数', 'The reflectivity after substitution'), latex: String.raw`R(\theta) = \left[\frac{1}{2\cos^{2}\theta} + \frac{1}{8}(1-4\gamma\sin^{2}\theta)\right]\frac{\Delta\alpha}{\alpha} - 4\gamma\sin^{2}\theta\frac{\Delta\beta}{\beta}` },
      { name: t('判据', 'The criterion'), latex: String.raw`\Delta F < 0 \Longrightarrow \text{偏离含水基线，可能含烃}` },
    ],
  },
  meaning: t(
    '在含水（或泥岩）地层里，P 波速度与 S 波速度遵循一条固定的经验关系 —— 泥岩基线。含气会显著压低 P 波速度却几乎不改变 S 波速度，于是测点会掉到基线下方。流体因子就是把这个「偏离量」量化成一个数。',
    'In water-saturated (or shaly) rocks, P and S velocities follow a fixed empirical relation — the mudrock line. Gas strongly lowers the P velocity while barely changing the S velocity, so the data point falls below the line. The fluid factor quantifies exactly that departure.',
  ),
  symbols: [
    { sym: '\\Delta F', name: t('流体因子', 'fluid factor'), unit: '无量纲' },
    { sym: '\\Delta\\alpha/\\alpha', name: t('P 波速度相对反差', 'fractional P-velocity contrast'), unit: '无量纲' },
    { sym: '\\Delta\\beta/\\beta', name: t('S 波速度相对反差', 'fractional S-velocity contrast'), unit: '无量纲' },
    { sym: '\\gamma', name: t('速度比平方 (β/α)²', 'squared velocity ratio (β/α)²'), unit: '无量纲', typical: '0.25' },
    { sym: '1.16', name: t('泥岩基线经验系数', 'empirical mudrock-line coefficient'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('碎屑岩储层的含气/含烃检测', 'Hydrocarbon detection in clastic reservoirs')],
    assumes: [
      t('Gardner 关系 Δρ/ρ = ¼ Δα/α 成立', 'Gardner’s relation Δρ/ρ = ¼ Δα/α holds'),
      t('S 波速度不受孔隙流体影响', 'S velocity is unaffected by pore fluid'),
    ],
    breaks: [
      t('碳酸盐岩、致密砂岩的经验系数不同', 'Carbonates and tight sands have different empirical coefficients'),
      t('含气但孔隙度很低时 ΔF 接近零，无法判别', 'Low-porosity gas sands give ΔF ≈ 0 and cannot be discriminated'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('写 Aki–Richards', 'Write Aki–Richards'),
      latex: String.raw`R(\theta) \approx \frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha} - 4\gamma\sin^{2}\theta\frac{\Delta\beta}{\beta} + \frac{1}{2}(1-4\gamma\sin^{2}\theta)\frac{\Delta\rho}{\rho}` },
    { n: 2, op: 'substitute', title: t('用 Gardner 关系消去密度', 'Eliminate density using Gardner'),
      latex: String.raw`\frac{\Delta\rho}{\rho} = \frac{1}{4}\frac{\Delta\alpha}{\alpha}` },
    { n: 3, op: 'algebra', title: t('合并 α 项', 'Collect the α terms'),
      latex: String.raw`R(\theta) = \left[\frac{1}{2\cos^{2}\theta} + \frac{1}{8}(1-4\gamma\sin^{2}\theta)\right]\frac{\Delta\alpha}{\alpha} - 4\gamma\sin^{2}\theta\frac{\Delta\beta}{\beta}` },
    { n: 4, op: 'taylor', title: t('在中等角度取 θ ≈ 30° 提取组合', 'At moderate angles (θ ≈ 30°) extract the combination'),
      latex: String.raw`\Delta F = \frac{\Delta\alpha}{\alpha} - 1.16\,\gamma\,\frac{\Delta\beta}{\beta}` },
    { n: 5, op: 'result', title: t('含水基线上 ΔF = 0', 'On the water-saturated baseline ΔF = 0'),
      latex: String.raw`\frac{\Delta\alpha}{\alpha} = 1.16\,\gamma\,\frac{\Delta\beta}{\beta}\ \Longrightarrow\ \Delta F = 0` },
  ],
  viz: [
    {
      id: 'fluid-factor-plane',
      level: 'V1',
      title: t('Δα/α – Δβ/β 平面上的流体因子', 'The fluid factor in the Δα/α – Δβ/β plane'),
      xlabel: t('Δβ/β', 'Δβ/β'),
      ylabel: t('Δα/α', 'Δα/α'),
      controls: [
        { id: 'gam', label: t('γ = (β/α)²', 'γ = (β/α)²'), min: 0.15, max: 0.4, step: 0.005, value: 0.25 },
      ],
      note: t('斜线是含水基线（ΔF = 0）。落在下方的点 P 波速度偏低 —— 典型的含气响应。', 'The diagonal is the water-saturated baseline (ΔF = 0). Points below it have anomalously low P velocity — the classic gas response.'),
      compute: (p) => {
        const gam = p['gam']
        const base: Array<[number, number]> = []
        const low: Array<[number, number]> = []
        for (let i = 0; i <= 100; i++) {
          const x = -0.3 + (i / 100) * 0.6
          const y0 = 1.16 * gam * x
          base.push([x, y0])
          low.push([x, y0 - 0.08])
        }
        return [
          { label: t('含水基线 ΔF = 0', 'water baseline ΔF = 0'), color: '#185FA5', points: base },
          { label: t('ΔF = −0.08（含气）', 'ΔF = −0.08 (gas)'), color: '#993C1D', points: low, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('含气砂岩顶界面', 'Top of a gas sand'),
    input: t('Δα/α = −0.12，Δβ/β = +0.04，γ = 0.25', 'Δα/α = −0.12, Δβ/β = +0.04, γ = 0.25'),
    steps: [
      t('ΔF = −0.12 − 1.16 × 0.25 × 0.04 = −0.12 − 0.0116 = −0.132', 'ΔF = −0.12 − 1.16 × 0.25 × 0.04 = −0.12 − 0.0116 = −0.132'),
      t('基线值应为 1.16 × 0.25 × 0.04 = 0.0116，实测却为 −0.12', 'The baseline value would be 1.16 × 0.25 × 0.04 = 0.0116, but −0.12 is observed'),
    ],
    output: t('ΔF = −0.13，显著偏离基线，判为含气', 'ΔF = −0.13, a large departure from the baseline, indicating gas'),
  },
  links: {
    upstream: [{ id: 'aki-richards-approximation', note: t('推导的起点', 'Starting point of the derivation') }],
    seealso: [
      { id: 'gardner-relation', note: t('Gardner 速度—密度关系', 'Gardner velocity–density relation') },
      { id: 'elastic-impedance', note: t('另一种角度域岩性指示', 'Another angle-domain lithology indicator') },
    ],
  },
  refs: [{ text: 'Smith, G. C. & Gidlow, P. M. (1987). Weighted stacking for rock property estimation. Geophys. Prosp., 35, 993–1014' }],
}

export default fluidFactorAvo
