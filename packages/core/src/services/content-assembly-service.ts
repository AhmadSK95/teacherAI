import { v4 as uuidv4 } from 'uuid';
import type { PlanGraph, ArtifactOutput, TaskNode } from '@teachassist/schemas';
import type { ContentAssemblyService } from './interfaces.js';
import type { ArtifactRepository, PlanGraphRepository, RequestRepository } from '../repository/interfaces.js';
import type { AIProvider } from './ai-provider.js';

export class DefaultContentAssemblyService implements ContentAssemblyService {
  constructor(
    private aiProvider: AIProvider,
    private artifactRepo: ArtifactRepository,
    private planGraphRepo: PlanGraphRepository,
    private requestRepo: RequestRepository,
  ) {}

  async generateArtifacts(plan: PlanGraph): Promise<ArtifactOutput[]> {
    const request = this.requestRepo.findById(plan.request_id);
    if (!request) {
      throw new Error(`Request not found: ${plan.request_id}`);
    }

    const artifacts: ArtifactOutput[] = [];

    for (const node of plan.task_nodes) {
      // Mark node as running
      this.updateNodeStatus(plan, node.node_id, 'running');

      try {
        const aiResponse = await this.aiProvider.generate({
          prompt: request.prompt_text,
          systemPrompt: `Generate content for task: ${node.task_type}`,
        });

        const artifact: ArtifactOutput = {
          artifact_id: uuidv4(),
          request_id: plan.request_id,
          plan_id: plan.plan_id,
          medium_type: 'markdown',
          language: 'en',
          version: 1,
          content: aiResponse.content,
          metadata: {
            task_type: node.task_type,
            model: aiResponse.model,
            node_id: node.node_id,
          },
          created_at: new Date().toISOString(),
        };

        this.artifactRepo.create(artifact);
        artifacts.push(artifact);

        // Mark node as completed
        this.updateNodeStatus(plan, node.node_id, 'completed');
      } catch (error) {
        this.updateNodeStatus(plan, node.node_id, 'failed');
        throw error;
      }
    }

    // Mark plan as completed
    this.planGraphRepo.update(plan.plan_id, {
      task_nodes: plan.task_nodes,
      completed_at: new Date().toISOString(),
    });

    return artifacts;
  }

  private updateNodeStatus(plan: PlanGraph, nodeId: string, status: TaskNode['status']): void {
    const node = plan.task_nodes.find((n) => n.node_id === nodeId);
    if (node) {
      node.status = status;
      if (status === 'running') {
        node.started_at = new Date().toISOString();
      }
      if (status === 'completed' || status === 'failed') {
        node.completed_at = new Date().toISOString();
      }
      this.planGraphRepo.update(plan.plan_id, { task_nodes: plan.task_nodes });
    }
  }
}
