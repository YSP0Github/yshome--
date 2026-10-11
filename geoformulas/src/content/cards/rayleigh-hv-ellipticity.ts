import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rayleigh-hv-ellipticity */
const rayleighHvEllipticity: FormulaCard = {
  id: 'rayleigh-hv-ellipticity',
  name: t('Rayleigh 波椭圆率的峰值频率与沉积层厚度', 'Rayleigh Ellipticity Peak Frequency & Sediment Thickness'),
  aliases: { zh: ['H/V 谱比', '椭圆率峰值', 'Nakamura 方法'], en: ['H/V spectral ratio', 'ellipticity peak', 'Nakamura method'] },
  node: 'S5.2',
  tags: {
    math: ['MATH.ROOT', 'MATH.FOURIER'],
    method: ['METH.SURF', 'METH.HAZARD'],
    quantity: ['Q.FREQ', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{H}{V}(f) = \frac{|u_x(0,f)|}{|u_z(0,f)|},\qquad
f_{\text{peak}} \simeq \frac{V_S}{4H}`,
    variants: [
      { name: t('由峰值频率反推厚度', 'Invert the peak frequency for thickness'), latex: String.raw`H \simeq \frac{V_S}{4 f_{\text{peak}}}` },
      { name: t('若已知厚度，可用平均速度标定', 'With known thickness, calibrate the average velocity'), latex: String.raw`V_{S,\text{avg}} \simeq 4 H f_{\text{peak}}` },
      { name: t('基阶共振的 1/4 波长条件', 'The quarter-wavelength condition for fundamental resonance'), latex: String.raw`H = \frac{\lambda}{4} = \frac{V_S}{4f}` },
    ],
  },
  meaning: t(
    '把单台三分量噪声记录的水平分量谱除以垂直分量谱，得到的 H/V 曲线在沉积层的基阶共振频率处出现一个明显的峰。这个峰对应「层厚 = 1/4 波长」的共振条件，因此只要知道层内的平均 S 波速度，就能用一个台站的几十分钟噪声估出沉积层厚度 —— 这是成本最低的场地勘察手段，也是强地面运动场地效应评估的第一步。',
    'Dividing the horizontal-component spectrum by the vertical-component spectrum of a single three-component noise record gives an H/V curve with a clear peak at the fundamental resonance frequency of the sediment layer. The peak corresponds to the quarter-wavelength resonance condition, so knowing the average S velocity lets a single station estimate sediment thickness from tens of minutes of noise — the cheapest site-investigation tool available and the first step in assessing site effects for strong motion.',
  ),
  symbols: [
    { sym: 'H/V', name: t('水平与垂直谱振幅之比', 'ratio of horizontal to vertical spectral amplitude'), unit: '无量纲' },
    { sym: 'f_{\\text{peak}}', name: t('椭圆率峰值频率', 'ellipticity peak frequency'), unit: 'Hz' },
    { sym: 'H', name: t('沉积层厚度', 'sediment thickness'), unit: 'm' },
    { sym: 'V_S', name: t('层内平均 S 波速度', 'average S velocity in the layer'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('单台场地效应评估、沉积盆地厚度快速勘察', 'Single-station site assessment, rapid sediment-basin reconnaissance')],
    assumes: [t('层与基底之间速度反差足够大', 'The velocity contrast between layer and basement is large enough'), t('噪声中以 Rayleigh 波为主', 'Rayleigh waves dominate the noise wavefield')],
    breaks: [t('速度反差很小时峰值不明显甚至消失', 'The peak weakens or vanishes when the contrast is small'), t('工业噪声、风吹等局源干扰会制造假峰', 'Industrial noise, wind and other local sources create spurious peaks')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('一层覆盖半空间，自由表面位移由椭圆率给出', 'A layer over a half-space; surface displacement is given by the ellipticity'), latex: String.raw`\frac{H}{V}(f) = \left|\frac{u_x(0,f)}{u_z(0,f)}\right|` },
    { n: 2, op: 'physics', title: t('垂直分量在共振时被强烈压制', 'The vertical component is strongly suppressed at resonance'), latex: String.raw`\text{共振时}\ |u_z| \to \min \Longrightarrow H/V \to \max` },
    { n: 3, op: 'identity', title: t('共振条件：层厚为 1/4 波长的奇数倍', 'Resonance when the thickness is an odd multiple of a quarter wavelength'), latex: String.raw`H = (2n+1)\frac{\lambda}{4},\quad n = 0,1,2,\dots` },
    { n: 4, op: 'substitute', title: t('取基阶 n = 0 并代入 λ = V_S / f', 'Take n = 0 and substitute λ = V_S / f'), latex: String.raw`H = \frac{V_S}{4 f_0}` },
    { n: 5, op: 'result', title: t('解出厚度或峰值频率', 'Solve for thickness or peak frequency'), latex: String.raw`f_{\text{peak}} \simeq \frac{V_S}{4H},\qquad H \simeq \frac{V_S}{4f_{\text{peak}}}` },
  ],
  viz: [
    {
      id: 'hv-curve',
      level: 'V2',
      title: t('H/V 谱比曲线与峰值频率随层厚的变化', 'H/V ratio curve and how its peak frequency varies with layer thickness'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('H/V 谱比', 'H/V spectral ratio'),
      controls: [
        { id: 'vs', label: t('层内 Vs (m/s)', 'layer Vs (m/s)'), min: 100, max: 900, step: 5, value: 300 },
        { id: 'H', label: t('层厚 H (m)', 'thickness H (m)'), min: 10, max: 800, step: 5, value: 120 },
        { id: 'con', label: t('速度反差 Vs2/Vs1', 'velocity contrast Vs2/Vs1'), min: 1.5, max: 12, step: 0.1, value: 5 },
      ],
      note: t('层厚越大峰值频率越低（f ∝ 1/H）；速度反差越大峰值越高、越尖锐。反差接近 1 时曲线几乎平坦，H/V 法就失效了。', 'A thicker layer gives a lower peak frequency (f ∝ 1/H); a larger velocity contrast gives a taller, sharper peak. When the contrast approaches 1 the curve is nearly flat and the H/V method fails.'),
      compute: (p) => {
        const vs = p['vs'], H = p['H'], con = p['con']
        const f0 = vs / (4 * H)
        const amp = 1 + 2.2 * (1 - 1 / con)
        const damp = 0.22
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const f = 0.05 + (i / 400) * 9.95
          // 主峰（基阶共振）为洛伦兹形；高次谐波为奇数倍频
          let s = 1
          for (let n = 0; n < 4; n++) {
            const fn = (2 * n + 1) * f0
            const g = damp * fn / ((con - 1) * 0.35 + 1)
            s += (amp - 1) / (1 + Math.pow((f - fn) / g, 2)) / (n + 1)
          }
          if (!Number.isFinite(s)) s = 1
          pts.push([f, s])
        }
        return [{ label: t('H/V 谱比', 'H/V ratio'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'hv-thickness',
      level: 'V1',
      title: t('由峰值频率反推厚度：H = Vs / (4 f_peak)', 'Inverting thickness from the peak: H = Vs / (4 f_peak)'),
      xlabel: t('峰值频率 f_peak (Hz)', 'peak frequency f_peak (Hz)'),
      ylabel: t('沉积层厚度 H (m)', 'sediment thickness H (m)'),
      controls: [{ id: 'vs', label: t('层内 Vs (m/s)', 'layer Vs (m/s)'), min: 100, max: 900, step: 5, value: 300 }],
      note: t('这是一条简单的双曲线：峰值频率从 1 Hz 降到 0.1 Hz，推断厚度就从 75 m 涨到 750 m。因此 Vs 的取值误差会 1:1 地传给厚度。', 'A simple hyperbola: as the peak frequency drops from 1 Hz to 0.1 Hz the inferred thickness grows from 75 m to 750 m. Errors in the assumed Vs therefore propagate 1:1 into the thickness.'),
      compute: (p) => {
        const vs = p['vs']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = 0.05 + (i / 200) * 4.95
          pts.push([f, vs / (4 * f)])
        }
        return [{ label: t('H = Vs / 4f', 'H = Vs / 4f'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('一个城市台站', 'An urban station'),
    input: t('Vs = 300 m/s，实测 H/V 峰值在 0.62 Hz', 'Vs = 300 m/s, observed H/V peak at 0.62 Hz'),
    steps: [
      t('H = 300 / (4 × 0.62)', 'H = 300 / (4 × 0.62)'),
      t('H = 300 / 2.48 = 121 m', 'H = 300 / 2.48 = 121 m'),
    ],
    output: t('沉积层厚度约 120 m，基阶共振周期约 1.6 s', 'Sediment thickness about 120 m, fundamental resonance period about 1.6 s'),
  },
  links: {
    upstream: [{ id: 'rayleigh-elliptical-polarization', note: t('椭圆率定义了 H/V 的形状', 'Ellipticity defines the shape of H/V') }],
    downstream: [
      { id: 'site-amplification-hv', note: t('H/V 谱比的工程应用', 'Engineering application of the H/V ratio') },
      { id: 'vs30-site-term', note: t('与 Vs30 场地项互补', 'Complementary to the Vs30 site term') },
    ],
    seealso: [{ id: 'peterson-noise-model', note: t('噪声水平决定能否测到峰', 'Noise level determines whether the peak is measurable') }],
  },
  refs: [{ text: 'Nakamura (1989), A method for dynamic characteristics estimation of subsurface using microtremor, QR of RTRI 30, 25–33' }],
}

export default rayleighHvEllipticity
