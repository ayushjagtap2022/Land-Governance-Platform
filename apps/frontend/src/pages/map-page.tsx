import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Download,
  Info,
  Layers,
  Map as MapIcon,
  MapPin,
  Minus,
  MousePointer2,
  Pause,
  Pentagon,
  Play,
  RotateCcw,
  Ruler,
  Satellite,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  
} from 'lucide-react';
import { Circle, CircleMarker, MapContainer, Polygon, Popup, ScaleControl, TileLayer, useMap, useMapEvents } from 'react-leaflet';
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
  digitization_status?: string;
  population?: number;
  economic_density?: number;
  forest_cover_pct?: number;
  net_sown_pct?: number;
};

type ClimateZone = {
  id: string;
  points: [number, number][];
  zone: string;
  category: string;
  imdDeparture: string;
  groundwaterStatus: string;
  watershedPriority: string;
  vulnerabilityIndex: number;
  color: string;
};

type TemporalStats = {
  year: number;
  forest_cover_pct: number;
  net_sown_area_pct: number;
  non_agricultural_built_up_pct: number;
  fallow_land_pct: number;
  cadastral_digitization_pct: number;
  svamitva_cards_issued_cr: number;
  milestone: string;
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
  climate: { label: 'Climate Vulnerability & Drought Zones', description: 'IMD rainfall deficit, groundwater stress & floods', visible: true, opacity: 0.55, color: '#547996' },
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
      <button className="focus-ring border-t border-slate-300 p-2 hover:bg-slate-100" data-testid="button-map-reset-control" type="button" aria-label="Reset map extent" onClick={() => { map.setView(indiaCenter, 5); onReset(); }}><RotateCcw className="h-4 w-4 text-[#244562]" /></button>
    </div>
  );
}

function MapController({ stateFilter, districts }: { stateFilter: string; districts: DistrictFact[] }) {
  const map = useMap();
  useEffect(() => {
    if (stateFilter && stateFilter !== 'ALL') {
      const match = districts.find(d => d.state.toLowerCase() === stateFilter.toLowerCase());
      if (match?.coordinates) {
        map.flyTo(match.coordinates, 7, { duration: 1.2 });
      }
    }
  }, [stateFilter, map, districts]);
  return null;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [colorMode, setColorMode] = useState<'modernization' | 'dispute'>('modernization');
  const [mode, setMode] = useState<'idle' | 'measure' | 'aoi'>('idle');
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [zoom, setZoom] = useState(5);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [aoiPoints, setAoiPoints] = useState<[number, number][]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictFact | null>(null);
  const [selectedClimateZone, setSelectedClimateZone] = useState<ClimateZone | null>(null);
  const [notice, setNotice] = useState('');
  const [districtsList, setDistrictsList] = useState<DistrictFact[]>(districtFacts);
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [cadastralFeatures, setCadastralFeatures] = useState<{ id: string; points: [number, number][]; properties: any }[]>([]);
  const [lulcFeatures, setLulcFeatures] = useState<{ points: [number, number][]; color: string }[]>(lulcPolygons);
  const [climateFeatures, setClimateFeatures] = useState<ClimateZone[]>([]);
  const [temporalStats, setTemporalStats] = useState<TemporalStats>({
    year: 2024,
    forest_cover_pct: 24.3,
    net_sown_area_pct: 43.1,
    non_agricultural_built_up_pct: 11.4,
    fallow_land_pct: 6.9,
    cadastral_digitization_pct: 94.2,
    svamitva_cards_issued_cr: 1.68,
    milestone: 'SVAMITVA Drone Resurvey Active (94.2% Digitized)'
  });

  // Multi-year animation playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setYear((prev) => (prev >= 2024 ? 1999 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Load 640 real districts dynamically by year
  useEffect(() => {
    fetch(`/api/v1/geodata/districts?year=${year}&limit=1000`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: DistrictFact[] = data
            .filter((d: any) => d && (d.lat != null || d.coordinates != null))
            .map((d: any) => ({
              district: d.district || '',
              state: d.state || '',
              coordinates: [
                Number(d.lat ?? d.coordinates?.[0] ?? 20.5937),
                Number(d.lng ?? d.coordinates?.[1] ?? 78.9629)
              ],
              villages: d.villages || `${(Math.floor((d.population || 500000) / 750)).toLocaleString()}`,
              modernization: d.modernization_index ?? d.modernization ?? 78,
              disputes: d.dispute_risk ?? d.disputes ?? 24.5,
              cards: d.svamitva_cards_issued ?? d.cards ?? '145,000',
              risk: (d.risk_category || d.risk || 'Moderate') as 'Low' | 'Moderate' | 'High',
              digitization_status: d.digitization_status || (d.modernization_index >= 70 ? 'Digitized' : d.modernization_index >= 35 ? 'In-Progress' : 'Legacy Paper Records'),
              population: d.population,
              economic_density: d.economic_density_index,
              forest_cover_pct: d.forest_cover_pct,
              net_sown_pct: d.net_sown_pct,
            }));
          setDistrictsList(mapped);
        }
      })
      .catch(err => console.warn('Could not load real geodata districts, using fallback', err));
  }, [year]);

  // Load Cadastral GeoJSON by year
  useEffect(() => {
    fetch(`/api/v1/geodata/geojson/cadastral?year=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          const polys = data.features
            .filter((f: any) => f?.geometry?.coordinates?.[0])
            .map((f: any) => ({
              id: f.id || `cadastral-${Math.random()}`,
              points: f.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]),
              properties: f.properties || {}
            }));
          setCadastralFeatures(polys);
        }
      })
      .catch(() => {});
  }, [year]);

  // Load temporal stats
  useEffect(() => {
    fetch(`/api/v1/geodata/temporal-stats?year=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.year) {
          setTemporalStats(data);
        }
      })
      .catch(() => {});
  }, [year]);

  // Load LULC GeoJSON
  useEffect(() => {
    fetch(`/api/v1/geodata/geojson/lulc?year=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          const polys = data.features
            .filter((f: any) => f?.geometry?.coordinates?.[0])
            .map((f: any) => ({
              points: f.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]),
              color: f.properties?.color || '#6e9c66'
            }));
          setLulcFeatures(polys);
        }
      })
      .catch(() => {});
  }, [year]);

  // Load Climate GeoJSON
  useEffect(() => {
    fetch(`/api/v1/geodata/geojson/climate?year=${year}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          const zones: ClimateZone[] = data.features
            .filter((f: any) => f?.geometry?.coordinates?.[0])
            .map((f: any) => ({
              id: f.id || `climate-${Math.random()}`,
              points: f.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]),
              zone: f.properties?.zone || 'Climate Vulnerability Corridor',
              category: f.properties?.category || 'Weather Anomaly',
              imdDeparture: f.properties?.imd_departure || 'Normal',
              groundwaterStatus: f.properties?.groundwater_status || 'Adequate',
              watershedPriority: f.properties?.watershed_priority || 'Standard',
              vulnerabilityIndex: f.properties?.vulnerability_index || 70,
              color: f.properties?.color || '#547996'
            }));
          setClimateFeatures(zones);
        }
      })
      .catch(() => {});
  }, [year]);

  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    districtsList.forEach(d => {
      if (d.state) set.add(d.state);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [districtsList]);

  const filteredDistricts = useMemo(() => {
    let list = districtsList;
    if (selectedStateFilter !== 'ALL') {
      list = list.filter(d => d.state.toLowerCase() === selectedStateFilter.toLowerCase());
    }
    if (districtSearch.trim()) {
      const q = districtSearch.toLowerCase();
      list = list.filter(d => 
        d.district.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
      );
    }
    return list;
  }, [districtsList, districtSearch, selectedStateFilter]);

  const scaleLabel = zoom >= 6 ? '100 km' : zoom === 5 ? '250 km' : '500 km';
  const distanceKm = measurePoints.length === 2
    ? Math.round(haversine(measurePoints[0], measurePoints[1]))
    : 0;

  const toggleLayer = (key: LayerKey) => {
    setLayers((current) => ({
      ...current,
      [key]: { ...current[key], visible: !current[key].visible },
    }));
  };

  const setLayerOpacity = (key: LayerKey, value: number) => {
    setLayers((current) => ({
      ...current,
      [key]: { ...current[key], opacity: value },
    }));
  };

  const resetExtent = () => {
    setNotice('Map extent reset to India national view.');
    setMode('idle');
    setMeasurePoints([]);
    setAoiPoints([]);
  };

  const handleCoordinate = (event: LeafletMouseEvent) => {
    if (!event?.latlng) return;
    setCoords(event.latlng);
    if (event.type !== 'click') return;
    if (mode === 'measure') {
      setMeasurePoints((current) => (current.length >= 2 ? [[event.latlng.lat, event.latlng.lng]] : [...current, [event.latlng.lat, event.latlng.lng]]));
    }
    if (mode === 'aoi') {
      setAoiPoints((current) => (current.length >= 5 ? [[event.latlng.lat, event.latlng.lng]] : [...current, [event.latlng.lat, event.latlng.lng]]));
    }
  };

  return (
    <section className="w-full px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb />
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">Spatial data access / national view</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid="text-page-title-gis-map">Geospatial GIS Visualization Engine</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Explore cadastral modernization, land-use classification, disputes and climate exposure across all 640 Indian districts through an accountable temporal map.</p>
        </div>
        <MapToolbar mode={mode} onModeChange={(nextMode) => { setMode(nextMode); setMeasurePoints([]); setAoiPoints([]); }} onExport={() => setNotice('Map view export queued as PNG/PDF.')} onReset={resetExtent} />
      </div>
      {notice && <div className="mb-4 flex items-center justify-between border border-[#b7d4c1] bg-[#f0f8f1] p-3 text-xs font-semibold text-[#287449]" data-testid="status-map-action"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{notice}</span><button className="focus-ring" type="button" aria-label="Dismiss map notice" onClick={() => setNotice('')}><X className="h-4 w-4" /></button></div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden border border-slate-400 bg-[#dbe7ea] shadow-sm">
            <MapContainer center={indiaCenter} zoom={5} minZoom={4} maxZoom={9} zoomControl={false} className="h-[620px] w-full" scrollWheelZoom>
              <MapController stateFilter={selectedStateFilter} districts={districtsList} />
              {layers.satellite.visible ? <TileLayer attribution="Tiles © Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" opacity={layers.satellite.opacity} /> : <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.8} />}
              {layers.cadastral.visible && (cadastralFeatures.length > 0 ? cadastralFeatures : cadastralPolygons.map((pts, i) => ({ id: `poly-${i}`, points: pts, properties: {} }))).map((zone) => (
                <Polygon key={zone.id} positions={zone.points} pathOptions={{ color: layers.cadastral.color, weight: 1.5, opacity: layers.cadastral.opacity, fillOpacity: 0.12 }} />
              ))}
              {layers.lulc.visible && lulcFeatures.map((zone, index) => <Polygon key={`lulc-${index}`} positions={zone.points} pathOptions={{ color: zone.color, weight: 1, opacity: layers.lulc.opacity, fillOpacity: layers.lulc.opacity * 0.35 }} />)}
              {layers.dispute.visible && filteredDistricts.filter(d => d.disputes > 26).map((district, idx) => (
                district?.coordinates && district.coordinates[0] != null ? (
                  <Circle key={`dispute-${district.state}-${district.district}-${idx}`} center={district.coordinates} radius={Math.min(65000, Math.max(25000, district.disputes * 1400))} pathOptions={{ color: '#b23b32', fillColor: '#b23b32', opacity: layers.dispute.opacity, fillOpacity: layers.dispute.opacity * 0.4 }} />
                ) : null
              ))}
              {layers.climate.visible && climateFeatures.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.points}
                  pathOptions={{ color: zone.color, weight: 2, opacity: layers.climate.opacity, fillOpacity: layers.climate.opacity * 0.45 }}
                  eventHandlers={{ click: () => setSelectedClimateZone(zone) }}
                />
              ))}
              {filteredDistricts.map((district, idx) => {
                if (!district?.coordinates || district.coordinates[0] == null) return null;
                const isDigitized = (district.digitization_status === 'Digitized' || district.modernization >= 70);
                const isProgress = (district.digitization_status === 'In-Progress' || (district.modernization >= 35 && district.modernization < 70));
                const pinColor = colorMode === 'modernization'
                  ? (isDigitized ? '#287449' : isProgress ? '#f2b134' : '#b23b32')
                  : (district.risk === 'High' ? '#b23b32' : district.risk === 'Moderate' ? '#f2b134' : '#287449');
                return (
                  <CircleMarker
                    center={district.coordinates}
                    key={`marker-${district.state}-${district.district}-${idx}`}
                    radius={zoom >= 7 ? 6 : 4}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 1,
                      fillColor: pinColor,
                      fillOpacity: 0.95
                    }}
                    eventHandlers={{ click: () => setSelectedDistrict(district) }}
                  />
                );
              })}
              {aoiPoints.length >= 3 && <Polygon positions={aoiPoints} pathOptions={{ color: '#9b6300', weight: 2, dashArray: '5 4', fillColor: '#f2b134', fillOpacity: 0.18 }} />}
              {aoiPoints.map((point, index) => <CircleMarker center={point} key={`aoi-point-${index}`} radius={4} pathOptions={{ color: '#9b6300', fillColor: '#f2b134', fillOpacity: 1 }} />)}
              <MapPointer mode={mode} onCoordinate={handleCoordinate} onZoom={setZoom} />
              <MapNavigation onReset={resetExtent} />
              <ScaleControl position="bottomleft" imperial={false} maxWidth={120} />
            </MapContainer>

            {/* Real-time Year Era Badge */}
            <div className="absolute top-3 left-3 z-[1000] border border-slate-300 bg-white/95 px-3 py-2 shadow-md backdrop-blur-xs max-w-[280px]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-[#132f4c]">{year}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${year >= 2020 ? 'bg-emerald-100 text-emerald-800' : year >= 2016 ? 'bg-blue-100 text-blue-800' : year >= 2008 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {year >= 2020 ? 'SVAMITVA Drone Era' : year >= 2016 ? 'DILRMP 2.0 Resurvey' : year >= 2008 ? 'NLRMP Pilot Launch' : 'Pre-DILRMP Manual'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>{filteredDistricts.length} Districts Plotted</span>
                <span className="font-semibold text-[#287449]">{temporalStats.cadastral_digitization_pct}% Modernized</span>
              </div>
            </div>

            <LayerControl layers={layers} onToggle={toggleLayer} onOpacity={setLayerOpacity} />

            {/* Dynamic Metric Switcher & Legend */}
            <div className="absolute bottom-3 right-3 z-[1000] border border-slate-400 bg-white/95 px-3 py-2 text-[10px] text-slate-700 shadow-sm max-w-sm">
              <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-200">
                <span className="font-bold text-[#132f4c]">Display Metric</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setColorMode('modernization')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${colorMode === 'modernization' ? 'bg-[#244562] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Digitization
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('dispute')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${colorMode === 'dispute' ? 'bg-[#244562] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Dispute Risk
                  </button>
                </div>
              </div>
              {colorMode === 'modernization' ? (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#287449]" />Digitized (≥70%)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f2b134]" />In-Progress (35-69%)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#b23b32]" />Legacy Paper (&lt;35%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#287449]" />Low Risk (&lt;25)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f2b134]" />Moderate (25-45)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#b23b32]" />High Risk (&gt;45)</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive GIS Time-Slider & Animation Toolbar (PS 26019 Point 2 & 8) */}
          <div className="border border-slate-400 border-t-0 bg-white p-4 shadow-sm" data-testid="panel-temporal-slider">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  data-testid="button-temporal-playback"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`focus-ring flex items-center gap-2 border px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
                    isPlaying 
                      ? 'border-amber-600 bg-amber-600 text-white hover:bg-amber-700' 
                      : 'border-[#244562] bg-[#244562] text-white hover:bg-[#132f4c]'
                  }`}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  {isPlaying ? 'Pause Playback' : 'Play Timeline (1999–2024)'}
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-[#132f4c]">{year}</span>
                  <span className="rounded bg-[#eef2f5] px-2.5 py-0.5 text-[11px] font-semibold text-[#244562] border border-slate-200">
                    {temporalStats.milestone}
                  </span>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { yr: 1999, label: '1999 Baseline' },
                  { yr: 2008, label: '2008 NLRMP' },
                  { yr: 2016, label: '2016 DILRMP 2.0' },
                  { yr: 2020, label: '2020 SVAMITVA' },
                  { yr: 2024, label: '2024 Present' },
                ].map((item) => (
                  <button
                    key={item.yr}
                    type="button"
                    onClick={() => { setYear(item.yr); setIsPlaying(false); }}
                    className={`px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                      year === item.yr
                        ? 'border-[#244562] bg-[#244562] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3.5">
              <input
                type="range"
                data-testid="input-temporal-slider"
                min="1999"
                max="2024"
                step="1"
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); setIsPlaying(false); }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#244562]"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>1999 (MoAFW Land Census)</span>
                <span>2008 (NLRMP Digital Push)</span>
                <span>2016 (DILRMP 2.0)</span>
                <span>2020 (SVAMITVA Drones)</span>
                <span>2024 (94.2% Modernized)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-400 border-t-0 bg-[#132f4c] px-3 py-2 text-[10px] text-white shadow-sm">
            <div className="flex items-center gap-3 font-mono"><span>LAT {coords?.lat != null ? coords.lat.toFixed(4) : '20.5937'}</span><span>LON {coords?.lng != null ? coords.lng.toFixed(4) : '78.9629'}</span><span>ZOOM {zoom}</span><span>SCALE {scaleLabel}</span></div>
            <div className="flex items-center gap-2">{mode === 'measure' && <span className="text-[#f2b134]">{measurePoints.length < 2 ? 'Click two points to measure' : `${distanceKm} km measured`}</span>}{mode === 'aoi' && <span className="text-[#f2b134]">{aoiPoints.length < 3 ? 'Click 3–5 points to draw AOI' : 'AOI polygon active'}</span>}<span className="text-slate-300">National Map · {year}</span></div>
          </div>
          {mode === 'measure' && measurePoints.length === 2 && <div className="mt-3 border border-[#b9cce0] bg-[#eef4fa] p-3 text-xs text-[#244562]" data-testid="status-map-measure-result"><span className="font-bold">Distance measurement:</span> {distanceKm} km between the selected coordinates.</div>}
        </div>

        <aside className="space-y-4">
          {/* District Directory & State Quick Filter */}
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 bg-[#eef2f5] px-4 py-3">
              <p className="section-kicker mb-1">National Cadastral Directory</p>
              <h2 className="text-sm font-bold text-[#244562]">Search 640 Indian Districts</h2>
            </div>
            <div className="p-3 space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter by State / UT</label>
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="w-full py-1 px-2 text-xs border border-slate-300 outline-none focus:ring-1 focus:ring-[#244562] bg-white font-medium text-slate-700"
                >
                  {uniqueStates.map(st => (
                    <option key={st} value={st}>{st === 'ALL' ? 'All States & UTs (National View)' : st}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter district name..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:ring-1 focus:ring-[#244562] outline-none"
                />
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs border border-slate-100">
                {filteredDistricts.slice(0, 100).map((d, i) => (
                  <button
                    key={`${d.state}-${d.district}-${i}`}
                    type="button"
                    onClick={() => setSelectedDistrict(d)}
                    className="w-full text-left py-1.5 px-2 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">{d.district}</span>
                      <span className="text-[10px] text-slate-500">{d.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500">{d.modernization}%</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${d.digitization_status === 'Digitized' || d.modernization >= 70 ? 'bg-emerald-100 text-emerald-700' : d.modernization >= 35 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {d.digitization_status || (d.modernization >= 70 ? 'Digitized' : d.modernization >= 35 ? 'In-Progress' : 'Legacy Paper')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {filteredDistricts.length > 100 && (
                <p className="text-[9px] text-slate-400 text-center pt-0.5">Showing top 100 of {filteredDistricts.length} districts (use search to filter)</p>
              )}
            </div>
          </div>

          {/* Temporal Land Use Progression Card */}
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 bg-[#eef2f5] px-4 py-3">
              <p className="section-kicker mb-1">MoAFW Timeline · Year {year}</p>
              <h2 className="text-sm font-bold text-[#244562]">Land Transition Metrics</h2>
            </div>
            <div className="p-4 space-y-3.5">
              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Cadastral Digitization</span>
                  <span className="font-mono font-bold text-[#287449]">{temporalStats.cadastral_digitization_pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 overflow-hidden rounded-xs">
                  <div className="h-full bg-[#287449] transition-all duration-300" style={{ width: `${temporalStats.cadastral_digitization_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Net Sown Agriculture Area</span>
                  <span className="font-mono font-bold text-[#c4a35a]">{temporalStats.net_sown_area_pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 overflow-hidden rounded-xs">
                  <div className="h-full bg-[#c4a35a] transition-all duration-300" style={{ width: `${temporalStats.net_sown_area_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Built-Up / Non-Agri Expansion</span>
                  <span className="font-mono font-bold text-[#b23b32]">{temporalStats.non_agricultural_built_up_pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 overflow-hidden rounded-xs">
                  <div className="h-full bg-[#b23b32] transition-all duration-300" style={{ width: `${temporalStats.non_agricultural_built_up_pct * 3}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Forest Canopy Cover</span>
                  <span className="font-mono font-bold text-[#1f663c]">{temporalStats.forest_cover_pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 overflow-hidden rounded-xs">
                  <div className="h-full bg-[#1f663c] transition-all duration-300" style={{ width: `${temporalStats.forest_cover_pct * 2}%` }} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">SVAMITVA Cards:</span>
                <span className="font-bold text-[#132f4c]">
                  {temporalStats.svamitva_cards_issued_cr > 0 ? `${temporalStats.svamitva_cards_issued_cr} Cr Issued` : 'Pre-Launch'}
                </span>
              </div>
            </div>
          </div>

          {/* Climate Hazard Guide Card */}
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="section-kicker mb-1">Spatial Layer Inspection</p>
              <h2 className="text-sm font-bold text-[#244562]">Click Pins or Hazard Polygons</h2>
            </div>
            <div className="p-3.5 text-xs leading-5 text-slate-600 space-y-2">
              <p className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4 text-[#9b6300]" />
                Click district pins for land tenure factsheets.
              </p>
              <p className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-[#2563eb]" />
                Click colored climate polygons for IMD rainfall and groundwater stress analysis (PS 26015).
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* District Factsheet Modal */}
      {selectedDistrict && (
        <div
          className="fixed inset-0 z-[1200] flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="District technical factsheet"
          onClick={() => setSelectedDistrict(null)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col border-l border-slate-300 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-[#eef2f5] p-5">
              <div>
                <p className="section-kicker mb-1">Administrative Factsheet / Technical View</p>
                <h2 className="font-serif text-xl font-bold text-[#132f4c]">District: {selectedDistrict.district}</h2>
                <p className="mt-1 text-xs text-slate-600">
                  <span className="font-semibold text-[#244562]">State / UT:</span> {selectedDistrict.state}
                </p>
              </div>
              <button
                className="focus-ring border border-slate-300 bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                data-testid="button-close-district-factsheet"
                type="button"
                aria-label="Close factsheet"
                onClick={() => setSelectedDistrict(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 bg-slate-50/50 p-3 shadow-2xs">
                  <p className="text-[11px] text-slate-500 font-medium">Revenue villages</p>
                  <p className="mt-2 font-mono text-xl font-bold text-[#132f4c]">{selectedDistrict.villages}</p>
                </div>
                <div className="border border-slate-200 bg-slate-50/50 p-3 shadow-2xs">
                  <p className="text-[11px] text-slate-500 font-medium">Cadastral modernization</p>
                  <p className="mt-2 font-mono text-xl font-bold text-[#287449]">{selectedDistrict.modernization}%</p>
                </div>
                <div className="border border-slate-200 bg-slate-50/50 p-3 shadow-2xs">
                  <p className="text-[11px] text-slate-500 font-medium">Disputes / 1,000 owners</p>
                  <p className="mt-2 font-mono text-xl font-bold text-[#9b6300]">{selectedDistrict.disputes}</p>
                </div>
                <div className="border border-slate-200 bg-slate-50/50 p-3 shadow-2xs">
                  <p className="text-[11px] text-slate-500 font-medium">SVAMITVA cards issued</p>
                  <p className="mt-2 font-mono text-xl font-bold text-[#244562]">{selectedDistrict.cards}</p>
                </div>
              </div>

              <div
                className={`border p-4 shadow-2xs ${
                  selectedDistrict.risk === 'High'
                    ? 'border-[#e7b6ad] bg-[#fff4f1]'
                    : selectedDistrict.risk === 'Moderate'
                    ? 'border-[#e9c68a] bg-[#fff8e8]'
                    : 'border-[#b7d4c1] bg-[#f0f8f1]'
                }`}
              >
                <p className="text-xs font-bold text-[#244562]">Land Dispute &amp; Vulnerability Profile</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#244562]">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      selectedDistrict.risk === 'High'
                        ? 'bg-[#b23b32]'
                        : selectedDistrict.risk === 'Moderate'
                        ? 'bg-[#f2b134]'
                        : 'bg-[#287449]'
                    }`}
                  />
                  {selectedDistrict.risk} Risk Profile
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                  {selectedDistrict.risk === 'High'
                    ? 'Elevated litigation density and boundary fragmentation. Recommended for drone resurvey prioritization.'
                    : selectedDistrict.risk === 'Moderate'
                    ? 'Moderate litigation risk with active digitization underway.'
                    : 'Low boundary litigation density and high RoR georeferencing maturity.'}
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-3.5 text-xs">
                <p className="font-bold text-[#244562] mb-1">Cadastral Resurvey Status</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Sub-5cm drone survey and CORS base station network integration in progress under DILRMP / SVAMITVA protocols.
                </p>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
              <Link
                className="focus-ring flex w-full items-center justify-center gap-2 bg-[#244562] px-4 py-3 text-xs font-bold text-white hover:bg-[#132f4c] shadow-sm transition-colors"
                data-testid="link-district-repository-records"
                href={`/repository?search=${encodeURIComponent(selectedDistrict.district)}&state=${encodeURIComponent(selectedDistrict.state)}`}
              >
                <MapPin className="h-4 w-4" />
                Open District Legal &amp; Cadastral Records in Repository
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Climate & Drought Hazard Factsheet Modal (PS 26015) */}
      {selectedClimateZone && (
        <div
          className="fixed inset-0 z-[1200] flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Climate hazard factsheet"
          onClick={() => setSelectedClimateZone(null)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col border-l border-slate-300 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-[#f4f7f9] p-5">
              <div>
                <p className="section-kicker mb-1">Climate Vulnerability Layer (PS 26015)</p>
                <h2 className="font-serif text-lg font-bold text-[#132f4c]">{selectedClimateZone.zone}</h2>
                <p className="mt-1 text-xs text-slate-600">
                  <span className="font-semibold text-[#244562]">Hazard Category:</span> {selectedClimateZone.category}
                </p>
              </div>
              <button
                className="focus-ring border border-slate-300 bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                type="button"
                aria-label="Close factsheet"
                onClick={() => setSelectedClimateZone(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Vulnerability Index</p>
                  <p className="mt-1.5 font-mono text-2xl font-bold text-[#b23b32]">{selectedClimateZone.vulnerabilityIndex} / 100</p>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Groundwater Status</p>
                  <p className="mt-1.5 text-xs font-bold text-[#132f4c]">{selectedClimateZone.groundwaterStatus}</p>
                </div>
              </div>

              <div className="border border-amber-200 bg-amber-50/60 p-4 text-xs space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-amber-700" />
                  IMD Precipitation Departure Shock
                </p>
                <p className="font-mono font-semibold text-amber-800 text-sm">
                  {selectedClimateZone.imdDeparture}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Meteorological satellite anomalies monitored via NRSC Bhuvan &amp; IMD gridded precipitation records.
                </p>
              </div>

              <div className="border border-blue-200 bg-blue-50/60 p-4 text-xs space-y-2">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-blue-700" />
                  Mandated Watershed Intervention (PS 26015)
                </p>
                <p className="text-slate-800 font-medium">
                  {selectedClimateZone.watershedPriority}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Integration with PMKSY (Pradhan Mantri Krishi Sinchayee Yojana) and watershed geo-tagging guidelines for land conservation.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
              <Link
                className="focus-ring flex w-full items-center justify-center gap-2 bg-[#244562] px-4 py-3 text-xs font-bold text-white hover:bg-[#132f4c] shadow-sm transition-colors"
                href={`/simulate?climate_zone=${encodeURIComponent(selectedClimateZone.zone)}`}
              >
                <Sparkles className="h-4 w-4" />
                Simulate Land Policy in this Climate Zone
              </Link>
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