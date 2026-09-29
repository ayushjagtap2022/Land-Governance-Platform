import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Lightbulb,
  Plus,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';

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
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1E293B] md:text-4xl">{title}</h1>
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

type PilotStatus = 'Proposal Under Review' | 'Technical Committee Shortlisted' | 'Grant Sanctioned' | 'Field Pilot Underway';

function StatusPill({ status }: { status: PilotStatus }) {
  const styles = {
    'Proposal Under Review': 'bg-slate-100 text-slate-600',
    'Technical Committee Shortlisted': 'bg-[#EFF6FF] text-[#1D4ED8]',
    'Grant Sanctioned': 'bg-[#FFFBEB] text-[#B45309]',
    'Field Pilot Underway': 'bg-[#F0FDF4] text-[#15803D]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function InnovationPage() {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => api.get('/innovation/challenges').then(r => r.data),
  });

  const { data: pilots = [], isLoading: isLoadingPilots } = useQuery({
    queryKey: ['pilots'],
    // Use showcase for now or fallback to empty array if no global endpoint
    queryFn: () => api.get('/innovation/showcase').then(r => r.data).catch(() => []),
  });

  const proposalSchema = z.object({
    challenge_id: z.string().min(1, 'Challenge selection is required'),
    title: z.string().min(3, 'Title is required'),
    abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
    requested_funding: z.number().min(0, 'Funding must be a positive number'),
    team_members: z.string().min(1, 'At least one team member is required (comma separated)'),
    pdf_file: z.any().refine((files) => files?.length == 1, "PDF file is required"),
  });
  
  type ProposalForm = z.infer<typeof proposalSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ProposalForm) => {
      // transform team_members to array of objects
      const members = data.team_members.split(',').map(name => ({ name: name.trim() }));
      const payload = {
        title: data.title,
        abstract: data.abstract,
        requested_funding: data.requested_funding,
        team_members: members
      };
      // Step 1: Create Proposal JSON
      const res = await api.post(`/innovation/challenges/${data.challenge_id}/proposals`, payload);
      const proposalId = res.data.id;

      // Step 2: Upload PDF Document to S3
      const fileList = data.pdf_file as FileList;
      if (fileList && fileList.length > 0) {
        const formData = new FormData();
        formData.append('file', fileList[0]);
        await api.post(`/innovation/proposals/${proposalId}/upload-document`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return res;
    },
    onSuccess: () => {
      toast.success('Proposal Submitted Successfully', {
        description: 'Your proposal has been securely logged for review by the Technical Committee.'
      });
      reset();
      setShowSubmitModal(false);
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      const message = err.response?.data?.detail || 'Failed to submit proposal';
      toast.error(message);
    }
  });

  const onSubmit = (data: ProposalForm) => {
    submitMutation.mutate(data);
  };

  const selectedFile = watch('pdf_file') as FileList | undefined;
  const fileName = selectedFile && selectedFile.length > 0 ? selectedFile[0].name : null;

  return (
    <PageFrame
      kicker="Open collaboration / pilots"
      title="Open Innovation & Grant Portal"
      description="A structured entry point for institutions and practitioners to propose and pilot responsible land-governance technology."
      actions={
        <button 
          className="focus-ring flex items-center gap-2 border border-[#1E293B] bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
          onClick={() => setShowSubmitModal(true)}
        >
          <Lightbulb className="h-3.5 w-3.5" /> Submit Proposal
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Column: Challenges */}
        <div className="space-y-6">
          <Panel title="Active Research Challenges">
            <div className="divide-y divide-slate-200">
              {challenges.map(challenge => (
                <div key={challenge.id} className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{challenge.id}</span>
                    <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
                      Grant: ₹{challenge.total_grant_pool} Lakhs
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1E293B] text-base leading-snug mb-3">{challenge.title}</h3>
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Deadline: <span className="font-semibold text-slate-800">{new Date(challenge.deadline).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" /> Eligibility: <span>{challenge.eligibility_criteria}</span>
                    </p>
                  </div>
                  <button className="w-full focus-ring flex items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Download RFP Guidelines
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="space-y-6">
          <Panel title="Transparency Leaderboard & Pilot Tracker">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Pilot ID</th>
                    <th className="px-4 py-3 font-bold">Proposal Title</th>
                    <th className="px-4 py-3 font-bold">Investigator & Org</th>
                    <th className="px-4 py-3 font-bold">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pilots.map((pilot: any) => (
                    <tr key={pilot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-slate-500">{pilot.id.slice(0, 8)}</td>
                      <td className="px-4 py-4 font-semibold text-[#1E293B] max-w-xs">{pilot.title}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <span className="block font-semibold text-slate-800">{pilot.team_members?.[0]?.name || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill status={pilot.status.replace('_', ' ').toUpperCase()} />
                      </td>
                    </tr>
                  ))}
                  {pilots.length === 0 && !isLoadingPilots && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-500">No proposals found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Showing 4 of 24 active proposals.</span>
              <button className="font-bold text-[#1E293B] hover:underline">View All Submissions</button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 p-4">
          <div className="w-full max-w-xl bg-white shadow-xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50 sticky top-0 z-10">
              <h3 className="font-bold text-[#1E293B]">Submit Research Proposal</h3>
              <button onClick={() => !submitMutation.isPending && setShowSubmitModal(false)} className="text-slate-500 hover:text-[#1E293B] disabled:opacity-50" disabled={submitMutation.isPending}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Title</label>
                      <input type="text" placeholder="e.g. AI Models" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" {...register('title')} />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Team Members (comma separated)</label>
                      <input type="text" placeholder="Dr. Jane Doe, NIC Team" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" {...register('team_members')} />
                      {errors.team_members && <p className="text-xs text-red-500 mt-1">{errors.team_members.message}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Challenge</label>
                    <select className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" {...register('challenge_id')}>
                      <option value="">Select a Challenge...</option>
                      {challenges.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    {errors.challenge_id && <p className="text-xs text-red-500 mt-1">{errors.challenge_id.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Abstract</label>
                    <textarea 
                      placeholder="Brief overview of methodology and expected outcomes..." 
                      className="w-full border border-slate-300 px-3 py-2 text-sm h-24 resize-none focus-ring"
                      {...register('abstract')}
                    />
                    {errors.abstract && <p className="text-xs text-red-500 mt-1">{errors.abstract.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Funding (₹ Lakhs)</label>
                    <input type="number" placeholder="e.g. 25" className="w-full border border-slate-300 px-3 py-2 text-sm focus-ring" {...register('requested_funding', { valueAsNumber: true })} />
                    {errors.requested_funding && <p className="text-xs text-red-500 mt-1">{errors.requested_funding.message}</p>}
                  </div>

                  <div className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center relative cursor-pointer transition-colors ${fileName ? 'border-[#15803D] bg-[#F0FDF4]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      {...register('pdf_file')} 
                    />
                    {fileName ? (
                      <>
                        <div className="h-10 w-10 bg-[#15803D]/10 rounded-full flex items-center justify-center mb-2">
                          <CheckCircle2 className="h-5 w-5 text-[#15803D]" />
                        </div>
                        <p className="text-sm font-bold text-[#15803D]">File Selected</p>
                        <p className="text-xs text-[#15803D] mt-1 font-mono truncate max-w-[250px]">{fileName}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-[#1E293B]">Select Proposal (PDF)</p>
                        <p className="text-xs text-slate-500 mt-1">Maximum file size 10MB.</p>
                      </>
                    )}
                    {errors.pdf_file && <p className="text-xs text-red-500 mt-2 z-10 relative">{errors.pdf_file.message as string}</p>}
                  </div>
                </div>
                
                <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2 bg-slate-50 sticky bottom-0">
                  <button 
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitMutation.isPending}
                    className="px-4 py-2 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="px-4 py-2 text-xs font-bold bg-[#1E293B] hover:bg-slate-800 text-white flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-70 disabled:cursor-wait"
                  >
                    {submitMutation.isPending ? 'Submitting...' : <><Send className="h-3.5 w-3.5" /> Submit Proposal</>}
                  </button>
                </div>
              </>
            </form>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
