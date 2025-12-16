'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface SilverTransaction {
  id: string;
  status: string;
  itemPrice: number;
  buyerCommission: number;
  sellerCommission: number;
  totalAmount: number;
  silverPriceAtTransaction: number;
  deliveryMethod: string;
  deliveryAddress?: string;
  escrowStatus?: string;
  escrowHeldAt?: string;
  escrowReleasedAt?: string;
  inspectionStartedAt?: string;
  inspectionEndsAt?: string;
  completedAt?: string;
  buyerNotes?: string;
  disputeReason?: string;
  createdAt: string;
  item: {
    id: string;
    title: string;
    purity: string;
    weightGrams: number;
    images: string[];
    condition: string;
  };
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  buyer: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  deliveryPartner?: {
    id: string;
    name: string;
    nameAr: string;
  };
}

const STATUS_FLOW = [
  { status: 'PENDING', label: 'في انتظار الدفع', icon: '⏳' },
  { status: 'ESCROW_HELD', label: 'المبلغ محجوز', icon: '🔒' },
  { status: 'SHIPPED', label: 'تم الشحن', icon: '📦' },
  { status: 'DELIVERED', label: 'تم التوصيل', icon: '✅' },
  { status: 'COMPLETED', label: 'مكتملة', icon: '🎉' },
];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string; description: string }> = {
  PENDING: {
    label: 'في انتظار الدفع',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: '⏳',
    description: 'يرجى إتمام الدفع لتأكيد الطلب',
  },
  ESCROW_HELD: {
    label: 'المبلغ محجوز في الضمان',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: '🔒',
    description: 'تم حجز المبلغ بأمان، في انتظار شحن البائع',
  },
  SHIPPED: {
    label: 'تم الشحن',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: '📦',
    description: 'القطعة في الطريق إليك',
  },
  DELIVERED: {
    label: 'تم التوصيل - فترة الفحص',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon: '✅',
    description: 'افحص القطعة وأكّد استلامك خلال 48 ساعة',
  },
  COMPLETED: {
    label: 'مكتملة',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: '🎉',
    description: 'تم إتمام المعاملة بنجاح',
  },
  DISPUTED: {
    label: 'نزاع مفتوح',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: '⚠️',
    description: 'فريقنا يراجع النزاع',
  },
  REFUNDED: {
    label: 'تم الاسترداد',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: '↩️',
    description: 'تم استرداد المبلغ للمشتري',
  },
  CANCELLED: {
    label: 'ملغاة',
    color: 'bg-gray-100 text-gray-500 border-gray-300',
    icon: '❌',
    description: 'تم إلغاء المعاملة',
  },
};

const PURITY_LABELS: Record<string, string> = {
  S999: 'فضة نقية 999',
  S925: 'فضة إسترليني 925',
  S900: 'فضة 900',
  S800: 'فضة 800',
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<SilverTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const isPendingPayment = searchParams.get('status') === 'pending_payment';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/silver/orders/' + params.id);
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, txRes] = await Promise.all([
          apiClient.get('/auth/me'),
          apiClient.get(`/silver/transactions`),
        ]);

        setUserId(userRes.data.data.id);

        // Find the specific transaction
        const txList = txRes.data.data || [];
        const tx = txList.find((t: SilverTransaction) => t.id === params.id);

        if (tx) {
          setTransaction(tx);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmDelivery = async () => {
    if (!confirm('هل تؤكد استلام القطعة والموافقة عليها؟ سيتم تحويل المبلغ للبائع.')) {
      return;
    }

    setUpdating(true);
    try {
      await apiClient.put(`/silver/transactions/${params.id}/status`, {
        status: 'COMPLETED',
      });

      // Refresh
      window.location.reload();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('حدث خطأ في تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDispute = async () => {
    const reason = prompt('يرجى وصف المشكلة:');
    if (!reason) return;

    setUpdating(true);
    try {
      await apiClient.put(`/silver/transactions/${params.id}/status`, {
        status: 'DISPUTED',
        notes: reason,
      });

      // Refresh
      window.location.reload();
    } catch (err) {
      console.error('Error opening dispute:', err);
      alert('حدث خطأ في فتح النزاع');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على الطلب</h2>
          <Link href="/silver/orders" className="text-slate-600 hover:underline">
            العودة لقائمة الطلبات
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_LABELS[transaction.status] || STATUS_LABELS.PENDING;
  const isBuyer = transaction.buyer.id === userId;
  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.status === transaction.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/silver/orders" className="text-slate-600 hover:underline text-sm">
            ← العودة للطلبات
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">تفاصيل الطلب</h1>
          <p className="text-gray-500 text-sm">رقم الطلب: {transaction.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Pending Payment Notice */}
        {isPendingPayment && transaction.status === 'PENDING' && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">💳</span>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800 text-lg mb-2">أكمل عملية الدفع</h3>
                <p className="text-yellow-700 mb-4">
                  تم إنشاء طلبك بنجاح. يرجى إتمام الدفع خلال 24 ساعة لتأكيد الطلب.
                </p>
                <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
                  إتمام الدفع الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className={`rounded-xl p-6 mb-6 border-2 ${status.color}`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{status.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{status.label}</h2>
              <p className="text-sm opacity-80">{status.description}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        {!['DISPUTED', 'REFUNDED', 'CANCELLED'].includes(transaction.status) && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">مراحل الطلب</h3>
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.status} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                      >
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${idx < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Item Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">تفاصيل القطعة</h3>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                {transaction.item.images?.[0] ? (
                  <Image
                    src={transaction.item.images[0]}
                    alt={transaction.item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">💍</div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{transaction.item.title}</h4>
                <div className="text-sm text-gray-500 mt-1 space-y-1">
                  <div>{PURITY_LABELS[transaction.item.purity]}</div>
                  <div>{transaction.item.weightGrams} جرام</div>
                </div>
                <Link
                  href={`/silver/${transaction.item.id}`}
                  className="text-slate-600 text-sm hover:underline mt-2 inline-block"
                >
                  عرض القطعة ←
                </Link>
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">تفاصيل السعر</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">سعر القطعة</span>
                <span>{formatPrice(transaction.itemPrice)} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عمولة المشتري</span>
                <span>{formatPrice(transaction.buyerCommission)} ج.م</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>الإجمالي</span>
                <span className="text-slate-700">{formatPrice(transaction.totalAmount)} ج.م</span>
              </div>
            </div>
          </div>

          {/* Seller/Buyer Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">
              {isBuyer ? 'البائع' : 'المشتري'}
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-600">
                {isBuyer
                  ? transaction.seller.fullName.charAt(0)
                  : transaction.buyer.fullName.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {isBuyer ? transaction.seller.fullName : transaction.buyer.fullName}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">معلومات التوصيل</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <span className="font-medium">طريقة التوصيل:</span>{' '}
                {transaction.deliveryMethod === 'HOME_DELIVERY' && 'توصيل للمنزل'}
                {transaction.deliveryMethod === 'PARTNER_PICKUP' && 'استلام من محل شريك'}
                {transaction.deliveryMethod === 'SELLER_MEETUP' && 'مقابلة البائع'}
              </div>
              {transaction.deliveryAddress && (
                <div>
                  <span className="font-medium">العنوان:</span> {transaction.deliveryAddress}
                </div>
              )}
              {transaction.deliveryPartner && (
                <div>
                  <span className="font-medium">محل الاستلام:</span> {transaction.deliveryPartner.nameAr}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h3 className="font-bold text-gray-800 mb-4">سجل الأحداث</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm">📝</div>
              <div>
                <div className="font-medium">تم إنشاء الطلب</div>
                <div className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</div>
              </div>
            </div>
            {transaction.escrowHeldAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">🔒</div>
                <div>
                  <div className="font-medium">تم حجز المبلغ في الضمان</div>
                  <div className="text-sm text-gray-500">{formatDate(transaction.escrowHeldAt)}</div>
                </div>
              </div>
            )}
            {transaction.inspectionStartedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">✅</div>
                <div>
                  <div className="font-medium">تم التوصيل - بدء فترة الفحص</div>
                  <div className="text-sm text-gray-500">{formatDate(transaction.inspectionStartedAt)}</div>
                  {transaction.inspectionEndsAt && (
                    <div className="text-sm text-orange-600">
                      تنتهي فترة الفحص: {formatDate(transaction.inspectionEndsAt)}
                    </div>
                  )}
                </div>
              </div>
            )}
            {transaction.completedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">🎉</div>
                <div>
                  <div className="font-medium">تم إتمام المعاملة</div>
                  <div className="text-sm text-gray-500">{formatDate(transaction.completedAt)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isBuyer && transaction.status === 'DELIVERED' && (
          <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h3 className="font-bold text-gray-800 mb-4">الإجراءات المتاحة</h3>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelivery}
                disabled={updating}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                ✓ تأكيد الاستلام والموافقة
              </button>
              <button
                onClick={handleOpenDispute}
                disabled={updating}
                className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                ⚠️ فتح نزاع
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              لديك حتى {transaction.inspectionEndsAt ? formatDate(transaction.inspectionEndsAt) : '48 ساعة'} لفحص القطعة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
