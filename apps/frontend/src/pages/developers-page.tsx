import { useState, useEffect } from 'react';
import {
  Activity,
  Box,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCcw,
  Terminal,
  Play,
  CheckCircle2,
  Globe,
  Layers,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function Breadcrumb({ current }: { current: string }) {
  const { t } = useLanguage();
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
      <span>{t('app_name')}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#1E293B]">{t(current)}</span>
    </div>
  );
}

function PageFrame({ title, kicker, description, children, actions }: { title: string; kicker: string; description: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <section className="w-full px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb current={title} />
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t(kicker)}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1E293B] md:text-4xl">{t(title)}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t(description)}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function Panel({ title, children, className = '', headerAction }: { title: string; children: React.ReactNode; className?: string; headerAction?: React.ReactNode }) {
  return (
    <div className={`border border-slate-300 bg-white ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
        <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/repository/documents',
    desc: 'Search and filter repository records via full-text & pgvector cosine similarity',
    params: [
      { name: 'query', type: 'string', req: false, desc: 'Natural language search query.' },
      { name: 'state', type: 'string', req: false, desc: 'Indian State name or Pan-India.' },
      { name: 'document_type', type: 'string', req: false, desc: 'Document category (ACT, POLICY, RESEARCH, REPORT).' },
    ],
    example: 'curl -H "Authorization: Bearer <TOKEN>" \\\n  "http://127.0.0.1:8000/api/v1/repository/documents?state=Maharashtra&query=cadastral"'
  },
  {
    method: 'GET',
    path: '/api/v1/geodata/districts',
    desc: 'Query 640 Indian districts with GPS coordinates, Land Use %, and ML dispute risks',
    params: [
      { name: 'state', type: 'string', req: false, desc: 'Optional state filter name.' },
      { name: 'limit', type: 'number', req: false, desc: 'Max districts returned (default 640).' },
    ],
    example: 'curl "http://127.0.0.1:8000/api/v1/geodata/districts?state=Maharashtra&limit=10"'
  },
  {
    method: 'GET',
    path: '/api/v1/analytics/compare',
    desc: 'Compute real empirical comparative statistics between any 2 Indian states',
    params: [
      { name: 'state_a', type: 'string', req: true, desc: 'Primary state name (e.g., Maharashtra).' },
      { name: 'state_b', type: 'string', req: true, desc: 'Comparison state name (e.g., Madhya Pradesh).' },
    ],
    example: 'curl "http://127.0.0.1:8000/api/v1/analytics/compare?state_a=Maharashtra&state_b=Madhya%20Pradesh"'
  },
  {
    method: 'POST',
    path: '/api/v1/ml/predict-dispute',
    desc: 'Execute Scikit-Learn RandomForest inference on district land litigation risk',
    params: [
      { name: 'state_name', type: 'string', req: true, desc: 'Target state name.' },
      { name: 'district_name', type: 'string', req: false, desc: 'Optional specific district.' },
      { name: 'policy_adjustments', type: 'object', req: false, desc: 'Counterfactual adjustments (titling_coverage_pct).' },
    ],
    example: 'curl -X POST -H "Content-Type: application/json" \\\n  -d \'{"state_name": "MAHARASHTRA", "policy_adjustments": {"titling_coverage_pct": 20}}\' \\\n  "http://127.0.0.1:8000/api/v1/ml/predict-dispute"'
  },
  {
    method: 'POST',
    path: '/api/v1/simulate/evaluate',
    desc: 'Run headless policy simulation algorithms with confidence intervals and trajectories',
    params: [
      { name: 'payload', type: 'object', req: true, desc: 'JSON body with simulation parameters (state, ceiling, tax, budget, window).' },
    ],
    example: 'curl -X POST -H "Content-Type: application/json" \\\n  -d \'{"state": "Maharashtra", "ceiling": 54, "tax": 8, "budget": 120, "window": 180}\' \\\n  "http://127.0.0.1:8000/api/v1/simulate/evaluate"'
  }
];

export default function DevelopersPage() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [webhookLogs, setWebhookLogs] = useState<{ time: string, msg: string }[]>([]);

  // Interop Hub Sandbox State
  const [selectedConnector, setSelectedConnector] = useState<'ecourts' | 'bhunaksha' | 'svamitva'>('ecourts');
  const [ecourtsCnr, setEcourtsCnr] = useState('MHPU010048192021');
  const [ecourtsUlpin, setEcourtsUlpin] = useState('14-DIGIT-MH-PU-1849204');
  
  const [bhunakshaState, setBhunakshaState] = useState('Maharashtra');
  const [bhunakshaDistrict, setBhunakshaDistrict] = useState('Pune');
  const [bhunakshaVillage, setBhunakshaVillage] = useState('Wagholi (556012)');
  const [bhunakshaKhasra, setBhunakshaKhasra] = useState('142/2');

  const [svamitvaPropertyId, setSvamitvaPropertyId] = useState('SVAM-MP-HARDA-00918');
  const [svamitvaDistrict, setSvamitvaDistrict] = useState('Harda, Madhya Pradesh');

  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);

  const runSandboxQuery = () => {
    setIsSandboxRunning(true);
    setSandboxResult(null);
    const latency = Math.floor(95 + Math.random() * 85);

    setTimeout(() => {
      if (selectedConnector === 'ecourts') {
        setSandboxResult({
          system: 'National Judicial Data Grid (NJDG) / e-Courts Services',
          status: 'SUCCESS',
          query_type: 'CNR_AND_ULPIN_LINKAGE',
          cnr_number: ecourtsCnr,
          ulpin: ecourtsUlpin,
          court: 'District & Sessions Court, Pune (Court Hall 4)',
          presiding_judge: 'Additional District Judge (Civil Division)',
          case_type: 'Special Civil Suit (Title Declaration & Partition)',
          filing_date: '2021-03-18',
          status_summary: {
            interim_stay_active: true,
            encumbrance_flagged_in_ror: true,
            next_hearing: '2025-11-24',
            stage: 'Evidence of Defendant',
          },
          litigation_risk_index: 0.88,
          telemetry: {
            latency_ms: latency,
            gateway: 'NIC-eCourts-InterConnect-Node-4',
            iso_timestamp: new Date().toISOString(),
          },
        });
      } else if (selectedConnector === 'bhunaksha') {
        setSandboxResult({
          system: 'Bhunaksha National Cadastral Geo-Service (NIC / Survey of India)',
          status: 'GEOMETRY_RETRIEVED',
          state: bhunakshaState,
          district: bhunakshaDistrict,
          village: bhunakshaVillage,
          khasra_survey_no: bhunakshaKhasra,
          parcel_attributes: {
            area_hectares: 2.45,
            land_type: 'Jirayat (Agricultural)',
            tenure: 'Occupant Class 1 (Bhogwatdar Varg 1)',
            centroid: [18.5789, 73.9812],
            adjacent_khasras: ['142/1', '142/3', '143', '139'],
          },
          geojson_geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [73.9805, 18.5781],
                [73.9821, 18.5784],
                [73.9818, 18.5796],
                [73.9802, 18.5792],
                [73.9805, 18.5781],
              ],
            ],
          },
          telemetry: {
            latency_ms: latency,
            crs: 'EPSG:4326 (WGS84)',
            iso_timestamp: new Date().toISOString(),
          },
        });
      } else {
        setSandboxResult({
          system: 'SVAMITVA Scheme National Portal (Ministry of Panchayati Raj / Survey of India)',
          status: 'PROPERTY_CARD_ISSUED',
          property_id: svamitvaPropertyId,
          district: svamitvaDistrict,
          owner_name: 'Rameshwar Prasad Sharma (Jointly with Smt. Kausalya Devi)',
          gram_panchayat: 'Handia (Abadi Area)',
          drone_survey: {
            flight_batch: 'SOI-DRN-2023-B4',
            ground_resolution_cm: 5.0,
            feature_extraction_model: 'SOI-YOLO-Cadastre-v2',
            orthorectified_image_id: 'SV-HARDA-2023-0941.tif',
          },
          digilocker_verification: {
            uri: `in.gov.mopr.svamitva.propcard:${svamitvaPropertyId}`,
            sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            panchayat_secretary_dsc: 'VALID_VERIFIED',
          },
          telemetry: {
            latency_ms: latency,
            gateway: 'DigiLocker-National-API-Hub',
            iso_timestamp: new Date().toISOString(),
          },
        });
      }
      setSandboxLatency(latency);
      setIsSandboxRunning(false);
    }, 450);
  };

  useEffect(() => {
    const logs = [
      'Webhook received: Title mutation update from Bhulekh UP',
      'Event [204]: Cadastral geometry synced (MahaBhulekh)',
      'Event [501]: Authentication token refresh requested (Bhoomi Karnataka)',
      'Webhook received: Policy directive acknowledgment (DoLR Central)',
      'Event [102]: Batch OCR processing completed for 45 legacy deeds (Revenue Dept)'
    ];
    let index = 0;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setWebhookLogs(prev => {
        const next = [{ time: timeStr, msg: logs[index % logs.length] }, ...prev];
        return next.slice(0, 8);
      });
      index++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentEndpoint = ENDPOINTS[activeTab];

  return (
    <PageFrame
      kicker="API access / developer tools"
      title="Developer APIs &amp; Integrations"
      description="Access official land governance APIs, test integration endpoints, query district statistics, and connect external applications."
      actions={
        <button className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800" type="button">
          <Database className="h-3.5 w-3.5" /> Download API Specifications
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* API Documentation */}
        <div className="space-y-6">
          <Panel title="API Endpoints &amp; Testing">
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
              {ENDPOINTS.map((ep, idx) => (
                <button
                  key={ep.path}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-3 text-xs font-bold whitespace-nowrap focus-ring ${activeTab === idx ? 'bg-white border-t-2 border-[#1E293B] text-[#1E293B]' : 'text-slate-500 hover:text-[#1E293B] border-t-2 border-transparent'}`}
                >
                  <span className={`inline-block mr-2 px-1.5 py-0.5 rounded-[2px] text-[10px] ${ep.method === 'GET' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#F0FDF4] text-[#15803D]'}`}>{ep.method}</span>
                  {ep.path}
                </button>
              ))}
            </div>
            
            <div className="p-5 space-y-6">
              <div>
                <h3 className="font-bold text-[#1E293B] text-base mb-2">{currentEndpoint.desc}</h3>
                <p className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 inline-block border border-slate-200">{currentEndpoint.path}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Parameters</p>
                <div className="border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 font-bold border-r border-slate-200">Name</th>
                        <th className="px-4 py-2 font-bold border-r border-slate-200">Type</th>
                        <th className="px-4 py-2 font-bold border-r border-slate-200">Required</th>
                        <th className="px-4 py-2 font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {currentEndpoint.params.map(p => (
                        <tr key={p.name}>
                          <td className="px-4 py-2 font-mono text-[#1E293B] border-r border-slate-200">{p.name}</td>
                          <td className="px-4 py-2 font-mono text-[#B45309] border-r border-slate-200">{p.type}</td>
                          <td className="px-4 py-2 border-r border-slate-200">
                            {p.req ? <span className="text-[#B91C1C] font-bold">Yes</span> : <span className="text-slate-400">No</span>}
                          </td>
                          <td className="px-4 py-2 text-slate-600">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Request Example</p>
                  <button 
                    onClick={() => handleCopy(currentEndpoint.example)}
                    className="text-[10px] font-bold text-[#1E293B] hover:underline flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" /> {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-[#1E293B] text-slate-300 p-4 font-mono text-xs overflow-x-auto rounded-sm leading-relaxed whitespace-pre-wrap border border-slate-800">
                  {currentEndpoint.example}
                </pre>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Key Management & Webhooks */}
        <div className="space-y-6">
          <Panel title="API Key Management" headerAction={<button className="text-[10px] font-bold text-slate-500 hover:text-[#1E293B]"><RefreshCcw className="h-3.5 w-3.5" /></button>}>
            <div className="p-5">
              <p className="text-xs font-bold text-[#1E293B] mb-2">Active State Token</p>
              <div className="flex">
                <div className="flex-1 bg-slate-100 border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">
                  {showKey ? 'dolr_prod_8f92j1kLmN4pQrsTuvWxYzA' : 'dolr_prod_***********************'}
                </div>
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="bg-white border-y border-r border-slate-300 px-3 text-slate-500 hover:bg-slate-50 focus-ring"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button className="text-[10px] font-bold text-[#B91C1C] hover:underline mt-2">Revoke Token</button>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-[#1E293B]">Monthly Quota Meter</p>
                  <p className="text-[10px] font-mono text-slate-500">14,200 / 50,000</p>
                </div>
                <div className="h-2 bg-slate-100 border border-slate-200 w-full rounded-sm overflow-hidden mb-1">
                  <div className="h-full bg-[#1E293B]" style={{ width: '28.4%' }} />
                </div>
                <p className="text-[10px] text-slate-500">28.4% of API calls used this billing cycle.</p>
              </div>
            </div>
          </Panel>

          <Panel title="State System Webhook Console">
            <div className="bg-[#1E293B] p-4 min-h-[250px] border-b border-slate-800 rounded-b-sm">
              <div className="flex items-center gap-2 mb-4 text-[#10B981] text-[10px] font-bold uppercase tracking-widest font-mono">
                <Terminal className="h-3 w-3" /> Listening on Port 8443
              </div>
              <div className="space-y-3">
                {webhookLogs.length === 0 ? (
                  <p className="text-slate-500 text-xs font-mono animate-pulse">Waiting for events...</p>
                ) : (
                  webhookLogs.map((log, i) => (
                    <div key={i} className="text-xs font-mono flex items-start gap-3 opacity-90 transition-all duration-500" style={{ opacity: Math.max(0.3, 1 - (i * 0.15)) }}>
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className="text-[#38BDF8]">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* National Land Systems Interop Hub (Sandbox Test Connectors) */}
      <div className="mt-8">
        <Panel
          title="National Land Systems Interop Hub (Sandbox Test Connectors)"          headerAction={
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Federated Gateway Active (Testnet)
            </span>
          }
        >
          <div className="p-5 space-y-6">
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Execute live simulated handshakes and integration queries across core Government of India land infrastructure.
              Validate ULPIN cadastral bindings, verify pending high-court civil injunctions via e-Courts, and retrieve WGS84 GeoJSON polygons from State Bhunaksha instances.            </p>

            {/* Connector Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setSelectedConnector('ecourts'); setSandboxResult(null); }}
                className={`p-3.5 text-left border rounded-xs transition-all ${
                  selectedConnector === 'ecourts'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Globe className={`h-4 w-4 ${selectedConnector === 'ecourts' ? 'text-blue-700' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs text-[#1E293B]">e-Courts Dispute Linkage</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Check civil court injunctions, lis pendens, and title contestations via CNR & ULPIN.                </p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedConnector('bhunaksha'); setSandboxResult(null); }}
                className={`p-3.5 text-left border rounded-xs transition-all ${
                  selectedConnector === 'bhunaksha'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers className={`h-4 w-4 ${selectedConnector === 'bhunaksha' ? 'text-blue-700' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs text-[#1E293B]">Bhunaksha Geo-Service</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Stream vector GeoJSON cadastral polygons, centroid coordinates, and adjacent khasras.                </p>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedConnector('svamitva'); setSandboxResult(null); }}
                className={`p-3.5 text-left border rounded-xs transition-all ${
                  selectedConnector === 'svamitva'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <FileCheck className={`h-4 w-4 ${selectedConnector === 'svamitva' ? 'text-blue-700' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs text-[#1E293B]">SVAMITVA & DigiLocker</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  Verify drone survey orthomosaic tokens and cryptographic Gram Panchayat property cards.                </p>
              </button>
            </div>

            {/* Interactive Query Parameter Inputs */}
            <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Connector Request Parameters
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Target Endpoint: {
                    selectedConnector === 'ecourts' ? 'GET /interop/v1/ecourts/cases' :
                    selectedConnector === 'bhunaksha' ? 'GET /interop/v1/bhunaksha/parcel-geometry' :
                    'GET /interop/v1/svamitva/property-card'
                  }
                </span>
              </div>

              {selectedConnector === 'ecourts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Case CNR Number (16-character e-Courts identifier)
                    </label>
                    <input
                      type="text"
                      value={ecourtsCnr}
                      onChange={(e) => setEcourtsCnr(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs font-mono bg-white focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Linked ULPIN (14-digit Bhu-Aadhaar)
                    </label>
                    <input
                      type="text"
                      value={ecourtsUlpin}
                      onChange={(e) => setEcourtsUlpin(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs font-mono bg-white focus-ring"
                    />
                  </div>
                </div>
              )}

              {selectedConnector === 'bhunaksha' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={bhunakshaState}
                      onChange={(e) => setBhunakshaState(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs bg-white focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={bhunakshaDistrict}
                      onChange={(e) => setBhunakshaDistrict(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs bg-white focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Village & LGD Code</label>
                    <input
                      type="text"
                      value={bhunakshaVillage}
                      onChange={(e) => setBhunakshaVillage(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs bg-white focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Khasra / Survey No.</label>
                    <input
                      type="text"
                      value={bhunakshaKhasra}
                      onChange={(e) => setBhunakshaKhasra(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs font-mono bg-white focus-ring"
                    />
                  </div>
                </div>
              )}

              {selectedConnector === 'svamitva' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      SVAMITVA Property Unique ID
                    </label>
                    <input
                      type="text"
                      value={svamitvaPropertyId}
                      onChange={(e) => setSvamitvaPropertyId(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs font-mono bg-white focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Survey Region / District
                    </label>
                    <input
                      type="text"
                      value={svamitvaDistrict}
                      onChange={(e) => setSvamitvaDistrict(e.target.value)}
                      className="w-full border border-slate-300 px-3 py-1.5 text-xs bg-white focus-ring"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Secured with SHA-256 HMAC and SSL/TLS 1.3 mutual handshake.
                </span>
                <button
                  type="button"
                  onClick={runSandboxQuery}
                  disabled={isSandboxRunning}
                  className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSandboxRunning ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Negotiating Gateway Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Run Sandbox Query</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sandbox Response Output */}
            {sandboxResult && (
              <div className="border border-slate-300 bg-white rounded-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">Sandbox Response: 200 OK</span>
                    <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded-xs">
                      Latency: {sandboxLatency}ms
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(sandboxResult, null, 2))}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="bg-[#0F172A] text-emerald-400 p-4 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
                  {JSON.stringify(sandboxResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </PageFrame>
  );
}
