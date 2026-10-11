import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** parseval-theorem */
const parsevalTheorem: FormulaCard = {
  id: 'parseval-theorem',
  name: t('Parseval 定理（能量守恒）', 'Parseval Theorem: Conservation of Energy'),
  aliases: { zh: ['帕塞瓦尔定理', '能量守恒定理', 'Parseval 恒等式'], en: ['Parseval theorem', 'Parseval identity', 'energy conservation', 'Plancherel'] },
  node: 'S0.2',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.PROC'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: t('Parseval 能量守恒 时域积分 频域积分 振幅谱平方 能量谱密度', 'Parseval energy conservation time integral frequency integral squared amplitude spectral energy density'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\int_{-\infty}^{\infty}|f(t)|^{2}\,\dd t=\frac{1}{2\pi}\int_{-\infty}^{\infty}|F(\omega)|^{2}\,\dd\omega`,
    variants: [
      { name: t('更一般的内积形式', 'The more general inner-product form'), latex: String.raw`\int f(t)\,g^{*}(t)\,\dd t=\frac{1}{2\pi}\int F(\omega)\,G^{*}(\omega)\,\dd\omega` },
      { name: t('用普通频率 f 写出（无 2π 因子）', 'In ordinary frequency f, with no 2π factor'), latex: String.raw`\int |f(t)|^{2}\,\dd t=\int |\tilde{f}(f)|^{2}\,\dd f` },
      { name: t('离散形式', 'The discrete form'), latex: String.raw`\sum_{m=0}^{N-1}|x_m|^{2}=\frac{1}{N}\sum_{n=0}^{N-1}|X_n|^{2}` },
      { name: t('单边能量谱密度', 'One-sided energy spectral density'), latex: String.raw`E=\int_0^{\infty}2\,|F(\omega)|^{2}\,\frac{\dd\omega}{2\pi}\quad(f(t)\ \text{为实信号})` },
    ],
  },
  meaning: t(
    'Parseval 定理保证 Fourier 变换是「保能量的」：在时间域把波形平方积分得到的总能量，等于在频率域把振幅谱平方积分（再除 2π）得到的结果。于是我们可以放心地在频率域讨论能量分布 —— 地震能量按频段的分配、Q 引起的谱衰减、信噪比的分频带统计，全都依赖这条恒等式才站得住。',
    'Parseval theorem guarantees that the Fourier transform conserves energy: the total energy obtained by integrating the squared waveform in time equals the integral of the squared amplitude spectrum, divided by 2π. We can therefore discuss the distribution of energy in the frequency domain with confidence — the partition of seismic energy among frequency bands, spectral decay caused by Q, and band-by-band signal-to-noise statistics all lean on this identity.',
  ),
  symbols: [
    { sym: 'E', name: t('信号总能量', 'total energy of the signal'), unit: '原物理量² · s' },
    { sym: '|f(t)|^{2}', name: t('瞬时功率（或能量密度）', 'instantaneous power, or energy density'), unit: '原物理量²' },
    { sym: '|F(\\omega)|^{2}', name: t('能量谱密度（差一个 2π 因子）', 'energy spectral density, up to the 2π factor'), unit: '原物理量² · s²' },
    { sym: 'x_m, X_n', name: t('离散序列与其 DFT', 'the discrete sequence and its DFT'), unit: '同前' },
    { sym: 'g^{*}, G^{*}', name: t('复共轭', 'complex conjugate'), unit: '同前' },
  ],
  conditions: {
    applies: [
      t('平方可积信号（有限能量）：一切实际地震记录', 'Square-integrable signals, that is, finite energy: every real seismic record'),
      t('周期信号改用功率形式（对周期取平均）', 'For periodic signals switch to the power form, averaged over one period'),
    ],
    assumes: [
      t('采用本卡片的归一化约定：2π 全在反变换一侧', 'The normalisation convention of this card, with the whole 2π on the inverse side'),
      t('积分区间覆盖全部非零能量', 'The integration interval covers all non-zero energy'),
    ],
    breaks: [
      t('无限能量信号（如理想白噪、常数）不直接适用，需改用功率谱密度', 'Signals of infinite energy such as ideal white noise or a constant do not qualify directly; use the power spectral density instead'),
      t('加窗后必须把窗的能量归一化一并计入，否则能量会系统性偏小', 'After windowing, the window energy normalisation must be included, otherwise the energy is systematically underestimated'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('把 |f|² 写成一个函数与其共轭的乘积', 'Write |f|² as a function times its conjugate'),
      latex: String.raw`\int |f(t)|^{2}\,\dd t=\int f(t)\,f^{*}(t)\,\dd t`,
    },
    {
      n: 2,
      op: 'transform',
      title: t('把其中一个 f 用反变换表示', 'Express one of the two factors by the inverse transform'),
      latex: String.raw`\int |f(t)|^{2}\dd t=\int\left[\frac{1}{2\pi}\int F(\omega)e^{i\omega t}\dd\omega\right]f^{*}(t)\dd t`,
    },
    {
      n: 3,
      op: 'algebra',
      title: t('交换积分次序', 'Swap the order of integration'),
      latex: String.raw`=\frac{1}{2\pi}\int F(\omega)\left[\int f^{*}(t)e^{i\omega t}\dd t\right]\dd\omega`,
    },
    {
      n: 4,
      op: 'identity',
      title: t('认出中括号正是 F(ω) 的共轭', 'Recognise that the bracket is the conjugate of F(ω)'),
      latex: String.raw`\int f^{*}(t)e^{i\omega t}\dd t=\left[\int f(t)e^{-i\omega t}\dd t\right]^{*}=F^{*}(\omega)`,
      note: t('共轭把指数的符号翻过来，正好凑出正变换的定义。', 'Conjugation flips the sign of the exponent, producing exactly the definition of the forward transform.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('得到能量恒等式，并推广到内积', 'The energy identity, and its extension to inner products'),
      latex: String.raw`\int |f(t)|^{2}\dd t=\frac{1}{2\pi}\int |F(\omega)|^{2}\dd\omega,\qquad \int f g^{*}\dd t=\frac{1}{2\pi}\int F G^{*}\dd\omega`,
      note: t('这说明 Fourier 变换在 L² 上是酉变换（差一个 2π 尺度），即它保长度、保角度。', 'The Fourier transform is therefore unitary on L² up to the 2π scaling: it preserves lengths and angles.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('离散版本：差一个 1/N', 'The discrete version, differing by a factor 1/N'),
      latex: String.raw`\sum_{m=0}^{N-1}|x_m|^{2}=\frac{1}{N}\sum_{n=0}^{N-1}|X_n|^{2}`,
      note: t('做谱能量统计时，若忘了这个 1/N，能量会被高估 N 倍。', 'Forgetting this 1/N overestimates the energy by a factor of N when doing spectral energy bookkeeping.'),
    },
  ],
  example: {
    title: t('分频带统计地震能量', 'Partitioning seismic energy by frequency band'),
    input: t('一条 60 s 记录，其速度谱在 0.1 – 1 Hz 内的平方积分为 3.2×10⁻⁴ (m/s)²·s', 'A 60 s record whose squared velocity spectrum integrates to 3.2×10⁻⁴ (m/s)²·s over 0.1 – 1 Hz'),
    steps: [
      t('E_band = (1/2π) × 3.2×10⁻⁴ = 5.1×10⁻⁵ (m/s)²·s', 'E_band = (1/2π) × 3.2×10⁻⁴ = 5.1×10⁻⁵ (m/s)²·s'),
      t('同时在时间域直接积分 v²(t) dt 应得到同一个数，可作为计算正确性的自检', 'Integrating v²(t) dt directly in time should give the same number and serves as a self-check'),
    ],
    output: t('两种算法若不一致，通常是归一化因子或加窗补偿出了问题', 'If the two routes disagree, the cause is almost always a normalisation factor or missing window compensation'),
  },
  links: {
    upstream: [{ id: 'fourier-transform-pair', note: t('同一变换约定的守恒律', 'the conservation law for the same transform convention') }],
    downstream: [
      { id: 'discrete-fourier-transform', note: t('离散形式用于实际统计', 'the discrete form is what is actually computed') },
      { id: 'quality-factor-q', note: t('谱衰减与能量损失直接相关', 'spectral decay is directly tied to energy loss') },
    ],
    seealso: [{ id: 'brune-source-spectrum' }],
  },
  refs: [
    { text: 'Bracewell, The Fourier Transform and Its Applications, 3rd ed., §4' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.4' },
  ],
}

export default parsevalTheorem
