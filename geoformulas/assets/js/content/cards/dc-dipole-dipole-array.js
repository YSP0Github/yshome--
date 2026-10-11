import { t } from '../../core/types.js';
/** dc-dipole-dipole-array */
const dcDipoleDipoleArray = {
    id: 'dc-dipole-dipole-array',
    name: t('偶极—偶极装置', 'The Dipole–Dipole Array'),
    aliases: { zh: ['双偶极排列', '偶极剖面'], en: ['dipole–dipole array', 'pole–pole variant'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC', 'Q.GEOM'],
        keywords: t('偶极偶极 装置系数 n系数 剖面 横向分辨率', 'dipole dipole array factor n-parameter profiling'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `K=\pi a\,n(n+1)(n+2)`,
        variants: [
            { name: t('偶极长度 a，间距系数 n', 'Dipole length a, separation factor n'), latex: String.raw `AB=MN=a,\quad \text{中心距}=(n+1)a` },
            { name: t('视电阻率', 'Apparent resistivity'), latex: String.raw `\rho_{a}=K\,\Delta U/I=\pi a\,n(n+1)(n+2)\,\Delta U/I` },
        ],
    },
    meaning: t('供电偶极 AB 与测量偶极 MN 各自极距均为 a，两者中心相距 (n+1)a。装置系数 K=πa·n(n+1)(n+2) 随 n 三次方增长。偶极—偶极横向分辨率高、对浅部不均匀体（矿脉、溶洞）敏感，常用于二维断面测量，但信号弱、探测深度有限。', 'The current dipole AB and potential dipole MN each have length a, separated by (n+1)a. The array factor K=πa·n(n+1)(n+2) grows cubically with n. Dipole–dipole has high lateral resolution and sensitivity to near-surface inhomogeneities (veins, cavities), used for 2D sections; its signal is weak and depth limited.'),
    symbols: [
        { sym: 'K', name: t('装置系数', 'array factor'), unit: 'm' },
        { sym: 'a', name: t('单个偶极长度', 'length of each dipole'), unit: 'm' },
        { sym: 'n', name: t('偶极间距离系数（整数）', 'dipole separation parameter'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('两偶极共线、等长 a', 'Two collinear equal dipoles of length a')],
        breaks: [t('大 n 时 ΔU 极小，须叠加或改用其他装置', 'At large n ΔU is tiny; stacking or another array is needed')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('偶极布置 A-B-M-N，相邻距 a', 'Layout A-B-M-N at spacing a'),
            latex: String.raw `r_{AM}=3a,\; r_{AN}=2a,\; r_{BM}=a,\; r_{BN}=a` },
        { n: 2, op: 'algebra', title: t('代入一般 K 式', 'Substitute into general K'),
            latex: String.raw `\dfrac{1}{3a}-\dfrac{1}{2a}-\dfrac{1}{a}+\dfrac{1}{a}=\dfrac{1}{6a}` },
        { n: 3, op: 'result', title: t('单步偶极 K=6πa', 'For n=1, K=6πa'),
            latex: String.raw `K=\dfrac{2\pi}{1/(6a)}=12\pi a\;\;(\text{一般 }K=\pi a\,n(n+1)(n+2))` },
    ],
    links: {
        upstream: [{ id: 'dc-array-geometric-factor' }],
        seealso: [{ id: 'dc-wenner-array' }, { id: 'dc-apparent-resistivity' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.3.3' }],
};
export default dcDipoleDipoleArray;
//# sourceMappingURL=dc-dipole-dipole-array.js.map