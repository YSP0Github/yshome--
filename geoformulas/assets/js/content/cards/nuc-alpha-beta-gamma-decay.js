import { t } from '../../core/types.js';
/** nuc-alpha-beta-gamma-decay */
const nucAlphaBetaGammaDecay = {
    id: 'nuc-alpha-beta-gamma-decay',
    name: t('α、β、γ 衰变', 'Alpha, Beta and Gamma Decay'),
    aliases: { zh: ['α衰变 β衰变 γ衰变 三种放射性'], en: ['alpha beta gamma decay three types of radioactivity'] },
    node: 'S20.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('α衰变 β衰变 γ衰变 氦核 电子 中微子 光子 半衰期', 'alpha beta gamma decay helium nucleus electron neutrino photon half-life'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\alpha:\ {}^{A}_{Z}\mathrm{X}\to{}^{A-4}_{Z-2}\mathrm{Y}+{}^4_2\mathrm{He};\quad \beta^-:\ {}^{A}_{Z}\mathrm{X}\to{}^{A}_{Z+1}\mathrm{Y}+e^-+\bar\nu_e;\quad \gamma:\ {}^*X\to X+\gamma`,
        variants: [
            { name: t('位移定律', 'Displacement law'), latex: String.raw `\alpha:\ A\!\downarrow\!4,\ Z\!\downarrow\!2;\qquad \beta:\ Z\!\pm\!1,\ A\ \text{不变}` },
        ],
    },
    meaning: t('天然放射性有三种：α 衰变放出氦核（⁴He），子核质量数减 4、电荷数减 2；β⁻ 衰变放出电子和反中微子，中子变质子，电荷数加 1、质量数不变；γ 衰变是激发态核放出一个高能光子跳到低能态，核素本身不变。α 电离强、穿透弱（一张纸挡住），γ 穿透最强（需铅板），β 居中。', 'Natural radioactivity comes in three kinds: alpha decay emits a helium nucleus (⁴He), with the daughter losing 4 in mass and 2 in charge; beta-minus decay emits an electron and antineutrino, turning a neutron into a proton (charge +1, mass unchanged); gamma decay is an excited nucleus dropping to a lower state by emitting a high-energy photon, with the nuclide itself unchanged. Alpha is strongly ionizing but weakly penetrating (stopped by paper); gamma penetrates most (needs lead); beta is in between.'),
    symbols: [
        { sym: '\\alpha', name: t('α 粒子（氦-4 核）', 'alpha particle (He-4 nucleus)'), unit: '1' },
        { sym: '\\beta', name: t('β 粒子（电子或正电子）', 'beta particle (electron or positron)'), unit: '1' },
        { sym: '\\gamma', name: t('γ 光子（此处为光子符号，勿与反射角混）', 'gamma photon (photon symbol here, not the reflection angle)'), unit: '1' },
        { sym: '\\bar\\nu_e', name: t('电子反中微子', 'electron antineutrino'), unit: '1' },
    ],
    conditions: {
        applies: [t('不稳定（放射性）核素', 'Unstable (radioactive) nuclides')],
        assumes: [t('衰变前后重子数、电荷数守恒', 'Baryon and charge number conserved')],
        breaks: [t('稳定核不发生衰变', 'Stable nuclei do not decay')],
    },
    links: {
        upstream: [{ id: 'nuc-activity' }],
        downstream: [{ id: 'nuc-radioactive-decay-law' }],
    },
    refs: [{ text: 'Krane, Introductory Nuclear Physics, §7–9' }],
};
export default nucAlphaBetaGammaDecay;
//# sourceMappingURL=nuc-alpha-beta-gamma-decay.js.map