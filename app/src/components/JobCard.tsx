import { Job } from '../hooks/useJobs';

interface JobCardProps {
  job: Job;
  onClick?: (job: Job) => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const statusColors = {
    OPEN: 'bg-green-100 text-green-800',
    LOCKED: 'bg-yellow-100 text-yellow-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    DISPUTED: 'bg-red-100 text-red-800',
  };

  const categoryIcons = {
    CODE: '💻',
    CONTENT: '✍️',
    PHYSICAL: '📍',
    OTHER: '📋',
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div
      onClick={() => onClick?.(job)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryIcons[job.category as keyof typeof categoryIcons] || '📋'}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
            {job.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">${job.budget}</p>
          <p className="text-sm text-gray-500">USDC</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {job.title}
      </h3>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span>⏰</span>
          <span>{formatDeadline(job.deadline)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👤</span>
          <span className="truncate max-w-[120px]">
            {job.poster.walletAddress.slice(0, 6)}...{job.poster.walletAddress.slice(-4)}
          </span>
        </div>
      </div>

      {job.poster.reputationScore > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-500">⭐</span>
            <span className="text-gray-600">{job.poster.reputationScore.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
