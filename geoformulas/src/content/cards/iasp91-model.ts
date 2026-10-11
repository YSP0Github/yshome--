import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** iasp91-model */
const iasp91Model: FormulaCard = {
  id: 'iasp91-model',
  name: t('IASP91 一维速度模型', 'The IASP91 1D Velocity Model'),
  aliases: { zh: ['IASP91', '一维模型', '参考地球模型'], en: ['IASP91', '1D model', 'reference Earth model'] },
  node: 'S7.1',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.STRUCT', 'METH.TELE'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`v(z):\ \text{分段线性},\ \text{锚点间线性插值}`,
    variants: [
      { name: t('莫霍面（35 km）', 'The Moho (35 km)'), latex: String.raw`v_P: 6.50 \to 8.04,\qquad v_S: 3.75 \to 4.47\ \text{km/s}` },
      { name: t('410 km 间断面', 'The 410 km discontinuity'), latex: String.raw`v_P: 8.91 \to 9.36,\qquad v_S: 4.77 \to 5.08\ \text{km/s}` },
      { name: t('660 km 间断面', 'The 660 km discontinuity'), latex: String.raw`v_P: 10.20 \to 10.79,\qquad v_S: 5.61 \to 5.96\ \text{km/s}` },
      { name: t('核幔边界（2891.5 km）', 'Core–mantle boundary (2891.5 km)'), latex: String.raw`v_P: 13.72 \to 8.06,\qquad v_S: 7.26 \to 0\ \text{km/s}` },
    ],
  },
  meaning: t(
    'IASP91 是国际地震中心（ISC）用于定位的标准一维模型，由 Kennett 与 Engdahl 在 1991 年给出。它不像 PREM 那样追求物理自洽（密度、压力、椭率），而是纯粹追求「让全球走时残差最小」—— 所以它是走时定位与到时预测的首选模型。',
    'IASP91 is the standard 1D model used by the International Seismological Centre for locating events, published by Kennett and Engdahl in 1991. Unlike PREM it does not aim at physical self-consistency (density, pressure, ellipticity); it simply minimises global travel-time residuals, which makes it the model of choice for location and arrival-time prediction.',
  ),
  symbols: [
    { sym: 'v_{P}', name: t('P 波速度', 'P velocity'), unit: 'km/s' },
    { sym: 'v_{S}', name: t('S 波速度', 'S velocity'), unit: 'km/s' },
    { sym: 'z', name: t('深度', 'depth'), unit: 'km' },
    { sym: '\\Delta v', name: t('间断面上的速度跳跃', 'velocity jump at a discontinuity'), unit: 'km/s' },
  ],
  conditions: {
    applies: [t('地震定位、到时预测、走时残差研究', 'Earthquake location, arrival-time prediction, travel-time residual studies')],
    assumes: [
      t('球对称、忽略椭率与横向非均匀', 'Spherical symmetry; ellipticity and lateral heterogeneity ignored'),
      t('图中的曲线为简化示意，正式模型有 47 个锚点', 'The plotted curves are simplified; the official model has 47 anchor points'),
    ],
    breaks: [
      t('区域研究需要用本地一维模型（如华南、华北模型）', 'Regional studies require local 1D models'),
      t('需要密度或压力剖面时应改用 PREM', 'Use PREM instead when density or pressure profiles are needed'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把地球分成若干壳层', 'Divide the Earth into shells'),
      latex: String.raw`\text{地壳} \to \text{上地幔} \to \text{过渡带} \to \text{下地幔} \to \text{外核} \to \text{内核}` },
    { n: 2, op: 'identity', title: t('层内速度线性', 'Velocity is linear within a layer'),
      latex: String.raw`v(z) = v_i + \frac{v_{i+1}-v_i}{z_{i+1}-z_i}(z-z_i)` },
    { n: 3, op: 'physics', title: t('主要间断面由矿物相变决定', 'Major discontinuities reflect mineral phase transitions'),
      latex: String.raw`410\ \text{km}:\ \text{橄榄石}\to\text{瓦兹利石},\quad 660\ \text{km}:\ \text{林伍德石}\to\text{钙钛矿}` },
    { n: 4, op: 'identity', title: t('外核 S 波速度为零（液态）', 'The outer core has zero S velocity (liquid)'),
      latex: String.raw`v_S = 0\ \text{for}\ 2891.5 < z < 5153.5\ \text{km}` },
    { n: 5, op: 'result', title: t('模型由走时数据反演标定', 'The model is calibrated by inverting travel-time data'),
      latex: String.raw`\min\sum_k\left(T_k^{\text{obs}} - T_k^{\text{calc}}[v]\right)^{2}` },
  ],
  viz: [
    {
      id: 'iasp91-profile',
      level: 'V2',
      title: t('IASP91 简化速度剖面', 'Simplified IASP91 velocity profile'),
      xlabel: t('速度 (km/s)', 'velocity (km/s)'),
      ylabel: t('深度 (km)', 'depth (km)'),
      controls: [],
      note: t('注意 2891.5 km 处 S 波速度骤降为零（外核液态），P 波速度也大幅下降。', 'Note that at 2891.5 km the S velocity drops to zero (liquid outer core) and the P velocity falls sharply.'),
      compute: () => {
        const P: Array<[number, number]> = [
          [5.8, 0], [5.8, 20], [6.5, 20], [6.5, 35], [8.04, 35],
          [8.3, 210], [8.91, 410], [9.36, 410], [10.2, 660], [10.79, 660],
          [11.42, 1000], [12.79, 2000], [13.72, 2891.5], [8.06, 2891.5],
          [9.5, 4000], [10.36, 5153.5], [11.03, 5153.5], [11.26, 6371],
        ]
        const S: Array<[number, number]> = [
          [3.36, 0], [3.36, 20], [3.75, 20], [3.75, 35], [4.47, 35],
          [4.52, 210], [4.77, 410], [5.08, 410], [5.61, 660], [5.96, 660],
          [6.31, 1000], [6.93, 2000], [7.26, 2891.5], [0, 2891.5],
          [0, 5153.5], [3.5, 5153.5], [3.67, 6371],
        ]
        return [
          { label: t('v_P', 'v_P'), color: '#185FA5', points: P },
          { label: t('v_S', 'v_S'), color: '#993C1D', points: S },
        ]
      },
    },
  ],
  example: {
    title: t('莫霍面的速度跳跃', 'The velocity jump at the Moho'),
    input: t('35 km 处 v_P 由 6.50 跳到 8.04 km/s', 'At 35 km, v_P jumps from 6.50 to 8.04 km/s'),
    steps: [
      t('Δv_P = 1.54 km/s，相对跳跃 24%', 'Δv_P = 1.54 km/s, a relative jump of 24%'),
      t('声阻抗跳跃约 30%，足以产生清晰的 PmP 反射', 'An impedance jump of about 30%, enough for a clear PmP reflection'),
    ],
    output: t('这是全球地震图上最容易识别的壳幔边界信号', 'This is the most easily recognised crust–mantle boundary signal on global seismograms'),
  },
  links: {
    upstream: [{ id: 'prem-velocity-model', note: t('另一套参考模型', 'Another reference model') }],
    downstream: [{ id: 'mantle-discontinuities', note: t('间断面的物理解释', 'Physical interpretation of the discontinuities') }],
    seealso: [{ id: 'spherical-earth-travel-time', note: t('用模型算走时', 'Computing travel times with the model') }],
  },
  refs: [{ text: 'Kennett, B. L. N. & Engdahl, E. R. (1991). Travel times for global earthquake location. Geophys. J. Int., 105, 429–465' }],
}

export default iasp91Model
