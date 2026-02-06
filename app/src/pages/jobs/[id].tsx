import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useJob } from '../../hooks/useJobs';
import { Layout } from '../../components/Layout';
import { useState } from 'react';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, publicKey } = useWallet();
  const { job, loading, error, acceptJob, submitWork, approveWork } = useJob(id as string);
  const [submitUrl, setSubmitUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isPoster = !!(job && publicKey && job.poster.walletAddress === publicKey.toString());
  const isWorker = !!(job && publicKey && job.worker?.walletAddress === publicKey.toString());

  const handleAccept = async () => {
    if (!publicKey) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await acceptJob(publicKey.toString());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!submitUrl.trim()) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await submitWork(submitUrl);
      setSubmitUrl('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!publicKey) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await approveWork(publicKey.toString());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve work');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-[#6B4EE6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50">Loading job...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg mb-2">{error || 'Job not found'}</p>
            <Link href="/jobs" className="text-[#6B4EE6] hover:text-[#7B5EF6] transition-colors">
              Back to jobs
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const categoryIcons: Record<string, string> = {
    CODE: '{}',
    CONTENT: 'Aa',
    PHYSICAL: '',
    OTHER: '?',
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    LOCKED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    COMPLETED: 'bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/20',
    DISPUTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeadlineStatus = () => {
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    const days = Math.ceil(hours / 24);

    if (hours < 0) return { text: 'Expired', color: 'text-red-400', urgent: true };
    if (hours < 24) return { text: `${hours}h left`, color: 'text-amber-400', urgent: true };
    if (days <= 3) return { text: `${days} days left`, color: 'text-amber-400', urgent: true };
    return { text: `${days} days left`, color: 'text-white/50', urgent: false };
  };

  const deadlineStatus = getDeadlineStatus();
  const workerPayout = job.budget * 0.95;
  const platformFee = job.budget * 0.04;
  const jurorFee = job.budget * 0.01;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to jobs
        </Link>

        {/* Job Header */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6B4EE6]/20 to-[#2DD4BF]/20 flex items-center justify-center text-white/60 text-lg font-mono shrink-0">
                {categoryIcons[job.category] || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                    {job.category}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[job.status]}`}>
                    {job.status}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{job.title}</h1>
              </div>
            </div>
            <div className="text-left sm:text-right bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-2xl sm:text-3xl font-bold text-white">${job.budget}</p>
              <p className="text-sm text-white/40">USDC</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-6 pb-6 border-b border-white/[0.06]">
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px]">
                {job.poster.walletAddress.slice(0, 2)}
              </div>
              <span className="font-mono">
                {job.poster.walletAddress.slice(0, 6)}...{job.poster.walletAddress.slice(-4)}
              </span>
              {job.poster.reputationScore > 0 && (
                <span className="text-[#2DD4BF] font-medium">
                  {job.poster.reputationScore.toFixed(1)}
                </span>
              )}
            </span>
            <span className="text-white/30">|</span>
            <span>Posted {formatDate(job.createdAt)}</span>
            <span className="text-white/30">|</span>
            <span className={deadlineStatus.color}>
              {deadlineStatus.text}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-3">Description</h2>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>

          {/* Location (for physical jobs) */}
          {job.locationLat && job.locationLng && (
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
              <h3 className="text-sm font-medium text-amber-400 mb-2">Location Required</h3>
              <p className="text-sm text-white/60">
                Within {job.locationRadius || 100}m of coordinates ({job.locationLat.toFixed(4)}, {job.locationLng.toFixed(4)})
              </p>
            </div>
          )}

          {/* Budget Breakdown */}
          <div className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-3">Budget Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Worker receives (95%)</span>
                <span className="text-white font-medium">${workerPayout.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Platform fee (4%)</span>
                <span className="text-white/60">${platformFee.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Juror pool (1%)</span>
                <span className="text-white/60">${jurorFee.toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 sm:p-8">
          {actionError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400">{actionError}</p>
            </div>
          )}

          {job.status === 'OPEN' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Accept this job</h2>
              {connected ? (
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting || isPoster}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#6B4EE6]/25"
                >
                  {isSubmitting ? 'Processing...' : isPoster ? 'You posted this job' : 'Accept Job'}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-white/50 mb-4">Connect your wallet to accept this job</p>
                  <WalletMultiButton className="!bg-gradient-to-r !from-[#6B4EE6] !to-[#5B3FD6] hover:!from-[#7B5EF6] hover:!to-[#6B4EE6] !rounded-xl !h-12 !px-6 !font-medium" />
                </div>
              )}
              {!isPoster && connected && (
                <p className="text-center text-white/40 text-sm mt-4">
                  By accepting, you commit to completing this job by the deadline
                </p>
              )}
            </div>
          )}

          {job.status === 'LOCKED' && isWorker && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Submit Your Work</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Deliverable URL
                  </label>
                  <input
                    type="url"
                    value={submitUrl}
                    onChange={(e) => setSubmitUrl(e.target.value)}
                    placeholder="https://github.com/... or https://..."
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !submitUrl.trim()}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#3DE4CF] hover:to-[#24C8B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#2DD4BF]/25"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Work'}
                </button>
              </div>
            </div>
          )}

          {job.status === 'LOCKED' && !isWorker && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white/60 mb-2">Job in progress</p>
              {job.worker && (
                <p className="text-sm text-white/40 font-mono">
                  Worker: {job.worker.walletAddress.slice(0, 6)}...{job.worker.walletAddress.slice(-4)}
                </p>
              )}
            </div>
          )}

          {job.status === 'SUBMITTED' && isPoster && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Review Submission</h2>
              {job.deliverableUrl && (
                <div className="mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <p className="text-sm text-white/40 mb-2">Deliverable</p>
                  <a
                    href={job.deliverableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B4EE6] hover:text-[#7B5EF6] break-all transition-colors"
                  >
                    {job.deliverableUrl}
                  </a>
                </div>
              )}
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#3DE4CF] hover:to-[#24C8B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#2DD4BF]/25"
              >
                {isSubmitting ? 'Processing...' : 'Approve & Release Payment'}
              </button>
              <p className="text-sm text-white/40 text-center mt-4">
                This will release ${workerPayout.toFixed(2)} USDC to the worker
              </p>
            </div>
          )}

          {job.status === 'SUBMITTED' && !isPoster && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white/60">Work submitted, awaiting approval</p>
            </div>
          )}

          {job.status === 'COMPLETED' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#2DD4BF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#2DD4BF] font-medium text-lg">Job Completed</p>
              {job.completedAt && (
                <p className="text-sm text-white/40 mt-2">
                  Completed on {formatDate(job.completedAt)}
                </p>
              )}
            </div>
          )}

          {job.status === 'DISPUTED' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 font-medium text-lg">Dispute in Progress</p>
              <p className="text-sm text-white/40 mt-2">
                This job is under review by jurors
              </p>
            </div>
          )}
        </div>

        {/* Escrow Info */}
        {job.squadsVaultAddress && (
          <div className="mt-6 p-4 bg-[#6B4EE6]/5 rounded-xl border border-[#6B4EE6]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6B4EE6]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#6B4EE6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#6B4EE6] mb-1">Escrow Protected</h3>
                <p className="text-sm text-white/50 mb-2">
                  Funds held securely on Solana. Payment released upon job completion.
                </p>
                <a
                  href={`https://explorer.solana.com/address/${job.squadsVaultAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#6B4EE6] hover:text-[#7B5EF6] transition-colors inline-flex items-center gap-1"
                >
                  View on Explorer
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
