export type { PromptTemplate } from './template.js';
export { renderTemplate } from './template.js';
export { registerTemplate, getTemplate, listTemplates, clearRegistry } from './registry.js';

// Built-in templates
export { lessonPlanTemplate } from './templates/lesson-plan.js';
export { differentiationTemplate } from './templates/differentiation.js';
export { translationTemplate } from './templates/translation.js';
