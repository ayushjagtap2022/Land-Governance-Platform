import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  RefreshCw,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Link } from 'wouter';
import { documents, type LandDocument } from '@/data/mockData';

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb">
      <span>National Land Governance Platform</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#244562]">{current}</span>
    </div>
  );
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

function SynthesisTable({ selected }: { selected: LandDocument[] }) {
  const names = selected.map((document) => document.title).join(' and ');
  const isCadastral = selected.some((document) => document.theme === 'Cadastral Mapping');
  return (
    <Panel eyebrow="Comparative synthesis / grounded output" title={`Policy synthesis across ${selected.length} selected documents`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <tbody>
            <tr>
              <th className="w-48 border-b border-r border-slate-200 bg-[#eef2f5] px-4 py-4 align-top font-bold text-[#244562]">Core Objective</th>
              <td className="border-b border-slate-200 px-4 py-4 leading-5 text-slate-700">Together, {names} support a traceable land-record workflow by linking policy intent, state implementation and verified source metadata.</td>
            </tr>
            <tr>
              <th className="border-b border-r border-slate-200 bg-[#eef2f5] px-4 py-4 align-top font-bold text-[#244562]">Consensus Points</th>
              <td className="border-b border-slate-200 px-4 py-4 leading-5 text-slate-700"><ul className="list-disc space-y-1 pl-4"><li>Source records should retain an issuing authority, publication date and review status.</li><li>Village or district verification is a required control before records are treated as final.</li>{isCadastral && <li>Geospatial reference quality is material to reliable cadastral interoperability.</li>}</ul></td>
            </tr>
            <tr>
              <th className="border-b border-r border-slate-200 bg-[#eef2f5] px-4 py-4 align-top font-bold text-[#244562]">Conflicting Guidelines or Policy Gaps</th>
              <td className="border-b border-slate-200 px-4 py-4 leading-5 text-slate-700">The selected records use different administrative levels and evidentiary standards. The current index does not establish a single cross-state rule for timelines, land classification or dispute escalation.</td>
            </tr>
            <tr>
              <th className="border-r border-slate-200 bg-[#eef2f5] px-4 py-4 align-top font-bold text-[#244562]">Recommended Next Steps for DoLR</th>
              <td className="px-4 py-4 leading-5 text-slate-700"><ol className="list-decimal space-y-1 pl-4"><li>Commission a state-by-state comparison note using the current gazette record as the legal baseline.</li><li>Standardise metadata for version, geography and source page references.</li><li>Route unresolved state-specific gaps to the relevant department before publishing a consolidated guidance note.</li></ol></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function SynthesisPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([documents[0].id, documents[1].id]);
  const [synthesized, setSynthesized] = useState(false);
  const selected = useMemo(() => documents.filter((document) => selectedIds.includes(document.id)), [selectedIds]);

  const toggleDocument = (id: string) => {
    setSynthesized(false);
    setSelectedIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < 3 ? [...current, id] : current);
  };

  return (
    <section className="mx-auto max-w-[1480px] px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb current="Research Synthesis" />
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">Research support / cross-document comparison</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid="text-page-title-research-synthesis">Research Synthesis</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Select two or three indexed records to compare their objectives, consensus points, policy gaps and recommended next steps for DoLR.</p>
        </div>
        <Link className="focus-ring flex items-center gap-2 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562] hover:bg-slate-50" data-testid="link-back-to-assistant" href="/assistant"><FileCheck2 className="h-3.5 w-3.5" />Back to AI Assistant</Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Panel eyebrow="Evidence selection" title="Choose source records">
          <div className="border-b border-slate-200 bg-[#fff8e8] px-4 py-3 text-xs leading-5 text-slate-700">Select 2 or 3 documents. The synthesis is grounded only in the records selected below.</div>
          <div className="divide-y divide-slate-200">
            {documents.map((document) => {
              const checked = selectedIds.includes(document.id);
              const disabled = !checked && selectedIds.length >= 3;
              return (
                <label className={`flex cursor-pointer gap-3 p-4 ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50'}`} key={document.id}>
                  <input className="mt-0.5 h-4 w-4 accent-[#244562]" data-testid={`checkbox-synthesis-${document.id}`} type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleDocument(document.id)} />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-[#244562]">{document.title}</span>
                    <span className="mt-1 block font-mono text-[10px] text-slate-500">{document.refId} · {document.version}</span>
                    <span className="mt-1 block text-[10px] text-slate-500">{document.stateRegion} · {document.documentType}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-4">
            <p className="text-xs text-slate-500"><span className="font-bold text-[#244562]">{selectedIds.length}</span> of 3 documents selected</p>
            <button className="focus-ring mt-3 flex w-full items-center justify-center gap-2 bg-[#244562] px-3 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-synthesize-selected-documents" type="button" disabled={selectedIds.length < 2} onClick={() => setSynthesized(true)}><Sparkles className="h-4 w-4" />Synthesize Selected Documents</button>
            {selectedIds.length < 2 && <p className="mt-2 text-[10px] text-[#9b6300]">Select at least two records to continue.</p>}
          </div>
        </Panel>

        <div className="min-w-0 space-y-5">
          {!synthesized && (
            <Panel className="border-l-2 border-l-[#f2b134]">
              <div className="flex items-start gap-3 p-5">
                <div className="border border-[#b9cce0] bg-[#eef4fa] p-2"><Scale className="h-5 w-5 text-[#244562]" /></div>
                <div>
                  <h2 className="text-sm font-bold text-[#244562]">Comparative analysis workspace</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">The output will identify shared policy intent, differences in implementation and gaps that require an official source check.</p>
                  <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#287449]"><CheckCircle2 className="h-4 w-4" />Current selection is ready for synthesis.</p>
                </div>
              </div>
            </Panel>
          )}
          {synthesized && selected.length >= 2 && (
            <>
              <div className="flex items-center justify-between border border-[#b7d4c1] bg-[#f0f8f1] p-3 text-xs font-semibold text-[#287449]" data-testid="status-synthesis-generated"><span className="flex items-center gap-2"><Check className="h-4 w-4" />Synthesis generated from {selected.length} indexed source records.</span><button className="focus-ring flex items-center gap-1 text-[#244562] underline underline-offset-2" type="button" onClick={() => setSynthesized(false)}><RefreshCw className="h-3.5 w-3.5" />Revise selection</button></div>
              <SynthesisTable selected={selected} />
              <Panel eyebrow="Traceability" title="Selected source register">
                <div className="divide-y divide-slate-200">{selected.map((document) => <Link className="focus-ring flex items-center justify-between gap-3 p-4 hover:bg-slate-50" data-testid={`link-synthesis-source-${document.id}`} href={`/repository#${document.id}`} key={document.id}><span className="flex items-center gap-3"><FileText className="h-4 w-4 text-[#244562]" /><span><span className="block text-xs font-bold text-[#244562]">{document.title}</span><span className="mt-1 block font-mono text-[10px] text-slate-500">{document.refId} · {document.published}</span></span></span><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </section>
  );
}