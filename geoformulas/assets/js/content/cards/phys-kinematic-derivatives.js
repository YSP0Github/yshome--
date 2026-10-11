import { t } from '../../core/types.js';
/** phys-kinematic-derivatives */
const physKinematicDerivatives = {
    id: 'phys-kinematic-derivatives',
    name: t('位移、速度与加速度的微分定义', 'Differential Definitions of Displacement, Velocity and Acceleration'),
    aliases: { zh: ['运动学导数', '速度定义', '加速度定义'], en: ['kinematic derivatives', 'velocity definition', 'acceleration definition'] },
    node: 'S18.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('位移 速度 加速度 导数 瞬时速度', 'displacement velocity acceleration derivative instantaneous'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{v}=\frac{\mathrm{d}\mathbf{r}}{\mathrm{d}t},\qquad \mathbf{a}=\frac{\mathrm{d}\mathbf{v}}{\mathrm{d}t}=\frac{\mathrm{d}^{2}\mathbf{r}}{\mathrm{d}t^{2}}`,
        variants: [
            { name: t('一维标量形式', '1-D scalar form'), latex: String.raw `v=\frac{\mathrm{d}x}{\mathrm{d}t},\qquad a=\frac{\mathrm{d}v}{\mathrm{d}t}=\frac{\mathrm{d}^{2}x}{\mathrm{d}t^{2}}` },
            { name: t('平均速度', 'average velocity'), latex: String.raw `\bar{\mathbf{v}}=\frac{\Delta\mathbf{r}}{\Delta t}` },
        ],
    },
    meaning: t('速度是位移对时间的一阶导数，加速度是速度对时间的一阶导数（位移的二阶导数）。运动学不关心物体为什么动，只回答「在哪、多快、变得多快」这三个问题；所有匀加速公式都是这两条定义在不同条件下的积分结果。', 'Velocity is the first time derivative of displacement, and acceleration is the first derivative of velocity (the second derivative of position). Kinematics does not ask why a body moves; it answers where, how fast, and how fast that speed changes. All constant-acceleration formulas are integrals of these two definitions.'),
    symbols: [
        { sym: '\\mathbf{r}', name: t('位置矢量', 'position vector'), unit: 'm' },
        { sym: '\\mathbf{v}', name: t('速度矢量', 'velocity vector'), unit: 'm/s' },
        { sym: '\\mathbf{a}', name: t('加速度矢量', 'acceleration vector'), unit: 'm/s²' },
        { sym: 't', name: t('时间', 'time'), unit: 's' },
    ],
    conditions: {
        applies: [t('任意质点的一维或多维运动', 'Motion of any point particle, in one or more dimensions')],
        assumes: [t('经典力学、时间与参考系已选定', 'Classical mechanics, with a chosen inertial frame and time coordinate')],
        breaks: [t('近光速时需相对论力学', 'Breaks near light speed, where relativistic mechanics is required')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从平均速度出发', 'Start from average velocity'), latex: String.raw `\bar{v}=\frac{\Delta x}{\Delta t}=\frac{x(t+\Delta t)-x(t)}{\Delta t}` },
        { n: 2, op: 'identity', title: t('令时间间隔趋于零得到瞬时速度', 'Take the limit to get instantaneous velocity'), latex: String.raw `v(t)=\lim_{\Delta t\to 0}\frac{\Delta x}{\Delta t}=\frac{\mathrm{d}x}{\mathrm{d}t}` },
        { n: 3, op: 'physics', title: t('同理对速度求变化率得加速度', 'Apply the same limiting process to velocity'), latex: String.raw `a(t)=\lim_{\Delta t\to 0}\frac{\Delta v}{\Delta t}=\frac{\mathrm{d}v}{\mathrm{d}t}=\frac{\mathrm{d}^{2}x}{\mathrm{d}t^{2}}` },
    ],
    links: {
        downstream: [{ id: 'phys-constant-acceleration', note: t('对 a=const 积分即得运动学方程', 'Integrating with a=const gives the kinematic equations') }],
        seealso: [{ id: 'phys-uniform-circular-motion' }],
    },
};
export default physKinematicDerivatives;
//# sourceMappingURL=phys-kinematic-derivatives.js.map