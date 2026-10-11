import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** velocity-analysis */
const velocityAnalysis: FormulaCard = {
  id: 'velocity-analysis',
  name: t('速度分析与叠加能量', 'Velocity Analysis & Stack Power'),
  aliases: { zh: ['速度谱', 'CMP 速度分析'], en: ['velocity analysis', 'semblance', 'stacking velocity'] },
  node: 'S3.4',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.EXPL', 'METH.PROC'],
    quantity: ['Q.VEL', 'Q.TIME'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`S(v)=\frac{\sum_{t}\left(\sum_{i=1}^{N}d_i\!\left(t+\Delta t_i(v)\right)\right)^{2}}{N\sum_{t}\sum_{i}d_i^{2}\!\left(t+\Delta t_i(v)\right)}\qquad (0\le S\le1)`,
    variants: [
      { name: t('NMO 校正量', 'The NMO correction'), latex: String.raw`\Delta t_i=\sqrt{t_0^{2}+\frac{x_i^{2}}{v^{2}}}-t_0` },
      { name: t('速度谱峰值即叠加速度', 'The peak of the velocity spectrum is the stacking velocity'), latex: String.raw`\hat v=\arg\max_v S(v)` },
      { name: t('Dix 转换（由叠加速度求层速度）', 'Dix conversion (stacking to interval velocity)'), latex: String.raw`v_{\text{int},n}=\sqrt{\frac{v_n^{2}t_n-v_{n-1}^{2}t_{n-1}}{t_n-t_{n-1}}}` },
    ],
  },
  meaning: t(
    '处理员面对 CMP 道集时，第一个要决定的就是「用多快的速度做动校正」。速度分析把每个试验速度都试一遍：校正对了，所有道同相叠加，能量最大；错了就互相抵消。相似度谱 S(v) 把这个判断量化成 0–1 之间的一个数，峰值处就是叠加速度。这是整个处理流程里最依赖人工判断、也最容易出错的一步。',
    'Facing a CMP gather, the processor must first choose the velocity used for NMO. Velocity analysis tries every candidate: with the right velocity all traces stack in phase and energy is maximal; with the wrong one they cancel. The semblance S(v) quantifies this judgment as a number between 0 and 1, and its peak is the stacking velocity. It is the most judgement-dependent and error-prone step in the whole processing flow.',
  ),
  symbols: [
    { sym: 'S(v)', name: t('相似度（叠加能量）', 'semblance (stack power)'), unit: '无量纲', typical: '0 – 1' },
    { sym: 'v', name: t('试验叠加速度', 'trial stacking velocity'), unit: 'm/s' },
    { sym: 'x_i', name: t('第 i 道的偏移距', 'offset of the i-th trace'), unit: 'm' },
    { sym: 't_0', name: t('零偏移距双程走时', 'zero-offset two-way time'), unit: 's' },
    { sym: 'N', name: t('道集内的道数', 'number of traces in the gather'), unit: '个' },
  ],
  conditions: {
    applies: [t('CMP 道集、水平层状介质', 'CMP gathers in horizontally layered media')],
    assumes: [t('时距关系为双曲线', 'The moveout is hyperbolic')],
    breaks: [t('大偏移距、强各向异性、陡倾角时双曲线假设失效（需非双曲动校正）', 'At large offsets, strong anisotropy or steep dip the hyperbolic assumption fails and non-hyperbolic moveout is needed')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('对每个试验速度做 NMO 校正', 'Apply NMO for each trial velocity'),
      latex: String.raw`\Delta t_i(v)=\sqrt{t_0^{2}+\frac{x_i^{2}}{v^{2}}}-t_0` },
    { n: 2, op: 'identity', title: t('计算叠加道的能量', 'Compute the energy of the stacked trace'),
      latex: String.raw`E_{\text{stack}}=\sum_t\left(\sum_i d_i(t+\Delta t_i)\right)^{2}` },
    { n: 3, op: 'identity', title: t('用各道总能量归一化', 'Normalise by the total energy of all traces'),
      latex: String.raw`E_{\text{total}}=N\sum_t\sum_i d_i^{2}(t+\Delta t_i)` },
    { n: 4, op: 'result', title: t('比值即相似度', 'The ratio is the semblance'),
      latex: String.raw`S(v)=\frac{E_{\text{stack}}}{E_{\text{total}}}\in[0,1]` },
  ],
  viz: [
    {
      id: 'semblance-peak',
      level: 'V1',
      title: t('相似度随试验速度的变化', 'Semblance versus trial velocity'),
      xlabel: t('试验速度 v (m/s)', 'trial velocity v (m/s)'),
      ylabel: t('相似度 S', 'semblance S'),
      controls: [
        { id: 'vt', label: t('真实速度 v_true', 'true velocity v_true'), min: 1500, max: 4000, step: 50, value: 2500, unit: 'm/s' },
        { id: 'n', label: t('道数 N', 'number of traces N'), min: 6, max: 60, step: 2, value: 24 },
      ],
      compute: (p) => {
        const vt = p['vt'], N = p['n']
        const xt = 3000
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const v = 1200 + (i / 300) * 2800
          // 残余时差导致的去相关
          const dt = Math.sqrt(1 + (xt * xt) / (v * v)) - Math.sqrt(1 + (xt * xt) / (vt * vt))
          const f = 30
          const dec = Math.abs(Math.sin(Math.PI * f * dt + 1e-9) / (Math.PI * f * dt + 1e-9))
          pts.push([v, (1 + (N - 1) * dec) / N])
        }
        return [{ label: t('S(v)', 'S(v)'), color: '#185FA5', points: pts }]
      },
      note: t('道数越多峰值越尖锐（分辨能力越强），但旁瓣也越多 —— 速度拾取的经典权衡。', 'More traces give a sharper peak (better resolution) but also more side lobes — the classic trade-off in velocity picking.'),
    },
  ],
  links: {
    upstream: [
      { id: 'nmo-correction', note: t('NMO 校正量来自它', 'The NMO correction comes from it') },
      { id: 'reflection-hyperbola', note: t('双曲线时距', 'The hyperbolic moveout') },
    ],
    seealso: [{ id: 'dix-formula', note: t('由叠加速度求层速度', 'From stacking to interval velocity') }],
  },
  refs: [{ text: 'Taner & Koehler (1969), Geophysics, 34' }, { text: 'Yilmaz, Seismic Data Analysis, §4' }],
}

export default velocityAnalysis
