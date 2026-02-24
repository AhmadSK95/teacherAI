import type { RequestEvent, PlanGraph, ArtifactOutput } from '@teachassist/schemas';

export interface AttachmentInput {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
}

export interface IntakeService {
  processRequest(prompt: string, teacherId: string, classId?: string, attachments?: AttachmentInput[]): Promise<RequestEvent>;
}

export interface PlanningService {
  createPlan(request: RequestEvent): Promise<PlanGraph>;
}

export interface ContentAssemblyService {
  generateArtifacts(plan: PlanGraph): Promise<ArtifactOutput[]>;
}

export interface DeliveryService {
  exportArtifact(artifactId: string, medium: string, destination: string): Promise<boolean>;
}

export interface PolicyService {
  checkCompliance(artifactId: string): Promise<{ compliant: boolean; violations: string[] }>;
  requiresApproval(artifactId: string): Promise<boolean>;
}
