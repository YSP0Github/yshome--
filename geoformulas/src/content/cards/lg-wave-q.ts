import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** lg-wave-q */
const lgWaveQ: FormulaCard = {
  id: 'lg-wave-q',
  name: t('Lg 波 Q 与区域衰减成像', 'Lg-wave Q & Regional Attenuation Tomography'),
  aliases: { zh: ['Lg 波', 'Lg Q'], en: ['Lg wave', 'Lg Q', 'regional attenuation'] },
  node: 'S6.4',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT', 'MATH.GEOM'],
    method: ['METH.ATTEN', 'METH.STRUCT'],
    quantity: ['Q.AMP', 'Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`A(f,\Delta)=S(f)\,G(\Delta)\,\exp\!\left[-\frac{\pi f\Delta}{Q_{Lg}(f)\,v}\right],\qquad Q_{Lg}(f)=Q_0 f^{\eta}`,
    variants: [
      { name: t('两台站法（反演 Q(x)）', 'Two-station method (inverting for Q(x))'), latex: String.raw`\ln\frac{A_1}{A_2}=\ln\frac{G_1}{G_2}-\pi f\int_{s_1}^{s_2}\frac{\mathrm{d}s}{Q(s)v}` },
      { name: t('Lg 的几何扩散', 'Geometrical spreading of Lg'), latex: String.raw`G(\Delta)\approx\frac{1}{\sqrt{\Delta}}\ \text{在}\ 100\text{–}1000\ \text{km}` },
    ],
  },
  meaning: t(
    'Lg 是地壳波导里多次全反射叠加形成的导波，能量集中在地壳内、在 100–1000 km 的区域距离上异常稳健。正因如此，Lg 的衰减（Q_Lg）成为区域尺度上最可靠的 Q 测量手段，也被广泛用于核爆监测 —— 区分天然地震与爆炸时，Lg 的振幅比是常用的判据之一。',
    'Lg is a guided wave built from multiple total reflections in the crustal waveguide; its energy stays in the crust and is remarkably stable over regional distances of 100–1000 km. For that reason Lg attenuation (Q_Lg) is the most reliable Q measurement at regional scale and is widely used in nuclear-test monitoring, where Lg amplitude ratios help discriminate natural earthquakes from explosions.',
  ),
  symbols: [
    { sym: 'A(f,\\Delta)', name: t('频率 f、震中距 Δ 处的 Lg 振幅', 'Lg amplitude at frequency f and distance Δ'), unit: '与位移同' },
    { sym: 'Q_{Lg}', name: t('Lg 波的品质因子', 'quality factor of the Lg wave'), unit: '无量纲', typical: '100 – 1000' },
    { sym: 'Q_0,\\eta', name: t('Q 的参考值与频率依赖指数', 'reference Q and frequency-dependence exponent'), unit: '无量纲', typical: 'η ≈ 0.3 – 0.9' },
    { sym: '\\Delta', name: t('震中距', 'epicentral distance'), unit: 'km' },
  ],
  conditions: {
    applies: [t('大陆地壳内的区域距离（100–1000 km）Lg 波', 'Lg waves at regional distances (100–1000 km) in continental crust')],
    assumes: [t('地壳波导完整、无大范围缺失', 'The crustal waveguide is intact without large-scale blocking')],
    breaks: [t('Lg 在洋壳、厚沉积盆地与部分构造带中强烈衰竭甚至完全阻断', 'Lg is strongly attenuated or completely blocked in oceanic crust, thick sedimentary basins and some tectonic belts')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把振幅写成源、扩散、衰减三部分', 'Write the amplitude as source, spreading and attenuation'),
      latex: String.raw`A=S(f)\,G(\Delta)\,e^{-\pi f\Delta/(Qv)}` },
    { n: 2, op: 'identity', title: t('取对数并对多台站做回归', 'Take logs and regress over many stations'),
      latex: String.raw`\ln A+\ln G^{-1}=\ln S-\frac{\pi f}{Qv}\Delta` },
    { n: 3, op: 'result', title: t('由斜率求 Q', 'Obtain Q from the slope'),
      latex: String.raw`\text{slope}=-\frac{\pi f}{Q_{Lg}v}\;\Longrightarrow\; Q_{Lg}(f)=Q_0 f^{\eta}` },
  ],
  links: {
    upstream: [{ id: 'spectral-ratio-q', note: t('两台站法是通用手段', 'The two-station method is the general tool') }],
    seealso: [{ id: 'coda-q-method', note: t('另一种区域 Q 测量', 'Another regional Q measurement') }],
  },
  refs: [{ text: 'Mitchell (1995), Rev. Geophys., 33' }, { text: 'Xie & Mitchell (1990), Bull. Seismol. Soc. Am., 80' }],
}

export default lgWaveQ
