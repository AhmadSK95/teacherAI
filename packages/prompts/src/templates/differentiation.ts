import type { PromptTemplate } from '../template.js';

export const differentiationTemplate: PromptTemplate = {
  id: 'differentiation',
  name: 'Differentiation Adapter',
  description: 'Adapts content for approaching, on-level, and advanced tiers',
  systemPrompt:
    'You are a differentiation specialist. Adapt the provided content for three tiers while maintaining the same learning objectives.',
  userPromptTemplate: `Adapt the following content for the {{tier}} tier:
Original Content:
{{content}}

Grade Level: {{grade}}
Subject: {{subject}}

Provide appropriately scaffolded/extended content for the {{tier}} level.`,
  variables: ['tier', 'content', 'grade', 'subject'],
};
