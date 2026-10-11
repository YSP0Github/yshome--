import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-birefringence */
const optBirefringence: FormulaCard = {
  id: 'opt-birefringence',
  name: t('双折射现象', 'Birefringence (Double Refraction)'),
  aliases: { zh: ['双折射', '寻常光 o 光', '非常光 e 光', '方解石'], en: ['double refraction', 'ordinary/extraordinary ray', 'calcite'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.MAT'],
    keywords: t('双折射 o光 e光 寻常光 非常光 方解石 光轴 偏振片', 'birefringence ordinary extraordinary ray calcite optical axis wave plate'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`n_o,\ n_e;\qquad \Delta n=n_e-n_o`,
    variants: [
      { name: t('波片相位延迟', 'Wave-plate phase retardation'), latex: String.raw`\delta=\frac{2\pi}{\lambda}\,(n_o-n_e)\,d` },
    ],
  },
  meaning: t(
    '方解石、石英等各向异性晶体里，一束自然光进去会分成两束：遵守 Snell 定律的寻常光（o 光）和不遵守的非常光（e 光），两者振动方向互相垂直、折射率不同，透过晶体看字会出现"双重像"。两者折射率之差 Δn = n_e − n_o 决定了波片把线偏振光变成圆偏振、椭圆偏振的能力。',
    "In anisotropic crystals such as calcite and quartz, one incident beam splits into two: the ordinary ray (o-ray), which obeys Snell's law, and the extraordinary ray (e-ray), which does not. They are polarized perpendicular to each other with different indices, so looking through the crystal shows a 'double image'. The index difference Δn = n_e − n_o sets how wave plates convert linearly polarized light into circular or elliptical polarization.",
  ),
  symbols: [
    { sym: 'n_o', name: t('寻常光折射率', 'ordinary-ray index'), unit: '1' },
    { sym: 'n_e', name: t('非常光折射率', 'extraordinary-ray index'), unit: '1' },
    { sym: '\\Delta n', name: t('双折射率', 'birefringence'), unit: '1' },
    { sym: 'd', name: t('晶体厚度', 'crystal thickness'), unit: 'm' },
    { sym: '\\delta', name: t('o、e 光相位延迟', 'phase retardation between o and e rays'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('各向异性晶体，光线沿光轴以外方向传播', 'Anisotropic crystal, propagation off the optical axis')],
    assumes: [t('单轴晶体', 'Uniaxial crystal')],
    breaks: [t('沿光轴传播时 o、e 光不分离', 'Along the optical axis the o- and e-rays do not separate')],
  },
  links: {
    upstream: [{ id: 'opt-refractive-index' }],
    downstream: [{ id: 'opt-malus-law' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §8.4' }],
}

export default optBirefringence
