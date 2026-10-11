import { t } from '../../core/types.js';
/** phys-temperature-scales */
const physTemperatureScales = {
    id: 'phys-temperature-scales',
    name: t('摄氏温标与热力学温标', 'Celsius and Kelvin Temperature Scales'),
    aliases: { zh: ['温度换算', '开尔文'], en: ['temperature scales', 'Kelvin', '°C to K'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.TIME', 'Q.ENERGY'],
        keywords: t('摄氏 开尔文 热力学温度 绝对零度 换算', 'Celsius Kelvin absolute zero temperature conversion'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `T(\mathrm{K})=t(^\circ\mathrm{C})+273.15`,
        variants: [
            { name: t('绝对零度', 'absolute zero'), latex: String.raw `0\ \mathrm{K}=-273.15^\circ\mathrm{C}` },
        ],
    },
    meaning: t('摄氏温标把水的冰点定为 0°C、沸点定为 100°C；热力学温标（开尔文）从绝对零度 0 K 起算，每一度大小与摄氏相同。热力学公式（理想气体状态方程、熵）一律用开尔文。温度差 1 K = 1°C，但 T=0 K 才是分子热运动停止的极限。', 'Celsius sets water’s freezing and boiling points at 0°C and 100°C; the Kelvin scale starts at absolute zero 0 K with the same degree size. Thermodynamic formulas (the ideal-gas law, entropy) always use Kelvin. A difference of 1 K equals 1°C, but only 0 K is the limit where thermal motion ceases.'),
    symbols: [
        { sym: 'T', name: t('热力学温度', 'thermodynamic temperature'), unit: 'K' },
        { sym: 't', name: t('摄氏温度', 'Celsius temperature'), unit: '°C' },
    ],
    conditions: {
        applies: [t('日常与热力学温度换算', 'Converting everyday and thermodynamic temperatures')],
        assumes: [t('标准大气压下定义固定点', 'Fixed points defined at standard atmosphere')],
        breaks: [t('华氏度需另加 32 与 5/9', 'Fahrenheit needs an extra 32 and 5/9')],
    },
    links: { downstream: [{ id: 'phys-ideal-gas-law' }] },
};
export default physTemperatureScales;
//# sourceMappingURL=phys-temperature-scales.js.map