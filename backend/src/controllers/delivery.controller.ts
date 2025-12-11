import { Request, Response, NextFunction } from 'express';
import * as deliveryService from '../services/delivery.service';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

/**
 * Get delivery options for a route
 * POST /api/v1/delivery/options
 */
export const getDeliveryOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pickupGovernorate, pickupCity, deliveryGovernorate, deliveryCity, packageWeight, isCOD } = req.body;

    if (!pickupGovernorate || !deliveryGovernorate) {
      throw new BadRequestError('يجب تحديد محافظة الاستلام والتوصيل');
    }

    const options = await deliveryService.getDeliveryOptions({
      pickupGovernorate,
      pickupCity,
      deliveryGovernorate,
      deliveryCity,
      packageWeight,
      isCOD,
    });

    return successResponse(res, { options }, 'تم جلب خيارات التوصيل بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a delivery booking
 * POST /api/v1/delivery/bookings
 */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.user!.id;
    const {
      orderId,
      transactionId,
      receiverId,
      provider,
      pickupAddress,
      pickupCity,
      pickupGovernorate,
      pickupPhone,
      pickupLat,
      pickupLng,
      deliveryAddress,
      deliveryCity,
      deliveryGovernorate,
      deliveryPhone,
      deliveryLat,
      deliveryLng,
      packageWeight,
      packageDimensions,
      packageDescription,
      isFragile,
      deliverySpeed,
      hasInsurance,
      isCOD,
      codAmount,
      senderNotes,
    } = req.body;

    if (!receiverId || !provider || !pickupAddress || !deliveryAddress) {
      throw new BadRequestError('بيانات التوصيل غير مكتملة');
    }

    const booking = await deliveryService.createBooking({
      orderId,
      transactionId,
      senderId,
      receiverId,
      provider,
      pickupAddress,
      pickupCity,
      pickupGovernorate,
      pickupPhone,
      pickupLat,
      pickupLng,
      deliveryAddress,
      deliveryCity,
      deliveryGovernorate,
      deliveryPhone,
      deliveryLat,
      deliveryLng,
      packageWeight,
      packageDimensions,
      packageDescription,
      isFragile,
      deliverySpeed,
      hasInsurance,
      isCOD,
      codAmount,
      senderNotes,
    });

    return successResponse(res, booking, 'تم إنشاء طلب التوصيل بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * GET /api/v1/delivery/bookings/:id
 */
export const getBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await deliveryService.getBooking(id, userId);

    return successResponse(res, booking, 'تم جلب طلب التوصيل بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's delivery bookings
 * GET /api/v1/delivery/bookings/my
 */
export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { type, page, limit } = req.query;

    const result = await deliveryService.getUserBookings(
      userId,
      (type as 'sent' | 'received') || 'sent',
      page ? parseInt(page as string, 10) : 1,
      limit ? parseInt(limit as string, 10) : 10
    );

    return successResponse(res, result, 'تم جلب طلبات التوصيل بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 * POST /api/v1/delivery/bookings/:id/cancel
 */
export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await deliveryService.cancelBooking(id, userId);

    return successResponse(res, booking, 'تم إلغاء طلب التوصيل بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status (webhook for delivery providers)
 * POST /api/v1/delivery/webhook/status
 */
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId, status, location, description, driverNotes } = req.body;

    if (!bookingId || !status) {
      throw new BadRequestError('بيانات غير مكتملة');
    }

    const booking = await deliveryService.updateBookingStatus(
      bookingId,
      status,
      location,
      description,
      driverNotes
    );

    return successResponse(res, booking, 'تم تحديث حالة التوصيل بنجاح');
  } catch (error) {
    next(error);
  }
};
