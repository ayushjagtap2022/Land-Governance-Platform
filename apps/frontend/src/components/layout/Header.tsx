import { useState, useRef, useMemo, useEffect } from 'react';
import { Bell, ChevronDown, Search, ShieldCheck, UserRound, LogIn, LogOut, Languages, Play, Pause, X, Globe, Volume2, CheckCheck, Check, BellRing } from 'lucide-react';
import { useRole, type Role } from '@/context/RoleContext';
import { useLanguage, SUPPORTED_LANGUAGES, type Language } from '@/context/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PLATFORM_NAV_ITEMS, type NavItemConfig } from '@/config/navigation';
import { StateEmblem } from '@/components/common/StateEmblem';
import { DigitalIndiaLogo, AzadiMahotsavLogo } from '@/components/common/GovLogos';

const roles: Role[] = ['Researcher', 'Official', 'Institution Admin', 'Public', 'Super Admin'];

const POPULAR_SEARCH_TARGETS = [
  { title: 'SVAMITVA Scheme Guidelines & Drone Survey', query: 'SVAMITVA', category: 'Scheme Protocol', ref: 'SVAMITVA-2024-014' },
  { title: 'DILRMP Cadastral Maps Modernization Framework', query: 'DILRMP', category: 'Core Framework', ref: 'DILRMP-2024-001' },
  { title: 'Model Agricultural Land Leasing Act (NITI Aayog)', query: 'Model Land Leasing', category: 'Tenancy Reform', ref: 'NITI-LEASING-2016' },
  { title: 'RFCTLARR Land Acquisition Act, 2013', query: 'RFCTLARR', category: 'Statutory Act', ref: 'RFCTLARR-2013-SEC26' },
  { title: 'ULPIN 14-Digit Bhu-Aadhaar Technical Standard', query: 'ULPIN', category: 'Cadastral Standard', ref: 'ULPIN-STD-2024' },
  { title: 'Pune e-Chawdi Modern Record Room Integration', query: 'Pune', category: 'District Case Study', ref: 'CASE-2024-ECHAWDI-PUNE' },
  { title: 'Maharashtra Land Revenue Code & Tenancy', query: 'Maharashtra', category: 'State Code', ref: 'MAH-LRC-1966' },
  { title: 'Forest Rights Act (FRA) Title Claims Framework', query: 'Forest Rights', category: 'Statutory Act', ref: 'FRA-2006-SEC3' },
];

export function Header() {
  const [location, setLocation] = useLocation();
  const { activeRole, setActiveRole, canSwitchRole, userRole } = useRole();
  const { language, setLanguage, toggleLanguage, isHindi, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const notifsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchSuggestions(false);
      }
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (notifsContainerRef.current && !notifsContainerRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery ?? search).trim();
    if (!q) return;

    setShowSearchSuggestions(false);
    window.dispatchEvent(new CustomEvent('platform-search', { detail: { query: q } }));
    setLocation(`/repository?search=${encodeURIComponent(q)}`);
  };

  const matchingSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return POPULAR_SEARCH_TARGETS.slice(0, 4);
    return POPULAR_SEARCH_TARGETS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.query.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.ref.toLowerCase().includes(q)
    );
  }, [search]);
  const queryClient = useQueryClient();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifsTab, setNotifsTab] = useState('Ministry');
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isRouteActive = (href: string, currentLoc: string) =>
    currentLoc === href || (href !== '/' && currentLoc.startsWith(href));

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications/').then((res) => res.data),
    enabled: isAuthenticated,
  });

  const unreadCount = useMemo(() => {
    if (!isAuthenticated || !Array.isArray(notifications)) return 0;
    return notifications.filter((n: any) => !n.is_read).length;
  }, [notifications, isAuthenticated]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(isHindi ? 'सभी सूचनाएं पढ़ी हुई चिह्नित' : 'All notifications marked as read');
    },
  });

  const testNotifMutation = useMutation({
    mutationFn: () => api.post('/notifications/test'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Failed to trigger test notification');
    },
  });

  const filteredNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    if (notifsTab === 'Ministry') {
      return notifications.filter((n: any) => {
        const title = (n.title || '').toLowerCase();
        const content = (n.content || '').toLowerCase();
        return !title.includes('workspace') && !title.includes('proposal') && !title.includes('simulation');
      });
    }
    if (notifsTab === 'Workspace') {
      return notifications.filter((n: any) => {
        const title = (n.title || '').toLowerCase();
        const content = (n.content || '').toLowerCase();
        return (
          title.includes('proposal') ||
          title.includes('workspace') ||
          title.includes('task') ||
          title.includes('challenge') ||
          content.includes('proposal') ||
          content.includes('team')
        );
      });
    }
    if (notifsTab === 'Simulation') {
      return notifications.filter((n: any) => {
        const title = (n.title || '').toLowerCase();
        const content = (n.content || '').toLowerCase();
        return (
          title.includes('simulat') ||
          title.includes('dispute') ||
          title.includes('projection') ||
          content.includes('simulat') ||
          content.includes('dispute')
        );
      });
    }
    return notifications;
  }, [notifications, notifsTab]);

  const handleFontDecrease = () => {
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    if (current > 13) {
      document.documentElement.style.fontSize = `${current - 1}px`;
    }
  };

  const handleFontNormal = () => {
    document.documentElement.style.fontSize = '16px';
  };

  const handleFontIncrease = () => {
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    if (current < 20) {
      document.documentElement.style.fontSize = `${current + 1}px`;
    }
  };

  const toggleHighContrast = (enable: boolean) => {
    setHighContrast(enable);
    if (enable) {
      document.documentElement.classList.add('high-contrast');
      toast.info(isHindi ? 'उच्च कंट्रास्ट मोड सक्रिय' : 'High contrast mode enabled');
    } else {
      document.documentElement.classList.remove('high-contrast');
      toast.info(isHindi ? 'मानक कंट्रास्ट मोड सक्रिय' : 'Standard contrast mode restored');
    }
  };

  const isSuperAdmin = Boolean(isAuthenticated && (user?.role === 'super_admin' || activeRole === 'Super Admin'));

  const visibleNavLinks = PLATFORM_NAV_ITEMS.filter((item) => {
    if (isSuperAdmin) return true;
    if (!isAuthenticated && !item.roles.includes('Public')) return false;
    return item.roles.includes(activeRole);
  });

  const tickerItemsHindi = [
    { id: '1', title: 'भू-आधार (ULPIN):', text: '14-अंकीय विशिष्ट भू-खंड पहचान संख्या 28 राज्यों और केंद्र शासित प्रदेशों में क्रियान्वित।' },
    { id: '2', title: 'स्वामित्व (SVAMITVA) योजना:', text: '1.89 लाख+ ग्रामों में ड्रोन सर्वेक्षण पूर्ण, डिजिटल संपत्ति अधिकार पत्र निर्गत।' },
    { id: '3', title: 'डिजिटल इंडिया भू-अभिलेख (DILRMP):', text: '89% भू-अभिलेख और राजस्व मानचित्र डिजिटलीकृत व सत्यापित।' },
    { id: '4', title: 'केंद्रीय राजपत्र भंडार:', text: 'राष्ट्रीय एवं राज्य स्तरीय 400+ कानूनी दस्तावेज अनुसंधान हेतु उपलब्ध।' },
  ];

  const tickerItemsEnglish = [
    { id: '1', title: 'Bhu-Aadhaar (ULPIN):', text: '14-digit Unique Land Parcel Identification Number operational across 28 States & UTs.' },
    { id: '2', title: 'SVAMITVA Scheme:', text: 'High-precision drone survey completed in 189,000+ villages; legal property cards distributed.' },
    { id: '3', title: 'DILRMP Modernization:', text: '89% of cadastral land records digitized & geo-referenced across 640 districts.' },
    { id: '4', title: 'Central Gazette Repository:', text: 'Over 400+ authentic statutory land notifications and revenue laws indexed.' },
  ];

  const activeTickerItems = isHindi ? tickerItemsHindi : tickerItemsEnglish;

  return (
    <header className="relative z-20">
      {/* 1. Official Government of India GIGW Accessibility & Utility Bar */}
      <div className="flex h-8 items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 text-xs text-slate-700 md:px-8 select-none overflow-visible">
        {/* Far Left: Skip to Main Content + Official Identification */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#main-content"
            className="focus-ring text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors"
            title="Skip to main content"
          >
            Skip to main content
          </a>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="font-semibold tracking-wide text-slate-800 text-[11px] hidden sm:inline">
            भारत सरकार | Government of India
          </span>
          <span className="font-semibold tracking-wide text-slate-800 text-[11px] sm:hidden">
            भारत सरकार
          </span>
        </div>

        {/* Right Utility Group */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* Font Resizers: -A, A, +A (Subtle neutral outline buttons) */}
          <div className="flex items-center gap-0.5 rounded-xs border border-slate-300 bg-white p-0.5 shadow-2xs" aria-label="Text size adjustments">
            <button
              onClick={handleFontDecrease}
              className="h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-2xs transition-colors cursor-pointer"
              data-testid="button-font-decrease"
              type="button"
              title="Decrease text size (-A)"
            >
              -A
            </button>
            <span className="w-px h-3 bg-slate-200" aria-hidden="true" />
            <button
              onClick={handleFontNormal}
              className="h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-2xs transition-colors cursor-pointer"
              data-testid="button-font-normal"
              type="button"
              title="Standard text size (A)"
            >
              A
            </button>
            <span className="w-px h-3 bg-slate-200" aria-hidden="true" />
            <button
              onClick={handleFontIncrease}
              className="h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-2xs transition-colors cursor-pointer"
              data-testid="button-font-increase"
              type="button"
              title="Increase text size (+A)"
            >
              +A
            </button>
          </div>

          {/* High Contrast Mode Toggles: Standard dark/light contrast boxes ("A" on white, "A" on black) */}
          <div className="flex items-center gap-1" aria-label="Contrast controls" role="group">
            <button
              type="button"
              onClick={() => toggleHighContrast(false)}
              className={`h-5 w-5 flex items-center justify-center border text-[10px] font-black rounded-2xs transition-colors cursor-pointer ${
                !highContrast
                  ? 'bg-white text-slate-900 border-slate-500 ring-1 ring-slate-400 font-extrabold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Standard Contrast (A on white)"
              aria-pressed={!highContrast}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => toggleHighContrast(true)}
              className={`h-5 w-5 flex items-center justify-center border text-[10px] font-black rounded-2xs transition-colors cursor-pointer ${
                highContrast
                  ? 'bg-black text-white border-black ring-1 ring-black shadow-2xs'
                  : 'bg-slate-900 text-white border-slate-800 hover:bg-black'
              }`}
              title="High Contrast (A on black)"
              aria-pressed={highContrast}
            >
              A
            </button>
          </div>

          {/* Screen Reader Link / Icon */}
          <button
            onClick={() => toast.info(isHindi ? 'स्क्रीन रीडर अभिगम्यता: पोर्टल GIGW 3.0 और WCAG 2.1 AA अनुरूप है।' : 'Screen Reader Access: This portal adheres to GIGW 3.0 & WCAG 2.1 AA standards for NVDA, JAWS, and assistive tech.')}
            className="hidden lg:flex items-center gap-1 h-6 px-2 border border-slate-300 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xs transition-colors shadow-2xs cursor-pointer focus-ring"
            data-testid="link-screen-reader"
            type="button"
            title="Screen Reader Access information"
          >
            <Volume2 className="h-3 w-3 text-slate-500" />
            <span>Screen Reader</span>
          </button>

          {/* Official Website Language Switcher: English | हिन्दी (Bhashini AI) with clean neutral borders */}
          <div ref={langContainerRef} className="notranslate relative flex items-center shrink-0" data-no-translate>
            <div className="flex h-6 items-center border border-slate-300 bg-white rounded-xs overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  toast.success('Website language set to English');
                }}
                className={`h-full px-2 text-[11px] font-bold transition-colors cursor-pointer flex items-center ${
                  language === 'en'
                    ? 'bg-[#132f4c] text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Switch entire website to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('hi');
                  toast.success('वेबसाइट भाषा: हिन्दी (Website translated to Hindi)');
                }}
                className={`h-full px-2 text-[11px] font-bold transition-colors cursor-pointer flex items-center border-l border-slate-200 ${
                  language === 'hi'
                    ? 'bg-[#132f4c] text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Switch entire website to Hindi (हिन्दी)"
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className={`h-full px-1.5 text-[10px] font-bold border-l border-slate-200 flex items-center gap-1 transition-colors cursor-pointer ${
                  langOpen || (language !== 'en' && language !== 'hi')
                    ? 'bg-slate-100 text-[#132f4c]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Select Indian Regional Language (Bhashini AI)"
              >
                <Languages className="h-3 w-3 text-[#132f4c]" />
                <span className="font-mono text-[9px] uppercase font-bold text-slate-700">
                  {language !== 'en' && language !== 'hi' ? language : 'Bhashini AI'}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>
            </div>

            {/* Regional Languages Dropdown Menu */}
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-52 border border-slate-300 bg-white text-slate-800 shadow-xl rounded-xs py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-700">
                  <span>BHASHINI AI PORTAL TRANSLATION</span>
                </div>
                <div className="py-1 text-xs">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setLangOpen(false);
                        toast.success(`वेबसाइट भाषा: ${l.native} (Website translated via Bhashini AI)`);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                        language === l.code ? 'bg-slate-100 font-bold text-[#132f4c]' : 'text-slate-700'
                      }`}
                    >
                      <span className="font-medium">{l.native}</span>
                      <span className="text-[10px] font-mono text-slate-500">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statutory 3:2 Indian Flag */}
          <span className="flag-mark shrink-0" aria-label="National Flag of India" role="img" title="Official Flag of India">
            <span />
          </span>
        </div>
      </div>

      {/* 2. Official Ministry & National Platform Main Header */}
      <div className="bg-[#0b2545] text-white">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-8">
          {/* Left: Authentic State Emblem of India + Official Bilingual Hierarchy */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3.5 sm:gap-4 cursor-pointer hover:opacity-95 transition-opacity"
            title="National Land Governance Platform - Department of Land Resources"
          >
            <StateEmblem variant="gold" className="h-14 sm:h-16 w-auto shrink-0 drop-shadow-md" />

            <div className="flex flex-col justify-center border-l border-white/20 pl-3 sm:pl-4">
              <p className="text-[11px] sm:text-xs font-bold tracking-wide text-[#f2b134] uppercase font-serif">
                {t('gov_mord_hierarchy', language !== 'en' ? 'भारत सरकार • ग्रामीण विकास मंत्रालय • भू-संसाधन विभाग (भू-सं.वि.)' : 'Government of India • Ministry of Rural Development')}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-300 leading-tight">
                {t('dolr_full', language !== 'en' ? 'Department of Land Resources (DoLR), MoRD • Government of India' : 'Department of Land Resources (DoLR)')}
              </p>
              <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white font-serif leading-none">
                  {t('app_name', 'National Land Governance Platform')}
                </h1>
                <span className="inline-flex items-center rounded-[3px] border border-[#f2b134]/40 bg-[#f2b134]/15 px-2 py-0.5 text-[9.5px] font-mono font-bold text-[#f2b134] tracking-wider shadow-2xs">
                  SIH PS 26019
                </span>
              </div>
            </div>
          </Link>

          {/* Right: National Identity Logos, Global Search & Auth */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3.5">
            {/* Digital India Seal */}
            <div className="hidden xl:flex items-center border-r border-white/20 pr-3.5 shrink-0">
              <DigitalIndiaLogo className="h-10 w-auto object-contain" />
            </div>

            {/* Azadi Ka Amrit Mahotsav Seal */}
            <div className="hidden 2xl:flex items-center border-r border-white/20 pr-3.5 shrink-0">
              <AzadiMahotsavLogo className="h-10 w-auto object-contain" />
            </div>

            {/* Header Search Box with Form Submit and Instant Suggestions */}
            <div ref={searchContainerRef} className="relative hidden lg:block">
              <form onSubmit={handleGlobalSearch} className="relative" role="search">
                <label htmlFor="global-search" className="sr-only">
                  {t('search_platform')}
                </label>
                <button
                  type="submit"
                  className="absolute left-2.5 top-2.5 text-slate-300 hover:text-[#f2b134] transition-colors cursor-pointer"
                  title="Search repository"
                  aria-label="Submit search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <input
                  id="global-search"
                  type="search"
                  autoComplete="off"
                  className="focus-ring h-9 w-60 xl:w-72 border border-white/30 bg-white/10 pl-9 pr-7 text-xs text-white placeholder:text-slate-300 backdrop-blur-xs transition-all focus:bg-white focus:text-slate-800 focus:placeholder:text-slate-400 rounded-[2px]"
                  data-testid="input-global-search"
                  placeholder={
                    isHindi
                      ? 'राजपत्र, अधिनियम, ULPIN खोजें... (Enter)'
                      : 'Search gazettes, acts, ULPIN... (Enter)'
                  }
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSearchSuggestions(false);
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setShowSearchSuggestions(false);
                    }}
                    className="absolute right-2 top-2.5 text-slate-300 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {showSearchSuggestions && search.trim().length > 0 && (
                <div className="absolute left-0 top-11 z-50 w-full min-w-[310px] border border-slate-300 bg-white text-slate-800 shadow-2xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>{isHindi ? 'त्वरित सुझाव' : 'Quick Suggestions'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{isHindi ? 'Enter दबाएं' : 'Press Enter'}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {matchingSuggestions.length > 0 ? (
                      matchingSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-amber-50/70 transition-colors flex items-start gap-2.5 cursor-pointer group"
                          onClick={() => {
                            setSearch(item.query);
                            handleGlobalSearch(undefined, item.query);
                          }}
                        >
                          <Search className="h-3.5 w-3.5 text-slate-400 mt-0.5 group-hover:text-amber-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-[#132f4c] group-hover:text-amber-800 leading-tight">{item.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.category} • {item.ref}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2 cursor-pointer"
                        onClick={() => handleGlobalSearch()}
                      >
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <span>Search repository for <strong>"{search}"</strong></span>
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-100 px-3 py-1.5 border-t border-slate-200 text-right">
                    <button
                      type="button"
                      onClick={() => handleGlobalSearch()}
                      className="text-[11px] font-bold text-[#132f4c] hover:underline cursor-pointer"
                    >
                      {isHindi ? 'भंडार में सभी परिणाम देखें →' : 'View all results in Repository →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell & Dropdown */}
            <div ref={notifsContainerRef} className="relative border-l border-white/30 pl-3">
              <button 
                onClick={() => setNotifsOpen(!notifsOpen)}
                className={`focus-ring flex h-9 items-center justify-center gap-2 border border-white/30 bg-[#244562] px-2.5 sm:px-0 sm:w-9 transition-colors hover:bg-[#1a354d] cursor-pointer ${notifsOpen ? 'bg-[#1e3a53] ring-1 ring-[#f2b134]' : ''}`}
                title={t('notification_center')}
                aria-label="Notifications"
                data-testid="button-notifications"
                type="button"
              >
                <div className="relative">
                  <Bell className="h-4 w-4 text-white" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f2b134] px-1 text-[9px] font-black text-[#0b2545] shadow-xs animate-pulse"
                      title={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              </button>

              {notifsOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 border border-slate-300 bg-white text-slate-800 shadow-2xl rounded-xs">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#1E293B]">{t('notification_center')}</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          {unreadCount} {isHindi ? 'नई' : 'new'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuthenticated && unreadCount > 0 && !showNotifSettings && (
                        <button
                          type="button"
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors"
                          title="Mark all notifications as read"
                        >
                          <CheckCheck className="h-3 w-3" />
                          <span>{isHindi ? 'सभी पढ़े' : 'Mark all read'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowNotifSettings(!showNotifSettings)}
                        className="text-[11px] text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                      >
                        {showNotifSettings ? (isHindi ? 'वापस' : 'Back') : t('settings')}
                      </button>
                    </div>
                  </div>

                  {showNotifSettings ? (
                    <div className="p-4 space-y-3.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {t('alert_preferences')}
                      </p>
                      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5 accent-[#132f4c]" />
                        <span>Email me when new Cabinet Drafts are published</span>
                      </label>
                      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5 accent-[#132f4c]" />
                        <span>Alert me of Land Dispute Surge warnings in my state</span>
                      </label>
                      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input type="checkbox" className="mt-0.5 accent-[#132f4c]" />
                        <span>Weekly digest of Pilot & SVAMITVA survey progress</span>
                      </label>

                      {isAuthenticated && (
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => testNotifMutation.mutate()}
                            disabled={testNotifMutation.isPending}
                            className="w-full flex items-center justify-center gap-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 text-xs font-bold text-slate-800 transition-colors rounded-xs cursor-pointer shadow-2xs"
                          >
                            <BellRing className="h-3.5 w-3.5 text-amber-600" />
                            <span>{testNotifMutation.isPending ? 'Broadcasting...' : '⚡ Send Test Notification (WebSocket)'}</span>
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowNotifSettings(false)}
                        className="w-full bg-[#132f4c] py-2 text-xs font-bold text-white hover:bg-[#0b2545] transition-colors rounded-xs cursor-pointer mt-1"
                      >
                        {t('back_to_notifications')}
                      </button>
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Bell className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isHindi
                          ? 'वैधानिक सूचनाएं, विवाद चेतावनियां और कार्यक्षेत्र अद्यतन देखने के लिए अपने सरकारी क्रेडेंशियल से साइन इन करें।'
                          : 'Sign in to access personalized statutory alerts, dispute surge advisories, and workspace updates.'}
                      </p>
                      <Link
                        href="/login"
                        onClick={() => setNotifsOpen(false)}
                        className="inline-flex items-center justify-center gap-1.5 w-full bg-[#132f4c] text-white py-2 text-xs font-bold hover:bg-[#0b2545] transition-colors rounded-xs shadow-xs"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>{t('sign_in')}</span>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Tabs */}
                      <div className="flex border-b border-slate-200 bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => setNotifsTab('Ministry')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            notifsTab === 'Ministry'
                              ? 'border-b-2 border-[#132f4c] text-[#132f4c] bg-white font-extrabold'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {t('ministry')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotifsTab('Workspace')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            notifsTab === 'Workspace'
                              ? 'border-b-2 border-[#132f4c] text-[#132f4c] bg-white font-extrabold'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {t('workspaces')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotifsTab('Simulation')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            notifsTab === 'Simulation'
                              ? 'border-b-2 border-[#132f4c] text-[#132f4c] bg-white font-extrabold'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {t('simulations')}
                        </button>
                      </div>

                      {/* Notification Items List */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {filteredNotifications.length > 0 ? (
                          filteredNotifications.map((n: any) => {
                            const isUnread = !n.is_read;
                            const type = (n.type || 'info').toLowerCase();
                            const typeColor =
                              type === 'success'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                : type === 'warning'
                                ? 'text-amber-800 bg-amber-50 border-amber-200'
                                : type === 'error'
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : 'text-blue-700 bg-blue-50 border-blue-200';

                            return (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (isUnread) {
                                    markReadMutation.mutate(n.id);
                                  }
                                }}
                                className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                                  isUnread
                                    ? 'bg-blue-50/40 hover:bg-blue-50/70 border-l-3 border-l-blue-600'
                                    : 'bg-white hover:bg-slate-50 border-l-3 border-l-transparent text-slate-600'
                                }`}
                              >
                                <span className={`shrink-0 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-2xs border uppercase ${typeColor}`}>
                                  {type}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-xs ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                      {n.title}
                                    </p>
                                    {isUnread && (
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" title="Unread" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                    {n.content}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                    {new Date(n.created_at).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                            <p>{t('no_new_notifications')}</p>
                            {notifications && notifications.length > 0 && notifsTab !== 'Ministry' && (
                              <button
                                type="button"
                                onClick={() => setNotifsTab('Ministry')}
                                className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                              >
                                {isHindi ? 'सभी मंत्रालय सूचनाएं देखें' : 'View Ministry Notifications'} ({notifications.length})
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Authenticated Role or Official Sign-In Link */}
            <div className="relative flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    className={`focus-ring flex h-9 items-center gap-2 border px-2.5 text-left text-xs font-bold cursor-pointer transition-colors ${
                      canSwitchRole
                        ? 'border-[#e7a62b] bg-[#f2b134] text-[#132f4c]'
                        : 'border-slate-400/40 bg-white/10 text-white hover:bg-white/15'
                    }`}
                    title={canSwitchRole ? "Super Admin Account (Click to switch preview persona)" : `Verified Account Role: ${activeRole} (${user?.institution || 'Government of India'})`}
                    type="button"
                    aria-expanded={canSwitchRole ? roleOpen : undefined}
                    onClick={() => {
                      if (canSwitchRole) {
                        setRoleOpen((open) => !open);
                      } else {
                        toast.info(`Verified Credential: ${user?.full_name || 'Authorized User'} (${activeRole}) · ${user?.institution || 'Government of India'}`);
                      }
                    }}
                  >
                    <ShieldCheck className={`h-4 w-4 ${canSwitchRole ? 'text-[#132f4c]' : 'text-emerald-400'}`} />
                    <span className="hidden sm:inline">
                      {t('role_label')}: {t(activeRole)}
                    </span>
                    <span className="sm:hidden">{t(activeRole)}</span>
                    {canSwitchRole && <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  {canSwitchRole && roleOpen && (
                    <div className="absolute right-0 top-11 z-50 w-56 border border-slate-400 bg-white py-1 text-slate-800 shadow-lg">
                      <p className="border-b border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Auditor Persona Preview
                      </p>
                      {roles.map((role) => (
                        <button
                          className={`focus-ring block w-full px-3 py-2 text-left text-xs hover:bg-slate-100 ${
                            role === activeRole ? 'bg-slate-100 font-bold text-[#132f4c]' : ''
                          }`}
                          key={role}
                          type="button"
                          onClick={() => {
                            setActiveRole(role);
                            setRoleOpen(false);
                          }}
                        >
                          {role} {role === userRole ? '(Your Account)' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="focus-ring flex h-9 items-center gap-1.5 border border-white/30 bg-[#244562] px-3 text-xs font-bold text-white hover:bg-[#1a354d] transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{t('sign_in')}</span>
                </Link>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative border-l border-white/30 pl-3">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`focus-ring flex h-9 w-9 items-center justify-center border border-white/30 bg-[#244562] text-white hover:bg-[#1a354d] transition-colors ${
                  profileOpen ? 'bg-[#1a354d] ring-1 ring-[#f2b134]' : ''
                }`}
                title={isAuthenticated ? (user?.full_name || 'User Profile') : 'User Profile'}
                aria-label="User profile menu"
                data-testid="button-user-profile"
              >
                <UserRound className="h-4 w-4 text-slate-200" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-11 z-50 w-52 border border-slate-400 bg-white py-1 text-slate-800 shadow-xl">
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                        <p className="text-xs font-bold text-[#132f4c]">{user?.full_name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        <span className="mt-1 inline-block rounded-xs bg-[#f2b134] px-1.5 py-0.2 text-[9px] font-bold text-[#132f4c]">
                          {activeRole}
                        </span>
                      </div>
                      <button
                        className="focus-ring flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-slate-100 font-bold"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                      >
                        <LogOut className="h-3.5 w-3.5" /> {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setProfileOpen(false)} className="focus-ring flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-slate-100 text-[#132f4c] font-bold">
                        <LogIn className="h-3.5 w-3.5" /> Sign In
                      </Link>
                      <Link href="/register" onClick={() => setProfileOpen(false)} className="focus-ring flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-slate-100 text-slate-600">
                        Create Account                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. National Tricolor Border Ribbon (Saffron, White, Green) */}
        <div className="flex h-1 w-full" aria-label="National tricolor ribbon">
          <span className="w-1/3 bg-[#FF9933]" />
          <span className="w-1/3 bg-[#FFFFFF]" />
          <span className="w-1/3 bg-[#138808]" />
        </div>
      </div>

      {/* 4. Official Central Government Horizontal Navigation Bar */}
      {isAuthenticated && (
        <nav
          aria-label="National Portal Navigation"
          className="block bg-[#132f4c] border-b border-[#244562] text-white overflow-x-auto scrollbar-none"
        >
          <div className="flex w-full items-center px-4 md:px-8">
            <div className="flex items-center space-x-0.5 text-xs font-semibold py-1">
              {visibleNavLinks.map(({ href, label, hiLabel, icon: Icon }) => {
                const isActive = isRouteActive(href, location);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#244562] text-[#f2b134] font-bold border-b-2 border-[#f2b134]'
                        : 'text-slate-200 hover:bg-[#1a3854] hover:text-white'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#f2b134]' : 'text-slate-400'}`} />
                    <span>{t(label, isHindi ? hiLabel : label)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* 5. Official Government Announcement / Live News Ticker Strip */}
      <div className={`flex items-center border-b border-[#fed7aa] bg-[#fffbf2] text-xs text-slate-800 px-4 py-1.5 md:px-8 ${tickerPaused ? 'ticker-paused' : ''}`}>
        <div className="flex items-center gap-2 shrink-0 border-r border-[#fcd34d] pr-3.5 mr-2 sm:mr-3 z-10 bg-[#fffbf2] shadow-[2px_0_6px_-2px_rgba(217,119,6,0.12)]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[11px] text-[#996515] font-serif">
            {isHindi ? 'नवीनतम अपडेट' : 'LATEST UPDATES'}
          </span>
          <button
            type="button"
            onClick={() => setTickerPaused(!tickerPaused)}
            className="focus-ring p-0.5 text-slate-500 hover:text-slate-800 transition-colors"
            title={tickerPaused ? 'Play Ticker' : 'Pause Ticker'}
            aria-label={tickerPaused ? 'Play Ticker' : 'Pause Ticker'}
          >
            {tickerPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>

        <div className="overflow-hidden whitespace-nowrap min-w-0 flex-1 relative flex pl-5 sm:pl-6">
          {/* Continuous Track 1 */}
          <div className="flex shrink-0 items-center gap-10 pr-10 animate-gov-ticker text-[11.5px] font-medium text-slate-700">
            {activeTickerItems.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="text-[#d97706] font-bold select-none shrink-0">★</span>
                <strong className="text-slate-900 font-semibold shrink-0 whitespace-nowrap">{item.title}</strong>
                <span className="shrink-0 whitespace-nowrap text-slate-700">{item.text}</span>
              </span>
            ))}
          </div>
          {/* Continuous Track 2 for seamless loop without clipping */}
          <div className="flex shrink-0 items-center gap-10 pr-10 animate-gov-ticker text-[11.5px] font-medium text-slate-700" aria-hidden="true">
            {activeTickerItems.map((item) => (
              <span key={`dup-${item.id}`} className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="text-[#d97706] font-bold select-none shrink-0">★</span>
                <strong className="text-slate-900 font-semibold shrink-0 whitespace-nowrap">{item.title}</strong>
                <span className="shrink-0 whitespace-nowrap text-slate-700">{item.text}</span>
              </span>
            ))}
          </div>

          {/* Right edge smooth fade mask */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-[#fffbf2] to-transparent z-10" />
        </div>
      </div>
    </header>
  );
}