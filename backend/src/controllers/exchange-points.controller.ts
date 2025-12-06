import { Request, Response } from 'express';
import { exchangePointsService } from '../services/exchange-points.service';

export const exchangePointsController = {
  /**
   * Get all exchange points
   */
  getExchangePoints: async (req: Request, res: Response) => {
    try {
      const { governorate, city, type, latitude, longitude, radius } = req.query;

      const points = await exchangePointsService.getExchangePoints({
        governorate: governorate as string,
        city: city as string,
        type: type as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        radius: radius ? parseFloat(radius as string) : undefined,
      });

      res.json({
        success: true,
        data: { points },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get exchange point by ID
   */
  getExchangePoint: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const point = await exchangePointsService.getExchangePoint(id);

      res.json({
        success: true,
        data: { point },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get nearby exchange points
   */
  getNearbyPoints: async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, radius } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'الإحداثيات مطلوبة',
        });
      }

      const points = await exchangePointsService.getNearbyPoints(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        radius ? parseFloat(radius as string) : 10
      );

      res.json({
        success: true,
        data: { points },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Create booking
   */
  createBooking: async (req: Request, res: Response) => {
    try {
      const user1Id = (req as any).user.id;
      const {
        pointId,
        user2Id,
        transactionType,
        transactionId,
        offerId,
        scheduledDate,
        scheduledTime,
        duration,
      } = req.body;

      if (!pointId || !user2Id || !scheduledDate || !scheduledTime) {
        return res.status(400).json({
          success: false,
          message: 'البيانات المطلوبة: pointId, user2Id, scheduledDate, scheduledTime',
        });
      }

      const booking = await exchangePointsService.createBooking({
        pointId,
        user1Id,
        user2Id,
        transactionType: transactionType || 'BARTER',
        transactionId,
        offerId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration,
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحجز بنجاح',
        data: { booking },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get user's bookings
   */
  getMyBookings: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { status } = req.query;

      const bookings = await exchangePointsService.getUserBookings(userId, status as string);

      res.json({
        success: true,
        data: { bookings },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Confirm booking
   */
  confirmBooking: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const booking = await exchangePointsService.confirmBooking(id, userId);

      res.json({
        success: true,
        message: 'تم تأكيد الحجز',
        data: { booking },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Check in to booking
   */
  checkIn: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const booking = await exchangePointsService.checkIn(id, userId);

      res.json({
        success: true,
        message: 'تم تسجيل الوصول',
        data: { booking },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Complete booking
   */
  completeBooking: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { notes } = req.body;

      const booking = await exchangePointsService.completeBooking(id, userId, notes);

      res.json({
        success: true,
        message: 'تم إتمام التبادل بنجاح!',
        data: { booking },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await exchangePointsService.cancelBooking(id, userId, reason);

      res.json({
        success: true,
        message: 'تم إلغاء الحجز',
        data: { booking },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Add review
   */
  addReview: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { rating, safetyRating, cleanlinessRating, accessibilityRating, comment, bookingId } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'التقييم مطلوب (1-5)',
        });
      }

      const review = await exchangePointsService.addReview({
        pointId: id,
        userId,
        bookingId,
        rating,
        safetyRating,
        cleanlinessRating,
        accessibilityRating,
        comment,
      });

      res.status(201).json({
        success: true,
        message: 'تم إضافة التقييم',
        data: { review },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get available time slots
   */
  getAvailableSlots: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'التاريخ مطلوب',
        });
      }

      const slots = await exchangePointsService.getAvailableSlots(id, new Date(date as string));

      res.json({
        success: true,
        data: { slots },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get governorates with exchange points
   */
  getGovernorates: async (_req: Request, res: Response) => {
    try {
      const governorates = await exchangePointsService.getGovernorates();

      res.json({
        success: true,
        data: { governorates },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
