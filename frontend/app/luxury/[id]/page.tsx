'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface LuxuryItem {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  condition: string;
  estimatedValue: number;
  governorate: string;
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
    createdAt: string;
    rating?: number;
    totalSales?: number;
  };
  verificationStatus?: string;
  authenticityCertificate?: string;
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  serialNumber?: string;
  createdAt: string;
  status: string;
}

const LUXURY_CATEGORIES: Record<string, { nameAr: string; icon: string }> = {
  'luxury-watches': { nameAr: 'ساعات فاخرة', icon: '⌚' },
  'jewelry': { nameAr: 'مجوهرات', icon: '💎' },
  'luxury-bags': { nameAr: 'حقائب فاخرة', icon: '👜' },
  'cars': { nameAr: 'سيارات فاخرة', icon: '🏎️' },
  'paintings': { nameAr: 'لوحات فنية', icon: '🖼️' },
  'antiques': { nameAr: 'تحف أثرية', icon: '🏺' },
  'real-estate': { nameAr: 'عقارات مميزة', icon: '🏰' },
  'perfumes': { nameAr: 'عطور أصلية', icon: '🌸' },
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديد',
  LIKE_NEW: 'كالجديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
};

const VERIFICATION_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'قيد المراجعة', color: 'bg-gray-100 text-gray-700', icon: '⏳' },
  VERIFIED: { label: 'موثق', color: 'bg-blue-100 text-blue-700', icon: '✓' },
  CERTIFIED: { label: 'معتمد', color: 'bg-amber-100 text-amber-700', icon: '★' },
  PREMIUM: { label: 'بريميوم', color: 'bg-purple-100 text-purple-700', icon: '👑' },
};

export default function LuxuryItemPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<LuxuryItem | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarItems, setSimilarItems] = useState<LuxuryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch item details
        const itemRes = await apiClient.get(`/items/${params.id}`);
        const itemData = itemRes.data.data;
        setItem(itemData);

        // Fetch similar items
        const similarRes = await apiClient.get('/items/luxury', {
          params: {
            categoryId: itemData.category?.id,
            limit: 4,
            minPrice: 50000,
          },
        });
        setSimilarItems(
          similarRes.data.data?.items?.filter((i: LuxuryItem) => i.id !== itemData.id).slice(0, 4) || []
        );
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
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/luxury/' + params.id);
      return;
    }
    router.push(`/checkout?itemId=${params.id}`);
  };

  const handleContact = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/luxury/' + params.id);
      return;
    }
    router.push(`/chat?sellerId=${item?.seller.id}&itemId=${params.id}`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون ج.م`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف ج.م`;
    }
    return new Intl.NumberFormat('ar-EG').format(Math.round(price)) + ' ج.م';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriceTier = (price: number) => {
    if (price >= 1000000) return { label: 'بلاتينيوم', color: 'bg-gradient-to-r from-gray-800 to-gray-600', textColor: 'text-white' };
    if (price >= 500000) return { label: 'ذهبي', color: 'bg-gradient-to-r from-amber-500 to-yellow-400', textColor: 'text-amber-900' };
    if (price >= 100000) return { label: 'فضي', color: 'bg-gradient-to-r from-gray-400 to-gray-300', textColor: 'text-gray-800' };
    return { label: 'مميز', color: 'bg-gradient-to-r from-emerald-500 to-teal-400', textColor: 'text-white' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-800 h-8 w-64 mb-8 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 aspect-square rounded-2xl" />
              <div className="space-y-4">
                <div className="bg-gray-800 h-10 w-3/4 rounded" />
                <div className="bg-gray-800 h-6 w-1/2 rounded" />
                <div className="bg-gray-800 h-32 rounded-xl" />
                <div className="bg-gray-800 h-48 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-950" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {error || 'لم يتم العثور على المنتج'}
            </h1>
            <Link href="/luxury" className="text-amber-400 hover:underline">
              العودة لسوق الرفاهية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verificationBadge = VERIFICATION_BADGES[item.verificationStatus || 'PENDING'] || VERIFICATION_BADGES.PENDING;
  const tier = getPriceTier(item.estimatedValue || 0);
  const categoryInfo = LUXURY_CATEGORIES[item.category?.nameEn?.toLowerCase()] || { nameAr: item.category?.nameAr, icon: '👑' };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>/</span>
          <Link href="/luxury" className="hover:text-amber-400">سوق الرفاهية</Link>
          <span>/</span>
          <span className="text-gray-500 truncate max-w-xs">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images[selectedImage]?.url}
                  alt={item.title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-20">👑</span>
                </div>
              )}

              {/* Tier Badge */}
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold ${tier.color} ${tier.textColor}`}>
                {tier.label}
              </div>

              {/* Verification Badge */}
              <div className={`absolute top-4 left-4 ${verificationBadge.color} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                <span>{verificationBadge.icon}</span>
                <span>{verificationBadge.label}</span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Image src={img.url} alt={`صورة ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{categoryInfo.icon}</span>
                <span className="text-amber-400 text-sm">{categoryInfo.nameAr}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {item.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{item.governorate || 'مصر'}</span>
                <span>•</span>
                <span>نُشر {formatDate(item.createdAt)}</span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  {formatPrice(item.estimatedValue || 0)}
                </span>
              </div>

              {/* Condition Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.condition === 'NEW' ? 'bg-emerald-500/20 text-emerald-400' :
                  item.condition === 'LIKE_NEW' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {CONDITION_LABELS[item.condition] || item.condition}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                className="flex-1 bg-gradient-to-l from-amber-500 to-yellow-500 text-gray-900 py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg hover:shadow-xl"
              >
                🛒 شراء الآن
              </button>
              <button
                onClick={handleContact}
                className="bg-gray-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-700 transition-all border border-gray-700"
              >
                💬 تواصل
              </button>
            </div>

            {/* VIP Security Notice */}
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl p-4 flex items-start gap-3 border border-amber-500/20">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-bold text-amber-400 mb-1">حماية VIP للمشتريات الفاخرة</h4>
                <p className="text-sm text-gray-400">
                  ضمان استرداد كامل المبلغ • فحص أصالة المنتج • تأمين شامل على الشحن
                </p>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="font-bold text-white mb-2">الوصف</h3>
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div>
              <h3 className="font-bold text-white mb-3">تفاصيل المنتج</h3>
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 divide-y divide-gray-700/50">
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-400">الفئة</span>
                  <span className="font-medium text-white">{categoryInfo.nameAr}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-400">الحالة</span>
                  <span className="font-medium text-white">{CONDITION_LABELS[item.condition]}</span>
                </div>
                {item.brand && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-400">العلامة التجارية</span>
                    <span className="font-medium text-white">{item.brand}</span>
                  </div>
                )}
                {item.model && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-400">الموديل</span>
                    <span className="font-medium text-white">{item.model}</span>
                  </div>
                )}
                {item.yearOfManufacture && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-400">سنة الصنع</span>
                    <span className="font-medium text-white">{item.yearOfManufacture}</span>
                  </div>
                )}
                {item.serialNumber && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-400">الرقم التسلسلي</span>
                    <span className="font-medium text-white font-mono">{item.serialNumber}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-400">الموقع</span>
                  <span className="font-medium text-white">{item.governorate}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-gray-400">تاريخ النشر</span>
                  <span className="font-medium text-white">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Authenticity Certificate */}
            {item.authenticityCertificate && (
              <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">📜</span>
                  <div>
                    <h4 className="font-bold text-amber-400 mb-1">شهادة الأصالة</h4>
                    <p className="text-sm text-gray-400">
                      هذا المنتج يحمل شهادة أصالة معتمدة
                    </p>
                    <p className="text-xs text-amber-500/70 mt-1">{item.authenticityCertificate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h3 className="font-bold text-white mb-3">البائع</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-gray-900 text-2xl font-bold">
                  {item.seller.avatar ? (
                    <Image
                      src={item.seller.avatar}
                      alt={item.seller.fullName}
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                  ) : (
                    item.seller.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">{item.seller.fullName}</div>
                  <div className="text-sm text-gray-500">
                    عضو منذ {formatDate(item.seller.createdAt)}
                  </div>
                  {item.seller.rating && (
                    <div className="flex items-center gap-1 text-sm text-amber-400">
                      <span>⭐</span>
                      <span>{item.seller.rating.toFixed(1)}</span>
                      {item.seller.totalSales && (
                        <span className="text-gray-500">• {item.seller.totalSales} عملية بيع</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similarItem) => (
                <Link
                  key={similarItem.id}
                  href={`/luxury/${similarItem.id}`}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-amber-500/50 transition-all group"
                >
                  <div className="relative aspect-square bg-gray-900">
                    {similarItem.images && similarItem.images.length > 0 ? (
                      <Image
                        src={similarItem.images[0]?.url}
                        alt={similarItem.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                        👑
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white text-sm line-clamp-1 group-hover:text-amber-400 transition">
                      {similarItem.title}
                    </h3>
                    <div className="mt-2 font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                      {formatPrice(similarItem.estimatedValue || 0)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Why Luxury Section */}
        <div className="mt-12 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            لماذا <span className="text-amber-400">Xchange Luxury</span>؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <h3 className="font-bold text-white mb-2">منتجات أصلية 100%</h3>
              <p className="text-gray-400 text-sm">جميع المنتجات مضمونة الأصالة ومعتمدة من خبراء متخصصين</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🔒
              </div>
              <h3 className="font-bold text-white mb-2">معاملات آمنة</h3>
              <p className="text-gray-400 text-sm">نظام دفع آمن مع ضمان استرداد الأموال في حالة عدم المطابقة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🎯
              </div>
              <h3 className="font-bold text-white mb-2">خدمة VIP</h3>
              <p className="text-gray-400 text-sm">دعم مخصص على مدار الساعة لعملائنا المميزين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
