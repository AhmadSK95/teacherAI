import { z } from 'zod';
import {
  MediumType,
  Language,
  Tier,
  InferredIntent,
  RiskLevel,
  ApprovalStatus,
  EditType,
  ScaffoldingLevel,
} from './enums.js';

// ─── teacher_profile ──────────────────────────────────────────────
export const TeacherProfileSchema = z.object({
  teacher_id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().min(1),
  grade_bands: z.array(z.number().int().min(6).max(12)),
  subjects: z.array(z.string().min(1)),
  preferred_languages: z.array(Language).default(['en']),
  output_defaults: z
    .object({
      medium: MediumType.default('google_doc'),
      include_tiers: z.boolean().default(true),
    })
    .default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type TeacherProfile = z.infer<typeof TeacherProfileSchema>;

// ─── class_profile ────────────────────────────────────────────────
export const ClassProfileSchema = z.object({
  class_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  name: z.string().min(1),
  grade: z.number().int().min(6).max(12),
  subject: z.string().min(1),
  period_length_minutes: z.number().int().positive(),
  roster_count: z.number().int().nonnegative(),
  support_flags: z.array(z.string()).default([]),
  routine_blocks: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type ClassProfile = z.infer<typeof ClassProfileSchema>;

// ─── request_event ────────────────────────────────────────────────
export const RequestEventSchema = z.object({
  request_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  class_id: z.string().uuid().optional(),
  prompt_text: z.string().min(1),
  attachment_ids: z.array(z.string().uuid()).default([]),
  inferred_intent: InferredIntent,
  created_at: z.string().datetime(),
});
export type RequestEvent = z.infer<typeof RequestEventSchema>;

// ─── attachment_meta ──────────────────────────────────────────────
export const AttachmentMetaSchema = z.object({
  attachment_id: z.string().uuid(),
  request_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_type: z.string().min(1),
  file_size_bytes: z.number().int().nonnegative(),
  parse_success: z.boolean(),
  extracted_topics: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional(),
  created_at: z.string().datetime(),
});
export type AttachmentMeta = z.infer<typeof AttachmentMetaSchema>;

// ─── plan_graph ───────────────────────────────────────────────────
export const TaskNodeSchema = z.object({
  node_id: z.string(),
  task_type: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
});
export type TaskNode = z.infer<typeof TaskNodeSchema>;

export const PlanGraphSchema = z.object({
  plan_id: z.string().uuid(),
  request_id: z.string().uuid(),
  task_nodes: z.array(TaskNodeSchema),
  dependency_edges: z.array(z.tuple([z.string(), z.string()])),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
});
export type PlanGraph = z.infer<typeof PlanGraphSchema>;

// ─── artifact_output ──────────────────────────────────────────────
export const ArtifactOutputSchema = z.object({
  artifact_id: z.string().uuid(),
  request_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  medium_type: MediumType,
  language: Language.default('en'),
  tier: Tier.optional(),
  version: z.number().int().positive().default(1),
  content: z.string(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
});
export type ArtifactOutput = z.infer<typeof ArtifactOutputSchema>;

// ─── edit_event ───────────────────────────────────────────────────
export const EditEventSchema = z.object({
  edit_id: z.string().uuid(),
  artifact_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  edit_type: EditType,
  before_snippet: z.string().optional(),
  after_snippet: z.string().optional(),
  created_at: z.string().datetime(),
});
export type EditEvent = z.infer<typeof EditEventSchema>;

// ─── approval_event ──────────────────────────────────────────────
export const ApprovalEventSchema = z.object({
  approval_id: z.string().uuid(),
  artifact_id: z.string().uuid(),
  risk_level: RiskLevel,
  status: ApprovalStatus,
  approved_by: z.string().uuid(),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
});
export type ApprovalEvent = z.infer<typeof ApprovalEventSchema>;

// ─── export_event ─────────────────────────────────────────────────
export const ExportEventSchema = z.object({
  export_id: z.string().uuid(),
  artifact_id: z.string().uuid(),
  medium: MediumType,
  destination: z.string().min(1),
  success: z.boolean(),
  created_at: z.string().datetime(),
});
export type ExportEvent = z.infer<typeof ExportEventSchema>;

// ─── outcome_feedback ─────────────────────────────────────────────
export const OutcomeFeedbackSchema = z.object({
  feedback_id: z.string().uuid(),
  request_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  usefulness_score: z.number().int().min(1).max(5),
  minutes_saved: z.number().nonnegative().optional(),
  comments: z.string().optional(),
  created_at: z.string().datetime(),
});
export type OutcomeFeedback = z.infer<typeof OutcomeFeedbackSchema>;

// ─── district_policy ──────────────────────────────────────────────
export const DistrictPolicySchema = z.object({
  district_id: z.string().uuid(),
  name: z.string().min(1),
  retention_days: z.number().int().positive(),
  allowed_models: z.array(z.string()).default([]),
  redaction_rules: z.record(z.boolean()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type DistrictPolicy = z.infer<typeof DistrictPolicySchema>;

// ─── language_profile ─────────────────────────────────────────────
export const LanguageProfileSchema = z.object({
  class_id: z.string().uuid(),
  home_languages: z.array(Language),
  translation_defaults: z.array(Language).default([]),
  scaffolding_level: ScaffoldingLevel.default('intermediate'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type LanguageProfile = z.infer<typeof LanguageProfileSchema>;
