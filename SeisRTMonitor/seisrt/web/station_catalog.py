from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from obspy.clients.fdsn import Client

CACHE_DIR = Path(__file__).resolve().parents[2] / "data"
CACHE_DIR.mkdir(exist_ok=True)
CACHE_FILE = CACHE_DIR / "stations_cache.json"
DEFAULT_NETWORKS = "IU,II,IC,CU,GE"
CACHE_TTL_SECONDS = 7 * 24 * 3600


def _safe_time(value):
    return value.isoformat() if value else None


def fetch_station_inventory(networks: str = DEFAULT_NETWORKS, force: bool = False) -> dict[str, Any]:
    """Fetch station metadata from FDSN and cache it locally.

    Cache contains station coordinates, site name, and available location/channel
    options.  It intentionally defaults to several global networks to avoid a
    huge all-network query.
    """
    if CACHE_FILE.exists() and not force:
        age = time.time() - CACHE_FILE.stat().st_mtime
        if age < CACHE_TTL_SECONDS:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))

    client = Client("IRIS")
    stations: list[dict[str, Any]] = []
    for net_code in [x.strip() for x in networks.split(",") if x.strip()]:
        inv = client.get_stations(network=net_code, level="channel")
        for net in inv:
            for sta in net:
                loc_channels: dict[str, set[str]] = {}
                for cha in sta.channels:
                    loc = cha.location_code or ""
                    loc_channels.setdefault(loc, set()).add(cha.code)
                locations = sorted(loc_channels.keys())
                channels = sorted({ch for vals in loc_channels.values() for ch in vals})
                stations.append({
                    "id": f"{net.code}.{sta.code}",
                    "network": net.code,
                    "station": sta.code,
                    "site": getattr(sta.site, "name", "") or "",
                    "latitude": float(sta.latitude),
                    "longitude": float(sta.longitude),
                    "elevation": float(sta.elevation or 0.0),
                    "start_date": _safe_time(sta.start_date),
                    "end_date": _safe_time(sta.end_date),
                    "locations": locations,
                    "channels": channels,
                    "loc_channels": {loc: sorted(vals) for loc, vals in loc_channels.items()},
                })
    payload = {"updated_at": time.time(), "networks": networks, "stations": stations}
    CACHE_FILE.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    return payload


def find_station(network: str, station: str, networks: str = DEFAULT_NETWORKS) -> dict[str, Any] | None:
    payload = fetch_station_inventory(networks=networks, force=False)
    for sta in payload["stations"]:
        if sta["network"] == network and sta["station"] == station:
            return sta
    return None
