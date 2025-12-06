'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ReverseAuction {
  id: string;
  title: string;
  description: string;
  condition: string;
  quantity: number;
  maxBudget?: number;
  targetPrice?: number;
  location?: string;
  deliveryPreference?: string;
  status: string;
  totalBids: number;
  lowestBid?: number;
  views: number;
  startDate: string;
  endDate: string;
  publicNotes?: string;
  buyerNotes?: string;
  buyer: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
    totalReviews?: number;
    governorate?: string;
  };
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  bids: Array<{
    id: string;
    bidAmount: number;
    itemCondition: string;
    itemDescription?: string;
    deliveryOption: string;
    deliveryDays?: number;
    deliveryCost?: number;
    notes?: string;
    status: string;
    createdAt: string;
    seller: {
      id: string;
      fullName: string;
      avatar?: string;
      rating?: number;
      totalReviews?: number;
      governorate?: string;
    };
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  ACTIVE: 'نشط',
  ENDED: 'منتهي',
  AWARDED: 'تم الترسية',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  EXPIRED: 'منتهي الصلاحية',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ENDED: 'bg-gray-100 text-gray-800',
  AWARDED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديد',
  LIKE_NEW: 'شبه جديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
  POOR: 'سيء',
};

export default function ReverseAuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [auction, setAuction] = useState<ReverseAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bidding state (for sellers)
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDescription, setBidDescription] = useState('');
  const [bidCondition, setBidCondition] = useState('GOOD');
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState('');

  const auctionId = params.id as string;

  useEffect(() => {
    loadAuction();
  }, [auctionId]);

  const loadAuction = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/reverse-auctions/${auctionId}`);
      setAuction(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المناقصة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setBidError('');

    try {
      await apiClient.post(`/reverse-auctions/${auctionId}/bids`, {
        bidAmount: parseFloat(bidAmount),
        itemCondition: bidCondition,
        itemDescription: bidDescription,
        deliveryOption: 'DELIVERY',
      });
      await loadAuction();
      setShowBidForm(false);
      setBidAmount('');
      setBidDescription('');
    } catch (err: any) {
      setBidError(err.response?.data?.message || 'فشل في تقديم العرض');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAwardBid = async (bidId: string) => {
    if (!confirm('هل أنت متأكد من ترسية المناقصة على هذا العرض؟')) {
      return;
    }

    try {
      await apiClient.post(`/reverse-auctions/${auctionId}/award`, { bidId });
      await loadAuction();
      alert('تم ترسية المناقصة بنجاح!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في ترسية المناقصة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المناقصة...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'المناقصة غير موجودة'}</p>
          <button
            onClick={() => router.push('/reverse-auctions')}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            ← العودة للمناقصات
          </button>
        </div>
      </div>
    );
  }

  const isEnded = new Date(auction.endDate) < new Date();
  const isActive = auction.status === 'ACTIVE' && !isEnded;
  const isBuyer = user?.id === auction.buyer.id;
  const canBid = isActive && !isBuyer && user;
  const userBid = auction.bids.find(b => b.seller.id === user?.id);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/activity"
            className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
          >
            ← العودة للنشاط التجاري
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[auction.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[auction.status] || auction.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {auction.category.nameAr}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">الميزانية القصوى</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {auction.maxBudget?.toLocaleString() || '-'} ج.م
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h2 className="font-semibold text-gray-900 mb-2">الوصف</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">الحالة المطلوبة</p>
                  <p className="font-medium">{CONDITION_LABELS[auction.condition] || auction.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الكمية</p>
                  <p className="font-medium">{auction.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الموقع</p>
                  <p className="font-medium">{auction.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ينتهي في</p>
                  <p className="font-medium">
                    {new Date(auction.endDate).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>

              {auction.publicNotes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>ملاحظات:</strong> {auction.publicNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Bids Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">العروض المقدمة ({auction.bids.length})</h2>
                {auction.lowestBid && (
                  <div className="text-left">
                    <p className="text-sm text-gray-500">أقل عرض</p>
                    <p className="font-bold text-green-600">{auction.lowestBid.toLocaleString()} ج.م</p>
                  </div>
                )}
              </div>

              {auction.bids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>لا توجد عروض بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auction.bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`p-4 rounded-lg border-2 ${
                        index === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {bid.seller.avatar ? (
                              <img src={bid.seller.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-xl">👤</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{bid.seller.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {bid.seller.governorate || 'مصر'}
                              {bid.seller.rating && ` • ⭐ ${bid.seller.rating.toFixed(1)}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={`text-2xl font-bold ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {bid.bidAmount.toLocaleString()} ج.م
                          </p>
                          {index === 0 && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                              أقل عرض
                            </span>
                          )}
                        </div>
                      </div>

                      {bid.itemDescription && (
                        <p className="mt-3 text-gray-700 text-sm">{bid.itemDescription}</p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>الحالة: {CONDITION_LABELS[bid.itemCondition] || bid.itemCondition}</span>
                        {bid.deliveryDays && <span>التوصيل: {bid.deliveryDays} أيام</span>}
                        <span>{new Date(bid.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>

                      {/* Award button for buyer */}
                      {isBuyer && isActive && bid.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAwardBid(bid.id)}
                          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                        >
                          ترسية على هذا العرض
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Buyer Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">صاحب المناقصة</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {auction.buyer.avatar ? (
                      <img src={auction.buyer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{auction.buyer.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {auction.buyer.governorate || 'مصر'}
                      {auction.buyer.rating && ` • ⭐ ${auction.buyer.rating.toFixed(1)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{auction.totalBids}</p>
                  <p className="text-xs text-gray-500">عرض</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">{auction.views}</p>
                  <p className="text-xs text-gray-500">مشاهدة</p>
                </div>
              </div>

              {/* Submit Bid Form */}
              {canBid && !userBid && (
                <>
                  {!showBidForm ? (
                    <button
                      onClick={() => setShowBidForm(true)}
                      className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                    >
                      تقديم عرض
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitBid} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          قيمة العرض (ج.م)
                        </label>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          max={auction.maxBudget}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="أدخل قيمة عرضك"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          حالة المنتج
                        </label>
                        <select
                          value={bidCondition}
                          onChange={(e) => setBidCondition(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="NEW">جديد</option>
                          <option value="LIKE_NEW">شبه جديد</option>
                          <option value="GOOD">جيد</option>
                          <option value="FAIR">مقبول</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          وصف المنتج (اختياري)
                        </label>
                        <textarea
                          value={bidDescription}
                          onChange={(e) => setBidDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="اوصف منتجك..."
                        />
                      </div>

                      {bidError && (
                        <p className="text-red-600 text-sm">{bidError}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                        >
                          {submitting ? 'جاري الإرسال...' : 'إرسال العرض'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBidForm(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* User's existing bid */}
              {userBid && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-800">عرضك الحالي</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {userBid.bidAmount.toLocaleString()} ج.م
                  </p>
                </div>
              )}

              {/* Buyer's view */}
              {isBuyer && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">هذه مناقصتك</p>
                  <p className="text-sm text-blue-600 mt-1">
                    يمكنك ترسية المناقصة على أي عرض من العروض المقدمة
                  </p>
                </div>
              )}

              {/* Ended state */}
              {!isActive && (
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <p className="text-gray-700 font-medium">
                    {auction.status === 'AWARDED' ? 'تم ترسية هذه المناقصة' : 'انتهت هذه المناقصة'}
                  </p>
                </div>
              )}

              {/* Login prompt */}
              {!user && isActive && (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">سجل دخول لتقديم عرض</p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
