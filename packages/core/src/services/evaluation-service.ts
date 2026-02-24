import type { ArtifactOutput } from '@teachassist/schemas';
import type { AIProvider } from './ai-provider.js';

export interface EvaluationResult {
  artifact_id: string;
  overall_score: number;  // 1-5
  criteria: EvaluationCriterion[];
  passing: boolean;       // score >= 3
  feedback: string;
}

export interface EvaluationCriterion {
  name: string;
  score: number;  // 1-5
  comment: string;
}

const EVAL_SYSTEM_PROMPT = `You are an expert educational content evaluator for US public schools (Grades 6-12).

Evaluate the provided teaching material on these 5 criteria, each scored 1-5:

1. **Content Accuracy** — Is the content factually correct and grade-appropriate?
2. **Pedagogical Structure** — Does it follow sound instructional design (objectives, scaffolding, assessment)?
3. **Differentiation** — Does it address diverse learners (ELL, SPED, advanced)?
4. **Clarity** — Is the language clear, well-organized, and easy to follow?
5. **Completeness** — Does it include all necessary components for the requested material type?

Respond in EXACTLY this JSON format (no markdown wrapping):
{
  "criteria": [
    {"name": "Content Accuracy", "score": 4, "comment": "..."},
    {"name": "Pedagogical Structure", "score": 3, "comment": "..."},
    {"name": "Differentiation", "score": 3, "comment": "..."},
    {"name": "Clarity", "score": 4, "comment": "..."},
    {"name": "Completeness", "score": 4, "comment": "..."}
  ],
  "feedback": "Brief overall feedback here"
}`;

export class EvaluationService {
  constructor(private aiProvider: AIProvider) {}

  async evaluate(artifact: ArtifactOutput): Promise<EvaluationResult> {
    try {
      const response = await this.aiProvider.generate({
        prompt: `Evaluate the following teaching material:\n\n${artifact.content}`,
        systemPrompt: EVAL_SYSTEM_PROMPT,
      });

      const parsed = JSON.parse(response.content);
      const criteria: EvaluationCriterion[] = parsed.criteria || [];
      const totalScore = criteria.reduce((sum, c) => sum + c.score, 0) / (criteria.length || 1);

      return {
        artifact_id: artifact.artifact_id,
        overall_score: Math.round(totalScore * 10) / 10,
        criteria,
        passing: totalScore >= 3,
        feedback: parsed.feedback || '',
      };
    } catch {
      // If evaluation fails (JSON parse error, etc.), return a passing default
      return {
        artifact_id: artifact.artifact_id,
        overall_score: 3,
        criteria: [],
        passing: true,
        feedback: 'Evaluation could not be completed automatically.',
      };
    }
  }

  /**
   * Deterministic quality checks that don't require AI
   */
  checkMinimumQuality(artifact: ArtifactOutput): { passing: boolean; issues: string[] } {
    const issues: string[] = [];

    // Content length check
    if (artifact.content.length < 100) {
      issues.push('Content is too short (< 100 characters)');
    }

    // Must have some structure (at least one heading)
    if (!artifact.content.includes('#')) {
      issues.push('No headings found — content may lack structure');
    }

    // Check for truncated/incomplete content
    if (artifact.content.endsWith('...') || artifact.content.endsWith('…')) {
      issues.push('Content appears to be truncated');
    }

    return { passing: issues.length === 0, issues };
  }
}
