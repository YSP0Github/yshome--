import { t } from '../../core/types.js';
/** biot-coefficient */
const biotCoefficient = {
    id: 'biot-coefficient',
    name: t('Biot 系数与有效应力', "Biot's Coefficient & Effective Stress"),
    aliases: { zh: ['Biot 系数', '有效应力', '孔隙弹性'], en: ['Biot coefficient', 'effective stress', 'poroelasticity'] },
    node: 'S13.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.ROCK'],
        quantity: ['Q.MAT', 'Q.TENSOR'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\alpha = 1 - \frac{K_{\text{dry}}}{K_m},\qquad
\sigma_{ij}^{\text{eff}} = \sigma_{ij} - \alpha\,p_f\,\delta_{ij}`,
        variants: [
            { name: t('Terzaghi 有效应力是 α = 1 的特例', "Terzaghi effective stress is the α = 1 special case"), latex: String.raw `\sigma' = \sigma - p_f` },
            { name: t('Biot 模量 M', 'The Biot modulus M'), latex: String.raw `\frac{1}{M} = \frac{\alpha-\phi}{K_m}+\frac{\phi}{K_f}` },
            { name: t('Skempton 系数 B', "Skempton's coefficient B"), latex: String.raw `B = \frac{1/K_{\text{dry}} - 1/K_m}{1/K_{\text{dry}} - 1/K_m + \phi(1/K_f - 1/K_m)}` },
            { name: t('不排水与排水模量的关系', 'Undrained versus drained moduli'), latex: String.raw `K_{\text{undrained}} = K_{\text{dry}} + \alpha^{2}M` },
        ],
    },
    meaning: t('孔隙流体压力到底能在多大程度上「顶住」上覆应力？Biot 系数 α 就是答案：α = 1 时孔隙压力完全抵消围压（Terzaghi 的经典土力学），α = 0 时流体毫无作用（如致密结晶岩）。α 的大小取决于骨架相对于矿物的软硬程度。这个系数是理解注水诱发地震、水库触发地震与孔隙压力扩散的关键 —— 因为只要 α 不为零，往地下注Fluid 就会降低断层的有效正应力，从而把它推向失稳。', 'To what extent can pore-fluid pressure "hold up" the overburden stress? The Biot coefficient α is the answer: α = 1 means pore pressure fully cancels the confining stress (Terzaghi\'s classical soil mechanics), α = 0 means the fluid has no effect (as in tight crystalline rock). The value of α depends on how soft the frame is relative to the mineral. This coefficient is key to understanding injection-induced earthquakes, reservoir-triggered seismicity and pore-pressure diffusion — because as long as α is non-zero, injecting fluid reduces the effective normal stress on a fault and pushes it toward failure.'),
    symbols: [
        { sym: '\\alpha', name: t('Biot 有效应力系数', 'Biot effective-stress coefficient'), unit: '无量纲' },
        { sym: 'K_{\\text{dry}}, K_m', name: t('干骨架与矿物的体积模量', 'dry-frame and mineral bulk moduli'), unit: 'GPa' },
        { sym: 'p_f', name: t('孔隙流体压力', 'pore-fluid pressure'), unit: 'MPa' },
        { sym: 'M', name: t('Biot 模量', 'Biot modulus'), unit: 'GPa' },
        { sym: 'B', name: t('Skempton 系数（不排水孔隙压力响应）', "Skempton's coefficient (undrained pore-pressure response)"), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('诱发地震、储层压实与沉降、井壁稳定、孔隙压力扩散', 'Induced seismicity, reservoir compaction and subsidence, wellbore stability, pore-pressure diffusion')],
        assumes: [t('各向同性、线性孔隙弹性', 'Isotropic, linearly poroelastic')],
        breaks: [t('裂隙发育或强各向异性时需张量形式的 α', 'Fractured or strongly anisotropic media need a tensorial α'), t('化学活性粘土（渗透压效应）不在此框架内', 'Chemically active clay (osmotic effects) is outside this framework')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把总应力写成骨架承担的与流体承担的两部分', 'Split the total stress into a part carried by the frame and a part carried by the fluid'), latex: String.raw `\sigma = \sigma_{\text{eff}} + \alpha\,p_f` },
        { n: 2, op: 'physics', title: t('极端情形 1：干骨架与矿物一样硬时，流体承压无效', 'Limit 1: if the dry frame is as stiff as the mineral, fluid pressure has no effect'), latex: String.raw `K_{\text{dry}} = K_m \Longrightarrow \alpha = 0` },
        { n: 3, op: 'physics', title: t('极端情形 2：骨架极软，流体完全承压', 'Limit 2: a very soft frame means the fluid carries all the pressure'), latex: String.raw `K_{\text{dry}} \ll K_m \Longrightarrow \alpha \to 1` },
        { n: 4, op: 'algebra', title: t('线性插值给出 α = 1 − K_dry/K_m', 'Linear interpolation gives α = 1 − K_dry/K_m'), latex: String.raw `\alpha = 1-\frac{K_{\text{dry}}}{K_m}` },
        { n: 5, op: 'result', title: t('由体积守恒导出 Biot 模量 M', 'Volume conservation yields the Biot modulus M'), latex: String.raw `\frac{1}{M} = \frac{\alpha-\phi}{K_m}+\frac{\phi}{K_f}` },
    ],
    viz: [
        {
            id: 'biot-alpha',
            level: 'V2',
            title: t('α 与干骨架模量的关系及其对有效应力的影响', 'α versus dry-frame modulus and its effect on effective stress'),
            xlabel: t('干骨架模量 / 基质模量 K_dry/K_m', 'dry-frame / matrix modulus K_dry/K_m'),
            ylabel: t('Biot 系数 α', 'Biot coefficient α'),
            controls: [{ id: 'pf', label: t('孔隙压力 p_f (MPa)', 'pore pressure p_f (MPa)'), min: 0, max: 80, step: 1, value: 20 }],
            note: t('α 从 1（完全未固结）线性降到 0（与矿物同硬）。对同一个 20 MPa 的孔隙压力增量，未固结砂岩（α ≈ 0.9）的有效正应力降低 18 MPa，而致密灰岩（α ≈ 0.3）只降低 6 MPa —— 这解释了为什么注水诱发地震在松散沉积层中更容易发生。', 'α falls linearly from 1 (fully unconsolidated) to 0 (as stiff as the mineral). For the same 20 MPa pore-pressure increase, effective normal stress drops by 18 MPa in unconsolidated sandstone (α ≈ 0.9) but only 6 MPa in tight limestone (α ≈ 0.3) — which explains why injection-induced seismicity occurs more readily in loose sediments.'),
            compute: (p) => {
                const pf = p['pf'];
                const pts = [];
                const eff = [];
                for (let i = 0; i <= 200; i++) {
                    const r = (i / 200);
                    const al = 1 - r;
                    pts.push([r, al]);
                    eff.push([r, pf * al]);
                }
                return [
                    { label: t('α = 1 − K_dry/K_m', 'α = 1 − K_dry/K_m'), color: '#185FA5', points: pts },
                    { label: t('有效应力降低量 α·p_f (MPa)', 'effective-stress reduction α·p_f (MPa)'), color: '#993C1D', points: eff },
                ];
            },
        },
    ],
    example: {
        title: t('注水诱发地震的力学', 'Mechanics of injection-induced seismicity'),
        input: t('K_dry = 8 GPa，K_m = 37 GPa，注水使 p_f 增加 10 MPa', 'K_dry = 8 GPa, K_m = 37 GPa; injection raises p_f by 10 MPa'),
        steps: [
            t('α = 1 − 8/37 = 0.784', 'α = 1 − 8/37 = 0.784'),
            t('有效正应力降低 α·Δp_f = 7.84 MPa', 'Effective normal stress drops by α·Δp_f = 7.84 MPa'),
            t('按 μ = 0.6，抗剪强度降低 0.6 × 7.84 = 4.7 MPa', 'With μ = 0.6 the shear strength drops by 0.6 × 7.84 = 4.7 MPa'),
        ],
        output: t('仅 10 MPa 的孔隙压力增量就能让断层抗剪能力下降近 5 MPa', 'A mere 10 MPa pore-pressure increase can cut fault shear resistance by nearly 5 MPa'),
    },
    links: {
        upstream: [
            { id: 'biot-poroelasticity', note: t('Biot 理论的整体框架', 'The overall Biot framework') },
            { id: 'bulk-modulus-lame', note: t('模量之间的换算', 'Conversions among moduli') },
        ],
        seealso: [
            { id: 'gassmann-equation', note: t('Gassmann 是 Biot 的低频极限', 'Gassmann is the low-frequency limit of Biot') },
            { id: 'coulomb-stress-change', note: t('有效应力变化就是库仑应力变化的一项', 'Effective-stress change is one term of the Coulomb stress change') },
        ],
    },
    refs: [{ text: 'Biot (1941), General theory of three-dimensional consolidation, J. Appl. Phys. 12, 155–164' }],
};
export default biotCoefficient;
//# sourceMappingURL=biot-coefficient.js.map