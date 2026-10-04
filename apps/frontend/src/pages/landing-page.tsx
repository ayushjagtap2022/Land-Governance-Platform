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
import { toast } from 'sonner';
import { useRole } from '@/context/RoleContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import { StateEmblem } from '@/components/common/StateEmblem';
import { DigitalIndiaLogo, AzadiMahotsavLogo, GIGWBadge, NICLogo, IndiaGovBadge } from '@/components/common/GovLogos';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { activeRole } = useRole();
  const { isHindi, t } = useLanguage();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUrl = searchQuery.trim()
      ? `/repository?search=${encodeURIComponent(searchQuery.trim())}`
      : '/repository';

    if (!isAuthenticated) {
      toast.error(isHindi ? 'साइन इन आवश्यक है' : 'Sign In Required', {
        description: isHindi
          ? 'भूमि अभिलेख एवं राजपत्र भंडार खोजने के लिए कृपया पहले साइन इन करें।'
          : 'Please sign in to access and search the National Land Governance Repository.',
      });
      setLocation(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    setLocation(targetUrl);
  };

  const flagshipSchemes = [
    {
      code: 'SVAMITVA',
      name: 'SVAMITVA Scheme',
      hindiName: 'स्वामित्व योजना',
      ministry: 'Ministry of Panchayati Raj',
      hindiMinistry: 'पंचायती राज मंत्रालय',
      desc: 'High-precision drone surveys of rural areas to create accurate property maps and issue legal property ownership cards to village residents.',
      hindiDesc: 'सटीक संपत्ति मानचित्र तैयार करने और कानूनी स्वामित्व कार्ड जारी करने हेतु ग्रामीण क्षेत्रों का ड्रोन सर्वेक्षण।',
      badge: 'Drone-Based Survey',
      hindiBadge: 'ड्रोन सर्वेक्षण',
      stat: '189,981+ Cards Issued',
      href: '/repository?search=SVAMITVA',
    },
    {
      code: 'DILRMP',
      name: 'Digital India Land Records Modernization',
      hindiName: 'डिजिटल इंडिया भू-अभिलेख आधुनिकीकरण (DILRMP)',
      ministry: 'Department of Land Resources',
      hindiMinistry: 'भूमि संसाधन विभाग',
      desc: 'Connecting written land ownership records with digital maps so that every land parcel can be verified online across all districts.',
      hindiDesc: 'लिखित अभिलेखों को डिजिटल मानचित्रों से जोड़ना ताकि प्रत्येक भू-खंड का ऑनलाइन सत्यापन किया जा सके।',
      badge: 'Digital Land Records',
      hindiBadge: 'डिजिटल भू-अभिलेख',
      stat: '89% Digitized',
      href: '/repository?search=DILRMP',
    },
    {
      code: 'RFCTLARR',
      name: 'RFCTLARR Act, 2013',
      hindiName: 'भूमि अर्जन एवं पुनर्वासन अधिनियम, 2013',
      ministry: 'Ministry of Rural Development',
      hindiMinistry: 'ग्रामीण विकास मंत्रालय',
      desc: 'The national law ensuring that land acquisition for public projects is transparent, fair compensation is given, and affected families are properly rehabilitated.',
      hindiDesc: 'पारदर्शी भूमि अर्जन, उचित प्रतिकर का अधिकार तथा प्रभावित परिवारों का समुचित पुनर्वासन सुनिश्चित करने वाला कानून।',
      badge: 'Statutory Protection',
      hindiBadge: 'सांविधिक संरक्षण',
      stat: 'Pan-India Benchmark',
      href: '/repository?search=RFCTLARR',
    },
    {
      code: 'NITI-LEASING',
      name: 'Model Agricultural Land Leasing Act',
      hindiName: 'मॉडल कृषि भूमि पट्टा अधिनियम',
      ministry: 'NITI Aayog',
      hindiMinistry: 'नीति आयोग',
      desc: 'Allows tenant farmers to access bank loans and crop insurance while protecting landowners\' legal rights over their property.',
      hindiDesc: 'भूस्वामियों के अधिकारों की रक्षा करते हुए काश्तकार किसानों को संस्थागत ऋण एवं फसल बीमा तक पहुंच प्रदान करना।',
      badge: 'Tenancy Security',
      hindiBadge: 'काश्तकारी सुरक्षा',
      stat: '14 States Adopted',
      href: '/repository?search=Leasing',
    },
  ];

  const platformPillars = [
    {
      title: 'Policy & Gazette Document Library',
      hindi: 'नीति एवं राजपत्र अभिलेखागार',
      icon: BookOpen,
      href: '/repository',
      color: 'from-blue-600 to-sky-700',
      badge: '400+ Gazette Documents',
      desc: 'Search and browse verified government land laws, gazette notifications, revenue acts, and policy documents from all states and the central government.',
      points: [
        'Every document is verified with traceable page references',
        'Supports PDFs, spreadsheets, and map data files',
        'Covers state-level and national land laws',
      ],
    },
    {
      title: 'Interactive Land Map & GIS Viewer',
      hindi: 'इंटरैक्टिव भू-मानचित्र दर्शक',
      icon: Layers,
      href: '/map',
      color: 'from-emerald-600 to-teal-800',
      badge: '640 Indian Districts',
      desc: 'View land maps of all 640 Indian districts with satellite imagery, land use patterns, dispute hotspots, and drawing tools to mark areas of interest.',
      points: [
        'Satellite images with land use classification data',
        'Measure distances and draw boundaries on the map',
        'View detailed district profiles with risk indicators',
      ],
    },
    {
      title: 'AI-Powered Policy Assistant',
      hindi: 'एआई नीति सहायक',
      icon: Bot,
      href: '/assistant',
      color: 'from-amber-600 to-yellow-800',
      badge: 'AI-Powered Answers',
      desc: 'Ask questions about land laws, ownership transfers, or policy details and get clear answers backed by verified government gazette documents.',
      points: [
        'All answers are backed by real government documents',
        'Quick-start topics to explore common policy questions',
        'Export your research findings as ready-to-share reports',
      ],
    },
    {
      title: 'Compare Policies Side-by-Side',
      hindi: 'नीति तुलना उपकरण',
      icon: Scale,
      href: '/synthesis',
      color: 'from-indigo-600 to-blue-800',
      badge: 'Policy Comparison',
      desc: 'Pick 2 to 5 policy documents and automatically generate a comparison showing key objectives, areas of agreement, gaps, and recommendations.',
      points: [
        'Compare up to 5 documents at once',
        'Highlights differences between state-level policies',
        'Generates actionable recommendations for policy makers',
      ],
    },
    {
      title: 'What-If Policy Simulator',
      hindi: 'नीति अनुकरण उपकरण',
      icon: SlidersHorizontal,
      href: '/simulate',
      color: 'from-purple-600 to-indigo-800',
      badge: '3 AI Prediction Models',
      desc: 'Test different policy scenarios and see predicted effects on land disputes, urban growth, and environmental impact — powered by historical data from 1998 to 2024.',
      points: [
        'Track how land use changed from farms to cities over 25 years',
        'Simulate effects of policy changes on irrigation and industry',
        'View prediction confidence levels and key contributing factors',
      ],
    },
    {
      title: 'Innovation Hub & Public Participation',
      hindi: 'नवाचार मंच एवं नागरिक सहभागिता',
      icon: Lightbulb,
      href: '/innovation',
      color: 'from-rose-600 to-pink-800',
      badge: 'Collaborative Ideation',
      desc: 'A space for citizens and researchers to submit ideas, track grievances, collaborate on projects, and propose innovative solutions for land management.',
      points: [
        'Submit and track solution proposals',
        'Transparent workflow between citizens and officials',
        'Role-based access for different user types',
      ],
    },
  ];

  const featuredDistricts = [
    { name: 'Pune', state: 'Maharashtra', modernization: 88, villages: '1,874', risk: 'Low', color: '#287449' },
    { name: 'Chandigarh', state: 'Chandigarh UT', modernization: 89, villages: '1,407', risk: 'Low', color: '#287449' },
    { name: 'Bhopal', state: 'Madhya Pradesh', modernization: 72, villages: '1,542', risk: 'High', color: '#b23b32' },
    { name: 'Lucknow', state: 'Uttar Pradesh', modernization: 69, villages: '2,106', risk: 'Moderate', color: '#9b6300' },
    { name: 'Bengaluru Urban', state: 'Karnataka', modernization: 91, villages: '1,026', risk: 'Low', color: '#287449' },
  ];

  const getDistrictStatus = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          label: 'Digitization Lagging',
          hindiLabel: 'डिजिटलीकरण धीमा',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-600',
        };
      case 'Moderate':
        return {
          label: 'Review Needed',
          hindiLabel: 'समीक्षा आवश्यक',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500',
        };
      case 'Low':
      default:
        return {
          label: 'On Track',
          hindiLabel: 'प्रगति संतोषजनक',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-600',
        };
    }
  };

  type RoleKey = 'Public' | 'Researcher' | 'Official' | 'Admin';
  const [selectedRoleView, setSelectedRoleView] = useState<RoleKey>('Public');

  const roleProfiles: Record<RoleKey, {
    id: RoleKey;
    name: string;
    hindiName: string;
    subtitle: string;
    hindiSubtitle: string;
    badge: string;
    hindiBadge: string;
    title: string;
    hindiTitle: string;
    description: string;
    hindiDesc: string;
    primaryBtn: { text: string; hindiText: string; href: string };
    secondaryBtn: { text: string; hindiText: string; href: string };
  }> = {
    Public: {
      id: 'Public',
      name: 'Public Citizen',
      hindiName: 'नागरिक',
      subtitle: 'View Documents & Maps',
      hindiSubtitle: 'दस्तावेज़ एवं मानचित्र देखें',
      badge: 'Public Citizen Portal',
      hindiBadge: 'नागरिक सेवा केंद्र',
      title: 'Explore Land Maps & Gazette Records',
      hindiTitle: 'भूमि मानचित्र और राजपत्र रिकॉर्ड देखें',
      description: 'Search digitized cadastral records, view rural land parcels, and check village-level SVAMITVA survey progress with full transparency.',
      hindiDesc: 'डिजिटल कैडस्ट्रल रिकॉर्ड खोजें, ग्रामीण भूमि पार्सल देखें और पूर्ण पारदर्शिता के साथ गांव-स्तरीय स्वामित्व सर्वेक्षण की प्रगति जांचें।',
      primaryBtn: {
        text: 'Browse Gazette Repository',
        hindiText: 'राजपत्र अभिलेखागार देखें',
        href: '/repository',
      },
      secondaryBtn: {
        text: 'Open Interactive GIS Map',
        hindiText: 'इंटरैक्टिव जीआईएस मानचित्र',
        href: '/map',
      },
    },
    Researcher: {
      id: 'Researcher',
      name: 'Researcher',
      hindiName: 'शोधकर्ता',
      subtitle: 'AI Assistant & Notes',
      hindiSubtitle: 'एआई सहायक एवं अनुसंधान',
      badge: 'Academic & Research Suite',
      hindiBadge: 'अकादमिक एवं अनुसंधान केंद्र',
      title: 'Cross-Policy Analysis & AI Assistant',
      hindiTitle: 'नीतिगत विश्लेषण एवं एआई सहायक',
      description: 'Access citation-backed AI policy search, compare legislative texts side-by-side, and download synthesized policy research memos.',
      hindiDesc: 'प्रमाणित स्रोतों के साथ एआई नीति खोज का उपयोग करें, विभिन्न राज्यों के कानूनों की साथ-साथ तुलना करें और शोध रिपोर्ट तैयार करें।',
      primaryBtn: {
        text: 'Launch AI Policy Assistant',
        hindiText: 'एआई नीति सहायक शुरू करें',
        href: '/assistant',
      },
      secondaryBtn: {
        text: 'Compare Policies Side-by-Side',
        hindiText: 'नीतियों की तुलना करें',
        href: '/synthesis',
      },
    },
    Official: {
      id: 'Official',
      name: 'Official',
      hindiName: 'शासकीय अधिकारी',
      subtitle: 'Simulations & Reports',
      hindiSubtitle: 'नीति सिमुलेशन एवं रिपोर्ट',
      badge: 'Administrative Decision Support',
      hindiBadge: 'प्रशासनिक निर्णय सहायता',
      title: 'What-If Scenarios & Decision Support',
      hindiTitle: 'नीतिगत परिदृश्य एवं सिमुलेशन',
      description: 'Simulate legislative land ceiling limits, agricultural conversion tariffs, and estimate infrastructure acquisition delays under RFCTLARR 2013.',
      hindiDesc: 'भूमि सीलिंग सीमा, गैर-कृषि कर प्रभावों का 5-वर्षीय सिमुलेशन करें और आरएफसीटीएलएआरआर 2013 के तहत बुनियादी ढांचा भूमि अधिग्रहण देरी का आकलन करें।',
      primaryBtn: {
        text: 'Run Policy Simulator',
        hindiText: 'नीति सिम्युलेटर चलाएं',
        href: '/simulate',
      },
      secondaryBtn: {
        text: 'Generate Cabinet Memo',
        hindiText: 'कैबिनेट मेमो तैयार करें',
        href: '/simulate',
      },
    },
    Admin: {
      id: 'Admin',
      name: 'Admin',
      hindiName: 'प्रशासक',
      subtitle: 'Audit Logs & Registry',
      hindiSubtitle: 'ऑडिट लॉग एवं मंच प्रशासन',
      badge: 'National Registry & Compliance',
      hindiBadge: 'राष्ट्रीय रजिस्ट्री एवं नियंत्रण',
      title: 'Audit Telemetry & System Governance',
      hindiTitle: 'ऑडिट टेलीमेट्री एवं शासन',
      description: 'Review tamper-evident transaction logs, monitor state-level cadastral synchronization, and verify national GIGW 3.0 standards.',
      hindiDesc: 'अपरिवर्तनीय ऑडिट लॉग की निगरानी करें, राज्य-स्तरीय कैडस्ट्रल सिंक्रोनाइज़ेशन प्रबंधित करें और जीआईजीडब्ल्यू 3.0 मानकों की पुष्टि करें।',
      primaryBtn: {
        text: 'Access Deliberation Workspace',
        hindiText: 'कार्यक्षेत्र में जाएं',
        href: '/workspaces',
      },
      secondaryBtn: {
        text: 'Platform Telemetry & Audit',
        hindiText: 'राष्ट्रीय विश्लेषण डैशबोर्ड',
        href: '/analytics',
      },
    },
  };
  const currentProfile = roleProfiles[selectedRoleView];

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
              <span>{t('hero_badge')}</span>
            </div>

            {/* Bilingual Ministry Identification */}
            <p className="font-serif text-xs md:text-sm tracking-widest text-[#f2b134] uppercase font-bold">
              {t('hero_ministry')}
            </p>

            {/* Hero Main Heading */}
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl max-w-5xl leading-tight">
              {t('hero_title')}
            </h1>

            {/* Subheading */}
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
              {t('hero_sub')}
            </p>

            {/* Hero Interactive Search Bar */}
            <form onSubmit={handleHeroSearch} className="mt-8 w-full max-w-3xl lg:max-w-4xl">
              <div className="relative flex items-center rounded-xs bg-white p-1.5 shadow-2xl border border-white/20">
                <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hero_search_placeholder')}
                  className="w-full min-w-0 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="focus-ring shrink-0 bg-[#244562] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#132f4c] transition-colors rounded-[2px]"
                >
                  {t('search_registry')}
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
                {t('explore_maps')}
              </Link>
              <Link
                href="/repository"
                className="focus-ring flex items-center gap-2 border border-white/40 bg-white/10 px-5 py-3 text-xs md:text-sm font-bold text-white hover:bg-white/20 backdrop-blur-xs transition-all"
              >
                <BookOpen className="h-4 w-4" />
                {t('browse_docs')}
              </Link>
              <Link
                href="/assistant"
                className="focus-ring flex items-center gap-2 border border-white/20 bg-slate-800/60 px-5 py-3 text-xs md:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Sparkles className="h-4 w-4 text-[#f2b134]" />
                {t('ask_ai')}
              </Link>
            </div>
          </div>

          {/* Key National Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 gap-3 border-t border-white/15 pt-8 sm:grid-cols-3 lg:grid-cols-5">
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-[#f2b134]">640+</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">{t('stat_districts')}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-400">1.4M+</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">{t('stat_villages')}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-sky-400">89%</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">{t('stat_digitized')}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs">
              <p className="font-mono text-2xl md:text-3xl font-bold text-amber-400">&lt; 5 cm</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">{t('stat_accuracy')}</p>
            </div>
            <div className="col-span-2 border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xs sm:col-span-1">
              <p className="font-mono text-2xl md:text-3xl font-bold text-rose-300">189K+</p>
              <p className="mt-1 text-[11px] font-medium text-slate-300">{t('stat_cards')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship National Frameworks Section */}
      <section className="border-b border-slate-200 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">{t('key_schemes_kicker')}</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#132f4c]">
                {t('key_schemes_title')}
              </h2>
              <p className="mt-2 max-w-2xl text-xs md:text-sm text-slate-600">
                {t('key_schemes_sub')}
              </p>
            </div>
            <Link
              href="/repository"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244562] hover:text-[#132f4c] underline underline-offset-4"
            >
              {t('view_all_docs')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {flagshipSchemes.map((scheme) => (
              <div
                key={scheme.code}
                className="group relative flex flex-col justify-between border border-slate-200 bg-slate-50/50 p-5 hover:border-[#244562] hover:bg-white hover:shadow-md transition-all h-full"
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
                    {isHindi ? scheme.hindiName : scheme.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {isHindi ? scheme.name : scheme.hindiName}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">
                    {isHindi ? scheme.hindiMinistry : scheme.ministry}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    {isHindi ? scheme.hindiDesc : scheme.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <Link
                    href={scheme.href}
                    className="flex items-center justify-between text-xs font-bold text-[#244562] group-hover:underline"
                  >
                    <span>{t('read_more')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Pillars & Architecture Section - Normalized vertical padding */}
      <section className="bg-[#f1f5f9] py-12 md:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="section-kicker">{t('tools_kicker')}</p>
            <h2 className="font-serif text-3xl font-bold text-[#132f4c] md:text-4xl">
              {t('tools_title')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {t('tools_sub')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex flex-col justify-between h-full border border-slate-300 bg-white p-6 shadow-xs hover:border-[#244562] hover:shadow-lg transition-all"
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
                      {isHindi ? pillar.hindi : pillar.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {isHindi ? pillar.title : pillar.hindi}
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
                      className="focus-ring flex items-center justify-center gap-2 bg-[#244562] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#132f4c] transition-colors"
                    >
                      <span>{t('get_started')}</span>
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
              <p className="section-kicker">{t('featured_districts_kicker')}</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#132f4c]">
                {t('featured_districts_title')}
              </h2>
              <p className="mt-1.5 text-xs md:text-sm text-slate-600">
                {t('featured_districts_sub')}
              </p>
            </div>
            <Link
              href="/map"
              className="focus-ring inline-flex items-center gap-2 bg-[#244562] px-4 py-2 text-xs font-bold text-white hover:bg-[#132f4c]"
            >
              <MapPin className="h-3.5 w-3.5" />
              {t('open_full_map')}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
            {featuredDistricts.map((d) => {
              const status = getDistrictStatus(d.risk);
              return (
                <div
                  key={d.name}
                  className="flex flex-col justify-between border border-slate-200 bg-slate-50/50 p-4 hover:border-[#244562] hover:bg-white transition-all shadow-2xs h-full"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#132f4c] leading-tight">{d.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">{d.state}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${status.badgeClass}`}
                        title={`Status: ${status.label} (${d.risk} Risk Profile)`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                        <span>{isHindi ? status.hindiLabel : status.label}</span>
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('digitization_progress')}</span>
                        <span className="font-mono font-bold text-[#287449]">{d.modernization}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-xs overflow-hidden">
                        <div className="h-full bg-[#287449]" style={{ width: `${d.modernization}%` }} />
                      </div>
                      <div className="flex justify-between pt-1 text-[11px]">
                        <span className="text-slate-500">{t('revenue_villages')}</span>
                        <span className="font-mono font-bold text-slate-800">{d.villages}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <Link
                      href={`/repository?search=${encodeURIComponent(d.name)}`}
                      className="flex items-center justify-between text-[11px] font-bold text-[#244562] hover:underline"
                    >
                      <span>{t('view_gazette_records')}</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Access Banner - Interactive Switcher with Normalized Spacing */}
      <section className="bg-[#132f4c] py-12 md:py-16 text-white border-b border-[#0a1e32]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#f2b134]">
                  <UsersRound className="h-3.5 w-3.5" />
                  {t('roles_kicker')}
                </div>
                <h2 className="mt-3 font-serif text-2xl md:text-4xl font-bold tracking-tight">
                  {t('roles_title')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-2xl">
                  {t('roles_sub')}
                </p>
              </div>

              {/* Interactive Role Switcher Tabs */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(['Public', 'Researcher', 'Official', 'Admin'] as RoleKey[]).map((key) => {
                  const r = roleProfiles[key];
                  const isSelected = selectedRoleView === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedRoleView(key)}
                      className={`p-3.5 text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#f2b134] bg-white/15 ring-2 ring-[#f2b134]/50 shadow-md'
                          : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#f2b134]' : 'text-white'}`}>
                          {isHindi ? r.hindiName : r.name}
                        </p>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-[#f2b134] animate-pulse" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-300">
                        {isHindi ? r.hindiSubtitle : r.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamically Paired Role Card */}
            <div className="border border-white/20 bg-white/10 p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#f2b134]">
                    {isHindi ? currentProfile.hindiBadge : currentProfile.badge}
                  </p>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-white/15 text-slate-200 border border-white/20">
                    {isHindi ? currentProfile.hindiName : currentProfile.name}
                  </span>
                </div>
                <h3 className="mt-3.5 text-lg font-bold text-white leading-snug">
                  {isHindi ? currentProfile.hindiTitle : currentProfile.title}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                  {isHindi ? currentProfile.hindiDesc : currentProfile.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 space-y-2.5">
                <Link
                  href={currentProfile.primaryBtn.href}
                  className="flex w-full items-center justify-center gap-2 bg-[#f2b134] px-4 py-2.5 text-xs font-bold text-[#132f4c] hover:bg-[#e0a22a] transition-colors shadow-md"
                >
                  <span>{isHindi ? currentProfile.primaryBtn.hindiText : currentProfile.primaryBtn.text}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={currentProfile.secondaryBtn.href}
                  className="flex w-full items-center justify-center gap-2 border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                >
                  <span>{isHindi ? currentProfile.secondaryBtn.hindiText : currentProfile.secondaryBtn.text}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Government of India GIGW 3.0 Certified Footer */}
      <footer className="border-t-2 border-[#132f4c] bg-[#eef2f6] text-xs text-slate-700">
        {/* Top Ministry & Official Seal Ribbon */}
        <div className="border-b border-slate-300 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <StateEmblem variant="dark" className="h-14 w-auto shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#132f4c] uppercase font-serif">
                  {isHindi
                    ? 'भू-संसाधन विभाग (भू-सं.वि.) • ग्रामीण विकास मंत्रालय • भारत सरकार'
                    : 'Department of Land Resources (DoLR) • Ministry of Rural Development'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {isHindi
                    ? 'राष्ट्रीय डिजिटल भूमि शासन मंच • SIH PS 26019'
                    : 'Government of India • National Land Governance Platform (SIH PS 26019)'}
                </p>
              </div>
            </div>

            {/* Top-Right Partner Badges (National initiative logos & compliance) */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="h-10 border border-slate-200 bg-white px-3 py-1.5 rounded-md shadow-2xs flex items-center justify-center shrink-0 hover:border-slate-300 transition-colors">
                <DigitalIndiaLogo variant="dark" className="max-h-6 w-auto object-contain" />
              </div>
              <div className="h-10 border border-slate-200 bg-white px-3 py-1.5 rounded-md shadow-2xs flex items-center justify-center shrink-0 hover:border-slate-300 transition-colors">
                <AzadiMahotsavLogo className="max-h-6 w-auto object-contain" />
              </div>
              <IndiaGovBadge />
              <GIGWBadge />
            </div>

          </div>
        </div>

        {/* Central Policy Links & Navigation */}
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 border-b border-slate-300 pb-8 text-xs">
            {/* Column 1: Platform Modules */}
            <div>
              <p className="font-bold text-[#132f4c] uppercase tracking-wider text-[11px] mb-3.5 border-b border-slate-200 pb-1.5">
                {isHindi ? 'राष्ट्रीय मंच मॉड्यूल' : 'Platform Modules'}
              </p>
              <ul className="space-y-2.5 text-slate-600">
                <li><Link href="/repository" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'दस्तावेज़ एवं राजपत्र भंडार' : 'Statutory Land Repository'}</Link></li>
                <li><Link href="/map" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'राष्ट्रीय जीआईएस भू-मानचित्र' : 'National GIS Cadastral Map'}</Link></li>
                <li><Link href="/assistant" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'एआई नीति परामर्श सहायक' : 'AI Policy Assistant'}</Link></li>
                <li><Link href="/synthesis" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'नीतिगत विश्लेषण व संश्लेषण' : 'Policy Synthesis Engine'}</Link></li>
                <li><Link href="/simulate" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'भूमि सुधार नीति सिम्युलेटर' : 'Land Reform Policy Simulator'}</Link></li>
              </ul>
            </div>

            {/* Column 2: Flagship Schemes */}
            <div>
              <p className="font-bold text-[#132f4c] uppercase tracking-wider text-[11px] mb-3.5 border-b border-slate-200 pb-1.5">
                {isHindi ? 'प्रमुख राष्ट्रीय योजनाएं' : 'Flagship Schemes'}
              </p>
              <ul className="space-y-2.5 text-slate-600">
                <li><Link href="/repository?search=SVAMITVA" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'स्वामित्व योजना (SVAMITVA)' : 'SVAMITVA Scheme'}</Link></li>
                <li><Link href="/repository?search=DILRMP" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'डीआईएलआरएमपी आधुनिकीकरण' : 'DILRMP Modernization'}</Link></li>
                <li><Link href="/repository?search=ULPIN" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'भू-आधार पहचान (ULPIN)' : 'Bhu-Aadhaar (ULPIN)'}</Link></li>
                <li><Link href="/repository?search=RFCTLARR" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'आरएफसीटीएलएआरआर अधिनियम 2013' : 'RFCTLARR Act, 2013'}</Link></li>
                <li><Link href="/repository?search=Leasing" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'मॉडल भूमि पट्टा कानून' : 'Model Land Leasing Act'}</Link></li>
              </ul>
            </div>

            {/* Column 3: Citizen & Research */}
            <div>
              <p className="font-bold text-[#132f4c] uppercase tracking-wider text-[11px] mb-3.5 border-b border-slate-200 pb-1.5">
                {isHindi ? 'नागरिक व शोधकर्ता' : 'Citizen & Research'}
              </p>
              <ul className="space-y-2.5 text-slate-600">
                <li><Link href="/innovation" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'नवाचार व अनुसंधान मंच' : 'Innovation & Sandbox Portal'}</Link></li>
                <li><Link href="/analytics" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'राष्ट्रीय भूमि विश्लेषण केंद्र' : 'National Analytics Hub'}</Link></li>
                <li><Link href="/developers" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'ओपन डेवलपर एपीआई' : 'Open Developer API'}</Link></li>
                <li><Link href="/login" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'शासकीय एसएसओ (मेरी पहचान)' : 'Official SSO (MeriPehchan)'}</Link></li>
                <li><a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'लोक शिकायत निवारण (CPGRAMS)' : 'Public Grievance (CPGRAMS)'}</a></li>
              </ul>
            </div>

            {/* Column 4: Government Policies */}
            <div>
              <p className="font-bold text-[#132f4c] uppercase tracking-wider text-[11px] mb-3.5 border-b border-slate-200 pb-1.5">
                {isHindi ? 'सरकारी नीतियां एवं सहायता' : 'Government Policies'}
              </p>
              <ul className="space-y-2.5 text-slate-600">
                <li><a href="#main-content" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'वेबसाइट नीतियां' : 'Website Policies'}</a></li>
                <li><a href="#main-content" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'हाइपरलिंकिंग नीति' : 'Hyperlinking Policy'}</a></li>
                <li><a href="#main-content" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}</a></li>
                <li><a href="#main-content" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'नियम और शर्तें' : 'Terms & Conditions'}</a></li>
                <li><a href="#main-content" className="hover:text-[#132f4c] hover:underline transition-colors">{isHindi ? 'वेब सूचना प्रबंधक' : 'Web Information Manager'}</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Attribution, NIC Seal & Last Updated (WCAG AA Compliant contrast & baseline aligned) */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11.5px]">
            <div className="flex items-center gap-3.5">
              <NICLogo className="h-8 w-auto hidden sm:block shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 leading-snug">
                  {isHindi
                    ? 'सामग्री स्वामित्व एवं अनुरक्षण: भू-संसाधन विभाग (भू-सं.वि.), ग्रामीण विकास मंत्रालय, भारत सरकार।'
                    : 'Website owned, designed and maintained by Department of Land Resources (DoLR), Ministry of Rural Development, Government of India.'}
                </p>
                <p className="mt-1 text-[11px] text-slate-700 leading-snug">
                  {isHindi
                    ? 'प्लेटफॉर्म अभिकल्पित, विकसित एवं राष्ट्रीय सूचना विज्ञान केंद्र (NIC), इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय द्वारा होस्ट किया गया।'
                    : 'Platform designed, developed and hosted by National Informatics Centre (NIC), Ministry of Electronics & IT.'}
                </p>
              </div>
            </div>

            <div className="flex items-center shrink-0 self-center md:self-auto">
              <div className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 rounded-[2px] shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                <span>{isHindi ? 'अंतिम अद्यतन: 02 अक्टूबर 2026' : 'Last Updated: 02 October 2026'}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
