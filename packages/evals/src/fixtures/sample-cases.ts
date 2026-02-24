import type { EvalCase } from '../types.js';

export const sampleEvalCases: EvalCase[] = [
  {
    id: 'eval-lesson-plan-basic',
    name: 'Basic Lesson Plan',
    description: 'Generates a basic lesson plan for 8th grade math',
    input: {
      prompt: 'Create a 45-minute lesson plan for 8th grade math on solving linear equations',
      context: { grade: '8', subject: 'Math', period_length: '45' },
    },
    expectedOutput: {
      containsKeywords: ['objective', 'linear', 'equation'],
      minLength: 200,
      maxLength: 5000,
    },
    tags: ['lesson-plan', 'math', 'grade-8'],
  },
  {
    id: 'eval-differentiation-approaching',
    name: 'Differentiation - Approaching',
    description: 'Adapts content for approaching tier',
    input: {
      prompt: 'Adapt this content for approaching-level students: Solve 2x + 5 = 15',
      context: { tier: 'approaching', grade: '7' },
    },
    expectedOutput: {
      containsKeywords: ['scaffold', 'step'],
      minLength: 100,
    },
    tags: ['differentiation', 'approaching'],
  },
  {
    id: 'eval-translation-spanish',
    name: 'Spanish Translation',
    description: 'Translates a parent letter to Spanish',
    input: {
      prompt: 'Translate to Spanish: Dear families, our class will begin a new unit on fractions next week.',
    },
    expectedOutput: {
      containsKeywords: ['familias', 'fracciones'],
      minLength: 50,
    },
    tags: ['translation', 'spanish'],
  },
];
