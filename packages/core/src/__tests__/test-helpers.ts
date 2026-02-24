import type Database from 'better-sqlite3';
import { createDatabase, runMigrations } from '../db/client.js';
import { SqliteTeacherRepository } from '../repository/sqlite-teacher.js';
import type { TeacherProfile } from '@teachassist/schemas';

export const DEMO_TEACHER_ID = '22222222-2222-2222-2222-222222222222';
export const DEMO_REQUEST_ID = '11111111-1111-1111-1111-111111111111';
export const DEMO_PLAN_ID = '33333333-3333-3333-3333-333333333333';
export const DEMO_ARTIFACT_ID = '55555555-5555-5555-5555-555555555555';

export function createTestDb(): Database.Database {
  const db = createDatabase(':memory:');
  runMigrations(db);
  return db;
}

export function seedDemoTeacher(db: Database.Database): TeacherProfile {
  const repo = new SqliteTeacherRepository(db);
  const teacher: TeacherProfile = {
    teacher_id: DEMO_TEACHER_ID,
    email: 'demo@school.edu',
    display_name: 'Demo Teacher',
    grade_bands: [7, 8],
    subjects: ['Math'],
    preferred_languages: ['en'],
    output_defaults: { medium: 'google_doc', include_tiers: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return repo.create(teacher);
}
