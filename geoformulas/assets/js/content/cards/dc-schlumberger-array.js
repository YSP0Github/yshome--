import { t } from '../../core/types.js';
/** dc-schlumberger-array */
const dcSchlumbergerArray = {
    id: 'dc-schlumberger-array',
    name: t('Schlumberger 装置', 'The Schlumberger Array'),
    aliases: { zh: ['对称四极测深', '温纳-施伦伯格'], en: ['Schlumberger electrode array', 'sonde'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC', 'Q.GEOM'],
        keywords: t('Schlumberger 装置系数 AB/2 MN 电测深 屏蔽', 'Schlumberger array factor half-spacing sounding'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `K=\frac{\pi}{MN}\left[\left(\frac{AB}{2}\right)^{2}-\left(\frac{MN}{2}\right)^{2}\right]`,
        variants: [
            { name: t('MN≪AB 近似', 'MN ≪ AB approximation'), latex: String.raw `K\approx\dfrac{\pi}{MN}\left(\dfrac{AB}{2}\right)^{2}` },
        ],
    },
    meaning: t('供电极距 AB 很大、测量极距 MN 很小且居中，只移动 A、B 增大探测深度而 M、N 基本不动——这是电测深（VES）最常用的排列。相比 Wenner，它在大极距下仍能保持足够的电位差，因而更深、效率更高。', 'The current electrodes A, B are far apart while the potential electrodes M, N are close together and stay near the center; only A, B move to deepen the survey. This is the standard vertical electrical sounding (VES) array. Compared with Wenner it keeps a usable signal at large spreads, so it is deeper and more efficient.'),
    symbols: [
        { sym: 'K', name: t('装置系数', 'array factor'), unit: 'm' },
        { sym: 'AB', name: t('供电极距', 'current-electrode spacing'), unit: 'm' },
        { sym: 'MN', name: t('测量极距', 'potential-electrode spacing'), unit: 'm' },
    ],
    conditions: {
        applies: [t('MN 远小于 AB（测深条件）', 'MN much smaller than AB (sounding regime)')],
        assumes: [t('M、N 位于装置中点附近', 'M, N stay near the array midpoint')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('关于中点对称布置', 'Symmetric about the midpoint'),
            latex: String.raw `AM=AN=\dfrac{AB}{2}+\dfrac{MN}{2}\;,\quad BM=BN=\dfrac{AB}{2}-\dfrac{MN}{2}` },
        { n: 2, op: 'substitute', title: t('代入一般 K 式', 'Substitute into the general K'),
            latex: String.raw `\Delta U=\dfrac{I\rho_{e}}{2\pi}\!\left(\dfrac{2}{AM}-\dfrac{2}{BM}\right)` },
        { n: 3, op: 'algebra', title: t('化简并解出 ρa', 'Simplify and solve for ρa'),
            latex: String.raw `\rho_{a}=\dfrac{\pi}{MN}\left[\left(\dfrac{AB}{2}\right)^{2}-\left(\dfrac{MN}{2}\right)^{2}\right]\dfrac{\Delta U}{I}` },
    ],
    links: {
        upstream: [{ id: 'dc-array-geometric-factor' }],
        seealso: [{ id: 'dc-wenner-array' }, { id: 'dc-ves-curve' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.3.2' }],
};
export default dcSchlumbergerArray;
//# sourceMappingURL=dc-schlumberger-array.js.map