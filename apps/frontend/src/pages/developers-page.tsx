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
} from 'lucide-react';

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
      <span>National Land Governance Platform</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#1E293B]">{current}</span>
    </div>
  );
}

function PageFrame({ title, kicker, description, children, actions }: { title: string; kicker: string; description: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="w-full px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb current={title} />
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{kicker}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1E293B] md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
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
      kicker="Interoperability / Institutional Access"
      title="Developer API Explorer"
      description="Connect approved applications to discoverable land-governance metadata, run headless simulations, and monitor webhooks."
      actions={
        <button className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800" type="button">
          <Database className="h-3.5 w-3.5" /> Download Full OpenAPI Spec
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* API Documentation */}
        <div className="space-y-6">
          <Panel title="Interactive API Documentation">
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
    </PageFrame>
  );
}
