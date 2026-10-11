import { t } from '../../core/types.js';
/** seismic-phase-nomenclature */
const seismicPhaseNomenclature = {
    id: 'seismic-phase-nomenclature',
    name: t('地震相命名规则', 'Seismic Phase Nomenclature'),
    aliases: {
        zh: ['震相命名', '震相代码', 'IASPEI 命名法'],
        en: ['phase naming', 'phase code', 'IASPEI nomenclature'],
    },
    node: 'S2.1',
    tags: {
        math: ['MATH.GEOM'],
        method: ['METH.TELE'],
        quantity: ['Q.GEOM', 'Q.TIME'],
        keywords: t('震相 P S K I J c i pP sS PKP PKIKP ScS 命名 规则 路径', 'seismic phase P S K I J c i pP sS PKP PKIKP ScS naming code ray path'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\text{震相名}=\bigl[\,\text{源侧标记}\,\bigr]\ \bigl[\,\text{传播段}\,\bigr]\ \bigl[\,\text{界面作用}\,\bigr]`,
        variants: [
            {
                name: t('贯穿地球的 PKIKP', 'PKIKP, a full traverse'),
                latex: String.raw `\mathrm{PKIKP}=\mathrm{P}\,(\text{地幔})\;\mathrm{K}\,(\text{外核})\;\mathrm{I}\,(\text{内核})\;\mathrm{K}\,(\text{外核})\;\mathrm{P}\,(\text{地幔})`,
            },
            {
                name: t('深度震相 pP、sS', 'Depth phases pP and sS'),
                latex: String.raw `\mathrm{pP}:\ \text{震源}\ \longrightarrow\ \text{地表反射}\ \longrightarrow\ \text{台站}`,
            },
            {
                name: t('核幔边界反射 ScS', 'Core–mantle boundary reflection ScS'),
                latex: String.raw `\mathrm{ScS}=\mathrm{S}\,(\text{下行})\;\mathrm{c}\,(\text{CMB 反射})\;\mathrm{S}\,(\text{上行})`,
            },
            {
                name: t('内核边界反射 PKiKP', 'Inner-core boundary reflection PKiKP'),
                latex: String.raw `\mathrm{PKiKP}=\mathrm{P}\,\mathrm{K}\,\mathrm{i}\,\mathrm{K}\,\mathrm{P}`,
            },
            {
                name: t('近垂直出射时 pP−P 的走时差', 'pP−P differential time for near-vertical takeoff'),
                latex: String.raw `t_{\mathrm{pP}}-t_{\mathrm{P}}\simeq\frac{2h}{\alpha}`,
            },
        ],
    },
    meaning: t('震相名不是随意的缩写，而是射线路径的压缩编码：从左到右依次读出「在哪种介质里传播、在哪个界面上反射/转换」。掌握这套规则后，看到 PKIKP 就知道它穿过了内核，看到 ScS 就知道它在核幔边界反射过一次，从而可以直接判断该震相对地球哪一部分有采样能力。', 'A phase name is not an arbitrary abbreviation but a compressed encoding of the ray path: read left to right it tells you which regions the wave traversed and at which interfaces it reflected or converted. Once the code is mastered, PKIKP immediately reads as "sampled the inner core" and ScS as "bounced once off the core–mantle boundary", which is exactly what decides what a phase can tell us about the Earth.'),
    symbols: [
        { sym: '\\mathrm{P},\\ \\mathrm{S}', name: t('在地幔（含地壳）中传播的 P / S 段', 'P / S leg travelling in the mantle and crust'), unit: '—' },
        { sym: '\\mathrm{K}', name: t('在外核（液态，只有 P 波）中传播的段', 'leg travelling in the liquid outer core (P only)'), unit: '—' },
        { sym: '\\mathrm{I},\\ \\mathrm{J}', name: t('在内核中传播的 P / S 段', 'P / S leg travelling in the inner core'), unit: '—' },
        { sym: '\\mathrm{c}', name: t('核幔边界（CMB，深 2891 km）上的反射', 'reflection at the core–mantle boundary (2891 km depth)'), unit: '—' },
        { sym: '\\mathrm{i}', name: t('内核边界（ICB，深 5150 km）上的反射', 'reflection at the inner-core boundary (5150 km depth)'), unit: '—' },
        { sym: '\\mathrm{p},\\ \\mathrm{s}', name: t('震源发出的上行 P / S 段（在地表反射后转下行，构成深度震相）', 'upgoing P / S leg leaving the source; after a surface reflection it becomes a depth phase'), unit: '—' },
        { sym: 'h', name: t('震源深度', 'source depth'), unit: 'km', typical: '0 – 700' },
        { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s', typical: '5000 – 13700' },
        { sym: '\\Delta', name: t('震中距（地心张角）', 'epicentral distance (geocentric angle)'), unit: '°', typical: '0 – 180' },
    ],
    conditions: {
        applies: [
            t('全球与区域台网的体波震相命名，IASP91 / ak135 走时表通用', 'Naming of body-wave phases in global and regional networks, as used by the IASP91 and ak135 travel-time tables'),
            t('射线理论成立的高频体波', 'High-frequency body waves for which ray theory holds'),
        ],
        assumes: [
            t('球对称分层地球：地壳—地幔—外核—内核，界面清晰', 'A spherically symmetric layered Earth with sharp crust, mantle, outer-core and inner-core boundaries'),
            t('每一次字母切换都对应一次真实的传播段或界面作用', 'Each letter change corresponds to a genuine propagation leg or interface interaction'),
        ],
        breaks: [
            t('面波、地球自由振荡、尾波另有命名体系（Rayleigh、Love、球型振荡模态等）', 'Surface waves, free oscillations and coda have their own naming systems (Rayleigh, Love, spheroidal modes …)'),
            t('散射、绕射与非几何震相（Pdiff、PKP 前驱波）不能按字母直接读出唯一路径', 'Scattered, diffracted and non-geometrical phases (Pdiff, PKP precursors) cannot be read back to a unique path'),
            t('地方台网常用的 Pg、Sg、Pn、Sn 属于区域性简写，不属于该体系', 'Regional shorthand such as Pg, Sg, Pn and Sn belongs to a different, local convention'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('把震相名看成一条路径的编码', 'Read a phase name as an encoding of a path'),
            latex: String.raw `\mathrm{phase}\;=\;\text{源侧标记}\;+\;\text{传播段}\;+\;\text{界面作用}`,
            note: t('从左到右读，就是射线从震源出发、到达台站所经历的全部事件。', 'Reading left to right reproduces every event the wave undergoes between source and station.'),
        },
        {
            n: 2,
            op: 'geometry',
            title: t('大写字母标明「在哪一层里传播」', 'Capital letters say which shell the wave travels through'),
            latex: String.raw `\mathrm{P},\mathrm{S}\;(\text{地幔});\quad \mathrm{K}\;(\text{外核});\quad \mathrm{I},\mathrm{J}\;(\text{内核})`,
            note: t('外核为液态，不传播 S 波，所以只有 K 而没有对应的 S 字母。', 'The outer core is liquid and transmits no S waves, which is why there is a K but no companion S letter.'),
        },
        {
            n: 3,
            op: 'geometry',
            title: t('小写字母 c、i 标明在界面上的反射', 'Lower-case c and i mark reflections at interfaces'),
            latex: String.raw `\mathrm{c}\;(\text{CMB}),\qquad \mathrm{i}\;(\text{ICB})`,
            note: t('反射不改变波型：ScS 全程是 S 波；若发生波型转换则字母随之改变，如 SKS（S→K→S）。', 'Reflection preserves the wave type: ScS is S throughout. Conversion changes the letters, as in SKS (S→K→S).'),
        },
        {
            n: 4,
            op: 'setup',
            title: t('名称前部的 p / s 是深度震相标记', 'A leading p / s flags a depth phase'),
            latex: String.raw `\mathrm{pP},\ \mathrm{sS},\ \mathrm{pPKP}\;=\;\text{先在震源上方地表反射，再下行到台站}`,
            note: t('这段额外的上行路径与震源深度单调相关，是测定震源深度的经典手段。', 'The extra upgoing leg varies monotonically with source depth — the classic tool for depth determination.'),
        },
        {
            n: 5,
            op: 'result',
            title: t('实例：拆解 PKIKP', 'Worked example: parsing PKIKP'),
            latex: String.raw `\mathrm{P}\,\mathrm{K}\,\mathrm{I}\,\mathrm{K}\,\mathrm{P}\;:\ \text{地幔下行}\to\text{外核}\to\text{内核}\to\text{外核}\to\text{地幔上行}`,
            note: t('全程无反射，是穿过地球中心区域最快的震相，也是内核研究的主力震相。', 'With no reflections anywhere, it is the fastest phase through the central Earth and the workhorse of inner-core studies.'),
        },
    ],
    links: {
        upstream: [{ id: 'ps-wave-velocities', note: t('给出 α 与 β，决定哪些波型存在', 'supplies α and β, hence which wave types exist') }],
        downstream: [{ id: 'core-shadow-zone', note: t('阴影区的存在正是由这些路径决定的', 'the shadow zone is a direct consequence of these paths') }],
        seealso: [{ id: 'adams-williamson', note: t('给出命名体系所依赖的地球分层模型', 'supplies the layered Earth model the naming rests on') }],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.3' },
        { text: 'Kennett (ed.), IASPEI 1991 Seismological Tables, §2' },
        { text: 'Stein & Wysession, An Introduction to Seismology, Earthquakes and Earth Structure, §4.2' },
    ],
};
export default seismicPhaseNomenclature;
//# sourceMappingURL=seismic-phase-nomenclature.js.map