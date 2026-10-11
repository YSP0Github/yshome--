import { t } from '../../core/types.js';
/** modphys-wien-displacement-law */
const modphysWienDisplacementLaw = {
    id: 'modphys-wien-displacement-law',
    name: t('Wien 位移定律', "Wien's Displacement Law"),
    aliases: { zh: ['维恩位移定律', 'λ_max T = b'], en: ["Wien's displacement law", 'lambda_max T = b'] },
    node: 'S20.3',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.FREQ'],
        keywords: t('维恩位移定律 峰值波长 λmaxT=b 黑体谱 色温 恒星颜色', "Wien's displacement law peak wavelength blackbody spectrum colour temperature stellar colour"),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\lambda_{\max} T=b,\qquad b=2.898\times10^{-3}\ \mathrm{m\cdot K}`,
        variants: [
            { name: t('Planck 谱分布', 'Planck spectral distribution'), latex: String.raw `M_\lambda(\lambda,T)=\frac{2\pi hc^2}{\lambda^5}\frac{1}{e^{hc/(\lambda kT)}-1}` },
        ],
    },
    meaning: t('黑体辐射谱的峰值波长与绝对温度成反比：λ_max·T = b。温度升高，谱峰向短波方向"蓝移"：太阳 5800 K 峰在 500 nm（可见光），白炽灯 3000 K 峰在 1 μm（红外，偏红黄），人体 310 K 峰在 10 μm（远红外，夜视仪探测它）。这就是"红色恒星冷、蓝色恒星热"的由来。', "The peak wavelength of a blackbody spectrum is inversely proportional to absolute temperature: λ_max·T = b. As temperature rises the peak shifts toward shorter wavelengths (blueshift): the Sun at 5800 K peaks near 500 nm (visible), a 3000 K filament peaks near 1 μm (infrared, reddish), and the human body at 310 K peaks near 10 μm (far infrared, what night-vision scopes detect). This is why red stars are cool and blue stars are hot."),
    symbols: [
        { sym: '\\lambda_{\\max}', name: t('辐射峰值波长（此处为波长）', 'peak wavelength — note: wavelength here'), unit: 'm' },
        { sym: 'T', name: t('绝对温度', 'absolute temperature'), unit: 'K' },
        { sym: 'b', name: t('Wien 位移常数', 'Wien displacement constant'), unit: 'm·K' },
    ],
    conditions: {
        applies: [t('黑体热辐射谱', 'Blackbody thermal spectrum')],
        assumes: [t('热平衡、连续谱', 'Thermal equilibrium, continuous spectrum')],
        breaks: [t('非热光源不适用', 'Not applicable to non-thermal sources')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('写出 Planck 谱', 'Write the Planck spectrum'), latex: String.raw `M_\lambda\propto\frac{1}{\lambda^5}\frac{1}{e^{hc/(\lambda kT)}-1}` },
        { n: 2, op: 'algebra', title: t('对 λ 求极值 dMλ/dλ=0', 'Set the derivative to zero, dMλ/dλ = 0'), latex: String.raw `\frac{dM_\lambda}{d\lambda}=0` },
        { n: 3, op: 'algebra', title: t('得超越方程 5(1−e⁻ˣ)=x', 'Yields the transcendental equation 5(1−e⁻ˣ) = x'), latex: String.raw `x=\frac{hc}{\lambda_{\max}kT}\approx4.965` },
        { n: 4, op: 'result', title: t('解出位移定律', 'Solve to get the displacement law'), latex: String.raw `\lambda_{\max}T=\frac{hc}{4.965\,k}=b` },
    ],
    viz: [
        {
            id: 'planck-spectrum',
            level: 'V1',
            title: t('不同温度下的黑体谱（峰位随 T 左移）', 'Blackbody spectra at several temperatures (peak shifts left as T rises)'),
            xlabel: t('波长 λ (nm)', 'wavelength λ (nm)'),
            ylabel: t('相对谱辐出度', 'relative spectral exitance'),
            controls: [
                { id: 'T', label: t('温度 T', 'temperature T'), min: 2000, max: 8000, step: 100, value: 5800, unit: 'K' },
            ],
            xRange: [100, 3000],
            note: t('拖动 T：谱峰向左（短波）移动且整体抬升。T=5800 K 峰在约 500 nm 可见光区；T=3000 K 峰移入红外，光偏红黄。', 'Drag T: the peak moves left (shorter wavelength) and the whole curve rises. At T = 5800 K the peak is near 500 nm (visible); at 3000 K it moves into the infrared and the light looks reddish.'),
            compute: (p) => {
                const T = p['T'];
                const c2 = 1.4388e-2; // hc/k in m·K
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const lamNm = 100 + (i / 400) * 2900;
                    const lam = lamNm * 1e-9;
                    const x = c2 / (lam * T);
                    const b = 1 / (Math.pow(lam, 5) * (Math.exp(x) - 1));
                    pts.push([lamNm, b]);
                }
                return [{ label: t('Mλ(λ)', 'Mλ(λ)'), color: '#993C1D', points: pts }];
            },
        },
    ],
    links: {
        upstream: [{ id: 'modphys-planck-energy-quantum' }],
        downstream: [{ id: 'modphys-stefan-boltzmann-law' }],
    },
    refs: [{ text: 'Brehme & Beiser, Modern Physics, §3' }],
};
export default modphysWienDisplacementLaw;
//# sourceMappingURL=modphys-wien-displacement-law.js.map