import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerTemplate,
  getTemplate,
  listTemplates,
  clearRegistry,
  renderTemplate,
  lessonPlanTemplate,
  differentiationTemplate,
  translationTemplate,
} from '../index.js';

beforeEach(() => {
  clearRegistry();
});

describe('Template Registry', () => {
  it('registers and retrieves a template', () => {
    registerTemplate(lessonPlanTemplate);
    const found = getTemplate('lesson-plan');
    expect(found).toBeDefined();
    expect(found!.name).toBe('Lesson Plan Generator');
  });

  it('returns undefined for unregistered template', () => {
    expect(getTemplate('nonexistent')).toBeUndefined();
  });

  it('lists all registered templates', () => {
    registerTemplate(lessonPlanTemplate);
    registerTemplate(differentiationTemplate);
    registerTemplate(translationTemplate);
    expect(listTemplates()).toHaveLength(3);
  });

  it('clears registry', () => {
    registerTemplate(lessonPlanTemplate);
    clearRegistry();
    expect(listTemplates()).toHaveLength(0);
  });
});

describe('renderTemplate', () => {
  it('replaces variables in template', () => {
    const result = renderTemplate(lessonPlanTemplate, {
      subject: 'Math',
      grade: '8',
      topic: 'Fractions',
      period_length: '45',
      considerations: 'ELL students present',
    });
    expect(result).toContain('Subject: Math');
    expect(result).toContain('Grade: 8');
    expect(result).toContain('Topic: Fractions');
    expect(result).toContain('Period Length: 45 minutes');
  });

  it('replaces multiple occurrences of same variable', () => {
    const result = renderTemplate(differentiationTemplate, {
      tier: 'approaching',
      content: 'Original lesson',
      grade: '7',
      subject: 'Science',
    });
    expect(result.match(/approaching/g)!.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Built-in templates', () => {
  it('lesson-plan has correct variables', () => {
    expect(lessonPlanTemplate.variables).toContain('subject');
    expect(lessonPlanTemplate.variables).toContain('grade');
    expect(lessonPlanTemplate.variables).toContain('topic');
  });

  it('differentiation has tier variable', () => {
    expect(differentiationTemplate.variables).toContain('tier');
  });

  it('translation has language variables', () => {
    expect(translationTemplate.variables).toContain('source_language');
    expect(translationTemplate.variables).toContain('target_language');
  });
});
