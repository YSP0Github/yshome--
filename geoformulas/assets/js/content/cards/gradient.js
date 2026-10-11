import { t } from '../../core/types.js';
/** gradient */
const gradient = {
    id: 'gradient',
    name: t('梯度', 'The Gradient'),
    aliases: { zh: ['∇f', '标量场梯度', '方向导数'], en: ['gradient', 'grad', 'directional derivative', 'del f'] },
    node: 'S0.3',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR', 'Q.GEOM'],
        keywords: t('梯度 方向导数 最陡上升 等值面 法向 算子 ∇', 'gradient directional derivative steepest ascent level surface normal operator nabla'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\nabla f=\left(\frac{\partial f}{\partial x},\ \frac{\partial f}{\partial y},\ \frac{\partial f}{\partial z}\right)=\frac{\partial f}{\partial x_i}\,\hat{\mathbf{e}}_i`,
        variants: [
            { name: t('方向导数：沿单位矢量 n̂ 的变化率', 'Directional derivative: rate of change along a unit vector n̂'), latex: String.raw `\frac{\dd f}{\dd s}=\nabla f\cdot\hat{\mathbf{n}}=|\nabla f|\cos\theta` },
            { name: t('微分形式（与坐标无关的定义）', 'Differential form, a coordinate-free definition'), latex: String.raw `\dd f=\nabla f\cdot\dd\mathbf{x}` },
            { name: t('极坐标与球坐标下的梯度', 'The gradient in polar and spherical coordinates'), latex: String.raw `\nabla f=\frac{\partial f}{\partial r}\hat{\mathbf{r}}+\frac{1}{r}\frac{\partial f}{\partial\theta}\hat{\boldsymbol{\theta}}+\frac{1}{r\sin\theta}\frac{\partial f}{\partial\varphi}\hat{\boldsymbol{\varphi}}` },
            { name: t('梯度垂直于等值面', 'The gradient is normal to level surfaces'), latex: String.raw `f=\text{const}\;\Longrightarrow\;\nabla f\perp \text{该曲面}` },
        ],
    },
    meaning: t('梯度把一个标量场（温度、走时场、速度扰动、位能）变成一个矢量场：它的方向是 f 增长最快的方向，大小是该方向上的变化率。这句话同时给出了三个常用结论 —— 沿梯度方向爬升最快、沿等值面走 f 不变、|∇f| 就是陡峭程度。在地震学中，走时场的梯度直接给出慢度矢量，射线正是沿着它（的法向）传播的。', 'The gradient turns a scalar field — temperature, a travel-time field, a velocity perturbation, a potential — into a vector field pointing in the direction of fastest increase of f, with magnitude equal to the rate of change in that direction. The statement delivers three working conclusions at once: climb along the gradient to rise fastest, walk along a level surface and f does not change, and |∇f| measures steepness. In seismology the gradient of a travel-time field is precisely the slowness vector, and rays propagate along it.'),
    symbols: [
        { sym: '\\nabla f', name: t('f 的梯度（矢量）', 'gradient of f, a vector'), unit: 'f 的单位 / m' },
        { sym: 'f', name: t('标量场', 'scalar field'), unit: '任意' },
        { sym: '\\hat{\\mathbf{n}}', name: t('给定的单位方向', 'a prescribed unit direction'), unit: '1' },
        { sym: '\\theta', name: t('n̂ 与 ∇f 的夹角', 'angle between n̂ and ∇f'), unit: 'rad' },
        { sym: '\\hat{\\mathbf{e}}_i', name: t('第 i 个坐标基矢量', 'the i-th coordinate basis vector'), unit: '1' },
        { sym: 's', name: t('沿某方向的路程', 'distance travelled along a direction'), unit: 'm' },
        { sym: '\\hat{\\mathbf{r}},\\hat{\\boldsymbol{\\theta}}', name: t('球坐标的径向与极角单位矢量', 'radial and polar unit vectors in spherical coordinates'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('f 连续可微（一阶偏导存在且连续）', 'f is continuously differentiable, with continuous first partials'),
            t('欧氏空间中的直角、柱、球坐标均可，只是分量形式不同', 'Any Euclidean coordinates — Cartesian, cylindrical or spherical — only the component form changes'),
        ],
        assumes: [
            t('用直角坐标的 orthonormal 基；非正交曲线坐标需引入度规', 'An orthonormal basis in Cartesian coordinates; non-orthogonal curvilinear coordinates require a metric'),
            t('f 是标量（不随坐标旋转而改变分量）', 'f is a scalar, that is, invariant under rotation'),
        ],
        breaks: [
            t('f 不可微（有尖点、断层）时梯度无定义，需用次梯度或单侧导数', 'Where f is non-differentiable, at cusps or faults, the gradient is undefined and one needs sub-gradients or one-sided derivatives'),
            t('离散网格上要用差商近似，步长过大会严重低估 |∇f|', 'On a discrete grid a difference quotient replaces the derivative, and too coarse a step badly underestimates |∇f|'),
            t('在弯曲流形上梯度必须用度规张量升指标', 'On a curved manifold the gradient requires the metric tensor to raise the index'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('沿单位方向 n̂ 走一小步 ds', 'Take a small step ds along a unit direction n̂'),
            latex: String.raw `\dd\mathbf{x}=\hat{\mathbf{n}}\,\dd s=(n_1,n_2,n_3)\,\dd s,\qquad |\hat{\mathbf{n}}|=1`,
        },
        {
            n: 2,
            op: 'identity',
            title: t('多元函数的一阶全微分', 'The first-order total differential of a function of several variables'),
            latex: String.raw `\dd f=\frac{\partial f}{\partial x_1}\dd x_1+\frac{\partial f}{\partial x_2}\dd x_2+\frac{\partial f}{\partial x_3}\dd x_3=\sum_i\frac{\partial f}{\partial x_i}\,\dd x_i`,
        },
        {
            n: 3,
            op: 'substitute',
            title: t('代入 dx_i = n_i ds', 'Substitute dx_i = n_i ds'),
            latex: String.raw `\dd f=\left(\sum_i\frac{\partial f}{\partial x_i}n_i\right)\dd s`,
        },
        {
            n: 4,
            op: 'algebra',
            title: t('把括号认作两个矢量的点积', 'Recognise the bracket as a dot product of two vectors'),
            latex: String.raw `\frac{\dd f}{\dd s}=\underbrace{\left(\frac{\partial f}{\partial x_1},\frac{\partial f}{\partial x_2},\frac{\partial f}{\partial x_3}\right)}_{\displaystyle \nabla f}\cdot\hat{\mathbf{n}}`,
            note: t('这就是梯度的定义：那个「与 n̂ 点积后给出方向导数」的矢量。', 'This is the definition of the gradient: the vector whose dot product with n̂ yields the directional derivative.'),
        },
        {
            n: 5,
            op: 'result',
            title: t('什么时候增长最快？', 'When is the increase fastest?'),
            latex: String.raw `\frac{\dd f}{\dd s}=|\nabla f|\cos\theta\;\leq\;|\nabla f|,\qquad \text{等号当且仅当}\ \theta=0`,
            note: t('所以 ∇f 指向最陡上升方向，其模就是最大变化率。', 'Hence ∇f points along steepest ascent and its magnitude is the maximum rate of change.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('等值面上 df = 0 ⟹ 梯度垂直等值面', 'On a level surface df = 0, so the gradient is normal to it'),
            latex: String.raw `f=\text{const}\;\Rightarrow\;\dd f=0=\nabla f\cdot\dd\mathbf{x}\;\Rightarrow\;\nabla f\perp \dd\mathbf{x}`,
            note: t('在地震学里：走时场 T(x) 的等值面是波前，∇T 就是慢度矢量，其大小即 1/c。', 'In seismology the level surfaces of the travel-time field T(x) are wavefronts, and ∇T is the slowness vector whose magnitude is 1/c.'),
        },
    ],
    viz: [
        {
            id: 'directional-derivative',
            level: 'V1',
            title: t('方向导数随方向的变化：最大值就是 |∇f|', 'Directional derivative versus direction: the maximum is |∇f|'),
            xlabel: t('方向角 θ (rad)', 'direction angle θ (rad)'),
            ylabel: t('方向导数 df/ds', 'directional derivative df/ds'),
            controls: [
                { id: 'a', label: t('x 方向曲率 a', 'curvature a in x'), min: -3, max: 3, step: 0.1, value: 1.5, unit: '1' },
                { id: 'b', label: t('y 方向曲率 b', 'curvature b in y'), min: -3, max: 3, step: 0.1, value: 0.6, unit: '1' },
                { id: 'x0', label: t('观察点 x₀', 'observation point x₀'), min: -3, max: 3, step: 0.1, value: 1, unit: 'm' },
                { id: 'y0', label: t('观察点 y₀', 'observation point y₀'), min: -3, max: 3, step: 0.1, value: -1.5, unit: 'm' },
            ],
            xRange: [0, 6.283],
            note: t('取二次场 f = (1/2)(a x² + b y²)。曲线是余弦形：θ 与梯度同向时取最大值 |∇f|，反向时取 −|∇f|，垂直时为 0（沿等值面走，f 不变）。改变观察点，整条曲线的振幅和相位都随之改变 —— 梯度是逐点定义的矢量场。', 'Take the quadratic field f = ½(ax² + by²). The curve is a cosine: it reaches |∇f| when θ aligns with the gradient, −|∇f| when opposed, and zero when perpendicular, meaning one walks along a level surface without changing f. Moving the observation point changes both amplitude and phase — the gradient is a vector field defined point by point.'),
            compute: (p) => {
                const a = p['a'], b = p['b'], x0 = p['x0'], y0 = p['y0'];
                const gx = a * x0;
                const gy = b * y0;
                const mag = Math.sqrt(gx * gx + gy * gy);
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const th = (i / 400) * 2 * Math.PI;
                    pts.push([th, gx * Math.cos(th) + gy * Math.sin(th)]);
                }
                return [
                    { label: t('方向导数 ∇f·n̂', 'directional derivative ∇f·n̂'), color: '#185FA5', points: pts },
                    { label: t('|∇f| 上界', 'upper bound |∇f|'), color: '#B4B2A9', dash: true, points: [[0, mag], [2 * Math.PI, mag]] },
                    { label: t('−|∇f| 下界', 'lower bound −|∇f|'), color: '#B4B2A9', dash: true, points: [[0, -mag], [2 * Math.PI, -mag]] },
                ];
            },
        },
        {
            id: 'ray-profile',
            level: 'V1',
            title: t('沿某一条射线走：起点斜率就是方向导数', 'Walking along a ray: the initial slope is the directional derivative'),
            xlabel: t('沿射线的距离 s (m)', 'distance s along the ray (m)'),
            ylabel: t('场值 f', 'field value f'),
            controls: [
                { id: 'a2', label: t('x 方向曲率 a', 'curvature a in x'), min: -3, max: 3, step: 0.1, value: 1.5, unit: '1' },
                { id: 'b2', label: t('y 方向曲率 b', 'curvature b in y'), min: -3, max: 3, step: 0.1, value: 0.6, unit: '1' },
                { id: 'th', label: t('射线方向角 θ', 'ray direction angle θ'), min: 0, max: 6.28, step: 0.02, value: 0, unit: 'rad' },
            ],
            xRange: [-3, 3],
            note: t('从原点出发沿 θ 方向走，曲线在 s = 0 处的斜率就是该方向的方向导数。把 θ 转到与 ∇f 一致的方向，起点最陡；转到垂直方向，起点是平的。二次场只是在远处弯曲，起点斜率始终由 ∇f 决定，这就是「局部线性化」。', 'Starting at the origin and walking along θ, the slope of the curve at s = 0 is the directional derivative in that direction. Turn θ to align with ∇f and the start is steepest; turn it perpendicular and the start is flat. The quadratic field bends further out, but the initial slope is always set by ∇f — that is local linearisation.'),
            compute: (p) => {
                const a = p['a2'], b = p['b2'], th = p['th'];
                const cx = Math.cos(th);
                const cy = Math.sin(th);
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const s = -3 + (i / 400) * 6;
                    const x = s * cx;
                    const y = s * cy;
                    pts.push([s, 0.5 * (a * x * x + b * y * y)]);
                }
                return [{ label: t('沿射线的 f(s)', 'f(s) along the ray'), color: '#0F6E56', points: pts }];
            },
        },
    ],
    example: {
        title: t('由走时场求慢度', 'Recovering slowness from a travel-time field'),
        input: t('二维走时场 T(x, z) = z / 3000 + x / 6000（单位 s，坐标 m）', 'A two-dimensional travel-time field T(x, z) = z/3000 + x/6000, in seconds with coordinates in metres'),
        steps: [
            t('∇T = (1/6000, 1/3000) s/m', '∇T = (1/6000, 1/3000) s/m'),
            t('|∇T| = sqrt(1/6000² + 1/3000²) = 3.73×10⁻⁴ s/m，故视速度 c = 1/|∇T| = 2683 m/s', '|∇T| = sqrt(1/6000² + 1/3000²) = 3.73×10⁻⁴ s/m, so the apparent velocity is c = 1/|∇T| = 2683 m/s'),
            t('∇T 的方向即波前法向，也就是射线方向', 'The direction of ∇T is the wavefront normal, that is, the ray direction'),
        ],
        output: t('走时场的梯度就是慢度矢量 —— 程函方程 |∇T| = 1/c 的来源', 'The gradient of the travel-time field is the slowness vector, the origin of the eikonal equation |∇T| = 1/c'),
    },
    links: {
        downstream: [
            { id: 'divergence', note: t('∇·u 是 ∇ 与矢量的点积', '∇·u is the dot product of ∇ with a vector') },
            { id: 'curl', note: t('∇×u 是 ∇ 与矢量的叉积', '∇×u is the cross product of ∇ with a vector') },
            { id: 'index-notation-kronecker', note: t('∇f 的分量写法 ∂_i f', 'the index form of ∇f is ∂_i f') },
        ],
        seealso: [{ id: 'snell-ray-parameter' }],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Arfken, Weber & Harris, Mathematical Methods for Physicists, 7th ed., §1.7' },
    ],
};
export default gradient;
//# sourceMappingURL=gradient.js.map