import { t } from '../../core/types.js';
/** voigt-notation-stiffness-matrix */
const voigtNotationStiffnessMatrix = {
    id: 'voigt-notation-stiffness-matrix',
    name: t('Voigt 记法与 6×6 刚度矩阵', 'Voigt Notation and the 6×6 Stiffness Matrix'),
    aliases: {
        zh: ['Voigt 矩阵', '工程应变记法', '刚度矩阵'],
        en: ['Voigt notation', 'engineering strain convention', 'stiffness matrix', 'contracted notation'],
    },
    node: 'S1.6',
    tags: {
        subject: 'S1.6',
        math: ['MATH.LINALG'],
        method: ['METH.STRUCT', 'METH.ROCK'],
        quantity: ['Q.TENSOR', 'Q.MAT'],
        keywords: t('Voigt 记法 6乘6 刚度矩阵 工程应变 指标压缩 双指标 单指标', 'Voigt notation 6x6 stiffness matrix engineering strain contracted indices index pair'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\sigma_{I}=C_{IJ}\,\varepsilon_{J},\qquad I,J=1,\dots,6`,
        variants: [
            {
                name: t('指标对 → 单指标的约定', 'The index-pair to single-index mapping'),
                latex: String.raw `11\to1,\quad 22\to2,\quad 33\to3,\quad 23=32\to4,\quad 13=31\to5,\quad 12=21\to6`,
            },
            {
                name: t('完整的 6×6 刚度矩阵', 'The full 6×6 stiffness matrix'),
                latex: String.raw `\begin{bmatrix}\sigma_1\\ \sigma_2\\ \sigma_3\\ \sigma_4\\ \sigma_5\\ \sigma_6\end{bmatrix}=\begin{bmatrix}C_{11}&C_{12}&C_{13}&C_{14}&C_{15}&C_{16}\\ C_{12}&C_{22}&C_{23}&C_{24}&C_{25}&C_{26}\\ C_{13}&C_{23}&C_{33}&C_{34}&C_{35}&C_{36}\\ C_{14}&C_{24}&C_{34}&C_{44}&C_{45}&C_{46}\\ C_{15}&C_{25}&C_{35}&C_{45}&C_{55}&C_{56}\\ C_{16}&C_{26}&C_{36}&C_{46}&C_{56}&C_{66}\end{bmatrix}\begin{bmatrix}\varepsilon_1\\ \varepsilon_2\\ \varepsilon_3\\ \varepsilon_4\\ \varepsilon_5\\ \varepsilon_6\end{bmatrix}`,
            },
            {
                name: t('工程应变约定（剪应变带因子 2，剪应力不带）', 'Engineering-strain convention (factor 2 in strain, none in stress)'),
                latex: String.raw `\begin{aligned}\varepsilon_1&=\varepsilon_{11},&\varepsilon_2&=\varepsilon_{22},&\varepsilon_3&=\varepsilon_{33},\\ \varepsilon_4&=2\varepsilon_{23},&\varepsilon_5&=2\varepsilon_{13},&\varepsilon_6&=2\varepsilon_{12},\end{aligned}\qquad \sigma_4=\sigma_{23},\ \sigma_5=\sigma_{13},\ \sigma_6=\sigma_{12}`,
            },
            {
                name: t('应变能在 Voigt 记法下保持简洁形式', 'Strain energy keeps a compact form in Voigt notation'),
                latex: String.raw `W=\frac{1}{2}\,\sigma_{I}\,\varepsilon_{I}=\frac{1}{2}\,C_{IJ}\,\varepsilon_{I}\,\varepsilon_{J}`,
            },
        ],
    },
    meaning: t('Voigt 记法把四阶张量的双指标压缩成单指标，于是本构关系变成一个 6×6 矩阵乘法 —— 这是所有各向异性地震学文献、岩石物理手册和数值代码的通用书写方式。代价是：剪应变分量被人为放大了 2 倍，而剪应力没有，所以 C_IJ 并不是一个真正的二阶张量，坐标旋转时必须回到四阶张量去算。', 'Voigt notation contracts the index pairs of a fourth-rank tensor into single indices, turning the constitutive law into a 6×6 matrix product — the universal writing convention of anisotropic seismology, rock-physics handbooks and numerical codes. The price is that shear-strain components are artificially doubled while shear stresses are not, so C_IJ is not a true second-rank tensor and coordinate rotation must be done on the fourth-rank tensor.'),
    symbols: [
        { sym: 'C_{IJ}', name: t('Voigt 记法下的刚度矩阵元', 'stiffness-matrix entry in Voigt notation'), unit: 'Pa', typical: '10⁹ – 10¹¹' },
        { sym: '\\sigma_I', name: t('Voigt 应力分量', 'Voigt stress component'), unit: 'Pa' },
        { sym: '\\varepsilon_I', name: t('Voigt 应变分量（工程应变）', 'Voigt strain component (engineering strain)'), unit: '1' },
        { sym: 'W', name: t('单位体积应变能', 'strain energy per unit volume'), unit: 'J/m³' },
    ],
    conditions: {
        applies: [
            t('三斜及更高对称性的线性弹性介质', 'Linearly elastic media of triclinic or higher symmetry'),
            t('固定在一个给定的笛卡尔坐标系内书写', 'Written with respect to one fixed Cartesian reference frame'),
        ],
        assumes: [
            t('采用工程应变约定（剪应变含因子 2）；若改用张量应变，矩阵元需乘 2 或 4', 'The engineering-strain convention is adopted (shear strain carries a factor 2); with tensor strain the matrix entries must be multiplied by 2 or 4'),
            t('应力与应变的分量按同一组基矢量排列', 'Stress and strain components are ordered with respect to the same basis vectors'),
        ],
        breaks: [
            t('坐标旋转：C_IJ 不满足二阶张量变换律，必须回到 C_ijkl 用四元变换', 'Coordinate rotation: C_IJ does not obey second-rank tensor transformation; one must go back to C_ijkl and apply the four-index transformation'),
            t('若需要在旋转后的框架里保持张量性质，应使用 Mandel（正交归一化）记法', 'If tensor character must survive rotation, use Mandel (orthonormal) notation instead'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('双指标 (ij) 只有 6 种组合，压成单指标', 'The index pair (ij) has only 6 combinations; contract it'),
            latex: String.raw `(ij):\quad 11\to1,\ 22\to2,\ 33\to3,\ 23=32\to4,\ 13=31\to5,\ 12=21\to6`,
            note: t('次对称性 C_ijkl = C_jikl = C_ijlk 保证了 (ij) 与 (ji) 等价，压缩不丢信息。', 'The minor symmetries C_ijkl = C_jikl = C_ijlk guarantee that (ij) and (ji) are equivalent, so the contraction loses no information.'),
        },
        {
            n: 2,
            op: 'substitute',
            title: t('张量求和写成矩阵乘法', 'Rewrite the tensor contraction as a matrix product'),
            latex: String.raw `\sigma_{ij}=C_{ijkl}\varepsilon_{kl}\;\Longrightarrow\;\sigma_{I}=C_{IJ}\varepsilon_{J},\qquad C_{IJ}\equiv C_{ijkl}`,
            note: t('此时 C_IJ 有 36 个分量；主对称性 C_ijkl = C_klij 再给出 C_IJ = C_JI，独立数降到 21。', 'At this stage C_IJ has 36 components; the major symmetry C_ijkl = C_klij further gives C_IJ = C_JI, reducing the count to 21.'),
        },
        {
            n: 3,
            op: 'identity',
            title: t('剪应变的因子 2：为了不重复计数，也为了让能量式好看', 'The factor of 2 in shear strain: to avoid double counting and to keep the energy expression clean'),
            latex: String.raw `\varepsilon_4=2\varepsilon_{23},\quad \varepsilon_5=2\varepsilon_{13},\quad \varepsilon_6=2\varepsilon_{12}`,
            note: t('张量求和里 σ_23 ε_23 与 σ_32 ε_32 是同一项被算了两次；把剪应变加倍、剪应力不加倍，就自动抵消掉重复。', 'In the tensor sum, σ_23 ε_23 and σ_32 ε_32 are the same term counted twice. Doubling the shear strain but not the shear stress cancels the duplication automatically.'),
        },
        {
            n: 4,
            op: 'algebra',
            title: t('验证能量表达式一致', 'Verify that the energy expression is consistent'),
            latex: String.raw `W=\frac{1}{2}\sigma_{ij}\varepsilon_{ij}=\frac{1}{2}\big(\sigma_{11}\varepsilon_{11}+\sigma_{22}\varepsilon_{22}+\sigma_{33}\varepsilon_{33}+2\sigma_{23}\varepsilon_{23}+2\sigma_{13}\varepsilon_{13}+2\sigma_{12}\varepsilon_{12}\big)=\frac{1}{2}\sigma_{I}\varepsilon_{I}`,
            note: t('三个剪项各出现两次（kl 与 lk），合并后正好等于 σ_4ε_4 等三项 —— 这就是因子 2 的全部理由。', 'Each of the three shear terms appears twice (kl and lk); combining them yields exactly σ_4ε_4 and its two companions. That is the entire rationale for the factor 2.'),
        },
        {
            n: 5,
            op: 'result',
            title: t('写成矩阵形式', 'Write it out as a matrix'),
            latex: String.raw `\boldsymbol{\sigma}=\mathbf{C}\,\boldsymbol{\varepsilon},\qquad \mathbf{C}=\begin{bmatrix}C_{11}&C_{12}&C_{13}&C_{14}&C_{15}&C_{16}\\ C_{12}&C_{22}&C_{23}&C_{24}&C_{25}&C_{26}\\ C_{13}&C_{23}&C_{33}&C_{34}&C_{35}&C_{36}\\ C_{14}&C_{24}&C_{34}&C_{44}&C_{45}&C_{46}\\ C_{15}&C_{25}&C_{35}&C_{45}&C_{55}&C_{56}\\ C_{16}&C_{26}&C_{36}&C_{46}&C_{56}&C_{66}\end{bmatrix}`,
            note: t('对角线在对称化后已经写出（C_IJ = C_JI）。矩阵对称 ⟹ 特征值为实数 ⟹ Christoffel 方程给出三个实数波速平方。', 'The symmetrized form (C_IJ = C_JI) is shown explicitly. A symmetric matrix has real eigenvalues, which is why the Christoffel equation yields three real squared velocities.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('旋转时必须回到四阶张量', 'Rotation must be done on the fourth-rank tensor'),
            latex: String.raw `C'_{ijkl}=Q_{ip}\,Q_{jq}\,Q_{kr}\,Q_{ls}\,C_{pqrs},\qquad \mathbf{C}'\neq \mathbf{Q}\mathbf{C}\mathbf{Q}^{T}`,
            note: t('这是 Voigt 记法最常见的踩坑点：6×6 矩阵不能按二阶张量那样做相似变换。', 'This is the most common pitfall of Voigt notation: the 6×6 matrix cannot be rotated by a second-rank similarity transform.'),
        },
    ],
    links: {
        upstream: [{ id: 'anisotropic-stiffness-symmetries', note: t('次对称性是压缩指标的前提', 'minor symmetries are the prerequisite for contracting indices') }],
        downstream: [
            { id: 'vti-elastic-constants', note: t('VTI 的 5 常数矩阵', 'the five-constant VTI matrix') },
            { id: 'christoffel-equation', note: t('Christoffel 矩阵由 C_ijkl 与传播方向构造', 'the Christoffel matrix is built from C_ijkl and the propagation direction') },
        ],
        seealso: [{ id: 'hookes-law-isotropic', note: t('各向同性时矩阵只剩两个独立元', 'in the isotropic case only two independent entries remain') }],
    },
    refs: [
        { text: 'Nye, Physical Properties of Crystals, Oxford University Press, §VIII' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
        { text: 'Voigt, Lehrbuch der Kristallphysik (1910)' },
    ],
};
export default voigtNotationStiffnessMatrix;
//# sourceMappingURL=voigt-notation-stiffness-matrix.js.map