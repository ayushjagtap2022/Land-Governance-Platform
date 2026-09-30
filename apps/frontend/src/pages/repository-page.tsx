import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Eye,
  FileArchive,
  FileText,
  Filter,
  History,
  Languages,
  LockKeyhole,
  Map,
  Search,
  Sparkles,
  UploadCloud,
  X,
  Quote,
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { CitationModal } from '@/components/common/CitationModal';
import {
  documents,
  type LandDocument,
  type RepositoryDocumentType,
  type RepositoryRecordType,
} from '@/data/mockData';

const states = [
  'All India',
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];
const administrativeLevels = ['All Levels', 'National', 'State', 'District', 'Tehsil/Taluk'];
const themes = ['All Themes', 'Cadastral Mapping', 'Land Dispute Resolution', 'SVAMITVA Scheme', 'Climate Resilience', 'Tenancy Rights'];
const documentTypes: RepositoryDocumentType[] = ['Policy Paper', 'Legal Act', 'Research Study', 'Geodata File', 'Case Study Report'];
const recordTypes: RepositoryRecordType[] = ['Policy Drafts', 'Research Studies', 'Acts / Gazettes', 'Datasets', 'Field Case Studies'];
const years = Array.from({ length: 17 }, (_, index) => String(2010 + index));

const recordTypeClass: Record<RepositoryRecordType, string> = {
  'Policy Drafts': 'border-[#e9c68a] bg-[#fff8e8] text-[#8a5a0a]',
  'Research Studies': 'border-[#b7d4c1] bg-[#f0f8f1] text-[#287449]',
  'Acts / Gazettes': 'border-[#b9cce0] bg-[#eef4fa] text-[#244562]',
  Datasets: 'border-slate-300 bg-slate-100 text-slate-700',
  'Field Case Studies': 'border-[#c084fc] bg-[#faf5ff] text-[#7e22ce]',
};

type UploadStage = 'idle' | 'uploading' | 'ocr' | 'metadata' | 'review' | 'committed';

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb">
      <span>National Land Governance Platform</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#244562]">{current}</span>
    </div>
  );
}

function PageFrame({
  title,
  kicker,
  description,
  children,
  actions,
}: {
  title: string;
  kicker: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="w-full px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb current={title} />
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">{kicker}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid="text-page-title-land-governance-repository">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
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

function SelectField({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  testId: string;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-700" htmlFor={testId}>
      {label}
      <select
        className="focus-ring mt-1 h-9 w-full border border-slate-300 bg-white px-2 text-sm font-normal"
        data-testid={testId}
        id={testId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SearchModeButton({ active, children, onClick, testId }: { active: boolean; children: React.ReactNode; onClick: () => void; testId: string }) {
  return (
    <button
      className={`focus-ring border px-2.5 py-1.5 text-[11px] font-bold ${active ? 'border-[#244562] bg-[#244562] text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
      data-testid={testId}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function UploadModal({ onClose, onCommitSuccess }: { onClose: () => void; onCommitSuccess?: () => void }) {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [metadata, setMetadata] = useState({
    title: 'SVAMITVA District Boundary Metadata',
    authority: 'Department of Land Resources',
    year: '2024',
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const [uploadedUrl, setUploadedUrl] = useState('');

  const startPipeline = async (file: File) => {
    setFileName(file.name);
    setStage('uploading');
    timersRef.current.forEach((timer) => window.clearTimeout(timer));

    const t1 = window.setTimeout(() => setStage('ocr'), 750);
    const t2 = window.setTimeout(() => setStage('metadata'), 1600);
    timersRef.current = [t1, t2];

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/repository/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.metadata) {
          setMetadata({
            title: data.metadata.title,
            authority: data.metadata.issuing_authority,
            year: data.metadata.publication_year,
          });
        }
        if (data.file_url) {
          setUploadedUrl(data.file_url);
        }
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        setStage('review');
        return;
      }
    } catch (err) {
      console.warn('Upload API call failed, using heuristic staging', err);
    }

    timersRef.current.push(window.setTimeout(() => setStage('review'), 2500));
  };

  const commitRecord = async () => {
    try {
      await fetch('/api/v1/repository/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.title,
          authority: metadata.authority,
          year: metadata.year,
          theme: 'Cadastral Mapping',
          administrative_level: 'National',
          file_name: fileName,
          file_url: uploadedUrl,
        }),
      });
      if (onCommitSuccess) {
        onCommitSuccess();
      }
    } catch (e) {
      console.warn('Commit API failed', e);
    }
    setStage('committed');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) startPipeline(file);
  };

  const progress = stage === 'uploading' ? 28 : stage === 'ocr' ? 56 : stage === 'metadata' ? 82 : stage === 'review' || stage === 'committed' ? 100 : 0;
  const stageLabel = stage === 'uploading'
    ? 'Uploading to staging server...'
    : stage === 'ocr'
      ? 'Running Tesseract OCR on scanned land record...'
      : 'Auto-extracting metadata via NLP (Title, Issuing Authority, Year)...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132f4c]/45 p-4" role="dialog" aria-modal="true" aria-label="Upload document or dataset">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-slate-400 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-300 bg-[#eef2f5] p-5">
          <div>
            <p className="section-kicker mb-2">National registry / staged ingestion</p>
            <h2 className="text-xl font-bold text-[#132f4c]">Upload Document / Dataset</h2>
            <p className="mt-1 text-xs text-slate-600">Files are staged, OCR-processed and reviewed before registry commit.</p>
          </div>
          <button className="focus-ring border border-slate-400 px-2 py-1 text-xs font-bold" data-testid="button-close-upload" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>

        {stage === 'idle' && (
          <div className="p-5">
            <div
              className={`border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-[#244562] bg-[#eef4fa]' : 'border-slate-300 bg-slate-50'}`}
              data-testid="dropzone-document-upload"
              onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <UploadCloud className="mx-auto h-8 w-8 text-[#244562]" />
              <p className="mt-3 text-sm font-bold text-[#244562]">Drag and drop a file here</p>
              <p className="mt-1 text-xs text-slate-500">PDF, CSV, GeoJSON or Shapefile package</p>
              <input
                ref={inputRef}
                className="hidden"
                data-testid="input-document-upload"
                type="file"
                accept=".pdf,.csv,.geojson,.zip,.shp,.dbf,.shx"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) startPipeline(file);
                }}
              />
              <button className="focus-ring mt-5 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562]" data-testid="button-select-upload-file" type="button" onClick={() => inputRef.current?.click()}>
                Select file
              </button>
            </div>
            <div className="mt-4 flex items-start gap-2 border-l-2 border-[#f2b134] bg-[#fff8e8] p-3 text-xs leading-5 text-slate-700">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#9b6300]" />
              <p>Shapefiles should be uploaded as a single ZIP package containing the .shp, .dbf and .shx components.</p>
            </div>
          </div>
        )}

        {(stage === 'uploading' || stage === 'ocr' || stage === 'metadata') && (
          <div className="p-6">
            <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-4">
              <FileText className="h-5 w-5 text-[#244562]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#244562]">{fileName}</p>
                <p className="text-xs text-slate-500">Processing in secure staging</p>
              </div>
            </div>
            <div className="mt-6 flex justify-between text-xs font-bold text-slate-600">
              <span>{stageLabel}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-3 border border-slate-300 bg-slate-100">
              <div className="h-full bg-[#287449] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-6 grid gap-3 text-xs">
              {[
                ['Uploading to staging server...', stage !== 'uploading' ? 'done' : 'active'],
                ['Running Tesseract OCR on scanned land record...', stage === 'ocr' ? 'active' : stage === 'metadata' ? 'done' : 'pending'],
                ['Auto-extracting metadata via NLP (Title, Issuing Authority, Year)...', stage === 'metadata' ? 'active' : 'pending'],
              ].map(([label, state]) => (
                <div className="flex items-center gap-2" key={label}>
                  <span className={`flex h-5 w-5 items-center justify-center border ${state === 'done' ? 'border-[#287449] bg-[#f0f8f1] text-[#287449]' : state === 'active' ? 'border-[#9b6300] bg-[#fff8e8] text-[#9b6300]' : 'border-slate-300 text-slate-400'}`}>
                    {state === 'done' ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                  </span>
                  <span className={state === 'pending' ? 'text-slate-400' : 'text-slate-700'}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(stage === 'review' || stage === 'committed') && (
          <div className="p-5">
            {stage === 'committed' && (
              <div className="mb-5 flex items-center gap-2 border border-[#b7d4c1] bg-[#f0f8f1] p-3 text-xs font-semibold text-[#287449]" data-testid="status-upload-committed">
                <CheckCircle2 className="h-4 w-4" /> Record committed to the National Registry.
              </div>
            )}
            <div className="mb-5 border-l-2 border-[#287449] bg-[#f0f8f1] p-4 text-xs leading-5 text-slate-700">
              <p className="font-bold text-[#287449]">Review extracted metadata</p>
              <p className="mt-1">Confirm the fields below before committing <span className="font-semibold">{fileName}</span> to the registry.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700 md:col-span-2">Title
                <input className="focus-ring mt-1 h-10 w-full border border-slate-300 px-3 text-sm font-normal" data-testid="input-extracted-title" value={metadata.title} onChange={(event) => setMetadata({ ...metadata, title: event.target.value })} />
              </label>
              <label className="text-xs font-semibold text-slate-700">Issuing Authority
                <input className="focus-ring mt-1 h-10 w-full border border-slate-300 px-3 text-sm font-normal" data-testid="input-extracted-authority" value={metadata.authority} onChange={(event) => setMetadata({ ...metadata, authority: event.target.value })} />
              </label>
              <label className="text-xs font-semibold text-slate-700">Publication Year
                <input className="focus-ring mt-1 h-10 w-full border border-slate-300 px-3 text-sm font-normal" data-testid="input-extracted-year" value={metadata.year} onChange={(event) => setMetadata({ ...metadata, year: event.target.value })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              {stage === 'review' && <button className="focus-ring border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700" data-testid="button-cancel-upload-review" type="button" onClick={onClose}>Cancel</button>}
              <button className="focus-ring flex items-center gap-2 bg-[#244562] px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-commit-registry" type="button" disabled={stage === 'committed'} onClick={commitRecord}>
                <CheckCircle2 className="h-4 w-4" />{stage === 'committed' ? 'Committed' : 'Commit to National Registry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VersionDrawer({ document, onClose }: { document: LandDocument; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#132f4c]/30" role="dialog" aria-modal="true" aria-label="Document version history">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-300 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-300 bg-[#eef2f5] p-5">
          <div>
            <p className="section-kicker mb-2">Version history / {document.refId}</p>
            <h2 className="text-lg font-bold text-[#132f4c]">{document.title}</h2>
            <p className="mt-1 text-xs text-slate-600">{document.version} · {document.visibility}</p>
          </div>
          <button className="focus-ring border border-slate-400 px-2 py-1 text-xs font-bold" data-testid="button-close-version-history" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">
          <div className="relative border-l border-slate-300 pl-6">
            {document.versions.map((version, index) => (
              <div className="relative pb-7 last:pb-1" key={`${version.label}-${version.date}`}>
                <span className={`absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center border-2 border-white ${index === 0 ? 'bg-[#287449]' : 'bg-[#9b6300]'}`}>
                  {index === 0 ? <Check className="h-3 w-3 text-white" /> : <Clock3 className="h-3 w-3 text-white" />}
                </span>
                <p className="text-xs font-bold text-[#244562]">{version.label}</p>
                <p className="mt-1 font-mono text-[10px] text-slate-500">{version.date}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{version.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewDrawer({ document, onClose, onCite }: { document: LandDocument; onClose: () => void; onCite?: (doc: LandDocument) => void }) {
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [relatedDocs, setRelatedDocs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/v1/repository/documents/${document.id}/related`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setRelatedDocs(data); })
      .catch(() => {});
  }, [document.id]);

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    try {
      const res = await fetch('/api/v1/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.title,
          content: document.summary,
          department: document.department,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data);
      }
    } catch (e) {
      console.warn('Summarization failed', e);
    }
    setSummarizing(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#132f4c]/30" role="dialog" aria-modal="true" aria-label="Inline document preview">
      <div className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-300 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-300 bg-[#eef2f5] p-5">
          <div>
            <p className="section-kicker mb-2">Inline preview / {document.refId}</p>
            <h2 className="text-lg font-bold text-[#132f4c]">{document.title}</h2>
          </div>
          <button className="focus-ring border border-slate-400 px-2 py-1 text-xs font-bold" data-testid="button-close-inline-preview" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#244562]" />
              <div>
                <p className="text-sm font-bold text-[#244562]">{document.format} source record</p>
                <p className="mt-1 text-xs text-slate-500">{document.pages} pages · {document.version} · {document.published}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onCite && (
                <button
                  className="focus-ring flex items-center gap-1.5 border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-[#244562] hover:bg-slate-100"
                  type="button"
                  onClick={() => onCite(document)}
                >
                  <Quote className="h-3.5 w-3.5" />
                  Cite
                </button>
              )}
              <button
                className="focus-ring flex items-center gap-1.5 bg-[#244562] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#132f4c]"
                type="button"
                disabled={summarizing}
                onClick={handleGenerateSummary}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {summarizing ? 'Summarizing...' : 'AI Summary'}
              </button>
            </div>
          </div>

          {aiSummary && (
            <div className="border border-[#b9cce0] bg-[#eef4fa] p-4 text-xs leading-relaxed text-slate-800">
              <p className="font-bold text-[#244562] mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#244562]" />
                Gemini Executive Summary:
              </p>
              <p className="mb-3 text-slate-700">{aiSummary.executive_summary}</p>
              <p className="font-bold text-[#244562] mb-1">Key Takeaways:</p>
              <ul className="list-disc pl-4 space-y-1 mb-3 text-slate-700">
                {aiSummary.key_takeaways?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              {aiSummary.statutory_implications && (
                <p className="text-[11px] text-slate-600 border-t border-slate-300 pt-2">
                  <strong>Statutory Impact:</strong> {aiSummary.statutory_implications}
                </p>
              )}
            </div>
          )}

          <div className="min-h-[220px] border border-slate-300 bg-[#f8fafc] p-6">
            <div className="mx-auto max-w-sm border border-slate-300 bg-white p-5 shadow-sm">
              <p className="text-center font-serif text-base font-bold text-[#132f4c]">Department of Land Resources</p>
              <div className="mx-auto mt-3 h-1 w-20 bg-[#f2b134]" />
              <p className="mt-5 text-sm font-bold text-[#244562]">{document.title}</p>
              <p className="mt-3 text-xs leading-5 text-slate-600">{document.summary}</p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                <span>Reference: {document.refId}</span><span className="text-right">Issued: {document.published}</span>
              </div>
            </div>
          </div>

          {relatedDocs.length > 0 && (
            <div className="border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-[#244562] mb-2">Related Policy & Research Records</p>
              <div className="divide-y divide-slate-200">
                {relatedDocs.map((rel: any) => (
                  <div key={rel.id} className="py-2 text-xs flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{rel.title}</p>
                      <p className="text-[10px] text-slate-500">{rel.department} · {rel.theme}</p>
                    </div>
                    {rel.similarity_score !== undefined && (
                      <span className="shrink-0 bg-[#eef4fa] text-[#244562] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        {rel.similarity_score}% match
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-l-2 border-[#f2b134] bg-[#fff8e8] p-3 text-xs leading-5 text-slate-700">This preview is a registry excerpt. Open the source record for the complete file.</div>
        </div>
      </div>
    </div>
  );
}

export default function RepositoryPage() {
  const { activeRole } = useRole();
  const isPublic = activeRole === 'Public';
  const [query, setQuery] = useState('');
  const [docList, setDocList] = useState<LandDocument[]>(documents);

  const fetchDocuments = async (q = query, mode = searchMode) => {
    try {
      const params = new URLSearchParams();
      if (q && q.trim()) params.set('query', q.trim());
      if (mode) params.set('search_mode', mode);
      const res = await fetch(`/api/v1/repository/documents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: LandDocument[] = data.map((d: any) => ({
            id: d.id,
            refId: d.ref_id,
            title: d.title,
            department: d.department,
            category: d.category,
            theme: d.theme,
            stateRegion: d.state_region,
            administrativeLevel: d.administrative_level,
            documentType: (d.document_type || 'Policy Paper') as RepositoryDocumentType,
            recordType: (d.record_type || 'Policy Drafts') as RepositoryRecordType,
            year: d.year,
            published: d.published,
            updated: d.updated,
            status: d.status,
            format: d.format,
            pages: d.pages,
            version: d.version,
            versions: d.versions || [],
            visibility: d.visibility,
            summary: d.summary,
            fileUrl: d.file_url,
          }));
          setDocList(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to load live documents from Neon DB', err);
    }
  };

  const [searchMode, setSearchMode] = useState<'exact' | 'semantic'>('exact');
  const [language, setLanguage] = useState<'English' | 'हिन्दी'>('English');
  const [state, setState] = useState('All India');
  const [level, setLevel] = useState('All Levels');
  const [theme, setTheme] = useState('All Themes');
  const [documentType, setDocumentType] = useState<RepositoryDocumentType | 'All types'>('All types');
  const [yearFrom, setYearFrom] = useState('2010');
  const [yearTo, setYearTo] = useState('2026');
  const [selectedVersion, setSelectedVersion] = useState<LandDocument | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<LandDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState('');
  const [citationDoc, setCitationDoc] = useState<LandDocument | null>(null);
  const [recommendations, setRecommendations] = useState<LandDocument[]>([]);

  useEffect(() => {
    fetch(`/api/v1/repository/recommendations?role=${encodeURIComponent(activeRole)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: LandDocument[] = data.map((d: any) => ({
            id: d.id,
            refId: d.ref_id,
            title: d.title,
            department: d.department,
            category: d.category,
            theme: d.theme,
            stateRegion: d.state_region,
            administrativeLevel: d.administrative_level,
            documentType: (d.document_type || 'Policy Paper') as RepositoryDocumentType,
            recordType: (d.record_type || 'Policy Drafts') as RepositoryRecordType,
            year: d.year,
            published: d.published,
            updated: d.updated,
            status: d.status,
            format: d.format,
            pages: d.pages,
            version: d.version,
            versions: d.versions || [],
            visibility: d.visibility,
            summary: d.summary,
            fileUrl: d.file_url,
          }));
          setRecommendations(mapped);
        }
      })
      .catch(() => {});
  }, [activeRole]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const stateParam = params.get('state');
    if (search) setQuery(search);
    if (stateParam && states.includes(stateParam)) {
      setState(stateParam);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchDocuments(query, searchMode);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, searchMode]);

  const filtered = useMemo(() => docList.filter((document) => {
    const normalizedQuery = query.trim().toLowerCase();
    const searchText = `${document.refId} ${document.title} ${document.department} ${document.stateRegion} ${document.theme} ${document.summary}`.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

    const matchesSearch = !normalizedQuery || (searchMode === 'exact'
      ? searchText.includes(normalizedQuery) || queryWords.some((word) => searchText.includes(word)) || document.stateRegion.toLowerCase().includes(normalizedQuery)
      : queryWords.every((word) => searchText.includes(word)) || document.theme.toLowerCase().includes(normalizedQuery));

    const matchesState = state === 'All India' || document.stateRegion === state || document.stateRegion === 'All India';
    const matchesLevel = level === 'All Levels' || document.administrativeLevel === level;
    const matchesTheme = theme === 'All Themes' || document.theme === theme;
    const matchesDocType = documentType === 'All types' || document.documentType === documentType;
    const matchesYear = document.year >= Number(yearFrom) && document.year <= Number(yearTo);

    return matchesSearch && matchesState && matchesLevel && matchesTheme && matchesDocType && matchesYear;
  }), [docList, documentType, level, query, searchMode, state, theme, yearFrom, yearTo]);

  const fallbackNational = useMemo(() => {
    return docList.filter((d) => d.stateRegion === 'All India' || d.administrativeLevel === 'National');
  }, [docList]);

  const isFallback = filtered.length === 0 && query.trim().length > 0 && fallbackNational.length > 0;
  const displayRecords = isFallback ? fallbackNational : filtered;

  const clearFilters = () => {
    setQuery('');
    setSearchMode('exact');
    setLanguage('English');
    setState('All India');
    setLevel('All Levels');
    setTheme('All Themes');
    setDocumentType('All types');
    setYearFrom('2010');
    setYearTo('2026');
  };

  const downloadDocument = (document: LandDocument) => {
    if (isPublic && document.visibility === 'Confidential / Intra-Ministry') return;
    setDownloadNotice(`${document.refId} queued for download.`);
    window.setTimeout(() => setDownloadNotice(''), 2800);
  };

  return (
    <PageFrame
      kicker="Central knowledge repository / verified registry"
      title="Land Governance Repository"
      description="Search, review and stage policy records, legal instruments, research studies and geospatial datasets for India's land-governance programmes."
      actions={
        <>
          {!isPublic && <button className="focus-ring flex items-center gap-2 bg-[#244562] px-3 py-2 text-xs font-bold text-white hover:bg-[#132f4c]" data-testid="button-upload-document" type="button" onClick={() => setUploadOpen(true)}><UploadCloud className="h-3.5 w-3.5" />Upload Document / Dataset</button>}
          <button className="focus-ring flex items-center gap-2 border border-[#244562] px-3 py-2 text-xs font-bold text-[#244562] hover:bg-slate-50" data-testid="button-download-repository-index" type="button" onClick={() => { setDownloadNotice('Filtered registry index queued for download.'); window.setTimeout(() => setDownloadNotice(''), 2800); }}><Download className="h-3.5 w-3.5" />Download index</button>
        </>
      }
    >
      {downloadNotice && <div className="mb-5 flex items-center gap-2 border border-[#b7d4c1] bg-[#f0f8f1] p-3 text-xs font-semibold text-[#287449]" data-testid="status-repository-download"><CheckCircle2 className="h-4 w-4" />{downloadNotice}</div>}
      <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <Panel eyebrow="Registry controls" title="Filter records">
            <div className="space-y-4 p-4">
              <SelectField label="State / UT" value={state} options={states} onChange={setState} testId="select-filter-state" />
              <SelectField label="Administrative Level" value={level} options={administrativeLevels} onChange={setLevel} testId="select-filter-level" />
              <SelectField label="Sector / Theme" value={theme} options={themes} onChange={setTheme} testId="select-filter-theme" />
              <SelectField label="Document Type" value={documentType} options={['All types', ...documentTypes]} onChange={(value) => setDocumentType(value as RepositoryDocumentType | 'All types')} testId="select-filter-document-type" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Publication Year Range</p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <SelectField label="From" value={yearFrom} options={years} onChange={setYearFrom} testId="select-filter-year-from" />
                  <SelectField label="To" value={yearTo} options={years} onChange={setYearTo} testId="select-filter-year-to" />
                </div>
              </div>
              <button className="focus-ring flex w-full items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-xs font-bold text-[#244562] hover:bg-slate-50" data-testid="button-clear-repository-filters" type="button" onClick={clearFilters}><Filter className="h-3.5 w-3.5" />Clear all filters</button>
            </div>
          </Panel>
          <Panel className="mt-5" eyebrow="Registry note" title="Source standards">
            <div className="p-4 text-xs leading-5 text-slate-600">
              <p className="flex items-center gap-2 font-semibold text-[#287449]"><CheckCircle2 className="h-4 w-4" />Officially indexed sources</p>
              <p className="mt-3">Metadata is reviewed before publication. Confidential records remain visible to authorised personas only.</p>
            </div>
          </Panel>
        </aside>

        <div className="min-w-0">
          {recommendations.length > 0 && (
            <div className="mb-5 border border-[#b9cce0] bg-[#f0f4f8] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#d97706]" />
                  <span className="text-xs font-bold text-[#132f4c]">Recommended for You ({activeRole} Profile)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">AI discovery based on administrative role</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.slice(0, 4).map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedPreview(rec)}
                    className="focus-ring flex flex-col justify-between border border-slate-200 bg-white p-3 text-left hover:border-[#244562] hover:shadow-xs transition-all"
                    type="button"
                  >
                    <div>
                      <span className="font-mono text-[9px] font-bold text-[#244562] bg-[#eef4fa] px-1.5 py-0.5 border border-[#b9cce0] truncate block max-w-fit">{rec.refId}</span>
                      <p className="mt-2 font-bold text-xs text-[#132f4c] line-clamp-2 leading-snug">{rec.title}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                      <span className="truncate max-w-[100px]">{rec.theme}</span>
                      <span className="font-bold text-[#244562]">Preview &rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Panel className="mb-5">
            <div className="border-b border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <label className="sr-only" htmlFor="repository-search">Search repository</label>
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input className="focus-ring h-10 w-full border border-slate-300 pl-9 pr-3 text-sm" data-testid="input-repository-search" id="repository-search" placeholder={language === 'English' ? 'Search by reference, title, authority, state or theme' : 'संदर्भ, शीर्षक, प्राधिकरण या विषय खोजें'} value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <SearchModeButton active={searchMode === 'exact'} onClick={() => setSearchMode('exact')} testId="button-search-exact">Exact Match</SearchModeButton>
                  <SearchModeButton active={searchMode === 'semantic'} onClick={() => setSearchMode('semantic')} testId="button-search-semantic">AI Semantic Search</SearchModeButton>
                </div>
                <div className="flex shrink-0 items-center gap-1 border-l border-slate-200 pl-3">
                  <Languages className="h-4 w-4 text-slate-500" />
                  <SearchModeButton active={language === 'English'} onClick={() => setLanguage('English')} testId="button-search-language-english">English</SearchModeButton>
                  <SearchModeButton active={language === 'हिन्दी'} onClick={() => setLanguage('हिन्दी')} testId="button-search-language-hindi">हिन्दी</SearchModeButton>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">
              <span data-testid="text-repository-result-count">
                {isFallback 
                  ? `Showing ${displayRecords.length} applicable National Frameworks for "${query}"`
                  : `${filtered.length} of ${docList.length} registry records shown`
                }
              </span>
              <span className="flex items-center gap-1 text-[11px]"><Map className="h-3.5 w-3.5" />Metadata index refreshed 18 Jun 2024</span>
            </div>
          </Panel>

          {isFallback && (
            <div className="mb-5 flex items-start justify-between gap-3 border border-[#e9c68a] bg-[#fff8e8] p-4 text-xs shadow-xs">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#9b6300]" />
                <div>
                  <p className="font-bold text-[#8a5a0a]">
                    Showing Pan-India and National Regulatory Frameworks applicable across &quot;{query}&quot;
                  </p>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    No district-specific gazette is directly titled &quot;{query}&quot;. Displaying the overarching Union statutory acts (SVAMITVA, DILRMP 2024, RFCTLARR Act 2013, and Survey of India Drone Mapping SOPs) that govern land administration in this area.
                  </p>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="focus-ring shrink-0 border border-[#e9c68a] bg-white px-3 py-1.5 text-xs font-bold text-[#8a5a0a] hover:bg-[#fff4dd]"
                type="button"
              >
                Clear search
              </button>
            </div>
          )}

          <Panel>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left text-xs">
                <thead className="bg-[#eef2f5] text-[10px] uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold">Gazette / Document Ref ID</th>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold">Title &amp; Issuing Authority</th>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold">State / Region</th>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold">Category Tag</th>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold">Date Published</th>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold">Version</th>
                    <th className="border-b border-slate-300 px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecords.map((document) => {
                    const restricted = isPublic && document.visibility === 'Confidential / Intra-Ministry';
                    return (
                      <tr className="hover:bg-[#f8fafb]" data-testid={`row-registry-document-${document.id}`} key={document.id}>
                        <td className="border-b border-slate-200 px-4 py-3 align-top">
                          <p className="font-mono text-[11px] font-bold text-[#244562]">{document.refId}</p>
                          <p className="mt-1 text-[10px] text-slate-500">{document.documentType}</p>
                        </td>
                        <td className="max-w-[260px] border-b border-slate-200 px-4 py-3 align-top">
                          <p className="font-bold text-[#244562]">{document.title}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{document.department}</p>
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3 align-top text-slate-600">{document.stateRegion}<p className="mt-1 text-[10px] text-slate-400">{document.administrativeLevel}</p></td>
                        <td className="border-b border-slate-200 px-4 py-3 align-top">
                          <span className={`inline-flex border px-2 py-1 text-[10px] font-bold ${recordTypeClass[document.recordType]}`}>{document.recordType}</span>
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3 align-top text-slate-600">{document.published}</td>
                        <td className="border-b border-slate-200 px-4 py-3 align-top"><span className="border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-slate-700">{document.version}</span></td>
                        <td className="border-b border-slate-200 px-4 py-3 align-top">
                          <div className="flex justify-end gap-1.5">
                            <button className="focus-ring flex items-center gap-1 border border-slate-300 px-2 py-1.5 text-[10px] font-bold text-[#244562] hover:bg-slate-100" data-testid={`button-inline-preview-${document.id}`} type="button" onClick={() => setSelectedPreview(document)}><Eye className="h-3 w-3" />Preview</button>
                            <button className="focus-ring flex items-center gap-1 border border-slate-300 px-2 py-1.5 text-[10px] font-bold text-[#244562] hover:bg-slate-100" type="button" onClick={() => setCitationDoc(document)}><Quote className="h-3 w-3" />Cite</button>
                            <button className="focus-ring flex items-center gap-1 border border-slate-300 px-2 py-1.5 text-[10px] font-bold text-[#244562] hover:bg-slate-100" data-testid={`button-version-history-${document.id}`} type="button" onClick={() => setSelectedVersion(document)}><History className="h-3 w-3" />History</button>
                            <button className="focus-ring flex items-center gap-1 border border-[#244562] px-2 py-1.5 text-[10px] font-bold text-[#244562] hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400" data-testid={`button-download-${document.id}`} type="button" disabled={restricted} onClick={() => downloadDocument(document)}>
                              {restricted ? <LockKeyhole className="h-3 w-3" /> : <Download className="h-3 w-3" />}{restricted ? 'Restricted' : 'Download'}
                            </button>
                          </div>
                          {restricted && <p className="mt-1 flex justify-end items-center gap-1 text-[10px] text-slate-500"><LockKeyhole className="h-3 w-3" />Confidential / Intra-Ministry</p>}
                        </td>
                      </tr>
                    );
                  })}
                  {!displayRecords.length && (
                    <tr>
                      <td className="px-4 py-12 text-center text-slate-500" colSpan={7}>
                        No registry records match these filters.
                        <button onClick={clearFilters} className="ml-2 font-bold text-[#244562] underline hover:text-[#132f4c]" type="button">
                          Reset all filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-500">
              <span>Showing {displayRecords.length} of {docList.length} records</span>
              <span className="flex items-center gap-1"><FileArchive className="h-3.5 w-3.5" />Supported source formats: PDF · CSV · GeoJSON · SHP</span>
            </div>
          </Panel>
        </div>
      </div>
      {selectedVersion && <VersionDrawer document={selectedVersion} onClose={() => setSelectedVersion(null)} />}
      {selectedPreview && <PreviewDrawer document={selectedPreview} onClose={() => setSelectedPreview(null)} onCite={(doc) => setCitationDoc(doc)} />}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onCommitSuccess={fetchDocuments} />}
      {citationDoc && <CitationModal document={citationDoc} onClose={() => setCitationDoc(null)} />}
    </PageFrame>
  );
}