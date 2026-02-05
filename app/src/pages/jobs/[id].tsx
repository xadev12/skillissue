import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useJob } from '../../hooks/useJobs';
import { StatusBadge } from '../../components/StatusBadge';
import { useState } from 'react';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, publicKey } = useWallet();
  const { job, loading, error, acceptJob, submitWork, approveWork } = useJob(id as string);
  const [submitUrl, setSubmitUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isPoster = job && publicKey && job.poster.walletAddress === publicKey.toString();
  const isWorker = job && publicKey && job.worker?.walletAddress === publicKey.toString();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Job not found'}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const categoryIcons: Record<string, string> = {
    CODE: '💻',
    CONTENT: '✍️',
    PHYSICAL: '📍',
    OTHER: '📋',
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
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: 'Expired', color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (days <= 3) return { text: `${days} days left`, color: 'text-yellow-600' };
    return { text: `${days} days left`, color: 'text-green-600' };
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to jobs
            </Link>
            <WalletMultiButton className="!bg-gray-900 hover:!bg-gray-800" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{categoryIcons[job.category] || '📋'}</span>
              <StatusBadge status={job.status} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">${job.budget}</p>
              <p className="text-sm text-gray-500">USDC</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1">
              👤 {job.poster.walletAddress.slice(0, 6)}...{job.poster.walletAddress.slice(-4)}
              {job.poster.reputationScore > 0 && (
                <span className="text-yellow-500">⭐ {job.poster.reputationScore.toFixed(1)}</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              📅 Posted {formatDate(job.createdAt)}
            </span>
            <span className={`flex items-center gap-1 ${deadlineStatus.color}`}>
              ⏰ {deadlineStatus.text}
            </span>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.locationLat && job.locationLng && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📍 Location Required</h3>
              <p className="text-sm text-gray-600">
                Within {job.locationRadius || 100}m of coordinates ({job.locationLat.toFixed(4)}, {job.locationLng.toFixed(4)})
              </p>
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {actionError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{actionError}</p>
            </div>
          )}

          {job.status === 'OPEN' && (
            <div>
              {connected ? (
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting || isPoster}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Processing...' : isPoster ? 'You posted this job' : 'Accept Job'}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Connect your wallet to accept this job</p>
                  <WalletMultiButton className="!bg-gray-900 hover:!bg-gray-800" />
                </div>
              )}
            </div>
          )}

          {job.status === 'LOCKED' && isWorker && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Your Work</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deliverable URL
                  </label>
                  <input
                    type="url"
                    value={submitUrl}
                    onChange={(e) => setSubmitUrl(e.target.value)}
                    placeholder="https://github.com/... or https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !submitUrl.trim()}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Work'}
                </button>
              </div>
            </div>
          )}

          {job.status === 'LOCKED' && !isWorker && (
            <div className="text-center py-4">
              <p className="text-gray-600">This job is in progress</p>
              {job.worker && (
                <p className="text-sm text-gray-500 mt-2">
                  Worker: {job.worker.walletAddress.slice(0, 6)}...{job.worker.walletAddress.slice(-4)}
                </p>
              )}
            </div>
          )}

          {job.status === 'SUBMITTED' && isPoster && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Submission</h3>
              {job.deliverableUrl && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Deliverable:</p>
                  <a
                    href={job.deliverableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {job.deliverableUrl}
                  </a>
                </div>
              )}
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Processing...' : 'Approve & Release Payment'}
              </button>
              <p className="text-sm text-gray-500 text-center mt-2">
                This will release {job.budget * 0.95} USDC to the worker
              </p>
            </div>
          )}

          {job.status === 'SUBMITTED' && !isPoster && (
            <div className="text-center py-4">
              <p className="text-gray-600">Work submitted, awaiting approval</p>
            </div>
          )}

          {job.status === 'COMPLETED' && (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">✓ Job completed</p>
              {job.completedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Completed on {formatDate(job.completedAt)}
                </p>
              )}
            </div>
          )}

          {job.status === 'DISPUTED' && (
            <div className="text-center py-4">
              <p className="text-red-600 font-medium">⚠️ Dispute in progress</p>
            </div>
          )}
        </div>

        {/* Escrow Info */}
        {job.squadsVaultAddress && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">🔒 Escrow Protected</h3>
            <p className="text-sm text-blue-700">
              Funds held securely on Solana. Payment released upon job completion.
            </p>
            <a
              href={`https://explorer.solana.com/address/${job.squadsVaultAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              View on Explorer →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
