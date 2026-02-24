import { describe, it, expect } from 'vitest';
import { runEval, runEvalSuite } from '../runner.js';
import { sampleEvalCases } from '../fixtures/sample-cases.js';
import type { EvalCase } from '../types.js';

const mockGenerator = async (prompt: string): Promise<string> => {
  if (prompt.includes('lesson plan')) {
    return 'Learning Objective: Students will solve linear equations using inverse operations. Materials: whiteboard, markers, student worksheets. Warm-up: Review equations from yesterday. Direct Instruction: Model solving two-step equations on the board. Guided Practice: Students work in pairs to solve example problems.';
  }
  if (prompt.includes('Adapt')) {
    return 'Scaffold step by step: First, identify the variable. Step 1: subtract 5 from both sides.';
  }
  if (prompt.includes('Translate')) {
    return 'Estimadas familias, nuestra clase comenzará una nueva unidad sobre fracciones la próxima semana.';
  }
  return 'Default output';
};

describe('runEval', () => {
  it('passes when output meets criteria', async () => {
    const result = await runEval(sampleEvalCases[0], mockGenerator);
    expect(result.caseId).toBe('eval-lesson-plan-basic');
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('fails when keywords are missing', async () => {
    const badCase: EvalCase = {
      id: 'test-fail',
      name: 'Failing case',
      description: 'Should fail',
      input: { prompt: 'lesson plan' },
      expectedOutput: { containsKeywords: ['nonexistent_keyword_xyz'] },
      tags: ['test'],
    };
    const result = await runEval(badCase, mockGenerator);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('Missing keyword: "nonexistent_keyword_xyz"');
  });

  it('fails when output is too short', async () => {
    const shortCase: EvalCase = {
      id: 'test-short',
      name: 'Short output',
      description: 'Should fail on length',
      input: { prompt: 'other' },
      expectedOutput: { minLength: 1000 },
      tags: ['test'],
    };
    const result = await runEval(shortCase, async () => 'short');
    expect(result.passed).toBe(false);
  });
});

describe('runEvalSuite', () => {
  it('processes all sample cases', async () => {
    const results = await runEvalSuite(sampleEvalCases, mockGenerator);
    expect(results).toHaveLength(sampleEvalCases.length);
    expect(results.every((r) => r.caseId)).toBe(true);
  });
});
