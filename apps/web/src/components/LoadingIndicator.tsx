import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Generating your teaching materials...' }: LoadingIndicatorProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* AI Sparkle Animation */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow animate-pulse-slow">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-400 opacity-60" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400 opacity-60" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '2s' }}>
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 opacity-60" />
        </div>
      </div>

      <p className="text-gray-700 font-medium">{message}</p>
      <p className="text-sm text-gray-400 mt-1">This usually takes a few seconds</p>

      {/* Progress shimmer bar */}
      <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-5 overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-primary-400 via-violet-400 to-primary-400 rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </div>
    </div>
  );
}
