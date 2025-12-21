import { Request, Response, NextFunction } from 'express';
import * as instapayService from '../services/payment/instapay.service';
import * as fawryService from '../services/payment/fawry.service';
import * as orderService from '../services/order.service';
import { successResponse } from '../utils/response';

/**
 * Initiate InstaPay payment
 * POST /api/v1/payment/instapay/initiate
 */
export const initiateInstapay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    // Get order to verify ownership and get amount
    const order = await orderService.getOrderById(userId, orderId);

    const result = await instapayService.initiatePayment(orderId, order.total, {
      email: order.user.email,
      phone: order.user.phone || '',
      name: order.user.fullName,
    });

    return successResponse(res, result, 'Payment initiated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify InstaPay payment
 * GET /api/v1/payment/instapay/verify/:transactionId
 */
export const verifyInstapay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;

    const result = await instapayService.verifyPayment(transactionId);
    return successResponse(res, result, 'Payment status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle InstaPay callback
 * POST /api/v1/payment/instapay/callback
 */
export const instapayCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await instapayService.handleCallback(req.body);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Fawry payment
 * POST /api/v1/payment/fawry/create
 */
export const createFawryPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    // Get order to verify ownership and get amount
    const order = await orderService.getOrderById(userId, orderId);

    const result = await fawryService.createFawryPayment(orderId, order.total, {
      email: order.user.email,
      phone: order.user.phone || '',
      name: order.user.fullName,
    });

    return successResponse(res, result, 'Fawry reference created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Check Fawry payment status
 * GET /api/v1/payment/fawry/status/:referenceNumber
 */
export const checkFawryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { referenceNumber } = req.params;

    const result = await fawryService.checkPaymentStatus(referenceNumber);
    return successResponse(res, result, 'Fawry status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Fawry callback
 * POST /api/v1/payment/fawry/callback
 */
export const fawryCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await fawryService.handleFawryCallback(req.body);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
