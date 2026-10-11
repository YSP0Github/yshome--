import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ellipticity-correction */
const ellipticityCorrection: FormulaCard = {
  id: 'ellipticity-correction',
  name: t('椭率校正与地心纬度', 'Ellipticity Correction & Geocentric Latitude'),
  aliases: { zh: ['地球扁率', '地心纬度', '椭球校正'], en: ['flattening correction', 'geocentric latitude', 'ellipsoid correction'] },
  node: 'S2.4',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.TELE', 'METH.STRUCT'],
    quantity: ['Q.GEOM', 'Q.TIME'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\tan\psi = (1-f)^{2}\tan\phi`,
    variants: [
      { name: t('扁率定义', 'Definition of flattening'), latex: String.raw`f = \frac{a-c}{a} \approx \frac{1}{298.257}` },
      { name: t('纬度差的一阶近似', 'First-order latitude difference'), latex: String.raw`\phi - \psi \approx f\sin 2\phi \quad (\text{rad})` },
      { name: t('走时椭率校正', 'Travel-time ellipticity correction'), latex: String.raw`\delta t = \delta t(\Delta,\ \text{azimuth},\ \text{phase}) \lesssim 2\text{–}3\ \text{s}` },
    ],
  },
  meaning: t(
    '地球是扁的：赤道半径比极半径长 21 km。台站纬度、震中位置、射线路径都在椭球上，而 1D 速度模型（PREM、IASP91）建立在球对称假设上。椭率校正就是把「椭球上的真实走时」与「球模型算出的走时」之间的那几秒差值补回来。',
    'The Earth is flattened: the equatorial radius exceeds the polar radius by 21 km. Station latitudes, source positions and ray paths all live on the ellipsoid, while 1D velocity models (PREM, IASP91) assume spherical symmetry. The ellipticity correction restores the few seconds of travel time lost to that mismatch.',
  ),
  symbols: [
    { sym: 'f', name: t('扁率', 'flattening'), unit: '无量纲', typical: '1/298.257' },
    { sym: 'a', name: t('赤道半径', 'equatorial radius'), unit: 'km', typical: '6378.137' },
    { sym: 'c', name: t('极半径', 'polar radius'), unit: 'km', typical: '6356.752' },
    { sym: '\\phi', name: t('地理纬度', 'geographic latitude'), unit: '°' },
    { sym: '\\psi', name: t('地心纬度', 'geocentric latitude'), unit: '°' },
    { sym: '\\delta t', name: t('走时椭率校正量', 'travel-time ellipticity correction'), unit: 's' },
  ],
  conditions: {
    applies: [t('用球对称模型处理真实地球观测时的精度修正', 'Accuracy correction when spherical models are applied to real-Earth observations')],
    assumes: [
      t('地球为旋转椭球（WGS84 / IERS）', 'The Earth is an ellipsoid of revolution (WGS84 / IERS)'),
      t('校正量对震相、震中距与方位角都有关', 'The correction depends on phase, distance and azimuth'),
    ],
    breaks: [
      t('浅源近台站（Δ < 2°）校正几乎为零', 'Nearly zero for shallow sources at Δ < 2°'),
      t('精密到 0.1 s 以下还需考虑台站高程与地壳横向非均匀', 'Below ~0.1 s one must also handle station elevation and lateral heterogeneity'),
    ],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('椭球的子午截面是椭圆', 'The meridional cross-section is an ellipse'),
      latex: String.raw`\frac{x^{2}}{a^{2}} + \frac{z^{2}}{c^{2}} = 1` },
    { n: 2, op: 'geometry', title: t('地理纬度是法线方向，地心纬度是径向', 'Geographic latitude follows the normal, geocentric latitude the radius'),
      latex: String.raw`\tan\phi = \frac{a^{2}}{c^{2}}\tan\psi\ \Longrightarrow\ \tan\psi = (1-f)^{2}\tan\phi` },
    { n: 3, op: 'taylor', title: t('展开到扁率一阶', 'Expand to first order in flattening'),
      latex: String.raw`\phi - \psi \approx f\sin 2\phi` },
    { n: 4, op: 'result', title: t('最大值出现在中纬度', 'The maximum occurs at mid-latitude'),
      latex: String.raw`\max|\phi-\psi| = f \approx 0.1924^{\circ} \approx 11.5'\quad (\phi = 45^{\circ})` },
  ],
  viz: [
    {
      id: 'lat-difference',
      level: 'V1',
      title: t('地理纬度与地心纬度之差', 'Difference between geographic and geocentric latitude'),
      xlabel: t('地理纬度 φ (°)', 'geographic latitude φ (°)'),
      ylabel: t('φ − ψ (°)', 'φ − ψ (°)'),
      controls: [
        { id: 'f1e3', label: t('扁率 f × 10³', 'flattening f × 10³'), min: 0, max: 10, step: 0.001, value: 3.353 },
      ],
      note: t('中纬度处差得最多，两极和赤道为零 —— 因为这两个方向上法线与半径重合。', 'The difference peaks at mid-latitude and vanishes at pole and equator, where the normal and the radius coincide.'),
      compute: (p) => {
        const f = p['f1e3'] / 1000
        const exact: Array<[number, number]> = []
        const approx: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const phi = (i / 180) * 90
          const rad = (phi * Math.PI) / 180
          const psi = Math.atan((1 - f) ** 2 * Math.tan(rad))
          exact.push([phi, ((rad - psi) * 180) / Math.PI])
          approx.push([phi, ((f * Math.sin(2 * rad)) * 180) / Math.PI])
        }
        return [
          { label: t('精确 tanψ=(1−f)²tanφ', 'exact tanψ=(1−f)²tanφ'), color: '#185FA5', points: exact },
          { label: t('一阶 f sin2φ', 'first-order f sin2φ'), color: '#BA7517', points: approx, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('45°N 台站的纬度差', 'Latitude difference at 45°N'),
    input: t('φ = 45°，f = 1/298.257', 'φ = 45°, f = 1/298.257'),
    steps: [
      t('tan ψ = (1 − 1/298.257)² × 1 = 0.993307', 'tan ψ = (1 − 1/298.257)² × 1 = 0.993307'),
      t('ψ = 44.8076°，φ − ψ = 0.1924° = 11.5′', 'ψ = 44.8076°, φ − ψ = 0.1924° = 11.5′'),
    ],
    output: t('地表上约 21 km 的位置差', 'About 21 km of position difference on the surface'),
  },
  links: {
    upstream: [{ id: 'angular-distance-great-circle', note: t('球近似的几何基础', 'The spherical geometry it corrects') }],
    seealso: [{ id: 'prem-velocity-model', note: t('椭率校正后配合使用的 1D 模型', 'The 1D model used together with the correction') }],
  },
  refs: [{ text: 'Kennett & Gudmundsson (1996). Ellipticity corrections for seismic phases. Geophys. J. Int., 127, 40–48' }],
}

export default ellipticityCorrection
