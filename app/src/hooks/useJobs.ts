import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'COMPLETED' | 'DISPUTED';
  category: 'CODE' | 'CONTENT' | 'PHYSICAL' | 'OTHER';
  proofType: 'MANUAL' | 'CODE' | 'CONTENT' | 'PHOTO';
  deadline: string;
  createdAt: string;
  completedAt?: string;
  squadsVaultAddress: string | null;
  deliverableUrl?: string;
  deliverableHash?: string;
  proofData?: Record<string, any>;
  locationLat?: number;
  locationLng?: number;
  locationRadius?: number;
  poster: {
    walletAddress: string;
    reputationScore: number;
  };
  worker?: {
    walletAddress: string;
    reputationScore: number;
  };
}

interface UseJobsOptions {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export function useJobs(options: UseJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (options.status) queryParams.set('status', options.status);
      if (options.category) queryParams.set('category', options.category);
      if (options.page) queryParams.set('page', options.page.toString());
      if (options.limit) queryParams.set('limit', options.limit.toString());

      const response = await fetch(`${API_URL}/api/jobs?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options.status, options.category, options.page, options.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}

export function useJob(jobId: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }

      const data = await response.json();
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const acceptJob = async (workerWallet: string) => {
    if (!jobId) throw new Error('No job ID');

    const response = await fetch(`${API_URL}/api/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerWallet }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to accept job');
    }

    await fetchJob();
  };

  const submitWork = async (deliverableUrl: string, deliverableHash?: string, proofData?: Record<string, any>) => {
    if (!jobId) throw new Error('No job ID');

    const response = await fetch(`${API_URL}/api/jobs/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverableUrl, deliverableHash, proofData }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to submit work');
    }

    await fetchJob();
  };

  const approveWork = async (posterWallet: string) => {
    if (!jobId) throw new Error('No job ID');

    const response = await fetch(`${API_URL}/api/jobs/${jobId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posterWallet }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to approve work');
    }

    await fetchJob();
  };

  return { job, loading, error, refetch: fetchJob, acceptJob, submitWork, approveWork };
}
