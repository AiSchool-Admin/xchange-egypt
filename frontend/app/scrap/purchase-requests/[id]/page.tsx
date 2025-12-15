'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getPurchaseRequests,
  getRequestOffers,
  submitSellerOffer,
  acceptOffer,
  SCRAP_TYPE_AR,
  METAL_TYPE_AR,
  SCRAP_CONDITION_AR,
  ScrapType,
  MetalType,
  ScrapCondition,
  PurchaseRequest,
  SellerOffer,
} from '@/lib/api/scrap-marketplace';

const SCRAP_TYPE_ICONS: Record<ScrapType, string> = {
  ELECTRONICS: '📱',
  HOME_APPLIANCES: '🔌',
  COMPUTERS: '💻',
  PHONES: '📞',
  CABLES_WIRES: '🔗',
  MOTORS: '⚙️',
  BATTERIES: '🔋',
  METAL_SCRAP: '🔩',
  CAR_PARTS: '🚗',
  FURNITURE_PARTS: '🪑',
  WOOD: '🪵',
  PLASTIC: '♻️',
  TEXTILES: '👕',
  PAPER: '📄',
  GLASS: '🪟',
  CONSTRUCTION: '🏗️',
  INDUSTRIAL: '🏭',
  MEDICAL: '⚕️',
  OTHER: '📦',
};

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [offers, setOffers] = useState<SellerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [offerForm, setOfferForm] = useState({
    offeredWeightKg: '',
    offeredPricePerKg: '',
    offeredTotalPrice: '',
    message: '',
  });

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      // Load request details
      const requestsResult = await getPurchaseRequests({ status: '' });
      const allRequests = requestsResult.data?.requests || requestsResult.requests || [];
      const foundRequest = allRequests.find((r: PurchaseRequest) => r.id === id);

      if (foundRequest) {
        setRequest(foundRequest);
        // Load offers
        try {
          const offersResult = await getRequestOffers(id);
          setOffers(offersResult.data?.offers || offersResult.offers || []);
        } catch (e) {
          // May not have permission to view offers
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerForm.offeredWeightKg || !offerForm.offeredTotalPrice) {
      setError('يرجى ملء الكمية والسعر');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await submitSellerOffer(params.id as string, {
        offeredWeightKg: parseFloat(offerForm.offeredWeightKg),
        offeredPricePerKg: offerForm.offeredPricePerKg
          ? parseFloat(offerForm.offeredPricePerKg)
          : undefined,
        offeredTotalPrice: parseFloat(offerForm.offeredTotalPrice),
        message: offerForm.message || undefined,
      });
      setSuccess('تم تقديم عرضك بنجاح!');
      setShowOfferForm(false);
      setOfferForm({
        offeredWeightKg: '',
        offeredPricePerKg: '',
        offeredTotalPrice: '',
        message: '',
      });
      loadData(params.id as string);
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في تقديم العرض');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm('هل أنت متأكد من قبول هذا العرض؟')) return;

    try {
      await acceptOffer(offerId);
      setSuccess('تم قبول العرض بنجاح!');
      loadData(params.id as string);
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في قبول العرض');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">طلب غير موجود</h2>
          <Link
            href="/scrap/purchase-requests"
            className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            العودة لطلبات الشراء
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/scrap/purchase-requests"
            className="text-white/80 hover:text-white mb-4 inline-block"
          >
            &rarr; العودة لطلبات الشراء
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              {SCRAP_TYPE_ICONS[request.scrapType] || '📦'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{request.title}</h1>
              <div className="flex items-center gap-3 mt-1 opacity-90">
                <span>{SCRAP_TYPE_AR[request.scrapType]}</span>
                {request.metalType && (
                  <>
                    <span>•</span>
                    <span>{METAL_TYPE_AR[request.metalType]}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">تفاصيل الطلب</h2>
                {isExpired(request.expiresAt) ? (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    منتهي
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    نشط
                  </span>
                )}
              </div>

              {request.description && (
                <p className="text-gray-600 mb-6">{request.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">النوع</div>
                  <div className="font-medium">{SCRAP_TYPE_AR[request.scrapType]}</div>
                </div>
                {request.metalType && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">المعدن</div>
                    <div className="font-medium">{METAL_TYPE_AR[request.metalType]}</div>
                  </div>
                )}
                {request.scrapCondition && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">الحالة</div>
                    <div className="font-medium">
                      {SCRAP_CONDITION_AR[request.scrapCondition]}
                    </div>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">الكمية المطلوبة</div>
                  <div className="font-medium">
                    {request.minWeightKg && request.maxWeightKg
                      ? `${request.minWeightKg} - ${request.maxWeightKg} كجم`
                      : request.minWeightKg
                      ? `من ${request.minWeightKg} كجم`
                      : 'غير محدد'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">السعر المعروض</div>
                  <div className="font-bold text-green-600">
                    {request.offeredPricePerKg
                      ? `${request.offeredPricePerKg} ج.م/كجم`
                      : 'قابل للتفاوض'}
                  </div>
                </div>
                {request.governorate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">الموقع</div>
                    <div className="font-medium">
                      {request.city && `${request.city}، `}
                      {request.governorate}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t flex flex-wrap gap-4">
                {request.offersPickup && (
                  <div className="flex items-center gap-2 text-green-600">
                    <span>🚛</span>
                    <span>يوفر خدمة الاستلام</span>
                  </div>
                )}
                {request.isNegotiable && (
                  <div className="flex items-center gap-2 text-indigo-600">
                    <span>💬</span>
                    <span>السعر قابل للتفاوض</span>
                  </div>
                )}
                {request.expiresAt && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>📅</span>
                    <span>ينتهي في {formatDate(request.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Offers Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  العروض المقدمة ({offers.length})
                </h2>
              </div>

              {offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-lg border-2 ${
                        offer.status === 'ACCEPTED'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {offer.seller?.avatar ? (
                              <img
                                src={offer.seller.avatar}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span>👤</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{offer.seller?.fullName || 'بائع'}</div>
                            {offer.seller?.rating && (
                              <div className="text-sm text-gray-500">
                                ⭐ {offer.seller.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          {offer.status === 'ACCEPTED' ? (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              مقبول
                            </span>
                          ) : offer.status === 'REJECTED' ? (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                              مرفوض
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                              قيد المراجعة
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-500">الكمية</div>
                          <div className="font-medium">{offer.offeredWeightKg} كجم</div>
                        </div>
                        <div>
                          <div className="text-gray-500">السعر/كجم</div>
                          <div className="font-medium">
                            {offer.offeredPricePerKg
                              ? `${offer.offeredPricePerKg} ج.م`
                              : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">الإجمالي</div>
                          <div className="font-bold text-green-600">
                            {offer.offeredTotalPrice.toLocaleString()} ج.م
                          </div>
                        </div>
                      </div>

                      {offer.message && (
                        <p className="text-gray-600 text-sm mb-3 p-3 bg-gray-50 rounded">
                          {offer.message}
                        </p>
                      )}

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{formatDate(offer.createdAt)}</span>
                        {offer.status === 'PENDING' && (
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                          >
                            قبول العرض
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>لا توجد عروض حتى الآن</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Submit Offer Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">قدم عرضك</h3>

              {!showOfferForm ? (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">
                    هل لديك الخردة المطلوبة؟ قدم عرضك الآن
                  </p>
                  <button
                    onClick={() => setShowOfferForm(true)}
                    disabled={isExpired(request.expiresAt)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isExpired(request.expiresAt) ? 'الطلب منتهي' : 'قدم عرضك'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">الكمية المتوفرة (كجم) *</label>
                    <input
                      type="number"
                      value={offerForm.offeredWeightKg}
                      onChange={(e) =>
                        setOfferForm((f) => ({ ...f, offeredWeightKg: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">السعر للكيلو (ج.م)</label>
                    <input
                      type="number"
                      value={offerForm.offeredPricePerKg}
                      onChange={(e) =>
                        setOfferForm((f) => ({ ...f, offeredPricePerKg: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">السعر الإجمالي (ج.م) *</label>
                    <input
                      type="number"
                      value={offerForm.offeredTotalPrice}
                      onChange={(e) =>
                        setOfferForm((f) => ({ ...f, offeredTotalPrice: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">رسالة (اختياري)</label>
                    <textarea
                      value={offerForm.message}
                      onChange={(e) => setOfferForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="أضف تفاصيل إضافية..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitOffer}
                      disabled={submitting}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? 'جاري الإرسال...' : 'إرسال العرض'}
                    </button>
                    <button
                      onClick={() => setShowOfferForm(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">معلومات المشتري</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  {request.buyer?.avatar ? (
                    <img
                      src={request.buyer.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🏭</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {request.buyer?.businessName || request.buyer?.fullName || 'مشتري'}
                  </div>
                  {request.buyer?.rating && (
                    <div className="text-sm text-gray-500">
                      ⭐ {request.buyer.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{request.viewsCount}</div>
                  <div className="text-sm text-gray-500">مشاهدة</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{request.offersCount}</div>
                  <div className="text-sm text-gray-500">عرض</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
