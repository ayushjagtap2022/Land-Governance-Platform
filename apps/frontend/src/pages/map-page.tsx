import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Map as MapIcon,
  MapPin,
  Minus,
  MousePointer2,
  Pentagon,
  RotateCcw,
  Ruler,
  Satellite,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Circle, CircleMarker, MapContainer, Polygon, ScaleControl, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'wouter';
import type { LatLng, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LayerKey = 'cadastral' | 'lulc' | 'dispute' | 'climate' | 'satellite';

type LayerState = {
  label: string;
  description: string;
  visible: boolean;
  opacity: number;
  color: string;
};

type DistrictFact = {
  district: string;
  state: string;
  coordinates: [number, number];
  villages: string;
  modernization: number;
  disputes: number;
  cards: string;
  risk: 'Low' | 'Moderate' | 'High';
};

const indiaCenter: [number, number] = [20.5937, 78.9629];

const districtFacts: DistrictFact[] = [
  { district: 'Pune', state: 'Maharashtra', coordinates: [18.52, 73.86], villages: '1,874', modernization: 88, disputes: 14.2, cards: '412,860', risk: 'Moderate' },
  { district: 'Bhopal', state: 'Madhya Pradesh', coordinates: [23.26, 77.41], villages: '1,542', modernization: 72, disputes: 18.7, cards: '286,410', risk: 'High' },
  { district: 'Lucknow', state: 'Uttar Pradesh', coordinates: [26.85, 80.95], villages: '2,106', modernization: 69, disputes: 21.4, cards: '531,220', risk: 'Moderate' },
  { district: 'Bengaluru Urban', state: 'Karnataka', coordinates: [12.97, 77.59], villages: '1,026', modernization: 91, disputes: 9.8, cards: '198,740', risk: 'Low' },
];

const initialLayers: Record<LayerKey, LayerState> = {
  cadastral: { label: 'Cadastral Parcel Boundaries', description: 'Digitized DILRMP survey grids', visible: true, opacity: 0.82, color: '#287449' },
  lulc: { label: 'Land Use / Land Cover', description: 'Agriculture, urban, forest and waterbody', visible: true, opacity: 0.48, color: '#d49333' },
  dispute: { label: 'Land Dispute Density Heatmap', description: 'Pending litigation density', visible: false, opacity: 0.52, color: '#b23b32' },
  climate: { label: 'Climate Vulnerability & Flood Risk Zones', description: 'Drought and flood exposure', visible: false, opacity: 0.45, color: '#547996' },
  satellite: { label: 'Satellite Imagery Base Layer', description: 'Bhuvan / ISRO overlay toggle', visible: false, opacity: 0.78, color: '#132f4c' },
};

const cadastralPolygons: [number, number][][] = [
  [[19.8, 73.2], [20.6, 73.8], [20.3, 74.7], [19.5, 74.2]],
  [[21.1, 75.1], [21.8, 75.9], [21.4, 76.7], [20.7, 76.1]],
  [[22.7, 78.1], [23.5, 78.7], [23.1, 79.8], [22.3, 79.1]],
  [[25.0, 80.3], [25.8, 81.0], [25.4, 81.9], [24.7, 81.3]],
];

const lulcPolygons: { points: [number, number][]; color: string }[] = [
  { points: [[17.2, 74.2], [18.1, 74.9], [17.7, 76.0], [16.8, 75.3]], color: '#c4a35a' },
  { points: [[20.6, 76.7], [21.4, 77.5], [20.8, 78.3], [20.1, 77.6]], color: '#6e9c66' },
  { points: [[23.9, 80.1], [24.7, 80.7], [24.4, 81.5], [23.7, 80.9]], color: '#7b9cb5' },
];

const riskZones: { points: [number, number][]; color: string }[] = [
  { points: [[15.2, 73.3], [16.5, 73.7], [16.2, 74.8], [15.0, 74.2]], color: '#9b6300' },
  { points: [[25.8, 82.0], [27.0, 82.7], [26.7, 83.8], [25.5, 83.2]], color: '#547996' },
];

function Breadcrumb() {
  return <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb"><span>National Land Governance Platform</span><ChevronRight className="h-3 w-3" /><span className="font-semibold text-[#244562]">GIS Map</span></div>;
}

function MapToolbar({ mode, onModeChange, onExport, onReset }: { mode: 'idle' | 'measure' | 'aoi'; onModeChange: (mode: 'idle' | 'measure' | 'aoi') => void; onExport: () => void; onReset: () => void }) {
  const buttonClass = (active: boolean) => `focus-ring flex items-center gap-2 border px-3 py-2 text-[11px] font-bold ${active ? 'border-[#f2b134] bg-[#fff8e8] text-[#7b4c00]' : 'border-[#244562] text-[#244562] hover:bg-slate-50'}`;
  return (
    <div className="flex flex-wrap gap-2">
      <button className={buttonClass(mode === 'measure')} data-testid="button-map-measure" type="button" onClick={() => onModeChange(mode === 'measure' ? 'idle' : 'measure')}><Ruler className="h-3.5 w-3.5" />Measure Distance (km)</button>
      <button className={buttonClass(mode === 'aoi')} data-testid="button-map-aoi" type="button" onClick={() => onModeChange(mode === 'aoi' ? 'idle' : 'aoi')}><Pentagon className="h-3.5 w-3.5" />Draw Polygon of Interest (AOI)</button>
      <button className={buttonClass(false)} data-testid="button-map-export" type="button" onClick={onExport}><Download className="h-3.5 w-3.5" />Export Map View (PNG/PDF)</button>
      <button className={buttonClass(false)} data-testid="button-map-reset-extent" type="button" onClick={onReset}><RotateCcw className="h-3.5 w-3.5" />Reset Extent</button>
    </div>
  );
}

function MapNavigation({ onReset }: { onReset: () => void }) {
  const map = useMap();
  return (
    <div className="absolute bottom-16 left-3 z-[1000] flex flex-col border border-slate-400 bg-white shadow-sm">
      <button className="focus-ring p-2 hover:bg-slate-100" data-testid="button-map-zoom-in" type="button" aria-label="Zoom in" onClick={() => map.zoomIn()}><ZoomIn className="h-4 w-4 text-[#244562]" /></button>
      <button className="focus-ring border-t border-slate-300 p-2 hover:bg-slate-100" data-testid="button-map-zoom-out" type="button" aria-label="Zoom out" onClick={() => map.zoomOut()}><ZoomOut className="h-4 w-4 text-[#244562]" /></button>
      <button className="focus-ring border-t border-slate-300 p-2 hover:bg-slate-100" data-testid="button-map-reset-control" type="button" aria-label="Reset map extent" onClick={onReset}><RotateCcw className="h-4 w-4 text-[#244562]" /></button>
    </div>
  );
}

function MapPointer({ mode, onCoordinate, onZoom }: { mode: 'idle' | 'measure' | 'aoi'; onCoordinate: (event: LeafletMouseEvent) => void; onZoom: (zoom: number) => void }) {
  useMapEvents({
    click: onCoordinate,
    mousemove: onCoordinate,
    zoomend: (event) => onZoom(event.target.getZoom()),
  });
  return null;
}

function LayerControl({ layers, onToggle, onOpacity }: { layers: Record<LayerKey, LayerState>; onToggle: (key: LayerKey) => void; onOpacity: (key: LayerKey, value: number) => void }) {
  return (
    <div className="absolute right-3 top-3 z-[1000] w-[285px] border border-slate-400 bg-white/95 shadow-md" data-testid="panel-map-layers">
      <div className="border-b border-slate-300 bg-[#132f4c] px-4 py-3 text-xs font-bold text-white"><span className="flex items-center gap-2"><MapIcon className="h-4 w-4 text-[#f2b134]" />Map Layers</span></div>
      <div className="divide-y divide-slate-200">
        {(Object.keys(layers) as LayerKey[]).map((key) => {
          const layer = layers[key];
          return (
            <div className="p-3" key={key}>
              <label className="flex items-start gap-2 text-[11px] font-bold text-[#244562]">
                <input className="mt-0.5 h-3.5 w-3.5 accent-[#244562]" data-testid={`checkbox-map-layer-${key}`} type="checkbox" checked={layer.visible} onChange={() => onToggle(key)} />
                <span>{layer.label}<span className="mt-1 block text-[10px] font-normal text-slate-500">{layer.description}</span></span>
              </label>
              <div className="mt-2 flex items-center gap-2 pl-5">
                <span className="h-2 w-2" style={{ backgroundColor: layer.color }} />
                <input className="h-1 flex-1 accent-[#244562]" data-testid={`slider-map-opacity-${key}`} type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={(event) => onOpacity(key, Number(event.target.value))} />
                <span className="w-8 text-right font-mono text-[10px] text-slate-500">{Math.round(layer.opacity * 100)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MapPage() {
  const [layers, setLayers] = useState(initialLayers);
  const [year, setYear] = useState(2024);
  const [mode, setMode] = useState<'idle' | 'measure' | 'aoi'>('idle');
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [zoom, setZoom] = useState(5);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [aoiPoints, setAoiPoints] = useState<[number, number][]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictFact | null>(null);
  const [notice, setNotice] = useState('');
  const [districtsList, setDistrictsList] = useState<DistrictFact[]>(districtFacts);
  const [districtSearch, setDistrictSearch] = useState('');
  const [lulcFeatures, setLulcFeatures] = useState<{ points: [number, number][]; color: string }[]>(lulcPolygons);

  useEffect(() => {
    fetch('/api/v1/geodata/districts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistrictsList(data);
        }
      })
      .catch(err => console.warn('Could not load real geodata districts, using fallback', err));
  }, []);

  useEffect(() => {
    fetch(`/api/v1/geodata/geojson/lulc?year=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          const polys = data.features.map((f: any) => ({
            points: f.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]),
            color: f.properties.color || '#6e9c66'
          }));
          setLulcFeatures(polys);
        }
      })
      .catch(() => {});
  }, [year]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return districtsList.slice(0, 60);
    const q = districtSearch.toLowerCase();
    return districtsList.filter(d => 
      d.district.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    ).slice(0, 60);
  }, [districtsList, districtSearch]);

  const currentProgress = Math.min(94, 52 + (year - 2016) * 4);
  const currentUrban = Math.min(28, 17 + (year - 2016) * 1.3);
  const currentAgriculture = Math.max(48, 61 - (year - 2016) * 1.1);
  const scaleLabel = zoom >= 6 ? '100 km' : zoom === 5 ? '250 km' : '500 km';
  const distanceKm = measurePoints.length === 2
    ? Math.round(haversine(measurePoints[0], measurePoints[1]))
    : 0;

  const toggleLayer = (key: LayerKey) => setLayers((current) => ({ ...current, [key]: { ...current[key], visible: !current[key].visible } }));
  const setLayerOpacity = (key: LayerKey, value: number) => setLayers((current) => ({ ...current, [key]: { ...current[key], opacity: value } }));
  const resetExtent = () => setNotice('Map extent reset to India view.');
  const handleCoordinate = (event: LeafletMouseEvent) => {
    setCoords(event.latlng);
    if (event.type !== 'click') return;
    if (mode === 'measure') setMeasurePoints((current) => current.length >= 2 ? [[event.latlng.lat, event.latlng.lng]] : [...current, [event.latlng.lat, event.latlng.lng]]);
    if (mode === 'aoi') setAoiPoints((current) => current.length >= 5 ? [[event.latlng.lat, event.latlng.lng]] : [...current, [event.latlng.lat, event.latlng.lng]]);
  };

  const metrics = useMemo(() => [
    { label: 'Digitized cadastral coverage', value: `${currentProgress}%`, color: '#287449' },
    { label: 'Agriculture classification', value: `${Math.round(currentAgriculture)}%`, color: '#c4a35a' },
    { label: 'Urban classification', value: `${Math.round(currentUrban)}%`, color: '#b23b32' },
  ], [currentAgriculture, currentProgress, currentUrban]);

  return (
    <section className="w-full px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb />
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">Spatial data access / national view</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid="text-page-title-gis-map">Geospatial GIS Visualization Engine</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Explore cadastral modernization, land-use classification, disputes and climate exposure across India through an accountable map interface.</p>
        </div>
        <MapToolbar mode={mode} onModeChange={(nextMode) => { setMode(nextMode); setMeasurePoints([]); setAoiPoints([]); }} onExport={() => setNotice('Map view export queued as PNG/PDF.')} onReset={resetExtent} />
      </div>
      {notice && <div className="mb-4 flex items-center justify-between border border-[#b7d4c1] bg-[#f0f8f1] p-3 text-xs font-semibold text-[#287449]" data-testid="status-map-action"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{notice}</span><button className="focus-ring" type="button" aria-label="Dismiss map notice" onClick={() => setNotice('')}><X className="h-4 w-4" /></button></div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden border border-slate-400 bg-[#dbe7ea] shadow-sm">
            <MapContainer center={indiaCenter} zoom={5} minZoom={4} maxZoom={9} zoomControl={false} className="h-[650px] w-full" scrollWheelZoom>
              {layers.satellite.visible ? <TileLayer attribution="Tiles © Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" opacity={layers.satellite.opacity} /> : <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.8} />}
              {layers.cadastral.visible && cadastralPolygons.map((points, index) => <Polygon key={`cadastral-${index}`} positions={points} pathOptions={{ color: layers.cadastral.color, weight: 1, opacity: layers.cadastral.opacity, fillOpacity: 0.08 }} />)}
              {layers.lulc.visible && lulcFeatures.map((zone, index) => <Polygon key={`lulc-${index}`} positions={zone.points} pathOptions={{ color: zone.color, weight: 1, opacity: layers.lulc.opacity, fillOpacity: layers.lulc.opacity * 0.35 }} />)}
              {layers.dispute.visible && filteredDistricts.slice(0, 15).map((district) => <Circle key={`dispute-${district.district}`} center={district.coordinates} radius={55000} pathOptions={{ color: '#b23b32', fillColor: '#b23b32', opacity: layers.dispute.opacity, fillOpacity: layers.dispute.opacity * 0.45 }} />)}
              {layers.climate.visible && riskZones.map((zone, index) => <Polygon key={`risk-${index}`} positions={zone.points} pathOptions={{ color: zone.color, weight: 1, opacity: layers.climate.opacity, fillOpacity: layers.climate.opacity * 0.45 }} />)}
              {filteredDistricts.map((district) => <CircleMarker center={district.coordinates} key={district.district} radius={6} pathOptions={{ color: '#132f4c', weight: 2, fillColor: district.risk === 'High' ? '#b23b32' : district.risk === 'Moderate' ? '#f2b134' : '#287449', fillOpacity: 1 }} eventHandlers={{ click: () => setSelectedDistrict(district) }}><span /></CircleMarker>)}
              {aoiPoints.length >= 3 && <Polygon positions={aoiPoints} pathOptions={{ color: '#9b6300', weight: 2, dashArray: '5 4', fillColor: '#f2b134', fillOpacity: 0.18 }} />}
              {aoiPoints.map((point, index) => <CircleMarker center={point} key={`aoi-point-${index}`} radius={4} pathOptions={{ color: '#9b6300', fillColor: '#f2b134', fillOpacity: 1 }} />)}
              <MapPointer mode={mode} onCoordinate={handleCoordinate} onZoom={setZoom} />
              <MapNavigation onReset={resetExtent} />
              <ScaleControl position="bottomleft" imperial={false} maxWidth={120} />
            </MapContainer>

            <LayerControl layers={layers} onToggle={toggleLayer} onOpacity={setLayerOpacity} />
            <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-3 border border-slate-400 bg-white/95 px-3 py-2 text-[10px] text-slate-700 shadow-sm">
              <span className="font-bold">Legend</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-[#287449]" />Low Risk</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-[#f2b134]" />Moderate</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-[#b23b32]" />High Risk</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-400 border-t-0 bg-[#132f4c] px-3 py-2 text-[10px] text-white shadow-sm">
            <div className="flex items-center gap-3 font-mono"><span>LAT {coords ? coords.lat.toFixed(4) : '20.5937'}</span><span>LON {coords ? coords.lng.toFixed(4) : '78.9629'}</span><span>ZOOM {zoom}</span><span>SCALE {scaleLabel}</span></div>
            <div className="flex items-center gap-2">{mode === 'measure' && <span className="text-[#f2b134]">{measurePoints.length < 2 ? 'Click two points to measure' : `${distanceKm} km measured`}</span>}{mode === 'aoi' && <span className="text-[#f2b134]">{aoiPoints.length < 3 ? 'Click 3–5 points to draw AOI' : 'AOI polygon active'}</span>}<span className="text-slate-300">India · {year}</span></div>
          </div>
          {mode === 'measure' && measurePoints.length === 2 && <div className="mt-3 border border-[#b9cce0] bg-[#eef4fa] p-3 text-xs text-[#244562]" data-testid="status-map-measure-result"><span className="font-bold">Distance measurement:</span> {distanceKm} km between the selected coordinates.</div>}
        </div>

        <aside className="space-y-5">
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 bg-[#eef2f5] px-4 py-3">
              <p className="section-kicker mb-1">National Cadastral Directory</p>
              <h2 className="text-sm font-bold text-[#244562]">Search 640 Indian Districts</h2>
            </div>
            <div className="p-3 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter district or state..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:ring-1 focus:ring-[#244562] outline-none"
                />
              </div>
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredDistricts.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDistrict(d)}
                    className="w-full text-left py-1.5 px-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">{d.district}</span>
                      <span className="text-[10px] text-slate-500">{d.state}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${d.risk === 'High' ? 'bg-red-100 text-red-700' : d.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {d.disputes}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 bg-[#eef2f5] px-4 py-3"><p className="section-kicker mb-1">Historical view / {year}</p><h2 className="text-sm font-bold text-[#244562]">Land classification timeline</h2></div>
            <div className="p-4">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="map-year">Historical year <span className="float-right font-mono text-[#244562]">{year}</span><input className="mt-3 block w-full accent-[#244562]" data-testid="input-map-history-year" id="map-year" type="range" min="2015" max="2024" step="1" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label>
              <div className="mt-3 flex justify-between font-mono text-[10px] text-slate-500"><span>2015 (Pre-SVAMITVA)</span><span>2024 (Current)</span></div>
              <div className="mt-5 space-y-4">{metrics.map((metric) => <div key={metric.label}><div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-600">{metric.label}</span><span className="font-mono font-bold text-[#244562]">{metric.value}</span></div><div className="h-2 bg-slate-100"><div className="h-full" style={{ backgroundColor: metric.color, width: metric.value }} /></div></div>)}</div>
            </div>
          </div>
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 px-4 py-3"><p className="section-kicker mb-1">Administrative inspection</p><h2 className="text-sm font-bold text-[#244562]">Click a district on the map</h2></div>
            <div className="p-4 text-xs leading-5 text-slate-600"><p className="flex items-center gap-2"><MousePointer2 className="h-4 w-4 text-[#9b6300]" />Select an inspection point to open its technical factsheet.</p><p className="mt-3">Available demonstration districts: Pune, Bhopal, Lucknow and Bengaluru Urban.</p></div>
          </div>
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 px-4 py-3"><p className="section-kicker mb-1">Base map</p><h2 className="text-sm font-bold text-[#244562]">Coordinate reference</h2></div>
            <div className="space-y-2 p-4 text-xs text-slate-600"><p className="flex items-center justify-between"><span>Center</span><span className="font-mono">20.5937, 78.9629</span></p><p className="flex items-center justify-between"><span>Projection</span><span className="font-mono">WGS 84</span></p><p className="flex items-center justify-between"><span>Source</span><span className="font-mono">OSM / ISRO overlay</span></p></div>
          </div>
        </aside>
      </div>

      {selectedDistrict && (
        <div className="fixed inset-0 z-40 flex justify-end bg-[#132f4c]/30" role="dialog" aria-modal="true" aria-label="District technical factsheet">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-300 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-300 bg-[#eef2f5] p-5">
              <div><p className="section-kicker mb-2">Administrative factsheet / technical view</p><h2 className="text-xl font-bold text-[#132f4c]">District: {selectedDistrict.district}</h2><p className="mt-1 text-xs text-slate-600">State: {selectedDistrict.state}</p></div>
              <button className="focus-ring border border-slate-400 px-2 py-1 text-xs font-bold" data-testid="button-close-district-factsheet" type="button" onClick={() => setSelectedDistrict(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 p-3"><p className="text-slate-500">Revenue villages</p><p className="mt-2 font-mono text-xl font-bold text-[#132f4c]">{selectedDistrict.villages}</p></div>
                <div className="border border-slate-200 p-3"><p className="text-slate-500">Cadastral modernization</p><p className="mt-2 font-mono text-xl font-bold text-[#287449]">{selectedDistrict.modernization}%</p></div>
                <div className="border border-slate-200 p-3"><p className="text-slate-500">Disputes / 1,000 owners</p><p className="mt-2 font-mono text-xl font-bold text-[#9b6300]">{selectedDistrict.disputes}</p></div>
                <div className="border border-slate-200 p-3"><p className="text-slate-500">SVAMITVA cards issued</p><p className="mt-2 font-mono text-xl font-bold text-[#244562]">{selectedDistrict.cards}</p></div>
              </div>
              <div className={`border p-4 ${selectedDistrict.risk === 'High' ? 'border-[#e7b6ad] bg-[#fff4f1]' : selectedDistrict.risk === 'Moderate' ? 'border-[#e9c68a] bg-[#fff8e8]' : 'border-[#b7d4c1] bg-[#f0f8f1]'}`}><p className="text-xs font-bold text-[#244562]">Climate &amp; drought risk</p><p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#244562]"><span className="h-2.5 w-2.5 bg-current" />{selectedDistrict.risk}</p></div>
              <Link className="focus-ring flex items-center justify-center gap-2 bg-[#244562] px-4 py-3 text-xs font-bold text-white" data-testid="link-district-repository-records" href={`/repository?search=${encodeURIComponent(selectedDistrict.district)}`}><FileTextIcon />Open District Legal &amp; Cadastral Records in Repository</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FileTextIcon() {
  return <MapPin className="h-4 w-4" />;
}

function haversine(first: [number, number], second: [number, number]) {
  const [lat1, lon1] = first;
  const [lat2, lon2] = second;
  const earthRadius = 6371;
  const latDelta = ((lat2 - lat1) * Math.PI) / 180;
  const lonDelta = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(lonDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}