import { t } from '../../core/types.js';
/** modphys-photoelectric-effect */
const modphysPhotoelectricEffect = {
    id: 'modphys-photoelectric-effect',
    name: t('光电效应与 Einstein 方程', 'Photoelectric Effect and the Einstein Equation'),
    aliases: { zh: ['光电效应', 'hν=W+½mv²', '遏止电压'], en: ['photoelectric effect', 'h nu = W + half m v^2', 'stopping potential'] },
    node: 'S20.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS', 'METH.INSTR'],
        quantity: ['Q.OPT', 'Q.ENERGY'],
        keywords: t('光电效应 爱因斯坦方程 光子 逸出功 遏止电压 截止频率 光电流', 'photoelectric effect Einstein equation photon work function stopping potential threshold frequency photocurrent'),
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `h\nu=W+\tfrac12 mv_{\max}^2,\qquad eU_c=h\nu-W`,
        variants: [
            { name: t('截止频率（红限）', 'Threshold (cutoff) frequency'), latex: String.raw `\nu_0=\frac{W}{h}` },
        ],
    },
    meaning: t('光照射金属表面时会打出电子，但只有当光子能量 hν 超过金属逸出功 W 时才发生：多余能量变成光电子动能 ½mv²。经典波动说无法解释"频率不够、光再强也打不出电子"；Einstein 1905 年用"光本身就是一份份光子"解释了它，因此获得诺贝尔奖。遏止电压 Uc 与频率成正比，斜率就是 h/e。', 'Light striking a metal ejects electrons, but only when a photon’s energy hν exceeds the metal’s work function W; the excess becomes the photoelectron kinetic energy ½mv². Classical wave theory could not explain why no intensity, however large, ejects electrons if the frequency is too low. In 1905 Einstein explained it by "light itself comes in packets (photons)" and won the Nobel prize. The stopping potential Uc is linear in frequency, with slope h/e.'),
    symbols: [
        { sym: 'h\\nu', name: t('入射光子能量', 'energy of an incident photon'), unit: 'J' },
        { sym: 'W', name: t('金属逸出功', 'work function of the metal'), unit: 'J' },
        { sym: '\\tfrac12 mv_{\\max}^2', name: t('光电子最大初动能', 'maximum kinetic energy of the photoelectron'), unit: 'J' },
        { sym: 'U_c', name: t('遏止电压', 'stopping potential'), unit: 'V' },
        { sym: '\\nu_0', name: t('截止频率', 'threshold frequency'), unit: 'Hz' },
    ],
    conditions: {
        applies: [t('金属表面、真空、频率高于红限', 'Metal surface, vacuum, frequency above the threshold')],
        assumes: [t('单光子过程，一个光子打出一个电子', 'Single-photon process: one photon ejects one electron')],
        breaks: [t('频率低于 ν₀ 时无论光强多大都无光电子', 'Below ν₀ no photoelectron appears at any intensity')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('光子能量 hν 被电子吸收', 'The electron absorbs a photon of energy hν'), latex: String.raw `E_{\gamma}=h\nu` },
        { n: 2, op: 'physics', title: t('一部分用来挣脱金属（逸出功 W）', 'Part of it frees the electron (the work function W)'), latex: String.raw `E_{\gamma}=W+K_{\max}` },
        { n: 3, op: 'algebra', title: t('余下为动能', 'The rest is kinetic energy'), latex: String.raw `K_{\max}=\tfrac12 mv_{\max}^2=h\nu-W=eU_c` },
    ],
    viz: [
        {
            id: 'stopping-voltage',
            level: 'V1',
            title: t('遏止电压 Uc 随入射光频率的变化', 'Stopping potential Uc versus incident-light frequency'),
            xlabel: t('频率 ν (10¹⁴ Hz)', 'frequency nu (10^14 Hz)'),
            ylabel: t('遏止电压 Uc (V)', 'stopping potential Uc (V)'),
            controls: [
                { id: 'Wev', label: t('逸出功 W (eV)', 'work function W (eV)'), min: 1.5, max: 5.0, step: 0.1, value: 2.5, unit: 'eV' },
            ],
            xRange: [2, 12],
            note: t('斜线在横轴上的截距就是截止频率 ν₀=W/h（W=2.5 eV 时约 6.0×10¹⁴ Hz）；斜率恒为 h/e≈4.14×10⁻¹⁵ V·s，与金属种类无关——这正是 Einstein 方程的铁证。', 'The horizontal intercept is the threshold frequency ν₀ = W/h (about 6.0×10¹⁴ Hz for W = 2.5 eV); the slope is always h/e ≈ 4.14×10⁻¹⁵ V·s, independent of the metal — the decisive evidence for the Einstein equation.'),
            compute: (p) => {
                const Wev = p['Wev'];
                const h_e = 4.1357e-15; // V·s
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const nu = (2 + (i / 300) * 10) * 1e14;
                    const Uc = h_e * nu - Wev;
                    pts.push([nu / 1e14, Math.max(0, Uc)]);
                }
                return [{ label: t('Uc(ν)', 'Uc(nu)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('求铯（W=2.14 eV）在波长 400 nm 紫外光下的遏止电压', 'Stopping potential for cesium (W = 2.14 eV) under 400 nm ultraviolet light'),
        input: t('λ = 400 nm，W = 2.14 eV', 'λ = 400 nm, W = 2.14 eV'),
        steps: [
            t('光子能量 E = hc/λ = 1240 eV·nm / 400 nm = 3.10 eV', 'Photon energy E = hc/λ = 1240 eV·nm / 400 nm = 3.10 eV'),
            t('最大动能 K = E − W = 3.10 − 2.14 = 0.96 eV', 'Max kinetic energy K = E − W = 3.10 − 2.14 = 0.96 eV'),
            t('遏止电压 Uc = K/e = 0.96 V', 'Stopping potential Uc = K/e = 0.96 V'),
        ],
        output: t('Uc ≈ 0.96 V；若换成 600 nm 红光（E=2.07 eV < W）则无光电子。', 'Uc ≈ 0.96 V; at 600 nm red light (E = 2.07 eV < W) no photoelectron is emitted.'),
    },
    links: {
        upstream: [{ id: 'modphys-planck-energy-quantum' }],
        downstream: [{ id: 'modphys-compton-scattering' }],
    },
    refs: [{ text: 'Brehme & Beiser, Modern Physics, §4' }],
};
export default modphysPhotoelectricEffect;
//# sourceMappingURL=modphys-photoelectric-effect.js.map