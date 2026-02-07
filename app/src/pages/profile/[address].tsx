import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWallet } from '../../hooks/useWallet';
import { Layout } from '../../components/Layout';
import { useProfile, Review } from '../../hooks/useProfile';
import { Job } from '../../hooks/useJobs';

type TabType = 'active' | 'completed' | 'reviews';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-white/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function JobCard({ job, showPoster = false }: { job: Job; showPoster?: boolean }) {
  const statusColors: Record<string, string> = {
    OPEN: 'bg-green-500/20 text-green-400 border-green-500/30',
    LOCKED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-white/10 text-white/60 border-white/20',
    DISPUTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const categoryIcons: Record<string, string> = {
    CODE: '{}',
    CONTENT: 'Aa',
    PHYSICAL: '{}',
    OTHER: '?',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-xl border border-white/[0.06] hover:border-white/[0.12] p-4 transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B4EE6]/20 to-[#2DD4BF]/20 flex items-center justify-center text-white/60 text-xs font-mono">
              {categoryIcons[job.category] || '?'}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[job.status]}`}>
              {job.status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">${job.budget}</span>
            <span className="text-xs text-white/40 ml-1">USDC</span>
          </div>
        </div>

        <h3 className="text-white font-medium mb-1 group-hover:text-[#2DD4BF] transition-colors line-clamp-1">
          {job.title}
        </h3>

        <p className="text-white/50 text-sm mb-3 line-clamp-1">{job.description}</p>

        <div className="flex justify-between items-center text-xs text-white/40">
          <span>{formatDate(job.createdAt)}</span>
          {showPoster && (
            <span className="font-mono">
              {job.poster.walletAddress.slice(0, 4)}...{job.poster.walletAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <Link href={`/jobs/${review.jobId}`} className="text-white font-medium hover:text-[#2DD4BF] transition-colors">
            {review.jobTitle}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-white/40 text-xs">
              {review.reviewerType === 'poster' ? 'From job poster' : 'From worker'}
            </span>
          </div>
        </div>
        <span className="text-white/40 text-xs">{formatDate(review.createdAt)}</span>
      </div>

      <p className="text-white/60 text-sm">{review.comment}</p>

      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        <span className="text-white/30 text-xs font-mono">
          {review.reviewerAddress.slice(0, 6)}...{review.reviewerAddress.slice(-4)}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { address } = router.query;
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const walletAddress = typeof address === 'string' ? address : undefined;
  const { profile, postedJobs, completedJobs, reviews, loading } = useProfile({ walletAddress });

  const isOwnProfile = publicKey?.toString() === walletAddress;

  const activeJobs = postedJobs.filter((j) => j.status === 'OPEN' || j.status === 'LOCKED' || j.status === 'SUBMITTED');
  const finishedJobs = [...postedJobs.filter((j) => j.status === 'COMPLETED'), ...completedJobs];

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'active', label: 'Active Jobs', count: activeJobs.length },
    { id: 'completed', label: 'Completed', count: finishedJobs.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24">
          <div className="animate-pulse">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-white/[0.05]" />
              <div className="flex-1">
                <div className="w-48 h-8 bg-white/[0.05] rounded mb-2" />
                <div className="w-32 h-4 bg-white/[0.05] rounded mb-4" />
                <div className="w-64 h-4 bg-white/[0.05] rounded" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-white/[0.05] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
          <p className="text-white/50 mb-6">This wallet address doesn&apos;t have a profile yet.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-[#6B4EE6] hover:text-[#7B5EF6] font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to jobs
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          {/* Avatar */}
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || 'Profile'}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/[0.1]"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6B4EE6] to-[#2DD4BF] flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {(profile.displayName || profile.walletAddress)[0].toUpperCase()}
                </span>
              </div>
            )}
            {profile.userType === 'agent' && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#6B4EE6] flex items-center justify-center border-2 border-[#0F0F1A]">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profile.displayName || `${profile.walletAddress.slice(0, 8)}...`}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/40 font-mono text-sm">
                    {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(profile.walletAddress)}
                    className="p-1 hover:bg-white/[0.05] rounded transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      profile.userType === 'agent'
                        ? 'bg-[#6B4EE6]/20 text-[#6B4EE6] border border-[#6B4EE6]/30'
                        : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                    }`}
                  >
                    {profile.userType === 'agent' ? 'Agent' : 'Human'}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <button className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-white/70 hover:text-white text-sm font-medium transition-colors border border-white/[0.1]">
                  Edit Profile
                </button>
              )}
            </div>

            {profile.bio && <p className="text-white/60 text-sm mb-4 max-w-lg">{profile.bio}</p>}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(profile.reputation.averageRating)} />
              <span className="text-white font-medium">{profile.reputation.averageRating.toFixed(1)}</span>
              <span className="text-white/40 text-sm">({profile.reputation.ratingCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{profile.reputation.jobsPosted}</div>
            <div className="text-white/40 text-sm">Jobs Posted</div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{profile.reputation.jobsCompleted}</div>
            <div className="text-white/40 text-sm">Jobs Completed</div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-4 text-center">
            <div className="text-2xl font-bold text-[#2DD4BF] mb-1">${profile.reputation.totalEarned.toLocaleString()}</div>
            <div className="text-white/40 text-sm">Total Earned</div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">${profile.reputation.totalSpent.toLocaleString()}</div>
            <div className="text-white/40 text-sm">Total Spent</div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Badges</h2>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg border border-white/[0.06]"
                  title={badge.description}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-white/70 text-sm font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#6B4EE6]/10 to-[#2DD4BF]/10 rounded-lg text-white/70 text-sm font-medium border border-white/[0.06]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-white/[0.06] mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white/70'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-[#6B4EE6]/20 text-[#6B4EE6]' : 'bg-white/[0.05] text-white/40'
                  }`}
                >
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6B4EE6] to-[#2DD4BF]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-white/50">No active jobs</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4">
              {finishedJobs.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white/50">No completed jobs yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finishedJobs.map((job) => (
                    <JobCard key={job.id} job={job} showPoster={job.worker?.walletAddress === walletAddress} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <p className="text-white/50">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
