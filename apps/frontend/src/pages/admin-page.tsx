import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  FileSearch,
  HardDrive,
  Network,
  Shield,
  ShieldAlert,
  Trash2,
  XCircle,
  Power,
  PowerOff,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
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
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1E293B] md:text-4xl flex items-center gap-3">
            {title} <Shield className="h-6 w-6 text-[#1D4ED8]" />
          </h1>
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
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
        <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });

  const { data: auditLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.get('/admin/audit-logs').then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string, isActive: boolean }) => 
      api.patch(`/admin/users/${userId}/status`, { is_active: isActive }),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.isActive ? 'activated' : 'suspended'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update user status');
    }
  });

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    statusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.full_name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <PageFrame
      kicker="Platform Operations / Restricted"
      title="Super Admin Console"
      description="Manage source verification queues, institutional access workflows, and monitor core infrastructure health."
    >
      <div className="mb-6 flex items-start gap-3 border-l-4 border-[#1D4ED8] bg-[#EFF6FF] p-4 text-sm text-[#1E3A8A]">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
        <div>
          <p className="font-bold text-[#1E3A8A]">Super Admin Privileges Active</p>
          <p className="mt-1 font-medium text-slate-700">Actions taken in this console directly affect platform availability and data retention policies. Proceed with caution.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Queues */}
        <div className="space-y-6">
          
          <Panel title="Platform Users Management">
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="py-2 px-3 text-xs border border-slate-300 focus:outline-none focus:border-[#1D4ED8] bg-white"
                >
                  <option value="ALL">All Roles</option>
                  <option value="public">Public</option>
                  <option value="researcher">Researcher</option>
                  <option value="official">Official</option>
                  <option value="institution">Institution Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold border-r border-slate-200">User</th>
                    <th className="px-4 py-3 font-bold border-r border-slate-200">Role</th>
                    <th className="px-4 py-3 font-bold border-r border-slate-200">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoadingUsers ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No users found matching your filters.</td></tr>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200">
                          <span className="font-bold text-[#1E293B] block mb-1">{user.full_name}</span>
                          <span className="text-slate-500 text-[10px]">{user.email}</span>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200">
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-sm text-[10px] uppercase">{user.role}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 border-r border-slate-200">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-sm"><CheckCircle2 className="h-3 w-3" /> Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-sm"><XCircle className="h-3 w-3" /> Suspended</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.is_active ? (
                              <button 
                                onClick={() => toggleUserStatus(user.id, true)}
                                disabled={statusMutation.isPending}
                                className="p-1 text-[#B91C1C] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors disabled:opacity-50" 
                                title="Suspend User"
                              >
                                <PowerOff className="h-4 w-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleUserStatus(user.id, false)}
                                disabled={statusMutation.isPending}
                                className="p-1 text-[#15803D] hover:bg-[#F0FDF4] border border-transparent hover:border-[#BBF7D0] transition-colors disabled:opacity-50" 
                                title="Reactivate User"
                              >
                                <Power className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="System Audit Logs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FFFBEB] text-[10px] uppercase tracking-wider text-[#92400E] border-b border-[#FDE68A] sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-bold border-r border-[#FDE68A]">Timestamp</th>
                    <th className="px-4 py-3 font-bold border-r border-[#FDE68A]">User ID</th>
                    <th className="px-4 py-3 font-bold border-r border-[#FDE68A]">Action</th>
                    <th className="px-4 py-3 font-bold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoadingLogs ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading audit logs...</td></tr>
                  ) : auditLogs.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No audit logs found.</td></tr>
                  ) : (
                    auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200 font-mono text-slate-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200">
                          <span className="font-mono text-[10px] text-slate-500 block">{log.user_id ? log.user_id.slice(0, 8) : 'System'}</span>
                        </td>
                        <td className="px-4 py-3 text-[#1E293B] font-bold border-r border-slate-200">{log.action}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="text-[11px]">{log.detail || 'N/A'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

        </div>

        {/* Right Column: Infra Health */}
        <div className="space-y-6">
          <Panel title="Infrastructure Health Dashboard">
            <div className="p-5 space-y-5">
              
              <div className="border border-slate-200 p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#1E293B]" />
                    <span className="font-bold text-[#1E293B] text-xs">PostGIS Spatial DB</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#15803D] uppercase"><CheckCircle2 className="h-3 w-3" /> Operational</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Conn Pool</p>
                    <p className="font-mono text-xs font-bold">14 / 50</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">QPS</p>
                    <p className="font-mono text-xs font-bold">2,405</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 p-4 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-[#1E293B]" />
                    <span className="font-bold text-[#1E293B] text-xs">Vector Search (Chroma)</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#15803D] uppercase"><CheckCircle2 className="h-3 w-3" /> Operational</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Latency (p95)</p>
                    <p className="font-mono text-xs font-bold">42ms</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Index Size</p>
                    <p className="font-mono text-xs font-bold">4.2 GB</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 p-4 bg-[#FFFBEB]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-[#B45309]" />
                    <span className="font-bold text-[#B45309] text-xs">Tesseract OCR Cluster</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#B45309] uppercase"><Activity className="h-3 w-3" /> High Load</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-[#FDE68A] pt-3">
                  <div>
                    <p className="text-[10px] text-[#92400E] uppercase tracking-wider mb-1">Queue Backlog</p>
                    <p className="font-mono text-xs font-bold text-[#B45309]">1,840 Docs</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#92400E] uppercase tracking-wider mb-1">Throughput</p>
                    <p className="font-mono text-xs font-bold text-[#B45309]">14 pages/s</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-[#FDE68A] rounded-sm overflow-hidden">
                  <div className="h-full bg-[#B45309]" style={{ width: '85%' }} />
                </div>
              </div>

            </div>
          </Panel>
        </div>

      </div>
    </PageFrame>
  );
}
