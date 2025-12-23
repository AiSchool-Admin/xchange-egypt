'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: 'OPEN' | 'RESTRICTED' | 'NEGOTIATED' | 'FRAMEWORK';
  status: 'DRAFT' | 'PUBLISHED' | 'EVALUATION' | 'AWARDED' | 'CANCELLED' | 'CLOSED';
  budget: number;
  currency: string;
  submissionDeadline: string;
  openingDate: string;
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  procuringEntity: {
    id: string;
    name: string;
    logo?: string;
    type: string;
    governorate?: string;
  };
  _count?: {
    bids: number;
  };
  documents?: number;
}

interface TenderFilters {
  search: string;
  category: string;
  type: string;
  status: string;
  governorate: string;
  minBudget: string;
  maxBudget: string;
}

const TENDER_TYPES: Record<string, string> = {
  OPEN: 'مناقصة عامة',
  RESTRICTED: 'مناقصة محدودة',
  NEGOTIATED: 'مناقصة بالتفاوض',
  FRAMEWORK: 'اتفاقية إطارية',
};

const TENDER_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-800' },
  PUBLISHED: { label: 'منشورة', color: 'bg-green-100 text-green-800' },
  EVALUATION: { label: 'قيد التقييم', color: 'bg-yellow-100 text-yellow-800' },
  AWARDED: { label: 'تمت الترسية', color: 'bg-purple-100 text-purple-800' },
  CANCELLED: { label: 'ملغية', color: 'bg-red-100 text-red-800' },
  CLOSED: { label: 'مغلقة', color: 'bg-gray-100 text-gray-800' },
};

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'القليوبية', 'البحيرة', 'الغربية', 'كفر الشيخ',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء',
  'جنوب سيناء', 'البحر الأحمر', 'الفيوم', 'بني سويف', 'المنيا',
  'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'مطروح', 'الوادي الجديد',
];

export default function TendersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'applied'>('all');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [myTenders, setMyTenders] = useState<Tender[]>([]);
  const [appliedTenders, setAppliedTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TenderFilters>({
    search: '',
    category: '',
    type: '',
    status: 'PUBLISHED',
    governorate: '',
    minBudget: '',
    maxBudget: '',
  });
  const [categories, setCategories] = useState<{ id: string; nameAr: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });

  useEffect(() => {
    loadCategories();
    loadData();
  }, [user, activeTab, filters, pagination.page]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories?type=TENDER');
      setCategories(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('categoryId', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.governorate) params.append('governorate', filters.governorate);
      if (filters.minBudget) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);

      // Load all tenders
      const allResponse = await apiClient.get(`/tenders?${params}`);
      const allData = allResponse.data.data || allResponse.data || {};
      setTenders(allData.items || allData.tenders || []);
      setPagination(prev => ({ ...prev, total: allData.total || 0 }));

      // Load user's tenders (as procuring entity)
      if (user) {
        const myResponse = await apiClient.get(`/tenders?procuringEntityId=${user.id}`);
        const myData = myResponse.data.data || myResponse.data || {};
        setMyTenders(myData.items || myData.tenders || []);

        // Load tenders user has applied to
        const appliedResponse = await apiClient.get(`/tenders/applied`);
        const appliedData = appliedResponse.data.data || appliedResponse.data || {};
        setAppliedTenders(appliedData.items || appliedData.tenders || []);
      }
    } catch (err: any) {
      console.error('Error loading tenders:', err);
      setError('فشل في تحميل المناقصات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      status: 'PUBLISHED',
      governorate: '',
      minBudget: '',
      maxBudget: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getRemainingTime = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} يوم${days > 10 ? '' : days > 2 ? ' أيام' : ''}`;
    return `${hours} ساعة`;
  };

  const isUrgent = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000; // Less than 3 days
  };

  const formatBudget = (budget: number, currency: string = 'EGP') => {
    if (budget >= 1000000) {
      return `${(budget / 1000000).toFixed(1)} مليون ${currency === 'EGP' ? 'ج.م' : currency}`;
    }
    if (budget >= 1000) {
      return `${(budget / 1000).toFixed(0)} ألف ${currency === 'EGP' ? 'ج.م' : currency}`;
    }
    return `${budget.toLocaleString()} ${currency === 'EGP' ? 'ج.م' : currency}`;
  };

  const getCurrentTenders = () => {
    switch (activeTab) {
      case 'my':
        return myTenders;
      case 'applied':
        return appliedTenders;
      default:
        return tenders;
    }
  };

  if (loading && tenders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المناقصات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">سوق المناقصات</h1>
              <p className="text-emerald-100 text-lg">
                اكتشف أفضل الفرص التجارية من المناقصات الحكومية والتجارية
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {tenders.length} مناقصة متاحة
                </span>
                <span>|</span>
                <span>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
            {user && (
              <Link
                href="/tenders/create"
                className="bg-white text-emerald-700 px-6 py-3 rounded-lg hover:bg-emerald-50 transition flex items-center gap-2 font-semibold shadow-lg"
              >
                <span className="text-xl">+</span>
                <span>إنشاء مناقصة جديدة</span>
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="ابحث عن مناقصة بالاسم أو رقم المرجع..."
                  className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 text-lg"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  بحث
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                فلترة
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع المناقصة</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">جميع الأنواع</option>
                  {Object.entries(TENDER_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">جميع الحالات</option>
                  {Object.entries(TENDER_STATUS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                <select
                  value={filters.governorate}
                  onChange={(e) => setFilters(prev => ({ ...prev, governorate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">جميع المحافظات</option>
                  {GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية من</label>
                <input
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية إلى</label>
                <input
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                  placeholder="بدون حد"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-medium transition border-b-2 ${
                activeTab === 'all'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              جميع المناقصات
              <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                {tenders.length}
              </span>
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-6 py-4 font-medium transition border-b-2 ${
                    activeTab === 'my'
                      ? 'text-emerald-600 border-emerald-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  مناقصاتي
                  <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {myTenders.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('applied')}
                  className={`px-6 py-4 font-medium transition border-b-2 ${
                    activeTab === 'applied'
                      ? 'text-emerald-600 border-emerald-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  عطاءاتي
                  <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {appliedTenders.length}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        {getCurrentTenders().length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'all' && 'لا توجد مناقصات متاحة'}
              {activeTab === 'my' && 'لم تقم بإنشاء أي مناقصات بعد'}
              {activeTab === 'applied' && 'لم تتقدم لأي مناقصة بعد'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' && 'جرب تغيير معايير البحث أو تحقق لاحقاً'}
              {activeTab === 'my' && 'أنشئ مناقصة جديدة لتبدأ استقبال العطاءات'}
              {activeTab === 'applied' && 'تصفح المناقصات المتاحة وقدم عطاءك'}
            </p>
            {user && activeTab === 'my' && (
              <Link
                href="/tenders/create"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                إنشاء مناقصة جديدة
              </Link>
            )}
            {activeTab === 'applied' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                تصفح المناقصات
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getCurrentTenders().map((tender) => (
              <Link
                key={tender.id}
                href={`/tenders/${tender.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition group overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${TENDER_STATUS[tender.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {TENDER_STATUS[tender.status]?.label || tender.status}
                        </span>
                        {isUrgent(tender.submissionDeadline) && tender.status === 'PUBLISHED' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium animate-pulse">
                            عاجل
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition line-clamp-2">
                        {tender.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-1">
                    رقم المرجع: {tender.referenceNumber}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {tender.description}
                  </p>

                  {/* Procuring Entity */}
                  <div className="flex items-center gap-2 py-2 border-t border-b">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {tender.procuringEntity?.logo ? (
                        <img src={tender.procuringEntity.logo} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm">🏛️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tender.procuringEntity?.name || 'جهة غير محددة'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tender.procuringEntity?.governorate || 'مصر'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-500">الميزانية</p>
                      <p className="font-bold text-emerald-600">
                        {formatBudget(tender.budget, tender.currency)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-500">الموعد النهائي</p>
                      <p className={`font-medium ${isUrgent(tender.submissionDeadline) ? 'text-red-600' : 'text-gray-900'}`}>
                        {getRemainingTime(tender.submissionDeadline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {tender._count?.bids || 0} عطاء
                    </span>
                    <span>{TENDER_TYPES[tender.type] || tender.type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              السابق
            </button>
            <span className="px-4 py-2">
              صفحة {pagination.page} من {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-emerald-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-emerald-400">50+</p>
              <p className="text-emerald-200">مليار جنيه سنوياً</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400">100,000+</p>
              <p className="text-emerald-200">مورد مسجل</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400">25%</p>
              <p className="text-emerald-200">نمو سنوي</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400">99.9%</p>
              <p className="text-emerald-200">نسبة التوفر</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
