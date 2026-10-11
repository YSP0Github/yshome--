import { t } from '../../core/types.js';
/** dc-apparent-resistivity */
const dcApparentResistivity = {
    id: 'dc-apparent-resistivity',
    name: t('视电阻率', 'Apparent Resistivity'),
    aliases: { zh: ['视电阻率 ρa'], en: ['apparent resistivity ρa', 'equivalent half-space resistivity'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC'],
        keywords: t('视电阻率 装置系数 K 观测值 等效电阻率', 'apparent resistivity array factor measured equivalent'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\rho_{a}=K\,\frac{\Delta U}{I}`,
        variants: [
            { name: t('反求电流/电压', 'Solve for measured quantity'), latex: String.raw `\Delta U=\dfrac{\rho_{a}}{K}\,I` },
        ],
    },
    meaning: t('地下往往不是均匀介质，但我们仍按均匀半空间公式反算一个"等效电阻率" ρa。它是装置探测体积内各地层电阻率按电流线加权的平均值——既不是某一层的真实 ρ_e，也不是深度的直接测量。换装置、换电极距，ρa 就变；电测深正是靠 ρa 随极距增大的变化来反推地电断面。', 'The earth is rarely uniform, yet we still invert the measured voltage as if it were. The apparent resistivity ρa is a current-line-weighted average over the volume sensed by the array — neither a true layer resistivity nor a direct depth. Changing the array or electrode spacing changes ρa; DC soundings use how ρa evolves with spacing to infer the layered section.'),
    symbols: [
        { sym: '\\rho_{a}', name: t('视电阻率', 'apparent resistivity'), unit: 'Ω·m' },
        { sym: 'K', name: t('装置系数（几何因子）', 'array (geometric) factor'), unit: 'm', typical: '由电极排列决定' },
        { sym: '\\Delta U', name: t('测量极间电位差', 'potential difference between potential electrodes'), unit: 'V' },
        { sym: 'I', name: t('供电电流', 'injected current'), unit: 'A' },
    ],
    conditions: {
        applies: [t('任意直流四极装置，地表测量', 'Any DC four-electrode array at the surface')],
        assumes: [t('把实测值按均匀半空间解释', 'Measured value interpreted with the uniform half-space formula')],
        breaks: [t('地形起伏、不均匀体旁侧影响会使 ρa 畸变', 'Topography and off-body heterogeneity distort ρa')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('均匀半空间下电位差由点源解叠加', 'Superpose point-source potentials'),
            latex: String.raw `\Delta U=\dfrac{I\rho_{e}}{2\pi}\!\left(\dfrac{1}{r_{AM}}-\dfrac{1}{r_{AN}}-\dfrac{1}{r_{BM}}+\dfrac{1}{r_{BN}}\right)` },
        { n: 2, op: 'algebra', title: t('把几何项收进装置系数 K', 'Group geometry into K'),
            latex: String.raw `\Delta U=\dfrac{I\rho_{e}}{K}\;\Rightarrow\;\rho_{e}=K\dfrac{\Delta U}{I}` },
        { n: 3, op: 'result', title: t('非均匀时反算值即 ρa', 'In non-uniform ground the inverted value is ρa'),
            latex: String.raw `\rho_{a}=K\dfrac{\Delta U}{I}` },
    ],
    links: {
        upstream: [{ id: 'dc-point-source-potential' }],
        downstream: [{ id: 'dc-wenner-array', note: t('一个具体装置的 K', 'K for one concrete array') }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.3' }],
};
export default dcApparentResistivity;
//# sourceMappingURL=dc-apparent-resistivity.js.map