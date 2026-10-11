import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** arias-intensity */
const ariasIntensity: FormulaCard = {
  id: 'arias-intensity',
  name: t('Arias 强度与累积绝对速度', 'Arias Intensity & Cumulative Absolute Velocity'),
  aliases: { zh: ['Arias 强度', 'CAV', '地震动能量指标'], en: ['Arias intensity', 'CAV', 'ground-motion energy measures'] },
  node: 'S11.1',
  tags: {
    math: ['MATH.FOURIER'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.AMP'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`I_A = \frac{\pi}{2g}\int_0^{T_d} a^{2}(t)\,\mathrm{d}t,\qquad
\mathrm{CAV} = \int_0^{T_d}|a(t)|\,\mathrm{d}t`,
    variants: [
      { name: t('三分量合成', 'Combining three components'), latex: String.raw`I_A = \frac{\pi}{2g}\int\left(a_x^{2}+a_y^{2}+a_z^{2}\right)\mathrm{d}t` },
      { name: t('与均方根加速度的关系', 'Relation to the root-mean-square acceleration'), latex: String.raw`a_{\mathrm{rms}} = \sqrt{\frac{g I_A}{\dfrac{\pi}{2}T_d}}` },
      { name: t('显著持时（5–95% 能量）', 'Significant duration (5–95% of energy)'), latex: String.raw`D_{5-95} = t(I_A = 0.95 I_{A,\text{tot}}) - t(I_A = 0.05 I_{A,\text{tot}})` },
      { name: t('标准化 CAV（滤掉小振幅）', 'Standardised CAV (small amplitudes filtered out)'), latex: String.raw`\mathrm{CAV}_{\text{std}} = \sum_i H(|a_i| - 0.025g)\,|a_i|\,\Delta t` },
    ],
  },
  meaning: t(
    'PGA 只告诉地震动「最尖的那一下有多尖」，完全忽略它持续多久。Arias 强度把整个时程的加速度平方积分起来，因此同时编码了振幅、频谱和持时 —— 它与边坡失稳、液化、结构累积损伤的相关性远好于 PGA。CAV 则用绝对值的积分，对持时更敏感，是核电厂抗震评估中判断是否超出设计基准的常用指标。',
    'The PGA only says how sharp the sharpest spike is and completely ignores how long the motion lasts. Arias intensity integrates the squared acceleration over the whole record, thus encoding amplitude, frequency content and duration together — it correlates far better than PGA with slope failure, liquefaction and cumulative structural damage. CAV integrates the absolute value instead, is more sensitive to duration, and is a standard indicator in nuclear seismic assessment for deciding whether the design basis is exceeded.',
  ),
  symbols: [
    { sym: 'I_A', name: t('Arias 强度', 'Arias intensity'), unit: 'm/s' },
    { sym: '\\mathrm{CAV}', name: t('累积绝对速度', 'cumulative absolute velocity'), unit: 'm/s' },
    { sym: 'a(t)', name: t('加速度时程', 'acceleration time history'), unit: 'm/s²' },
    { sym: 'T_d', name: t('记录持时', 'record duration'), unit: 's' },
    { sym: 'D_{5-95}', name: t('显著持时', 'significant duration'), unit: 's' },
  ],
  conditions: {
    applies: [t('液化判别、滑坡触发评估、结构损伤累积、地震动记录筛选', 'Liquefaction triggering, landslide triggering, cumulative structural damage, record selection')],
    assumes: [t('加速度记录已正确基线校正与滤波', 'The acceleration record is properly baseline-corrected and filtered')],
    breaks: [t('基线漂移未校正时积分会严重失真', 'Uncorrected baseline drift badly distorts the integral')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('地震动的能量流密度正比于 a² 的时间积分', 'The energy flux density of shaking is proportional to the time integral of a²'), latex: String.raw`E \propto \int a^{2}(t)\,\mathrm{d}t` },
    { n: 2, op: 'identity', title: t('Arias 引入 π/(2g) 使量纲为速度', 'Arias introduced π/(2g) so the dimension is velocity'), latex: String.raw`I_A = \frac{\pi}{2g}\int_0^{T_d}a^{2}(t)\,\mathrm{d}t` },
    { n: 3, op: 'substitute', title: t('由 Parseval 定理可在频域计算', 'By Parseval it can be computed in the frequency domain'), latex: String.raw`\int a^{2}\,\mathrm{d}t = \int |A(f)|^{2}\,\mathrm{d}f` },
    { n: 4, op: 'algebra', title: t('归一化 Husid 图给出能量随时间累积的形状', 'The normalised Husid plot gives the energy accumulation shape'), latex: String.raw`H(t) = \frac{\int_0^t a^{2}\,\mathrm{d}\tau}{\int_0^{T_d}a^{2}\,\mathrm{d}\tau}` },
    { n: 5, op: 'result', title: t('由 Husid 图读出 5–95% 显著持时', 'Read the 5–95% significant duration off the Husid plot'), latex: String.raw`D_{5-95} = t_{0.95}-t_{0.05}` },
  ],
  viz: [
    {
      id: 'husid',
      level: 'V2',
      title: t('Husid 图与显著持时', 'Husid plot and significant duration'),
      xlabel: t('时间 (s)', 'time (s)'),
      ylabel: t('归一化累积 Arias 强度', 'normalised cumulative Arias intensity'),
      controls: [
        { id: 'rise', label: t('能量上升时间 (s)', 'energy rise time (s)'), min: 1, max: 20, step: 0.5, value: 5 },
        { id: 'dur', label: t('总持时 (s)', 'total duration (s)'), min: 10, max: 120, step: 1, value: 40 },
        { id: 'tail', label: t('尾部衰减时间 (s)', 'tail decay time (s)'), min: 2, max: 40, step: 0.5, value: 12 },
      ],
      note: t('Husid 图是单调递增的 S 形曲线。曲线最陡的一段就是能量集中释放的时段，5% 到 95% 之间的时间跨度定义为显著持时 —— 它比「总记录长度」更能反映真正的强震持续时间。', 'The Husid plot is a monotonically increasing S-shaped curve. Its steepest segment is when energy is released most intensely; the time span between 5% and 95% defines the significant duration — a better measure of the true duration of strong shaking than the total record length.'),
      compute: (p) => {
        const rise = p['rise'], dur = p['dur'], tail = p['tail']
        const N = 600
        const dt = dur / N
        const rate = (t: number) => {
          const up = 1 - Math.exp(-t / rise)
          const dn = Math.exp(-Math.max(0, t - dur * 0.35) / tail)
          return up * dn
        }
        const pts: Array<[number, number]> = []
        let acc = 0
        const tot: number[] = []
        for (let i = 0; i <= N; i++) {
          const t = i * dt
          acc += rate(t) * dt
          tot.push(acc)
        }
        for (let i = 0; i <= N; i++) pts.push([i * dt, tot[i] / Math.max(tot[N], 1e-12)])
        // 标注 5% 与 95%
        const findT = (frac: number) => {
          for (let i = 0; i <= N; i++) if (tot[i] / tot[N] >= frac) return i * dt
          return dur
        }
        const t05 = findT(0.05), t95 = findT(0.95)
        return [
          { label: t('Husid 图', 'Husid plot'), color: '#185FA5', points: pts },
          { label: t('5–95% 持时 ' + (t95 - t05).toFixed(1) + ' s', '5–95% duration ' + (t95 - t05).toFixed(1) + ' s'), color: '#993C1D', points: [[t05, 0.05], [t95, 0.95]] },
        ]
      },
    },
    {
      id: 'ia-scale',
      level: 'V1',
      title: t('Arias 强度与 PGA、持时的关系', 'Arias intensity versus PGA and duration'),
      xlabel: t('持时 T_d (s)', 'duration T_d (s)'),
      ylabel: t('I_A (m/s)', 'I_A (m/s)'),
      controls: [
        { id: 'pga', label: t('PGA (g)', 'PGA (g)'), min: 0.02, max: 1, step: 0.01, value: 0.3 },
        { id: 'rms', label: t('a_rms / PGA 比', 'a_rms / PGA ratio'), min: 0.1, max: 0.6, step: 0.01, value: 0.3 },
      ],
      note: t('I_A = (π/2g)·a_rms²·T_d，对持时是线性的、对 PGA 是平方的。所以持时翻倍只是翻倍，而 PGA 翻倍会让 I_A 变成四倍 —— 这解释了为什么短促但尖锐的小震往往破坏有限，而中等强度但长时间的震动会造成严重累积损伤。', 'I_A = (π/2g)·a_rms²·T_d is linear in duration and quadratic in PGA. Doubling the duration merely doubles it, but doubling the PGA quadruples it — which explains why short, sharp small events often cause limited damage while moderate but long-lasting shaking causes severe cumulative damage.'),
      compute: (p) => {
        const pga = p['pga'] * 9.81, r = p['rms']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const Td = 1 + (i / 200) * 99
          const arms = r * pga
          pts.push([Td, (Math.PI / (2 * 9.81)) * arms * arms * Td])
        }
        return [{ label: t('I_A', 'I_A'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('中等强度长持时地震', 'A moderate but long-duration earthquake'),
    input: t('PGA = 0.2 g，a_rms/PGA = 0.3，T_d = 50 s', 'PGA = 0.2 g, a_rms/PGA = 0.3, T_d = 50 s'),
    steps: [
      t('a_rms = 0.3 × 0.2 × 9.81 = 0.589 m/s²', 'a_rms = 0.3 × 0.2 × 9.81 = 0.589 m/s²'),
      t('I_A = (π/19.62) × 0.589² × 50 = 2.78 m/s', 'I_A = (π/19.62) × 0.589² × 50 = 2.78 m/s'),
    ],
    output: t('I_A ≈ 2.8 m/s，远超液化触发的经验阈值（约 0.1–0.5 m/s）', 'I_A ≈ 2.8 m/s, far above the empirical liquefaction-triggering threshold (about 0.1–0.5 m/s)'),
  },
  links: {
    upstream: [
      { id: 'ground-motion-parameters', note: t('PGA/PGV 是同族参数', 'PGA and PGV are in the same family') },
      { id: 'parseval-theorem', note: t('Parseval 允许频域计算', 'Parseval permits frequency-domain computation') },
    ],
    downstream: [{ id: 'gmpe-functional-form', note: t('新一代 GMPE 也预测 I_A 与 CAV', 'Newer GMPEs also predict I_A and CAV') }],
    seealso: [{ id: 'response-spectrum-oscillator', note: t('反应谱描述的是另一类破坏效应', 'Response spectra describe a different class of damaging effects') }],
  },
  refs: [{ text: 'Arias (1970), A measure of earthquake intensity, in Seismic Design for Nuclear Power Plants, MIT Press' }],
}

export default ariasIntensity
