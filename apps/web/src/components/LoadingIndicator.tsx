import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Generating your teaching materials...' }: LoadingIndicatorProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-primary-600 mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
