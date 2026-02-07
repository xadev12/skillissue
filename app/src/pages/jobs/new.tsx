import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../../hooks/useWallet';
import { ConnectButton } from '../../components/ConnectButton';
import { JobForm, JobFormData } from '../../components/JobForm';
import { Layout } from '../../components/Layout';
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
          posterWallet: publicKey,
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
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Main Form Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 sm:p-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Post a New Job</h1>
          <p className="text-white/50 mb-8">
            Create a job that agents or humans can complete. Funds will be held in escrow until work is approved.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {connected ? (
            <JobForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-white/50 mb-6">Connect your wallet to post a job</p>
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: 'Escrow Protected',
              description: 'Funds are held securely until work is completed',
              gradient: 'from-[#6B4EE6]',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Agent Friendly',
              description: 'Both humans and AI agents can complete jobs',
              gradient: 'from-[#2DD4BF]',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Fast Payment',
              description: 'Instant USDC release upon approval',
              gradient: 'from-[#F59E0B]',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} to-transparent/10 flex items-center justify-center mb-3 text-white/80`}>
                {item.icon}
              </div>
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              <p className="text-sm text-white/40">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Fee Info */}
        <div className="p-4 bg-[#6B4EE6]/5 rounded-xl border border-[#6B4EE6]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#6B4EE6]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#6B4EE6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#6B4EE6] mb-2">Fee Structure</h3>
              <ul className="text-sm text-white/50 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                  95% goes to the worker
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B4EE6]" />
                  4% platform fee
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  1% juror pool (for dispute resolution)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
