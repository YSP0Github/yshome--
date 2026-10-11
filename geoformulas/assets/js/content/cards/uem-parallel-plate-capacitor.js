import { t } from '../../core/types.js';
/** uem-parallel-plate-capacitor */
const uemParallelPlateCapacitor = {
    id: 'uem-parallel-plate-capacitor',
    name: t('平行板电容器', 'Parallel-Plate Capacitor'),
    aliases: { zh: ['平行板电容 C=ε0A/d', '平板电容'], en: ['parallel plate', 'plate capacitor'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC', 'Q.GEOM'],
        keywords: t('平行板电容 ε0A/d 板间距 正对面积 匀强场', 'parallel plate capacitance epsilon0 A over d plate separation area uniform field'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `C=\frac{\varepsilon_{0}A}{d}`,
        variants: [
            { name: t('充介质 κ', 'With dielectric κ'), latex: String.raw `C=\dfrac{\kappa\varepsilon_{0}A}{d}` },
            { name: t('板间场强', 'Field between plates'), latex: String.raw `E=\dfrac{U}{d}=\dfrac{\sigma}{\varepsilon_{0}}` },
        ],
    },
    meaning: t('两块正对、间距 d 的平行金属板构成最基本的电容器。电容正比于正对面积 A、反比于板间距 d：面积越大、间距越小，电容越大。板间近似匀强电场 E=U/d。', 'Two parallel metal plates of area A separated by d form the basic capacitor. Capacitance is proportional to area A and inversely proportional to gap d: larger area and smaller gap give larger C. The field between plates is nearly uniform, E=U/d.'),
    symbols: [
        { sym: 'C', name: t('电容', 'capacitance'), unit: 'F' },
        { sym: 'A', name: t('极板正对面积', 'overlapping plate area'), unit: 'm²' },
        { sym: 'd', name: t('极板间距', 'plate separation'), unit: 'm' },
        { sym: '\\varepsilon_{0}', name: t('真空介电常数', 'permittivity'), unit: 'F/m' },
        { sym: '\\kappa', name: t('相对介电常数', 'relative permittivity'), unit: '—' },
    ],
    conditions: {
        applies: [t('板间距远小于板尺寸，忽略边缘效应', 'Gap much smaller than plate size; fringe neglected')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('无限大平板场强', 'Field of infinite sheets'),
            latex: String.raw `E=\dfrac{\sigma}{\varepsilon_{0}}=\dfrac{Q}{\varepsilon_{0}A}` },
        { n: 2, op: 'algebra', title: t('电压=E·d', 'Voltage = E·d'),
            latex: String.raw `U=E\,d=\dfrac{Q\,d}{\varepsilon_{0}A}` },
        { n: 3, op: 'result', title: t('代入 C=Q/U', 'Substitute into C=Q/U'),
            latex: String.raw `C=\dfrac{Q}{U}=\dfrac{\varepsilon_{0}A}{d}` },
    ],
    viz: [
        {
            id: 'c-vs-d',
            level: 'V1',
            title: t('平行板电容随面积与间距', 'Parallel-plate C vs area and gap'),
            xlabel: t('板间距 d (mm)', 'plate gap d (mm)'),
            ylabel: t('电容 C (pF)', 'capacitance C (pF)'),
            xRange: [0, 10],
            controls: [
                { id: 'area', label: t('面积 A (cm²)', 'area A'), min: 10, max: 1000, step: 10, value: 100, unit: 'cm²' },
            ],
            compute: (p) => {
                const A = p['area'] * 1e-4;
                const pts = [];
                for (let i = 1; i <= 200; i++) {
                    const dmm = (i / 200) * 10 + 0.05;
                    const d = dmm * 1e-3;
                    const C = 8.854e-12 * A / d;
                    pts.push([dmm, C * 1e12]);
                }
                return [{ label: t('C=ε0A/d', 'C=ε0A/d'), color: '#185FA5', points: pts }];
            },
            note: t('C 随 d 双曲线下降；增大正对面积 A 可整体抬高曲线。', 'C falls hyperbolically with d; increasing area A shifts the whole curve up.'),
        },
    ],
    links: {
        upstream: [{ id: 'uem-capacitance' }, { id: 'uem-potential-gradient-e' }],
        downstream: [{ id: 'uem-dielectric-constant' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §25' }],
};
export default uemParallelPlateCapacitor;
//# sourceMappingURL=uem-parallel-plate-capacitor.js.map