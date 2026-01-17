import type { ApplicationStatus } from '../types';

interface StatusPillProps {
  status: ApplicationStatus;
  className?: string;
}

const statusColors: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  Interview: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  Offer: 'bg-green-500/20 text-green-600 dark:text-green-400',
  Rejection: 'bg-red-500/20 text-red-600 dark:text-red-400',
  Archived: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
};

export function StatusPill({ status, className = '' }: StatusPillProps) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${statusColors[status]} ${className}`}
    >
      {status}
    </span>
  );
}
