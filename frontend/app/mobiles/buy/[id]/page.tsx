'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Shield, CreditCard, Truck, MapPin,
  CheckCircle, AlertTriangle, Smartphone, Package, Clock
} from 'lucide-react';

interface MobileListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  priceEgp: number;
  images: string[];
  condition: string;
  storageGb: number;
  imeiVerified: boolean;
  governorate: string;
  city: string;
  seller: {
    id: string;
    fullName: string;
    rating: number;
  };
}

const DELIVERY_OPTIONS = [
  { id: 'meetup', label: 'استلام شخصي', description: 'قابل البائع في مكان آمن', price: 0, icon: MapPin },
  { id: 'delivery', label: 'توصيل للمنزل', description: 'توصيل خلال 2-5 أيام', price: 50, icon: Truck },
];

const PAYMENT_METHODS = [
  { id: 'escrow', label: 'الدفع الآمن (Escrow)', description: 'المبلغ محفوظ حتى استلام الجهاز', recommended: true },
  { id: 'cod', label: 'الدفع عند الاستلام', description: 'ادفع نقداً عند الاستلام', recommended: false },
];

export default function MobileBuyPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<MobileListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState('meetup');
  const [selectedPayment, setSelectedPayment] = useState('escrow');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/mobiles/listings/${params.id}`);

      if (!response.ok) {
        setError('الإعلان غير متاح');
        return;
      }

      const data = await response.json();
      const rawListing = data.data?.listing || data.data;

      if (data.success && rawListing) {
        setListing({
          id: rawListing.id,
          title: rawListing.title || rawListing.titleAr || '',
          brand: rawListing.brand || '',
          model: rawListing.model || '',
          priceEgp: rawListing.priceEgp || rawListing.price || 0,
          images: rawListing.images || [],
          condition: rawListing.conditionGrade || rawListing.condition || 'C',
          storageGb: rawListing.storageGb || rawListing.storageCapacity || 0,
          imeiVerified: rawListing.imeiVerified || false,
          governorate: rawListing.governorate || '',
          city: rawListing.city || '',
          seller: {
            id: rawListing.seller?.id || '',
            fullName: rawListing.seller?.fullName || rawListing.seller?.name || 'مستخدم',
            rating: rawListing.seller?.rating || 0,
          },
        });
      } else {
        setError('الإعلان غير موجود');
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!listing) return { subtotal: 0, delivery: 0, commission: 0, total: 0 };

    const subtotal = listing.priceEgp;
    const deliveryOption = DELIVERY_OPTIONS.find(d => d.id === selectedDelivery);
    const delivery = deliveryOption?.price || 0;
    const commission = selectedPayment === 'escrow' ? Math.round(subtotal * 0.025) : 0; // 2.5% escrow fee

    return {
      subtotal,
      delivery,
      commission,
      total: subtotal + delivery + commission,
    };
  };

  const handlePurchase = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/mobiles/buy/' + params.id);
      return;
    }

    if (selectedDelivery === 'delivery' && (!address || !phone)) {
      alert('يرجى إدخال العنوان ورقم الهاتف');
      return;
    }

    try {
      setProcessing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/mobiles/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing?.id,
          paymentMethod: selectedPayment.toUpperCase(),
          deliveryMethod: selectedDelivery.toUpperCase(),
          deliveryAddress: selectedDelivery === 'delivery' ? address : null,
          phone: phone || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to transaction page or payment
        if (selectedPayment === 'escrow') {
          router.push(`/checkout?transactionId=${data.data?.id}&type=mobile`);
        } else {
          router.push(`/mobiles/transactions?success=true`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.error || errorData?.message || 'فشل إتمام الطلب');
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center" dir="rtl">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'الإعلان غير متاح'}</h2>
        <Link href="/mobiles" className="mt-4 text-indigo-600 hover:underline">
          العودة لسوق الموبايلات
        </Link>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowRight className="w-5 h-5 ml-1" />
            <span>رجوع</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">إتمام الشراء</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold mb-4">المنتج</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {listing.images?.[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{listing.brand} {listing.model} - {listing.storageGb}GB</p>
                  <div className="flex items-center gap-2 mt-2">
                    {listing.imeiVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        IMEI موثق
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {listing.governorate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold mb-4">طريقة الاستلام</h2>
              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                        selectedDelivery === option.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={selectedDelivery === option.id}
                        onChange={(e) => setSelectedDelivery(e.target.value)}
                        className="hidden"
                      />
                      <Icon className={`w-6 h-6 ml-3 ${selectedDelivery === option.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <span className="font-bold">
                        {option.price === 0 ? 'مجاناً' : `${option.price} ج.م`}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedDelivery === 'delivery' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">العنوان</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="أدخل العنوان بالتفصيل"
                      className="w-full border border-gray-200 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full border border-gray-200 rounded-lg p-3"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold mb-4">طريقة الدفع</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{method.label}</p>
                        {method.recommended && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            موصى به
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedPayment === method.id
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedPayment === method.id && (
                        <CheckCircle className="w-full h-full text-white" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="font-bold mb-4">ملخص الطلب</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">سعر المنتج</span>
                  <span>{totals.subtotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التوصيل</span>
                  <span>{totals.delivery === 0 ? 'مجاناً' : `${totals.delivery} ج.م`}</span>
                </div>
                {selectedPayment === 'escrow' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">رسوم الحماية (2.5%)</span>
                    <span>{totals.commission.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-indigo-600">{totals.total.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>تأكيد الطلب</span>
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">معاملة آمنة</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {selectedPayment === 'escrow'
                    ? 'المبلغ محفوظ حتى تستلم الجهاز وتتأكد من حالته'
                    : 'تأكد من فحص الجهاز قبل الدفع'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
