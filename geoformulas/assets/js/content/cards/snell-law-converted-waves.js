import { t } from '../../core/types.js';
/** snell-law-converted-waves */
const snellLawConvertedWaves = {
    id: 'snell-law-converted-waves',
    name: t('转换波的 Snell 定律', "Snell's Law for Converted Waves"),
    aliases: {
        zh: ['转换波', 'P-SV 转换', '波型转换', 'C 波'],
        en: ['converted wave', 'mode conversion', 'P-to-S conversion', 'C-wave'],
    },
    node: 'S2.2',
    tags: {
        math: ['MATH.GEOM'],
        method: ['METH.EXPL', 'METH.TELE'],
        quantity: ['Q.VEL', 'Q.GEOM'],
        keywords: t('转换波 波型转换 P-SV Snell 射线参数 临界角 四分量', 'converted wave mode conversion P-SV Snell ray parameter critical angle four-component'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{\sin i_{P}}{\alpha_{1}}=\frac{\sin j_{S}}{\beta_{2}}=p`,
        variants: [
            {
                name: t('P 入射、转换为透射 S', 'P incident, converted to transmitted S'),
                latex: String.raw `\sin j_{S}=\frac{\beta_{2}}{\alpha_{1}}\sin i_{P}`,
            },
            {
                name: t('S 入射、转换为透射 P', 'S incident, converted to transmitted P'),
                latex: String.raw `\sin i_{P}=\frac{\alpha_{2}}{\beta_{1}}\sin j_{S}`,
            },
            {
                name: t('转换波的临界角', 'Critical angle for the converted phase'),
                latex: String.raw `\sin i_{c}^{P\to S}=\frac{\alpha_{1}}{\beta_{2}},\qquad \sin j_{c}^{S\to P}=\frac{\beta_{1}}{\alpha_{2}}`,
            },
            {
                name: t('同一界面上反射转换', 'Reflected conversion at the same interface'),
                latex: String.raw `\frac{\sin i_{P}}{\alpha_{1}}=\frac{\sin j_{S}}{\beta_{1}}\;\Longrightarrow\; \sin j_{S}=\frac{\beta_{1}}{\alpha_{1}}\sin i_{P}`,
            },
        ],
    },
    meaning: t('界面上不只发生反射和透射，还会发生波型转换：一个入射 P 会同时产生反射 P、反射 S、透射 P、透射 S 四个子波。它们的传播方向各不相同，但水平慢度（射线参数 p）必须完全相同——这是界面上的切向波数守恒决定的。由于 β < α，转换出来的 S 波总是比透射 P 更接近铅垂方向，因而在同一界面上转换波与同类波有着互不相同的临界角。', 'An interface does more than reflect and transmit: it converts wave type. A single incident P generates four daughter waves — reflected P, reflected S, transmitted P and transmitted S. They travel in different directions, yet their horizontal slowness (the ray parameter p) must be identical, because the tangential wavenumber is conserved across the interface. Since β < α, the converted S is always closer to the vertical than the transmitted P, so converted phases have critical angles different from those of the same-type phases.'),
    symbols: [
        { sym: 'i_{P}', name: t('P 波射线与界面法线的夹角', 'angle between the P ray and the interface normal'), unit: '°', typical: '0 – 90' },
        { sym: 'j_{S}', name: t('S 波射线与界面法线的夹角', 'angle between the S ray and the interface normal'), unit: '°', typical: '0 – 90' },
        { sym: '\\alpha_{1},\\ \\alpha_{2}', name: t('界面上、下方介质的 P 波速度', 'P velocities above and below the interface'), unit: 'm/s', typical: '1500 – 8000' },
        { sym: '\\beta_{1},\\ \\beta_{2}', name: t('界面上、下方介质的 S 波速度', 'S velocities above and below the interface'), unit: 'm/s', typical: '800 – 4600' },
        { sym: 'p', name: t('射线参数（水平慢度），四个子波共有的守恒量', 'ray parameter (horizontal slowness), shared by all four daughter waves'), unit: 's/m', typical: '0 – 6e-4' },
        { sym: 'i_{c}^{P\\to S}', name: t('P→S 转换的临界角', 'critical angle for P→S conversion'), unit: '°' },
    ],
    conditions: {
        applies: [
            t('固—固界面上的 P-SV 转换（反射地震勘探的转换波、四分量海底电缆、远震 SKS/ScS 等震相）', 'P-SV conversion at solid–solid interfaces (converted-wave reflection surveys, four-component OBC, teleseismic SKS/ScS)'),
            t('需要计算转换点位置、转换波时距与动校正速度时', 'When computing conversion-point location, converted-wave moveout and correction velocities'),
        ],
        assumes: [
            t('界面水平（或局部可视为平面）、各向同性', 'A horizontal interface (or one locally planar) and isotropy'),
            t('高频近似：界面尺度远大于波长', 'High-frequency approximation: the interface scale is much larger than the wavelength'),
        ],
        breaks: [
            t('流体—固体界面不产生转换 S（流体中 β = 0）', 'No converted S at fluid–solid interfaces (β = 0 in the fluid)'),
            t('法向入射时无转换（转换系数随 sin i 趋于零），转换波能量集中在中等—大入射角', 'At normal incidence there is no conversion (the coefficient vanishes with sin i); converted energy concentrates at moderate to large incidence angles'),
            t('入射角超过临界角后，透射型转换波消失，只剩倏逝波', 'Beyond the critical angle the transmitted converted wave disappears and only an evanescent field remains'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('入射 P 在界面上产生四个子波', 'An incident P generates four daughter waves'),
            latex: String.raw `P_{\mathrm{in}}\ \longrightarrow\ P_{\mathrm{r}}P,\ P_{\mathrm{r}}S,\ P_{\mathrm{t}}P,\ P_{\mathrm{t}}S`,
        },
        {
            n: 2,
            op: 'physics',
            title: t('边界条件要求切向波数（水平慢度）守恒', 'The boundary conditions conserve the tangential wavenumber'),
            latex: String.raw `k_{x}=\frac{\omega\sin\theta}{c}=\omega\,p=\text{const}\quad\text{对所有子波}`,
            note: t('这是比几何 Snell 更根本的表述：界面上相位必须处处连续。', 'This is more fundamental than the geometric statement: the phase must be continuous everywhere along the interface.'),
        },
        {
            n: 3,
            op: 'identity',
            title: t('写成射线参数形式', 'Write it as the ray parameter'),
            latex: String.raw `p=\frac{\sin i_{P}}{\alpha}=\frac{\sin j_{S}}{\beta}`,
        },
        {
            n: 4,
            op: 'algebra',
            title: t('解出转换波的角度', 'Solve for the converted angle'),
            latex: String.raw `\sin j_{S}=p\,\beta_{2}=\frac{\beta_{2}}{\alpha_{1}}\sin i_{P}<\frac{\alpha_{2}}{\alpha_{1}}\sin i_{P}=\sin i_{P}^{\mathrm{trans}}`,
            note: t('因为 β₂ < α₂，转换 S 的角度总是小于透射 P 的角度，即转换波光线更「竖」。', 'Because β₂ < α₂ the converted S angle is always smaller than the transmitted P angle: the converted ray is more vertical.'),
        },
        {
            n: 5,
            op: 'result',
            title: t('各自不同的临界角', 'Each branch has its own critical angle'),
            latex: String.raw `\sin i_{c}^{P\to S}=\frac{\alpha_{1}}{\beta_{2}},\qquad \sin j_{c}^{S\to P}=\frac{\beta_{1}}{\alpha_{2}}`,
            note: t('β₁/α₂ 通常很小，所以 S→P 转换很容易进入临界；反之若 β₂ < α₁ 则 P→S 根本不存在临界角。', 'β₁/α₂ is usually small, so S→P conversion reaches critical easily; conversely, if β₂ < α₁ the P→S conversion has no critical angle at all.'),
        },
    ],
    links: {
        upstream: [
            { id: 'snell-ray-parameter', note: t('同类波的 Snell 定律', 'Snell\'s law for same-type waves') },
            { id: 'ps-wave-velocities', note: t('给出 α 与 β 的数值关系', 'gives the numerical relation between α and β') },
        ],
        downstream: [{ id: 'acoustic-reflection-coefficient', note: t('决定各子波的振幅分配', 'sets the amplitude partitioning among the daughter waves') }],
        seealso: [{ id: 'shuey-approximation' }],
    },
    refs: [
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §3.3' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.1' },
    ],
};
export default snellLawConvertedWaves;
//# sourceMappingURL=snell-law-converted-waves.js.map