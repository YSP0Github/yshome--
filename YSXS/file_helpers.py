import os
import re
import uuid
import zipfile
from datetime import datetime

OLE_MAGIC = b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"
ZIP_MAGIC = b"PK\x03\x04"
MAX_SCAN_BYTES = 2 * 1024 * 1024
SCRIPT_SIGNATURES = (
    b"<script",
    b"javascript:",
    b"wscript",
    b"createobject",
    b"<?php",
    b"/javascript",
    b"/js ",
    b"/launch",
    b"/openaction",
)
SCRIPT_SIGNATURES = tuple(sig.lower() for sig in SCRIPT_SIGNATURES)
PDF_SUSPICIOUS_MARKERS = (b"/JS", b"/JavaScript", b"/AA", b"/OpenAction", b"/Launch")
MACRO_SIGNATURES = tuple(
    marker.lower()
    for marker in (b"AutoOpen", b"Auto_Open", b"VBA", b"vbaProject", b"Macros", b"vbe7")
)
EMBEDDED_EXEC_EXTS = (
    ".exe",
    ".dll",
    ".bat",
    ".cmd",
    ".vbs",
    ".js",
    ".wsf",
    ".ps1",
    ".sh",
    ".msi",
)

def secure_filename(filename):
    """保留中文、空格和常见符号，仅过滤危险字符"""
    if not filename:
        return "unknown_file"
    
    # 分离文件名和扩展名
    name, ext = os.path.splitext(filename)
    # 仅保留纯文件名，不保留路径
    name = os.path.basename(name)
    
    # 1. 移除路径分隔符（防止路径遍历攻击，核心安全措施）
    #   过滤 / \ : * ? " < > | 这些危险字符
    dangerous_chars = r'[\\/:\*?"<>|]'
    name = re.sub(dangerous_chars, '_', name)  # 危险字符替换为下划线
    ext = re.sub(dangerous_chars, '', ext)     # 扩展名里的危险字符直接删除
    
    # 2. 处理开头的点（避免隐藏文件）
    while name.startswith('.'):
        name = name[1:] or "file"  # 全是点的话，给个默认名
    
    # 3. 限制长度（避免过长文件名）
    max_length = 200
    if len(name) > max_length:
        name = name[:max_length]
    
    # 拼接文件名和扩展名
    return f"{name}{ext}" if ext else name


# 生成唯一文件名（原文件名 + 唯一标识）
def get_unique_filename(filename):
    clean_name = secure_filename(filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]  # 8位随机唯一ID
    name, ext = os.path.splitext(clean_name)
    return f"{name}_{timestamp}_{unique_id}{ext}"


def _read_sample(file_path: str, size: int = MAX_SCAN_BYTES) -> bytes:
    with open(file_path, "rb") as handle:
        return handle.read(size)


def _scan_zip_payload(file_path: str):
    try:
        with zipfile.ZipFile(file_path) as archive:
            for info in archive.infolist():
                name = info.filename.lower()
                if name.endswith("vbaproject.bin") or "macros/" in name:
                    return False, "检测到宏代码文件"
                if any(name.endswith(ext) for ext in EMBEDDED_EXEC_EXTS):
                    return False, f"压缩包包含可执行附件：{info.filename}"
    except zipfile.BadZipFile:
        return False, "文件压缩结构损坏，无法验证内容可靠性"
    return True, ""


def scan_file_for_threats(file_path: str, extension: str = "") -> tuple[bool, str]:
    """
    读取文件样本并进行简易恶意内容扫描。
    返回 (是否安全, 失败原因)。
    """
    ext = (extension or "").lower().lstrip(".")
    try:
        sample = _read_sample(file_path)
    except OSError as exc:
        return False, f"无法读取文件：{exc}"

    lowered = sample.lower()
    if any(signature in lowered for signature in SCRIPT_SIGNATURES):
        return False, "检测到疑似脚本代码片段"

    if ext in {"docx", "pptx"}:
        is_clean, reason = _scan_zip_payload(file_path)
        if not is_clean:
            return is_clean, reason

    if ext in {"doc", "ppt"}:
        if any(marker in lowered for marker in MACRO_SIGNATURES):
            return False, "检测到可能的宏代码片段"
        header = sample[: len(OLE_MAGIC)]
        if header != OLE_MAGIC:
            return False, "OLE 文件头异常，可能被篡改"

    if ext == "pdf":
        hit_count = sum(1 for marker in PDF_SUSPICIOUS_MARKERS if marker in sample)
        if hit_count >= 2:
            return False, "PDF 包含可执行动作（JS/OpenAction），已拒绝解析"

    return True, ""


if __name__ == "__main__":
    filename = "test/../test.txt"
    print(secure_filename(filename))
    print(get_unique_filename(filename))
