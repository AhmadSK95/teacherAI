import { v4 as uuidv4 } from 'uuid';
import type { RequestEvent, InferredIntent } from '@teachassist/schemas';
import type { IntakeService } from './interfaces.js';
import type { RequestRepository } from '../repository/interfaces.js';

const INTENT_KEYWORDS: Record<InferredIntent, string[]> = {
  lesson_plan: ['lesson plan', 'lesson', 'unit plan', 'teaching plan'],
  worksheet: ['worksheet', 'handout', 'practice sheet', 'activity sheet'],
  assessment: ['assessment', 'test', 'quiz', 'exam', 'evaluation'],
  slide_deck: ['slide', 'presentation', 'powerpoint', 'pptx', 'slide deck'],
  parent_letter: ['parent', 'family', 'letter home', 'guardian', 'newsletter'],
  iep_support: ['iep', 'accommodation', 'special education', 'sped', '504', 'modification', 'individualized education'],
  translation: ['translate', 'translation', 'spanish', 'bilingual', 'multilingual'],
  seating_chart: ['seating chart', 'seating arrangement', 'desk arrangement'],
  rubric: ['rubric', 'scoring guide', 'grading criteria'],
  other: [],
};

export class DefaultIntakeService implements IntakeService {
  constructor(private requestRepo: RequestRepository) {}

  async processRequest(prompt: string, teacherId: string, classId?: string): Promise<RequestEvent> {
    const intent = classifyIntent(prompt);

    const requestEvent: RequestEvent = {
      request_id: uuidv4(),
      teacher_id: teacherId,
      class_id: classId,
      prompt_text: prompt,
      attachment_ids: [],
      inferred_intent: intent,
      created_at: new Date().toISOString(),
    };

    this.requestRepo.create(requestEvent);
    return requestEvent;
  }
}

export function classifyIntent(prompt: string): InferredIntent {
  const lower = prompt.toLowerCase();

  // Check intents in priority order (more specific first)
  const priorityOrder: InferredIntent[] = [
    'iep_support',
    'seating_chart',
    'slide_deck',
    'parent_letter',
    'lesson_plan',
    'worksheet',
    'assessment',
    'translation',
    'rubric',
    'other',
  ];

  for (const intent of priorityOrder) {
    const keywords = INTENT_KEYWORDS[intent];
    if (keywords.some((kw) => lower.includes(kw))) {
      return intent;
    }
  }

  return 'other';
}
