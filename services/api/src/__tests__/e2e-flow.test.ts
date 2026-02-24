import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { createDatabase, runMigrations, createServices } from '@teachassist/core';
import { InMemoryQueue, createGeneratePackageHandler } from '@teachassist/worker';
import type { AppDependencies } from '../app.js';

function createE2EDeps(): AppDependencies {
  const db = createDatabase(':memory:');
  runMigrations(db);
  const services = createServices(db);

  services.repos.teachers.create({
    teacher_id: crypto.randomUUID(),
    email: 'demo@school.edu',
    display_name: 'Demo Teacher',
    grade_bands: [7, 8],
    subjects: ['Math', 'Science'],
    preferred_languages: ['en'],
    output_defaults: { medium: 'google_doc', include_tiers: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const queue = new InMemoryQueue();
  queue.registerHandler('generate-package', createGeneratePackageHandler(services) as any);

  return { services, queue };
}

describe('E2E: Full one-shot flow', () => {
  let app: ReturnType<typeof createApp>;
  let deps: AppDependencies;

  beforeEach(() => {
    deps = createE2EDeps();
    app = createApp(deps);
  });

  it('Scenario 1: Prompt-only lesson generation (full flow)', async () => {
    // Step 1: Submit prompt
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a lesson plan for 8th grade math on solving linear equations' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.inferred_intent).toBe('lesson_plan');
    const requestId = createRes.body.request_id;
    const planId = createRes.body.plan_id;

    // Step 2: Wait for async processing
    await new Promise((r) => setTimeout(r, 100));

    // Step 3: Check request status
    const statusRes = await request(app).get(`/v1/requests/${requestId}`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('completed');

    // Step 4: Get plan
    const planRes = await request(app).get(`/v1/requests/${requestId}/plan`);
    expect(planRes.status).toBe(200);
    expect(planRes.body.plan_id).toBe(planId);
    expect(planRes.body.completed_at).toBeDefined();

    // Step 5: Get artifacts
    const artifactsRes = await request(app).get(`/v1/requests/${requestId}/artifacts`);
    expect(artifactsRes.status).toBe(200);
    expect(artifactsRes.body).toHaveLength(1);
    expect(artifactsRes.body[0].content).toContain('Lesson Plan');
    expect(artifactsRes.body[0].content).toContain('Learning Objectives');

    // Step 6: Export as markdown
    const artifactId = artifactsRes.body[0].artifact_id;
    const exportRes = await request(app)
      .post(`/v1/artifacts/${artifactId}/export`)
      .send({ medium: 'markdown' });
    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('text/markdown');
    expect(exportRes.headers['content-disposition']).toContain('attachment');

    // Step 7: Export as HTML/PDF
    const pdfExportRes = await request(app)
      .post(`/v1/artifacts/${artifactId}/export`)
      .send({ medium: 'pdf' });
    expect(pdfExportRes.status).toBe(200);
    expect(pdfExportRes.headers['content-type']).toContain('text/html');
    expect(pdfExportRes.text).toContain('<html>');
  });

  it('Scenario 2: High-risk intent (IEP) requires approval flagging', async () => {
    // Submit IEP request
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create IEP accommodation support for a student with dyslexia' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.inferred_intent).toBe('iep_support');

    // Wait for processing
    await new Promise((r) => setTimeout(r, 100));

    // Get artifacts
    const artifactsRes = await request(app).get(`/v1/requests/${createRes.body.request_id}/artifacts`);
    expect(artifactsRes.body).toHaveLength(1);

    const artifactId = artifactsRes.body[0].artifact_id;

    // Check that artifact requires approval
    const approveRes = await request(app)
      .post(`/v1/artifacts/${artifactId}/approve`)
      .send({});
    expect(approveRes.status).toBe(201);
    expect(approveRes.body.risk_level).toBe('high');
    expect(approveRes.body.status).toBe('approved');
  });

  it('Scenario 3: Request-ID traceability through all entities', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Make a worksheet for vocabulary practice' });

    const requestId = createRes.body.request_id;
    await new Promise((r) => setTimeout(r, 100));

    // Request event
    const reqRes = await request(app).get(`/v1/requests/${requestId}`);
    expect(reqRes.body.request_id).toBe(requestId);

    // Plan graph
    const planRes = await request(app).get(`/v1/requests/${requestId}/plan`);
    expect(planRes.body.request_id).toBe(requestId);

    // Artifacts
    const artifactsRes = await request(app).get(`/v1/requests/${requestId}/artifacts`);
    expect(artifactsRes.body[0].request_id).toBe(requestId);
    expect(artifactsRes.body[0].plan_id).toBe(planRes.body.plan_id);

    // Single artifact by ID
    const artId = artifactsRes.body[0].artifact_id;
    const singleArtRes = await request(app).get(`/v1/artifacts/${artId}`);
    expect(singleArtRes.body.request_id).toBe(requestId);
  });

  it('Scenario 4: Export as markdown and HTML/PDF', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a rubric for a science project' });

    await new Promise((r) => setTimeout(r, 100));

    const artifactsRes = await request(app).get(`/v1/requests/${createRes.body.request_id}/artifacts`);
    const artifactId = artifactsRes.body[0].artifact_id;

    // Markdown export
    const mdRes = await request(app)
      .post(`/v1/artifacts/${artifactId}/export`)
      .send({ medium: 'markdown' });
    expect(mdRes.status).toBe(200);
    expect(mdRes.headers['content-type']).toContain('text/markdown');
    expect(mdRes.text).toContain('Rubric');

    // PDF/HTML export
    const htmlRes = await request(app)
      .post(`/v1/artifacts/${artifactId}/export`)
      .send({ medium: 'pdf' });
    expect(htmlRes.status).toBe(200);
    expect(htmlRes.text).toContain('<html>');
    expect(htmlRes.text).toContain('Rubric');
  });

  it('Scenario 5: Worksheet generation (different intent)', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Generate a worksheet for 7th grade science on the water cycle' });

    expect(createRes.body.inferred_intent).toBe('worksheet');
    await new Promise((r) => setTimeout(r, 100));

    const artifactsRes = await request(app).get(`/v1/requests/${createRes.body.request_id}/artifacts`);
    expect(artifactsRes.body).toHaveLength(1);
    expect(artifactsRes.body[0].content).toContain('Worksheet');
  });
});
