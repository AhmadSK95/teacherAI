import type { AIProvider, AIRequest, AIResponse } from './ai-provider.js';
import { generateFixtureContent } from './fixtures/content-fixtures.js';
import type { InferredIntent } from '@teachassist/schemas';

export class MockAIProvider implements AIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    const intent = this.detectIntentFromPrompt(request.prompt);
    const content = generateFixtureContent(intent, request.prompt);

    return {
      content,
      model: 'mock-v1',
      usage: { prompt_tokens: request.prompt.length, completion_tokens: content.length },
    };
  }

  private detectIntentFromPrompt(prompt: string): InferredIntent {
    const lower = prompt.toLowerCase();

    if (lower.includes('lesson plan') || lower.includes('lesson')) return 'lesson_plan';
    if (lower.includes('worksheet')) return 'worksheet';
    if (lower.includes('assessment') || lower.includes('test') || lower.includes('quiz')) return 'assessment';
    if (lower.includes('slide') || lower.includes('presentation')) return 'slide_deck';
    if (lower.includes('parent') || lower.includes('letter') || lower.includes('family')) return 'parent_letter';
    if (lower.includes('iep') || lower.includes('accommodation') || lower.includes('special education')) return 'iep_support';
    if (lower.includes('translat')) return 'translation';
    if (lower.includes('seating')) return 'seating_chart';
    if (lower.includes('rubric')) return 'rubric';
    return 'other';
  }
}
