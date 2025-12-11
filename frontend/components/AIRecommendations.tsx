'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RecommendedItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  category: string;
  location: string;
  matchScore: number;
  matchReason: string;
  seller: {
    name: string;
    rating: number;
  };
  isNew?: boolean;
  discount?: number;
}

interface AIRecommendationsProps {
  userId?: string;
  type?: 'homepage' | 'sidebar' | 'item-page' | 'barter';
  currentItemId?: string;
  limit?: number;
  showTitle?: boolean;
}

// Mock recommendations data
const generateMockRecommendations = (type: string): RecommendedItem[] => {
  const allItems: RecommendedItem[] = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB - جديد',
      price: 62000,
      category: 'هواتف',
      location: 'القاهرة',
      matchScore: 95,
      matchReason: 'بناءً على بحثك عن هواتف آيفون',
      seller: { name: 'متجر التقنية', rating: 4.9 },
      isNew: true,
    },
    {
      id: '2',
      title: 'MacBook Pro M3 14" - 512GB',
      price: 95000,
      category: 'لابتوب',
      location: 'الجيزة',
      matchScore: 88,
      matchReason: 'منتج مشابه لما شاهدته مؤخراً',
      seller: { name: 'تك ستور', rating: 4.7 },
      discount: 10,
    },
    {
      id: '3',
      title: 'Samsung Galaxy S24 Ultra',
      price: 55000,
      category: 'هواتف',
      location: 'الإسكندرية',
      matchScore: 85,
      matchReason: 'مشتريون مثلك اشتروا هذا',
      seller: { name: 'جالاكسي شوب', rating: 4.8 },
    },
    {
      id: '4',
      title: 'شقة 150م² مدينة نصر - سوبر لوكس',
      price: 2500000,
      category: 'عقارات',
      location: 'القاهرة',
      matchScore: 92,
      matchReason: 'قريب من موقعك المفضل',
      seller: { name: 'النيل للعقارات', rating: 4.6 },
    },
    {
      id: '5',
      title: 'تويوتا كورولا 2023 - فول أوبشن',
      price: 950000,
      category: 'سيارات',
      location: 'القاهرة',
      matchScore: 78,
      matchReason: 'شائع في منطقتك',
      seller: { name: 'معرض النجم', rating: 4.9 },
      isNew: true,
    },
    {
      id: '6',
      title: 'PlayStation 5 + 3 ألعاب',
      price: 25000,
      category: 'ألعاب',
      location: 'المنصورة',
      matchScore: 82,
      matchReason: 'قد يعجبك هذا المنتج',
      seller: { name: 'جيمرز مصر', rating: 4.5 },
      discount: 15,
    },
  ];

  return allItems.slice(0, 6);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

export default function AIRecommendations({
  userId,
  type = 'homepage',
  currentItemId,
  limit = 6,
  showTitle = true,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecommendations(generateMockRecommendations(type).slice(0, limit));
      setLoading(false);
    }, 800);
  }, [type, limit, userId, currentItemId]);

  const filteredRecommendations = recommendations.filter(item => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const categories = ['all', ...new Set(recommendations.map(r => r.category))];

  if (loading) {
    return (
      <div className="py-8">
        {showTitle && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🤖</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">توصيات ذكية لك</h2>
              <p className="text-gray-500 text-sm">جاري التحميل...</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`py-8 ${type === 'sidebar' ? '' : ''}`} dir="rtl">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">توصيات ذكية لك</h2>
              <p className="text-gray-500 text-sm">بناءً على اهتماماتك وتفضيلاتك</p>
            </div>
          </div>
          <Link
            href="/recommendations"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            عرض الكل
            <span>←</span>
          </Link>
        </div>
      )}

      {/* Category Filters */}
      {type === 'homepage' && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                activeFilter === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      <div className={`grid gap-4 ${
        type === 'sidebar'
          ? 'grid-cols-1'
          : type === 'item-page'
          ? 'grid-cols-2 md:grid-cols-4'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
      }`}>
        {filteredRecommendations.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group border border-gray-100"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <span className="text-4xl opacity-50">
                    {item.category === 'هواتف' ? '📱' :
                     item.category === 'لابتوب' ? '💻' :
                     item.category === 'عقارات' ? '🏠' :
                     item.category === 'سيارات' ? '🚗' :
                     item.category === 'ألعاب' ? '🎮' : '📦'}
                  </span>
                </div>
              )}

              {/* Match Score Badge */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                <span>🎯</span>
                {item.matchScore}%
              </div>

              {/* New Badge */}
              {item.isNew && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  جديد
                </div>
              )}

              {/* Discount Badge */}
              {item.discount && (
                <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  -{item.discount}%
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                {item.title}
              </h3>

              {/* Match Reason */}
              <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-block mb-2">
                {item.matchReason}
              </p>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary-600">
                  {formatPrice(item.price)} ج.م
                </span>
                <span className="text-xs text-gray-400">{item.location}</span>
              </div>

              {/* Seller */}
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <span>⭐ {item.seller.rating}</span>
                <span>•</span>
                <span className="truncate">{item.seller.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Explanation */}
      {type === 'homepage' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xl">💡</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <strong>كيف نختار التوصيات؟</strong> نحلل سجل تصفحك واهتماماتك والمنتجات المشابهة التي اشتراها مستخدمون مثلك.
            </p>
          </div>
          <Link href="/help/recommendations" className="text-purple-600 text-sm hover:underline whitespace-nowrap">
            اعرف المزيد
          </Link>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar
export function AIRecommendationsSidebar({ limit = 4 }: { limit?: number }) {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRecommendations(generateMockRecommendations('sidebar').slice(0, limit));
      setLoading(false);
    }, 800);
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🤖</span>
        <span className="font-bold text-gray-900">مقترح لك</span>
      </div>
      {recommendations.map((item) => (
        <Link
          key={item.id}
          href={`/items/${item.id}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-2xl opacity-50">
              {item.category === 'هواتف' ? '📱' : '📦'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h4>
            <p className="text-primary-600 font-bold text-sm">{formatPrice(item.price)} ج.م</p>
            <p className="text-xs text-purple-500">{item.matchScore}% تطابق</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Barter-specific recommendations
export function BarterAIRecommendations({ userItemId }: { userItemId?: string }) {
  const [matches, setMatches] = useState<{
    item: RecommendedItem;
    fairnessScore: number;
    suggestion?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMatches([
        {
          item: {
            id: '1',
            title: 'iPhone 14 Pro 256GB',
            price: 45000,
            category: 'هواتف',
            location: 'القاهرة',
            matchScore: 92,
            matchReason: 'قيمة متقاربة جداً',
            seller: { name: 'أحمد محمد', rating: 4.8 },
          },
          fairnessScore: 95,
          suggestion: 'صفقة عادلة جداً',
        },
        {
          item: {
            id: '2',
            title: 'MacBook Air M2',
            price: 48000,
            category: 'لابتوب',
            location: 'الجيزة',
            matchScore: 85,
            matchReason: 'تبادل مكافئ',
            seller: { name: 'سارة أحمد', rating: 4.9 },
          },
          fairnessScore: 88,
          suggestion: 'قد تحتاج إضافة 3,000 ج.م',
        },
        {
          item: {
            id: '3',
            title: 'PlayStation 5 + 5 ألعاب',
            price: 42000,
            category: 'ألعاب',
            location: 'الإسكندرية',
            matchScore: 78,
            matchReason: 'مطابقة اهتماماتك',
            seller: { name: 'محمود علي', rating: 4.6 },
          },
          fairnessScore: 82,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [userItemId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
          <span className="text-xl">🔄</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">توصيات المقايضة الذكية</h3>
          <p className="text-sm text-gray-500">منتجات مناسبة للتبادل معك</p>
        </div>
      </div>

      {matches.map((match) => (
        <div
          key={match.item.id}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-3xl opacity-50">
                {match.item.category === 'هواتف' ? '📱' :
                 match.item.category === 'لابتوب' ? '💻' : '🎮'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">{match.item.title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>📍 {match.item.location}</span>
                <span>•</span>
                <span>⭐ {match.item.seller.rating}</span>
              </div>

              {/* Fairness Meter */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">عدالة الصفقة</span>
                  <span className={`font-bold ${
                    match.fairnessScore >= 90 ? 'text-green-600' :
                    match.fairnessScore >= 70 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {match.fairnessScore}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      match.fairnessScore >= 90 ? 'bg-green-500' :
                      match.fairnessScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${match.fairnessScore}%` }}
                  ></div>
                </div>
              </div>

              {match.suggestion && (
                <p className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                  💡 {match.suggestion}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Link
              href={`/items/${match.item.id}`}
              className="flex-1 py-2 text-center bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              عرض التفاصيل
            </Link>
            <button className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
              طلب مقايضة
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
