import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ground-motion-parameters */
const groundMotionParameters: FormulaCard = {
  id: 'ground-motion-parameters',
  name: t('地震动参数', 'Ground-motion Parameters'),
  aliases: { zh: ['PGA', 'PGV', 'Arias 强度'], en: ['PGA', 'PGV', 'PGD', 'Arias intensity', 'spectral acceleration'] },
  node: 'S11.1',
  tags: {
    math: ['MATH.STAT', 'MATH.GEOM'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\mathrm{PGA}=\max_t\left|a(t)\right|,\qquad \mathrm{PGV}=\max_t\left|v(t)\right|,\qquad \mathrm{PGD}=\max_t\left|d(t)\right|`,
    variants: [
      { name: t('Arias 强度', 'Arias intensity'), latex: String.raw`I_A=\frac{\pi}{2g}\int_0^{T_d}a^{2}(t)\,\mathrm{d}t` },
      { name: t('反应谱（阻尼单自由度振子）', 'Response spectrum (damped SDOF oscillator)'), latex: String.raw`\ddot{x}+2\zeta\omega_n\dot{x}+\omega_n^{2}x=-a(t),\qquad S_a(\omega_n,\zeta)=\max_t\left|\ddot{x}+\ddot{x}_g\right|` },
      { name: t('有效持续时间', 'Significant duration'), latex: String.raw`D_{5-95}=t_{95}-t_5,\qquad \int_0^{t_{p}}I_A(t)\,\mathrm{d}t=p\%\,I_A^{\text{总}}` },
    ],
  },
  meaning: t(
    '一次地震产生的地震动是一条复杂的加速度时程，工程上需要几个「一个数说完」的指标。PGA 与高频短结构相关，PGV 与中频结构相关，PGD 与长周期大跨度结构相关；Arias 强度把整条时程的能量积分起来，与液化、滑坡的相关性最好。选择哪个指标，取决于你要评估的结构自振周期。',
    'Ground motion from an earthquake is a complex acceleration time history, and engineering needs a few single-number descriptors. PGA matters for high-frequency short structures, PGV for mid-frequency ones and PGD for long-period, long-span structures; the Arias intensity integrates energy over the whole record and correlates best with liquefaction and landsliding. Which parameter you choose depends on the natural period of the structure being assessed.',
  ),
  symbols: [
    { sym: '\\mathrm{PGA}', name: t('峰值地面加速度', 'peak ground acceleration'), unit: 'm/s² 或 g', typical: '0.01 – 1 g' },
    { sym: '\\mathrm{PGV}', name: t('峰值地面速度', 'peak ground velocity'), unit: 'm/s', typical: '0.001 – 1' },
    { sym: '\\mathrm{PGD}', name: t('峰值地面位移', 'peak ground displacement'), unit: 'm' },
    { sym: 'I_A', name: t('Arias 强度', 'Arias intensity'), unit: 'm/s' },
    { sym: 'S_a', name: t('谱加速度', 'spectral acceleration'), unit: 'm/s²' },
    { sym: '\\zeta', name: t('阻尼比', 'damping ratio'), unit: '无量纲', typical: '0.05' },
  ],
  conditions: {
    applies: [t('强震记录的工程描述与抗震设计输入', 'Engineering description of strong-motion records and seismic design input')],
    assumes: [t('记录已完成基线校正与滤波', 'The record has been baseline-corrected and filtered')],
    breaks: [t('未做基线校正时积分出的 PGV/PGD 会严重失真', 'Without baseline correction the integrated PGV/PGD is severely distorted')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从加速度时程出发', 'Start from the acceleration time history'),
      latex: String.raw`a(t)` },
    { n: 2, op: 'identity', title: t('积分得到速度', 'Integrate to obtain velocity'),
      latex: String.raw`v(t)=\int_0^{t}a(\tau)\,\mathrm{d}\tau` },
    { n: 3, op: 'identity', title: t('再积分得到位移', 'Integrate again to obtain displacement'),
      latex: String.raw`d(t)=\int_0^{t}v(\tau)\,\mathrm{d}\tau` },
    { n: 4, op: 'result', title: t('各取绝对值最大', 'Take the maximum absolute value of each'),
      latex: String.raw`\mathrm{PGA}=\max|a|,\quad \mathrm{PGV}=\max|v|,\quad \mathrm{PGD}=\max|d|` },
  ],
  viz: [
    {
      id: 'sdof-response',
      level: 'V1',
      title: t('不同自振周期结构对同一地震动的响应', 'Response of structures with different natural periods to the same shaking'),
      xlabel: t('自振周期 T (s)', 'natural period T (s)'),
      ylabel: t('谱加速度 S_a (g)', 'spectral acceleration S_a (g)'),
      xScale: 'log',
      controls: [
        { id: 'pga', label: t('PGA', 'PGA'), min: 0.05, max: 1.0, step: 0.05, value: 0.3, unit: 'g' },
        { id: 'Tp', label: t('场地特征周期', 'site characteristic period'), min: 0.1, max: 2.0, step: 0.05, value: 0.5, unit: 's' },
      ],
      compute: (p) => {
        const pga = p['pga'], Tp = p['Tp']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const T = 0.05 * Math.pow(10, (i / 300) * 2)
          const r = T / Tp
          // 简化的设计谱形状：上升段 - 平台段 - 下降段
          let sa
          if (T <= 0.1) sa = pga * (1 + 1.5 * (T / 0.1))
          else if (r <= 1) sa = 2.5 * pga
          else sa = 2.5 * pga * (1 / r)
          pts.push([T, sa])
        }
        return [{ label: t('S_a(T)', 'S_a(T)'), color: '#185FA5', points: pts }]
      },
      note: t('平台段的高度就是抗震设计里的关键参数；把场地周期调大，长周期结构的响应随之增大。', 'The height of the plateau is the key design parameter; increasing the site period amplifies the response of long-period structures.'),
    },
  ],
  links: {
    seealso: [
      { id: 'site-amplification-hv', note: t('场地共振决定谱形状', 'Site resonance shapes the spectrum') },
      { id: 'seismic-intensity', note: t('烈度是宏观的对应量', 'Intensity is the macroscopic counterpart') },
    ],
  },
  refs: [{ text: 'Boore, in International Handbook of Earthquake & Engineering Seismology' }],
}

export default groundMotionParameters
