import { t } from '../../core/types.js';
/** modphys-stefan-boltzmann-law */
const modphysStefanBoltzmannLaw = {
    id: 'modphys-stefan-boltzmann-law',
    name: t('Stefan–Boltzmann 黑体辐射定律', 'Stefan–Boltzmann Law of Blackbody Radiation'),
    aliases: { zh: ['斯特藩-玻尔兹曼定律', '辐出度 M=σT⁴'], en: ['Stefan–Boltzmann law', 'exitance M = σT^4'] },
    node: 'S20.3',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.ENERGY'],
        keywords: t('黑体辐射 斯特藩 玻尔兹曼 辐出度 T⁴ 黑体 热辐射', 'blackbody radiation Stefan Boltzmann exitance T to fourth thermal radiation'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `M=\sigma T^4,\qquad \sigma=5.670\times10^{-8}\ \mathrm{W\,m^{-2}\,K^{-4}}`,
        variants: [
            { name: t('实际灰体（发射率 ε）', 'Real grey body (emissivity ε)'), latex: String.raw `M=\varepsilon\sigma T^4` },
            { name: t('净辐射功率（环境温度 T₀）', 'Net radiated power (environment at T0)'), latex: String.raw `P=\varepsilon\sigma A\left(T^4-T_0^4\right)` },
        ],
    },
    meaning: t('黑体单位面积辐射的总功率（辐出度）与绝对温度的四次方成正比：M = σT⁴。温度加倍，辐射功率变成 16 倍——这就是为什么炼钢炉里 1500 K 的白炽钢比 300 K 的室温物体耀眼得多。它解释了太阳表面、灯丝与地球热辐射的能量尺度。', 'The total power radiated per unit area of a blackbody (its exitance) scales as the fourth power of absolute temperature: M = σT⁴. Doubling the temperature multiplies the radiated power by 16 — why white-hot steel at 1500 K is so much brighter than a room-temperature object at 300 K. It sets the energy scale of the Sun, incandescent filaments and Earth’s thermal radiation.'),
    symbols: [
        { sym: 'M', name: t('辐出度（单位面积辐射功率）', 'exitance, power radiated per unit area'), unit: 'W/m²' },
        { sym: 'T', name: t('绝对温度', 'absolute temperature'), unit: 'K' },
        { sym: '\\sigma', name: t('Stefan–Boltzmann 常数', 'Stefan–Boltzmann constant'), unit: 'W/(m²·K⁴)' },
        { sym: '\\varepsilon', name: t('发射率', 'emissivity'), unit: '1' },
    ],
    conditions: {
        applies: [t('黑体或近似黑体的热辐射', 'Blackbody, or near-blackbody, thermal radiation')],
        assumes: [t('物体处于热平衡', 'The body is in thermal equilibrium')],
        breaks: [t('非热辐射（荧光、激光）不服从', 'Non-thermal emission (fluorescence, laser) does not obey it')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('Planck 谱对所有波长积分', 'Integrate the Planck spectrum over all wavelengths'), latex: String.raw `M=\int_0^\infty M_\lambda(\lambda,T)\,d\lambda` },
        { n: 2, op: 'transform', title: t('换元 x=hc/(λkT)', 'Substitute x = hc/(λkT)'), latex: String.raw `M=\frac{2\pi k^4T^4}{h^3c^2}\int_0^\infty\frac{x^3}{e^x-1}\,dx` },
        { n: 3, op: 'result', title: t('积分 = π⁴/15', 'The integral equals π⁴/15'), latex: String.raw `M=\frac{2\pi^5k^4}{15h^3c^2}T^4=\sigma T^4` },
    ],
    links: {
        upstream: [{ id: 'modphys-wien-displacement-law' }],
        downstream: [{ id: 'modphys-planck-energy-quantum' }],
    },
    refs: [{ text: 'Brehme & Beiser, Modern Physics, §3' }],
};
export default modphysStefanBoltzmannLaw;
//# sourceMappingURL=modphys-stefan-boltzmann-law.js.map