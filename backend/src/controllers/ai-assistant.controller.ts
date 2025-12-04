import { Request, Response } from 'express';
import { aiAssistantService } from '../services/ai-assistant.service';

export const aiAssistantController = {
  /**
   * Create new conversation
   */
  createConversation: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { context, relatedItemId } = req.body;

      const conversation = await aiAssistantService.createConversation(
        userId,
        context,
        relatedItemId
      );

      res.status(201).json({
        success: true,
        data: { conversation },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get user's conversations
   */
  getConversations: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await aiAssistantService.getUserConversations(userId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get conversation with messages
   */
  getConversation: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const conversation = await aiAssistantService.getConversation(id, userId);

      res.json({
        success: true,
        data: { conversation },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Send message to AI
   */
  sendMessage: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'الرسالة مطلوبة',
        });
      }

      const result = await aiAssistantService.sendMessage(id, userId, content);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Close conversation
   */
  closeConversation: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await aiAssistantService.closeConversation(id, userId);

      res.json({
        success: true,
        message: 'تم إغلاق المحادثة',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Archive conversation
   */
  archiveConversation: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await aiAssistantService.archiveConversation(id, userId);

      res.json({
        success: true,
        message: 'تم أرشفة المحادثة',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get quick suggestions
   */
  getQuickSuggestions: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const suggestions = await aiAssistantService.getQuickSuggestions(userId);

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
