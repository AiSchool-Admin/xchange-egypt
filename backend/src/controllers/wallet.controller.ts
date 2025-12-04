import { Request, Response } from 'express';
import * as walletService from '../services/wallet.service';

export const walletController = {
  /**
   * Get wallet info
   */
  getWallet: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const wallet = await walletService.getOrCreateWallet(userId);

      res.json({
        success: true,
        data: { wallet },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get transaction history
   */
  getTransactions: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string | undefined;

      const result = await walletService.getTransactionHistory(userId, {
        limit,
        offset: (page - 1) * limit,
        type: type as any,
      });

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
   * Transfer XCoin to another user
   */
  transfer: async (req: Request, res: Response) => {
    try {
      const fromUserId = (req as any).user.id;
      const { toUserId, amount, description } = req.body;

      if (!toUserId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'معرف المستلم والمبلغ مطلوبين',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'المبلغ يجب أن يكون أكبر من صفر',
        });
      }

      const result = await walletService.transferXCoin({
        fromUserId,
        toUserId,
        amount,
        description,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      res.json({
        success: true,
        message: 'تم التحويل بنجاح',
        data: {
          newBalance: result.newBalance,
          transaction: result.transaction,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Redeem XCoin (convert to discount/benefit)
   */
  redeem: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { amount, redeemType, relatedEntityId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'المبلغ مطلوب ويجب أن يكون أكبر من صفر',
        });
      }

      // Use spendForPromotion for promotion redemptions
      const result = await walletService.spendForPromotion(
        userId,
        amount,
        relatedEntityId || 'general_redeem'
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      res.json({
        success: true,
        message: 'تم استبدال النقاط بنجاح',
        data: {
          newBalance: result.newBalance,
          transaction: result.transaction,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get XCoin earning opportunities
   */
  getEarningOpportunities: async (req: Request, res: Response) => {
    try {
      const opportunities = [
        {
          id: 'daily_login',
          type: 'DAILY',
          title: 'تسجيل الدخول اليومي',
          description: 'سجل دخولك يومياً واحصل على 5 XCoin',
          reward: 5,
          icon: '📅',
          completed: false,
        },
        {
          id: 'first_review',
          type: 'ONE_TIME',
          title: 'أول تقييم',
          description: 'اكتب أول تقييم واحصل على 10 XCoin',
          reward: 10,
          icon: '⭐',
          completed: false,
        },
        {
          id: 'complete_profile',
          type: 'ONE_TIME',
          title: 'أكمل ملفك الشخصي',
          description: 'أضف صورة ووصف لحسابك',
          reward: 20,
          icon: '👤',
          completed: false,
        },
        {
          id: 'first_deal',
          type: 'ONE_TIME',
          title: 'أول صفقة',
          description: 'أتم أول مقايضة أو بيع',
          reward: 50,
          icon: '🤝',
          completed: false,
        },
        {
          id: 'referral',
          type: 'REPEATABLE',
          title: 'دعوة صديق',
          description: 'احصل على 100 XCoin لكل صديق يسجل برابط دعوتك',
          reward: 100,
          icon: '👥',
          completed: false,
        },
        {
          id: 'five_star',
          type: 'REPEATABLE',
          title: 'تقييم 5 نجوم',
          description: 'احصل على 20 XCoin لكل تقييم 5 نجوم',
          reward: 20,
          icon: '🌟',
          completed: false,
        },
      ];

      res.json({
        success: true,
        data: { opportunities },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get leaderboard - top earners
   */
  getLeaderboard: async (req: Request, res: Response) => {
    try {
      // Return empty leaderboard for now - can be implemented later
      const leaderboard: any[] = [];

      res.json({
        success: true,
        data: { leaderboard },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Claim daily reward
   */
  claimDailyReward: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const result = await walletService.awardDailyLoginBonus(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'تم المطالبة بالمكافأة اليومية مسبقاً',
        });
      }

      res.json({
        success: true,
        message: 'تم الحصول على المكافأة اليومية!',
        data: {
          reward: 5,
          newBalance: result.newBalance,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
