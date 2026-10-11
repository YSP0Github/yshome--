import { t } from '../../core/types.js';
/** principal-stress-eigenvalues */
const principalStressEigenvalues = {
    id: 'principal-stress-eigenvalues',
    name: t('主应力与特征值方程', 'Principal Stresses and the Eigenvalue Equation'),
    aliases: { zh: ['主应力', '特征方程', '主轴'], en: ['principal stress', 'characteristic equation', 'principal axes', 'eigenvalues'] },
    node: 'S1.1',
    tags: {
        math: ['MATH.LINALG', 'MATH.ROOT'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('主应力 特征值 特征方程 主轴 行列式 对角化 最大主应力', 'principal stress eigenvalue characteristic equation principal axes diagonalisation'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\det\!\left(\boldsymbol{\sigma}-\lambda\boldsymbol{I}\right)=0`,
        variants: [
            { name: t('分量写法', 'Index notation'), latex: String.raw `\det\!\left(\sigma_{ij}-\lambda\delta_{ij}\right)=0` },
            { name: t('展开后的三次方程（特征多项式）', 'The expanded cubic (characteristic polynomial)'), latex: String.raw `\lambda^{3}-I_1\lambda^{2}+I_2\lambda-I_3=0` },
            { name: t('二维显式解', 'Explicit two-dimensional solution'), latex: String.raw `\sigma_{1,2}=\frac{\sigma_{11}+\sigma_{22}}{2}\pm\sqrt{\left(\frac{\sigma_{11}-\sigma_{22}}{2}\right)^{2}+\sigma_{12}^{2}}` },
            { name: t('主轴方向（二维转角）', 'Principal direction (rotation angle in 2D)'), latex: String.raw `\tan 2\theta_p=\frac{2\sigma_{12}}{\sigma_{11}-\sigma_{22}}` },
            { name: t('主轴上的应力张量', 'The stress tensor on its principal axes'), latex: String.raw `\boldsymbol{\sigma}=\begin{bmatrix} \sigma_1 & 0 & 0\\ 0 & \sigma_2 & 0\\ 0 & 0 & \sigma_3 \end{bmatrix},\qquad \sigma_1\ge\sigma_2\ge\sigma_3` },
        ],
    },
    meaning: t('在任意应力状态下，总存在三个互相垂直的方向，其截面上只有拉压、没有剪切。这三个方向就是应力张量的特征方向，对应的三个数值就是主应力 —— 它们是坐标无关的「真身」，任何张量分量矩阵都只是它们穿上某件坐标系外衣之后的样子。地震学中，震源机制解给出的 P、B、T 轴正是这三个方向。', 'In any stress state there exist three mutually orthogonal directions on which the traction is purely compressional or tensional, with no shear. These are the eigendirections of the stress tensor and the three values are the principal stresses — coordinate-independent quantities of which any component matrix is merely a rotated disguise. In seismology the P, B and T axes of a focal mechanism are exactly these three directions.'),
    symbols: [
        { sym: '\\lambda', name: t('特征值（此处即主应力，不是 Lamé 常数）', 'eigenvalue (here the principal stress, not the Lamé constant)'), unit: 'Pa', typical: '10⁶ – 10⁹ Pa' },
        { sym: '\\sigma_1,\\sigma_2,\\sigma_3', name: t('最大、中间、最小主应力（压为正时符号相反）', 'maximum, intermediate and minimum principal stresses'), unit: 'Pa' },
        { sym: '\\delta_{ij}', name: t('Kronecker δ（单位矩阵）', 'Kronecker delta (identity matrix)'), unit: '', dimension: '无量纲' },
        { sym: 'n_j', name: t('主方向（特征矢量）的分量', 'components of the principal direction (eigenvector)'), unit: '', dimension: '无量纲' },
        { sym: '\\theta_p', name: t('主方向与 x₁ 轴的夹角', 'angle between a principal direction and the x₁ axis'), unit: 'rad' },
        { sym: 'I_1,I_2,I_3', name: t('应力不变量', 'stress invariants'), unit: 'Pa, Pa², Pa³' },
    ],
    conditions: {
        applies: [
            t('任意（对称的）应力状态，二维或三维', 'Any symmetric stress state, in 2D or 3D'),
            t('寻找最大/最小正应力或零剪应力的方向', 'Whenever the extremal normal stress or the shear-free directions are needed'),
        ],
        assumes: [
            t('σ 为实对称矩阵（由角动量平衡保证），因此特征值全为实数、特征矢量正交', 'σ is real symmetric, guaranteed by angular momentum balance, so eigenvalues are real and eigenvectors orthogonal'),
            t('约定 σ₁ ≥ σ₂ ≥ σ₃；地震学常取压为正，工程力学常取拉为正', 'The ordering σ₁ ≥ σ₂ ≥ σ₃ is assumed; seismology usually takes compression positive while engineering takes tension positive'),
        ],
        breaks: [
            t('σ 不对称（微极介质）时特征值可能为复数', 'If σ is not symmetric the eigenvalues may be complex'),
            t('特征值重根（σ₁ = σ₂，如静水压力）时主方向不唯一，任意正交基都可', 'With repeated eigenvalues, as under hydrostatic pressure, the principal directions are not unique and any orthogonal basis works'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('主平面的定义：只有正应力，没有剪应力', 'A principal plane carries normal stress only'),
            latex: String.raw `\boldsymbol{t}=\sigma_n\,\hat{\boldsymbol{n}}\quad\Longleftrightarrow\quad \boldsymbol{t}\times\hat{\boldsymbol{n}}=\boldsymbol{0}`,
            note: t('换句话说：在这个面上，力的方向和面的法向平行，切向分量为零。', 'In other words, on this plane the force is parallel to the normal and the tangential component vanishes.') },
        { n: 2, op: 'substitute', title: t('把 Cauchy 公式代进去，σ_n 改记为 λ', 'Substitute Cauchy’s formula and rename σ_n as λ'),
            latex: String.raw `\sigma_{ij}n_j=\lambda\,n_i=\lambda\,\delta_{ij}n_j`,
            note: t('因为 n_i = δ_ij n_j，把右端也写成乘法形式，才能合并同类项。', 'Since n_i = δ_ij n_j, the right-hand side is rewritten in multiplicative form so the terms can be collected.') },
        { n: 3, op: 'algebra', title: t('移项，得到齐次线性方程组', 'Rearrange into a homogeneous linear system'),
            latex: String.raw `\left(\sigma_{ij}-\lambda\delta_{ij}\right)n_j=0` },
        { n: 4, op: 'identity', title: t('非零解存在 ⟺ 系数矩阵奇异', 'A non-zero solution exists if and only if the matrix is singular'),
            latex: String.raw `\det\!\left(\sigma_{ij}-\lambda\delta_{ij}\right)=0`,
            note: t('这是线性代数里最有用的一句话：n = 0 永远是解（平凡解），而物理上我们需要 n ≠ 0 的单位法向，所以行列式必须为零。', 'One of the most useful statements in linear algebra: n = 0 is always a solution, but physically we need a unit normal with n ≠ 0, so the determinant must vanish.') },
        { n: 5, op: 'algebra', title: t('展开行列式，得到三次特征多项式', 'Expand the determinant into a cubic polynomial'),
            latex: String.raw `-\lambda^{3}+I_1\lambda^{2}-I_2\lambda+I_3=0`,
            note: t('三个系数恰好就是三个应力不变量 —— 它们与坐标系无关，所以主应力也必然与坐标系无关。', 'The three coefficients are precisely the three stress invariants; since they are coordinate-free, so are the principal stresses.') },
        { n: 6, op: 'result', title: t('求出 λ 后回代求主方向', 'Back-substitute each root to get its direction'),
            latex: String.raw `\left(\sigma_{ij}-\sigma_{(\alpha)}\delta_{ij}\right)n_j^{(\alpha)}=0,\qquad \hat{\boldsymbol{n}}^{(\alpha)}\cdot\hat{\boldsymbol{n}}^{(\beta)}=\delta_{\alpha\beta}`,
            note: t('不同的特征值对应的特征矢量自动正交（对称矩阵的性质），这就是「三个互相垂直的方向」。', 'Eigenvectors belonging to distinct eigenvalues are automatically orthogonal for a symmetric matrix, which is exactly the statement of three mutually perpendicular directions.') },
    ],
    viz: [
        {
            id: 'eigenvalue-avoided-crossing',
            level: 'V1',
            title: t('剪应力如何推开两个主应力', 'How shear stress pushes the two principal stresses apart'),
            xlabel: t('剪应力分量 σ₁₂ (MPa)', 'shear component σ₁₂ (MPa)'),
            ylabel: t('主应力 (MPa)', 'principal stress (MPa)'),
            controls: [
                { id: 'pxx', label: t('σ₁₁', 'σ₁₁'), min: -200, max: 200, step: 5, value: 100, unit: 'MPa' },
                { id: 'pyy', label: t('σ₂₂', 'σ₂₂'), min: -200, max: 200, step: 5, value: 40, unit: 'MPa' },
            ],
            xRange: [-100, 100],
            note: t('两条曲线永远不会相交：即使 σ₁₁ = σ₂₂，一点点剪应力也会立刻把主应力撑开 ±|σ₁₂|。这就是「应力状态不能只用两个正应力描述」的直观图像；两个主应力之差决定了最大剪应力。', 'The two curves never cross: even when σ₁₁ = σ₂₂, a little shear immediately splits the principal values by ±|σ₁₂|. This is the visual statement that a stress state cannot be captured by two normal stresses alone; the gap between the principal stresses sets the maximum shear stress.'),
            compute: (p) => {
                const sxx = p['pxx'], syy = p['pyy'];
                const mid = (sxx + syy) / 2;
                const half = (sxx - syy) / 2;
                const s1 = [];
                const s2 = [];
                for (let i = 0; i <= 400; i++) {
                    const sxy = -100 + (i / 400) * 200;
                    const r = Math.sqrt(half * half + sxy * sxy);
                    s1.push([sxy, mid + r]);
                    s2.push([sxy, mid - r]);
                }
                const flat1 = [[-100, sxx], [100, sxx]];
                const flat2 = [[-100, syy], [100, syy]];
                return [
                    { label: t('最大主应力 σ₁', 'maximum principal stress σ₁'), color: '#185FA5', points: s1 },
                    { label: t('最小主应力 σ₂', 'minimum principal stress σ₂'), color: '#993C1D', points: s2 },
                    { label: t('σ₁₁（对角元）', 'σ₁₁ (diagonal entry)'), color: '#B4B2A9', dash: true, points: flat1 },
                    { label: t('σ₂₂（对角元）', 'σ₂₂ (diagonal entry)'), color: '#B4B2A9', dash: true, points: flat2 },
                ];
            },
        },
    ],
    example: {
        title: t('二维应力状态的主应力', 'Principal stresses of a 2D stress state'),
        input: t('σ₁₁ = 100 MPa，σ₂₂ = 40 MPa，σ₁₂ = 30 MPa。', 'σ₁₁ = 100 MPa, σ₂₂ = 40 MPa, σ₁₂ = 30 MPa.'),
        steps: [
            t('中心 = (100 + 40)/2 = 70 MPa；半差 = (100 − 40)/2 = 30 MPa', 'centre = (100 + 40)/2 = 70 MPa; half-difference = (100 − 40)/2 = 30 MPa'),
            t('半径 = √(30² + 30²) = 42.4 MPa', 'radius = √(30² + 30²) = 42.4 MPa'),
            t('σ₁ = 70 + 42.4 = 112.4 MPa，σ₂ = 70 − 42.4 = 27.6 MPa', 'σ₁ = 70 + 42.4 = 112.4 MPa, σ₂ = 70 − 42.4 = 27.6 MPa'),
            t('tan 2θ_p = 2×30/(100 − 40) = 1.0 ⟹ θ_p = 22.5°', 'tan 2θ_p = 2×30/(100 − 40) = 1.0, hence θ_p = 22.5°'),
        ],
        output: t('把坐标绕 x₃ 轴旋转 22.5°，剪应力分量归零，只剩 112.4 与 27.6 MPa 两个主应力；最大剪应力为 (σ₁ − σ₂)/2 = 42.4 MPa。', 'Rotating the frame by 22.5° about x₃ annihilates the shear component and leaves 112.4 and 27.6 MPa; the maximum shear stress is (σ₁ − σ₂)/2 = 42.4 MPa.'),
    },
    links: {
        upstream: [
            { id: 'traction-cauchy-stress', note: t('τ = 0 的定义来自牵引力分解', 'the τ = 0 condition comes from splitting the traction') },
            { id: 'stress-tensor-symmetry' },
        ],
        downstream: [
            { id: 'stress-invariants' },
            { id: 'mohr-circle-max-shear' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Jaeger, Cook & Zimmerman, Fundamentals of Rock Mechanics, 4th ed., §2.3' },
    ],
};
export default principalStressEigenvalues;
//# sourceMappingURL=principal-stress-eigenvalues.js.map