import { registerTemplate } from '@teachassist/prompts';
import { lessonPlanTemplate, differentiationTemplate, translationTemplate } from '@teachassist/prompts';

export function initTemplates(): void {
  registerTemplate(lessonPlanTemplate);
  registerTemplate(differentiationTemplate);
  registerTemplate(translationTemplate);
}
