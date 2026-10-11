import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-solid-sphere */
const gravitySolidSphere: FormulaCard = {
  id: 'gravity-solid-sphere',
  name: t('均匀实心球体的引力', 'Gravity of a Uniform Solid Sphere'),
  aliases: { zh: ['实心球引力', '球体正演'], en: ['solid sphere gravity', 'buried sphere anomaly'] },
  node: 'S14.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.TRANSFORM'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV', 'Q.GEOM'],
    keywords: t('实心球 埋藏球 引力异常 正演', 'solid sphere buried sphere gravity anomaly forward model'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`g_z(r)=\frac{GM\,z}{(x^{2}+z^{2})^{3/2}}`,
    variants: [
      { name: t('地表垂直异常（剩余质量 ΔM）', 'surface vertical anomaly (excess mass ΔM)'), latex: String.raw`\Delta g(x)=\frac{G\,\Delta M\,z}{(x^{2}+z^{2})^{3/2}}` },
      { name: t('均匀球体内部（r<R）', 'inside a uniform sphere (r<R)'), latex: String.raw`g(r)=\frac{4\pi G}{3}\,\rho\,r` },
    ],
  },
  meaning: t(
    '一个埋藏在地下深度 z、半径 a、密度差 Δρ 的球体，在地表产生的垂直重力异常 Δg(x) 是重力勘探最经典的正演模型。它的峰值在球心正上方（x=0），曲线宽度与深度 z 成正比 —— 异常越宽，埋深越大。矿工、洞穴、矿体都常用它做一阶估算。',
    'A sphere buried at depth z with radius a and density contrast Δρ produces a surface vertical gravity anomaly Δg(x) — the classic forward model of gravity exploration. Its peak sits directly above the sphere centre (x=0) and the curve width scales with depth z: broader anomalies mean deeper sources. It is the first-order estimate for ore bodies, caves and cavities.',
  ),
  symbols: [
    { sym: '\\Delta g', name: t('垂直重力异常', 'vertical gravity anomaly'), unit: 'mGal' },
    { sym: '\\Delta M', name: t('剩余质量 = (4/3)πa³Δρ', 'excess mass'), unit: 'kg' },
    { sym: 'z', name: t('球心埋深', 'depth of sphere centre'), unit: 'm' },
    { sym: 'x', name: t('测点偏离球心的水平距离', 'horizontal offset from sphere centre'), unit: 'm' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³ kg⁻¹ s⁻²' },
  ],
  conditions: {
    applies: [t('近球状地质体（矿筒、溶洞、侵入体）', 'Nearly spherical bodies (ore pipes, cavities, intrusions)')],
    assumes: [t('埋深远大于半径，地面为平面', 'Depth much larger than radius, flat surface')],
    breaks: [t('深部或地形起伏大时需改正', 'Needs correction at great depth or on rugged terrain')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('球外如质点 ΔM 位于 (0,0,z)', 'Outside, sphere acts as point ΔM at (0,0,z)'),
      latex: String.raw`\Delta M=\frac{4}{3}\pi a^{3}\,\Delta\rho` },
    { n: 2, op: 'geometry', title: t('测点到球心距离 s=√(x²+z²)', 'Distance s = √(x²+z²)'),
      latex: String.raw`s=\sqrt{x^{2}+z^{2}}` },
    { n: 3, op: 'substitute', title: t('取质点引力的垂直分量', 'Take the vertical component of point-mass gravity'),
      latex: String.raw`\Delta g=G\frac{\Delta M}{s^{2}}\cdot\frac{z}{s}` },
    { n: 4, op: 'result', title: t('得地表异常曲线', 'Obtain the surface anomaly profile'),
      latex: String.raw`\Delta g(x)=\frac{G\,\Delta M\,z}{(x^{2}+z^{2})^{3/2}}` },
  ],
  viz: [
    {
      id: 'sphere-anomaly-profile',
      level: 'V1',
      title: t('埋藏球体的重力异常剖面', 'Gravity anomaly profile of a buried sphere'),
      xlabel: t('水平距离 x (m)', 'horizontal offset x (m)'),
      ylabel: t('Δg (mGal)', 'Δg (mGal)'),
      controls: [
        { id: 'depth', label: t('球心埋深 z', 'sphere depth z'), min: 50, max: 500, step: 10, value: 150, unit: 'm' },
        { id: 'deltarho', label: t('密度差 Δρ', 'density contrast Δρ'), min: 0.1, max: 1.0, step: 0.05, value: 0.5, unit: 'g/cm³' },
        { id: 'radius', label: t('球体半径 a', 'sphere radius a'), min: 10, max: 100, step: 5, value: 40, unit: 'm' },
      ],
      compute: (p) => {
        const z = p['depth'], drho = p['deltarho'], a = p['radius']
        const Gsi = 6.674e-11
        const dM = (4 / 3) * Math.PI * Math.pow(a, 3) * drho * 1000
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const x = -600 + (i / 200) * 1200
          const dg = (Gsi * dM * z) / Math.pow(x * x + z * z, 1.5)
          pts.push([x, dg * 1e5])
        }
        return [{ label: t('Δg(x)', 'Δg(x)'), color: '#185FA5', points: pts }]
      },
      note: t('埋深越大，异常峰值越低、曲线越宽；密度差越大，整幅曲线按比例抬高。', 'Deeper spheres give lower, broader peaks; larger density contrast scales the whole profile up.'),
    },
  ],
  links: {
    upstream: [{ id: 'gravity-spherical-shell' }],
    downstream: [{ id: 'gravity-bouguer-anomaly', note: t('实测异常经校正后与正演对比', 'Reduced observations compared with forward model') }],
    seealso: [{ id: 'gravity-potential-point' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §3.4' }],
}

export default gravitySolidSphere
