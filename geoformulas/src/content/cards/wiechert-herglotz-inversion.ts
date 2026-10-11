import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wiechert-herglotz-inversion */
const wiechertHerglotzInversion: FormulaCard = {
  id: 'wiechert-herglotz-inversion',
  name: t('Wiechert–Herglotz 反演', 'The Wiechert–Herglotz Inversion'),
  aliases: { zh: ['Herglotz 反演', '由走时曲线反推速度'], en: ['Herglotz inversion', 'Wiechert-Herglotz method'] },
  node: 'S2.6',
  tags: {
    math: ['MATH.DIFF', 'MATH.APPROX'],
    method: ['METH.STRUCT', 'METH.INV'],
    quantity: ['Q.VEL', 'Q.TIME', 'Q.GEOM'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`r_t=R\exp\!\left[-\frac{1}{\pi}\int_{0}^{p}\frac{X(p')\,\mathrm{d}p'}{\sqrt{p^{2}-p'^{2}}}\right]`,
    variants: [
      { name: t('由 X(p) 反推转折点半径', 'Recovering the turning radius from X(p)'), latex: String.raw`v(r_t)=\frac{r_t}{p}` },
      { name: t('等价的 Abel 反演形式', 'Equivalent Abel-inversion form'), latex: String.raw`\ln\frac{R}{r_t}=\frac{1}{\pi}\int_{0}^{p}\frac{X(p')\,\mathrm{d}p'}{\sqrt{p^{2}-p'^{2}}}` },
    ],
  },
  meaning: t(
    '1910 年前后 Wiechert 与 Herglotz 解决了地震学的第一个真正的反问题：能不能只凭地表观测到的走时曲线 T(Δ)，反推出地下速度随深度的分布？答案是能，前提是速度单调增加。这是地震学从「描述」走向「反演」的起点，也是现代层析成像的思想祖先。',
    'Around 1910 Wiechert and Herglotz solved the first genuine inverse problem in seismology: can the subsurface velocity–depth distribution be recovered from surface-observed travel times T(Δ) alone? The answer is yes, provided velocity increases monotonically. This is where seismology moved from description to inversion, and the intellectual ancestor of modern tomography.',
  ),
  symbols: [
    { sym: 'r_t', name: t('与射线参数 p 对应的转折点半径', 'turning radius corresponding to ray parameter p'), unit: 'km' },
    { sym: 'X(p)', name: t('射线参数 p 对应的震中距', 'epicentral distance for ray parameter p'), unit: 'rad' },
    { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'km' },
    { sym: 'v(r_t)', name: t('转折点处速度', 'velocity at the turning point'), unit: 'km/s' },
  ],
  conditions: {
    applies: [t('球对称、径向单调增加的速度结构', 'Spherically symmetric velocity increasing monotonically with radius')],
    assumes: [
      t('v(r) 单调增加（无低速带）', 'v(r) increases monotonically (no low-velocity zone)'),
      t('走时曲线 T(Δ) 完整且无多值分支', 'The travel-time curve T(Δ) is complete and single-branched'),
    ],
    breaks: [
      t('存在低速带时反演不唯一，需加入振幅或其它约束', 'With a low-velocity zone the inversion is non-unique and needs amplitude or other constraints'),
      t('实际数据离散且带噪，需先做平滑与正则化', 'Real data are discrete and noisy, requiring smoothing and regularisation'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从 Δ(p) 的积分出发', 'Start from the integral for Δ(p)'),
      latex: String.raw`X(p)=2\int_{r_t}^{R}\frac{p\,v(r)}{r\sqrt{r^{2}-p^{2}v^{2}(r)}}\,\mathrm{d}r` },
    { n: 2, op: 'transform', title: t('换元到 η = r/v(r)', 'Change variable to η = r/v(r)'),
      latex: String.raw`\eta=\frac{r}{v(r)},\qquad \mathrm{d}\ln r=\frac{\eta}{\sqrt{\eta^{2}-p^{2}}}\cdot\text{（经整理）}` },
    { n: 3, op: 'identity', title: t('识别为 Abel 型积分方程', 'Recognise an Abel-type integral equation'),
      latex: String.raw`X(p)=2p\int_{p}^{\eta_0}\frac{\mathrm{d}\ln r}{\sqrt{\eta^{2}-p^{2}}}\cdot\eta`,
      note: t('Abel 型方程有标准反演公式，这也是整个方法能走通的原因。', 'Abel-type equations admit a standard inversion formula — that is why the method works at all.') },
    { n: 4, op: 'transform', title: t('施加 Abel 反演', 'Apply Abel inversion'),
      latex: String.raw`\ln\frac{R}{r_t}=\frac{1}{\pi}\int_{0}^{p}\frac{X(p')\,\mathrm{d}p'}{\sqrt{p^{2}-p'^{2}}}` },
    { n: 5, op: 'result', title: t('得到 r_t 与速度', 'Obtain r_t and the velocity'),
      latex: String.raw`r_t=R\,e^{-\frac{1}{\pi}\int_0^p \frac{X(p')\,\mathrm{d}p'}{\sqrt{p^{2}-p'^{2}}}},\qquad v(r_t)=\frac{r_t}{p}` },
  ],
  links: {
    upstream: [{ id: 'taup-transform', note: t('X(p) 与 τ(p) 由它给出', 'X(p) and τ(p) come from it') }],
    seealso: [{ id: 'adams-williamson', note: t('密度剖面的同类反演', 'The analogous inversion for density') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §9.4' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.5' }],
}

export default wiechertHerglotzInversion
