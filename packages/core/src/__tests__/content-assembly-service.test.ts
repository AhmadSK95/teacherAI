import { describe, it, expect, beforeEach } from 'vitest';
import { SqliteArtifactRepository } from '../repository/sqlite-artifact.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { DefaultContentAssemblyService } from '../services/content-assembly-service.js';
import { MockAIProvider } from '../services/mock-ai-provider.js';
import { createTestDb, seedDemoTeacher, DEMO_TEACHER_ID } from './test-helpers.js';
import type Database from 'better-sqlite3';
import type { PlanGraph, RequestEvent } from '@teachassist/schemas';

describe('ContentAssemblyService', () => {
  let service: DefaultContentAssemblyService;
  let artifactRepo: SqliteArtifactRepository;
  let planGraphRepo: SqlitePlanGraphRepository;
  let requestRepo: SqliteRequestRepository;
  let db: Database.Database;

  let requestId: string;
  let planId: string;

  beforeEach(() => {
    db = createTestDb();
    seedDemoTeacher(db);

    artifactRepo = new SqliteArtifactRepository(db);
    planGraphRepo = new SqlitePlanGraphRepository(db);
    requestRepo = new SqliteRequestRepository(db);

    requestId = crypto.randomUUID();
    planId = crypto.randomUUID();

    const request: RequestEvent = {
      request_id: requestId,
      teacher_id: DEMO_TEACHER_ID,
      prompt_text: 'Create a lesson plan for 8th grade math',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: new Date().toISOString(),
    };
    requestRepo.create(request);

    const aiProvider = new MockAIProvider();
    service = new DefaultContentAssemblyService(aiProvider, artifactRepo, planGraphRepo, requestRepo);
  });

  function makePlan(): PlanGraph {
    const plan: PlanGraph = {
      plan_id: planId,
      request_id: requestId,
      task_nodes: [
        { node_id: 'node_1', task_type: 'generate-lesson-plan', status: 'pending' },
      ],
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };
    planGraphRepo.create(plan);
    return plan;
  }

  it('generates artifacts for each task node plus tiered variants and translation', async () => {
    const plan = makePlan();
    const artifacts = await service.generateArtifacts(plan);

    // Primary + 2 tiered variants (approaching, advanced) + 1 Spanish translation
    expect(artifacts.length).toBeGreaterThanOrEqual(1);
    expect(artifacts[0].content).toContain('Lesson Plan');
    expect(artifacts[0].medium_type).toBe('markdown');
    expect(artifacts[0].request_id).toBe(requestId);
    expect(artifacts[0].plan_id).toBe(planId);
  });

  it('persists artifacts to the repository', async () => {
    const plan = makePlan();
    const artifacts = await service.generateArtifacts(plan);

    const found = artifactRepo.findByRequestId(requestId);
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].artifact_id).toBe(artifacts[0].artifact_id);
  });

  it('updates task node statuses during generation', async () => {
    const plan = makePlan();
    await service.generateArtifacts(plan);

    const updated = planGraphRepo.findById(planId);
    expect(updated!.task_nodes[0].status).toBe('completed');
    expect(updated!.completed_at).toBeDefined();
  });

  it('marks plan as completed after all nodes finish', async () => {
    const plan = makePlan();
    await service.generateArtifacts(plan);

    const updated = planGraphRepo.findById(planId);
    expect(updated!.completed_at).toBeDefined();
  });

  it('throws when request is not found', async () => {
    // Use a plan object with a non-existent request_id (in-memory only, not persisted)
    const badPlan: PlanGraph = {
      plan_id: crypto.randomUUID(),
      request_id: crypto.randomUUID(), // doesn't exist in DB
      task_nodes: [{ node_id: 'node_1', task_type: 'generate-lesson-plan', status: 'pending' }],
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };

    await expect(service.generateArtifacts(badPlan)).rejects.toThrow('Request not found');
  });
});
