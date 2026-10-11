import { t } from '../../core/types.js';
/** index-notation-kronecker */
const indexNotationKronecker = {
    id: 'index-notation-kronecker',
    name: t('Einstein 求和约定、Kronecker δ 与 Levi-Civita 符号', 'Einstein Summation, Kronecker Delta and the Levi-Civita Symbol'),
    aliases: { zh: ['指标记法', '爱因斯坦求和', '张量记法'], en: ['index notation', 'Einstein summation convention', 'Kronecker delta', 'Levi-Civita symbol'] },
    node: 'S0.3',
    tags: {
        math: ['MATH.LINALG', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('爱因斯坦求和 指标记法 Kronecker δ Levi-Civita ε 哑指标 自由指标 张量', 'Einstein summation index notation Kronecker delta Levi-Civita epsilon dummy index free index tensor'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `a_i b_i\equiv\sum_{i=1}^{3}a_i b_i`,
        variants: [
            { name: t('Kronecker δ', 'The Kronecker delta'), latex: String.raw `\delta_{ij}=\begin{cases}1 & i=j\\ 0 & i\neq j\end{cases}` },
            { name: t('δ 的替换（筛选）作用', 'The substitution, or sifting, action of δ'), latex: String.raw `\delta_{ij}a_j=a_i,\qquad \delta_{ij}A_{jk}=A_{ik},\qquad \delta_{ii}=3` },
            { name: t('Levi-Civita 符号', 'The Levi-Civita symbol'), latex: String.raw `\varepsilon_{ijk}=\begin{cases}+1 & (i,j,k)\ \text{为}\ (1,2,3)\ \text{的偶排列}\\ -1 & \text{奇排列}\\ 0 & \text{有重复指标}\end{cases}` },
            { name: t('δ 与 ε 的核心恒等式', 'The central identity linking δ and ε'), latex: String.raw `\varepsilon_{ijk}\varepsilon_{ilm}=\delta_{jl}\delta_{km}-\delta_{jm}\delta_{kl}` },
            { name: t('由此推出的常用缩并', 'Contractions that follow from it'), latex: String.raw `\varepsilon_{ijk}\varepsilon_{ijm}=2\delta_{km},\qquad \varepsilon_{ijk}\varepsilon_{ijk}=6` },
            { name: t('叉积与旋度的指标写法', 'Cross product and curl in index form'), latex: String.raw `(\mathbf{a}\times\mathbf{b})_i=\varepsilon_{ijk}a_jb_k,\qquad (\nabla\times\mathbf{u})_i=\varepsilon_{ijk}\partial_j u_k` },
        ],
    },
    meaning: t('这套记法把三维矢量与张量的所有运算压缩成一两行符号：重复出现的指标自动求和（哑指标），只出现一次的指标是该式的自由指标（决定结果的阶数）。δ_ij 是单位矩阵的抽象，负责「换名」；ε_ijk 是叉积与旋度的抽象，负责「转向」。弹性力学、矩张量、各向异性介质里所有看起来吓人的公式，拆开都是这两个符号在起作用。', 'This notation compresses every operation on three-dimensional vectors and tensors into a line or two: an index appearing twice is summed over automatically, a dummy index, while one appearing once is a free index that fixes the order of the result. δ_ij is the abstraction of the identity matrix and handles renaming; ε_ijk abstracts the cross product and curl and handles orientation. Every intimidating formula in elasticity, moment tensors and anisotropic media turns out, once unpacked, to be these two symbols at work.'),
    symbols: [
        { sym: 'a_i,\\ b_i', name: t('矢量或张量的分量', 'components of a vector or tensor'), unit: '任意' },
        { sym: '\\delta_{ij}', name: t('Kronecker δ（二阶单位张量）', 'the Kronecker delta, the second-order identity tensor'), unit: '1' },
        { sym: '\\varepsilon_{ijk}', name: t('Levi-Civita 完全反对称符号', 'the Levi-Civita totally antisymmetric symbol'), unit: '1' },
        { sym: '\\partial_i', name: t('对第 i 个坐标的偏导 ∂/∂x_i', 'partial derivative with respect to the i-th coordinate'), unit: 'm⁻¹' },
        { sym: '\\lambda,\\ \\mu', name: t('Lamé 常数（μ 也是剪切模量）', 'Lamé constants, μ also being the shear modulus'), unit: 'Pa' },
    ],
    conditions: {
        applies: [
            t('三维欧氏空间（二维时指标取 1, 2，四维时空取 0–3）', 'Three-dimensional Euclidean space; indices run 1, 2 in two dimensions and 0 to 3 in space-time'),
            t('直角正交坐标；曲线坐标下 ∂_i 要换成协变导数', 'Cartesian orthonormal coordinates; in curvilinear coordinates ∂_i becomes a covariant derivative'),
        ],
        assumes: [
            t('同一项内任一指标最多出现两次（出现三次即为笔误）', 'An index appears at most twice within a term; three occurrences is a typo'),
            t('哑指标可以任意改名，只要不与其他指标冲突', 'A dummy index may be renamed freely provided no clash arises'),
            t('右手坐标系下 ε_123 = +1', 'A right-handed system, so that ε_123 = +1'),
        ],
        breaks: [
            t('坐标非正交时上下标的区分变得必不可少，不能只用下指标', 'With non-orthogonal coordinates the distinction between upper and lower indices becomes essential; subscripts alone will not do'),
            t('左右手系混用会使含 ε 的式子整体变号', 'Mixing handedness flips the sign of every expression containing ε'),
            t('重复指标出现在三项及以上时，求和约定失效，必须显式写 Σ', 'When an index occurs three or more times the convention fails and the sum must be written explicitly'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('求和约定：重复的指标自动求和', 'The convention: a repeated index is summed'),
            latex: String.raw `\mathbf{a}\cdot\mathbf{b}=a_1b_1+a_2b_2+a_3b_3=\sum_{i=1}^{3}a_ib_i\equiv a_ib_i`,
            note: t('省掉 Σ 不是偷懒，而是让「哪些指标被缩并」一目了然。', 'Dropping the Σ is not laziness; it makes transparent which indices are contracted.'),
        },
        {
            n: 2,
            op: 'setup',
            title: t('自由指标决定结果的阶数', 'Free indices fix the order of the result'),
            latex: String.raw `A_{ij}b_j\ \text{的自由指标是}\ i\ \Longrightarrow\ \text{结果是一个矢量}`,
            note: t('检查公式是否正确的第一件事：左右两边自由指标必须完全一致。', 'The first check on any formula: the free indices on both sides must match exactly.'),
        },
        {
            n: 3,
            op: 'identity',
            title: t('引入 δ_ij 并验证其替换作用', 'Introduce δ_ij and verify its substitution action'),
            latex: String.raw `\delta_{ij}a_j=\delta_{i1}a_1+\delta_{i2}a_2+\delta_{i3}a_3=a_i`,
            note: t('δ 的作用就是把 j 换成 i，所以也叫「换名算子」。', 'δ simply renames j as i, which is why it is called the substitution operator.'),
        },
        {
            n: 4,
            op: 'identity',
            title: t('缩并 δ 的迹等于空间维数', 'Contracting δ gives the trace, equal to the dimension'),
            latex: String.raw `\delta_{ii}=\delta_{11}+\delta_{22}+\delta_{33}=3`,
        },
        {
            n: 5,
            op: 'identity',
            title: t('δ 与 ε 的核心恒等式（展开验证）', 'The central δ–ε identity, verified by expansion'),
            latex: String.raw `\varepsilon_{ijk}\varepsilon_{ilm}=\delta_{jl}\delta_{km}-\delta_{jm}\delta_{kl}`,
            note: t('对 i 求和后左边只剩两个自由指标，右边必须也能写成两个自由指标的形式；逐项代入 1,2,3 即可验证。', 'Summing over i leaves two free indices, so the right side must be expressible with two as well; substituting 1, 2, 3 case by case verifies it.'),
        },
        {
            n: 6,
            op: 'algebra',
            title: t('缩并一次得到常用公式', 'Contracting once gives the frequently used formula'),
            latex: String.raw `\varepsilon_{ijk}\varepsilon_{ijm}=2\delta_{km},\qquad \varepsilon_{ijk}\varepsilon_{ijk}=6`,
            note: t('这两个结果在化简任何含叉积双乘积的式子时都会用到。', 'Both results are used whenever an expression contains a double cross product.'),
        },
        {
            n: 7,
            op: 'result',
            title: t('实战：各向同性弹性本构的指标写法', 'In practice: the index form of the isotropic elastic law'),
            latex: String.raw `\sigma_{ij}=\lambda\,\delta_{ij}\,\varepsilon_{kk}+2\mu\,\varepsilon_{ij}`,
            note: t('括号里每一项都符合「自由指标 i, j；其余指标成对出现」的规则 —— 这就是这种记法的全部语法。', 'Every term obeys the rule that i and j are free while all other indices appear in pairs: that is the entire grammar of the notation.'),
        },
    ],
    example: {
        title: t('用恒等式化简一个双重叉积', 'Simplifying a double cross product with the identity'),
        input: t('化简 a × (b × c)', 'Simplify a × (b × c)'),
        steps: [
            t('写成指标式：[a × (b × c)]_i = ε_ijk a_j (ε_klm b_l c_m)', 'In index form: [a × (b × c)]_i = ε_ijk a_j (ε_klm b_l c_m)'),
            t('调整 ε 的顺序：ε_ijk ε_klm = ε_kij ε_klm = δ_il δ_jm − δ_im δ_jl', 'Reorder the epsilons: ε_ijk ε_klm = ε_kij ε_klm = δ_il δ_jm − δ_im δ_jl'),
            t('代回：= a_j b_i c_j − a_j b_j c_i', 'Substituting back: a_j b_i c_j − a_j b_j c_i'),
        ],
        output: t('即 b (a·c) − c (a·b)，就是熟知的 BAC−CAB 法则', 'That is b (a·c) − c (a·b), the familiar BAC minus CAB rule'),
    },
    links: {
        downstream: [
            { id: 'gradient', note: t('∂_i f', '∂_i f') },
            { id: 'curl', note: t('ε_ijk ∂_j u_k', 'ε_ijk ∂_j u_k') },
            { id: 'divergence-theorem', note: t('分量形式的定理', 'the theorem in component form') },
            { id: 'stokes-theorem', note: t('分量形式的定理', 'the theorem in component form') },
        ],
        seealso: [{ id: 'hookes-law-isotropic' }],
    },
    refs: [
        { text: 'Arfken, Weber & Harris, Mathematical Methods for Physicists, 7th ed., §2.6' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default indexNotationKronecker;
//# sourceMappingURL=index-notation-kronecker.js.map