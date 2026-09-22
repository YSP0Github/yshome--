# -*- coding: utf-8 -*-
from __future__ import annotations
"""
dashboard_server.py（2026-09-17 重写）
=====================================================================
DC-GDCST + DT-FSBL 学习整合版 · 可视化监控面板服务器

【功能】
  1. 展示学习笔记（批次 1–9）要求输出的全部图片：
     - 01 输入数据 / 02 预处理（A 阶段）
     - 03 仪器响应单位感知（待办 A）
     - 04 噪声建模 / 05 η 时变噪声图（待办 C）
     - 06 GDCST 时频谱（C 阶段）
     - 07 FSBL 活跃集（D 阶段）
     - 08 重建（E 阶段）
     - 09 带通评估（新问题 13）
     - 10 置信度图（待办 E）/ 11 C_multi（待办 F）
     - 12 高阶互相关 3→2→1（待办 B）/ 13 Δτ 测试（待办 D）/ 14 频谱对比
  2. 顶部指标卡：从 exp014 metadata 读取 SNR/corr + 最新方案口径说明
  3. "运行实验"按钮：后台调用 run_pipeline_v3_learning.py 重新生成全部图片，
     实时滚动日志，完成后自动刷新页面。

【用法】
  python dashboard_server.py [--port 8765]
  浏览器打开 http://localhost:8765/
"""
import argparse
import json
import subprocess
import sys
import threading
import time
from functools import lru_cache
from http.server import (
    HTTPServer,
    SimpleHTTPRequestHandler,
    ThreadingHTTPServer,
)
from pathlib import Path

from plotly_figs import PLOT_FACTORIES, get_figure, set_npz_path
from intermediate_params import compute_all_params

# =====================================================================
# 路径配置
# =====================================================================
CODE_DIR = Path(__file__).resolve().parent
# [2026-09-22 服务器/本地双路径] 云服务器部署时（/home/YSP/dcgdcst_viewer 存在）
# 使用服务器数据/图集绝对路径；本地开发回退到仓库内相对路径。
_SERVER_ROOT = Path("/home/YSP/dcgdcst_viewer")
if _SERVER_ROOT.exists():
    RUN_DIR = _SERVER_ROOT / "runs" / "v3_learning_20260917"      # 图片输出目录（服务器）
    EXP014_DIR = _SERVER_ROOT / "data" / "exp014_snr-20" / "event_001"  # 默认数据目录（服务器）
else:
    RUN_DIR = CODE_DIR.parent / "runs" / "v3_learning_20260917"   # 图片输出目录
    EXP014_DIR = CODE_DIR.parent / "runs" / "exp014_full_pipeline_snr10" / "event_001"
META_FILE = EXP014_DIR / "metadata.json"                       # 指标来源
PIPELINE_SCRIPT = CODE_DIR / "run_pipeline_v3_learning.py"     # 运行按钮调用的管线
EXP013_SCRIPT = CODE_DIR / "exp013_full_pipeline_diagnostic.py"  # 输入 SNR 重合成管线
# 当前数据目录（默认 exp014；"用指定 SNR 重新运行"后切换到新 SNR 目录）
CURRENT_DATA_DIR = EXP014_DIR
CURRENT_META_FILE = META_FILE
LAST_DATA_FILE = RUN_DIR / "last_data_dir.json"   # 记住上次数据目录（重启恢复）
# [2026-09-22 数据包列表] 数据包根目录：优先服务器路径，否则本地 runs。
DATA_ROOT = _SERVER_ROOT / "data" if _SERVER_ROOT.exists() else CODE_DIR.parent / "runs"
# [2026-09-18 云端只读部署] --readonly 时禁止一切重跑能力（运行按钮/SNR/
# 输出目录输入框、/api/run），只保留查看与交互；--data-dir 指定数据目录。
READONLY = False

# 图片分组（按学习阶段；key = plotly 交互图编号, png = 静态图文件, name = 说明）
# 页面渲染交互图（Plotly），PNG 作为可下载的静态版本保留。
IMAGE_GROUPS = [
    ("A 输入与预处理", [
        ("01", "01_input.png", "01 输入：观测 / counts 真值 / 物理真值（位移 m，双轴，来源已标注）"),
        ("02", "02_preprocessed.png", "02 预处理：去均值/去趋势/带通（ObsPy 零相位，问题 12）"),
        ("17", "17_preprocessed_amp_spectrum.png", "17 三站预处理后数据振幅谱（02 输出，目标频带阴影）"),
        ("18", "18_preprocessed_higher_order_corr.png", "18 预处理后数据直接高阶互相关（未去噪，12 号图样式）"),
        ("19", "19_simulated_preprocessed_higher_order_corr.png", "19 模拟数据（SPECFEM 真值 m）带通后直接高阶互相关（理论极限，与 18 含噪 / 12 FSBL 后对比）"),
    ]),
    ("A-5 仪器响应（待办 A）", [
        ("03", "03_response_units.png", "03 仪器响应幅度+相位，单位标注 counts/m（DISP 位移型）"),
    ]),
    ("B 噪声建模", [
        ("04", "04_noise_model.png", "04 噪声段 Welch PSD（B-2）+ ν/σ^2"),
        ("05", "05_noise_timevar.png", "05 η 时变噪声阶段性绘图（待办 C：σ^2_q 柱状+η 阈值线+ν_q 副图）"),
        ("15", "15_eta_summary.png", "15 η_j 三站汇总（待办 C：柱状 + η=2 阈值线 + 判定）"),
    ]),
    ("C GDCST", [
        ("06", "06_gdcst_spectrogram.png", "06 信号 GDCST 时频谱 + 修正窗长（问题 02）"),
    ]),
    ("D DT-FSBL", [
        ("07", "07_fsbl_active.png", "07 FSBL：γ / 活跃支撑集 / 去噪时频谱（max_iter≥6000，问题 03）"),
    ]),
    ("E 信号重建", [
        ("08", "08_reconstruction.png", "08 重建 vs 物理真值（同域位移 m，DISP 口径，问题 07；重建已修正 amplitude_scale 幅值）"),
        ("16", "16_freq_amp_spectrum.png", "16 频率域线性振幅谱对比（重建修正后 vs SPECFEM 真值，目标频带线性轴）"),
    ]),
    ("评估（问题 13）", [
        ("09", "09_evaluation.png", "09 带通后 corr/SNR（必须先带通再评估）"),
    ]),
    ("F 后处理与自由振荡提取", [
        ("10", "10_confidence_intervals.png", "10 置信度图（待办 E：95%CI 带 + C_j 柱状）"),
        ("11", "11_c_multi.png", "11 F.5 多站一致性 C_multi（待办 F）"),
        ("12", "12_high_order_corr.png", "12 高阶互相关 3→2→1（待办 B：导师配对规则）"),
        ("13", "13_delta_tau_test.png", "13 Δτ 估计 vs 理论走时差（待办 D）"),
        ("14", "14_spectrum.png", "14 频谱对比（F-2：公共信号谱 vs 真值 vs 含噪）"),
    ]),
]

# plotly.min.js 本地托管（避免浏览器访问外网 CDN）
STATIC_DIR = CODE_DIR / "static"

# =====================================================================
# 全局状态
# =====================================================================
state = {
    "status": "idle",       # idle / running / done / error
    "log": [],
    "start_time": None,
    "end_time": None,
    "current_step": "",
    "data_dir": None,       # 当前使用的数据目录名（None = exp014 默认）
    "input_snr": None,      # 本次运行的目标输入 SNR（dB）
}
state_lock = threading.Lock()

def load_metrics():
    """从当前数据目录 metadata 读取评估指标（供顶栏展示）"""
    try:
        with open(CURRENT_META_FILE, encoding="utf-8") as f:
            meta = json.load(f)
        m = meta.get("metrics_common", {})
        # [2026-09-18] 逐站输入 SNR：SNR 重合成按逐台站精确控制
        # （面板顶栏 metrics_common 为三站平均公共口径，二者不同属正常）
        per_station = []
        for s in meta.get("metrics_per_station", []):
            v = s.get("snr_input_db")
            if v is not None:
                per_station.append(float(v))
        # 目标输入 SNR（input_snr_control.target_snr_db；exp014 原始合成无此项）
        target = meta.get("input_snr_control", {}).get("target_snr_db")
        return {
            "stations": meta.get("stations", ["S12", "S15", "S16"]),
            "fs": meta.get("fs_hz", 6.625),
            "freq_band": meta.get("freq_band", [0.001, 0.012]),
            "snr_input_db": m.get("snr_input_db", 0),
            "snr_output_db": m.get("snr_output_db", 0),
            "correlation": m.get("correlation", 0),
            "n_iterations": meta.get("fsbl_info", {}).get("n_iterations", "N/A"),
            "n_active_atoms": meta.get("fsbl_info", {}).get("n_active_atoms", "N/A"),
            "target_snr_db": target,
            "snr_input_per_station": per_station,
        }
    except Exception:
        return {}

def _snr_note_html(m: dict) -> str:
    """[2026-09-22 SPA] 拼装 SNR 口径说明文本（页面渲染与 /api/metrics 共用）"""
    parts = []
    _target_v = m.get("target_snr_db")
    _sta_vals = m.get("snr_input_per_station") or []
    if _target_v is not None:
        parts.append(f"目标 SNR = {_target_v:g} dB")
    if _sta_vals:
        _sta_names = m.get("stations", ["S12", "S15", "S16"])
        _vals = " / ".join(f"{v:.2f}" for v in _sta_vals)
        parts.append(f"逐站实测 = {_vals} dB")
    parts.append(
        "顶栏为三站平均（公共）口径：信号三站相关、噪声三站独立，"
        "平均后噪声被部分抵消，故公共 SNR 比逐站高（正常现象，非控制失效）")
    return "SNR 口径：" + "；".join(parts) + "。"

def run_pipeline_thread(input_snr: float | None = None,
                        out_root: str | None = None):
    """后台线程：运行管线重新生成全部图片

    input_snr 不为 None 时：
      1) 先跑 exp013 --input-snr X 重新合成低 SNR 观测并跑完整
         GDCST→FSBL 管线 → 生成新目录 exp014_full_pipeline_snr{X}
      2) 切换交互图数据源（plotly_figs.set_npz_path + 清缓存）
      3) 跑 v3 管线 --data-dir 新目录 出图+落盘
    否则：恢复 exp014 默认目录，只重跑 v3 出图。
    """
    global state, CURRENT_DATA_DIR, CURRENT_META_FILE
    with state_lock:
        state["status"] = "running"
        state["log"] = []
        state["start_time"] = time.time()
        state["end_time"] = None
        state["current_step"] = "启动管线..."
        state["input_snr"] = input_snr
        state["data_dir"] = None

    def log(msg):
        with state_lock:
            state["log"].append(f"[{time.strftime('%H:%M:%S')}] {msg}")
            state["current_step"] = msg

    def _run(cmd, label):
        log(f"运行{label}: {Path(cmd[1]).name} {' '.join(cmd[2:])}")
        proc = subprocess.Popen(
            cmd, cwd=str(CODE_DIR),
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, encoding="utf-8", errors="replace", bufsize=1)
        for line in proc.stdout:
            line = line.strip()
            if line:
                log(line)
        proc.wait()
        if proc.returncode != 0:
            raise RuntimeError(f"{label} 退出码: {proc.returncode}")
        return True

    try:
        python_exe = sys.executable
        # 若被 pythonw/无解释器环境启动，回退到 miniconda（本机实际环境）
        if "pythonw" in python_exe.lower() or "windowsapps" in python_exe.lower():
            cand = Path(r"D:\miniconda3\python.exe")
            if cand.exists():
                python_exe = str(cand)

        data_dir = EXP014_DIR
        if input_snr is not None:
            # 1) 按目标输入 SNR 重合成观测并重跑完整 GDCST→FSBL 管线
            #    [2026-09-18] 面板支持自定义输出目录 out_root（--out-root，
            #    留空=默认 runs/exp014_full_pipeline_snr 目录）
            _cmd013 = [python_exe, str(EXP013_SCRIPT), "--input-snr", f"{input_snr:g}"]
            if out_root:
                _cmd013 += ["--out-root", out_root]
            _run(_cmd013, "exp013（SNR 重合成 + 完整管线）")
            if out_root:
                data_dir = Path(out_root) / "event_001"
            else:
                data_dir = EXP014_DIR.parent.parent / f"exp014_full_pipeline_snr{input_snr:g}" / "event_001"
            if not (data_dir / "all_intermediate_results.npz").exists():
                raise RuntimeError(f"SNR 结果目录缺失: {data_dir}")
            # 2) 切换交互图数据源 + 清缓存
            set_npz_path(data_dir / "all_intermediate_results.npz")
            _fig_json.cache_clear()
            _params_for_display.cache_clear()
            CURRENT_DATA_DIR = data_dir
            CURRENT_META_FILE = data_dir / "metadata.json"
            log(f"交互图数据源已切换到: {data_dir.name}")
        else:
            # 恢复默认 exp014 数据源
            set_npz_path(EXP014_DIR / "all_intermediate_results.npz")
            _fig_json.cache_clear()
            _params_for_display.cache_clear()
            CURRENT_DATA_DIR = EXP014_DIR
            CURRENT_META_FILE = META_FILE
        with state_lock:
            state["data_dir"] = str(CURRENT_DATA_DIR)

        # 3) v3 管线出图 + 结果落盘（按最新方案执行）
        cmd = [python_exe, str(PIPELINE_SCRIPT)]
        if input_snr is not None:
            cmd += ["--data-dir", str(data_dir)]
        _run(cmd, "v3 管线")
        log("完成！图片与结果数据已更新，3 秒后自动刷新。")
        try:
            LAST_DATA_FILE.write_text(json.dumps(
                {"data_dir": str(CURRENT_DATA_DIR), "input_snr": input_snr,
                 "out_root": out_root},
                ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass
        with state_lock:
            state["status"] = "done"
            state["end_time"] = time.time()
    except Exception as e:
        log(f"错误: {e}")
        with state_lock:
            state["status"] = "error"
            state["end_time"] = time.time()

@lru_cache(maxsize=16)
def _fig_json(key: str) -> str:
    """生成交互图 JSON（带缓存，numpy 类型由 plotly to_json 处理）"""
    return get_figure(key).to_json()

@lru_cache(maxsize=64)
def _fig_json_for_dir(data_dir: str, key: str) -> str:
    """[2026-09-22 预取] 为指定数据包目录生成交互图 JSON（不改变当前状态）。

    用于前端"后台预取其他数据包的图到浏览器缓存"：
      1. 临时 set_npz_path(该包 npz) → 生成图
      2. 立即恢复当前 npz 路径
    带独立 lru_cache（key = data_dir|key），不会污染主 _fig_json 缓存。
    """
    from plotly_figs import set_npz_path
    # 记录当前 npz 路径，生成后恢复
    cur_path = None
    try:
        # 通过 get_figure 的内部 NPZ_PATH 恢复：用 try 包住，失败也恢复
        import plotly_figs as _pf
        cur_path = _pf.NPZ_PATH
        dd = Path(data_dir)
        npz = dd / "all_intermediate_results.npz"
        if not npz.exists():
            raise FileNotFoundError(f"npz 不存在: {npz}")
        set_npz_path(npz)
        return get_figure(key).to_json()
    finally:
        if cur_path is not None:
            try:
                set_npz_path(cur_path)
            except Exception:
                pass

@lru_cache(maxsize=4)
def _params_for_display() -> dict:
    """把中间参数整理成前端表格友好的结构（列定义 + 行数据）"""
    p = compute_all_params()
    tables = []
    # B 噪声建模
    rows = []
    for r in p["stages"]["B_噪声建模"]:
        rows.append([r["station"], f'{r["lambda_star"]:g}', f'{r["m2"]:.4g}',
                     f'{r["kappa"]:.3f}', f'{r["nu"]:.2f}', f'{r["sigma2"]:.4g}',
                     f'{r["eta"]:.2f}', r["verdict"]])
    tables.append({
        "title": "B 噪声建模（逐站）",
        "note": "λ* = B-5 λ 优化（exp014 固定 1.0，未开搜索；真实数据按 [0.3,2.0] 步长 0.1）；"
                "m2 = 噪声 GDCST 系数二阶矩 E[|c|^2]；κ = 峰度；ν̂ = 6/(κ-3)+4；"
                "η = max(σ^2_q)/min(σ^2_q)，≥2 非平稳 → D 阶段用 max(σ^2_q) 保守初始化（问题 04）",
        "columns": ["台站", "λ*", "二阶矩 m2", "峰度 κ", "ν̂", "σ̂²", "η", "平稳性判定"],
        "rows": rows,
    })
    # C GDCST
    rows = []
    for r in p["stages"]["C_GDCST"]:
        rows.append([r["station"], f'{r["m2"]:.4g}', f'{r["kappa"]:.3f}',
                     f'{r["nw_min"]:.0f} ~ {r["nw_max"]:.0f}'])
    tables.append({
        "title": "C GDCST 信号系数统计（逐站）",
        "note": "窗长按修正公式 N_w=ceil(6/(|f|^λ·Δt))（问题 02），随频率 0.001→0.012 Hz 变化",
        "columns": ["台站", "系数二阶矩 m2", "系数峰度 κ", "窗长 N_w 范围 (点)"],
        "rows": rows,
    })
    # D DT-FSBL
    r = p["stages"]["D_DT_FSBL"][0]
    tables.append({
        "title": "D DT-FSBL（全局）",
        "note": "max_iter=6000 ≥ AGENTS.md 硬约束（问题 03）；γ=1/α 为 ARD 超参数",
        "columns": ["迭代次数", "活跃原子 |S_b|", "γ max (log10)", "γ min (log10)",
                    "频率网格", "时频帧"],
        "rows": [[r["n_iterations"], r["n_active_atoms"],
                  f'{r["gamma_max_log10"]:.2f}', f'{r["gamma_min_log10"]:.2f}',
                  r["n_freqs"], r["n_frames"]]],
    })
    # E 重建评估
    rows = []
    for r in p["stages"]["E_重建评估"]:
        rows.append([r["domain"], f'{r["corr_inband"]:.4f}',
                     f'{r["snr_in_dB"]:.2f}', f'{r["snr_out_dB"]:.2f}'])
    tables.append({
        "title": "E 重建评估（带通后，问题 13）",
        "note": "评估必须目标频带 [0.001,0.012] Hz 带通后计算 corr/SNR；物理域 = DISP 位移口径（问题 07）",
        "columns": ["域", "corr (带通)", "SNR 输入 (dB)", "SNR 输出 (dB)"],
        "rows": rows,
    })
    # F 后处理
    r = p["stages"]["F_后处理"][0]
    rows = [[
        f'{r["c_j"].get("S12", 0):.4f}', f'{r["c_j"].get("S15", 0):.4f}',
        f'{r["c_j"].get("S16", 0):.4f}', f'{r["c_multi"]:.4f}',
        ", ".join(f"{f:.5f}" for f in r["c3_peak_freqs"]) or "无",
        str(r["delta_tau_passed"]),
    ]]
    tables.append({
        "title": "F 后处理与自由振荡提取",
        "note": "C_j = 逐站归一化置信度（F.4 近似）；C_multi = 多站一致性（F.5，2/3·Σ）；"
                "C3 峰 = 三阶互相关带内谱峰（待办 B）；Δτ = 走时差估计 vs 理论（自由振荡理论=0，±10s 通过，待办 D）",
        "columns": ["C_j(S12)", "C_j(S15)", "C_j(S16)", "C_multi", "C3 谱峰 (Hz)", "Δτ 通过"],
        "rows": rows,
    })
    return {"meta": p["meta"], "tables": tables}

class DashboardHandler(SimpleHTTPRequestHandler):
    """HTTP 请求处理器（目录 = 图片输出目录）"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(RUN_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self._send_html(self._build_page())
            return
        elif self.path == "/api/status":
            self._send_json(self._get_state())
            return
        elif self.path == "/api/metrics":
            # [2026-09-22 SPA] 当前数据包完整指标（顶栏卡片 + SNR 口径说明），
            # 供前端切包后无刷新更新顶部参数
            _m = load_metrics()
            _m["data_dir"] = str(CURRENT_DATA_DIR)
            _m["snr_note"] = _snr_note_html(_m)
            self._send_json({"ok": True, "metrics": _m})
            return
        elif self.path == "/api/log":
            with state_lock:
                self._send_json({"log": state["log"], "status": state["status"]})
            return
        elif self.path == "/api/params":
            # 中间参数总览（二阶矩/峰度/λ*/ν̂/σ̂²/η/迭代/活跃原子/corr/SNR/C_j/C_multi 等）
            self._send_json(_params_for_display())
            return
        elif self.path == "/api/packages":
            # [2026-09-22 数据包列表] 服务器内已上传数据包信息列表
            self._send_json(list_packages())
            return
        elif self.path.startswith("/api/plot/"):
            # 交互图 JSON：/api/plot/01 → 返回 plotly figure spec
            # [2026-09-22 预取] 支持 ?dir=<数据包目录>：为指定数据包生成图
            # （前端后台预取其他数据包的图到浏览器缓存，切包时秒开）
            path_q = self.path[len("/api/plot/"):]
            key = path_q.split("?")[0]
            qdir = None
            if "?" in path_q:
                import urllib.parse as _up
                q = _up.parse_qs(path_q.split("?", 1)[1])
                if q.get("dir"):
                    qdir = q["dir"][0]
            if key in PLOT_FACTORIES:
                if qdir:
                    self._send_raw_json(_fig_json_for_dir(qdir, key))
                else:
                    self._send_raw_json(_fig_json(key))
                return
            self.send_error(404, f"未知绘图 key: {key}")
            return
        elif self.path.startswith("/static/"):
            # plotly.min.js 本地托管（零外网依赖）
            fname = self.path[len("/static/"):].split("?")[0]
            fp = STATIC_DIR / fname
            if fp.exists():
                body = fp.read_bytes()
                self.send_response(200)
                if fname.endswith(".js"):
                    self.send_header("Content-Type", "application/javascript")
                else:
                    self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                self.wfile.write(body)
                return
            self.send_error(404)
            return
        else:
            # 其余路径（图片 png 等）由 SimpleHTTPRequestHandler 服务
            return super().do_GET()

    def do_POST(self):
        if self.path == "/api/run":
            if READONLY:
                self._send_json({"ok": False,
                                 "error": "只读展示模式：禁止在云端重跑管线"})
                return
            with state_lock:
                if state["status"] == "running":
                    self._send_json({"ok": False, "error": "管线正在运行中"})
                    return
            # 读取可选的输入 SNR 与输出目录（监控面板可手动设置，2026-09-17/18）
            input_snr = None
            out_root = None
            try:
                length = int(self.headers.get("Content-Length") or 0)
                if length > 0:
                    body = json.loads(self.rfile.read(length).decode("utf-8"))
                    v = body.get("input_snr")
                    if v is not None and str(v).strip() != "":
                        input_snr = float(v)
                    ov = body.get("out_root")
                    if ov and str(ov).strip():
                        out_root = str(ov).strip()
            except Exception:
                pass
            t = threading.Thread(target=run_pipeline_thread,
                                 kwargs={"input_snr": input_snr, "out_root": out_root},
                                 daemon=True)
            t.start()
            self._send_json({"ok": True, "message": "管线已启动"})
            return
        elif self.path == "/api/upload":
            # [2026-09-18 上传云端] 打包当前实验数据+图集上传云服务器
            if READONLY:
                self._send_json({"ok": False,
                                 "error": "只读展示模式：禁止上传"})
                return
            with state_lock:
                if state["status"] == "running":
                    self._send_json({"ok": False, "error": "管线正在运行中，请稍后"})
                    return
            t = threading.Thread(target=upload_cloud_thread, daemon=True)
            t.start()
            # 同步等待结果（打包+上传约 1-3 分钟），完成后返回包名/URL
            t.join(timeout=420)
            with state_lock:
                if state.get("last_upload"):
                    u = state["last_upload"]
                    self._send_json({"ok": True, "package": u["package"],
                                     "url": u["url"]})
                    return
                err = state.get("last_upload_error", "上传失败（未知错误）")
                self._send_json({"ok": False, "error": err})
            return
        elif self.path == "/api/load_package":
            # [2026-09-18/09-22] 读取面板数据包：解包后显示全部数据。
            # 2026-09-22：云端只读模式也允许加载"服务器内已上传的数据包"
            # （导师查看场景 = 只读展示，不触发重跑/上传）；且支持两种输入：
            #   ① 已解包数据包目录（data/001-260918，含 metadata.json+npz）
            #   ② tar.gz 数据包文件（沿用旧逻辑解包）
            try:
                length = int(self.headers.get("Content-Length") or 0)
                body = json.loads(self.rfile.read(length).decode("utf-8"))
                pkg = Path(str(body.get("package", "")).strip())
                # 传的是目录：
                #   - 若目录本身就是数据包（含 metadata.json + npz）→ 直接用
                #   - 否则尝试找目录内的 *_dashboard_package.tar.gz
                if pkg.is_dir():
                    if (pkg / "metadata.json").exists() and \
                       (pkg / "all_intermediate_results.npz").exists():
                        pass  # 已解包数据包目录，直接使用
                    else:
                        _cands = sorted(pkg.glob("*_dashboard_package.tar.gz")) + [pkg / "dashboard_package.tar.gz"]
                        pkg = next((c for c in _cands if c.exists()), None) or pkg
                if not pkg.exists():
                    self._send_json({"ok": False,
                                     "error": f"数据包不存在: {pkg}"})
                    return
                if pkg.is_dir():
                    # 已解包目录：无需 tar.gz 解包，直接切换数据源
                    dd = pkg
                elif pkg.name.endswith(".tar.gz"):
                    dd = pkg.parent
                    if not _extract_dashboard_package(dd):
                        self._send_json({"ok": False, "error": "解包失败"})
                        return
                else:
                    self._send_json({"ok": False,
                                     "error": f"不支持的数据包: {pkg.name}"})
                    return
                with state_lock:
                    if state["status"] == "running":
                        self._send_json({"ok": False,
                                         "error": "管线正在运行中，请稍后"})
                        return
                global CURRENT_DATA_DIR, CURRENT_META_FILE
                CURRENT_DATA_DIR = dd
                CURRENT_META_FILE = dd / "metadata.json"
                set_npz_path(dd / "all_intermediate_results.npz")
                _fig_json.cache_clear()
                _params_for_display.cache_clear()
                with state_lock:
                    state["data_dir"] = str(dd)
                try:
                    LAST_DATA_FILE.write_text(json.dumps(
                        {"data_dir": str(dd), "input_snr": None,
                         "out_root": None}, ensure_ascii=False),
                        encoding="utf-8")
                except Exception:
                    pass
                self._send_json({"ok": True, "data_dir": str(dd)})
            except Exception as e:
                self._send_json({"ok": False,
                                 "error": f"{type(e).__name__}: {e}"})
            return
        else:
            self.send_error(404)

    # ---------- 页面构建 ----------
    def _build_page(self):
        # [2026-09-18 云端只读部署] 只读模式隐藏运行控件
        if READONLY:
            runbar_inner = (
                '<span class="status" style="color:#90a4ae;">只读展示模式'
                '（计算在本地完成，云端仅提供交互查看）</span>\n'
                '  <span id="runStatus" class="status"></span>\n')
        else:
            runbar_inner = (
                '<button id="runBtn" class="runbtn" onclick="startRun()">'
                '&#9654; 重新运行管线并更新图片</button>\n'
                '  <button id="uploadBtn" class="runbtn" style="margin-left:6px;" '
                'onclick="startUpload()" title="把当前实验数据+图集打包上传到云服务器'
                '（编号 001-YYMMDD），云端面板将自动切换到新数据">'
                '&#8593; 上传云端</button>\n'
                '  <span id="runStatus" class="status">就绪</span>\n'
                '  <span id="runLogToggle" class="logtoggle" style="display:none;" '
                'onclick="toggleLog()">显示日志</span>\n'
                '  <span class="hslider-wrap">\n'
                '    <label for="snrIn">输入 SNR (dB，可调低可为负；留空=exp014 原始)</label>\n'
                '    <input type="number" id="snrIn" min="-60" max="30" step="1" value=""\n'
                '           placeholder="如 -3" style="width:90px;background:#0f1117;'
                'color:#e0e0e0;border:1px solid #2a2a4a;border-radius:4px;'
                'padding:6px 8px;font-size:13px;">\n'
                '    <button id="snrBtn" class="runbtn" style="padding:6px 12px;'
                'font-size:12px;" onclick="startRun(true)">用此 SNR 重跑</button>\n'
                '  </span>\n'
                '  <span class="hslider-wrap">\n'
                '    <label for="outDirIn" title="重跑时输出到该目录（其下 event_001）；'
                '留空=默认 runs/exp014_full_pipeline_snr{{X}}">输出目录（留空=默认）</label>\n'
                '    <input type="text" id="outDirIn" value="" spellcheck="false"\n'
                '           placeholder="如 G:/PhD/04_methods/18_DC-GDCST+DT-FSBL/runs/my_exp"\n'
                '           style="width:300px;background:#0f1117;color:#e0e0e0;'
                'border:1px solid #2a2a4a;border-radius:4px;padding:6px 8px;'
                'font-size:12px;">\n'
                '  </span>')
        m = load_metrics()
        stations = " / ".join(m.get("stations", []))
        freq_band = m.get("freq_band", [0.001, 0.012])
        fs = m.get("fs", 6.625)
        # 图片列表（带 cache-bust 时间戳，运行后强制刷新）
        ts = int(time.time())
        # 页签式布局：每组一个页签，默认显示第一组；图用 Plotly 交互渲染
        nav_btns = ""
        panels = ""
        plot_groups_js = "{"
        for i, (gname, items) in enumerate(IMAGE_GROUPS):
            cards = ""
            keys_js = []
            for key, png, caption in items:
                keys_js.append(repr(key))
                cards += (
                    f'<div class="card">'
                    f'<div class="plot-wrap"><div id="plot-{key}" class="plot-div"></div></div>'
                    f'<div class="card-cap">{caption} · '
                    f'<a href="{png}?t={ts}" target="_blank" class="png-link">下载 PNG</a>'
                    f'</div></div>')
            plot_groups_js += ("" if i == 0 else ",") + f'{i}:[{",".join(keys_js)}]'
            active = " active" if i == 0 else ""
            nav_btns += (
                f'<button class="navbtn{active}" onclick="showTab({i})">'
                f'{gname}</button>')
            panels += (
                f'<div class="panel{active}" id="panel-{i}">'
                f'<div class="grid">{cards}</div></div>')
        plot_groups_js += "}"
        # 参数总览页签（第 9 个，无图，仅表格）
        params_panel = (
            '<div class="panel" id="panel-params">'
            '<div class="params-note" id="params-note">加载中...</div>'
            '<div id="params-tables"></div></div>')
        nav_btns += (
            '<button class="navbtn" onclick="showTab(8)">'
            '参数总览（中间计算）</button>')
        # 指标卡
        snr_improve = m.get("snr_output_db", 0) - m.get("snr_input_db", 0)
        # [2026-09-18 口径标注] 顶栏 SNR 输入卡注明"公共·三站平均"；
        # 目标 SNR 与逐站实测值在下方 note 行展示（详见 _snr_note_parts）。
        _target_v = m.get("target_snr_db")
        _sta_vals = m.get("snr_input_per_station") or []
        _snr_in_label = ("SNR 输入 (dB, 公共·三站平均)"
                         if (_target_v is not None or _sta_vals)
                         else "SNR 输入 (dB)")
        metric_cards = ""
        _metric_ids = ["m-snr-in", "m-snr-out", "m-snr-gain",
                       "m-corr", "m-iter", "m-atoms"]
        for _i, (label, value, fmt, good_when) in enumerate([
            (_snr_in_label, m.get("snr_input_db", 0), ".2f",
             lambda v: v >= 0),
            ("SNR 输出 (dB)", m.get("snr_output_db", 0), ".2f",
             lambda v: v >= 0),
            ("SNR 提升 (dB)", snr_improve, ".2f", lambda v: v >= 0),
            ("相关系数 corr", m.get("correlation", 0), ".4f",
             lambda v: v > 0.5),
            ("FSBL 迭代", m.get("n_iterations", "N/A"), "s",
             lambda v: True),
            ("活跃原子", m.get("n_active_atoms", "N/A"), "s",
             lambda v: True),
        ]):
            v = value
            try:
                cls = "good" if good_when(float(v)) else "bad"
            except Exception:
                cls = ""
            txt = str(v) if fmt == "s" else f"{v:{fmt}}"
            metric_cards += (
                f'<div class="metric"><div class="m-label">{label}</div>'
                f'<div class="m-value {cls}" id="{_metric_ids[_i]}">{txt}</div></div>')
        metric_cards += (
            f'<div class="metric" style="min-width:320px;border-color:#0d47a1;">'
            f'<div class="m-label">当前输出目录（完整路径）</div>'
            f'<div class="m-value" id="curDataDir" style="font-size:12px;'
            f'word-break:break-all;line-height:1.4;" '
            f'title="{CURRENT_DATA_DIR}">{CURRENT_DATA_DIR}</div></div>')
        # [2026-09-22 SPA] SNR 口径说明（前端切换时也可通过 /api/metrics 刷新）
        _snr_note = _snr_note_html(m)
        metric_cards += (
            f'<div class="note" id="snrNote" style="width:100%;margin:2px 0 0;">'
            f'{_snr_note}</div>')
        # [2026-09-22 预取] 注入全部交互图 key 列表
        plot_keys_js = "[" + ",".join(f'"{k}"' for k in PLOT_FACTORIES) + "]"
        # [2026-09-22 修复] 同步注入当前数据包目录（缓存 key 依赖它；
        #   不能只靠 refreshPkgSelect 异步设置，否则 loadPlot 先执行时 key=undefined）
        pkg_dir_js = str(CURRENT_DATA_DIR).replace("\\", "\\\\").replace('"', '\\"')
        return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DC-GDCST+DT-FSBL 学习整合版 · 可视化监控面板</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC",sans-serif;
       background:#0f1117; color:#e0e0e0; }}
.header {{ background:linear-gradient(135deg,#1a1a2e,#16213e); padding:18px 26px;
          border-bottom:1px solid #2a2a4a; }}
.header h1 {{ font-size:20px; color:#64b5f6; }}
.header .sub {{ font-size:12px; color:#90a4ae; margin-top:4px; }}
.runbar {{ display:flex; align-items:center; gap:14px; padding:10px 26px;
          background:#16213e; border-bottom:1px solid #2a2a4a; flex-wrap:wrap; }}
.runbtn {{ background:linear-gradient(135deg,#1565c0,#0d47a1); color:#fff; border:none;
          padding:9px 22px; border-radius:6px; cursor:pointer; font-size:14px; font-weight:600; }}
.runbtn:hover {{ transform:translateY(-1px); }}
.runbtn:disabled {{ background:#37474f; cursor:not-allowed; }}
.status {{ font-size:13px; color:#90a4ae; }}
.status.running {{ color:#ffa726; }} .status.done {{ color:#66bb6a; }}
.status.error {{ color:#ef5350; }}
.log {{ display:none; background:#0a0e1a; border:1px solid #2a2a4a; border-radius:6px;
       padding:10px 16px; margin:10px 26px; max-height:220px; overflow-y:auto;
       font-family:Consolas,monospace; font-size:11px; color:#a5d6a7; line-height:1.5; }}
.log.show {{ display:block; }}
.logtoggle {{ color:#64b5f6; cursor:pointer; font-size:12px; text-decoration:underline; }}
.metrics {{ display:flex; gap:14px; padding:12px 26px; background:#1a1a2e;
           border-bottom:1px solid #2a2a4a; flex-wrap:wrap; }}
.metric {{ background:#16213e; border:1px solid #2a2a4a; border-radius:8px;
          padding:8px 16px; min-width:120px; }}
.m-label {{ font-size:11px; color:#90a4ae; }}
.m-value {{ font-size:20px; font-weight:700; color:#64b5f6; margin-top:2px; }}
.m-value.good {{ color:#66bb6a; }} .m-value.bad {{ color:#ef5350; }}
.note {{ margin:12px 26px 0; font-size:12px; color:#90a4ae; line-height:1.7;
        background:#16213e; border-left:3px solid #64b5f6; padding:10px 14px; border-radius:4px; }}
.group {{ margin:18px 26px; }}
.group-title {{ font-size:15px; font-weight:600; color:#64b5f6;
               border-bottom:1px solid #2a2a4a; padding-bottom:6px; margin-bottom:10px; }}
.grid {{ display:flex; flex-direction:column; gap:18px; }}
.card {{ width:100%; background:#1a1a2e; border:1px solid #2a2a4a; border-radius:8px; overflow:hidden; }}
.card-img {{ width:100%; display:block; background:#0a0e1a; }}
.card-img.missing {{ padding:40px 10px; text-align:center; color:#ef5350; font-size:13px; }}
.card-cap {{ padding:8px 12px; font-size:12px; color:#b0bec5; line-height:1.5; }}
.navbar {{ display:flex; gap:4px; padding:10px 26px; background:#16213e;
          border-bottom:1px solid #2a2a4a; overflow-x:auto; flex-wrap:wrap; }}
.navbtn {{ background:transparent; border:1px solid transparent; color:#90a4ae;
          padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px;
          white-space:nowrap; transition:all 0.2s; }}
.navbtn:hover {{ background:#2a2a4a; color:#e0e0e0; }}
.navbtn.active {{ background:#1565c0; color:#fff; border-color:#1565c0; }}
.panel {{ display:none; padding:18px 26px; }}
.panel.active {{ display:block; }}
.plot-wrap {{ padding:6px 6px 0; }}
.plot-div {{ width:100%; height:430px; background:#0a0e1a; border-radius:6px; }}
.hslider-wrap {{ margin-left:18px; display:inline-flex; align-items:center; gap:8px; }}
.hslider-wrap label {{ color:#90a4ae; font-size:12px; }}
.hslider-wrap input[type=range] {{ width:160px; accent-color:#1565c0; }}
#plotHVal {{ color:#64b5f6; font-size:12px; min-width:52px; }}
.png-link {{ color:#64b5f6; text-decoration:none; }}
.png-link:hover {{ text-decoration:underline; }}
.ptable {{ margin:14px 0; background:#1a1a2e; border:1px solid #2a2a4a;
          border-radius:8px; padding:12px 16px; }}
.ptitle {{ font-size:14px; font-weight:600; color:#64b5f6; margin-bottom:8px; }}
.ptable table {{ width:100%; border-collapse:collapse; font-size:12px; }}
.ptable th {{ background:#16213e; color:#90a4ae; text-align:left;
             padding:6px 10px; border-bottom:1px solid #2a2a4a; }}
.ptable td {{ padding:6px 10px; border-bottom:1px solid #1f2340; color:#e0e0e0; }}
.ptable tr:hover td {{ background:#1f2a44; }}
.pnote {{ margin-top:8px; font-size:11px; color:#90a4ae; line-height:1.6; }}
.params-note {{ margin:14px 26px 0; font-size:12px; color:#90a4ae;
               background:#16213e; border-left:3px solid #64b5f6;
               padding:10px 14px; border-radius:4px; }}
.pkg-modal {{ position:fixed; inset:0; background:rgba(0,0,0,0.55);
              z-index:999; display:flex; align-items:center; justify-content:center; }}
.pkg-modal-box {{ background:#16213e; border:1px solid #2a2a4a; border-radius:10px;
                  width:min(1100px,96vw); padding:16px 18px; }}
.pkg-modal-head {{ display:flex; justify-content:space-between; align-items:center;
                   margin-bottom:12px; }}
.pkg-table {{ width:100%; border-collapse:collapse; font-size:12px; table-layout:auto; }}
.pkg-table th {{ background:#0f1117; color:#90a4ae; text-align:left; padding:7px 10px;
                 position:sticky; top:0; border-bottom:1px solid #2a2a4a; white-space:nowrap; }}
.pkg-table td {{ padding:7px 10px; border-bottom:1px solid #1f2340; color:#e0e0e0; white-space:nowrap; }}
.pkg-table tr {{ cursor:pointer; }}
.pkg-table tr:hover td {{ background:#1f2a44; }}
.pkg-cur {{ color:#52c41a; font-weight:600; }}
.pkg-badge {{ display:inline-block; padding:1px 8px; border-radius:10px; font-size:11px; }}
.pkg-badge.syn {{ background:#0d47a1; color:#90caf9; }}
.pkg-badge.real {{ background:#4a148c; color:#ce93d8; }}
</style>
<script src="static/plotly.min.js"></script>
<script src="static/fflate.min.js"></script>
</head>
<body>
<div class="header">
  <h1>DC-GDCST + DT-FSBL 学习整合版 · 可视化监控面板</h1>
  <div class="sub">fs={fs} Hz · 台站 {stations} · 目标频带 [{freq_band[0]}, {freq_band[1]}] Hz ·
     数据口径：信号 5h / 噪声 ≥24h（拼 25h） · DISP 位移型 → 产物 m</div>
</div>

<div class="runbar">
  {runbar_inner}
  <span class="hslider-wrap">
    <label for="plotH">画布高度</label>
    <input type="range" id="plotH" min="280" max="1000" step="10" value="430">
    <span id="plotHVal">430 px</span>
  </span>
  <button class="runbtn" style="margin-left:auto;" onclick="document.getElementById('pkgFile').click()"
          title="读取本地 dashboard_package.tar.gz（浏览器本地解析，不上传网络），切换显示全部实验数据">&#128194; 选择本地数据包</button>
  <input type="file" id="pkgFile" accept=".tar.gz,.gz" style="display:none;">
  <span class="hslider-wrap" style="margin-left:12px;">
    <button class="runbtn" style="padding:6px 10px;font-size:12px;margin-right:6px;"
            onclick="refreshPkgSelect()" title="刷新服务器数据包列表（只刷新列表，不刷新页面）">&#128260; 刷新列表</button>
    <select id="pkgSelect" onchange="onPkgSelect(this.value)"
            style="background:#0f1117;color:#e0e0e0;border:1px solid #2a2a4a;border-radius:4px;padding:6px 8px;font-size:12px;max-width:220px;">
      <option value="">（加载中…）</option>
    </select>
  </span>
  <button class="runbtn" style="padding:6px 12px;font-size:12px;"
          onclick="openPkgList()" title="查看服务器上所有已上传数据包的详细信息">&#128203; 数据包列表</button>
</div>
<div id="pkgListModal" class="pkg-modal" style="display:none;">
  <div class="pkg-modal-box">
    <div class="pkg-modal-head">
      <span style="font-size:15px;font-weight:600;color:#64b5f6;">服务器数据包列表</span>
      <span onclick="closePkgList()" style="cursor:pointer;color:#90a4ae;font-size:18px;">&times;</span>
    </div>
    <div id="pkgListBody" style="max-height:60vh;overflow:auto;padding:4px 2px;">加载中…</div>
  </div>
</div>
<div id="runLog" class="log"></div>

<div class="metrics">{metric_cards}</div>

<div class="navbar" id="mainNav">{nav_btns}</div>

<div class="note" id="mainNote">
  <b>数据来源说明：</b>当前图片基于已完成实验 exp014（snr10 合成数据，
  fs=6.625 Hz、3 站、5h 信号 119250 点）的中间结果，按<b>最新方案</b>重新绘图：
  修正窗长（问题 02）、ObsPy 安全带通（问题 12）、max_iter≥6000（问题 03）、
  η≥2→max(σ^2_q) 保守初始化（问题 04）、带通后评估（问题 13）、DISP 位移口径（问题 07）；
  并新增学习笔记要求的所有图片：η 时变图（待办 C）、置信度图（待办 E）、
  C_multi（待办 F）、高阶互相关 3→2→1（待办 B）、Δτ 测试（待办 D）、
  仪器响应单位图（待办 A）。点击图片可放大查看。
  <br><br>
  <b>SNR 口径（目标频带 [0.001,0.012] Hz 带通后，counts 域）：</b><br>
  · SNR 输入 = 10·log10( Σ(clean_bp)² / Σ((obs−clean)_bp)² ) —— 真值信号 vs 观测中噪声分量；<br>
  · SNR 输出 = 10·log10( Σ(clean_bp)² / Σ((clean−recon)_bp)² ) —— 真值信号 vs 重建残差（重建 vs 真值同域）；<br>
  · SNR 提升 = SNR输出 − SNR输入（负值 = 重建未达输入水平，正值 = 去噪提升）。<br>
  · 输入 SNR 可调低、可为负值（噪声强于信号，如 −3 dB）：在顶部输入目标 SNR 点"用此 SNR 重跑"，管线将按
    counts = clean + scale·noise 重合成观测（scale 由带内 SNR 目标反推、逐台站），
    并重跑完整 GDCST→FSBL 管线生成新结果目录与全部图片。
</div>

<div id="mainPanels">{panels}</div>
<div id="mainParams">{params_panel}</div>

<script>
// [2026-09-22 同步注入] 当前数据包目录（服务器渲染时确定，供缓存 key 使用）
const PKG_DATA_DIR = "{pkg_dir_js}";
// ===== 数据包本地读取（2026-09-18 新增：云端/本地通用，浏览器本地解析不上传） =====
let PKG = null;
let PKG_GROUPS = [];
function untarSimple(u8) {{
  const out = [];
  let off = 0, n = u8.length;
  while (off + 512 <= n) {{
    let name = '';
    for (let i = 0; i < 100; i++) {{ const b = u8[off + i]; if (b === 0) break; name += String.fromCharCode(b); }}
    if (!name) {{ off += 512; continue; }}
    let sizeStr = '';
    for (let j = 124; j < 136; j++) {{ const c = String.fromCharCode(u8[off + j]); if (c === '\0' || c === ' ') break; sizeStr += c; }}
    const size = parseInt(sizeStr, 8) || 0;
    const type = String.fromCharCode(u8[off + 156]);
    if (type === 'x' || type === 'g' || type === 'L' || type === 'K' || type === '5') {{ off += 512 + Math.ceil(size / 512) * 512; continue; }}
    out.push({{ name: name, data: u8.slice(off + 512, off + 512 + size) }});
    off += 512 + Math.ceil(size / 512) * 512;
  }}
  return out;
}}
document.getElementById('pkgFile').addEventListener('change', function () {{
  if (this.files && this.files[0]) loadLocalPackage(this.files[0]);
}});
function pkgSetStatus(msg, cls) {{
  const st = document.getElementById('runStatus');
  if (st) {{ st.className = 'status ' + (cls || ''); st.textContent = msg; }}
}}
function loadLocalPackage(file) {{
  pkgSetStatus('正在读取数据包（本地解析，不上传）...', 'running');
  file.arrayBuffer().then(function (buf) {{
    const tar = fflate.gunzipSync(new Uint8Array(buf));
    PKG = {{}};
    untarSimple(tar).forEach(function (e) {{ var nm = e.name; if (nm.indexOf('./') === 0) nm = nm.slice(2); PKG[nm] = e.data; }});
    renderPkgView(file.name, file.size);
    pkgSetStatus('已加载数据包：' + file.name + '（交互图 ' + pkgFigKeys().length + ' 张，图集 ' + pkgPngKeys().length + ' 张）', 'good');
  }}).catch(function (e) {{
    pkgSetStatus('数据包读取失败：' + e.message, 'error');
  }});
}}
function pkgFigKeys() {{ return Object.keys(PKG).filter(function (k) {{ return k.indexOf('figs_json/') === 0 && k.endsWith('.json'); }}).sort(); }}
function pkgPngKeys() {{ return Object.keys(PKG).filter(function (k) {{ return k.indexOf('figs/') === 0 && k.endsWith('.png'); }}).sort(); }}
function pkgHideMain(hide) {{
  ['mainNav', 'mainPanels', 'mainNote', 'mainParams'].forEach(function (id) {{
    const el = document.getElementById(id);
    if (el) el.style.display = hide ? 'none' : '';
  }});
}}
function pkgBackToPanel() {{
  const wrap = document.getElementById('pkgview');
  if (wrap) wrap.remove();
  PKG = null;
  pkgHideMain(false);
  window.scrollTo({{ top: 0, behavior: 'smooth' }});
}}
function fixFigLayout(fig) {{
  const L = fig.layout || {{}};
  // 长标题精简：完整说明由卡片 caption 承担，图内只留主标题（避免标题占多行挤压图例）
  if (L.title && L.title.text) {{
    const t = String(L.title.text);
    if (t.length > 30) {{
      const idx = t.indexOf('——');
      L.title.text = (idx > 0 ? t.slice(0, idx) : t).trim();
    }}
    L.title.font = L.title.font || {{}};
    L.title.font.size = Math.min(L.title.font.size || 16, 15);
    L.title.x = 0.5;
    L.title.xanchor = 'center';
  }}
  // 图例：隐藏 plotly 自带（自动换行成3行），用 HTML 自定义图例一行居中
  L.showlegend = false;
  // 右边空块修复：xaxis.domain 右边界从 0.94 扩到 0.98（twin y 轴在图内，右边不用留那么多）
  Object.keys(L).forEach(function (k) {{
    if (/^xaxis(\\d*)$/.test(k) && L[k].domain) {{
      L[k].domain[1] = 0.98;
    }}
  }});
  return fig;
}}
function pkgPlotHeight() {{
  const h = document.getElementById('plotH');
  return h && h.value ? h.value : 430;
}}
function renderPkgView(name, sizeBytes) {{
  let wrap = document.getElementById('pkgview');
  if (!wrap) {{ wrap = document.createElement('div'); wrap.id = 'pkgview'; document.querySelector('.metrics').insertAdjacentElement('afterend', wrap); }}
  pkgHideMain(true);
  const info = document.createElement('div');
  info.className = 'note';
  const pkgInfo = (PKG['package_info.json'] ? JSON.parse(new TextDecoder().decode(PKG['package_info.json'])) : null);
  const idTxt = (pkgInfo && pkgInfo.package_id) ? pkgInfo.package_id : name.replace('_dashboard_package.tar.gz', '');
  const sizeTxt = sizeBytes ? ('，' + (sizeBytes / 1048576).toFixed(1) + ' MB') : '';
  info.innerHTML = '<b>数据包：</b>' + idTxt + '（' + name + sizeTxt + '）——交互图 ' +
    pkgFigKeys().length + ' 张' +
    (pkgInfo && pkgInfo.created_at ? '，生成于 ' + pkgInfo.created_at : '');
  // [2026-09-18] 同步顶部指标栏：从数据包 metadata.json 读取 SNR/corr/FSBL 等，输出目录用 data_dir
  try {{
    const meta = PKG['metadata.json'] ? JSON.parse(new TextDecoder().decode(PKG['metadata.json'])) : null;
    if (meta) {{
      const m = meta.metrics_common || {{}};
      // 更新输出目录
      const dirEl = document.getElementById('curDataDir');
      if (dirEl && pkgInfo && pkgInfo.data_dir) {{
        dirEl.textContent = pkgInfo.data_dir;
        dirEl.title = pkgInfo.data_dir;
      }}
      // 更新指标卡（按 m-label 文本匹配）
      const upd = function(labelKey, val, fmt) {{
        const cards = document.querySelectorAll('.metrics .metric');
        cards.forEach(function(c) {{
          const lbl = c.querySelector('.m-label');
          const vEl = c.querySelector('.m-value');
          if (lbl && vEl && lbl.textContent.indexOf(labelKey) >= 0) {{
            vEl.textContent = fmt ? fmt(val) : String(val);
          }}
        }});
      }};
      if (m.snr_input_db !== undefined) upd('SNR 输入', m.snr_input_db, v => v.toFixed(2));
      if (m.snr_output_db !== undefined) upd('SNR 输出', m.snr_output_db, v => v.toFixed(2));
      if (m.correlation !== undefined) upd('相关系数', m.correlation, v => v.toFixed(4));
      const fsbl = meta.fsbl_info || {{}};
      if (fsbl.n_iterations !== undefined) upd('FSBL 迭代', fsbl.n_iterations, v => String(v));
      if (fsbl.n_active_atoms !== undefined) upd('活跃原子', fsbl.n_active_atoms, v => String(v));
      // SNR 提升
      if (m.snr_input_db !== undefined && m.snr_output_db !== undefined) {{
        const gain = m.snr_output_db - m.snr_input_db;
        upd('SNR 提升', gain, v => v.toFixed(2));
      }}
    }}
  }} catch(e) {{ console.warn('更新指标栏失败:', e); }}
  // 页签 = 原面板功能组（mainNav 被隐藏但 DOM 仍在，直接复用组名与顺序）
  const groupBtns = document.querySelectorAll('#mainNav .navbtn');
  PKG_GROUPS = [];
  groupBtns.forEach(function (b) {{ PKG_GROUPS.push(b.textContent); }});
  if (!PKG_GROUPS.length) {{
    PKG_GROUPS = ['A 输入与预处理', 'A-5 仪器响应（待办 A）', 'B 噪声建模', 'C GDCST',
                  'D DT-FSBL', 'E 信号重建', '评估（问题 13）',
                  'F 后处理与自由振荡提取', '参数总览（中间计算）'];
  }}
  const tab = document.createElement('div');
  tab.className = 'navbar';
  let tabsHtml = '<span style="color:#64b5f6;font-size:13px;align-self:center;margin-right:8px;">&#128194; ' + idTxt + '</span>';
  PKG_GROUPS.forEach(function (g, i) {{
    tabsHtml += '<button class="navbtn' + (i === 0 ? ' active' : '') + '" data-gi="' + i + '">' + g + '</button>';
  }});
  tabsHtml += '<button class="navbtn" data-pt="back" style="margin-left:auto;color:#ffa726;">&#8617; 返回面板</button>';
  tab.innerHTML = tabsHtml;
  const content = document.createElement('div');
  content.id = 'pkgcontent';
  wrap.innerHTML = '';
  wrap.appendChild(info);
  wrap.appendChild(tab);
  wrap.appendChild(content);
  tab.addEventListener('click', function (e) {{
    if (e.target.dataset.pt === 'back') {{ pkgBackToPanel(); return; }}
    const gi = e.target.dataset.gi;
    if (gi === undefined) return;
    tab.querySelectorAll('.navbtn').forEach(function (b) {{ b.classList.toggle('active', b === e.target); }});
    switchPkgTab(parseInt(gi, 10));
  }});
  switchPkgTab(0);
  wrap.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
}}
function switchPkgTab(i) {{
  const c = document.getElementById('pkgcontent');
  // 最后一组 = 参数总览（与原面板 showTab(8) 一致）
  if (i === PKG_GROUPS.length - 1) {{ renderPkgParams(c); return; }}
  const keys = (PLOT_GROUPS[i] || []);
  if (!keys.length) {{ c.innerHTML = '<div class="note">该组无图</div>'; return; }}
  let html = '<div class="grid">';
  keys.forEach(function (k) {{
    html += '<div class="card"><div class="plot-wrap"><div id="pkgplot-' + k + '" class="plot-div" style="height:' + pkgPlotHeight() + 'px;"></div></div>' +
      '<div class="card-cap"><span id="pkgcap-' + k + '">图 ' + k + '</span> · ' +
      '<a class="png-link" id="pkgdl-' + k + '" download="' + k + '.png">下载 PNG</a></div></div>';
  }});
  html += '</div>';
  c.innerHTML = html;
  keys.forEach(function (k) {{ renderPkgFigByKey(k); }});
}}
function addHtmlLegend(divId, fig) {{
  const plot = document.getElementById(divId);
  if (!plot) return;
  const card = plot.closest('.card');
  if (!card) return;
  const old = card.querySelector('.html-legend');
  if (old) old.remove();
  const legend = document.createElement('div');
  legend.className = 'html-legend';
  legend.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px;padding:6px 0 2px;font-size:11px;color:#e0e0e0;';
  (fig.data || []).forEach(function(tr, i) {{
    const item = document.createElement('span');
    item.style.cssText = 'display:inline-flex;align-items:center;gap:4px;cursor:pointer;user-select:none;';
    const color = (tr.line && tr.line.color) || '#888';
    const dash = (tr.line && tr.line.dash) || 'solid';
    const lineCss = dash === 'dash' ? 'border-top:2px dashed ' + color : 'border-top:2px solid ' + color;
    item.innerHTML = '<span style="display:inline-block;width:18px;height:0;' + lineCss + ';"></span><span>' + (tr.name || ('trace ' + i)) + '</span>';
    item.onclick = function() {{
      const traces = plot.data;
      const t = traces[i];
      // 初始 visible 可能是 undefined，当作显示(true)处理
      const curVisible = t ? (t.visible !== false && t.visible !== 'legendonly') : true;
      const next = curVisible ? 'legendonly' : true;
      Plotly.restyle(plot, {{visible: next}}, [i]);
      item.style.opacity = (next === true) ? '1' : '0.35';
    }};
    legend.appendChild(item);
  }});
  const titleEl = card.querySelector('.card-cap');
  card.insertBefore(legend, titleEl);
}}
function renderPkgFigByKey(k) {{
  const div = document.getElementById('pkgplot-' + k);
  const raw = PKG['figs_json/' + k + '.json'];
  if (!div || !raw) {{ if (div) div.innerHTML = '<div class="note">包内缺少 figs_json/' + k + '.json</div>'; return; }}
  try {{
    const fig0 = JSON.parse(new TextDecoder().decode(raw));
    const t0 = (fig0.layout && fig0.layout.title && fig0.layout.title.text) ? fig0.layout.title.text : '';
    const fig = fixFigLayout(fig0);
    Plotly.newPlot(div, fig.data || [], fig.layout || {{}}, {{ responsive: true, displaylogo: false }});
    addHtmlLegend(div.id, fig);
    const cap = document.getElementById('pkgcap-' + k);
    if (cap && t0) cap.textContent = t0;
  }} catch (e) {{ div.innerHTML = '<div class="note">渲染失败：' + e.message + '</div>'; }}
  const png = PKG['figs/' + k + '.png'];
  const a = document.getElementById('pkgdl-' + k);
  if (a && png) a.href = URL.createObjectURL(new Blob([png], {{ type: 'image/png' }}));
}}
function renderPkgParams(c) {{
  try {{
    const p = JSON.parse(new TextDecoder().decode(PKG['params.json']));
    let h = '';
    for (const st in (p.stages || {{}})) {{
      const rows = p.stages[st];
      if (!Array.isArray(rows) || !rows.length) continue;
      const cols = Object.keys(rows[0]);
      h += '<div class="group-title">' + st + '</div><div class="ptable"><table><thead><tr>';
      cols.forEach(function (col) {{ h += '<th>' + col + '</th>'; }});
      h += '</tr></thead><tbody>';
      rows.forEach(function (r) {{ h += '<tr>' + cols.map(function (col) {{ return '<td>' + r[col] + '</td>'; }}).join('') + '</tr>'; }});
      h += '</tbody></table></div>';
    }}
    c.innerHTML = h || '<div class="note">参数表为空</div>';
  }} catch (e) {{ c.innerHTML = '<div class="note">参数表解析失败：' + e.message + '</div>'; }}
}}
let pollTimer = null;
const PLOT_GROUPS = {plot_groups_js};
const loadedPlots = {{}};
// ===== 数据包图缓存（IndexedDB，2026-09-22 新增）=====
const PKG_CACHE_DB = 'dcgdcst_plot_cache';
const PKG_CACHE_STORE = 'figures';
const PKG_CACHE_MAX = 200;
let _pkgCacheDB = null;
function pkgCacheOpen() {{
  return new Promise(function (resolve, reject) {{
    if (_pkgCacheDB) {{ resolve(_pkgCacheDB); return; }}
    try {{
      const req = indexedDB.open(PKG_CACHE_DB, 1);
      req.onupgradeneeded = function (e) {{
        const db = e.target.result;
        if (!db.objectStoreNames.contains(PKG_CACHE_STORE)) {{
          db.createObjectStore(PKG_CACHE_STORE);
        }}
      }};
      req.onsuccess = function (e) {{ _pkgCacheDB = e.target.result; resolve(_pkgCacheDB); }};
      req.onerror = function () {{ reject(new Error('IndexedDB 打开失败')); }};
    }} catch (e) {{ reject(e); }}
  }});
}}
function pkgCacheGet(key) {{
  return pkgCacheOpen().then(function (db) {{
    return new Promise(function (resolve, reject) {{
      try {{
        const tx = db.transaction(PKG_CACHE_STORE, 'readonly');
        const rq = tx.objectStore(PKG_CACHE_STORE).get(key);
        rq.onsuccess = function () {{ resolve(rq.result || null); }};
        rq.onerror = function () {{ reject(new Error('读取缓存失败')); }};
      }} catch (e) {{ reject(e); }}
    }});
  }});
}}
function pkgCacheSet(key, fig) {{
  return pkgCacheOpen().then(function (db) {{
    return new Promise(function (resolve, reject) {{
      try {{
        const tx = db.transaction(PKG_CACHE_STORE, 'readwrite');
        const store = tx.objectStore(PKG_CACHE_STORE);
        store.put({{ts: Date.now(), fig: fig}}, key);
        // 容量控制：超过上限删最旧
        const cnt = store.count();
        cnt.onsuccess = function () {{
          if (cnt.result > PKG_CACHE_MAX) {{
            const cur = store.openCursor();
            const oldest = [];
            cur.onsuccess = function () {{
              const c = cur.result;
              if (c) {{ oldest.push({{k: c.key, t: c.value.ts}}); c.continue(); }}
              else {{
                oldest.sort(function (a, b) {{ return a.t - b.t; }});
                for (let i = 0; i < Math.min(20, oldest.length); i++) {{
                  store.delete(oldest[i].k);
                }}
              }}
            }};
          }}
        }};
        tx.oncomplete = function () {{ resolve(true); }};
        tx.onerror = function () {{ reject(new Error('写缓存失败')); }};
      }} catch (e) {{ reject(e); }}
    }});
  }});
}}
function currentCacheKey(key) {{
  const dir = (window.PKG_DATA_DIR || '');
  return dir + '|' + key;
}}
async function loadPlot(key) {{
  if (loadedPlots[key]) return;
  const div = document.getElementById('plot-' + key);
  if (!div) return;
  loadedPlots[key] = true;
  const ckey = currentCacheKey(key);
  try {{
    let fig = null;
    // 1) 先查浏览器本地缓存（同一数据包二次查看秒开）
    try {{
      const hit = await pkgCacheGet(ckey);
      if (hit && hit.fig) fig = hit.fig;
    }} catch (e) {{ /* 缓存不可用则走网络 */ }}
    if (!fig) {{
      const r = await fetch('api/plot/' + key);
      fig = await r.json();
      // 写入缓存（不阻塞渲染）
      pkgCacheSet(ckey, fig).catch(function () {{}});
    }}
    fig = fixFigLayout(fig);
    await Plotly.newPlot(div, fig.data, fig.layout,
                         {{responsive: true, displaylogo: false}});
    addHtmlLegend(div.id, fig);
  }} catch(e) {{
    div.innerHTML = '<div style="padding:24px;color:#ef5350;font-size:13px;">'
      + '交互图加载失败（' + e + '）</div>';
  }}
}}
// ===== 后台预取其他数据包（2026-09-22 新增）=====
let _prefetchBusy = false;
async function prefetchAllPackages() {{
  if (_prefetchBusy) return;
  _prefetchBusy = true;
  try {{
    const r = await fetch('api/packages');
    const d = await r.json();
    if (!d.ok || !d.packages) return;
    const curDir = (window.PKG_DATA_DIR || '');
    const others = d.packages.filter(function (p) {{ return p.dir !== curDir; }});
    if (others.length === 0) return;
    // 串行预取：每包每图，从 /api/plot/<key>?dir=<包目录> 取并写缓存
    const keys = Object.keys(PLOT_FACTORIES_KEYS || {{}});
    const statusEl = document.getElementById('runStatus');
    let done = 0, total = 0;
    others.forEach(function (p) {{ total += keys.length; }});
    for (const p of others) {{
      for (const k of keys) {{
        const ckey = p.dir + '|' + k;
        try {{
          const hit = await pkgCacheGet(ckey);
          if (hit && hit.fig) {{ done++; continue; }}
          const rr = await fetch('api/plot/' + k + '?dir=' + encodeURIComponent(p.dir));
          if (rr.ok) {{
            const fig = await rr.json();
            await pkgCacheSet(ckey, fig);
          }}
        }} catch (e) {{ /* 单个图失败不中断 */ }}
        done++;
        if (statusEl && total > 0) {{
          statusEl.className = 'status';
          statusEl.textContent = '后台预取数据包 ' + p.name + '（' + done + '/' + total + '）';
        }}
      }}
    }}
    if (statusEl) {{
      statusEl.className = 'status';
      statusEl.textContent = '';
    }}
  }} finally {{
    _prefetchBusy = false;
  }}
}}
function showTab(i) {{
  document.querySelectorAll('.navbtn').forEach((b, k) => b.classList.toggle('active', k === i));
  document.querySelectorAll('.panel').forEach((p, k) => p.classList.toggle('active', k === i));
  (PLOT_GROUPS[i] || []).forEach(loadPlot);
  if (i === 8) loadParams();
}}
let paramsLoaded = false;
async function loadParams() {{
  if (paramsLoaded) return;
  paramsLoaded = true;
  try {{
    const r = await fetch('api/params');
    const d = await r.json();
    const note = document.getElementById('params-note');
    note.textContent = '数据口径：exp014（snr10 合成，fs=' + d.meta.fs_hz
      + ' Hz，目标频带 [' + d.meta.freq_band.join(', ') + '] Hz）。'
      + '点击每行可展开分段明细。';
    let html = '';
    d.tables.forEach(t => {{
      html += '<div class="ptable"><div class="ptitle">' + t.title + '</div>';
      html += '<table><thead><tr>' + t.columns.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
      t.rows.forEach(r => {{
        html += '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>';
      }});
      html += '</tbody></table><div class="pnote">' + t.note + '</div></div>';
    }});
    document.getElementById('params-tables').innerHTML = html;
  }} catch(e) {{
    document.getElementById('params-note').textContent = '参数加载失败: ' + e;
  }}
}}
showTab(0);
// 画布高度调节：滑块变化 → 更新所有 .plot-div 高度 + Plotly.resize 已加载图
const plotH = document.getElementById('plotH');
plotH.addEventListener('input', () => {{
  const v = plotH.value;
  document.getElementById('plotHVal').textContent = v + ' px';
  document.querySelectorAll('.plot-div').forEach(d => {{ d.style.height = v + 'px'; }});
  Object.keys(loadedPlots).forEach(k => {{
    const div = document.getElementById('plot-' + k);
    if (div) {{ try {{ Plotly.Plots.resize(div); }} catch(e) {{}} }}
  }});
}});
async function startUpload() {{
  const btn = document.getElementById('uploadBtn');
  const status = document.getElementById('runStatus');
  if (btn) btn.disabled = true;
  status.className = 'status running';
  status.textContent = '正在打包并上传云端（约 1-3 分钟）...';
  try {{
    const resp = await fetch('api/upload', {{method: 'POST'}});
    const data = await resp.json();
    if (data.ok) {{
      status.className = 'status good';
      status.textContent = '上传完成：' + data.package + ' → ' + data.url;
    }} else {{
      status.className = 'status error';
      status.textContent = '上传失败：' + (data.error || '未知错误');
    }}
  }} catch(e) {{
    status.className = 'status error';
    status.textContent = '上传失败：无法连接服务器';
  }}
  if (btn) btn.disabled = false;
}}
async function loadPackage() {{
  const pathInput = document.getElementById('pkgPath');
  const status = document.getElementById('runStatus');
  const path = (pathInput ? pathInput.value : '').trim();
  if (!path) {{
    status.className = 'status error';
    status.textContent = '请先输入数据包路径（dashboard_package.tar.gz）';
    return;
  }}
  const btn = document.getElementById('loadPkgBtn');
  if (btn) btn.disabled = true;
  status.className = 'status running';
  status.textContent = '正在读取数据包并恢复全部数据...';
  try {{
    const resp = await fetch('api/load_package', {{
      method: 'POST',
      headers: {{'Content-Type': 'application/json'}},
      body: JSON.stringify({{package: path}})
    }});
    const data = await resp.json();
    if (data.ok) {{
      status.className = 'status good';
      status.textContent = '数据包已加载: ' + data.data_dir;
      setTimeout(() => location.reload(), 1200);
    }} else {{
      status.className = 'status error';
      status.textContent = '加载失败: ' + (data.error || '未知错误');
    }}
  }} catch(e) {{
    status.className = 'status error';
    status.textContent = '加载失败: 无法连接服务器';
  }}
  if (btn) btn.disabled = false;
}}
async function startRun(withSnr) {{
  const btn = document.getElementById('runBtn');
  const snrBtn = document.getElementById('snrBtn');
  const status = document.getElementById('runStatus');
  btn.disabled = true;
  if (snrBtn) snrBtn.disabled = true;
  status.className = 'status running';
  const snrVal = document.getElementById('snrIn').value.trim();
  const outDirVal = document.getElementById('outDirIn').value.trim();
  status.textContent = (withSnr && snrVal) ? '正在按 SNR=' + snrVal + ' dB 重合成并运行管线...'
                                            : '正在启动管线...';
  try {{
    const bodyObj = {{}};
    if (withSnr && snrVal) bodyObj.input_snr = parseFloat(snrVal);
    if (outDirVal) bodyObj.out_root = outDirVal;
    const body = JSON.stringify(bodyObj);
    const resp = await fetch('api/run', {{method:'POST',
                                            headers:{{'Content-Type':'application/json'}},
                                            body: body}});
    const data = await resp.json();
    if (data.ok) {{ status.textContent = '管线运行中...'; poll(); }}
    else {{ status.textContent = data.error || '启动失败'; btn.disabled = false;
            if (snrBtn) snrBtn.disabled = false; }}
  }} catch(e) {{
    status.className = 'status error';
    status.textContent = '无法连接服务器，请先运行: python dashboard_server.py';
    btn.disabled = false;
    if (snrBtn) snrBtn.disabled = false;
  }}
}}
async function poll() {{
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {{
    try {{
      const r = await fetch('api/status');
      const d = await r.json();
      const status = document.getElementById('runStatus');
      const logEl = document.getElementById('runLog');
      const toggle = document.getElementById('runLogToggle');
      if (d.log_tail && d.log_tail.length) {{
        logEl.innerHTML = d.log_tail.map(l => '<div>' + esc(l) + '</div>').join('');
        logEl.scrollTop = logEl.scrollHeight;
        toggle.style.display = 'inline';
      }}
      if (d.status === 'running') {{
        status.className = 'status running';
        status.textContent = esc(d.current_step || '运行中...') + ' (' + d.elapsed_seconds + 's)';
      }} else if (d.status === 'done') {{
        clearInterval(pollTimer);
        status.className = 'status done';
        status.textContent = '完成！' + d.elapsed_seconds + 's，3秒后刷新';
        document.getElementById('runBtn').disabled = false;
        const snrBtn2 = document.getElementById('snrBtn');
        if (snrBtn2) snrBtn2.disabled = false;
        const cd = document.getElementById('curDataDir');
        if (cd && d.data_dir) {{
          cd.textContent = d.data_dir;
          cd.title = d.data_dir;
        }}
        setTimeout(() => location.reload(), 3000);
      }} else if (d.status === 'error') {{
        clearInterval(pollTimer);
        status.className = 'status error';
        status.textContent = '错误！请查看日志';
        document.getElementById('runBtn').disabled = false;
      }}
    }} catch(e) {{}}
  }}, 1500);
}}
function toggleLog() {{
  const el = document.getElementById('runLog');
  const t = document.getElementById('runLogToggle');
  el.classList.toggle('show');
  t.textContent = el.classList.contains('show') ? '隐藏日志' : '显示日志';
}}
function esc(s) {{ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }}
// ===== 数据包列表（2026-09-22 新增：服务器内数据包下拉 + 列表页） =====
async function refreshPkgSelect() {{
  try {{
    const r = await fetch('api/packages');
    const d = await r.json();
    // 异步覆盖（与后端注入一致；后端注入优先，这里兜底）
    if (d && d.current) window.PKG_DATA_DIR = d.current;
    const sel = document.getElementById('pkgSelect');
    if (!d.ok || !d.packages) {{
      sel.innerHTML = '<option value="">（接口不可用）</option>';
      return;
    }}
    const cur = d.current || '';
    let h = '<option value="">—— 选择服务器数据包 ——</option>';
    d.packages.forEach(function (p) {{
      const tag = (p.dir === cur) ? ' ✓当前' : '';
      h += '<option value="' + esc(p.dir) + '"' +
           (p.dir === cur ? ' selected' : '') + '>' +
           esc(p.name + ' [' + p.kind + '] 目标SNR入' + p.snr_in +
               '出' + p.snr_out + 'dB corr' + p.corr + tag) + '</option>';
    }});
    sel.innerHTML = h;
  }} catch (e) {{
    const sel = document.getElementById('pkgSelect');
    if (sel) sel.innerHTML = '<option value="">（加载失败）</option>';
  }}
}}
// ===== 无刷新更新顶部指标（2026-09-22 SPA）=====
function updateMetrics() {{
  return fetch('api/metrics').then(function (r) {{ return r.json(); }})
    .then(function (d) {{
      if (!d.ok || !d.metrics) return;
      const mt = d.metrics;
      const setV = function (id, v, fmt) {{
        const el = document.getElementById(id);
        if (!el) return;
        let txt = String(v);
        if (fmt === 'f2') txt = Number(v).toFixed(2);
        else if (fmt === 'f4') txt = Number(v).toFixed(4);
        el.textContent = txt;
        // 颜色：SNR >=0 / corr >0.5 为 good，否则 bad
        try {{
          const num = Number(v);
          if (id === 'm-corr') {{
            el.className = 'm-value ' + (num > 0.5 ? 'good' : 'bad');
          }} else if (id === 'm-iter' || id === 'm-atoms') {{
            el.className = 'm-value';
          }} else {{
            el.className = 'm-value ' + (num >= 0 ? 'good' : 'bad');
          }}
        }} catch (e) {{}}
      }};
      setV('m-snr-in', mt.snr_input_db, 'f2');
      setV('m-snr-out', mt.snr_output_db, 'f2');
      setV('m-snr-gain', (Number(mt.snr_output_db) - Number(mt.snr_input_db)), 'f2');
      setV('m-corr', mt.correlation, 'f4');
      setV('m-iter', mt.n_iterations, 's');
      setV('m-atoms', mt.n_active_atoms, 's');
      const cd = document.getElementById('curDataDir');
      if (cd && mt.data_dir) {{ cd.textContent = mt.data_dir; cd.title = mt.data_dir; }}
      const sn = document.getElementById('snrNote');
      if (sn && mt.snr_note) sn.textContent = mt.snr_note;
    }}).catch(function () {{}});
}}

function onPkgSelect(dir) {{
  if (!dir) return;
  // [2026-09-22 秒开] 防止上次切换的静默 reload 与本次冲突
  if (window._pkgReloadTimer) {{ clearTimeout(window._pkgReloadTimer); window._pkgReloadTimer = null; }}
  const status = document.getElementById('runStatus');
  if (status) {{ status.className = 'status running'; status.textContent = '正在加载数据包 ' + dir + ' ...'; }}
  fetch('api/load_package', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{package: dir}})
  }}).then(function (r) {{ return r.json(); }}).then(function (data) {{
    if (!data.ok) {{
      if (status) {{ status.className = 'status error'; status.textContent = '加载失败: ' + (data.error || ''); }}
      return;
    }}
    // [2026-09-22 SPA] 无刷新切换：
    // 1) 更新缓存 key 的数据包目录（图缓存立即可命中）
    window.PKG_DATA_DIR = dir;
    // 2) 重置已加载标记，重新渲染当前 tab 的图（缓存命中 → 本地秒出）
    for (const k in loadedPlots) delete loadedPlots[k];
    const active = document.querySelector('.navbtn.active');
    const idx = active ? Array.prototype.indexOf.call(
      document.querySelectorAll('.navbtn'), active) : 0;
    const grp = PLOT_GROUPS[idx] || [];
    grp.forEach(loadPlot);
    // 3) 刷新下拉框选中态
    refreshPkgSelect();
    // 4) 无刷新更新顶部指标卡（SNR/corr/迭代/活跃原子/输出目录/口径说明）
    updateMetrics();
    // 5) 状态提示（不再整页 reload）
    if (status) {{
      status.className = 'status good';
      status.textContent = '已切换: ' + data.data_dir;
    }}
  }}).catch(function () {{
    if (status) {{ status.className = 'status error'; status.textContent = '加载失败: 无法连接服务器'; }}
  }});
}}
function openPkgList() {{
  const modal = document.getElementById('pkgListModal');
  modal.style.display = 'flex';
  const body = document.getElementById('pkgListBody');
  body.innerHTML = '加载中…';
  fetch('api/packages').then(function (r) {{ return r.json(); }}).then(function (d) {{
    if (!d.ok || !d.packages) {{ body.innerHTML = '<div style="color:#ef5350;">接口返回异常</div>'; return; }}
    const cur = d.current || '';
    const cols = ['包名', '事件日期', '台站', '类型', '目标SNR入(dB)', '公共SNR入(dB)', 'SNR出(dB)', 'corr', '时长(h)', '状态'];
    let h = '<table class="pkg-table"><thead><tr>';
    cols.forEach(function (c) {{ h += '<th>' + c + '</th>'; }});
    h += '</tr></thead><tbody>';
    d.packages.forEach(function (p) {{
      const isCur = (p.dir === cur);
      h += '<tr data-dir="' + esc(p.dir) + '">';
      h += '<td><b>' + esc(p.name) + '</b></td>';
      h += '<td>' + esc(p.event_date || '—') + '</td>';
      h += '<td>' + esc(p.stations || '—') + '</td>';
      h += '<td><span class="pkg-badge ' + (p.kind === '合成' ? 'syn' : 'real') + '">' + esc(p.kind) + '</span></td>';
      h += '<td>' + esc(p.snr_in) + '</td>';
      h += '<td>' + esc(p.snr_in_common || '—') + '</td>';
      h += '<td>' + esc(p.snr_out) + '</td>';
      h += '<td>' + esc(p.corr) + '</td>';
      h += '<td>' + esc(p.duration_h) + '</td>';
      h += '<td>' + (isCur ? '<span class="pkg-cur">当前</span>' : '点击加载') + '</td>';
      h += '</tr>';
    }});
    h += '</tbody></table>';
    if (d.packages.length === 0) h = '<div style="color:#90a4ae;">暂无已上传数据包</div>';
    body.innerHTML = h;
    // 事件委托：data-dir 属性 → 点击加载对应数据包
    // （2026-09-22 修复：不用 onclick 内联，规避 f-string 单引号转义问题）
    body.querySelectorAll('tr[data-dir]').forEach(function (tr) {{
      tr.addEventListener('click', function () {{
        onPkgSelect(tr.getAttribute('data-dir'));
      }});
    }});
  }}).catch(function () {{
    body.innerHTML = '<div style="color:#ef5350;">加载列表失败</div>';
  }});
}}
function closePkgList() {{
  document.getElementById('pkgListModal').style.display = 'none';
}}
// 全部交互图 key（供后台预取遍历）
const PLOT_FACTORIES_KEYS = {plot_keys_js};
// 页面加载完成后空闲预取其他数据包（延迟 2.5s，避免影响首屏）
setTimeout(function () {{
  if (window.requestIdleCallback) {{
    requestIdleCallback(function () {{ prefetchAllPackages(); }}, {{timeout: 8000}});
  }} else {{
    setTimeout(prefetchAllPackages, 5000);
  }}
}}, 2500);
refreshPkgSelect();
</script>
</body>
</html>"""

    # ---------- 工具 ----------
    def _get_state(self):
        with state_lock:
            elapsed = 0
            if state["start_time"]:
                end = state["end_time"] or time.time()
                elapsed = end - state["start_time"]
            return {
                "status": state["status"],
                "current_step": state["current_step"],
                "elapsed_seconds": round(elapsed, 1),
                "log_tail": state["log"][-60:],
                "data_dir": state["data_dir"],
                "input_snr": state["input_snr"],
            }

    def _send_html(self, html):
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def _send_raw_json(self, body_str):
        """发送已序列化好的 JSON 字符串（plotly to_json 输出）"""
        body = body_str.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass  # 静默 HTTP 请求日志

def list_packages():
    """[2026-09-22 新增] 扫描 DATA_ROOT 下所有含 metadata.json 的数据包目录，
    返回可展示的信息列表（包名/台站/事件日期/合成或实测/SNR入出/corr/时长）。
    兼容两种布局：
      data/<包名>/metadata.json            （上传脚本解包后的标准布局）
      data/<包名>/event_001/metadata.json  （旧 exp014 布局）
    """
    out = []
    _name_seen = {}  # [2026-09-22 统一包名] 去重用
    if not DATA_ROOT.exists():
        return {"ok": True, "packages": [], "current": "", "root": str(DATA_ROOT)}
    cur_dir = str(CURRENT_DATA_DIR)
    for d in sorted(DATA_ROOT.iterdir()):
        if not d.is_dir():
            continue
        # 定位 metadata.json：包根 或 event_001/ 子目录
        meta_file = d / "metadata.json"
        if not meta_file.exists():
            subs = sorted(d.glob("*/metadata.json"))
            if not subs:
                continue
            meta_file = subs[0]
        try:
            with open(meta_file, encoding="utf-8") as f:
                m = json.load(f)
        except Exception:
            continue
        # 目录识别：列表展示用的是"包根目录"，加载时也传包根目录
        pkg_dir = meta_file.parent if (meta_file.parent.name.startswith("event_") or
                                       meta_file.parent.name.lower().startswith("exp")) else d
        mc = m.get("metrics_common", {}) or {}
        snr_in_common = mc.get("snr_input_db")
        snr_out = mc.get("snr_output_db")
        corr = mc.get("correlation")
        # [2026-09-22 统一] 列表 SNR 入优先用目标 SNR（和目录名一致），无则回退公共
        _ctrl = m.get("input_snr_control", {}) or {}
        snr_in = _ctrl.get("target_snr_db")
        if snr_in is None:
            snr_in = snr_in_common
        # 事件日期：event_token（合成时间戳）或 event
        et = m.get("event_token") or ""
        if len(et) >= 15:
            ev = f"{et[0:4]}-{et[4:6]}-{et[6:8]} {et[9:11]}:{et[11:13]}"
        elif m.get("event"):
            ev = str(m.get("event"))
        else:
            ev = "—"
        # 合成 or 实测：有 input_snr_control/synthesis_note → 合成；否则实测
        has_syn = (("input_snr_control" in m) or ("synthesis_note" in m) or
                   ("synth" in str(m.get("config", {}))) or
                   ("合成嵌入噪声" in str(m.get("noise_modeling", {}).get("source", ""))) or
                   ("synthetic" in m.get("event", "").lower()) or
                   ("snr" in d.name.lower()))
        kind = "合成" if has_syn else "实测"
        fs = m.get("fs_hz", 6.625)
        n = m.get("n_samples", 0)
        duration_h = round(n / fs / 3600, 1) if (n and fs) else "—"
        stations = "/".join(m.get("stations", [])) or "—"
        # [2026-09-22 统一包名] 优先用 metadata 构造显示名（和本地一致），
        # 无 target_snr 则回退目录名；重复名追加日期后缀
        if snr_in is not None and snr_in != snr_in_common:
            _tgt_str = f"{float(snr_in):g}"
            _disp = f"exp014_full_pipeline_snr{_tgt_str}"
        else:
            _disp = d.name
        # 去重：同名包追加原目录名中的日期后缀（如 001-260918 → _260918）
        if _disp in _name_seen:
            _name_seen[_disp] += 1
            _date_suf = ""
            for _part in d.name.split("-"):
                if len(_part) == 6 and _part.isdigit():
                    _date_suf = _part
                    break
            _disp = _disp + (f"_{_date_suf}" if _date_suf else f"_v{_name_seen[_disp]}")
        else:
            _name_seen[_disp] = 1
        out.append({
            "name": _disp,
            "dir": str(pkg_dir),
            "stations": stations,
            "event_date": ev,
            "kind": kind,
            "snr_in": "-" if snr_in is None else f"{float(snr_in):.2f}",
            "snr_in_common": "-" if snr_in_common is None else f"{float(snr_in_common):.2f}",
            "snr_out": "-" if snr_out is None else f"{float(snr_out):.2f}",
            "corr": "-" if corr is None else f"{float(corr):.4f}",
            "duration_h": str(duration_h),
        })
    out.sort(key=lambda x: x["name"], reverse=True)
    return {"ok": True, "packages": out, "current": cur_dir,
            "root": str(DATA_ROOT)}


def _extract_dashboard_package(data_dir):
    """[2026-09-18 新增] 读取面板数据包：data_dir/dashboard_package.tar.gz。

    包由 run_pipeline_v3_learning.py 生成（单文件=全部面板展示数据）：
      all_intermediate_results.npz / metadata.json / v3_*.npz/.json → data_dir
      figs/*.png → RUN_DIR（图集目录，SimpleHTTPRequestHandler 服务）
    解包后交互图、顶栏指标、中间参数表、图集全部恢复显示。
    返回是否找到并解包。
    """
    cands = sorted(data_dir.glob("*_dashboard_package.tar.gz")) + [data_dir / "dashboard_package.tar.gz"]
    pkg = None
    for c in cands:
        if c.exists():
            pkg = c
            break
    if pkg is None:
        return False
    import tarfile
    RUN_DIR.mkdir(parents=True, exist_ok=True)
    n_png = 0
    n_other = 0
    with tarfile.open(pkg, "r:gz") as tf:
        for m in tf.getmembers():
            if not m.isfile():
                continue
            data = tf.extractfile(m).read()
            if m.name.startswith("figs/"):
                (RUN_DIR / Path(m.name).name).write_bytes(data)
                n_png += 1
            else:
                (data_dir / Path(m.name).name).write_bytes(data)
                n_other += 1
    print(f"  [数据包] 已从 {pkg.name} 解包恢复："
          f"{n_other} 个数据文件 + {n_png} 张图集 PNG")
    return True


def upload_cloud_thread():
    """[2026-09-18 上传云端] 后台线程：打包当前数据+图集上传云服务器。
    结果写入 state['last_upload'] / state['last_upload_error']。"""
    import upload_to_cloud
    with state_lock:
        state.pop("last_upload", None)
        state.pop("last_upload_error", None)
    try:
        pkg, _dir, url = upload_to_cloud.main(str(CURRENT_DATA_DIR))
        with state_lock:
            state["last_upload"] = {"package": pkg, "url": url}
    except Exception as e:
        with state_lock:
            state["last_upload_error"] = f"{type(e).__name__}: {e}"


def main():
    parser = argparse.ArgumentParser(description="学习版可视化监控面板服务器")
    parser.add_argument("--port", type=int, default=8765, help="端口号 (默认8765)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="绑定地址")
    parser.add_argument("--readonly", action="store_true",
                        help="只读展示模式（云端部署）：禁用运行按钮与 /api/run")
    parser.add_argument("--data-dir", type=str, default=None,
                        help="指定数据目录（含 npz+metadata，云端只读用）")
    args = parser.parse_args()
    global READONLY
    if args.readonly:
        READONLY = True
        print("  [只读展示模式] 云端部署：已禁用重跑管线能力")

    RUN_DIR.mkdir(parents=True, exist_ok=True)
    # 恢复上次使用的数据目录（若存在）：面板重启后仍显示上次 SNR 场景
    global CURRENT_DATA_DIR, CURRENT_META_FILE, state
    try:
        if LAST_DATA_FILE.exists():
            last = json.loads(LAST_DATA_FILE.read_text(encoding="utf-8-sig"))
            last_dir = Path(last.get("data_dir", ""))
            if last_dir and (last_dir / "all_intermediate_results.npz").exists():
                CURRENT_DATA_DIR = last_dir
                CURRENT_META_FILE = last_dir / "metadata.json"
                set_npz_path(CURRENT_DATA_DIR / "all_intermediate_results.npz")
                state["data_dir"] = str(CURRENT_DATA_DIR)   # 同步状态（/api/status 显示）
                print(f"  恢复上次数据目录: {CURRENT_DATA_DIR.parent.name}")
                _extract_dashboard_package(CURRENT_DATA_DIR)
    except Exception as e:
        print(f"  (恢复上次数据目录失败: {e})")
    # [2026-09-18 云端只读部署] --data-dir 显式指定时优先（覆盖恢复逻辑）
    if args.data_dir:
        dd = Path(args.data_dir)
        if (dd / "all_intermediate_results.npz").exists():
            CURRENT_DATA_DIR = dd
            CURRENT_META_FILE = dd / "metadata.json"
            set_npz_path(dd / "all_intermediate_results.npz")
            state["data_dir"] = str(dd)
            print(f"  使用指定数据目录: {dd}")
            _extract_dashboard_package(dd)
        else:
            print(f"  (警告: 指定数据目录缺少 all_intermediate_results.npz: {dd})")
    # ThreadingHTTPServer：多线程处理请求。
    # 单线程 HTTPServer 会被浏览器并发加载 14 张大图时某个挂起连接堵死
    # （表现为 /api/run 与所有请求超时、CloseWait 堆积）——必须多线程。
    server = ThreadingHTTPServer((args.host, args.port), DashboardHandler)
    url = f"http://{args.host}:{args.port}/"
    print("=" * 60)
    print("DC-GDCST + DT-FSBL 学习整合版 · 可视化监控面板")
    print(f"  面板地址: {url}")
    print(f"  管线脚本: {PIPELINE_SCRIPT.name}")
    print(f"  图片目录: {RUN_DIR}")
    print("  按 Ctrl+C 停止服务器")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.server_close()

if __name__ == "__main__":
    main()
