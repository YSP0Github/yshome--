import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-rc-transient */
const uemRcTransient: FormulaCard = {
  id: 'uem-rc-transient',
  name: t('RC 电路暂态（充放电）', 'RC Transients: Charging & Discharging'),
  aliases: { zh: ['RC 充放电', '时间常数 τ=RC'], en: ['RC transient', 'time constant RC'] },
  node: 'S19.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.TIME', 'Q.ELEC'],
    keywords: t('RC 充放电 时间常数 τ=RC e指数 暂态 半功率', 'RC charging discharging time constant tau RC exponential transient'),
  },
  audience: 'bachelor',
  complete: 'L4',
  statement: {
    main: String.raw`\tau=RC,\quad U_{C}(t)=\mathcal{E}\left(1-e^{-t/\tau}\right)\ (\text{充电}),\quad U_{C}(t)=U_{0}e^{-t/\tau}\ (\text{放电})`,
    variants: [
      { name: t('充电电流', 'Charging current'), latex: String.raw`I(t)=\dfrac{\mathcal{E}}{R}\,e^{-t/\tau}` },
    ],
  },
  meaning: t(
    '电容经电阻接电源时不会瞬间充满，而按指数渐近：时间常数 τ=RC 决定快慢。t=τ 时充电到 63%、放电剩 37%；约 5τ 后基本完成。这是延时电路、隔直与滤波的基础。',
    'A capacitor connected through a resistor to a source does not charge instantly but approaches its value exponentially: the time constant τ=RC sets the pace. At t=τ it reaches 63% (charge) or retains 37% (discharge); after ~5τ it is essentially complete. This underlies timers, DC blocking and filters.',
  ),
  symbols: [
    { sym: '\\tau', name: t('时间常数', 'time constant'), unit: 's' },
    { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
    { sym: 'C', name: t('电容', 'capacitance'), unit: 'F' },
    { sym: 'U_{C}', name: t('电容电压', 'capacitor voltage'), unit: 'V' },
    { sym: '\\mathcal{E}', name: t('电源电压', 'source voltage'), unit: 'V' },
  ],
  conditions: {
    applies: [t('R 与 C 串联、经直流电源或短路', 'R and C in series, driven by DC source or shorted')],
    assumes: [t('初始电容电压为零（充电）或给定 U0（放电）', 'Zero initial Uc (charge) or given U0 (discharge)')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('KVL 列方程', 'Write KVL'),
      latex: String.raw`\mathcal{E}=IR+U_{C},\qquad I=\dfrac{dQ}{dt}=C\dfrac{dU_{C}}{dt}` },
    { n: 2, op: 'setup', title: t('得到一阶微分方程', 'Obtain ODE'),
      latex: String.raw`RC\dfrac{dU_{C}}{dt}+U_{C}=\mathcal{E}` },
    { n: 3, op: 'algebra', title: t('分离变量积分', 'Separate and integrate'),
      latex: String.raw`\int_{0}^{U_{C}}\dfrac{dU_{C}}{\mathcal{E}-U_{C}}=\int_{0}^{t}\dfrac{dt}{RC}` },
    { n: 4, op: 'result', title: t('解得充电曲线', 'Solve for charging curve'),
      latex: String.raw`U_{C}(t)=\mathcal{E}\left(1-e^{-t/RC}\right)` },
  ],
  viz: [
    {
      id: 'rc-curves',
      level: 'V2',
      title: t('RC 充放电曲线', 'RC charge and discharge curves'),
      xlabel: t('时间 t (τ 单位)', 'time t (in units of τ)'),
      ylabel: t('电容电压 Uc / ε', 'capacitor voltage Uc / ε'),
      xRange: [0, 6],
      controls: [
        { id: 'tau', label: t('时间常数 τ=RC (ms)', 'time constant τ'), min: 1, max: 100, step: 1, value: 10, unit: 'ms' },
      ],
      compute: (p) => {
        void p['tau'] // shape in units of τ; τ only relabels physical time
        const charge: Array<[number, number]> = []
        const discharge: Array<[number, number]> = []
        for (let i = 0; i <= 240; i++) {
          const x = (i / 240) * 6
          charge.push([x, 1 - Math.exp(-x)])
          discharge.push([x, Math.exp(-x)])
        }
        return [
          { label: t('充电 1−e^(−t/τ)', 'charge 1−e^(−t/τ)'), color: '#185FA5', points: charge },
          { label: t('放电 e^(−t/τ)', 'discharge e^(−t/τ)'), color: '#BA7517', points: discharge, dash: true },
        ]
      },
      note: t('t=τ 处充电到 63%、放电剩 37%；约 5τ 趋近稳态。', 'At t=τ charge reaches 63% and discharge keeps 37%; ~5τ to steady state.'),
    },
  ],
  example: {
    title: t('算例：充满到 99% 需多久', 'Worked: time to reach 99% charge'),
    input: t('R=10 kΩ，C=100 μF，电源 ε=12 V', 'R=10 kΩ, C=100 μF, source ε=12 V'),
    steps: [
      t('τ=RC=10⁴×10⁻⁴=1.0 s', 'τ=RC=10⁴×10⁻⁴=1.0 s'),
      t('Uc/ε=1−e^(−t/τ)=0.99 → e^(−t/τ)=0.01', 'Uc/ε=1−e^(−t/τ)=0.99 → e^(−t/τ)=0.01'),
      t('t/τ=−ln0.01≈4.605，故 t≈4.6 s', 't/τ=−ln0.01≈4.605, so t≈4.6 s'),
    ],
    output: t('约 4.6 s 后电容电压达到 12×0.99≈11.9 V。', 'After ~4.6 s the capacitor reaches 12×0.99≈11.9 V.'),
  },
  links: {
    upstream: [{ id: 'uem-capacitor-energy' }, { id: 'uem-ohms-law' }],
    downstream: [{ id: 'uem-rl-transient', note: t('对偶的 RL 暂态', 'dual RL transient') }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §27' }],
}

export default uemRcTransient
