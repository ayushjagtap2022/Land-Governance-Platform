import { useState } from 'react';
import { Bell, ChevronDown, Search, ShieldCheck, UserRound, LogIn, LogOut, Languages, Play, Pause } from 'lucide-react';
import { useRole, type Role } from '@/context/RoleContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { BhashiniTranslatorModal } from '@/components/common/BhashiniTranslatorModal';
import { PLATFORM_NAV_ITEMS, type NavItemConfig } from '@/config/navigation';

const roles: Role[] = ['Researcher', 'Official', 'Institution Admin', 'Public', 'Super Admin'];

export function Header() {
  const [location] = useLocation();
  const { activeRole, setActiveRole, evaluatorMode, toggleEvaluatorMode } = useRole();
  const { language, setLanguage, isHindi, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifsTab, setNotifsTab] = useState('Ministry');
  const [profileOpen, setProfileOpen] = useState(false);
  const [showBhashini, setShowBhashini] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isRouteActive = (href: string, currentLoc: string) =>
    currentLoc === href || (href !== '/' && currentLoc.startsWith(href));

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications/').then((res) => res.data),
    enabled: isAuthenticated,
  });

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

  const visibleNavLinks = PLATFORM_NAV_ITEMS.filter(
    (item) => activeRole === 'Super Admin' || item.roles.includes(activeRole)
  );

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
      {showBhashini && <BhashiniTranslatorModal onClose={() => setShowBhashini(false)} />}
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-slate-100 px-4 py-1.5 text-[11px] text-slate-700 md:px-8">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wide">भारत सरकार | Government of India</span>
          <span className="hidden text-slate-400 md:inline">|</span>
          <span className="hidden md:inline">Accessibility tools</span>        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          {/* Text Size Controls */}
          <div className="flex items-center gap-0.5" aria-label="Text size controls">
            <button
              onClick={handleFontDecrease}
              className="focus-ring border border-slate-400 bg-white px-1.5 py-0.5 font-bold hover:bg-slate-100 transition-colors text-slate-700 text-[10px]"
              data-testid="button-font-decrease"
              type="button"
              title="Decrease text size"
            >
              -A
            </button>
            <button
              onClick={handleFontNormal}
              className="focus-ring border border-slate-400 bg-white px-1.5 py-0.5 font-bold hover:bg-slate-100 transition-colors text-slate-700 text-[10px]"
              data-testid="button-font-normal"
              type="button"
              title="Standard text size"
            >
              A
            </button>
            <button
              onClick={handleFontIncrease}
              className="focus-ring border border-slate-400 bg-white px-1.5 py-0.5 font-bold hover:bg-slate-100 transition-colors text-slate-700 text-[10px]"
              data-testid="button-font-increase"
              type="button"
              title="Increase text size"
            >
              +A
            </button>
          </div>
          <button className="focus-ring underline underline-offset-2" data-testid="link-screen-reader" type="button">Screen Reader</button>
          <button
            onClick={() => setShowBhashini(true)}
            className="focus-ring flex items-center gap-1 font-bold border border-orange-300 bg-orange-50 px-2 py-0.5 text-orange-950 hover:bg-orange-100 transition-colors"
            data-testid="button-language"
            type="button"
          >
            <Languages className="h-3 w-3 text-orange-600" />
            <span>English <span className="mx-0.5 text-orange-400">|</span> हिन्दी <span className="text-[10px] text-orange-600 font-mono">(Bhashini AI)</span></span>
          </button>
          <span className="flag-mark" aria-label="Indian flag" role="img"><span /></span>        </div>
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
                {isHindi
                  ? 'भारत सरकार • ग्रामीण विकास मंत्रालय • भू-संसाधन विभाग (भू-सं.वि.)'
                  : 'Government of India • Ministry of Rural Development'}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-300 leading-tight">
                {isHindi
                  ? 'Department of Land Resources (DoLR), MoRD • Government of India'
                  : 'Department of Land Resources (DoLR)'}
              </p>
              <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white font-serif leading-none">
                  {isHindi ? 'राष्ट्रीय भूमि शासन मंच' : 'National Land Governance Platform'}
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

            {/* Header Search Box */}
            <div className="relative hidden lg:block">
              <label htmlFor="global-search" className="sr-only">
                {t('search_platform')}
              </label>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="global-search"
                className="focus-ring h-9 w-60 xl:w-72 border border-white/30 bg-white/10 pl-9 pr-3 text-xs text-white placeholder:text-slate-300 backdrop-blur-xs transition-all focus:bg-white focus:text-slate-800 focus:placeholder:text-slate-400"
                data-testid="input-global-search"
                placeholder={
                  isHindi
                    ? 'नीतियां, राजपत्र, भू-आधार ULPIN खोजें...'
                    : 'Search gazettes, land acts, ULPIN...'
                }
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
              <div className="relative">
                <button 
                  className={`focus-ring hidden border border-white/30 p-2 sm:block ${notifsOpen ? 'bg-white text-[#132f4c]' : ''}`} 
                  data-testid="button-notifications" 
                  type="button" 
                  aria-label="Notifications"
                  onClick={() => setNotifsOpen(!notifsOpen)}
                >
                  <div className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#f2b134]"></span>
                  </div>
                </button>
                {notifsOpen && (
                  <div className="absolute right-0 top-11 z-50 w-80 border border-slate-300 bg-white text-slate-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
                      <h3 className="text-xs font-bold text-[#1E293B]">Notification Center</h3>
                      <button onClick={() => setShowNotifSettings(!showNotifSettings)} className="text-[10px] text-[#1D4ED8] hover:underline font-bold">Settings</button>
                    </div>
                    {showNotifSettings ? (
                      <div className="p-4 space-y-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Alert Preferences</p>
                        <label className="flex items-start gap-2 text-xs text-slate-700">
                          <input type="checkbox" defaultChecked className="mt-0.5 accent-[#1E293B]" />
                          Email me when new Cabinet Drafts are published
                        </label>
                        <label className="flex items-start gap-2 text-xs text-slate-700">
                          <input type="checkbox" defaultChecked className="mt-0.5 accent-[#1E293B]" />
                          Alert me of Land Dispute Surge warnings in my state
                        </label>
                        <label className="flex items-start gap-2 text-xs text-slate-700">
                          <input type="checkbox" className="mt-0.5 accent-[#1E293B]" />
                          Weekly digest of Pilot progress
                        </label>
                        <button onClick={() => setShowNotifSettings(false)} className="w-full bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 mt-2">Back to Notifications</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex border-b border-slate-200">
                          <button onClick={() => setNotifsTab('Ministry')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${notifsTab === 'Ministry' ? 'border-b-2 border-[#1E293B] text-[#1E293B]' : 'text-slate-500 hover:bg-slate-50'}`}>Ministry</button>
                          <button onClick={() => setNotifsTab('Workspace')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${notifsTab === 'Workspace' ? 'border-b-2 border-[#1E293B] text-[#1E293B]' : 'text-slate-500 hover:bg-slate-50'}`}>Workspaces</button>
                          <button onClick={() => setNotifsTab('Simulation')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${notifsTab === 'Simulation' ? 'border-b-2 border-[#1E293B] text-[#1E293B]' : 'text-slate-500 hover:bg-slate-50'}`}>Simulations</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-0">
                          {notifsTab === 'Ministry' && (
                            <div className="divide-y divide-slate-100">
                              {notifications && notifications.length > 0 ? (
                                notifications.map((n: any) => (
                                  <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                                    <p className={`text-xs font-bold ${n.type === 'SUCCESS' ? 'text-[#15803D]' : 'text-[#1E293B]'}`}>{n.title}</p>
                                    <p className="text-[11px] text-slate-600 mt-1">{n.content}</p>
                                    <p className="text-[10px] text-slate-400 mt-2">
                                      {new Date(n.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <div className="p-6 text-center text-slate-500 text-xs">
                                  No new notifications
                                </div>
                              )}
                            </div>
                          )}
                          {notifsTab !== 'Ministry' && (
                            <div className="p-6 text-center text-slate-500 text-xs">
                              No new notifications
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="relative flex items-center gap-2">
                <button
                  onClick={toggleEvaluatorMode}
                  className={`focus-ring hidden lg:flex h-9 items-center gap-1.5 px-2.5 text-xs font-bold border transition-colors cursor-pointer ${
                    evaluatorMode
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                      : 'border-slate-500 bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title="Toggle open evaluator mode to unlock all routes during SIH evaluation"
                  type="button"
                >
                  <span className={`h-2 w-2 rounded-full ${evaluatorMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span>Evaluator Pass: {evaluatorMode ? 'ON' : 'OFF'}</span>
                </button>

                {isAuthenticated ? (
                  <div className="flex h-9 items-center gap-2 border border-[#e7a62b] bg-[#f2b134] px-2.5 text-left text-xs font-bold text-[#132f4c]" title="Your verified account role">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Role: {activeRole}</span>
                    <span className="sm:hidden">{activeRole}</span>
                  </div>
                ) : (
                  <>
                    <button
                      className="focus-ring flex h-9 items-center gap-2 border border-[#e7a62b] bg-[#f2b134] px-2.5 text-left text-xs font-bold text-[#132f4c]"
                      data-testid="button-role-switcher"
                      type="button"
                      aria-expanded={roleOpen}
                      onClick={() => setRoleOpen((open) => !open)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Demo Persona: {activeRole}</span>
                      <span className="sm:hidden">{activeRole}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {roleOpen && (
                      <div className="absolute right-0 top-11 z-50 w-56 border border-slate-400 bg-white py-1 text-slate-800 shadow-lg">
                        <p className="border-b border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Switch demo persona</p>
                        {roles.map((role) => (
                          <button
                            className={`focus-ring block w-full px-3 py-2 text-left text-xs hover:bg-slate-100 ${role === activeRole ? 'bg-slate-100 font-bold text-[#132f4c]' : ''}`}
                            data-testid={`button-role-${role.toLowerCase().replaceAll(' ', '-')}`}
                            key={role}
                            type="button"
                            onClick={() => { setActiveRole(role); setRoleOpen(false); }}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            
            <div className="relative border-l border-white/30 pl-3">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className={`focus-ring flex h-9 items-center justify-center gap-2 border border-white/30 bg-[#244562] px-2.5 sm:px-0 sm:w-9 ${profileOpen ? 'bg-[#1e3a53]' : ''}`}
                title="User Profile"              >
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#f2b134]"></span>
                </div>
              </button>

              {notifsOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 border border-slate-300 bg-white text-slate-800 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
                    <h3 className="text-xs font-bold text-[#1E293B]">{t('notification_center')}</h3>
                    <button
                      onClick={() => setShowNotifSettings(!showNotifSettings)}
                      className="text-[10px] text-[#1D4ED8] hover:underline font-bold"
                    >
                      {t('settings')}
                    </button>
                  </div>
                  {showNotifSettings ? (
                    <div className="p-4 space-y-4">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">
                        {t('alert_preferences')}
                      </p>
                      <label className="flex items-start gap-2 text-xs text-slate-700">
                        <input type="checkbox" defaultChecked className="mt-0.5 accent-[#1E293B]" />
                        Email me when new Cabinet Drafts are published
                      </label>
                      <label className="flex items-start gap-2 text-xs text-slate-700">
                        <input type="checkbox" defaultChecked className="mt-0.5 accent-[#1E293B]" />
                        Alert me of Land Dispute Surge warnings in my state
                      </label>
                      <label className="flex items-start gap-2 text-xs text-slate-700">
                        <input type="checkbox" className="mt-0.5 accent-[#1E293B]" />
                        Weekly digest of Pilot progress
                      </label>
                      <button
                        onClick={() => setShowNotifSettings(false)}
                        className="w-full bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 mt-2"
                      >
                        {t('back_to_notifications')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setNotifsTab('Ministry')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase ${
                            notifsTab === 'Ministry'
                              ? 'border-b-2 border-[#1E293B] text-[#1E293B]'
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {t('ministry')}
                        </button>
                        <button
                          onClick={() => setNotifsTab('Workspace')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase ${
                            notifsTab === 'Workspace'
                              ? 'border-b-2 border-[#1E293B] text-[#1E293B]'
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {t('workspaces')}
                        </button>
                        <button
                          onClick={() => setNotifsTab('Simulation')}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase ${
                            notifsTab === 'Simulation'
                              ? 'border-b-2 border-[#1E293B] text-[#1E293B]'
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {t('simulations')}
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-0">
                        {notifsTab === 'Ministry' && (
                          <div className="divide-y divide-slate-100">
                            {notifications && notifications.length > 0 ? (
                              notifications.map((n: any) => (
                                <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                                  <p
                                    className={`text-xs font-bold ${
                                      n.type === 'SUCCESS' ? 'text-[#15803D]' : 'text-[#1E293B]'
                                    }`}
                                  >
                                    {n.title}
                                  </p>
                                  <p className="text-[11px] text-slate-600 mt-1">{n.content}</p>
                                  <p className="text-[10px] text-slate-400 mt-2">
                                    {new Date(n.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-slate-500 text-xs">
                                {t('no_new_notifications')}
                              </div>
                            )}
                          </div>
                        )}
                        {notifsTab !== 'Ministry' && (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            {t('no_new_notifications')}
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
                <div
                  className="flex h-9 items-center gap-2 border border-[#e7a62b] bg-[#f2b134] px-2.5 text-left text-xs font-bold text-[#132f4c]"
                  title="Your verified Government clearance role"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {t('role_label')}: {t(activeRole)}
                  </span>
                  <span className="sm:hidden">{t(activeRole)}</span>
                </div>
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

      {/* 4. Official Central Government Horizontal Navigation Bar (Only for authenticated users with role access) */}
      {isAuthenticated && (
        <nav
          aria-label="National Portal Navigation"
          className="hidden md:block bg-[#132f4c] border-b border-[#244562] text-white overflow-x-auto"
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
                    <span>{isHindi ? hiLabel : label}</span>
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