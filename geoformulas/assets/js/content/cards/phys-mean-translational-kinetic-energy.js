import { t } from '../../core/types.js';
/** phys-mean-translational-kinetic-energy */
const physMeanTranslationalKineticEnergy = {
    id: 'phys-mean-translational-kinetic-energy',
    name: t('分子平均平动动能', 'Mean Translational Kinetic Energy'),
    aliases: { zh: ['3/2 kT', '温度的微观意义'], en: ['mean translational KE', '3/2 kT'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.STAT', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('平均平动动能 温度微观意义 3/2 kT 方均根速率', 'mean translational KE temperature microscopic 3/2 kT rms speed'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\overline{E}_k=\tfrac{3}{2}k_B T,\qquad v_{\mathrm{rms}}=\sqrt{\frac{3 k_B T}{m}}`,
        variants: [
            { name: t('1 mol 气体总平动动能', 'total translational KE per mole'), latex: String.raw `E=\dfrac{3}{2}RT` },
        ],
    },
    meaning: t('温度的微观意义就是：它直接度量分子的平均平动动能。不论哪种气体，只要温度相同，每个分子的平均平动动能都是 3/2 kT。由此还能反推出方均根速率 v_rms=√(3kT/m)——同温下，轻分子（氢气）比重分子（氧气）跑得快得多。', 'The microscopic meaning of temperature is that it directly measures the mean translational kinetic energy of molecules. At the same temperature every gas, whatever it is, has the same mean 3/2 kT per molecule. This yields the rms speed v_rms = √(3kT/m) — at the same T, light molecules (hydrogen) move much faster than heavy ones (oxygen).'),
    symbols: [
        { sym: '\\overline{E}_k', name: t('平均平动动能', 'mean translational kinetic energy'), unit: 'J' },
        { sym: 'k_B', name: t('Boltzmann 常数', 'Boltzmann constant'), unit: 'J/K' },
        { sym: 'T', name: t('热力学温度', 'temperature'), unit: 'K' },
        { sym: 'v_{rms}', name: t('方均根速率', 'rms speed'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('理想气体平衡态', 'Ideal gas in equilibrium')],
        assumes: [t('经典、非量子', 'Classical, non-quantum')],
        breaks: [t('极低温量子效应显著', 'Quantum effects matter at very low T')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('p=⅓nm v̄²', 'p = ⅓ n m v̄²'), latex: String.raw `p=\dfrac{1}{3}nm\overline{v^{2}}` },
        { n: 2, op: 'substitute', title: t('理想气体 p=nk_BT', 'Use p = n k_B T'), latex: String.raw `n k_B T=\dfrac{1}{3}nm\overline{v^{2}}` },
        { n: 3, op: 'algebra', title: t('解出 ½m v̄² = 3/2 kT', 'Solve: ½m v̄² = 3/2 kT'), latex: String.raw `\dfrac{1}{2}m\overline{v^{2}}=\dfrac{3}{2}k_B T` },
    ],
    links: {
        upstream: [{ id: 'phys-kinetic-theory-pressure' }, { id: 'phys-ideal-gas-law' }],
        downstream: [{ id: 'phys-equipartition-theorem' }],
    },
};
export default physMeanTranslationalKineticEnergy;
//# sourceMappingURL=phys-mean-translational-kinetic-energy.js.map