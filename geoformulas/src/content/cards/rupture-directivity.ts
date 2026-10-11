import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rupture-directivity */
const ruptureDirectivity: FormulaCard = {
  id: 'rupture-directivity',
  name: t('破裂方向性', 'Rupture Directivity'),
  aliases: { zh: ['方向性效应', '多普勒效应'], en: ['rupture directivity', 'Doppler effect', 'Haskell source'] },
  node: 'S4.6',
  tags: {
    math: ['MATH.GEOM', 'MATH.FOURIER', 'MATH.VECTOR'],
    method: ['METH.TELE', 'METH.HAZARD'],
    quantity: ['Q.SOURCE', 'Q.TIME'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{A(\theta)}{A_0}=\frac{1}{\left|1-\dfrac{v_r}{c}\cos\theta\right|}`,
    variants: [
      { name: t('有效破裂长度变短', 'Shortened effective rupture length'), latex: String.raw`L_{\text{eff}}=L\left(1-\frac{v_r}{c}\cos\theta\right)` },
      { name: t('持续时间压缩', 'Compressed duration'), latex: String.raw`T_{\text{eff}}=\frac{L_{\text{eff}}}{v_r}=\frac{L}{v_r}\left(1-\frac{v_r}{c}\cos\theta\right)` },
      { name: t('典型破裂速度', 'Typical rupture velocity'), latex: String.raw`v_r\approx0.7\text{–}0.9\,\beta,\qquad \text{超剪切破裂}\ v_r>\beta` },
    ],
  },
  meaning: t(
    '当破裂以接近波速的速度沿断层扩展时，前方台站收到的能量在时间上被压缩、振幅被放大，后方则相反 —— 这与救护车警笛的多普勒效应是同一回事。方向性让同一次地震在不同方位的地震动能差好几倍，是强地面运动预测中最重要的确定性效应之一。1995 年神户、2002 年 Denali 等地震的灾害分布都被它强烈扭曲。',
    'When rupture propagates along a fault at a speed comparable to the wave speed, stations ahead receive energy compressed in time and amplified, while those behind see the opposite — the same physics as the Doppler shift of a siren. Directivity makes ground motion at different azimuths from the same earthquake differ by factors of several; it is one of the most important deterministic effects in strong-motion prediction and strongly distorted damage patterns in the 1995 Kobe and 2002 Denali earthquakes.',
  ),
  symbols: [
    { sym: 'v_r', name: t('破裂速度', 'rupture velocity'), unit: 'm/s', typical: '0.7β – 0.9β' },
    { sym: 'c', name: t('波的传播速度', 'wave propagation speed'), unit: 'm/s' },
    { sym: '\\theta', name: t('破裂传播方向与台站方位的夹角', 'angle between rupture direction and station azimuth'), unit: '°' },
    { sym: 'A(\\theta)', name: t('方位相关的振幅', 'azimuth-dependent amplitude'), unit: '与位移同' },
  ],
  conditions: {
    applies: [t('有限尺度破裂、单侧或双侧不对称扩展', 'Finite ruptures with unilateral or asymmetric bilateral propagation')],
    assumes: [t('破裂速度恒定、断层几何简单', 'Rupture velocity is constant and fault geometry is simple')],
    breaks: [t('破裂速度不均匀或断层弯曲时方向性被削弱', 'Non-uniform rupture velocity or a curved fault weakens directivity')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('破裂前端与波前的相对速度', 'Relative speed of the rupture front and the wavefront'),
      latex: String.raw`v_{\text{相对}}=c-v_r\cos\theta` },
    { n: 2, op: 'geometry', title: t('能量在时间上被压缩的倍率', 'Factor by which energy is compressed in time'),
      latex: String.raw`\frac{T}{T_{\text{eff}}}=\frac{c}{c-v_r\cos\theta}=\frac{1}{1-\dfrac{v_r}{c}\cos\theta}` },
    { n: 3, op: 'physics', title: t('能量守恒 → 振幅与持续时间成反比', 'Energy conservation → amplitude inversely proportional to duration'),
      latex: String.raw`A\propto\frac{1}{T_{\text{eff}}}\;\Longrightarrow\; \frac{A(\theta)}{A_0}=\frac{1}{\left|1-\dfrac{v_r}{c}\cos\theta\right|}` },
  ],
  viz: [
    {
      id: 'directivity-rose',
      level: 'V1',
      title: t('振幅放大随方位的分布', 'Azimuthal distribution of amplitude amplification'),
      xlabel: t('方位角 θ (°)', 'azimuth θ (°)'),
      ylabel: t('A/A₀', 'A/A₀'),
      controls: [
        { id: 'vr', label: t('v_r/c', 'v_r/c'), min: 0.1, max: 0.95, step: 0.01, value: 0.8 },
      ],
      compute: (p) => {
        const r = p['vr']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 360; i++) {
          const th = (i / 360) * 360
          const rad = (th * Math.PI) / 180
          pts.push([th, 1 / Math.abs(1 - r * Math.cos(rad))])
        }
        return [{ label: t('A/A₀', 'A/A₀'), color: '#185FA5', points: pts }]
      },
      note: t('把 v_r/c 调到 0.9：正前方振幅放大 10 倍，正后方只剩约 0.53 倍。', 'At v_r/c = 0.9 the amplitude is amplified tenfold straight ahead and reduced to about 0.53 directly behind.'),
    },
  ],
  example: {
    title: t('2002 年 Denali 地震', 'The 2002 Denali fault earthquake'),
    input: t('v_r ≈ 0.85β，沿断层走向的台站 θ ≈ 0°', 'v_r ≈ 0.85β, stations along strike have θ ≈ 0°'),
    steps: [t('A/A₀ = 1/(1 − 0.85) = 6.7', 'A/A₀ = 1/(1 − 0.85) = 6.7')],
    output: t('沿破裂方向的地震动被放大近 7 倍 —— 解释了该次地震灾害高度不对称的分布', 'Ground motion along the rupture direction was amplified nearly sevenfold, explaining the strongly asymmetric damage distribution'),
  },
  links: {
    upstream: [{ id: 'corner-frequency-source-dimension', note: t('震源尺度是方向性的前提', 'Source dimension is a prerequisite') }],
    seealso: [{ id: 'ground-motion-parameters', note: t('方向性直接改变 PGA、PGV', 'Directivity changes PGA and PGV directly') }],
  },
  refs: [{ text: 'Ben-Menahem (1961), Bull. Seismol. Soc. Am., 51' }, { text: 'Somerville et al. (1997), Seism. Res. Lett., 68' }],
}

export default ruptureDirectivity
