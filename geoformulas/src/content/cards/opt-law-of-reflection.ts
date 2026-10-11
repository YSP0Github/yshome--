import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-law-of-reflection */
const optLawOfReflection: FormulaCard = {
  id: 'opt-law-of-reflection',
  name: t('反射定律', "Law of Reflection"),
  aliases: { zh: ['镜面反射', '入射角等于反射角'], en: ['specular reflection', 'angle of incidence equals angle of reflection'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.PHYS'],
    quantity: ['Q.GEOM'],
    keywords: t('反射定律 入射角 反射角 法线 镜面', 'reflection law incidence angle reflection angle normal mirror'),
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\theta_i=\theta_r`,
    variants: [
      { name: t('入射光线、反射光线与法线共面', 'incident ray, reflected ray and normal are coplanar'), latex: String.raw`\mathbf{k}_i,\ \mathbf{k}_r,\ \hat{\mathbf{n}}\ \text{共面，且分居法线两侧}` },
    ],
  },
  meaning: t(
    '光线射到光滑界面时，反射角等于入射角，且入射光线、反射光线与界面法线在同一平面内。这是几何光学最基本的定律，平面镜成像、潜望镜与角反射器都由它而来；它也可由光的波动说或 Fermat 原理导出。',
    'When light strikes a smooth interface, the angle of reflection equals the angle of incidence, and the incident ray, reflected ray and surface normal lie in one plane. This is the most basic law of geometrical optics; plane mirrors, periscopes and corner reflectors all follow from it, and it also follows from the wave picture of light or from Fermat’s principle.',
  ),
  symbols: [
    { sym: '\\theta_i', name: t('入射角（相对法线）', 'angle of incidence measured from the normal'), unit: 'rad' },
    { sym: '\\theta_r', name: t('反射角（相对法线）', 'angle of reflection measured from the normal'), unit: 'rad' },
    { sym: '\\hat{\\mathbf{n}}', name: t('界面单位法向量', 'unit normal to the interface'), unit: '1' },
  ],
  conditions: {
    applies: [t('光滑界面上的镜面反射（非漫反射）', 'Specular reflection at a smooth interface, not diffuse reflection')],
    assumes: [t('光线波长远小于界面粗糙起伏，可按射线处理', 'The wavelength is much smaller than the surface roughness so rays apply')],
    breaks: [t('粗糙表面发生漫反射，各方向反射光无确定角度', 'On a rough surface diffuse reflection scatters light in all directions')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设定入射与反射光线', 'Set up incident and reflected rays'), latex: String.raw`\text{入射光线方向 }\mathbf{k}_i,\ \text{反射光线方向 }\mathbf{k}_r` },
    { n: 2, op: 'physics', title: t('界面切向相位匹配', 'Tangential phase matching at the interface'), latex: String.raw`k_i\sin\theta_i=k_r\sin\theta_r` },
    { n: 3, op: 'algebra', title: t('两侧介质相同 k_i=k_r', 'Both sides are the same medium, k_i = k_r'), latex: String.raw`\sin\theta_i=\sin\theta_r\;\Rightarrow\;\theta_i=\theta_r` },
    { n: 4, op: 'result', title: t('反射定律', 'Law of reflection'), latex: String.raw`\theta_i=\theta_r` },
  ],
  links: {
    upstream: [{ id: 'opt-refractive-index', note: t('在同一介质中光速不变', 'same medium, same speed of light') }],
    seealso: [{ id: 'opt-spherical-mirror-equation' }, { id: 'snell-law-converted-waves', note: t('地震学中的对应定律', 'the same law in seismology') }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §4.7' }],
}

export default optLawOfReflection
