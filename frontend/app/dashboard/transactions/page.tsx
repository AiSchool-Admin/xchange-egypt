'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  deliveryStatus: string;
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
  listing?: {
    id: string;
    item?: {
      id: string;
      title: string;
      images?: Array<{ url: string; isPrimary?: boolean }>;
    };
  };
  buyer?: {
    id: string;
    fullName: string;
    businessName?: string;
  };
  seller?: {
    id: string;
    fullName: string;
    businessName?: string;
  };
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  DIRECT_SALE: 'بيع مباشر',
  AUCTION: 'مزاد',
  BARTER: 'مقايضة',
};

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'purchases'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, activeTab]);

  // Auto-select transaction from URL parameter
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && transactions.length > 0) {
      const tx = transactions.find(t => t.id === selectedId);
      if (tx) {
        setSelectedTransaction(tx);
      } else {
        // Transaction not in current list, try to load it
        loadTransactionById(selectedId);
      }
    }
  }, [searchParams, transactions]);

  const loadTransactionById = async (id: string) => {
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      if (response.data.data) {
        setSelectedTransaction(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load transaction:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      let url = '/transactions/my';
      if (activeTab === 'sales') {
        url += '?role=seller';
      } else if (activeTab === 'purchases') {
        url += '?role=buyer';
      }

      const response = await apiClient.get(url);
      const data = response.data;
      setTransactions(data.data?.transactions || data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      if (err.response?.status === 401) {
        setError('يرجى تسجيل الدخول مرة أخرى');
      } else {
        setError('فشل في تحميل المعاملات');
      }
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (transaction: Transaction) => {
    const images = transaction.listing?.item?.images;
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.isPrimary);
    return primary?.url || images[0]?.url;
  };

  const getOtherParty = (transaction: Transaction) => {
    if (!user) return null;
    if (transaction.buyer?.id === user.id) {
      return { role: 'البائع', ...transaction.seller };
    }
    return { role: 'المشتري', ...transaction.buyer };
  };

  const getMyRole = (transaction: Transaction) => {
    if (!user) return '';
    return transaction.buyer?.id === user.id ? 'مشتري' : 'بائع';
  };

  const isSeller = (transaction: Transaction) => transaction.seller?.id === user?.id;
  const isBuyer = (transaction: Transaction) => transaction.buyer?.id === user?.id;

  // Action handlers
  const handleConfirmPayment = async (transactionId: string) => {
    try {
      await apiClient.post(`/transactions/${transactionId}/confirm-payment`);
      fetchTransactions();
      if (selectedTransaction?.id === transactionId) {
        const response = await apiClient.get(`/transactions/${transactionId}`);
        setSelectedTransaction(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to confirm payment:', err);
      alert(err.response?.data?.message || 'فشل في تأكيد الدفع');
    }
  };

  const handleMarkAsShipped = async (transactionId: string) => {
    try {
      await apiClient.post(`/transactions/${transactionId}/ship`);
      fetchTransactions();
      if (selectedTransaction?.id === transactionId) {
        const response = await apiClient.get(`/transactions/${transactionId}`);
        setSelectedTransaction(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to mark as shipped:', err);
      alert(err.response?.data?.message || 'فشل في تحديث حالة الشحن');
    }
  };

  const handleMarkAsDelivered = async (transactionId: string) => {
    try {
      await apiClient.post(`/transactions/${transactionId}/deliver`);
      fetchTransactions();
      if (selectedTransaction?.id === transactionId) {
        const response = await apiClient.get(`/transactions/${transactionId}`);
        setSelectedTransaction(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to mark as delivered:', err);
      alert(err.response?.data?.message || 'فشل في تأكيد التسليم');
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذه المعاملة؟')) return;
    try {
      await apiClient.post(`/transactions/${transactionId}/cancel`);
      fetchTransactions();
      if (selectedTransaction?.id === transactionId) {
        const response = await apiClient.get(`/transactions/${transactionId}`);
        setSelectedTransaction(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to cancel transaction:', err);
      alert(err.response?.data?.message || 'فشل في إلغاء المعاملة');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">💰 معاملاتي</h1>
            <Link href="/dashboard" className="text-primary-600 hover:underline">
              العودة للداشبورد
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 الكل
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💵 مبيعاتي
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'purchases'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🛒 مشترياتي
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المعاملات...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
            <button
              onClick={fetchTransactions}
              className="mr-4 text-red-800 underline hover:no-underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'sales' ? '💵' : activeTab === 'purchases' ? '🛒' : '📊'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'sales'
                ? 'لا توجد مبيعات بعد'
                : activeTab === 'purchases'
                ? 'لا توجد مشتريات بعد'
                : 'لا توجد معاملات بعد'}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'sales'
                ? 'ابدأ ببيع منتجاتك لتظهر هنا'
                : activeTab === 'purchases'
                ? 'ابدأ بالتسوق لتظهر مشترياتك هنا'
                : 'قم بإجراء معاملات لتظهر هنا'}
            </p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Transactions List */}
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const otherParty = getOtherParty(transaction);
                const myRole = getMyRole(transaction);
                const itemImage = getItemImage(transaction);

                return (
                  <div
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction)}
                    className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                      selectedTransaction?.id === transaction.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={transaction.listing?.item?.title || 'منتج'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {transaction.listing?.item?.title || 'منتج'}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              myRole === 'بائع' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {myRole}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {otherParty?.role}: {otherParty?.fullName || otherParty?.businessName || 'غير معروف'}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary-600">
                            {transaction.amount?.toLocaleString()} ج.م
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${PAYMENT_STATUS_COLORS[transaction.paymentStatus]}`}>
                            {transaction.paymentStatus === 'PENDING' ? 'في الانتظار' :
                             transaction.paymentStatus === 'COMPLETED' ? 'مكتمل' :
                             transaction.paymentStatus === 'FAILED' ? 'فشل' : transaction.paymentStatus}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{TRANSACTION_TYPE_LABELS[transaction.transactionType] || transaction.transactionType}</span>
                          <span>{new Date(transaction.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Transaction Details */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              {selectedTransaction ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4">تفاصيل المعاملة</h2>

                  {/* Item */}
                  <div className="flex gap-4 mb-4 pb-4 border-b">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      {getItemImage(selectedTransaction) ? (
                        <img
                          src={getItemImage(selectedTransaction)!}
                          alt={selectedTransaction.listing?.item?.title || 'منتج'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                          📦
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedTransaction.listing?.item?.title || 'منتج'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {TRANSACTION_TYPE_LABELS[selectedTransaction.transactionType] || selectedTransaction.transactionType}
                      </p>
                      <p className="text-xl font-bold text-primary-600 mt-1">
                        {selectedTransaction.amount?.toLocaleString()} ج.م
                      </p>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">البائع</p>
                      <p className="font-medium">
                        {selectedTransaction.seller?.fullName || selectedTransaction.seller?.businessName || 'غير معروف'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">المشتري</p>
                      <p className="font-medium">
                        {selectedTransaction.buyer?.fullName || selectedTransaction.buyer?.businessName || 'غير معروف'}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-3 mb-4 pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">حالة الدفع</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${PAYMENT_STATUS_COLORS[selectedTransaction.paymentStatus]}`}>
                        {selectedTransaction.paymentStatus === 'PENDING' ? 'في الانتظار' :
                         selectedTransaction.paymentStatus === 'COMPLETED' ? 'مكتمل' :
                         selectedTransaction.paymentStatus === 'FAILED' ? 'فشل' : selectedTransaction.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">حالة التسليم</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${DELIVERY_STATUS_COLORS[selectedTransaction.deliveryStatus]}`}>
                        {selectedTransaction.deliveryStatus === 'PENDING' ? 'في الانتظار' :
                         selectedTransaction.deliveryStatus === 'SHIPPED' ? 'تم الشحن' :
                         selectedTransaction.deliveryStatus === 'DELIVERED' ? 'تم التسليم' :
                         selectedTransaction.deliveryStatus === 'CANCELLED' ? 'ملغي' : selectedTransaction.deliveryStatus}
                      </span>
                    </div>
                    {selectedTransaction.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">طريقة الدفع</span>
                        <span className="font-medium">{selectedTransaction.paymentMethod}</span>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-sm mb-4 pb-4 border-b">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإنشاء</span>
                      <span>{new Date(selectedTransaction.createdAt).toLocaleString('ar-EG')}</span>
                    </div>
                    {selectedTransaction.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الإكمال</span>
                        <span>{new Date(selectedTransaction.completedAt).toLocaleString('ar-EG')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">الإجراءات المتاحة</h3>

                    {/* Seller: Mark as Shipped */}
                    {isSeller(selectedTransaction) &&
                     selectedTransaction.paymentStatus === 'COMPLETED' &&
                     selectedTransaction.deliveryStatus === 'PENDING' && (
                      <button
                        onClick={() => handleMarkAsShipped(selectedTransaction.id)}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🚚</span>
                        تم الشحن
                      </button>
                    )}

                    {/* Buyer: Confirm Payment */}
                    {isBuyer(selectedTransaction) &&
                     selectedTransaction.paymentStatus === 'PENDING' && (
                      <button
                        onClick={() => handleConfirmPayment(selectedTransaction.id)}
                        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>💳</span>
                        تأكيد الدفع
                      </button>
                    )}

                    {/* Buyer: Confirm Delivery */}
                    {isBuyer(selectedTransaction) &&
                     selectedTransaction.deliveryStatus === 'SHIPPED' && (
                      <button
                        onClick={() => handleMarkAsDelivered(selectedTransaction.id)}
                        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>✅</span>
                        تأكيد الاستلام
                      </button>
                    )}

                    {/* Cancel - available for both if not completed/cancelled */}
                    {selectedTransaction.deliveryStatus !== 'DELIVERED' &&
                     selectedTransaction.deliveryStatus !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelTransaction(selectedTransaction.id)}
                        className="w-full py-3 px-4 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>❌</span>
                        إلغاء المعاملة
                      </button>
                    )}

                    {/* Show message if no actions available */}
                    {selectedTransaction.deliveryStatus === 'DELIVERED' && (
                      <div className="text-center py-4 bg-green-50 rounded-lg text-green-700">
                        <span className="text-2xl block mb-2">✅</span>
                        تم إكمال هذه المعاملة بنجاح
                      </div>
                    )}

                    {selectedTransaction.deliveryStatus === 'CANCELLED' && (
                      <div className="text-center py-4 bg-red-50 rounded-lg text-red-700">
                        <span className="text-2xl block mb-2">❌</span>
                        تم إلغاء هذه المعاملة
                      </div>
                    )}

                    {/* Waiting for other party messages */}
                    {isSeller(selectedTransaction) &&
                     selectedTransaction.paymentStatus === 'PENDING' && (
                      <div className="text-center py-3 bg-yellow-50 rounded-lg text-yellow-700">
                        <span className="text-xl block mb-1">⏳</span>
                        في انتظار تأكيد الدفع من المشتري
                      </div>
                    )}

                    {isBuyer(selectedTransaction) &&
                     selectedTransaction.paymentStatus === 'COMPLETED' &&
                     selectedTransaction.deliveryStatus === 'PENDING' && (
                      <div className="text-center py-3 bg-yellow-50 rounded-lg text-yellow-700">
                        <span className="text-xl block mb-1">⏳</span>
                        في انتظار شحن المنتج من البائع
                      </div>
                    )}

                    {isSeller(selectedTransaction) &&
                     selectedTransaction.deliveryStatus === 'SHIPPED' && (
                      <div className="text-center py-3 bg-blue-50 rounded-lg text-blue-700">
                        <span className="text-xl block mb-1">🚚</span>
                        تم الشحن - في انتظار تأكيد الاستلام من المشتري
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-gray-600">اختر معاملة لعرض التفاصيل</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
