import { t } from '../../core/types.js';
/** engineering-shear-strain */
const engineeringShearStrain = {
    id: 'engineering-shear-strain',
    name: t('剪应变与工程剪应变', 'Tensor Shear Strain and Engineering Shear Strain'),
    aliases: { zh: ['工程剪应变', '剪应变', '角剪应变', 'γ=2ε'], en: ['engineering shear strain', 'shear strain', 'angular distortion', 'gamma equals two epsilon'] },
    node: 'S1.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('工程剪应变 剪应变 角改变 两倍关系 γ=2ε 简单剪切 纯剪', 'engineering shear strain angular distortion factor of two simple shear pure shear'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\gamma_{ij}=2\,\varepsilon_{ij}\qquad (i\neq j)`,
        variants: [
            { name: t('几何定义：直角的减小量', 'Geometric definition: the decrease of a right angle'), latex: String.raw `\gamma_{12}=\frac{\pi}{2}-\varphi=\partial_2 u_1+\partial_1 u_2` },
            { name: t('矩阵（Voigt）形式', 'Matrix / Voigt form'), latex: String.raw `\begin{bmatrix} \gamma_{12}\\ \gamma_{23}\\ \gamma_{31}\end{bmatrix}=\begin{bmatrix} 2\varepsilon_{12}\\ 2\varepsilon_{23}\\ 2\varepsilon_{31}\end{bmatrix}` },
            { name: t('简单剪切：tan ψ = γ', 'Simple shear: tan ψ = γ'), latex: String.raw `\boldsymbol{u}=\left(\gamma x_2,0,0\right)\;\Longrightarrow\; \tan\psi=\gamma\approx\psi` },
            { name: t('同一物理状态的两种分解', 'Two decompositions of the same physical state'), latex: String.raw `\underbrace{\begin{bmatrix} 0 & \gamma\\ 0 & 0\end{bmatrix}}_{\text{简单剪切}}=\underbrace{\begin{bmatrix} 0 & \gamma/2\\ \gamma/2 & 0\end{bmatrix}}_{\text{纯剪}}+\underbrace{\begin{bmatrix} 0 & \gamma/2\\ -\gamma/2 & 0\end{bmatrix}}_{\text{刚体转动}}` },
            { name: t('本构关系中必须用 ε，不能用 γ', 'Constitutive laws must use ε, never γ'), latex: String.raw `\sigma_{12}=2\mu\,\varepsilon_{12}=\mu\,\gamma_{12}` },
            { name: t('最大值（与主轴成 45° 的面）', 'Maximum value, on planes at 45° to the principal axes'), latex: String.raw `\gamma_{\max}=e_1-e_3` },
        ],
    },
    meaning: t('同一个物理量的两套记账方式：张量剪应变 ε₁₂ 是「矩阵里那个数」，工程剪应变 γ₁₂ 是「两条线之间的直角少了多少」，后者恰好是前者的两倍。工程界习惯了用 γ，因为它能直接量；但写本构关系时必须用 ε，否则剪应力会算成两倍 —— 这是弹性力学里最常见也最致命的一个错误。', 'Two bookkeeping systems for one physical quantity. The tensor shear strain ε₁₂ is the number in the matrix; the engineering shear strain γ₁₂ is how much the right angle between two lines has shrunk, which is exactly twice as large. Engineers prefer γ because it is directly measurable, but constitutive laws must be written with ε, otherwise the shear stress comes out twice too big. That is the most common and most damaging mistake in elasticity.'),
    symbols: [
        { sym: '\\gamma_{ij}', name: t('工程剪应变（角改变量）', 'engineering shear strain (angular distortion)'), unit: '', dimension: '无量纲', typical: '10⁻⁶ – 10⁻³' },
        { sym: '\\varepsilon_{ij}', name: t('张量剪应变（应变矩阵的非对角元）', 'tensor shear strain (off-diagonal entry of the strain matrix)'), unit: '', dimension: '无量纲' },
        { sym: '\\varphi', name: t('两条物质线变形后的夹角', 'angle between two material lines after deformation'), unit: 'rad' },
        { sym: '\\psi', name: t('简单剪切的剪切角', 'shear angle of simple shear'), unit: 'rad' },
        { sym: 'e_1,e_3', name: t('最大与最小主应变', 'maximum and minimum principal strains'), unit: '', dimension: '无量纲' },
        { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '10¹⁰ Pa' },
    ],
    conditions: {
        applies: [
            t('小变形：γ ≈ tan γ（弧度）', 'Small deformation, where γ ≈ tan γ in radians'),
            t('工程测量、应变花（strain rosette）与野外地质观测', 'Engineering measurement, strain rosettes and field geological observation'),
        ],
        assumes: [
            t('角度以弧度计', 'Angles are measured in radians'),
            t('符号约定：直角减小为正', 'Sign convention: a decrease of the right angle is positive'),
        ],
        breaks: [
            t('大剪切（γ ≳ 0.1）时 tan ψ = γ 与 ψ ≈ γ 的区别不可忽略', 'For large shear, say γ above 0.1, the distinction between tan ψ = γ and ψ ≈ γ matters'),
            t('有限变形需用 Green–Lagrange 的非对角元，两倍关系不再精确成立', 'Finite deformation requires the off-diagonal Green–Lagrange entries, where the factor-of-two relation is no longer exact'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('取两条变形前互相垂直的物质线', 'Take two material lines that were perpendicular'),
            latex: String.raw `\mathrm{d}\boldsymbol{x}^{(1)}=\left(\mathrm{d}x_1,0\right),\qquad \mathrm{d}\boldsymbol{x}^{(2)}=\left(0,\mathrm{d}x_2\right)` },
        { n: 2, op: 'geometry', title: t('变形后它们各自转过一个小角度', 'After deformation each has turned through a small angle'),
            latex: String.raw `\alpha_1\approx \frac{\partial u_2}{\partial x_1},\qquad \alpha_2\approx \frac{\partial u_1}{\partial x_2}` },
        { n: 3, op: 'identity', title: t('直角的总改变量是两者之和', 'The total change of the right angle is the sum of the two'),
            latex: String.raw `\gamma_{12}=\frac{\pi}{2}-\varphi=\alpha_1+\alpha_2=\frac{\partial u_1}{\partial x_2}+\frac{\partial u_2}{\partial x_1}=2\varepsilon_{12}`,
            note: t('这就是那个 2 的来源：两条线各自转了一点，加起来才是角改变量，而张量定义取的是平均。', 'There is the origin of the factor 2: each line rotates a little, the angle change is the sum, while the tensor definition takes the average.') },
        { n: 4, op: 'substitute', title: t('例子：简单剪切场', 'Example: a simple shear field'),
            latex: String.raw `u_1=\gamma x_2,\ u_2=0\;\Longrightarrow\;\varepsilon_{12}=\frac{\gamma}{2},\quad \omega_{12}=\frac{\gamma}{2}`,
            note: t('注意这个位移场里有一半是纯刚体转动 —— 单看 γ 无法分辨，必须做对称/反对称分解。', 'Note that half of this displacement field is a rigid rotation, invisible in γ itself and only revealed by the symmetric/antisymmetric split.') },
        { n: 5, op: 'identity', title: t('去掉转动后剩下的是纯剪', 'Removing the rotation leaves pure shear'),
            latex: String.raw `\varepsilon_{ij}=\begin{bmatrix} 0 & \gamma/2\\ \gamma/2 & 0\end{bmatrix}\;\Longrightarrow\; \text{主轴沿 }45^{\circ},\ e_{1,2}=\pm\frac{\gamma}{2}`,
            note: t('纯剪的主轴与 x₁ 成 45°，主应变为 ±γ/2 —— 所以「剪」与「沿 45° 方向的一拉一压」是同一件事。', 'The principal axes of pure shear lie at 45° to x₁ with principal strains ±γ/2, so shear and simultaneous extension plus compression at 45° are one and the same thing.') },
        { n: 6, op: 'result', title: t('写本构关系时的正确用法', 'The correct usage in a constitutive law'),
            latex: String.raw `\sigma_{12}=2\mu\varepsilon_{12}=\mu\gamma_{12},\qquad \sigma_{12}=\sigma_{21}`,
            note: t('一个记忆法：剪切模量 μ 前面的系数总与 γ 配对是 1，与 ε 配对是 2。', 'A mnemonic: the coefficient in front of μ is 1 when paired with γ and 2 when paired with ε.') },
    ],
    viz: [
        {
            id: 'simple-vs-pure-shear',
            level: 'V1',
            title: t('简单剪切与纯剪：同一形状改变的两种实现', 'Simple shear and pure shear: two routes to the same shape change'),
            xlabel: t('x₁', 'x₁'),
            ylabel: t('x₂', 'x₂'),
            controls: [
                { id: 'gam', label: t('工程剪应变 γ', 'engineering shear strain γ'), min: 0, max: 0.8, step: 0.02, value: 0.5, unit: '' },
            ],
            xRange: [-0.2, 2],
            yRange: [-0.2, 2],
            note: t('蓝框把正方形的顶边整体推走（简单剪切），绿框把正方形沿 45° 方向一拉一压（纯剪）。两者的形状改变完全相同，只是蓝框整体转了一个角度 —— 而转动不产生应力，所以两者的应力状态也一样。把 γ 加大，就能清楚看到蓝框的「转动分量」越来越大。', 'The blue frame slides the top of the square sideways, simple shear; the green frame stretches along one 45° direction and shortens along the other, pure shear. The shape change is identical and only the overall orientation differs, so because rotation creates no stress, the two stress states are identical as well. Increase γ and the rotational content of the blue frame grows visibly.'),
            compute: (p) => {
                const gam = p['gam'];
                const corners = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
                const simple = corners.map(([x, y]) => [x + gam * y, y]);
                const pure = corners.map(([x, y]) => [
                    x + (gam / 2) * y,
                    y + (gam / 2) * x,
                ]);
                return [
                    { label: t('原始正方形', 'undeformed square'), color: '#B4B2A9', dash: true, points: corners.map((q) => [q[0], q[1]]) },
                    { label: t('简单剪切（含刚体转动）', 'simple shear, rigid spin included'), color: '#185FA5', points: simple },
                    { label: t('纯剪（仅对称部分）', 'pure shear, symmetric part only'), color: '#0F6E56', points: pure },
                ];
            },
        },
    ],
    example: {
        title: t('用应变花测出的 γ 该怎么代进 Hooke 定律', 'How to feed a rosette-measured γ into Hooke’s law'),
        input: t('应变花测出两条互相垂直方向之间的角改变 γ₁₂ = 4 × 10⁻⁴，μ = 30 GPa。', 'A strain rosette measures an angle change of γ₁₂ = 4 × 10⁻⁴ between two perpendicular directions, with μ = 30 GPa.'),
        steps: [
            t('先换算：ε₁₂ = γ₁₂/2 = 2 × 10⁻⁴', 'convert first: ε₁₂ = γ₁₂/2 = 2 × 10⁻⁴'),
            t('再代入：σ₁₂ = 2μ ε₁₂ = 2 × 30 GPa × 2 × 10⁻⁴ = 12 MPa', 'then substitute: σ₁₂ = 2μ ε₁₂ = 2 × 30 GPa × 2 × 10⁻⁴ = 12 MPa'),
            t('等价地：σ₁₂ = μ γ₁₂ = 30 GPa × 4 × 10⁻⁴ = 12 MPa', 'equivalently: σ₁₂ = μ γ₁₂ = 30 GPa × 4 × 10⁻⁴ = 12 MPa'),
        ],
        output: t('剪应力为 12 MPa。若误把 γ 当作 ε 代入 σ = 2με，会得到 24 MPa —— 整整差一倍。', 'The shear stress is 12 MPa. Feeding γ into σ = 2με by mistake would give 24 MPa, wrong by a full factor of two.'),
    },
    links: {
        upstream: [{ id: 'infinitesimal-strain-tensor', note: t('γ 是 ε 非对角元的两倍', 'γ is twice the off-diagonal ε') }],
        seealso: [
            { id: 'rotation-tensor', note: t('γ 有一半其实是刚体转动', 'half of γ is in fact a rigid rotation') },
            { id: 'principal-strain-invariants', note: t('γ_max = e₁ − e₃', 'γ_max = e₁ − e₃') },
            { id: 'mohr-circle-max-shear', note: t('应变 Mohr 圆的半径是 γ/2', 'the strain Mohr circle has radius γ/2') },
        ],
    },
    refs: [
        { text: 'Jaeger, Cook & Zimmerman, Fundamentals of Rock Mechanics, 4th ed., §2.2' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    ],
};
export default engineeringShearStrain;
//# sourceMappingURL=engineering-shear-strain.js.map