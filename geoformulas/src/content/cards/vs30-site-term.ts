import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** vs30-site-term */
const vs30SiteTerm: FormulaCard = {
  id: 'vs30-site-term',
  name: t('Vs30 场地项', 'The Vs30 Site Term'),
  aliases: { zh: ['场地放大', 'Vs30'], en: ['Vs30', 'site amplification term', 'NEHRP site class'] },
  node: 'S11.3',
  tags: {
    math: ['MATH.STAT', 'MATH.APPROX'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.VEL'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`V_{S30}=\frac{30}{\sum_{i}\dfrac{h_i}{V_{S,i}}}=\frac{30}{\int_0^{30}\dfrac{\mathrm{d}z}{V_S(z)}}`,
    variants: [
      { name: t('场地放大项的经验形式', 'Empirical form of the site term'), latex: String.raw`f_{\text{site}}=a\ln\!\left(\frac{V_{S30}}{V_{\text{ref}}}\right)+b,\qquad V_{\text{ref}}=760\ \text{m/s}` },
      { name: t('NEHRP 场地分类', 'NEHRP site classification'), latex: String.raw`\begin{aligned}A&:\ V_{S30}>1500\\ B&:\ 760\text{–}1500\\ C&:\ 360\text{–}760\\ D&:\ 180\text{–}360\\ E&:\ <180\end{aligned}\ \text{m/s}` },
    ],
  },
  meaning: t(
    'Vs30 是地表以下 30 m 的时间平均剪切波速度，是目前国际上最常用的场地条件单一指标。它是个粗得不能再粗的近似 —— 30 m 以下的结构、土层厚度、盆地效应一概不管 —— 但胜在容易测量、全球可比，因此成了规范与 ShakeMap 的通用语言。',
    'Vs30 is the time-averaged shear-wave velocity over the top 30 m, and is the most widely used single descriptor of site condition internationally. It is an extremely crude proxy — ignoring structure below 30 m, soil thickness and basin effects — but it is easy to measure and globally comparable, which is why it became the common language of codes and ShakeMap.',
  ),
  symbols: [
    { sym: 'V_{S30}', name: t('30 m 时间平均剪切波速度', 'time-averaged shear-wave velocity over 30 m'), unit: 'm/s', typical: '150 – 1500' },
    { sym: 'h_i,V_{S,i}', name: t('第 i 层厚度与其剪切波速度', 'thickness and shear velocity of the i-th layer'), unit: 'm, m/s' },
    { sym: 'f_{\\text{site}}', name: t('GMPE 中的场地放大项', 'site amplification term in a GMPE'), unit: 'ln 单位' },
  ],
  conditions: {
    applies: [t('GMPE 的场地项、抗震规范场地分类', 'Site terms of GMPEs; site classification in building codes')],
    assumes: [t('30 m 内有速度剖面测量或有可靠的替代估计', 'A velocity profile exists within 30 m or a reliable proxy is available')],
    breaks: [t('深厚软土盆地（如墨西哥城、关东盆地）Vs30 严重低估放大效应', 'In deep soft-soil basins such as Mexico City or the Kanto basin, Vs30 badly underestimates amplification')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('走完 30 m 的总时间', 'Total time to traverse 30 m'),
      latex: String.raw`t_{30}=\sum_i\frac{h_i}{V_{S,i}}=\int_0^{30}\frac{\mathrm{d}z}{V_S(z)}` },
    { n: 2, op: 'identity', title: t('等效速度 = 总厚度 / 总时间', 'Equivalent velocity = total thickness / total time'),
      latex: String.raw`V_{S30}=\frac{30}{t_{30}}` },
    { n: 3, op: 'result', title: t('代入 GMPE 的场地项', 'Insert into the site term of a GMPE'),
      latex: String.raw`f_{\text{site}}=a\ln\frac{V_{S30}}{V_{\text{ref}}}+b` },
  ],
  viz: [
    {
      id: 'vs30-amplification',
      level: 'V1',
      title: t('场地放大随 Vs30 的变化', 'Site amplification versus Vs30'),
      xlabel: t('V_S30 (m/s)', 'V_S30 (m/s)'),
      ylabel: t('场地放大项 (ln 单位)', 'site term (ln units)'),
      xScale: 'log',
      controls: [
        { id: 'a', label: t('系数 a', 'coefficient a'), min: -0.8, max: -0.1, step: 0.01, value: -0.4 },
      ],
      compute: (p) => {
        const a = p['a']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const v = 150 * Math.pow(10, (i / 200) * 1)
          pts.push([v, a * Math.log(v / 760)])
        }
        return [{ label: t('f_site', 'f_site'), color: '#185FA5', points: pts }]
      },
      note: t('Vs30 从 760 降到 200 m/s，短周期放大约 0.53 ln 单位（约 1.7 倍）。', 'Dropping Vs30 from 760 to 200 m/s amplifies short periods by about 0.53 ln units, roughly a factor of 1.7.'),
    },
  ],
  example: {
    title: t('一层软土加一层硬土', 'One soft layer over one stiff layer'),
    input: t('0–10 m：150 m/s；10–30 m：600 m/s', '0–10 m: 150 m/s; 10–30 m: 600 m/s'),
    steps: [
      t('t₃₀ = 10/150 + 20/600 = 0.0667 + 0.0333 = 0.100 s', 't₃₀ = 10/150 + 20/600 = 0.0667 + 0.0333 = 0.100 s'),
      t('Vs30 = 30/0.1 = 300 m/s', 'Vs30 = 30/0.1 = 300 m/s'),
    ],
    output: t('NEHRP D 类场地 —— 需要显著的场地放大校正', 'NEHRP class D — significant site amplification correction required'),
  },
  links: {
    upstream: [{ id: 'gmpe-functional-form', note: t('Vs30 是它的场地项输入', 'Vs30 is the input to its site term') }],
    seealso: [{ id: 'site-amplification-hv', note: t('另一种场地参数获取方式', 'Another way to obtain site parameters') }],
  },
  refs: [{ text: 'Borcherdt (1994), Bull. Seismol. Soc. Am., 84' }],
}

export default vs30SiteTerm
