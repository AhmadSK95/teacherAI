export interface EvalCase {
  id: string;
  name: string;
  description: string;
  input: {
    prompt: string;
    context?: Record<string, unknown>;
  };
  expectedOutput: {
    containsKeywords?: string[];
    minLength?: number;
    maxLength?: number;
    format?: string;
  };
  tags: string[];
}

export interface EvalResult {
  caseId: string;
  passed: boolean;
  score: number;
  details: string[];
  duration_ms: number;
}
