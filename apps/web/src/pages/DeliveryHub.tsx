import React from 'react';
import { Link } from 'react-router-dom';

const exportFormats = [
  {
    name: 'Markdown',
    description: 'Clean text format for any platform',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    ext: '.md',
    bgLight: 'bg-gray-100',
    textColor: 'text-gray-700',
    available: true,
  },
  {
    name: 'PDF / Print',
    description: 'Formatted document ready to print',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
      </svg>
    ),
    ext: '.html',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    available: true,
  },
  {
    name: 'Google Docs',
    description: 'Export directly to Google Workspace',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    ext: '.gdoc',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    available: false,
  },
  {
    name: 'Slides / PPTX',
    description: 'Presentation-ready slide decks',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    ext: '.pptx',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    available: false,
  },
];

export default function DeliveryHub(): React.ReactElement {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <h2 className="page-header">Delivery Hub</h2>
          <p className="page-subtitle">Export and distribute your teaching materials</p>
        </div>
      </div>

      {/* Export Formats */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Available Formats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportFormats.map((format) => (
            <div
              key={format.name}
              className={`card-interactive p-5 ${!format.available ? 'opacity-60' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl ${format.bgLight} ${format.textColor} flex items-center justify-center mb-4`}>
                {format.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{format.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{format.description}</p>
              {!format.available && (
                <span className="inline-block mt-3 px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  Coming in Level 2
                </span>
              )}
              {format.available && (
                <span className="inline-block mt-3 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  Available
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How Export Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Generate content</p>
              <p className="text-xs text-gray-500 mt-0.5">Use the Composer to create materials</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Review in Workbench</p>
              <p className="text-xs text-gray-500 mt-0.5">Preview and approve artifacts</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Export & deliver</p>
              <p className="text-xs text-gray-500 mt-0.5">Download in your preferred format</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Ready to create teaching materials?</p>
        <Link to="/composer" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Go to Composer
        </Link>
      </div>
    </div>
  );
}
