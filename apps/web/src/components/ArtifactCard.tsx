import React, { useState } from 'react';
import { exportArtifact, approveArtifact } from '../api';
import type { Artifact } from '../api';

interface ArtifactCardProps {
  artifact: Artifact;
  requiresApproval?: boolean;
}

export default function ArtifactCard({ artifact, requiresApproval }: ArtifactCardProps): React.ReactElement {
  const [approved, setApproved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (medium: string) => {
    setExporting(true);
    try {
      const blob = await exportArtifact(artifact.artifact_id, medium);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artifact-${artifact.artifact_id.slice(0, 8)}.${medium === 'pdf' ? 'html' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveArtifact(artifact.artifact_id);
      setApproved(true);
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const taskType = (artifact.metadata?.task_type as string) || artifact.medium_type;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{formatTaskType(taskType)}</h3>
            <span className="text-xs text-gray-500">v{artifact.version} &middot; {artifact.language}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('markdown')}
            disabled={exporting}
            className="btn-secondary !px-3 !py-1.5 !text-xs inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Markdown
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="btn-secondary !px-3 !py-1.5 !text-xs inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          {requiresApproval && !approved && (
            <button
              onClick={handleApprove}
              className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approve
            </button>
          )}
          {approved && (
            <span className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approved
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
          {artifact.content}
        </pre>
      </div>
    </div>
  );
}

function formatTaskType(taskType: string): string {
  return taskType
    .replace(/^generate-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
