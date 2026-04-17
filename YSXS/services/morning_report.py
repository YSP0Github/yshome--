from __future__ import annotations

import json
import logging
import math
import os
import re
import threading
import time
import tomllib
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from html import escape, unescape
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo

import requests
from flask import Flask, current_app, has_app_context
from sqlalchemy import func

from ..extensions import db
from ..models import (
    AIUsageLog,
    DEFAULT_MORNING_REPORT_KEYWORDS,
    Document,
    MorningReportPaper,
    MorningReportRun,
    MorningReportSettings,
)
from ..utils.datetimes import utc_now

OPENALEX_WORKS_URL = "https://api.openalex.org/works"
CROSSREF_WORKS_URL = "https://api.crossref.org/works"
ARXIV_API_URL = "https://export.arxiv.org/api/query"
NASA_ADS_SEARCH_URL = "https://api.adsabs.harvard.edu/v1/search/query"
CN_TZ = ZoneInfo("Asia/Shanghai")
SUPPORTED_SOURCES = {
    "openalex": "OpenAlex",
    "crossref": "Crossref",
    "arxiv": "arXiv",
    "ads": "NASA ADS",
}
DISPLAY_ONLY_SOURCE_REGISTRY = {
    "geojournals": {
        "label": "中国地学期刊网",
        "description": "中文地学期刊聚合入口，可快速跳转大量地学核心期刊官网。",
        "homepage": "https://www.geojournals.cn/",
    },
    "wos": {
        "label": "Web of Science",
        "description": "高质量英文检索入口，适合复查高影响力论文与被引情况。",
        "homepage": "https://www.webofscience.com/wos/woscc/basic-search",
    },
    "agu": {
        "label": "AGU",
        "description": "地球物理与行星科学重点增强源，特别适合你的研究方向。",
        "homepage": "https://agupubs.onlinelibrary.wiley.com/",
        "query_url": "https://agupubs.onlinelibrary.wiley.com/action/doSearch?AllField={query}",
    },
    "sciencedirect": {
        "label": "ScienceDirect",
        "description": "Elsevier 期刊平台，适合补充全文与正式期刊版本。",
        "homepage": "https://www.sciencedirect.com/",
        "query_url": "https://www.sciencedirect.com/search?qs={query}",
        "doi_url": "https://doi.org/{doi}",
    },
    "springer": {
        "label": "SpringerLink",
        "description": "综合学科英文期刊增强源，适合补充检索。",
        "homepage": "https://link.springer.com/",
        "query_url": "https://link.springer.com/search?query={query}",
        "doi_url": "https://doi.org/{doi}",
    },
    "wiley": {
        "label": "Wiley",
        "description": "与 AGU 等资源关联较强，适合英文期刊复查。",
        "homepage": "https://onlinelibrary.wiley.com/",
        "query_url": "https://onlinelibrary.wiley.com/action/doSearch?AllField={query}",
        "doi_url": "https://doi.org/{doi}",
    },
    "cnki": {
        "label": "CNKI",
        "description": "中文论文、综述、学位论文的重要增强源。",
        "homepage": "https://kns.cnki.net/kns8s/defaultresult/index",
        "query_url": "https://kns.cnki.net/kns8s/defaultresult/index?kw={query}",
        "doi_url": "https://kns.cnki.net/kcms2/article/abstract?v=&uniplatform=NZKPT&language=CHS&doi={doi}",
    },
    "wanfang": {
        "label": "万方",
        "description": "中文论文与学位论文补充源，适合中文结果增强检索。",
        "homepage": "https://www.wanfangdata.com.cn/",
        "query_url": "https://s.wanfangdata.com.cn/paper?q={query}",
    },
    "cqvip": {
        "label": "维普",
        "description": "中文期刊补充入口，适合补查地学与高校学报类论文。",
        "homepage": "https://www.cqvip.com/",
    },
    "geophy_cn": {
        "label": "地球物理学报",
        "description": "中文地球物理核心期刊，适合月震、深部结构、反演等方向增强复查。",
        "homepage": "http://www.geophy.cn/",
    },
    "earth_science": {
        "label": "地球科学",
        "description": "中国地质大学主办的重要中文地学期刊，适合综合地学与地球内部结构方向补充。",
        "homepage": "https://qks.cug.edu.cn/",
    },
    "adearth": {
        "label": "地球科学进展",
        "description": "适合补查综述、年度进展与研究动态类文章。",
        "homepage": "https://www.adearth.ac.cn/",
    },
    "geophy_progress": {
        "label": "地球物理学进展",
        "description": "适合补查方法、观测处理与地球物理技术进展类中文论文。",
        "homepage": "https://manu32.magtech.com.cn/Jwk_geophy/CN/volumn/home.shtml",
    },
    "earth_frontiers_cn": {
        "label": "地学前缘",
        "description": "中文高水平地学期刊，适合专题综述、前沿方向与交叉研究增强检索。",
        "homepage": "https://www.earthsciencefrontiers.net.cn/",
    },
    "china_science_earth_cn": {
        "label": "中国科学：地球科学",
        "description": "综合性高水平中文地球科学期刊，适合补查综述与高质量专题论文。",
        "homepage": "https://www.sciengine.com/SSTe/home",
    },
    "dzxb_cn": {
        "label": "地震学报",
        "description": "地震学中文核心期刊，适合补查震相识别、地震活动与震源研究。",
        "homepage": "http://www.dzxb.org/",
    },
    "dzdz_cn": {
        "label": "地震地质",
        "description": "适合补查构造、断层活动、震源区与区域地震地质研究。",
        "homepage": "http://www.dzdz.ac.cn/",
    },
    "dzkjtb_cn": {
        "label": "地质科技通报",
        "description": "适合补查地学应用研究、方法类论文与高校地学成果。",
        "homepage": "https://dzkjtb.cug.edu.cn/",
    },
    "gsw": {
        "label": "GeoScienceWorld",
        "description": "地学专题高价值增强源，适合地球物理与地质方向。",
        "homepage": "https://pubs.geoscienceworld.org/",
        "query_url": "https://pubs.geoscienceworld.org/search-results?page=1&q={query}",
        "doi_url": "https://doi.org/{doi}",
    },
    "frontiers": {
        "label": "Frontiers",
        "description": "开放获取较友好，适合作为增强检索与补充阅读入口。",
        "homepage": "https://www.frontiersin.org/",
        "query_url": "https://www.frontiersin.org/search?query={query}",
        "doi_url": "https://doi.org/{doi}",
    },
}
DISPLAY_ONLY_SOURCE_ORDER = [
    "geojournals",
    "wos",
    "agu",
    "cnki",
    "wanfang",
    "cqvip",
    "geophy_cn",
    "earth_science",
    "adearth",
    "geophy_progress",
    "earth_frontiers_cn",
    "china_science_earth_cn",
    "dzxb_cn",
    "dzdz_cn",
    "dzkjtb_cn",
    "sciencedirect",
    "springer",
    "wiley",
    "gsw",
    "frontiers",
]
DISPLAY_SOURCE_TRACK_PRIORITY = {
    "moonquake": (
        "geophy_cn",
        "dzxb_cn",
        "geophy_progress",
        "agu",
        "gsw",
        "china_science_earth_cn",
        "earth_frontiers_cn",
        "cnki",
        "wanfang",
        "cqvip",
        "geojournals",
    ),
    "lunar_interior": (
        "geophy_cn",
        "earth_science",
        "china_science_earth_cn",
        "earth_frontiers_cn",
        "adearth",
        "geophy_progress",
        "agu",
        "gsw",
        "cnki",
        "wanfang",
        "cqvip",
        "geojournals",
    ),
    "apollo_reprocessing": (
        "geophy_cn",
        "geophy_progress",
        "agu",
        "gsw",
        "adearth",
        "china_science_earth_cn",
        "earth_frontiers_cn",
        "cnki",
        "wanfang",
        "cqvip",
        "geojournals",
    ),
}
RESEARCH_TRACK_LABELS = {
    "moonquake": "月震",
    "lunar_interior": "月球内部结构",
    "apollo_reprocessing": "阿波罗数据再处理",
    "off_topic": "离题",
}


def infer_display_source_track(query_text: str | None) -> str | None:
    text = str(query_text or "").strip()
    if not text:
        return None

    fallback_result = classify_candidate_track({"title": text})
    label = fallback_result.get("label")
    if label in DISPLAY_SOURCE_TRACK_PRIORITY:
        return str(label)

    title_haystack = build_title_haystack({"title": text})
    lightweight_terms = {
        "moonquake": ("moonquake", "lunar seismic", "月震", "震相", "地震波", "深源月震", "浅源月震"),
        "lunar_interior": ("lunar interior", "moon interior", "内部结构", "深部结构", "月幔", "月核", "壳幔"),
        "apollo_reprocessing": ("apollo", "阿波罗", "再处理", "重处理", "再分析", "重分析", "legacy data"),
    }
    for track, terms in lightweight_terms.items():
        if any(haystack_matches_term(title_haystack, term) for term in terms):
            return track
    return None


def _ordered_display_source_keys(query_text: str | None = None) -> list[str]:
    track = infer_display_source_track(query_text)
    if not track:
        return list(DISPLAY_ONLY_SOURCE_ORDER)

    priority_keys = [key for key in DISPLAY_SOURCE_TRACK_PRIORITY.get(track, ()) if key in DISPLAY_ONLY_SOURCE_REGISTRY]
    merged: list[str] = []
    seen: set[str] = set()
    for key in [*priority_keys, *DISPLAY_ONLY_SOURCE_ORDER]:
        if key in seen or key not in DISPLAY_ONLY_SOURCE_REGISTRY:
            continue
        seen.add(key)
        merged.append(key)
    return merged


def get_display_only_sources(query_text: str | None = None) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    prioritized_track = infer_display_source_track(query_text)
    for key in _ordered_display_source_keys(query_text):
        meta = DISPLAY_ONLY_SOURCE_REGISTRY.get(key)
        if not meta:
            continue
        items.append({
            'key': key,
            'label': str(meta.get('label') or key),
            'description': str(meta.get('description') or '').strip(),
            'homepage': str(meta.get('homepage') or '').strip(),
            'priority_track': prioritized_track or '',
        })
    return items


def build_display_source_links(
    title: str | None,
    doi: str | None = None,
    *,
    limit: int = 5,
    query_text: str | None = None,
) -> list[dict[str, str]]:
    query = str(title or '').strip()
    normalized_doi = normalize_doi(str(doi or '').strip())
    links: list[dict[str, str]] = []
    prioritized_track = infer_display_source_track(query_text or query)
    for key in _ordered_display_source_keys(query_text or query):
        meta = DISPLAY_ONLY_SOURCE_REGISTRY.get(key)
        if not meta:
            continue
        url = ''
        if normalized_doi and meta.get('doi_url'):
            url = str(meta.get('doi_url')).format(doi=quote_plus(normalized_doi))
        elif query and meta.get('query_url'):
            url = str(meta.get('query_url')).format(query=quote_plus(query))
        else:
            url = str(meta.get('homepage') or '').strip()
        if not url:
            continue
        links.append({
            'key': key,
            'label': str(meta.get('label') or key),
            'url': url,
            'priority_track': prioritized_track or '',
        })
        if limit and len(links) >= limit:
            break
    return links
SOURCE_QUERY_CONTEXT_TOKENS = {
    "lunar",
    "moon",
    "月球",
    "月面",
}
STRICT_CONTEXT_TERMS = {
    "lunar",
    "moon",
    "apollo",
    "planetary",
    "mars",
    "martian",
    "moonquake",
    "月",
    "月球",
    "月震",
    "行星",
}
GENERIC_RESEARCH_TOKENS = {
    "study",
    "studies",
    "research",
    "analysis",
    "deep",
    "interior",
    "structure",
    "structures",
    "data",
    "processing",
    "reprocessing",
    "signal",
    "signals",
    "method",
    "methods",
    "recent",
    "latest",
    "new",
    "geophysics",
    "geophysical",
}
DEFAULT_STRICT_BLOCKLIST = {
    "governance",
    "management",
    "poetry",
    "literature",
    "finance",
    "marketing",
    "tourism",
    "nursing",
    "education",
    "hospital",
    "cultural",
    "public management",
    "travel",
    "music",
    "musical",
    "art",
    "alchemy",
    "hexachord",
    "discourse",
    "discourses",
    "landing",
}
DEFAULT_STRICT_SUSPECT_TERMS = {
    "forecast",
    "forecasts",
    "eclipse",
    "eclipses",
    "conjunction",
    "conjunctions",
    "atmosphere",
    "winds",
    "currents",
    "rain",
    "divine",
    "frontmatter",
    "chapter",
    "how to",
    "curiosities",
    "ciphers",
    "sundry",
    "field theory",
    "microseism",
    "tide",
    "global tide",
}
STRICT_DOMAIN_PATTERNS = (
    r"seism",
    r"quake",
    r"interior",
    r"mantle",
    r"core",
    r"oscillat",
    r"geophys",
    r"azimuth",
    r"incidence angle",
    r"back azimuth",
    r"seismometer",
    r"月震",
    r"震",
    r"内部结构",
    r"深部",
    r"地震",
    r"震源",
)
AI_SCREENING_ALLOWED_LABELS = {"moonquake", "lunar_interior", "apollo_reprocessing"}
AI_RUNTIME_CONFIG_FILENAME = "ai_runtime_config.json"
SEARCH_QUERY_STOPWORDS_EN = {
    "about", "recent", "latest", "papers", "paper", "research", "study", "studies",
    "article", "articles", "literature", "journal", "journals", "find", "search",
    "related", "relevant", "high", "quality", "best", "with", "from", "that",
    "this", "these", "those", "using", "based", "into", "over", "under",
}
SEARCH_QUERY_STOPWORDS_ZH = {
    "关于", "相关", "最新", "最近", "文献", "论文", "研究", "请帮我", "帮我", "搜集",
    "检索", "搜索", "高质量", "高相关", "综合", "考虑", "根据", "以及", "还有", "方向",
}
TRACK_RULE_TERMS = {
    "moonquake": (
        "moonquake", "deep moonquake", "shallow moonquake", "lunar seismic", "lunar seismology",
        "lunar seismometer", "seismic event", "apollo passive seismic", "月震", "浅源月震",
        "深源月震", "月震事件", "月球地震", "震源", "震相", "地震波", "地震记录",
    ),
    "lunar_interior": (
        "lunar interior", "moon interior", "lunar internal structure", "internal structure",
        "crustal thickness", "lunar crust", "lunar mantle", "lunar core", "deep structure",
        "interior structure", "月球内部", "月球内部结构", "内部结构", "深部结构", "月壳",
        "月幔", "月核", "壳幔", "地幔", "地核",
    ),
    "apollo_reprocessing": (
        "apollo", "apollo seismic", "apollo passive seismic", "legacy data", "archive data",
        "reprocess", "reprocessing", "re-processed", "reanalysis", "re-analyze", "revisit",
        "阿波罗", "阿波罗地震", "阿波罗计划", "旧数据", "历史数据", "再处理", "重处理",
        "重分析", "重新处理", "再分析",
    ),
}
LUNAR_CORE_TERMS = (
    "lunar", "moon", "moonquake", "apollo", "月球", "月震", "阿波罗",
)

def _get_positive_int_env(name: str, default: int) -> int:
    try:
        value = int(str(os.environ.get(name, default)).strip())
    except (TypeError, ValueError):
        return default
    return value if value > 0 else default


TARGET_PAPER_FLOOR = 10
SMART_SEARCH_CONNECT_TIMEOUT = _get_positive_int_env('YSXS_SMART_SEARCH_CONNECT_TIMEOUT', 4)
SMART_SEARCH_SOURCE_READ_TIMEOUT = _get_positive_int_env('YSXS_SMART_SEARCH_SOURCE_READ_TIMEOUT', 8)
SMART_SEARCH_AI_TIMEOUT = _get_positive_int_env('YSXS_SMART_SEARCH_AI_TIMEOUT', 12)
SMART_SEARCH_QUERY_REFINE_TIMEOUT = _get_positive_int_env('YSXS_SMART_SEARCH_QUERY_REFINE_TIMEOUT', 8)
SMART_SEARCH_PER_SOURCE_CAP = _get_positive_int_env('YSXS_SMART_SEARCH_PER_SOURCE_CAP', 18)
SMART_SEARCH_RERANK_LIMIT = _get_positive_int_env('YSXS_SMART_SEARCH_RERANK_LIMIT', 6)
SMART_SEARCH_ABSTRACT_SNIPPET_LIMIT = _get_positive_int_env('YSXS_SMART_SEARCH_ABSTRACT_SNIPPET_LIMIT', 600)
SMART_SEARCH_ENABLE_AI_RERANK = str(os.environ.get('YSXS_SMART_SEARCH_ENABLE_AI_RERANK', 'true')).strip().lower() not in {
    '0', 'false', 'no', 'off',
}
PRIORITY_JOURNAL_TERMS = (
    "icarus",
    "journal of geophysical research",
    "jgr planets",
    "geophysical research letters",
    "earth and planetary science letters",
    "planetary and space science",
    "science china earth sciences",
    "earth science",
    "chinese journal of geophysics",
    "地球物理学报",
    "地球科学",
    "中国科学: 地球科学",
    "中国科学：地球科学",
    "地球物理学进展",
)

_scheduler_lock = threading.Lock()
_scheduler_started = False
_on_demand_generation_lock = threading.Lock()
_on_demand_generation_users: set[int] = set()


def _get_logger() -> logging.Logger:
    if has_app_context():
        return current_app.logger
    return logging.getLogger(__name__)


def _smart_search_timeout(read_timeout: int | None = None) -> tuple[int, int]:
    effective_read_timeout = max(int(read_timeout or SMART_SEARCH_SOURCE_READ_TIMEOUT), 1)
    return (SMART_SEARCH_CONNECT_TIMEOUT, effective_read_timeout)


def _runtime_ai_config_path() -> Path | None:
    if not has_app_context():
        return None
    instance_path = Path(current_app.instance_path)
    instance_path.mkdir(parents=True, exist_ok=True)
    return instance_path / AI_RUNTIME_CONFIG_FILENAME


def load_runtime_ai_config() -> dict[str, str]:
    path = _runtime_ai_config_path()
    if not path or not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        _get_logger().warning("AI 配置文件读取失败，已忽略。")
        return {}
    if not isinstance(payload, dict):
        return {}
    allowed_keys = {
        'base_url',
        'model',
        'wire_api',
        'api_key',
        'nasa_ads_api_token',
        'notes',
    }
    return {
        str(key): str(value).strip()
        for key, value in payload.items()
        if key in allowed_keys and str(value).strip()
    }


def save_runtime_ai_config(config: dict[str, str]) -> None:
    path = _runtime_ai_config_path()
    if not path:
        raise RuntimeError("当前上下文不可写入 AI 配置。")
    cleaned = {
        str(key): str(value).strip()
        for key, value in (config or {}).items()
        if str(key).strip() in {'base_url', 'model', 'wire_api', 'api_key', 'nasa_ads_api_token', 'notes'}
        and str(value).strip()
    }
    path.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding='utf-8')


def cn_now() -> datetime:
    return datetime.now(CN_TZ)


def today_cn_date() -> str:
    return cn_now().date().isoformat()


def ensure_morning_report_settings(user_id: int, *, commit: bool = True) -> MorningReportSettings:
    settings = MorningReportSettings.query.filter_by(user_id=user_id).first()
    if settings:
        return settings

    settings = MorningReportSettings(
        user_id=user_id,
        enabled=True,
        keywords_text="\n".join(DEFAULT_MORNING_REPORT_KEYWORDS),
        enabled_sources_text="openalex,crossref,arxiv",
        paper_pool_size=12,
        lookback_days=30,
        auto_run_enabled=True,
        auto_run_hour=8,
        popup_enabled=True,
    )
    db.session.add(settings)
    if commit:
        db.session.commit()
    else:
        db.session.flush()
    return settings


def ensure_due_morning_report_for_user(user_id: int) -> MorningReportRun | None:
    settings = ensure_morning_report_settings(user_id)
    if not settings.enabled or not settings.auto_run_enabled:
        return MorningReportRun.query.filter_by(user_id=user_id, report_date=today_cn_date()).first()

    if cn_now().hour < int(settings.auto_run_hour or 8):
        return MorningReportRun.query.filter_by(user_id=user_id, report_date=today_cn_date()).first()

    run = MorningReportRun.query.filter_by(user_id=user_id, report_date=today_cn_date()).first()
    if run and run.status == 'ready' and run.paper_count > 0:
        return run
    if run and run.status == 'failed' and run.updated_at and (utc_now() - run.updated_at) < timedelta(minutes=30):
        return run
    return generate_morning_report_for_user(user_id, trigger_source='auto', force=True)


def trigger_due_morning_report_in_background(app: Flask, user_id: int) -> bool:
    with _on_demand_generation_lock:
        if user_id in _on_demand_generation_users:
            return False
        _on_demand_generation_users.add(user_id)

    thread = threading.Thread(
        target=_background_due_report_worker,
        args=(app, user_id),
        name=f"ysxs-morning-report-user-{user_id}",
        daemon=True,
    )
    thread.start()
    return True


def _background_due_report_worker(app: Flask, user_id: int) -> None:
    try:
        with app.app_context():
            ensure_due_morning_report_for_user(user_id)
    except Exception as exc:
        app.logger.warning("后台异步检查今日晨报失败(user=%s): %s", user_id, exc)
    finally:
        with _on_demand_generation_lock:
            _on_demand_generation_users.discard(user_id)


def get_today_morning_report(user_id: int) -> MorningReportRun | None:
    return MorningReportRun.query.filter_by(user_id=user_id, report_date=today_cn_date()).first()


def is_morning_report_generation_running(user_id: int) -> bool:
    run = get_today_morning_report(user_id)
    if run and run.status == 'running':
        return True
    with _on_demand_generation_lock:
        return user_id in _on_demand_generation_users


def get_recent_morning_reports(user_id: int, *, limit: int = 7) -> list[MorningReportRun]:
    return (
        MorningReportRun.query
        .filter_by(user_id=user_id)
        .order_by(MorningReportRun.report_date.desc(), MorningReportRun.updated_at.desc())
        .limit(max(limit, 1))
        .all()
    )


def generate_morning_report_for_user(
    user_id: int,
    *,
    trigger_source: str = 'manual',
    force: bool = False,
) -> MorningReportRun:
    settings = ensure_morning_report_settings(user_id)
    report_date = today_cn_date()
    run = MorningReportRun.query.filter_by(user_id=user_id, report_date=report_date).first()
    if run and run.status == 'ready' and run.paper_count > 0 and not force:
        return run

    if run is None:
        run = MorningReportRun(user_id=user_id, report_date=report_date)
        db.session.add(run)
        db.session.flush()

    settings.last_error = None
    settings.last_run_started_at = utc_now()
    run.status = 'running'
    run.trigger_source = trigger_source
    run.keywords_snapshot = "\n".join(settings.keyword_list())
    run.paper_pool_size = max(1, min(int(settings.paper_pool_size or 12), 30))
    run.last_error = None
    run.generated_at = utc_now()
    db.session.commit()

    try:
        discovered = discover_papers(settings)
        document_lookup = build_user_document_lookup(user_id)
        run = MorningReportRun.query.filter_by(id=run.id).first()
        if run is None:
            raise RuntimeError("晨报记录在生成过程中丢失")

        MorningReportPaper.query.filter_by(run_id=run.id).delete(synchronize_session=False)
        headline_parts = [item['title'] for item in discovered[:3]]
        run.headline = "；".join(headline_parts)[:255] if headline_parts else "今日晨报已更新"
        run.paper_count = len(discovered)
        run.status = 'ready'
        run.last_error = None
        run.generated_at = utc_now()

        for index, item in enumerate(discovered, start=1):
            existing_doc = find_existing_document_for_user(
                user_id,
                doi=item.get('doi'),
                title=item.get('title'),
                year=_safe_int(item.get('year')),
                document_lookup=document_lookup,
            )
            paper = MorningReportPaper(
                run_id=run.id,
                user_id=user_id,
                rank=index,
                source=item.get('source') or 'openalex',
                source_key=str(item.get('source_key') or item.get('doi') or item.get('title') or index),
                title=item.get('title') or 'Untitled',
                authors="; ".join(item.get('authors') or []),
                journal=item.get('journal'),
                year=_safe_int(item.get('year')),
                published_at=item.get('published_at'),
                doi=item.get('doi'),
                url=item.get('url'),
                pdf_url=item.get('pdf_url'),
                abstract=item.get('abstract'),
                keywords_matched="; ".join(item.get('matched_keywords') or []),
                topics_json=json.dumps(item.get('topics') or [], ensure_ascii=False),
                relevance_score=float(item.get('relevance_score') or 0.0),
                citation_count=int(item.get('citation_count') or 0),
                imported_document_id=existing_doc.id if existing_doc else None,
                imported_at=utc_now() if existing_doc else None,
                raw_json=json.dumps(item.get('raw_json') or {}, ensure_ascii=False),
            )
            db.session.add(paper)

        settings.last_run_finished_at = utc_now()
        settings.last_error = None
        db.session.commit()
        return run
    except Exception as exc:
        db.session.rollback()
        _get_logger().exception("生成晨报失败，user_id=%s: %s", user_id, exc)

        run = MorningReportRun.query.filter_by(user_id=user_id, report_date=report_date).first()
        settings = MorningReportSettings.query.filter_by(user_id=user_id).first()
        if run:
            run.status = 'failed'
            run.last_error = str(exc)
        if settings:
            settings.last_error = str(exc)
            settings.last_run_finished_at = utc_now()
        db.session.commit()
        raise


def discover_papers(settings: MorningReportSettings) -> list[dict[str, Any]]:
    keywords = settings.keyword_list() or list(DEFAULT_MORNING_REPORT_KEYWORDS)
    enabled_sources = settings.enabled_source_list() if hasattr(settings, 'enabled_source_list') else ['openalex', 'crossref']
    strict_filter_enabled = bool(getattr(settings, 'strict_filter_enabled', True))
    exclude_keywords = settings.exclude_keyword_list() if hasattr(settings, 'exclude_keyword_list') else []
    lookback_days = max(1, min(int(settings.lookback_days or 30), 365))
    pool_size = max(1, min(int(settings.paper_pool_size or 12), 30))
    desired_count = min(pool_size, TARGET_PAPER_FLOOR)
    per_source = max(12, min(pool_size * 4, 80))
    lookback_windows: list[int] = []
    for days in (lookback_days, max(90, lookback_days), max(180, lookback_days), 365, 730):
        normalized_days = max(1, min(int(days), 730))
        if normalized_days not in lookback_windows:
            lookback_windows.append(normalized_days)
    fallback_sources = enabled_sources

    collected_items: list[dict[str, Any]] = []
    collected_keys: set[str] = set()
    errors: list[str] = []
    best_screened: list[dict[str, Any]] = []
    best_ranked: list[dict[str, Any]] = []
    document_lookup = build_user_document_lookup(settings.user_id)

    for index, window_days in enumerate(lookback_windows):
        since_date = (cn_now().date() - timedelta(days=window_days)).isoformat()
        active_sources = enabled_sources if index == 0 else fallback_sources
        window_items, window_errors = fetch_candidates_for_sources(
            active_sources,
            keywords=keywords,
            since_date=since_date,
            per_source=per_source,
        )
        if index == 0:
            errors.extend(window_errors)

        new_count = 0
        for item in window_items:
            normalized = normalize_discovered_paper(item)
            if not normalized:
                continue
            dedupe_key = build_paper_dedupe_key(normalized)
            if dedupe_key in collected_keys:
                continue
            collected_keys.add(dedupe_key)
            collected_items.append(normalized)
            new_count += 1

        if not collected_items and errors:
            continue

        ranked, screened = rank_and_screen_candidates(
            collected_items,
            keywords=keywords,
            strict_filter_enabled=strict_filter_enabled,
            exclude_keywords=exclude_keywords,
            pool_size=pool_size,
            desired_count=desired_count,
            user_id=settings.user_id,
        )
        ranked, duplicate_ranked_count = filter_existing_library_papers(
            ranked,
            document_lookup=document_lookup,
        )
        screened, duplicate_screened_count = filter_existing_library_papers(
            screened,
            document_lookup=document_lookup,
        )
        if len(screened) > len(best_screened):
            best_screened = screened
        if len(ranked) > len(best_ranked):
            best_ranked = ranked

        _get_logger().info(
            "晨报检索窗口 %s 天：新增 %s 篇，候选累计 %s 篇，规则保留 %s 篇，AI 保留 %s 篇，已剔除系统重复 %s/%s 篇。",
            window_days,
            new_count,
            len(collected_items),
            len(ranked),
            len(screened),
            duplicate_ranked_count,
            duplicate_screened_count,
        )

        if len(screened) >= pool_size:
            return screened[:pool_size]
        if len(screened) >= desired_count and index > 1:
            return screened[:pool_size]

    if best_screened:
        return best_screened[:pool_size]
    if best_ranked:
        return backfill_screened_candidates(
            [],
            best_ranked,
            keywords=keywords,
            target_count=pool_size,
            document_lookup=document_lookup,
        )[:pool_size]
    if errors:
        raise RuntimeError("可用文献源返回异常：" + "；".join(errors[:3]))
    return []


def fetch_candidates_for_sources(
    enabled_sources: list[str],
    *,
    keywords: list[str],
    since_date: str,
    per_source: int,
) -> tuple[list[dict[str, Any]], list[str]]:
    items: list[dict[str, Any]] = []
    errors: list[str] = []
    source_fetchers = {
        'openalex': fetch_openalex,
        'crossref': fetch_crossref,
        'arxiv': fetch_arxiv,
        'ads': fetch_nasa_ads,
    }
    for source_key in enabled_sources:
        fetcher = source_fetchers.get(source_key)
        if fetcher is None:
            continue
        source_label = SUPPORTED_SOURCES.get(source_key, source_key)
        if source_key == 'ads' and not get_nasa_ads_api_token():
            errors.append(f"{source_label}: 未配置 API Token")
            _get_logger().warning("晨报检索跳过 %s：未配置 API Token。", source_label)
            continue
        try:
            items.extend(fetcher(keywords, since_date, per_source))
        except Exception as exc:
            errors.append(f"{source_label}: {exc}")
            _get_logger().exception("晨报检索来源 %s 失败: %s", source_label, exc)
    return items, errors


def rank_and_screen_candidates(
    items: list[dict[str, Any]],
    *,
    keywords: list[str],
    strict_filter_enabled: bool,
    exclude_keywords: list[str],
    pool_size: int,
    desired_count: int | None = None,
    user_id: int | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    deduped: dict[str, dict[str, Any]] = {}
    for item in items:
        normalized = normalize_discovered_paper(item)
        if not normalized:
            continue
        key = build_paper_dedupe_key(normalized)
        current = deduped.get(key)
        current_score = float(current.get('relevance_score') or 0) if current else float('-inf')
        normalized_score = float(normalized.get('relevance_score') or 0) + compute_priority_source_bonus(normalized)
        if current is None or normalized_score > current_score:
            deduped[key] = normalized

    ranked = [
        item for item in deduped.values()
        if should_keep_paper(
            item,
            keywords=keywords,
            strict_filter_enabled=strict_filter_enabled,
            exclude_keywords=exclude_keywords,
        )
    ]
    ranked.sort(key=lambda item: (
        float(item.get('relevance_score') or 0.0) + compute_priority_source_bonus(item),
        compute_priority_journal_bonus(item),
        int(item.get('citation_count') or 0),
        item.get('published_at') or '',
    ), reverse=True)
    screening_window = max(pool_size * 4, (desired_count or TARGET_PAPER_FLOOR) * 4, 20)
    screened = screen_candidate_papers_with_ai(
        ranked[:screening_window],
        keywords=keywords,
        user_id=user_id,
    )
    screened = backfill_screened_candidates(
        screened,
        ranked,
        keywords=keywords,
        target_count=pool_size,
    )
    return ranked, screened


def search_literature_with_ai(
    user_id: int,
    *,
    query_text: str,
    max_results: int = 20,
    lookback_days: int = 365,
    enabled_sources: list[str] | None = None,
    sort_mode: str = 'balanced',
) -> dict[str, Any]:
    cleaned_query = re.sub(r"\s+", " ", str(query_text or "").strip())
    if not cleaned_query:
        raise RuntimeError("请输入关键词或研究问题。")

    max_results = max(5, min(int(max_results or 20), 50))
    lookback_days = max(30, min(int(lookback_days or 365), 3650))
    selected_sources = [source for source in (enabled_sources or list(SUPPORTED_SOURCES)) if source in SUPPORTED_SOURCES]
    if not selected_sources:
        selected_sources = ['openalex', 'crossref', 'arxiv']

    profile = build_search_query_profile(cleaned_query, user_id=user_id)
    query_phrases = profile.get('queries') or [cleaned_query]
    keyword_terms = profile.get('keywords') or query_phrases
    since_date = (cn_now().date() - timedelta(days=lookback_days)).isoformat()
    desired_count = min(max_results, TARGET_PAPER_FLOOR)
    per_source = max(8, min(max_results * 2, SMART_SEARCH_PER_SOURCE_CAP))

    items, errors = fetch_generic_candidates_for_sources(
        selected_sources,
        query_phrases=query_phrases,
        keyword_terms=keyword_terms,
        since_date=since_date,
        per_source=per_source,
    )
    if not items and errors:
        raise RuntimeError("检索失败：" + "；".join(errors[:3]))

    deduped: dict[str, dict[str, Any]] = {}
    for item in items:
        normalized = normalize_discovered_paper(item)
        if not normalized:
            continue
        normalized['matched_keywords'] = find_matched_keywords(
            normalized.get('title') or '',
            normalized.get('abstract'),
            keyword_terms,
        )
        normalized['relevance_score'] = compute_relevance_score(
            title=normalized.get('title') or '',
            abstract=normalized.get('abstract'),
            keywords=keyword_terms,
            citation_count=0,
            published_at=normalized.get('published_at'),
        )
        normalized['quality_score'] = compute_quality_score(normalized)
        normalized['combined_score'] = compute_combined_search_score(
            normalized['relevance_score'],
            normalized['quality_score'],
            sort_mode=sort_mode,
        )
        normalized['existing_document_id'] = None
        existing_doc = find_existing_document_for_user(
            user_id,
            doi=normalized.get('doi'),
            title=normalized.get('title'),
            year=_safe_int(normalized.get('year')),
        )
        if existing_doc:
            normalized['existing_document_id'] = existing_doc.id
        key = build_paper_dedupe_key(normalized)
        current = deduped.get(key)
        current_score = float(current.get('combined_score') or 0) if current else float('-inf')
        candidate_score = float(normalized.get('combined_score') or 0) + compute_priority_source_bonus(normalized)
        if current is None or candidate_score > current_score:
            deduped[key] = normalized

    ranked_all = sorted(
        deduped.values(),
        key=lambda item: (
            float(item.get('combined_score') or 0.0) + compute_priority_source_bonus(item),
            compute_priority_journal_bonus(item),
            float(item.get('quality_score') or 0.0),
            int(item.get('citation_count') or 0),
            item.get('published_at') or '',
        ),
        reverse=True,
    )
    strong_ranked = [
        item for item in ranked_all
        if float(item.get('relevance_score') or 0.0) >= 1.2 or item.get('matched_keywords')
    ]
    moderate_ranked = [
        item for item in ranked_all
        if float(item.get('relevance_score') or 0.0) >= 0.8
        or compute_priority_journal_bonus(item) > 0
        or compute_priority_source_bonus(item) > 0
        or item.get('matched_keywords')
    ]
    if len(strong_ranked) >= desired_count:
        ranked = strong_ranked
    elif len(moderate_ranked) >= desired_count:
        ranked = moderate_ranked
    else:
        ranked = ranked_all[:max(max_results * 2, desired_count * 2, 16)]

    rerank_limit = min(
        len(ranked),
        max(4, min(SMART_SEARCH_RERANK_LIMIT, max_results, desired_count + 2)),
    )
    ai_rerank = rerank_search_candidates_with_ai(
        ranked[:rerank_limit],
        query_text=cleaned_query,
        keyword_terms=keyword_terms,
        sort_mode=sort_mode,
        user_id=user_id,
    )
    results: list[dict[str, Any]] = []
    rejected_results: list[dict[str, Any]] = []
    for index, item in enumerate(ranked, start=1):
        ai_item = ai_rerank.get(index)
        final_score = float(item.get('combined_score') or 0.0)
        if ai_item:
            item['ai_keep'] = ai_item.get('keep', True)
            item['ai_relevance_score'] = ai_item.get('relevance_score')
            item['ai_quality_score'] = ai_item.get('quality_score')
            item['ai_reason'] = ai_item.get('reason')
            ai_mix = (float(ai_item.get('relevance_score') or 0) * 0.7 + float(ai_item.get('quality_score') or 0) * 0.3) / 12.0
            final_score += ai_mix
            if not ai_item.get('keep', True):
                item['final_score'] = round(final_score, 3)
                rejected_results.append(item)
                continue
        item['final_score'] = round(final_score, 3)
        results.append(item)

    if len(results) < desired_count:
        rejected_results.sort(
            key=lambda item: (
                float(item.get('final_score') or 0.0),
                float(item.get('combined_score') or 0.0),
                int(item.get('citation_count') or 0),
            ),
            reverse=True,
        )
        for item in rejected_results:
            results.append(item)
            if len(results) >= desired_count:
                break

    results.sort(
        key=lambda item: (
            float(item.get('final_score') or 0.0),
            float(item.get('combined_score') or 0.0),
            int(item.get('citation_count') or 0),
        ),
        reverse=True,
    )
    results = results[:max_results]

    return {
        'query_text': cleaned_query,
        'profile': profile,
        'results': results,
        'errors': errors,
        'stats': {
            'raw_count': len(items),
            'deduped_count': len(deduped),
            'result_count': len(results),
            'lookback_days': lookback_days,
            'sort_mode': sort_mode,
        },
    }


def compute_priority_journal_bonus(item: dict[str, Any]) -> float:
    raw_json = _as_dict(item.get('raw_json'))
    haystack = " ".join(
        str(part or '').strip().lower()
        for part in (
            item.get('journal'),
            raw_json.get('publisher'),
            raw_json.get('host_venue'),
        )
        if str(part or '').strip()
    )
    if not haystack:
        return 0.0
    bonus = 0.0
    for term in PRIORITY_JOURNAL_TERMS:
        normalized = str(term or '').strip().lower()
        if normalized and normalized in haystack:
            bonus = max(bonus, 0.75 if re.search(r'[\u4e00-\u9fff]', normalized) else 0.55)
    return round(bonus, 3)


def compute_priority_source_bonus(item: dict[str, Any]) -> float:
    source = str(item.get('source') or '').strip().lower()
    bonus = compute_priority_journal_bonus(item)
    if source == 'ads':
        bonus += 0.25
    elif source == 'openalex':
        bonus += 0.18
    elif source == 'crossref':
        bonus += 0.12
    return round(bonus, 3)


def backfill_screened_candidates(
    screened: list[dict[str, Any]],
    ranked: list[dict[str, Any]],
    *,
    keywords: list[str],
    target_count: int,
    document_lookup: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if target_count <= 0:
        return []
    results: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in screened:
        normalized = normalize_discovered_paper(item)
        if not normalized:
            continue
        if document_lookup and find_existing_document_id_from_lookup(
            document_lookup,
            doi=normalized.get('doi'),
            title=normalized.get('title'),
            year=_safe_int(normalized.get('year')),
        ):
            continue
        key = build_paper_dedupe_key(normalized)
        if key in seen:
            continue
        seen.add(key)
        results.append(normalized)
        if len(results) >= target_count:
            return results[:target_count]

    for item in ranked:
        normalized = normalize_discovered_paper(item)
        if not normalized:
            continue
        if document_lookup and find_existing_document_id_from_lookup(
            document_lookup,
            doi=normalized.get('doi'),
            title=normalized.get('title'),
            year=_safe_int(normalized.get('year')),
        ):
            continue
        key = build_paper_dedupe_key(normalized)
        if key in seen:
            continue
        fallback = classify_candidate_track(normalized, keywords=keywords)
        if fallback.get('label') not in AI_SCREENING_ALLOWED_LABELS:
            continue
        normalized['research_track'] = fallback['label']
        normalized['research_track_label'] = RESEARCH_TRACK_LABELS.get(fallback['label'], fallback['label'])
        normalized['screening_reason'] = f"补足候选池：{fallback.get('reason') or '规则筛选保留'}"
        normalized['screening_confidence'] = fallback.get('confidence')
        raw_json = _as_dict(normalized.get('raw_json'))
        raw_json['research_track'] = normalized['research_track']
        raw_json['screening_reason'] = normalized['screening_reason']
        raw_json['screening_confidence'] = normalized['screening_confidence']
        normalized['raw_json'] = raw_json
        seen.add(key)
        results.append(normalized)
        if len(results) >= target_count:
            break
    return results[:target_count]


def fetch_generic_candidates_for_sources(
    enabled_sources: list[str],
    *,
    query_phrases: list[str],
    keyword_terms: list[str],
    since_date: str,
    per_source: int,
) -> tuple[list[dict[str, Any]], list[str]]:
    items: list[dict[str, Any]] = []
    errors: list[str] = []
    source_fetchers = {
        'openalex': search_openalex_by_queries,
        'crossref': search_crossref_by_queries,
        'arxiv': search_arxiv_by_queries,
        'ads': search_nasa_ads_by_queries,
    }
    for source_key in enabled_sources:
        fetcher = source_fetchers.get(source_key)
        if fetcher is None:
            continue
        source_label = SUPPORTED_SOURCES.get(source_key, source_key)
        if source_key == 'ads' and not get_nasa_ads_api_token():
            errors.append(f"{source_label}: 未配置 API Token")
            continue
        try:
            items.extend(fetcher(query_phrases, keyword_terms, since_date, per_source))
        except Exception as exc:
            errors.append(f"{source_label}: {exc}")
            _get_logger().exception("智能文献深搜来源 %s 失败: %s", source_label, exc)
    return items, errors


def screen_candidate_papers_with_ai(
    candidates: list[dict[str, Any]],
    *,
    keywords: list[str] | None = None,
    user_id: int | None = None,
) -> list[dict[str, Any]]:
    if not candidates:
        return []

    prepared: list[dict[str, Any]] = []
    for item in candidates:
        normalized = normalize_discovered_paper(item)
        if not normalized:
            continue
        fallback = classify_candidate_track(normalized, keywords=keywords)
        normalized['research_track'] = fallback['label']
        normalized['research_track_label'] = RESEARCH_TRACK_LABELS.get(fallback['label'], fallback['label'])
        normalized['screening_reason'] = fallback['reason']
        normalized['screening_confidence'] = fallback['confidence']
        prepared.append(normalized)

    if not prepared:
        return []

    client_config = get_ai_client_config()
    if not client_config:
        return [item for item in prepared if item.get('research_track') in AI_SCREENING_ALLOWED_LABELS]

    try:
        ai_results = classify_candidate_papers_with_ai(prepared, keywords=keywords or [], user_id=user_id)
    except Exception as exc:
        _get_logger().warning("AI 候选筛选失败，回退到规则过滤：%s", exc)
        return [item for item in prepared if item.get('research_track') in AI_SCREENING_ALLOWED_LABELS]

    screened: list[dict[str, Any]] = []
    for index, item in enumerate(prepared, start=1):
        ai_result = ai_results.get(index)
        if ai_result:
            label = ai_result.get('label') or item.get('research_track') or 'off_topic'
            if label not in RESEARCH_TRACK_LABELS:
                label = item.get('research_track') or 'off_topic'
            item['research_track'] = label
            item['research_track_label'] = RESEARCH_TRACK_LABELS.get(label, label)
            item['screening_reason'] = ai_result.get('reason') or item.get('screening_reason')
            item['screening_confidence'] = ai_result.get('confidence') or item.get('screening_confidence')
        if item.get('research_track') in AI_SCREENING_ALLOWED_LABELS:
            raw_json = _as_dict(item.get('raw_json'))
            raw_json['research_track'] = item.get('research_track')
            raw_json['screening_reason'] = item.get('screening_reason')
            raw_json['screening_confidence'] = item.get('screening_confidence')
            item['raw_json'] = raw_json
            screened.append(item)
    return screened

def fetch_openalex(keywords: list[str], since_date: str, limit: int) -> list[dict[str, Any]]:
    papers: list[dict[str, Any]] = []
    queries = build_openalex_queries(keywords)
    per_query = max(4, min(limit, 12))
    last_error: Exception | None = None
    raw_items: list[dict[str, Any]] = []
    for query in queries:
        try:
            raw_items.extend(_fetch_openalex_results_for_query(query, since_date, per_query))
        except Exception as exc:
            last_error = exc
            continue

    if not raw_items and last_error:
        raise last_error

    for item in raw_items:
        if not isinstance(item, dict):
            continue

        primary_location = _as_dict(item.get("primary_location"))
        primary_source = _as_dict(primary_location.get("source"))
        best_oa_location = _as_dict(item.get("best_oa_location"))
        host_venue = _as_dict(item.get("host_venue"))

        title = item.get("display_name") or "Untitled"
        abstract = reconstruct_openalex_abstract(item.get("abstract_inverted_index"))
        authors = []
        for authorship in _as_list(item.get("authorships")):
            if not isinstance(authorship, dict):
                continue
            author_info = _as_dict(authorship.get("author"))
            display_name = author_info.get("display_name")
            if display_name:
                authors.append(display_name)
        topics = [
            topic.get("display_name")
            for topic in _as_list(item.get("topics"))
            if isinstance(topic, dict)
            if topic.get("display_name")
        ][:8]
        journal = (
            primary_source.get("display_name")
            or host_venue.get("display_name")
        )
        doi = normalize_doi(item.get("doi"))
        paper = {
            "source": "openalex",
            "source_key": item.get("id") or doi or title,
            "title": title,
            "authors": authors[:12],
            "journal": journal,
            "year": sanitize_publication_year(_safe_int(item.get("publication_year"))),
            "published_at": sanitize_publication_date(item.get("publication_date")),
            "doi": doi,
            "url": primary_location.get("landing_page_url") or item.get("id"),
            "pdf_url": (
                primary_location.get("pdf_url")
                or best_oa_location.get("pdf_url")
            ),
            "abstract": abstract,
            "topics": topics,
            "citation_count": _safe_int(item.get("cited_by_count")) or 0,
            "raw_json": {
                "openalex_id": item.get("id"),
                "publication_year": item.get("publication_year"),
                "language": item.get("language"),
            },
        }
        paper["matched_keywords"] = find_matched_keywords(title, abstract, keywords)
        paper["relevance_score"] = compute_relevance_score(
            title=title,
            abstract=abstract,
            keywords=keywords,
            citation_count=paper["citation_count"],
            published_at=paper["published_at"],
        )
        papers.append(paper)
    return papers


def fetch_crossref(keywords: list[str], since_date: str, limit: int) -> list[dict[str, Any]]:
    queries = build_crossref_queries(keywords)
    per_keyword = max(4, min(max(limit // max(len(queries[:8]), 1), 4), 10))
    papers: list[dict[str, Any]] = []

    for keyword in queries[:8]:
        response = requests.get(
            CROSSREF_WORKS_URL,
            params={
                "filter": f"from-pub-date:{since_date},type:journal-article",
                "sort": "published",
                "order": "desc",
                "rows": per_keyword,
                "query.bibliographic": keyword,
            },
            headers={"User-Agent": "yshome-morning-report/1.0"},
            timeout=30,
        )
        response.raise_for_status()
        payload = _as_dict(response.json())
        message = _as_dict(payload.get("message"))
        for item in _as_list(message.get("items")):
            if not isinstance(item, dict):
                continue

            title = " ".join(_as_list(item.get("title"))).strip() or "Untitled"
            abstract = clean_crossref_abstract(item.get("abstract"))
            authors = [
                " ".join(part for part in [author.get("given"), author.get("family")] if part).strip()
                for author in _as_list(item.get("author"))
                if isinstance(author, dict)
            ]
            published_at = extract_crossref_date(item)
            topics = [str(subject).strip() for subject in _as_list(item.get("subject")) if str(subject).strip()][:8]
            doi = normalize_doi(item.get("DOI"))
            links = _as_list(item.get("link"))
            pdf_url = next(
                (
                    link.get("URL")
                    for link in links
                    if isinstance(link, dict) and "pdf" in str(link.get("content-type", "")).lower()
                ),
                None,
            )
            paper = {
                "source": "crossref",
                "source_key": doi or item.get("URL") or title,
                "title": title,
                "authors": [name for name in authors if name][:12],
                "journal": " ".join(_as_list(item.get("container-title"))[:1]).strip() or None,
                "year": sanitize_publication_year(_extract_year_from_dates(item)),
                "published_at": sanitize_publication_date(published_at),
                "doi": doi,
                "url": item.get("URL"),
                "pdf_url": pdf_url,
                "abstract": abstract,
                "topics": topics,
                "citation_count": _safe_int(item.get("is-referenced-by-count")) or 0,
                "raw_json": {
                    "type": item.get("type"),
                    "publisher": item.get("publisher"),
                },
            }
            paper["matched_keywords"] = find_matched_keywords(title, abstract, keywords)
            paper["relevance_score"] = compute_relevance_score(
                title=title,
                abstract=abstract,
                keywords=keywords,
                citation_count=paper["citation_count"],
                published_at=paper["published_at"],
            )
            papers.append(paper)
    return papers


def fetch_arxiv(keywords: list[str], since_date: str, limit: int) -> list[dict[str, Any]]:
    queries = build_arxiv_queries(keywords)
    per_query = max(2, min(limit, 8))
    papers: list[dict[str, Any]] = []
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "arxiv": "http://arxiv.org/schemas/atom",
    }

    for query in queries:
        response = requests.get(
            ARXIV_API_URL,
            params={
                "search_query": f'all:"{query}"',
                "start": 0,
                "max_results": per_query,
                "sortBy": "submittedDate",
                "sortOrder": "descending",
            },
            headers={"User-Agent": "yshome-morning-report/1.0"},
            timeout=30,
        )
        response.raise_for_status()
        root = ET.fromstring(response.text)
        for entry in root.findall("atom:entry", ns):
            title = " ".join((entry.findtext("atom:title", default="", namespaces=ns) or "").split()) or "Untitled"
            abstract = " ".join((entry.findtext("atom:summary", default="", namespaces=ns) or "").split()) or None
            published_raw = (
                entry.findtext("atom:published", default="", namespaces=ns)
                or entry.findtext("atom:updated", default="", namespaces=ns)
            )
            published_at = sanitize_publication_date((published_raw or "")[:10])
            if published_at and published_at < since_date:
                continue

            authors = [
                " ".join((author.findtext("atom:name", default="", namespaces=ns) or "").split())
                for author in entry.findall("atom:author", ns)
            ]
            authors = [author for author in authors if author][:12]
            topics = [
                str(category.attrib.get("term") or "").strip()
                for category in entry.findall("atom:category", ns)
                if str(category.attrib.get("term") or "").strip()
            ][:8]
            doi = normalize_doi(entry.findtext("arxiv:doi", default="", namespaces=ns))
            journal_ref = " ".join((entry.findtext("arxiv:journal_ref", default="", namespaces=ns) or "").split()) or None
            source_key = (entry.findtext("atom:id", default="", namespaces=ns) or doi or title).strip()

            url = None
            pdf_url = None
            for link in entry.findall("atom:link", ns):
                href = link.attrib.get("href")
                if not href:
                    continue
                if link.attrib.get("title") == "pdf" or link.attrib.get("type") == "application/pdf":
                    pdf_url = href
                elif link.attrib.get("rel") == "alternate" and not url:
                    url = href

            paper = {
                "source": "arxiv",
                "source_key": source_key,
                "title": title,
                "authors": authors,
                "journal": journal_ref or "arXiv",
                "year": sanitize_publication_year(_safe_int((published_at or "")[:4]), published_at=published_at),
                "published_at": published_at,
                "doi": doi,
                "url": url or source_key,
                "pdf_url": pdf_url,
                "abstract": abstract,
                "topics": topics,
                "citation_count": 0,
                "raw_json": {
                    "arxiv_id": source_key,
                    "journal_ref": journal_ref,
                },
            }
            paper["matched_keywords"] = find_matched_keywords(title, abstract, keywords)
            paper["relevance_score"] = compute_relevance_score(
                title=title,
                abstract=abstract,
                keywords=keywords,
                citation_count=0,
                published_at=paper["published_at"],
            )
            papers.append(paper)
    return papers


def fetch_nasa_ads(keywords: list[str], since_date: str, limit: int) -> list[dict[str, Any]]:
    api_token = get_nasa_ads_api_token()
    if not api_token:
        raise RuntimeError("未检测到 NASA ADS API Token，请先配置环境变量 NASA_ADS_API_TOKEN。")

    query = build_nasa_ads_query(keywords)
    response = requests.get(
        NASA_ADS_SEARCH_URL,
        params={
            "q": query,
            "fl": "title,author,pub,year,abstract,doi,bibcode,citation_count,keyword,pubdate,property",
            "rows": max(1, min(limit, 25)),
            "sort": "date desc",
        },
        headers={
            "Authorization": f"Bearer {api_token}",
            "User-Agent": "yshome-morning-report/1.0",
        },
        timeout=30,
    )
    response.raise_for_status()
    payload = _as_dict(response.json())
    docs = _as_list(_as_dict(payload.get("response")).get("docs"))
    papers: list[dict[str, Any]] = []

    for item in docs:
        if not isinstance(item, dict):
            continue
        title = " ".join(_as_list(item.get("title"))).strip() or "Untitled"
        abstract = str(item.get("abstract") or "").strip() or None
        published_at = sanitize_publication_date(str(item.get("pubdate") or "")[:10])
        if published_at and published_at < since_date:
            continue
        doi_list = [str(value).strip() for value in _as_list(item.get("doi")) if str(value).strip()]
        doi = normalize_doi(doi_list[0] if doi_list else None)
        keywords_list = [str(value).strip() for value in _as_list(item.get("keyword")) if str(value).strip()][:10]
        bibcode = str(item.get("bibcode") or "").strip()
        paper = {
            "source": "ads",
            "source_key": bibcode or doi or title,
            "title": title,
            "authors": [str(author).strip() for author in _as_list(item.get("author")) if str(author).strip()][:12],
            "journal": str(item.get("pub") or "").strip() or "NASA ADS",
            "year": sanitize_publication_year(_safe_int(item.get("year")), published_at=published_at),
            "published_at": published_at,
            "doi": doi,
            "url": f"https://ui.adsabs.harvard.edu/abs/{bibcode}/abstract" if bibcode else (f"https://doi.org/{doi}" if doi else None),
            "pdf_url": None,
            "abstract": abstract,
            "topics": keywords_list,
            "citation_count": _safe_int(item.get("citation_count")) or 0,
            "raw_json": {
                "bibcode": bibcode,
                "property": _as_list(item.get("property")),
            },
        }
        paper["matched_keywords"] = find_matched_keywords(title, abstract, keywords)
        paper["relevance_score"] = compute_relevance_score(
            title=title,
            abstract=abstract,
            keywords=keywords,
            citation_count=paper["citation_count"],
            published_at=paper["published_at"],
        )
        papers.append(paper)
    return papers


def search_openalex_by_queries(
    query_phrases: list[str],
    keyword_terms: list[str],
    since_date: str,
    limit: int,
) -> list[dict[str, Any]]:
    papers: list[dict[str, Any]] = []
    raw_items: list[dict[str, Any]] = []
    last_error: Exception | None = None
    queries = dedupe_search_terms(query_phrases, limit=5)
    per_query = max(5, min(limit, 14))
    for query in queries:
        try:
            response = requests.get(
                OPENALEX_WORKS_URL,
                params={
                    "search": query,
                    "filter": f"from_publication_date:{since_date},has_abstract:true",
                    "sort": "cited_by_count:desc",
                    "per-page": per_query,
                },
                headers={"User-Agent": "yshome-smart-search/1.0"},
                timeout=_smart_search_timeout(),
            )
            response.raise_for_status()
            payload = _as_dict(response.json())
            raw_items.extend(item for item in _as_list(payload.get("results")) if isinstance(item, dict))
        except Exception as exc:
            last_error = exc
    if not raw_items and last_error:
        raise last_error

    for item in raw_items:
        primary_location = _as_dict(item.get("primary_location"))
        primary_source = _as_dict(primary_location.get("source"))
        best_oa_location = _as_dict(item.get("best_oa_location"))
        host_venue = _as_dict(item.get("host_venue"))
        title = item.get("display_name") or "Untitled"
        abstract = reconstruct_openalex_abstract(item.get("abstract_inverted_index"))
        authors = []
        for authorship in _as_list(item.get("authorships")):
            author_info = _as_dict(_as_dict(authorship).get("author"))
            display_name = author_info.get("display_name")
            if display_name:
                authors.append(display_name)
        journal = primary_source.get("display_name") or host_venue.get("display_name")
        topics = [
            topic.get("display_name")
            for topic in _as_list(item.get("topics"))
            if isinstance(topic, dict) and topic.get("display_name")
        ][:8]
        doi = normalize_doi(item.get("doi"))
        paper = {
            "source": "openalex",
            "source_key": item.get("id") or doi or title,
            "title": title,
            "authors": authors[:12],
            "journal": journal,
            "year": sanitize_publication_year(_safe_int(item.get("publication_year"))),
            "published_at": sanitize_publication_date(item.get("publication_date")),
            "doi": doi,
            "url": primary_location.get("landing_page_url") or item.get("id"),
            "pdf_url": primary_location.get("pdf_url") or best_oa_location.get("pdf_url"),
            "abstract": abstract,
            "topics": topics,
            "citation_count": _safe_int(item.get("cited_by_count")) or 0,
            "raw_json": {
                "openalex_id": item.get("id"),
                "publication_year": item.get("publication_year"),
                "language": item.get("language"),
                "host_venue": journal,
                "query_hits": find_matched_keywords(title, abstract, keyword_terms),
            },
        }
        papers.append(paper)
    return papers


def search_crossref_by_queries(
    query_phrases: list[str],
    keyword_terms: list[str],
    since_date: str,
    limit: int,
) -> list[dict[str, Any]]:
    papers: list[dict[str, Any]] = []
    queries = dedupe_search_terms(query_phrases, limit=5)
    per_query = max(4, min(max(limit // max(len(queries), 1), 4), 10))
    for query in queries:
        response = requests.get(
            CROSSREF_WORKS_URL,
            params={
                "filter": f"from-pub-date:{since_date},type:journal-article",
                "rows": per_query,
                "query.bibliographic": query,
            },
            headers={"User-Agent": "yshome-smart-search/1.0"},
            timeout=_smart_search_timeout(),
        )
        response.raise_for_status()
        payload = _as_dict(response.json())
        message = _as_dict(payload.get("message"))
        for item in _as_list(message.get("items")):
            if not isinstance(item, dict):
                continue
            title = " ".join(_as_list(item.get("title"))).strip() or "Untitled"
            abstract = clean_crossref_abstract(item.get("abstract"))
            authors = [
                " ".join(part for part in [author.get("given"), author.get("family")] if part).strip()
                for author in _as_list(item.get("author"))
                if isinstance(author, dict)
            ]
            paper = {
                "source": "crossref",
                "source_key": normalize_doi(item.get("DOI")) or item.get("URL") or title,
                "title": title,
                "authors": [name for name in authors if name][:12],
                "journal": " ".join(_as_list(item.get("container-title"))[:1]).strip() or None,
                "year": sanitize_publication_year(_extract_year_from_dates(item)),
                "published_at": sanitize_publication_date(extract_crossref_date(item)),
                "doi": normalize_doi(item.get("DOI")),
                "url": item.get("URL"),
                "pdf_url": next(
                    (
                        link.get("URL")
                        for link in _as_list(item.get("link"))
                        if isinstance(link, dict) and "pdf" in str(link.get("content-type", "")).lower()
                    ),
                    None,
                ),
                "abstract": abstract,
                "topics": [str(subject).strip() for subject in _as_list(item.get("subject")) if str(subject).strip()][:8],
                "citation_count": _safe_int(item.get("is-referenced-by-count")) or 0,
                "raw_json": {
                    "type": item.get("type"),
                    "publisher": item.get("publisher"),
                    "query_hits": find_matched_keywords(title, abstract, keyword_terms),
                },
            }
            papers.append(paper)
    return papers


def search_arxiv_by_queries(
    query_phrases: list[str],
    keyword_terms: list[str],
    since_date: str,
    limit: int,
) -> list[dict[str, Any]]:
    queries = dedupe_search_terms(query_phrases, limit=4)
    per_query = max(3, min(limit, 10))
    papers: list[dict[str, Any]] = []
    ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    for query in queries:
        response = requests.get(
            ARXIV_API_URL,
            params={
                "search_query": f'all:"{query}"',
                "start": 0,
                "max_results": per_query,
                "sortBy": "submittedDate",
                "sortOrder": "descending",
            },
            headers={"User-Agent": "yshome-smart-search/1.0"},
            timeout=_smart_search_timeout(),
        )
        response.raise_for_status()
        root = ET.fromstring(response.text)
        for entry in root.findall("atom:entry", ns):
            title = " ".join((entry.findtext("atom:title", default="", namespaces=ns) or "").split()) or "Untitled"
            abstract = " ".join((entry.findtext("atom:summary", default="", namespaces=ns) or "").split()) or None
            published_raw = (
                entry.findtext("atom:published", default="", namespaces=ns)
                or entry.findtext("atom:updated", default="", namespaces=ns)
            )
            published_at = sanitize_publication_date((published_raw or "")[:10])
            if published_at and published_at < since_date:
                continue
            authors = [
                " ".join((author.findtext("atom:name", default="", namespaces=ns) or "").split())
                for author in entry.findall("atom:author", ns)
            ]
            topics = [
                str(category.attrib.get("term") or "").strip()
                for category in entry.findall("atom:category", ns)
                if str(category.attrib.get("term") or "").strip()
            ][:8]
            doi = normalize_doi(entry.findtext("arxiv:doi", default="", namespaces=ns))
            journal_ref = " ".join((entry.findtext("arxiv:journal_ref", default="", namespaces=ns) or "").split()) or None
            source_key = (entry.findtext("atom:id", default="", namespaces=ns) or doi or title).strip()
            url = None
            pdf_url = None
            for link in entry.findall("atom:link", ns):
                href = link.attrib.get("href")
                if not href:
                    continue
                if link.attrib.get("title") == "pdf" or link.attrib.get("type") == "application/pdf":
                    pdf_url = href
                elif link.attrib.get("rel") == "alternate" and not url:
                    url = href
            papers.append({
                "source": "arxiv",
                "source_key": source_key,
                "title": title,
                "authors": [author for author in authors if author][:12],
                "journal": journal_ref or "arXiv",
                "year": sanitize_publication_year(_safe_int((published_at or "")[:4]), published_at=published_at),
                "published_at": published_at,
                "doi": doi,
                "url": url or source_key,
                "pdf_url": pdf_url,
                "abstract": abstract,
                "topics": topics,
                "citation_count": 0,
                "raw_json": {
                    "arxiv_id": source_key,
                    "journal_ref": journal_ref,
                    "query_hits": find_matched_keywords(title, abstract, keyword_terms),
                },
            })
    return papers


def search_nasa_ads_by_queries(
    query_phrases: list[str],
    keyword_terms: list[str],
    since_date: str,
    limit: int,
) -> list[dict[str, Any]]:
    api_token = get_nasa_ads_api_token()
    if not api_token:
        raise RuntimeError("未检测到 NASA ADS API Token，请先配置环境变量 NASA_ADS_API_TOKEN。")
    query = " OR ".join(f'"{query}"' for query in dedupe_search_terms(query_phrases, limit=6))
    if not query:
        query = " OR ".join(f'"{term}"' for term in dedupe_search_terms(keyword_terms, limit=6))
    if not query:
        raise RuntimeError("没有可用的检索短语。")
    response = requests.get(
        NASA_ADS_SEARCH_URL,
        params={
            "q": query,
            "fl": "title,author,pub,year,abstract,doi,bibcode,citation_count,keyword,pubdate,property",
            "rows": max(1, min(limit, 30)),
            "sort": "citation_count desc",
        },
        headers={"Authorization": f"Bearer {api_token}", "User-Agent": "yshome-smart-search/1.0"},
        timeout=_smart_search_timeout(),
    )
    response.raise_for_status()
    payload = _as_dict(response.json())
    docs = _as_list(_as_dict(payload.get("response")).get("docs"))
    papers: list[dict[str, Any]] = []
    for item in docs:
        if not isinstance(item, dict):
            continue
        title = " ".join(_as_list(item.get("title"))).strip() or "Untitled"
        abstract = str(item.get("abstract") or "").strip() or None
        published_at = sanitize_publication_date(str(item.get("pubdate") or "")[:10])
        if published_at and published_at < since_date:
            continue
        doi_list = [str(value).strip() for value in _as_list(item.get("doi")) if str(value).strip()]
        papers.append({
            "source": "ads",
            "source_key": str(item.get("bibcode") or title),
            "title": title,
            "authors": [str(value).strip() for value in _as_list(item.get("author")) if str(value).strip()][:12],
            "journal": str(item.get("pub") or "").strip() or "NASA ADS",
            "year": sanitize_publication_year(_safe_int(item.get("year")), published_at=published_at),
            "published_at": published_at,
            "doi": normalize_doi(doi_list[0] if doi_list else None),
            "url": f"https://ui.adsabs.harvard.edu/abs/{item.get('bibcode')}/abstract" if item.get("bibcode") else None,
            "pdf_url": None,
            "abstract": abstract,
            "topics": [str(value).strip() for value in _as_list(item.get("keyword")) if str(value).strip()][:10],
            "citation_count": _safe_int(item.get("citation_count")) or 0,
            "raw_json": {
                "bibcode": item.get("bibcode"),
                "query_hits": find_matched_keywords(title, abstract, keyword_terms),
            },
        })
    return papers


def compute_quality_score(item: dict[str, Any]) -> float:
    source = str(item.get('source') or '').lower()
    journal = str(item.get('journal') or '').strip()
    citation_count = max(int(item.get('citation_count') or 0), 0)
    published_at = item.get('published_at')
    raw_json = _as_dict(item.get('raw_json'))
    score = 0.0
    if citation_count > 0:
        score += min(math.log10(citation_count + 1) * 3.4, 8.2)
    if journal:
        score += 1.4
    if str(raw_json.get('type') or '').lower() == 'journal-article':
        score += 1.1
    if source == 'ads':
        score += 1.6
    elif source == 'openalex':
        score += 1.4
    elif source == 'crossref':
        score += 1.0
    elif source == 'arxiv':
        score += 0.4
    score += compute_priority_journal_bonus(item)
    if journal.lower() == 'arxiv':
        score -= 0.3
    if published_at:
        score += min(_compute_recency_bonus(published_at), 1.2)
    return round(max(score, 0.0), 3)


def compute_combined_search_score(relevance_score: float, quality_score: float, *, sort_mode: str = 'balanced') -> float:
    mode = str(sort_mode or 'balanced').strip().lower()
    if mode == 'quality':
        score = relevance_score * 0.42 + quality_score * 0.58
    elif mode == 'relevance':
        score = relevance_score * 0.76 + quality_score * 0.24
    else:
        score = relevance_score * 0.60 + quality_score * 0.40
    return round(score, 3)


def build_search_query_profile(query_text: str, *, user_id: int | None = None) -> dict[str, Any]:
    fallback = build_fallback_search_query_profile(query_text)
    if not get_ai_client_config():
        return fallback
    prompt = (
        "请把下面这段科研检索需求提炼成适合学术检索的查询配置。\n"
        "请只输出 JSON 对象，格式如下：\n"
        "{"
        "\"search_title\": \"一句中文标题\", "
        "\"intent_summary\": \"一句中文概述\", "
        "\"queries\": [\"英文或中英混合检索短语1\", \"短语2\"], "
        "\"keywords\": [\"关键词1\", \"关键词2\"], "
        "\"exclude_terms\": [\"可选排除词\"]"
        "}\n"
        "要求：\n"
        "1. queries 不超过 6 个，优先保留最能代表研究问题的短语；\n"
        "2. keywords 不超过 8 个；\n"
        "3. 不要解释文字，不要 Markdown。\n\n"
        f"检索需求：{query_text}"
    )
    try:
        payload = _extract_json_payload(call_ai_text(
            "你是科研文献检索助手，擅长把自然语言需求转成检索式。",
            prompt,
            timeout=SMART_SEARCH_QUERY_REFINE_TIMEOUT,
            usage_context={'scene': 'search_query_refine', 'user_id': user_id},
        ))
        if not isinstance(payload, dict):
            return fallback
        queries = dedupe_search_terms(_as_list(payload.get('queries')) + (fallback.get('queries') or []), limit=6)
        keywords = dedupe_search_terms(_as_list(payload.get('keywords')) + (fallback.get('keywords') or []), limit=8)
        exclude_terms = dedupe_search_terms(_as_list(payload.get('exclude_terms')), limit=6)
        return {
            'search_title': str(payload.get('search_title') or fallback.get('search_title') or '智能文献深搜').strip() or fallback.get('search_title'),
            'intent_summary': str(payload.get('intent_summary') or fallback.get('intent_summary') or '').strip(),
            'queries': queries or fallback.get('queries') or [query_text],
            'keywords': keywords or fallback.get('keywords') or fallback.get('queries') or [query_text],
            'exclude_terms': exclude_terms,
        }
    except Exception as exc:
        _get_logger().warning("AI 检索词提炼失败，回退到规则解析：%s", exc)
        return fallback


def build_fallback_search_query_profile(query_text: str) -> dict[str, Any]:
    cleaned = re.sub(r"\s+", " ", str(query_text or "").strip())
    quoted = re.findall(r'"([^"]+)"|“([^”]+)”', cleaned)
    phrases = [next((item for item in match if item), '').strip() for match in quoted]
    phrases = [phrase for phrase in phrases if phrase]
    split_parts = [part.strip() for part in re.split(r"[，,；;。.!?\n]+", cleaned) if part.strip()]
    phrases.extend(split_parts[:4])
    keywords: list[str] = []
    if re.search(r'[\u4e00-\u9fff]', cleaned):
        for token in re.split(r'[\s,，;；/、]+', cleaned):
            value = token.strip()
            if not value or value in SEARCH_QUERY_STOPWORDS_ZH or len(value) <= 1:
                continue
            keywords.append(value)
    for token in re.findall(r"[A-Za-z][A-Za-z0-9\\-]{2,}", cleaned):
        lower = token.lower()
        if lower in SEARCH_QUERY_STOPWORDS_EN:
            continue
        keywords.append(token)
    queries = dedupe_search_terms(phrases or keywords or [cleaned], limit=6)
    deduped_keywords = dedupe_search_terms(keywords or queries or [cleaned], limit=8)
    return {
        'search_title': cleaned[:64] or '智能文献深搜',
        'intent_summary': '按输入问题提炼关键词并跨源检索高相关文献。',
        'queries': queries,
        'keywords': deduped_keywords,
        'exclude_terms': [],
    }


def dedupe_search_terms(values: list[Any], *, limit: int) -> list[str]:
    results: list[str] = []
    seen: set[str] = set()
    for raw in values:
        value = re.sub(r"\s+", " ", str(raw or "").strip())
        if not value:
            continue
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        results.append(value)
        if len(results) >= max(limit, 1):
            break
    return results


def rerank_search_candidates_with_ai(
    candidates: list[dict[str, Any]],
    *,
    query_text: str,
    keyword_terms: list[str],
    sort_mode: str,
    user_id: int | None = None,
) -> dict[int, dict[str, Any]]:
    if not candidates or not SMART_SEARCH_ENABLE_AI_RERANK or not get_ai_client_config():
        return {}
    candidate_blocks: list[str] = []
    for index, item in enumerate(candidates, start=1):
        abstract_snippet = re.sub(r"\s+", " ", str(item.get('abstract') or '').strip())[:SMART_SEARCH_ABSTRACT_SNIPPET_LIMIT] or '暂无摘要'
        candidate_blocks.append(
            f"[{index}]\n"
            f"标题：{item.get('title') or 'Untitled'}\n"
            f"来源：{item.get('journal') or item.get('source') or '未知'}\n"
            f"日期：{item.get('published_at') or item.get('year') or '未知'}\n"
            f"被引：{int(item.get('citation_count') or 0)}\n"
            f"主题：{'、'.join(item.get('topics') or []) or '无'}\n"
            f"摘要：{abstract_snippet}\n"
        )
    prompt = (
        "你是科研文献深搜的重排助手。请根据用户的检索需求，对候选文献做相关性和学术质量的综合判断。\n"
        "相关性看是否真正回答用户问题；质量看被引、正式发表来源、是否像高价值科研文献。\n"
        "请输出 JSON 数组，每个元素格式：\n"
        "{\"index\":1,\"keep\":true,\"relevance_score\":0-100,\"quality_score\":0-100,\"reason\":\"一句中文理由\"}\n"
        "不要输出额外解释。\n\n"
        f"用户需求：{query_text}\n"
        f"提炼关键词：{'、'.join(keyword_terms) or '无'}\n"
        f"排序偏好：{sort_mode}\n\n"
        + "\n".join(candidate_blocks)
    )
    try:
        payload = _extract_json_payload(call_ai_text(
            "你是严谨的科研文献检索重排助手，只输出 JSON。",
            prompt,
            timeout=SMART_SEARCH_AI_TIMEOUT,
            usage_context={'scene': 'search_rerank', 'user_id': user_id},
        ))
    except Exception as exc:
        _get_logger().warning("AI 文献重排失败，回退到规则排序：%s", exc)
        return {}
    if not isinstance(payload, list):
        return {}
    results: dict[int, dict[str, Any]] = {}
    for item in payload:
        if not isinstance(item, dict):
            continue
        index = _safe_int(item.get('index'))
        if index is None or index < 1 or index > len(candidates):
            continue
        results[index] = {
            'keep': bool(item.get('keep', True)),
            'relevance_score': max(0, min(_safe_int(item.get('relevance_score')) or 60, 100)),
            'quality_score': max(0, min(_safe_int(item.get('quality_score')) or 60, 100)),
            'reason': str(item.get('reason') or '').strip()[:240] or 'AI 已完成综合重排。',
        }
    return results


def compute_relevance_score(
    *,
    title: str,
    abstract: str | None,
    keywords: list[str],
    citation_count: int = 0,
    published_at: str | None = None,
) -> float:
    title_lower = (title or "").lower()
    haystack = f"{title or ''} {abstract or ''}".lower()
    anchor_terms = derive_anchor_terms(keywords)
    score = 0.0
    for keyword in keywords:
        norm = keyword.strip().lower()
        if not norm:
            continue
        if norm in title_lower:
            score += 3.0
        elif norm in haystack:
            score += 1.2

    for term in anchor_terms:
        if term in title_lower:
            score += 2.4
        elif term in haystack:
            score += 0.9

    if abstract:
        score += 0.4

    if citation_count > 0:
        score += min(math.log10(citation_count + 1), 2.5)

    if published_at:
        recency_bonus = _compute_recency_bonus(published_at)
        score += recency_bonus

    return round(score, 3)


def find_matched_keywords(title: str, abstract: str | None, keywords: list[str]) -> list[str]:
    haystack = f"{title} {abstract or ''}".lower()
    matches: list[str] = []
    for keyword in keywords:
        norm = keyword.strip().lower()
        if norm and norm in haystack and keyword not in matches:
            matches.append(keyword)
    return matches


def summarize_paper_with_ai(paper: MorningReportPaper, *, keywords: list[str] | None = None) -> str:
    scope_result = classify_candidate_with_optional_ai(
        {
            'title': paper.title,
            'authors': paper.author_list(),
            'journal': paper.journal,
            'published_at': paper.published_at,
            'year': paper.year,
            'doi': paper.doi,
            'abstract': paper.abstract,
            'topics': paper.topic_list(),
            'relevance_score': paper.relevance_score,
        },
        keywords=keywords or [],
        use_ai=True,
        user_id=paper.user_id,
    )
    if scope_result.get('label') not in AI_SCREENING_ALLOWED_LABELS:
        reason = scope_result.get('reason') or '该论文与晨报聚焦的三类方向不够相关。'
        raise RuntimeError(f"AI 判断该论文暂不属于“月震 / 月球内部结构 / 阿波罗数据再处理”三类：{reason}")

    keyword_text = "、".join(keywords or []) or "当前关键词库"
    authors = "；".join(paper.author_list()) or "未知"
    topics = "、".join(paper.topic_list()) or "未标注"
    abstract = (paper.abstract or "").strip()[:12000]
    prompt = (
        "请作为中文科研助手，对下面这篇“今日晨报”文献做简明但专业的总结。\n"
        "要求：\n"
        "1. 使用中文；\n"
        "2. 只基于提供的信息，不要编造；\n"
        "3. 输出 Markdown；\n"
        "4. 控制在 6 个小节以内，重点突出“为何值得读”；\n"
        "5. 不要输出 ```markdown 代码块。\n\n"
        f"关键词库：{keyword_text}\n"
        f"研究归类：{RESEARCH_TRACK_LABELS.get(scope_result.get('label') or '', '未判定')}\n"
        f"标题：{paper.title}\n"
        f"作者：{authors}\n"
        f"期刊/来源：{paper.journal or '未知'}\n"
        f"日期：{paper.published_at or paper.year or '未知'}\n"
        f"DOI：{paper.doi or '未知'}\n"
        f"主题：{topics}\n"
        f"摘要：{abstract or '暂无摘要'}\n"
    )
    system_prompt = "你是月球与地球物理方向的科研晨报助手，擅长快速判断论文价值并用中文总结。"
    content = call_ai_text(
        system_prompt,
        prompt,
        timeout=90,
        usage_context={'scene': 'morning_report_summary', 'user_id': paper.user_id},
    )
    if not content:
        raise RuntimeError("AI 返回为空，未能生成总结。")

    paper.ai_summary = content.strip()
    paper.ai_summary_updated_at = utc_now()
    db.session.commit()
    return paper.ai_summary


def summarize_document_with_ai(doc: Document) -> str:
    keyword_text = "、".join([item.strip() for item in re.split(r"[;,，；\n]+", doc.keywords or "") if item.strip()][:8]) or "未提供"
    abstract = str(doc.abstract or "").strip()[:12000]
    prompt = (
        "请作为中文科研助手，对下面这篇文献做专业、清晰、易读的总结。\n"
        "要求：\n"
        "1. 使用中文；\n"
        "2. 只基于提供的信息，不要编造；\n"
        "3. 输出 Markdown；\n"
        "4. 控制在 6 个小节以内；\n"
        "5. 不要输出 ```markdown 代码块。\n\n"
        f"标题：{doc.title}\n"
        f"作者：{doc.authors or '未知'}\n"
        f"期刊/来源：{doc.journal or '未知'}\n"
        f"年份：{doc.year or '未知'}\n"
        f"DOI：{doc.doi or '未知'}\n"
        f"关键词：{keyword_text}\n"
        f"备注：{(doc.remark or '').strip()[:3000] or '无'}\n"
        f"摘要：{abstract or '暂无摘要'}\n"
    )
    system_prompt = "你是中文科研阅读助手，擅长把文献内容整理成结构清晰、方便快速阅读的总结。"
    content = call_ai_text(
        system_prompt,
        prompt,
        timeout=90,
        usage_context={'scene': 'document_summary', 'user_id': doc.owner_id},
    )
    if not content:
        raise RuntimeError("AI 返回为空，未能生成总结。")

    doc.ai_summary = content.strip()
    doc.ai_summary_updated_at = utc_now()
    db.session.commit()
    return doc.ai_summary


def get_morning_report_popup_payload(user_id: int) -> dict[str, Any] | None:
    settings = MorningReportSettings.query.filter_by(user_id=user_id).first()
    if not settings or not settings.enabled or not settings.popup_enabled:
        return None

    report_date = today_cn_date()
    if settings.last_popup_seen_date == report_date:
        return None

    run = MorningReportRun.query.filter_by(user_id=user_id, report_date=report_date, status='ready').first()
    if not run or run.paper_count <= 0:
        return None

    return {
        "report_date": report_date,
        "paper_count": run.paper_count,
        "headline": run.headline or "今日晨报已生成",
        "keywords": settings.keyword_list()[:4],
        "generated_at": run.generated_at,
    }


def get_ai_client_config() -> dict[str, str] | None:
    runtime_config = load_runtime_ai_config()
    api_key = (
        runtime_config.get("api_key")
        or os.environ.get("OPENAI_API_KEY")
        or os.environ.get("OPENAI_APIKEY")
        or os.environ.get("YSXS_OPENAI_API_KEY")
        or os.environ.get("CODEX_API_KEY")
    )
    base_url = (
        runtime_config.get("base_url")
        or os.environ.get("OPENAI_BASE_URL")
        or os.environ.get("OPENAI_API_BASE")
        or os.environ.get("YSXS_OPENAI_BASE_URL")
        or os.environ.get("CODEX_BASE_URL")
    )
    model = (
        runtime_config.get("model")
        or os.environ.get("YSXS_AI_MODEL")
        or os.environ.get("OPENAI_MODEL")
        or os.environ.get("CODEX_MODEL")
    )
    wire_api = (
        runtime_config.get("wire_api")
        or os.environ.get("YSXS_AI_WIRE_API")
        or os.environ.get("OPENAI_WIRE_API")
        or os.environ.get("CODEX_WIRE_API")
    )

    codex_config = _load_codex_cli_config()
    if codex_config:
        base_url = base_url or codex_config.get('base_url')
        model = model or codex_config.get('model')
        wire_api = wire_api or codex_config.get('wire_api')
        env_key = codex_config.get('env_key')
        if env_key and not api_key:
            api_key = os.environ.get(env_key)

    if not api_key:
        return None

    return {
        'api_key': api_key,
        'base_url': (base_url or 'https://api.openai.com/v1').rstrip('/'),
        'model': model or 'gpt-4.1-mini',
        'wire_api': (wire_api or 'chat_completions').strip().lower(),
    }


def ai_summary_available() -> bool:
    return get_ai_client_config() is not None


def get_nasa_ads_api_token() -> str | None:
    runtime_config = load_runtime_ai_config()
    token = (
        runtime_config.get("nasa_ads_api_token")
        or os.environ.get("NASA_ADS_API_TOKEN")
        or os.environ.get("ADS_API_TOKEN")
        or os.environ.get("NASA_ADS_TOKEN")
    )
    token = str(token or "").strip()
    return token or None


def call_ai_text(
    system_prompt: str,
    prompt: str,
    *,
    timeout: int = 90,
    usage_context: dict[str, Any] | None = None,
) -> str:
    client_config = get_ai_client_config()
    if not client_config:
        raise RuntimeError("未检测到可用的 AI 配置（可使用 OPENAI_API_KEY，或复用 ~/.codex/config.toml + CODEX_API_KEY）。")

    last_error: Exception | None = None
    max_attempts = max(1, min(_get_positive_int_env('YSXS_AI_RETRY_ATTEMPTS', 3), 5))
    response = None
    content = ''
    usage_payload: dict[str, int] = {}

    for attempt in range(1, max_attempts + 1):
        try:
            if client_config['wire_api'] == 'responses':
                response = requests.post(
                    f"{client_config['base_url'].rstrip('/')}/responses",
                    headers={
                        "Authorization": f"Bearer {client_config['api_key']}",
                        "Content-Type": "application/json",
                        "Accept": "application/json, text/event-stream, text/plain",
                    },
                    json={
                        "model": client_config['model'],
                        "input": [
                            {
                                "role": "system",
                                "content": [{"type": "input_text", "text": system_prompt}],
                            },
                            {
                                "role": "user",
                                "content": [{"type": "input_text", "text": prompt}],
                            },
                        ],
                        "stream": False,
                    },
                    timeout=(SMART_SEARCH_CONNECT_TIMEOUT, max(int(timeout), 1)),
                )
                response.raise_for_status()
                content, usage_payload = _extract_responses_http_result(response)
            else:
                response = requests.post(
                    f"{client_config['base_url'].rstrip('/')}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {client_config['api_key']}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": client_config['model'],
                        "temperature": 0.2,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt},
                        ],
                    },
                    timeout=(SMART_SEARCH_CONNECT_TIMEOUT, max(int(timeout), 1)),
                )
                response.raise_for_status()
                payload = response.json()
                content = _extract_chat_completion_text(payload)
                usage_payload = _extract_usage_payload(payload)
            break
        except requests.RequestException as exc:
            last_error = exc
            status_code = getattr(getattr(exc, 'response', None), 'status_code', None)
            retryable = status_code in {408, 409, 425, 429, 500, 502, 503, 504} or status_code is None
            if attempt >= max_attempts or not retryable:
                break
            wait_seconds = min(8, attempt * 2)
            _get_logger().warning(
                "AI 调用失败，第 %s/%s 次重试，status=%s, error=%s",
                attempt,
                max_attempts,
                status_code,
                exc,
            )
            time.sleep(wait_seconds)

    if last_error and not content:
        raise RuntimeError(f"AI 服务暂时不可用，请稍后重试：{last_error}")

    _record_ai_usage(
        client_config,
        system_prompt=system_prompt,
        prompt=prompt,
        response_text=content,
        usage_payload=usage_payload,
        usage_context=usage_context,
    )
    return content


def _extract_usage_payload(payload: dict[str, Any] | None) -> dict[str, int]:
    if not isinstance(payload, dict):
        return {}
    usage = payload.get('usage')
    if not isinstance(usage, dict):
        return {}
    prompt_tokens = _safe_int(
        usage.get('prompt_tokens')
        or usage.get('input_tokens')
        or usage.get('prompt_token_count')
    ) or 0
    completion_tokens = _safe_int(
        usage.get('completion_tokens')
        or usage.get('output_tokens')
        or usage.get('completion_token_count')
    ) or 0
    total_tokens = _safe_int(usage.get('total_tokens') or usage.get('total_token_count')) or 0
    if total_tokens <= 0:
        total_tokens = prompt_tokens + completion_tokens
    return {
        'prompt_tokens': max(prompt_tokens, 0),
        'completion_tokens': max(completion_tokens, 0),
        'total_tokens': max(total_tokens, 0),
    }


def _estimate_token_count(text: str | None) -> int:
    cleaned = str(text or '').strip()
    if not cleaned:
        return 0
    return max(1, math.ceil(len(cleaned) / 4))


def _record_ai_usage(
    client_config: dict[str, Any],
    *,
    system_prompt: str,
    prompt: str,
    response_text: str,
    usage_payload: dict[str, int] | None = None,
    usage_context: dict[str, Any] | None = None,
) -> None:
    if not has_app_context():
        return
    try:
        prompt_tokens = _safe_int((usage_payload or {}).get('prompt_tokens')) or 0
        completion_tokens = _safe_int((usage_payload or {}).get('completion_tokens')) or 0
        total_tokens = _safe_int((usage_payload or {}).get('total_tokens')) or 0
        usage_source = 'reported'

        request_chars = len(system_prompt or '') + len(prompt or '')
        response_chars = len(response_text or '')

        if prompt_tokens <= 0:
            prompt_tokens = _estimate_token_count(f"{system_prompt}\n{prompt}")
            usage_source = 'estimated'
        if completion_tokens <= 0:
            completion_tokens = _estimate_token_count(response_text)
            usage_source = 'estimated'
        if total_tokens <= 0:
            total_tokens = prompt_tokens + completion_tokens
            usage_source = 'estimated'

        scene = str((usage_context or {}).get('scene') or 'general').strip()[:64] or 'general'
        user_id = _safe_int((usage_context or {}).get('user_id'))

        with db.engine.begin() as connection:
            connection.execute(
                AIUsageLog.__table__.insert().values(
                    created_at=utc_now(),
                    user_id=user_id,
                    scene=scene,
                    model=str(client_config.get('model') or '').strip()[:120] or None,
                    wire_api=str(client_config.get('wire_api') or '').strip()[:32] or None,
                    usage_source=usage_source,
                    prompt_tokens=max(prompt_tokens, 0),
                    completion_tokens=max(completion_tokens, 0),
                    total_tokens=max(total_tokens, 0),
                    request_chars=max(request_chars, 0),
                    response_chars=max(response_chars, 0),
                )
            )
    except Exception as exc:
        _get_logger().warning("记录 AI Token 用量失败：%s", exc)


def mark_morning_report_popup_seen(user_id: int, report_date: str | None = None) -> None:
    settings = ensure_morning_report_settings(user_id)
    settings.last_popup_seen_date = report_date or today_cn_date()
    db.session.commit()


def start_morning_report_scheduler(app: Flask) -> None:
    global _scheduler_started

    if app.debug and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        return

    with _scheduler_lock:
        if _scheduler_started:
            return

        thread = threading.Thread(
            target=_scheduler_worker,
            args=(app,),
            name="ysxs-morning-report-scheduler",
            daemon=True,
        )
        thread.start()
        _scheduler_started = True
        app.logger.info("晨报后台调度器已启动。")


def _scheduler_worker(app: Flask) -> None:
    while True:
        try:
            with app.app_context():
                run_pending_morning_reports()
        except Exception as exc:
            app.logger.exception("晨报后台任务执行失败: %s", exc)
        time.sleep(300)


def run_pending_morning_reports() -> None:
    now = cn_now()
    settings_list = (
        MorningReportSettings.query
        .filter_by(enabled=True, auto_run_enabled=True)
        .all()
    )
    for settings in settings_list:
        try:
            if now.hour < int(settings.auto_run_hour or 8):
                continue
            run = MorningReportRun.query.filter_by(user_id=settings.user_id, report_date=today_cn_date()).first()
            if run and run.status == 'ready' and run.paper_count > 0:
                continue
            generate_morning_report_for_user(settings.user_id, trigger_source='auto', force=True)
        except Exception as exc:
            _get_logger().exception("后台生成用户 %s 的晨报失败: %s", settings.user_id, exc)


def normalize_doi(raw: str | None) -> str | None:
    if raw is None:
        return None
    value = str(raw).strip()
    if not value:
        return None
    value = value.replace("https://doi.org/", "").replace("http://doi.org/", "")
    value = value.replace("doi:", "").strip()
    value = "".join(value.split())
    return value or None


def reconstruct_openalex_abstract(inverted_index: dict[str, list[int]] | None) -> str | None:
    if not inverted_index:
        return None
    tokens: dict[int, str] = {}
    for word, positions in inverted_index.items():
        for position in positions:
            tokens[position] = word
    if not tokens:
        return None
    return " ".join(tokens[index] for index in sorted(tokens))


def clean_crossref_abstract(value: str | None) -> str | None:
    if not value:
        return None
    text = re.sub(r"<[^>]+>", " ", value)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def sanitize_publication_date(value: str | None) -> str | None:
    if not value:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    try:
        published_date = datetime.fromisoformat(raw[:10]).date()
    except ValueError:
        return None
    today = cn_now().date()
    if published_date.year < 1900:
        return None
    if published_date > (today + timedelta(days=45)):
        return None
    return published_date.isoformat()


def sanitize_publication_year(value: int | None, *, published_at: str | None = None) -> int | None:
    if published_at:
        try:
            return datetime.fromisoformat(published_at[:10]).year
        except ValueError:
            pass
    if value is None:
        return None
    try:
        year = int(value)
    except (TypeError, ValueError):
        return None
    current_year = cn_now().year
    if year < 1900 or year > current_year + 1:
        return None
    return year


def extract_crossref_date(item: dict[str, Any]) -> str | None:
    for key in ("published-print", "published-online", "issued", "created"):
        value = _as_dict(item.get(key))
        parts = value.get("date-parts", [])
        if not parts or not parts[0]:
            continue
        date_parts = parts[0]
        year = date_parts[0]
        month = date_parts[1] if len(date_parts) > 1 else 1
        day = date_parts[2] if len(date_parts) > 2 else 1
        return sanitize_publication_date(f"{year:04d}-{month:02d}-{day:02d}")
    return None


def build_paper_dedupe_key(item: dict[str, Any]) -> str:
    title = re.sub(r"\s+", " ", str(item.get('title') or '').strip().lower())
    year = sanitize_publication_year(_safe_int(item.get('year')), published_at=item.get('published_at'))
    if title:
        if year:
            return f"title::{title}::{year}"
        return f"title::{title}"
    doi = normalize_doi(item.get('doi'))
    if doi:
        return f"doi::{doi.lower()}"
    source = str(item.get('source') or '').strip().lower()
    return f"{source}::{title}"


def normalize_discovered_paper(item: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None

    paper = dict(item)
    paper['title'] = str(paper.get('title') or '').strip()
    if not paper['title']:
        return None
    paper['published_at'] = sanitize_publication_date(paper.get('published_at'))
    paper['year'] = sanitize_publication_year(paper.get('year'), published_at=paper.get('published_at'))
    paper['matched_keywords'] = [str(value).strip() for value in (paper.get('matched_keywords') or []) if str(value).strip()]
    paper['topics'] = [str(value).strip() for value in (paper.get('topics') or []) if str(value).strip()]
    paper['authors'] = [str(value).strip() for value in (paper.get('authors') or []) if str(value).strip()]
    paper['journal'] = str(paper.get('journal') or '').strip() or None
    paper['abstract'] = str(paper.get('abstract') or '').strip() or None
    paper['doi'] = normalize_doi(paper.get('doi'))
    return paper


def normalize_title_key(raw: str | None) -> str:
    value = re.sub(r"\s+", " ", str(raw or "").strip()).lower()
    return value


def build_user_document_lookup(user_id: int) -> dict[str, dict[Any, int]]:
    doi_map: dict[str, int] = {}
    title_map: dict[str, int] = {}
    title_year_map: dict[tuple[int, str], int] = {}

    rows = (
        db.session.query(Document.id, Document.doi, Document.title, Document.year)
        .filter(Document.owner_id == user_id)
        .all()
    )
    for document_id, doi, title, year in rows:
        normalized_doi = normalize_doi(doi)
        if normalized_doi:
            doi_map.setdefault(normalized_doi.lower(), int(document_id))

        normalized_title = normalize_title_key(title)
        if not normalized_title:
            continue
        title_map.setdefault(normalized_title, int(document_id))
        normalized_year = sanitize_publication_year(year)
        if normalized_year:
            title_year_map.setdefault((normalized_year, normalized_title), int(document_id))

    return {
        'doi_map': doi_map,
        'title_map': title_map,
        'title_year_map': title_year_map,
    }


def find_existing_document_id_from_lookup(
    document_lookup: dict[str, Any] | None,
    *,
    doi: str | None = None,
    title: str | None = None,
    year: int | None = None,
) -> int | None:
    if not document_lookup:
        return None

    doi_map = document_lookup.get('doi_map') or {}
    normalized_doi = normalize_doi(doi)
    if normalized_doi:
        existing_id = doi_map.get(normalized_doi.lower())
        if existing_id:
            return int(existing_id)

    normalized_title = normalize_title_key(title)
    if not normalized_title:
        return None

    normalized_year = sanitize_publication_year(year)
    if normalized_year:
        existing_id = (document_lookup.get('title_year_map') or {}).get((normalized_year, normalized_title))
        if existing_id:
            return int(existing_id)

    existing_id = (document_lookup.get('title_map') or {}).get(normalized_title)
    if existing_id:
        return int(existing_id)
    return None


def filter_existing_library_papers(
    items: list[dict[str, Any]],
    *,
    document_lookup: dict[str, Any] | None,
) -> tuple[list[dict[str, Any]], int]:
    if not items:
        return [], 0
    filtered: list[dict[str, Any]] = []
    removed_count = 0
    for item in items:
        existing_id = find_existing_document_id_from_lookup(
            document_lookup,
            doi=item.get('doi'),
            title=item.get('title'),
            year=_safe_int(item.get('year')),
        )
        if existing_id:
            removed_count += 1
            continue
        filtered.append(item)
    return filtered, removed_count


def find_existing_document_for_user(
    user_id: int,
    *,
    doi: str | None = None,
    title: str | None = None,
    year: int | None = None,
    document_lookup: dict[str, Any] | None = None,
) -> Document | None:
    if document_lookup is not None:
        existing_id = find_existing_document_id_from_lookup(
            document_lookup,
            doi=doi,
            title=title,
            year=year,
        )
        if existing_id:
            return db.session.get(Document, existing_id)
        return None

    normalized_doi = normalize_doi(doi)
    if normalized_doi:
        existing = Document.query.filter(
            Document.owner_id == user_id,
            func.lower(Document.doi) == normalized_doi.lower(),
        ).first()
        if existing:
            return existing

    normalized_title = normalize_title_key(title)
    if not normalized_title:
        return None

    query = Document.query.filter(Document.owner_id == user_id)
    normalized_year = sanitize_publication_year(year)
    if normalized_year:
        query = query.filter(Document.year == normalized_year)

    for candidate in query.all():
        if normalize_title_key(candidate.title) == normalized_title:
            return candidate
    return None


def should_keep_paper(
    item: dict[str, Any],
    *,
    keywords: list[str],
    strict_filter_enabled: bool,
    exclude_keywords: list[str],
) -> bool:
    haystack = build_filter_haystack(item)
    if not haystack:
        return False
    title_haystack = build_title_haystack(item)

    blocklist = list(DEFAULT_STRICT_BLOCKLIST) + [value.lower() for value in exclude_keywords if value.strip()]
    if any(term and haystack_matches_term(haystack, term) for term in blocklist):
        return False

    keyword_matches = item.get('matched_keywords') or []
    phrase_match_count = len(keyword_matches)
    anchor_terms = derive_anchor_terms(keywords)
    anchor_hits = sum(1 for term in anchor_terms if term and term in haystack)
    directional_terms = derive_directional_terms(keywords)
    directional_hits = sum(1 for term in directional_terms if term and term in haystack)
    title_directional_hits = sum(1 for term in directional_terms if term and haystack_matches_term(title_haystack, term))
    context_hits = sum(1 for term in STRICT_CONTEXT_TERMS if haystack_matches_term(haystack, term))
    title_context_hits = sum(1 for term in STRICT_CONTEXT_TERMS if haystack_matches_term(title_haystack, term))
    suspect_hits = sum(1 for term in DEFAULT_STRICT_SUSPECT_TERMS if haystack_matches_term(title_haystack, term))
    title_domain_hits = count_domain_pattern_hits(title_haystack)
    priority_bonus = compute_priority_source_bonus(item)
    score = float(item.get('relevance_score') or 0.0) + priority_bonus

    if strict_filter_enabled:
        if suspect_hits > 0:
            return False
        if phrase_match_count <= 0 and directional_hits <= 0 and anchor_hits <= 0:
            return False
        if context_hits <= 0 and title_context_hits <= 0 and priority_bonus <= 0:
            return False
        if title_domain_hits <= 0 and title_directional_hits <= 0 and phrase_match_count <= 0 and priority_bonus <= 0:
            return False
        if phrase_match_count <= 0 and anchor_hits <= 0 and score < 1.2:
            return False
        if directional_hits <= 0 and title_directional_hits <= 0 and phrase_match_count < 2 and score < 1.45:
            return False
        if score < 1.0:
            return False
    else:
        if phrase_match_count <= 0 and score < 0.8:
            return False

    return True


def build_filter_haystack(item: dict[str, Any]) -> str:
    parts: list[str] = [
        str(item.get('title') or ''),
        str(item.get('abstract') or ''),
        str(item.get('journal') or ''),
    ]
    parts.extend(str(value) for value in (item.get('topics') or []))
    return " ".join(parts).lower().strip()


def build_title_haystack(item: dict[str, Any]) -> str:
    parts: list[str] = [
        str(item.get('title') or ''),
        str(item.get('journal') or ''),
    ]
    parts.extend(str(value) for value in (item.get('topics') or []))
    return " ".join(parts).lower().strip()


def haystack_matches_term(haystack: str, term: str) -> bool:
    if not haystack or not term:
        return False
    normalized_haystack = haystack.lower()
    normalized_term = term.strip().lower()
    if not normalized_term:
        return False
    if re.search(r'[\u4e00-\u9fff]', normalized_term):
        return normalized_term in normalized_haystack
    pattern = rf'(?<![a-z0-9]){re.escape(normalized_term)}(?![a-z0-9])'
    return re.search(pattern, normalized_haystack) is not None


def count_domain_pattern_hits(text: str) -> int:
    if not text:
        return 0
    normalized = text.lower()
    return sum(1 for pattern in STRICT_DOMAIN_PATTERNS if re.search(pattern, normalized))


def derive_anchor_terms(keywords: list[str]) -> list[str]:
    anchors: list[str] = []
    seen: set[str] = set()
    for keyword in keywords:
        value = str(keyword or '').strip().lower()
        if not value:
            continue
        if re.search(r'[\u4e00-\u9fff]', value):
            tokens = [value]
        else:
            tokens = re.findall(r"[a-z0-9-]+", value)
        for token in tokens:
            token = token.strip().lower()
            if not token or token in seen:
                continue
            if token in GENERIC_RESEARCH_TOKENS:
                continue
            if len(token) < 3 and not re.search(r'[\u4e00-\u9fff]', token):
                continue
            seen.add(token)
            anchors.append(token)
    return anchors


def derive_directional_terms(keywords: list[str]) -> list[str]:
    directional: list[str] = []
    seen: set[str] = set()
    for keyword in keywords:
        value = str(keyword or '').strip().lower()
        if not value:
            continue
        if re.search(r'[\u4e00-\u9fff]', value):
            tokens = re.split(r'[\s,，;；/、]+', value)
        else:
            tokens = re.findall(r"[a-z0-9-]+", value)
        for token in tokens:
            token = token.strip().lower()
            if not token or token in seen:
                continue
            if token in SOURCE_QUERY_CONTEXT_TOKENS:
                continue
            if token in {"research", "study", "studies", "data", "processing", "reprocessing", "latest", "new", "deep"}:
                continue
            if len(token) < 2 and not re.search(r'[\u4e00-\u9fff]', token):
                continue
            seen.add(token)
            directional.append(token)
    return directional


def build_openalex_queries(keywords: list[str]) -> list[str]:
    return build_focus_queries(
        keywords,
        preferred_patterns=(r'moonquake', r'lunar seismic', r'lunar seismology', r'lunar interior', r'apollo'),
        fallback_queries=['deep moonquake', 'shallow moonquake', 'lunar seismic', 'lunar seismology', 'lunar interior structure', 'apollo passive seismic', 'apollo seismic data', 'lunar mantle core'],
        limit=8,
    )


def build_arxiv_queries(keywords: list[str]) -> list[str]:
    return build_focus_queries(
        keywords,
        preferred_patterns=(r'moonquake', r'lunar seismic', r'lunar seismology', r'lunar interior', r'apollo'),
        fallback_queries=['deep moonquake', 'shallow moonquake', 'lunar seismic', 'lunar seismology', 'lunar interior structure', 'apollo passive seismic', 'apollo seismic data', 'lunar mantle core'],
        limit=8,
    )


def build_crossref_queries(keywords: list[str]) -> list[str]:
    return build_focus_queries(
        keywords,
        preferred_patterns=(r'moonquake', r'lunar seismic', r'lunar interior', r'apollo'),
        fallback_queries=['deep moonquake', 'shallow moonquake', 'lunar seismic', 'lunar seismology', 'lunar interior structure', 'apollo passive seismic', 'apollo seismic data', 'lunar mantle core'],
        limit=8,
    )


def build_focus_queries(
    keywords: list[str],
    *,
    preferred_patterns: tuple[str, ...],
    fallback_queries: list[str],
    limit: int,
) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for keyword in keywords:
        value = str(keyword or '').strip()
        if not value or re.search(r'[\u4e00-\u9fff]', value):
            continue
        normalized = value.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        cleaned.append(value)

    queries: list[str] = []
    for pattern in preferred_patterns:
        for keyword in cleaned:
            if re.search(pattern, keyword, flags=re.IGNORECASE):
                queries.append(keyword)

    queries.extend(fallback_queries)
    if not queries:
        queries = ['deep moonquake', 'shallow moonquake', 'lunar seismic', 'lunar interior structure', 'apollo passive seismic']

    unique_queries: list[str] = []
    query_seen: set[str] = set()
    for query in queries:
        value = re.sub(r'\s+', ' ', str(query or '').strip())
        if not value:
            continue
        normalized = value.lower()
        if normalized in query_seen:
            continue
        query_seen.add(normalized)
        unique_queries.append(value)
        if len(unique_queries) >= max(1, limit):
            break
    return unique_queries or ['deep moonquake']


def build_nasa_ads_query(keywords: list[str]) -> str:
    queries = build_arxiv_queries(keywords)
    joined = " OR ".join(f'"{query}"' for query in queries if query)
    if not joined:
        joined = '"moonquake" OR "lunar interior"'
    return f"({joined}) AND (abstract:lunar OR abstract:moon OR title:lunar OR title:moon OR abstract:apollo OR title:apollo)"


def _fetch_openalex_results_for_query(query: str, since_date: str, limit: int) -> list[dict[str, Any]]:
    response = requests.get(
        OPENALEX_WORKS_URL,
        params={
            "search": query,
            "filter": f"from_publication_date:{since_date},has_abstract:true",
            "sort": "publication_date:desc",
            "per-page": max(1, min(limit, 50)),
        },
        headers={"User-Agent": "yshome-morning-report/1.0"},
        timeout=30,
    )
    response.raise_for_status()
    payload = _as_dict(response.json())
    return [item for item in _as_list(payload.get("results")) if isinstance(item, dict)]


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _compute_recency_bonus(published_at: str) -> float:
    try:
        published_date = datetime.fromisoformat(published_at[:10]).date()
    except ValueError:
        return 0.0
    delta_days = max((cn_now().date() - published_date).days, 0)
    if delta_days <= 7:
        return 2.0
    if delta_days <= 30:
        return 1.2
    if delta_days <= 90:
        return 0.5
    return 0.0


def _extract_year_from_dates(item: dict[str, Any]) -> int | None:
    for key in ("published-print", "published-online", "issued", "created"):
        value = _as_dict(item.get(key))
        parts = value.get("date-parts", [])
        if parts and parts[0]:
            return _safe_int(parts[0][0])
    return None


def _safe_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def classify_candidate_track(item: dict[str, Any], *, keywords: list[str] | None = None) -> dict[str, Any]:
    haystack = build_filter_haystack(item)
    title_haystack = build_title_haystack(item)
    if not haystack:
        return {'label': 'off_topic', 'reason': '缺少足够的题录信息，无法判断方向。', 'confidence': 0}

    if not any(haystack_matches_term(haystack, term) for term in LUNAR_CORE_TERMS):
        return {'label': 'off_topic', 'reason': '没有明确出现月球 / 月震 / 阿波罗相关核心语义。', 'confidence': 12}

    scores: dict[str, int] = {}
    reasons: dict[str, str] = {}
    for label, terms in TRACK_RULE_TERMS.items():
        title_hits = sum(2 for term in terms if haystack_matches_term(title_haystack, term))
        body_hits = sum(1 for term in terms if haystack_matches_term(haystack, term))
        score = title_hits + body_hits
        scores[label] = score
        if score > 0:
            reasons[label] = f"命中 {score} 个“{RESEARCH_TRACK_LABELS.get(label, label)}”相关线索。"

    best_label = max(scores, key=scores.get)
    best_score = scores.get(best_label, 0)
    if best_score <= 0:
        return {'label': 'off_topic', 'reason': '虽然与月球相关，但不属于月震 / 月球内部结构 / 阿波罗数据再处理三类。', 'confidence': 28}

    confidence = min(40 + best_score * 12, 92)
    return {
        'label': best_label,
        'reason': reasons.get(best_label) or '规则筛选命中研究方向。',
        'confidence': confidence,
    }


def classify_candidate_with_optional_ai(
    item: dict[str, Any],
    *,
    keywords: list[str] | None = None,
    use_ai: bool = True,
    user_id: int | None = None,
) -> dict[str, Any]:
    fallback = classify_candidate_track(item, keywords=keywords)
    if not use_ai or not get_ai_client_config():
        return fallback

    try:
        ai_results = classify_candidate_papers_with_ai([item], keywords=keywords or [], user_id=user_id)
    except Exception as exc:
        _get_logger().warning("AI 单篇方向判定失败，回退到规则判定：%s", exc)
        return fallback

    ai_result = ai_results.get(1)
    if not ai_result:
        return fallback
    label = ai_result.get('label')
    if label not in RESEARCH_TRACK_LABELS:
        return fallback
    return {
        'label': label,
        'reason': ai_result.get('reason') or fallback.get('reason'),
        'confidence': ai_result.get('confidence') or fallback.get('confidence'),
    }


def classify_candidate_papers_with_ai(
    candidates: list[dict[str, Any]],
    *,
    keywords: list[str],
    user_id: int | None = None,
) -> dict[int, dict[str, Any]]:
    if not candidates:
        return {}

    candidate_blocks: list[str] = []
    for index, item in enumerate(candidates, start=1):
        title = str(item.get('title') or '').strip() or 'Untitled'
        abstract = re.sub(r'\s+', ' ', str(item.get('abstract') or '').strip())[:1800] or '暂无摘要'
        journal = str(item.get('journal') or '').strip() or '未知来源'
        topics = "、".join(str(value).strip() for value in (item.get('topics') or []) if str(value).strip()) or '无'
        candidate_blocks.append(
            f"[{index}]\n"
            f"标题：{title}\n"
            f"来源：{journal}\n"
            f"主题：{topics}\n"
            f"摘要：{abstract}\n"
        )

    prompt = (
        "你是科研晨报的严格选题筛选器。只允许保留以下三类论文：\n"
        "1. moonquake：月震、月球地震记录、月震定位、月震波形、月震机制。\n"
        "2. lunar_interior：月球内部结构、深部结构、壳幔核、由地震/地球物理约束的月球内部研究。\n"
        "3. apollo_reprocessing：阿波罗地震/相关历史数据的再处理、重分析、重建、重新定位。\n"
        "其余一律标注 off_topic，包括但不限于：一般月表地质、遥感、月球工程、着陆器、行星泛论、火星/地球研究、纯方法论文。\n\n"
        f"当前关键词库：{'、'.join(keywords) or '未提供'}\n\n"
        "请输出 JSON 数组，每个元素格式如下：\n"
        "{\"index\": 1, \"label\": \"moonquake|lunar_interior|apollo_reprocessing|off_topic\", \"confidence\": 0-100, \"reason\": \"一句中文理由\"}\n"
        "不要输出数组之外的解释文字。\n\n"
        + "\n".join(candidate_blocks)
    )
    system_prompt = "你是严格的月球地球物理文献筛选助手，只做分类，不做发挥。"
    content = call_ai_text(
        system_prompt,
        prompt,
        timeout=120,
        usage_context={'scene': 'research_scope_filter', 'user_id': user_id},
    )
    payload = _extract_json_payload(content)
    if not isinstance(payload, list):
        raise RuntimeError("AI 筛选结果不是 JSON 数组。")

    results: dict[int, dict[str, Any]] = {}
    for item in payload:
        if not isinstance(item, dict):
            continue
        index = _safe_int(item.get('index'))
        if index is None or index < 1 or index > len(candidates):
            continue
        label = str(item.get('label') or '').strip()
        if label not in RESEARCH_TRACK_LABELS:
            continue
        confidence = _safe_int(item.get('confidence'))
        results[index] = {
            'label': label,
            'confidence': max(0, min(confidence if confidence is not None else 60, 100)),
            'reason': str(item.get('reason') or '').strip()[:200] or 'AI 已完成方向筛选。',
        }
    return results


def _extract_json_payload(raw_text: str) -> Any:
    text = str(raw_text or '').strip()
    if not text:
        raise RuntimeError("AI 返回为空，无法解析筛选结果。")

    fence_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', text, flags=re.IGNORECASE)
    if fence_match:
        text = fence_match.group(1).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    for pattern in (r'(\[[\s\S]*\])', r'(\{[\s\S]*\})'):
        match = re.search(pattern, text)
        if not match:
            continue
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            continue

    raise RuntimeError(f"AI 返回的筛选结果无法解析为 JSON：{text[:240]}")


def _extract_chat_completion_text(payload: dict[str, Any]) -> str:
    choices = payload.get("choices", [])
    if not choices:
        return ""
    message = choices[0].get("message", {})
    content = message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts: list[str] = []
        for item in content:
            if isinstance(item, str):
                texts.append(item)
            elif isinstance(item, dict):
                text = item.get("text") or item.get("content")
                if text:
                    texts.append(str(text))
        return "\n".join(texts).strip()
    return ""


def _extract_responses_http_result(response: requests.Response) -> tuple[str, dict[str, int]]:
    content_type = str(response.headers.get("content-type") or "").lower()
    body = response.text or ""

    if "application/json" in content_type:
        try:
            payload = response.json()
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"AI 返回的 JSON 无法解析：{exc}") from exc
        return _extract_responses_text(payload), _extract_usage_payload(payload)

    if "text/event-stream" in content_type or "text/plain" in content_type or body.lstrip().startswith("event:"):
        return _extract_responses_sse_result(body)

    raise RuntimeError(f"AI 返回了无法识别的响应格式：{content_type or 'unknown'}")


def _extract_responses_text(payload: dict[str, Any]) -> str:
    output_text = payload.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    texts: list[str] = []
    for item in payload.get("output", []):
        if not isinstance(item, dict):
            continue
        for content in item.get("content", []):
            if not isinstance(content, dict):
                continue
            if content.get("type") in {"output_text", "text"} and content.get("text"):
                texts.append(str(content["text"]))
    return "\n".join(texts).strip()


def _extract_responses_sse_result(raw_text: str) -> tuple[str, dict[str, int]]:
    if not raw_text.strip():
        raise RuntimeError("AI 返回为空。")

    deltas: list[str] = []
    completed_payload: dict[str, Any] | None = None
    error_message: str | None = None

    for block in raw_text.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        data_lines = [line[5:].strip() for line in block.splitlines() if line.startswith("data:")]
        if not data_lines:
            continue
        data_text = "\n".join(data_lines).strip()
        if not data_text or data_text == "[DONE]":
            continue
        try:
            payload = json.loads(data_text)
        except json.JSONDecodeError:
            continue

        event_type = str(payload.get("type") or "")
        if event_type == "response.output_text.delta":
            delta = payload.get("delta")
            if isinstance(delta, str):
                deltas.append(delta)
            continue
        if event_type == "response.completed":
            completed_payload = payload.get("response") if isinstance(payload.get("response"), dict) else payload
            continue
        if "error" in payload and payload.get("error"):
            error_message = str(payload.get("error"))

    content = "".join(deltas).strip()
    if content:
        return content, _extract_usage_payload(completed_payload)

    if completed_payload:
        content = _extract_responses_text(completed_payload)
        if content:
            return content, _extract_usage_payload(completed_payload)

    if error_message:
        raise RuntimeError(f"AI 返回错误：{error_message}")

    snippet = raw_text[:300].replace("\n", "\\n")
    raise RuntimeError(f"AI 返回了无法提取文本的 SSE 响应：{snippet}")


def _load_codex_cli_config() -> dict[str, str] | None:
    config_path = Path.home() / '.codex' / 'config.toml'
    if not config_path.exists():
        return None
    try:
        with config_path.open('rb') as fh:
            raw = tomllib.load(fh)
    except Exception:
        return None

    provider_key = str(raw.get('model_provider') or 'codex')
    providers = raw.get('model_providers') or {}
    provider = providers.get(provider_key) or {}
    if not provider:
        return None

    return {
        'base_url': str(provider.get('base_url') or '').strip(),
        'env_key': str(provider.get('env_key') or '').strip(),
        'wire_api': str(provider.get('wire_api') or 'responses').strip(),
        'model': str(raw.get('model') or '').strip(),
    }


__all__ = [
    'SUPPORTED_SOURCES',
    'DISPLAY_ONLY_SOURCE_REGISTRY',
    'get_display_only_sources',
    'build_display_source_links',
    'ensure_morning_report_settings',
    'ensure_due_morning_report_for_user',
    'trigger_due_morning_report_in_background',
    'ai_summary_available',
    'find_existing_document_for_user',
    'get_ai_client_config',
    'get_nasa_ads_api_token',
    'get_today_morning_report',
    'is_morning_report_generation_running',
    'get_recent_morning_reports',
    'generate_morning_report_for_user',
    'load_runtime_ai_config',
    'save_runtime_ai_config',
    'search_literature_with_ai',
    'summarize_document_with_ai',
    'summarize_paper_with_ai',
    'get_morning_report_popup_payload',
    'mark_morning_report_popup_seen',
    'run_pending_morning_reports',
    'start_morning_report_scheduler',
]
