import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** em-cagniard-apparent-resistivity */
const emCagniardApparentResistivity: FormulaCard = {
  id: 'em-cagniard-apparent-resistivity',
  name: t('Cagniard 大地电磁视电阻率', "Cagniard's Magnetotelluric Apparent Resistivity"),
  aliases: { zh: ['MT视电阻率', '卡尼亚视电阻率'], en: ['MT apparent resistivity', 'Cagniard resistivity'] },
  node: 'S16.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.COMPLEX'],
    method: ['METH.EM', 'METH.INV'],
    quantity: ['Q.ELEC', 'Q.FREQ'],
    keywords: t('Cagniard 视电阻率 MT 相位 |Z| 阻抗相位 大地电磁', 'Cagniard apparent resistivity MT phase impedance'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\rho_{a}=\frac{1}{\mu\,\omega}\left|Z\right|^{2}\;,\qquad \varphi_{MT}=\arg Z`,
    variants: [
      { name: t('一维半空间检验', 'Uniform half-space check'), latex: String.raw`Z=(1+i)\sqrt{\omega\mu\rho_{e}/2}\;\Rightarrow\;\rho_{a}=\rho_{e},\ \varphi_{MT}=45^\circ` },
    ],
  },
  meaning: t(
    '由 MT 阻抗模 |Z| 定义的视电阻率 ρa=|Z|²/(μω)，单位 Ω·m。在均匀半空间 ρa 就是真实 ρe、相位恒为 45°。地下分层时，ρa(f) 与相位 φ(f) 随频率变化：高频（浅）反映浅部，低频（深）反映深部。把 ρa–f 双对数曲线反演即可得到电阻率—深度剖面。',
    'The MT apparent resistivity ρa=|Z|²/(μω), in Ω·m, is built from the modulus of the MT impedance. In a uniform half-space ρa equals the true ρe and the phase is a constant 45°. With layering, ρa(f) and φ(f) vary with frequency: high f (shallow) images near surface, low f (deep) the basement. Inverting the ρa–f log-log curve yields a resistivity–depth section.',
  ),
  symbols: [
    { sym: '\\rho_{a}', name: t('MT 视电阻率', 'MT apparent resistivity'), unit: 'Ω·m' },
    { sym: 'Z', name: t('MT 复阻抗', 'complex MT impedance'), unit: 'Ω' },
    { sym: '\\mu', name: t('磁导率', 'permeability'), unit: 'H/m' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: '\\varphi_{MT}', name: t('阻抗相位', 'impedance phase'), unit: '度', typical: '0° – 90°' },
  ],
  conditions: {
    applies: [t('水平层状大地、平面波入射', 'Horizontally layered earth, plane-wave incidence')],
    assumes: [t('远场、无近场源效应', 'Far field, no near-source effects')],
    breaks: [t('三维结构、静位移使 ρa 整体平移', '3D structure and static shift displace ρa')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('均匀半空间阻抗', 'Impedance in a uniform half-space'),
      latex: String.raw`Z=\sqrt{\omega\mu\rho_{e}}\ e^{i\pi/4}` },
    { n: 2, op: 'algebra', title: t('模的平方', 'Square the modulus'),
      latex: String.raw`|Z|^{2}=\omega\mu\rho_{e}` },
    { n: 3, op: 'result', title: t('解出 ρa', 'Solve for ρa'),
      latex: String.raw`\rho_{a}=|Z|^{2}/(\mu\omega)` },
  ],
  viz: [
    {
      id: 'mt-cagniard',
      level: 'V1',
      title: t('二层地电模型的 MT 曲线', 'MT curves over a two-layer earth'),
      xlabel: t('周期 T (s)', 'period T (s)'),
      ylabel: t('视电阻率 ρa (Ω·m)', 'apparent resistivity ρa (Ω·m)'),
      xScale: 'log',
      yScale: 'log',
      controls: [
        { id: 'rho1', label: t('ρ1 表层', 'ρ1 near surface'), min: 1, max: 1000, step: 1, value: 30 },
        { id: 'rho2', label: t('ρ2 基底', 'ρ2 basement'), min: 1, max: 10000, step: 1, value: 300 },
        { id: 'h1', label: t('h1 表层厚度', 'h1 thickness'), min: 10, max: 500, step: 10, value: 100, unit: 'm' },
      ],
      compute: (p) => {
        const rho1 = p['rho1'], rho2 = p['rho2'], h1 = p['h1']
        const mu = 4 * Math.PI * 1e-7
        // complex helpers [re, im]
        const cmul = (a: number[], b: number[]): number[] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
        const cdiv = (a: number[], b: number[]): number[] => {
          const d = b[0] * b[0] + b[1] * b[1]
          return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
        }
        const ctanh = (z: number[]): number[] => {
          const x = 2 * z[0], y = 2 * z[1]
          const d = Math.cosh(x) + Math.cos(y)
          return [Math.sinh(x) / d, Math.sin(y) / d]
        }
        const pts: Array<[number, number]> = []
        for (let idx = 0; idx <= 200; idx++) {
          const T = Math.pow(10, -2 + (idx / 200) * 4) // 0.01 .. 100 s
          const w = 2 * Math.PI / T
          const a1 = Math.sqrt((w * mu) / (2 * rho1))
          const a2 = Math.sqrt((w * mu) / (2 * rho2))
          const k1c: number[] = [a1, a1]
          const Z1c = cdiv([0, w * mu], k1c)
          const Z2c = cdiv([0, w * mu], [a2, a2])
          const k1h = cmul(k1c, [h1, 0])
          const th = ctanh(k1h)
          const num: number[] = [Z2c[0] + cmul(Z1c, th)[0], Z2c[1] + cmul(Z1c, th)[1]]
          const den: number[] = [Z1c[0] + cmul(Z2c, th)[0], Z1c[1] + cmul(Z2c, th)[1]]
          const Zin = cmul(Z1c, cdiv(num, den))
          const rhoa = (Zin[0] * Zin[0] + Zin[1] * Zin[1]) / (w * mu)
          pts.push([T, rhoa])
        }
        return [{ label: t('ρa(T)', 'ρa(T)'), color: '#185FA5', points: pts }]
      },
      note: t('短周期读表层 ρ1，长周期过渡到基底 ρ2；过渡段周期约对应趋肤深度≈h1。', 'Short period reads ρ1, long period tends to ρ2; the transition period corresponds to skin depth ≈ h1.'),
    },
  ],
  links: {
    upstream: [{ id: 'em-mt-impedance' }, { id: 'em-skin-depth' }],
    downstream: [{ id: 'em-mt-depth-penetration' }],
  },
  refs: [{ text: 'Cagniard (1953), Geophysics, 18' }],
}

export default emCagniardApparentResistivity
