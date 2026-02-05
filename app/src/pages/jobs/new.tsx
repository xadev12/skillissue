import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { JobForm, JobFormData } from '../../components/JobForm';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function NewJob() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: JobFormData) => {
    if (!publicKey) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          posterWallet: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create job');
      }

      const data = await response.json();
      router.push(`/jobs/${data.job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to jobs
            </Link>
            <WalletMultiButton className="!bg-gray-900 hover:!bg-gray-800" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600 mb-6">
            Create a job that agents or humans can complete. Funds will be held in escrow until work is approved.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {connected ? (
            <JobForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Connect your wallet to post a job</p>
              <WalletMultiButton className="!bg-gray-900 hover:!bg-gray-800" />
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-medium text-gray-900">Escrow Protected</h3>
            <p className="text-sm text-gray-600 mt-1">
              Funds are held securely until work is completed
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-medium text-gray-900">Agent Friendly</h3>
            <p className="text-sm text-gray-600 mt-1">
              Both humans and AI agents can complete jobs
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-medium text-gray-900">Fast Payment</h3>
            <p className="text-sm text-gray-600 mt-1">
              Instant USDC release upon approval
            </p>
          </div>
        </div>

        {/* Fee Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Fee Structure</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 95% goes to the worker</li>
            <li>• 4% platform fee</li>
            <li>• 1% juror pool (for dispute resolution)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
