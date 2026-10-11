import { t } from '../../core/types.js';
/** residue-theorem */
const residueTheorem = {
    id: 'residue-theorem',
    name: t('留数定理', 'The Residue Theorem'),
    aliases: { zh: ['留数定理', '围道积分', '柯西留数定理'], en: ['residue theorem', 'Cauchy residue theorem', 'contour integration'] },
    node: 'S0.4',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.FOURIER'],
        method: ['METH.INV'],
        quantity: ['Q.FREQ'],
        keywords: t('留数定理 围道积分 极点 留数 Jordan 引理 Fourier 反演 因果性', 'residue theorem contour integration pole residue Jordan lemma Fourier inversion causality'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\oint_{C}f(z)\,\mathrm{d}z=2\pi i\sum_{k}\operatorname{Res}\!\left(f,z_{k}\right)`,
        variants: [
            { name: t('单极点的留数', 'Residue at a simple pole'), latex: String.raw `\operatorname{Res}\!\left(f,z_{0}\right)=\lim_{z\to z_{0}}\left(z-z_{0}\right)f(z)` },
            { name: t('m 阶极点的留数', 'Residue at a pole of order m'), latex: String.raw `\operatorname{Res}\!\left(f,z_{0}\right)=\frac{1}{(m-1)!}\lim_{z\to z_{0}}\frac{\mathrm{d}^{m-1}}{\mathrm{d}z^{m-1}}\left[\left(z-z_{0}\right)^{m}f(z)\right]` },
            { name: t('若 f = P/Q 且 Q 有单零点', 'If f = P/Q and Q has a simple zero'), latex: String.raw `\operatorname{Res}\!\left(\frac{P}{Q},z_{0}\right)=\frac{P(z_{0})}{Q'(z_{0})}` },
            { name: t('用于 Fourier 反演（t > 0 时围道向下闭合）', 'Applied to Fourier inversion (close downward for t > 0)'), latex: String.raw `x(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}X(\omega)\,e^{-i\omega t}\,\mathrm{d}\omega=-i\sum_{\text{下半平面}}\operatorname{Res}\!\left(X(\omega)e^{-i\omega t}\right)` },
        ],
    },
    meaning: t('留数定理说：一个闭围道积分的值，只由围道内部奇点处「1/(z−z₀) 项的系数」决定，与围道的形状无关。这是复分析最有力的计算工具，也是地震学里反演 Fourier 积分的标准手段——把实轴上的无穷积分补成闭围道，用极点求积。介质 Q 造成的极点位于下半平面，正是它们给出因果的、随时间指数衰减的响应。', 'The residue theorem says that the value of a closed contour integral is determined solely by the coefficient of the 1/(z − z₀) term at the singularities inside, independent of the shape of the contour. It is the most powerful computational tool of complex analysis and the standard way to invert Fourier integrals in seismology: close the infinite integral along the real axis into a contour and sum poles. Poles produced by anelastic Q sit in the lower half-plane, and it is precisely those that give causal, exponentially decaying responses.'),
    symbols: [
        { sym: 'f(z)', name: t('在围道内除有限个极点外处处解析的复函数', 'complex function analytic inside the contour except at finitely many poles'), unit: '1' },
        { sym: 'C', name: t('逆时针方向的简单闭围道', 'positively oriented simple closed contour'), unit: '1' },
        { sym: 'z_k', name: t('围道内的第 k 个奇点', 'the k-th singularity inside the contour'), unit: '1' },
        { sym: '\\operatorname{Res}\\!\\left(f,z_k\\right)', name: t('f 在 z_k 处的留数', 'residue of f at z_k'), unit: '1' },
        { sym: 'X(\\omega)', name: t('待反演的频谱', 'the spectrum to be inverted'), unit: '与信号同 · s' },
        { sym: 'm', name: t('极点阶数', 'order of the pole'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('f 在闭围道内除有限个孤立奇点外解析，且在围道上无奇点', 'f is analytic inside the contour except at finitely many isolated singularities, none lying on the contour'),
            t('用于无穷积分时，需验证大圆弧上的积分趋于零（Jordan 引理）', 'For infinite integrals one must verify that the large-arc contribution vanishes (Jordan lemma)'),
        ],
        assumes: [
            t('围道取逆时针为正方向', 'The contour is taken counter-clockwise as positive'),
            t('极点不是本性奇点时留数计算最简单；本性奇点需展开 Laurent 级数取 a₋₁ 系数', 'Residues are simplest at poles; at essential singularities one expands the Laurent series and takes the a₋₁ coefficient'),
        ],
        breaks: [
            t('围道上恰好有极点时需取半个留数（主值），或绕行小半圆', 'If a pole lies exactly on the contour one takes half the residue (principal value) or indents around it'),
            t('支点（分支切割）不能用留数定理直接处理，需沿割线积分', 'Branch points and branch cuts are not handled directly; integrate along the cut instead'),
            t('被积函数在大圆弧上不衰减时围道闭合无效', 'Closing the contour fails when the integrand does not decay on the large arc'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('柯西定理：解析函数的闭积分为零', 'Cauchy theorem: the closed integral of an analytic function vanishes'),
            latex: String.raw `\oint_{C}f(z)\,\mathrm{d}z=0\quad\text{（}f\text{ 在 }C\text{ 内解析）}` },
        { n: 2, op: 'geometry', title: t('在每个奇点周围挖一个小圆，改造围道', 'Punch a small circle around each singularity to modify the contour'),
            latex: String.raw `\oint_{C}f\,\mathrm{d}z=\sum_{k}\oint_{c_{k}}f\,\mathrm{d}z`,
            note: t('把每个奇点用小圆 c_k 挖掉，剩下的区域里 f 处处解析，外圈积分等于各小圈积分之和。', 'Removing each singularity by a small circle c_k leaves a domain where f is analytic everywhere, so the outer integral equals the sum of the small circles.') },
        { n: 3, op: 'identity', title: t('展开 Laurent 级数', 'Expand as a Laurent series'),
            latex: String.raw `f(z)=\sum_{n=-\infty}^{\infty}a_{n}\left(z-z_{0}\right)^{n},\qquad a_{-1}=\operatorname{Res}\!\left(f,z_{0}\right)` },
        { n: 4, op: 'substitute', title: t('沿小圆逐项积分，只有 n = −1 项存活', 'Integrate term by term on the small circle; only n = −1 survives'),
            latex: String.raw `\oint_{c_{k}}\left(z-z_{0}\right)^{n}\mathrm{d}z=\begin{cases}2\pi i,& n=-1\\ 0,& n\neq-1\end{cases}` },
        { n: 5, op: 'result', title: t('得到留数定理', 'Obtain the residue theorem'),
            latex: String.raw `\oint_{C}f(z)\,\mathrm{d}z=\sum_{k}2\pi i\,a_{-1}^{(k)}=2\pi i\sum_{k}\operatorname{Res}\!\left(f,z_{k}\right)` },
        { n: 6, op: 'transform', title: t('应用到 Fourier 反演：因果性决定闭合方向', 'Apply to Fourier inversion: causality decides where to close'),
            latex: String.raw `e^{-i\omega t}=e^{-i(a+ib)t}=e^{-iat}e^{\,bt}\;\Longrightarrow\; t>0\text{ 时须 }b<0\text{（下半平面）}`,
            note: t('这是最关键的一步：要求 t < 0 时响应为零（因果），就必须在下半平面闭合，于是只有下半平面的极点有贡献。', 'This is the crucial step: demanding zero response for t < 0 (causality) forces closure in the lower half-plane, so only lower-half-plane poles contribute.') },
        { n: 7, op: 'result', title: t('极点即衰减模态', 'Poles are decaying modes'),
            latex: String.raw `\omega_{k}=\omega_{k}^{R}-i\frac{\omega_{k}^{R}}{2Q}\;\Longrightarrow\; e^{-i\omega_{k}t}\propto e^{-\frac{\omega_{k}^{R}t}{2Q}}\,\text{（衰减）}` },
    ],
    example: {
        title: t('反演一个洛伦兹型频谱', 'Invert a Lorentzian spectrum'),
        input: t('X(ω) = 1/(ω − ω₀ + iγ)，γ > 0（极点在下半平面）', 'X(ω) = 1/(ω − ω₀ + iγ) with γ > 0 (pole in the lower half-plane)'),
        steps: [
            t('极点：ω = ω₀ − iγ，留数为 1', 'Pole: ω = ω₀ − iγ, residue 1'),
            t('t > 0 时在下半平面闭合，围道顺时针 ⟹ 积分 = −2πi ΣRes', 'For t > 0 close in the lower half-plane; the contour is clockwise so the integral equals −2πi ΣRes'),
            t('x(t) = (1/2π)(−2πi)·e^{−i(ω₀−iγ)t} = −i e^{−iω₀t} e^{−γt}', 'x(t) = (1/2π)(−2πi)·e^{−i(ω₀−iγ)t} = −i e^{−iω₀t} e^{−γt}'),
            t('t < 0 时上半平面无极点 ⟹ x(t) = 0', 'For t < 0 there is no pole in the upper half-plane, so x(t) = 0'),
        ],
        output: t('得到一个因果的、以 γ 为衰减率的阻尼振荡。极点的虚部就是衰减率 —— 这正是从地震记录里反演 Q 的理论依据。', 'A causal damped oscillation with decay rate γ. The imaginary part of the pole is the decay rate, which is the theoretical basis for inverting Q from seismograms.'),
    },
    links: {
        upstream: [
            { id: 'euler-formula', note: t('复指数是围道积分的被积函数核心', 'the complex exponential is the heart of the integrand') },
        ],
        seealso: [
            { id: 'fourier-transform', note: t('反演公式的围道计算', 'contour evaluation of the inversion formula') },
            { id: 'quality-factor-q', note: t('Q 决定极点的虚部', 'Q determines the imaginary part of the poles') },
            { id: 'forced-oscillator-green-function', note: t('阻尼振子的极点位置', 'pole locations of a damped oscillator') },
        ],
    },
    refs: [
        { text: 'Ahlfors, Complex Analysis, 3rd ed., §4.5' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.3' },
    ],
};
export default residueTheorem;
//# sourceMappingURL=residue-theorem.js.map