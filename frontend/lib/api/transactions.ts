import apiClient from './client';

export interface BuyItemData {
  itemId: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'INSTAPAY' | 'VODAFONE_CASH';
  shippingAddress: string;
  phoneNumber: string;
  notes?: string;
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
  createdAt: string;
  buyer: {
    id: string;
    fullName: string;
    email: string;
  };
  seller: {
    id: string;
    fullName: string;
    email: string;
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

// Buy an item directly
export const buyItem = async (data: BuyItemData): Promise<BuyItemResponse> => {
  const response = await apiClient.post('/transactions/buy-item', data);
  return response.data;
};

// Get my transactions
export const getMyTransactions = async (): Promise<TransactionsResponse> => {
  const response = await apiClient.get('/transactions/my');
  return response.data;
};

// Get transaction by ID
export const getTransaction = async (id: string): Promise<{ success: boolean; data: Transaction }> => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
};
