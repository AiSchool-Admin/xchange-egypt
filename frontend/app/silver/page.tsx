'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

// Types
interface SilverPrice {
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
}

interface SilverPrices {
  S999?: SilverPrice;
  S925?: SilverPrice;
  S900?: SilverPrice;
  S800?: SilverPrice;
}

interface SilverItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  purity: string;
  weightGrams: number;
  condition: string;
  images: string[];
  askingPricePerGram: number;
  totalAskingPrice: number;
  silverPriceAtListing: number;
  governorate?: string;
  city?: string;
  verificationLevel: string;
  status: string;
  views: number;
  allowBarter: boolean;
  allowGoldBarter: boolean;
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
  };
  currentMarketPrice: number;
  buyerPays: number;
  savings: number;
  savingsPercent: number;
}

// Constants
const PURITY_LABELS: Record<string, string> = {
  S999: 'فضة نقية 999',
  S925: 'فضة إسترليني 925',
  S900: 'فضة 900',
  S800: 'فضة 800',
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  RING: { label: 'خاتم', icon: '💍' },
  NECKLACE: { label: 'سلسلة/عقد', icon: '📿' },
  BRACELET: { label: 'إسورة', icon: '⌚' },
  EARRING: { label: 'حلق', icon: '✨' },
  SET: { label: 'طقم كامل', icon: '👑' },
  PENDANT: { label: 'تعليقة', icon: '🔮' },
  ANKLET: { label: 'خلخال', icon: '💫' },
  COIN: { label: 'عملة فضة', icon: '🪙' },
  BAR: { label: 'سبيكة', icon: '🥈' },
  ANTIQUE: { label: 'أنتيك', icon: '🏺' },
  OTHER: { label: 'أخرى', icon: '💎' },
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديد',
  LIKE_NEW: 'كالجديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
  ANTIQUE: 'أنتيك',
};

const VERIFICATION_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  BASIC: { label: 'أساسي', color: 'bg-gray-100 text-gray-600', icon: '⚪' },
  VERIFIED: { label: 'موثق', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  CERTIFIED: { label: 'معتمد', color: 'bg-green-100 text-green-700', icon: '🟢' },
};

export default function SilverMarketplacePage() {
  const router = useRouter();
  const [prices, setPrices] = useState<SilverPrices>({});
  const [items, setItems] = useState<SilverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  // Filters
  const [selectedPurity, setSelectedPurity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  // Fetch silver prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await apiClient.get('/silver/prices');
        if (response.data.success) {
          setPrices(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching silver prices:', error);
      }
    };

    fetchPrices();
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch silver items
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const params = new URLSearchParams();
        params.append('status', 'ACTIVE');
        if (selectedPurity) params.append('purity', selectedPurity);
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        params.append('sortBy', sortBy);
        params.append('sortOrder', 'desc');
        params.append('limit', '20');

        const response = await apiClient.get(`/silver/items?${params.toString()}`);
        if (response.data.success) {
          setItems(response.data.data.items);
        }
      } catch (error) {
        console.error('Error fetching silver items:', error);
      } finally {
        setLoadingItems(false);
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedPurity, selectedCategory, searchQuery, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">جاري تحميل سوق الفضة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-slate-600 via-slate-500 to-slate-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🥈 سوق الفضة
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              أول منصة رقمية موثوقة لتداول ومقايضة الفضة في مصر
            </p>
            <p className="text-slate-300 mt-2">
              وفّر حتى 30% • جودة مضمونة • معاملات آمنة
            </p>
          </div>

          {/* Live Silver Prices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {(['S999', 'S925', 'S900', 'S800'] as const).map((purity) => (
              <div key={purity} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-slate-200 text-sm mb-1">{PURITY_LABELS[purity]}</div>
                <div className="text-2xl md:text-3xl font-bold">
                  {prices[purity]?.buyPrice ? formatPrice(prices[purity]!.buyPrice) : '---'}
                </div>
                <div className="text-slate-200 text-xs">ج.م/جرام</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/silver/sell"
              className="bg-white text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
            >
              💰 بيع فضتك الآن
            </Link>
            <Link
              href="/silver/calculator"
              className="bg-slate-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              🧮 حاسبة السعر
            </Link>
            <Link
              href="/silver/how-it-works"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              ❓ كيف يعمل
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold text-lg mb-2">للبائع: سعر عادل</h3>
            <p className="text-gray-600 text-sm">
              احصل على +2% فوق سعر السوق
              <br />
              <span className="text-green-600 font-bold">= أفضل من تاجر الجملة</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">للمشتري: وفّر 20-30%</h3>
            <p className="text-gray-600 text-sm">
              وفّر مقارنة بالفضة الجديدة
              <br />
              <span className="text-green-600 font-bold">= توفير كبير في المجوهرات</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="font-bold text-lg mb-2">مقايضة عبر المعادن</h3>
            <p className="text-gray-600 text-sm">
              بادل الفضة بالذهب والعكس
              <br />
              <span className="text-slate-600 font-bold">Cross-Barter متاح!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Extended Services Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-6">خدمات سوق الفضة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href="/silver/valuation"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="text-3xl mb-2">🔬</div>
            <h3 className="font-bold text-sm">التقييم الاحترافي</h3>
            <p className="text-xs text-gray-500 mt-1">فحص وتوثيق القطع</p>
          </Link>
          <Link
            href="/silver/trade-in"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-bold text-sm">استبدال الفضة</h3>
            <p className="text-xs text-gray-500 mt-1">بدّل القديم بالجديد</p>
          </Link>
          <Link
            href="/silver/savings"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-sm">حساب التوفير</h3>
            <p className="text-xs text-gray-500 mt-1">ادخر بالفضة</p>
          </Link>
          <Link
            href="/silver/compare"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="font-bold text-sm">مقارنة القطع</h3>
            <p className="text-xs text-gray-500 mt-1">قارن حتى 5 قطع</p>
          </Link>
          <Link
            href="/silver/partners"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="text-3xl mb-2">🏪</div>
            <h3 className="font-bold text-sm">المحلات الشريكة</h3>
            <p className="text-xs text-gray-500 mt-1">صاغة معتمدين</p>
          </Link>
          <Link
            href="/silver/orders"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-bold text-sm">طلباتي</h3>
            <p className="text-xs text-gray-500 mt-1">تتبع مشترياتك</p>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="ابحث عن قطعة فضة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Purity Filter */}
            <select
              value={selectedPurity}
              onChange={(e) => setSelectedPurity(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="">كل درجات النقاء</option>
              <option value="S999">فضة نقية 999</option>
              <option value="S925">فضة إسترليني 925</option>
              <option value="S900">فضة 900</option>
              <option value="S800">فضة 800</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="">كل الأنواع</option>
              {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="createdAt">الأحدث</option>
              <option value="totalAskingPrice">السعر: الأقل</option>
              <option value="weightGrams">الوزن: الأكبر</option>
              <option value="views">الأكثر مشاهدة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Silver Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">قطع الفضة المتاحة</h2>

        {loadingItems ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد قطع متاحة</h3>
            <p className="text-gray-500 mb-6">جرّب تغيير معايير البحث أو كن أول من يعرض فضته</p>
            <Link
              href="/silver/sell"
              className="inline-block bg-slate-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-600 transition-colors"
            >
              💰 اعرض فضتك الآن
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/silver/${item.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {CATEGORY_LABELS[item.category]?.icon || '💍'}
                    </div>
                  )}

                  {/* Verification Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${VERIFICATION_BADGES[item.verificationLevel]?.color}`}>
                    {VERIFICATION_BADGES[item.verificationLevel]?.icon} {VERIFICATION_BADGES[item.verificationLevel]?.label}
                  </div>

                  {/* Savings Badge */}
                  {item.savings > 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      وفّر {item.savingsPercent}%
                    </div>
                  )}

                  {/* Barter Badges */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {item.allowBarter && (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        🔄 مقايضة
                      </div>
                    )}
                    {item.allowGoldBarter && (
                      <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        🏆 ذهب↔فضة
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{item.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                      {PURITY_LABELS[item.purity]}
                    </span>
                    <span>{item.weightGrams} جرام</span>
                    <span>•</span>
                    <span>{CONDITION_LABELS[item.condition]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-600">
                        {formatPrice(item.buyerPays)} ج.م
                      </div>
                      {item.savings > 0 && (
                        <div className="text-xs text-green-600">
                          توفير {formatPrice(item.savings)} ج.م
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.governorate}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">كيف يعمل سوق الفضة؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">اعرض أو ابحث</h3>
              <p className="text-sm text-gray-600">اعرض فضتك للبيع أو تصفح القطع المتاحة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">تواصل آمن</h3>
              <p className="text-sm text-gray-600">تواصل مع البائع/المشتري عبر المنصة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">دفع محمي</h3>
              <p className="text-sm text-gray-600">ادفع بأمان - المبلغ محجوز حتى الاستلام</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">4</div>
              <h3 className="font-bold mb-2">استلم وأكّد</h3>
              <p className="text-sm text-gray-600">افحص القطعة وأكّد الاستلام خلال 48 ساعة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Barter Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-l from-amber-500 via-slate-500 to-amber-500 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🔄 مقايضة عبر المعادن</h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              بادل فضتك بالذهب أو العكس! أول منصة في مصر تتيح المقايضة بين المعادن الثمينة.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/gold"
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors"
              >
                🏆 سوق الذهب
              </Link>
              <Link
                href="/precious-metals"
                className="inline-block bg-white text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                💎 كل المعادن الثمينة
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-l from-slate-600 to-slate-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">عندك فضة مش محتاجها؟</h2>
          <p className="text-slate-200 mb-6 max-w-xl mx-auto">
            بيع فضتك على Xchange واحصل على سعر أفضل من التاجر.
            <br />
            تسجيل مجاني وعمولة 2% فقط!
          </p>
          <Link
            href="/silver/sell"
            className="inline-block bg-white text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
          >
            💰 ابدأ البيع الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
