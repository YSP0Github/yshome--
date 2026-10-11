import { t } from '../../core/types.js';
/** radiated-seismic-energy */
const radiatedSeismicEnergy = {
    id: 'radiated-seismic-energy',
    name: t('辐射地震能量', 'Radiated Seismic Energy'),
    aliases: { zh: ['地震能量'], en: ['radiated energy', 'seismic energy'] },
    node: 'S4.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR', 'MATH.FOURIER'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.AMP'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `E_s=\frac{1}{2}\rho c\int\!\!\int\dot{u}^{2}(\boldsymbol{x},t)\,\mathrm{d}S\,\mathrm{d}t\cdot\left(\text{对全部方向与波型求和}\right)`,
        variants: [
            { name: t('用速度谱积分的形式', 'Integral over the velocity spectrum'), latex: String.raw `E_s=4\pi\rho c\,R^{2}\int\left|\dot{u}(f)\right|^{2}e^{2\pi f R/(Qc)}\,\mathrm{d}f` },
            { name: t('能量—震级关系', 'Energy–magnitude relation'), latex: String.raw `\log_{10}E_s=1.5\,M_s+11.8\quad(E_s\ \text{单位 erg})` },
            { name: t('SI 形式', 'SI form'), latex: String.raw `\log_{10}E_s=1.5\,M_s+4.8\quad(E_s\ \text{单位 J})` },
        ],
    },
    meaning: t('辐射能量是「这次地震一共向四面八方发出了多少焦耳的地震波」。它与地震矩是互补的两个量：M₀ 度量的是「错动了多少」，E_s 度量的是「耗费了多少能量」。两者之比给出视应力，是判断破裂效率的唯一途径。注意那个著名的常数 11.8（erg）与 4.8（J）差了 7 个单位 —— 因为 1 erg = 10⁻⁷ J。', 'Radiated energy is how many joules of seismic waves the earthquake sent out in all directions. It complements the seismic moment: M₀ measures how much slip occurred, E_s how much energy was spent. Their ratio gives the apparent stress, the only route to judging rupture efficiency. Note that the famous constants 11.8 (erg) and 4.8 (J) differ by exactly 7 units because 1 erg = 10⁻⁷ J.'),
    symbols: [
        { sym: 'E_s', name: t('辐射地震能量', 'radiated seismic energy'), unit: 'J', typical: '10⁶ – 10¹⁸' },
        { sym: '\\dot{u}', name: t('质点运动速度', 'particle velocity'), unit: 'm/s' },
        { sym: '\\rho,c', name: t('介质密度与波速', 'density and wave speed of the medium'), unit: 'kg/m³, m/s' },
        { sym: 'R', name: t('震源距', 'hypocentral distance'), unit: 'm' },
    ],
    conditions: {
        applies: [t('由宽频带记录估计震源辐射的总能量', 'Estimating total radiated energy from broadband records')],
        assumes: [
            t('已校正几何扩散、Q、场地效应与辐射花样', 'Geometrical spreading, Q, site effects and radiation pattern have been corrected'),
            t('台站方位覆盖充分', 'Azimuthal station coverage is adequate'),
        ],
        breaks: [t('高频段信噪比不足会严重低估能量，是 E_s 估计的主要误差源', 'Insufficient high-frequency signal-to-noise ratio badly underestimates energy — the main error source in E_s')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('单位面积单位时间的能流', 'Energy flux per unit area per unit time'),
            latex: String.raw `I=\rho\,c\,\dot{u}^{2}` },
        { n: 2, op: 'identity', title: t('对时间与包围震源的球面积分', 'Integrate over time and over a sphere enclosing the source'),
            latex: String.raw `E_s=\int\!\!\int\rho c\dot{u}^{2}\,\mathrm{d}t\,\mathrm{d}S` },
        { n: 3, op: 'substitute', title: t('校正沿路径的衰减', 'Correct for attenuation along the path'),
            latex: String.raw `\dot{u}_{\text{源}}=\dot{u}_{\text{台}}\,e^{\pi f R/(Qc)}` },
        { n: 4, op: 'result', title: t('得到谱积分形式', 'The spectral-integral form'),
            latex: String.raw `E_s=4\pi\rho c R^{2}\int|\dot{u}(f)|^{2}e^{2\pi f R/(Qc)}\,\mathrm{d}f` },
    ],
    links: {
        upstream: [{ id: 'geometrical-spreading', note: t('必须先除掉几何扩散', 'Geometrical spreading must be removed first') }],
        seealso: [{ id: 'apparent-stress', note: t('E_s/M₀ 给出视应力', 'E_s/M₀ gives the apparent stress') }],
    },
    refs: [{ text: 'Boatwright & Choy (1986), J. Geophys. Res., 91' }, { text: 'Kanamori (1977), J. Geophys. Res., 82' }],
};
export default radiatedSeismicEnergy;
//# sourceMappingURL=radiated-seismic-energy.js.map