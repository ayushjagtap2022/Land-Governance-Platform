import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Lightbulb,
  Plus,
  Send,
  Upload,
  X,
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

type PilotStatus = 'Proposal Under Review' | 'Technical Committee Shortlisted' | 'Grant Sanctioned' | 'Field Pilot Underway';

function StatusPill({ status }: { status: PilotStatus }) {
  const styles = {
    'Proposal Under Review': 'bg-slate-100 text-slate-600',
    'Technical Committee Shortlisted': 'bg-[#EFF6FF] text-[#1D4ED8]',
    'Grant Sanctioned': 'bg-[#FFFBEB] text-[#B45309]',
    'Field Pilot Underway': 'bg-[#F0FDF4] text-[#15803D]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function InnovationPage() {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      setTimeout(() => {
        setHasSubmitted(false);
        setShowSubmitModal(false);
      }, 2000);
    }, 1500);
  };

  const challenges = [
    {
      id: 'CH-2025-A',
      title: 'AI for Automated Cadastral Boundary Extraction from Drone Imagery',
      grant: '₹25 Lakhs',
      deadline: '15 Oct 2025',
      eligibility: 'Recognized Universities, NIC Empanelled Startups',
    },
    {
      id: 'CH-2025-B',
      title: 'Blockchain Registry Prototyping for Inheritance Mutations',
      grant: '₹40 Lakhs',
      deadline: '30 Nov 2025',
      eligibility: 'State Revenue Departments, Research Institutes',
    },
  ];

  const pilots = [
    { id: 'PIL-104', title: 'Machine Learning for Soil Degradation Mapping', pi: 'Dr. A. Sharma', org: 'IIT Bombay', status: 'Field Pilot Underway' as PilotStatus },
    { id: 'PIL-108', title: 'Automated Local Language OCR for Legacy Title Deeds', pi: 'M. Verma', org: 'NIC Kerala', status: 'Grant Sanctioned' as PilotStatus },
    { id: 'PIL-112', title: 'Satellite-based Crop Yield Prediction Models', pi: 'R. Patel', org: 'IIM Ahmedabad', status: 'Technical Committee Shortlisted' as PilotStatus },
    { id: 'PIL-115', title: 'Drone-assisted Dispute Resolution Toolkit', pi: 'S. Singh', org: 'Punjab Revenue Dept', status: 'Proposal Under Review' as PilotStatus },
  ];

  return (
    <PageFrame
      kicker="Open collaboration / pilots"
      title="Open Innovation & Grant Portal"
      description="A structured entry point for institutions and practitioners to propose and pilot responsible land-governance technology."
      actions={
        <button 
          className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
          onClick={() => setShowSubmitModal(true)}
        >
          <Lightbulb className="h-3.5 w-3.5" /> Submit Proposal
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Column: Challenges */}
        <div className="space-y-6">
          <Panel title="Active Research Challenges">
            <div className="divide-y divide-slate-200">
              {challenges.map(challenge => (
                <div key={challenge.id} className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{challenge.id}</span>
                    <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
                      Grant: {challenge.grant}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1E293B] text-base leading-snug mb-3">{challenge.title}</h3>
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Deadline: <span className="font-semibold text-slate-800">{challenge.deadline}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" /> Eligibility: <span>{challenge.eligibility}</span>
                    </p>
                  </div>
                  <button className="w-full focus-ring flex items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Download RFP Guidelines
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="space-y-6">
          <Panel title="Transparency Leaderboard & Pilot Tracker">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Pilot ID</th>
                    <th className="px-4 py-3 font-bold">Proposal Title</th>
                    <th className="px-4 py-3 font-bold">Investigator & Org</th>
                    <th className="px-4 py-3 font-bold">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pilots.map(pilot => (
                    <tr key={pilot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-slate-500">{pilot.id}</td>
                      <td className="px-4 py-4 font-semibold text-[#1E293B] max-w-xs">{pilot.title}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <span className="block font-semibold text-slate-800">{pilot.pi}</span>
                        {pilot.org}
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill status={pilot.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Showing 4 of 24 active proposals.</span>
              <button className="font-bold text-[#1E293B] hover:underline">View All Submissions</button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 p-4">
          <div className="w-full max-w-xl bg-white shadow-xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50 sticky top-0 z-10">
              <h3 className="font-bold text-[#1E293B]">Submit Research Proposal</h3>
              <button onClick={() => !isSubmitting && setShowSubmitModal(false)} className="text-slate-500 hover:text-[#1E293B] disabled:opacity-50" disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {hasSubmitted ? (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-[#15803D]" />
                <h4 className="font-bold text-lg text-[#1E293B]">Proposal Submitted Successfully</h4>
                <p className="text-sm text-slate-600 max-w-xs">Your proposal has been securely logged for review by the Technical Committee.</p>
              </div>
            ) : (
              <>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Investigator</label>
                      <input type="text" placeholder="Dr. Jane Doe" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">University / Organization</label>
                      <input type="text" placeholder="Institution Name" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Challenge</label>
                    <select className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring">
                      <option>AI for Automated Cadastral Boundary Extraction</option>
                      <option>Blockchain Registry Prototyping</option>
                      <option>Open Track Proposal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Abstract</label>
                    <textarea 
                      placeholder="Brief overview of methodology and expected outcomes..." 
                      className="w-full border border-slate-300 px-3 py-2 text-sm h-24 resize-none focus-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Budget Breakdown (₹ Lakhs)</label>
                    <input type="number" placeholder="e.g. 25" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" />
                  </div>

                  <div className="border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-[#1E293B]">Upload Full Proposal (PDF)</p>
                    <p className="text-xs text-slate-500 mt-1">Maximum file size 10MB.</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2 bg-slate-50 sticky bottom-0">
                  <button 
                    onClick={() => setShowSubmitModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold bg-[#1E293B] hover:bg-slate-800 text-white flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isSubmitting ? 'Submitting...' : <><Send className="h-3.5 w-3.5" /> Submit Proposal</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageFrame>
  );
}
