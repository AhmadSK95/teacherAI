import type { EvalCase, EvalResult } from './types.js';

export type OutputGenerator = (prompt: string, context?: Record<string, unknown>) => Promise<string>;

export async function runEval(
  evalCase: EvalCase,
  generator: OutputGenerator,
): Promise<EvalResult> {
  const start = Date.now();
  const details: string[] = [];
  let passed = true;
  let score = 1.0;

  const output = await generator(evalCase.input.prompt, evalCase.input.context);
  const expected = evalCase.expectedOutput;

  if (expected.containsKeywords) {
    for (const keyword of expected.containsKeywords) {
      if (!output.toLowerCase().includes(keyword.toLowerCase())) {
        details.push(`Missing keyword: "${keyword}"`);
        passed = false;
        score -= 1 / expected.containsKeywords.length;
      }
    }
  }

  if (expected.minLength && output.length < expected.minLength) {
    details.push(`Output too short: ${output.length} < ${expected.minLength}`);
    passed = false;
    score -= 0.25;
  }

  if (expected.maxLength && output.length > expected.maxLength) {
    details.push(`Output too long: ${output.length} > ${expected.maxLength}`);
    passed = false;
    score -= 0.25;
  }

  if (passed) {
    details.push('All checks passed');
  }

  return {
    caseId: evalCase.id,
    passed,
    score: Math.max(0, score),
    details,
    duration_ms: Date.now() - start,
  };
}

export async function runEvalSuite(
  cases: EvalCase[],
  generator: OutputGenerator,
): Promise<EvalResult[]> {
  const results: EvalResult[] = [];
  for (const evalCase of cases) {
    results.push(await runEval(evalCase, generator));
  }
  return results;
}
