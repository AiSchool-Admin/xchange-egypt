'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface GoldItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  karat: string;
  category: string;
  condition: string;
  weightGrams: number;
  pricePerGram: number;
  totalPrice: number;
  images: string[];
  verificationLevel: string;
  status: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    createdAt: string;
    goldItemsCount?: number;
    goldRating?: number;
  };
  certificate?: {
    id: string;
    certificateNumber: string;
    issuedAt: string;
    partner: {
      name: string;
      nameAr: string;
    };
  };
  createdAt: string;
}

interface GoldPrice {
  karat: string;
  buyPrice: number;
  sellPrice: number;
  updatedAt: string;
}

interface PriceCalculation {
  askingPrice: number;
  buyerCommission: number;
  buyerPays: number;
  marketPrice: number;
  savings: number;
  savingsPercent: number;
}

const KARAT_LABELS: Record<string, string> = {
  K18: 'عيار 18',
  K21: 'عيار 21',
  K24: 'عيار 24',
};

const CATEGORY_LABELS: Record<string, string> = {
  RING: 'خاتم',
  NECKLACE: 'سلسلة',
  BRACELET: 'إسورة',
  EARRING: 'حلق',
  PENDANT: 'تعليقة',
  CHAIN: 'سنسال',
  COIN: 'عملة ذهبية',
  BAR: 'سبيكة',
  SET: 'طقم',
  OTHER: 'أخرى',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديد',
  LIKE_NEW: 'كالجديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
};

const VERIFICATION_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  BASIC: { label: 'أساسي', color: 'bg-gray-100 text-gray-700', icon: '○' },
  VERIFIED: { label: 'موثق', color: 'bg-blue-100 text-blue-700', icon: '◉' },
  CERTIFIED: { label: 'معتمد', color: 'bg-yellow-100 text-yellow-700', icon: '★' },
};

export default function GoldItemPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<GoldItem | null>(null);
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarItems, setSimilarItems] = useState<GoldItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch item details and prices in parallel
        const [itemRes, pricesRes] = await Promise.all([
          apiClient.get(`/gold/items/${params.id}`),
          apiClient.get('/gold/prices'),
        ]);

        const itemData = itemRes.data.data;
        setItem(itemData);
        setPrices(pricesRes.data.data);

        // Calculate price breakdown
        const calcRes = await apiClient.post('/gold/calculate', {
          weightGrams: itemData.weightGrams,
          karat: itemData.karat,
          sellerPricePerGram: itemData.pricePerGram,
        });
        setCalculation(calcRes.data.data);

        // Fetch similar items
        const similarRes = await apiClient.get('/gold/items', {
          params: {
            karat: itemData.karat,
            category: itemData.category,
            limit: 4,
            excludeId: itemData.id,
          },
        });
        setSimilarItems(similarRes.data.data.items?.filter((i: GoldItem) => i.id !== itemData.id).slice(0, 4) || []);

      } catch (err: any) {
        console.error('Error fetching item:', err);
        setError(err.response?.data?.error?.message || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleBuy = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/gold/' + params.id);
      return;
    }

    // TODO: Implement purchase flow with escrow
    alert('سيتم تفعيل خاصية الشراء قريباً');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-64 mb-8 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg" />
              <div className="space-y-4">
                <div className="bg-gray-200 h-10 w-3/4 rounded" />
                <div className="bg-gray-200 h-6 w-1/2 rounded" />
                <div className="bg-gray-200 h-32 rounded" />
                <div className="bg-gray-200 h-48 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {error || 'لم يتم العثور على القطعة'}
            </h1>
            <Link href="/gold" className="text-yellow-600 hover:underline">
              العودة لسوق الذهب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verificationBadge = VERIFICATION_BADGES[item.verificationLevel] || VERIFICATION_BADGES.BASIC;
  const currentPrice = prices.find(p => p.karat === item.karat);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-yellow-600">الرئيسية</Link>
          <span>/</span>
          <Link href="/gold" className="hover:text-yellow-600">سوق الذهب</Link>
          <span>/</span>
          <span className="text-gray-400">{item.titleAr || item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-yellow-200">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images[selectedImage]}
                  alt={item.titleAr || item.title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl">💍</span>
                </div>
              )}

              {/* Verification Badge */}
              <div className={`absolute top-4 right-4 ${verificationBadge.color} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                <span>{verificationBadge.icon}</span>
                <span>{verificationBadge.label}</span>
              </div>

              {/* Savings Badge */}
              {calculation && calculation.savingsPercent > 0 && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  وفر {calculation.savingsPercent.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <Image src={img} alt={`صورة ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {item.titleAr || item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                  {KARAT_LABELS[item.karat] || item.karat}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {CONDITION_LABELS[item.condition] || item.condition}
                </span>
                <span className="text-gray-500">
                  {item.weightGrams} جرام
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-yellow-700">
                  {formatPrice(calculation?.buyerPays || item.totalPrice)}
                </span>
                <span className="text-xl text-yellow-600">ج.م</span>
              </div>

              {calculation && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>سعر البائع</span>
                    <span>{formatPrice(calculation.askingPrice)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>عمولة المشتري (0.7%)</span>
                    <span>{formatPrice(calculation.buyerCommission)} ج.م</span>
                  </div>
                  <div className="border-t border-yellow-200 pt-2 flex justify-between font-medium">
                    <span>إجمالي المشتري</span>
                    <span className="text-yellow-700">{formatPrice(calculation.buyerPays)} ج.م</span>
                  </div>

                  {calculation.savings > 0 && (
                    <div className="mt-3 bg-green-100 rounded-lg p-3 text-green-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <div>
                          <div className="font-bold">
                            توفير {formatPrice(calculation.savings)} ج.م
                          </div>
                          <div className="text-xs text-green-600">
                            مقارنة بسعر السوق ({formatPrice(calculation.marketPrice)} ج.م)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current Market Price Reference */}
              {currentPrice && (
                <div className="mt-4 pt-4 border-t border-yellow-200 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>سعر {KARAT_LABELS[item.karat]} اليوم (بيع)</span>
                    <span>{formatPrice(currentPrice.sellPrice)} ج.م/جرام</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                className="flex-1 bg-gradient-to-l from-yellow-500 to-amber-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
              >
                🛒 شراء الآن
              </button>
              <button
                className="bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all"
                onClick={() => {
                  // TODO: Implement chat with seller
                  alert('سيتم تفعيل المحادثة مع البائع قريباً');
                }}
              >
                💬 تواصل
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-bold text-blue-800 mb-1">معاملة آمنة بنظام الضمان</h4>
                <p className="text-sm text-blue-600">
                  أموالك محمية في حساب الضمان حتى استلام القطعة والتحقق منها
                </p>
              </div>
            </div>

            {/* Description */}
            {(item.descriptionAr || item.description) && (
              <div>
                <h3 className="font-bold text-gray-800 mb-2">الوصف</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.descriptionAr || item.description}
                </p>
              </div>
            )}

            {/* Certificate Info */}
            {item.certificate && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">📜</span>
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-1">شهادة التحقق</h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <div>رقم الشهادة: {item.certificate.certificateNumber}</div>
                      <div>الصائغ: {item.certificate.partner.nameAr || item.certificate.partner.name}</div>
                      <div>تاريخ الإصدار: {formatDate(item.certificate.issuedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">البائع</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {item.seller.avatar ? (
                    <Image
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                  ) : (
                    item.seller.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.seller.name}</div>
                  <div className="text-sm text-gray-500">
                    عضو منذ {formatDate(item.seller.createdAt)}
                  </div>
                  {item.seller.goldRating && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <span>⭐</span>
                      <span>{item.seller.goldRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Item Details Table */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">تفاصيل القطعة</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">العيار</span>
                  <span className="font-medium">{KARAT_LABELS[item.karat]}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">الفئة</span>
                  <span className="font-medium">{CATEGORY_LABELS[item.category]}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">الحالة</span>
                  <span className="font-medium">{CONDITION_LABELS[item.condition]}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">الوزن</span>
                  <span className="font-medium">{item.weightGrams} جرام</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">سعر الجرام</span>
                  <span className="font-medium">{formatPrice(item.pricePerGram)} ج.م</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-500">تاريخ النشر</span>
                  <span className="font-medium">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">قطع مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similarItem) => (
                <Link
                  key={similarItem.id}
                  href={`/gold/${similarItem.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {similarItem.images && similarItem.images.length > 0 ? (
                      <Image
                        src={similarItem.images[0]}
                        alt={similarItem.titleAr || similarItem.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        💍
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                      {similarItem.titleAr || similarItem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {KARAT_LABELS[similarItem.karat]}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {similarItem.weightGrams}g
                      </span>
                    </div>
                    <div className="mt-2 font-bold text-yellow-700">
                      {formatPrice(similarItem.totalPrice)} ج.م
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-12 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">لماذا تشتري الذهب من XChange؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">حماية الضمان</h3>
              <p className="text-sm text-gray-600">
                أموالك محمية في حساب الضمان حتى استلام القطعة والتأكد من جودتها
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📜</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">شهادات موثقة</h3>
              <p className="text-sm text-gray-600">
                القطع المعتمدة تأتي مع شهادة تحقق من صائغ معتمد
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">أسعار أفضل</h3>
              <p className="text-sm text-gray-600">
                وفر حتى 25% مقارنة بأسعار محلات المجوهرات
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
