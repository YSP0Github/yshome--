import { t } from '../../core/types.js';
/** uem-dielectric-constant */
const uemDielectricConstant = {
    id: 'uem-dielectric-constant',
    name: t('介电常数', 'Dielectric Constant'),
    aliases: { zh: ['相对介电常数 κ', '电介质'], en: ['relative permittivity', 'dielectric'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('介电常数 κ 电介质 极化 增强电容 击穿', 'dielectric constant permittivity polarization increase capacitance breakdown'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `C=\kappa\,C_{0},\qquad \varepsilon=\kappa\,\varepsilon_{0}`,
        variants: [
            { name: t('真空 κ=1', 'Vacuum κ=1'), latex: String.raw `\kappa_{\mathrm{air}}\approx 1.0006,\quad \kappa_{\mathrm{glass}}\approx 5\!-\!10` },
        ],
    },
    meaning: t('在极板间填入绝缘电介质，分子极化产生反向电场，使等效电容增大 κ 倍（κ≥1）。纸、云母、陶瓷的 κ 常为 2–100，是做成小体积大电容的关键。', 'Filling the gap with an insulating dielectric polarizes its molecules, producing a back-field that raises the capacitance by a factor κ (κ≥1). Paper, mica and ceramics have κ≈2–100, enabling large capacitance in a small volume.'),
    symbols: [
        { sym: '\\kappa', name: t('相对介电常数', 'relative permittivity'), unit: '—' },
        { sym: 'C_{0}', name: t('真空时电容', 'capacitance in vacuum'), unit: 'F' },
        { sym: '\\varepsilon', name: t('介质介电常数', 'permittivity of medium'), unit: 'F/m' },
    ],
    conditions: {
        applies: [t('介质绝缘、未击穿；电场不超过击穿场强', 'Insulating, unbroken dielectric; field below breakdown strength')],
    },
    links: {
        upstream: [{ id: 'uem-parallel-plate-capacitor' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §25' }],
};
export default uemDielectricConstant;
//# sourceMappingURL=uem-dielectric-constant.js.map