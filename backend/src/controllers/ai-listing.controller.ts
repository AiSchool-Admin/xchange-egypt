import { Request, Response } from 'express';
import { aiListingService } from '../services/ai-listing.service';

export const aiListingController = {
  /**
   * Analyze image and generate listing
   */
  analyzeImage: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'رابط الصورة مطلوب',
        });
      }

      const result = await aiListingService.analyzeImage(userId, imageUrl);

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
   * Analyze text and generate listing
   */
  analyzeText: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { text } = req.body;

      if (!text || text.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إدخال وصف أطول (10 أحرف على الأقل)',
        });
      }

      const result = await aiListingService.analyzeText(userId, text);

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
   * Get user's drafts
   */
  getDrafts: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { status } = req.query;

      const drafts = await aiListingService.getUserDrafts(userId, status as string);

      res.json({
        success: true,
        data: { drafts },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get draft by ID
   */
  getDraft: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const draft = await aiListingService.getDraft(id, userId);

      if (!draft) {
        return res.status(404).json({
          success: false,
          message: 'المسودة غير موجودة',
        });
      }

      res.json({
        success: true,
        data: { draft },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update draft
   */
  updateDraft: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const data = req.body;

      await aiListingService.updateDraft(id, userId, data);

      res.json({
        success: true,
        message: 'تم تحديث المسودة',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Publish draft as item
   */
  publishDraft: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const item = await aiListingService.publishDraft(id, userId);

      res.json({
        success: true,
        message: 'تم نشر الإعلان بنجاح!',
        data: { item },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Discard draft
   */
  discardDraft: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await aiListingService.discardDraft(id, userId);

      res.json({
        success: true,
        message: 'تم حذف المسودة',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get price suggestion
   */
  getPriceSuggestion: async (req: Request, res: Response) => {
    try {
      const { category, condition } = req.query;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'الفئة مطلوبة',
        });
      }

      const suggestion = await aiListingService.getPriceSuggestion(
        category as string,
        (condition as string) || 'GOOD'
      );

      res.json({
        success: true,
        data: suggestion,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
