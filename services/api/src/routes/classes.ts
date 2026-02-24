import { Router } from 'express';
import type { ServiceContainer } from '@teachassist/core';

export function createClassesRouter(services: ServiceContainer): Router {
  const router = Router();

  // GET /v1/classes — List all classes for current teacher
  router.get('/classes', (req, res) => {
    const teachers = services.repos.teachers.findAll();
    if (teachers.length === 0) {
      res.json([]);
      return;
    }
    const classes = services.repos.classes.findByTeacherId(teachers[0].teacher_id);
    res.json(classes);
  });

  // POST /v1/classes — Create a new class
  router.post('/classes', (req, res) => {
    const teachers = services.repos.teachers.findAll();
    if (teachers.length === 0) {
      res.status(500).json({ error: 'No teacher profile found' });
      return;
    }

    const { name, grade, subject, period_length_minutes, roster_count } = req.body;
    if (!name || !grade || !subject || !period_length_minutes) {
      res.status(400).json({ error: 'name, grade, subject, and period_length_minutes are required' });
      return;
    }

    const classProfile = {
      class_id: crypto.randomUUID(),
      teacher_id: teachers[0].teacher_id,
      name,
      grade,
      subject,
      period_length_minutes,
      roster_count: roster_count || 0,
      support_flags: req.body.support_flags || [],
      routine_blocks: req.body.routine_blocks || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = services.repos.classes.create(classProfile);
    res.status(201).json(created);
  });

  // GET /v1/classes/:id — Get a class by ID
  router.get('/classes/:id', (req, res) => {
    const cls = services.repos.classes.findById(req.params.id);
    if (!cls) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.json(cls);
  });

  // PUT /v1/classes/:id — Update a class
  router.put('/classes/:id', (req, res) => {
    const cls = services.repos.classes.findById(req.params.id);
    if (!cls) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.class_id;
    delete updates.teacher_id;

    const updated = services.repos.classes.update(req.params.id, updates);
    res.json(updated);
  });

  return router;
}
