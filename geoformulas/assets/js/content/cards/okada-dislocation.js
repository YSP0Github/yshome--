import { t } from '../../core/types.js';
/** okada-dislocation */
const okadaDislocation = {
    id: 'okada-dislocation',
    name: t('弹性位错与地表形变', 'Elastic Dislocation & Surface Deformation'),
    aliases: { zh: ['Okada 解', '位错模型', '地表形变'], en: ['Okada solution', 'dislocation model', 'surface deformation'] },
    node: 'S4.4',
    tags: {
        math: ['MATH.GEOM', 'MATH.VECTOR'],
        method: ['METH.TELE', 'METH.INV'],
        quantity: ['Q.GEOM', 'Q.SOURCE'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `u_{y}(x) = \frac{U}{\pi}\arctan\!\left(\frac{x}{d}\right)`,
        variants: [
            { name: t('Okada 一般形式', 'General Okada form'), latex: String.raw `u_i(\mathbf{x}) = U_j\,G_{ij}\!\left(\mathbf{x};\ L,\ W,\ d,\ \delta,\ \nu\right)` },
            { name: t('地震矩与位错量', 'Seismic moment and dislocation'), latex: String.raw `M_0 = \mu\,U\,L\,W` },
            { name: t('跨断层总位移', 'Total offset across the fault'), latex: String.raw `\Delta u = u_y(+\infty)-u_y(-\infty) = U` },
        ],
    },
    meaning: t('断层在深部滑动，我们在地表用 GPS 和 InSAR 测到的却是被弹性介质「抹平」之后的光滑曲线。这条 arctan 曲线是弹性位错理论最具标志性的结果：曲线越陡说明闭锁深度越浅，曲线两端之差就是深部滑动量。', 'A fault slips at depth, but what GPS and InSAR measure at the surface is a smooth curve smeared out by the elastic medium. This arctangent profile is the most iconic result of elastic dislocation theory: a steeper curve means a shallower locking depth, and the difference between the two ends is the slip at depth.'),
    symbols: [
        { sym: 'u_{y}', name: t('平行于断层的地表位移', 'surface displacement parallel to the fault'), unit: 'm' },
        { sym: 'U', name: t('深部滑动量', 'slip at depth'), unit: 'm' },
        { sym: 'd', name: t('闭锁深度', 'locking depth'), unit: 'km', typical: '5 – 25' },
        { sym: 'x', name: t('到断层的垂直距离', 'perpendicular distance from the fault'), unit: 'km' },
        { sym: '\\delta', name: t('断层倾角', 'fault dip'), unit: '°' },
        { sym: '\\nu', name: t('泊松比', 'Poisson’s ratio'), unit: '无量纲', typical: '0.25' },
    ],
    conditions: {
        applies: [t('由地表形变反演断层滑动、由滑动正演地表位移', 'Inverting fault slip from surface deformation; forward modelling surface displacement')],
        assumes: [
            t('均匀弹性半空间', 'Uniform elastic half-space'),
            t('二维直立走滑断层（导出 arctan 形式）', '2D vertical strike-slip fault (for the arctan form)'),
        ],
        breaks: [
            t('实际地壳分层、非均匀，需用分层 Green 函数', 'Real crust is layered and heterogeneous; layered Green functions are needed'),
            t('三维有限断层必须用 Okada 矩形位错解', '3D finite faults require the Okada rectangular dislocation solution'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把问题写成弹性半空间中的位错', 'Set up a dislocation in an elastic half-space'),
            latex: String.raw `\text{深部 } z>d \text{ 处滑动 } U,\ \text{地表 } z=0 \text{ 自由}` },
        { n: 2, op: 'physics', title: t('反平面（走滑）问题退化为调和方程', 'The antiplane problem reduces to Laplace’s equation'),
            latex: String.raw `\nabla^{2}u_y = 0` },
        { n: 3, op: 'identity', title: t('用保角映射或 Fourier 方法求解', 'Solve by conformal mapping or Fourier methods'),
            latex: String.raw `u_y(x,0) = \frac{U}{\pi}\left[\frac{\pi}{2}+\arctan\frac{x}{d}\right]` },
        { n: 4, op: 'algebra', title: t('去掉常数项（取断层处为零）', 'Drop the constant (set zero at the fault)'),
            latex: String.raw `u_y(x) = \frac{U}{\pi}\arctan\frac{x}{d}` },
        { n: 5, op: 'result', title: t('检验两端之差', 'Check the difference between the two ends'),
            latex: String.raw `u_y(+\infty)-u_y(-\infty) = \frac{U}{\pi}\left(\frac{\pi}{2}+\frac{\pi}{2}\right) = U` },
    ],
    viz: [
        {
            id: 'arctan-profile',
            level: 'V1',
            title: t('跨断层地表位移剖面', 'Surface displacement profile across a fault'),
            xlabel: t('到断层距离 x (km)', 'distance from fault x (km)'),
            ylabel: t('位移 u_y (m)', 'displacement u_y (m)'),
            controls: [
                { id: 'U', label: t('深部滑动 U (m)', 'slip at depth U (m)'), min: 0.5, max: 10, step: 0.1, value: 3 },
                { id: 'd', label: t('闭锁深度 d (km)', 'locking depth d (km)'), min: 2, max: 40, step: 0.5, value: 15 },
            ],
            note: t('闭锁深度越浅曲线越陡。野外用这条曲线的陡度反推 d，是现代活动断层研究的标准做法。', 'Shallower locking depth means a steeper curve. Inverting d from the steepness is standard practice in active-fault studies.'),
            compute: (p) => {
                const U = p['U'], d = p['d'];
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const x = -60 + (i / 300) * 120;
                    pts.push([x, (U / Math.PI) * Math.atan(x / d)]);
                }
                return [{ label: t('u_y(x)', 'u_y(x)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('走滑断层的地表位移', 'Surface displacement across a strike-slip fault'),
        input: t('U = 3 m，d = 15 km', 'U = 3 m, d = 15 km'),
        steps: [
            t('x = 15 km 处：u = (3/π) arctan(1) = 0.75 m', 'At x = 15 km: u = (3/π) arctan(1) = 0.75 m'),
            t('x = 60 km 处：u = (3/π) arctan(4) = 1.26 m', 'At x = 60 km: u = (3/π) arctan(4) = 1.26 m'),
        ],
        output: t('形变在约 3d 之外基本饱和，GPS 台站需布设在数十公里尺度上', 'Deformation saturates beyond about 3d, so GPS stations must span tens of kilometres'),
    },
    links: {
        upstream: [{ id: 'seismic-moment', note: t('地震矩与滑动量的关系', 'Relation between moment and slip') }],
        downstream: [{ id: 'slip-distribution-inversion', note: t('有限断层的滑动反演', 'Finite-fault slip inversion') }],
        seealso: [{ id: 'coulomb-stress-change', note: t('由位错场计算应力变化', 'Computing stress change from the dislocation field') }],
    },
    refs: [{ text: 'Okada, Y. (1985). Surface deformation due to shear and tensile faults in a half-space. Bull. Seismol. Soc. Am., 75, 1135–1154' }],
};
export default okadaDislocation;
//# sourceMappingURL=okada-dislocation.js.map