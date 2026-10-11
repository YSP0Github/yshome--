import { t } from '../../core/types.js';
/** modphys-compton-scattering */
const modphysComptonScattering = {
    id: 'modphys-compton-scattering',
    name: t('Compton 散射', 'Compton Scattering'),
    aliases: { zh: ['康普顿散射', 'Δλ=(h/mc)(1−cosθ)'], en: ['Compton effect', 'delta lambda = h/(mc)(1 - cos theta)'] },
    node: 'S20.3',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.ENERGY'],
        keywords: t('康普顿散射 光子 波长偏移 电子 康普顿波长 1−cosθ', 'Compton scattering photon wavelength shift electron Compton wavelength 1 - cos theta'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta\lambda=\frac{h}{m_ec}\left(1-\cos\theta\right)`,
        variants: [
            { name: t('电子康普顿波长', "Electron Compton wavelength"), latex: String.raw `\lambda_C=\frac{h}{m_ec}=2.426\times10^{-12}\ \mathrm{m}` },
        ],
    },
    meaning: t('X 射线被静止自由电子散射后，散射光波长变长（Δλ>0），且波长增量只与散射角 θ 有关：Δλ = (h/m_ec)(1−cosθ)。这是 Einstein 光子说的又一铁证——光子像实物粒子一样与电子发生弹性碰撞，交出一部分能量，因此能量降低、波长变长。它直接证明了光的粒子性。', 'When X-rays scatter off a stationary free electron, the scattered light has a longer wavelength (Δλ > 0), and the shift depends only on the scattering angle θ: Δλ = (h/m_ec)(1−cosθ). It is further decisive evidence for the photon picture — a photon collides elastically like a real particle, gives up part of its energy to the electron, and therefore emerges with lower energy and longer wavelength. It directly demonstrates the particle nature of light.'),
    symbols: [
        { sym: '\\Delta\\lambda', name: t('波长增量（此处为波长）', 'wavelength shift — note: wavelength here'), unit: 'm' },
        { sym: 'h', name: t('Planck 常数', 'Planck constant'), unit: 'J·s' },
        { sym: 'm_e', name: t('电子质量', 'electron mass'), unit: 'kg' },
        { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s' },
        { sym: '\\theta', name: t('散射角', 'scattering angle'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('X/γ 射线被静止自由电子散射', 'X- or γ-rays scattered by stationary free electrons')],
        assumes: [t('电子初始静止、束缚能远小于光子能量', 'Electron initially at rest; binding energy negligible vs photon energy')],
        breaks: [t('电子被紧束缚时康普顿效应消失（相干散射）', 'Compton effect vanishes for tightly bound electrons (coherent scattering)')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('碰撞前后能量守恒', 'Energy conservation in the collision'), latex: String.raw `\frac{hc}{\lambda}+m_ec^2=\frac{hc}{\lambda'}+E_e` },
        { n: 2, op: 'physics', title: t('动量守恒（矢量）', 'Vector momentum conservation'), latex: String.raw `\frac{h}{\lambda}\hat{\mathbf{k}}=\frac{h}{\lambda'}\hat{\mathbf{k}}'+\mathbf{p}_e` },
        { n: 3, op: 'algebra', title: t('消去电子动量', 'Eliminate the electron momentum'), latex: String.raw `\Delta\lambda=\lambda'-\lambda=\frac{h}{m_ec}(1-\cos\theta)` },
    ],
    links: {
        upstream: [{ id: 'modphys-photoelectric-effect' }],
        downstream: [{ id: 'modphys-de-broglie-wavelength' }],
    },
    refs: [{ text: 'Brehme & Beiser, Modern Physics, §5' }],
};
export default modphysComptonScattering;
//# sourceMappingURL=modphys-compton-scattering.js.map