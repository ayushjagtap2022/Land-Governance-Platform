import { useState } from 'react';
import { Globe, Languages, Loader2, Sparkles, X, Copy, Check } from 'lucide-react';
import api from '@/lib/api';

const INDIAN_LANGUAGES = [
  { code: 'Hindi', label: 'हिंदी (Hindi)' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)' },
  { code: 'Bengali', label: 'বাংলা (Bengali)' },
  { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
];

export function BhashiniTranslatorModal({
  initialText = '',
  onClose,
}: {
  initialText?: string;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialText || 'All land records, cadastral survey maps, and revenue register entries must be georeferenced using Survey of India CORS network before final title issuance.');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [translated, setTranslated] = useState('');
  const [provider, setProvider] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isError = translated.startsWith('Translation error');

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setTranslated('');
    try {
      let res;
      try {
        res = await api.post('/ai/assistant/translate', {
          text: text.trim(),
          target_language: targetLang,
        });
      } catch (firstErr: any) {
        if (firstErr?.response?.status === 404) {
          res = await api.post('/assistant/translate', {
            text: text.trim(),
            target_language: targetLang,
          });
        } else {
          throw firstErr;
        }
      }
      setTranslated(res.data.translated_text);
      setProvider(res.data.provider || 'Bhashini AI / National Language Translation Mission (NLTM)');
    } catch (err: any) {
      setTranslated(`Translation error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translated || isError) return;
    navigator.clipboard.writeText(translated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-3xl flex-col border border-slate-400 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-300 bg-[#132f4c] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-sm">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-900">
                  BHASHINI AI TRANSLATION
                </span>
                <span className="text-xs text-slate-300">National Language Translation Mission</span>
              </div>
              <h2 className="font-serif text-lg font-bold">Land Governance Regional Language Translator</h2>
            </div>
          </div>
          <button onClick={onClose} className="focus-ring p-1.5 hover:bg-white/10 text-white" type="button" aria-label="Close Translation Modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Language Select */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Select Target Indian Regional Language:</label>
            <div className="flex flex-wrap gap-2">
              {INDIAN_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetLang(lang.code)}
                  className={`border px-3 py-1.5 text-xs font-bold transition-colors ${
                    targetLang === lang.code
                      ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-2xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Original Text Input */}
          <div>
            <label htmlFor="bhashini-input" className="mb-1 block text-xs font-bold text-slate-700">Original Text / Policy Record Snippet:</label>
            <textarea
              id="bhashini-input"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-slate-300 p-3 text-xs bg-slate-50 font-mono text-slate-800 focus-ring"
              placeholder="Paste land policy, gazette section, or RoR entry text here..."
            />
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            disabled={isLoading || !text.trim()}
            className="focus-ring flex items-center justify-center gap-2 bg-[#132f4c] py-2.5 px-5 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4 text-orange-400" />}
            Translate to {targetLang} via Bhashini AI
          </button>

          {/* Translated Result Box */}
          {translated && (
            <div className={`border p-4 relative space-y-2 ${
              isError
                ? 'border-red-300 bg-red-50/80 text-red-900'
                : 'border-orange-200 bg-orange-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isError ? 'text-red-800' : 'text-orange-950'}`}>
                  <Sparkles className={`h-3.5 w-3.5 ${isError ? 'text-red-600' : 'text-orange-600'}`} />
                  {isError ? 'Translation Notice:' : `Translated ${targetLang} Record Output:`}
                </span>
                {!isError && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white px-2 py-1 shadow-2xs hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <p className={`text-sm leading-relaxed font-sans ${isError ? 'font-medium text-red-700' : 'font-semibold text-slate-900'}`}>
                {translated}
              </p>
              {provider && !isError && (
                <p className="text-[10px] font-mono text-slate-500 pt-1 border-t border-orange-200">{provider}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
