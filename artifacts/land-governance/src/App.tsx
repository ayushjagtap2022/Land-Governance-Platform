import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckCircle2, ChevronRight, CircleHelp, Download, FileCheck2, Filter, MapPin, Minus, Plus, Search, Send, Table2, Upload, UsersRound } from 'lucide-react';
import { Link, Route, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleProvider, useRole, type Role } from '@/context/RoleContext';
import { activity, documentCategories, documents, initialStates, type DocumentCategory, type LandDocument } from '@/data/mockData';
import CentralRepositoryPage from '@/pages/repository-page';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb">
      <span>National Land Governance Platform</span><ChevronRight className="h-3 w-3" /><span className="font-semibold text-[#244562]">{current}</span>
    </div>
  );
}

function PageFrame({ title, kicker, description, children, actions }: { title: string; kicker: string; description: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="mx-auto max-w-[1480px] px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb current={title} />
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">{kicker}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid={`text-page-title-${title.toLowerCase().replaceAll(' ', '-')}`}>{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function Panel({ title, eyebrow, children, className = '' }: { title?: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border border-slate-300 bg-white ${className}`}>
      {(title || eyebrow) && <div className="border-b border-slate-200 px-4 py-3 md:px-5">
        {eyebrow && <p className="section-kicker mb-1">{eyebrow}</p>}
        {title && <h2 className="text-sm font-bold text-[#244562]">{title}</h2>}
      </div>}
      {children}
    </div>
  );
}

function AccessDenied({ requested }: { requested: string }) {
  const { activeRole } = useRole();
  return (
    <PageFrame kicker="Access control" title="Access restricted" description={`The ${requested} workspace is not enabled for the ${activeRole} demo persona.`}>
      <div className="border border-slate-300 bg-white p-6 md:p-10">
        <div className="flex max-w-xl items-start gap-4">
          <div className="border border-[#f2b134] bg-[#fff8e8] p-3"><CircleHelp className="h-6 w-6 text-[#9b6300]" /></div>
          <div>
            <h2 className="text-lg font-bold text-[#132f4c]">Choose another workspace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use the Demo Persona Switcher in the government header to review the permissions and navigation available to another role.</p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function Guard({ allowed, name, children }: { allowed: Role[]; name: string; children: ReactNode }) {
  const { activeRole } = useRole();
  return allowed.includes(activeRole) ? <>{children}</> : <AccessDenied requested={name} />;
}

const allRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const researchRoles: Role[] = ['Researcher'];
const governanceRoles: Role[] = ['Official', 'Institution Admin', 'Super Admin'];

function RepositoryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocumentCategory | 'All'>('All');
  const [selected, setSelected] = useState<LandDocument | null>(null);
  const filtered = useMemo(() => documents.filter((doc) => {
    const matchesCategory = category === 'All' || doc.category === category;
    const search = query.toLowerCase();
    return matchesCategory && (!search || `${doc.title} ${doc.department} ${doc.summary}`.toLowerCase().includes(search));
  }), [category, query]);

  return (
    <PageFrame
      kicker="Public repository / verified knowledge"
      title="Land Governance Repository"
      description="A structured index of policy, legislation, standards and evidence for India’s land records and governance programmes."
      actions={<button className="focus-ring flex items-center gap-2 border border-[#244562] bg-[#244562] px-3 py-2 text-xs font-bold text-white hover:bg-[#132f4c]" data-testid="button-repository-download" type="button"><Download className="h-3.5 w-3.5" />Download index</button>}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Panel className="mb-5">
            <div className="flex flex-col gap-3 p-4 md:flex-row">
              <div className="relative flex-1">
                <label className="sr-only" htmlFor="repository-search">Search repository</label>
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input className="focus-ring h-10 w-full border border-slate-300 pl-9 pr-3 text-sm" data-testid="input-repository-search" id="repository-search" placeholder="Search by title, department or subject" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <label className="sr-only" htmlFor="repository-category">Filter by category</label>
                <select className="focus-ring h-10 border border-slate-300 bg-white px-3 text-sm text-slate-700" data-testid="select-repository-category" id="repository-category" value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory | 'All')}>
                  <option value="All">All categories</option>
                  {documentCategories.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
              <span data-testid="text-repository-result-count">{filtered.length} of {documents.length} records shown</span>
              <button className="focus-ring font-semibold text-[#244562] underline underline-offset-2" data-testid="button-clear-repository-filter" type="button" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button>
            </div>
          </Panel>
          <Panel>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                <thead className="bg-[#eef2f5] text-[10px] uppercase tracking-wider text-slate-600">
                  <tr><th className="border-b border-slate-300 px-4 py-3 font-bold">Document / subject</th><th className="border-b border-slate-300 px-4 py-3 font-bold">Category</th><th className="border-b border-slate-300 px-4 py-3 font-bold">Year</th><th className="border-b border-slate-300 px-4 py-3 font-bold">Last updated</th><th className="border-b border-slate-300 px-4 py-3 font-bold">Status</th><th className="border-b border-slate-300 px-4 py-3" /></tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => <tr className="hover:bg-[#f8fafb]" data-testid={`row-document-${doc.id}`} key={doc.id}>
                    <td className="border-b border-slate-200 px-4 py-3"><button className="focus-ring text-left font-bold text-[#244562] underline-offset-2 hover:underline" data-testid={`button-document-${doc.id}`} type="button" onClick={() => setSelected(doc)}>{doc.title}</button><p className="mt-1 text-[11px] text-slate-500">{doc.department}</p></td>
                    <td className="border-b border-slate-200 px-4 py-3 text-slate-600">{doc.category}</td>
                    <td className="border-b border-slate-200 px-4 py-3 font-mono text-slate-600">{doc.year}</td>
                    <td className="border-b border-slate-200 px-4 py-3 text-slate-600">{doc.updated}</td>
                    <td className="border-b border-slate-200 px-4 py-3"><span className={`inline-flex items-center gap-1.5 ${doc.status === 'Verified' ? 'text-[#287449]' : 'text-[#9b6300]'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{doc.status}</span></td>
                    <td className="border-b border-slate-200 px-4 py-3 text-right"><button className="focus-ring border border-slate-300 px-2 py-1 font-semibold text-[#244562] hover:bg-slate-100" data-testid={`button-open-document-${doc.id}`} type="button" onClick={() => setSelected(doc)}>Open</button></td>
                  </tr>)}
                  {!filtered.length && <tr><td className="px-4 py-12 text-center text-slate-500" colSpan={6}>No repository records match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel eyebrow="Browse by subject" title="Repository index">
            <div className="divide-y divide-slate-200">
              {documentCategories.map((item) => <button className={`focus-ring flex w-full items-center justify-between px-4 py-3 text-left text-xs hover:bg-slate-50 ${category === item.key ? 'bg-[#fff8e8] font-bold text-[#7b4c00]' : 'text-slate-700'}`} data-testid={`button-category-${item.key.toLowerCase().replaceAll(' ', '-')}`} key={item.key} type="button" onClick={() => setCategory(item.key)}><span>{item.label}</span><span className="font-mono text-slate-500">{item.count}</span></button>)}
            </div>
          </Panel>
          <Panel eyebrow="Record standard" title="Verified source policy">
            <div className="p-4 text-xs leading-5 text-slate-600"><div className="mb-3 flex items-center gap-2 font-semibold text-[#287449]"><CheckCircle2 className="h-4 w-4" /> Officially indexed sources</div><p>Each item carries a department owner, update date and review status. Cite the document identifier in research outputs.</p></div>
          </Panel>
        </div>
      </div>
      {selected && <div className="fixed inset-0 z-40 flex justify-end bg-[#132f4c]/30" role="dialog" aria-modal="true" aria-label="Document detail">
        <div className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-300 bg-white shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-300 bg-[#eef2f5] p-5"><div><p className="section-kicker mb-2">{selected.id}</p><h2 className="text-xl font-bold text-[#132f4c]">{selected.title}</h2></div><button className="focus-ring border border-slate-400 px-2 py-1 text-xs font-bold" data-testid="button-close-document" type="button" onClick={() => setSelected(null)}>Close</button></div>
          <div className="space-y-5 p-5 text-sm"><p className="leading-6 text-slate-600">{selected.summary}</p><dl className="grid grid-cols-2 gap-3 text-xs"><div className="border border-slate-200 p-3"><dt className="text-slate-500">Source department</dt><dd className="mt-1 font-semibold text-slate-800">{selected.department}</dd></div><div className="border border-slate-200 p-3"><dt className="text-slate-500">Format / pages</dt><dd className="mt-1 font-semibold text-slate-800">{selected.format} / {selected.pages}</dd></div><div className="border border-slate-200 p-3"><dt className="text-slate-500">Review status</dt><dd className="mt-1 font-semibold text-[#287449]">{selected.status}</dd></div><div className="border border-slate-200 p-3"><dt className="text-slate-500">Updated</dt><dd className="mt-1 font-semibold text-slate-800">{selected.updated}</dd></div></dl><button className="focus-ring flex items-center gap-2 bg-[#244562] px-4 py-2 text-xs font-bold text-white" data-testid="button-download-document" type="button"><Download className="h-4 w-4" />Download source record</button></div>
        </div>
      </div>}
    </PageFrame>
  );
}

function MapPage() {
  const [state, setState] = useState(initialStates[0].name);
  const [layer, setLayer] = useState('Cadastral coverage');
  return <PageFrame kicker="Spatial data access" title="GIS Map" description="Inspect state-level coverage, village boundaries and land-record modernisation layers. Map services are represented with an accessible preview grid in this build." actions={<button className="focus-ring flex items-center gap-2 border border-[#244562] bg-[#244562] px-3 py-2 text-xs font-bold text-white" data-testid="button-map-download" type="button"><Download className="h-3.5 w-3.5" />Export view</button>}>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Panel className="overflow-hidden"><div className="data-grid relative min-h-[510px] bg-[#e7eff0]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,.8),transparent_28%),linear-gradient(135deg,transparent_48%,rgba(39,133,75,.18)_49%,transparent_52%)]" /><div className="absolute left-[22%] top-[20%] h-32 w-48 rotate-12 border-2 border-[#2e7650]/60 bg-[#d8e9dc]/50" /><div className="absolute left-[46%] top-[34%] h-44 w-64 -rotate-6 border-2 border-[#2e7650]/60 bg-[#d8e9dc]/40" /><div className="absolute left-[30%] top-[62%] h-24 w-52 rotate-3 border-2 border-[#d49333]/60 bg-[#f8eacb]/45" /><div className="absolute bottom-5 left-5 border border-slate-400 bg-white/90 p-3 text-[11px] text-slate-700"><p className="mb-2 font-bold">Preview map · {state}</p><p className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-[#2e7650]" />Verified parcel coverage</p><p className="mt-1 flex items-center gap-2"><span className="h-2.5 w-2.5 bg-[#d49333]" />Pilot / under review</p></div><div className="absolute right-5 top-5 flex flex-col border border-slate-400 bg-white"><button className="focus-ring p-2 hover:bg-slate-100" data-testid="button-map-zoom-in" type="button" aria-label="Zoom in"><Plus className="h-4 w-4" /></button><button className="focus-ring border-t border-slate-300 p-2 hover:bg-slate-100" data-testid="button-map-zoom-out" type="button" aria-label="Zoom out"><Minus className="h-4 w-4" /></button></div><div className="absolute left-[51%] top-[41%]"><MapPin className="h-7 w-7 fill-[#f2b134] text-[#132f4c]" /><span className="absolute left-7 top-1 whitespace-nowrap border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-[#132f4c]">Maharashtra pilot</span></div></div></Panel>
      <div className="space-y-5"><Panel eyebrow="Map controls" title="Select geography"><div className="space-y-4 p-4"><label className="block text-xs font-semibold text-slate-700" htmlFor="map-state">State / UT<select className="focus-ring mt-1 h-9 w-full border border-slate-300 bg-white px-2 text-sm font-normal" data-testid="select-map-state" id="map-state" value={state} onChange={(event) => setState(event.target.value)}>{initialStates.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label className="block text-xs font-semibold text-slate-700" htmlFor="map-layer">Data layer<select className="focus-ring mt-1 h-9 w-full border border-slate-300 bg-white px-2 text-sm font-normal" data-testid="select-map-layer" id="map-layer" value={layer} onChange={(event) => setLayer(event.target.value)}><option>Cadastral coverage</option><option>Village boundaries</option><option>Mutation status</option><option>SVAMITVA property cards</option></select></label></div></Panel><Panel eyebrow="Layer summary" title={layer}><div className="grid grid-cols-2 gap-px bg-slate-200"><div className="bg-white p-3"><p className="text-[10px] uppercase text-slate-500">Records</p><p className="mt-1 font-mono text-lg font-bold text-[#132f4c]">{initialStates.find((item) => item.name === state)?.records}</p></div><div className="bg-white p-3"><p className="text-[10px] uppercase text-slate-500">Verified</p><p className="mt-1 font-mono text-lg font-bold text-[#287449]">{initialStates.find((item) => item.name === state)?.verified}%</p></div></div><p className="p-4 text-xs leading-5 text-slate-600">Last layer refresh: 06 Jun 2024. Open data access is subject to state publication policy.</p></Panel></div>
    </div>
  </PageFrame>;
}

function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState<string[]>([]);
  const submit = () => { if (question.trim()) { setAsked((items) => [question.trim(), ...items]); setQuestion(''); } };
  return <PageFrame kicker="Research support / grounded answers" title="AI Assistant" description="Ask questions across indexed land-governance policy. Responses in this demo are represented as traceable research prompts, not official advice."><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><Panel className="min-h-[430px]"><div className="border-b border-slate-200 bg-[#eef2f5] p-5"><p className="text-sm font-bold text-[#132f4c]">Policy research desk</p><p className="mt-1 text-xs text-slate-600">Cite source documents in every working note.</p></div><div className="p-5"><div className="border-l-2 border-[#f2b134] bg-[#fff8e8] p-4 text-sm leading-6 text-slate-700">Welcome. Try a focused question such as <span className="font-semibold">“Compare mutation timelines in the SVAMITVA guidelines and the model state process.”</span></div>{asked.length > 0 && <div className="mt-5 space-y-3">{asked.map((item, index) => <div className="border border-slate-200 p-3 text-sm" data-testid={`text-assistant-question-${index}`} key={`${item}-${index}`}><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Research prompt</p><p className="mt-1 text-[#244562]">{item}</p><p className="mt-2 text-xs text-slate-500">Source matching queued · repository citations will appear here.</p></div>)}</div>}<div className="mt-6 flex gap-2"><label className="sr-only" htmlFor="assistant-question">Ask a research question</label><input className="focus-ring h-11 flex-1 border border-slate-300 px-3 text-sm" data-testid="input-assistant-question" id="assistant-question" placeholder="Ask about a scheme, process or state dataset" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} /><button className="focus-ring flex items-center gap-2 bg-[#244562] px-4 text-xs font-bold text-white" data-testid="button-submit-assistant-question" type="button" onClick={submit}><Send className="h-4 w-4" />Ask</button></div></div></Panel><Panel eyebrow="Use responsibly" title="Assistant boundaries"><div className="space-y-3 p-4 text-xs leading-5 text-slate-600"><p>Answers are grounded in the repository and should be verified against the source record.</p><p>Do not use this workspace for determinations on individual title, ownership or legal entitlement.</p><button className="focus-ring flex items-center gap-2 font-semibold text-[#244562] underline underline-offset-2" data-testid="button-assistant-methodology" type="button"><FileCheck2 className="h-4 w-4" />View citation method</button></div></Panel></div></PageFrame>;
}

function WorkspacesPage() {
  const [selected, setSelected] = useState('Cadastral modernisation evidence brief');
  const workspaces = ['Cadastral modernisation evidence brief', 'State mutation service review', 'SVAMITVA implementation notes'];
  return <PageFrame kicker="Research projects / saved material" title="Workspaces" description="Keep source collections, annotations and synthesis notes together for an auditable research trail." actions={<button className="focus-ring flex items-center gap-2 bg-[#244562] px-3 py-2 text-xs font-bold text-white" data-testid="button-new-workspace" type="button"><Plus className="h-4 w-4" />New workspace</button>}><div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><Panel title="Your workspaces"><div className="divide-y divide-slate-200">{workspaces.map((item, index) => <button className={`focus-ring w-full px-4 py-3 text-left ${selected === item ? 'border-l-2 border-[#f2b134] bg-[#fff8e8]' : 'hover:bg-slate-50'}`} data-testid={`button-workspace-${index}`} key={item} type="button" onClick={() => setSelected(item)}><p className="text-xs font-bold text-[#244562]">{item}</p><p className="mt-1 text-[10px] text-slate-500">{index + 3} source records · Updated {index + 2} days ago</p></button>)}</div></Panel><Panel eyebrow="Active workspace" title={selected}><div className="grid gap-4 p-5 md:grid-cols-3"><div className="border border-slate-200 p-4"><Table2 className="h-5 w-5 text-[#287449]" /><p className="mt-5 font-mono text-2xl font-bold text-[#132f4c]">12</p><p className="text-xs text-slate-500">Source records</p></div><div className="border border-slate-200 p-4"><FileCheck2 className="h-5 w-5 text-[#9b6300]" /><p className="mt-5 font-mono text-2xl font-bold text-[#132f4c]">07</p><p className="text-xs text-slate-500">Verified citations</p></div><div className="border border-slate-200 p-4"><UsersRound className="h-5 w-5 text-[#244562]" /><p className="mt-5 font-mono text-2xl font-bold text-[#132f4c]">02</p><p className="text-xs text-slate-500">Contributors</p></div></div><div className="border-t border-slate-200 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Next action</p><p className="mt-2 text-sm text-slate-700">Add a synthesis note to connect evidence across state implementation records.</p><button className="focus-ring mt-4 flex items-center gap-2 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562]" data-testid="button-add-synthesis-note" type="button"><Plus className="h-3.5 w-3.5" />Add synthesis note</button></div></Panel></div></PageFrame>;
}

function AnalyticsPage() {
  const [period, setPeriod] = useState('FY 2023–24');
  const bars = [{ label: 'Digitised', value: 88 }, { label: 'Geo-referenced', value: 63 }, { label: 'Mutation linked', value: 47 }, { label: 'Publicly searchable', value: 39 }];
  return <PageFrame kicker="Programme intelligence / official view" title="Analytics Hub" description="A common view of land-record modernisation indicators across participating states and programme components."><div className="mb-5 flex items-center justify-between border border-slate-300 bg-white p-4"><div><p className="text-xs font-bold text-[#244562]">Reporting period</p><p className="mt-1 text-xs text-slate-500">Data is indicative for this demonstration workspace.</p></div><select className="focus-ring border border-slate-300 bg-white px-3 py-2 text-xs" data-testid="select-analytics-period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>FY 2023–24</option><option>FY 2022–23</option><option>Q1 FY 2024–25</option></select></div><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><Panel eyebrow="National coverage" title="Modernisation indicators"><div className="space-y-5 p-5">{bars.map((bar) => <div key={bar.label}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-slate-700">{bar.label}</span><span className="font-mono font-bold text-[#244562]">{bar.value}%</span></div><div className="h-3 bg-slate-100"><div className={`h-full ${bar.value > 70 ? 'bg-[#287449]' : bar.value > 50 ? 'bg-[#d49333]' : 'bg-[#547996]'}`} style={{ width: `${bar.value}%` }} /></div></div>)}</div></Panel><Panel eyebrow="State comparison" title="Selected coverage"><div className="divide-y divide-slate-200">{initialStates.map((item) => <div className="flex items-center justify-between px-4 py-3" key={item.code}><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center text-[10px] font-bold text-[#244562] ${item.accent}`}>{item.code}</span><span className="text-xs font-semibold">{item.name}</span></div><span className="font-mono text-xs font-bold text-[#287449]">{item.verified}%</span></div>)}</div></Panel></div></PageFrame>;
}

function SimulatePage() {
  const [notices, setNotices] = useState(30);
  const [days, setDays] = useState(45);
  return <PageFrame kicker="Decision support / scenario modelling" title="Policy Simulator" description="Explore how changes to notice windows and service-level targets may affect a model mutation workflow. This tool does not issue a policy recommendation." actions={<button className="focus-ring flex items-center gap-2 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562]" data-testid="button-save-scenario" type="button"><Download className="h-3.5 w-3.5" />Save scenario</button>}><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"><Panel eyebrow="Scenario inputs" title="Model state mutation workflow"><div className="space-y-7 p-5"><label className="block text-sm font-semibold text-[#244562]" htmlFor="simulator-notices">Notice period <span className="float-right font-mono text-[#132f4c]">{notices} days</span><input className="mt-3 block w-full accent-[#244562]" data-testid="input-simulator-notices" id="simulator-notices" max="60" min="7" type="range" value={notices} onChange={(event) => setNotices(Number(event.target.value))} /></label><label className="block text-sm font-semibold text-[#244562]" htmlFor="simulator-days">Target disposal time <span className="float-right font-mono text-[#132f4c]">{days} days</span><input className="mt-3 block w-full accent-[#244562]" data-testid="input-simulator-days" id="simulator-days" max="90" min="15" type="range" value={days} onChange={(event) => setDays(Number(event.target.value))} /></label><div className="border-l-2 border-[#f2b134] bg-[#fff8e8] p-4 text-xs leading-5 text-slate-700">Adjust inputs to compare an implementation scenario. Use the evidence repository before preparing an official note.</div></div></Panel><Panel eyebrow="Indicative output" title="Workflow signal"><div className="p-5"><div className="border border-slate-200 p-4"><p className="text-xs text-slate-500">Projected service completion</p><p className="mt-2 font-mono text-4xl font-bold text-[#132f4c]">{Math.max(31, 100 - Math.round((notices + days) / 2))}%</p><p className="mt-1 text-xs text-[#287449]">Model output improves with a shorter notice period</p></div><div className="mt-4 space-y-3 text-xs text-slate-600"><p className="flex justify-between"><span>Applicant notice</span><span className="font-mono">{notices} days</span></p><p className="flex justify-between"><span>Officer disposal target</span><span className="font-mono">{days} days</span></p><p className="flex justify-between"><span>Assumption set</span><span className="font-mono">MUT-2024-A</span></p></div></div></Panel></div></PageFrame>;
}

function InnovationPage() {
  const [submitted, setSubmitted] = useState(false);
  return <PageFrame kicker="Open collaboration / pilots" title="Innovation Portal" description="A structured entry point for institutions and practitioners working on responsible land-governance technology."><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><Panel eyebrow="Current challenge" title="Help improve record discoverability"><div className="p-5"><p className="text-sm leading-6 text-slate-700">The platform is seeking tested approaches for linking legacy cadastral sheets, village boundaries and public metadata without exposing restricted personal information.</p><div className="mt-5 flex flex-wrap gap-2 text-[11px]"><span className="border border-slate-300 bg-slate-50 px-2 py-1">Open data</span><span className="border border-slate-300 bg-slate-50 px-2 py-1">Interoperability</span><span className="border border-slate-300 bg-slate-50 px-2 py-1">Privacy by design</span></div><button className="focus-ring mt-6 flex items-center gap-2 bg-[#244562] px-4 py-2 text-xs font-bold text-white" data-testid="button-submit-idea" type="button" onClick={() => setSubmitted(true)}>{submitted ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}{submitted ? 'Expression recorded' : 'Submit an expression of interest'}</button></div></Panel><Panel eyebrow="Programme calendar" title="Upcoming opportunities"><div className="divide-y divide-slate-200">{['Cadastral interoperability clinic', 'State GIS partner briefing', 'Research methods roundtable'].map((item, index) => <div className="flex gap-3 p-4" key={item}><span className="font-mono text-xs font-bold text-[#9b6300]">0{index + 8}<br /><span className="text-[10px] text-slate-500">JUL</span></span><div><p className="text-xs font-bold text-[#244562]">{item}</p><p className="mt-1 text-[11px] text-slate-500">Online · Registration required</p></div></div>)}</div></Panel></div></PageFrame>;
}

function AdminPage() {
  const [notice, setNotice] = useState('');
  return <PageFrame kicker="Platform operations / restricted" title="Admin Console" description="Manage source verification queues, institutional access and publication workflows for the demonstration platform."><div className="grid gap-5 lg:grid-cols-3"><Panel eyebrow="Review queue" title="Pending verification"><div className="p-5"><p className="font-mono text-4xl font-bold text-[#132f4c]">18</p><p className="mt-1 text-xs text-slate-500">records awaiting review</p><button className="focus-ring mt-5 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562]" data-testid="button-review-queue" type="button" onClick={() => setNotice('Review queue opened below.')}>Open queue</button></div></Panel><Panel eyebrow="Institutions" title="Access requests"><div className="p-5"><p className="font-mono text-4xl font-bold text-[#132f4c]">07</p><p className="mt-1 text-xs text-slate-500">new requests this week</p><button className="focus-ring mt-5 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562]" data-testid="button-manage-institutions" type="button" onClick={() => setNotice('Institution access management opened.')}>Manage requests</button></div></Panel><Panel eyebrow="Publication" title="System health"><div className="p-5"><p className="flex items-center gap-2 text-sm font-bold text-[#287449]"><CheckCircle2 className="h-4 w-4" />All services operational</p><p className="mt-2 text-xs text-slate-500">Last automated check: 09:40 IST</p></div></Panel></div>{notice && <div className="mt-5 border border-[#b7d4c1] bg-[#f0f8f1] p-4 text-xs font-semibold text-[#287449]" data-testid="status-admin-action">{notice}</div>}</PageFrame>;
}

function DevelopersPage() {
  const [copied, setCopied] = useState(false);
  return <PageFrame kicker="Interoperability / institutional access" title="Developer API" description="Connect approved applications to discoverable land-governance metadata and published programme indicators."><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"><Panel eyebrow="API access" title="Published endpoints"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#eef2f5] text-[10px] uppercase tracking-wider text-slate-600"><tr><th className="border-b border-slate-300 px-4 py-3">Method</th><th className="border-b border-slate-300 px-4 py-3">Endpoint</th><th className="border-b border-slate-300 px-4 py-3">Access</th></tr></thead><tbody>{[['GET', '/v1/repository/documents', 'Public'], ['GET', '/v1/gis/layers', 'Approved partners'], ['GET', '/v1/indicators/state-coverage', 'Institutional']].map((row) => <tr key={row[1]}><td className="border-b border-slate-200 px-4 py-3 font-mono font-bold text-[#287449]">{row[0]}</td><td className="border-b border-slate-200 px-4 py-3 font-mono text-slate-700">{row[1]}</td><td className="border-b border-slate-200 px-4 py-3 text-slate-600">{row[2]}</td></tr>)}</tbody></table></div></Panel><Panel eyebrow="Quick start" title="API key request"><div className="p-5 text-xs leading-5 text-slate-600"><p>Request credentials for a registered institution. Keys are scoped to published datasets.</p><div className="mt-4 border border-slate-300 bg-[#f7f8f9] p-3 font-mono text-[11px] text-slate-700">curl https://land.gov.in/v1/repository/documents</div><button className="focus-ring mt-4 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562]" data-testid="button-copy-api-example" type="button" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{copied ? 'Copied' : 'Copy example'}</button></div></Panel></div></PageFrame>;
}

function HomePage() {
  const { activeRole } = useRole();
  return <PageFrame kicker="National Digital Platform · SIH PS 26019" title="Land Governance Workspace" description="A dependable public-sector workspace for finding policy, reading evidence, exploring geospatial layers and preparing accountable research outputs."><div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]"><div className="border border-slate-300 bg-[#e8eef2] p-6 md:p-8"><div className="max-w-2xl"><p className="section-kicker text-[#9b6300]">Welcome, {activeRole}</p><h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#132f4c] md:text-5xl">Land records, policy and evidence in one accountable place.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">Start with the verified repository, inspect state-level coverage or open a research workspace. Your demo persona controls the tools shown in the navigation.</p><div className="mt-6 flex flex-wrap gap-2"><Link className="focus-ring bg-[#244562] px-4 py-2.5 text-xs font-bold text-white" data-testid="link-home-repository" href="/repository">Browse repository</Link><Link className="focus-ring border border-[#244562] bg-white px-4 py-2.5 text-xs font-bold text-[#244562]" data-testid="link-home-map" href="/map">Explore GIS map</Link></div></div></div><Panel eyebrow="Platform pulse" title="Today at a glance"><div className="divide-y divide-slate-200">{activity.map((item) => <div className="flex gap-3 p-4" data-testid={`item-activity-${item.type.toLowerCase()}`} key={item.title}><div className="mt-1 h-2 w-2 shrink-0 bg-[#f2b134]" /><div><p className="text-xs font-bold text-[#244562]">{item.title}</p><p className="mt-1 text-[11px] text-slate-600">{item.detail}</p><p className="mt-2 font-mono text-[10px] text-slate-400">{item.date}</p></div></div>)}</div></Panel></div><div className="mt-5 grid gap-5 md:grid-cols-3"><Panel eyebrow="Repository" title="400+ indexed records"><div className="p-4 text-xs text-slate-600">Policy, legislation, standards and research from participating departments.</div></Panel><Panel eyebrow="State coverage" title="18 states in view"><div className="p-4 text-xs text-slate-600">Coverage indicators are grouped by state and published data layer.</div></Panel><Panel eyebrow="Traceability" title="Citations built in"><div className="p-4 text-xs text-slate-600">Keep sources attached to working notes and synthesis outputs.</div></Panel></div></PageFrame>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Shell() {
  return <div className="min-h-[100dvh] bg-[#f4f6f8]"><Header /><div className="mx-auto flex max-w-[1600px] flex-col md:flex-row"><Sidebar /><main className="min-w-0 flex-1"><RoutedErrorBoundary><Switch><Route path="/" component={HomeRedirect} /><Route path="/repository"><Guard allowed={allRoles} name="Repository"><CentralRepositoryPage /></Guard></Route><Route path="/map"><Guard allowed={allRoles} name="GIS Map"><MapPage /></Guard></Route><Route path="/innovation"><Guard allowed={allRoles} name="Innovation Portal"><InnovationPage /></Guard></Route><Route path="/assistant"><Guard allowed={researchRoles} name="AI Assistant"><AssistantPage /></Guard></Route><Route path="/workspaces"><Guard allowed={researchRoles} name="Workspaces"><WorkspacesPage /></Guard></Route><Route path="/analytics"><Guard allowed={governanceRoles} name="Analytics Hub"><AnalyticsPage /></Guard></Route><Route path="/simulate"><Guard allowed={governanceRoles} name="Policy Simulator"><SimulatePage /></Guard></Route><Route path="/admin"><Guard allowed={governanceRoles} name="Admin Console"><AdminPage /></Guard></Route><Route path="/developers"><Guard allowed={governanceRoles} name="Developer API"><DevelopersPage /></Guard></Route><Route component={NotFound} /></Switch></RoutedErrorBoundary></main></div></div>;
}

function HomeRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation('/repository'); }, [setLocation]);
  return null;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><RoleProvider><Shell /></RoleProvider><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;