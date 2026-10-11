import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-lateral-magnification */
const optLateralMagnification: FormulaCard = {
  id: 'opt-lateral-magnification',
  name: t('横向放大率', 'Lateral (Transverse) Magnification'),
  aliases: { zh: ['线放大率', 'm = -v/u'], en: ['transverse magnification', 'm = -v over u'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT'],
    keywords: t('横向放大率 像高 物高 m=-v/u 倒立 正立 缩小', 'lateral magnification image height object height inverted upright reduced'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`m=\frac{y'}{y}=-\frac{v}{u}`,
    variants: [
      { name: t('|m|>1 放大，|m|<1 缩小', '|m| > 1 magnified, |m| < 1 reduced'), latex: String.raw`|m|>1:\ \text{放大；}\quad |m|<1:\ \text{缩小}` },
      { name: t('m<0 倒立实像，m>0 正立虚像', 'm < 0 inverted real image, m > 0 upright virtual image'), latex: String.raw`m<0:\ \text{倒立；}\quad m>0:\ \text{正立}` },
    ],
  },
  meaning: t(
    '横向放大率 m 是像高与物高之比，等于像距与物距之比加一个负号：m = −v/u。负号表示实像倒立；|m|>1 表示像比物大。判断一张光学系统"放大还是缩小、倒立还是正立"，算一个 m 就清楚了——它是放大本领与仪器设计的中间量。',
    'The lateral magnification m is the ratio of image height to object height, equal to minus the image-to-object distance ratio: m = −v/u. The minus sign means a real image is inverted; |m| > 1 means the image is larger. To tell whether an optical system magnifies or reduces, and whether the image is upright or inverted, one number m settles it — it is the intermediate quantity behind magnifying power and instrument design.',
  ),
  symbols: [
    { sym: 'm', name: t('横向放大率', 'lateral magnification'), unit: '1' },
    { sym: "y,y'", name: t('物高、像高', 'object and image heights'), unit: 'm' },
    { sym: 'u,v', name: t('物距、像距', 'object and image distances'), unit: 'm' },
  ],
  conditions: {
    applies: [t('近轴成像系统（透镜或球面镜）', 'Paraxial imaging system, lens or mirror')],
    assumes: [t('物像垂直于主轴', 'Object and image are perpendicular to the optical axis')],
    breaks: [t('像散或畸变时横向放大率处处不同', 'With astigmatism or distortion the magnification varies across the field')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('过光心光线构成相似三角形', 'Rays through the optical centre form similar triangles'), latex: String.raw`\frac{y'}{y}=\frac{v}{u}` },
    { n: 2, op: 'algebra', title: t('引入符号规则：倒立像取负', 'Sign convention: an inverted image is negative'), latex: String.raw`m=-\frac{v}{u}` },
  ],
  links: {
    upstream: [{ id: 'opt-thin-lens-equation' }, { id: 'opt-spherical-mirror-equation' }],
    downstream: [{ id: 'opt-optical-instruments-magnification' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §5.2' }],
}

export default optLateralMagnification
