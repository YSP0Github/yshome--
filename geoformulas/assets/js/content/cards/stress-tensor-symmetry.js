import { t } from '../../core/types.js';
/** stress-tensor-symmetry */
const stressTensorSymmetry = {
    id: 'stress-tensor-symmetry',
    name: t('应力张量的对称性', 'Symmetry of the Stress Tensor'),
    aliases: { zh: ['剪应力互等定理', '角动量平衡', 'σij=σji'], en: ['symmetry of stress', 'reciprocal shear stresses', 'angular momentum balance'] },
    node: 'S1.1',
    tags: {
        math: ['MATH.LINALG', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('应力对称 剪应力互等 角动量平衡 六个独立分量 主轴', 'stress symmetry reciprocal shear angular momentum balance six independent components'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\sigma_{ij}=\sigma_{ji}`,
        variants: [
            { name: t('矩阵形式', 'Matrix form'), latex: String.raw `\boldsymbol{\sigma}=\boldsymbol{\sigma}^{T}=\begin{bmatrix} \sigma_{11} & \sigma_{12} & \sigma_{13}\\ \sigma_{12} & \sigma_{22} & \sigma_{23}\\ \sigma_{13} & \sigma_{23} & \sigma_{33} \end{bmatrix}` },
            { name: t('剪应力互等的三个等式', 'The three reciprocal-shear equalities'), latex: String.raw `\sigma_{12}=\sigma_{21},\qquad \sigma_{23}=\sigma_{32},\qquad \sigma_{31}=\sigma_{13}` },
            { name: t('力矩平衡的积分表述', 'Integral statement of moment balance'), latex: String.raw `\int_{V}\epsilon_{ijk}\,x_j\left(\sigma_{kl,l}+\rho b_k\right)\mathrm{d}V=0\;\Longrightarrow\;\sigma_{ij}=\sigma_{ji}` },
            { name: t('后果：只有 6 个独立分量', 'Consequence: only six independent components'), latex: String.raw `9\;\text{components}\;\longrightarrow\;6\;\text{independent}` },
        ],
    },
    meaning: t('为什么九个应力分量只有六个是独立的？因为如果 σ₁₂ ≠ σ₂₁，一个足够小的岩石微元会被自己的剪应力越转越快，角加速度发散 —— 这在物理上不可能。对称性不是一条经验规律，而是角动量守恒的直接推论；它同时保证了主应力是实数、主轴互相垂直，整座 Mohr 圆与屈服准则的大厦都建在这块地基上。', 'Why are only six of the nine stress components independent? Because if σ₁₂ ≠ σ₂₁, an arbitrarily small element of rock would be spun up by its own shear stresses with an angular acceleration that diverges — physically impossible. Symmetry is not an empirical rule but a direct consequence of angular momentum conservation. It also guarantees real principal stresses and mutually orthogonal principal axes; the whole edifice of Mohr circles and yield criteria rests on this foundation.'),
    symbols: [
        { sym: '\\sigma_{ij}', name: t('应力张量分量', 'stress tensor components'), unit: 'Pa', typical: '10⁶ – 10⁹ Pa' },
        { sym: 'L', name: t('微元的特征边长', 'characteristic edge length of the element'), unit: 'm' },
        { sym: '\\alpha', name: t('角加速度', 'angular acceleration'), unit: 'rad/s²' },
        { sym: '\\epsilon_{ijk}', name: t('Levi-Civita 置换符号（此处不是应变）', 'Levi-Civita permutation symbol (not strain here)'), unit: '', dimension: '无量纲' },
        { sym: 'I', name: t('绕该轴的转动惯量', 'moment of inertia about the axis'), unit: 'kg·m²' },
    ],
    conditions: {
        applies: [
            t('经典（Cauchy）连续介质：力只通过面力传递', 'Classical Cauchy continua where forces are transmitted as tractions only'),
            t('任意尺度，只要介质可视为连续', 'Any scale at which the medium behaves as a continuum'),
        ],
        assumes: [
            t('不存在体力偶与面力偶（无偶应力）', 'No body couples or surface couples exist'),
            t('微元足够小以至于应力可视为常数，转动惯量 ∼ ρL⁵', 'The element is small enough that stress is uniform and the moment of inertia scales as ρL⁵'),
        ],
        breaks: [
            t('Cosserat / 微极介质、含定向裂纹或颗粒转动的介质，σ 可以反对称', 'Cosserat or micropolar media, and media with rotating grains or aligned cracks, allow an antisymmetric σ'),
            t('存在电磁体力偶或表面张力梯度的特殊情形', 'Special cases with electromagnetic body couples or surface-tension gradients'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('取一个边长 L 的立方微元，考察绕 x₃ 轴的力矩', 'Take a cube of edge L and consider the moment about the x₃ axis'),
            latex: String.raw `\sum M_3=I\,\alpha`,
            note: t('只需要盯住 σ₁₂ 与 σ₂₁：绕 x₃ 轴产生力矩的只有作用在 x₁、x₂ 面上的切向力。', 'Only σ₁₂ and σ₂₁ matter: they are the sole shear tractions on the x₁ and x₂ faces that produce a moment about x₃.') },
        { n: 2, op: 'geometry', title: t('力 × 力臂，两个方向相反', 'Force times lever arm, acting in opposite senses'),
            latex: String.raw `\left(\sigma_{12}L^{2}\right)L-\left(\sigma_{21}L^{2}\right)L=I\,\alpha`,
            note: t('力是应力 × 面积 ∼ σL²，力臂是 L，所以力矩 ∼ σL³。', 'Force is stress times area, of order σL², and the lever arm is L, so the moment is of order σL³.') },
        { n: 3, op: 'physics', title: t('转动惯量随尺度衰减更快', 'The moment of inertia shrinks faster with scale'),
            latex: String.raw `I\sim \rho L^{5}\;\Longrightarrow\; \sigma_{12}-\sigma_{21}=\frac{I\alpha}{L^{3}}\sim \rho L^{2}\alpha`,
            note: t('这里 ρL⁵ 是转动惯量的量级（质量 ∼ ρL³，力臂 ∼ L）。除以 L³ 后右边仍带有 L² 因子。', 'Here ρL⁵ is the scaling of the moment of inertia: mass of order ρL³ times a lever arm of order L. After dividing by L³ the right-hand side still carries a factor L².') },
        { n: 4, op: 'algebra', title: t('令 L → 0，右边消失', 'Let L → 0 and the right-hand side vanishes'),
            latex: String.raw `\lim_{L\to 0}\rho L^{2}\alpha=0\;\Longrightarrow\;\sigma_{12}=\sigma_{21}`,
            note: t('注意这一步的微妙之处：若 α 随 L 发散（例如 L⁻² 或更快），结论就不成立 —— 正是微极介质里发生的事。', 'Note the subtlety: if α diverges as L shrinks, for instance as L⁻² or faster, the conclusion fails — precisely what happens in micropolar media.') },
        { n: 5, op: 'result', title: t('轮换指标，得到完整对称性', 'Cycle the indices to obtain full symmetry'),
            latex: String.raw `\sigma_{ij}=\sigma_{ji}\quad\text{for all } i,j`,
            note: t('三次（绕 x₁、x₂、x₃ 各一次）就覆盖了全部三个非对角等式。', 'Applying the argument three times, once about each axis, covers all three off-diagonal equalities.') },
        { n: 6, op: 'result', title: t('最重要的后果：主轴正交、主应力为实数', 'The key consequence: orthogonal axes and real eigenvalues'),
            latex: String.raw `\boldsymbol{\sigma}=\boldsymbol{\sigma}^{T}\;\Longrightarrow\;\exists\,\boldsymbol{Q}:\;\boldsymbol{Q}^{T}\boldsymbol{\sigma}\boldsymbol{Q}=\begin{bmatrix} \sigma_1 & 0 & 0\\ 0 & \sigma_2 & 0\\ 0 & 0 & \sigma_3 \end{bmatrix}`,
            note: t('实对称矩阵的谱定理：这是 Mohr 圆、应力不变量、屈服准则全部成立的前提。', 'The spectral theorem for real symmetric matrices: this is the premise behind Mohr circles, stress invariants and every yield criterion.') },
    ],
    links: {
        upstream: [{ id: 'traction-cauchy-stress', note: t('对称性是关于 σ_ij 本身的论断', 'symmetry is a statement about σ_ij itself') }],
        downstream: [
            { id: 'principal-stress-eigenvalues' },
            { id: 'stress-invariants' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Malvern, Introduction to the Mechanics of a Continuous Medium, §5.3' },
    ],
};
export default stressTensorSymmetry;
//# sourceMappingURL=stress-tensor-symmetry.js.map