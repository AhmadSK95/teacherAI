import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; animate?: boolean }> = {
  processing: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    animate: true,
  },
  planned: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    animate: true,
  },
  completed: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  failed: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
  pending: {
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}>
      <span className="relative flex h-2 w-2">
        {config.animate && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
