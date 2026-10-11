import React, { useEffect, useMemo, useRef, useState } from "react";
import L, { Map as LeafletMap, CircleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

type GroupKey = "irgc" | "houthis" | "hezbollah" | "pmf";
type Properties = { group: GroupKey; name: string; short_name?: string; country: string; reference_type: string; period: string; description: string; source: string };
type Feature = { type: "Feature"; id: string; properties: Properties; geometry: { type: "Point"; coordinates: [number, number] } };
type Collection = { type: "FeatureCollection"; metadata?: Record<string, unknown>; features: Feature[] };

const GROUPS: Record<GroupKey, { label: string; color: string }> = {
  irgc: { label: "IRGC", color: "#8b5cf6" },
  houthis: { label: "Houthis / Ansar Allah", color: "#ef4444" },
  hezbollah: { label: "Hezbollah", color: "#f59e0b" },
  pmf: { label: "Popular Mobilization Forces", color: "#10b981" }
};
const DEFAULT_VIEW: [number, number] = [25.5, 44.5];
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
function popup(p: Properties) {
  const source = p.source ? `<div class="popup-source"><a href="${esc(p.source)}" target="_blank" rel="noopener">Source</a></div>` : "";
  return `<h3>${esc(p.name)}</h3><div class="popup-meta">${esc(p.country)} · ${esc(p.period)}</div><div>${esc(p.description)}</div>${source}`;
}

export function MapEditor() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef(new Map<string, CircleMarker>());
  const [features, setFeatures] = useState<Feature[]>([]);
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<GroupKey, boolean>>({ irgc: true, houthis: true, hezbollah: true, pmf: true });
  const [editing, setEditing] = useState<Feature | null>(null);
  const [pointMode, setPointMode] = useState(false);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current).setView(DEFAULT_VIEW, 4);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    fetch("/data/groups.geojson").then(r => { if (!r.ok) throw new Error("Unable to load map data"); return r.json(); })
      .then((data: Collection) => setFeatures((data.features ?? []).filter(f => f.geometry?.type === "Point")))
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return features.filter(f => {
      const p = f.properties;
      const text = [p.name, p.country, p.period, p.description].join(" ").toLowerCase();
      return enabled[p.group] && (!q || text.includes(q));
    });
  }, [features, search, enabled]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layersRef.current.forEach(layer => layer.remove());
    layersRef.current.clear();
    filtered.forEach(f => {
      const [lng, lat] = f.geometry.coordinates;
      const marker = L.circleMarker([lat, lng], { radius: 9, color: "#fff", weight: 2, fillColor: GROUPS[f.properties.group].color, fillOpacity: .9 })
        .addTo(map).bindPopup(popup(f.properties));
      marker.on("dblclick", () => setEditing(f));
      layersRef.current.set(f.id, marker);
    });
  }, [filtered]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pointMode) return;
    const handler = (e: L.LeafletMouseEvent) => {
      if (!editing) return;
      setEditing({ ...editing, geometry: { type: "Point", coordinates: [e.latlng.lng, e.latlng.lat] } });
      setPointMode(false);
    };
    map.once("click", handler);
    map.getContainer().style.cursor = "crosshair";
    return () => { map.off("click", handler); map.getContainer().style.cursor = ""; };
  }, [pointMode, editing]);

  const openNew = () => setEditing({
    type: "Feature", id: makeId(),
    properties: { group: "irgc", name: "", country: "", reference_type: "historical political presence", period: "", description: "", source: "" },
    geometry: { type: "Point", coordinates: [51.389, 35.6892] }
  });
  const save = (f: Feature) => { setFeatures(prev => prev.some(x => x.id === f.id) ? prev.map(x => x.id === f.id ? f : x) : [...prev, f]); setEditing(null); };
  const remove = (id: string) => { if (confirm("Delete this reference?")) setFeatures(prev => prev.filter(f => f.id !== id)); };
  const exportGeoJSON = () => {
    const data: Collection = { type: "FeatureCollection", metadata: { title: "Historical Political Presence Map", scope: "Non-operational", exportedAt: new Date().toISOString() }, features };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "groups.geojson"; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="app">
    <header className="topbar"><div><h1>Historical Political Presence Map</h1><p>TanStack Start · Cloudflare Workers · human-friendly editor</p></div>
      <div className="toolbar"><button className="primary" onClick={openNew}>＋ Add reference</button><button onClick={exportGeoJSON}>Export GeoJSON</button><button onClick={() => mapRef.current?.setView(DEFAULT_VIEW, 4)}>Reset</button></div>
    </header>
    <div className="notice"><b>Scope:</b> broad historical/political context only. Do not enter bases, strongholds, weapons sites, command centers, deployments, or tactical positions.</div>
    <main className="layout"><aside className="sidebar">
      <section className="panel"><div className="section-head"><h2>Search & filters</h2><span>{filtered.length}</span></div>
        <input className="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, country, period…" />
        {(Object.keys(GROUPS) as GroupKey[]).map(k => <label className="filter" key={k}><input type="checkbox" checked={enabled[k]} onChange={e => setEnabled(x => ({...x, [k]: e.target.checked}))}/><span className="swatch" style={{background: GROUPS[k].color}}/>{GROUPS[k].label}</label>)}
      </section>
      <section className="panel"><div className="section-head"><h2>References</h2><span>{features.length}</span></div><div className="list">
        {filtered.map(f => <article className="ref-item" key={f.id}><b>{f.properties.name || "Unnamed reference"}</b><small>{f.properties.country} · {f.properties.period}</small><div className="row">
          <button onClick={() => { setEditing(f); const [lng,lat] = f.geometry.coordinates; mapRef.current?.setView([lat,lng], Math.max(mapRef.current.getZoom(),5)); }}>Edit</button><button onClick={() => remove(f.id)}>Delete</button>
        </div></article>)}
      </div></section>
    </aside>
    <section className="map-area"><div ref={mapEl} className="map"/>{pointMode && <div className="map-hint">Click the map to set the broad reference point · Esc to cancel</div>}</section></main>
    {editing && <EditorModal feature={editing} setFeature={setEditing} pointMode={pointMode} setPointMode={setPointMode} onSave={save} onClose={() => {setEditing(null); setPointMode(false)}}/>}
  </div>;
}

function EditorModal({ feature, setFeature, pointMode, setPointMode, onSave, onClose }: {
  feature: Feature; setFeature: React.Dispatch<React.SetStateAction<Feature | null>>; pointMode: boolean;
  setPointMode: (x:boolean)=>void; onSave: (f:Feature)=>void; onClose: ()=>void;
}) {
  const p=feature.properties;
  const update=(key:keyof Properties,value:string)=>setFeature(f=>f?{...f,properties:{...f.properties,[key]:value}}:f);
  const coords=feature.geometry.coordinates;
  return <div className="modal" onKeyDown={e=>e.key==="Escape"&&onClose()}>
    <form className="modal-card" onSubmit={e=>{e.preventDefault(); if(!p.name.trim()){alert("Enter a name.");return} onSave(feature)}}>
      <div className="modal-head"><div><h2>{p.name ? "Edit reference" : "Add reference"}</h2><p>Plain-language map data</p></div><button type="button" className="close" onClick={onClose}>×</button></div>
      <div className="form">
        <label>Organization<select value={p.group} onChange={e=>update("group",e.target.value as GroupKey)}>{(Object.keys(GROUPS) as GroupKey[]).map(k=><option key={k} value={k}>{GROUPS[k].label}</option>)}</select></label>
        <label>Name<input value={p.name} onChange={e=>update("name",e.target.value)} required/></label>
        <label>Country / region<input value={p.country} onChange={e=>update("country",e.target.value)}/></label>
        <label>Reference type<select value={p.reference_type} onChange={e=>update("reference_type",e.target.value)}><option>country-level organizational reference</option><option>country-level political/territorial reference</option><option>country-level political/social reference</option><option>country-level institutional reference</option><option>historical political presence</option><option>other broad reference</option></select></label>
        <label>Historical period<input value={p.period} onChange={e=>update("period",e.target.value)} placeholder="e.g. 2000–2026"/></label>
        <label>Description<textarea rows={4} value={p.description} onChange={e=>update("description",e.target.value)}/></label>
        <label>Source URL<input type="url" value={p.source} onChange={e=>update("source",e.target.value)} placeholder="https://…"/></label>
        <div className="location"><div><b>Broad map point</b><small>{coords[1].toFixed(4)}, {coords[0].toFixed(4)}</small></div><button type="button" onClick={()=>setPointMode(true)}>{pointMode?"Click map…":"Set map point"}</button></div>
        <small className="note">Only broad, non-operational references are supported.</small>
        <div className="actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary">Save reference</button></div>
      </div>
    </form>
  </div>;
}