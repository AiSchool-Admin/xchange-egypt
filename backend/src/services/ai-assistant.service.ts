import prisma from '../lib/prisma';
import { geminiService } from './gemini.service';

// ============================================
// AI Assistant Service
// نظام المساعد الذكي - مع تكامل Gemini AI
// ============================================

interface AIResponse {
  message: string;
  suggestedItems?: string[];
  suggestedAction?: string;
  confidence?: number;
}

// Predefined responses for common queries (simulated AI)
const AI_RESPONSES: Record<string, AIResponse> = {
  greeting: {
    message: 'مرحباً! 👋 أنا مساعدك الذكي في XChange. كيف يمكنني مساعدتك اليوم؟\n\nيمكنني مساعدتك في:\n• البحث عن منتجات للمقايضة\n• اقتراح أفضل العروض\n• الإجابة على أسئلتك\n• إنشاء إعلانات جديدة',
    confidence: 1.0,
  },
  search: {
    message: 'سأساعدك في البحث! ما الذي تبحث عنه؟ يمكنك وصف المنتج أو الفئة التي تهمك.',
    suggestedAction: 'search',
    confidence: 0.95,
  },
  barter: {
    message: 'المقايضة طريقة رائعة للحصول على ما تريد! أخبرني:\n1. ماذا تريد أن تحصل عليه؟\n2. ماذا تملك للمقايضة؟',
    suggestedAction: 'create_offer',
    confidence: 0.9,
  },
  help: {
    message: 'بالتأكيد سأساعدك! إليك بعض الأشياء التي يمكنني فعلها:\n\n🔍 **البحث**: اكتب "أبحث عن [اسم المنتج]"\n💱 **المقايضة**: اكتب "أريد مقايضة"\n📝 **إنشاء إعلان**: اكتب "إنشاء إعلان"\n💰 **تقييم سعر**: اكتب "كم سعر [المنتج]"\n❓ **مساعدة**: اكتب "مساعدة"',
    confidence: 1.0,
  },
};

// Keyword detection for routing
const KEYWORD_PATTERNS = {
  greeting: ['مرحبا', 'السلام', 'هاي', 'صباح', 'مساء', 'اهلا', 'hi', 'hello'],
  search: ['أبحث', 'ابحث', 'بحث', 'أريد', 'اريد', 'محتاج', 'عايز', 'search', 'find'],
  barter: ['مقايضة', 'تبادل', 'بادل', 'swap', 'exchange', 'trade'],
  price: ['سعر', 'كم', 'تكلفة', 'قيمة', 'price', 'cost', 'value'],
  help: ['مساعدة', 'ساعد', 'كيف', 'help', 'how'],
  create: ['إنشاء', 'انشاء', 'أضف', 'اضف', 'جديد', 'create', 'add', 'new'],
};

export class AIAssistantService {
  /**
   * Create a new conversation
   */
  async createConversation(userId: string, context?: string, relatedItemId?: string) {
    const conversation = await prisma.aIConversation.create({
      data: {
        userId,
        context,
        relatedItemId,
        title: 'محادثة جديدة',
      },
    });

    // Add welcome message
    await this.addMessage(conversation.id, 'ASSISTANT', AI_RESPONSES.greeting.message, {
      confidence: 1.0,
    });

    return conversation;
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.aIConversation.findMany({
        where: { userId, status: { not: 'ARCHIVED' } },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIConversation.count({
        where: { userId, status: { not: 'ARCHIVED' } },
      }),
    ]);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get conversation with messages
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('المحادثة غير موجودة');
    }

    return conversation;
  }

  /**
   * Send message and get AI response
   */
  async sendMessage(conversationId: string, userId: string, content: string) {
    // Verify conversation belongs to user
    const conversation = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('المحادثة غير موجودة');
    }

    // Add user message
    const userMessage = await this.addMessage(conversationId, 'USER', content);

    // Generate AI response
    const aiResponse = await this.generateResponse(content, userId, conversation.context);

    // Add AI message
    const assistantMessage = await this.addMessage(
      conversationId,
      'ASSISTANT',
      aiResponse.message,
      {
        suggestedItems: aiResponse.suggestedItems,
        suggestedAction: aiResponse.suggestedAction,
        confidence: aiResponse.confidence,
      }
    );

    // Update conversation
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 2 },
        lastMessageAt: new Date(),
        title: this.generateTitle(content),
      },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  /**
   * Generate AI response based on user input
   */
  private async generateResponse(
    content: string,
    userId: string,
    context?: string | null
  ): Promise<AIResponse> {
    const lowerContent = content.toLowerCase();

    // Check for SIMPLE intents only (exact matches for basic interactions)
    // These are quick responses that don't need AI
    const simplePatterns = {
      greeting: ['مرحبا', 'السلام عليكم', 'هاي', 'صباح الخير', 'مساء الخير', 'اهلا', 'hi', 'hello'],
      barter: ['مقايضة', 'تبادل', 'بادل'],
      create: ['إنشاء إعلان', 'انشاء اعلان', 'أضف إعلان', 'اضف اعلان', 'إعلان جديد'],
    };

    // Check for simple greetings (exact or near-exact match)
    if (simplePatterns.greeting.some(p => lowerContent === p || lowerContent.startsWith(p + ' '))) {
      return AI_RESPONSES.greeting;
    }

    // Check for explicit barter request
    if (simplePatterns.barter.some(p => lowerContent.includes(p)) && content.length < 30) {
      return AI_RESPONSES.barter;
    }

    // Check for explicit create intent
    if (simplePatterns.create.some(p => lowerContent.includes(p))) {
      return {
        message: 'رائع! لإنشاء إعلان جديد، يمكنك:\n\n📸 **الطريقة السريعة**: استخدم ميزة "بيع بالـ AI" - فقط صور المنتج وسأملأ باقي البيانات!\n\n✍️ **الطريقة التقليدية**: اذهب إلى "إضافة إعلان" واملأ البيانات يدوياً\n\nأيهما تفضل؟',
        suggestedAction: 'create_listing',
        confidence: 0.9,
      };
    }

    // Check for product search (starts with search keywords)
    const searchStarters = ['أبحث عن', 'ابحث عن', 'أريد شراء', 'اريد شراء', 'محتاج', 'عايز'];
    if (searchStarters.some(p => lowerContent.startsWith(p))) {
      return await this.handleSearchIntent(content, userId);
    }

    // For ALL other queries (including complex questions), try Gemini first
    return await this.handleGeneralQuery(content, userId);
  }

  /**
   * Handle search intent
   */
  private async handleSearchIntent(content: string, userId: string): Promise<AIResponse> {
    // Extract search terms (remove common words)
    const stopWords = ['أبحث', 'عن', 'أريد', 'محتاج', 'عايز', 'في', 'من', 'على'];
    const words = content.split(/\s+/).filter(w => !stopWords.includes(w));
    const searchQuery = words.join(' ');

    if (searchQuery.length < 2) {
      return AI_RESPONSES.search;
    }

    // Search for items
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
        sellerId: { not: userId },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        estimatedValue: true,
        images: true,
      },
    });

    if (items.length === 0) {
      return {
        message: `لم أجد نتائج لـ "${searchQuery}" حالياً. 😔\n\nلكن يمكنك:\n• حفظ البحث وتفعيل التنبيهات لإشعارك عند توفر منتجات مطابقة\n• تجربة كلمات بحث مختلفة\n• نشر طلب في "أنا أبحث عن"`,
        suggestedAction: 'save_search',
        confidence: 0.8,
      };
    }

    const itemsList = items.map((item, i) =>
      `${i + 1}. ${item.title} - ${item.estimatedValue?.toLocaleString('ar-EG')} ج.م`
    ).join('\n');

    return {
      message: `وجدت ${items.length} نتائج لـ "${searchQuery}"! 🎉\n\n${itemsList}\n\nهل تريد رؤية تفاصيل أحد هذه المنتجات؟`,
      suggestedItems: items.map(i => i.id),
      suggestedAction: 'view_items',
      confidence: 0.95,
    };
  }

  /**
   * Handle price inquiry
   */
  private async handlePriceIntent(content: string): Promise<AIResponse> {
    // Extract product name
    const stopWords = ['سعر', 'كم', 'تكلفة', 'قيمة', 'ال', 'هو', 'هي'];
    const words = content.split(/\s+/).filter(w => !stopWords.includes(w));
    const productName = words.join(' ');

    if (productName.length < 2) {
      return {
        message: 'ما المنتج الذي تريد معرفة سعره؟ أخبرني اسم المنتج وسأبحث لك عن متوسط الأسعار.',
        confidence: 0.7,
      };
    }

    // Get average price from similar items
    const items = await prisma.item.findMany({
      where: {
        title: { contains: productName, mode: 'insensitive' },
        estimatedValue: { gt: 0 },
      },
      select: { estimatedValue: true },
      take: 20,
    });

    if (items.length < 3) {
      return {
        message: `لا توجد بيانات كافية لتقدير سعر "${productName}" حالياً. 📊\n\nنصيحة: يمكنك إضافة منتجك على المنصة بالسعر الذي تراه مناسباً، وسيساعدك السوق في تحديد القيمة العادلة من خلال العروض والمزايدات.`,
        confidence: 0.6,
      };
    }

    const prices = items.map(i => i.estimatedValue!).sort((a, b) => a - b);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      message: `💰 تقدير سعر "${productName}":\n\n• الحد الأدنى: ${minPrice.toLocaleString('ar-EG')} ج.م\n• المتوسط: ${Math.round(avgPrice).toLocaleString('ar-EG')} ج.م\n• الحد الأقصى: ${maxPrice.toLocaleString('ar-EG')} ج.م\n\n📈 بناءً على ${items.length} منتج مشابه على المنصة`,
      confidence: 0.85,
    };
  }

  /**
   * Handle general queries - uses Gemini AI when available
   */
  private async handleGeneralQuery(content: string, userId: string): Promise<AIResponse> {
    console.log('[AI Assistant] handleGeneralQuery called with:', content.substring(0, 50));

    // Get user stats for context
    const [itemsCount, offersCount, user] = await Promise.all([
      prisma.item.count({ where: { sellerId: userId } }),
      prisma.barterOffer.count({ where: { OR: [{ initiatorId: userId }, { recipientId: userId }] } }),
      prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } }),
    ]);

    // Try Gemini AI first (if available and configured)
    const geminiAvailable = geminiService.isAvailable();
    console.log('[AI Assistant] Gemini available:', geminiAvailable);

    if (geminiAvailable) {
      try {
        console.log('[AI Assistant] Calling Gemini...');

        // Try to get recent conversation history (may fail if table doesn't exist)
        let conversationHistory: Array<{ role: string; content: string }> = [];
        try {
          const recentMessages = await prisma.aIMessage.findMany({
            where: {
              conversation: { userId },
            },
            orderBy: { createdAt: 'desc' },
            take: 4,
            select: { role: true, content: true },
          });
          conversationHistory = recentMessages.reverse().map(m => ({
            role: m.role,
            content: m.content,
          }));
        } catch (msgError) {
          console.log('[AI Assistant] Could not fetch message history, proceeding without it');
        }

        const geminiResponse = await geminiService.generateResponse(content, {
          userName: user?.fullName,
          userItemsCount: itemsCount,
          conversationHistory,
        });

        console.log('[AI Assistant] Gemini response:', geminiResponse ? 'success' : 'null');

        if (geminiResponse) {
          console.log('[AI Assistant] Using Gemini response');
          return {
            message: geminiResponse,
            confidence: 0.9,
          };
        } else {
          console.log('[AI Assistant] Gemini returned null, using fallback');
        }
      } catch (error) {
        console.error('[AI Assistant] Gemini error, falling back to rule-based:', error);
      }
    }

    // Fallback to rule-based response
    console.log('[AI Assistant] Using fallback response');
    return {
      message: `أنا هنا للمساعدة! 🤖\n\n📊 **إحصائياتك**:\n• منتجاتك: ${itemsCount}\n• عروض المقايضة: ${offersCount}\n\nماذا تريد أن تفعل؟\n• اكتب "بحث" للبحث عن منتجات\n• اكتب "مقايضة" لإنشاء عرض\n• اكتب "مساعدة" لمزيد من الخيارات`,
      confidence: 0.7,
    };
  }

  /**
   * Add message to conversation
   */
  private async addMessage(
    conversationId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
    extras?: {
      suggestedItems?: string[];
      suggestedAction?: string;
      confidence?: number;
    }
  ) {
    return prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        suggestedItems: extras?.suggestedItems || [],
        suggestedAction: extras?.suggestedAction,
        confidence: extras?.confidence,
      },
    });
  }

  /**
   * Generate conversation title from first message
   */
  private generateTitle(content: string): string {
    const maxLength = 50;
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string, userId: string) {
    return prisma.aIConversation.updateMany({
      where: { id: conversationId, userId },
      data: { status: 'CLOSED' },
    });
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string, userId: string) {
    return prisma.aIConversation.updateMany({
      where: { id: conversationId, userId },
      data: { status: 'ARCHIVED' },
    });
  }

  /**
   * Get quick suggestions
   */
  async getQuickSuggestions(userId: string) {
    // Get user's recent searches and items
    const [recentItems, popularCategories] = await Promise.all([
      prisma.item.findMany({
        where: { sellerId: userId },
        select: { title: true, category: { select: { nameAr: true } } },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.item.groupBy({
        by: ['categoryId'],
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      suggestions: [
        'ما هي أفضل العروض اليوم؟',
        'أريد مقايضة هاتفي',
        'كيف أزيد فرص قبول عروضي؟',
        'ما المنتجات الأكثر طلباً؟',
      ],
      recentItems: recentItems.map(i => i.title),
    };
  }
}

export const aiAssistantService = new AIAssistantService();
