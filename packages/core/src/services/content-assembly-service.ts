import { v4 as uuidv4 } from 'uuid';
import type { PlanGraph, ArtifactOutput, TaskNode, InferredIntent } from '@teachassist/schemas';
import type { ContentAssemblyService } from './interfaces.js';
import type { ArtifactRepository, PlanGraphRepository, RequestRepository, AttachmentRepository } from '../repository/interfaces.js';
import type { AIProvider } from './ai-provider.js';
import { getTemplate, renderTemplate } from '@teachassist/prompts';
import { parseFile } from './file-parser.js';

// Map task types to template IDs
const TASK_TEMPLATE_MAP: Record<string, string> = {
  'generate-lesson-plan': 'lesson-plan',
  'generate-worksheet': 'lesson-plan',
  'generate-assessment': 'lesson-plan',
  'generate-slide-deck': 'lesson-plan',
  'generate-parent-letter': 'lesson-plan',
  'generate-iep-support': 'lesson-plan',
  'generate-rubric': 'lesson-plan',
  'generate-seating-chart': 'lesson-plan',
  'generate-translation': 'translation',
  'generate-content': 'lesson-plan',
};

// Intent-specific system prompts that give Claude the right persona
const INTENT_SYSTEM_PROMPTS: Record<string, string> = {
  lesson_plan:
    'You are an expert curriculum designer for US public schools (Grades 6-12). Generate structured, standards-aligned lesson plans in Markdown format. Include clear sections for objectives, materials, warm-up, instruction, practice, assessment, and differentiation.',
  worksheet:
    'You are an expert teacher creating student worksheets for US public schools (Grades 6-12). Generate well-structured worksheets in Markdown format with clear instructions, varied question types, and appropriate difficulty.',
  assessment:
    'You are an assessment design specialist for US public schools (Grades 6-12). Create balanced assessments in Markdown format with multiple question types, clear rubrics, and alignment to learning objectives.',
  slide_deck:
    'You are a presentation designer for teachers. Generate slide deck content in Markdown format. Each slide should be a ## heading. Include speaker notes, visual descriptions, and engaging content. Structure for a clear learning progression.',
  parent_letter:
    'You are helping a teacher communicate with parents/guardians. Write professional, warm, and clear communications in Markdown format. Include key information, action items, and contact details.',
  iep_support:
    'You are a special education support specialist. Generate IEP accommodation strategies and support materials in Markdown format. IMPORTANT: Include a disclaimer that this is a planning aid requiring IEP team approval. Follow IDEA/Section 504 guidelines.',
  translation:
    'You are a professional educational translator. Translate content while preserving pedagogical intent, grade-appropriate language, and formatting structure.',
  seating_chart:
    'You are a classroom management specialist. Generate seating arrangement recommendations in Markdown format with consideration for student needs, learning objectives, and accommodation requirements.',
  rubric:
    'You are an assessment specialist creating detailed rubrics. Generate clear, criterion-based rubrics in Markdown table format with descriptive levels of performance.',
  other:
    'You are a helpful teaching assistant for US public school teachers (Grades 6-12). Generate the requested educational content in Markdown format.',
};

export class DefaultContentAssemblyService implements ContentAssemblyService {
  constructor(
    private aiProvider: AIProvider,
    private artifactRepo: ArtifactRepository,
    private planGraphRepo: PlanGraphRepository,
    private requestRepo: RequestRepository,
    private attachmentRepo?: AttachmentRepository,
  ) {}

  async generateArtifacts(plan: PlanGraph): Promise<ArtifactOutput[]> {
    const request = this.requestRepo.findById(plan.request_id);
    if (!request) {
      throw new Error(`Request not found: ${plan.request_id}`);
    }

    // Extract text from attached files
    let attachmentContext = '';
    if (request.attachment_ids.length > 0 && this.attachmentRepo) {
      const attachments = this.attachmentRepo.findByRequestId(request.request_id);
      const parsedTexts: string[] = [];

      for (const att of attachments) {
        // Resolve the file path — files live in data/uploads/<requestId>/
        const possiblePaths = [
          `data/uploads/${request.request_id}`,
          `${process.cwd()}/data/uploads/${request.request_id}`,
        ];

        let parsed = false;
        for (const dir of possiblePaths) {
          try {
            const fs = await import('fs');
            if (!fs.existsSync(dir)) continue;
            const files = fs.readdirSync(dir);
            // Find a file that matches (by extension or name pattern)
            for (const file of files) {
              const filePath = `${dir}/${file}`;
              const result = await parseFile(filePath, att.file_type);
              if (result.parseSuccess && result.textContent.length > 0) {
                parsedTexts.push(`=== File: ${att.file_name} ===\n${result.textContent}`);
                // Update attachment meta with parse success
                this.attachmentRepo!.update(att.attachment_id, {
                  parse_success: true,
                });
                parsed = true;
                break;
              }
            }
            if (parsed) break;
          } catch {
            // Continue trying other paths
          }
        }
      }

      if (parsedTexts.length > 0) {
        attachmentContext = '\n\n--- ATTACHED REFERENCE MATERIALS ---\n' + parsedTexts.join('\n\n') + '\n--- END REFERENCE MATERIALS ---\n';
      }
    }

    const artifacts: ArtifactOutput[] = [];

    for (const node of plan.task_nodes) {
      this.updateNodeStatus(plan, node.node_id, 'running');

      try {
        // Build the system prompt based on intent
        const systemPrompt = INTENT_SYSTEM_PROMPTS[request.inferred_intent] || INTENT_SYSTEM_PROMPTS.other;

        // Build the user prompt with context
        let userPrompt = request.prompt_text;

        if (attachmentContext) {
          userPrompt += attachmentContext;
          userPrompt += '\n\nUse the attached reference materials above to inform your response. If the user asks to modify or adapt the attached content, do so based on their instructions.';
        }

        const aiResponse = await this.aiProvider.generate({
          prompt: userPrompt,
          systemPrompt,
        });

        const artifact: ArtifactOutput = {
          artifact_id: uuidv4(),
          request_id: plan.request_id,
          plan_id: plan.plan_id,
          medium_type: 'markdown',
          language: 'en',
          version: 1,
          content: aiResponse.content,
          metadata: {
            task_type: node.task_type,
            model: aiResponse.model,
            node_id: node.node_id,
            ...(aiResponse.usage ? { usage: aiResponse.usage } : {}),
          },
          created_at: new Date().toISOString(),
        };

        this.artifactRepo.create(artifact);
        artifacts.push(artifact);

        this.updateNodeStatus(plan, node.node_id, 'completed');
      } catch (error) {
        this.updateNodeStatus(plan, node.node_id, 'failed');
        throw error;
      }
    }

    // Generate tiered variants (approaching + advanced) for the primary artifact
    if (artifacts.length > 0) {
      const primary = artifacts[0];
      try {
        const tiers = await this.generateTieredVariants(primary, plan);
        artifacts.push(...tiers);
      } catch {
        // Tiering is best-effort; don't fail the whole pipeline
      }

      // Generate Spanish translation if applicable
      try {
        const translation = await this.generateTranslation(primary, plan, 'es');
        if (translation) artifacts.push(translation);
      } catch {
        // Translation is best-effort
      }
    }

    // Mark plan as completed
    this.planGraphRepo.update(plan.plan_id, {
      task_nodes: plan.task_nodes,
      completed_at: new Date().toISOString(),
    });

    return artifacts;
  }

  private async generateTieredVariants(primary: ArtifactOutput, plan: PlanGraph): Promise<ArtifactOutput[]> {
    const variants: ArtifactOutput[] = [];
    const tiers: Array<{ tier: 'approaching' | 'advanced'; instruction: string }> = [
      {
        tier: 'approaching',
        instruction: 'Adapt the following content for APPROACHING-level students. Simplify vocabulary, add more scaffolding (word banks, sentence frames, graphic organizers), reduce complexity while maintaining the same core learning objectives. Keep Markdown format.',
      },
      {
        tier: 'advanced',
        instruction: 'Adapt the following content for ADVANCED-level students. Add higher-order thinking questions, extension activities, deeper analysis opportunities, and more rigorous expectations while maintaining the same core learning objectives. Keep Markdown format.',
      },
    ];

    for (const { tier, instruction } of tiers) {
      const response = await this.aiProvider.generate({
        prompt: `${instruction}\n\n--- ORIGINAL CONTENT ---\n${primary.content}\n--- END ORIGINAL CONTENT ---`,
        systemPrompt: 'You are a differentiation specialist for US public schools (Grades 6-12). Adapt content for specific student tiers while preserving learning objectives.',
      });

      const artifact: ArtifactOutput = {
        artifact_id: uuidv4(),
        request_id: primary.request_id,
        plan_id: plan.plan_id,
        medium_type: 'markdown',
        language: 'en',
        tier,
        version: 1,
        content: response.content,
        metadata: { task_type: 'tiering', tier, model: response.model },
        created_at: new Date().toISOString(),
      };

      this.artifactRepo.create(artifact);
      variants.push(artifact);
    }

    return variants;
  }

  private async generateTranslation(primary: ArtifactOutput, plan: PlanGraph, targetLang: string): Promise<ArtifactOutput | null> {
    const langNames: Record<string, string> = { es: 'Spanish', fr: 'French', zh: 'Chinese', vi: 'Vietnamese', ar: 'Arabic' };
    const langName = langNames[targetLang] || targetLang;

    const response = await this.aiProvider.generate({
      prompt: `Translate the following educational content from English to ${langName}. Maintain the original Markdown formatting, pedagogical structure, and grade-appropriate vocabulary.\n\n${primary.content}`,
      systemPrompt: 'You are a professional educational translator. Translate content preserving pedagogical intent, formatting, and grade-appropriate language.',
    });

    const artifact: ArtifactOutput = {
      artifact_id: uuidv4(),
      request_id: primary.request_id,
      plan_id: plan.plan_id,
      medium_type: 'markdown',
      language: targetLang as any,
      version: 1,
      content: response.content,
      metadata: { task_type: 'translation', target_language: targetLang, model: response.model },
      created_at: new Date().toISOString(),
    };

    this.artifactRepo.create(artifact);
    return artifact;
  }

  private updateNodeStatus(plan: PlanGraph, nodeId: string, status: TaskNode['status']): void {
    const node = plan.task_nodes.find((n) => n.node_id === nodeId);
    if (node) {
      node.status = status;
      if (status === 'running') {
        node.started_at = new Date().toISOString();
      }
      if (status === 'completed' || status === 'failed') {
        node.completed_at = new Date().toISOString();
      }
      this.planGraphRepo.update(plan.plan_id, { task_nodes: plan.task_nodes });
    }
  }
}
