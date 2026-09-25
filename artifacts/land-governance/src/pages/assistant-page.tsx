import { useMemo, useState } from 'react';
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  ExternalLink,
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'wouter';
import { documents, type LandDocument } from '@/data/mockData';

const quickQueries = [
  'Ceiling limits across MP vs Maharashtra',
  'SVAMITVA property card distribution guidelines',
  'Procedures for agricultural land conversion to industrial use',
];

const trendRadar = [
  { keyword: 'Drone Cadastral Survey', change: '+24%', direction: 'up' as const, search: 'Cadastral' },
  { keyword: 'Digital Title Registry', change: '+18%', direction: 'up' as const, search: 'National Land Records' },
  { keyword: 'Forest Rights Act', change: '+11%', direction: 'up' as const, search: 'Rights' },
  { keyword: 'Land Resurvey Disputes', change: '-8%', direction: 'down' as const, search: 'Dispute' },
];

type AssistantResponse = {
  query: string;
  bullets: string[];
  sourceIds: string[];
};

const responseLibrary: AssistantResponse[] = [
  {
    query: 'Ceiling limits across MP vs Maharashtra',
    bullets: [
      'The indexed records distinguish ceiling administration by state statute rather than by a single national threshold.',
      'Maharashtra’s current record is an amendment instrument; confirm the notified schedule and land-classification provisions before applying a limit.',
      'The repository does not contain a verified Madhya Pradesh ceiling notification in this first index, so the comparison should be treated as incomplete.',
    ],
    sourceIds: ['DOC-26019-002', 'DOC-26019-003'],
  },
  {
    query: 'SVAMITVA property card distribution guidelines',
    bullets: [
      'The SVAMITVA guidance places drone survey, village-level verification, and property card generation in a linked operational sequence.',
      'Disputed entries should follow the local verification and escalation process before a card is treated as a final record.',
      'The current published guidance is version v1.3, dated 18 Jun 2024.',
    ],
    sourceIds: ['DOC-26019-001', 'DOC-26019-004'],
  },
  {
    query: 'Procedures for agricultural land conversion to industrial use',
    bullets: [
      'The indexed catalogue does not yet contain a verified state conversion order that supports a complete legal answer.',
      'Use the model mutation workflow only as process context; it does not replace the competent state authority’s conversion notification.',
      'A formal brief should identify the applicable state, district, land class, and conversion authority before recommending next steps.',
    ],
    sourceIds: ['DOC-26019-005', 'DOC-26019-002'],
  },
];

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb">
      <span>National Land Governance Platform</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#244562]">{current}</span>
    </div>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-[1480px] px-4 py-5 md:px-8 md:py-7"><Breadcrumb current="AI Assistant" />{children}</section>;
}

function Panel({ title, eyebrow, children, className = '' }: { title?: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-slate-300 bg-white ${className}`}>
      {(title || eyebrow) && (
        <div className="border-b border-slate-200 px-4 py-3 md:px-5">
          {eyebrow && <p className="section-kicker mb-1">{eyebrow}</p>}
          {title && <h2 className="text-sm font-bold text-[#244562]">{title}</h2>}
        </div>
      )}
      {children}
    </div>
  );
}

function SourceReference({ document }: { document: LandDocument }) {
  const page = document.id === 'DOC-26019-001' ? '14' : document.id === 'DOC-26019-002' ? '22' : document.id === 'DOC-26019-005' ? '10' : '7';
  const excerpt = document.id === 'DOC-26019-001'
    ? '“Property cards shall be prepared after completion of the drone survey and village-level verification process.”'
    : document.id === 'DOC-26019-002'
      ? '“The amendment shall be read with the applicable land classification and schedule notified by the State Government.”'
      : document.id === 'DOC-26019-005'
        ? '“The model process separates registration triggers, notice, objections and final order as auditable workflow stages.”'
        : '“Reference-coordinate quality checks are required before legacy village maps are joined to the state layer.”';

  return (
    <div className="border border-slate-200 bg-slate-50 p-4" data-testid={`source-reference-${document.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#244562]">{document.title}</p>
          <p className="mt-1 font-mono text-[10px] text-slate-500">{document.refId} · Page {page} · {document.version}</p>
        </div>
        <FileText className="h-4 w-4 shrink-0 text-[#244562]" />
      </div>
      <p className="mt-3 border-l-2 border-[#f2b134] bg-white p-3 text-xs leading-5 text-slate-700">{excerpt}</p>
      <Link className="focus-ring mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#244562] underline underline-offset-2" data-testid={`link-view-source-${document.id}`} href={`/repository#${document.id}`}>
        View Source Document <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState('');

  const sourceDocuments = useMemo(() => response?.sourceIds.map((id) => documents.find((document) => document.id === id)).filter((document): document is LandDocument => Boolean(document)) ?? [], [response]);

  const ask = (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || isSearching) return;
    setQuestion(trimmed);
    setIsSearching(true);
    window.setTimeout(() => {
      const matching = responseLibrary.find((item) => item.query.toLowerCase() === trimmed.toLowerCase());
      setResponse(matching ?? {
        query: trimmed,
        bullets: [
          'The indexed registry can support a grounded answer only where a verified DoLR source is available for the question.',
          'No single source in the current catalogue provides a complete determination for this query; review the linked records before preparing an official note.',
          'For a reliable comparison, specify the state, administrative level, land class, and relevant publication period.',
        ],
        sourceIds: ['DOC-26019-001', 'DOC-26019-005'],
      });
      setIsSearching(false);
    }, 650);
  };

  const copyBrief = () => {
    if (!response) return;
    const brief = `${response.query}\n\nExecutive summary\n${response.bullets.map((bullet) => `- ${bullet}`).join('\n')}\n\nCited source references\n${sourceDocuments.map((document) => `${document.title} — ${document.refId} — ${document.version}`).join('\n')}`;
    void navigator.clipboard?.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <PageFrame>
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">Research support / statutory decision aid</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid="text-page-title-ai-assistant">AI Assistant</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Ask policy questions and receive structured, traceable answers grounded in the indexed land-governance repository.</p>
        </div>
        <Link className="focus-ring flex items-center gap-2 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562] hover:bg-slate-50" data-testid="link-open-synthesis" href="/synthesis"><FileCheck2 className="h-3.5 w-3.5" />Open synthesis tool</Link>
      </div>

      <div className="mb-5 flex items-start gap-3 border border-[#b9cce0] bg-[#eef4fa] p-4 text-xs leading-5 text-[#244562]" data-testid="banner-ai-statutory">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p><span className="font-bold">AI Decision Support Engine</span> — Grounded exclusively on indexed DoLR Gazette notifications, SVAMITVA guidelines, and verified land-governance studies.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <Panel eyebrow="Grounded query / repository search" title="Ask the Platform">
            <div className="p-5">
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="assistant-policy-question">Ask a policy question</label>
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input className="focus-ring h-11 w-full border border-slate-300 pl-9 pr-3 text-sm" data-testid="input-assistant-policy-question" id="assistant-policy-question" placeholder="What are the ceiling limits under the Land Reforms Act in Maharashtra?" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') ask(); }} />
                </div>
                <button className="focus-ring flex items-center gap-2 bg-[#244562] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-ask-platform" type="button" disabled={isSearching || !question.trim()} onClick={() => ask()}><Bot className="h-4 w-4" />{isSearching ? 'Searching' : 'Ask'}</button>
              </div>
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick query chips</p>
                <div className="flex flex-wrap gap-2">
                  {quickQueries.map((query) => <button className="focus-ring border border-slate-300 bg-white px-3 py-2 text-left text-xs text-[#244562] hover:bg-slate-50" data-testid={`button-quick-query-${query.slice(0, 8).replaceAll(' ', '-').toLowerCase()}`} key={query} type="button" onClick={() => ask(query)}>{query}</button>)}
                </div>
              </div>
            </div>
          </Panel>

          {!response && !isSearching && (
            <Panel className="border-l-2 border-l-[#f2b134]">
              <div className="flex items-start gap-3 p-5">
                <div className="border border-[#e9c68a] bg-[#fff8e8] p-2"><FileCheck2 className="h-5 w-5 text-[#9b6300]" /></div>
                <div>
                  <h2 className="text-sm font-bold text-[#244562]">Answer with accountable evidence</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">Every response includes a concise executive summary and source references with document identifiers, page numbers and verbatim excerpts.</p>
                </div>
              </div>
            </Panel>
          )}

          {isSearching && (
            <Panel>
              <div className="flex items-center gap-3 p-5 text-sm text-[#244562]"><span className="h-2 w-2 animate-pulse bg-[#f2b134]" />Searching indexed sources and checking citation coverage...</div>
            </Panel>
          )}

          {response && !isSearching && (
            <Panel eyebrow="Grounded response" title={response.query}>
              <div className="p-5">
                <div className="border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#287449]"><CheckCircle2 className="h-4 w-4" />Executive Summary</p>
                    <button className="focus-ring flex items-center gap-1 border border-[#244562] px-2.5 py-1.5 text-[11px] font-bold text-[#244562]" data-testid="button-copy-formal-brief" type="button" onClick={copyBrief}>{copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy Brief with Formal Citations'}</button>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">{response.bullets.map((bullet) => <li className="flex gap-2" key={bullet}><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#f2b134]" />{bullet}</li>)}</ul>
                </div>
                <div className="mt-5 border border-slate-300">
                  <div className="border-b border-slate-200 bg-[#eef2f5] px-4 py-3"><p className="flex items-center gap-2 text-xs font-bold text-[#244562]"><FileText className="h-4 w-4" />Cited Source References</p><p className="mt-1 text-[11px] text-slate-500">Verbatim excerpts from indexed records used for this answer.</p></div>
                  <div className="space-y-3 p-4">{sourceDocuments.map((document) => <SourceReference document={document} key={document.id} />)}</div>
                </div>
              </div>
            </Panel>
          )}
        </div>

        <aside className="min-w-0 space-y-5">
          <Panel eyebrow="High-frequency policy radar" title="90-day trend signals">
            <div className="divide-y divide-slate-200">
              {trendRadar.map((trend) => {
                const active = selectedTrend === trend.keyword;
                return (
                  <Link className={`focus-ring block px-4 py-4 hover:bg-slate-50 ${active ? 'border-l-2 border-[#f2b134] bg-[#fff8e8]' : ''}`} data-testid={`link-trend-${trend.keyword.toLowerCase().replaceAll(' ', '-')}`} href={`/repository?search=${encodeURIComponent(trend.search)}`} key={trend.keyword} onClick={() => setSelectedTrend(trend.keyword)}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-[#244562]">{trend.keyword}</p>
                      {trend.direction === 'up' ? <TrendingUp className="h-4 w-4 text-[#287449]" /> : <TrendingDown className="h-4 w-4 text-[#9b6300]" />}
                    </div>
                    <p className={`mt-2 font-mono text-xs font-bold ${trend.direction === 'up' ? 'text-[#287449]' : 'text-[#9b6300]'}`}>{trend.change} mentions</p>
                    <p className="mt-1 text-[10px] text-slate-500">Click to filter repository records</p>
                  </Link>
                );
              })}
            </div>
          </Panel>
          <Panel eyebrow="Use responsibly" title="Assistant boundaries">
            <div className="space-y-3 p-4 text-xs leading-5 text-slate-600">
              <p>Answers are grounded in the indexed repository and should be verified against the source record before circulation.</p>
              <p>The assistant does not issue determinations on individual title, ownership, ceiling entitlement or legal conversion.</p>
              <div className="flex items-center gap-2 border-t border-slate-200 pt-3 font-semibold text-[#244562]"><ShieldCheck className="h-4 w-4" />Source coverage is shown below every answer.</div>
            </div>
          </Panel>
        </aside>
      </div>
    </PageFrame>
  );
}