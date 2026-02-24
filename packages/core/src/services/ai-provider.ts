export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  variables?: Record<string, string>;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
}
