'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getSavedSearches,
  deleteSavedSearch,
  executeSavedSearch,
  getAlertStats,
  toggleAlert,
  createAlert,
  SavedSearch,
  AlertStats,
} from '@/lib/api/search-alerts';

interface SearchResultItem {
  id: string;
  title: string;
  images: string[];
  estimatedValue?: number;
  condition?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  category?: {
    nameAr: string;
  };
}

function SavedSearchCard({
  search,
  onDelete,
  onExecute,
  onToggleAlert,
}: {
  search: SavedSearch;
  onDelete: () => void;
  onExecute: () => void;
  onToggleAlert: () => void;
}) {
  const filters = search.filters || {};

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-800">{search.name}</h3>
          <button
            onClick={onToggleAlert}
            className={`p-2 rounded-lg transition-all ${
              search.notifyOnNew
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-gray-100 text-gray-400'
            }`}
            title={search.notifyOnNew ? 'التنبيهات مفعلة' : 'التنبيهات متوقفة'}
          >
            {search.notifyOnNew ? '🔔' : '🔕'}
          </button>
        </div>

        {search.query && (
          <div className="mb-3">
            <span className="text-sm text-gray-500">كلمة البحث:</span>
            <span className="mr-2 font-medium text-gray-700">"{search.query}"</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.categoryId && (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
              📂 فئة محددة
            </span>
          )}
          {filters.governorate && (
            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
              📍 {filters.governorate}
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs">
              💰 {filters.minPrice || 0} - {filters.maxPrice || '∞'} ج.م
            </span>
          )}
          {filters.condition && (
            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
              ✨ {filters.condition}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          آخر استخدام:{' '}
          {search.lastUsedAt
            ? new Date(search.lastUsedAt).toLocaleDateString('ar-EG')
            : 'لم يستخدم بعد'}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onExecute}
            className="flex-1 py-2 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-teal-600 text-sm"
          >
            🔍 تشغيل البحث
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultItemCard({ item }: { item: SearchResultItem }) {
  return (
    <a
      href={`/items/${item.id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all block"
    >
      <div className="h-32 bg-gray-100 relative">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
            📦
          </div>
        )}
        {item.estimatedValue && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 rounded-lg text-sm font-bold text-emerald-600">
            {item.estimatedValue.toLocaleString('ar-EG')} ج.م
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-bold text-gray-800 truncate">{item.title}</h4>
        <p className="text-xs text-gray-500 mt-1">
          {item.category?.nameAr} • {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </p>
      </div>
    </a>
  );
}

export default function SavedSearchesPage() {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSearch, setSelectedSearch] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: '',
    query: '',
    filters: {
      governorate: '',
      minPrice: '',
      maxPrice: '',
    },
    notifyOnNew: true,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [searchesRes, statsRes] = await Promise.all([
        getSavedSearches(),
        getAlertStats(),
      ]);
      setSavedSearches(searchesRes.data?.savedSearches || []);
      setStats(statsRes.data?.stats || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البحث؟')) return;
    try {
      await deleteSavedSearch(id);
      setSavedSearches(savedSearches.filter(s => s.id !== id));
      if (selectedSearch === id) {
        setSelectedSearch(null);
        setSearchResults([]);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleExecute = async (id: string) => {
    setSelectedSearch(id);
    setResultsLoading(true);
    try {
      const response = await executeSavedSearch(id);
      setSearchResults(response.data?.items || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setResultsLoading(false);
    }
  };

  const handleToggleAlert = async (id: string) => {
    try {
      const search = savedSearches.find(s => s.id === id);
      if (!search) return;

      if (search.notifyOnNew) {
        // Disable notifications
        await toggleAlert(id);
      } else {
        // Enable notifications
        await createAlert({ savedSearchId: id });
      }

      setSavedSearches(savedSearches.map(s =>
        s.id === id ? { ...s, notifyOnNew: !s.notifyOnNew } : s
      ));
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">البحث المحفوظ</h2>
          <p className="text-gray-600 mb-4">سجل دخول لحفظ عمليات البحث</p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-l from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-blue-600 via-indigo-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🔍</span>
            البحث المحفوظ والتنبيهات
          </h1>
          <p className="text-xl text-white/90">احفظ بحثك واحصل على تنبيه عند توفر منتجات مطابقة</p>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalAlerts}</p>
                <p className="text-sm text-gray-500">إجمالي التنبيهات</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.activeAlerts}</p>
                <p className="text-sm text-gray-500">تنبيهات نشطة</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSent}</p>
                <p className="text-sm text-gray-500">إشعارات مرسلة</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.matchedItems}</p>
                <p className="text-sm text-gray-500">منتجات مطابقة</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Saved Searches List */}
          <div className="w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">عمليات البحث المحفوظة</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-600"
              >
                ➕ جديد
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : savedSearches.length > 0 ? (
              <div className="space-y-4">
                {savedSearches.map((search) => (
                  <SavedSearchCard
                    key={search.id}
                    search={search}
                    onDelete={() => handleDelete(search.id)}
                    onExecute={() => handleExecute(search.id)}
                    onToggleAlert={() => handleToggleAlert(search.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <span className="text-4xl block mb-2">📂</span>
                <p className="text-gray-500">لا توجد عمليات بحث محفوظة</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold"
                >
                  أنشئ بحثاً جديداً
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedSearch ? 'نتائج البحث' : 'اختر بحثاً لعرض النتائج'}
            </h2>

            {resultsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : selectedSearch ? (
              searchResults.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((item) => (
                    <ResultItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500">لم نجد منتجات تطابق هذا البحث حالياً</p>
                  <p className="text-sm text-indigo-600 mt-2">
                    💡 فعّل التنبيهات ليصلك إشعار عند توفر منتجات مطابقة
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <span className="text-6xl mb-4 block">👈</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">اختر بحثاً</h3>
                <p className="text-gray-500">اضغط على "تشغيل البحث" لعرض النتائج</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف تعمل التنبيهات؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'ابحث', desc: 'ابحث عن المنتجات التي تريدها' },
              { icon: '💾', title: 'احفظ', desc: 'احفظ البحث مع الفلاتر' },
              { icon: '🔔', title: 'فعّل', desc: 'فعّل التنبيهات للبحث' },
              { icon: '📱', title: 'استلم', desc: 'احصل على إشعار فوري' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">🔍 إنشاء بحث محفوظ</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">اسم البحث *</label>
                <input
                  type="text"
                  value={newSearch.name}
                  onChange={(e) => setNewSearch({ ...newSearch, name: e.target.value })}
                  placeholder="مثال: هواتف آيفون في القاهرة"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">كلمة البحث</label>
                <input
                  type="text"
                  value={newSearch.query}
                  onChange={(e) => setNewSearch({ ...newSearch, query: e.target.value })}
                  placeholder="مثال: iPhone 13"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">المحافظة</label>
                <input
                  type="text"
                  value={newSearch.filters.governorate}
                  onChange={(e) =>
                    setNewSearch({
                      ...newSearch,
                      filters: { ...newSearch.filters, governorate: e.target.value },
                    })
                  }
                  placeholder="مثال: القاهرة"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">السعر من</label>
                  <input
                    type="number"
                    value={newSearch.filters.minPrice}
                    onChange={(e) =>
                      setNewSearch({
                        ...newSearch,
                        filters: { ...newSearch.filters, minPrice: e.target.value },
                      })
                    }
                    placeholder="0"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">إلى</label>
                  <input
                    type="number"
                    value={newSearch.filters.maxPrice}
                    onChange={(e) =>
                      setNewSearch({
                        ...newSearch,
                        filters: { ...newSearch.filters, maxPrice: e.target.value },
                      })
                    }
                    placeholder="100000"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newSearch.notifyOnNew}
                  onChange={(e) => setNewSearch({ ...newSearch, notifyOnNew: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>🔔 أرسل لي إشعاراً عند توفر منتجات مطابقة</span>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={async () => {
                  if (!newSearch.name) {
                    alert('يرجى إدخال اسم البحث');
                    return;
                  }
                  try {
                    const { createSavedSearch } = await import('@/lib/api/search-alerts');
                    await createSavedSearch({
                      name: newSearch.name,
                      query: newSearch.query || undefined,
                      filters: {
                        governorate: newSearch.filters.governorate || undefined,
                        minPrice: newSearch.filters.minPrice
                          ? parseFloat(newSearch.filters.minPrice)
                          : undefined,
                        maxPrice: newSearch.filters.maxPrice
                          ? parseFloat(newSearch.filters.maxPrice)
                          : undefined,
                      },
                      notifyOnNew: newSearch.notifyOnNew,
                    });
                    setShowCreateModal(false);
                    setNewSearch({
                      name: '',
                      query: '',
                      filters: { governorate: '', minPrice: '', maxPrice: '' },
                      notifyOnNew: true,
                    });
                    fetchData();
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'حدث خطأ');
                  }
                }}
                className="flex-1 bg-gradient-to-l from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-600"
              >
                حفظ البحث
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-200 rounded-lg font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
