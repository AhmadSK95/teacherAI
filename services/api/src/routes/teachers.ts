import { Router } from 'express';
import type { ServiceContainer } from '@teachassist/core';

export function createTeachersRouter(services: ServiceContainer): Router {
  const router = Router();

  // GET /v1/teachers/me — Get current teacher profile
  router.get('/teachers/me', (req, res) => {
    // For Level 1, return the first (demo) teacher
    const teachers = services.repos.teachers.findAll();
    if (teachers.length === 0) {
      res.status(404).json({ error: 'No teacher profile found' });
      return;
    }
    res.json(teachers[0]);
  });

  // PUT /v1/teachers/me — Update current teacher profile
  router.put('/teachers/me', (req, res) => {
    const teachers = services.repos.teachers.findAll();
    if (teachers.length === 0) {
      res.status(404).json({ error: 'No teacher profile found' });
      return;
    }

    const teacher = teachers[0];
    const { display_name, grade_bands, subjects, preferred_languages, output_defaults } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (display_name) updates.display_name = display_name;
    if (grade_bands) updates.grade_bands = grade_bands;
    if (subjects) updates.subjects = subjects;
    if (preferred_languages) updates.preferred_languages = preferred_languages;
    if (output_defaults) updates.output_defaults = output_defaults;

    const updated = services.repos.teachers.update(teacher.teacher_id, updates as any);
    res.json(updated);
  });

  return router;
}
