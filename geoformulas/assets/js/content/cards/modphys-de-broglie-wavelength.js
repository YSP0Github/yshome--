import { t } from '../../core/types.js';
/** modphys-de-broglie-wavelength */
const modphysDeBroglieWavelength = {
    id: 'modphys-de-broglie-wavelength',
    name: t('de Broglie 物质波波长', 'de Broglie Matter-Wave Wavelength'),
    aliases: { zh: ['德布罗意波长', 'λ=h/p'], en: ['de Broglie wavelength', 'lambda = h/p'] },
    node: 'S20.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.ENERGY'],
        keywords: t('德布罗意波长 物质波 λ=h/p 电子衍射 波粒二象性', 'de Broglie wavelength matter wave lambda = h over p electron diffraction wave particle duality'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\lambda=\frac{h}{p}`,
        variants: [
            { name: t('非相对论电子（动能 K）', 'Non-relativistic electron (kinetic energy K)'), latex: String.raw `\lambda=\frac{h}{\sqrt{2m_eK}}` },
        ],
    },
    meaning: t('1924 年 de Broglie 大胆假设：不光光有波粒二象性，一切实物粒子（电子、质子、甚至你）都伴随波，波长 λ=h/p。h 极小，宏观物体波长短得不可观测；但电子动量小，波长可达 10⁻¹⁰ m，与晶体晶格同量级——于是 Davisson–Germer 用电子在镍单晶上衍射，证实了物质波，也成了电子显微镜的物理基础。', 'In 1924 de Broglie boldly proposed that not only light but every material particle (electron, proton, even you) has an associated wave with wavelength λ = h/p. Because h is tiny, the wavelengths of macroscopic objects are unobservably short; but an electron, with small momentum, can have a wavelength near 10⁻¹⁰ m — comparable to a crystal lattice. Davisson–Germer then diffracted electrons off a nickel crystal, confirming matter waves and founding electron microscopy.'),
    symbols: [
        { sym: '\\lambda', name: t('物质波波长（此处为波长）', 'matter-wave wavelength — note: wavelength here'), unit: 'm' },
        { sym: 'h', name: t('Planck 常数', 'Planck constant'), unit: 'J·s' },
        { sym: 'p', name: t('粒子动量', 'particle momentum'), unit: 'kg·m/s' },
    ],
    conditions: {
        applies: [t('自由粒子、非相对论或相对论通用', 'Free particle; valid relativistically and non-relativistically')],
        assumes: [t('粒子未被束缚', 'Particle not bound')],
        breaks: [t('宏观物体波长太短，波动性不可测', 'For macroscopic objects the wavelength is too short to measure')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('光子：E=hν、p=E/c', 'For a photon: E = hν, p = E/c'), latex: String.raw `p=\frac{E}{c}=\frac{h\nu}{c}=\frac{h}{\lambda}` },
        { n: 2, op: 'identity', title: t('de Broglie 把它推广到一切粒子', 'de Broglie extends this to all particles'), latex: String.raw `\lambda=\frac{h}{p}` },
    ],
    links: {
        upstream: [{ id: 'modphys-compton-scattering' }, { id: 'modphys-bohr-hydrogen-levels' }],
        downstream: [{ id: 'modphys-schrodinger-equation' }, { id: 'modphys-heisenberg-uncertainty' }],
    },
    refs: [{ text: 'Brehme & Beiser, Modern Physics, §7' }],
};
export default modphysDeBroglieWavelength;
//# sourceMappingURL=modphys-de-broglie-wavelength.js.map