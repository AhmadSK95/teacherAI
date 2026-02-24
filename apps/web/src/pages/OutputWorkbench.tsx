import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequest, getRequestArtifacts } from '../api';
import type { RequestWithStatus, Artifact } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingIndicator from '../components/LoadingIndicator';
import ArtifactCard from '../components/ArtifactCard';

export default function OutputWorkbench(): React.ReactElement {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<RequestWithStatus | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const req = await getRequest(requestId);
        if (cancelled) return;
        setRequest(req);

        const arts = await getRequestArtifacts(requestId);
        if (cancelled) return;
        setArtifacts(arts);
        setLoading(false);

        // Keep polling if still processing
        if (req.status === 'processing' || req.status === 'planned') {
          pollTimer = setTimeout(poll, 1000);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
  }, [requestId]);

  if (!requestId) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Output Workbench</h2>
        <p className="text-gray-500">Select a request to view generated artifacts.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Output Workbench</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
        <Link to="/composer" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to Composer
        </Link>
      </div>
    );
  }

  const isHighRisk = request?.inferred_intent === 'iep_support';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Output Workbench</h2>
          {request && (
            <p className="text-sm text-gray-500 mt-1">
              {request.prompt_text.length > 100
                ? request.prompt_text.slice(0, 100) + '...'
                : request.prompt_text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {request && <StatusBadge status={request.status} />}
          <Link
            to="/composer"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            New Request
          </Link>
        </div>
      </div>

      {loading && <LoadingIndicator />}

      {!loading && artifacts.length === 0 && request?.status === 'completed' && (
        <div className="text-center py-12 text-gray-500">
          No artifacts were generated. Try a different prompt.
        </div>
      )}

      {isHighRisk && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
          This request involves high-risk content (IEP/Special Education). Artifacts require explicit approval before use.
        </div>
      )}

      <div className="space-y-4">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.artifact_id}
            artifact={artifact}
            requiresApproval={isHighRisk}
          />
        ))}
      </div>
    </div>
  );
}
