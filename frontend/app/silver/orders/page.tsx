'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface SilverTransaction {
  id: string;
  status: string;
  itemPrice: number;
  buyerCommission: number;
  totalAmount: number;
  deliveryMethod: string;
  createdAt: string;
  item: {
    id: string;
    title: string;
    purity: string;
    weightGrams: number;
    images: string[];
  };
  seller: {
    id: string;
    fullName: string;
  };
  buyer: {
    id: string;
    fullName: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'في انتظار الدفع', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  ESCROW_HELD: { label: 'المبلغ محجوز', color: 'bg-blue-100 text-blue-700', icon: '🔒' },
  SHIPPED: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700', icon: '📦' },
  DELIVERED: { label: 'تم التوصيل', color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
  COMPLETED: { label: 'مكتملة', color: 'bg-green-100 text-green-700', icon: '🎉' },
  DISPUTED: { label: 'نزاع مفتوح', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  REFUNDED: { label: 'تم الاسترداد', color: 'bg-gray-100 text-gray-700', icon: '↩️' },
  CANCELLED: { label: 'ملغاة', color: 'bg-gray-100 text-gray-500', icon: '❌' },
};

const PURITY_LABELS: Record<string, string> = {
  S999: 'فضة 999',
  S925: 'فضة 925',
  S900: 'فضة 900',
  S800: 'فضة 800',
};

export default function SilverOrdersPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<SilverTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'purchases' | 'sales'>('all');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/silver/orders');
      return;
    }

    // Get user ID from token or profile
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUserId(res.data.data.id);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/silver/transactions', {
          params: { type: activeTab },
        });
        setTransactions(res.data.data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeTab]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/silver" className="text-slate-600 hover:underline text-sm">
            ← العودة لسوق الفضة
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">طلباتي</h1>
          <p className="text-gray-600">تتبع مشترياتك ومبيعاتك من الفضة</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'purchases', label: 'مشترياتي' },
            { id: 'sales', label: 'مبيعاتي' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'purchases' && 'لم تقم بشراء أي قطعة فضة بعد'}
              {activeTab === 'sales' && 'لم تقم ببيع أي قطعة فضة بعد'}
              {activeTab === 'all' && 'لا توجد معاملات حتى الآن'}
            </p>
            <Link
              href="/silver"
              className="inline-block bg-slate-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-600 transition-colors"
            >
              تصفح سوق الفضة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const status = STATUS_LABELS[tx.status] || STATUS_LABELS.PENDING;
              const isBuyer = tx.buyer.id === userId;

              return (
                <Link
                  key={tx.id}
                  href={`/silver/orders/${tx.id}`}
                  className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                      {tx.item.images?.[0] ? (
                        <Image
                          src={tx.item.images[0]}
                          alt={tx.item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">💍</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-800 line-clamp-1">{tx.item.title}</h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {PURITY_LABELS[tx.item.purity]} • {tx.item.weightGrams}g
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color} flex items-center gap-1 flex-shrink-0`}>
                          <span>{status.icon}</span>
                          <span>{status.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm text-gray-500">
                          {isBuyer ? (
                            <span>شراء من {tx.seller.fullName}</span>
                          ) : (
                            <span>بيع إلى {tx.buyer.fullName}</span>
                          )}
                          <span className="mx-2">•</span>
                          <span>{formatDate(tx.createdAt)}</span>
                        </div>
                        <div className="font-bold text-slate-700">
                          {formatPrice(tx.totalAmount)} ج.م
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
