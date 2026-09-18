# -*- coding: utf-8 -*-
"""
upload_to_cloud.py（2026-09-18 新增）
=====================================================================
本地"上传云端"动作的实现脚本（由 dashboard_server.py 的 /api/upload 调用，
也可单独命令行运行：python upload_to_cloud.py [data_dir]）。

【功能】
  1. 把当前实验数据目录（all_intermediate_results.npz + metadata.json）
     与图集目录（runs/v3_learning_20260917 下全部 PNG）打成一个 tar.gz；
  2. 包名按"序号-日期"编号：{序号:03d}-{YYMMDD}，如 001-260918。
     序号按当天上传批次递增（当天第 1 次=001、第 2 次=002...），
     跨天从 001 重新开始；计数记录在 runs/upload/upload_log.json；
  3. scp 上传到云服务器 ~/dcgdcst_viewer/uploads/；
  4. ssh 执行远端脚本 upload_to_cloud_server.sh：
      解包 → npz+metadata 放到 ~/dcgdcst_viewer/data/<包名>/
            PNG 放到 ~/dcgdcst_viewer/runs/v3_learning_20260917/（面板图集目录）
      更新 last_data_dir.json（面板启动时自动恢复该数据目录）
      重启面板（systemd 自动拉起或 nohup 兜底）

【编号逻辑（用户 2026-09-18 确认）】
  - 从 001 开始，格式 {序号:03d}-{YYMMDD}
  - 同一天多次上传递增序号（001-260918、002-260918...）
  - 跨天重置回 001（日期不同不会冲突）
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tarfile
from datetime import datetime
from pathlib import Path

# =====================================================================
# 路径配置
# =====================================================================
CODE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = CODE_DIR.parent                     # 18_DC-GDCST+DT-FSBL
RUN_DIR = PROJECT_DIR / "runs" / "v3_learning_20260917"   # 面板图集目录（PNG）
UPLOAD_DIR = PROJECT_DIR / "runs" / "upload"              # 本地打包暂存（已被 gitignore）
LOG_FILE = UPLOAD_DIR / "upload_log.json"                 # 上传计数记录

SSH_HOST = "YSZJ"                                   # 云服务器 ssh 别名
REMOTE_UPLOAD_DIR = "/home/YSP/dcgdcst_viewer/uploads"   # 服务器上传暂存目录（绝对路径，Windows OpenSSH scp 不展开 ~）
REMOTE_APPLY_SCRIPT = "~/dcgdcst_viewer/upload_to_cloud_server.sh"  # 远端解包脚本
PUBLIC_URL = "https://yshome.top/dcgdcst/"          # 面板公网地址


def gen_pkg_name() -> str:
    """按 序号-日期 计算包名（同日递增、跨天重置 001）；只计算不写盘。"""
    log: dict = {}
    if LOG_FILE.exists():
        try:
            log = json.loads(LOG_FILE.read_text(encoding="utf-8"))
        except Exception:
            log = {}
    today = datetime.now().strftime("%y%m%d")       # 260918
    if log.get("date") != today:
        count = 0
    else:
        count = int(log.get("count", 0))
    return f"{count + 1:03d}-{today}"


def commit_pkg_name(pkg: str) -> None:
    """上传成功后记录编号（失败不占用序号，重试仍是同号）。"""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    log: dict = {}
    if LOG_FILE.exists():
        try:
            log = json.loads(LOG_FILE.read_text(encoding="utf-8"))
        except Exception:
            log = {}
    today = pkg.split("-")[-1]
    log = {"date": today, "count": int(pkg.split("-")[0])}
    LOG_FILE.write_text(json.dumps(log, ensure_ascii=False, indent=2),
                        encoding="utf-8")


def build_package(data_dir: Path, pkg: str) -> Path:
    """把数据（npz+metadata）与图集 PNG 打成 tar.gz，返回本地包路径。"""
    tar_path = UPLOAD_DIR / f"{pkg}.tar.gz"
    npz = data_dir / "all_intermediate_results.npz"
    meta = data_dir / "metadata.json"
    missing = [p for p in (npz, meta) if not p.exists()]
    if missing:
        raise FileNotFoundError(f"数据目录缺少文件: {[str(m) for m in missing]}")
    pngs = sorted(RUN_DIR.glob("*.png"))
    if not pngs:
        raise FileNotFoundError(f"图集目录无 PNG: {RUN_DIR}")
    with tarfile.open(tar_path, "w:gz") as tf:
        tf.add(npz, arcname="all_intermediate_results.npz")
        tf.add(meta, arcname="metadata.json")
        for png in pngs:
            tf.add(png, arcname=png.name)
    return tar_path


def main(data_dir_str: str | None = None) -> tuple[str, str, str]:
    """执行完整上传流程，返回 (包名, 服务器数据目录, 公网URL)。"""
    data_dir = Path(data_dir_str) if data_dir_str else None
    if data_dir is None:
        # 未指定时读取面板上次数据目录记录
        last = RUN_DIR / "last_data_dir.json"
        if last.exists():
            data_dir = Path(json.loads(
                last.read_text(encoding="utf-8-sig")).get("data_dir", ""))
        if data_dir is None or not data_dir.exists():
            raise RuntimeError("无法确定数据目录，请通过面板按钮或传入路径")
    if not (data_dir / "all_intermediate_results.npz").exists():
        raise RuntimeError(f"数据目录缺少 npz: {data_dir}")

    # [2026-09-18] 优先使用管线生成的编号数据包（文件名即编号，单文件=全部展示数据）
    _cands = sorted(data_dir.glob("*_dashboard_package.tar.gz")) + [data_dir / "dashboard_package.tar.gz"]
    dash_pkg = next((c for c in _cands if c.exists()), None)
    if dash_pkg is not None and dash_pkg.name.startswith("0") and "_dashboard_package" in dash_pkg.name:
        pkg = dash_pkg.name.split("_dashboard_package")[0]   # 沿用管线编号 001-260918
    else:
        pkg = gen_pkg_name()            # 失败不占用编号，成功后 commit
    print(f"[1/4] 准备数据包 {pkg} ...")
    if dash_pkg is not None:
        tar_path = UPLOAD_DIR / f"{pkg}.tar.gz"
        shutil.copy2(dash_pkg, tar_path)
        print(f"      使用管线编号数据包（原样复制 {dash_pkg.stat().st_size / 1e6:.1f} MB）")
    else:
        tar_path = build_package(data_dir, pkg)
    print(f"      本地包: {tar_path} ({tar_path.stat().st_size / 1e6:.1f} MB)")

    print(f"[2/4] 确保远端目录存在 + scp 上传 ...")
    subprocess.run(["ssh", SSH_HOST, f"mkdir -p {REMOTE_UPLOAD_DIR}"],
                   check=True, timeout=60)
    subprocess.run(["scp", str(tar_path),
                    f"{SSH_HOST}:{REMOTE_UPLOAD_DIR}/"], check=True)

    print(f"[3/4] 服务器解包 + 切换数据目录 + 重启面板 ...")
    r = subprocess.run(["ssh", SSH_HOST,
                        f"bash {REMOTE_APPLY_SCRIPT} {pkg}"],
                       capture_output=True, text=True, timeout=180)
    if r.returncode != 0:
        raise RuntimeError(f"服务器端执行失败: {r.stderr[-800:]}")
    out = r.stdout.strip()
    print(f"      服务器返回: {out}")

    print(f"[4/4] 完成")
    commit_pkg_name(pkg)            # 全部成功后占用编号
    return pkg, f"/home/YSP/dcgdcst_viewer/data/{pkg}", PUBLIC_URL


if __name__ == "__main__":
    pkg, _dir, url = main(sys.argv[1] if len(sys.argv) > 1 else None)
    print(f"包名: {pkg}\n面板: {url}")
