import { t } from '../../core/types.js';
/** phys-work-energy-theorem */
const physWorkEnergyTheorem = {
    id: 'phys-work-energy-theorem',
    name: t('动能定理（功—能定理）', 'Work–Energy Theorem'),
    aliases: { zh: ['动能定理', '合外力的功等于动能变化'], en: ['work–energy theorem', 'net work equals change in KE'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.DIFF', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('动能定理 合外力做功 动能变化 W=ΔK', 'work energy theorem net work change kinetic energy'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `W_{\text{net}}=\Delta K=\tfrac{1}{2}m v^{2}-\tfrac{1}{2}m v_0^{2}`,
    },
    meaning: t('合外力对物体做的总功，等于物体动能的增量。它把「力×位移」和「速度变化」直接联系起来，让我们不必追究中间过程的细节就能求出末速度——这是它比 Newton 定律省时间的地方。做负功则动能减小。', 'The total work done by the net force equals the change in the body’s kinetic energy. It links force-times-displacement directly to the change in speed, letting us find the final velocity without tracking the whole path — which is where it saves effort over Newton’s law. Negative work lowers the kinetic energy.'),
    symbols: [
        { sym: 'W_{net}', name: t('合外力做的总功', 'total work by net force'), unit: 'J' },
        { sym: '\\Delta K', name: t('动能增量', 'change in kinetic energy'), unit: 'J' },
        { sym: 'v_0,v', name: t('初、末速率', 'initial and final speed'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('任何质点，力可保守可非保守', 'Any particle, conservative or non-conservative forces allowed')],
        assumes: [t('惯性系', 'Inertial frame')],
        breaks: [t('变质量体系需另列质量流项', 'Variable-mass systems need extra mass-flow terms')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('合外力沿位移方向做功', 'Net force does work along displacement'), latex: String.raw `W_{\text{net}}=\int F_{\parallel}\,\mathrm{d}s=\int m a\,\mathrm{d}s` },
        { n: 2, op: 'transform', title: t('用 a = dv/dt = v dv/ds 换元', 'Change variable using a = v dv/ds'), latex: String.raw `a=\dfrac{\mathrm{d}v}{\mathrm{d}t}=\dfrac{v\,\mathrm{d}v}{\mathrm{d}s}` },
        { n: 3, op: 'algebra', title: t('积分得动能差', 'Integrate to get the kinetic-energy difference'), latex: String.raw `W_{\text{net}}=\int_{v_0}^{v}m v\,\mathrm{d}v=\tfrac{1}{2}m v^{2}-\tfrac{1}{2}m v_0^{2}=\Delta K` },
    ],
    links: {
        upstream: [{ id: 'phys-work-by-force' }, { id: 'phys-newton-second-law' }, { id: 'phys-kinetic-energy' }],
        downstream: [{ id: 'phys-conservation-mechanical-energy' }],
    },
};
export default physWorkEnergyTheorem;
//# sourceMappingURL=phys-work-energy-theorem.js.map