'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getBarterRecommendations, BarterMatch, formatMatchScore } from '@/lib/api/ai';

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<BarterMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      const recs = await getBarterRecommendations(user.id);
      setRecommendations(recs);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError('فشل في تحميل التوصيات. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'high') return rec.score >= 0.8;
    if (filter === 'medium') return rec.score >= 0.6 && rec.score < 0.8;
    return true;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-purple-600 via-indigo-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <Link
            href="/barter"
            className="text-purple-200 hover:text-white flex items-center gap-2 mb-6 transition w-fit"
          >
            → العودة لسوق المقايضة
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-xl">
                🤖
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">توصيات الذكاء الاصطناعي</h1>
                <p className="text-purple-200 text-lg max-w-2xl">
                  فرص مقايضة مخصصة لك بناءً على منتجاتك وتفضيلاتك
                </p>
              </div>
            </div>

            <button
              onClick={loadRecommendations}
              disabled={loading}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition flex items-center gap-2 self-start lg:self-auto"
            >
              <span>🔄</span>
              تحديث التوصيات
            </button>
          </div>
        </div>
      </div>

      {/* How AI Works */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
              <span>📊</span>
              <span>تحليل منتجاتك</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full">
              <span>🔍</span>
              <span>البحث في آلاف المنتجات</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              <span>🎯</span>
              <span>مطابقة ذكية</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <span>✨</span>
              <span>أفضل الفرص لك</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">فلترة:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'الكل', icon: '📋' },
                { value: 'high', label: 'تطابق عالي (+80%)', icon: '⭐' },
                { value: 'medium', label: 'تطابق متوسط (60-80%)', icon: '👍' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition whitespace-nowrap ${
                    filter === f.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-4 bg-white p-8 rounded-2xl shadow-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">الذكاء الاصطناعي يعمل...</p>
                <p className="text-gray-600">جاري تحليل أفضل الفرص لك</p>
              </div>
            </div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <span className="text-7xl block mb-4">🤖</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد توصيات حالياً</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {filter !== 'all'
                ? 'جرب تغيير الفلتر لعرض المزيد من التوصيات'
                : 'أضف المزيد من المنتجات أو حدد تفضيلاتك لنتمكن من إيجاد فرص مناسبة لك'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/barter/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
              >
                <span>➕</span>
                أضف عرض مقايضة
              </Link>
              <Link
                href="/listing/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                <span>📦</span>
                أضف منتج جديد
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              تم العثور على {filteredRecommendations.length} توصية مطابقة
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.matchId}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition border border-gray-100"
                >
                  {/* Score Header */}
                  <div className={`px-6 py-4 ${
                    rec.score >= 0.8
                      ? 'bg-gradient-to-l from-green-500 to-emerald-500'
                      : rec.score >= 0.6
                        ? 'bg-gradient-to-l from-blue-500 to-indigo-500'
                        : 'bg-gradient-to-l from-gray-500 to-gray-600'
                  } text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold">{formatMatchScore(rec.score)}</span>
                        <div>
                          <p className="font-bold">نسبة التطابق</p>
                          <p className="text-sm opacity-80">
                            {rec.score >= 0.8 ? '⭐ ممتاز' : rec.score >= 0.6 ? '👍 جيد' : '✓ مقبول'}
                          </p>
                        </div>
                      </div>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        نجاح: {Math.round(rec.successProbability * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Your Item */}
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <p className="text-xs text-orange-600 font-bold mb-1 flex items-center gap-1">
                          <span>🔄</span>
                          منتجك الذي ستعرضه
                        </p>
                        <h4 className="font-bold text-gray-900">{rec.offeredItemTitle}</h4>
                      </div>

                      <div className="flex justify-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                          ↕️
                        </div>
                      </div>

                      {/* Requested Item */}
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1">
                          <span>✨</span>
                          ما ستحصل عليه
                        </p>
                        <h4 className="font-bold text-gray-900">{rec.requestedItemTitle}</h4>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-purple-600">💡 سبب التوصية:</span> {rec.reason}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/barter/items/${rec.requestedItemId}`}
                        className="flex-1 text-center px-4 py-3 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition"
                      >
                        التفاصيل
                      </Link>
                      <Link
                        href={`/barter/respond/${rec.requestedItemId}?offer=${rec.offeredItemId}`}
                        className="flex-1 text-center px-4 py-3 bg-gradient-to-l from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition"
                      >
                        قدم عرض 🚀
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tips */}
        <div className="mt-12 bg-gradient-to-l from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            نصائح للحصول على توصيات أفضل
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <span className="text-3xl block mb-2">📷</span>
              <h4 className="font-bold text-gray-800 mb-1">صور واضحة</h4>
              <p className="text-sm text-gray-600">أضف صور عالية الجودة لمنتجاتك لجذب المزيد من الاهتمام</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-3xl block mb-2">📝</span>
              <h4 className="font-bold text-gray-800 mb-1">وصف دقيق</h4>
              <p className="text-sm text-gray-600">اكتب وصفاً تفصيلياً يشمل الحالة والمواصفات</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-3xl block mb-2">🎯</span>
              <h4 className="font-bold text-gray-800 mb-1">حدد تفضيلاتك</h4>
              <p className="text-sm text-gray-600">أخبرنا بما تبحث عنه لنجد لك أفضل الصفقات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
