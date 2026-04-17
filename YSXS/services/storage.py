from __future__ import annotations

import shutil
from datetime import datetime
from io import BytesIO
from pathlib import Path

from flask import current_app
from flask_login import current_user

from ..models import Document
from ..utils.file_helpers import get_unique_filename, secure_filename


def upload_root() -> Path:
    return Path(current_app.config['UPLOAD_FOLDER']).resolve()


def ensure_user_storage(user_id: int) -> Path:
    root = upload_root()
    folder = root / str(user_id)
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def save_user_file(file_storage, user_id: int) -> dict:
    original_name = secure_filename(file_storage.filename)
    user_folder = ensure_user_storage(user_id)
    unique_name = get_unique_filename(original_name)
    target_path = user_folder / unique_name
    file_storage.save(target_path)
    relative_path = target_path.relative_to(upload_root())
    return {
        'display_name': original_name,
        'relative_path': str(relative_path).replace('\\', '/'),
        'absolute_path': target_path,
        'size': target_path.stat().st_size,
        'extension': target_path.suffix.lstrip('.').lower()
    }


def reset_filestorage_stream(file_storage) -> None:
    stream = getattr(file_storage, "stream", None)
    if stream is None:
        return
    if stream.seekable():
        stream.seek(0)
        return
    data = stream.read()
    file_storage.stream = BytesIO(data)


def resolve_document_path(stored_path: str) -> Path:
    if not stored_path:
        raise ValueError("stored_path is empty")

    root = upload_root()
    raw_path = Path(str(stored_path).strip())

    if raw_path.is_absolute():
        return raw_path

    parts = [part for part in raw_path.parts if part not in {'.', ''}]
    if parts:
        head = parts[0].lower()
        root_name = root.name.lower()
        if head in {root_name, 'uploads'}:
            parts = parts[1:]

    normalized = root.joinpath(*parts) if parts else root
    return normalized.resolve()


def remove_document_file(stored_path: str) -> None:
    if not stored_path:
        return

    root = upload_root()
    candidates = []
    try:
        candidates.append(resolve_document_path(stored_path))
    except Exception:
        current_app.logger.exception("解析文献文件路径失败: %s", stored_path)

    raw_path = Path(stored_path)
    if raw_path.is_absolute():
        candidates.append(raw_path)
    else:
        candidates.append((root / raw_path).resolve())

    seen = set()
    try:
        for candidate in candidates:
            if not candidate:
                continue
            try:
                resolved = candidate.resolve()
            except FileNotFoundError:
                resolved = candidate

            key = str(resolved)
            if key in seen:
                continue
            seen.add(key)

            if resolved.exists():
                resolved.unlink()
                _cleanup_empty_dirs(resolved.parent, root)
                return
        current_app.logger.warning("尝试删除附件但未找到对应文件: %s", stored_path)
    except Exception:
        current_app.logger.exception("删除附件失败: %s", stored_path)


def _cleanup_empty_dirs(start: Path, boundary: Path) -> None:
    try:
        boundary = boundary.resolve()
    except FileNotFoundError:
        return

    current = start
    while True:
        try:
            current = current.resolve()
        except FileNotFoundError:
            return

        if current == boundary or boundary not in current.parents:
            break

        try:
            current.rmdir()
        except OSError:
            break
        current = current.parent


def enqueue_kindle_delivery(doc: Document, requester_id: int) -> Path:
    if not doc.file_path:
        raise ValueError("当前文献没有关联文件")

    source = resolve_document_path(doc.file_path)
    if not source.exists():
        raise FileNotFoundError("文献文件不存在或已被删除")

    queue_dir = ensure_user_storage(requester_id) / 'kindle_queue'
    queue_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    target_name = f"{doc.id}_{timestamp}_{source.name}"
    target = queue_dir / target_name
    shutil.copy2(source, target)
    return target
