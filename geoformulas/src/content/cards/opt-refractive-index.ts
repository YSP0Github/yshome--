import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-refractive-index */
const optRefractiveIndex: FormulaCard = {
  id: 'opt-refractive-index',
  name: t('折射率', 'Refractive Index'),
  aliases: { zh: ['绝对折射率', 'n=c/v'], en: ['absolute refractive index', 'n = c over v'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.VEL', 'Q.OPT'],
    keywords: t('折射率 光速 介质 n=c/v 光密 光疏', 'refractive index speed of light medium n=c/v optically dense'),
  },
  audience: 'highschool',
  complete: 'L1',
  statement: {
    main: String.raw`n=\frac{c}{v}`,
    variants: [
      { name: t('相对折射率', 'Relative refractive index'), latex: String.raw`n_{21}=\frac{n_2}{n_1}=\frac{v_1}{v_2}` },
    ],
  },
  meaning: t(
    '折射率 n 是光在真空中的速度 c 与在介质中速度 v 之比，恒有 n≥1。真空 n=1，空气≈1.0003，水≈1.33，普通玻璃≈1.5。折射率越大，光走得越慢、偏折越强；它还随波长变化（色散），是透镜与棱镜设计的根本参数。',
    'The refractive index n is the ratio of the speed of light in vacuum c to its speed v in a medium, always n ≥ 1. Vacuum is n = 1, air ≈ 1.0003, water ≈ 1.33, common glass ≈ 1.5. The larger n is, the slower light travels and the more it bends; n also varies with wavelength (dispersion), which underlies lenses and prisms.',
  ),
  symbols: [
    { sym: 'n', name: t('介质绝对折射率', 'absolute refractive index of the medium'), unit: '1', typical: '1.0 – 1.8' },
    { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s', typical: '3.00×10⁸' },
    { sym: 'v', name: t('介质中光速', 'speed of light in the medium'), unit: 'm/s' },
    { sym: 'n_{21}', name: t('介质 2 相对介质 1 的折射率', 'index of medium 2 relative to medium 1'), unit: '1' },
  ],
  conditions: {
    applies: [t('各向同性透明介质', 'Isotropic transparent medium')],
    assumes: [t('对某一特定波长而言（n 有色散）', 'For a given wavelength; n is dispersive')],
    breaks: [t('各向异性晶体中一条光线有两个折射率（双折射）', 'In anisotropic crystals a ray has two refractive indices (birefringence)')],
  },
  links: {
    upstream: [{ id: 'wavenumber-wavelength', note: t('v=fλ', 'v = f λ') }],
    downstream: [{ id: 'opt-snell-law' }, { id: 'opt-lensmaker-equation' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §3.5' }],
}

export default optRefractiveIndex
