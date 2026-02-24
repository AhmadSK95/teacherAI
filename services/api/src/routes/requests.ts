import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type { ServiceContainer, AttachmentInput } from '@teachassist/core';
import type { InMemoryQueue } from '@teachassist/worker';
import { upload } from '../middleware/upload.js';

export function createRequestsRouter(services: ServiceContainer, queue: InMemoryQueue): Router {
  const router = Router();

  // POST /v1/requests — Intake + plan + enqueue generation
  router.post('/requests', upload.array('files', 5), async (req, res, next) => {
    try {
      const { prompt, classId } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({ error: 'prompt is required' });
        return;
      }

      // For Level 1, use the demo teacher ID
      const teacherId = (req as any).teacherId || services.repos.teachers.findAll()[0]?.teacher_id;
      if (!teacherId) {
        res.status(500).json({ error: 'No teacher profile found' });
        return;
      }

      // Build attachment inputs from uploaded files
      const files = (req.files as Express.Multer.File[]) || [];
      const attachments: AttachmentInput[] = files.map((f) => ({
        originalName: f.originalname,
        mimeType: f.mimetype,
        sizeBytes: f.size,
        storagePath: f.path,
      }));

      // 1. Intake: classify intent, create request event
      const requestEvent = await services.intake.processRequest(prompt.trim(), teacherId, classId, attachments);

      // Move uploaded files from _tmp to data/uploads/<requestId>/
      if (files.length > 0) {
        const destDir = path.resolve('data/uploads', requestEvent.request_id);
        fs.mkdirSync(destDir, { recursive: true });
        for (const f of files) {
          const dest = path.join(destDir, path.basename(f.path));
          fs.renameSync(f.path, dest);
        }
      }

      // 2. Planning: create plan graph
      const plan = await services.planning.createPlan(requestEvent);

      // 3. Enqueue generation job
      const job = queue.enqueue('generate-package', {
        requestId: requestEvent.request_id,
        planId: plan.plan_id,
      });

      // Process immediately (in-process worker for Level 1)
      setTimeout(() => queue.processNext(), 0);

      res.status(201).json({
        request_id: requestEvent.request_id,
        plan_id: plan.plan_id,
        job_id: job.id,
        inferred_intent: requestEvent.inferred_intent,
        attachment_count: attachments.length,
        status: 'processing',
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/requests/:id — Get request with derived status
  router.get('/requests/:id', (req, res) => {
    const request = services.repos.requests.findById(req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    // Derive status from plan graph
    const plan = services.repos.planGraphs.findByRequestId(request.request_id);
    let status = 'pending';
    if (plan) {
      const allCompleted = plan.task_nodes.every((n) => n.status === 'completed');
      const anyRunning = plan.task_nodes.some((n) => n.status === 'running');
      const anyFailed = plan.task_nodes.some((n) => n.status === 'failed');

      if (allCompleted) status = 'completed';
      else if (anyFailed) status = 'failed';
      else if (anyRunning) status = 'processing';
      else status = 'planned';
    }

    res.json({ ...request, status });
  });

  // GET /v1/requests/:id/plan — Get plan graph
  router.get('/requests/:id/plan', (req, res) => {
    const plan = services.repos.planGraphs.findByRequestId(req.params.id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.json(plan);
  });

  // GET /v1/requests/:id/artifacts — Get artifacts for a request
  router.get('/requests/:id/artifacts', (req, res) => {
    const request = services.repos.requests.findById(req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    const artifacts = services.repos.artifacts.findByRequestId(req.params.id);
    res.json(artifacts);
  });

  // POST /v1/requests/:id/feedback — Submit outcome feedback
  router.post('/requests/:id/feedback', (req, res) => {
    const request = services.repos.requests.findById(req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const { usefulness_score, minutes_saved, comments } = req.body;
    if (!usefulness_score || usefulness_score < 1 || usefulness_score > 5) {
      res.status(400).json({ error: 'usefulness_score must be between 1 and 5' });
      return;
    }

    res.status(201).json({
      feedback_id: crypto.randomUUID(),
      request_id: req.params.id,
      usefulness_score,
      minutes_saved,
      comments,
      created_at: new Date().toISOString(),
    });
  });

  return router;
}
