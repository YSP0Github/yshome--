import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** avo-intercept-gradient */
const avoInterceptGradient: FormulaCard = {
  id: 'avo-intercept-gradient',
  name: t('AVO 截距—梯度', 'AVO Intercept and Gradient'),
  aliases: { zh: ['A-B 交会', '截距梯度', 'AVO 属性'], en: ['intercept-gradient', 'A-B crossplot', 'AVO attributes'] },
  node: 'S3.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.STAT'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP'],
    keywords: { zh: '交会图、烃类检测', en: 'crossplot, hydrocarbon detection' },
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`R(\theta) \approx A + B\sin^{2}\theta`,
    variants: [
      { name: t('截距与梯度', 'Intercept and gradient'), latex: String.raw`A = R(0) = \frac{1}{2}\left(\frac{\Delta\alpha}{\alpha}+\frac{\Delta\rho}{\rho}\right),\qquad B = \frac{dR}{d\sin^{2}\theta}` },
      { name: t('Shuey 两项式给出的 B', 'B from Shuey’s two-term form'), latex: String.raw`B = \frac{1}{2}\frac{\Delta\alpha}{\alpha} - 2\gamma\left(2\frac{\Delta\beta}{\beta}+\frac{\Delta\rho}{\rho}\right)` },
      { name: t('背景趋势', 'The background trend'), latex: String.raw`B = -m\,A\quad (m \approx 1\text{–}2)` },
    ],
  },
  meaning: t(
    '把每个采样点的反射系数对 sin²θ 做线性回归，得到两个数：截距 A（垂直入射反射率）和梯度 B（随角度变化的快慢）。含水地层里 A 与 B 沿一条固定的背景趋势排列；含气点会明显偏离这条线 —— 这就是 A–B 交会图能找油气的全部原理。',
    'Regress each sample’s reflectivity against sin²θ to get two numbers: the intercept A (normal-incidence reflectivity) and the gradient B (how fast it changes with angle). Water-saturated rocks line up along a fixed background trend; gas points depart from it — that is the whole principle behind the A–B crossplot as a hydrocarbon indicator.',
  ),
  symbols: [
    { sym: 'A', name: t('AVO 截距（零偏移距反射率）', 'AVO intercept (zero-offset reflectivity)'), unit: '无量纲', typical: '−0.3 – 0.3' },
    { sym: 'B', name: t('AVO 梯度', 'AVO gradient'), unit: '无量纲', typical: '−0.6 – 0.3' },
    { sym: '\\theta', name: t('入射角', 'incidence angle'), unit: '°' },
    { sym: 'm', name: t('背景趋势斜率', 'background trend slope'), unit: '无量纲', typical: '1 – 2' },
    { sym: '\\gamma', name: t('速度比平方 (β/α)²', 'squared velocity ratio (β/α)²'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('叠前角度道集的 AVO 属性提取与交会分析', 'AVO attribute extraction and crossplot analysis on pre-stack angle gathers')],
    assumes: [
      t('弱反差，R(θ) 对 sin²θ 近似线性', 'Weak contrast so that R(θ) is nearly linear in sin²θ'),
      t('角度覆盖足够（通常 5°–35°）', 'Adequate angular coverage (typically 5°–35°)'),
    ],
    breaks: [
      t('接近临界角时线性关系失效', 'The linear relation fails near the critical angle'),
      t('剩余 NMO、各向异性造成的假 AVO 会污染 A、B', 'Residual NMO and anisotropy create false AVO that contaminates A and B'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把 Shuey 近似写成 θ 的展开', 'Expand Shuey’s approximation in θ'),
      latex: String.raw`R(\theta) \approx R_0 + G\sin^{2}\theta` },
    { n: 2, op: 'identity', title: t('θ = 0 时给出截距', 'θ = 0 gives the intercept'),
      latex: String.raw`A = R(0) = \frac{1}{2}\left(\frac{\Delta\alpha}{\alpha}+\frac{\Delta\rho}{\rho}\right)` },
    { n: 3, op: 'identity', title: t('sin²θ 的系数给出梯度', 'The coefficient of sin²θ gives the gradient'),
      latex: String.raw`B = \frac{1}{2}\frac{\Delta\alpha}{\alpha} - 2\gamma\left(2\frac{\Delta\beta}{\beta}+\frac{\Delta\rho}{\rho}\right)` },
    { n: 4, op: 'algebra', title: t('含水时 α、β 同步变化，A 与 B 相关', 'When water saturated, α and β vary together and A, B correlate'),
      latex: String.raw`\frac{\Delta\beta}{\beta} \approx \frac{\Delta\alpha}{\alpha} \Longrightarrow B \approx A\left(\frac{1}{2}\cdot\frac{2}{1.25} - 6\gamma\right) \propto A` },
    { n: 5, op: 'result', title: t('写成背景趋势', 'Write it as the background trend'),
      latex: String.raw`B_{\text{background}} = -m\,A` },
  ],
  viz: [
    {
      id: 'ab-avo',
      level: 'V1',
      title: t('给定截距与梯度的 AVO 曲线', 'AVO curve for a chosen intercept and gradient'),
      xlabel: t('入射角 θ (°)', 'incidence angle θ (°)'),
      ylabel: t('反射系数 R', 'reflection coefficient R'),
      controls: [
        { id: 'A', label: t('截距 A', 'intercept A'), min: -0.3, max: 0.3, step: 0.005, value: -0.08 },
        { id: 'B', label: t('梯度 B', 'gradient B'), min: -0.6, max: 0.3, step: 0.005, value: -0.25 },
        { id: 'm', label: t('背景趋势斜率 m', 'background trend slope m'), min: 0.5, max: 3, step: 0.05, value: 1.5 },
      ],
      note: t('虚线是「若该点落在背景趋势上」应有的曲线。实线与虚线分得越开，含烃可能性越大。', 'The dashed curve is what the point would look like if it lay on the background trend. The wider the gap, the more likely hydrocarbons are.'),
      compute: (p) => {
        const A = p['A'], B = p['B'], m = p['m']
        const cur: Array<[number, number]> = []
        const bg: Array<[number, number]> = []
        for (let i = 0; i <= 150; i++) {
          const deg = (i / 150) * 40
          const s2 = Math.sin((deg * Math.PI) / 180) ** 2
          cur.push([deg, A + B * s2])
          bg.push([deg, A - m * A * s2])
        }
        return [
          { label: t('实测 R(θ)', 'observed R(θ)'), color: '#185FA5', points: cur },
          { label: t('背景趋势预测', 'background trend'), color: '#888780', points: bg, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('典型 III 类 AVO', 'A typical class III AVO'),
    input: t('A = −0.08，B = −0.25', 'A = −0.08, B = −0.25'),
    steps: [
      t('θ = 30°：sin²θ = 0.25，R = −0.08 − 0.25×0.25 = −0.1425', 'θ = 30°: sin²θ = 0.25, R = −0.08 − 0.25×0.25 = −0.1425'),
      t('背景趋势（m = 1.5）应为 B = +0.12，实测 −0.25', 'The background trend (m = 1.5) would give B = +0.12, but −0.25 is observed'),
    ],
    output: t('梯度明显比背景更负 —— 典型的含气砂岩（亮点）响应', 'The gradient is far more negative than the background — a classic gas-sand (bright spot) response'),
  },
  links: {
    upstream: [{ id: 'shuey-approximation', note: t('A、B 的物理表达', 'Physical expressions for A and B') }],
    downstream: [{ id: 'avo-classification', note: t('用 A、B 划分 AVO 类型', 'Classifying AVO types with A and B') }],
    seealso: [{ id: 'fluid-factor-avo', note: t('等价的另一种表述', 'An equivalent formulation') }],
  },
  refs: [{ text: 'Castagna, J. & Swan, H. (1997). Principles of AVO crossplotting. The Leading Edge, 16, 337–342' }],
}

export default avoInterceptGradient
