import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-geoid-ellipsoid */
const gravityGeoidEllipsoid: FormulaCard = {
  id: 'gravity-geoid-ellipsoid',
  name: t('大地水准面与参考椭球', 'The Geoid and the Reference Ellipsoid'),
  aliases: { zh: ['大地水准面', '似大地水准面'], en: ['geoid', 'reference ellipsoid'] },
  node: 'S14.4',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.GRAV', 'METH.STRUCT'],
    quantity: ['Q.GRAV', 'Q.GEOM'],
    keywords: t('大地水准面 参考椭球 高程异常 垂线偏差', 'geoid reference ellipsoid height anomaly deflexion of vertical'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`N=h-H`,
    variants: [
      { name: t('重力位等势面定义', 'equipotential-surface definition'), latex: String.raw`W=W_0\ \ (\text{平均海平面延伸到陆地})` },
    ],
  },
  meaning: t(
    '大地水准面是与平均海平面重合、并延伸到陆地内部的重力等势面，代表"真正的水准零点"；参考椭球是数学上规则的旋转椭球。二者之差 N 叫高程异常（大地水准面起伏），在 −100 m 到 +80 m 之间起伏。GPS 给的是椭球高 h，要换成海拔高 H = h − N 必须借助大地水准面模型（如 EGM2008）。',
    'The geoid is the equipotential surface coinciding with mean sea level and extended beneath the continents — the "true vertical datum"; the reference ellipsoid is a regular mathematical spheroid. Their separation N is the height anomaly (geoid undulation), ranging from about −100 m to +80 m. GPS gives ellipsoidal height h; converting it to orthometric height H = h − N requires a geoid model such as EGM2008.',
  ),
  symbols: [
    { sym: 'N', name: t('大地水准面起伏（高程异常）', 'geoid undulation (height anomaly)'), unit: 'm' },
    { sym: 'h', name: t('椭球高（GPS 高）', 'ellipsoidal height (GPS height)'), unit: 'm' },
    { sym: 'H', name: t('正高（海拔高）', 'orthometric height'), unit: 'm' },
    { sym: 'W_0', name: t('大地水准面位常数', 'geoid potential constant'), unit: 'm²/s²' },
  ],
  conditions: {
    applies: [t('高程基准、大地测量', 'Height datum, geodesy')],
    assumes: [t('忽略海洋动力地形', 'Ocean dynamic topography neglected')],
    breaks: [t('局部垂直基准有偏差', 'Local vertical datums may be biased')],
  },
  links: {
    upstream: [{ id: 'gravity-normal-formula' }],
    seealso: [{ id: 'gravity-spherical-harmonics-j2' }],
  },
  refs: [{ text: 'Hofmann-Wellenhof & Moritz, Physical Geodesy, §8' }],
}

export default gravityGeoidEllipsoid
