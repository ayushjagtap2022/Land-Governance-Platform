import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  FileSearch,
  HardDrive,
  Network,
  Shield,
  ShieldAlert,
  Trash2,
  XCircle,
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
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1E293B] md:text-4xl flex items-center gap-3">
            {title} <Shield className="h-6 w-6 text-[#1D4ED8]" />
          </h1>
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

export default function AdminPage() {
  const [verificationQueue, setVerificationQueue] = useState([
    { id: 'REQ-9102', org: 'Kerala University of Digital Sciences', type: 'University', reqBy: 'Dr. S. Nair', date: 'Oct 12' },
    { id: 'REQ-9105', org: 'MP Land Record Modernization Dept', type: 'State Dept', reqBy: 'Directorate Staff', date: 'Oct 14' },
    { id: 'REQ-9118', org: 'Global Geospatial Analytics Ltd', type: 'Private Firm', reqBy: 'R. K. Sharma', date: 'Oct 15' },
  ]);

  const [moderationQueue, setModerationQueue] = useState([
    { id: 'DOC-884', title: 'Survey Data of Disputed Zones (Unredacted)', uploader: 'P. Verma', flag: 'PII Leakage' },
    { id: 'DOC-902', title: 'Incomplete Cadastral Map Export - Pune', uploader: 'System Automation', flag: 'Corrupt Geometry' },
  ]);

  const removeVerification = (id: string) => {
    setVerificationQueue(verificationQueue.filter(item => item.id !== id));
  };

  const removeModeration = (id: string) => {
    setModerationQueue(moderationQueue.filter(item => item.id !== id));
  };

  return (
    <PageFrame
      kicker="Platform Operations / Restricted"
      title="Super Admin Console"
      description="Manage source verification queues, institutional access workflows, and monitor core infrastructure health."
    >
      <div className="mb-6 flex items-start gap-3 border-l-4 border-[#1D4ED8] bg-[#EFF6FF] p-4 text-sm text-[#1E3A8A]">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
        <div>
          <p className="font-bold text-[#1E3A8A]">Super Admin Privileges Active</p>
          <p className="mt-1 font-medium text-slate-700">Actions taken in this console directly affect platform availability and data retention policies. Proceed with caution.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Queues */}
        <div className="space-y-6">
          
          <Panel title="Institution Verification Queue">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold border-r border-slate-200">Req ID</th>
                    <th className="px-4 py-3 font-bold border-r border-slate-200">Organization & Type</th>
                    <th className="px-4 py-3 font-bold border-r border-slate-200">Requested By</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {verificationQueue.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No pending verifications.</td></tr>
                  ) : (
                    verificationQueue.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-500 border-r border-slate-200">{item.id}</td>
                        <td className="px-4 py-3 border-r border-slate-200">
                          <span className="font-bold text-[#1E293B] block mb-1">{item.org}</span>
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-sm text-[10px]">{item.type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 border-r border-slate-200">
                          {item.reqBy} <span className="text-slate-400 block mt-1">{item.date}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => removeVerification(item.id)}
                              className="p-1 text-[#15803D] hover:bg-[#F0FDF4] border border-transparent hover:border-[#BBF7D0] transition-colors" 
                              title="Verify & Approve"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => removeVerification(item.id)}
                              className="p-1 text-[#B91C1C] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors" 
                              title="Reject with Remarks"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Content Moderation Queue">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FFFBEB] text-[10px] uppercase tracking-wider text-[#92400E] border-b border-[#FDE68A]">
                  <tr>
                    <th className="px-4 py-3 font-bold border-r border-[#FDE68A]">Flag Reason</th>
                    <th className="px-4 py-3 font-bold border-r border-[#FDE68A]">Document Details</th>
                    <th className="px-4 py-3 font-bold border-r border-[#FDE68A]">Uploader</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {moderationQueue.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No flagged content.</td></tr>
                  ) : (
                    moderationQueue.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200">
                          <span className="inline-flex items-center gap-1 font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-sm">
                            <AlertTriangle className="h-3 w-3" /> {item.flag}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200">
                          <span className="font-bold text-[#1E293B] block">{item.title}</span>
                          <span className="text-[10px] font-mono text-slate-500 mt-1 block">{item.id}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{item.uploader}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-[10px] font-bold text-slate-600 border border-slate-300 px-2 py-1 bg-white hover:bg-slate-50">
                              Preview
                            </button>
                            <button 
                              onClick={() => removeModeration(item.id)}
                              className="text-[10px] font-bold text-white border border-[#B91C1C] bg-[#B91C1C] px-2 py-1 hover:bg-red-800 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

        </div>

        {/* Right Column: Infra Health */}
        <div className="space-y-6">
          <Panel title="Infrastructure Health Dashboard">
            <div className="p-5 space-y-5">
              
              <div className="border border-slate-200 p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#1E293B]" />
                    <span className="font-bold text-[#1E293B] text-xs">PostGIS Spatial DB</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#15803D] uppercase"><CheckCircle2 className="h-3 w-3" /> Operational</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Conn Pool</p>
                    <p className="font-mono text-xs font-bold">14 / 50</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">QPS</p>
                    <p className="font-mono text-xs font-bold">2,405</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-[#1E293B]" />
                    <span className="font-bold text-[#1E293B] text-xs">Vector Search (Chroma)</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#15803D] uppercase"><CheckCircle2 className="h-3 w-3" /> Operational</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Latency (p95)</p>
                    <p className="font-mono text-xs font-bold">42ms</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Index Size</p>
                    <p className="font-mono text-xs font-bold">4.2 GB</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 p-4 bg-[#FFFBEB]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-[#B45309]" />
                    <span className="font-bold text-[#B45309] text-xs">Tesseract OCR Cluster</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#B45309] uppercase"><Activity className="h-3 w-3" /> High Load</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-[#FDE68A] pt-3">
                  <div>
                    <p className="text-[10px] text-[#92400E] uppercase tracking-wider mb-1">Queue Backlog</p>
                    <p className="font-mono text-xs font-bold text-[#B45309]">1,840 Docs</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#92400E] uppercase tracking-wider mb-1">Throughput</p>
                    <p className="font-mono text-xs font-bold text-[#B45309]">14 pages/s</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-[#FDE68A] rounded-sm overflow-hidden">
                  <div className="h-full bg-[#B45309]" style={{ width: '85%' }} />
                </div>
              </div>

            </div>
          </Panel>
        </div>

      </div>
    </PageFrame>
  );
}
