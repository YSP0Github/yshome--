import { t } from '../../core/types.js';
/** dc-array-geometric-factor */
const dcArrayGeometricFactor = {
    id: 'dc-array-geometric-factor',
    name: t('直流四极装置系数的一般式', 'General Geometric Factor of a DC Four-electrode Array'),
    aliases: { zh: ['K 的一般表达式', '极距几何因子'], en: ['general array factor', 'electrode-spacing geometric factor'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC', 'Q.GEOM'],
        keywords: t('装置系数 K 供电极 测量极 极距 四极排列', 'array factor current potential electrode spacing four-pole'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `K=\frac{2\pi}{\left(\dfrac{1}{r_{AM}}-\dfrac{1}{r_{AN}}-\dfrac{1}{r_{BM}}+\dfrac{1}{r_{BN}}\right)}`,
        variants: [
            { name: t('视电阻率回代', 'Back to apparent resistivity'), latex: String.raw `\rho_{a}=K\,\Delta U/I` },
        ],
    },
    meaning: t('A、B 为供电极，M、N 为测量极。把 A(+I)、B(−I) 两个点源在 M、N 处的电位叠加，就得到任意四极排列的装置系数 K。Wenner、Schlumberger、偶极—偶极都只是上式在不同极距比例下的特例。', 'A, B are current electrodes and M, N are potential electrodes. Superposing the point-source potentials of A(+I) and B(−I) at M and N gives the geometric factor K for any four-pole layout. Wenner, Schlumberger and dipole–dipole are just special cases of this formula at different spacing ratios.'),
    symbols: [
        { sym: 'K', name: t('装置系数', 'array factor'), unit: 'm' },
        { sym: 'r_{AM}', name: t('供电极 A 到测量极 M 的距离', 'distance A–M'), unit: 'm' },
        { sym: 'r_{AN}', name: t('A 到 N 的距离', 'distance A–N'), unit: 'm' },
        { sym: 'r_{BM}', name: t('B 到 M 的距离', 'distance B–M'), unit: 'm' },
        { sym: 'r_{BN}', name: t('B 到 N 的距离', 'distance B–N'), unit: 'm' },
    ],
    conditions: {
        applies: [t('地表水平、四极共线或任意平面布置', 'Flat surface, collinear or planar electrodes')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('A 极(+I)在 M、N 的电位', 'Potential from A(+I)'),
            latex: String.raw `U_{A}(M)=\dfrac{I\rho_{e}}{2\pi r_{AM}}\;,\quad U_{A}(N)=\dfrac{I\rho_{e}}{2\pi r_{AN}}` },
        { n: 2, op: 'physics', title: t('B 极(−I)在 M、N 的电位', 'Potential from B(−I)'),
            latex: String.raw `U_{B}(M)=-\dfrac{I\rho_{e}}{2\pi r_{BM}}\;,\quad U_{B}(N)=-\dfrac{I\rho_{e}}{2\pi r_{BN}}` },
        { n: 3, op: 'substitute', title: t('测量电位差 ΔU=U(M)−U(N)', 'Measured ΔU'),
            latex: String.raw `\Delta U=\dfrac{I\rho_{e}}{2\pi}\!\left(\dfrac{1}{r_{AM}}-\dfrac{1}{r_{AN}}-\dfrac{1}{r_{BM}}+\dfrac{1}{r_{BN}}\right)` },
        { n: 4, op: 'algebra', title: t('与 ρa=KΔU/I 比较定出 K', 'Match with ρa=KΔU/I'),
            latex: String.raw `K=\dfrac{2\pi}{\dfrac{1}{r_{AM}}-\dfrac{1}{r_{AN}}-\dfrac{1}{r_{BM}}+\dfrac{1}{r_{BN}}}` },
    ],
    links: {
        upstream: [{ id: 'dc-point-source-potential' }],
        downstream: [{ id: 'dc-wenner-array' }, { id: 'dc-schlumberger-array' }, { id: 'dc-dipole-dipole-array' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.3' }],
};
export default dcArrayGeometricFactor;
//# sourceMappingURL=dc-array-geometric-factor.js.map