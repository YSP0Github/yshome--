import { t } from '../../core/types.js';
/** eikonal-equation */
const eikonalEquation = {
    id: 'eikonal-equation',
    name: t('程函方程', 'The Eikonal Equation'),
    aliases: { zh: ['程函', 'Eikonal 方程'], en: ['eikonal equation'] },
    node: 'S2.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR', 'MATH.APPROX'],
        method: ['METH.TELE', 'METH.EXPL'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `\left|\nabla T(\boldsymbol{x})\right|^{2}=\frac{1}{v^{2}(\boldsymbol{x})}=u^{2}(\boldsymbol{x})`,
        variants: [
            { name: t('分量形式', 'Component form'), latex: String.raw `\left(\frac{\partial T}{\partial x}\right)^{2}+\left(\frac{\partial T}{\partial y}\right)^{2}+\left(\frac{\partial T}{\partial z}\right)^{2}=u^{2}` },
            { name: t('射线方向由梯度给出', 'Ray direction from the gradient'), latex: String.raw `\hat{\boldsymbol{s}}=\frac{\nabla T}{|\nabla T|}=v\,\nabla T` },
        ],
    },
    meaning: t('程函方程是「高频近似」的数学宣言：当波长远小于介质变化尺度时，波场不再需要解完整的波动方程，只需要追踪一个走时标量场 T(x)。它把波动问题降维成了一阶非线性偏微分方程，是全部射线追踪、Kirchhoff 偏移和走时层析的共同起点。', 'The eikonal equation is the mathematical statement of the high-frequency approximation: when the wavelength is far smaller than the scale over which the medium varies, one no longer needs the full wave equation, only a travel-time scalar field T(x). It reduces a wave problem to a first-order nonlinear PDE, and is the common starting point of all ray tracing, Kirchhoff migration and travel-time tomography.'),
    symbols: [
        { sym: 'T(\\boldsymbol{x})', name: t('走时场', 'travel-time field'), unit: 's' },
        { sym: 'v(\\boldsymbol{x})', name: t('速度场', 'velocity field'), unit: 'm/s' },
        { sym: 'u=1/v', name: t('慢度', 'slowness'), unit: 's/m' },
        { sym: '\\hat{\\boldsymbol{s}}', name: t('射线方向的单位矢量', 'unit vector along the ray'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('高频（射线）近似下的任意非均匀介质', 'Any heterogeneous medium in the high-frequency (ray) limit')],
        assumes: [
            t('λ ≪ 介质速度变化的特征尺度', 'λ is much smaller than the characteristic scale of velocity variation'),
            t('单一到时（无多重走时分支）', 'A single arrival time (no multiple travel-time branches)'),
        ],
        breaks: [
            t('焦散区、衍射区、波导内部失效', 'Fails in caustics, diffraction zones and inside waveguides'),
            t('存在多条到达路径时 T(x) 变多值，需改用走时分支求和', 'Where several paths arrive, T(x) becomes multivalued and one must sum travel-time branches'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把波场写成振幅 × 相位的形式', 'Write the field as amplitude × phase'),
            latex: String.raw `p(\boldsymbol{x},t)=A(\boldsymbol{x})\,e^{i\omega\left(t-T(\boldsymbol{x})\right)}`,
            note: t('这是 WKBJ 试探解：振幅缓变，相位快变。', 'This is the WKBJ ansatz: slowly varying amplitude, rapidly varying phase.') },
        { n: 2, op: 'substitute', title: t('代入声波方程', 'Substitute into the acoustic wave equation'),
            latex: String.raw `\nabla^{2}p-\frac{1}{v^{2}}\frac{\partial^{2}p}{\partial t^{2}}=0` },
        { n: 3, op: 'algebra', title: t('整理出 ω² 项与 ω 项', 'Collect the ω² and ω terms'),
            latex: String.raw `\omega^{2}\left(\frac{1}{v^{2}}-\left|\nabla T\right|^{2}\right)A+i\omega\left(2\nabla T\cdot\nabla A+A\nabla^{2}T\right)+\nabla^{2}A=0` },
        { n: 4, op: 'taylor', title: t('取 ω → ∞ 的领头阶', 'Take the leading order as ω → ∞'),
            latex: String.raw `\omega^{2}\left(\frac{1}{v^{2}}-\left|\nabla T\right|^{2}\right)A=0\;\Longrightarrow\;\left|\nabla T\right|^{2}=\frac{1}{v^{2}}`,
            note: t('高频极限下 ω² 项支配一切，剩下的 ω 项给出振幅的输运方程（几何扩散）。', 'In the high-frequency limit the ω² term dominates; the remaining ω term yields the transport equation for amplitude (geometrical spreading).') },
        { n: 5, op: 'result', title: t('射线方向', 'Ray direction'),
            latex: String.raw `\hat{\boldsymbol{s}}=\frac{\nabla T}{\left|\nabla T\right|}=v\,\nabla T`,
            note: t('走时场的梯度方向就是射线方向，其长度就是慢度。', 'The gradient of the travel-time field points along the ray and its magnitude is the slowness.') },
    ],
    links: {
        downstream: [
            { id: 'kinematic-ray-equations', note: t('把它写成常微分方程组', 'Turning it into a system of ODEs') },
        ],
        seealso: [{ id: 'snell-ray-parameter', note: t('分层介质中的等价形式', 'The equivalent form in layered media') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.4' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.4' }],
};
export default eikonalEquation;
//# sourceMappingURL=eikonal-equation.js.map