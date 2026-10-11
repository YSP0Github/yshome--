import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** taup-transform */
const taupTransform: FormulaCard = {
  id: 'taup-transform',
  name: t('τ–p 变换（倾斜叠加）', 'The τ–p Transform (Slant Stack)'),
  aliases: { zh: ['tau-p 变换', '倾斜叠加', 'Radon 变换'], en: ['tau-p transform', 'slant stack', 'Radon transform'] },
  node: 'S2.6',
  tags: {
    math: ['MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.PROC', 'METH.TELE'],
    quantity: ['Q.TIME', 'Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\tau(p)=T(p)-p\,X(p),\qquad \frac{\mathrm{d}\tau}{\mathrm{d}p}=-X`,
    variants: [
      { name: t('正向：由地震道集做倾斜叠加', 'Forward: slant-stacking a seismic gather'), latex: String.raw`S(\tau,p)=\int u(x,\tau+p x)\,\mathrm{d}x` },
      { name: t('对球对称地球的 τ 积分', 'The τ integral for a spherical Earth'), latex: String.raw`\tau(p)=2\int_{r_t}^{R}\frac{\sqrt{r^{2}-p^{2}v^{2}(r)}}{r\,v(r)}\,\mathrm{d}r` },
    ],
  },
  meaning: t(
    'τ 是「截距时间」——把走时里沿测线传播的那部分扣掉之后剩下的东西。它有两个神奇性质：一是 dτ/dp = −X 给出了震中距，二是 τ(p) 对速度结构的依赖是线性的，因此可以直接反演。倾斜叠加则是它的离散实现，也是多次波压制与波场分离的主力工具。',
    'τ is the intercept time: what remains after removing the part of the travel time spent propagating along the profile. It has two magic properties: dτ/dp = −X gives the epicentral distance, and the dependence of τ(p) on velocity structure is linear, so it can be inverted directly. Slant stacking is its discrete implementation, and a workhorse for multiple suppression and wavefield separation.',
  ),
  symbols: [
    { sym: '\\tau', name: t('截距时间', 'intercept time'), unit: 's' },
    { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/km' },
    { sym: 'X', name: t('震中距或偏移距', 'epicentral distance or offset'), unit: 'km' },
    { sym: 'S(\\tau,p)', name: t('τ–p 域的波场', 'wavefield in the τ–p domain'), unit: '与输入同' },
  ],
  conditions: {
    applies: [t('水平层状介质或球对称地球；也可用于任意道集的线性变换', 'Horizontally layered media or a spherical Earth; also usable as a linear transform of any gather')],
    assumes: [t('道集充分采样，无空间假频', 'The gather is adequately sampled, free of spatial aliasing')],
    breaks: [t('道间距过大时倾斜叠加出现 p 域假频', 'Too-large receiver spacing produces aliasing in the p domain')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义截距时间', 'Define the intercept time'),
      latex: String.raw`\tau=T-pX` },
    { n: 2, op: 'identity', title: t('对 p 求导', 'Differentiate with respect to p'),
      latex: String.raw`\frac{\mathrm{d}\tau}{\mathrm{d}p}=\frac{\mathrm{d}T}{\mathrm{d}p}-X-p\frac{\mathrm{d}X}{\mathrm{d}p}` },
    { n: 3, op: 'identity', title: t('代入 dT/dp = p dX/dp', 'Substitute dT/dp = p dX/dp'),
      latex: String.raw`\frac{\mathrm{d}\tau}{\mathrm{d}p}=p\frac{\mathrm{d}X}{\mathrm{d}p}-X-p\frac{\mathrm{d}X}{\mathrm{d}p}=-X`,
      note: t('这是 τ–p 理论里最漂亮的一步：走时曲线的斜率关系让两项精确抵消。', 'This is the most elegant step in τ–p theory: the slope relation makes two terms cancel exactly.') },
    { n: 4, op: 'transform', title: t('把 T 的积分减 pX', 'Subtract pX from the integral for T'),
      latex: String.raw`\tau=2\int_{r_t}^{R}\left[\frac{r\,u}{\sqrt{r^{2}-p^{2}v^{2}}}-\frac{p^{2}v}{r\sqrt{r^{2}-p^{2}v^{2}}}\right]\mathrm{d}r` },
    { n: 5, op: 'algebra', title: t('合并根号', 'Combine the square roots'),
      latex: String.raw`\frac{r\,u}{A}-\frac{p^{2}v}{rA}=\frac{r^{2}-p^{2}v^{2}}{r\,v\,A}=\frac{A}{r\,v},\quad A=\sqrt{r^{2}-p^{2}v^{2}}` },
    { n: 6, op: 'result', title: t('得到 τ 积分', 'The τ integral'),
      latex: String.raw`\tau(p)=2\int_{r_t}^{R}\frac{\sqrt{r^{2}-p^{2}v^{2}(r)}}{r\,v(r)}\,\mathrm{d}r`,
      note: t('注意根号在分子上 —— 这使 τ 积分在转折点是良态的，而 T 与 X 的积分在那里发散。', 'Note the square root in the numerator: this makes the τ integral well behaved at the turning point, whereas the T and X integrals diverge there.') },
  ],
  links: {
    upstream: [{ id: 'spherical-earth-travel-time', note: t('τ 由它减 pX 得到', 'τ follows from it by subtracting pX') }],
    downstream: [{ id: 'wiechert-herglotz-inversion', note: t('由 τ(p) 反推 v(r)', 'Inverts τ(p) back to v(r)') }],
    seealso: [{ id: 'nmo-correction', note: t('同样利用双曲时距的截距', 'Also exploits the intercept of the hyperbolic moveout') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §9.3' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.5' }],
}

export default taupTransform
