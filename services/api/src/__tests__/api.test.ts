import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createApp } from '../app.js';
import { createDatabase, runMigrations, createServices } from '@teachassist/core';
import { InMemoryQueue, createGeneratePackageHandler } from '@teachassist/worker';
import type { AppDependencies } from '../app.js';

function createTestDeps(): AppDependencies {
  const db = createDatabase(':memory:');
  runMigrations(db);
  const services = createServices(db);

  // Seed demo teacher
  services.repos.teachers.create({
    teacher_id: crypto.randomUUID(),
    email: 'demo@school.edu',
    display_name: 'Demo Teacher',
    grade_bands: [7, 8],
    subjects: ['Math'],
    preferred_languages: ['en'],
    output_defaults: { medium: 'google_doc', include_tiers: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const queue = new InMemoryQueue();
  queue.registerHandler('generate-package', createGeneratePackageHandler(services) as any);

  return { services, queue };
}

describe('GET /v1/health', () => {
  const app = createApp();

  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('0.1.0');
    expect(res.body.timestamp).toBeDefined();
  });

  it('includes x-request-id header', async () => {
    const res = await request(app).get('/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('preserves provided x-request-id', async () => {
    const res = await request(app)
      .get('/v1/health')
      .set('x-request-id', 'test-id-123');
    expect(res.headers['x-request-id']).toBe('test-id-123');
  });
});

describe('CORS', () => {
  const app = createApp();

  it('includes cors headers', async () => {
    const res = await request(app).get('/v1/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('POST /v1/requests', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const deps = createTestDeps();
    app = createApp(deps);
  });

  it('creates a request and returns 201', async () => {
    const res = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a lesson plan for 8th grade math' });

    expect(res.status).toBe(201);
    expect(res.body.request_id).toBeDefined();
    expect(res.body.plan_id).toBeDefined();
    expect(res.body.inferred_intent).toBe('lesson_plan');
    expect(res.body.status).toBe('processing');
  });

  it('returns 400 for missing prompt', async () => {
    const res = await request(app).post('/v1/requests').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('prompt');
  });

  it('returns 400 for empty prompt', async () => {
    const res = await request(app).post('/v1/requests').send({ prompt: '  ' });
    expect(res.status).toBe(400);
  });

  it('accepts multipart form with files', async () => {
    const tmpFile = path.join(os.tmpdir(), 'test-upload.txt');
    fs.writeFileSync(tmpFile, 'Sample lesson content for upload test');

    try {
      const res = await request(app)
        .post('/v1/requests')
        .field('prompt', 'Create a lesson plan from this material')
        .attach('files', tmpFile);

      expect(res.status).toBe(201);
      expect(res.body.request_id).toBeDefined();
      expect(res.body.attachment_count).toBe(1);
      expect(res.body.inferred_intent).toBe('lesson_plan');
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });

  it('returns attachment_count 0 for JSON-only requests', async () => {
    const res = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a worksheet' });

    expect(res.status).toBe(201);
    expect(res.body.attachment_count).toBe(0);
  });

  it('rejects disallowed file types', async () => {
    const tmpFile = path.join(os.tmpdir(), 'malicious.exe');
    fs.writeFileSync(tmpFile, 'not a real exe');

    try {
      const res = await request(app)
        .post('/v1/requests')
        .field('prompt', 'Test with bad file')
        .attach('files', tmpFile, { contentType: 'application/x-msdownload' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('File type not allowed');
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });

  it('accepts multiple files', async () => {
    const tmpFile1 = path.join(os.tmpdir(), 'doc1.txt');
    const tmpFile2 = path.join(os.tmpdir(), 'doc2.txt');
    fs.writeFileSync(tmpFile1, 'Document one');
    fs.writeFileSync(tmpFile2, 'Document two');

    try {
      const res = await request(app)
        .post('/v1/requests')
        .field('prompt', 'Create a lesson from these')
        .attach('files', tmpFile1)
        .attach('files', tmpFile2);

      expect(res.status).toBe(201);
      expect(res.body.attachment_count).toBe(2);
    } finally {
      fs.unlinkSync(tmpFile1);
      fs.unlinkSync(tmpFile2);
    }
  });
});

describe('GET /v1/requests/:id', () => {
  let app: ReturnType<typeof createApp>;
  let deps: AppDependencies;

  beforeEach(() => {
    deps = createTestDeps();
    app = createApp(deps);
  });

  it('returns a request with status', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a lesson plan' });
    const requestId = createRes.body.request_id;

    const res = await request(app).get(`/v1/requests/${requestId}`);
    expect(res.status).toBe(200);
    expect(res.body.request_id).toBe(requestId);
    expect(res.body.status).toBeDefined();
  });

  it('returns 404 for unknown request', async () => {
    const res = await request(app).get('/v1/requests/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('GET /v1/requests/:id/artifacts', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(createTestDeps());
  });

  it('returns artifacts after generation completes', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a lesson plan for math' });

    // Wait a tick for the async queue to process
    await new Promise((r) => setTimeout(r, 100));

    const res = await request(app).get(`/v1/requests/${createRes.body.request_id}/artifacts`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].content).toBeTruthy();
  });
});

describe('GET /v1/artifacts/:id', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(createTestDeps());
  });

  it('returns a specific artifact', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a worksheet' });

    await new Promise((r) => setTimeout(r, 100));

    const artifactsRes = await request(app).get(`/v1/requests/${createRes.body.request_id}/artifacts`);
    if (artifactsRes.body.length > 0) {
      const artifactId = artifactsRes.body[0].artifact_id;
      const res = await request(app).get(`/v1/artifacts/${artifactId}`);
      expect(res.status).toBe(200);
      expect(res.body.artifact_id).toBe(artifactId);
    }
  });

  it('returns 404 for unknown artifact', async () => {
    const res = await request(app).get('/v1/artifacts/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('POST /v1/artifacts/:id/export', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(createTestDeps());
  });

  it('exports artifact as markdown', async () => {
    const createRes = await request(app)
      .post('/v1/requests')
      .send({ prompt: 'Create a lesson plan' });

    await new Promise((r) => setTimeout(r, 100));

    const artifactsRes = await request(app).get(`/v1/requests/${createRes.body.request_id}/artifacts`);
    if (artifactsRes.body.length > 0) {
      const artifactId = artifactsRes.body[0].artifact_id;
      const res = await request(app)
        .post(`/v1/artifacts/${artifactId}/export`)
        .send({ medium: 'markdown' });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.headers['content-disposition']).toContain('attachment');
    }
  });
});

describe('Teacher routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(createTestDeps());
  });

  it('GET /v1/teachers/me returns demo teacher', async () => {
    const res = await request(app).get('/v1/teachers/me');
    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe('Demo Teacher');
    expect(res.body.email).toBe('demo@school.edu');
  });

  it('PUT /v1/teachers/me updates teacher', async () => {
    const res = await request(app)
      .put('/v1/teachers/me')
      .send({ display_name: 'Updated Teacher' });
    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe('Updated Teacher');
  });
});

describe('Class routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(createTestDeps());
  });

  it('POST /v1/classes creates a class', async () => {
    const res = await request(app).post('/v1/classes').send({
      name: '8th Grade Math',
      grade: 8,
      subject: 'Math',
      period_length_minutes: 50,
      roster_count: 25,
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('8th Grade Math');
    expect(res.body.class_id).toBeDefined();
  });

  it('GET /v1/classes lists classes', async () => {
    // Create a class first
    await request(app).post('/v1/classes').send({
      name: '8th Grade Math',
      grade: 8,
      subject: 'Math',
      period_length_minutes: 50,
    });

    const res = await request(app).get('/v1/classes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('GET /v1/classes/:id returns a class', async () => {
    const createRes = await request(app).post('/v1/classes').send({
      name: '7th Grade Science',
      grade: 7,
      subject: 'Science',
      period_length_minutes: 45,
    });

    const res = await request(app).get(`/v1/classes/${createRes.body.class_id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('7th Grade Science');
  });

  it('returns 400 for missing class fields', async () => {
    const res = await request(app).post('/v1/classes').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });
});
