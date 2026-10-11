import { t } from '../../core/types.js';
/** dynamic-ray-tracing */
const dynamicRayTracing = {
    id: 'dynamic-ray-tracing',
    name: t('动力学射线追踪方程组', 'Dynamic Ray-tracing Equations'),
    aliases: { zh: ['旁轴射线', '动力学追踪', '几何扩散矩阵'], en: ['dynamic ray tracing', 'paraxial ray', 'DRT system'] },
    node: 'S2.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.LINALG'],
        method: ['METH.TELE', 'METH.INV'],
        quantity: ['Q.AMP', 'Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{dQ}{ds} = v\,P,\qquad \frac{dP}{ds} = -\frac{v_{,nn}}{v^{2}}\,Q`,
        variants: [
            { name: t('以走时为参数', 'Using travel time as parameter'), latex: String.raw `\frac{dQ}{d\tau} = v^{2}P,\qquad \frac{dP}{d\tau} = -\frac{v_{,nn}}{v}\,Q` },
            { name: t('三维写成矩阵', 'Matrix form in 3D'), latex: String.raw `\frac{d\mathbf{Q}}{ds}=v\mathbf{P},\qquad \frac{d\mathbf{P}}{ds}=-\frac{1}{v^{2}}\mathbf{V}^{(2)}\mathbf{Q}` },
            { name: t('振幅与几何扩散', 'Amplitude and geometrical spreading'), latex: String.raw `A \propto \frac{1}{\sqrt{\rho\,v\,|\mathcal{J}|}},\qquad \mathcal{J} = |\det\mathbf{Q}|` },
        ],
    },
    meaning: t('运动学射线追踪只告诉你射线怎么走；动力学射线追踪额外告诉你「旁边一条差一点点的射线怎么偏」—— 也就是波前如何张开或收缩。Q 是几何扩散，它一旦经过零就出现焦散，振幅在那里形式上发散。', 'Kinematic ray tracing tells you where the ray goes; dynamic ray tracing additionally tells you how a slightly-offset neighbouring ray deviates — that is, how the wavefront spreads or contracts. Q is the geometrical spreading; when it passes through zero a caustic forms and the amplitude formally diverges.'),
    symbols: [
        { sym: 'Q', name: t('几何扩散（旁轴距离）', 'geometrical spreading (paraxial distance)'), unit: 'km^(1/2)' },
        { sym: 'P', name: t('Q 的共轭动量', 'conjugate momentum of Q'), unit: 's/km^(1/2)' },
        { sym: 's', name: t('沿射线的弧长', 'arc length along the ray'), unit: 'km' },
        { sym: 'v_{,nn}', name: t('速度对射线法向的二阶导数', 'second derivative of velocity along the ray normal'), unit: 's⁻¹/km' },
        { sym: '\\mathcal{J}', name: t('几何扩散因子', 'geometrical spreading factor'), unit: '无量纲' },
        { sym: '\\tau', name: t('走时', 'travel time'), unit: 's' },
    ],
    conditions: {
        applies: [t('高频渐近射线理论下计算振幅与几何扩散', 'Computing amplitude and geometrical spreading in high-frequency asymptotic ray theory')],
        assumes: [
            t('速度场二阶可微', 'The velocity field is twice differentiable'),
            t('远离焦散点（Q ≠ 0）', 'Away from caustics (Q ≠ 0)'),
        ],
        breaks: [
            t('Q → 0 时射线理论失效，需 Airy 函数或 Maslov 法', 'Ray theory fails as Q → 0; use Airy functions or the Maslov method'),
            t('强散射介质中旁轴近似不成立', 'The paraxial approximation fails in strongly scattering media'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('在射线中心坐标 (s, n) 中写程函', 'Write the eikonal in ray-centred coordinates (s, n)'),
            latex: String.raw `|\nabla\tau|^{2} = \frac{1}{v^{2}(s,n)}` },
        { n: 2, op: 'taylor', title: t('把速度在射线上展开到法向二阶', 'Expand the velocity to second order in the normal coordinate'),
            latex: String.raw `v(s,n) \approx v(s) + \frac{1}{2}v_{,nn}\,n^{2}` },
        { n: 3, op: 'taylor', title: t('走时场取旁轴二次型', 'Take a paraxial quadratic form for the travel-time field'),
            latex: String.raw `\tau(s,n) = \tau_{0}(s) + \frac{1}{2}\frac{P}{Q}\,n^{2}` },
        { n: 4, op: 'algebra', title: t('比较 n² 项系数', 'Match the coefficients of n²'),
            latex: String.raw `\frac{dQ}{ds} = vP,\qquad \frac{dP}{ds} = -\frac{v_{,nn}}{v^{2}}Q` },
        { n: 5, op: 'result', title: t('消去 P 得到单个二阶方程', 'Eliminate P to get a single second-order equation'),
            latex: String.raw `\frac{d^{2}Q}{ds^{2}} + \frac{v_{,nn}}{v}\,Q = \frac{v'_{s}}{v}\frac{dQ}{ds}\ \xrightarrow{\ v\,\text{缓变}\ }\ \frac{d^{2}Q}{ds^{2}} + \frac{v_{,nn}}{v}Q = 0` },
    ],
    viz: [
        {
            id: 'drt-focusing',
            level: 'V2',
            title: t('几何扩散 Q(s) 与聚焦/散焦', 'Geometrical spreading Q(s): focusing versus defocusing'),
            xlabel: t('沿射线距离 s (km)', 'distance along ray s (km)'),
            ylabel: t('Q 与相对振幅', 'Q and relative amplitude'),
            controls: [
                { id: 'v', label: t('速度 v (km/s)', 'velocity v (km/s)'), min: 3, max: 10, step: 0.1, value: 6 },
                { id: 'c', label: t('v_,nn × 10⁶', 'v_,nn × 10⁶'), min: -8, max: 8, step: 0.1, value: 4 },
            ],
            note: t('v_,nn > 0（速度沿法向是极小）时 Q 振荡并在零点形成焦散；v_,nn < 0 时 Q 指数发散，振幅快速衰减。', 'For v_,nn > 0 (velocity minimum along the normal) Q oscillates and forms caustics at its zeros; for v_,nn < 0 Q grows exponentially and the amplitude decays fast.'),
            compute: (p) => {
                const v = p['v'], c = p['c'] * 1e-6;
                const q = [];
                const amp = [];
                const smax = 400;
                for (let i = 0; i <= 400; i++) {
                    const s = (i / 400) * smax;
                    let Q;
                    if (Math.abs(c) < 1e-12) {
                        Q = s;
                    }
                    else if (c > 0) {
                        const b = Math.sqrt(c / v);
                        Q = Math.sin(b * s) / b;
                    }
                    else {
                        const g = Math.sqrt(-c / v);
                        Q = Math.sinh(g * s) / g;
                    }
                    q.push([s, Q]);
                    amp.push([s, 1 / Math.sqrt(Math.max(Math.abs(Q), 1e-3))]);
                }
                return [
                    { label: t('Q(s)', 'Q(s)'), color: '#185FA5', points: q },
                    { label: t('|Q|^{-1/2}（振幅）', '|Q|^{-1/2} (amplitude)'), color: '#993C1D', points: amp, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('均匀介质中的点源', 'Point source in a homogeneous medium'),
        input: t('v = 6 km/s，v_,nn = 0，Q(0) = 0，P(0) = 1/v', 'v = 6 km/s, v_,nn = 0, Q(0) = 0, P(0) = 1/v'),
        steps: [
            t('dQ/ds = v P = v/v = 1，dP/ds = 0', 'dQ/ds = v P = v/v = 1, dP/ds = 0'),
            t('Q = s，P = 1/v 恒定', 'Q = s, P = 1/v constant'),
            t('振幅 ∝ 1/√s —— 二维柱面扩散', 'Amplitude ∝ 1/√s — cylindrical spreading in 2D'),
        ],
        output: t('二维振幅 ∝ r^{-1/2}，三维换成 ∝ r^{-1}', 'In 2D the amplitude ∝ r^{-1/2}; in 3D it becomes ∝ r^{-1}'),
    },
    links: {
        upstream: [
            { id: 'kinematic-ray-equations', note: t('先有运动学追踪才有动力学追踪', 'Dynamic tracing requires kinematic tracing first') },
            { id: 'eikonal-equation', note: t('程函方程是共同起点', 'The eikonal equation is the common origin') },
        ],
        downstream: [{ id: 'geometrical-spreading', note: t('几何扩散的物理后果', 'Physical consequence of geometrical spreading') }],
    },
    refs: [{ text: 'Červený, Seismic Ray Theory, Cambridge Univ. Press, 2001, ch. 3' }],
};
export default dynamicRayTracing;
//# sourceMappingURL=dynamic-ray-tracing.js.map