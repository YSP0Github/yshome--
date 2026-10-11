import { t } from '../../core/types.js';
/** dc-ohm-law-resistivity */
const dcOhmLawResistivity = {
    id: 'dc-ohm-law-resistivity',
    name: t('Ohm 定律与电阻率', "Ohm's Law and Resistivity"),
    aliases: { zh: ['微分形式 Ohm 定律', '电导率'], en: ["differential Ohm's law", 'conductivity'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC'],
        keywords: t('电阻率 电导率 电流密度 Ohm定律', 'resistivity conductivity current density Ohm'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `R=\rho_{e}\frac{L}{A}\;,\qquad \mathbf{J}=\sigma\,\mathbf{E}=\frac{1}{\rho_{e}}\mathbf{E}`,
        variants: [
            { name: t('宏观电阻形式', 'Macroscopic resistance'), latex: String.raw `R=\dfrac{U}{I}=\rho_{e}\dfrac{L}{A}` },
            { name: t('电导率形式', 'Conductivity form'), latex: String.raw `\sigma=\dfrac{1}{\rho_{e}}\quad[\mathrm{S/m}]` },
        ],
    },
    meaning: t('电阻率 ρ_e 是物质本身的属性：相同电压下，导电好的岩石（孔隙水含盐多）ρ_e 小，绝缘好的岩石（致密、含油气）ρ_e 大。电法勘探正是靠测地下 ρ_e 的横向/纵向变化来区分岩性与含流体情况。注意本站用 ρ 表示密度，电阻率一律写作 ρ_e。', 'Resistivity ρ_e is an intrinsic material property: rocks that conduct well (salty pore water) have small ρ_e, while insulating rocks (dense, oil-bearing) have large ρ_e. Electrical exploration maps the lateral/vertical variation of ρ_e to distinguish lithology and fluids. Note ρ is reserved for density site-wide; resistivity is written ρ_e here.'),
    symbols: [
        { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
        { sym: '\\rho_{e}', name: t('电阻率（材料属性）', 'resistivity (material property)'), unit: 'Ω·m', typical: '1 – 10⁵' },
        { sym: 'L', name: t('电流路径长度', 'current-path length'), unit: 'm' },
        { sym: 'A', name: t('电流横截面积', 'cross-sectional area'), unit: 'm²' },
        { sym: '\\mathbf{J}', name: t('电流密度矢量', 'current density vector'), unit: 'A/m²' },
        { sym: '\\sigma', name: t('电导率', 'conductivity'), unit: 'S/m' },
        { sym: '\\mathbf{E}', name: t('电场强度', 'electric field'), unit: 'V/m' },
    ],
    conditions: {
        applies: [t('各向同性介质、稳恒（直流）电流', 'Isotropic medium, steady (DC) current')],
        assumes: [t('忽略电极极化与接触电阻', 'Electrode polarization and contact resistance neglected')],
        breaks: [t('各向异性地层 ρ_e 是张量', 'In anisotropic rocks ρ_e is a tensor')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('欧姆定律的宏观形式', 'Macroscopic Ohm law'),
            latex: String.raw `U=RI`, note: t('电压正比于电流，比例系数即电阻 R', 'Voltage is proportional to current; the constant is R') },
        { n: 2, op: 'physics', title: t('电阻随几何尺寸变化', 'Scaling R with geometry'),
            latex: String.raw `R\propto \dfrac{L}{A}\;\Rightarrow\; R=\rho_{e}\dfrac{L}{A}` },
        { n: 3, op: 'transform', title: t('取微元得微分形式', 'Take the differential limit'),
            latex: String.raw `J=\dfrac{I}{A}\;,\quad E=\dfrac{U}{L}\;\Rightarrow\; \mathbf{J}=\sigma\mathbf{E}` },
    ],
    links: {
        seealso: [{ id: 'dc-resistivity-parameters', note: t('ρ_e 与岩石物性的经验关系', 'Empirical ρ_e – petrophysics relations') }],
    },
    refs: [{ text: 'Telford, Geldart & Sheriff, Applied Geophysics, 2nd ed., §4' }],
};
export default dcOhmLawResistivity;
//# sourceMappingURL=dc-ohm-law-resistivity.js.map