import { t } from '../../core/types.js';
/** rel-energy-momentum-relation */
const relEnergyMomentumRelation = {
    id: 'rel-energy-momentum-relation',
    name: t('相对论能量—动量关系', 'Relativistic Energy–Momentum Relation'),
    aliases: { zh: ['E²=(pc)²+(mc²)²'], en: ['E^2 = (pc)^2 + (mc^2)^2'] },
    node: 'S20.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('能量动量关系 E²=(pc)²+(mc²)² 光子零质量 四动量不变量', 'energy momentum relation E squared p c mass c squared massless photon four-momentum invariant'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `E^2=(pc)^2+(mc^2)^2`,
        variants: [
            { name: t('零质量粒子（光子）', 'Massless particle (photon)'), latex: String.raw `E=pc\quad(m=0)` },
        ],
    },
    meaning: t('把 E=γmc² 和 p=γmv 联立，消去速度，得到不依赖参考系的能量—动量关系：E²=(pc)²+(mc²)²。它像一个"勾股定理"，质量项是直角三角形的一条直角边。对零质量粒子（光子、引力子），m=0，直接给出 E=pc——把波粒二象性 E=hν、p=h/λ 完全统一起来。', 'Combining E = γmc² and p = γmv and eliminating the speed gives a frame-invariant energy–momentum relation: E² = (pc)² + (mc²)². It behaves like a Pythagorean theorem, with the mass term as one leg. For massless particles (photons, gravitons), m = 0 and it reduces to E = pc — unifying the wave–particle relations E = hν and p = h/λ.'),
    symbols: [
        { sym: 'E', name: t('总能量', 'total energy'), unit: 'J' },
        { sym: 'p', name: t('动量', 'momentum'), unit: 'kg·m/s' },
        { sym: 'm', name: t('静质量', 'rest mass'), unit: 'kg' },
        { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('自由粒子的能量—动量不变量', 'Energy–momentum invariant for a free particle')],
        assumes: [t('静质量 m 为不变量', 'Rest mass m is invariant')],
        breaks: [t('束缚系统需计入相互作用能', 'Bound systems must include interaction energy')],
    },
    derivation: [
        { n: 1, op: 'identity', title: t('E=γmc²、p=γmv', 'E = γmc² and p = γmv'), latex: String.raw `E^2-p^2c^2=\gamma^2m^2c^4-\gamma^2m^2v^2c^2` },
        { n: 2, op: 'algebra', title: t('代入 γ²=1/(1−v²/c²)', 'Substitute γ² = 1/(1−v²/c²)'), latex: String.raw `E^2-p^2c^2=\gamma^2m^2c^4\left(1-\frac{v^2}{c^2}\right)=m^2c^4` },
        { n: 3, op: 'result', title: t('能量—动量关系', 'Energy–momentum relation'), latex: String.raw `E^2=(pc)^2+(mc^2)^2` },
    ],
    links: {
        upstream: [{ id: 'rel-mass-energy-equivalence' }, { id: 'rel-relativistic-momentum' }],
        downstream: [{ id: 'modphys-photoelectric-effect', note: t('光子 E=pc', 'photon E = pc') }],
    },
    refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 4' }],
};
export default relEnergyMomentumRelation;
//# sourceMappingURL=rel-energy-momentum-relation.js.map