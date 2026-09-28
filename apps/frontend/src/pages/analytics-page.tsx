import { useState } from 'react';
import { AlertCircle, ChevronRight, Download, Printer, Table2 } from 'lucide-react';
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

// Theme Colors
const colors = {
  navy: '#1E293B',
  green: '#15803D',
  amber: '#B45309',
  crimson: '#B91C1C',
  slate: '#64748B',
  grid: '#E2E8F0',
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

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-slate-300 bg-white ${className}`}>
      <div className="border-b border-slate-200 px-4 py-3 md:px-5">
        <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [primaryRegion, setPrimaryRegion] = useState('Maharashtra');
  const [comparisonRegion, setComparisonRegion] = useState('Madhya Pradesh');

  const tabs = [
    'Research Output',
    'Policy Performance',
    'Land Use Trends',
    'Climate Resilience',
    'Dispute Statistics',
    'Project Outcomes',
    'Geospatial Insights',
  ];

  const showAnomaly = primaryRegion === 'Maharashtra' || comparisonRegion === 'Maharashtra';

  return (
    <PageFrame
      kicker="Programme intelligence / official view"
      title="Analytics & Decision-Support"
      description="Compare policy performance, cadastral modernization progress, and land dispute resolution metrics across participating regions."
      actions={
        <div className="flex gap-2">
          <button className="focus-ring flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" type="button">
            <Table2 className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button className="focus-ring flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" type="button">
            <Printer className="h-3.5 w-3.5" /> Print Briefing
          </button>
          <button className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800" type="button">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </button>
        </div>
      }
    >
      {showAnomaly && activeTab === 4 && (
        <div className="mb-6 flex items-start gap-3 border-l-4 border-[#B91C1C] bg-[#FEF2F2] p-4 text-sm text-[#7F1D1D]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" />
          <div>
            <p className="font-bold text-[#B91C1C]">Official Anomaly Warning: Abnormal 34% spike in agricultural boundary disputes detected in District Pune over Q3 2025.</p>
            <p className="mt-1 font-medium">Recommended Action: Prioritize drone resurvey and cadastral verification.</p>
          </div>
        </div>
      )}

      <div className="mb-6 border border-slate-300 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700">Primary Region</label>
            <select
              className="focus-ring mt-1 block w-full border border-slate-300 px-3 py-2 text-sm"
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
              className="focus-ring mt-1 block w-full border border-slate-300 px-3 py-2 text-sm"
              value={comparisonRegion}
              onChange={(e) => setComparisonRegion(e.target.value)}
            >
              {initialStates.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap border-b border-slate-300">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-3 text-xs font-bold focus-ring transition-colors ${
              activeTab === idx
                ? 'border-b-2 border-[#1E293B] text-[#1E293B] bg-slate-50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-b-2 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 0 && (
          <Panel title="Research Output Trends">
            <div className="h-[400px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="output" name="Research Publications" fill={colors.navy} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {activeTab === 1 && (
          <Panel title="Policy Performance & Compliance">
            <div className="h-[400px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="compliance" name="State Compliance Score (%)" stroke={colors.green} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {activeTab === 2 && (
          <Panel title="Land Use Change Trends (Aggregated)">
            <div className="h-[400px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="agricultural" name="Agricultural (%)" stackId="1" stroke={colors.amber} fill={colors.amber} />
                  <Area type="monotone" dataKey="nonAgricultural" name="Non-Agricultural (%)" stackId="1" stroke={colors.crimson} fill={colors.crimson} />
                  <Area type="monotone" dataKey="forest" name="Forest Cover (%)" stackId="1" stroke={colors.green} fill={colors.green} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {activeTab === 3 && (
          <Panel title="Climate Resilience Metrics">
            <div className="h-[400px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={climateRadarData}>
                  <PolarGrid stroke={colors.grid} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: colors.slate, fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.slate, fontSize: 10 }} />
                  <Radar name={primaryRegion} dataKey="A" stroke={colors.navy} fill={colors.navy} fillOpacity={0.6} />
                  <Radar name={comparisonRegion} dataKey="B" stroke={colors.amber} fill={colors.amber} fillOpacity={0.6} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {activeTab === 4 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="National Dispute Volume Trends">
              <div className="h-[350px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="pending" name="Pending Suits" fill={colors.crimson} radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="resolved" name="Resolved Suits" stroke={colors.green} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title={`Comparative Suit Load: ${primaryRegion} vs ${comparisonRegion}`}>
              <div className="h-[350px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeStateData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: colors.navy, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Maharashtra" name={primaryRegion} fill={colors.navy} radius={[0, 2, 2, 0]} />
                    <Bar dataKey="Madhya Pradesh" name={comparisonRegion} fill={colors.amber} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 5 && (
          <Panel title="Project Implementation Outcomes (SVAMITVA & DILRMP)">
            <div className="grid gap-8 p-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>SVAMITVA Drone Surveys (Target vs Achieved)</span>
                    <span>85%</span>
                  </div>
                  <div className="h-3 bg-slate-100 overflow-hidden rounded-sm">
                    <div className="h-full bg-[#15803D]" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>DILRMP Digitization Funds Utilized</span>
                    <span>62%</span>
                  </div>
                  <div className="h-3 bg-slate-100 overflow-hidden rounded-sm">
                    <div className="h-full bg-[#B45309]" style={{ width: '62%' }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>Modern Record Rooms Established</span>
                    <span>91%</span>
                  </div>
                  <div className="h-3 bg-slate-100 overflow-hidden rounded-sm">
                    <div className="h-full bg-[#1E293B]" style={{ width: '91%' }} />
                  </div>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsTrendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="target" name="Budget Allocated (Cr)" fill={colors.navy} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="achieved" name="Budget Utilized (Cr)" fill={colors.green} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Panel>
        )}

        {activeTab === 6 && (
          <Panel title="Geospatial Insights (Cadastral Digitization %)">
            <div className="h-[400px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeStateData.filter(d => d.category.includes('%'))} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: colors.slate }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: colors.navy, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', fontSize: '12px', borderRadius: '0' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Maharashtra" name={primaryRegion} fill={colors.navy} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="Madhya Pradesh" name={comparisonRegion} fill={colors.amber} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
      </div>
    </PageFrame>
  );
}
