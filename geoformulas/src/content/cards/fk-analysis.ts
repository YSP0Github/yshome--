import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** fk-analysis */
const fkAnalysis: FormulaCard = {
  id: 'fk-analysis',
  name: t('频率—波数（f–k）分析', 'Frequency–Wavenumber (f–k) Analysis'),
  aliases: { zh: ['f-k 分析', '速度谱'], en: ['f-k analysis', 'FK filter', 'velocity filtering'] },
  node: 'S8.3',
  tags: {
    math: ['MATH.FOURIER', 'MATH.VECTOR'],
    method: ['METH.PROC', 'METH.INSTR'],
    quantity: ['Q.FREQ', 'Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`P(f,\boldsymbol{k})=\left|\iint u(\boldsymbol{r},t)\,e^{-i2\pi\left(ft-\boldsymbol{k}\cdot\boldsymbol{r}\right)}\mathrm{d}\boldsymbol{r}\,\mathrm{d}t\right|^{2}`,
    variants: [
      { name: t('视速度与慢度的关系', 'Relation between apparent velocity and slowness'), latex: String.raw`c_{\text{app}}=\frac{1}{|\boldsymbol{p}|}=\frac{f}{|\boldsymbol{k}|}` },
      { name: t('f–k 滤波：在 (f, k) 平面保留目标扇形区', 'f–k filtering: keep a target sector in the (f, k) plane'), latex: String.raw`\tilde{u}_{\text{out}}(f,\boldsymbol{k})=\tilde{u}(f,\boldsymbol{k})\,M(f,\boldsymbol{k})` },
    ],
  },
  meaning: t(
    '把台阵记录同时在时间和空间上做 Fourier 变换，就得到 f–k 谱。不同来向、不同视速度的波在 (f, k) 平面上占据不同的扇形区域，因此可以像切蛋糕一样把想要的波保留、把干扰滤掉。这是分离 P 与 S、压制面波、提取微弱核相的核心工具。',
    'Fourier transforming an array record in both time and space gives the f–k spectrum. Waves of different back-azimuth and apparent velocity occupy different sectors of the (f, k) plane, so one can keep the wanted wave and reject the rest like slicing a pie. This is the core tool for separating P from S, suppressing surface waves and extracting weak core phases.',
  ),
  symbols: [
    { sym: 'P(f,\\boldsymbol{k})', name: t('f–k 功率谱', 'f–k power spectrum'), unit: '与振幅平方同' },
    { sym: '\\boldsymbol{k}', name: t('波数矢量', 'wavenumber vector'), unit: 'rad/km' },
    { sym: 'c_{\\text{app}}', name: t('视速度', 'apparent velocity'), unit: 'km/s' },
    { sym: 'M(f,\\boldsymbol{k})', name: t('f–k 域的滤波掩膜', 'filter mask in the f–k domain'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('二维台阵记录（孔径与台间距合理配置）', 'Two-dimensional array recordings with sensible aperture and spacing')],
    assumes: [t('波场在台阵内可视为平面波的叠加', 'The wavefield is a superposition of plane waves across the array')],
    breaks: [t('空间采样不足会产生 k 域假频，需控制台间距 ≤ λ_min/2', 'Insufficient spatial sampling aliases the k domain; station spacing must be ≤ λ_min/2')],
  },
  derivation: [
    { n: 1, op: 'transform', title: t('对时间与空间同时做 Fourier 变换', 'Fourier transform in both time and space'),
      latex: String.raw`\tilde{u}(f,\boldsymbol{k})=\iint u(\boldsymbol{r},t)e^{-i2\pi(ft-\boldsymbol{k}\cdot\boldsymbol{r})}\mathrm{d}\boldsymbol{r}\mathrm{d}t` },
    { n: 2, op: 'identity', title: t('单色平面波在 f–k 域是一个点', 'A monochromatic plane wave is a point in the f–k domain'),
      latex: String.raw`u=e^{i2\pi(ft_0-\boldsymbol{k}_0\cdot\boldsymbol{r})}\;\Longrightarrow\; \tilde{u}\propto\delta(f-f_0)\delta(\boldsymbol{k}-\boldsymbol{k}_0)` },
    { n: 3, op: 'result', title: t('取模平方并识别能量脊', 'Take the squared modulus and identify energy ridges'),
      latex: String.raw`P(f,\boldsymbol{k})=\left|\tilde{u}\right|^{2},\qquad c_{\text{app}}=\frac{f}{|\boldsymbol{k}|}` },
  ],
  links: {
    upstream: [{ id: 'fourier-transform-pair', note: t('二维 Fourier 变换', 'The two-dimensional Fourier transform') }],
    seealso: [{ id: 'array-beamforming', note: t('等价的慢度域表述', 'The equivalent slowness-domain formulation') }],
  },
  refs: [{ text: 'Rost & Thomas (2002), Rev. Geophys., 40' }],
}

export default fkAnalysis
