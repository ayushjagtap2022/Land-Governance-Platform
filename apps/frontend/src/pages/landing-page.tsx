import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Database,
  FileCheck2,
  Globe2,
  Layers,
  Lightbulb,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UsersRound,
  Zap,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useRole } from '@/context/RoleContext';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { activeRole } = useRole();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/repository?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/repository');
    }
  };

  const flagshipSchemes = [
    {
      code: 'SVAMITVA',
      name: 'SVAMITVA Scheme',
      ministry: 'Ministry of Panchayati Raj',
      desc: 'Drone-enabled sub-5cm spatial survey across rural inhabited (Abadi) areas with Gram Sabha ground-truthing and legal property card issuance.',
      badge: 'CORS Drone Survey',
      stat: '189,981+ Cards Issued',
      href: '/repository?search=SVAMITVA',
    },
    {
      code: 'DILRMP',
      name: 'Digital India Land Records Modernization',
      ministry: 'Department of Land Resources',
      desc: 'Seamless linkage between textual Record of Rights (RoR) and spatial cadastral parcels with Modern Record Rooms across all collectorates.',
      badge: 'Spatial-Textual Sync',
      stat: '89% Digitzation',
      href: '/repository?search=DILRMP',
    },
    {
      code: 'RFCTLARR',
      name: 'RFCTLARR Act, 2013',
      ministry: 'Ministry of Rural Development',
      desc: 'National statutory benchmark for transparent land acquisition, social impact assessment (SIA), fair market compensation, and R&R protection.',
      badge: 'Statutory Protection',
      stat: 'Pan-India Benchmark',
      href: '/repository?search=RFCTLARR',
    },
    {
      code: 'NITI-LEASING',
      name: 'Model Agricultural Land Leasing Act',
      ministry: 'NITI Aayog',
      desc: 'Legal mechanism enabling institutional credit and insurance for tenant farmers while safeguarding landholders title from adverse possession.',
      badge: 'Tenancy Security',
      stat: '14 States Adopted',
      href: '/repository?search=Leasing',
    },
  ];

  const platformPillars = [
    {
      title: 'Central Policy & Statutory Registry',
      hindi: 'नीति एवं राजपत्र अभिलेखागार',
      icon: BookOpen,
      href: '/repository',
      color: 'from-blue-600 to-sky-700',
      badge: '400+ Indexed Gazettes',
      desc: 'Search, review and cite verified state and national revenue acts, drone survey rules, and statutory circulars with automated Tesseract OCR and NLP metadata extraction.',
      points: [
        'Verified citations with page-level reference hashes',
        'Multi-format support: PDF, CSV, GeoJSON, Shapefiles',
        'State-specific and Pan-India legal instruments',
      ],
    },
    {
      title: 'Geospatial GIS Cadastral Engine',
      hindi: 'भू-स्थानिक भूकर दृश्य इंजन',
      icon: Layers,
      href: '/map',
      color: 'from-emerald-600 to-teal-800',
      badge: '640 Indian Districts',
      desc: 'High-precision spatial visualization engine with sub-5cm survey vectors, ISRO Bhuvan satellite remote sensing, dispute density heatmaps, and dynamic AOI drawing.',
      points: [
        '1,313 satellite remote sensing polygons and LULC data',
        'Real-time distance measurement & polygon drawing',
        'Interactive district factsheet drawer with climate risks',
      ],
    },
    {
      title: 'AI Policy Assistant & RAG Engine',
      hindi: 'एआई नीति परामर्श एवं अनुसंधान सहायक',
      icon: Bot,
      href: '/assistant',
      color: 'from-amber-600 to-yellow-800',
      badge: 'Gemini 2.5 Flash Grounded',
      desc: 'Ask complex land reform, ceiling limit, and mutation workflow questions and receive structured, traceable answers grounded in verified Gazette records.',
      points: [
        'Zero hallucination with verified statutory citations',
        'Pre-curated research chips for instant exploration',
        'Direct export of executive policy research briefs',
      ],
    },
    {
      title: 'Cross-Document Policy Synthesis',
      hindi: 'बहु-दस्तावेज़ तुलनात्मक नीति संश्लेषण',
      icon: Scale,
      href: '/synthesis',
      color: 'from-indigo-600 to-blue-800',
      badge: 'Multi-Doc Benchmarking',
      desc: 'Select 2 to 5 state or national policy instruments to generate an automated comparative matrix analyzing Core Objectives, Consensus Points, Policy Gaps, and DoLR Next Steps.',
      points: [
        'Up to 5 documents compared simultaneously',
        'Highlights inter-state statutory divergences',
        'Actionable recommendations tailored for DoLR',
      ],
    },
    {
      title: 'Machine-Learning Scenario Simulator',
      hindi: 'मशीन लर्निंग परिदृश्य अनुकरण',
      icon: SlidersHorizontal,
      href: '/simulate',
      color: 'from-purple-600 to-indigo-800',
      badge: '3 Scikit-Learn Models',
      desc: 'Predictive land governance simulations backed by 181,000+ historical land-use records (1998-2024), climate vulnerability regressors, and dispute risk estimators.',
      points: [
        'Historical agricultural vs urban classification (1998–2024)',
        'What-if policy simulations for irrigation & industrial shifts',
        'Confidence intervals and feature importance charts',
      ],
    },
    {
      title: 'Innovation Portal & Citizen Workspace',
      hindi: 'नवाचार मंच एवं नागरिक सहभागिता',
      icon: Lightbulb,
      href: '/innovation',
      color: 'from-rose-600 to-pink-800',
      badge: 'Collaborative Ideation',
      desc: 'Transparent public participation hub for hackathon submissions, citizen grievance tracking, research workspaces, and innovative land-administration solutions.',
      points: [
        'SIH PS 26019 solution submissions and tracking',
        'Public-Official transparency workflow',
        'Multi-persona access control across 5 tiers',
      ],
    },
  ];

  const featuredDistricts = [
    { name: 'Pune', state: 'Maharashtra', modernization: 88, villages: '1,874', risk: 'Moderate', color: '#287449' },
    { name: 'Chandigarh', state: 'Chandigarh UT', modernization: 89, villages: '1,407', risk: 'Low', color: '#287449' },
    { name: 'Bhopal', state: 'Madhya Pradesh', modernization: 72, villages: '1,542', risk: 'High', color: '#b23b32' },
    { name: 'Lucknow', state: 'Uttar Pradesh', modernization: 69, villages: '2,106', risk: 'Moderate', color: '#9b6300' },
    { name: 'Bengaluru Urban', state: 'Karnataka', modernization: 91, villages: '1,026', risk: 'Low', color: '#287449' },
  ];

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1e32] via-[#132f4c] to-[#1c3e60] text-white">
        {/* Subtle Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Tricolor Accent Stripe at Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-[#ffffff] to-[#138808]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20 lg:py-24">
          <div className="flex flex-col items-center text-center">
            {/* National Platform Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#f2b134] animate-pulse" />
              <span>National Digital Platform for Land Governance · SIH PS 26019</span>
            </div>

            {/* Bilingual Ministry Identification */}
            <p className="font-serif text-xs md:text-sm tracking-widest text-[#f2b134] uppercase font-bold">
              भारत सरकार · ग्रामीण विकास मंत्रालय · भू-संसाधन विभाग (DoLR)
            </p>

            {/* Hero Main Heading */}
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl max-w-5xl leading-tight">
              Unified Spatial Intelligence &amp; Verified Policy Records for India
            </h1>

            {/* Subheading */}
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
              Empowering the Department of Land Resources (DoLR), state revenue administrations, and citizens with sub-5cm cadastral mapping, Gemini RAG policy synthesis, and machine learning land-use intelligence across 640 Indian districts.
            </p>

            {/* Hero Interactive Search Bar */}
            <form onSubmit={handleHeroSearch} className="mt-8 w-full max-w-2xl">
              <div className="relative flex items-center rounded-xs bg-white p-1.5 shadow-2xl">
                <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search policies, acts (RFCTLARR, SVAMITVA, DILRMP), or districts (Chandigarh, Pune)..."
                  className="w-full bg-transparent px-3 py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="focus-ring shrink-0 bg-[#244562] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#132f4c] transition-colors"
                >
                  Search Registry
                </button>
              </div>
            </form>

            {/* Primary Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/map"
                className="focus-ring flex items-center gap-2 border border-[#f2b134] bg-[#f2b134] px-5 py-3 text-xs md:text-sm font-bold text-[#132f4c] hover:bg-[#e0a22a] transition-all shadow-lg"
              >
                <Layers className="h-4 w-4" />
                Launch Geospatial GIS Engine
              </Link>
              <Link
                href="/repository"
                className="focus-ring flex items-center gap-2 border border-white/40 bg-white/10 px-5 py-3 text-xs md:text-sm font-bold text-white hover:bg-white/20 backdrop-blur-xs transition-all"
              >
                <BookOpen className="h-4 w-4" />
                Browse Policy Repository
              </Link>
              <Link
                href="/assistant"
                className="focus-ring flex items-center gap-2 border border-white/20 bg-slate-800/60 px-5 py-3 text-xs md:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Sparkles className="h-4 w-4 text-[#f2b134]" />
                Ask AI Assistant
              </Link>
            </div>
          </div>

          {/* Key National Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 gap-3 border-t border-white/15 pt-8 sm:grid-cols-3 lg:grid-cols-5">
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-[#f2b134]">640+</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">Indian Districts Profiled</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-400">1.4M+</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">Revenue Villages in DILRMP</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-sky-400">89%</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">Cadastral Digitization</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-amber-400">&lt; 5 cm</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">CORS Drone Survey GSD</p>
            </div>
            <div className="col-span-2 border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs sm:col-span-1">
              <p className="font-mono text-2xl md:text-3xl font-bold text-rose-300">189K+</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">SVAMITVA Property Cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship National Frameworks Section */}
      <section className="border-b border-slate-200 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Integrated National Initiatives</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#132f4c]">
                Key Statutory Programmes &amp; Standard Operating Frameworks
              </h2>
              <p className="mt-2 max-w-2xl text-xs md:text-sm text-slate-600">
                The platform harmonizes central schemes, state revenue gazettes, and remote sensing standards into an accountable evidence base.
              </p>
            </div>
            <Link
              href="/repository"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244562] hover:text-[#132f4c] underline underline-offset-4"
            >
              View all 400+ indexed instruments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flagshipSchemes.map((scheme) => (
              <div
                key={scheme.code}
                className="group relative flex flex-col justify-between border border-slate-200 bg-slate-50/50 p-5 hover:border-[#244562] hover:bg-white hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#244562] bg-[#eef4fa] px-2 py-0.5 border border-[#b9cce0]">
                      {scheme.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      {scheme.stat}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#132f4c] group-hover:text-[#244562]">
                    {scheme.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                    {scheme.ministry}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    {scheme.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <Link
                    href={scheme.href}
                    className="flex items-center justify-between text-xs font-bold text-[#244562] group-hover:underline"
                  >
                    <span>Read Statutory Guidelines</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Pillars & Architecture Section */}
      <section className="bg-[#f1f5f9] py-14 md:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="section-kicker">Platform Architecture · 6 Core Pillars</p>
            <h2 className="font-serif text-3xl font-bold text-[#132f4c] md:text-4xl">
              Engineered for Public Sector Accountability
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              A comprehensive modular architecture combining spatial GIS analysis, verified document indexing, Gemini RAG legal research, and machine-learning scenario forecasting.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex flex-col justify-between border border-slate-300 bg-white p-6 shadow-xs hover:border-[#244562] hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="border border-slate-200 bg-[#eef4fa] p-3 text-[#244562]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold text-[#244562] border border-[#b9cce0] bg-[#eef4fa] px-2.5 py-1">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-lg font-bold text-[#132f4c]">
                      {pillar.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {pillar.hindi}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                      {pillar.desc}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      {pillar.points.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Link
                      href={pillar.href}
                      className="focus-ring flex items-center justify-center gap-2 bg-[#244562] px-4 py-2 text-xs font-bold text-white hover:bg-[#132f4c] transition-colors"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cadastral District Inspection Spotlight */}
      <section className="bg-white py-12 md:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-8">
            <div>
              <p className="section-kicker">Spatial Data Live Feed</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#132f4c]">
                District Cadastral Modernization Spotlights
              </h2>
              <p className="mt-1.5 text-xs md:text-sm text-slate-600">
                Explore drone resurvey milestones and drought vulnerability profiles across demonstration jurisdictions.
              </p>
            </div>
            <Link
              href="/map"
              className="focus-ring inline-flex items-center gap-2 bg-[#244562] px-4 py-2 text-xs font-bold text-white hover:bg-[#132f4c]"
            >
              <MapPin className="h-3.5 w-3.5" />
              Open Interactive Full Map
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featuredDistricts.map((d) => (
              <div
                key={d.name}
                className="border border-slate-200 bg-slate-50/50 p-4 hover:border-[#244562] hover:bg-white transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-base font-bold text-[#132f4c]">{d.name}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      d.risk === 'High' ? 'bg-[#b23b32]' : d.risk === 'Moderate' ? 'bg-[#f2b134]' : 'bg-[#287449]'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{d.state}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modernization</span>
                    <span className="font-mono font-bold text-[#287449]">{d.modernization}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-xs overflow-hidden">
                    <div className="h-full bg-[#287449]" style={{ width: `${d.modernization}%` }} />
                  </div>
                  <div className="flex justify-between pt-1 text-[11px]">
                    <span className="text-slate-500">Revenue Villages</span>
                    <span className="font-mono font-bold text-slate-800">{d.villages}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <Link
                    href={`/repository?search=${encodeURIComponent(d.name)}`}
                    className="flex items-center justify-between text-[11px] font-bold text-[#244562] hover:underline"
                  >
                    <span>View Gazette Records</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Personas Banner */}
      <section className="bg-[#132f4c] py-12 md:py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#f2b134]">
                <UsersRound className="h-3.5 w-3.5" />
                Multi-Tier Governance Personas
              </div>
              <h2 className="mt-3 font-serif text-2xl md:text-4xl font-bold tracking-tight">
                Tailored Workspaces for Every Stakeholder
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-2xl">
                The platform adapts to your administrative role. Use the Demo Persona Switcher in the top header to preview access levels across Public Citizens, Legal Researchers, Ministry Officials, and Super Administrators.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border border-white/15 bg-white/5 p-3">
                  <p className="text-xs font-bold text-[#f2b134]">Public</p>
                  <p className="mt-1 text-[10px] text-slate-300">Open Gazettes &amp; Maps</p>
                </div>
                <div className="border border-white/15 bg-white/5 p-3">
                  <p className="text-xs font-bold text-[#f2b134]">Researcher</p>
                  <p className="mt-1 text-[10px] text-slate-300">AI Synthesis &amp; Notes</p>
                </div>
                <div className="border border-white/15 bg-white/5 p-3">
                  <p className="text-xs font-bold text-[#f2b134]">Official</p>
                  <p className="mt-1 text-[10px] text-slate-300">Simulator &amp; Analytics</p>
                </div>
                <div className="border border-white/15 bg-white/5 p-3">
                  <p className="text-xs font-bold text-[#f2b134]">Admin</p>
                  <p className="mt-1 text-[10px] text-slate-300">Audit Logs &amp; Registry</p>
                </div>
              </div>
            </div>

            <div className="border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-[#f2b134]">Current Persona: {activeRole}</p>
              <h3 className="mt-2 text-lg font-bold text-white">Ready to start exploring?</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Access verified land records or inspect state-level survey coverage immediately.
              </p>
              <div className="mt-5 space-y-2.5">
                <Link
                  href="/repository"
                  className="flex w-full items-center justify-center gap-2 bg-[#f2b134] px-4 py-2.5 text-xs font-bold text-[#132f4c] hover:bg-[#e0a22a] transition-colors"
                >
                  Enter Central Repository
                </Link>
                <Link
                  href="/map"
                  className="flex w-full items-center justify-center gap-2 border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                >
                  Open Geospatial Engine
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Government Footer */}
      <footer className="border-t border-slate-300 bg-[#eef2f5] py-8 text-xs text-slate-600">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="font-bold text-[#132f4c]">
                National Digital Platform for Land Governance (SIH PS 26019)
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Department of Land Resources (DoLR), Ministry of Rural Development · Government of India
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-[#244562]">
              <Link href="/repository" className="hover:underline">Repository</Link>
              <Link href="/map" className="hover:underline">GIS Map</Link>
              <Link href="/assistant" className="hover:underline">AI Assistant</Link>
              <Link href="/synthesis" className="hover:underline">Policy Synthesis</Link>
              <Link href="/simulate" className="hover:underline">ML Simulator</Link>
              <Link href="/innovation" className="hover:underline">Innovation Portal</Link>
              <Link href="/developers" className="hover:underline">API Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
