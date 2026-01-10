import { Request, Response, NextFunction } from 'express';
import * as instapayService from '../services/payment/instapay.service';
import * as fawryService from '../services/payment/fawry.service';
import { paymobService, PaymobCallback } from '../services/payment/paymob.service';
import { vodafoneCashService, VodafoneCashCallback } from '../services/payment/vodafonecash.service';
import {
  unifiedPaymentGateway,
  PaymentMethod,
  UnifiedPaymentRequest,
  PAYMENT_METHODS_CONFIG,
} from '../services/payment/unified-gateway.service';
import * as orderService from '../services/order.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * =====================================================
 * UNIFIED PAYMENT GATEWAY ENDPOINTS
 * نقاط النهاية الموحدة لبوابة الدفع
 * =====================================================
 */

/**
 * Get available payment methods
 * GET /api/v1/payment/methods
 */
export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.query;
    const amountNum = amount ? parseFloat(amount as string) : undefined;

    const methods = unifiedPaymentGateway.getAvailablePaymentMethods(amountNum);

    return successResponse(res, { methods }, 'Payment methods retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate payment fees
 * GET /api/v1/payment/fees
 */
export const calculateFees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, method } = req.query;

    if (!amount || !method) {
      return errorResponse(res, 'Amount and method are required', 400);
    }

    const amountNum = parseFloat(amount as string);
    const fees = unifiedPaymentGateway.calculateFees(amountNum, method as PaymentMethod);

    return successResponse(
      res,
      {
        amount: amountNum,
        fees,
        total: amountNum + fees,
        method,
      },
      'Fees calculated'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate unified payment
 * POST /api/v1/payment/initiate
 */
export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId, method, walletPhone } = req.body;

    // Validate method
    if (!method || !Object.values(PaymentMethod).includes(method)) {
      return errorResponse(res, 'Invalid payment method', 400);
    }

    // Get order to verify ownership and get details
    const order = await orderService.getOrderById(userId, orderId);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Prepare payment request
    const paymentRequest: UnifiedPaymentRequest = {
      orderId: order.id,
      amount: order.total,
      currency: 'EGP',
      method: method as PaymentMethod,
      customer: {
        id: userId,
        firstName: order.user.fullName?.split(' ')[0] || 'Customer',
        lastName: order.user.fullName?.split(' ').slice(1).join(' ') || '',
        email: order.user.email,
        phone: order.user.phone || '',
        address: order.shippingAddress
          ? {
              street: order.shippingAddress.address || '',
              city: order.shippingAddress.city,
              governorate: order.shippingAddress.governorate,
              postalCode: order.shippingAddress.postalCode,
            }
          : undefined,
      },
      items: order.items?.map((item: any) => ({
        id: item.id,
        name: item.title || item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      walletPhone,
    };

    const result = await unifiedPaymentGateway.initiatePayment(paymentRequest);

    if (result.success) {
      // Update order with payment reference
      await orderService.updateOrderPaymentStatus(orderId, {
        paymentMethod: method,
        paymentTransactionId: result.transactionId,
        paymentStatus: 'PENDING',
      });
    }

    return successResponse(res, result, result.messageAr);
  } catch (error) {
    next(error);
  }
};

/**
 * Check payment status
 * GET /api/v1/payment/status/:transactionId
 */
export const checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    const { method } = req.query;

    if (!method) {
      return errorResponse(res, 'Payment method is required', 400);
    }

    const result = await unifiedPaymentGateway.checkPaymentStatus(
      transactionId,
      method as PaymentMethod
    );

    return successResponse(res, result, 'Payment status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund
 * POST /api/v1/payment/refund
 */
export const processRefund = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId, amount, reason, method } = req.body;

    if (!transactionId || !method) {
      return errorResponse(res, 'Transaction ID and method are required', 400);
    }

    const result = await unifiedPaymentGateway.refund({
      transactionId,
      amount,
      reason,
      method: method as PaymentMethod,
    });

    return successResponse(res, result, result.success ? 'Refund processed' : 'Refund failed');
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * INSTAPAY ENDPOINTS
 * نقاط نهاية إنستاباي
 * =====================================================
 */

/**
 * Initiate InstaPay payment
 * POST /api/v1/payment/instapay/initiate
 */
export const initiateInstapay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId } = req.body;

    // Get order to verify ownership and get amount
    const order = await orderService.getOrderById(userId, orderId);

    const result = await instapayService.initiatePayment(
      orderId,
      order.total,
      {
        email: order.user.email || '',
        phone: order.user.phone || '',
        name: order.user.fullName || '',
      }
    );

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

    // Update order status if payment successful
    if (result.success && result.orderId) {
      await orderService.updateOrderPaymentStatus(result.orderId, {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      });
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * FAWRY ENDPOINTS
 * نقاط نهاية فوري
 * =====================================================
 */

/**
 * Create Fawry payment
 * POST /api/v1/payment/fawry/create
 */
export const createFawryPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId, paymentMethod } = req.body;

    // Get order to verify ownership and get amount
    const order = await orderService.getOrderById(userId, orderId);

    const result = await fawryService.createPayment(
      orderId,
      order.total,
      {
        email: order.user.email || '',
        phone: order.user.phone || '',
        name: order.user.fullName || '',
      }
    );

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
    const result = await fawryService.handleCallback(req.body);

    // Update order status if payment successful
    if (result.success && result.merchantRefNum) {
      await orderService.updateOrderPaymentStatus(result.merchantRefNum, {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      });
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * PAYMOB ENDPOINTS
 * نقاط نهاية باي موب
 * =====================================================
 */

/**
 * Initiate Paymob card payment
 * POST /api/v1/payment/paymob/card
 */
export const initiatePaymobCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId } = req.body;

    const order = await orderService.getOrderById(userId, orderId);

    const result = await paymobService.initiateCardPayment({
      orderId,
      amount: order.total * 100, // Convert to piasters
      currency: 'EGP',
      customer: {
        firstName: order.user.fullName?.split(' ')[0] || 'Customer',
        lastName: order.user.fullName?.split(' ').slice(1).join(' ') || '',
        email: order.user.email,
        phone: order.user.phone || '',
      },
      items: order.items?.map((item: any) => ({
        name: item.title || item.name,
        amount: Number(item.price) * 100,
        description: item.description,
        quantity: item.quantity,
      })) || [{
        name: `Order ${orderId}`,
        amount: Number(order.total) * 100,
        description: `Payment for order ${orderId}`,
        quantity: 1,
      }],
      paymentType: 'card' as any,
    });

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate Paymob wallet payment
 * POST /api/v1/payment/paymob/wallet
 */
export const initiatePaymobWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId, walletPhone } = req.body;

    if (!walletPhone) {
      return errorResponse(res, 'Wallet phone number is required', 400);
    }

    const order = await orderService.getOrderById(userId, orderId);

    const result = await paymobService.initiateWalletPayment(
      {
        orderId,
        amount: order.total * 100,
        currency: 'EGP',
        customer: {
          firstName: order.user.fullName?.split(' ')[0] || 'Customer',
          lastName: order.user.fullName?.split(' ').slice(1).join(' ') || '',
          email: order.user.email,
          phone: order.user.phone || '',
        },
        items: [{
          name: `Order ${orderId}`,
          amount: order.total * 100,
          description: `Payment for order ${orderId}`,
          quantity: 1,
        }],
        paymentType: 'wallet' as any,
      },
      walletPhone
    );

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate Paymob kiosk payment
 * POST /api/v1/payment/paymob/kiosk
 */
export const initiatePaymobKiosk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId } = req.body;

    const order = await orderService.getOrderById(userId, orderId);

    const result = await paymobService.initiateKioskPayment({
      orderId,
      amount: order.total * 100,
      currency: 'EGP',
      customer: {
        firstName: order.user.fullName?.split(' ')[0] || 'Customer',
        lastName: order.user.fullName?.split(' ').slice(1).join(' ') || '',
        email: order.user.email,
        phone: order.user.phone || '',
      },
      items: [{
        name: `Order ${orderId}`,
        amount: order.total * 100,
        description: `Payment for order ${orderId}`,
        quantity: 1,
      }],
      paymentType: 'kiosk' as any,
    });

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Paymob callback (webhook)
 * POST /api/v1/payment/paymob/callback
 */
export const paymobCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callback: PaymobCallback = req.body;

    const result = await paymobService.handleCallback(callback);

    // Update order status if payment successful
    if (result.success && result.orderId) {
      await orderService.updateOrderPaymentStatus(result.orderId, {
        paymentStatus: 'PAID',
        paidAt: new Date(),
        paymentTransactionId: result.transactionId,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Paymob transaction status
 * GET /api/v1/payment/paymob/status/:transactionId
 */
export const getPaymobStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;

    const result = await paymobService.getTransactionStatus(transactionId);
    return successResponse(res, result, 'Transaction status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Refund Paymob transaction
 * POST /api/v1/payment/paymob/refund
 */
export const refundPaymob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId, amount } = req.body;

    if (!transactionId) {
      return errorResponse(res, 'Transaction ID is required', 400);
    }

    const result = await paymobService.refund({
      transactionId,
      amount: amount ? amount * 100 : 0,
    });

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * VODAFONE CASH ENDPOINTS
 * نقاط نهاية فودافون كاش
 * =====================================================
 */

/**
 * Initiate Vodafone Cash payment
 * POST /api/v1/payment/vodafone/initiate
 */
export const initiateVodafoneCash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId, customerPhone } = req.body;

    const order = await orderService.getOrderById(userId, orderId);

    const result = await vodafoneCashService.initiatePayment({
      orderId,
      amount: order.total,
      customerPhone: customerPhone || order.user.phone || '',
      description: `دفع لطلب ${orderId}`,
    });

    if (result.success) {
      await orderService.updateOrderPaymentStatus(orderId, {
        paymentMethod: 'VODAFONE_CASH',
        paymentTransactionId: result.transactionId,
        paymentStatus: 'PENDING',
      });
    }

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Check Vodafone Cash payment status
 * GET /api/v1/payment/vodafone/status/:transactionId
 */
export const checkVodafoneCashStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;

    const result = await vodafoneCashService.checkPaymentStatus(transactionId);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Vodafone Cash callback
 * POST /api/v1/payment/vodafone/callback
 */
export const vodafoneCashCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callback: VodafoneCashCallback = req.body;

    const result = await vodafoneCashService.handleCallback(callback);

    // Update order status if payment successful
    if (result.success) {
      // Find order by transaction ID and update
      // This would need to be implemented in order service
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund Vodafone Cash payment
 * POST /api/v1/payment/vodafone/refund
 */
export const refundVodafoneCash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId, amount, reason } = req.body;

    if (!transactionId || !amount) {
      return errorResponse(res, 'Transaction ID and amount are required', 400);
    }

    const result = await vodafoneCashService.refund({
      originalTransactionId: transactionId,
      amount,
      reason,
    });

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Vodafone Cash merchant balance
 * GET /api/v1/payment/vodafone/balance
 */
export const getVodafoneCashBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await vodafoneCashService.getMerchantBalance();
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * CASH ON DELIVERY
 * الدفع عند الاستلام
 * =====================================================
 */

/**
 * Confirm Cash on Delivery order
 * POST /api/v1/payment/cod/confirm
 */
export const confirmCashOnDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId } = req.body;

    const order = await orderService.getOrderById(userId, orderId);

    // Check COD limit
    const codConfig = PAYMENT_METHODS_CONFIG[PaymentMethod.CASH_ON_DELIVERY];
    if (codConfig.maxAmount && order.total > codConfig.maxAmount) {
      return errorResponse(
        res,
        `Cash on delivery is not available for amounts above ${codConfig.maxAmount} EGP`,
        400
      );
    }

    // Update order with COD payment
    await orderService.updateOrderPaymentStatus(orderId, {
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
    });

    return successResponse(
      res,
      {
        orderId,
        method: 'CASH_ON_DELIVERY',
        amount: order.total,
        message: 'سيتم تحصيل المبلغ عند الاستلام',
      },
      'Cash on delivery confirmed'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark COD as collected
 * POST /api/v1/payment/cod/collected
 */
export const markCodCollected = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, collectedAmount, collectorId } = req.body;

    // This would typically be called by delivery personnel
    await orderService.updateOrderPaymentStatus(orderId, {
      paymentStatus: 'PAID',
      paidAt: new Date(),
      collectedAmount,
      collectorId,
    });

    return successResponse(res, { orderId, status: 'PAID' }, 'Payment collected');
  } catch (error) {
    next(error);
  }
};
