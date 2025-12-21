import { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { successResponse } from '../utils/response';

/**
 * Create a purchase transaction
 * POST /api/v1/transactions/purchase
 */
export const createPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user.id;
    const purchaseData = req.body;

    const transaction = await transactionService.createPurchase(buyerId, purchaseData);

    return successResponse(res, transaction, 'Purchase created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Buy an item directly
 * POST /api/v1/transactions/buy-item
 */
export const buyItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user.id;
    const purchaseData = req.body;

    const result = await transactionService.buyItemDirectly(buyerId, purchaseData);

    return successResponse(res, result, 'Purchase successful! The seller will contact you shortly.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction by ID
 * GET /api/v1/transactions/:id
 */
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await transactionService.getTransactionById(id, userId);

    return successResponse(res, transaction, 'Transaction retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update delivery status
 * PUT /api/v1/transactions/:id/delivery-status
 */
export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { deliveryStatus } = req.body;

    const transaction = await transactionService.updateDeliveryStatus(
      id,
      userId,
      deliveryStatus
    );

    return successResponse(res, transaction, 'Delivery status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment for a transaction
 * POST /api/v1/transactions/:id/confirm-payment
 */
export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await transactionService.confirmPayment(id, userId);

    return successResponse(res, transaction, 'Payment confirmed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark transaction as shipped
 * POST /api/v1/transactions/:id/ship
 */
export const markAsShipped = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { trackingNumber } = req.body;

    const transaction = await transactionService.markAsShipped(id, userId, trackingNumber);

    return successResponse(res, transaction, 'Transaction marked as shipped successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark transaction as delivered
 * POST /api/v1/transactions/:id/deliver
 */
export const markAsDelivered = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await transactionService.markAsDelivered(id, userId);

    return successResponse(res, transaction, 'Transaction marked as delivered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel transaction
 * POST /api/v1/transactions/:id/cancel
 */
export const cancelTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const transaction = await transactionService.cancelTransaction(id, userId, reason);

    return successResponse(res, transaction, 'Transaction cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user transactions
 * GET /api/v1/transactions/user/:userId
 */
export const getUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { role, status, page, limit } = req.query;

    const result = await transactionService.getUserTransactions(
      userId,
      role as any,
      status as any,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    return successResponse(res, result, 'User transactions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my transactions (authenticated user)
 * GET /api/v1/transactions/my
 */
export const getMyTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { role, status, page, limit } = req.query;

    const result = await transactionService.getUserTransactions(
      userId,
      role as any,
      status as any,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    return successResponse(res, result, 'Your transactions retrieved successfully');
  } catch (error) {
    next(error);
  }
};
