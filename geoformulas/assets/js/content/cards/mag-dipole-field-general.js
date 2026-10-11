import { t } from '../../core/types.js';
/** mag-dipole-field-general */
const magDipoleFieldGeneral = {
    id: 'mag-dipole-field-general',
    name: t('磁偶极子场的一般形式', 'General Magnetic Field of a Dipole'),
    aliases: { zh: ['偶极场', 'B_r B_θ'], en: ['dipole field components'] },
    node: 'S15.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.GEOM'],
        method: ['METH.MAG'],
        quantity: ['Q.MAG'],
        keywords: t('偶极场 B_r B_θ 1/r³', 'dipole field components 1/r cube'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `B_r=-\frac{\mu_0}{4\pi}\frac{2m\cos\theta}{r^{3}},\qquad B_\theta=-\frac{\mu_0}{4\pi}\frac{m\sin\theta}{r^{3}}`,
        variants: [
            { name: t('总场强', 'total field magnitude'), latex: String.raw `B=\frac{\mu_0 m}{4\pi r^{3}}\sqrt{1+3\cos^{2}\theta}` },
        ],
    },
    meaning: t('对偶极标势求负梯度，得到偶极场的径向与纬向分量，都按 1/r³ 衰减（比点磁荷的 1/r² 快）。径向分量正比于 2cosθ，纬向分量正比于 sinθ。这正是地心主磁场的几何形状：场线从南半球出来、北半球回去，与一个放在地心的倾斜偶极一致。', 'Taking the negative gradient of the dipole potential gives radial and latitudinal components decaying as 1/r³ (faster than the 1/r² of a point pole). The radial component ∝ 2cosθ and the latitudinal ∝ sinθ. This is exactly the geometry of the main geomagnetic field: field lines emerge in the southern hemisphere and return in the north, matching an inclined dipole at the Earth’s centre.'),
    symbols: [
        { sym: 'B_r', name: t('偶极场径向分量（向外为正）', 'radial dipole component (outward positive)'), unit: 'T' },
        { sym: 'B_\\theta', name: t('偶极场纬向分量', 'latitudinal dipole component'), unit: 'T' },
        { sym: 'm', name: t('磁偶极矩', 'dipole moment'), unit: 'A·m²' },
        { sym: 'r', name: t('到场点距离', 'distance to field point'), unit: 'm' },
        { sym: '\\theta', name: t('极角（从偶极轴量起）', 'polar angle from dipole axis'), unit: '°' },
    ],
    conditions: {
        applies: [t('远场、球坐标轴对称情形', 'Far field, axisymmetric spherical case')],
        assumes: [t('偶极位于原点', 'Dipole at origin')],
        breaks: [t('近场需高阶多极修正', 'Higher multipoles near the dipole')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('偶极标势', 'Dipole scalar potential'),
            latex: String.raw `V=\frac{\mu_0}{4\pi}\frac{m\cos\theta}{r^{2}}` },
        { n: 2, op: 'geometry', title: t('球坐标梯度', 'Spherical-coordinate gradient'),
            latex: String.raw `B_r=-\frac{\partial V}{\partial r},\quad B_\theta=-\frac{1}{r}\frac{\partial V}{\partial\theta}` },
        { n: 3, op: 'substitute', title: t('分别求导', 'Differentiate each'),
            latex: String.raw `B_r=-\frac{\mu_0}{4\pi}\frac{2m\cos\theta}{r^{3}},\quad B_\theta=-\frac{\mu_0}{4\pi}\frac{m\sin\theta}{r^{3}}` },
        { n: 4, op: 'result', title: t('总场强', 'Total magnitude'),
            latex: String.raw `B=\sqrt{B_r^{2}+B_\theta^{2}}=\frac{\mu_0 m}{4\pi r^{3}}\sqrt{1+3\cos^{2}\theta}` },
    ],
    links: {
        upstream: [{ id: 'mag-dipole-potential' }],
        downstream: [{ id: 'mag-dipole-field-axial' }, { id: 'mag-central-dipole-field' }],
    },
    refs: [{ text: 'Blakely, Potential Theory, §5' }],
};
export default magDipoleFieldGeneral;
//# sourceMappingURL=mag-dipole-field-general.js.map