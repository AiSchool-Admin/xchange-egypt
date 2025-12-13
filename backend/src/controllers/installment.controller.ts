import { Request, Response, NextFunction } from 'express';
import * as installmentService from '../services/installment.service';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

/**
 * Get available installment plans for an amount
 * GET /api/v1/installments/plans
 */
export const getInstallmentPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.query;

    if (!amount) {
      throw new BadRequestError('يجب تحديد المبلغ');
    }

    const plans = await installmentService.getInstallmentPlans(parseFloat(amount as string));

    return successResponse(res, { plans }, 'تم جلب خطط التقسيط بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate specific installment plan
 * POST /api/v1/installments/calculate
 */
export const calculateInstallment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, provider, months, downPayment } = req.body;

    if (!amount || !provider || !months) {
      throw new BadRequestError('يجب تحديد المبلغ ومزود التقسيط وعدد الأشهر');
    }

    const plan = installmentService.calculateInstallment(
      parseFloat(amount),
      provider,
      parseInt(months, 10),
      downPayment ? parseFloat(downPayment) : undefined
    );

    if (!plan) {
      throw new BadRequestError('خطة التقسيط غير متاحة');
    }

    return successResponse(res, { plan }, 'تم حساب خطة التقسيط بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Check item eligibility for installment
 * GET /api/v1/installments/eligibility/:itemId
 */
export const checkItemEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;

    const eligibility = await installmentService.checkItemEligibility(itemId);

    return successResponse(res, eligibility, 'تم التحقق من أهلية التقسيط');
  } catch (error) {
    next(error);
  }
};

/**
 * Create installment request
 * POST /api/v1/installments/requests
 */
export const createInstallmentRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const {
      itemId,
      provider,
      totalAmount,
      downPayment,
      numberOfMonths,
      phoneNumber,
      nationalId,
      monthlyIncome,
      employerName,
    } = req.body;

    if (!itemId || !provider || !totalAmount || !downPayment || !numberOfMonths || !phoneNumber) {
      throw new BadRequestError('بيانات التقسيط غير مكتملة');
    }

    const request = await installmentService.createInstallmentRequest({
      userId,
      itemId,
      provider,
      totalAmount: parseFloat(totalAmount),
      downPayment: parseFloat(downPayment),
      numberOfMonths: parseInt(numberOfMonths, 10),
      phoneNumber,
      nationalId,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      employerName,
    });

    return successResponse(res, request, 'تم إرسال طلب التقسيط بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's installment requests
 * GET /api/v1/installments/requests/my
 */
export const getUserInstallmentRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await installmentService.getUserInstallmentRequests(
      userId,
      page ? parseInt(page as string, 10) : 1,
      limit ? parseInt(limit as string, 10) : 10
    );

    return successResponse(res, result, 'تم جلب طلبات التقسيط بنجاح');
  } catch (error) {
    next(error);
  }
};
