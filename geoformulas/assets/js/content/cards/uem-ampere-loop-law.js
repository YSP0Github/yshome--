import { t } from '../../core/types.js';
/** uem-ampere-loop-law */
const uemAmpereLoopLaw = {
    id: 'uem-ampere-loop-law',
    name: t('Ampere 环路定律', "Ampère's Circuital Law"),
    aliases: { zh: ['安培环路定律', '∮B·dl=μ0I'], en: ["Ampere's law", 'closed line integral of B'] },
    node: 'S19.3',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.PHYS'],
        quantity: ['Q.MAG'],
        keywords: t('安培环路定律 B·dl μ0I 长直导线 螺线管 对称性', "Ampere's law B line integral mu0 I solenoid symmetry enclosed current"),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\oint_{C}\mathbf{B}\cdot d\mathbf{l}=\mu_{0}\,I_{\mathrm{enc}}`,
        variants: [
            { name: t('微分形式', 'Differential form'), latex: String.raw `\nabla\times\mathbf{B}=\mu_{0}\mathbf{J}` },
            { name: t('长直导线', 'Long straight wire'), latex: String.raw `B=\dfrac{\mu_{0}I}{2\pi r}` },
            { name: t('长螺线管内部', 'Inside a long solenoid'), latex: String.raw `B=\mu_{0}nI` },
        ],
    },
    meaning: t('沿任一闭合回路的 B 线积分，正比于回路所包围的总电流。它是磁学的 Gauss 定律：在高度对称（柱、螺线管、同轴电缆）下，绕一圈即可一步求出 B，远比直接积分 Biot–Savart 快。', 'The line integral of B around any closed loop is proportional to the total current it encloses. It is the magnetostatic analogue of Gauss\'s law: for high symmetry (cylinder, solenoid, coax), one loop integral yields B in a single step, far faster than integrating Biot–Savart.'),
    symbols: [
        { sym: '\\oint_{C}\\mathbf{B}\\cdot d\\mathbf{l}', name: t('B 的环路积分', 'closed loop integral of B'), unit: 'T·m' },
        { sym: 'I_{\\mathrm{enc}}', name: t('回路包围的总电流', 'enclosed current'), unit: 'A' },
        { sym: '\\mu_{0}', name: t('真空磁导率', 'permeability'), unit: 'H/m' },
    ],
    conditions: {
        applies: [t('稳恒电流；选与电流对称的安培回路', 'Steady current; choose a symmetric Amperian loop')],
        breaks: [t('无对称性时已知环流也难以分离出 B', 'Without symmetry, known circulation alone cannot isolate B')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('取圆形安培回路', 'Take a circular Amperian loop'),
            latex: String.raw `\oint\mathbf{B}\cdot d\mathbf{l}=B\cdot 2\pi r` },
        { n: 2, op: 'physics', title: t('等于 μ0 乘包围电流', 'Equals μ0 times enclosed current'),
            latex: String.raw `B\cdot 2\pi r=\mu_{0}I\ \Rightarrow\ B=\dfrac{\mu_{0}I}{2\pi r}` },
        { n: 3, op: 'transform', title: t('Stokes 定理得微分形式', "Stokes' theorem gives differential form"),
            latex: String.raw `\oint\mathbf{B}\cdot d\mathbf{l}=\int\nabla\times\mathbf{B}\cdot d\mathbf{S}=\mu_{0}\int\mathbf{J}\cdot d\mathbf{S}` },
    ],
    viz: [
        {
            id: 'b-vs-r-cylinder',
            level: 'V1',
            title: t('实心长导线内部/外部 B(r)', 'B(r) inside and outside a solid wire'),
            xlabel: t('距离 r (mm)', 'distance r (mm)'),
            ylabel: t('磁场 B (mT)', 'field B (mT)'),
            xRange: [0, 10],
            controls: [
                { id: 'iwire', label: t('电流 I (A)', 'current I'), min: 1, max: 100, step: 1, value: 20, unit: 'A' },
            ],
            compute: (p) => {
                const I = p['iwire'];
                const R = 5; // wire radius mm
                const pts = [];
                const mu0 = 4 * Math.PI * 1e-7;
                for (let i = 0; i <= 200; i++) {
                    const rmm = (i / 200) * 10 + 0.05;
                    const r = rmm * 1e-3;
                    // uniform current density: inside B∝r, outside B∝1/r
                    const B = (r <= R * 1e-3) ? mu0 * I * r / (2 * Math.PI * (R * 1e-3) ** 2) : mu0 * I / (2 * Math.PI * r);
                    pts.push([rmm, B * 1e3]);
                }
                return [{ label: t('实心导线 B(r)', 'solid wire B(r)'), color: '#7F77DD', points: pts }];
            },
            note: t('导线内 B∝r 线性增大，表面最大，外部 B∝1/r 衰减。', 'Inside the wire B∝r (linear), max at the surface, outside B∝1/r.'),
        },
    ],
    links: {
        upstream: [{ id: 'uem-straight-wire-b' }],
        downstream: [{ id: 'uem-solenoid-b' }],
        seealso: [{ id: 'uem-gauss-law', note: t('磁学对偶', 'magnetostatic analogue') }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §5.3' }],
};
export default uemAmpereLoopLaw;
//# sourceMappingURL=uem-ampere-loop-law.js.map