import { t } from '../../core/types.js';
/** kinematic-ray-equations */
const kinematicRayEquations = {
    id: 'kinematic-ray-equations',
    name: t('运动学射线方程', 'Kinematic Ray Equations'),
    aliases: { zh: ['射线追踪方程', '射线微分方程组'], en: ['kinematic ray tracing', 'ray equations'] },
    node: 'S2.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.TELE', 'METH.INV'],
        quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{\mathrm{d}\boldsymbol{x}}{\mathrm{d}s}=v\,\boldsymbol{p},\qquad \frac{\mathrm{d}\boldsymbol{p}}{\mathrm{d}s}=\nabla u,\qquad \frac{\mathrm{d}T}{\mathrm{d}s}=u`,
        variants: [
            { name: t('用慢度矢量 p = ∇T 表示', 'With the slowness vector p = ∇T'), latex: String.raw `\boldsymbol{p}=\nabla T=u\,\hat{\boldsymbol{s}},\qquad |\boldsymbol{p}|=u` },
            { name: t('等价的二阶形式', 'Equivalent second-order form'), latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}s}\left(u\frac{\mathrm{d}\boldsymbol{x}}{\mathrm{d}s}\right)=\nabla u` },
        ],
    },
    meaning: t('把程函方程换成沿弧长积分的常微分方程组，就得到可以数值积分的射线追踪格式。三个方程分别告诉你：射线往哪走、慢度矢量怎么变、走时怎么累积。这是所有两点射线追踪、走时层析核函数计算的底层引擎。', 'Recasting the eikonal equation as a system of ODEs along arc length gives a ray-tracing scheme that can be integrated numerically. The three equations tell you where the ray goes, how the slowness vector turns, and how travel time accumulates. This is the engine beneath all two-point ray tracing and travel-time tomographic kernels.'),
    symbols: [
        { sym: '\\boldsymbol{x}(s)', name: t('射线位置', 'ray position'), unit: 'm' },
        { sym: '\\boldsymbol{p}', name: t('慢度矢量 ∇T', 'slowness vector ∇T'), unit: 's/m' },
        { sym: 'u=1/v', name: t('慢度', 'slowness'), unit: 's/m' },
        { sym: 's', name: t('沿射线的弧长', 'arc length along the ray'), unit: 'm' },
        { sym: 'T', name: t('走时', 'travel time'), unit: 's' },
    ],
    conditions: {
        applies: [t('光滑速度场中的高频射线追踪', 'High-frequency ray tracing in a smooth velocity field')],
        assumes: [
            t('v(x) 连续可微（间断面需单独处理边界条件）', 'v(x) is continuously differentiable; discontinuities need separate boundary conditions'),
            t('远离焦散点', 'Away from caustics'),
        ],
        breaks: [t('速度间断面上必须改用 Snell 定律做折射/反射', 'At velocity discontinuities one must switch to Snell’s law for refraction/reflection')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从程函方程出发', 'Start from the eikonal equation'),
            latex: String.raw `\left|\nabla T\right|^{2}=u^{2}(\boldsymbol{x})` },
        { n: 2, op: 'identity', title: t('沿射线对程函方程求导', 'Differentiate the eikonal equation along the ray'),
            latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}s}\left(\nabla T\right)=\left(\nabla T\cdot\nabla\right)\nabla T=\nabla u` },
        { n: 3, op: 'substitute', title: t('定义慢度矢量 p = ∇T', 'Define the slowness vector p = ∇T'),
            latex: String.raw `\boldsymbol{p}=\nabla T,\qquad \frac{\mathrm{d}\boldsymbol{p}}{\mathrm{d}s}=\nabla u`,
            note: t('慢度矢量总是朝着慢度增大的方向弯曲 —— 射线向低速区偏折。', 'The slowness vector always bends toward increasing slowness: rays refract toward low-velocity regions.') },
        { n: 4, op: 'identity', title: t('弧长与方向的关系', 'Relation between arc length and direction'),
            latex: String.raw `\frac{\mathrm{d}\boldsymbol{x}}{\mathrm{d}s}=\hat{\boldsymbol{s}}=\frac{\boldsymbol{p}}{u}=v\,\boldsymbol{p}` },
        { n: 5, op: 'result', title: t('走时沿射线累积', 'Travel time accumulates along the ray'),
            latex: String.raw `\frac{\mathrm{d}T}{\mathrm{d}s}=\nabla T\cdot\frac{\mathrm{d}\boldsymbol{x}}{\mathrm{d}s}=\boldsymbol{p}\cdot v\,\boldsymbol{p}=v\,u^{2}=u` },
    ],
    numerics: [
        {
            note: t('最简单的实现：四阶 Runge–Kutta 积分下面三个量', 'The simplest implementation: integrate the three quantities with fourth-order Runge–Kutta'),
            snippet: String.raw `// 状态向量 y = [x, z, px, pz, T]\ndyds = (y) => { const [x,z,px,pz] = y; const u = slow(x,z);\n  const [gx,gz] = gradSlow(x,z);\n  return [ px/(u*u), pz/(u*u), gx, gz, u ]; }`,
        },
    ],
    links: {
        upstream: [{ id: 'eikonal-equation', note: t('由它化出', 'Derived from it') }],
        seealso: [{ id: 'snell-ray-parameter', note: t('分层介质中的离散版本', 'The discrete version in layered media') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.4' }],
};
export default kinematicRayEquations;
//# sourceMappingURL=kinematic-ray-equations.js.map