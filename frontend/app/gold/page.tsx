'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

// Types
interface GoldPrice {
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
}

interface GoldPrices {
  K18?: GoldPrice;
  K21?: GoldPrice;
  K24?: GoldPrice;
}

interface GoldItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  karat: string;
  weightGrams: number;
  condition: string;
  images: string[];
  askingPricePerGram: number;
  totalAskingPrice: number;
  goldPriceAtListing: number;
  governorate?: string;
  city?: string;
  verificationLevel: string;
  status: string;
  views: number;
  allowBarter: boolean;
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
const KARAT_LABELS: Record<string, string> = {
  K18: 'عيار 18',
  K21: 'عيار 21',
  K24: 'عيار 24',
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  RING: { label: 'خاتم', icon: '💍' },
  NECKLACE: { label: 'سلسلة/عقد', icon: '📿' },
  BRACELET: { label: 'إسورة', icon: '⌚' },
  EARRING: { label: 'حلق', icon: '✨' },
  SET: { label: 'طقم كامل', icon: '👑' },
  PENDANT: { label: 'تعليقة', icon: '🔮' },
  ANKLET: { label: 'خلخال', icon: '💫' },
  COIN: { label: 'جنيه ذهب', icon: '🪙' },
  BAR: { label: 'سبيكة', icon: '🥇' },
  OTHER: { label: 'أخرى', icon: '💎' },
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديد',
  LIKE_NEW: 'كالجديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
};

const VERIFICATION_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  BASIC: { label: 'أساسي', color: 'bg-gray-100 text-gray-600', icon: '⚪' },
  VERIFIED: { label: 'موثق', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  CERTIFIED: { label: 'معتمد', color: 'bg-green-100 text-green-700', icon: '🟢' },
};

export default function GoldMarketplacePage() {
  const router = useRouter();
  const [prices, setPrices] = useState<GoldPrices>({});
  const [items, setItems] = useState<GoldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  // Filters
  const [selectedKarat, setSelectedKarat] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  // Fetch gold prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await apiClient.get('/gold/prices');
        if (response.data.success) {
          setPrices(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching gold prices:', error);
      }
    };

    fetchPrices();
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch gold items
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const params = new URLSearchParams();
        params.append('status', 'ACTIVE');
        if (selectedKarat) params.append('karat', selectedKarat);
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        params.append('sortBy', sortBy);
        params.append('sortOrder', 'desc');
        params.append('limit', '20');

        const response = await apiClient.get(`/gold/items?${params.toString()}`);
        if (response.data.success) {
          setItems(response.data.data.items);
        }
      } catch (error) {
        console.error('Error fetching gold items:', error);
      } finally {
        setLoadingItems(false);
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedKarat, selectedCategory, searchQuery, sortBy]);

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || isNaN(price)) return '---';
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700">جاري تحميل سوق الذهب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-amber-600 via-yellow-500 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🏆 سوق الذهب
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              أول منصة رقمية موثوقة لتداول ومقايضة الذهب في مصر
            </p>
            <p className="text-amber-200 mt-2">
              اشترِ بأقل من الصائغ • بِع بأعلى من السوق
            </p>
          </div>

          {/* Live Gold Prices */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {(['K18', 'K21', 'K24'] as const).map((karat) => (
              <div key={karat} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-amber-200 text-sm mb-1">{KARAT_LABELS[karat]}</div>
                <div className="text-2xl md:text-3xl font-bold">
                  {prices[karat]?.buyPrice ? formatPrice(prices[karat]!.buyPrice) : '---'}
                </div>
                <div className="text-amber-200 text-xs">ج.م/جرام</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/gold/sell"
              className="bg-white text-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors shadow-lg"
            >
              💰 بيع ذهبك الآن
            </Link>
            <Link
              href="/gold/calculator"
              className="bg-amber-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-800 transition-colors"
            >
              🧮 حاسبة السعر
            </Link>
            <Link
              href="/gold/how-it-works"
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold text-lg mb-2">للبائع: سعر أعلى</h3>
            <p className="text-gray-600 text-sm">
              احصل على +0.7% فوق سعر الصائغ
              <br />
              <span className="text-green-600 font-bold">= +40 ج.م/جرام إضافية</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">للمشتري: توفير 2-3%</h3>
            <p className="text-gray-600 text-sm">
              وفّر مقارنة بالذهب الجديد
              <br />
              <span className="text-green-600 font-bold">= 120-170 ج.م/جرام توفير</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-lg mb-2">ضمان المعاملات</h3>
            <p className="text-gray-600 text-sm">
              نظام Escrow لحماية الطرفين
              <br />
              <span className="text-amber-600 font-bold">+ فحص من صاغة معتمدين</span>
            </p>
          </div>
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
                placeholder="ابحث عن قطعة ذهب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Karat Filter */}
            <select
              value={selectedKarat}
              onChange={(e) => setSelectedKarat(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">كل العيارات</option>
              <option value="K18">عيار 18</option>
              <option value="K21">عيار 21</option>
              <option value="K24">عيار 24</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
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
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="createdAt">الأحدث</option>
              <option value="totalAskingPrice">السعر: الأقل</option>
              <option value="weightGrams">الوزن: الأكبر</option>
              <option value="views">الأكثر مشاهدة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gold Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">قطع الذهب المتاحة</h2>

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
            <p className="text-gray-500 mb-6">جرّب تغيير معايير البحث أو كن أول من يعرض ذهبه</p>
            <Link
              href="/gold/sell"
              className="inline-block bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors"
            >
              💰 اعرض ذهبك الآن
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/gold/${item.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-amber-100 to-amber-50">
                  {item.images?.[0] ? (
                    <img
                      src={item.images?.[0] || ''}
                      alt={item.title || 'ذهب'}
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

                  {/* Barter Badge */}
                  {item.allowBarter && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      🔄 قابل للمقايضة
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{item.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                      {KARAT_LABELS[item.karat]}
                    </span>
                    <span>{item.weightGrams} جرام</span>
                    <span>•</span>
                    <span>{CONDITION_LABELS[item.condition]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-amber-600">
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
      <div className="bg-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">كيف يعمل سوق الذهب؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">اعرض أو ابحث</h3>
              <p className="text-sm text-gray-600">اعرض ذهبك للبيع أو تصفح القطع المتاحة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">تواصل آمن</h3>
              <p className="text-sm text-gray-600">تواصل مع البائع/المشتري عبر المنصة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">دفع محمي</h3>
              <p className="text-sm text-gray-600">ادفع بأمان - المبلغ محجوز حتى الاستلام</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">4</div>
              <h3 className="font-bold mb-2">استلم وأكّد</h3>
              <p className="text-sm text-gray-600">افحص القطعة وأكّد الاستلام خلال 48 ساعة</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-l from-amber-600 to-yellow-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">عندك ذهب مش محتاجه؟</h2>
          <p className="text-amber-100 mb-6 max-w-xl mx-auto">
            بيع ذهبك على Xchange واحصل على سعر أفضل من الصائغ.
            <br />
            تسجيل مجاني وعمولة 0.7% فقط!
          </p>
          <Link
            href="/gold/sell"
            className="inline-block bg-white text-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors shadow-lg"
          >
            💰 ابدأ البيع الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
