import { v4 as uuidv4 } from 'uuid';
import type { RequestEvent, PlanGraph, TaskNode, InferredIntent } from '@teachassist/schemas';
import type { PlanningService } from './interfaces.js';
import type { PlanGraphRepository } from '../repository/interfaces.js';

const INTENT_TASK_MAP: Record<InferredIntent, string[]> = {
  lesson_plan: ['generate-lesson-plan'],
  worksheet: ['generate-worksheet'],
  assessment: ['generate-assessment'],
  slide_deck: ['generate-slide-deck'],
  parent_letter: ['generate-parent-letter'],
  iep_support: ['generate-iep-support'],
  translation: ['generate-translation'],
  seating_chart: ['generate-seating-chart'],
  rubric: ['generate-rubric'],
  other: ['generate-generic'],
};

export class DefaultPlanningService implements PlanningService {
  constructor(private planGraphRepo: PlanGraphRepository) {}

  async createPlan(request: RequestEvent): Promise<PlanGraph> {
    const taskTypes = INTENT_TASK_MAP[request.inferred_intent] || ['generate-generic'];

    const taskNodes: TaskNode[] = taskTypes.map((taskType, index) => ({
      node_id: `node_${index + 1}`,
      task_type: taskType,
      status: 'pending' as const,
    }));

    const plan: PlanGraph = {
      plan_id: uuidv4(),
      request_id: request.request_id,
      task_nodes: taskNodes,
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };

    this.planGraphRepo.create(plan);
    return plan;
  }
}
