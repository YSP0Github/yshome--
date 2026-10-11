import { t } from '../../core/types.js';
/** phys-simple-harmonic-motion */
const physSimpleHarmonicMotion = {
    id: 'phys-simple-harmonic-motion',
    name: t('简谐运动', 'Simple Harmonic Motion'),
    aliases: { zh: ['SHM', 'x=Acos(ωt+φ)'], en: ['SHM', 'simple harmonic motion'] },
    node: 'S18.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.TRANSFORM'],
        method: ['METH.PHYS'],
        quantity: ['Q.AMP', 'Q.FREQ'],
        keywords: t('简谐运动 振幅 角频率 相位 弹簧振子 余弦', 'simple harmonic motion amplitude phase spring cosine oscillator'),
    },
    audience: 'highschool',
    complete: 'L3',
    statement: {
        main: String.raw `x(t)=A\cos(\omega t+\varphi)`,
        variants: [
            { name: t('速度、加速度', 'velocity and acceleration'), latex: String.raw `v=-A\omega\sin(\omega t+\varphi),\quad a=-\omega^{2}x` },
            { name: t('运动微分方程', 'governing differential equation'), latex: String.raw `\ddot{x}+\omega^{2}x=0` },
        ],
    },
    meaning: t('简谐运动是「回复力正比于位移、方向相反」时产生的周期运动，位移随时间按余弦规律变化。它是所有振动的原型——弹簧振子、单摆小角度、分子振动都近似 SHM。加速度 a=-ω²x 永远指向平衡位置，这是它最核心的特征。', 'Simple harmonic motion arises when the restoring force is proportional and opposite to displacement, giving a cosine oscillation. It is the prototype of all vibrations — spring-mass systems, small-angle pendulums, molecular vibrations. The hallmark is a = −ω² x, acceleration always pointing back to equilibrium.'),
    symbols: [
        { sym: 'x(t)', name: t('位移', 'displacement'), unit: 'm' },
        { sym: 'A', name: t('振幅', 'amplitude'), unit: 'm' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: '\\varphi', name: t('初相位', 'initial phase'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('线性回复力下的自由振动', 'Free oscillation under a linear restoring force')],
        assumes: [t('无阻尼、小振幅', 'Undamped, small amplitude')],
        breaks: [t('阻尼或大振幅非线性', 'Breaks with damping or nonlinear large amplitude')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('回复力 F=-kx', 'Restoring force F = −kx'), latex: String.raw `F=-kx` },
        { n: 2, op: 'physics', title: t('Newton 第二定律', 'Newton II'), latex: String.raw `m\ddot{x}=-kx` },
        { n: 3, op: 'algebra', title: t('写成标准形式', 'Bring to standard form'), latex: String.raw `\ddot{x}+\dfrac{k}{m}x=0,\quad \omega^{2}=\dfrac{k}{m}` },
        { n: 4, op: 'result', title: t('解为余弦', 'Solution is a cosine'), latex: String.raw `x=A\cos(\omega t+\varphi)` },
    ],
    viz: [
        {
            id: 'shm-wave',
            level: 'V1',
            title: t('位移、速度、加速度三条曲线', 'Displacement, velocity and acceleration traces'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 (m)', 'displacement (m)'),
            controls: [
                { id: 'A', label: t('振幅 A', 'amplitude A'), min: 0.1, max: 2, step: 0.1, value: 1, unit: 'm' },
                { id: 'f', label: t('频率 f', 'frequency f'), min: 0.1, max: 3, step: 0.1, value: 1, unit: 'Hz' },
            ],
            xRange: [0, 4],
            note: t('速度比位移超前 90°，加速度再超前 90°（与位移反相）；位移最大处速度为零、加速度最大。', 'Velocity leads displacement by 90°, acceleration by another 90° (opposite to displacement); at max displacement the velocity is zero and acceleration maximal.'),
            compute: (p) => {
                const A = p['A'];
                const w = 2 * Math.PI * p['f'];
                const xs = [];
                const vs = [];
                for (let i = 0; i <= 400; i++) {
                    const tt = (i / 400) * 4;
                    xs.push([tt, A * Math.cos(w * tt)]);
                    vs.push([tt, -A * w * Math.sin(w * tt)]);
                }
                return [
                    { label: t('x(t)', 'x(t)'), color: '#185FA5', points: xs },
                    { label: t('v(t)/ω', 'v(t)/ω'), color: '#BA7517', dash: true, points: vs },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'phys-elastic-potential-energy' }, { id: 'angular-frequency' }],
        downstream: [{ id: 'phys-mass-spring-oscillator' }, { id: 'phys-simple-pendulum' }],
    },
};
export default physSimpleHarmonicMotion;
//# sourceMappingURL=phys-simple-harmonic-motion.js.map