import apiClient from './client';

// ============================================
// Installment API Client
// عميل API التقسيط
// ============================================

export interface InstallmentPlan {
  months: number;
  monthlyAmount: number;
  interestRate: number;
  totalAmount: number;
  downPayment: number;
  adminFee: number;
}

export interface ProviderPlans {
  provider: string;
  providerNameAr: string;
  plans: InstallmentPlan[];
}

export interface InstallmentRequest {
  id: string;
  userId: string;
  itemId: string;
  provider: string;
  totalAmount: number;
  downPayment: number;
  installmentAmount: number;
  numberOfMonths: number;
  interestRate: number;
  phoneNumber: string;
  nationalId?: string;
  monthlyIncome?: number;
  employerName?: string;
  status: string;
  createdAt: string;
}

export interface CreateInstallmentRequestData {
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

export interface ItemEligibility {
  eligible: boolean;
  reason?: string;
  availableProviders: string[];
}

// Get available installment plans for an amount
export const getInstallmentPlans = async (amount: number): Promise<{
  success: boolean;
  data: { plans: ProviderPlans[] };
}> => {
  const response = await apiClient.get(`/installments/plans?amount=${amount}`);
  return response.data;
};

// Calculate specific installment plan
export const calculateInstallment = async (data: {
  amount: number;
  provider: string;
  months: number;
  downPayment?: number;
}): Promise<{
  success: boolean;
  data: { plan: InstallmentPlan };
}> => {
  const response = await apiClient.post('/installments/calculate', data);
  return response.data;
};

// Check item eligibility for installment
export const checkItemEligibility = async (itemId: string): Promise<{
  success: boolean;
  data: ItemEligibility;
}> => {
  const response = await apiClient.get(`/installments/eligibility/${itemId}`);
  return response.data;
};

// Get user's installment requests
export const getMyInstallmentRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: {
    requests: InstallmentRequest[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/installments/requests/my?${queryParams.toString()}`);
  return response.data;
};

// Create installment request
export const createInstallmentRequest = async (data: CreateInstallmentRequestData): Promise<{
  success: boolean;
  data: InstallmentRequest & { plan: InstallmentPlan };
}> => {
  const response = await apiClient.post('/installments/requests', data);
  return response.data;
};

// Provider display helpers
export const INSTALLMENT_PROVIDERS = {
  VALU: {
    nameAr: 'فاليو',
    nameEn: 'Valu',
    logo: '💳',
    color: 'purple',
    description: 'تقسيط حتى 36 شهر',
  },
  CONTACT: {
    nameAr: 'كونتكت',
    nameEn: 'Contact',
    logo: '📱',
    color: 'blue',
    description: 'تقسيط حتى 24 شهر',
  },
  SOUHOOLA: {
    nameAr: 'سهولة',
    nameEn: 'Souhoola',
    logo: '✨',
    color: 'green',
    description: 'تقسيط سهل وبسيط',
  },
  PREMIUM: {
    nameAr: 'بريميوم',
    nameEn: 'Premium',
    logo: '👑',
    color: 'gold',
    description: 'للمبالغ الكبيرة حتى 48 شهر',
  },
};

export const INSTALLMENT_STATUSES = {
  PENDING: { label: 'قيد المراجعة', color: 'yellow', icon: '⏳' },
  APPROVED: { label: 'موافق', color: 'green', icon: '✅' },
  REJECTED: { label: 'مرفوض', color: 'red', icon: '❌' },
  ACTIVE: { label: 'نشط', color: 'blue', icon: '📊' },
  COMPLETED: { label: 'مكتمل', color: 'gray', icon: '🎉' },
  CANCELLED: { label: 'ملغي', color: 'gray', icon: '🚫' },
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
