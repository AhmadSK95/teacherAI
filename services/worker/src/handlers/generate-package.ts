import type { ServiceContainer } from '@teachassist/core';

export interface GeneratePackagePayload {
  requestId: string;
  planId: string;
}

export function createGeneratePackageHandler(services: ServiceContainer) {
  return async (payload: GeneratePackagePayload): Promise<{ artifactCount: number }> => {
    const plan = services.repos.planGraphs.findById(payload.planId);
    if (!plan) {
      throw new Error(`Plan not found: ${payload.planId}`);
    }

    const artifacts = await services.contentAssembly.generateArtifacts(plan);
    return { artifactCount: artifacts.length };
  };
}
