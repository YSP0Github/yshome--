import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** stacking-response */
const stackingResponse: FormulaCard = {
  id: 'stacking-response',
  name: t('叠加响应与剩余时差滤波', 'Stacking Response & Residual-moveout Filtering'),
  aliases: { zh: ['叠加响应', '剩余时差', '叠加滤波'], en: ['stacking response', 'residual moveout', 'stack filter'] },
  node: 'S3.4',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.EXPL', 'METH.PROC'],
    quantity: ['Q.AMP', 'Q.FREQ'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{A_{out}}{A_{in}} = \left|\frac{1}{N}\sum_{j=1}^{N} e^{i\omega\,\delta t_{j}}\right|`,
    variants: [
      { name: t('无剩余时差时', 'With no residual moveout'), latex: String.raw`\delta t_j = 0 \Longrightarrow \frac{A_{out}}{A_{in}} = 1` },
      { name: t('随机噪声的压制', 'Suppression of random noise'), latex: String.raw`\frac{S}{N}\bigg|_{out} = \sqrt{N}\,\frac{S}{N}\bigg|_{in}` },
      { name: t('时差线性分布时的闭式', 'Closed form for a linear moveout distribution'), latex: String.raw`\delta t_j = \frac{j}{N}\delta t_{\max} \Longrightarrow \frac{A_{out}}{A_{in}} = \left|\frac{\sin(\omega\delta t_{\max}/2)}{N\sin(\omega\delta t_{\max}/2N)}\right|` },
    ],
  },
  meaning: t(
    '叠加不只对随机噪声有效，它本身还是一个滤波器：只要道集里存在剩余时差（速度不准、静校正残差），高频成分就会被叠加过程压掉。所以叠加剖面看起来总是「比单道更低频」。这个滤波视角把叠加质量和速度精度直接连了起来。',
    'Stacking does more than suppress random noise: it is itself a filter. Any residual moveout (velocity error, residual statics) causes the stack to attenuate high frequencies, which is why stacked sections always look lower-frequency than single traces. This filtering view ties stack quality directly to velocity accuracy.',
  ),
  symbols: [
    { sym: 'A_{out}/A_{in}', name: t('叠加前后的振幅比', 'amplitude ratio before and after stacking'), unit: '无量纲' },
    { sym: '\\delta t_{j}', name: t('第 j 道的剩余时差', 'residual moveout of trace j'), unit: 's' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'N', name: t('覆盖次数', 'fold'), unit: '道' },
    { sym: '\\delta t_{\\max}', name: t('最大剩余时差', 'maximum residual moveout'), unit: 's' },
  ],
  conditions: {
    applies: [t('评估速度误差与静校正残差对叠加质量的影响', 'Assessing how velocity error and residual statics affect stack quality')],
    assumes: [
      t('道集内振幅一致、噪声随机', 'Consistent amplitudes and random noise'),
      t('剩余时差远小于子波长度时影响可忽略', 'Residual moveout far smaller than the wavelet length is negligible'),
    ],
    breaks: [
      t('剩余时差超过半个周期时同相轴会被完全破坏', 'Residual moveout beyond half a period destroys the event entirely'),
      t('相干噪声（多次波）不能用 √N 公式估计', 'Coherent noise (multiples) cannot be estimated with the √N formula'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把叠加写成求和', 'Write stacking as a summation'),
      latex: String.raw`A_{out} = \frac{1}{N}\sum_{j=1}^{N}A_{in}e^{i\omega\delta t_j}` },
    { n: 2, op: 'algebra', title: t('取模得到响应', 'Take the modulus to get the response'),
      latex: String.raw`\frac{A_{out}}{A_{in}} = \left|\frac{1}{N}\sum_j e^{i\omega\delta t_j}\right|` },
    { n: 3, op: 'identity', title: t('时差线性分布时用等比级数求和', 'For a linear distribution use the geometric series'),
      latex: String.raw`\sum_{j=0}^{N-1}e^{ij\theta} = e^{i(N-1)\theta/2}\frac{\sin(N\theta/2)}{\sin(\theta/2)}` },
    { n: 4, op: 'substitute', title: t('代入 θ = ω δt_max / N', 'Substitute θ = ω δt_max / N'),
      latex: String.raw`\frac{A_{out}}{A_{in}} = \frac{\sin(\omega\delta t_{\max}/2)}{N\sin(\omega\delta t_{\max}/2N)}` },
    { n: 5, op: 'result', title: t('第一个零点给出可叠加的时差上限', 'The first zero gives the stackable moveout limit'),
      latex: String.raw`\omega\delta t_{\max}/2 = \pi \Longrightarrow \delta t_{\max} = \frac{1}{f}` },
  ],
  viz: [
    {
      id: 'stack-filter',
      level: 'V1',
      title: t('剩余时差造成的叠加高频衰减', 'High-frequency attenuation from residual moveout'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('振幅比 A_out/A_in', 'amplitude ratio A_out/A_in'),
      controls: [
        { id: 'dtmax', label: t('最大剩余时差 (ms)', 'maximum residual moveout (ms)'), min: 0, max: 40, step: 0.5, value: 10 },
        { id: 'N', label: t('覆盖次数 N', 'fold N'), min: 4, max: 120, step: 2, value: 24 },
      ],
      note: t('10 ms 的剩余时差就能把 50 Hz 以上的能量削掉一半。速度精度不是小事。', 'Just 10 ms of residual moveout cuts energy above 50 Hz by half. Velocity accuracy is not a detail.'),
      compute: (p) => {
        const dtmax = p['dtmax'] * 1e-3, N = p['N']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = 1 + (i / 200) * 99
          const w = 2 * Math.PI * f
          const x = (w * dtmax) / 2
          const den = N * Math.sin(x / N)
          const val = Math.abs(x) < 1e-9 ? 1 : Math.abs(Math.sin(x) / den)
          pts.push([f, den === 0 ? 0 : val])
        }
        return [{ label: t('A_out/A_in', 'A_out/A_in'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('速度误差 3% 的后果', 'Consequence of a 3% velocity error'),
    input: t('t₀ = 2 s，x_max = 3 km，v 由 3.0 误取为 3.09 km/s', 't₀ = 2 s, x_max = 3 km, v taken as 3.09 instead of 3.0 km/s'),
    steps: [
      t('远道时差之差约 20 ms', 'The difference in far-trace moveout is about 20 ms'),
      t('在 25 Hz 处叠加响应约为 sinc(π×25×0.02) ≈ 0.5', 'At 25 Hz the stack response is about sinc(π×25×0.02) ≈ 0.5'),
    ],
    output: t('高频损失一半，叠加剖面明显变「钝」', 'Half the high frequencies are lost and the stack visibly dulls'),
  },
  links: {
    upstream: [{ id: 'cmp-gather-fold', note: t('覆盖次数的定义', 'Definition of fold') }],
    seealso: [{ id: 'velocity-analysis', note: t('速度精度直接决定剩余时差', 'Velocity accuracy sets the residual moveout') }],
  },
  refs: [{ text: 'Yilmaz, Seismic Data Analysis, ch. 4 (stacking)' }],
}

export default stackingResponse
