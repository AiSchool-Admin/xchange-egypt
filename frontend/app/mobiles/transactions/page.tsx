'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Package, Truck, CheckCircle, AlertCircle,
  Clock, Shield, MessageCircle, FileText, Eye, Phone,
  MapPin, Calendar, CreditCard, RefreshCw, X, ChevronDown
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'BARTER';
  status: string;
  price: number;
  escrowAmount: number;
  escrowStatus: string;
  deliveryMethod: string;
  listing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    images: string[];
    condition: string;
  };
  buyer: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  seller: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  meetupLocation?: string;
  shippingAddress?: string;
  inspectionDeadline?: string;
  createdAt: string;
  completedAt?: string;
  iAmSeller: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  'PENDING_PAYMENT': { label: 'في انتظار الدفع', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: CreditCard },
  'PAYMENT_RECEIVED': { label: 'تم استلام الدفع', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  'PENDING_SHIPMENT': { label: 'في انتظار الشحن', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Package },
  'SHIPPED': { label: 'تم الشحن', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Truck },
  'DELIVERED': { label: 'تم التوصيل', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: CheckCircle },
  'IN_INSPECTION': { label: 'فترة الفحص', color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: Eye },
  'COMPLETED': { label: 'مكتمل', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  'DISPUTED': { label: 'نزاع', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle },
  'CANCELLED': { label: 'ملغي', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: X },
  'REFUNDED': { label: 'مسترد', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: RefreshCw },
};

export default function MobileTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sales' | 'purchases' | 'barter'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: string; transactionId: string } | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [filter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter.toUpperCase());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (transactionId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/transactions/${transactionId}/confirm-delivery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowConfirmModal(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error confirming delivery:', error);
    }
  };

  const handleReleaseEscrow = async (transactionId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/transactions/${transactionId}/release-escrow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowConfirmModal(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error releasing escrow:', error);
    }
  };

  const getStatusProgress = (status: string): number => {
    const stages = ['PENDING_PAYMENT', 'PAYMENT_RECEIVED', 'PENDING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'IN_INSPECTION', 'COMPLETED'];
    const index = stages.indexOf(status);
    return index >= 0 ? ((index + 1) / stages.length) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">معاملاتي</h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Type Filter */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'sales', label: 'مبيعاتي' },
                { value: 'purchases', label: 'مشترياتي' },
                { value: 'barter', label: 'مقايضات' },
              ].map(item => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === item.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">كل الحالات</option>
              <option value="PENDING_PAYMENT">في انتظار الدفع</option>
              <option value="PAYMENT_RECEIVED">تم الدفع</option>
              <option value="SHIPPED">تم الشحن</option>
              <option value="IN_INSPECTION">فترة الفحص</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="DISPUTED">نزاع</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد معاملات</h3>
            <p className="text-gray-500 mb-6">ستظهر هنا جميع عمليات البيع والشراء والمقايضة</p>
            <Link
              href="/mobiles"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700"
            >
              تصفح الإعلانات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(transaction => {
              const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG['PENDING_PAYMENT'];
              const StatusIcon = statusConfig.icon;
              const progress = getStatusProgress(transaction.status);

              return (
                <div key={transaction.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Transaction Header */}
                  <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{transaction.id.slice(0, 8)}
                      </span>
                      {transaction.type === 'BARTER' && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                          مقايضة
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {!['COMPLETED', 'CANCELLED', 'REFUNDED', 'DISPUTED'].includes(transaction.status) && (
                    <div className="px-6 py-3 bg-gray-50">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Listing Info */}
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                          <Image
                            src={transaction.listing?.images?.[0] || '/images/mobile-placeholder.jpg'}
                            alt={transaction.listing?.title || ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">{transaction.listing?.title}</h3>
                          <p className="text-gray-500 text-sm">{transaction.listing?.brand} {transaction.listing?.model}</p>
                          <p className="text-xl font-bold text-indigo-600 mt-2">
                            {(transaction.price || 0).toLocaleString('ar-EG')} ج.م
                          </p>
                        </div>
                      </div>

                      {/* Other Party Info */}
                      <div className="md:mr-auto">
                        <p className="text-sm text-gray-500 mb-2">
                          {transaction.iAmSeller ? 'المشتري' : 'البائع'}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                            <p className="font-medium">
                              {transaction.iAmSeller ? transaction.buyer.name : transaction.seller.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              تقييم: {((transaction.iAmSeller ? transaction.buyer?.rating : transaction.seller?.rating) || 0).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Info */}
                    {transaction.escrowStatus !== 'RELEASED' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-green-700 font-medium">
                            محفوظ في Escrow: {(transaction.escrowAmount || 0).toLocaleString('ar-EG')} ج.م
                          </p>
                          {transaction.inspectionDeadline && (
                            <p className="text-sm text-green-600">
                              موعد انتهاء الفحص: {new Date(transaction.inspectionDeadline).toLocaleDateString('ar-EG')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delivery Info */}
                    {transaction.deliveryMethod === 'meetup' && transaction.meetupLocation && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-blue-700 font-medium">نقطة التسليم</p>
                          <p className="text-sm text-blue-600">{transaction.meetupLocation}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        التفاصيل
                      </button>

                      <Link
                        href={`/chat/${transaction.iAmSeller ? transaction.buyer.id : transaction.seller.id}`}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        محادثة
                      </Link>

                      {/* Buyer Actions */}
                      {!transaction.iAmSeller && transaction.status === 'SHIPPED' && (
                        <button
                          onClick={() => setShowConfirmModal({ type: 'delivery', transactionId: transaction.id })}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تأكيد الاستلام
                        </button>
                      )}

                      {!transaction.iAmSeller && transaction.status === 'IN_INSPECTION' && (
                        <>
                          <button
                            onClick={() => setShowConfirmModal({ type: 'release', transactionId: transaction.id })}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            الجهاز سليم - إتمام المعاملة
                          </button>
                          <Link
                            href={`/mobiles/disputes/create?transactionId=${transaction.id}`}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            فتح نزاع
                          </Link>
                        </>
                      )}

                      {transaction.status === 'DISPUTED' && (
                        <Link
                          href={`/mobiles/disputes/${transaction.id}`}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          عرض النزاع
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">تفاصيل المعاملة</h3>
              <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="text-center">
                {(() => {
                  const config = STATUS_CONFIG[selectedTransaction.status];
                  const Icon = config?.icon || Clock;
                  return (
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${config?.bgColor} ${config?.color}`}>
                      <Icon className="w-6 h-6" />
                      <span className="text-lg font-bold">{config?.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Timeline */}
              <div className="border rounded-xl p-4">
                <h4 className="font-bold mb-4">تتبع المعاملة</h4>
                <div className="space-y-3">
                  {[
                    { status: 'PENDING_PAYMENT', label: 'في انتظار الدفع', date: selectedTransaction.createdAt },
                    { status: 'PAYMENT_RECEIVED', label: 'تم استلام الدفع', date: null },
                    { status: 'SHIPPED', label: 'تم الشحن', date: null },
                    { status: 'DELIVERED', label: 'تم التوصيل', date: null },
                    { status: 'IN_INSPECTION', label: 'فترة الفحص (5 أيام)', date: null },
                    { status: 'COMPLETED', label: 'مكتمل', date: selectedTransaction.completedAt },
                  ].map((step, idx) => {
                    const stages = ['PENDING_PAYMENT', 'PAYMENT_RECEIVED', 'SHIPPED', 'DELIVERED', 'IN_INSPECTION', 'COMPLETED'];
                    const currentIndex = stages.indexOf(selectedTransaction.status);
                    const stepIndex = stages.indexOf(step.status);
                    const isCompleted = stepIndex <= currentIndex;
                    const isCurrent = stepIndex === currentIndex;

                    return (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-indigo-500 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-sm text-gray-500">
                              {new Date(step.date).toLocaleString('ar-EG')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Listing Details */}
              <div className="border rounded-xl p-4">
                <h4 className="font-bold mb-4">تفاصيل المنتج</h4>
                <div className="flex gap-4">
                  <Image
                    src={selectedTransaction.listing?.images?.[0] || '/images/mobile-placeholder.jpg'}
                    alt=""
                    width={100}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h5 className="font-bold">{selectedTransaction.listing?.title}</h5>
                    <p className="text-gray-500">{selectedTransaction.listing?.brand} {selectedTransaction.listing?.model}</p>
                    <p className="text-gray-500">الحالة: {selectedTransaction.listing?.condition}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border rounded-xl p-4">
                <h4 className="font-bold mb-4">تفاصيل الدفع</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">سعر المنتج</span>
                    <span className="font-bold">{(selectedTransaction.price || 0).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">محجوز في Escrow</span>
                    <span className="font-bold text-green-600">{(selectedTransaction.escrowAmount || 0).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border rounded-xl p-4">
                <h4 className="font-bold mb-4">{selectedTransaction.iAmSeller ? 'معلومات المشتري' : 'معلومات البائع'}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-medium">
                        {selectedTransaction.iAmSeller ? selectedTransaction.buyer.name : selectedTransaction.seller.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedTransaction.iAmSeller ? selectedTransaction.buyer.phone : selectedTransaction.seller.phone}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${selectedTransaction.iAmSeller ? selectedTransaction.buyer.phone : selectedTransaction.seller.phone}`}
                    className="p-3 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              showConfirmModal.type === 'delivery' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {showConfirmModal.type === 'delivery' ? (
                <Package className="w-8 h-8 text-blue-600" />
              ) : (
                <Shield className="w-8 h-8 text-green-600" />
              )}
            </div>

            {showConfirmModal.type === 'delivery' ? (
              <>
                <h3 className="text-lg font-bold mb-2">تأكيد استلام الجهاز</h3>
                <p className="text-gray-500 mb-4">
                  بعد التأكيد ستبدأ فترة الفحص (5 أيام) للتأكد من سلامة الجهاز
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">إتمام المعاملة</h3>
                <p className="text-gray-500 mb-4">
                  بتأكيد سلامة الجهاز، سيتم تحويل المبلغ المحجوز للبائع. هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (showConfirmModal.type === 'delivery') {
                    handleConfirmDelivery(showConfirmModal.transactionId);
                  } else {
                    handleReleaseEscrow(showConfirmModal.transactionId);
                  }
                }}
                className={`flex-1 py-3 text-white rounded-xl font-medium ${
                  showConfirmModal.type === 'delivery' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
