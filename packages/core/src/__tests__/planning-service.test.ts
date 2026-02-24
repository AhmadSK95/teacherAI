import { describe, it, expect, beforeEach } from 'vitest';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';
import { DefaultPlanningService } from '../services/planning-service.js';
import { createTestDb, seedDemoTeacher, DEMO_TEACHER_ID } from './test-helpers.js';
import type Database from 'better-sqlite3';
import type { RequestEvent } from '@teachassist/schemas';

describe('PlanningService', () => {
  let service: DefaultPlanningService;
  let planGraphRepo: SqlitePlanGraphRepository;
  let db: Database.Database;

  const makeRequest = (intent: RequestEvent['inferred_intent']): RequestEvent => {
    const req: RequestEvent = {
      request_id: crypto.randomUUID(),
      teacher_id: DEMO_TEACHER_ID,
      prompt_text: 'Test prompt',
      attachment_ids: [],
      inferred_intent: intent,
      created_at: new Date().toISOString(),
    };
    new SqliteRequestRepository(db).create(req);
    return req;
  };

  beforeEach(() => {
    db = createTestDb();
    seedDemoTeacher(db);
    planGraphRepo = new SqlitePlanGraphRepository(db);
    service = new DefaultPlanningService(planGraphRepo);
  });

  it('creates a plan graph for a lesson plan request', async () => {
    const request = makeRequest('lesson_plan');
    const plan = await service.createPlan(request);

    expect(plan.plan_id).toBeDefined();
    expect(plan.request_id).toBe(request.request_id);
    expect(plan.task_nodes).toHaveLength(1);
    expect(plan.task_nodes[0].task_type).toBe('generate-lesson-plan');
    expect(plan.task_nodes[0].status).toBe('pending');
  });

  it('creates a plan graph for a worksheet request', async () => {
    const plan = await service.createPlan(makeRequest('worksheet'));
    expect(plan.task_nodes[0].task_type).toBe('generate-worksheet');
  });

  it('persists the plan to the repository', async () => {
    const request = makeRequest('assessment');
    const plan = await service.createPlan(request);
    const found = planGraphRepo.findById(plan.plan_id);
    expect(found).not.toBeNull();
    expect(found!.request_id).toBe(request.request_id);
  });

  it('assigns unique node IDs', async () => {
    const plan = await service.createPlan(makeRequest('lesson_plan'));
    const nodeIds = plan.task_nodes.map((n) => n.node_id);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });
});
