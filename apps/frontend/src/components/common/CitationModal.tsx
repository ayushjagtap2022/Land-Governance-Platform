import { useState } from 'react';
import { Copy, Check, Download, X, BookOpen, Quote } from 'lucide-react';
import { toast } from 'sonner';

export type CitationDoc = {
  id: string;
  refId: string;
  title: string;
  department: string;
  year?: number | string;
  version?: string;
};

type CitationFormat = 'APA' | 'BibTeX' | 'IEEE' | 'RIS';

export function CitationModal({
  document,
  onClose,
}: {
  document: CitationDoc;
  onClose: () => void;
}) {
  const [activeFormat, setActiveFormat] = useState<CitationFormat>('BibTeX');
  const [copied, setCopied] = useState(false);

  const cleanYear = document.year || '2024';
  const cleanVersion = document.version || 'v1.0';
  const cleanRef = document.refId || document.id;

  const generateCitation = (format: CitationFormat): string => {
    switch (format) {
      case 'APA':
        return `${document.department}. (${cleanYear}). ${document.title} (Report No. ${cleanRef}, ${cleanVersion}). Department of Land Resources, Ministry of Rural Development, Government of India. https://landgovernance.gov.in/repo/${document.id}`;

      case 'BibTeX':
        return `@techreport{landgov_${document.id.replace(/[^a-zA-Z0-9]/g, '_')},
  author      = {{${document.department}}},
  title       = {{${document.title}}},
  institution = {Department of Land Resources (DoLR), Ministry of Rural Development, Government of India},
  year        = {${cleanYear}},
  number      = {${cleanRef}},
  note        = {Version ${cleanVersion}},
  url         = {https://landgovernance.gov.in/repo/${document.id}}
}`;

      case 'IEEE':
        return `[1] ${document.department}, "${document.title}," Dept. of Land Resources, Govt. of India, New Delhi, Tech. Rep. ${cleanRef}, ${cleanYear}.`;

      case 'RIS':
        return `TY  - RPRT
TI  - ${document.title}
AU  - ${document.department}
PY  - ${cleanYear}
RN  - ${cleanRef}
PB  - Department of Land Resources (DoLR), Ministry of Rural Development
CY  - New Delhi, India
UR  - https://landgovernance.gov.in/repo/${document.id}
M1  - ${cleanVersion}
ER  - `;
    }
  };

  const citationText = generateCitation(activeFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    toast.success(`${activeFormat} citation copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeFormat === 'BibTeX' ? 'bib' : activeFormat === 'RIS' ? 'ris' : 'txt';
    const blob = new Blob([citationText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${cleanRef.toLowerCase()}_citation.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${cleanRef}_citation.${ext}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132f4c]/40 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl border border-slate-300 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#eef2f5] px-5 py-4">
          <div className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-[#244562]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statutory & Academic Citation</p>
              <h2 className="text-base font-bold text-[#132f4c] truncate max-w-md">{document.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="focus-ring border border-slate-300 p-1 text-slate-500 hover:bg-slate-200"
            type="button"
            aria-label="Close citation modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          {(['BibTeX', 'APA', 'IEEE', 'RIS'] as CitationFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={`px-3 py-2 text-xs font-bold transition-colors border-b-2 ${
                activeFormat === fmt
                  ? 'border-[#244562] text-[#244562] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              {fmt === 'RIS' ? 'RIS (Zotero / Mendeley)' : fmt === 'APA' ? 'APA 7th' : fmt}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="relative">
            <pre className="min-h-[140px] max-h-[220px] overflow-auto border border-slate-800 bg-[#1E293B] p-4 text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap rounded-xs">
              {citationText}
            </pre>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Reference ID: <span className="font-mono font-bold text-slate-700">{cleanRef}</span></span>
            <span>Version: <span className="font-mono font-bold text-slate-700">{cleanVersion}</span></span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              onClick={handleDownload}
              className="focus-ring flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              type="button"
            >
              <Download className="h-3.5 w-3.5" />
              Download .{activeFormat === 'BibTeX' ? 'bib' : activeFormat === 'RIS' ? 'ris' : 'txt'}
            </button>
            <button
              onClick={handleCopy}
              className="focus-ring flex items-center gap-1.5 bg-[#244562] px-4 py-2 text-xs font-bold text-white hover:bg-[#132f4c]"
              type="button"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Citation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
