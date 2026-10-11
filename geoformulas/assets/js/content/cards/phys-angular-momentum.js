import { t } from '../../core/types.js';
/** phys-angular-momentum */
const physAngularMomentum = {
    id: 'phys-angular-momentum',
    name: t('角动量', 'Angular Momentum'),
    aliases: { zh: ['角动量 L=Iω'], en: ['angular momentum', 'L = Iω'] },
    node: 'S18.4',
    tags: {
        math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('角动量 L=Iω 转动动量 质点角动量', 'angular momentum rotational momentum particle'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `L=I\,\omega,\qquad \boldsymbol{L}=\mathbf{r}\times\mathbf{p}`,
        variants: [
            { name: t('力矩=角动量变化率', 'torque = rate of change of L'), latex: String.raw `\tau=\dfrac{\mathrm{d}L}{\mathrm{d}t}` },
        ],
    },
    meaning: t('角动量是转动版的动量：对绕固定轴转动的刚体，L=Iω；对质点则是 r×p。它同样有守恒律——合外力矩为零时 L 不变。角动量是量子力学里的基本守恒量之一，也是行星轨道、陀螺进动背后的主角。', 'Angular momentum is the rotational momentum: for a rigid body about a fixed axis L = Iω; for a point particle it is r×p. It too has a conservation law — when net torque vanishes, L is fixed. Angular momentum is one of the fundamental conserved quantities in quantum mechanics and lies behind planetary orbits and gyroscopic precession.'),
    symbols: [
        { sym: 'L', name: t('角动量', 'angular momentum'), unit: 'kg·m²/s' },
        { sym: 'I', name: t('转动惯量', 'moment of inertia'), unit: 'kg·m²' },
        { sym: '\\omega', name: t('角速度', 'angular velocity'), unit: 'rad/s' },
        { sym: '\\mathbf{r}\\times\\mathbf{p}', name: t('质点角动量', 'angular momentum of a point particle'), unit: 'kg·m²/s' },
    ],
    conditions: {
        applies: [t('绕固定轴转动的刚体或质点', 'Rigid body or particle about a fixed axis')],
        assumes: [t('刚体绕主轴', 'Body rotates about a principal axis')],
        breaks: [t('绕非主轴时 L 与 ω 不同向', 'About non-principal axes L and ω are not parallel')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('转动定律 τ=Iα', 'Rotational law τ = Iα'), latex: String.raw `\tau=I\alpha=I\dfrac{\mathrm{d}\omega}{\mathrm{d}t}` },
        { n: 2, op: 'identity', title: t('I 恒定时提出导数外', 'For constant I pull it outside'), latex: String.raw `\tau=\dfrac{\mathrm{d}(I\omega)}{\mathrm{d}t}=\dfrac{\mathrm{d}L}{\mathrm{d}t}` },
        { n: 3, op: 'result', title: t('故定义 L=Iω', 'Hence define L = Iω'), latex: String.raw `L=I\omega` },
    ],
    links: {
        upstream: [{ id: 'phys-rotational-dynamics-law' }],
        downstream: [{ id: 'phys-conservation-angular-momentum' }],
    },
};
export default physAngularMomentum;
//# sourceMappingURL=phys-angular-momentum.js.map