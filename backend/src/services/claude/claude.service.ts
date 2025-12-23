/**
 * Claude API Service
 * خدمة التكامل مع Claude AI من Anthropic
 */

import Anthropic from '@anthropic-ai/sdk';
import logger from '../../lib/logger';
import {
  AIModelType,
  ClaudeChatParams,
  ClaudeChatResponse,
  ClaudeToolCall,
  ClaudeToolResult,
  MODEL_MAP,
  CLAUDE_DEFAULTS,
} from './claude.types';

class ClaudeService {
  private client: Anthropic | null = null;
  private isConfigured: boolean = false;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  // Rate limits (conservative defaults)
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_MINUTE = 50;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Claude client
   */
  private initialize(): void {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      logger.warn('[Claude] API key not configured - service unavailable');
      this.isConfigured = false;
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey,
      });
      this.isConfigured = true;
      logger.info('[Claude] Service initialized successfully');
    } catch (error: any) {
      logger.error('[Claude] Failed to initialize:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    if (!this.isConfigured || !this.client) {
      return false;
    }
    return this.checkRateLimit();
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    if (now - this.lastResetTime > this.RATE_LIMIT_WINDOW_MS) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    return this.requestCount < this.MAX_REQUESTS_PER_MINUTE;
  }

  /**
   * Get the model string for API calls
   */
  getModelString(model: AIModelType): string {
    return MODEL_MAP[model] || MODEL_MAP.SONNET;
  }

  /**
   * Main chat method - send messages to Claude
   */
  async chat(params: ClaudeChatParams): Promise<ClaudeChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available');
    }

    if (!this.client) {
      throw new Error('Claude client not initialized');
    }

    this.requestCount++;

    const modelString = this.getModelString(params.model);

    try {
      logger.info(`[Claude] Sending request to ${params.model} (${modelString})`);

      const response = await this.client.messages.create({
        model: modelString,
        max_tokens: params.maxTokens || CLAUDE_DEFAULTS.maxTokens,
        system: params.system,
        messages: params.messages,
        tools: params.tools as any,
      });

      // Extract text content
      let textContent = '';
      const toolCalls: ClaudeToolCall[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          textContent += block.text;
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: block.input as Record<string, any>,
          });
        }
      }

      logger.info(`[Claude] Response received: ${textContent.length} chars, ${toolCalls.length} tool calls`);

      return {
        content: textContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        toolCalls,
        stopReason: response.stop_reason || 'end_turn',
      };
    } catch (error: any) {
      logger.error('[Claude] API error:', error.message);

      // Handle rate limiting
      if (error.status === 429) {
        this.requestCount = this.MAX_REQUESTS_PER_MINUTE;
        throw new Error('Claude rate limit exceeded. Please try again later.');
      }

      throw error;
    }
  }

  /**
   * Continue conversation after tool use
   */
  async continueWithToolResults(
    params: ClaudeChatParams,
    assistantContent: any[],
    toolResults: ClaudeToolResult[]
  ): Promise<ClaudeChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('Claude service is not available');
    }

    if (!this.client) {
      throw new Error('Claude client not initialized');
    }

    this.requestCount++;

    const modelString = this.getModelString(params.model);

    try {
      const response = await this.client.messages.create({
        model: modelString,
        max_tokens: params.maxTokens || CLAUDE_DEFAULTS.maxTokens,
        system: params.system,
        messages: [
          ...params.messages,
          { role: 'assistant', content: assistantContent },
          { role: 'user', content: toolResults as any },
        ],
        tools: params.tools as any,
      });

      let textContent = '';
      const toolCalls: ClaudeToolCall[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          textContent += block.text;
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: block.input as Record<string, any>,
          });
        }
      }

      return {
        content: textContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        toolCalls,
        stopReason: response.stop_reason || 'end_turn',
      };
    } catch (error: any) {
      logger.error('[Claude] Tool continuation error:', error.message);
      throw error;
    }
  }

  /**
   * Simple text generation without conversation context
   */
  async generateText(params: {
    model: AIModelType;
    prompt: string;
    system?: string;
    maxTokens?: number;
  }): Promise<string> {
    const response = await this.chat({
      model: params.model,
      system: params.system,
      messages: [{ role: 'user', content: params.prompt }],
      maxTokens: params.maxTokens,
    });

    return response.content;
  }

  /**
   * Generate JSON response
   */
  async generateJSON<T>(params: {
    model: AIModelType;
    prompt: string;
    system?: string;
    maxTokens?: number;
  }): Promise<T> {
    const systemPrompt = params.system
      ? `${params.system}\n\nIMPORTANT: Respond ONLY with valid JSON, no other text.`
      : 'Respond ONLY with valid JSON, no other text.';

    const response = await this.chat({
      model: params.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: params.prompt }],
      maxTokens: params.maxTokens,
    });

    try {
      // Try to extract JSON from the response
      let jsonStr = response.content.trim();

      // Handle markdown code blocks
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(jsonStr) as T;
    } catch (error) {
      logger.error('[Claude] JSON parse error:', error);
      throw new Error('Failed to parse Claude response as JSON');
    }
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      isConfigured: this.isConfigured,
      isAvailable: this.isAvailable(),
      requestsThisMinute: this.requestCount,
      maxRequestsPerMinute: this.MAX_REQUESTS_PER_MINUTE,
    };
  }
}

// Singleton instance
export const claudeService = new ClaudeService();
