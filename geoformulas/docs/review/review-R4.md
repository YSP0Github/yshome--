# R4 审查变更清单（S7–S13）

审查范围：S7 地球内部结构、S8 观测与仪器、S9 数据处理、S10 反演、S11 强地面运动、S12 统计地震学、S13 岩石物理，共 83 条已有卡片。
性质：纠错（不新建卡片、不改 id/文件名/node、不改 taxonomy.ts 与 content/index.ts）。
每条改后均通过 `node scripts/verify-cards.mjs <file>` 只读自检。

## 变更清单

| id | 改了什么 | 依据/出处 |
| --- | --- | --- |
| velocity-model-parameterization | 变体「常速度层走时」原写 Δt=Δz/√(v⁻²−p²)，量纲错误（得 km²/s 而非时间）。改为 Δt=Δz·√(v⁻²−p²)，ΔX=p·Δz/√(v⁻²−p²)，与卡片自身 step4 的 X(p)=∫p/√(v⁻²−p²)dz 一致 | Shearer, Introduction to Seismology, 走时与射线路径方程 |
| mohorovicic-discontinuity | viz.compute 与算例原用 t_Ps=h·√(1/vS²−1/vP²)（得 16.0 s），与卡片变体/step5 的正确式 t_Ps=h(1/vS−1/vP) 矛盾。viz 改为 h·(1/vs−1/vp)，算例两步与 output 同步改为 8.3 s（西藏 h=70 km） | 接收函数 Ps 走时标准式 t_Ps=H(1/vS−1/vP)（Zhu & Kanamori 2000） |
| mantle-discontinuities | 主式尾部有一段无意义 LaTeX 残片 `·1/（使用一维参考速度）`，清理为主式 z=Δt_Ps/(√(v_S⁻²−p²)−√(v_P⁻²−p²)) | 文本清理，公式与 step 一致 |
| d-double-prime-post-perovskite | 主式写 ΔV<0、ΔS>0 却称 Clapeyron 斜率为正，热力学自相矛盾。改主式 ΔS>0→ΔS<0；step4 改为「实测斜率为正且陡⇒ΔS<0」；viz.compute 的 dz 符号由 (−slope·dT)/(dPdz·1000) 改为 (slope·dT)/(dPdz·1000)；算例步改为 Δz=ΔP/(dP/dz)=−142 km（抬升） | PNAS https://www.pnas.org/doi/full/10.1073/pnas.0502504102 （pPv 相变密度+1.0–1.5% 即 ΔV<0；Clapeyron 实测 +7.5~+13 MPa/K 为正；低压相 Pv 摩尔熵更高故 ΔS<0） |
| receiver-function-deconvolution | 主式与「理想去卷积」变体把 Z 与 R_r 写反（分子 Z·conj(R_r)、分母 \|R_r\|²），与自身 step3–5（S=R_r/Z，分母 \|Z\|²）矛盾。改为分子 R_r·conj(Z)、分母 \|Z\|²，理想式改为 R(ω)=R_r(ω)/Z(ω) | 接收函数=径向/垂直谱比，Langston (1979)；Aki & Richards |
| ccp-stacking | 算例中间值算术错误：qs 原写 0.2686（实际 0.281）、H=41.8 km（实际约 38.1 km，与 viz 公式 Vs=vp·√((0.5−ν)/(1−ν)) 自洽）。改为 qs=0.281、qp=0.150、H=38.1 km，output 改为「约38 km典型大陆地壳」 | 算术复算 + 卡片内 viz 泊松比公式自洽 |
| free-surface-amplification | 变体「由阻抗关系给出」原写 1+R=2Z₂/(Z₁+Z₂)→2，分子阻抗下标写反（Z₂→0 时该式极限为 0，与箭头矛盾）。改为 2Z₁/(Z₁+Z₂)→2 | 自由界面位移放大/阻抗反射系数标准式 |
| damped-least-squares | 算例 output 文案中混入乱入英文错词「batik 坐标」，清理为「拐角即数据残差与模型大小之间的最佳妥协点」 | 文本清理，无公式改动 |
| quarter-wavelength-amplification | derivation step4 标题把共振条件写错：kH=(2n+1)π/2 时是 cos(kH)=0（分母取极小、放大极大），原写「sin(kH)=0」与自身 latex kH=(2n+1)π/2 矛盾。改为「cos(kH)=0」 | 一层覆盖半空间 SH 传递函数 \|T\|=1/\|cos(kH)+iα·sin(kH)\|，Kramer, Geotechnical Earthquake Engineering Ch.8 |

## 存疑项

| id | 疑点 | 原因 |
| --- | --- | --- |
| modified-omori-law | 算例绝对累积数 N(30)、N(10) 中间值与解析积分有 ~10–15% 偏差（卡片写 663、591，严格积分为约 510、430） | 主式 n(t)=K/(t+c)^p 与累积积分式本身正确；两数之差（第10–30天新增≈72–76个）与卡片 output「约72个」吻合，属算例取整误差而非公式错误，故未改 |
| seismic-moment-rate | step4 分母记作「β−1.5 ln10」、算例 −log₁₀0.5=+0.30，与严格积分 −log₁₀(0.5·ln10)=−0.061 有出入 | 主式 Ṁ₀=∫10^{1.5M+c}·10^{a−bM}dM 的物理与「b→1.5 积分发散」结论正确，量级（10¹⁴–10¹⁵ N·m/yr）正确；仅算例系数取整，未改 |
| etas-likelihood | 分支比变体含一个非标准因子「1/(1−2^{1−p})」 | step5 与 viz.compute 均用标准式 n=K₀·c^{1−p}/(p−1)·β/(β−a)，算例自洽；该额外因子仅出现在一个次要变体中，为 phd 级示意，未擅改 |
| quarter-wavelength-amplification | 变体/step3 传递函数 \|T\| 的阻抗系数写作 Z₂/Z₁（=ρ₂Vs₂/ρ₁Vs₁），严格推导应为 Z₁/Z₂ | 卡片主式 A_max≈(2/π)(Z₂/Z₁) 与无阻尼极限 2Z₂/Z₁、有阻尼 (2/π)Z₂/Z₁ 三者自洽且物理正确；传递函数系数写法为示意且与主式差一倒数关系，改动风险大于收益，故仅修正了明确错误的 step4 共振条件，此处留作存疑 |
