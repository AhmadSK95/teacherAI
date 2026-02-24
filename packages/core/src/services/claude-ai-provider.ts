import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIRequest, AIResponse } from './ai-provider.js';

export class ClaudeAIProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model || 'claude-sonnet-4-6';
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: request.systemPrompt || 'You are a helpful teaching assistant for US public school teachers.',
      messages: [{ role: 'user', content: request.prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const content = textBlock ? textBlock.text : '';

    return {
      content,
      model: response.model,
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
      },
    };
  }
}
