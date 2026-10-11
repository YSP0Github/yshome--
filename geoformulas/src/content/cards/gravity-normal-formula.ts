import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-normal-formula */
const gravityNormalFormula: FormulaCard = {
  id: 'gravity-normal-formula',
  name: t('正常重力公式（参考椭球）', 'Normal Gravity Formula (Reference Ellipsoid)'),
  aliases: { zh: ['国际重力公式', '正常重力', 'Somigliana 公式'], en: ['normal gravity formula', 'GRS80', 'Somigliana'] },
  node: 'S14.2',
  tags: {
    math: ['MATH.APPROX', 'MATH.GEOM'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('正常重力 参考椭球 纬度 国际重力公式', 'normal gravity reference ellipsoid latitude international gravity formula'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`g(\varphi)=g_e\left(1+\beta\sin^{2}\varphi+\beta_1\sin^{2}2\varphi\right)`,
    variants: [
      { name: t('1980 GRS 数值（mGal）', '1980 GRS values (mGal)'), latex: String.raw`g(\varphi)=978032.7\left(1+0.0053024\sin^{2}\varphi-0.0000058\sin^{2}2\varphi\right)` },
      { name: t('1930 国际公式（Gal）', '1930 international formula (Gal)'), latex: String.raw`g(\varphi)=978.030\left(1+0.0053028\sin^{2}\varphi-0.000007\sin^{2}2\varphi\right)` },
    ],
  },
  meaning: t(
    '正常重力 g(φ) 是理想化的旋转椭球（参考椭球）表面上的理论重力，它随纬度 φ 变化：赤道小、两极大，主要由离心力随纬度的变化和椭球扁率共同造成。野外测得的重力要先减去这个正常重力，剩下的才是反映地下密度差异的"异常"。',
    'Normal gravity g(φ) is the theoretical gravity on an idealised rotating reference ellipsoid. It varies with latitude φ: smallest at the equator and largest at the poles, driven by the latitude dependence of centrifugal force and the ellipsoidal flattening. Field gravity must be reduced by this normal value; the remainder is the "anomaly" that reflects subsurface density contrasts.',
  ),
  symbols: [
    { sym: 'g(\\varphi)', name: t('纬度 φ 处的正常重力', 'normal gravity at latitude φ'), unit: 'mGal' },
    { sym: 'g_e', name: t('赤道正常重力', 'equatorial normal gravity'), unit: 'mGal', typical: '978032.7' },
    { sym: '\\varphi', name: t('地理纬度', 'geographic latitude'), unit: '°' },
    { sym: '\\beta', name: t('纬度一次系数 ≈0.0053', 'latitudinal coefficient ≈0.0053'), unit: '—' },
    { sym: '\\beta_1', name: t('二次小修正项', 'small quadratic correction'), unit: '—' },
  ],
  conditions: {
    applies: [t('参考椭球面（大地水准面附近）', 'Reference ellipsoid surface (near the geoid)')],
    assumes: [t('地球为均匀旋转平衡椭球', 'Earth as a uniformly rotating equilibrium ellipsoid')],
    breaks: [t('测点不在椭球面时需加高度校正', 'Height correction needed off the ellipsoid surface')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('重力 = 引力 − 离心力', 'Gravity = gravitation − centrifugal force'),
      latex: String.raw`g=|\nabla W|,\qquad W=V+\frac{1}{2}\omega^{2}r^{2}\cos^{2}\varphi` },
    { n: 2, op: 'setup', title: t('椭球扁率使极半径大于赤道半径', 'Flattening makes polar radius larger than equatorial'),
      latex: String.raw`R_p>R_e` },
    { n: 3, op: 'taylor', title: t('对 φ 展开并保留低阶项', 'Expand in φ, keep low-order terms'),
      latex: String.raw`g(\varphi)=g_e\left(1+\beta\sin^{2}\varphi+\beta_1\sin^{2}2\varphi\right)` },
    { n: 4, op: 'result', title: t('代入 GRS 常数', 'Plug in GRS constants'),
      latex: String.raw`g_e=978032.7\ \mathrm{mGal},\ \beta=0.0053024` },
  ],
  viz: [
    {
      id: 'normal-gravity-vs-lat',
      level: 'V1',
      title: t('正常重力随纬度的变化', 'Normal gravity versus latitude'),
      xlabel: t('纬度 φ (°)', 'latitude φ (°)'),
      ylabel: t('g(φ) (mGal)', 'g(φ) (mGal)'),
      controls: [],
      compute: () => {
        const ge = 978032.7
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const lat = -90 + i
          const phi = (lat * Math.PI) / 180
          const g = ge * (1 + 0.0053024 * Math.sin(phi) ** 2 - 0.0000058 * Math.sin(2 * phi) ** 2)
          pts.push([lat, g])
        }
        return [{ label: t('g(φ)', 'g(φ)'), color: '#185FA5', points: pts }]
      },
      note: t('从赤道到极，正常重力约增大 5200 mGal（约 0.5%）—— 这正是重力测量必须做纬度校正的原因。', 'Normal gravity rises by about 5200 mGal (~0.5%) from equator to pole — why a latitude correction is mandatory.'),
    },
  ],
  links: {
    downstream: [{ id: 'gravity-free-air-correction', note: t('与高度校正共同构成异常', 'Together with height reduction forms the anomaly') }],
    seealso: [{ id: 'gravity-latitude-variation' }, { id: 'gravity-spherical-harmonics-j2' }],
  },
  refs: [{ text: 'Moritz, Geodetic Reference System 1980; Hofmann-Wellenhof & Moritz, Physical Geodesy' }],
}

export default gravityNormalFormula
