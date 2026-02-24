import { describe, it, expect, beforeEach } from 'vitest';
import type Database from 'better-sqlite3';
import { createDatabase, runMigrations } from '../db/client.js';
import { SqliteTeacherRepository } from '../repository/sqlite-teacher.js';
import { SqliteClassRepository } from '../repository/sqlite-class.js';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { SqliteArtifactRepository } from '../repository/sqlite-artifact.js';
import { SqlitePlanGraphRepository } from '../repository/sqlite-plan-graph.js';
import { SqliteAttachmentRepository } from '../repository/sqlite-attachment.js';

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

describe('SqliteAttachmentRepository', () => {
  let attachmentRepo: SqliteAttachmentRepository;

  beforeEach(() => {
    attachmentRepo = new SqliteAttachmentRepository(db);
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

  it('creates and retrieves an attachment', () => {
    attachmentRepo.create({
      attachment_id: uuid2,
      request_id: uuid3,
      file_name: 'lesson.pdf',
      file_type: 'application/pdf',
      file_size_bytes: 12345,
      parse_success: false,
      extracted_topics: [],
      created_at: now,
    });
    const found = attachmentRepo.findById(uuid2);
    expect(found).toBeDefined();
    expect(found!.file_name).toBe('lesson.pdf');
    expect(found!.file_size_bytes).toBe(12345);
    expect(found!.parse_success).toBe(false);
  });

  it('finds attachments by request id', () => {
    attachmentRepo.create({
      attachment_id: uuid2,
      request_id: uuid3,
      file_name: 'doc1.pdf',
      file_type: 'application/pdf',
      file_size_bytes: 1000,
      parse_success: false,
      extracted_topics: [],
      created_at: now,
    });
    attachmentRepo.create({
      attachment_id: uuid4,
      request_id: uuid3,
      file_name: 'doc2.txt',
      file_type: 'text/plain',
      file_size_bytes: 500,
      parse_success: true,
      extracted_topics: ['math', 'algebra'],
      created_at: now,
    });
    const results = attachmentRepo.findByRequestId(uuid3);
    expect(results).toHaveLength(2);
    expect(results[1].extracted_topics).toEqual(['math', 'algebra']);
  });

  it('updates an attachment', () => {
    attachmentRepo.create({
      attachment_id: uuid2,
      request_id: uuid3,
      file_name: 'lesson.pdf',
      file_type: 'application/pdf',
      file_size_bytes: 12345,
      parse_success: false,
      extracted_topics: [],
      created_at: now,
    });
    const updated = attachmentRepo.update(uuid2, { parse_success: true, extracted_topics: ['geometry'] });
    expect(updated!.parse_success).toBe(true);
    expect(updated!.extracted_topics).toEqual(['geometry']);
  });

  it('deletes an attachment', () => {
    attachmentRepo.create({
      attachment_id: uuid2,
      request_id: uuid3,
      file_name: 'lesson.pdf',
      file_type: 'application/pdf',
      file_size_bytes: 12345,
      parse_success: false,
      extracted_topics: [],
      created_at: now,
    });
    expect(attachmentRepo.delete(uuid2)).toBe(true);
    expect(attachmentRepo.findById(uuid2)).toBeNull();
  });
});
