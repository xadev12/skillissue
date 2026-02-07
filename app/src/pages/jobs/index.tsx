import { useState } from 'react';
import Link from 'next/link';
import { useJobs, Job } from '../../hooks/useJobs';
import { Layout } from '../../components/Layout';

const categories = [
  { value: '', label: 'All Categories', icon: '' },
  { value: 'CODE', label: 'Code', icon: '{}' },
  { value: 'CONTENT', label: 'Content', icon: 'Aa' },
  { value: 'PHYSICAL', label: 'Physical', icon: '' },
  { value: 'OTHER', label: 'Other', icon: '?' },
];

const statuses = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'LOCKED', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'COMPLETED', label: 'Completed' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
  { value: 'deadline', label: 'Ending Soon' },
];

function JobCard({ job }: { job: Job }) {
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
    COMPLETED: 'bg-white/5 text-white/40 border-white/10',
    DISPUTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    if (hours < 0) return { text: 'Expired', urgent: true };
    if (hours < 24) return { text: `${hours}h left`, urgent: true };
    if (hours < 72) return { text: `${Math.ceil(hours / 24)}d left`, urgent: false };
    return { text: `${Math.ceil(hours / 24)}d left`, urgent: false };
  };

  const deadline = formatDeadline(job.deadline);

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group h-full bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/[0.06] hover:border-white/[0.12] p-6 transition-all cursor-pointer flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B4EE6]/20 to-[#2DD4BF]/20 flex items-center justify-center text-white/60 text-sm font-mono">
              {categoryIcons[job.category] || '?'}
            </div>
            <div>
              <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                {job.category}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[job.status]}`}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-white">${job.budget}</span>
            <p className="text-xs text-white/40">USDC</p>
          </div>
        </div>

        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-[#2DD4BF] transition-colors flex-grow">
          {job.title}
        </h3>

        <p className="text-white/50 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        <div className="flex justify-between items-center text-xs text-white/40 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-4">
            <span className={deadline.urgent ? 'text-amber-400' : ''}>
              {deadline.text}
            </span>
            {job.poster.reputationScore > 0 && (
              <span className="text-[#2DD4BF]">
                {job.poster.reputationScore.toFixed(1)}
              </span>
            )}
          </div>
          <span className="font-mono">
            {job.poster.walletAddress.slice(0, 4)}...{job.poster.walletAddress.slice(-4)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function JobsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('OPEN');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const { jobs, loading, error, refetch } = useJobs({
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
  });

  // Client-side filtering and sorting
  const filteredJobs = jobs
    .filter(job => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget-high':
          return b.budget - a.budget;
        case 'budget-low':
          return a.budget - b.budget;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalValue = jobs.reduce((sum, j) => sum + j.budget, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Browse Jobs
            </h1>
            <p className="text-white/50">
              {loading ? 'Loading...' : `${filteredJobs.length} jobs available | $${totalValue.toLocaleString()} USDC total`}
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] shadow-lg shadow-[#6B4EE6]/25 transition-all"
          >
            + Post Job
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors"
                />
              </div>
            </div>

            {/* Filter Selects */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors appearance-none cursor-pointer min-w-[140px]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#1A1A2E] text-white">
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors appearance-none cursor-pointer min-w-[140px]"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value} className="bg-[#1A1A2E] text-white">
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#6B4EE6]/50 focus:ring-1 focus:ring-[#6B4EE6]/50 transition-colors appearance-none cursor-pointer min-w-[160px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#1A1A2E] text-white">
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={refetch}
                className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/[0.05] rounded-xl" />
                    <div>
                      <div className="w-12 h-3 bg-white/[0.05] rounded mb-2" />
                      <div className="w-16 h-4 bg-white/[0.05] rounded" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-6 bg-white/[0.05] rounded mb-1" />
                    <div className="w-10 h-3 bg-white/[0.05] rounded" />
                  </div>
                </div>
                <div className="w-full h-5 bg-white/[0.05] rounded mb-2" />
                <div className="w-3/4 h-5 bg-white/[0.05] rounded mb-4" />
                <div className="w-full h-4 bg-white/[0.05] rounded mb-2" />
                <div className="w-1/2 h-4 bg-white/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg mb-2">Failed to load jobs</p>
            <p className="text-white/30 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 text-[#6B4EE6] hover:text-[#7B5EF6] font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/50 text-lg mb-2">No jobs found</p>
            <p className="text-white/30 mb-6">
              {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to post one!'}
            </p>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 text-[#6B4EE6] hover:text-[#7B5EF6] font-medium transition-colors"
            >
              Post a job
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
