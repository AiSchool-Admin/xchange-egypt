/**
 * Board Controller
 * وحدة التحكم في مجلس إدارة AI
 */

import { Request, Response } from 'express';
import { boardEngineService } from '../services/board/board-engine.service';
import { claudeService } from '../services/claude/claude.service';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import logger from '../lib/logger';
import { BoardConversationType, CEOMode } from '../services/board/board.types';

/**
 * Get all board members
 */
export const getBoardMembers = async (req: Request, res: Response) => {
  try {
    const members = await boardEngineService.getBoardMembers();

    res.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    logger.error('[BoardController] getBoardMembers error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Initialize board members (admin only)
 */
export const initializeBoardMembers = async (req: Request, res: Response) => {
  try {
    await boardEngineService.initializeBoardMembers();

    const members = await boardEngineService.getBoardMembers();

    res.json({
      success: true,
      message: 'Board members initialized successfully',
      data: members,
    });
  } catch (error: any) {
    logger.error('[BoardController] initializeBoardMembers error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Start a new conversation
 */
export const startConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { topic, topicAr, type, features } = req.body;

    if (!topic) {
      throw new AppError(400, 'Topic is required');
    }

    const conversation = await boardEngineService.startConversation({
      userId,
      topic,
      topicAr,
      type: type as BoardConversationType,
      features,
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('[BoardController] startConversation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send message to board
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { conversationId } = req.params;
    const { content, targetMemberIds, ceoMode, features } = req.body;

    if (!content) {
      throw new AppError(400, 'Message content is required');
    }

    const result = await boardEngineService.sendMessage({
      conversationId,
      userId,
      content,
      targetMemberIds,
      ceoMode: ceoMode as CEOMode,
      features,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[BoardController] sendMessage error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get conversation details
 */
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await boardEngineService.getConversation(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('[BoardController] getConversation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get user's conversations
 */
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const conversations = await boardEngineService.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    logger.error('[BoardController] getUserConversations error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * End conversation and get summary
 */
export const endConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await boardEngineService.endConversation(conversationId);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('[BoardController] endConversation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get Claude service status
 */
export const getServiceStatus = async (req: Request, res: Response) => {
  try {
    const claudeStats = claudeService.getStats();

    res.json({
      success: true,
      data: {
        claude: claudeStats,
        board: {
          initialized: true,
        },
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] getServiceStatus error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Quick question to a specific member
 */
export const askMember = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { memberId } = req.params;
    const { question, ceoMode } = req.body;

    if (!question) {
      throw new AppError(400, 'Question is required');
    }

    // Start a quick conversation
    const conversation = await boardEngineService.startConversation({
      userId,
      topic: question.substring(0, 100),
      type: 'QUESTION' as BoardConversationType,
    });

    // Send message targeting specific member
    const result = await boardEngineService.sendMessage({
      conversationId: conversation.id,
      userId,
      content: question,
      targetMemberIds: [memberId],
      ceoMode: ceoMode as CEOMode,
    });

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        response: result.responses[0],
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] askMember error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get pending tasks for approval
 */
export const getPendingTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.boardTask.findMany({
      where: {
        status: 'AWAITING_APPROVAL',
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, nameAr: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, nameAr: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    logger.error('[BoardController] getPendingTasks error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Approve or reject a task
 */
export const reviewTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { taskId } = req.params;
    const { decision, reason } = req.body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      throw new AppError(400, 'Valid decision (APPROVED or REJECTED) is required');
    }

    const task = await prisma.boardTask.update({
      where: { id: taskId },
      data: {
        status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        approvalStatus: decision,
        approvedById: userId,
        approvedAt: new Date(),
        rejectionReason: decision === 'REJECTED' ? reason : null,
      },
      include: {
        assignedTo: true,
        createdBy: true,
      },
    });

    res.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    logger.error('[BoardController] reviewTask error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};
