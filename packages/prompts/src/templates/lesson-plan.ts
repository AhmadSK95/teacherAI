import type { PromptTemplate } from '../template.js';

export const lessonPlanTemplate: PromptTemplate = {
  id: 'lesson-plan',
  name: 'Lesson Plan Generator',
  description: 'Generates a standards-aligned lesson plan',
  systemPrompt:
    'You are an expert curriculum designer for US public schools (Grades 6-12). Generate structured, standards-aligned lesson plans.',
  userPromptTemplate: `Create a lesson plan for the following:
Subject: {{subject}}
Grade: {{grade}}
Topic: {{topic}}
Period Length: {{period_length}} minutes
Special Considerations: {{considerations}}

Include: learning objectives, materials, warm-up, direct instruction, guided practice, independent practice, assessment, and closure.`,
  variables: ['subject', 'grade', 'topic', 'period_length', 'considerations'],
};
