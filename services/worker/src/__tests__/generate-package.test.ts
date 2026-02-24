import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, runMigrations, createServices } from '@teachassist/core';
import type { ServiceContainer } from '@teachassist/core';
import type { RequestEvent, PlanGraph } from '@teachassist/schemas';
import { createGeneratePackageHandler } from '../handlers/generate-package.js';

describe('generatePackageHandler', () => {
  let services: ServiceContainer;
  let handler: ReturnType<typeof createGeneratePackageHandler>;

  beforeEach(() => {
    const db = createDatabase(':memory:');
    runMigrations(db);
    services = createServices(db);
    handler = createGeneratePackageHandler(services);

    // Seed demo teacher
    services.repos.teachers.create({
      teacher_id: '22222222-2222-2222-2222-222222222222',
      email: 'demo@school.edu',
      display_name: 'Demo Teacher',
      grade_bands: [7, 8],
      subjects: ['Math'],
      preferred_languages: ['en'],
      output_defaults: { medium: 'google_doc', include_tiers: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  it('processes a generate-package job and creates artifacts', async () => {
    // Create request + plan
    const request: RequestEvent = {
      request_id: crypto.randomUUID(),
      teacher_id: '22222222-2222-2222-2222-222222222222',
      prompt_text: 'Create a lesson plan for 8th grade math',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: new Date().toISOString(),
    };
    services.repos.requests.create(request);

    const plan: PlanGraph = {
      plan_id: crypto.randomUUID(),
      request_id: request.request_id,
      task_nodes: [{ node_id: 'node_1', task_type: 'generate-lesson-plan', status: 'pending' }],
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };
    services.repos.planGraphs.create(plan);

    const result = await handler({ requestId: request.request_id, planId: plan.plan_id });
    expect(result.artifactCount).toBeGreaterThanOrEqual(1);

    // Verify artifacts were stored (primary + tiered variants + translation)
    const artifacts = services.repos.artifacts.findByRequestId(request.request_id);
    expect(artifacts.length).toBeGreaterThanOrEqual(1);
    expect(artifacts[0].content).toContain('Lesson Plan');
  });

  it('throws when plan is not found', async () => {
    await expect(
      handler({ requestId: 'any', planId: 'nonexistent' }),
    ).rejects.toThrow('Plan not found');
  });

  it('integrates with InMemoryQueue', async () => {
    const { InMemoryQueue } = await import('../queue.js');
    const queue = new InMemoryQueue();
    queue.registerHandler('generate-package', handler as any);

    // Create request + plan
    const request: RequestEvent = {
      request_id: crypto.randomUUID(),
      teacher_id: '22222222-2222-2222-2222-222222222222',
      prompt_text: 'Create a worksheet for vocabulary',
      attachment_ids: [],
      inferred_intent: 'worksheet',
      created_at: new Date().toISOString(),
    };
    services.repos.requests.create(request);

    const plan: PlanGraph = {
      plan_id: crypto.randomUUID(),
      request_id: request.request_id,
      task_nodes: [{ node_id: 'node_1', task_type: 'generate-worksheet', status: 'pending' }],
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };
    services.repos.planGraphs.create(plan);

    queue.enqueue('generate-package', { requestId: request.request_id, planId: plan.plan_id });
    const job = await queue.processNext();
    expect(job!.status).toBe('completed');
  });
});
