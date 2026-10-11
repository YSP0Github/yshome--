import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-doppler-effect */
const physDopplerEffect: FormulaCard = {
  id: 'phys-doppler-effect',
  name: t('Doppler 效应', 'Doppler Effect'),
  aliases: { zh: ['多普勒效应', '测速雷达'], en: ['Doppler effect', 'frequency shift'] },
  node: 'S18.5',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.FREQ', 'Q.VEL'],
    keywords: t('多普勒效应 频率偏移 声源运动 测速 救护车', 'Doppler effect frequency shift moving source siren radar speed'),
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`f'=f_0\,\frac{v+v_o}{v-v_s}`,
    variants: [
      { name: t('声源接近、观察者静止', 'source approaching, observer at rest'), latex: String.raw`f'=f_0\dfrac{v}{v-v_s}>f_0` },
      { name: t('声源远离', 'source receding'), latex: String.raw`f'=f_0\dfrac{v}{v+v_s}<f_0` },
    ],
  },
  meaning: t(
    '当声源或观察者相对介质运动时，听到的频率会变化：救护车朝你开来时笛声变尖（f′ 升高），开走时变沉（f′ 降低）。这就是 Doppler 效应。它不仅用于交警雷达测速、气象雷达测风暴速度，也是天文学上由红移推算星系远离速度的基础。',
    'When source or observer moves relative to the medium, the heard frequency shifts: an approaching siren sounds higher (f′ rises), a receding one lower (f′ falls) — the Doppler effect. It is used in police radar, weather radar and, via cosmological redshift, in measuring how fast galaxies recede.',
  ),
  symbols: [
    { sym: "f'", name: t('观察者收到的频率', 'frequency observed'), unit: 'Hz' },
    { sym: 'f_0', name: t('声源固有频率', 'source frequency'), unit: 'Hz' },
    { sym: 'v', name: t('介质中波速', 'wave speed in medium'), unit: 'm/s' },
    { sym: 'v_o,v_s', name: t('观察者、声源相对介质速度', 'observer, source speeds relative to medium'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('声源/观察者沿连线运动', 'Source and observer move along the line of sight')],
    assumes: [t('波速 v 远大于相对速度', 'v larger than the relative speeds; classical regime')],
    breaks: [t('声源超音速产生激波（音爆）', 'Supersonic source creates a shock wave (sonic boom)')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('声源接近压缩波长', 'Approaching source shortens the wavelength'), latex: String.raw`\lambda'=\dfrac{v-v_s}{f_0}` },
    { n: 2, op: 'algebra', title: t('接收频率=波速/缩短后波长', 'Received f = wave speed / shortened λ'), latex: String.raw`f'=\dfrac{v}{\lambda'}=f_0\dfrac{v}{v-v_s}` },
    { n: 3, op: 'identity', title: t('再计入观察者运动', 'Include observer motion'), latex: String.raw`f'=f_0\dfrac{v+v_o}{v-v_s}` },
  ],
  viz: [
    {
      id: 'doppler-shift',
      level: 'V1',
      title: t('接收频率随声源速度的变化', 'Received frequency vs source speed'),
      xlabel: t('声源速度 v_s (m/s)', 'source speed v_s (m/s)'),
      ylabel: t('接收频率 f′ (Hz)', 'received frequency f′ (Hz)'),
      controls: [
        { id: 'f0', label: t('声源频率 f₀', 'source frequency f₀'), min: 100, max: 1000, step: 10, value: 440, unit: 'Hz' },
      ],
      xRange: [-340, 330],
      note: t('v_s>0（接近）频率升高；v_s<0（远离）频率降低；v_s 接近 v=340 m/s 时频率发散（音爆前夕）。', 'v_s>0 (approaching) raises f′; v_s<0 (receding) lowers it; f′ diverges as v_s → v = 340 m/s (sonic boom).'),
      compute: (p) => {
        const f0 = p['f0']
        const v = 340
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const vs = -340 + (i / 400) * 670
          const f = (f0 * v) / (v - vs)
          pts.push([vs, f])
        }
        return [{ label: t('f′(v_s)', 'f′(v_s)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  links: { seealso: [{ id: 'phys-wave-speed-relation' }] },
}

export default physDopplerEffect
