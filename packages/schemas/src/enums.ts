import { z } from 'zod';

export const MediumType = z.enum([
  'google_doc',
  'google_slide',
  'pptx',
  'pdf',
  'spreadsheet',
  'markdown',
]);
export type MediumType = z.infer<typeof MediumType>;

export const Language = z.enum([
  'en',
  'es',
  'zh',
  'ar',
  'vi',
  'ko',
  'tl',
  'ht',
  'fr',
  'pt',
]);
export type Language = z.infer<typeof Language>;

export const Tier = z.enum(['approaching', 'on_level', 'advanced']);
export type Tier = z.infer<typeof Tier>;

export const InferredIntent = z.enum([
  'lesson_plan',
  'worksheet',
  'assessment',
  'slide_deck',
  'parent_letter',
  'iep_support',
  'translation',
  'seating_chart',
  'rubric',
  'other',
]);
export type InferredIntent = z.infer<typeof InferredIntent>;

export const RiskLevel = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof RiskLevel>;

export const ApprovalStatus = z.enum(['pending', 'approved', 'rejected']);
export type ApprovalStatus = z.infer<typeof ApprovalStatus>;

export const EditType = z.enum(['text_edit', 'reorder', 'delete_section', 'add_section', 'style']);
export type EditType = z.infer<typeof EditType>;

export const ScaffoldingLevel = z.enum(['beginner', 'intermediate', 'advanced', 'native']);
export type ScaffoldingLevel = z.infer<typeof ScaffoldingLevel>;
