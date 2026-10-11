import { t } from '../../core/types.js';
/** phys-impulse-momentum */
const physImpulseMomentum = {
    id: 'phys-impulse-momentum',
    name: t('冲量与动量定理', 'Impulse and the Impulse–Momentum Theorem'),
    aliases: { zh: ['冲量 Ft=Δp', '动量定理'], en: ['impulse', 'impulse–momentum theorem', 'J = Ft'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('冲量 动量定理 缓冲 延长作用时间 减力', 'impulse momentum cushioning longer time smaller force'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{J}=\int \mathbf{F}\,\mathrm{d}t=\Delta\mathbf{p}=m\mathbf{v}-m\mathbf{v}_0`,
        variants: [
            { name: t('恒力时的简化', 'constant-force simplification'), latex: String.raw `\mathbf{J}=\mathbf{F}_{\text{avg}}\,\Delta t=\Delta\mathbf{p}` },
        ],
    },
    meaning: t('力对时间的累积叫冲量，它等于动量的改变量。这条定理解释了为什么跳远要填沙坑、汽车要装安全气囊：在动量变化量 Δp 固定时，延长作用时间 Δt 就能减小平均冲击力 F——缓冲就是这个道理。', 'The time integral of a force is its impulse, equal to the change in momentum. This theorem explains why long-jump pits are filled with sand and cars have airbags: for a fixed momentum change Δp, stretching the contact time Δt lowers the average impact force F — that is what cushioning does.'),
    symbols: [
        { sym: '\\mathbf{J}', name: t('冲量', 'impulse'), unit: 'N·s' },
        { sym: '\\mathbf{F}', name: t('作用力（可随时间变）', 'force (may vary in time)'), unit: 'N' },
        { sym: '\\Delta\\mathbf{p}', name: t('动量变化量', 'change in momentum'), unit: 'kg·m/s' },
        { sym: '\\Delta t', name: t('作用时间', 'contact duration'), unit: 's' },
    ],
    conditions: {
        applies: [t('短时间碰撞、打击过程', 'Short impacts and collisions')],
        assumes: [t('外力（如重力）远小于冲力时可忽略', 'External forces negligible compared with the impulsive force')],
        breaks: [t('外力不可忽略时须一并计入', 'Include external forces when they are not negligible')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('Newton 第二定律的动量形式', 'Newton II in momentum form'), latex: String.raw `\mathbf{F}=\dfrac{\mathrm{d}\mathbf{p}}{\mathrm{d}t}` },
        { n: 2, op: 'transform', title: t('对时间从 t₁ 到 t₂ 积分', 'Integrate over time from t₁ to t₂'), latex: String.raw `\int_{t_1}^{t_2}\mathbf{F}\,\mathrm{d}t=\int_{p_1}^{p_2}\mathrm{d}\mathbf{p}` },
        { n: 3, op: 'result', title: t('得冲量等于动量变化', 'Impulse equals the momentum change'), latex: String.raw `\mathbf{J}=\Delta\mathbf{p}` },
    ],
    links: {
        upstream: [{ id: 'phys-newton-second-law' }, { id: 'phys-linear-momentum' }],
        seealso: [{ id: 'phys-conservation-momentum' }],
    },
};
export default physImpulseMomentum;
//# sourceMappingURL=phys-impulse-momentum.js.map