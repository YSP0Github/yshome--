import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-rayleigh-criterion */
const optRayleighCriterion: FormulaCard = {
  id: 'opt-rayleigh-criterion',
  name: t('Rayleigh 判据与光学仪器分辨本领', "Rayleigh Criterion and Resolving Power of Optical Instruments"),
  aliases: { zh: ['瑞利判据', '最小分辨角 θ=1.22λ/D'], en: ['Rayleigh criterion', 'minimum resolvable angle θ = 1.22λ/D'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.PHYS', 'METH.INSTR'],
    quantity: ['Q.OPT'],
    keywords: t('瑞利判据 最小分辨角 1.22λ/D 望远镜 显微镜 瞳孔 分辨本领', 'Rayleigh criterion minimum angular resolution 1.22 lambda over D telescope microscope pupil resolving power'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\theta_{\min}=1.22\,\frac{\lambda}{D}`,
    variants: [
      { name: t('显微镜最小分辨距离', 'Minimum resolvable distance for a microscope'), latex: String.raw`d_{\min}\approx\frac{0.61\lambda}{\mathrm{NA}},\quad \mathrm{NA}=n\sin u` },
    ],
  },
  meaning: t(
    'Rayleigh 判据说：一个点的 Airy 斑中心刚好落在另一个点的第一暗环时，这两个点"刚能分辨"，对应的角距离就是最小分辨角 θ_min = 1.22λ/D。D 越大（大望远镜）、λ 越短（电子显微镜），看得越细。人眼瞳孔 D≈2–3 mm，理论上能分辨约 0.1 mm 外的细节——这就是"放大不能无限"的物理上限。',
    "The Rayleigh criterion says two points are 'just resolved' when the Airy-disk centre of one falls on the first dark ring of the other; the corresponding angular separation is the minimum resolvable angle θ_min = 1.22λ/D. Larger D (big telescopes) and shorter λ (electron microscopes) see finer detail. The human pupil (D ≈ 2–3 mm) resolves about 0.1 mm detail at arm's length — the physical ceiling on why magnification cannot be pushed arbitrarily."
  ),
  symbols: [
    { sym: '\\theta_{\\min}', name: t('最小分辨角', 'minimum resolvable angle'), unit: 'rad' },
    { sym: 'D', name: t('入射孔径直径', 'diameter of the entrance aperture'), unit: 'm' },
    { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
    { sym: '\\mathrm{NA}', name: t('数值孔径', 'numerical aperture'), unit: '1' },
  ],
  conditions: {
    applies: [t('圆孔成像系统（望远镜、相机、眼睛）', 'Circular-aperture imaging systems: telescope, camera, eye')],
    assumes: [t('无像差、无大气扰动（衍射极限）', 'Diffraction-limited: no aberration, no atmospheric seeing')],
    breaks: [t('像差或大气视宁度使实际分辨角远大于 1.22λ/D', 'Aberration or seeing makes the real resolution far worse than 1.22λ/D')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('单个点源成 Airy 斑', 'Each point source forms an Airy disk'), latex: String.raw`\sin\theta_1=1.22\,\frac{\lambda}{D}` },
    { n: 2, op: 'setup', title: t('"刚能分辨"= 斑中心落在另一斑第一暗环', '"Just resolved" = one centre at the first dark ring of the other'), latex: String.raw`\theta_{\min}=\theta_1` },
    { n: 3, op: 'result', title: t('小角近似', 'Small-angle approximation'), latex: String.raw`\theta_{\min}\approx1.22\,\frac{\lambda}{D}` },
  ],
  links: {
    upstream: [{ id: 'opt-circular-aperture-airy' }, { id: 'opt-grating-resolving-power' }],
    downstream: [{ id: 'opt-optical-instruments-magnification', note: t('有效放大率受 θ_min 限制', 'useful magnification is limited by θ_min') }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §9.1' }],
}

export default optRayleighCriterion
