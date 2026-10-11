import { t } from '../../core/types.js';
/** opt-spherical-mirror-equation */
const optSphericalMirrorEquation = {
    id: 'opt-spherical-mirror-equation',
    name: t('球面镜成像公式', 'Spherical Mirror Equation'),
    aliases: { zh: ['镜面公式', '凹面镜 凸面镜'], en: ['mirror formula', 'concave and convex mirrors'] },
    node: 'S20.1',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.GEOM'],
        keywords: t('球面镜 凹面镜 凸面镜 焦距 R/2 镜面公式 点火镜', 'spherical mirror concave convex focal length R over 2 mirror formula'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{1}{f}=\frac{1}{u}+\frac{1}{v},\qquad f=\frac{R}{2}`,
        variants: [
            { name: t('凹面镜 f>0，凸面镜 f<0', 'Concave mirror f > 0, convex mirror f < 0'), latex: String.raw `f=\frac{R}{2}\ \text{（凹正凸负）}` },
        ],
    },
    meaning: t('球面镜成像公式与薄透镜公式形式完全相同：1/f = 1/u + 1/v，但焦距是镜面曲率半径的一半 f = R/2。凹面镜（f>0）会聚光线，可成实像（手电筒反光碗、反射式望远镜）；凸面镜（f<0）总是成缩小正立虚像，用作汽车后视镜以扩大视野。', 'The spherical-mirror equation has exactly the same form as the thin-lens equation, 1/f = 1/u + 1/v, but the focal length is half the radius of curvature, f = R/2. A concave mirror (f > 0) converges light and forms real images (torch reflector, reflecting telescope); a convex mirror (f < 0) always forms a diminished upright virtual image, used as a car side mirror to widen the field of view.'),
    symbols: [
        { sym: 'f', name: t('焦距（凹面镜为正）', 'focal length, positive for concave mirrors'), unit: 'm' },
        { sym: 'R', name: t('镜面曲率半径', 'radius of curvature of the mirror surface'), unit: 'm' },
        { sym: 'u,v', name: t('物距、像距', 'object and image distances'), unit: 'm' },
    ],
    conditions: {
        applies: [t('近轴光线、球面反射镜', 'Paraxial rays on a spherical mirror')],
        assumes: [t('镜面为完美球面，反射面在入射侧', 'Perfectly spherical surface, reflective on the incoming side')],
        breaks: [t('大口径凹面镜近轴不成立，出现球差', 'Wide apertures violate the paraxial assumption and cause spherical aberration')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('球心 C 到镜面距离为 R', 'The centre of curvature C is R from the mirror'), latex: String.raw `\text{曲率中心 }C,\quad OC=R` },
        { n: 2, op: 'geometry', title: t('近轴平行光会聚于 R/2 处', 'Paraxial parallel rays meet at R/2'), latex: String.raw `f=\frac{R}{2}` },
        { n: 3, op: 'result', title: t('与透镜公式同形', 'Same form as the lens equation'), latex: String.raw `\frac{1}{f}=\frac{1}{u}+\frac{1}{v}` },
    ],
    links: {
        upstream: [{ id: 'opt-law-of-reflection' }],
        downstream: [{ id: 'opt-lateral-magnification' }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., ' }],
};
export default optSphericalMirrorEquation;
//# sourceMappingURL=opt-spherical-mirror-equation.js.map