import { v4 as uuidv4 } from 'uuid';
import type { RequestEvent, InferredIntent, AttachmentMeta } from '@teachassist/schemas';
import type { IntakeService, AttachmentInput } from './interfaces.js';
import type { RequestRepository, AttachmentRepository } from '../repository/interfaces.js';

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
  constructor(
    private requestRepo: RequestRepository,
    private attachmentRepo?: AttachmentRepository,
  ) {}

  async processRequest(prompt: string, teacherId: string, classId?: string, attachments?: AttachmentInput[]): Promise<RequestEvent> {
    const intent = classifyIntent(prompt);
    const requestId = uuidv4();
    const now = new Date().toISOString();

    // Pre-generate attachment IDs so we can include them in the request event
    const attachmentIds: string[] = [];
    if (attachments && attachments.length > 0 && this.attachmentRepo) {
      for (let i = 0; i < attachments.length; i++) {
        attachmentIds.push(uuidv4());
      }
    }

    // Create request first (attachment_meta has FK to request_event)
    const requestEvent: RequestEvent = {
      request_id: requestId,
      teacher_id: teacherId,
      class_id: classId,
      prompt_text: prompt,
      attachment_ids: attachmentIds,
      inferred_intent: intent,
      created_at: now,
    };
    this.requestRepo.create(requestEvent);

    // Now create attachment_meta rows
    if (attachments && attachments.length > 0 && this.attachmentRepo) {
      for (let i = 0; i < attachments.length; i++) {
        const att = attachments[i];
        const meta: AttachmentMeta = {
          attachment_id: attachmentIds[i],
          request_id: requestId,
          file_name: att.originalName,
          file_type: att.mimeType,
          file_size_bytes: att.sizeBytes,
          parse_success: false,
          extracted_topics: [],
          created_at: now,
        };
        this.attachmentRepo.create(meta);
      }
    }

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
