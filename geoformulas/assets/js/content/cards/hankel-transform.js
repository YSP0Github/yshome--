import { t } from '../../core/types.js';
/** hankel-transform */
const hankelTransform = {
    id: 'hankel-transform',
    name: t('Hankel（Fourier–Bessel）变换', 'The Hankel (Fourier–Bessel) Transform'),
    aliases: { zh: ['汉克尔变换', '贝塞尔变换', '柱对称傅里叶变换'], en: ['Hankel transform', 'Fourier-Bessel transform', 'radial Fourier transform'] },
    node: 'S0.5',
    tags: {
        math: ['MATH.FOURIER', 'MATH.DIFF'],
        method: ['METH.PROC', 'METH.SURF'],
        quantity: ['Q.GEOM', 'Q.FREQ'],
        keywords: t('汉克尔变换 Fourier-Bessel 柱对称 径向谱 jinc 二维傅里叶变换 面波', 'Hankel transform Fourier-Bessel cylindrical symmetry radial spectrum jinc 2D Fourier transform surface wave'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `F(k)=\mathcal{H}_{n}\{f\}(k)=\int_{0}^{\infty}f(r)\,J_{n}(kr)\,r\,\mathrm{d}r`,
        variants: [
            { name: t('反变换（自互反）', 'Inverse transform (self-reciprocal)'), latex: String.raw `f(r)=\int_{0}^{\infty}F(k)\,J_{n}(kr)\,k\,\mathrm{d}k` },
            { name: t('与二维 Fourier 变换的关系', 'Relation to the two-dimensional Fourier transform'), latex: String.raw `\tilde f(\mathbf q)=\int f(\mathbf r)e^{i\mathbf q\cdot\mathbf r}\,\mathrm{d}^{2}\mathbf r=2\pi\,\mathcal{H}_{0}\{f\}(q)` },
            { name: t('Parseval 关系（能量守恒）', 'Parseval relation (energy conservation)'), latex: String.raw `\int_{0}^{\infty}|f(r)|^{2}r\,\mathrm{d}r=\int_{0}^{\infty}|F(k)|^{2}k\,\mathrm{d}k` },
            { name: t('圆盘函数（顶帽）的变换：jinc', 'Transform of a disc (top hat): the jinc function'), latex: String.raw `f(r)=\begin{cases}1,& r<a\\ 0,& r>a\end{cases}\;\Longrightarrow\; F(k)=\frac{a\,J_{1}(ka)}{k}` },
            { name: t('高斯函数的变换', 'Transform of a Gaussian'), latex: String.raw `f(r)=e^{-\frac{r^{2}}{2\sigma^{2}}}\;\Longrightarrow\; F(k)=\sigma^{2}e^{-\frac{k^{2}\sigma^{2}}{2}}` },
            { name: t('1/r 的变换（自互反）', 'Transform of 1/r (self-reciprocal)'), latex: String.raw `f(r)=\frac{1}{r}\;\Longrightarrow\; F(k)=\frac{1}{k}` },
        ],
    },
    meaning: t('当一个二维场具有圆对称（或者按方位角阶数 n 分解后）时，它的二维 Fourier 变换退化为一维积分，核是 Bessel 函数 J_n——这就是 Hankel 变换。它是处理柱面波、圆形震源、垂直裂纹辐射、以及面波在横向均匀介质中传播的标准工具。面波层析中从台站对记录提取频散，底层算法大量使用 0 阶 Hankel 变换。', 'When a two-dimensional field is circularly symmetric (or after decomposition into azimuthal orders n), its 2D Fourier transform collapses to a one-dimensional integral with the Bessel kernel J_n — the Hankel transform. It is the standard tool for cylindrical waves, circular sources, radiation from vertical cracks and surface-wave propagation in laterally homogeneous media. Extracting dispersion from station pairs in surface-wave tomography relies heavily on the zeroth-order Hankel transform.'),
    symbols: [
        { sym: 'F(k)', name: t('径向波数谱', 'radial wavenumber spectrum'), unit: '与 f 同 · m²' },
        { sym: 'f(r)', name: t('径向函数', 'radial function'), unit: '随问题而定' },
        { sym: 'r', name: t('径向距离', 'radial distance'), unit: 'm' },
        { sym: 'k', name: t('径向波数', 'radial wavenumber'), unit: 'rad/m' },
        { sym: 'J_n', name: t('n 阶第一类 Bessel 函数', 'Bessel function of the first kind, order n'), unit: '1' },
        { sym: '\\mathbf q', name: t('二维波数矢量', 'two-dimensional wavevector'), unit: 'rad/m' },
        { sym: '\\sigma', name: t('高斯宽度参数', 'Gaussian width parameter'), unit: 'm' },
        { sym: 'a', name: t('圆盘半径', 'radius of the disc'), unit: 'm' },
    ],
    conditions: {
        applies: [
            t('圆对称的二维场，或按方位角阶数展开后的每一阶', 'Circularly symmetric 2D fields, or each order of an azimuthal expansion'),
            t('f(r) 在 r → ∞ 时足够快衰减且 ∫|f|√r dr 收敛', 'f(r) decays fast enough as r → ∞ and ∫|f|√r dr converges'),
        ],
        assumes: [
            t('采用对称归一化：正反变换核相同，不含 2π 因子', 'Symmetric normalisation: forward and inverse kernels are the same, with no 2π factor'),
            t('若用于二维 Fourier 变换，需额外乘 2π（见变体）', 'When used for the 2D Fourier transform an extra factor 2π appears (see variants)'),
        ],
        breaks: [
            t('非圆对称场必须先按方位角分解，否则 0 阶变换会丢失信息', 'Non-axisymmetric fields must first be decomposed azimuthally, otherwise the zeroth-order transform loses information'),
            t('离散实现中对振荡核 J_n(kr) 的数值积分收敛慢，需专门的正交或离散 Hankel 变换算法', 'Discrete implementations converge slowly for the oscillatory kernel J_n(kr) and need dedicated quadrature or discrete Hankel transform algorithms'),
            t('带吸收时 k 为复数，通常改用围道积分', 'With absorption k becomes complex and contour integration is usually used instead'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('写出二维 Fourier 变换', 'Write the 2D Fourier transform'),
            latex: String.raw `\tilde f(\mathbf q)=\int_{\mathbb{R}^{2}}f(\mathbf r)\,e^{i\mathbf q\cdot\mathbf r}\,\mathrm{d}^{2}\mathbf r` },
        { n: 2, op: 'transform', title: t('取极坐标，令波数沿 x 轴', 'Use polar coordinates with the wavevector along the x axis'),
            latex: String.raw `\mathbf q\cdot\mathbf r=qr\cos\psi,\qquad \mathrm{d}^{2}\mathbf r=r\,\mathrm{d}r\,\mathrm{d}\psi`,
            note: t('由于 f 只依赖 r，方位角积分可以单独完成。', 'Because f depends only on r, the azimuthal integral can be done separately.') },
        { n: 3, op: 'identity', title: t('方位角积分给出 Bessel 函数的积分表示', 'The azimuthal integral gives the integral representation of a Bessel function'),
            latex: String.raw `\int_{0}^{2\pi}e^{iqr\cos\psi}\,\mathrm{d}\psi=2\pi J_{0}(qr)` },
        { n: 4, op: 'substitute', title: t('代入并整理', 'Substitute and collect'),
            latex: String.raw `\tilde f(q)=2\pi\int_{0}^{\infty}f(r)\,J_{0}(qr)\,r\,\mathrm{d}r=2\pi\,\mathcal{H}_{0}\{f\}(q)` },
        { n: 5, op: 'identity', title: t('一般阶数：按 e^{inψ} 分解得到 J_n', 'General order: expanding in e^{inψ} gives J_n'),
            latex: String.raw `\mathcal{H}_{n}\{f\}(k)=\int_{0}^{\infty}f(r)J_{n}(kr)\,r\,\mathrm{d}r,\qquad \mathcal{H}_{n}^{-1}=\mathcal{H}_{n}` },
        { n: 6, op: 'result', title: t('自互反性：变换两次回到原函数', 'Self-reciprocity: transforming twice returns the original'),
            latex: String.raw `f(r)=\int_{0}^{\infty}F(k)J_{n}(kr)\,k\,\mathrm{d}k`,
            note: t('正反变换形式完全一致，这是 Bessel 函数正交完备性的直接推论，也是它与 Fourier 变换共有的优雅性质。', 'Forward and inverse have exactly the same form, a direct consequence of the orthogonality and completeness of Bessel functions, and an elegant property shared with the Fourier transform.') },
    ],
    example: {
        title: t('一个圆形震源的辐射谱', 'Radiation spectrum of a circular source'),
        input: t('半径 a = 1 km 的均匀圆盘状滑动，求其波数谱', 'Uniform disc of slip with radius a = 1 km; find its wavenumber spectrum'),
        steps: [
            t('f(r) = 1（r < a），0（r > a）', 'f(r) = 1 for r < a, 0 for r > a'),
            t('F(k) = ∫₀^a J₀(kr) r dr = a J₁(ka)/k', 'F(k) = ∫₀^a J₀(kr) r dr = a J₁(ka)/k'),
            t('k → 0 时 F → a²/2（即圆面积/2π 的量级，总滑动量）', 'As k → 0, F → a²/2 (the total slip, of order area/2π)'),
            t('第一个零点在 ka ≈ 3.83，即 k ≈ 3.83 km⁻¹', 'The first zero is at ka ≈ 3.83, i.e. k ≈ 3.83 km⁻¹'),
        ],
        output: t('谱呈 jinc 形状，主瓣宽度 ∝ 1/a：震源越大，辐射越集中在小 k（低频）。这正是大地震震源时间函数偏长、低频丰富的几何原因。', 'The spectrum has the jinc shape with a main lobe of width ∝ 1/a: a larger source radiates more into small k (low frequency). This is the geometric reason why great earthquakes have long source time functions and rich low-frequency content.'),
    },
    links: {
        upstream: [
            { id: 'bessel-cylindrical-wave', note: t('提供核函数 J_n', 'supplies the kernel J_n') },
        ],
        seealso: [
            { id: 'fourier-transform', note: t('二维情形的退化形式', 'the degenerate form in two dimensions') },
            { id: 'mw-moment-magnitude', note: t('震源尺度与谱的形状', 'source dimension and spectral shape') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §6.4' },
        { text: 'Sneddon, Fourier Transforms, Ch. 4' },
    ],
};
export default hankelTransform;
//# sourceMappingURL=hankel-transform.js.map