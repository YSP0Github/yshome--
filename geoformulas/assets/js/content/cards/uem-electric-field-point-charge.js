import { t } from '../../core/types.js';
/** uem-electric-field-point-charge */
const uemElectricFieldPointCharge = {
    id: 'uem-electric-field-point-charge',
    name: t('点电荷的电场', 'Electric Field of a Point Charge'),
    aliases: { zh: ['电场强度', '点电荷场'], en: ['electric field intensity', 'point-charge field'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('电场强度 E=F/q 点电荷场 径向 叠加原理', 'electric field E=F/q point charge radial superposition'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\mathbf{E}=\frac{\mathbf{F}}{q_{0}}=k\,\frac{Q}{r^{2}}\,\hat{\mathbf{r}}=\frac{1}{4\pi\varepsilon_{0}}\,\frac{Q}{r^{2}}\,\hat{\mathbf{r}}`,
        variants: [
            { name: t('场强大小', 'Magnitude'), latex: String.raw `E=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{|Q|}{r^{2}}` },
        ],
    },
    meaning: t('电场强度 E 是单位试探电荷所受的力，方向即正受力方向。点电荷 Q 的场沿径向向外（Q>0）或向内（Q<0），大小按 1/r² 衰减。它把"超距作用"改写成"电荷激发场、场再对电荷施力"。', 'The electric field E is the force on a unit test charge, pointing in the direction a positive charge would be pushed. A point charge Q produces a radial field outward (Q>0) or inward (Q<0), decaying as 1/r². It replaces "action at a distance" by "charge creates a field, and the field acts on charges".'),
    symbols: [
        { sym: '\\mathbf{E}', name: t('电场强度', 'electric field'), unit: 'V/m' },
        { sym: '\\mathbf{F}', name: t('试探电荷受力', 'force on test charge'), unit: 'N' },
        { sym: 'q_{0}', name: t('试探电荷（很小）', 'small test charge'), unit: 'C' },
        { sym: 'Q', name: t('场源电荷', 'source charge'), unit: 'C' },
        { sym: 'r', name: t('到场源距离', 'distance from source'), unit: 'm' },
    ],
    conditions: {
        applies: [t('真空中静止点电荷；试探电荷足够小不扰动原场', 'Stationary point charge in vacuum; test charge small enough not to disturb the field')],
        assumes: [t('静电场，不随时间变化', 'Electrostatic, time-independent field')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('由 Coulomb 定律写试探电荷受力', 'Force on a test charge via Coulomb'),
            latex: String.raw `\mathbf{F}=k\dfrac{Q\,q_{0}}{r^{2}}\hat{\mathbf{r}}` },
        { n: 2, op: 'physics', title: t('定义 E 为单位电荷受力', 'Define E as force per unit charge'),
            latex: String.raw `\mathbf{E}=\dfrac{\mathbf{F}}{q_{0}}=k\dfrac{Q}{r^{2}}\hat{\mathbf{r}}` },
        { n: 3, op: 'result', title: t('代入 k=1/4πε0', 'Substitute k=1/4πε0'),
            latex: String.raw `\mathbf{E}=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{Q}{r^{2}}\hat{\mathbf{r}}` },
    ],
    viz: [
        {
            id: 'e-field-vs-r',
            level: 'V1',
            title: t('点电荷场强随距离衰减', 'Point-charge field vs distance'),
            xlabel: t('距离 r (m)', 'distance r (m)'),
            ylabel: t('场强 E (V/m)', 'field E (V/m)'),
            xScale: 'log',
            yScale: 'log',
            controls: [
                { id: 'qval', label: t('场源电荷 Q (μC)', 'source charge Q'), min: 0.1, max: 100, step: 0.1, value: 1, unit: 'μC' },
            ],
            compute: (p) => {
                const Q = p['qval'] * 1e-6;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const r = Math.pow(10, -1 + (i / 200) * 3); // 0.1 .. 100 m
                    const E = (1 / (4 * Math.PI * 8.854e-12)) * Math.abs(Q) / (r * r);
                    pts.push([r, E]);
                }
                return [{ label: t('E=kQ/r²', 'E=kQ/r²'), color: '#185FA5', points: pts }];
            },
            note: t('log-log 上是斜率 −2 的直线：距离加倍，场强降为 1/4。', 'On log-log axes the line has slope −2: doubling r quarters the field.'),
        },
    ],
    links: {
        upstream: [{ id: 'uem-coulomb-law' }],
        downstream: [{ id: 'uem-discrete-charge-superposition' }, { id: 'uem-electric-potential-point-charge' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §22' }],
};
export default uemElectricFieldPointCharge;
//# sourceMappingURL=uem-electric-field-point-charge.js.map