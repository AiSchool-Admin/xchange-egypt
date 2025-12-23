/**
 * Claude API Types
 * أنواع البيانات لخدمة Claude AI
 */

export type AIModelType = 'OPUS' | 'SONNET' | 'HAIKU';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeChatParams {
  model: AIModelType;
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  tools?: ClaudeToolDefinition[];
}

export interface ClaudeChatResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  toolCalls: ClaudeToolCall[];
  stopReason: string;
}

export interface ClaudeToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface ClaudeToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface ClaudeToolResult {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

// Model mapping
export const MODEL_MAP: Record<AIModelType, string> = {
  OPUS: 'claude-opus-4-20250514',
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-haiku-4-20250514',
};

// Default configuration
export const CLAUDE_DEFAULTS = {
  maxTokens: 4096,
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000,
};
