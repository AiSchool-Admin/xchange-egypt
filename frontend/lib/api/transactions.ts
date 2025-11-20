import apiClient from './client';

export interface BuyItemData {
  itemId: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'INSTAPAY' | 'VODAFONE_CASH';
  shippingAddress: string;
  phoneNumber: string;
  notes?: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  images: { id: string; url: string }[];
  condition: string;
}

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus: string;
  trackingNumber?: string;
  shippingAddress?: string;
  phoneNumber?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  buyer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  seller: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    businessName?: string;
  };
  listing?: {
    item: TransactionItem;
  };
}

export interface BuyItemResponse {
  success: boolean;
  data: {
    transaction: Transaction;
    item: any;
    message: string;
  };
  message: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
  message: string;
}

// Buy an item directly
export const buyItem = async (data: BuyItemData): Promise<BuyItemResponse> => {
  const response = await apiClient.post('/transactions/buy-item', data);
  return response.data;
};

// Get my transactions
export const getMyTransactions = async (role?: 'buyer' | 'seller'): Promise<TransactionsResponse> => {
  const params = role ? { role } : {};
  const response = await apiClient.get('/transactions/my', { params });
  return response.data;
};

// Get transaction by ID
export const getTransaction = async (id: string): Promise<TransactionResponse> => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
};

// Confirm payment
export const confirmPayment = async (id: string): Promise<TransactionResponse> => {
  const response = await apiClient.post(`/transactions/${id}/confirm-payment`);
  return response.data;
};

// Mark as shipped (seller only)
export const markAsShipped = async (id: string, trackingNumber?: string): Promise<TransactionResponse> => {
  const response = await apiClient.post(`/transactions/${id}/ship`, { trackingNumber });
  return response.data;
};

// Mark as delivered (buyer confirms)
export const markAsDelivered = async (id: string): Promise<TransactionResponse> => {
  const response = await apiClient.post(`/transactions/${id}/deliver`);
  return response.data;
};

// Cancel transaction
export const cancelTransaction = async (id: string, reason: string): Promise<TransactionResponse> => {
  const response = await apiClient.post(`/transactions/${id}/cancel`, { reason });
  return response.data;
};
