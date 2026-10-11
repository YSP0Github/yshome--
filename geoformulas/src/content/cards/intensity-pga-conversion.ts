import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** intensity-pga-conversion */
const intensityPgaConversion: FormulaCard = {
  id: 'intensity-pga-conversion',
  name: t('烈度与地震动参数的换算', 'Converting Intensity to Ground-motion Parameters'),
  aliases: { zh: ['烈度换算', 'MMI-PGA', '烈度衰减'], en: ['intensity conversion', 'MMI–PGA', 'intensity attenuation'] },
  node: 'S11.4',
  tags: {
    math: ['MATH.STAT', 'MATH.APPROX'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathrm{MMI} = 3.66\log_{10}(\mathrm{PGA}) - 1.66 \quad (\mathrm{PGA}\ \text{单位 cm/s}^2)`,
    variants: [
      { name: t('反解 PGA', 'Inverting for PGA'), latex: String.raw`\log_{10}\mathrm{PGA} = \frac{\mathrm{MMI} + 1.66}{3.66}` },
      { name: t('Wald 等 (1999) 的分段关系', 'The piecewise relation of Wald et al. (1999)'), latex: String.raw`\mathrm{MMI} < \mathrm{VII}:\ \log_{10}\mathrm{PGA} = 0.\,\mathrm{MMI} + c_1;\qquad \mathrm{MMI} \ge \mathrm{VII}:\ \text{斜率变缓}` },
      { name: t('用 PGV 的关系', 'Relation using PGV'), latex: String.raw`\mathrm{MMI} = 3.47\log_{10}(\mathrm{PGV}) + 2.35\ \ (\mathrm{PGV}\ \text{单位 cm/s})` },
      { name: t('烈度衰减关系', 'Intensity attenuation relation'), latex: String.raw`\mathrm{MMI} = \mathrm{MMI}_0 - a\log_{10}R - bR` },
    ],
  },
  meaning: t(
    '烈度（MMI、EMS-98、中国烈度表）是人对地震的主观感受分级，从「无感」到「毁灭性」共十二度；PGA 是仪器读出的物理量。把两者联系起来，就能把几百年积累的历史烈度资料转成可用于危险性分析的定量地震动 —— 这是地震多发但仪器记录稀少的地区（包括中国大部分地区）延长资料序列的唯一途径。',
    'Intensity (MMI, EMS-98, the Chinese intensity scale) is a subjective twelve-degree grading of human experience, from "not felt" to "devastating"; PGA is a physical quantity read by instruments. Linking the two lets centuries of historical intensity data be converted into quantitative ground motion usable for hazard analysis — the only way to extend the record in regions with frequent earthquakes but sparse instrumental data, including much of China.',
  ),
  symbols: [
    { sym: '\\mathrm{MMI}', name: t('修正麦加利烈度', 'Modified Mercalli intensity'), unit: '度' },
    { sym: '\\mathrm{PGA}', name: t('峰值地面加速度', 'peak ground acceleration'), unit: 'cm/s²' },
    { sym: '\\mathrm{PGV}', name: t('峰值地面速度', 'peak ground velocity'), unit: 'cm/s' },
    { sym: 'R', name: t('距离', 'distance'), unit: 'km' },
  ],
  conditions: {
    applies: [t('历史地震资料定量化、ShakeMap 生成、快速损失评估', 'Quantifying historical earthquakes, ShakeMap generation, rapid loss estimation')],
    assumes: [t('烈度评定标准一致（不同烈度表需先统一）', 'Intensity assessment standards are consistent (different scales must be unified first)')],
    breaks: [t('烈度是离散整数且主观离散度大（±1 度）', 'Intensity is a discrete integer with large subjective scatter (±1 degree)'), t('长周期地震动、盆地效应会造成烈度与 PGA 不匹配', 'Long-period motion and basin effects decouple intensity from PGA')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('收集同一次地震中既有烈度评定又有仪器记录的台点', 'Collect sites where both intensity assessments and instrumental records exist'), latex: String.raw`\{(\mathrm{MMI}_k, \mathrm{PGA}_k)\}_{k=1}^{N}` },
    { n: 2, op: 'identity', title: t('假定对数线性关系', 'Assume a log-linear relation'), latex: String.raw`\mathrm{MMI} = a\log_{10}\mathrm{PGA} + b` },
    { n: 3, op: 'algebra', title: t('回归得到系数', 'Regression gives the coefficients'), latex: String.raw`a \approx 3.66,\quad b \approx -1.66` },
    { n: 4, op: 'substitute', title: t('检验：PGA = 100 cm/s² ≈ 0.1 g 时', 'Check: for PGA = 100 cm/s² ≈ 0.1 g'), latex: String.raw`\mathrm{MMI} = 3.66\times 2 - 1.66 = 5.66 \approx \mathrm{VI} `},
    { n: 5, op: 'result', title: t('也可直接用 PGV，相关性往往更好', 'PGV can be used directly and often correlates better'), latex: String.raw`\mathrm{MMI} = 3.47\log_{10}\mathrm{PGV} + 2.35` },
  ],
  viz: [
    {
      id: 'mmi-pga',
      level: 'V2',
      title: t('MMI 与 PGA、PGV 的换算曲线', 'Conversion curves between MMI and PGA, PGV'),
      xlabel: t('PGA (cm/s²)', 'PGA (cm/s²)'),
      ylabel: t('MMI', 'MMI'),
      controls: [
        { id: 'a', label: t('斜率 a', 'slope a'), min: 1.5, max: 6, step: 0.02, value: 3.66 },
        { id: 'b', label: t('截距 b', 'intercept b'), min: -4, max: 2, step: 0.02, value: -1.66 },
      ],
      note: t('这是一条半对数直线：PGA 每增大 10 倍，烈度上升约 3.7 度。注意烈度是整数，所以同一 PGA 可能被评为相差 1–2 度的不同烈度 —— 换算的离散度常常比公式本身更重要。', 'A semi-log straight line: every tenfold increase in PGA raises intensity by about 3.7 degrees. Note that intensity is an integer, so the same PGA may be assessed as intensities differing by 1–2 degrees — the scatter of the conversion often matters more than the formula itself.'),
      compute: (p) => {
        const a = p['a'], b = p['b']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const lg = -0.5 + (i / 400) * 3.5
          const pga = Math.pow(10, lg)
          pts.push([pga, a * lg + b])
        }
        return [{ label: t('MMI(PGA)', 'MMI(PGA)'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'int-atten',
      level: 'V1',
      title: t('烈度随距离的衰减', 'Intensity attenuation with distance'),
      xlabel: t('距离 R (km)', 'distance R (km)'),
      ylabel: t('MMI', 'MMI'),
      controls: [
        { id: 'i0', label: t('震中烈度 I₀', 'epicentral intensity I₀'), min: 5, max: 12, step: 0.1, value: 9 },
        { id: 'a', label: t('几何扩散项 a', 'geometrical spreading a'), min: 0.5, max: 4, step: 0.05, value: 2.2 },
        { id: 'b', label: t('吸收项 b (1/km)', 'absorption b (1/km)'), min: 0, max: 0.02, step: 0.0005, value: 0.003 },
      ],
      note: t('烈度衰减有两项：几何扩散（对数项，近场主导）与介质吸收（线性项，远场主导）。吸收项只在远距离才显著 —— 这解释了为什么小震的烈度衰减快，而大震的有感范围可以延伸到数百公里。', 'Intensity attenuation has two terms: geometrical spreading (logarithmic, dominant near the source) and absorption (linear, dominant far away). The absorption term only matters at large distance — which explains why small earthquakes attenuate quickly while large ones are felt hundreds of kilometres away.'),
      compute: (p) => {
        const i0 = p['i0'], a = p['a'], b = p['b']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const R = 1 + (i / 300) * 499
          pts.push([R, i0 - a * Math.log10(R) - b * R])
        }
        return [{ label: t('MMI(R)', 'MMI(R)'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('一次历史地震的定量化', 'Quantifying a historical earthquake'),
    input: t('史料记载某地震在 60 km 外的县城烈度为 VII 度', 'Historical records give intensity VII for a county town 60 km away'),
    steps: [
      t('由 MMI = 7 反解：log₁₀PGA = (7 + 1.66)/3.66 = 2.37', 'Invert MMI = 7: log₁₀PGA = (7 + 1.66)/3.66 = 2.37'),
      t('PGA = 10^2.37 = 234 cm/s² ≈ 0.24 g', 'PGA = 10^2.37 = 234 cm/s² ≈ 0.24 g'),
    ],
    output: t('该县城经历了约 0.24 g 的峰值加速度', 'The town experienced about 0.24 g peak acceleration'),
  },
  links: {
    upstream: [{ id: 'seismic-intensity', note: t('烈度标度的定义', 'Definition of intensity scales') }],
    downstream: [{ id: 'psha-integral', note: t('换算后的地震动进入危险性计算', 'The converted ground motion enters hazard calculation') }],
    seealso: [{ id: 'ground-motion-parameters', note: t('PGA/PGV 的定义', 'Definitions of PGA and PGV') }],
  },
  refs: [{ text: 'Wald, Quitoriano, Heaton & Kanamori (1999), Relationships between peak ground acceleration, peak ground velocity, and Modified Mercalli intensity in California, Earthquake Spectra 15, 557–564' }],
}

export default intensityPgaConversion
