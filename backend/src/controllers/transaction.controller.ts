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
): Promise<void> => {
  try {
    const buyerId = req.user!.id;
    const purchaseData = req.body;

    const transaction = await transactionService.createPurchase(buyerId, purchaseData);

    res.status(201).json(successResponse(transaction, 'Purchase created successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const transaction = await transactionService.getTransactionById(id, userId);

    res.json(successResponse(transaction, 'Transaction retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction status
 * PUT /api/v1/transactions/:id/status
 */
export const updateTransactionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    const transaction = await transactionService.updateTransactionStatus(
      id,
      userId,
      updateData
    );

    res.json(successResponse(transaction, 'Transaction status updated successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { paymentReference } = req.body;

    const transaction = await transactionService.confirmPayment(
      id,
      userId,
      paymentReference
    );

    res.json(successResponse(transaction, 'Payment confirmed successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { trackingNumber } = req.body;

    const transaction = await transactionService.markAsShipped(id, userId, trackingNumber);

    res.json(successResponse(transaction, 'Transaction marked as shipped successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const transaction = await transactionService.markAsDelivered(id, userId);

    res.json(successResponse(transaction, 'Transaction marked as delivered successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;

    const transaction = await transactionService.cancelTransaction(id, userId, reason);

    res.json(successResponse(transaction, 'Transaction cancelled successfully'));
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
): Promise<void> => {
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

    res.json(successResponse(result, 'User transactions retrieved successfully'));
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { role, status, page, limit } = req.query;

    const result = await transactionService.getUserTransactions(
      userId,
      role as any,
      status as any,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    res.json(successResponse(result, 'Your transactions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
