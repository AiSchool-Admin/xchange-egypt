import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';

// ============================================
// Installment Service
// خدمة التقسيط (Valu وغيرها)
// ============================================

interface InstallmentPlan {
  months: number;
  monthlyAmount: number;
  interestRate: number;
  totalAmount: number;
  downPayment: number;
  adminFee: number;
}

interface CreateInstallmentRequestParams {
  userId: string;
  itemId: string;
  provider: string;
  totalAmount: number;
  downPayment: number;
  numberOfMonths: number;
  phoneNumber: string;
  nationalId?: string;
  monthlyIncome?: number;
  employerName?: string;
}

// Provider configurations
const INSTALLMENT_PROVIDERS: Record<string, {
  nameAr: string;
  minAmount: number;
  maxAmount: number;
  interestRates: Record<number, number>;
  adminFeeRate: number;
  minDownPaymentRate: number;
  availableMonths: number[];
}> = {
  VALU: {
    nameAr: 'فاليو',
    minAmount: 500,
    maxAmount: 200000,
    interestRates: { 6: 0.08, 12: 0.12, 18: 0.16, 24: 0.20, 36: 0.25 },
    adminFeeRate: 0.02,
    minDownPaymentRate: 0.1,
    availableMonths: [6, 12, 18, 24, 36],
  },
  CONTACT: {
    nameAr: 'كونتكت',
    minAmount: 1000,
    maxAmount: 150000,
    interestRates: { 6: 0.07, 12: 0.11, 18: 0.15, 24: 0.19 },
    adminFeeRate: 0.025,
    minDownPaymentRate: 0.15,
    availableMonths: [6, 12, 18, 24],
  },
  SOUHOOLA: {
    nameAr: 'سهولة',
    minAmount: 500,
    maxAmount: 100000,
    interestRates: { 6: 0.09, 12: 0.13, 18: 0.17, 24: 0.21 },
    adminFeeRate: 0.03,
    minDownPaymentRate: 0.2,
    availableMonths: [6, 12, 18, 24],
  },
  PREMIUM: {
    nameAr: 'بريميوم',
    minAmount: 2000,
    maxAmount: 500000,
    interestRates: { 6: 0.06, 12: 0.10, 18: 0.14, 24: 0.18, 36: 0.22, 48: 0.26 },
    adminFeeRate: 0.015,
    minDownPaymentRate: 0.1,
    availableMonths: [6, 12, 18, 24, 36, 48],
  },
};

/**
 * Get available installment plans for an amount
 */
export const getInstallmentPlans = async (amount: number): Promise<{ provider: string; providerNameAr: string; plans: InstallmentPlan[] }[]> => {
  const allPlans: { provider: string; providerNameAr: string; plans: InstallmentPlan[] }[] = [];

  for (const [providerKey, config] of Object.entries(INSTALLMENT_PROVIDERS)) {
    if (amount < config.minAmount || amount > config.maxAmount) {
      continue;
    }

    const plans: InstallmentPlan[] = [];

    for (const months of config.availableMonths) {
      const interestRate = config.interestRates[months];
      const minDownPayment = Math.ceil(amount * config.minDownPaymentRate);
      const financedAmount = amount - minDownPayment;
      const totalInterest = financedAmount * interestRate;
      const adminFee = amount * config.adminFeeRate;
      const totalAmount = financedAmount + totalInterest + adminFee;
      const monthlyAmount = Math.ceil(totalAmount / months);

      plans.push({
        months,
        monthlyAmount,
        interestRate: interestRate * 100,
        totalAmount: totalAmount + minDownPayment,
        downPayment: minDownPayment,
        adminFee: Math.ceil(adminFee),
      });
    }

    allPlans.push({
      provider: providerKey,
      providerNameAr: config.nameAr,
      plans,
    });
  }

  return allPlans;
};

/**
 * Calculate specific installment plan
 */
export const calculateInstallment = (
  amount: number,
  provider: string,
  months: number,
  customDownPayment?: number
): InstallmentPlan | null => {
  const config = INSTALLMENT_PROVIDERS[provider];
  if (!config) return null;

  if (amount < config.minAmount || amount > config.maxAmount) return null;
  if (!config.availableMonths.includes(months)) return null;

  const minDownPayment = Math.ceil(amount * config.minDownPaymentRate);
  const downPayment = customDownPayment ? Math.max(customDownPayment, minDownPayment) : minDownPayment;
  const financedAmount = amount - downPayment;

  if (financedAmount <= 0) return null;

  const interestRate = config.interestRates[months];
  const totalInterest = financedAmount * interestRate;
  const adminFee = amount * config.adminFeeRate;
  const totalFinanced = financedAmount + totalInterest + adminFee;
  const monthlyAmount = Math.ceil(totalFinanced / months);

  return {
    months,
    monthlyAmount,
    interestRate: interestRate * 100,
    totalAmount: totalFinanced + downPayment,
    downPayment,
    adminFee: Math.ceil(adminFee),
  };
};

/**
 * Create installment request
 */
export const createInstallmentRequest = async (params: CreateInstallmentRequestParams): Promise<any> => {
  const config = INSTALLMENT_PROVIDERS[params.provider];
  if (!config) {
    throw new BadRequestError('مزود التقسيط غير صحيح');
  }

  if (params.totalAmount < config.minAmount || params.totalAmount > config.maxAmount) {
    throw new BadRequestError(`المبلغ يجب أن يكون بين ${config.minAmount} و ${config.maxAmount} جنيه`);
  }

  if (!config.availableMonths.includes(params.numberOfMonths)) {
    throw new BadRequestError(`عدد الأشهر غير متاح. الخيارات المتاحة: ${config.availableMonths.join(', ')}`);
  }

  const minDownPayment = params.totalAmount * config.minDownPaymentRate;
  if (params.downPayment < minDownPayment) {
    throw new BadRequestError(`الحد الأدنى للمقدم هو ${Math.ceil(minDownPayment)} جنيه`);
  }

  const item = await prisma.item.findUnique({
    where: { id: params.itemId },
  });

  if (!item) {
    throw new NotFoundError('المنتج غير موجود');
  }

  const plan = calculateInstallment(params.totalAmount, params.provider, params.numberOfMonths, params.downPayment);
  if (!plan) {
    throw new BadRequestError('خطأ في حساب التقسيط');
  }

  const request = await prisma.installmentRequest.create({
    data: {
      userId: params.userId,
      itemId: params.itemId,
      provider: params.provider as any,
      totalAmount: params.totalAmount,
      downPayment: params.downPayment,
      installmentAmount: plan.monthlyAmount,
      numberOfMonths: params.numberOfMonths,
      interestRate: plan.interestRate,
      phoneNumber: params.phoneNumber,
      nationalId: params.nationalId,
      monthlyIncome: params.monthlyIncome,
      employerName: params.employerName,
      status: 'PENDING',
    },
  });

  return { ...request, plan };
};

/**
 * Get user's installment requests
 */
export const getUserInstallmentRequests = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.installmentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.installmentRequest.count({ where: { userId } }),
  ]);

  return {
    requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Check item eligibility for installment
 */
export const checkItemEligibility = async (itemId: string): Promise<{
  eligible: boolean;
  reason?: string;
  availableProviders: string[];
}> => {
  const item = await prisma.item.findUnique({ where: { id: itemId } });

  if (!item) {
    return { eligible: false, reason: 'المنتج غير موجود', availableProviders: [] };
  }

  const amount = item.estimatedValue;
  const availableProviders: string[] = [];

  for (const [providerKey, config] of Object.entries(INSTALLMENT_PROVIDERS)) {
    if (amount >= config.minAmount && amount <= config.maxAmount) {
      availableProviders.push(providerKey);
    }
  }

  if (availableProviders.length === 0) {
    return {
      eligible: false,
      reason: 'المبلغ خارج نطاق التقسيط المتاح',
      availableProviders: [],
    };
  }

  return { eligible: true, availableProviders };
};

export default {
  getInstallmentPlans,
  calculateInstallment,
  createInstallmentRequest,
  getUserInstallmentRequests,
  checkItemEligibility,
};
