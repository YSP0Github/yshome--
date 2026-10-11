import { t } from '../../core/types.js';
/** curl */
const curl = {
    id: 'curl',
    name: t('旋度', 'The Curl'),
    aliases: { zh: ['∇×u', '旋度', '涡量'], en: ['curl', 'rot', 'rotation', 'vorticity'] },
    node: 'S0.3',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('旋度 环量 涡量 旋转 剪切波 刚性转动 斯托克斯定理', 'curl circulation vorticity rotation shear wave rigid rotation Stokes theorem'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\nabla\times\mathbf{u}=\left|\begin{matrix}\hat{\mathbf{e}}_1 & \hat{\mathbf{e}}_2 & \hat{\mathbf{e}}_3\\ \partial_1 & \partial_2 & \partial_3\\ u_1 & u_2 & u_3\end{matrix}\right|=\left(\partial_2u_3-\partial_3u_2,\ \partial_3u_1-\partial_1u_3,\ \partial_1u_2-\partial_2u_1\right)`,
        variants: [
            { name: t('与坐标无关的（极限）定义', 'The coordinate-free definition as a limit'), latex: String.raw `(\nabla\times\mathbf{u})\cdot\hat{\mathbf{n}}=\lim_{S\to 0}\frac{1}{S}\oint_{\partial S}\mathbf{u}\cdot\dd\mathbf{l}` },
            { name: t('用 Levi-Civita 符号写出', 'Written with the Levi-Civita symbol'), latex: String.raw `(\nabla\times\mathbf{u})_i=\varepsilon_{ijk}\,\partial_j u_k` },
            { name: t('刚性转动：旋度等于角速度的两倍', 'Rigid rotation: the curl is twice the angular velocity'), latex: String.raw `\mathbf{u}=\boldsymbol{\Omega}\times\mathbf{x}\;\Longrightarrow\;\nabla\times\mathbf{u}=2\boldsymbol{\Omega}` },
            { name: t('与位移场旋转张量的关系', 'Relation to the rotation tensor of a displacement field'), latex: String.raw `\omega_{ij}=\frac{1}{2}\left(\partial_i u_j-\partial_j u_i\right),\qquad (\nabla\times\mathbf{u})_i=\varepsilon_{ijk}\,\omega_{jk}` },
            { name: t('两个常用恒等式', 'Two frequently used identities'), latex: String.raw `\nabla\times\nabla f=\mathbf{0},\qquad \nabla\cdot(\nabla\times\mathbf{u})=0` },
        ],
    },
    meaning: t('旋度衡量矢量场在某点「打转」的强度和轴向：大小是单位面积的环量，方向按右手定则给出转轴。对位移场而言，旋度对应介质微元的刚性转动部分 —— 与散度对应的体积变化互补。弹性波动力学里，P 波是「无旋」的那部分（∇×u = 0），S 波是「无散」的那部分（∇·u = 0），这一对分解正是 Helmholtz 分解的核心。', 'The curl measures how strongly and about which axis a vector field swirls at a point: its magnitude is the circulation per unit area and its direction, given by the right-hand rule, is the rotation axis. For a displacement field the curl corresponds to the rigid rotation of a material element, complementing the volume change captured by the divergence. In elastic wave dynamics the P part is the irrotational one, ∇×u = 0, and the S part the divergence-free one, ∇·u = 0; that pair of statements is the heart of the Helmholtz decomposition.'),
    symbols: [
        { sym: '\\nabla\\times\\mathbf{u}', name: t('u 的旋度（矢量）', 'curl of u, a vector'), unit: 'u 的单位 / m' },
        { sym: '\\varepsilon_{ijk}', name: t('Levi-Civita 完全反对称符号', 'the Levi-Civita totally antisymmetric symbol'), unit: '1' },
        { sym: '\\hat{\\mathbf{n}}', name: t('小回路所张曲面的单位法向', 'unit normal of the surface spanned by the small loop'), unit: '1' },
        { sym: 'S', name: t('小回路围成的面积', 'area enclosed by the small loop'), unit: 'm²' },
        { sym: '\\boldsymbol{\\Omega}', name: t('刚体角速度矢量', 'angular velocity vector of a rigid body'), unit: 'rad/s' },
        { sym: '\\omega_{ij}', name: t('旋转张量（位移梯度的反对称部分）', 'rotation tensor, the antisymmetric part of the displacement gradient'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('三维（或二维退化为其法向分量）的可微矢量场', 'A differentiable vector field in three dimensions, or in two dimensions reduced to its normal component'),
            t('常用于速度场、位移场、磁场、能流场', 'Commonly applied to velocity, displacement, magnetic and energy-flux fields'),
        ],
        assumes: [
            t('直角正交坐标；球坐标下形式不同', 'Cartesian orthonormal coordinates; the spherical form differs'),
            t('右手坐标系（否则 Levi-Civita 符号的符号要反）', 'A right-handed coordinate system, otherwise the sign of the Levi-Civita symbol flips'),
        ],
        breaks: [
            t('二维场必须理解为三维场的特例，旋度只有垂直于平面的分量', 'A two-dimensional field must be understood as a special case of a three-dimensional one, with only the out-of-plane component'),
            t('场不连续时旋度含 δ 型集中涡量（如位错的等效体源）', 'Where the field is discontinuous the curl carries delta-like concentrated vorticity, as in the equivalent body force of a dislocation'),
            t('离散网格上环量需沿闭合路径逐边求和，否则不守恒', 'On a discrete grid the circulation must be summed edge by edge around a closed loop, otherwise conservation is lost'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'geometry',
            title: t('取一个法向为 n̂ 的小平面回路', 'Take a small planar loop with unit normal n̂'),
            latex: String.raw `\text{环量 }\Gamma=\oint_{\partial S}\mathbf{u}\cdot\dd\mathbf{l},\qquad \text{面积 }S`,
        },
        {
            n: 2,
            op: 'setup',
            title: t('先取法向为 e₃ 的矩形回路', 'Start with a rectangular loop whose normal is e₃'),
            latex: String.raw `\Gamma\approx\left[\frac{\partial u_y}{\partial x}-\frac{\partial u_x}{\partial y}\right]\Delta x\,\Delta y`,
            note: t('上下两边贡献 ∂u_x/∂y 项，左右两边贡献 ∂u_y/∂x 项，方向相反故相减。', 'The two horizontal edges contribute the ∂u_x/∂y term and the two vertical ones the ∂u_y/∂x term; because they circulate oppositely they subtract.'),
        },
        {
            n: 3,
            op: 'algebra',
            title: t('除以面积并取极限', 'Divide by the area and take the limit'),
            latex: String.raw `(\nabla\times\mathbf{u})_3=\lim_{S\to 0}\frac{\Gamma}{S}=\partial_xu_y-\partial_yu_x`,
        },
        {
            n: 4,
            op: 'identity',
            title: t('另外两个分量由轮换得到', 'The other two components follow by cyclic permutation'),
            latex: String.raw `(\nabla\times\mathbf{u})_1=\partial_yu_z-\partial_zu_y,\qquad (\nabla\times\mathbf{u})_2=\partial_zu_x-\partial_xu_z`,
        },
        {
            n: 5,
            op: 'identity',
            title: t('用 Levi-Civita 符号统一写成一行', 'Unify them in a single line with the Levi-Civita symbol'),
            latex: String.raw `(\nabla\times\mathbf{u})_i=\varepsilon_{ijk}\,\partial_j u_k`,
            note: t('ε_ijk 在 (i,j,k) 为偶排列时取 +1，奇排列取 −1，有重复指标取 0。', 'ε_ijk equals +1 for even permutations of (i,j,k), −1 for odd ones and 0 when an index repeats.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('刚性转动的校验：为什么是 2Ω', 'Check with rigid rotation: why the factor is 2Ω'),
            latex: String.raw `\mathbf{u}=\boldsymbol{\Omega}\times\mathbf{x}\;\Longrightarrow\;\nabla\times\mathbf{u}=2\boldsymbol{\Omega}`,
            note: t('半个旋度是「平均转动」，另一个半来自剪切变形的补偿；这个 2 是最容易记错的地方。', 'Half of it is the mean rotation and the other half compensates the shear deformation; that factor of two is the easiest thing to misremember.'),
        },
        {
            n: 7,
            op: 'result',
            title: t('与 P/S 波分解的关系', 'Relation to the P/S decomposition'),
            latex: String.raw `\nabla\times\mathbf{u}=\mathbf{0}\ (\text{无旋})\ \Rightarrow\ \text{P 波部分};\qquad \nabla\cdot\mathbf{u}=0\ (\text{无散})\ \Rightarrow\ \text{S 波部分}`,
            note: t('Helmholtz 分解说任意矢量场都可唯一拆成这两部分之和。', 'The Helmholtz decomposition states that any vector field splits uniquely into the sum of these two parts.'),
        },
    ],
    viz: [
        {
            id: 'circulation-per-area',
            level: 'V1',
            title: t('单位面积环量随回路半径的变化', 'Circulation per unit area versus loop radius'),
            xlabel: t('回路半径 R (m)', 'loop radius R (m)'),
            ylabel: t('环量/面积 Γ/(πR²)', 'circulation per area Γ/(πR²)'),
            controls: [
                { id: 'a', label: t('系数 a（u_x = a y）', 'coefficient a, with u_x = a y'), min: -3, max: 3, step: 0.1, value: 1.5, unit: '1' },
                { id: 'b', label: t('系数 b（u_y = b x）', 'coefficient b, with u_y = b x'), min: -3, max: 3, step: 0.1, value: -0.5, unit: '1' },
            ],
            xRange: [0.05, 3],
            note: t('对场 u = (a y, b x)，旋度的 z 分量处处等于 b − a，与回路大小无关，所以曲线是水平线。把参数调成 b = −a，旋度达到 −2a：这正是刚性转动（u = Ω×x 时 Ω = −a），旋度是角速度的两倍。调成 b = a 则旋度为零 —— 纯剪切，场线被拉长却不打转。', 'For the field u = (a y, b x) the z component of the curl equals b − a everywhere, independent of loop size, so the curve is horizontal. Setting b = −a gives a curl of −2a: that is rigid rotation, since u = Ω×x corresponds to Ω = −a, and the curl is twice the angular velocity. Setting b = a makes the curl vanish: pure shear, where field lines are stretched without swirling.'),
            compute: (p) => {
                const a = p['a'], b = p['b'];
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const R = 0.05 + (i / 300) * 2.95;
                    let gam = 0;
                    const M = 720;
                    const dth = (2 * Math.PI) / M;
                    for (let j = 0; j < M; j++) {
                        const th = (j + 0.5) * dth;
                        const x = R * Math.cos(th);
                        const y = R * Math.sin(th);
                        const ux = a * y;
                        const uy = b * x;
                        const tx = -Math.sin(th);
                        const ty = Math.cos(th);
                        gam += (ux * tx + uy * ty) * R * dth;
                    }
                    pts.push([R, gam / (Math.PI * R * R)]);
                }
                return [
                    { label: t('数值环量/面积', 'numerical circulation per area'), color: '#185FA5', points: pts },
                    { label: t('解析值 b − a', 'analytic value b − a'), color: '#BA7517', dash: true, points: [[0.05, b - a], [3, b - a]] },
                ];
            },
        },
        {
            id: 'vortex-flux',
            level: 'V1',
            title: t('点涡场：环量不变，旋度却处处为零', 'A point-vortex field: constant circulation, yet zero curl everywhere'),
            xlabel: t('回路半径 R (m)', 'loop radius R (m)'),
            ylabel: t('量值', 'value'),
            controls: [
                { id: 's', label: t('涡强 s', 'vortex strength s'), min: 0.5, max: 5, step: 0.1, value: 2, unit: '1' },
            ],
            xRange: [0.2, 5],
            note: t('取 u = (s/r) θ̂。绕任意圆周的环量恒为 2πs，但除原点外 ∇×u 处处为零：旋度全部集中在原点的一个 δ 上。这与点源的散度完全对偶 —— 也是位错、断层走滑的等效体源表示里出现 δ 型涡量的原因。', 'Take u = (s/r) θ̂. The circulation around any circle is a constant 2πs, yet ∇×u vanishes everywhere except at the origin: all of the curl is concentrated into a delta there. This is exactly dual to the divergence of a point source, and is why delta-like vorticity appears in the equivalent body-force representation of dislocations and strike-slip faults.'),
            compute: (p) => {
                const s = p['s'];
                const gamPts = [];
                const densPts = [];
                for (let i = 0; i <= 300; i++) {
                    const R = 0.2 + (i / 300) * 4.8;
                    const gam = 2 * Math.PI * s;
                    gamPts.push([R, gam]);
                    densPts.push([R, gam / (Math.PI * R * R)]);
                }
                return [
                    { label: t('总环量 ∮u·dl', 'total circulation ∮u·dl'), color: '#185FA5', points: gamPts },
                    { label: t('单位面积环量', 'circulation per unit area'), color: '#BA7517', dash: true, points: densPts },
                ];
            },
        },
    ],
    example: {
        title: t('验证纯剪切场无转动', 'Verifying that a pure shear field carries no rotation'),
        input: t('u = (γ y, γ x, 0)', 'u = (γ y, γ x, 0)'),
        steps: [
            t('(∇×u)_z = ∂_x u_y − ∂_y u_x = γ − γ = 0', '(∇×u)_z = ∂_x u_y − ∂_y u_x = γ − γ = 0'),
            t('∇·u = 0 同样成立', '∇·u = 0 holds as well'),
        ],
        output: t('这是一个纯剪切变形：微元被拉成菱形但不转动、体积也不变', 'A pure shear deformation: the element is stretched into a rhombus without rotating and without changing volume'),
    },
    links: {
        upstream: [
            { id: 'gradient', note: t('∇ 算子的叉积形式', 'the cross-product form of the ∇ operator') },
            { id: 'index-notation-kronecker', note: t('ε_ijk 的定义', 'the definition of ε_ijk') },
        ],
        downstream: [
            { id: 'stokes-theorem', note: t('把旋度的面积分变成线积分', 'turns the surface integral of curl into a line integral') },
            { id: 'divergence', note: t('与旋度互补的一阶不变量', 'the complementary first-order invariant') },
        ],
        seealso: [{ id: 'ps-wave-velocities' }],
    },
    refs: [
        { text: 'Arfken, Weber & Harris, Mathematical Methods for Physicists, 7th ed., §1.8' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default curl;
//# sourceMappingURL=curl.js.map