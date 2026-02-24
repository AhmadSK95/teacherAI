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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{formatTaskType(taskType)}</h3>
          <span className="text-xs text-gray-500">v{artifact.version} &middot; {artifact.language}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('markdown')}
            disabled={exporting}
            className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Export MD
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Export PDF
          </button>
          {requiresApproval && !approved && (
            <button
              onClick={handleApprove}
              className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 rounded hover:bg-yellow-200"
            >
              Approve
            </button>
          )}
          {approved && (
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              Approved
            </span>
          )}
        </div>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
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
