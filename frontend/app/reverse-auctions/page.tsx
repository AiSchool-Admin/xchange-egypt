'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface ReverseAuction {
  id: string;
  title: string;
  description: string;
  maxBudget: number;
  status: string;
  startDate: string;
  endDate: string;
  _count?: {
    bids: number;
  };
  lowestBid?: number;
  buyer: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export default function ReverseAuctionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [reverseAuctions, setReverseAuctions] = useState<ReverseAuction[]>([]);
  const [allReverseAuctions, setAllReverseAuctions] = useState<ReverseAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load my reverse auctions (as buyer)
      if (user) {
        const myResponse = await apiClient.get(`/reverse-auctions?buyerId=${user.id}`);
        const myData = myResponse.data.data || myResponse.data || {};
        setReverseAuctions(myData.items || myData.reverseAuctions || []);
      }

      // Load all active reverse auctions (for sellers to bid on)
      const allResponse = await apiClient.get('/reverse-auctions?status=ACTIVE');
      const allData = allResponse.data.data || allResponse.data || {};
      setAllReverseAuctions(allData.items || allData.reverseAuctions || []);
    } catch (err: any) {
      console.error('Error loading reverse auctions:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', text: 'مسودة' },
      ACTIVE: { color: 'bg-green-100 text-green-800', text: 'نشط' },
      ENDED: { color: 'bg-blue-100 text-blue-800', text: 'منتهي' },
      AWARDED: { color: 'bg-purple-100 text-purple-800', text: 'تمت الترسية' },
      CANCELLED: { color: 'bg-red-100 text-red-800', text: 'ملغي' },
      NO_BIDS: { color: 'bg-orange-100 text-orange-800', text: 'بدون عروض' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  const isEnded = (endDate: string) => new Date(endDate) < new Date();
  const hasStarted = (startDate: string) => new Date(startDate) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">المناقصات (طلبات الشراء)</h1>
              <p className="text-gray-600 mt-1">أنشئ طلب شراء ودع البائعين يتنافسون على تقديم أفضل سعر</p>
            </div>
            <Link
              href="/items/new?type=REVERSE_AUCTION"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <span>+</span>
              <span>إنشاء طلب شراء جديد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'my'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            طلباتي ({reverseAuctions.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'all'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            طلبات متاحة للتقديم ({allReverseAuctions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        {activeTab === 'my' && (
          <div>
            {reverseAuctions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات شراء</h3>
                <p className="text-gray-600 mb-6">أنشئ طلب شراء جديد ودع البائعين يتنافسون على تقديم أفضل سعر لك</p>
                <Link
                  href="/items/new?type=REVERSE_AUCTION"
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  إنشاء طلب شراء
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reverseAuctions.map((ra) => (
                  <Link
                    key={ra.id}
                    href={`/reverse-auctions/${ra.id}`}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{ra.title}</h3>
                      {getStatusBadge(ra.status)}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{ra.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">السعر المستهدف:</span>
                        <span className="font-bold text-purple-600">{ra.maxBudget?.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">عدد العروض:</span>
                        <span className="font-medium">{ra._count?.bids || 0}</span>
                      </div>
                      {ra.lowestBid && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">أقل عرض:</span>
                          <span className="font-bold text-green-600">{ra.lowestBid.toLocaleString()} ج.م</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      {ra.status === 'ACTIVE' && !isEnded(ra.endDate) ? (
                        <span className="text-green-600">ينتهي: {new Date(ra.endDate).toLocaleDateString('ar-EG')}</span>
                      ) : (
                        <span>انتهى: {new Date(ra.endDate).toLocaleDateString('ar-EG')}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            {allReverseAuctions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات متاحة حالياً</h3>
                <p className="text-gray-600">تحقق لاحقاً للعثور على طلبات شراء جديدة يمكنك التقديم عليها</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allReverseAuctions.map((ra) => (
                  <Link
                    key={ra.id}
                    href={`/reverse-auctions/${ra.id}`}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-2 border-transparent hover:border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{ra.title}</h3>
                      {getStatusBadge(ra.status)}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{ra.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">الميزانية:</span>
                        <span className="font-bold text-purple-600">{ra.maxBudget?.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">المشتري:</span>
                        <span className="font-medium">{ra.buyer?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">العروض:</span>
                        <span className="font-medium">{ra._count?.bids || 0} عرض</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <button className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-200 transition">
                        قدم عرضك الآن
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
