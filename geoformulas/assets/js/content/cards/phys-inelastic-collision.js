import { t } from '../../core/types.js';
/** phys-inelastic-collision */
const physInelasticCollision = {
    id: 'phys-inelastic-collision',
    name: t('完全非弹性碰撞', 'Perfectly Inelastic Collision'),
    aliases: { zh: ['完全非弹性碰撞', '碰后粘在一起'], en: ['perfectly inelastic collision', 'sticking collision'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('完全非弹性碰撞 粘在一起 共同速度 动能损失', 'perfectly inelastic sticking common velocity kinetic loss'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `v'=\frac{m_1 v_1+m_2 v_2}{m_1+m_2}`,
        variants: [
            { name: t('动能损失', 'kinetic energy lost'), latex: String.raw `\Delta K=\tfrac{1}{2}\frac{m_1 m_2}{m_1+m_2}(v_1-v_2)^{2}` },
        ],
    },
    meaning: t('碰后两物体粘在一起、以共同速度运动，这叫完全非弹性碰撞。动量仍然守恒，但动能损失最大——损失的部分变成热、形变和声音。现实中车祸追尾、子弹打入木块留在里面，都接近这种碰撞。', 'When two bodies stick together and move at a common speed after impact, the collision is perfectly inelastic. Momentum is still conserved, but the kinetic-energy loss is maximal — the lost energy becomes heat, deformation and sound. Rear-end car crashes and a bullet lodging in a block are close to this case.'),
    symbols: [
        { sym: "v'", name: t('碰后共同速度', 'common velocity after collision'), unit: 'm/s' },
        { sym: 'm_1,m_2', name: t('两物体质量', 'masses'), unit: 'kg' },
        { sym: 'v_1,v_2', name: t('碰前速度', 'pre-collision velocities'), unit: 'm/s' },
        { sym: '\\Delta K', name: t('损失的动能', 'lost kinetic energy'), unit: 'J' },
    ],
    conditions: {
        applies: [t('碰后粘连为一体的碰撞', 'Collisions where bodies fuse into one')],
        assumes: [t('孤立系统、只动量守恒', 'Isolated system, only momentum conserved')],
        breaks: [t('部分粘连时用恢复系数一般式', 'Partial sticking uses the general restitution form')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('动量守恒', 'Momentum conserved'), latex: String.raw `m_1 v_1+m_2 v_2=(m_1+m_2)v'` },
        { n: 2, op: 'algebra', title: t('解出共同速度', 'Solve for the common velocity'), latex: String.raw `v'=\dfrac{m_1 v_1+m_2 v_2}{m_1+m_2}` },
    ],
    links: {
        upstream: [{ id: 'phys-conservation-momentum' }],
        seealso: [{ id: 'phys-elastic-collision' }, { id: 'phys-coefficient-restitution' }],
    },
};
export default physInelasticCollision;
//# sourceMappingURL=phys-inelastic-collision.js.map