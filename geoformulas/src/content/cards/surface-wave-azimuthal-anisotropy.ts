import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** surface-wave-azimuthal-anisotropy */
const surfaceWaveAzimuthalAnisotropy: FormulaCard = {
  id: 'surface-wave-azimuthal-anisotropy',
  name: t('面波方位各向异性', 'Azimuthal Anisotropy of Surface Waves'),
  aliases: { zh: ['2ψ/4ψ 各向异性'], en: ['azimuthal anisotropy', '2ψ/4ψ terms'] },
  node: 'S5.4',
  tags: {
    math: ['MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.SURF', 'METH.STRUCT'],
    quantity: ['Q.VEL'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`c(\psi)=c_0+A_1\cos 2\psi+A_2\sin 2\psi+A_3\cos 4\psi+A_4\sin 4\psi`,
    variants: [
      { name: t('写成幅值—方位形式', 'Amplitude–azimuth form'), latex: String.raw`c(\psi)=c_0\left[1+a_2\cos 2(\psi-\phi_2)+a_4\cos 4(\psi-\phi_4)\right]` },
      { name: t('2ψ 与 4ψ 项的地质含义', 'Geological meaning of the 2ψ and 4ψ terms'), latex: String.raw`2\psi:\ \text{区域应力场/裂隙定向};\qquad 4\psi:\ \text{矿物晶格优选方位 (LPO)}` },
    ],
  },
  meaning: t(
    '当面波速度随传播方位变化时，就说介质存在方位各向异性。把它按方位角做 Fourier 展开，2ψ 项通常反映区域应力场或定向裂隙，4ψ 项反映矿物晶格优选方位。这是目前用背景噪声与面波成像研究岩石圈变形最有力的观测之一。',
    'When surface-wave velocity varies with propagation azimuth the medium is said to be azimuthally anisotropic. Expanding it in azimuth, the 2ψ term usually reflects the regional stress field or aligned cracks, and the 4ψ term reflects lattice-preferred orientation of minerals. This is one of the most powerful observations for studying lithospheric deformation with ambient-noise and surface-wave imaging.',
  ),
  symbols: [
    { sym: '\\psi', name: t('传播方位角', 'propagation azimuth'), unit: '°' },
    { sym: 'c_0', name: t('方位平均速度', 'azimuthally averaged velocity'), unit: 'm/s' },
    { sym: 'A_{1,2}', name: t('2ψ 项的系数', 'coefficients of the 2ψ term'), unit: 'm/s' },
    { sym: 'A_{3,4}', name: t('4ψ 项的系数', 'coefficients of the 4ψ term'), unit: 'm/s' },
    { sym: '\\phi_2,\\phi_4', name: t('快轴方位', 'fast-axis azimuth'), unit: '°' },
  ],
  conditions: {
    applies: [t('方位覆盖良好的面波或噪声互相关观测', 'Surface-wave or noise-correlation observations with good azimuthal coverage')],
    assumes: [
      t('各向异性较弱（扰动 < 5%）', 'Anisotropy is weak (perturbation below 5%)'),
      t('台站—路径方位分布均匀', 'Station–path azimuths are evenly distributed'),
    ],
    breaks: [t('射线方位分布不均时，2ψ 与 4ψ 项会严重混叠', 'With uneven ray azimuths the 2ψ and 4ψ terms alias severely')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把速度写成方位的周期函数', 'Write velocity as a periodic function of azimuth'),
      latex: String.raw`c(\psi)=c(\psi+\pi)\quad\text{(正反方向等价)}`,
      note: t('面波沿正反方向速度相同，所以周期是 π 而不是 2π。', 'Surface waves travel at the same speed in opposite directions, so the period is π rather than 2π.') },
    { n: 2, op: 'transform', title: t('做 Fourier 展开', 'Fourier expansion'),
      latex: String.raw`c(\psi)=c_0+\sum_{n=1}^{\infty}\left(A_{2n}\cos 2n\psi+B_{2n}\sin 2n\psi\right)` },
    { n: 3, op: 'taylor', title: t('弱各向异性下截断到 4ψ', 'Truncate at 4ψ for weak anisotropy'),
      latex: String.raw`c(\psi)\approx c_0+A_1\cos2\psi+A_2\sin2\psi+A_3\cos4\psi+A_4\sin4\psi`,
      note: t('高阶项通常低于观测误差，截断到 4ψ 是标准做法。', 'Higher-order terms usually fall below observational error; truncating at 4ψ is standard.') },
    { n: 4, op: 'result', title: t('提取幅值与快轴方位', 'Extract amplitude and fast-axis azimuth'),
      latex: String.raw`a_2=\frac{\sqrt{A_1^2+A_2^2}}{c_0},\qquad \phi_2=\frac{1}{2}\arctan\frac{A_2}{A_1}` },
  ],
  viz: [
    {
      id: 'azimuth-rose',
      level: 'V1',
      title: t('各向异性速度随方位的变化', 'Anisotropic velocity versus azimuth'),
      xlabel: t('方位角 ψ (°)', 'azimuth ψ (°)'),
      ylabel: t('相速度 (m/s)', 'phase velocity (m/s)'),
      controls: [
        { id: 'a2', label: t('2ψ 项幅值 (%)', '2ψ amplitude (%)'), min: 0, max: 6, step: 0.1, value: 2 },
        { id: 'a4', label: t('4ψ 项幅值 (%)', '4ψ amplitude (%)'), min: 0, max: 6, step: 0.1, value: 1 },
        { id: 'ph2', label: t('2ψ 快轴方位 (°)', '2ψ fast axis (°)'), min: 0, max: 180, step: 1, value: 40 },
      ],
      compute: (p) => {
        const c0 = 3500
        const a2 = p['a2'] / 100, a4 = p['a4'] / 100
        const ph2 = (p['ph2'] * Math.PI) / 180
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 360; i++) {
          const psi = (i / 360) * 360
          const r = (psi * Math.PI) / 180
          pts.push([psi, c0 * (1 + a2 * Math.cos(2 * (r - ph2)) + a4 * Math.cos(4 * r))])
        }
        return [{ label: t('c(ψ)', 'c(ψ)'), color: '#185FA5', points: pts }]
      },
      note: t('只调 2ψ 时是两瓣花，只调 4ψ 时是四瓣花 —— 实测曲线的瓣数直接告诉你各向异性的成因。', 'Pure 2ψ gives a two-lobed pattern and pure 4ψ a four-lobed one: the lobe count of a measured curve tells you the cause of anisotropy.'),
    },
  ],
  links: {
    upstream: [{ id: 'vti-sh-azimuthal-velocity', note: t('各向异性介质中的波速', 'Wave speeds in anisotropic media') }],
    seealso: [{ id: 'shear-wave-splitting', note: t('体波各向异性的对应观测', 'The body-wave counterpart') }],
  },
  refs: [{ text: 'Smith & Dahlen (1973), J. Geophys. Res., 78' }, { text: 'Montagner & Nataf (1986), J. Geophys. Res., 91' }],
}

export default surfaceWaveAzimuthalAnisotropy
