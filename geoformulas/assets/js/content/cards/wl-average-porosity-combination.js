import { t } from '../../core/types.js';
/** wl-average-porosity-combination */
const wlAveragePorosityCombination = {
    id: 'wl-average-porosity-combination',
    name: t('中子—密度平均有效孔隙度', 'Neutron–Density Average Effective Porosity'),
    aliases: { zh: ['交会孔隙度', '有效孔隙度 φe'], en: ['crossplot porosity', 'effective porosity'] },
    node: 'S17.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.LOG', 'METH.ROCK'],
        quantity: ['Q.POR'],
        keywords: t('中子密度平均 有效孔隙度 交会 φe 气层校正', 'neutron density average effective porosity crossplot gas correction'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\phi_{e}=\frac{\phi_{N}+\phi_{D}}{2}\quad(\text{干净水层})`, variants: [
            { name: t('含气校正', 'Gas correction'), latex: String.raw `\phi_{e}\approx\phi_{D}+\dfrac{\phi_{D}-\phi_{N}}{2}\ \ (\text{气层偏向密度})` },
        ],
    },
    meaning: t('单一孔隙度曲线都有系统偏差：中子对气、粘土结合水敏感，密度对气也偏。把中子孔隙度 φN 与密度孔隙度 φD 取平均，可互相抵消部分系统误差，得到较可靠的有效孔隙度 φe。在气层，密度偏高、中子偏低，平均后仍需偏向密度一侧修正。', 'No single porosity curve is unbiased: neutron is sensitive to gas and clay-bound water, density also biases in gas. Averaging neutron φN and density φD cancels part of the systematic error and yields a more reliable effective porosity φe. In gas beds density reads high and neutron low, so the average is biased toward density.'),
    symbols: [
        { sym: '\\phi_{e}', name: t('有效孔隙度', 'effective porosity'), unit: 'v/v' },
        { sym: '\\phi_{N}', name: t('中子孔隙度', 'neutron porosity'), unit: 'v/v' },
        { sym: '\\phi_{D}', name: t('密度孔隙度', 'density porosity'), unit: 'v/v' },
    ],
    conditions: {
        applies: [t('干净砂岩，水层平均最准', 'Clean sandstone; most accurate in water beds')],
        breaks: [t('含泥质须先做 Vsh 校正', 'Shaliness requires a Vsh correction first')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('两条曲线各有偏', 'Each curve biased'),
            latex: String.raw `\phi_{N}\ \text{与}\ \phi_{D}\ \text{偏离真值}` },
        { n: 2, op: 'algebra', title: t('取平均抵消系统差', 'Average cancels bias'),
            latex: String.raw `\phi_{e}=(\phi_{N}+\phi_{D})/2` },
        { n: 3, op: 'result', title: t('气层偏向密度', 'Gas bias toward density'),
            latex: String.raw `\phi_{e}\approx\phi_{D}+(\phi_{D}-\phi_{N})/2` },
    ],
    links: {
        upstream: [{ id: 'wl-neutron-density-crossplot' }, { id: 'wl-porosity-from-density' }],
        downstream: [{ id: 'wl-archie-water-saturation', note: t('φe 代入 Archie', 'Feed φe into Archie') }],
    },
    refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §11' }],
};
export default wlAveragePorosityCombination;
//# sourceMappingURL=wl-average-porosity-combination.js.map