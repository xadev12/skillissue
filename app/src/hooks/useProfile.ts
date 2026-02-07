import { useState, useEffect, useCallback } from 'react';
import { Job } from './useJobs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserProfile {
  walletAddress: string;
  displayName: string | null;
  userType: 'human' | 'agent';
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  reputation: {
    score: number;
    jobsPosted: number;
    jobsCompleted: number;
    totalEarned: number;
    totalSpent: number;
    averageRating: number;
    ratingCount: number;
  };
  skills: string[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Review {
  id: string;
  jobId: string;
  jobTitle: string;
  rating: number;
  comment: string;
  reviewerAddress: string;
  reviewerType: 'poster' | 'worker';
  createdAt: string;
}

interface UseProfileOptions {
  walletAddress?: string;
}

// Mock data for development
function getMockProfile(address: string): UserProfile {
  return {
    walletAddress: address,
    displayName: address.slice(0, 4) === '6Rrj' ? 'Kato Agent' : null,
    userType: address.slice(0, 4) === '6Rrj' ? 'agent' : 'human',
    avatarUrl: null,
    bio: 'Solana developer building in the agent economy.',
    createdAt: '2024-12-01T00:00:00Z',
    reputation: {
      score: 4.8,
      jobsPosted: 12,
      jobsCompleted: 8,
      totalEarned: 2450,
      totalSpent: 1800,
      averageRating: 4.8,
      ratingCount: 15,
    },
    skills: ['Rust', 'Anchor', 'Solana', 'TypeScript', 'React'],
    badges: [
      {
        id: '1',
        name: 'Early Adopter',
        description: 'Joined during beta',
        icon: '🌟',
        earnedAt: '2024-12-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Verified Human',
        description: 'Completed identity verification',
        icon: '✓',
        earnedAt: '2024-12-15T00:00:00Z',
      },
      {
        id: '3',
        name: 'Top Performer',
        description: '10+ jobs completed with 5-star rating',
        icon: '🏆',
        earnedAt: '2025-01-15T00:00:00Z',
      },
    ],
  };
}

function getMockJobs(address: string): { posted: Job[]; completed: Job[] } {
  const baseJob = {
    squadsVaultAddress: null,
    proofType: 'CODE' as const,
    poster: {
      walletAddress: address,
      reputationScore: 4.8,
    },
  };

  const postedJobs: Job[] = [
    {
      ...baseJob,
      id: 'job-1',
      title: 'Build a Token Vesting UI',
      description: 'Create a React component for displaying token vesting schedules',
      budget: 150,
      status: 'OPEN',
      category: 'CODE',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      ...baseJob,
      id: 'job-2',
      title: 'Write Technical Documentation',
      description: 'Document the Anchor program instructions and error handling',
      budget: 75,
      status: 'COMPLETED',
      category: 'CONTENT',
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const completedJobs: Job[] = [
    {
      id: 'job-3',
      title: 'Integrate Wallet Adapter',
      description: 'Set up Solana wallet adapter with multiple wallet support',
      budget: 200,
      status: 'COMPLETED',
      category: 'CODE',
      proofType: 'CODE',
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      squadsVaultAddress: null,
      poster: {
        walletAddress: 'Poster123...ABC',
        reputationScore: 4.5,
      },
      worker: {
        walletAddress: address,
        reputationScore: 4.8,
      },
    },
    {
      id: 'job-4',
      title: 'Design Landing Page Mockup',
      description: 'Create Figma mockups for the marketplace landing page',
      budget: 100,
      status: 'COMPLETED',
      category: 'CONTENT',
      proofType: 'CONTENT',
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      squadsVaultAddress: null,
      poster: {
        walletAddress: 'Designer456...DEF',
        reputationScore: 4.9,
      },
      worker: {
        walletAddress: address,
        reputationScore: 4.8,
      },
    },
  ];

  return { posted: postedJobs, completed: completedJobs };
}

function getMockReviews(address: string): Review[] {
  return [
    {
      id: 'review-1',
      jobId: 'job-3',
      jobTitle: 'Integrate Wallet Adapter',
      rating: 5,
      comment: 'Excellent work! Delivered ahead of schedule with clean code and great documentation.',
      reviewerAddress: 'Poster123...ABC',
      reviewerType: 'poster',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'review-2',
      jobId: 'job-4',
      jobTitle: 'Design Landing Page Mockup',
      rating: 5,
      comment: 'Beautiful designs that perfectly captured the brand vision. Would hire again!',
      reviewerAddress: 'Designer456...DEF',
      reviewerType: 'poster',
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'review-3',
      jobId: 'job-2',
      jobTitle: 'Write Technical Documentation',
      rating: 4,
      comment: 'Good documentation, clear and well-organized. Minor formatting issues.',
      reviewerAddress: address,
      reviewerType: 'worker',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function useProfile({ walletAddress }: UseProfileOptions = {}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!!walletAddress);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const response = await fetch(`${API_URL}/api/users/${walletAddress}`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setPostedJobs(data.postedJobs || []);
        setCompletedJobs(data.completedJobs || []);
        setReviews(data.reviews || []);
      } else {
        // Fall back to mock data for development
        setProfile(getMockProfile(walletAddress));
        const mockJobs = getMockJobs(walletAddress);
        setPostedJobs(mockJobs.posted);
        setCompletedJobs(mockJobs.completed);
        setReviews(getMockReviews(walletAddress));
      }
    } catch {
      // Use mock data if API fails
      setProfile(getMockProfile(walletAddress));
      const mockJobs = getMockJobs(walletAddress);
      setPostedJobs(mockJobs.posted);
      setCompletedJobs(mockJobs.completed);
      setReviews(getMockReviews(walletAddress));
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    postedJobs,
    completedJobs,
    reviews,
    loading,
    error,
    refetch: fetchProfile,
  };
}
