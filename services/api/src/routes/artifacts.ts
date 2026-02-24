import { Router } from 'express';
import type { ServiceContainer } from '@teachassist/core';
import { DefaultDeliveryService, EvaluationService } from '@teachassist/core';

export function createArtifactsRouter(services: ServiceContainer): Router {
  const router = Router();

  // GET /v1/artifacts/:id — Get single artifact
  router.get('/artifacts/:id', (req, res) => {
    const artifact = services.repos.artifacts.findById(req.params.id);
    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }
    res.json(artifact);
  });

  // PUT /v1/artifacts/:id — Update artifact content
  router.put('/artifacts/:id', (req, res) => {
    const artifact = services.repos.artifacts.findById(req.params.id);
    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }

    const { content } = req.body;
    if (content !== undefined) {
      const updated = services.repos.artifacts.update(req.params.id, {
        content,
        version: artifact.version + 1,
      });
      res.json(updated);
    } else {
      res.json(artifact);
    }
  });

  // POST /v1/artifacts/:id/approve — Create approval event
  router.post('/artifacts/:id/approve', async (req, res) => {
    const artifact = services.repos.artifacts.findById(req.params.id);
    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }

    const requiresApproval = await services.policy.requiresApproval(req.params.id);

    res.status(201).json({
      approval_id: crypto.randomUUID(),
      artifact_id: req.params.id,
      risk_level: requiresApproval ? 'high' : 'low',
      status: 'approved',
      approved_by: req.body.teacher_id || 'demo-teacher',
      notes: req.body.notes || null,
      created_at: new Date().toISOString(),
    });
  });

  // POST /v1/artifacts/:id/export — Export artifact
  router.post('/artifacts/:id/export', async (req, res) => {
    const artifact = services.repos.artifacts.findById(req.params.id);
    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }

    const medium = req.body.medium || 'markdown';
    const deliveryService = services.delivery as DefaultDeliveryService;
    const exportResult = await deliveryService.getExportContent(req.params.id, medium);

    if (!exportResult) {
      res.status(500).json({ error: 'Export failed' });
      return;
    }

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
    res.send(exportResult.content);
  });

  // POST /v1/artifacts/:id/evaluate — Run quality evaluation
  router.post('/artifacts/:id/evaluate', async (req, res, next) => {
    try {
      const artifact = services.repos.artifacts.findById(req.params.id);
      if (!artifact) {
        res.status(404).json({ error: 'Artifact not found' });
        return;
      }

      const evalService = new EvaluationService(services.aiProvider);

      // Run deterministic checks
      const quality = evalService.checkMinimumQuality(artifact);

      // Run AI-powered evaluation
      const evaluation = await evalService.evaluate(artifact);

      // Run compliance check
      const compliance = await services.policy.checkCompliance(req.params.id);

      res.json({
        ...evaluation,
        quality_check: quality,
        compliance,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
