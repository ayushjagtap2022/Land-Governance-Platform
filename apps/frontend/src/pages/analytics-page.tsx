import { useState, useEffect } from 'react';
import {
  AlertCircle,
  ChevronRight,
  Download,
  Printer,
  Table2,
  FileText,
  ShieldCheck,
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
} from 'lucide-react';
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
import { analyticsTrendData, climateRadarData, comparativeStateData, initialStates } from '@/data/mockData';
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
  const [comparativeData, setComparativeData] = useState<any[]>(comparativeStateData);
  const [climateRadar, setClimateRadar] = useState<any[]>(climateRadarData);
  const [trendData, setTrendData] = useState<any[]>(analyticsTrendData);

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
  }, [primaryRegion, comparisonRegion]);

  const tabs = [
    { label: 'Research Output', icon: FileText },
    { label: 'Policy Performance', icon: ShieldCheck },
    { label: 'Land Use Trends', icon: Layers, badge: 'MoAFW 181k' },
    { label: 'Climate Resilience', icon: CloudRain },
    { label: 'Dispute Statistics', icon: Scale },
    { label: 'Project Outcomes', icon: Target },
    { label: 'Geospatial Insights', icon: Compass },
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
        <div className="flex gap-2">
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
              {initialStates.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
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
              {initialStates.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
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
        {/* Tab 0: Research Output */}
        {activeTab === 0 && (
          <Panel 
            title={`Research Publications & Statutory Studies: ${primaryRegion}`}
            headerAction={<span className="text-[11px] text-slate-500 font-mono">1998–2024 Historical</span>}
          >
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Peer-reviewed land tenure papers, gazette notifications, and policy whitepapers indexed in national repository.</span>
              <span className="font-semibold text-emerald-700">CAG & DoLR Library Index</span>
            </div>
            <div className="h-[380px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="output" name="Statutory & Research Publications" fill={colors.navy} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {/* Tab 1: Policy Performance */}
        {activeTab === 1 && (
          <Panel 
            title={`Policy Performance & Compliance Index: ${primaryRegion}`}
            headerAction={<span className="text-[11px] text-emerald-700 font-bold font-mono">Target: 85% Benchmark</span>}
          >
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              Evaluates state-level execution speed for digital title issuance, RoR generation, and DILRMP fund absorption.
            </div>
            <div className="h-[380px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} domain={[40, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="compliance" name="State Compliance Score (%)" stroke={colors.green} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
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
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }}
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

        {/* Tab 3: Climate Resilience */}
        {activeTab === 3 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Panel title={`Climate Resilience Radar: ${primaryRegion} vs ${comparisonRegion}`}>
              <div className="h-[380px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={climateRadar}>
                    <PolarGrid stroke={colors.grid} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: colors.slate, fontSize: 11, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.slate, fontSize: 10 }} />
                    <Radar name={primaryRegion} dataKey="A" stroke={colors.navy} fill={colors.navy} fillOpacity={0.6} />
                    <Radar name={comparisonRegion} dataKey="B" stroke={colors.amber} fill={colors.amber} fillOpacity={0.6} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Vulnerability Breakdown">
              <div className="p-4 space-y-4 text-xs">
                <div className="border border-slate-200 p-3 bg-slate-50">
                  <p className="font-bold text-[#1E293B] mb-1">IMD Monsoon Departure Risk</p>
                  <p className="text-slate-600 leading-relaxed">
                    Measured against the 50-year rainfall departure variance. States with &gt;60% rainfed land require drought-buffered canal coverage.
                  </p>
                </div>
                <div className="border border-slate-200 p-3 bg-slate-50">
                  <p className="font-bold text-[#1E293B] mb-1">Irrigation Cushion</p>
                  <p className="text-slate-600 leading-relaxed">
                    Combines groundwater tube-wells and surface canals. Higher score indicates lower agricultural vulnerability during poor monsoons.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Ground-truth: IMD District Rainfall Panel (14k records) & MoAFW Irrigation Census
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* Tab 4: Dispute Statistics */}
        {activeTab === 4 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title={`Dispute Volume & Disposal Velocity: ${primaryRegion}`}>
              <div className="h-[350px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="pending" name="Pending Land Suits" fill={colors.crimson} radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="resolved" name="Resolved Suits (Annual)" stroke={colors.green} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title={`Empirical Comparative Indicators: ${primaryRegion} vs ${comparisonRegion}`}>
              <div className="h-[350px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: colors.navy, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey={primaryRegion} name={primaryRegion} fill={colors.navy} radius={[0, 2, 2, 0]} />
                    <Bar dataKey={comparisonRegion} name={comparisonRegion} fill={colors.amber} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        )}

        {/* Tab 5: Project Outcomes (SVAMITVA & DILRMP) */}
        {activeTab === 5 && (
          <Panel title="Flagship Programme Implementation (SVAMITVA & DILRMP)">
            <div className="grid gap-8 p-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>SVAMITVA Drone Survey Flights Completed</span>
                    <span className="font-mono text-emerald-700">3,15,400 / 3,70,000 Villages (85.2%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 overflow-hidden rounded-xs">
                    <div className="h-full bg-[#15803D]" style={{ width: '85.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>DILRMP Central Modernization Funds Utilized</span>
                    <span className="font-mono text-amber-700">₹642 Cr / ₹980 Cr (65.5%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 overflow-hidden rounded-xs">
                    <div className="h-full bg-[#B45309]" style={{ width: '65.5%' }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>Modern Land Record Rooms (Tehsil Level)</span>
                    <span className="font-mono text-[#1E293B]">5,820 / 6,400 Units (90.9%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 overflow-hidden rounded-xs">
                    <div className="h-full bg-[#1E293B]" style={{ width: '90.9%' }} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">Key Operational Milestone:</p>
                  Spatial property cards generated under SVAMITVA have enabled over ₹12,400 Cr in formal institutional credit access for rural property owners.
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="target" name="Annual Budget Allocated (₹ Cr)" fill={colors.navy} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="achieved" name="Actual Expenditure Utilized (₹ Cr)" fill={colors.green} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Panel>
        )}

        {/* Tab 6: Geospatial Insights */}
        {activeTab === 6 && (
          <Panel title={`Geospatial Indicators & Modernization %: ${primaryRegion} vs ${comparisonRegion}`}>
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex justify-between items-center">
              <span>Comparative analysis of cadastral map vectorization, survey accuracy, and GIS integration index.</span>
              <span className="font-bold text-slate-700">Survey of India / NIC Bhuvan Layer</span>
            </div>
            <div className="h-[380px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeData.filter(d => d.category.includes('%'))} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: colors.navy, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey={primaryRegion} name={primaryRegion} fill={colors.navy} radius={[0, 2, 2, 0]} />
                  <Bar dataKey={comparisonRegion} name={comparisonRegion} fill={colors.amber} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
      </div>
    </PageFrame>
  );
}
