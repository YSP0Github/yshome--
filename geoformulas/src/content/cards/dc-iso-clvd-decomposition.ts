import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** dc-iso-clvd-decomposition */
const dcIsoClvdDecomposition: FormulaCard = {
  id: 'dc-iso-clvd-decomposition',
  name: t('矩张量的 DC / ISO / CLVD 分解', 'DC / ISO / CLVD Decomposition of the Moment Tensor'),
  aliases: { zh: ['矩张量分解', '双力偶分解', 'CLVD'], en: ['moment tensor decomposition', 'CLVD', 'isotropic component'] },
  node: 'S4.7',
  tags: {
    math: ['MATH.LINALG', 'MATH.ALGEBRA'],
    method: ['METH.TELE', 'METH.INV'],
    quantity: ['Q.TENSOR', 'Q.SOURCE'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{M}=\mathbf{M}^{\mathrm{ISO}}+\mathbf{M}^{\mathrm{DC}}+\mathbf{M}^{\mathrm{CLVD}}`,
    variants: [
      { name: t('各向同性部分', 'Isotropic part'), latex: String.raw`\mathbf{M}^{\mathrm{ISO}}=\frac{1}{3}\operatorname{tr}(\mathbf{M})\,\mathbf{I},\qquad \operatorname{tr}(\mathbf{M})=M_{11}+M_{22}+M_{33}` },
      { name: t('偏量部分的双力偶与 CLVD', 'Double couple and CLVD of the deviatoric part'), latex: String.raw`\mathbf{M}^{\mathrm{DEV}}=\mathbf{M}^{\mathrm{DC}}+\mathbf{M}^{\mathrm{CLVD}},\quad \mathbf{M}^{\mathrm{DC}}=M_0\left(\hat{\boldsymbol{n}}\hat{\boldsymbol{d}}+\hat{\boldsymbol{d}}\hat{\boldsymbol{n}}\right)` },
      { name: t('CLVD 占比的常用度量', 'A common measure of the CLVD fraction'), latex: String.raw`\varepsilon=\frac{\lambda_2^{\mathrm{DEV}}}{\max\left(|\lambda_1|,|\lambda_3|\right)},\qquad |\varepsilon|\le \tfrac12` },
    ],
  },
  meaning: t(
    '任何一个对称二阶张量都能唯一地拆成「爆炸/内爆」（ISO）、「纯剪切错动」（DC）和「补偿线性矢量偶极」（CLVD）三部分。构造地震的 CLVD 与 ISO 分量理论上为零，实测中不为零往往意味着：震源区体积变化（岩浆/流体）、多个子事件的叠加、或者反演本身受速度模型误差污染。',
    'Any symmetric second-rank tensor decomposes uniquely into an explosion/implosion part (ISO), a pure shear dislocation (DC) and a compensated linear vector dipole (CLVD). Tectonic earthquakes should have zero CLVD and ISO components; measured non-zero values usually indicate volume change (magma or fluids), superposition of subevents, or contamination of the inversion by velocity-model error.',
  ),
  symbols: [
    { sym: '\\mathbf{M}^{\\mathrm{ISO}}', name: t('各向同性（体积变化）部分', 'isotropic (volume change) part'), unit: 'N·m' },
    { sym: '\\mathbf{M}^{\\mathrm{DC}}', name: t('双力偶部分', 'double-couple part'), unit: 'N·m' },
    { sym: '\\mathbf{M}^{\\mathrm{CLVD}}', name: t('补偿线性矢量偶极部分', 'compensated linear vector dipole part'), unit: 'N·m' },
    { sym: '\\lambda_i', name: t('矩张量的本征值', 'eigenvalues of the moment tensor'), unit: 'N·m' },
    { sym: '\\operatorname{tr}(\\mathbf{M})', name: t('矩张量的迹', 'trace of the moment tensor'), unit: 'N·m' },
  ],
  conditions: {
    applies: [t('点源矩张量反演结果的物理解释', 'Physical interpretation of point-source moment tensor inversions')],
    assumes: [t('矩张量对称（6 个独立分量）', 'The moment tensor is symmetric (six independent components)')],
    breaks: [t('分解不唯一的表述方式很多，不同文献的 CLVD 百分比定义不同', 'Many non-equivalent parameterisations exist; different papers define the CLVD percentage differently')],
  },
  derivation: [
    { n: 1, op: 'identity', title: t('先把迹剥出来', 'Peel off the trace first'),
      latex: String.raw`\mathbf{M}=\underbrace{\frac{1}{3}\operatorname{tr}(\mathbf{M})\mathbf{I}}_{\text{ISO}}+\underbrace{\left(\mathbf{M}-\frac{1}{3}\operatorname{tr}(\mathbf{M})\mathbf{I}\right)}_{\text{DEV},\ \operatorname{tr}=0}` },
    { n: 2, op: 'identity', title: t('对偏量做特征值分解', 'Eigen-decompose the deviatoric part'),
      latex: String.raw`\mathbf{M}^{\mathrm{DEV}}=\sum_{i=1}^{3}\lambda_i\,\hat{\boldsymbol{e}}_i\hat{\boldsymbol{e}}_i,\qquad \lambda_1+\lambda_2+\lambda_3=0` },
    { n: 3, op: 'algebra', title: t('双力偶的本征值形如 (+M₀, 0, −M₀)', 'A double couple has eigenvalues (+M₀, 0, −M₀)'),
      latex: String.raw`\mathbf{M}^{\mathrm{DC}}\sim\left(M_0,\ 0,\ -M_0\right)` },
    { n: 4, op: 'algebra', title: t('剩下的就是 CLVD', 'What remains is the CLVD'),
      latex: String.raw`\mathbf{M}^{\mathrm{CLVD}}=\mathbf{M}^{\mathrm{DEV}}-\mathbf{M}^{\mathrm{DC}}\sim\left(-k,\ 2k,\ -k\right)` },
    { n: 5, op: 'result', title: t('三部分的占比', 'Relative fractions'),
      latex: String.raw`\text{ISO}\%=\frac{\operatorname{tr}(\mathbf{M})}{3\,M_0^{\text{总}}}\times100\%,\qquad \text{CLVD}\%=\frac{|\lambda_2^{\mathrm{DEV}}|}{\max(|\lambda_1|,|\lambda_3|)}\times100\%` },
  ],
  example: {
    title: t('识别一次火山型事件', 'Identifying a volcanic event'),
    input: t('反演得到本征值 (1.2, 0.9, 0.9)×10¹⁵ N·m', 'Inversion yields eigenvalues (1.2, 0.9, 0.9)×10¹⁵ N·m'),
    steps: [
      t('tr = 3.0×10¹⁵，ISO 分量 = 1.0×10¹⁵', 'tr = 3.0×10¹⁵, ISO component = 1.0×10¹⁵'),
      t('偏量本征值 = (0.2, −0.1, −0.1)×10¹⁵', 'Deviatoric eigenvalues = (0.2, −0.1, −0.1)×10¹⁵'),
      t('全部为偏量中的 CLVD，DC 分量为零', 'The deviatoric part is entirely CLVD; the DC component vanishes'),
    ],
    output: t('这是一个几乎纯膨胀源 —— 典型的岩浆或流体注入事件，不是构造地震', 'This is an almost pure expansion source — typical of magma or fluid injection, not a tectonic earthquake'),
  },
  links: {
    upstream: [{ id: 'moment-tensor-definition', note: t('被分解的对象', 'The object being decomposed') }],
    seealso: [{ id: 'seismic-moment', note: t('DC 部分的幅值即 M₀', 'The amplitude of the DC part is M₀') }],
  },
  refs: [{ text: 'Jost & Herrmann (1989), Bull. Seismol. Soc. Am., 79' }, { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §3.4' }],
}

export default dcIsoClvdDecomposition
