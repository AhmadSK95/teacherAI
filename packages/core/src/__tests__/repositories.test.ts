import { describe, it, expect, beforeEach } from 'vitest';
import type Database from 'better-sqlite3';
import { createDatabase, runMigrations } from '../db/client.js';
import { SqliteTeacherRepository } from '../repository/sqlite-teacher.js';
import { SqliteClassRepository } from '../repository/sqlite-class.js';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { SqliteArtifactRepository } from '../repository/sqlite-artifact.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';

const uuid1 = '550e8400-e29b-41d4-a716-446655440001';
const uuid2 = '550e8400-e29b-41d4-a716-446655440002';
const uuid3 = '550e8400-e29b-41d4-a716-446655440003';
const uuid4 = '550e8400-e29b-41d4-a716-446655440004';
const now = '2026-02-24T12:00:00.000Z';

let db: Database.Database;

beforeEach(() => {
  db = createDatabase(':memory:');
  runMigrations(db);
});

describe('SqliteTeacherRepository', () => {
  let repo: SqliteTeacherRepository;

  beforeEach(() => {
    repo = new SqliteTeacherRepository(db);
  });

  const teacher = {
    teacher_id: uuid1,
    email: 'teacher@school.edu',
    display_name: 'Ms. Smith',
    grade_bands: [6, 7, 8],
    subjects: ['Math'],
    preferred_languages: ['en'] as ['en'],
    output_defaults: { medium: 'google_doc' as const, include_tiers: true },
    created_at: now,
    updated_at: now,
  };

  it('creates and retrieves a teacher', () => {
    repo.create(teacher);
    const found = repo.findById(uuid1);
    expect(found).toBeDefined();
    expect(found!.email).toBe('teacher@school.edu');
    expect(found!.grade_bands).toEqual([6, 7, 8]);
  });

  it('finds by email', () => {
    repo.create(teacher);
    const found = repo.findByEmail('teacher@school.edu');
    expect(found).toBeDefined();
    expect(found!.teacher_id).toBe(uuid1);
  });

  it('returns null for missing teacher', () => {
    expect(repo.findById('missing')).toBeNull();
  });

  it('updates a teacher', () => {
    repo.create(teacher);
    const updated = repo.update(uuid1, { display_name: 'Mrs. Jones', updated_at: now });
    expect(updated!.display_name).toBe('Mrs. Jones');
  });

  it('deletes a teacher', () => {
    repo.create(teacher);
    expect(repo.delete(uuid1)).toBe(true);
    expect(repo.findById(uuid1)).toBeNull();
  });

  it('lists all teachers', () => {
    repo.create(teacher);
    repo.create({ ...teacher, teacher_id: uuid2, email: 'other@school.edu' });
    expect(repo.findAll()).toHaveLength(2);
  });
});

describe('SqliteClassRepository', () => {
  let teacherRepo: SqliteTeacherRepository;
  let classRepo: SqliteClassRepository;

  beforeEach(() => {
    teacherRepo = new SqliteTeacherRepository(db);
    classRepo = new SqliteClassRepository(db);
    teacherRepo.create({
      teacher_id: uuid1,
      email: 't@s.edu',
      display_name: 'T',
      grade_bands: [8],
      subjects: ['Math'],
      preferred_languages: ['en'],
      output_defaults: { medium: 'google_doc', include_tiers: true },
      created_at: now,
      updated_at: now,
    });
  });

  const cls = {
    class_id: uuid2,
    teacher_id: uuid1,
    name: 'Period 3',
    grade: 8,
    subject: 'Math',
    period_length_minutes: 45,
    roster_count: 28,
    support_flags: ['ell'],
    routine_blocks: ['warm-up', 'direct-instruction'],
    created_at: now,
    updated_at: now,
  };

  it('creates and finds by teacher', () => {
    classRepo.create(cls);
    const classes = classRepo.findByTeacherId(uuid1);
    expect(classes).toHaveLength(1);
    expect(classes[0].name).toBe('Period 3');
  });

  it('updates a class', () => {
    classRepo.create(cls);
    const updated = classRepo.update(uuid2, { roster_count: 30, updated_at: now });
    expect(updated!.roster_count).toBe(30);
  });
});

describe('SqliteRequestRepository', () => {
  let repo: SqliteRequestRepository;

  beforeEach(() => {
    repo = new SqliteRequestRepository(db);
    new SqliteTeacherRepository(db).create({
      teacher_id: uuid1,
      email: 't@s.edu',
      display_name: 'T',
      grade_bands: [8],
      subjects: ['Math'],
      preferred_languages: ['en'],
      output_defaults: { medium: 'google_doc', include_tiers: true },
      created_at: now,
      updated_at: now,
    });
  });

  it('creates and finds requests by teacher', () => {
    repo.create({
      request_id: uuid3,
      teacher_id: uuid1,
      prompt_text: 'Create a lesson plan',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: now,
    });
    const results = repo.findByTeacherId(uuid1);
    expect(results).toHaveLength(1);
    expect(results[0].inferred_intent).toBe('lesson_plan');
  });
});

describe('SqlitePlanGraphRepository', () => {
  let planRepo: SqlitePlanGraphRepository;

  beforeEach(() => {
    planRepo = new SqlitePlanGraphRepository(db);
    const teacherRepo = new SqliteTeacherRepository(db);
    const requestRepo = new SqliteRequestRepository(db);
    teacherRepo.create({
      teacher_id: uuid1,
      email: 't@s.edu',
      display_name: 'T',
      grade_bands: [8],
      subjects: ['Math'],
      preferred_languages: ['en'],
      output_defaults: { medium: 'google_doc', include_tiers: true },
      created_at: now,
      updated_at: now,
    });
    requestRepo.create({
      request_id: uuid3,
      teacher_id: uuid1,
      prompt_text: 'Test',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: now,
    });
  });

  it('creates and finds by request', () => {
    planRepo.create({
      plan_id: uuid4,
      request_id: uuid3,
      task_nodes: [{ node_id: 'n1', task_type: 'gen', status: 'pending' }],
      dependency_edges: [],
      created_at: now,
    });
    const found = planRepo.findByRequestId(uuid3);
    expect(found).toBeDefined();
    expect(found!.task_nodes).toHaveLength(1);
  });
});

describe('SqliteArtifactRepository', () => {
  let artifactRepo: SqliteArtifactRepository;

  beforeEach(() => {
    artifactRepo = new SqliteArtifactRepository(db);
    const teacherRepo = new SqliteTeacherRepository(db);
    const requestRepo = new SqliteRequestRepository(db);
    const planRepo = new SqlitePlanGraphRepository(db);
    teacherRepo.create({
      teacher_id: uuid1,
      email: 't@s.edu',
      display_name: 'T',
      grade_bands: [8],
      subjects: ['Math'],
      preferred_languages: ['en'],
      output_defaults: { medium: 'google_doc', include_tiers: true },
      created_at: now,
      updated_at: now,
    });
    requestRepo.create({
      request_id: uuid3,
      teacher_id: uuid1,
      prompt_text: 'Test',
      attachment_ids: [],
      inferred_intent: 'lesson_plan',
      created_at: now,
    });
    planRepo.create({
      plan_id: uuid4,
      request_id: uuid3,
      task_nodes: [],
      dependency_edges: [],
      created_at: now,
    });
  });

  it('creates and finds by request', () => {
    artifactRepo.create({
      artifact_id: uuid2,
      request_id: uuid3,
      plan_id: uuid4,
      medium_type: 'pdf',
      language: 'en',
      version: 1,
      content: 'Lesson plan content',
      metadata: {},
      created_at: now,
    });
    const results = artifactRepo.findByRequestId(uuid3);
    expect(results).toHaveLength(1);
    expect(results[0].content).toBe('Lesson plan content');
  });
});
