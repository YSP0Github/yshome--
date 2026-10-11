import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** acoustic-reflection-coefficient */
const acousticReflectionCoefficient: FormulaCard = {
  id: 'acoustic-reflection-coefficient',
  name: t('垂直入射声波反射系数', 'Normal-incidence Acoustic Reflection Coefficient'),
  aliases: { zh: ['反射系数', '波阻抗', '垂直入射'], en: ['reflection coefficient', 'impedance'] },
  node: 'S3.1',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.MAT'],
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`R=\frac{Z_{2}-Z_{1}}{Z_{2}+Z_{1}},\qquad Z=\rho\,\alpha`,
    variants: [
      { name: t('透射系数', 'Transmission coefficient'), latex: String.raw`T=\frac{2Z_{2}}{Z_{1}+Z_{2}}=1+R` },
      { name: t('弱反差近似', 'Weak-contrast approximation'), latex: String.raw`R\simeq\frac{1}{2}\,\frac{\Delta Z}{Z}=\frac{1}{2}\,\Delta\!\ln Z` },
      { name: t('写成 Vp 与密度', 'In terms of Vp and density'), latex: String.raw`R=\frac{\rho_2\alpha_2-\rho_1\alpha_1}{\rho_2\alpha_2+\rho_1\alpha_1}` },
    ],
  },
  meaning: t(
    '地震剖面上每一道的每一个波峰，其振幅本质上都是这个分数。地层之间「有没有看得见的界面」，取决于波阻抗 ρα 差了多少。水和油、砂和泥的差别，最后都归结到这一个式子。',
    'Every peak amplitude on every trace is, at bottom, this fraction. Whether two layers produce a visible interface depends entirely on how much ρα differs. Water vs hydrocarbon, sand vs shale — it all reduces to this expression.',
  ),
  symbols: [
    { sym: 'R', name: t('反射系数（压力振幅比）', 'reflection coefficient (pressure amplitude ratio)'), unit: '', dimension: '无量纲', typical: '−0.3 – 0.3' },
    { sym: 'T', name: t('透射系数', 'transmission coefficient'), unit: '', dimension: '无量纲' },
    { sym: 'Z', name: t('波阻抗', 'acoustic impedance'), unit: 'kg·m⁻²·s⁻¹', typical: '2×10⁶ – 2×10⁷' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('垂直入射（入射角 = 0）', 'Normal incidence (angle = 0)')],
    assumes: [
      t('声波近似：介质不能承受剪切（只考虑流体，或 P 波在法向入射的等价情形）', 'Acoustic approximation: negligible rigidity'),
      t('界面两侧都是均匀介质', 'Both half-spaces are homogeneous'),
    ],
    breaks: [
      t('非零入射角：必须改用 Zoeppritz 方程组', 'Non-zero incidence requires the Zoeppritz equations'),
      t('转换波、含流体多孔介质：需要弹性或 Biot 理论', 'Converted waves and porous media need elastic or Biot theory'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设入射、反射、透射压力振幅分别为 1、R、T', 'Let incident, reflected, transmitted pressure amplitudes be 1, R, T'),
      latex: String.raw`p_{\text{inc}}=1,\quad p_{\text{ref}}=R,\quad p_{\text{tra}}=T` },
    { n: 2, op: 'physics', title: t('边界条件一：压力连续', 'Boundary condition 1: pressure is continuous'),
      latex: String.raw`1+R=T`,
      note: t('界面不是一层膜，两侧的压力必须相等。', 'The interface is not a membrane: pressure must match across it.') },
    { n: 3, op: 'physics', title: t('边界条件二：法向质点速度连续', 'Boundary condition 2: normal particle velocity is continuous'),
      latex: String.raw`\frac{1}{Z_1}-\frac{R}{Z_1}=\frac{T}{Z_2}`,
      note: t('关键细节：向上传播的反射波，其质点速度与压力之间的关系要变号（v = −p/Z）。这是很多人在这步出错的地方。', 'A crucial detail: for the upward-going reflected wave the relation between velocity and pressure flips sign (v = −p/Z). This is where many derivations go wrong.') },
    { n: 4, op: 'substitute', title: t('代入 T = 1 + R', 'Substitute T = 1 + R'),
      latex: String.raw`\frac{1-R}{Z_1}=\frac{1+R}{Z_2}` },
    { n: 5, op: 'algebra', title: t('交叉相乘并解出 R', 'Cross-multiply and solve for R'),
      latex: String.raw`Z_2-Z_2R=Z_1+Z_1R\;\Longrightarrow\; R=\frac{Z_2-Z_1}{Z_2+Z_1}` },
    { n: 6, op: 'taylor', title: t('弱反差时的常用近似', 'The widely used weak-contrast form'),
      latex: String.raw`R=\frac{\Delta Z}{2Z+\Delta Z}\simeq\frac{1}{2}\frac{\Delta Z}{Z}=\frac{1}{2}\Delta\!\ln Z`,
      note: t('|ΔZ/Z| ≪ 1 时成立。反射地震勘探恰恰生活在 0.01–0.2 这个区间，所以这个近似天天在用。', 'Valid when |ΔZ/Z| ≪ 1. Reflection seismology lives in the 0.01–0.2 range, which is why this approximation is used daily.') },
  ],
  viz: [
    {
      id: 'rc-contrast',
      level: 'V1',
      title: t('反射系数随阻抗比的变化', 'Reflection coefficient versus impedance ratio'),
      xlabel: t('Z₂ / Z₁', 'Z₂ / Z₁'),
      ylabel: t('反射系数 R', 'reflection coefficient R'),
      controls: [],
      xRange: [0.2, 5],
      yRange: [-1, 1],
      note: t('Z₂/Z₁ = 1 时 R = 0：地层再不一样，只要波阻抗恰好相等就没有任何反射。地震分辨率的根本局限就在这里。', 'At Z₂/Z₁ = 1 we get R = 0: however different the lithologies, matching impedance means no reflection at all. This is the fundamental limit of seismic resolution.'),
      compute: () => {
        const exact: Array<[number, number]> = []
        const approx: Array<[number, number]> = []
        const trans: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const r = 0.2 + (i / 400) * 4.8
          exact.push([r, (r - 1) / (r + 1)])
          approx.push([r, 0.5 * (r - 1)])
          trans.push([r, (2 * r) / (1 + r)])
        }
        return [
          { label: t('精确 R = (Z₂−Z₁)/(Z₂+Z₁)', 'exact R = (Z₂−Z₁)/(Z₂+Z₁)'), color: '#185FA5', points: exact },
          { label: t('近似 R ≈ ½ΔZ/Z', 'approx R ≈ ½ΔZ/Z'), color: '#A32D2D', dash: true, points: approx },
          { label: t('透射系数 T', 'transmission T'), color: '#0F6E56', points: trans },
        ]
      },
    },
  ],
  example: {
    title: t('典型砂泥岩界面', 'A typical sand–shale interface'),
    input: t('砂岩 ρ₁=2200, α₁=2800 ⇒ Z₁=6.16e6；泥岩 ρ₂=2400, α₂=2500 ⇒ Z₂=6.00e6', 'sand ρ₁=2200, α₁=2800; shale ρ₂=2400, α₂=2500'),
    steps: [
      t('ΔZ = Z₂ − Z₁ = −0.16×10⁶', 'ΔZ = Z₂ − Z₁ = −0.16×10⁶'),
      t('R = −0.16/(12.16) = −0.0132', 'R = −0.16/(12.16) = −0.0132'),
      t('½ ΔZ/Z = −0.0130（近似完全够用）', '½ ΔZ/Z = −0.0130 (approximation is plenty)'),
    ],
    output: t('1.3% 的反射系数，负极性 —— 典型弱反射，实际资料中很容易被噪声淹没', 'A −1.3% reflection with negative polarity: weak and easily buried in noise in real data'),
  },
  links: {
    upstream: [
      { id: 'ps-wave-velocities', note: t('给出 α', 'supplies α') },
      { id: 'snell-ray-parameter' },
    ],
    downstream: [
      { id: 'shuey-approximation', note: t('把 R 推广到非零入射角', 'extends R to non-zero incidence') },
    ],
  },
  refs: [
    { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §2.2' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
  ],

}

export default acousticReflectionCoefficient
