import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-circular-aperture-airy */
const optCircularApertureAiry: FormulaCard = {
  id: 'opt-circular-aperture-airy',
  name: t('圆孔衍射与 Airy 斑', 'Circular-Aperture Diffraction and the Airy Disk'),
  aliases: { zh: ['爱里斑', '圆孔衍射第一暗环'], en: ['Airy disk', 'first dark ring of circular diffraction'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT'],
    keywords: t('圆孔衍射 Airy 斑 爱里斑 第一暗环 1.22λ/D 望远镜分辨', 'circular aperture diffraction Airy disk first dark ring 1.22 lambda over D telescope resolution'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\sin\theta_1=1.22\,\frac{\lambda}{D}`,
    variants: [
      { name: t('Airy 斑角半径（小角近似）', 'Angular radius of the Airy disk (small-angle)'), latex: String.raw`\theta_1\approx1.22\,\frac{\lambda}{D}` },
    ],
  },
  meaning: t(
    '任何一个光点经过圆孔（瞳孔、望远镜物镜、相机光圈）后，都不会是一个几何点，而是一个中央亮斑（Airy 斑）外面围着几圈暗弱环。第一暗环张角 sinθ₁ = 1.22λ/D。这个 1.22 倍因子是圆形孔相对单缝的修正——它直接决定了望远镜和显微镜"最多能看多细"。',
    'Every point source seen through a circular aperture (the pupil, a telescope objective, a camera iris) is imaged not as a geometric point but as a central bright Airy disk surrounded by faint rings. The first dark ring subtends sinθ₁ = 1.22λ/D. The factor 1.22 is the circular-aperture correction to the slit case — and it directly sets how fine a detail telescopes and microscopes can possibly see.',
  ),
  symbols: [
    { sym: '\\theta_1', name: t('Airy 斑（第一暗环）角半径', 'angular radius of the Airy disk (first dark ring)'), unit: 'rad' },
    { sym: 'D', name: t('圆孔直径', 'diameter of the circular aperture'), unit: 'm' },
    { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
  ],
  conditions: {
    applies: [t('远场 Fraunhofer 衍射、圆孔', 'Far-field Fraunhofer regime, circular aperture')],
    assumes: [t('圆孔被均匀照明', 'The aperture is uniformly illuminated')],
    breaks: [t('像差使光斑比 Airy 斑更大', 'Aberrations enlarge the spot beyond the Airy disk')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('圆孔次波叠加得 Bessel 函数', 'Summing Huygens sources over a circle gives a Bessel function'), latex: String.raw`I(\theta)=I_0\left[\frac{2J_1(\pi D\sin\theta/\lambda)}{\pi D\sin\theta/\lambda}\right]^2` },
    { n: 2, op: 'identity', title: t('第一零点 J₁(x)=0 在 x≈3.832', 'First zero of J1(x) at x ≈ 3.832'), latex: String.raw`\frac{\pi D\sin\theta_1}{\lambda}=3.832\approx1.22\pi` },
    { n: 3, op: 'algebra', title: t('解出 θ₁', 'Solve for θ1'), latex: String.raw`\sin\theta_1=1.22\,\frac{\lambda}{D}` },
  ],
  links: {
    upstream: [{ id: 'opt-single-slit-diffraction' }],
    downstream: [{ id: 'opt-rayleigh-criterion' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §9.1' }],
}

export default optCircularApertureAiry
