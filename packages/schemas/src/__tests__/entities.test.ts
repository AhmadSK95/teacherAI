import { describe, it, expect } from 'vitest';
import {
  TeacherProfileSchema,
  ClassProfileSchema,
  RequestEventSchema,
  AttachmentMetaSchema,
  PlanGraphSchema,
  ArtifactOutputSchema,
  EditEventSchema,
  ApprovalEventSchema,
  ExportEventSchema,
  OutcomeFeedbackSchema,
  DistrictPolicySchema,
  LanguageProfileSchema,
} from '../entities.js';

const uuid = '550e8400-e29b-41d4-a716-446655440000';
const now = '2026-02-24T12:00:00.000Z';

describe('TeacherProfileSchema', () => {
  const valid = {
    teacher_id: uuid,
    email: 'teacher@school.edu',
    display_name: 'Ms. Smith',
    grade_bands: [6, 7, 8],
    subjects: ['Math', 'Science'],
    preferred_languages: ['en', 'es'],
    output_defaults: { medium: 'google_doc', include_tiers: true },
    created_at: now,
    updated_at: now,
  };

  it('accepts valid teacher profile', () => {
    expect(TeacherProfileSchema.parse(valid)).toBeDefined();
  });

  it('rejects invalid email', () => {
    expect(() => TeacherProfileSchema.parse({ ...valid, email: 'bad' })).toThrow();
  });

  it('rejects grade outside 6-12', () => {
    expect(() => TeacherProfileSchema.parse({ ...valid, grade_bands: [5] })).toThrow();
  });

  it('applies defaults for optional fields', () => {
    const minimal = {
      teacher_id: uuid,
      email: 'a@b.com',
      display_name: 'A',
      grade_bands: [6],
      subjects: ['Math'],
      created_at: now,
      updated_at: now,
    };
    const parsed = TeacherProfileSchema.parse(minimal);
    expect(parsed.preferred_languages).toEqual(['en']);
    expect(parsed.output_defaults.medium).toBe('google_doc');
  });
});

describe('ClassProfileSchema', () => {
  const valid = {
    class_id: uuid,
    teacher_id: uuid,
    name: 'Period 3 Math',
    grade: 8,
    subject: 'Math',
    period_length_minutes: 45,
    roster_count: 30,
    created_at: now,
    updated_at: now,
  };

  it('accepts valid class profile', () => {
    expect(ClassProfileSchema.parse(valid)).toBeDefined();
  });

  it('rejects negative roster count', () => {
    expect(() => ClassProfileSchema.parse({ ...valid, roster_count: -1 })).toThrow();
  });
});

describe('RequestEventSchema', () => {
  const valid = {
    request_id: uuid,
    teacher_id: uuid,
    prompt_text: 'Create a lesson plan for fractions',
    inferred_intent: 'lesson_plan',
    created_at: now,
  };

  it('accepts valid request event', () => {
    expect(RequestEventSchema.parse(valid)).toBeDefined();
  });

  it('rejects empty prompt', () => {
    expect(() => RequestEventSchema.parse({ ...valid, prompt_text: '' })).toThrow();
  });

  it('rejects invalid intent', () => {
    expect(() => RequestEventSchema.parse({ ...valid, inferred_intent: 'invalid' })).toThrow();
  });
});

describe('AttachmentMetaSchema', () => {
  it('accepts valid attachment', () => {
    expect(
      AttachmentMetaSchema.parse({
        attachment_id: uuid,
        request_id: uuid,
        file_name: 'worksheet.pdf',
        file_type: 'application/pdf',
        file_size_bytes: 1024,
        parse_success: true,
        created_at: now,
      }),
    ).toBeDefined();
  });
});

describe('PlanGraphSchema', () => {
  it('accepts valid plan graph', () => {
    expect(
      PlanGraphSchema.parse({
        plan_id: uuid,
        request_id: uuid,
        task_nodes: [{ node_id: 'n1', task_type: 'generate', status: 'pending' }],
        dependency_edges: [],
        created_at: now,
      }),
    ).toBeDefined();
  });
});

describe('ArtifactOutputSchema', () => {
  it('accepts valid artifact', () => {
    expect(
      ArtifactOutputSchema.parse({
        artifact_id: uuid,
        request_id: uuid,
        plan_id: uuid,
        medium_type: 'pdf',
        content: 'Lesson content here',
        created_at: now,
      }),
    ).toBeDefined();
  });

  it('rejects invalid medium type', () => {
    expect(() =>
      ArtifactOutputSchema.parse({
        artifact_id: uuid,
        request_id: uuid,
        plan_id: uuid,
        medium_type: 'docx',
        content: 'x',
        created_at: now,
      }),
    ).toThrow();
  });
});

describe('EditEventSchema', () => {
  it('accepts valid edit event', () => {
    expect(
      EditEventSchema.parse({
        edit_id: uuid,
        artifact_id: uuid,
        teacher_id: uuid,
        edit_type: 'text_edit',
        created_at: now,
      }),
    ).toBeDefined();
  });
});

describe('ApprovalEventSchema', () => {
  it('accepts valid approval', () => {
    expect(
      ApprovalEventSchema.parse({
        approval_id: uuid,
        artifact_id: uuid,
        risk_level: 'high',
        status: 'approved',
        approved_by: uuid,
        created_at: now,
      }),
    ).toBeDefined();
  });

  it('rejects invalid risk level', () => {
    expect(() =>
      ApprovalEventSchema.parse({
        approval_id: uuid,
        artifact_id: uuid,
        risk_level: 'critical',
        status: 'approved',
        approved_by: uuid,
        created_at: now,
      }),
    ).toThrow();
  });
});

describe('ExportEventSchema', () => {
  it('accepts valid export event', () => {
    expect(
      ExportEventSchema.parse({
        export_id: uuid,
        artifact_id: uuid,
        medium: 'google_slide',
        destination: 'Google Drive',
        success: true,
        created_at: now,
      }),
    ).toBeDefined();
  });
});

describe('OutcomeFeedbackSchema', () => {
  it('accepts valid feedback', () => {
    expect(
      OutcomeFeedbackSchema.parse({
        feedback_id: uuid,
        request_id: uuid,
        teacher_id: uuid,
        usefulness_score: 4,
        minutes_saved: 30,
        created_at: now,
      }),
    ).toBeDefined();
  });

  it('rejects score outside 1-5', () => {
    expect(() =>
      OutcomeFeedbackSchema.parse({
        feedback_id: uuid,
        request_id: uuid,
        teacher_id: uuid,
        usefulness_score: 6,
        created_at: now,
      }),
    ).toThrow();
  });
});

describe('DistrictPolicySchema', () => {
  it('accepts valid district policy', () => {
    expect(
      DistrictPolicySchema.parse({
        district_id: uuid,
        name: 'NYC DOE',
        retention_days: 365,
        created_at: now,
        updated_at: now,
      }),
    ).toBeDefined();
  });
});

describe('LanguageProfileSchema', () => {
  it('accepts valid language profile', () => {
    expect(
      LanguageProfileSchema.parse({
        class_id: uuid,
        home_languages: ['en', 'es', 'zh'],
        created_at: now,
        updated_at: now,
      }),
    ).toBeDefined();
  });

  it('rejects invalid language code', () => {
    expect(() =>
      LanguageProfileSchema.parse({
        class_id: uuid,
        home_languages: ['xx'],
        created_at: now,
        updated_at: now,
      }),
    ).toThrow();
  });
});
