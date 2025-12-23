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
}

class BoardEngineService {
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
   */
  async sendMessage(params: SendMessageParams): Promise<{
    userMessage: any;
    responses: BoardMemberResponse[];
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
    if (params.features?.length) {
      const updatedFeatures = [...new Set([...conversation.featuresUsed, ...params.features])];
      await prisma.boardConversation.update({
        where: { id: params.conversationId },
        data: { featuresUsed: updatedFeatures },
      });
    }

    // 4. Determine which members should respond
    const members = await this.determineRespondingMembers(params);

    // 5. Build context from Xchange data
    const context = await this.buildContext(params.conversationId);

    // 6. Get responses from each member
    const responses: BoardMemberResponse[] = [];

    for (const member of members) {
      try {
        const response = await this.getMemberResponse({
          member,
          conversation,
          userMessage: params.content,
          context,
          ceoMode: member.role === BoardRole.CEO ? params.ceoMode : undefined,
          features: [...conversation.featuresUsed, ...(params.features || [])],
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

        responses.push(response);
      } catch (error: any) {
        logger.error(`[BoardEngine] Error getting response from ${member.nameAr}:`, error.message);
      }
    }

    return { userMessage, responses };
  }

  /**
   * Get response from a specific member
   */
  private async getMemberResponse(params: {
    member: any;
    conversation: any;
    userMessage: string;
    context: any;
    ceoMode?: CEOMode;
    features: string[];
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
    const history = params.conversation.messages
      .filter((m: any) => m.role !== BoardMessageRole.SYSTEM)
      .slice(-10)
      .map((m: any) => ({
        role: m.role === BoardMessageRole.USER ? 'user' : 'assistant',
        content: m.content,
      }));

    // Add current message with context
    const currentMessage = `## السياق الحالي لـ Xchange
${JSON.stringify(params.context, null, 2)}

## رسالة المؤسس
${params.userMessage}

---
رد كـ ${params.member.nameAr} (${params.member.role}) بناءً على خبرتك ومسؤولياتك.
كن مختصراً ومركزاً (لا تزيد عن 3-4 فقرات).`;

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
