import { t } from '../../core/types.js';
/** strain-compatibility */
const strainCompatibility = {
    id: 'strain-compatibility',
    name: t('应变协调（相容）方程', 'The Strain Compatibility Equations'),
    aliases: { zh: ['相容方程', '协调方程', 'Saint-Venant 条件'], en: ['compatibility equations', 'Saint-Venant compatibility', 'integrability conditions'] },
    node: 'S1.2',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('相容方程 协调条件 Saint-Venant 位移单值 位错 本征应变 裂纹', 'compatibility Saint-Venant single-valued displacement dislocation eigenstrain crack'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\varepsilon_{ij,kl}+\varepsilon_{kl,ij}-\varepsilon_{ik,jl}-\varepsilon_{jl,ik}=0`,
        variants: [
            { name: t('二维（最常用的一个）', 'The two-dimensional form, the one most often used'), latex: String.raw `\frac{\partial^{2}\varepsilon_{11}}{\partial x_2^{2}}+\frac{\partial^{2}\varepsilon_{22}}{\partial x_1^{2}}=2\,\frac{\partial^{2}\varepsilon_{12}}{\partial x_1\partial x_2}` },
            { name: t('三维展开后的六个独立方程', 'The six independent equations in three dimensions'), latex: String.raw `\varepsilon_{11,22}+\varepsilon_{22,11}=2\varepsilon_{12,12},\quad \varepsilon_{22,33}+\varepsilon_{33,22}=2\varepsilon_{23,23},\quad \varepsilon_{33,11}+\varepsilon_{11,33}=2\varepsilon_{31,31}` },
            { name: t('其余三个（含混合导数）', 'The remaining three, with mixed derivatives'), latex: String.raw `\varepsilon_{12,33}+\varepsilon_{33,12}=\varepsilon_{13,23}+\varepsilon_{23,13},\quad \text{and cyclic permutations}` },
            { name: t('Beltrami 形式（用应力写）', 'Beltrami form, written with stress'), latex: String.raw `\nabla^{2}\sigma_{ij}+\frac{1}{1+\nu}\,\sigma_{kk,ij}=0\quad (\text{无体力})` },
            { name: t('不成立时：需要本征应变', 'When it fails: an eigenstrain is required'), latex: String.raw `\varepsilon_{ij}=\frac{1}{2}\left(\partial_j u_i+\partial_i u_j\right)+\varepsilon_{ij}^{\ast}` },
        ],
    },
    meaning: t('这不是一条「物理定律」，而是一道体检：随便写六个函数当作应变分量，多半根本找不到任何位移场能产生它们。六个分量来自三个位移分量，所以必须满足这组二阶偏微分方程，位移才能单值可积。断层错动、位错、热膨胀、相变都会让它在局部失效 —— 那些「多出来的应变」就是本征应变，也正是矩张量要描述的东西。', 'This is not a law of physics but a medical check-up. Write down six arbitrary functions as strain components and, more often than not, no displacement field can produce them. Six components come from three displacement components, so this set of second-order PDEs must hold before the displacement can be single-valued and integrable. Fault slip, dislocations, thermal expansion and phase transitions all make it fail locally, and the surplus strain is the eigenstrain — precisely what the moment tensor exists to describe.'),
    symbols: [
        { sym: '\\varepsilon_{ij,kl}', name: t('应变分量的二阶偏导：∂²ε_ij/∂x_k∂x_l', 'second partial derivative of a strain component, ∂²ε_ij/∂x_k∂x_l'), unit: 'm⁻²' },
        { sym: 'u_i', name: t('位移分量', 'displacement component'), unit: 'm' },
        { sym: '\\varepsilon^{\\ast}_{ij}', name: t('本征应变（位错、热、相变等非弹性部分）', 'eigenstrain, the inelastic part from dislocations, heat or phase change'), unit: '', dimension: '无量纲' },
        { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲' },
        { sym: 'b_i', name: t('Burgers 矢量（位错的错动量）', 'Burgers vector, the slip carried by a dislocation'), unit: 'm' },
    ],
    conditions: {
        applies: [
            t('检验给定的应变场是否真的可以由某个连续位移场产生', 'Checking whether a given strain field can really come from some continuous displacement field'),
            t('用应力函数法求解弹性问题时（Beltrami 形式）', 'Solving elasticity with stress functions, via the Beltrami form'),
        ],
        assumes: [
            t('小应变；位移场二阶连续可微', 'Small strain with a twice continuously differentiable displacement field'),
            t('单连通域：多连通域上还需要额外的环路积分条件', 'A simply connected domain; multiply connected domains need extra loop-integral conditions'),
        ],
        breaks: [
            t('跨断层面：位移间断，环路积分 ∮du_i = b_i ≠ 0，相容方程失效', 'Across a fault the displacement jumps, the loop integral ∮du_i = b_i is non-zero and compatibility fails'),
            t('位错、晶格缺陷、热膨胀、孔隙压实等非弹性应变源', 'Dislocations, lattice defects, thermal expansion and pore compaction act as inelastic strain sources'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('提出问题：六个分量，三个自由度', 'Pose the problem: six components, three degrees of freedom'),
            latex: String.raw `\varepsilon_{ij}(\boldsymbol{x})\ \text{given}\quad \stackrel{?}{\Longrightarrow}\quad \exists\ \boldsymbol{u}(\boldsymbol{x})`,
            note: t('方程组 ε_ij = ½(u_i,j + u_j,i) 是六个方程、三个未知函数的超定系统，因此必须有相容条件。', 'The system ε_ij = ½(u_i,j + u_j,i) is six equations for three unknown functions, an overdetermined system that demands compatibility conditions.') },
        { n: 2, op: 'identity', title: t('策略：对 ε 再求导，把 u 的三阶导数配对消掉', 'Strategy: differentiate ε again and cancel the third derivatives of u in pairs'),
            latex: String.raw `\varepsilon_{ij,kl}=\frac{1}{2}\left(u_{i,jkl}+u_{j,ikl}\right)` },
        { n: 3, op: 'substitute', title: t('把四项按系数排列代入相容式', 'Substitute the four terms with their coefficients'),
            latex: String.raw `\begin{aligned} &\varepsilon_{ij,kl}+\varepsilon_{kl,ij}-\varepsilon_{ik,jl}-\varepsilon_{jl,ik}\\ &=\frac{1}{2}\left(u_{i,jkl}+u_{j,ikl}+u_{k,lij}+u_{l,kij}-u_{i,kjl}-u_{k,ijl}-u_{j,lik}-u_{l,jik}\right) \end{aligned}` },
        { n: 4, op: 'identity', title: t('偏导数可交换，八项两两抵消', 'Partial derivatives commute, so the eight terms cancel in pairs'),
            latex: String.raw `u_{i,jkl}=u_{i,kjl},\quad u_{j,ikl}=u_{j,lik},\quad u_{k,lij}=u_{k,ijl},\quad u_{l,kij}=u_{l,jik}`,
            note: t('下标顺序无关紧要，因为 u 光滑。于是上一步的括号恒等于零 —— 这就证明了必要性。', 'The order of the subscripts is irrelevant because u is smooth, so the bracket in the previous step vanishes identically. That proves necessity.') },
        { n: 5, op: 'algebra', title: t('写出二维那一个：i=1, j=1, k=2, l=2', 'Specialise to i=1, j=1, k=2, l=2 for the 2D case'),
            latex: String.raw `2\varepsilon_{11,22}+2\varepsilon_{22,11}-2\varepsilon_{12,12}-2\varepsilon_{12,12}=0`,
            note: t('化简后就是课本里最常见的那个式子，左端四个二阶偏导，右端一个混合偏导。', 'After simplification this is the familiar textbook relation: four second derivatives on the left, one mixed derivative on the right.') },
        { n: 6, op: 'result', title: t('单连通域上它也是充分的；不成立的后果', 'On a simply connected domain it is also sufficient; what happens when it fails'),
            latex: String.raw `\oint \mathrm{d}u_i=\oint \partial_j u_i\,\mathrm{d}x_j=b_i\neq 0\;\Longrightarrow\; \text{位错 / 断层}`,
            note: t('环路积分不为零，说明走一圈回来位移差了一个 Burgers 矢量 —— 位移多值。地震学中这正是矩张量的等价体力描述的来源。', 'A non-vanishing loop integral means the displacement differs by a Burgers vector after one circuit, so the displacement is multivalued. In seismology that is exactly the origin of the moment tensor and its equivalent-body-force representation.') },
    ],
    links: {
        upstream: [{ id: 'infinitesimal-strain-tensor', note: t('相容条件约束的正是这六个分量', 'the compatibility conditions constrain precisely these six components') }],
        seealso: [
            { id: 'displacement-gradient-tensor', note: t('位移梯度可积 ⇔ 相容方程成立', 'the gradient is integrable exactly when compatibility holds') },
        ],
    },
    refs: [
        { text: 'Malvern, Introduction to the Mechanics of a Continuous Medium, §4.6' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §3.1' },
    ],
};
export default strainCompatibility;
//# sourceMappingURL=strain-compatibility.js.map