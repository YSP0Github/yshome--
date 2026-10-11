import { t } from '../../core/types.js';
/** mag-central-dipole-field */
const magCentralDipoleField = {
    id: 'mag-central-dipole-field',
    name: t('地心偶极子主磁场', 'Central Geocentric Dipole Main Field'),
    aliases: { zh: ['地心偶极', '地磁场偶极近似'], en: ['central dipole', 'geocentric dipole'] },
    node: 'S15.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.VECTOR'],
        method: ['METH.MAG'],
        quantity: ['Q.MAG'],
        keywords: t('地心偶极 纬度 倾角 tanI=2tanλ', 'geocentric dipole latitude inclination tan I 2 tan lat'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\tan I=2\tan\lambda`,
        variants: [
            { name: t('偶极场分量（λ 为地磁纬度）', 'dipole components (λ magnetic latitude)'), latex: String.raw `H=H_0\cos\lambda,\quad Z=2H_0\sin\lambda,\quad F=H_0\sqrt{1+3\sin^{2}\lambda}` },
        ],
    },
    meaning: t('地磁场最主要的成分（约 90%）等价于放在地心、略微倾斜的一个磁偶极子。在该近似下，磁倾角 I 与地磁纬度 λ 的关系是 tan I = 2 tan λ：赤道 I=0，纬度 45° 处 I≈63°，磁极 I=90°。实测值与这个理想偶极的偏离，就是非偶极场。', 'About 90% of the geomagnetic field equals a slightly inclined dipole at the Earth’s centre. Under this approximation, inclination I relates to magnetic latitude λ by tan I = 2 tan λ: I=0 at the equator, I≈63° at 45°, and 90° at the magnetic pole. Deviations of observed values from this ideal dipole constitute the non-dipole field.'),
    symbols: [
        { sym: 'I', name: t('磁倾角', 'inclination'), unit: '°' },
        { sym: '\\lambda', name: t('地磁纬度', 'magnetic latitude'), unit: '°' },
        { sym: 'H_0', name: t('赤道偶极场强度', 'equatorial dipole field strength'), unit: 'nT', typical: '≈30500' },
        { sym: 'H,Z', name: t('水平、垂直分量', 'horizontal, vertical components'), unit: 'nT' },
    ],
    conditions: {
        applies: [t('主磁场一阶近似', 'First-order main-field approximation')],
        assumes: [t('偶极位于地心、轴沿自转轴', 'Dipole at centre, aligned with rotation axis')],
        breaks: [t('非偶极场、磁异常、长期变化', 'Non-dipole field, anomalies, secular variation')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('偶极场 B_r=−2B0 cosθ, B_θ=−B0 sinθ', 'Dipole B_r, B_θ'),
            latex: String.raw `B_r=-\frac{\mu_0 m}{4\pi r^{3}}2\cos\theta,\ B_\theta=-\frac{\mu_0 m}{4\pi r^{3}}\sin\theta` },
        { n: 2, op: 'geometry', title: t('地磁纬度 λ=90°−θ', 'Magnetic latitude λ=90°−θ'),
            latex: String.raw `\theta=90^{\circ}-\lambda` },
        { n: 3, op: 'algebra', title: t('tan I = Z/H = |B_r|/B_θ', 'tan I = Z/H'),
            latex: String.raw `\tan I=\frac{2\cos\theta}{\sin\theta}=2\cot\theta=2\tan\lambda` },
        { n: 4, op: 'result', title: t('赤道 I=0，极 I=90°', 'Equator I=0, pole I=90°'),
            latex: String.raw `I=0\ \text{at equator},\quad I=90^{\circ}\ \text{at pole}` },
    ],
    links: {
        upstream: [{ id: 'mag-dipole-field-general' }, { id: 'mag-igrf-reference-field' }],
        downstream: [{ id: 'mag-earth-dipole-moment' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, §4.1' }],
};
export default magCentralDipoleField;
//# sourceMappingURL=mag-central-dipole-field.js.map