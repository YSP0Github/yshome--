import { t } from '../../core/types.js';
/** acoustic-impedance */
const acousticImpedance = {
    id: 'acoustic-impedance',
    name: t('波阻抗', 'Acoustic (Seismic) Impedance'),
    aliases: { zh: ['声阻抗', '地震波阻抗 Z=ρc'], en: ['acoustic impedance', 'seismic impedance', 'Z = rho c'] },
    node: 'S0.1',
    tags: {
        math: ['MATH.LINALG'],
        method: ['METH.ROCK', 'METH.PROC'],
        quantity: ['Q.MAT', 'Q.VEL'],
        keywords: t('波阻抗 声阻抗 密度 速度乘积 反射系数 阻抗差', 'acoustic impedance seismic impedance density velocity product reflection coefficient impedance contrast'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `Z=\rho\,c`,
        variants: [
            { name: t('P 波与 S 波各自的阻抗', 'Impedance for P and for S waves separately'), latex: String.raw `Z_P=\rho\,\alpha,\qquad Z_S=\rho\,\beta` },
            { name: t('法向入射的反射系数', 'Reflection coefficient at normal incidence'), latex: String.raw `R=\frac{Z_2-Z_1}{Z_2+Z_1}` },
            { name: t('法向入射的透射系数', 'Transmission coefficient at normal incidence'), latex: String.raw `T=\frac{2Z_1}{Z_2+Z_1}=1-R\quad(\text{位移},\ \text{下层})` },
            { name: t('用慢度写出（便于与射线参数联用）', 'In terms of slowness, convenient with the ray parameter'), latex: String.raw `Z=\frac{\rho}{u},\qquad u=\frac{1}{c}` },
        ],
    },
    meaning: t('波阻抗 Z = ρc 是介质对波动的「阻碍程度」：密度大则难推动，速度快则难压缩，两者相乘正好刻画介质接受波能量的能力。地震反射之所以存在，唯一原因就是界面两侧的 Z 不同；反射系数的大小只取决于 Z 的比值，而不是速度或密度单独一项。这也是为什么波阻抗反演（而不仅是速度反演）才是连接地震与测井的桥梁。', 'Impedance Z = ρc measures how much a medium resists wave motion: a large density is hard to move, a high velocity is hard to compress, and their product captures exactly how readily the medium accepts wave energy. Seismic reflections exist for one reason only — Z differs across the interface. The size of the reflection coefficient depends on the ratio of impedances, not on velocity or density alone, which is why impedance inversion, rather than velocity inversion alone, is the bridge between seismic data and well logs.'),
    symbols: [
        { sym: 'Z', name: t('波阻抗', 'acoustic, or seismic, impedance'), unit: 'kg m⁻² s⁻¹ = Pa·s/m', dimension: 'M L⁻² T⁻¹', typical: '10⁶ – 10⁷' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³', typical: '1500 – 3300 kg/m³' },
        { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s' },
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s' },
        { sym: 'Z_1, Z_2', name: t('界面上、下两侧的阻抗', 'impedance above and below the interface'), unit: 'Pa·s/m' },
        { sym: 'R', name: t('位移反射系数', 'displacement reflection coefficient'), unit: '1' },
        { sym: 'T', name: t('位移透射系数', 'displacement transmission coefficient'), unit: '1' },
        { sym: 'u', name: t('慢度 1/c', 'slowness, 1/c'), unit: 's/m' },
    ],
    conditions: {
        applies: [
            t('法向入射、或把 c 换成垂直方向的视速度后用于斜入射的声学近似', 'Normal incidence, or oblique incidence under the acoustic approximation with c replaced by the vertical apparent velocity'),
            t('无耗散介质（Q → ∞），Z 为实数', 'A lossless medium, so that Z is real'),
        ],
        assumes: [
            t('界面两侧介质均匀、各向同性、完全接触', 'The media on both sides are homogeneous, isotropic and in welded contact'),
            t('小振幅线性波动', 'Small-amplitude linear wave motion'),
            t('P 波与 S 波解耦（声学近似）', 'P and S motion decouple, the acoustic approximation'),
        ],
        breaks: [
            t('斜入射且存在波型转换时，需用 Zoeppritz 方程，单一 Z 不足以描述', 'With oblique incidence and mode conversion the Zoeppritz equations are required and a single Z is not enough'),
            t('含流体与孔隙时密度用体积平均，速度受频散影响，Z 随频率变化', 'With pore fluids the density is a volume average and the velocity is dispersive, so Z becomes frequency-dependent'),
            t('吸收介质中 Z 为复数，反射系数也带相位', 'In an absorbing medium Z is complex and the reflection coefficient carries a phase'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'physics',
            title: t('应力 = 弹性模量 × 应变', 'Stress equals modulus times strain'),
            latex: String.raw `\sigma=K\,\varepsilon,\qquad K=\rho c^{2}`,
            note: t('对流体 K 是体积模量；对弹性固体声学近似下取等效模量。', 'For a fluid K is the bulk modulus; for an elastic solid one takes the equivalent modulus under the acoustic approximation.'),
        },
        {
            n: 2,
            op: 'setup',
            title: t('谐和平面波的质点速度', 'Particle velocity of a harmonic plane wave'),
            latex: String.raw `u(x,t)=A e^{i(kx-\omega t)}\;\Longrightarrow\; \dot{u}=\frac{\partial u}{\partial t}=-i\omega A e^{i(kx-\omega t)}`,
        },
        {
            n: 3,
            op: 'algebra',
            title: t('应变与质点速度的关系', 'Relating strain to particle velocity'),
            latex: String.raw `\varepsilon=\frac{\partial u}{\partial x}=ikA e^{i(kx-\omega t)}=-\frac{k}{\omega}\dot{u}=-\frac{\dot{u}}{c}`,
        },
        {
            n: 4,
            op: 'substitute',
            title: t('代回应力表达式', 'Substitute into the stress'),
            latex: String.raw `\sigma=K\varepsilon=\rho c^{2}\left(-\frac{\dot{u}}{c}\right)=-\rho c\,\dot{u}`,
        },
        {
            n: 5,
            op: 'result',
            title: t('定义波阻抗为应力与质点速度之比', 'Define impedance as the ratio of stress to particle velocity'),
            latex: String.raw `Z\equiv\frac{|\sigma|}{|\dot{u}|}=\rho c`,
            note: t('这个定义的物理含义是：要驱动介质以单位质点速度振动，需要多大的应力。它和电路里的电阻、传输线里的特性阻抗是同一个概念。', 'Physically: how much stress is needed to drive the medium at unit particle velocity. It is the same concept as electrical resistance or the characteristic impedance of a transmission line.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('为什么反射系数只含 Z', 'Why the reflection coefficient contains only Z'),
            latex: String.raw `R=\frac{Z_2-Z_1}{Z_2+Z_1},\qquad T=1+R_{\text{stress}}=\frac{2Z_1}{Z_2+Z_1}`,
            note: t('因为界面条件只需应力连续与位移连续，而应力恰好是 Z 乘质点速度。', 'Because the interface conditions require only continuity of stress and of displacement, and stress is exactly Z times particle velocity.'),
        },
    ],
    viz: [
        {
            id: 'impedance-vs-velocity',
            level: 'V1',
            title: t('Z 随速度与密度的变化', 'How Z varies with velocity and density'),
            xlabel: t('速度 c (m/s)', 'velocity c (m/s)'),
            ylabel: t('波阻抗 Z (10⁶ Pa·s/m)', 'impedance Z (10⁶ Pa·s/m)'),
            controls: [
                { id: 'rho', label: t('密度 ρ', 'density ρ'), min: 1000, max: 3300, step: 50, value: 2200, unit: 'kg/m³' },
            ],
            xRange: [1000, 7000],
            note: t('Z 与 c 成正比，密度只改变直线的斜率。砂岩与页岩的速度可能接近，但只要密度不同就仍有阻抗差 —— 这就是为什么有些界面「看不出速度差却有反射」。', 'Z is proportional to c, and density merely sets the slope. Sandstone and shale may have nearly the same velocity, yet a density difference still produces an impedance contrast — which is why some interfaces show a reflection with no obvious velocity contrast.'),
            compute: (p) => {
                const rho = p['rho'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const c = 1000 + (i / 200) * 6000;
                    pts.push([c, (rho * c) / 1e6]);
                }
                return [{ label: t('Z = ρc', 'Z = ρc'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'reflection-coefficient',
            level: 'V1',
            title: t('阻抗差决定反射强弱', 'The impedance contrast sets the reflection strength'),
            xlabel: t('下层阻抗 Z₂ (10⁶ Pa·s/m)', 'lower-layer impedance Z₂ (10⁶ Pa·s/m)'),
            ylabel: t('系数值', 'coefficient value'),
            controls: [
                { id: 'Z1', label: t('上层阻抗 Z₁', 'upper-layer impedance Z₁'), min: 1, max: 20, step: 0.1, value: 6, unit: '10⁶' },
            ],
            xRange: [1, 20],
            note: t('Z₂ = Z₁ 时 R = 0（无反射，无论速度、密度各自差多少）；Z₂ 远离 Z₁ 时 R 趋于 ±1，能量几乎全反射。透射系数 T = 1 − R 始终为正，与能量守恒一致。', 'At Z₂ = Z₁ the reflection vanishes, no matter how different velocity and density are individually. As Z₂ moves away from Z₁, R tends to ±1 and almost all the energy is reflected. The transmission coefficient T = 1 − R stays positive throughout, consistent with energy conservation.'),
            compute: (p) => {
                const Z1 = p['Z1'];
                const rPts = [];
                const tPts = [];
                for (let i = 0; i <= 300; i++) {
                    const Z2 = 1 + (i / 300) * 19;
                    const R = (Z2 - Z1) / (Z2 + Z1);
                    rPts.push([Z2, R]);
                    tPts.push([Z2, 1 - R]);
                }
                return [
                    { label: t('反射系数 R', 'reflection coefficient R'), color: '#185FA5', points: rPts },
                    { label: t('透射系数 T = 1 − R', 'transmission coefficient T = 1 − R'), color: '#0F6E56', dash: true, points: tPts },
                ];
            },
        },
    ],
    example: {
        title: t('一个典型的砂泥岩界面', 'A typical sand–shale interface'),
        input: t('上层：ρ₁ = 2300 kg/m³, α₁ = 2800 m/s；下层：ρ₂ = 2500 kg/m³, α₂ = 3600 m/s', 'Upper: ρ₁ = 2300 kg/m³, α₁ = 2800 m/s; lower: ρ₂ = 2500 kg/m³, α₂ = 3600 m/s'),
        steps: [
            t('Z₁ = 2300 × 2800 = 6.44×10⁶ Pa·s/m', 'Z₁ = 2300 × 2800 = 6.44×10⁶ Pa·s/m'),
            t('Z₂ = 2500 × 3600 = 9.00×10⁶ Pa·s/m', 'Z₂ = 2500 × 3600 = 9.00×10⁶ Pa·s/m'),
            t('R = (9.00 − 6.44)/(9.00 + 6.44) = 0.166', 'R = (9.00 − 6.44)/(9.00 + 6.44) = 0.166'),
        ],
        output: t('反射系数约 0.17，属于中等强度反射；若只看速度差 (900 m/s) 会高估其重要性', 'A reflection coefficient of about 0.17, a moderately strong event; looking at the velocity contrast alone, 900 m/s, would overstate its importance'),
    },
    links: {
        upstream: [
            { id: 'phase-velocity', note: t('提供 c', 'supplies c') },
            { id: 'ps-wave-velocities', note: t('提供 α、β', 'supplies α and β') },
        ],
        downstream: [
            { id: 'acoustic-reflection-coefficient', note: t('R 由 Z 直接给出', 'R follows directly from Z') },
        ],
        seealso: [{ id: 'harmonic-plane-wave' }],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §3.3' },
    ],
};
export default acousticImpedance;
//# sourceMappingURL=acoustic-impedance.js.map