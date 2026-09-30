import { useState } from 'react';
import { Bell, ChevronDown, Search, ShieldCheck, UserRound, LogIn, LogOut } from 'lucide-react';
import { useRole, type Role } from '@/context/RoleContext';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const roles: Role[] = ['Researcher', 'Official', 'Institution Admin', 'Public', 'Super Admin'];

export function Header() {
  const { activeRole, setActiveRole, evaluatorMode, toggleEvaluatorMode } = useRole();
  const [search, setSearch] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifsTab, setNotifsTab] = useState('Ministry');
  const [profileOpen, setProfileOpen] = useState(false);
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(res => res.data),
    enabled: isAuthenticated,
  });


  return (
    <header className="relative z-20">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-slate-100 px-4 py-1.5 text-[11px] text-slate-700 md:px-8">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wide">भारत सरकार | Government of India</span>
          <span className="hidden text-slate-400 md:inline">|</span>
          <span className="hidden md:inline">Accessibility tools</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" aria-label="Text size controls">
            <button className="focus-ring border border-slate-400 bg-white px-1.5 py-0.5 font-bold" data-testid="button-font-decrease" type="button">A-</button>
            <button className="focus-ring border border-slate-400 bg-white px-1.5 py-0.5 font-bold" data-testid="button-font-normal" type="button">A</button>
            <button className="focus-ring border border-slate-400 bg-white px-1.5 py-0.5 font-bold" data-testid="button-font-increase" type="button">A+</button>
          </div>
          <button className="focus-ring underline underline-offset-2" data-testid="link-screen-reader" type="button">Screen Reader</button>
          <button className="focus-ring font-semibold" data-testid="button-language" type="button">English <span className="mx-1 text-slate-400">|</span> हिन्दी</button>
          <span className="flag-mark" aria-label="Indian flag" role="img"><span /></span>
        </div>
      </div>

      <div className="bg-[#132f4c] text-white">
        <div className="flex w-full items-center gap-4 px-4 py-3 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity">
            <div className="emblem-mark" aria-label="State Emblem of India placeholder">
              <span>सत्यमेव</span><strong>अशोक</strong><span>जयते</span>
            </div>
            <div className="hidden min-w-0 border-l border-white/30 pl-3 sm:block">
              <p className="truncate text-[12px] font-semibold leading-5">भू-संसाधन विभाग / Department of Land Resources</p>
              <p className="truncate text-[11px] text-slate-300">ग्रामीण विकास मंत्रालय / Ministry of Rural Development</p>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative hidden lg:block">
              <label htmlFor="global-search" className="sr-only">Search the platform</label>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                id="global-search"
                className="focus-ring h-9 w-64 border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-500"
                data-testid="input-global-search"
                placeholder="Search policies, documents, datasets"
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
                title="User Profile"
              >
                {isAuthenticated && <span className="mr-1 hidden lg:inline text-xs font-bold pl-2">{user?.full_name?.split(' ')[0]}</span>}
                <UserRound className="h-4 w-4" />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 top-11 z-50 w-48 border border-slate-400 bg-white py-1 text-slate-800 shadow-lg">
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-slate-200 px-4 py-2">
                        <p className="text-xs font-bold text-[#132f4c]">{user?.full_name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        className="focus-ring flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-slate-100 font-bold"
                        onClick={() => { logout(); setProfileOpen(false); }}
                      >
                        <LogOut className="h-3.5 w-3.5" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setProfileOpen(false)}>
                        <a className="focus-ring flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-slate-100 text-[#132f4c] font-bold">
                          <LogIn className="h-3.5 w-3.5" /> Sign In
                        </a>
                      </Link>
                      <Link href="/register" onClick={() => setProfileOpen(false)}>
                        <a className="focus-ring flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-slate-100 text-slate-600">
                          Create Account
                        </a>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
        <div className="flex h-1" aria-label="National tricolor border">
          <span className="w-1/3 bg-[#e87927]" /><span className="w-1/3 bg-[#f5f1e9]" /><span className="w-1/3 bg-[#27854b]" />
        </div>
      </div>
    </header>
  );
}