/**
 * Board Engine Service
 * المحرك الرئيسي لمجلس إدارة AI
 */

import prisma from '../../config/database';
import { claudeService } from '../claude/claude.service';
import { AIModelType } from '../claude/claude.types';
import { getPromptByRole, BoardRoleType, CEOModeType, BOARD_MEMBERS_INFO } from './prompts';
import logger from '../../lib/logger';
import {
  BoardRole,
  BoardMemberType,
  BoardMemberStatus,
  AIModel,
  CEOMode,
  BoardConversationType,
  BoardConversationStatus,
  BoardMessageRole,
} from './board.types';

// Types for board engine
export interface StartConversationParams {
  founderId: string;
  topic: string;
  topicAr?: string;
  type?: BoardConversationType;
  features?: string[];
}

export interface SendMessageParams {
  conversationId: string;
  founderId: string;
  content: string;
  targetMemberIds?: string[];
  ceoMode?: CEOMode;
  features?: string[];
  enableBrainstorm?: boolean; // تفعيل وضع العصف الذهني
  brainstormRounds?: number; // عدد جولات النقاش (1-3)
}

export interface BoardMemberResponse {
  memberId: string;
  memberName: string;
  memberNameAr: string;
  memberRole: BoardRole;
  content: string;
  model: AIModel;
  tokensUsed: number;
  toolsUsed: string[];
  ceoMode?: CEOMode;
  round?: number; // جولة النقاش
}

export interface BrainstormResult {
  userMessage: any;
  rounds: {
    round: number;
    responses: BoardMemberResponse[];
  }[];
  totalResponses: number;
}

// نتيجة النقاش المنهجي
export interface StructuredDiscussionResult {
  userMessage: any;
  discussion: {
    sequence: number;
    response: BoardMemberResponse;
    respondingTo?: string; // من يرد على من
    type: 'initial' | 'response' | 'question' | 'summary';
  }[];
  ceoSummary?: {
    alternatives: string[];
    recommendation: string;
    risks: string[];
  };
  status: 'in_progress' | 'awaiting_decision' | 'decided';
}

// تحديد من يجب أن يرد بناءً على المحتوى
interface NextResponder {
  memberId: string;
  memberRole: BoardRole;
  reason: string;
  respondingTo?: string;
}

class BoardEngineService {
  // ترتيب الأدوار حسب أولوية الموضوع
  private roleRelevanceOrder: Record<string, BoardRole[]> = {
    'technical': [BoardRole.CTO, BoardRole.CEO, BoardRole.COO, BoardRole.CFO, BoardRole.CLO, BoardRole.CMO],
    'financial': [BoardRole.CFO, BoardRole.CEO, BoardRole.COO, BoardRole.CLO, BoardRole.CTO, BoardRole.CMO],
    'marketing': [BoardRole.CMO, BoardRole.CEO, BoardRole.CFO, BoardRole.COO, BoardRole.CTO, BoardRole.CLO],
    'operations': [BoardRole.COO, BoardRole.CEO, BoardRole.CTO, BoardRole.CFO, BoardRole.CMO, BoardRole.CLO],
    'legal': [BoardRole.CLO, BoardRole.CEO, BoardRole.CFO, BoardRole.COO, BoardRole.CTO, BoardRole.CMO],
    'strategic': [BoardRole.CEO, BoardRole.CFO, BoardRole.CTO, BoardRole.CMO, BoardRole.COO, BoardRole.CLO],
    'general': [BoardRole.CEO, BoardRole.CTO, BoardRole.CFO, BoardRole.CMO, BoardRole.COO, BoardRole.CLO],
  };

  // الكلمات المفتاحية لكل موضوع
  private topicKeywords: Record<string, string[]> = {
    'technical': ['تقني', 'كود', 'تطوير', 'برمج', 'api', 'bug', 'feature', 'تطبيق', 'موقع', 'سيرفر', 'قاعدة بيانات', 'أمان', 'سرعة', 'أداء', 'تحديث', 'ميزة جديدة'],
    'financial': ['مالي', 'ميزانية', 'تكلفة', 'إيراد', 'استثمار', 'roi', 'cac', 'ltv', 'تمويل', 'أرباح', 'خسائر', 'نقد', 'cash', 'runway', 'مصروفات', 'دخل'],
    'marketing': ['تسويق', 'إعلان', 'عملاء', 'حملة', 'brand', 'growth', 'اكتساب', 'احتفاظ', 'وعي', 'سوشيال', 'ميديا', 'فيسبوك', 'انستجرام', 'تيكتوك', 'جمهور'],
    'operations': ['عمليات', 'توصيل', 'شحن', 'لوجستي', 'خدمة عملاء', 'دعم', 'شكاوى', 'جودة', 'عمليات يومية', 'فريق', 'توظيف', 'إدارة'],
    'legal': ['قانون', 'ترخيص', 'تنظيم', 'عقد', 'امتثال', 'خصوصية', 'شروط', 'سياسة', 'حماية', 'بيانات', 'gdpr', 'ضريبة', 'تصريح'],
    'strategic': ['استراتيج', 'قرار', 'رؤية', 'مستقبل', 'خطة', 'توسع', 'نمو', 'منافس', 'سوق', 'فرص', 'تحديات', 'أهداف', 'مهمة'],
  };

  /**
   * تصنيف موضوع الرسالة
   */
  private classifyMessageTopic(content: string): string {
    const contentLower = content.toLowerCase();
    let maxScore = 0;
    let topTopic = 'general';

    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          score++;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        topTopic = topic;
      }
    }

    return topTopic;
  }

  /**
   * تحديد من يجب أن يرد بناءً على السياق الحالي
   */
  private async determineNextResponder(params: {
    content: string;
    previousResponses: BoardMemberResponse[];
    allMembers: any[];
    topic: string;
  }): Promise<NextResponder | null> {
    const { content, previousResponses, allMembers, topic } = params;
    const respondedRoles = new Set(previousResponses.map(r => r.memberRole));

    // الحصول على ترتيب الأدوار حسب الموضوع
    const relevanceOrder = this.roleRelevanceOrder[topic] || this.roleRelevanceOrder['general'];

    // البحث عن أول عضو لم يرد بعد حسب الترتيب
    for (const role of relevanceOrder) {
      if (!respondedRoles.has(role)) {
        const member = allMembers.find(m => m.role === role);
        if (member) {
          // تحديد على من يرد هذا العضو
          let respondingTo: string | undefined;
          if (previousResponses.length > 0) {
            // يرد على آخر رد ذي صلة بتخصصه
            const lastResponse = previousResponses[previousResponses.length - 1];
            respondingTo = lastResponse.memberNameAr;
          }

          return {
            memberId: member.id,
            memberRole: role,
            reason: this.getResponderReason(role, topic),
            respondingTo,
          };
        }
      }
    }

    return null; // كل الأعضاء ردوا
  }

  /**
   * سبب اختيار هذا العضو للرد
   */
  private getResponderReason(role: BoardRole, topic: string): string {
    const reasons: Record<string, Record<BoardRole, string>> = {
      'technical': {
        [BoardRole.CTO]: 'الخبير التقني الأساسي',
        [BoardRole.CEO]: 'القرار الاستراتيجي',
        [BoardRole.CFO]: 'تقييم التكلفة التقنية',
        [BoardRole.CMO]: 'تأثير على تجربة المستخدم',
        [BoardRole.COO]: 'التنفيذ والعمليات',
        [BoardRole.CLO]: 'الامتثال والخصوصية',
      },
      'financial': {
        [BoardRole.CFO]: 'الخبير المالي الأساسي',
        [BoardRole.CEO]: 'القرار الاستراتيجي',
        [BoardRole.CTO]: 'التكلفة التقنية',
        [BoardRole.CMO]: 'ميزانية التسويق',
        [BoardRole.COO]: 'تكاليف العمليات',
        [BoardRole.CLO]: 'المخاطر القانونية المالية',
      },
      'marketing': {
        [BoardRole.CMO]: 'خبير التسويق الأساسي',
        [BoardRole.CEO]: 'الاستراتيجية الشاملة',
        [BoardRole.CFO]: 'ميزانية التسويق',
        [BoardRole.CTO]: 'الأدوات التقنية للتسويق',
        [BoardRole.COO]: 'تنفيذ الحملات',
        [BoardRole.CLO]: 'الامتثال الإعلاني',
      },
      'operations': {
        [BoardRole.COO]: 'خبير العمليات الأساسي',
        [BoardRole.CEO]: 'القرار الاستراتيجي',
        [BoardRole.CTO]: 'الأتمتة والتقنية',
        [BoardRole.CFO]: 'تكاليف العمليات',
        [BoardRole.CMO]: 'تجربة العملاء',
        [BoardRole.CLO]: 'الامتثال التشغيلي',
      },
      'legal': {
        [BoardRole.CLO]: 'المستشار القانوني الأساسي',
        [BoardRole.CEO]: 'القرار النهائي',
        [BoardRole.CFO]: 'التأثير المالي القانوني',
        [BoardRole.CTO]: 'الامتثال التقني',
        [BoardRole.CMO]: 'الامتثال التسويقي',
        [BoardRole.COO]: 'تنفيذ الامتثال',
      },
      'strategic': {
        [BoardRole.CEO]: 'قائد الاستراتيجية',
        [BoardRole.CFO]: 'التخطيط المالي',
        [BoardRole.CTO]: 'الرؤية التقنية',
        [BoardRole.CMO]: 'استراتيجية السوق',
        [BoardRole.COO]: 'القدرة التنفيذية',
        [BoardRole.CLO]: 'المخاطر القانونية',
      },
      'general': {
        [BoardRole.CEO]: 'القيادة والتوجيه',
        [BoardRole.CTO]: 'المنظور التقني',
        [BoardRole.CFO]: 'المنظور المالي',
        [BoardRole.CMO]: 'منظور السوق',
        [BoardRole.COO]: 'منظور العمليات',
        [BoardRole.CLO]: 'المنظور القانوني',
      },
    };

    return reasons[topic]?.[role] || reasons['general'][role] || 'خبرة متخصصة';
  }
  /**
   * Initialize board members if they don't exist
   */
  async initializeBoardMembers(): Promise<void> {
    const existingMembers = await prisma.boardMember.count();

    if (existingMembers > 0) {
      logger.info('[BoardEngine] Board members already exist');
      return;
    }

    logger.info('[BoardEngine] Initializing board members...');

    for (const memberInfo of BOARD_MEMBERS_INFO) {
      const prompt = getPromptByRole(memberInfo.role as BoardRoleType);

      await prisma.boardMember.create({
        data: {
          name: memberInfo.name,
          nameAr: memberInfo.nameAr,
          role: memberInfo.role as BoardRole,
          type: BoardMemberType.AI,
          model: memberInfo.model as AIModel,
          status: BoardMemberStatus.ACTIVE,
          systemPrompt: prompt,
          personality: {
            description: memberInfo.description,
          },
        },
      });

      logger.info(`[BoardEngine] Created board member: ${memberInfo.nameAr} (${memberInfo.role})`);
    }

    logger.info('[BoardEngine] All board members initialized');
  }

  /**
   * Get all board members
   */
  async getBoardMembers() {
    return prisma.boardMember.findMany({
      where: { status: BoardMemberStatus.ACTIVE },
      orderBy: { role: 'asc' },
    });
  }

  /**
   * Start a new board conversation - بدء محادثة جديدة
   */
  async startConversation(params: StartConversationParams) {
    const conversation = await prisma.boardConversation.create({
      data: {
        topic: params.topic,
        topicAr: params.topicAr,
        type: params.type || BoardConversationType.QUESTION,
        status: BoardConversationStatus.ACTIVE,
        founderId: params.founderId,
        featuresUsed: params.features || [],
      },
      include: {
        founder: {
          select: { id: true, fullName: true, email: true, title: true },
        },
      },
    });

    logger.info(`[BoardEngine] Started conversation: ${conversation.id} - ${params.topic}`);

    return conversation;
  }

  /**
   * Send message to board and get responses - إرسال رسالة والحصول على ردود
   * يدعم وضع العصف الذهني (brainstorming) حيث الأعضاء يتفاعلون مع بعضهم
   */
  async sendMessage(params: SendMessageParams): Promise<{
    userMessage: any;
    responses: BoardMemberResponse[];
    brainstormRounds?: BrainstormResult['rounds'];
  }> {
    // 1. Save founder message
    const userMessage = await prisma.boardMessage.create({
      data: {
        conversationId: params.conversationId,
        founderId: params.founderId,
        role: BoardMessageRole.USER,
        content: params.content,
      },
    });

    // 2. Get conversation for context
    const conversation = await prisma.boardConversation.findUnique({
      where: { id: params.conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Last 20 messages for context
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // 3. Update features if provided
    const allFeatures = [...conversation.featuresUsed, ...(params.features || [])];
    if (params.enableBrainstorm && !allFeatures.includes('brainstorm')) {
      allFeatures.push('brainstorm');
    }
    if (allFeatures.length > conversation.featuresUsed.length) {
      await prisma.boardConversation.update({
        where: { id: params.conversationId },
        data: { featuresUsed: [...new Set(allFeatures)] },
      });
    }

    // 4. Determine which members should respond
    const members = await this.determineRespondingMembers(params);

    // 5. Build context from Xchange data
    const context = await this.buildContext(params.conversationId);

    // 6. Get first round responses from each member
    const responses: BoardMemberResponse[] = [];

    for (const member of members) {
      try {
        const response = await this.getMemberResponse({
          member,
          conversation,
          userMessage: params.content,
          context,
          ceoMode: member.role === BoardRole.CEO ? params.ceoMode : undefined,
          features: allFeatures,
          previousResponses: [], // First round, no previous responses
          round: 1,
        });

        // Save response to database
        await prisma.boardMessage.create({
          data: {
            conversationId: params.conversationId,
            memberId: member.id,
            role: BoardMessageRole.ASSISTANT,
            content: response.content,
            model: response.model,
            tokensUsed: response.tokensUsed,
            toolsUsed: response.toolsUsed,
            ceoMode: response.ceoMode,
          },
        });

        responses.push({ ...response, round: 1 });
      } catch (error: any) {
        logger.error(`[BoardEngine] Error getting response from ${member.nameAr}:`, error.message);
      }
    }

    // 7. If brainstorming enabled, continue with additional rounds
    let brainstormRounds: BrainstormResult['rounds'] | undefined;

    if (params.enableBrainstorm && responses.length > 1) {
      const numRounds = Math.min(params.brainstormRounds || 2, 3); // Max 3 rounds
      brainstormRounds = [{ round: 1, responses }];

      let previousResponses = responses;

      for (let round = 2; round <= numRounds; round++) {
        const roundResponses = await this.getBrainstormRound({
          conversationId: params.conversationId,
          members,
          previousResponses,
          context,
          ceoMode: params.ceoMode,
          features: allFeatures,
          round,
        });

        if (roundResponses.length > 0) {
          brainstormRounds.push({ round, responses: roundResponses });
          previousResponses = roundResponses;
        }
      }
    }

    return { userMessage, responses, brainstormRounds };
  }

  /**
   * Get a round of brainstorming responses - جولة عصف ذهني
   * الأعضاء يعلقون على آراء بعضهم البعض
   */
  private async getBrainstormRound(params: {
    conversationId: string;
    members: any[];
    previousResponses: BoardMemberResponse[];
    context: any;
    ceoMode?: CEOMode;
    features: string[];
    round: number;
  }): Promise<BoardMemberResponse[]> {
    const responses: BoardMemberResponse[] = [];

    // Shuffle members to vary who speaks first
    const shuffledMembers = [...params.members].sort(() => Math.random() - 0.5);

    // Get conversation for history
    const conversation = await prisma.boardConversation.findUnique({
      where: { id: params.conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
      },
    });

    for (const member of shuffledMembers) {
      try {
        const response = await this.getMemberResponse({
          member,
          conversation,
          userMessage: `[جولة العصف الذهني ${params.round}] استمر في النقاش وعلّق على آراء زملائك.`,
          context: params.context,
          ceoMode: member.role === BoardRole.CEO ? params.ceoMode : undefined,
          features: params.features,
          previousResponses: params.previousResponses,
          round: params.round,
        });

        // Save response to database
        await prisma.boardMessage.create({
          data: {
            conversationId: params.conversationId,
            memberId: member.id,
            role: BoardMessageRole.ASSISTANT,
            content: response.content,
            model: response.model,
            tokensUsed: response.tokensUsed,
            toolsUsed: response.toolsUsed,
            ceoMode: response.ceoMode,
          },
        });

        responses.push({ ...response, round: params.round });

        // Add this response to previous responses for next member
        params.previousResponses = [...params.previousResponses, response];
      } catch (error: any) {
        logger.error(`[BoardEngine] Error in brainstorm round ${params.round} from ${member.nameAr}:`, error.message);
      }
    }

    return responses;
  }

  /**
   * Continue discussion - استمرار النقاش
   * يسمح بجولات إضافية من التفاعل بين الأعضاء
   */
  async continueDiscussion(params: {
    conversationId: string;
    founderId: string;
    prompt?: string; // توجيه اختياري للنقاش
    rounds?: number;
  }): Promise<{
    responses: BoardMemberResponse[];
  }> {
    // Get recent messages
    const conversation = await prisma.boardConversation.findUnique({
      where: { id: params.conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            member: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get all active members
    const members = await prisma.boardMember.findMany({
      where: { status: BoardMemberStatus.ACTIVE },
    });

    // Build previous responses from recent messages
    const previousResponses: BoardMemberResponse[] = conversation.messages
      .filter(m => m.role === BoardMessageRole.ASSISTANT && m.member)
      .map(m => ({
        memberId: m.memberId!,
        memberName: m.member!.name,
        memberNameAr: m.member!.nameAr,
        memberRole: m.member!.role as BoardRole,
        content: m.content,
        model: m.model as AIModel,
        tokensUsed: m.tokensUsed || 0,
        toolsUsed: m.toolsUsed || [],
      }));

    const context = await this.buildContext(params.conversationId);

    // Save founder's continuation prompt if provided
    if (params.prompt) {
      await prisma.boardMessage.create({
        data: {
          conversationId: params.conversationId,
          founderId: params.founderId,
          role: BoardMessageRole.USER,
          content: params.prompt,
        },
      });
    }

    // Get continuation responses
    const responses: BoardMemberResponse[] = [];

    for (const member of members) {
      try {
        const response = await this.getMemberResponse({
          member,
          conversation,
          userMessage: params.prompt || 'استمروا في النقاش وتفاعلوا مع آراء بعضكم.',
          context,
          features: [...conversation.featuresUsed, 'brainstorm'],
          previousResponses,
          round: 0, // Continuation round
        });

        await prisma.boardMessage.create({
          data: {
            conversationId: params.conversationId,
            memberId: member.id,
            role: BoardMessageRole.ASSISTANT,
            content: response.content,
            model: response.model,
            tokensUsed: response.tokensUsed,
            toolsUsed: response.toolsUsed,
          },
        });

        responses.push(response);
      } catch (error: any) {
        logger.error(`[BoardEngine] Error in continuation from ${member.nameAr}:`, error.message);
      }
    }

    return { responses };
  }

  /**
   * Get response from a specific member
   * يدعم العصف الذهني عبر تمرير ردود الزملاء السابقة
   */
  private async getMemberResponse(params: {
    member: any;
    conversation: any;
    userMessage: string;
    context: any;
    ceoMode?: CEOMode;
    features: string[];
    previousResponses?: BoardMemberResponse[];
    round?: number;
  }): Promise<BoardMemberResponse> {
    // Get system prompt
    let systemPrompt = params.member.systemPrompt;

    // If CEO, use the appropriate mode
    if (params.member.role === BoardRole.CEO && params.ceoMode) {
      systemPrompt = getPromptByRole('CEO', params.ceoMode as CEOModeType);
    }

    // Add feature-specific instructions
    systemPrompt = this.addFeatureInstructions(systemPrompt, params.features);

    // Build conversation history
    const history = params.conversation?.messages
      ? params.conversation.messages
          .filter((m: any) => m.role !== BoardMessageRole.SYSTEM)
          .slice(-10)
          .map((m: any) => ({
            role: m.role === BoardMessageRole.USER ? 'user' : 'assistant',
            content: m.content,
          }))
      : [];

    // Build colleagues' responses section for brainstorming
    let colleaguesSection = '';
    if (params.previousResponses && params.previousResponses.length > 0) {
      const otherResponses = params.previousResponses.filter(
        r => r.memberId !== params.member.id
      );
      if (otherResponses.length > 0) {
        colleaguesSection = `
## 💬 ما قاله زملاؤك في الجولة السابقة:
${otherResponses.map(r => `
### ${r.memberNameAr} (${r.memberRole}):
${r.content}
`).join('\n')}
---
**الآن دورك!** علّق على آراء زملائك، وافق، اعترض، أو ابنِ على أفكارهم.
`;
      }
    }

    // Determine if this is a brainstorm round
    const isBrainstorm = params.features.includes('brainstorm') || (params.round && params.round > 1);

    // Build current message with context
    let currentMessage = '';

    if (isBrainstorm && params.round && params.round > 1) {
      // Brainstorm continuation round
      currentMessage = `## السياق الحالي لـ Xchange
${JSON.stringify(params.context, null, 2)}

${colleaguesSection}

## توجيه الجولة ${params.round}
${params.userMessage}

---
**تعليمات الجولة ${params.round}:**
- علّق على ما قاله زملاؤك بالاسم
- أضف أفكار جديدة أو ابنِ على أفكارهم
- اختلف إذا لزم الأمر مع شرح السبب
- كن مختصراً (2-3 فقرات كحد أقصى)`;
    } else if (colleaguesSection) {
      // First round with previous responses (continuation)
      currentMessage = `## السياق الحالي لـ Xchange
${JSON.stringify(params.context, null, 2)}

${colleaguesSection}

## رسالة المؤسس
${params.userMessage}

---
رد كـ ${params.member.nameAr} (${params.member.role}) بناءً على خبرتك ومسؤولياتك.
علّق على ما قاله زملاؤك واذكرهم بأسمائهم.
كن مختصراً ومركزاً (لا تزيد عن 3-4 فقرات).`;
    } else {
      // First round, no previous responses
      currentMessage = `## السياق الحالي لـ Xchange
${JSON.stringify(params.context, null, 2)}

## رسالة المؤسس
${params.userMessage}

---
رد كـ ${params.member.nameAr} (${params.member.role}) بناءً على خبرتك ومسؤولياتك.
كن مختصراً ومركزاً (لا تزيد عن 3-4 فقرات).`;
    }

    // Get model based on member role
    const model = this.getModelForRole(params.member.role);

    // Call Claude API
    const response = await claudeService.chat({
      model,
      system: systemPrompt,
      messages: [
        ...history,
        { role: 'user' as const, content: currentMessage },
      ],
    });

    return {
      memberId: params.member.id,
      memberName: params.member.name,
      memberNameAr: params.member.nameAr,
      memberRole: params.member.role,
      content: response.content,
      model: params.member.model,
      tokensUsed: response.usage.totalTokens,
      toolsUsed: response.toolCalls.map(t => t.name),
      ceoMode: params.ceoMode,
    };
  }

  /**
   * Determine which members should respond
   */
  private async determineRespondingMembers(params: SendMessageParams) {
    // If specific members requested
    if (params.targetMemberIds?.length) {
      return prisma.boardMember.findMany({
        where: {
          id: { in: params.targetMemberIds },
          status: BoardMemberStatus.ACTIVE,
        },
      });
    }

    // Analyze content to determine relevant members
    const content = params.content.toLowerCase();
    const relevantRoles: BoardRole[] = [];

    // Check for technical topics
    if (
      content.includes('تقني') ||
      content.includes('كود') ||
      content.includes('تطوير') ||
      content.includes('برمج') ||
      content.includes('api') ||
      content.includes('bug') ||
      content.includes('feature')
    ) {
      relevantRoles.push(BoardRole.CTO);
    }

    // Check for financial topics
    if (
      content.includes('مالي') ||
      content.includes('ميزانية') ||
      content.includes('تكلفة') ||
      content.includes('إيراد') ||
      content.includes('استثمار') ||
      content.includes('roi') ||
      content.includes('cac')
    ) {
      relevantRoles.push(BoardRole.CFO);
    }

    // Check for marketing topics
    if (
      content.includes('تسويق') ||
      content.includes('إعلان') ||
      content.includes('عملاء') ||
      content.includes('حملة') ||
      content.includes('brand') ||
      content.includes('growth')
    ) {
      relevantRoles.push(BoardRole.CMO);
    }

    // Check for operations topics
    if (
      content.includes('عمليات') ||
      content.includes('توصيل') ||
      content.includes('شحن') ||
      content.includes('لوجستي') ||
      content.includes('خدمة عملاء')
    ) {
      relevantRoles.push(BoardRole.COO);
    }

    // Check for legal topics
    if (
      content.includes('قانون') ||
      content.includes('ترخيص') ||
      content.includes('تنظيم') ||
      content.includes('عقد') ||
      content.includes('امتثال') ||
      content.includes('خصوصية')
    ) {
      relevantRoles.push(BoardRole.CLO);
    }

    // CEO always participates in strategic discussions or if no specific role matched
    if (
      content.includes('استراتيج') ||
      content.includes('قرار') ||
      content.includes('رؤية') ||
      content.includes('مستقبل') ||
      relevantRoles.length === 0
    ) {
      relevantRoles.push(BoardRole.CEO);
    }

    // If it's a broad topic, include all members
    if (
      content.includes('اجتماع') ||
      content.includes('المجلس') ||
      content.includes('جميع')
    ) {
      return prisma.boardMember.findMany({
        where: { status: BoardMemberStatus.ACTIVE },
      });
    }

    return prisma.boardMember.findMany({
      where: {
        role: { in: relevantRoles },
        status: BoardMemberStatus.ACTIVE,
      },
    });
  }

  /**
   * Add feature-specific instructions to prompt
   */
  private addFeatureInstructions(prompt: string, features: string[]): string {
    let enhancedPrompt = prompt;

    if (features.includes('devils-advocate')) {
      enhancedPrompt += `

## وضع خاص: محامي الشيطان (Devil's Advocate)
في هذه المحادثة، يجب أن تعارض وتتحدى كل فكرة تُطرح.
ابحث عن نقاط الضعف والمخاطر والمشاكل المحتملة.
لا توافق بسهولة - اطرح أسئلة صعبة.`;
    }

    if (features.includes('board-challenges-founder')) {
      enhancedPrompt += `

## وضع خاص: تحدي المؤسس
لا توافق بسهولة. اطلب بيانات وأدلة.
اسأل أسئلة صعبة ومحرجة.
تصرف كمستثمر متشكك يريد حماية أمواله.`;
    }

    if (features.includes('pre-mortem')) {
      enhancedPrompt += `

## وضع خاص: تحليل ما قبل الفشل (Pre-Mortem)
تخيل أن هذا القرار/المشروع فشل فشلاً ذريعاً.
ما الأسباب المحتملة للفشل؟
كيف يمكن منع كل سيناريو فشل؟`;
    }

    if (features.includes('brainstorm')) {
      enhancedPrompt += `

## وضع خاص: العصف الذهني (Brainstorming)
هذه جلسة عصف ذهني تفاعلية مع زملائك:
- شارك بأفكارك بحرية حتى لو بدت غير تقليدية
- علّق على آراء زملائك بالاسم (كريم، نادية، ليلى، يوسف، عمر، هنا)
- ابنِ على أفكار الآخرين وطوّرها
- اختلف باحترام واشرح أسباب اختلافك
- اطرح أسئلة على زملائك للاستفادة من خبراتهم
- لا تكرر ما قيل - أضف قيمة جديدة
- كن مختصراً ومباشراً

أمثلة للتفاعل:
- "أتفق مع نادية في النقطة التقنية، وأضيف..."
- "ليلى، هل الميزانية تسمح بما اقترحه يوسف؟"
- "أختلف مع عمر هنا، لأن..."
- "فكرة كريم ممتازة، يمكن تطويرها بـ..."`;
    }

    return enhancedPrompt;
  }

  /**
   * Build context from Xchange data
   */
  private async buildContext(conversationId: string): Promise<any> {
    // Get basic platform statistics
    try {
      const [
        userCount,
        listingCount,
        transactionCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.listing.count({ where: { status: 'ACTIVE' } }),
        prisma.transaction.count(),
      ]);

      return {
        platform: 'Xchange Egypt',
        statistics: {
          totalUsers: userCount,
          activeListings: listingCount,
          totalTransactions: transactionCount,
        },
        conversationId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.warn('[BoardEngine] Error building context:', error);
      return {
        platform: 'Xchange Egypt',
        conversationId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get model for role
   */
  private getModelForRole(role: BoardRole): AIModelType {
    // CEO uses Opus for strategic decisions
    if (role === BoardRole.CEO) {
      return 'OPUS';
    }
    // All other C-Suite use Sonnet
    return 'SONNET';
  }

  /**
   * إجراء نقاش منظم متتابع - Sequential Structured Discussion
   * كل عضو يرد بناءً على أهمية تخصصه للموضوع
   */
  async conductStructuredDiscussion(params: {
    conversationId: string;
    founderId: string;
    content: string;
    maxResponders?: number; // الحد الأقصى للمستجيبين (افتراضي: الكل)
  }): Promise<StructuredDiscussionResult> {
    const { conversationId, founderId, content, maxResponders = 6 } = params;

    // 1. حفظ رسالة المؤسس
    const userMessage = await prisma.boardMessage.create({
      data: {
        conversationId,
        founderId,
        role: BoardMessageRole.USER,
        content,
      },
    });

    // 2. تصنيف الموضوع
    const topic = this.classifyMessageTopic(content);
    logger.info(`[BoardEngine] Topic classified as: ${topic}`);

    // 3. الحصول على جميع الأعضاء
    const allMembers = await prisma.boardMember.findMany({
      where: { status: BoardMemberStatus.ACTIVE },
    });

    // 4. بناء السياق
    const context = await this.buildContext(conversationId);

    // 5. الحصول على المحادثة للسياق
    const conversation = await prisma.boardConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
      },
    });

    // 6. إجراء النقاش المتتابع
    const discussion: StructuredDiscussionResult['discussion'] = [];
    const responses: BoardMemberResponse[] = [];
    let sequence = 1;

    while (sequence <= maxResponders) {
      // تحديد من يجب أن يرد
      const nextResponder = await this.determineNextResponder({
        content,
        previousResponses: responses,
        allMembers,
        topic,
      });

      if (!nextResponder) {
        break; // كل الأعضاء ردوا
      }

      const member = allMembers.find(m => m.id === nextResponder.memberId);
      if (!member) break;

      try {
        // الحصول على رد العضو
        const response = await this.getMemberResponse({
          member,
          conversation,
          userMessage: this.buildSequentialPrompt({
            originalMessage: content,
            previousResponses: responses,
            respondingTo: nextResponder.respondingTo,
            sequence,
            topic,
          }),
          context,
          features: ['structured-discussion'],
          previousResponses: responses,
        });

        // حفظ الرد في قاعدة البيانات
        await prisma.boardMessage.create({
          data: {
            conversationId,
            memberId: member.id,
            role: BoardMessageRole.ASSISTANT,
            content: response.content,
            model: response.model,
            tokensUsed: response.tokensUsed,
            toolsUsed: response.toolsUsed,
          },
        });

        responses.push(response);

        // تحديد نوع الرد
        let responseType: 'initial' | 'response' | 'question' | 'summary' = 'response';
        if (sequence === 1) responseType = 'initial';
        if (response.content.includes('؟') || response.content.includes('?')) responseType = 'question';

        discussion.push({
          sequence,
          response,
          respondingTo: nextResponder.respondingTo,
          type: responseType,
        });

        sequence++;
      } catch (error: any) {
        logger.error(`[BoardEngine] Error in structured discussion from ${member.nameAr}:`, error.message);
        break;
      }
    }

    return {
      userMessage,
      discussion,
      status: 'in_progress',
    };
  }

  /**
   * بناء رسالة السياق للنقاش المتتابع
   */
  private buildSequentialPrompt(params: {
    originalMessage: string;
    previousResponses: BoardMemberResponse[];
    respondingTo?: string;
    sequence: number;
    topic: string;
  }): string {
    const { originalMessage, previousResponses, respondingTo, sequence, topic } = params;

    let prompt = `## رسالة المؤسس الأصلية:\n${originalMessage}\n\n`;

    if (previousResponses.length > 0) {
      prompt += `## ما قاله زملاؤك حتى الآن:\n`;
      for (const resp of previousResponses) {
        prompt += `### ${resp.memberNameAr} (${resp.memberRole}):\n${resp.content}\n\n`;
      }
    }

    prompt += `---\n`;
    prompt += `**أنت المستجيب رقم ${sequence}.**\n`;

    if (respondingTo) {
      prompt += `**أنت ترد على ما قاله ${respondingTo}.**\n`;
    }

    prompt += `\n**التعليمات:**\n`;
    prompt += `- أضف قيمة جديدة من منظور تخصصك\n`;
    prompt += `- إذا وافقت أو اختلفت مع زميل، اذكره بالاسم\n`;
    prompt += `- اقترح بدائل أو حلول محددة\n`;
    prompt += `- كن مختصراً ومباشراً (3-4 فقرات كحد أقصى)\n`;

    return prompt;
  }

  /**
   * توليد ملخص الرئيس التنفيذي مع البدائل
   */
  async generateCEOSummary(conversationId: string): Promise<{
    alternatives: string[];
    recommendation: string;
    risks: string[];
    nextSteps: string[];
  }> {
    // الحصول على المحادثة كاملة
    const conversation = await prisma.boardConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            member: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // بناء ملخص المحادثة
    const messagesText = conversation.messages
      .map(m => {
        if (m.role === 'USER') {
          return `**المؤسس:** ${m.content}`;
        } else if (m.member) {
          return `**${m.member.nameAr} (${m.member.role}):** ${m.content}`;
        }
        return m.content;
      })
      .join('\n\n');

    // الحصول على CEO
    const ceo = await prisma.boardMember.findFirst({
      where: { role: BoardRole.CEO, status: BoardMemberStatus.ACTIVE },
    });

    if (!ceo) {
      throw new Error('CEO not found');
    }

    // توليد الملخص باستخدام Claude
    const summaryPrompt = `
أنت كريم، الرئيس التنفيذي لـ Xchange Egypt.

راجع النقاش التالي بين أعضاء مجلس الإدارة والمؤسس، ثم قدم ملخصاً منظماً:

${messagesText}

---

**قدم الملخص بالتنسيق التالي (JSON):**

{
  "alternatives": [
    "البديل الأول: وصف مختصر",
    "البديل الثاني: وصف مختصر",
    "البديل الثالث: وصف مختصر (إن وجد)"
  ],
  "recommendation": "توصيتي كرئيس تنفيذي هي...",
  "risks": [
    "المخاطرة الأولى",
    "المخاطرة الثانية"
  ],
  "nextSteps": [
    "الخطوة الأولى المقترحة",
    "الخطوة الثانية المقترحة"
  ]
}

**مهم:**
- حدد البدائل المطروحة في النقاش بوضوح
- قدم توصيتك الشخصية كقائد
- اذكر المخاطر الرئيسية
- اقترح خطوات عملية للتنفيذ
- رد بـ JSON فقط بدون أي نص إضافي
`;

    const response = await claudeService.generateText({
      model: 'OPUS',
      system: ceo.systemPrompt,
      prompt: summaryPrompt,
    });

    // محاولة تحليل JSON
    try {
      // إزالة أي نص قبل وبعد JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const summary = JSON.parse(jsonMatch[0]);

        // حفظ الملخص كرسالة
        await prisma.boardMessage.create({
          data: {
            conversationId,
            memberId: ceo.id,
            role: BoardMessageRole.ASSISTANT,
            content: `## ملخص الرئيس التنفيذي\n\n**البدائل المطروحة:**\n${summary.alternatives.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\n**توصيتي:**\n${summary.recommendation}\n\n**المخاطر:**\n${summary.risks.map((r: string) => `- ${r}`).join('\n')}\n\n**الخطوات التالية:**\n${summary.nextSteps.map((s: string) => `- ${s}`).join('\n')}`,
            model: 'OPUS',
            ceoMode: 'STRATEGIST' as CEOMode,
          },
        });

        // تحديث حالة المحادثة
        await prisma.boardConversation.update({
          where: { id: conversationId },
          data: {
            status: BoardConversationStatus.ACTIVE, // في انتظار قرار المؤسس
          },
        });

        return summary;
      }
    } catch (parseError) {
      logger.error('[BoardEngine] Error parsing CEO summary JSON:', parseError);
    }

    // إذا فشل التحليل، نعيد قيم افتراضية
    return {
      alternatives: ['لم يتم تحديد بدائل واضحة'],
      recommendation: response,
      risks: ['يرجى مراجعة النقاش لتحديد المخاطر'],
      nextSteps: ['يرجى تحديد الخطوات التالية بناءً على قرارك'],
    };
  }

  /**
   * تسجيل قرار المؤسس
   */
  async recordFounderDecision(params: {
    conversationId: string;
    founderId: string;
    decision: string;
    selectedAlternative?: string;
    notes?: string;
  }): Promise<any> {
    const { conversationId, founderId, decision, selectedAlternative, notes } = params;

    // حفظ القرار كرسالة
    const decisionMessage = await prisma.boardMessage.create({
      data: {
        conversationId,
        founderId,
        role: BoardMessageRole.USER,
        content: `## قرار المؤسس\n\n**القرار:** ${decision}\n${selectedAlternative ? `\n**البديل المختار:** ${selectedAlternative}` : ''}\n${notes ? `\n**ملاحظات:** ${notes}` : ''}`,
      },
    });

    // تحديث المحادثة
    const updatedConversation = await prisma.boardConversation.update({
      where: { id: conversationId },
      data: {
        status: BoardConversationStatus.COMPLETED,
        summary: `قرار المؤسس: ${decision}`,
        endedAt: new Date(),
      },
    });

    return {
      decision: decisionMessage,
      conversation: updatedConversation,
    };
  }

  /**
   * End a conversation and generate summary
   */
  async endConversation(conversationId: string): Promise<any> {
    const conversation = await prisma.boardConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Generate summary using Claude
    const messagesText = conversation.messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');

    const summary = await claudeService.generateText({
      model: 'SONNET',
      system: 'أنت مساعد يلخص محادثات مجلس الإدارة. اكتب ملخصاً موجزاً بالعربية.',
      prompt: `لخص هذه المحادثة في 3-5 نقاط رئيسية:\n\n${messagesText}`,
    });

    // Update conversation
    const updated = await prisma.boardConversation.update({
      where: { id: conversationId },
      data: {
        status: BoardConversationStatus.COMPLETED,
        summary,
        endedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Get conversation history - سجل المحادثة
   */
  async getConversation(conversationId: string) {
    return prisma.boardConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            member: {
              select: { id: true, name: true, nameAr: true, role: true },
            },
            founder: {
              select: { id: true, fullName: true, title: true },
            },
          },
        },
        founder: {
          select: { id: true, fullName: true, email: true, title: true },
        },
      },
    });
  }

  /**
   * Get founder's conversations - محادثات المؤسس
   */
  async getFounderConversations(founderId: string) {
    return prisma.boardConversation.findMany({
      where: { founderId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }
}

// Singleton instance
export const boardEngineService = new BoardEngineService();
