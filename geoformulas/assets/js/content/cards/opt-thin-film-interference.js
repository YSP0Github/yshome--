import { t } from '../../core/types.js';
/** opt-thin-film-interference */
const optThinFilmInterference = {
    id: 'opt-thin-film-interference',
    name: t('薄膜干涉与增透、增反膜', 'Thin-Film Interference: Anti-reflection and High-reflection Coatings'),
    aliases: { zh: ['薄膜干涉', '增透膜 增反膜 牛顿环母版'], en: ['thin film interference', 'AR / HR coating'] },
    node: 'S20.2',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS', 'METH.INSTR'],
        quantity: ['Q.OPT'],
        keywords: t('薄膜干涉 增透膜 增反膜 肥皂泡 镜头镀膜 半波损失', 'thin film interference anti-reflection high-reflection soap bubble lens coating half-wave loss'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `2nd\cos r=\left(k+\tfrac12\right)\lambda\ (\text{增透}),\qquad 2nd\cos r=k\lambda\ (\text{增反})`,
        variants: [
            { name: t('正入射时', 'Normal incidence'), latex: String.raw `2nd=\left(k+\tfrac12\right)\lambda\ (\text{反射相消，增透})` },
            { name: t('单层增透膜最小反射率条件 n=√n_sub', 'Minimum reflectance condition, n = sqrt(n_sub)'), latex: String.raw `n_{\text{膜}}=\sqrt{n_{\text{空气}}\,n_{\text{玻璃}}},\quad d=\frac{\lambda}{4n}` },
        ],
    },
    meaning: t('白光在肥皂泡、油膜或镜头镀膜的上下表面反射后叠加，因薄膜厚度不同而呈现彩色——这就是薄膜干涉。利用它可以"设计"反射：让膜厚满足 2nd=(k+½)λ 时两束反射光相消，就成了增透膜（相机镜头的蓝紫色镀膜）；反之满足 2nd=kλ 时相长，就成了高反膜（眼镜、激光器反射镜）。', 'White light reflecting from the top and bottom surfaces of a soap bubble, an oil slick or a lens coating interferes; varying film thickness yields the familiar colours — thin-film interference. One can design the reflection: setting 2nd = (k+½)λ cancels the two reflections, giving an anti-reflection (AR) coating (the bluish-purple film on camera lenses); setting 2nd = kλ reinforces them, giving a high-reflection (HR) coating for eyeglasses and laser mirrors.'),
    symbols: [
        { sym: 'n', name: t('薄膜折射率', 'refractive index of the film'), unit: '1' },
        { sym: 'd', name: t('薄膜厚度', 'film thickness'), unit: 'm' },
        { sym: 'r', name: t('光在膜内折射角', 'refraction angle inside the film'), unit: 'rad' },
        { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
        { sym: 'k', name: t('干涉级次', 'interference order'), unit: '1' },
    ],
    conditions: {
        applies: [t('膜厚与波长同量级（数百 nm）', 'Film thickness comparable to the wavelength (hundreds of nm)')],
        assumes: [t('考虑一次上、下表面反射，忽略多次反射', 'One top and one bottom reflection; multiple reflections neglected')],
        breaks: [t('膜太厚时条纹密到肉眼无法分辨', 'Too thick a film makes the fringes too dense to resolve')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('下表面反射光比上表面多走 2nd cos r', 'The lower-surface ray travels an extra 2nd cos r'), latex: String.raw `\delta=2nd\cos r` },
        { n: 2, op: 'physics', title: t('上、下反射各有半波损失（视两侧折射率而定）', 'Half-wave losses on the two reflections, depending on indices'), latex: String.raw `\Delta\varphi_{\text{附加}}=0\ \text{或}\ \pi` },
        { n: 3, op: 'result', title: t('增透（反射相消）条件', 'Anti-reflection (reflection cancellation) condition'), latex: String.raw `2nd\cos r=\left(k+\tfrac12\right)\lambda` },
    ],
    links: {
        upstream: [{ id: 'opt-path-difference-phase' }],
        downstream: [{ id: 'opt-newton-rings' }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., §9.4' }],
};
export default optThinFilmInterference;
//# sourceMappingURL=opt-thin-film-interference.js.map