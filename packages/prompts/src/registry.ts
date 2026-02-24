import type { PromptTemplate } from './template.js';

const templates: Map<string, PromptTemplate> = new Map();

export function registerTemplate(template: PromptTemplate): void {
  templates.set(template.id, template);
}

export function getTemplate(id: string): PromptTemplate | undefined {
  return templates.get(id);
}

export function listTemplates(): PromptTemplate[] {
  return [...templates.values()];
}

export function clearRegistry(): void {
  templates.clear();
}
