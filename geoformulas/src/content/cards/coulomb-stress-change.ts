import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** coulomb-stress-change */
const coulombStressChange: FormulaCard = {
  id: 'coulomb-stress-change',
  name: t('库仑破裂应力变化', 'Coulomb Failure Stress Change'),
  aliases: { zh: ['ΔCFS', '库仑应力', '应力触发'], en: ['Coulomb failure stress', 'ΔCFS', 'stress triggering'] },
  node: 'S4.4',
  tags: {
    math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.TELE', 'METH.STAT'],
    quantity: ['Q.SOURCE', 'Q.TENSOR'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\Delta\mathrm{CFS}=\Delta\tau+\mu'\left(\Delta\sigma_n+\Delta p\right)`,
    variants: [
      { name: t('有效摩擦系数', 'Effective friction coefficient'), latex: String.raw`\mu'=\mu\left(1-B\right),\qquad B=\text{Skempton 系数}` },
      { name: t('只考虑剪应力与正应力', 'Shear and normal stress only'), latex: String.raw`\Delta\mathrm{CFS}=\Delta\tau+\mu'\Delta\sigma_n` },
      { name: t('阈值判据', 'Threshold criterion'), latex: String.raw`\Delta\mathrm{CFS}\gtrsim0.01\text{–}0.1\ \text{MPa 时触发效应显著}` },
    ],
  },
  meaning: t(
    '一次地震会改变周围断层面上的应力状态：让某些断层更容易破裂（ΔCFS > 0，被"加载"），让另一些更安全（ΔCFS < 0，被"卸载"）。这个量只有 0.01–0.1 MPa 的量级 —— 比地震应力降小三四个数量级 —— 却与余震分布、地震迁移有明显相关性。这是目前唯一有一定预报能力的中短期指标。',
    'An earthquake changes the stress state on surrounding faults: some become more likely to fail (ΔCFS > 0, loaded) and others safer (ΔCFS < 0, unloaded). The effect is only 0.01–0.1 MPa, three to four orders of magnitude smaller than the earthquake stress drop, yet it correlates clearly with aftershock distribution and earthquake migration. It is the only intermediate-term indicator with any demonstrable forecasting skill.',
  ),
  symbols: [
    { sym: '\\Delta\\mathrm{CFS}', name: t('库仑破裂应力变化', 'Coulomb failure stress change'), unit: 'Pa', typical: '10³ – 10⁶' },
    { sym: '\\Delta\\tau', name: t('接收断层面滑移方向上的剪应力变化', 'shear stress change in the slip direction of the receiver fault'), unit: 'Pa' },
    { sym: '\\Delta\\sigma_n', name: t('正应力变化（拉张为正）', 'normal stress change (extension positive)'), unit: 'Pa' },
    { sym: '\\mu\'', name: t('有效摩擦系数', 'effective friction coefficient'), unit: '无量纲', typical: '0.2 – 0.8' },
    { sym: '\\Delta p', name: t('孔隙压力变化', 'pore-pressure change'), unit: 'Pa' },
  ],
  conditions: {
    applies: [t('计算一次地震（或流体注入）对邻近断层/余震的影响', 'Computing the effect of an earthquake or fluid injection on nearby faults and aftershocks')],
    assumes: [
      t('接收断层的几何与区域应力方向已知', 'The receiver-fault geometry and regional stress direction are known'),
      t('弹性半空间位错解可用（Okada 解）', 'The elastic half-space dislocation solution (Okada) is applicable'),
    ],
    breaks: [t('ΔCFS 对接收断层取向极其敏感，区域应力方向不确定时结果几乎无意义', 'ΔCFS is extremely sensitive to receiver-fault orientation; with an uncertain regional stress direction the result is nearly meaningless')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('库仑破裂准则', 'The Coulomb failure criterion'),
      latex: String.raw`\tau\ge\mu\left(\sigma_n-p\right)+C` },
    { n: 2, op: 'setup', title: t('定义失效函数', 'Define a failure function'),
      latex: String.raw`\mathrm{CFS}=\tau-\mu\left(\sigma_n-p\right)-C` },
    { n: 3, op: 'taylor', title: t('取变化量', 'Take the change'),
      latex: String.raw`\Delta\mathrm{CFS}=\Delta\tau-\mu\left(\Delta\sigma_n-\Delta p\right)` },
    { n: 4, op: 'substitute', title: t('按地震学习惯取压缩为正，符号调整', 'Adjust signs to the seismological convention with compression positive'),
      latex: String.raw`\Delta\mathrm{CFS}=\Delta\tau+\mu'\left(\Delta\sigma_n+\Delta p\right),\qquad \mu'=\mu(1-B)` },
  ],
  viz: [
    {
      id: 'dcfs-lobes',
      level: 'V1',
      title: t('走滑地震周围 ΔCFS 的四象限花瓣', 'Four-quadrant ΔCFS lobes around a strike-slip event'),
      xlabel: t('方位角 (°)', 'azimuth (°)'),
      ylabel: t('ΔCFS (相对值)', 'ΔCFS (relative)'),
      controls: [
        { id: 'mu', label: t('有效摩擦系数 μ′', 'effective friction μ′'), min: 0, max: 0.8, step: 0.05, value: 0.4 },
      ],
      compute: (p) => {
        const mu = p['mu']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 360; i++) {
          const a = (i / 360) * 360
          const r = (a * Math.PI) / 180
          // 简化：剪应力 lobes ∝ cos2ψ，正应力项 ∝ sin2ψ
          pts.push([a, Math.cos(2 * r) + mu * Math.sin(2 * r)])
        }
        return [{ label: t('ΔCFS', 'ΔCFS'), color: '#185FA5', points: pts }]
      },
      note: t('μ′ = 0 时是纯四象限；μ′ 增大时花瓣被"扭"得更不对称 —— 这也是为什么 μ′ 的取值会改变余震触发区的判定。', 'At μ′ = 0 the pattern is a clean four-lobed rose; increasing μ′ skews the lobes, which is why the assumed μ′ changes which areas are judged to be triggered.'),
    },
  ],
  example: {
    title: t('1992 年 Landers 地震对 Big Bear 的触发', 'Triggering of Big Bear by the 1992 Landers earthquake'),
    input: t('Δτ = +0.05 MPa，Δσ_n = −0.02 MPa（拉张），μ′ = 0.4', 'Δτ = +0.05 MPa, Δσ_n = −0.02 MPa (unclamping), μ′ = 0.4'),
    steps: [t('ΔCFS = 0.05 + 0.4(−0.02) = 0.042 MPa', 'ΔCFS = 0.05 + 0.4(−0.02) = 0.042 MPa')],
    output: t('超过 0.01 MPa 的常用阈值 —— Big Bear 地震在 Landers 之后数小时发生，被普遍视为触发实例', 'Exceeds the common 0.01 MPa threshold — the Big Bear event occurred hours after Landers and is widely regarded as a triggered case'),
  },
  links: {
    upstream: [{ id: 'moment-tensor-definition', note: t('源位错模型给出应力场', 'The source dislocation model gives the stress field') }],
    seealso: [{ id: 'etas-model', note: t('触发的统计表述', 'The statistical formulation of triggering') }],
  },
  refs: [{ text: 'Stein (1999), Nature, 402' }, { text: 'King et al. (1994), Bull. Seismol. Soc. Am., 84' }],
}

export default coulombStressChange
