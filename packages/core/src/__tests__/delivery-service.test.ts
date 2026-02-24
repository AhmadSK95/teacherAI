import { describe, it, expect, beforeEach } from 'vitest';
import { SqliteArtifactRepository } from '../repository/sqlite-artifact.js';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';
import { DefaultDeliveryService } from '../services/delivery-service.js';
import { createTestDb, seedDemoTeacher, DEMO_TEACHER_ID } from './test-helpers.js';
import type Database from 'better-sqlite3';
import type { ArtifactOutput, RequestEvent, PlanGraph } from '@teachassist/schemas';

describe('DeliveryService', () => {
  let service: DefaultDeliveryService;
  let artifactRepo: SqliteArtifactRepository;
  let db: Database.Database;
  const artifactId = '55555555-5555-5555-5555-555555555555';
  const requestId = '11111111-1111-1111-1111-111111111111';
  const planId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    db = createTestDb();
    seedDemoTeacher(db);
    artifactRepo = new SqliteArtifactRepository(db);

    // Create FK chain: request → plan → artifact
    const requestRepo = new SqliteRequestRepository(db);
    const request: RequestEvent = {
      request_id: requestId,
      teacher_id: DEMO_TEACHER_ID,
      prompt_text: 'Test',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: new Date().toISOString(),
    };
    requestRepo.create(request);

    const planGraphRepo = new SqlitePlanGraphRepository(db);
    const plan: PlanGraph = {
      plan_id: planId,
      request_id: requestId,
      task_nodes: [],
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };
    planGraphRepo.create(plan);

    const artifact: ArtifactOutput = {
      artifact_id: artifactId,
      request_id: requestId,
      plan_id: planId,
      medium_type: 'markdown',
      language: 'en',
      version: 1,
      content: '# Lesson Plan\n\n## Topic\nFractions\n\n- Point 1\n- Point 2',
      metadata: {},
      created_at: new Date().toISOString(),
    };
    artifactRepo.create(artifact);

    service = new DefaultDeliveryService(artifactRepo);
  });

  it('exports as markdown with correct content type', async () => {
    const result = await service.getExportContent(artifactId, 'markdown');
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe('text/markdown');
    expect(result!.content).toContain('# Lesson Plan');
    expect(result!.fileName).toContain('.md');
  });

  it('exports as real PDF for PDF medium', async () => {
    const result = await service.getExportContent(artifactId, 'pdf');
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe('application/pdf');
    expect(result!.fileName).toContain('.pdf');
    expect(Buffer.isBuffer(result!.content)).toBe(true);
  });

  it('returns null for nonexistent artifact', async () => {
    const result = await service.getExportContent('nonexistent-id', 'markdown');
    expect(result).toBeNull();
  });

  it('exportArtifact returns true for existing artifact', async () => {
    const result = await service.exportArtifact(artifactId, 'markdown', 'download');
    expect(result).toBe(true);
  });
});
