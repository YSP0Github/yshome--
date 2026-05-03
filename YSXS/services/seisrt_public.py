from __future__ import annotations

import json
import math
import os
import re
import tempfile
import threading
import time
from html import unescape
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import requests
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_VAR_DIR = PROJECT_ROOT.parent / "var" / "seisrt"

USGS_DAY_FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
EMSC_QUERY = "https://www.seismicportal.eu/fdsnws/event/1/query"
IRIS_TIMESERIES = "https://service.iris.edu/irisws/timeseries/1/query"
CNDC_CENC_REPORT = "https://data.earthquake.cn/datashare/report.shtml"
CNDC_CENC_PAGE = "earthquake_subao"
AMAP_REGEOCODE_URL = "https://restapi.amap.com/v3/geocode/regeo"

CATALOG_TTL_SECONDS = int(os.environ.get("YSXS_SEISRT_CATALOG_TTL_SECONDS", "180"))
STATION_TTL_SECONDS = int(os.environ.get("YSXS_SEISRT_STATION_TTL_SECONDS", "3"))
SCHEDULER_INTERVAL_SECONDS = int(os.environ.get("YSXS_SEISRT_SCHEDULER_INTERVAL_SECONDS", "60"))
REQUEST_TIMEOUT_SECONDS = float(os.environ.get("YSXS_SEISRT_REQUEST_TIMEOUT_SECONDS", "12"))
MAX_EVENTS = int(os.environ.get("YSXS_SEISRT_MAX_EVENTS", "80"))
MAX_SNAPSHOT_POINTS = int(os.environ.get("YSXS_SEISRT_MAX_SNAPSHOT_POINTS", "1200"))
AMAP_WEB_KEY = (
    os.environ.get("YSXS_AMAP_WEB_KEY")
    or os.environ.get("AMAP_WEB_KEY")
    or os.environ.get("AMAP_KEY")
    or ""
).strip()
AMAP_REGEOCODE_TIMEOUT_SECONDS = float(os.environ.get("YSXS_SEISRT_AMAP_TIMEOUT_SECONDS", "3"))
AMAP_REGEOCODE_CACHE_TTL_SECONDS = int(os.environ.get("YSXS_SEISRT_AMAP_CACHE_TTL_SECONDS", str(30 * 24 * 3600)))
MAX_AMAP_REGEOCODE_PER_REFRESH = int(os.environ.get("YSXS_SEISRT_MAX_AMAP_REGEOCODE_PER_REFRESH", "30"))

STATION_CONFIG = {
    "network": os.environ.get("YSXS_SEISRT_NETWORK", "IU").strip() or "IU",
    "station": os.environ.get("YSXS_SEISRT_STATION", "TATO").strip() or "TATO",
    "location": os.environ.get("YSXS_SEISRT_LOCATION", "00").strip() or "00",
    "channel": os.environ.get("YSXS_SEISRT_CHANNEL", "BHZ").strip() or "BHZ",
    "window_seconds": int(os.environ.get("YSXS_SEISRT_WINDOW_SECONDS", "300")),
    "data_delay_seconds": int(os.environ.get("YSXS_SEISRT_DATA_DELAY_SECONDS", "60")),
    "trigger_threshold": float(os.environ.get("YSXS_SEISRT_TRIGGER_THRESHOLD", "4.0")),
}

_lock = threading.RLock()
_scheduler_started = False


def _var_dir() -> Path:
    path = Path(os.environ.get("YSXS_SEISRT_VAR_DIR", str(DEFAULT_VAR_DIR))).expanduser()
    path.mkdir(parents=True, exist_ok=True)
    return path


def _cache_path(name: str) -> Path:
    return _var_dir() / name


def _read_json(path: Path) -> dict[str, Any] | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except Exception:
        return None


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
        tmp_name = fh.name
    Path(tmp_name).replace(path)


def _now_ts() -> float:
    return time.time()


def _parse_iso_ts(value: str | None) -> float | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp()
    except ValueError:
        return None


def _text_or_empty(value: Any) -> str:
    if isinstance(value, list):
        value = next((item for item in value if item), "")
    if value is None:
        return ""
    return str(value).strip()


def _contains_cjk(value: str) -> bool:
    return bool(re.search(r"[\u4e00-\u9fff]", value or ""))


def _join_unique(parts: list[str], separator: str = "") -> str:
    result: list[str] = []
    for part in parts:
        text = _text_or_empty(part)
        if text and text not in result:
            result.append(text)
    return separator.join(result)


def _normalise_english_place(place: str) -> str:
    text = _text_or_empty(place)
    return "" if _contains_cjk(text) else text


def _normalise_chinese_place(place: str) -> str:
    text = _text_or_empty(place)
    return text if _contains_cjk(text) else ""


def _normalize_feature(feature: dict[str, Any], source: str) -> dict[str, Any] | None:
    props = feature.get("properties") or {}
    geom = feature.get("geometry") or {}
    coords = geom.get("coordinates") or []
    if len(coords) < 2:
        return None

    if source == "USGS":
        event_time = float(props.get("time") or 0) / 1000.0
        magnitude = props.get("mag")
        place = props.get("place") or "未命名区域"
        url = props.get("url") or ""
        event_id = feature.get("id") or f"usgs-{event_time:g}"
    else:
        event_time = _parse_iso_ts(props.get("time")) or 0.0
        magnitude = props.get("mag") or props.get("magnitude")
        place = props.get("flynn_region") or props.get("place") or props.get("region") or "未命名区域"
        url = props.get("source_catalog") or ""
        event_id = feature.get("id") or f"emsc-{event_time:g}"

    try:
        lon = float(coords[0])
        lat = float(coords[1])
        depth = float(coords[2]) if len(coords) > 2 and coords[2] is not None else None
        mag = float(magnitude) if magnitude is not None else 0.0
    except (TypeError, ValueError):
        return None

    if event_time <= 0:
        return None

    return {
        "id": f"{source.lower()}:{event_id}",
        "source": source,
        "type": "catalog",
        "station": source,
        "trace_id": source,
        "time": event_time,
        "origin_time": event_time,
        "p_pick_time": event_time,
        "magnitude": mag,
        "intensity": _estimate_intensity(mag),
        "place": place,
        "raw_place": place,
        "place_zh": _normalise_chinese_place(place),
        "place_en": _normalise_english_place(place),
        "latitude": lat,
        "longitude": lon,
        "depth_km": depth,
        "url": url,
        "ratio": None,
    }


def _estimate_intensity(magnitude: float) -> str:
    if magnitude < 3:
        return "I-II"
    if magnitude < 4:
        return "III"
    if magnitude < 5:
        return "IV-V"
    return "VI+"


def _dedupe_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[tuple[int, int, int, int], dict[str, Any]] = {}
    for event in events:
        key = (
            round(float(event["time"]) / 10),
            round(float(event["latitude"]) * 10),
            round(float(event["longitude"]) * 10),
            round(float(event["magnitude"]) * 10),
        )
        current = buckets.get(key)
        if current is None:
            buckets[key] = event
            continue
        if _source_priority(event) > _source_priority(current):
            buckets[key] = _merge_event_metadata(event, current)
        else:
            buckets[key] = _merge_event_metadata(current, event)

    result: list[dict[str, Any]] = []
    seen: set[tuple[int, int, int, int]] = set()
    for event in sorted(buckets.values(), key=lambda item: item["time"], reverse=True):
        key = (
            round(float(event["time"]) / 10),
            round(float(event["latitude"]) * 10),
            round(float(event["longitude"]) * 10),
            round(float(event["magnitude"]) * 10),
        )
        if key in seen:
            continue
        seen.add(key)
        result.append(event)
        if len(result) >= MAX_EVENTS:
            break
    return result


def _source_priority(event: dict[str, Any]) -> int:
    source = str(event.get("source") or "").upper()
    if source == "CENC":
        return 30
    if source == "EMSC":
        return 20
    if source == "USGS":
        return 10
    return 0


def _merge_event_metadata(base: dict[str, Any], extra: dict[str, Any]) -> dict[str, Any]:
    sources = list(dict.fromkeys([
        *(base.get("catalog_sources") or [base.get("source")]),
        *(extra.get("catalog_sources") or [extra.get("source")]),
    ]))
    base["catalog_sources"] = [str(item) for item in sources if item]
    for key in ("place_zh", "place_en"):
        if not base.get(key) and extra.get(key):
            base[key] = extra[key]
    for key in ("url", "event_type"):
        if not base.get(key) and extra.get(key):
            base[key] = extra[key]
    return base


def _roughly_in_china_bbox(lon: float, lat: float) -> bool:
    return 73.0 <= lon <= 135.5 and 3.0 <= lat <= 54.5


def _catalog_place_likely_china(place: str) -> bool:
    text = _text_or_empty(place)
    markers = (
        "中国", "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江",
        "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东",
        "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾", "内蒙古",
        "广西", "西藏", "宁夏", "新疆", "香港", "澳门", "渤海", "黄海", "东海",
        "南海", "钓鱼岛", "赤尾屿",
    )
    return any(marker in text for marker in markers)


def _transform_lat(lon: float, lat: float) -> float:
    ret = -100.0 + 2.0 * lon + 3.0 * lat + 0.2 * lat * lat + 0.1 * lon * lat + 0.2 * math.sqrt(abs(lon))
    ret += (20.0 * math.sin(6.0 * lon * math.pi) + 20.0 * math.sin(2.0 * lon * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lat * math.pi) + 40.0 * math.sin(lat / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (160.0 * math.sin(lat / 12.0 * math.pi) + 320.0 * math.sin(lat * math.pi / 30.0)) * 2.0 / 3.0
    return ret


def _transform_lon(lon: float, lat: float) -> float:
    ret = 300.0 + lon + 2.0 * lat + 0.1 * lon * lon + 0.1 * lon * lat + 0.1 * math.sqrt(abs(lon))
    ret += (20.0 * math.sin(6.0 * lon * math.pi) + 20.0 * math.sin(2.0 * lon * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lon * math.pi) + 40.0 * math.sin(lon / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (150.0 * math.sin(lon / 12.0 * math.pi) + 300.0 * math.sin(lon / 30.0 * math.pi)) * 2.0 / 3.0
    return ret


def _wgs84_to_gcj02_if_needed(lon: float, lat: float) -> tuple[float, float]:
    if not _roughly_in_china_bbox(lon, lat):
        return lon, lat
    a = 6378245.0
    ee = 0.00669342162296594323
    d_lat = _transform_lat(lon - 105.0, lat - 35.0)
    d_lon = _transform_lon(lon - 105.0, lat - 35.0)
    rad_lat = lat / 180.0 * math.pi
    magic = math.sin(rad_lat)
    magic = 1 - ee * magic * magic
    sqrt_magic = math.sqrt(magic)
    d_lat = (d_lat * 180.0) / ((a * (1 - ee)) / (magic * sqrt_magic) * math.pi)
    d_lon = (d_lon * 180.0) / (a / sqrt_magic * math.cos(rad_lat) * math.pi)
    return lon + d_lon, lat + d_lat


def _amap_cache_key(lon: float, lat: float) -> str:
    return f"{lon:.2f},{lat:.2f}"


def _load_amap_cache() -> dict[str, Any]:
    payload = _read_json(_cache_path("amap_regeo_cache.json")) or {}
    items = payload.get("items")
    if not isinstance(items, dict):
        items = {}
    return {"updated_at": payload.get("updated_at") or 0, "items": items}


def _fetch_amap_regeocode(lon: float, lat: float) -> dict[str, Any] | None:
    if not AMAP_WEB_KEY:
        return None
    query_lon, query_lat = _wgs84_to_gcj02_if_needed(lon, lat)
    response = requests.get(
        AMAP_REGEOCODE_URL,
        params={
            "key": AMAP_WEB_KEY,
            "location": f"{query_lon:.6f},{query_lat:.6f}",
            "radius": "10000",
            "extensions": "base",
            "output": "json",
        },
        timeout=min(REQUEST_TIMEOUT_SECONDS, AMAP_REGEOCODE_TIMEOUT_SECONDS),
    )
    response.raise_for_status()
    payload = response.json()
    if str(payload.get("status")) != "1":
        return {"ok": False, "info": _text_or_empty(payload.get("info"))}
    regeo = payload.get("regeocode") or {}
    component = regeo.get("addressComponent") or {}
    return {
        "ok": True,
        "formatted_address": _text_or_empty(regeo.get("formatted_address")),
        "country": _text_or_empty(component.get("country")),
        "province": _text_or_empty(component.get("province")),
        "city": _text_or_empty(component.get("city")),
        "district": _text_or_empty(component.get("district")),
        "township": _text_or_empty(component.get("township")),
        "adcode": _text_or_empty(component.get("adcode")),
    }


def _cached_amap_regeocode(lon: float, lat: float, cache: dict[str, Any], budget: dict[str, int]) -> dict[str, Any] | None:
    key = _amap_cache_key(lon, lat)
    now = _now_ts()
    cached = cache["items"].get(key)
    if cached and now - float(cached.get("updated_at", 0)) < AMAP_REGEOCODE_CACHE_TTL_SECONDS:
        return cached.get("result")
    if not AMAP_WEB_KEY or budget["remaining"] <= 0:
        return None
    budget["remaining"] -= 1
    try:
        result = _fetch_amap_regeocode(lon, lat)
    except Exception:
        return None
    cache["items"][key] = {"updated_at": now, "result": result}
    cache["dirty"] = True
    return result


def _place_from_amap(result: dict[str, Any], fallback: str = "") -> str:
    formatted = _text_or_empty(result.get("formatted_address"))
    country = _text_or_empty(result.get("country"))
    province = _text_or_empty(result.get("province"))
    city = _text_or_empty(result.get("city"))
    district = _text_or_empty(result.get("district"))
    township = _text_or_empty(result.get("township"))
    if country == "中国":
        label = _join_unique([province, city, district])
        if label:
            return f"{label}附近"
        if formatted:
            return formatted.removeprefix("中国") or formatted
    if formatted:
        return formatted
    label = _join_unique([country, province, city, district, township])
    return label or fallback


def _event_station_code(event: dict[str, Any]) -> str:
    return str(event.get("station") or event.get("trace_id") or "--")


def _apply_display_place(event: dict[str, Any]) -> dict[str, Any]:
    place_zh = _text_or_empty(event.get("place_zh"))
    place_en = _text_or_empty(event.get("place_en"))
    legacy_place = _text_or_empty(event.get("place"))
    if event.get("is_china") is True:
        display = place_zh or legacy_place or _event_station_code(event)
        event["display_place"] = display
        event["display_place_secondary"] = ""
        event["place"] = display
        return event
    if event.get("is_china") is False:
        en = place_en or (legacy_place if not _contains_cjk(legacy_place) else "")
        if not en:
            en = "Overseas earthquake"
        # If zh is empty or a generic placeholder, just show the English name
        _generic_zh = {"境外地震", "境外或未判定地区", ""}
        if place_zh in _generic_zh:
            display = en
        else:
            display = en if place_zh == en else f"{place_zh} / {en}"
        event["display_place"] = display
        event["display_place_secondary"] = en if place_zh and place_zh not in _generic_zh and en and place_zh != en else ""
        event["place"] = display
        return event

    if place_zh and place_en:
        display = f"{place_zh} / {place_en}"
    else:
        display = place_zh or place_en or legacy_place or _event_station_code(event)
    event["display_place"] = display
    event["display_place_secondary"] = ""
    event["place"] = display
    return event


def _enrich_event_regions(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cache = _load_amap_cache()
    budget = {"remaining": MAX_AMAP_REGEOCODE_PER_REFRESH}
    for event in events:
        try:
            lon = float(event["longitude"])
            lat = float(event["latitude"])
        except (KeyError, TypeError, ValueError):
            _apply_display_place(event)
            continue

        result = _cached_amap_regeocode(lon, lat, cache, budget)
        if result and result.get("ok"):
            country = _text_or_empty(result.get("country"))
            is_china = country == "中国"
            event["is_china"] = is_china
            event["region_basis"] = "amap"
            zh_place = _place_from_amap(result, _text_or_empty(event.get("place_zh") or event.get("place")))
            if is_china:
                event["place_zh"] = event.get("place_zh") or zh_place
            else:
                event["place_zh"] = event.get("place_zh") or zh_place or "境外地震"
        elif result:
            event["region_basis"] = "amap_unresolved"
        else:
            event["region_basis"] = "source_fallback"
            source = str(event.get("source") or "").upper()
            if source == "CENC" and _catalog_place_likely_china(str(event.get("place") or event.get("place_zh") or "")):
                event["is_china"] = True
            else:
                event["is_china"] = False
                if source == "CENC":
                    event["place_en"] = event.get("place_en") or "Overseas earthquake"
                else:
                    if not event.get("place_zh") and not event.get("place_en"):
                        event["place_zh"] = "境外或未判定地区"
        _apply_display_place(event)

    if cache.get("dirty"):
        _write_json(_cache_path("amap_regeo_cache.json"), {"updated_at": _now_ts(), "items": cache["items"]})
    return events


def _fetch_usgs_events() -> list[dict[str, Any]]:
    response = requests.get(USGS_DAY_FEED, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()
    return [
        event
        for event in (_normalize_feature(feature, "USGS") for feature in payload.get("features", []))
        if event is not None
    ]


def _fetch_emsc_events() -> list[dict[str, Any]]:
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=1)
    response = requests.get(
        EMSC_QUERY,
        params={
            "format": "json",
            "limit": "80",
            "starttime": start.isoformat(timespec="seconds").replace("+00:00", "Z"),
            "endtime": end.isoformat(timespec="seconds").replace("+00:00", "Z"),
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    payload = response.json()
    return [
        event
        for event in (_normalize_feature(feature, "EMSC") for feature in payload.get("features", []))
        if event is not None
    ]


def _clean_html_cell(value: str) -> str:
    value = re.sub(r"<[^>]*>", " ", value)
    return unescape(value).replace("\xa0", " ").strip()


def _parse_cenc_time(value: str) -> float | None:
    text = value.strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(text, fmt).replace(tzinfo=timezone(timedelta(hours=8)))
            return dt.timestamp()
        except ValueError:
            continue
    return None


def _fetch_cenc_events() -> list[dict[str, Any]]:
    response = requests.get(
        CNDC_CENC_REPORT,
        params={"PAGEID": CNDC_CENC_PAGE},
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
            "Referer": "https://data.earthquake.cn/",
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    rows = re.findall(
        r"<tr[^>]+id=[\"']earthquake_subao_guid_catalog_tr_\d+[\"'][^>]*>(.*?)</tr>",
        response.text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    events: list[dict[str, Any]] = []
    for row in rows[:80]:
        cells = [
            _clean_html_cell(match)
            for match in re.findall(
                r"<div[^>]+class=[\"']cls-data-content-list[\"'][^>]*>(.*?)</div>",
                row,
                flags=re.IGNORECASE | re.DOTALL,
            )
        ]
        if len(cells) < 8:
            continue
        event_time = _parse_cenc_time(cells[1])
        if not event_time:
            continue
        try:
            lon = float(cells[2])
            lat = float(cells[3])
            depth = float(cells[4])
            mag = float(cells[5])
        except ValueError:
            continue
        place = cells[6] or "中国地震台网速报"
        event_type = cells[7] or "地震"
        events.append({
            "id": f"cenc:{cells[1]}:{lat:.3f}:{lon:.3f}:{mag:.1f}",
            "source": "CENC",
            "type": "catalog",
            "station": "中国地震台网",
            "trace_id": "中国地震台网",
            "time": event_time,
            "origin_time": event_time,
            "p_pick_time": event_time,
            "magnitude": mag,
            "intensity": _estimate_intensity(mag),
            "place": place,
            "raw_place": place,
            "place_zh": _normalise_chinese_place(place),
            "place_en": _normalise_english_place(place),
            "latitude": lat,
            "longitude": lon,
            "depth_km": depth,
            "event_type": event_type,
            "url": f"{CNDC_CENC_REPORT}?PAGEID={CNDC_CENC_PAGE}",
            "ratio": None,
        })
    return events


def refresh_catalog(force: bool = False) -> dict[str, Any]:
    path = _cache_path("events_cache.json")
    cached = _read_json(path)
    if cached and not force and _now_ts() - float(cached.get("updated_at", 0)) < CATALOG_TTL_SECONDS:
        return cached

    with _lock:
        cached = _read_json(path)
        if cached and not force and _now_ts() - float(cached.get("updated_at", 0)) < CATALOG_TTL_SECONDS:
            return cached

        errors: list[str] = []
        events: list[dict[str, Any]] = []
        for source_name, fetcher in (
            ("USGS", _fetch_usgs_events),
            ("EMSC", _fetch_emsc_events),
            ("CENC", _fetch_cenc_events),
        ):
            try:
                events.extend(fetcher())
            except Exception as exc:
                errors.append(f"{source_name}: {exc}")

        if not events and cached:
            cached["stale"] = True
            cached["errors"] = errors
            return cached

        catalog_events = _enrich_event_regions(_dedupe_events(events))
        payload = {
            "status": "ok" if events else "error",
            "updated_at": _now_ts(),
            "ttl_seconds": CATALOG_TTL_SECONDS,
            "sources": ["USGS", "EMSC", "CENC"],
            "region_basis": "amap" if AMAP_WEB_KEY else "source_fallback",
            "events": catalog_events,
            "errors": errors,
        }
        _write_json(path, payload)
        return payload


def _parse_timeseries_ascii(text: str) -> dict[str, Any]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines or not lines[0].startswith("TIMESERIES"):
        raise ValueError("unexpected timeseries response")

    header = lines[0]
    parts = [part.strip() for part in header.split(",")]
    trace_id = parts[0].replace("TIMESERIES", "", 1).strip().replace("_", ".")
    npts_declared = int(parts[1].split()[0]) if len(parts) > 1 and parts[1].split() else 0
    sampling_rate = float(parts[2].split()[0]) if len(parts) > 2 and parts[2].split() else None

    samples: list[tuple[float, float]] = []
    for line in lines[1:]:
        fields = line.split()
        if len(fields) < 2:
            continue
        ts = _parse_iso_ts(fields[0])
        if ts is None:
            continue
        try:
            samples.append((ts, float(fields[1])))
        except ValueError:
            continue

    if not samples:
        raise ValueError(f"no samples in timeseries response, declared={npts_declared}")

    return {"trace_id": trace_id, "sampling_rate": sampling_rate, "samples": samples}


def _downsample(values: list[float], max_points: int) -> list[float]:
    if len(values) <= max_points:
        return values
    step = max(1, math.ceil(len(values) / max_points))
    return values[::step]


def _detect_sta_lta(samples: list[tuple[float, float]], threshold: float) -> dict[str, Any]:
    if len(samples) < 120:
        return {"enabled": True, "trigger_threshold": threshold, "ratio": 0.0, "triggered": False}

    recent = samples[-min(len(samples), 2400) :]
    values = [abs(value) for _, value in recent]
    nsta = max(10, int(len(values) * 0.08))
    nlta = max(nsta + 1, int(len(values) * 0.55))
    if len(values) < nlta:
        return {"enabled": True, "trigger_threshold": threshold, "ratio": 0.0, "triggered": False}

    sta = sum(values[-nsta:]) / nsta
    lta_values = values[-nlta:-nsta]
    lta = sum(lta_values) / len(lta_values) if lta_values else 0.0
    ratio = sta / max(lta, 1e-9)
    peak_time, peak = max(recent[-nsta:], key=lambda item: abs(item[1]))
    return {
        "enabled": True,
        "trigger_threshold": threshold,
        "ratio": ratio,
        "triggered": ratio >= threshold,
        "peak": abs(peak),
        "peak_time": peak_time,
    }


def refresh_station_snapshot(force: bool = False) -> dict[str, Any]:
    path = _cache_path("station_snapshot.json")
    cached = _read_json(path)
    if cached and not force and _now_ts() - float(cached.get("updated_at", 0)) < STATION_TTL_SECONDS:
        return cached

    with _lock:
        cached = _read_json(path)
        if cached and not force and _now_ts() - float(cached.get("updated_at", 0)) < STATION_TTL_SECONDS:
            return cached

        end = datetime.now(timezone.utc) - timedelta(seconds=STATION_CONFIG["data_delay_seconds"])
        start = end - timedelta(seconds=STATION_CONFIG["window_seconds"])
        def fmt_time(value: datetime) -> str:
            return value.replace(microsecond=0).isoformat().replace("+00:00", "")

        params = {
            "net": STATION_CONFIG["network"],
            "sta": STATION_CONFIG["station"],
            "loc": STATION_CONFIG["location"],
            "cha": STATION_CONFIG["channel"],
            "starttime": fmt_time(start),
            "endtime": fmt_time(end),
            "output": "ascii",
        }

        try:
            response = requests.get(IRIS_TIMESERIES, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
            response.raise_for_status()
            parsed = _parse_timeseries_ascii(response.text)
            samples = parsed["samples"]
            raw_values = [value for _, value in samples]
            data = _downsample(raw_values, MAX_SNAPSHOT_POINTS)
            detector = _detect_sta_lta(samples, STATION_CONFIG["trigger_threshold"])
            payload = {
                "status": "ok",
                "updated_at": _now_ts(),
                "ttl_seconds": STATION_TTL_SECONDS,
                "station": {
                    **STATION_CONFIG,
                    "key": ".".join([
                        STATION_CONFIG["network"],
                        STATION_CONFIG["station"],
                        STATION_CONFIG["location"],
                        STATION_CONFIG["channel"],
                    ]),
                },
                "snapshot": {
                    "type": "snapshot",
                    "id": parsed["trace_id"],
                    "starttime": samples[0][0],
                    "endtime": samples[-1][0],
                    "sampling_rate": parsed["sampling_rate"],
                    "npts": len(data),
                    "raw_npts": len(samples),
                    "data": data,
                },
                "detector": detector,
                "errors": [],
            }
        except Exception as exc:
            payload = cached or {
                "status": "error",
                "updated_at": _now_ts(),
                "ttl_seconds": STATION_TTL_SECONDS,
                "station": {**STATION_CONFIG, "key": ".".join([
                    STATION_CONFIG["network"],
                    STATION_CONFIG["station"],
                    STATION_CONFIG["location"],
                    STATION_CONFIG["channel"],
                ])},
                "snapshot": {"type": "snapshot", "id": "", "npts": 0, "data": []},
                "detector": {"enabled": True, "trigger_threshold": STATION_CONFIG["trigger_threshold"], "ratio": 0.0, "triggered": False},
            }
            payload = {**payload, "status": "stale" if cached else "error", "errors": [str(exc)], "updated_at": _now_ts()}

        _write_json(path, payload)
        return payload


def station_status() -> dict[str, Any]:
    payload = refresh_station_snapshot(force=False)
    snapshot = payload.get("snapshot") or {}
    return {
        "status": payload.get("status"),
        "updated_at": payload.get("updated_at"),
        "ttl_seconds": payload.get("ttl_seconds"),
        "station": payload.get("station"),
        "detector": payload.get("detector"),
        "samples": snapshot.get("raw_npts") or snapshot.get("npts") or 0,
        "last_packet_at": snapshot.get("endtime"),
        "snapshot_start": snapshot.get("starttime"),
        "snapshot_end": snapshot.get("endtime"),
        "errors": payload.get("errors") or [],
    }


def start_seisrt_public_scheduler(app: Any) -> None:
    global _scheduler_started
    if _scheduler_started or os.environ.get("YSXS_SEISRT_DISABLE_SCHEDULER") == "1":
        return
    _scheduler_started = True

    def worker() -> None:
        time.sleep(5)
        while True:
            try:
                with app.app_context():
                    refresh_catalog(force=False)
                    refresh_station_snapshot(force=False)
            except Exception:
                app.logger.exception("SeisRT public scheduler failed")
            time.sleep(max(60, SCHEDULER_INTERVAL_SECONDS))

    thread = threading.Thread(target=worker, name="SeisRTPublicScheduler", daemon=True)
    thread.start()
