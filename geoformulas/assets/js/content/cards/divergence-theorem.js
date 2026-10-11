import { t } from '../../core/types.js';
/** divergence-theorem */
const divergenceTheorem = {
    id: 'divergence-theorem',
    name: t('散度定理（Gauss 定理）', 'The Divergence Theorem, or Gauss Theorem'),
    aliases: { zh: ['高斯定理', '高斯散度定理', 'Gauss 定理'], en: ['divergence theorem', 'Gauss theorem', 'Ostrogradsky theorem'] },
    node: 'S0.3',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('散度定理 高斯定理 体积分 面积分 通量 守恒律 边界条件', 'divergence theorem Gauss theorem volume integral surface integral flux conservation law boundary condition'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\iiint_{V}\nabla\cdot\mathbf{u}\,\dd V=\oiint_{\partial V}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd S`,
        variants: [
            { name: t('分量形式（对每一个分量都成立）', 'Component form, valid for each component separately'), latex: String.raw `\iiint_V \partial_i u_i\,\dd V=\oiint_{\partial V}u_i n_i\,\dd S` },
            { name: t('分部积分（Green 第一恒等式的基础）', 'Integration by parts, the basis of Green first identity'), latex: String.raw `\iiint_V f\,\partial_i u_i\,\dd V=\oiint_{\partial V}f\,u_i n_i\,\dd S-\iiint_V u_i\,\partial_i f\,\dd V` },
            { name: t('二维退化形式（平面通量形式）', 'The two-dimensional degenerate, or planar flux, form'), latex: String.raw `\iint_A \nabla\cdot\mathbf{u}\,\dd A=\oint_{\partial A}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd l` },
            { name: t('用于张量（逐行成立）', 'Applied to a tensor, row by row'), latex: String.raw `\iiint_V \partial_j \sigma_{ij}\,\dd V=\oiint_{\partial V}\sigma_{ij} n_j\,\dd S` },
        ],
    },
    meaning: t('散度定理说：把体积内每一处的「净流出」全部加起来，等于穿过这团体积边界的总通量。它把局部的微分描述和整体的积分描述等价起来，是所有守恒律（质量、动量、能量）从微分形式走向积分形式的唯一桥梁。在弹性力学里，它把 Navier 方程的体积分化成边界上的面力，也正是有限元弱形式的由来。', 'The divergence theorem says that adding up the net outflow at every point inside a volume gives the total flux through the boundary of that volume. It makes the local differential description equivalent to the global integral one, and is the only bridge by which every conservation law — mass, momentum, energy — passes from differential to integral form. In elasticity it converts the volume integral of the Navier equation into surface tractions, which is exactly where the weak form of the finite-element method comes from.'),
    symbols: [
        { sym: 'V', name: t('积分区域（体积）', 'the integration region, a volume'), unit: 'm³' },
        { sym: '\\partial V', name: t('区域的闭合边界曲面', 'the closed boundary surface of the region'), unit: 'm²' },
        { sym: '\\hat{\\mathbf{n}}', name: t('边界的外法向单位矢量', 'outward unit normal on the boundary'), unit: '1' },
        { sym: '\\mathbf{u}', name: t('被求散度的矢量场', 'the vector field whose divergence is taken'), unit: '任意' },
        { sym: '\\sigma_{ij}', name: t('应力张量', 'stress tensor'), unit: 'Pa' },
        { sym: '\\dd S,\\ \\dd l', name: t('面积元与线元', 'area element and line element'), unit: 'm², m' },
    ],
    conditions: {
        applies: [
            t('V 为有界、分片光滑边界的区域', 'V is bounded with a piecewise smooth boundary'),
            t('u 在 V 上连续可微，在闭区域上连续', 'u is continuously differentiable in V and continuous on the closure'),
        ],
        assumes: [
            t('∂V 取外法向；若边界有尖角，按分片求和', '∂V uses the outward normal; corners are handled by summing over smooth pieces'),
            t('场无奇点；若内部有 δ 型源，需额外计入源的贡献', 'The field has no singularities; delta-like sources inside must be added explicitly'),
        ],
        breaks: [
            t('场在内部不连续（如断层面上位移跳跃）时，要把间断面当作附加边界处理', 'Where the field is discontinuous inside, as across a fault with a displacement jump, the discontinuity surface must be treated as an additional boundary'),
            t('无界区域需检查无穷远处的通量是否衰减足够快', 'For unbounded regions one must check that the flux at infinity decays fast enough'),
            t('非 Lipschitz 边界（如分形界面）时需更精细的测度论条件', 'Non-Lipschitz boundaries such as fractal interfaces require finer measure-theoretic conditions'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'geometry',
            title: t('把 V 切成许多小柱体', 'Cut V into many small prisms'),
            latex: String.raw `V=\bigcup_{\alpha} V_{\alpha},\qquad \text{内部界面两两相邻}`,
            note: t('相邻小块的公共面被穿两次，外法向相反，通量正好抵消。', 'Each shared face between neighbours is crossed twice with opposite outward normals, so those fluxes cancel exactly.'),
        },
        {
            n: 2,
            op: 'physics',
            title: t('对每个小块写出通量的定义', 'Write the flux for each small piece by definition'),
            latex: String.raw `\oiint_{\partial V_{\alpha}}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd S\approx(\nabla\cdot\mathbf{u})\big|_{\mathbf{x}_{\alpha}}\,V_{\alpha}`,
            note: t('这正是散度作为「单位体积净通量」的定义（见散度卡片）。', 'This is precisely the definition of divergence as net flux per unit volume.'),
        },
        {
            n: 3,
            op: 'algebra',
            title: t('对所有小块求和', 'Sum over all the pieces'),
            latex: String.raw `\sum_{\alpha}\oiint_{\partial V_{\alpha}}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd S=\oiint_{\partial V}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd S`,
            note: t('左式所有内部界面两两抵消，只剩下最外层边界的贡献。', 'On the left every internal face cancels pairwise, leaving only the contribution of the outermost boundary.'),
        },
        {
            n: 4,
            op: 'transform',
            title: t('右端取极限成为体积分', 'The right side becomes a volume integral in the limit'),
            latex: String.raw `\lim_{\max V_\alpha\to 0}\sum_{\alpha}(\nabla\cdot\mathbf{u})\big|_{\mathbf{x}_\alpha}V_{\alpha}=\iiint_V \nabla\cdot\mathbf{u}\,\dd V`,
        },
        {
            n: 5,
            op: 'result',
            title: t('得到散度定理', 'The divergence theorem'),
            latex: String.raw `\iiint_V \nabla\cdot\mathbf{u}\,\dd V=\oiint_{\partial V}\mathbf{u}\cdot\hat{\mathbf{n}}\,\dd S`,
        },
        {
            n: 6,
            op: 'result',
            title: t('力学形式：动量平衡', 'The mechanical form: momentum balance'),
            latex: String.raw `\iiint_V \partial_j\sigma_{ij}\,\dd V=\oiint_{\partial V}\sigma_{ij}n_j\,\dd S=\oiint_{\partial V}T_i\,\dd S`,
            note: t('右边正是作用在边界上的面力 T_i = σ_ij n_j —— Cauchy 公式与散度定理的组合。', 'The right side is exactly the traction T_i = σ_ij n_j acting on the boundary: the Cauchy formula combined with the divergence theorem.'),
        },
    ],
    example: {
        title: t('检验一个简单场', 'A consistency check on a simple field'),
        input: t('单位立方体 0 ≤ x, y, z ≤ 1，场 u = (x, 0, 0)', 'The unit cube 0 ≤ x, y, z ≤ 1 with field u = (x, 0, 0)'),
        steps: [
            t('∇·u = ∂u_x/∂x = 1，体积分 = 1', '∇·u = ∂u_x/∂x = 1, so the volume integral equals 1'),
            t('只有 x = 1 面有贡献：u·n̂ = 1，面积 1，通量 = 1', 'Only the face x = 1 contributes: u·n̂ = 1 over area 1, so the flux is 1'),
            t('x = 0 面 u·n̂ = 0，其余四面法向与 u 垂直，贡献为 0', 'At x = 0 u·n̂ = 0, and on the other four faces the normal is perpendicular to u, so they contribute nothing'),
        ],
        output: t('两侧都是 1，定理成立；这类校验是调试数值代码的常用手段', 'Both sides equal 1, so the theorem holds; checks of this kind are a standard way to debug numerical code'),
    },
    links: {
        upstream: [
            { id: 'divergence', note: t('定理的被积量', 'the integrand of the theorem') },
            { id: 'index-notation-kronecker', note: t('分量形式用到指标记法', 'the component form uses index notation') },
        ],
        downstream: [{ id: 'stokes-theorem', note: t('与之对偶的旋度版定理', 'its dual, the curl version') }],
        seealso: [{ id: 'navier-equation' }],
    },
    refs: [
        { text: 'Arfken, Weber & Harris, Mathematical Methods for Physicists, 7th ed., §1.11' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default divergenceTheorem;
//# sourceMappingURL=divergence-theorem.js.map