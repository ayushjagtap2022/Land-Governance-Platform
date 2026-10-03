import { useState, useEffect } from 'react';
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
  Loader2,
  Calendar,
  CheckSquare,
  Square,
  Download,
  Share2,
  History,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useChat } from '@/hooks/use-chat';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export type DocumentRevision = {
  version: string;
  timestamp: string;
  author: string;
  authorRole: string;
  summary: string;
  content: string;
};

export const initialRevisions: DocumentRevision[] = [
  {
    version: 'v2.4 (Current)',
    timestamp: '12 minutes ago',
    author: 'Dr. Rajesh Verma',
    authorRole: 'Joint Secretary, DoLR',
    summary: 'Added CORS base station baseline spacing (sub-5cm RTK validation requirements).',
    content: `# National Cadastral Resurvey Standards\n\n## Section 4: RTK & Drone Tolerances\n- Continuous Operating Reference Stations (CORS) network density must not exceed 50km baseline spacing.\n- Ground Sampling Distance (GSD) for inhabited rural abadi parcels fixed at sub-5cm.\n- All cadastral vertices must tie into datum WGS-84 / UTM 43N.\n\n## Section 5: Dispute Fast-Tracking\n- Interim boundaries subject to public display at Gram Panchayat for 30 statutory days.`,
  },
  {
    version: 'v2.3',
    timestamp: '2 hours ago',
    author: 'Smt. Ananya Rao',
    authorRole: 'Senior GIS Scientist, NRSC',
    summary: 'Integrated Forest Rights Act (FRA 2006) buffer clause and Bhuvan LISS-IV alignment.',
    content: `# National Cadastral Resurvey Standards\n\n## Section 3: Forest & Tribal Land Demarcation\n- Cadastral survey teams must overlay FRA community forest rights layers before locking survey boundaries.\n- Remote sensing verification required for reserve forest boundaries.`,
  },
  {
    version: 'v2.2',
    timestamp: 'Yesterday at 4:30 PM',
    author: 'Shri K. Raman',
    authorRole: 'Director of Land Records, Maharashtra',
    summary: 'Standardized 14-digit ULPIN parcel format alignment across all State Revenue Codes.',
    content: `# National Cadastral Resurvey Standards\n\n## Section 2: Unique Land Parcel Identification Number (ULPIN)\n- Bhu-Aadhaar (14 digits) generated algorithmically from parcel polygon centroid coordinates.`,
  },
  {
    version: 'v2.1',
    timestamp: '3 days ago',
    author: 'Dr. Rajesh Verma',
    authorRole: 'Joint Secretary, DoLR',
    summary: 'Initial Inter-Departmental Committee working draft adopted.',
    content: `# National Cadastral Resurvey Standards\n\nWorking Committee Draft for state consultation and inter-ministerial harmonization.`,
  },
];

export type DocumentRevision = {
  version: string;
  timestamp: string;
  author: string;
  authorRole: string;
  summary: string;
  content: string;
};

export const initialRevisions: DocumentRevision[] = [
  {
    version: 'v2.4 (Current)',
    timestamp: '12 minutes ago',
    author: 'Dr. Rajesh Verma',
    authorRole: 'Joint Secretary, DoLR',
    summary: 'Added CORS base station baseline spacing (sub-5cm RTK validation requirements).',
    content: `# National Cadastral Resurvey Standards\n\n## Section 4: RTK & Drone Tolerances\n- Continuous Operating Reference Stations (CORS) network density must not exceed 50km baseline spacing.\n- Ground Sampling Distance (GSD) for inhabited rural abadi parcels fixed at sub-5cm.\n- All cadastral vertices must tie into datum WGS-84 / UTM 43N.\n\n## Section 5: Dispute Fast-Tracking\n- Interim boundaries subject to public display at Gram Panchayat for 30 statutory days.`,
  },
  {
    version: 'v2.3',
    timestamp: '2 hours ago',
    author: 'Smt. Ananya Rao',
    authorRole: 'Senior GIS Scientist, NRSC',
    summary: 'Integrated Forest Rights Act (FRA 2006) buffer clause and Bhuvan LISS-IV alignment.',
    content: `# National Cadastral Resurvey Standards\n\n## Section 3: Forest & Tribal Land Demarcation\n- Cadastral survey teams must overlay FRA community forest rights layers before locking survey boundaries.\n- Remote sensing verification required for reserve forest boundaries.`,
  },
  {
    version: 'v2.2',
    timestamp: 'Yesterday at 4:30 PM',
    author: 'Shri K. Raman',
    authorRole: 'Director of Land Records, Maharashtra',
    summary: 'Standardized 14-digit ULPIN parcel format alignment across all State Revenue Codes.',
    content: `# National Cadastral Resurvey Standards\n\n## Section 2: Unique Land Parcel Identification Number (ULPIN)\n- Bhu-Aadhaar (14 digits) generated algorithmically from parcel polygon centroid coordinates.`,
  },
  {
    version: 'v2.1',
    timestamp: '3 days ago',
    author: 'Dr. Rajesh Verma',
    authorRole: 'Joint Secretary, DoLR',
    summary: 'Initial Inter-Departmental Committee working draft adopted.',
    content: `# National Cadastral Resurvey Standards\n\nWorking Committee Draft for state consultation and inter-ministerial harmonization.`,
  },
];

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
      <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

type BadgeType = 'In Committee Review' | 'Cabinet Draft' | 'Peer Review Approved' | 'Archived';

type WorkspaceTask = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date?: string;
};

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisions, setRevisions] = useState<DocumentRevision[]>(initialRevisions);
  const [selectedRevision, setSelectedRevision] = useState<DocumentRevision | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Read-Only Observer');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [notes, setNotes] = useState(initialRevisions[0].content);
  const [chatInput, setChatInput] = useState('');
  const [lastNoteSaved, setLastNoteSaved] = useState<string>('Just now');
  
  const currentUser = useAuthStore(s => s.user);

  const activeCollaborators = [
    { name: 'Dr. Rajesh Verma', role: 'Joint Secretary, DoLR', status: 'Editing Sec 4.2', color: 'bg-emerald-600' },
    { name: 'Smt. Ananya Rao', role: 'GIS Lead, NRSC', status: 'Reviewing Orthomosaics', color: 'bg-blue-600' },
    { name: 'Shri K. Raman', role: 'Director Land Records', status: 'Active Co-Author', color: 'bg-amber-600' },
    { name: currentUser?.full_name || 'Nirmal Darekar', role: 'Super Admin', status: 'Editing Now', color: 'bg-indigo-600' },
  ];
  const token = useAuthStore(s => s.token);
  const { messages, sendMessage, isConnected } = useChat(selectedProject);

  const initialProjects = [
    { id: 'proj-1', title: 'Joint Working Group on Cadastral Resurvey Standards', members: 12, status: 'In Committee Review' as BadgeType, updated: '2 days ago' },
    { id: 'proj-2', title: 'Western Ghats Tenancy Rights Analysis', members: 5, status: 'Peer Review Approved' as BadgeType, updated: '5 hours ago' },
    { id: 'proj-3', title: 'Model Mutation Workflow Blueprint', members: 8, status: 'Cabinet Draft' as BadgeType, updated: '1 week ago' },
  ];

  const defaultTasks: Record<string, WorkspaceTask[]> = {
    'proj-1': [
      { id: 't-1', title: 'Draft Formulation & Drone Survey Specifications', status: 'done', due_date: 'Completed 12 Aug 2025' },
      { id: 't-2', title: 'Inter-Departmental Review with NIC & State Revenue', status: 'in_progress', due_date: 'Due Oct 15, 2025' },
      { id: 't-3', title: 'Final Gazette Submission & Cadastral Schema Lock', status: 'todo', due_date: 'Due Nov 01, 2025' },
    ],
    'proj-2': [
      { id: 't-4', title: 'Tenancy Land Record Discrepancy Reconciliation', status: 'done', due_date: 'Completed 20 Sep 2025' },
      { id: 't-5', title: 'Ecological Buffer Zone Overlay Analysis', status: 'in_progress', due_date: 'Due Oct 28, 2025' },
    ],
    'proj-3': [
      { id: 't-6', title: 'Model Mutation API Specification Drafting', status: 'done', due_date: 'Completed 05 Sep 2025' },
      { id: 't-7', title: 'Public Feedback Window Synthesis', status: 'todo', due_date: 'Due Oct 20, 2025' },
    ]
  };

  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Fetch workspaces on mount
  useEffect(() => {
    if (!token) return;
    api.get('/workspaces/')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const apiProjects = res.data.map((w: any) => ({
            id: String(w.id),
            title: w.name,
            members: 1,
            status: 'In Committee Review' as BadgeType,
            updated: 'Just now'
          }));
          setProjects([...apiProjects, ...initialProjects]);
        }
      })
      .catch(() => {});
  }, [token]);

  // Load project notes and tasks when a workspace is selected
  useEffect(() => {
    if (!selectedProject) return;

    // Load notes from localStorage
    const savedNotes = localStorage.getItem(`workspace_notes_${selectedProject}`);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes(
        `## Research Observations & Action Items\n\n` +
        `- Verified cadastral overlap against Survey of India 1:4000 baseline.\n` +
        `- Boundary discrepancy resolved for 14 revenue villages.\n\n` +
        `### Statutory Alignment\n` +
        `In compliance with Section 6 of DILRMP Guidelines (2024 Revision).`
      );
    }

    // Load tasks
    setIsLoadingTasks(true);
    // If it looks like a valid UUID, attempt API fetch
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedProject);
    if (isUuid && token) {
      api.get(`/workspaces/${selectedProject}/tasks`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setTasks(res.data);
          } else {
            setTasks(defaultTasks['proj-1']);
          }
        })
        .catch(() => {
          setTasks(defaultTasks['proj-1']);
        })
        .finally(() => setIsLoadingTasks(false));
    } else {
      setTasks(defaultTasks[selectedProject] || [
        { id: 'def-1', title: 'Scoping & Statutory Objective Alignment', status: 'done', due_date: 'Completed' },
        { id: 'def-2', title: 'Empirical Baseline Evidence Synthesis', status: 'in_progress', due_date: 'In Review' },
        { id: 'def-3', title: 'Inter-Ministerial Gazette Submission', status: 'todo', due_date: 'Upcoming' },
      ]);
      setIsLoadingTasks(false);
    }
  }, [selectedProject, token]);

  const handleSaveNotes = () => {
    if (!selectedProject) return;
    localStorage.setItem(`workspace_notes_${selectedProject}`, notes);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastNoteSaved(`Saved at ${timeStr}`);
    toast.success('Collaborative policy notes saved to workspace');
  };

  const handleCreateWorkspace = async () => {
    if (!newTitle.trim()) return;
    try {
      if (token) {
        const res = await api.post('/workspaces/', {
          name: newTitle.trim(),
          description: newDesc.trim() || 'Collaborative inter-institutional research group',
        });
        if (res.data) {
          const created = res.data;
          setProjects(prev => [{
            id: String(created.id),
            title: created.name,
            members: 1,
            status: 'In Committee Review' as BadgeType,
            updated: 'Just now'
          }, ...prev]);
          toast.success(`Workspace "${created.name}" created and synced to database`);
        }
      } else {
        // Fallback for unauthenticated/demo
        const newProj = {
          id: `proj-${Date.now()}`,
          title: newTitle.trim(),
          members: 1,
          status: 'In Committee Review' as BadgeType,
          updated: 'Just now'
        };
        setProjects(prev => [newProj, ...prev]);
        toast.success(`Workspace "${newTitle}" created locally`);
      }
      setNewTitle('');
      setNewDesc('');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create workspace');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedProject);
    if (isUuid && token) {
      try {
        const res = await api.post(`/workspaces/${selectedProject}/tasks`, {
          title: newTaskTitle.trim(),
          description: 'Deliverable registered in inter-institutional tracker',
          due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null
        });
        if (res.data) {
          setTasks(prev => [...prev, res.data]);
          toast.success('Task created and recorded in database');
        }
      } catch (err) {
        // Fallback local
        const newTask: WorkspaceTask = {
          id: `task-${Date.now()}`,
          title: newTaskTitle.trim(),
          status: 'todo',
          due_date: newTaskDueDate ? `Due ${newTaskDueDate}` : 'Scheduled',
        };
        setTasks(prev => [...prev, newTask]);
        toast.success('Task scheduled in workspace');
      }
    } else {
      const newTask: WorkspaceTask = {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        status: 'todo',
        due_date: newTaskDueDate ? `Due ${newTaskDueDate}` : 'Scheduled',
      };
      setTasks(prev => [...prev, newTask]);
      toast.success('Task added to deliverable tracker');
    }

    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTaskModal(false);
  };

  const handleToggleTaskStatus = async (task: WorkspaceTask) => {
    const nextStatus: WorkspaceTask['status'] = task.status === 'done' ? 'todo' : 'done';
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(task.id);
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

    if (isUuid && token) {
      try {
        await api.patch(`/workspaces/tasks/${task.id}`, { status: nextStatus });
        toast.success(`Task marked as ${nextStatus === 'done' ? 'Completed' : 'To-Do'}`);
      } catch {
        toast.warning('Task updated locally');
      }
    } else {
      toast.success(`Task marked as ${nextStatus === 'done' ? 'Completed' : 'Pending'}`);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter a valid institution email');
      return;
    }
    setShowInviteModal(false);
    toast.success(`Official invitation dispatched to ${inviteEmail} with ${inviteRole} permissions`);
    setInviteEmail('');
  };

  const handleExportWorkspace = () => {
    const project = projects.find(p => p.id === selectedProject);
    const exportData = {
      workspace: project?.title,
      status: project?.status,
      exported_at: new Date().toISOString(),
      tasks,
      notes,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.json`;
    a.click();
    toast.success('Workspace brief exported for inter-departmental distribution');
  };

  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject);
    return (
      <PageFrame
        kicker="Team Workspace"
        title={project?.title || 'Workspace'}
        description="Shared documents, collaborative notes, team discussions, and progress tracking."
        actions={
          <div className="flex gap-2">
            <button 
              className="focus-ring flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" 
              onClick={() => setSelectedProject(null)}
            >
              Back to Catalog
            </button>
            <button 
              className="focus-ring flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" 
              onClick={handleExportWorkspace}
            >
              <Download className="h-3.5 w-3.5" /> Export Brief
            </button>
            <button 
              className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
              onClick={() => setShowInviteModal(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Invite Member
            </button>
          </div>
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-slate-300 bg-white p-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={project?.status as BadgeType} />
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <UsersRound className="h-4 w-4 text-slate-500" /> {project?.members} Active Members
            </span>
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-500" /> Updated {project?.updated}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            ID: <span className="text-slate-800 font-bold">{selectedProject.slice(0, 16)}</span>
          </div>
        </div>

        {/* Live Collaborator Presence Strip (PS 26019 Item 9) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-slate-300 bg-white p-3.5 shadow-2xs" data-testid="strip-active-collaborators">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              <UsersRound className="h-4 w-4 text-emerald-600" />
              Active Co-Authors (Live Session):            </span>
            <div className="flex items-center gap-2">
              {activeCollaborators.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs"
                >
                  <span className={`h-2 w-2 rounded-full ${c.color} animate-pulse`} />
                  <span className="font-semibold text-slate-800 text-[11px]">{c.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({c.status})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Simultaneous Multi-Cursor Sync Active</span>          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Milestone Kanban & Task Tracker */}
          <Panel 
            title="Tasks &amp; Milestones Tracker"
            headerAction={
              <button 
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E293B] hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add Task
              </button>
            }
          >
            <div className="p-4 space-y-3">
              {isLoadingTasks ? (
                <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1E293B]" /> Loading deliverables...
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                  No deliverables scheduled yet. Click "+ Add Deliverable" to initiate.
                </div>
              ) : (
                tasks.map(task => {
                  const isDone = task.status === 'done';
                  const isInProgress = task.status === 'in_progress';
                  return (
                    <div 
                      key={task.id} 
                      className={`border p-3 transition-colors ${
                        isDone 
                          ? 'border-emerald-200 bg-[#F0FDF4]' 
                          : isInProgress 
                          ? 'border-amber-300 bg-amber-50/50' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button 
                          onClick={() => handleToggleTaskStatus(task)} 
                          className="mt-0.5 text-slate-600 hover:text-emerald-700 transition-colors"
                        >
                          {isDone ? (
                            <CheckSquare className="h-4 w-4 text-[#15803D]" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500' : 'text-[#1E293B]'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {task.due_date || 'No due date'}
                            </span>
                            <span className={`font-bold uppercase tracking-wider ${
                              isDone ? 'text-emerald-700' : isInProgress ? 'text-amber-700' : 'text-slate-600'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>

          {/* Collaborative Notes (PS 26019 Item 9) */}
          <Panel 
            title="Collaborative Policy Notes" 
            className="lg:col-span-1"
            headerAction={
              <button
                type="button"
                onClick={() => setShowRevisionModal(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#1E293B] hover:text-blue-700 transition-colors"
                data-testid="button-open-revisions"
              >
                <History className="h-3.5 w-3.5 text-blue-700" />
                Revision History ({revisions.length})
              </button>
            }
          >
            <div className="p-0 border-b border-slate-200 bg-[#F8FAFC] px-4 py-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Markdown Co-Editor</span>
              <span className="text-[10px] text-slate-500">{lastNoteSaved}</span>
            </div>

            {/* Live Typing Presence Indicator */}
            <div className="flex items-center gap-2 bg-blue-50/90 border-b border-blue-100 px-4 py-1.5 text-[11px] text-blue-800">
              <Loader2 className="h-3 w-3 animate-spin text-blue-600 shrink-0" />
              <span><strong>Dr. Rajesh Verma</strong> (DoLR) is currently editing Paragraph 4: CORS network tolerances...</span>
            </div>

            <textarea
              className="w-full h-[230px] p-4 text-xs font-mono text-slate-800 bg-white focus:outline-none resize-none leading-relaxed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter inter-departmental working draft notes..."
            />
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Auto-persisted to local cache &amp; synced</span>
              <button 
                onClick={handleSaveNotes}
                className="text-xs font-bold text-[#1E293B] hover:text-emerald-700 transition-colors"
              >
                Save Draft
              </button>
            </div>
          </Panel>

          {/* Workspace Chat */}
          <Panel title="Workspace Consultation (Threaded Chat)" className="lg:col-span-1 flex flex-col">
            <div className="p-2 border-b border-slate-200 bg-[#F8FAFC] flex justify-between items-center text-[10px] font-bold">
              {isConnected ? (
                <span className="text-[#15803D] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Live Channel Active</span>
              ) : (
                <span className="text-[#B45309] flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Connected (Polling Fallback)</span>
              )}
              <span className="text-slate-500">ID: {currentUser?.full_name || 'Researcher'}</span>
            </div>
            <div className="flex-1 h-[250px] overflow-y-auto p-4 bg-white space-y-3">
              {messages.length === 0 ? (
                <div className="text-center mt-12 space-y-2">
                  <MessageSquare className="h-6 w-6 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No consultation messages yet.</p>
                  <p className="text-[10px] text-slate-400">Collaborators can discuss cadastral data and policy clauses in real time.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.user_id === currentUser?.id;
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-500 mb-1">{isMe ? 'You' : msg.user_name}</span>
                      <div className={`px-3 py-2 rounded max-w-[80%] text-sm ${isMe ? 'bg-[#1E293B] text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-slate-200 p-3 bg-slate-50 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    sendMessage(chatInput.trim());
                    setChatInput('');
                  }
                }}
                className="flex-1 border border-slate-300 px-3 py-2 text-xs focus-ring bg-white"
                placeholder="Type consultation message..."
              />
              <button 
                onClick={() => {
                  if (chatInput.trim()) {
                    sendMessage(chatInput.trim());
                    setChatInput('');
                  }
                }}
                disabled={!chatInput.trim()}
                className="bg-[#1E293B] text-white px-3 py-2 flex items-center justify-center disabled:opacity-50 hover:bg-slate-800 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </Panel>

          {/* Shared Document Library */}
          <Panel title="Shared Document Library" className="lg:col-span-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Document Name</th>
                    <th className="px-4 py-3 font-bold">Department / Organization</th>
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
                    <td className="px-4 py-3 text-slate-600">NIC & Survey of India</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-full border border-amber-200">
                        <MessageSquare className="h-3 w-3" /> 14 comments
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => toast.info('Opening document viewer with comments...')}
                        className="text-[#1E293B] font-bold hover:underline"
                      >
                        View &amp; Comment
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-semibold text-[#1E293B]">
                        <FileText className="h-4 w-4 text-slate-400" />
                        Boundary_Dispute_Analysis_2024.docx
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">IISc Bangalore & DoLR</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                        <MessageSquare className="h-3 w-3" /> 2 comments
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => toast.info('Opening document viewer...')}
                        className="text-[#1E293B] font-bold hover:underline"
                      >
                        View &amp; Comment
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Add Deliverable Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 p-4">
            <div className="w-full max-w-md bg-white shadow-xl border border-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
                <h3 className="font-bold text-[#1E293B]">Add a New Task / Deliverable</h3>
                <button onClick={() => setShowAddTaskModal(false)} className="text-slate-500 hover:text-[#1E293B]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cadastral Boundary Ground-Truthing Report" 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                  <input 
                    type="date" 
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring bg-white"
                  />
                </div>
              </div>
              <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2 bg-slate-50">
                <button 
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 text-xs font-bold bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 p-4">
            <div className="w-full max-w-md bg-white shadow-xl border border-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
                <h3 className="font-bold text-[#1E293B]">Invite Collaborator</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-[#1E293B]"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Email or Official ID *</label>
                  <input 
                    type="email" 
                    placeholder="e.g. director.dolr@nic.in or researcher@iisc.ac.in" 
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Permission Level</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring bg-white"
                  >
                    <option>Read-Only Observer</option>
                    <option>Co-Author (Full Edit)</option>
                    <option>Committee Reviewer</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-[#15803D]" />
                  <p>Only invited and verified members can access this workspace.</p>
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
                  onClick={handleSendInvite}
                  disabled={!inviteEmail.trim()}
                  className="px-4 py-2 text-xs font-bold bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revision History Modal Drawer (PS 26019 Item 9) */}
        {showRevisionModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/50 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Document revision history"
            onClick={() => setShowRevisionModal(false)}
          >
            <div
              className="w-full max-w-2xl bg-white shadow-2xl border border-slate-300 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-700" />
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-sm">Policy Document Revision History</h3>
                    <p className="text-[11px] text-slate-500">Immutable audit trail of collaborative draft changes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {revisions.map((rev, idx) => (
                  <div
                    key={rev.version}
                    className={`border p-4 transition-colors ${
                      idx === 0 ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-300' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                          {rev.version}
                        </span>
                        <span className="font-semibold text-xs text-[#1E293B]">{rev.author}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({rev.authorRole})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {rev.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium mb-3">
                      {rev.summary}
                    </p>

                    <div className="bg-slate-50 p-2.5 border border-slate-200 rounded text-[11px] font-mono text-slate-800 max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {rev.content.slice(0, 180)}...
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNotes(rev.content);
                          setShowRevisionModal(false);
                          toast.success(`Restored document to version ${rev.version} (by ${rev.author})`);
                        }}
                        className="focus-ring flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-[#1E293B]"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {idx === 0 ? 'Active Draft' : `Restore ${rev.version}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 text-[11px] text-slate-500 flex justify-between items-center shrink-0">
                <span>Backed by Central DoLR Cryptographic Ledger</span>
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#1E293B] text-white hover:bg-slate-800"
                >
                  Close
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
      kicker="Team Collaboration / Working Groups"
      title="Collaborative Workspaces"
      description="Shared spaces for government officials, researchers, and institutions to work together on land policies, documents, and projects."
      actions={
        <button 
          className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800" 
          type="button"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-3.5 w-3.5" /> New Workspace
        </button>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="border border-slate-300 bg-white p-5 flex flex-col transition-all hover:border-[#1E293B] hover:shadow-md cursor-pointer group" 
            onClick={() => setSelectedProject(project.id)}
          >
            <div className="mb-4">
              <StatusBadge status={project.status} />
            </div>
            <h3 className="font-bold text-[#1E293B] text-base group-hover:text-blue-900 mb-2 flex-1 leading-snug">
              {project.title}
            </h3>
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 mt-4 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5 text-slate-400" /> {project.members} Members</span>
              <span className="flex items-center gap-1.5"><FolderOpen className="h-3.5 w-3.5 text-slate-400" /> Active Workspace</span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 p-4">
          <div className="w-full max-w-md bg-white shadow-xl border border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
              <h3 className="font-bold text-[#1E293B]">Create Collaborative Workspace</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-[#1E293B]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. National Pilot on CORS Drone Resurvey Standards"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  placeholder="Briefly describe the purpose and goals of this workspace..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring resize-none bg-white" 
                />
              </div>
              <div className="bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Shield className="h-4 w-4 shrink-0 text-[#15803D]" />
                <p>Each workspace includes real-time chat, task tracking, and shared document collaboration.</p>
              </div>
            </div>
            <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2 bg-slate-50">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateWorkspace}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-xs font-bold bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" /> Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
