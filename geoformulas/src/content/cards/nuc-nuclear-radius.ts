import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** nuc-nuclear-radius */
const nucNuclearRadius: FormulaCard = {
  id: 'nuc-nuclear-radius',
  name: t('核半径公式', 'Nuclear Radius Formula'),
  aliases: { zh: ['R=R₀A^(1/3)', '核半径', '核物质密度'], en: ['nuclear radius R = R0 A^(1/3)', 'nuclear matter density'] },
  node: 'S20.5',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.GEOM'],
    keywords: t('核半径 R=R0 A^(1/3) 核体积 核物质密度 R0=1.2fm', 'nuclear radius R = R0 A to 1/3 nuclear volume matter density R0 = 1.2 fm'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`R=R_0 A^{1/3},\qquad R_0\approx1.2\times10^{-15}\ \mathrm{m}`,
    variants: [
      { name: t('核体积与 A 成正比', 'Nuclear volume proportional to A'), latex: String.raw`V=\frac{4}{3}\pi R^3=\frac{4}{3}\pi R_0^3 A\;\Rightarrow\;\rho_{\text{核}}\ \text{为常数}` },
    ],
  },
  meaning: t(
    '原子核半径随质量数 A 的立方根增长：R=R₀A^(1/3)。这意味着核体积 ∝ A，每个核子占的体积都一样——原子核像"不可压缩的液滴"，密度约 2×10¹⁷ kg/m³，全宇宙核物质密度几乎相同。R₀≈1.2 fm（飞米）。',
    'The nuclear radius grows as the cube root of the mass number: R = R₀A^(1/3). This means the nuclear volume ∝ A and each nucleon occupies the same volume — the nucleus behaves like an "incompressible liquid drop" with density about 2×10¹⁷ kg/m³, nearly the same for all nuclear matter. R₀ ≈ 1.2 fm (femtometre).',
  ),
  symbols: [
    { sym: 'R', name: t('核半径', 'nuclear radius'), unit: 'm' },
    { sym: 'R_0', name: t('核半径常数', 'nuclear radius constant'), unit: 'm' },
    { sym: 'A', name: t('质量数', 'mass number'), unit: '1' },
  ],
  conditions: {
    applies: [t('中重核、稳定核半径', 'Medium and heavy stable nuclei')],
    assumes: [t('核子紧密堆积，密度均匀', 'Nucleons are tightly packed, uniform density')],
    breaks: [t('极轻核（A<12）有较大涨落', 'Very light nuclei (A < 12) show larger fluctuations')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('核体积正比于核子数 A', 'Nuclear volume proportional to nucleon number A'), latex: String.raw`V\propto A` },
    { n: 2, op: 'geometry', title: t('球体积 V=4πR³/3', 'Spherical volume V = 4πR³/3'), latex: String.raw`\frac{4}{3}\pi R^3\propto A` },
    { n: 3, op: 'algebra', title: t('解出 R', 'Solve for R'), latex: String.raw`R=R_0 A^{1/3}` },
  ],
  links: {
    upstream: [{ id: 'nuc-nuclear-constituents' }],
    downstream: [{ id: 'nuc-mass-defect-binding-energy' }],
  },
  refs: [{ text: 'Krane, Introductory Nuclear Physics, §2' }],
}

export default nucNuclearRadius
