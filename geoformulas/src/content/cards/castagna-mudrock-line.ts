import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** castagna-mudrock-line */
const castagnaMudrockLine: FormulaCard = {
  id: 'castagna-mudrock-line',
  name: t('Castagna 泥岩线', "Castagna's Mudrock Line"),
  aliases: { zh: ['泥岩线', 'Vp-Vs 关系', 'Castagna 关系'], en: ['mudrock line', 'Vp–Vs relation', 'Castagna relation'] },
  node: 'S13.4',
  tags: {
    math: ['MATH.STAT', 'MATH.APPROX'],
    method: ['METH.ROCK'],
    quantity: ['Q.VEL'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`V_S = 0.862\,V_P - 1.172\quad (V\ \text{单位 km/s})`,
    variants: [
      { name: t('Castagna 等 (1985) 的原始形式', 'The original form of Castagna et al. (1985)'), latex: String.raw`V_S = 0.8621\,V_P - 1.1724\ \ (\text{泥岩，}V_P \in [1.5, 5]\ \text{km/s})` },
      { name: t('含水砂岩的类似关系', 'A similar relation for water-saturated sandstones'), latex: String.raw`V_S = 0.8042\,V_P - 0.8559` },
      { name: t('Greenberg–Castagna 混合岩性方法', 'The Greenberg–Castagna mixed-lithology approach'), latex: String.raw`V_S = \sum_i X_i\left(a_i V_P^{2}+b_i V_P + c_i\right)` },
      { name: t('由 Vp/Vs 反推泊松比', 'Inverting Poisson\'s ratio from Vp/Vs'), latex: String.raw`\nu = \frac{(V_P/V_S)^{2}-2}{2\left[(V_P/V_S)^{2}-1\right]}` },
    ],
  },
  meaning: t(
    '测井通常只有声波（Vp），但 AVO 分析、岩石力学与地震反演都需要 Vs。Castagna 泥岩线就是解决这个问题的经验桥梁：对碎屑岩（泥岩、页岩、砂岩混合的沉积序列），Vs 与 Vp 之间存在一条相当稳健的线性关系。它不是一个物理定律，而是大量数据的统计拟合 —— 因此在使用时必须先确认岩性落在适用范围，含气、含碳酸盐或裂缝发育时都会偏离。',
    'Logs usually only give sonic velocity (Vp), but AVO analysis, rock mechanics and seismic inversion all need Vs. Castagna\'s mudrock line is the empirical bridge: for clastic rocks (sedimentary sequences of mudstone, shale and sandstone) Vs and Vp obey a fairly robust linear relation. It is not a physical law but a statistical fit to many data — so lithology must be checked against the applicable range first, and gas, carbonates or fractures all cause deviation.',
  ),
  symbols: [
    { sym: 'V_P, V_S', name: t('纵波与横波速度', 'P- and S-wave velocities'), unit: 'km/s' },
    { sym: 'X_i', name: t('第 i 种岩性的体积分数', 'volume fraction of lithology i'), unit: '无量纲' },
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '无量纲' },
    { sym: 'a_i, b_i, c_i', name: t('各岩性的二次拟合系数', 'quadratic fit coefficients for each lithology'), unit: '—' },
  ],
  conditions: {
    applies: [t('缺横波测井时的 Vs 估计、AVO 正演、岩石力学参数估算', 'Estimating Vs when no shear log exists, AVO forward modelling, estimating rock-mechanics parameters')],
    assumes: [t('碎屑岩、含水饱和、正常压实', 'Clastic rocks, water saturated, normally compacted')],
    breaks: [t('含气砂岩严重偏离（Vp 下降而 Vs 不变）', 'Gas sands deviate strongly (Vp drops while Vs does not)'), t('碳酸盐、蒸发岩、煤层需各自的经验关系', 'Carbonates, evaporites and coals need their own relations')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('收集大量碎屑岩样品的 Vp 与 Vs 实测值', 'Collect measured Vp and Vs for many clastic samples'), latex: String.raw`\{(V_P^{(k)}, V_S^{(k)})\}_{k=1}^{N}` },
    { n: 2, op: 'physics', title: t('假定线性关系 Vs = aVp + b', 'Assume a linear relation Vs = aVp + b'), latex: String.raw`V_S = a V_P + b` },
    { n: 3, op: 'algebra', title: t('最小二乘拟合', 'Least-squares fitting'), latex: String.raw`\hat{a},\hat{b} = \arg\min\sum_k (V_S^{(k)}-aV_P^{(k)}-b)^{2}` },
    { n: 4, op: 'result', title: t('Castagna 等得到 a = 0.862、b = −1.172（km/s）', 'Castagna et al. obtained a = 0.862, b = −1.172 (km/s)'), latex: String.raw`V_S = 0.862\,V_P - 1.172` },
    { n: 5, op: 'substitute', title: t('代入泊松比公式可得 ν ≈ 0.3 附近的典型碎屑岩值', 'Substituting into the Poisson formula gives typical clastic values near ν ≈ 0.3'), latex: String.raw`V_P/V_S \approx 1.7\text{–}1.9 \Longrightarrow \nu \approx 0.24\text{–}0.31` },
  ],
  viz: [
    {
      id: 'mudrock',
      level: 'V2',
      title: t('泥岩线与含水砂岩线的对比', 'Mudrock line versus the water-sand line'),
      xlabel: t('V_P (km/s)', 'V_P (km/s)'),
      ylabel: t('V_S (km/s)', 'V_S (km/s)'),
      controls: [
        { id: 'shift', label: t('含气偏移 (km/s)', 'gas shift (km/s)'), min: -0.6, max: 0.6, step: 0.01, value: 0 },
      ],
      note: t('两条线相差约 0.2–0.3 km/s：同样 Vp 下泥岩的 Vs 更低（Vp/Vs 更高）。含气时 Vp 下降而 Vs 基本不变，数据点会水平左移、落到线下方 —— 这个「落到泥岩线之下」的偏离本身就是一种烃类指示。', 'The two lines differ by about 0.2–0.3 km/s: at the same Vp, mudstone has a lower Vs (higher Vp/Vs). Gas lowers Vp while Vs stays put, so data points move horizontally left and fall below the line — falling below the mudrock line is itself a hydrocarbon indicator.'),
      compute: (p) => {
        const sh = p['shift']
        const mud: Array<[number, number]> = []
        const sand: Array<[number, number]> = []
        const gas: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const vp = 1.5 + (i / 200) * 4.0
          mud.push([vp, 0.8621 * vp - 1.1724])
          sand.push([vp, 0.8042 * vp - 0.8559])
          gas.push([vp + sh, 0.8042 * vp - 0.8559])
        }
        return [
          { label: t('Castagna 泥岩线', 'Castagna mudrock line'), color: '#185FA5', points: mud },
          { label: t('含水砂岩线', 'water-sand line'), color: '#993C1D', points: sand },
          { label: t('含气（Vp 偏移）', 'gas (Vp shifted)'), color: '#0F6E56', points: gas },
        ]
      },
    },
    {
      id: 'vpvs-nu',
      level: 'V1',
      title: t('由 Vp/Vs 换算泊松比', 'Converting Vp/Vs to Poisson\'s ratio'),
      xlabel: t('V_P / V_S', 'V_P / V_S'),
      ylabel: t('泊松比 ν', "Poisson's ratio ν"),
      controls: [],
      note: t('Vp/Vs 从 1.5 到 2.5 对应泊松比 0.1 到 0.4。含气砂岩的 Vp/Vs 可低到 1.5–1.6（ν ≈ 0.1–0.15），而未固结泥岩可高到 2.5 以上 —— 这就是为什么 Vp/Vs 是最常用的岩性与流体指示之一。', 'Vp/Vs from 1.5 to 2.5 corresponds to Poisson\'s ratio 0.1 to 0.4. Gas sands can reach Vp/Vs as low as 1.5–1.6 (ν ≈ 0.1–0.15), while unconsolidated mudstone can exceed 2.5 — which is why Vp/Vs is one of the most widely used lithology and fluid indicators.'),
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const r = 1.42 + (i / 200) * 1.5
          const nu = (r * r - 2) / (2 * (r * r - 1))
          pts.push([r, nu])
        }
        return [{ label: t('ν(V_P/V_S)', 'ν(V_P/V_S)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('用泥岩线估计 Vs', 'Estimating Vs with the mudrock line'),
    input: t('声波测井给出 V_P = 3.2 km/s 的泥岩', 'A sonic log gives V_P = 3.2 km/s in mudstone'),
    steps: [
      t('V_S = 0.862 × 3.2 − 1.172', 'V_S = 0.862 × 3.2 − 1.172'),
      t('V_S = 2.758 − 1.172 = 1.586 km/s', 'V_S = 2.758 − 1.172 = 1.586 km/s'),
      t('V_P/V_S = 2.02 ⇒ ν = 0.338', 'V_P/V_S = 2.02 gives ν = 0.338'),
    ],
    output: t('Vs ≈ 1.59 km/s，泊松比 0.34，符合含水泥岩', 'Vs ≈ 1.59 km/s and ν = 0.34, consistent with water-saturated mudstone'),
  },
  links: {
    upstream: [
      { id: 'poissons-ratio-lame', note: t('泊松比与 Vp/Vs 的关系', 'Relation between Poisson\'s ratio and Vp/Vs') },
      { id: 'p-and-s-impedance', note: t('阻抗是 AVO 的直接输入', 'Impedances are the direct input to AVO') },
    ],
    downstream: [{ id: 'lambda-mu-rho-reflectivity', note: t('λ–μ–ρ 反演需要 Vs', 'λ–μ–ρ inversion needs Vs') }],
    seealso: [{ id: 'gassmann-fluid-substitution', note: t('含气时的偏离可用 Gassmann 定量计算', 'Gas deviation can be quantified with Gassmann') }],
  },
  refs: [{ text: 'Castagna, Batzle & Eastwood (1985), Relationships between compressional-wave and shear-wave velocities in clastic silicate rocks, Geophysics 50, 571–581' }],
}

export default castagnaMudrockLine
