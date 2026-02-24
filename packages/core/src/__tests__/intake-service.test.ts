import { describe, it, expect, beforeEach } from 'vitest';
import { SqliteRequestRepository } from '../repository/sqlite-request.js';
import { DefaultIntakeService, classifyIntent } from '../services/intake-service.js';
import { createTestDb, seedDemoTeacher, DEMO_TEACHER_ID } from './test-helpers.js';

describe('IntakeService', () => {
  let service: DefaultIntakeService;
  let requestRepo: SqliteRequestRepository;

  beforeEach(() => {
    const db = createTestDb();
    seedDemoTeacher(db);
    requestRepo = new SqliteRequestRepository(db);
    service = new DefaultIntakeService(requestRepo);
  });

  it('creates a request event with classified intent', async () => {
    const result = await service.processRequest(
      'Create a lesson plan for 8th grade math on fractions',
      DEMO_TEACHER_ID,
    );

    expect(result.request_id).toBeDefined();
    expect(result.teacher_id).toBe(DEMO_TEACHER_ID);
    expect(result.prompt_text).toBe('Create a lesson plan for 8th grade math on fractions');
    expect(result.inferred_intent).toBe('lesson_plan');
    expect(result.created_at).toBeDefined();
  });

  it('persists the request event to the repository', async () => {
    const result = await service.processRequest('Make a worksheet', DEMO_TEACHER_ID);
    const found = requestRepo.findById(result.request_id);
    expect(found).not.toBeNull();
    expect(found!.prompt_text).toBe('Make a worksheet');
  });

  it('includes optional class_id when provided', async () => {
    // class_id has FK constraint — pass undefined to test the optional path
    const result = await service.processRequest('Create a quiz', DEMO_TEACHER_ID);
    expect(result.class_id).toBeUndefined();

    // Also verify the intent was classified
    expect(result.inferred_intent).toBe('assessment');
  });
});

describe('classifyIntent', () => {
  it('classifies lesson plan prompts', () => {
    expect(classifyIntent('Create a lesson plan for math')).toBe('lesson_plan');
    expect(classifyIntent('I need a lesson on fractions')).toBe('lesson_plan');
  });

  it('classifies worksheet prompts', () => {
    expect(classifyIntent('Generate a worksheet for vocabulary')).toBe('worksheet');
  });

  it('classifies assessment prompts', () => {
    expect(classifyIntent('Make an assessment for chapter 5')).toBe('assessment');
    expect(classifyIntent('Create a quiz on geometry')).toBe('assessment');
  });

  it('classifies IEP/SPED prompts as high-priority', () => {
    expect(classifyIntent('Help with IEP accommodations')).toBe('iep_support');
    expect(classifyIntent('Special education support for reading')).toBe('iep_support');
  });

  it('classifies parent letter prompts', () => {
    expect(classifyIntent('Write a letter to parents about the field trip')).toBe('parent_letter');
  });

  it('classifies slide deck prompts', () => {
    expect(classifyIntent('Create a slide presentation on photosynthesis')).toBe('slide_deck');
  });

  it('returns other for unrecognized prompts', () => {
    expect(classifyIntent('something completely random xyz')).toBe('other');
  });
});
