# R2 审查记录：体波与射线理论 S2、反射透射与成像 S3

审查范围：node 顶级为 S2 或 S3 的全部已有公式卡片，共 77 条。
审查方式：逐条核对 statement 系数/符号/量纲、derivation 每一步、conditions、symbols 单位、viz.compute 与公式一致性，并对照 Aki & Richards、Shearer、Stein & Wysession、Yilmaz、Shuey(1985)、Fatti(1994)、Connolly(1999) 等权威来源。

审查 77 条，修改 4 条，存疑 2 条。

## 变更清单

| id | 改了什么 | 依据/出处 |
|---|---|---|
| sp-time-difference-distance | 符号 α/β 的中文名由"等价于泊松比 ν = 0.5 时的 √3"改为"ν = 0.25 时的 √3"。原文英文部分本就写 ν = 0.25，中英文自相矛盾；Poisson 固体（ν=0.25，λ=μ）才有 α/β=√3≈1.73。 | Shearer, Introduction to Seismology, 2nd ed., §2.3；标准弹性关系 α²/β²=2(1-ν)/(1-2ν)，ν=0.25 时取 √3。 |
| bending-method-ray-tracing | 算例"x≈47 km"改为"x≈13.7 km"；相应 sin i₁=0.920→0.565、sin i₂=0.982→0.989；"0.920/4.0=0.230=0.982/7.0"改为"0.565/4.0=0.141=0.989/7.0"。原值 0.230≠0.140，根本不满足卡片自己导出的 Snell 条件 sin i₁/v₁=sin i₂/v₂；数值求根 x/(4√(x²+20²))=(150-x)/(7√((150-x)²+20²)) 的真根为 x≈13.71 km。 | 卡片自身 derivation step 3–5 的 Snell 方程；Fermat→Snell 标准推导。 |
| nmo-correction | 拉伸因子定义由含糊的 S=(t₀/x)(dx/dt₀)（推导步 2–3 为拼凑代数，且把 S 错成 1+x²/(v²t₀²)，实为 S²）改为标准 Jacobian S=dt₀/dt=t/t₀=√(1+x²/(v²t₀²))；切除判据由 x_max=vt₀√(S_max−1) 改为 x_max=vt₀√(S_max²−1)；算例 x_max 由 566 m/2263 m 改为 894 m/3578 m。修正后与姊妹卡 nmo-stretch-muting.ts 及 hyperbolic-moveout-offset.ts 完全一致。 | Yilmaz, Seismic Data Analysis, Ch.4；NMO 拉伸因子 S=t/t₀=√(1+x²/(v²t₀²))，切除 S≤S_max ⇒ x≤vt₀√(S_max²−1)。 |
| shuey-approximation | 三项式远角项由 F·sin²θ·(tan²θ−1) 改为 F·sin²θ·tan²θ（variant、derivation、viz.compute 三处同步）。原形式代入卡片自身的 Aki–Richards 式后留有残余项 −F·sin²θ；用 da=−0.10,db=0.15,dr=−0.05,γ=0.2857、θ=45° 数值验证：Aki–Richards 精确值 −0.1964，F·sin²θ·tan²θ 形式复现为 −0.1964，而 (tan²θ−1) 形式只给出 −0.1714。 | Shuey (1985), Geophysics 50, 609–614；由卡片自身 Aki–Richards 式逐项归并可证 R=R₀+G sin²θ+F sin²θ tan²θ，F=½(Δα/α)。 |

## 存疑项

| id | 疑点 | 原因 |
|---|---|---|
| semblance-velocity-spectrum | notes 称"1% 速度误差导致约 3 ms 残余时差"。按远道 x=2 km,t₀=1 s,v=2.5 km/s 数值估算 far-trace residual moveout ≈ 5 ms（dΔt/dv=−x²/(v³√(t₀²+x²/v²))≈−0.20 s/(km/s)，1% Δv=0.025 ⇒ 5 ms）。"3 ms"偏低约 40%，但原文用"约"且为示意量级，未改。 | 量级口径（远道 vs 整个道集平均）不唯一，可能作者按叠加后等效残余估计。 |
| thin-bed-tuning | 算例称 12 m 砂岩厚度增加 2 m"振幅约 +17%"。直接按 A∝sin(2πfΔz/v) 在 Δz=12→14 m 计算为 +12.6%；"17%"恰等于薄层层阶近似 A∝Δz 下的 2/12=16.7%。两种口径都讲得通，未改。 | 薄层线性近似与正弦精确解在该厚度处偏差不大，属示意性数字。 |

## 未改动但已重点核对的卡片（确认正确）
Snell/射线参数族（snell-law-converted-waves、snell-law-spherical-interface、snell-ray-parameter、ray-parameter-conservation/slope、critical-angle-total-reflection、head-wave-critical-angle）、走时双曲族（reflection-hyperbola、hyperbolic-moveout-offset、nonhyperbolic-moveout、nmo-stretch-muting、dip-moveout、dipping-reflector）、速度族（rms-velocity、average-velocity、dix-formula、refracted-wave-intercept-time）、球面地球（spherical-earth-travel-time、earth-flattening、wiechert-herglotz、core-shadow、ellipticity、great-circle）、AVO/弹性族（aki-richards、fatti、avo-intercept-gradient、avo-classification、lambda-mu-rho、elastic-impedance、fluid-factor-avo、acoustic-reflection-coefficient、transmission-coefficient/energy/loss、zoeppritz、postcritical）、偏移族（migration-impulse、kirchhoff、fd-migration、phase-shift、rtm、exploding-reflector）、分辨率/调谐（ricker、fresnel、bandwidth、vertical-resolution、thin-bed-tuning、tuning-wedge）、多次波与合成记录（periodic/interbed multiple、srme、radon-multiple、synthetic-seismogram、recursive-impedance、reflectivity-log-conversion）。
