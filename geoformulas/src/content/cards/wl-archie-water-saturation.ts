import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-archie-water-saturation */
const wlArchieWaterSaturation: FormulaCard = {
  id: 'wl-archie-water-saturation',
  name: t('测井综合算例：Archie 求 Sw 判别油水层', 'Worked Example: Archie Sw & Pay Discrimination'),
  aliases: { zh: ['测井解释算例', '油水层判别'], en: ['log interpretation worked example', 'pay vs water'] },
  node: 'S17.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG', 'METH.ROCK'],
    quantity: ['Q.POR', 'Q.ELEC'],
    keywords: t('测井算例 Archie Sw 油水层判别 孔隙度 电阻率 Rw', 'worked example Archie Sw pay water discrimination porosity resistivity Rw'),
  },
  audience: 'bachelor',
  complete: 'L4',
  statement: {
    main: String.raw`S_{w}=\left(\frac{a\,R_{w}}{\phi_{e}^{m}\,R_{t}}\right)^{1/n}`,    variants: [
      { name: t('判别标准', 'Pay cut-off'), latex: String.raw`S_{w}<0.4\Rightarrow\text{油气层}\;;\quad S_{w}\approx 1\Rightarrow\text{水层}` },
    ],
  },
  meaning: t(
    '这是测井解释的"最后一公里"：由孔隙度曲线得 φe，由 SP 得 Rw，由深电阻率测井得 Rt，取 a、m、n 经验值，代入 Archie 算出 Sw。Sw 小（<30–40%）为油气层，Sw≈1 为水层。一条井逐深度算出 Sw 曲线，就得到含油（气）剖面。',
    'This is the "last mile" of log interpretation: get φe from porosity logs, Rw from SP, Rt from deep resistivity, plug in empirical a, m, n, and compute Sw. Small Sw (<30–40%) is pay, Sw≈1 is water. Computing Sw depth-by-depth gives the hydrocarbon profile.',
  ),
  symbols: [
    { sym: 'S_{w}', name: t('含水饱和度', 'water saturation'), unit: 'v/v' },
    { sym: '\\phi_{e}', name: t('有效孔隙度', 'effective porosity'), unit: 'v/v' },
    { sym: 'R_{w}', name: t('地层水电阻率', 'formation-water resistivity'), unit: 'Ω·m' },
    { sym: 'R_{t}', name: t('原状地层电阻率', 'true formation resistivity'), unit: 'Ω·m' },
  ],
  conditions: {
    applies: [t('干净砂岩、 Archie 适用', 'Clean sandstone where Archie applies')],
    breaks: [t('含泥质需 Simandoux 等修正', 'Shaly beds need Simandoux-type correction')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('输入参数', 'Inputs'),
      latex: String.raw`\phi_{e}=0.20,\ R_{w}=0.05\ \Omega\cdot\mathrm{m},\ R_{t}=20\ \Omega\cdot\mathrm{m},\ a=1,\ m=2,\ n=2` },
    { n: 2, op: 'substitute', title: t('代入 Archie', 'Substitute'),
      latex: String.raw`S_{w}=\left(\dfrac{1\times 0.05}{0.20^{2}\times 20}\right)^{1/2}=\left(\dfrac{0.05}{0.8}\right)^{1/2}` },
    { n: 3, op: 'algebra', title: t('算出结果', 'Compute'),
      latex: String.raw`S_{w}=\sqrt{0.0625}=0.25` },
    { n: 4, op: 'result', title: t('判别', 'Discriminate'),
      latex: String.raw`S_{w}=0.25<0.4\Rightarrow\text{油气层}` },
  ],
  example: {
    title: t('一口砂岩井', 'A sandstone interval'),
    input: t('φe=0.20，Rw=0.05 Ω·m，Rt=20 Ω·m，a=1，m=2，n=2', 'φe=0.20, Rw=0.05 Ω·m, Rt=20 Ω·m, a=1, m=2, n=2'),
    steps: [
      t('分母 φe^m·Rt = 0.20²×20 = 0.80', 'Denominator φe^m·Rt = 0.20²×20 = 0.80'),
      t('a·Rw/(φe^m·Rt) = 0.05/0.80 = 0.0625', 'a·Rw/(φe^m·Rt) = 0.05/0.80 = 0.0625'),
      t('Sw = 0.0625^(1/2) = 0.25', 'Sw = 0.0625^(1/2) = 0.25'),
    ],
    output: t('Sw=0.25 < 0.4 → 含油气层；若 Rt 降到约 1.25 Ω·m，则 Sw≈1 → 水层', 'Sw=0.25 < 0.4 → hydrocarbon pay; if Rt drops to ~1.25 Ω·m, Sw≈1 → water leg'),
  },
  links: {
    upstream: [{ id: 'dc-water-saturation-archie' }, { id: 'wl-average-porosity-combination' }, { id: 'wl-formation-water-resistivity' }],
    downstream: [{ id: 'wl-integrated-interpretation' }],
  },
  refs: [{ text: 'Archie (1942); 流程见 Bassiouni (1994), Well Logging' }],
}

export default wlArchieWaterSaturation
