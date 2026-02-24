import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  planned: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800',
};

export default function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
