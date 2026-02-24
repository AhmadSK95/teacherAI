import { describe, it, expect, beforeEach } from 'vitest';
import { SqliteArtifactRepository } from '../repository/sqlite-artifact.js';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';
import { DefaultPolicyService } from '../services/policy-service.js';
import { createTestDb, seedDemoTeacher, DEMO_TEACHER_ID } from './test-helpers.js';
import type Database from 'better-sqlite3';
import type { ArtifactOutput, RequestEvent, PlanGraph } from '@teachassist/schemas';

describe('PolicyService', () => {
  let service: DefaultPolicyService;
  let artifactRepo: SqliteArtifactRepository;
  let requestRepo: SqliteRequestRepository;
  let planGraphRepo: SqlitePlanGraphRepository;
  let db: Database.Database;

  const requestId = '11111111-1111-1111-1111-111111111111';
  const planId = '33333333-3333-3333-3333-333333333333';
  const artifactId = '55555555-5555-5555-5555-555555555555';

  beforeEach(() => {
    db = createTestDb();
    seedDemoTeacher(db);
    artifactRepo = new SqliteArtifactRepository(db);
    requestRepo = new SqliteRequestRepository(db);
    planGraphRepo = new SqlitePlanGraphRepository(db);
    service = new DefaultPolicyService(artifactRepo, requestRepo);

    // Seed request
    const request: RequestEvent = {
      request_id: requestId,
      teacher_id: DEMO_TEACHER_ID,
      prompt_text: 'Create a lesson plan',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: new Date().toISOString(),
    };
    requestRepo.create(request);

    // Seed plan graph (required FK for artifact)
    const plan: PlanGraph = {
      plan_id: planId,
      request_id: requestId,
      task_nodes: [],
      dependency_edges: [],
      created_at: new Date().toISOString(),
    };
    planGraphRepo.create(plan);
  });

  function createArtifact(content: string, intent?: RequestEvent['inferred_intent']): void {
    if (intent) {
      requestRepo.update(requestId, { inferred_intent: intent });
    }
    const artifact: ArtifactOutput = {
      artifact_id: artifactId,
      request_id: requestId,
      plan_id: planId,
      medium_type: 'markdown',
      language: 'en',
      version: 1,
      content,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    artifactRepo.create(artifact);
  }

  describe('checkCompliance', () => {
    it('returns compliant for clean content', async () => {
      createArtifact('This is a clean lesson plan about fractions.');
      const result = await service.checkCompliance(artifactId);
      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('detects SSN patterns as PII', async () => {
      createArtifact('Student SSN: 123-45-6789');
      const result = await service.checkCompliance(artifactId);
      expect(result.compliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain('PII detected');
    });

    it('returns not compliant for missing artifact', async () => {
      const result = await service.checkCompliance('nonexistent-id');
      expect(result.compliant).toBe(false);
      expect(result.violations).toContain('Artifact not found');
    });
  });

  describe('requiresApproval', () => {
    it('requires approval for IEP-related content', async () => {
      createArtifact('IEP accommodation plan for student', 'iep_support');
      const result = await service.requiresApproval(artifactId);
      expect(result).toBe(true);
    });

    it('does not require approval for standard lesson plans', async () => {
      createArtifact('A standard lesson plan about math');
      const result = await service.requiresApproval(artifactId);
      expect(result).toBe(false);
    });
  });
});
