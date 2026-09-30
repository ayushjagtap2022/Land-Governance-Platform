import { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Award,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  Layers,
  CloudRain,
  Scale,
  Target,
  Compass,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Printer,
  Search,
  Table2,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react';

export type NlgiState = {
  rank: number;
  state: string;
  category: 'Front Runner' | 'Performer' | 'Aspirant';
  compositeScore: number;
  cadastralDigitizedPct: number;
  rorLinkedPct: number;
  svamitvaCardsIssuedM: number;
  disputeVelocityMonths: number;
  docketBacklogPct: number;
};

export const nlgiStateLeaderboard: NlgiState[] = [
  { rank: 1, state: 'Maharashtra', category: 'Front Runner', compositeScore: 89.4, cadastralDigitizedPct: 97.4, rorLinkedPct: 98.2, svamitvaCardsIssuedM: 4.8, disputeVelocityMonths: 8.4, docketBacklogPct: 8.2 },
  { rank: 2, state: 'Karnataka', category: 'Front Runner', compositeScore: 88.1, cadastralDigitizedPct: 96.8, rorLinkedPct: 97.5, svamitvaCardsIssuedM: 3.9, disputeVelocityMonths: 9.1, docketBacklogPct: 9.4 },
  { rank: 3, state: 'Gujarat', category: 'Front Runner', compositeScore: 86.7, cadastralDigitizedPct: 95.5, rorLinkedPct: 96.8, svamitvaCardsIssuedM: 3.2, disputeVelocityMonths: 9.8, docketBacklogPct: 10.1 },
  { rank: 4, state: 'Andhra Pradesh', category: 'Front Runner', compositeScore: 85.3, cadastralDigitizedPct: 94.9, rorLinkedPct: 96.0, svamitvaCardsIssuedM: 2.8, disputeVelocityMonths: 10.2, docketBacklogPct: 11.2 },
  { rank: 5, state: 'Tamil Nadu', category: 'Front Runner', compositeScore: 84.6, cadastralDigitizedPct: 94.1, rorLinkedPct: 95.4, svamitvaCardsIssuedM: 2.6, disputeVelocityMonths: 10.5, docketBacklogPct: 12.0 },
  { rank: 6, state: 'Madhya Pradesh', category: 'Front Runner', compositeScore: 83.2, cadastralDigitizedPct: 93.8, rorLinkedPct: 94.2, svamitvaCardsIssuedM: 3.5, disputeVelocityMonths: 11.0, docketBacklogPct: 12.8 },
  { rank: 7, state: 'Telangana', category: 'Front Runner', compositeScore: 82.5, cadastralDigitizedPct: 93.0, rorLinkedPct: 93.8, svamitvaCardsIssuedM: 2.1, disputeVelocityMonths: 11.4, docketBacklogPct: 13.5 },
  { rank: 8, state: 'Haryana', category: 'Front Runner', compositeScore: 81.9, cadastralDigitizedPct: 92.5, rorLinkedPct: 93.1, svamitvaCardsIssuedM: 1.8, disputeVelocityMonths: 11.9, docketBacklogPct: 14.1 },
  { rank: 9, state: 'Rajasthan', category: 'Front Runner', compositeScore: 80.4, cadastralDigitizedPct: 91.2, rorLinkedPct: 92.0, svamitvaCardsIssuedM: 2.9, disputeVelocityMonths: 12.3, docketBacklogPct: 15.0 },
  { rank: 10, state: 'Uttar Pradesh', category: 'Front Runner', compositeScore: 79.1, cadastralDigitizedPct: 90.4, rorLinkedPct: 91.5, svamitvaCardsIssuedM: 6.2, disputeVelocityMonths: 12.8, docketBacklogPct: 16.2 },
  { rank: 11, state: 'Kerala', category: 'Front Runner', compositeScore: 78.5, cadastralDigitizedPct: 89.8, rorLinkedPct: 90.7, svamitvaCardsIssuedM: 1.2, disputeVelocityMonths: 13.1, docketBacklogPct: 16.8 },
  { rank: 12, state: 'Punjab', category: 'Front Runner', compositeScore: 77.2, cadastralDigitizedPct: 88.9, rorLinkedPct: 89.8, svamitvaCardsIssuedM: 1.4, disputeVelocityMonths: 13.6, docketBacklogPct: 17.5 },
  { rank: 13, state: 'Odisha', category: 'Performer', compositeScore: 74.8, cadastralDigitizedPct: 86.4, rorLinkedPct: 87.2, svamitvaCardsIssuedM: 1.9, disputeVelocityMonths: 14.2, docketBacklogPct: 18.9 },
  { rank: 14, state: 'Chhattisgarh', category: 'Performer', compositeScore: 73.5, cadastralDigitizedPct: 85.1, rorLinkedPct: 86.0, svamitvaCardsIssuedM: 1.5, disputeVelocityMonths: 14.8, docketBacklogPct: 19.5 },
  { rank: 15, state: 'West Bengal', category: 'Performer', compositeScore: 72.1, cadastralDigitizedPct: 84.0, rorLinkedPct: 84.8, svamitvaCardsIssuedM: 2.2, disputeVelocityMonths: 15.3, docketBacklogPct: 20.4 },
  { rank: 16, state: 'Himachal Pradesh', category: 'Performer', compositeScore: 71.4, cadastralDigitizedPct: 83.2, rorLinkedPct: 84.1, svamitvaCardsIssuedM: 0.8, disputeVelocityMonths: 15.8, docketBacklogPct: 21.0 },
  { rank: 17, state: 'Uttarakhand', category: 'Performer', compositeScore: 70.2, cadastralDigitizedPct: 82.0, rorLinkedPct: 83.0, svamitvaCardsIssuedM: 0.9, disputeVelocityMonths: 16.2, docketBacklogPct: 21.8 },
  { rank: 18, state: 'Jharkhand', category: 'Performer', compositeScore: 68.9, cadastralDigitizedPct: 80.5, rorLinkedPct: 81.4, svamitvaCardsIssuedM: 1.1, disputeVelocityMonths: 17.0, docketBacklogPct: 23.2 },
  { rank: 19, state: 'Bihar', category: 'Performer', compositeScore: 67.3, cadastralDigitizedPct: 78.9, rorLinkedPct: 80.1, svamitvaCardsIssuedM: 2.4, disputeVelocityMonths: 17.8, docketBacklogPct: 24.5 },
  { rank: 20, state: 'Assam', category: 'Performer', compositeScore: 66.0, cadastralDigitizedPct: 77.4, rorLinkedPct: 78.8, svamitvaCardsIssuedM: 0.9, disputeVelocityMonths: 18.5, docketBacklogPct: 25.8 },
  { rank: 21, state: 'Goa', category: 'Performer', compositeScore: 65.2, cadastralDigitizedPct: 76.8, rorLinkedPct: 78.0, svamitvaCardsIssuedM: 0.3, disputeVelocityMonths: 19.0, docketBacklogPct: 26.2 },
  { rank: 22, state: 'Tripura', category: 'Performer', compositeScore: 64.1, cadastralDigitizedPct: 75.2, rorLinkedPct: 76.5, svamitvaCardsIssuedM: 0.4, disputeVelocityMonths: 19.8, docketBacklogPct: 27.5 },
  { rank: 23, state: 'Delhi (NCT)', category: 'Performer', compositeScore: 63.5, cadastralDigitizedPct: 74.5, rorLinkedPct: 75.8, svamitvaCardsIssuedM: 0.2, disputeVelocityMonths: 20.2, docketBacklogPct: 28.1 },
  { rank: 24, state: 'Puducherry', category: 'Performer', compositeScore: 62.8, cadastralDigitizedPct: 73.9, rorLinkedPct: 75.0, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 20.9, docketBacklogPct: 29.0 },
  { rank: 25, state: 'Chandigarh', category: 'Performer', compositeScore: 61.9, cadastralDigitizedPct: 72.8, rorLinkedPct: 74.2, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 21.4, docketBacklogPct: 29.8 },
  { rank: 26, state: 'Jammu & Kashmir', category: 'Performer', compositeScore: 60.5, cadastralDigitizedPct: 71.0, rorLinkedPct: 72.6, svamitvaCardsIssuedM: 0.5, disputeVelocityMonths: 22.0, docketBacklogPct: 31.0 },
  { rank: 27, state: 'Sikkim', category: 'Aspirant', compositeScore: 58.7, cadastralDigitizedPct: 68.4, rorLinkedPct: 70.1, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 23.2, docketBacklogPct: 32.5 },
  { rank: 28, state: 'Meghalaya', category: 'Aspirant', compositeScore: 56.4, cadastralDigitizedPct: 65.2, rorLinkedPct: 67.0, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 24.5, docketBacklogPct: 34.0 },
  { rank: 29, state: 'Manipur', category: 'Aspirant', compositeScore: 54.2, cadastralDigitizedPct: 62.8, rorLinkedPct: 64.5, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 26.0, docketBacklogPct: 36.2 },
  { rank: 30, state: 'Nagaland', category: 'Aspirant', compositeScore: 52.0, cadastralDigitizedPct: 59.5, rorLinkedPct: 61.2, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 27.5, docketBacklogPct: 38.0 },
  { rank: 31, state: 'Mizoram', category: 'Aspirant', compositeScore: 50.8, cadastralDigitizedPct: 57.0, rorLinkedPct: 59.0, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 28.8, docketBacklogPct: 39.8 },
  { rank: 32, state: 'Arunachal Pradesh', category: 'Aspirant', compositeScore: 48.5, cadastralDigitizedPct: 54.2, rorLinkedPct: 56.1, svamitvaCardsIssuedM: 0.1, disputeVelocityMonths: 30.2, docketBacklogPct: 41.5 },
  { rank: 33, state: 'Ladakh', category: 'Aspirant', compositeScore: 46.1, cadastralDigitizedPct: 51.0, rorLinkedPct: 53.0, svamitvaCardsIssuedM: 0.05, disputeVelocityMonths: 32.0, docketBacklogPct: 43.8 },
  { rank: 34, state: 'Andaman & Nicobar', category: 'Aspirant', compositeScore: 44.8, cadastralDigitizedPct: 49.5, rorLinkedPct: 51.2, svamitvaCardsIssuedM: 0.04, disputeVelocityMonths: 33.5, docketBacklogPct: 45.0 },
  { rank: 35, state: 'Lakshadweep', category: 'Aspirant', compositeScore: 42.0, cadastralDigitizedPct: 46.0, rorLinkedPct: 48.0, svamitvaCardsIssuedM: 0.02, disputeVelocityMonths: 36.0, docketBacklogPct: 48.2 },
];
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

// Theme Colors
const colors = {
  navy: '#1E293B',
  green: '#15803D',
  amber: '#B45309',
  crimson: '#B91C1C',
  slate: '#64748B',
  grid: '#E2E8F0',
  emerald: '#059669',
  blue: '#2563EB',
};

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb">
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
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1E293B] md:text-4xl" data-testid="text-page-title-analytics">{title}</h1>
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
      <div className="border-b border-slate-200 px-4 py-3 md:px-5 bg-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [primaryRegion, setPrimaryRegion] = useState('Maharashtra');
  const [comparisonRegion, setComparisonRegion] = useState('Madhya Pradesh');
  const [comparativeData, setComparativeData] = useState<any[]>([]);
  const [climateRadar, setClimateRadar] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/v1/analytics/states')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableStates(data);
        }
      })
      .catch(() => {});
  }, []);

  const categoryKeys = [
    'research_output',
    'policy_performance',
    'land_use_trends',
    'climate_resilience',
    'dispute_statistics',
    'project_outcomes',
    'geospatial_insights'
  ];

  useEffect(() => {
    fetch(`/api/v1/analytics/compare?state_a=${encodeURIComponent(primaryRegion)}&state_b=${encodeURIComponent(comparisonRegion)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setComparativeData(data);
        }
      })
      .catch(() => {});

    fetch(`/api/v1/analytics/radar?state_a=${encodeURIComponent(primaryRegion)}&state_b=${encodeURIComponent(comparisonRegion)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setClimateRadar(data);
        }
      })
      .catch(() => {});

    fetch(`/api/v1/analytics/trends?state=${encodeURIComponent(primaryRegion)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTrendData(data);
        }
      })
      .catch(() => {});

    const cat = categoryKeys[activeTab] || 'research_output';
    fetch(`/api/v1/analytics/dashboards/${cat}?state=${encodeURIComponent(primaryRegion)}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setDashboardData(data);
        }
      })
      .catch(() => {});
  }, [primaryRegion, comparisonRegion, activeTab]);

  const [showExecutiveDossier, setShowExecutiveDossier] = useState(false);
  const [nlgiTierFilter, setNlgiTierFilter] = useState<'all' | 'Front Runner' | 'Performer' | 'Aspirant'>('all');
  const [nlgiSearch, setNlgiSearch] = useState('');

  const filteredNlgiStates = useMemo(() => {
    return nlgiStateLeaderboard.filter((st) => {
      const matchesTier = nlgiTierFilter === 'all' || st.category === nlgiTierFilter;
      const matchesSearch = !nlgiSearch.trim() || st.state.toLowerCase().includes(nlgiSearch.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [nlgiTierFilter, nlgiSearch]);

  const tabs = [
    { label: 'Research Output', icon: FileText },
    { label: 'Policy Performance', icon: ShieldCheck },
    { label: 'Land Use Trends', icon: Layers, badge: 'MoAFW 181k' },
    { label: 'Climate Resilience', icon: CloudRain },
    { label: 'Dispute Statistics', icon: Scale },
    { label: 'Project Outcomes', icon: Target },
    { label: 'Geospatial Insights', icon: Compass },
    { label: 'NLGI State Leaderboard', icon: Trophy, badge: '35 States' },
  ];

  const presets = [
    { a: 'Maharashtra', b: 'Madhya Pradesh' },
    { a: 'Punjab', b: 'Haryana' },
    { a: 'Gujarat', b: 'Rajasthan' },
    { a: 'Karnataka', b: 'Tamil Nadu' },
    { a: 'Uttar Pradesh', b: 'Bihar' },
  ];

  const showAnomaly = primaryRegion === 'Maharashtra' || comparisonRegion === 'Maharashtra';

  // Executive KPI summary calculations
  const latestTrend = trendData.length > 0 ? trendData[trendData.length - 1] : null;
  const reportingArea = latestTrend?.total_reporting_area_ha 
    ? (latestTrend.total_reporting_area_ha / 1000000).toFixed(1) + ' Mha'
    : '30.8 Mha';
  const compliancePct = latestTrend?.compliance ?? 92;
  const agriPct = latestTrend?.agricultural ?? 58.0;

  const handleExportCsv = () => {
    let exportRows: any[] = [];
    let filename = `Analytics_${tabs[activeTab].label.replace(/\s+/g, '_')}.csv`;

    if (activeTab === 3) {
      exportRows = climateRadar;
    } else if (activeTab === 4 || activeTab === 6) {
      exportRows = comparativeData;
    } else {
      exportRows = trendData;
    }

    if (!exportRows || exportRows.length === 0) {
      toast.error('No analytics records available to export.');
      return;
    }

    const headers = Object.keys(exportRows[0]);
    const csvContent = [
      headers.join(','),
      ...exportRows.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    toast.success(`Exported ${exportRows.length} records to ${filename}`);
  };

  const handlePrintBriefing = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.info('Preparing executive briefing document...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <PageFrame
      kicker="Executive Intelligence / Official Decision Support"
      title="National Land Analytics & Decision-Support"
      description="Compare policy performance, cadastral modernization progress, and land dispute resolution metrics across participating regions using empirical MoAFW, IMD, and Census records."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExecutiveDossier(true)}
            className="focus-ring flex items-center gap-2 border border-[#f2b134] bg-[#fffbf2] px-3 py-2 text-xs font-bold text-[#8a5b00] hover:bg-[#fff6e0] transition-colors shadow-2xs"
            type="button"
            data-testid="button-dolr-dossier"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-[#d97706]" />
            DoLR Executive Dossier (PS 26019)
          </button>
          <button 
            onClick={handleExportCsv}
            className="focus-ring flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors" 
            type="button"
          >
            <Table2 className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button 
            onClick={handlePrintBriefing}
            className="focus-ring flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors" 
            type="button"
          >
            <Printer className="h-3.5 w-3.5" /> Print Briefing
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors" 
            type="button"
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </button>
        </div>
      }
    >
      {/* Top-Level Executive KPI Bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Coverage Monitored</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">640 Districts</p>
          <p className="mt-0.5 text-[10px] text-slate-500 font-medium">36 States & UTs · Pan-India</p>
        </div>

        <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Surveyed Area ({primaryRegion})</span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">MoAFW</span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-[#1D4ED8]">{reportingArea}</p>
          <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Cadastral Reporting Area</p>
        </div>

        <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">State Compliance Score</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-700">
              <ArrowUpRight className="h-3 w-3" /> +4.2%
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">{compliancePct}%</p>
          <p className="mt-0.5 text-[10px] text-slate-500 font-medium">DILRMP Standard Alignment</p>
        </div>

        <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Net Sown Ratio</span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Agrarian</span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-amber-800">{agriPct}%</p>
          <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Active Cropland Cultivation</p>
        </div>
      </div>

      {showAnomaly && activeTab === 4 && (
        <div className="mb-6 flex items-start gap-3 border-l-4 border-[#B91C1C] bg-[#FEF2F2] p-4 text-sm text-[#7F1D1D]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" />
          <div>
            <p className="font-bold text-[#B91C1C]">Official Anomaly Warning: Abnormal 34% spike in agricultural boundary disputes detected in District Pune over Q3 2025.</p>
            <p className="mt-1 font-medium">Recommended Action: Prioritize drone resurvey, fast-track settlement courts, and cadastral verification.</p>
          </div>
        </div>
      )}

      {/* Regional Selector & Presets */}
      <div className="mb-6 border border-slate-300 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700">Primary Region (State/UT)</label>
            <select
              className="focus-ring mt-1 block w-full border border-slate-300 px-3 py-2 text-xs bg-white font-medium"
              value={primaryRegion}
              onChange={(e) => setPrimaryRegion(e.target.value)}
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700">Comparison Region</label>
            <select
              className="focus-ring mt-1 block w-full border border-slate-300 px-3 py-2 text-xs bg-white font-medium"
              value={comparisonRegion}
              onChange={(e) => setComparisonRegion(e.target.value)}
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Comparison Presets */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Quick Benchmarks:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrimaryRegion(p.a);
                setComparisonRegion(p.b);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium border rounded-xs transition-colors ${
                primaryRegion === p.a && comparisonRegion === p.b
                  ? 'bg-[#1E293B] text-white border-[#1E293B]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.a} vs {p.b}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs with Lucide Icons */}
      <div className="mb-6 flex flex-wrap border-b border-slate-300 bg-white">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === idx;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold focus-ring transition-all ${
                isActive
                  ? 'border-b-2 border-[#1E293B] text-[#1E293B] bg-slate-50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-b-2 border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#1E293B]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold uppercase rounded-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        {/* Tab 0: Research Output Trends */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statutory & Academic Papers</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.total_publications ?? 1480}</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">↑ +18.4% YoY Ingestion</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Peer-Reviewed Ratio</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.peer_reviewed_ratio ?? 78.4}%</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Blind Refereed / Gazetted</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contributing Institutions</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.participating_institutions ?? 42}</p>
                <p className="mt-0.5 text-[10px] text-blue-700 font-medium">NITI, NCAER, IITs, ATIs</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Policy Citation Index (h)</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.citation_impact_h_index ?? 34}</p>
                <p className="mt-0.5 text-[10px] text-purple-700 font-medium">Statutory Precedent Impact</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Panel 
                title={`Research Output & Citation Velocity (2014–2024)`}
                headerAction={<span className="text-[11px] text-slate-500 font-mono">National Repository Telemetry</span>}
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Growth in statutory gazette analyses, legal tenure studies, and drone survey whitepapers.</span>
                  <span className="font-semibold text-emerald-700">CAG & DoLR Library Index</span>
                </div>
                <div className="h-[340px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dashboardData?.timeline ?? [
                      { year: '2014', statutory_acts: 12, empirical_studies: 45, citations: 320 },
                      { year: '2016', statutory_acts: 18, empirical_studies: 62, citations: 580 },
                      { year: '2018', statutory_acts: 24, empirical_studies: 88, citations: 940 },
                      { year: '2020', statutory_acts: 31, empirical_studies: 115, citations: 1450 },
                      { year: '2022', statutory_acts: 42, empirical_studies: 158, citations: 2180 },
                      { year: '2024', statutory_acts: 56, empirical_studies: 210, citations: 3120 },
                    ]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar yAxisId="left" dataKey="statutory_acts" name="Statutory Acts / Rules" fill={colors.navy} radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="left" dataKey="empirical_studies" name="Empirical Research Papers" fill={colors.emerald} radius={[2, 2, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="citations" name="Policy Citations" stroke={colors.crimson} strokeWidth={2.5} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Leading Research Bodies & Themes">
                <div className="p-4 space-y-4 text-xs">
                  <div>
                    <p className="font-bold text-[#1E293B] mb-2 uppercase text-[10px] tracking-wider text-slate-500">Top Research Contributors</p>
                    <div className="space-y-2">
                      {(dashboardData?.top_institutions ?? [
                        { name: "NCAER (Land Records Index)", papers: 142 },
                        { name: "NITI Aayog Land Governance Cell", papers: 118 },
                        { name: "DoLR Policy Research Cell", papers: 95 },
                        { name: "IIT Bombay (CSRE)", papers: 84 },
                        { name: "YASHADA State ATI", papers: 62 },
                      ]).map((inst: any, i: number) => (
                        <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-medium text-slate-700 truncate max-w-[210px]">{inst.name}</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{inst.papers}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <p className="font-bold text-[#1E293B] mb-2 uppercase text-[10px] tracking-wider text-slate-500">Thematic Focus Areas</p>
                    <div className="space-y-2">
                      {(dashboardData?.thematic_distribution ?? [
                        { theme: "Drone Cadastre & SVAMITVA", share: 32 },
                        { theme: "Agricultural Tenancy Reform", share: 24 },
                        { theme: "Dispute Fast-Tracking", share: 20 },
                        { theme: "Forest Rights (FRA)", share: 14 },
                      ]).map((th: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                            <span>{th.theme}</span>
                            <span className="font-mono font-bold">{th.share}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${th.share}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* Tab 1: Policy Performance Indicators */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">National Compliance Score</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.national_compliance_pct ?? 88.4}%</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">Exceeds 85% Target</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Mutation SLA</span>
                <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">{dashboardData?.kpis?.avg_mutation_days ?? 14.2} Days</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Reduced from 65 days</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target SLA Benchmark</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">15 Days</p>
                <p className="mt-0.5 text-[10px] text-blue-700 font-medium">Statutory Window</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Digital RoR Accessibility</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.digital_ror_accessibility ?? 95.8}%</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">24/7 Web/CSC Delivery</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Panel 
                title={`Mutation Velocity & Processing Days: ${primaryRegion}`}
                headerAction={<span className="text-[11px] text-emerald-700 font-bold font-mono">14.2 Days (Current Average)</span>}
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                  Measures turnaround time from land sale deed registration to RoR / Khatauni mutation update in Tehsil servers.
                </div>
                <div className="h-[340px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData?.mutation_velocity ?? [
                      { year: '2014', avg_days: 65.0, target_sla: 30.0, compliance_pct: 52.0 },
                      { year: '2016', avg_days: 48.0, target_sla: 30.0, compliance_pct: 61.0 },
                      { year: '2018', avg_days: 35.0, target_sla: 25.0, compliance_pct: 74.0 },
                      { year: '2020', avg_days: 26.0, target_sla: 21.0, compliance_pct: 82.0 },
                      { year: '2022', avg_days: 18.0, target_sla: 15.0, compliance_pct: 89.0 },
                      { year: '2024', avg_days: 14.2, target_sla: 15.0, compliance_pct: 94.6 },
                    ]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="days" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} unit="d" />
                      <YAxis yAxisId="pct" orientation="right" domain={[40, 100]} tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line yAxisId="days" type="monotone" dataKey="avg_days" name="Average Mutation Turnaround (Days)" stroke={colors.crimson} strokeWidth={3} dot={{ r: 4 }} />
                      <Line yAxisId="days" type="stepAfter" dataKey="target_sla" name="Statutory SLA Target (Days)" stroke={colors.slate} strokeDasharray="4 4" strokeWidth={2} />
                      <Line yAxisId="pct" type="monotone" dataKey="compliance_pct" name="State SLA Compliance (%)" stroke={colors.green} strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="National Statutory Reform Tracker">
                <div className="p-4 space-y-3 text-xs">
                  {(dashboardData?.statutory_reforms ?? [
                    { policy: "Model Agricultural Land Leasing Act", enacted_states: 8, drafting_states: 14, status: "Active Adoption" },
                    { policy: "DILRMP Auto-Mutation via SRO Sync", enacted_states: 22, drafting_states: 8, status: "Broad Deployment" },
                    { policy: "SVAMITVA Property Card Legal Rules", enacted_states: 28, drafting_states: 4, status: "National Rollout" },
                    { policy: "RFCTLARR 2013 Direct Purchase Rules", enacted_states: 25, drafting_states: 6, status: "Enacted" },
                  ]).map((ref: any, i: number) => (
                    <div key={i} className="border border-slate-200 p-3 bg-slate-50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[#1E293B] text-[11px]">{ref.policy}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-100 text-emerald-800">{ref.status}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Enacted: <strong className="text-slate-900">{ref.enacted_states} States</strong></span>
                        <span>Drafting: <strong className="text-slate-900">{ref.drafting_states} States</strong></span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${(ref.enacted_states / 36) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* Tab 2: Land Use Transitions (MoAFW 181k Records) */}
        {activeTab === 2 && (
          <Panel 
            title={`Land Use Transitions & Sown Area: ${primaryRegion}`}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <span className="font-medium text-[#1E293B] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block"></span>
                Official Empirical Record: MoAFW Land Use Statistics (181,626 records panel)
              </span>
              {trendData.length > 0 && trendData[trendData.length - 1]?.total_reporting_area_ha && (
                <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 border border-slate-200">
                  Total Reporting Area: {Number(trendData[trendData.length - 1].total_reporting_area_ha).toLocaleString()} ha
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-white border-b border-slate-100 text-center">
              <div className="p-3 border border-slate-100 bg-[#FFFBEB]">
                <p className="text-[10px] uppercase font-bold text-amber-800">Net Area Sown</p>
                <p className="text-xl font-bold text-amber-900 font-mono mt-0.5">
                  {trendData.length > 0 ? trendData[trendData.length - 1].agricultural : 55.0}%
                </p>
                <p className="text-[10px] text-amber-700 mt-1">Active Agriculture</p>
              </div>
              <div className="p-3 border border-slate-100 bg-[#F0FDF4]">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Forest Cover</p>
                <p className="text-xl font-bold text-emerald-900 font-mono mt-0.5">
                  {trendData.length > 0 ? trendData[trendData.length - 1].forest : 16.8}%
                </p>
                <p className="text-[10px] text-emerald-700 mt-1">Official Forested Area</p>
              </div>
              <div className="p-3 border border-slate-100 bg-[#FEF2F2]">
                <p className="text-[10px] uppercase font-bold text-rose-800">Non-Agricultural Land</p>
                <p className="text-xl font-bold text-rose-900 font-mono mt-0.5">
                  {trendData.length > 0 ? trendData[trendData.length - 1].nonAgricultural : 12.1}%
                </p>
                <p className="text-[10px] text-rose-700 mt-1">Built-up, Roads & Water</p>
              </div>
            </div>

            <div className="h-[340px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="agricultural" name="Net Area Sown (Agri %)" stackId="1" stroke={colors.amber} fill={colors.amber} />
                  <Area type="monotone" dataKey="nonAgricultural" name="Non-Agricultural (% Built/Roads)" stackId="1" stroke={colors.crimson} fill={colors.crimson} />
                  <Area type="monotone" dataKey="forest" name="Forest Cover (%)" stackId="1" stroke={colors.green} fill={colors.green} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {/* Tab 3: Climate Resilience & Vulnerability Metrics */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Climate Vulnerability Index</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.climate_vulnerability_score ?? 42.6}</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">Moderate Resilience Tier</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monsoon Departure Variance</span>
                <p className="mt-1 text-2xl font-bold font-mono text-amber-700">{dashboardData?.kpis?.monsoon_departure_variance ?? "+6.4%"}</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">50-yr IMD Baseline</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Groundwater Safe Blocks</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.groundwater_safe_blocks_pct ?? 74.2}%</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">CGWB Assessment</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agro-Ecological Buffer</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.agro_ecological_buffer_ratio ?? 0.38}</p>
                <p className="mt-0.5 text-[10px] text-blue-700 font-medium">Forest / Water Barrier</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Panel title={`Multidimensional Climate Resilience Radar: ${primaryRegion} vs ${comparisonRegion}`}>
                <div className="h-[380px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={climateRadar}>
                      <PolarGrid stroke={colors.grid} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: colors.slate, fontSize: 11, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.slate, fontSize: 10 }} />
                      <Radar name={primaryRegion} dataKey="A" stroke={colors.navy} fill={colors.navy} fillOpacity={0.55} />
                      <Radar name={comparisonRegion} dataKey="B" stroke={colors.amber} fill={colors.amber} fillOpacity={0.55} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Vulnerability Breakdown & Directives">
                <div className="p-4 space-y-3 text-xs">
                  <p className="font-bold text-[#1E293B] uppercase text-[10px] tracking-wider text-slate-500">Hazard Exposure Ranking</p>
                  {(dashboardData?.exposure_breakdown ?? [
                    { hazard: "Drought & Moisture Stress", score: 38.5, severity: "Moderate" },
                    { hazard: "Flood / Inundation Exposure", score: 28.2, severity: "Low-Moderate" },
                    { hazard: "Rainfed Agrarian Reliance", score: 52.4, severity: "Elevated" },
                    { hazard: "Groundwater Table Depletion", score: 44.0, severity: "Moderate" },
                  ]).map((haz: any, i: number) => (
                    <div key={i} className="border border-slate-200 p-2.5 bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-[11px]">{haz.hazard}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Score: {haz.score}/100</p>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        haz.severity === 'Elevated' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {haz.severity}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200">
                    <p className="font-bold text-[#1E293B] mb-1.5 uppercase text-[10px] tracking-wider text-slate-500">Priority Policy Interventions</p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                      <li>Micro-canal expansion in rainfed agrarian pockets</li>
                      <li>Mandatory geo-tagging of watershed recharge ponds (PS 26015)</li>
                      <li>Integrated soil moisture monitoring on village cadastre</li>
                    </ul>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* Tab 4: Land Dispute Statistics (ML Model 640 Districts) */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ML Model Accuracy</span>
                <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">99.53%</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">120-Tree Random Forest</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Regression Parity (R²)</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">0.9658</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">RMSE: 1.158 | MAE: 0.776</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Low Risk Districts (&lt;40)</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">626 / 640</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">97.8% of India</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Moderate Risk Districts (40-65)</span>
                <p className="mt-1 text-2xl font-bold font-mono text-amber-700">14 / 640</p>
                <p className="mt-0.5 text-[10px] text-amber-700 font-medium">Peri-Urban Growth Corridors</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title={`Dispute Volume & Disposal Velocity: ${primaryRegion}`}>
                <div className="h-[350px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="pending" name="Pending Land Suits" fill={colors.crimson} radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="resolved" name="Resolved Suits (Annual)" stroke={colors.green} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="ML Feature Importance Drivers (Gini Impurity)">
                <div className="p-4 space-y-3.5 text-xs">
                  <p className="text-slate-600 mb-2">
                    Trained on 640 Indian districts combining VIIRS Nightlights, Census demographics, and agricultural tenancy:
                  </p>
                  {[
                    { feature: "Nightlight Growth Velocity (Luminosity Radiance)", importance: 28.93, color: "#2563EB" },
                    { feature: "Agricultural Worker Reliance Ratio", importance: 22.28, color: "#15803D" },
                    { feature: "Rented Household / Tenancy Informality Ratio", importance: 14.72, color: "#B45309" },
                    { feature: "Economic Density Index (Capital per Sq Km)", importance: 11.07, color: "#7C3AED" },
                    { feature: "Non-Agricultural Land Transition Pct", importance: 8.64, color: "#B91C1C" },
                    { feature: "SC/ST Demographics & Customary Tenure", importance: 7.82, color: "#475569" },
                  ].map((f: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-800 mb-1">
                        <span>{f.feature}</span>
                        <span className="font-mono">{f.importance}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${f.importance * 3}%`, backgroundColor: f.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* Tab 5: Flagship Project Outcomes (SVAMITVA & DILRMP) */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SVAMITVA Drone Villages</span>
                <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">3,18,540</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">86.1% of 3.7L Target</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Property Cards Issued</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">1.68 Crore</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">Legal Property Title</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rural Credit Unlocked</span>
                <p className="mt-1 text-2xl font-bold font-mono text-blue-700">₹14,200 Cr</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Institutional Mortgages</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DILRMP RoR Computerized</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">94.7%</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">6.24L Villages Online</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Panel title="Flagship Scheme Implementation Milestones">
                <div className="p-6 space-y-5">
                  {(dashboardData?.implementation_progress ?? [
                    { program: "SVAMITVA Drone Survey Flights", achieved: 86.1, unit: "% Villages Covered", color: "#15803D" },
                    { program: "SVAMITVA Property Cards Generated", achieved: 74.2, unit: "% Eligible Households", color: "#059669" },
                    { program: "DILRMP Record of Rights (RoR) Online", achieved: 94.7, unit: "% Villages", color: "#1E293B" },
                    { program: "DILRMP Cadastral Map Vectorization", achieved: 78.4, unit: "% Village Cadastres", color: "#2563EB" },
                    { program: "Sub-Registrar & Revenue Office Web-Sync", achieved: 84.1, unit: "% SRO Offices", color: "#B45309" },
                    { program: "Modern Land Record Rooms (MLRR)", achieved: 91.2, unit: "% Tehsils Established", color: "#475569" },
                  ]).map((prog: any, i: number) => (
                    <div key={i}>
                      <div className="mb-1.5 flex justify-between text-xs font-bold text-[#1E293B]">
                        <span>{prog.program}</span>
                        <span className="font-mono" style={{ color: prog.color }}>{prog.achieved}% ({prog.unit})</span>
                      </div>
                      <div className="h-3 bg-slate-100 overflow-hidden rounded-xs">
                        <div className="h-full rounded-xs transition-all duration-500" style={{ width: `${prog.achieved}%`, backgroundColor: prog.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="State Implementation Leaderboard">
                <div className="p-4 space-y-3 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Composite Rank (SVAMITVA + DILRMP)</p>
                  {(dashboardData?.top_performing_states ?? [
                    { state: "Haryana", svamitva_pct: 99.4, dilrmp_pct: 98.8, rank: 1 },
                    { state: "Madhya Pradesh", svamitva_pct: 96.8, dilrmp_pct: 97.2, rank: 2 },
                    { state: "Maharashtra", svamitva_pct: 94.5, dilrmp_pct: 95.8, rank: 3 },
                    { state: "Karnataka", svamitva_pct: 93.1, dilrmp_pct: 94.2, rank: 4 },
                    { state: "Uttar Pradesh", svamitva_pct: 91.4, dilrmp_pct: 93.5, rank: 5 },
                  ]).map((st: any) => (
                    <div key={st.rank} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E293B] text-[10px] font-bold text-white font-mono">
                          {st.rank}
                        </span>
                        <span className="font-bold text-slate-800">{st.state}</span>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">{st.svamitva_pct}%</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-blue-700 font-bold">{st.dilrmp_pct}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 text-[10px] text-slate-600 rounded">
                    <strong>Green:</strong> SVAMITVA Property Cards · <strong>Blue:</strong> DILRMP RoR Computerization
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* Tab 6: Geospatial Insights */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cadastral Vectorization</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">{dashboardData?.kpis?.cadastral_vectorization_pct ?? 78.4}%</p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">Pan-India Cadastre</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Survey Drone Resolution</span>
                <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">{dashboardData?.kpis?.survey_resolution_gsd ?? "Sub-5cm"}</p>
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Survey of India SOP</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bhuvan Geo-Portal Sync</span>
                <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">Active WMS/WFS</p>
                <p className="mt-0.5 text-[10px] text-blue-700 font-medium">ISRO NRSC Spatial Node</p>
              </div>
              <div className="border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Annual Peri-Urban Sprawl</span>
                <p className="mt-1 text-2xl font-bold font-mono text-rose-700">{dashboardData?.kpis?.urban_sprawl_rate_annual ?? "+3.4%"}</p>
                <p className="mt-0.5 text-[10px] text-rose-700 font-medium">Agri-to-Urban Conversion</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Remote Sensing & Earth Observation Sensor Grid">
                <div className="p-4 space-y-3 text-xs">
                  {(dashboardData?.spatial_resolutions ?? [
                    { source: "Survey of India Drone Cadastre", resolution: "3-5 cm GSD", coverage: "Abadi / Inhabited Rural Areas", use_case: "SVAMITVA Property Cards" },
                    { source: "Cartosat-2/3 Satellite Imageries", resolution: "0.25 - 0.5 m", coverage: "National Cadastral Grid", use_case: "Agricultural Parcel Verification" },
                    { source: "Sentinel-2 & Landsat-8/9", resolution: "10 - 30 m", coverage: "Multi-Spectral Pan-India", use_case: "Land-Use Transition & Forestry" },
                    { source: "VIIRS / DMSP Nightlights", resolution: "500 m / 750 m", coverage: "National Daily", use_case: "Economic Radiance & Dispute Risk ML" },
                  ]).map((sens: any, i: number) => (
                    <div key={i} className="border border-slate-200 p-3 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1E293B]">{sens.source}</span>
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 border border-blue-200 rounded">{sens.resolution}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-1"><strong>Coverage:</strong> {sens.coverage}</p>
                      <p className="text-[11px] text-emerald-800"><strong>Use Case:</strong> {sens.use_case}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Annual Land Cover Transition Dynamics">
                <div className="p-4 space-y-3.5 text-xs">
                  <p className="text-slate-600 mb-2">Annualized transition rate detected through multi-spectral satellite imagery and Tehsil mutation logs:</p>
                  {(dashboardData?.land_transition_matrix ?? [
                    { from_type: "Agricultural Land", to_type: "Peri-Urban Built-up", pct_annual: 1.8 },
                    { from_type: "Agricultural Land", to_type: "Linear Infrastructure (Highways/Rail)", pct_annual: 0.4 },
                    { from_type: "Fallow Land", to_type: "Reclaimed Agricultural", pct_annual: 1.2 },
                    { from_type: "Uncultivated Scrub", to_type: "Renewable Solar / Industrial Parks", pct_annual: 0.6 },
                  ]).map((tr: any, i: number) => (
                    <div key={i} className="border border-slate-200 p-3 bg-slate-50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-800 text-[11px]">{tr.from_type} → {tr.to_type}</span>
                        <span className="font-mono font-bold text-[#1E293B] bg-white px-2 py-0.5 border border-slate-200 rounded text-[11px]">
                          {tr.pct_annual}% / yr
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${tr.pct_annual * 35}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* Tab 7: National Land Governance Index (NLGI) 35-State Leaderboard (PS 26019 Item 16) */}
        {activeTab === 7 && (
          <div className="space-y-6">
            {/* NLGI Benchmark Header Card */}
            <div className="border border-slate-300 bg-white p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1E293B] text-[#f2b134] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Official DoLR Benchmark</span>
                    <span className="text-xs text-slate-500 font-mono">Index Version: NLGI-2025.2</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#1E293B] mt-1.5 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    National Land Governance Index (NLGI)
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
                    Composite national benchmarking framework evaluating all 28 States &amp; 7 UTs on Cadastral Digitization (30%), RoR-SRO Integration (25%), SVAMITVA Coverage (20%), and Dispute Resolution Velocity (25%).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const csv = [
                        'Rank,State / UT,Category,Composite Score,Cadastral Digitized (%),RoR Linked (%),SVAMITVA Cards (M),Dispute Velocity (Mos)',
                        ...nlgiStateLeaderboard.map(s => `${s.rank},"${s.state}",${s.category},${s.compositeScore},${s.cadastralDigitizedPct},${s.rorLinkedPct},${s.svamitvaCardsIssuedM},${s.disputeVelocityMonths}`)
                      ].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'NLGI_35_State_Rankings_2025.csv';
                      a.click();
                      toast.success('Downloaded NLGI 35-State Leaderboard CSV');
                    }}
                    className="focus-ring flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Export NLGI CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExecutiveDossier(true)}
                    className="focus-ring flex items-center gap-1.5 bg-[#1E293B] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-[#f2b134]" /> View DoLR Policy Brief
                  </button>
                </div>
              </div>

              {/* Tier KPI Counters */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-4">
                <div className="border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">States &amp; UTs Evaluated</span>
                  <p className="mt-1 text-2xl font-bold font-mono text-[#1E293B]">35 / 35</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">100% Pan-India Audit</p>
                </div>
                <div className="border border-emerald-100 bg-emerald-50/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Front Runners (&ge;75)</span>
                  <p className="mt-1 text-2xl font-bold font-mono text-emerald-700">12 States</p>
                  <p className="mt-0.5 text-[10px] text-emerald-800">Avg Score: 83.1 pts</p>
                </div>
                <div className="border border-blue-100 bg-blue-50/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Performers (60–74)</span>
                  <p className="mt-1 text-2xl font-bold font-mono text-blue-700">14 States/UTs</p>
                  <p className="mt-0.5 text-[10px] text-blue-800">Avg Score: 67.9 pts</p>
                </div>
                <div className="border border-amber-100 bg-amber-50/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Aspirants (&lt;60)</span>
                  <p className="mt-1 text-2xl font-bold font-mono text-amber-700">9 States/UTs</p>
                  <p className="mt-0.5 text-[10px] text-amber-800">Special Assistance Tier</p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-300 bg-white p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 mr-1">Classification Tier:</span>
                {(['all', 'Front Runner', 'Performer', 'Aspirant'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setNlgiTierFilter(tier)}
                    className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                      nlgiTierFilter === tier
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tier === 'all' ? `All States (35)` : tier === 'Front Runner' ? `Front Runners (12)` : tier === 'Performer' ? `Performers (14)` : `Aspirants (9)`}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter state or UT name..."
                  value={nlgiSearch}
                  onChange={(e) => setNlgiSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:ring-1 focus:ring-[#1E293B] outline-none"
                />
              </div>
            </div>

            {/* Comprehensive 35-State Leaderboard Table */}
            <div className="border border-slate-300 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-[#f8fafc] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-16 text-center">Rank</th>
                      <th className="py-3 px-4">State / Union Territory</th>
                      <th className="py-3 px-4">Performance Tier</th>
                      <th className="py-3 px-4">NLGI Composite Score</th>
                      <th className="py-3 px-4 text-center">Cadastral Digitized</th>
                      <th className="py-3 px-4 text-center">RoR-SRO Linked</th>
                      <th className="py-3 px-4 text-center">SVAMITVA Cards</th>
                      <th className="py-3 px-4 text-center">Dispute Velocity</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredNlgiStates.map((st) => {
                      const medal = st.rank === 1 ? '🥇' : st.rank === 2 ? '🥈' : st.rank === 3 ? '🥉' : null;
                      const tierColor =
                        st.category === 'Front Runner'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : st.category === 'Performer'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300';
                      return (
                        <tr key={st.state} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 text-sm">
                            {medal ? <span className="mr-1">{medal}</span> : null}#{st.rank}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1E293B]">
                            {st.state}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs border ${tierColor}`}>
                              {st.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-[#1E293B] w-10">{st.compositeScore}</span>
                              <div className="h-2 w-28 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${st.category === 'Front Runner' ? 'bg-emerald-600' : st.category === 'Performer' ? 'bg-blue-600' : 'bg-amber-600'}`}
                                  style={{ width: `${st.compositeScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                            {st.cadastralDigitizedPct}%
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-blue-700">
                            {st.rorLinkedPct}%
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700">
                            {st.svamitvaCardsIssuedM} M
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700">
                            {st.disputeVelocityMonths} mos
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setPrimaryRegion(st.state);
                                setActiveTab(1);
                                toast.info(`Loaded detailed analytics for ${st.state}`);
                              }}
                              className="focus-ring px-2.5 py-1 text-[11px] font-bold text-[#1E293B] border border-slate-300 bg-white hover:bg-slate-100 transition-colors"
                            >
                              Inspect State
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap justify-between items-center">
                <span>Showing {filteredNlgiStates.length} of 35 States &amp; Union Territories</span>
                <span>Source: Department of Land Resources (DoLR) MIS &amp; SVAMITVA Dashboard</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DoLR Executive Policy Dossier Modal (PS 26019 Item 11) */}
      {showExecutiveDossier && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="DoLR Executive Policy Dossier"
          onClick={() => setShowExecutiveDossier(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white border border-slate-400 shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-dolr-dossier"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowExecutiveDossier(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 border border-slate-300 bg-white hover:bg-slate-100 transition-colors print:hidden"
              aria-label="Close dossier"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Official Government of India Header */}
            <div className="border-b-2 border-[#1E293B] pb-5 mb-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#B45309]">Satyameva Jayate</span>
              </div>
              <h1 className="font-serif text-2xl font-bold uppercase tracking-wide text-[#1E293B]">
                Government of India
              </h1>
              <h2 className="text-sm font-semibold uppercase text-slate-700 tracking-wider">
                Ministry of Rural Development · Department of Land Resources (DoLR)
              </h2>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] font-mono text-slate-600">
                <span>REF: DoLR-NLGI-2025/EXECUTIVE-BRIEF</span>
                <span className="font-bold text-rose-800 uppercase">Cabinet Decision Dossier</span>
                <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Executive Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="border border-slate-300 p-3 bg-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Cadastral Digitization</p>
                <p className="font-mono text-xl font-bold text-[#1E293B] mt-0.5">94.2%</p>
                <p className="text-[10px] text-emerald-700 font-semibold">+18.4% since 2020</p>
              </div>
              <div className="border border-slate-300 p-3 bg-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">SVAMITVA Cards</p>
                <p className="font-mono text-xl font-bold text-emerald-700 mt-0.5">1.68 Crore</p>
                <p className="text-[10px] text-slate-600">Property Cards Issued</p>
              </div>
              <div className="border border-slate-300 p-3 bg-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Institutional Credit</p>
                <p className="font-mono text-xl font-bold text-blue-700 mt-0.5">₹ 48,200 Cr</p>
                <p className="text-[10px] text-slate-600">Rural Mortgages Unlocked</p>
              </div>
              <div className="border border-slate-300 p-3 bg-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Dispute Disposal</p>
                <p className="font-mono text-xl font-bold text-amber-700 mt-0.5">-38.5%</p>
                <p className="text-[10px] text-slate-600">Reduction in New Writs</p>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="mb-6 space-y-2 text-xs text-slate-700 leading-relaxed">
              <h3 className="font-serif text-sm font-bold text-[#1E293B] uppercase tracking-wider border-b border-slate-200 pb-1">
                1. Executive Summary &amp; Inter-Ministerial Overview
              </h3>
              <p>
                Pursuant to the mandate of the <strong>National Land Modernization Program (DILRMP)</strong> and the <strong>SVAMITVA Drone Resurvey Scheme</strong>, this Executive Policy Dossier evaluates structural reforms across all 35 States and Union Territories. Accelerated RoR-SRO computerization and CORS baseline station deployments have established single-truth geospatial property boundaries across 640 districts.
              </p>
              <p>
                State performance exhibits divergence: Top-tier states like <strong>Maharashtra (89.4)</strong>, <strong>Karnataka (88.1)</strong>, and <strong>Gujarat (86.7)</strong> have accomplished 96%+ cadastral georeferencing and automated deed registration. Conversely, hill states and North-Eastern territories require specialized technical assistance to overcome terrain-induced GPS attenuation.
              </p>
            </div>

            {/* Section 2: NLGI Top 5 vs Bottom 5 Performance Matrix */}
            <div className="mb-6 space-y-2">
              <h3 className="font-serif text-sm font-bold text-[#1E293B] uppercase tracking-wider border-b border-slate-200 pb-1">
                2. National Land Governance Index (NLGI) Benchmarks: Top vs Bottom Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Top 5 */}
                <div className="border border-emerald-300 bg-emerald-50/30 p-3">
                  <p className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" /> Top 5 Front-Runner States
                  </p>
                  <div className="space-y-1.5">
                    {nlgiStateLeaderboard.slice(0, 5).map(s => (
                      <div key={s.state} className="flex items-center justify-between border-b border-emerald-100 pb-1">
                        <span className="font-semibold text-slate-800">#{s.rank} {s.state}</span>
                        <span className="font-mono font-bold text-emerald-700">{s.compositeScore} pts ({s.cadastralDigitizedPct}% Cadastre)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom 5 */}
                <div className="border border-amber-300 bg-amber-50/30 p-3">
                  <p className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Bottom 5 Special-Focus Aspirant States
                  </p>
                  <div className="space-y-1.5">
                    {nlgiStateLeaderboard.slice(-5).map(s => (
                      <div key={s.state} className="flex items-center justify-between border-b border-amber-100 pb-1">
                        <span className="font-semibold text-slate-800">#{s.rank} {s.state}</span>
                        <span className="font-mono font-bold text-amber-700">{s.compositeScore} pts ({s.cadastralDigitizedPct}% Cadastre)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Actionable Policy Directives */}
            <div className="mb-6 space-y-2 text-xs text-slate-700">
              <h3 className="font-serif text-sm font-bold text-[#1E293B] uppercase tracking-wider border-b border-slate-200 pb-1">
                3. High-Priority Cabinet Directives for FY 2025–26
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] leading-relaxed">
                <li>
                  <strong>Mandatory e-Courts &amp; ULPIN Interoperability:</strong> Mandate civil courts to verify parcel 14-digit ULPIN (Bhu-Aadhaar) through DoLR API before granting interim land title injunctions, curtailing frivolous boundary litigation.
                </li>
                <li>
                  <strong>Universal CORS Densification:</strong> Authorize ₹420 Cr capital outlay under Survey of India to establish 180 additional Continuously Operating Reference Stations across Himachal Pradesh, Uttarakhand, and North-Eastern States.
                </li>
                <li>
                  <strong>Statutory 45-Day Conversion Limit:</strong> Standardize state Land Revenue Codes to mandate automated deeming of agricultural-to-non-agricultural zoning clearances after 45 days of un-objected application.
                </li>
                <li>
                  <strong>Automated Encroachment Satellite Audits:</strong> Enable weekly NRSC Bhuvan spectral alerts to District Collectors upon unauthorized deforestation or built-up encroachment on public revenue commons.
                </li>
              </ol>
            </div>

            {/* Signatures & Actions */}
            <div className="border-t-2 border-slate-300 pt-5 flex items-center justify-between text-xs">
              <div className="text-slate-500 font-mono text-[10px]">
                <p>APPROVED FOR SECRETARIAT CIRCULATION</p>
                <p>Department of Land Resources · New Delhi</p>
              </div>

              <div className="flex gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="focus-ring flex items-center gap-1.5 bg-[#1E293B] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / Save as Official PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
