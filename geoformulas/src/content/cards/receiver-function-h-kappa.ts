import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** receiver-function-h-kappa */
const receiverFunctionHKappa: FormulaCard = {
  id: 'receiver-function-h-kappa',
  name: t('接收函数 H–κ 叠加', 'H–κ Stacking of Receiver Functions'),
  aliases: { zh: ['H-kappa 叠加', '接收函数'], en: ['H-kappa stacking', 'receiver function'] },
  node: 'S7.4',
  tags: {
    math: ['MATH.GEOM', 'MATH.FOURIER', 'MATH.STAT'],
    method: ['METH.STRUCT'],
    quantity: ['Q.GEOM', 'Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`S(H,\kappa)=\sum_{j=1}^{N}w_1\,r_j\left(t_{\mathrm{Ps}}\right)+w_2\,r_j\left(t_{\mathrm{PpPs}}\right)-w_3\,r_j\left(t_{\mathrm{PsPs}+\mathrm{PpSs}}\right)`,
    variants: [
      { name: t('各转换震相的到时', 'Arrival times of the converted phases'), latex: String.raw`\begin{aligned} t_{\mathrm{Ps}}&=H\left(\sqrt{\frac{\kappa^2}{v_P^2}-p^2}-\sqrt{\frac{1}{v_P^2}-p^2}\right)\\ t_{\mathrm{PpPs}}&=H\left(\sqrt{\frac{\kappa^2}{v_P^2}-p^2}+\sqrt{\frac{1}{v_P^2}-p^2}\right)\\ t_{\mathrm{PsPs}+\mathrm{PpSs}}&=2H\sqrt{\frac{\kappa^2}{v_P^2}-p^2} \end{aligned}` },
      { name: t('κ 的含义', 'Meaning of κ'), latex: String.raw`\kappa=\frac{v_P}{v_S}` },
    ],
  },
  meaning: t(
    '接收函数是「用远震 P 波在台站下方转换成的 S 波」来探测地壳结构的标准方法。三条转换震相的到时都只依赖两个未知数：地壳厚度 H 与波速比 κ。把它们按预测到时在 (H, κ) 网格上叠加，能量最集中的那一点就是答案。κ 对地壳成分与部分熔融极其敏感，是判断下地壳是否含流体的关键参数。',
    'The receiver function is the standard method for probing crustal structure using S waves converted from teleseismic P beneath a station. The arrival times of the three converted phases depend on only two unknowns: crustal thickness H and the velocity ratio κ. Stacking them over an (H, κ) grid at their predicted times, the point of maximum stacked energy is the answer. κ is extremely sensitive to crustal composition and partial melt, making it a key indicator of fluids in the lower crust.',
  ),
  symbols: [
    { sym: 'H', name: t('地壳厚度', 'crustal thickness'), unit: 'km', typical: '25 – 70' },
    { sym: '\\kappa', name: t('波速比 v_P/v_S', 'velocity ratio v_P/v_S'), unit: '无量纲', typical: '1.65 – 1.90' },
    { sym: 'p', name: t('射线参数', 'ray parameter'), unit: 's/km' },
    { sym: 'r_j(t)', name: t('第 j 条接收函数的时间序列', 'the j-th receiver-function time series'), unit: '无量纲' },
    { sym: 'w_i', name: t('三条震相的权重', 'weights of the three phases'), unit: '无量纲', typical: '0.6 / 0.3 / 0.1' },
  ],
  conditions: {
    applies: [t('单台远震 P 波接收函数，地壳为单层均匀模型', 'Teleseismic P receiver functions at a single station, single-layer crust')],
    assumes: [
      t('地壳可近似为均匀单层', 'The crust is approximated as a single uniform layer'),
      t('Moho 近水平、无强烈倾斜', 'The Moho is nearly horizontal, without strong dip'),
    ],
    breaks: [t('地壳内部强速度梯度或 Moho 渐变时，转换震相不清晰', 'With strong intra-crustal gradients or a gradational Moho the converted phases are unclear')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('Ps 转换波的走时差', 'Travel-time difference of the Ps conversion'),
      latex: String.raw`t_{\mathrm{Ps}}=H\left(\sqrt{\frac{1}{v_S^2}-p^2}-\sqrt{\frac{1}{v_P^2}-p^2}\right)` },
    { n: 2, op: 'substitute', title: t('用 κ = v_P/v_S 改写', 'Rewrite with κ = v_P/v_S'),
      latex: String.raw`\frac{1}{v_S}=\frac{\kappa}{v_P}\;\Longrightarrow\; t_{\mathrm{Ps}}=H\left(\sqrt{\frac{\kappa^2}{v_P^2}-p^2}-\sqrt{\frac{1}{v_P^2}-p^2}\right)` },
    { n: 3, op: 'geometry', title: t('多次波 PpPs 的路径', 'Path of the multiple PpPs'),
      latex: String.raw`t_{\mathrm{PpPs}}=H\left(\sqrt{\frac{\kappa^2}{v_P^2}-p^2}+\sqrt{\frac{1}{v_P^2}-p^2}\right)` },
    { n: 4, op: 'geometry', title: t('多次波 PsPs+PpSs', 'The multiple PsPs+PpSs'),
      latex: String.raw`t_{\mathrm{PsPs}+\mathrm{PpSs}}=2H\sqrt{\frac{\kappa^2}{v_P^2}-p^2}` },
    { n: 5, op: 'result', title: t('网格搜索叠加', 'Grid-search stacking'),
      latex: String.raw`\left(\hat H,\hat\kappa\right)=\arg\max_{H,\kappa}S(H,\kappa)` },
  ],
  links: {
    upstream: [{ id: 'snell-ray-parameter', note: t('到时公式中的射线参数', 'Supplies the ray parameter in the arrival-time formulas') }],
    seealso: [{ id: 'velocity-ratio-poisson', note: t('κ 与泊松比的对应', 'Correspondence between κ and Poisson’s ratio') }],
  },
  refs: [{ text: 'Zhu & Kanamori (2000), J. Geophys. Res., 105' }],
}

export default receiverFunctionHKappa
