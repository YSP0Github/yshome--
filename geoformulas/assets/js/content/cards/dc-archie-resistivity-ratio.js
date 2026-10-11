import { t } from '../../core/types.js';
/** dc-archie-resistivity-ratio */
const dcArchieResistivityRatio = {
    id: 'dc-archie-resistivity-ratio',
    name: t('Archie 电阻率增大系数', "Archie's Resistivity Increase Factor"),
    aliases: { zh: ['Archie 第二定律', 'I=Ro/Rt', '饱和度指数 n'], en: ["Archie's second law", 'resistivity ratio', 'saturation exponent n'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM', 'METH.ROCK'],
        quantity: ['Q.ELEC', 'Q.POR'],
        keywords: t('Archie 电阻率增大系数 I 含水饱和度 Sw 饱和度指数n', 'Archie resistivity increase factor water saturation exponent n'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `I=\frac{R_{t}}{R_{o}}=\frac{1}{S_{w}^{\,n}}=S_{w}^{-n}`,
        variants: [
            { name: t('反求含水饱和度', 'Solve for Sw'), latex: String.raw `S_{w}=\left(\dfrac{R_{o}}{R_{t}}\right)^{1/n}=\left(\dfrac{F R_{w}}{R_{t}}\right)^{1/n}` },
        ],
    },
    meaning: t('含油（气）后，部分孔隙被不导电的烃占据，导电路径变窄，地层真电阻率 Rt 比全含水时的 Ro 升高。电阻率增大系数 I=Rt/Ro 随含水饱和度 Sw 的 −n 次方增长，n 通常取 2。含油越多，Sw 越小，Rt 越高——这就是电测井找油的物理依据。', 'When oil/gas fills part of the pores, the non-conducting hydrocarbon narrows the conducting path and the true resistivity Rt rises above the fully-water-saturated Ro. The increase factor I=Rt/Ro scales as Sw to the −n (n usually ≈2). The more hydrocarbon, the smaller Sw and the higher Rt — the physical basis of hydrocarbon detection by resistivity logs.'),
    symbols: [
        { sym: 'I', name: t('电阻率增大系数', 'resistivity increase factor'), unit: '无量纲' },
        { sym: 'R_{t}', name: t('原状地层真电阻率', 'true formation resistivity'), unit: 'Ω·m' },
        { sym: 'R_{o}', name: t('100% 含水电阻率', 'fully water-saturated resistivity'), unit: 'Ω·m' },
        { sym: 'S_{w}', name: t('含水饱和度', 'water saturation'), unit: '无量纲' },
        { sym: 'n', name: t('饱和度指数', 'saturation exponent'), unit: '无量纲', typical: '≈ 2' },
    ],
    conditions: {
        applies: [t('干净砂岩、油水分异明确', 'Clean sandstone with distinct oil–water contact')],
        assumes: [t('不含可动地层水以外的导电相', 'No conducting phase beyond formation water')],
        breaks: [t('低电阻率油层（微孔、束缚水）使 I 偏小', 'Low-resistivity pay (micropores, bound water) underestimates I')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('含水孔隙比例为 Sw', 'Water occupies fraction Sw of pores'),
            latex: String.raw `R_{t}\propto 1/S_{w}^{n}` },
        { n: 2, op: 'identity', title: t('定义 I=Rt/Ro', 'Define I=Rt/Ro'),
            latex: String.raw `I=\dfrac{R_{t}}{R_{o}}=S_{w}^{-n}` },
        { n: 3, op: 'algebra', title: t('解出 Sw', 'Solve for Sw'),
            latex: String.raw `S_{w}=I^{-1/n}=\left(\dfrac{R_{o}}{R_{t}}\right)^{1/n}` },
    ],
    viz: [
        {
            id: 'archie-i-sw',
            level: 'V1',
            title: t('电阻率增大系数 I 与含水饱和度 Sw', 'Increase factor I vs water saturation Sw'),
            xlabel: t('含水饱和度 Sw', 'water saturation Sw'),
            ylabel: t('I = Rt/Ro', 'I = Rt/Ro'),
            controls: [
                { id: 'nexp', label: t('饱和度指数 n', 'saturation exponent n'), min: 1.5, max: 3, step: 0.1, value: 2 },
            ],
            compute: (p) => {
                const nexp = p['nexp'];
                const pts = [];
                for (let i = 1; i <= 200; i++) {
                    const sw = (i / 200);
                    pts.push([sw, 1 / Math.pow(sw, nexp)]);
                }
                return [{ label: t('I=Sw^−n', 'I=Sw^−n'), color: '#BA7517', points: pts }];
            },
            note: t('Sw=1（纯水层）时 I=1；Sw 降到 0.4 时 Rt 已约为 Ro 的 6 倍，油层高阻异常明显。', 'At Sw=1 (water leg) I=1; at Sw=0.4 Rt is already ~6× Ro — a clear high-resistivity pay flag.'),
        },
    ],
    links: {
        upstream: [{ id: 'dc-archie-formation-factor' }, { id: 'dc-formation-factor-ro-rw' }],
        downstream: [{ id: 'dc-water-saturation-archie' }],
    },
    refs: [{ text: 'Archie (1942), Trans. AIME, 146' }],
};
export default dcArchieResistivityRatio;
//# sourceMappingURL=dc-archie-resistivity-ratio.js.map