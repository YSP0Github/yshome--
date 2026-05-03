const $ = (id) => document.getElementById(id);

const I18N = {
  en: {
    subtitle: "Realtime Seismic Monitor", source: "SEEDLINK SOURCE", server: "Server",
    network: "Network", station: "Station", location: "Location", channel: "Channel",
    addStation: "Add Station", stopAll: "Stop All", stations: "Stations", stationCount: "Stations",
    display: "DISPLAY", window: "Window seconds", delay: "Playback delay seconds", gain: "Gain",
    idle: "Idle", idleText: "Waiting for realtime data source", dashboard: "LIVE DASHBOARD",
    multiTitle: "Multi-station Waveform Wall", latency: "Gap", samples: "Samples",
    eventLog: "Event Log", loading: "Loading historical window...", bufferLow: "Buffer insufficient; requesting missing data...",
    connecting: "Connecting", connectingText: "Preloading history, then subscribing SeedLink",
    stopped: "Stopped", stoppedText: "Realtime stream stopped", disconnected: "Disconnected",
    websocketClosed: "WebSocket closed", websocketError: "WebSocket Error", websocketErrorText: "Failed to connect backend",
    noStations: "No stations added", stationMap: "Station Map", loadMap: "Load", selectStation: "Select station",
    selectLocation: "Location", selectChannel: "Channel", close: "Close", maximize: "Maximize", restore: "Restore",
    resetMap: "Reset", detector: "Detector", triggerThreshold: "STA/LTA trigger", magnitudeThreshold: "Alarm magnitude",
    eventRecords: "Event Records", clearEvents: "Clear", backend: "Backend", backendTitle: "Backend", backendConnected: "Monitor stream connected",
    unknownSite: "Unknown site", lat: "Lat", lon: "Lon", elev: "Elev", duplicate: "Duplicate", addFailed: "Add failed",
    stationsTitle: "Stations", stationsLoading: "Loading station catalog...", stationsLoaded: "Loaded {count} stations",
    detectorUpdated: "Detector threshold updated: {value}", detectorIgnored: "Detector threshold ignored: {value}", detectorUpdateFailed: "detector update failed",
    backfill: "Backfill", backfillFailed: "Backfill failed", remove: "Remove", eventDeleted: "Event deleted", deleteEventFailed: "Delete event failed",
    clearEventsConfirm: "Clear all event records and saved waveform snippets?", allEventsCleared: "All events cleared", clearEventsFailed: "Clear events failed",
    pTime: "P", peak: "Peak", magnitudeShort: "M~", picker: "Picker", intensity: "Intensity", deleteEvent: "Delete",
    eventHint: "Green triangle=P pick; yellow dot=peak; yellow band=STA/LTA trigger window",
    triggerLabel: "TRIG", mapStations: "stations", mapZoom: "zoom", lonLat: "Lon {lon}, Lat {lat}", stationCatalogLoaded: "Station catalog loaded: {count}", stationCatalogError: "Station catalog error"
  },
  zh: {
    subtitle: "????????", source: "SEEDLINK ???", server: "???",
    network: "??", station: "??", location: "??", channel: "??",
    addStation: "????", stopAll: "??", stations: "????", stationCount: "???",
    display: "??", window: "??????", delay: "??????", gain: "??",
    idle: "??", idleText: "?????????", dashboard: "?????",
    multiTitle: "??????", latency: "??", samples: "???",
    eventLog: "????", loading: "?????????...", bufferLow: "?????????????...",
    connecting: "???", connectingText: "??????????? SeedLink",
    stopped: "???", stoppedText: "??????", disconnected: "???",
    websocketClosed: "WebSocket ???", websocketError: "WebSocket ??", websocketErrorText: "??????",
    noStations: "??????", stationMap: "????", loadMap: "??", selectStation: "????",
    selectLocation: "??", selectChannel: "??", close: "??", maximize: "???", restore: "??",
    resetMap: "??", detector: "???", triggerThreshold: "STA/LTA????", magnitudeThreshold: "??????",
    eventRecords: "????", clearEvents: "??", backend: "??", backendTitle: "??", backendConnected: "??????",
    unknownSite: "????", lat: "??", lon: "??", elev: "??", duplicate: "??", addFailed: "????",
    stationsTitle: "??", stationsLoading: "????????...", stationsLoaded: "??? {count} ???",
    detectorUpdated: "????????{value}", detectorIgnored: "????????{value}", detectorUpdateFailed: "???????",
    backfill: "??", backfillFailed: "????", remove: "??", eventDeleted: "?????", deleteEventFailed: "??????",
    clearEventsConfirm: "????????????????????", allEventsCleared: "???????", clearEventsFailed: "??????",
    pTime: "P??", peak: "??", magnitudeShort: "M~", picker: "???", intensity: "??", deleteEvent: "??",
    eventHint: "????=P???????=?????=STA/LTA???",
    triggerLabel: "??", mapStations: "??", mapZoom: "??", lonLat: "?? {lon}, ?? {lat}", stationCatalogLoaded: "????????{count}", stationCatalogError: "??????"
  }
};
function tf(key, vars = {}) {
  return t(key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

Object.assign(I18N.zh, {
  subtitle: "\u5b9e\u65f6\u5730\u9707\u76d1\u6d4b\u7cfb\u7edf", source: "SEEDLINK \u6570\u636e\u6e90", server: "\u670d\u52a1\u5668",
  network: "\u53f0\u7f51", station: "\u53f0\u7ad9", location: "\u4f4d\u7f6e", channel: "\u901a\u9053",
  addStation: "\u6dfb\u52a0\u53f0\u7ad9", stopAll: "\u5168\u505c", stations: "\u53f0\u7ad9\u5217\u8868", stationCount: "\u53f0\u7ad9\u6570",
  display: "\u663e\u793a", window: "\u663e\u793a\u7a97\u53e3\u79d2\u6570", delay: "\u64ad\u653e\u5ef6\u8fdf\u79d2\u6570", gain: "\u589e\u76ca",
  idle: "\u7a7a\u95f2", idleText: "\u7b49\u5f85\u8fde\u63a5\u5b9e\u65f6\u6570\u636e\u6e90", dashboard: "\u5b9e\u65f6\u4eea\u8868\u76d8",
  multiTitle: "\u591a\u53f0\u7ad9\u6ce2\u5f62\u5899", latency: "\u7f3a\u53e3", samples: "\u91c7\u6837\u70b9",
  eventLog: "\u4e8b\u4ef6\u65e5\u5fd7", loading: "\u6b63\u5728\u52a0\u8f7d\u5386\u53f2\u65f6\u95f4\u7a97...", bufferLow: "\u7f13\u5b58\u4e0d\u8db3\uff0c\u6b63\u5728\u8bf7\u6c42\u7f3a\u5931\u6570\u636e...",
  connecting: "\u8fde\u63a5\u4e2d", connectingText: "\u5148\u9884\u52a0\u8f7d\u5386\u53f2\u7a97\uff0c\u518d\u8ba2\u9605 SeedLink",
  stopped: "\u5df2\u505c\u6b62", stoppedText: "\u5df2\u505c\u6b62\u5b9e\u65f6\u6d41", disconnected: "\u5df2\u65ad\u5f00",
  websocketClosed: "WebSocket \u5df2\u65ad\u5f00", websocketError: "WebSocket \u9519\u8bef", websocketErrorText: "\u8fde\u63a5\u540e\u7aef\u5931\u8d25",
  noStations: "\u5c1a\u672a\u6dfb\u52a0\u53f0\u7ad9", stationMap: "\u53f0\u7ad9\u5730\u56fe", loadMap: "\u52a0\u8f7d", selectStation: "\u9009\u62e9\u53f0\u7ad9",
  selectLocation: "\u4f4d\u7f6e", selectChannel: "\u901a\u9053", close: "\u5173\u95ed", maximize: "\u6700\u5927\u5316", restore: "\u8fd8\u539f",
  resetMap: "\u91cd\u7f6e", detector: "\u68c0\u6d4b\u5668", triggerThreshold: "STA/LTA\u89e6\u53d1\u9608\u503c", magnitudeThreshold: "\u62a5\u8b66\u9707\u7ea7\u9608\u503c",
  eventRecords: "\u4e8b\u4ef6\u8bb0\u5f55", clearEvents: "\u6e05\u7a7a", backend: "\u540e\u7aef", backendTitle: "\u540e\u7aef", backendConnected: "\u76d1\u6d4b\u6d41\u5df2\u8fde\u63a5",
  unknownSite: "\u672a\u77e5\u7ad9\u70b9", lat: "\u7eac\u5ea6", lon: "\u7ecf\u5ea6", elev: "\u9ad8\u7a0b", duplicate: "\u91cd\u590d", addFailed: "\u6dfb\u52a0\u5931\u8d25",
  stationsTitle: "\u53f0\u7ad9", stationsLoading: "\u6b63\u5728\u52a0\u8f7d\u53f0\u7ad9\u76ee\u5f55...", stationsLoaded: "\u5df2\u52a0\u8f7d {count} \u4e2a\u53f0\u7ad9",
  detectorUpdated: "\u68c0\u6d4b\u9608\u503c\u5df2\u66f4\u65b0\uff1a{value}", detectorIgnored: "\u68c0\u6d4b\u9608\u503c\u5df2\u5ffd\u7565\uff1a{value}", detectorUpdateFailed: "\u68c0\u6d4b\u5668\u66f4\u65b0\u5931\u8d25",
  backfill: "\u8865\u9f50", backfillFailed: "\u8865\u9f50\u5931\u8d25", remove: "\u79fb\u9664", eventDeleted: "\u4e8b\u4ef6\u5df2\u5220\u9664", deleteEventFailed: "\u5220\u9664\u4e8b\u4ef6\u5931\u8d25",
  clearEventsConfirm: "\u786e\u8ba4\u6e05\u7a7a\u6240\u6709\u4e8b\u4ef6\u8bb0\u5f55\u548c\u5df2\u4fdd\u5b58\u7684\u4e8b\u4ef6\u7247\u6bb5\uff1f", allEventsCleared: "\u5df2\u6e05\u7a7a\u6240\u6709\u4e8b\u4ef6", clearEventsFailed: "\u6e05\u7a7a\u4e8b\u4ef6\u5931\u8d25",
  pTime: "P\u521d\u81f3", peak: "\u5cf0\u503c", magnitudeShort: "M~", picker: "\u62fe\u53d6\u5668", intensity: "\u70c8\u5ea6", deleteEvent: "\u5220\u9664",
  eventHint: "\u7eff\u8272\u4e09\u89d2=P\u521d\u81f3\u4f30\u8ba1\uff1b\u9ec4\u70b9=\u5cf0\u503c\uff1b\u9ec4\u5e26=STA/LTA\u89e6\u53d1\u7a97", triggerLabel: "\u89e6\u53d1",
  mapStations: "\u53f0\u7ad9", mapZoom: "\u7f29\u653e", lonLat: "\u7ecf\u5ea6 {lon}, \u7eac\u5ea6 {lat}", stationCatalogLoaded: "\u53f0\u7ad9\u76ee\u5f55\u5df2\u52a0\u8f7d\uff1a{count}", stationCatalogError: "\u53f0\u7ad9\u76ee\u5f55\u9519\u8bef"
});
const urlParams = new URLSearchParams(window.location.search);
const EMBED_MODE = ["1", "true", "yes"].includes((urlParams.get("embed") || "").toLowerCase());
let lang = urlParams.get("lang") || localStorage.getItem("seisrt_lang") || "zh";
function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }

const monitors = new Map();
let monitorSeq = 0;
let detectedEvents = [];
const DEFAULT_STATION = {
  network: urlParams.get("network") || "IU",
  station: urlParams.get("station") || "TATO",
  location: urlParams.get("location") || "00",
  channel: urlParams.get("channel") || "BHZ"
};

function log(message) {
  const line = document.createElement("div");
  line.className = "log-line";
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  const box = $("log");
  box.prepend(line);
  while (box.children.length > 100) box.removeChild(box.lastChild);
}

function setStatus(level, title, text) {
  const dot = $("statusDot");
  dot.className = `dot ${level || "muted"}`;
  $("statusTitle").textContent = title;
  $("statusText").textContent = text;
}

function fmtTime(ts) { return new Date(ts * 1000).toLocaleTimeString([], { hour12: false }); }
function stationKey(c) { return `${c.network}.${c.station}.${c.location}.${c.channel}`; }

function lowerBoundByTime(samples, target) {
  let lo = 0, hi = samples.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function downsampleRangeMinMax(samples, start, end, maxDrawPoints) {
  const rawCount = Math.max(0, end - start);
  if (rawCount <= maxDrawPoints) {
    return {
      points: samples.slice(start, end),
      minY: Math.min(...samples.slice(start, end).map(p => p.y)),
      maxY: Math.max(...samples.slice(start, end).map(p => p.y)),
      scanStride: 1,
    };
  }

  const bucketCount = Math.max(1, Math.floor(maxDrawPoints / 2));
  const bucketSize = rawCount / bucketCount;
  // Rendering is a visual task: for extremely long windows, cap the number of
  // inspected samples per frame to keep scrolling smooth.
  const scanStride = Math.max(1, Math.floor(rawCount / 180000));
  const out = [];
  let globalMin = Infinity, globalMax = -Infinity;

  for (let b = 0; b < bucketCount; b++) {
    const bStart = start + Math.floor(b * bucketSize);
    const bEnd = Math.min(end, start + Math.floor((b + 1) * bucketSize));
    if (bEnd <= bStart) continue;

    let minP = samples[bStart], maxP = samples[bStart];
    for (let i = bStart; i < bEnd; i += scanStride) {
      const p = samples[i];
      if (p.y < minP.y) minP = p;
      if (p.y > maxP.y) maxP = p;
    }
    // Always look at bucket tail too, so bucket boundaries do not disappear.
    const tail = samples[bEnd - 1];
    if (tail.y < minP.y) minP = tail;
    if (tail.y > maxP.y) maxP = tail;

    if (minP.y < globalMin) globalMin = minP.y;
    if (maxP.y > globalMax) globalMax = maxP.y;

    if (minP.t < maxP.t) out.push(minP, maxP);
    else if (maxP.t < minP.t) out.push(maxP, minP);
    else out.push(minP);
  }
  return { points: out, minY: globalMin, maxY: globalMax, scanStride };
}

const MIN_CARD_HEIGHT = 180;
const GRID_GAP = 10;

function rebuildMonitorOrderFromDom() {
  const ordered = new Map();
  document.querySelectorAll(".waveform-card").forEach(card => {
    const m = monitors.get(card.id);
    if (m) ordered.set(m.id, m);
  });
  monitors.clear();
  ordered.forEach((v, k) => monitors.set(k, v));
}

function updateAdaptiveHeights() {
  const grid = $("waveformGrid");
  const n = monitors.size;
  if (!grid || n === 0) return;
  const gridHeight = Math.max(1, grid.clientHeight);
  const available = gridHeight - GRID_GAP * Math.max(0, n - 1);
  const cardHeight = Math.max(MIN_CARD_HEIGHT, Math.floor(available / n));
  for (const m of monitors.values()) {
    if (m.maximized) {
      m.card.style.height = "";
    } else {
      m.card.style.height = `${cardHeight}px`;
    }
  }
  requestAnimationFrame(() => monitors.forEach(m => m.fitCanvas()));
}

function moveCard(dragId, targetId, after = false) {
  if (!dragId || !targetId || dragId === targetId) return;
  const drag = monitors.get(dragId);
  const target = monitors.get(targetId);
  if (!drag || !target) return;
  const grid = $("waveformGrid");
  grid.insertBefore(drag.card, after ? target.card.nextSibling : target.card);
  rebuildMonitorOrderFromDom();
  updateStationList();
  updateAdaptiveHeights();
}

function setupDropTarget(el, targetId) {
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    const dragId = e.dataTransfer.getData("text/station-id");
    const rect = el.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    moveCard(dragId, targetId, after);
  });
}
let stationCatalog = [];
let selectedStation = null;
const earthMapImage = new Image();
earthMapImage.src = "/static/assets/earthmap1k.jpg";
earthMapImage.onload = () => drawStationMap();
const mapState = { zoom: 1, centerLon: 0, centerLat: 0, dragging: false, lastX: 0, lastY: 0 };

function mapSpan() {
  return { lon: 360 / mapState.zoom, lat: 180 / mapState.zoom };
}

function clampMapCenter() {
  const span = mapSpan();
  const lonHalf = span.lon / 2;
  const latHalf = span.lat / 2;
  mapState.centerLon = Math.max(-180 + lonHalf, Math.min(180 - lonHalf, mapState.centerLon));
  mapState.centerLat = Math.max(-90 + latHalf, Math.min(90 - latHalf, mapState.centerLat));
}

function mapBounds() {
  clampMapCenter();
  const span = mapSpan();
  return {
    left: mapState.centerLon - span.lon / 2,
    right: mapState.centerLon + span.lon / 2,
    top: mapState.centerLat + span.lat / 2,
    bottom: mapState.centerLat - span.lat / 2,
  };
}

function lonLatToXY(lon, lat, w, h) {
  const b = mapBounds();
  return {
    x: ((lon - b.left) / (b.right - b.left)) * w,
    y: ((b.top - lat) / (b.top - b.bottom)) * h,
  };
}

function xyToLonLat(x, y, w, h) {
  const b = mapBounds();
  return {
    lon: b.left + (x / w) * (b.right - b.left),
    lat: b.top - (y / h) * (b.top - b.bottom),
  };
}

function fitStationMap() {
  const canvas = $("stationMapCanvas");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawStationMap();
}

function drawStationMap() {
  const canvas = $("stationMapCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  const b = mapBounds();
  ctx.clearRect(0, 0, w, h);

  if (earthMapImage.complete && earthMapImage.naturalWidth) {
    const sx = ((b.left + 180) / 360) * earthMapImage.naturalWidth;
    const sy = ((90 - b.top) / 180) * earthMapImage.naturalHeight;
    const sw = ((b.right - b.left) / 360) * earthMapImage.naturalWidth;
    const sh = ((b.top - b.bottom) / 180) * earthMapImage.naturalHeight;
    ctx.drawImage(earthMapImage, sx, sy, sw, sh, 0, 0, w, h);
    ctx.fillStyle = "rgba(2,8,23,.20)";
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = "rgba(2,8,23,.74)";
    ctx.fillRect(0, 0, w, h);
  }

  // latitude/longitude grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(229,240,255,.22)";
  ctx.fillStyle = "rgba(229,240,255,.72)";
  ctx.font = "10px Consolas";
  const lonStep = mapState.zoom >= 4 ? 10 : mapState.zoom >= 2 ? 20 : 60;
  const latStep = mapState.zoom >= 4 ? 10 : mapState.zoom >= 2 ? 20 : 30;
  for (let lon = Math.ceil(b.left / lonStep) * lonStep; lon <= b.right; lon += lonStep) {
    const p = lonLatToXY(lon, b.bottom, w, h);
    ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, h); ctx.stroke();
    ctx.fillText(`${lon.toFixed(0)}°`, p.x + 3, 12);
  }
  for (let lat = Math.ceil(b.bottom / latStep) * latStep; lat <= b.top; lat += latStep) {
    const p = lonLatToXY(b.left, lat, w, h);
    ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(w, p.y); ctx.stroke();
    ctx.fillText(`${lat.toFixed(0)}°`, 4, p.y - 3);
  }

  for (const sta of stationCatalog) {
    if (sta.longitude < b.left || sta.longitude > b.right || sta.latitude < b.bottom || sta.latitude > b.top) continue;
    const {x,y} = lonLatToXY(sta.longitude, sta.latitude, w, h);
    const isSel = selectedStation && selectedStation.id === sta.id;
    ctx.fillStyle = isSel ? "#fbbf24" : "#22d3ee";
    ctx.shadowColor = isSel ? "rgba(251,191,36,.85)" : "rgba(34,211,238,.7)";
    ctx.shadowBlur = isSel ? 10 : 5;
    ctx.beginPath(); ctx.arc(x, y, isSel ? 4.5 : 2.8, 0, Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(229,240,255,.82)";
  ctx.font = "11px Consolas";
  ctx.fillText(`${stationCatalog.length} ${t("mapStations")} · ${t("mapZoom")} ${mapState.zoom.toFixed(1)}x`, 10, h - 10);
}

function populateStationSelect() {
  const sel = $("stationSelect");
  if (!sel) return;
  sel.innerHTML = "";
  for (const sta of stationCatalog) {
    const opt = document.createElement("option");
    opt.value = sta.id;
    opt.textContent = `${sta.id} ${sta.site ? "· " + sta.site : ""}`;
    sel.appendChild(opt);
  }
}

function fillSelectOptions(select, values) {
  select.innerHTML = "";
  for (const v of values) {
    const opt = document.createElement("option"); opt.value = v; opt.textContent = v || "--"; select.appendChild(opt);
  }
}

function selectStation(sta) {
  if (!sta) return;
  selectedStation = sta;
  $("network").value = sta.network;
  $("station").value = sta.station;
  const locs = sta.locations && sta.locations.length ? sta.locations : [""];
  fillSelectOptions($("locationSelect"), locs);
  const preferredLoc = sta.network === DEFAULT_STATION.network && sta.station === DEFAULT_STATION.station && locs.includes(DEFAULT_STATION.location)
    ? DEFAULT_STATION.location
    : locs[0];
  const firstLoc = preferredLoc;
  const chans = (sta.loc_channels && sta.loc_channels[firstLoc]) || sta.channels || [];
  fillSelectOptions($("channelSelect"), chans);
  $("location").value = firstLoc;
  $("channel").value = sta.network === DEFAULT_STATION.network && sta.station === DEFAULT_STATION.station && chans.includes(DEFAULT_STATION.channel)
    ? DEFAULT_STATION.channel
    : (chans[0] || DEFAULT_STATION.channel);
  $("stationSelect").value = sta.id;
  $("stationInfo").innerHTML = `<b>${sta.id}</b><br>${sta.site || t("unknownSite")}<br>${t("lat")} ${sta.latitude.toFixed(4)}, ${t("lon")} ${sta.longitude.toFixed(4)}, ${t("elev")} ${sta.elevation.toFixed(0)} m`;
  drawStationMap();
}

async function loadStationCatalog(force=false) {
  const networks = encodeURIComponent($("networkFilter").value || "IU,II,IC,CU,GE");
  setStatus("ok", t("stationsTitle"), t("stationsLoading"));
  const res = await fetch(`/api/stations?networks=${networks}&force=${force ? "true" : "false"}`);
  const payload = await res.json();
  stationCatalog = payload.stations || [];
  stationCatalog.sort((a,b) => a.id.localeCompare(b.id));
  populateStationSelect();
  if (stationCatalog.length) {
    const preferred = stationCatalog.find(s => s.network === DEFAULT_STATION.network && s.station === DEFAULT_STATION.station);
    selectStation(preferred || stationCatalog[0]);
  }
  setStatus("ok", t("stationsTitle"), tf("stationsLoaded", {count: stationCatalog.length}));
  log(tf("stationCatalogLoaded", {count: stationCatalog.length}));
  fitStationMap();
}

function zoomMap(factor, anchorX = null, anchorY = null) {
  const canvas = $("stationMapCanvas");
  const rect = canvas.getBoundingClientRect();
  const before = anchorX == null ? null : xyToLonLat(anchorX, anchorY, rect.width, rect.height);
  mapState.zoom = Math.max(1, Math.min(12, mapState.zoom * factor));
  if (before) {
    const after = xyToLonLat(anchorX, anchorY, rect.width, rect.height);
    mapState.centerLon += before.lon - after.lon;
    mapState.centerLat += before.lat - after.lat;
  }
  clampMapCenter();
  drawStationMap();
}

function resetMap() {
  mapState.zoom = 1;
  mapState.centerLon = 0;
  mapState.centerLat = 0;
  drawStationMap();
}let monitorsSocket = null;
let reconnectTimer = null;

function ensureMonitorSocket() {
  if (monitorsSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(monitorsSocket.readyState)) return;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  monitorsSocket = new WebSocket(`${proto}://${location.host}/ws/monitors`);
  monitorsSocket.onopen = () => { setStatus("ok", t("backendTitle"), t("backendConnected")); };
  monitorsSocket.onmessage = (event) => handleBackendMessage(JSON.parse(event.data));
  monitorsSocket.onclose = () => {
    setStatus("muted", t("disconnected"), t("websocketClosed"));
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(ensureMonitorSocket, 2000);
  };
  monitorsSocket.onerror = () => setStatus("error", t("websocketError"), t("websocketErrorText"));
}

function handleBackendMessage(msg) {
  if (msg.type === "monitors") {
    syncMonitorList(msg.monitors || []);
    return;
  }
  if (msg.type === "monitor_added") {
    upsertMonitor(msg.monitor);
    return;
  }
  if (msg.type === "monitor_removed") {
    const m = monitors.get(msg.monitor_id);
    if (m) m.removeLocal();
    return;
  }
  if (["trace", "history", "snapshot", "backfill"].includes(msg.type)) {
    const m = monitors.get(msg.monitor_id);
    if (m) m.appendPacket(msg);
    return;
  }
  if (msg.type === "status") {
    const m = monitors.get(msg.monitor_id);
    if (m) m.setMonitorStatus(msg.message);
    log(`${m ? m.key + ': ' : ''}${msg.message}`);
    return;
  }
  if (msg.type === "event") {
    const m = monitors.get(msg.monitor_id);
    if (m) m.addEvent(msg);
    addEventRecord(msg);
    log(`${msg.station || msg.trace_id}: ${t("backend")} ${t("eventRecords")} STA/LTA=${Number(msg.ratio || 0).toFixed(1)}, M~${Number(msg.magnitude || 0).toFixed(1)}`);
    return;
  }
  if (msg.type === "event_deleted") {
    removeEventRecord(msg.id);
    return;
  }
  if (msg.type === "events_cleared") {
    detectedEvents = [];
    monitors.forEach(m => { m.events = []; m.draw(); });
    renderEventRecords();
    return;
  }
}

function syncMonitorList(items) {
  const seen = new Set();
  for (const info of items) {
    seen.add(info.id);
    upsertMonitor(info);
  }
  for (const [id, m] of [...monitors.entries()]) {
    if (!seen.has(id)) m.removeLocal();
  }
  updateStationList(); updateGlobalMetrics(); updateAdaptiveHeights();
}

function upsertMonitor(info) {
  if (!info || !info.id) return null;
  let m = monitors.get(info.id);
  if (!m) {
    m = new StationMonitor(info);
    monitors.set(m.id, m);
    m.loadSnapshot();
  } else {
    m.info = info;
    m.config = info.config || m.config;
    m.key = info.key || stationKey(m.config);
    m.refreshHeaderMeta();
  }
  updateStationList(); updateGlobalMetrics(); updateAdaptiveHeights();
  return m;
}

class StationMonitor {
  constructor(info) {
    this.id = info.id;
    this.info = info;
    this.config = info.config || info;
    this.key = info.key || stationKey(this.config);
    this.samples = [];
    this.traceId = this.key;
    this.latestSampleTime = null;
    this.playbackRight = null;
    this.animationRunning = false;
    this.pendingBackfills = [];
    this.maximized = false;
    this.lastPacket = null;
    this.sampleRate = null;
    this.statusMessage = info.status || t("loading");
    this.events = [];
    this.createDom();
    this.startAnimation();
  }

  async loadSnapshot() {
    try {
      const res = await fetch(`/api/monitors/${encodeURIComponent(this.id)}/snapshot`);
      if (!res.ok) return;
      const packet = await res.json();
      if (packet && packet.npts) this.appendPacket(packet);
    } catch (err) { log(`${this.key}: snapshot error ${err}`); }
  }

  createDom() {
    const card = document.createElement("section");
    card.className = "waveform-card";
    card.id = this.id;
    card.draggable = true;
    card.innerHTML = `
      <div class="waveform-card-header">
        <div class="waveform-title">
          <h3>${this.key}</h3>
          <p>${this.statusMessage}</p>
        </div>
        <div class="waveform-tools">
          <span class="pill">${t("backend")}</span>
          <button class="icon-btn max-btn" title="${t("maximize")}">⛶</button>
          <button class="icon-btn close-btn" title="${t("close")}">×</button>
        </div>
      </div>
      <div class="waveform-canvas-wrap">
        <canvas class="waveform-canvas"></canvas>
        <div class="waveform-cursor-info">--</div>
      </div>`;
    $("waveformGrid").appendChild(card);
    this.card = card;
    this.meta = card.querySelector(".waveform-title p");
    this.canvas = card.querySelector("canvas");
    this.cursorInfo = card.querySelector(".waveform-cursor-info");
    this.ctx = this.canvas.getContext("2d");
    this.currentView = null;
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/station-id", this.id);
      e.dataTransfer.effectAllowed = "move";
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    setupDropTarget(card, this.id);
    card.querySelector(".close-btn").addEventListener("click", () => this.destroy());
    this.canvas.addEventListener("mouseenter", () => {
      this.cursorInfo.classList.add("visible");
    });
    this.canvas.addEventListener("mouseleave", () => {
      this.cursorInfo.classList.remove("visible");
    });
    this.canvas.addEventListener("mousemove", (e) => this.updateCursorInfo(e));
    card.querySelector(".max-btn").addEventListener("click", () => {
      this.maximized = !this.maximized;
      card.classList.toggle("maximized", this.maximized);
      card.style.height = this.maximized ? "" : card.style.height;
      card.querySelector(".max-btn").textContent = this.maximized ? "↙" : "⛶";
      updateAdaptiveHeights();
      requestAnimationFrame(() => requestAnimationFrame(() => this.fitCanvas()));
    });
    this.fitCanvas();
    requestAnimationFrame(() => this.fitCanvas());
  }

  resizeCanvasToDisplay() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = Math.max(1, Math.round(rect.width || this.canvas.clientWidth || 800));
    const cssHeight = Math.max(1, Math.round(rect.height || this.canvas.clientHeight || 220));
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: cssWidth, height: cssHeight };
  }

  fitCanvas() { this.resizeCanvasToDisplay(); this.draw(); }

  mergeSamples(newSamples) {
    this.samples.push(...newSamples);
    this.samples.sort((a, b) => a.t - b.t);
    const merged = [];
    let lastT = null;
    for (const p of this.samples) {
      if (lastT === null || Math.abs(p.t - lastT) > 1e-4) { merged.push(p); lastT = p.t; }
      else merged[merged.length - 1] = p;
    }
    this.samples = merged;
  }

  appendPacket(packet) {
    if (["history", "snapshot"].includes(packet.type)) { this.samples = []; this.playbackRight = null; }
    this.traceId = packet.id || this.traceId;
    if (packet.endtime) this.latestSampleTime = Math.max(this.latestSampleTime || -Infinity, packet.endtime);
    this.lastPacket = packet;
    const delta = packet.delta || 1 / (packet.sampling_rate || 20);
    const incoming = [];
    for (let i = 0; i < (packet.data || []).length; i++) incoming.push({ t: packet.starttime + i * delta, y: packet.data[i] });
    this.mergeSamples(incoming);
    this.trimBuffer();
    this.updateHeader(packet);
    this.checkCoverageAndBackfill();
    updateGlobalMetrics();
  }

  trimBuffer() {
    if (!this.samples.length) return;
    const windowSec = Number($("windowSeconds").value || 300);
    const delaySec = Number($("delaySeconds").value || 300);
    const latest = this.latestSampleTime || this.samples[this.samples.length - 1].t;
    const keepAfter = latest - delaySec - windowSec * 3;
    let firstKeep = 0;
    while (firstKeep < this.samples.length && this.samples[firstKeep].t < keepAfter) firstKeep++;
    if (firstKeep > 0) this.samples = this.samples.slice(firstKeep);
  }

  updateHeader(packet) {
    this.card.querySelector(".waveform-title h3").textContent = packet.id || this.key;
    this.sampleRate = packet.sampling_rate || this.sampleRate;
    this.refreshHeaderMeta();
  }

  setMonitorStatus(message) { this.statusMessage = message || ""; this.refreshHeaderMeta(); }

  refreshHeaderMeta() {
    const parts = [];
    if (this.sampleRate) parts.push(`${Number(this.sampleRate).toFixed(2)} Hz`);
    parts.push(`${this.samples.length.toLocaleString()} ${t("samples")}`);
    if (this.statusMessage) parts.push(this.statusMessage);
    this.meta.textContent = parts.join(" · ");
  }

  refreshLanguage() {
    const pill = this.card.querySelector(".pill");
    if (pill) pill.textContent = t("backend");
    const maxBtn = this.card.querySelector(".max-btn");
    if (maxBtn) maxBtn.title = this.maximized ? t("restore") : t("maximize");
    const closeBtn = this.card.querySelector(".close-btn");
    if (closeBtn) closeBtn.title = t("close");
    this.refreshHeaderMeta();
    this.draw();
  }

  updateCursorInfo(e) {
    if (!this.currentView || !this.cursorInfo) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const { left, windowSec, mid, half, height } = this.currentView;
    const ts = left + (x / Math.max(1, rect.width)) * windowSec;
    const amp = mid - ((y - height / 2) / (height * 0.42)) * half;
    const nearest = this.nearestSample(ts);
    const nearestText = nearest
      ? `<br><span class="cursor-label">${t("samples")}</span> ${nearest.y.toFixed(0)}`
      : "";
    this.cursorInfo.innerHTML = `
      <span class="cursor-label">${lang === "zh" ? "时间" : "Time"}</span> ${fmtTime(ts)}<br>
      <span class="cursor-label">${lang === "zh" ? "振幅" : "Amp"}</span> ${amp.toFixed(0)}
      ${nearestText}`;
  }

  flashEvent() {
    this.card.classList.add("event-alert");
    setTimeout(() => this.card.classList.remove("event-alert"), 3000);
  }

  addEvent(evt) {
    if (evt.id) this.events = this.events.filter(e => e.id !== evt.id);
    this.events.unshift(evt);
    this.events = this.events.slice(0, 20);
    this.flashEvent();
    this.draw();
  }

  focusEvent(evt) {
    if (!evt) return;
    const t0 = Number(evt.p_pick_time || evt.time || evt.peak_time);
    const windowSec = Number($("windowSeconds").value || 300);
    this.playbackRight = t0 + windowSec * 0.55;
    this.card.scrollIntoView({ behavior: "smooth", block: "center" });
    this.flashEvent();
    this.draw();
  }

  visibleRange() {
    const windowSec = Number($("windowSeconds").value || 300);
    const right = this.computeRightEdge();
    if (right === null) return null;
    return { left: right - windowSec, right };
  }

  requestBackfill(start, end) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
    const pad = 15;
    start -= pad;
    end += pad;
    const maxSeconds = 1800;
    if (end - start > maxSeconds) start = end - maxSeconds;
    for (const r of this.pendingBackfills) {
      if (start >= r.start - 2 && end <= r.end + 2 && Date.now() - r.ts < 120000) return;
    }
    const req = { start, end, ts: Date.now() };
    this.pendingBackfills.push(req);
    fetch(`/api/monitors/${encodeURIComponent(this.id)}/backfill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, end }),
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      log(`${this.key}: ${t("backfill")} ${fmtTime(start)} → ${fmtTime(end)}`);
    }).catch(err => {
      log(`${this.key}: ${t("backfillFailed")} ${err}`);
    }).finally(() => {
      this.pendingBackfills = this.pendingBackfills.filter(r => r !== req && Date.now() - r.ts < 120000);
    });
  }

  checkCoverageAndBackfill() {
    if (!this.samples.length) return;
    const range = this.visibleRange();
    if (!range) return;
    const storedStart = this.samples[0].t;
    const storedEnd = this.samples[this.samples.length - 1].t;
    const margin = 3;
    if (range.left < storedStart - margin) this.requestBackfill(range.left, storedStart);
    if (range.right > storedEnd + margin) this.requestBackfill(storedEnd, range.right);
    this.pendingBackfills = this.pendingBackfills.filter(r => Date.now() - r.ts < 120000);
  }

  computeRightEdge() {
    if (!this.samples.length || this.latestSampleTime === null) return null;
    const delaySec = Number($("delaySeconds").value || 300);
    const safetySec = 1.5;
    const desired = Date.now() / 1000 - delaySec;
    const dataLimited = this.latestSampleTime - safetySec;
    const target = Math.min(desired, dataLimited);
    if (this.playbackRight === null) { this.playbackRight = target; return this.playbackRight; }

    // A monitoring website should show the current delayed realtime window,
    // not replay every frame missed while the tab was hidden/minimized.
    // Browsers throttle requestAnimationFrame in background tabs; without this
    // snap, the old code would fast-forward visually after the page became
    // visible again.
    if (document.hidden || target - this.playbackRight > 3) {
      this.playbackRight = target;
      this.lastNow = performance.now() / 1000;
      return this.playbackRight;
    }

    const now = performance.now() / 1000;
    if (!this.lastNow) this.lastNow = now;
    const dt = Math.min(0.08, Math.max(0, now - this.lastNow));
    this.lastNow = now;
    const next = this.playbackRight + dt;
    this.playbackRight = Math.min(next, target);
    return this.playbackRight;
  }

  drawGrid(w, h, leftTime, rightTime) {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.96)"); grad.addColorStop(1, "rgba(2, 8, 23, 0.88)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      if (leftTime && rightTime) { const tt = leftTime + (i / 10) * (rightTime - leftTime); ctx.fillStyle = "rgba(229,240,255,.55)"; ctx.font = "12px Consolas"; ctx.fillText(fmtTime(tt), Math.min(w - 70, x + 6), h - 34); }
    }
    for (let y = 0; y <= h; y += h / 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(34,211,238,.22)"; ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
  }

  draw() {
    const size = this.resizeCanvasToDisplay();
    const w = size.width, h = size.height;
    const windowSec = Number($("windowSeconds").value || 300);
    const right = this.computeRightEdge();
    const left = right === null ? null : right - windowSec;
    this.drawGrid(w, h, left, right);
    const ctx = this.ctx;
    if (this.samples.length < 2 || right === null) { ctx.fillStyle = "rgba(229,240,255,.72)"; ctx.font = "16px Segoe UI"; ctx.fillText(t("loading"), 24, 38); return; }
    const i0 = lowerBoundByTime(this.samples, left);
    const i1 = lowerBoundByTime(this.samples, right);
    const rawVisibleCount = Math.max(0, i1 - i0);
    if (rawVisibleCount < 2) { ctx.fillStyle = "rgba(251,191,36,.82)"; ctx.font = "16px Segoe UI"; ctx.fillText(t("bufferLow"), 24, 38); this.checkCoverageAndBackfill(); return; }
    const maxDrawPoints = Math.max(1200, Math.min(6000, Math.floor(w * 3)));
    const reduced = downsampleRangeMinMax(this.samples, i0, i1, maxDrawPoints);
    const visible = reduced.points;
    let minY = reduced.minY, maxY = reduced.maxY;
    if (!Number.isFinite(minY) || !Number.isFinite(maxY) || visible.length < 2) return;
    const mid = (minY + maxY) / 2, half = Math.max(1, (maxY - minY) / 2) / Number($("gain").value || 1);
    this.currentView = { left, right, windowSec, mid, half, width: w, height: h };
    this.drawEventOverlays(w, h, left, right, windowSec, mid, half);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip(); ctx.lineWidth = 1.25; ctx.strokeStyle = "#22d3ee"; ctx.shadowColor = "rgba(34,211,238,.55)"; ctx.shadowBlur = 8; ctx.beginPath();
    for (let i = 0; i < visible.length; i++) { const p = visible[i]; const x = ((p.t - left) / windowSec) * w; const y = h / 2 - ((p.y - mid) / half) * (h * 0.42); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
    this.drawEventMarkers(w, h, left, right, windowSec, mid, half);
    ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(229,240,255,.76)"; ctx.font = "12px Consolas"; const d = Math.max(0, Date.now() / 1000 - right);
    const drawInfo = rawVisibleCount === visible.length ? `${visible.length.toLocaleString()} pts` : `${rawVisibleCount.toLocaleString()} → ${visible.length.toLocaleString()} draw`;
    const strideInfo = reduced.scanStride > 1 ? ` · stride=${reduced.scanStride}` : "";
    ctx.fillText(`${this.traceId}  ${drawInfo}${strideInfo}  delay=${d.toFixed(1)}s`, 14, h - 14);
  }

  drawEventOverlays(w, h, left, right, windowSec, mid, half) {
    const ctx = this.ctx;
    const activeEvents = this.events.filter(e => {
      const a = Number(e.trigger_start || e.time || 0);
      const b = Number(e.trigger_end || e.time || 0);
      return b >= left && a <= right;
    });
    for (const evt of activeEvents) {
      const start = Number(evt.trigger_start || evt.time);
      const end = Number(evt.trigger_end || evt.time);
      const x1 = Math.max(0, ((start - left) / windowSec) * w);
      const x2 = Math.min(w, ((end - left) / windowSec) * w);
      ctx.save();
      ctx.fillStyle = "rgba(251,191,36,.14)";
      ctx.strokeStyle = "rgba(251,191,36,.75)";
      ctx.lineWidth = 1;
      ctx.fillRect(x1, 0, Math.max(2, x2 - x1), h);
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, h); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(251,191,36,.96)";
      ctx.font = "12px Consolas";
      ctx.fillText(`${t("triggerLabel")} ${Number(evt.ratio || 0).toFixed(1)}`, Math.min(w - 92, x1 + 8), 18);
      ctx.restore();
    }
  }

  nearestSample(ts) {
    if (!this.samples.length) return null;
    const idx = lowerBoundByTime(this.samples, ts);
    if (idx <= 0) return this.samples[0];
    if (idx >= this.samples.length) return this.samples[this.samples.length - 1];
    return Math.abs(this.samples[idx].t - ts) < Math.abs(this.samples[idx - 1].t - ts) ? this.samples[idx] : this.samples[idx - 1];
  }

  drawEventMarkers(w, h, left, right, windowSec, mid, half) {
    const ctx = this.ctx;
    for (const evt of this.events) {
      this.drawTimeMarker({
        ts: Number(evt.p_pick_time || evt.time),
        left, right, windowSec, w, h, mid, half,
        color: "#34d399",
        label: "P",
        shape: "triangle",
      });
      this.drawTimeMarker({
        ts: Number(evt.peak_time || evt.time),
        left, right, windowSec, w, h, mid, half,
        color: "#fbbf24",
        label: t("peak"),
        shape: "circle",
      });
    }
  }

  drawTimeMarker({ts, left, right, windowSec, w, h, mid, half, color, label, shape}) {
    if (!Number.isFinite(ts) || ts < left || ts > right) return;
    const ctx = this.ctx;
    const px = ((ts - left) / windowSec) * w;
    const nearest = this.nearestSample(ts);
    const py0 = nearest ? h / 2 - ((nearest.y - mid) / half) * (h * 0.42) : 24;
    const py = Math.max(12, Math.min(h - 12, py0));
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(2,8,23,.95)";
    ctx.lineWidth = 2;
    if (shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(px, py - 7);
      ctx.lineTo(px - 7, py + 6);
      ctx.lineTo(px + 7, py + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.font = "12px Consolas";
    ctx.fillText(label, Math.min(w - 60, px + 9), Math.max(14, py - 8));
    ctx.restore();
  }

  animate() { if (!this.animationRunning) return; this.draw(); requestAnimationFrame(() => this.animate()); }
  startAnimation() { if (this.animationRunning) return; this.animationRunning = true; this.lastNow = null; requestAnimationFrame(() => this.animate()); }
  stopAnimation() { this.animationRunning = false; }

  async destroy() {
    try { await fetch(`/api/monitors/${encodeURIComponent(this.id)}`, { method: "DELETE" }); } catch {}
    this.removeLocal();
  }

  removeLocal() {
    this.stopAnimation();
    this.card.remove();
    monitors.delete(this.id);
    updateStationList(); updateGlobalMetrics(); updateAdaptiveHeights();
    log(`${t("remove")} ${this.key}`);
  }
}

async function addStation() {
  const config = {
    server: $("server").value.trim(), network: $("network").value.trim(), station: $("station").value.trim(), location: $("location").value.trim(), channel: $("channel").value.trim(),
    window_seconds: Number($("windowSeconds").value || 300), playback_delay_seconds: Number($("delaySeconds").value || 300),
    buffer_seconds: Math.max(3600, Number($("delaySeconds").value || 300) + Number($("windowSeconds").value || 300) * 3),
    trigger_threshold: Number($("triggerThreshold")?.value || 4.0),
  };
  const key = stationKey(config);
  try {
    const res = await fetch("/api/monitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    if (!res.ok) throw new Error(await res.text());
    const payload = await res.json();
    const m = upsertMonitor(payload.monitor);
    setStatus("ok", t("connecting"), `${key}`);
    if (m) m.loadSnapshot();
  } catch (err) { setStatus("error", t("addFailed"), String(err)); log(`${t("addFailed")} ${key}: ${err}`); }
}

async function stopAll() {
  for (const m of [...monitors.values()]) await m.destroy();
  setStatus("muted", t("stopped"), t("stoppedText"));
}

let lastCommittedTriggerThreshold = null;
async function updateDetectorThresholds() {
  const threshold = Number($("triggerThreshold")?.value || 4.0);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    log(tf("detectorIgnored", {value: $("triggerThreshold")?.value}));
    return;
  }
  if (lastCommittedTriggerThreshold !== null && Math.abs(threshold - lastCommittedTriggerThreshold) < 1e-12) return;
  lastCommittedTriggerThreshold = threshold;
  for (const m of monitors.values()) {
    try {
      const res = await fetch(`/api/monitors/${encodeURIComponent(m.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger_threshold: threshold }),
      });
      if (res.ok) {
        const payload = await res.json();
        m.info = payload.monitor;
      }
    } catch (err) {
      log(`${m.key}: ${t("detectorUpdateFailed")} ${err}`);
    }
  }
  log(tf("detectorUpdated", {value: threshold}));
}

function commitDetectorThreshold() {
  updateDetectorThresholds();
}

async function loadBackendState() {
  try {
    const res = await fetch("/api/monitors");
    if (res.ok) syncMonitorList((await res.json()).monitors || []);
  } catch (err) { log("Monitor list error: " + err); }
  try {
    const res = await fetch("/api/events");
    if (res.ok) {
      detectedEvents = [];
      for (const evt of ((await res.json()).events || []).slice(0, 50).reverse()) addEventRecord(evt);
    }
  } catch (err) { log(`${t("eventRecords")}: ${err}`); }
}

function updateStationList() {
  const box = $("stationList"); box.innerHTML = "";
  if (monitors.size === 0) { const empty = document.createElement("div"); empty.className = "station-item"; empty.textContent = t("noStations"); box.appendChild(empty); return; }
  for (const m of monitors.values()) {
    const item = document.createElement("div"); item.className = "station-item";
    item.draggable = true;
    item.dataset.stationId = m.id;
    item.innerHTML = `<span>${m.key}</span><button class="icon-btn">×</button>`;
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/station-id", m.id);
      e.dataTransfer.effectAllowed = "move";
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    setupDropTarget(item, m.id);
    item.querySelector("button").addEventListener("click", () => m.destroy());
    box.appendChild(item);
  }
}

function eventTimeText(ts) {
  if (!ts) return "--";
  return new Date(ts * 1000).toLocaleString([], { hour12: false });
}

function selectEventRecord(evt) {
  document.querySelectorAll(".event-card.active").forEach(el => el.classList.remove("active"));
  const safeId = CSS.escape(String(evt.id || evt.time));
  const el = document.querySelector(`.event-card[data-event-id="${safeId}"]`);
  if (el) el.classList.add("active");
  let target = evt.monitor_id ? monitors.get(evt.monitor_id) : null;
  if (!target) {
    target = [...monitors.values()].find(m => (evt.station || evt.trace_id || "").startsWith(m.traceId) || (evt.station || evt.trace_id || "").startsWith(m.key));
  }
  if (target) target.focusEvent(evt);
}

function renderEventRecords() {
  const box = $("eventRecords");
  if (!box) return;
  box.innerHTML = "";
  for (const e of detectedEvents) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "event-card";
    card.dataset.eventId = String(e.id || e.time);
    const ratio = Number(e.ratio || 0);
    const mag = Number(e.magnitude || 0);
    const peak = Number(e.peak || 0);
    card.innerHTML = `
      <div class="event-card-top">
        <strong>${t("pTime")} ${eventTimeText(e.p_pick_time || e.time)}</strong>
        <span class="event-status">${e.status || "detected"}</span>
      </div>
      <div class="event-station">${e.station || e.trace_id || "--"}</div>
      <div class="event-metrics-row">
        <span>STA/LTA <b>${ratio.toFixed(2)}</b></span>
        <span>${t("peak")} <b>${peak.toFixed(0)}</b></span>
        <span>M~ <b>${mag.toFixed(1)}</b></span>
        <span>${t("picker")} <b>${e.pick_method || "--"}</b></span>
      </div>
      <div class="event-subline">${t("peak")} ${eventTimeText(e.peak_time)} · ${t("intensity")} ${e.intensity || "--"}</div>
      <div class="event-actions-row">
        <span class="event-hint">${t("eventHint")}</span>
        <button class="event-delete-btn" type="button" title="${t("deleteEvent")}">${t("deleteEvent")}</button>
      </div>`;
    card.addEventListener("click", () => selectEventRecord(e));
    card.querySelector(".event-delete-btn").addEventListener("click", (evt) => {
      evt.stopPropagation();
      deleteEventRecord(e.id);
    });
    box.appendChild(card);
  }
  if ($("eventCount")) $("eventCount").textContent = detectedEvents.length;
}

function eventMergeKey(evt) {
  return `${evt.monitor_id || ""}|${evt.station || evt.trace_id || ""}|${Math.round(Number(evt.time || 0))}`;
}

function addEventRecord(evt) {
  const key = eventMergeKey(evt);
  detectedEvents = detectedEvents.filter(e => e.id !== evt.id && eventMergeKey(e) !== key);
  detectedEvents.unshift(evt);
  if (detectedEvents.length > 50) detectedEvents.pop();
  renderEventRecords();
}

function removeEventRecord(eventId) {
  detectedEvents = detectedEvents.filter(e => String(e.id) !== String(eventId));
  monitors.forEach(m => { m.events = m.events.filter(e => String(e.id) !== String(eventId)); m.draw(); });
  renderEventRecords();
}

async function deleteEventRecord(eventId) {
  if (!eventId) return;
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    removeEventRecord(eventId);
    log(`${t("eventDeleted")}: ${eventId}`);
  } catch (err) {
    log(`${t("deleteEventFailed")}: ${err}`);
  }
}

async function clearEventRecords() {
  if (!confirm(t("clearEventsConfirm"))) return;
  try {
    const res = await fetch("/api/events", { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    detectedEvents = [];
    monitors.forEach(m => { m.events = []; m.draw(); });
    renderEventRecords();
    log(t("allEventsCleared"));
  } catch (err) {
    log(`${t("clearEventsFailed")}: ${err}`);
  }
}

function updateGlobalMetrics() {
  $("stationCount").textContent = monitors.size;
  let total = 0, maxGap = 0;
  for (const m of monitors.values()) { total += m.samples.length; if (m.latestSampleTime) maxGap = Math.max(maxGap, Math.max(0, Date.now() / 1000 - Number($("delaySeconds").value || 300) - m.latestSampleTime)); }
  $("totalSamples").textContent = total.toLocaleString();
  $("globalLatency").textContent = maxGap < 60 ? `${maxGap.toFixed(1)}s` : `${(maxGap / 60).toFixed(1)}m`;
}

function applyQueryPreset() {
  $("network").value = DEFAULT_STATION.network;
  $("station").value = DEFAULT_STATION.station;
  $("location").value = DEFAULT_STATION.location;
  $("channel").value = DEFAULT_STATION.channel;
  if (urlParams.get("server")) $("server").value = urlParams.get("server");
  if (urlParams.get("window_seconds")) $("windowSeconds").value = urlParams.get("window_seconds");
  if (urlParams.get("playback_delay_seconds")) $("delaySeconds").value = urlParams.get("playback_delay_seconds");
  if (urlParams.get("gain")) $("gain").value = urlParams.get("gain");
  if (urlParams.get("trigger_threshold") && $("triggerThreshold")) $("triggerThreshold").value = urlParams.get("trigger_threshold");
  if (EMBED_MODE) document.body.classList.add("embed-mode");
}

async function autostartFromQuery() {
  const autostart = ["1", "true", "yes"].includes((urlParams.get("autostart") || "").toLowerCase());
  if (!autostart) return;
  const key = stationKey({
    network: $("network").value.trim(),
    station: $("station").value.trim(),
    location: $("location").value.trim(),
    channel: $("channel").value.trim(),
  });
  const exists = [...monitors.values()].some(m => m.key === key || m.traceId === key);
  if (!exists) await addStation();
}

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $("langZh").classList.toggle("active-lang", lang === "zh"); $("langEn").classList.toggle("active-lang", lang === "en");
  if (monitors.size === 0) setStatus("muted", t("idle"), t("idleText"));
  if (selectedStation) selectStation(selectedStation);
  if ($("mapCoord")) $("mapCoord").textContent = tf("lonLat", {lon: "--", lat: "--"});
  monitors.forEach(m => m.refreshLanguage());
  renderEventRecords();
  drawStationMap();
  updateStationList(); updateGlobalMetrics(); updateAdaptiveHeights();
}

window.addEventListener("resize", () => requestAnimationFrame(updateAdaptiveHeights));
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    monitors.forEach(m => {
      m.playbackRight = null;
      m.lastNow = null;
      m.draw();
    });
  }
});
$("addStationBtn").addEventListener("click", addStation);
$("stopAllBtn").addEventListener("click", stopAll);
$("windowSeconds").addEventListener("input", () => { monitors.forEach(m => { m.playbackRight = null; m.checkCoverageAndBackfill(); m.draw(); }); });
$("delaySeconds").addEventListener("input", () => { monitors.forEach(m => { m.playbackRight = null; m.checkCoverageAndBackfill(); m.draw(); }); });
$("gain").addEventListener("input", () => monitors.forEach(m => m.draw()));
if ($("triggerThreshold")) {
  $("triggerThreshold").addEventListener("change", commitDetectorThreshold);
  $("triggerThreshold").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      $("triggerThreshold").blur();
      commitDetectorThreshold();
    }
  });
}
if ($("clearEventsBtn")) $("clearEventsBtn").addEventListener("click", clearEventRecords);
$("langZh").addEventListener("click", () => { lang = "zh"; localStorage.setItem("seisrt_lang", lang); applyLanguage(); });
$("langEn").addEventListener("click", () => { lang = "en"; localStorage.setItem("seisrt_lang", lang); applyLanguage(); });
if ($("loadStationsBtn")) $("loadStationsBtn").addEventListener("click", () => loadStationCatalog(true));
if ($("stationSelect")) $("stationSelect").addEventListener("change", () => selectStation(stationCatalog.find(s => s.id === $("stationSelect").value)));
if ($("locationSelect")) $("locationSelect").addEventListener("change", () => {
  if (!selectedStation) return;
  const loc = $("locationSelect").value;
  $("location").value = loc;
  fillSelectOptions($("channelSelect"), (selectedStation.loc_channels && selectedStation.loc_channels[loc]) || selectedStation.channels || []);
  $("channel").value = $("channelSelect").value || "BHZ";
});
if ($("channelSelect")) $("channelSelect").addEventListener("change", () => { $("channel").value = $("channelSelect").value; });
if ($("mapZoomIn")) $("mapZoomIn").addEventListener("click", () => zoomMap(1.6));
if ($("mapZoomOut")) $("mapZoomOut").addEventListener("click", () => zoomMap(1 / 1.6));
if ($("mapReset")) $("mapReset").addEventListener("click", resetMap);
if ($("stationMapCanvas")) {
  const mapCanvas = $("stationMapCanvas");
  let moved = false;
  mapCanvas.addEventListener("mousedown", (e) => {
    mapState.dragging = true;
    mapState.lastX = e.clientX;
    mapState.lastY = e.clientY;
    moved = false;
  });
  window.addEventListener("mouseup", () => { mapState.dragging = false; });
  mapCanvas.addEventListener("mousemove", (e) => {
    const rect = mapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const ll = xyToLonLat(x, y, rect.width, rect.height);
    if ($("mapCoord")) $("mapCoord").textContent = tf("lonLat", {lon: ll.lon.toFixed(2), lat: ll.lat.toFixed(2)});
    if (mapState.dragging) {
      const b = mapBounds();
      const dx = e.clientX - mapState.lastX;
      const dy = e.clientY - mapState.lastY;
      mapState.centerLon -= dx / rect.width * (b.right - b.left);
      mapState.centerLat += dy / rect.height * (b.top - b.bottom);
      mapState.lastX = e.clientX;
      mapState.lastY = e.clientY;
      moved = true;
      clampMapCenter();
      drawStationMap();
    }
  });
  mapCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = mapCanvas.getBoundingClientRect();
    zoomMap(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });
  mapCanvas.addEventListener("click", (e) => {
    if (moved || !stationCatalog.length) return;
    const rect = mapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let best = null, bestD = Infinity;
    for (const sta of stationCatalog) {
      const p = lonLatToXY(sta.longitude, sta.latitude, rect.width, rect.height);
      if (p.x < 0 || p.x > rect.width || p.y < 0 || p.y > rect.height) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { bestD = d; best = sta; }
    }
    if (best && bestD < 18) selectStation(best);
  });
}
window.addEventListener("resize", fitStationMap);
applyQueryPreset();
applyLanguage();
ensureMonitorSocket();
loadBackendState().finally(() => {
  setTimeout(() => autostartFromQuery().catch(err => log(`autostart failed: ${err}`)), 350);
});
setTimeout(() => loadStationCatalog(false).catch(err => log(`${t("stationCatalogError")}: ${err}`)), 200);





