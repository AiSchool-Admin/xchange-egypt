/**
 * Google Gemini AI Service
 * Free tier: 15 requests/minute, 1M tokens/day
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt for XChange assistant
const SYSTEM_PROMPT = `أنت المساعد الذكي لمنصة XChange Egypt - منصة للتجارة والمقايضة في مصر.

دورك:
- مساعدة المستخدمين في البحث عن منتجات
- تقديم نصائح للمقايضة والتسعير
- الإجابة على أسئلة حول كيفية استخدام المنصة
- اقتراح منتجات مناسبة بناءً على احتياجات المستخدم

قواعد مهمة:
1. تحدث بالعربية الفصحى أو المصرية حسب أسلوب المستخدم
2. كن ودوداً ومختصراً (لا تزيد عن 3-4 جمل)
3. لا تذكر أبداً منافسين مثل OLX أو Facebook Marketplace أو Dubizzle
4. شجع المستخدم على استخدام ميزات المنصة
5. إذا سألك عن سعر منتج، أجب بأنك ستبحث في قاعدة بيانات المنصة
6. لا تختلق معلومات - إذا لم تعرف، قل ذلك

ميزات المنصة:
- البيع المباشر
- المزادات
- المقايضة (Barter)
- المناقصات العكسية (طلب منتجات)
- المساعد الذكي (أنت)`;

class GeminiService {
  private model: any = null;
  private isConfigured: boolean = false;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  // Free tier limits
  private readonly MAX_REQUESTS_PER_MINUTE = 15;
  private readonly MINUTE_MS = 60 * 1000;

  constructor() {
    // Delay initialization to ensure env vars are loaded
    setTimeout(() => this.initialize(), 100);
  }

  /**
   * Initialize or re-initialize the service
   * Can be called manually to retry after env vars are updated
   */
  initialize() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    console.log('[Gemini] Attempting initialization...');
    console.log('[Gemini] API Key present:', !!apiKey);
    console.log('[Gemini] API Key length:', apiKey?.length || 0);

    if (!apiKey) {
      console.log('[Gemini] API key not configured - using fallback mode');
      this.isConfigured = false;
      return false;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash-latest', // Free tier model - correct name
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 500,
        },
      });
      this.isConfigured = true;
      console.log('[Gemini] Service initialized successfully with model: gemini-1.5-flash-latest');
      return true;
    } catch (error: any) {
      console.error('[Gemini] Failed to initialize:', error.message);
      this.isConfigured = false;
      return false;
    }
  }

  /**
   * Ensure initialized - call this before using the service
   */
  ensureInitialized() {
    if (!this.isConfigured && process.env.GOOGLE_AI_API_KEY) {
      console.log('[Gemini] Re-initializing...');
      this.initialize();
    }
  }

  /**
   * Check if we're within rate limits (free tier)
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    // Reset counter every minute
    if (now - this.lastResetTime > this.MINUTE_MS) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    return this.requestCount < this.MAX_REQUESTS_PER_MINUTE;
  }

  /**
   * Check if Gemini is available and configured
   */
  isAvailable(): boolean {
    // Try to initialize if not configured but API key exists
    this.ensureInitialized();
    return this.isConfigured && this.checkRateLimit();
  }

  /**
   * Generate a response using Gemini
   */
  async generateResponse(
    userMessage: string,
    context?: {
      userName?: string;
      userItemsCount?: number;
      conversationHistory?: Array<{ role: string; content: string }>;
    }
  ): Promise<string | null> {
    if (!this.isAvailable()) {
      console.log('[Gemini] Not available or rate limited');
      return null;
    }

    try {
      this.requestCount++;

      // Build context string
      let contextInfo = '';
      if (context?.userName) {
        contextInfo += `اسم المستخدم: ${context.userName}\n`;
      }
      if (context?.userItemsCount !== undefined) {
        contextInfo += `عدد منتجات المستخدم: ${context.userItemsCount}\n`;
      }

      // Build chat history for context
      const history = context?.conversationHistory?.slice(-4) || []; // Last 4 messages
      const historyText = history
        .map(m => `${m.role === 'USER' ? 'المستخدم' : 'المساعد'}: ${m.content}`)
        .join('\n');

      const prompt = `${SYSTEM_PROMPT}

${contextInfo ? `معلومات المستخدم:\n${contextInfo}` : ''}

${historyText ? `المحادثة السابقة:\n${historyText}\n` : ''}

المستخدم: ${userMessage}

الرد (باختصار):`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Clean up response
      let cleanedText = text
        .replace(/^(المساعد:|الرد:)\s*/i, '') // Remove prefix
        .trim();

      console.log(`[Gemini] Generated response (${cleanedText.length} chars)`);
      return cleanedText;

    } catch (error: any) {
      console.error('[Gemini] Error generating response:', error.message);

      // Handle specific errors
      if (error.message?.includes('RATE_LIMIT')) {
        console.log('[Gemini] Rate limit reached');
        this.requestCount = this.MAX_REQUESTS_PER_MINUTE; // Force fallback
      }

      return null;
    }
  }

  /**
   * Get current usage stats
   */
  getUsageStats() {
    return {
      isConfigured: this.isConfigured,
      requestsThisMinute: this.requestCount,
      maxRequestsPerMinute: this.MAX_REQUESTS_PER_MINUTE,
      isAvailable: this.isAvailable(),
    };
  }
}

// Singleton instance
export const geminiService = new GeminiService();
