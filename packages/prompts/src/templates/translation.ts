import type { PromptTemplate } from '../template.js';

export const translationTemplate: PromptTemplate = {
  id: 'translation',
  name: 'Multilingual Translator',
  description: 'Translates teaching materials while preserving pedagogical intent',
  systemPrompt:
    'You are a professional educational translator. Translate content preserving pedagogical intent, grade-appropriate language, and formatting.',
  userPromptTemplate: `Translate the following educational content from {{source_language}} to {{target_language}}:

{{content}}

Maintain the original formatting, pedagogical structure, and grade-appropriate vocabulary.`,
  variables: ['source_language', 'target_language', 'content'],
};
