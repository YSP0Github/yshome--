import { t } from '../../core/types.js';
/** uem-em-spectrum */
const uemEmSpectrum = {
    id: 'uem-em-spectrum',
    name: t('电磁波谱', 'Electromagnetic Spectrum'),
    aliases: { zh: ['电磁波谱', '频段划分'], en: ['EM spectrum', 'frequency bands'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.FREQ', 'Q.OPT'],
        keywords: t('电磁波谱 无线电 微波 红外 可见光 紫外 X射线 γ射线', 'EM spectrum radio microwave infrared visible ultraviolet X-ray gamma'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `c=\lambda f,\qquad E=h\,f`,
        variants: [
            { name: t('主要波段（频率）', 'Bands by frequency'), latex: String.raw `\text{无线电 }<3\times10^{9},\ \text{红外 }10^{12},\ \text{可见光 }(4\!-\!8)\times10^{14},\ \text{X}\sim10^{18}\ \mathrm{Hz}` },
        ],
    },
    meaning: t('所有电磁波按波长/频率排成电磁波谱：从无线电波、微波、红外、可见光、紫外到 X 射线与 γ 射线，本质相同，只是频率不同。c=λf 联系波长与频率；光子能量 E=hf 随频率升高而增大。', 'All electromagnetic waves are ordered by wavelength/frequency into the EM spectrum: from radio, microwave, infrared, visible, ultraviolet to X-rays and γ-rays—the same physics at different frequencies. c=λf links wavelength and frequency; photon energy E=hf grows with frequency.'),
    symbols: [
        { sym: 'c', name: t('光速', 'speed of light'), unit: 'm/s' },
        { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength'), unit: 'm' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
        { sym: 'h', name: t('Planck 常数', "Planck's constant"), unit: 'J·s' },
    ],
    conditions: {
        applies: [t('真空中电磁波；波段为近似划分', 'EM waves in vacuum; bands are approximate')],
    },
    links: {
        upstream: [{ id: 'uem-em-wave-speed' }],
        seealso: [{ id: 'uem-poynting-vector-energy' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §33' }],
};
export default uemEmSpectrum;
//# sourceMappingURL=uem-em-spectrum.js.map