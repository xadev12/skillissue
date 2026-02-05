interface StatusBadgeProps {
  status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'COMPLETED' | 'DISPUTED';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusColors = {
    OPEN: 'bg-green-100 text-green-800 border-green-200',
    LOCKED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
    DISPUTED: 'bg-red-100 text-red-800 border-red-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${statusColors[status]} ${sizeClasses[size]}`}
    >
      {status}
    </span>
  );
}
