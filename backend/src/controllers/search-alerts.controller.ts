import { Request, Response } from 'express';
import { searchAlertsService } from '../services/search-alerts.service';

export const searchAlertsController = {
  /**
   * Create saved search
   */
  createSavedSearch: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { name, query, filters, notifyOnNew } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'اسم البحث مطلوب',
        });
      }

      const savedSearch = await searchAlertsService.createSavedSearch(userId, {
        name,
        query,
        filters: filters || {},
        notifyOnNew,
      });

      res.status(201).json({
        success: true,
        message: 'تم حفظ البحث بنجاح',
        data: { savedSearch },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get user's saved searches
   */
  getSavedSearches: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const savedSearches = await searchAlertsService.getSavedSearches(userId);

      res.json({
        success: true,
        data: { savedSearches },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get saved search by ID
   */
  getSavedSearch: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const savedSearch = await searchAlertsService.getSavedSearch(id, userId);

      if (!savedSearch) {
        return res.status(404).json({
          success: false,
          message: 'البحث المحفوظ غير موجود',
        });
      }

      res.json({
        success: true,
        data: { savedSearch },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update saved search
   */
  updateSavedSearch: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const data = req.body;

      await searchAlertsService.updateSavedSearch(id, userId, data);

      res.json({
        success: true,
        message: 'تم تحديث البحث المحفوظ',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete saved search
   */
  deleteSavedSearch: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await searchAlertsService.deleteSavedSearch(id, userId);

      res.json({
        success: true,
        message: 'تم حذف البحث المحفوظ',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Execute saved search
   */
  executeSavedSearch: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await searchAlertsService.executeSavedSearch(id, userId, page, limit);

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
   * Get user's alerts
   */
  getAlerts: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const alerts = await searchAlertsService.getAlerts(userId);

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Create or update alert
   */
  createAlert: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { savedSearchId, frequency, notifyPush, notifyEmail, notifyWhatsapp } = req.body;

      if (!savedSearchId) {
        return res.status(400).json({
          success: false,
          message: 'معرف البحث المحفوظ مطلوب',
        });
      }

      const alert = await searchAlertsService.createAlert(userId, savedSearchId, {
        frequency,
        notifyPush,
        notifyEmail,
        notifyWhatsapp,
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء التنبيه',
        data: { alert },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Toggle alert status
   */
  toggleAlert: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const alert = await searchAlertsService.toggleAlert(id, userId);

      res.json({
        success: true,
        message: alert.isActive ? 'تم تفعيل التنبيه' : 'تم إيقاف التنبيه',
        data: { alert },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete alert
   */
  deleteAlert: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await searchAlertsService.deleteAlert(id, userId);

      res.json({
        success: true,
        message: 'تم حذف التنبيه',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get alert statistics
   */
  getAlertStats: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const stats = await searchAlertsService.getAlertStats(userId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get recent matches
   */
  getRecentMatches: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const matches = await searchAlertsService.getRecentMatches(id, userId, limit);

      res.json({
        success: true,
        data: { matches },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
