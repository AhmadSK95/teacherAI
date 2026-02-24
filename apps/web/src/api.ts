const API_BASE = '/v1';

export async function healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export interface CreateRequestResponse {
  request_id: string;
  plan_id: string;
  job_id: string;
  inferred_intent: string;
  attachment_count: number;
  status: string;
}

export async function createRequest(prompt: string, files?: File[]): Promise<CreateRequestResponse> {
  let res: Response;

  if (files && files.length > 0) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    for (const file of files) {
      formData.append('files', file);
    }
    res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface RequestWithStatus {
  request_id: string;
  teacher_id: string;
  prompt_text: string;
  inferred_intent: string;
  status: string;
  created_at: string;
}

export async function getRequest(requestId: string): Promise<RequestWithStatus> {
  const res = await fetch(`${API_BASE}/requests/${requestId}`);
  if (!res.ok) throw new Error(`Request not found: ${res.status}`);
  return res.json();
}

export interface Artifact {
  artifact_id: string;
  request_id: string;
  plan_id: string;
  medium_type: string;
  language: string;
  tier?: string;
  version: number;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getRequestArtifacts(requestId: string): Promise<Artifact[]> {
  const res = await fetch(`${API_BASE}/requests/${requestId}/artifacts`);
  if (!res.ok) throw new Error(`Failed to get artifacts: ${res.status}`);
  return res.json();
}

export async function getArtifact(artifactId: string): Promise<Artifact> {
  const res = await fetch(`${API_BASE}/artifacts/${artifactId}`);
  if (!res.ok) throw new Error(`Artifact not found: ${res.status}`);
  return res.json();
}

export async function exportArtifact(artifactId: string, medium: string = 'markdown'): Promise<Blob> {
  const res = await fetch(`${API_BASE}/artifacts/${artifactId}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medium }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}

export interface ApprovalResponse {
  approval_id: string;
  artifact_id: string;
  risk_level: string;
  status: string;
}

export async function approveArtifact(artifactId: string): Promise<ApprovalResponse> {
  const res = await fetch(`${API_BASE}/artifacts/${artifactId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Approval failed: ${res.status}`);
  return res.json();
}
