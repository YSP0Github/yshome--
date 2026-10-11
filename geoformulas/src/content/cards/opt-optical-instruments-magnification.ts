import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-optical-instruments-magnification */
const optOpticalInstrumentsMagnification: FormulaCard = {
  id: 'opt-optical-instruments-magnification',
  name: t('放大镜、显微镜与望远镜的放大本领', 'Magnifying Power of Magnifier, Microscope and Telescope'),
  aliases: { zh: ['视角放大率', '放大本领'], en: ['angular magnification', 'magnifying power'] },
  node: 'S20.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS', 'METH.INSTR'],
    quantity: ['Q.OPT'],
    keywords: t('放大镜 显微镜 望远镜 视角放大率 放大本领 目镜 物镜', 'magnifier microscope telescope angular magnification eyepiece objective'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`M_{\text{放}}=\frac{25\,\mathrm{cm}}{f},\qquad M_{\text{显微}}=\frac{L}{f_o}\cdot\frac{25\,\mathrm{cm}}{f_e},\qquad M_{\text{望远}}=-\frac{f_o}{f_e}`,
    variants: [
      { name: t('放大镜（明视距离 25 cm）', 'Magnifier (near point 25 cm)'), latex: String.raw`M=\frac{25\,\mathrm{cm}}{f}` },
      { name: t('望远镜（开普勒式）', 'Keplerian telescope'), latex: String.raw`M=-\frac{f_o}{f_e}` },
    ],
  },
  meaning: t(
    '光学仪器的"放大本领"不是线放大率，而是视角放大率：用仪器后物体对眼睛所张视角与不用仪器时（物放在明视距离 25 cm）所张视角之比。放大镜 M=25cm/f；显微镜是物镜放大率 L/f_o 再乘目镜放大率 25cm/f_e；望远镜直接等于物镜焦距除以目镜焦距。倍率越高，看到的像越大但视野越暗越小。',
    'The "magnifying power" of an optical instrument is not a linear magnification but an angular magnification: the angle subtended at the eye with the instrument divided by the angle subtended without it, with the object held at the near point of 25 cm. A magnifier gives M = 25 cm/f; a microscope multiplies the objective magnification L/f_o by the eyepiece magnification 25 cm/f_e; a telescope gives M = −f_o/f_e. Higher magnification yields a larger but dimmer, narrower field of view.',
  ),
  symbols: [
    { sym: 'M', name: t('视角放大率（放大本领）', 'angular magnification (magnifying power)'), unit: '1' },
    { sym: 'f', name: t('放大镜/目镜焦距', 'focal length of magnifier or eyepiece'), unit: 'm' },
    { sym: 'f_o,f_e', name: t('物镜、目镜焦距', 'objective and eyepiece focal lengths'), unit: 'm' },
    { sym: 'L', name: t('显微镜镜筒长度（物镜像方焦点到目镜物方焦点）', 'microscope tube length'), unit: 'm' },
  ],
  conditions: {
    applies: [t('近轴、明视距离 25 cm 为基准', 'Paraxial, referenced to the 25 cm near point')],
    assumes: [t('眼睛紧贴目镜', 'The eye is placed close to the eyepiece')],
    breaks: [t('超过有效放大率后只是"空放大"，分辨本领不增加', 'Beyond the useful magnification one only gets empty magnification with no added resolution')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('不用仪器时视角 ≈ y/25cm', 'Angle without the instrument ≈ y/25 cm'), latex: String.raw`\theta_0\approx\frac{y}{25\,\mathrm{cm}}` },
    { n: 2, op: 'geometry', title: t('经放大镜成像视角 ≈ y/f', 'Angle through the magnifier ≈ y/f'), latex: String.raw`\theta\approx\frac{y}{f}` },
    { n: 3, op: 'algebra', title: t('两者相除得放大本领', 'Divide to get the magnifying power'), latex: String.raw`M=\frac{\theta}{\theta_0}=\frac{25\,\mathrm{cm}}{f}` },
  ],
  links: {
    upstream: [{ id: 'opt-thin-lens-equation' }, { id: 'opt-lateral-magnification' }],
    downstream: [{ id: 'opt-rayleigh-criterion', note: t('放大受分辨本领限制', 'Magnification is limited by resolution') }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., ' }],
}

export default optOpticalInstrumentsMagnification
