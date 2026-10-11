import { t } from '../../core/types.js';
/** interbed-multiple */
const interbedMultiple = {
    id: 'interbed-multiple',
    name: t('层间多次波与散射级数', 'Internal Multiples & the Scattering Series'),
    aliases: { zh: ['层间多次波', '散射级数', 'peg-leg'], en: ['internal multiple', 'scattering series', 'peg-leg multiple'] },
    node: 'S3.7',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.PROC', 'METH.EXPL'],
        quantity: ['Q.AMP', 'Q.TIME'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `D(\omega) = P(\omega)\left[1 + \Gamma + \Gamma^{2} + \cdots\right] = \frac{P(\omega)}{1-\Gamma(\omega)}`,
        variants: [
            { name: t('逐阶写出', 'Term by term'), latex: String.raw `D = P + P\Gamma + P\Gamma^{2} + \dots` },
            { name: t('层间多次波的到时', 'Arrival time of an internal multiple'), latex: String.raw `t_{n} = t_{prim} + n\,\Delta t_{bed}` },
            { name: t('振幅随阶次衰减', 'Amplitude decay with order'), latex: String.raw `A^{(n)} \propto |R_{1}R_{2}|^{n}` },
        ],
    },
    meaning: t('层间多次波在两个强反射界面之间来回弹跳，既不在自由表面反射也不与水层有关，所以 SRME 预测不到它。它的能量通常比自由表面多次波弱得多，但只要界面足够强（盐顶、煤层和基底），它就能在叠加剖面上造出逼真的假构造。', 'Internal multiples bounce between two strong reflectors; they involve neither the free surface nor the water layer, so SRME cannot predict them. Their energy is usually far weaker than surface multiples, but with strong enough interfaces (salt top, coal seams, basement) they can create convincing false structure on stacked sections.'),
    symbols: [
        { sym: 'D', name: t('完整波场（含多次波）', 'full wavefield including multiples'), unit: '振幅' },
        { sym: 'P', name: t('一次波', 'primaries'), unit: '振幅' },
        { sym: '\\Gamma', name: t('往返散射算子', 'round-trip scattering operator'), unit: '无量纲' },
        { sym: '\\Delta t_{bed}', name: t('夹层的双程时间', 'two-way time of the intervening layer'), unit: 's' },
        { sym: 'R_{1}, R_{2}', name: t('上下界面的反射系数', 'reflection coefficients of the two interfaces'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('盐顶、煤层、基底等强反射界面下方的假构造识别', 'Recognising false structure beneath salt tops, coal seams and basement')],
        assumes: [
            t('存在两个强反射界面', 'Two strong reflecting interfaces exist'),
            t('多次波能量弱于一次波（级数收敛）', 'Multiple energy is weaker than primaries (the series converges)'),
        ],
        breaks: [
            t('|Γ| ≥ 1 时级数发散，物理上对应波导中的导波', 'For |Γ| ≥ 1 the series diverges, physically corresponding to guided waves in a waveguide'),
            t('三维散射使简单的 1D 往返模型失效', '3D scattering invalidates the simple 1D round-trip model'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把一次波记为 P', 'Denote the primaries by P'),
            latex: String.raw `D = P + (\text{一次反弹}) + (\text{两次反弹}) + \dots` },
        { n: 2, op: 'identity', title: t('每多一次往返乘一次 Γ', 'Each extra round trip multiplies by Γ'),
            latex: String.raw `\Gamma = R_1 R_2\,e^{i\omega\Delta t_{bed}}` },
        { n: 3, op: 'algebra', title: t('写成等比级数', 'Write it as a geometric series'),
            latex: String.raw `D = P\sum_{n=0}^{\infty}\Gamma^{n}` },
        { n: 4, op: 'algebra', title: t('|Γ| < 1 时求和', 'Sum it for |Γ| < 1'),
            latex: String.raw `D = \frac{P}{1-\Gamma}` },
        { n: 5, op: 'result', title: t('逐阶的到时与振幅', 'Arrival times and amplitudes order by order'),
            latex: String.raw `t^{(n)} = t_{prim} + n\Delta t_{bed},\qquad A^{(n)} \propto |R_1R_2|^{n}` },
    ],
    viz: [
        {
            id: 'multiple-decay',
            level: 'V1',
            title: t('层间多次波振幅随阶次的衰减', 'Internal-multiple amplitude versus order'),
            xlabel: t('阶次 n', 'order n'),
            ylabel: t('相对振幅 |R₁R₂|ⁿ', 'relative amplitude |R₁R₂|ⁿ'),
            controls: [
                { id: 'r1', label: t('上界面反射系数 R₁', 'upper reflectivity R₁'), min: 0.05, max: 0.6, step: 0.01, value: 0.3 },
                { id: 'r2', label: t('下界面反射系数 R₂', 'lower reflectivity R₂'), min: 0.05, max: 0.6, step: 0.01, value: 0.35 },
            ],
            note: t('两个界面都强时（如盐顶 + 盐底），即使到 4 阶仍有可观能量 —— 这就是为什么盐下成像这么难。', 'When both interfaces are strong (salt top + base), appreciable energy survives to fourth order — which is why subsalt imaging is so hard.'),
            compute: (p) => {
                const r1 = p['r1'], r2 = p['r2'];
                const g = r1 * r2;
                const pts = [];
                for (let n = 0; n <= 6; n++)
                    pts.push([n, Math.pow(g, n)]);
                return [{ label: t('|Γ|ⁿ', '|Γ|ⁿ'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('盐顶与盐底之间的多次波', 'Multiples between salt top and base'),
        input: t('R₁ = 0.30，R₂ = 0.35', 'R₁ = 0.30, R₂ = 0.35'),
        steps: [
            t('|Γ| = 0.105', '|Γ| = 0.105'),
            t('一阶 0.105，二阶 0.011，三阶 0.0012', 'First order 0.105, second 0.011, third 0.0012'),
        ],
        output: t('一阶层间多次波约为一次波的 10%，在弱反射区足以造假构造', 'First-order internal multiples are about 10% of the primary, enough to fake structure in weak-reflection zones'),
    },
    links: {
        upstream: [{ id: 'periodic-multiple', note: t('另一类多次波', 'The other class of multiples') }],
        seealso: [{ id: 'srme-surface-multiple-prediction', note: t('只处理自由表面多次波', 'Handles only free-surface multiples') }],
    },
    refs: [{ text: 'Weglein, A. et al. (1997). Inverse scattering series for multiple attenuation. Geophysics, 62, 1975–1989' }],
};
export default interbedMultiple;
//# sourceMappingURL=interbed-multiple.js.map