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

  const [dashboardData, setDashboardData] = useState<any | null>(null);

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
      </div>
    </PageFrame>
  );
}
