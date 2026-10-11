import { t } from '../../core/types.js';
/** gravity-spherical-harmonics-j2 */
const gravitySphericalHarmonicsJ2 = {
    id: 'gravity-spherical-harmonics-j2',
    name: t('引力位的球谐展开与 J₂ 扁率项', 'Spherical-harmonic Expansion of the Potential and the J₂ Term'),
    aliases: { zh: ['球谐展开', 'J2', '二阶带谐项'], en: ['spherical harmonic expansion', 'J2 zonal term'] },
    node: 'S14.4',
    tags: {
        math: ['MATH.TRANSFORM', 'MATH.GEOM'],
        method: ['METH.GRAV'],
        quantity: ['Q.GRAV'],
        keywords: t('球谐展开 J2 扁率 带谐项 大地水准面', 'spherical harmonic J2 flattening zonal geoid'),
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `V(r,\varphi)=-\frac{GM}{r}\left[1-\sum_{n=2}^{\infty}\left(\frac{R}{r}\right)^{n}J_n\,P_n(\sin\varphi)\right]`,
        variants: [
            { name: t('二阶主导项（扁率）', 'dominant second-order (flattening) term'), latex: String.raw `V\approx-\frac{GM}{r}\left[1+J_2\left(\frac{R}{r}\right)^{2}P_2(\sin\varphi)\right]` },
        ],
    },
    meaning: t('地球不是完美球体，其外部引力位可展开为带谐（只随纬度变化）和田谐（随经度变化）球谐的叠加。J₂ 是最大的一项，刻画赤道鼓起的扁率（约 1.08×10⁻³），决定了近地轨道的主要长期摄动和大地水准面的平均形状。更高阶项（J₃、…）对应大地水准面的精细起伏。', 'The Earth is not a perfect sphere; its external potential is expanded in zonal (latitude-only) and tesseral (longitude-dependent) spherical harmonics. J₂ is by far the largest, encoding the equatorial bulge (flattening, ≈1.08×10⁻³); it drives the dominant secular orbital perturbation and the mean shape of the geoid. Higher terms (J₃, …) capture finer undulations of the geoid.'),
    symbols: [
        { sym: 'V', name: t('引力位', 'gravitational potential'), unit: 'm²/s²' },
        { sym: 'GM', name: t('地球引力常数', 'geocentric gravitational constant'), unit: 'm³/s²', typical: '3.986×10¹⁴' },
        { sym: 'r', name: t('场点到地心距离', 'distance from geocentre'), unit: 'm' },
        { sym: 'J_n', name: t('n 阶带谐系数', 'zonal harmonic coefficient of degree n'), unit: '—' },
        { sym: 'P_n', name: t('n 阶 Legendre 多项式', "Legendre polynomial of degree n"), unit: '—' },
        { sym: '\\varphi', name: t('地理纬度', 'geographic latitude'), unit: '°' },
    ],
    conditions: {
        applies: [t('地球外部（r≥R）的引力位', 'External potential (r≥R)')],
        assumes: [t('多中心球谐展开，收敛于外部', 'Multi-centre expansion, converges externally')],
        breaks: [t('进入地球内部高阶项发散', 'Higher terms diverge inside the Earth')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把位对 1/r 展开', 'Expand the potential in powers of 1/r'),
            latex: String.raw `V(r,\varphi)=-\frac{GM}{r}\left[1+\sum J_n\left(\frac{R}{r}\right)^{n}P_n(\sin\varphi)\right]` },
        { n: 2, op: 'physics', title: t('轴对称（带谐）只留偶次主项', 'Axial symmetry keeps even zonal terms'),
            latex: String.raw `P_2(\sin\varphi)=\frac{3\sin^{2}\varphi-1}{2}` },
        { n: 3, op: 'substitute', title: t('J₂ 主导扁率', 'J₂ dominates the flattening'),
            latex: String.raw `J_2\approx1.0826\times10^{-3}` },
        { n: 4, op: 'result', title: t('高阶项描述大地水准面起伏', 'Higher terms describe geoid undulation'),
            latex: String.raw `N(\varphi,\lambda)\approx\frac{GM}{r\gamma}\sum\left(\frac{R}{r}\right)^{n}J_n P_n` },
    ],
    links: {
        upstream: [{ id: 'gravity-potential-point' }, { id: 'spherical-harmonics' }],
        seealso: [{ id: 'gravity-geoid-ellipsoid' }, { id: 'legendre-polynomials' }],
    },
    refs: [{ text: 'Hofmann-Wellenhof & Moritz, Physical Geodesy, §2; Kaula, Theory of Satellite Geodesy' }],
};
export default gravitySphericalHarmonicsJ2;
//# sourceMappingURL=gravity-spherical-harmonics-j2.js.map