import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  MessageSquare,
  Plus,
  Send,
  Shield,
  UsersRound,
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

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-slate-300 bg-white ${className}`}>
      <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
        <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

type BadgeType = 'In Committee Review' | 'Cabinet Draft' | 'Peer Review Approved' | 'Archived';

function StatusBadge({ status }: { status: BadgeType }) {
  const styles = {
    'In Committee Review': 'bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]',
    'Cabinet Draft': 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    'Peer Review Approved': 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
    'Archived': 'bg-slate-100 text-slate-600 border-slate-300',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function WorkspacesPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState('Read-Only Observer');
  const [notes, setNotes] = useState('## Draft Findings\n\n- Drone survey accuracy verified at 5cm GSD.\n- Discrepancy observed in village boundary overlap.\n\n### Next Steps\nRequire inter-departmental verification with State Revenue.');

  const projects = [
    { id: '1', title: 'Joint Working Group on Cadastral Resurvey Standards', members: 12, status: 'In Committee Review' as BadgeType, updated: '2 days ago' },
    { id: '2', title: 'Western Ghats Tenancy Rights Analysis', members: 5, status: 'Peer Review Approved' as BadgeType, updated: '5 hours ago' },
    { id: '3', title: 'Model Mutation Workflow Blueprint', members: 8, status: 'Cabinet Draft' as BadgeType, updated: '1 week ago' },
  ];

  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject);
    return (
      <PageFrame
        kicker="Collaborative Workspace"
        title={project?.title || 'Workspace'}
        description="Shared document library, collaborative notes, and milestone tracking."
        actions={
          <div className="flex gap-2">
            <button 
              className="focus-ring flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" 
              onClick={() => setSelectedProject(null)}
            >
              Back to Catalog
            </button>
            <button 
              className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
              onClick={() => setShowInviteModal(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Invite Partner
            </button>
          </div>
        }
      >
        <div className="mb-6 flex items-center gap-4 border border-slate-300 bg-white p-4">
          <StatusBadge status={project?.status as BadgeType} />
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><UsersRound className="h-4 w-4" /> {project?.members} Active Members</span>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Clock className="h-4 w-4" /> Updated {project?.updated}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Milestone Kanban */}
          <Panel title="Milestone & Deliverable Tracker">
            <div className="p-4 space-y-4">
              <div className="border border-slate-200 bg-[#F0FDF4] p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#15803D] flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Draft Formulation</span>
                </div>
                <p className="text-[11px] text-slate-600">Completed on 12 Aug 2025.</p>
              </div>
              <div className="border border-[#1E293B] bg-slate-50 p-3 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1"><Clock className="h-4 w-4 text-[#B45309]" /> Inter-Departmental Review</span>
                </div>
                <p className="text-[11px] text-slate-600">Awaiting feedback from NIC and State Revenue Dept.</p>
              </div>
              <div className="border border-slate-200 bg-white p-3 flex flex-col gap-2 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Final Submission</span>
                </div>
                <p className="text-[11px] text-slate-500">Locked until review completes.</p>
              </div>
            </div>
          </Panel>

          {/* Collaborative Notes */}
          <Panel title="Collaborative Policy Notes" className="lg:col-span-2">
            <div className="p-0 border-b border-slate-200 bg-[#F8FAFC] px-4 py-2 flex items-center gap-2">
              <button className="text-[11px] font-bold text-slate-600 hover:text-[#1E293B]">Format</button>
              <button className="text-[11px] font-bold text-slate-600 hover:text-[#1E293B]">Insert Table</button>
              <button className="text-[11px] font-bold text-slate-600 hover:text-[#1E293B]">Cite Document</button>
            </div>
            <textarea
              className="w-full h-[250px] p-4 text-sm font-mono text-slate-700 bg-white focus:outline-none resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Last synced: Just now</span>
              <button className="text-xs font-bold text-[#1E293B] hover:underline">Save Draft</button>
            </div>
          </Panel>

          {/* Shared Document Library */}
          <Panel title="Shared Document Library" className="lg:col-span-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Research Paper / Document</th>
                    <th className="px-4 py-3 font-bold">Uploaded By</th>
                    <th className="px-4 py-3 font-bold">Annotations</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-semibold text-[#1E293B]">
                        <FileText className="h-4 w-4 text-slate-400" />
                        Draft_Resurvey_Guidelines_v2.pdf
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">NIC Official</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
                        <MessageSquare className="h-3 w-3" /> 14 comments
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[#1E293B] font-bold hover:underline">Open Annotator</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-semibold text-[#1E293B]">
                        <FileText className="h-4 w-4 text-slate-400" />
                        Boundary_Dispute_Analysis_2024.docx
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">IISc Researcher</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <MessageSquare className="h-3 w-3" /> 2 comments
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[#1E293B] font-bold hover:underline">Open Annotator</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 p-4">
            <div className="w-full max-w-md bg-white shadow-xl border border-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
                <h3 className="font-bold text-[#1E293B]">Invite Partner Institution</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-[#1E293B]"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Email or ID</label>
                  <input type="text" placeholder="e.g. state-revenue@mah.gov.in" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Permission Level</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring"
                  >
                    <option>Read-Only Observer</option>
                    <option>Co-Author (Full Edit)</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-[#15803D]" />
                  <p>Institutions must be verified by DoLR to access Cabinet Draft workspaces.</p>
                </div>
              </div>
              <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2 bg-slate-50">
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-bold bg-[#1E293B] hover:bg-slate-800 text-white flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </PageFrame>
    );
  }

  return (
    <PageFrame
      kicker="Inter-institutional research interface"
      title="Collaborative Workspaces"
      description="Joint working groups for universities, state departments, and DoLR officials."
      actions={
        <button className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800" type="button">
          <Plus className="h-3.5 w-3.5" /> New Workspace
        </button>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="border border-slate-300 bg-white p-5 flex flex-col transition-shadow hover:shadow-md cursor-pointer" onClick={() => setSelectedProject(project.id)}>
            <div className="mb-4">
              <StatusBadge status={project.status} />
            </div>
            <h3 className="font-bold text-[#1E293B] text-lg mb-2 flex-1">{project.title}</h3>
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 mt-4 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1"><UsersRound className="h-3.5 w-3.5" /> {project.members} Members</span>
              <span className="flex items-center gap-1"><FolderOpen className="h-3.5 w-3.5" /> 3 Files</span>
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
